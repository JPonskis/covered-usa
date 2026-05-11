import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, clinicId, clinicName, action, zipCode } = body;

    // Fire and forget — don't crash if insert fails
    supabaseAdmin
      .from('covered_usa_clinic_referrals')
      .insert({
        submission_id: submissionId || null,
        clinic_id: clinicId,
        clinic_name: clinicName,
        action,
        zip_code: zipCode || null,
        clicked_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.error('Clinic click tracking error:', error);
      });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Clinic click error:', e);
    return NextResponse.json({ success: true }); // Always return 200
  }
}
