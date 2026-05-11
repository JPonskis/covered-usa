import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return {
    title: 'About CoveredUSA | Free Health Insurance Eligibility',
    description:
      'Learn how CoveredUSA works, how we make money, and our mission to connect Americans with health coverage they deserve.',
    alternates: { canonical: '/about' },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://coveredusa.org/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'About', item: `https://coveredusa.org/${locale}/about` },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="max-w-5xl mx-auto px-6 py-14 md:py-18 text-center">
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            About CoveredUSA
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            We help Americans find health insurance they qualify for — and connect them with licensed agents who can help them enroll.
          </p>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">

        <section className="mb-12">
          <h2
            className="text-2xl font-semibold mb-5"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            What CoveredUSA is
          </h2>
          <div className="space-y-4 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <p>
              CoveredUSA is a free eligibility screening tool that helps people understand which health insurance programs they may qualify for — including Medicaid, Medicare, ACA Marketplace plans, Medicare Savings Programs, and CHIP for children.
            </p>
            <p>
              We built this because navigating health coverage in the US is genuinely confusing. Millions of Americans are uninsured or underinsured not because they don&apos;t qualify for coverage, but because they don&apos;t know what&apos;s available or how to apply. CoveredUSA makes that first step fast and easy.
            </p>
            <p>
              Our screener asks about your household size, income, age, and state — the core factors that determine eligibility — and shows you which programs you likely qualify for in about 2 minutes. No account required. No sign-up. Free.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2
            className="text-2xl font-semibold mb-5"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            How we make money
          </h2>
          <div
            className="p-5 rounded-xl mb-6"
            style={{ background: 'var(--cream)', border: '1px solid var(--cream-dark)' }}
          >
            <p className="font-semibold mb-1" style={{ color: 'var(--primary)' }}>
              Our screener is always free for users.
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              We never charge the people using our tool, and we never will.
            </p>
          </div>
          <div className="space-y-4 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <p>
              CoveredUSA earns revenue by connecting users with licensed insurance agents. When you complete our screener, you can choose to be connected with an agent who can help you enroll in coverage.
            </p>
            <p>
              Those agents are independent licensed professionals who are compensated by insurance companies when you enroll in a plan — the same way a real estate agent is paid by the seller, not the buyer. You never pay anything.
            </p>
            <p>
              We only earn a referral fee when you choose to connect with an agent, and only if they can help you. You are never required to speak with an agent. Our eligibility results are yours regardless of what you do next.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2
            className="text-2xl font-semibold mb-5"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Our mission
          </h2>
          <div className="space-y-4 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <p>
              More than 25 million Americans are uninsured. Many of them qualify for Medicaid or subsidized Marketplace coverage — they just don&apos;t know it. Language barriers, confusing websites, and fear of the process keep people from getting covered.
            </p>
            <p>
              CoveredUSA exists to close that gap. We want anyone who qualifies for health coverage to know it, and to have a clear path to enrollment — in English or Spanish, with or without an agent.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2
            className="text-2xl font-semibold mb-5"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Important disclosures
          </h2>
          <div
            className="space-y-3 text-sm leading-relaxed p-5 rounded-xl"
            style={{ background: 'var(--warm-white)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}
          >
            <p>
              CoveredUSA is not affiliated with or endorsed by any government agency, including the Centers for Medicare &amp; Medicaid Services (CMS), the Department of Health and Human Services (HHS), or the Social Security Administration.
            </p>
            <p>
              CoveredUSA is not connected with or endorsed by the United States government or the federal Medicare program.
            </p>
            <p>
              Our eligibility results are estimates based on the information you provide. They are not a guarantee of eligibility or enrollment. Actual eligibility is determined by the relevant government agency or insurance plan.
            </p>
            <p>
              Licensed insurance agents we connect you with are independent professionals. They are not employees or agents of CoveredUSA.
            </p>
          </div>
        </section>

        <div className="mt-10 pt-8 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center text-sm font-medium gap-1"
            style={{ color: 'var(--primary)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
        </div>
      </article>
    </main>
  );
}
