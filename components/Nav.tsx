'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const links = [
  { href: '/#works', label: 'Works' },
  { href: '/info', label: 'Info' },
  { href: '/#contact', label: 'Contact' },
]

export default function Nav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header
      className="sticky top-0 z-50 border-b transition-shadow duration-200"
      style={{
        borderColor: 'rgba(0,0,0,0.08)',
        backgroundColor: '#f5f5f5',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div className="flex items-center justify-between px-12 py-3 max-md:px-5">
        {/* Wordmark */}
        <Link href="/" className="flex flex-col gap-1">
          <span
            style={{
              fontSize: '15px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#1a1a1a',
              lineHeight: 1.2,
            }}
          >
            Blake Aitken
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#888888',
              lineHeight: 1.3,
            }}
          >
            Public Artist &amp; Architectural Designer
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-opacity duration-150 hover:opacity-50"
              style={{
                fontSize: '13px',
                fontWeight: 400,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#1a1a1a',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-1"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span
            className="block w-5 h-px bg-current transition-transform duration-200"
            style={{ transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none' }}
          />
          <span
            className="block w-5 h-px bg-current transition-opacity duration-200"
            style={{ opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="block w-5 h-px bg-current transition-transform duration-200"
            style={{ transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="md:hidden border-t px-5 py-4 flex flex-col gap-4"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: '13px',
                fontWeight: 400,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#1a1a1a',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
