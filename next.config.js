// next.config.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix for the crypto issue specifically
      // Make sure crypto-browserify is installed
      config.resolve.alias = {
        ...config.resolve.alias,
        crypto: require.resolve('crypto-browserify'),
      };
      
      // Polyfill Node.js modules for the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        // Use explicit paths for all polyfills
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        url: require.resolve('url'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
        path: require.resolve('path-browserify'),
        zlib: require.resolve('browserify-zlib'),
        querystring: require.resolve('querystring-es3'),
      };
      
      // Import webpack
      const webpack = require('webpack');
      
      // Add plugins
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }
    return config;
  },
};

export default nextConfig;