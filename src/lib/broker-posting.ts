// Broker lead posting to Agent Boost Marketing (Help Plan Advocates)
// TLD CRM endpoint, form-encoded POST, vendor_id + post_key in URL.
// Activated when BROKER_POST_URL env var is set.

export interface BrokerLeadData {
  // Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zip: string;
  state?: string;
  age?: number;

  // Routing
  language?: 'en' | 'es' | string;
  ipAddress?: string;

  // Source attribution
  submissionId: string;
  leadType: 'health' | 'medicare' | string;
  source: 'benefitsusa' | 'coveredusa' | 'get-covered' | string;

  // The free-text screener Q&A summary that Aaron's agents will read
  notes?: string;
}

export interface ScreenerRow {
  state?: string | null;
  zip_code?: string | null;
  age?: number | null;
  household_size?: number | null;
  income?: number | null;
  employment_status?: string | null;
  insurance_status?: string | null;
  is_pregnant?: boolean | null;
  has_disability?: boolean | null;
  is_veteran?: boolean | null;
  locale?: string | null;
  results?: {
    programs?: Array<{
      id?: string;
      name?: string;
      eligible?: boolean;
      estimatedValue?: number;
    }>;
  } | null;
}

export function buildScreenerNote(opts: {
  source: string;
  leadType: string;
  language: 'en' | 'es' | string;
  submissionId: string;
  screener?: ScreenerRow | null;
}): string {
  const { source, leadType, language, submissionId, screener } = opts;
  const lines: string[] = [];

  lines.push(`=== ${source.toUpperCase()} SCREENER ANSWERS ===`);
  lines.push(`Source: ${source}`);
  lines.push(`Lead type: ${leadType}`);
  lines.push(`Submission ID: ${submissionId}`);

  if (language === 'es') {
    lines.push('LANG: ES — SPANISH SPEAKING agent requested');
  } else {
    lines.push('LANG: EN');
  }

  if (screener) {
    lines.push('');
    lines.push('-- DEMOGRAPHICS --');
    if (screener.state) lines.push(`State: ${screener.state}`);
    if (screener.zip_code) lines.push(`ZIP: ${screener.zip_code}`);
    if (screener.age != null) lines.push(`Age: ${screener.age}`);
    if (screener.household_size != null) lines.push(`Household size: ${screener.household_size}`);
    if (screener.income != null) lines.push(`Annual income: $${Number(screener.income).toLocaleString()}`);

    const flags: string[] = [];
    if (screener.is_pregnant) flags.push('pregnant');
    if (screener.has_disability) flags.push('has disability');
    if (screener.is_veteran) flags.push('veteran');
    if (flags.length) lines.push(`Flags: ${flags.join(', ')}`);

    if (screener.employment_status) lines.push(`Employment: ${screener.employment_status}`);

    if (screener.insurance_status) {
      lines.push('');
      lines.push('-- INSURANCE --');
      lines.push(`Currently: ${screener.insurance_status}`);
    }

    const eligible = (screener.results?.programs || []).filter((p) => p.eligible === true);
    if (eligible.length) {
      lines.push('');
      lines.push('-- ELIGIBLE PROGRAMS (per screener) --');
      for (const p of eligible) {
        const name = p.name || p.id || 'program';
        const value = p.estimatedValue ? ` (~$${Number(p.estimatedValue).toLocaleString()}/yr)` : '';
        lines.push(`- ${name}${value}`);
      }
    }
  }

  lines.push('');
  lines.push(`Submitted: ${new Date().toISOString()}`);

  return lines.join('\n');
}

export async function postToBrokerDialer(data: BrokerLeadData): Promise<{ success: boolean; error?: string }> {
  const brokerUrl = process.env.BROKER_POST_URL;
  if (!brokerUrl) {
    return { success: true };
  }

  const form = new URLSearchParams();
  form.set('first_name', data.firstName);
  form.set('last_name', data.lastName);
  if (data.email) form.set('email', data.email);
  if (data.phone) form.set('phone', data.phone);
  if (data.zip) form.set('zipcode', data.zip);
  if (data.state) form.set('state', data.state);
  if (data.age != null) form.set('age', String(data.age));
  if (data.ipAddress) form.set('ip_address', data.ipAddress);

  // Tracking — vendor_id + post_key are in the URL; tracking_id segments by source/site
  form.set('tracking_id', `${data.source}:${data.leadType}`);
  form.set('reference_id', data.submissionId);

  if (data.notes) {
    form.set('note1_note', data.notes);
  }

  try {
    const response = await fetch(brokerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });

    const text = await response.text().catch(() => '');
    if (!response.ok) {
      console.error(`Broker posting failed (${response.status}): ${text}`);
      return { success: false, error: `HTTP ${response.status}: ${text}` };
    }
    // TLD CRM returns a numeric response code as plain text; log it for the trail.
    console.log(`Broker post ${data.source}/${data.leadType} ref=${data.submissionId} → TLD response: ${text.trim()}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('Broker posting error:', message);
    return { success: false, error: message };
  }
}
