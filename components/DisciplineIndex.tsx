'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@/lib/types'

const DISCIPLINE_ORDER: Project['category'][] = ['art', 'architecture', 'concept', 'venture']

const DISCIPLINE_LABELS: Record<Project['category'], string> = {
  art: 'Art',
  architecture: 'Architecture',
  concept: 'Concept',
  venture: 'Ventures',
}

const ROW_HEIGHT = 320
const GAP = 3

interface Tile {
  id: string
  slug: string
  title: string
  date: string
  thumb: string
  aspect: number
}

interface Row {
  height: number
  items: (Tile & { width: number })[]
}

/**
 * Justified rows: fill each row to the container, then scale its height so the
 * aspect ratios survive. A trailing incomplete row keeps the target height
 * instead of being stretched to fit — stretching one or two portrait thumbnails
 * across a wide container is what blows them up past 1000px tall.
 */
function justifyRows(items: Tile[], containerWidth: number, gap: number, targetH: number): Row[] {
  if (!containerWidth) {
    return [{ height: targetH, items: items.map((i) => ({ ...i, width: i.aspect * targetH })) }]
  }

  const rows: Row[] = []
  let row: Tile[] = []
  let aspectSum = 0

  for (const item of items) {
    row.push(item)
    aspectSum += item.aspect
    if (aspectSum * targetH + (row.length - 1) * gap >= containerWidth) {
      const avail = containerWidth - (row.length - 1) * gap
      const h = avail / aspectSum
      rows.push({ height: h, items: row.map((x) => ({ ...x, width: x.aspect * h })) })
      row = []
      aspectSum = 0
    }
  }

  if (row.length) {
    rows.push({ height: targetH, items: row.map((x) => ({ ...x, width: x.aspect * targetH })) })
  }

  return rows
}

function toTile(project: Project): Tile | null {
  const thumbnail = project.images?.find((i) => i.is_thumbnail) ?? project.images?.[0]
  if (!thumbnail || !thumbnail.width || !thumbnail.height) return null
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    date: project.date,
    thumb: thumbnail.url,
    aspect: thumbnail.width / thumbnail.height,
  }
}

interface Props {
  projects: Project[]
}

export default function DisciplineIndex({ projects }: Props) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = measureRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const groups = useMemo(() => {
    return DISCIPLINE_ORDER.map((category) => {
      const tiles = projects
        .filter((p) => p.category === category)
        .map(toTile)
        .filter((t): t is Tile => t !== null)
      return { category, tiles }
    })
      // A discipline with nothing in it would render as a bare heading.
      .filter((g) => g.tiles.length > 0)
      .map((g) => ({
        ...g,
        rows: justifyRows(g.tiles, width, GAP, ROW_HEIGHT),
      }))
  }, [projects, width])

  if (groups.length === 0) {
    return (
      <div className="px-12 py-8 max-md:px-5 text-center" style={{ color: '#888888', fontSize: '13px' }}>
        No projects yet.
      </div>
    )
  }

  return (
    // Top padding keeps the first discipline rule off the filter bar's own
    // border — without it the two hairlines read as one doubled line.
    <section className="px-12 pt-8 max-md:px-5 max-md:pt-6">
      <div ref={measureRef} style={{ width: '100%' }}>
        {groups.map(({ category, tiles, rows }) => (
          <div key={category} id={category} style={{ marginBottom: '36px' }}>
            {/* A discipline is wayfinding, not content — it sits at the same
                quiet level as the other section labels so the work can lead. */}
            <div
              className="flex items-baseline justify-between flex-wrap"
              style={{
                paddingBottom: '10px',
                marginBottom: '16px',
                gap: '16px',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <h2
                style={{
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  color: '#888888',
                  margin: 0,
                }}
              >
                — {DISCIPLINE_LABELS[category]}
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  color: '#888888',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                }}
              >
                {tiles.length} {tiles.length === 1 ? 'work' : 'works'}
              </span>
            </div>

            {rows.map((row, r) => (
              <div
                key={r}
                className="flex items-start"
                style={{ gap: `${GAP}px`, marginBottom: '22px' }}
              >
                {row.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${item.slug}`}
                    className="block group"
                    style={{ width: item.width, flexShrink: 0 }}
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{ width: '100%', height: row.height }}
                    >
                      <Image
                        src={item.thumb}
                        alt={item.title}
                        fill
                        sizes={`${Math.round(item.width)}px`}
                        className="object-cover transition-transform duration-[400ms] ease-in-out group-hover:scale-[1.03]"
                      />
                    </div>
                    {/* Persistent, not hover-only: the title is the work's own
                        voice, and a hover overlay is unreachable on touch. */}
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: 1.35,
                        color: '#1a1a1a',
                        margin: '10px 0 0',
                        transition: 'opacity 150ms',
                      }}
                      className="group-hover:opacity-60"
                    >
                      {item.title}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-jetbrains-mono)',
                        fontSize: '11px',
                        color: '#888888',
                        letterSpacing: '0.04em',
                        margin: '2px 0 0',
                      }}
                    >
                      {item.date}
                    </p>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
