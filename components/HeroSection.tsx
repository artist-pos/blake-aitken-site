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

export default function HeroSection({ slides, statement }: Props) {
  const [current, setCurrent]       = useState(0)
  const [fontSize, setFontSize]     = useState(MIN_FONT)
  const [carouselMinH, setCarouselMinH] = useState(0)
  const colRef  = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  const fitFont = useCallback(() => {
    const col  = colRef.current
    const text = textRef.current
    if (!col || !text) return
    const H = col.clientHeight
    if (H < 10) return

    // Measure how tall the text is at the minimum font size
    text.style.fontSize = `${MIN_FONT}px`
    const minH = text.scrollHeight

    if (minH > H) {
      // Column too short for MIN_FONT — expand carousel to fit
      setCarouselMinH(minH)
      setFontSize(MIN_FONT)
      return
    }

    // Normal fit: binary search, floor at MIN_FONT
    setCarouselMinH(0)
    let lo = MIN_FONT, hi = 240
    text.style.fontSize = `${hi}px`
    if (text.scrollHeight <= H) { setFontSize(hi); return }
    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2
      text.style.fontSize = `${mid}px`
      if (text.scrollHeight <= H) lo = mid
      else hi = mid
    }
    setFontSize(Math.floor(lo))
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
          borderRight: '1px solid rgba(0,0,0,0.08)',
          padding: '40px 40px',
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

        {/* Dot indicators */}
        {slides.length > 1 && (
          <div
            className="absolute bottom-4 left-0 right-0 flex justify-center gap-[6px]"
            style={{ zIndex: 10 }}
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
