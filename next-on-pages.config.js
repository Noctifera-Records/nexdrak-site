/** @type {import('@cloudflare/next-on-pages').Config} */
const config = {
  // Configuración específica para Cloudflare Pages
  experimental: {
    runtime: 'edge',
  },
  // Forzar Edge Runtime para todas las rutas de API
  edgeRuntime: {
    '/api/admin/*': true,
    '/api/*': true,
  },
  // Configuración de compatibilidad
  compatibility: {
    nodejs: false,
    edge: true,
  },
};

module.exports = config;