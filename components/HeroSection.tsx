'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { HomeSlide } from '@/lib/queries'

interface Props {
  slides: HomeSlide[]
  statement: string
}

const DEFAULT_STATEMENT = 'I design civic systems that make invisible social contracts visible.'
const MIN_FONT = 34
const CAROUSEL_VH = 0.58
const CAROUSEL_MAX_H = 480
const COL_PAD_X = 40
const COL_PAD_Y = 40

export default function HeroSection({ slides, statement }: Props) {
  const [current, setCurrent]       = useState(0)
  const [fontSize, setFontSize]     = useState(MIN_FONT)
  const [carouselMinH, setCarouselMinH] = useState(0)
  // Measured height of the fitted statement — the image is matched to it so the
  // two line up top and bottom.
  const [textH, setTextH] = useState(0)
  const colRef  = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  const fitFont = useCallback(() => {
    const col  = colRef.current
    const text = textRef.current
    if (!col || !text) return

    // Measure against the carousel's OWN height, never the column's. Deriving
    // the budget from the column feeds every font increase straight back in as
    // extra room, which escalates until it hits the cap below.
    const H = Math.min(window.innerHeight * CAROUSEL_VH, CAROUSEL_MAX_H) - COL_PAD_Y * 2
    const W = col.clientWidth - COL_PAD_X * 2
    if (H < 10 || W < 10) return

    // Width matters as much as height: one long word at a large size overflows
    // sideways while scrollHeight still looks fine.
    const fits = (px: number) => {
      text.style.fontSize = `${px}px`
      return text.scrollHeight <= H && text.scrollWidth <= W
    }

    let resolved: number

    if (!fits(MIN_FONT)) {
      // Genuinely too little room at the floor size — grow the carousel to
      // match. Font stays at the floor, so this can't feed back.
      text.style.fontSize = `${MIN_FONT}px`
      setCarouselMinH(text.scrollHeight + COL_PAD_Y * 2)
      resolved = MIN_FONT
    } else {
      setCarouselMinH(0)
      let lo = MIN_FONT, hi = 240
      if (fits(hi)) {
        resolved = hi
      } else {
        while (hi - lo > 0.5) {
          const mid = (lo + hi) / 2
          if (fits(mid)) lo = mid
          else hi = mid
        }
        resolved = Math.floor(lo)
      }
    }

    // Leave the probed node agreeing with state. Clearing it instead would drop
    // the text to the stylesheet default whenever `resolved` equals the current
    // state, because React then has no change to write.
    text.style.fontSize = `${resolved}px`
    setFontSize(resolved)
    setTextH(text.getBoundingClientRect().height)
  }, [])

  // Refit on resize
  useEffect(() => {
    const col = colRef.current
    if (!col) return
    const ro = new ResizeObserver(fitFont)
    ro.observe(col)
    fitFont()
    return () => ro.disconnect()
  }, [fitFont])

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [slides.length])

  // Fallback: no slides
  const text = statement || DEFAULT_STATEMENT

  if (!slides.length) {
    return (
      <section className="px-12 py-14 max-md:px-5 max-md:py-9">
        <p style={{ fontSize: 34, lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 400, maxWidth: '18ch', color: '#1a1a1a' }}>
          {text}
        </p>
      </section>
    )
  }

  return (
    <section
      className="flex max-md:flex-col"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
    >
      {/* Statement — left column, stretches to carousel height */}
      <div
        ref={colRef}
        className="max-md:hidden"
        style={{
          flex: '0 0 28%',
          // Without this a flex item can't shrink below its widest word, so a
          // large font makes this column swallow the row and starve the carousel.
          minWidth: 0,
          overflow: 'hidden',
          padding: `${COL_PAD_Y}px ${COL_PAD_X}px`,
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        <p
          ref={textRef}
          style={{
            fontSize,
            lineHeight: 1.08,
            letterSpacing: '-0.025em',
            fontWeight: 400,
            color: '#1a1a1a',
          }}
        >
          {text}
        </p>
      </div>

      {/* Mobile statement */}
      <div className="hidden max-md:block px-5 pt-9 pb-4">
        <p style={{ fontSize: 28, lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 400, color: '#1a1a1a' }}>
          {text}
        </p>
      </div>

      {/* Carousel */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{ height: 'min(58vh, 480px)', minHeight: carouselMinH > 0 ? carouselMinH : '180px', backgroundColor: '#f5f5f5' }}
      >
        {/* Matched to the statement's measured box so the image starts at the
            first line's top and ends at the last line's bottom. Falls back to
            filling the carousel on mobile, where the statement column is
            hidden and never measured. */}
        <div
          style={
            textH > 0
              ? { position: 'absolute', left: 0, right: 0, top: COL_PAD_Y, height: textH }
              : { position: 'absolute', inset: 0 }
          }
        >
          {slides.map((slide, i) => (
            <Link
              key={slide.id}
              href={slide.link_href}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: i === current ? 1 : 0,
                transition: 'opacity 700ms ease',
                pointerEvents: i === current ? 'auto' : 'none',
              }}
            >
              <Image
                src={slide.image_url}
                alt=""
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 100vw, 72vw"
                priority={i === 0}
              />
            </Link>
          ))}
        </div>

        {/* Dot indicators — pinned under the image box, not the taller carousel */}
        {slides.length > 1 && (
          <div
            className="absolute left-0 right-0 flex justify-center gap-[6px]"
            style={{ zIndex: 10, top: textH > 0 ? COL_PAD_Y + textH + 12 : undefined, bottom: textH > 0 ? undefined : 16 }}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                style={{
                  width: 5, height: 5,
                  borderRadius: '50%',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  backgroundColor: i === current ? '#1a1a1a' : 'rgba(0,0,0,0.2)',
                  transition: 'background-color 200ms',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
