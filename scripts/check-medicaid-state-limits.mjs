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
 */
import { readFileSync } from 'node:fs';
import { checkMedicaid } from '../src/lib/eligibility/programs/medicaid.ts';
import { checkACA } from '../src/lib/eligibility/programs/aca.ts';
import { checkCHIP } from '../src/lib/eligibility/programs/chip.ts';
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
  check('C  CONTROL AZ pregnant at 170% (over AZ\'s unchanged 156%): still no, and the reason names her own test',
    az.eligible === false && /156% FPL limit for pregnant women in Arizona/.test(az.reason), `got ${az.eligibilityStatus}: "${az.reason}"`);
  const tx = checkMedicaid(person({ state: 'TX', annualIncome: 36000, age: 28, isPregnant: true }));
  check('C  CONTROL TX pregnant $36,000 (A4): still likely', tx.eligibilityStatus === 'likely_eligible', `got ${tx.eligibilityStatus}`);
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
