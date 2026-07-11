import { createAdminClient } from '@/lib/supabase'
import WellnessClient from '@/components/WellnessClient'

export const dynamic = 'force-dynamic'

export default async function WellnessPage() {
  const admin = createAdminClient()

  const { data: concerns, error } = await admin
    .from('wellness_concerns')
    .select('id, name, slug, image_url, is_published, is_featured, updated_at')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching wellness concerns:', error)
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Wellness Guides</h1>
          <p className="page-sub">Create, edit, and publish holistic health guides</p>
        </div>
      </div>

      <WellnessClient initialConcerns={concerns || []} />
    </div>
  )
}
