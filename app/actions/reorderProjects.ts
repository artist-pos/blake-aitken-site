'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'blakeaitkenwork@gmail.com'

/**
 * Reorders a subset of projects — in practice, one discipline on the landing
 * page — without disturbing anything else.
 *
 * `sort_order` is a single global sequence, so the new order is spliced back
 * into the slots the moved projects already occupied. Working this way means
 * the caller can pass a partial list (the landing grid drops projects with no
 * usable thumbnail, and the filter bar can narrow it further) and still land a
 * correct write.
 */
export async function reorderProjects(orderedIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) throw new Error('Unauthorized')

  if (new Set(orderedIds).size !== orderedIds.length) {
    throw new Error('Duplicate project in reorder request')
  }

  const { data: all, error } = await supabase
    .from('projects')
    .select('id')
    .order('sort_order')
    .order('created_at')
  if (error) throw new Error(error.message)
  if (!all) throw new Error('Could not read current project order')

  const ids = all.map((p) => p.id as string)
  const moving = new Set(orderedIds)
  const slots = ids.reduce<number[]>((acc, id, i) => {
    if (moving.has(id)) acc.push(i)
    return acc
  }, [])

  if (slots.length !== orderedIds.length) {
    throw new Error('Reorder request references a project that no longer exists')
  }

  slots.forEach((slot, i) => {
    ids[slot] = orderedIds[i]
  })

  const { error: rpcError } = await supabase.rpc('reorder_projects', { ids })
  if (rpcError) throw new Error(rpcError.message)

  revalidatePath('/')
}
