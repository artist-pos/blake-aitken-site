'use client'

import { useState, useTransition } from 'react'
import { updateProjectLayout } from '@/app/actions/updateProjectLayout'

interface Layout {
  rowHeight: number
  hGap: number
  vGap: number
  lastRow: 'left' | 'center' | 'fill'
}

interface Props {
  projectId: string
  slug: string
  initial: Layout
  onChange?: (layout: Layout) => void
}

const sliderStyle: React.CSSProperties = {
  width: '120px',
  accentColor: '#ffffff',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#888888',
  whiteSpace: 'nowrap',
}

const valueStyle: React.CSSProperties = {
  fontSize: '10px',
  fontFamily: 'var(--font-jetbrains-mono)',
  color: '#ffffff',
  minWidth: '36px',
}

type LastRow = 'left' | 'center' | 'fill'

const LAST_ROW_OPTS: { value: LastRow; label: string }[] = [
  { value: 'left',   label: '▥·' },
  { value: 'center', label: '·▥·' },
  { value: 'fill',   label: '▥▥' },
]

export default function AdminLayoutBar({ projectId, slug, initial, onChange }: Props) {
  const [rowHeight, setRowHeight] = useState(initial.rowHeight)
  const [hGap, setHGap]         = useState(initial.hGap)
  const [vGap, setVGap]         = useState(initial.vGap)
  const [lastRow, setLastRow]   = useState<LastRow>(initial.lastRow)

  function update(patch: Partial<{ rowHeight: number; hGap: number; vGap: number; lastRow: LastRow }>) {
    const next = { rowHeight, hGap, vGap, lastRow, ...patch }
    if (patch.rowHeight !== undefined) setRowHeight(patch.rowHeight)
    if (patch.hGap      !== undefined) setHGap(patch.hGap)
    if (patch.vGap      !== undefined) setVGap(patch.vGap)
    if (patch.lastRow   !== undefined) setLastRow(patch.lastRow)
    onChange?.(next)
  }
  const [saved, setSaved]       = useState(false)
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      await updateProjectLayout(projectId, slug, { rowHeight, hGap, vGap, lastRow })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 100,
        height: '44px',
        backgroundColor: '#111111',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '24px',
      }}
    >
      {/* Row height */}
      <div className="flex items-center gap-2">
        <span style={labelStyle}>Row height</span>
        <input
          type="range" min={120} max={600} step={10}
          value={rowHeight}
          onChange={(e) => update({ rowHeight: Number(e.target.value) })}
          style={sliderStyle}
        />
        <span style={valueStyle}>{rowHeight}px</span>
      </div>

      <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />

      {/* H-gap */}
      <div className="flex items-center gap-2">
        <span style={labelStyle}>H-gap</span>
        <input
          type="range" min={0} max={48} step={2}
          value={hGap}
          onChange={(e) => update({ hGap: Number(e.target.value) })}
          style={sliderStyle}
        />
        <span style={valueStyle}>{hGap}px</span>
      </div>

      <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />

      {/* V-gap */}
      <div className="flex items-center gap-2">
        <span style={labelStyle}>V-gap</span>
        <input
          type="range" min={0} max={48} step={2}
          value={vGap}
          onChange={(e) => update({ vGap: Number(e.target.value) })}
          style={sliderStyle}
        />
        <span style={valueStyle}>{vGap}px</span>
      </div>

      <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />

      {/* Last row */}
      <div className="flex items-center gap-2">
        <span style={labelStyle}>Last row</span>
        <div className="flex">
          {LAST_ROW_OPTS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => update({ lastRow: value })}
              style={{
                padding: '3px 8px',
                fontSize: '13px',
                cursor: 'pointer',
                background: lastRow === value ? 'rgba(255,255,255,0.15)' : 'none',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 0,
                color: lastRow === value ? '#ffffff' : '#555555',
                marginLeft: '-1px',
              }}
              title={value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <a
          href="/admin"
          style={{ fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#555555' }}
        >
          Dashboard
        </a>
        <a
          href={`/admin/projects/${projectId}`}
          style={{ fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}
        >
          Edit Project
        </a>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          style={{
            fontSize: '11px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#111111',
            backgroundColor: saved ? '#4caf50' : '#ffffff',
            border: 'none',
            padding: '6px 14px',
            cursor: pending ? 'wait' : 'pointer',
            transition: 'background-color 200ms',
          }}
        >
          {saved ? 'Saved ✓' : pending ? 'Saving…' : 'Save layout'}
        </button>
      </div>
    </div>
  )
}
