import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import {
  getFAQSchema,
  getBreadcrumbSchema,
  getMedicalWebPageSchema,
  getMedicalProcedureSchema,
} from '@/lib/structured-data';
import {
  ReferenceTable,
  FAQSection,
  LastUpdated,
  DatasetSchema,
  AnalyzerCTA,
  QuickAnswer,
  type ReferenceTableCell,
} from '@/components/reference';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const LAST_UPDATED = '2026-05-12';

// 2026 MRI pricing data (sources cited in Sources section below)
const MEDICARE_PFS_RATE = 475;       // Medicare Physician Fee Schedule non-facility rate
const MEDICARE_OPPS_RATE = 720;      // Hospital Outpatient PPS rate
const NATIONAL_MEDIAN = 1325;
const UNINSURED_TYPICAL = 1800;
const FAIR_HEALTH_80TH = 2200;
const NATIONAL_LOW = 400;
const NATIONAL_HIGH = 3500;

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

const FAQS_EN = [
  {
    question: 'How much does an MRI cost without insurance in 2026?',
    answer: 'Without insurance, an MRI typically costs between $400 and $3,500. The national median is around $1,325. Independent imaging centers charge $400-$1,200, while hospital outpatient departments charge $1,500-$3,500 for the same scan. Medicare pays approximately $475 for an outpatient MRI.',
  },
  {
    question: 'Why is the same MRI so much more expensive at a hospital than an imaging center?',
    answer: 'Hospitals bill MRI scans at facility rates that include overhead, equipment depreciation, and staffing across the entire facility. Independent imaging centers operate with much lower overhead and price competitively. The actual scan and image quality are identical — only the billing differs. The 2026 Medicare Outpatient PPS rate of $720 (hospital) compared to the Physician Fee Schedule rate of $475 (non-facility) illustrates how much the site of service matters.',
  },
  {
    question: 'Can I get an MRI without insurance?',
    answer: 'Yes. Many independent imaging centers offer cash-pay or self-pay rates of $400-$800 for an MRI without insurance. Some hospitals also offer self-pay discounts of 20-50% off chargemaster prices, though you have to ask. Always request a cash price quote before scheduling.',
  },
  {
    question: 'How much does Medicare pay for an MRI?',
    answer: 'In 2026, Medicare pays approximately $475 for an outpatient MRI at an independent imaging center (Physician Fee Schedule rate) or about $720 at a hospital outpatient department (OPPS rate). You pay 20% after meeting your Part B deductible ($283 in 2026), unless you have a Medigap plan covering coinsurance.',
  },
  {
    question: 'What is the difference between an open MRI and a closed MRI cost?',
    answer: 'Open MRI machines (used for claustrophobic or larger patients) typically cost 10-20% more than closed MRIs because the equipment is more expensive and image quality often requires a longer scan. Expect open MRI prices of $500-$1,500 at independent centers and $1,800-$4,000 at hospitals.',
  },
  {
    question: 'How do I dispute an MRI bill?',
    answer: 'Compare your bill line-by-line to the 2026 Medicare allowed amount. If a charge is more than 2-3x the Medicare rate, you have leverage to dispute. Common errors include duplicate charges, contrast billed when none was used, or hospital outpatient rates billed for scans performed at an affiliated imaging center. Upload your bill to the free CoveredUSA Bill Analyzer to identify specific overcharges and generate a dispute letter.',
  },
  {
    question: 'Does my insurance cover an MRI?',
    answer: 'Most plans cover medically necessary MRIs. ACA marketplace plans, Medicaid, Medicare, and most employer plans cover MRI when ordered by a provider. Out-of-pocket cost depends on your deductible, coinsurance, and whether the imaging facility is in-network. Always verify network status before scheduling — out-of-network MRIs can cost 3-5x more.',
  },
  {
    question: 'Is an MRI cheaper at a freestanding imaging center?',
    answer: 'Yes, almost always. Independent imaging centers charge $400-$1,200 for an MRI without insurance, compared to $1,500-$3,500 at hospital outpatient departments. The 2026 CMS price transparency data confirms this 2-3x markup at hospitals. If your insurance allows you to choose, picking an independent imaging center can save thousands.',
  },
];

const FAQS_ES = [
  {
    question: '¿Cuánto cuesta una resonancia magnética sin seguro en 2026?',
    answer: 'Sin seguro, una resonancia magnética típicamente cuesta entre $400 y $3,500. La mediana nacional es alrededor de $1,325. Los centros de imágenes independientes cobran $400-$1,200, mientras que los departamentos ambulatorios de hospitales cobran $1,500-$3,500 por la misma exploración.',
  },
  {
    question: '¿Por qué la misma resonancia es tanto más cara en el hospital que en un centro de imágenes?',
    answer: 'Los hospitales facturan las resonancias a tarifas de instalación que incluyen gastos generales, depreciación de equipos y personal en toda la instalación. Los centros de imágenes independientes operan con mucho menos gasto general y precios competitivos. La exploración real es idéntica — solo difiere la facturación.',
  },
  {
    question: '¿Puedo hacerme una resonancia sin seguro?',
    answer: 'Sí. Muchos centros de imágenes independientes ofrecen tarifas de pago en efectivo o autopago de $400-$800 para una resonancia sin seguro. Algunos hospitales también ofrecen descuentos de autopago del 20-50% si los solicita.',
  },
  {
    question: '¿Cuánto paga Medicare por una resonancia magnética?',
    answer: 'En 2026, Medicare paga aproximadamente $475 por una resonancia ambulatoria en un centro de imágenes independiente o alrededor de $720 en un hospital. Usted paga el 20% después de cumplir con su deducible de la Parte B ($283 en 2026).',
  },
  {
    question: '¿Cuál es la diferencia entre el costo de una resonancia abierta y cerrada?',
    answer: 'Las máquinas de resonancia abierta típicamente cuestan 10-20% más que las cerradas porque el equipo es más caro. Espere precios de $500-$1,500 en centros independientes y $1,800-$4,000 en hospitales.',
  },
  {
    question: '¿Cómo disputo una factura de resonancia magnética?',
    answer: 'Compare su factura línea por línea con el monto permitido por Medicare 2026. Si un cargo es más de 2-3 veces la tarifa de Medicare, tiene poder para disputarlo. Suba su factura al Analizador de Facturas Médicas gratuito de CoveredUSA para identificar sobrecargos específicos.',
  },
  {
    question: '¿Cubre mi seguro una resonancia magnética?',
    answer: 'La mayoría de los planes cubren resonancias médicamente necesarias. Los planes del mercado ACA, Medicaid, Medicare y la mayoría de los planes de empleadores cubren resonancias cuando son ordenadas por un proveedor.',
  },
  {
    question: '¿Es más barata una resonancia en un centro de imágenes independiente?',
    answer: 'Sí, casi siempre. Los centros de imágenes independientes cobran $400-$1,200 por una resonancia sin seguro, en comparación con $1,500-$3,500 en hospitales. Los datos de transparencia de precios de CMS 2026 confirman este margen de 2-3x en hospitales.',
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  return {
    title: isEs
      ? 'Costo de Resonancia Magnética sin Seguro en 2026 | CoveredUSA'
      : 'MRI Cost Without Insurance in 2026 — National Pricing Guide | CoveredUSA',
    description: isEs
      ? 'Costo promedio de una resonancia magnética en 2026: $400 a $3,500 sin seguro. Compare precios de hospital ambulatorio vs. centros de imágenes independientes y tarifas de Medicare.'
      : 'Average MRI cost in 2026: $400 to $3,500 without insurance. Compare hospital outpatient vs. independent imaging center prices and Medicare rates. Site of service is the biggest cost driver.',
    alternates: {
      canonical: `https://coveredusa.org/${locale}/cost/mri`,
      languages: {
        en: 'https://coveredusa.org/en/cost/mri',
        es: 'https://coveredusa.org/es/cost/mri',
      },
    },
  };
}

export default async function MriCostPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEs = locale === 'es';
  const faqs = isEs ? FAQS_ES : FAQS_EN;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Costos' : 'Costs', url: `/${locale}/cost` },
    { name: isEs ? 'Resonancia Magnética' : 'MRI', url: `/${locale}/cost/mri` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/cost/mri`,
    name: isEs ? 'Costo de Resonancia Magnética sin Seguro en 2026' : 'MRI Cost Without Insurance in 2026',
    description: isEs
      ? 'Guía de precios de resonancia magnética 2026 con tarifas de Medicare, rangos de hospital vs. centros de imágenes independientes, y consejos para detectar errores de facturación.'
      : '2026 MRI pricing guide with Medicare rates, hospital vs. independent imaging center ranges, and billing error tips.',
    lastReviewed: LAST_UPDATED,
    about: 'Magnetic Resonance Imaging',
    audience: 'Patient',
    medicalSpecialty: 'Radiology',
  });
  const medicalProcedureSchema = getMedicalProcedureSchema({
    name: isEs ? 'Resonancia Magnética (MRI)' : 'Magnetic Resonance Imaging (MRI)',
    description: isEs
      ? 'Una resonancia magnética es una técnica de imagen médica que usa un campo magnético potente y ondas de radio para crear imágenes detalladas de los órganos y tejidos del cuerpo.'
      : 'An MRI is a medical imaging technique that uses a powerful magnetic field and radio waves to create detailed images of the body\'s organs and tissues.',
    url: `/${locale}/cost/mri`,
    procedureType: 'Diagnostic',
    estimatedCostLow: NATIONAL_LOW,
    estimatedCostHigh: NATIONAL_HIGH,
  });

  // Main pricing table — site of service is THE story for MRI
  const pricingHeaders = isEs
    ? ['Sitio de servicio', 'Rango típico sin seguro', 'Tarifa de Medicare 2026']
    : ['Site of Service', 'Typical Range Without Insurance', '2026 Medicare Rate'];

  const pricingRows: ReferenceTableCell[][] = [
    [
      isEs ? 'Centro de imágenes independiente' : 'Independent imaging center',
      '$400 - $1,200',
      fmt(MEDICARE_PFS_RATE),
    ],
    [
      isEs ? 'Departamento ambulatorio del hospital' : 'Hospital outpatient department',
      '$1,500 - $3,500',
      fmt(MEDICARE_OPPS_RATE),
    ],
    [
      isEs ? 'Unidad móvil de resonancia' : 'Mobile MRI unit',
      '$350 - $900',
      fmt(MEDICARE_PFS_RATE),
    ],
    [
      isEs ? 'Hospital de admisión (durante hospitalización)' : 'Inpatient hospital (during admission)',
      '$1,800 - $4,500',
      isEs ? 'Incluido en DRG' : 'Bundled into DRG',
    ],
  ];

  // By body part
  const bodyPartHeaders = isEs
    ? ['Parte del cuerpo', 'Rango sin seguro (sin contraste)', 'Con contraste (añadir)']
    : ['Body Part', 'Without-Insurance Range (no contrast)', 'With Contrast (add)'];

  const bodyPartRows: ReferenceTableCell[][] = [
    [isEs ? 'Cerebro' : 'Brain', '$500 - $3,000', '+$200 - $500'],
    [isEs ? 'Columna lumbar' : 'Lumbar spine', '$450 - $3,000', '+$200 - $500'],
    [isEs ? 'Columna cervical' : 'Cervical spine', '$450 - $3,000', '+$200 - $500'],
    [isEs ? 'Rodilla' : 'Knee', '$400 - $2,500', '+$200 - $400'],
    [isEs ? 'Hombro' : 'Shoulder', '$400 - $2,500', '+$200 - $400'],
    [isEs ? 'Abdomen' : 'Abdomen', '$600 - $3,500', '+$200 - $500'],
    [isEs ? 'Pelvis' : 'Pelvis', '$500 - $3,000', '+$200 - $500'],
    [isEs ? 'Cardíaca (cardio MRI)' : 'Cardiac (Cardiac MRI)', '$1,500 - $5,000', '+$300 - $600'],
  ];

  // Billing errors
  const billingErrors = isEs
    ? [
      'Facturado dos veces por la misma resonancia el mismo día (cargos duplicados)',
      'Cobrado por contraste cuando no se administró',
      'Tarifa ambulatoria de hospital facturada por una resonancia realizada en un centro de imágenes independiente afiliado',
      'Anestesia facturada cuando no se administró ninguna',
      'Imagen separada facturada para cada secuencia cuando todas son parte de un estudio',
      'Resonancia "abierta" facturada cuando se realizó una resonancia estándar',
    ]
    : [
      'Billed twice for the same MRI on the same day (duplicate charges)',
      'Charged for contrast when none was administered',
      'Hospital outpatient rate billed for an MRI performed at an affiliated independent imaging center',
      'Anesthesia billed when none was administered',
      'Separate image billed for each sequence when all are part of one study',
      'Open MRI billed when a standard MRI was performed',
    ];

  // Factors affecting cost
  const factors = isEs
    ? [
      'Sitio de servicio (hospital vs. centro de imágenes independiente) — el factor más grande',
      'Con o sin colorante de contraste (agrega $200-$500)',
      'Parte del cuerpo escaneada',
      'Región geográfica (mercados urbanos tienden a ser más altos)',
      'Si tiene seguro y su estado de deducible',
      'Resonancia abierta vs. cerrada (abierta cuesta 10-20% más)',
    ]
    : [
      'Site of service (hospital vs. independent imaging center) — the biggest factor',
      'With or without contrast dye (adds $200-$500)',
      'Body part scanned',
      'Geographic region (urban markets tend to be higher)',
      'Whether you have insurance and your deductible status',
      'Open vs. closed MRI (open costs 10-20% more)',
    ];

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalProcedureSchema) }} />
      <DatasetSchema
        name={isEs ? 'Datos de costo de resonancia magnética 2026' : '2026 MRI Cost Data'}
        description={isEs
          ? 'Datos de precios de resonancia magnética 2026 por sitio de servicio y parte del cuerpo, con tarifas de Medicare y errores de facturación comunes.'
          : '2026 MRI pricing data by site of service and body part, with Medicare rates and common billing errors.'}
        url={`https://coveredusa.org/${locale}/cost/mri`}
        dateModified={LAST_UPDATED}
        source="CMS Physician Fee Schedule 2026, Hospital Outpatient PPS 2026, FAIR Health Consumer"
        keywords={isEs
          ? ['costo resonancia magnética', 'MRI sin seguro', 'precio MRI 2026', 'Medicare MRI', 'resonancia hospital vs centro']
          : ['MRI cost', 'MRI without insurance', '2026 MRI price', 'Medicare MRI rate', 'MRI hospital vs imaging center', 'CMS price transparency']}
      />

      {/* Hero */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="mb-3">
            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide bg-[#fef3c7] text-[#9a5418]">
              {isEs ? 'Costo de procedimiento 2026' : '2026 Procedure Cost'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-3" data-speakable>
            {isEs ? '¿Cuánto cuesta una resonancia magnética en 2026?' : 'How Much Does an MRI Cost in 2026?'}
          </h1>
          <p className="text-lg text-[#475569] max-w-3xl mb-4">
            {isEs
              ? `Sin seguro, una resonancia magnética típicamente cuesta de ${fmt(NATIONAL_LOW)} a ${fmt(NATIONAL_HIGH)}. El sitio de servicio es el factor de costo más grande — el mismo escaneo cuesta 2-3 veces más en un hospital que en un centro de imágenes independiente.`
              : `Without insurance, an MRI typically costs ${fmt(NATIONAL_LOW)} to ${fmt(NATIONAL_HIGH)}. Site of service is the biggest cost driver — the same scan costs 2-3x more at a hospital than at an independent imaging center.`}
          </p>
          <LastUpdated
            date={isEs ? '12 de mayo de 2026' : 'May 12, 2026'}
            source="CMS Physician Fee Schedule 2026, Hospital Outpatient PPS, FAIR Health Consumer"
          />
          <div className="max-w-3xl mt-2">
            <QuickAnswer
              locale={locale}
              text={isEs
                ? `A partir de 2026, una resonancia magnética cuesta en promedio ${fmt(NATIONAL_MEDIAN)} a nivel nacional sin seguro. En un centro de imágenes independiente es típicamente $400-$1,200; en un departamento ambulatorio de hospital es $1,500-$3,500 — para la misma exploración. Medicare paga aproximadamente $${MEDICARE_PFS_RATE} en centros independientes y $${MEDICARE_OPPS_RATE} en hospitales. El factor de costo más grande es el sitio de servicio, no la región geográfica.`
                : `As of 2026, an MRI costs an average of ${fmt(NATIONAL_MEDIAN)} nationally without insurance. At an independent imaging center it's typically $400-$1,200; at a hospital outpatient department it's $1,500-$3,500 — for the same scan. Medicare pays approximately $${MEDICARE_PFS_RATE} at independent centers and $${MEDICARE_OPPS_RATE} at hospitals. The biggest cost driver is site of service, not geographic region.`}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        {/* Main pricing table — site of service */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-[#0f172a]">
            {isEs ? 'Costo de resonancia magnética por sitio de servicio (2026)' : 'MRI Cost by Site of Service (2026)'}
          </h2>
          <p className="text-sm mb-6 text-[#64748b]">
            {isEs
              ? 'El mismo escaneo, mismas imágenes — pero la facturación varía 2-3 veces según dónde se realice. Este es el factor de costo más grande.'
              : 'The same scan, the same images — but billing varies 2-3x by where it\'s performed. This is the biggest cost driver.'}
          </p>
          <ReferenceTable
            caption={isEs ? 'Precios de resonancia magnética sin seguro vs. tarifas de Medicare 2026' : 'MRI prices without insurance vs. 2026 Medicare rates'}
            headers={pricingHeaders}
            rows={pricingRows}
            footnote={isEs
              ? 'Las tarifas de Medicare 2026 son la base. Los rangos sin seguro reflejan la transparencia de precios CMS y datos de FAIR Health Consumer.'
              : '2026 Medicare rates are the baseline. Without-insurance ranges reflect CMS Hospital Price Transparency and FAIR Health Consumer data.'}
            source="CMS Physician Fee Schedule 2026, Hospital Outpatient PPS 2026, FAIR Health Consumer"
          />
        </section>

        {/* Body part variations */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-[#0f172a]">
            {isEs ? 'Costo de resonancia magnética por parte del cuerpo (2026)' : 'MRI Cost by Body Part (2026)'}
          </h2>
          <p className="text-sm mb-6 text-[#64748b]">
            {isEs
              ? 'Los rangos suponen un sitio de servicio mixto. Cardíaca y abdominal tienden a costar más debido a la complejidad y el tiempo de exploración.'
              : 'Ranges assume mixed site of service. Cardiac and abdominal tend to cost more due to complexity and scan time.'}
          </p>
          <ReferenceTable
            caption={isEs ? 'Costo típico por parte del cuerpo escaneada' : 'Typical cost by body part scanned'}
            headers={bodyPartHeaders}
            rows={bodyPartRows}
            footnote={isEs
              ? 'El contraste se administra cuando se necesita visualización mejorada (sospecha de tumor, MS, problemas vasculares). Pregunte si realmente lo necesita.'
              : 'Contrast is administered when enhanced visualization is needed (suspected tumor, MS, vascular issues). Ask if you actually need it.'}
            source="FAIR Health Consumer, CMS 2026 data"
          />
        </section>

        {/* Factors affecting cost */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-[#0f172a]">
            {isEs ? 'Qué afecta el costo de una resonancia' : 'What Affects the Cost of an MRI'}
          </h2>
          <ul className="space-y-2">
            {factors.map((factor, i) => (
              <li key={i} className="flex gap-3 text-[#475569]">
                <span className="text-[#0d9488] font-bold flex-shrink-0">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Billing errors to check */}
        <section className="bg-white rounded-xl border border-[#e2e8f0] p-8">
          <h2 className="text-2xl font-bold mb-3 text-[#0f172a]">
            {isEs ? 'Errores de facturación que debe verificar en su factura de resonancia' : 'Billing Errors to Check on Your MRI Bill'}
          </h2>
          <p className="text-[#475569] mb-5">
            {isEs
              ? 'Si recibió una factura de resonancia magnética por encima del rango típico, verifique estos errores comunes antes de pagar. La CoveredUSA Bill Analyzer escaneará cada línea contra tarifas justas y generará una carta de disputa.'
              : 'If you received an MRI bill above the typical range, check for these common errors before paying. The CoveredUSA Bill Analyzer will scan every line against fair rates and generate a dispute letter.'}
          </p>
          <ul className="space-y-2">
            {billingErrors.map((err, i) => (
              <li key={i} className="flex gap-3 text-[#475569]">
                <span className="text-[#c2732a] font-bold flex-shrink-0">⚠</span>
                <span>{err}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Link
              href={`/${locale}/medical-bill-analyzer?utm_source=programmatic&utm_medium=inline&utm_campaign=cost-mri`}
              className="inline-flex items-center gap-2 text-[#0f766e] font-semibold hover:underline"
            >
              {isEs ? 'Verificar mi factura con el CoveredUSA Bill Analyzer' : 'Check my bill with the CoveredUSA Bill Analyzer'}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* Analyzer CTA */}
        <AnalyzerCTA
          locale={locale}
          slug="cost-mri"
        />

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
            {isEs ? 'Costos relacionados' : 'Related Costs'}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/medicare-eligibility`}
              className="text-sm px-4 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f766e] transition-colors hover:bg-[#ccfbf1]"
            >
              {isEs ? 'Elegibilidad para Medicare' : 'Medicare Eligibility'}
            </Link>
            <Link
              href={`/${locale}/federal-poverty-level`}
              className="text-sm px-4 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f766e] transition-colors hover:bg-[#ccfbf1]"
            >
              {isEs ? 'Tabla del Nivel Federal de Pobreza 2026' : '2026 Federal Poverty Level Chart'}
            </Link>
            <Link
              href={`/${locale}/medical-bill-analyzer`}
              className="text-sm px-4 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#0f766e] transition-colors hover:bg-[#ccfbf1]"
            >
              {isEs ? 'Analizador de Facturas Médicas' : 'Medical Bill Analyzer'}
            </Link>
          </div>
        </section>

        {/* Sources */}
        <section className="border-t border-[#e2e8f0] pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 text-[#64748b]">
            {isEs ? 'Fuentes y referencias' : 'Sources & References'}
          </h2>
          <ol className="space-y-2 text-sm text-[#475569]">
            <li>
              1.{' '}
              <a
                href="https://www.cms.gov/medicare/payment/physician-fee-schedule"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0f766e] hover:underline"
              >
                CMS 2026 Medicare Physician Fee Schedule
              </a>{' '}
              — outpatient MRI baseline rate.
            </li>
            <li>
              2.{' '}
              <a
                href="https://www.cms.gov/medicare/payment/prospective-payment-systems/hospital-outpatient"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0f766e] hover:underline"
              >
                CMS 2026 Hospital Outpatient Prospective Payment System (OPPS)
              </a>{' '}
              — hospital outpatient rate.
            </li>
            <li>
              3.{' '}
              <a
                href="https://www.fairhealthconsumer.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0f766e] hover:underline"
              >
                FAIR Health Consumer
              </a>{' '}
              — without-insurance range data.
            </li>
            <li>
              4.{' '}
              <a
                href="https://www.cms.gov/medicare/forms-notices/cms-online-manual-system/internet-only-manuals-ioms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0f766e] hover:underline"
              >
                CMS Hospital Price Transparency files
              </a>{' '}
              — chargemaster ranges by facility.
            </li>
          </ol>
        </section>
      </div>
    </main>
  );
}
