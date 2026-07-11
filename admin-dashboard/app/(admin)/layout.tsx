import { requireRole } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure the user has admin or editor role. Redirects server-side if not.
  const profile = await requireRole(['admin', 'editor'])

  return (
    <div className="shell">
      <Sidebar profile={profile} />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
