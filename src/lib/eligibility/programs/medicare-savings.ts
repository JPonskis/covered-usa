/**
 * Medicare Savings Programs (MSP)
 *
 * Helps pay Medicare premiums, deductibles, and coinsurance
 * Three tiers based on income:
 * - QMB (Qualified Medicare Beneficiary): <100% FPL
 * - SLMB (Specified Low-Income Medicare Beneficiary): 100-120% FPL
 * - QI (Qualifying Individual): 120-135% FPL
 */

import type { ScreenerInput, ProgramResult } from '../types';
import { getFPLPercentage } from '../fpl';
import { getStateData } from '../../states';
import { medicareFor } from '../constants';

/* The Part B premium and the MSP resource limits come from the dated Medicare table in
   ../constants.ts (medicareFor), read at the time of the question. They used to be two
   constants here (the year and the premium) that check:constants failed every build over
   from January 1 until somebody rolled them by hand (jan1-other, eligibility audit 2026-10). */

const PROGRAM_VALUES = {
  qmb: 5000,
  slmb: 2435,
  qi: 2435
};

/** `now` picks the Medicare row in force (constants.ts); the screener passes nothing. */
export function checkMedicareSavings(input: ScreenerInput, now: Date = new Date()): ProgramResult {
  const { annualIncome, householdSize, age, insuranceSource, state = 'TX' } = input;
  const m = medicareFor(now);
  const partB = Math.round(m.partBPremiumMonthly);
  // Resource limits, labelled with the year they belong to (a 2026 figure carried into 2027
  // while CMS has not published 2027's says "in 2026", never "in 2027").
  const resourceLine = `Most states also apply a resource limit (about $${m.mspResourceSingle.toLocaleString('en-US')} for an individual or $${m.mspResourceCouple.toLocaleString('en-US')} for a couple in ${m.figureYear.mspResourceSingle}); some states, like NY, have no asset test.`;

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

  const fplPercent = getFPLPercentage(annualIncome, householdSize, input.state);

  if (fplPercent < 100) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = PROGRAM_VALUES.qmb;
    result.name = 'Medicare Savings Program (QMB)';
    result.reason = `Income at ${fplPercent}% FPL qualifies for QMB - covers Part A & B premiums, deductibles, and coinsurance. ${resourceLine}`;
    return result;
  }

  if (fplPercent >= 100 && fplPercent <= 120) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = PROGRAM_VALUES.slmb;
    result.name = 'Medicare Savings Program (SLMB)';
    result.reason = `Income at ${fplPercent}% FPL qualifies for SLMB - covers Part B premium (~$${partB}/month). ${resourceLine}`;
    return result;
  }

  if (fplPercent > 120 && fplPercent <= 135) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = PROGRAM_VALUES.qi;
    result.name = 'Medicare Savings Program (QI)';
    result.reason = `Income at ${fplPercent}% FPL qualifies for QI - covers Part B premium (~$${partB}/month). ${resourceLine}`;
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
