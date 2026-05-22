import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { CtaButton } from './cta-button';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';

  return {
    title: isEs
      ? '¿Calificas para seguro médico gratis? — CoveredUSA'
      : 'Do You Qualify for Free Health Insurance? — CoveredUSA',
    description: isEs
      ? 'Verifica tu elegibilidad en 2 minutos. 100% gratis, confidencial, sin registro.'
      : 'Check your eligibility in 2 minutes. 100% free, confidential, no sign-up required.',
    robots: { index: false, follow: false },
  };
}

// Content keyed by (locale, focus). focus="medicare" overrides default ACA-friendly copy.
const content = {
  es: {
    default: {
      badge: 'Verificación gratuita',
      headline: '¿Calificas para seguro médico gratis?',
      sub: '2 minutos. 100% gratis. Sin compromiso.',
      cta: 'Verificar mi elegibilidad',
      trustItems: [
        { icon: 'shield', label: 'Gratis y confidencial' },
        { icon: 'clock', label: 'Toma 2 minutos' },
        { icon: 'check', label: 'Sin registro' },
        { icon: 'globe', label: 'Disponible en español' },
      ],
      statNumber: '25M+',
      statText: 'estadounidenses califican para cobertura de salud y no lo saben.',
      stepsTitle: 'Así de fácil',
      steps: [
        { num: '1', title: 'Responde unas preguntas rápidas', desc: 'Sobre tu hogar, ingresos y estado. Menos de 2 minutos.' },
        { num: '2', title: 'Mira tus opciones', desc: 'Revisamos Medicaid, ACA, Medicare, CHIP y otros programas.' },
        { num: '3', title: 'Recibe ayuda gratis para inscribirte', desc: 'Te conectamos con un agente en tu idioma. Sin costo.' },
      ],
      ctaBottom: 'Verificar mi elegibilidad',
      bottomPrompt: '¿Listo para ver si calificas?',
      disclaimer: 'CoveredUSA no es una agencia del gobierno. Servicio gratuito.',
      privacyLabel: 'Privacidad',
    },
    medicare: {
      badge: 'Comparación gratuita',
      headline: 'Compara planes Medicare en tu área',
      sub: 'Ayuda gratuita de un agente con licencia. Sin compromiso.',
      cta: 'Comparar planes Medicare',
      trustItems: [
        { icon: 'shield', label: 'Gratis y confidencial' },
        { icon: 'clock', label: 'Toma 2 minutos' },
        { icon: 'check', label: 'Agentes con licencia' },
        { icon: 'globe', label: 'Disponible en español' },
      ],
      statNumber: '25M+',
      statText: 'Los planes Medicare cambian cada año. Asegúrate de que el tuyo aún funcione para ti.',
      stepsTitle: 'Tres pasos sencillos',
      steps: [
        { num: '1', title: 'Cuéntanos tu situación', desc: 'Tu código postal, edad y si ya tienes Medicare.' },
        { num: '2', title: 'Ve los planes disponibles', desc: 'Medicare Advantage, Supplement y opciones de Parte D en tu área.' },
        { num: '3', title: 'Habla con un agente gratis', desc: 'Un agente con licencia te guía sin costo. Sin presión.' },
      ],
      ctaBottom: 'Comparar planes Medicare',
      bottomPrompt: '¿Listo para comparar tus opciones?',
      disclaimer: 'CoveredUSA no es una agencia del gobierno. Servicio gratuito.',
      privacyLabel: 'Privacidad',
    },
  },
  en: {
    default: {
      badge: 'Free eligibility check',
      headline: 'Do You Qualify for Free Health Insurance?',
      sub: '2 minutes. 100% free. No commitment.',
      cta: 'Check my eligibility',
      trustItems: [
        { icon: 'shield', label: 'Free & confidential' },
        { icon: 'clock', label: 'Takes 2 minutes' },
        { icon: 'check', label: 'No sign-up needed' },
        { icon: 'globe', label: 'Available in Spanish' },
      ],
      statNumber: '25M+',
      statText: 'Americans qualify for health coverage and don\'t know it.',
      stepsTitle: 'How it works',
      steps: [
        { num: '1', title: 'Answer a few quick questions', desc: 'About your household, income, and state. Under 2 minutes.' },
        { num: '2', title: 'See your coverage options', desc: 'We check Medicaid, ACA, Medicare, CHIP, and other programs.' },
        { num: '3', title: 'Get free help enrolling', desc: 'We connect you with a licensed agent. No cost, no pressure.' },
      ],
      ctaBottom: 'Check my eligibility',
      bottomPrompt: 'Ready to see if you qualify?',
      disclaimer: 'CoveredUSA is not a government agency. Free service.',
      privacyLabel: 'Privacy',
    },
    medicare: {
      badge: 'Free plan comparison',
      headline: 'Compare Medicare Plans in Your Area',
      sub: 'Free help from a licensed agent. No commitment.',
      cta: 'Compare Medicare plans',
      trustItems: [
        { icon: 'shield', label: 'Free & confidential' },
        { icon: 'clock', label: 'Takes 2 minutes' },
        { icon: 'check', label: 'Licensed agents' },
        { icon: 'globe', label: 'Available in Spanish' },
      ],
      statNumber: '25M+',
      statText: 'Medicare plans change every year. Make sure yours still works for you.',
      stepsTitle: 'How it works',
      steps: [
        { num: '1', title: 'Tell us your situation', desc: 'Your ZIP, age, and whether you already have Medicare.' },
        { num: '2', title: 'See available plans', desc: 'Medicare Advantage, Supplement, and Part D options in your area.' },
        { num: '3', title: 'Talk to an agent for free', desc: 'A licensed agent walks you through your options. No pressure.' },
      ],
      ctaBottom: 'Compare Medicare plans',
      bottomPrompt: 'Ready to compare your options?',
      disclaimer: 'CoveredUSA is not a government agency. Free service.',
      privacyLabel: 'Privacy',
    },
  },
};

function TrustIcon({ type }: { type: string }) {
  const size = 20;
  const color = '#0d9488';
  switch (type) {
    case 'shield':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L4 6v6c0 5.52 3.44 10.24 8 12 4.56-1.76 8-6.48 8-12V6l-8-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'clock':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case 'check':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'globe':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    default:
      return null;
  }
}

export default async function ComenzarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ focus?: string }>;
}) {
  const { locale } = await params;
  const { focus } = await searchParams;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const localeContent = content[locale as keyof typeof content] ?? content.en;
  const isMedicareFocus = focus === 'medicare';
  const c = isMedicareFocus ? localeContent.medicare : localeContent.default;
  const tf = await getTranslations({ locale, namespace: 'footer' });
  const tpmoDisclaimer = tf('medicare');
  const tpmoMultiPlan = tf('tpmoMultiPlan');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
      }}
    >
      {/* Minimal header */}
      <header
        style={{
          background: '#ffffff',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #f0ede8',
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 no-underline hover:opacity-90 transition-opacity"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
              <path
                d="M12 2L4 6v6c0 5.52 3.44 10.24 8 12 4.56-1.76 8-6.48 8-12V6l-8-4z"
                fill="#0d9488"
                opacity="0.15"
                stroke="#0d9488"
                strokeWidth="1.5"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#0d9488"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                color: '#1C1A16',
                fontWeight: 700,
                fontSize: '1.125rem',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-display)',
              }}
            >
              CoveredUSA
            </span>
          </Link>
        </div>
      </header>

      {/* TPMO disclaimer band — only on Medicare variant */}
      {isMedicareFocus && (
        <section
          aria-label="Medicare TPMO disclaimer"
          style={{
            background: '#fffbeb',
            borderBottom: '1px solid #fde68a',
            padding: '0.875rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div className="max-w-3xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#92400e', margin: 0, fontWeight: 600 }}>
              {tpmoDisclaimer}
            </p>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#92400e', margin: 0 }}>
              {tpmoMultiPlan}
            </p>
          </div>
        </section>
      )}

      <main style={{ flex: 1 }}>
        {/* Hero — warm light background, CTA pops */}
        <section
          style={{
            background: 'linear-gradient(180deg, #fafaf9 0%, #ffffff 100%)',
            padding: '3.5rem 1.5rem 3rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle warm decorative glow */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-80px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(13,148,136,0.04) 0%, rgba(253,248,243,0.5) 50%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative' }}>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-sm font-semibold"
              style={{
                background: '#f0fdfa',
                color: '#0d9488',
                border: '1px solid #ccfbf1',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L4 6v6c0 5.52 3.44 10.24 8 12 4.56-1.76 8-6.48 8-12V6l-8-4z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              {c.badge}
            </div>

            {/* Headline */}
            <h1
              className="max-w-lg mx-auto"
              style={{
                fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                color: '#1C1A16',
                marginBottom: '0.875rem',
                fontFamily: 'var(--font-display)',
              }}
            >
              {c.headline}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '1.125rem',
                color: '#57534e',
                marginBottom: '2rem',
                fontWeight: 400,
                lineHeight: 1.5,
              }}
            >
              {c.sub}
            </p>

            {/* CTA — high contrast on white */}
            <Suspense
              fallback={
                <Link
                  href={`/${locale}/screener`}
                  className="btn-primary cta-btn"
                  style={{
                    padding: '1rem 2.5rem',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    boxShadow: '0 4px 14px rgba(13,148,136,0.35)',
                  }}
                >
                  {c.cta}
                </Link>
              }
            >
              <CtaButton locale={locale} label={c.cta} size="xl" />
            </Suspense>

            {/* Trust items — clean icons with labels */}
            <div
              className="grid grid-cols-2 gap-3 mt-10 max-w-md mx-auto"
              style={{ textAlign: 'left' }}
            >
              {c.trustItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5"
                  style={{ padding: '0.25rem 0' }}
                >
                  <TrustIcon type={item.icon} />
                  <span style={{ fontSize: '0.875rem', color: '#44403c', fontWeight: 500 }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof stat — prominent */}
        <section
          style={{
            background: '#f0fdfa',
            borderTop: '1px solid #ccfbf1',
            borderBottom: '1px solid #ccfbf1',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div className="max-w-xl mx-auto">
            <p
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                fontWeight: 800,
                color: '#0d9488',
                lineHeight: 1,
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
              }}
            >
              {c.statNumber}
            </p>
            <p
              style={{
                fontSize: '1rem',
                fontWeight: 500,
                color: '#44403c',
                lineHeight: 1.5,
                maxWidth: '28rem',
                marginInline: 'auto',
              }}
            >
              {c.statText}
            </p>
          </div>
        </section>

        {/* Steps */}
        <section
          style={{
            background: '#ffffff',
            padding: '3.5rem 1.5rem',
          }}
        >
          <div className="max-w-xl mx-auto">
            <h2
              className="text-center mb-8"
              style={{
                fontSize: '1.375rem',
                fontWeight: 700,
                color: '#1C1A16',
                fontFamily: 'var(--font-display)',
              }}
            >
              {c.stepsTitle}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {c.steps.map((step, i) => (
                <div key={step.num} style={{ display: 'flex', gap: '1rem' }}>
                  {/* Step indicator + connecting line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span
                      style={{
                        width: '2.25rem',
                        height: '2.25rem',
                        borderRadius: '50%',
                        background: '#0d9488',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        flexShrink: 0,
                      }}
                    >
                      {step.num}
                    </span>
                    {i < c.steps.length - 1 && (
                      <div
                        style={{
                          width: '2px',
                          flex: 1,
                          background: '#ccfbf1',
                          minHeight: '1.5rem',
                        }}
                      />
                    )}
                  </div>

                  {/* Step content */}
                  <div style={{ paddingBottom: i < c.steps.length - 1 ? '1.75rem' : '0', paddingTop: '0.25rem' }}>
                    <p
                      style={{
                        fontWeight: 700,
                        color: '#1C1A16',
                        marginBottom: '0.25rem',
                        fontSize: '1rem',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {step.title}
                    </p>
                    <p style={{ color: '#78716c', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA — soft background, not dark */}
        <section
          style={{
            background: 'linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)',
            padding: '3rem 1.5rem 3.5rem',
            textAlign: 'center',
            borderTop: '1px solid #ccfbf1',
          }}
        >
          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#1C1A16',
              marginBottom: '1.5rem',
              fontFamily: 'var(--font-display)',
            }}
          >
            {c.bottomPrompt}
          </p>

          <Suspense
            fallback={
              <Link
                href={`/${locale}/screener`}
                className="btn-primary cta-btn"
                style={{
                  padding: '1rem 2.5rem',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(13,148,136,0.35)',
                }}
              >
                {c.ctaBottom}
              </Link>
            }
          >
            <CtaButton locale={locale} label={c.ctaBottom} size="xl" />
          </Suspense>

          <p
            style={{
              color: '#a8a29e',
              fontSize: '0.8rem',
              marginTop: '1.25rem',
            }}
          >
            {c.disclaimer}
          </p>
        </section>
      </main>

      {/* Minimal footer */}
      <footer
        style={{
          background: '#fafaf9',
          borderTop: '1px solid #f0ede8',
          padding: '1.5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-3">
            <Link
              href={`/${locale}/privacy`}
              style={{
                color: '#a8a29e',
                fontSize: '0.8rem',
                textDecoration: 'underline',
              }}
            >
              {c.privacyLabel}
            </Link>
            <span style={{ color: '#d6d3d1', fontSize: '0.8rem' }}>|</span>
            <p style={{ color: '#a8a29e', fontSize: '0.8rem', margin: 0 }}>
              {c.disclaimer}
            </p>
          </div>
          {isMedicareFocus && (
            <p style={{ color: '#a8a29e', fontSize: '0.7rem', lineHeight: 1.5, margin: 0, maxWidth: '40rem', marginInline: 'auto' }}>
              {tpmoDisclaimer}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
