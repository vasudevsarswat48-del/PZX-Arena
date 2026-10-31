import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Loader2, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const { profile, refreshProfile, signOut } = useAuth()
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)

  if (!profile) return null

  const saveAvatar = async (src: string) => {
    setBusy(true)
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: src })
      .eq('id', profile.id)
    setBusy(false)
    if (error) toast.error(error.message)
    else {
      toast.success('Profile picture updated')
      await refreshProfile()
      setUrl('')
      setFile(null)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (file) {
      setBusy(true)
      const ext = file.name.split('.').pop()
      const path = `avatars/${profile.id}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('uploads')
        .upload(path, file, { upsert: true })
      if (upErr) {
        toast.error(upErr.message)
        setBusy(false)
        return
      }
      const { data } = supabase.storage.from('uploads').getPublicUrl(path)
      await saveAvatar(data.publicUrl + '?t=' + Date.now())
    } else if (url.trim()) {
      await saveAvatar(url.trim())
    }
  }

  const removeAvatar = async () => {
    setBusy(true)
    await supabase.from('profiles').update({ avatar_url: null }).eq('id', profile.id)
    setBusy(false)
    toast.success('Picture removed')
    await refreshProfile()
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="page-title mb-5">
        My Profile
      </h1>

      <div className="card text-center">
        <div
          className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-3xl font-bold text-black"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            profile.username[0]?.toUpperCase()
          )}
        </div>
        <h2 className="text-xl font-bold">{profile.username}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{profile.email}</p>
        <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--gold)' }}>
          ★ {Number(profile.stars).toFixed(1)} Stars
        </p>
        {profile.role !== 'user' && (
          <span
            className="mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-bold uppercase"
            style={{ backgroundColor: 'var(--gold)', color: '#000' }}
          >
            {profile.role}
          </span>
        )}

        <form onSubmit={handleUpdate} className="mt-6 space-y-3 text-left">
          <input
            className="input"
            placeholder="Profile image URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="input"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" size={16} /> : 'Update Picture'}
            </button>
            <button type="button" className="btn-danger" onClick={removeAvatar} disabled={busy}>
              Remove
            </button>
          </div>
        </form>

        <button
          onClick={signOut}
          className="btn-ghost mt-6 w-full gap-2 text-red-400"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  )
}
