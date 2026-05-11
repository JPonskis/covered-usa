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
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="var(--primary)" opacity="0.15" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M10 12h4M12 10v4" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'ACA Marketplace',
    desc: 'Subsidized health insurance plans for individuals and families',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <rect x="3" y="6" width="18" height="14" rx="3" fill="var(--primary)" opacity="0.15" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M14 6h2v4h4v2h-4v4h-2v-4h-4V8h4V6z" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Medicare',
    desc: 'Health coverage for adults 65+ or with qualifying disabilities',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" fill="var(--primary)" opacity="0.15" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M12 7v5l3 3" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 17h8" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Medicare Savings',
    desc: 'Help paying Medicare premiums and out-of-pocket costs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" fill="var(--primary)" opacity="0.15" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M12 7v10M9 9.5h4.5a2 2 0 010 4H9m0 0h5" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'CHIP',
    desc: "Free health coverage for children in your household",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="8" r="4" fill="var(--primary)" opacity="0.15" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 4l1.5 1.5M9 4L7.5 5.5" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const faqs = [
  {
    q: 'Is this really free?',
    a: "Yes, completely. CoveredUSA never charges users. We're funded by licensed insurance agents who pay us only if you choose to connect with them — and only after you enroll.",
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
    a: "No. We show you your eligibility results with no strings attached. If you want help enrolling, we can connect you with a licensed agent — but that's always your choice.",
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

  const CheckIcon = () => (
    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--primary)' }}>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <main className="min-h-screen bg-white">
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
      <section style={{ background: 'linear-gradient(180deg, var(--cream) 0%, white 100%)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-sm font-semibold"
              style={{ background: 'var(--cream-dark)', color: 'var(--primary)' }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--primary)' }} />
              Free Eligibility Check
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold mb-5 leading-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
            >
              {t('headline')}
            </h1>

            <p
              className="text-lg md:text-xl mb-8 leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Check your eligibility in 2 minutes. Free, confidential, available in Spanish.
            </p>

            <Link
              href={`/${locale}/screener`}
              className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              {t('cta')}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8">
              {[
                t('trust1'),
                t('trust2'),
                t('trust3'),
                'Results in 2 minutes',
              ].map((badge) => (
                <span key={badge} className="trust-badge">
                  <CheckIcon />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{badge}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Programs we check */}
      <section style={{ background: 'var(--warm-white)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
            >
              Programs we check
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              We screen for 5 federal and state health coverage programs in one check.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {programs.map((program) => (
              <div key={program.name} className="card flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--cream)' }}
                >
                  {program.icon}
                </div>
                <div>
                  <h3
                    className="font-semibold text-base mb-1"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                  >
                    {program.name}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {program.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* CTA card */}
            <div
              className="card flex items-center justify-center"
              style={{ background: 'var(--cream)', border: '1px solid var(--cream-dark)' }}
            >
              <Link
                href={`/${locale}/screener`}
                className="font-semibold flex items-center gap-1"
                style={{ color: 'var(--primary)' }}
              >
                See what you qualify for
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ background: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-14">
            <h2
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
            >
              How it works
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Three steps, two minutes, no catch.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                num: '1',
                title: 'Answer a few questions',
                desc: 'Tell us about your household, income, and state. Takes about 2 minutes.',
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
                desc: 'We check eligibility for 5 healthcare programs instantly and show you what you likely qualify for.',
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
              <div key={step.num} className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 relative"
                  style={{ background: 'var(--cream)', color: 'var(--primary)' }}
                >
                  {step.icon}
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{ background: 'var(--primary)', color: 'white' }}
                  >
                    {step.num}
                  </span>
                </div>
                <h3
                  className="font-semibold text-lg mb-2"
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

          <div className="text-center mt-10">
            <Link href={`/${locale}/screener`} className="btn-primary">
              {t('cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Why CoveredUSA */}
      <section style={{ background: 'var(--cream)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
            >
              Why CoveredUSA
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: 'Free to use',
                desc: 'We never charge users. Our service is 100% free.',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 7v10M9 9.5h4.5a2 2 0 010 4H9m0 0h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                title: 'Licensed agents',
                desc: 'We connect you with licensed insurance professionals.',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M12 2L4 6v6c0 5.52 3.44 10.24 8 12 4.56-1.76 8-6.48 8-12V6l-8-4z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                title: 'Available in Spanish',
                desc: 'Our screener and agents speak Spanish.',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M3 5h8M7 3v2M10 8c0 2.21-1.34 4-3 4s-3-1.79-3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M13 19l4-9 4 9M14.5 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                title: 'Confidential',
                desc: 'We never sell your data. Your answers are private.',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="card text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--cream-dark)', color: 'var(--primary)' }}
                >
                  {item.icon}
                </div>
                <h3
                  className="font-semibold mb-2"
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
      <section style={{ background: 'var(--warm-white)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
            >
              Frequently asked questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="card"
                style={{ background: 'white' }}
              >
                <h3
                  className="font-semibold mb-2"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                >
                  {faq.q}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: 'var(--primary-dark)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 text-center">
          <h2
            className="text-2xl md:text-3xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Millions of Americans qualify for health coverage they don&apos;t know about.
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Find out if you&apos;re one of them. It takes 2 minutes and it&apos;s completely free.
          </p>
          <Link
            href={`/${locale}/screener`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-lg text-lg transition-all"
            style={{ background: 'var(--teal)', color: 'white' }}
          >
            Check My Eligibility — It&apos;s Free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-white/35 text-sm mt-6">No sign-up. No pressure. Just results.</p>
        </div>
      </section>
    </main>
  );
}
