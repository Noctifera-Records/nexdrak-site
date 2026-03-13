import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare Configuration
 * Standardized for @opennextjs/cloudflare
 */
export default defineCloudflareConfig({
  minify: true,
  external: [
    "pg",
    "pg-native",
    "pg-pool",
    "pg-protocol",
    "pg-types",
    "pg-cloudflare",
    "pgpass",
    "better-sqlite3",
    "mysql2",
    "oracledb",
    "tedious",
    "sqlite3",
    "@vscode/sqlite3",
    "kysely",
    "async_hooks"
  ],
});
