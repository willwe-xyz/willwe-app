/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
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
    ];
  },
};