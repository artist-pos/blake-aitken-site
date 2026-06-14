import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { BlogPost } from '@/lib/types'

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NZ', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default async function AdminBlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888888' }}>
          — Blog
        </h1>
        <Link
          href="/admin/blog/new"
          style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ffffff', backgroundColor: '#000000' }}
        >
          New Post
        </Link>
      </div>

      <div style={{ backgroundColor: '#ffffff' }}>
        <div
          className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888888' }}
        >
          <span>Title</span>
          <span>Category</span>
          <span>Published</span>
          <span />
        </div>

        {(posts ?? []).map((post: BlogPost) => (
          <div
            key={post.id}
            className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-4 py-3"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center gap-3">
              {!post.published && (
                <span style={{ fontSize: '9px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#888888', border: '1px solid rgba(0,0,0,0.15)', padding: '1px 4px' }}>
                  Draft
                </span>
              )}
              <span style={{ fontSize: '13px', color: '#1a1a1a' }}>{post.title}</span>
            </div>
            <span style={{ fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#888888' }}>
              {post.category ?? '—'}
            </span>
            <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px', color: '#888888' }}>
              {formatDate(post.published_at)}
            </span>
            <Link
              href={`/admin/blog/${post.id}`}
              style={{ fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#1a1a1a' }}
            >
              Edit
            </Link>
          </div>
        ))}

        {(!posts || posts.length === 0) && (
          <div className="px-4 py-8" style={{ textAlign: 'center', color: '#888888', fontSize: '13px' }}>
            No posts yet. <Link href="/admin/blog/new" style={{ textDecoration: 'underline' }}>Create one.</Link>
          </div>
        )}
      </div>
    </div>
  )
}
