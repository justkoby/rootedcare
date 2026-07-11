import { createAdminClient } from '@/lib/supabase'
import ArticlesClient from '@/components/ArticlesClient'

export const dynamic = 'force-dynamic'

export default async function ArticlesPage() {
  const admin = createAdminClient()

  const { data: articles, error } = await admin
    .from('articles')
    .select('id, title, slug, cover_image_url, is_published, is_featured, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching articles:', error)
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Articles & Guides</h1>
          <p className="page-sub">Create, edit, and publish health education articles</p>
        </div>
      </div>

      <ArticlesClient initialArticles={articles || []} />
    </div>
  )
}
