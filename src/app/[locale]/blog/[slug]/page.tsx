import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getPostBySlug, getAllPostSlugs, getRelatedPosts, formatDate } from '@/lib/blog';
import { setRequestLocale } from 'next-intl/server';
import AuthorBio from '@/components/AuthorBio';

// ISR: cache blog pages for 1 week, build on-demand for new posts
export const revalidate = 604800;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  // Only pre-build the 20 most recent posts per locale at deploy time.
  // Everything else builds on-demand via ISR and caches for 1 week.
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
    title: `${post.title} | CoveredUSA`,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
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
    home: isEs ? 'Inicio' : 'Home',
    blog: 'Blog',
    screener: isEs ? 'Evaluador' : 'Screener',
    ctaHeading: isEs
      ? 'Verifique si califica para seguro de salud'
      : 'Check if you qualify for health insurance',
    ctaDesc: isEs
      ? 'Gratis, toma 2 minutos. Sin documentos personales. Disponible en español.'
      : 'Free, takes 2 minutes. No personal documents required. Available in Spanish.',
    ctaBtn: isEs ? 'Verificar Elegibilidad Gratis' : 'Check My Eligibility — Free',
    relatedGuides: isEs ? 'Artículos Relacionados' : 'Related Articles',
    by: isEs ? 'Por' : 'By',
    lastUpdated: isEs ? 'Última actualización' : 'Last updated',
  };

  // JSON-LD schemas
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.lastUpdated || post.date,
    image: post.image,
    author: {
      '@type': 'Person',
      name: 'Jacob Posner',
      jobTitle: 'Founder, CoveredUSA',
      url: `${BASE_URL}/en/about`,
    },
    publisher: { '@type': 'Organization', name: 'CoveredUSA', url: BASE_URL },
    inLanguage: isEs ? 'es' : 'en',
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

  // Extract FAQ schema from post content
  const faqHeader = isEs ? '## Preguntas Frecuentes' : '## Frequently Asked Questions';
  const faqRegex = new RegExp(`${faqHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n([\\s\\S]*?)(?=\\n## |$)`);
  const faqSectionMatch = post.content.match(faqRegex) ||
    post.content.match(/## Frequently Asked Questions\n([\s\S]*?)(?=\n## |$)/);
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

  // Split content for mid-article CTA (after first H2 section)
  const strippedContent = post.content.replace(/^#{1,2} .+\n+/, '');
  const h2Parts = strippedContent.split(/(?=\n## )/);
  const showMidCta = h2Parts.length >= 3;
  const firstHalf = showMidCta ? h2Parts.slice(0, 2).join('') : strippedContent;
  const secondHalf = showMidCta ? h2Parts.slice(2).join('') : '';

  const relatedPosts = getRelatedPosts(slug, 3, locale);

  return (
    <main className="min-h-screen" style={{ background: '#f8fafc' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Article Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-14">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors hover:opacity-70"
            style={{ color: '#64748b' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToBlog}
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide"
              style={{ background: '#dbeafe', color: '#1d4ed8' }}
            >
              {isEs ? 'Guía' : 'Guide'}
            </span>
            <span className="text-sm" style={{ color: '#64748b' }}>
              {formatDate(post.date, locale)}
            </span>
            <span style={{ color: '#cbd5e1' }}>·</span>
            <span className="text-sm" style={{ color: '#64748b' }}>
              {post.readingTime}
            </span>
            {post.lastUpdated && post.lastUpdated !== post.date && (
              <>
                <span style={{ color: '#cbd5e1' }}>·</span>
                <span className="text-sm" style={{ color: '#64748b' }}>
                  {t.lastUpdated}: {formatDate(post.lastUpdated, locale)}
                </span>
              </>
            )}
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold leading-tight mb-5"
            style={{ color: '#0f172a', letterSpacing: '-0.02em' }}
          >
            {post.title}
          </h1>

          <p className="text-lg leading-relaxed" style={{ color: '#475569' }}>
            {post.description}
          </p>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        <AuthorBio />
        <div className="prose prose-slate prose-lg max-w-none">
          <MDXRemote
            source={firstHalf}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>

        {/* Mid-article CTA */}
        {showMidCta && (
          <div
            className="my-10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5"
            style={{ background: '#eff6ff', border: '2px solid #bfdbfe' }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg mb-1" style={{ color: '#1e3a5f' }}>
                {t.ctaHeading}
              </p>
              <p className="text-sm" style={{ color: '#3b82f6' }}>
                {t.ctaDesc}
              </p>
            </div>
            <Link
              href={`/${locale}/screener?utm_source=blog&utm_medium=mid-cta&utm_campaign=${encodeURIComponent(slug)}`}
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all hover:opacity-90"
              style={{ background: '#1d4ed8', color: '#fff' }}
            >
              {t.ctaBtn}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        )}

        {showMidCta && (
          <div className="prose prose-slate prose-lg max-w-none">
            <MDXRemote
              source={secondHalf}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </div>
        )}

        {/* End-of-article CTA */}
        <div
          className="mt-12 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6"
          style={{ background: '#1e3a5f', color: 'white' }}
        >
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xl mb-2">
              {t.ctaHeading}
            </p>
            <p className="text-sm" style={{ color: '#93c5fd' }}>
              {t.ctaDesc}
            </p>
          </div>
          <Link
            href={`/${locale}/screener?utm_source=blog&utm_medium=article&utm_campaign=${encodeURIComponent(slug)}`}
            className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all hover:opacity-90"
            style={{ background: '#3b82f6', color: '#fff' }}
          >
            {t.ctaBtn}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-14 pt-10" style={{ borderTop: '1px solid #e2e8f0' }}>
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-6"
              style={{ color: '#94a3b8' }}
            >
              {t.relatedGuides}
            </h2>
            <div className="space-y-3">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/${locale}/blog/${related.slug}`}
                  className="group flex items-start gap-4 p-5 rounded-xl transition-all"
                  style={{ background: 'white', border: '1px solid #e2e8f0' }}
                >
                  <div className="flex-1 min-w-0">
                    <span
                      className="font-semibold block group-hover:text-blue-600 transition-colors"
                      style={{ color: '#0f172a' }}
                    >
                      {related.title}
                    </span>
                    <span className="text-sm mt-1 block line-clamp-2" style={{ color: '#64748b' }}>
                      {related.description}
                    </span>
                  </div>
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1"
                    style={{ color: '#3b82f6' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
