import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare Configuration
 */
export default defineCloudflareConfig({
  minify: true,
  external: [
    // Solo excluimos lo estrictamente necesario para evitar conflictos de Node.js
    "crypto",
    "buffer",
    "util",
    "stream",
    "@better-auth/prisma-adapter",
    "prisma",
    "@prisma/client"
  ],
});
