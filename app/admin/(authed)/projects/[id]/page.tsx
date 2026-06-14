'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MarkdownEditor from '@/components/admin/MarkdownEditor'
import ImageUploader from '@/components/admin/ImageUploader'
import type { Project, ProjectImage } from '@/lib/types'
import { use } from 'react'

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '9px 12px', fontSize: '13px',
  border: '1px solid rgba(0,0,0,0.15)', backgroundColor: '#ffffff', outline: 'none', color: '#1a1a1a',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '6px',
}

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<ProjectImage[]>([])
  const [form, setForm] = useState({
    title: '', slug: '', category: 'art', date: '', location: '',
    description: '', featured: false, archived: false,
  })

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('project_images').select('*').eq('project_id', id).order('sort_order'),
    ]).then(([{ data: project }, { data: imgs }]) => {
      if (project) {
        setForm({
          title: project.title, slug: project.slug, category: project.category,
          date: project.date, location: project.location ?? '', description: project.description ?? '',
          featured: project.featured, archived: project.archived,
        })
      }
      setImages(imgs ?? [])
      setLoading(false)
    })
  }, [id])

  function set(key: keyof typeof form, val: string | boolean) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('projects').update({
      title: form.title, slug: form.slug, category: form.category,
      date: form.date, location: form.location || null, description: form.description || null,
      featured: form.featured, archived: form.archived,
    }).eq('id', id)
    if (err) { setError(err.message); setSaving(false); return }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this project and all its images? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('projects').delete().eq('id', id)
    router.push('/admin/projects')
  }

  if (loading) return <div style={{ padding: '32px', color: '#888888', fontSize: '13px' }}>Loading…</div>

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888888' }}>
          — Edit Project
        </h1>
        <button
          type="button"
          onClick={handleDelete}
          style={{ fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#cc0000', cursor: 'pointer' }}
        >
          Delete Project
        </button>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <div>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={form.title} onChange={(e) => { set('title', e.target.value); set('slug', slugify(e.target.value)) }} required />
          </div>
          <div>
            <label style={labelStyle}>Slug *</label>
            <input style={inputStyle} value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          <div>
            <label style={labelStyle}>Category *</label>
            <select style={inputStyle} value={form.category} onChange={(e) => set('category', e.target.value)}>
              {['art', 'architecture', 'concept', 'venture'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Date *</label>
            <input style={inputStyle} value={form.date} onChange={(e) => set('date', e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <input style={inputStyle} value={form.location} onChange={(e) => set('location', e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description (Markdown)</label>
          <MarkdownEditor name="description" value={form.description} onChange={(v) => set('description', v)} />
        </div>

        <div className="flex items-center gap-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
            <span style={{ fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.archived} onChange={(e) => set('archived', e.target.checked)} />
            <span style={{ fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Archived</span>
          </label>
        </div>

        {error && <p style={{ fontSize: '12px', color: '#cc0000' }}>{error}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{ padding: '11px 24px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ffffff', backgroundColor: saving ? '#888888' : '#000000', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* Images */}
      <div style={{ marginTop: '48px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '32px' }}>
        <h2 style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888', marginBottom: '16px' }}>
          Images
        </h2>
        <ImageUploader projectId={id} images={images} onUpdate={setImages} />
      </div>
    </div>
  )
}
