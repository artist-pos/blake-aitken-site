'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function deleteDevelopmentEntry(id: string, slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'blakeaitkenwork@gmail.com') throw new Error('Unauthorized')

  await supabase.from('project_developments').delete().eq('id', id)
  revalidatePath(`/work/${slug}`)
}
