export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10" style={{ color: 'var(--text)' }}>
      <h1 className="mb-6 text-3xl font-bold" style={{ color: 'var(--accent)' }}>Terms of Service</h1>
      <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>Last updated: October 2026</p>

      <section className="mb-6 space-y-3 leading-relaxed">
        <p>
          By accessing or using PZX Arena you agree to these Terms of Service.
        </p>

        <h2 className="mt-6 text-xl font-bold">1. Eligibility</h2>
        <p>You must provide a valid email address to create an account. You are responsible for keeping your login credentials secure.</p>

        <h2 className="mt-6 text-xl font-bold">2. Acceptable Use</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Do not post offensive, abusive, hateful or illegal content in the Community.</li>
          <li>Do not attempt to manipulate quiz scores or the leaderboard.</li>
          <li>Do not upload copyrighted material you do not own.</li>
          <li>The Owner reserves the right to ban accounts that violate these rules.</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">3. Content Ownership</h2>
        <p>
          You retain ownership of content you post. By posting you grant us a non-exclusive licence to display
          that content within the platform. Updates and quizzes created by Admins/Owner remain the property of PZX Arena.
        </p>

        <h2 className="mt-6 text-xl font-bold">4. Quizzes & Stars</h2>
        <p>
          Stars are virtual points awarded for correct answers. They have no real-world monetary value.
          Difficulty unlock thresholds and scoring rules may be adjusted by the Owner at any time.
        </p>

        <h2 className="mt-6 text-xl font-bold">5. Disclaimer</h2>
        <p>
          The service is provided “as is”. We are not responsible for any loss of data, scores or user-generated content.
          Cricket information is for entertainment purposes only.
        </p>

        <h2 className="mt-6 text-xl font-bold">6. Contact</h2>
        <p>
          Questions about these Terms: <strong>vasudevsarswat48@gmail.com</strong>
        </p>
      </section>
    </div>
  )
}
