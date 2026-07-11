'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode]         = useState<'password' | 'magic'>('password')
  const [status, setStatus]     = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const supabase = createBrowserSupabaseClient()

    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        if (error) throw error
        setStatus('sent')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed. Check your credentials.')
    }
  }

  async function handleGithubSignIn() {
    setStatus('loading')
    setErrorMsg('')
    const supabase = createBrowserSupabaseClient()
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'GitHub sign-in failed.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <div className="login-icon">🌿</div>
            <div>
              <h1>RootedCare</h1>
              <p>Admin Dashboard</p>
            </div>
          </div>
          <div className="sent-state">
            <div className="sent-icon">📧</div>
            <h3>Check your inbox</h3>
            <p>
              A magic link has been sent to <strong>{email}</strong>.
              Click it to sign in — no password needed.
            </p>
            <button
              className="btn btn-ghost w-full mt-4"
              onClick={() => setStatus('idle')}
            >
              ← Try a different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-icon">🌿</div>
          <div>
            <h1>RootedCare</h1>
            <p>Admin Dashboard</p>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="tabs mb-6">
          <button
            type="button"
            className={`tab ${mode === 'password' ? 'active' : ''}`}
            onClick={() => { setMode('password'); setErrorMsg('') }}
          >
            Password
          </button>
          <button
            type="button"
            className={`tab ${mode === 'magic' ? 'active' : ''}`}
            onClick={() => { setMode('magic'); setErrorMsg('') }}
          >
            Magic Link
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field mb-4">
            <label>Email address</label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {mode === 'password' && (
            <div className="field mb-6">
              <label>Password</label>
              <input
                id="password"
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          )}

          {mode === 'magic' && (
            <p className="text-muted text-sm mb-6">
              We&apos;ll email you a one-click login link. No password needed.
            </p>
          )}

          {errorMsg && (
            <div className="error-banner mb-4">{errorMsg}</div>
          )}

          <button
            type="submit"
            id="login-submit"
            className="btn btn-primary btn-lg w-full mb-3"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? <span className="spinner" /> : null}
            {mode === 'magic' ? 'Send Magic Link' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-2 mb-4">
          <hr className="flex-1" style={{ margin: 0 }} />
          <span className="text-xs text-muted">OR</span>
          <hr className="flex-1" style={{ margin: 0 }} />
        </div>

        <button
          type="button"
          className="btn btn-ghost w-full flex items-center justify-center gap-2 py-2"
          onClick={handleGithubSignIn}
          disabled={status === 'loading'}
          style={{ background: '#181717', color: '#fff', borderColor: '#2b2a2a' }}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Sign in with GitHub
        </button>

        <p className="login-footer">
          RootedCare Admin · Authorized personnel only
        </p>
      </div>
    </div>
  )
}
