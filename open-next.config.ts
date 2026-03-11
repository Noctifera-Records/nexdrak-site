import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  build: {
    minify: true, // Required to stay under Cloudflare free plan 3 MiB worker limit
    // Exclude packages that are not needed / problematic in Cloudflare Workers.
    // The project uses @neondatabase/serverless (Neon HTTP) for DB — not pg.
    // Externalizing pg and other unused heavy packages reduces bundle size significantly.
    external: [
      // Native / OS-level drivers — never work in Workers
      "pg-native",
      "better-sqlite3",
      "mysql2",
      "oracledb",
      "tedious",
      "sqlite3",
      "@vscode/sqlite3",
      // pg: project uses Neon HTTP driver, pg is NOT called at runtime in the Worker
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
      // Dev tools / analysis — never bundled but just in case
      "lighthouse",
    ],
  },
  // Ensure middleware is handled correctly
  middleware: {
    external: true,
    // Ensure middleware is compatible with Edge Runtime
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
    },
  },
} as any);
