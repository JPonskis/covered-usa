/**
 * CHIP - Children's Health Insurance Program
 *
 * Eligibility:
 * - Children under 19
 * - Household income up to the state's combined Medicaid/CHIP children's limit
 *   (states/data childLimitFpl, 190% in Idaho to 405% in New York)
 * - Not already enrolled in Medicaid
 * - Most states: citizenship/immigration requirements apply
 *
 * Value: ~$3,000-7,000/year per child (premiums + coverage)
 */

import type { ScreenerInput, ProgramResult } from '../types';
import { getFPL, getFPLPercentage } from '../fpl';
import { getStateData, getStateName } from '../../states';
import { medicaidImmigrationCaveats, withCaveats } from '../caveats';

export function checkCHIP(input: ScreenerInput): ProgramResult {
  const result = chipResult(input);
  /* P.L. 119-21 section 71109(b) applies the Oct 1, 2026 immigrant limit to CHIP too. Same
     caveat as Medicaid (caveats.ts), and the results page prints it once when both show. */
  if (result.eligible !== false) withCaveats(result, medicaidImmigrationCaveats(input));
  return result;
}

function chipResult(input: ScreenerInput): ProgramResult {
  const { annualIncome, householdSize, numChildren, state = 'TX', insuranceSource } = input;

  const stateData = getStateData(state);
  const stateName = getStateName(state);

  /* childLimitFpl is the TOP of children's coverage, Medicaid and CHIP combined, with the 5-point
     MAGI disregard included (states/types.ts; audit A5A6A7, the same rows BenefitsUSA uses), so it
     is the CHIP ceiling. The state rows hold no separate children's-Medicaid line, which is why
     both reads below are the same field and the "CHIP zone above Medicaid" branch is reached only
     for a state with no data (250 vs 200). The 2026-10 audit found 8 rows wrong at the state's own
     source: 6 too low, several of them the Medicaid-only line (Alabama 141 for ALL Kids' 317,
     Connecticut 196 for HUSKY B's 323, Massachusetts 150 for 305), and 2 too high (Delaware 266
     for 217, Oklahoma 300 for 211). All now hold each state's own combined figure. */
  const chipUpperFpl = stateData?.medicaid?.childLimitFpl ?? 250;
  const medicaidChildFpl = stateData?.medicaid?.childLimitFpl ?? 200;
  // ACA referral URL
  const applicationUrl = stateData?.medicaid?.applicationUrl || 'https://www.healthcare.gov/medicaid-chip/childrens-health-insurance-program/';
  const phone = stateData?.medicaid?.phone || '1-877-543-7669';

  const result: ProgramResult = {
    id: 'chip',
    name: `CHIP (Children's Health Insurance)`,
    eligible: false,
    eligibilityStatus: 'not_eligible',
    estimatedValue: 0,
    reason: '',
    nextSteps: `Apply at ${applicationUrl} or call ${phone}`
  };

  // Must have children under 19
  if (numChildren === 0) {
    result.reason = 'CHIP covers children under 19. No children reported in household.';
    return result;
  }

  // Already on Medicaid — CHIP not needed
  if (insuranceSource === 'medicaid') {
    result.reason = 'Children already enrolled in Medicaid, which provides similar coverage';
    return result;
  }

  const fplChipLimit = getFPL(householdSize, chipUpperFpl, state);
  const fplMedicaidLimit = getFPL(householdSize, medicaidChildFpl, state);
  const fplPercent = getFPLPercentage(annualIncome, householdSize, state);

  // If income is within CHIP range (above Medicaid threshold, below CHIP cap)
  if (annualIncome <= fplChipLimit) {
    // If income is also below Medicaid limit, note that Medicaid may cover them too
    if (annualIncome <= fplMedicaidLimit) {
      result.eligible = true;
      result.eligibilityStatus = 'likely_eligible';
      result.estimatedValue = 5000 * numChildren;
      result.reason = `Children in your household likely qualify for ${stateName} Medicaid/CHIP at ${fplPercent}% FPL`;
      result.nextSteps = `Apply at ${applicationUrl} — children may qualify for Medicaid or CHIP depending on exact income`;
      return result;
    }

    // In the CHIP zone above Medicaid
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = 3500 * numChildren;
    result.reason = `Income at ${fplPercent}% FPL qualifies children for CHIP (limit: ${chipUpperFpl}% FPL in ${stateName})`;
    return result;
  }

  // Slightly above limit — may qualify with deductions
  if (fplPercent <= chipUpperFpl + 20) {
    result.eligible = 'maybe';
    result.eligibilityStatus = 'may_qualify';
    result.estimatedValue = Math.round(3500 * numChildren * 0.5);
    result.reason = `Income at ${fplPercent}% FPL is slightly above the CHIP limit. Some states allow deductions that may bring you within range.`;
    result.nextSteps = `Contact ${stateName} CHIP program to check — call ${phone}`;
    return result;
  }

  result.reason = `Income at ${fplPercent}% FPL exceeds the ${chipUpperFpl}% FPL CHIP limit in ${stateName}`;
  result.nextSteps = 'Check ACA marketplace plans for children at healthcare.gov';
  return result;
}

export default checkCHIP;
