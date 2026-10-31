import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { UpdatePost } from '@/types'
import { formatRichText, getRelativeTime } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const PAGE_SIZE = 4

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<UpdatePost[]>([])
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<UpdatePost | null>(null)

  useEffect(() => {
    loadUpdates()
  }, [])

  async function loadUpdates() {
    setLoading(true)
    const { data, error } = await supabase
      .from('updates')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setUpdates(
        data.map((u: any) => ({
          ...u,
          tags: u.tags || [],
          author_username: u.profiles?.username,
        }))
      )
    }
    setLoading(false)
  }

  const filtered = updates.filter((u) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      u.title.toLowerCase().includes(q) ||
      u.content.toLowerCase().includes(q) ||
      u.tags.some((t) => t.toLowerCase().includes(q))
    )
  })

  const visibleList = filtered.slice(0, visible)

  return (
    <div>
      <h1 className="page-title mb-5">
        Cricket Updates
      </h1>

      <div className="relative mb-5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-50">🔍</span>
        <input
          className="input pl-10"
          placeholder="Search updates by keyword or tags..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setVisible(PAGE_SIZE)
          }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent)' }} />
        </div>
      ) : visibleList.length === 0 ? (
        <p className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
          No updates found.
        </p>
      ) : (
        <div className="space-y-4">
          {visibleList.map((u) => (
            <article
              key={u.id}
              className="card cursor-pointer overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => setModal(u)}
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                {u.image_url && (
                  <div className="h-48 w-full shrink-0 overflow-hidden rounded-xl sm:h-40 sm:w-48">
                    <img src={u.image_url} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex flex-1 flex-col justify-center">
                  <h2
                    className="mb-1 text-lg font-bold leading-snug"
                    dangerouslySetInnerHTML={{ __html: formatRichText(u.title) }}
                  />
                  <p
                    className="mb-2 line-clamp-2 text-sm"
                    style={{ color: 'var(--text-muted)' }}
                    dangerouslySetInnerHTML={{ __html: formatRichText(u.content) }}
                  />
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {getRelativeTime(u.created_at)}
                    {u.author_username && ` · by ${u.author_username}`}
                  </div>
                  {u.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {u.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md px-2 py-0.5 text-xs font-bold uppercase"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                            color: 'var(--accent)',
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {filtered.length > visible && (
        <button
          className="mt-6 w-full rounded-xl border py-3 font-semibold transition hover:brightness-110"
          style={{
            borderColor: 'var(--accent)',
            color: 'var(--accent)',
            backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
          }}
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
        >
          Load More Updates ▼
        </button>
      )}

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-4 top-4 rounded-full p-1.5 text-lg font-bold"
              style={{ backgroundColor: 'var(--bg-elevated)' }}
              onClick={() => setModal(null)}
            >
              ✕
            </button>
            <h2
              className="mb-2 pr-10 text-2xl font-bold"
              style={{ color: 'var(--accent)' }}
              dangerouslySetInnerHTML={{ __html: formatRichText(modal.title) }}
            />
            <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              {getRelativeTime(modal.created_at)}
            </p>
            {modal.image_url && (
              <img
                src={modal.image_url}
                alt=""
                className="mb-4 max-h-80 w-full rounded-xl object-contain"
                style={{ backgroundColor: '#000' }}
              />
            )}
            <div
              className="whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatRichText(modal.content) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
