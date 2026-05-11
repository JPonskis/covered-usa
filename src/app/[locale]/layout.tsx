import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Link from 'next/link';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
      <path
        d="M12 2L4 6v6c0 5.52 3.44 10.24 8 12 4.56-1.76 8-6.48 8-12V6l-8-4z"
        fill="var(--primary)"
        opacity="0.15"
        stroke="var(--primary)"
        strokeWidth="1.5"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
  const otherLocale = locale === 'en' ? 'es' : 'en';

  return (
    <NextIntlClientProvider>
      <header style={{ background: 'var(--primary-dark)', color: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity no-underline"
          >
            <ShieldIcon />
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: 'white', fontFamily: 'var(--font-display)' }}
            >
              CoveredUSA
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-3 sm:gap-5">
            <Link
              href={`/${locale}#how-it-works`}
              className="text-sm text-white/70 hover:text-white transition-colors hidden sm:inline"
            >
              {t('howItWorks')}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="text-sm text-white/70 hover:text-white transition-colors hidden sm:inline"
            >
              {t('about')}
            </Link>
            <a
              href={`/${otherLocale}`}
              className="text-xs font-medium px-2.5 py-1 rounded-full border border-white/30 text-white/80 hover:text-white hover:border-white/60 transition-all"
            >
              {locale === 'en' ? 'ES' : 'EN'}
            </a>
            <Link
              href={`/${locale}/screener`}
              className="btn-primary text-sm px-4 py-2"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}
            >
              {t('checkEligibility')}
            </Link>
          </nav>
        </div>
      </header>

      <div style={{ minHeight: 'calc(100vh - 68px - 280px)' }}>
        {children}
      </div>

      <footer style={{ background: 'var(--text-primary)', color: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Top row */}
          <div className="grid sm:grid-cols-3 gap-8 mb-10">
            {/* About col */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
                  <path
                    d="M12 2L4 6v6c0 5.52 3.44 10.24 8 12 4.56-1.76 8-6.48 8-12V6l-8-4z"
                    fill="white"
                    opacity="0.2"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                  />
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
                </svg>
                <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  CoveredUSA
                </span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Free health insurance eligibility screening. We connect you with licensed agents who can help you enroll at no cost.
              </p>
            </div>

            {/* Resources col */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href={`/${locale}`} className="text-white/60 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}#how-it-works`} className="text-white/60 hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/about`} className="text-white/60 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/screener`} className="text-white/60 hover:text-white transition-colors">
                    Check Eligibility
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal col */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
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
              Information verified against official .gov sources
            </span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Updated for 2026
            </span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Free to use — no sign-up required
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
              &copy; 2026 CoveredUSA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </NextIntlClientProvider>
  );
}
