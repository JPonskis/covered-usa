/**
 * CoveredUSA - Eligibility Engine
 *
 * Runs all healthcare program eligibility checks and returns sorted results.
 */

import { ScreenerInput, ScreenerResults, ProgramResult } from './types';
import { checkACA } from './programs/aca';
import { checkMedicaid } from './programs/medicaid';
import { checkMedicare } from './programs/medicare';
import { checkMedicareSavings } from './programs/medicare-savings';
import { checkVAHealthcare } from './programs/va-healthcare';
import { checkCHIP } from './programs/chip';

// Export types
export type { ScreenerInput, ScreenerResults, ProgramResult } from './types';
export { getFPL, getFPLPercentage, getSMI, FPL_THRESHOLDS } from './fpl';

const PROGRAM_CHECKS = [
  checkMedicaid,
  checkACA,
  checkMedicare,
  checkMedicareSavings,
  checkCHIP,
  checkVAHealthcare,
];

/**
 * Run all eligibility checks for the given screener input.
 * Returns results sorted: eligible first, maybe second, not eligible last.
 * Within each group, sorted by estimated value descending.
 */
export function checkEligibility(input: ScreenerInput): ScreenerResults {
  const programs: ProgramResult[] = PROGRAM_CHECKS.map(check => check(input));

  programs.sort((a, b) => {
    const order = (e: boolean | 'maybe'): number => {
      if (e === true) return 0;
      if (e === 'maybe') return 1;
      return 2;
    };

    const diff = order(a.eligible) - order(b.eligible);
    if (diff !== 0) return diff;
    return b.estimatedValue - a.estimatedValue;
  });

  const totalPotentialValue = programs
    .filter(p => p.eligible === true || p.eligible === 'maybe')
    .reduce((sum, p) => sum + p.estimatedValue, 0);

  return { programs, totalPotentialValue };
}

export default checkEligibility;
