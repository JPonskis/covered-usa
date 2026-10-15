/**
 * Medicaid Eligibility Checker (All States)
 *
 * Expansion states (41 states including DC have expanded): Adults 19-64 qualify at 138% FPL
 * Non-expansion states (10: AL, FL, GA, KS, MS, SC, TN, TX, WI, WY): Very limited adult coverage
 * Children: Generally up to 200-300% FPL
 * Pregnant women: Generally up to 185-200% FPL
 */

import type { ScreenerInput, ProgramResult } from '../types';
import { getFPL, getFPLPercentage } from '../fpl';
import { getStateData, getStateName } from '../../states';
import { medicaidImmigrationCaveats, medicaidWorkCaveats, withCaveats } from '../caveats';

export function checkMedicaid(input: ScreenerInput): ProgramResult {
  const result = medicaidResult(input);
  /* Since Oct 1, 2026 (P.L. 119-21 section 71109) federal Medicaid money is limited to citizens,
     green card holders, Cuban/Haitian entrants and COFA citizens. The screener does not ask, so
     every result that tells someone they may get Medicaid carries the caveat (caveats.ts). The
     answer itself is untouched. */
  if (result.eligible !== false) withCaveats(result, medicaidImmigrationCaveats(input));
  return result;
}

function medicaidResult(input: ScreenerInput): ProgramResult {
  const { annualIncome, householdSize, age, isPregnant, numChildren, state = 'TX' } = input;

  const stateData = getStateData(state);
  const stateName = getStateName(state);
  const isExpansionState = stateData?.state?.medicaidExpansion ?? true;

  const programName = stateData?.medicaid?.localName || `${stateName} Medicaid`;
  const applicationUrl = stateData?.medicaid?.applicationUrl || 'https://www.healthcare.gov/medicaid-chip/';
  const phone = stateData?.medicaid?.phone || '211';

  const adultLimitFpl = stateData?.medicaid?.adultLimitFpl ?? (isExpansionState ? 138 : 0);
  const childLimitFpl = stateData?.medicaid?.childLimitFpl ?? 200;
  const pregnantLimitFpl = stateData?.medicaid?.pregnantLimitFpl ?? 185;

  /* PREGNANCY FAMILY SIZE. 42 CFR 435.603(b): "In the case of determining the family size of a
     pregnant woman, the pregnant woman is counted as herself plus the number of children she is
     expected to deliver." The screener asks how many people LIVE in the household, so the baby is
     not in the number she enters, and this test was being run one person short in all 51
     jurisdictions. A single pregnant Texan earning $36,000 was measured against the one-person
     limit of $31,596 and told no. The two-person limit is $42,852 and she qualifies. OHCA, Indiana
     and Connecticut all print this rule on their own charts.

     It applies to the PREGNANCY test ONLY. 435.603(b) sizes HER family for HER eligibility group,
     so the adult and child tests below keep using the household as entered. Getting that wrong in
     the other direction would hand a child a limit they have no claim to. */
  const expectedChildren = Math.max(1, Math.round(input.expectedChildren ?? 1));
  const pregnancyHouseholdSize = householdSize + expectedChildren;

  const fplAdultLimit = getFPL(householdSize, adultLimitFpl, state);
  const fplChildLimit = getFPL(householdSize, childLimitFpl, state);
  const fplPregnantLimit = getFPL(pregnancyHouseholdSize, pregnantLimitFpl, state);
  const fplPercent = getFPLPercentage(annualIncome, householdSize, state);

  const result: ProgramResult = {
    id: 'medicaid',
    name: programName,
    eligible: false,
    eligibilityStatus: 'not_eligible',
    estimatedValue: 0,
    reason: '',
    nextSteps: `Apply at ${applicationUrl} or call ${phone}`
  };

  // Age 65+: dual-eligibility pathway. About 12 million Americans receive
  // BOTH Medicare and Medicaid simultaneously — Medicaid covers Medicare
  // premiums + copays plus services Medicare doesn't (long-term care, dental,
  // vision). Aged Medicaid exists in every state, including non-expansion
  // states. Income limits are typically at or near SSI level (~75% FPL) for
  // "full" duals, with broader pathways up to 138% FPL when state spend-down
  // or Medicare Savings Programs are layered in. The results page already
  // surfaces Medicare as the primary program — Medicaid here is presented as
  // an additional benefit, not a replacement.
  if (age >= 65) {
    const fplAged100 = getFPL(householdSize, 100, state);
    const fplAged138 = getFPL(householdSize, 138, state);

    /* WHY THIS NEVER SAYS "likely" ON INCOME ALONE (audit A20, W9_critic_W8 "Anything W8
       missed" #2; ported from BenefitsUSA's medicaid.ts, which already ships it).
       At 65+ Medicaid is decided on the aged/disabled (non-MAGI) rules, and the ACA's ban on
       asset tests is switched off for this group by 42 USC 1396a(e)(14)(D)(i)(II). The
       SSI-related resource limit is $2,000 for one person and $3,000 for a couple (20 CFR
       416.1205(c)), and many states' aged income limit sits at the SSI level, below 100% FPL.
       We ask income and nothing about savings, so "likely" over-promised. This branch used to
       return likely_eligible with $8,000 to every senior at or under 100% FPL: 449 real
       seniors used the general screener between July 14 and the audit.
       Value: the defensible range is $6,500-$8,700 a year (KFF CY2023; MACPAC FY2023-24) and
       a `maybe` takes the low end. It is held out of the total because full Medicaid for a
       dual pays the Part B premium the Medicare Savings Program card already counts. */
    const DUAL_VALUE = 6500;
    const ASSETS = 'Eligibility also turns on savings and other assets, which this screener did not ask about. Most states cap countable resources near $2,000 for one person and $3,000 for a couple, though your home, one car and household goods do not count.';
    const agedNextSteps = `Apply for ${programName} at ${applicationUrl} or call ${phone}. Mention you are 65+ applying for aged/blind/disabled Medicaid.`;

    if (input.insuranceSource === 'medicaid') {
      result.eligible = true;
      result.eligibilityStatus = 'likely_eligible';
      result.estimatedValue = DUAL_VALUE;
      result.excludedFromTotal = true;
      result.reason = `You told us you already have Medicaid. With Medicare as well, you are what is called a dual eligible, and ${programName} should be paying your Medicare premiums and cost sharing. If you are being billed for Medicare deductibles or coinsurance, that is usually not allowed.`;
      result.nextSteps = agedNextSteps;
      return result;
    }

    if (annualIncome <= fplAged100) {
      result.eligible = 'maybe';
      result.eligibilityStatus = 'may_qualify';
      result.estimatedValue = DUAL_VALUE;
      result.excludedFromTotal = true;
      result.reason = `Medicare and Medicaid are not either/or, and about 12 million people have both. At ${fplPercent}% of the federal poverty level your income is in the range states use for Medicaid at 65 and over. ${ASSETS} Apply anyway: only your state can decide, and the Medicare Savings Program has a far higher resource limit.`;
      result.nextSteps = agedNextSteps;
      return result;
    }

    if (annualIncome <= fplAged138) {
      result.eligible = 'maybe';
      result.eligibilityStatus = 'may_qualify';
      result.estimatedValue = 4000;
      result.reason = `Income at ${fplPercent}% FPL may qualify for partial ${programName} or a Medicare Savings Program. State limits vary.`;
      result.nextSteps = `Apply at ${applicationUrl} or call ${phone}.`;
      return result;
    }

    result.eligible = false;
    result.eligibilityStatus = 'not_eligible';
    result.reason = `Income at ${fplPercent}% FPL exceeds aged/disabled full-benefit ${programName} limits, which in most states are near the SSI level (roughly 75-100% FPL).`;
    result.nextSteps = `Medicare is your primary coverage. If income is close to the limit, check Medicare Savings Programs below.`;
    return result;
  }

  if (isPregnant && annualIncome <= fplPregnantLimit) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = 10000;
    result.reason = `Pregnant women in ${stateName} qualify for ${programName} up to ${pregnantLimitFpl}% FPL. For this test your household counts as ${pregnancyHouseholdSize} people, because federal rules count the baby you are expecting before birth.`;
    return result;
  }

  // Check for children under 19
  const hasChildUnder19 = numChildren > 0;
  if (hasChildUnder19 && annualIncome <= fplChildLimit) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = 5000 * numChildren;
    result.reason = `Children under 19 qualify for ${programName}/CHIP up to ${childLimitFpl}% FPL`;

    if (isExpansionState && annualIncome <= fplAdultLimit) {
      result.estimatedValue = 10000 + (5000 * Math.max(0, numChildren - 1));
      result.reason = `Your household qualifies for ${programName} coverage`;
      /* This answer covers the parent too. A parent covered as an expansion adult faces the work
         rule unless their child is 13 or younger (P.L. 119-21 s.71119). The screener asks neither
         the coverage group nor ages, so the line says "may" and names the exemption. */
      withCaveats(result, medicaidWorkCaveats(input, state, isExpansionState));
    }
    return result;
  }

  if (age >= 19 && age < 65) {
    if (!isExpansionState) {
      if (numChildren > 0 && adultLimitFpl > 0 && annualIncome <= fplAdultLimit) {
        result.eligible = 'maybe';
        result.eligibilityStatus = 'may_qualify';
        result.estimatedValue = 8000;
        result.reason = `${stateName} has limited Medicaid for parents. Income at ${fplPercent}% FPL may qualify.`;
        return result;
      }

      if (numChildren === 0 && !isPregnant && !input.hasDisability) {
        result.eligible = false;
        result.eligibilityStatus = 'not_eligible';
        result.reason = `${stateName} has not expanded Medicaid. Adults without children, pregnancy, or disability generally don't qualify.`;
        result.nextSteps = `Check ACA marketplace options at ${stateData?.state?.mainPortal || 'healthcare.gov'}`;
        return result;
      }
    }

    if (annualIncome <= fplAdultLimit) {
      result.eligible = true;
      result.eligibilityStatus = 'likely_eligible';
      result.estimatedValue = 10000;
      result.reason = `Income at ${fplPercent}% FPL qualifies for ${programName} (limit: ${adultLimitFpl}% FPL)`;
      /* Expansion adults (and Wisconsin's waiver adults, once its adult limit is in the data)
         face the work requirement: P.L. 119-21 s.71119, W8-09 and W9_critic_W8. */
      if (isExpansionState || state === 'WI') {
        withCaveats(result, medicaidWorkCaveats(input, state, isExpansionState));
      }
      return result;
    }
  }

  if (annualIncome > fplAdultLimit && adultLimitFpl > 0) {
    result.reason = `Income at ${fplPercent}% FPL exceeds the ${adultLimitFpl}% FPL limit for ${programName}`;
    result.nextSteps = 'Check ACA marketplace subsidies at healthcare.gov';
  } else {
    result.reason = `Does not meet ${programName} eligibility requirements`;
  }

  return result;
}

export default checkMedicaid;
