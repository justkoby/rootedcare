'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { UserProfile } from '@/lib/auth'

interface SidebarProps {
  profile: UserProfile
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const activeTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (activeTheme) {
      setTheme(activeTheme)
    }
  }, [])

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    if (nextTheme === 'light') {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Herbs', path: '/herbs', icon: '🌿' },
    { label: 'Wellness', path: '/wellness', icon: '🧘' },
    { label: 'Articles', path: '/articles', icon: '📰' },
  ]

  const sysItems = [
    { label: 'AI Content Studio', path: '/ai-studio', icon: '✨' },
    { label: 'AI Config', path: '/ai-config', icon: '🤖' },
    { label: 'Users', path: '/users', icon: '👥' },
  ]

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">🌿</div>
        <div>
          <div className="sidebar-title">RootedCare</div>
          <div className="sidebar-sub">Admin Panel</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section">Content</div>
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        <div className="nav-section" style={{ marginTop: '16px' }}>System</div>
        {sysItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {profile.email ? profile.email[0].toUpperCase() : '★'}
          </div>
          <div>
            <div className="user-name truncate" style={{ maxWidth: '150px' }}>
              {profile.full_name || profile.email?.split('@')[0] || 'Admin'}
            </div>
            <div className="user-role">{profile.role}</div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm w-full mt-4 flex items-center justify-center gap-2"
          onClick={toggleTheme}
          style={{ border: '1px solid var(--border)', cursor: 'pointer' }}
          type="button"
        >
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        <button
          className="btn btn-ghost btn-sm w-full mt-2"
          onClick={handleLogout}
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}
