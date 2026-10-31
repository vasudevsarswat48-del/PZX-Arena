import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Quiz, QuizDifficulty } from '@/types'
import { QUIZ_REWARDS, UNLOCK_THRESHOLDS } from '@/types'
import { formatRichText, playSound } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, Lock, CheckCircle2, XCircle } from 'lucide-react'

export default function QuizzesPage() {
  const { profile, updateStars, refreshProfile } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [attempts, setAttempts] = useState<Record<string, number>>({}) // quizId -> chosen_index
  const [loading, setLoading] = useState(true)
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('easy')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const stars = profile?.stars ?? 0
  const mediumUnlocked = stars >= UNLOCK_THRESHOLDS.medium
  const hardcoreUnlocked = stars >= UNLOCK_THRESHOLDS.hardcore

  useEffect(() => {
    loadData()
  }, [profile?.id])

  async function loadData() {
    setLoading(true)
    const [qRes, aRes] = await Promise.all([
      supabase
        .from('quizzes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false }),
      profile
        ? supabase
            .from('quiz_attempts')
            .select('quiz_id, chosen_index')
            .eq('user_id', profile.id)
        : Promise.resolve({ data: [] }),
    ])

    if (qRes.data) setQuizzes(qRes.data as Quiz[])
    if (aRes.data) {
      const map: Record<string, number> = {}
      aRes.data.forEach((a: any) => {
        map[a.quiz_id] = a.chosen_index
      })
      setAttempts(map)
    }
    setLoading(false)
  }

  const filtered = quizzes.filter((q) => q.difficulty === difficulty)
  const current = filtered[currentIdx]

  const handleSelect = async (optIdx: number) => {
    if (!current || !profile || revealed || attempts[current.id] !== undefined) return

    const reward = QUIZ_REWARDS[current.difficulty]
    const isCorrect =
      current.correct_index !== null ? optIdx === current.correct_index : null

    let delta = 0
    if (isCorrect === true) {
      delta = reward.correct
      playSound('correct')
      toast.success(`Correct! +${reward.correct} ⭐`)
    } else if (isCorrect === false) {
      delta = reward.wrong
      playSound('wrong')
      toast.error(`Wrong! ${reward.wrong} ⭐`)
    } else {
      toast.info('Answer submitted – result pending')
    }

    // Save attempt
    await supabase.from('quiz_attempts').insert({
      quiz_id: current.id,
      user_id: profile.id,
      chosen_index: optIdx,
      is_correct: isCorrect,
      stars_delta: delta,
    })

    setAttempts((prev) => ({ ...prev, [current.id]: optIdx }))
    setRevealed(true)

    if (delta !== 0) {
      await updateStars(delta)
      await refreshProfile()
    }
  }

  const goNext = () => {
    setRevealed(false)
    setCurrentIdx((i) => Math.min(i + 1, filtered.length - 1))
  }

  const switchDiff = (d: QuizDifficulty) => {
    if (d === 'medium' && !mediumUnlocked) {
      toast.error(`🔒 Medium unlocks at ${UNLOCK_THRESHOLDS.medium} stars`)
      return
    }
    if (d === 'hardcore' && !hardcoreUnlocked) {
      toast.error(`🔒 Hardcore unlocks at ${UNLOCK_THRESHOLDS.hardcore} stars`)
      return
    }
    if (d !== difficulty) playSound('unlock')
    setDifficulty(d)
    setCurrentIdx(0)
    setRevealed(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title mb-5">
        Quizzes
      </h1>

      {/* Difficulty tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {([
          { id: 'easy' as const, label: `Easy (+${QUIZ_REWARDS.easy.correct}/−${Math.abs(QUIZ_REWARDS.easy.wrong)})` },
          {
            id: 'medium' as const,
            label: mediumUnlocked
              ? `Medium (+${QUIZ_REWARDS.medium.correct}/−${Math.abs(QUIZ_REWARDS.medium.wrong)})`
              : `Medium 🔒 ${UNLOCK_THRESHOLDS.medium}⭐`,
          },
          {
            id: 'hardcore' as const,
            label: hardcoreUnlocked
              ? `Hardcore (+${QUIZ_REWARDS.hardcore.correct}/0)`
              : `Hardcore 🔒 ${UNLOCK_THRESHOLDS.hardcore}⭐`,
          },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => switchDiff(t.id)}
            className="rounded-xl px-4 py-2 text-sm font-bold transition"
            style={{
              backgroundColor:
                difficulty === t.id
                  ? 'var(--gold)'
                  : 'var(--bg-elevated)',
              color: difficulty === t.id ? '#000' : 'var(--text-muted)',
              opacity: (t.id === 'medium' && !mediumUnlocked) || (t.id === 'hardcore' && !hardcoreUnlocked) ? 0.7 : 1,
            }}
          >
            {(t.id === 'medium' && !mediumUnlocked) || (t.id === 'hardcore' && !hardcoreUnlocked) ? (
              <span className="flex items-center gap-1"><Lock size={14} /> {t.label}</span>
            ) : (
              t.label
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
          No quizzes in this category yet.
        </p>
      ) : !current ? (
        <p className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
          You’ve reached the end!
        </p>
      ) : (
        <div className="card max-w-2xl">
          <div className="mb-3 flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
            <span>
              Quiz {currentIdx + 1} of {filtered.length}
            </span>
            <span className="badge" style={{
              backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
              color: 'var(--accent)',
              border: '1px solid var(--accent)',
            }}>
              {current.difficulty.toUpperCase()}
            </span>
          </div>

          <h2
            className="mb-5 text-xl font-bold leading-snug"
            dangerouslySetInnerHTML={{ __html: formatRichText(current.question) }}
          />

          <div className="space-y-2">
            {current.options.map((opt, idx) => {
              if (!opt?.trim()) return null
              const already = attempts[current.id] !== undefined
              const chosen = already ? attempts[current.id] : null
              const showResult = already || revealed
              let cls = 'quiz-option'
              if (showResult && chosen === idx) {
                if (current.correct_index === null) cls += ' selected'
                else if (idx === current.correct_index) cls += ' correct'
                else cls += ' wrong'
              } else if (showResult && idx === current.correct_index) {
                cls += ' correct'
              }
              if (showResult) cls += ' disabled'

              return (
                <button
                  key={idx}
                  className={cls}
                  onClick={() => handleSelect(idx)}
                  disabled={showResult}
                >
                  <span className="flex items-center justify-between">
                    <span dangerouslySetInnerHTML={{ __html: formatRichText(opt) }} />
                    {showResult && idx === current.correct_index && (
                      <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                    )}
                    {showResult && chosen === idx && idx !== current.correct_index && current.correct_index !== null && (
                      <XCircle size={18} style={{ color: 'var(--danger)' }} />
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          {(attempts[current.id] !== undefined || revealed) && currentIdx < filtered.length - 1 && (
            <button className="btn-primary mt-5 w-full" onClick={goNext}>
              Next Quiz →
            </button>
          )}
          {(attempts[current.id] !== undefined || revealed) && currentIdx === filtered.length - 1 && (
            <p className="mt-5 text-center font-semibold" style={{ color: 'var(--success)' }}>
              🎉 You’ve completed this category!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
