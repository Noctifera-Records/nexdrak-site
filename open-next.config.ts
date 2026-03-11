import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  build: {
    minify: true,
    // Externalize packages to reduce bundle size
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
      "@supabase/auth-helpers-nextjs",
      "@supabase/auth-ui-react",
      "@supabase/auth-ui-shared",
      "@vercel/node",
      "@vercel/remix-builder",
      "undici",
    ],
  },
  experimental: {
    splitting: true,
  },
});
