import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
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

// Content keyed by locale
const content = {
  es: {
    badge: 'Verificación gratuita de elegibilidad',
    headline: '¿Calificas para seguro médico gratis?',
    sub: '2 minutos. 100% gratis. Sin compromiso.',
    cta: 'Verificar Mi Elegibilidad Gratis →',
    trustBadges: ['✓ Gratis', '✓ Confidencial', '✓ Sin registro', '✓ En Español'],
    statHeadline: 'Más de 25 millones de estadounidenses califican para cobertura y no lo saben.',
    stepsTitle: 'Así de fácil',
    steps: [
      {
        num: '1',
        title: 'Responde 10 preguntas rápidas',
        desc: 'Cuéntanos sobre tu hogar, ingresos y estado. Tarda menos de 2 minutos.',
      },
      {
        num: '2',
        title: 'Ve para qué programas calificas',
        desc: 'Revisamos Medicaid, ACA, Medicare, CHIP y más — al instante.',
      },
      {
        num: '3',
        title: 'Recibe ayuda para inscribirte gratis',
        desc: 'Te conectamos con un agente en tu idioma. Sin costo, sin presión.',
      },
    ],
    ctaBottom: 'Verificar Mi Elegibilidad Gratis →',
    disclaimer: 'CoveredUSA no es una agencia del gobierno. Servicio gratuito.',
    privacyLabel: 'Privacidad',
  },
  en: {
    badge: 'Free Eligibility Check',
    headline: 'Do You Qualify for Free Health Insurance?',
    sub: '2 minutes. 100% free. No commitment.',
    cta: 'Check My Eligibility Free →',
    trustBadges: ['✓ Free', '✓ Confidential', '✓ No sign-up', '✓ In Spanish'],
    statHeadline:
      'More than 25 million Americans qualify for health coverage and don\'t know it.',
    stepsTitle: 'Three steps, two minutes',
    steps: [
      {
        num: '1',
        title: 'Answer 10 quick questions',
        desc: 'Tell us about your household, income, and state. Under 2 minutes.',
      },
      {
        num: '2',
        title: 'See which programs you qualify for',
        desc: 'We check Medicaid, ACA, Medicare, CHIP and more — instantly.',
      },
      {
        num: '3',
        title: 'Get free help enrolling',
        desc: 'We connect you with a licensed agent who speaks your language. No cost, no pressure.',
      },
    ],
    ctaBottom: 'Check My Eligibility Free →',
    disclaimer: 'CoveredUSA is not a government agency. Free service.',
    privacyLabel: 'Privacy',
  },
};

export default async function ComenzarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const c = content[locale as keyof typeof content] ?? content.en;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--warm-white)',
      }}
    >
      {/* Minimal header — logo only, no nav */}
      <header
        style={{
          background: 'var(--primary-dark)',
          padding: '1rem 1.5rem',
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
                fill="white"
                opacity="0.2"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                color: 'white',
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

      {/* Hero */}
      <main style={{ flex: 1 }}>
        <section
          style={{
            background: 'linear-gradient(180deg, var(--primary-dark) 0%, var(--primary) 60%, var(--cream) 100%)',
            padding: '4rem 1.5rem 5rem',
            textAlign: 'center',
          }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--teal-light)' }}
            />
            {c.badge}
          </div>

          <h1
            className="max-w-xl mx-auto"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: 'white',
              marginBottom: '1rem',
              fontFamily: 'var(--font-display)',
            }}
          >
            {c.headline}
          </h1>

          <p
            style={{
              fontSize: '1.25rem',
              color: 'rgba(255,255,255,0.85)',
              marginBottom: '2.5rem',
              fontWeight: 500,
            }}
          >
            {c.sub}
          </p>

          {/* Big CTA */}
          <Suspense
            fallback={
              <Link
                href={`/${locale}/screener`}
                className="btn-primary"
                style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', fontWeight: 700 }}
              >
                {c.cta}
              </Link>
            }
          >
            <CtaButton locale={locale} label={c.cta} size="xl" />
          </Suspense>

          {/* Trust strip */}
          <div
            className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-8"
          >
            {c.trustBadges.map((badge) => (
              <span
                key={badge}
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.1)',
                  padding: '0.35rem 0.875rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </section>

        {/* Social proof stat */}
        <section
          style={{
            background: 'var(--cream)',
            borderTop: '1px solid var(--border-light)',
            borderBottom: '1px solid var(--border-light)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <p
            className="max-w-xl mx-auto"
            style={{
              fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)',
              fontWeight: 700,
              color: 'var(--primary-dark)',
              lineHeight: 1.4,
            }}
          >
            {c.statHeadline}
          </p>
        </section>

        {/* 3-step process */}
        <section
          style={{
            background: 'white',
            padding: '4rem 1.5rem',
          }}
        >
          <div className="max-w-2xl mx-auto">
            <h2
              className="text-center mb-10"
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
              }}
            >
              {c.stepsTitle}
            </h2>

            <div className="space-y-6">
              {c.steps.map((step) => (
                <div
                  key={step.num}
                  className="flex items-start gap-4"
                  style={{
                    background: 'var(--cream)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                  }}
                >
                  <span
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-base"
                    style={{ background: 'var(--primary)', color: 'white' }}
                  >
                    {step.num}
                  </span>
                  <div>
                    <p
                      style={{
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {step.title}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA section */}
        <section
          style={{
            background: 'var(--primary-dark)',
            padding: '4rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <Suspense
            fallback={
              <Link
                href={`/${locale}/screener`}
                className="btn-primary"
                style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', fontWeight: 700 }}
              >
                {c.ctaBottom}
              </Link>
            }
          >
            <CtaButton locale={locale} label={c.ctaBottom} size="xl" />
          </Suspense>

          <p
            style={{
              color: 'rgba(255,255,255,0.4)',
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
          background: 'var(--text-primary)',
          padding: '1.25rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href={`/${locale}/privacy`}
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.8rem',
              textDecoration: 'underline',
            }}
          >
            {c.privacyLabel}
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>|</span>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', margin: 0 }}>
            {c.disclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
}
