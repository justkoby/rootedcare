'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Herb {
  id: string
  name: string
  slug: string
  scientific_name: string | null
  local_names: string | null
  image_url: string | null
  short_description: string | null
  summary: string | null
  benefits: string | null
  preparation: string | null
  safety_notes: string | null
  is_published: boolean
  is_featured: boolean
}

interface HerbEditClientProps {
  herb: Herb
}

export default function HerbEditClient({ herb }: HerbEditClientProps) {
  const router = useRouter()
  const [form, setForm] = useState<Herb>({ ...herb })
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  function triggerToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Handle saving form values
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/herbs?id=${form.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Failed to save changes')

      triggerToast('Herb saved successfully!')
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Trigger Groq AI content rewrite
  async function handleAiImprove() {
    setAiLoading(true)
    setAiSuggestions(null)
    try {
      const res = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          scientific_name: form.scientific_name,
          current_description: form.summary || form.short_description || '',
        }),
      })

      if (!res.ok) throw new Error('AI rewrite failed')
      const data = await res.json()
      setAiSuggestions(data)
      triggerToast('AI recommendations generated!', 'success')
    } catch (err: any) {
      triggerToast(err.message, 'error')
    } finally {
      setAiLoading(false)
    }
  }

  // Apply AI suggestions to form state
  function applyAi() {
    if (!aiSuggestions) return
    setForm(prev => ({
      ...prev,
      short_description: aiSuggestions.short_description || prev.short_description,
      summary: aiSuggestions.summary || prev.summary,
      benefits: Array.isArray(aiSuggestions.benefits) ? aiSuggestions.benefits.join('\n') : (aiSuggestions.benefits || prev.benefits),
      preparation: aiSuggestions.preparation || prev.preparation,
      safety_notes: aiSuggestions.safety_notes || prev.safety_notes,
    }))
    setAiSuggestions(null)
    triggerToast('AI suggestions applied! Review and click Save.', 'info')
  }

  return (
    <div className="flex gap-6 items-start">
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="flex-1 card flex flex-col gap-4">
        <div className="grid-2">
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label>Slug</label>
            <input
              type="text"
              className="input font-mono"
              value={form.slug}
              onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Scientific Name</label>
            <input
              type="text"
              className="input italic"
              value={form.scientific_name || ''}
              onChange={e => setForm(prev => ({ ...prev, scientific_name: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Common / Local Names</label>
            <input
              type="text"
              className="input"
              value={form.local_names || ''}
              onChange={e => setForm(prev => ({ ...prev, local_names: e.target.value }))}
              placeholder="e.g. Nutmeg, Monodora"
            />
          </div>
        </div>

        <div className="field">
          <label>Image URL</label>
          <input
            type="text"
            className="input"
            value={form.image_url || ''}
            onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))}
            placeholder="https://..."
          />
        </div>

        <div className="field">
          <label>Short Description (1-2 sentences)</label>
          <textarea
            className="textarea"
            value={form.short_description || ''}
            onChange={e => setForm(prev => ({ ...prev, short_description: e.target.value }))}
            placeholder="A short summary of the herb for listings..."
          />
        </div>

        <div className="field">
          <label>Summary / Overview (Full details)</label>
          <textarea
            className="textarea"
            value={form.summary || ''}
            onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
            placeholder="A comprehensive introduction to this herb..."
            style={{ minHeight: '130px' }}
          />
        </div>

        <div className="field">
          <label>Benefits (One per line)</label>
          <textarea
            className="textarea"
            value={form.benefits || ''}
            onChange={e => setForm(prev => ({ ...prev, benefits: e.target.value }))}
            placeholder="Boosts digestion&#10;Relieves headache&#10;Improves sleep"
          />
        </div>

        <div className="field">
          <label>Preparation Methods</label>
          <textarea
            className="textarea"
            value={form.preparation || ''}
            onChange={e => setForm(prev => ({ ...prev, preparation: e.target.value }))}
            placeholder="Add 1 teaspoon of ground nutmeg to hot water..."
          />
        </div>

        <div className="field">
          <label>Safety & Precautions</label>
          <textarea
            className="textarea"
            value={form.safety_notes || ''}
            onChange={e => setForm(prev => ({ ...prev, safety_notes: e.target.value }))}
            placeholder="Do not ingest in large quantities. Consult doctor if pregnant..."
          />
        </div>

        <div className="flex gap-6 mt-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_published"
              checked={form.is_published}
              onChange={e => setForm(prev => ({ ...prev, is_published: e.target.checked }))}
              style={{ width: 'auto', transform: 'scale(1.2)' }}
            />
            <label htmlFor="is_published" className="font-bold cursor-pointer select-none text-sm">Published</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_featured"
              checked={form.is_featured}
              onChange={e => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
              style={{ width: 'auto', transform: 'scale(1.2)' }}
            />
            <label htmlFor="is_featured" className="font-bold cursor-pointer select-none text-sm">Featured / Starred</label>
          </div>
        </div>

        <button type="submit" id="save-btn" className="btn btn-primary btn-lg w-full mt-4" disabled={saving}>
          {saving ? 'Saving changes...' : 'Save Changes'}
        </button>
      </form>

      {/* AI Assistant Sidebar */}
      <div className="w-1/3 flex flex-col gap-4 sticky" style={{ width: '380px', top: '24px' }}>
        <div className="ai-panel">
          <div className="ai-header">
            <span className="ai-badge">🤖 AI Content Studio</span>
          </div>

          {!aiSuggestions && !aiLoading && (
            <div>
              <p className="text-muted text-sm mb-4">
                Use Groq Llama 3 to research botanical properties, refine descriptions, format benefits, and draft precaution guidelines automatically.
              </p>
              <button
                type="button"
                className="btn btn-ai w-full"
                onClick={handleAiImprove}
              >
                🪄 Improve with AI
              </button>
            </div>
          )}

          {aiLoading && (
            <div className="text-center py-6">
              <div className="spinner mx-auto mb-4" />
              <p className="text-sm font-bold text-primary animate-pulse">Groq AI is researching and drafting...</p>
              <p className="text-xs text-muted mt-2">Writing benefits, preparation, and safety notes.</p>
            </div>
          )}

          {aiSuggestions && (
            <div className="flex flex-col gap-4">
              <div className="ai-section">Review Draft</div>

              <div className="field">
                <label className="text-primary">Short Summary</label>
                <div className="ai-value">{aiSuggestions.short_description}</div>
              </div>

              <div className="field">
                <label className="text-primary">Benefits</label>
                <div className="ai-value">
                  <ul className="ai-list">
                    {aiSuggestions.benefits?.map((b: string, idx: number) => (
                      <li key={idx} className="ai-list-item">{b}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="field">
                <label className="text-primary">Preparation</label>
                <div className="ai-value">{aiSuggestions.preparation}</div>
              </div>

              <div className="field">
                <label className="text-primary">Precautions</label>
                <div className="ai-value">{aiSuggestions.safety_notes}</div>
              </div>

              <div className="grid-2">
                <button
                  type="button"
                  className="btn btn-ghost w-full"
                  onClick={() => setAiSuggestions(null)}
                >
                  Discard
                </button>
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={applyAi}
                >
                  Apply Draft
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
