import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare Configuration
 * AGGRESSIVE OPTIMIZATION for 3MB Limit
 */
export default defineCloudflareConfig({
  minify: false,
  external: [
    // Heavy libraries that should be in client chunks or are redundant at the edge
    "lucide-react",
    "@radix-ui/react-dropdown-menu",
    
    // PRISMA: Explicitly exclude huge Prisma related packages if pulled by Better Auth
    "prisma",
    "@prisma/client",
    "@better-auth/prisma-adapter",
    "@mrleebo/prisma-ast",
    "@electric-sql/pglite",
    "@electric-sql/pglite-socket",
    "@electric-sql/pglite-tools",
    
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
    "v8",
    "node:sqlite",
    "node:worker_threads"
  ],
});
