'use client'

import { useState, useTransition } from 'react'
import { updateCategoryLayout } from '@/app/actions/updateCategoryLayout'
import type { CategoryLayout } from '@/lib/types'

export interface GridLayout {
  rowHeight: number
  hGap: number
  vGap: number
  lastRow: CategoryLayout['last_row']
}

interface Props {
  category: string
  layout: GridLayout
  onChange: (layout: GridLayout) => void
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
  minWidth: '34px',
}

const sliderStyle: React.CSSProperties = {
  width: '100px',
  accentColor: '#ffffff',
  cursor: 'pointer',
}

const LAST_ROW_OPTS: { value: GridLayout['lastRow']; label: string }[] = [
  { value: 'left', label: '▥·' },
  { value: 'center', label: '·▥·' },
  { value: 'fill', label: '▥▥' },
]

// Declared at module level, not inside DisciplineLayoutBar: a component defined
// during render is a fresh type every render, which would remount the range
// input mid-drag and drop the pointer capture.
function Slider({
  label,
  value,
  min,
  max,
  step,
  onSlide,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onSlide: (n: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span style={labelStyle}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onSlide(Number(e.target.value))}
        style={sliderStyle}
      />
      <span style={valueStyle}>{value}px</span>
    </div>
  )
}

/**
 * The landing-page counterpart to AdminLayoutBar: same controls, but scoped to
 * one discipline's row of works and rendered inline, because the page shows
 * several disciplines at once and a single fixed bar could only ever target one.
 */
export default function DisciplineLayoutBar({ category, layout, onChange }: Props) {
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    startTransition(async () => {
      try {
        await updateCategoryLayout(category, layout)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Save failed')
      }
    })
  }

  return (
    <div
      className="flex items-center flex-wrap gap-x-5 gap-y-2"
      style={{
        backgroundColor: '#111111',
        padding: '8px 14px',
        marginBottom: '16px',
      }}
    >
      <Slider
        label="Row height"
        value={layout.rowHeight}
        min={120}
        max={600}
        step={10}
        onSlide={(rowHeight) => onChange({ ...layout, rowHeight })}
      />
      <Slider
        label="H-gap"
        value={layout.hGap}
        min={0}
        max={48}
        step={1}
        onSlide={(hGap) => onChange({ ...layout, hGap })}
      />
      <Slider
        label="V-gap"
        value={layout.vGap}
        min={0}
        max={96}
        step={2}
        onSlide={(vGap) => onChange({ ...layout, vGap })}
      />

      <div className="flex items-center gap-2">
        <span style={labelStyle}>Last row</span>
        <div className="flex">
          {LAST_ROW_OPTS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...layout, lastRow: value })}
              title={value}
              style={{
                padding: '3px 8px',
                fontSize: '13px',
                lineHeight: 1,
                cursor: 'pointer',
                background: layout.lastRow === value ? 'rgba(255,255,255,0.15)' : 'none',
                border: '1px solid rgba(255,255,255,0.12)',
                color: layout.lastRow === value ? '#ffffff' : '#555555',
                marginLeft: '-1px',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3" style={{ marginLeft: 'auto' }}>
        {error && <span style={{ fontSize: '10px', color: '#ff6b6b' }}>{error}</span>}
        <button
          type="button"
          onClick={save}
          disabled={pending}
          style={{
            fontSize: '10px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#111111',
            backgroundColor: saved ? '#4caf50' : '#ffffff',
            border: 'none',
            padding: '5px 12px',
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
