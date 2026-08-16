import { createClient } from './supabase/server'
import { createStaticClient } from './supabase/static'
import type { BlogPost, CategoryLayout, Discipline, Project } from './types'

export async function getFeaturedProject(): Promise<Project | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*, images:project_images(*)')
    .eq('featured', true)
    .eq('archived', false)
    .order('sort_order', { referencedTable: 'project_images', ascending: true })
    .limit(1)
    .maybeSingle()
  return data
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*, images:project_images(*)')
    .eq('archived', false)
    // created_at breaks ties so the grid and prev/next agree: a newly created
    // project defaults to sort_order 0 until it is dragged.
    .order('sort_order')
    .order('created_at')
  return data ?? []
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*, images:project_images(*)')
    .eq('slug', slug)
    .eq('archived', false)
    .maybeSingle()
  return data
}

type Adjacent = { title: string; slug: string }

/**
 * Prev/next stays inside the work's own discipline and wraps at either end, so
 * paging through Art never lands you in Architecture. Reads the whole
 * discipline in one query rather than bracketing on sort_order — these are
 * tens of rows, and it makes the wrap a modulo instead of two more round-trips.
 */
export async function getAdjacentProjects(
  slug: string,
  category: Discipline
): Promise<{ prev: Adjacent | null; next: Adjacent | null }> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('title, slug')
    .eq('archived', false)
    .eq('category', category)
    .order('sort_order')
    .order('created_at')

  const works = (data ?? []) as Adjacent[]
  const i = works.findIndex((w) => w.slug === slug)
  // A discipline of one has nowhere to page to, and wrapping would just link
  // the work to itself.
  if (i < 0 || works.length < 2) return { prev: null, next: null }

  return {
    prev: works[(i - 1 + works.length) % works.length],
    next: works[(i + 1) % works.length],
  }
}

export async function getRecentPosts(limit = 3): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
  return data ?? []
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  return data
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('projects')
    .select('slug')
    .eq('archived', false)
  return (data ?? []).map((p) => p.slug)
}

export interface HomeSlide {
  id: string
  image_url: string
  image_width: number
  image_height: number
  link_href: string
  sort_order: number
}

export async function getSiteSetting(key: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  return data?.value ?? null
}

export async function getHomeSlides(): Promise<HomeSlide[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('home_slides')
    .select('id, image_url, image_width, image_height, link_href, sort_order')
    .eq('enabled', true)
    .order('sort_order')
  return data ?? []
}

export async function getCategoryLayouts(): Promise<CategoryLayout[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('category_layouts')
    .select('category, row_height, h_gap, v_gap, last_row')
  return (data ?? []) as CategoryLayout[]
}

export async function getProjectDevelopments(projectId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('project_developments')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order')
  return (data ?? []) as import('./types').ProjectDevelopment[]
}

export async function getAllPostSlugs(): Promise<string[]> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true)
  return (data ?? []).map((p) => p.slug)
}
