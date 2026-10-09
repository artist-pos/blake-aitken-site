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
  // PostHog's /static and /array paths need the same trailing-slash handling.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
    // e.g. https://us.i.posthog.com -> https://us-assets.i.posthog.com
    const assetHost = host.replace(/\/\/(\w+)\./, '//$1-assets.')
    return [
      { source: '/ingest/static/:path*', destination: `${assetHost}/static/:path*` },
      { source: '/ingest/array/:path*', destination: `${assetHost}/array/:path*` },
      { source: '/ingest/:path*', destination: `${host}/:path*` },
    ]
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
