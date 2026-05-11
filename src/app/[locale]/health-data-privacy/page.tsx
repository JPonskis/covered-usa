import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return {
    title: 'Consumer Health Data Privacy Policy | CoveredUSA',
    description:
      'How CoveredUSA handles consumer health data, including health information collected during eligibility screening.',
    alternates: { canonical: '/health-data-privacy' },
  };
}

export default async function HealthDataPrivacy({
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
          Consumer Health Data Privacy Policy
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="mb-1">Last Updated: May 2026</p>
        <p style={{ color: 'var(--text-muted)' }} className="mb-10">Effective Date: May 2026</p>

        <div className="space-y-10 article-content">

          <section>
            <h2>Introduction</h2>
            <p>
              This Consumer Health Data Privacy Policy supplements our general{' '}
              <Link href={`/${locale}/privacy`}>Privacy Policy</Link> and describes how CoveredUSA collects, uses, and shares consumer health data in connection with our health insurance eligibility screening service.
            </p>
            <p>
              Some US states — including Washington (My Health MY Data Act), Nevada, Connecticut, and others — have enacted laws that specifically protect consumer health data. This policy applies to residents of those states and to all users of our service.
            </p>
          </section>

          <section>
            <h2>What Is Consumer Health Data?</h2>
            <p>Consumer health data includes personal information that identifies or could be used to infer information about your health status or healthcare needs, including:</p>
            <ul>
              <li>Health conditions, diagnoses, or disabilities you disclose during screening</li>
              <li>Prescription or medication information</li>
              <li>Insurance status and coverage history</li>
              <li>Information about healthcare services you have sought or received</li>
              <li>Demographic data combined with health indicators (age, household composition used in Medicaid/Medicare eligibility)</li>
            </ul>
          </section>

          <section>
            <h2>Health Data We Collect</h2>
            <p>
              In the course of providing eligibility screening for Medicaid, Medicare, ACA Marketplace plans, Medicare Savings Programs, and CHIP, we collect the following health-related data:
            </p>
            <ul>
              <li><strong>Age and disability status</strong> — used for Medicare and SSDI eligibility screening</li>
              <li><strong>Pregnancy status</strong> — relevant to Medicaid eligibility in many states</li>
              <li><strong>Insurance coverage status</strong> — current and recent coverage history</li>
              <li><strong>Income and household information</strong> — used to determine eligibility thresholds for all programs</li>
            </ul>
            <p>
              We do not collect clinical health data, diagnoses, medical records, or prescription information for general screening purposes.
            </p>
          </section>

          <section>
            <h2>How We Use Health Data</h2>
            <p>We use consumer health data solely to:</p>
            <ul>
              <li>Determine which health insurance programs you may be eligible for</li>
              <li>Display eligibility results to you</li>
              <li>Share with licensed insurance agents when you explicitly request an agent connection</li>
              <li>Improve the accuracy of our eligibility screener</li>
              <li>Comply with applicable laws</li>
            </ul>
            <p>
              We do not use consumer health data for advertising, marketing profiling, or sale to data brokers.
            </p>
          </section>

          <section>
            <h2>Sharing of Health Data</h2>
            <p>
              <strong>With insurance agents:</strong> If you choose to connect with a licensed insurance agent, your health-related screener data will be shared with that agent to facilitate enrollment assistance. You can opt out of this sharing at any time.
            </p>
            <p>
              <strong>With service providers:</strong> We share data with vendors who help us operate our platform (hosting, analytics, security). These parties are contractually prohibited from using your data for any purpose other than providing services to us.
            </p>
            <p>
              <strong>We do not share consumer health data with:</strong> data brokers, advertising networks, employers, or law enforcement except as required by valid legal process.
            </p>
          </section>

          <section>
            <h2>Your Rights Regarding Health Data</h2>
            <p>You have the following rights with respect to your consumer health data:</p>
            <ul>
              <li><strong>Right to access:</strong> You can request a copy of the health data we hold about you.</li>
              <li><strong>Right to deletion:</strong> You can request that we delete your health data. We will comply within 30 days except where retention is required by law.</li>
              <li><strong>Right to withdraw consent:</strong> If you previously consented to sharing your data with agents, you can revoke that consent at any time.</li>
              <li><strong>Right to opt out of sale:</strong> See our <Link href={`/${locale}/do-not-sell`}>Do Not Sell page</Link>.</li>
              <li><strong>Right to non-discrimination:</strong> We will never treat you differently for exercising any of these rights.</li>
            </ul>
          </section>

          <section>
            <h2>Washington My Health MY Data Act</h2>
            <p>
              Washington state residents have additional rights under the My Health MY Data Act (MHMDA). This law provides expanded protections for consumer health data. Under the MHMDA, you have the right to:
            </p>
            <ul>
              <li>Confirm whether we collect, share, or sell your consumer health data</li>
              <li>Access a list of all third parties with whom we shared your health data</li>
              <li>Delete consumer health data collected through our website</li>
              <li>Withdraw consent for collection and sharing of your health data</li>
            </ul>
            <p>
              To exercise these rights, email{' '}
              <a href="mailto:privacy@coveredusa.org">privacy@coveredusa.org</a>.
            </p>
          </section>

          <section>
            <h2>Data Security</h2>
            <p>
              We apply technical and organizational measures appropriate to the sensitivity of health data, including encryption in transit and at rest, access controls, and regular security assessments.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              For questions about how we handle your health data, or to exercise your rights:
            </p>
            <p>
              <a href="mailto:privacy@coveredusa.org">privacy@coveredusa.org</a>
            </p>
            <p>We respond to all health data requests within 30 days.</p>
          </section>

        </div>

        <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border-light)' }}>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/${locale}/privacy`}
              className="inline-flex items-center text-sm font-medium gap-1"
              style={{ color: 'var(--primary)' }}
            >
              Privacy Policy
            </Link>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center text-sm font-medium gap-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
