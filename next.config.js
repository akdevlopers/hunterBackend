/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: 'https://zd537dmbubpdipul2vm6g5feti0xfjpt.lambda-url.ap-south-1.on.aws/admin/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'https://zd537dmbubpdipul2vm6g5feti0xfjpt.lambda-url.ap-south-1.on.aws/uploads/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
