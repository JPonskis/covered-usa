/**
 * ScreenerCTA — drives users to the eligibility screener.
 *
 * Use on hub pages, definitional/glossary pages, comparison pages,
 * trigger-event pages, persona pages, Q&A pages — anything where the
 * user is trying to figure out what they qualify for.
 *
 * Brand: CoveredUSA teal (var(--teal) = #0d9488).
 */

import Link from 'next/link';

interface ScreenerCTAProps {
  locale: string;
  slug?: string;
  heading?: string;
  body?: string;
  buttonText?: string;
}

export function ScreenerCTA({ locale, slug, heading, body, buttonText }: ScreenerCTAProps) {
  const isEs = locale === 'es';
  const utmParams = slug
    ? `?utm_source=programmatic&utm_medium=cta&utm_campaign=${encodeURIComponent(slug)}`
    : '';

  const heading_ = heading ?? (isEs ? 'No está seguro de qué califica?' : 'Not sure what you qualify for?');
  const body_ = body ?? (isEs
    ? 'Nuestro evaluador gratuito revisa Medicaid, Medicare, ACA y CHIP en menos de 2 minutos.'
    : 'Our free screener checks Medicaid, Medicare, ACA, and CHIP in under 2 minutes.');
  const buttonText_ = buttonText ?? (isEs ? 'Verificar Elegibilidad' : 'Check My Eligibility');

  return (
    <div className="bg-[#0d9488] rounded-xl p-8 text-center my-8">
      <h3 className="text-xl font-bold text-white mb-2">{heading_}</h3>
      <p className="text-white/90 mb-4">{body_}</p>
      <Link
        href={`/${locale}/screener${utmParams}`}
        className="inline-flex items-center px-8 py-3 bg-white text-[#0f766e] font-semibold rounded-lg hover:bg-[#ccfbf1] transition-colors"
      >
        {buttonText_}
      </Link>
    </div>
  );
}
