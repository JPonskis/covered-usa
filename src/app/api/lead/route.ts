import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { postToBrokerDialer, buildScreenerNote, type ScreenerRow } from '@/lib/broker-posting';
import { isBrokerAcaState } from '@/lib/ffm-states';

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
          'first_name, email, state, zip_code, age, household_size, annual_income, employment_status, is_pregnant, has_disability, is_veteran, currently_insured, insurance_source, language, eligible_programs, utm_source, utm_campaign'
        )
        .eq('id', submissionId)
        .single();

      const language = (sub?.language === 'es' ? 'es' : 'en') as 'en' | 'es';

      // Detect Medicare flow via the "medicare:<status>:<needs>" prefix we wrote
      // to insurance_source from /api/screen when focus=medicare came in.
      const isource = String(sub?.insurance_source || '');
      const isMedicareFlow = isource.startsWith('medicare:');
      let medicareStatus: string | null = null;
      let medicareNeeds: string | null = null;
      if (isMedicareFlow) {
        const parts = isource.split(':');
        medicareStatus = parts[1] || null;
        medicareNeeds = parts[2] || null;
      }

      // Lead type: Medicare flow → 'medicare' always. ACA flow → infer from eligible_programs.
      const programs: string[] = (sub?.eligible_programs as string[]) || [];
      const leadType = isMedicareFlow
        ? 'medicare'
        : (programs.includes('medicare') ? 'medicare' : 'health');

      // Map Medicare enum codes to human-readable labels for Aaron's agents.
      // These match the screener labels the user saw, so the agent can reference them in conversation.
      const MEDICARE_STATUS_LABELS: Record<string, string> = {
        none: 'Not enrolled in Medicare yet',
        partAB: 'Original Medicare (Part A and/or B)',
        advantage: 'Medicare Advantage (Part C)',
        supplement: 'Original Medicare + Medicare Supplement (Medigap)',
        unsure: 'Not sure',
      };
      const MEDICARE_NEEDS_LABELS: Record<string, string> = {
        newToMedicare: 'New to Medicare (or turning 65 soon)',
        compareAdvantage: 'Comparing Medicare Advantage plans',
        compareSupplement: 'Comparing Medicare Supplement (Medigap) plans',
        partD: 'Help with prescription drug (Part D) coverage',
        lostCoverage: 'Lost or losing current coverage',
        other: 'Other / not sure',
      };

      const screenerForNote: ScreenerRow = {
        state: sub?.state ?? null,
        zip_code: sub?.zip_code ?? null,
        age: sub?.age ?? null,
        // Medicare flow: hide noisy ACA-flow fields that don't apply
        household_size: isMedicareFlow ? null : (sub?.household_size ?? null),
        income: isMedicareFlow ? null : (sub?.annual_income ?? null),
        employment_status: isMedicareFlow ? null : (sub?.employment_status ?? null),
        insurance_status: isMedicareFlow
          ? null
          : (sub?.currently_insured ? `insured (${sub?.insurance_source || 'source unknown'})` : 'uninsured'),
        is_pregnant: isMedicareFlow ? null : (sub?.is_pregnant ?? null),
        has_disability: isMedicareFlow ? null : (sub?.has_disability ?? null),
        is_veteran: isMedicareFlow ? null : (sub?.is_veteran ?? null),
        locale: language,
        results: { programs: programs.map((id: string) => ({ id, eligible: true })) },
        medicareDetails: isMedicareFlow
          ? {
              statusLabel: MEDICARE_STATUS_LABELS[medicareStatus || ''] || (medicareStatus || 'unknown'),
              needsLabel: MEDICARE_NEEDS_LABELS[medicareNeeds || ''] || (medicareNeeds || 'unspecified'),
            }
          : null,
      };

      const notes = buildScreenerNote({
        source: 'benefitsusa',
        leadType,
        language,
        submissionId,
        screener: screenerForNote,
      });

      // Per-leadType gating: Aaron's current agreement is ACA-only.
      // Medicare leads stay inert until BROKER_MEDICARE_ENABLED=true on Vercel,
      // which we flip ONLY after the Medicare (Dan) agreement is signed.
      // ACA leads always post when BROKER_POST_URL is set.
      const medicareEnabled = process.env.BROKER_MEDICARE_ENABLED === 'true';
      if (leadType === 'medicare' && !medicareEnabled) {
        console.log(
          `Medicare lead ${submissionId} saved to Supabase but broker post SKIPPED ` +
          `(BROKER_MEDICARE_ENABLED not set — Medicare agreement pending)`
        );
        // Bail out before posting. The lead is still in covered_usa_submissions
        // so when the Medicare agreement is signed we can backfill / re-post if needed.
        return NextResponse.json({ success: true });
      }

      // ACA leads only post for the 18 FFM states Aaron serves.
      // Medicare posting is gated by BROKER_MEDICARE_ENABLED separately.
      if (leadType === 'health' && !isBrokerAcaState(sub?.state || '')) {
        console.log(`ACA lead ${submissionId} from non-FFM state (${sub?.state}) — broker post skipped`);
        return NextResponse.json({ success: true });
      }

      // Append ad campaign tag if present, so Aaron's TLD CRM tracking_id
      // breaks out per-ad performance (e.g. benefitsusa:facebook:spanish-aca-v1:medicare).
      // The :leadType suffix is appended by broker-posting.ts automatically.
      const adCampaign = sub?.utm_campaign || null;
      const sourceWithCampaign = adCampaign
        ? `benefitsusa:${sub?.utm_source || 'ad'}:${adCampaign}`
        : 'benefitsusa';

      const nameParts = (sub?.first_name || '').split(/\s+/);
      const brokerFirstName = nameParts[0] || '';
      const brokerLastName = nameParts.slice(1).join(' ') || '';

      await postToBrokerDialer({
        firstName: brokerFirstName,
        lastName: brokerLastName,
        email: sub?.email || '',
        phone,
        zip: sub?.zip_code || '',
        state: sub?.state || undefined,
        age: sub?.age ?? undefined,
        language,
        ipAddress: ip,
        submissionId,
        leadType,
        source: sourceWithCampaign,
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
