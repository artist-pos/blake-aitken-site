'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable'
import { reorderProjects } from '@/app/actions/reorderProjects'
import DisciplineLayoutBar, { type GridLayout } from './DisciplineLayoutBar'
import type { CategoryLayout, Discipline, Project } from '@/lib/types'

const DISCIPLINE_ORDER: Discipline[] = [
  'art',
  'architecture',
  'concept',
  'venture',
  'university',
]

const DISCIPLINE_LABELS: Record<Discipline, string> = {
  art: 'Art',
  architecture: 'Architecture',
  concept: 'Concept',
  venture: 'Ventures',
  university: 'University',
}

const DEFAULT_LAYOUT: GridLayout = { rowHeight: 320, hGap: 3, vGap: 22, lastRow: 'left' }

interface Tile {
  id: string
  slug: string
  title: string
  date: string
  thumb: string
  aspect: number
}

interface PlacedTile extends Tile {
  width: number
}

interface Row {
  height: number
  items: PlacedTile[]
  /** A trailing row that was left at the target height rather than justified. */
  incomplete: boolean
}

// Widths are fractional, and a row is justified to exactly the container width.
// Rounding up on even one tile overshoots the container and hands Chrome a
// horizontal scrollbar for the whole page, so always round down: the row falls
// a pixel or two short instead, which is invisible.
const atHeight = (t: Tile, h: number) => ({ ...t, width: Math.floor(t.aspect * h) })

/**
 * Justified rows: fill each row to the container, then scale its height so the
 * aspect ratios survive.
 *
 * A trailing incomplete row always keeps the target height. Scaling it to fill
 * the width instead is what blows a lone portrait up past 1000px tall — so
 * 'fill' spreads the tiles apart at their natural height rather than stretching
 * them, matching what the same control does on a work page.
 */
function justifyRows(items: Tile[], containerWidth: number, gap: number, targetH: number): Row[] {
  if (!containerWidth) {
    return [{ height: targetH, items: items.map((i) => atHeight(i, targetH)), incomplete: true }]
  }

  const rows: Row[] = []
  let row: Tile[] = []
  let aspectSum = 0

  for (const item of items) {
    row.push(item)
    aspectSum += item.aspect
    if (aspectSum * targetH + (row.length - 1) * gap >= containerWidth) {
      const h = (containerWidth - (row.length - 1) * gap) / aspectSum
      rows.push({ height: h, items: row.map((x) => atHeight(x, h)), incomplete: false })
      row = []
      aspectSum = 0
    }
  }

  if (row.length) {
    rows.push({ height: targetH, items: row.map((x) => atHeight(x, targetH)), incomplete: true })
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

/**
 * Reconciles a saved drag order against the tiles actually on screen: keeps the
 * admin's order for anything still present, and appends anything new in its
 * server-given position. Without this, a project added or recategorised after a
 * drag would vanish from the grid until reload.
 */
function applyOrder(tiles: Tile[], order: string[] | undefined): Tile[] {
  if (!order?.length) return tiles
  const byId = new Map(tiles.map((t) => [t.id, t]))
  const ordered = order.map((id) => byId.get(id)).filter((t): t is Tile => t !== undefined)
  const seen = new Set(ordered.map((t) => t.id))
  return [...ordered, ...tiles.filter((t) => !seen.has(t.id))]
}

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 400,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  lineHeight: 1,
  color: '#888888',
  margin: 0,
}

const metaStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#888888',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  flexShrink: 0,
}

interface Props {
  projects: Project[]
  isAdmin?: boolean
  layouts?: CategoryLayout[]
}

export default function DisciplineIndex({ projects, isAdmin = false, layouts = [] }: Props) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [orders, setOrders] = useState<Partial<Record<Discipline, string[]>>>({})

  const savedLayouts = useMemo(() => {
    const map = {} as Record<Discipline, GridLayout>
    for (const d of DISCIPLINE_ORDER) map[d] = DEFAULT_LAYOUT
    for (const l of layouts) {
      map[l.category] = {
        rowHeight: l.row_height,
        hGap: l.h_gap,
        vGap: l.v_gap,
        lastRow: l.last_row,
      }
    }
    return map
  }, [layouts])

  // Local overrides let the slider re-justify the grid live, before saving.
  const [draftLayouts, setDraftLayouts] = useState<Partial<Record<Discipline, GridLayout>>>({})

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
      const tiles = applyOrder(
        projects
          .filter((p) => p.category === category)
          .map(toTile)
          .filter((t): t is Tile => t !== null),
        orders[category]
      )
      return { category, tiles, layout: draftLayouts[category] ?? savedLayouts[category] }
    })
      // A discipline with nothing in it would render as a bare heading.
      .filter((g) => g.tiles.length > 0)
      .map((g) => ({
        ...g,
        rows: justifyRows(g.tiles, width, g.layout.hGap, g.layout.rowHeight),
      }))
  }, [projects, width, orders, draftLayouts, savedLayouts])

  if (groups.length === 0) {
    return (
      <div
        className="px-12 py-8 max-md:px-5 text-center"
        style={{ color: '#888888', fontSize: '13px' }}
      >
        No projects yet.
      </div>
    )
  }

  return (
    // Top padding keeps the first discipline rule clear of the works header.
    <section className="px-12 pt-8 max-md:px-5 max-md:pt-6">
      <div ref={measureRef} style={{ width: '100%' }}>
        {groups.map(({ category, tiles, rows, layout }) => (
          <DisciplineGroup
            key={category}
            category={category}
            tiles={tiles}
            rows={rows}
            layout={layout}
            isAdmin={isAdmin}
            onLayoutChange={(next) => setDraftLayouts((d) => ({ ...d, [category]: next }))}
            onReorder={(ids) => setOrders((o) => ({ ...o, [category]: ids }))}
          />
        ))}
      </div>
    </section>
  )
}

interface GroupProps {
  category: Discipline
  tiles: Tile[]
  rows: Row[]
  layout: GridLayout
  isAdmin: boolean
  onLayoutChange: (layout: GridLayout) => void
  onReorder: (ids: string[]) => void
}

function DisciplineGroup({
  category,
  tiles,
  rows,
  layout,
  isAdmin,
  onLayoutChange,
  onReorder,
}: GroupProps) {
  const [showLayout, setShowLayout] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // A drag that ends on a tile still fires a click on the way up in some
  // browsers; without this the admin would be navigated away mid-reorder.
  const dragEndedAt = useRef(0)
  const suppressClick = useCallback((e: React.MouseEvent) => {
    if (Date.now() - dragEndedAt.current < 250) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  const sensors = useSensors(
    // A plain click must still follow the link, so require real movement first.
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    // Long-press on touch, so the page can still be scrolled over the grid.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  )

  const activeTile = activeId ? rows.flatMap((r) => r.items).find((i) => i.id === activeId) : null
  const activeRowHeight = activeId
    ? rows.find((r) => r.items.some((i) => i.id === activeId))?.height
    : undefined

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    dragEndedAt.current = Date.now()
    setActiveId(null)
    setOverId(null)
    if (!over || active.id === over.id) return

    const ids = tiles.map((t) => t.id)
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from < 0 || to < 0) return

    const next = arrayMove(ids, from, to)
    onReorder(next)
    setError(null)
    startTransition(async () => {
      try {
        await reorderProjects(next)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save order')
        onReorder(ids)
      }
    })
  }

  const activeIndex = activeId ? tiles.findIndex((t) => t.id === activeId) : -1
  const overIndex = overId ? tiles.findIndex((t) => t.id === overId) : -1

  const grid = rows.map((row, r) => (
    <div
      key={r}
      className="flex items-start"
      style={{
        gap: `${layout.hGap}px`,
        // Not on the last row: the discipline's own bottom margin already
        // separates it from the next heading, and doubling them is what made
        // the vertical rhythm look off.
        marginBottom: r === rows.length - 1 ? 0 : `${layout.vGap}px`,
        // 'space-between' spreads a short trailing row edge to edge without
        // scaling it, which makes hGap a minimum rather than an exact gap.
        justifyContent: !row.incomplete
          ? 'flex-start'
          : layout.lastRow === 'center'
            ? 'center'
            : layout.lastRow === 'fill'
              ? 'space-between'
              : 'flex-start',
      }}
    >
      {row.items.map((item) => {
        const shared = {
          item,
          height: row.height,
          // The caret shows where the tile lands: past its origin it slots after
          // the hovered tile, before its origin it slots in front.
          caret:
            overId === item.id && activeId !== null && activeId !== item.id
              ? activeIndex < overIndex
                ? ('after' as const)
                : ('before' as const)
              : null,
        }
        return isAdmin ? (
          <SortableTile key={item.id} {...shared} dimmed={activeId === item.id} onClick={suppressClick} />
        ) : (
          <TileLink key={item.id} {...shared} />
        )
      })}
    </div>
  ))

  return (
    <div id={category} style={{ marginBottom: '36px' }}>
      {/* A discipline is wayfinding, not content — it sits at the same quiet
          level as the other section labels so the work can lead. */}
      <div
        className="flex items-baseline justify-between flex-wrap"
        style={{
          paddingBottom: '10px',
          marginBottom: '16px',
          gap: '16px',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <h2 style={labelStyle}>— {DISCIPLINE_LABELS[category]}</h2>
        <div className="flex items-baseline gap-4">
          {isAdmin && error && (
            <span style={{ ...metaStyle, color: '#cc0000' }}>{error}</span>
          )}
          {isAdmin && !error && pending && <span style={metaStyle}>Saving order…</span>}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowLayout((s) => !s)}
              style={{ ...metaStyle, color: showLayout ? '#1a1a1a' : '#888888', cursor: 'pointer' }}
            >
              {showLayout ? 'Close layout' : 'Layout'}
            </button>
          )}
          <span style={metaStyle}>
            {tiles.length} {tiles.length === 1 ? 'work' : 'works'}
          </span>
        </div>
      </div>

      {isAdmin && showLayout && (
        <DisciplineLayoutBar category={category} layout={layout} onChange={onLayoutChange} />
      )}

      {isAdmin ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
          onDragOver={(e: DragOverEvent) => setOverId(e.over ? String(e.over.id) : null)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            dragEndedAt.current = Date.now()
            setActiveId(null)
            setOverId(null)
          }}
        >
          {/* No sorting strategy: the rows are justified to variable widths, so
              dnd-kit's grid transforms would shuffle tiles into positions the
              layout never produces. The insertion caret carries the feedback
              instead, and the grid re-justifies once on drop. */}
          <SortableContext items={tiles.map((t) => t.id)} strategy={() => null}>
            {grid}
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeTile && activeRowHeight ? (
              <div
                style={{
                  width: activeTile.width,
                  height: activeRowHeight,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'grabbing',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
                }}
              >
                <Image
                  src={activeTile.thumb}
                  alt=""
                  fill
                  sizes={`${Math.round(activeTile.width)}px`}
                  style={{ objectFit: 'cover' }}
                  draggable={false}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        grid
      )}
    </div>
  )
}

interface TileProps {
  item: PlacedTile
  height: number
  caret: 'before' | 'after' | null
}

function TileBody({ item, height, caret }: TileProps) {
  return (
    <>
      <div className="relative overflow-hidden" style={{ width: '100%', height }}>
        <Image
          src={item.thumb}
          alt={item.title}
          fill
          // 1.5x the box, so the tile still resolves on a scaled or retina
          // display. An honest `${width}px` lands the browser on a candidate at
          // almost exactly 1:1, which is where detail in the work starts to go.
          sizes={`${Math.round(item.width * 1.5)}px`}
          quality={90}
          className="object-cover transition-transform duration-[400ms] ease-in-out group-hover:scale-[1.03]"
          draggable={false}
        />
        {caret && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              [caret === 'before' ? 'left' : 'right']: 0,
              width: '3px',
              backgroundColor: '#1a1a1a',
            }}
          />
        )}
      </div>
      {/* Persistent, not hover-only: the title is the work's own voice, and a
          hover overlay is unreachable on touch. */}
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
    </>
  )
}

function TileLink(props: TileProps) {
  return (
    <Link
      href={`/${props.item.slug}`}
      className="block group"
      style={{ width: props.item.width, flexShrink: 0 }}
    >
      <TileBody {...props} />
    </Link>
  )
}

function SortableTile({
  dimmed,
  onClick,
  ...props
}: TileProps & { dimmed: boolean; onClick: (e: React.MouseEvent) => void }) {
  // Only the listeners: dnd-kit's `attributes` would put role="button" and a
  // tab stop on a wrapper that already contains a link, and with no keyboard
  // sensor wired up they buy nothing.
  const { listeners, setNodeRef, isDragging } = useSortable({ id: props.item.id })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      style={{
        width: props.item.width,
        flexShrink: 0,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'manipulation',
        opacity: dimmed ? 0.25 : 1,
      }}
    >
      <Link
        href={`/${props.item.slug}`}
        className="block group"
        draggable={false}
        onClickCapture={onClick}
      >
        <TileBody {...props} />
      </Link>
    </div>
  )
}
