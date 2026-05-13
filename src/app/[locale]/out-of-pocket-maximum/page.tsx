import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import {
  getFAQSchema,
  getBreadcrumbSchema,
  getMedicalWebPageSchema,
  getDefinedTermSchema,
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

// 2026 OOP max limits
const ACA_INDIVIDUAL_2026 = 9200;
const ACA_FAMILY_2026 = 18400;
const HSA_INDIVIDUAL_2026 = 8500;
const HSA_FAMILY_2026 = 17000;

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

const FAQS_EN = [
  {
    question: 'What is the 2026 ACA out-of-pocket maximum?',
    answer: `For 2026, the federal out-of-pocket maximum for ACA marketplace plans is ${fmt(ACA_INDIVIDUAL_2026)} for an individual and ${fmt(ACA_FAMILY_2026)} for a family. These limits are set annually by HHS and apply to non-grandfathered plans inside and outside the marketplace.`,
  },
  {
    question: 'Does the monthly premium count toward the out-of-pocket maximum?',
    answer: 'No. Your monthly premium never counts toward your OOP max. The OOP max only includes payments for covered, in-network healthcare services: deductibles, copays, and coinsurance.',
  },
  {
    question: 'What happens after I hit my out-of-pocket maximum?',
    answer: 'For the rest of that plan year, your insurance pays 100% of covered, in-network services. You still pay your monthly premium, but no further copays, coinsurance, or deductible costs for in-network care.',
  },
  {
    question: 'Does the OOP max reset every year?',
    answer: 'Yes. It resets at the start of each plan year, typically January 1 (or whenever your plan year begins). What you spent toward your OOP max last year does not carry over.',
  },
  {
    question: 'Do out-of-network charges count toward my OOP max?',
    answer: 'Usually no. Most plans only count in-network charges toward the OOP max. If you go out of network, those charges typically count toward a separate (often higher) out-of-network OOP max, or do not count at all. Always check your specific plan.',
  },
  {
    question: 'Does the OOP max apply per person or per family?',
    answer: 'Both, on family plans. Each individual has an embedded individual OOP max (up to the ACA individual limit of $9,200 in 2026). The family OOP max ($18,400 in 2026) applies to the family as a whole. Whichever comes first triggers 100% coverage.',
  },
  {
    question: 'Is the HSA-qualified HDHP out-of-pocket maximum the same as the ACA limit?',
    answer: `No, they are set separately. The IRS sets the HSA-qualified High Deductible Health Plan limits, which are lower than the ACA limits. For 2026, HSA HDHP OOP max is approximately ${fmt(HSA_INDIVIDUAL_2026)} for an individual and ${fmt(HSA_FAMILY_2026)} for a family.`,
  },
];

const FAQS_ES = [
  {
    question: '¿Cuál es el máximo de gastos de bolsillo del ACA para 2026?',
    answer: `Para 2026, el máximo federal de gastos de bolsillo para planes del mercado del ACA es ${fmt(ACA_INDIVIDUAL_2026)} para un individuo y ${fmt(ACA_FAMILY_2026)} para una familia.`,
  },
  {
    question: '¿La prima mensual cuenta para el máximo de gastos de bolsillo?',
    answer: 'No. Su prima mensual nunca cuenta para su OOP max. El OOP max solo incluye pagos por servicios cubiertos en la red: deducibles, copagos y coseguro.',
  },
  {
    question: '¿Qué pasa después de alcanzar mi máximo de gastos de bolsillo?',
    answer: 'Por el resto del año del plan, su seguro paga el 100% de los servicios cubiertos en la red. Aún paga su prima mensual, pero no más copagos, coseguro, ni costos de deducible para atención en la red.',
  },
  {
    question: '¿El OOP max se reinicia cada año?',
    answer: 'Sí. Se reinicia al comienzo de cada año del plan, típicamente el 1 de enero. Lo que gastó hacia su OOP max el año pasado no se transfiere.',
  },
  {
    question: '¿Los cargos fuera de la red cuentan para mi OOP max?',
    answer: 'Usualmente no. La mayoría de los planes solo cuentan los cargos en la red para el OOP max. Si va fuera de la red, esos cargos típicamente cuentan para un OOP max separado (a menudo más alto), o no cuentan en absoluto.',
  },
  {
    question: '¿El OOP max aplica por persona o por familia?',
    answer: 'Ambos, en planes familiares. Cada individuo tiene un OOP max individual embebido (hasta $9,200 en 2026). El OOP max familiar ($18,400 en 2026) aplica a la familia como un todo.',
  },
  {
    question: '¿El OOP max de un HDHP calificado para HSA es el mismo que el límite del ACA?',
    answer: `No, se establecen por separado. El IRS establece los límites del HDHP calificado para HSA. Para 2026, el OOP max del HDHP HSA es aproximadamente ${fmt(HSA_INDIVIDUAL_2026)} para un individuo y ${fmt(HSA_FAMILY_2026)} para una familia.`,
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  return {
    title: isEs
      ? '¿Qué Es un Máximo de Gastos de Bolsillo? Límites 2026 Explicados | CoveredUSA'
      : 'What Is an Out-of-Pocket Maximum? 2026 Limits Explained | CoveredUSA',
    description: isEs
      ? `El máximo de gastos de bolsillo es lo más que paga por atención médica cubierta en un año. Límite ACA 2026: ${fmt(ACA_INDIVIDUAL_2026)} individual, ${fmt(ACA_FAMILY_2026)} familia.`
      : `The out-of-pocket maximum is the most you'll pay for covered care in a year. 2026 ACA limit: ${fmt(ACA_INDIVIDUAL_2026)} individual, ${fmt(ACA_FAMILY_2026)} family.`,
    alternates: {
      canonical: `https://coveredusa.org/${locale}/out-of-pocket-maximum`,
      languages: {
        en: 'https://coveredusa.org/en/out-of-pocket-maximum',
        es: 'https://coveredusa.org/es/out-of-pocket-maximum',
      },
    },
  };
}

export default async function OutOfPocketMaximumPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEs = locale === 'es';
  const faqs = isEs ? FAQS_ES : FAQS_EN;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Máximo de Gastos de Bolsillo' : 'Out-of-Pocket Maximum', url: `/${locale}/out-of-pocket-maximum` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/out-of-pocket-maximum`,
    name: isEs ? '¿Qué Es un Máximo de Gastos de Bolsillo? Límites 2026' : 'What Is an Out-of-Pocket Maximum? 2026 Limits',
    description: isEs
      ? 'Definición del máximo de gastos de bolsillo, límites ACA 2026, qué cuenta y qué no, y cómo funciona en planes familiares.'
      : 'Definition of out-of-pocket maximum, 2026 ACA limits, what counts toward it, and how it works on family plans.',
    lastReviewed: LAST_UPDATED_DATE,
    about: 'Out-of-Pocket Maximum',
    audience: 'Consumer',
    medicalSpecialty: 'PublicHealth',
  });
  const definedTermSchema = getDefinedTermSchema({
    name: isEs ? 'Máximo de Gastos de Bolsillo' : 'Out-of-Pocket Maximum',
    description: isEs
      ? 'El máximo de gastos de bolsillo es la cantidad máxima que pagará durante un año del plan por servicios de salud cubiertos en la red antes de que su seguro pague el 100% de los costos subsiguientes.'
      : 'The out-of-pocket maximum is the maximum amount you will pay during a plan year for covered, in-network healthcare services before your insurance pays 100% of subsequent costs.',
    url: `/${locale}/out-of-pocket-maximum`,
    alternateNames: ['OOP Max', 'Out-of-Pocket Limit', 'MOOP', 'Maximum Out-of-Pocket'],
  });

  // 2026 limits table
  const limitsHeaders = isEs
    ? ['Tipo de plan', 'Individual', 'Familia']
    : ['Plan Type', 'Individual', 'Family'];

  const limitsRows: ReferenceTableCell[][] = [
    [
      isEs ? 'Plan del mercado del ACA (cualquier metal)' : 'ACA marketplace plan (any metal tier)',
      fmt(ACA_INDIVIDUAL_2026),
      fmt(ACA_FAMILY_2026),
    ],
    [
      isEs ? 'HDHP calificado para HSA' : 'HSA-qualified HDHP',
      fmt(HSA_INDIVIDUAL_2026),
      fmt(HSA_FAMILY_2026),
    ],
  ];

  // Example scenario table
  const exampleHeaders = isEs
    ? ['Categoría de gasto', 'Cantidad']
    : ['Spending category', 'Amount'];

  const exampleRows: ReferenceTableCell[][] = [
    [isEs ? 'Deducible (cumplido)' : 'Deductible (met)', '$2,500'],
    [isEs ? 'Coseguro de hospitalización' : 'Hospitalization coinsurance', '$3,000'],
    [isEs ? 'Coseguro adicional durante el año' : 'Additional coinsurance during year', '$3,700'],
    [isEs ? 'Total alcanzado' : 'Total reached', `${fmt(ACA_INDIVIDUAL_2026)}`],
    [isEs ? 'Lo que el seguro paga después' : 'What insurance pays after', isEs ? '100% del resto del año' : '100% rest of year'],
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }} />

      {/* Article Header */}
      <div className="warm-texture border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="category-tag">{isEs ? 'Glosario' : 'Glossary'}</span>
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
            {isEs ? '¿Qué Es un Máximo de Gastos de Bolsillo?' : 'What Is an Out-of-Pocket Maximum?'}
          </h1>

          <p
            className="text-lg md:text-xl leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}
          >
            {isEs
              ? `La cantidad máxima que pagará por atención cubierta en un año. Para los planes del ACA en 2026: ${fmt(ACA_INDIVIDUAL_2026)} individual, ${fmt(ACA_FAMILY_2026)} familia.`
              : `The most you'll pay for covered care in a year. For ACA marketplace plans in 2026: ${fmt(ACA_INDIVIDUAL_2026)} individual, ${fmt(ACA_FAMILY_2026)} family.`}
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
              ? `Un máximo de gastos de bolsillo es lo más que paga por servicios cubiertos en un año del plan antes de que el seguro pague el 100%. A partir de 2026, el límite del mercado del ACA es ${fmt(ACA_INDIVIDUAL_2026)} para un individuo y ${fmt(ACA_FAMILY_2026)} para una familia. Las primas, los cargos fuera de la red, los cargos por facturación de saldo y los servicios no cubiertos NO cuentan.`
              : `An out-of-pocket maximum is the most you pay for covered services in a plan year before insurance pays 100%. As of 2026, the ACA marketplace limit is ${fmt(ACA_INDIVIDUAL_2026)} for an individual and ${fmt(ACA_FAMILY_2026)} for a family. Premiums, out-of-network charges, balance billing, and non-covered services do NOT count toward it.`}
          </p>
        </blockquote>

        <div className="article-content">
          <BlogDropCap />

          <p>
            {isEs
              ? 'El máximo de gastos de bolsillo es uno de los términos más importantes de comprender en un seguro de salud, y uno de los más malentendidos. La mayoría de la gente piensa que cubre cualquier gasto médico que tengan. No es así.'
              : 'The out-of-pocket maximum is one of the most important health insurance terms to understand, and one of the most misunderstood. Most people assume it covers any medical spending they have. It does not.'}
          </p>

          <p>
            {isEs
              ? `Esta guía cubre lo que cuenta y lo que no cuenta hacia su OOP max, los límites federales de 2026, y cómo funciona en planes familiares vs. individuales.`
              : `This guide covers what counts and what doesn't count toward your OOP max, the 2026 federal limits, and how it works on family vs. individual plans.`}
          </p>

          <h2>{isEs ? 'Los límites del máximo de gastos de bolsillo de 2026' : 'The 2026 Out-of-Pocket Maximum Limits'}</h2>

          <p>
            {isEs
              ? `Los límites de OOP max para 2026 son establecidos por dos agencias federales separadas. El HHS establece los límites para los planes del mercado del ACA. El IRS establece los límites separados (más bajos) para los planes HDHP calificados para HSA.`
              : `The 2026 OOP max limits are set by two separate federal agencies. HHS sets the limits for ACA marketplace plans. The IRS sets separate (lower) limits for HSA-qualified HDHP plans.`}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Límites federales del máximo de gastos de bolsillo para 2026' : '2026 federal out-of-pocket maximum limits'}
              headers={limitsHeaders}
              rows={limitsRows}
              footnote={isEs
                ? 'Los planes individuales suelen tener un OOP max más bajo. Los planes específicos pueden tener un OOP max por debajo del límite federal.'
                : 'Individual plans may have a lower OOP max than the federal cap. Specific plans can set an OOP max below the federal limit.'}
              source="HHS 2026 Notice of Benefit and Payment Parameters; IRS Rev. Proc."
            />
          </div>

          <h2>{isEs ? 'Lo que cuenta hacia el OOP max' : 'What Counts Toward the OOP Max'}</h2>

          <p>
            {isEs
              ? 'Estos pagos cuentan hacia su OOP max y disparan la cobertura del 100% una vez que alcanza el límite:'
              : 'These payments count toward your OOP max and trigger 100% coverage once you hit the limit:'}
          </p>

          <ul>
            <li>{isEs ? 'Deducibles' : 'Deductibles'}</li>
            <li>{isEs ? 'Copagos' : 'Copays'}</li>
            <li>{isEs ? 'Coseguro' : 'Coinsurance'}</li>
            <li>{isEs ? 'Costos por servicios cubiertos en la red' : 'Costs for covered, in-network services'}</li>
          </ul>

          <h2>{isEs ? 'Lo que NO cuenta hacia el OOP max' : 'What Does NOT Count Toward the OOP Max'}</h2>

          <p>
            {isEs
              ? 'Estos gastos nunca cuentan hacia su OOP max — incluso si los está pagando todos los meses:'
              : 'These charges never count toward your OOP max — even if you are paying them every month:'}
          </p>

          <ul>
            <li>{isEs ? 'Primas mensuales (¡importante!)' : 'Monthly premiums (important!)'}</li>
            <li>{isEs ? 'Cargos fuera de la red (en la mayoría de los planes)' : 'Out-of-network charges (in most plans)'}</li>
            <li>{isEs ? 'Cargos por facturación de saldo' : 'Balance billing amounts'}</li>
            <li>{isEs ? 'Servicios no cubiertos por su plan' : 'Services not covered by your plan'}</li>
            <li>{isEs ? 'Cargos de proveedores fuera de la red de su plan' : 'Charges from providers outside your plan network'}</li>
          </ul>

          <h2>{isEs ? 'Ejemplo: Cómo funciona el OOP max en la práctica' : 'Example: How the OOP Max Works in Practice'}</h2>

          <p>
            {isEs
              ? `Considere a Sarah, una adulta soltera de 35 años con un plan ACA Silver del mercado con un OOP max de ${fmt(ACA_INDIVIDUAL_2026)}. A lo largo del año, alcanza su OOP max después de una hospitalización:`
              : `Consider Sarah, a single 35-year-old with a marketplace ACA Silver plan with a ${fmt(ACA_INDIVIDUAL_2026)} OOP max. Over the year, she hits her OOP max after a hospitalization:`}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Trayectoria de gastos de Sarah hacia el OOP max' : "Sarah's spending path to OOP max"}
              headers={exampleHeaders}
              rows={exampleRows}
              footnote={isEs
                ? 'Después de alcanzar el OOP max, Sarah no paga más copagos, coseguro o deducible por el resto del año del plan — pero continúa pagando su prima mensual.'
                : 'After hitting OOP max, Sarah pays no more copays, coinsurance, or deductible costs for the rest of the plan year — but continues paying her monthly premium.'}
            />
          </div>

          <h2>{isEs ? 'OOP max individual vs. familiar' : 'Individual vs. Family OOP Max'}</h2>

          <p>
            {isEs
              ? `Los planes familiares tienen dos OOP max: el OOP max individual embebido (capado en ${fmt(ACA_INDIVIDUAL_2026)} en 2026) que aplica a cualquier persona individual en el plan, y el OOP max familiar más grande (${fmt(ACA_FAMILY_2026)} en 2026) que aplica al gasto familiar combinado. Cualquiera que se alcance primero dispara la cobertura del 100% para esa persona o familia.`
              : `Family plans have two OOP maxes: the embedded individual OOP max (capped at ${fmt(ACA_INDIVIDUAL_2026)} in 2026) that applies to any single person on the plan, and the larger family OOP max (${fmt(ACA_FAMILY_2026)} in 2026) that applies to combined family spending. Whichever is hit first triggers 100% coverage for that person or the family.`}
          </p>

          <h2>{isEs ? 'Por qué el OOP max importa al elegir un plan' : 'Why the OOP Max Matters When Choosing a Plan'}</h2>

          <p>
            {isEs
              ? `El OOP max es la barandilla de protección financiera del plan. Un plan Bronze barato con un OOP max de ${fmt(ACA_INDIVIDUAL_2026)} aún podría costarle ${fmt(ACA_INDIVIDUAL_2026)} de su bolsillo más las primas en un mal año. Un plan Gold más caro con un OOP max más bajo podría salir más barato si tiene gastos médicos significativos. Si está enfermo crónico, embarazada o sabe que tendrá una cirugía grande, un OOP max más bajo casi siempre vale la prima mensual más alta.`
              : `The OOP max is the plan's financial protection guardrail. A cheap Bronze plan with a ${fmt(ACA_INDIVIDUAL_2026)} OOP max could still cost you ${fmt(ACA_INDIVIDUAL_2026)} out of pocket plus premiums in a bad year. A more expensive Gold plan with a lower OOP max may come out cheaper if you have significant medical spending. If you are chronically ill, pregnant, or know you have a major surgery coming, a lower OOP max almost always beats the cheaper premium.`}
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

        {/* End CTA — screener funnel for plan choice context */}
        <ScreenerCTA locale={locale} slug="out-of-pocket-maximum" variant="inline" />

        {/* Related links */}
        <div className="mt-12">
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            {isEs ? 'Términos Relacionados' : 'Related Terms'}
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
              href={`/${locale}/federal-poverty-level`}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--teal-dark)' }}
            >
              {isEs ? 'Tabla del FPL 2026' : '2026 FPL Chart'}
            </Link>
            <Link
              href={`/${locale}/medicaid-income-limits`}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--teal-dark)' }}
            >
              {isEs ? 'Límites de Ingresos de Medicaid' : 'Medicaid Income Limits'}
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
              <a href="https://www.healthcare.gov/glossary/out-of-pocket-maximum-limit/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                HealthCare.gov — Out-of-Pocket Maximum/Limit
              </a>{' '}
              — official ACA definition.
            </li>
            <li>
              2.{' '}
              <a href="https://www.cms.gov/cciio/resources/regulations-and-guidance" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                CMS — Notice of Benefit and Payment Parameters
              </a>{' '}
              — annual ACA OOP max limits.
            </li>
            <li>
              3.{' '}
              <a href="https://www.irs.gov/forms-pubs/about-publication-969" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                IRS Publication 969 — Health Savings Accounts and Other Tax-Favored Plans
              </a>{' '}
              — HDHP HSA limits.
            </li>
          </ol>
        </div>
      </article>
    </main>
  );
}
