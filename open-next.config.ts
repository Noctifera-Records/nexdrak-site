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
  // Ensure middleware is handled correctly
  middleware: {
    external: true,
    // Ensure middleware is compatible with Edge Runtime
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
    },
  },
});