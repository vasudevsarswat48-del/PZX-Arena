export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10" style={{ color: 'var(--text)' }}>
      <h1 className="mb-6 text-3xl font-bold" style={{ color: 'var(--accent)' }}>Privacy Policy</h1>
      <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>Last updated: October 2026</p>

      <section className="mb-6 space-y-3 leading-relaxed">
        <p>
          PZX Arena (“we”, “our”, or “us”) operates the website and application available at this domain.
          This Privacy Policy explains how we collect, use, and protect your information.
        </p>

        <h2 className="mt-6 text-xl font-bold">1. Information We Collect</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Email address (for authentication via OTP)</li>
          <li>Username and optional profile picture</li>
          <li>Quiz answers and star scores</li>
          <li>Community posts and uploaded images</li>
          <li>Basic usage data (pages visited) for improving the service</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">2. How We Use Your Information</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>To provide authentication and personalised experience</li>
          <li>To calculate leaderboard rankings and quiz scores</li>
          <li>To display community content you choose to share</li>
          <li>To send essential service-related emails (OTP codes)</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">3. Data Storage & Security</h2>
        <p>
          Data is stored securely using Supabase (PostgreSQL + Storage). We use industry-standard encryption
          in transit (HTTPS) and at rest. Access to administrative functions is restricted to authorised roles only.
        </p>

        <h2 className="mt-6 text-xl font-bold">4. Third-Party Services</h2>
        <p>
          We use Supabase for authentication, database and file storage. Google Analytics (or similar) may be
          used in future for anonymised traffic statistics. Advertisements (Google AdSense) may appear once approved;
          AdSense has its own privacy practices.
        </p>

        <h2 className="mt-6 text-xl font-bold">5. Your Rights</h2>
        <p>
          You may request deletion of your account and associated data by contacting us at{' '}
          <a href="mailto:vasudevsarswat48@gmail.com" className="underline" style={{ color: 'var(--accent)' }}>
            vasudevsarswat48@gmail.com
          </a>.
        </p>

        <h2 className="mt-6 text-xl font-bold">6. Contact</h2>
        <p>
          For any privacy-related questions: <strong>vasudevsarswat48@gmail.com</strong>
        </p>
      </section>
    </div>
  )
}
