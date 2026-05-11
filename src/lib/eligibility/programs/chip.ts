/**
 * CHIP - Children's Health Insurance Program
 *
 * Eligibility:
 * - Children under 19
 * - Household income 200-300% FPL (varies by state; most use 200-250%)
 * - Not already enrolled in Medicaid
 * - Most states: citizenship/immigration requirements apply
 *
 * Value: ~$3,000-7,000/year per child (premiums + coverage)
 */

import { ScreenerInput, ProgramResult } from '../types';
import { getFPL, getFPLPercentage } from '../fpl';
import { getStateData, getStateName } from '../../states';

export function checkCHIP(input: ScreenerInput): ProgramResult {
  const { annualIncome, householdSize, numChildren, state = 'TX', insuranceSource } = input;

  const stateData = getStateData(state);
  const stateName = getStateName(state);

  // Use state Medicaid child limit as CHIP upper bound, or default 250% FPL
  const chipUpperFpl = stateData?.medicaid?.childLimitFpl ?? 250;
  // CHIP typically covers the gap above Medicaid (138% FPL) up to the state limit
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
