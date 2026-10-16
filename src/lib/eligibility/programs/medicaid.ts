/**
 * Medicaid Eligibility Checker (All States)
 *
 * Expansion states (40 + DC): Adults 19-64 qualify at 138% FPL
 * Non-expansion states (10: AL, FL, GA, KS, MS, SC, TN, TX, WI, WY): no adult coverage, except
 *   Wisconsin (BadgerCare Plus to 100% FPL) and Georgia (Pathways to 100% FPL, with an
 *   80-hours-a-month activity requirement)
 * Children: Generally up to 200-300% FPL, Medicaid and CHIP combined
 * Pregnant women: the highest public coverage, Medicaid, CHIP or the unborn-child option
 * All limits include the 5-point MAGI disregard; see the convention note in states/types.ts.
 * The rows and these branches mirror BenefitsUSA's medicaid.ts (its commit 9ea08f27), so the
 * two sites give the same answer; scripts/check-medicaid-state-limits.mjs holds both.
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

  /* A NON-EXPANSION STATE CAN STILL COVER ADULTS. Wisconsin covers adults to 100% FPL through
     BadgerCare Plus (WI DHS income table effective Feb 1, 2026 to Jan 31, 2027: "Adult monthly
     income limit (100% FPL)"), and Georgia Pathways covers adults 19 to 64 to 100% FPL who
     complete at least 80 hours a month of activity (pathways.georgia.gov/eligibility). The old
     code tested `isExpansionState` and never looked at the limit, so every Wisconsin and Georgia
     adult was told they could not get Medicaid at any income (W8-04, W8-05).
       adultCoveredOutright: the adult limit is a plain income test (expansion states, Wisconsin).
       adultActivity:        the limit carries a condition we cannot see (Georgia), so 'maybe'. */
  const adultActivity = stateData?.medicaid?.adultActivityRequirement;
  const adultCoveredOutright = isExpansionState || (adultLimitFpl > 0 && !adultActivity);

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

  /* THE 65+ BRANCH USED TO SIT HERE, AND IT RETURNED BEFORE THE CHILD CHECK BELOW (audit
     medicaid-gaps; A20 left-over; W9_critic_W8 "Divergence to port the other way" (a)). A
     67-year-old raising a 10-year-old got only the aged card, and the child's own Medicaid was
     never named on it. A child's eligibility has nothing to do with the caregiver's age, and
     grandfamilies are exactly who this product is for. BenefitsUSA had already moved it. It now
     sits below the child checks here too, in the same order as BenefitsUSA's medicaid.ts, and
     governs only the ADULT's own eligibility. */

  if (isPregnant && annualIncome <= fplPregnantLimit) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = 10000;
    result.reason = `Pregnant women in ${stateName} qualify for ${programName} up to ${pregnantLimitFpl}% FPL. For this test your household counts as ${pregnancyHouseholdSize} people, because federal rules count the baby you are expecting before birth.`;
    /* pregnantLimitFpl is the HIGHEST public coverage, so in some states its top band is CHIP or
       the unborn-child option, with its own name and condition (Alabama's ALL Babies, California's
       Medi-Cal Access Program, Missouri's Show-Me Healthy Babies, Kentucky's uninsured-only band).
       Name it for the woman whose income lands in that band, and only for her. */
    const band = stateData?.medicaid?.pregnantUpperBand;
    if (band && annualIncome > getFPL(pregnancyHouseholdSize, band.aboveFpl, state)) {
      result.reason = `${result.reason} ${band.note}`;
    }
    return result;
  }

  // Check for children under 19
  const hasChildUnder19 = numChildren > 0;
  if (hasChildUnder19 && annualIncome <= fplChildLimit) {
    result.eligible = true;
    result.eligibilityStatus = 'likely_eligible';
    result.estimatedValue = 5000 * numChildren;
    result.reason = `Children under 19 qualify for ${programName}/CHIP up to ${childLimitFpl}% FPL`;

    /* The parent's own coverage. Expansion states and Wisconsin cover the parent on income alone;
       Georgia Pathways adds an hours condition, so the parent hears about it as a 'may', with the
       hours, and the answer stays the child's. 65+ is EXCLUDED from the MAGI adult test: the 138%
       expansion limit is a MAGI construct and MAGI does not apply at 65+ (42 USC
       1396a(e)(14)(D)(i)(II)). A grandparent gets the child's result plus a pointer to their own,
       different route. Same sentences as BenefitsUSA. */
    if (age < 65 && adultCoveredOutright && annualIncome <= fplAdultLimit) {
      result.estimatedValue = 10000 + (5000 * Math.max(0, numChildren - 1));
      result.reason = `Your household qualifies for ${programName} coverage`;
      /* This answer covers the parent too. A parent covered as an expansion adult (or a Wisconsin
         waiver adult) faces the work rule unless their child is 13 or younger (P.L. 119-21
         s.71119). The screener asks neither the coverage group nor ages, so the line says "may"
         and names the exemption. Wisconsin's line leaves out 6-month renewals (caveats.ts). */
      withCaveats(result, medicaidWorkCaveats(input, state, isExpansionState));
    } else if (age >= 19 && age < 65 && adultActivity && annualIncome <= fplAdultLimit) {
      result.reason = `${result.reason}. You may qualify too: ${adultActivityReason(adultActivity, adultLimitFpl)}`;
    } else if (age >= 65) {
      result.reason = `${result.reason}. You may also qualify yourself, but on a different route than the child: at 65+ Medicaid is decided on the aged/disabled rules, which count your savings as well as your income. Ask about both in the same application.`;
    }
    return result;
  }

  /* CHILD IN THE HOUSEHOLD, INCOME TOO HIGH, and the income may not be theirs to count (ported
     from BenefitsUSA's medicaid.ts, same sentences, so both sites answer this household alike).
     42 CFR 435.603(f)(2)(i): a tax dependent claimed by someone OTHER than a parent or spouse is
     assessed under the NON-FILER rules, and those rules (f)(3) count only the child's spouse,
     children, and, for a child, their PARENTS and SIBLINGS living with them. A grandparent, aunt or
     family friend is on none of those lists. So a child raised by a relative is normally assessed on
     the CHILD's own income, which is usually zero, and qualifies no matter what the caregiver earns.

     The screener does not ask the relationship ("Children under 19"), so we cannot assert this, but
     staying silent tells a grandparent raising a grandchild that the child does not qualify, which
     is usually false. 'maybe' with the rule named is the honest middle. Value stays 0: we are not
     asserting a benefit, we are saying the test they were measured against may be the wrong one.
     Not universal (a few states require legal custody or guardianship first, or count the
     caregiver's income anyway), so the copy says "most states" and routes to the agency. */
  if (hasChildUnder19 && annualIncome > fplChildLimit) {
    const plural = numChildren > 1;
    result.eligible = 'maybe';
    result.eligibilityStatus = 'may_qualify';
    result.estimatedValue = 0;
    result.reason = `Your household income is above the ${childLimitFpl}% limit for ${programName}/CHIP, and that limit is the right test for your own children. It is the wrong test if you are raising ${plural ? 'grandchildren, or a relative\'s children' : 'a grandchild, or another relative\'s child'}: your income usually does not count at all in that case, so ${plural ? 'they are' : 'the child is'} assessed on their own income and ${plural ? 'they qualify' : 'qualifies'} in most states no matter what you earn.`;
    result.nextSteps = `Apply for the child at ${applicationUrl} or call ${phone}. Say you are a relative caregiver and ask for a child-only application.`;
    return result;
  }

  // Age 65+: dual-eligibility pathway, for the ADULT's own eligibility (the child checks above
  // run first). About 12 million Americans receive BOTH Medicare and Medicaid
  // simultaneously — Medicaid covers Medicare
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


  if (age >= 19 && age < 65) {
    if (!isExpansionState) {
      /* Georgia Pathways: inside the income limit, the answer turns on monthly hours of work,
         school, job training or volunteering that the screener does not ask about, so this is a
         'maybe' that states the condition, never a 'likely'. (This replaces a "limited Medicaid
         for parents" branch that no state could reach, because every non-expansion row had an
         adult limit of 0. Wisconsin adults are covered outright and fall through to the plain
         income test below.) No work caveat here: the reason already states the hours. */
      if (adultActivity && adultLimitFpl > 0 && annualIncome <= fplAdultLimit) {
        result.eligible = 'maybe';
        result.eligibilityStatus = 'may_qualify';
        result.estimatedValue = 10000;
        result.reason = `${adultActivityReason(adultActivity, adultLimitFpl)} Your income is at ${fplPercent}% FPL, which is within that limit.`;
        result.nextSteps = `See the rules at ${adultActivity.url}, then apply at ${applicationUrl} or call ${phone}`;
        return result;
      }

      // Childless adults in a non-expansion state with NO adult coverage at all (8 of the 10)
      if (adultLimitFpl === 0 && numChildren === 0 && !isPregnant && !input.hasDisability) {
        result.eligible = false;
        result.eligibilityStatus = 'not_eligible';
        result.reason = `${stateName} has not expanded Medicaid. Adults without children, pregnancy, or disability generally don't qualify.`;
        result.nextSteps = `Check ACA marketplace options at ${stateData?.state?.mainPortal || 'healthcare.gov'}`;
        return result;
      }
    }

    // Expansion state, Wisconsin's BadgerCare Plus, or has qualifying condition
    if (annualIncome <= fplAdultLimit) {
      result.eligible = true;
      result.eligibilityStatus = 'likely_eligible';
      result.estimatedValue = 10000;
      result.reason = `Income at ${fplPercent}% FPL qualifies for ${programName} (limit: ${adultLimitFpl}% FPL)`;
      /* Expansion adults and Wisconsin's waiver adults (whose 100% limit is now in the data) face
         the work requirement: P.L. 119-21 s.71119, W8-09 and W9_critic_W8. */
      if (isExpansionState || state === 'WI') {
        withCaveats(result, medicaidWorkCaveats(input, state, isExpansionState));
      }
      return result;
    }
  }

  if (isPregnant) {
    /* Her binding test was the pregnancy one, so name THAT limit at HER family size. This used to
       fall through to the adult sentence and tell a pregnant Marylander at 290% of the poverty line
       for two that she was at 393% and over a 138% limit, neither of which was her test. */
    const pregnancyFplPercent = getFPLPercentage(annualIncome, pregnancyHouseholdSize, state);
    result.reason = `For a pregnant woman your household counts as ${pregnancyHouseholdSize} people, including the baby you are expecting. At that size your income is ${pregnancyFplPercent}% FPL, above the ${pregnantLimitFpl}% FPL limit for pregnant women in ${stateName}.`;
    result.nextSteps = 'Check ACA marketplace subsidies at healthcare.gov';
  } else if (annualIncome > fplAdultLimit && adultLimitFpl > 0) {
    result.reason = `Income at ${fplPercent}% FPL exceeds the ${adultLimitFpl}% FPL limit for ${adultActivity?.programName ?? programName}`;
    result.nextSteps = 'Check ACA marketplace subsidies at healthcare.gov';
  } else {
    result.reason = `Does not meet ${programName} eligibility requirements`;
  }

  return result;
}

/** One sentence stating an adult program's income limit AND its activity condition. The hours
 *  are the point: a Pathways answer without them is a promise the state will not keep. */
function adultActivityReason(
  req: { programName: string; hoursPerMonth: number },
  limitFpl: number,
): string {
  return `${req.programName} covers adults 19 to 64 up to ${limitFpl}% FPL who complete at least ${req.hoursPerMonth} hours a month of work, school, job training or volunteering.`;
}

export default checkMedicaid;
