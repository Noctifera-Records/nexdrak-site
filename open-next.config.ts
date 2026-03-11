import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const cloudflareConfig = defineCloudflareConfig();

export default {
  ...cloudflareConfig,
  build: {
    minify: true,
    // Externalize EVERYTHING that Cloudflare provides via nodejs_compat or is not needed.
    external: [
      "async_hooks", "buffer", "crypto", "events", "fs", "http", "https", 
      "os", "path", "stream", "util", "vm", "url", "zlib", "string_decoder", 
      "tls", "net",
      // Database drivers - MUST be externalized to avoid bloating bundle size
      "pg", "pg-native", "pg-pool", "pg-protocol", "pg-types",
      "better-sqlite3", "mysql2", "oracledb", "tedious", "sqlite3", "@vscode/sqlite3",
      "kysely", // BetterAuth uses Drizzle, kysely isn't needed but pulled by adapter
      // Legacy Supabase - AGENTS.md says these are dead code
      "@supabase/auth-helpers-nextjs", "@supabase/auth-ui-react", "@supabase/auth-ui-shared",
      // Next.js Dev/Vercel heavy internals that bloat CF workers
      "@vercel/node", "@vercel/remix-builder", "@vercel/og", "esbuild", "swc"
    ],
  },
} as any;
