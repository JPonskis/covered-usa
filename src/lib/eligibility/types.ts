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
