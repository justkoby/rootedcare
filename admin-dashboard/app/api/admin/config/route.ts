import { createAdminClient } from '@/lib/supabase'
import { verifyApiAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  const profile = await verifyApiAuth(['admin', 'editor'])
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'Missing config key' }, { status: 400 })
  }

  try {
    const { value } = await request.json()
    if (value === undefined) {
      return NextResponse.json({ error: 'Value is required' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('app_config')
      .update({ value })
      .eq('key', key)
      .select()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
