/** @type {import('next').NextConfig} */
const nextConfig = {
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
  };
  
  // ✅ Use ES module export
  export default nextConfig;
  