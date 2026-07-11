'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserSummary {
  id: string
  email: string | null
  role: 'admin' | 'editor' | 'doctor' | 'user'
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

interface UsersClientProps {
  initialUsers: UserSummary[]
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const router = useRouter()

  function triggerToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!res.ok) throw new Error('Failed to update user role')

      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: newRole as any } : u))
      )
      triggerToast('User role updated successfully!')
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const filtered = users.filter(u => {
    const term = search.toLowerCase()
    return (
      (u.email || '').toLowerCase().includes(term) ||
      (u.full_name || '').toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    )
  })

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      {/* Search toolbar */}
      <div className="search-row">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search users by email, name, or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Users table */}
      <div className="table-wrap">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Users Found</h3>
            <p>Try refining your search criteria.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Registration Date</th>
                <th>Assign Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                        {u.email ? u.email[0].toUpperCase() : '★'}
                      </div>
                      <div>
                        <div className="td-name">{u.full_name || 'Anonymous User'}</div>
                        <div className="td-slug" style={{ textTransform: 'none' }}>{u.email || 'No email registered'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${u.role === 'admin' ? 'admin' : u.role === 'editor' ? 'editor' : 'draft'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-muted">
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <select
                      className="select"
                      style={{ width: '130px', padding: '5px 8px', fontSize: '12px' }}
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      disabled={loading}
                    >
                      <option value="user">User</option>
                      <option value="doctor">Doctor</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
