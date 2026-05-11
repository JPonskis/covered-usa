/**
 * VA Healthcare
 *
 * Eligibility: Must be a veteran (assumes honorable discharge)
 * Most veterans qualify for some level of VA healthcare.
 * Priority groups determine copays based on income and disability status.
 *
 * Value: ~$5,000-15,000/year depending on coverage level
 */

import { ScreenerInput, ProgramResult } from '../types';

export function checkVAHealthcare(input: ScreenerInput): ProgramResult {
  const { isVeteran, hasDisability } = input;

  const result: ProgramResult = {
    id: 'va-healthcare',
    name: 'VA Healthcare',
    eligible: false,
    eligibilityStatus: 'not_eligible',
    estimatedValue: 0,
    reason: '',
    nextSteps: 'Apply at VA.gov/health-care/apply or call 1-877-222-8387'
  };

  if (!isVeteran) {
    result.reason = 'Must be a veteran to qualify';
    return result;
  }

  result.eligible = true;
  result.eligibilityStatus = 'likely_eligible';
  result.estimatedValue = hasDisability ? 12000 : 8000;
  result.reason = 'Veterans are eligible for VA healthcare. Priority group depends on income and disability status.';
  return result;
}

export default checkVAHealthcare;
