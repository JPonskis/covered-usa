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
}

export interface ScreenerResults {
  programs: ProgramResult[];
  totalPotentialValue: number;
}

// Helper type for program check functions
export type ProgramCheckFunction = (input: ScreenerInput) => ProgramResult;
