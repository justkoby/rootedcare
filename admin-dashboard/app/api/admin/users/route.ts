import { createAdminClient } from '@/lib/supabase'
import { verifyApiAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  // Only admins can modify roles
  const profile = await verifyApiAuth(['admin'])
  if (!profile) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
  }

  try {
    const { role } = await request.json()
    if (!role || !['admin', 'editor', 'doctor', 'user'].includes(role)) {
      return NextResponse.json({ error: 'Invalid or missing role' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('user_profiles')
      .update({ role })
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
