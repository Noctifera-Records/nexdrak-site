import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare Configuration
 * Ref: https://opennext.js.org/cloudflare/get-started
 */
export default defineCloudflareConfig({
  minify: true,
  // Ensure we externalize database drivers to avoid bundling issues
  external: [
    "pg-cloudflare",
    "pgpass",
    "pg",
    "pg-native",
    "pg-pool",
    "pg-protocol",
    "pg-types",
    "better-sqlite3",
    "mysql2",
    "oracledb",
    "tedious",
    "sqlite3",
    "@vscode/sqlite3",
    "kysely",
    "async_hooks"
  ],
  // Extra esbuild options if needed
  build: {
    minify: true,
    external: [
      "pg-cloudflare",
      "pgpass",
      "pg",
      "pg-native",
      "pg-pool",
      "pg-protocol",
      "pg-types"
    ]
  }
} as any);
