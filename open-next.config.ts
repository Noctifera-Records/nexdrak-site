import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  build: {
    minify: true,
    // Externalize EVERYTHING that Cloudflare provides via nodejs_compat or is not needed.
    external: [
      "async_hooks", "buffer", "crypto", "events", "fs", "http", "https", 
      "os", "path", "stream", "util", "vm", "url", "zlib", "string_decoder", 
      "tls", "net",
      // Database drivers - MUST be externalized
      "pg", "pg-native", "pg-pool", "pg-protocol", "pg-types",
      "better-sqlite3", "mysql2", "oracledb", "tedious", "sqlite3", "@vscode/sqlite3",
      "@neondatabase/serverless",
      // Legacy Supabase - AGENTS.md says these are dead code
      "@supabase/auth-helpers-nextjs", "@supabase/auth-ui-react", "@supabase/auth-ui-shared",
      // Other
      "@vercel/node", "@vercel/remix-builder", "undici"
    ],
  },
  experimental: {
    splitting: true,
  },
});
