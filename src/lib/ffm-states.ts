// States where Agent Boost Marketing (Help Plan Advocates) accepts ACA leads.
// Per Aaron Allan email 2026-05-20. Medicare leads are accepted in all 50 states
// (verified via Agent Boost's "licensed in all 50 states" marketing).
//
// ACA lead capture / "Get Expert Help" CTA only shows for these states.
// Medicare lead capture has no state restriction.

export const FFM_STATES = new Set([
  'AL', 'AR', 'AZ', 'FL', 'GA', 'IA', 'IN', 'KS',
  'MI', 'MO', 'MS', 'NC', 'NE', 'OH', 'OK', 'SC',
  'TN', 'TX',
]);

export function isFFMState(stateCode: string): boolean {
  return FFM_STATES.has(stateCode.toUpperCase());
}

// Semantic alias — call this when gating ACA lead capture
export const isBrokerAcaState = isFFMState;
