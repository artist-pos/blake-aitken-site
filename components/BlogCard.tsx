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
      className="block group"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '24px',
        backgroundColor: '#f5f5f5',
        transition: 'background-color 150ms',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5')}
    >
      <p
        style={{
          fontFamily: 'var(--font-jetbrains-mono)',
          fontSize: '11px',
          color: '#888888',
          letterSpacing: '0.04em',
        }}
      >
        {formatDate(post.published_at)}
      </p>

      <h3
        style={{
          fontSize: '15px',
          fontWeight: 500,
          letterSpacing: '0.02em',
          color: '#1a1a1a',
          lineHeight: 1.4,
          flex: 1,
        }}
      >
        {post.title}
      </h3>

      {post.excerpt && (
        <p
          style={{
            fontSize: '13px',
            color: '#888888',
            lineHeight: 1.6,
          }}
        >
          {post.excerpt}
        </p>
      )}

      <span
        style={{
          fontSize: '11px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#1a1a1a',
        }}
      >
        Read more →
      </span>
    </Link>
  )
}
