'use client'

import Link from 'next/link'
import BlogCard from './BlogCard'
import type { BlogPost } from '@/lib/types'

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      style={{
        fontSize: '11px',
        fontWeight: 400,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#888888',
        marginBottom: '24px',
      }}
    >
      — {children}
    </p>
  )
}

interface Props {
  posts: BlogPost[]
}

export default function BlogSection({ posts }: Props) {
  return (
    <section className="px-12 py-16 max-md:px-5 max-md:py-10">
      <div className="flex items-center justify-between mb-6">
        <SectionLabel>Writing</SectionLabel>
        <Link
          href="/blog"
          style={{
            fontSize: '12px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#888888',
            transition: 'color 150ms',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#1a1a1a')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#888888')}
        >
          View all →
        </Link>
      </div>

      {posts.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#888888' }}>No posts yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-px max-lg:grid-cols-2 max-md:grid-cols-1">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}
