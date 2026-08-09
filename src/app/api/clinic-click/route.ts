import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, clinicId, clinicName, action, zipCode } = body;

    // Must be awaited: a serverless function can be frozen the moment it
    // responds, so a floating promise here silently never lands.
    // No clicked_at — the table stamps created_at itself.
    const { error } = await supabaseAdmin
      .from('covered_usa_clinic_referrals')
      .insert({
        submission_id: submissionId || null,
        clinic_id: clinicId,
        clinic_name: clinicName,
        action,
        zip_code: zipCode || null,
      });

    if (error) {
      console.error('[clinic-click] INSERT FAILED:', error.message, error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[clinic-click] error:', e);
    return NextResponse.json({ success: false, error: 'exception' }, { status: 500 });
  }
}
