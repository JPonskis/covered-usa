/**
 * Seniors on the screener (audit A20; W8_coveredusa.md Notes #1, #2, #6; W9_critic_W8.md).
 *
 * 1. AGED MEDICAID IS NEVER "likely" ON INCOME ALONE. At 65+ Medicaid is decided on the
 *    aged/disabled rules, which count savings (about $2,000 for one person, 20 CFR
 *    416.1205(c)), and the screener does not ask about savings. The engine used to tell every
 *    senior at or under 100% FPL "likely" with $8,000 counted in the total. 449 real seniors
 *    used the general screener between July 14 and the audit. BenefitsUSA already shipped the
 *    `maybe`; this holds CoveredUSA to the same answer. The one exception is a senior who
 *    told us they already HAVE Medicaid.
 *
 * 2. THE MEDICARE-FOCUS SCREENER SHOWS ONLY WHAT IT ASKED. /screener?focus=medicare never asks
 *    income, and /api/screen screened every senior at $0: Medicaid and QMB "likely" for a
 *    70-year-old on $2,500 a month, and "Already enrolled in Medicare" for a 62-year-old who said
 *    "No, not enrolled". Zero completed submissions so far (W9_critic_W8): a landmine, fixed
 *    before anything links to it.
 *
 * 3. QUICK-CHECK NEVER INVENTS CHILDREN. /comenzar's inline form used numChildren =
 *    householdSize - 1, so a childless Texas couple was shown Medicaid and CHIP for a child who
 *    does not exist. It now asks. Its Medicare variant no longer runs a 35-year-old's screen.
 *
 * Runs the real engine. CONTROLS are people whose answer must not move. Section 4 reads the
 * route source, because the routes import Supabase and Resend and cannot run here; it proves the
 * helpers tested above are the ones actually wired in.
 */
import { readFileSync } from 'node:fs';
import { checkEligibility } from '../src/lib/eligibility/index.ts';
import { getFPL } from '../src/lib/eligibility/fpl.ts';
import { ALL_STATES } from '../src/lib/states/index.ts';
import {
  isMedicareEnrolledStatus,
  medicareFlowInsuranceSource,
  medicareFlowResults,
  medicareStatusFromStored,
} from '../src/lib/eligibility/medicare-flow.ts';
import { quickCheckInput } from '../src/lib/eligibility/quick-check.ts';

const base = {
  employmentStatus: 'employed', isPregnant: false, hasDisability: false, isVeteran: false,
  numChildren: 0, householdSize: 1, currentlyInsured: false, language: 'en',
};

let failures = 0;
let checks = 0;
const check = (label, cond, detail) => {
  checks++;
  if (cond) { console.log(`  ok    ${label}`); return; }
  failures++;
  console.log(`  FAIL  ${label}\n        ${detail}`);
};
const run = (o) => checkEligibility({ ...base, ...o });
const prog = (r, id) => r.programs.find((p) => p.id === id);
const EM_DASH = '\u2014';

console.log('Seniors on the screener (audit A20)\n');

// ── 1. The people from the audit ────────────────────────────────────────────
{
  // 70, single, Ohio, $1,000 a month (75% FPL), already on Medicare.
  const r = run({ state: 'OH', age: 70, annualIncome: 12000, currentlyInsured: true, insuranceSource: 'medicare' });
  const m = prog(r, 'medicaid');
  check('OH 70, $1,000/mo: aged Medicaid is maybe, not likely', m.eligible === 'maybe' && m.eligibilityStatus === 'may_qualify',
    `got ${m.eligible} / ${m.eligibilityStatus}`);
  check('OH 70, $1,000/mo: card shows $6,500, held out of the total', m.estimatedValue === 6500 && m.excludedFromTotal === true,
    `value ${m.estimatedValue}, excludedFromTotal ${m.excludedFromTotal}`);
  check('OH 70, $1,000/mo: total counts QMB only ($5,000), not Medicaid again', r.totalPotentialValue === 5000,
    `total ${r.totalPotentialValue}`);
  check('OH 70, $1,000/mo: reason names the savings test it could not run', /savings and other assets/.test(m.reason) && /\$2,000/.test(m.reason),
    m.reason);
  check('OH 70, $1,000/mo: no em dash in the reason', !m.reason.includes(EM_DASH), m.reason);
  check('OH 70, $1,000/mo: Medicare Savings Program unchanged (QMB likely)', prog(r, 'medicare-savings').eligibilityStatus === 'likely_eligible',
    JSON.stringify(prog(r, 'medicare-savings')));
}
{
  const r = run({ state: 'TX', age: 68, annualIncome: 10800 });
  const m = prog(r, 'medicaid');
  check('TX 68, $900/mo (non-expansion state): aged Medicaid is maybe', m.eligibilityStatus === 'may_qualify', `got ${m.eligibilityStatus}`);
}
{
  const r = run({ state: 'OH', age: 70, annualIncome: 12000, currentlyInsured: true, insuranceSource: 'medicaid' });
  const m = prog(r, 'medicaid');
  check('OH 70 who already has Medicaid: likely (it is already theirs), held out of the total',
    m.eligibilityStatus === 'likely_eligible' && m.excludedFromTotal === true, `got ${m.eligibilityStatus}, excluded ${m.excludedFromTotal}`);
}

// ── 2. Controls: answers that must not move ────────────────────────────────
{
  const m = prog(run({ state: 'OH', age: 70, annualIncome: 30000, currentlyInsured: true, insuranceSource: 'medicare' }), 'medicaid');
  check('CONTROL OH 70, $2,500/mo (188%): not eligible, same reason as before',
    m.eligible === false && /^Income at 188% FPL exceeds aged\/disabled full-benefit Ohio Medicaid limits/.test(m.reason), m.reason);
}
{
  const r = run({ state: 'OH', age: 70, annualIncome: 18000 });
  const m = prog(r, 'medicaid');
  check('CONTROL OH 70, $18,000 (113%): partial-Medicaid maybe at $4,000, still counted',
    m.eligibilityStatus === 'may_qualify' && m.estimatedValue === 4000 && !m.excludedFromTotal, JSON.stringify(m));
}
{
  const m = prog(run({ state: 'OH', age: 40, annualIncome: 15000 }), 'medicaid');
  check('CONTROL OH 40, $15,000: expansion adult still likely, $10,000', m.eligibilityStatus === 'likely_eligible' && m.estimatedValue === 10000, JSON.stringify(m));
}
{
  const m = prog(run({ state: 'OH', age: 35, householdSize: 3, numChildren: 2, annualIncome: 30000 }), 'medicaid');
  check('CONTROL OH parent, 2 kids, $30,000: household Medicaid still likely, $15,000', m.eligibilityStatus === 'likely_eligible' && m.estimatedValue === 15000, JSON.stringify(m));
}
{
  const m = prog(run({ state: 'OH', age: 64, annualIncome: 12000 }), 'medicaid');
  check('CONTROL OH 64, $12,000: under 65 keeps the adult rule (likely)', m.eligibilityStatus === 'likely_eligible', m.eligibilityStatus);
}

// ── 3. The boundary and every state ─────────────────────────────────────────
{
  const at = getFPL(1, 100, 'OH');
  const m1 = prog(run({ state: 'OH', age: 70, annualIncome: at }), 'medicaid');
  const m2 = prog(run({ state: 'OH', age: 70, annualIncome: at + 1 }), 'medicaid');
  check(`boundary: OH 70 at exactly 100% ($${at.toLocaleString()}) is the dual-eligible maybe`, m1.estimatedValue === 6500 && m1.excludedFromTotal === true, JSON.stringify(m1));
  check('boundary: $1 above 100% falls to the partial-Medicaid maybe ($4,000)', m2.estimatedValue === 4000, JSON.stringify(m2));
}
{
  let likely = 0;
  let firstBad = '';
  for (const state of ALL_STATES) {
    for (const age of [65, 72, 90]) {
      for (const hh of [1, 2]) {
        for (const p of [0, 25, 50, 75, 100]) {
          const income = getFPL(hh, p, state);
          for (const insuranceSource of [undefined, 'medicare', 'none']) {
            const m = prog(run({ state, age, householdSize: hh, annualIncome: income, insuranceSource }), 'medicaid');
            if (m.eligibilityStatus === 'likely_eligible') { likely++; firstBad ||= `${state} ${age} hh${hh} ${p}% ${insuranceSource}`; }
          }
        }
      }
    }
  }
  check(`every state, ages 65-90, 0-100% FPL: aged Medicaid never "likely" on income alone (${ALL_STATES.length} states)`, likely === 0,
    `${likely} likely answers, first: ${firstBad}`);
}

// ── 4. The Medicare-focus screener ───────────────────────────────────────────
/** The engine input /api/screen builds for focus=medicare (placeholders for what it never asks). */
const medicareFlow = (state, age, status) => medicareFlowResults(checkEligibility({
  ...base, state, age, householdSize: 1, numChildren: 0, annualIncome: 0,
  currentlyInsured: isMedicareEnrolledStatus(status),
  insuranceSource: medicareFlowInsuranceSource(status),
}));
const ids = (r) => r.programs.map((p) => p.id).join(',');
{
  const r = medicareFlow('OH', 70, 'partAB');
  check('Medicare flow, OH 70 on Original Medicare: Medicare only, no Medicaid or QMB at "0% FPL"', ids(r) === 'medicare', ids(r));
  check('Medicare flow, OH 70: Medicare likely, total $0', prog(r, 'medicare').eligibilityStatus === 'likely_eligible' && r.totalPotentialValue === 0,
    JSON.stringify(r));
  check('Medicare flow: no reason anywhere quotes 0% FPL', !r.programs.some((p) => /\b0% FPL/.test(p.reason)), JSON.stringify(r.programs.map((p) => p.reason)));
}
{
  const r = medicareFlow('OH', 62, 'none');
  check('Medicare flow, OH 62 "No, not enrolled": not treated as a Medicare enrollee', medicareFlowInsuranceSource('none') === undefined, 'insuranceSource was forced to medicare');
  check('Medicare flow, OH 62: Medicare card only (no QMB, no Medicaid, no ACA "Already enrolled")', ids(r) === 'medicare' && !/Already enrolled/.test(JSON.stringify(r)), JSON.stringify(r));
  check('Medicare flow, OH 62: told Medicare starts at 65, nothing claimed', prog(r, 'medicare').eligible === false && r.totalPotentialValue === 0, JSON.stringify(prog(r, 'medicare')));
}
{
  const r = medicareFlow('TX', 68, 'advantage');
  check('Medicare flow, TX 68 on Medicare Advantage: Medicare only', ids(r) === 'medicare', ids(r));
  check('Medicare flow, "Not sure" is not an enrollee', medicareFlowInsuranceSource('unsure') === undefined && !isMedicareEnrolledStatus('unsure'), '');
  check('stored "medicare:partAB:compareAdvantage" reads as enrolled', medicareFlowInsuranceSource(medicareStatusFromStored('medicare:partAB:compareAdvantage')) === 'medicare', '');
  check('stored "medicare:none:newToMedicare" reads as NOT enrolled', medicareFlowInsuranceSource(medicareStatusFromStored('medicare:none:newToMedicare')) === undefined, '');
}
{
  const synthetic = { programs: [
    { id: 'medicare', eligible: true, eligibilityStatus: 'likely_eligible', estimatedValue: 0, reason: '', nextSteps: '' },
    { id: 'some-new-program', eligible: true, eligibilityStatus: 'likely_eligible', estimatedValue: 900, reason: '', nextSteps: '' },
  ], totalPotentialValue: 900 };
  const r = medicareFlowResults(synthetic);
  check('Medicare flow is an allowlist: a program added later stays out until its inputs are asked', ids(r) === 'medicare' && r.totalPotentialValue === 0, ids(r));
}
{
  const r = run({ state: 'OH', age: 70, annualIncome: 12000 });
  check('CONTROL general screener (not the Medicare flow) still shows Medicaid and QMB for OH 70 at $12,000',
    prog(r, 'medicaid').eligible === 'maybe' && prog(r, 'medicare-savings').eligible === true, ids(r));
}

// ── 5. quick-check (/comenzar inline form) ───────────────────────────────────
{
  const couple = quickCheckInput('TX', { householdSize: 2, annualIncome: '25,000' });
  const r = checkEligibility(couple);
  check('quick-check, TX couple, $25,000, no children answer: 0 children assumed', couple.numChildren === 0, JSON.stringify(couple));
  check('quick-check, TX couple: no Medicaid or CHIP for a child who does not exist',
    prog(r, 'chip').eligible === false && prog(r, 'medicaid').eligible === false, `medicaid ${prog(r, 'medicaid').eligible}, chip ${prog(r, 'chip').eligible}`);
  check('quick-check, TX couple: ACA subsidy is the answer', r.programs[0].id === 'aca' && r.programs[0].eligible === true, r.programs[0].id);
}
{
  const family = quickCheckInput('TX', { householdSize: 2, annualIncome: 25000, numChildren: '1' });
  const r = checkEligibility(family);
  check('CONTROL quick-check, TX parent + 1 child, $25,000: the child\'s CHIP is still found', prog(r, 'chip').eligible === true, JSON.stringify(prog(r, 'chip')));
}
{
  const a = quickCheckInput('TX', { householdSize: 1, annualIncome: 20000, numChildren: 3 });
  const b = quickCheckInput('TX', { householdSize: 3, annualIncome: 20000, numChildren: 9 });
  const c = quickCheckInput('TX', { householdSize: 99, annualIncome: '$40,000' });
  check('quick-check clamps children to household - 1', a.numChildren === 0 && b.numChildren === 2, `${a.numChildren}, ${b.numChildren}`);
  check('quick-check keeps its household cap (10) and income parsing', c.householdSize === 10 && c.annualIncome === 40000, JSON.stringify(c));
  check('quick-check stays the working-age screen (age 35)', a.age === 35, String(a.age));
}

// ── 6. The helpers above are the ones the routes use ────────────────────────
{
  const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8');
  const screen = src('app/api/screen/route.ts');
  check('wiring: /api/screen filters the Medicare flow', /isMedicareFocus \? medicareFlowResults\(checkEligibility\(input\)\)/.test(screen), 'medicareFlowResults not applied in src/app/api/screen/route.ts');
  check('wiring: /api/screen no longer forces insuranceSource medicare', /insuranceSource: isMedicareFocus \? medicareFlowInsuranceSource\(medicareStatus\)/.test(screen), 'insuranceSource line changed');
  const results = src('app/[locale]/results/[id]/page.tsx');
  check('wiring: the results page filters a stored Medicare-flow row', /isMedicareFlow \? medicareFlowResults\(allResults\)/.test(results), 'medicareFlowResults not applied in results/[id]/page.tsx');
  check('wiring: the results page reads the stored Medicare status', /medicareFlowInsuranceSource\(medicareStatusFromStored\(rawInsuranceSource\)\)/.test(results), '');
  const quick = src('app/api/quick-check/route.ts');
  check('wiring: /api/quick-check builds its input with quickCheckInput', /quickCheckInput\(state, \{ householdSize, annualIncome, numChildren \}\)/.test(quick) && !/parsedHousehold - 1/.test(quick), '');
  const inline = src('app/[locale]/(landing)/comenzar/inline-screener.tsx');
  check('wiring: the inline form sends its children answer to quick-check and to /api/screen', (inline.match(/numChildren: parseInt\(children, 10\)/g) || []).length === 2, '');
  const comenzar = src('app/[locale]/(landing)/comenzar/page.tsx');
  check('wiring: /comenzar?focus=medicare sends people to the Medicare screener, not the age-35 form', /isMedicareFocus \? <CtaButton/.test(comenzar), '');
}

console.log(`\n${checks - failures}/${checks} passed`);
if (failures) {
  console.log(`\nFAILED: ${failures} check(s). See audit A20 in src/lib/eligibility/programs/medicaid.ts.`);
  process.exit(1);
}
