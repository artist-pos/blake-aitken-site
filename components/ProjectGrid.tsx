'use client'

import Image from 'next/image'
import Link from 'next/link'
import { RowsPhotoAlbum } from 'react-photo-album'
import type { RenderPhotoProps } from 'react-photo-album'
import type { Project } from '@/lib/types'

interface GridPhoto {
  src: string
  width: number
  height: number
  key: string
  alt: string
  title: string
  category: string
  slug: string
}

interface Props {
  projects: Project[]
}

export default function ProjectGrid({ projects }: Props) {
  const photos: GridPhoto[] = projects.flatMap((project) => {
    const thumbnail =
      project.images?.find((i) => i.is_thumbnail) ??
      project.images?.[0]
    if (!thumbnail) return []
    return [
      {
        src: thumbnail.url,
        width: thumbnail.width,
        height: thumbnail.height,
        key: project.id,
        alt: thumbnail.alt ?? project.title,
        title: project.title,
        category: project.category,
        slug: project.slug,
      },
    ]
  })

  if (photos.length === 0) {
    return (
      <div className="px-12 py-16 max-md:px-5 text-center" style={{ color: '#888888', fontSize: '13px' }}>
        No projects yet.
      </div>
    )
  }

  return (
    <div className="px-12 py-8 max-md:px-5 max-md:py-5">
      <RowsPhotoAlbum
        photos={photos}
        targetRowHeight={(w) => (w < 768 ? 150 : w < 1024 ? 200 : 250)}
        spacing={2}
        render={{
          photo: (
            { onClick }: { onClick?: React.MouseEventHandler },
            { photo, width, height }: { photo: GridPhoto; width: number; height: number }
          ) => (
            <Link
              href={`/work/${photo.slug}`}
              className="relative block overflow-hidden group"
              style={{ width, height, flexShrink: 0 }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes={`${Math.round(width)}px`}
                className="object-cover"
                style={{
                  transition: 'transform 400ms ease',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                }}
              />
              {/* Overlay */}
              <div
                className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                  transition: 'opacity 250ms',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: '#ffffff',
                      lineHeight: 1.3,
                    }}
                  >
                    {photo.title}
                  </p>
                  <p
                    style={{
                      fontSize: '11px',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {photo.category}
                  </p>
                </div>
              </div>
            </Link>
          ),
        }}
      />
    </div>
  )
}
