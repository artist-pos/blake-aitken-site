'use client'

import dynamic from 'next/dynamic'

const ThreeDViewer = dynamic(() => import('./ThreeDViewer'), { ssr: false })

export default function ThreeDViewerDynamic({ url }: { url: string }) {
  return <ThreeDViewer url={url} />
}
