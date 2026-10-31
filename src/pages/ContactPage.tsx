export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center" style={{ color: 'var(--text)' }}>
      <h1 className="mb-4 text-3xl font-bold" style={{ color: 'var(--accent)' }}>Contact Us</h1>
      <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
        Have a question, suggestion or need support?
      </p>
      <div className="card">
        <p className="mb-2 text-lg font-semibold">Email</p>
        <a
          href="mailto:vasudevsarswat48@gmail.com"
          className="text-xl font-bold underline"
          style={{ color: 'var(--accent)' }}
        >
          vasudevsarswat48@gmail.com
        </a>
        <p className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          We usually reply within 24–48 hours.
        </p>
      </div>
    </div>
  )
}
