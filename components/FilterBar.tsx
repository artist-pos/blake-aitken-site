'use client'

const CATEGORIES = ['All', 'Art', 'Architecture', 'Concept', 'Venture'] as const
type Category = (typeof CATEGORIES)[number]

interface Props {
  active: string
  view: 'grid' | 'list'
  onCategory: (c: string) => void
  onView: (v: 'grid' | 'list') => void
}

export default function FilterBar({ active, view, onCategory, onView }: Props) {
  return (
    <div
      id="works"
      className="flex items-center justify-between px-12 max-md:px-5"
      style={{
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        paddingTop: '10px',
        paddingBottom: '10px',
      }}
    >
      {/* Category filters */}
      <div className="flex items-center gap-6 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const isActive = active === cat
          return (
            <button
              key={cat}
              onClick={() => onCategory(cat)}
              style={{
                fontSize: '12px',
                fontWeight: 400,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: isActive ? '#1a1a1a' : '#888888',
                paddingBottom: '6px',
                borderBottom: isActive ? '1px solid #1a1a1a' : '1px solid transparent',
                transition: 'color 150ms',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-3 ml-6 flex-shrink-0">
        <button
          onClick={() => onView('grid')}
          aria-label="Grid view"
          style={{
            opacity: view === 'grid' ? 1 : 0.35,
            transition: 'opacity 150ms',
          }}
        >
          <GridIcon />
        </button>
        <button
          onClick={() => onView('list')}
          aria-label="List view"
          style={{
            opacity: view === 'list' ? 1 : 0.35,
            transition: 'opacity 150ms',
          }}
        >
          <ListIcon />
        </button>
      </div>
    </div>
  )
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="0" y="0" width="7" height="7" fill="currentColor" />
      <rect x="9" y="0" width="7" height="7" fill="currentColor" />
      <rect x="0" y="9" width="7" height="7" fill="currentColor" />
      <rect x="9" y="9" width="7" height="7" fill="currentColor" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="0" y="1" width="16" height="2" fill="currentColor" />
      <rect x="0" y="7" width="16" height="2" fill="currentColor" />
      <rect x="0" y="13" width="16" height="2" fill="currentColor" />
    </svg>
  )
}
