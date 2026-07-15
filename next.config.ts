import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' && {
      exclude: ['error', 'info', 'warn'],
    },
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/v1/dashboard',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
