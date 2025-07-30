/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: false, // Disable compression to reduce server load
  poweredByHeader: false,
  generateEtags: false, // Disable ETags to reduce requests
  trailingSlash: false,
  reactStrictMode: false, // Disable strict mode to prevent double renders

  // Minimal experimental features to prevent chunk generation
  experimental: {
    optimizeCss: false,
    optimizePackageImports: [],
    serverComponentsExternalPackages: [],
    webpackBuildWorker: false,
    turbo: false,
    appDir: true,
  },
  
  // Extreme optimization to prevent 429 errors - works in both dev and production
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Apply optimizations in both dev and production
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
        runtimeChunk: false,
        minimize: !dev, // Only minimize in production
        concatenateModules: !dev,
      };
      
      // Reduce the number of chunks even in development
      if (dev) {
        // In development, limit the number of chunks
        config.optimization.splitChunks = {
          chunks: 'all',
          maxAsyncRequests: 1,
          maxInitialRequests: 1,
          cacheGroups: {
            default: false,
            vendors: false,
            // Single bundle for everything
            bundle: {
              name: 'bundle',
              chunks: 'all',
              enforce: true,
            },
          },
        };
      }
    }
    return config;
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600",
          },
          {
            key: "Connection",
            value: "keep-alive",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400",
          },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-control",
            value: "public, max-age=86400, s-maxage=86400",
          },
        ],
      },
      {
        source: "/(apple-touch-icon|favicon|site.webmanifest)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
