import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contactPage' });
  return {
    title: `${t('title')} | CoveredUSA`,
    description: t('metaDescription'),
    alternates: { canonical: '/contact' },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contactPage' });
  const te = await getTranslations({ locale, namespace: 'editorialPage' });

  const EMAIL = 'privacy@coveredusa.org';

  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <h1
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          {t('title')}
        </h1>
        <p className="mb-10" style={{ color: 'var(--text-muted)' }}>
          {t('intro')}
        </p>

        <div className="space-y-10 article-content">
          <section>
            <h2>{t('emailHeading')}</h2>
            <p>{t('emailBody')}</p>
            <p>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </p>
          </section>

          <section>
            <h2>{t('correctionsHeading')}</h2>
            <p>{t('correctionsBody')}</p>
            <p>
              <Link href={`/${locale}/editorial-standards`}>{te('title')}</Link>
            </p>
          </section>

          <section>
            <h2>{t('privacyHeading')}</h2>
            <p>{t('privacyBody')}</p>
            <p>
              <Link href={`/${locale}/privacy`}>
                {locale === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
              </Link>
            </p>
          </section>

          <section>
            <h2>{t('notGovHeading')}</h2>
            <p>{t('notGovBody')}</p>
          </section>
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
