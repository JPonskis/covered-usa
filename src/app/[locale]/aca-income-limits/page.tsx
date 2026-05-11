import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { getFAQSchema, getBreadcrumbSchema } from '@/lib/structured-data';

interface PageProps {
  params: Promise<{ locale: string }>;
}

// FPL 2026 base figures
const FPL_BASE = 15960;
const FPL_ADDITIONAL = 5680;

function fpl(size: number, pct: number): number {
  const base = FPL_BASE + (size - 1) * FPL_ADDITIONAL;
  return Math.round(base * pct / 100);
}

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

const HOUSEHOLD_SIZES = [1, 2, 3, 4, 5, 6];
const FPL_LEVELS = [100, 133, 150, 200, 250, 300, 400];

const SUBSIDY_TIERS = [
  {
    range: '100–133% FPL',
    rangeEs: '100–133% FPL',
    desc: '$0 premium silver plan with Cost Sharing Reductions (CSR)',
    descEs: 'Plan plata con prima de $0 y Reducciones de Costo Compartido (CSR)',
    highlight: true,
  },
  {
    range: '133–150% FPL',
    rangeEs: '133–150% FPL',
    desc: 'Very low premiums — most pay under $20/month for a silver plan',
    descEs: 'Primas muy bajas — la mayoría paga menos de $20/mes por un plan plata',
    highlight: true,
  },
  {
    range: '150–200% FPL',
    rangeEs: '150–200% FPL',
    desc: 'Significant subsidies; silver plan with cost-sharing reductions available',
    descEs: 'Subsidios significativos; plan plata con reducción de costo compartido disponible',
    highlight: false,
  },
  {
    range: '200–300% FPL',
    rangeEs: '200–300% FPL',
    desc: 'Moderate subsidies; premium capped at 8–10% of income',
    descEs: 'Subsidios moderados; prima limitada al 8–10% de los ingresos',
    highlight: false,
  },
  {
    range: '300–400% FPL',
    rangeEs: '300–400% FPL',
    desc: 'Smaller subsidies; premium capped at approximately 10% of income',
    descEs: 'Subsidios menores; prima limitada a aproximadamente el 10% de los ingresos',
    highlight: false,
  },
  {
    range: 'Above 400% FPL',
    rangeEs: 'Por encima del 400% FPL',
    desc: 'May still qualify for subsidies under the American Rescue Plan extensions (check your state)',
    descEs: 'Todavía puede calificar para subsidios bajo las extensiones del Plan de Rescate Americano (verifique su estado)',
    highlight: false,
  },
];

const FAQS = [
  {
    question: 'What are the ACA income limits for 2026?',
    answer: 'For 2026, ACA premium tax credits are available to households earning between 100% and 400% of the Federal Poverty Level (FPL). For a single person, that is between $15,960 and $63,840 per year. For a family of four, that is between $33,000 and $132,000. Enhanced subsidies from the American Rescue Plan may extend help above 400% FPL in some cases.',
  },
  {
    question: 'What is the difference between ACA subsidies and Medicaid?',
    answer: 'ACA subsidies (premium tax credits) help pay for marketplace health insurance plans. Medicaid is a free government insurance program. If your income is below 138% FPL and you live in a Medicaid expansion state, you will be directed to Medicaid instead of the ACA marketplace.',
  },
  {
    question: 'Can I get ACA insurance if I am self-employed?',
    answer: 'Yes. Self-employed individuals can buy ACA marketplace plans and qualify for subsidies based on their net income (after business deductions). Self-employment health insurance premiums may also be tax-deductible.',
  },
  {
    question: 'What is the ACA Open Enrollment period for 2026?',
    answer: 'ACA Open Enrollment runs from November 1 to January 15 each year. After January 15, you can only enroll if you have a qualifying life event such as job loss, marriage, divorce, birth of a child, or moving to a new state.',
  },
  {
    question: 'What counts as income for ACA subsidies?',
    answer: 'ACA uses Modified Adjusted Gross Income (MAGI). This includes wages, salaries, tips, self-employment income, Social Security benefits (if taxable), rental income, and investment income. It does not include Supplemental Security Income (SSI) or child support.',
  },
  {
    question: 'What if I am offered health insurance through my job?',
    answer: 'If your employer offers health insurance that meets ACA minimum value standards and costs less than 9.02% of your household income, you generally do not qualify for ACA marketplace subsidies. If the employer plan is too expensive or inadequate, you may still qualify.',
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  return {
    title: isEs
      ? 'Límites de Ingresos ACA 2026: ¿Quién Califica para Subsidios? | CoveredUSA'
      : 'ACA Income Limits 2026: Who Qualifies for Subsidies? | CoveredUSA',
    description: isEs
      ? 'Tabla completa de los límites de ingresos ACA para 2026. Vea los umbrales de subsidio por tamaño de hogar, cuánto puede ahorrar y cómo inscribirse.'
      : 'Complete ACA income limit table for 2026. See subsidy thresholds by household size, how much you can save, and how to enroll.',
    alternates: { canonical: `/${locale}/aca-income-limits` },
  };
}

export default async function AcaIncomeLimitsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEs = locale === 'es';

  const faqSchema = getFAQSchema(FAQS);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Límites de Ingresos ACA' : 'ACA Income Limits', url: `/${locale}/aca-income-limits` },
  ]);

  return (
    <main className="min-h-screen" style={{ background: '#f8fafc' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="mb-3">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide"
              style={{ background: '#dbeafe', color: '#1d4ed8' }}
            >
              {isEs ? 'Referencia 2026' : '2026 Reference'}
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#0f172a', letterSpacing: '-0.02em' }}
            data-speakable
          >
            {isEs ? 'Límites de Ingresos ACA 2026' : 'ACA Income Limits 2026'}
          </h1>
          <p className="text-lg max-w-3xl" style={{ color: '#475569' }}>
            {isEs
              ? '¿Cuánto puede ganar y aún calificar para subsidios del seguro de salud ACA? Límites de ingresos, tablas de subsidios y períodos de inscripción — todo actualizado para 2026.'
              : 'How much can you earn and still qualify for ACA health insurance subsidies? Income limits, subsidy tables, and enrollment periods — all updated for 2026.'}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">

        {/* Income Limits Table */}
        <section>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#0f172a' }}>
            {isEs ? 'Límites de Ingresos ACA por Tamaño de Hogar (2026)' : 'ACA Income Limits by Household Size (2026)'}
          </h2>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            {isEs
              ? 'Basado en el Nivel Federal de Pobreza (FPL) 2026. Los subsidios se calculan como porcentaje del FPL.'
              : 'Based on 2026 Federal Poverty Level (FPL). Subsidies are calculated as a percentage of FPL.'}
          </p>
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #e2e8f0' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#1e3a5f', color: 'white' }}>
                  <th className="text-left px-4 py-3 font-semibold sticky left-0" style={{ background: '#1e3a5f' }}>
                    {isEs ? 'Hogar' : 'Household'}
                  </th>
                  {FPL_LEVELS.map(pct => (
                    <th key={pct} className="text-right px-3 py-3 font-semibold whitespace-nowrap">
                      {pct}% FPL
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOUSEHOLD_SIZES.map((size, i) => (
                  <tr
                    key={size}
                    style={{ background: i % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: '#0f172a' }}>
                      {size} {isEs ? (size === 1 ? 'persona' : 'personas') : (size === 1 ? 'person' : 'people')}
                    </td>
                    {FPL_LEVELS.map(pct => (
                      <td
                        key={pct}
                        className="px-3 py-3 text-right"
                        style={{
                          color: pct <= 138 ? '#1d4ed8' : pct <= 200 ? '#059669' : '#374151',
                          fontWeight: pct === 138 || pct === 400 ? 600 : 400,
                        }}
                      >
                        {fmt(fpl(size, pct))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs mt-3" style={{ color: '#94a3b8' }}>
            {isEs
              ? 'Azul = rango de Medicaid (138% FPL). Verde = máximo subsidio ACA. Cifras aproximadas para 48 estados contiguos.'
              : 'Blue = Medicaid range (138% FPL). Green = maximum ACA subsidy range. Approximate figures for 48 contiguous states.'}
          </p>
        </section>

        {/* Subsidy Tiers */}
        <section>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#0f172a' }}>
            {isEs ? '¿Qué Subsidios Obtengo Según Mis Ingresos?' : 'What Subsidies Do I Get at Each Income Level?'}
          </h2>
          <div className="space-y-4">
            {SUBSIDY_TIERS.map((tier, i) => (
              <div
                key={i}
                className="rounded-xl p-5 flex items-start gap-4"
                style={{
                  background: tier.highlight ? '#eff6ff' : 'white',
                  border: `1px solid ${tier.highlight ? '#bfdbfe' : '#e2e8f0'}`,
                }}
              >
                <div
                  className="flex-shrink-0 text-sm font-bold px-3 py-1 rounded-lg whitespace-nowrap mt-0.5"
                  style={{
                    background: tier.highlight ? '#1d4ed8' : '#f1f5f9',
                    color: tier.highlight ? 'white' : '#475569',
                  }}
                >
                  {isEs ? tier.rangeEs : tier.range}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  {isEs ? tier.descEs : tier.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: '#1e3a5f', color: 'white' }}
        >
          <h2 className="text-2xl font-bold mb-3">
            {isEs ? '¿Califica para Subsidios ACA?' : 'Do You Qualify for ACA Subsidies?'}
          </h2>
          <p className="mb-6 max-w-lg mx-auto" style={{ color: '#93c5fd' }}>
            {isEs
              ? 'Verifique en 2 minutos. Gratis, sin documentos personales, disponible en español.'
              : 'Check in 2 minutes. Free, no personal documents required, available in Spanish.'}
          </p>
          <Link
            href={`/${locale}/screener?utm_source=aca-income-limits&utm_medium=reference`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:opacity-90"
            style={{ background: '#3b82f6', color: 'white' }}
          >
            {isEs ? 'Verificar Elegibilidad Gratis' : 'Check My Eligibility — Free'}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold mb-8" style={{ color: '#0f172a' }}>
            {isEs ? 'Preguntas Frecuentes sobre el ACA' : 'Frequently Asked Questions About ACA'}
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl p-6"
                style={{ background: 'white', border: '1px solid #e2e8f0' }}
              >
                <h3 className="font-semibold text-lg mb-3" style={{ color: '#0f172a' }}>
                  {faq.question}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#374151' }}>
            {isEs ? 'Recursos Relacionados' : 'Related Resources'}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/blog/aca-health-insurance-eligibility-2026`}
              className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-blue-50"
              style={{ background: 'white', border: '1px solid #e2e8f0', color: '#1d4ed8' }}
            >
              {isEs ? 'Elegibilidad ACA en 2026 (Guía)' : 'ACA Eligibility in 2026 (Guide)'}
            </Link>
            <Link
              href={`/${locale}/medicaid-income-limits`}
              className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-blue-50"
              style={{ background: 'white', border: '1px solid #e2e8f0', color: '#1d4ed8' }}
            >
              {isEs ? 'Límites de Ingresos Medicaid' : 'Medicaid Income Limits'}
            </Link>
            <Link
              href={`/${locale}/medicare-eligibility`}
              className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-blue-50"
              style={{ background: 'white', border: '1px solid #e2e8f0', color: '#1d4ed8' }}
            >
              {isEs ? 'Elegibilidad para Medicare' : 'Medicare Eligibility'}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
