import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import {
  getFAQSchema,
  getBreadcrumbSchema,
  getMedicalWebPageSchema,
} from '@/lib/structured-data';
import {
  ReferenceTable,
  FAQSection,
  LastUpdated,
  DatasetSchema,
  ScreenerCTA,
  QuickAnswer,
  type ReferenceTableCell,
} from '@/components/reference';

interface PageProps {
  params: Promise<{ locale: string }>;
}

// 2026 Federal Poverty Level — official HHS ASPE guidelines (published Jan 2026)
// 48 contiguous states + DC
const FPL_BASE = 15960;
const FPL_INCREMENT = 5680;
const ALASKA_MULTIPLIER = 1.25;
const HAWAII_MULTIPLIER = 1.15;
const LAST_UPDATED = '2026-05-12';

function fpl(size: number, pct: number = 100, state?: 'AK' | 'HI'): number {
  let base = FPL_BASE + (Math.max(0, size - 1) * FPL_INCREMENT);
  if (state === 'AK') base = Math.round(base * ALASKA_MULTIPLIER);
  if (state === 'HI') base = Math.round(base * HAWAII_MULTIPLIER);
  return Math.round(base * (pct / 100));
}

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

function fmtMonthly(annual: number): string {
  return fmt(Math.round(annual / 12));
}

const HOUSEHOLD_SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

// Healthcare-only FPL percentages — drop SNAP/WIC/LIHEAP (BenefitsUSA territory)
const HEALTHCARE_PCTS = [100, 138, 150, 200, 250, 400];

function buildFplRows(state?: 'AK' | 'HI'): ReferenceTableCell[][] {
  const rows: ReferenceTableCell[][] = HOUSEHOLD_SIZES.map((size) => [
    String(size),
    ...HEALTHCARE_PCTS.map((pct) => fmt(fpl(size, pct, state))),
  ]);
  // Add "each additional person" row
  const inc100 = FPL_INCREMENT * (state === 'AK' ? ALASKA_MULTIPLIER : state === 'HI' ? HAWAII_MULTIPLIER : 1);
  rows.push([
    'Each additional',
    ...HEALTHCARE_PCTS.map((pct) => fmt(Math.round(inc100 * (pct / 100)))),
  ]);
  return rows;
}

function buildFplRowsEs(state?: 'AK' | 'HI'): ReferenceTableCell[][] {
  const rows: ReferenceTableCell[][] = HOUSEHOLD_SIZES.map((size) => [
    String(size),
    ...HEALTHCARE_PCTS.map((pct) => fmt(fpl(size, pct, state))),
  ]);
  const inc100 = FPL_INCREMENT * (state === 'AK' ? ALASKA_MULTIPLIER : state === 'HI' ? HAWAII_MULTIPLIER : 1);
  rows.push([
    'Cada persona adicional',
    ...HEALTHCARE_PCTS.map((pct) => fmt(Math.round(inc100 * (pct / 100)))),
  ]);
  return rows;
}

function buildMonthlyRows(): ReferenceTableCell[][] {
  return HOUSEHOLD_SIZES.map((size) => [
    String(size),
    fmtMonthly(fpl(size, 100)),
    fmtMonthly(fpl(size, 138)),
    fmtMonthly(fpl(size, 200)),
    fmtMonthly(fpl(size, 400)),
  ]);
}

const FAQS_EN = [
  {
    question: 'What is the 2026 Federal Poverty Level for a family of 4?',
    answer: 'The 2026 FPL for a family of 4 is $33,000 per year in the 48 contiguous states and D.C. In Alaska it is $41,250, and in Hawaii it is $37,950. These figures are published annually by the U.S. Department of Health and Human Services (HHS).',
  },
  {
    question: 'When are the 2026 FPL guidelines released?',
    answer: 'The 2026 Federal Poverty Level guidelines were released in January 2026 by HHS through the Office of the Assistant Secretary for Planning and Evaluation (ASPE). They take effect for healthcare program eligibility determinations shortly after publication in the Federal Register.',
  },
  {
    question: 'Why are Alaska and Hawaii FPL amounts higher?',
    answer: 'Alaska and Hawaii have higher costs of living than the 48 contiguous states. To account for this, the federal government sets separate guidelines: Alaska FPL is 25% higher, and Hawaii FPL is 15% higher than the contiguous states.',
  },
  {
    question: 'What does "138% FPL" mean for Medicaid?',
    answer: 'In states that expanded Medicaid under the Affordable Care Act, adults with household income up to 138% of the Federal Poverty Level qualify for Medicaid coverage. For a single person in 2026, that is approximately $22,024 per year. For a family of 4, it is approximately $45,540.',
  },
  {
    question: 'How is FPL used for ACA marketplace subsidies?',
    answer: 'The ACA uses FPL to determine eligibility for premium tax credits and cost-sharing reductions. Households earning up to 400% FPL ($60,240 single / $132,000 family of 4 in 2026) may qualify for premium subsidies. Households under 250% FPL also qualify for enhanced cost-sharing reductions on Silver plans.',
  },
  {
    question: 'Does FPL change every year?',
    answer: 'Yes. HHS updates the FPL annually, typically in January, to account for inflation. The dollar amounts rise each year, but the percentage thresholds programs use (100%, 138%, 200%, etc.) stay the same.',
  },
  {
    question: 'How is MAGI different from FPL?',
    answer: 'FPL is the income threshold. MAGI (Modified Adjusted Gross Income) is the way income is calculated — it includes wages, tips, self-employment income, and some other types, with certain deductions allowed. Most ACA and Medicaid eligibility uses MAGI compared against the appropriate FPL percentage.',
  },
  {
    question: 'What healthcare programs use the Federal Poverty Level?',
    answer: 'In 2026, healthcare programs using FPL include: Medicaid (138% in expansion states), CHIP (typically 200-300%), ACA marketplace premium tax credits (up to 400%), ACA cost-sharing reductions (up to 250%), Medicare Savings Programs (QMB at 100%, SLMB at 120%, QI at 135%), and various state-specific assistance programs.',
  },
];

const FAQS_ES = [
  {
    question: '¿Cuál es el Nivel Federal de Pobreza 2026 para una familia de 4?',
    answer: 'El FPL 2026 para una familia de 4 es $33,000 al año en los 48 estados contiguos y D.C. En Alaska es $41,250 y en Hawái es $37,950. Estas cifras son publicadas anualmente por el Departamento de Salud y Servicios Humanos de EE.UU. (HHS).',
  },
  {
    question: '¿Cuándo se publican las guías del FPL 2026?',
    answer: 'Las guías del Nivel Federal de Pobreza 2026 fueron publicadas en enero de 2026 por HHS a través de la Oficina del Subsecretario de Planificación y Evaluación (ASPE).',
  },
  {
    question: '¿Por qué los montos del FPL son más altos en Alaska y Hawái?',
    answer: 'Alaska y Hawái tienen un costo de vida más alto que los 48 estados contiguos. Para compensar esto, el gobierno federal establece guías separadas: el FPL de Alaska es 25% más alto, y el de Hawái es 15% más alto que los estados contiguos.',
  },
  {
    question: '¿Qué significa "138% FPL" para Medicaid?',
    answer: 'En los estados que expandieron Medicaid bajo la Ley de Cuidado de Salud Asequible, los adultos con ingresos familiares de hasta el 138% del Nivel Federal de Pobreza califican para cobertura de Medicaid. Para una persona sola en 2026, esto es aproximadamente $22,024 al año.',
  },
  {
    question: '¿Cómo se usa el FPL para los subsidios del mercado del ACA?',
    answer: 'El ACA usa el FPL para determinar la elegibilidad para créditos fiscales de prima y reducciones de costos compartidos. Los hogares con ingresos de hasta el 400% del FPL ($60,240 individual / $132,000 familia de 4 en 2026) pueden calificar para subsidios.',
  },
  {
    question: '¿Cambia el FPL cada año?',
    answer: 'Sí. HHS actualiza el FPL anualmente, generalmente en enero, para considerar la inflación.',
  },
  {
    question: '¿Cómo se diferencia MAGI del FPL?',
    answer: 'FPL es el umbral de ingresos. MAGI (Ingreso Bruto Ajustado Modificado) es la forma en que se calcula el ingreso — incluye salarios, propinas, ingresos por cuenta propia y algunos otros tipos, con ciertas deducciones permitidas.',
  },
  {
    question: '¿Qué programas de salud usan el Nivel Federal de Pobreza?',
    answer: 'En 2026, los programas de salud que usan el FPL incluyen: Medicaid (138% en estados con expansión), CHIP (típicamente 200-300%), créditos fiscales del mercado del ACA (hasta 400%), reducciones de costos compartidos del ACA (hasta 250%), y los Programas de Ahorros de Medicare (QMB 100%, SLMB 120%, QI 135%).',
  },
];

const PROGRAMS_EN: ReferenceTableCell[][] = [
  ['100% FPL', 'Medicare Savings — QMB (Qualified Medicare Beneficiary)'],
  ['120% FPL', 'Medicare Savings — SLMB (Specified Low-Income Medicare Beneficiary)'],
  ['135% FPL', 'Medicare Savings — QI (Qualifying Individual)'],
  ['138% FPL', 'Medicaid expansion (adults in 41 states + D.C.)'],
  ['200% FPL', 'CHIP (Children\'s Health Insurance Program) in most states; ACA enhanced cost-sharing reductions'],
  ['250% FPL', 'ACA Silver-plan cost-sharing reductions ceiling'],
  ['300% FPL', 'CHIP upper limit in some states'],
  ['400% FPL', 'ACA premium tax credit ceiling (subsidies for marketplace plans)'],
];

const PROGRAMS_ES: ReferenceTableCell[][] = [
  ['100% FPL', 'Ahorros de Medicare — QMB (Beneficiario Calificado de Medicare)'],
  ['120% FPL', 'Ahorros de Medicare — SLMB (Beneficiario de Medicare con Ingresos Especificados Bajos)'],
  ['135% FPL', 'Ahorros de Medicare — QI (Individuo Calificado)'],
  ['138% FPL', 'Expansión de Medicaid (adultos en 41 estados + D.C.)'],
  ['200% FPL', 'CHIP (Programa de Seguro Médico para Niños) en la mayoría de los estados; reducciones mejoradas de costos compartidos del ACA'],
  ['250% FPL', 'Techo de reducciones de costos compartidos del ACA en planes Silver'],
  ['300% FPL', 'Límite superior de CHIP en algunos estados'],
  ['400% FPL', 'Techo de créditos fiscales de prima del ACA (subsidios para planes del mercado)'],
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  return {
    title: isEs
      ? 'Tabla del Nivel Federal de Pobreza (FPL) 2026 | CoveredUSA'
      : '2026 Federal Poverty Level (FPL) Chart | CoveredUSA',
    description: isEs
      ? 'Tabla completa del Nivel Federal de Pobreza 2026 para los 50 estados. Vea umbrales del 100% al 400% FPL para Medicaid, Medicare Savings Programs, CHIP y subsidios del ACA.'
      : 'Complete 2026 Federal Poverty Level chart for all 50 states. See income thresholds from 100% to 400% FPL for Medicaid, Medicare Savings Programs, CHIP, and ACA subsidies.',
    alternates: {
      canonical: `https://coveredusa.org/${locale}/federal-poverty-level`,
      languages: {
        en: 'https://coveredusa.org/en/federal-poverty-level',
        es: 'https://coveredusa.org/es/federal-poverty-level',
      },
    },
  };
}

export default async function FederalPovertyLevelPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEs = locale === 'es';
  const faqs = isEs ? FAQS_ES : FAQS_EN;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Nivel Federal de Pobreza 2026' : '2026 Federal Poverty Level', url: `/${locale}/federal-poverty-level` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/federal-poverty-level`,
    name: isEs ? 'Tabla del Nivel Federal de Pobreza (FPL) 2026' : '2026 Federal Poverty Level (FPL) Chart',
    description: isEs
      ? 'Tabla completa del Nivel Federal de Pobreza 2026 con umbrales por tamaño de hogar para los 50 estados.'
      : 'Complete 2026 Federal Poverty Level chart with income thresholds by household size for all 50 states.',
    lastReviewed: LAST_UPDATED,
    about: 'Federal Poverty Level',
    audience: 'PublicHealth',
    medicalSpecialty: 'PublicHealth',
  });

  const fplHeaders = isEs
    ? ['Tamaño del hogar', '100%', '138%', '150%', '200%', '250%', '400%']
    : ['Household Size', '100%', '138%', '150%', '200%', '250%', '400%'];

  const monthlyHeaders = isEs
    ? ['Tamaño del hogar', '100% (mensual)', '138% (mensual)', '200% (mensual)', '400% (mensual)']
    : ['Household Size', '100% (monthly)', '138% (monthly)', '200% (monthly)', '400% (monthly)'];

  const programsHeaders = isEs
    ? ['Porcentaje del FPL', 'Programa de salud que usa este umbral']
    : ['FPL Percentage', 'Healthcare Program Using This Threshold'];

  const contiguousRows = isEs ? buildFplRowsEs() : buildFplRows();
  const alaskaRows = isEs ? buildFplRowsEs('AK') : buildFplRows('AK');
  const hawaiiRows = isEs ? buildFplRowsEs('HI') : buildFplRows('HI');
  const monthlyRows = buildMonthlyRows();
  const programs = isEs ? PROGRAMS_ES : PROGRAMS_EN;

  const single100 = fpl(1);
  const family4_100 = fpl(4);

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPageSchema) }} />
      <DatasetSchema
        name={isEs ? 'Guías del Nivel Federal de Pobreza 2026' : '2026 Federal Poverty Level Guidelines'}
        description={isEs
          ? 'Umbrales de ingresos del FPL 2026 por tamaño de hogar para los 50 estados, incluyendo ajustes para Alaska y Hawái, con porcentajes relevantes para programas de salud.'
          : '2026 Federal Poverty Level income thresholds by household size for all 50 US states, including Alaska and Hawaii adjustments, with healthcare-program-relevant percentages.'}
        url={`https://coveredusa.org/${locale}/federal-poverty-level`}
        dateModified={LAST_UPDATED}
        source="HHS ASPE 2026 Poverty Guidelines"
        keywords={isEs
          ? ['nivel federal de pobreza', 'FPL 2026', 'guías de pobreza', 'límites de ingresos', '138% FPL', 'medicaid', 'medicare savings', 'subsidios ACA']
          : ['federal poverty level', 'FPL 2026', 'poverty guidelines', 'income limits', '138% FPL', 'medicaid', 'medicare savings', 'ACA subsidies', 'CHIP']}
      />

      {/* Hero */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="mb-3">
            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide bg-[#ccfbf1] text-[#0f766e]">
              {isEs ? 'Referencia 2026' : '2026 Reference'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-3" data-speakable>
            {isEs ? 'Tabla del Nivel Federal de Pobreza (FPL) 2026' : '2026 Federal Poverty Level (FPL) Chart'}
          </h1>
          <p className="text-lg text-[#475569] max-w-3xl mb-4">
            {isEs
              ? `El FPL 2026 para una persona sola es ${fmt(single100)} al año (${fmtMonthly(single100)}/mes). Para una familia de 4, es ${fmt(family4_100)} al año. Estos umbrales determinan la elegibilidad para Medicaid, Medicare Savings Programs, CHIP y subsidios del ACA.`
              : `The 2026 FPL for a single person is ${fmt(single100)} per year (${fmtMonthly(single100)}/month). For a family of 4, it is ${fmt(family4_100)} per year. These thresholds determine eligibility for Medicaid, Medicare Savings Programs, CHIP, and ACA subsidies.`}
          </p>
          <LastUpdated
            date={isEs ? '12 de mayo de 2026' : 'May 12, 2026'}
            source="HHS ASPE 2026 Poverty Guidelines"
          />
          <div className="max-w-3xl mt-2">
            <QuickAnswer
              locale={locale}
              text={isEs
                ? `A partir de 2026, el Nivel Federal de Pobreza para una persona sola es $15,960 en los 48 estados contiguos, $19,950 en Alaska y $18,360 en Hawái. Para una familia de 4, el FPL es $33,000. La cobertura de Medicaid en estados con expansión llega al 138% FPL ($22,024 individual / $45,540 familia de 4). Los subsidios del ACA están disponibles hasta el 400% FPL ($60,240 individual / $132,000 familia de 4).`
                : `As of 2026, the Federal Poverty Level for a single person is $15,960 in the 48 contiguous states, $19,950 in Alaska, and $18,360 in Hawaii. For a family of 4, FPL is $33,000. Medicaid expansion coverage extends to 138% FPL ($22,024 single / $45,540 family of 4). ACA subsidies are available up to 400% FPL ($60,240 single / $132,000 family of 4).`}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        {/* 48 Contiguous States */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-[#0f172a]">
            {isEs ? '2026 FPL para los 48 estados contiguos + D.C.' : '2026 FPL for 48 Contiguous States + D.C.'}
          </h2>
          <p className="text-sm mb-6 text-[#64748b]">
            {isEs
              ? 'Umbrales anuales de ingresos por tamaño de hogar y porcentaje del FPL.'
              : 'Annual income thresholds by household size and FPL percentage.'}
          </p>
          <ReferenceTable
            caption={isEs ? 'Umbrales anuales de ingresos al 100%-400% FPL' : 'Annual income thresholds at 100%-400% FPL'}
            headers={fplHeaders}
            rows={contiguousRows}
            footnote={isEs
              ? 'Aplica a los 48 estados contiguos y D.C. Para Alaska y Hawái, ver tablas a continuación.'
              : 'Applies to the 48 contiguous states and D.C. For Alaska and Hawaii, see the tables below.'}
            source="HHS ASPE 2026 Poverty Guidelines"
          />
        </section>

        {/* Alaska */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-[#0f172a]">
            {isEs ? '2026 FPL para Alaska' : '2026 FPL for Alaska'}
          </h2>
          <p className="text-sm mb-6 text-[#64748b]">
            {isEs
              ? 'Umbrales de Alaska son 25% más altos que los 48 estados contiguos debido al mayor costo de vida.'
              : 'Alaska thresholds are 25% higher than the 48 contiguous states due to higher cost of living.'}
          </p>
          <ReferenceTable
            caption={isEs ? 'Umbrales anuales de ingresos en Alaska al 100%-400% FPL' : 'Alaska annual income thresholds at 100%-400% FPL'}
            headers={fplHeaders}
            rows={alaskaRows}
            source="HHS ASPE 2026 Poverty Guidelines"
          />
        </section>

        {/* Hawaii */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-[#0f172a]">
            {isEs ? '2026 FPL para Hawái' : '2026 FPL for Hawaii'}
          </h2>
          <p className="text-sm mb-6 text-[#64748b]">
            {isEs
              ? 'Umbrales de Hawái son 15% más altos que los 48 estados contiguos.'
              : 'Hawaii thresholds are 15% higher than the 48 contiguous states.'}
          </p>
          <ReferenceTable
            caption={isEs ? 'Umbrales anuales de ingresos en Hawái al 100%-400% FPL' : 'Hawaii annual income thresholds at 100%-400% FPL'}
            headers={fplHeaders}
            rows={hawaiiRows}
            source="HHS ASPE 2026 Poverty Guidelines"
          />
        </section>

        {/* Monthly amounts */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-[#0f172a]">
            {isEs ? 'Montos mensuales del FPL 2026 (48 estados + D.C.)' : '2026 FPL Monthly Income Amounts (48 States + D.C.)'}
          </h2>
          <p className="text-sm mb-6 text-[#64748b]">
            {isEs
              ? 'Umbrales mensuales calculados dividiendo entre 12. Útil para verificar elegibilidad mensual.'
              : 'Monthly thresholds calculated by dividing annual by 12. Useful for monthly eligibility verification.'}
          </p>
          <ReferenceTable
            caption={isEs ? 'Umbrales mensuales en porcentajes clave del FPL' : 'Monthly thresholds at key FPL percentages'}
            headers={monthlyHeaders}
            rows={monthlyRows}
            footnote={isEs ? 'Montos redondeados al dólar más cercano.' : 'Amounts rounded to the nearest dollar.'}
            source="HHS ASPE 2026 Poverty Guidelines"
          />
        </section>

        {/* CTA */}
        <ScreenerCTA locale={locale} slug="federal-poverty-level" />

        {/* Healthcare programs by FPL percentage */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-[#0f172a]">
            {isEs ? 'Qué programa de salud usa cada porcentaje del FPL' : 'What Healthcare Program Uses Each FPL Percentage'}
          </h2>
          <p className="text-sm mb-6 text-[#64748b]">
            {isEs
              ? 'Diferentes programas de salud usan diferentes porcentajes del FPL como su umbral de elegibilidad. Aquí están los más comunes.'
              : 'Different healthcare programs use different FPL percentages as their eligibility cutoff. Here are the most common ones.'}
          </p>
          <ReferenceTable
            caption={isEs ? 'Porcentajes del FPL y los programas de salud que los usan' : 'FPL percentages and the healthcare programs that use them'}
            headers={programsHeaders}
            rows={programs}
          />
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-[#0f172a]">
            {isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
          </h2>
          <FAQSection faqs={faqs} />
        </section>

        {/* Related */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-[#374151]">
            {isEs ? 'Recursos Relacionados' : 'Related Resources'}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/medicaid-income-limits`}
              className="text-sm px-4 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f766e] transition-colors hover:bg-[#ccfbf1]"
            >
              {isEs ? 'Límites de Ingresos Medicaid 2026' : 'Medicaid Income Limits 2026'}
            </Link>
            <Link
              href={`/${locale}/aca-income-limits`}
              className="text-sm px-4 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f766e] transition-colors hover:bg-[#ccfbf1]"
            >
              {isEs ? 'Límites de Ingresos ACA 2026' : 'ACA Income Limits 2026'}
            </Link>
            <Link
              href={`/${locale}/medicare-eligibility`}
              className="text-sm px-4 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f766e] transition-colors hover:bg-[#ccfbf1]"
            >
              {isEs ? 'Elegibilidad para Medicare' : 'Medicare Eligibility'}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
