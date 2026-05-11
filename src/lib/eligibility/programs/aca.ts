/**
 * ACA Health Insurance Subsidies (Premium Tax Credits)
 *
 * Eligibility (2026 - IRA enhanced credits expired Dec 31, 2025):
 * - Income: 100% - 400% FPL (subsidy cliff returned in 2026)
 * - Not eligible for Medicare
 * - Not eligible for Medicaid (income > 138% FPL in expansion states)
 * - Not offered affordable employer coverage (affordability = 9.02% of income)
 */

import { ScreenerInput, ProgramResult } from '../types';
import { getFPL, getFPLPercentage } from '../fpl';
import { getStateData, getStateName } from '../../states';

export function checkACA(input: ScreenerInput): ProgramResult {
  const { annualIncome, householdSize, age, currentlyInsured, insuranceSource, state = 'TX' } = input;

  const stateData = getStateData(state);
  const stateName = getStateName(state);
  const medicaidName = stateData?.medicaid?.localName || `${stateName} Medicaid`;
  const medicaidUrl = stateData?.medicaid?.applicationUrl || 'https://www.healthcare.gov/medicaid-chip/';

  const fpl100 = getFPL(householdSize, 100);
  const fpl138 = getFPL(householdSize, 138);
  const fpl400 = getFPL(householdSize, 400);
  const fplPercent = getFPLPercentage(annualIncome, householdSize);

  const result: ProgramResult = {
    id: 'aca',
    name: 'ACA Health Insurance Subsidy',
    eligible: false,
    eligibilityStatus: 'not_eligible',
    estimatedValue: 0,
    reason: '',
    nextSteps: 'Visit HealthCare.gov during Open Enrollment (Nov 1 - Jan 15) or if you have a qualifying life event.'
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
    } else {
      result.eligible = 'maybe';
      result.eligibilityStatus = 'may_qualify';
      result.reason = `Income below 100% FPL in a non-expansion state. ${stateName} has not expanded Medicaid, so ACA marketplace options may be available.`;
      result.estimatedValue = estimateACAValue(100, householdSize);
      result.nextSteps = 'Visit HealthCare.gov to explore options, or check if you qualify for other programs.';
      return result;
    }
  }

  if (currentlyInsured && insuranceSource === 'employer') {
    result.eligible = 'maybe';
    result.eligibilityStatus = 'may_qualify';
    result.reason = 'You may qualify if your employer plan is unaffordable (costs > 9.02% of income)';
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
