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

  // Detect Medicare flow from the focus signal we encoded into insurance_source
  // when the screener was taken with ?focus=medicare ("medicare:<status>:<needs>").
  const rawInsuranceSource = String(submission.insurance_source || '');
  const isMedicareFlow = rawInsuranceSource.startsWith('medicare:');

  // CRITICAL: normalize insurance_source before passing to checkEligibility.
  // Otherwise the raw string "medicare:partAB:compareAdvantage" never matches the
  // ScreenerInput enum (insuranceSource === 'medicare'), and downstream eligibility
  // checks for ACA/Medicaid silently misfire — Medicare-flow users could land on
  // a Medicaid-as-primary results page they never asked for.
  const normalizedInsuranceSource: 'employer' | 'aca' | 'medicaid' | 'medicare' | 'none' | undefined =
    isMedicareFlow
      ? 'medicare'
      : ((['employer', 'aca', 'medicaid', 'medicare', 'none'] as const).includes(rawInsuranceSource as 'employer' | 'aca' | 'medicaid' | 'medicare' | 'none')
          ? (rawInsuranceSource as 'employer' | 'aca' | 'medicaid' | 'medicare' | 'none')
          : undefined);

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
    insuranceSource: normalizedInsuranceSource,
    citizenshipStatus: submission.citizenship_status || undefined,
    isVeteran: submission.is_veteran,
    numChildren: submission.num_children,
    language: submission.language,
  });

  const results: ProgramResult[] = eligibilityResults.programs;

  // Split into confirmed eligible (likely_eligible) and maybe eligible (may_qualify).
  // Only likely_eligible programs can be the primary result — may_qualify programs
  // are shown as secondary so users aren't misled about what they actually qualify for.
  const eligible = results.filter(
    (r) => r.eligible === true || r.eligible === 'maybe'
  );
  const confirmed = results.filter((r) => r.eligibilityStatus === 'likely_eligible');

  let primaryProgram: ProgramResult | null = null;
  // Priority from confirmed-eligible pool only: Medicare > ACA > Medicaid > first confirmed
  const medicare = confirmed.find((r) => r.id === 'medicare');
  const aca = confirmed.find((r) => r.id === 'aca');
  const medicaid = confirmed.find((r) => r.id === 'medicaid');

  if (isMedicareFlow) {
    // Medicare-flow user always sees Medicare as primary, regardless of strict
    // eligibility outcome (a 63-year-old "approaching" or even a 60-62 user still
    // gets Medicare framing because that's what they clicked the ad for).
    primaryProgram = medicare || results.find((r) => r.id === 'medicare') || null;
  } else if (medicare) primaryProgram = medicare;
  else if (aca) primaryProgram = aca;
  else if (medicaid) primaryProgram = medicaid;
  else primaryProgram = confirmed[0] || eligible[0] || null;

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
      isMedicareFlow={isMedicareFlow}
    />
  );
}
