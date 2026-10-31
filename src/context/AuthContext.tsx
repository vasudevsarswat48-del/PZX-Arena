import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'
import { Session, User } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  isOwner: boolean
  isAdmin: boolean
  signInWithOtp: (email: string) => Promise<{ error: string | null }>
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>
  completeSignup: (username: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateStars: (delta: number) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Profile fetch error', error)
      return null
    }
    return data as Profile
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const p = await fetchProfile(user.id)
    if (p) setProfile(p)
  }, [user, fetchProfile])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).then((p) => {
          setProfile(p)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          const p = await fetchProfile(session.user.id)
          setProfile(p)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })
    if (error) return { error: error.message }
    return { error: null }
  }

  const verifyOtp = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    if (error) return { error: error.message }
    if (data.user) {
      // Check if profile exists; if not, user needs to complete signup
      const p = await fetchProfile(data.user.id)
      if (!p) {
        // temporary flag – UI will show username form
        setProfile(null)
      } else {
        setProfile(p)
      }
    }
    return { error: null }
  }

  const completeSignup = async (username: string) => {
    if (!user) return { error: 'Not authenticated' }
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      username: username.trim(),
      email: user.email!,
      role: 'user' as UserRole,
      stars: 0,
      avatar_url: null,
      is_banned: false,
    })
    if (error) return { error: error.message }
    await refreshProfile()
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    toast.success('Logged out')
  }

  const updateStars = async (delta: number) => {
    if (!profile) return
    const newStars = Math.max(0, Number((profile.stars + delta).toFixed(1)))
    const { error } = await supabase
      .from('profiles')
      .update({ stars: newStars })
      .eq('id', profile.id)
    if (!error) {
      setProfile({ ...profile, stars: newStars })
    }
  }

  const isOwner = profile?.role === 'owner'
  const isAdmin = profile?.role === 'admin' || isOwner

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        isOwner,
        isAdmin,
        signInWithOtp,
        verifyOtp,
        completeSignup,
        signOut,
        refreshProfile,
        updateStars,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
