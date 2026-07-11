'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Article {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  summary: string | null
  content: string | null
  is_published: boolean
  is_featured: boolean
  updated_at: string
}

interface ArticlesClientProps {
  initialArticles: Omit<Article, 'summary' | 'content'>[]
}

export default function ArticlesClient({ initialArticles }: ArticlesClientProps) {
  const [articles, setArticles] = useState(initialArticles)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts' | 'featured'>('all')

  const [panelState, setPanelState] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    id?: string
  }>({ open: false, mode: 'create' })

  const [form, setForm] = useState<Omit<Article, 'id' | 'updated_at'>>({
    title: '',
    slug: '',
    cover_image_url: '',
    summary: '',
    content: '',
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

  // Auto-slugify title
  function handleTitleChange(val: string) {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    setForm(prev => ({ ...prev, title: val, slug }))
  }

  // Open panel for creating
  function openCreate() {
    setForm({
      title: '',
      slug: '',
      cover_image_url: '',
      summary: '',
      content: '',
      is_published: false,
      is_featured: false,
    })
    setPanelState({ open: true, mode: 'create' })
  }

  // Open panel for editing
  async function openEdit(id: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/articles?id=${id}`)
      if (!res.ok) throw new Error('Failed to load article details')
      const data = await res.json()
      setForm({
        title: data.title,
        slug: data.slug,
        cover_image_url: data.cover_image_url || '',
        summary: data.summary || '',
        content: data.content || '',
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

  // Save changes
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const method = panelState.mode === 'create' ? 'POST' : 'PATCH'
      const url = panelState.mode === 'create' ? '/api/admin/articles' : `/api/admin/articles?id=${panelState.id}`

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to save article')
      }

      triggerToast(panelState.mode === 'create' ? 'Article created!' : 'Article saved!')
      setPanelState({ open: false, mode: 'create' })

      // Reload list
      const freshRes = await fetch('/api/admin/articles')
      if (freshRes.ok) {
        const data = await freshRes.json()
        setArticles(data)
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
      const res = await fetch(`/api/admin/articles?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !currentState }),
      })
      if (!res.ok) throw new Error('Failed to update published status')
      setArticles(prev =>
        prev.map(a => (a.id === id ? { ...a, is_published: !currentState } : a))
      )
      triggerToast(!currentState ? 'Article published' : 'Article reverted to draft')
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    }
  }

  // Toggle featured state directly from table
  async function toggleFeatured(id: string, currentState: boolean) {
    try {
      const res = await fetch(`/api/admin/articles?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !currentState }),
      })
      if (!res.ok) throw new Error('Failed to update featured status')
      setArticles(prev =>
        prev.map(a => (a.id === id ? { ...a, is_featured: !currentState } : a))
      )
      triggerToast(!currentState ? 'Article starred' : 'Article unstarred')
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    }
  }

  // Handle delete
  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    try {
      const res = await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete article')
      setArticles(prev => prev.filter(a => a.id !== id))
      triggerToast('Article deleted successfully')
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    }
  }

  // Search + Filter calculations
  const filtered = articles.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (filter === 'published') return a.is_published
    if (filter === 'drafts') return !a.is_published
    if (filter === 'featured') return a.is_featured
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
            placeholder="Search articles..."
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
          + Add Article
        </button>
      </div>

      {/* Table */}
      <div className="table-wrap">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📰</div>
            <h3>No Articles Found</h3>
            <p>Try resetting filters or adding a new educational article.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.cover_image_url} alt={a.title} className="td-img" />
                    ) : (
                      <div className="td-img-placeholder">📰</div>
                    )}
                  </td>
                  <td>
                    <div className="td-name">{a.title}</div>
                    <div className="td-slug">{a.slug}</div>
                  </td>
                  <td>
                    <button
                      className={`toggle ${a.is_published ? 'on' : 'off'}`}
                      onClick={() => togglePublish(a.id, a.is_published)}
                    />
                  </td>
                  <td>
                    <button
                      className={`btn btn-icon ${a.is_featured ? 'active' : ''}`}
                      onClick={() => toggleFeatured(a.id, a.is_featured)}
                    >
                      ★
                    </button>
                  </td>
                  <td>
                    <span className="text-xs text-muted">
                      {new Date(a.updated_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a.id)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(a.id, a.title)}
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
          <div className="panel" onClick={e => e.stopPropagation()} style={{ width: '640px' }}>
            <div className="panel-header">
              <h2>{panelState.mode === 'create' ? 'Add Article' : `Edit ${form.title}`}</h2>
              <button className="btn btn-icon" onClick={() => setPanelState(prev => ({ ...prev, open: false }))}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="panel-body flex flex-col gap-4">
                <div className="field">
                  <label>Title</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Prekese: The Sacred Fruit"
                    value={form.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label>Slug</label>
                  <input
                    type="text"
                    className="input font-mono"
                    placeholder="prekese-sacred-fruit"
                    value={form.slug}
                    onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    required
                  />
                </div>

                <div className="field">
                  <label>Cover Image URL</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="https://..."
                    value={form.cover_image_url || ''}
                    onChange={e => setForm(prev => ({ ...prev, cover_image_url: e.target.value }))}
                  />
                </div>

                <div className="field">
                  <label>Summary / Excerpt (1-2 sentences)</label>
                  <textarea
                    className="textarea"
                    placeholder="Briefly state what this article covers..."
                    value={form.summary || ''}
                    onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
                  />
                </div>

                <div className="field">
                  <label>Content (Markdown / text)</label>
                  <textarea
                    className="textarea"
                    placeholder="Write the full article body..."
                    value={form.content || ''}
                    onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                    style={{ minHeight: '260px' }}
                  />
                </div>

                <div className="flex gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="art_published"
                      checked={form.is_published}
                      onChange={e => setForm(prev => ({ ...prev, is_published: e.target.checked }))}
                      style={{ width: 'auto', transform: 'scale(1.2)' }}
                    />
                    <label htmlFor="art_published" className="font-bold cursor-pointer select-none text-sm">Published</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="art_featured"
                      checked={form.is_featured}
                      onChange={e => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                      style={{ width: 'auto', transform: 'scale(1.2)' }}
                    />
                    <label htmlFor="art_featured" className="font-bold cursor-pointer select-none text-sm">Featured</label>
                  </div>
                </div>
              </div>
              <div className="panel-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setPanelState(prev => ({ ...prev, open: false }))}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : panelState.mode === 'create' ? 'Create Article' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
