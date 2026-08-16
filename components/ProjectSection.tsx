'use client'

import { useState, useMemo } from 'react'
import FilterBar from './FilterBar'
import DisciplineIndex from './DisciplineIndex'
import ProjectListView from './ProjectListView'
import type { CategoryLayout, Project } from '@/lib/types'

interface Props {
  projects: Project[]
  isAdmin?: boolean
  layouts?: CategoryLayout[]
}

export default function ProjectSection({ projects, isAdmin = false, layouts = [] }: Props) {
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
        <DisciplineIndex projects={filtered} isAdmin={isAdmin} layouts={layouts} />
      ) : (
        <ProjectListView projects={filtered} />
      )}
    </div>
  )
}
