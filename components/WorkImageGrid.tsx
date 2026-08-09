'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { RowsPhotoAlbum } from 'react-photo-album'
import 'react-photo-album/rows.css'
import type { ProjectImage } from '@/lib/types'

const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false })

type WorkPhoto = ProjectImage & { src: string }

interface Props {
  images: ProjectImage[]
  projectTitle: string
  rowHeight?: number
  hGap?: number
  vGap?: number
  lastRow?: 'left' | 'center' | 'fill'
}

export default function WorkImageGrid({
  images,
  projectTitle,
  rowHeight = 300,
  hGap = 4,
  vGap = 4,
  lastRow = 'left',
}: Props) {
  const photos: WorkPhoto[] = images.map((img) => ({ ...img, src: img.url }))
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // 'stretch' is not a valid flex justify-content value — it falls back to
  // flex-start. 'space-between' spans the row edge to edge, making hGap a
  // minimum rather than an exact gap on the final row.
  const trackJustify =
    lastRow === 'center' ? 'center' : lastRow === 'fill' ? 'space-between' : 'flex-start'

  return (
    <div className="work-image-grid" style={{ position: 'relative' }}>
      <style>{`.work-image-grid .react-photo-album--track:last-child{justify-content:${trackJustify}}`}</style>
    <RowsPhotoAlbum
      photos={photos}
      targetRowHeight={rowHeight}
      spacing={hGap}
      componentsProps={{
        container: { style: { rowGap: `${vGap}px` } },
      }}
      render={{
        photo: (_, { photo, width, height, index }) => {
          const img = photo as WorkPhoto
          return (
            <figure
              key={img.id}
              style={{ width, height, position: 'relative', margin: 0, flexShrink: 0, overflow: 'hidden' }}
            >
              <Image
                src={img.url}
                alt={img.alt ?? projectTitle}
                fill
                sizes={`${Math.round(width)}px`}
                style={{ objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`Enlarge ${img.alt ?? `image ${index + 1}`}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  cursor: 'zoom-in',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              />
              {img.alt && (
                <figcaption
                  style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    padding: '20px 10px 7px',
                    fontSize: '10px',
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.92)',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)',
                    letterSpacing: '0.01em',
                    lineHeight: 1.4,
                  }}
                >
                  {img.alt}
                </figcaption>
              )}
            </figure>
          )
        },
      }}
    />
      {openIndex !== null && (
        <Lightbox
          images={images}
          index={openIndex}
          projectTitle={projectTitle}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </div>
  )
}
