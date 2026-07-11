'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface WellnessConcern {
  id: string
  name: string
  slug: string
  image_url: string | null
  summary: string | null
  educational_guidance: string | null
  is_published: boolean
  is_featured: boolean
  updated_at: string
}

interface WellnessClientProps {
  initialConcerns: Omit<WellnessConcern, 'summary' | 'educational_guidance'>[]
}

export default function WellnessClient({ initialConcerns }: WellnessClientProps) {
  const [concerns, setConcerns] = useState(initialConcerns)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts' | 'featured'>('all')
  
  const [panelState, setPanelState] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    id?: string
  }>({ open: false, mode: 'create' })

  const [form, setForm] = useState<Omit<WellnessConcern, 'id' | 'updated_at'>>({
    name: '',
    slug: '',
    image_url: '',
    summary: '',
    educational_guidance: '',
    is_published: false,
    is_featured: false,
  })

  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const router = useRouter()

  function triggerToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Auto-slugify name
  function handleNameChange(val: string) {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    setForm(prev => ({ ...prev, name: val, slug }))
  }

  // Open panel for creating
  function openCreate() {
    setForm({
      name: '',
      slug: '',
      image_url: '',
      summary: '',
      educational_guidance: '',
      is_published: false,
      is_featured: false,
    })
    setPanelState({ open: true, mode: 'create' })
  }

  // Open panel for editing
  async function openEdit(id: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/wellness?id=${id}`)
      if (!res.ok) throw new Error('Failed to load wellness details')
      const data = await res.json()
      setForm({
        name: data.name,
        slug: data.slug,
        image_url: data.image_url || '',
        summary: data.summary || '',
        educational_guidance: data.educational_guidance || '',
        is_published: data.is_published,
        is_featured: data.is_featured,
      })
      setPanelState({ open: true, mode: 'edit', id })
    } catch (err: any) {
      triggerToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Save changes (POST or PATCH)
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const method = panelState.mode === 'create' ? 'POST' : 'PATCH'
      const url = panelState.mode === 'create' ? '/api/admin/wellness' : `/api/admin/wellness?id=${panelState.id}`

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to save changes')
      }

      triggerToast(panelState.mode === 'create' ? 'Wellness guide created!' : 'Wellness guide saved!')
      setPanelState({ open: false, mode: 'create' })
      
      // Reload list
      const freshRes = await fetch('/api/admin/wellness')
      if (freshRes.ok) {
        const data = await freshRes.json()
        setConcerns(data)
      }
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Toggle publish state directly from table
  async function togglePublish(id: string, currentState: boolean) {
    try {
      const res = await fetch(`/api/admin/wellness?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !currentState }),
      })
      if (!res.ok) throw new Error('Failed to update published status')
      setConcerns(prev =>
        prev.map(c => (c.id === id ? { ...c, is_published: !currentState } : c))
      )
      triggerToast(!currentState ? 'Guide published' : 'Guide reverted to draft')
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    }
  }

  // Toggle featured state directly from table
  async function toggleFeatured(id: string, currentState: boolean) {
    try {
      const res = await fetch(`/api/admin/wellness?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !currentState }),
      })
      if (!res.ok) throw new Error('Failed to update featured status')
      setConcerns(prev =>
        prev.map(c => (c.id === id ? { ...c, is_featured: !currentState } : c))
      )
      triggerToast(!currentState ? 'Guide starred' : 'Guide unstarred')
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    }
  }

  // Handle delete
  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      const res = await fetch(`/api/admin/wellness?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete guide')
      setConcerns(prev => prev.filter(c => c.id !== id))
      triggerToast('Guide deleted successfully')
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    }
  }

  // Search + Filter calculations
  const filtered = concerns.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (filter === 'published') return c.is_published
    if (filter === 'drafts') return !c.is_published
    if (filter === 'featured') return c.is_featured
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

      {/* Toolbar */}
      <div className="search-row">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search wellness guides..."
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

        <button className="btn btn-primary" onClick={openCreate}>
          + Add Guide
        </button>
      </div>

      {/* Table */}
      <div className="table-wrap">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧘</div>
            <h3>No Wellness Guides Found</h3>
            <p>Try resetting filters or adding a new wellness concern.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name / Title</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image_url} alt={c.name} className="td-img" />
                    ) : (
                      <div className="td-img-placeholder">🧘</div>
                    )}
                  </td>
                  <td>
                    <div className="td-name">{c.name}</div>
                    <div className="td-slug">{c.slug}</div>
                  </td>
                  <td>
                    <button
                      className={`toggle ${c.is_published ? 'on' : 'off'}`}
                      onClick={() => togglePublish(c.id, c.is_published)}
                    />
                  </td>
                  <td>
                    <button
                      className={`btn btn-icon ${c.is_featured ? 'active' : ''}`}
                      onClick={() => toggleFeatured(c.id, c.is_featured)}
                    >
                      ★
                    </button>
                  </td>
                  <td>
                    <span className="text-xs text-muted">
                      {new Date(c.updated_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c.id)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(c.id, c.name)}
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

      {/* Slide-over Edit Panel */}
      {panelState.open && (
        <div className="panel-overlay" onClick={() => setPanelState(prev => ({ ...prev, open: false }))}>
          <div className="panel" onClick={e => e.stopPropagation()} style={{ width: '580px' }}>
            <div className="panel-header">
              <h2>{panelState.mode === 'create' ? 'Add Wellness Guide' : `Edit ${form.name}`}</h2>
              <button className="btn btn-icon" onClick={() => setPanelState(prev => ({ ...prev, open: false }))}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="panel-body flex flex-col gap-4">
                <div className="field">
                  <label>Title / Concern Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Digestive Health"
                    value={form.name}
                    onChange={e => handleNameChange(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label>Slug</label>
                  <input
                    type="text"
                    className="input font-mono"
                    placeholder="digestive-health"
                    value={form.slug}
                    onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    required
                  />
                </div>

                <div className="field">
                  <label>Image URL</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="https://..."
                    value={form.image_url || ''}
                    onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                  />
                </div>

                <div className="field">
                  <label>Short Description (Summary)</label>
                  <textarea
                    className="textarea"
                    placeholder="Provide a quick overview of this concern..."
                    value={form.summary || ''}
                    onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
                  />
                </div>

                <div className="field">
                  <label>Educational Guidance (Body text / Markdown)</label>
                  <textarea
                    className="textarea"
                    placeholder="Detailed steps, lifestyle recommendations, and dietary advice..."
                    value={form.educational_guidance || ''}
                    onChange={e => setForm(prev => ({ ...prev, educational_guidance: e.target.value }))}
                    style={{ minHeight: '180px' }}
                  />
                </div>

                <div className="flex gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="wp_published"
                      checked={form.is_published}
                      onChange={e => setForm(prev => ({ ...prev, is_published: e.target.checked }))}
                      style={{ width: 'auto', transform: 'scale(1.2)' }}
                    />
                    <label htmlFor="wp_published" className="font-bold cursor-pointer select-none text-sm">Published</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="wp_featured"
                      checked={form.is_featured}
                      onChange={e => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                      style={{ width: 'auto', transform: 'scale(1.2)' }}
                    />
                    <label htmlFor="wp_featured" className="font-bold cursor-pointer select-none text-sm">Featured</label>
                  </div>
                </div>
              </div>
              <div className="panel-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setPanelState(prev => ({ ...prev, open: false }))}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : panelState.mode === 'create' ? 'Create Guide' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
