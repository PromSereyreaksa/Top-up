import { defineConfig } from 'next';
import crypto from 'crypto-browserify'; // Use the polyfill for crypto

/** @type {import('next').NextConfig} */
const nextConfig = defineConfig({
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["res.cloudinary.com"],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/old-page",
        destination: "/new-page",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
    ];
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // Polyfill `crypto` for client-side usage
      config.resolve.fallback = {
        crypto: require.resolve('crypto-browserify'),
      };
    }
    return config;
  },
});

// ✅ Use ES module export
export default nextConfig;
