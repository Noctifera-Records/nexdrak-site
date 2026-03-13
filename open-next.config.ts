import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare Configuration
 * AGGRESSIVE OPTIMIZATION for 3MB Limit
 */
export default defineCloudflareConfig({
  minify: true,
  external: [
    // Database drivers (Hidden via eval('require') in lib/db.ts)
    "pg",
    "pg-native",
    "pg-pool",
    "pg-protocol",
    "pg-types",
    "pg-cloudflare",
    "pgpass",
    "drizzle-orm/node-postgres",
    "better-sqlite3",
    "mysql2",
    "oracledb",
    "tedious",
    "sqlite3",
    "kysely",
    
    // Heavy libraries that should be in client chunks or are redundant at the edge
    "lucide-react",
    "next-seo",
    "resend",
    "recharts",
    "react-qr-code",
    "@radix-ui/react-dropdown-menu",
    
    // Node.js built-ins provided by nodejs_compat
    "async_hooks",
    "events",
    "fs",
    "path",
    "os",
    "crypto",
    "buffer",
    "util",
    "stream",
    "v8"
  ],
});
