import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  build: {
    minify: true,
    // Externalize packages not needed in the Cloudflare Worker runtime.
    // The project uses @neondatabase/serverless (Neon HTTP) for DB — NOT pg.
    // Externalizing these reduces the compressed Worker size significantly.
    external: [
      // Native / OS-level DB drivers — never work in Workers
      "pg-native",
      "better-sqlite3",
      "mysql2",
      "oracledb",
      "tedious",
      "sqlite3",
      "@vscode/sqlite3",
      // pg: project uses Neon HTTP driver, pg is NOT called at runtime
      "pg",
      "pg-pool",
      "pg-protocol",
      "pg-types",
      // Legacy / unused Supabase auth packages (dead code per AGENTS.md)
      "@supabase/auth-helpers-nextjs",
      "@supabase/auth-ui-react",
      "@supabase/auth-ui-shared",
      // Vercel-specific packages — not needed on Cloudflare
      "@vercel/node",
      "@vercel/remix-builder",
      // undici: Cloudflare Workers has native fetch/HTTP via nodejs_compat
      "undici",
    ],
  },
  experimental: {
    splitting: true,
  },
});
