'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { saveDevelopmentEntry } from '@/app/actions/saveDevelopmentEntry'
import { deleteDevelopmentEntry } from '@/app/actions/deleteDevelopmentEntry'
import MarkdownEditor from '@/components/admin/MarkdownEditor'
import type { ProjectDevelopment, DevImage } from '@/lib/types'

interface Props {
  projectId: string
  slug: string
}

interface EntryForm {
  id?: string
  title: string
  date: string
  body: string
  images: DevImage[]
  sortOrder: number
}

function blank(sortOrder: number): EntryForm {
  return { title: '', date: '', body: '', images: [], sortOrder }
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
  border: '1px solid rgba(0,0,0,0.15)', backgroundColor: '#ffffff', outline: 'none', color: '#1a1a1a',
}

export default function DevelopmentEditor({ projectId, slug }: Props) {
  const [entries, setEntries] = useState<ProjectDevelopment[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<EntryForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    createClient()
      .from('project_developments')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order')
      .then(({ data }) => { setEntries((data ?? []) as ProjectDevelopment[]); setLoading(false) })
  }, [projectId])

  function startNew() {
    setEditing(blank(entries.length))
  }

  function startEdit(entry: ProjectDevelopment) {
    setEditing({
      id: entry.id,
      title: entry.title ?? '',
      date: entry.date ?? '',
      body: entry.body ?? '',
      images: entry.images ?? [],
      sortOrder: entry.sort_order,
    })
  }

  function cancelEdit() {
    setEditing(null)
  }

  async function handleImagePick(file: File) {
    if (!editing) return
    const idx = editing.images.length
    setUploadingIdx(idx)
    const dims = await getImageDimensions(file)
    const ext = file.name.split('.').pop()
    const path = `developments/${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const sb = createClient()
    const { error } = await sb.storage.from('project-images').upload(path, file, { cacheControl: '31536000', upsert: false })
    if (error) { setUploadingIdx(null); return }
    const { data: urlData } = sb.storage.from('project-images').getPublicUrl(path)
    setEditing(e => e ? { ...e, images: [...e.images, { url: urlData.publicUrl, width: dims.width, height: dims.height, alt: '' }] } : e)
    setUploadingIdx(null)
  }

  function updateCaption(i: number, alt: string) {
    setEditing(e => e ? { ...e, images: e.images.map((img, j) => j === i ? { ...img, alt } : img) } : e)
  }

  function removeImage(i: number) {
    setEditing(e => e ? { ...e, images: e.images.filter((_, j) => j !== i) } : e)
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    const row = await saveDevelopmentEntry({ ...editing, projectId, slug })
    const updated = row as ProjectDevelopment
    if (editing.id) {
      setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
    } else {
      setEntries(prev => [...prev, updated])
    }
    setEditing(null)
    setSaving(false)
  }

  async function handleDelete(entry: ProjectDevelopment) {
    if (!confirm('Delete this development entry?')) return
    await deleteDevelopmentEntry(entry.id, slug)
    setEntries(prev => prev.filter(e => e.id !== entry.id))
  }

  if (loading) return <p style={{ fontSize: '13px', color: '#888888' }}>Loading…</p>

  return (
    <div className="flex flex-col gap-4">
      {/* Entry list */}
      {entries.length > 0 && (
        <div className="flex flex-col" style={{ gap: '2px', marginBottom: '8px' }}>
          {entries.map(entry => (
            <div
              key={entry.id}
              className="flex items-center gap-4"
              style={{ padding: '10px 14px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '12px', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {entry.title || '—'}
                </span>
                {entry.date && (
                  <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px', color: '#888888', marginLeft: '12px' }}>
                    {entry.date}
                  </span>
                )}
                {entry.images.length > 0 && (
                  <span style={{ fontSize: '10px', color: '#888888', marginLeft: '12px' }}>
                    {entry.images.length} image{entry.images.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex gap-4 flex-shrink-0">
                <button type="button" onClick={() => startEdit(entry)}
                  style={{ fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', color: '#1a1a1a' }}>
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(entry)}
                  style={{ fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', color: '#cc0000' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / New form */}
      {editing ? (
        <div style={{ border: '1px solid rgba(0,0,0,0.12)', padding: '24px', backgroundColor: '#fafafa' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888', marginBottom: '20px' }}>
            {editing.id ? 'Edit entry' : 'New entry'}
          </p>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Title</label>
                <input
                  style={inputStyle}
                  value={editing.title}
                  placeholder="Phase 1, March 2024…"
                  onChange={e => setEditing(ed => ed ? { ...ed, title: e.target.value } : ed)}
                />
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input
                  style={inputStyle}
                  value={editing.date}
                  placeholder="Mar 2024"
                  onChange={e => setEditing(ed => ed ? { ...ed, date: e.target.value } : ed)}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Text</label>
              <MarkdownEditor
                name="devBody"
                value={editing.body}
                onChange={v => setEditing(ed => ed ? { ...ed, body: v } : ed)}
              />
            </div>

            <div>
              <label style={labelStyle}>Images</label>

              {/* Existing images */}
              {editing.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {editing.images.map((img, i) => (
                    <div key={i} style={{ width: 120 }}>
                      <div style={{ position: 'relative', width: 120, height: 80, backgroundColor: '#f0f0f0' }}>
                        <Image src={img.url} alt={img.alt || ''} fill style={{ objectFit: 'cover' }} sizes="120px" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          style={{
                            position: 'absolute', top: 4, right: 4,
                            width: 20, height: 20, borderRadius: '50%',
                            background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff',
                            fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Caption…"
                        value={img.alt}
                        onChange={e => updateCaption(i, e.target.value)}
                        style={{ ...inputStyle, fontSize: '11px', padding: '5px 8px', marginTop: '4px' }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingIdx !== null}
                style={{
                  fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '8px 16px', cursor: 'pointer',
                  border: '1px dashed rgba(0,0,0,0.2)', background: '#ffffff', color: '#888888',
                }}
              >
                {uploadingIdx !== null ? 'Uploading…' : '+ Add image'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImagePick(f); e.target.value = '' }}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '9px 18px', cursor: 'pointer', backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none' }}
              >
                {saving ? 'Saving…' : 'Save entry'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '9px 18px', cursor: 'pointer', background: 'none', border: '1px solid rgba(0,0,0,0.15)', color: '#888888' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={startNew}
          style={{
            fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '9px 18px', cursor: 'pointer', alignSelf: 'flex-start',
            border: '1px solid rgba(0,0,0,0.15)', background: '#ffffff', color: '#1a1a1a',
          }}
        >
          + Add entry
        </button>
      )}
    </div>
  )
}
