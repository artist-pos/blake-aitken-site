'use client'

import { useState } from 'react'
import Image from 'next/image'
import MarkdownContent from '@/components/MarkdownContent'
import type { ProjectDevelopment } from '@/lib/types'

interface Props {
  entries: ProjectDevelopment[]
}

export default function ProjectDevelopmentSection({ entries }: Props) {
  const [open, setOpen] = useState(false)

  if (!entries.length) return null

  return (
    <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full hover:opacity-50 transition-opacity duration-150"
        style={{ padding: '20px 48px', textAlign: 'left' }}
      >
        <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888888' }}>
          Development
        </span>
        <span
          style={{
            fontSize: '13px',
            color: '#888888',
            display: 'inline-block',
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 200ms ease',
          }}
        >
          →
        </span>
      </button>

      {open && (
        <div className="px-12 pb-16 max-md:px-5 max-md:pb-10">
          <div className="flex flex-col" style={{ gap: '56px' }}>
            {entries.map(entry => (
              <div key={entry.id}>
                {(entry.title || entry.date) && (
                  <div
                    className="flex items-baseline gap-6 mb-6"
                    style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '10px' }}
                  >
                    {entry.title && (
                      <span style={{ fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#1a1a1a' }}>
                        {entry.title}
                      </span>
                    )}
                    {entry.date && (
                      <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px', color: '#888888' }}>
                        {entry.date}
                      </span>
                    )}
                  </div>
                )}

                {entry.images.length > 0 && (
                  <div className="flex flex-wrap mb-6" style={{ gap: '6px' }}>
                    {entry.images.map((img, i) => {
                      const displayH = 220
                      const displayW = Math.round(displayH * (img.width / img.height))
                      return (
                        <figure key={i} style={{ margin: 0 }}>
                          <Image
                            src={img.url}
                            alt={img.alt || ''}
                            width={displayW}
                            height={displayH}
                            style={{ objectFit: 'cover', display: 'block' }}
                          />
                          {img.alt && (
                            <figcaption style={{ fontSize: '10px', fontStyle: 'italic', color: '#888888', marginTop: '4px', letterSpacing: '0.01em' }}>
                              {img.alt}
                            </figcaption>
                          )}
                        </figure>
                      )
                    })}
                  </div>
                )}

                {entry.body && <MarkdownContent content={entry.body} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
