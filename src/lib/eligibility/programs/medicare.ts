/**
 * Medicare
 *
 * Federal health insurance program.
 *
 * Eligibility:
 * - Age 65 or older
 * - OR certain disabilities (after 24-month waiting period)
 * - OR End-Stage Renal Disease (ESRD)
 * - OR ALS (Lou Gehrig's disease)
 */

import { ScreenerInput, ProgramResult } from '../types';

export function checkMedicare(input: ScreenerInput): ProgramResult {
  const { age, hasDisability } = input;

  const result: ProgramResult = {
    id: 'medicare',
    name: 'Medicare',
    eligible: false,
    eligibilityStatus: 'not_eligible',
    estimatedValue: 0,
    reason: '',
    nextSteps: 'Enroll at medicare.gov or call 1-800-MEDICARE (1-800-633-4227)'
  };

  if (age >= 65) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = 0;
    result.reason = 'Age 65+ qualifies for Medicare';
    result.nextSteps = 'If not already enrolled, sign up at medicare.gov. Initial Enrollment Period is 3 months before to 3 months after your 65th birthday.';
    return result;
  }

  if (age >= 63) {
    result.eligible = 'maybe';
    result.eligibilityStatus = 'may_qualify';
    result.reason = `You're approaching Medicare eligibility at age 65 (in ${65 - age} year${65 - age !== 1 ? 's' : ''})`;
    result.nextSteps = 'Start planning for Medicare enrollment. Review options 3-6 months before turning 65.';
    return result;
  }

  if (hasDisability) {
    result.eligible = 'maybe';
    result.eligibilityStatus = 'may_qualify';
    result.reason = 'May qualify for Medicare with a qualifying disability (after 24-month SSDI waiting period)';
    result.nextSteps = 'If receiving Social Security Disability Insurance (SSDI), you\'ll be automatically enrolled in Medicare after 24 months';
    return result;
  }

  result.reason = 'Medicare is for those 65+ or with qualifying disabilities';
  result.nextSteps = 'Check ACA marketplace options for health insurance';
  return result;
}

export default checkMedicare;
