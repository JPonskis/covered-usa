'use client';

import { useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

const HEALTHSHERPA_BASE = 'https://www.healthsherpa.com/?_agent_id=dan-hardle&utm_campaign=benefitsusa';

interface QuickResult {
  state: string;
  fplPercentage: number;
  isFFM: boolean;
  primary: {
    id: string;
    name: string;
    estimatedValue: number;
    eligible: boolean | 'maybe';
    reason: string;
  } | null;
  secondary: { id: string; name: string; estimatedValue: number }[];
}

const t = {
  en: {
    zipLabel: 'ZIP code',
    zipPlaceholder: '12345',
    householdLabel: 'Household size',
    incomeLabel: 'Annual household income',
    incomePlaceholder: '$30,000',
    checkBtn: 'Check my eligibility',
    checking: 'Checking...',
    invalidZip: 'Enter a valid 5-digit ZIP code',
    // Results
    resultTitle: 'Good news!',
    resultMayQualify: 'Based on your information, you may qualify for:',
    worthUpTo: 'worth up to',
    perYear: '/year',
    resultNoQualify: 'Based on your income, you may not qualify for subsidies, but affordable plans may still be available.',
    // Agent CTA
    agentTitle: 'Get free help enrolling',
    agentDesc: 'A licensed agent will walk you through your options and help you enroll. No cost, no pressure.',
    // Self-enroll
    selfTitle: 'Enroll on your own',
    selfDesc: 'Browse and compare plans directly.',
    selfBtn: 'Browse plans',
    // Lead form
    nameLabel: 'Full name',
    namePlaceholder: 'First and last name',
    emailLabel: 'Email',
    emailPlaceholder: 'you@email.com',
    phoneLabel: 'Phone number',
    phonePlaceholder: '(555) 123-4567',
    tcpaText: 'By submitting, I agree to be contacted by a licensed agent by phone, text, or email. This is not a condition of purchase. Message and data rates may apply.',
    submitLead: 'Request a callback',
    submitting: 'Submitting...',
    // Confirmation
    confirmTitle: 'You\'re all set!',
    confirmDesc: 'A licensed agent will call you shortly to help you find the best plan.',
    confirmSelf: 'In the meantime, you can also',
    confirmBrowse: 'browse plans on your own',
    // Edit
    editLink: 'Edit my info',
    orText: 'or',
    startOver: 'Check again',
  },
  es: {
    zipLabel: 'Código postal',
    zipPlaceholder: '12345',
    householdLabel: 'Personas en el hogar',
    incomeLabel: 'Ingreso anual del hogar',
    incomePlaceholder: '$30,000',
    checkBtn: 'Verificar mi elegibilidad',
    checking: 'Verificando...',
    invalidZip: 'Ingresa un código postal válido de 5 dígitos',
    resultTitle: '¡Buenas noticias!',
    resultMayQualify: 'Según tu información, podrías calificar para:',
    worthUpTo: 'con un valor de hasta',
    perYear: '/año',
    resultNoQualify: 'Según tus ingresos, es posible que no califiques para subsidios, pero aún puedes encontrar planes accesibles.',
    agentTitle: 'Recibe ayuda gratis para inscribirte',
    agentDesc: 'Un agente con licencia te explicará tus opciones y te ayudará a inscribirte. Sin costo, sin presión.',
    selfTitle: 'Inscríbete por tu cuenta',
    selfDesc: 'Compara planes directamente.',
    selfBtn: 'Ver planes',
    nameLabel: 'Nombre completo',
    namePlaceholder: 'Nombre y apellido',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@email.com',
    phoneLabel: 'Teléfono',
    phonePlaceholder: '(555) 123-4567',
    tcpaText: 'Al enviar, acepto ser contactado por un agente con licencia por teléfono, mensaje de texto o correo electrónico. Esto no es condición de compra. Pueden aplicar tarifas de mensajes y datos.',
    submitLead: 'Solicitar llamada',
    submitting: 'Enviando...',
    confirmTitle: '¡Listo!',
    confirmDesc: 'Un agente con licencia te llamará pronto para ayudarte a encontrar el mejor plan.',
    confirmSelf: 'Mientras tanto, también puedes',
    confirmBrowse: 'ver planes por tu cuenta',
    editLink: 'Editar mi información',
    orText: 'o',
    startOver: 'Verificar de nuevo',
  },
};

// Program display names (friendlier than internal IDs)
const programDisplay: Record<string, { en: string; es: string }> = {
  medicaid: { en: 'Free health coverage through Medicaid', es: 'Cobertura de salud gratuita a través de Medicaid' },
  aca: { en: 'ACA health insurance subsidies', es: 'Subsidios de seguro médico del ACA' },
  chip: { en: 'Children\'s health coverage (CHIP)', es: 'Cobertura de salud para niños (CHIP)' },
  'va-healthcare': { en: 'VA Healthcare benefits', es: 'Beneficios de salud del VA' },
  medicare: { en: 'Medicare coverage', es: 'Cobertura de Medicare' },
  'medicare-savings': { en: 'Medicare Savings Programs', es: 'Programas de ahorro de Medicare' },
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatIncomeInput(value: string): string {
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return '';
  return '$' + Number(digits).toLocaleString('en-US');
}

function parseIncomeValue(formatted: string): number {
  return Number(formatted.replace(/[^0-9]/g, '')) || 0;
}

function formatPhone(value: string): string {
  const digits = value.replace(/[^0-9]/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export function InlineScreener({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const lang = (locale === 'es' ? 'es' : 'en') as keyof typeof t;
  const c = t[lang];

  const [step, setStep] = useState<'form' | 'results' | 'lead' | 'done'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [zip, setZip] = useState('');
  const [household, setHousehold] = useState('1');
  const [income, setIncome] = useState('');

  // Result
  const [result, setResult] = useState<QuickResult | null>(null);

  // Lead form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tcpa, setTcpa] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  // Gather UTM params for passthrough
  function getUtmParams() {
    const params: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => {
      const v = searchParams.get(k);
      if (v) params[k] = v;
    });
    return params;
  }

  async function handleCheck() {
    const cleanZip = zip.replace(/\s/g, '');
    if (!/^\d{5}$/.test(cleanZip)) {
      setError(c.invalidZip);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/quick-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zipCode: cleanZip,
          householdSize: parseInt(household, 10),
          annualIncome: parseIncomeValue(income),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      const data: QuickResult = await res.json();
      setResult(data);
      setStep('results');

      // Scroll to results after render
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLeadSubmit() {
    if (!fullName.trim() || phone.replace(/[^0-9]/g, '').length < 10 || !tcpa) return;

    setLeadLoading(true);

    try {
      const utms = getUtmParams();

      // Step 1: Create a submission via /api/screen
      const screenRes = await fetch('/api/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zipCode: zip.replace(/\s/g, ''),
          age: 35,
          householdSize: parseInt(household, 10),
          numChildren: Math.max(0, parseInt(household, 10) - 1),
          annualIncome: parseIncomeValue(income),
          isPregnant: false,
          hasDisability: false,
          isVeteran: false,
          currentlyInsured: false,
          insuranceSource: 'none',
          firstName: fullName.trim().split(/\s+/)[0] || fullName.trim(),
          lastName: fullName.trim().split(/\s+/).slice(1).join(' ') || '',
          email: email.trim() || null,
          language: locale,
          ...utms,
        }),
      });

      if (!screenRes.ok) {
        setError('Something went wrong. Please try again.');
        setLeadLoading(false);
        return;
      }

      const screenData = await screenRes.json();
      const submissionId = screenData.submissionId;

      if (!submissionId) {
        setError('Something went wrong. Please try again.');
        setLeadLoading(false);
        return;
      }

      // Step 2: Post lead with phone + TCPA
      const leadRes = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          phone: phone.replace(/[^0-9]/g, ''),
          tcpaConsent: true,
          tcpaTimestamp: new Date().toISOString(),
        }),
      });

      if (!leadRes.ok) {
        setError('Something went wrong. Please try again.');
        setLeadLoading(false);
        return;
      }

      setStep('done');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLeadLoading(false);
    }
  }

  const hsUrl = `${HEALTHSHERPA_BASE}&zip=${zip.replace(/\s/g, '')}`;

  // ── FORM STEP ──
  if (step === 'form') {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e7e5e4',
          padding: '1.75rem 1.5rem',
          maxWidth: '32rem',
          marginInline: 'auto',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* ZIP */}
          <div>
            <label style={labelStyle}>{c.zipLabel}</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder={c.zipPlaceholder}
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, ''))}
              style={inputStyle}
              aria-label={c.zipLabel}
            />
          </div>

          {/* Household size */}
          <div>
            <label style={labelStyle}>{c.householdLabel}</label>
            <select
              value={household}
              onChange={(e) => setHousehold(e.target.value)}
              style={{ ...inputStyle, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2378716c\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
              aria-label={c.householdLabel}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Income */}
          <div>
            <label style={labelStyle}>{c.incomeLabel}</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder={c.incomePlaceholder}
              value={income}
              onChange={(e) => setIncome(formatIncomeInput(e.target.value))}
              style={inputStyle}
              aria-label={c.incomeLabel}
            />
          </div>

          {error && (
            <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: 0 }}>{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleCheck}
            disabled={loading}
            className="cta-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '1rem',
              fontSize: '1.0625rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display), -apple-system, sans-serif',
              color: '#ffffff',
              background: loading ? '#5eaaa2' : '#0d9488',
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 4px 14px rgba(13,148,136,0.35)',
              transition: 'all 0.2s ease',
              letterSpacing: '-0.01em',
            }}
          >
            {loading ? c.checking : c.checkBtn}
            {!loading && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS STEP ──
  if (step === 'results' && result) {
    const hasPrimary = result.primary && result.primary.estimatedValue > 0;
    const programName = result.primary
      ? (programDisplay[result.primary.id]?.[lang] || result.primary.name)
      : '';

    return (
      <div ref={resultRef} style={{ maxWidth: '32rem', marginInline: 'auto' }}>
        {/* Result card */}
        <div
          style={{
            background: hasPrimary ? '#f0fdf4' : '#ffffff',
            borderRadius: '16px',
            border: `1px solid ${hasPrimary ? '#bbf7d0' : '#e7e5e4'}`,
            padding: '1.75rem 1.5rem',
            marginBottom: '1rem',
            textAlign: 'center',
          }}
        >
          {hasPrimary ? (
            <>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.75rem' }}>
                {c.resultTitle}
              </p>
              <p style={{ color: '#57534e', fontSize: '0.9rem', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                {c.resultMayQualify}
              </p>
              <p style={{ fontWeight: 700, color: '#1C1A16', fontSize: '1.1rem', margin: '0 0 0.5rem', fontFamily: 'var(--font-display)' }}>
                {programName}
              </p>
              {result.primary!.estimatedValue > 0 && (
                <p style={{ color: '#16a34a', fontWeight: 800, fontSize: '1.625rem', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                  {c.worthUpTo} {formatCurrency(result.primary!.estimatedValue)}{c.perYear}
                </p>
              )}
            </>
          ) : (
            <p style={{ color: '#57534e', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
              {c.resultNoQualify}
            </p>
          )}
        </div>

        {/* Action cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Agent help CTA - only for FFM states */}
          {result.isFFM && (
            <button
              onClick={() => setStep('lead')}
              style={{
                background: '#0d9488',
                borderRadius: '14px',
                border: 'none',
                padding: '1.25rem 1.5rem',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 4px 14px rgba(13,148,136,0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.0625rem', margin: '0 0 0.25rem', fontFamily: 'var(--font-display)' }}>
                {c.agentTitle}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                {c.agentDesc}
              </p>
            </button>
          )}

          {/* Self-enroll */}
          <a
            href={hsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn"
            style={{
              display: 'block',
              background: result.isFFM ? '#ffffff' : '#0d9488',
              borderRadius: '14px',
              border: result.isFFM ? '1px solid #e7e5e4' : 'none',
              padding: '1.25rem 1.5rem',
              textDecoration: 'none',
              textAlign: 'left',
              boxShadow: result.isFFM ? '0 1px 4px rgba(0,0,0,0.04)' : '0 4px 14px rgba(13,148,136,0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            <p style={{
              color: result.isFFM ? '#1C1A16' : '#ffffff',
              fontWeight: 700,
              fontSize: '1.0625rem',
              margin: '0 0 0.25rem',
              fontFamily: 'var(--font-display)',
            }}>
              {c.selfTitle}
            </p>
            <p style={{
              color: result.isFFM ? '#78716c' : 'rgba(255,255,255,0.85)',
              fontSize: '0.85rem',
              margin: 0,
              lineHeight: 1.4,
            }}>
              {c.selfDesc}
            </p>
          </a>
        </div>

        {/* Start over */}
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={() => { setStep('form'); setResult(null); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#0d9488', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }}
          >
            {c.startOver}
          </button>
        </p>
      </div>
    );
  }

  // ── LEAD FORM STEP ──
  if (step === 'lead') {
    return (
      <div ref={resultRef} style={{ maxWidth: '32rem', marginInline: 'auto' }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e7e5e4',
            padding: '1.75rem 1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1C1A16', margin: '0 0 0.25rem', fontFamily: 'var(--font-display)' }}>
            {c.agentTitle}
          </h3>
          <p style={{ color: '#78716c', fontSize: '0.85rem', margin: '0 0 1.25rem', lineHeight: 1.4 }}>
            {c.agentDesc}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full name */}
            <div>
              <label style={labelStyle}>{c.nameLabel}</label>
              <input
                type="text"
                placeholder={c.namePlaceholder}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={inputStyle}
                aria-label={c.nameLabel}
              />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>{c.emailLabel}</label>
              <input
                type="email"
                placeholder={c.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                aria-label={c.emailLabel}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={labelStyle}>{c.phoneLabel}</label>
              <input
                type="tel"
                placeholder={c.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                maxLength={14}
                style={inputStyle}
                aria-label={c.phoneLabel}
              />
            </div>

            {/* TCPA */}
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={tcpa}
                onChange={(e) => setTcpa(e.target.checked)}
                style={{ marginTop: '3px', width: '16px', height: '16px', flexShrink: 0, accentColor: '#0d9488' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#a8a29e', lineHeight: 1.4 }}>
                {c.tcpaText}
              </span>
            </label>

            {error && (
              <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: 0 }}>{error}</p>
            )}

            {/* Submit */}
            <button
              onClick={handleLeadSubmit}
              disabled={leadLoading || !fullName.trim() || phone.replace(/[^0-9]/g, '').length < 10 || !tcpa}
              className="cta-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '1rem',
                fontSize: '1.0625rem',
                fontWeight: 700,
                fontFamily: 'var(--font-display), -apple-system, sans-serif',
                color: '#ffffff',
                background: (leadLoading || !fullName.trim() || phone.replace(/[^0-9]/g, '').length < 10 || !tcpa) ? '#a8a29e' : '#0d9488',
                borderRadius: '12px',
                border: 'none',
                cursor: (leadLoading || !fullName.trim() || phone.replace(/[^0-9]/g, '').length < 10 || !tcpa) ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(13,148,136,0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              {leadLoading ? c.submitting : c.submitLead}
            </button>
          </div>

          {/* Back to results */}
          <p style={{ textAlign: 'center', marginTop: '1rem', marginBottom: 0 }}>
            <button
              onClick={() => { setStep('results'); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#78716c', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {c.orText} {c.selfTitle.toLowerCase()}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── DONE STEP ──
  return (
    <div style={{ maxWidth: '32rem', marginInline: 'auto' }}>
      <div
        style={{
          background: '#f0fdf4',
          borderRadius: '16px',
          border: '1px solid #bbf7d0',
          padding: '2rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1C1A16', margin: '0 0 0.5rem', fontFamily: 'var(--font-display)' }}>
          {c.confirmTitle}
        </h3>
        <p style={{ color: '#57534e', fontSize: '0.95rem', margin: '0 0 1rem', lineHeight: 1.5 }}>
          {c.confirmDesc}
        </p>
        <p style={{ fontSize: '0.85rem', color: '#78716c', margin: 0 }}>
          {c.confirmSelf}{' '}
          <a
            href={hsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn"
            style={{ color: '#0d9488', textDecoration: 'underline', fontWeight: 600 }}
          >
            {c.confirmBrowse}
          </a>
        </p>
      </div>
    </div>
  );
}

// ── Shared styles ──

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#44403c',
  marginBottom: '0.375rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 0.875rem',
  fontSize: '1rem',
  border: '1px solid #d6d3d1',
  borderRadius: '10px',
  background: '#fafaf9',
  color: '#1C1A16',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  boxSizing: 'border-box',
};
