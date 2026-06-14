import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AdminSignOut from './SignOut'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/messages', label: 'Messages' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'blakeaitkenwork@gmail.com') redirect('/admin/login')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header
        style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#ffffff' }}
        className="flex items-center justify-between px-8 py-3 max-md:px-5"
      >
        <div className="flex items-center gap-8">
          <Link
            href="/"
            style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a' }}
          >
            Blake Aitken
          </Link>
          <span style={{ color: 'rgba(0,0,0,0.2)' }}>/</span>
          <span style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}>Admin</span>
        </div>

        <div className="flex items-center gap-8">
          <nav className="flex items-center gap-6">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{ fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a' }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <AdminSignOut />
        </div>
      </header>

      <main className="px-8 py-8 max-md:px-5">{children}</main>
    </div>
  )
}
