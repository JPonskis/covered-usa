// Day 3 follow-up cron endpoint
// Sends one final email to users who completed the screener 3 days ago
// but haven't submitted their phone (not converted).
//
// Expected to be called daily by a cron job.
// Secured by CRON_SECRET header.

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';
import { buildDay3Html, buildDay3Subject } from '@/emails/FollowupDay3Email';
import { buildUnsubscribeUrl } from '@/app/api/unsubscribe/route';

const resend = new Resend(process.env.RESEND_API_KEY);

const HEALTHSHERPA_BASE = 'https://www.healthsherpa.com/?_agent_id=dan-hardle&utm_source=coveredusa&utm_medium=email&utm_campaign=followup';

interface Submission {
  id: string;
  email: string;
  first_name: string | null;
  eligible_programs: string[] | null;
  language: string | null;
}

// Rough estimated values per program for email copy (not shown if 0)
const PROGRAM_VALUES: Record<string, { name: string; value: number }> = {
  aca: { name: 'ACA Marketplace Insurance', value: 4800 },
  medicaid: { name: 'Medicaid', value: 6000 },
  medicare: { name: 'Medicare', value: 8000 },
  'medicare-savings': { name: 'Medicare Savings Program', value: 1800 },
  chip: { name: 'CHIP', value: 3600 },
  'va-healthcare': { name: 'VA Healthcare', value: 5000 },
};

export async function GET(req: NextRequest) {
  // Auth
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();

  // Find submissions that:
  // - Have email
  // - Welcome email was sent
  // - Day 3 not yet sent
  // - Not unsubscribed
  // - No phone captured (didn't convert)
  // - Created 3-4 days ago (daily window)
  const { data: submissions, error } = await supabaseAdmin
    .from('covered_usa_submissions')
    .select('id, email, first_name, eligible_programs, language')
    .not('email', 'is', null)
    .eq('email_welcome_sent', true)
    .eq('email_day3_sent', false)
    .eq('unsubscribed', false)
    .is('phone', null)
    .gte('created_at', fourDaysAgo)
    .lte('created_at', threeDaysAgo);

  if (error) {
    console.error('Day3 cron DB query error:', error);
    return NextResponse.json({ error: 'DB query failed' }, { status: 500 });
  }

  if (!submissions || submissions.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No submissions due for Day 3 email' });
  }

  let sent = 0;
  let failed = 0;

  for (const sub of submissions as Submission[]) {
    try {
      await sendDay3Email(sub);
      sent++;
    } catch (err) {
      console.error(`Day3 email failed for ${sub.id}:`, err);
      failed++;
    }
  }

  console.log(`Day3 cron complete: ${sent} sent, ${failed} failed`);
  return NextResponse.json({ sent, failed, total: submissions.length });
}

async function sendDay3Email(sub: Submission) {
  const programs = sub.eligible_programs || [];
  if (programs.length === 0) return;

  const primaryProgramId = programs[0];
  const programData = PROGRAM_VALUES[primaryProgramId] || { name: primaryProgramId, value: 0 };
  const locale = sub.language || 'en';
  const resultsUrl = `https://coveredusa.org/${locale}/results/${sub.id}`;
  const healthsherpaUrl = primaryProgramId === 'aca'
    ? `${HEALTHSHERPA_BASE}&utm_content=${sub.id}`
    : undefined;

  const subject = buildDay3Subject(sub.first_name || undefined);
  const html = buildDay3Html({
    firstName: sub.first_name || undefined,
    submissionId: sub.id,
    primaryProgramName: programData.name,
    primaryProgramId,
    estimatedValue: programData.value,
    resultsUrl,
    healthsherpaUrl,
  });

  const unsubscribeUrl = buildUnsubscribeUrl(sub.id);
  const { error } = await resend.emails.send({
    from: 'Jacob from CoveredUSA <jacob@coveredusa.org>',
    replyTo: 'jacob@coveredusa.org',
    to: [sub.email],
    subject,
    html,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  await supabaseAdmin
    .from('covered_usa_submissions')
    .update({ email_day3_sent: true })
    .eq('id', sub.id);
}
