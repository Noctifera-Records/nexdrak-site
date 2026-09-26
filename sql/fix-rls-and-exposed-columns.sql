-- ============================================================================
-- NexDrak - Supabase security hardening (run ONCE)
--
-- The database is SHARED by "Main" (nex-website) and "Admin"
-- (admin-nexdrak-site), so this migration must be applied only once.
--
-- Fixes these critical Supabase linter findings:
--   * RLS Disabled in Public ........ public."user", public.session,
--                                     public.account, public.verification
--   * Sensitive Columns Exposed ..... public.account  (password, access_token,
--                                     refresh_token, id_token, scope)
--                                     public.session  (token, ip_address,
--                                     user_agent, impersonated_by)
--
-- WHY IT IS SAFE FOR BOTH APPS
--   Both apps talk to Postgres with the DATABASE_URL connection string, i.e.
--   as the `postgres` role, which OWNS these tables. Table owners are NOT
--   subject to RLS, so this script cannot affect Better Auth / Drizzle.
--   It only removes the access that the PostgREST API roles (`anon`,
--   `authenticated`) currently have on these internal auth tables.
--
-- WHAT IS DELIBERATELY NOT TOUCHED
--   * No policy is created here => "deny by default" for anon/authenticated.
--   * Content tables (songs, streaming_links, site_settings, events, merch,
--     releases, downloads, page_sections, hero_content, profiles) keep their
--     current GRANTs and public-read policies, because nex-website reads them
--     from the browser with the anon key.
--   * No table / column / trigger / function (auto-slug included) is modified.
--   * `service_role` keeps its privileges (used by
--     nex-website/lib/supabase/service.ts).
-- ============================================================================

BEGIN;

-- 1) Enable RLS. With zero policies this means: anon/authenticated read and
--    write nothing, while the `postgres` owner keeps full access.
ALTER TABLE public."user"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification ENABLE ROW LEVEL SECURITY;

-- 2) Drop the PostgREST grants on the internal auth tables.
--    This is what removes the "Sensitive Columns Exposed" findings.
REVOKE ALL ON TABLE public."user"       FROM anon, authenticated;
REVOKE ALL ON TABLE public.session      FROM anon, authenticated;
REVOKE ALL ON TABLE public.account      FROM anon, authenticated;
REVOKE ALL ON TABLE public.verification FROM anon, authenticated;

-- 3) Same hygiene for the other auth-internal tables. They already have RLS
--    enabled (with a deny-all policy), but `anon`/`authenticated` still held
--    table privileges on them.
REVOKE ALL ON TABLE public."twoFactor" FROM anon, authenticated;
REVOKE ALL ON TABLE public.auth_logs   FROM anon, authenticated;

-- 4) Belt and braces: make sure no permissive policy can ever appear on these
--    tables without a conscious decision. Any pre-existing policy is dropped.
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('user', 'session', 'account', 'verification')
    LOOP
        EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 5) Safety net: abort (and roll back everything above) if the service_role
--    used by nex-website/lib/supabase/service.ts ever lost its access.
DO $$
BEGIN
    IF NOT has_table_privilege('service_role', 'public."user"', 'SELECT') THEN
        RAISE EXCEPTION 'Aborting: service_role lost SELECT on public."user"';
    END IF;
    IF NOT has_table_privilege('service_role', 'public.session', 'SELECT') THEN
        RAISE EXCEPTION 'Aborting: service_role lost SELECT on public.session';
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- Verification (optional, read-only):
--
--   SELECT c.relname, c.relrowsecurity AS rls
--   FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname = 'public' AND c.relkind = 'r'
--     AND c.relname IN ('user','session','account','verification');
--
--   SELECT table_name, grantee, privilege_type
--   FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND grantee IN ('anon','authenticated')
--     AND table_name IN ('user','session','account','verification',
--                        'twoFactor','auth_logs');
--   -- expected result: 0 rows
-- ============================================================================
