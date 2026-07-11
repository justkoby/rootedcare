import { createAdminClient } from '@/lib/supabase'
import AiConfigClient from '@/components/AiConfigClient'

export const dynamic = 'force-dynamic'

export default async function AiConfigPage() {
  const admin = createAdminClient()

  const { data: configs, error } = await admin
    .from('app_config')
    .select('*')
    .order('key', { ascending: true })

  if (error) {
    console.error('Error fetching app config:', error)
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI & App Configuration</h1>
          <p className="page-sub">Configure dynamic rate limits, models, and limits across your platforms</p>
        </div>
      </div>

      <AiConfigClient initialConfigs={configs || []} />
    </div>
  )
}
