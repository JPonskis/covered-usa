/**
 * CoveredUSA - Eligibility Engine
 *
 * Runs all healthcare program eligibility checks and returns sorted results.
 */

import type { ScreenerInput, ScreenerResults, ProgramResult } from './types';
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

  /* ONE CHILD, ONE COUNT (audit cusa-total-double-count; the medicaid-gaps and A5A6A7-cusa
     left-overs). A child is covered by Medicaid OR CHIP, never both. The Medicaid card's children's
     answer ("Children under 19 qualify for X/CHIP up to N% FPL") and the CHIP card test the same
     line (states/data childLimitFpl is the TOP of Medicaid and CHIP combined; the rows hold no
     separate children's-Medicaid line) and both priced the same children at $5,000 each. So every
     family under the line was counted twice: a Texas family of 4 with two children on $40,000 got
     Medicaid $10,000 plus CHIP $10,000, and a grandparent raising a grandchild got the child twice
     once the child's answer moved onto the Medicaid card (medicaid-gaps).

     Which program covers a given child turns on the child's age and the state's own Medicaid line,
     and this screener asks neither, so the children are counted ONCE, on the card that names both
     programs. That is BenefitsUSA's answer: it has no CHIP card, and its Medicaid card carries the
     same "X/CHIP" children's value, so both sites price the same household's children the same.

     The CHIP card stays (many parents know the program by that name, and one application covers
     both) at $0, because it adds nothing the Medicaid card has not already counted. Not
     `excludedFromTotal` with the value kept: the results page prints every card's value, so the
     same children's dollars would sit on two cards side by side and read as two payments.

     When the Medicaid card does NOT carry the children (a pregnant mother: that card is HER
     coverage), the CHIP card is where they are counted, and it keeps its value. */
  const medicaid = programs.find(p => p.id === 'medicaid');
  const chip = programs.find(p => p.id === 'chip');
  if (medicaid?.includesChildren && chip && chip.eligible !== false) {
    chip.estimatedValue = 0;
    const stem = chip.reason.trim();
    chip.reason = `${stem}${stem.endsWith('.') ? '' : '.'} That coverage is already counted on the ${medicaid.name} card, so it is not added again here: a child gets Medicaid or CHIP, never both. Which one depends on the child's age and your exact income, and one application covers both.`;
  }

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
    .filter(p => (p.eligible === true || p.eligible === 'maybe') && !p.excludedFromTotal)
    .reduce((sum, p) => sum + p.estimatedValue, 0);

  return { programs, totalPotentialValue };
}

export default checkEligibility;
