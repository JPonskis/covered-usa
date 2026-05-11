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
