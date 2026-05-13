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
  DatasetSchema,
  AnalyzerCTA,
  type ReferenceTableCell,
} from '@/components/reference';
import BlogDropCap from '@/components/BlogDropCap';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const LAST_UPDATED_DATE = '2026-05-12';
const READING_TIME = '8 min read';

// 2026 MRI pricing data
const MEDICARE_PFS_RATE = 475;
const MEDICARE_OPPS_RATE = 720;
const NATIONAL_MEDIAN = 1325;
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
    answer: 'Hospitals bill MRI scans at facility rates that include overhead, equipment, and staffing. Independent imaging centers operate with much lower overhead. The actual scan and image quality are identical, only the billing differs. The 2026 Medicare Outpatient PPS rate of $720 (hospital) vs. the Physician Fee Schedule rate of $475 (non-facility) shows how much site of service matters.',
  },
  {
    question: 'Can I get an MRI without insurance?',
    answer: 'Yes. Many independent imaging centers offer cash-pay rates of $400-$800 for an MRI without insurance. Some hospitals also offer self-pay discounts of 20-50% off chargemaster prices, but you have to ask. Always request a cash price quote before scheduling.',
  },
  {
    question: 'How much does Medicare pay for an MRI?',
    answer: 'In 2026, Medicare pays approximately $475 for an outpatient MRI at an independent imaging center (Physician Fee Schedule rate) or about $720 at a hospital outpatient department (OPPS rate). You pay 20% after meeting your Part B deductible ($283 in 2026), unless you have a Medigap plan covering coinsurance.',
  },
  {
    question: 'What is the difference between an open MRI and a closed MRI cost?',
    answer: 'Open MRI machines (used for claustrophobic or larger patients) typically cost 10-20% more than closed MRIs. Expect open MRI prices of $500-$1,500 at independent centers and $1,800-$4,000 at hospitals.',
  },
  {
    question: 'How do I dispute an MRI bill?',
    answer: 'Compare your bill line-by-line to the 2026 Medicare allowed amount. If a charge is more than 2-3x the Medicare rate, you have leverage to dispute. Common errors include duplicate charges, contrast billed when none was used, or hospital outpatient rates billed for scans performed at an affiliated imaging center.',
  },
  {
    question: 'Does insurance cover an MRI?',
    answer: 'Most plans cover medically necessary MRIs when ordered by a provider. Out-of-pocket cost depends on your deductible, coinsurance, and whether the imaging facility is in-network. Always verify network status before scheduling, since out-of-network MRIs can cost 3-5x more.',
  },
  {
    question: 'Is an MRI cheaper at a freestanding imaging center?',
    answer: 'Yes, almost always. Independent imaging centers charge $400-$1,200 for an MRI without insurance, compared to $1,500-$3,500 at hospital outpatient departments. The 2026 CMS price transparency data confirms this 2-3x markup at hospitals.',
  },
];

const FAQS_ES = [
  {
    question: '¿Cuánto cuesta una resonancia magnética sin seguro en 2026?',
    answer: 'Sin seguro, una resonancia magnética típicamente cuesta entre $400 y $3,500. La mediana nacional es alrededor de $1,325. Los centros de imágenes independientes cobran $400-$1,200, mientras que los departamentos ambulatorios de hospitales cobran $1,500-$3,500 por la misma exploración.',
  },
  {
    question: '¿Por qué la misma resonancia es tanto más cara en el hospital que en un centro de imágenes?',
    answer: 'Los hospitales facturan a tarifas de instalación que incluyen gastos generales y personal. Los centros de imágenes independientes operan con mucho menos gasto general. La exploración es idéntica, solo difiere la facturación.',
  },
  {
    question: '¿Puedo hacerme una resonancia sin seguro?',
    answer: 'Sí. Muchos centros de imágenes independientes ofrecen tarifas de autopago de $400-$800. Algunos hospitales también ofrecen descuentos de autopago del 20-50%.',
  },
  {
    question: '¿Cuánto paga Medicare por una resonancia magnética?',
    answer: 'En 2026, Medicare paga aproximadamente $475 en un centro independiente o $720 en un hospital. Usted paga el 20% después de cumplir con su deducible de la Parte B ($283 en 2026).',
  },
  {
    question: '¿Cuál es la diferencia entre el costo de una resonancia abierta y cerrada?',
    answer: 'Las máquinas abiertas típicamente cuestan 10-20% más. Espere precios de $500-$1,500 en centros independientes y $1,800-$4,000 en hospitales.',
  },
  {
    question: '¿Cómo disputo una factura de resonancia?',
    answer: 'Compare su factura con la tarifa de Medicare 2026. Si un cargo es más de 2-3 veces la tarifa de Medicare, tiene poder para disputarlo. Suba su factura al Analizador de Facturas Médicas para identificar sobrecargos.',
  },
  {
    question: '¿El seguro cubre una resonancia magnética?',
    answer: 'La mayoría de los planes cubren resonancias médicamente necesarias. Verifique siempre el estado de la red antes de programar, ya que las resonancias fuera de la red pueden costar 3-5 veces más.',
  },
  {
    question: '¿Es más barata una resonancia en un centro de imágenes independiente?',
    answer: 'Sí, casi siempre. Los centros independientes cobran $400-$1,200, en comparación con $1,500-$3,500 en hospitales.',
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
      ? 'Costo promedio de una resonancia magnética en 2026: $400 a $3,500 sin seguro. Compare precios de hospital vs. centros de imágenes independientes y tarifas de Medicare.'
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
      ? 'Guía de precios de resonancia magnética 2026 con tarifas de Medicare, rangos de hospital vs. centros de imágenes independientes.'
      : '2026 MRI pricing guide with Medicare rates, hospital vs. independent imaging center ranges, and billing error tips.',
    lastReviewed: LAST_UPDATED_DATE,
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

  // Pricing tables (used inline in narrative)
  const pricingHeaders = isEs
    ? ['Sitio de servicio', 'Rango sin seguro', 'Tarifa de Medicare 2026']
    : ['Site of Service', 'Range Without Insurance', '2026 Medicare Rate'];

  const pricingRows: ReferenceTableCell[][] = [
    [
      isEs ? 'Centro de imágenes independiente' : 'Independent imaging center',
      '$400 – $1,200',
      fmt(MEDICARE_PFS_RATE),
    ],
    [
      isEs ? 'Departamento ambulatorio del hospital' : 'Hospital outpatient department',
      '$1,500 – $3,500',
      fmt(MEDICARE_OPPS_RATE),
    ],
    [
      isEs ? 'Unidad móvil de resonancia' : 'Mobile MRI unit',
      '$350 – $900',
      fmt(MEDICARE_PFS_RATE),
    ],
    [
      isEs ? 'Hospital (durante hospitalización)' : 'Inpatient hospital (during admission)',
      '$1,800 – $4,500',
      isEs ? 'Incluido en DRG' : 'Bundled in DRG',
    ],
  ];

  const bodyPartHeaders = isEs
    ? ['Parte del cuerpo', 'Rango sin seguro (sin contraste)', 'Con contraste (añadir)']
    : ['Body Part', 'Without-Insurance Range (no contrast)', 'With Contrast (add)'];

  const bodyPartRows: ReferenceTableCell[][] = [
    [isEs ? 'Cerebro' : 'Brain', '$500 – $3,000', '+$200 – $500'],
    [isEs ? 'Columna lumbar' : 'Lumbar spine', '$450 – $3,000', '+$200 – $500'],
    [isEs ? 'Columna cervical' : 'Cervical spine', '$450 – $3,000', '+$200 – $500'],
    [isEs ? 'Rodilla' : 'Knee', '$400 – $2,500', '+$200 – $400'],
    [isEs ? 'Hombro' : 'Shoulder', '$400 – $2,500', '+$200 – $400'],
    [isEs ? 'Abdomen' : 'Abdomen', '$600 – $3,500', '+$200 – $500'],
    [isEs ? 'Pelvis' : 'Pelvis', '$500 – $3,000', '+$200 – $500'],
    [isEs ? 'Cardíaca' : 'Cardiac', '$1,500 – $5,000', '+$300 – $600'],
  ];

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString(isEs ? 'es-US' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <main className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalProcedureSchema) }} />
      <DatasetSchema
        name={isEs ? 'Datos de costo de resonancia magnética 2026' : '2026 MRI Cost Data'}
        description={isEs
          ? 'Datos de precios de resonancia magnética 2026 por sitio de servicio y parte del cuerpo, con tarifas de Medicare.'
          : '2026 MRI pricing data by site of service and body part, with Medicare rates.'}
        url={`https://coveredusa.org/${locale}/cost/mri`}
        dateModified={LAST_UPDATED_DATE}
        source="CMS Physician Fee Schedule 2026, Hospital Outpatient PPS 2026, FAIR Health Consumer"
        keywords={isEs
          ? ['costo resonancia magnética', 'MRI sin seguro', 'precio MRI 2026', 'Medicare MRI']
          : ['MRI cost', 'MRI without insurance', '2026 MRI price', 'Medicare MRI rate']}
      />

      {/* Article Header */}
      <div className="warm-texture border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="category-tag">{isEs ? 'Costo de procedimiento' : 'Procedure Cost'}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              {formatDate(LAST_UPDATED_DATE)}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              {READING_TIME}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              {isEs ? 'Por' : 'By'} CoveredUSA
            </span>
          </div>

          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
            style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
            data-speakable
          >
            {isEs ? '¿Cuánto cuesta una resonancia magnética en 2026?' : 'How Much Does an MRI Cost in 2026?'}
          </h1>

          <p
            className="text-lg md:text-xl leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}
          >
            {isEs
              ? `Sin seguro, una resonancia magnética típicamente cuesta de ${fmt(NATIONAL_LOW)} a ${fmt(NATIONAL_HIGH)}. El sitio de servicio es el factor de costo más grande — el mismo escaneo cuesta 2-3 veces más en un hospital que en un centro de imágenes independiente.`
              : `Without insurance, an MRI typically costs ${fmt(NATIONAL_LOW)} to ${fmt(NATIONAL_HIGH)}. Site of service is the biggest cost driver — the same scan costs 2-3x more at a hospital than at an independent imaging center.`}
          </p>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Quick Answer blockquote — matches blog style */}
        <blockquote
          className="mb-8 px-6 py-5 rounded-xl"
          style={{ background: 'var(--cream)', borderLeft: '4px solid var(--teal)' }}
        >
          <p
            className="text-base leading-relaxed"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body), Georgia, serif' }}
            data-speakable
          >
            <strong style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
              {isEs ? 'Respuesta rápida: ' : 'Quick Answer: '}
            </strong>
            {isEs
              ? `A partir de 2026, una resonancia magnética cuesta en promedio ${fmt(NATIONAL_MEDIAN)} a nivel nacional sin seguro. En un centro de imágenes independiente: $400-$1,200. En un departamento ambulatorio del hospital: $1,500-$3,500 — para la misma exploración. Medicare paga aproximadamente $${MEDICARE_PFS_RATE} en centros independientes y $${MEDICARE_OPPS_RATE} en hospitales.`
              : `As of 2026, an MRI costs an average of ${fmt(NATIONAL_MEDIAN)} nationally without insurance. At an independent imaging center: $400-$1,200. At a hospital outpatient department: $1,500-$3,500 — for the same scan. Medicare pays approximately $${MEDICARE_PFS_RATE} at independent centers and $${MEDICARE_OPPS_RATE} at hospitals.`}
          </p>
        </blockquote>

        <div className="article-content">
          <BlogDropCap />

          <p>
            {isEs
              ? 'Una resonancia magnética (MRI) es una de las pruebas de diagnóstico por imagen más comunes en los Estados Unidos. Los médicos las ordenan para todo, desde dolor de rodilla hasta dolores de cabeza, lesiones deportivas hasta sospecha de ataques. Y los precios varían dramáticamente — no por el escaneo en sí, sino por dónde se hace.'
              : 'A magnetic resonance imaging (MRI) scan is one of the most common diagnostic imaging tests in the United States. Doctors order them for everything from knee pain to headaches, sports injuries to suspected strokes. And the prices vary dramatically — not because of the scan itself, but because of where it gets done.'}
          </p>

          <p>
            {isEs
              ? `La misma exploración cerebral que cuesta $650 en un centro de imágenes independiente puede facturarse a $2,250 en el departamento ambulatorio de un hospital. Mismo equipo, mismas imágenes, mismo radiólogo en muchos casos. Solo cambia el código de facturación.`
              : `The same brain scan that costs $650 at an independent imaging center can be billed at $2,250 at a hospital outpatient department. Same equipment, same images, often the same radiologist reading them. Only the billing code changes.`}
          </p>

          <p>
            {isEs
              ? 'Esta guía cubre lo que paga una resonancia magnética sin seguro en 2026, lo que paga Medicare, por qué los hospitales cobran 2-3 veces más, y cómo detectar errores comunes en una factura de resonancia.'
              : 'This guide covers what an MRI costs without insurance in 2026, what Medicare pays, why hospitals charge 2-3x more, and how to spot common errors on an MRI bill.'}
          </p>

          <h2>{isEs ? 'Costo de Resonancia Magnética por Sitio de Servicio (2026)' : 'MRI Cost by Site of Service in 2026'}</h2>

          <p>
            {isEs
              ? 'El factor de costo más grande de una resonancia magnética es el sitio de servicio: dónde se realiza el escaneo. Los datos de transparencia de precios de CMS 2026 confirman una diferencia de 2-3 veces en facturación entre los centros de imágenes independientes y los departamentos ambulatorios de hospitales.'
              : 'The biggest cost driver of an MRI is the site of service: where the scan is performed. 2026 CMS price transparency data confirms a 2-3x billing differential between independent imaging centers and hospital outpatient departments.'}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Precios de resonancia magnética sin seguro vs. tarifas de Medicare 2026' : 'MRI prices without insurance vs. 2026 Medicare rates'}
              headers={pricingHeaders}
              rows={pricingRows}
              footnote={isEs
                ? 'Las tarifas de Medicare 2026 son la base. Los rangos sin seguro reflejan la transparencia de precios CMS y datos de FAIR Health Consumer.'
                : '2026 Medicare rates are the baseline. Without-insurance ranges reflect CMS Hospital Price Transparency and FAIR Health Consumer data.'}
              source="CMS Physician Fee Schedule 2026, Hospital Outpatient PPS 2026, FAIR Health Consumer"
            />
          </div>

          <h2>{isEs ? '¿Por qué la misma resonancia es tanto más cara en un hospital?' : 'Why the Same MRI Is So Much More at a Hospital'}</h2>

          <p>
            {isEs
              ? `Los hospitales facturan las resonancias a tarifas de instalación que incluyen gastos generales, depreciación de equipos y personal en toda la instalación. Los centros de imágenes independientes operan con mucho menos gasto general y compiten en precios. La calidad de la imagen es idéntica. Solo difiere el código de facturación.`
              : `Hospitals bill MRI scans at facility rates that include overhead, equipment depreciation, and staffing across the entire facility. Independent imaging centers operate with much lower overhead and compete on price. The actual scan and image quality are identical. Only the billing code differs.`}
          </p>

          <p>
            {isEs
              ? `La diferencia se muestra en lo que paga Medicare: el Programa de Tarifas Médicas (PFS) 2026 paga aproximadamente $${MEDICARE_PFS_RATE} por una resonancia ambulatoria realizada en un centro independiente, mientras que el Sistema de Pagos Prospectivos Ambulatorios del Hospital (OPPS) paga aproximadamente $${MEDICARE_OPPS_RATE} por el mismo procedimiento realizado en un hospital. Esa diferencia se ve magnificada en los precios al contado: 3-5 veces más en algunos casos.`
              : `The difference shows up in what Medicare pays: the 2026 Physician Fee Schedule (PFS) pays approximately $${MEDICARE_PFS_RATE} for an outpatient MRI performed at an independent center, while the Hospital Outpatient Prospective Payment System (OPPS) pays approximately $${MEDICARE_OPPS_RATE} for the same procedure done at a hospital. That spread gets magnified in cash prices: 3-5x more in some cases.`}
          </p>

          <p>
            {isEs
              ? 'La conclusión práctica: si su médico ordena una resonancia y usted tiene la opción, un centro de imágenes independiente probablemente le ahorrará entre $1,000 y $2,500.'
              : 'The practical takeaway: if your doctor orders an MRI and you have the choice, an independent imaging center will likely save you $1,000 to $2,500.'}
          </p>
        </div>

        {/* Mid-article CTA */}
        <AnalyzerCTA locale={locale} slug="cost-mri" variant="inline" />

        <div className="article-content">
          <h2>{isEs ? 'Costo de Resonancia Magnética por Parte del Cuerpo (2026)' : 'MRI Cost by Body Part in 2026'}</h2>

          <p>
            {isEs
              ? 'Los precios varían no solo por sitio de servicio sino también por lo que se está escaneando. Las resonancias cardíacas y abdominales tienden a costar más debido a la complejidad técnica y los tiempos de exploración más largos. Si su médico también ordena contraste (un colorante administrado para mejorar la visualización), agregue $200 a $500.'
              : 'Prices vary not only by site of service but also by what is being scanned. Cardiac and abdominal MRIs tend to cost more due to technical complexity and longer scan times. If your doctor also orders contrast (a dye administered to enhance visualization), add $200 to $500.'}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Costo típico por parte del cuerpo escaneada' : 'Typical cost by body part scanned'}
              headers={bodyPartHeaders}
              rows={bodyPartRows}
              footnote={isEs
                ? 'Los rangos asumen un sitio de servicio mixto. Pregunte a su médico si el contraste es realmente necesario antes de aceptarlo.'
                : 'Ranges assume mixed site of service. Ask your doctor whether contrast is actually needed before accepting it.'}
              source="FAIR Health Consumer, CMS 2026 data"
            />
          </div>

          <h2>{isEs ? 'Lo que Medicare paga por una resonancia magnética' : 'What Medicare Pays for an MRI'}</h2>

          <p>
            {isEs
              ? `En 2026, Medicare paga aproximadamente $${MEDICARE_PFS_RATE} por una resonancia magnética ambulatoria en un centro de imágenes independiente bajo la Tabla de Tarifas Médicas (PFS), o alrededor de $${MEDICARE_OPPS_RATE} en un departamento ambulatorio del hospital bajo OPPS. Su parte: 20% después de cumplir con su deducible de la Parte B 2026 de $283 — a menos que tenga un plan Medigap que cubra el coseguro.`
              : `In 2026, Medicare pays approximately $${MEDICARE_PFS_RATE} for an outpatient MRI at an independent imaging center under the Physician Fee Schedule (PFS), or about $${MEDICARE_OPPS_RATE} at a hospital outpatient department under OPPS. Your share: 20% after meeting your 2026 Part B deductible of $283 — unless you have a Medigap plan covering coinsurance.`}
          </p>

          <p>
            {isEs
              ? 'Si tiene Medicare Advantage, las reglas de cobertura varían según el plan. La mayoría de los planes Medicare Advantage cubren las resonancias magnéticas con autorización previa, con copagos típicos de $50 a $300.'
              : 'If you have Medicare Advantage, coverage rules vary by plan. Most Medicare Advantage plans cover MRIs with prior authorization, with typical copays of $50 to $300.'}
          </p>

          <h2>{isEs ? '¿Qué factores afectan el costo de una resonancia magnética?' : 'What Factors Affect MRI Cost'}</h2>

          <ul>
            <li>{isEs ? 'Sitio de servicio (hospital vs. centro de imágenes independiente) — el factor más grande.' : 'Site of service (hospital vs. independent imaging center) — the biggest factor.'}</li>
            <li>{isEs ? 'Con o sin colorante de contraste (agrega $200-$500).' : 'With or without contrast dye (adds $200-$500).'}</li>
            <li>{isEs ? 'Parte del cuerpo escaneada.' : 'Body part scanned.'}</li>
            <li>{isEs ? 'Región geográfica (los mercados urbanos tienden a ser más altos).' : 'Geographic region (urban markets tend to be higher).'}</li>
            <li>{isEs ? 'Si tiene seguro y el estado de su deducible.' : 'Whether you have insurance and your deductible status.'}</li>
            <li>{isEs ? 'Resonancia abierta vs. cerrada (las abiertas cuestan 10-20% más).' : 'Open vs. closed MRI (open costs 10-20% more).'}</li>
          </ul>

          <h2>{isEs ? 'Errores comunes en facturas de resonancia magnética' : 'Common MRI Billing Errors'}</h2>

          <p>
            {isEs
              ? 'Si su factura de resonancia magnética está muy por encima del rango típico, verifique estos errores antes de pagar:'
              : 'If your MRI bill is well above the typical range, check for these errors before paying:'}
          </p>

          <ul>
            <li>{isEs ? 'Facturado dos veces por la misma resonancia el mismo día (cargos duplicados).' : 'Billed twice for the same MRI on the same day (duplicate charges).'}</li>
            <li>{isEs ? 'Cobrado por contraste cuando no se administró.' : 'Charged for contrast when none was administered.'}</li>
            <li>{isEs ? 'Tarifa ambulatoria de hospital facturada por una resonancia realizada en un centro de imágenes afiliado.' : 'Hospital outpatient rate billed for an MRI performed at an affiliated imaging center.'}</li>
            <li>{isEs ? 'Anestesia facturada cuando no se administró ninguna.' : 'Anesthesia billed when none was administered.'}</li>
            <li>{isEs ? 'Imagen separada facturada para cada secuencia cuando todas son parte de un estudio.' : 'Separate image billed for each sequence when all are part of one study.'}</li>
            <li>{isEs ? 'Resonancia abierta facturada cuando se realizó una resonancia estándar.' : 'Open MRI billed when a standard MRI was performed.'}</li>
          </ul>

          <h2>{isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}</h2>

          {faqs.map((faq, i) => (
            <div key={i}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>

        {/* Divider ornament */}
        <div className="divider-ornament">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
          </svg>
        </div>

        {/* End CTA */}
        <AnalyzerCTA locale={locale} slug="cost-mri-end" variant="inline" />

        {/* Related links */}
        <div className="mt-12">
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            {isEs ? 'Recursos Relacionados' : 'Related Resources'}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/medicare-eligibility`}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--teal-dark)' }}
            >
              {isEs ? 'Elegibilidad para Medicare' : 'Medicare Eligibility'}
            </Link>
            <Link
              href={`/${locale}/federal-poverty-level`}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--teal-dark)' }}
            >
              {isEs ? 'Tabla del FPL 2026' : '2026 FPL Chart'}
            </Link>
            <Link
              href={`/${locale}/medical-bill-analyzer`}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--teal-dark)' }}
            >
              {isEs ? 'Analizador de Facturas Médicas' : 'Medical Bill Analyzer'}
            </Link>
          </div>
        </div>

        {/* Sources */}
        <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          <h2
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            {isEs ? 'Fuentes y referencias' : 'Sources & References'}
          </h2>
          <ol className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>
              1.{' '}
              <a href="https://www.cms.gov/medicare/payment/physician-fee-schedule" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                CMS 2026 Medicare Physician Fee Schedule
              </a>{' '}
              — outpatient MRI baseline rate.
            </li>
            <li>
              2.{' '}
              <a href="https://www.cms.gov/medicare/payment/prospective-payment-systems/hospital-outpatient" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                CMS 2026 Hospital Outpatient Prospective Payment System (OPPS)
              </a>{' '}
              — hospital outpatient rate.
            </li>
            <li>
              3.{' '}
              <a href="https://www.fairhealthconsumer.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                FAIR Health Consumer
              </a>{' '}
              — without-insurance range data.
            </li>
            <li>
              4.{' '}
              <a href="https://www.cms.gov/medicare/forms-notices/cms-online-manual-system/internet-only-manuals-ioms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                CMS Hospital Price Transparency files
              </a>{' '}
              — chargemaster ranges by facility.
            </li>
          </ol>
        </div>
      </article>
    </main>
  );
}
