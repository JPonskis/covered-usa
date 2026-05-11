import { NextRequest, NextResponse } from 'next/server';
import { checkEligibility } from '@/lib/eligibility';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getStateFromZip } from '@/lib/states/zipToState';

// Simple in-memory rate limiter: 10 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const {
      zipCode,
      age,
      householdSize,
      numChildren,
      annualIncome,
      isPregnant,
      hasDisability,
      isVeteran,
      currentlyInsured,
      insuranceSource,
      firstName,
      email,
      language,
    } = body;

    // Derive state from zip
    const state = getStateFromZip(String(zipCode)) || 'TX';

    // Parse and clean numeric fields
    const parsedAge = parseInt(String(age), 10);
    const parsedHouseholdSize = parseInt(String(householdSize), 10);
    const parsedNumChildren = parseInt(String(numChildren || 0), 10);
    const parsedIncome = Number(String(annualIncome || '0').replace(/,/g, ''));

    const input = {
      state,
      age: parsedAge,
      householdSize: parsedHouseholdSize,
      annualIncome: parsedIncome,
      employmentStatus: 'employed' as const,
      isPregnant: Boolean(isPregnant),
      hasDisability: Boolean(hasDisability),
      currentlyInsured: Boolean(currentlyInsured),
      insuranceSource: insuranceSource || undefined,
      isVeteran: Boolean(isVeteran),
      numChildren: parsedNumChildren,
      language: language || 'en',
    };

    const results = checkEligibility(input);

    // Save to DB
    const { data, error } = await supabaseAdmin
      .from('covered_usa_submissions')
      .insert({
        state,
        zip_code: String(zipCode),
        age: parsedAge,
        household_size: parsedHouseholdSize,
        annual_income: parsedIncome,
        employment_status: 'employed',
        is_pregnant: Boolean(isPregnant),
        has_disability: Boolean(hasDisability),
        currently_insured: Boolean(currentlyInsured),
        insurance_source: insuranceSource || null,
        is_veteran: Boolean(isVeteran),
        num_children: parsedNumChildren,
        first_name: firstName || null,
        email: email || null,
        eligible_programs: results.programs
          .filter(p => p.eligible === true || p.eligible === 'maybe')
          .map(p => p.id),
        language: language || 'en',
      })
      .select('id')
      .single();

    if (error) console.error('DB error:', error);

    return NextResponse.json({
      submissionId: data?.id || null,
      results,
    });
  } catch (e) {
    console.error('Screen error:', e);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
