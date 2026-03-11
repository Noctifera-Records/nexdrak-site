import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  build: {
    minify: true,
    // Exclude packages that are problematic in Workers
    external: [
      "pg-native", 
      "better-sqlite3", 
      "mysql2", 
      "oracledb", 
      "tedious", 
      "sqlite3",
      "@vscode/sqlite3"
    ],
  },
});