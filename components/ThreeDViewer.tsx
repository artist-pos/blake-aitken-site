// Future: @react-three/fiber + @react-three/drei
// Lazy-loaded via next/dynamic with ssr: false
// Will render .glb models from Supabase Storage
export default function ThreeDViewer({ url }: { url: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height: 400, backgroundColor: '#f0f0f0', fontSize: '13px', color: '#888888' }}
    >
      3D Viewer — {url}
    </div>
  )
}
