import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DbHerb {
  id: string; name: string; slug: string; image_url: string | null;
  summary: string | null; benefits: string | null; scientific_name: string | null;
}
interface DbWellness {
  id: string; name: string; slug: string; image_url: string | null;
  summary: string | null; educational_guidance: string | null;
}
interface DbArticle {
  id: string; title: string; slug: string; cover_image_url: string | null;
  summary: string | null; content: string | null;
}

interface RelatedItem {
  id: string; name: string; slug: string; image_url: string | null;
}

interface AiResponse {
  reply: string;
  herb_slugs?: string[];
  wellness_slugs?: string[];
  article_slugs?: string[];
}

interface SafetyResult {
  safety_level: string;
  explanation: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, conversation_id, user_id } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'A message is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!GROQ_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Server configuration error');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ── 1. Safety classification ──
    const safety = await classifySafety(message, GROQ_API_KEY);
    const safetyLevel = safety.safety_level;

    if (safetyLevel === 'possible_emergency') {
      return new Response(
        JSON.stringify({
          reply: safety.explanation,
          relatedHerbs: [],
          relatedWellness: [],
          relatedArticles: [],
          safetyLevel,
          conversation_id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── 2. Rate limiting ──
    if (user_id) {
      const { count } = await supabase
        .from('ai_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user_id)
        .gte('created_at', new Date(Date.now() - 86400000).toISOString());

      if (count && count >= 20) {
        return new Response(
          JSON.stringify({ error: 'Daily limit of 20 questions reached. Please try again tomorrow.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    // ── 3. Search Supabase for relevant records ──
    const term = message.slice(0, 200);

    const [herbRes, wellnessRes, articleRes] = await Promise.all([
      supabase
        .from('herbs')
        .select('id, name, slug, image_url, summary, benefits, scientific_name')
        .eq('is_published', true)
        .or([
          `name.ilike.%${term}%`,
          `common_name.ilike.%${term}%`,
          `scientific_name.ilike.%${term}%`,
          `summary.ilike.%${term}%`,
          `benefits.ilike.%${term}%`,
        ].join(','))
        .limit(5) as Promise<{ data: DbHerb[] | null }>,
      supabase
        .from('wellness_concerns')
        .select('id, name, slug, image_url, summary, educational_guidance')
        .eq('is_published', true)
        .or([
          `name.ilike.%${term}%`,
          `summary.ilike.%${term}%`,
          `educational_guidance.ilike.%${term}%`,
        ].join(','))
        .limit(5) as Promise<{ data: DbWellness[] | null }>,
      supabase
        .from('articles')
        .select('id, title, slug, cover_image_url, summary, content')
        .eq('is_published', true)
        .or([
          `title.ilike.%${term}%`,
          `summary.ilike.%${term}%`,
          `content.ilike.%${term}%`,
        ].join(','))
        .limit(5) as Promise<{ data: DbArticle[] | null }>,
    ]);

    const herbs = herbRes.data ?? [];
    const wellness = wellnessRes.data ?? [];
    const articles = articleRes.data ?? [];

    // ── 4. Build context for Groq ──
    const sections: string[] = [];

    if (herbs.length > 0) {
      sections.push('--- HERBS IN DATABASE ---');
      for (const h of herbs) {
        sections.push(`Herb: ${h.name}${h.scientific_name ? ` (${h.scientific_name})` : ''}`);
        sections.push(`  Slug: ${h.slug}`);
        if (h.summary) sections.push(`  Summary: ${h.summary}`);
        if (h.benefits) sections.push(`  Benefits: ${h.benefits}`);
      }
    }

    if (wellness.length > 0) {
      sections.push('--- WELLNESS GUIDES IN DATABASE ---');
      for (const w of wellness) {
        sections.push(`Guide: ${w.name}`);
        sections.push(`  Slug: ${w.slug}`);
        if (w.summary) sections.push(`  Summary: ${w.summary}`);
        if (w.educational_guidance) sections.push(`  Guidance: ${w.educational_guidance}`);
      }
    }

    if (articles.length > 0) {
      sections.push('--- ARTICLES IN DATABASE ---');
      for (const a of articles) {
        sections.push(`Article: ${a.title}`);
        sections.push(`  Slug: ${a.slug}`);
        if (a.summary) sections.push(`  Summary: ${a.summary}`);
      }
    }

    const databaseContext = sections.join('\n');

    const systemPrompt = [
      'You are RootedCare, an educational herbal wellness assistant focused on Ghanaian herbs and general wellness.',
      '',
      'RULES:',
      '- Base your answer ONLY on the database records provided below.',
      '- Do NOT invent herbs or wellness guides not in the records.',
      '- If the user asks about something not covered by the records, say you lack that information.',
      '- Give clear and cautious educational information.',
      '- Do NOT diagnose medical conditions.',
      '- Do NOT claim herbs cure diseases.',
      '- Encourage professional medical care for serious, persistent, or worsening symptoms.',
      '- Mention relevant risks, medication interactions, pregnancy concerns, and allergies.',
      '- Never tell a user to stop prescribed medication.',
      '- Keep answers concise and practical (2-4 paragraphs).',
      '- When uncertain, clearly say so.',
      '',
      `SAFETY CLASSIFICATION: ${safetyLevel}`,
      safety.explanation ? `SAFETY NOTE: ${safety.explanation}` : '',
      '',
      databaseContext || 'No matching records found in the database.',
      '',
      'Respond ONLY with a valid JSON object matching this schema:',
      '{ "reply": "your educational response", "herb_slugs": ["matching-slug"], "wellness_slugs": [], "article_slugs": [] }',
      'Include slugs only for records that are relevant to your answer. Use empty arrays when none match.',
    ].filter(Boolean).join('\n');

    // ── 5. Call Groq ──
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_completion_tokens: 900,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      }),
    });

    const groqJson = await groqRes.json();

    if (!groqRes.ok) {
      console.error('Groq API error:', groqJson);
      return new Response(
        JSON.stringify({ error: groqJson?.error?.message ?? 'AI service unavailable.' }),
        { status: groqRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const rawContent = groqJson?.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Empty response from Groq');
    }

    // ── 6. Parse response ──
    let parsed: AiResponse;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = { reply: rawContent, herb_slugs: [], wellness_slugs: [], article_slugs: [] };
    }

    // Build slug → record maps
    const herbBySlug = new Map(herbs.map((h) => [h.slug, h]));
    const wellnessBySlug = new Map(wellness.map((w) => [w.slug, w]));
    const articleBySlug = new Map(articles.map((a) => [a.slug, a]));

    const mapItem = (h: DbHerb): RelatedItem => ({
      id: h.id, name: h.name, slug: h.slug, image_url: h.image_url,
    });
    const mapWellness = (w: DbWellness): RelatedItem => ({
      id: w.id, name: w.name, slug: w.slug, image_url: w.image_url,
    });
    const mapArticle = (a: DbArticle): RelatedItem => ({
      id: a.id, name: a.title, slug: a.slug, image_url: a.cover_image_url,
    });

    const relatedHerbs: RelatedItem[] = (parsed.herb_slugs ?? [])
      .map((slug) => herbBySlug.get(slug))
      .filter((h): h is DbHerb => !!h)
      .map(mapItem);

    const relatedWellness: RelatedItem[] = (parsed.wellness_slugs ?? [])
      .map((slug) => wellnessBySlug.get(slug))
      .filter((w): w is DbWellness => !!w)
      .map(mapWellness);

    const relatedArticles: RelatedItem[] = (parsed.article_slugs ?? [])
      .map((slug) => articleBySlug.get(slug))
      .filter((a): a is DbArticle => !!a)
      .map(mapArticle);

    // ── 7. Track usage ──
    await supabase.from('ai_usage').insert({ user_id: user_id || null, device_id: null }).maybeSingle();

    // ── 8. Save conversation ──
    if (conversation_id) {
      await supabase.from('ai_messages').insert([
        { conversation_id, role: 'user', content: message },
        {
          conversation_id,
          role: 'assistant',
          content: parsed.reply,
          related_herbs: relatedHerbs.length > 0 ? relatedHerbs : null,
          related_wellness: relatedWellness.length > 0 ? relatedWellness : null,
          related_articles: relatedArticles.length > 0 ? relatedArticles : null,
          safety_level: safetyLevel,
        },
      ]);
      await supabase
        .from('ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation_id);
    }

    // ── 9. Return ──
    return new Response(
      JSON.stringify({
        reply: parsed.reply,
        relatedHerbs,
        relatedWellness,
        relatedArticles,
        safetyLevel,
        conversation_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('RootedCare AI error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Something went wrong.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

// ── Safety classification helper ──
async function classifySafety(message: string, apiKey: string): Promise<SafetyResult> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_completion_tokens: 300,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: [
              'Classify the user message into exactly one safety category.',
              'Categories:',
              '- "general": normal wellness or herb inquiry',
              '- "pregnancy": mentions pregnancy, breastfeeding, trying to conceive',
              '- "medication_interaction": mentions prescription medication or drug interactions',
              '- "child_related": about children or infants',
              '- "allergy": mentions allergies or allergic reactions',
              '- "possible_emergency": mentions chest pain, severe breathing difficulty, stroke symptoms, poisoning, unconsciousness, severe bleeding, or similar life-threatening symptoms',
              '- "unknown_herb": mentions an herb by name that is not commonly known',
              '',
              'Respond with JSON: { "safety_level": "category", "explanation": "brief reason for this classification" }',
            ].join('\n'),
          },
          { role: 'user', content: message },
        ],
      }),
    });

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) return { safety_level: 'general', explanation: '' };

    return JSON.parse(content);
  } catch {
    return { safety_level: 'general', explanation: '' };
  }
}
