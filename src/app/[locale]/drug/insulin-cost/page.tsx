import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import {
  getFAQSchema,
  getBreadcrumbSchema,
  getMedicalWebPageSchema,
  getDrugSchema,
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
const READING_TIME = '6 min read';

// 2026 insulin cost anchors
const MEDICARE_ASP_PER_UNIT = 12;
const RETAIL_LOW = 25;
const RETAIL_HIGH = 300;
const INPATIENT_CHARGE_LOW = 200;
const INPATIENT_CHARGE_HIGH = 500;
const MEDICARE_PART_D_CAP = 35; // monthly cap from Inflation Reduction Act

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

const FAQS_EN = [
  {
    question: 'Why did the hospital charge so much for insulin?',
    answer: `Hospitals bill insulin at "facility rates" that include the drug acquisition cost plus markup for storage, nursing administration, and overhead. A vial of insulin that retails for ${fmt(RETAIL_LOW)} to ${fmt(RETAIL_HIGH)} can be billed at ${fmt(INPATIENT_CHARGE_LOW)} to ${fmt(INPATIENT_CHARGE_HIGH)} or more per dose during a hospital stay. Markup multipliers of 10x to 40x the Medicare ASP rate are common and well-documented in CMS price transparency data.`,
  },
  {
    question: 'What is the Medicare price for insulin in 2026?',
    answer: `The 2026 Medicare Part B ASP (Average Sales Price) rate is approximately ${fmt(MEDICARE_ASP_PER_UNIT)} per unit of insulin for hospital-administered insulin under HCPCS code J1815. Medicare Part D enrollees pay a maximum of ${fmt(MEDICARE_PART_D_CAP)} per month for insulin since the 2023 Inflation Reduction Act took effect.`,
  },
  {
    question: 'How do I qualify for free insulin?',
    answer: 'The major insulin manufacturers (Eli Lilly, Novo Nordisk, Sanofi) all run patient assistance programs (PAPs) that offer free or near-free insulin to income-qualified patients. Lilly Insulin Value Program caps cost at $35/month for any insulin. Novo Nordisk Patient Assistance Program offers free supply for incomes up to 400% FPL. Sanofi Insulins Valyou Savings Program caps cost at $35-$99/month. Apply directly through each manufacturer\'s website.',
  },
  {
    question: 'Can I dispute an inpatient insulin bill?',
    answer: 'Yes. If you received an itemized bill showing $200+ per insulin dose during a hospital stay, you can dispute the charge as unreasonable. Compare each line to the 2026 Medicare ASP rate ($10-$15 per unit). Charges more than 2x to 3x the Medicare allowed amount are common dispute targets. The CoveredUSA Bill Analyzer scans for these overcharges and writes a custom dispute letter automatically.',
  },
  {
    question: 'Does Medicare Part D really cap insulin at $35 per month?',
    answer: 'Yes. The Inflation Reduction Act of 2022 capped insulin out-of-pocket cost at $35 per month for all Medicare Part D enrollees effective January 2023. This cap applies regardless of which insulin product or which Part D plan you use, and applies whether you have met your deductible or not. The cap is permanent.',
  },
  {
    question: 'What is HCPCS J1815 and why does it matter for my bill?',
    answer: 'HCPCS J1815 is the billing code for "Insulin injection, per 5 units" used on hospital and outpatient claims. It appears on your bill as the line-item code for insulin administered in a clinical setting. If you see J1815 multiplied by a high unit count and a per-unit price far above $15, that is a flag for billing error or markup dispute.',
  },
  {
    question: 'How much should I pay for insulin without insurance?',
    answer: `Retail (pharmacy counter, paying cash without insurance) prices for insulin in 2026 range from ${fmt(RETAIL_LOW)} to ${fmt(RETAIL_HIGH)} per vial depending on the formulation. Lilly\'s $35/month program is available to anyone uninsured, so most uninsured patients should pay no more than $35/month total. GoodRx and PharmacyChecker also offer discounted retail prices.`,
  },
  {
    question: 'Will Medicaid cover insulin?',
    answer: 'Yes. Medicaid covers insulin in all 50 states with minimal or no copay (typically $1 to $4 per prescription). If you have low income and have not enrolled in Medicaid, you may qualify. Apply through your state Medicaid agency or healthcare.gov.',
  },
];

const FAQS_ES = [
  {
    question: '¿Por qué el hospital cobra tanto por insulina?',
    answer: 'Los hospitales facturan la insulina a "tarifas de instalación" que incluyen el costo de adquisición del medicamento más recargo por almacenamiento, administración de enfermería y gastos generales. Un vial de insulina que se vende al por menor de $25 a $300 puede facturarse de $200 a $500 o más por dosis durante una estancia hospitalaria.',
  },
  {
    question: '¿Cuál es el precio de Medicare para la insulina en 2026?',
    answer: 'La tarifa Medicare Parte B ASP de 2026 es aproximadamente $12 por unidad de insulina hospitalaria bajo el código HCPCS J1815. Los inscritos en Medicare Parte D pagan un máximo de $35 por mes por insulina desde que la Ley de Reducción de la Inflación de 2023 entró en vigor.',
  },
  {
    question: '¿Cómo califico para insulina gratuita?',
    answer: 'Los principales fabricantes de insulina (Eli Lilly, Novo Nordisk, Sanofi) ejecutan programas de asistencia para pacientes (PAP) que ofrecen insulina gratuita o casi gratuita a pacientes calificados por ingresos. Lilly Insulin Value Program limita el costo a $35/mes. Novo Nordisk ofrece suministro gratuito para ingresos hasta 400% FPL.',
  },
  {
    question: '¿Puedo disputar una factura de insulina en hospitalización?',
    answer: 'Sí. Si recibió una factura detallada que muestra $200+ por dosis de insulina, puede disputar el cargo como irrazonable. Compare cada línea con la tarifa Medicare ASP 2026 ($10-$15 por unidad). El Analizador de Facturas Médicas de CoveredUSA escanea automáticamente estos sobrecargos.',
  },
  {
    question: '¿Medicare Parte D realmente limita la insulina a $35 por mes?',
    answer: 'Sí. La Ley de Reducción de la Inflación de 2022 limitó el costo de bolsillo de insulina a $35 por mes para todos los inscritos en Medicare Parte D efectivo enero 2023. Este límite aplica sin importar qué producto de insulina o qué plan Parte D use.',
  },
  {
    question: '¿Qué es HCPCS J1815 y por qué importa para mi factura?',
    answer: 'HCPCS J1815 es el código de facturación para "Inyección de insulina, por 5 unidades" usado en reclamos hospitalarios y ambulatorios. Aparece en su factura como el código de línea para insulina administrada. Si ve J1815 multiplicado por un alto conteo de unidades y un precio por unidad muy por encima de $15, esa es una bandera roja.',
  },
  {
    question: '¿Cuánto debería pagar por insulina sin seguro?',
    answer: 'Los precios al por menor de insulina en 2026 varían de $25 a $300 por vial. El programa de $35/mes de Lilly está disponible para cualquier persona sin seguro, por lo que la mayoría de los pacientes sin seguro no deberían pagar más de $35/mes en total.',
  },
  {
    question: '¿Medicaid cubrirá la insulina?',
    answer: 'Sí. Medicaid cubre la insulina en los 50 estados con copago mínimo o cero (típicamente $1 a $4 por receta). Si tiene bajos ingresos y no se ha inscrito en Medicaid, puede calificar.',
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  return {
    title: isEs
      ? 'Qué Cuesta la Insulina en el Hospital en 2026 | CoveredUSA'
      : 'What Does Insulin Cost at the Hospital in 2026? | CoveredUSA',
    description: isEs
      ? `Los hospitales facturan insulina a 10x a 40x la tarifa de Medicare. Compare precios al por menor (${fmt(RETAIL_LOW)} a ${fmt(RETAIL_HIGH)}), tarifas Medicare ASP y cargos hospitalarios. Más programas PAP que limitan la insulina a $35/mes.`
      : `Hospitals bill insulin at 10x to 40x the Medicare rate. Compare retail prices (${fmt(RETAIL_LOW)} to ${fmt(RETAIL_HIGH)}), Medicare ASP rates, and inpatient charges. Plus manufacturer PAP programs that cap insulin at $35/month.`,
    alternates: {
      canonical: `https://coveredusa.org/${locale}/drug/insulin-cost`,
      languages: {
        en: 'https://coveredusa.org/en/drug/insulin-cost',
        es: 'https://coveredusa.org/es/drug/insulin-cost',
      },
    },
  };
}

export default async function InsulinCostPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEs = locale === 'es';
  const faqs = isEs ? FAQS_ES : FAQS_EN;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Medicamentos' : 'Drugs', url: `/${locale}/drug` },
    { name: 'Insulin', url: `/${locale}/drug/insulin-cost` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/drug/insulin-cost`,
    name: isEs ? 'Qué Cuesta la Insulina en el Hospital en 2026' : 'What Does Insulin Cost at the Hospital in 2026?',
    description: isEs
      ? 'Guía de costos hospitalarios y precios al por menor de insulina 2026, incluyendo tarifas Medicare, programas de asistencia al paciente y códigos de facturación HCPCS.'
      : '2026 insulin cost guide covering hospital charges, retail pricing, Medicare rates, patient assistance programs, and HCPCS billing codes.',
    lastReviewed: LAST_UPDATED_DATE,
    about: 'Insulin',
    audience: 'Patient',
    medicalSpecialty: 'Endocrine',
  });
  const drugSchema = getDrugSchema({
    name: 'Insulin',
    nonProprietaryName: 'Insulin (various formulations)',
    brandNames: ['Humalog', 'Novolog', 'Lantus', 'Levemir', 'Tresiba', 'Basaglar'],
    drugClass: 'Antidiabetic agent (hormone replacement)',
    hcpcsJCodes: ['J1815', 'J1817'],
    description: isEs
      ? 'Hormona inyectable utilizada para tratar la diabetes tipo 1, diabetes tipo 2 dependiente de insulina, y diabetes gestacional. Múltiples formulaciones disponibles incluyendo de acción rápida, de acción intermedia y de acción prolongada.'
      : 'Injectable hormone used to treat type 1 diabetes, insulin-dependent type 2 diabetes, and gestational diabetes. Multiple formulations available including rapid-acting, intermediate-acting, and long-acting.',
    url: `/${locale}/drug/insulin-cost`,
  });

  // Pricing comparison table
  const pricingHeaders = isEs
    ? ['Punto de pago', 'Costo típico', 'Notas']
    : ['Where you pay', 'Typical cost', 'Notes'];

  const pricingRows: ReferenceTableCell[][] = [
    [
      isEs ? 'Tarifa Medicare ASP (2026)' : 'Medicare ASP rate (2026)',
      `${fmt(MEDICARE_ASP_PER_UNIT)}/unit`,
      isEs ? 'Lo que Medicare paga por la insulina hospitalaria' : 'What Medicare pays for hospital insulin',
    ],
    [
      isEs ? 'Mostrador farmacia (al por menor)' : 'Pharmacy counter (retail)',
      `${fmt(RETAIL_LOW)} - ${fmt(RETAIL_HIGH)}/vial`,
      isEs ? 'Precio en efectivo sin seguro' : 'Cash price without insurance',
    ],
    [
      isEs ? 'Cargo hospitalario interno' : 'Inpatient hospital charge',
      `${fmt(INPATIENT_CHARGE_LOW)} - ${fmt(INPATIENT_CHARGE_HIGH)}+/dose`,
      isEs ? 'Lo que ve en una factura de hospital' : 'What you see on a hospital bill',
    ],
    [
      isEs ? 'Medicare Parte D (límite mensual)' : 'Medicare Part D (monthly cap)',
      `${fmt(MEDICARE_PART_D_CAP)}/mes total`,
      isEs ? 'Inflation Reduction Act 2023+' : 'Inflation Reduction Act 2023+',
    ],
    [
      'Medicaid',
      `${fmt(1)} - ${fmt(4)}/receta`,
      isEs ? 'Todos los 50 estados' : 'All 50 states',
    ],
  ];

  // PAP table
  const papHeaders = isEs
    ? ['Programa del fabricante', 'Costo / Beneficio', 'Cómo solicitar']
    : ['Manufacturer program', 'Cost / Benefit', 'How to apply'];

  const papRows: ReferenceTableCell[][] = [
    [
      'Lilly Insulin Value Program',
      `$35/mes ${isEs ? 'cualquier insulina Lilly' : 'any Lilly insulin'}`,
      'insulinaffordability.com',
    ],
    [
      'Novo Nordisk Patient Assistance',
      isEs ? 'Gratis si ingreso ≤ 400% FPL' : 'Free if income ≤ 400% FPL',
      'novocare.com',
    ],
    [
      'Sanofi Insulins Valyou Savings',
      '$35 - $99/mes',
      'sanofipatientconnection.com',
    ],
  ];

  // HCPCS codes (public domain)
  const hcpcsHeaders = isEs
    ? ['Código', 'Descripción', 'Qué buscar']
    : ['Code', 'Description', 'What to look for'];

  const hcpcsRows: ReferenceTableCell[][] = [
    [
      'J1815',
      isEs ? 'Inyección de insulina, por 5 unidades' : 'Insulin injection, per 5 units',
      isEs ? 'Aparece como insulina hospitalaria estándar' : 'Appears as standard hospital insulin',
    ],
    [
      'J1817',
      isEs ? 'Insulina para bomba (por 50 unidades)' : 'Insulin for insulin pump (per 50 units)',
      isEs ? 'Solo si usa bomba de insulina' : 'Only if you use an insulin pump',
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(drugSchema) }} />
      <DatasetSchema
        name={isEs ? 'Datos de costo de insulina 2026' : '2026 Insulin Cost Data'}
        description={isEs
          ? 'Datos de precios de insulina 2026 a través de punto de pago: tarifa Medicare ASP, precio al por menor, cargo hospitalario, programas PAP, y códigos HCPCS.'
          : '2026 insulin pricing data across point of pay: Medicare ASP rate, retail price, inpatient charge, PAP programs, and HCPCS codes.'}
        url={`https://coveredusa.org/${locale}/drug/insulin-cost`}
        dateModified={LAST_UPDATED_DATE}
        source="CMS Medicare Part B ASP Pricing 2026, Inflation Reduction Act, manufacturer PAPs"
        keywords={isEs
          ? ['costo insulina', 'insulina sin seguro', 'precio insulina 2026', 'Medicare insulina', 'PAP insulina', 'J1815']
          : ['insulin cost', 'insulin without insurance', '2026 insulin price', 'Medicare insulin', 'insulin PAP', 'J1815 billing']}
      />

      {/* Article Header */}
      <div className="warm-texture border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="category-tag">{isEs ? 'Costo de medicamento' : 'Drug Cost'}</span>
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
            {isEs ? '¿Qué Cuesta la Insulina en el Hospital en 2026?' : 'What Does Insulin Cost at the Hospital in 2026?'}
          </h1>

          <p
            className="text-lg md:text-xl leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}
          >
            {isEs
              ? `Los hospitales facturan insulina a 10 veces a 40 veces la tarifa de Medicare. Una sola dosis puede aparecer en su factura como $200 a $500. Aquí está lo que debería costar, los programas que limitan la insulina a $35/mes, y cómo disputar los sobrecargos.`
              : `Hospitals bill insulin at 10x to 40x the Medicare rate. A single dose can show up on your bill as $200 to $500. Here is what it should cost, the programs that cap insulin at $35/month, and how to dispute the overcharges.`}
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
              ? `A partir de 2026, la insulina cuesta ${fmt(MEDICARE_ASP_PER_UNIT)}/unidad bajo Medicare, ${fmt(RETAIL_LOW)} a ${fmt(RETAIL_HIGH)}/vial al por menor, pero $200 a $500+ por dosis cuando se factura en una estancia hospitalaria. Markups de 10x a 40x sobre la tarifa Medicare son comunes. Medicare Parte D limita el costo del paciente a $35/mes desde 2023. Los principales fabricantes (Lilly, Novo Nordisk, Sanofi) también ofrecen programas de $35/mes para cualquier persona sin importar el seguro.`
              : `As of 2026, insulin costs ${fmt(MEDICARE_ASP_PER_UNIT)}/unit under Medicare, ${fmt(RETAIL_LOW)} to ${fmt(RETAIL_HIGH)}/vial at retail, but $200 to $500+ per dose when billed during a hospital stay. Markups of 10x to 40x the Medicare rate are common. Medicare Part D caps patient cost at $35/month since 2023. The major manufacturers (Lilly, Novo Nordisk, Sanofi) also offer $35/month programs for anyone regardless of insurance.`}
          </p>
        </blockquote>

        <div className="article-content">
          <BlogDropCap />

          <p>
            {isEs
              ? 'La insulina es uno de los medicamentos más comúnmente mal facturados en hospitales de EE.UU. Lo que se vende al por menor de $25 a $300 por vial puede aparecer en una factura de hospital como $200 a $500 o más por dosis individual. Esa diferencia no es un error: es cómo los hospitales facturan rutinariamente los medicamentos.'
              : 'Insulin is one of the most commonly mismarked-up drugs on US hospital bills. What sells at retail for $25 to $300 per vial can appear on a hospital bill as $200 to $500 or more per individual dose. That difference is not an error: it is how hospitals routinely bill medications.'}
          </p>

          <p>
            {isEs
              ? `La buena noticia: tiene varias formas de reducir o eliminar este costo. Esta guía cubre los rangos reales de precios de la insulina en 2026, cómo lo factura el hospital, los programas que limitan la insulina a $35/mes, y cómo disputar los sobrecargos.`
              : `The good news: you have several ways to lower or eliminate this cost. This guide covers the actual 2026 insulin price ranges, how the hospital bills it, the programs that cap insulin at $35/month, and how to dispute overcharges.`}
          </p>

          <h2>{isEs ? 'Cuánto cuesta la insulina por punto de pago (2026)' : 'What Insulin Costs by Point of Pay (2026)'}</h2>

          <p>
            {isEs
              ? 'El precio que paga depende casi por completo de DÓNDE paga. La misma insulina puede costar 40 veces más en un hospital que en su farmacia local:'
              : 'The price you pay depends almost entirely on WHERE you pay. The same insulin can cost 40x more at a hospital than at your local pharmacy:'}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Precio de insulina por punto de pago (2026)' : '2026 Insulin Price by Point of Pay'}
              headers={pricingHeaders}
              rows={pricingRows}
              footnote={isEs
                ? 'Las tarifas Medicare ASP se publican trimestralmente por CMS. Los rangos hospitalarios reflejan datos de transparencia de precios CMS.'
                : 'Medicare ASP rates are published quarterly by CMS. Inpatient ranges reflect CMS price transparency data.'}
              source="CMS Medicare Part B ASP 2026, Inflation Reduction Act"
            />
          </div>

          <h2>{isEs ? 'Por qué los hospitales cobran tanto' : 'Why Hospitals Charge So Much'}</h2>

          <p>
            {isEs
              ? `Los hospitales facturan a "tarifas de instalación" que incluyen el costo de adquisición del medicamento más recargo por administración de enfermería, almacenamiento, equipo y gastos generales. Para un medicamento como la insulina (administrada con frecuencia, almacenamiento simple), gran parte de ese recargo es legalmente cuestionable cuando se factura por dosis individual.`
              : `Hospitals bill at "facility rates" that include the drug acquisition cost plus markup for nursing administration, storage, equipment, and overhead. For a drug like insulin (frequently administered, simple storage), much of that markup is legally questionable when billed per individual dose.`}
          </p>

          <p>
            {isEs
              ? 'CMS publica trimestralmente las "Tarifas Promedio de Venta" (ASP) — esencialmente lo que las compañías farmacéuticas cobran al hospital. Para la insulina en 2026, ese costo es $10 a $15 por unidad. Cuando el hospital lo factura a $50+ por unidad, está marcando 3x a 5x lo que pagó. En estancias intensivas con múltiples dosis al día, esto se acumula rápidamente.'
              : 'CMS publishes quarterly "Average Sales Prices" (ASP) — essentially what drug companies charge the hospital. For insulin in 2026, that cost is $10 to $15 per unit. When the hospital bills it at $50+ per unit, they are marking up 3x to 5x what they paid. In intensive stays with multiple doses per day, this accumulates quickly.'}
          </p>

          <h2>{isEs ? 'Códigos HCPCS J: lo que aparece en su factura' : 'HCPCS J-Codes: What Appears on Your Bill'}</h2>

          <p>
            {isEs
              ? 'La insulina hospitalaria aparece en su factura con códigos HCPCS J. Estos códigos son de dominio público (a diferencia de los códigos CPT) y puede usarlos para identificar exactamente qué le facturaron y disputar errores:'
              : 'Hospital insulin appears on your bill with HCPCS J-codes. These codes are public domain (unlike CPT codes) and you can use them to identify exactly what you were billed and dispute errors:'}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Códigos HCPCS J para insulina' : 'HCPCS J-codes for insulin'}
              headers={hcpcsHeaders}
              rows={hcpcsRows}
              footnote={isEs
                ? 'Estos son códigos de dominio público de la base de datos HCPCS Nivel II. CMS los publica anualmente.'
                : 'These are public-domain HCPCS Level II codes. CMS publishes them annually.'}
              source="CMS HCPCS Level II Coding"
            />
          </div>
        </div>

        {/* Mid-article CTA */}
        <AnalyzerCTA locale={locale} slug="drug-insulin-mid" variant="inline" />

        <div className="article-content">
          <h2>{isEs ? 'Programas de asistencia al paciente: $35/mes o gratis' : 'Patient Assistance Programs: $35/Month or Free'}</h2>

          <p>
            {isEs
              ? 'Los tres principales fabricantes de insulina (Eli Lilly, Novo Nordisk, Sanofi) ejecutan programas que esencialmente eliminan el problema del costo de insulina para la mayoría de los pacientes. Estos programas están disponibles para personas sin seguro, con seguro privado, y a veces incluso con Medicare:'
              : 'The three major insulin manufacturers (Eli Lilly, Novo Nordisk, Sanofi) run programs that essentially eliminate the insulin cost problem for most patients. These programs are available to uninsured people, privately-insured people, and sometimes even those on Medicare:'}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Programas de asistencia al paciente de fabricantes de insulina' : 'Insulin manufacturer patient assistance programs'}
              headers={papHeaders}
              rows={papRows}
              footnote={isEs
                ? 'La elegibilidad varía. Lilly Value Program está disponible para cualquiera. Novo Nordisk PAP requiere verificación de ingresos.'
                : 'Eligibility varies. Lilly Value Program is available to anyone. Novo Nordisk PAP requires income verification.'}
              source="Manufacturer program websites, NeedyMeds.org"
            />
          </div>

          <h2>{isEs ? 'El límite de $35/mes de Medicare Parte D' : 'The Medicare Part D $35/Month Cap'}</h2>

          <p>
            {isEs
              ? 'Si está en Medicare Parte D, paga $35 al mes por todas las insulinas, sin importar la marca o el plan. Este límite es de la Ley de Reducción de la Inflación de 2022, efectivo enero 2023. Es permanente. No tiene que cumplir ningún deducible. Si su farmacia le cobra más de $35/mes por insulina y tiene Parte D, llame al servicio de miembros de su plan inmediatamente: probablemente sea un error de facturación.'
              : 'If you are on Medicare Part D, you pay $35 per month for all insulins, regardless of brand or plan. This cap is from the Inflation Reduction Act of 2022, effective January 2023. It is permanent. You do not have to meet any deductible first. If your pharmacy charges more than $35/month for insulin and you have Part D, call your plan\'s member services immediately: this is likely a billing error.'}
          </p>

          <h2>{isEs ? 'Errores comunes en facturas de insulina hospitalaria' : 'Common Hospital Insulin Billing Errors'}</h2>

          <p>
            {isEs
              ? 'Si recibió una factura hospitalaria mostrando $200 o más por dosis de insulina, verifique estos errores antes de pagar:'
              : 'If you received a hospital bill showing $200 or more per insulin dose, check for these errors before paying:'}
          </p>

          <ul>
            <li>{isEs
              ? 'Facturado a tarifa de hospitalización cuando la dosis se administró ambulatoriamente'
              : 'Billed at inpatient rate when the dose was actually given outpatient'}</li>
            <li>{isEs
              ? 'Misma dosis facturada dos veces (el mismo vial registrado dos veces)'
              : 'Same dose billed twice (the same vial logged twice)'}</li>
            <li>{isEs
              ? 'Código J equivocado (J1815 vs J1817 inflando las unidades)'
              : 'Wrong J-code (J1815 vs J1817 inflating units)'}</li>
            <li>{isEs
              ? 'Cargo por vial completo cuando solo se usó dosis parcial'
              : 'Charged for full vial when only partial dose was used'}</li>
            <li>{isEs
              ? 'Tarifa de "administración por enfermería" agregada separadamente a un cargo inflado de medicamento'
              : '"Nursing administration" fee added separately on top of an inflated drug charge'}</li>
            <li>{isEs
              ? 'Marca de insulina sustituida (Lantus facturada cuando se le dio Levemir, o viceversa)'
              : 'Insulin brand substituted (Lantus billed when you received Levemir, or vice versa)'}</li>
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
        <AnalyzerCTA locale={locale} slug="drug-insulin-end" variant="inline" />

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
              href={`/${locale}/medical-bill-analyzer`}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--teal-dark)' }}
            >
              {isEs ? 'Analizador de Facturas Médicas' : 'Medical Bill Analyzer'}
            </Link>
            <Link
              href={`/${locale}/medicaid-income-limits`}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--teal-dark)' }}
            >
              {isEs ? 'Límites de Ingresos Medicaid' : 'Medicaid Income Limits'}
            </Link>
            <Link
              href={`/${locale}/cost/mri`}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--teal-dark)' }}
            >
              {isEs ? 'Costo de Resonancia Magnética' : 'MRI Cost'}
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
              <a href="https://www.cms.gov/medicare/medicare-part-b-drug-average-sales-price" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                CMS Medicare Part B Drug Average Sales Price (ASP).
              </a>
            </li>
            <li>
              2.{' '}
              <a href="https://www.cms.gov/inflation-reduction-act-and-medicare" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                CMS Inflation Reduction Act: insulin cost cap.
              </a>
            </li>
            <li>
              3.{' '}
              <a href="https://www.needymeds.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                NeedyMeds Patient Assistance Program Database.
              </a>
            </li>
            <li>
              4.{' '}
              <a href="https://www.cms.gov/medicare/coding/medicare-billing/hcpcs" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                CMS HCPCS Level II Coding (J-codes are public domain).
              </a>
            </li>
          </ol>
        </div>
      </article>
    </main>
  );
}
