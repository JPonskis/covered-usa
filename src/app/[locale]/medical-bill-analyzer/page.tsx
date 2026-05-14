import type { Metadata } from 'next'
import BillAnalyzer from '@/components/BillAnalyzer'

export const metadata: Metadata = {
  title: 'Free Medical Bill Analyzer | Find Overcharges on Your Hospital Bill | CoveredUSA',
  description:
    'Upload your hospital bill and find out if you were overcharged. We compare every line item to federal rates, flag billing errors, check charity care eligibility, and generate a dispute letter. Free, no signup.',
  alternates: {
    canonical: 'https://coveredusa.org/en/medical-bill-analyzer',
    languages: {
      'en': 'https://coveredusa.org/en/medical-bill-analyzer',
      'es': 'https://coveredusa.org/es/medical-bill-analyzer',
      'x-default': 'https://coveredusa.org/en/medical-bill-analyzer',
    },
  },
  openGraph: {
    title: 'Don\'t pay that hospital bill yet. 80% have errors.',
    description:
      'Upload your hospital bill. We show you exactly what to dispute and write the letter for you. Free.',
    type: 'website',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'CoveredUSA Medical Bill Analyzer',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free tool to analyze medical bills for overcharges, billing errors, and charity care eligibility.',
      url: 'https://coveredusa.org/en/medical-bill-analyzer',
    },
    {
      '@type': 'HowTo',
      name: 'How to Dispute a Hospital Bill',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload your bill',
          text: 'Take a photo or upload a PDF of your hospital bill. The tool reads every line item automatically.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'We find what to dispute',
          text: 'Each charge is compared to federal payment rates. Billing errors, overcharges, and charity care eligibility are flagged.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Get your dispute letter',
          text: 'Download a ready-to-send dispute letter citing every overcharge and error found on your bill.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is the medical bill analyzer really free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The tool is completely free with no signup required. You can upload your bill and get a full analysis at no cost.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is my bill data stored or shared?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Your bill is analyzed in memory and deleted immediately. CoveredUSA never stores, shares, or sells any bill data.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does the tool know what a procedure should cost?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The tool compares your charges to rates published by the Centers for Medicare and Medicaid Services (CMS). These are the rates the federal government pays hospitals for the same procedures. They are public, updated annually, and widely used as a benchmark for fair pricing.',
          },
        },
        {
          '@type': 'Question',
          name: 'What billing errors does the tool detect?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The tool looks for duplicate charges (same procedure billed twice), unbundled procedures (procedures that should be combined but are billed separately to inflate costs), and charges that are unusually high compared to federal benchmarks.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is hospital charity care?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Under federal law, nonprofit hospitals (about 60% of all hospitals) are required to offer financial assistance to patients who qualify. If your income is below a certain threshold, you may be eligible for free or reduced-cost care. Most people do not know this exists. The tool checks whether your hospital is a nonprofit and whether your income may qualify.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I actually dispute a medical bill?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. You have the legal right to request an itemized bill and dispute any charges you believe are incorrect. Hospitals are required to provide itemized bills on request. The tool generates a formal dispute letter that cites the specific overcharges and errors found on your bill.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does this tool work for all types of medical bills?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The tool works best with itemized hospital bills that list individual procedure charges. It also works with outpatient bills, surgical bills, and emergency room statements. Summary bills with limited line items will produce less detailed results.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much should an emergency room visit cost?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'According to the Medicare Physician Fee Schedule published by the Centers for Medicare and Medicaid Services (CMS), a Level 4 emergency room visit has a federal reimbursement rate of approximately $200 to $500. Hospitals routinely bill $2,000 to $5,000 or more for the same visit. The gap between what hospitals charge uninsured patients and what Medicare pays is typically 5 to 10 times the federal rate.',
          },
        },
        {
          '@type': 'Question',
          name: 'What happens if I cannot pay my hospital bill?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'If you cannot pay your hospital bill, you have several options. First, request the itemized bill and check for errors. Billing mistakes are common and reduce the amount owed. Second, apply for the hospital\'s financial assistance program. Under Section 501(r) of the Affordable Care Act, nonprofit hospitals are legally required to offer free or reduced-cost care to qualifying patients. Third, negotiate directly with the billing department. Hospitals regularly settle bills for less than the billed amount. Since 2023, medical debt under $500 is no longer reported to credit bureaus, and paid medical debt is removed from credit reports entirely.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I write a letter to dispute a medical bill?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A medical bill dispute letter should include your account number, the date of service, a list of each charge you are disputing with the specific reason (duplicate charge, billing code mismatch, charge exceeds Medicare benchmark), and a request for a written response within 30 days. You have the legal right to an itemized bill before disputing. This tool generates a ready-to-send dispute letter automatically after analyzing your bill, citing every overcharge and error found.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is a chargemaster and why do hospital prices vary so much?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A chargemaster is a hospital\'s internal master price list that sets the starting rate for every service, procedure, and supply item. These prices are set entirely by the hospital and are not regulated. Uninsured patients are often billed at or near chargemaster rates, which can be 3 to 10 times higher than what Medicare pays for identical services. The Hospital Price Transparency Rule, which took full effect in July 2024, now requires every hospital to publish their chargemaster prices publicly. This tool uses the Medicare Physician Fee Schedule as a benchmark to compare against your billed charges.',
          },
        },
      ],
    },
    {
      '@type': 'Organization',
      name: 'CoveredUSA',
      url: 'https://coveredusa.org',
      logo: 'https://coveredusa.org/logo.png',
      description: 'Free health insurance eligibility tools and medical bill analysis for Americans.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://coveredusa.org' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Medical Bill Analyzer',
          item: 'https://coveredusa.org/en/medical-bill-analyzer',
        },
      ],
    },
  ],
}

export default function MedicalBillAnalyzerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
        {/* Hero */}
        <section className="py-16 md:py-20 px-4" style={{ background: 'linear-gradient(135deg, var(--primary-deeper) 0%, var(--primary-dark) 100%)' }}>
          <div className="max-w-2xl mx-auto text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
              Don't pay that bill yet.
            </h1>
            <p className="text-lg opacity-90 mb-6 leading-relaxed">
              <strong className="text-white">80% of hospital bills in the U.S. have errors.</strong>{' '}
              That means yours probably does too. Most people pay whatever the hospital sends because they don't know they can dispute it. You can. Upload yours and we'll show you exactly what to dispute and write the letter for you.
            </p>
            <a
              href="#analyzer"
              className="inline-block px-8 py-3.5 rounded-lg font-semibold text-base"
              style={{ background: 'white', color: 'var(--primary-deeper)' }}
            >
              See What I Actually Owe
            </a>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm opacity-70">
              <span>Free</span>
              <span>No signup</span>
              <span>30 seconds</span>
            </div>
          </div>
        </section>

        {/* Why you can dispute */}
        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Most people don't know you can dispute a hospital bill.
            </h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              You can. And there are three common reasons you'll pay less when you do.
            </p>
            <div className="space-y-6" style={{ color: 'var(--text-secondary)' }}>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>Your bill probably has errors.</strong>{' '}
                The same charge showing up twice. One service billed as three separate items to make the total higher. Billing errors show up on the{' '}
                <a href="https://www.beckershospitalreview.com/finance/80-of-medical-bills-contain-errors-how-to-catch-them.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>majority of hospital bills</a>{' '}
                and they almost always make the number bigger. Most people never look closely enough to notice.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>If your hospital is a nonprofit, you might not have to pay at all.</strong>{' '}
                About{' '}
                <a href="https://www.aha.org/statistics/fast-facts-us-hospitals" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>60% of U.S. hospitals are nonprofits</a>.{' '}
                <a href="https://www.irs.gov/charities-non-profits/charitable-organizations/new-requirements-for-501c3-hospitals-under-the-affordable-care-act" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>Federal law</a>{' '}
                requires them to offer free or reduced-cost care to patients who qualify based on income. The cutoff is higher than you'd think. For a family of four, it can be as high as $124,000 a year. But hospitals still charge you full price because they're hoping you'll just pay it. You don't have to.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>Just because a hospital charges you something doesn't mean you have to accept it.</strong>{' '}
                Hospitals set their own prices. There's no rule. But the U.S. government publishes what it actually pays hospitals for every service through the{' '}
                <a href="https://www.cms.gov/medicare/physician-fee-schedule/search" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>Medicare Physician Fee Schedule</a>.{' '}
                For a standard ER visit, that's around $450. If your hospital charged you $4,000 for the same thing, that's your argument. Hospitals would rather settle than fight you on it.
              </p>
            </div>
          </div>
        </section>

        {/* What you'll get: mock results */}
        <section className="py-14 px-4" style={{ background: 'var(--cream)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Here's what you'll get
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              Upload your bill and you'll get a full breakdown like the one below.
            </p>

            {/* Mock result card */}
            <div className="bg-white border border-[var(--border-light)] rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, var(--primary-deeper), var(--primary-dark))' }}>
                <p className="text-sm text-white/70 mb-1">Analysis Complete</p>
                <p className="text-lg font-semibold text-white">Valley Medical Center</p>
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Total billed</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">$12,847</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Federal rate</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">$2,340</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Potential savings</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--error)' }}>$10,507</p>
                </div>
              </div>

              <div className="border-t border-[var(--border-light)]">
                <div className="px-6 py-3 border-b border-[var(--border-light)]">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Line items</p>
                </div>
                {[
                  { name: 'Emergency room visit, Level 4', billed: '$4,200', federal: '$453', flag: 'Overcharge: 827% above federal rate' },
                  { name: 'CT scan, abdomen with contrast', billed: '$3,800', federal: '$270', flag: null },
                  { name: 'IV fluid administration', billed: '$1,247', federal: '$89', flag: 'Duplicate charge detected' },
                  { name: 'Blood panel, comprehensive', billed: '$890', federal: '$34', flag: null },
                ].map((item, i) => (
                  <div key={i} className="px-6 py-3 border-b border-[var(--border-light)] last:border-b-0 flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-primary)]">{item.name}</p>
                      {item.flag && (
                        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
                          {item.flag}
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{item.billed}</p>
                      <p className="text-xs text-[var(--text-muted)]">Federal: {item.federal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
              Example analysis. Your results will reflect your actual bill.
            </p>

            {/* Dispute letter preview */}
            <div className="mt-10">
              <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>
                Then you get a dispute letter ready to send
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                A formal letter addressed to the hospital's billing department citing every overcharge and error on your bill.
              </p>
              <div className="relative">
              <div
                className="bg-white overflow-hidden"
                style={{
                  maxHeight: '420px',
                  overflowY: 'auto',
                  borderRadius: '4px',
                  border: '1px solid #d4d4d4',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <div className="px-8 py-8 sm:px-12 sm:py-10" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '13px', lineHeight: '1.7', color: '#1a1a1a' }}>
                  <p style={{ marginBottom: '4px' }}>John Smith</p>
                  <p style={{ marginBottom: '4px' }}>1247 Maple Drive</p>
                  <p style={{ marginBottom: '24px' }}>Austin, TX 78701</p>

                  <p style={{ marginBottom: '24px' }}>May 12, 2026</p>

                  <p style={{ marginBottom: '4px' }}>Billing Department</p>
                  <p style={{ marginBottom: '4px' }}>Valley Medical Center</p>
                  <p style={{ marginBottom: '4px' }}>800 Hospital Way</p>
                  <p style={{ marginBottom: '24px' }}>Austin, TX 78705</p>

                  <p style={{ marginBottom: '24px' }}><strong>Re: Dispute of Charges, Account #VMC-2026-44891</strong></p>

                  <p style={{ marginBottom: '16px' }}>Dear Billing Department,</p>

                  <p style={{ marginBottom: '16px' }}>
                    I am writing to formally dispute charges on my bill dated April 28, 2026, totaling <strong>$12,847.00</strong>. After reviewing the itemized charges and comparing them to the Medicare Physician Fee Schedule published by the Centers for Medicare and Medicaid Services (CMS), I have identified significant discrepancies and billing errors that I am requesting your office review and correct.
                  </p>

                  <p style={{ marginBottom: '8px' }}><strong>Specific charges in dispute:</strong></p>

                  <p style={{ marginBottom: '12px', paddingLeft: '16px' }}>
                    <strong>1. Emergency room visit, Level 4 (CPT 99284)</strong><br />
                    Billed: $4,200.00 | Medicare rate: $453.00<br />
                    This charge is 827% above the federal benchmark. I am requesting an explanation of why this charge exceeds the Medicare reimbursement rate by this margin, and a reduction to a reasonable amount.
                  </p>

                  <p style={{ marginBottom: '12px', paddingLeft: '16px' }}>
                    <strong>2. CT scan, abdomen with contrast (CPT 74177)</strong><br />
                    Billed: $3,800.00 | Medicare rate: $270.00<br />
                    This charge exceeds the federal benchmark by over 1,300%. I am requesting justification for this rate.
                  </p>

                  <p style={{ marginBottom: '12px', paddingLeft: '16px' }}>
                    <strong>3. IV fluid administration (CPT 96360)</strong><br />
                    Billed: $1,247.00 | Medicare rate: $89.00<br />
                    This charge appears to be a <strong>duplicate</strong>. IV fluid administration was billed twice on the same date of service. I am requesting removal of the duplicate charge.
                  </p>

                  <p style={{ marginBottom: '12px', paddingLeft: '16px' }}>
                    <strong>4. Blood panel, comprehensive (CPT 80053)</strong><br />
                    Billed: $890.00 | Medicare rate: $34.00<br />
                    This charge exceeds the federal benchmark by over 2,500%.
                  </p>

                  <p style={{ marginBottom: '16px' }}>
                    The total amount billed is $12,847.00. The total Medicare reimbursement for these same services is $846.00, a difference of <strong>$12,001.00</strong>. I understand that hospital rates differ from Medicare rates, but discrepancies of this magnitude warrant review.
                  </p>

                  <p style={{ marginBottom: '16px' }}>
                    Under federal law, I have the right to receive an itemized bill and to dispute any charges I believe are incorrect. I am also requesting information about your hospital's Financial Assistance Policy, as required under Section 501(r) of the Affordable Care Act for nonprofit hospitals.
                  </p>

                  <p style={{ marginBottom: '16px' }}>
                    Please provide a written response to this dispute within 30 days. During this review period, I request that this account not be referred to collections or reported to credit bureaus.
                  </p>

                  <p style={{ marginBottom: '4px' }}>Sincerely,</p>
                  <p style={{ marginTop: '28px', marginBottom: '0' }}>John Smith</p>
                </div>
              </div>
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0"
                style={{
                  height: '48px',
                  background: 'linear-gradient(transparent, rgba(255,255,255,0.95))',
                  borderRadius: '0 0 4px 4px',
                }}
              />
              </div>
              <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
                Scroll to read the full letter. Your letter will cite the specific charges and errors found on your bill.
              </p>
            </div>
          </div>
        </section>

        {/* The tool */}
        <section id="analyzer" className="py-14 px-4" style={{ scrollMarginTop: '24px' }}>
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              See what you actually owe
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Upload your bill. We compare every charge to what the government pays for the same service, flag the errors, and write your dispute letter. Free. No signup. Your bill is never stored.
            </p>
          </div>
          <BillAnalyzer />
        </section>

        {/* Your rights */}
        <section className="py-14 px-4" style={{ background: 'var(--cream)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Your rights
            </h2>
            <div className="space-y-4" style={{ color: 'var(--text-secondary)' }}>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>You can request an itemized bill.</strong>{' '}
                They have to give it to you. If you only got a summary, call the billing department and ask for the itemized version.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>You can dispute any charge.</strong>{' '}
                You have the legal right to challenge any charge you think is wrong. The{' '}
                <a href="https://www.cms.gov/nosurprises" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>No Surprises Act</a>{' '}
                also protects you from unexpected out-of-network bills for emergency services.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>While your dispute is open, they cannot send your account to collections.</strong>
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>Medical debt under $500 no longer shows up on your credit report.</strong>{' '}
                Paid medical debt is removed from credit reports entirely.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
              Common questions
            </h2>
            <div className="space-y-4">
              {(jsonLd['@graph'][2] as { mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }> }).mainEntity.map((qa) => (
                <details key={qa.name} className="card rounded-xl overflow-hidden group">
                  <summary className="px-5 py-4 cursor-pointer font-medium text-sm select-none" style={{ color: 'var(--text-primary)' }}>
                    {qa.name}
                  </summary>
                  <div className="px-5 pb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {qa.acceptedAnswer.text}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Related content */}
        <section className="py-14 px-4" style={{ background: 'var(--cream)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
              More on medical bills and healthcare costs
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  title: 'How to Read and Audit an Itemized Hospital Bill',
                  href: '/en/blog/how-to-audit-itemized-hospital-bill',
                  desc: 'What each line item means and which charges are most commonly wrong.',
                },
                {
                  title: 'How to Negotiate a Hospital Bill',
                  href: '/en/blog/how-to-negotiate-hospital-bills',
                  desc: 'Scripts and tactics for getting a bill reduced after you\'ve received it.',
                },
                {
                  title: 'Hospital Charity Care: 501(r) Forgiveness Programs',
                  href: '/en/blog/hospital-charity-care-501r-forgiveness',
                  desc: 'How to find and apply for hospital financial assistance before you pay anything.',
                },
                {
                  title: 'What Happens to Medical Debt on Your Credit Report',
                  href: '/en/blog/how-medical-debt-affects-credit-score-2026',
                  desc: 'New rules changed what hospitals can report. Know your rights.',
                },
                {
                  title: 'Can\'t Pay Your Medical Bill? Your Options',
                  href: '/en/blog/medical-bill-cant-pay-options',
                  desc: 'Payment plans, hardship programs, debt settlement, and when to contact a patient advocate.',
                },
                {
                  title: 'Check What Health Coverage You Qualify For',
                  href: '/en/screener',
                  desc: 'Find out if you\'re eligible for Medicaid, ACA plans, or other free coverage.',
                },
              ].map(({ title, href, desc }) => (
                <a
                  key={href}
                  href={href}
                  className="block p-5 bg-white rounded-xl border border-[var(--border-light)] hover:border-[var(--primary)] transition-colors no-underline"
                >
                  <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-14 px-4" style={{ background: 'linear-gradient(135deg, var(--primary-deeper) 0%, var(--primary-dark) 100%)' }}>
          <div className="max-w-xl mx-auto text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Don't pay that bill until you've checked it.</h2>
            <p className="opacity-80 mb-6 text-sm">
              Free. No signup. Your bill is never stored.
            </p>
            <a
              href="#analyzer"
              className="inline-block px-8 py-3.5 rounded-lg font-semibold text-sm"
              style={{ background: 'white', color: 'var(--primary-deeper)' }}
            >
              See What I Actually Owe
            </a>
            <div className="mt-8 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
              <p className="opacity-70 text-sm mb-3">Also check what health coverage you qualify for:</p>
              <a
                href="/en/screener"
                className="inline-block px-6 py-2 rounded-lg text-sm font-medium border"
                style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}
              >
                Free Benefits Screener
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
