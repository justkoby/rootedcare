'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Herb {
  id: string
  name: string
  slug: string
  image_url: string | null
  short_description: string | null
  summary: string | null
  benefits: string | null
  preparation: string | null
  safety_notes: string | null
}

interface Wellness {
  id: string
  name: string
  slug: string
  image_url: string | null
  summary: string | null
  educational_guidance: string | null
}

interface AiStudioClientProps {
  herbs: Herb[]
  wellness: Wellness[]
}

export default function AiStudioClient({ herbs: initialHerbs, wellness }: AiStudioClientProps) {
  const [herbs, setHerbs] = useState<Herb[]>(initialHerbs)
  const [activeTab, setActiveTab] = useState<'draft' | 'auditor' | 'linker'>('draft')
  
  // Tab 1: Draft Writer state
  const [pastedText, setPastedText] = useState('')
  const [draftResult, setDraftResult] = useState<any | null>(null)
  const [draftLoading, setDraftLoading] = useState(false)

  // Tab 2: Auditor state
  const [autofixingId, setAutofixingId] = useState<string | null>(null)

  // Tab 3: Linker state
  const [linkerLoading, setLinkerLoading] = useState(false)
  const [linkerResult, setLinkerResult] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const router = useRouter()

  function triggerToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Tab 1: Draft Writer ──
  async function handleDraftWriter(e: React.FormEvent) {
    e.preventDefault()
    if (!pastedText.trim()) {
      triggerToast('Please paste some text first', 'error')
      return
    }

    setDraftLoading(true)
    setDraftResult(null)
    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedText }),
      })

      if (!res.ok) throw new Error('AI drafting failed')
      const data = await res.json()
      setDraftResult(data)
      triggerToast('Draft created! Review details below.', 'success')
    } catch (err: any) {
      triggerToast(err.message, 'error')
    } finally {
      setDraftLoading(false)
    }
  }

  async function saveDraft() {
    if (!draftResult) return
    setLoading(true)
    try {
      // 1. Create the herb
      const createRes = await fetch('/api/admin/herbs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draftResult.name,
          scientific_name: draftResult.scientific_name,
          slug: draftResult.slug,
        }),
      })

      if (!createRes.ok) {
        const body = await createRes.json()
        throw new Error(body.error || 'Failed to create herb')
      }

      const created = await createRes.json()

      // 2. Update all fields
      const updateRes = await fetch(`/api/admin/herbs?id=${created.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          short_description: draftResult.short_description,
          summary: draftResult.summary,
          benefits: Array.isArray(draftResult.benefits) ? draftResult.benefits.join('\n') : draftResult.benefits,
          preparation: draftResult.preparation,
          safety_notes: draftResult.safety_notes,
        }),
      })

      if (!updateRes.ok) throw new Error('Failed to populate herb fields')

      triggerToast('Herb created and populated successfully!')
      setDraftResult(null)
      setPastedText('')
      router.push(`/herbs/${created.id}`)
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Tab 2: Auditor ──
  async function runAutofix(herb: Herb) {
    setAutofixingId(herb.id)
    try {
      const res = await fetch(`/api/ai/audit?id=${herb.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: herb.name,
          scientific_name: (herb as any).scientific_name || '',
          missing_fields: {
            short_description: !herb.short_description,
            summary: !herb.summary,
            benefits: !herb.benefits,
            preparation: !herb.preparation,
            safety_notes: !herb.safety_notes,
          },
        }),
      })

      if (!res.ok) throw new Error('Autofix failed')
      const updatedData = await res.json()

      setHerbs(prev =>
        prev.map(h => (h.id === herb.id ? { ...h, ...updatedData } : h))
      )
      triggerToast(`Successfully generated missing fields for ${herb.name}!`)
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    } finally {
      setAutofixingId(null)
    }
  }

  // ── Tab 3: Linker ──
  async function runLinker() {
    setLinkerLoading(true)
    setLinkerResult(null)
    try {
      const res = await fetch('/api/ai/related', { method: 'POST' })
      if (!res.ok) throw new Error('Auto-linking operation failed')
      const data = await res.json()
      setLinkerResult(data.summary || 'Completed successfully.')
      triggerToast('Auto-linking process finished!')
    } catch (err: any) {
      triggerToast(err.message, 'error')
    } finally {
      setLinkerLoading(false)
    }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs mb-6">
        <button className={`tab ${activeTab === 'draft' ? 'active' : ''}`} onClick={() => setActiveTab('draft')}>✍️ AI Draft Writer</button>
        <button className={`tab ${activeTab === 'auditor' ? 'active' : ''}`} onClick={() => setActiveTab('auditor')}>🔍 AI Content Auditor</button>
        <button className={`tab ${activeTab === 'linker' ? 'active' : ''}`} onClick={() => setActiveTab('linker')}>🔗 AI Auto-Linker</button>
      </div>

      {/* TAB 1: DRAFT WRITER */}
      {activeTab === 'draft' && (
        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">Extract Herb from Research text</h3>
            <p className="text-muted text-sm mb-4">
              Paste a research paper, article, or raw field notes. Groq AI will parse the unstructured text and format it into name, scientific name, benefits, and cautions.
            </p>
            <form onSubmit={handleDraftWriter}>
              <div className="field mb-4">
                <textarea
                  className="textarea"
                  style={{ minHeight: '340px' }}
                  placeholder="Paste research article or Wikipedia text here..."
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={draftLoading}>
                {draftLoading ? 'Generating Draft...' : '🪄 Generate Botanical Draft'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="card-title">Botanical Draft Preview</h3>
            {!draftResult && !draftLoading && (
              <div className="text-center py-12 text-muted">
                Paste research notes on the left to generate a preview.
              </div>
            )}
            {draftLoading && (
              <div className="text-center py-12">
                <div className="spinner mx-auto mb-4" />
                <p className="font-bold text-primary animate-pulse">Groq AI is analyzing the text...</p>
                <p className="text-xs text-muted mt-2">Parsing botanical taxonomy, preparation methods, and pharmacological safety.</p>
              </div>
            )}
            {draftResult && (
              <div className="flex flex-col gap-4" style={{ maxHeight: '460px', overflowY: 'auto', paddingRight: '6px' }}>
                <div className="grid-2">
                  <div className="field">
                    <label>Name</label>
                    <div className="ai-value">{draftResult.name}</div>
                  </div>
                  <div className="field">
                    <label>Scientific Name</label>
                    <div className="ai-value italic">{draftResult.scientific_name || '—'}</div>
                  </div>
                </div>
                <div className="field">
                  <label>Slug</label>
                  <div className="ai-value font-mono">{draftResult.slug}</div>
                </div>
                <div className="field">
                  <label>Short Summary</label>
                  <div className="ai-value">{draftResult.short_description}</div>
                </div>
                <div className="field">
                  <label>Overview</label>
                  <div className="ai-value">{draftResult.summary}</div>
                </div>
                <div className="field">
                  <label>Benefits</label>
                  <div className="ai-value">
                    <ul className="ai-list">
                      {draftResult.benefits?.map((b: string, idx: number) => (
                        <li key={idx} className="ai-list-item">{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="field">
                  <label>Preparation</label>
                  <div className="ai-value">{draftResult.preparation}</div>
                </div>
                <div className="field">
                  <label>Precautions</label>
                  <div className="ai-value">{draftResult.safety_notes}</div>
                </div>

                <hr style={{ margin: '12px 0' }} />
                <button className="btn btn-primary w-full" onClick={saveDraft} disabled={loading}>
                  {loading ? 'Creating record...' : 'Apply & Save to Encyclopedia'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AUDITOR */}
      {activeTab === 'auditor' && (
        <div className="card">
          <h3 className="card-title">Botanical Completeness Audit</h3>
          <p className="text-muted text-sm mb-4">
            Below is a live status of your encyclopedia database. Click &quot;Autofix&quot; to have Groq AI automatically research and fill the missing columns using scientific data.
          </p>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Herb Record</th>
                  <th>Image</th>
                  <th>Summary</th>
                  <th>Benefits</th>
                  <th>Prep</th>
                  <th>Safety</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {herbs.map((h) => {
                  const hasImage = !!h.image_url
                  const hasSummary = !!h.summary
                  const hasBenefits = !!h.benefits
                  const hasPrep = !!h.preparation
                  const hasSafety = !!h.safety_notes
                  const isComplete = hasSummary && hasBenefits && hasPrep && hasSafety

                  return (
                    <tr key={h.id} style={{ background: isComplete ? 'transparent' : 'rgba(232,166,61,.02)' }}>
                      <td>
                        <div className="td-name">{h.name}</div>
                        <div className="td-slug">{h.slug}</div>
                      </td>
                      <td>{hasImage ? '✅' : '❌'}</td>
                      <td>{hasSummary ? '✅' : '❌'}</td>
                      <td>{hasBenefits ? '✅' : '❌'}</td>
                      <td>{hasPrep ? '✅' : '❌'}</td>
                      <td>{hasSafety ? '✅' : '❌'}</td>
                      <td>
                        {isComplete ? (
                          <span className="text-xs text-accent font-bold">✅ Complete</span>
                        ) : (
                          <button
                            className="btn btn-ai btn-sm"
                            disabled={autofixingId !== null}
                            onClick={() => runAutofix(h)}
                          >
                            {autofixingId === h.id ? 'Fixing...' : '🪄 Autofix'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LINKER */}
      {activeTab === 'linker' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 className="card-title">🤖 AI Content Linker</h3>
          <p className="text-muted text-sm mb-4">
            Runs a background process analyzing the descriptions, active compounds, and benefits of all published herbs, articles, and wellness concerns in your database. 
            It automatically establishes relationships so the mobile app displays relevant related suggestions dynamically.
          </p>

          <button
            className="btn btn-primary w-full py-3"
            onClick={runLinker}
            disabled={linkerLoading}
          >
            {linkerLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" /> Linking catalog records...
              </span>
            ) : (
              '🔗 Analyze & Connect Related Records'
            )}
          </button>

          {linkerResult && (
            <div className="mt-6 p-4 rounded" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div className="text-xs text-primary font-mono uppercase font-bold mb-2">Process Log</div>
              <pre style={{ fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                {linkerResult}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
