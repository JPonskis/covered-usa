/**
 * Federal Poverty Level (FPL) and State Median Income (SMI) Utilities
 *
 * 2026 Federal Poverty Guidelines for the 48 contiguous states.
 * Alaska and Hawaii have higher FPL thresholds (1.25x and 1.15x respectively).
 */

import { getStateData } from '../states';

// 2026 Federal Poverty Level guidelines (48 contiguous states + DC)
const FPL_BASE = 15960; // Base for 1 person household
const FPL_INCREMENT = 5680; // Amount added per additional person

// 2025 Federal Poverty Level guidelines (48 contiguous states + DC)
// ACA Premium Tax Credit eligibility for a coverage year uses the guidelines in
// effect when that year's open enrollment began (26 CFR 1.36B-1(h)): 2026
// coverage uses these 2025 figures, 2027 coverage uses the 2026 table above.
// aca.ts reads them by NAMED year through getFPLForYear(), never as "prior",
// so the January roll cannot move them. Medicaid/MSP/CHIP use current-year.
// At the January guideline release, roll BOTH tables and both year constants.
const FPL_BASE_PRIOR = 15650; // 2025 base for 1 person household
const FPL_INCREMENT_PRIOR = 5500; // 2025 amount added per additional person

/** The guideline year each table above holds. Roll both every January with the values. */
export const FPL_YEAR = 2026;
export const FPL_PRIOR_YEAR = 2025;

// FPL adjustments for Alaska and Hawaii
const FPL_ADJUSTMENTS: Record<string, number> = {
  'AK': 1.25,
  'HI': 1.15,
};

// Fallback SMI values (NH 2024-2025) used when state data unavailable
const DEFAULT_SMI_LIMITS: Record<number, number> = {
  1: 66116,
  2: 86464,
  3: 106812,
  4: 127160,
  5: 147508,
  6: 167856
};
const DEFAULT_SMI_INCREMENT = 20348;

/**
 * Calculate the Federal Poverty Level for a given household size and percentage.
 */
export function getFPL(householdSize: number, percentage: number = 100, state?: string): number {
  const size = Math.max(1, householdSize);
  let base = FPL_BASE + (Math.max(0, size - 1) * FPL_INCREMENT);

  if (state) {
    const normalizedState = state.toUpperCase();
    const adjustment = FPL_ADJUSTMENTS[normalizedState];
    if (adjustment) {
      base = Math.round(base * adjustment);
    }
    const stateData = getStateData(normalizedState);
    if (stateData?.fpl?.adjustment && stateData.fpl.adjustment !== 1) {
      base = Math.round((FPL_BASE + (Math.max(0, size - 1) * FPL_INCREMENT)) * stateData.fpl.adjustment);
    }
  }

  return Math.round(base * (percentage / 100));
}

/**
 * Calculate what percentage of FPL a given income represents.
 */
export function getFPLPercentage(income: number, householdSize: number, state?: string): number {
  const fpl100 = getFPL(householdSize, 100, state);
  return Math.round((income / fpl100) * 100);
}

/**
 * PRIOR-YEAR (2025) Federal Poverty Level for a given household size and percentage.
 * Use for ACA Premium Tax Credit math only — PTC for a coverage year uses the
 * prior year's guidelines (26 CFR 1.36B-1(h)). Medicaid/MSP/CHIP use current-year.
 * Same state-adjustment behavior as getFPL (AK 1.25x, HI 1.15x).
 */
export function getFPLPrior(householdSize: number, percentage: number = 100, state?: string): number {
  const size = Math.max(1, householdSize);
  let base = FPL_BASE_PRIOR + (Math.max(0, size - 1) * FPL_INCREMENT_PRIOR);

  if (state) {
    const normalizedState = state.toUpperCase();
    const adjustment = FPL_ADJUSTMENTS[normalizedState];
    if (adjustment) {
      base = Math.round(base * adjustment);
    }
  }

  return Math.round(base * (percentage / 100));
}

/**
 * Calculate what percentage of PRIOR-YEAR (2025) FPL a given income represents.
 * Use for ACA Premium Tax Credit math only (26 CFR 1.36B-1(h)).
 */
export function getFPLPercentagePrior(income: number, householdSize: number, state?: string): number {
  const fpl100 = getFPLPrior(householdSize, 100, state);
  return Math.round((income / fpl100) * 100);
}

/**
 * FPL for a NAMED guideline year (same function as BenefitsUSA's fpl.ts). Answers from
 * whichever table holds that year. If neither does, it throws rather than quietly answering
 * from the wrong vintage; check:aca-coverage-year fails first, so a deployed build cannot
 * reach it.
 */
export function getFPLForYear(year: number, householdSize: number, percentage: number = 100, state?: string): number {
  if (year === FPL_YEAR) return getFPL(householdSize, percentage, state);
  if (year === FPL_PRIOR_YEAR) return getFPLPrior(householdSize, percentage, state);
  throw new Error(
    `fpl.ts holds the ${FPL_YEAR} and ${FPL_PRIOR_YEAR} poverty guidelines, not ${year}.`,
  );
}

/**
 * Calculate the State Median Income for a given household size and percentage.
 */
export function getSMI(householdSize: number, percentage: number = 100, state?: string): number {
  const size = Math.max(1, householdSize);
  let base: number;
  let perAdditional: number = DEFAULT_SMI_INCREMENT;

  if (state) {
    const stateData = getStateData(state.toUpperCase());
    if (stateData?.smi) {
      const smi = stateData.smi;
      const sizeKey = String(Math.min(size, 6)) as keyof typeof smi;
      const smiValue = smi[sizeKey];
      if (typeof smiValue === 'number') {
        base = smiValue;
        if (size > 6 && smi.perAdditional) {
          base += (size - 6) * smi.perAdditional;
        }
        return Math.round(base * (percentage / 100));
      }
    }
  }

  const cappedSize = Math.min(size, 6);
  base = DEFAULT_SMI_LIMITS[cappedSize];

  if (size > 6) {
    base += (size - 6) * perAdditional;
  }

  return Math.round(base * (percentage / 100));
}

// Pre-calculated common FPL thresholds for quick reference
export const FPL_THRESHOLDS = {
  getThresholds: (householdSize: number, state?: string) => ({
    fpl100: getFPL(householdSize, 100, state),
    fpl130: getFPL(householdSize, 130, state),
    fpl135: getFPL(householdSize, 135, state),
    fpl138: getFPL(householdSize, 138, state),
    fpl150: getFPL(householdSize, 150, state),
    fpl185: getFPL(householdSize, 185, state),
    fpl200: getFPL(householdSize, 200, state),
    fpl250: getFPL(householdSize, 250, state),
    fpl300: getFPL(householdSize, 300, state),
    fpl400: getFPL(householdSize, 400, state),
  })
};
