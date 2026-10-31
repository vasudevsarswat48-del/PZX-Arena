import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { ThemeId } from '@/types'
import { THEME_LIST } from '@/types'

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (t: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('pzx_theme') as ThemeId | null
    return saved && THEME_LIST.some((t) => t.id === saved) ? saved : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    THEME_LIST.forEach((t) => root.classList.remove(t.id))
    root.classList.add(theme)
    localStorage.setItem('pzx_theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
