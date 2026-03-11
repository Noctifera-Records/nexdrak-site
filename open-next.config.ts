import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  build: {
    minify: true,
    // Externalize EVERYTHING that Cloudflare provides via nodejs_compat.
    // This reduces the bundle size significantly because the code isn't copied.
    external: [
      // Node.js built-ins (Cloudflare handles these with nodejs_compat)
      "async_hooks",
      "buffer",
      "crypto",
      "events",
      "fs",
      "http",
      "https",
      "os",
      "path",
      "stream",
      "util",
      "vm",
      "url",
      "zlib",
      "string_decoder",
      "tls",
      "net",
      // Native / OS-level DB drivers (Never work in Workers)
      "pg-native",
      "better-sqlite3",
      "mysql2",
      "oracledb",
      "tedious",
      "sqlite3",
      "@vscode/sqlite3",
      // pg: project uses Neon HTTP driver, pg is NOT called at runtime
      "pg",
      "pg-pool",
      "pg-protocol",
      "pg-types",
      // Vercel-specific packages
      "@vercel/node",
      "@vercel/remix-builder",
      // undici: Cloudflare Workers has native fetch
      "undici",
    ],
  },
  // Disable splitting as it causes resolution errors in Wrangler Pages
  experimental: {
    splitting: false,
  },
});
