import { createAdminClient } from '@/lib/supabase'
import HerbEditClient from '@/components/HerbEditClient'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function HerbEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: herb, error } = await admin
    .from('herbs')
    .select('*, name:common_name, short_description:description, preparation:preparation_overview, safety_notes:safety_summary')
    .eq('id', id)
    .maybeSingle()

  if (error || !herb) {
    notFound()
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <Link href="/herbs" className="text-muted text-sm hover:underline">
            ← Back to Herbs
          </Link>
          <h1 className="page-title mt-2">Edit {herb.name}</h1>
          <p className="page-sub">Customize details, fields, and optimize content using Groq AI</p>
        </div>
      </div>

      <HerbEditClient herb={herb} />
    </div>
  )
}
