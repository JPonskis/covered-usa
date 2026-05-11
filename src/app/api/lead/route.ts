import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, firstName, phone, email, language, wantsHelp } = body;

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('covered_usa_submissions')
      .update({
        first_name: firstName || null,
        phone: phone || null,
        email: email || null,
        language_preference: language || 'en',
        wants_help: wantsHelp ?? true,
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
