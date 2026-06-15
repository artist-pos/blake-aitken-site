'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProjectLayout(
  projectId: string,
  slug: string,
  layout: { rowHeight: number; hGap: number; vGap: number; lastRow: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'blakeaitkenwork@gmail.com') throw new Error('Unauthorized')

  await supabase
    .from('projects')
    .update({
      grid_row_height: layout.rowHeight,
      grid_h_gap: layout.hGap,
      grid_v_gap: layout.vGap,
      grid_last_row: layout.lastRow,
    })
    .eq('id', projectId)

  revalidatePath(`/work/${slug}`)
}
