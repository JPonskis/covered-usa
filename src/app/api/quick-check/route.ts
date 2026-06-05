import { NextRequest, NextResponse } from 'next/server';
import { checkEligibility } from '@/lib/eligibility';
import { getStateFromZip } from '@/lib/states/zipToState';
import { isBrokerAcaState } from '@/lib/ffm-states';
import { getFPLPercentage } from '@/lib/eligibility/fpl';
import { supabaseAdmin } from '@/lib/supabase-admin';

// In-memory rate limiter: 15 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 15) return true;
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
    const { zipCode, householdSize, annualIncome } = body;

    if (!zipCode || String(zipCode).length !== 5) {
      return NextResponse.json({ error: 'Valid ZIP code required' }, { status: 400 });
    }

    const state = getStateFromZip(String(zipCode));
    if (!state) {
      return NextResponse.json({ error: 'Could not determine state from ZIP' }, { status: 400 });
    }

    const parsedHousehold = Math.max(1, Math.min(10, parseInt(String(householdSize), 10) || 1));
    const parsedIncome = Math.max(0, Number(String(annualIncome || '0').replace(/[,$]/g, '')));

    const fplPct = getFPLPercentage(parsedIncome, parsedHousehold, state);

    // Run eligibility with sensible defaults for fields we didn't collect.
    // Age 35 = working-age adult (not Medicare eligible).
    // This gives us ACA + Medicaid results which is what matters for ad traffic.
    const results = checkEligibility({
      state,
      age: 35,
      householdSize: parsedHousehold,
      annualIncome: parsedIncome,
      employmentStatus: 'employed',
      isPregnant: false,
      hasDisability: false,
      currentlyInsured: false,
      isVeteran: false,
      numChildren: Math.max(0, parsedHousehold - 1), // assume rest of household are dependents
    });

    // Find the top eligible program
    const eligible = results.programs.filter(
      (p: { eligible: boolean | string }) => p.eligible === true || p.eligible === 'maybe'
    );

    const primary = eligible[0] || null;

    // Log anonymous screener start — no PII, just funnel visibility
    const utmSource = req.headers.get('x-utm-source') || body.utm_source || null;
    const utmCampaign = req.headers.get('x-utm-campaign') || body.utm_campaign || null;
    const locale = body.locale || null;
    supabaseAdmin.from('covered_usa_screener_starts').insert({
      state,
      zip_code: String(zipCode),
      utm_source: utmSource,
      utm_campaign: utmCampaign,
      language: locale,
      has_eligible_program: eligible.length > 0,
      primary_program: primary?.id || null,
    }).then(({ error }) => {
      if (error && error.code !== '42P01') console.error('Screener start log error:', error);
    });

    return NextResponse.json({
      state,
      fplPercentage: fplPct,
      isFFM: isBrokerAcaState(state),
      primary: primary
        ? {
            id: primary.id,
            name: primary.name,
            estimatedValue: primary.estimatedValue,
            eligible: primary.eligible,
            reason: primary.reason,
          }
        : null,
      secondary: eligible.slice(1).map((p: { id: string; name: string; estimatedValue: number }) => ({
        id: p.id,
        name: p.name,
        estimatedValue: p.estimatedValue,
      })),
    });
  } catch (e) {
    console.error('Quick-check error:', e);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
