'use client'

import { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { ProjectImage } from '@/lib/types'

interface Props {
  images: ProjectImage[]
  index: number
  projectTitle: string
  onClose: () => void
  onNavigate: (index: number) => void
}

const chevron = (dir: 'prev' | 'next') => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d={dir === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const navButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  padding: '12px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'rgba(0,0,0,0.35)',
  lineHeight: 0,
}

export default function Lightbox({ images, index, projectTitle, onClose, onNavigate }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  const count = images.length
  const img = images[index]

  const go = useCallback(
    (delta: number) => onNavigate((index + delta + count) % count),
    [index, count, onNavigate]
  )

  // Remember what had focus so it can be restored on close.
  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => restoreFocusRef.current?.focus?.()
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && count > 1) go(-1)
      else if (e.key === 'ArrowRight' && count > 1) go(1)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [go, onClose, count])

  // Lock background scroll while open, preserving the scrollbar gutter so the
  // page behind doesn't shift.
  useEffect(() => {
    const { overflow, paddingRight } = document.body.style
    const gutter = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [])

  if (!img) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${projectTitle} — image ${index + 1} of ${count}`}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px 72px',
      }}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: '18px',
          right: '22px',
          padding: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(0,0,0,0.35)',
          lineHeight: 0,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(-1) }}
            aria-label="Previous image"
            style={{ ...navButtonStyle, left: '10px' }}
          >
            {chevron('prev')}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(1) }}
            aria-label="Next image"
            style={{ ...navButtonStyle, right: '10px' }}
          >
            {chevron('next')}
          </button>
        </>
      )}

      {/* Stop propagation so clicking the image itself doesn't close the dialog. */}
      <figure
        onClick={(e) => e.stopPropagation()}
        style={{
          margin: 0,
          // A definite width/height here is what lets the image's percentage
          // max-height resolve; against an auto-height parent it is ignored.
          width: '100%',
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <Image
          src={img.url}
          alt={img.alt ?? projectTitle}
          width={img.width ?? 1600}
          height={img.height ?? 1200}
          sizes="100vw"
          priority
          style={{
            flex: '0 1 auto',
            minHeight: 0,
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
          }}
        />
        {img.alt && (
          <figcaption
            style={{
              fontSize: '11px',
              fontStyle: 'italic',
              color: '#888888',
              textAlign: 'center',
              letterSpacing: '0.01em',
            }}
          >
            {img.alt}
          </figcaption>
        )}
      </figure>
    </div>
  )
}
