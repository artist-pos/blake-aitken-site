'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MarkdownEditor from '@/components/admin/MarkdownEditor'

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

const inputStyle: React.CSSProperties = { display: 'block', width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid rgba(0,0,0,0.15)', backgroundColor: '#ffffff', outline: 'none', color: '#1a1a1a' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '6px' }

export default function NewBlogPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase.from('blog_posts').insert({
      title, slug, category: category || null, excerpt: excerpt || null, content,
      published, published_at: published ? new Date().toISOString() : null,
    }).select().single()
    if (err) { setError(err.message); setSaving(false); return }
    router.push(`/admin/blog/${data.id}`)
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888888', marginBottom: '32px' }}>
        — New Post
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <div>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={title} onChange={(e) => { setTitle(e.target.value); setSlug(slugify(e.target.value)) }} required />
          </div>
          <div>
            <label style={labelStyle}>Slug *</label>
            <input style={inputStyle} value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Category</label>
          <input style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Essay, Process, Opinion" />
        </div>
        <div>
          <label style={labelStyle}>Excerpt</label>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Content (Markdown) *</label>
          <MarkdownEditor name="content" value={content} onChange={setContent} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          <span style={{ fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Publish immediately</span>
        </label>
        {error && <p style={{ fontSize: '12px', color: '#cc0000' }}>{error}</p>}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} style={{ padding: '11px 24px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ffffff', backgroundColor: saving ? '#888888' : '#000000', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Creating…' : 'Create Post'}
          </button>
          <button type="button" onClick={() => router.back()} style={{ fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#888888', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
