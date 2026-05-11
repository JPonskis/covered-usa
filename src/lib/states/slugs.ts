import { StateAbbreviation } from './types';

const STATE_SLUGS: Record<string, StateAbbreviation> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'district-of-columbia': 'DC', 'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI',
  'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME',
  'maryland': 'MD', 'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN',
  'mississippi': 'MS', 'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE',
  'nevada': 'NV', 'new-hampshire': 'NH', 'new-jersey': 'NJ', 'new-mexico': 'NM',
  'new-york': 'NY', 'north-carolina': 'NC', 'north-dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode-island': 'RI',
  'south-carolina': 'SC', 'south-dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX',
  'utah': 'UT', 'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA',
  'west-virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
};

const ABBREV_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_SLUGS).map(([slug, abbrev]) => [abbrev, slug])
);

export function getStateAbbreviation(slug: string): StateAbbreviation | null {
  return STATE_SLUGS[slug] || null;
}

export function getStateSlug(abbreviation: string): string | null {
  return ABBREV_TO_SLUG[abbreviation] || null;
}

export function getAllStateSlugs(): string[] {
  return Object.keys(STATE_SLUGS);
}

export { STATE_SLUGS };
