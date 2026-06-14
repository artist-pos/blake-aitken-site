import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: projectCount },
    { count: postCount },
    { count: unreadCount },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('archived', false),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('form_submissions').select('*', { count: 'exact', head: true }).eq('read', false),
  ])

  const stats = [
    { label: 'Projects', value: projectCount ?? 0, href: '/admin/projects' },
    { label: 'Blog Posts', value: postCount ?? 0, href: '/admin/blog' },
    { label: 'Unread Messages', value: unreadCount ?? 0, href: '/admin/messages' },
  ]

  return (
    <div>
      <h1
        style={{
          fontSize: '11px',
          fontWeight: 400,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#888888',
          marginBottom: '32px',
        }}
      >
        — Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-px max-md:grid-cols-1 mb-12">
        {stats.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="block p-6 bg-white hover:bg-[#f8f8f8] transition-colors duration-150"
          >
            <p
              style={{
                fontFamily: 'var(--font-jetbrains-mono)',
                fontSize: '32px',
                fontWeight: 400,
                color: '#1a1a1a',
                marginBottom: '4px',
              }}
            >
              {value}
            </p>
            <p style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888' }}>
              {label}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: '/admin/projects/new', label: 'New Project' },
          { href: '/admin/blog/new', label: 'New Post' },
          { href: '/', label: 'View Site ↗', external: true },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            target={label.includes('↗') ? '_blank' : undefined}
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#ffffff',
              backgroundColor: '#000000',
              transition: 'opacity 150ms',
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
