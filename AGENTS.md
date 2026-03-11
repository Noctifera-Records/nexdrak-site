# AGENTS.md

> **Context for AI Agents**: This file provides project-specific instructions, conventions, and architectural details to help you navigate and modify the NexDrak website codebase effectively.

## Project Overview
NexDrak is the official artist website for an electronic music producer. It features a public-facing site for fans (music releases, events, merchandise) and a protected admin panel for content management.

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS, Shadcn UI, Lucide React icons
- **Theming**: `next-themes` (Dark/Light mode support)
- **Auth**: **Better Auth** (with Drizzle ORM adapter, Admin plugin, 2FA plugin)
- **Database**: **Supabase** PostgreSQL via HTTP (Drizzle ORM + Neon HTTP driver)
- **Email**: **Resend** (Transactional emails)
- **Deployment**: **Cloudflare Pages** (OpenNext `@opennextjs/cloudflare`) - Edge compatible

## Setup & Commands

### Development
- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Type check**: `npx tsc --noEmit`

### Database & Auth
- **Generate Better Auth schema**: `npm run auth:generate`
- **Generate migrations**: `npm run db:generate`
- **Apply migrations**: `npm run db:migrate`
- **Open Drizzle Studio**: `npm run db:studio` (Visual DB editor)

### Cloudflare Deployment
- **Build for Cloudflare**: `npm run build:cf`
- **Build + prepare assets**: `npm run build:ci`
- **Deploy to Cloudflare**: `npm run deploy:cf`
- **Test locally with Wrangler**: `npm run dev:cf`

## Architecture & Directory Structure

### Application Routes
- **`app/`**: Next.js App Router pages
  - **`app/admin/`**: Protected admin routes (middleware + role checks)
    - `app/admin/music/` - Song CRUD + streaming links
    - `app/admin/events/` - Event CRUD
    - `app/admin/merch/` - Merchandise CRUD
    - `app/admin/downloads/` - Downloads CRUD
    - `app/admin/releases/` - Releases CRUD
    - `app/admin/users/` - User management (Better Auth `user` table)
    - `app/admin/admins/` - Admin user management (Better Auth Admin API)
    - `app/admin/settings/` - Site settings CRUD
    - `app/admin/songs/` - Songs management (legacy, uses Supabase server client)
    - `app/admin/account/` - Admin account & MFA settings
  - **`app/music/`**, **`app/events/`**, **`app/merch/`**, **`app/downloads/`**: Public-facing pages
  - **`app/api/auth/`**: Better Auth API routes
  - **`app/account/`**: User account management
  - **`app/[song]/`**: Dynamic song detail pages

### Components
- **`components/ui/`**: Shadcn UI primitive components
- **`components/auth/`**: Auth forms (`login-form.tsx`, `register-form.tsx`)
- **`components/admin/`**: Admin shell (`admin-shell.tsx`)

### Core Libraries
- **`lib/auth.ts`**: Better Auth server configuration (Drizzle adapter, Resend emails, Google OAuth, admin + 2FA plugins)
- **`lib/auth-client.ts`**: Better Auth client configuration (adminClient + twoFactorClient plugins)
- **`lib/db.ts`**: Database module with two exports:
  - `getDb()` - Returns Drizzle ORM instance (used by Better Auth internally)
  - `db.query(sql, params)` - Raw SQL wrapper using Neon HTTP `sql.query()` with parameterized queries (used by admin server actions)
- **`lib/db/schema.ts`**: Combined Drizzle schema (re-exports from `auth.schema.ts`)
- **`lib/db/auth.schema.ts`**: Better Auth schema placeholder (must run `npm run auth:generate` to populate)
- **`lib/site-settings.ts`**: Server-side site configuration fetched via Supabase service client (LCP optimization)
- **`lib/supabase/service.ts`**: Supabase service role client (bypasses RLS, used by public server actions)
- **`lib/supabase/client.ts`**: Supabase browser client via `@supabase/ssr` (used by client components)
- **`lib/supabase/server.ts`**: Supabase server client with cookie handling (limited use)
- **`lib/utils.ts`**: Utility functions (`cn`, etc.)

### Dead Code (not imported anywhere)
- `lib/supabase/client-optimized.ts` - Singleton browser client, unused
- `lib/supabase/songs-operations.ts` - SongsService class, unused
- `lib/supabase/admin-operations.ts` - AdminService class, unused

### Configuration Files
- **`drizzle.config.ts`**: Drizzle Kit configuration
- **`better-auth.config.ts`**: Better Auth CLI configuration
- **`next.config.mjs`**: Next.js configuration (optimized for Cloudflare)
- **`open-next.config.ts`**: OpenNext Cloudflare adapter configuration
- **`wrangler.toml`**: Cloudflare Workers/Pages configuration
- **`middleware.ts`**: Route protection middleware (checks Better Auth session cookie)

## Coding Conventions

### 1. TypeScript
- Always define interfaces/types for data structures
- Use `zod` for schema validation in Server Actions
- Strict mode enabled

### 2. Database Access

**Two Approaches Depending on Context:**

#### A. Admin Routes (Use `db.query` with raw SQL via Neon HTTP)
```typescript
import { db } from "@/lib/db";

// Parameterized queries using neon's .query() method
const { rows } = await db.query(`
  SELECT * FROM songs
  WHERE id = $1
`, [songId]);
```

**How `db.query` works internally:**
- Creates a `neon()` connection with `fullResults: true`
- Calls `sql.query(sqlText, params)` which properly handles `$1, $2...` placeholders
- Returns `{ rows: any[] }`
- Throws errors on failure (does not swallow them)

#### B. Public Routes (Use Supabase HTTP client with service role)
```typescript
import { createServiceRoleClient } from "@/lib/supabase/service";

const supabase = createServiceRoleClient();
const { data, error } = await supabase
  .from("songs")
  .select("*")
  .eq("id", songId);
```

**Why Two Approaches?**
- Admin routes use `db.query` (raw SQL power, same Neon HTTP driver that Better Auth uses)
- Public routes use Supabase HTTP client (query builder API, bypasses RLS with service role key)
- Both are HTTP-based and Cloudflare Workers compatible

#### C. Admin User Management (Use Better Auth Admin API)
```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// List users
const result = await auth.api.listUsers({
  query: { filterField: "role", filterValue: "admin", filterOperator: "eq" },
  headers: await headers(),
});

// Create user
const newUser = await auth.api.createUser({
  body: { email, password, name, role: "admin" },
});

// Delete user
await auth.api.removeUser({
  body: { userId },
  headers: await headers(),
});

// Set role
await auth.api.setRole({
  body: { userId, role: "admin" },
  headers: await headers(),
});
```

**Column Naming Conventions:**
- Better Auth tables (`user`, `session`, `account`): **camelCase** (e.g., `createdAt`, `emailVerified`)
- Custom tables (`songs`, `events`, `merch`): **snake_case** (e.g., `created_at`, `release_date`)

**Security:**
- Always use parameterized queries (`$1`, `$2`) to prevent SQL injection
- Never expose raw SQL queries to client

### 3. Authentication & Security

**Server Actions for Admin Operations:**
- NEVER perform CUD (Create/Update/Delete) from client components
- Always route through Server Actions with role checks:

```typescript
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user || session.user.role !== 'admin') {
  throw new Error("Unauthorized");
}
```

**RLS Policies:**
- Row Level Security enabled on sensitive tables (`user`, `session`, etc.)
- Public routes bypass RLS via `SUPABASE_SERVICE_ROLE_KEY`

**Auth Usage:**
- Server Components/Actions: `auth.api.getSession`
- Client Components: `authClient.useSession`
- Logout: Use `window.location.href = "/login"` (clears Next.js client cache)
- Admin user CRUD: Use `auth.api.createUser`, `auth.api.listUsers`, `auth.api.removeUser`, `auth.api.setRole`

**Route Protection:**
- Middleware checks for `better-auth.session_token` cookie on `/admin/*` and `/account/*`
- Redirects unauthenticated users to `/login` with `callbackUrl`
- Additional role checks in Server Actions

### 4. Styling
- Use Tailwind utility classes
- Semantic colors for theme compatibility: `bg-background`, `text-foreground`
- Mobile navbar: `backdrop-blur-md` and `bg-background/80`

### 5. Performance (Core Web Vitals)

**LCP Optimization:**
- Use `lib/site-settings.ts` to fetch critical data server-side
- Avoid client-side `useEffect` for "Above the Fold" content
- Use `next/image` with `priority` for Hero/LCP images
- Home page (`app/page.tsx`) uses `force-static` + `next/dynamic` for below-the-fold code splitting

**Images:**
- `unoptimized: false` in `next.config.mjs` (optimization enabled)
- Remote patterns configured for Supabase and external sources

### 6. User Feedback
- Use `sonner` (`toast`) for notifications (success/error)

### 7. Security Best Practices
- Image uploads: Limit size (2MB-5MB), validate MIME types
- Passwords: Enforce strength checks (length, numbers, symbols)
- Email verification required for new accounts

## Database Schema (Key Tables)

### Better Auth Tables (Auto-generated)
*Managed by Better Auth CLI - regenerate with `npm run auth:generate`*

- **`user`**: Core user table (`id`, `name`, `email`, `emailVerified`, `image`, `role`, `banned`, `banReason`, `banExpires`, `twoFactorEnabled`, `createdAt`, `updatedAt`)
- **`session`**: Active sessions (`impersonatedBy` field added by admin plugin)
- **`account`**: Linked social accounts (Google, etc.)
- **`verification`**: Email/Password reset tokens
- **`twoFactor`**: 2FA secrets and backup codes

### Custom Tables
*Exist directly in Supabase PostgreSQL (not all tracked by Drizzle migrations)*

- **`songs`**: Music releases (`id`, `title`, `artist`, `stream_url`, `cover_image_url`, `release_date`, `type`, `slug`, `album_name`, `created_at`)
  - **Note**: Does NOT contain `track_number`. Order album songs by `title` or `created_at`
- **`streaming_links`**: Links to Spotify, Apple Music, etc. (`id`, `song_id`, `platform`, `url`, `is_primary`)
- **`events`**: Upcoming shows (`id`, `title`, `date`, `venue`, `location`, `ticket_url`, `is_published`, `created_at`)
- **`merch`**: Merchandise items (`id`, `name`, `description`, `price`, `image_url`, `purchase_url`, `is_available`, `created_at`)
- **`downloads`**: Downloadable content (`id`, `title`, `description`, `file_url`, `download_count`, `is_featured`, `created_at`)
- **`releases`**: Release groupings (`id`, `title`, `release_date`, etc.) - queried via raw SQL in `app/admin/releases/actions.ts`
- **`site_settings`**: Global site configuration (`key`, `value`)

### RPC Functions
- **`increment_download_count(download_id INTEGER)`**: Atomically increments download count

## Common Tasks

### Creating a Server Action (Admin)

```typescript
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// 1. Define zod schema
const schema = z.object({
  title: z.string().min(1),
  artist: z.string().min(1),
});

// 2. Server action
export async function createSong(data: unknown) {
  // 3. Check auth & permissions
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error("Unauthorized");
  }

  // 4. Validate input
  const validated = schema.parse(data);

  // 5. Perform DB operation (parameterized)
  const { rows } = await db.query(`
    INSERT INTO songs (title, artist, created_at)
    VALUES ($1, $2, NOW())
    RETURNING *
  `, [validated.title, validated.artist]);

  // 6. Revalidate UI
  revalidatePath("/admin/music");
  revalidatePath("/music");

  return rows[0];
}
```

### Creating a Server Action (Public)

```typescript
"use server";

import { createServiceRoleClient } from "@/lib/supabase/service";

export async function getPublicSongs() {
  const supabase = createServiceRoleClient();

  const { data: songs, error } = await supabase
    .from("songs")
    .select("*")
    .order("release_date", { ascending: false });

  if (error) {
    console.error("Error fetching songs:", error);
    return { songs: [] };
  }

  return { songs: songs || [] };
}
```

### Modifying Better Auth Schema

```bash
# 1. Edit lib/auth.ts (add/remove plugins)
# 2. Regenerate schema
npm run auth:generate

# 3. Generate migration
npm run db:generate

# 4. Apply to database
npm run db:migrate
```

### Handling Images
- Admin forms use `AdminImageUpload` component with `maxSizeMB` prop
- Store URLs in database (not files)
- Images hosted on Supabase Storage or external CDN

### MFA (Two-Factor Authentication)
- Managed via Better Auth `twoFactor` plugin
- UI in `app/admin/account/page.tsx` using `react-qr-code`
- QR Code is static (TOTP Secret); authenticator app generates dynamic codes
- Backup codes displayed once on setup; allow login via `verifyBackupCode`

## Environment Variables

### Required for Development (`.env.local`)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # Service role key (NOT anon). Found in Supabase Dashboard > Settings > API

# Database (Postgres connection string via Neon HTTP)
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# Better Auth
BETTER_AUTH_SECRET=xxx  # Generate: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000

# Email
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@nexdrak.com

# OAuth (optional)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

### Required for Cloudflare Pages (Production)
All of the above, configured in Cloudflare Dashboard (not in code). Change `BETTER_AUTH_URL` to your production domain (`https://...`).

### Common `.env` Mistakes
- **`SUPABASE_SERVICE_ROLE_KEY` as placeholder**: Must be the real `service_role` JWT from Supabase, not `YOUR_SERVICE_ROLE_KEY_HERE`. Causes `"Invalid API key"` errors on all public routes.
- **`.env.local` overrides `.env`**: Next.js loads `.env.local` with higher priority. If both exist, ensure `.env.local` has correct values.

## Cloudflare Pages Deployment

### Why Cloudflare-Compatible?
- Uses **Neon HTTP driver** (`@neondatabase/serverless`) -- no TCP connections
- `db.query()` uses `neon().query()` internally -- pure HTTP
- Better Auth uses Drizzle adapter over the same Neon HTTP connection
- `nodejs_compat` flag enabled in `wrangler.toml`
- Native DB drivers externalized in `open-next.config.ts` (`pg-native`, `sqlite3`, etc.)
- Middleware runs on edge via `cloudflare-edge` wrapper
- No cold starts, global edge deployment

### Key Files for Deployment
- **`open-next.config.ts`**: OpenNext Cloudflare adapter config (externals, middleware settings)
- **`wrangler.toml`**: Cloudflare Workers config (`nodejs_compat`, build output dir)
- **`scripts/prepare-cf-assets.js`**: Post-build script that structures output for Cloudflare Pages
- **`_headers`**: Cloudflare-specific HTTP headers (security, caching)
- **`.open-next/assets/`**: Final build output directory

### Deployment Pipeline
```
npm run deploy:cf
  --> rimraf .open-next
  --> opennextjs-cloudflare build
  --> node scripts/prepare-cf-assets.js (copies worker, assets, generates _routes.json)
  --> wrangler pages deploy .open-next/assets --project-name nex-website
```

## Known Issues / Gotchas

### Logout State
- Next.js client cache can persist session data
- Always use `window.location.href = "/login"` for logout (not `router.push`)
- Forces hard reload to clear cache

### QR Code Rendering (2FA)
- Requires specific container sizing
- Use `react-qr-code` with white background wrapper for dark mode visibility

### Middleware
- Matches `/admin` and `/account` routes only
- Checks for `better-auth.session_token` or `__Secure-better-auth.session_token` cookie
- Graceful error handling -- on failure, request proceeds

### Auth Schema Placeholder
- `lib/db/auth.schema.ts` is still a placeholder
- Run `npm run auth:generate` to generate the actual Better Auth table definitions
- Then run `npm run db:generate` and `npm run db:migrate`

### Tables Not in Drizzle Migrations
- Some tables (`releases`, `site_settings`, etc.) exist directly in Supabase but are not tracked by Drizzle migrations
- They are queried via raw SQL in server actions

### Accessibility
- All form inputs must have associated `<label>` tags
- Match `htmlFor` and `id` attributes
- Use semantic HTML

### Email Configuration
- Uses `EMAIL_FROM` env var
- Defaults to `noreply@nexdrak.com`
- Requires valid Resend API key

## Troubleshooting

### "Invalid API key" on Public Routes
- `SUPABASE_SERVICE_ROLE_KEY` is missing or is a placeholder in `.env.local`
- Must be the real `service_role` JWT from Supabase Dashboard > Settings > API
- `.env.local` takes priority over `.env`

### "Auth unavailable" Error
- Check `DATABASE_URL` is correct
- Verify migrations applied: `npm run db:migrate`
- Check Better Auth schema generated: `npm run auth:generate`

### Build Fails on Cloudflare
- Verify ALL environment variables configured in Cloudflare Dashboard
- `DATABASE_URL` must be complete Postgres connection string
- `BETTER_AUTH_URL` must be production domain (`https://...`)

### Admin Queries Return Empty Data
- Verify `db.query()` is passing parameters correctly (check `lib/db.ts`)
- The Neon HTTP driver's `.query(sqlText, params)` method handles `$1, $2...` placeholders
- Check database connection string in `DATABASE_URL`

## Quick Reference

### Most Used Commands
```bash
npm run dev              # Start development
npm run auth:generate    # Regenerate auth schema
npm run db:studio        # Open DB GUI
npm run build:ci         # Build for Cloudflare
npm run deploy:cf        # Deploy to Cloudflare
```

### File Locations
- Auth config: `lib/auth.ts`
- Auth client: `lib/auth-client.ts`
- DB module: `lib/db.ts`
- Schema: `lib/db/schema.ts`
- Migrations: `drizzle/`
- Supabase clients: `lib/supabase/` (`service.ts`, `client.ts`, `server.ts`)
- Admin actions: `app/admin/*/actions.ts` (use `db.query` + Better Auth API)
- Public actions: `app/*/actions.ts` (use Supabase service client)
- Cloudflare config: `open-next.config.ts`, `wrangler.toml`
- Build script: `scripts/prepare-cf-assets.js`
