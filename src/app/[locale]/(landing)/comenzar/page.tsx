import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { InlineScreener } from './inline-screener';

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

const content = {
  es: {
    default: {
      trustedBy: 'Un servicio de Benefits USA — con la confianza de más de 30 organizaciones comunitarias',
      badge: 'Verificación gratuita de elegibilidad',
      headline: '¿Calificas para seguro médico gratis?',
      sub: 'Responde unas preguntas rápidas y descubre qué programas están disponibles en tu área.',
      cta: 'Verificar mi elegibilidad',
      trustRow: ['100% gratis', 'Confidencial', 'Sin registro', 'En español'],
      marqueeLine: 'Con la confianza de organizaciones comunitarias en todo el país',
      statNumber: 'Millones',
      statText: 'de estadounidenses califican para cobertura médica gratuita o de bajo costo y no lo saben.',
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
      trustedBy: 'Un servicio de Benefits USA — con la confianza de más de 30 organizaciones comunitarias',
      badge: 'Comparación gratuita de planes Medicare',
      headline: 'Compara planes Medicare en tu área',
      sub: 'Ayuda gratuita de un agente con licencia. Descubre qué plan funciona mejor para ti.',
      cta: 'Comparar planes Medicare',
      trustRow: ['100% gratis', 'Agentes con licencia', 'Confidencial', 'En español'],
      marqueeLine: 'Con la confianza de organizaciones comunitarias en todo el país',
      statNumber: '$0',
      statText: 'Costo de revisar tus opciones de Medicare. Los planes cambian cada año. Asegúrate de que el tuyo aún funcione para ti.',
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
      trustedBy: 'A Benefits USA service — trusted by 30+ community organizations serving 1.5M+ Americans',
      badge: 'Free eligibility check',
      headline: 'Do You Qualify for Free Health Insurance?',
      sub: 'Answer a few quick questions and find out what programs are available in your area.',
      cta: 'Check my eligibility',
      trustRow: ['100% free', 'Confidential', 'No sign-up needed', 'Available in Spanish'],
      marqueeLine: 'Trusted by community organizations across the country',
      statNumber: 'Millions',
      statText: 'of Americans qualify for free or low-cost health coverage and don\'t know it.',
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
      trustedBy: 'A Benefits USA service — trusted by 30+ community organizations serving 1.5M+ Americans',
      badge: 'Free Medicare plan comparison',
      headline: 'Compare Medicare Plans in Your Area',
      sub: 'Free help from a licensed agent. Find out which plan works best for you.',
      cta: 'Compare Medicare plans',
      trustRow: ['100% free', 'Licensed agents', 'Confidential', 'Available in Spanish'],
      marqueeLine: 'Trusted by community organizations across the country',
      statNumber: '$0',
      statText: 'Cost to review your Medicare options. Plans change every year. Make sure yours still works for you.',
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

const logos = [
  { src: '/images/logos/community-food-share.png', alt: 'Community Food Share', w: 190, imgW: 160, imgH: 52 },
  { src: '/images/logos/middle-georgia-cfb.png', alt: 'Middle Georgia Community Food Bank', w: 190, imgW: 160, imgH: 52 },
  { src: '/images/logos/feeding-the-valley.png', alt: 'Feeding the Valley Food Bank', w: 190, imgW: 160, imgH: 52 },
  { src: '/images/logos/second-harvest-coastal-ga.png', alt: 'Second Harvest of Coastal Georgia', w: 200, imgW: 175, imgH: 60 },
  { src: '/images/logos/lamprey-health.png', alt: 'Lamprey Health Care', w: 140, imgW: 100, imgH: 64 },
  { src: '/images/logos/cpwd.jpg', alt: 'Center for People with Disabilities', w: 150, imgW: 110, imgH: 58 },
  { src: '/images/logos/lifesteps.jpg', alt: 'LifeSTEPS', w: 190, imgW: 160, imgH: 52 },
  { src: '/images/logos/wvnpa.jpg', alt: 'West Virginia Nonprofit Association', w: 180, imgW: 150, imgH: 58 },
];

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FDF8F3' }}>

      {/* Top credibility bar */}
      <div
        style={{
          background: '#0f766e',
          padding: '0.5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.775rem', fontWeight: 500, margin: 0, letterSpacing: '0.01em' }}>
          {c.trustedBy}
        </p>
      </div>

      {/* Minimal header */}
      <header style={{ background: '#ffffff', padding: '0.875rem 1.5rem', borderBottom: '1px solid #ede8e3' }}>
        <div className="max-w-2xl mx-auto flex items-center">
          <Link href={`/${locale}`} className="flex items-center gap-2 no-underline hover:opacity-80 transition-opacity">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
              <path d="M12 2L4 6v6c0 5.52 3.44 10.24 8 12 4.56-1.76 8-6.48 8-12V6l-8-4z"
                fill="#0d9488" opacity="0.15" stroke="#0d9488" strokeWidth="1.5" />
              <path d="M9 12l2 2 4-4" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ color: '#1C1A16', fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
              CoveredUSA
            </span>
          </Link>
        </div>
      </header>

      {/* TPMO disclaimer — Medicare only */}
      {isMedicareFocus && (
        <section aria-label="Medicare TPMO disclaimer" style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '0.875rem 1.5rem', textAlign: 'center' }}>
          <div className="max-w-3xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#92400e', margin: 0, fontWeight: 600 }}>{tpmoDisclaimer}</p>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#92400e', margin: 0 }}>{tpmoMultiPlan}</p>
          </div>
        </section>
      )}

      <main style={{ flex: 1 }}>

        {/* Hero — warm cream, not cold white */}
        <section id="top" style={{ background: '#FDF8F3', padding: '3rem 1.5rem 2.5rem', textAlign: 'center' }}>

          {/* Badge — no pulsing dot */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5 text-xs font-semibold uppercase tracking-wide"
            style={{ background: '#e6f4f1', color: '#0f766e', border: '1px solid #b2dfd9', letterSpacing: '0.08em' }}
          >
            {c.badge}
          </div>

          <h1
            className="max-w-lg mx-auto"
            style={{
              fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#1C1A16',
              marginBottom: '1rem',
              fontFamily: 'var(--font-display)',
            }}
          >
            {c.headline}
          </h1>

          <p style={{ fontSize: '1.0625rem', color: '#57534e', marginBottom: '2rem', fontWeight: 400, lineHeight: 1.6, maxWidth: '34rem', marginInline: 'auto' }}>
            {c.sub}
          </p>

          {/* Inline eligibility checker */}
          <Suspense fallback={<div style={{ height: '200px' }} />}>
            <InlineScreener locale={locale} />
          </Suspense>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6">
            {c.trustRow.map((item, i) => (
              <span key={item} className="flex items-center gap-1.5" style={{ fontSize: '0.8rem', color: '#78716c', fontWeight: 500 }}>
                {i > 0 && <span style={{ color: '#d6d3d1', fontSize: '0.7rem' }}>•</span>}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* Partner org marquee */}
        <section style={{ background: '#ffffff', borderTop: '1px solid #ede8e3', borderBottom: '1px solid #ede8e3', paddingTop: '1.75rem', paddingBottom: '1.75rem' }}>
          <p className="text-center text-xs font-semibold uppercase mb-5" style={{ color: '#a8a29e', letterSpacing: '0.12em', fontFamily: 'var(--font-display)' }}>
            {c.marqueeLine}
          </p>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes lpMarquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}} />
          <div style={{
            overflow: 'hidden',
            maskImage: 'linear-gradient(to right, transparent, black 60px, black calc(100% - 60px), transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 60px, black calc(100% - 60px), transparent)',
          }}>
            <div style={{ display: 'flex', gap: '16px', width: 'max-content', animation: 'lpMarquee 28s linear infinite' }}>
              {[...Array(2)].flatMap((_, setIndex) =>
                logos.map((logo) => (
                  <div
                    key={`${setIndex}-${logo.alt}`}
                    className="flex items-center justify-center"
                    style={{
                      minWidth: `${logo.w}px`,
                      height: '72px',
                      padding: '8px 16px',
                      background: '#fafaf9',
                      borderRadius: '8px',
                      border: '1px solid #ede8e3',
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.imgW}
                      height={logo.imgH}
                      style={{ maxWidth: `${logo.imgW}px`, maxHeight: `${logo.imgH}px`, objectFit: 'contain', opacity: 0.75 }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Stat */}
        <section style={{ background: '#FDF8F3', padding: '2.5rem 1.5rem', textAlign: 'center', borderBottom: '1px solid #ede8e3' }}>
          <p style={{ fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 800, color: '#0d9488', lineHeight: 1, marginBottom: '0.5rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            {c.statNumber}
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: '#57534e', lineHeight: 1.5, maxWidth: '26rem', marginInline: 'auto' }}>
            {c.statText}
          </p>
        </section>

        {/* Steps */}
        <section style={{ background: '#ffffff', padding: '3rem 1.5rem' }}>
          <div className="max-w-xl mx-auto">
            <h2 className="text-center mb-8" style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1C1A16', fontFamily: 'var(--font-display)' }}>
              {c.stepsTitle}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {c.steps.map((step, i) => (
                <div key={step.num} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{
                      width: '2.25rem', height: '2.25rem', borderRadius: '50%',
                      background: '#0d9488', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                    }}>
                      {step.num}
                    </span>
                    {i < c.steps.length - 1 && (
                      <div style={{ width: '2px', flex: 1, background: '#ccfbf1', minHeight: '1.5rem' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < c.steps.length - 1 ? '1.75rem' : 0, paddingTop: '0.25rem' }}>
                    <p style={{ fontWeight: 700, color: '#1C1A16', marginBottom: '0.25rem', fontSize: '1rem', fontFamily: 'var(--font-display)' }}>
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

        {/* Bottom CTA — scrolls to top form */}
        <section style={{ background: '#FDF8F3', padding: '3rem 1.5rem 3.5rem', textAlign: 'center', borderTop: '1px solid #ede8e3' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1C1A16', marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>
            {c.bottomPrompt}
          </p>
          <a
            href="#top"
            className="cta-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1.125rem 3rem',
              fontSize: '1.125rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display), -apple-system, sans-serif',
              color: '#ffffff',
              background: '#0d9488',
              borderRadius: '12px',
              border: 'none',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(13,148,136,0.35)',
            }}
          >
            {c.ctaBottom}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </a>
          <p style={{ color: '#a8a29e', fontSize: '0.8rem', marginTop: '1.25rem' }}>{c.disclaimer}</p>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: '#f5f0ea', borderTop: '1px solid #ede8e3', padding: '1.5rem', textAlign: 'center' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
            <Link href={`/${locale}/privacy`} style={{ color: '#a8a29e', fontSize: '0.8rem', textDecoration: 'underline' }}>
              {c.privacyLabel}
            </Link>
            <span style={{ color: '#d6d3d1' }}>|</span>
            <p style={{ color: '#a8a29e', fontSize: '0.8rem', margin: 0 }}>{c.disclaimer}</p>
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
