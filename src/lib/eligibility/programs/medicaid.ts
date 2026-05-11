/**
 * Medicaid Eligibility Checker (All States)
 *
 * Expansion states (38 + DC): Adults 19-64 qualify at 138% FPL
 * Non-expansion states (12): Very limited adult coverage
 * Children: Generally up to 200-300% FPL
 * Pregnant women: Generally up to 185-200% FPL
 */

import { ScreenerInput, ProgramResult } from '../types';
import { getFPL, getFPLPercentage } from '../fpl';
import { getStateData, getStateName } from '../../states';

export function checkMedicaid(input: ScreenerInput): ProgramResult {
  const { annualIncome, householdSize, age, isPregnant, numChildren, state = 'TX' } = input;

  const stateData = getStateData(state);
  const stateName = getStateName(state);
  const isExpansionState = stateData?.state?.medicaidExpansion ?? true;

  const programName = stateData?.medicaid?.localName || `${stateName} Medicaid`;
  const applicationUrl = stateData?.medicaid?.applicationUrl || 'https://www.healthcare.gov/medicaid-chip/';
  const phone = stateData?.medicaid?.phone || '211';

  const adultLimitFpl = stateData?.medicaid?.adultLimitFpl ?? (isExpansionState ? 138 : 0);
  const childLimitFpl = stateData?.medicaid?.childLimitFpl ?? 200;
  const pregnantLimitFpl = stateData?.medicaid?.pregnantLimitFpl ?? 185;

  const fplAdultLimit = getFPL(householdSize, adultLimitFpl, state);
  const fplChildLimit = getFPL(householdSize, childLimitFpl, state);
  const fplPregnantLimit = getFPL(householdSize, pregnantLimitFpl, state);
  const fplPercent = getFPLPercentage(annualIncome, householdSize, state);

  const result: ProgramResult = {
    id: 'medicaid',
    name: programName,
    eligible: false,
    eligibilityStatus: 'not_eligible',
    estimatedValue: 0,
    reason: '',
    nextSteps: `Apply at ${applicationUrl} or call ${phone}`
  };

  if (age >= 65) {
    result.reason = 'Age 65+ - you qualify for Medicare instead';
    result.nextSteps = 'Enroll in Medicare at medicare.gov or call 1-800-MEDICARE';
    return result;
  }

  if (isPregnant && annualIncome <= fplPregnantLimit) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = 10000;
    result.reason = `Pregnant women in ${stateName} qualify for ${programName} up to ${pregnantLimitFpl}% FPL`;
    return result;
  }

  // Check for children under 19
  const hasChildUnder19 = numChildren > 0;
  if (hasChildUnder19 && annualIncome <= fplChildLimit) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = 5000 * numChildren;
    result.reason = `Children under 19 qualify for ${programName}/CHIP up to ${childLimitFpl}% FPL`;

    if (isExpansionState && annualIncome <= fplAdultLimit) {
      result.estimatedValue = 10000 + (5000 * Math.max(0, numChildren - 1));
      result.reason = `Your household qualifies for ${programName} coverage`;
    }
    return result;
  }

  if (age >= 19 && age < 65) {
    if (!isExpansionState) {
      if (numChildren > 0 && adultLimitFpl > 0 && annualIncome <= fplAdultLimit) {
        result.eligible = 'maybe';
        result.eligibilityStatus = 'may_qualify';
        result.estimatedValue = 8000;
        result.reason = `${stateName} has limited Medicaid for parents. Income at ${fplPercent}% FPL may qualify.`;
        return result;
      }

      if (numChildren === 0 && !isPregnant && !input.hasDisability) {
        result.eligible = false;
        result.eligibilityStatus = 'not_eligible';
        result.reason = `${stateName} has not expanded Medicaid. Adults without children, pregnancy, or disability generally don't qualify.`;
        result.nextSteps = `Check ACA marketplace options at ${stateData?.state?.mainPortal || 'healthcare.gov'}`;
        return result;
      }
    }

    if (annualIncome <= fplAdultLimit) {
      result.eligible = true;
      result.eligibilityStatus = 'likely_eligible';
      result.estimatedValue = 10000;
      result.reason = `Income at ${fplPercent}% FPL qualifies for ${programName} (limit: ${adultLimitFpl}% FPL)`;
      return result;
    }
  }

  if (annualIncome > fplAdultLimit && adultLimitFpl > 0) {
    result.reason = `Income at ${fplPercent}% FPL exceeds the ${adultLimitFpl}% FPL limit for ${programName}`;
    result.nextSteps = 'Check ACA marketplace subsidies at healthcare.gov';
  } else {
    result.reason = `Does not meet ${programName} eligibility requirements`;
  }

  return result;
}

export default checkMedicaid;
