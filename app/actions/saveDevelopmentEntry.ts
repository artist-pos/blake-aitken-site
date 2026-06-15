'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { DevImage } from '@/lib/types'

export async function saveDevelopmentEntry(entry: {
  id?: string
  projectId: string
  slug: string
  title: string
  date: string
  body: string
  images: DevImage[]
  sortOrder: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'blakeaitkenwork@gmail.com') throw new Error('Unauthorized')

  const payload = {
    project_id: entry.projectId,
    title: entry.title || null,
    date: entry.date || null,
    body: entry.body || null,
    images: entry.images,
    sort_order: entry.sortOrder,
  }

  if (entry.id) {
    const { data, error } = await supabase
      .from('project_developments')
      .update(payload)
      .eq('id', entry.id)
      .select()
      .single()
    if (error) throw error
    revalidatePath(`/work/${entry.slug}`)
    return data
  } else {
    const { data, error } = await supabase
      .from('project_developments')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    revalidatePath(`/work/${entry.slug}`)
    return data
  }
}
