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
      className="transition-opacity duration-150 hover:opacity-50"
      style={{
        fontSize: '11px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#888888',
        cursor: 'pointer',
      }}
    >
      Sign Out
    </button>
  )
}
