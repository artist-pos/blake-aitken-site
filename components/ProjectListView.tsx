import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@/lib/types'

interface Props {
  projects: Project[]
}

export default function ProjectListView({ projects }: Props) {
  return (
    <div className="px-12 py-8 max-md:px-5 max-md:py-5">
      {projects.map((project, i) => {
        const thumbnail =
          project.images?.find((img) => img.is_thumbnail) ?? project.images?.[0]
        return (
          <Link
            key={project.id}
            href={`/work/${project.slug}`}
            className="flex items-center gap-5 py-4 group"
            style={{
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              borderTop: i === 0 ? '1px solid rgba(0,0,0,0.08)' : undefined,
            }}
          >
            {/* Index */}
            <span
              style={{
                fontFamily: 'var(--font-jetbrains-mono)',
                fontSize: '11px',
                color: '#888888',
                width: '24px',
                flexShrink: 0,
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>

            {/* Thumbnail */}
            {thumbnail && (
              <div className="relative overflow-hidden flex-shrink-0" style={{ width: 64, height: 48 }}>
                <Image
                  src={thumbnail.url}
                  alt={thumbnail.alt ?? project.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Title */}
            <div className="flex-1 min-w-0">
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: '#1a1a1a',
                  transition: 'opacity 150ms',
                }}
                className="group-hover:opacity-50 truncate"
              >
                {project.title}
              </p>
            </div>

            {/* Category + date */}
            <div className="hidden md:flex items-center gap-8 flex-shrink-0">
              <span
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.06em',
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
          </Link>
        )
      })}
    </div>
  )
}
