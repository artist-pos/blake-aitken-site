export interface Project {
  id: string
  title: string
  slug: string
  category: 'art' | 'architecture' | 'concept' | 'venture'
  date: string
  location?: string
  description?: string
  featured: boolean
  archived: boolean
  sort_order: number
  tags: string[]
  model_url?: string
  created_at: string
  updated_at: string
  images?: ProjectImage[]
}

export interface ProjectImage {
  id: string
  project_id: string
  url: string
  alt?: string
  width: number
  height: number
  sort_order: number
  is_thumbnail: boolean
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  category?: string
  published: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

export interface FormSubmission {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  read: boolean
  created_at: string
}
