import Link from 'next/link';
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

const programs = [
  {
    name: 'Medicaid',
    desc: 'Free health coverage for low-income individuals and families',
    color: '#059669',
    bgColor: '#d1fae5',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 12h4M12 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'ACA Marketplace',
    desc: 'Subsidized health insurance plans for individuals and families',
    color: '#0d9488',
    bgColor: '#ccfbf1',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <rect x="3" y="6" width="18" height="14" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 6h2v4h4v2h-4v4h-2v-4h-4V8h4V6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Medicare',
    desc: 'Health coverage for adults 65+ or with qualifying disabilities',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Medicare Savings',
    desc: 'Help paying Medicare premiums and out-of-pocket costs',
    color: '#0d9488',
    bgColor: '#ccfbf1',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v10M9 9.5h4.5a2 2 0 010 4H9m0 0h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'CHIP',
    desc: 'Free health coverage for children in your household',
    color: '#c2732a',
    bgColor: '#fef3c7',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const faqs = [
  {
    q: 'Is this really free?',
    a: "Yes, completely. CoveredUSA never charges users. We're funded by licensed insurance agents who pay us only if you choose to connect with them, and only after you enroll.",
  },
  {
    q: 'Do I need to sign up or create an account?',
    a: "No account, no email, no sign-up required. Answer the questions, see your results. That's it.",
  },
  {
    q: 'What health insurance programs do you check?',
    a: 'We screen for Medicaid, ACA Marketplace plans (including subsidies), Medicare, Medicare Savings Programs, and CHIP for children.',
  },
  {
    q: 'Is CoveredUSA a government website?',
    a: 'No. CoveredUSA is a private company. We are not affiliated with or endorsed by any government agency, including CMS, HHS, or the federal Medicare program.',
  },
  {
    q: 'Will I be pressured to buy something?',
    a: "No. We show you your eligibility results with no strings attached. If you want help enrolling, we can connect you with a licensed agent, but that's always your choice.",
  },
  {
    q: 'What if I speak Spanish?',
    a: 'Our entire screener is available in Spanish, and we can connect you with Spanish-speaking licensed agents.',
  },
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

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CoveredUSA',
  url: 'https://coveredusa.org',
  description: 'Free health insurance eligibility screening connecting Americans with Medicaid, Medicare, ACA plans, and CHIP coverage.',
  foundingDate: '2026',
};

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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'hero' });

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      {/* ── HERO ── */}
      <section className="warm-texture" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 lg:py-28">
          <div className="max-w-2xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-sm font-semibold"
              style={{ background: 'white', color: 'var(--primary)', border: '1px solid var(--cream-dark)', boxShadow: 'var(--shadow-sm)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="3.5" fill="var(--success)" />
                <circle cx="7" cy="7" r="3.5" fill="var(--success)" opacity="0.3">
                  <animate attributeName="r" from="3.5" to="6.5" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </svg>
              Free Eligibility Check — All 50 States
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
            >
              {t('headline')}
            </h1>

            <p
              className="text-lg md:text-xl mb-9 leading-relaxed"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
            >
              Check your eligibility for Medicaid, Medicare, ACA Marketplace plans, and more.
              Free, confidential, and available in Spanish.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-9">
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
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}>
                Takes about 2 minutes
              </span>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-x-7 gap-y-3">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 3.938A7.5 7.5 0 0121 12M3 19h18" />
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
        </div>
      </section>

      {/* ── DATA SOURCES TRUST BAR ── */}
      <section style={{ background: 'white', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>
              Data sourced from
            </span>
            {[
              { label: 'HealthCare.gov', color: '#0d9488' },
              { label: 'Medicare.gov', color: '#1a3a6e' },
              { label: 'Medicaid.gov', color: '#205493' },
              { label: 'CMS.gov', color: '#0071bc' },
              { label: 'Benefits.gov', color: '#2c4f00' },
              { label: 'SSA.gov', color: '#003087' },
            ].map((source) => (
              <span
                key={source.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'var(--cream)', color: source.color, border: '1px solid var(--border-light)', fontFamily: 'var(--font-body)' }}
              >
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L1 3.5v3C1 9.5 3.2 11.8 6 12.5c2.8-.7 5-3 5-6v-3L6 1z" fill={source.color} opacity="0.2" stroke={source.color} strokeWidth="1" />
                  <path d="M4 6l1.5 1.5L8 4.5" stroke={source.color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {source.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ── */}
      <section style={{ background: 'var(--primary-deeper)', color: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { number: '23M+', label: 'ACA Marketplace enrollees in 2026' },
              { number: '1 in 3', label: 'Americans qualify for financial help' },
              { number: '4', label: 'Health programs checked instantly' },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--teal-light)' }}
                >
                  {stat.number}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}>
                  {stat.label}
                </div>
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
              Simple Process
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              How it works
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontFamily: 'var(--font-body)' }}>
              Three steps, two minutes, no catch.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 relative">
              <div
                className="hidden md:block absolute"
                style={{ top: '44px', left: 'calc(16.67% + 28px)', right: 'calc(16.67% + 28px)', height: '2px', background: 'var(--cream-dark)', zIndex: 0 }}
              >
                <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '999px' }} />
              </div>

              {[
                {
                  num: '1', title: 'Answer a few questions',
                  desc: 'Tell us about your household, income, and state. Four short sections, about 2 minutes total.',
                  icon: (<svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" /><path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>),
                },
                {
                  num: '2', title: 'See your results instantly',
                  desc: 'We check health programs in real time and show you exactly what you likely qualify for.',
                  icon: (<svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M9 11l3 3 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12a9 9 0 11-6.22-8.56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>),
                },
                {
                  num: '3', title: 'Get free help enrolling',
                  desc: 'Connect with a licensed agent who speaks your language. No cost to you, ever.',
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
              5 Programs Checked
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              Programs we screen for
            </h2>
            <p className="max-w-lg mx-auto" style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontFamily: 'var(--font-body)' }}>
              One quick check covers all major federal and state health coverage programs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {programs.map((program) => (
              <div
                key={program.name}
                className="card"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: program.bgColor, color: program.color }}
                >
                  {program.icon}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    {program.name}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', margin: 0, fontFamily: 'var(--font-body)' }}>
                    {program.desc}
                  </p>
                </div>
              </div>
            ))}
            <div
              className="card flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--primary-lightest), var(--cream))', border: '1px solid var(--border-light)', minHeight: '140px' }}
            >
              <Link
                href={`/${locale}/screener`}
                className="font-semibold flex items-center gap-2 text-base"
                style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)' }}
              >
                Check all 5 programs
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              Find coverage in your state
            </h2>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              Medicaid income limits, ACA plans, and more — state by state.
            </p>
          </div>
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-x-6">
            {states.map(([name, code]) => (
              <div key={code} className="mb-2 break-inside-avoid">
                <Link
                  href={`/${locale}/screener`}
                  className="state-link text-sm block py-0.5 hover:text-teal-600 transition-colors"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
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
              Your privacy is protected
            </h2>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              We take the security of your health information seriously.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: 'Shared only with your consent',
                desc: 'Your data is only shared with licensed agents if you ask to be connected. We never sell to advertisers or data brokers.',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                    <path d="M12 2L4 6v6c0 5.52 3.44 10.24 8 12 4.56-1.76 8-6.48 8-12V6l-8-4z" fill="var(--primary)" opacity="0.15" stroke="var(--primary)" strokeWidth="1.5" />
                    <path d="M9 12l2 2 4-4" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                title: 'Encrypted connection',
                desc: 'All data is transmitted over HTTPS. We never collect SSNs, bank info, or medical records.',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                    <rect x="5" y="11" width="14" height="10" rx="2" fill="var(--primary)" opacity="0.15" stroke="var(--primary)" strokeWidth="1.5" />
                    <path d="M8 11V7a4 4 0 018 0v4" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1" fill="var(--primary)" />
                  </svg>
                ),
              },
              {
                title: 'No account required',
                desc: 'Check your eligibility without signing up. Your screener results are not stored unless you request agent help.',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                    <circle cx="12" cy="8" r="4" fill="var(--primary)" opacity="0.15" stroke="var(--primary)" strokeWidth="1.5" />
                    <path d="M4 20c0-4 3.58-7 8-7" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M17 15l-4 4 2 2 5-5-3-1z" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="card text-center"
                style={{ padding: '2rem 1.5rem' }}
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
              Common questions
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
              Don&apos;t leave money on the table.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2.5rem', fontFamily: 'var(--font-body)' }}>
              Millions of Americans qualify for health coverage they don&apos;t know about.
              Find out if you&apos;re one of them — it takes 2 minutes and it&apos;s completely free.
            </p>
            <Link
              href={`/${locale}/screener`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl text-lg transition-all"
              style={{ background: 'var(--teal-light)', color: 'var(--primary-deeper)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)', fontFamily: 'var(--font-display)' }}
            >
              Start Free Eligibility Check
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', marginTop: '1.5rem', fontFamily: 'var(--font-body)' }}>
              No sign-up. No pressure. Just results.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
