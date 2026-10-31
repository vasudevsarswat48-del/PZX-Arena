import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Mail, KeyRound, User, Loader2 } from 'lucide-react'

type Step = 'email' | 'otp' | 'username'

export default function AuthPage() {
  const { session, profile, signInWithOtp, verifyOtp, completeSignup, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const needsComplete = searchParams.get('complete') === '1'

  const [step, setStep] = useState<Step>(needsComplete ? 'username' : 'email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && session && profile) {
      navigate('/', { replace: true })
    }
  }, [session, profile, loading, navigate])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setBusy(true)
    const { error } = await signInWithOtp(email.trim().toLowerCase())
    setBusy(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('OTP sent! Check your email inbox (and spam).')
    setStep('otp')
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) return
    setBusy(true)
    const { error } = await verifyOtp(email.trim().toLowerCase(), otp.trim())
    setBusy(false)
    if (error) {
      toast.error(error)
      return
    }
    // After verify, AuthContext will either have profile or not
    // If no profile, show username step
    setStep('username')
  }

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || username.trim().length < 3) {
      toast.error('Username must be at least 3 characters')
      return
    }
    setBusy(true)
    const { error } = await completeSignup(username.trim())
    setBusy(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Welcome to PZX Arena!')
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4"
         style={{ background: 'var(--bg)' }}>
      <div className="mb-8 text-center">
        <img
          src="/favicon.png"
          alt="PZX"
          className="mx-auto mb-3 h-16 w-16 rounded-2xl object-cover shadow-lg"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <h1 className="logo-text text-3xl sm:text-4xl">PZX ARENA</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Pitch-Zen-Xplosive
        </p>
      </div>

      <div className="card w-full max-w-md">
        {step === 'email' && (
          <>
            <h2 className="mb-1 text-xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Sign in / Sign up
            </h2>
            <p className="mb-5 text-sm" style={{ color: 'var(--text-muted)' }}>
              We’ll send a one-time code to your email. No password needed.
            </p>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <Mail size={14} /> Email
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy ? <Loader2 className="animate-spin" size={18} /> : 'Send OTP'}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <h2 className="mb-1 text-xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Enter OTP
            </h2>
            <p className="mb-5 text-sm" style={{ color: 'var(--text-muted)' }}>
              Code sent to <strong>{email}</strong>
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <KeyRound size={14} /> 6-digit code
                </label>
                <input
                  type="text"
                  className="input text-center text-2xl tracking-[0.4em]"
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  autoFocus
                  maxLength={6}
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={busy || otp.length < 6}>
                {busy ? <Loader2 className="animate-spin" size={18} /> : 'Verify & Continue'}
              </button>
              <button
                type="button"
                className="btn-ghost w-full text-sm"
                onClick={() => setStep('email')}
              >
                ← Change email
              </button>
            </form>
          </>
        )}

        {step === 'username' && (
          <>
            <h2 className="mb-1 text-xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Choose Username
            </h2>
            <p className="mb-5 text-sm" style={{ color: 'var(--text-muted)' }}>
              This will be shown on leaderboard & community.
            </p>
            <form onSubmit={handleCompleteSignup} className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <User size={14} /> Username
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="CoolCricketer99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-gold w-full" disabled={busy}>
                {busy ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        By continuing you agree to our{' '}
        <a href="/terms" className="underline">Terms</a> &{' '}
        <a href="/privacy" className="underline">Privacy Policy</a>
      </p>
    </div>
  )
}
