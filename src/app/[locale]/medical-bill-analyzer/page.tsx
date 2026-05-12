import type { Metadata } from 'next'
import BillAnalyzer from '@/components/BillAnalyzer'

export const metadata: Metadata = {
  title: 'Free Medical Bill Analyzer — Check for Overcharges & Errors | CoveredUSA',
  description:
    'Upload your hospital bill and instantly see how your charges compare to Medicare rates. Find billing errors, check charity care eligibility, and get a dispute letter. Free, no signup, zero data retention.',
  openGraph: {
    title: 'Free Medical Bill Analyzer | CoveredUSA',
    description:
      'Upload your hospital bill and instantly see how your charges compare to Medicare rates. Find billing errors and get a dispute letter.',
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
      name: 'How to Analyze Your Medical Bill',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload Your Bill',
          text: 'Upload a photo or PDF of your hospital or medical bill. The tool accepts any format.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Get Your Analysis',
          text: 'The tool extracts every line item and compares each charge to the Medicare national rate benchmark.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Take Action',
          text: 'Review flagged errors, check charity care eligibility, and download a dispute letter to send to your hospital.',
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
            text: 'No. Your bill is analyzed in memory and deleted immediately. CoveredUSA never stores, shares, or sells any bill data. The only data retained is anonymous aggregate statistics like average savings found.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does the tool compare my bill against?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The tool compares each charge against the Medicare national payment rate published by the Centers for Medicare and Medicaid Services (CMS). Medicare rates are a widely-used benchmark for what medical procedures reasonably cost. Hospitals can legally charge more than Medicare rates, but large discrepancies are often worth questioning.',
          },
        },
        {
          '@type': 'Question',
          name: 'What billing errors does the tool detect?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The tool looks for duplicate charges (same procedure billed twice), unbundled procedures (procedures that should be combined but are billed separately to inflate costs), and charges that are unusually high compared to Medicare benchmarks.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is 501(r) charity care?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Under federal law (Internal Revenue Code section 501(r)), nonprofit hospitals must have a Financial Assistance Policy and are prohibited from charging more than the lowest negotiated rate to patients who qualify. Income limits typically range from 200% to 400% of the Federal Poverty Level. If your hospital is a nonprofit and your income qualifies, you may be eligible for free or reduced-cost care regardless of insurance status.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I dispute a medical bill?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. You have the right to request an itemized bill and to dispute charges you believe are incorrect. The Hospital Price Transparency Rule (effective July 2024) requires hospitals to publish their standard charges. The No Surprises Act protects you from unexpected out-of-network charges. Our tool generates a dispute letter you can send to your hospital billing department.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is the dispute letter legally binding?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The dispute letter generated by this tool is for informational purposes only and does not constitute legal advice. It is a starting point for communicating with your hospital billing department. For large bills or complex disputes, consider consulting a medical billing advocate or healthcare attorney.',
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
      ],
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
        <section className="py-14 px-4" style={{ background: 'linear-gradient(135deg, var(--primary-deeper) 0%, var(--primary-dark) 100%)' }}>
          <div className="max-w-2xl mx-auto text-center text-white">
            <div className="inline-block text-sm font-medium rounded-full px-4 py-1 mb-4" style={{ background: 'rgba(255,255,255,0.15)' }}>
              Free Tool — No Signup Required
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Free Medical Bill Analyzer
            </h1>
            <p className="text-lg opacity-90 mb-2">
              Upload your hospital bill. See what Medicare actually pays for each charge. Get a dispute letter in minutes.
            </p>
            <p className="text-sm opacity-70">
              Your bill is never stored. Analyzed and deleted immediately.
            </p>
          </div>
        </section>

        {/* Tool */}
        <section id="analyzer" className="py-10 px-4">
          <BillAnalyzer />
        </section>

        {/* How it works */}
        <section className="py-14 px-4" style={{ background: 'var(--cream)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--text-primary)' }}>
              How the Medical Bill Analyzer Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  title: 'Upload Your Bill',
                  body: 'Take a photo or upload a PDF of your hospital bill. The tool reads every line item using AI — any format, any hospital.',
                },
                {
                  step: '2',
                  title: 'Compare to Medicare Rates',
                  body: 'Each charge is compared to the Medicare national payment rate from the CMS Physician Fee Schedule. Medicare rates are the federal government\'s benchmark for what procedures cost.',
                },
                {
                  step: '3',
                  title: 'Act on the Results',
                  body: 'Review flagged overcharges and billing errors. Check if you qualify for hospital charity care. Download a dispute letter to send to your hospital\'s billing department.',
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

        {/* What we check for */}
        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              What the Analyzer Checks For
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: 'Overcharges vs. Medicare Rates',
                  body: 'The Centers for Medicare and Medicaid Services (CMS) publishes the Medicare Physician Fee Schedule every year — a public database of what the federal government pays for every medical procedure. Hospitals can legally charge more than these rates, but comparisons reveal how far above the benchmark your bill sits. A charge that is 5-10x the Medicare rate is a reasonable starting point for a dispute.',
                },
                {
                  title: 'Duplicate Charges',
                  body: 'Duplicate billing — charging for the same procedure twice — is one of the most common billing errors. The analyzer detects when the same procedure or service appears more than once on your itemized bill. Duplicate charges are often caught by insurance companies but frequently slip through on self-pay or high-deductible plan bills.',
                },
                {
                  title: 'Unbundled Procedures',
                  body: 'Medical billing rules require certain procedures to be bundled together under a single charge. Billing them separately — known as unbundling — artificially increases the total. The National Correct Coding Initiative (NCCI) edits published by CMS define which procedures must be bundled. The analyzer flags code pairs that should be combined but are billed separately.',
                },
                {
                  title: 'Hospital Charity Care Eligibility',
                  body: 'Every nonprofit hospital in the United States is legally required to have a Financial Assistance Policy under Internal Revenue Code section 501(r). Nonprofit hospitals make up roughly 60% of all hospitals. Patients with incomes below 200-400% of the Federal Poverty Level often qualify for free or significantly reduced care. The analyzer identifies if your hospital is a nonprofit and checks your income against typical eligibility thresholds.',
                },
              ].map(({ title, body }) => (
                <div key={title} className="card rounded-xl p-5">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Your rights */}
        <section className="py-14 px-4" style={{ background: 'var(--cream)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Your Rights as a Medical Patient
            </h2>
            <div className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>Right to an itemized bill.</strong> Any patient has the right to request a fully itemized bill showing every individual charge. Hospitals are required to provide this. If you received a summary bill, request the itemized version before disputing any charges.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>Hospital Price Transparency Rule (effective July 2024).</strong> The Centers for Medicare and Medicaid Services now requires hospitals to publish their standard charges in a machine-readable format. This means the prices hospitals charge — including negotiated rates with insurers — are publicly available. Hospitals that do not comply face financial penalties.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>The No Surprises Act.</strong> The No Surprises Act protects patients from unexpected out-of-network bills in emergency situations and from out-of-network providers at in-network facilities. If you received a surprise bill, you may be able to dispute it through the federal independent dispute resolution process.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>501(r) Financial Assistance.</strong> Nonprofit hospitals — about 60% of all hospitals — must have a written Financial Assistance Policy (FAP) and must apply it before sending a bill to collections. Hospitals cannot charge more than the lowest negotiated rate to FAP-eligible patients. Patients have the right to apply for financial assistance at any point, even after receiving a bill.
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>Medical debt and credit reporting.</strong> As of 2023, medical debt under $500 is no longer reported to major credit bureaus. Paid medical debt is removed from credit reports. Medical debt in collections under $500 cannot appear on consumer credit reports under updated CFPB guidelines.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
              Frequently Asked Questions
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

        {/* Bottom CTA */}
        <section className="py-14 px-4" style={{ background: 'linear-gradient(135deg, var(--primary-deeper) 0%, var(--primary-dark) 100%)' }}>
          <div className="max-w-xl mx-auto text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Ready to check your bill?</h2>
            <p className="opacity-80 mb-6 text-sm">
              Free, no signup, no data stored. Results in under 30 seconds.
            </p>
            <a
              href="#analyzer"
              className="inline-block px-8 py-3 rounded-xl font-semibold text-sm"
              style={{ background: 'white', color: 'var(--primary-deeper)' }}
            >
              Analyze My Bill — Free
            </a>
            <div className="mt-8 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
              <p className="opacity-70 text-sm mb-3">Also check what health coverage you qualify for:</p>
              <a
                href="/en/screener"
                className="inline-block px-6 py-2 rounded-xl text-sm font-medium border"
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
