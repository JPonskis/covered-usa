import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return {
    title: 'Privacy Policy | CoveredUSA',
    description: 'How CoveredUSA collects, uses, and protects your personal information.',
    alternates: { canonical: '/privacy' },
  };
}

export default async function PrivacyPolicy({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <h1
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          Privacy Policy
        </h1>
        <p className="mb-10" style={{ color: 'var(--text-muted)' }}>
          Last Updated: May 2026
        </p>

        <div className="space-y-10 article-content">

          <section>
            <h2>Overview</h2>
            <p>
              CoveredUSA (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates coveredusa.org (the &quot;Site&quot;). This Privacy Policy explains how we collect, use, and share information when you use our free health insurance eligibility screener and related services.
            </p>
            <p>
              We are committed to protecting your privacy. We collect only what we need to provide you with useful eligibility results and, if you choose, to connect you with a licensed insurance agent.
            </p>
          </section>

          <section>
            <h2>Information We Collect</h2>
            <p>When you use our screener, we may collect:</p>
            <ul>
              <li>Household size and composition (number of adults, children)</li>
              <li>Estimated household income</li>
              <li>Age and date of birth</li>
              <li>State of residence and ZIP code</li>
              <li>Contact information (name, email, phone number) — only if you choose to be connected with an agent</li>
              <li>Technical data: IP address, browser type, device type, pages visited, time on site</li>
            </ul>
            <p>
              <strong>We do not collect:</strong> Social Security numbers, medical records, bank account information, or government ID numbers as part of our eligibility screening.
            </p>
          </section>

          <section>
            <h2>How We Use Your Information</h2>
            <p>We use the information you provide to:</p>
            <ul>
              <li>Determine which health insurance programs you may be eligible for</li>
              <li>Display your eligibility results</li>
              <li>Connect you with a licensed insurance agent (only if you request this)</li>
              <li>Improve our screener and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>How We Share Your Information</h2>
            <p>
              <strong>We do not sell your information to data brokers or marketing lists.</strong> We share your information only in the following circumstances:
            </p>
            <p>
              <strong>With licensed insurance agents:</strong> If you choose to connect with an agent to help you enroll in coverage, we share your contact information and screener responses with licensed insurance professionals. This is the only sharing that may constitute a &quot;sale&quot; under California law. See our{' '}
              <Link href={`/${locale}/do-not-sell`}>Do Not Sell</Link> page to opt out.
            </p>
            <p>
              <strong>With service providers:</strong> We use third-party services to operate our website (hosting, analytics, error tracking). These providers only process your data on our behalf and are bound by confidentiality agreements.
            </p>
            <p>
              <strong>As required by law:</strong> We may disclose information if required by subpoena, court order, or other legal process.
            </p>
          </section>

          <section>
            <h2>Connecting You With Insurance Agents</h2>
            <p>
              Our business model is based on connecting users who want help enrolling with licensed insurance agents. When you complete our screener and request an agent connection, your contact information and eligibility data will be shared with one or more licensed agents or agencies.
            </p>
            <p>
              Those agents may contact you by phone, email, or text message regarding health insurance options. You can opt out of agent follow-up at any time by contacting us at{' '}
              <a href="mailto:privacy@coveredusa.org">privacy@coveredusa.org</a>.
            </p>
            <p>
              Under California law (CCPA), sharing data with agents who may benefit commercially from it can constitute a &quot;sale.&quot; You have the right to opt out.{' '}
              <Link href={`/${locale}/do-not-sell`}>Submit your opt-out request here.</Link>
            </p>
          </section>

          <section>
            <h2>How Our Free Service Works</h2>
            <p>
              CoveredUSA is free for users because we earn referral fees from insurance agents when users choose to connect with them. This is similar to how comparison websites and marketplaces work.
            </p>
            <p>
              <strong>Your eligibility results are yours regardless of what you do next.</strong> We never require you to speak with an agent or share your contact information to see your results.
            </p>
          </section>

          <section>
            <h2>Security</h2>
            <p>
              We use industry-standard security measures including TLS encryption for data in transit and secure storage for data at rest. We limit access to personal information to employees and contractors who need it to operate our services.
            </p>
            <p>
              No system is perfectly secure. If you have reason to believe your information may have been compromised, contact us at{' '}
              <a href="mailto:privacy@coveredusa.org">privacy@coveredusa.org</a>.
            </p>
          </section>

          <section>
            <h2>Data Retention</h2>
            <p>
              We retain screener response data for up to 24 months to improve our service and for analytics purposes. If you provided contact information for an agent connection, that data is retained until you request deletion or opt out of data sharing.
            </p>
            <p>
              To request deletion of your data, email{' '}
              <a href="mailto:privacy@coveredusa.org">privacy@coveredusa.org</a>.
            </p>
          </section>

          <section>
            <h2>Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to understand how visitors use our site and to improve the screener experience. We use analytics services such as Google Analytics. You can disable cookies in your browser settings, though this may affect site functionality.
            </p>
          </section>

          <section>
            <h2>Third-Party Links</h2>
            <p>
              Our site may contain links to government websites (such as healthcare.gov) and other third-party sites. We are not responsible for the privacy practices of those sites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2>Children</h2>
            <p>
              CoveredUSA is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, contact us immediately.
            </p>
          </section>

          <section>
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the &quot;Last Updated&quot; date at the top of this page. Continued use of our site after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section id="ccpa">
            <h2>California Privacy Rights (CCPA)</h2>
            <p>
              California residents have the right to: (1) know what personal information we collect and how it is used; (2) request deletion of their personal information; (3) opt out of the sale of their personal information; and (4) non-discrimination for exercising these rights.
            </p>
            <p>
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@coveredusa.org">privacy@coveredusa.org</a> or use our{' '}
              <Link href={`/${locale}/do-not-sell`}>Do Not Sell form</Link>.
            </p>
          </section>

          <section>
            <h2>Your Rights</h2>
            <p>
              You have the right to access, correct, or delete the personal information we hold about you. You also have the right to restrict or object to certain processing of your data.
            </p>
            <p>
              For health data rights, see our{' '}
              <Link href={`/${locale}/health-data-privacy`}>Consumer Health Data Privacy Policy</Link>.
            </p>
            <p>
              To exercise any rights, email{' '}
              <a href="mailto:privacy@coveredusa.org">privacy@coveredusa.org</a>. We respond within 30 days.
            </p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>
              Questions about this policy? Contact us at{' '}
              <a href="mailto:privacy@coveredusa.org">privacy@coveredusa.org</a>.
            </p>
            <p>
              CoveredUSA<br />
              coveredusa.org
            </p>
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
            Back to home
          </Link>
        </div>
      </article>
    </main>
  );
}
