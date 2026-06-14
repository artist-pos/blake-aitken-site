import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Project } from '@/lib/types'

export default async function AdminProjectsPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888888' }}>
          — Projects
        </h1>
        <Link
          href="/admin/projects/new"
          style={{
            padding: '8px 16px',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#ffffff',
            backgroundColor: '#000000',
          }}
        >
          New Project
        </Link>
      </div>

      <div style={{ backgroundColor: '#ffffff' }}>
        {/* Header */}
        <div
          className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}
        >
          <span>Title</span>
          <span>Category</span>
          <span>Date</span>
          <span>Status</span>
          <span />
        </div>

        {(projects ?? []).map((project: Project) => (
          <div
            key={project.id}
            className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center gap-3">
              {project.featured && (
                <span style={{ fontSize: '9px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#1a1a1a', border: '1px solid #1a1a1a', padding: '1px 4px' }}>
                  Featured
                </span>
              )}
              <span style={{ fontSize: '13px', color: '#1a1a1a' }}>{project.title}</span>
            </div>
            <span style={{ fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#888888' }}>
              {project.category}
            </span>
            <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px', color: '#888888' }}>
              {project.date}
            </span>
            <span style={{ fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', color: project.archived ? '#cc0000' : '#888888' }}>
              {project.archived ? 'Archived' : 'Active'}
            </span>
            <Link
              href={`/admin/projects/${project.id}`}
              style={{ fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#1a1a1a', transition: 'opacity 150ms' }}
            >
              Edit
            </Link>
          </div>
        ))}

        {(!projects || projects.length === 0) && (
          <div className="px-4 py-8" style={{ textAlign: 'center', color: '#888888', fontSize: '13px' }}>
            No projects yet. <Link href="/admin/projects/new" style={{ textDecoration: 'underline' }}>Create one.</Link>
          </div>
        )}
      </div>
    </div>
  )
}
