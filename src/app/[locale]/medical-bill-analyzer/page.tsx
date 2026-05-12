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
    title: 'Were you overcharged? Check your hospital bill for free.',
    description:
      'Upload your hospital bill. We compare every charge to what the government actually pays. Find errors, get a dispute letter.',
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
      name: 'How to Check Your Hospital Bill for Errors',
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
          name: 'We find what is wrong',
          text: 'Each charge is compared to federal payment rates. Billing errors like duplicate charges and unbundled procedures are flagged.',
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
            text: 'According to the Medicare Physician Fee Schedule published by the Centers for Medicare and Medicaid Services (CMS), a Level 4 emergency room visit has a federal reimbursement rate of approximately $200–$500. Hospitals routinely bill $2,000–$5,000 or more for the same visit. The gap between what hospitals charge uninsured patients and what Medicare pays is typically 5 to 10 times the federal rate.',
          },
        },
        {
          '@type': 'Question',
          name: 'What happens if I cannot pay my hospital bill?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'If you cannot pay your hospital bill, you have several options. First, request the itemized bill and check for errors — billing mistakes are common and reduce the amount owed. Second, apply for the hospital\'s financial assistance program. Under Section 501(r) of the Affordable Care Act, nonprofit hospitals are legally required to offer free or reduced-cost care to qualifying patients. Third, negotiate directly with the billing department; hospitals regularly settle bills for less than the billed amount. Since 2023, medical debt under $500 is no longer reported to credit bureaus, and paid medical debt is removed from credit reports entirely.',
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
        {/* Hero: lead with the problem */}
        <section className="py-16 md:py-20 px-4" style={{ background: 'linear-gradient(135deg, var(--primary-deeper) 0%, var(--primary-dark) 100%)' }}>
          <div className="max-w-2xl mx-auto text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
              Your hospital bill probably has errors.
            </h1>
            <p className="text-lg opacity-90 mb-6 leading-relaxed">
              80% of medical bills contain mistakes. Hospitals set their own prices with no standard, and most people just pay because they don't know what's fair. This tool checks your bill for free.
            </p>
            <a
              href="#analyzer"
              className="inline-block px-8 py-3.5 rounded-lg font-semibold text-base"
              style={{ background: 'white', color: 'var(--primary-deeper)' }}
            >
              Check My Bill
            </a>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm opacity-70">
              <span>Free</span>
              <span>No signup</span>
              <span>Results in 30 seconds</span>
            </div>
          </div>
        </section>

        {/* The problem: why this matters */}
        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Hospitals charge whatever they want. You can push back.
            </h2>
            <div className="space-y-5" style={{ color: 'var(--text-secondary)' }}>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>Hospital prices are not standardized.</strong> Every hospital sets its own rates using an internal price list called a "chargemaster." No patient ever sees it. These rates are often 3 to 10 times higher than what the federal government pays for the exact same procedures.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>There is a public benchmark for fair pricing.</strong> The federal government publishes what it actually pays hospitals through the{' '}
                <a href="https://www.cms.gov/medicare/physician-fee-schedule/search" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>Medicare Physician Fee Schedule</a>, maintained by the Centers for Medicare and Medicaid Services (CMS). These rates are updated every year. When your hospital charges you $4,200 for something the government pays $890 for, that gap is worth questioning.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>Billing errors are extremely common.</strong> Duplicate charges, procedures billed separately that should be combined, and codes that don't match the service you actually received. These mistakes add up, and they almost always add up in the hospital's favor.
              </p>
              <p>
                This tool reads your bill, compares every charge to what the government pays, flags errors, and writes you a dispute letter. It takes about 30 seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Visual example of results */}
        <section className="py-14 px-4" style={{ background: 'var(--cream)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Here's what you'll get
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              Upload a bill and the tool produces a full breakdown like the one below.
            </p>

            {/* Mock result card */}
            <div className="bg-white border border-[var(--border-light)] rounded-xl shadow-sm overflow-hidden">
              {/* Mock summary */}
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

              {/* Mock line items */}
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
          </div>
        </section>

        {/* How it works: reframed as outcomes */}
        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--text-primary)' }}>
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  title: 'Upload your bill',
                  body: 'Take a photo or upload a PDF. Any hospital, any format. The tool reads every line item on your bill automatically.',
                },
                {
                  step: '2',
                  title: 'We find what\'s wrong',
                  body: 'Every charge is compared to federal payment rates. Duplicate charges, unbundled procedures, and inflated prices are flagged.',
                },
                {
                  step: '3',
                  title: 'Get your dispute letter',
                  body: 'Download a formal letter that cites every overcharge and error. Send it to your hospital\'s billing department. You have the legal right to dispute.',
                },
              ].map(({ step, title, body }) => (
                <div key={step} className="card rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-4" style={{ background: 'var(--primary)' }}>
                    {step}
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Charity care section */}
        <section className="py-14 px-4" style={{ background: 'var(--cream)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              You might qualify for free care and not know it
            </h2>
            <div className="space-y-5" style={{ color: 'var(--text-secondary)' }}>
              <p>
                About 60% of hospitals in the U.S. are nonprofits. Under{' '}
                <a href="https://www.irs.gov/charities-non-profits/charitable-organizations/new-requirements-for-501c3-hospitals-under-the-affordable-care-act" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>Section 501(r) of the Affordable Care Act</a>, these hospitals are required to offer a Financial Assistance Policy to patients who qualify. That means free or reduced-cost care based on your income.
              </p>
              <p>
                The income limits vary by hospital, but many cover patients earning up to 300% or 400% of the federal poverty level. For a family of four, that's roughly $124,000 a year.
              </p>
              <p>
                Most people have never heard of this. Hospitals are required to have these programs, but they are not required to tell you about them before sending you a bill. The tool checks whether your hospital is a nonprofit and whether your income may qualify you for assistance.
              </p>
            </div>
          </div>
        </section>

        {/* The tool */}
        <section id="analyzer" className="py-14 px-4">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Check your bill now
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Free. No signup. Your bill is never stored.
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
            <div className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>You can request an itemized bill.</strong> Hospitals are required to provide a bill that shows every individual charge. If you only received a summary, call the billing department and ask for the itemized version. You need this before you can identify errors.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>Hospitals must publish their prices.</strong> The{' '}
                <a href="https://www.cms.gov/hospital-price-transparency" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>Hospital Price Transparency Rule</a>, enforced by CMS since July 2024, requires every hospital to publish their standard charges in a machine-readable format — including rates negotiated with insurance companies. Hospitals that fail to comply face civil monetary penalties up to $2 million per year.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>The No Surprises Act protects you from unexpected bills.</strong> If you went to an in-network hospital but were treated by an out-of-network provider, you are protected under the{' '}
                <a href="https://www.cms.gov/nosurprises" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>No Surprises Act</a>. Emergency services are covered regardless of network status. If you received a surprise bill, you can dispute it through a federal independent dispute resolution process.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>Medical debt rules have changed.</strong> Medical debt under $500 is no longer reported to credit bureaus. Paid medical debt is removed from credit reports entirely. If a hospital is threatening your credit over a bill you're disputing, know that the rules are more in your favor than they used to be.
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
                  desc: 'Scripts and tactics for getting a bill reduced — even after you\'ve received it.',
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
            <h2 className="text-2xl font-bold mb-3">Ready to check your bill?</h2>
            <p className="opacity-80 mb-6 text-sm">
              Free, no signup, no data stored. Results in under 30 seconds.
            </p>
            <a
              href="#analyzer"
              className="inline-block px-8 py-3.5 rounded-lg font-semibold text-sm"
              style={{ background: 'white', color: 'var(--primary-deeper)' }}
            >
              Check My Bill
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
