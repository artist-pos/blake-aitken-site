import type { Metadata } from 'next'
import type { BlogPost, Project } from './types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blakeaitken.com'
const SITE_NAME = 'Blake Aitken'
const DEFAULT_DESCRIPTION =
  'Blake Aitken is a public artist and architectural designer based in Kirikiriroa (Hamilton), Aotearoa New Zealand — designing civic systems that make invisible social contracts visible.'

export function homeMetadata(): Metadata {
  const title = `${SITE_NAME} — Public Artist & Architectural Designer`
  return {
    title,
    description: DEFAULT_DESCRIPTION,
    openGraph: {
      title,
      description: DEFAULT_DESCRIPTION,
      url: SITE_URL,
      type: 'website',
      images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: DEFAULT_DESCRIPTION,
      images: [`${SITE_URL}/api/og`],
    },
    alternates: { canonical: SITE_URL },
  }
}

export function projectMetadata(project: Project): Metadata {
  const title = `${project.title} — ${SITE_NAME}`
  const description =
    project.description?.replace(/[#*_[\]]/g, '').slice(0, 160) ?? DEFAULT_DESCRIPTION
  const thumbnail = project.images?.find((i) => i.is_thumbnail) ?? project.images?.[0]
  const image = thumbnail?.url ?? `${SITE_URL}/api/og`
  const url = `${SITE_URL}/work/${project.slug}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [{ url: image, width: thumbnail?.width ?? 1200, height: thumbnail?.height ?? 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    alternates: { canonical: url },
  }
}

export function blogPostMetadata(post: BlogPost): Metadata {
  const title = `${post.title} — ${SITE_NAME}`
  const description =
    post.excerpt ?? post.content.replace(/[#*_[\]]/g, '').slice(0, 160)
  const url = `${SITE_URL}/blog/${post.slug}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: post.published_at,
      images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [`${SITE_URL}/api/og`] },
    alternates: { canonical: url },
  }
}

export function blogIndexMetadata(): Metadata {
  const title = `Writing — ${SITE_NAME}`
  const description = `Essays and reflections on public art, architecture, and urban systems by ${SITE_NAME}.`
  const url = `${SITE_URL}/blog`
  return {
    title,
    description,
    openGraph: { title, description, url, type: 'website' },
    alternates: { canonical: url },
  }
}

export function infoMetadata(): Metadata {
  const title = `Info — ${SITE_NAME}`
  const description = DEFAULT_DESCRIPTION
  const url = `${SITE_URL}/info`
  return {
    title,
    description,
    openGraph: { title, description, url, type: 'website' },
    alternates: { canonical: url },
  }
}
