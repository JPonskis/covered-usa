/**
 * check:medicaid-limits: the Medicaid/CHIP state rows and the Wisconsin/Georgia adult branches
 * (eligibility audit 2026-10, item A5A6A7-cusa, the CoveredUSA mirror of BenefitsUSA's 9ea08f27).
 *
 * WHY THIS EXISTS. The audit found the child limit materially wrong in 8 of 51 jurisdictions at
 * the state's own source, in BOTH directions: Alabama, Connecticut and Massachusetts told
 * families with eligible kids "no", while Delaware and Oklahoma told families "yes" above the
 * real line. On CoveredUSA that one field drives two cards, Medicaid and CHIP (chip.ts reads it
 * as the CHIP ceiling), so a wrong row was wrong twice. Pregnancy limits were wrong in Oklahoma,
 * Alabama, Kentucky and Maryland. And every Wisconsin and Georgia adult was told they could not
 * get Medicaid at any income, because the branches tested `isExpansionState` and never read the
 * state's own adult limit. None of it errored. The fix is data plus branches; this gate holds both.
 *
 * The rows are the SAME rows BenefitsUSA ships (W9_critic_W8 diffed all 51 files on these fields:
 * identical before the fix), and parts A and B pin exactly the values BenefitsUSA's own
 * check:medicaid-limits pins, so a change to one site's rows fails here until both agree.
 *
 * WHAT IT CHECKS.
 *  A. The rows confirmed at the state's own source, each with its citation.
 *  B. The CONVENTION: every limit includes the 5-point MAGI disregard (42 CFR 435.603(d)(4)).
 *     The 17 child rows that were low by exactly the disregard are pinned at the normalized value.
 *  C. BEHAVIOUR, by running the real engine (Medicaid, ACA and CHIP) on the critic files' people.
 *     Pinning the data is not enough on its own: the Wisconsin bug was a branch that ignored
 *     correct-looking data.
 *  D. The hub page copy that describes the same rules.
 * ADDED BY medicaid-gaps (2026-10-16):
 *  A2. The rows the first pass left for a state source: Minnesota children, and the pregnancy
 *      rows for 22 states (Colorado and Texas, whose top band is CHIP, plus the rows that were low
 *      by exactly the disregard), each pinned with the quote from that state's own current chart,
 *      and the people between the old and new line run through the engine.
 *  G.  Grandfamilies: the child is tested before the 65+ branch, and a household over the
 *      children's limit gets the relative-caregiver 'maybe' in the same words on both sites.
 *      Here also: the CHIP card over the line is a no that names the child-only application,
 *      not the old +20-point "deductions" maybe.
 * ADDED BY cusa-total-double-count (2026-10-16):
 *  T.  One child, one count. The Medicaid card's children's answer and the CHIP card priced the same
 *      children, so the total counted each child twice. The whole engine is run on the audit's
 *      people and swept over every state; the CHIP card adds $0 when the Medicaid card already
 *      carries the children, and keeps them when the Medicaid card is a mother's pregnancy coverage.
 * ADDED BY totals-followups (2026-10-16):
 *  U.  Same household, same total on both sites. The ACA card priced a single parent's child as a
 *      second adult (now BenefitsUSA's estimate, pinned in check:aca-coverage-year), and BenefitsUSA
 *      counted a pregnant mother's children zero times (fixed there). The health total for each of
 *      these households is pinned at the SAME literal BenefitsUSA's check:medicaid-limits pins.
 */
import { readFileSync } from 'node:fs';
import { checkMedicaid } from '../src/lib/eligibility/programs/medicaid.ts';
import { checkACA } from '../src/lib/eligibility/programs/aca.ts';
import { checkCHIP } from '../src/lib/eligibility/programs/chip.ts';
import { checkEligibility } from '../src/lib/eligibility/index.ts';
import { getFPL } from '../src/lib/eligibility/fpl.ts';
import { getStateData, ALL_STATES } from '../src/lib/states/index.ts';

let failures = 0;
let passes = 0;
const check = (label, cond, detail) => {
  if (cond) { passes++; return; }
  failures++;
  console.log(`  FAIL  ${label}\n        ${detail}`);
};
const md = (st) => getStateData(st)?.medicaid ?? {};

// ── A. Rows confirmed at the state's own source (W9_critic_W5, W9_critic_W8) ──────────────────
const SOURCED = [
  ['AL', 'childLimitFpl', 317, 'ADPH "ALL Kids Monthly Income Guidelines Effective 2/1/2026": family of 4 to $8,718/mo = 317%. The chart includes the disregard (its Medicaid column, $4,015 = 146%, is the old 141 + 5).'],
  ['AZ', 'childLimitFpl', 230, 'AHCCCS KidsCare: $6,188/mo for 4 = 225% of the 2026 guidelines, printed without the disregard. 225 + 5.'],
  ['CT', 'childLimitFpl', 323, 'DSS "HUSKY Health Program Annual Income Guidelines, effective March 1, 2026": HUSKY B Band 2 to $106,590 for 4 = 323%. The chart includes the disregard (HUSKY D adults read 138%).'],
  ['DE', 'childLimitFpl', 217, 'DSSM 18400: Delaware Healthy Children Program "may not exceed 212%"; DHSS 2026 chart $5,830/mo for 4. 212 + 5. This row was 266 and told families yes above the real line.'],
  ['LA', 'childLimitFpl', 255, 'LDH: LaCHIP Affordable Plan $7,013/mo for 4 = 255% (Phase V is 250% + the disregard).'],
  ['MA', 'childLimitFpl', 305, '130 CMR 505.005(B)(1)(b): Family Assistance children "greater than 150 and less than or equal to 300%". 300 + 5.'],
  ['OK', 'childLimitFpl', 211, 'OHCA "SoonerCare and Insure Oklahoma Income Guidelines - 2026", children effective 4/1/2026: $5,802/mo for 4 = 211%. Already includes the disregard (expansion adults read $1,848 = 139%). This row was 300.'],
  ['TN', 'childLimitFpl', 255, 'TN CoverKids: "at or below 250%", $82,500 for 4. 250 + 5.'],
  ['OK', 'pregnantLimitFpl', 211, 'OHCA "Pregnant Women - Full Scope Benefits (effective: 4/1/2026)": $3,806/mo for 2 = 211%. This row was 138.'],
  ['AL', 'pregnantLimitFpl', 317, 'ADPH "ALL Babies Monthly Income Guidelines Effective 2/1/2026": to $5,717/mo for 2 = 317% (CHIP for pregnant women).'],
  ['KY', 'pregnantLimitFpl', 218, 'KY Medicaid table effective 4/1/2026: "200-218% FPL Medicaid for children and pregnant women who are uninsured".'],
  ['MD', 'pregnantLimitFpl', 264, 'MDH "Monthly Income Limit Effective February 1, 2026": pregnant $4,763/mo for 2 = 264%. Already includes the disregard (adults read $1,835 = 138%). This row was 322, the CHILDREN\'s figure.'],
  ['CA', 'pregnantLimitFpl', 322, 'DHCS "Who Qualifies for MCAP?", Income Guidelines Effective January 1, 2026: 213% to 322%.'],
  ['MO', 'pregnantLimitFpl', 305, 'MO DSS manual 1855.010.00: Show-Me Healthy Babies "no greater than three hundred percent (300%)". 300 + 5.'],
  ['WI', 'adultLimitFpl', 100, 'WI DHS "BadgerCare Plus income limits and thresholds, effective February 1, 2026-January 31, 2027": "Adult monthly income limit (100% FPL)".'],
  ['GA', 'adultLimitFpl', 100, 'pathways.georgia.gov/eligibility: "Have a household income of up to 100% of the Federal Poverty Level".'],
];
for (const [st, field, want, source] of SOURCED) {
  check(`A  ${st} ${field} = ${want}`, md(st)[field] === want, `got ${md(st)[field]}. Source: ${source}`);
}
{
  const ga = md('GA').adultActivityRequirement;
  check('A  GA adultActivityRequirement = Georgia Pathways, 80 hours a month',
    ga?.programName === 'Georgia Pathways' && ga?.hoursPerMonth === 80 && ga?.url === 'https://pathways.georgia.gov',
    `got ${JSON.stringify(ga)}. Source: pathways.georgia.gov/eligibility, "Complete at least 80 hours of qualifying activities per month".`);
  const bands = { AL: 146, KY: 200, CA: 213, MO: 196 };
  for (const [st, above] of Object.entries(bands)) {
    check(`A  ${st} pregnantUpperBand.aboveFpl = ${above}`, md(st).pregnantUpperBand?.aboveFpl === above,
      `got ${JSON.stringify(md(st).pregnantUpperBand)}`);
  }
}

// ── B. The disregard convention: the 17 rows that were low by exactly 5 points ────────────────
// KFF's January 2026 children's table (which includes the disregard) is the cross-check
// (scripts/kffdiff.py in the audit folder). Florida was 211 against KFF's 215, so it went to
// 215, not 216: a normalization must never land above the one figure we have.
const NORMALIZED = { CO: 265, FL: 215, GA: 252, IA: 307, KY: 218, MO: 305, MS: 214, NE: 218, NH: 323,
  NY: 405, OH: 211, RI: 266, SC: 213, SD: 209, TX: 206, WV: 305, WY: 205 };
for (const [st, want] of Object.entries(NORMALIZED)) {
  check(`B  ${st} childLimitFpl = ${want} (disregard included)`, md(st).childLimitFpl === want,
    `got ${md(st).childLimitFpl}. Every stored limit includes the 5-point MAGI disregard (states/types.ts).`);
}

// ── C. Behaviour: the critic files' people, through the real engine ──────────────────────────
// citizenshipStatus is left out, as every real CoveredUSA caller leaves it out.
const base = {
  age: 35, numChildren: 0, isPregnant: false, hasDisability: false, currentlyInsured: false,
  insuranceSource: 'none', employmentStatus: 'employed', isVeteran: false, annualIncome: 0,
  householdSize: 1, state: 'TX',
};
const person = (o) => ({ ...base, ...o });
const cav = (r) => (r.caveats ?? []).map((c) => c.id);

// Wisconsin: BadgerCare Plus covers adults to 100% FPL, outright.
{
  const inc = Math.round(getFPL(1, 90, 'WI'));
  const m = checkMedicaid(person({ state: 'WI', annualIncome: inc }));
  check('C  WI childless adult at 90% FPL: BadgerCare likely', m.eligibilityStatus === 'likely_eligible' && /BadgerCare/.test(m.reason),
    `got ${m.eligibilityStatus}: "${m.reason}". The non-expansion branch is ignoring Wisconsin's adult limit again.`);
  const work = (m.caveats ?? []).find((c) => c.id === 'medicaid_work');
  check('C  WI childless adult at 90% FPL: carries the Wisconsin work line, without 6-month renewals',
    !!work && work.state === 'WI' && work.renewEvery6Months === false, JSON.stringify(m.caveats));
  const a = checkACA(person({ state: 'WI', annualIncome: inc }));
  check('C  WI adult at 90% FPL: ACA routes to BadgerCare, $0', a.eligible === false && a.estimatedValue === 0 && /BadgerCare/.test(a.reason),
    `got ${a.eligibilityStatus} $${a.estimatedValue}: "${a.reason}"`);
  const w8 = checkMedicaid(person({ state: 'WI', annualIncome: 14000 }));
  check('C  WI Milwaukee adult $14,000 (W8-04): BadgerCare likely', w8.eligibilityStatus === 'likely_eligible',
    `got ${w8.eligibilityStatus}: "${w8.reason}"`);
  const parent = checkMedicaid(person({ state: 'WI', age: 30, householdSize: 2, annualIncome: Math.round(getFPL(2, 90, 'WI')), numChildren: 1 }));
  check('C  WI parent at 90% FPL: the household qualifies, not just the child', /Your household qualifies/.test(parent.reason),
    `got "${parent.reason}"`);
  const dis = checkMedicaid(person({ state: 'WI', age: 50, hasDisability: true, annualIncome: inc }));
  check('C  WI adult with a disability at 90% FPL: BadgerCare likely', dis.eligibilityStatus === 'likely_eligible',
    `got ${dis.eligibilityStatus}: "${dis.reason}"`);
  const over = checkMedicaid(person({ state: 'WI', annualIncome: Math.round(getFPL(1, 120, 'WI')) }));
  check('C  WI adult at 120% FPL: over the 100% limit, and told so', over.eligible === false && /100% FPL limit/.test(over.reason),
    `got ${over.eligibilityStatus}: "${over.reason}"`);
}

// Georgia Pathways: 100% FPL with 80 hours a month. 'maybe' with the hours stated, NEVER 'likely'.
{
  const inc = Math.round(getFPL(1, 90, 'GA'));
  const m = checkMedicaid(person({ state: 'GA', annualIncome: inc, age: 45 }));
  check('C  GA adult at 90% FPL: Pathways is a maybe', m.eligibilityStatus === 'may_qualify',
    `got ${m.eligibilityStatus}. A Pathways answer cannot be 'likely': the screener never asks about the hours.`);
  check('C  GA adult at 90% FPL: the 80 hours are stated', /Georgia Pathways/.test(m.reason) && /80 hours a month/.test(m.reason),
    `got "${m.reason}". Without the hours, this is a promise the state will not keep.`);
  check('C  GA adult at 90% FPL: no separate work caveat (the reason already states the hours in effect now)',
    !cav(m).includes('medicaid_work'), JSON.stringify(m.caveats));
  const a = checkACA(person({ state: 'GA', annualIncome: inc, age: 45 }));
  check('C  GA adult at 90% FPL: no credit (A1 holds), routed to Pathways, not "the coverage gap"',
    a.eligible === false && a.estimatedValue === 0 && /Pathways/.test(a.reason) && !/This is the coverage gap/.test(a.reason),
    `got ${a.eligibilityStatus} $${a.estimatedValue}: "${a.reason}"`);
  const w8 = checkMedicaid(person({ state: 'GA', annualIncome: 13000, age: 45 }));
  check('C  GA Atlanta adult $13,000 (W8-05): Pathways maybe', w8.eligibilityStatus === 'may_qualify', `got ${w8.eligibilityStatus}`);
  const parent = checkMedicaid(person({ state: 'GA', householdSize: 2, annualIncome: Math.round(getFPL(2, 90, 'GA')), numChildren: 1, age: 30 }));
  check('C  GA parent at 90% FPL: the child qualifies AND the parent hears about Pathways, with the hours',
    parent.eligibilityStatus === 'likely_eligible' && /You may qualify too: Georgia Pathways/.test(parent.reason) && /80 hours/.test(parent.reason) && !/Your household qualifies/.test(parent.reason),
    `got "${parent.reason}"`);
  const over = checkMedicaid(person({ state: 'GA', annualIncome: Math.round(getFPL(1, 120, 'GA')), age: 45 }));
  check('C  GA adult at 120% FPL: not eligible, over the Georgia Pathways limit',
    over.eligible === false && /100% FPL limit for Georgia Pathways/.test(over.reason), `got ${over.eligibilityStatus}: "${over.reason}"`);
  const overAca = checkACA(person({ state: 'GA', annualIncome: Math.round(getFPL(1, 120, 'GA')), age: 45 }));
  check('C  GA adult at 120% FPL: keeps the normal tax-credit test', overAca.eligibilityStatus === 'likely_eligible',
    `got ${overAca.eligibilityStatus}: "${overAca.reason}". Someone who cannot meet the hours is not Medicaid-eligible, so the credit stays.`);
}

// CONTROL: the other 8 non-expansion states keep the coverage gap exactly as A1 left it.
for (const st of ['TX', 'FL', 'AL', 'MS', 'SC', 'TN', 'KS', 'WY']) {
  const inc = Math.round(getFPL(1, 90, st));
  const m = checkMedicaid(person({ state: st, annualIncome: inc, age: 40 }));
  const a = checkACA(person({ state: st, annualIncome: inc, age: 40 }));
  check(`C  CONTROL ${st} childless adult at 90% FPL: still no Medicaid, still the coverage gap`,
    m.eligible === false && /has not expanded Medicaid/.test(m.reason) && a.estimatedValue === 0 && /This is the coverage gap/.test(a.reason),
    `medicaid ${m.eligibilityStatus} "${m.reason}" / aca $${a.estimatedValue} "${a.reason}"`);
}

// Children: Medicaid AND the CHIP card (chip.ts reads the same field as the CHIP ceiling).
{
  const fam = (st, annualIncome) => {
    const p = person({ state: st, householdSize: 4, annualIncome, numChildren: 2 });
    return { m: checkMedicaid(p), c: checkCHIP(p) };
  };
  const both = (r) => r.m.eligibilityStatus === 'likely_eligible' && r.c.eligibilityStatus === 'likely_eligible';
  const neither = (r) => r.m.eligibilityStatus !== 'likely_eligible' && r.c.eligibilityStatus !== 'likely_eligible';
  const show = (r) => `medicaid ${r.m.eligibilityStatus} "${r.m.reason}" / chip ${r.c.eligibilityStatus} "${r.c.reason}"`;
  check('C  OK family of 4 at OHCA\'s own $69,624: the kids qualify (Medicaid and CHIP)', both(fam('OK', 69624)),
    `${show(fam('OK', 69624))}. Storing 210 instead of 211 rejects families between $69,300 and $69,624.`);
  check('C  OK family of 4 at $75,000 (W5-05): over the line, neither card says likely', neither(fam('OK', 75000)), show(fam('OK', 75000)));
  check('C  OK family of 4 at $85,000 (W8-01): no longer "SoonerCare likely" plus "CHIP likely"', neither(fam('OK', 85000)), show(fam('OK', 85000)));
  check('C  DE family of 4 at DHSS\'s own $69,960 (212% x 12): the kids qualify', both(fam('DE', 69960)), show(fam('DE', 69960)));
  check('C  DE family of 4 at 225% FPL: over the line, neither card says likely', neither(fam('DE', Math.round(getFPL(4, 225, 'DE')))),
    show(fam('DE', Math.round(getFPL(4, 225, 'DE')))));
  check('C  AL family of 4 at $60,000 (W5-03, W8-01 Birmingham): ALL Kids covers them', both(fam('AL', 60000)), show(fam('AL', 60000)));
  check('C  AL family of 4 at $60,000: the CHIP card no longer says "exceeds the 141%"', !/141%/.test(fam('AL', 60000).c.reason), show(fam('AL', 60000)));
  check('C  MA family of 4 at $55,000 (W5-04): Family Assistance covers them', both(fam('MA', 55000)), show(fam('MA', 55000)));
  check('C  CT family of 4 at $100,000: HUSKY B covers them', both(fam('CT', 100000)), show(fam('CT', 100000)));
}

// Pregnancy, at HER family size (A4: herself plus the expected baby).
{
  const preg = (st, pct) => checkMedicaid(person({ state: st, annualIncome: Math.round(getFPL(2, pct, st)), age: 28, isPregnant: true }));
  const md290 = preg('MD', 290);
  check('C  MD pregnant at 290% FPL (size 2): over Maryland\'s 264%, not likely, and told HER test', md290.eligible === false && /264% FPL limit for pregnant women/.test(md290.reason) && /counts as 2 people/.test(md290.reason),
    `got ${md290.eligibilityStatus}: "${md290.reason}". 322 was the children's figure.`);
  const al200 = preg('AL', 200);
  check('C  AL pregnant at 200% FPL: likely, and the card names ALL Babies', al200.eligibilityStatus === 'likely_eligible' && /ALL Babies/.test(al200.reason),
    `got ${al200.eligibilityStatus}: "${al200.reason}"`);
  const al120 = preg('AL', 120);
  check('C  AL pregnant at 120% FPL: regular Medicaid, so NO ALL Babies note', al120.eligibilityStatus === 'likely_eligible' && !/ALL Babies/.test(al120.reason),
    `got "${al120.reason}". The band note belongs only to a woman above 146%.`);
  const ca260 = preg('CA', 260);
  check('C  CA pregnant at 260% FPL: likely, and the MCAP condition is stated', ca260.eligibilityStatus === 'likely_eligible' && /Medi-Cal Access Program/.test(ca260.reason) && /maternity/.test(ca260.reason),
    `got "${ca260.reason}". The critic allowed 322 only together with the MCAP condition line.`);
  const mo250 = preg('MO', 250);
  check('C  MO pregnant at 250% FPL: likely, as unborn-child coverage', mo250.eligibilityStatus === 'likely_eligible' && /Show-Me Healthy Babies/.test(mo250.reason) && /unborn child/.test(mo250.reason),
    `got "${mo250.reason}"`);
  const ok = checkMedicaid(person({ state: 'OK', householdSize: 2, annualIncome: 38000, age: 30, isPregnant: true }));
  check('C  OK Tulsa pregnant, household of 2, $38,000 (W8-02): qualifies', ok.eligibilityStatus === 'likely_eligible', `got ${ok.eligibilityStatus}: "${ok.reason}"`);
  const ky = preg('KY', 210);
  check('C  KY pregnant at 210% FPL: likely, with the uninsured condition stated', ky.eligibilityStatus === 'likely_eligible' && /uninsured/.test(ky.reason),
    `got "${ky.reason}"`);
  const az = preg('AZ', 170);
  check('C  CONTROL AZ pregnant at 170% (over AZ\'s 161%, which medicaid-gaps sourced at AHCCCS: 156 + 5): still no, and the reason names her own test',
    az.eligible === false && /161% FPL limit for pregnant women in Arizona/.test(az.reason), `got ${az.eligibilityStatus}: "${az.reason}"`);
  const tx = checkMedicaid(person({ state: 'TX', annualIncome: 36000, age: 28, isPregnant: true }));
  check('C  CONTROL TX pregnant $36,000 (A4): still likely', tx.eligibilityStatus === 'likely_eligible', `got ${tx.eligibilityStatus}`);
}

// ── A2. Rows sourced in medicaid-gaps (2026-10-16): each state's own current chart, read that day ─
// Convention as above: stored = printed + 5 when the chart prints the adult line at 133% (it
// excludes the disregard); stored = printed when the chart already carries it (adult line 138%,
// or a "+5%" column). Downloads and full quotes: audit folder engine-fixes/notes/medicaid-gaps.md.
// The same rows sit in BenefitsUSA and CoveredUSA; both gates pin them, so the two sites cannot drift.
const SOURCED_GAPS = [
  ['MN', 'childLimitFpl', 280, 'MN DHS-3461A-ENG 6-26 (Effective 7/1/26-6/30/27): "MA Children 2-18 Years Old 275% FPG", $90,750 for 4; adult column "133% FPG". 275 + 5. (Infants under 2 are 283% printed, 288 stored; the engine has one child field.)'],
  ['MN', 'pregnantLimitFpl', 283, 'MN DHS-3461A-ENG 6-26: "MA Pregnant Women 278% FPG", $60,159 for 2; Minn. Stat. 256B.057 subd. 1(b). 278 + 5.'],
  ['CO', 'pregnantLimitFpl', 265, 'HCPF OM 26-007 CHP+ chart, effective April 1, 2026: top band "236-260%", $4,689/mo for 2; CHP+ page "under 260% of the Federal Poverty Level", "Applicants who do not have other health insurance". Medicaid chart: pregnant "195% Poverty Level", adults "133% Poverty Level". 260 + 5.'],
  ['TX', 'pregnantLimitFpl', 207, 'Texas Works Handbook C-131.1 (Rev. 26-2, eff. April 1, 2026): "202% FPL ... TA 85" (CHIP Perinatal) $3,643/mo for 2; Medicaid for Pregnant Women "198% FPL ... TP 40"; separate C-131.4 "Five Percentage Points of FPL" table. 202 + 5.'],
  ['AR', 'pregnantLimitFpl', 214, 'AR DHS Health Care Eligibility Quick Reference 04/2026: "Pregnant Women 209% of FPL 214% of FPL" (the second column with the 5% disregard); adults 133% / 138%.'],
  ['AZ', 'pregnantLimitFpl', 161, 'AHCCCS chart effective 02/01/2026: pregnant 156% FPL, $2,814/mo for 2; adults 133%, $1,769 for 1. 156 + 5.'],
  ['GA', 'pregnantLimitFpl', 225, 'GA DFCS Medicaid manual Appendix A2, eff. 03/01/2026: "220% PGW Newborn | Plus 5%", $4,058/mo for 2 = 225%.'],
  ['IA', 'pregnantLimitFpl', 220, 'Iowa HHS income guidelines eff. April 1, 2026: "Pregnancy & Postpartum Care (215%)"; Employees\' Manual 8-F; IHAWP adults "does not exceed 133%". 215 + 5.'],
  ['MA', 'pregnantLimitFpl', 205, '130 CMR 505.002(D)(1)(a): "less than or equal to 200% of the federal poverty level"; 506.007(A)(3) subtracts five percentage points. 200 + 5.'],
  ['MS', 'pregnantLimitFpl', 199, 'MS Division of Medicaid Appendix A-3, "2026 MAGI INCOME LIMITS EFFECTIVE MARCH 1, 2026": "194% FPL | 194% + 5% Disregard", $3,589/mo for 2 = 199%.'],
  ['MT', 'pregnantLimitFpl', 162, 'MT DPHHS manual ACA/FMA 004, eff. 04/01/2026: "does not exceed 157 percent", $2,831/mo for 2; adults "does not exceed 133 percent". 157 + 5.'],
  ['NC', 'pregnantLimitFpl', 201, 'NC DHHS "Basic Medicaid Eligibility Requirements", revised 4/1/2026: MPW "196% of Poverty Level", 2 - $3,535; MXP adults "133% of Poverty Level". 196 + 5.'],
  ['NH', 'pregnantLimitFpl', 201, 'NH DHHS MAM 601 Table G, "SR 26-16 Dated 07/26": "Children\'s Medicaid (CM), Pregnant Women, and FPMA < 196%", 2 = $3,535; Granite Advantage "< 133%". 196 + 5.'],
  ['NJ', 'pregnantLimitFpl', 205, 'NJ FamilyCare Income Chart effective January 1, 2026 (NJFC-INCOME-E-0126): "NJSPCP & Pregnant Women (Any Age) 0 - 205%", $3,697 for 2; adults "0 - 138%" (chart includes the disregard).'],
  ['NY', 'pregnantLimitFpl', 223, 'NY DOH GIS 26 MA/05 Attachment I, eff. January 1, 2026: "Pregnant Consumers 223% FPL", 4,022/mo for 2; parents 138% (includes the disregard).'],
  ['OH', 'pregnantLimitFpl', 205, 'Ohio Medicaid "2026 Monthly Financial Eligibility": "Pregnant Women 200% FPL", $3,607 for 2; adults "133% FPL". 200 + 5.'],
  ['OR', 'pregnantLimitFpl', 190, 'OAR 410-200-0315, eff. 03/01/2026, 2026 Income Thresholds: MAGI Pregnant "Standard + 5% FPL Disregard (190%)", $3,427 for 2.'],
  ['RI', 'pregnantLimitFpl', 258, '210-RICR-30-00-1 s1.6(B): pregnant "253%" threshold, "258%" ceiling with the five percent disregard; adults 133% / 138%.'],
  ['SD', 'pregnantLimitFpl', 138, 'SD DSS "Medicaid Coverage Groups": Pregnancy Coverage $3,795/mo for 4 = 138%, the same figures as the adult group (includes the disregard).'],
  ['TN', 'pregnantLimitFpl', 255, 'TennCare "Pregnant Women (250% FPL)", $54,100/yr for 2; children 6-19 "(133% FPL)". 250 + 5.'],
  ['WA', 'pregnantLimitFpl', 215, 'HCA "Apple Health Income and Resource Standards", October 1, 2026: "215% FPL - Pregnancy", $3,879 for 2; "Above MAGI limits include 5% income disregard".'],
  ['WV', 'pregnantLimitFpl', 305, 'WV Income Maintenance Manual (eff. 10-05-2026) 22.17 "WVCHIP PREGNANCY ... Income 300%", $5,410/mo for 2; 22.17.5.A "If the WVCHIP Pregnancy applicant\'s income is 305% FPL, then the 5% MAGI income disregard would be applied". 300 + 5.'],
  ['WY', 'pregnantLimitFpl', 159, 'WY DOH "Medicaid Income Requirements": "Pregnant Women and Children Ages 0-5 154% FPL", $2,049 for 1; "Children Ages 6-18 133% FPL". 154 + 5.'],
];
for (const [st, field, want, source] of SOURCED_GAPS) {
  check(`A2 ${st} ${field} = ${want}`, md(st)[field] === want, `got ${md(st)[field]}. Source: ${source}`);
}
for (const [st, above, name] of [['CO', 200, 'Child Health Plan Plus'], ['TX', 203, 'CHIP Perinatal'], ['WV', 190, 'WVCHIP Pregnancy']]) {
  const band = md(st).pregnantUpperBand;
  check(`A2 ${st} pregnantUpperBand: above ${above}, names ${name}`, band?.aboveFpl === above && band?.note.includes(name),
    `got ${JSON.stringify(band)}. The top band is CHIP with its own condition, so the card must name it.`);
}
{
  // The people: a pregnant woman (single, so size 2) between the old and new line now hears yes, and
  // the band note reaches only the woman inside the band.
  const preg = (st, pct) => checkMedicaid(person({ state: st, annualIncome: Math.round(getFPL(2, pct, st)), age: 28, isPregnant: true }));
  for (const [st, oldL, newL] of [['AR', 209, 214], ['AZ', 156, 161], ['GA', 220, 225], ['IA', 215, 220], ['MA', 200, 205], ['MS', 194, 199],
    ['MT', 157, 162], ['NC', 196, 201], ['NH', 196, 201], ['NJ', 200, 205], ['NY', 218, 223], ['OH', 200, 205], ['OR', 185, 190], ['RI', 253, 258],
    ['SD', 133, 138], ['TN', 250, 255], ['WA', 210, 215], ['WV', 300, 305], ['WY', 154, 159], ['MN', 278, 283]]) {
    const r = preg(st, (oldL + newL) / 2);
    check(`A2 ${st} pregnant at ${(oldL + newL) / 2}% of size 2 (old ${oldL}, new ${newL}): likely`, r.eligibilityStatus === 'likely_eligible',
      `got ${r.eligibilityStatus}: "${r.reason}"`);
  }
  const tx205 = preg('TX', 205);
  check('A2 TX pregnant at 205%: likely, and the card names CHIP Perinatal and its private-insurance bar', tx205.eligibilityStatus === 'likely_eligible' && /CHIP Perinatal/.test(tx205.reason) && /private health insurance/.test(tx205.reason),
    `got ${tx205.eligibilityStatus}: "${tx205.reason}"`);
  const tx200 = preg('TX', 200);
  check('A2 TX pregnant at 200%: Medicaid, so NO CHIP Perinatal note', tx200.eligibilityStatus === 'likely_eligible' && !/CHIP Perinatal/.test(tx200.reason), `got "${tx200.reason}"`);
  const tx210 = preg('TX', 210);
  check('A2 TX pregnant at 210%: over 207, still no', tx210.eligible === false && /207% FPL limit for pregnant women/.test(tx210.reason), `got ${tx210.eligibilityStatus}: "${tx210.reason}"`);
  const co240 = preg('CO', 240);
  check('A2 CO pregnant at 240%: likely, and the card names CHP+ and its no-other-insurance condition', co240.eligibilityStatus === 'likely_eligible' && /CHP\+/.test(co240.reason) && /do not have other health insurance/.test(co240.reason),
    `got ${co240.eligibilityStatus}: "${co240.reason}"`);
  const co197 = preg('CO', 197);
  check('A2 CO pregnant at 197%: Health First Colorado, so NO CHP+ note', co197.eligibilityStatus === 'likely_eligible' && !/CHP\+/.test(co197.reason), `got "${co197.reason}"`);
  const co270 = preg('CO', 270);
  check('A2 CO pregnant at 270%: over 265, no', co270.eligible === false, `got ${co270.eligibilityStatus}`);
  const wv250 = preg('WV', 250);
  check('A2 WV pregnant at 250%: likely, and the card names WVCHIP Pregnancy', wv250.eligibilityStatus === 'likely_eligible' && /WVCHIP Pregnancy/.test(wv250.reason), `got "${wv250.reason}"`);
  const wv150 = preg('WV', 150);
  check('A2 WV pregnant at 150%: Medicaid, so NO WVCHIP note', wv150.eligibilityStatus === 'likely_eligible' && !/WVCHIP/.test(wv150.reason), `got "${wv150.reason}"`);
  const mnKids = (pct) => checkMedicaid(person({ state: 'MN', householdSize: 4, numChildren: 2, childAges: [4, 8], annualIncome: Math.round(getFPL(4, pct, 'MN')) }));
  check('A2 MN family of 4 at 277.5% (old 275, new 280): the kids qualify', mnKids(277.5).eligibilityStatus === 'likely_eligible', `got ${mnKids(277.5).eligibilityStatus}`);
  check('A2 MN family of 4 at 284%: over 280, not a likely', mnKids(284).eligibilityStatus !== 'likely_eligible', `got ${mnKids(284).eligibilityStatus}`);
}

// ── G. Grandfamilies: the child is tested on the child's coverage, at any caregiver age ────────
// (audit medicaid-gaps; A20 left-over; W9_critic_W8 "Divergence to port the other way" (a)).
// CoveredUSA's 65+ branch used to return BEFORE the child check, so a 67-year-old raising a
// grandchild got only the aged card. BenefitsUSA already ran the child first. Both sites now do,
// and both gates pin the SAME sentences below, so if either site's wording drifts its own build
// fails: the two engines cannot import each other, so the literal is the shared contract.
const GP_UNDER = 'Children under 19 qualify for Medicaid/CHIP up to 206% FPL. You may also qualify yourself, but on a different route than the child: at 65+ Medicaid is decided on the aged/disabled rules, which count your savings as well as your income. Ask about both in the same application.';
const GP_OVER = 'Your household income is above the 206% limit for Medicaid/CHIP, and that limit is the right test for your own children. It is the wrong test if you are raising a grandchild, or another relative\'s child: your income usually does not count at all in that case, so the child is assessed on their own income and qualifies in most states no matter what you earn.';
const GP_OVER_NEXT = 'Apply for the child at https://www.yourtexasbenefits.com or call 1-800-252-8263. Say you are a relative caregiver and ask for a child-only application.';
{
  const gp = (o) => person({ state: 'TX', age: 67, householdSize: 2, numChildren: 1, childAges: [10], ...o });
  const under = checkMedicaid(gp({ annualIncome: 25000 }));
  check('G  TX grandparent 67 + grandchild, $25,000 (116%): the CHILD\'s card, likely $5,000, plus a pointer to the grandparent\'s own route',
    under.eligibilityStatus === 'likely_eligible' && under.estimatedValue === 5000 && under.reason === GP_UNDER,
    `got ${under.eligibilityStatus} $${under.estimatedValue}: "${under.reason}". The 65+ branch is running before the child check again.`);
  const poor = checkMedicaid(gp({ annualIncome: 15000 }));
  check('G  TX grandparent 67 + grandchild, $15,000 (69%): still the child\'s card, not the aged card alone',
    poor.eligibilityStatus === 'likely_eligible' && poor.reason === GP_UNDER, `got ${poor.eligibilityStatus}: "${poor.reason}"`);
  const oh = checkMedicaid(person({ state: 'OH', age: 70, householdSize: 3, numChildren: 2, childAges: [6, 12], annualIncome: 30000 }));
  check('G  OH grandparent 70 + 2 grandkids, $30,000 (110%): $5,000 a child, and NOT "your household qualifies" (the 138% adult test is MAGI, which does not apply at 65+)',
    oh.eligibilityStatus === 'likely_eligible' && oh.estimatedValue === 10000 && !/Your household qualifies/.test(oh.reason) && /You may also qualify yourself/.test(oh.reason),
    `got ${oh.eligibilityStatus} $${oh.estimatedValue}: "${oh.reason}"`);
  const over = checkMedicaid(gp({ annualIncome: 50000 }));
  check('G  TX grandparent 67 + grandchild, $50,000 (231%, over 206): the relative-caregiver maybe, $0, in the shared words',
    over.eligibilityStatus === 'may_qualify' && over.estimatedValue === 0 && over.reason === GP_OVER && over.nextSteps === GP_OVER_NEXT,
    `got ${over.eligibilityStatus} $${over.estimatedValue}: "${over.reason}" / "${over.nextSteps}"`);
  const parentOver = checkMedicaid(person({ state: 'TX', age: 40, householdSize: 2, numChildren: 1, childAges: [6], annualIncome: 50000 }));
  check('G  TX parent 40 + child, $50,000 (over 206): the same relative-caregiver maybe (the screener cannot tell a parent from a grandparent)',
    parentOver.eligibilityStatus === 'may_qualify' && parentOver.estimatedValue === 0 && parentOver.reason === GP_OVER,
    `got ${parentOver.eligibilityStatus}: "${parentOver.reason}"`);
  const alone = checkMedicaid(person({ state: 'OH', age: 70, annualIncome: 12000 }));
  check('G  CONTROL OH senior 70 alone, $12,000 (75%): still the aged card, maybe $6,500, held out of the total',
    alone.eligibilityStatus === 'may_qualify' && alone.estimatedValue === 6500 && alone.excludedFromTotal === true && /Medicare and Medicaid are not either\/or/.test(alone.reason),
    `got ${alone.eligibilityStatus} $${alone.estimatedValue} excluded=${alone.excludedFromTotal}: "${alone.reason}"`);
  const rich = checkMedicaid(person({ state: 'OH', age: 70, annualIncome: 30000 }));
  check('G  CONTROL OH senior 70 alone, $30,000 (188%): still not eligible', rich.eligible === false, `got ${rich.eligibilityStatus}`);
}

// The CHIP card over the line (CoveredUSA only; BenefitsUSA has no CHIP card). It used to give a
// 'maybe' worth half the CHIP value up to 20 points over the line, "Some states allow deductions".
// CHIP is MAGI everywhere and the only allowance (the 5-point disregard) is already in every row,
// so over the line it is a no that names the relative-caregiver route, and the Medicaid card
// carries the shared 'maybe', $0.
{
  const chip = (o) => checkCHIP(person({ state: 'TX', age: 67, householdSize: 2, numChildren: 1, ...o }));
  const gpOver = chip({ annualIncome: 50000 });
  check('G  CHIP, TX grandparent $50,000 (over 206): no, $0, and it names the child-only application',
    gpOver.eligible === false && gpOver.estimatedValue === 0 && /child-only application/.test(gpOver.reason) && !/deduction/i.test(gpOver.reason),
    `got ${gpOver.eligibilityStatus} $${gpOver.estimatedValue}: "${gpOver.reason}"`);
  const gpUnder = chip({ annualIncome: 25000 });
  check('G  CHIP, TX grandparent $25,000 (116%): the grandchild likely qualifies', gpUnder.eligibilityStatus === 'likely_eligible',
    `got ${gpUnder.eligibilityStatus}: "${gpUnder.reason}"`);
  for (const [st, inc, why] of [['OK', 75000, '227%, inside the old +20 band over 211'], ['DE', 72000, '218%, one point over 217'], ['IN', 90000, '273%, over 255']]) {
    const r = checkCHIP(person({ state: st, householdSize: 4, numChildren: 2, annualIncome: inc }));
    check(`G  CHIP, ${st} family of 4 at $${inc.toLocaleString()} (${why}): no "deductions" maybe, $0`,
      r.eligible === false && r.estimatedValue === 0 && !/deduction/i.test(r.reason),
      `got ${r.eligibilityStatus} $${r.estimatedValue}: "${r.reason}". The +20 band is back.`);
    const m = checkMedicaid(person({ state: st, householdSize: 4, numChildren: 2, annualIncome: inc }));
    check(`G  Medicaid, ${st} family of 4 at $${inc.toLocaleString()}: the relative-caregiver maybe, $0 (as on BenefitsUSA)`,
      m.eligibilityStatus === 'may_qualify' && m.estimatedValue === 0 && /raising grandchildren, or a relative's children/.test(m.reason),
      `got ${m.eligibilityStatus} $${m.estimatedValue}: "${m.reason}"`);
  }
}

// ── T. One child, one count (audit cusa-total-double-count) ───────────────────────────────────
// A child gets Medicaid OR CHIP, never both. The Medicaid card's children's answer and the CHIP
// card test the same combined line and both priced the same children at $5,000 each, so the total
// counted every child under the line twice. The children are now counted once, on the Medicaid
// card (which names both programs, as BenefitsUSA's does), and the CHIP card says so at $0. When
// the Medicaid card is the mother's pregnancy coverage, the CHIP card still carries the children.
// Runs the whole engine (index.ts), because the rule lives where the cards meet, not in either one.
{
  const run = (o) => checkEligibility(person(o));
  const card = (r, id) => r.programs.find((p) => p.id === id);
  const v = (r, id) => card(r, id)?.estimatedValue ?? 0;
  const counted = (r) => r.programs.filter((p) => (p.eligible === true || p.eligible === 'maybe') && !p.excludedFromTotal);
  const show = (r) => `total $${r.totalPotentialValue}: ${counted(r).map((p) => `${p.id} $${p.estimatedValue}`).join(', ')}`;
  const SAID = /That coverage is already counted on the .+ card, so it is not added again here: a child gets Medicaid or CHIP, never both\./;

  // The people, before -> after (notes/cusa-total-double-count.md). BenefitsUSA's same household in brackets.
  const ohUnder = run({ state: 'OH', householdSize: 4, numChildren: 2, annualIncome: 40000 });
  check('T  OH family of 4, 2 kids, $40,000 (121%): total $15,000, was $25,000 (BenefitsUSA $15,000)',
    ohUnder.totalPotentialValue === 15000 && v(ohUnder, 'medicaid') === 15000 && v(ohUnder, 'chip') === 0, show(ohUnder));
  const txUnder = run({ state: 'TX', householdSize: 4, numChildren: 2, annualIncome: 40000 });
  check('T  TX family of 4, 2 kids, $40,000 (121%, under the line): the kids once, $10,000 on the Medicaid card; CHIP $0, still listed as likely',
    v(txUnder, 'medicaid') === 10000 && card(txUnder, 'medicaid').includesChildren === true && v(txUnder, 'chip') === 0
      && card(txUnder, 'chip').eligibilityStatus === 'likely_eligible' && SAID.test(card(txUnder, 'chip').reason)
      && txUnder.totalPotentialValue === v(txUnder, 'aca') + 10000, show(txUnder));
  const txBetween = run({ state: 'TX', householdSize: 4, numChildren: 2, annualIncome: 60000 });
  check('T  TX family of 4, 2 kids, $60,000 (182%, the between-the-lines family; the rows hold one combined line): the kids once, $10,000',
    v(txBetween, 'medicaid') === 10000 && v(txBetween, 'chip') === 0 && SAID.test(card(txBetween, 'chip').reason)
      && txBetween.totalPotentialValue === v(txBetween, 'aca') + 10000, show(txBetween));
  const gpTx = run({ state: 'TX', age: 67, householdSize: 2, numChildren: 1, annualIncome: 15000, currentlyInsured: true, insuranceSource: 'medicare' });
  check('T  TX grandparent 67 + grandchild, $15,000, on Medicare: the grandchild once ($5,000), total = Medicaid + MSP (was + CHIP $5,000 again)',
    v(gpTx, 'medicaid') === 5000 && v(gpTx, 'chip') === 0 && gpTx.totalPotentialValue === 5000 + v(gpTx, 'medicare-savings'), show(gpTx));
  const gpOh = run({ state: 'OH', age: 70, householdSize: 3, numChildren: 2, annualIncome: 30000, currentlyInsured: true, insuranceSource: 'medicare' });
  check('T  OH grandparent 70 + 2 grandkids, $30,000, on Medicare: $10,000 for the two, once',
    v(gpOh, 'medicaid') === 10000 && v(gpOh, 'chip') === 0 && gpOh.totalPotentialValue === 10000 + v(gpOh, 'medicare-savings'), show(gpOh));
  check('T  the CHIP card that adds $0 has no em dash in its words', !card(txUnder, 'chip').reason.includes('—'), card(txUnder, 'chip').reason);

  // CONTROLS: whose answer must not move.
  const preg = run({ state: 'TX', age: 28, householdSize: 2, numChildren: 1, annualIncome: 30000, isPregnant: true });
  check('T  CONTROL TX pregnant mother + 1 child, $30,000: her card is HER coverage, so CHIP still carries the child ($5,000, counted)',
    v(preg, 'medicaid') === 10000 && !card(preg, 'medicaid').includesChildren && v(preg, 'chip') === 5000
      && preg.totalPotentialValue === v(preg, 'aca') + 10000 + 5000, show(preg));
  const solo = run({ state: 'OH', householdSize: 1, annualIncome: 20000 });
  check('T  CONTROL OH single adult, no children, $20,000: total $10,000 unchanged', solo.totalPotentialValue === 10000, show(solo));
  const couple = run({ state: 'TX', age: 40, householdSize: 2, annualIncome: 45000 });
  check('T  CONTROL TX couple, no children, $45,000: total is the ACA card alone', couple.totalPotentialValue === v(couple, 'aca') && v(couple, 'aca') > 0, show(couple));
  const over = run({ state: 'TX', householdSize: 4, numChildren: 2, annualIncome: 90000 });
  check('T  CONTROL TX family of 4 at $90,000 (over 206): CHIP no, Medicaid the $0 relative-caregiver maybe, total = ACA',
    card(over, 'chip').eligible === false && v(over, 'medicaid') === 0 && over.totalPotentialValue === v(over, 'aca'), show(over));
  const onMcd = run({ state: 'TX', householdSize: 4, numChildren: 2, annualIncome: 40000, currentlyInsured: true, insuranceSource: 'medicaid' });
  check('T  CONTROL TX family already on Medicaid: CHIP no (as before), the kids once on the Medicaid card',
    card(onMcd, 'chip').eligible === false && v(onMcd, 'medicaid') === 10000, show(onMcd));

  // Every state, every household shape: the children are never priced on both cards, and never on neither.
  let swept = 0;
  const sweepFails = [];
  for (const st of ALL_STATES) {
    const lim = md(st).childLimitFpl;
    for (const kids of [1, 2, 3]) {
      for (const age of [35, 67]) {
        for (const isPregnant of age === 35 ? [false, true] : [false]) {
          for (const pct of [50, 100, 138, 160, lim - 1, lim + 2]) {
            const hh = kids + 1;
            const r = run({ state: st, age, householdSize: hh, numChildren: kids, isPregnant, annualIncome: Math.round(getFPL(hh, pct, st)) });
            const m = card(r, 'medicaid');
            const c = card(r, 'chip');
            /* Read from the card's words as well as the flag, so this still fails if the flag is
               ever dropped: these two sentences are the children's answer and nothing else. */
            const medicaidHasKids = !!m.includesChildren || /^(Children under 19 qualify for|Your household qualifies for)/.test(m.reason);
            const onMedicaid = medicaidHasKids && m.estimatedValue >= 5000 * kids;
            const onChip = (c.eligible === true || c.eligible === 'maybe') && c.estimatedValue > 0;
            const kidsCovered = c.eligible === true || medicaidHasKids;
            swept++;
            const who = `${st} ${kids} kid(s), age ${age}${isPregnant ? ', pregnant' : ''}, ${pct}%`;
            if (onMedicaid && onChip) sweepFails.push(`${who}: children priced on BOTH cards (${show(r)})`);
            if (kidsCovered && !onMedicaid && !onChip) sweepFails.push(`${who}: children covered but priced on NEITHER card (${show(r)})`);
            if (onMedicaid && c.eligible !== false && !SAID.test(c.reason)) sweepFails.push(`${who}: the $0 CHIP card does not say where the children are counted ("${c.reason}")`);
          }
        }
      }
    }
  }
  check(`T  every state, 1-3 children, parent / pregnant parent / grandparent, 6 incomes (${swept} households): the children priced on exactly one card`,
    sweepFails.length === 0 && swept === 51 * 3 * 3 * 6,
    `${sweepFails.length} failures (swept ${swept} households). First 5:\n        ${sweepFails.slice(0, 5).join('\n        ')}`);

  // The results page prints a card's value only when it is above $0, so the CHIP card that adds
  // nothing shows no dollar line next to the Medicaid card's. And the page totals nothing itself:
  // it re-runs this same engine.
  const client = readFileSync(new URL('../src/components/ResultsClient.tsx', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../src/app/[locale]/results/[id]/page.tsx', import.meta.url), 'utf8');
  check('T  results page: a secondary card prints its value only when it is above $0',
    /\{prog\.estimatedValue > 0 && \(/.test(client), 'ResultsClient.tsx no longer guards the secondary card value with estimatedValue > 0, so a $0 CHIP card would print "$0/yr"');
  check('T  results page re-runs the whole engine (checkEligibility), where the one-count rule lives',
    /checkEligibility\(\{/.test(page), 'results/[id]/page.tsx no longer calls checkEligibility');
}

// ── U. Same household, same total on both sites (audit totals-followups) ───────────────────────
// Two left-overs of cusa-total-double-count, one per site. Here: the ACA card guessed adults as
// householdSize - floor(householdSize x 0.3) and never read numChildren, so a Texas single parent
// of one child on $30,000 saw ACA $20,000 (two "adults") where BenefitsUSA said $5,490. The ACA
// estimate is now BenefitsUSA's. There: a pregnant mother's children were counted zero times (her
// Medicaid card is her own coverage and that site has no CHIP card); they are now counted once, on
// her card, at the children's $5,000 each. Here the CHIP card carries them (section T), so the
// totals meet. The ACA dollar figure moves on Nov 1 (2027 coverage), so every total is pinned on
// both sides of the gate with the engine's clock held. These literals are the cross-site contract:
// BenefitsUSA's check:medicaid-limits pins the same people at the same totals.
{
  const RealDate = Date;
  const at = (iso, fn) => {
    const fixed = new RealDate(iso).getTime();
    globalThis.Date = class extends RealDate {
      constructor(...a) { if (a.length === 0) super(fixed); else super(...a); }
      static now() { return fixed; }
    };
    try { return fn(); } finally { globalThis.Date = RealDate; }
  };
  const OCT31 = '2026-10-31T23:59:00-04:00';
  const NOV1 = '2026-11-01T00:01:00-04:00';
  const card = (r, id) => r.programs.find((p) => p.id === id);
  const show = (r) => `total $${r.totalPotentialValue}: ${r.programs.filter((p) => (p.eligible === true || p.eligible === 'maybe') && !p.excludedFromTotal).map((p) => `${p.id} $${p.estimatedValue}`).join(', ')}`;
  const SAME_TOTAL = [
    // [who, person, total Oct 31, total Nov 1, total here before this fix]
    ['TX single parent 29 + 1 child, $30,000', { state: 'TX', age: 29, householdSize: 2, numChildren: 1, annualIncome: 30000 }, 10490, 10515, 25000],
    ['TX single parent 35 + 2 children, $40,980 (150%)', { state: 'TX', age: 35, householdSize: 3, numChildren: 2, annualIncome: 40980 }, 15701, 15738, 23000],
    ['OH single parent 35 + 1 child, $32,460 (150%)', { state: 'OH', age: 35, householdSize: 2, numChildren: 1, annualIncome: 32460 }, 11097, 11104, 18000],
    ['OH single parent 35 + 2 children, $68,300 (250%, children over the line)', { state: 'OH', age: 35, householdSize: 3, numChildren: 2, annualIncome: 68300 }, 1617, 1585, 6000],
    ['TX pregnant mother 28 + 2 children, $32,784', { state: 'TX', age: 28, householdSize: 3, numChildren: 2, isPregnant: true, annualIncome: 32784 }, 25912, 25895, 40000],
    ['OH pregnant mother 28 + 2 children, $49,176', { state: 'OH', age: 28, householdSize: 3, numChildren: 2, isPregnant: true, annualIncome: 49176 }, 23702, 23754, 33000],
    ['OH pregnant mother 28 + 2 children, $20,000 (no ACA: under 138%)', { state: 'OH', age: 28, householdSize: 3, numChildren: 2, isPregnant: true, annualIncome: 20000 }, 20000, 20000, 20000],
    ['TX pregnant mother 28 + 1 child, $30,000', { state: 'TX', age: 28, householdSize: 2, numChildren: 1, isPregnant: true, annualIncome: 30000 }, 20490, 20515, 35000],
    ['CONTROL TX pregnant, no children, $30,000', { state: 'TX', age: 28, householdSize: 1, isPregnant: true, annualIncome: 30000 }, 14733, 14744, 16500],
    ['CONTROL TX couple 40, no children, $45,000', { state: 'TX', age: 40, householdSize: 2, annualIncome: 45000 }, 11811, 11813, 8000],
    ['CONTROL TX married parents 40 + 2 children, $60,000', { state: 'TX', age: 40, householdSize: 4, numChildren: 2, annualIncome: 60000 }, 21409, 21464, 23000],
    ['CONTROL OH married parents 40 + 2 children, $40,000 (household Medicaid, no ACA)', { state: 'OH', age: 40, householdSize: 4, numChildren: 2, annualIncome: 40000 }, 15000, 15000, 15000],
    ['CONTROL TX grandparent 67 + grandchild, $15,000, on Medicare', { state: 'TX', age: 67, householdSize: 2, numChildren: 1, annualIncome: 15000, currentlyInsured: true, insuranceSource: 'medicare' }, 10000, 10000, 10000],
  ];
  for (const [who, p, t26, t27, was] of SAME_TOTAL) {
    for (const [iso, want] of [[OCT31, t26], [NOV1, t27]]) {
      const r = at(iso, () => checkEligibility(person(p)));
      check(`U  ${iso.slice(0, 10)} ${who}: total $${want.toLocaleString()}, the same as BenefitsUSA (was $${was.toLocaleString()} here)`,
        r.totalPotentialValue === want, show(r));
    }
  }
  // The pregnant mother's cards are two people: her own Medicaid ($10,000) and the children on CHIP.
  const preg = at(OCT31, () => checkEligibility(person({ state: 'TX', age: 28, householdSize: 3, numChildren: 2, isPregnant: true, annualIncome: 32784 })));
  check('U  TX pregnant mother + 2 children: her card is $10,000 (her own), CHIP carries the two children ($10,000), ACA prices ONE adult',
    card(preg, 'medicaid').estimatedValue === 10000 && card(preg, 'chip').estimatedValue === 10000 && card(preg, 'aca').estimatedValue === 5912, show(preg));
}

// ── Invariants over all 51 rows ───────────────────────────────────────────────────────────────
let expansionStates = 0;
let nonExpansion = 0;
for (const st of ALL_STATES) {
  const m = md(st);
  const expansion = getStateData(st)?.state?.medicaidExpansion;
  if (expansion && st !== 'DC') expansionStates++;
  if (!expansion) nonExpansion++;
  if (expansion) check(`I  ${st}: expansion adult limit is 138`, m.adultLimitFpl === 138, `got ${m.adultLimitFpl}`);
  if (m.adultActivityRequirement) {
    check(`I  ${st}: an activity requirement only makes sense on a non-expansion row with a limit`, !expansion && m.adultLimitFpl > 0,
      `expansion ${expansion}, adultLimitFpl ${m.adultLimitFpl}`);
  }
  if (m.pregnantUpperBand) {
    const { aboveFpl, note } = m.pregnantUpperBand;
    check(`I  ${st}: pregnantUpperBand.aboveFpl sits below the pregnant limit`, aboveFpl > 0 && aboveFpl < m.pregnantLimitFpl,
      `aboveFpl ${aboveFpl}, pregnantLimitFpl ${m.pregnantLimitFpl}`);
    check(`I  ${st}: the pregnancy band note has no em dash`, !note.includes('—'), `"${note}"`);
  }
}
check('I  40 states plus DC have expanded and 10 have not (the count the pages print)', expansionStates === 40 && nonExpansion === 10,
  `data says ${expansionStates} + DC expanded, ${nonExpansion} not. Update the hub and FPL page copy if this ever changes.`);

// ── D. The page copy that states the same rules ───────────────────────────────────────────────
{
  const hub = readFileSync(new URL('../src/app/[locale]/medicaid-income-limits/page.tsx', import.meta.url), 'utf8');
  const fplPage = readFileSync(new URL('../src/app/[locale]/federal-poverty-level/page.tsx', import.meta.url), 'utf8');
  check('D  hub: Georgia\'s row names Georgia Pathways and the 80 hours, in English and Spanish',
    /name: 'Georgia'[^\n]*Georgia Pathways covers adults 19 to 64 up to 100% FPL who complete at least 80 hours/.test(hub)
      && /name: 'Georgia'[^\n]*al menos 80 horas al mes/.test(hub),
    'the Georgia note on /medicaid-income-limits lost its hours');
  check('D  hub FAQ: Wisconsin and Georgia are named as covering adults to 100% FPL, in English and Spanish',
    /Wisconsin and Georgia have not expanded either, but they cover adults up to 100% FPL/.test(hub)
      && /Wisconsin y Georgia tampoco han expandido Medicaid, pero cubren a adultos con ingresos de hasta el 100%/.test(hub),
    'the "Do all states have the same Medicaid income limits?" answer no longer carries the WI/GA exception');
  for (const [name, text] of [['hub', hub], ['federal-poverty-level', fplPage]]) {
    check(`D  ${name}: no "41 states plus D.C." or "9 non-expansion" count (it is 40 + D.C. and 10)`,
      !/41 (states|estados|expansion states)|\b9 (non-expansion|estados sin)/.test(text), `${name} page still prints the old count`);
  }
}

console.log(`check:medicaid-limits: ${passes} passed, ${failures} failed`);
if (failures > 0) {
  console.log('\nThe Medicaid state rows or the Wisconsin/Georgia branches have drifted from the sourced values.');
  process.exit(1);
}
