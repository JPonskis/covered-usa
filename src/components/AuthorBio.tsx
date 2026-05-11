const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CoveredUSA Editorial Team',
  url: 'https://coveredusa.org',
  description:
    'Our team researches federal and state healthcare programs to help Americans understand their coverage options. Information is reviewed against official government sources including medicaid.gov, medicare.gov, and healthcare.gov.',
  sameAs: [
    'https://www.medicaid.gov',
    'https://www.medicare.gov',
    'https://www.healthcare.gov',
  ],
};

export default function AuthorBio() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <div
        className="flex items-start gap-4 rounded-xl px-5 py-4 mb-8"
        style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}
      >
        {/* Avatar placeholder */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: '#1d4ed8' }}
          aria-hidden="true"
        >
          C
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>
              CoveredUSA Editorial Team
            </span>
            {/* Reviewed badge */}
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: '#dcfce7', color: '#166534' }}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Reviewed for accuracy
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
            Our team researches federal and state healthcare programs to help Americans understand
            their coverage options. Information is reviewed against official government sources
            including medicaid.gov, medicare.gov, and healthcare.gov.
          </p>
        </div>
      </div>
    </>
  );
}
