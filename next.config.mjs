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
  
  // Balanced optimization to reduce 429 errors while allowing navigation
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Less aggressive optimization that allows navigation
      config.optimization = {
        ...config.optimization,
        // Allow some chunking but limit it
        splitChunks: {
          chunks: 'all',
          maxAsyncRequests: 3, // Reduced from default
          maxInitialRequests: 2, // Reduced from default
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              enforce: true,
            },
            default: {
              minChunks: 2,
              priority: -10,
              reuseExistingChunk: true,
            },
          },
        },
        runtimeChunk: false, // Keep this disabled
        minimize: !dev,
        concatenateModules: !dev,
      };
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
