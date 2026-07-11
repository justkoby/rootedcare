import { verifyApiAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Ensure user is authorized
  const profile = await verifyApiAuth(['admin', 'editor'])
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { GROQ_API_KEY } = process.env
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'Groq API key not configured on server' }, { status: 500 })
  }

  try {
    const { name, scientific_name, current_description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Herb name is required' }, { status: 400 })
    }

    const systemPrompt = [
      'You are a botanical research AI specializing in traditional medicine and herbal pharmacology.',
      'Generate accurate, structured educational details for the requested herb in JSON format.',
      'Rely on established botanical records and scientific literature.',
      'Provide realistic preparation steps and real caution details.',
      'Return ONLY a valid JSON object matching this schema:',
      '{',
      '  "short_description": "A concise 1-2 sentence summary of the herb (approx 20-30 words).",',
      '  "summary": "A comprehensive 2-3 paragraph overview describing the plant, origin, and general reputation.",',
      '  "benefits": ["Benefit 1 (e.g. Relieves indigestion)", "Benefit 2", "Benefit 3"],',
      '  "preparation": "Step-by-step guidance on how to prepare and ingest (infusions, decoctions, etc.)",',
      '  "safety_notes": "Key warnings, dosage limits, side effects, and pregnancy cautions."}',
    ].join('\n')

    const userMessage = [
      `Herb: ${name}`,
      scientific_name ? `Scientific Name: ${scientific_name}` : '',
      current_description ? `Current Draft Description: ${current_description}` : '',
    ].filter(Boolean).join('\n')

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_completion_tokens: 1200,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
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
