'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

function NZTime() {
  const [time, setTime] = useState('')

  useEffect(() => {
    function update() {
      const t = new Date().toLocaleTimeString('en-NZ', {
        timeZone: 'Pacific/Auckland',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      setTime(t)
    }
    update()
    const id = setInterval(update, 10000)
    return () => clearInterval(id)
  }, [])

  return <span>{time} NZST</span>
}

const text: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 400,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#888888',
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
      {/* Row 1: copyright · tagline · location+time */}
      <div className="grid grid-cols-3 items-center px-12 py-4 max-md:px-5 max-md:grid-cols-1 max-md:gap-2">
        <span style={text}>&copy;{year} Blake Aitken</span>
        <span style={{ ...text, textAlign: 'center' }} className="max-md:text-left">
          Public Artist &amp; Architectural Designer
        </span>
        <span style={{ ...text, textAlign: 'right' }} className="max-md:text-left">
          Kirikiriroa, Aotearoa NZ · <NZTime />
        </span>
      </div>

      {/* Row 2: Blog centred */}
      <div className="grid grid-cols-3 px-12 pt-2 pb-12 max-md:px-5 max-md:pb-8">
        <span />
        <div className="flex justify-center max-md:justify-start">
          <Link
            href="/blog"
            style={{ ...text, color: '#1a1a1a' }}
            className="hover:opacity-50 transition-opacity duration-150"
          >
            Blog
          </Link>
        </div>
        <span />
      </div>
    </footer>
  )
}
