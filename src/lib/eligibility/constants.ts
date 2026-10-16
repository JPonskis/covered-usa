/**
 * SSI AND MEDICARE FIGURES: ONE DATED TABLE PER AGENCY (eligibility audit 2026-10, jan1-other).
 *
 * The same shape BenefitsUSA uses (its src/lib/eligibility/constants.ts, Batch 8): each year is
 * a ROW with the instant it takes over, and a selector picks the row in force at the moment of
 * the call. A next-year row is loaded the day the agency publishes it and sits INERT until its
 * effective instant. Nothing flips early: a December 31 question is answered with that year's
 * figures.
 *
 *     ssaFor(now)       the SSI row in force at `now`
 *     medicareFor(now)  the Medicare row in force at `now`; an empty (null) slot is answered
 *                       from the row before, and the year it came from is in `figureYear`
 *
 * WHY THIS FILE EXISTS ON COVEREDUSA. The Part B premium and its year used to be two constants
 * in medicare-savings.ts, and check:constants failed every build from January 1 until somebody
 * rolled them by hand, including the daily drip-publish. CMS publishes the next year's Part B
 * premium in November; a dated row lets it go in the day it is published and take over on
 * January 1 on its own. The guard now nags from December 1 about any slot CMS has published
 * that nobody has filled, and it never fails a production build because the calendar turned
 * over (scripts/check-federal-constants.mjs).
 *
 * Adding a year: add the row with every value's primary-source quote, leave anything the agency
 * has not published as `null` (never an estimate), and run `npm run check:constants`.
 *
 * Read the figures through the selectors at the time of the question. Pages that print one also
 * print the year it belongs to (`figureYear`), so a carried 2026 value is never labelled 2027.
 */

/** An instant with its offset. Rows take over at midnight Eastern. */
type Instant = string;

/* ============================================================================
 * SSI (Social Security Administration)
 * ==========================================================================*/

export interface SsaYear {
  year: number;
  effective: Instant;
  /** SSI federal benefit rate for an individual. 300% of it is the nursing-home special income
   *  level (42 CFR 435.1005). */
  ssiIndividualMonthly: number;
}

/** Rows in effective order. check:constants fails if they are not. */
export const SSA_BY_YEAR: readonly SsaYear[] = [
  /* 2026. ssa.gov/oact/cola/SSIamts.html: "2026 2.8% 994.00 1,491.00" (read by the audit critic,
     W9_critic_W8 on W8-10). */
  { year: 2026, effective: '2026-01-01T00:00:00-05:00', ssiIndividualMonthly: 994 },
  /* 2027, published 2026-10-14. ssa.gov/oact/cola/SSIamts.html: "2027 3.6% 1,029.00 1,544.00";
     "For 1984 and later, the amounts were effective for January" (W9_critic_W8 on W8-10, and
     W9_critic_W1: "The monthly maximum Federal amounts for 2027 are $1,029 for an eligible
     individual"). */
  { year: 2027, effective: '2027-01-01T00:00:00-05:00', ssiIndividualMonthly: 1029 },
];

/* ============================================================================
 * MEDICARE (CMS)
 * ==========================================================================*/

/** Every dated Medicare figure. `null` = CMS has not published it yet. Field names match
 *  BenefitsUSA's table, so the two sites can be checked against each other. */
export interface MedicareYearRow {
  year: number;
  effective: Instant;
  partBPremiumMonthly: number | null;
  partBDeductibleAnnual: number | null;
  /** Per BENEFIT PERIOD, not per year. */
  partADeductiblePerBenefitPeriod: number | null;
  /** Part A premium for someone with fewer than 30 quarters; 30-39 quarters below. */
  partAPremiumMonthlyFull: number | null;
  partAPremiumMonthlyReduced: number | null;
  irmaaFirstTierSingle: number | null;
  irmaaFirstTierJoint: number | null;
  /** Inflation Reduction Act out-of-pocket cap on covered Part D drugs. */
  partDOopCap: number | null;
  /** Extra Help copays between 100% and 150% FPL; the Dual pair at or under 100% FPL. */
  extraHelpCopayGeneric: number | null;
  extraHelpCopayBrand: number | null;
  extraHelpDualCopayGeneric: number | null;
  extraHelpDualCopayBrand: number | null;
  /** National base beneficiary premium, the basis of the Part D late-enrollment penalty. */
  partDBaseBeneficiaryPremium: number | null;
  /** Medicare Advantage out-of-pocket ceilings: in-network and combined, never merged. */
  maMoopInNetworkMax: number | null;
  maMoopCombinedMax: number | null;
  /** High-deductible Plan F/G deductible, and the Plan K / L out-of-pocket limits. */
  medigapHighDeductible: number | null;
  medigapPlanKOopLimit: number | null;
  medigapPlanLOopLimit: number | null;
  /** Medicare appeals amount in controversy: ALJ hearing and federal court. */
  appealsAljAmount: number | null;
  appealsFederalCourtAmount: number | null;
  /** Countable-resource limits. These change January 1; the INCOME limits follow the poverty
   *  guidelines instead. Extra Help's include the $1,500-per-person burial allowance. */
  mspResourceSingle: number | null;
  mspResourceCouple: number | null;
  extraHelpResourceSingle: number | null;
  extraHelpResourceCouple: number | null;
  /** SSA's estimate of what Extra Help costs the program a year (Pub. 05-10508). Not savings. */
  extraHelpAnnualValueSsa: number | null;
}

export type MedicareField = Exclude<keyof MedicareYearRow, 'year' | 'effective'>;

/** Rows in effective order. The first row must be complete. */
export const MEDICARE_BY_YEAR: readonly MedicareYearRow[] = [
  /* 2026 (each re-verified by the audit, W2_medicare / W9_critic_W2). CMS 2026 Parts A & B fact
     sheet (2025-11-14): "will be $202.90 for 2026 ... will be $283 in 2026", "$1,736 in 2026 ...
     $565 a month in 2026 ... $311 in 2026"; IRMAA first tier $109,000 / $218,000. CY2027 Rate
     Announcement Table V-2, 2026 column: cap $2,100, copays $5.10 / $12.65, duals $1.60 / $4.90.
     CMS memo 2026-07-28: "$38.99". Final CY2026 Part C bid memo Table 3: $9,250 / $13,900. CMS
     CY2026 Medigap notices: $2,950; K $8,000, L $4,000. 91 FR 2026-19016: "$1,960 for CY 2026",
     ALJ $200. medicare.gov MSP page, "limits for 2026": $9,950 / $14,910. CMS CY2026 LIS memo
     (2025-10-31): $18,090 / $36,100 with burial. SSA Pub. 05-10508, January 2026: about $5,700. */
  {
    year: 2026,
    effective: '2026-01-01T00:00:00-05:00',
    partBPremiumMonthly: 202.90,
    partBDeductibleAnnual: 283,
    partADeductiblePerBenefitPeriod: 1736,
    partAPremiumMonthlyFull: 565,
    partAPremiumMonthlyReduced: 311,
    irmaaFirstTierSingle: 109000,
    irmaaFirstTierJoint: 218000,
    partDOopCap: 2100,
    extraHelpCopayGeneric: 5.10,
    extraHelpCopayBrand: 12.65,
    extraHelpDualCopayGeneric: 1.60,
    extraHelpDualCopayBrand: 4.90,
    partDBaseBeneficiaryPremium: 38.99,
    maMoopInNetworkMax: 9250,
    maMoopCombinedMax: 13900,
    medigapHighDeductible: 2950,
    medigapPlanKOopLimit: 8000,
    medigapPlanLOopLimit: 4000,
    appealsAljAmount: 200,
    appealsFederalCourtAmount: 1960,
    mspResourceSingle: 9950,
    mspResourceCouple: 14910,
    extraHelpResourceSingle: 18090,
    extraHelpResourceCouple: 36100,
    extraHelpAnnualValueSsa: 5700,
  },
  /* 2027. Published so far (quotes from the audit's critic file, W9_critic_W2):
     - CY2027 Rate Announcement (2026-04-06) Table V-2: "Out-of-Pocket Threshold $2,100 $2,400 ...
       Up to or at 100% FPL ... $1.60 $1.65 / Other $4.90 $5.00 ... Between 100% and 150% of FPL
       ... $5.10 $5.80 / Other $12.65 $14.40."
     - CMS memo 2026-07-28: "$38.99 x 1.06 = $41.33 ... the Part D BBP for CY 2027 is $41.33."
     - Final CY2027 Part C bid review memo (2026-04-22) Table 3: "$7,151 to $9,850 In-network ...
       $7,151 to $14,800 Combined." (CMS's MA mailbox host, not cms.gov.)
     - CMS CY2027 Medigap notices: "the annual deductible amount for these three plans is
       $3,050"; "The 2027 out-of-pocket (OOP) limits for Medigap plans K & L are $8,360 and
       $4,180."
     - 91 FR 2026-19016 (2026-09-16): ALJ "will remain $200 for calendar year (CY) 2027", judicial
       review "will increase from $1,960 for CY 2026 to $2,000 for CY 2027".
     NOT PUBLISHED on 2026-10-16, deliberately empty (never estimate them): Part A and Part B
     premiums and deductibles and IRMAA (CMS fact sheet, usually mid-November), the MSP and Extra
     Help resource limits (CMS LIS memo, about October 31), SSA's 2027 Extra Help value (January).
     check:constants nags from December 1 while any of them is still empty. */
  {
    year: 2027,
    effective: '2027-01-01T00:00:00-05:00',
    partBPremiumMonthly: null,
    partBDeductibleAnnual: null,
    partADeductiblePerBenefitPeriod: null,
    partAPremiumMonthlyFull: null,
    partAPremiumMonthlyReduced: null,
    irmaaFirstTierSingle: null,
    irmaaFirstTierJoint: null,
    partDOopCap: 2400,
    extraHelpCopayGeneric: 5.80,
    extraHelpCopayBrand: 14.40,
    extraHelpDualCopayGeneric: 1.65,
    extraHelpDualCopayBrand: 5.00,
    partDBaseBeneficiaryPremium: 41.33,
    maMoopInNetworkMax: 9850,
    maMoopCombinedMax: 14800,
    medigapHighDeductible: 3050,
    medigapPlanKOopLimit: 8360,
    medigapPlanLOopLimit: 4180,
    appealsAljAmount: 200,
    appealsFederalCourtAmount: 2000,
    mspResourceSingle: null,
    mspResourceCouple: null,
    extraHelpResourceSingle: null,
    extraHelpResourceCouple: null,
    extraHelpAnnualValueSsa: null,
  },
];

/** A Medicare row with every slot answered. `figureYear[f]` is the year the value in `f` belongs
 *  to: this row's year, or an earlier one where this row's slot is still empty. Copy that pairs a
 *  year with a figure prints `figureYear[f]`, never `year`. */
export type MedicareFigures = { year: number; effective: Instant } & Record<MedicareField, number> & {
  figureYear: Record<MedicareField, number>;
  /** The empty slots this row answered from an earlier one. check:constants prints them. */
  fallbacks: readonly { field: MedicareField; fromYear: number }[];
};

/* ============================================================================
 * THE SELECTORS
 * ==========================================================================*/

function indexInForce(rows: readonly { effective: Instant }[], now: Date): number {
  const t = now.getTime();
  let found = -1;
  for (let i = 0; i < rows.length; i++) {
    if (Date.parse(rows[i].effective) <= t) found = i;
  }
  return found;
}

function noRow(table: string, now: Date): Error {
  return new Error(`${table}: no row is in force at ${now.toISOString()}. Add the row to src/lib/eligibility/constants.ts.`);
}

/** The SSI row in force at `now`. */
export function ssaFor(now: Date = new Date()): SsaYear {
  const i = indexInForce(SSA_BY_YEAR, now);
  if (i < 0) throw noRow('SSA_BY_YEAR', now);
  return SSA_BY_YEAR[i];
}

/** The nursing-home (institutional) Medicaid income limit in force at `now`: 300% of the SSI
 *  federal benefit rate, the most a state may use and still get federal match (42 CFR 435.1005:
 *  income that "does not exceed 300 percent" of the SSI amount). $2,982 a month in 2026, $3,087
 *  from January 1, 2027. Most states use it; some use medically needy rules instead. */
export function nursingHomeIncomeLimitMonthly(now: Date = new Date()): { amount: number; year: number } {
  const row = ssaFor(now);
  return { amount: 3 * row.ssiIndividualMonthly, year: row.year };
}

const MEDICARE_FIELDS = Object.keys(MEDICARE_BY_YEAR[0]).filter(
  (k) => k !== 'year' && k !== 'effective',
) as MedicareField[];

const resolvedMedicare = new Map<number, MedicareFigures>();
function resolveMedicare(i: number): MedicareFigures {
  const cached = resolvedMedicare.get(i);
  if (cached) return cached;
  const row = MEDICARE_BY_YEAR[i];
  const values = {} as Record<MedicareField, number>;
  const figureYear = {} as Record<MedicareField, number>;
  const fallbacks: { field: MedicareField; fromYear: number }[] = [];
  for (const f of MEDICARE_FIELDS) {
    let j = i;
    while (j >= 0 && MEDICARE_BY_YEAR[j][f] === null) j--;
    if (j < 0) throw new Error(`MEDICARE_BY_YEAR: ${f} has no value in ${row.year} or any earlier row.`);
    values[f] = MEDICARE_BY_YEAR[j][f] as number;
    figureYear[f] = MEDICARE_BY_YEAR[j].year;
    if (j !== i) fallbacks.push({ field: f, fromYear: MEDICARE_BY_YEAR[j].year });
  }
  const out: MedicareFigures = { year: row.year, effective: row.effective, ...values, figureYear, fallbacks };
  resolvedMedicare.set(i, out);
  return out;
}

/** The Medicare figures in force at `now`, every slot answered (see MedicareFigures). */
export function medicareFor(now: Date = new Date()): MedicareFigures {
  const i = indexInForce(MEDICARE_BY_YEAR, now);
  if (i < 0) throw noRow('MEDICARE_BY_YEAR', now);
  return resolveMedicare(i);
}

/** The Medicare figures for a named year, or undefined if the table does not hold it. */
export function medicareForYear(year: number): MedicareFigures | undefined {
  const i = MEDICARE_BY_YEAR.findIndex((r) => r.year === year);
  return i < 0 ? undefined : resolveMedicare(i);
}
