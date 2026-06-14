'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#f5f5f5' }}
    >
      <div style={{ width: '100%', maxWidth: '360px', padding: '0 20px' }}>
        <div style={{ marginBottom: '32px' }}>
          <p
            style={{
              fontSize: '15px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#1a1a1a',
              marginBottom: '4px',
            }}
          >
            Blake Aitken
          </p>
          <p style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}>
            Admin
          </p>
        </div>

        {status === 'sent' ? (
          <div>
            <p style={{ fontSize: '14px', color: '#1a1a1a', lineHeight: 1.6 }}>
              Check your email — a magic link has been sent to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a', display: 'block', marginBottom: '6px' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'sending'}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '13px',
                  border: '1px solid rgba(0,0,0,0.15)',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              style={{
                padding: '12px 24px',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#ffffff',
                backgroundColor: status === 'sending' ? '#888888' : '#000000',
                border: 'none',
                cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                transition: 'opacity 150ms',
              }}
            >
              {status === 'sending' ? 'Sending…' : 'Send Magic Link'}
            </button>

            {status === 'error' && (
              <p style={{ fontSize: '12px', color: '#cc0000' }}>{errorMsg}</p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
