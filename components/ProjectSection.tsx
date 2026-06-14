'use client'

import { useState, useMemo } from 'react'
import FilterBar from './FilterBar'
import ProjectGrid from './ProjectGrid'
import ProjectListView from './ProjectListView'
import type { Project } from '@/lib/types'

interface Props {
  projects: Project[]
}

export default function ProjectSection({ projects }: Props) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return projects
    return projects.filter(
      (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
    )
  }, [projects, activeCategory])

  return (
    <div>
      <FilterBar
        active={activeCategory}
        view={view}
        onCategory={setActiveCategory}
        onView={setView}
      />
      {view === 'grid' ? (
        <ProjectGrid projects={filtered} />
      ) : (
        <ProjectListView projects={filtered} />
      )}
    </div>
  )
}
