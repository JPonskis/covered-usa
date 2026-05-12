/**
 * AnalyzerCTA — drives users to the medical bill analyzer.
 *
 * Use on procedure cost pages, drug pages, hospital pages, and any
 * page where the user has a bill in hand and wants to check it.
 *
 * Brand: CoveredUSA teal-dark + amber accent. Pairs with the
 * existing bill analyzer page design.
 */

import Link from 'next/link';

interface AnalyzerCTAProps {
  locale: string;
  slug?: string;
  heading?: string;
  body?: string;
  buttonText?: string;
}

export function AnalyzerCTA({ locale, slug, heading, body, buttonText }: AnalyzerCTAProps) {
  const isEs = locale === 'es';
  const utmParams = slug
    ? `?utm_source=programmatic&utm_medium=cta&utm_campaign=${encodeURIComponent(slug)}`
    : '';

  const heading_ = heading ?? (isEs ? 'Le facturaron más que esto?' : 'Got billed more than this?');
  const body_ = body ?? (isEs
    ? 'Cargue su factura del hospital en el Analizador de Facturas Médicas gratuito de CoveredUSA para encontrar errores y sobrecargos en 30 segundos.'
    : 'Upload your hospital bill to the free CoveredUSA Bill Analyzer to find errors and overcharges in 30 seconds.');
  const buttonText_ = buttonText ?? (isEs ? 'Analizar Mi Factura' : 'Analyze My Bill');

  return (
    <div className="bg-[#0f766e] rounded-xl p-8 text-center my-8 border-2 border-[#c2732a]">
      <h3 className="text-xl font-bold text-white mb-2">{heading_}</h3>
      <p className="text-white/90 mb-4">{body_}</p>
      <Link
        href={`/${locale}/medical-bill-analyzer${utmParams}`}
        className="inline-flex items-center px-8 py-3 bg-[#c2732a] text-white font-semibold rounded-lg hover:bg-[#a35f23] transition-colors"
      >
        {buttonText_}
      </Link>
    </div>
  );
}
