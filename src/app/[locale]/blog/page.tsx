import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts, formatDate } from '@/lib/blog';
import { setRequestLocale } from 'next-intl/server';

export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  return {
    title: isEs
      ? 'Blog | CoveredUSA — Guías de Seguro de Salud'
      : 'Blog | CoveredUSA — Health Insurance Guides',
    description: isEs
      ? 'Guías gratuitas sobre Medicaid, Medicare, ACA y CHIP. Aprenda quién califica, los límites de ingresos y cómo inscribirse.'
      : 'Free guides on Medicaid, Medicare, ACA, and CHIP eligibility. Learn who qualifies, income limits, and how to enroll.',
    alternates: { canonical: `/${locale}/blog` },
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocaleBlogPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const posts = getAllPosts(locale);
  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  const isEs = locale === 'es';
  const t = {
    hero: isEs ? 'Recursos de Seguro de Salud' : 'Health Insurance Resources',
    title1: isEs ? 'Guías de' : 'Health Insurance',
    title2: isEs ? 'Seguro de Salud' : 'Guides',
    subtitle: isEs
      ? 'Guías claras y honestas sobre Medicaid, Medicare, ACA y CHIP. Aprenda quién califica, los límites de ingresos y cómo inscribirse.'
      : 'Clear, honest guides on Medicaid, Medicare, ACA, and CHIP. Learn who qualifies, income limits, and how to enroll.',
    latest: isEs ? 'Artículo Más Reciente' : 'Latest Article',
    more: isEs ? 'Más Recursos' : 'More Resources',
    readGuide: isEs ? 'Leer la guía completa' : 'Read the full guide',
    guide: isEs ? 'Guía' : 'Guide',
    ctaTitle: isEs ? '¿Listo para verificar su elegibilidad?' : 'Ready to check your eligibility?',
    ctaDesc: isEs
      ? 'Nuestro evaluador gratuito toma 2 minutos y le muestra para qué cobertura de salud puede calificar.'
      : 'Our free screener takes 2 minutes and shows you what health coverage you may qualify for.',
    ctaBtn: isEs ? 'Verificar Elegibilidad Gratis' : 'Check My Eligibility — Free',
    empty: isEs ? 'Estamos trabajando en guías útiles. ¡Vuelva pronto!' : 'We\u2019re working on helpful guides. Check back soon!',
  };

  const blogBase = `/${locale}/blog`;

  return (
    <main className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      {/* Hero */}
      <section className="warm-texture border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6" style={{ background: 'var(--teal)', color: 'white', fontFamily: 'var(--font-display), Georgia, serif' }}>
              {t.hero}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {t.title1}<br />
              <span style={{ color: 'var(--teal)' }}>{t.title2}</span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}>
              {t.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--cream)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--teal)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }} className="text-lg">{t.empty}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {featuredPost && (
              <div className="mb-16">
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-8" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display), Georgia, serif', letterSpacing: '0.1em' }}>
                  {t.latest}
                </h2>
                <Link href={`${blogBase}/${featuredPost.slug}`} className="blog-card featured-post block">
                  <div className="blog-card-inner p-8 md:p-12" style={{ background: 'white' }}>
                    <div className="flex flex-col md:flex-row md:items-start gap-8">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-light) 100%)' }}>
                        <svg className="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="category-tag">{t.guide}</span>
                          <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
                            {formatDate(featuredPost.date, locale)} · {featuredPost.readingTime}
                          </span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight" style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                          {featuredPost.title}
                        </h3>
                        <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}>
                          {featuredPost.description}
                        </p>
                        <span className="inline-flex items-center gap-2 font-semibold" style={{ color: 'var(--teal)', fontFamily: 'var(--font-display), Georgia, serif' }}>
                          {t.readGuide}
                          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {otherPosts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-8" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display), Georgia, serif', letterSpacing: '0.1em' }}>
                  {t.more}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {otherPosts.map((post) => (
                    <Link key={post.slug} href={`${blogBase}/${post.slug}`} className="blog-card block">
                      <div className="blog-card-inner p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="category-tag">{t.guide}</span>
                          <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body), Georgia, serif' }}>
                            {formatDate(post.date, locale)}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3 leading-snug" style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text-primary)' }}>
                          {post.title}
                        </h3>
                        <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}>
                          {post.description}
                        </p>
                        <span className="text-sm font-medium" style={{ color: 'var(--teal)' }}>{post.readingTime}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="warm-texture border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto" style={{ background: 'var(--teal)' }}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text-primary)' }}>
            {t.ctaTitle}
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body), Georgia, serif' }}>
            {t.ctaDesc}
          </p>
          <Link href={`/${locale}/screener`} className="btn-primary text-lg px-8 py-4">{t.ctaBtn}</Link>
        </div>
      </section>
    </main>
  );
}
