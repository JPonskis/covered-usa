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
  ScreenerCTA,
  type ReferenceTableCell,
} from '@/components/reference';
import BlogDropCap from '@/components/BlogDropCap';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const LAST_UPDATED_DATE = '2026-05-12';
const READING_TIME = '7 min read';

const FAQS_EN = [
  {
    question: 'Can I have both Medicaid and Medicare?',
    answer: 'Yes. About 12 million Americans are dual-eligible for both Medicaid and Medicare. Dual eligibility typically applies to people who are 65 or older (or disabled) and have low income. When you have both, Medicare pays first for covered services, and Medicaid picks up the rest, including Medicare premiums, deductibles, and coinsurance.',
  },
  {
    question: 'Which is better, Medicaid or Medicare?',
    answer: 'Neither is "better" — they cover different populations. Your eligibility determines which you can get. Medicaid is income-based for any age. Medicare is age- or disability-based regardless of income. If you qualify for both, you get the most comprehensive coverage possible.',
  },
  {
    question: 'Is Medicaid free?',
    answer: 'Usually yes. Most Medicaid enrollees pay $0 for coverage. Some states charge small copays ($1-$4) for non-emergency services. Children, pregnant women, and people with disabilities almost never pay anything.',
  },
  {
    question: 'How much does Medicare cost in 2026?',
    answer: 'Original Medicare has multiple costs in 2026. Part A is free for most people (premium for those without enough work history). Part B is $202.90/month standard premium with a $283 annual deductible. Part D drug coverage averages $38.99/month. Higher-income enrollees pay IRMAA surcharges up to an additional $324.60/month for Part B.',
  },
  {
    question: 'What does Medicaid cover that Medicare does not?',
    answer: 'Medicaid covers long-term care (nursing home and home-based services), most dental, vision, hearing aids, and many transportation services to medical appointments. Original Medicare does NOT cover any of those. Medicare Advantage plans often include limited dental and vision, but never long-term care.',
  },
  {
    question: 'Can a 30-year-old get Medicare?',
    answer: 'Only if you have a qualifying disability. People under 65 can get Medicare if they have received Social Security Disability Insurance (SSDI) for 24 months, have End-Stage Renal Disease (ESRD), or have ALS (Lou Gehrig\'s disease). Otherwise, age 65 is the standard threshold.',
  },
  {
    question: 'I have Medicaid now. What happens when I turn 65?',
    answer: 'You become eligible for Medicare at 65 and can keep Medicaid if your income still qualifies. This makes you dual-eligible — you get the most comprehensive coverage available. Apply for Medicare during your Initial Enrollment Period (3 months before to 3 months after your 65th birthday) to avoid penalties.',
  },
  {
    question: 'Do all states have the same Medicaid rules?',
    answer: 'No. Each state runs its own Medicaid program with federal oversight. In Medicaid expansion states (41 states plus D.C. as of 2026), adults qualify up to 138% FPL. In non-expansion states (Texas, Florida, Mississippi, Wyoming, Kansas, South Carolina, Tennessee, Wisconsin, and Alabama), eligibility is much stricter — often limited to children, pregnant women, and people with disabilities.',
  },
];

const FAQS_ES = [
  {
    question: '¿Puedo tener tanto Medicaid como Medicare?',
    answer: 'Sí. Alrededor de 12 millones de estadounidenses son elegibles dualmente. La elegibilidad dual típicamente aplica a personas mayores de 65 (o con discapacidad) con bajos ingresos. Medicare paga primero por los servicios cubiertos, y Medicaid cubre el resto.',
  },
  {
    question: '¿Cuál es mejor, Medicaid o Medicare?',
    answer: 'Ninguno es "mejor" — cubren poblaciones diferentes. Su elegibilidad determina cuál puede obtener. Medicaid es basado en ingresos para cualquier edad. Medicare es basado en edad o discapacidad sin importar los ingresos.',
  },
  {
    question: '¿Medicaid es gratis?',
    answer: 'Usualmente sí. La mayoría de los inscritos en Medicaid pagan $0. Algunos estados cobran copagos pequeños ($1-$4) por servicios no de emergencia.',
  },
  {
    question: '¿Cuánto cuesta Medicare en 2026?',
    answer: 'Medicare Original tiene varios costos en 2026. La Parte A es gratis para la mayoría. La Parte B es $202.90/mes con un deducible anual de $283. La Parte D promedia $38.99/mes. Los inscritos de mayores ingresos pagan recargos IRMAA.',
  },
  {
    question: '¿Qué cubre Medicaid que Medicare no cubre?',
    answer: 'Medicaid cubre cuidado a largo plazo (hogar de ancianos y servicios en el hogar), la mayoría de dental, visión, audífonos y muchos servicios de transporte. Medicare Original NO cubre nada de eso.',
  },
  {
    question: '¿Puede un trabajador de 30 años obtener Medicare?',
    answer: 'Solo si tiene una discapacidad calificada. Las personas menores de 65 pueden obtener Medicare si han recibido SSDI por 24 meses, tienen Enfermedad Renal en Etapa Terminal (ESRD), o tienen ELA.',
  },
  {
    question: 'Tengo Medicaid ahora. ¿Qué pasa cuando cumpla 65?',
    answer: 'Se vuelve elegible para Medicare a los 65 y puede mantener Medicaid si su ingreso aún califica. Esto le hace elegible dual — obtiene la cobertura más completa disponible.',
  },
  {
    question: '¿Todos los estados tienen las mismas reglas de Medicaid?',
    answer: 'No. Cada estado dirige su propio programa con supervisión federal. En estados con expansión (41 estados más D.C. en 2026), los adultos califican hasta 138% FPL. En estados sin expansión, la elegibilidad es mucho más estricta.',
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  return {
    title: isEs
      ? 'Medicaid vs. Medicare: ¿Cuál es la Diferencia? (2026) | CoveredUSA'
      : 'Medicaid vs. Medicare: What\'s the Difference? (2026) | CoveredUSA',
    description: isEs
      ? 'Medicaid es basado en ingresos. Medicare es basado en edad o discapacidad. Compare elegibilidad, costo, cobertura, e inscripción para 2026. Más cómo calificar para ambos.'
      : 'Medicaid is income-based. Medicare is age- or disability-based. Compare eligibility, cost, coverage, and enrollment for 2026. Plus how to qualify for both.',
    alternates: {
      canonical: `https://coveredusa.org/${locale}/medicaid-vs-medicare`,
      languages: {
        en: 'https://coveredusa.org/en/medicaid-vs-medicare',
        es: 'https://coveredusa.org/es/medicaid-vs-medicare',
      },
    },
  };
}

export default async function MedicaidVsMedicarePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEs = locale === 'es';
  const faqs = isEs ? FAQS_ES : FAQS_EN;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Comparar' : 'Compare', url: `/${locale}/compare` },
    { name: 'Medicaid vs. Medicare', url: `/${locale}/medicaid-vs-medicare` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/medicaid-vs-medicare`,
    name: isEs ? 'Medicaid vs. Medicare: Comparación 2026' : 'Medicaid vs. Medicare: 2026 Comparison',
    description: isEs
      ? 'Comparación lado a lado de Medicaid y Medicare para 2026, incluyendo elegibilidad, costo, cobertura y guía de decisión.'
      : 'Side-by-side comparison of Medicaid and Medicare for 2026, including eligibility, cost, coverage, and decision guide.',
    lastReviewed: LAST_UPDATED_DATE,
    about: 'Health Insurance Programs',
    audience: 'Consumer',
    medicalSpecialty: 'PublicHealth',
  });

  // Comparison table
  const compareHeaders = isEs
    ? ['Característica', 'Medicaid', 'Medicare']
    : ['Feature', 'Medicaid', 'Medicare'];

  const compareRows: ReferenceTableCell[][] = [
    [
      isEs ? 'Elegibilidad' : 'Eligibility',
      isEs ? 'Basado en ingresos, cualquier edad' : 'Income-based, any age',
      isEs ? '65+ o con discapacidad calificada' : '65+ or qualifying disability',
    ],
    [
      isEs ? 'Costo' : 'Cost',
      isEs ? 'Gratis o mínimo' : 'Free or minimal',
      isEs ? 'Parte A gratis, Parte B $202.90/mes (2026)' : 'Part A free, Part B $202.90/month (2026)',
    ],
    [
      isEs ? 'Cuidado a largo plazo' : 'Long-term care',
      { value: isEs ? 'Cubierto' : 'Covered', status: 'yes' as const },
      { value: isEs ? 'No cubierto' : 'Not covered', status: 'no' as const },
    ],
    [
      isEs ? 'Dental' : 'Dental',
      { value: isEs ? 'Cubierto (mayoría de estados)' : 'Covered (most states)', status: 'yes' as const },
      { value: isEs ? 'No cubierto (Original Medicare)' : 'Not covered (Original Medicare)', status: 'no' as const },
    ],
    [
      isEs ? 'Visión' : 'Vision',
      { value: isEs ? 'Cubierto (mayoría de estados)' : 'Covered (most states)', status: 'yes' as const },
      { value: isEs ? 'No cubierto' : 'Not covered', status: 'no' as const },
    ],
    [
      isEs ? 'Cobertura de medicamentos' : 'Drug coverage',
      isEs ? 'Incluido' : 'Included',
      isEs ? 'Parte D separada' : 'Separate Part D',
    ],
    [
      isEs ? 'Ventana de inscripción' : 'Enrollment window',
      isEs ? 'Todo el año' : 'Year-round',
      isEs ? 'Ventanas específicas' : 'Specific windows',
    ],
    [
      isEs ? 'Quién la administra' : 'Who runs it',
      isEs ? 'Estado + federal (varía por estado)' : 'State + federal (varies by state)',
      isEs ? 'Solo federal' : 'Federal only',
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

      {/* Article Header */}
      <div className="warm-texture border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="category-tag">{isEs ? 'Comparación' : 'Comparison'}</span>
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
            {isEs ? 'Medicaid vs. Medicare: ¿Cuál es la Diferencia? (2026)' : 'Medicaid vs. Medicare: What\'s the Difference? (2026)'}
          </h1>

          <p
            className="text-lg md:text-xl leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}
          >
            {isEs
              ? 'Dos programas completamente diferentes que millones de estadounidenses confunden. Uno es basado en ingresos. El otro es basado en edad. Y unos 12 millones de personas tienen ambos.'
              : 'Two completely different programs that millions of Americans confuse. One is income-based. The other is age-based. And about 12 million people have both.'}
          </p>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Quick Answer blockquote */}
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
              ? 'Medicaid es un programa estatal-federal para estadounidenses de bajos ingresos de cualquier edad (138% FPL en estados con expansión a partir de 2026: $22,024 individual / $45,540 familia de 4). Medicare es un programa federal para adultos de 65 años o más y personas con discapacidades calificadas, sin importar el ingreso. Alrededor de 12 millones de estadounidenses son elegibles dualmente para ambos — esto es la cobertura más completa disponible.'
              : 'Medicaid is a state-federal program for low-income Americans of any age (138% FPL in expansion states as of 2026: $22,024 single / $45,540 family of 4). Medicare is a federal program for adults 65+ and people with qualifying disabilities, regardless of income. About 12 million Americans are dual-eligible for both — that\'s the most comprehensive coverage available.'}
          </p>
        </blockquote>

        {/* Side-by-side option cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {/* Medicaid card */}
          <div
            className="rounded-2xl border-2 p-6"
            style={{ borderColor: 'var(--teal)', background: 'white' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text-primary)' }}
              >
                Medicaid
              </h2>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'var(--primary-lightest)', color: 'var(--primary-dark)' }}
              >
                {isEs ? 'Basado en ingresos' : 'Income-based'}
              </span>
            </div>
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}
            >
              {isEs
                ? 'Programa estatal-federal para estadounidenses de bajos ingresos de cualquier edad.'
                : 'State-federal program for low-income Americans of any age.'}
            </p>
            <ul className="space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              <li>{isEs ? '— 138% FPL en estados con expansión' : '— 138% FPL in expansion states'}</li>
              <li>{isEs ? '— Gratis o casi gratis' : '— Free or near-free'}</li>
              <li>{isEs ? '— Cubre LTC, dental, visión' : '— Covers LTC, dental, vision'}</li>
              <li>{isEs ? '— Inscripción todo el año' : '— Year-round enrollment'}</li>
            </ul>
          </div>

          {/* Medicare card */}
          <div
            className="rounded-2xl border-2 p-6"
            style={{ borderColor: 'var(--accent)', background: 'white' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text-primary)' }}
              >
                Medicare
              </h2>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'var(--accent-lightest)', color: 'var(--accent)' }}
              >
                {isEs ? '65+ o discapacidad' : '65+ or disability'}
              </span>
            </div>
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}
            >
              {isEs
                ? 'Programa federal para adultos de 65 años o más y personas con discapacidades calificadas.'
                : 'Federal program for adults 65+ and people with qualifying disabilities.'}
            </p>
            <ul className="space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              <li>{isEs ? '— Parte A gratis (mayoría)' : '— Part A free (most)'}</li>
              <li>{isEs ? '— Parte B $202.90/mes (2026)' : '— Part B $202.90/mo (2026)'}</li>
              <li>{isEs ? '— No cubre LTC, dental, visión' : '— Does NOT cover LTC, dental, vision'}</li>
              <li>{isEs ? '— Ventanas de inscripción específicas' : '— Specific enrollment windows'}</li>
            </ul>
          </div>
        </div>

        <div className="article-content">
          <BlogDropCap />

          <p>
            {isEs
              ? 'A pesar de sonar similares, Medicaid y Medicare son programas completamente diferentes con diferentes elegibilidades, costos, coberturas e inscripciones. La confusión es comprensible — el gobierno usó nombres prácticamente idénticos para dos cosas distintas.'
              : 'Despite sounding similar, Medicaid and Medicare are completely different programs with different eligibility, costs, coverage, and enrollment. The confusion is understandable — the government used practically identical names for two distinct things.'}
          </p>

          <p>
            {isEs
              ? 'Esta guía cubre la comparación lado a lado para 2026, cuándo elegir cada uno, y cómo funciona la elegibilidad dual (cuando califica para ambos).'
              : 'This guide covers the side-by-side comparison for 2026, when to choose each, and how dual eligibility works (when you qualify for both).'}
          </p>

          <h2>{isEs ? 'Comparación lado a lado (2026)' : 'Side-by-Side Comparison (2026)'}</h2>

          <p>
            {isEs
              ? 'Aquí están las diferencias clave entre Medicaid y Medicare para 2026:'
              : 'Here are the key differences between Medicaid and Medicare for 2026:'}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Medicaid vs. Medicare: Comparación 2026' : 'Medicaid vs. Medicare: 2026 Comparison'}
              headers={compareHeaders}
              rows={compareRows}
              footnote={isEs
                ? 'La cobertura de Medicaid varía por estado. Los Medicare Advantage (Parte C) a menudo incluyen dental y visión limitados.'
                : 'Medicaid coverage varies by state. Medicare Advantage (Part C) often includes limited dental and vision.'}
              source="CMS, KFF Medicaid State Profiles 2026"
            />
          </div>

          <h2>{isEs ? 'Quién debe elegir Medicaid' : 'Who Should Choose Medicaid'}</h2>

          <p>
            {isEs
              ? `Si tiene menos de 65 años y sus ingresos están por debajo del 138% FPL (aproximadamente $22,024 individual o $45,540 familia de 4 en 2026), Medicaid es probablemente su mejor opción — y la única gratuita. La cobertura es completa, incluye cuidado a largo plazo y la mayoría de los estados también cubren dental y visión. Aplique a través de su agencia estatal de Medicaid o healthcare.gov. La inscripción es todo el año, no hay ventanas que perder.`
              : `If you are under 65 and your household income is below 138% FPL (roughly $22,024 single or $45,540 family of 4 in 2026), Medicaid is likely your best option — and the only free one. Coverage is comprehensive, includes long-term care, and most states also cover dental and vision. Apply through your state Medicaid agency or healthcare.gov. Enrollment is year-round, no windows to miss.`}
          </p>

          <p>
            {isEs
              ? 'También aplique a Medicaid si está embarazada, si su hijo necesita cobertura, o si tiene una discapacidad — estas categorías a menudo califican con ingresos más altos.'
              : 'Also apply for Medicaid if you are pregnant, if your child needs coverage, or if you have a disability — these categories often qualify at higher incomes.'}
          </p>

          <h2>{isEs ? 'Quién debe elegir Medicare' : 'Who Should Choose Medicare'}</h2>

          <p>
            {isEs
              ? 'Si tiene 65 años o más, o si ha recibido SSDI por 24 meses, Medicare es probablemente su mejor opción — y a menudo es automático. Comience la inscripción durante su Período de Inscripción Inicial (3 meses antes hasta 3 meses después de cumplir 65). Si pierde esa ventana, podría enfrentar penalidades de por vida en las primas de la Parte B y Parte D.'
              : 'If you are 65 or older, or if you have been on SSDI for 24 months, Medicare is likely your best option — and is often automatic. Start enrollment during your Initial Enrollment Period (3 months before to 3 months after your 65th birthday). If you miss that window, you could face lifelong premium penalties on Part B and Part D.'}
          </p>

          <p>
            {isEs
              ? 'Considere agregar un plan Medigap (Suplemento de Medicare) para cubrir el coseguro del 20% de la Parte B, o un plan Medicare Advantage (Parte C) que típicamente incluye dental, visión y medicamentos en un solo plan.'
              : 'Consider adding a Medigap (Medicare Supplement) plan to cover the 20% Part B coinsurance, or a Medicare Advantage (Part C) plan that typically bundles dental, vision, and drug coverage into one plan.'}
          </p>

          <h2>{isEs ? 'Qué pasa si califica para ambos: Doble elegibilidad' : 'What If You Qualify for Both: Dual Eligibility'}</h2>

          <p>
            {isEs
              ? 'Alrededor de 12 millones de estadounidenses son elegibles dualmente — califican tanto para Medicaid como para Medicare. Esto típicamente sucede cuando tiene 65 años o más con ingresos por debajo del límite de Medicaid en su estado, o cuando es discapacitado con bajos ingresos.'
              : 'About 12 million Americans are dual-eligible — they qualify for both Medicaid and Medicare. This typically happens when you are 65+ with income below your state\'s Medicaid limit, or when you are disabled with low income.'}
          </p>

          <p>
            {isEs
              ? 'Cuando tiene ambos: Medicare paga primero por los servicios cubiertos. Medicaid paga lo que Medicare no — primas, deducibles, coseguro, y servicios que Medicare no cubre (LTC, dental, visión). Esta es esencialmente la cobertura más completa disponible en Estados Unidos.'
              : 'When you have both: Medicare pays first for covered services. Medicaid picks up what Medicare doesn\'t — premiums, deductibles, coinsurance, and services Medicare doesn\'t cover (LTC, dental, vision). This is essentially the most comprehensive coverage available in the United States.'}
          </p>

          <p>
            {isEs
              ? 'Para verificar si califica para ambos, complete una solicitud de Medicaid después de inscribirse en Medicare. Su agencia estatal de Medicaid determinará si califica basado en los ingresos y activos.'
              : 'To check whether you qualify for both, fill out a Medicaid application after enrolling in Medicare. Your state Medicaid agency will determine eligibility based on income and assets.'}
          </p>

          <h2>{isEs ? 'Programas de Ahorros de Medicare (MSP): un nivel intermedio' : 'Medicare Savings Programs (MSP): A Middle Tier'}</h2>

          <p>
            {isEs
              ? 'Si tiene Medicare pero su ingreso está demasiado alto para Medicaid total, aún puede calificar para un Programa de Ahorros de Medicare (MSP). Estos programas pagan su prima de la Parte B (y a veces también los deducibles y coseguro). Los límites de ingresos para 2026: QMB $15,960 anual, SLMB $19,152, QI $21,546 — significativamente más altos que el FPL del 100%.'
              : 'If you have Medicare but your income is too high for full Medicaid, you may still qualify for a Medicare Savings Program (MSP). These programs pay your Part B premium (and sometimes deductibles and coinsurance too). 2026 income limits: QMB $15,960/year, SLMB $19,152, QI $21,546 — meaningfully higher than 100% FPL.'}
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

        {/* End CTA — screener funnel for "tell me which one I qualify for" */}
        <ScreenerCTA locale={locale} slug="medicaid-vs-medicare" variant="inline" />

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
              href={`/${locale}/medicaid-income-limits`}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--teal-dark)' }}
            >
              {isEs ? 'Límites de Ingresos Medicaid 2026' : 'Medicaid Income Limits 2026'}
            </Link>
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
              <a href="https://www.medicaid.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                Medicaid.gov — Official program information.
              </a>
            </li>
            <li>
              2.{' '}
              <a href="https://www.medicare.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                Medicare.gov — Official Medicare program details and 2026 costs.
              </a>
            </li>
            <li>
              3.{' '}
              <a href="https://www.kff.org/medicaid/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                KFF — Dual Eligible Beneficiaries: A Profile of the Population
              </a>
            </li>
            <li>
              4.{' '}
              <a href="https://www.cms.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                CMS — Medicare Savings Programs 2026 limits.
              </a>
            </li>
          </ol>
        </div>
      </article>
    </main>
  );
}
