/** @type {import('next').NextConfig} */
let withPWA = (config) => config;
try {
  const pwa = require('next-pwa').default;
  withPWA = pwa({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    buildExcludes: [/middleware-manifest\.json$/]
  });
} catch (e) {
  console.warn('next-pwa not installed, PWA disabled for build');
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.pravatar.cc', 'picsum.photos', 'via.placeholder.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
}

module.exports = withPWA(nextConfig)
