/**
 * Engine input for /api/quick-check, the inline screener on /comenzar (audit A20; W8_coveredusa.md
 * Notes #2; W9_critic_W8.md).
 *
 * The inline form asks ZIP, household size, income and, for a household of 2 or more, how many
 * children under 19 live there. It used to ask no children question and set
 * numChildren = householdSize - 1, so a childless Texas couple on $25,000 was shown Medicaid and
 * CHIP for a child who does not exist. A missing answer (an older cached page) now means 0, the
 * same default the lead submission to /api/screen has always sent, so the quick answer and the
 * saved results agree.
 *
 * Age stays 35: this form is the working-age (ACA/Medicaid) landing. The Medicare variant
 * (/comenzar?focus=medicare) no longer uses it; it sends people to the Medicare screener, which
 * asks age.
 */
import type { ScreenerInput } from './types';

export function quickCheckInput(
  state: string,
  body: { householdSize?: unknown; annualIncome?: unknown; numChildren?: unknown },
): ScreenerInput {
  const householdSize = Math.max(1, Math.min(10, parseInt(String(body.householdSize), 10) || 1));
  const annualIncome = Math.max(0, Number(String(body.annualIncome || '0').replace(/[,$]/g, '')));
  const numChildren = Math.max(0, Math.min(householdSize - 1, parseInt(String(body.numChildren ?? 0), 10) || 0));
  return {
    state,
    age: 35,
    householdSize,
    annualIncome,
    employmentStatus: 'employed',
    isPregnant: false,
    hasDisability: false,
    currentlyInsured: false,
    isVeteran: false,
    numChildren,
  };
}
