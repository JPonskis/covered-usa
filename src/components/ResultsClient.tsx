'use client';

import { useState } from 'react';
import type { ProgramResult } from '@/lib/eligibility';
import NearbyClinics from '@/components/NearbyClinics';

export interface ResultsClientProps {
  submissionId: string;
  firstName: string;
  zipCode: string;
  locale: string;
  primaryProgram: ProgramResult | null;
  secondaryPrograms: ProgramResult[];
  notEligible: ProgramResult[];
}

/* ---- Phone Capture Form ---- */
function PhoneCaptureForm({
  submissionId,
  locale,
}: {
  submissionId: string;
  locale: string;
}) {
  const es = locale === 'es';
  const [phone, setPhone] = useState('');
  const [tcpaConsent, setTcpaConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) {
      setError(
        es ? 'Se requiere número de teléfono.' : 'Phone number is required.'
      );
      return;
    }
    if (!tcpaConsent) {
      setError(es ? 'Debes aceptar el consentimiento.' : 'You must accept the consent.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          phone,
          tcpaConsent: true,
          tcpaTimestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setDone(true);
    } catch {
      setError(
        es
          ? 'Algo salió mal. Inténtalo de nuevo.'
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-[var(--success-light)] rounded-xl p-5 mt-6 text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: 'var(--success)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">
          {es ? '¡Todo listo!' : "You're all set!"}
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {es
            ? 'Un agente te llamará pronto.'
            : 'An agent will call you shortly.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--cream)] rounded-xl p-5 mt-6">
      <h3 className="font-semibold text-[var(--text-primary)] mb-1">
        {es ? '¿Quieres ayuda gratuita para inscribirte?' : 'Want free help enrolling?'}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        {es
          ? 'Un agente con licencia puede guiarte por tus opciones sin costo.'
          : 'A licensed agent can walk you through your options at no cost.'}
      </p>

      {/* Trust badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(es
          ? ['Gratis', 'Agentes certificados', 'Sin obligación']
          : ['Free', 'Licensed agents', 'No obligation']
        ).map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-light)]"
          >
            ✓ {badge}
          </span>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={es ? '(xxx) xxx-xxxx' : '(xxx) xxx-xxxx'}
          required
          className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
        />

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={tcpaConsent}
            onChange={(e) => setTcpaConsent(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-xs text-[var(--text-muted)] leading-relaxed">
            {es
              ? 'Al marcar esta casilla, acepto ser contactado por un agente de seguros con licencia por teléfono o mensaje de texto. El consentimiento no es necesario para comprar un seguro.'
              : 'By checking this box, I agree to be contacted by a licensed insurance agent via phone or text. Consent is not required to purchase insurance.'}
          </span>
        </label>

        {error && (
          <p className="text-sm text-[var(--error)]">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full"
          style={{ opacity: submitting ? 0.7 : 1 }}
        >
          {submitting
            ? es
              ? 'Conectando...'
              : 'Connecting...'
            : es
            ? 'Conéctame con un Agente'
            : 'Connect Me With an Agent'}
        </button>
      </form>
    </div>
  );
}

/* ---- Estimated Value Display ---- */
function EstimatedValue({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <p className="text-3xl font-bold text-[var(--primary)] mt-1">
      ${value.toLocaleString()}
      <span className="text-base font-normal text-[var(--text-muted)]">/yr</span>
    </p>
  );
}

/* ---- Main Results Client Component ---- */
export default function ResultsClient({
  submissionId,
  firstName,
  zipCode,
  locale,
  primaryProgram,
  secondaryPrograms,
  notEligible,
}: ResultsClientProps) {
  const es = locale === 'es';
  const showPhoneCapture =
    primaryProgram &&
    ['aca', 'medicare'].includes(primaryProgram.id);
  const showClinics =
    primaryProgram && primaryProgram.id === 'medicaid';
  const showHealthSherpa = primaryProgram && primaryProgram.id === 'aca';

  // Language toggle URL
  const altLocale = es ? 'en' : 'es';
  const altLocaleLabel = es ? 'EN' : 'ES';

  return (
    <div
      style={{ minHeight: '100vh', background: 'var(--warm-white)', paddingBottom: '4rem' }}
    >
      {/* Header */}
      <header style={{ background: 'var(--primary)', padding: '0' }}>
        <div
          style={{
            maxWidth: '48rem',
            margin: '0 auto',
            padding: '0.875rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <a
            href={`/${locale}`}
            style={{
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
            }}
          >
            CoveredUSA
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a
              href={`/${locale}/screener`}
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.875rem',
                textDecoration: 'none',
              }}
            >
              {es ? '← Volver' : '← Back'}
            </a>
            <a
              href={`/${altLocale}/results/${submissionId}`}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.625rem',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.4)',
                color: 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
              }}
            >
              {altLocaleLabel}
            </a>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Summary Card */}
        <div
          className="bg-white border border-[var(--border-light)] rounded-xl shadow-sm p-6 mb-6"
        >
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            {es
              ? `Tus Opciones de Cobertura Médica${firstName ? `, ${firstName}` : ''}`
              : `Your Health Coverage Options${firstName ? `, ${firstName}` : ''}`}
          </h1>
          {primaryProgram ? (
            <>
              <p className="text-[var(--text-secondary)] text-sm mt-1">
                {es
                  ? `Calificaste principalmente para: `
                  : `Your top match: `}
                <strong className="text-[var(--text-primary)]">
                  {primaryProgram.name}
                </strong>
              </p>
              <EstimatedValue value={primaryProgram.estimatedValue} />
            </>
          ) : (
            <p className="text-[var(--text-secondary)] text-sm mt-2">
              {es
                ? 'No encontramos programas para los que califiques en este momento.'
                : "We didn't find programs you qualify for right now."}
            </p>
          )}
        </div>

        {/* Primary Program Card */}
        {primaryProgram && (
          <div
            className="bg-white border border-[var(--border-light)] rounded-xl shadow-sm p-6 mb-6"
            style={{ borderLeft: '4px solid var(--primary)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {primaryProgram.name}
              </h2>
              {primaryProgram.estimatedValue > 0 && (
                <span className="text-[var(--primary)] font-bold text-lg whitespace-nowrap ml-3">
                  ${primaryProgram.estimatedValue.toLocaleString()}
                  <span className="text-sm font-normal text-[var(--text-muted)]">/yr</span>
                </span>
              )}
            </div>

            {/* Why You Qualify */}
            <div className="bg-[var(--cream)] rounded-lg p-4 text-sm mb-4">
              <span className="font-semibold text-[var(--text-primary)]">
                {es ? 'Por Qué Calificas: ' : 'Why You Qualify: '}
              </span>
              <span className="text-[var(--text-secondary)]">
                {primaryProgram.reason}
              </span>
            </div>

            {/* Next Steps */}
            {primaryProgram.nextSteps && (
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                {primaryProgram.nextSteps}
              </p>
            )}

            {/* HealthSherpa self-apply for ACA */}
            {showHealthSherpa && (
              <a
                href="https://www.healthsherpa.com/?_agent_id=dan-hardle&utm_campaign=&utm_source=&utm_medium="
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex mb-2"
              >
                {es ? 'Solicitar en HealthSherpa' : 'Self-Apply on HealthSherpa'}
              </a>
            )}

            {/* Phone Capture for ACA or Medicare */}
            {showPhoneCapture && (
              <PhoneCaptureForm submissionId={submissionId} locale={locale} />
            )}

            {/* NearbyClinics for Medicaid */}
            {showClinics && (
              <div className="mt-6 pt-6 border-t border-[var(--border-light)]">
                <NearbyClinics
                  zipCode={zipCode}
                  submissionId={submissionId}
                  locale={locale}
                />
              </div>
            )}
          </div>
        )}

        {/* Secondary Programs */}
        {secondaryPrograms.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
              {es
                ? 'También puedes calificar para:'
                : 'You may also qualify for:'}
            </h2>
            <div className="space-y-3">
              {secondaryPrograms.map((prog) => (
                <div
                  key={prog.id}
                  className="bg-white border border-[var(--border-light)] rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-[var(--text-primary)] text-sm">
                      {prog.name}
                    </h3>
                    {prog.estimatedValue > 0 && (
                      <span className="text-[var(--primary)] font-semibold text-sm whitespace-nowrap ml-2">
                        ${prog.estimatedValue.toLocaleString()}/yr
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    {prog.reason}
                  </p>
                  {prog.nextSteps && (
                    <a
                      href={
                        prog.nextSteps.match(/https?:\/\/[^\s)]+/)?.[0] ||
                        '#'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[var(--primary)] hover:underline"
                    >
                      {es ? 'Solicitar Ahora →' : 'Apply Now →'}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Not Eligible (collapsible) */}
        {notEligible.length > 0 && (
          <details className="bg-white border border-[var(--border-light)] rounded-xl p-5 mb-6 shadow-sm">
            <summary className="cursor-pointer text-[var(--text-muted)] text-sm font-medium select-none">
              {es
                ? `Programas para los que no calificas (${notEligible.length})`
                : `Programs you don't qualify for right now (${notEligible.length})`}
            </summary>
            <ul className="mt-4 space-y-2">
              {notEligible.map((prog) => (
                <li key={prog.id} className="text-sm text-[var(--text-muted)]">
                  <span className="font-medium text-[var(--text-secondary)]">
                    {prog.name}:
                  </span>{' '}
                  {prog.reason}
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Disclaimer */}
        <div className="bg-[var(--cream)] border border-[var(--border-light)] rounded-xl p-5 mb-6">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {es
              ? 'Estos resultados son estimados y no garantizan elegibilidad. La elegibilidad real es determinada por cada programa. CoveredUSA es una herramienta gratuita, no una aseguradora ni agencia gubernamental.'
              : 'These results are estimates based on your answers and are not a guarantee of eligibility. Actual eligibility is determined by each program. CoveredUSA is a free screening tool, not an insurance company or government agency.'}
          </p>
        </div>

        {/* Retake link */}
        <div className="text-center">
          <a
            href={`/${locale}/screener`}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] underline"
          >
            {es
              ? 'Volver a tomar el cuestionario con otras respuestas'
              : 'Retake the screener with different answers'}
          </a>
        </div>
      </div>
    </div>
  );
}
