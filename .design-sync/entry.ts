// Bundle entry for design-sync.
//
// This repo is a Next.js app, not a published library, so there is no dist/
// entry to point the converter at. This barrel is that entry: it names exactly
// the presentational components that render outside Next, keeping the
// Supabase- and server-action-coupled admin components out of the bundle.
//
// next/image, next/link, next/navigation and next/dynamic resolve to the shims
// in ./shims via the paths block in ./tsconfig.sync.json.
export { default as Nav } from '../components/Nav'
export { default as Footer } from '../components/Footer'
export { default as HeroSection } from '../components/HeroSection'
export { default as FeaturedWork } from '../components/FeaturedWork'
export { default as FilterBar } from '../components/FilterBar'
export { default as ProjectSection } from '../components/ProjectSection'
export { default as ProjectGrid } from '../components/ProjectGrid'
export { default as ProjectListView } from '../components/ProjectListView'
export { default as ProjectDevelopmentSection } from '../components/ProjectDevelopmentSection'
export { default as WorkImageGrid } from '../components/WorkImageGrid'
export { default as Lightbox } from '../components/Lightbox'
export { default as BlogCard } from '../components/BlogCard'
export { default as BlogSection } from '../components/BlogSection'
export { default as MarkdownContent } from '../components/MarkdownContent'
export { default as ContactForm } from '../components/ContactForm'
