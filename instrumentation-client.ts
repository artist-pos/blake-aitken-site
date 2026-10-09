import posthog from 'posthog-js'

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY

if (key) {
  posthog.init(key, {
    // Requests go through the /ingest rewrite in next.config.ts so ad blockers
    // are less likely to drop them.
    api_host: '/ingest',
    ui_host: `https://${process.env.NEXT_PUBLIC_POSTHOG_REGION ?? 'us'}.posthog.com`,
    // The defaults date enables automatic pageviews on client-side navigation.
    defaults: '2025-05-24',
    // The admin area is Blake's own traffic, not visitors.
    before_send: (event) =>
      event && window.location.pathname.startsWith('/admin') ? null : event,
  })
}
