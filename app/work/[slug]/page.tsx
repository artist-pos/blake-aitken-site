import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { getProjectBySlug, getAdjacentProjects } from '@/lib/queries'
import { projectMetadata } from '@/lib/metadata'
import MarkdownContent from '@/components/MarkdownContent'
import ThreeDViewerDynamic from '@/components/ThreeDViewerDynamic'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return {}
  return projectMetadata(project)
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const { prev, next } = await getAdjacentProjects(project.sort_order ?? 0)
  const images = (project.images ?? []).sort((a, b) => a.sort_order - b.sort_order)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description?.replace(/[#*_[\]]/g, '').slice(0, 160),
    image: images[0]?.url,
    creator: { '@type': 'Person', name: 'Blake Aitken' },
    dateCreated: project.date,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back */}
      <div className="px-12 pt-8 pb-0 max-md:px-5 max-md:pt-6">
        <Link
          href="/#works"
          style={{
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#888888',
            display: 'inline-block',
            marginBottom: '28px',
            transition: 'opacity 150ms',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.5')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        >
          ← Works
        </Link>
      </div>

      {/* Header row */}
      <div
        className="flex items-center justify-between px-12 py-4 max-md:px-5 max-md:flex-col max-md:items-start max-md:gap-2"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        <h1
          style={{
            fontSize: '15px',
            fontWeight: 400,
            fontStyle: 'italic',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: '#1a1a1a',
          }}
        >
          {project.title}
        </h1>
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#888888',
          }}
        >
          {project.category}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-jetbrains-mono)',
            fontSize: '11px',
            color: '#888888',
          }}
        >
          {project.date}
        </span>
      </div>

      {/* Main content */}
      <div className="px-12 py-12 max-md:px-5 max-md:py-8">
        <div className="flex gap-12 max-md:flex-col max-md:gap-8">
          {/* Images — 60% */}
          <div className="flex-[6] min-w-0">
            {images.length > 0 && (
              <div className="flex flex-col" style={{ gap: '2px' }}>
                {images.map((img) => (
                  <figure key={img.id} className="m-0">
                    <Image
                      src={img.url}
                      alt={img.alt ?? project.title}
                      width={img.width}
                      height={img.height}
                      className="w-full h-auto"
                      sizes="(max-width: 768px) 100vw, 60vw"
                    />
                    {img.alt && (
                      <figcaption
                        style={{
                          fontSize: '11px',
                          color: '#888888',
                          marginTop: '6px',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {img.alt}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </div>

          {/* Text — 40% */}
          <div className="flex-[4] min-w-0">
            {/* Metadata */}
            <div className="flex flex-col gap-3 mb-8">
              {project.date && (
                <div>
                  <span
                    style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888', display: 'block', marginBottom: '3px' }}
                  >
                    Year
                  </span>
                  <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '13px', color: '#1a1a1a' }}>
                    {project.date}
                  </span>
                </div>
              )}
              {project.category && (
                <div>
                  <span
                    style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888', display: 'block', marginBottom: '3px' }}
                  >
                    Category
                  </span>
                  <span style={{ fontSize: '13px', textTransform: 'capitalize', color: '#1a1a1a' }}>
                    {project.category}
                  </span>
                </div>
              )}
              {project.location && (
                <div>
                  <span
                    style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888', display: 'block', marginBottom: '3px' }}
                  >
                    Location
                  </span>
                  <span style={{ fontSize: '13px', color: '#1a1a1a' }}>{project.location}</span>
                </div>
              )}
              {project.tags.length > 0 && (
                <div>
                  <span
                    style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888', display: 'block', marginBottom: '6px' }}
                  >
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '11px',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          color: '#888888',
                          border: '1px solid rgba(0,0,0,0.12)',
                          padding: '2px 6px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {project.description && (
              <MarkdownContent content={project.description} />
            )}

            {/* 3D Viewer — future */}
            {project.model_url && (
              <div className="mt-8">
                <Suspense fallback={<div style={{ height: 400, backgroundColor: '#f0f0f0' }} />}>
                  <ThreeDViewerDynamic url={project.model_url} />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prev / Next */}
      <nav
        className="flex items-stretch justify-between px-12 py-6 max-md:px-5"
        style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
      >
        {prev ? (
          <Link
            href={`/work/${prev.slug}`}
            className="flex flex-col gap-1 hover:opacity-50 transition-opacity duration-150"
          >
            <span style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}>← Previous</span>
            <span style={{ fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{prev.title}</span>
          </Link>
        ) : (
          <div />
        )}

        {next && (
          <Link
            href={`/work/${next.slug}`}
            className="flex flex-col gap-1 text-right hover:opacity-50 transition-opacity duration-150"
          >
            <span style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}>Next →</span>
            <span style={{ fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{next.title}</span>
          </Link>
        )}
      </nav>
    </>
  )
}
