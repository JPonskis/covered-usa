import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import {
  getFAQSchema,
  getBreadcrumbSchema,
  getMedicalWebPageSchema,
  buildSchemaGraph,
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

// FPL 2026: $15,960 base for 1 person, +$5,680 per additional person (48 contiguous states)
const FPL_BASE = 15960;
const FPL_ADDITIONAL = 5680;
const LAST_UPDATED = '2026-05-12';

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

// All 50 states + DC with expansion status (as of 2026)
const STATES: { name: string; expanded: boolean; note: { en: string; es: string } }[] = [
  { name: 'Alabama', expanded: false, note: { en: 'Limited coverage; adults generally not covered', es: 'Cobertura limitada; los adultos generalmente no están cubiertos' } },
  { name: 'Alaska', expanded: true, note: { en: 'Higher FPL limits apply ($19,950 base for 1 person)', es: 'Aplican límites de FPL más altos ($19,950 base para 1 persona)' } },
  { name: 'Arizona', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Arkansas', expanded: true, note: { en: 'Expansion via "Arkansas Works" private option', es: 'Expansión vía opción privada "Arkansas Works"' } },
  { name: 'California', expanded: true, note: { en: 'CalAIM; covers undocumented adults', es: 'CalAIM; cubre adultos indocumentados' } },
  { name: 'Colorado', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Connecticut', expanded: true, note: { en: 'HUSKY Health; standard expansion', es: 'HUSKY Health; expansión estándar' } },
  { name: 'Delaware', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'District of Columbia', expanded: true, note: { en: 'Covers up to 215% FPL for adults', es: 'Cubre hasta el 215% FPL para adultos' } },
  { name: 'Florida', expanded: false, note: { en: 'Limited; primarily children, pregnant women, parents under 30% FPL', es: 'Limitado; principalmente niños, mujeres embarazadas, padres bajo 30% FPL' } },
  { name: 'Georgia', expanded: false, note: { en: 'Partial expansion (Pathways); work requirements apply', es: 'Expansión parcial (Pathways); requisitos de trabajo' } },
  { name: 'Hawaii', expanded: true, note: { en: 'Higher FPL limits apply ($18,360 base for 1 person)', es: 'Aplican límites de FPL más altos ($18,360 base para 1 persona)' } },
  { name: 'Idaho', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Illinois', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Indiana', expanded: true, note: { en: 'Healthy Indiana Plan; standard expansion', es: 'Healthy Indiana Plan; expansión estándar' } },
  { name: 'Iowa', expanded: true, note: { en: 'IA Health Link; standard expansion', es: 'IA Health Link; expansión estándar' } },
  { name: 'Kansas', expanded: false, note: { en: 'Did not expand; limited adult coverage', es: 'No expandió; cobertura limitada para adultos' } },
  { name: 'Kentucky', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Louisiana', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Maine', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Maryland', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Massachusetts', expanded: true, note: { en: 'MassHealth; predates ACA expansion', es: 'MassHealth; precede la expansión del ACA' } },
  { name: 'Michigan', expanded: true, note: { en: 'Healthy Michigan Plan; standard expansion', es: 'Healthy Michigan Plan; expansión estándar' } },
  { name: 'Minnesota', expanded: true, note: { en: 'MinnesotaCare; standard expansion', es: 'MinnesotaCare; expansión estándar' } },
  { name: 'Mississippi', expanded: false, note: { en: 'Did not expand; very limited adult coverage', es: 'No expandió; cobertura para adultos muy limitada' } },
  { name: 'Missouri', expanded: true, note: { en: 'Expanded via ballot initiative; 138% FPL', es: 'Expandido vía iniciativa electoral; 138% FPL' } },
  { name: 'Montana', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Nebraska', expanded: true, note: { en: 'Expanded via ballot; standard expansion', es: 'Expandido vía boleta; expansión estándar' } },
  { name: 'Nevada', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'New Hampshire', expanded: true, note: { en: 'Granite Advantage; standard expansion', es: 'Granite Advantage; expansión estándar' } },
  { name: 'New Jersey', expanded: true, note: { en: 'NJ FamilyCare; standard expansion', es: 'NJ FamilyCare; expansión estándar' } },
  { name: 'New Mexico', expanded: true, note: { en: 'Centennial Care; standard expansion', es: 'Centennial Care; expansión estándar' } },
  { name: 'New York', expanded: true, note: { en: 'Standard expansion; covers up to 138% FPL', es: 'Expansión estándar; cubre hasta 138% FPL' } },
  { name: 'North Carolina', expanded: true, note: { en: 'Expanded in 2024; 138% FPL', es: 'Expandido en 2024; 138% FPL' } },
  { name: 'North Dakota', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Ohio', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Oklahoma', expanded: true, note: { en: 'SoonerCare; expanded via ballot in 2021', es: 'SoonerCare; expandido vía boleta en 2021' } },
  { name: 'Oregon', expanded: true, note: { en: 'Oregon Health Plan; standard expansion', es: 'Oregon Health Plan; expansión estándar' } },
  { name: 'Pennsylvania', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Rhode Island', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'South Carolina', expanded: false, note: { en: 'Did not expand; limited adult coverage', es: 'No expandió; cobertura limitada para adultos' } },
  { name: 'South Dakota', expanded: true, note: { en: 'Expanded via ballot in 2023', es: 'Expandido vía boleta en 2023' } },
  { name: 'Tennessee', expanded: false, note: { en: 'TennCare; did not expand; very strict limits', es: 'TennCare; no expandió; límites muy estrictos' } },
  { name: 'Texas', expanded: false, note: { en: 'Very limited; primarily children under 19 and pregnant women', es: 'Muy limitado; principalmente niños menores de 19 y mujeres embarazadas' } },
  { name: 'Utah', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Vermont', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Virginia', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Washington', expanded: true, note: { en: 'Apple Health; standard expansion', es: 'Apple Health; expansión estándar' } },
  { name: 'West Virginia', expanded: true, note: { en: 'Standard expansion; 138% FPL', es: 'Expansión estándar; 138% FPL' } },
  { name: 'Wisconsin', expanded: false, note: { en: 'BadgerCare; partial expansion to 100% FPL', es: 'BadgerCare; expansión parcial al 100% FPL' } },
  { name: 'Wyoming', expanded: false, note: { en: 'Did not expand; limited adult coverage', es: 'No expandió; cobertura limitada para adultos' } },
];

const FAQS_EN = [
  {
    question: 'What is the Medicaid income limit for 2026?',
    answer: 'In states that expanded Medicaid, the income limit is 138% of the Federal Poverty Level (FPL). For a single person, that is approximately $22,024 per year. For a family of four, it is approximately $45,540 per year.',
  },
  {
    question: 'Do all states have the same Medicaid income limits?',
    answer: 'No. States that expanded Medicaid (41 states plus D.C. as of 2026) cover adults up to 138% FPL. Non-expansion states like Texas, Florida, Mississippi, Wyoming, Kansas, South Carolina, Tennessee, and Wisconsin have much stricter rules and often only cover children, pregnant women, and people with disabilities.',
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
  {
    question: 'What is the Medicaid Nursing Home income limit in 2026?',
    answer: 'For long-term care Medicaid (Nursing Home coverage), the institutional income limit is $2,982 per month in most states as of 2026. This applies to elderly and disabled adults, regardless of MAGI rules.',
  },
];

const FAQS_ES = [
  {
    question: '¿Cuál es el límite de ingresos de Medicaid para 2026?',
    answer: 'En los estados que expandieron Medicaid, el límite de ingresos es del 138% del Nivel Federal de Pobreza (FPL). Para una persona sola, esto es aproximadamente $22,024 por año. Para una familia de cuatro, es aproximadamente $45,540 por año.',
  },
  {
    question: '¿Todos los estados tienen los mismos límites de ingresos de Medicaid?',
    answer: 'No. Los estados que expandieron Medicaid (41 estados más D.C. a partir de 2026) cubren a adultos hasta el 138% del FPL. Los estados sin expansión como Texas, Florida, Mississippi, Wyoming, Kansas, Carolina del Sur, Tennessee y Wisconsin tienen reglas mucho más estrictas.',
  },
  {
    question: '¿Puedo calificar para Medicaid si no tengo ingresos?',
    answer: 'Sí. Si no tiene ingresos, es muy probable que califique para Medicaid en la mayoría de los estados, suponiendo que cumpla con los requisitos de ciudadanía o residencia y no esté ya en Medicare.',
  },
  {
    question: '¿Medicaid cuenta los ingresos brutos o netos?',
    answer: 'Medicaid usa el Ingreso Bruto Ajustado Modificado (MAGI), que se basa en sus ingresos imponibles federales. Incluye salarios, propinas, ingresos por trabajo independiente y algunos otros tipos de ingresos.',
  },
  {
    question: '¿Qué pasa si mis ingresos están justo por encima del límite de Medicaid?',
    answer: 'Si sus ingresos están ligeramente por encima del límite de Medicaid, puede calificar para subsidios del mercado del ACA. En algunos estados también hay programas de "spend-down" que le permiten calificar para Medicaid deduciendo gastos médicos.',
  },
  {
    question: '¿Cuál es el límite de ingresos de Medicaid para hogares de ancianos en 2026?',
    answer: 'Para el Medicaid de cuidado a largo plazo (cobertura de hogar de ancianos), el límite de ingresos institucional es de $2,982 por mes en la mayoría de los estados a partir de 2026.',
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
      ? 'Tabla completa de los límites de ingresos de Medicaid para 2026 en los 50 estados. Vea los límites por tamaño de hogar y estado. Actualizado con cifras del Nivel Federal de Pobreza 2026.'
      : 'Complete table of Medicaid income limits for 2026 across all 50 states. See limits by household size and state. Updated with 2026 Federal Poverty Level figures.',
    alternates: {
      canonical: `https://coveredusa.org/${locale}/medicaid-income-limits`,
      languages: {
        en: 'https://coveredusa.org/en/medicaid-income-limits',
        es: 'https://coveredusa.org/es/medicaid-income-limits',
      },
    },
  };
}

export default async function MedicaidIncomeLimitsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEs = locale === 'es';
  const faqs = isEs ? FAQS_ES : FAQS_EN;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Límites de Ingresos Medicaid' : 'Medicaid Income Limits', url: `/${locale}/medicaid-income-limits` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/medicaid-income-limits`,
    name: isEs ? 'Límites de Ingresos de Medicaid 2026 por Estado' : 'Medicaid Income Limits 2026 by State',
    description: isEs
      ? 'Tabla completa de los límites de ingresos de Medicaid para 2026 en los 50 estados.'
      : 'Complete table of Medicaid income limits for 2026 across all 50 states.',
    lastReviewed: LAST_UPDATED,
    about: 'Medicaid',
    audience: 'Patient',
    medicalSpecialty: 'PublicHealth',
  });

  // Build table rows
  const householdHeaders = isEs
    ? ['Tamaño del Hogar', '100% FPL (anual)', '138% FPL — Límite Medicaid', '138% FPL (mensual)']
    : ['Household Size', '100% FPL (annual)', '138% FPL — Medicaid Limit', '138% FPL (monthly)'];

  const householdRows: ReferenceTableCell[][] = HOUSEHOLD_SIZES.map((size) => [
    `${size} ${isEs ? (size === 1 ? 'persona' : 'personas') : size === 1 ? 'person' : 'people'}`,
    fmt(fpl(size)),
    fmt(medicaid(size)),
    fmt(Math.round(medicaid(size) / 12)),
  ]);

  const stateHeaders = isEs
    ? ['Estado', 'Expansión', 'Notas']
    : ['State', 'Expanded?', 'Notes'];

  const stateRows: ReferenceTableCell[][] = STATES.map((state) => [
    state.name,
    state.expanded
      ? { value: isEs ? 'Sí' : 'Yes', status: 'yes' as const }
      : { value: 'No', status: 'no' as const },
    state.note[isEs ? 'es' : 'en'],
  ]);

  const pageGraph = buildSchemaGraph(
    [medicalWebPageSchema, breadcrumbSchema, faqSchema],
    `/${locale}/medicaid-income-limits`,
  );

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageGraph) }} />
      <DatasetSchema
        name={isEs ? 'Límites de Ingresos de Medicaid 2026 por Estado' : '2026 Medicaid Income Limits by State'}
        description={isEs
          ? 'Umbrales de ingresos de Medicaid 2026 por tamaño de hogar y estado, incluyendo estado de expansión y límites institucionales (hogar de ancianos).'
          : '2026 Medicaid income thresholds by household size and state, including expansion status and institutional (Nursing Home) limits.'}
        url={`https://coveredusa.org/${locale}/medicaid-income-limits`}
        dateModified={LAST_UPDATED}
        source={isEs ? 'CMS, KFF, HHS ASPE 2026' : 'CMS, KFF, HHS ASPE 2026'}
        keywords={isEs
          ? ['límites de ingresos medicaid', 'medicaid 2026', 'elegibilidad medicaid', 'expansión medicaid', 'FPL 138%']
          : ['medicaid income limits', 'medicaid 2026', 'medicaid eligibility', 'medicaid expansion', '138% FPL', 'nursing home medicaid']}
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
            {isEs ? 'Límites de Ingresos de Medicaid 2026' : 'Medicaid Income Limits 2026'}
          </h1>
          <p className="text-lg text-[#475569] max-w-3xl mb-4">
            {isEs
              ? 'Tabla completa de los límites de ingresos de Medicaid por tamaño de hogar y estado. Basado en el Nivel Federal de Pobreza (FPL) 2026.'
              : 'Complete Medicaid income limit tables by household size for all 50 states. Based on 2026 Federal Poverty Level (FPL) figures.'}
          </p>
          <LastUpdated
            date={isEs ? '12 de mayo de 2026' : 'May 12, 2026'}
            source={isEs ? 'CMS, KFF, HHS ASPE 2026' : 'CMS, KFF, HHS ASPE 2026'}
          />
          <div className="max-w-3xl mt-2">
            <QuickAnswer
              locale={locale}
              text={isEs
                ? 'A partir de 2026, el límite de ingresos de Medicaid en estados con expansión es el 138% del Nivel Federal de Pobreza: aproximadamente $22,024 al año para una persona sola y $45,540 para una familia de cuatro. Los 41 estados de expansión más D.C. cubren a adultos hasta este límite. Los estados sin expansión (incluidos Texas, Florida y Mississippi) tienen reglas mucho más estrictas. El límite institucional para el Medicaid de hogares de ancianos es $2,982 al mes.'
                : 'As of 2026, the Medicaid income limit in expansion states is 138% of the Federal Poverty Level: approximately $22,024 per year for a single person and $45,540 for a family of four. The 41 expansion states plus D.C. cover adults up to this limit. Non-expansion states (including Texas, Florida, and Mississippi) have much stricter rules. The institutional limit for Nursing Home Medicaid is $2,982 per month.'}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        {/* Income Limits by Household Size */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-[#0f172a]">
            {isEs ? 'Límites de Ingresos por Tamaño de Hogar (2026)' : 'Income Limits by Household Size (2026)'}
          </h2>
          <p className="text-sm mb-6 text-[#64748b]">
            {isEs
              ? 'Válido para los 48 estados contiguos. Alaska y Hawái tienen límites más altos.'
              : 'Applies to the 48 contiguous states. Alaska and Hawaii have higher limits.'}
          </p>
          <ReferenceTable
            caption={isEs ? 'Límites anuales de ingresos al 100% y 138% del FPL' : 'Annual income limits at 100% and 138% FPL'}
            headers={householdHeaders}
            rows={householdRows}
            footnote={isEs
              ? 'Las cifras son aproximadas. Los límites exactos pueden variar según el estado. Actualizado para 2026.'
              : 'Figures are approximate. Exact limits may vary by state. Updated for 2026.'}
            source="HHS ASPE 2026 Poverty Guidelines"
          />
        </section>

        {/* State Expansion Status */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-[#0f172a]">
            {isEs ? 'Estado de Expansión de Medicaid por Estado' : 'Medicaid Expansion Status by State'}
          </h2>
          <p className="text-sm mb-6 text-[#64748b]">
            {isEs
              ? '41 estados más D.C. han expandido Medicaid. En los 9 estados sin expansión, los límites son mucho más bajos.'
              : '41 states plus D.C. have expanded Medicaid. In the 9 non-expansion states, limits are much stricter.'}
          </p>
          <ReferenceTable
            caption={isEs ? 'Estado de expansión de Medicaid y notas — 50 estados + DC' : 'Medicaid expansion status and notes — 50 states + DC'}
            headers={stateHeaders}
            rows={stateRows}
            source="KFF Medicaid Eligibility Database 2026"
          />
        </section>

        {/* CTA */}
        <ScreenerCTA locale={locale} slug="medicaid-income-limits" />

        {/* FAQ */}
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
              href={`/${locale}/blog/do-i-qualify-for-medicaid-2026`}
              className="text-sm px-4 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f766e] transition-colors hover:bg-[#ccfbf1]"
            >
              {isEs ? '¿Califico para Medicaid en 2026?' : 'Do I Qualify for Medicaid in 2026?'}
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
