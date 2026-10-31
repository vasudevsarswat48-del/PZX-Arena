export type UserRole = 'owner' | 'admin' | 'user'

export type QuizDifficulty = 'easy' | 'medium' | 'hardcore'

export type ThemeId = 'light' | 'ocean' | 'sunset' | 'forest' | 'lavender' | 'rose' | 'dark'

export interface Profile {
  id: string
  username: string
  email: string
  role: UserRole
  stars: number
  avatar_url: string | null
  created_at: string
  is_banned: boolean
}

export interface Quiz {
  id: string
  question: string
  options: string[]
  correct_index: number | null
  difficulty: QuizDifficulty
  created_by: string
  created_at: string
  is_active: boolean
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  user_id: string
  chosen_index: number
  is_correct: boolean | null
  stars_delta: number
  created_at: string
}

export interface UpdatePost {
  id: string
  title: string
  content: string
  tags: string[]
  image_url: string | null
  created_by: string
  created_at: string
  author_username?: string
}

export interface CommunityPost {
  id: string
  content: string
  image_url: string | null
  user_id: string
  username: string
  avatar_url: string | null
  created_at: string
}

export interface WinnerAnnouncement {
  id: string
  title: string
  rankings: string
  created_at: string
}

export interface InfoLink {
  id: string
  title: string
  url: string
  sort_order: number
}

export interface AppConfig {
  app_name: string
  app_logo: string | null
  account_name: string
  about_text: string
  social_links: { label: string; url: string }[]
  contact_email: string
}

export const QUIZ_REWARDS: Record<QuizDifficulty, { correct: number; wrong: number }> = {
  easy: { correct: 5, wrong: -1 },
  medium: { correct: 7, wrong: -0.5 },
  hardcore: { correct: 10, wrong: 0 },
}

export const UNLOCK_THRESHOLDS = {
  medium: 50,
  hardcore: 100,
}

export const THEME_LIST: { id: ThemeId; label: string; swatch: string }[] = [
  { id: 'light', label: 'Light', swatch: '#f8fafc' },
  { id: 'ocean', label: 'Ocean', swatch: '#7dd3fc' },
  { id: 'sunset', label: 'Sunset', swatch: '#fdba74' },
  { id: 'forest', label: 'Forest', swatch: '#86efac' },
  { id: 'lavender', label: 'Lavender', swatch: '#c4b5fd' },
  { id: 'rose', label: 'Rose', swatch: '#fda4af' },
  { id: 'dark', label: 'Dark', swatch: '#0f172a' },
]
