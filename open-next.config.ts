import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  build: {
    minify: true,
    // Externalize everything provided by nodejs_compat or not needed
    external: [
      "async_hooks", "buffer", "crypto", "events", "fs", "http", "https", 
      "os", "path", "stream", "util", "vm", "url", "zlib", "string_decoder", 
      "tls", "net",
      "pg-native", "better-sqlite3", "mysql2", "oracledb", "tedious", 
      "sqlite3", "@vscode/sqlite3", "pg", "pg-pool", "pg-protocol", "pg-types",
      "@supabase/auth-helpers-nextjs", "@supabase/auth-ui-react", "@supabase/auth-ui-shared",
      "@vercel/node", "@vercel/remix-builder", "undici"
    ],
  },
  experimental: {
    splitting: true,
  },
});
