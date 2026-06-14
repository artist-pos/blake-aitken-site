'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MarkdownEditor from '@/components/admin/MarkdownEditor'

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '9px 12px',
  fontSize: '13px',
  border: '1px solid rgba(0,0,0,0.15)',
  backgroundColor: '#ffffff',
  outline: 'none',
  color: '#1a1a1a',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#1a1a1a',
  marginBottom: '6px',
}

export default function NewProjectPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('art')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [featured, setFeatured] = useState(false)
  const [archived, setArchived] = useState(false)

  function handleTitleChange(val: string) {
    setTitle(val)
    setSlug(slugify(val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const supabase = createClient()
    const { data, error: insertError } = await supabase
      .from('projects')
      .insert({ title, slug, category, date, location: location || null, description: description || null, featured, archived })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    router.push(`/admin/projects/${data.id}`)
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888888', marginBottom: '32px' }}>
        — New Project
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <div>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Slug *</label>
            <input style={inputStyle} value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          <div>
            <label style={labelStyle}>Category *</label>
            <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
              {['art', 'architecture', 'concept', 'venture'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Date *</label>
            <input style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} placeholder="2024" required />
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description (Markdown)</label>
          <MarkdownEditor name="description" value={description} onChange={setDescription} />
        </div>

        <div className="flex items-center gap-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            <span style={{ fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} />
            <span style={{ fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Archived</span>
          </label>
        </div>

        {error && <p style={{ fontSize: '12px', color: '#cc0000' }}>{error}</p>}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '11px 24px',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#ffffff',
              backgroundColor: saving ? '#888888' : '#000000',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Creating…' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#888888', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
