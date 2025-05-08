/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: async (config, { isServer }) => {
    if (!isServer) {
      // Client-side specific config
      const webpack = await import('webpack');
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        url: require.resolve('url'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      };

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
