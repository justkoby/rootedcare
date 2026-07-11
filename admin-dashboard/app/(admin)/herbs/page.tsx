import { createAdminClient } from '@/lib/supabase'
import HerbsClient from '@/components/HerbsClient'

export const dynamic = 'force-dynamic'

export default async function HerbsPage() {
  const admin = createAdminClient()

  const { data: herbs, error } = await admin
    .from('herbs')
    .select('id, name:common_name, slug, scientific_name, image_url, is_published, is_featured, updated_at')
    .order('common_name', { ascending: true })

  if (error) {
    console.error('Error fetching herbs:', error)
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Herbs Encyclopedia</h1>
          <p className="page-sub">Create, edit, and publish botanical records</p>
        </div>
      </div>

      <HerbsClient initialHerbs={herbs || []} />
    </div>
  )
}
