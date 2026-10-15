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
 * Runs the real engine. CONTROLS are people whose answer must not move.
 */
import { checkEligibility } from '../src/lib/eligibility/index.ts';
import { getFPL } from '../src/lib/eligibility/fpl.ts';
import { ALL_STATES } from '../src/lib/states/index.ts';

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
const EM_DASH = '—';

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

console.log(`\n${checks - failures}/${checks} passed`);
if (failures) {
  console.log(`\nFAILED: ${failures} check(s). See audit A20 in src/lib/eligibility/programs/medicaid.ts.`);
  process.exit(1);
}
