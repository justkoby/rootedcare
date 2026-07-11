import { createAdminClient } from '@/lib/supabase'
import DashboardClient from '@/components/DashboardClient'

export const dynamic = 'force-dynamic' // force dynamic rendering to fetch fresh stats every request

export default async function DashboardPage() {
  const admin = createAdminClient()

  // Fetch stats concurrently
  const [
    herbsRes,
    wellnessRes,
    articlesRes,
    usersRes,
    unpublishedHerbs,
    unpublishedWellness,
    unpublishedArticles,
  ] = await Promise.all([
    admin.from('herbs').select('*', { count: 'exact', head: true }),
    admin.from('wellness_concerns').select('*', { count: 'exact', head: true }),
    admin.from('articles').select('*', { count: 'exact', head: true }),
    admin.from('user_profiles').select('*', { count: 'exact', head: true }),
    admin.from('herbs').select('id, name:common_name').eq('is_published', false),
    admin.from('wellness_concerns').select('id, title:name').eq('is_published', false),
    admin.from('articles').select('id, title').eq('is_published', false),
  ])

  console.log('DEBUG DASHBOARD COUNTS:', {
    herbs: { count: herbsRes.count, error: herbsRes.error },
    wellness: { count: wellnessRes.count, error: wellnessRes.error },
    articles: { count: articlesRes.count, error: articlesRes.error },
    users: { count: usersRes.count, error: usersRes.error },
    unpublishedHerbs: unpublishedHerbs.data?.length,
    unpublishedWellness: unpublishedWellness.data?.length,
    unpublishedArticles: unpublishedArticles.data?.length,
  })

  // Look for incomplete herbs/wellness/articles
  // Incomplete definition: missing image_url, description/summary, or key fields
  const [incompleteHerbsRes, incompleteWellnessRes, incompleteArticlesRes] = await Promise.all([
    admin.from('herbs')
      .select('id, name:common_name, slug, image_url, short_description')
      .or('image_url.is.null,short_description.is.null,scientific_name.is.null'),
    admin.from('wellness_concerns')
      .select('id, title:name, slug, image_url, description:educational_guidance')
      .or('image_url.is.null,educational_guidance.is.null'),
    admin.from('articles')
      .select('id, title, slug, image_url, summary')
      .or('image_url.is.null,summary.is.null'),
  ])

  const stats = {
    herbsCount: herbsRes.count || 0,
    wellnessCount: wellnessRes.count || 0,
    articlesCount: articlesRes.count || 0,
    usersCount: usersRes.count || 0,
    totalDraftsCount: (unpublishedHerbs.data?.length || 0) + (unpublishedWellness.data?.length || 0) + (unpublishedArticles.data?.length || 0),
    incompleteHerbs: incompleteHerbsRes.data || [],
    incompleteWellness: incompleteWellnessRes.data || [],
    incompleteArticles: incompleteArticlesRes.data || [],
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-sub">RootedCare system metrics and health overview</p>
        </div>
      </div>

      <DashboardClient stats={stats} />
    </div>
  )
}
