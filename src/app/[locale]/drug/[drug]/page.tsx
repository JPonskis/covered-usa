import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  getFAQSchema,
  getBreadcrumbSchema,
  getMedicalWebPageSchema,
  getDrugSchema,
  buildSchemaGraph,
  COVEREDUSA_AUTHOR,
} from '@/lib/structured-data';
import {
  ReferenceTable,
  DatasetSchema,
  AnalyzerCTA,
  type ReferenceTableCell,
} from '@/components/reference';
import BlogDropCap from '@/components/BlogDropCap';
import {
  getAllDrugSlugs,
  getDrugBySlug,
  pickLocale,
} from '@/lib/drugs';

interface PageProps {
  params: Promise<{ locale: string; drug: string }>;
}

// Pre-render first 20 drugs × 2 locales at build time. Beyond that, ISR
// / on-demand handles the long tail.
export async function generateStaticParams() {
  const locales = ['en', 'es'];
  const params: { locale: string; drug: string }[] = [];
  const slugs = getAllDrugSlugs().slice(0, 20);
  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, drug: slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, drug } = await params;
  const data = getDrugBySlug(drug);
  if (!data) {
    return { title: 'Drug not found | CoveredUSA' };
  }
  return {
    title: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    alternates: {
      canonical: `https://coveredusa.org/${locale}/drug/${drug}`,
      languages: {
        en: `https://coveredusa.org/en/drug/${drug}`,
        es: `https://coveredusa.org/es/drug/${drug}`,
      },
    },
  };
}

export default async function DrugPage({ params }: PageProps) {
  const { locale, drug } = await params;
  setRequestLocale(locale);

  const data = getDrugBySlug(drug);
  if (!data) {
    notFound();
  }

  const isEs = locale === 'es';
  const faqs = isEs ? data.faqs.es : data.faqs.en;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Medicamentos' : 'Drugs', url: `/${locale}/drug` },
    { name: pickLocale(data.shortName, locale), url: `/${locale}/drug/${drug}` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/drug/${drug}`,
    name: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    lastReviewed: data.lastUpdated,
    about: pickLocale(data.shortName, 'en'),
    audience: 'Patient',
    medicalSpecialty: data.medicalSpecialty,
    author: COVEREDUSA_AUTHOR,
  });
  const drugSchema = getDrugSchema({
    name: pickLocale(data.drugName, 'en'),
    nonProprietaryName: data.nonProprietaryName,
    brandNames: data.brandNames,
    drugClass: pickLocale(data.drugClass, 'en'),
    hcpcsJCodes: data.hcpcsJCodes,
    description: pickLocale(data.hero.subhero, locale),
    url: `/${locale}/drug/${drug}`,
  });

  // Pricing table assembly
  const pricingHeaders = isEs
    ? ['Punto de pago', 'Costo típico', 'Notas']
    : ['Where you pay', 'Typical cost', 'Notes'];

  const pricingRows: ReferenceTableCell[][] = data.pointOfPay.rows.map((row) => [
    pickLocale(row.pointOfPay, locale),
    pickLocale(row.cost, locale),
    pickLocale(row.notes, locale),
  ]);

  // PAP table assembly (optional)
  const papHeaders = isEs
    ? ['Programa del fabricante', 'Costo / Beneficio', 'Cómo solicitar']
    : ['Manufacturer program', 'Cost / Benefit', 'How to apply'];

  const papRows: ReferenceTableCell[][] | null = data.patientAssistancePrograms
    ? data.patientAssistancePrograms.rows.map((row) => [
        row.program,
        pickLocale(row.costBenefit, locale),
        row.howToApply,
      ])
    : null;

  // HCPCS table assembly (optional)
  const hcpcsHeaders = isEs
    ? ['Código', 'Descripción', 'Qué buscar']
    : ['Code', 'Description', 'What to look for'];

  const hcpcsRows: ReferenceTableCell[][] | null = data.hcpcsSection
    ? data.hcpcsSection.rows.map((row) => [
        row.code,
        pickLocale(row.description, locale),
        pickLocale(row.whatToLookFor, locale),
      ])
    : null;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString(isEs ? 'es-US' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const pageGraph = buildSchemaGraph(
    [medicalWebPageSchema, breadcrumbSchema, faqSchema, drugSchema],
    `/${locale}/drug/${drug}`,
  );

  return (
    <main className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageGraph) }} />
      <DatasetSchema
        name={isEs
          ? `Datos de costo de ${pickLocale(data.shortName, locale)} ${data.pricing.partBDeductibleYear}`
          : `${data.pricing.partBDeductibleYear} ${pickLocale(data.shortName, locale)} Cost Data`}
        description={isEs
          ? `Datos de precios de ${pickLocale(data.shortName, locale)} ${data.pricing.partBDeductibleYear} a través de punto de pago: tarifa Medicare ASP, precio al por menor, cargo hospitalario, programas PAP, y códigos HCPCS.`
          : `${data.pricing.partBDeductibleYear} ${pickLocale(data.shortName, locale)} pricing data across point of pay: Medicare ASP, retail, inpatient, PAP programs, and HCPCS codes.`}
        url={`https://coveredusa.org/${locale}/drug/${drug}`}
        dateModified={data.lastUpdated}
        source={data.pointOfPay.tableSource}
        keywords={isEs
          ? [`costo ${pickLocale(data.shortName, 'es')}`, `${pickLocale(data.shortName, 'es')} sin seguro`, `precio ${pickLocale(data.shortName, 'es')} ${data.pricing.partBDeductibleYear}`, `Medicare ${pickLocale(data.shortName, 'es')}`]
          : [`${pickLocale(data.shortName, 'en')} cost`, `${pickLocale(data.shortName, 'en')} without insurance`, `${data.pricing.partBDeductibleYear} ${pickLocale(data.shortName, 'en')} price`, `Medicare ${pickLocale(data.shortName, 'en')}`]}
      />

      {/* Article Header */}
      <div className="warm-texture border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="category-tag">{isEs ? 'Costo de medicamento' : 'Drug Cost'}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              {formatDate(data.lastUpdated)}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              {data.readingTime}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              {isEs ? 'Por Jacob Posner, Fundador y Editor' : 'By Jacob Posner, Founder & Editor'}
            </span>
          </div>

          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
            style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
            data-speakable
          >
            {pickLocale(data.hero.h1, locale)}
          </h1>

          <p
            className="text-lg md:text-xl leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}
          >
            {pickLocale(data.hero.subhero, locale)}
          </p>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Quick Answer */}
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
            {pickLocale(data.quickAnswer, locale)}
          </p>
        </blockquote>

        <div className="article-content">
          <BlogDropCap />

          {data.introParagraphs.map((p, i) => (
            <p key={i}>{pickLocale(p, locale)}</p>
          ))}

          {data.iraNegotiation && (
            <aside
              className="my-8 rounded-xl border-l-4 p-6"
              style={{
                background: '#f0fdf4',
                borderLeftColor: '#15803d',
                borderColor: '#bbf7d0',
                borderWidth: '1px',
              }}
            >
              <h3 className="font-semibold text-[#0f172a] mb-3 text-base">
                {isEs
                  ? `Precio negociado por Medicare (efectivo ${new Date(data.iraNegotiation.effectiveDate).toLocaleDateString('es-US', { year: 'numeric', month: 'long', day: 'numeric' })})`
                  : `Medicare Negotiated Price — Effective ${new Date(data.iraNegotiation.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
              </h3>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[#64748b] mb-1">
                    {isEs ? 'Precio máximo justo' : 'Maximum Fair Price'}
                  </div>
                  <div className="text-2xl font-semibold text-[#15803d]">
                    ${data.iraNegotiation.maxFairPrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-[#64748b] mb-1">
                    {isEs ? 'Precio de lista anterior' : 'List Price Before'}
                  </div>
                  <div className="text-2xl font-semibold text-[#475569] line-through">
                    ${data.iraNegotiation.listPriceBefore.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-[#64748b] mb-1">
                    {isEs ? 'Ahorro' : 'Savings'}
                  </div>
                  <div className="text-2xl font-semibold text-[#15803d]">
                    {Math.round(
                      ((data.iraNegotiation.listPriceBefore - data.iraNegotiation.maxFairPrice) /
                        data.iraNegotiation.listPriceBefore) *
                        100,
                    )}
                    %
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#475569] mb-2">
                {pickLocale(data.iraNegotiation.callout, locale)}
              </p>
              <p className="text-xs text-[#94a3b8]">
                {isEs ? 'Fuente: ' : 'Source: '}
                <a
                  href={data.iraNegotiation.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {data.iraNegotiation.source.replace(/^https?:\/\//, '').split('/')[0]}
                </a>
              </p>
            </aside>
          )}

          <h2>
            {isEs
              ? `Cuánto cuesta ${pickLocale(data.shortName, locale)} por punto de pago (${data.pricing.partBDeductibleYear})`
              : `What ${pickLocale(data.shortName, locale)} Costs by Point of Pay (${data.pricing.partBDeductibleYear})`}
          </h2>

          <p>
            {isEs
              ? `El precio que paga depende casi por completo de DÓNDE paga. El mismo ${pickLocale(data.shortName, locale).toLowerCase()} puede costar muchas veces más en un hospital que en su farmacia local:`
              : `The price you pay depends almost entirely on WHERE you pay. The same ${pickLocale(data.shortName, locale).toLowerCase()} can cost many times more at a hospital than at your local pharmacy:`}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs
                ? `Precio de ${pickLocale(data.shortName, locale)} por punto de pago (${data.pricing.partBDeductibleYear})`
                : `${data.pricing.partBDeductibleYear} ${pickLocale(data.shortName, locale)} Price by Point of Pay`}
              headers={pricingHeaders}
              rows={pricingRows}
              footnote={pickLocale(data.pointOfPay.tableFootnote, locale)}
              source={data.pointOfPay.tableSource}
            />
          </div>

          <h2>{isEs ? 'Por qué los hospitales cobran tanto' : 'Why Hospitals Charge So Much'}</h2>

          {data.whyHospitalsCharge.paragraphs.map((p, i) => (
            <p key={i}>{pickLocale(p, locale)}</p>
          ))}

          {/* HCPCS section (optional) */}
          {data.hcpcsSection && hcpcsRows && (
            <>
              <h2>{isEs ? 'Códigos HCPCS J: lo que aparece en su factura' : 'HCPCS J-Codes: What Appears on Your Bill'}</h2>
              <p>{pickLocale(data.hcpcsSection.intro, locale)}</p>
              <div className="my-8">
                <ReferenceTable
                  caption={isEs ? `Códigos HCPCS J para ${pickLocale(data.shortName, locale)}` : `HCPCS J-codes for ${pickLocale(data.shortName, locale)}`}
                  headers={hcpcsHeaders}
                  rows={hcpcsRows}
                  footnote={pickLocale(data.hcpcsSection.footnote, locale)}
                  source={data.hcpcsSection.source}
                />
              </div>
            </>
          )}
        </div>

        {/* Mid-article CTA */}
        <AnalyzerCTA locale={locale} slug={`drug-${drug}-mid`} variant="inline" />

        <div className="article-content">
          {/* Patient Assistance Programs (optional) */}
          {data.patientAssistancePrograms && papRows && (
            <>
              <h2>{isEs ? 'Programas de asistencia al paciente' : 'Patient Assistance Programs'}</h2>
              <p>{pickLocale(data.patientAssistancePrograms.intro, locale)}</p>
              <div className="my-8">
                <ReferenceTable
                  caption={isEs
                    ? `Programas de asistencia al paciente para ${pickLocale(data.shortName, locale)}`
                    : `Patient assistance programs for ${pickLocale(data.shortName, locale)}`}
                  headers={papHeaders}
                  rows={papRows}
                  footnote={pickLocale(data.patientAssistancePrograms.footnote, locale)}
                  source={data.patientAssistancePrograms.source}
                />
              </div>
            </>
          )}

          {/* Medicare Part D section (optional) */}
          {data.medicarePartD && (
            <>
              <h2>
                {data.medicarePartD.hasSpecificCap
                  ? (isEs
                      ? `Cobertura Medicare Parte D para ${pickLocale(data.shortName, locale)}`
                      : `Medicare Part D Coverage for ${pickLocale(data.shortName, locale)}`)
                  : (isEs ? 'Medicare Parte D' : 'Medicare Part D')}
              </h2>
              {data.medicarePartD.paragraphs.map((p, i) => (
                <p key={i}>{pickLocale(p, locale)}</p>
              ))}
            </>
          )}

          {/* Common billing errors (optional) */}
          {data.commonBillingErrors && (
            <>
              <h2>
                {isEs
                  ? `Errores comunes en facturas de ${pickLocale(data.shortName, locale)}`
                  : `Common ${pickLocale(data.shortName, locale)} Billing Errors`}
              </h2>
              <p>{pickLocale(data.commonBillingErrors.intro, locale)}</p>
              <ul>
                {data.commonBillingErrors.items.map((item, i) => (
                  <li key={i}>{pickLocale(item, locale)}</li>
                ))}
              </ul>
            </>
          )}

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
        <AnalyzerCTA locale={locale} slug={`drug-${drug}-end`} variant="inline" />

        {/* Related links */}
        {data.relatedLinks.length > 0 && (
          <div className="mt-12">
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              {isEs ? 'Recursos Relacionados' : 'Related Resources'}
            </h2>
            <div className="flex flex-wrap gap-3">
              {data.relatedLinks.map((link, i) => (
                <Link
                  key={i}
                  href={`/${locale}${link.href}`}
                  className="text-sm px-4 py-2 rounded-lg transition-colors"
                  style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--teal-dark)' }}
                >
                  {pickLocale(link.label, locale)}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {data.sources.length > 0 && (
          <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
            <h2
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              {isEs ? 'Fuentes y referencias' : 'Sources & References'}
            </h2>
            <ol className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {data.sources.map((src, i) => (
                <li key={i}>
                  {i + 1}.{' '}
                  <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-dark)' }}>
                    {src.name}
                  </a>
                  {' — '}
                  {pickLocale(src.note, locale)}
                </li>
              ))}
            </ol>
          </div>
        )}
      </article>
    </main>
  );
}
