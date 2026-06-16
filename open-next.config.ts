import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare Configuration
 */
export default defineCloudflareConfig({
  minify: true,
  external: [
    "prisma",
    "@prisma/client",
    "@better-auth/prisma-adapter",
    "@mrleebo/prisma-ast",
    "@electric-sql/pglite",
    "@electric-sql/pglite-socket",
    "@electric-sql/pglite-tools",
    "lucide-react",
    "@radix-ui/react-dropdown-menu"
  ],
});
