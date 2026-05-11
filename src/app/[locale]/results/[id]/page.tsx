import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { ProgramResult } from '@/lib/eligibility';
import ResultsClient from '@/components/ResultsClient';

export const metadata: Metadata = {
  title: 'Your Health Insurance Results | CoveredUSA',
  description: 'See which health insurance programs you may qualify for.',
  robots: { index: false },
};

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ResultsPage({ params }: Props) {
  const { locale, id } = await params;

  // Fetch submission
  const { data: submission } = await supabaseAdmin
    .from('covered_usa_submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (!submission) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--cream)',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem',
        }}
      >
        <h1
          style={{
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            fontWeight: 700,
          }}
        >
          Results not found
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          This link may have expired. Please take the screener again.
        </p>
        <a
          href={`/${locale}/screener`}
          style={{
            padding: '0.875rem 2rem',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '12px',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Retake Screener
        </a>
      </div>
    );
  }

  // Results are stored in eligible_programs, but we need full ProgramResult objects.
  // Re-run eligibility check from stored submission data.
  const { checkEligibility } = await import('@/lib/eligibility');
  const eligibilityResults = checkEligibility({
    state: submission.state,
    age: submission.age,
    householdSize: submission.household_size,
    annualIncome: submission.annual_income,
    employmentStatus: submission.employment_status || 'employed',
    isPregnant: submission.is_pregnant,
    hasDisability: submission.has_disability,
    currentlyInsured: submission.currently_insured,
    insuranceSource: submission.insurance_source || undefined,
    citizenshipStatus: submission.citizenship_status || undefined,
    isVeteran: submission.is_veteran,
    numChildren: submission.num_children,
    language: submission.language,
  });

  const results: ProgramResult[] = eligibilityResults.programs;

  // Override priority: Medicare > ACA > Medicaid > everything else
  const eligible = results.filter(
    (r) => r.eligible === true || r.eligible === 'maybe'
  );

  let primaryProgram: ProgramResult | null = null;
  const medicare = eligible.find((r) => r.id === 'medicare');
  const aca = eligible.find((r) => r.id === 'aca');
  const medicaid = eligible.find((r) => r.id === 'medicaid');

  if (medicare) primaryProgram = medicare;
  else if (aca) primaryProgram = aca;
  else if (medicaid) primaryProgram = medicaid;
  else primaryProgram = eligible[0] || null;

  const secondaryPrograms = eligible.filter((r) => r !== primaryProgram);
  const notEligible = results.filter((r) => r.eligible === false);

  return (
    <ResultsClient
      submissionId={id}
      firstName={submission.first_name || ''}
      zipCode={submission.zip_code || ''}
      locale={locale}
      primaryProgram={primaryProgram}
      secondaryPrograms={secondaryPrograms}
      notEligible={notEligible}
    />
  );
}
