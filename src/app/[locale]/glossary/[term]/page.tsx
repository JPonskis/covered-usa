import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  getFAQSchema,
  getBreadcrumbSchema,
  getMedicalWebPageSchema,
  getDefinedTermSchema,
  COVEREDUSA_AUTHOR,
} from '@/lib/structured-data';
import {
  ReferenceTable,
  ScreenerCTA,
  AnalyzerCTA,
  type ReferenceTableCell,
} from '@/components/reference';
import BlogDropCap from '@/components/BlogDropCap';
import {
  getAllGlossarySlugs,
  getGlossaryBySlug,
  pickLocale,
  pickLocaleArray,
} from '@/lib/glossary';

interface PageProps {
  params: Promise<{ locale: string; term: string }>;
}

export async function generateStaticParams() {
  const locales = ['en', 'es'];
  const params: { locale: string; term: string }[] = [];
  const slugs = getAllGlossarySlugs().slice(0, 20);
  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, term: slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, term } = await params;
  const data = getGlossaryBySlug(term);
  if (!data) return { title: 'Term not found | CoveredUSA' };
  return {
    title: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    alternates: {
      canonical: `https://coveredusa.org/${locale}/glossary/${term}`,
      languages: {
        en: `https://coveredusa.org/en/glossary/${term}`,
        es: `https://coveredusa.org/es/glossary/${term}`,
      },
    },
  };
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { locale, term } = await params;
  setRequestLocale(locale);

  const data = getGlossaryBySlug(term);
  if (!data) notFound();

  const isEs = locale === 'es';
  const faqs = isEs ? data.faqs.es : data.faqs.en;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Glosario' : 'Glossary', url: `/${locale}/glossary` },
    { name: pickLocale(data.term, locale), url: `/${locale}/glossary/${term}` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/glossary/${term}`,
    name: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    lastReviewed: data.lastUpdated,
    about: data.topic,
    audience: 'Consumer',
    medicalSpecialty: data.medicalSpecialty,
    author: COVEREDUSA_AUTHOR,
  });
  const definedTermSchema = getDefinedTermSchema({
    name: pickLocale(data.term, locale),
    description: pickLocale(data.definition, locale),
    url: `/${locale}/glossary/${term}`,
    alternateNames: data.alternateNames,
  });

  // Annual limits table (optional)
  const annualLimitsHeaders = data.annualLimits
    ? pickLocaleArray(data.annualLimits.headers, locale)
    : null;
  const annualLimitsRows: ReferenceTableCell[][] | null = data.annualLimits
    ? data.annualLimits.rows.map((row) => pickLocaleArray(row, locale))
    : null;

  // Worked example table (optional)
  const exampleHeaders = data.workedExample
    ? pickLocaleArray(data.workedExample.headers, locale)
    : null;
  const exampleRows: ReferenceTableCell[][] | null = data.workedExample
    ? data.workedExample.rows.map((row) => pickLocaleArray(row, locale))
    : null;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString(isEs ? 'es-US' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const CTAComponent = data.ctaTarget === 'analyzer' ? AnalyzerCTA : ScreenerCTA;

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

      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Quick Definition blockquote */}
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
            {pickLocale(data.quickDefinition, locale)}
          </p>
        </blockquote>

        <div className="article-content">
          <BlogDropCap />

          {data.introParagraphs.map((p, i) => (
            <p key={i}>{pickLocale(p, locale)}</p>
          ))}

          {/* Annual limits table (optional) */}
          {data.annualLimits && annualLimitsHeaders && annualLimitsRows && (
            <>
              <h2>
                {isEs
                  ? `Límites anuales de ${pickLocale(data.term, locale)}`
                  : `Annual ${pickLocale(data.term, locale)} Limits`}
              </h2>
              <div className="my-8">
                <ReferenceTable
                  caption={isEs ? `Límites anuales actuales` : `Current annual limits`}
                  headers={annualLimitsHeaders}
                  rows={annualLimitsRows}
                  footnote={pickLocale(data.annualLimits.footnote, locale)}
                  source={data.annualLimits.source}
                />
              </div>
            </>
          )}

          {/* What counts toward (optional) */}
          {data.whatCountsToward && (
            <>
              <h2>
                {isEs
                  ? `Lo que cuenta hacia el ${pickLocale(data.term, locale)}`
                  : `What Counts Toward the ${pickLocale(data.term, locale)}`}
              </h2>
              <p>{pickLocale(data.whatCountsToward.intro, locale)}</p>
              <ul>
                {data.whatCountsToward.items.map((item, i) => (
                  <li key={i}>{pickLocale(item, locale)}</li>
                ))}
              </ul>
            </>
          )}

          {/* What does NOT count toward (optional) */}
          {data.whatDoesNotCountToward && (
            <>
              <h2>
                {isEs
                  ? `Lo que NO cuenta hacia el ${pickLocale(data.term, locale)}`
                  : `What Does NOT Count Toward the ${pickLocale(data.term, locale)}`}
              </h2>
              <p>{pickLocale(data.whatDoesNotCountToward.intro, locale)}</p>
              <ul>
                {data.whatDoesNotCountToward.items.map((item, i) => (
                  <li key={i}>{pickLocale(item, locale)}</li>
                ))}
              </ul>
            </>
          )}

          {/* Worked example (optional) */}
          {data.workedExample && exampleHeaders && exampleRows && (
            <>
              <h2>
                {isEs
                  ? `Ejemplo: cómo funciona en la práctica`
                  : `Example: How It Works in Practice`}
              </h2>
              <p>{pickLocale(data.workedExample.intro, locale)}</p>
              <div className="my-8">
                <ReferenceTable
                  caption={isEs ? 'Ejemplo trabajado' : 'Worked example'}
                  headers={exampleHeaders}
                  rows={exampleRows}
                  footnote={pickLocale(data.workedExample.footnote, locale)}
                />
              </div>
            </>
          )}

          {/* Detail sections — render first half before mid CTA (guard for short pages) */}
          {(() => {
            const splitAt =
              data.detailSections.length <= 2
                ? data.detailSections.length
                : Math.ceil(data.detailSections.length / 2);
            return data.detailSections.slice(0, splitAt);
          })().map((section, i) => (
            <div key={`pre-${i}`}>
              <h2>{pickLocale(section.heading, locale)}</h2>
              {section.paragraphs.map((p, j) => (
                <p key={j}>{pickLocale(p, locale)}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((item, j) => (
                    <li key={j}>{pickLocale(item, locale)}</li>
                  ))}
                </ul>
              )}
              {section.table && (
                <div className="my-8">
                  <ReferenceTable
                    caption={pickLocale(section.table.caption, locale)}
                    headers={pickLocaleArray(section.table.headers, locale)}
                    rows={section.table.rows.map((row) => pickLocaleArray(row, locale))}
                    footnote={pickLocale(section.table.footnote, locale)}
                    source={section.table.source}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mid-article CTA */}
        <CTAComponent locale={locale} slug={`glossary-${term}-mid`} variant="inline" />

        <div className="article-content">
          {(() => {
            const splitAt =
              data.detailSections.length <= 2
                ? data.detailSections.length
                : Math.ceil(data.detailSections.length / 2);
            return data.detailSections.slice(splitAt);
          })().map((section, i) => (
            <div key={`post-${i}`}>
              <h2>{pickLocale(section.heading, locale)}</h2>
              {section.paragraphs.map((p, j) => (
                <p key={j}>{pickLocale(p, locale)}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((item, j) => (
                    <li key={j}>{pickLocale(item, locale)}</li>
                  ))}
                </ul>
              )}
              {section.table && (
                <div className="my-8">
                  <ReferenceTable
                    caption={pickLocale(section.table.caption, locale)}
                    headers={pickLocaleArray(section.table.headers, locale)}
                    rows={section.table.rows.map((row) => pickLocaleArray(row, locale))}
                    footnote={pickLocale(section.table.footnote, locale)}
                    source={section.table.source}
                  />
                </div>
              )}
            </div>
          ))}

          <h2>{isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}</h2>

          {faqs.map((faq, i) => (
            <div key={i}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="divider-ornament">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
          </svg>
        </div>

        <CTAComponent locale={locale} slug={`glossary-${term}-end`} variant="inline" />

        {data.relatedLinks.length > 0 && (
          <div className="mt-12">
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              {isEs ? 'Términos Relacionados' : 'Related Terms'}
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
