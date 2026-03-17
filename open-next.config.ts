import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare Configuration
 * AGGRESSIVE OPTIMIZATION for 3MB Limit
 */
export default defineCloudflareConfig({
  minify: true,
  external: [
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
