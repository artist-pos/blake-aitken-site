'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ProjectImage } from '@/lib/types'

interface Props {
  projectId: string
  images: ProjectImage[]
  onUpdate: (images: ProjectImage[]) => void
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

function SortableImage({
  img,
  onDelete,
  onSetThumbnail,
}: {
  img: ProjectImage
  onDelete: (img: ProjectImage) => void
  onSetThumbnail: (img: ProjectImage) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        aspectRatio: '1',
        position: 'relative',
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
      }}
      className="group"
    >
      {/* Drag handle — whole tile is draggable */}
      <div
        {...attributes}
        {...listeners}
        style={{ position: 'absolute', inset: 0, zIndex: 1, cursor: 'grab', touchAction: 'none' }}
      />

      <Image src={img.url} alt="" fill className="object-cover" sizes="200px" />

      {img.is_thumbnail && (
        <span
          className="absolute top-1 left-1"
          style={{ fontSize: '9px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#ffffff', backgroundColor: '#000000', padding: '2px 5px', zIndex: 2 }}
        >
          Thumb
        </span>
      )}

      {/* Controls on hover */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', transition: 'opacity 150ms', zIndex: 2 }}
      >
        <button
          type="button"
          onClick={() => onSetThumbnail(img)}
          style={{ fontSize: '10px', letterSpacing: '0.04em', textTransform: 'uppercase', color: img.is_thumbnail ? '#ffd700' : '#ffffff', cursor: 'pointer' }}
        >
          {img.is_thumbnail ? '★ Thumbnail' : '☆ Set Thumb'}
        </button>
        <button
          type="button"
          onClick={() => onDelete(img)}
          style={{ fontSize: '10px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#ff6b6b', cursor: 'pointer' }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default function ImageUploader({ projectId, images, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')
    const supabase = createClient()
    const newImages: ProjectImage[] = []

    for (const file of Array.from(files)) {
      try {
        const dims = await getImageDimensions(file)
        const ext = file.name.split('.').pop()
        const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(path, file, { cacheControl: '31536000', upsert: false })
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('project-images').getPublicUrl(path)

        const { data: imgData, error: insertError } = await supabase
          .from('project_images')
          .insert({
            project_id: projectId,
            url: urlData.publicUrl,
            width: dims.width,
            height: dims.height,
            sort_order: images.length + newImages.length,
            is_thumbnail: images.length === 0 && newImages.length === 0,
          })
          .select()
          .single()
        if (insertError) throw insertError
        newImages.push(imgData)
      } catch {
        setError(`Failed to upload ${file.name}.`)
      }
    }

    onUpdate([...images, ...newImages])
    setUploading(false)
  }

  async function handleDelete(img: ProjectImage) {
    const supabase = createClient()
    const path = img.url.split('/project-images/')[1]
    await supabase.storage.from('project-images').remove([path])
    await supabase.from('project_images').delete().eq('id', img.id)
    onUpdate(images.filter((i) => i.id !== img.id))
  }

  async function handleSetThumbnail(img: ProjectImage) {
    const supabase = createClient()
    await supabase.from('project_images').update({ is_thumbnail: false }).eq('project_id', projectId)
    await supabase.from('project_images').update({ is_thumbnail: true }).eq('id', img.id)
    onUpdate(images.map((i) => ({ ...i, is_thumbnail: i.id === img.id })))
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = images.findIndex((i) => i.id === active.id)
    const newIndex = images.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(images, oldIndex, newIndex).map((img, idx) => ({
      ...img,
      sort_order: idx,
    }))

    onUpdate(reordered)

    const supabase = createClient()
    await Promise.all(
      reordered.map((img) =>
        supabase.from('project_images').update({ sort_order: img.sort_order }).eq('id', img.id)
      )
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center justify-center cursor-pointer"
        style={{ border: '2px dashed rgba(0,0,0,0.15)', padding: '32px', backgroundColor: uploading ? '#f0f0f0' : '#ffffff', transition: 'background-color 150ms' }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <p style={{ fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}>
          {uploading ? 'Uploading…' : 'Drop images here or click to browse'}
        </p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {error && <p style={{ fontSize: '12px', color: '#cc0000' }}>{error}</p>}

      {images.length > 0 && (
        <>
          <p style={{ fontSize: '11px', color: '#888888', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Drag to reorder · First image = display order on project page
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-4 gap-2 max-md:grid-cols-2">
                {images.map((img) => (
                  <SortableImage key={img.id} img={img} onDelete={handleDelete} onSetThumbnail={handleSetThumbnail} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  )
}
