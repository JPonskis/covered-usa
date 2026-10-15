/**
 * The Medicare-focus screener (/screener?focus=medicare). Audit A20; W8_coveredusa.md Notes #1;
 * W9_critic_W8.md "The $0-income bug ruling" and "Anything W8 missed" #1.
 *
 * That flow asks ZIP, age, "Do you currently have Medicare?" and what help is wanted. It never
 * asks income, household size, children, disability or veteran status. /api/screen used to fill
 * the gaps with income $0 and a household of 1, so every senior was screened at 0% FPL and told
 * Medicaid ($8,000) and QMB ($5,000) were "likely" (a 70-year-old Ohioan on $2,500 a month
 * qualifies for neither). It also forced insuranceSource 'medicare' for someone who answered
 * "No, not enrolled", which skipped the Medicare Savings Program's age gate and told a
 * 62-year-old "Already enrolled in Medicare" on the ACA card.
 *
 * The fix is the smaller of the two the critic offered: show only what the flow's own answers
 * decide, rather than add an income question to the funnel. Medicare is the one program decided
 * by age. Everything income-tested (Medicaid, Medicare Savings Programs, ACA, CHIP) and VA (the
 * flow never asks about service) is left out of the results, the stored eligible_programs and
 * the welcome email. It is an ALLOWLIST on purpose: a program added to the engine later stays out
 * of this flow until someone decides its inputs are actually asked here.
 */
import type { ScreenerResults } from './types';

/** Programs the Medicare-focus flow's answers can decide. */
export const MEDICARE_FLOW_PROGRAM_IDS: readonly string[] = ['medicare'];

/** The answers to "Do you currently have Medicare?" that mean yes. */
const ENROLLED_STATUSES = ['partAB', 'advantage', 'supplement'];

export function isMedicareEnrolledStatus(status: unknown): boolean {
  return ENROLLED_STATUSES.includes(String(status));
}

/** The engine's insuranceSource for this flow: 'medicare' only for someone who said they have
 *  it. "No, not enrolled" and "Not sure" are not Medicare enrollees, and we do not know what
 *  other coverage they have, so the answer is unknown, not 'medicare'. */
export function medicareFlowInsuranceSource(status: unknown): 'medicare' | undefined {
  return isMedicareEnrolledStatus(status) ? 'medicare' : undefined;
}

/** The status part of a stored insurance_source "medicare:<status>:<needs>". */
export function medicareStatusFromStored(insuranceSource: string): string {
  return insuranceSource.startsWith('medicare:') ? insuranceSource.split(':')[1] ?? '' : '';
}

/** Keep only the programs this flow can decide, and total them the way index.ts does. */
export function medicareFlowResults(results: ScreenerResults): ScreenerResults {
  const programs = results.programs.filter((p) => MEDICARE_FLOW_PROGRAM_IDS.includes(p.id));
  const totalPotentialValue = programs
    .filter((p) => (p.eligible === true || p.eligible === 'maybe') && !p.excludedFromTotal)
    .reduce((sum, p) => sum + p.estimatedValue, 0);
  return { programs, totalPotentialValue };
}
