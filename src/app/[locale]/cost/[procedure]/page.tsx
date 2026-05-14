import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  getFAQSchema,
  getBreadcrumbSchema,
  getMedicalWebPageSchema,
  getMedicalProcedureSchema,
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
  getAllProcedureSlugs,
  getProcedureBySlug,
  pickLocale,
  pickLocaleArray,
} from '@/lib/procedures';

interface PageProps {
  params: Promise<{ locale: string; procedure: string }>;
}

// Pre-render first 20 procedures × 2 locales at build time.
// Beyond that, ISR / on-demand handles the long tail.
export async function generateStaticParams() {
  const locales = ['en', 'es'];
  const params: { locale: string; procedure: string }[] = [];
  const slugs = getAllProcedureSlugs().slice(0, 20);
  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, procedure: slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, procedure } = await params;
  const data = getProcedureBySlug(procedure);
  if (!data) {
    return { title: 'Procedure not found | CoveredUSA' };
  }
  const isEs = locale === 'es';
  return {
    title: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    alternates: {
      canonical: `https://coveredusa.org/${locale}/cost/${procedure}`,
      languages: {
        en: `https://coveredusa.org/en/cost/${procedure}`,
        es: `https://coveredusa.org/es/cost/${procedure}`,
      },
    },
  };
}

export default async function ProcedureCostPage({ params }: PageProps) {
  const { locale, procedure } = await params;
  setRequestLocale(locale);

  const data = getProcedureBySlug(procedure);
  if (!data) {
    notFound();
  }

  const isEs = locale === 'es';
  const faqs = isEs ? data.faqs.es : data.faqs.en;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Costos' : 'Costs', url: `/${locale}/cost` },
    { name: pickLocale(data.shortName, locale), url: `/${locale}/cost/${procedure}` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/cost/${procedure}`,
    name: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    lastReviewed: data.lastUpdated,
    about: pickLocale(data.shortName, 'en'),
    audience: 'Patient',
    medicalSpecialty: data.medicalSpecialty,
    author: COVEREDUSA_AUTHOR,
  });
  const medicalProcedureSchema = getMedicalProcedureSchema({
    name: pickLocale(data.procedureName, locale),
    description: pickLocale(data.hero.subhero, locale),
    url: `/${locale}/cost/${procedure}`,
    procedureType: data.procedureType,
    estimatedCostLow: data.pricing.nationalLow,
    estimatedCostHigh: data.pricing.nationalHigh,
  });

  // Pricing table assembly
  const pricingHeaders = isEs
    ? ['Sitio de servicio', 'Rango sin seguro', `Tarifa de Medicare ${data.pricing.partBDeductibleYear}`]
    : ['Site of Service', 'Range Without Insurance', `${data.pricing.partBDeductibleYear} Medicare Rate`];

  const pricingRows: ReferenceTableCell[][] = data.siteOfService.rows.map((row) => [
    pickLocale(row.siteName, locale),
    row.rangeWithoutInsurance,
    pickLocale(row.medicareRate, locale),
  ]);

  // Variant table assembly (optional)
  const variantHeaders = data.variants ? pickLocaleArray(data.variants.headers, locale) : null;
  const variantRows: ReferenceTableCell[][] | null = data.variants
    ? data.variants.rows.map((row) => pickLocaleArray(row, locale))
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
    [medicalWebPageSchema, breadcrumbSchema, faqSchema, medicalProcedureSchema],
    `/${locale}/cost/${procedure}`,
  );

  return (
    <main className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageGraph) }} />
      <DatasetSchema
        name={isEs
          ? `Datos de costo de ${pickLocale(data.shortName, locale)} ${data.pricing.partBDeductibleYear}`
          : `${data.pricing.partBDeductibleYear} ${pickLocale(data.shortName, locale)} Cost Data`}
        description={isEs
          ? `Datos de precios de ${pickLocale(data.shortName, locale)} ${data.pricing.partBDeductibleYear} por sitio de servicio, con tarifas de Medicare.`
          : `${data.pricing.partBDeductibleYear} ${pickLocale(data.shortName, locale)} pricing data by site of service, with Medicare rates.`}
        url={`https://coveredusa.org/${locale}/cost/${procedure}`}
        dateModified={data.lastUpdated}
        source={data.siteOfService.tableSource}
        keywords={isEs
          ? [`costo ${pickLocale(data.shortName, 'es')}`, `${pickLocale(data.shortName, 'es')} sin seguro`, `precio ${data.pricing.partBDeductibleYear}`, `Medicare ${pickLocale(data.shortName, 'es')}`]
          : [`${pickLocale(data.shortName, 'en')} cost`, `${pickLocale(data.shortName, 'en')} without insurance`, `${data.pricing.partBDeductibleYear} ${pickLocale(data.shortName, 'en')} price`, `Medicare ${pickLocale(data.shortName, 'en')} rate`]}
      />

      {/* Article Header */}
      <div className="warm-texture border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="category-tag">{isEs ? 'Costo de procedimiento' : 'Procedure Cost'}</span>
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
            {pickLocale(data.quickAnswer, locale)}
          </p>
        </blockquote>

        <div className="article-content">
          <BlogDropCap />

          {data.introParagraphs.map((p, i) => (
            <p key={i}>{pickLocale(p, locale)}</p>
          ))}

          <h2>
            {isEs
              ? `Costo de ${pickLocale(data.shortName, locale)} por Sitio de Servicio (${data.pricing.partBDeductibleYear})`
              : `${pickLocale(data.shortName, locale)} Cost by Site of Service in ${data.pricing.partBDeductibleYear}`}
          </h2>

          <p>
            {isEs
              ? `El factor de costo más grande de ${pickLocale(data.shortName, locale)} es el sitio de servicio: dónde se realiza el procedimiento. Los datos de transparencia de precios de CMS ${data.pricing.partBDeductibleYear} confirman una diferencia de 2-3 veces en facturación entre los centros independientes y los departamentos ambulatorios de hospitales.`
              : `The biggest cost driver of ${pickLocale(data.shortName, locale)} is the site of service: where the procedure is performed. ${data.pricing.partBDeductibleYear} CMS price transparency data confirms a 2-3x billing differential between independent centers and hospital outpatient departments.`}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs
                ? `Precios de ${pickLocale(data.shortName, locale)} sin seguro vs. tarifas de Medicare ${data.pricing.partBDeductibleYear}`
                : `${pickLocale(data.shortName, locale)} prices without insurance vs. ${data.pricing.partBDeductibleYear} Medicare rates`}
              headers={pricingHeaders}
              rows={pricingRows}
              footnote={pickLocale(data.siteOfService.tableFootnote, locale)}
              source={data.siteOfService.tableSource}
            />
          </div>

          <h2>
            {isEs
              ? `¿Por qué el mismo procedimiento es tanto más caro en un hospital?`
              : `Why the Same Procedure Is So Much More at a Hospital`}
          </h2>

          {data.siteOfService.explanationParagraphs.map((p, i) => (
            <p key={i}>{pickLocale(p, locale)}</p>
          ))}
        </div>

        {/* Mid-article CTA */}
        <AnalyzerCTA locale={locale} slug={`cost-${procedure}`} variant="inline" />

        <div className="article-content">
          {/* Variant section (optional) */}
          {data.variants && variantHeaders && variantRows && (
            <>
              <h2>{pickLocale(data.variants.heading, locale)}</h2>
              <p>{pickLocale(data.variants.intro, locale)}</p>
              <div className="my-8">
                <ReferenceTable
                  caption={isEs
                    ? `Costo típico por variante`
                    : `Typical cost by variant`}
                  headers={variantHeaders}
                  rows={variantRows}
                  footnote={pickLocale(data.variants.footnote, locale)}
                  source={data.variants.source}
                />
              </div>
            </>
          )}

          <h2>
            {isEs
              ? `Lo que Medicare paga por ${pickLocale(data.shortName, locale)}`
              : `What Medicare Pays for ${pickLocale(data.shortName, locale)}`}
          </h2>

          {data.medicareSection.paragraphs.map((p, i) => (
            <p key={i}>{pickLocale(p, locale)}</p>
          ))}

          <h2>
            {isEs
              ? `¿Qué factores afectan el costo?`
              : `What Factors Affect Cost`}
          </h2>

          <ul>
            {data.factorsAffectingCost.items.map((item, i) => (
              <li key={i}>{pickLocale(item, locale)}</li>
            ))}
          </ul>

          {/* Billing errors (optional) */}
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
        <AnalyzerCTA locale={locale} slug={`cost-${procedure}-end`} variant="inline" />

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
