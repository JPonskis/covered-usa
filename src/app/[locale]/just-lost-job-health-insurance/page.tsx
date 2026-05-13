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
const READING_TIME = '6 min read';
const BASE_URL = 'https://coveredusa.org';

const FAQS_EN = [
  {
    question: 'How long do I have to get health insurance after losing my job?',
    answer: 'You have 60 days from your last day of job-based coverage to enroll in an ACA marketplace plan during the Loss-of-Coverage Special Enrollment Period (SEP). You can also enroll in Medicaid any time year-round. COBRA gives you 60 days to elect continuation of your old plan.',
  },
  {
    question: 'Is COBRA worth it after job loss?',
    answer: 'Usually no. COBRA charges 102% of the full premium (employer plus employee share). For a typical family plan, that\'s often $1,500 to $2,500 per month. ACA marketplace plans with income-based subsidies are almost always cheaper, especially after a drop in income. The exceptions: you have ongoing treatment with a provider not in any marketplace network, or you have a large deductible already met for the year.',
  },
  {
    question: 'Can I get Medicaid if I just lost my job?',
    answer: 'Yes, if your new household income is under 138% FPL in expansion states (about $22,024 single, $45,540 family of 4 in 2026). Apply year-round through your state Medicaid agency or healthcare.gov. If your former salary was high but you have no income now, you typically qualify based on your current monthly income, not your annual.',
  },
  {
    question: 'Does unemployment income count toward ACA subsidy eligibility?',
    answer: 'Yes. Include unemployment compensation in your projected annual household income when applying for ACA subsidies. The marketplace uses Modified Adjusted Gross Income (MAGI), which includes unemployment benefits.',
  },
  {
    question: 'What if I miss the 60-day Special Enrollment Period?',
    answer: 'If you miss the 60-day SEP after losing job coverage, you typically have to wait until the next ACA Open Enrollment Period (November 1 to January 15 for 2026 coverage) unless another qualifying event occurs. Medicaid enrollment, however, is year-round and not affected by SEP deadlines.',
  },
  {
    question: 'Can my spouse add me to their employer plan after I lose my job?',
    answer: 'Yes. Losing job-based coverage is a qualifying event under your spouse\'s employer plan too. You typically have 30 days to enroll under your spouse\'s plan. This is often the cheapest option if your spouse has employer coverage available.',
  },
  {
    question: 'Does losing self-employment count as losing job coverage?',
    answer: 'Yes, if you had a Marketplace plan as a self-employed person and lose income to the point where you qualify for Medicaid, that is a qualifying life event. Self-employment transitions to unemployment also trigger the 60-day SEP for marketplace enrollment.',
  },
  {
    question: 'What about my children\'s coverage?',
    answer: 'Your children may qualify for CHIP (Children\'s Health Insurance Program) at incomes up to 200-300% FPL depending on your state, even if you do not qualify for Medicaid yourself. CHIP enrollment is year-round and premiums are very low or free.',
  },
];

const FAQS_ES = [
  {
    question: '¿Cuánto tiempo tengo para obtener seguro médico después de perder mi trabajo?',
    answer: 'Tiene 60 días desde su último día de cobertura del trabajo para inscribirse en un plan del mercado ACA durante el Período de Inscripción Especial (SEP). También puede inscribirse en Medicaid todo el año. COBRA le da 60 días para elegir continuación de su plan anterior.',
  },
  {
    question: '¿Vale la pena COBRA después de perder el trabajo?',
    answer: 'Usualmente no. COBRA cobra el 102% de la prima completa (parte del empleador más la del empleado). Para un plan familiar típico, eso es $1,500 a $2,500 al mes. Los planes del ACA con subsidios basados en ingresos son casi siempre más baratos.',
  },
  {
    question: '¿Puedo obtener Medicaid si acabo de perder mi trabajo?',
    answer: 'Sí, si su nuevo ingreso del hogar está bajo el 138% FPL en estados con expansión (alrededor de $22,024 individual, $45,540 familia de 4 en 2026). Aplique todo el año a través de la agencia estatal de Medicaid o healthcare.gov.',
  },
  {
    question: '¿Los ingresos por desempleo cuentan para los subsidios del ACA?',
    answer: 'Sí. Incluya la compensación por desempleo en su ingreso anual proyectado al solicitar subsidios del ACA. El mercado usa el Ingreso Bruto Ajustado Modificado (MAGI), que incluye los beneficios por desempleo.',
  },
  {
    question: '¿Qué pasa si pierdo el Período de Inscripción Especial de 60 días?',
    answer: 'Si pierde el SEP de 60 días después de perder la cobertura del trabajo, típicamente tiene que esperar hasta el siguiente Período de Inscripción Abierta (1 de noviembre al 15 de enero para cobertura 2026). La inscripción en Medicaid es todo el año.',
  },
  {
    question: '¿Puede mi cónyuge agregarme a su plan del empleador después de perder mi trabajo?',
    answer: 'Sí. Perder la cobertura del trabajo es un evento calificado bajo el plan del empleador de su cónyuge. Típicamente tiene 30 días para inscribirse. A menudo es la opción más barata.',
  },
  {
    question: '¿Perder un trabajo por cuenta propia cuenta como perder cobertura del trabajo?',
    answer: 'Sí, si tenía un plan del Mercado como persona por cuenta propia y pierde ingresos al punto de calificar para Medicaid, eso es un evento calificado.',
  },
  {
    question: '¿Qué pasa con la cobertura de mis hijos?',
    answer: 'Sus hijos pueden calificar para CHIP en ingresos de hasta 200-300% FPL según su estado, aunque usted no califique para Medicaid. La inscripción de CHIP es todo el año y las primas son muy bajas o gratuitas.',
  },
];

const STEPS_EN = [
  {
    name: 'Calculate your new household income',
    text: 'Use only what you will actually earn going forward, not your old salary. If you will be on unemployment, count that. ACA subsidies are based on projected annual income. Lower projected income equals larger subsidy.',
  },
  {
    name: 'Check if you qualify for Medicaid',
    text: 'In Medicaid expansion states, anyone under 138% FPL qualifies. For 2026 that is $22,024 single or $45,540 for a family of 4. Apply year-round through healthcare.gov or your state Medicaid agency. Medicaid is free coverage with comprehensive benefits.',
  },
  {
    name: 'If not Medicaid, compare ACA marketplace plans',
    text: 'Use the Special Enrollment Period for 60 days from your coverage loss date. Most people qualify for premium tax credits that make Silver plans $10 to $100 per month. Compare networks carefully against your existing providers.',
  },
  {
    name: 'Consider COBRA as a fallback only',
    text: 'COBRA charges 102% of the full premium. Often $700 to $2,000 monthly. Only worth it if you have ongoing treatment with a specific provider not in any ACA network, or if you have already met a large deductible for the year.',
  },
  {
    name: 'Enroll within 60 days',
    text: 'Miss the SEP window and you may have to wait until November Open Enrollment unless another qualifying event occurs. Medicaid does not have this deadline, but every other option does.',
  },
];

const STEPS_ES = [
  {
    name: 'Calcule su nuevo ingreso del hogar',
    text: 'Use solo lo que realmente ganará en adelante, no su salario anterior. Si estará con desempleo, cuéntelo. Los subsidios del ACA se basan en el ingreso anual proyectado.',
  },
  {
    name: 'Verifique si califica para Medicaid',
    text: 'En estados con expansión, cualquier persona bajo el 138% FPL califica. Para 2026, eso es $22,024 individual o $45,540 familia de 4. Aplique todo el año a través de healthcare.gov o su agencia estatal de Medicaid.',
  },
  {
    name: 'Si no es Medicaid, compare planes del mercado ACA',
    text: 'Use el Período de Inscripción Especial por 60 días desde la fecha de pérdida de cobertura. La mayoría de personas califica para créditos fiscales que hacen los planes Silver de $10 a $100 al mes.',
  },
  {
    name: 'Considere COBRA solo como respaldo',
    text: 'COBRA cobra el 102% de la prima completa. A menudo $700 a $2,000 al mes. Solo vale la pena si tiene tratamiento continuo con un proveedor específico fuera de cualquier red ACA.',
  },
  {
    name: 'Inscríbase en 60 días',
    text: 'Si pierde la ventana del SEP, puede que tenga que esperar hasta la Inscripción Abierta de noviembre. Medicaid no tiene esta fecha límite.',
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  return {
    title: isEs
      ? '¿Acaba de Perder Su Trabajo? Opciones de Seguro Médico en 2026 | CoveredUSA'
      : 'Just Lost Your Job? Health Insurance Options in 2026 | CoveredUSA',
    description: isEs
      ? 'Tiene 60 días para inscribirse en cobertura después de perder seguro médico del trabajo. Compare Medicaid, planes del mercado ACA con subsidios, y COBRA.'
      : 'You have 60 days to enroll in coverage after losing job-based health insurance. Compare Medicaid, ACA marketplace plans with subsidies, and COBRA.',
    alternates: {
      canonical: `https://coveredusa.org/${locale}/just-lost-job-health-insurance`,
      languages: {
        en: 'https://coveredusa.org/en/just-lost-job-health-insurance',
        es: 'https://coveredusa.org/es/just-lost-job-health-insurance',
      },
    },
  };
}

export default async function LostJobHealthInsurancePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEs = locale === 'es';
  const faqs = isEs ? FAQS_ES : FAQS_EN;
  const steps = isEs ? STEPS_ES : STEPS_EN;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? '¿Acaba de Perder Su Trabajo?' : 'Just Lost Your Job?', url: `/${locale}/just-lost-job-health-insurance` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/just-lost-job-health-insurance`,
    name: isEs ? 'Opciones de Seguro Médico Después de Perder el Trabajo (2026)' : 'Health Insurance Options After Losing Your Job (2026)',
    description: isEs
      ? 'Guía paso a paso para obtener cobertura de salud después de perder seguro del trabajo en 2026, incluyendo elegibilidad de Medicaid, subsidios del ACA y comparación con COBRA.'
      : 'Step-by-step guide to getting health coverage after losing job-based insurance in 2026, including Medicaid eligibility, ACA subsidies, and COBRA comparison.',
    lastReviewed: LAST_UPDATED_DATE,
    about: 'Special Enrollment Period',
    audience: 'Consumer',
    medicalSpecialty: 'PublicHealth',
  });

  // HowTo schema (inline since the existing getHowToSchema is hardcoded for the screener)
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: isEs
      ? 'Cómo obtener seguro médico después de perder su trabajo'
      : 'How to Get Health Insurance After Losing Your Job',
    description: isEs
      ? 'Pasos para inscribirse en cobertura de salud dentro de la ventana de 60 días después de perder seguro del trabajo.'
      : 'Steps to enroll in health coverage within the 60-day window after losing job-based insurance.',
    totalTime: 'P60D',
    url: `${BASE_URL}/${locale}/just-lost-job-health-insurance`,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };

  // Options comparison table
  const optionsHeaders = isEs
    ? ['Opción', 'Costo típico', 'Mejor para', 'Fecha límite']
    : ['Option', 'Typical cost', 'Best for', 'Deadline'];

  const optionsRows: ReferenceTableCell[][] = [
    [
      isEs ? 'Mercado ACA' : 'ACA Marketplace',
      isEs ? '$10 a $300/mes (con subsidios)' : '$10 to $300/mo (with subsidies)',
      isEs ? 'La mayoría de personas que pierden cobertura del trabajo' : 'Most people losing job coverage',
      isEs ? 'SEP de 60 días' : '60-day SEP',
    ],
    [
      'Medicaid',
      isEs ? 'Gratis o casi gratis' : 'Free or near-free',
      isEs ? 'Ingreso bajo 138% FPL' : 'Income under 138% FPL',
      isEs ? 'Todo el año' : 'Year-round',
    ],
    [
      'COBRA',
      isEs ? '$500 a $2,000+/mes' : '$500 to $2,000+/mo',
      isEs ? 'Necesita mantener proveedores/tratamiento actuales' : 'Need to keep current providers/treatment',
      isEs ? '60 días desde pérdida' : '60 days from loss',
    ],
    [
      isEs ? 'Plan de cónyuge' : 'Spouse\'s plan',
      isEs ? 'Varía (a menudo más barato)' : 'Varies (often cheaper)',
      isEs ? 'Casado con cónyuge empleado' : 'Married with employed spouse',
      isEs ? '30 días desde pérdida' : '30 days from loss',
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      {/* Article Header */}
      <div className="warm-texture border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="category-tag">{isEs ? 'Evento de Vida' : 'Life Event'}</span>
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
            {isEs ? '¿Acaba de Perder Su Trabajo? Aquí Están Sus Opciones de Seguro Médico' : 'Just Lost Your Job? Here Are Your Health Insurance Options'}
          </h1>

          <p
            className="text-lg md:text-xl leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}
          >
            {isEs
              ? 'Tiene 60 días desde su último día de cobertura para inscribirse en un nuevo plan. La mayoría de personas pagan mucho menos de lo que esperan.'
              : 'You have 60 days from your last day of coverage to enroll in a new plan. Most people pay way less than they expect.'}
          </p>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Urgency callout */}
        <div
          className="mb-6 px-5 py-4 rounded-xl flex items-start gap-3"
          style={{ background: 'var(--accent-lightest)', borderLeft: '4px solid var(--accent)' }}
        >
          <span aria-hidden="true" className="text-xl leading-none" style={{ color: 'var(--accent)' }}>!</span>
          <div>
            <p
              className="font-bold text-base mb-1"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              {isEs ? 'Tiene 60 días desde la fecha de pérdida' : 'You have 60 days from coverage loss date'}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              {isEs
                ? 'Si pierde esa ventana, podría tener que esperar hasta la próxima Inscripción Abierta de noviembre.'
                : 'Miss that window and you may have to wait until next November\'s Open Enrollment.'}
            </p>
          </div>
        </div>

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
              ? 'Cuando pierde el seguro médico del trabajo, activa un Período de Inscripción Especial de 60 días. Sus tres opciones principales son: (1) plan del mercado ACA con subsidios (usualmente la más barata, $10 a $300/mes después de subsidios), (2) Medicaid si su nuevo ingreso califica (gratis), o (3) continuación COBRA (mantiene su plan anterior a la prima completa, a menudo $700 a $2,000/mes). La mayoría de personas en esta situación califican para subsidios importantes que hacen los planes del mercado mucho más baratos que COBRA.'
              : 'When you lose job-based health insurance, you trigger a 60-day Special Enrollment Period. Your three main options are: (1) ACA marketplace plan with subsidies (usually cheapest, $10 to $300/mo after subsidies), (2) Medicaid if your new income qualifies (free), or (3) COBRA continuation (keeps your old plan at full premium, often $700 to $2,000/mo). Most people in this situation qualify for major subsidies that make marketplace plans much cheaper than COBRA.'}
          </p>
        </blockquote>

        <div className="article-content">
          <BlogDropCap />

          <p>
            {isEs
              ? 'Perder un trabajo es estresante. Perder su seguro médico al mismo tiempo es aterrador. La buena noticia: el sistema de salud de EE.UU. tiene un período de inscripción especial diseñado exactamente para este escenario, y la mayoría de personas terminan pagando mucho menos por cobertura de lo que pagaban a través de su empleador.'
              : 'Losing a job is stressful. Losing your health insurance at the same time is terrifying. The good news: the US health system has a special enrollment period designed exactly for this scenario, and most people end up paying way less for coverage than they did through their employer.'}
          </p>

          <p>
            {isEs
              ? 'Esta guía cubre los 5 pasos para inscribirse en nueva cobertura dentro de la ventana de 60 días, cómo comparar sus opciones, y los errores comunes que la gente comete que cuestan miles.'
              : 'This guide covers the 5 steps to enroll in new coverage within the 60-day window, how to compare your options, and the common mistakes people make that cost thousands.'}
          </p>

          <h2>{isEs ? '5 pasos para obtener cobertura después de perder su trabajo' : '5 Steps to Get Coverage After Losing Your Job'}</h2>

          <ol>
            {steps.map((step, i) => (
              <li key={i}>
                <strong>{step.name}.</strong> {step.text}
              </li>
            ))}
          </ol>

          <h2>{isEs ? 'Compare sus opciones' : 'Compare Your Options'}</h2>

          <p>
            {isEs
              ? 'Aquí está cómo se comparan las cuatro opciones principales para 2026:'
              : 'Here is how the four main options compare for 2026:'}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Opciones de seguro médico después de pérdida de trabajo (2026)' : 'Health insurance options after job loss (2026)'}
              headers={optionsHeaders}
              rows={optionsRows}
              footnote={isEs
                ? 'Los costos del mercado ACA dependen de su nuevo ingreso. Medicaid es gratuito si califica. COBRA es casi siempre el más caro.'
                : 'ACA marketplace costs depend on your new income. Medicaid is free if you qualify. COBRA is almost always the most expensive.'}
              source="healthcare.gov, Medicaid.gov, IRS COBRA guidance"
            />
          </div>
        </div>

        {/* Mid-article CTA */}
        <ScreenerCTA locale={locale} slug="lost-job-mid" variant="inline" />

        <div className="article-content">
          <h2>{isEs ? 'Errores comunes que cuestan a la gente miles' : 'Common Mistakes That Cost People Thousands'}</h2>

          <ul>
            <li>{isEs
              ? 'Defaultar a COBRA sin comparar. COBRA es casi siempre mucho más caro que los planes del mercado con subsidios.'
              : 'Defaulting to COBRA without comparing. COBRA is almost always much more expensive than marketplace plans with subsidies.'}</li>
            <li>{isEs
              ? 'Reportar su salario antiguo en lugar del ingreso proyectado. El mercado calcula los subsidios basado en lo que ganará el resto del año, no lo que ganó cuando estaba empleado.'
              : 'Reporting your old salary instead of projected income. The marketplace calculates subsidies based on what you will earn the rest of the year, not what you earned while employed.'}</li>
            <li>{isEs
              ? 'Olvidar contar los beneficios por desempleo. La compensación por desempleo cuenta como ingreso para el cálculo de subsidios del ACA.'
              : 'Forgetting to count unemployment benefits. Unemployment compensation counts as income for ACA subsidy calculations.'}</li>
            <li>{isEs
              ? 'Perder la ventana de 60 días. Sin SEP, está atascado hasta noviembre.'
              : 'Missing the 60-day window. Without the SEP, you are stuck until November.'}</li>
            <li>{isEs
              ? 'No verificar la cobertura de Medicaid primero. Si su nuevo ingreso califica para Medicaid, eso es cobertura completa gratuita.'
              : 'Not checking Medicaid first. If your new income qualifies for Medicaid, that is free comprehensive coverage.'}</li>
          </ul>

          <h2>{isEs ? 'Sobre subsidios del mercado ACA' : 'About ACA Marketplace Subsidies'}</h2>

          <p>
            {isEs
              ? 'Para 2026, los hogares con ingresos de hasta el 400% del Nivel Federal de Pobreza ($60,240 individual / $132,000 familia de 4) pueden calificar para créditos fiscales por prima. Si pierde un trabajo y sus ingresos caen sustancialmente, casi siempre califica para algún subsidio. El subsidio reduce su prima mensual antes de que la pague. Para muchas personas que pierden trabajos, los planes Silver del mercado terminan costando $10 a $100 por mes.'
              : 'For 2026, households earning up to 400% of the Federal Poverty Level ($60,240 single / $132,000 family of 4) may qualify for premium tax credits. If you lose a job and your income drops substantially, you almost always qualify for some subsidy. The subsidy reduces your monthly premium before you pay it. For many people losing jobs, Silver marketplace plans end up costing $10 to $100 per month.'}
          </p>

          <h2>{isEs ? 'Cuándo COBRA realmente vale la pena' : 'When COBRA Actually Makes Sense'}</h2>

          <p>
            {isEs
              ? 'COBRA tiene un nicho legítimo, pero es estrecho. Considere COBRA si: tiene tratamiento continuo (cáncer, tratamiento de fertilidad, salud mental) con un proveedor específico que no está en ninguna red del mercado, ya cumplió un deducible alto este año y obtendrá la cobertura del 100% por el resto del año, o necesita exactamente la cobertura que tenía (algunos beneficios cosméticos o terapias específicas que los planes del mercado no cubren). De lo contrario, COBRA es típicamente la opción más cara.'
              : 'COBRA has a legitimate niche, but it is narrow. Consider COBRA if: you have ongoing treatment (cancer, fertility, mental health) with a specific provider not in any marketplace network, you already met a large deductible this year and will get 100% coverage for the rest of the year, or you need exactly the coverage you had (some cosmetic benefits or specific therapies that marketplace plans do not cover). Otherwise, COBRA is typically the most expensive option.'}
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
        <ScreenerCTA locale={locale} slug="lost-job-end" variant="inline" />

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
              href={`/${locale}/aca-income-limits`}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--teal-dark)' }}
            >
              {isEs ? 'Límites de Ingresos ACA 2026' : 'ACA Income Limits 2026'}
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
              <a href="https://www.healthcare.gov/quick-guide/dates-and-deadlines/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                HealthCare.gov: enrollment dates and deadlines.
              </a>
            </li>
            <li>
              2.{' '}
              <a href="https://www.healthcare.gov/screener/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                HealthCare.gov: Special Enrollment Period screener.
              </a>
            </li>
            <li>
              3.{' '}
              <a href="https://www.medicaid.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                Medicaid.gov: state-by-state eligibility and enrollment.
              </a>
            </li>
            <li>
              4.{' '}
              <a href="https://www.dol.gov/general/topic/health-plans/cobra" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                US Department of Labor: COBRA Continuation Coverage.
              </a>
            </li>
          </ol>
        </div>
      </article>
    </main>
  );
}
