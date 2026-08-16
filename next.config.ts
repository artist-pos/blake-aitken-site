import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // 75 is Next's default and stays for anything incidental; the work itself is
    // served at 90. Next 16 rejects any quality not listed here.
    qualities: [75, 90],
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
      // Projects moved from /work/<slug> to /<slug>. These four used to point
      // the other way; left as they were they would now redirect in a loop.
      { source: '/work/:slug', destination: '/:slug', permanent: true },
      { source: '/work', destination: '/', permanent: true },
      { source: '/profile', destination: '/info', permanent: true },
      { source: '/home', destination: '/', permanent: true },
    ]
  },
}

export default nextConfig
