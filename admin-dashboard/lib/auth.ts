import { createSupabaseServerClient } from './supabase'
import { redirect } from 'next/navigation'

export type UserRole = 'admin' | 'editor' | 'doctor' | 'user'

export interface UserProfile {
  id: string
  email: string | null
  role: UserRole
  full_name: string | null
  avatar_url: string | null
}

/**
 * Require authentication. Redirects to /login if no session.
 */
export async function requireAuth() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user
}

/**
 * Require a specific role. Redirects to /forbidden if role doesn't match.
 */
export async function requireRole(roles: UserRole[] = ['admin', 'editor']): Promise<UserProfile> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('id, email, role, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  console.log('DEBUG REQUIRE ROLE:', { 
    userId: user.id, 
    userEmail: user.email, 
    profile, 
    error: error ? { message: error.message, details: error.details } : null 
  })

  if (!profile || !roles.includes((profile.role ?? 'user') as UserRole)) {
    redirect('/forbidden')
  }

  return profile as UserProfile
}

/**
 * For use in API route handlers. Returns null instead of redirecting.
 */
export async function verifyApiAuth(roles: UserRole[] = ['admin', 'editor']): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, email, role, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile || !roles.includes((profile.role ?? 'user') as UserRole)) return null
  return profile as UserProfile
}
