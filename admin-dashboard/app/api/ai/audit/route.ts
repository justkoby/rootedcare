import { createAdminClient } from '@/lib/supabase'
import { verifyApiAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const profile = await verifyApiAuth(['admin', 'editor'])
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing herb id' }, { status: 400 })
  }

  const { GROQ_API_KEY } = process.env
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 })
  }

  try {
    const { name, scientific_name, missing_fields } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Herb name is required' }, { status: 400 })
    }

    // Build instruction based on what is missing
    const needed: string[] = []
    if (missing_fields.short_description) needed.push('short_description: A concise 1-2 sentence overview.')
    if (missing_fields.summary) needed.push('summary: A 2-paragraph detailed botanical description.')
    if (missing_fields.benefits) needed.push('benefits: List of 3-5 clear health benefits.')
    if (missing_fields.preparation) needed.push('preparation: Safe methods of preparation (hot tea, grinding etc.)')
    if (missing_fields.safety_notes) needed.push('safety_notes: Essential safety alerts, precautions, and warnings.')

    if (needed.length === 0) {
      return NextResponse.json({ message: 'No fields are missing.' })
    }

    const systemPrompt = [
      'You are a botanical research assistant.',
      `Generate the requested missing data fields for the herb "${name}" (${scientific_name || 'unknown scientific name'}).`,
      'Return ONLY a valid JSON object containing exactly the keys requested below.',
      'Do not include keys that were not requested.',
      'Schema to match:',
      '{',
      needed.join('\n  '),
      '}'
    ].join('\n')

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.25,
        max_completion_tokens: 1000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Provide the missing fields for the herb ${name}.` },
        ],
      }),
    })

    const groqJson = await groqRes.json()

    if (!groqRes.ok) {
      console.error('Groq API error:', groqJson)
      return NextResponse.json(
        { error: groqJson?.error?.message ?? 'AI service unavailable.' },
        { status: groqRes.status }
      )
    }

    const rawContent = groqJson?.choices?.[0]?.message?.content
    if (!rawContent) {
      throw new Error('Empty response from Groq')
    }

    const parsed = JSON.parse(rawContent)

    // Normalize benefits from array to newline string if returned as array
    if (parsed.benefits && Array.isArray(parsed.benefits)) {
      parsed.benefits = parsed.benefits.join('\n')
    }

    // Save directly to the database
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('herbs')
      .update(parsed)
      .eq('id', id)
      .select('id, name:common_name, slug, image_url, short_description, summary, benefits, preparation, safety_notes')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
