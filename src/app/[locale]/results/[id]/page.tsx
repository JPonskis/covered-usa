import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkEligibility } from '@/lib/eligibility';
import type { ScreenerInput, ProgramResult } from '@/lib/eligibility';
import ResultsClient from './ResultsClient';

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
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--cream)', flexDirection: 'column', gap: '1rem', padding: '2rem',
      }}>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>Results not found</h1>
        <p style={{ color: 'var(--text-muted)' }}>This link may have expired. Please take the screener again.</p>
        <a
          href={`/${locale}/screener`}
          style={{
            padding: '0.875rem 2rem', background: 'var(--primary)', color: 'white',
            borderRadius: '12px', fontWeight: 700, textDecoration: 'none',
          }}
        >
          Retake Screener
        </a>
      </div>
    );
  }

  // Re-run eligibility check from stored data
  const input: ScreenerInput = {
    state: submission.state,
    age: submission.age,
    householdSize: submission.household_size,
    annualIncome: submission.annual_income,
    employmentStatus: submission.employment_status,
    isPregnant: submission.is_pregnant,
    hasDisability: submission.has_disability,
    currentlyInsured: submission.currently_insured,
    insuranceSource: submission.insurance_source,
    citizenshipStatus: submission.citizenship_status,
    isVeteran: submission.is_veteran,
    numChildren: submission.num_children,
    language: submission.language,
  };

  const results = checkEligibility(input);

  return (
    <ResultsClient
      results={results}
      submissionId={id}
      locale={locale}
    />
  );
}
