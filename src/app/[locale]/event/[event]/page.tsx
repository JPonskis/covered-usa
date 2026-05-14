import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  getFAQSchema,
  getBreadcrumbSchema,
  getMedicalWebPageSchema,
} from '@/lib/structured-data';
import {
  ReferenceTable,
  ScreenerCTA,
  AnalyzerCTA,
  type ReferenceTableCell,
} from '@/components/reference';
import BlogDropCap from '@/components/BlogDropCap';
import {
  getAllEventSlugs,
  getEventBySlug,
  pickLocale,
  pickLocaleArray,
} from '@/lib/events';

const BASE_URL = 'https://coveredusa.org';

interface PageProps {
  params: Promise<{ locale: string; event: string }>;
}

export async function generateStaticParams() {
  const locales = ['en', 'es'];
  const params: { locale: string; event: string }[] = [];
  const slugs = getAllEventSlugs().slice(0, 20);
  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, event: slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, event } = await params;
  const data = getEventBySlug(event);
  if (!data) return { title: 'Event not found | CoveredUSA' };
  return {
    title: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    alternates: {
      canonical: `https://coveredusa.org/${locale}/event/${event}`,
      languages: {
        en: `https://coveredusa.org/en/event/${event}`,
        es: `https://coveredusa.org/es/event/${event}`,
      },
    },
  };
}

export default async function TriggerEventPage({ params }: PageProps) {
  const { locale, event } = await params;
  setRequestLocale(locale);

  const data = getEventBySlug(event);
  if (!data) notFound();

  const isEs = locale === 'es';
  const faqs = isEs ? data.faqs.es : data.faqs.en;

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Eventos de Vida' : 'Life Events', url: `/${locale}/event` },
    { name: pickLocale(data.eventName, locale), url: `/${locale}/event/${event}` },
  ]);
  const medicalWebPageSchema = getMedicalWebPageSchema({
    url: `/${locale}/event/${event}`,
    name: pickLocale(data.meta.title, locale),
    description: pickLocale(data.meta.description, locale),
    lastReviewed: data.lastUpdated,
    about: data.topic,
    audience: 'Consumer',
    medicalSpecialty: data.medicalSpecialty,
  });

  // HowTo schema (inline — uses the steps array)
  const howToSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: pickLocale(data.meta.title, locale),
    description: pickLocale(data.quickAnswer, locale).slice(0, 300),
    url: `${BASE_URL}/${locale}/event/${event}`,
    step: data.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: pickLocale(s.name, locale),
      text: pickLocale(s.text, locale),
    })),
  };
  if (data.urgency.totalTimeISO8601) {
    howToSchema.totalTime = data.urgency.totalTimeISO8601;
  }

  // Options comparison table
  const optionsHeaders = pickLocaleArray(data.optionsComparison.headers, locale);
  const optionsRows: ReferenceTableCell[][] = data.optionsComparison.rows.map((row) =>
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

  return (
    <main className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      {/* Article Header */}
      <div className="warm-texture border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="category-tag">{isEs ? 'Evento de Vida' : 'Life Event'}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              {formatDate(data.lastUpdated)}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              {data.readingTime}
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
        {/* Urgency callout */}
        <div
          className="mb-8 px-5 py-4 rounded-lg flex items-start gap-3"
          style={{ background: 'var(--accent-lightest)', borderLeft: '3px solid var(--accent)' }}
        >
          {/* Clock icon */}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15.5 14" />
          </svg>
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold text-base leading-snug"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              {pickLocale(data.urgency.heading, locale)}
            </p>
            <p
              className="text-sm mt-1 leading-snug"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}
            >
              {pickLocale(data.urgency.body, locale)}
            </p>
            {/* Secondary deadlines — inline text, not chips */}
            {data.urgency.secondaryDeadlines && data.urgency.secondaryDeadlines.length > 0 && (
              <p
                className="text-xs mt-2 leading-relaxed"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}
              >
                {isEs ? 'Otras opciones: ' : 'Other paths: '}
                {data.urgency.secondaryDeadlines.map((sd, i) => (
                  <span key={i}>
                    {pickLocale(sd.label, locale)}{' '}
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      ({sd.days === null
                        ? (isEs ? 'todo el año' : 'year-round')
                        : isEs ? `${sd.days} días` : `${sd.days} days`})
                    </span>
                    {i < data.urgency.secondaryDeadlines!.length - 1 && (
                      <span style={{ color: 'var(--border)' }}> · </span>
                    )}
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>

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
              ? `${data.steps.length} pasos para obtener cobertura`
              : `${data.steps.length} Steps to Get Coverage`}
          </h2>
        </div>

        {/* Numbered step cards — escape article-content so we can style distinctly */}
        <ol className="my-8 space-y-4 list-none p-0">
          {data.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              {/* Numbered badge */}
              <div
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-base"
                style={{
                  background: 'var(--teal)',
                  color: 'white',
                  fontFamily: 'var(--font-display), Georgia, serif',
                }}
                aria-hidden="true"
              >
                {i + 1}
              </div>
              <div className="flex-1 pt-0.5">
                <h3
                  className="text-lg font-bold mb-1 leading-snug"
                  style={{
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display), Georgia, serif',
                  }}
                >
                  {pickLocale(step.name, locale)}
                </h3>
                <p
                  className="text-base leading-relaxed"
                  style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body), Georgia, serif',
                  }}
                >
                  {pickLocale(step.text, locale)}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="article-content">
          <h2>{isEs ? 'Compare sus opciones' : 'Compare Your Options'}</h2>

          <div className="my-8">
            <ReferenceTable
              caption={isEs ? 'Opciones disponibles' : 'Available options'}
              headers={optionsHeaders}
              rows={optionsRows}
              footnote={pickLocale(data.optionsComparison.footnote, locale)}
              source={data.optionsComparison.source}
            />
          </div>
        </div>

        {/* Mid-article CTA */}
        <CTAComponent locale={locale} slug={`event-${event}-mid`} variant="inline" />

        <div className="article-content">
          <h2>{isEs ? 'Errores comunes que cuestan a la gente miles' : 'Common Mistakes That Cost People Thousands'}</h2>

          <p>{pickLocale(data.commonMistakes.intro, locale)}</p>

          <ul>
            {data.commonMistakes.items.map((item, i) => (
              <li key={i}>{pickLocale(item, locale)}</li>
            ))}
          </ul>

          {/* Optional detail sections */}
          {data.detailSections && data.detailSections.map((section, i) => (
            <div key={i}>
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

        <CTAComponent locale={locale} slug={`event-${event}-end`} variant="inline" />

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
