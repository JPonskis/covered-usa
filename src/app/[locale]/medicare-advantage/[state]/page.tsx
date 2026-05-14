import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  getFAQSchema,
  getBreadcrumbSchema,
  getMedicalWebPageSchema,
  COVEREDUSA_AUTHOR,
} from '@/lib/structured-data';
import {
  ReferenceTable,
  DatasetSchema,
  ScreenerCTA,
  AnalyzerCTA,
  type ReferenceTableCell,
} from '@/components/reference';
import BlogDropCap from '@/components/BlogDropCap';
import {
  getAllMAStateSlugs,
  getMAStateBySlug,
  pickLocale,
  pickLocaleArray,
} from '@/lib/medicare-advantage';

interface PageProps {
  params: Promise<{ locale: string; state: string }>;
}

// Pre-render first 20 state pages × 2 locales at build time.
// Beyond that, ISR handles the long tail.
export async function generateStaticParams() {
  const locales = ['en', 'es'];
  const params: { locale: string; state: string }[] = [];
  const slugs = getAllMAStateSlugs().slice(0, 20);
  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, state: slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, state } = await params;
  const data = getMAStateBySlug(state);
  if (!data) {
    return { title: 'Medicare Advantage page not found | CoveredUSA' };
  }
  return {
    title: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    alternates: {
      canonical: `https://coveredusa.org/${locale}/medicare-advantage/${state}`,
      languages: {
        en: `https://coveredusa.org/en/medicare-advantage/${state}`,
        es: `https://coveredusa.org/es/medicare-advantage/${state}`,
      },
    },
  };
}

export default async function MedicareAdvantageStatePage({
  params,
}: PageProps) {
  const { locale, state } = await params;
  setRequestLocale(locale);

  const data = getMAStateBySlug(state);
  if (!data) {
    notFound();
  }

  const isEs = locale === 'es';
  const faqs = isEs ? data.faqs.es : data.faqs.en;

  const stateName = pickLocale(data.stateName, locale);

  // ─── Structured data ───────────────────────────────────────────────
  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    {
      name: isEs ? 'Medicare Advantage' : 'Medicare Advantage',
      url: `/${locale}/medicare-advantage`,
    },
    {
      name: stateName,
      url: `/${locale}/medicare-advantage/${state}`,
    },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/medicare-advantage/${state}`,
    name: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    lastReviewed: data.lastUpdated,
    about: `Medicare Advantage in ${pickLocale(data.stateName, 'en')}`,
    audience: 'Consumer',
    medicalSpecialty: data.medicalSpecialty,
    author: COVEREDUSA_AUTHOR,
  });

  // ─── Market overview table (top carriers) ──────────────────────────
  const carrierHeaders = isEs
    ? ['Aseguradora', 'Planes', 'Calificación promedio', 'Prima promedio']
    : ['Carrier', 'Plans', 'Avg Star Rating', 'Avg Premium'];
  const carrierRows: ReferenceTableCell[][] = data.marketOverview.topCarriers.map(
    (c) => [
      c.name,
      c.planCount.toString(),
      c.averageStarRating.toFixed(1),
      `$${c.averagePremium.toFixed(0)}/mo`,
    ]
  );

  // ─── Plan types table ──────────────────────────────────────────────
  const planTypeHeaders = pickLocaleArray(data.planTypes.headers, locale);
  const planTypeRows: ReferenceTableCell[][] = data.planTypes.rows.map((row) =>
    pickLocaleArray(row, locale)
  );

  // ─── County variance table (optional) ──────────────────────────────
  const countyHeaders = isEs
    ? ['Condado', 'Planes disponibles', 'Prima promedio']
    : ['County', 'Plans Available', 'Avg Premium'];
  const countyRows: ReferenceTableCell[][] | null = data.countyVariance
    ? data.countyVariance.examples.map((ex) => [
        pickLocale(ex.county, locale),
        ex.planCount.toString(),
        `$${ex.averagePremium.toFixed(0)}/mo`,
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

  // ─── CTA selection — Medicare-shopping flows route to screener by default ──
  const CTAComponent = data.ctaTarget === 'analyzer' ? AnalyzerCTA : ScreenerCTA;

  // ─── Number formatting helper for prose-quoted stats ─────────────────
  const fmtNum = (n: number) =>
    n.toLocaleString(isEs ? 'es-US' : 'en-US');

  return (
    <main className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPageSchema) }}
      />
      <DatasetSchema
        name={
          isEs
            ? `Datos de Medicare Advantage en ${stateName} ${data.marketOverview.dataYear}`
            : `${data.marketOverview.dataYear} Medicare Advantage Data for ${stateName}`
        }
        description={
          isEs
            ? `Datos de planes de Medicare Advantage ${data.marketOverview.dataYear} en ${stateName}: total de planes, aseguradoras principales, primas promedio y calificaciones de estrellas.`
            : `${data.marketOverview.dataYear} Medicare Advantage market data for ${stateName}: total plan count, top carriers, average premiums, and Star Ratings.`
        }
        url={`https://coveredusa.org/${locale}/medicare-advantage/${state}`}
        dateModified={data.lastUpdated}
        source={data.marketOverview.source}
        keywords={
          isEs
            ? [
                `Medicare Advantage ${stateName}`,
                `planes Medicare ${stateName} ${data.marketOverview.dataYear}`,
                `Medicare Advantage ${data.stateAbbreviation}`,
                `mejor Medicare Advantage ${stateName}`,
              ]
            : [
                `Medicare Advantage ${stateName}`,
                `${data.marketOverview.dataYear} Medicare Advantage plans ${stateName}`,
                `Medicare Advantage ${data.stateAbbreviation}`,
                `best Medicare Advantage plans ${stateName}`,
              ]
        }
      />

      {/* Article Header */}
      <div
        className="warm-texture border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="category-tag">
              {isEs ? 'Medicare Advantage' : 'Medicare Advantage'}
            </span>
            <span
              className="text-sm"
              style={{
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body), Georgia, serif',
              }}
            >
              {formatDate(data.lastUpdated)}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span
              className="text-sm"
              style={{
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body), Georgia, serif',
              }}
            >
              {data.readingTime}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span
              className="text-sm"
              style={{
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body), Georgia, serif',
              }}
            >
              {isEs ? 'Por Jacob Posner, Fundador y Editor' : 'By Jacob Posner, Founder & Editor'}
            </span>
          </div>

          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
            }}
            data-speakable
          >
            {pickLocale(data.hero.h1, locale)}
          </h1>

          <p
            className="text-lg md:text-xl leading-relaxed"
            style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body), Georgia, serif',
            }}
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
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body), Georgia, serif',
            }}
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

          {/* Market overview ─ carrier breakdown */}
          <h2>
            {isEs
              ? `Panorama del mercado de Medicare Advantage en ${stateName} (${data.marketOverview.dataYear})`
              : `${data.marketOverview.dataYear} Medicare Advantage Market Overview in ${stateName}`}
          </h2>

          <p>
            {isEs
              ? `En ${data.marketOverview.dataYear}, ${stateName} tiene ${fmtNum(data.marketOverview.totalPlansAvailable)} planes de Medicare Advantage disponibles, con ${fmtNum(data.marketOverview.enrolledBeneficiaries)} beneficiarios inscritos (${data.marketOverview.penetrationPct.toFixed(0)}% de penetración). La prima mensual promedio es de $${data.marketOverview.averageMonthlyPremium.toFixed(0)} y la calificación promedio de estrellas es ${data.marketOverview.averageStarRating.toFixed(1)}.`
              : `In ${data.marketOverview.dataYear}, ${stateName} has ${fmtNum(data.marketOverview.totalPlansAvailable)} Medicare Advantage plans available, with ${fmtNum(data.marketOverview.enrolledBeneficiaries)} beneficiaries enrolled (${data.marketOverview.penetrationPct.toFixed(0)}% MA penetration). The average monthly premium is $${data.marketOverview.averageMonthlyPremium.toFixed(0)} and the statewide average Star Rating is ${data.marketOverview.averageStarRating.toFixed(1)}.`}
          </p>

          <div className="my-8">
            <ReferenceTable
              caption={
                isEs
                  ? `Aseguradoras principales de Medicare Advantage en ${stateName} (${data.marketOverview.dataYear})`
                  : `Top Medicare Advantage carriers in ${stateName} (${data.marketOverview.dataYear})`
              }
              headers={carrierHeaders}
              rows={carrierRows}
              source={data.marketOverview.source}
            />
          </div>

          {/* Plan types breakdown */}
          <h2>
            {isEs
              ? `Tipos de plan en ${stateName}: HMO vs PPO vs SNP`
              : `Plan Types in ${stateName}: HMO vs PPO vs SNP`}
          </h2>

          <div className="my-8">
            <ReferenceTable
              caption={
                isEs
                  ? `Desglose de tipos de plan de Medicare Advantage en ${stateName}`
                  : `Medicare Advantage plan-type breakdown in ${stateName}`
              }
              headers={planTypeHeaders}
              rows={planTypeRows}
              footnote={pickLocale(data.planTypes.footnote, locale)}
              source={data.planTypes.source}
            />
          </div>

          {/* County variance (optional) */}
          {data.countyVariance && countyRows && (
            <>
              <h2>
                {isEs
                  ? `Variación por condado en ${stateName}`
                  : `County-Level Variance in ${stateName}`}
              </h2>
              <p>{pickLocale(data.countyVariance.intro, locale)}</p>
              <div className="my-8">
                <ReferenceTable
                  caption={
                    isEs
                      ? `Planes y prima promedio por condado en ${stateName}`
                      : `Plan count and average premium by county in ${stateName}`
                  }
                  headers={countyHeaders}
                  rows={countyRows}
                  footnote={pickLocale(data.countyVariance.footnote, locale)}
                  source={data.countyVariance.source}
                />
              </div>
            </>
          )}
        </div>

        {/* Mid-article CTA */}
        <CTAComponent
          locale={locale}
          slug={`medicare-advantage-${state}-mid`}
          variant="inline"
        />

        <div className="article-content">
          {/* What to look for */}
          <h2>
            {isEs
              ? `Qué buscar en un plan de Medicare Advantage en ${stateName}`
              : `What to Look For in a Medicare Advantage Plan in ${stateName}`}
          </h2>
          <p>{pickLocale(data.whatToLookFor.intro, locale)}</p>
          <ul>
            {data.whatToLookFor.items.map((item, i) => (
              <li key={i}>{pickLocale(item, locale)}</li>
            ))}
          </ul>

          {/* Important dates */}
          <h2>
            {isEs
              ? `Fechas clave de Medicare en ${stateName}`
              : `Key Medicare Dates in ${stateName}`}
          </h2>
          <p>{pickLocale(data.importantDates.intro, locale)}</p>
          <ul>
            {data.importantDates.items.map((d, i) => (
              <li key={i}>
                <strong>{pickLocale(d.label, locale)}:</strong>{' '}
                {pickLocale(d.date, locale)}
                {d.note && <> — {pickLocale(d.note, locale)}</>}
              </li>
            ))}
          </ul>

          {/* State-specific extras (optional) */}
          {data.stateExtras && (
            <>
              <h2>
                {isEs
                  ? `Beneficios extras únicos en ${stateName}`
                  : `Notable Extras in ${stateName} Plans`}
              </h2>
              <p>{pickLocale(data.stateExtras.intro, locale)}</p>
              <ul>
                {data.stateExtras.items.map((ex, i) => (
                  <li key={i}>
                    <strong>{pickLocale(ex.label, locale)}:</strong>{' '}
                    {pickLocale(ex.description, locale)}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Detail sections */}
          {data.detailSections.map((section, i) => (
            <div key={i}>
              <h2>{pickLocale(section.heading, locale)}</h2>
              {section.paragraphs.map((p, j) => (
                <p key={j}>{pickLocale(p, locale)}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((li, j) => (
                    <li key={j}>{pickLocale(li, locale)}</li>
                  ))}
                </ul>
              )}
              {section.table && (
                <div className="my-8">
                  <ReferenceTable
                    caption={
                      isEs
                        ? `Detalle de ${pickLocale(section.heading, locale)}`
                        : `${pickLocale(section.heading, locale)} detail`
                    }
                    headers={pickLocaleArray(section.table.headers, locale)}
                    rows={section.table.rows.map((row) =>
                      pickLocaleArray(row, locale)
                    )}
                    footnote={
                      section.table.footnote
                        ? pickLocale(section.table.footnote, locale)
                        : undefined
                    }
                    source={section.table.source}
                  />
                </div>
              )}
            </div>
          ))}

          {/* FAQs */}
          <h2>
            {isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
          </h2>
          {faqs.map((faq, i) => (
            <div key={i}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>

        {/* Divider ornament */}
        <div className="divider-ornament">
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
          </svg>
        </div>

        {/* End CTA */}
        <CTAComponent
          locale={locale}
          slug={`medicare-advantage-${state}-end`}
          variant="inline"
        />

        {/* Related links */}
        {data.relatedLinks.length > 0 && (
          <div className="mt-12">
            <h2
              className="text-lg font-semibold mb-4"
              style={{
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-display), Georgia, serif',
              }}
            >
              {isEs ? 'Recursos Relacionados' : 'Related Resources'}
            </h2>
            <div className="flex flex-wrap gap-3">
              {data.relatedLinks.map((link, i) => (
                <Link
                  key={i}
                  href={`/${locale}${link.href}`}
                  className="text-sm px-4 py-2 rounded-lg transition-colors"
                  style={{
                    background: 'white',
                    border: '1px solid var(--border)',
                    color: 'var(--teal-dark)',
                  }}
                >
                  {pickLocale(link.label, locale)}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {data.sources.length > 0 && (
          <div
            className="mt-12 pt-8"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <h2
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-display), Georgia, serif',
              }}
            >
              {isEs ? 'Fuentes y referencias' : 'Sources & References'}
            </h2>
            <ol
              className="space-y-2 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {data.sources.map((src, i) => (
                <li key={i}>
                  {i + 1}.{' '}
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--teal-dark)' }}
                  >
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
