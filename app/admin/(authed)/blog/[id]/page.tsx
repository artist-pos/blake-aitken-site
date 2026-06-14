'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MarkdownEditor from '@/components/admin/MarkdownEditor'

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

const inputStyle: React.CSSProperties = { display: 'block', width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid rgba(0,0,0,0.15)', backgroundColor: '#ffffff', outline: 'none', color: '#1a1a1a' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '6px' }

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', slug: '', category: '', excerpt: '', content: '', published: false, published_at: '' })

  useEffect(() => {
    createClient().from('blog_posts').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm({ title: data.title, slug: data.slug, category: data.category ?? '', excerpt: data.excerpt ?? '', content: data.content, published: data.published, published_at: data.published_at ?? '' })
      setLoading(false)
    })
  }, [id])

  function set(key: keyof typeof form, val: string | boolean) { setForm((f) => ({ ...f, [key]: val })) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const wasPublished = form.published
    const publishedAt = (!form.published && wasPublished) ? form.published_at : form.published && !form.published_at ? new Date().toISOString() : form.published_at
    const supabase = createClient()
    const { error: err } = await supabase.from('blog_posts').update({
      title: form.title, slug: form.slug, category: form.category || null, excerpt: form.excerpt || null,
      content: form.content, published: form.published, published_at: publishedAt || null,
    }).eq('id', id)
    if (err) { setError(err.message); setSaving(false); return }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return
    await createClient().from('blog_posts').delete().eq('id', id)
    router.push('/admin/blog')
  }

  if (loading) return <div style={{ padding: '32px', color: '#888888', fontSize: '13px' }}>Loading…</div>

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888888' }}>— Edit Post</h1>
        <button type="button" onClick={handleDelete} style={{ fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#cc0000', cursor: 'pointer' }}>Delete Post</button>
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
        <div>
          <label style={labelStyle}>Category</label>
          <input style={inputStyle} value={form.category} onChange={(e) => set('category', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Excerpt</label>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Content (Markdown) *</label>
          <MarkdownEditor name="content" value={form.content} onChange={(v) => set('content', v)} />
        </div>
        <div className="flex items-center gap-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
            <span style={{ fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Published</span>
          </label>
        </div>
        {error && <p style={{ fontSize: '12px', color: '#cc0000' }}>{error}</p>}
        <button type="submit" disabled={saving} style={{ padding: '11px 24px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ffffff', backgroundColor: saving ? '#888888' : '#000000', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
