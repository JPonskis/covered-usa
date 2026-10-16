import { NextRequest, NextResponse } from 'next/server';
import { checkEligibility } from '@/lib/eligibility';
import { getStateFromZip } from '@/lib/states/zipToState';
import { isBrokerAcaState } from '@/lib/ffm-states';
import { getFPLPercentage } from '@/lib/eligibility/fpl';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { quickCheckInput } from '@/lib/eligibility/quick-check';

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
    const { zipCode, householdSize, annualIncome, numChildren } = body;

    if (!zipCode || String(zipCode).length !== 5) {
      return NextResponse.json({ error: 'Valid ZIP code required' }, { status: 400 });
    }

    const state = getStateFromZip(String(zipCode));
    if (!state) {
      return NextResponse.json({ error: 'Could not determine state from ZIP' }, { status: 400 });
    }

    // Defaults for what the form does not ask (age 35: this is the working-age landing). Children
    // are the person's own answer, never householdSize - 1 (audit A20, quick-check.ts).
    const input = quickCheckInput(state, { householdSize, annualIncome, numChildren });
    const fplPct = getFPLPercentage(input.annualIncome, input.householdSize, state);
    const results = checkEligibility(input);

    // Find the top eligible program
    const eligible = results.programs.filter(
      (p: { eligible: boolean | string }) => p.eligible === true || p.eligible === 'maybe'
    );

    const primary = eligible[0] || null;

    const payload = {
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
            caveats: primary.caveats,
          }
        : null,
      secondary: eligible.slice(1).map((p: { id: string; name: string; estimatedValue: number }) => ({
        id: p.id,
        name: p.name,
        estimatedValue: p.estimatedValue,
      })),
    };

    // Test mode (`"test": true`, same contract as /api/screen): the same answer, but nothing is
    // logged, so a live check is not counted as a visitor in covered_usa_screener_starts (audit A20).
    if (body.test === true) {
      return NextResponse.json({ test: true, ...payload });
    }

    // Log anonymous screener start — no PII, just funnel visibility
    const utmSource = req.headers.get('x-utm-source') || body.utm_source || null;
    const utmCampaign = req.headers.get('x-utm-campaign') || body.utm_campaign || null;
    const locale = body.locale || null;
    // Awaited: Vercel can freeze the function the instant it responds, so a
    // floating promise here would sometimes never land.
    const { error: startError } = await supabaseAdmin
      .from('covered_usa_screener_starts')
      .insert({
        state,
        zip_code: String(zipCode),
        utm_source: utmSource,
        utm_campaign: utmCampaign,
        language: locale,
        has_eligible_program: eligible.length > 0,
        primary_program: primary?.id || null,
      });
    if (startError && startError.code !== '42P01') {
      console.error('[quick-check] SCREENER START LOG FAILED:', startError.message, startError);
    }

    return NextResponse.json(payload);
  } catch (e) {
    console.error('Quick-check error:', e);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
