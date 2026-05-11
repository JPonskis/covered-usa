import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return {
    title: 'Terms of Service | CoveredUSA',
    description: 'Terms and conditions for using the CoveredUSA health insurance eligibility screener.',
    alternates: { canonical: '/terms' },
  };
}

export default async function TermsOfService({
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
          Terms of Service
        </h1>
        <p className="mb-10" style={{ color: 'var(--text-muted)' }}>
          Last Updated: May 2026
        </p>

        <div className="space-y-10 article-content">

          <section>
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing or using coveredusa.org (the &quot;Site&quot;) or our health insurance eligibility screener, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use our service.
            </p>
            <p>
              We may update these Terms from time to time. Continued use of the Site after changes constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2>Description of Service</h2>
            <p>
              CoveredUSA provides a free online tool that screens users for potential eligibility for health insurance programs including Medicaid, Medicare, ACA Marketplace plans, Medicare Savings Programs, and CHIP. We also facilitate connections between users and licensed insurance agents.
            </p>
            <p>
              Our service is informational. We do not enroll you in any health insurance program. Any enrollment occurs directly with the relevant government program or insurance carrier.
            </p>
          </section>

          <section>
            <h2>Not Legal or Medical Advice</h2>
            <p>
              Nothing on this Site constitutes legal advice, medical advice, or insurance advice. Our eligibility results are estimates based on the information you enter. They are not a guarantee of eligibility or enrollment. Actual eligibility is determined by the relevant government agency or insurance carrier.
            </p>
            <p>
              Consult a licensed insurance agent, attorney, or healthcare professional for advice specific to your situation.
            </p>
          </section>

          <section>
            <h2>Free Service — How We Make Money</h2>
            <p>
              Our screener is free to use. We earn revenue when users choose to connect with licensed insurance agents and ultimately enroll in coverage. Agents are compensated by insurance carriers — you never pay anything to use our service or to work with an agent.
            </p>
            <p>
              You are never required to connect with an agent or share your contact information to view your eligibility results.
            </p>
          </section>

          <section>
            <h2>Accuracy of Information</h2>
            <p>
              The eligibility results we provide are based on the information you enter. You are responsible for entering accurate information. We make reasonable efforts to keep our eligibility criteria up to date, but program rules change frequently. We do not warrant that our results reflect current program requirements in your state.
            </p>
          </section>

          <section>
            <h2>Not a Government Website</h2>
            <p>
              CoveredUSA is not affiliated with or endorsed by any government agency, including the Centers for Medicare &amp; Medicaid Services (CMS), the Department of Health and Human Services (HHS), the Social Security Administration, or any state Medicaid agency.
            </p>
            <p>
              CoveredUSA is not connected with or endorsed by the United States government or the federal Medicare program.
            </p>
          </section>

          <section>
            <h2>User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Site for any unlawful purpose</li>
              <li>Submit false or misleading information</li>
              <li>Attempt to access or disrupt our systems</li>
              <li>Scrape, copy, or reproduce content from the Site without permission</li>
              <li>Use the Site in any way that could harm other users or third parties</li>
            </ul>
          </section>

          <section>
            <h2>Third-Party Agents and Services</h2>
            <p>
              When you choose to connect with a licensed insurance agent through our service, you are entering into a relationship with that agent — an independent licensed professional, not an employee or agent of CoveredUSA. We are not responsible for the advice, actions, or omissions of any agent you connect with through our platform.
            </p>
            <p>
              We may link to third-party websites (such as healthcare.gov, medicaid.gov, or state enrollment portals). We are not responsible for the content or practices of those sites.
            </p>
          </section>

          <section>
            <h2>Disclaimer of Warranties</h2>
            <p>
              THE SITE AND SERVICE ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT ANY ELIGIBILITY RESULTS ARE ACCURATE OR CURRENT.
            </p>
          </section>

          <section>
            <h2>Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, COVEREDUSA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
            </p>
            <p>
              OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF YOUR USE OF THE SERVICE SHALL NOT EXCEED $100.
            </p>
          </section>

          <section>
            <h2>Privacy</h2>
            <p>
              Your use of the Site is also governed by our{' '}
              <Link href={`/${locale}/privacy`}>Privacy Policy</Link> and{' '}
              <Link href={`/${locale}/health-data-privacy`}>Consumer Health Data Privacy Policy</Link>, which are incorporated by reference into these Terms.
            </p>
          </section>

          <section>
            <h2>Governing Law</h2>
            <p>
              These Terms are governed by the laws of the United States and the state in which CoveredUSA is incorporated, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Questions about these Terms? Contact us at{' '}
              <a href="mailto:privacy@coveredusa.org">privacy@coveredusa.org</a>.
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
