/**
 * 42 CFR 435.603(b) — the pregnancy family-size rule.
 *
 *   "In the case of determining the family size of a pregnant woman, the pregnant woman is
 *    counted as herself plus the number of children she is expected to deliver."
 *
 * The quiz asks how many people LIVE in the household, so the baby is never in the number
 * the user types. For a long time the Medicaid pregnancy test used that number as-is and
 * was therefore one person short in all 51 jurisdictions: a single pregnant Texan earning
 * $36,000 was measured against the one-person limit of $31,596 and told no, when the
 * two-person limit is $42,852 and she qualifies.
 *
 * This runs the real engine, so it fails if anyone reverts the +1, and — just as important —
 * if anyone extends it past the pregnancy test. 435.603(b) sizes HER family for HER
 * eligibility group; applying it to the child or adult test would hand someone a limit they
 * have no claim to. The CONTROL cases below are what hold that line.
 */
import { checkMedicaid } from '../src/lib/eligibility/programs/medicaid.ts';
import { getFPL } from '../src/lib/eligibility/fpl.ts';
import { getStateData } from '../src/lib/states/index.ts';

const base = {
  age: 29, numChildren: 0, isPregnant: false, hasDisability: false,
  receivesMedicaid: false, currentlyInsured: false, insuranceSource: 'none',
  employmentStatus: 'employed', paysHeating: null, annualIncome: 0, householdSize: 1, state: 'TX',
};

let failures = 0;
const check = (label, cond, detail) => {
  if (cond) { console.log(`  ok    ${label}`); return; }
  failures++;
  console.log(`  FAIL  ${label}\n        ${detail}`);
};

console.log('42 CFR 435.603(b): pregnancy family size counts the expected child\n');

// 1. The rule itself: the limit must be computed at household + 1.
for (const st of ['TX', 'MD', 'OK', 'CA', 'AK', 'HI']) {
  const sd = getStateData(st);
  const limitFpl = sd?.medicaid?.pregnantLimitFpl ?? 185;
  const atOne = getFPL(1, limitFpl, st);
  const atTwo = getFPL(2, limitFpl, st);
  // Income that sits between the two limits: only the correct family size qualifies her.
  const income = Math.floor((atOne + atTwo) / 2);
  const r = checkMedicaid({ ...base, state: st, annualIncome: income, householdSize: 1, isPregnant: true });
  check(
    `${st}: pregnant, hh=1, $${income.toLocaleString()} (between the 1-person and 2-person limits)`,
    r.eligibilityStatus === 'likely_eligible',
    `got ${r.eligibilityStatus}; 1-person limit $${atOne.toLocaleString()}, 2-person $${atTwo.toLocaleString()}. The test is still using the household as entered.`,
  );
}

// 2. Expecting twins, when a caller actually knows.
{
  const limitFpl = getStateData('TX')?.medicaid?.pregnantLimitFpl ?? 185;
  const income = Math.floor((getFPL(2, limitFpl, 'TX') + getFPL(3, limitFpl, 'TX')) / 2);
  const twins = checkMedicaid({ ...base, state: 'TX', annualIncome: income, householdSize: 1, isPregnant: true, expectedChildren: 2 });
  check('TX: expecting twins is counted as two', twins.eligibilityStatus === 'likely_eligible',
    `got ${twins.eligibilityStatus} at $${income.toLocaleString()}, which is above the 2-person limit and below the 3-person limit.`);
  const single = checkMedicaid({ ...base, state: 'TX', annualIncome: income, householdSize: 1, isPregnant: true });
  check('TX: the same income without the twins flag is NOT qualified', single.eligibilityStatus !== 'likely_eligible',
    `got ${single.eligibilityStatus}; assuming more babies than we were told would overstate eligibility.`);
}

// 3. CONTROLS: the rule must not leak into the child or adult tests.
{
  const childFpl = getStateData('TX')?.medicaid?.childLimitFpl ?? 200;
  // Income above the 2-person child limit but below the 3-person one. A not-pregnant parent
  // with one child must NOT get the extra person.
  const income = Math.floor((getFPL(2, childFpl, 'TX') + getFPL(3, childFpl, 'TX')) / 2);
  const r = checkMedicaid({ ...base, state: 'TX', annualIncome: income, householdSize: 2, isPregnant: false, numChildren: 1 });
  check('CONTROL: not-pregnant parent + child does not get a phantom household member',
    r.eligibilityStatus !== 'likely_eligible',
    `got ${r.eligibilityStatus} at $${income.toLocaleString()}, above the 2-person child limit $${getFPL(2, childFpl, 'TX').toLocaleString()}. The +1 has leaked into the child test.`);
}
{
  // Expansion state, childless, not pregnant: the adult test must use the entered size.
  const adultFpl = getStateData('CA')?.medicaid?.adultLimitFpl ?? 138;
  const income = Math.floor((getFPL(1, adultFpl, 'CA') + getFPL(2, adultFpl, 'CA')) / 2);
  const r = checkMedicaid({ ...base, state: 'CA', annualIncome: income, householdSize: 1, isPregnant: false });
  check('CONTROL: not-pregnant childless adult does not get a phantom household member',
    r.eligibilityStatus !== 'likely_eligible',
    `got ${r.eligibilityStatus} at $${income.toLocaleString()}, above the 1-person adult limit $${getFPL(1, adultFpl, 'CA').toLocaleString()}. The +1 has leaked into the adult test.`);
}

// 4. The copy must quote the size it actually measured her against. A correct limit under a
//    household number the user did not expect reads as a mistake and loses their trust.
{
  const r = checkMedicaid({ ...base, state: 'TX', annualIncome: 36000, householdSize: 1, isPregnant: true });
  check('the reason names the family size used (2), not the household entered (1)',
    /counts as 2 people/.test(r.reason),
    `reason was: ${r.reason}`);
}

console.log(failures === 0
  ? '\npregnancy household size: all checks pass.'
  : `\npregnancy household size: ${failures} FAILED.`);
process.exit(failures === 0 ? 0 : 1);
