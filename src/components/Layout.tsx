import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  Menu, X, Newspaper, Brain, MessageCircle, Trophy,
  User, Info, Shield, LogOut, Palette, Star
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { THEME_LIST } from '@/types'
import { playSound } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Updates', icon: Newspaper },
  { to: '/quizzes', label: 'Quizzes', icon: Brain },
  { to: '/community', label: 'Community', icon: MessageCircle },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/about', label: 'About', icon: Info },
]

export default function Layout() {
  const { profile, isAdmin, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const themeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const closeDrawer = () => setDrawerOpen(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{ backgroundColor: 'var(--header-bg)', borderColor: 'var(--border)' }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg p-1.5 md:hidden"
              style={{ color: 'var(--accent)' }}
            >
              <Menu size={22} />
            </button>
            <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group">
              <img
                src="/favicon.png"
                alt="PZX"
                className="h-9 w-9 rounded-xl object-cover shadow-md ring-2 ring-offset-1 transition group-hover:scale-105"
                style={{ ringColor: 'var(--accent)' } as any}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <span className="logo-text text-xl hidden sm:inline">PZX ARENA</span>
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                    isActive ? '' : 'hover:opacity-80'
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                })}
              >
                <Icon size={16} strokeWidth={2.2} />
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold"
                style={({ isActive }) => ({
                  color: 'var(--gold)',
                  backgroundColor: isActive ? 'color-mix(in srgb, var(--gold) 15%, transparent)' : 'transparent',
                })}
              >
                <Shield size={16} />
                Admin
              </NavLink>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme picker */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className="rounded-xl p-2 transition hover:opacity-80"
                style={{ color: 'var(--text-muted)', backgroundColor: themeOpen ? 'var(--accent-soft)' : 'transparent' }}
                title="Themes"
              >
                <Palette size={18} />
              </button>
              {themeOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border shadow-2xl"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                >
                  <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Themes
                  </div>
                  {THEME_LIST.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id)
                        setThemeOpen(false)
                        playSound('click')
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition"
                      style={{
                        backgroundColor: theme === t.id ? 'var(--accent-soft)' : 'transparent',
                        color: theme === t.id ? 'var(--accent)' : 'var(--text)',
                        fontWeight: theme === t.id ? 700 : 500,
                      }}
                    >
                      <span
                        className="h-4 w-4 shrink-0 rounded-full border-2"
                        style={{
                          backgroundColor: t.swatch,
                          borderColor: theme === t.id ? 'var(--accent)' : 'var(--border)',
                        }}
                      />
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile badge */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 rounded-full border pl-1 pr-3 py-1 transition hover:opacity-90"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  profile?.username?.[0]?.toUpperCase() || '?'
                )}
              </div>
              <span className="hidden text-sm font-semibold sm:inline">{profile?.username}</span>
              <span className="flex items-center gap-0.5 text-xs font-bold" style={{ color: 'var(--gold)' }}>
                <Star size={12} fill="currentColor" />
                {Number(profile?.stars ?? 0).toFixed(1)}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDrawer} />
          <div
            className="absolute left-0 top-0 h-full w-72 p-5 shadow-2xl"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/favicon.png" alt="" className="h-8 w-8 rounded-lg" />
                <span className="logo-text text-lg">PZX ARENA</span>
              </div>
              <button onClick={closeDrawer} style={{ color: 'var(--text-muted)' }}>
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={closeDrawer}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold transition"
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--accent)' : 'var(--text)',
                    backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                  })}
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold"
                  style={{ color: 'var(--gold)' }}
                >
                  <Shield size={18} />
                  Admin Panel
                </NavLink>
              )}
              <NavLink
                to="/profile"
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold"
                style={{ color: 'var(--text)' }}
              >
                <User size={18} />
                My Profile
              </NavLink>
              <button
                onClick={() => { signOut(); closeDrawer() }}
                className="mt-6 flex items-center gap-3 rounded-xl px-3 py-3 font-semibold"
                style={{ color: 'var(--danger)' }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="border-t py-5 text-center text-xs"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4">
          <span className="font-medium">PZX Arena</span>
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/contact" className="hover:underline">Contact</a>
        </div>
      </footer>
    </div>
  )
}
