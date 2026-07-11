import { createAdminClient } from '@/lib/supabase'
import UsersClient from '@/components/UsersClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const admin = createAdminClient()

  const { data: users, error } = await admin
    .from('user_profiles')
    .select('id, email, role, full_name, avatar_url, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user profiles:', error)
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-sub">Assign administrative roles and manage account access privileges</p>
        </div>
      </div>

      <UsersClient initialUsers={users || []} />
    </div>
  )
}
