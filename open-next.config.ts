import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare Configuration
 */
export default defineCloudflareConfig({
  minify: true,
  // We specify only what's absolutely necessary as external.
  // The eval('require') in lib/db.ts should prevent everything else from being found.
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
    "kysely"
  ],
});
