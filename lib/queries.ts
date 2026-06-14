import { createClient } from './supabase/server'
import { createStaticClient } from './supabase/static'
import type { BlogPost, Project } from './types'

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
    .order('sort_order')
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

export async function getAdjacentProjects(
  sortOrder: number
): Promise<{ prev: { title: string; slug: string } | null; next: { title: string; slug: string } | null }> {
  const supabase = await createClient()
  const [{ data: prevData }, { data: nextData }] = await Promise.all([
    supabase
      .from('projects')
      .select('title, slug')
      .eq('archived', false)
      .lt('sort_order', sortOrder)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('projects')
      .select('title, slug')
      .eq('archived', false)
      .gt('sort_order', sortOrder)
      .order('sort_order')
      .limit(1)
      .maybeSingle(),
  ])
  return { prev: prevData ?? null, next: nextData ?? null }
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

export async function getAllPostSlugs(): Promise<string[]> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true)
  return (data ?? []).map((p) => p.slug)
}
