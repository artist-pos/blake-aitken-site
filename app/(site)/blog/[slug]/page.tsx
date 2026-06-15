import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug } from '@/lib/queries'
import { blogPostMetadata } from '@/lib/metadata'
import MarkdownContent from '@/components/MarkdownContent'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return blogPostMetadata(post)
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    author: { '@type': 'Person', name: 'Blake Aitken' },
  }

  function formatDate(iso?: string) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="px-12 py-12 max-md:px-5 max-md:py-8">
        {/* Back link */}
        <Link
          href="/blog"
          style={{
            fontSize: '11px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#888888',
            display: 'inline-block',
            marginBottom: '32px',
            transition: 'color 150ms',
          }}
          className="hover:text-[#1a1a1a] transition-colors duration-150"
        >
          ← Writing
        </Link>

        {/* Post header */}
        <header className="mb-10" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '24px' }}>
          <div className="flex items-center gap-4 mb-4">
            <span
              style={{
                fontFamily: 'var(--font-jetbrains-mono)',
                fontSize: '11px',
                color: '#888888',
              }}
            >
              {formatDate(post.published_at)}
            </span>
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
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 500,
              color: '#1a1a1a',
              lineHeight: 1.25,
              maxWidth: '680px',
            }}
          >
            {post.title}
          </h1>
        </header>

        {/* Body */}
        <div style={{ maxWidth: '680px' }}>
          <MarkdownContent content={post.content} />
        </div>
      </article>
    </>
  )
}
