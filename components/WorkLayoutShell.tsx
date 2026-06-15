'use client'

import { useState } from 'react'
import WorkImageGrid from './WorkImageGrid'
import AdminLayoutBar from './AdminLayoutBar'
import type { ProjectImage } from '@/lib/types'

type LastRow = 'left' | 'center' | 'fill'

interface Layout {
  rowHeight: number
  hGap: number
  vGap: number
  lastRow: LastRow
}

interface Props {
  images: ProjectImage[]
  projectTitle: string
  projectId: string
  slug: string
  isAdmin: boolean
  initial: Layout
}

export default function WorkLayoutShell({
  images,
  projectTitle,
  projectId,
  slug,
  isAdmin,
  initial,
}: Props) {
  const [layout, setLayout] = useState<Layout>(initial)

  return (
    <>
      <WorkImageGrid
        images={images}
        projectTitle={projectTitle}
        rowHeight={layout.rowHeight}
        hGap={layout.hGap}
        vGap={layout.vGap}
        lastRow={layout.lastRow}
      />
      {isAdmin && (
        <AdminLayoutBar
          projectId={projectId}
          slug={slug}
          initial={layout}
          onChange={setLayout}
        />
      )}
    </>
  )
}
