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

    // TODO: POST to broker CRM endpoint when ready
    // await fetch(process.env.BROKER_WEBHOOK_URL!, { method: 'POST', body: JSON.stringify({...}) });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Lead error:', e);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
