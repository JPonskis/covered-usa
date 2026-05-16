import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  getFAQSchema,
  getBreadcrumbSchema,
  getMedicalWebPageSchema,
  getQAPageSchema,
  buildSchemaGraph,
  COVEREDUSA_AUTHOR,
} from '@/lib/structured-data';
import {
  ReferenceTable,
  ScreenerCTA,
  AnalyzerCTA,
  type ReferenceTableCell,
} from '@/components/reference';
import BlogDropCap from '@/components/BlogDropCap';
import ReactMarkdown from 'react-markdown';
import {
  getAllQASlugs,
  getQABySlug,
  pickLocale,
  pickLocaleArray,
  isStatusCell,
  type QATableCell,
} from '@/lib/qa';

interface PageProps {
  params: Promise<{ locale: string; question: string }>;
}

// Pre-render first 20 Q&As × 2 locales at build time
export async function generateStaticParams() {
  const locales = ['en', 'es'];
  const params: { locale: string; question: string }[] = [];
  const slugs = getAllQASlugs().slice(0, 20);
  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, question: slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, question } = await params;
  const data = getQABySlug(question);
  if (!data) {
    return { title: 'Question not found | CoveredUSA' };
  }
  return {
    title: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    alternates: {
      canonical: `https://coveredusa.org/${locale}/qa/${question}`,
      languages: {
        en: `https://coveredusa.org/en/qa/${question}`,
        es: `https://coveredusa.org/es/qa/${question}`,
      },
    },
  };
}

/** Convert a QATableCell (plain or status-coded) into the ReferenceTableCell shape. */
function cellToReferenceCell(cell: QATableCell, locale: string): ReferenceTableCell {
  if (isStatusCell(cell)) {
    return { value: pickLocale(cell.value, locale), status: cell.status };
  }
  return pickLocale(cell, locale);
}

export default async function QAPage({ params }: PageProps) {
  const { locale, question } = await params;
  setRequestLocale(locale);

  const data = getQABySlug(question);
  if (!data) {
    notFound();
  }

  const isEs = locale === 'es';
  const faqs = isEs ? data.faqs.es : data.faqs.en;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: pickLocale(data.question, locale), url: `/${locale}/qa/${question}` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/qa/${question}`,
    name: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    lastReviewed: data.lastUpdated,
    about: data.topic,
    audience: 'Patient',
    medicalSpecialty: data.medicalSpecialty,
    author: COVEREDUSA_AUTHOR,
  });
  const qaPageSchema = getQAPageSchema({
    question: pickLocale(data.question, locale),
    answer: pickLocale(data.fullAnswer, locale),
    url: `/${locale}/qa/${question}`,
  });

  // Coverage breakdown table (optional — pageType 'terminology' / 'definition' may omit it)
  const coverageHeaders = data.coverageBreakdown
    ? pickLocaleArray(data.coverageBreakdown.headers, locale)
    : null;
  const coverageRows: ReferenceTableCell[][] | null = data.coverageBreakdown
    ? data.coverageBreakdown.rows.map((row) =>
        row.cells.map((cell) => cellToReferenceCell(cell, locale))
      )
    : null;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString(isEs ? 'es-US' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const categoryLabel = isEs ? `${data.category} Q&A` : `${data.category} Q&A`;

  // Choose CTA component based on ctaTarget
  const CTAComponent = data.ctaTarget === 'analyzer' ? AnalyzerCTA : ScreenerCTA;

  const pageGraph = buildSchemaGraph(
    [medicalWebPageSchema, breadcrumbSchema, faqSchema, qaPageSchema],
    `/${locale}/qa/${question}`,
  );

  return (
    <main className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageGraph) }} />

      {/* Article Header */}
      <div className="warm-texture border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="category-tag">{categoryLabel}</span>
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
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4"
            style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
            data-speakable
          >
            {pickLocale(data.hero.h1, locale)}
          </h1>

          <p
            className="text-xl md:text-2xl font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--teal-dark)' }}
            data-speakable
          >
            {isEs ? 'Respuesta corta: ' : 'Short answer: '}
            <span style={{ color: 'var(--text-primary)' }}>{pickLocale(data.shortAnswer, locale)}</span>
          </p>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Full Answer blockquote */}
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
              {isEs ? 'Respuesta completa: ' : 'Full answer: '}
            </strong>
            {pickLocale(data.fullAnswer, locale)}
          </p>
        </blockquote>

        <div className="article-content">
          <BlogDropCap />

          {data.introParagraphs.map((p, i) => (
            <ReactMarkdown key={i}>{pickLocale(p, locale) || ''}</ReactMarkdown>
          ))}

          {/* Main coverage breakdown table — only when pageType is 'coverage' (or default) */}
          {data.coverageBreakdown && coverageHeaders && coverageRows && (
            <>
              <h2>{isEs ? 'Desglose de cobertura' : 'Coverage Breakdown'}</h2>
              <div className="my-8">
                <ReferenceTable
                  caption={isEs ? 'Cobertura por tipo' : 'Coverage by type'}
                  headers={coverageHeaders}
                  rows={coverageRows}
                  footnote={pickLocale(data.coverageBreakdown.footnote, locale)}
                  source={data.coverageBreakdown.source}
                />
              </div>
            </>
          )}

          {/*
            Mid-CTA split rule (per Phase 2C critic feedback):
            - If 3+ detail sections, split in half (pre-CTA: first half, post-CTA: second half).
            - If 1-2 sections, render all before the mid-CTA and let the post block be empty
              (avoids two CTAs touching back-to-back).
          */}
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
                <ReactMarkdown key={j}>{pickLocale(p, locale) || ''}</ReactMarkdown>
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
        <CTAComponent locale={locale} slug={`qa-${question}-mid`} variant="inline" />

        <div className="article-content">
          {/* Detail sections — render second half after mid CTA (per split rule above) */}
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
                <ReactMarkdown key={j}>{pickLocale(p, locale) || ''}</ReactMarkdown>
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

        {/* Divider ornament */}
        <div className="divider-ornament">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
          </svg>
        </div>

        {/* End CTA */}
        <CTAComponent locale={locale} slug={`qa-${question}-end`} variant="inline" />

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
