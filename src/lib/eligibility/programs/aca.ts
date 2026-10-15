/**
 * ACA Health Insurance Subsidies (Premium Tax Credits)
 *
 * Eligibility (2026 - IRA enhanced credits expired Dec 31, 2025):
 * - Income: 100% - 400% FPL (subsidy cliff returned in 2026)
 * - Not eligible for Medicare
 * - Not eligible for Medicaid (income > 138% FPL in expansion states)
 * - Not offered affordable employer coverage (affordability = 9.96% of income,
 *   2026 value per IRS Rev. Proc. 2025-25)
 *
 * NOTE: PTC boundary math (100%/400%) uses PRIOR-YEAR (2025) FPL guidelines
 * per 26 CFR 1.36B-1(h). The 138% Medicaid-referral check uses current-year
 * (2026) FPL because Medicaid eligibility uses current-year guidelines.
 */

import { ScreenerInput, ProgramResult } from '../types';
import { getFPL, getFPLPrior, getFPLPercentagePrior } from '../fpl';
import { getStateData, getStateName } from '../../states';

export function checkACA(input: ScreenerInput): ProgramResult {
  const { annualIncome, householdSize, age, currentlyInsured, insuranceSource, state = 'TX' } = input;

  const stateData = getStateData(state);
  const stateName = getStateName(state);
  const medicaidName = stateData?.medicaid?.localName || `${stateName} Medicaid`;
  const medicaidUrl = stateData?.medicaid?.applicationUrl || 'https://www.healthcare.gov/medicaid-chip/';

  // PTC boundaries use prior-year (2025) FPL per 26 CFR 1.36B-1(h)
  const fpl100 = getFPLPrior(householdSize, 100, state);
  const fpl400 = getFPLPrior(householdSize, 400, state);
  const fplPercent = getFPLPercentagePrior(annualIncome, householdSize, state);
  // Medicaid referral uses current-year (2026) FPL
  const fpl138 = getFPL(householdSize, 138, state);

  const result: ProgramResult = {
    id: 'aca',
    name: 'ACA Health Insurance Subsidy',
    eligible: false,
    eligibilityStatus: 'not_eligible',
    estimatedValue: 0,
    reason: '',
    nextSteps: 'Visit HealthCare.gov during Open Enrollment or if you have a qualifying life event. Open Enrollment starts November 1. End dates vary by state and may change this year, so check HealthCare.gov for your deadline.'
  };

  // Medicare-eligible people don't get ACA subsidies
  if (age >= 65) {
    result.reason = 'Age 65+, you should enroll in Medicare instead';
    result.nextSteps = 'Contact Medicare at 1-800-MEDICARE or visit medicare.gov';
    return result;
  }

  if (insuranceSource === 'medicare') {
    result.reason = 'Already enrolled in Medicare';
    result.nextSteps = 'ACA subsidies are not available to Medicare enrollees';
    return result;
  }

  const isExpansionState = stateData?.state?.medicaidExpansion ?? true;

  if (isExpansionState && annualIncome < fpl138) {
    result.reason = 'Income below 138% FPL - you likely qualify for Medicaid instead';
    result.nextSteps = `Apply for ${medicaidName} at ${medicaidUrl}`;
    return result;
  }

  if (annualIncome < fpl100) {
    if (isExpansionState) {
      result.reason = 'Income below 100% FPL - apply for Medicaid';
      result.nextSteps = `Apply for ${medicaidName} at ${medicaidUrl}`;
      return result;
    } else if (state === 'WI') {
      /* Wisconsin is the one non-expansion state that covers adults to 100% FPL,
         through BadgerCare Plus, so a person under 100% here is not in the gap.
         WI DHS income table, "effective February 1, 2026-January 31, 2027":
         adult limit (100% FPL) $1,330.00 for one person. */
      result.reason = 'Income below 100% FPL - BadgerCare Plus covers adults up to 100% FPL in Wisconsin';
      result.nextSteps = `Apply for ${medicaidName} at ${medicaidUrl}`;
      return result;
    } else {
      /* THE COVERAGE GAP. No premium tax credit exists below 100% FPL: 26 USC
         36B(c)(1)(A) defines an applicable taxpayer as household income that
         "equals or exceeds 100 percent but does not exceed 400 percent" of the
         poverty line, and HealthCare.gov tells people under 100% in a
         non-expansion state "you won't qualify for either health insurance
         savings program". The one exception, (c)(1)(B) for lawfully present
         immigrants, was struck by P.L. 119-21 section 71302(a) for taxable years
         beginning after December 31, 2025.
         This branch used to return 'maybe' with $10,000 for one adult or $20,000
         for two or more, money the law does not allow. */
      result.eligible = false;
      result.eligibilityStatus = 'not_eligible';
      result.estimatedValue = 0;
      result.reason = `Income below 100% FPL in ${stateName}, which has not expanded Medicaid. This is the coverage gap: too little income for a marketplace tax credit, too much for Medicaid.`;
      result.nextSteps = `You may still qualify for ${medicaidName} another way, for example as a parent, a pregnant woman, or a person with a disability: check at ${medicaidUrl}. A community health center will see you on a sliding scale based on your income: find one at findahealthcenter.hrsa.gov. Hospitals also run charity care programs.`;
      return result;
    }
  }

  if (currentlyInsured && insuranceSource === 'employer') {
    result.eligible = 'maybe';
    result.eligibilityStatus = 'may_qualify';
    result.reason = 'You may qualify if your employer plan is unaffordable (costs > 9.96% of income)';
    result.estimatedValue = estimateACAValue(fplPercent, householdSize);
    return result;
  }

  if (annualIncome >= fpl100 && annualIncome <= fpl400) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = estimateACAValue(fplPercent, householdSize);
    result.reason = `Income at ${fplPercent}% FPL qualifies for premium subsidies`;
    return result;
  }

  if (annualIncome > fpl400) {
    result.reason = `Income at ${fplPercent}% FPL exceeds the 400% FPL subsidy limit`;
    result.nextSteps = 'You can still purchase health insurance through HealthCare.gov but without premium subsidies.';
    return result;
  }

  result.reason = 'Does not meet ACA subsidy eligibility requirements';
  return result;
}

function estimateACAValue(fplPercent: number, householdSize: number): number {
  let baseValue: number;

  if (fplPercent <= 150) {
    baseValue = 10000;
  } else if (fplPercent <= 200) {
    baseValue = 6500;
  } else if (fplPercent <= 250) {
    baseValue = 4000;
  } else if (fplPercent <= 300) {
    baseValue = 3000;
  } else {
    baseValue = 1200;
  }

  const adults = Math.max(1, householdSize - Math.floor(householdSize * 0.3));
  return Math.round(baseValue * Math.min(adults, 2));
}

export default checkACA;
