import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Quiz, UpdatePost, Profile, WinnerAnnouncement, InfoLink, QuizDifficulty } from '@/types'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function AdminPage() {
  const { profile, isOwner } = useAuth()
  const [tab, setTab] = useState<'quizzes' | 'updates' | 'users' | 'winners' | 'config' | 'links'>('quizzes')

  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [updates, setUpdates] = useState<UpdatePost[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [winners, setWinners] = useState<WinnerAnnouncement[]>([])
  const [links, setLinks] = useState<InfoLink[]>([])
  const [loading, setLoading] = useState(true)

  const [qForm, setQForm] = useState({
    id: '', question: '', opt1: '', opt2: '', opt3: '', opt4: '',
    correct: '', difficulty: 'easy' as QuizDifficulty,
  })

  const [uForm, setUForm] = useState({
    id: '', title: '', content: '', tags: '', image_url: '',
  })
  const [uFile, setUFile] = useState<File | null>(null)

  const [cfg, setCfg] = useState({
    app_name: '', app_logo: '', account_name: '',
    about_text: '', contact_email: 'vasudevsarswat48@gmail.com',
  })

  const [wForm, setWForm] = useState({ title: '', rankings: '' })
  const [lForm, setLForm] = useState({ title: '', url: '' })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [q, u, p, w, l, c] = await Promise.all([
      supabase.from('quizzes').select('*').order('created_at', { ascending: false }),
      supabase.from('updates').select('*').order('created_at', { ascending: false }),
      isOwner
        ? supabase.from('profiles').select('*').order('created_at', { ascending: false })
        : Promise.resolve({ data: [] }),
      supabase.from('winners').select('*').order('created_at', { ascending: false }),
      supabase.from('info_links').select('*').order('sort_order'),
      supabase.from('app_config').select('*').limit(1).maybeSingle(),
    ])
    if (q.data) setQuizzes(q.data as Quiz[])
    if (u.data) setUpdates(u.data as UpdatePost[])
    if (p.data) setUsers(p.data as Profile[])
    if (w.data) setWinners(w.data as WinnerAnnouncement[])
    if (l.data) setLinks(l.data as InfoLink[])
    if (c.data) setCfg((prev) => ({ ...prev, ...c.data }))
    setLoading(false)
  }

  const saveQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    const options = [qForm.opt1, qForm.opt2, qForm.opt3, qForm.opt4].filter(Boolean)
    if (options.length < 2) { toast.error('At least 2 options required'); return }
    const payload = {
      question: qForm.question, options,
      correct_index: qForm.correct === '' ? null : Number(qForm.correct),
      difficulty: qForm.difficulty, is_active: true, created_by: profile!.id,
    }
    if (qForm.id) {
      const { error } = await supabase.from('quizzes').update(payload).eq('id', qForm.id)
      if (error) toast.error(error.message); else toast.success('Quiz updated')
    } else {
      const { error } = await supabase.from('quizzes').insert(payload)
      if (error) toast.error(error.message); else toast.success('Quiz created')
    }
    setQForm({ id: '', question: '', opt1: '', opt2: '', opt3: '', opt4: '', correct: '', difficulty: 'easy' })
    loadAll()
  }

  const editQuiz = (q: Quiz) => {
    setQForm({
      id: q.id, question: q.question,
      opt1: q.options[0] || '', opt2: q.options[1] || '',
      opt3: q.options[2] || '', opt4: q.options[3] || '',
      correct: q.correct_index === null ? '' : String(q.correct_index),
      difficulty: q.difficulty,
    })
  }

  const deleteQuiz = async (id: string) => {
    if (!confirm('Delete this quiz?')) return
    await supabase.from('quizzes').delete().eq('id', id)
    toast.success('Deleted'); loadAll()
  }

  const saveUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    let image_url = uForm.image_url
    if (uFile) {
      const path = `updates/${Date.now()}_${uFile.name}`
      const { error: upErr } = await supabase.storage.from('uploads').upload(path, uFile)
      if (upErr) { toast.error(upErr.message); return }
      image_url = supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl
    }
    const tags = uForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
    const payload = {
      title: uForm.title, content: uForm.content, tags,
      image_url: image_url || null, created_by: profile!.id,
    }
    if (uForm.id) {
      const { error } = await supabase.from('updates').update(payload).eq('id', uForm.id)
      if (error) toast.error(error.message); else toast.success('Update saved')
    } else {
      const { error } = await supabase.from('updates').insert(payload)
      if (error) toast.error(error.message); else toast.success('Update published')
    }
    setUForm({ id: '', title: '', content: '', tags: '', image_url: '' })
    setUFile(null); loadAll()
  }

  const deleteUpdate = async (id: string) => {
    if (!confirm('Delete this update?')) return
    await supabase.from('updates').delete().eq('id', id)
    toast.success('Deleted'); loadAll()
  }

  const setRole = async (id: string, role: 'admin' | 'user') => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success(`Role set to ${role}`); loadAll() }
  }

  const banUser = async (id: string, ban: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_banned: ban }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success(ban ? 'User banned' : 'User unbanned'); loadAll() }
  }

  const addWinner = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('winners').insert({ title: wForm.title, rankings: wForm.rankings })
    if (error) toast.error(error.message)
    else { toast.success('Winners announced'); setWForm({ title: '', rankings: '' }); loadAll() }
  }

  const deleteWinner = async (id: string) => {
    await supabase.from('winners').delete().eq('id', id); loadAll()
  }

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: existing } = await supabase.from('app_config').select('id').limit(1).maybeSingle()
    if (existing) await supabase.from('app_config').update(cfg).eq('id', existing.id)
    else await supabase.from('app_config').insert(cfg)
    toast.success('Config saved')
  }

  const addLink = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('info_links').insert({ title: lForm.title, url: lForm.url, sort_order: links.length })
    setLForm({ title: '', url: '' }); loadAll()
  }

  const deleteLink = async (id: string) => {
    await supabase.from('info_links').delete().eq('id', id); loadAll()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  const tabs = [
    { id: 'quizzes' as const, label: 'Quizzes' },
    { id: 'updates' as const, label: 'Updates' },
    ...(isOwner ? [{ id: 'users' as const, label: 'Users' }] : []),
    { id: 'winners' as const, label: 'Winners' },
    ...(isOwner ? [{ id: 'config' as const, label: 'About Config' }] : []),
    { id: 'links' as const, label: 'Links' },
  ]

  return (
    <div>
      <h1 className="page-title mb-5" style={{ color: 'var(--gold)' }}>
        Admin Operations
      </h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="rounded-xl px-4 py-2 text-sm font-bold"
            style={{ backgroundColor: tab === t.id ? 'var(--gold)' : 'var(--bg-elevated)', color: tab === t.id ? '#000' : 'var(--text-muted)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'quizzes' && (
        <div className="space-y-6">
          <form onSubmit={saveQuiz} className="card space-y-3">
            <h3 className="font-bold" style={{ color: 'var(--accent)' }}>{qForm.id ? 'Edit Quiz' : 'Create Quiz'}</h3>
            <select className="input" value={qForm.difficulty} onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value as QuizDifficulty })}>
              <option value="easy">Easy (+5 / -1)</option>
              <option value="medium">Medium (+7 / -0.5)</option>
              <option value="hardcore">Hardcore (+10 / 0)</option>
            </select>
            <input className="input" placeholder="Question" value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} required />
            <input className="input" placeholder="Option A *" value={qForm.opt1} onChange={(e) => setQForm({ ...qForm, opt1: e.target.value })} required />
            <input className="input" placeholder="Option B *" value={qForm.opt2} onChange={(e) => setQForm({ ...qForm, opt2: e.target.value })} required />
            <input className="input" placeholder="Option C (optional)" value={qForm.opt3} onChange={(e) => setQForm({ ...qForm, opt3: e.target.value })} />
            <input className="input" placeholder="Option D (optional)" value={qForm.opt4} onChange={(e) => setQForm({ ...qForm, opt4: e.target.value })} />
            <select className="input" value={qForm.correct} onChange={(e) => setQForm({ ...qForm, correct: e.target.value })}>
              <option value="">Answer Pending</option>
              <option value="0">Option A</option>
              <option value="1">Option B</option>
              <option value="2">Option C</option>
              <option value="3">Option D</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="btn-gold">{qForm.id ? 'Update' : 'Create'}</button>
              {qForm.id && <button type="button" className="btn-ghost" onClick={() => setQForm({ id: '', question: '', opt1: '', opt2: '', opt3: '', opt4: '', correct: '', difficulty: 'easy' })}>Cancel</button>}
            </div>
          </form>
          <div className="card">
            <h3 className="mb-3 font-bold">Existing Quizzes ({quizzes.length})</h3>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {quizzes.map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                  <div className="text-sm"><span className="font-bold">[{q.difficulty}]</span> {q.question.slice(0, 50)}...</div>
                  <div className="flex gap-1">
                    <button className="btn-gold px-2 py-1 text-xs" onClick={() => editQuiz(q)}>Edit</button>
                    <button className="btn-danger px-2 py-1 text-xs" onClick={() => deleteQuiz(q.id)}>Del</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'updates' && (
        <div className="space-y-6">
          <form onSubmit={saveUpdate} className="card space-y-3">
            <h3 className="font-bold" style={{ color: 'var(--accent)' }}>{uForm.id ? 'Edit Update' : 'Post Update'}</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tip: use *bold text* for emphasis</p>
            <input className="input" placeholder="Title" value={uForm.title} onChange={(e) => setUForm({ ...uForm, title: e.target.value })} required />
            <textarea className="input" rows={4} placeholder="Content" value={uForm.content} onChange={(e) => setUForm({ ...uForm, content: e.target.value })} required />
            <input className="input" placeholder="Tags (comma separated)" value={uForm.tags} onChange={(e) => setUForm({ ...uForm, tags: e.target.value })} />
            <input className="input" placeholder="Image URL (optional)" value={uForm.image_url} onChange={(e) => setUForm({ ...uForm, image_url: e.target.value })} />
            <input type="file" accept="image/*" className="input" onChange={(e) => setUFile(e.target.files?.[0] || null)} />
            <button type="submit" className="btn-primary">{uForm.id ? 'Save Changes' : 'Publish'}</button>
          </form>
          <div className="card">
            <h3 className="mb-3 font-bold">Published Updates</h3>
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {updates.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-sm font-semibold">{u.title}</span>
                  <div className="flex gap-1">
                    <button className="btn-gold px-2 py-1 text-xs" onClick={() => setUForm({ id: u.id, title: u.title, content: u.content, tags: (u.tags || []).join(', '), image_url: u.image_url || '' })}>Edit</button>
                    <button className="btn-danger px-2 py-1 text-xs" onClick={() => deleteUpdate(u.id)}>Del</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && isOwner && (
        <div className="card">
          <h3 className="mb-4 font-bold">Manage Users</h3>
          <div className="max-h-[500px] space-y-2 overflow-y-auto">
            {users.filter((u) => u.role !== 'owner').map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <span className="font-semibold">{u.username}</span>
                  <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</span>
                  <span className="ml-2 text-xs font-bold" style={{ color: 'var(--gold)' }}>★ {u.stars}</span>
                  {u.is_banned && <span className="ml-2 text-xs text-red-400">BANNED</span>}
                </div>
                <div className="flex gap-1">
                  {u.role === 'admin' ? (
                    <button className="btn-ghost px-2 py-1 text-xs" onClick={() => setRole(u.id, 'user')}>Demote</button>
                  ) : (
                    <button className="btn-gold px-2 py-1 text-xs" onClick={() => setRole(u.id, 'admin')}>Make Admin</button>
                  )}
                  <button className="btn-danger px-2 py-1 text-xs" onClick={() => banUser(u.id, !u.is_banned)}>
                    {u.is_banned ? 'Unban' : 'Ban'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'winners' && (
        <div className="space-y-6">
          <form onSubmit={addWinner} className="card space-y-3">
            <h3 className="font-bold" style={{ color: 'var(--gold)' }}>Announce Winners</h3>
            <input className="input" placeholder="Title" value={wForm.title} onChange={(e) => setWForm({ ...wForm, title: e.target.value })} required />
            <textarea className="input" rows={3} placeholder="Rankings (e.g. 1st: Name, 2nd: Name)" value={wForm.rankings} onChange={(e) => setWForm({ ...wForm, rankings: e.target.value })} required />
            <button type="submit" className="btn-gold">Announce</button>
          </form>
          <div className="card space-y-2">
            {winners.map((w) => (
              <div key={w.id} className="flex justify-between rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                <span className="font-semibold">{w.title}</span>
                <button className="btn-danger px-2 py-1 text-xs" onClick={() => deleteWinner(w.id)}>Del</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'config' && isOwner && (
        <form onSubmit={saveConfig} className="card space-y-3">
          <h3 className="font-bold" style={{ color: 'var(--accent)' }}>About / App Config</h3>
          <input className="input" placeholder="App Name" value={cfg.app_name} onChange={(e) => setCfg({ ...cfg, app_name: e.target.value })} />
          <input className="input" placeholder="Logo URL" value={cfg.app_logo} onChange={(e) => setCfg({ ...cfg, app_logo: e.target.value })} />
          <input className="input" placeholder="Account / Publisher Name" value={cfg.account_name} onChange={(e) => setCfg({ ...cfg, account_name: e.target.value })} />
          <textarea className="input" rows={5} placeholder="About text (*bold* supported)" value={cfg.about_text} onChange={(e) => setCfg({ ...cfg, about_text: e.target.value })} />
          <input className="input" placeholder="Contact email" value={cfg.contact_email} onChange={(e) => setCfg({ ...cfg, contact_email: e.target.value })} />
          <button type="submit" className="btn-gold">Save Config</button>
        </form>
      )}

      {tab === 'links' && (
        <div className="space-y-6">
          <form onSubmit={addLink} className="card space-y-3">
            <h3 className="font-bold">Add Link</h3>
            <input className="input" placeholder="Title" value={lForm.title} onChange={(e) => setLForm({ ...lForm, title: e.target.value })} required />
            <input className="input" placeholder="https://..." value={lForm.url} onChange={(e) => setLForm({ ...lForm, url: e.target.value })} required />
            <button type="submit" className="btn-primary">Add</button>
          </form>
          <div className="card space-y-2">
            {links.map((l) => (
              <div key={l.id} className="flex justify-between rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                <a href={l.url} target="_blank" rel="noreferrer" className="font-semibold" style={{ color: 'var(--accent)' }}>{l.title}</a>
                <button className="btn-danger px-2 py-1 text-xs" onClick={() => deleteLink(l.id)}>Del</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
