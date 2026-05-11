'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function DoNotSell() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/do-not-sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          Do Not Sell My Personal Information
        </h1>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Your rights under the California Consumer Privacy Act (CCPA)
        </p>

        <div className="space-y-4 mb-10 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <p>
            Under the California Consumer Privacy Act (CCPA), California residents have the right to opt out of the sale of their personal information.
          </p>
          <p>
            When you use our screener and choose to connect with a licensed insurance agent, we share your contact information and screener responses with that agent. This sharing may constitute a &quot;sale&quot; of personal information under CCPA.
          </p>
          <p>
            To opt out, enter your email address below. We will remove your information from any future data sharing with insurance agents and third-party partners within 15 business days.
          </p>
        </div>

        {submitted ? (
          <div
            className="rounded-xl p-6"
            style={{ background: '#d4edda', border: '1px solid #c3e6cb' }}
          >
            <p className="font-semibold text-lg mb-1" style={{ color: '#155724' }}>
              Request received.
            </p>
            <p className="text-sm" style={{ color: '#155724' }}>
              We&apos;ve recorded your opt-out. Your information will not be shared with insurance agents or third-party partners going forward. This takes effect within 15 business days.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-lg"
                style={{
                  border: '1px solid var(--border)',
                  background: 'white',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                }}
              />
            </div>
            {error && (
              <p className="text-sm" style={{ color: '#dc2626' }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              {loading ? 'Submitting...' : 'Submit Opt-Out Request'}
            </button>
          </form>
        )}

        <div className="mt-10 pt-8" style={{ borderTop: '1px solid var(--border-light)' }}>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            For questions about your privacy rights, contact us at{' '}
            <a href="mailto:privacy@coveredusa.org" className="underline" style={{ color: 'var(--primary)' }}>
              privacy@coveredusa.org
            </a>.
            {' '}CoveredUSA is not affiliated with or endorsed by any government agency.
          </p>
          <div className="flex gap-4">
            <Link
              href={`/${locale}/privacy`}
              className="text-xs underline"
              style={{ color: 'var(--text-muted)' }}
            >
              Privacy Policy
            </Link>
            <Link
              href={`/${locale}/terms`}
              className="text-xs underline"
              style={{ color: 'var(--text-muted)' }}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
