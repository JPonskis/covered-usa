import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getPostBySlug, getAllPostSlugs, getRelatedPosts, formatDate } from '@/lib/blog';
import { setRequestLocale } from 'next-intl/server';
import BlogDropCap from '@/components/BlogDropCap';
import AuthorBio from '@/components/AuthorBio';

// ISR: cache blog pages for 1 week, build on-demand for new posts
export const revalidate = 604800;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const locales = ['en', 'es'];
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    const slugs = getAllPostSlugs(locale).slice(0, 20);
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);

  if (!post) {
    return { title: 'Post Not Found | CoveredUSA' };
  }

  return {
    title: `${post.title} | CoveredUSA Blog`,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `https://coveredusa.org/${locale}/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `https://coveredusa.org/${locale}/blog/${slug}`,
      images: [`/api/og?title=${encodeURIComponent(post.title)}`],
      publishedTime: post.date,
      authors: ['Jacob Posner'],
    },
  };
}

// ─── CTA COPY (per target × locale) ───────────────────────────────────────────
// Card layout/styling is identical for both targets. Only the heading, desc,
// button label, and the destination path change based on post.target.

type CTAVariant = {
  heading: string;
  desc: string;
  midBtn: string;
  endBtn: string;
};

const CTA_COPY: Record<'screener' | 'analyzer', { en: CTAVariant; es: CTAVariant }> = {
  screener: {
    en: {
      heading: 'Check if you qualify for health coverage',
      desc: 'Our free screener checks Medicaid, Medicare, ACA, CHIP, and VA Healthcare in 2 minutes.',
      midBtn: 'Check eligibility free',
      endBtn: 'Check My Eligibility — Free',
    },
    es: {
      heading: 'Verifique si califica para cobertura de salud',
      desc: 'Nuestro evaluador gratuito verifica Medicaid, Medicare, ACA, CHIP y VA Healthcare en 2 minutos.',
      midBtn: 'Verificar elegibilidad gratis',
      endBtn: 'Verificar Elegibilidad Gratis',
    },
  },
  analyzer: {
    en: {
      heading: 'Got a hospital bill? Check it for errors.',
      desc: 'Our free analyzer flags overcharges, billing errors, and charity care eligibility in 30 seconds.',
      midBtn: 'Analyze my bill free',
      endBtn: 'Analyze My Bill — Free',
    },
    es: {
      heading: '¿Tiene una factura de hospital? Revísela.',
      desc: 'Nuestro analizador gratuito detecta sobrecargos, errores de facturación y opciones de asistencia en 30 segundos.',
      midBtn: 'Analizar mi factura gratis',
      endBtn: 'Analizar Mi Factura — Gratis',
    },
  },
};

const CTA_PATHS = {
  screener: 'screener',
  analyzer: 'medical-bill-analyzer',
} as const;

// ──────────────────────────────────────────────────────────────────────────────

export default async function LocaleBlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPostBySlug(slug, locale);
  if (!post) {
    notFound();
  }

  const isEs = locale === 'es';
  const BASE_URL = 'https://coveredusa.org';

  const t = {
    backToBlog: isEs ? 'Volver al Blog' : 'Back to Blog',
    guide: isEs ? 'Guía' : 'Guide',
    relatedGuides: isEs ? 'Guías Relacionadas' : 'Related Guides',
    home: isEs ? 'Inicio' : 'Home',
    screener: isEs ? 'Evaluador' : 'Screener',
    blog: 'Blog',
  };

  const ctaTarget: 'screener' | 'analyzer' = post.target === 'analyzer' ? 'analyzer' : 'screener';
  const cta = CTA_COPY[ctaTarget][isEs ? 'es' : 'en'];
  const ctaPath = CTA_PATHS[ctaTarget];

  // JSON-LD schemas
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': ['Article', 'MedicalWebPage'],
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.lastUpdated || post.date,
    image: post.image,
    author: { '@type': 'Person', name: 'Jacob Posner', jobTitle: 'Founder, CoveredUSA', url: `${BASE_URL}/en/about` },
    publisher: { '@type': 'Organization', name: 'CoveredUSA', url: BASE_URL },
    inLanguage: isEs ? 'es' : 'en',
    medicalAudience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
    lastReviewed: post.lastUpdated || post.date,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.home, item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: t.blog, item: `${BASE_URL}/${locale}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${BASE_URL}/${locale}/blog/${slug}` },
    ],
  };

  // Mid-article CTA: split content after first H2 section
  const strippedContent = post.content.replace(/^#{1,2} .+\n+/, '');
  const h2Parts = strippedContent.split(/(?=\n## )/);
  const showMidCta = h2Parts.length >= 3;
  const firstHalf = showMidCta ? h2Parts.slice(0, 2).join('') : strippedContent;
  const secondHalf = showMidCta ? h2Parts.slice(2).join('') : '';

  // Extract FAQ schema
  const faqHeader = isEs ? '## Preguntas Frecuentes' : '## Frequently Asked Questions';
  const faqRegex = new RegExp(`${faqHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n([\\s\\S]*?)(?=\\n## |$)`);
  const faqSectionMatch = post.content.match(faqRegex) || post.content.match(/## Frequently Asked Questions\n([\s\S]*?)(?=\n## |$)/);
  let faqSchema = null;

  if (faqSectionMatch) {
    const faqContent = faqSectionMatch[1];
    const faqPairs = [...faqContent.matchAll(/### (.+?)\n\n([\s\S]*?)(?=\n### |\n## |$)/g)];
    if (faqPairs.length > 0) {
      faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqPairs.map((match) => ({
          '@type': 'Question',
          name: match[1].trim(),
          acceptedAnswer: { '@type': 'Answer', text: match[2].trim().replace(/\n/g, ' ') },
        })),
      };
    }
  }

  // HowTo schema
  let howToSchema = null;
  const howToMatch = post.content.match(/## (How to .+?)\n([\s\S]*?)(?=\n## |$)/);
  if (howToMatch) {
    const howToTitle = howToMatch[1];
    const howToContent = howToMatch[2];
    const steps = [...howToContent.matchAll(/(?:^|\n)(\d+)\.\s+\*\*(.+?)\*\*[:\.]?\s*([\s\S]*?)(?=\n\d+\.\s|\n## |$)/g)];
    if (steps.length >= 2) {
      howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: howToTitle,
        step: steps.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: s[2].trim(),
          text: s[3].trim().replace(/\n/g, ' '),
        })),
      };
    }
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      {howToSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />}

      {/* Article Header */}
      <div className="warm-texture border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-sm font-medium mb-10 transition-all hover:gap-3"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToBlog}
          </Link>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="category-tag">{t.guide}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              {formatDate(post.date, locale)}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              {post.readingTime}
            </span>
            {post.lastUpdated && post.lastUpdated !== post.date && (
              <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
                  {isEs ? 'Última actualización' : 'Last updated'}: {formatDate(post.lastUpdated, locale)}
                </span>
              </>
            )}
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              {isEs ? 'Por' : 'By'} Jacob Posner
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6" style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            {post.title}
          </h1>

          <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}>
            {post.description}
          </p>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <AuthorBio />
        <div className="article-content">
          <BlogDropCap />
          <MDXRemote
            source={firstHalf}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>

        {/* Mid-article CTA */}
        {showMidCta && (
          <div className="my-10 rounded-2xl border-2 p-6 flex flex-col sm:flex-row items-center gap-5" style={{ borderColor: 'var(--teal)', background: 'var(--cream)' }}>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display), Georgia, serif' }}>
                {cta.heading}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}>
                {cta.desc}
              </p>
            </div>
            <Link
              href={`/${locale}/${ctaPath}?utm_source=blog&utm_medium=mid-cta&utm_campaign=${encodeURIComponent(slug)}`}
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all hover:opacity-90"
              style={{ background: 'var(--teal)', color: '#fff', fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              {cta.midBtn}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        )}

        {showMidCta && (
          <div className="article-content">
            <MDXRemote
              source={secondHalf}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </div>
        )}

        <div className="divider-ornament">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
          </svg>
        </div>

        {/* CTA Card */}
        <div className="rounded-2xl border-2 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5" style={{ borderColor: 'var(--teal)', background: 'var(--cream)' }}>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xl mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display), Georgia, serif' }}>
              {cta.heading}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              {cta.desc}
            </p>
          </div>
          <Link
            href={`/${locale}/${ctaPath}?utm_source=blog&utm_medium=article&utm_campaign=${encodeURIComponent(slug)}`}
            className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all hover:opacity-90"
            style={{ background: 'var(--teal)', color: '#fff', fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            {cta.endBtn}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* Related Posts */}
        {(() => {
          const relatedPosts = getRelatedPosts(slug, 3, locale);
          if (relatedPosts.length === 0) return null;
          return (
            <div className="mt-16 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-6" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display), Georgia, serif', letterSpacing: '0.1em' }}>
                {t.relatedGuides}
              </h2>
              <div className="space-y-4">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/${locale}/blog/${related.slug}`}
                    className="group flex items-start gap-4 p-5 rounded-xl transition-all"
                    style={{ background: 'var(--cream)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold block group-hover:text-[#0d9488] transition-colors" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display), Georgia, serif' }}>
                        {related.title}
                      </span>
                      <span className="text-sm mt-1 block line-clamp-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
                        {related.description}
                      </span>
                    </div>
                    <svg className="w-5 h-5 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1" style={{ color: 'var(--teal)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}
      </article>
    </main>
  );
}
