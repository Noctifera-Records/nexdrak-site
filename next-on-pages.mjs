// next-on-pages.config.js
import { defineConfig } from '@cloudflare/next-on-pages/config';

export default defineConfig({
  worker: {
    bundle: {
      esbuildOptions: {
        mainFields: ['module', 'main']
      }
    }
  }
});
