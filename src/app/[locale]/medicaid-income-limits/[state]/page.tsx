import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  getFAQSchema,
  getBreadcrumbSchema,
  getMedicalWebPageSchema,
  buildSchemaGraph,
  COVEREDUSA_AUTHOR,
} from '@/lib/structured-data';
import {
  ReferenceTable,
  DatasetSchema,
  ScreenerCTA,
  type ReferenceTableCell,
} from '@/components/reference';
import BlogDropCap from '@/components/BlogDropCap';
import {
  getAllMedicaidStateSlugs,
  getMedicaidStateData,
  pickLocale,
} from '@/lib/medicaid-income-limits';

interface PageProps {
  params: Promise<{ locale: string; state: string }>;
}

// Pre-render first 20 state pages × 2 locales at build time.
// Beyond that, ISR handles the long tail.
export async function generateStaticParams() {
  const locales = ['en', 'es'];
  const params: { locale: string; state: string }[] = [];
  const slugs = getAllMedicaidStateSlugs().slice(0, 20);
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
  const data = getMedicaidStateData(state);
  if (!data) {
    return { title: 'Medicaid income-limits page not found | CoveredUSA' };
  }
  return {
    title: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    alternates: {
      canonical: `https://coveredusa.org/${locale}/medicaid-income-limits/${state}`,
      languages: {
        en: `https://coveredusa.org/en/medicaid-income-limits/${state}`,
        es: `https://coveredusa.org/es/medicaid-income-limits/${state}`,
      },
    },
  };
}

export default async function MedicaidStateIncomeLimitsPage({
  params,
}: PageProps) {
  const { locale, state } = await params;
  setRequestLocale(locale);

  const data = getMedicaidStateData(state);
  if (!data) {
    notFound();
  }

  const isEs = locale === 'es';
  const faqs = isEs ? data.faqs.es : data.faqs.en;

  const stateName = pickLocale(data.stateName, locale);
  const stateBrandFullName = pickLocale(data.stateBrandFullName, locale);
  // A state "uses a brand" when its stateBrand is not the generic "[State] Medicaid"
  // form. Concretely: anything other than "Medicaid" or "<StateName> Medicaid".
  const genericBrandValue = `${pickLocale(data.stateName, 'en')} Medicaid`;
  const usesStateBrand =
    data.stateBrand !== 'Medicaid' && data.stateBrand !== genericBrandValue;

  // ─── Structured data ───────────────────────────────────────────────
  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    {
      name: isEs ? 'Límites de Ingresos Medicaid' : 'Medicaid Income Limits',
      url: `/${locale}/medicaid-income-limits`,
    },
    {
      name: stateName,
      url: `/${locale}/medicaid-income-limits/${state}`,
    },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/medicaid-income-limits/${state}`,
    name: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    lastReviewed: data.lastUpdated,
    about: `${data.stateBrand} (${pickLocale(data.stateName, 'en')} Medicaid)`,
    audience: 'Patient',
    medicalSpecialty: 'PublicHealth',
    author: COVEREDUSA_AUTHOR,
  });

  // ─── GovernmentService node — signals to AI engines that this page
  // ─── describes a government benefits program (Medicaid + state brand). ──
  const governmentServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: stateBrandFullName,
    alternateName: usesStateBrand ? [data.stateBrand, `${stateName} Medicaid`] : undefined,
    serviceType: 'Health insurance for low-income residents',
    areaServed: {
      '@type': 'State',
      name: stateName,
    },
    provider: {
      '@type': 'GovernmentOrganization',
      name: `${stateName} Medicaid Agency`,
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Low-income residents',
    },
    url: data.applicationProcess.portalUrl,
  };

  // ─── Number formatting helpers ─────────────────────────────────────
  const fmt = (n: number) =>
    n > 0 ? '$' + n.toLocaleString(isEs ? 'es-US' : 'en-US') : '—';

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString(isEs ? 'es-US' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // ─── Household-size table rows ─────────────────────────────────────
  // 7 columns: size, adult-annual, adult-monthly, child-annual, child-monthly,
  // pregnant-annual, pregnant-monthly. The FANOUT §3.3 mandate is "9-row
  // household-size table" — sizes 1-8 + each-additional. We fan adult/child/
  // pregnant across columns because Medicaid income gates differ across
  // populations within the same state.
  const householdHeaders = isEs
    ? [
        'Tamaño del hogar',
        'Adultos (anual)',
        'Adultos (mensual)',
        'Niños (anual)',
        'Niños (mensual)',
        'Embarazo (anual)',
        'Embarazo (mensual)',
      ]
    : [
        'Household size',
        'Adults (annual)',
        'Adults (monthly)',
        'Children (annual)',
        'Children (monthly)',
        'Pregnancy (annual)',
        'Pregnancy (monthly)',
      ];

  const householdRows: ReferenceTableCell[][] = data.householdSizeTable.rows.map(
    (row) => [
      pickLocale(row.label, locale),
      fmt(row.annualIncomeAdult),
      fmt(row.monthlyIncomeAdult),
      fmt(row.annualIncomeChild),
      fmt(row.monthlyIncomeChild),
      fmt(row.annualIncomePregnant),
      fmt(row.monthlyIncomePregnant),
    ]
  );

  const pageGraph = buildSchemaGraph(
    [medicalWebPageSchema, breadcrumbSchema, faqSchema, governmentServiceSchema],
    `/${locale}/medicaid-income-limits/${state}`,
  );

  return (
    <main className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageGraph) }}
      />
      <DatasetSchema
        name={
          isEs
            ? `Límites de ingresos de ${stateBrandFullName} ${data.dataYear}`
            : `${data.dataYear} ${stateBrandFullName} income limits`
        }
        description={
          isEs
            ? `Tabla completa de los límites de ingresos de ${stateBrandFullName} para ${data.dataYear} por tamaño de hogar (adultos, niños, embarazo). Basado en el Nivel Federal de Pobreza ${data.dataYear}.`
            : `Complete ${data.dataYear} ${stateBrandFullName} income limit table by household size for adults, children, and pregnancy coverage. Based on ${data.dataYear} Federal Poverty Level figures.`
        }
        url={`https://coveredusa.org/${locale}/medicaid-income-limits/${state}`}
        dateModified={data.lastUpdated}
        source={data.householdSizeTable.source}
        keywords={
          isEs
            ? data.keyTerms.es
            : data.keyTerms.en
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
              {isEs ? 'Límites de Ingresos Medicaid' : 'Medicaid Income Limits'}
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
            {pickLocale(data.hero.quickAnswer, locale)}
          </p>
        </blockquote>

        <div className="article-content">
          <BlogDropCap />

          {data.introParagraphs.map((p, i) => (
            <p key={i}>{pickLocale(p, locale)}</p>
          ))}

          {/* Household-size income limit table — the FANOUT §3.3 mandatory artifact */}
          <h2>
            {isEs
              ? `Límites de ingresos de ${stateBrandFullName} por tamaño de hogar (${data.dataYear})`
              : `${stateBrandFullName} income limits by household size (${data.dataYear})`}
          </h2>

          <p>{pickLocale(data.householdSizeTable.caption, locale)}</p>

          <div className="my-8">
            <ReferenceTable
              caption={
                isEs
                  ? `Guía de ingresos de ${stateBrandFullName} ${data.dataYear} por tamaño de hogar`
                  : `${data.dataYear} ${stateBrandFullName} income guidelines by household size`
              }
              headers={householdHeaders}
              rows={householdRows}
              footnote={pickLocale(data.householdSizeTable.footnote, locale)}
              source={data.householdSizeTable.source}
            />
          </div>

          {/* Eligibility requirements (non-income) */}
          <h2>
            {isEs
              ? `Requisitos de elegibilidad de ${stateBrandFullName} (no relacionados con ingresos)`
              : `${stateBrandFullName} eligibility requirements (non-income)`}
          </h2>
          <p>{pickLocale(data.eligibilityRequirements.intro, locale)}</p>
          <ul>
            {data.eligibilityRequirements.items.map((item, i) => (
              <li key={i}>{pickLocale(item, locale)}</li>
            ))}
          </ul>

          {/* What income counts / doesn't count */}
          <h2>
            {isEs
              ? `Qué ingresos cuentan para ${stateBrandFullName}`
              : `What income counts for ${stateBrandFullName}`}
          </h2>
          <p>{pickLocale(data.incomeSources.intro, locale)}</p>

          <h3>{isEs ? 'Ingresos incluidos' : 'Income sources included'}</h3>
          <ul>
            {data.incomeSources.included.map((item, i) => (
              <li key={i}>{pickLocale(item, locale)}</li>
            ))}
          </ul>

          <h3>{isEs ? 'Ingresos excluidos' : 'Income sources excluded'}</h3>
          <ul>
            {data.incomeSources.excluded.map((item, i) => (
              <li key={i}>{pickLocale(item, locale)}</li>
            ))}
          </ul>
        </div>

        {/* Mid-article CTA */}
        <ScreenerCTA
          locale={locale}
          slug={`medicaid-income-limits-${state}-mid`}
          variant="inline"
        />

        <div className="article-content">
          {/* How to apply */}
          <h2>
            {isEs
              ? `Cómo solicitar ${stateBrandFullName} en ${stateName}`
              : `How to apply for ${stateBrandFullName} in ${stateName}`}
          </h2>
          <p>{pickLocale(data.applicationProcess.intro, locale)}</p>

          <ol>
            {data.applicationProcess.steps.map((step, i) => (
              <li key={i}>{pickLocale(step, locale)}</li>
            ))}
          </ol>

          <p>
            <strong>
              {isEs ? 'Portal oficial: ' : 'Official portal: '}
            </strong>
            <a
              href={data.applicationProcess.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--teal-dark)' }}
            >
              {data.applicationProcess.portalName}
            </a>
          </p>

          <h3>{isEs ? 'Documentos necesarios' : 'Documents needed'}</h3>
          <ul>
            {data.applicationProcess.documentsNeeded.map((doc, i) => (
              <li key={i}>{pickLocale(doc, locale)}</li>
            ))}
          </ul>

          <p>
            <strong>
              {isEs ? 'Tiempo de procesamiento: ' : 'Processing timeline: '}
            </strong>
            {pickLocale(data.applicationProcess.processingTimeline, locale)}
          </p>

          <h3>
            {isEs
              ? 'Razones comunes por las que se deniega una solicitud'
              : 'Common reasons applications get denied'}
          </h3>
          <ul>
            {data.applicationProcess.commonDenialReasons.map((reason, i) => (
              <li key={i}>{pickLocale(reason, locale)}</li>
            ))}
          </ul>

          {/* CHIP cross-reference */}
          <h2>{pickLocale(data.chipCrossReference.heading, locale)}</h2>
          <p>{pickLocale(data.chipCrossReference.body, locale)}</p>
          {data.chipCrossReference.href && data.chipCrossReference.linkLabel && (
            <p>
              <Link
                href={`/${locale}${data.chipCrossReference.href}`}
                style={{ color: 'var(--teal-dark)' }}
              >
                {pickLocale(data.chipCrossReference.linkLabel, locale)}
              </Link>
            </p>
          )}

          {/* Medicare Savings Programs cross-reference */}
          <h2>{pickLocale(data.medicareSavingsProgramsCrossReference.heading, locale)}</h2>
          <p>{pickLocale(data.medicareSavingsProgramsCrossReference.body, locale)}</p>
          {data.medicareSavingsProgramsCrossReference.href &&
            data.medicareSavingsProgramsCrossReference.linkLabel && (
              <p>
                <Link
                  href={`/${locale}${data.medicareSavingsProgramsCrossReference.href}`}
                  style={{ color: 'var(--teal-dark)' }}
                >
                  {pickLocale(
                    data.medicareSavingsProgramsCrossReference.linkLabel,
                    locale
                  )}
                </Link>
              </p>
            )}

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
        <ScreenerCTA
          locale={locale}
          slug={`medicaid-income-limits-${state}-end`}
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
