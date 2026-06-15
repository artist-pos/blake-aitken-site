'use client'

import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  name: string
  value: string
  onChange: (val: string) => void
  disabled?: boolean
}

type Format = 'bold' | 'italic' | 'link' | 'bullet'

function applyFormat(
  textarea: HTMLTextAreaElement,
  value: string,
  onChange: (val: string) => void,
  format: Format
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = value.slice(start, end)

  if (format === 'bullet') {
    const lines = (selected || '').split('\n')
    const bulleted = lines.length && lines[0] !== ''
      ? lines.map((l) => `- ${l}`).join('\n')
      : '- '
    const newValue = value.slice(0, start) + bulleted + value.slice(end)
    onChange(newValue)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start, start + bulleted.length)
    })
    return
  }

  if (format === 'link') {
    const url = window.prompt('URL:', 'https://')
    if (!url) return
    const text = selected || 'link text'
    const insert = `[${text}](${url})`
    const newValue = value.slice(0, start) + insert + value.slice(end)
    onChange(newValue)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + insert.length, start + insert.length)
    })
    return
  }

  const wrap = format === 'bold' ? '**' : '_'
  const text = selected || (format === 'bold' ? 'bold' : 'italic')
  const insert = `${wrap}${text}${wrap}`
  const newValue = value.slice(0, start) + insert + value.slice(end)
  onChange(newValue)
  requestAnimationFrame(() => {
    textarea.focus()
    const cursor = start + insert.length
    textarea.setSelectionRange(cursor, cursor)
  })
}

const toolbarBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  fontSize: '12px',
  cursor: 'pointer',
  color: '#1a1a1a',
  background: 'none',
  border: 'none',
  lineHeight: 1,
  borderRight: '1px solid rgba(0,0,0,0.08)',
}

export default function MarkdownEditor({ name, value, onChange, disabled }: Props) {
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function format(f: Format) {
    if (textareaRef.current) applyFormat(textareaRef.current, value, onChange, f)
  }

  return (
    <div style={{ border: '1px solid rgba(0,0,0,0.15)' }}>
      {/* Tab + toolbar bar */}
      <div
        className="flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#f8f8f8' }}
      >
        <div className="flex">
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
                cursor: 'pointer',
                background: 'none',
                border: 'none',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'write' && (
          <div className="flex items-center" style={{ borderLeft: '1px solid rgba(0,0,0,0.08)' }}>
            <button type="button" onClick={() => format('bold')} style={toolbarBtnStyle} title="Bold">
              <strong>B</strong>
            </button>
            <button type="button" onClick={() => format('italic')} style={toolbarBtnStyle} title="Italic">
              <em>I</em>
            </button>
            <button type="button" onClick={() => format('link')} style={toolbarBtnStyle} title="Link">
              ↗
            </button>
            <button type="button" onClick={() => format('bullet')} style={{ ...toolbarBtnStyle, borderRight: 'none' }} title="Bullet list">
              ≡
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {tab === 'write' ? (
        <textarea
          ref={textareaRef}
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
          className="prose prose-sm max-w-none"
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
