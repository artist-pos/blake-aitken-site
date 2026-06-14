'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '10px 12px',
    fontSize: '13px',
    border: '1px solid rgba(0,0,0,0.15)',
    outline: 'none',
    backgroundColor: '#ffffff',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#1a1a1a',
    marginBottom: '6px',
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
      <div style={{ width: '100%', maxWidth: '360px', padding: '0 20px' }}>
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '15px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '4px' }}>
            Blake Aitken
          </p>
          <p style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}>
            Admin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#cc0000' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#ffffff',
              backgroundColor: loading ? '#888888' : '#000000',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
