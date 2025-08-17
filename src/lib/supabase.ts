import { createBrowserClient, createServerClient as createSupabaseServerClient } from '@supabase/ssr'

// Singleton pattern for client-side Supabase client
let browserClient: ReturnType<typeof createBrowserClient> | null = null

// Client-side Supabase client
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

// Unified Supabase client getter
export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    return createServerClient()
  }
  
  if (!browserClient) {
    browserClient = createClient()
  }
  
  return browserClient
}

// Server-side Supabase client
export const createServerClient = () => {
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get() {
          return undefined
        },
        set() {
          // Handle cookie setting for server-side
        },
        remove() {
          // Handle cookie removal for server-side
        },
      },
    }
  )
}

// Auth configuration
export const authConfig = {
  providers: ['google'],
  redirectTo: process.env.NODE_ENV === 'production' 
    ? 'https://hikaku.apaf.me/auth/callback'
    : 'http://localhost:3002/auth/callback'
}