import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { infoMetadata } from '@/lib/metadata'

export const metadata: Metadata = infoMetadata()

const BIO_TEXT = [
  "I’m a public artist and architectural graduate (BAS, University of Auckland, 2023) based in Hamilton, Aotearoa New Zealand.",
  "My work sits across public art, architecture, and strategy. Completed public works include You’ve Walked Past Me So Many Times, a guerrilla installation of 100 reclaimed road cones in Te Komititanga Square that drew 2,500 QR conversions and national media coverage, and 90 Minutes in Te Komititanga Square, a ten-edition LiDAR print and digital series curated for individual Auckland patrons. Cost of Passage / Utu o te Haerenga, a commissioned public artwork for Karangahape Road developed with ten charity partners, is forthcoming.",
  "Alongside my art practice, I am the solo founder of Patronage, the only platform in Aotearoa aggregating arts commissioning opportunities in one place. I designed and built the entire system, connecting artists with paid work across the corporate and public sectors and providing the infrastructure for organisations to source, commission, deliver, and report on art projects. Patronage has been recognised by Manatū Taonga and added to Creative New Zealand’s regional partner network.",
  "My architectural work includes Tofā Mamao, a thesis project designing a funerary complex for the village of Utulaelae in Samoa that reinterprets diaspora death customs through vernacular architecture and reef burial typologies, and Black River Reclamation, a campus intervention replacing a segment of Symonds Street with a native wetland and student performance landscape. I maintain a residential practice, delivering building consent documentation for private clients in the Waikato.",
  "I also maintain an oil painting practice and have developed speculative strategic pitches for brands including Lion, Fix & Fogg, Halter, and Dosh. Across all work, I treat public space as something people are invited to make, not just move through.",
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
            <dl
              className="flex flex-col gap-4 mb-10"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '32px' }}
            >
              {[
                ['Location', 'Kirikiriroa (Hamilton), Aotearoa New Zealand'],
                ['Education', 'Bachelor of Architectural Studies, University of Auckland, 2023'],
                ['Practice', 'Public Art, Architecture, Urban Strategy'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt
                    style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888', marginBottom: '3px' }}
                  >
                    {label}
                  </dt>
                  <dd style={{ margin: 0, fontSize: '13px', color: '#1a1a1a' }}>{value}</dd>
                </div>
              ))}
            </dl>

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

            {/* Links — same 4 as contact section */}
            <div className="flex flex-col gap-3">
              <Link
                href="https://patronage.nz/blakeaitken"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a' }}
                className="hover:opacity-50 transition-opacity duration-150"
              >
                → Patronage
              </Link>
              <Link
                href="https://www.instagram.com/blakaitken"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a' }}
                className="hover:opacity-50 transition-opacity duration-150"
              >
                → Instagram
              </Link>
              <Link
                href="https://www.linkedin.com/in/blake-aitken-558254246/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a' }}
                className="hover:opacity-50 transition-opacity duration-150"
              >
                → LinkedIn
              </Link>
              <details>
                <summary
                  style={{
                    fontSize: '12px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#1a1a1a',
                    cursor: 'pointer',
                    listStyle: 'none',
                  }}
                  className="hover:opacity-50 transition-opacity duration-150"
                >
                  → Phone
                </summary>
                <span
                  style={{
                    fontFamily: 'var(--font-jetbrains-mono)',
                    fontSize: '12px',
                    color: '#888888',
                    display: 'block',
                    marginTop: '4px',
                    paddingLeft: '12px',
                  }}
                >
                  +64 27 536 4850
                </span>
              </details>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
