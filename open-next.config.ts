import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare Configuration
 */
export default defineCloudflareConfig({
  minify: true,
  // Externalize heavy libraries to keep the bundle under 3MB
  external: [
    "pg",
    "pg-native",
    "pg-pool",
    "pg-protocol",
    "pg-types",
    "pg-cloudflare",
    "pgpass",
    "drizzle-orm/node-postgres",
    "better-sqlite3",
    "mysql2",
    "oracledb",
    "tedious",
    "sqlite3",
    "kysely",
    "recharts",
    "undici",
    "@supabase/supabase-js",
    "better-auth",
    "zod",
    "lucide-react",
    "resend"
  ],
});
