import { createAdminClient } from '@/lib/supabase'
import AiStudioClient from '@/components/AiStudioClient'

export const dynamic = 'force-dynamic'

export default async function AiStudioPage() {
  const admin = createAdminClient()

  // Load basic herb/wellness items for the auditor and preview lists
  const [herbsRes, wellnessRes] = await Promise.all([
    admin.from('herbs').select('id, name, slug, image_url, short_description, summary, benefits, preparation, safety_notes').order('name'),
    admin.from('wellness_concerns').select('id, name, slug, image_url, summary, educational_guidance').order('name'),
  ])

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Content Studio</h1>
          <p className="page-sub">Generate drafts from research papers, audit database gaps, and auto-link items</p>
        </div>
      </div>

      <AiStudioClient
        herbs={herbsRes.data || []}
        wellness={wellnessRes.data || []}
      />
    </div>
  )
}
