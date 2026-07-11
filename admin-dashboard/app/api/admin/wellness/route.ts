import { createAdminClient } from '@/lib/supabase'
import { verifyApiAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const profile = await verifyApiAuth(['admin', 'editor'])
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    // Return all concerns
    try {
      const admin = createAdminClient()
      const { data, error } = await admin
        .from('wellness_concerns')
        .select('id, name, slug, image_url, is_published, is_featured, updated_at')
        .order('name', { ascending: true })

      if (error) throw error
      return NextResponse.json(data)
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('wellness_concerns')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const profile = await verifyApiAuth(['admin', 'editor'])
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, slug } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Check slug collision
    const { data: existing } = await admin
      .from('wellness_concerns')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Wellness guide with this slug already exists' }, { status: 409 })
    }

    const { data, error } = await admin
      .from('wellness_concerns')
      .insert({
        ...body,
        is_published: body.is_published ?? false,
        is_featured: body.is_featured ?? false,
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const profile = await verifyApiAuth(['admin', 'editor'])
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing wellness guide id' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('wellness_concerns')
      .update(body)
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const profile = await verifyApiAuth(['admin'])
  if (!profile) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing wellness guide id' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from('wellness_concerns')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
