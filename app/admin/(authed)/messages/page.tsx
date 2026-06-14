'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { FormSubmission } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<FormSubmission[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createClient()
      .from('form_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMessages(data ?? [])
        setLoading(false)
      })
  }, [])

  async function toggleRead(msg: FormSubmission) {
    await createClient().from('form_submissions').update({ read: !msg.read }).eq('id', msg.id)
    setMessages((m) => m.map((x) => x.id === msg.id ? { ...x, read: !x.read } : x))
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this message?')) return
    await createClient().from('form_submissions').delete().eq('id', id)
    setMessages((m) => m.filter((x) => x.id !== id))
    if (expanded === id) setExpanded(null)
  }

  if (loading) return <div style={{ padding: '32px', color: '#888888', fontSize: '13px' }}>Loading…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888888' }}>
          — Messages
        </h1>
        <span style={{ fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#888888' }}>
          {messages.filter((m) => !m.read).length} unread
        </span>
      </div>

      <div style={{ backgroundColor: '#ffffff' }}>
        {/* Header */}
        <div
          className="grid grid-cols-[1fr_180px_140px_auto_auto] gap-4 px-4 py-2 max-md:hidden"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}
        >
          <span>Name / Subject</span>
          <span>Email</span>
          <span>Date</span>
          <span>Status</span>
          <span />
        </div>

        {messages.length === 0 && (
          <div className="px-4 py-8" style={{ textAlign: 'center', color: '#888888', fontSize: '13px' }}>No messages yet.</div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            {/* Row */}
            <div
              className="grid grid-cols-[1fr_180px_140px_auto_auto] gap-4 items-center px-4 py-3 cursor-pointer max-md:flex max-md:flex-col max-md:items-start max-md:gap-1"
              style={{ backgroundColor: !msg.read ? 'rgba(0,0,0,0.02)' : 'transparent' }}
              onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
            >
              <div>
                <span style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: msg.read ? 400 : 500 }}>{msg.name}</span>
                {msg.subject && <span style={{ fontSize: '11px', color: '#888888', marginLeft: '8px' }}>{msg.subject}</span>}
              </div>
              <span style={{ fontSize: '12px', color: '#888888' }}>{msg.email}</span>
              <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px', color: '#888888' }}>{formatDate(msg.created_at)}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleRead(msg) }}
                style={{ fontSize: '10px', letterSpacing: '0.04em', textTransform: 'uppercase', color: msg.read ? '#888888' : '#1a1a1a', cursor: 'pointer' }}
              >
                {msg.read ? 'Mark Unread' : 'Mark Read'}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDelete(msg.id) }}
                style={{ fontSize: '10px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#cc0000', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>

            {/* Expanded message */}
            {expanded === msg.id && (
              <div className="px-4 py-4" style={{ backgroundColor: '#f8f8f8', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#1a1a1a', whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                <a
                  href={`mailto:${msg.email}?subject=Re: ${msg.subject ?? 'Your message'}`}
                  style={{ display: 'inline-block', marginTop: '12px', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a', textDecoration: 'underline' }}
                >
                  Reply via Email →
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
