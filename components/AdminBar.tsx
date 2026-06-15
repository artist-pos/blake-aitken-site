import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface Props {
  editHref?: string
}

export default async function AdminBar({ editHref }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'blakeaitkenwork@gmail.com') return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 100,
        height: '36px',
        backgroundColor: '#111111',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '20px',
      }}
    >
      <span style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#444444' }}>
        Admin
      </span>
      {editHref && (
        <Link
          href={editHref}
          style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ffffff' }}
        >
          Edit Project
        </Link>
      )}
      <Link
        href="/admin/projects/new"
        style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}
      >
        + New Project
      </Link>
      <Link
        href="/admin"
        style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#555555', marginLeft: 'auto' }}
      >
        Dashboard →
      </Link>
    </div>
  )
}
