/**
 * HHS poverty guidelines, 48 contiguous states and D.C. The ONE place these figures are typed.
 *
 * fpl.ts builds every screener threshold from them (adding the AK/HI adjustments and state
 * data). This file has no imports so a client component that needs only the plain poverty line
 * (the medical bill analyzer) can read the real table without pulling the 51 state data files
 * into the browser. It replaces the bill analyzer's private copy, which held the 2025 figures
 * under the name FPL_2026 (audit A20, W8-15).
 *
 * Source: ASPE 2026 poverty guidelines, 1 person "$15,960", "add $5,680 for each additional
 * person". ACA premium tax credits for a coverage year use the guidelines in effect when that
 * year's open enrollment began (26 CFR 1.36B-1(h)), which is why the prior year is kept; aca.ts
 * reads both by NAMED year. Roll both tables and both year constants each January.
 */

/** The guideline year each table holds. */
export const FPL_YEAR = 2026;
export const FPL_PRIOR_YEAR = 2025;

export const FPL_BASE = 15960; // 2026, 1 person
export const FPL_INCREMENT = 5680; // 2026, each additional person

export const FPL_BASE_PRIOR = 15650; // 2025, 1 person (ACA 2026 coverage only) canonical-ok
export const FPL_INCREMENT_PRIOR = 5500; // 2025, each additional person (ACA 2026 coverage only)

/** The current-year poverty line for the 48 contiguous states and D.C. Same arithmetic as
 *  fpl.ts getFPL() with no state. */
export function fplContiguous(householdSize: number, percentage: number = 100): number {
  const base = FPL_BASE + Math.max(0, Math.max(1, householdSize) - 1) * FPL_INCREMENT;
  return Math.round(base * (percentage / 100));
}
