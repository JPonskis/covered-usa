import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Simple in-memory rate limiter: 5 requests per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3_600_000 });
    return false;
  }
  if (entry.count >= 5) return true;
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
      phone,
      tcpaConsent,
      tcpaTimestamp,
      firstName,
      email,
      state,
      income,
      householdSize,
      insuranceStatus,
      eligiblePrograms,
    } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    if (!tcpaConsent) {
      return NextResponse.json({ error: 'TCPA consent is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    try {
      await supabaseAdmin.from('covered_usa_submissions').insert({
        state: state || 'TX',
        zip_code: '00000',
        age: 35,
        household_size: householdSize || 1,
        annual_income: income || 0,
        employment_status: 'employed',
        is_pregnant: false,
        has_disability: false,
        is_veteran: false,
        num_children: 0,
        currently_insured: insuranceStatus === 'yes',
        insurance_source: insuranceStatus === 'yes' ? 'employer' : null,
        first_name: firstName || null,
        email: email || null,
        eligible_programs: eligiblePrograms || [],
        language: 'en',
        phone,
        tcpa_consent: true,
        tcpa_timestamp: tcpaTimestamp || now,
        wants_help: true,
        lead_captured_at: now,
      });
    } catch (dbErr) {
      // Best-effort — don't block the user if the insert fails
      console.error('bill-analyzer-lead DB insert error:', dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('bill-analyzer-lead error:', e);
    return NextResponse.json({ success: true }); // still succeed for best-effort
  }
}
