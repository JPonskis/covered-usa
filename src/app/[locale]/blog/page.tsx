import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts, formatDate } from '@/lib/blog';
import { setRequestLocale } from 'next-intl/server';

interface PageProps {
  params: Promise<{ locale: string }>;
}

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

export default async function BlogIndexPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const posts = getAllPosts(locale);
  const isEs = locale === 'es';

  const t = {
    heading: isEs ? 'Guías de Seguro de Salud' : 'Health Insurance Guides',
    subheading: isEs
      ? 'Aprenda sobre Medicaid, Medicare, ACA y CHIP — quién califica, límites de ingresos y cómo inscribirse.'
      : 'Learn about Medicaid, Medicare, ACA, and CHIP — who qualifies, income limits, and how to enroll.',
    readMore: isEs ? 'Leer guía' : 'Read guide',
    ctaHeading: isEs
      ? '¿Listo para verificar su elegibilidad?'
      : 'Ready to check your eligibility?',
    ctaDesc: isEs
      ? 'Nuestro evaluador gratuito toma 2 minutos y le muestra qué cobertura de salud puede calificar.'
      : 'Our free screener takes 2 minutes and shows you what health coverage you may qualify for.',
    ctaBtn: isEs ? 'Verificar Elegibilidad Gratis' : 'Check My Eligibility — Free',
    noPosts: isEs ? 'No hay artículos disponibles todavía.' : 'No articles available yet.',
  };

  return (
    <main className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div className="max-w-5xl mx-auto px-6 py-14 text-center">
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#0f172a', letterSpacing: '-0.02em' }}
          >
            {t.heading}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#475569' }}>
            {t.subheading}
          </p>
        </div>
      </div>

      {/* Post Grid */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {posts.length === 0 ? (
          <p className="text-center py-20" style={{ color: '#94a3b8' }}>
            {t.noPosts}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: 'white', border: '1px solid #e2e8f0' }}
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide"
                      style={{ background: '#dbeafe', color: '#1d4ed8' }}
                    >
                      {isEs ? 'Guía' : 'Guide'}
                    </span>
                    <span className="text-xs" style={{ color: '#94a3b8' }}>
                      {post.readingTime}
                    </span>
                  </div>

                  <h2
                    className="font-bold text-lg mb-3 leading-snug group-hover:text-blue-600 transition-colors flex-1"
                    style={{ color: '#0f172a' }}
                  >
                    {post.title}
                  </h2>

                  <p
                    className="text-sm leading-relaxed mb-5 line-clamp-3"
                    style={{ color: '#64748b' }}
                  >
                    {post.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs" style={{ color: '#94a3b8' }}>
                      {formatDate(post.date, locale)}
                    </span>
                    <span
                      className="text-xs font-semibold flex items-center gap-1 transition-colors group-hover:text-blue-600"
                      style={{ color: '#3b82f6' }}
                    >
                      {t.readMore}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div
          className="mt-16 rounded-2xl p-8 text-center"
          style={{ background: '#1e3a5f', color: 'white' }}
        >
          <h2 className="text-2xl font-bold mb-3">{t.ctaHeading}</h2>
          <p className="mb-6 max-w-lg mx-auto" style={{ color: '#93c5fd' }}>
            {t.ctaDesc}
          </p>
          <Link
            href={`/${locale}/screener?utm_source=blog&utm_medium=index-cta`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:opacity-90"
            style={{ background: '#3b82f6', color: 'white' }}
          >
            {t.ctaBtn}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
