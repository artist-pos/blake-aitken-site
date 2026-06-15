'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { updateSiteSetting } from '@/app/actions/updateSiteSetting'

interface Slide {
  id: string
  image_url: string
  image_width: number
  image_height: number
  link_href: string
  sort_order: number
  enabled: boolean
}

interface ProjectOption {
  id: string
  title: string
  slug: string
  images: { id: string; url: string; width: number; height: number }[]
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url) }
    img.onerror = reject
    img.src = url
  })
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', letterSpacing: '0.06em',
  textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '6px',
}
const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '9px 12px', fontSize: '13px',
  border: '1px solid rgba(0,0,0,0.15)', backgroundColor: '#ffffff',
  outline: 'none', color: '#1a1a1a',
}
const btnPrimary: React.CSSProperties = {
  fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase',
  padding: '9px 18px', cursor: 'pointer',
  backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none',
}

export default function HeroAdminPage() {
  const [loading, setLoading]         = useState(true)
  const [statement, setStatement]     = useState('')
  const [stmtSaved, setStmtSaved]     = useState(false)
  const [stmtPending, startStmtTx]    = useTransition()

  const [slides, setSlides]           = useState<Slide[]>([])
  const [projects, setProjects]       = useState<ProjectOption[]>([])
  const [mode, setMode]               = useState<'upload' | 'project'>('upload')
  const [linkHref, setLinkHref]       = useState('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  // Upload mode
  const [pendingFile, setPendingFile]       = useState<File | null>(null)
  const [pendingPreview, setPendingPreview] = useState('')
  const [pendingDims, setPendingDims]       = useState<{ width: number; height: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Project-pick mode
  const [selProjectId, setSelProjectId] = useState('')
  const [selImageUrl, setSelImageUrl]   = useState('')
  const [selImageDims, setSelImageDims] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    const sb = createClient()
    Promise.all([
      sb.from('site_settings').select('value').eq('key', 'hero_statement').maybeSingle(),
      sb.from('home_slides').select('*').order('sort_order'),
      sb.from('projects').select('id, title, slug, images:project_images(id, url, width, height)').eq('archived', false).order('sort_order'),
    ]).then(([{ data: s }, { data: sl }, { data: p }]) => {
      setStatement(s?.value ?? '')
      setSlides(sl ?? [])
      setProjects((p ?? []) as ProjectOption[])
      setLoading(false)
    })
  }, [])

  function saveStatement() {
    startStmtTx(async () => {
      await updateSiteSetting('hero_statement', statement)
      setStmtSaved(true)
      setTimeout(() => setStmtSaved(false), 2000)
    })
  }

  async function handleFilePick(file: File) {
    setPendingFile(file)
    setPendingPreview(URL.createObjectURL(file))
    setPendingDims(await getImageDimensions(file))
  }

  function handleProjectChange(id: string) {
    setSelProjectId(id)
    setSelImageUrl('')
    setSelImageDims(null)
    const proj = projects.find(p => p.id === id)
    if (proj) setLinkHref(`/work/${proj.slug}`)
  }

  async function addSlide() {
    setError('')
    setSaving(true)
    const sb = createClient()
    let imageUrl = '', imageWidth = 0, imageHeight = 0

    if (mode === 'upload') {
      if (!pendingFile || !pendingDims) { setError('Pick an image first.'); setSaving(false); return }
      const ext  = pendingFile.name.split('.').pop()
      const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadErr } = await sb.storage.from('project-images').upload(path, pendingFile, { cacheControl: '31536000', upsert: false })
      if (uploadErr) { setError(uploadErr.message); setSaving(false); return }
      const { data: urlData } = sb.storage.from('project-images').getPublicUrl(path)
      imageUrl = urlData.publicUrl; imageWidth = pendingDims.width; imageHeight = pendingDims.height
    } else {
      if (!selImageUrl || !selImageDims) { setError('Select an image from the project.'); setSaving(false); return }
      imageUrl = selImageUrl; imageWidth = selImageDims.width; imageHeight = selImageDims.height
    }

    if (!linkHref.trim()) { setError('Set a link destination.'); setSaving(false); return }

    const { data: row, error: insertErr } = await sb
      .from('home_slides')
      .insert({ image_url: imageUrl, image_width: imageWidth, image_height: imageHeight, link_href: linkHref.trim(), sort_order: slides.length, enabled: true })
      .select().single()

    if (insertErr) { setError(insertErr.message); setSaving(false); return }

    setSlides(prev => [...prev, row])
    setPendingFile(null); setPendingPreview(''); setPendingDims(null)
    setSelProjectId(''); setSelImageUrl(''); setSelImageDims(null)
    setLinkHref(''); setSaving(false)
  }

  async function toggleEnabled(slide: Slide) {
    const sb = createClient()
    await sb.from('home_slides').update({ enabled: !slide.enabled }).eq('id', slide.id)
    setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, enabled: !s.enabled } : s))
  }

  async function deleteSlide(slide: Slide) {
    if (!confirm('Delete this slide?')) return
    await createClient().from('home_slides').delete().eq('id', slide.id)
    setSlides(prev => prev.filter(s => s.id !== slide.id))
  }

  async function moveSlide(id: string, dir: -1 | 1) {
    const idx = slides.findIndex(s => s.id === id)
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= slides.length) return
    const arr = [...slides]
    ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
    const updated = arr.map((s, i) => ({ ...s, sort_order: i }))
    setSlides(updated)
    const sb = createClient()
    await Promise.all(updated.map(s => sb.from('home_slides').update({ sort_order: s.sort_order }).eq('id', s.id)))
  }

  const selProject = projects.find(p => p.id === selProjectId)

  if (loading) return <p style={{ color: '#888', fontSize: '13px' }}>Loading…</p>

  return (
    <div className="flex flex-col gap-12 max-w-3xl">
      <h1 style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888888' }}>
        — Hero
      </h1>

      {/* ── Statement ── */}
      <section className="flex flex-col gap-4">
        <p style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888' }}>
          Statement
        </p>
        <textarea
          value={statement}
          onChange={e => setStatement(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit' }}
        />
        <div>
          <button type="button" onClick={saveStatement} disabled={stmtPending} style={btnPrimary}>
            {stmtSaved ? 'Saved ✓' : stmtPending ? 'Saving…' : 'Save statement'}
          </button>
        </div>
      </section>

      <div style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.08)' }} />

      {/* ── Slides ── */}
      <section className="flex flex-col gap-6">
        <p style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888' }}>
          Slides
        </p>

        {/* Existing slides */}
        {slides.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#888888' }}>No slides yet.</p>
        ) : (
          <div className="flex flex-col" style={{ gap: '2px' }}>
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className="flex items-center gap-4"
                style={{ padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', opacity: slide.enabled ? 1 : 0.45 }}
              >
                <div style={{ width: 72, height: 48, position: 'relative', flexShrink: 0, backgroundColor: '#f0f0f0' }}>
                  <Image src={slide.image_url} alt="" fill style={{ objectFit: 'contain' }} sizes="72px" />
                </div>
                <span style={{ fontSize: '12px', color: '#1a1a1a', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {slide.link_href}
                </span>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button type="button" onClick={() => moveSlide(slide.id, -1)} disabled={i === 0}
                    style={{ fontSize: '14px', cursor: 'pointer', opacity: i === 0 ? 0.2 : 1, background: 'none', border: 'none' }}>↑</button>
                  <button type="button" onClick={() => moveSlide(slide.id, 1)} disabled={i === slides.length - 1}
                    style={{ fontSize: '14px', cursor: 'pointer', opacity: i === slides.length - 1 ? 0.2 : 1, background: 'none', border: 'none' }}>↓</button>
                  <button type="button" onClick={() => toggleEnabled(slide)}
                    style={{ fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: '1px solid rgba(0,0,0,0.15)', padding: '3px 8px', color: slide.enabled ? '#1a1a1a' : '#888888' }}>
                    {slide.enabled ? 'Live' : 'Hidden'}
                  </button>
                  <button type="button" onClick={() => deleteSlide(slide)}
                    style={{ fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', color: '#cc0000' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add slide form */}
        <div style={{ border: '1px solid rgba(0,0,0,0.12)', padding: '24px', backgroundColor: '#fafafa' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888', marginBottom: '16px' }}>Add slide</p>

          {/* Mode toggle */}
          <div className="flex" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            {(['upload', 'project'] as const).map(m => (
              <button key={m} type="button" onClick={() => setMode(m)}
                style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '7px 16px', cursor: 'pointer', background: 'none', border: 'none', color: mode === m ? '#1a1a1a' : '#888888', borderBottom: mode === m ? '2px solid #1a1a1a' : '2px solid transparent' }}>
                {m === 'upload' ? 'Upload image' : 'From project'}
              </button>
            ))}
          </div>

          {mode === 'upload' ? (
            <div className="mb-4">
              <div
                style={{ border: '2px dashed rgba(0,0,0,0.15)', padding: '28px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#ffffff' }}
                onClick={() => inputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFilePick(f) }}
              >
                {pendingPreview
                  ? <img src={pendingPreview} alt="" style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'contain', display: 'inline-block' }} />
                  : <p style={{ fontSize: '12px', color: '#888888', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Drop image or click to browse</p>
                }
                <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) handleFilePick(f) }} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-4">
              <div>
                <label style={labelStyle}>Project</label>
                <select value={selProjectId} onChange={e => handleProjectChange(e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
                  <option value="">— Select project —</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              {selProject && selProject.images.length > 0 && (
                <div>
                  <label style={labelStyle}>Select image</label>
                  <div className="grid grid-cols-5 gap-2">
                    {selProject.images.map(img => (
                      <button key={img.id} type="button" onClick={() => { setSelImageUrl(img.url); setSelImageDims({ width: img.width, height: img.height }) }}
                        style={{ aspectRatio: '1', position: 'relative', overflow: 'hidden', border: selImageUrl === img.url ? '2px solid #1a1a1a' : '2px solid transparent', padding: 0, cursor: 'pointer', backgroundColor: '#f0f0f0' }}>
                        <Image src={img.url} alt="" fill style={{ objectFit: 'cover' }} sizes="80px" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-5">
            <label style={labelStyle}>Links to</label>
            <input type="text" value={linkHref} onChange={e => setLinkHref(e.target.value)} placeholder="/work/some-slug  or  /notes/some-slug" style={inputStyle} />
            <p style={{ fontSize: '10px', color: '#888888', marginTop: '4px' }}>Auto-filled when you pick a project — edit to link to a note instead.</p>
          </div>

          {error && <p style={{ fontSize: '12px', color: '#cc0000', marginBottom: '12px' }}>{error}</p>}

          <button type="button" onClick={addSlide} disabled={saving} style={btnPrimary}>
            {saving ? 'Saving…' : 'Add slide'}
          </button>
        </div>
      </section>
    </div>
  )
}
