import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { getFAQSchema, getBreadcrumbSchema, buildSchemaGraph } from '@/lib/structured-data';
import { acaPtcIncomeRange, ACA_APPLICABLE_PERCENTAGES } from '@/lib/eligibility/programs/aca';
import { getFPLForYear } from '@/lib/eligibility/fpl';

interface PageProps {
  params: Promise<{ locale: string }>;
}

/* Every number on this page is read from the screener's own ACA engine (aca.ts) for the
   coverage year on sale, so the page and the screener cannot disagree (audit A20, W8-13 and
   W9_critic_W8). The credit for a coverage year is measured against the poverty guidelines in
   effect when its open enrollment began (26 USC 36B(d)(3)(B)): 2026 coverage uses the 2025
   guidelines, and from Nov 1, 2026 the page switches to 2027 coverage on the 2026 guidelines.
   This page used to print the 2026 guidelines under a "2026" label, which are 2027-coverage
   numbers, and promised "$0 premium" plans and American Rescue Plan help above 400% FPL that
   ended after 2025. */
const FPL_LEVELS = [100, 133, 150, 200, 250, 300, 400];
const HOUSEHOLD_SIZES = [1, 2, 3, 4, 5, 6];

/** The coverage year flips at aca.ts ACA_2027_COVERAGE_EFFECTIVE (Nov 1). Today this route
 *  renders per request (production sends no-store), so the flip needs no deploy; this keeps it
 *  true, at most an hour late, if the route is ever made static. */
export const revalidate = 3600;

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

function share(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/** The figures this page prints, for the coverage year in effect at `now`. */
function acaPageFigures(now: Date) {
  const one = acaPtcIncomeRange(1, now);
  const four = acaPtcIncomeRange(4, now);
  const year = one.coverageYear;
  const guidelineYear = one.guidelineYear;
  const t = ACA_APPLICABLE_PERCENTAGES[year];
  /* What one person at exactly 100% FPL pays for the benchmark silver plan, a month. */
  const floorMonthly = Math.round((one.min * t.upTo133) / 12);
  const fpl = (size: number, level: number) => getFPLForYear(guidelineYear, size, level);
  return { year, guidelineYear, one, four, t, floorMonthly, fpl };
}

type AcaFigures = ReturnType<typeof acaPageFigures>;

function subsidyTiers({ year, t, floorMonthly }: AcaFigures) {
  return [
    {
      range: '100–133% FPL',
      rangeEs: '100–133% FPL',
      desc: `The benchmark silver plan costs you at most ${share(t.upTo133)} of your income, about ${fmt(floorMonthly)} a month for one person at 100% FPL. Cost Sharing Reductions (CSR) lower your deductible and copays.`,
      descEs: `El plan plata de referencia le cuesta como máximo el ${share(t.upTo133)} de sus ingresos, unos ${fmt(floorMonthly)} al mes para una persona al 100% del FPL. Las Reducciones de Costo Compartido (CSR) bajan su deducible y copagos.`,
      highlight: true,
    },
    {
      range: '133–150% FPL',
      rangeEs: '133–150% FPL',
      desc: `The benchmark silver plan costs you ${share(t.at133)} to ${share(t.at150)} of your income, with Cost Sharing Reductions.`,
      descEs: `El plan plata de referencia le cuesta del ${share(t.at133)} al ${share(t.at150)} de sus ingresos, con Reducciones de Costo Compartido.`,
      highlight: true,
    },
    {
      range: '150–200% FPL',
      rangeEs: '150–200% FPL',
      desc: `The benchmark silver plan costs you ${share(t.at150)} to ${share(t.at200)} of your income. Silver plans with Cost Sharing Reductions are still available.`,
      descEs: `El plan plata de referencia le cuesta del ${share(t.at150)} al ${share(t.at200)} de sus ingresos. Todavía hay planes plata con Reducciones de Costo Compartido.`,
      highlight: false,
    },
    {
      range: '200–250% FPL',
      rangeEs: '200–250% FPL',
      desc: `The benchmark silver plan costs you ${share(t.at200)} to ${share(t.at250)} of your income. Cost Sharing Reductions on silver plans stop at 250% FPL.`,
      descEs: `El plan plata de referencia le cuesta del ${share(t.at200)} al ${share(t.at250)} de sus ingresos. Las Reducciones de Costo Compartido en planes plata terminan en el 250% del FPL.`,
      highlight: false,
    },
    {
      range: '250–300% FPL',
      rangeEs: '250–300% FPL',
      desc: `The benchmark silver plan costs you ${share(t.at250)} to ${share(t.at300)} of your income.`,
      descEs: `El plan plata de referencia le cuesta del ${share(t.at250)} al ${share(t.at300)} de sus ingresos.`,
      highlight: false,
    },
    {
      range: '300–400% FPL',
      rangeEs: '300–400% FPL',
      desc: `The benchmark silver plan costs you ${share(t.at300)} of your income.`,
      descEs: `El plan plata de referencia le cuesta el ${share(t.at300)} de sus ingresos.`,
      highlight: false,
    },
    {
      range: 'Above 400% FPL',
      rangeEs: 'Por encima del 400% FPL',
      desc: `No premium tax credit for ${year} coverage. The extra help above 400% FPL ended after 2025, so you pay the full price of a marketplace plan.`,
      descEs: `No hay crédito fiscal de prima para la cobertura de ${year}. La ayuda adicional por encima del 400% del FPL terminó después de 2025, así que paga el precio completo de un plan del mercado.`,
      highlight: false,
    },
  ];
}

function acaFaqs({ year, guidelineYear, one, four }: AcaFigures) {
  return [
    {
      question: `What are the ACA income limits for ${year}?`,
      answer: `For ${year} coverage, ACA premium tax credits are available to households earning between 100% and 400% of the Federal Poverty Level (FPL), measured against the ${guidelineYear} poverty guidelines. For a single person in the 48 contiguous states and D.C., that is between ${fmt(one.min)} and ${fmt(one.max)} per year. For a family of four, that is between ${fmt(four.min)} and ${fmt(four.max)}. There is no premium tax credit above 400% FPL: the extra help that reached higher incomes ended after 2025.`,
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
      /* 26 USC 36B(d)(2)(B)(iii): MAGI adds back the Social Security that is NOT taxed, so all
         of it counts. This used to say "Social Security benefits (if taxable)". */
      question: 'What counts as income for ACA subsidies?',
      answer: 'ACA uses Modified Adjusted Gross Income (MAGI). This includes wages, salaries, tips, self-employment income, all of your Social Security benefits (including the part that is not taxed), rental income, and investment income. It does not include Supplemental Security Income (SSI) or child support.',
    },
    {
      question: 'What if I am offered health insurance through my job?',
      answer: 'If your employer offers health insurance that meets ACA minimum value standards and costs less than 9.96% of your household income for plan years starting in 2026 (10.22% for plan years starting in 2027), you generally do not qualify for ACA marketplace subsidies. If the employer plan is too expensive or inadequate, you may still qualify.',
    },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  const { year } = acaPageFigures(new Date());
  return {
    title: isEs
      ? `Límites de Ingresos ACA ${year}: ¿Quién Califica para Subsidios? | CoveredUSA`
      : `ACA Income Limits ${year}: Who Qualifies for Subsidies? | CoveredUSA`,
    description: isEs
      ? `Tabla completa de los límites de ingresos ACA para ${year}. Vea los umbrales de subsidio por tamaño de hogar, cuánto puede ahorrar y cómo inscribirse.`
      : `Complete ACA income limit table for ${year}. See subsidy thresholds by household size, how much you can save, and how to enroll.`,
    alternates: { canonical: `/${locale}/aca-income-limits` },
  };
}

export default async function AcaIncomeLimitsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEs = locale === 'es';

  const figures = acaPageFigures(new Date());
  const { year, guidelineYear, fpl } = figures;
  const SUBSIDY_TIERS = subsidyTiers(figures);
  const FAQS = acaFaqs(figures);
  const faqSchema = getFAQSchema(FAQS);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Límites de Ingresos ACA' : 'ACA Income Limits', url: `/${locale}/aca-income-limits` },
  ]);

  const pageGraph = buildSchemaGraph(
    [breadcrumbSchema, faqSchema],
    `/${locale}/aca-income-limits`,
  );

  return (
    <main className="min-h-screen" style={{ background: '#f8fafc' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageGraph) }} />

      {/* Hero */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="mb-3">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide"
              style={{ background: '#dbeafe', color: '#1d4ed8' }}
            >
              {isEs ? `Referencia ${year}` : `${year} Reference`}
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#0f172a', letterSpacing: '-0.02em' }}
            data-speakable
          >
            {isEs ? `Límites de Ingresos ACA ${year}` : `ACA Income Limits ${year}`}
          </h1>
          <p className="text-lg max-w-3xl" style={{ color: '#475569' }}>
            {isEs
              ? `¿Cuánto puede ganar y aún calificar para subsidios del seguro de salud ACA? Límites de ingresos, tablas de subsidios y períodos de inscripción, todo actualizado para la cobertura de ${year}.`
              : `How much can you earn and still qualify for ACA health insurance subsidies? Income limits, subsidy tables, and enrollment periods, all updated for ${year} coverage.`}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">

        {/* Income Limits Table */}
        <section>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#0f172a' }}>
            {isEs ? `Límites de Ingresos ACA por Tamaño de Hogar (cobertura de ${year})` : `ACA Income Limits by Household Size (${year} coverage)`}
          </h2>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            {isEs
              ? `Basado en las guías federales de pobreza (FPL) de ${guidelineYear}, que fijan los créditos fiscales de prima para la cobertura de ${year}. Los subsidios se calculan como porcentaje del FPL.`
              : `Based on the ${guidelineYear} Federal Poverty Level (FPL) guidelines, which set premium tax credits for ${year} coverage. Subsidies are calculated as a percentage of FPL.`}
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
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#0f172a' }}>
            {isEs ? '¿Qué Subsidios Obtengo Según Mis Ingresos?' : 'What Subsidies Do I Get at Each Income Level?'}
          </h2>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            {isEs
              ? `Lo máximo que paga por el plan plata de referencia en la cobertura de ${year}, como porcentaje de los ingresos de su hogar.`
              : `The most you pay for the benchmark silver plan for ${year} coverage, as a share of your household income.`}
          </p>
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
