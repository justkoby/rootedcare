'use client'

import Link from 'next/link'

interface StatProps {
  stats: {
    herbsCount: number
    wellnessCount: number
    articlesCount: number
    usersCount: number
    totalDraftsCount: number
    incompleteHerbs: any[]
    incompleteWellness: any[]
    incompleteArticles: any[]
  }
}

export default function DashboardClient({ stats }: StatProps) {
  const totalIncomplete = stats.incompleteHerbs.length + stats.incompleteWellness.length + stats.incompleteArticles.length

  return (
    <div>
      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🌿</div>
          <div className="stat-value">{stats.herbsCount}</div>
          <div className="stat-label">Total Herbs</div>
          <div className="stat-sub">
            <Link href="/herbs">Manage herbs →</Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🧘</div>
          <div className="stat-value">{stats.wellnessCount}</div>
          <div className="stat-label">Wellness Guides</div>
          <div className="stat-sub">
            <Link href="/wellness">Manage guides →</Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📰</div>
          <div className="stat-value">{stats.articlesCount}</div>
          <div className="stat-label">Articles</div>
          <div className="stat-sub">
            <Link href="/articles">Manage articles →</Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.usersCount}</div>
          <div className="stat-label">Registered Users</div>
          <div className="stat-sub">
            <Link href="/users">View users →</Link>
          </div>
        </div>

        <div className="stat-card" style={{ borderColor: stats.totalDraftsCount > 0 ? 'var(--warning-bg)' : 'var(--border)' }}>
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats.totalDraftsCount}</div>
          <div className="stat-label">Pending Drafts</div>
          <div className="stat-sub" style={{ color: 'var(--warning)' }}>
            Unpublished items
          </div>
        </div>
      </div>

      {/* Warnings & AI Shortcuts */}
      <div className="grid-2">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title" style={{ margin: 0 }}>⚠️ Content Audit ({totalIncomplete} issues)</h3>
            {totalIncomplete > 0 && (
              <span className="badge badge-featured">Needs attention</span>
            )}
          </div>

          {totalIncomplete === 0 ? (
            <div className="text-center py-6 text-muted">
              🎉 All records are complete! No issues found.
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.incompleteHerbs.map((h) => (
                <div key={h.id} className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(232,166,61,.05)', border: '1px solid rgba(232,166,61,.15)' }}>
                  <div>
                    <span className="font-bold">🌿 {h.name}</span>
                    <div className="text-xs text-muted font-mono">{h.slug}</div>
                  </div>
                  <div className="flex gap-2">
                    {!h.image_url && <span className="badge badge-draft" style={{ color: 'var(--warning)' }}>Missing Image</span>}
                    {!h.short_description && <span className="badge badge-draft" style={{ color: 'var(--warning)' }}>Missing Summary</span>}
                    <Link href={`/herbs/${h.id}`} className="btn btn-ghost btn-sm">Fix</Link>
                  </div>
                </div>
              ))}

              {stats.incompleteWellness.map((w) => (
                <div key={w.id} className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(232,166,61,.05)', border: '1px solid rgba(232,166,61,.15)' }}>
                  <div>
                    <span className="font-bold">🧘 {w.title}</span>
                    <div className="text-xs text-muted font-mono">{w.slug}</div>
                  </div>
                  <div className="flex gap-2">
                    {!w.image_url && <span className="badge badge-draft" style={{ color: 'var(--warning)' }}>Missing Image</span>}
                    {!w.description && <span className="badge badge-draft" style={{ color: 'var(--warning)' }}>Missing Body</span>}
                    <Link href="/wellness" className="btn btn-ghost btn-sm">Fix</Link>
                  </div>
                </div>
              ))}

              {stats.incompleteArticles.map((a) => (
                <div key={a.id} className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(232,166,61,.05)', border: '1px solid rgba(232,166,61,.15)' }}>
                  <div>
                    <span className="font-bold">📰 {a.title}</span>
                    <div className="text-xs text-muted font-mono">{a.slug}</div>
                  </div>
                  <div className="flex gap-2">
                    {!a.image_url && <span className="badge badge-draft" style={{ color: 'var(--warning)' }}>Missing Image</span>}
                    {!a.summary && <span className="badge badge-draft" style={{ color: 'var(--warning)' }}>Missing Summary</span>}
                    <Link href="/articles" className="btn btn-ghost btn-sm">Fix</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card flex flex-col justify-between">
          <div>
            <h3 className="card-title">🤖 AI Content Studio</h3>
            <p className="text-muted mb-4">
              Write professional articles, generate summaries, audit your database for scientific precision, and fill missing content blocks in one click.
            </p>
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <strong className="text-primary">✍️ AI Draft Writer</strong>
                <p className="text-xs text-muted mt-1">Paste raw research papers or text and let AI extract key botanical fields.</p>
              </div>
              <div className="p-3 rounded" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <strong className="text-primary">🔍 AI Content Auditor</strong>
                <p className="text-xs text-muted mt-1">Scans your entire encyclopedia to identify gaps and update missing details.</p>
              </div>
            </div>
          </div>
          <Link href="/ai-studio" className="btn btn-primary w-full mt-4">
            Open AI Content Studio
          </Link>
        </div>
      </div>
    </div>
  )
}
