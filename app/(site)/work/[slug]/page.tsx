import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { getProjectBySlug, getAdjacentProjects, getProjectDevelopments } from '@/lib/queries'
import { projectMetadata } from '@/lib/metadata'
import MarkdownContent from '@/components/MarkdownContent'
import ThreeDViewerDynamic from '@/components/ThreeDViewerDynamic'
import WorkLayoutShell from '@/components/WorkLayoutShell'
import ProjectDevelopmentSection from '@/components/ProjectDevelopmentSection'
import { createClient } from '@/lib/supabase/server'

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
  const [project, supabase] = await Promise.all([getProjectBySlug(slug), createClient()])
  if (!project) notFound()

  const [{ prev, next }, { data: { user } }, developments] = await Promise.all([
    getAdjacentProjects(project.sort_order ?? 0),
    supabase.auth.getUser(),
    getProjectDevelopments(project.id),
  ])
  const isAdmin = user?.email === 'blakeaitkenwork@gmail.com'
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
          className="transition-opacity duration-150 hover:opacity-50"
          style={{
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#888888',
            display: 'inline-block',
            marginBottom: '28px',
          }}
        >
          ← Works
        </Link>
      </div>

      {/* Header row — mirrors the 6/4 column split below */}
      <div
        className="flex items-center px-12 gap-12 py-4 max-md:px-5 max-md:flex-col max-md:items-start max-md:gap-1"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        {/* Left: title + location — same width as image column */}
        <div className="flex-[6] min-w-0 flex items-center justify-between gap-4 max-md:flex-col max-md:items-start max-md:gap-1">
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
          {project.location && (
            <span style={{ fontSize: '11px', letterSpacing: '0.04em', color: '#888888', flexShrink: 0 }}>
              {project.location}
            </span>
          )}
        </div>

        {/* Right: date — same width as text column */}
        <div className="flex-[4] min-w-0 max-md:hidden">
          <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px', color: '#888888' }}>
            {project.date}
          </span>
        </div>

        {/* Date on mobile */}
        <span className="hidden max-md:block" style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px', color: '#888888' }}>
          {project.date}
        </span>
      </div>

      {/* Main content */}
      <div className="px-12 py-12 max-md:px-5 max-md:py-8">
        <div className="flex gap-12 max-md:flex-col max-md:gap-8">
          {/* Images — 60% */}
          <div className="flex-[6] min-w-0">
            {images.length > 0 && (
              <WorkLayoutShell
                images={images}
                projectTitle={project.title}
                projectId={project.id}
                slug={project.slug}
                isAdmin={isAdmin}
                initial={{
                  rowHeight: project.grid_row_height,
                  hGap: project.grid_h_gap,
                  vGap: project.grid_v_gap,
                  lastRow: project.grid_last_row,
                }}
              />
            )}
          </div>

          {/* Text — 40% */}
          <div className="flex-[4] min-w-0">
            {/* Metadata */}
            <div className="flex flex-col gap-3 mb-8">
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

      {/* Development log */}
      <ProjectDevelopmentSection entries={developments} />

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
