/**
 * facts-2026.ts — Canonical Fact Registry for CoveredUSA
 *
 * Single source of truth for every dollar amount, percentage, date, and
 * statute referenced anywhere on the site (blog articles, programmatic pages,
 * schema markup, screener logic, analyzer messaging).
 *
 * Why this exists:
 * Multiple parallel article-writer agents doing independent web research will
 * surface different "current" numbers (2024 FPL vs 2025 FPL vs 2026 FPL).
 * Without a registry, the corpus drifts. With a registry, every page that
 * cites a number imports from here, and the annual refresh is one PR.
 *
 * Every fact in this file:
 *   - Has a `source_url` pointing to the primary government source
 *   - Has a `verified_date` (when a human last confirmed against the source)
 *   - Has a `usage_notes` field explaining WHEN to use this value vs another
 *     (this matters most for FPL: Medicaid uses current-year, ACA marketplace
 *     uses prior-year)
 *
 * Annual refresh workflow:
 *   1. HHS publishes new poverty guidelines (mid-January)
 *   2. CMS publishes new Medicare premiums/deductibles (mid-November)
 *   3. Update the relevant section here
 *   4. Run the verifier batch script against content/blog/* to flag stale articles
 *   5. Regenerate flagged articles via the cron with the new facts file
 */

// ─── FEDERAL POVERTY LEVEL ─────────────────────────────────────────────────
//
// CRITICAL USAGE RULE (this is the #1 source of fact drift on the site):
//
//   - For Medicaid / CHIP eligibility: use FPL for the CURRENT calendar year
//     (in 2026, that's FPL_2026 below).
//
//   - For ACA Marketplace plans (premium tax credits, cost-sharing reductions):
//     use the PRIOR year's FPL. Marketplace plans for plan year 2026 (purchased
//     during Nov 2025-Jan 2026 OEP) were determined using FPL_2025.
//     Plans for 2027 (OEP Nov 2026-Jan 2027) will use FPL_2026.
//
//   - For charity care / 501(r) hospital eligibility: hospitals publish their
//     own policies, typically referencing the most recent FPL. Cite the
//     hospital's policy date when known.

export const FPL_2026 = {
  effective: '2026-01-17',
  source_url: 'https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines',
  verified_date: '2026-05-12',
  usage_notes:
    'Use for 2026 Medicaid/CHIP eligibility. Do NOT use for 2026 ACA marketplace plans (those used FPL_2025). Use this for 2027 marketplace plans.',

  // 48 contiguous states + DC
  contiguous: {
    1: 15960,
    2: 21640,
    3: 27320,
    4: 33000,
    5: 38680,
    6: 44360,
    7: 50040,
    8: 55720,
    each_additional_person: 5680,
  },
  alaska: {
    1: 19950,
    2: 27050,
    3: 34150,
    4: 41250,
    5: 48350,
    6: 55450,
    7: 62550,
    8: 69650,
    each_additional_person: 7100,
  },
  hawaii: {
    1: 18360,
    2: 24890,
    3: 31420,
    4: 37950,
    5: 44480,
    6: 51010,
    7: 57540,
    8: 64070,
    each_additional_person: 6530,
  },
} as const;

export const FPL_2025 = {
  effective: '2025-01-17',
  source_url: 'https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines/prior-hhs-poverty-guidelines-federal-register-references/2025-poverty-guidelines-computations',
  verified_date: '2026-05-12',
  usage_notes:
    'Use ONLY for ACA marketplace plans purchased during Nov 2025-Jan 2026 OEP (plan year 2026). For Medicaid/CHIP in 2026, use FPL_2026.',

  contiguous: {
    1: 15650,
    2: 21150,
    3: 26650,
    4: 32150,
    5: 37650,
    6: 43150,
    7: 48650,
    8: 54150,
    each_additional_person: 5500,
  },
  alaska: {
    1: 19550,
    2: 26430,
    3: 33310,
    4: 40190,
    5: 47070,
    6: 53950,
    7: 60830,
    8: 67710,
    each_additional_person: 6880,
  },
  hawaii: {
    1: 17990,
    2: 24320,
    3: 30650,
    4: 36980,
    5: 43310,
    6: 49640,
    7: 55970,
    8: 62300,
    each_additional_person: 6330,
  },
} as const;

// Helper: common percent-of-FPL thresholds for content that says
// "X% of FPL = $Y for a household of Z" (the most common drift pattern).
// All figures rounded to nearest dollar, household-of-1, 48 contiguous states.
export const FPL_2026_THRESHOLDS_HH1_48 = {
  100: 15960,
  133: 21227, // Medicaid expansion line in expansion states (effectively 138%)
  138: 22025, // Medicaid expansion w/ 5% income disregard
  150: 23940,
  200: 31920,
  250: 39900,
  300: 47880,
  400: 63840, // The "subsidy cliff" — see ACA_2026 below
} as const;

// ─── MEDICARE 2026 ─────────────────────────────────────────────────────────
// Source: CMS Newsroom Fact Sheet, published Nov 14, 2025
// https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles

export const MEDICARE_2026 = {
  effective: '2026-01-01',
  source_url: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
  verified_date: '2026-05-12',

  part_a: {
    inpatient_deductible: 1736, // per benefit period
    daily_coinsurance_days_61_90: 434,
    daily_coinsurance_days_91_plus: 868, // lifetime reserve days
    snf_daily_coinsurance_days_21_100: 217,
    premium_no_qualifying_employment: 545, // <30 quarters of Medicare-covered employment
    premium_30_39_quarters: 300,
  },

  part_b: {
    standard_monthly_premium: 202.90,
    annual_deductible: 283,
  },

  part_d: {
    insulin_monthly_cost_cap: 35, // per Inflation Reduction Act 2022, effective 2023
    annual_oop_cap: 2100, // Part D out-of-pocket maximum 2026 (was $2,000 in 2025)
  },

  irmaa_2026: {
    // Income thresholds based on 2024 MAGI (2 years lookback)
    // Source: same CMS fact sheet
    single_threshold_low: 109000, // above this, first IRMAA tier kicks in
    single_threshold_high: 205000,
    joint_threshold_low: 218000,
    joint_threshold_high: 410000,
    part_b_premium_range_low: 284.10, // first IRMAA tier
    part_b_premium_range_high: 689.90, // top IRMAA tier
  },
} as const;

// ─── ACA / MARKETPLACE 2026 ────────────────────────────────────────────────
//
// CRITICAL POLICY CHANGE (this is the #2 source of stale content on the site):
//
// The enhanced Premium Tax Credits from the American Rescue Plan Act 2021
// (extended by the Inflation Reduction Act 2022) expired January 1, 2026.
//
// What this means for 2026 plans:
//   1. The "subsidy cliff" at 400% FPL has RETURNED. People earning >400% FPL
//      now get $0 in subsidies, no matter how expensive their plan is.
//   2. Applicable percentage of income contribution has reverted to pre-ARPA
//      schedule (people earning 100-150% FPL no longer have $0 premiums).
//   3. The 2025 budget reconciliation law ALSO eliminated tax credit repayment
//      limits — enrollees who underestimate income must repay the FULL
//      excess credit at tax time.
//
// Any article on coveredusa.org that says enhanced PTCs are "currently in
// effect" or "extended through 2025" is now outdated and should be flagged.

export const ACA_2026 = {
  effective: '2026-01-01',
  source_urls: [
    'https://www.healthinsurance.org/blog/marketplace-enrollees-face-return-of-the-subsidy-cliff/',
    'https://www.kff.org/affordable-care-act/8-things-to-watch-for-the-2026-aca-open-enrollment-period/',
    'https://www.congress.gov/crs-product/R48290',
  ],
  verified_date: '2026-05-12',

  subsidy_cliff: {
    status: 'returned',
    threshold_fpl_percent: 400,
    notes:
      'Enhanced PTCs from ARPA/IRA expired Jan 1, 2026. For 2026 plans, households with income >400% FPL receive no premium tax credit regardless of plan cost.',
  },

  excess_credit_repayment: {
    status: 'no_limit_for_2026',
    notes:
      '2025 budget reconciliation law eliminated repayment limits starting tax year 2026. Enrollees who underestimate income must repay the full excess credit.',
  },

  // Applicable percentage of income at each FPL band, for 2026 plans
  // These reverted from the enhanced ARPA/IRA values to the pre-ARPA schedule.
  // Households contribute this % of income toward the benchmark plan; PTC covers the rest.
  applicable_percentages_2026: {
    '100-150_fpl': 2.07, // approx; varies slightly with inflation adjustment
    '150-200_fpl': '2.07 to 4.14',
    '200-250_fpl': '4.14 to 6.52',
    '250-300_fpl': '6.52 to 8.33',
    '300-400_fpl': 9.96,
    'above_400_fpl': null, // ineligible
  },

  open_enrollment_2026: {
    start: '2025-11-01',
    end: '2026-01-15',
    notes: 'For 2026 plan year. Next OEP (for 2027 plans) starts Nov 1, 2026.',
  },

  // Average premium impact per KFF analysis
  premium_impact_2026: {
    average_oop_premium_increase_percent: 114,
    avg_annual_premium_2025: 888,
    avg_annual_premium_2026_projected: 1904,
    coverage_loss_estimate: 4800000,
  },
} as const;

// ─── MEDICAID EXPANSION STATUS ────────────────────────────────────────────
// As of May 2026: 40 states + DC have expanded; 10 states have not.
// Source: KFF Medicaid expansion tracker

export const MEDICAID_EXPANSION = {
  verified_date: '2026-05-12',
  source_url: 'https://www.kff.org/medicaid/issue-brief/status-of-state-medicaid-expansion-decisions/',

  expanded_states: [
    'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'HI', 'ID', 'IL', 'IN',
    'IA', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MO', 'MT', 'NE', 'NV',
    'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SD',
    'UT', 'VT', 'VA', 'WA', 'WV',
  ],
  non_expansion_states: [
    'AL', 'FL', 'GA', 'KS', 'MS', 'SC', 'TN', 'TX', 'WI', 'WY',
  ],
  recent_expansions: [
    { state: 'NC', effective: '2023-12-01' },
    { state: 'SD', effective: '2023-07-01' },
  ],
  expansion_income_limit_pct_fpl: 138, // 133% + 5% disregard = 138% effective
} as const;

// ─── KEY STATUTES ─────────────────────────────────────────────────────────
// Always reference statutes by their exact name + year. The most common
// drift is "Inflation Reduction Act of 2023" (wrong) vs 2022 (correct).

export const STATUTES = {
  ACA: {
    full_name: 'Patient Protection and Affordable Care Act',
    short_name: 'ACA',
    signed: '2010-03-23',
    public_law: 'P.L. 111-148',
    notes: 'Often referred to as "Obamacare." Established the Health Insurance Marketplace.',
  },
  ARPA: {
    full_name: 'American Rescue Plan Act of 2021',
    short_name: 'ARPA',
    signed: '2021-03-11',
    public_law: 'P.L. 117-2',
    notes: 'Temporarily enhanced ACA premium tax credits (2021-2022), removed 400% FPL cliff during that window.',
  },
  IRA: {
    full_name: 'Inflation Reduction Act of 2022',
    short_name: 'IRA',
    signed: '2022-08-16',
    public_law: 'P.L. 117-169',
    notes:
      'Extended ARPA enhanced PTCs through 2025. Capped Medicare Part D insulin at $35/mo (effective 2023-01-01). Capped Medicare Part D OOP at $2,000 (effective 2025-01-01).',
    insulin_cap_effective: '2023-01-01',
    part_d_oop_cap_effective: '2025-01-01',
  },
  NO_SURPRISES_ACT: {
    full_name: 'No Surprises Act',
    short_name: 'NSA',
    signed: '2020-12-27', // as part of Consolidated Appropriations Act 2021
    effective: '2022-01-01',
    notes: 'Bans most surprise out-of-network bills for emergency care and certain non-emergency care at in-network facilities.',
    consumer_helpline: '1-800-985-3059',
  },
  IRC_501R: {
    full_name: 'Internal Revenue Code § 501(r)',
    short_name: '501(r)',
    enacted_via: 'ACA',
    enacted_date: '2010-03-23',
    notes:
      'Requires 501(c)(3) nonprofit hospitals to have a written Financial Assistance Policy (FAP), limit charges for FAP-eligible patients to "amounts generally billed," wait 120 days before initiating collection actions, and not engage in extraordinary collection actions for 240 days after first billing statement.',
    fap_billing_wait_period_days: 120,
    ecal_protection_period_days: 240,
    irs_complaint_form: 'Form 13909',
    civil_penalty_for_violation: 50000,
  },
  FDCPA: {
    full_name: 'Fair Debt Collection Practices Act',
    short_name: 'FDCPA',
    signed: '1977-09-20',
    notes: 'Restricts third-party debt collector practices. Applies to medical debt sent to collections.',
  },
  CFPB_MEDICAL_DEBT_RULE: {
    full_name: 'CFPB Medical Debt Credit Reporting Rule',
    short_name: 'CFPB Medical Debt Rule',
    issued: '2025-01-07',
    notes:
      'Removed medical debt from credit reports. Status as of May 2026: PARTIALLY VACATED by federal court (Texas, July 2025). Verify current legal status before citing in articles.',
    needs_revalidation: true,
  },
} as const;

// ─── COMMONLY-REFERENCED HCPCS CODES ──────────────────────────────────────
// Public-domain Level II HCPCS codes the site references for procedure/drug
// pages. Do NOT add AMA CPT codes here (licensed, $3K/year, not worth it).

export const HCPCS_CODES = {
  insulin: {
    J1815: {
      description: 'Injection, insulin, per 5 units',
      type: 'short-acting',
      examples: ['regular insulin (Humulin R, Novolin R)'],
      typical_inpatient_doses_per_day: '4-12 units (sliding scale)',
    },
    J1817: {
      description: 'Insulin for administration through DME (i.e., insulin pump) per 50 units',
      type: 'pump',
      notes: 'Billed differently than vial-based J1815. Used for continuous subcutaneous insulin infusion.',
    },
  },
  // Add more as procedure/drug pages are built. Each entry should be a real
  // HCPCS code with a public-domain definition from CMS.
} as const;

// ─── REGISTRY METADATA ────────────────────────────────────────────────────
// For tooling that wants to enumerate all facts or do bulk verification.

export const FACT_REGISTRY_VERSION = '2026.05.12';
export const FACT_REGISTRY_LAST_AUDITED = '2026-05-12';
