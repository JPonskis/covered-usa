import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { postToBrokerDialer, buildScreenerNote, type ScreenerRow } from '@/lib/broker-posting';

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
    const { submissionId, phone, tcpaConsent, tcpaTimestamp } = body;

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId required' }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    if (!tcpaConsent) {
      return NextResponse.json({ error: 'TCPA consent is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('covered_usa_submissions')
      .update({
        phone,
        tcpa_consent: true,
        tcpa_timestamp: tcpaTimestamp || new Date().toISOString(),
        wants_help: true,
        lead_captured_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (error) {
      console.error('Lead capture DB error:', error);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }

    // Pull full submission row to pack screener answers + contact info into broker post
    try {
      const { data: sub } = await supabaseAdmin
        .from('covered_usa_submissions')
        .select(
          'first_name, email, state, zip_code, age, household_size, annual_income, employment_status, is_pregnant, has_disability, is_veteran, currently_insured, insurance_source, language, eligible_programs'
        )
        .eq('id', submissionId)
        .single();

      const language = (sub?.language === 'es' ? 'es' : 'en') as 'en' | 'es';

      // Determine lead type from eligible programs (ACA → health, Medicare → medicare)
      const programs: string[] = (sub?.eligible_programs as string[]) || [];
      const leadType = programs.includes('medicare') ? 'medicare' : 'health';

      const screenerForNote: ScreenerRow = {
        state: sub?.state ?? null,
        zip_code: sub?.zip_code ?? null,
        age: sub?.age ?? null,
        household_size: sub?.household_size ?? null,
        income: sub?.annual_income ?? null,
        employment_status: sub?.employment_status ?? null,
        insurance_status: sub?.currently_insured ? `insured (${sub?.insurance_source || 'source unknown'})` : 'uninsured',
        is_pregnant: sub?.is_pregnant ?? null,
        has_disability: sub?.has_disability ?? null,
        is_veteran: sub?.is_veteran ?? null,
        locale: language,
        results: { programs: programs.map((id: string) => ({ id, eligible: true })) },
      };

      const notes = buildScreenerNote({
        source: 'coveredusa',
        leadType,
        language,
        submissionId,
        screener: screenerForNote,
      });

      await postToBrokerDialer({
        firstName: sub?.first_name || '',
        lastName: '',
        email: sub?.email || '',
        phone,
        zip: sub?.zip_code || '',
        state: sub?.state || undefined,
        age: sub?.age ?? undefined,
        language,
        ipAddress: ip,
        submissionId,
        leadType,
        source: 'coveredusa',
        notes,
      });
    } catch (brokerErr) {
      // Don't fail the request if broker posting fails — lead is already saved
      console.error('Broker posting failed:', brokerErr);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Lead error:', e);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
