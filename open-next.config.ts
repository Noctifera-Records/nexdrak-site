import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  build: {
    minify: false,
    // Exclude pg-native from build (it's optional and fails in Workers)
    external: ["pg-native"],
  },
});