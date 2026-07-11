import { verifyApiAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const profile = await verifyApiAuth(['admin', 'editor'])
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { GROQ_API_KEY } = process.env
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 })
  }

  try {
    const { text } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Source text is required' }, { status: 400 })
    }

    const systemPrompt = [
      'You are a botanical data extraction assistant.',
      'Analyze the unstructured text provided and extract information for a single herb.',
      'Ensure names, scientific names, and slugs are correctly identified.',
      'Create realistic summary, short description, benefits (list), preparation instructions, and safety notes.',
      'Return ONLY a valid JSON object matching this schema:',
      '{',
      '  "name": "Common Herb Name",',
      '  "scientific_name": "Scientific Name (Latin)",',
      '  "slug": "lowercase-hyphenated-slug",',
      '  "short_description": "1-2 sentence quick summary.",',
      '  "summary": "Full 2 paragraph overview describing origin and appearance.",',
      '  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],',
      '  "preparation": "Step-by-step preparation and ingestion methods.",',
      '  "safety_notes": "Usage guidelines, side effects, and pregnancy warnings."',
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
        temperature: 0.2,
        max_completion_tokens: 1400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
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
    return NextResponse.json(parsed)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
