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
  ScreenerCTA,
  AnalyzerCTA,
  type ReferenceTableCell,
} from '@/components/reference';
import BlogDropCap from '@/components/BlogDropCap';
import ReactMarkdown from 'react-markdown';
import {
  getAllPersonaSlugs,
  getPersonaBySlug,
  pickLocale,
  pickLocaleArray,
} from '@/lib/personas';

interface PageProps {
  params: Promise<{ locale: string; persona: string }>;
}

export async function generateStaticParams() {
  const locales = ['en', 'es'];
  const params: { locale: string; persona: string }[] = [];
  const slugs = getAllPersonaSlugs().slice(0, 20);
  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, persona: slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, persona } = await params;
  const data = getPersonaBySlug(persona);
  if (!data) return { title: 'Persona not found | CoveredUSA' };
  return {
    title: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    alternates: {
      canonical: `https://coveredusa.org/${locale}/for/${persona}`,
      languages: {
        en: `https://coveredusa.org/en/for/${persona}`,
        es: `https://coveredusa.org/es/for/${persona}`,
      },
    },
  };
}

export default async function PersonaPage({ params }: PageProps) {
  const { locale, persona } = await params;
  setRequestLocale(locale);

  const data = getPersonaBySlug(persona);
  if (!data) notFound();

  const isEs = locale === 'es';
  const faqs = isEs ? data.faqs.es : data.faqs.en;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Para' : 'For', url: `/${locale}/for` },
    { name: pickLocale(data.shortName, locale), url: `/${locale}/for/${persona}` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/for/${persona}`,
    name: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    lastReviewed: data.lastUpdated,
    about: data.topic,
    audience: 'Consumer',
    medicalSpecialty: data.medicalSpecialty,
    author: COVEREDUSA_AUTHOR,
  });

  // Options overview table
  const optionsHeaders = pickLocaleArray(data.optionsOverview.headers, locale);
  const optionsRows: ReferenceTableCell[][] = data.optionsOverview.rows.map((row) =>
    pickLocaleArray(row, locale)
  );

  // Traps table
  const trapsHeaders = pickLocaleArray(data.traps.headers, locale);
  const trapsRows: ReferenceTableCell[][] = data.traps.rows.map((row) =>
    pickLocaleArray(row, locale)
  );

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString(isEs ? 'es-US' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const CTAComponent = data.ctaTarget === 'analyzer' ? AnalyzerCTA : ScreenerCTA;

  const pageGraph = buildSchemaGraph(
    [medicalWebPageSchema, breadcrumbSchema, faqSchema],
    `/${locale}/for/${persona}`,
  );

  return (
    <main className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageGraph) }} />

      <div className="warm-texture border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="category-tag">{isEs ? 'Guía por Persona' : 'Persona Guide'}</span>
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
            <ReactMarkdown key={i}>{pickLocale(p, locale) || ''}</ReactMarkdown>
          ))}

          <h2>{isEs ? `Sus ${data.optionDetails.length} opciones reales` : `Your ${data.optionDetails.length} Real Options`}</h2>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Opciones disponibles' : 'Available options'}
              headers={optionsHeaders}
              rows={optionsRows}
              footnote={pickLocale(data.optionsOverview.footnote, locale)}
              source={data.optionsOverview.source}
            />
          </div>

          {/* Per-option detail sections */}
          {data.optionDetails.map((opt, i) => (
            <div key={i}>
              <h2>{pickLocale(opt.heading, locale)}</h2>
              {opt.paragraphs.map((p, j) => (
                <ReactMarkdown key={j}>{pickLocale(p, locale) || ''}</ReactMarkdown>
              ))}
            </div>
          ))}
        </div>

        <CTAComponent locale={locale} slug={`persona-${persona}-mid`} variant="inline" />

        <div className="article-content">
          <h2>{isEs ? `Trampas que cuestan miles a ${pickLocale(data.shortName, locale).toLowerCase()}` : `Traps That Cost ${pickLocale(data.shortName, locale)} Thousands`}</h2>

          <p>{pickLocale(data.traps.intro, locale)}</p>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? `Trampas comunes para ${pickLocale(data.shortName, locale).toLowerCase()}` : `Common traps for ${pickLocale(data.shortName, locale)}`}
              headers={trapsHeaders}
              rows={trapsRows}
              footnote={pickLocale(data.traps.footnote, locale)}
              source={data.traps.source}
            />
          </div>

          {/* Persona-specific detail sections */}
          {data.detailSections.map((section, i) => (
            <div key={i}>
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

        <div className="divider-ornament">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
          </svg>
        </div>

        <CTAComponent locale={locale} slug={`persona-${persona}-end`} variant="inline" />

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
