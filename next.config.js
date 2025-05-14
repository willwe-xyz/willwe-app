/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  typescript: {
    // Ignore TypeScript errors during the build process
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // If client-side, don't polyfill Node modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        sqlite3: false,
        'sqlite3-binding': false
      };
    }

    // Exclude platform-specific packages from managed paths
    config.snapshot = {
      ...config.snapshot,
      managedPaths: [/^(.+?[\\/]node_modules[\\/])/],
      immutablePaths: [],
      buildDependencies: {
        hash: true,
        timestamp: true,
      },
    };

    return config;
  },
  async redirects() {
    return [
      {
        source: '/nodes',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/nodes/:chainId/:nodeId',
        destination: '/nodes/[chainId]/[nodeId]',
      },
      {
        source: '/ipfs/:path*',
        destination: `${process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/'}:path*`
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'Authorization, Content-Type' },
        ],
      },
    ];
  }
};