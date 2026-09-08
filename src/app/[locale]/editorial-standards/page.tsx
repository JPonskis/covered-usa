import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'editorialPage' });
  return {
    title: `${t('title')} | CoveredUSA`,
    description: t('metaDescription'),
    alternates: { canonical: '/editorial-standards' },
  };
}

export default async function EditorialStandardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'editorialPage' });
  const tc = await getTranslations({ locale, namespace: 'contactPage' });

  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <h1
          className="text-3xl md:text-4xl font-bold mb-10"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          {t('title')}
        </h1>

        <div className="space-y-6 article-content">
          <p>{t('p1')}</p>
          <p>{t('p2')}</p>
          <p>{t('p3')}</p>
          <p>{t('p4')}</p>
          <p>{t('p5')}</p>
          <p>{t('p6')}</p>
          <p>
            <Link href={`/${locale}/contact`}>{tc('title')}</Link>
          </p>
        </div>

        <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border-light)' }}>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center text-sm font-medium gap-1"
            style={{ color: 'var(--primary)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {locale === 'es' ? 'Volver al inicio' : 'Back to home'}
          </Link>
        </div>
      </article>
    </main>
  );
}
