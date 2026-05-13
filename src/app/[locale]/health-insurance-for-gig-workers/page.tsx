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
    question: 'How do gig workers get health insurance?',
    answer: 'Most gig workers get insurance through the ACA marketplace with income-based subsidies. The marketplace is the cheapest option for most because subsidies scale with income. Medicaid is the fallback for very low-income gig workers (under 138% FPL in expansion states, about $22,024 single in 2026). A spouse\'s employer plan is the third common option if you are married.',
  },
  {
    question: 'Can gig workers deduct health insurance premiums on taxes?',
    answer: 'Yes. Self-employed individuals filing Schedule C or as an S-corp owner can deduct 100% of their health insurance premiums (and their family\'s) as an above-the-line deduction on their tax return. This is a major financial benefit that most gig workers do not fully use. It reduces both your federal taxable income and your self-employment tax.',
  },
  {
    question: 'Are short-term health plans good for gig workers?',
    answer: 'Usually no. Short-term plans do not have to cover pre-existing conditions, can deny claims after the fact, and often exclude routine care like prescriptions. They are cheaper monthly but a single emergency can leave you with tens of thousands in unpaid bills. ACA marketplace plans with subsidies are almost always a better deal.',
  },
  {
    question: 'What is the cheapest health insurance for gig workers?',
    answer: 'Medicaid if you qualify. Most adults under 138% FPL ($22,024 single in 2026) in expansion states qualify, and Medicaid is free or near-free. If your income is above the Medicaid threshold but under 400% FPL, an ACA Silver plan with premium tax credits is typically $10 to $100 per month. Above 400% FPL ($60,240 single), you pay full marketplace rates.',
  },
  {
    question: 'How do I report income for ACA subsidies if my gig income varies?',
    answer: 'Project your annual household income for the year, including all gig work earnings AND unemployment if any, MINUS legitimate business expenses (mileage, gas, phone, supplies). The ACA uses Modified Adjusted Gross Income (MAGI). Lower projected MAGI = larger subsidy. If your projection is wrong, the marketplace reconciles at tax time, but underestimating triggers a smaller penalty than overestimating.',
  },
  {
    question: 'Can I get Medicaid as a gig worker?',
    answer: 'Yes, if your income qualifies. Medicaid is based on current monthly income, not your prior year. If your gig income has dropped or you have a slow month, you may qualify based on that current snapshot. Apply year-round through your state Medicaid agency or healthcare.gov.',
  },
  {
    question: 'What about my children\'s coverage as a gig worker?',
    answer: 'Children almost always qualify for CHIP (Children\'s Health Insurance Program) at incomes up to 200-300% FPL depending on your state — much higher than the adult Medicaid threshold. Even if you yourself buy a marketplace plan, your children can be on CHIP separately for free or near-free coverage. Apply through healthcare.gov or your state CHIP office.',
  },
  {
    question: 'Are health share ministries health insurance for gig workers?',
    answer: 'No. Health share ministries are NOT health insurance and have no legal obligation to pay claims. Pre-existing conditions are excluded, and some practices (smoking, alcohol use, IVF, mental health) can disqualify you. They are cheaper monthly but high-risk. Stick with the ACA marketplace, Medicaid, or a spouse\'s employer plan.',
  },
];

const FAQS_ES = [
  {
    question: '¿Cómo obtienen seguro médico los trabajadores gig?',
    answer: 'La mayoría de los trabajadores gig obtienen seguro a través del mercado del ACA con subsidios basados en ingresos. El mercado es la opción más barata para la mayoría porque los subsidios escalan con los ingresos. Medicaid es la opción de respaldo para trabajadores gig de muy bajos ingresos (bajo 138% FPL en estados con expansión, aproximadamente $22,024 individual en 2026).',
  },
  {
    question: '¿Pueden los trabajadores gig deducir las primas de seguro médico en impuestos?',
    answer: 'Sí. Las personas que trabajan por cuenta propia que presentan Schedule C o como propietario de S-corp pueden deducir el 100% de sus primas de seguro médico como una deducción "above-the-line". Esto reduce tanto su ingreso imponible federal como su impuesto al trabajo por cuenta propia.',
  },
  {
    question: '¿Los planes de salud a corto plazo son buenos para trabajadores gig?',
    answer: 'Usualmente no. Los planes a corto plazo no tienen que cubrir condiciones preexistentes, pueden denegar reclamos retroactivamente, y a menudo excluyen cuidado rutinario. Son más baratos mensualmente pero una sola emergencia puede dejarle con decenas de miles en facturas no pagadas.',
  },
  {
    question: '¿Cuál es el seguro médico más barato para trabajadores gig?',
    answer: 'Medicaid si califica. La mayoría de los adultos bajo el 138% FPL ($22,024 individual en 2026) en estados con expansión califican, y Medicaid es gratis o casi gratis. Si su ingreso está por encima del límite de Medicaid pero bajo el 400% FPL, un plan Silver del ACA con créditos fiscales típicamente cuesta $10 a $100 al mes.',
  },
  {
    question: '¿Cómo reporto ingresos para subsidios del ACA si mis ingresos gig varían?',
    answer: 'Proyecte su ingreso anual del hogar para el año, incluyendo todas las ganancias del trabajo gig Y desempleo si aplica, MENOS gastos comerciales legítimos (kilometraje, gasolina, teléfono, suministros). El ACA usa el Ingreso Bruto Ajustado Modificado (MAGI). Un MAGI proyectado más bajo = un subsidio más grande.',
  },
  {
    question: '¿Puedo obtener Medicaid como trabajador gig?',
    answer: 'Sí, si su ingreso califica. Medicaid se basa en el ingreso mensual actual, no en su año previo. Si su ingreso gig ha caído o tiene un mes lento, puede calificar basado en esa instantánea actual.',
  },
  {
    question: '¿Qué pasa con la cobertura de mis hijos como trabajador gig?',
    answer: 'Los niños casi siempre califican para CHIP (Programa de Seguro Médico para Niños) en ingresos hasta 200-300% FPL según su estado. Incluso si usted compra un plan del mercado, sus hijos pueden estar en CHIP por separado por cobertura gratis o casi gratis.',
  },
  {
    question: '¿Los ministerios de compartir salud son seguro médico para trabajadores gig?',
    answer: 'No. Los ministerios de compartir salud NO son seguro médico y no tienen obligación legal de pagar reclamos. Las condiciones preexistentes están excluidas. Son más baratos mensualmente pero de alto riesgo.',
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  return {
    title: isEs
      ? 'Seguro Médico para Trabajadores Gig: Guía de Opciones 2026 | CoveredUSA'
      : 'Health Insurance for Gig Workers: 2026 Options Guide | CoveredUSA',
    description: isEs
      ? 'Los trabajadores gig no obtienen cobertura del empleador. Compare el mercado del ACA con subsidios, Medicaid, planes de asociación y opciones específicas para 1099. Más cómo deducir primas en impuestos.'
      : 'Gig workers don\'t get employer coverage. Compare ACA marketplace with subsidies, Medicaid, association health plans, and 1099-specific options. Plus how to deduct premiums on taxes.',
    alternates: {
      canonical: `https://coveredusa.org/${locale}/health-insurance-for-gig-workers`,
      languages: {
        en: 'https://coveredusa.org/en/health-insurance-for-gig-workers',
        es: 'https://coveredusa.org/es/health-insurance-for-gig-workers',
      },
    },
  };
}

export default async function GigWorkersHealthInsurancePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEs = locale === 'es';
  const faqs = isEs ? FAQS_ES : FAQS_EN;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Seguro Médico para Trabajadores Gig' : 'Health Insurance for Gig Workers', url: `/${locale}/health-insurance-for-gig-workers` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/health-insurance-for-gig-workers`,
    name: isEs ? 'Seguro Médico para Trabajadores Gig: Guía 2026' : 'Health Insurance for Gig Workers: 2026 Guide',
    description: isEs
      ? 'Guía de opciones de seguro médico para trabajadores 1099 e independientes en 2026, incluyendo mercado del ACA, Medicaid, deducciones fiscales y trampas a evitar.'
      : 'Health insurance options guide for 1099 and gig workers in 2026, including ACA marketplace, Medicaid, tax deductions, and traps to avoid.',
    lastReviewed: LAST_UPDATED_DATE,
    about: 'Self-Employed Health Insurance',
    audience: 'Consumer',
    medicalSpecialty: 'PublicHealth',
  });

  // Options comparison table
  const optionsHeaders = isEs
    ? ['Opción', 'Mejor para', 'Costo típico']
    : ['Option', 'Best for', 'Typical cost'];

  const optionsRows: ReferenceTableCell[][] = [
    [
      isEs ? 'Mercado del ACA con subsidios' : 'ACA Marketplace with subsidies',
      isEs ? 'La mayoría de trabajadores gig' : 'Most gig workers',
      isEs ? '$10 a $300/mes' : '$10 to $300/month',
    ],
    [
      'Medicaid',
      isEs ? 'Ingreso bajo 138% FPL' : 'Income under 138% FPL',
      isEs ? 'Gratis o casi gratis' : 'Free or near-free',
    ],
    [
      isEs ? 'Plan del empleador del cónyuge' : 'Spouse\'s employer plan',
      isEs ? 'Casado con cónyuge empleado' : 'Married with employed spouse',
      isEs ? 'Varía (a menudo más barato)' : 'Varies (often cheapest)',
    ],
    [
      'CHIP',
      isEs ? 'Niños hasta 200-300% FPL' : 'Children up to 200-300% FPL',
      isEs ? 'Gratis o casi gratis' : 'Free or near-free',
    ],
  ];

  // Traps table
  const trapsHeaders = isEs
    ? ['Trampa', 'Por qué evitarlo']
    : ['Trap', 'Why to avoid'];

  const trapsRows: ReferenceTableCell[][] = [
    [
      isEs ? 'Planes de salud a corto plazo' : 'Short-term health insurance plans',
      isEs
        ? 'No cubren condiciones preexistentes, pueden denegar reclamos, a menudo expiran cuando más los necesita.'
        : 'Don\'t cover pre-existing conditions, can deny claims, often expire just when you need care.',
    ],
    [
      isEs ? 'Planes de salud de asociación (AHP)' : 'Association health plans (AHPs)',
      isEs
        ? 'A menudo menos completos que los planes del ACA, pueden tener topes vitalicios, pueden no cubrir beneficios esenciales.'
        : 'Often less comprehensive than ACA plans, can have lifetime caps, may not cover essential benefits.',
    ],
    [
      isEs ? 'Ministerios de compartir salud' : 'Health share ministries',
      isEs
        ? 'NO son seguro. El reparto de costos no tiene obligación legal. Las condiciones preexistentes están excluidas.'
        : 'NOT insurance. Cost-sharing has no legal obligation. Pre-existing conditions excluded.',
    ],
    [
      isEs ? '"Planes con descuento" no-seguros' : 'Non-insurance "discount plans"',
      isEs
        ? 'No pagan reclamos. Solo ofrecen tarifas con descuento de proveedores selectos.'
        : 'Don\'t pay claims. Just offer discounted rates from select providers.',
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
            <span className="category-tag">{isEs ? 'Guía por Persona' : 'Persona Guide'}</span>
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
            {isEs ? 'Seguro Médico para Trabajadores Gig en 2026' : 'Health Insurance for Gig Workers in 2026'}
          </h1>

          <p
            className="text-lg md:text-xl leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}
          >
            {isEs
              ? 'Sus tres opciones reales, cómo elegir la más barata, y la deducción fiscal que muchos trabajadores gig pasan por alto.'
              : 'Your three real options, how to pick the cheapest one, and the tax deduction most gig workers miss.'}
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
              ? 'Los trabajadores gig pueden obtener seguro médico a través de (1) el mercado del ACA con créditos fiscales de prima basados en ingresos (típicamente la mejor opción), (2) Medicaid si el ingreso está bajo 138% FPL ($22,024 individual en 2026), o (3) el plan del empleador del cónyuge. Los planes de asociación y planes a corto plazo usualmente son trampas. La mayoría de los trabajadores gig califican para subsidios importantes porque el ingreso reportado es más bajo que el equivalente W-2 después de los gastos comerciales. Los autónomos también pueden deducir el 100% de las primas como deducción "above-the-line" en impuestos.'
              : 'Gig workers can get health insurance through (1) the ACA marketplace with income-based premium tax credits (typically the best deal), (2) Medicaid if income is under 138% FPL ($22,024 single in 2026), or (3) a spouse\'s employer plan. Association health plans and short-term plans are usually traps. Most gig workers qualify for major ACA subsidies because reported income is lower than W-2 equivalent after business expenses. Self-employed gig workers can also deduct 100% of premiums as an above-the-line tax deduction.'}
          </p>
        </blockquote>

        <div className="article-content">
          <BlogDropCap />

          <p>
            {isEs
              ? 'Si trabaja para Uber, DoorDash, Instacart, TaskRabbit, o cualquier plataforma freelance, no obtiene seguro médico del empleador. La buena noticia: las opciones para trabajadores gig en 2026 son mejores que nunca, gracias a los subsidios mejorados del ACA y los caps de costos. La mala noticia: la mayoría de los trabajadores gig terminan en planes equivocados porque no saben las reglas.'
              : 'If you work for Uber, DoorDash, Instacart, TaskRabbit, or any freelance platform, you do not get employer-sponsored health insurance. The good news: gig worker options in 2026 are better than ever, thanks to enhanced ACA subsidies and cost caps. The bad news: most gig workers end up in the wrong plans because they do not know the rules.'}
          </p>

          <p>
            {isEs
              ? 'Esta guía cubre las tres opciones reales para trabajadores gig (mercado del ACA, Medicaid, plan del cónyuge), las trampas comunes (planes a corto plazo, ministerios de compartir salud), y la deducción fiscal del seguro médico para autónomos que la mayoría no utiliza.'
              : 'This guide covers the three real options for gig workers (ACA marketplace, Medicaid, spouse\'s plan), the common traps (short-term plans, health share ministries), and the self-employed health insurance tax deduction that most do not use.'}
          </p>

          <h2>{isEs ? 'Sus 3 opciones reales (2026)' : 'Your 3 Real Options (2026)'}</h2>

          <p>
            {isEs
              ? 'Para la mayoría de los trabajadores gig en 2026, tres opciones reales cubren el 95% de las situaciones. Aquí está cómo se comparan:'
              : 'For most gig workers in 2026, three real options cover 95% of situations. Here is how they compare:'}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Opciones de seguro médico para trabajadores gig (2026)' : 'Health insurance options for gig workers (2026)'}
              headers={optionsHeaders}
              rows={optionsRows}
              footnote={isEs
                ? 'Los costos del mercado dependen de su ingreso anual proyectado. Medicaid es gratuito en la mayoría de los estados de expansión bajo 138% FPL.'
                : 'Marketplace costs depend on your projected annual income. Medicaid is free in most expansion states under 138% FPL.'}
              source="HealthCare.gov, Medicaid.gov"
            />
          </div>

          <h2>{isEs ? 'Opción 1: Mercado del ACA con subsidios' : 'Option 1: ACA Marketplace with Subsidies'}</h2>

          <p>
            {isEs
              ? 'Esto es lo que la mayoría de los trabajadores gig deberían usar. Cuando aplica al mercado del ACA, reporta su ingreso anual proyectado. Si está por debajo del 400% FPL ($60,240 individual o $132,000 familia de 4 en 2026), califica para créditos fiscales de prima (subsidios). Los subsidios escalan con su ingreso — cuanto más bajo, mayor el subsidio.'
              : 'This is what most gig workers should use. When you apply to the ACA marketplace, you report your projected annual income. If you are below 400% FPL ($60,240 single or $132,000 family of 4 in 2026), you qualify for premium tax credits (subsidies). Subsidies scale with your income — the lower you are, the larger the subsidy.'}
          </p>

          <p>
            {isEs
              ? 'Para trabajadores gig específicamente: su MAGI (Ingreso Bruto Ajustado Modificado) es ingreso del trabajo gig MENOS gastos comerciales legítimos. Si conduce para Uber 2,000 millas al mes, eso es ~$1,400 al mes en gastos de kilometraje (a la tasa estándar IRS de $0.70/milla en 2026) que puede deducir antes de calcular MAGI. Eso baja su ingreso reportado, aumenta sus subsidios.'
              : 'For gig workers specifically: your MAGI (Modified Adjusted Gross Income) is gig income MINUS legitimate business expenses. If you drive Uber 2,000 miles a month, that is ~$1,400/month in mileage deduction (at the 2026 IRS standard rate of $0.70/mile) you can deduct before MAGI is calculated. That lowers your reported income and raises your subsidies.'}
          </p>

          <h2>{isEs ? 'Opción 2: Medicaid' : 'Option 2: Medicaid'}</h2>

          <p>
            {isEs
              ? 'Si su ingreso del hogar está bajo 138% FPL ($22,024 individual o $45,540 familia de 4 en 2026) en un estado con expansión, califica para Medicaid. Cobertura completa, gratis o casi gratis (algunos estados cobran $1 a $4 por copago). La inscripción es todo el año, no hay ventanas que perder.'
              : 'If your household income is under 138% FPL ($22,024 single or $45,540 family of 4 in 2026) in an expansion state, you qualify for Medicaid. Comprehensive coverage, free or near-free (some states have $1 to $4 copays). Enrollment is year-round, no windows to miss.'}
          </p>

          <p>
            {isEs
              ? 'Los trabajadores gig a menudo califican para Medicaid en meses lentos pero no en meses ocupados. Eso está bien: Medicaid se basa en el ingreso actual mensual, no en el anual. Si su ingreso baja, vuelva a aplicar. Es flexible.'
              : 'Gig workers often qualify for Medicaid in slow months but not busy months. That is fine: Medicaid is based on current monthly income, not annual. If your income drops, reapply. It is flexible.'}
          </p>

          <h2>{isEs ? 'Opción 3: Plan del empleador del cónyuge' : 'Option 3: Spouse\'s Employer Plan'}</h2>

          <p>
            {isEs
              ? 'Si está casado y su cónyuge tiene un trabajo con beneficios de salud, agregarse a su plan es a menudo la opción más barata. La prima compartida del empleador y la de su cónyuge se paga antes de impuestos a través de la nómina, lo que efectivamente reduce su costo en 20-30% comparado con primas que paga después de impuestos.'
              : 'If you are married and your spouse has a job with health benefits, adding yourself to their plan is often the cheapest option. The shared employer + your spouse\'s premium is paid pre-tax through payroll, which effectively reduces your cost by 20-30% compared to premiums you pay post-tax.'}
          </p>
        </div>

        {/* Mid-article CTA */}
        <ScreenerCTA locale={locale} slug="gig-workers-mid" variant="inline" />

        <div className="article-content">
          <h2>{isEs ? 'Trampas que cuestan a los trabajadores gig miles' : 'Traps That Cost Gig Workers Thousands'}</h2>

          <p>
            {isEs
              ? 'Estas opciones se anuncian agresivamente a los trabajadores gig. Casi todas son peores que el mercado del ACA con subsidios:'
              : 'These options are aggressively marketed to gig workers. Almost all are worse than the ACA marketplace with subsidies:'}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Trampas comunes para trabajadores gig' : 'Common gig worker insurance traps'}
              headers={trapsHeaders}
              rows={trapsRows}
              footnote={isEs
                ? 'Estos productos no son ilegales pero son arriesgados. Una hospitalización inesperada puede dejarle con decenas o cientos de miles en facturas no cubiertas.'
                : 'These products are not illegal but are risky. An unexpected hospitalization can leave you with tens or hundreds of thousands in uncovered bills.'}
              source="Consumer Reports, KFF Issue Brief on Short-Term Plans"
            />
          </div>

          <h2>{isEs ? 'La deducción fiscal de seguro médico para autónomos' : 'The Self-Employed Health Insurance Tax Deduction'}</h2>

          <p>
            {isEs
              ? `Esta es la parte que la mayoría de los trabajadores gig pasan por alto. Si presenta Schedule C (autónomo), Schedule SE, o es propietario de S-corp, puede deducir el 100% de sus primas de seguro médico (y las de su familia) como una deducción "above-the-line" en sus impuestos. Esto significa que la deducción reduce su MAGI ANTES de calcular su ingreso imponible.`
              : `This is the part most gig workers miss. If you file Schedule C (self-employed), Schedule SE, or are an S-corp owner, you can deduct 100% of your health insurance premiums (and your family\'s) as an above-the-line deduction on your taxes. This means the deduction reduces your MAGI BEFORE calculating taxable income.`}
          </p>

          <p>
            {isEs
              ? 'Beneficio doble: (1) reduce su impuesto federal sobre la renta, y (2) un MAGI más bajo significa subsidios del ACA más grandes el año SIGUIENTE. Si paga $4,800/año en primas del mercado ($400/mes), la deducción podría ahorrarle $700 a $1,200 en impuestos según su rango. Llene el Formulario 7206 con su declaración de impuestos.'
              : 'Double benefit: (1) it reduces your federal income tax, and (2) a lower MAGI means LARGER ACA subsidies the FOLLOWING year. If you pay $4,800/year in marketplace premiums ($400/month), the deduction could save you $700 to $1,200 in taxes depending on your bracket. File Form 7206 with your tax return.'}
          </p>

          <h2>{isEs ? 'Cómo proyectar el ingreso para los subsidios del ACA' : 'How to Project Income for ACA Subsidies'}</h2>

          <p>
            {isEs
              ? 'Los ingresos gig varían. Aquí está cómo proyectar para los subsidios del ACA:'
              : 'Gig income varies. Here is how to project for ACA subsidies:'}
          </p>

          <ul>
            <li>{isEs
              ? 'Liste todas las fuentes de ingreso esperadas para el año (trabajo gig, desempleo, otros trabajos).'
              : 'List all expected income sources for the year (gig work, unemployment, other jobs).'}</li>
            <li>{isEs
              ? 'Reste los gastos comerciales legítimos: kilometraje, gasolina, teléfono, suministros, parte proporcional de la oficina en casa.'
              : 'Subtract legitimate business expenses: mileage, gas, phone, supplies, home office portion.'}</li>
            <li>{isEs
              ? 'No infle el ingreso "por seguridad" — los créditos sobrepagados se reconcilian al momento de declarar impuestos, pero los subsidios pagados de menos no se penalizan tanto.'
              : 'Do not inflate income "to be safe" — overpaid subsidies are reconciled at tax time, but underpaid ones are not penalized as harshly.'}</li>
            <li>{isEs
              ? 'Reporte cambios significativos al mercado durante el año. Actualizar a la baja inmediatamente aumenta sus subsidios.'
              : 'Report significant changes to the marketplace mid-year. Updating downward immediately increases your subsidies.'}</li>
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
        <ScreenerCTA locale={locale} slug="gig-workers-end" variant="inline" />

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
              {isEs ? 'Límites de Ingresos Medicaid' : 'Medicaid Income Limits'}
            </Link>
            <Link
              href={`/${locale}/just-lost-job-health-insurance`}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--teal-dark)' }}
            >
              {isEs ? '¿Perdió Su Trabajo? Opciones de Seguro' : 'Lost Your Job? Coverage Options'}
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
              <a href="https://www.healthcare.gov/self-employed/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                HealthCare.gov: self-employed coverage information.
              </a>
            </li>
            <li>
              2.{' '}
              <a href="https://www.irs.gov/forms-pubs/about-form-7206" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                IRS Form 7206: Self-Employed Health Insurance Deduction.
              </a>
            </li>
            <li>
              3.{' '}
              <a href="https://www.kff.org/health-reform/issue-brief/short-term-limited-duration-plans/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                KFF: Short-Term, Limited-Duration Plans issue brief.
              </a>
            </li>
            <li>
              4.{' '}
              <a href="https://www.medicaid.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                Medicaid.gov: state-by-state eligibility information.
              </a>
            </li>
          </ol>
        </div>
      </article>
    </main>
  );
}
