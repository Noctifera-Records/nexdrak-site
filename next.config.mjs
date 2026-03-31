/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    },
    compress: true,
    poweredByHeader: false,
    generateEtags: true,
    trailingSlash: false,
    reactStrictMode: true,

    // IMPORTANT: Externalize DB and other node-heavy packages
    serverExternalPackages: [
    "undici",
    "node:sqlite",
    "prisma",
    "@prisma/client",
    "@better-auth/prisma-adapter",
    "@mrleebo/prisma-ast",
    "@electric-sql/pglite",
    "@electric-sql/pglite-socket",
    "@electric-sql/pglite-tools",
    ],

    experimental: {
    optimizeCss: false,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
    ],
    },

    compiler: {
    removeConsole: process.env.NODE_ENV === "production",
    },

    async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com https://accounts.google.com https://static.cloudflareinsights.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
      img-src 'self' blob: data: https://*.supabase.co https://i.ibb.co https://*.postimages.org https://*.googleusercontent.com https://*.ytimg.com https://nexdrak.com;
      font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self' https://accounts.google.com;
      frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://accounts.google.com;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://accounts.google.com https://*.googleapis.com;
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
