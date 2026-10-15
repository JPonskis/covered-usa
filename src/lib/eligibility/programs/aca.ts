/**
 * ACA Health Insurance Subsidies (Premium Tax Credits)
 *
 * Eligibility (IRA enhanced credits expired Dec 31, 2025, so the 400% cliff is back):
 * - Income: 100% - 400% FPL for the COVERAGE YEAR being shopped for, which is
 *   not always the calendar year. acaCoverageYear() picks it: 2026 through
 *   Oct 31, 2026, then 2027 once enrollment for 2027 opens Nov 1.
 *   The PTC is measured against the guidelines in effect when that coverage
 *   year's open enrollment began (26 CFR 1.36B-1(h); 26 USC 36B(d)(3)(B)), so
 *   the table is read by NAMED year via getFPLForYear: CY2026 uses the 2025
 *   guidelines (400% = $62,600 single / $128,600 family of 4), CY2027 uses 2026
 *   ($63,840 / $132,000). The 138% Medicaid referral below is a different test
 *   and correctly uses the CURRENT guidelines, so this file mixes two tables on
 *   purpose.
 * - Not eligible for Medicare
 * - Not eligible for Medicaid (income > 138% FPL in expansion states)
 * - Not offered affordable employer coverage. Affordability is per coverage
 *   year: 9.96% for 2026 (Rev. Proc. 2025-25), 10.22% for 2027 (Rev. Proc.
 *   2026-26 section 3.02).
 * - Immigration status, when a caller supplies it: lawfully present for 2026
 *   coverage; from 2027 coverage only green card holders, Cuban/Haitian entrants
 *   and COFA citizens (P.L. 119-21 section 71301). The CoveredUSA screener does
 *   not ask, so today no caller supplies it and nobody is denied. Instead, from
 *   2027 coverage every credit result carries a one-line caveat (caveats.ts).
 *
 * The coverage-year design (gate, named-year read, tables, status copy) mirrors
 * BenefitsUSA's aca.ts so the two sites do not drift. The dollar estimate below
 * is CoveredUSA's own band heuristic and is not shared.
 */

import type { ScreenerInput, ProgramResult } from '../types';
import { getFPL, getFPLForYear } from '../fpl';
import { getStateData, getStateName } from '../../states';
import { medicaidWorkCaveats, ptcImmigrationCaveats, withCaveats } from '../caveats';

export function checkACA(input: ScreenerInput): ProgramResult {
  const { annualIncome, householdSize, age, currentlyInsured, insuranceSource, citizenshipStatus, state = 'TX' } = input;

  const stateData = getStateData(state);
  const stateName = getStateName(state);
  const medicaidName = stateData?.medicaid?.localName || `${stateName} Medicaid`;
  const medicaidUrl = stateData?.medicaid?.applicationUrl || 'https://www.healthcare.gov/medicaid-chip/';

  /* PTC boundaries are measured against the guidelines in effect when the coverage
     year's open enrollment began (26 CFR 1.36B-1(h)), so they are read by NAMED
     year, never by "prior". A relative read is right for CY2026 only until Nov 1:
     from then until the January 2027 guideline roll, CY2027 needs the 2026 table
     while "prior" still points at 2025, which is the whole of open enrollment.
     The coverage year is fixed ONCE per screening so one answer never straddles
     the gate. The Medicaid referral uses the CURRENT guidelines. State passes
     through so AK/HI get their own tables. */
  const { coverageYear, min: fpl100, max: fpl400 } = acaPtcIncomeRange(householdSize, new Date(), state);
  const fplPercent = Math.round((annualIncome / fpl100) * 100);
  const fpl138 = getFPL(householdSize, 138, state);
  /* From Nov 1 the screener answers for 2027 coverage, so the copy names the year: someone
     shopping a 2026 special enrollment in Nov-Dec sees 2027 math, and the critic's fix note
     (W9_critic_W8, W8-06) asks that the copy say so. 2026 wording is left exactly as it was. */
  const forYear = coverageYear >= 2027 ? ` for ${coverageYear} coverage` : '';

  const result: ProgramResult = {
    id: 'aca',
    name: 'ACA Health Insurance Subsidy',
    eligible: false,
    eligibilityStatus: 'not_eligible',
    estimatedValue: 0,
    reason: '',
    nextSteps: 'Visit HealthCare.gov during Open Enrollment or if you have a qualifying life event. Open Enrollment starts November 1. End dates vary by state and may change this year, so check HealthCare.gov for your deadline.'
  };

  // Medicare-eligible people don't get ACA subsidies
  if (age >= 65) {
    result.reason = 'Age 65+, you should enroll in Medicare instead';
    result.nextSteps = 'Contact Medicare at 1-800-MEDICARE or visit medicare.gov';
    return result;
  }

  if (insuranceSource === 'medicare') {
    result.reason = 'Already enrolled in Medicare';
    result.nextSteps = 'ACA subsidies are not available to Medicare enrollees';
    return result;
  }

  const isExpansionState = stateData?.state?.medicaidExpansion ?? true;

  if (isExpansionState && annualIncome < fpl138) {
    result.reason = 'Income below 138% FPL - you likely qualify for Medicaid instead';
    result.nextSteps = `Apply for ${medicaidName} at ${medicaidUrl}`;
    return result;
  }

  if (annualIncome < fpl100) {
    if (isExpansionState) {
      result.reason = 'Income below 100% FPL - apply for Medicaid';
      result.nextSteps = `Apply for ${medicaidName} at ${medicaidUrl}`;
      return result;
    } else if (state === 'WI') {
      /* Wisconsin is the one non-expansion state that covers adults to 100% FPL,
         through BadgerCare Plus, so a person under 100% here is not in the gap.
         WI DHS income table, "effective February 1, 2026-January 31, 2027":
         adult limit (100% FPL) $1,330.00 for one person. */
      result.reason = 'Income below 100% FPL - BadgerCare Plus covers adults up to 100% FPL in Wisconsin';
      result.nextSteps = `Apply for ${medicaidName} at ${medicaidUrl}`;
      /* Wisconsin's waiver adults are "applicable individuals" for the 2027 work requirement
         (W9_critic_W8, W8-04/W8-09), and this is the line that sends them to BadgerCare. */
      withCaveats(result, medicaidWorkCaveats(input, state, false));
      return result;
    } else {
      /* THE COVERAGE GAP. No premium tax credit exists below 100% FPL: 26 USC
         36B(c)(1)(A) defines an applicable taxpayer as household income that
         "equals or exceeds 100 percent but does not exceed 400 percent" of the
         poverty line, and HealthCare.gov tells people under 100% in a
         non-expansion state "you won't qualify for either health insurance
         savings program". The one exception, (c)(1)(B) for lawfully present
         immigrants, was struck by P.L. 119-21 section 71302(a) for taxable years
         beginning after December 31, 2025.
         This branch used to return 'maybe' with $10,000 for one adult or $20,000
         for two or more, money the law does not allow. */
      result.eligible = false;
      result.eligibilityStatus = 'not_eligible';
      result.estimatedValue = 0;
      result.reason = `Income below 100% FPL in ${stateName}, which has not expanded Medicaid. This is the coverage gap: too little income for a marketplace tax credit, too much for Medicaid.`;
      result.nextSteps = `You may still qualify for ${medicaidName} another way, for example as a parent, a pregnant woman, or a person with a disability: check at ${medicaidUrl}. A community health center will see you on a sliding scale based on your income: find one at findahealthcenter.hrsa.gov. Hospitals also run charity care programs.`;
      return result;
    }
  }

  /* IMMIGRATION STATUS (same rule and copy as BenefitsUSA). 26 USC 36B(e) has always
     excluded anyone not lawfully present. The CoveredUSA screener does not ask, so
     `citizenshipStatus` arrives undefined from every caller today (and 0 of 2,129 stored
     submissions carry 'none'): an ABSENT answer must never deny anyone, and 'mixed' is
     untouched because a citizen or green card holder in the household can get the credit
     in either year. This branch is here so the rule is already right the day a status
     question is added.
       2026 coverage: lawfully present immigrants qualify (refugees, asylees, TPS, many
         visas), people without lawful status do not, and 'none' covers both. So 'maybe'.
       2027 coverage: P.L. 119-21 section 71301(b), new 36B(e)(2)(B), narrows it to green
         card holders, Cuban/Haitian entrants and COFA citizens, for taxable years beginning
         after Dec 31, 2026. A 'none' household can only be one of the last two groups, so
         the card names them and carries no dollar figure into the results total. */
  if (citizenshipStatus === 'none' && annualIncome <= fpl400) {
    result.eligible = 'maybe';
    result.eligibilityStatus = 'may_qualify';
    if (coverageYear >= 2027) {
      result.estimatedValue = 0;
      result.reason = ACA_STATUS_REASON_2027;
      result.nextSteps = ACA_STATUS_NEXT_STEPS_2027;
    } else {
      result.estimatedValue = estimateACAValue(fplPercent, householdSize);
      result.reason = ACA_STATUS_REASON_2026;
      result.nextSteps = ACA_STATUS_NEXT_STEPS_2026;
    }
    return result;
  }

  if (currentlyInsured && insuranceSource === 'employer') {
    result.eligible = 'maybe';
    result.eligibilityStatus = 'may_qualify';
    /* The threshold follows the coverage year (one Rev. Proc. per year). Strictly it follows
       the employer's PLAN year, so 2027 wording names plan years (W9_critic_W8, W8-07). */
    const affordPct = (ACA_AFFORDABILITY_PCT[coverageYear] * 100).toFixed(2);
    result.reason = coverageYear >= 2027
      ? `You may qualify if your employer plan is unaffordable (costs > ${affordPct}% of income for plan years starting in ${coverageYear})`
      : `You may qualify if your employer plan is unaffordable (costs > ${affordPct}% of income)`;
    result.estimatedValue = estimateACAValue(fplPercent, householdSize);
    withCaveats(result, ptcImmigrationCaveats(input, coverageYear));
    return result;
  }

  if (annualIncome >= fpl100 && annualIncome <= fpl400) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = estimateACAValue(fplPercent, householdSize);
    result.reason = `Income at ${fplPercent}% FPL qualifies for premium subsidies${forYear}`;
    /* From Nov 1 (2027 coverage) the credit is limited by immigration status, and nobody here
       was asked theirs (P.L. 119-21 s.71301). One caveat line; the answer is unchanged. */
    withCaveats(result, ptcImmigrationCaveats(input, coverageYear));
    return result;
  }

  if (annualIncome > fpl400) {
    result.reason = `Income at ${fplPercent}% FPL exceeds the 400% FPL subsidy limit${forYear}`;
    result.nextSteps = 'You can still purchase health insurance through HealthCare.gov but without premium subsidies.';
    return result;
  }

  result.reason = 'Does not meet ACA subsidy eligibility requirements';
  return result;
}

/* ---------------------------------------------------------------------------
   THE COVERAGE-YEAR DATE GATE (audit item ACA2027; same as BenefitsUSA)

   Open enrollment for the next plan year opens Nov 1 ("Starting November 1, you
   can apply for 2027 coverage", HealthCare.gov), so from 2026-11-01 the person in
   front of us is shopping for 2027 coverage and must be quoted 2027 numbers.
   Before that date they are still buying 2026 coverage, and nothing changes.

   DATE-GATED on purpose so it can merge before Nov 1. Do not "simplify" it by
   flipping the values early. check:aca-coverage-year (prebuild) proves both
   sides of the gate and fails from Oct 1 of any year whose next coverage year
   has no entry below.
--------------------------------------------------------------------------- */

/** From this instant the marketplace is selling 2027 coverage. */
export const ACA_2027_COVERAGE_EFFECTIVE = new Date('2026-11-01T00:00:00-04:00');

export type AcaCoverageYear = 2026 | 2027;

export function acaCoverageYear(now: Date = new Date()): AcaCoverageYear {
  return now.getTime() >= ACA_2027_COVERAGE_EFFECTIVE.getTime() ? 2027 : 2026;
}

/** The poverty-guideline year a coverage year's PTC math uses (26 CFR 1.36B-1(h)). */
export function ptcGuidelineYear(cy: AcaCoverageYear): number {
  return cy === 2027 ? 2026 : 2025;
}

/** The credit's income window (100% to 400% of the poverty line) for the coverage year in
 *  effect at `now`. checkACA screens against exactly this, so any page that prints the range
 *  (aca-income-limits, federal-poverty-level: W8-13 / W8-14) should read it from here rather
 *  than retype it. */
export function acaPtcIncomeRange(householdSize: number, now: Date = new Date(), state?: string) {
  const coverageYear = acaCoverageYear(now);
  const guidelineYear = ptcGuidelineYear(coverageYear);
  return {
    coverageYear,
    guidelineYear,
    min: getFPLForYear(guidelineYear, householdSize, 100, state),
    max: getFPLForYear(guidelineYear, householdSize, 400, state),
  };
}

/* Copy for a household where no one is a citizen or green card holder (identical strings to
   BenefitsUSA's aca.ts). One pair per coverage year. */
export const ACA_STATUS_REASON_2026 =
  'Premium tax credits for 2026 coverage are open to lawfully present immigrants, including refugees, asylees, TPS holders and many visa holders. People without a lawful immigration status cannot get them.';
export const ACA_STATUS_NEXT_STEPS_2026 =
  'Apply at HealthCare.gov or your state marketplace, which checks each person\'s immigration status and shows who can get the credit. A community health center will see you on a sliding scale based on your income: find one at findahealthcenter.hrsa.gov.';
export const ACA_STATUS_REASON_2027 =
  'Starting with 2027 coverage, premium tax credits are limited to US citizens, green card holders, Cuban and Haitian entrants, and citizens of Micronesia, the Marshall Islands and Palau living here under the Compact of Free Association. Refugees, asylees, TPS holders and visa holders no longer qualify.';
export const ACA_STATUS_NEXT_STEPS_2027 =
  'If you are a Cuban or Haitian entrant or a Compact of Free Association citizen, you can still get the credit: apply at HealthCare.gov or your state marketplace. A community health center will see you on a sliding scale based on your income: find one at findahealthcenter.hrsa.gov.';

/** Applicable percentages by coverage year (same table as BenefitsUSA).
 *  2026: Rev. Proc. 2025-25 section 3.01. 2027: Rev. Proc. 2026-26 section 3.01, top rate
 *  10.22%; section 5: "effective for taxable years and plan years beginning in calendar year
 *  2027". CoveredUSA's dollar estimate below is a flat band heuristic and does not read this
 *  table; it lives here so the two engines carry one table and the aca-income-limits tier
 *  copy (W8-13) can render from it instead of retyping it. */
export const ACA_APPLICABLE_PERCENTAGES: Record<AcaCoverageYear, {
  upTo133: number; at133: number; at150: number; at200: number; at250: number; at300: number;
}> = {
  2026: { upTo133: 0.0210, at133: 0.0314, at150: 0.0419, at200: 0.0660, at250: 0.0844, at300: 0.0996 },
  2027: { upTo133: 0.0215, at133: 0.0323, at150: 0.0430, at200: 0.0678, at250: 0.0866, at300: 0.1022 },
};

/** The employer-coverage affordability threshold, by coverage year.
 *  2026: Rev. Proc. 2025-25 section 3.02. 2027: Rev. Proc. 2026-26 section 3.02, "the
 *  Required Contribution Percentage ... is 10.22%". */
export const ACA_AFFORDABILITY_PCT: Record<AcaCoverageYear, number> = {
  2026: 0.0996,
  2027: 0.1022,
};

function estimateACAValue(fplPercent: number, householdSize: number): number {
  let baseValue: number;

  if (fplPercent <= 150) {
    baseValue = 10000;
  } else if (fplPercent <= 200) {
    baseValue = 6500;
  } else if (fplPercent <= 250) {
    baseValue = 4000;
  } else if (fplPercent <= 300) {
    baseValue = 3000;
  } else {
    baseValue = 1200;
  }

  const adults = Math.max(1, householdSize - Math.floor(householdSize * 0.3));
  return Math.round(baseValue * Math.min(adults, 2));
}

export default checkACA;
