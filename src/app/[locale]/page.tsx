import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('homeTitle'),
    description: t('homeDescription'),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', es: '/es' },
    },
    openGraph: {
      title: t('homeTitle'),
      description: t('homeDescription'),
      images: ['/og-image.png'],
    },
  };
}

// All icons use a single consistent teal color — matches BenefitsUSA's single-color approach
const ICON_COLOR = '#0d9488';

const states = [
  ['Alabama', 'al'], ['Alaska', 'ak'], ['Arizona', 'az'], ['Arkansas', 'ar'],
  ['California', 'ca'], ['Colorado', 'co'], ['Connecticut', 'ct'], ['Delaware', 'de'],
  ['Florida', 'fl'], ['Georgia', 'ga'], ['Hawaii', 'hi'], ['Idaho', 'id'],
  ['Illinois', 'il'], ['Indiana', 'in'], ['Iowa', 'ia'], ['Kansas', 'ks'],
  ['Kentucky', 'ky'], ['Louisiana', 'la'], ['Maine', 'me'], ['Maryland', 'md'],
  ['Massachusetts', 'ma'], ['Michigan', 'mi'], ['Minnesota', 'mn'], ['Mississippi', 'ms'],
  ['Missouri', 'mo'], ['Montana', 'mt'], ['Nebraska', 'ne'], ['Nevada', 'nv'],
  ['New Hampshire', 'nh'], ['New Jersey', 'nj'], ['New Mexico', 'nm'], ['New York', 'ny'],
  ['North Carolina', 'nc'], ['North Dakota', 'nd'], ['Ohio', 'oh'], ['Oklahoma', 'ok'],
  ['Oregon', 'or'], ['Pennsylvania', 'pa'], ['Rhode Island', 'ri'], ['South Carolina', 'sc'],
  ['South Dakota', 'sd'], ['Tennessee', 'tn'], ['Texas', 'tx'], ['Utah', 'ut'],
  ['Vermont', 'vt'], ['Virginia', 'va'], ['Washington', 'wa'], ['West Virginia', 'wv'],
  ['Wisconsin', 'wi'], ['Wyoming', 'wy'],
];

const dataSourceIcons: Record<string, React.ReactNode> = {
  healthcareGov: (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
      <path d="M14 6h2v2h2v2h-2v2h-2v-2h-2V8h2V6z" fill="currentColor" opacity="0.7"/>
      <rect x="2" y="3" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  ),
  medicareGov: (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    </svg>
  ),
  medicaidGov: (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
      <path d="M10 17s-6-3.5-6-7.5a4 4 0 018 0 4 4 0 018 0c0 4-6 7.5-6 7.5z" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M8 10h4M10 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    </svg>
  ),
  cmsGov: (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
      <path d="M10 2L3 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-4z" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
    </svg>
  ),
  benefitsGov: (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
      <rect x="3" y="5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    </svg>
  ),
  ssaGov: (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M4 17c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    </svg>
  ),
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'hero' });
  const th = await getTranslations({ locale, namespace: 'home' });

  const programs = [
    {
      name: th('medicaidName'),
      desc: th('medicaidDesc'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={ICON_COLOR} opacity="0.15" stroke={ICON_COLOR} strokeWidth="1.5" />
          <path d="M10 12h4M12 10v4" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      name: th('acaName'),
      desc: th('acaDesc'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <rect x="3" y="6" width="18" height="14" rx="3" fill={ICON_COLOR} opacity="0.15" stroke={ICON_COLOR} strokeWidth="1.5" />
          <path d="M9 12h6M12 9v6" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      name: th('medicareName'),
      desc: th('medicareDesc'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <circle cx="12" cy="12" r="9" fill={ICON_COLOR} opacity="0.12" stroke={ICON_COLOR} strokeWidth="1.5" />
          <path d="M12 7v5l3 3" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 17h8" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      name: th('medicareSavingsName'),
      desc: th('medicareSavingsDesc'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <circle cx="12" cy="12" r="9" fill={ICON_COLOR} opacity="0.12" stroke={ICON_COLOR} strokeWidth="1.5" />
          <path d="M12 7v10M9 9.5h4.5a2 2 0 010 4H9m0 0h5" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      name: th('chipName'),
      desc: th('chipDesc'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <circle cx="12" cy="8" r="4" fill={ICON_COLOR} opacity="0.15" stroke={ICON_COLOR} strokeWidth="1.5" />
          <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  const faqs = [
    { q: th('faq1Q'), a: th('faq1A') },
    { q: th('faq2Q'), a: th('faq2A') },
    { q: th('faq3Q'), a: th('faq3A') },
    { q: th('faq4Q'), a: th('faq4A') },
    { q: th('faq5Q'), a: th('faq5A') },
    { q: th('faq6Q'), a: th('faq6A') },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CoveredUSA Health Insurance Screener',
    url: 'https://coveredusa.org',
    applicationCategory: 'HealthApplication',
    description: 'Free health insurance eligibility screener. Check Medicaid, Medicare, ACA, and CHIP eligibility in 2 minutes.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />

      {/* ── HERO ── */}
      <section className="warm-texture" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: text */}
            <div>
              {/* BenefitsUSA attribution */}
              <a
                href="https://benefitsusa.org"
                target="_blank"
                rel="noopener noreferrer"
                className="header-link inline-flex items-center gap-1.5 text-xs font-medium mb-5"
                style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L11 3.5V7c0 2.5-2 4.5-5 5C3 11.5 1 9.5 1 7V3.5L6 1z" fill="var(--primary)" opacity="0.2" stroke="var(--primary)" strokeWidth="1" />
                  <path d="M4 6l1.5 1.5L8 4.5" stroke="var(--primary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ color: 'var(--text-secondary)' }}>A</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>BenefitsUSA</span>
                <span style={{ color: 'var(--text-secondary)' }}>product</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.4 }}>
                  <path d="M2 8L8 2M4 2h4v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              <h1
                className="text-4xl md:text-5xl lg:text-5xl font-bold mb-5 leading-tight"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
              >
                {t('headline')}
              </h1>

              <p
                className="text-lg md:text-xl mb-8 leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
              >
                {th('subheadline')}
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
                <Link
                  href={`/${locale}/screener`}
                  className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
                  style={{ fontSize: '1.05rem', boxShadow: 'var(--shadow-primary)' }}
                >
                  {t('cta')}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <span className="flex items-center" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'var(--font-body)', paddingTop: '0.85rem' }}>
                  {th('takesMinutes')}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-7 gap-y-3">
                {[
                  { text: t('trust1'), icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )},
                  { text: t('trust2'), icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )},
                  { text: t('trust3'), icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                  )},
                ].map((badge) => (
                  <span
                    key={badge.text}
                    className="flex items-center gap-2"
                    style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}
                  >
                    <span style={{ color: 'var(--primary)' }}>{badge.icon}</span>
                    {badge.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: illustration */}
            <div className="hidden lg:flex justify-center items-center" style={{
              WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at center, black 40%, transparent 72%)',
              maskImage: 'radial-gradient(ellipse 85% 80% at center, black 40%, transparent 72%)',
            }}>
              <Image
                src="/hero-illustration.png"
                alt="Illustration of a young woman, older gentleman, and child standing together under a protective teal arc"
                width={1024}
                height={1536}
                priority
                style={{ width: '100%', maxWidth: '460px', height: 'auto' }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── DATA SOURCES BAR — clean, plain, like BenefitsUSA ── */}
      <section style={{ background: 'white', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p
            className="text-center text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            {th('dataSourcedFrom')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {[
              { key: 'healthcareGov', label: 'HealthCare.gov' },
              { key: 'medicareGov', label: 'Medicare.gov' },
              { key: 'medicaidGov', label: 'Medicaid.gov' },
              { key: 'cmsGov', label: 'CMS.gov' },
              { key: 'benefitsGov', label: 'Benefits.gov' },
              { key: 'ssaGov', label: 'SSA.gov' },
            ].map((source) => (
              <div
                key={source.key}
                className="flex items-center gap-2"
                style={{ color: 'var(--text-muted)' }}
              >
                {dataSourceIcons[source.key]}
                <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                  {source.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ── */}
      <section style={{ background: 'var(--primary-deeper)' }}>
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-14">
          <div className="grid grid-cols-3 gap-8 md:gap-12 text-center">
            {[
              { number: th('stat1Number'), label: th('stat1Label') },
              { number: th('stat2Number'), label: th('stat2Label') },
              { number: th('stat3Number'), label: th('stat3Label') },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {stat.number}
                </div>
                <p
                  className="text-sm leading-relaxed max-w-xs mx-auto"
                  style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)' }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background: 'white', borderTop: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-16">
            <span
              className="inline-block text-sm font-semibold mb-3 px-3 py-1 rounded-full"
              style={{ background: 'var(--primary-lightest)', color: 'var(--primary)', fontFamily: 'var(--font-body)' }}
            >
              {th('howItWorksTag')}
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              {th('howItWorksTitle')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontFamily: 'var(--font-body)' }}>
              {th('howItWorksSubtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line — solid, no gradient */}
              <div
                className="hidden md:block absolute"
                style={{ top: '44px', left: 'calc(16.67% + 28px)', right: 'calc(16.67% + 28px)', height: '1px', background: 'var(--border)', zIndex: 0 }}
              />

              {[
                {
                  num: '1', title: th('step1Title'), desc: th('step1Desc'),
                  icon: (<svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" /><path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>),
                },
                {
                  num: '2', title: th('step2Title'), desc: th('step2Desc'),
                  icon: (<svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M9 11l3 3 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12a9 9 0 11-6.22-8.56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>),
                },
                {
                  num: '3', title: th('step3Title'), desc: th('step3Desc'),
                  icon: (<svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>),
                },
              ].map((step) => (
                <div key={step.num} className="text-center relative" style={{ zIndex: 1 }}>
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 relative"
                    style={{ background: 'var(--cream)', color: 'var(--primary)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}
                  >
                    {step.icon}
                    <span
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
                      style={{ background: 'var(--primary)', color: 'white', fontFamily: 'var(--font-display)' }}
                    >
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href={`/${locale}/screener`} className="btn-primary text-base px-8 py-3.5">
              {t('cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section className="warm-texture" style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-14">
            <span
              className="inline-block text-sm font-semibold mb-3 px-3 py-1 rounded-full"
              style={{ background: 'white', color: 'var(--primary)', fontFamily: 'var(--font-body)' }}
            >
              {th('programsTag')}
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              {th('programsTitle')}
            </h2>
            <p className="max-w-lg mx-auto" style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontFamily: 'var(--font-body)' }}>
              {th('programsSubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {programs.map((program) => (
              <Link
                key={program.name}
                href={`/${locale}/screener`}
                className="rounded-xl px-5 py-4 hover:shadow-sm transition-all duration-200 flex items-start gap-3.5 no-underline"
                style={{ background: 'white', border: '1px solid var(--border-light)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--cream-dark)' }}
                >
                  {program.icon}
                </div>
                <div>
                  <h3
                    className="font-semibold text-base"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                  >
                    {program.name}
                  </h3>
                  <p
                    className="text-sm mt-0.5 leading-relaxed"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                  >
                    {program.desc}
                  </p>
                </div>
              </Link>
            ))}
            <div
              className="rounded-xl px-5 py-4 flex items-center justify-center"
              style={{ background: 'var(--primary-lightest)', border: '1px solid var(--border-light)', minHeight: '96px' }}
            >
              <Link
                href={`/${locale}/screener`}
                className="font-semibold flex items-center gap-2 text-base no-underline"
                style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)' }}
              >
                {th('checkAllPrograms')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── BROWSE BY STATE ── */}
      <section style={{ background: 'white', borderTop: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              {th('stateTitle')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              {th('stateSubtitle')}
            </p>
          </div>
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-x-6">
            {states.map(([name]) => (
              <div key={name} className="mb-2 break-inside-avoid">
                <Link
                  href={`/${locale}/screener`}
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', display: 'block', padding: '2px 0', textDecoration: 'none' }}
                  className="hover:text-teal-600 transition-colors"
                >
                  {name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIVACY & SECURITY ── */}
      <section className="warm-texture" style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              {th('privacyTitle')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              {th('privacySubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                title: th('privacy1Title'),
                desc: th('privacy1Desc'),
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                    <path d="M12 2L4 6v6c0 5.52 3.44 10.24 8 12 4.56-1.76 8-6.48 8-12V6l-8-4z" fill={ICON_COLOR} opacity="0.15" stroke={ICON_COLOR} strokeWidth="1.5" />
                    <path d="M9 12l2 2 4-4" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                title: th('privacy2Title'),
                desc: th('privacy2Desc'),
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                    <rect x="5" y="11" width="14" height="10" rx="2" fill={ICON_COLOR} opacity="0.15" stroke={ICON_COLOR} strokeWidth="1.5" />
                    <path d="M8 11V7a4 4 0 018 0v4" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1" fill={ICON_COLOR} />
                  </svg>
                ),
              },
              {
                title: th('privacy3Title'),
                desc: th('privacy3Desc'),
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                    <circle cx="12" cy="8" r="4" fill={ICON_COLOR} opacity="0.15" stroke={ICON_COLOR} strokeWidth="1.5" />
                    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '1.75rem 1.5rem', textAlign: 'center' }}
              >
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: 'white', borderTop: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              {th('faqTitle')}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group"
                style={{ background: 'var(--cream)', borderRadius: '14px', border: '1px solid var(--border-light)', overflow: 'hidden' }}
              >
                <summary
                  className="cursor-pointer list-none flex items-center justify-between"
                  style={{ padding: '1.125rem 1.25rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                >
                  <span>{faq.q}</span>
                  <svg className="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div style={{ padding: '0 1.25rem 1.125rem', borderTop: '1px solid var(--border-light)' }}>
                  <p className="text-sm leading-relaxed pt-3" style={{ color: 'var(--text-secondary)', margin: 0, fontFamily: 'var(--font-body)' }}>
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ background: 'var(--primary-deeper)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24 text-center">
          <div className="max-w-xl mx-auto">
            <h2
              className="text-2xl md:text-3xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.3 }}
            >
              {th('ctaTitle')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2.5rem', fontFamily: 'var(--font-body)' }}>
              {th('ctaSubtitle')}
            </p>
            <Link
              href={`/${locale}/screener`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl text-lg transition-all hover:opacity-90"
              style={{ background: 'white', color: 'var(--primary-deeper)', fontFamily: 'var(--font-display)' }}
            >
              {th('ctaButton')}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', marginTop: '1.5rem', fontFamily: 'var(--font-body)' }}>
              {th('ctaNote')}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
