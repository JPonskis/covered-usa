// This is a public tag ID, not a credential. It belongs only to CoveredUSA.
export const GA_MEASUREMENT_ID = 'G-SS1C1W1VB3';

export function analyticsPath(pathname: string): string {
  // Results URLs contain submission/bill IDs. Report only the screen name.
  return pathname.replace(/(\/results)(\/.*)?$/, '$1');
}

export function analyticsLocation(href: string): string {
  const url = new URL(href);
  // Never send query strings (which may contain contact data) or fragments.
  return `${url.origin}${analyticsPath(url.pathname)}`;
}

export function analyticsReferrer(referrer: string): string {
  if (!referrer) return '';
  try {
    const url = new URL(referrer);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    // External origins retain source attribution without search terms or IDs.
    return /^(www\.)?coveredusa\.org$/.test(url.hostname)
      ? analyticsLocation(referrer)
      : `${url.origin}/`;
  } catch {
    return '';
  }
}

export function analyticsCampaign(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const fields: Record<string, string> = {};
  for (const [utm, field] of [
    ['utm_source', 'campaign_source'],
    ['utm_medium', 'campaign_medium'],
    ['utm_campaign', 'campaign_name'],
  ]) {
    const value = params.get(utm);
    if (value && /^[a-zA-Z0-9][a-zA-Z0-9 _.-]{0,99}$/.test(value)) {
      fields[field] = value;
    }
  }
  return fields;
}
