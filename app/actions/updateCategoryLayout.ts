'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CategoryLayout, Discipline } from '@/lib/types'

const ADMIN_EMAIL = 'blakeaitkenwork@gmail.com'

const DISCIPLINES: Discipline[] = ['art', 'architecture', 'concept', 'venture', 'university']
const LAST_ROWS: CategoryLayout['last_row'][] = ['left', 'center', 'fill']

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(n)))

export async function updateCategoryLayout(
  category: string,
  layout: { rowHeight: number; hGap: number; vGap: number; lastRow: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) throw new Error('Unauthorized')

  // The check constraints would reject bad values anyway, but failing here
  // keeps the error legible instead of surfacing raw Postgres text.
  if (!DISCIPLINES.includes(category as Discipline)) {
    throw new Error(`Unknown discipline: ${category}`)
  }
  if (!LAST_ROWS.includes(layout.lastRow as CategoryLayout['last_row'])) {
    throw new Error(`Unknown last-row mode: ${layout.lastRow}`)
  }

  const { error } = await supabase.from('category_layouts').upsert(
    {
      category,
      row_height: clamp(layout.rowHeight, 120, 600),
      h_gap: clamp(layout.hGap, 0, 48),
      v_gap: clamp(layout.vGap, 0, 96),
      last_row: layout.lastRow,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'category' }
  )
  if (error) throw new Error(error.message)

  revalidatePath('/')
}
