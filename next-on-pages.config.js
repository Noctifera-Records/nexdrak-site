/** @type {import('@cloudflare/next-on-pages').Config} */
const config = {
  // All routes now use Edge Runtime for Cloudflare Pages compatibility
  skipMiddlewareCompatibilityCheck: true,
};

module.exports = config;