import { createAdminClient } from '@/lib/supabase'
import { verifyApiAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const profile = await verifyApiAuth(['admin', 'editor'])
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, scientific_name, slug } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Check slug collision
    const { data: existing } = await admin
      .from('herbs')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Herb with this slug already exists' }, { status: 409 })
    }

    const { data, error } = await admin
      .from('herbs')
      .insert({
        common_name: name,
        scientific_name: scientific_name || null,
        slug,
        is_published: false,
        is_featured: false,
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
    return NextResponse.json({ error: 'Missing herb id' }, { status: 400 })
  }

  try {
    const body = await request.json()
    
    // Create clean update payload matching DB schema
    const dbPayload: any = {}
    
    if (body.name !== undefined) dbPayload.common_name = body.name
    if (body.slug !== undefined) dbPayload.slug = body.slug
    if (body.scientific_name !== undefined) dbPayload.scientific_name = body.scientific_name
    if (body.image_url !== undefined) dbPayload.image_url = body.image_url
    if (body.summary !== undefined) dbPayload.summary = body.summary
    if (body.short_description !== undefined) dbPayload.description = body.short_description
    if (body.preparation !== undefined) dbPayload.preparation_overview = body.preparation
    if (body.safety_notes !== undefined) dbPayload.safety_summary = body.safety_notes
    if (body.is_published !== undefined) dbPayload.is_published = body.is_published
    if (body.is_featured !== undefined) dbPayload.is_featured = body.is_featured
    if (body.origin_note !== undefined) dbPayload.origin_note = body.origin_note

    const admin = createAdminClient()

    const { data, error } = await admin
      .from('herbs')
      .update(dbPayload)
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  // Deleting herbs requires 'admin' role
  const profile = await verifyApiAuth(['admin'])
  if (!profile) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing herb id' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from('herbs')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
