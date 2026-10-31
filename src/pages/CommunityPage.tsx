import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { CommunityPost } from '@/types'
import { formatRichText, getRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, ImagePlus, Send, Trash2 } from 'lucide-react'

export default function CommunityPage() {
  const { profile } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadPosts()
    // Realtime subscription
    const channel = supabase
      .channel('community')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_posts' },
        () => loadPosts()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadPosts() {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, profiles(username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (!error && data) {
      setPosts(
        data.map((p: any) => ({
          id: p.id,
          content: p.content,
          image_url: p.image_url,
          user_id: p.user_id,
          username: p.profiles?.username || 'Unknown',
          avatar_url: p.profiles?.avatar_url,
          created_at: p.created_at,
        }))
      )
    }
    setLoading(false)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB')
      return
    }
    setImageFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const submit = async () => {
    if (!profile || (!text.trim() && !imageFile)) return
    setSending(true)

    let image_url: string | null = null
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `community/${profile.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('uploads')
        .upload(path, imageFile, { upsert: false })
      if (upErr) {
        toast.error('Image upload failed: ' + upErr.message)
        setSending(false)
        return
      }
      const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path)
      image_url = urlData.publicUrl
    }

    const { error } = await supabase.from('community_posts').insert({
      user_id: profile.id,
      content: text.trim(),
      image_url,
    })

    if (error) {
      toast.error(error.message)
    } else {
      setText('')
      setImageFile(null)
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      toast.success('Posted!')
    }
    setSending(false)
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    await supabase.from('community_posts').delete().eq('id', id)
    setPosts((p) => p.filter((x) => x.id !== id))
    toast.success('Deleted')
  }

  return (
    <div className="pb-28">
      <h1 className="page-title mb-5">
        Community
      </h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent)' }} />
        </div>
      ) : posts.length === 0 ? (
        <p className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
          No posts yet. Be the first!
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <article key={p.id} className="card">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-black"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      p.username[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{p.username}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {getRelativeTime(p.created_at)}
                    </div>
                  </div>
                </div>
                {profile?.id === p.user_id && (
                  <button
                    onClick={() => deletePost(p.id)}
                    className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              {p.content && (
                <p
                  className="mb-2 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatRichText(p.content) }}
                />
              )}
              {p.image_url && (
                <img
                  src={p.image_url}
                  alt=""
                  className="mt-2 max-h-80 w-full rounded-xl object-cover"
                />
              )}
            </article>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Bottom input strip */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center p-3 pointer-events-none">
        <div
          className="pointer-events-auto flex w-full max-w-2xl items-center gap-2 rounded-2xl border px-3 py-2 shadow-2xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border)',
          }}
        >
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-full p-2"
            style={{ color: 'var(--text-muted)' }}
            title="Add image"
          >
            <ImagePlus size={20} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <input
            className="flex-1 bg-transparent outline-none"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit()}
            style={{ color: 'var(--text)' }}
          />
          {preview && (
            <img src={preview} alt="" className="h-9 w-9 rounded-lg object-cover" />
          )}
          <button
            onClick={submit}
            disabled={sending || (!text.trim() && !imageFile)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-black disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
