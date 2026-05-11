'use client';

import { useState } from 'react';
import type { ScreenerResults, ProgramResult } from '@/lib/eligibility';

interface Props {
  results: ScreenerResults;
  submissionId: string;
  locale: string;
}

const PROGRAM_DESCRIPTIONS: Record<string, { icon: string; description: string }> = {
  'medicaid': {
    icon: '🏥',
    description: 'Full health coverage including doctor visits, hospital care, prescriptions, and preventive care. No or very low out-of-pocket costs.',
  },
  'aca': {
    icon: '📋',
    description: 'Monthly premium subsidies to lower the cost of a Marketplace health plan. Covers doctor visits, emergency care, prescriptions, and more.',
  },
  'medicare': {
    icon: '🩺',
    description: 'Federal health insurance covering hospital stays (Part A), outpatient care (Part B), and prescription drugs (Part D).',
  },
  'medicare-savings': {
    icon: '💊',
    description: 'Helps pay Medicare premiums, deductibles, and copays. Can save eligible seniors hundreds or thousands per year.',
  },
  'chip': {
    icon: '👶',
    description: "Low-cost health coverage for children in families that earn too much for Medicaid but can't afford private insurance.",
  },
  'va-healthcare': {
    icon: '🎖️',
    description: 'Comprehensive healthcare through VA facilities for eligible veterans, including primary care, mental health, and specialty care.',
  },
};

function ProgramCard({ program }: { program: ProgramResult }) {
  const meta = PROGRAM_DESCRIPTIONS[program.id] || { icon: '📄', description: program.reason };

  const statusColor = program.eligible === true
    ? 'var(--success)'
    : program.eligible === 'maybe'
    ? 'var(--warning)'
    : 'var(--text-muted)';

  const statusBg = program.eligible === true
    ? '#f0fdf4'
    : program.eligible === 'maybe'
    ? '#fffbeb'
    : '#f8fafc';

  const statusLabel = program.eligible === true
    ? 'Likely Eligible'
    : program.eligible === 'maybe'
    ? 'May Qualify'
    : 'Not Eligible';

  const isNotEligible = program.eligible === false;

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid var(--border-light)',
      boxShadow: isNotEligible ? 'none' : '0 2px 16px rgba(3, 105, 161, 0.06)',
      opacity: isNotEligible ? 0.65 : 1,
      transition: 'opacity 0.15s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{meta.icon}</span>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {program.name}
            </h3>
            {!isNotEligible && program.estimatedValue > 0 && (
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Est. value: <strong style={{ color: 'var(--success)' }}>${program.estimatedValue.toLocaleString()}/yr</strong>
              </p>
            )}
          </div>
        </div>
        <span style={{
          background: statusBg,
          color: statusColor,
          border: `1px solid ${statusColor}30`,
          padding: '0.3rem 0.75rem',
          borderRadius: '999px',
          fontSize: '0.8rem',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {statusLabel}
        </span>
      </div>

      <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {meta.description}
      </p>

      <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        {program.reason}
      </p>

      {!isNotEligible && (
        <a
          href={program.nextSteps.includes('http') ? program.nextSteps.match(/https?:\/\/[^\s)]+/)?.[0] || '#' : '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '0.6rem 1.25rem',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          Get help enrolling →
        </a>
      )}
    </div>
  );
}

function LeadCapture({ submissionId, locale }: { submissionId: string; locale: string }) {
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState(locale === 'es' ? 'es' : 'en');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) { setError('Phone number is required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, firstName, phone, language, wantsHelp: true }),
      });
      if (!res.ok) throw new Error('Failed');
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        border: '2px solid var(--success)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
          You&apos;re all set!
        </h3>
        <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
          A licensed insurance agent will reach out shortly. The call is free — there&apos;s no obligation.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--primary), var(--teal))',
      borderRadius: '20px',
      padding: '2rem',
      color: 'white',
    }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'white' }}>
        Want free help enrolling?
      </h2>
      <p style={{ margin: '0 0 1.5rem', opacity: 0.9, lineHeight: 1.6, fontSize: '0.95rem' }}>
        A licensed agent speaks your language, explains your options, and helps you apply — at no cost to you.
      </p>

      {/* Trust signals */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {['Free consultation', 'Licensed agents', 'English & Spanish', 'No obligation'].map(t => (
          <span key={t} style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '0.3rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            ✓ {t}
          </span>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <input
          type="text"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          placeholder="First name (optional)"
          style={{
            padding: '0.875rem 1rem',
            borderRadius: '12px',
            border: '2px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Phone number *"
          required
          style={{
            padding: '0.875rem 1rem',
            borderRadius: '12px',
            border: '2px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            fontSize: '1rem',
            outline: 'none',
          }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            { val: 'en', label: 'English' },
            { val: 'es', label: 'Español' },
          ].map(opt => (
            <button
              key={opt.val}
              type="button"
              onClick={() => setLanguage(opt.val)}
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                border: '2px solid',
                borderColor: language === opt.val ? 'white' : 'rgba(255,255,255,0.3)',
                background: language === opt.val ? 'white' : 'transparent',
                color: language === opt.val ? 'var(--primary)' : 'white',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {error && <p style={{ color: '#fca5a5', fontSize: '0.875rem', margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '1rem',
            background: 'white',
            color: 'var(--primary)',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}
        >
          {submitting ? 'Connecting...' : 'Connect me with an agent'}
        </button>

        <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0, textAlign: 'center' }}>
          By submitting, you agree to be contacted by a licensed insurance agent. Message rates may apply.
        </p>
      </form>
    </div>
  );
}

export default function ResultsClient({ results, submissionId, locale }: Props) {
  const eligible = results.programs.filter(p => p.eligible === true);
  const maybe = results.programs.filter(p => p.eligible === 'maybe');
  const notEligible = results.programs.filter(p => p.eligible === false);
  const qualifyingCount = eligible.length + maybe.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      padding: '0 0 4rem',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
        padding: '2rem 1.5rem 3rem',
        textAlign: 'center',
        color: 'white',
      }}>
        <a
          href={`/${locale}`}
          style={{ display: 'inline-block', fontWeight: 700, fontSize: '1rem', color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem', textDecoration: 'none' }}
        >
          CoveredUSA
        </a>

        {qualifyingCount > 0 ? (
          <>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '50%',
              width: '72px',
              height: '72px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '2rem',
            }}>
              🎉
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'white' }}>
              You may qualify for {qualifyingCount} program{qualifyingCount !== 1 ? 's' : ''}
            </h1>
            {results.totalPotentialValue > 0 && (
              <p style={{ fontSize: '1.1rem', opacity: 0.9, margin: 0 }}>
                Potential value: <strong>${results.totalPotentialValue.toLocaleString()}/year</strong>
              </p>
            )}
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'white' }}>
              Your eligibility results
            </h1>
            <p style={{ opacity: 0.9, margin: 0 }}>Based on your answers, here&apos;s what we found.</p>
          </>
        )}
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Results cards */}
        <div style={{ marginTop: '-1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {eligible.length > 0 && (
            <div>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '1.5rem 0 0.75rem' }}>
                Likely Eligible ({eligible.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {eligible.map(p => <ProgramCard key={p.id} program={p} />)}
              </div>
            </div>
          )}

          {maybe.length > 0 && (
            <div>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '1.5rem 0 0.75rem' }}>
                May Qualify ({maybe.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {maybe.map(p => <ProgramCard key={p.id} program={p} />)}
              </div>
            </div>
          )}

          {notEligible.length > 0 && (
            <div>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '1.5rem 0 0.75rem' }}>
                Not Eligible ({notEligible.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {notEligible.map(p => <ProgramCard key={p.id} program={p} />)}
              </div>
            </div>
          )}
        </div>

        {/* Lead capture */}
        <div style={{ marginTop: '2.5rem' }}>
          <LeadCapture submissionId={submissionId} locale={locale} />
        </div>

        {/* Retake link */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a
            href={`/${locale}/screener`}
            style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'underline' }}
          >
            Retake the screener with different answers
          </a>
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
          These results are estimates based on your answers and are not a guarantee of eligibility.
          Actual eligibility is determined by each program. CoveredUSA is a free screening tool — not an insurance company or government agency.
        </p>
      </div>
    </div>
  );
}
