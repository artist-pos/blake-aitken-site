import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/queries'
import { blogIndexMetadata } from '@/lib/metadata'
import BlogCard from '@/components/BlogCard'

export const metadata: Metadata = blogIndexMetadata()

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="px-12 py-12 max-md:px-5 max-md:py-8">
      <h1
        style={{
          fontSize: '11px',
          fontWeight: 400,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#888888',
          marginBottom: '32px',
        }}
      >
        — Writing
      </h1>

      {posts.length === 0 ? (
        <p style={{ fontSize: '14px', color: '#888888' }}>No posts published yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-px max-lg:grid-cols-2 max-md:grid-cols-1">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
