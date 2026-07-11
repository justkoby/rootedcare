'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AppConfig {
  key: string
  value: string
  description: string | null
  updated_at: string
}

interface AiConfigClientProps {
  initialConfigs: AppConfig[]
}

export default function AiConfigClient({ initialConfigs }: AiConfigClientProps) {
  const [configs, setConfigs] = useState<AppConfig[]>(initialConfigs)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const router = useRouter()

  function triggerToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleSave(key: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/config?key=${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: editingValue }),
      })

      if (!res.ok) throw new Error('Failed to save config value')

      setConfigs(prev =>
        prev.map(c => (c.key === key ? { ...c, value: editingValue } : c))
      )
      setEditingKey(null)
      triggerToast('Configuration updated!')
      router.refresh()
    } catch (err: any) {
      triggerToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(key: string, value: string) {
    setEditingKey(key)
    setEditingValue(value)
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      <div className="card">
        <h3 className="card-title">System Settings</h3>
        <p className="text-muted mb-4">
          These settings directly control the behavior of your Supabase Edge Functions, mobile search limits, and dashboard AI endpoints.
        </p>

        <div className="config-grid">
          {configs.map((c) => {
            const isEditing = editingKey === c.key
            return (
              <div
                key={c.key}
                className="p-4 rounded mb-2 flex justify-between items-center"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <div className="flex-1 pr-6">
                  <div className="font-mono text-primary font-bold">{c.key}</div>
                  <p className="text-xs text-muted mt-1">{c.description || 'No description provided.'}</p>
                </div>

                <div className="flex items-center gap-3" style={{ minWidth: '320px' }}>
                  {isEditing ? (
                    <div className="flex gap-2 w-full">
                      <input
                        type="text"
                        className="input"
                        value={editingValue}
                        onChange={e => setEditingValue(e.target.value)}
                        style={{ height: '38px' }}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSave(c.key)}
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditingKey(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center w-full">
                      <span className="font-mono bg-surface p-1 px-2 rounded border border-border text-sm">
                        {c.value}
                      </span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => startEdit(c.key, c.value)}
                      >
                        Edit Value
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
