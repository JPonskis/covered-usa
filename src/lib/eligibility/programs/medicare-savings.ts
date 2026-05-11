/**
 * Medicare Savings Programs (MSP)
 *
 * Helps pay Medicare premiums, deductibles, and coinsurance
 * Three tiers based on income:
 * - QMB (Qualified Medicare Beneficiary): <100% FPL
 * - SLMB (Specified Low-Income Medicare Beneficiary): 100-120% FPL
 * - QI (Qualifying Individual): 120-135% FPL
 */

import { ScreenerInput, ProgramResult } from '../types';
import { getFPLPercentage } from '../fpl';
import { getStateData } from '../../states';

const PART_B_PREMIUM_MONTHLY = 202.90;

const PROGRAM_VALUES = {
  qmb: 5000,
  slmb: 2435,
  qi: 2435
};

export function checkMedicareSavings(input: ScreenerInput): ProgramResult {
  const { annualIncome, householdSize, age, insuranceSource, state = 'TX' } = input;

  const stateData = getStateData(state);
  const mainPortal = stateData?.state?.mainPortal || 'https://www.benefits.gov';
  const phone = stateData?.state?.generalPhone || '211';

  const result: ProgramResult = {
    id: 'medicare-savings',
    name: 'Medicare Savings Program',
    eligible: false,
    eligibilityStatus: 'not_eligible',
    estimatedValue: 0,
    reason: '',
    nextSteps: `Apply at ${mainPortal} or call ${phone}`
  };

  const onMedicare = insuranceSource === 'medicare';
  if (age < 65 && !onMedicare) {
    result.reason = 'Must be 65+ or currently enrolled in Medicare';
    return result;
  }

  const fplPercent = getFPLPercentage(annualIncome, householdSize);

  if (fplPercent < 100) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = PROGRAM_VALUES.qmb;
    result.name = 'Medicare Savings Program (QMB)';
    result.reason = `Income at ${fplPercent}% FPL qualifies for QMB - covers Part A & B premiums, deductibles, and coinsurance`;
    return result;
  }

  if (fplPercent >= 100 && fplPercent <= 120) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = PROGRAM_VALUES.slmb;
    result.name = 'Medicare Savings Program (SLMB)';
    result.reason = `Income at ${fplPercent}% FPL qualifies for SLMB - covers Part B premium (~$${Math.round(PART_B_PREMIUM_MONTHLY)}/month)`;
    return result;
  }

  if (fplPercent > 120 && fplPercent <= 135) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = PROGRAM_VALUES.qi;
    result.name = 'Medicare Savings Program (QI)';
    result.reason = `Income at ${fplPercent}% FPL qualifies for QI - covers Part B premium (~$${Math.round(PART_B_PREMIUM_MONTHLY)}/month)`;
    return result;
  }

  if (fplPercent > 135 && fplPercent <= 150) {
    result.eligible = 'maybe';
    result.eligibilityStatus = 'may_qualify';
    result.reason = 'Income slightly above limit but deductions may lower countable income. Worth applying.';
    result.estimatedValue = Math.round(PROGRAM_VALUES.qi * 0.5);
    return result;
  }

  result.reason = `Income at ${fplPercent}% FPL exceeds 135% FPL limit for Medicare Savings Programs`;
  return result;
}

export default checkMedicareSavings;
