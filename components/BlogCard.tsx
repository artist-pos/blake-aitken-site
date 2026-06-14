'use client'

import Link from 'next/link'
import type { BlogPost } from '@/lib/types'

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface Props {
  post: BlogPost
}

export default function BlogCard({ post }: Props) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block p-6 group"
      style={{
        backgroundColor: '#ffffff',
        transition: 'background-color 150ms',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f0')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff')}
    >
      <p
        style={{
          fontFamily: 'var(--font-jetbrains-mono)',
          fontSize: '11px',
          color: '#888888',
          letterSpacing: '0.04em',
          marginBottom: '8px',
        }}
      >
        {formatDate(post.published_at)}
      </p>

      <h3
        style={{
          fontSize: '14px',
          fontWeight: 500,
          color: '#1a1a1a',
          lineHeight: 1.4,
          marginBottom: '8px',
        }}
      >
        {post.title}
      </h3>

      {post.excerpt && (
        <p
          style={{
            fontSize: '12px',
            color: '#888888',
            lineHeight: 1.6,
            marginBottom: '12px',
          }}
        >
          {post.excerpt}
        </p>
      )}

      {post.category && (
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#888888',
            border: '1px solid rgba(0,0,0,0.12)',
            padding: '2px 6px',
          }}
        >
          {post.category}
        </span>
      )}
    </Link>
  )
}
