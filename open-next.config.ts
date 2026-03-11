import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  build: {
    minify: true,
    // We externalize only the strictly necessary to avoid the 3MB limit
    // but without breaking the internal resolution.
    external: [
      "pg-native",
      "better-sqlite3",
      "mysql2",
      "oracledb",
      "tedious",
      "sqlite3",
      "@vscode/sqlite3",
      "pg",
      "pg-pool",
      "pg-protocol",
      "pg-types",
      "undici"
    ],
  },
});
