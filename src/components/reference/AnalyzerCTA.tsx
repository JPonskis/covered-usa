/**
 * AnalyzerCTA — drives users to the medical bill analyzer.
 *
 * Two variants:
 * - "hub" (default): full-width banner with teal background. Used on data
 *   hub pages where the CTA punctuates between data sections.
 * - "inline": cream-background card with teal border and flex layout
 *   (heading + button side-by-side). Matches the blog article CTA style.
 *   Used on blog-style content pages (procedure cost, drug, glossary).
 */

import Link from 'next/link';

interface AnalyzerCTAProps {
  locale: string;
  slug?: string;
  variant?: 'hub' | 'inline';
  heading?: string;
  body?: string;
  buttonText?: string;
}

export function AnalyzerCTA({
  locale,
  slug,
  variant = 'hub',
  heading,
  body,
  buttonText,
}: AnalyzerCTAProps) {
  const isEs = locale === 'es';
  const utmParams = slug
    ? `?utm_source=programmatic&utm_medium=${variant === 'inline' ? 'mid-cta' : 'cta'}&utm_campaign=${encodeURIComponent(slug)}`
    : '';

  const heading_ = heading ?? (isEs ? '¿Tiene una factura de hospital? Revísela.' : 'Got a hospital bill? Check it for errors.');
  const body_ = body ?? (isEs
    ? 'Nuestro analizador gratuito detecta sobrecargos, errores de facturación y opciones de asistencia en 30 segundos.'
    : 'Our free analyzer flags overcharges, billing errors, and charity care eligibility in 30 seconds.');
  const buttonText_ = buttonText ?? (isEs ? 'Analizar mi factura gratis' : 'Analyze my bill free');

  const href = `/${locale}/medical-bill-analyzer${utmParams}`;

  if (variant === 'inline') {
    return (
      <div
        className="my-10 rounded-2xl border-2 p-6 flex flex-col sm:flex-row items-center gap-5"
        style={{ borderColor: 'var(--teal)', background: 'var(--cream)' }}
      >
        <div className="flex-1 min-w-0">
          <p
            className="font-bold text-lg mb-1"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            {heading_}
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}
          >
            {body_}
          </p>
        </div>
        <Link
          href={href}
          className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all hover:opacity-90"
          style={{ background: 'var(--teal)', color: '#fff', fontFamily: 'var(--font-display), Georgia, serif' }}
        >
          {buttonText_}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    );
  }

  // hub variant (default — punchy full-width banner for data hub pages)
  return (
    <div className="bg-[#0f766e] rounded-xl p-8 text-center my-8">
      <h3 className="text-xl font-bold text-white mb-2">{heading_}</h3>
      <p className="text-white/90 mb-4">{body_}</p>
      <Link
        href={href}
        className="inline-flex items-center px-8 py-3 bg-white text-[#0f766e] font-semibold rounded-lg hover:bg-[#ccfbf1] transition-colors"
      >
        {buttonText_}
      </Link>
    </div>
  );
}
