import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import {
  getFAQSchema,
  getBreadcrumbSchema,
  getMedicalWebPageSchema,
  getQAPageSchema,
} from '@/lib/structured-data';
import {
  ReferenceTable,
  ScreenerCTA,
  type ReferenceTableCell,
} from '@/components/reference';
import BlogDropCap from '@/components/BlogDropCap';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const LAST_UPDATED_DATE = '2026-05-12';
const READING_TIME = '5 min read';

const SHORT_ANSWER_EN = 'No (Original Medicare). Sometimes (Medicare Advantage).';
const SHORT_ANSWER_ES = 'No (Medicare Original). A veces (Medicare Advantage).';

const FULL_ANSWER_EN = 'As of 2026, Original Medicare (Parts A and B) does NOT cover routine dental care including cleanings, fillings, dentures, or tooth extractions. Medicare Advantage (Part C) plans often include limited dental coverage as a supplemental benefit, typically with an annual cap of $1,000 to $5,000. Medicare may cover dental procedures that are medically necessary as part of another covered procedure (such as jaw reconstruction after an accident, or dental prep for organ transplant).';
const FULL_ANSWER_ES = 'A partir de 2026, Medicare Original (Partes A y B) NO cubre cuidado dental rutinario incluyendo limpiezas, empastes, dentaduras postizas, o extracciones dentales. Los planes Medicare Advantage (Parte C) a menudo incluyen cobertura dental limitada como beneficio suplementario, típicamente con un tope anual de $1,000 a $5,000. Medicare puede cubrir procedimientos dentales que son médicamente necesarios como parte de otro procedimiento cubierto (como reconstrucción de mandíbula después de un accidente, o preparación dental para trasplante de órgano).';

const FAQS_EN = [
  {
    question: 'Does Medicare Part B cover dental cleanings?',
    answer: 'No. Routine cleanings, exams, and preventive dental work are excluded from Original Medicare Part B. The only dental services Part B covers are those medically necessary for a covered medical treatment (jaw reconstruction, organ transplant prep, etc.).',
  },
  {
    question: 'Do Medicare Advantage plans cover dental in 2026?',
    answer: 'Many Medicare Advantage plans include dental as a supplemental benefit in 2026, but coverage varies widely by plan. Typical MA dental coverage includes 2 preventive cleanings per year, basic X-rays, and basic fillings, capped at $1,000 to $5,000 annually. Major work (crowns, dentures, bridges) is often capped or excluded.',
  },
  {
    question: 'Will Original Medicare ever cover dental?',
    answer: 'Original Medicare has not expanded to include comprehensive dental coverage as of 2026. Several legislative proposals to add dental, vision, and hearing to Medicare have been introduced but have not passed. Stay alert: if reform passes, the change would typically take effect 1 to 2 years later.',
  },
  {
    question: 'Can I get free dental care on Medicare?',
    answer: 'Possibly. If you also qualify for Medicaid (dual-eligible), Medicaid will cover dental in most states (varies by state). About 12 million Americans are dual-eligible. Apply for both programs to access this. Federally Qualified Health Centers (FQHCs) and dental schools also offer reduced-cost dental care for Medicare beneficiaries.',
  },
  {
    question: 'Does Medicare cover dentures?',
    answer: 'Original Medicare does NOT cover dentures or related fittings. Some Medicare Advantage plans include partial denture coverage, often with limits like $500 to $1,500 toward dentures every few years. Standalone dental insurance plans typically cover dentures with a waiting period of 6 to 12 months.',
  },
  {
    question: 'Does Medicare cover dental implants?',
    answer: 'Original Medicare does not cover dental implants. Most Medicare Advantage dental benefits also exclude or sharply limit implants. If you need implants, standalone dental insurance (often with a 12-month waiting period for major work) or dental discount plans are usually cheaper than out-of-pocket.',
  },
  {
    question: 'What about emergency dental care under Medicare?',
    answer: 'Original Medicare covers emergency dental care only when it is part of treatment for a medical emergency (like jaw trauma from a car accident). Standard dental emergencies (cracked tooth, severe toothache) are not covered. If you go to a hospital ER for a dental emergency, the ER visit is covered but the dental work itself is not.',
  },
  {
    question: 'How much should I spend on standalone dental insurance with Medicare?',
    answer: 'Standalone dental insurance typically costs $20 to $50 per month for Medicare beneficiaries. Compare carefully: low-premium plans often have $1,000 annual maximums and high waiting periods for major work. Dental discount plans ($10 to $30/month) are not insurance but can save 20% to 60% on care if you pay out-of-pocket.',
  },
];

const FAQS_ES = [
  {
    question: '¿Medicare Parte B cubre limpiezas dentales?',
    answer: 'No. Las limpiezas rutinarias, exámenes y trabajo dental preventivo están excluidos de Medicare Original Parte B. Los únicos servicios dentales que cubre la Parte B son aquellos médicamente necesarios para un tratamiento médico cubierto.',
  },
  {
    question: '¿Los planes Medicare Advantage cubren dental en 2026?',
    answer: 'Muchos planes Medicare Advantage incluyen dental como beneficio suplementario en 2026, pero la cobertura varía ampliamente. La cobertura dental típica de MA incluye 2 limpiezas preventivas al año, radiografías básicas y empastes básicos, limitado a $1,000 a $5,000 anualmente.',
  },
  {
    question: '¿Medicare Original alguna vez cubrirá dental?',
    answer: 'Medicare Original no se ha expandido para incluir cobertura dental completa a partir de 2026. Varias propuestas legislativas para agregar dental, visión y audición a Medicare se han introducido pero no han pasado.',
  },
  {
    question: '¿Puedo obtener cuidado dental gratis con Medicare?',
    answer: 'Posiblemente. Si también califica para Medicaid (elegibilidad dual), Medicaid cubrirá dental en la mayoría de los estados. Alrededor de 12 millones de estadounidenses son elegibles dualmente.',
  },
  {
    question: '¿Medicare cubre dentaduras postizas?',
    answer: 'Medicare Original NO cubre dentaduras o ajustes relacionados. Algunos planes Medicare Advantage incluyen cobertura parcial de dentaduras, a menudo con límites como $500 a $1,500 cada pocos años.',
  },
  {
    question: '¿Medicare cubre implantes dentales?',
    answer: 'Medicare Original no cubre implantes dentales. La mayoría de los beneficios dentales de Medicare Advantage también excluyen o limitan los implantes.',
  },
  {
    question: '¿Qué pasa con la atención dental de emergencia bajo Medicare?',
    answer: 'Medicare Original cubre la atención dental de emergencia solo cuando es parte del tratamiento de una emergencia médica. Las emergencias dentales estándar no están cubiertas.',
  },
  {
    question: '¿Cuánto debería gastar en seguro dental independiente con Medicare?',
    answer: 'El seguro dental independiente típicamente cuesta $20 a $50 al mes para beneficiarios de Medicare. Compare cuidadosamente: los planes de baja prima a menudo tienen máximos anuales de $1,000 y períodos de espera largos.',
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  return {
    title: isEs
      ? '¿Medicare Cubre Dental? (Respuesta 2026) | CoveredUSA'
      : 'Does Medicare Cover Dental? (2026 Answer) | CoveredUSA',
    description: isEs
      ? 'Medicare Original no cubre dental rutinario. Algunos planes Medicare Advantage incluyen cobertura dental limitada con topes de $1,000 a $5,000 anuales.'
      : 'Original Medicare does not cover routine dental care. Some Medicare Advantage plans include limited dental coverage with $1,000 to $5,000 annual caps.',
    alternates: {
      canonical: `https://coveredusa.org/${locale}/does-medicare-cover-dental`,
      languages: {
        en: 'https://coveredusa.org/en/does-medicare-cover-dental',
        es: 'https://coveredusa.org/es/does-medicare-cover-dental',
      },
    },
  };
}

export default async function DoesMedicareCoverDentalPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEs = locale === 'es';
  const faqs = isEs ? FAQS_ES : FAQS_EN;

  const mainQuestion = isEs ? '¿Medicare Cubre Dental?' : 'Does Medicare Cover Dental?';
  const fullAnswer = isEs ? FULL_ANSWER_ES : FULL_ANSWER_EN;
  const shortAnswer = isEs ? SHORT_ANSWER_ES : SHORT_ANSWER_EN;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: mainQuestion, url: `/${locale}/does-medicare-cover-dental` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/does-medicare-cover-dental`,
    name: isEs ? '¿Medicare Cubre Dental? (2026)' : 'Does Medicare Cover Dental? (2026)',
    description: isEs
      ? 'Guía 2026 sobre la cobertura dental de Medicare, incluyendo Original Medicare, Medicare Advantage, y alternativas.'
      : '2026 guide to Medicare dental coverage, including Original Medicare, Medicare Advantage, and alternatives.',
    lastReviewed: LAST_UPDATED_DATE,
    about: 'Medicare Dental Coverage',
    audience: 'Patient',
    medicalSpecialty: 'PublicHealth',
  });
  const qaPageSchema = getQAPageSchema({
    question: mainQuestion,
    answer: fullAnswer,
    url: `/${locale}/does-medicare-cover-dental`,
  });

  // Original Medicare vs Medicare Advantage coverage breakdown
  const coverageHeaders = isEs
    ? ['Tipo de plan', 'Cobertura dental', 'Servicios incluidos', 'Tope anual']
    : ['Plan Type', 'Dental Coverage', 'Services Included', 'Annual Cap'];

  const coverageRows: ReferenceTableCell[][] = [
    [
      isEs ? 'Medicare Original (Parte A y B)' : 'Original Medicare (Part A and B)',
      { value: 'No', status: 'no' as const },
      isEs
        ? 'Solo dental médicamente necesario (ej. cirugía de mandíbula)'
        : 'Medically necessary dental only (e.g. jaw surgery)',
      isEs ? 'N/A' : 'N/A',
    ],
    [
      isEs ? 'Medicare Advantage (Parte C)' : 'Medicare Advantage (Part C)',
      { value: isEs ? 'Limitada (varía por plan)' : 'Limited (varies by plan)', status: 'yes' as const },
      isEs
        ? '2 limpiezas/año, radiografías, empastes básicos'
        : '2 cleanings/year, X-rays, basic fillings',
      '$1,000 - $5,000',
    ],
    [
      isEs ? 'Medigap (Suplemento)' : 'Medigap (Supplement)',
      { value: 'No', status: 'no' as const },
      isEs
        ? 'No incluye dental (solo cubre costos de Medicare Original)'
        : 'No dental (only covers Original Medicare costs)',
      isEs ? 'N/A' : 'N/A',
    ],
  ];

  // Alternatives
  const alternativesHeaders = isEs
    ? ['Opción', 'Costo típico', 'Mejor para']
    : ['Option', 'Typical cost', 'Best for'];

  const alternativesRows: ReferenceTableCell[][] = [
    [
      isEs ? 'Seguro dental independiente' : 'Standalone dental insurance',
      '$20 - $50/mo',
      isEs
        ? 'Quien quiere cobertura dental amplia'
        : 'Anyone who wants comprehensive dental',
    ],
    [
      isEs ? 'Medicare Advantage con dental' : 'Medicare Advantage with dental',
      isEs ? 'Varía por plan' : 'Varies by plan',
      isEs
        ? 'Quien quiere todo en un plan'
        : 'Anyone who wants medical + dental in one plan',
    ],
    [
      isEs ? 'Plan de descuento dental' : 'Dental discount plan',
      '$10 - $30/mo',
      isEs
        ? 'Pagador en efectivo (no es seguro, solo descuentos)'
        : 'Pay-as-you-go users (not insurance, just discounts)',
    ],
    [
      isEs ? 'Medicaid dental (dual elegible)' : 'Medicaid dental (dual-eligible)',
      isEs ? 'Gratis o casi gratis' : 'Free or near-free',
      isEs
        ? 'Beneficiarios dualmente elegibles (Medicare + Medicaid)'
        : 'Dual-eligible (Medicare + Medicaid) beneficiaries',
    ],
    [
      'FQHC / ' + (isEs ? 'escuela dental' : 'dental school'),
      isEs ? 'Escala móvil ($0 a precio reducido)' : 'Sliding scale ($0 to reduced)',
      isEs
        ? 'Bajos ingresos o sin seguro'
        : 'Low-income or uninsured',
    ],
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(qaPageSchema) }} />

      {/* Article Header */}
      <div className="warm-texture border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="category-tag">{isEs ? 'Cobertura Q&A' : 'Coverage Q&A'}</span>
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
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4"
            style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
            data-speakable
          >
            {isEs ? '¿Medicare Cubre Dental? (2026)' : 'Does Medicare Cover Dental? (2026)'}
          </h1>

          <p
            className="text-xl md:text-2xl font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--teal-dark)' }}
            data-speakable
          >
            {isEs ? 'Respuesta corta: ' : 'Short answer: '}
            <span style={{ color: 'var(--text-primary)' }}>{shortAnswer}</span>
          </p>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Quick Answer blockquote (full nuanced answer) */}
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
              {isEs ? 'Respuesta completa: ' : 'Full answer: '}
            </strong>
            {fullAnswer}
          </p>
        </blockquote>

        <div className="article-content">
          <BlogDropCap />

          <p>
            {isEs
              ? 'Es una de las preguntas más comunes que reciben los beneficiarios de Medicare: "¿Medicare cubre dental?" La respuesta corta es no, pero la respuesta real depende de qué tipo de Medicare tenga y qué tipo de cuidado dental necesite.'
              : 'It is one of the most common questions Medicare beneficiaries ask: "Does Medicare cover dental?" The short answer is no, but the real answer depends on which type of Medicare you have and what kind of dental care you need.'}
          </p>

          <p>
            {isEs
              ? 'Esta guía cubre exactamente qué cobertura dental obtiene con Medicare Original, qué incluyen los planes Medicare Advantage en 2026, y las alternativas si necesita cobertura dental completa.'
              : 'This guide covers exactly what dental coverage you get with Original Medicare, what Medicare Advantage plans include in 2026, and the alternatives if you need comprehensive dental coverage.'}
          </p>

          <h2>{isEs ? 'Cobertura dental por tipo de plan Medicare (2026)' : 'Medicare Dental Coverage by Plan Type (2026)'}</h2>

          <p>
            {isEs
              ? 'Aquí está exactamente lo que cada tipo de plan Medicare cubre para dental en 2026:'
              : 'Here is exactly what each type of Medicare plan covers for dental in 2026:'}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Cobertura dental por tipo de plan Medicare' : 'Dental coverage by Medicare plan type'}
              headers={coverageHeaders}
              rows={coverageRows}
              footnote={isEs
                ? 'La cobertura dental de Medicare Advantage varía significativamente por plan. Siempre verifique el Resumen de Beneficios del plan específico.'
                : 'Medicare Advantage dental coverage varies significantly by plan. Always check the specific plan\'s Summary of Benefits.'}
              source="Medicare.gov, KFF Medicare Advantage Dental Coverage 2026"
            />
          </div>

          <h2>{isEs ? 'Cuándo Medicare Original cubre algo dental' : 'When Original Medicare Does Cover Something Dental'}</h2>

          <p>
            {isEs
              ? 'Medicare Original (Partes A y B) cubre cuidado dental solo en circunstancias muy limitadas: cuando el trabajo dental es médicamente necesario como parte de un procedimiento cubierto por separado. Ejemplos:'
              : 'Original Medicare (Parts A and B) covers dental care only in very limited circumstances: when the dental work is medically necessary as part of a separately covered procedure. Examples:'}
          </p>

          <ul>
            <li>{isEs ? 'Reconstrucción de mandíbula después de un accidente o cirugía por cáncer de mandíbula' : 'Jaw reconstruction after an accident or jaw cancer surgery'}</li>
            <li>{isEs ? 'Preparación dental antes de un trasplante de órgano' : 'Dental prep before an organ transplant'}</li>
            <li>{isEs ? 'Cuidado dental durante hospitalización por una condición médica cubierta' : 'Hospital-based dental services during admission for a covered medical condition'}</li>
            <li>{isEs ? 'Cuidado dental requerido para tratamiento de radiación' : 'Dental care required for radiation treatment'}</li>
          </ul>

          <p>
            {isEs
              ? 'Limpiezas rutinarias, empastes, coronas, dentaduras y extracciones NO están cubiertas bajo Medicare Original, incluso si su dentista las llama "necesarias."'
              : 'Routine cleanings, fillings, crowns, dentures, and extractions are NOT covered under Original Medicare, even if your dentist calls them "necessary."'}
          </p>
        </div>

        {/* Mid-article CTA */}
        <ScreenerCTA locale={locale} slug="medicare-dental-mid" variant="inline" />

        <div className="article-content">
          <h2>{isEs ? 'Cobertura dental de Medicare Advantage en 2026' : 'Medicare Advantage Dental Coverage in 2026'}</h2>

          <p>
            {isEs
              ? 'A diferencia de Medicare Original, muchos planes Medicare Advantage (Parte C) incluyen cobertura dental como un beneficio suplementario. Sin embargo, los detalles varían dramáticamente:'
              : 'Unlike Original Medicare, many Medicare Advantage (Part C) plans include dental coverage as a supplemental benefit. However, the specifics vary dramatically:'}
          </p>

          <ul>
            <li>{isEs
              ? 'Cobertura preventiva común: 2 limpiezas al año, radiografías rutinarias, exámenes orales.'
              : 'Common preventive coverage: 2 cleanings per year, routine X-rays, oral exams.'}</li>
            <li>{isEs
              ? 'Trabajo básico común: empastes, extracciones simples.'
              : 'Common basic coverage: fillings, simple extractions.'}</li>
            <li>{isEs
              ? 'Trabajo mayor a menudo limitado o excluido: coronas, dentaduras, puentes, implantes.'
              : 'Major work often limited or excluded: crowns, dentures, bridges, implants.'}</li>
            <li>{isEs
              ? 'Topes anuales: típicamente $1,000 a $5,000, una vez que alcanza el tope, paga 100%.'
              : 'Annual caps: typically $1,000 to $5,000, once you hit the cap, you pay 100%.'}</li>
            <li>{isEs
              ? 'Períodos de espera para trabajo mayor: a menudo 6 a 12 meses.'
              : 'Waiting periods for major work: often 6 to 12 months.'}</li>
          </ul>

          <h2>{isEs ? 'Alternativas si necesita cobertura dental' : 'Alternatives If You Need Dental Coverage'}</h2>

          <p>
            {isEs
              ? 'Si Medicare no cubre la atención dental que necesita, tiene cinco opciones principales para considerar:'
              : 'If Medicare does not cover the dental care you need, you have five main options to consider:'}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Alternativas de cobertura dental para beneficiarios de Medicare' : 'Dental coverage alternatives for Medicare beneficiaries'}
              headers={alternativesHeaders}
              rows={alternativesRows}
              footnote={isEs
                ? 'Los planes de descuento dental NO son seguro y no tienen máximos anuales pero ofrecen tasas con descuento. Los FQHC ofrecen escalas móviles basadas en ingresos.'
                : 'Dental discount plans are NOT insurance and have no annual maximums but offer discounted rates. FQHCs offer sliding scales based on income.'}
              source="Medicare.gov, HRSA, DentalPlans.com"
            />
          </div>

          <h2>{isEs ? 'Estrategia dual elegible: máxima cobertura dental' : 'Dual-Eligible Strategy: Maximum Dental Coverage'}</h2>

          <p>
            {isEs
              ? 'Si su ingreso está por debajo del límite de Medicaid de su estado, califique para Medicaid junto con Medicare. La mayoría de los estados cubren dental como un beneficio de Medicaid, incluyendo limpiezas, empastes y a menudo dentaduras. Esto le da la cobertura dental más completa disponible, gratis. Alrededor de 12 millones de estadounidenses son elegibles dualmente.'
              : 'If your income is below your state\'s Medicaid limit, you qualify for Medicaid alongside Medicare. Most states cover dental as a Medicaid benefit, including cleanings, fillings, and often dentures. This gives you the most comprehensive dental coverage available, free. About 12 million Americans are dual-eligible.'}
          </p>

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
        <ScreenerCTA locale={locale} slug="medicare-dental-end" variant="inline" />

        {/* Related Q&A links */}
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
              href={`/${locale}/medicaid-income-limits`}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--teal-dark)' }}
            >
              {isEs ? 'Límites de Ingresos de Medicaid' : 'Medicaid Income Limits'}
            </Link>
            <Link
              href={`/${locale}/federal-poverty-level`}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--teal-dark)' }}
            >
              {isEs ? 'Tabla del FPL 2026' : '2026 FPL Chart'}
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
              <a href="https://www.medicare.gov/coverage/dental-services" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                Medicare.gov: dental services coverage.
              </a>
            </li>
            <li>
              2.{' '}
              <a href="https://www.kff.org/medicare/issue-brief/medicare-and-dental-coverage-a-closer-look/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                KFF: Medicare and Dental Coverage analysis.
              </a>
            </li>
            <li>
              3.{' '}
              <a href="https://www.medicaid.gov/medicaid/benefits/dental-care/index.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                Medicaid.gov: state-by-state dental benefit overview.
              </a>
            </li>
          </ol>
        </div>
      </article>
    </main>
  );
}
