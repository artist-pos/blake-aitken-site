import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { infoMetadata } from '@/lib/metadata'

export const metadata: Metadata = infoMetadata()

const BIO_TEXT = [
  'I design civic systems that make invisible social contracts visible.',
  'Working at the intersection of architecture, public art, and strategy, my practice treats the city as both medium and audience. I use infrastructure, signage, ritual, and public behaviour to expose how value, care, belief, and responsibility are organised — and often obscured — in contemporary urban life.',
  'My work is not representational. It intervenes directly in behaviour. Each project is conceived as a closed system: planned, modelled, fabricated, deployed, and documented so its social effects can be observed rather than assumed. Architectural training underpins this approach, grounding speculative ideas in material reality, scale, and execution.',
  'My practice is rooted in public art as a form of urban accountability. Projects such as 90 Minutes in Te Komititanga Square, You\'ve Walked Past Me So Many Times, and Cost of Passage / Utu o te Haerenga reframe everyday civic infrastructure as sites of participation, friction, and shared responsibility — inviting the public to complete the work through movement, attention, and choice.',
  'Alongside this practice, I am developing Patronage — an ongoing, ever-evolving platform that explores new economic models for funding, owning, and circulating public art. Patronage is both a tool and a long-term ambition: a system I am actively working toward, testing through live projects, partnerships, and real-world constraints.',
  'Across all work, I use technology — LiDAR scanning, digital modelling, fabrication systems, and networked platforms — as a means to render invisible structures legible, measurable, and open to critique.',
]

export default function InfoPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Blake Aitken',
    jobTitle: 'Public Artist & Architectural Designer',
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Auckland' },
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blakeaitken.com',
    address: { '@type': 'PostalAddress', addressLocality: 'Hamilton', addressRegion: 'Waikato', addressCountry: 'NZ' },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="px-12 py-12 max-md:px-5 max-md:py-8">
        <h1
          style={{
            fontSize: '11px',
            fontWeight: 400,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#888888',
            marginBottom: '32px',
          }}
        >
          — Info
        </h1>

        <div className="grid grid-cols-2 gap-16 max-md:grid-cols-1 max-md:gap-8">
          {/* Left — image */}
          <div>
            <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', backgroundColor: '#e8e8e8' }}>
              <Image
                src="/assets/personal/my-mothers-mother.jpg"
                alt="Blake Aitken"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 45vw"
              />
            </div>
          </div>

          {/* Right — bio + facts */}
          <div>
            {/* Facts */}
            <div className="flex flex-col gap-4 mb-10" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '32px' }}>
              {[
                ['Location', 'Kirikiriroa (Hamilton), Aotearoa New Zealand'],
                ['Education', 'Bachelor of Architectural Studies, University of Auckland, 2023'],
                ['Practice', 'Public Art, Architecture, Urban Strategy'],
              ].map(([label, value]) => (
                <div key={label}>
                  <span
                    style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888', display: 'block', marginBottom: '3px' }}
                  >
                    {label}
                  </span>
                  <span style={{ fontSize: '13px', color: '#1a1a1a' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Bio paragraphs */}
            <div className="flex flex-col gap-4 mb-10">
              {BIO_TEXT.map((para, i) => (
                <p
                  key={i}
                  style={{ fontSize: '15px', lineHeight: 1.7, color: '#1a1a1a' }}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Links */}
            <div className="flex flex-col gap-3">
              <Link
                href="https://patronage.nz/blakeaitken"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a', transition: 'opacity 150ms' }}
                className="hover:opacity-50 transition-opacity duration-150"
              >
                → Patronage
              </Link>
              <Link
                href="https://www.instagram.com/blakaitken"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a', transition: 'opacity 150ms' }}
                className="hover:opacity-50 transition-opacity duration-150"
              >
                → Instagram
              </Link>
              <Link
                href="https://www.linkedin.com/in/blake-aitken-558254246/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a', transition: 'opacity 150ms' }}
                className="hover:opacity-50 transition-opacity duration-150"
              >
                → LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
