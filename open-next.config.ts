import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare Configuration
 */
export default defineCloudflareConfig({
  minify: true,
  external: [
    // Dejamos que OpenNext maneje el empaquetado. 
    // Cloudflare nodejs_compat se encargará de los módulos de Node.
  ],
});
