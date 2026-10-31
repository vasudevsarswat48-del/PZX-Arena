import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { AppConfig, InfoLink } from '@/types'
import { formatRichText } from '@/lib/utils'
import { Loader2, ExternalLink, Youtube, Instagram, Twitter, Facebook, Globe, MessageCircle } from 'lucide-react'

const DEFAULT: AppConfig = {
  app_name: 'PZX Arena - Pitch-Zen-Xplosive',
  app_logo: null,
  account_name: 'Vasudev',
  about_text: 'Welcome to PZX Arena – the ultimate cricket quiz, prediction & community platform.',
  social_links: [],
  contact_email: 'vasudevsarswat48@gmail.com',
}

function LinkIcon({ url, title }: { url: string; title: string }) {
  const u = url.toLowerCase()
  const t = title.toLowerCase()
  if (u.includes('youtube') || u.includes('youtu.be') || t.includes('youtube'))
    return <Youtube size={18} className="text-red-500" />
  if (u.includes('instagram') || t.includes('instagram'))
    return <Instagram size={18} className="text-pink-500" />
  if (u.includes('twitter') || u.includes('x.com') || t.includes('twitter'))
    return <Twitter size={18} className="text-sky-500" />
  if (u.includes('facebook') || t.includes('facebook'))
    return <Facebook size={18} className="text-blue-600" />
  if (u.includes('t.me') || u.includes('telegram') || t.includes('telegram'))
    return <MessageCircle size={18} className="text-sky-400" />
  if (u.includes('whatsapp') || t.includes('whatsapp'))
    return <MessageCircle size={18} className="text-green-500" />
  return <Globe size={18} style={{ color: 'var(--accent)' }} />
}

export default function AboutPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT)
  const [links, setLinks] = useState<InfoLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [cRes, lRes] = await Promise.all([
        supabase.from('app_config').select('*').limit(1).maybeSingle(),
        supabase.from('info_links').select('*').order('sort_order'),
      ])
      if (cRes.data) setConfig({ ...DEFAULT, ...cRes.data })
      if (lRes.data) setLinks(lRes.data as InfoLink[])
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
      <h1 className="page-title mb-5">About Us</h1>

      <div className="card mb-6 text-center">
        <div
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-2xl font-bold text-white shadow-md"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
        >
          {config.app_logo ? (
            <img src={config.app_logo} alt="" className="h-full w-full object-cover" />
          ) : (
            <img
              src="/favicon.png"
              alt="PZX"
              className="h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).outerHTML = 'PZX' }}
            />
          )}
        </div>
        <h2 className="text-xl font-bold">{config.app_name}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Managed by {config.account_name}
        </p>
      </div>

      <div className="card mb-6">
        <h3 className="mb-3 font-bold" style={{ color: 'var(--accent)' }}>About</h3>
        <div
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatRichText(config.about_text) }}
        />
      </div>

      {config.social_links?.length > 0 && (
        <div className="card mb-6">
          <h3 className="mb-3 font-bold" style={{ color: 'var(--accent)' }}>Social</h3>
          <div className="flex flex-wrap gap-3">
            {config.social_links.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                <LinkIcon url={s.url} title={s.label} />
                {s.label}
                <ExternalLink size={14} />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="card mb-6">
        <h3 className="mb-3 font-bold" style={{ color: 'var(--accent)' }}>Useful Links</h3>
        {links.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No links yet.</p>
        ) : (
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-semibold transition hover:opacity-90"
                  style={{
                    color: 'var(--text)',
                    backgroundColor: 'var(--bg-elevated)',
                  }}
                >
                  <LinkIcon url={l.url} title={l.title} />
                  <span className="flex-1">{l.title}</span>
                  <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Contact:{' '}
          <a
            href={`mailto:${config.contact_email}`}
            className="font-semibold underline"
            style={{ color: 'var(--accent)' }}
          >
            {config.contact_email}
          </a>
        </p>
      </div>
    </div>
  )
}
