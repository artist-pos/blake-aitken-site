import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@/lib/types'

interface Props {
  project: Project
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      style={{
        fontSize: '11px',
        fontWeight: 400,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#888888',
        marginBottom: '16px',
      }}
    >
      — {children}
    </p>
  )
}

export default function FeaturedWork({ project }: Props) {
  const images = (project.images ?? []).sort((a, b) => a.sort_order - b.sort_order)
  const mainImage = images[0]
  const sideImages = images.slice(1, 3)

  return (
    <section className="px-12 pt-12 pb-16 max-md:px-5 max-md:pt-8 max-md:pb-10">
      <SectionLabel>Featured Work</SectionLabel>

      <Link href={`/work/${project.slug}`} className="block group">
        {/* Image grid */}
        <div className="flex gap-0.5" style={{ gap: '2px' }}>
          {/* Main image — left, 16/10 */}
          {mainImage && (
            <div
              className="relative overflow-hidden flex-[3]"
              style={{ aspectRatio: '16/10' }}
            >
              <Image
                src={mainImage.url}
                alt={mainImage.alt ?? project.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 65vw"
                className="object-cover transition-transform duration-[400ms] ease-in-out group-hover:scale-[1.03]"
              />
              {project.model_url && (
                <span
                  className="absolute top-3 left-3 px-2 py-1 text-white"
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    backgroundColor: '#000',
                  }}
                >
                  3D Environment Available
                </span>
              )}
            </div>
          )}

          {/* Side images — right, stacked */}
          {sideImages.length > 0 && (
            <div className="flex flex-col flex-1 max-md:hidden" style={{ gap: '2px' }}>
              {sideImages.map((img) => (
                <div
                  key={img.id}
                  className="relative overflow-hidden flex-1"
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? project.title}
                    fill
                    sizes="(max-width: 1440px) 20vw"
                    className="object-cover transition-transform duration-[400ms] ease-in-out group-hover:scale-[1.03]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              style={{
                fontSize: '15px',
                fontWeight: 500,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#1a1a1a',
              }}
            >
              {project.title}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-right">
            {project.date && (
              <span
                style={{
                  fontFamily: 'var(--font-jetbrains-mono)',
                  fontSize: '11px',
                  color: '#888888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {project.date}
              </span>
            )}
            {project.category && (
              <span
                style={{
                  fontSize: '11px',
                  color: '#888888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {project.category}
              </span>
            )}
            {project.location && (
              <span
                style={{
                  fontSize: '11px',
                  color: '#888888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {project.location}
              </span>
            )}
          </div>
        </div>
      </Link>
    </section>
  )
}
