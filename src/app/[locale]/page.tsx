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
      languages: {
        en: '/en',
        es: '/es',
      },
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
    color: '#0369a1',
    bgColor: '#e0f2fe',
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
    desc: "Free health coverage for children in your household",
    color: '#ea580c',
    bgColor: '#ffedd5',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 4l1.5 1.5M9 4L7.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
    a: 'No account, no email, no sign-up required. Answer the questions, see your results. That\'s it.',
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
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'CoveredUSA Health Insurance Screener',
  url: 'https://coveredusa.org',
  applicationCategory: 'HealthApplication',
  description:
    'Free health insurance eligibility screener. Check Medicaid, Medicare, ACA, and CHIP eligibility in 2 minutes.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CoveredUSA',
  url: 'https://coveredusa.org',
  description:
    'Free health insurance eligibility screening connecting Americans with Medicaid, Medicare, ACA plans, and CHIP coverage.',
  foundingDate: '2026',
};

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(180deg, var(--cream) 0%, white 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle background pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--cream-dark) 1px, transparent 0)',
          backgroundSize: '40px 40px',
          opacity: 0.4,
          pointerEvents: 'none',
        }} />

        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28" style={{ position: 'relative' }}>
          <div className="max-w-2xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold"
              style={{ background: 'var(--cream-dark)', color: 'var(--primary)', border: '1px solid var(--primary-lightest)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="4" fill="var(--success)" />
                <circle cx="8" cy="8" r="4" fill="var(--success)" opacity="0.3">
                  <animate attributeName="r" from="4" to="7" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </svg>
              Free Eligibility Check
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
            >
              {t('headline')}
            </h1>

            <p
              className="text-lg md:text-xl mb-10 leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Check your eligibility for Medicaid, Medicare, ACA plans, and more. Free, confidential, and available in Spanish.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/${locale}/screener`}
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
                style={{ fontSize: '1.1rem', boxShadow: 'var(--shadow-primary)' }}
              >
                {t('cta')}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Takes about 2 minutes</span>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-10">
              {[
                { text: t('trust1'), icon: '🆓' },
                { text: t('trust2'), icon: '🔒' },
                { text: t('trust3'), icon: '🌐' },
              ].map((badge) => (
                <span key={badge.text} className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <span style={{ fontSize: '1rem' }}>{badge.icon}</span>
                  {badge.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Programs we check */}
      <section style={{ background: 'white', borderTop: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-14">
            <span
              className="inline-block text-sm font-semibold mb-3 px-3 py-1 rounded-full"
              style={{ background: 'var(--cream)', color: 'var(--primary)' }}
            >
              5 Programs Checked
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              Programs we screen for
            </h2>
            <p className="max-w-lg mx-auto" style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
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
                  <h3
                    className="font-bold text-base mb-1"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                  >
                    {program.name}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    {program.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* CTA card */}
            <div
              className="card flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--cream), var(--cream-dark))',
                border: '1px solid var(--cream-dark)',
                minHeight: '140px',
              }}
            >
              <Link
                href={`/${locale}/screener`}
                className="font-semibold flex items-center gap-2 text-base"
                style={{ color: 'var(--primary)' }}
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

      {/* How it works */}
      <section id="how-it-works" style={{ background: 'var(--cream)', borderTop: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-16">
            <span
              className="inline-block text-sm font-semibold mb-3 px-3 py-1 rounded-full"
              style={{ background: 'white', color: 'var(--primary)' }}
            >
              Simple Process
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              How it works
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Three steps, two minutes, no catch.</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line (desktop only) */}
              <div
                className="hidden md:block absolute"
                style={{
                  top: '44px',
                  left: 'calc(16.67% + 28px)',
                  right: 'calc(16.67% + 28px)',
                  height: '2px',
                  background: 'var(--sand)',
                  zIndex: 0,
                }}
              >
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary), var(--teal))',
                  borderRadius: '999px',
                }} />
              </div>

              {[
                {
                  num: '1',
                  title: 'Answer a few questions',
                  desc: 'Tell us about your household, income, and state. Four short sections, about 2 minutes total.',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                      <rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  num: '2',
                  title: 'See your results',
                  desc: 'We check 5 healthcare programs instantly and show you what you likely qualify for.',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                      <path d="M9 11l3 3 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 12a9 9 0 11-6.22-8.56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  num: '3',
                  title: 'Get free help enrolling',
                  desc: 'Connect with a licensed agent who speaks your language. No cost to you, ever.',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ),
                },
              ].map((step) => (
                <div key={step.num} className="text-center relative" style={{ zIndex: 1 }}>
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 relative"
                    style={{ background: 'white', color: 'var(--primary)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}
                  >
                    {step.icon}
                    <span
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
                      style={{ background: 'var(--primary)', color: 'white', boxShadow: 'var(--shadow-sm)' }}
                    >
                      {step.num}
                    </span>
                  </div>
                  <h3
                    className="font-bold text-lg mb-2"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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

      {/* Why CoveredUSA */}
      <section style={{ background: 'white', borderTop: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              Why CoveredUSA
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Built to help you find coverage, not to sell you something.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: 'Free to use',
                desc: 'We never charge users. Our service is 100% free.',
                emoji: '💰',
                color: '#059669',
                bg: '#d1fae5',
              },
              {
                title: 'Licensed agents',
                desc: 'We connect you with licensed insurance professionals.',
                emoji: '🛡️',
                color: '#0369a1',
                bg: '#e0f2fe',
              },
              {
                title: 'Available in Spanish',
                desc: 'Our screener and agents speak Spanish.',
                emoji: '🌐',
                color: '#7c3aed',
                bg: '#ede9fe',
              },
              {
                title: 'Confidential',
                desc: 'We never sell your data. Your answers are private.',
                emoji: '🔒',
                color: '#0d9488',
                bg: '#ccfbf1',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="text-center"
                style={{ padding: '1.5rem' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: item.bg, fontSize: '1.5rem' }}
                >
                  {item.emoji}
                </div>
                <h3
                  className="font-bold mb-2"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: 'var(--cream)', borderTop: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              Frequently asked questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group"
                style={{
                  background: 'white',
                  borderRadius: '14px',
                  border: '1px solid var(--border-light)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                <summary
                  className="cursor-pointer list-none flex items-center justify-between"
                  style={{ padding: '1.125rem 1.25rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                >
                  <span>{faq.q}</span>
                  <svg
                    className="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="var(--text-muted)"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div style={{ padding: '0 1.25rem 1.125rem' }}>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary-deeper) 0%, var(--primary-dark) 50%, var(--primary) 100%)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24 text-center">
          <div className="max-w-xl mx-auto">
            <h2
              className="text-2xl md:text-3xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.3 }}
            >
              Millions of Americans qualify for health coverage they don&apos;t know about.
            </h2>
            <p className="text-white/60 mb-10 text-base">
              Find out if you&apos;re one of them. It takes 2 minutes and it&apos;s completely free.
            </p>
            <Link
              href={`/${locale}/screener`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl text-lg transition-all"
              style={{ background: 'white', color: 'var(--primary-dark)', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
            >
              Check My Eligibility
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="text-white/35 text-sm mt-6">No sign-up. No pressure. Just results.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
