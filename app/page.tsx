import type { Metadata } from 'next'
import { getFeaturedProject, getProjects, getRecentPosts } from '@/lib/queries'
import { homeMetadata } from '@/lib/metadata'
import FeaturedWork from '@/components/FeaturedWork'
import ProjectSection from '@/components/ProjectSection'
import BlogSection from '@/components/BlogSection'
import ContactForm from '@/components/ContactForm'
import Link from 'next/link'

export const metadata: Metadata = homeMetadata()

export default async function HomePage() {
  const [featuredProject, allProjects, recentPosts] = await Promise.all([
    getFeaturedProject(),
    getProjects(),
    getRecentPosts(3),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Blake Aitken',
    jobTitle: 'Public Artist & Architectural Designer',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blakeaitken.com',
    sameAs: [
      'https://www.instagram.com/blakaitken',
      'https://www.linkedin.com/in/blake-aitken-558254246/',
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Statement */}
      <section
        className="px-12 py-14 max-md:px-5 max-md:py-9"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        <p
          style={{
            fontSize: '34px',
            lineHeight: 1.18,
            letterSpacing: '-0.02em',
            fontWeight: 400,
            maxWidth: '18ch',
            margin: 0,
            color: '#1a1a1a',
          }}
        >
          I design civic systems that make invisible social contracts visible.
        </p>
      </section>

      {/* Featured Work */}
      {featuredProject && <FeaturedWork project={featuredProject} />}

      {/* Portfolio Grid with Filter */}
      <ProjectSection projects={allProjects} />

      {/* Blog preview */}
      <BlogSection posts={recentPosts} />

      {/* Contact */}
      <section id="contact" className="px-12 py-16 max-md:px-5 max-md:py-10" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="grid grid-cols-2 gap-16 max-md:grid-cols-1 max-md:gap-10">
          {/* Left */}
          <div>
            <h2
              style={{
                fontSize: '11px',
                fontWeight: 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#888888',
                marginBottom: '16px',
              }}
            >
              — Contact
            </h2>
            <p
              style={{
                fontSize: '24px',
                fontWeight: 500,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#1a1a1a',
                lineHeight: 1.2,
                marginBottom: '20px',
              }}
            >
              Get in Touch
            </p>
            <p style={{ fontSize: '14px', color: '#888888', lineHeight: 1.6, marginBottom: '32px', maxWidth: '320px' }}>
              For commissions, collaborations, speaking, or press enquiries.
            </p>
            <div className="flex flex-col gap-3">
              {[
                ['https://patronage.nz/blakeaitken', '→ Patronage'],
                ['https://www.instagram.com/blakaitken', '→ Instagram'],
                ['https://www.linkedin.com/in/blake-aitken-558254246/', '→ LinkedIn'],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#1a1a1a',
                    transition: 'opacity 150ms',
                  }}
                  className="hover:opacity-50 transition-opacity duration-150"
                >
                  {label}
                </Link>
              ))}
              <details>
                <summary
                  style={{
                    fontSize: '12px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#1a1a1a',
                    cursor: 'pointer',
                    listStyle: 'none',
                    transition: 'opacity 150ms',
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
                    marginTop: '6px',
                    paddingLeft: '14px',
                  }}
                >
                  +64 27 536 4850
                </span>
              </details>
            </div>
          </div>

          {/* Right — form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
