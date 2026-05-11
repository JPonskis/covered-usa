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

/* ---- Eligible / Maybe Program Card ---- */
function EligibleCard({ program }: { program: ProgramResult }) {
  const meta = PROGRAM_DESCRIPTIONS[program.id] || { icon: '📄', description: program.reason };
  const isMaybe = program.eligible === 'maybe';

  const accentColor = isMaybe ? 'var(--warning)' : 'var(--success)';
  const accentBg = isMaybe ? 'var(--warning-light)' : 'var(--success-light)';
  const statusLabel = isMaybe ? 'May Qualify' : 'Likely Eligible';

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid var(--border-light)',
      borderLeft: `4px solid ${accentColor}`,
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow 0.2s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: accentBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            flexShrink: 0,
          }}>
            {meta.icon}
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {program.name}
            </h3>
            {program.estimatedValue > 0 && (
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Est. value: <strong style={{ color: accentColor }}>${program.estimatedValue.toLocaleString()}/yr</strong>
              </p>
            )}
          </div>
        </div>
        <span style={{
          background: accentBg,
          color: accentColor,
          padding: '0.25rem 0.625rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {statusLabel}
        </span>
      </div>

      <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {meta.description}
      </p>

      <p style={{ margin: '0 0 1rem', fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        {program.reason}
      </p>

      <a
        href={program.nextSteps.includes('http') ? program.nextSteps.match(/https?:\/\/[^\s)]+/)?.[0] || '#' : '#'}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.5rem 1rem',
          background: accentColor,
          color: 'white',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.85rem',
          textDecoration: 'none',
          transition: 'opacity 0.15s',
        }}
      >
        Learn how to enroll
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5.25 3.5L8.75 7L5.25 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );
}

/* ---- Not Eligible Collapsed Card ---- */
function NotEligibleCard({ program }: { program: ProgramResult }) {
  const [expanded, setExpanded] = useState(false);
  const meta = PROGRAM_DESCRIPTIONS[program.id] || { icon: '📄', description: program.reason };

  return (
    <div style={{
      background: 'var(--warm-white)',
      borderRadius: '12px',
      border: '1px solid var(--border-light)',
      overflow: 'hidden',
      transition: 'all 0.15s ease',
    }}>
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '1rem' }}>{meta.icon}</span>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {program.name}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            background: 'var(--sand)',
            color: 'var(--text-muted)',
            padding: '0.2rem 0.5rem',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: 600,
          }}>
            Not Eligible
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}
          >
            <path d="M4 6L8 10L12 6" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid var(--border-light)' }}>
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
            {program.reason}
          </p>
        </div>
      )}
    </div>
  );
}

/* ---- Savings Callout ---- */
function SavingsCallout({ value }: { value: number }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--success), #047857)',
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: 'var(--shadow-teal)',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        flexShrink: 0,
      }}>
        💰
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.9, marginBottom: '0.15rem' }}>
          Estimated annual savings
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          ${value.toLocaleString()}<span style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.8 }}>/year</span>
        </div>
      </div>
    </div>
  );
}

/* ---- Lead Capture ---- */
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
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--success-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M7 14L12 19L21 9" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
          You&apos;re all set!
        </h3>
        <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
          A licensed insurance agent will reach out shortly. The call is free and there&apos;s no obligation.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
      borderRadius: '20px',
      padding: '2rem',
      color: 'white',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'white' }}>
        Want free help enrolling?
      </h2>
      <p style={{ margin: '0 0 1.25rem', opacity: 0.85, lineHeight: 1.6, fontSize: '0.9rem' }}>
        A licensed agent speaks your language, explains your options, and helps you apply at no cost to you.
      </p>

      {/* Trust signals */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {['Free consultation', 'Licensed agents', 'English & Spanish', 'No obligation'].map(t => (
          <span key={t} style={{
            background: 'rgba(255,255,255,0.12)',
            padding: '0.25rem 0.625rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}>
            ✓ {t}
          </span>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          type="text"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          placeholder="First name (optional)"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: '2px solid rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '0.95rem',
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
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: '2px solid rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '0.95rem',
            outline: 'none',
          }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {[
            { val: 'en', label: 'English' },
            { val: 'es', label: 'Español' },
          ].map(opt => (
            <button
              key={opt.val}
              type="button"
              onClick={() => setLanguage(opt.val)}
              style={{
                padding: '0.625rem',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: language === opt.val ? 'white' : 'rgba(255,255,255,0.25)',
                background: language === opt.val ? 'white' : 'transparent',
                color: language === opt.val ? 'var(--primary-dark)' : 'white',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {error && <p style={{ color: '#fca5a5', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.875rem',
            background: 'white',
            color: 'var(--primary-dark)',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            transition: 'all 0.15s',
          }}
        >
          {submitting ? 'Connecting...' : 'Connect me with an agent'}
        </button>

        <p style={{ fontSize: '0.7rem', opacity: 0.6, margin: 0, textAlign: 'center' }}>
          By submitting, you agree to be contacted by a licensed insurance agent. Message rates may apply.
        </p>
      </form>
    </div>
  );
}

/* ---- Nothing Eligible Message ---- */
function NothingEligibleMessage({ locale }: { locale: string }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '2rem',
      textAlign: 'center',
      border: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'var(--cream)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1rem',
        fontSize: '1.5rem',
      }}>
        💡
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
        You may still have options
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.25rem', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
        Based on your answers, you don&apos;t appear to qualify for the programs we checked. But eligibility can change, and there may be other options available to you.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <a
          href={`/${locale}/screener`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.75rem 1.5rem',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          Retake with different answers
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5.25 3.5L8.75 7L5.25 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a
          href="https://www.healthcare.gov/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'underline' }}
        >
          Visit Healthcare.gov for more options
        </a>
      </div>
    </div>
  );
}

/* ---- Main Results Component ---- */
export default function ResultsClient({ results, submissionId, locale }: Props) {
  const eligible = results.programs.filter(p => p.eligible === true);
  const maybe = results.programs.filter(p => p.eligible === 'maybe');
  const notEligible = results.programs.filter(p => p.eligible === false);
  const qualifyingCount = eligible.length + maybe.length;
  const hasResults = qualifyingCount > 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--warm-white)',
      padding: '0 0 4rem',
    }}>
      {/* Header */}
      <div style={{
        background: hasResults
          ? 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--teal) 100%)'
          : 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
        padding: '2rem 1.5rem 3.5rem',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
      }}>
        <a
          href={`/${locale}`}
          style={{ display: 'inline-block', fontWeight: 700, fontSize: '1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', textDecoration: 'none' }}
        >
          CoveredUSA
        </a>

        {hasResults ? (
          <>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              backdropFilter: 'blur(4px)',
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 0.375rem', color: 'white', letterSpacing: '-0.01em' }}>
              Great news! You may qualify for {qualifyingCount} program{qualifyingCount !== 1 ? 's' : ''}
            </h1>
            <p style={{ fontSize: '0.95rem', opacity: 0.85, margin: 0 }}>
              Here&apos;s what we found based on your answers
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 0.375rem', color: 'white' }}>
              Your eligibility results
            </h1>
            <p style={{ opacity: 0.85, margin: 0, fontSize: '0.95rem' }}>Based on your answers, here&apos;s what we found</p>
          </>
        )}
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ marginTop: '-2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Savings callout */}
          {results.totalPotentialValue > 0 && hasResults && (
            <SavingsCallout value={results.totalPotentialValue} />
          )}

          {/* Nothing eligible message */}
          {!hasResults && <NothingEligibleMessage locale={locale} />}

          {/* Eligible programs */}
          {eligible.length > 0 && (
            <div>
              <h2 style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--success)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '1rem 0 0.625rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="var(--success)" strokeWidth="1.5" />
                  <path d="M4.5 7L6 8.5L9.5 5" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Likely Eligible ({eligible.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {eligible.map(p => <EligibleCard key={p.id} program={p} />)}
              </div>
            </div>
          )}

          {/* Maybe programs */}
          {maybe.length > 0 && (
            <div>
              <h2 style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--warning)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '1rem 0 0.625rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="var(--warning)" strokeWidth="1.5" />
                  <path d="M7 4.5V7.5M7 9.5V9.5" stroke="var(--warning)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                May Qualify ({maybe.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {maybe.map(p => <EligibleCard key={p.id} program={p} />)}
              </div>
            </div>
          )}

          {/* Not eligible - collapsed */}
          {notEligible.length > 0 && (
            <div>
              <h2 style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '1.5rem 0 0.625rem',
              }}>
                Not Eligible ({notEligible.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {notEligible.map(p => <NotEligibleCard key={p.id} program={p} />)}
              </div>
            </div>
          )}
        </div>

        {/* Lead capture */}
        {hasResults && (
          <div style={{ marginTop: '2rem' }}>
            <LeadCapture submissionId={submissionId} locale={locale} />
          </div>
        )}

        {/* Retake link */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a
            href={`/${locale}/screener`}
            style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'underline' }}
          >
            Retake the screener with different answers
          </a>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.725rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
          These results are estimates based on your answers and are not a guarantee of eligibility.
          Actual eligibility is determined by each program. CoveredUSA is a free screening tool, not an insurance company or government agency.
        </p>
      </div>
    </div>
  );
}
