import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Link from 'next/link';
import Image from 'next/image';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'nav' });
  const tf = await getTranslations({ locale, namespace: 'footer' });
  const tl = await getTranslations({ locale, namespace: 'layout' });
  const otherLocale = locale === 'en' ? 'es' : 'en';

  return (
    <NextIntlClientProvider>
      <header style={{
        background: 'var(--primary-deeper)',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo image */}
          <Link href={`/${locale}`} className="flex items-center hover:opacity-90 transition-opacity no-underline">
            <Image
              src="/logo.png"
              alt="CoveredUSA"
              width={190}
              height={59}
              priority
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-3 sm:gap-5">
            <Link
              href={`/${locale}/blog`}
              className="header-link text-sm hover:text-white/80 transition-colors hidden sm:inline"
              style={{ fontWeight: 500, fontFamily: 'var(--font-body)' }}
            >
              {tl('blog')}
            </Link>
            <Link
              href={`/${locale}#how-it-works`}
              className="header-link text-sm hover:text-white/80 transition-colors hidden sm:inline"
              style={{ fontWeight: 500, fontFamily: 'var(--font-body)' }}
            >
              {t('howItWorks')}
            </Link>
            <Link
              href={`/${locale}/medical-bill-analyzer`}
              className="header-link text-sm hover:text-white/80 transition-colors hidden sm:inline"
              style={{ fontWeight: 500, fontFamily: 'var(--font-body)' }}
            >
              Bill Analyzer
            </Link>
            <Link
              href={`/${locale}/about`}
              className="header-link text-sm hover:text-white/80 transition-colors hidden sm:inline"
              style={{ fontWeight: 500, fontFamily: 'var(--font-body)' }}
            >
              {t('about')}
            </Link>
            <a
              href={`/${otherLocale}`}
              className="text-xs font-semibold px-2.5 py-1 rounded-full border border-white/25 text-white/70 hover:text-white hover:border-white/50 transition-all"
            >
              {locale === 'en' ? 'ES' : 'EN'}
            </a>
            <Link
              href={`/${locale}/screener`}
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {t('checkEligibility')}
            </Link>
          </nav>
        </div>
      </header>

      <div style={{ minHeight: 'calc(100vh - 60px - 280px)' }} className="pb-16 sm:pb-0">
        {children}
      </div>

      {/* ── MOBILE STICKY BOTTOM BAR ── */}
      <div
        className="fixed bottom-0 left-0 right-0 sm:hidden"
        style={{
          zIndex: 40,
          background: 'white',
          borderTop: '1px solid var(--border)',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex">
          {/* Check Coverage */}
          <Link
            href={`/${locale}/screener`}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3"
            style={{ color: 'var(--primary)', textDecoration: 'none' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M10 11h4M12 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: 'var(--primary)',
              }}
            >
              Check Coverage
            </span>
          </Link>

          {/* Divider */}
          <div style={{ width: '1px', background: 'var(--border-light)', margin: '8px 0' }} />

          {/* Check My Bill */}
          <Link
            href={`/${locale}/medical-bill-analyzer`}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3"
            style={{ color: 'var(--primary)', textDecoration: 'none' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="18" cy="17" r="3.5" fill="var(--error)" />
              <path d="M16.8 17h2.4M18 15.8v2.4" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: 'var(--primary)',
              }}
            >
              Check My Bill
            </span>
          </Link>
        </div>
      </div>

      <footer style={{ background: 'var(--primary-deeper)', color: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Top row */}
          <div className="grid sm:grid-cols-3 gap-8 mb-10">
            {/* About col */}
            <div>
              <div className="mb-4">
                <Image
                  src="/logo.png"
                  alt="CoveredUSA"
                  width={160}
                  height={50}
                  style={{ height: '34px', width: 'auto', opacity: 0.9 }}
                />
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                {tl('footerDesc')}
              </p>
            </div>

            {/* Resources col */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">{tl('resources')}</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href={`/${locale}`} className="text-white/60 hover:text-white transition-colors">
                    {tl('home')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}#how-it-works`} className="text-white/60 hover:text-white transition-colors">
                    {tl('howItWorks')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/about`} className="text-white/60 hover:text-white transition-colors">
                    {tl('aboutUs')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/screener`} className="text-white/60 hover:text-white transition-colors">
                    {tl('checkEligibility')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/medical-bill-analyzer`} className="text-white/60 hover:text-white transition-colors">
                    Bill Analyzer
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal col */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">{tl('legal')}</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href={`/${locale}/privacy`} className="text-white/60 hover:text-white transition-colors">
                    {tf('privacy')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/terms`} className="text-white/60 hover:text-white transition-colors">
                    {tf('terms')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/health-data-privacy`} className="text-white/60 hover:text-white transition-colors">
                    {tf('healthPrivacy')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/do-not-sell`} className="text-white/60 hover:text-white transition-colors">
                    {tf('doNotSell')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Trust bar */}
          <div
            className="border-t border-white/10 pt-8 pb-6 flex flex-wrap items-center gap-x-6 gap-y-2"
            aria-label="Trust signals"
          >
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {tl('verifiedSources')}
            </span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {tl('updatedFor')}
            </span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {tl('freeToUse')}
            </span>
          </div>

          {/* Disclaimers */}
          <div className="border-t border-white/10 pt-8 space-y-3">
            <p className="text-xs text-white/40 leading-relaxed">
              {tf('disclaimer')}
            </p>
            <p className="text-xs text-white/35 leading-relaxed">
              {tf('medicare')}
            </p>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-white/30">
              {tl('copyright')}
            </p>
          </div>
        </div>
      </footer>
    </NextIntlClientProvider>
  );
}
