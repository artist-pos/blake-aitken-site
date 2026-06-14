'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@/lib/types'

interface Props {
  projects: Project[]
}

export default function ProjectGrid({ projects }: Props) {
  if (projects.length === 0) {
    return (
      <div className="px-12 py-8 max-md:px-5 text-center" style={{ color: '#888888', fontSize: '13px' }}>
        No projects yet.
      </div>
    )
  }

  return (
    <div
      className="px-12 pt-6 pb-0 max-md:px-5"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
        columnGap: '2px',
        rowGap: 0,
      }}
    >
      {projects.map((project) => {
        const thumbnail = project.images?.find((i) => i.is_thumbnail) ?? project.images?.[0]
        return (
          <Link
            key={project.id}
            href={`/work/${project.slug}`}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <figure style={{ margin: 0 }}>
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                  backgroundColor: '#e8e8e8',
                }}
              >
                {thumbnail && (
                  <Image
                    src={thumbnail.url}
                    alt={thumbnail.alt ?? project.title}
                    fill
                    sizes="(max-width: 560px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover"
                    style={{ transition: 'transform 400ms ease' }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                    }}
                  />
                )}
              </div>
              <figcaption
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '10px',
                  padding: '10px 2px 16px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    color: '#1a1a1a',
                  }}
                >
                  {project.title}
                </span>
                {project.date && (
                  <span
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono)',
                      fontSize: '11px',
                      color: '#888888',
                      flexShrink: 0,
                    }}
                  >
                    {project.date}
                  </span>
                )}
              </figcaption>
            </figure>
          </Link>
        )
      })}
    </div>
  )
}
