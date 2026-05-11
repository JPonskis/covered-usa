import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { getFAQSchema, getBreadcrumbSchema } from '@/lib/structured-data';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const BASE_URL = 'https://coveredusa.org';

// FPL 2026: $15,960 base for 1 person, +$5,680 per additional person
const FPL_BASE = 15960;
const FPL_ADDITIONAL = 5680;

function fpl(size: number): number {
  return FPL_BASE + (size - 1) * FPL_ADDITIONAL;
}

function medicaid(size: number): number {
  return Math.round(fpl(size) * 1.38);
}

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

const HOUSEHOLD_SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

// Major states with expansion status and notable notes
const STATES = [
  { name: 'Alabama', expanded: false, note: 'Limited coverage; adults generally not covered' },
  { name: 'Alaska', expanded: true, note: 'Higher FPL limits apply ($20,001 base for 1 person)' },
  { name: 'Arizona', expanded: true, note: 'Standard expansion; 138% FPL' },
  { name: 'California', expanded: true, note: 'CalAIM; covers undocumented adults' },
  { name: 'Colorado', expanded: true, note: 'Standard expansion; 138% FPL' },
  { name: 'Florida', expanded: false, note: 'Limited; primarily children and pregnant women' },
  { name: 'Georgia', expanded: false, note: 'Partial expansion; work requirements apply' },
  { name: 'Illinois', expanded: true, note: 'Standard expansion; 138% FPL' },
  { name: 'Michigan', expanded: true, note: 'Standard expansion; 138% FPL' },
  { name: 'New York', expanded: true, note: 'Standard expansion; 138% FPL' },
  { name: 'North Carolina', expanded: true, note: 'Expanded in 2024; 138% FPL' },
  { name: 'Ohio', expanded: true, note: 'Standard expansion; 138% FPL' },
  { name: 'Pennsylvania', expanded: true, note: 'Standard expansion; 138% FPL' },
  { name: 'Texas', expanded: false, note: 'Very limited; primarily children under 19 and pregnant women' },
  { name: 'Washington', expanded: true, note: 'Standard expansion; 138% FPL' },
];

const FAQS = [
  {
    question: 'What is the Medicaid income limit for 2026?',
    answer: 'In states that expanded Medicaid, the income limit is 138% of the Federal Poverty Level (FPL). For a single person, that is approximately $22,024 per year. For a family of four, it is approximately $45,540 per year.',
  },
  {
    question: 'Do all states have the same Medicaid income limits?',
    answer: 'No. States that expanded Medicaid (40 states plus D.C.) cover adults up to 138% FPL. Non-expansion states like Texas and Florida have much stricter rules and often only cover children, pregnant women, and people with disabilities.',
  },
  {
    question: 'Can I qualify for Medicaid if I have no income?',
    answer: 'Yes. If you have no income you are very likely to qualify for Medicaid in most states, assuming you meet citizenship or residency requirements and are not already on Medicare.',
  },
  {
    question: 'Does Medicaid count gross or net income?',
    answer: 'Medicaid uses Modified Adjusted Gross Income (MAGI), which is based on your federal taxable income. It includes wages, salaries, tips, self-employment income, and some other income types. Certain deductions are allowed.',
  },
  {
    question: 'What if my income is just over the Medicaid limit?',
    answer: 'If your income is slightly above the Medicaid limit, you may qualify for ACA marketplace subsidies. In some states there are also spend-down programs that let you qualify for Medicaid by deducting medical expenses from your income.',
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  return {
    title: isEs
      ? 'Límites de Ingresos de Medicaid 2026 por Estado | CoveredUSA'
      : 'Medicaid Income Limits 2026 by State | CoveredUSA',
    description: isEs
      ? 'Tabla completa de los límites de ingresos de Medicaid para 2026. Vea los límites por tamaño de hogar y estado. Actualizado con las cifras del Nivel Federal de Pobreza 2026.'
      : 'Complete table of Medicaid income limits for 2026. See limits by household size and state. Updated with 2026 Federal Poverty Level figures.',
    alternates: { canonical: `/${locale}/medicaid-income-limits` },
  };
}

export default async function MedicaidIncomeLimitsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEs = locale === 'es';

  const faqSchema = getFAQSchema(FAQS);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Límites de Ingresos Medicaid' : 'Medicaid Income Limits', url: `/${locale}/medicaid-income-limits` },
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
            {isEs ? 'Límites de Ingresos de Medicaid 2026' : 'Medicaid Income Limits 2026'}
          </h1>
          <p className="text-lg max-w-3xl" style={{ color: '#475569' }}>
            {isEs
              ? 'Tablas completas de los límites de ingresos de Medicaid por tamaño de hogar para los 50 estados. Basado en el Nivel Federal de Pobreza (FPL) 2026.'
              : 'Complete Medicaid income limit tables by household size for all 50 states. Based on 2026 Federal Poverty Level (FPL) figures.'}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">

        {/* Income Limits by Household Size */}
        <section>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#0f172a' }}>
            {isEs ? 'Límites de Ingresos por Tamaño de Hogar (2026)' : 'Income Limits by Household Size (2026)'}
          </h2>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            {isEs
              ? 'Válido para los 48 estados contiguos. Alaska y Hawaii tienen límites más altos.'
              : 'Applies to the 48 contiguous states. Alaska and Hawaii have higher limits.'}
          </p>
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #e2e8f0' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#1e3a5f', color: 'white' }}>
                  <th className="text-left px-4 py-3 font-semibold">
                    {isEs ? 'Tamaño del Hogar' : 'Household Size'}
                  </th>
                  <th className="text-right px-4 py-3 font-semibold">
                    {isEs ? '100% FPL (anual)' : '100% FPL (annual)'}
                  </th>
                  <th className="text-right px-4 py-3 font-semibold">
                    {isEs ? '138% FPL — Límite Medicaid' : '138% FPL — Medicaid Limit'}
                  </th>
                  <th className="text-right px-4 py-3 font-semibold">
                    {isEs ? '138% FPL (mensual)' : '138% FPL (monthly)'}
                  </th>
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
                    <td className="px-4 py-3 text-right" style={{ color: '#475569' }}>
                      {fmt(fpl(size))}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: '#1d4ed8' }}>
                      {fmt(medicaid(size))}
                    </td>
                    <td className="px-4 py-3 text-right" style={{ color: '#475569' }}>
                      {fmt(Math.round(medicaid(size) / 12))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs mt-3" style={{ color: '#94a3b8' }}>
            {isEs
              ? 'Las cifras son aproximadas. Los límites exactos pueden variar según el estado. Actualizado para 2026.'
              : 'Figures are approximate. Exact limits may vary by state. Updated for 2026.'}
          </p>
        </section>

        {/* State Expansion Status */}
        <section>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#0f172a' }}>
            {isEs ? 'Estado de Expansión de Medicaid por Estado' : 'Medicaid Expansion Status by State'}
          </h2>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            {isEs
              ? '40 estados más D.C. han expandido Medicaid. En estados no expansivos, los límites son mucho más bajos.'
              : '40 states plus D.C. have expanded Medicaid. In non-expansion states, limits are much stricter.'}
          </p>
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #e2e8f0' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: '#374151' }}>
                    {isEs ? 'Estado' : 'State'}
                  </th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: '#374151' }}>
                    {isEs ? 'Expansión' : 'Expanded'}
                  </th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: '#374151' }}>
                    {isEs ? 'Notas' : 'Notes'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {STATES.map((state, i) => (
                  <tr
                    key={state.name}
                    style={{ background: i % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: '#0f172a' }}>
                      {state.name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: state.expanded ? '#dcfce7' : '#fee2e2',
                          color: state.expanded ? '#166534' : '#991b1b',
                        }}
                      >
                        {state.expanded
                          ? (isEs ? 'Sí' : 'Yes')
                          : (isEs ? 'No' : 'No')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#64748b' }}>
                      {state.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs mt-3" style={{ color: '#94a3b8' }}>
            {isEs
              ? 'Esta tabla muestra estados principales. Para los 50 estados, use nuestro evaluador gratuito.'
              : 'This table shows major states. For all 50 states, use our free screener.'}
          </p>
        </section>

        {/* CTA */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: '#1e3a5f', color: 'white' }}
        >
          <h2 className="text-2xl font-bold mb-3">
            {isEs ? '¿Califica para Medicaid?' : 'Do You Qualify for Medicaid?'}
          </h2>
          <p className="mb-6 max-w-lg mx-auto" style={{ color: '#93c5fd' }}>
            {isEs
              ? 'Verifique en 2 minutos. Gratis, confidencial, disponible en español.'
              : 'Check in 2 minutes. Free, confidential, available in Spanish.'}
          </p>
          <Link
            href={`/${locale}/screener?utm_source=medicaid-income-limits&utm_medium=reference`}
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
            {isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
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
              href={`/${locale}/blog/do-i-qualify-for-medicaid-2026`}
              className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-blue-50"
              style={{ background: 'white', border: '1px solid #e2e8f0', color: '#1d4ed8' }}
            >
              {isEs ? '¿Califico para Medicaid en 2026?' : 'Do I Qualify for Medicaid in 2026?'}
            </Link>
            <Link
              href={`/${locale}/aca-income-limits`}
              className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-blue-50"
              style={{ background: 'white', border: '1px solid #e2e8f0', color: '#1d4ed8' }}
            >
              {isEs ? 'Límites de Ingresos ACA 2026' : 'ACA Income Limits 2026'}
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
