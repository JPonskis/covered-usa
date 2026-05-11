import { NextRequest, NextResponse } from 'next/server';
import { checkEligibility } from '@/lib/eligibility';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const input = await req.json();
    const results = checkEligibility(input);

    // Save to DB
    const { data, error } = await supabaseAdmin
      .from('covered_usa_submissions')
      .insert({
        state: input.state,
        age: input.age,
        household_size: input.householdSize,
        annual_income: input.annualIncome,
        employment_status: input.employmentStatus,
        is_pregnant: input.isPregnant,
        has_disability: input.hasDisability,
        currently_insured: input.currentlyInsured,
        insurance_source: input.insuranceSource,
        citizenship_status: input.citizenshipStatus,
        is_veteran: input.isVeteran,
        num_children: input.numChildren,
        eligible_programs: results.programs
          .filter(p => p.eligible === true || p.eligible === 'maybe')
          .map(p => p.id),
        language: input.language || 'en',
      })
      .select('id')
      .single();

    if (error) console.error('DB error:', error);

    return NextResponse.json({
      results,
      submissionId: data?.id || null
    });
  } catch (e) {
    console.error('Screen error:', e);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
