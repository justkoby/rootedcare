'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Client-side Supabase client (anon key only).
 * Safe to use in client components for auth and public data reads.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
