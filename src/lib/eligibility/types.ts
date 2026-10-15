/**
 * CoveredUSA - Eligibility Types
 * Healthcare-focused screener types
 */

export interface ScreenerInput {
  state: string;           // 2-letter state code
  age: number;
  householdSize: number;
  annualIncome: number;
  employmentStatus?: 'employed' | 'self-employed' | 'unemployed' | 'retired';
  isPregnant: boolean;
  /** How many children she is expected to deliver. Only read when `isPregnant`, and only by
   *  the Medicaid pregnancy test, which must count them in her family size per 42 CFR
   *  435.603(b). The screener has no twins question, so this is normally undefined and the
   *  engine assumes one. Present so a caller that DOES know is not forced to understate a
   *  twin pregnancy. */
  expectedChildren?: number;
  hasDisability: boolean;
  currentlyInsured: boolean;
  insuranceSource?: 'employer' | 'aca' | 'medicaid' | 'medicare' | 'none';
  citizenshipStatus?: 'all' | 'mixed' | 'none';
  isVeteran: boolean;
  numChildren: number;    // for CHIP
  language?: string;
}

export interface ProgramResult {
  id: string;
  name: string;
  eligible: boolean | 'maybe';
  eligibilityStatus: 'likely_eligible' | 'may_qualify' | 'not_eligible';
  estimatedValue: number;
  reason: string;
  nextSteps: string;
  /** Conditions the law attaches to this result that the screener cannot test, because it
   *  never asks (immigration status, work hours). They never change `eligible` or the value.
   *  The engine decides WHICH apply and from what date; the words live in caveats.ts in
   *  English and Spanish, since the results page renders in both and `reason` is English. */
  caveats?: ResultCaveat[];
}

/** See caveats.ts for the rule, the dates and the sources behind each one. */
export type ResultCaveat =
  | { id: 'medicaid_immigration' }
  | { id: 'ptc_immigration_2027' }
  | { id: 'medicaid_work'; state: string; renewEvery6Months: boolean };

export interface ScreenerResults {
  programs: ProgramResult[];
  totalPotentialValue: number;
}

// Helper type for program check functions
export type ProgramCheckFunction = (input: ScreenerInput) => ProgramResult;
