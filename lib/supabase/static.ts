import { createClient } from '@supabase/supabase-js'

// Cookie-free client for use at build time (generateStaticParams, generateMetadata)
export function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
