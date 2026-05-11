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
      <div className="border-l-2 pl-4 mb-8" style={{ borderColor: 'var(--primary)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          CoveredUSA Editorial Team
        </p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Reviewed against official government sources including medicaid.gov, medicare.gov, and
          healthcare.gov.
        </p>
      </div>
    </>
  );
}
