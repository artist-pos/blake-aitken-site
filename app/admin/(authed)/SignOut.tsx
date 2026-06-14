'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminSignOut() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        fontSize: '11px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#888888',
        cursor: 'pointer',
        transition: 'opacity 150ms',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.5')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
    >
      Sign Out
    </button>
  )
}
