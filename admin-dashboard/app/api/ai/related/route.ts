import { createAdminClient } from '@/lib/supabase'
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
    const admin = createAdminClient()

    // 1. Fetch all items
    const [herbsRes, wellnessRes, articlesRes] = await Promise.all([
      admin.from('herbs').select('id, name:common_name, slug, short_description'),
      admin.from('wellness_concerns').select('id, name, slug, summary'),
      admin.from('articles').select('id, title, slug, summary'),
    ])

    const herbs = herbsRes.data || []
    const wellness = wellnessRes.data || []
    const articles = articlesRes.data || []

    const itemsContext = [
      'HERBS:',
      ...herbs.map(h => `- ${h.name} (slug: ${h.slug}, desc: ${h.short_description})`),
      'WELLNESS GUIDES:',
      ...wellness.map(w => `- ${w.name} (slug: ${w.slug}, desc: ${w.summary})`),
      'ARTICLES:',
      ...articles.map(a => `- ${a.title} (slug: ${a.slug}, desc: ${a.summary})`),
    ].join('\n')

    const systemPrompt = [
      'You are a content analyzer AI.',
      'Analyze the list of herbs, wellness concerns, and articles provided.',
      'Group items that are semantically related (e.g. have similar symptoms, targets, or botanical properties).',
      'Create a detailed linking summary explaining which items should be linked together in the mobile app, and why.',
      'Provide your output as a clean, readable text log format.',
    ].join('\n')

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_completion_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: itemsContext },
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

    return NextResponse.json({ summary: rawContent })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
