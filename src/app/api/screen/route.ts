import { NextRequest, NextResponse } from 'next/server';
import { checkEligibility } from '@/lib/eligibility';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getStateFromZip } from '@/lib/states/zipToState';
import { Resend } from 'resend';
import { buildWelcomeHtml, buildWelcomeSubject } from '@/emails/WelcomeEmail';
import { buildUnsubscribeUrl } from '@/app/api/unsubscribe/route';
import type { ProgramResult } from '@/lib/eligibility';

const resend = new Resend(process.env.RESEND_API_KEY);

const HEALTHSHERPA_BASE = 'https://www.healthsherpa.com/?_agent_id=dan-hardle&utm_source=benefitsusa&utm_medium=email&utm_campaign=benefitsusa';

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
      utmSource,
      utmMedium,
      utmCampaign,
      referrerUrl,
      focus,
      medicareStatus,
      medicareNeeds,
    } = body;

    const isMedicareFocus = focus === 'medicare';

    const state = getStateFromZip(String(zipCode)) || 'TX';

    const parsedAge = parseInt(String(age), 10);
    // Medicare flow doesn't collect household/income/flags — provide defaults
    const parsedHouseholdSize = isMedicareFocus ? 1 : parseInt(String(householdSize), 10);
    const parsedNumChildren = isMedicareFocus ? 0 : parseInt(String(numChildren || 0), 10);
    const parsedIncome = isMedicareFocus ? 0 : Number(String(annualIncome || '0').replace(/,/g, ''));

    // For Medicare flow: derive currentlyInsured + insuranceSource from medicareStatus
    const medicareEnrolled = ['partAB', 'advantage', 'supplement'].includes(String(medicareStatus));
    const effectiveCurrentlyInsured = isMedicareFocus ? medicareEnrolled : Boolean(currentlyInsured);
    // Encode focus + Medicare details into insurance_source so /api/lead can detect downstream
    // (avoids needing a new schema column). Format: "medicare:<status>:<needs>"
    const effectiveInsuranceSource = isMedicareFocus
      ? `medicare:${medicareStatus || 'unsure'}:${medicareNeeds || 'other'}`
      : (insuranceSource || null);

    const input = {
      state,
      age: parsedAge,
      householdSize: parsedHouseholdSize,
      annualIncome: parsedIncome,
      employmentStatus: 'employed' as const,
      isPregnant: isMedicareFocus ? false : Boolean(isPregnant),
      hasDisability: isMedicareFocus ? false : Boolean(hasDisability),
      currentlyInsured: effectiveCurrentlyInsured,
      insuranceSource: isMedicareFocus ? 'medicare' : (insuranceSource || undefined),
      isVeteran: isMedicareFocus ? false : Boolean(isVeteran),
      numChildren: parsedNumChildren,
      language: language || 'en',
    };

    const results = checkEligibility(input);

    // For Medicare flow, force 'medicare' into eligible_programs even if age 60-64
    // (so downstream /api/lead recognizes this as a Medicare lead and Aaron's team
    // gets a Medicare-tagged lead regardless of strict eligibility cutoff).
    const eligibleProgramIds = results.programs
      .filter((p: { eligible: boolean | string }) => p.eligible === true || p.eligible === 'maybe')
      .map((p: { id: string }) => p.id);
    if (isMedicareFocus && !eligibleProgramIds.includes('medicare')) {
      eligibleProgramIds.unshift('medicare');
    }

    const { data, error } = await supabaseAdmin
      .from('covered_usa_submissions')
      .insert({
        state,
        zip_code: String(zipCode),
        age: parsedAge,
        household_size: parsedHouseholdSize,
        annual_income: parsedIncome,
        employment_status: 'employed',
        is_pregnant: isMedicareFocus ? false : Boolean(isPregnant),
        has_disability: isMedicareFocus ? false : Boolean(hasDisability),
        currently_insured: effectiveCurrentlyInsured,
        insurance_source: effectiveInsuranceSource,
        is_veteran: isMedicareFocus ? false : Boolean(isVeteran),
        num_children: parsedNumChildren,
        first_name: firstName || null,
        email: email || null,
        eligible_programs: eligibleProgramIds,
        language: language || 'en',
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        referral_url: referrerUrl || null,
      })
      .select('id')
      .single();

    if (error) console.error('DB error:', error);

    // Fire welcome email — must await (Vercel kills fire-and-forget promises)
    if (email && data?.id) {
      try {
        await sendWelcomeEmail(data.id, email, firstName, results.programs, language || 'en');
      } catch (err) {
        console.error('Welcome email failed (non-blocking):', err);
      }
    }

    return NextResponse.json({
      submissionId: data?.id || null,
      results,
    });
  } catch (e) {
    console.error('Screen error:', e);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

async function sendWelcomeEmail(
  submissionId: string,
  email: string,
  firstName: string | undefined,
  programs: ProgramResult[],
  locale: string,
) {
  const eligiblePrograms = programs.filter(p => p.eligible === true || p.eligible === 'maybe');
  if (eligiblePrograms.length === 0) return;

  const primaryProgram = eligiblePrograms[0];
  const resultsUrl = `https://coveredusa.org/${locale}/results/${submissionId}`;
  const healthsherpaUrl = primaryProgram.id === 'aca'
    ? `${HEALTHSHERPA_BASE}&utm_content=${submissionId}`
    : undefined;

  const subject = buildWelcomeSubject(firstName);
  const html = buildWelcomeHtml({
    firstName,
    submissionId,
    primaryProgramName: primaryProgram.name,
    primaryProgramId: primaryProgram.id,
    estimatedValue: primaryProgram.estimatedValue,
    resultsUrl,
    healthsherpaUrl,
  });

  const unsubscribeUrl = buildUnsubscribeUrl(submissionId);
  const { error } = await resend.emails.send({
    from: 'Jacob from CoveredUSA <jacob@coveredusa.org>',
    replyTo: 'jacob@coveredusa.org',
    to: [email],
    subject,
    html,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });

  if (error) {
    console.error('Resend welcome email error:', error);
    return;
  }

  // Mark welcome sent
  await supabaseAdmin
    .from('covered_usa_submissions')
    .update({ email_welcome_sent: true })
    .eq('id', submissionId);

  console.log(`Welcome email sent to ${email} for submission ${submissionId}`);
}
