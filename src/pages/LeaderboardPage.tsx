import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, WinnerAnnouncement } from '@/types'
import { formatRichText } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Profile[]>([])
  const [winners, setWinners] = useState<WinnerAnnouncement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [pRes, wRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('is_banned', false)
          .neq('role', 'owner')
          .order('stars', { ascending: false })
          .limit(50),
        supabase
          .from('winners')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
      ])
      if (pRes.data) setLeaders(pRes.data as Profile[])
      if (wRes.data) setWinners(wRes.data as WinnerAnnouncement[])
      setLoading(false)
    }
    load()
  }, [])

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
        Leaderboard
      </h1>

      {/* Announced winners */}
      <section className="card mb-6">
        <h2 className="mb-4 text-lg font-bold" style={{ color: 'var(--gold)' }}>
          Announced Winners
        </h2>
        {winners.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No winners announced yet.
          </p>
        ) : (
          <div className="space-y-3">
            {winners.map((w) => (
              <div
                key={w.id}
                className="rounded-xl border p-4"
                style={{
                  borderColor: 'var(--gold)',
                  backgroundColor: 'color-mix(in srgb, var(--gold) 10%, transparent)',
                }}
              >
                <h3
                  className="font-bold"
                  style={{ color: 'var(--gold)' }}
                  dangerouslySetInnerHTML={{ __html: formatRichText(w.title) }}
                />
                <p
                  className="mt-1 whitespace-pre-line text-sm"
                  dangerouslySetInnerHTML={{ __html: formatRichText(w.rankings) }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Star ranking */}
      <section className="card">
        <h2 className="mb-4 text-lg font-bold">Star Ranking</h2>
        {leaders.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No players ranked yet.
          </p>
        ) : (
          <div className="space-y-2">
            {leaders.map((u, i) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-xl border px-4 py-3"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold" style={{ color: i < 3 ? 'var(--gold)' : 'var(--text-muted)' }}>
                    #{i + 1}
                  </span>
                  <div
                    className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-black"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      u.username[0]?.toUpperCase()
                    )}
                  </div>
                  <span className="font-semibold">{u.username}</span>
                  {u.role === 'admin' && (
                    <span className="rounded px-1.5 py-0.5 text-xs font-bold" style={{ backgroundColor: 'var(--gold)', color: '#000' }}>
                      ADMIN
                    </span>
                  )}
                </div>
                <span className="font-bold" style={{ color: 'var(--gold)' }}>
                  ★ {Number(u.stars).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
