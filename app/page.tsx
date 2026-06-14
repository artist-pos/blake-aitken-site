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
              <Link
                href="https://www.linkedin.com/in/blake-aitken-558254246/"
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
                → LinkedIn
              </Link>
              <Link
                href="https://www.instagram.com/blakaitken"
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
                → Instagram
              </Link>
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
