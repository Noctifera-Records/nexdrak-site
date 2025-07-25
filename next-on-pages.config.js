/** @type {import('@cloudflare/next-on-pages').Config} */
const config = {
  // Windows compatibility settings
  skipMiddlewareCompatibilityCheck: true,
  experimental: {
    runtime: 'edge',
  },
};

module.exports = config;