import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/dream-well', destination: '/work/dream-well', permanent: true },
      { source: '/chalk-walk', destination: '/work/chalk-walk', permanent: true },
      { source: '/cost-of-passage', destination: '/work/cost-of-passage', permanent: true },
      { source: '/100-cones', destination: '/work/100-cones', permanent: true },
      { source: '/profile', destination: '/info', permanent: true },
      { source: '/home', destination: '/', permanent: true },
    ]
  },
}

export default nextConfig
