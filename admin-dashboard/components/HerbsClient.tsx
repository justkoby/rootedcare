'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface HerbSummary {
  id: string
  name: string
  slug: string
  scientific_name: string | null
  image_url: string | null
  is_published: boolean
  is_featured: boolean
  updated_at: string
}

interface HerbsClientProps {
  initialHerbs: HerbSummary[]
}

export default function HerbsClient({ initialHerbs }: HerbsClientProps) {
  const [herbs, setHerbs] = useState<HerbSummary[]>(initialHerbs)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts' | 'featured'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newHerb, setNewHerb] = useState({ name: '', scientific_name: '', slug: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const router = useRouter()

  function triggerToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Handle toggling publish
  async function togglePublish(id: string, currentState: boolean) {
    try {
      const res = await fetch(`/api/admin/herbs?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !currentState }),
      })

      if (!res.ok) throw new Error('Failed to update published status')
      
      setHerbs(prev =>
        prev.map(h => (h.id === id ? { ...h, is_published: !currentState } : h))
      )
      triggerToast(!currentState ? 'Herb published successfully' : 'Herb reverted to draft')
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    }
  }

  // Handle toggling featured
  async function toggleFeatured(id: string, currentState: boolean) {
    try {
      const res = await fetch(`/api/admin/herbs?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !currentState }),
      })

      if (!res.ok) throw new Error('Failed to update featured status')

      setHerbs(prev =>
        prev.map(h => (h.id === id ? { ...h, is_featured: !currentState } : h))
      )
      triggerToast(!currentState ? 'Herb featured successfully' : 'Herb unfeatured')
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    }
  }

  // Handle delete
  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return

    try {
      const res = await fetch(`/api/admin/herbs?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete herb')

      setHerbs(prev => prev.filter(h => h.id !== id))
      triggerToast('Herb deleted successfully')
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    }
  }

  // Handle create
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newHerb.name || !newHerb.slug) {
      triggerToast('Name and slug are required', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/herbs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHerb),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to create herb')
      }

      const created = await res.json()
      triggerToast('Herb created successfully')
      setShowAddModal(false)
      setNewHerb({ name: '', scientific_name: '', slug: '' })
      
      // Redirect to edit page
      router.push(`/herbs/${created.id}`)
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Auto-slugify name
  function handleNameChange(val: string) {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    setNewHerb(prev => ({ ...prev, name: val, slug }))
  }

  // Filtering + Searching logic
  const filteredHerbs = herbs.filter(h => {
    const matchesSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.scientific_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      h.slug.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (filter === 'published') return h.is_published
    if (filter === 'drafts') return !h.is_published
    if (filter === 'featured') return h.is_featured
    return true
  })

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      {/* Control panel */}
      <div className="search-row">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, scientific name, or slug..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-chips">
          <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`chip ${filter === 'published' ? 'active' : ''}`} onClick={() => setFilter('published')}>Published</button>
          <button className={`chip ${filter === 'drafts' ? 'active' : ''}`} onClick={() => setFilter('drafts')}>Drafts</button>
          <button className={`chip ${filter === 'featured' ? 'active' : ''}`} onClick={() => setFilter('featured')}>Featured</button>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add Herb
        </button>
      </div>

      {/* Herbs Table */}
      <div className="table-wrap">
        {filteredHerbs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌿</div>
            <h3>No Herbs Found</h3>
            <p>Try resetting filters or creating a new herb record.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Scientific Name</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHerbs.map((h) => (
                <tr key={h.id}>
                  <td>
                    {h.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={h.image_url} alt={h.name} className="td-img" />
                    ) : (
                      <div className="td-img-placeholder">🌿</div>
                    )}
                  </td>
                  <td>
                    <div className="td-name">{h.name}</div>
                    <div className="td-slug">{h.slug}</div>
                  </td>
                  <td>
                    <span className="text-muted italic">{h.scientific_name || '—'}</span>
                  </td>
                  <td>
                    <button
                      className={`toggle ${h.is_published ? 'on' : 'off'}`}
                      onClick={() => togglePublish(h.id, h.is_published)}
                    />
                  </td>
                  <td>
                    <button
                      className={`btn btn-icon ${h.is_featured ? 'active' : ''}`}
                      onClick={() => toggleFeatured(h.id, h.is_featured)}
                    >
                      ★
                    </button>
                  </td>
                  <td>
                    <span className="text-xs text-muted">
                      {new Date(h.updated_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <Link href={`/herbs/${h.id}`} className="btn btn-ghost btn-sm">
                        Edit
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(h.id, h.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="panel-overlay" onClick={() => setShowAddModal(false)}>
          <div className="panel" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
              <h2>Add New Herb</h2>
              <button className="btn btn-icon" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="panel-body">
                <div className="field mb-4">
                  <label>Herb Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. African Nutmeg"
                    value={newHerb.name}
                    onChange={e => handleNameChange(e.target.value)}
                    required
                  />
                </div>

                <div className="field mb-4">
                  <label>Scientific Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Monodora myristica"
                    value={newHerb.scientific_name}
                    onChange={e => setNewHerb(prev => ({ ...prev, scientific_name: e.target.value }))}
                  />
                </div>

                <div className="field mb-4">
                  <label>Slug</label>
                  <input
                    type="text"
                    className="input font-mono"
                    placeholder="african-nutmeg"
                    value={newHerb.slug}
                    onChange={e => setNewHerb(prev => ({ ...prev, slug: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="panel-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create & Edit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
