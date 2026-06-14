'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  name: string
  value: string
  onChange: (val: string) => void
  disabled?: boolean
}

export default function MarkdownEditor({ name, value, onChange, disabled }: Props) {
  const [tab, setTab] = useState<'write' | 'preview'>('write')

  return (
    <div style={{ border: '1px solid rgba(0,0,0,0.15)' }}>
      {/* Tab bar */}
      <div
        className="flex"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#f8f8f8' }}
      >
        {(['write', 'preview'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px',
              fontSize: '11px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: tab === t ? '#1a1a1a' : '#888888',
              borderBottom: tab === t ? '2px solid #1a1a1a' : '2px solid transparent',
              transition: 'color 150ms',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'write' ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={16}
          placeholder="Markdown supported…"
          style={{
            display: 'block',
            width: '100%',
            padding: '16px',
            fontSize: '13px',
            lineHeight: 1.6,
            fontFamily: 'var(--font-jetbrains-mono)',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
          }}
        />
      ) : (
        <div
          style={{
            minHeight: '300px',
            padding: '16px',
            fontSize: '14px',
            lineHeight: 1.7,
            backgroundColor: '#ffffff',
          }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p style={{ color: '#888888', fontSize: '13px' }}>Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  )
}
