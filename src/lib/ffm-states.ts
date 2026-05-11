// Federally Facilitated Marketplace (FFM) states where Help Plan Advocates
// can handle ACA enrollment. ACA lead capture only shows for these states.
// Medicare leads are accepted in almost all states (no filtering needed).

export const FFM_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'DE', 'FL', 'GA', 'HI',
  'IL', 'IN', 'IA', 'KS', 'LA', 'MI', 'MS', 'MO',
  'MT', 'NE', 'NH', 'NC', 'ND', 'OH', 'OK', 'OR',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'WV', 'WI', 'WY',
]);

export function isFFMState(stateCode: string): boolean {
  return FFM_STATES.has(stateCode.toUpperCase());
}
