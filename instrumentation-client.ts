import posthog from 'posthog-js'

const key = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN

const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

if (key) {
  posthog.init(key, {
    // Requests go through the /ingest rewrite in next.config.ts so ad blockers
    // are less likely to drop them.
    api_host: '/ingest',
    ui_host: host.includes('//eu.') ? 'https://eu.posthog.com' : 'https://us.posthog.com',
    // The defaults date enables automatic pageviews on client-side navigation.
    defaults: '2025-05-24',
    // The admin area is Blake's own traffic, not visitors.
    before_send: (event) =>
      event && window.location.pathname.startsWith('/admin') ? null : event,
  })
}
