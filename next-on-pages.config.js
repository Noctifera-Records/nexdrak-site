/** @type {import('@cloudflare/next-on-pages').Config} */
const config = {
  // Configuración de compatibilidad
  compatibility: {
    nodejs: false,
    edge: true,
  },
};

module.exports = config;