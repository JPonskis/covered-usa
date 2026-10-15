/**
 * The ACA coverage-year switch (audit item ACA2027, W8-06 / W8-07, W9_critic_W8).
 *
 * From Nov 1, 2026 the screener is answering for 2027 coverage. 2027 coverage measures income
 * against the 2026 poverty guidelines (26 USC 36B(d)(3)(B); 26 CFR 1.36B-1(h)), uses Rev.
 * Proc. 2026-26 (affordability 10.22%), and narrows the credit for immigrants (P.L. 119-21
 * section 71301). Before Nov 1 nothing may change.
 *
 * This runs the REAL engine at simulated instants on both sides of the gate, so it fails if
 * the switch is reverted, if it is flipped early, or if the poverty table goes back to a
 * relative "prior year" read. It also guards next year: from Oct 1 of any year, the coming
 * coverage year must have its own entry, or the build fails with what to add.
 */
import {
  checkACA, acaCoverageYear, ptcGuidelineYear, acaPtcIncomeRange,
  ACA_AFFORDABILITY_PCT, ACA_APPLICABLE_PERCENTAGES,
  ACA_STATUS_REASON_2026, ACA_STATUS_REASON_2027,
} from '../src/lib/eligibility/programs/aca.ts';
import { getFPLForYear, FPL_YEAR, FPL_PRIOR_YEAR } from '../src/lib/eligibility/fpl.ts';

const RealDate = Date;
/** Run fn with the engine's clock pinned to iso. checkACA reads `new Date()` internally. */
function at(iso, fn) {
  const fixed = new RealDate(iso).getTime();
  class PinnedDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(fixed); else super(...a); }
    static now() { return fixed; }
  }
  globalThis.Date = PinnedDate;
  try { return fn(); } finally { globalThis.Date = RealDate; }
}

let failures = 0;
const check = (label, cond, detail) => {
  if (cond) { console.log(`  ok    ${label}`); return; }
  failures++;
  console.log(`  FAIL  ${label}\n        ${detail}`);
};

const LAST_2026 = '2026-10-31T23:59:59-04:00';
const FIRST_2027 = '2026-11-01T00:00:01-04:00';
const LATE_2027 = '2027-01-20T12:00:00-05:00';
const holds = (y) => y === FPL_YEAR || y === FPL_PRIOR_YEAR;
const base = {
  employmentStatus: 'employed', isPregnant: false, hasDisability: false, currentlyInsured: false,
  isVeteran: false, numChildren: 0, householdSize: 1, age: 40, state: 'FL',
};
const run = (iso, p) => at(iso, () => checkACA({ ...base, ...p }));

console.log('ACA coverage year: 2026 coverage until Oct 31, 2027 coverage from Nov 1\n');

// 1. The gate itself.
check('Oct 31 23:59:59 ET is still 2026 coverage', acaCoverageYear(new Date(LAST_2026)) === 2026,
  `got ${acaCoverageYear(new Date(LAST_2026))}. The switch is flipping before its date.`);
check('Nov 1 00:00:01 ET is 2027 coverage', acaCoverageYear(new Date(FIRST_2027)) === 2027,
  `got ${acaCoverageYear(new Date(FIRST_2027))}. On Nov 1 HealthCare.gov sells 2027 coverage.`);
check('Jan 20, 2027 is still 2027 coverage', acaCoverageYear(new Date(LATE_2027)) === 2027,
  `got ${acaCoverageYear(new Date(LATE_2027))}.`);
check('coverage year Y uses the guidelines of Y-1 (2026->2025, 2027->2026)',
  ptcGuidelineYear(2026) === 2025 && ptcGuidelineYear(2027) === 2026,
  `got ${ptcGuidelineYear(2026)} / ${ptcGuidelineYear(2027)}.`);

// 2. Rev. Proc. values (W9_critic_W5 / W9_critic_W8 quote both IRS PDFs).
check('affordability 9.96% (2026) and 10.22% (2027)',
  ACA_AFFORDABILITY_PCT[2026] === 0.0996 && ACA_AFFORDABILITY_PCT[2027] === 0.1022,
  JSON.stringify(ACA_AFFORDABILITY_PCT));
{
  const t = ACA_APPLICABLE_PERCENTAGES[2027];
  check('2027 applicable percentages 2.15 / 3.23 / 4.30 / 6.78 / 8.66 / 10.22',
    t.upTo133 === 0.0215 && t.at133 === 0.0323 && t.at150 === 0.0430 && t.at200 === 0.0678 && t.at250 === 0.0866 && t.at300 === 0.1022,
    JSON.stringify(t));
}

// 3. The income window, read by NAMED year (W8-06, W8-13).
const windows = [
  [LAST_2026, 2025, 1, 15650, 62600], [LAST_2026, 2025, 4, 32150, 128600],
  [FIRST_2027, 2026, 1, 15960, 63840], [FIRST_2027, 2026, 4, 33000, 132000],
  [LATE_2027, 2026, 1, 15960, 63840],
];
for (const [iso, gy, hh, lo, hi] of windows) {
  if (!holds(gy)) { console.log(`  skip  ${iso.slice(0, 10)} hh=${hh}: fpl.ts no longer holds the ${gy} table`); continue; }
  const r = acaPtcIncomeRange(hh, new Date(iso));
  check(`${iso.slice(0, 10)} hh=${hh}: credit window $${lo.toLocaleString()} to $${hi.toLocaleString()}`,
    r.min === lo && r.max === hi, `got $${r.min} to $${r.max} (guideline year ${r.guidelineYear}).`);
}
if (holds(2026)) {
  const ak = acaPtcIncomeRange(1, new Date(FIRST_2027), 'AK');
  check('AK keeps its own table for 2027 coverage ($19,950 single, ASPE 2026; cap $79,800)',
    ak.min === 19950 && ak.max === 79800,
    `got $${ak.min} to $${ak.max}. The state is being dropped from the named-year read.`);
  const akPerson = at(FIRST_2027, () => checkACA({ ...base, state: 'AK', annualIncome: 79000 }));
  check('AK single $79,000 qualifies for 2027 coverage (396% of the Alaska line, not 495% of the 48-state one)',
    akPerson.eligibilityStatus === 'likely_eligible' && /396%/.test(akPerson.reason), akPerson.reason);
}

// 4. The people (W8-06 / W8-07 / W5-09), plus controls that must not move.
if (holds(2025) && holds(2026)) {
  const fl = { age: 45, annualIncome: 63000 };
  const before = run(LAST_2026, fl), after = run(FIRST_2027, fl);
  check('W8-06 FL single 45, $63,000, Oct 31: over the 2026-coverage cap (403%)',
    before.eligibilityStatus === 'not_eligible' && /403%/.test(before.reason), `got ${before.eligibilityStatus}: ${before.reason}`);
  check('W8-06 FL single 45, $63,000, Nov 1: qualifies for 2027 coverage (395%)',
    after.eligibilityStatus === 'likely_eligible' && /395%/.test(after.reason) && /2027 coverage/.test(after.reason),
    `got ${after.eligibilityStatus}: ${after.reason}`);

  const fam = { householdSize: 4, numChildren: 2, annualIncome: 130000 };
  check('family of 4, $130,000: over on Oct 31, qualifies Nov 1 ($132,000 cap)',
    run(LAST_2026, fam).eligibilityStatus === 'not_eligible' && run(FIRST_2027, fam).eligibilityStatus === 'likely_eligible',
    `${run(LAST_2026, fam).reason} / ${run(FIRST_2027, fam).reason}`);
  check('single at $63,840 qualifies for 2027 coverage, $63,841 does not',
    run(FIRST_2027, { annualIncome: 63840 }).eligibilityStatus === 'likely_eligible'
      && run(FIRST_2027, { annualIncome: 63841 }).eligibilityStatus === 'not_eligible',
    'the 400% edge is off.');

  const emp = { state: 'TX', age: 35, annualIncome: 40000, currentlyInsured: true, insuranceSource: 'employer' };
  const e1 = run(LAST_2026, emp), e2 = run(FIRST_2027, emp);
  check('W8-07 employer plan: 9.96% on Oct 31, wording unchanged',
    e1.reason === 'You may qualify if your employer plan is unaffordable (costs > 9.96% of income)', e1.reason);
  check('W8-07 employer plan: 10.22% for plan years starting in 2027 on Nov 1',
    /10\.22%/.test(e2.reason) && /plan years starting in 2027/.test(e2.reason), e2.reason);

  const gap = { state: 'TX', annualIncome: 15800 };
  check('TX single $15,800: 101% for 2026 coverage, coverage gap for 2027 (the 100% line is $15,960)',
    run(LAST_2026, gap).eligibilityStatus === 'likely_eligible' && run(FIRST_2027, gap).eligibilityStatus === 'not_eligible'
      && run(FIRST_2027, gap).estimatedValue === 0,
    `${run(LAST_2026, gap).reason} / ${run(FIRST_2027, gap).reason}`);

  // Controls: the coverage gap (A1), Wisconsin, Medicaid referral, 65+, Medicare.
  for (const iso of [LAST_2026, FIRST_2027]) {
    const d = iso.slice(0, 10);
    const tx = run(iso, { state: 'TX', annualIncome: 12000 });
    check(`${d} CONTROL A1: TX single $12,000 stays in the coverage gap at $0`,
      tx.eligible === false && tx.estimatedValue === 0 && /coverage gap/.test(tx.reason), tx.reason);
    const wi = run(iso, { state: 'WI', age: 35, annualIncome: 12000 });
    check(`${d} CONTROL A1: WI single $12,000 goes to BadgerCare`, wi.eligible === false && /BadgerCare/.test(wi.reason), wi.reason);
    const ca = run(iso, { state: 'CA', annualIncome: 20000 });
    check(`${d} CONTROL: CA single $20,000 is referred to Medicaid`, ca.eligible === false && /138% FPL/.test(ca.reason), ca.reason);
    const old = run(iso, { state: 'OH', age: 70, annualIncome: 30000 });
    check(`${d} CONTROL: 70-year-old is sent to Medicare`, old.eligible === false && /Medicare/.test(old.reason), old.reason);
  }

  // 5. Immigration status. The CoveredUSA screener does not ask, so an absent answer must never deny.
  const ok = { annualIncome: 40000 };
  for (const iso of [LAST_2026, FIRST_2027]) {
    const d = iso.slice(0, 10);
    const absent = run(iso, ok), mixed = run(iso, { ...ok, citizenshipStatus: 'mixed' });
    check(`${d} no status answer: still likely_eligible (nobody denied for a question we never asked)`,
      absent.eligibilityStatus === 'likely_eligible', absent.reason);
    check(`${d} 'mixed' household: same answer as no answer`,
      mixed.eligibilityStatus === absent.eligibilityStatus && mixed.estimatedValue === absent.estimatedValue, mixed.reason);
  }
  const none26 = run(LAST_2026, { ...ok, citizenshipStatus: 'none' });
  check("'none', 2026 coverage: maybe (lawfully present immigrants still qualify)",
    none26.eligible === 'maybe' && none26.reason === ACA_STATUS_REASON_2026 && none26.estimatedValue > 0, none26.reason);
  const none27 = run(FIRST_2027, { ...ok, citizenshipStatus: 'none' });
  check("'none', 2027 coverage: maybe, $0, names Cuban/Haitian entrants and COFA (P.L. 119-21 s. 71301)",
    none27.eligible === 'maybe' && none27.estimatedValue === 0 && none27.reason === ACA_STATUS_REASON_2027, none27.reason);
} else {
  console.log('  skip  people: fpl.ts no longer holds both the 2025 and 2026 tables');
}

// 6. Staleness, on the REAL clock.
{
  const now = new RealDate();
  const y = now.getFullYear();
  const cy = acaCoverageYear(now);
  let readable = true;
  try { getFPLForYear(ptcGuidelineYear(cy), 1, 100); } catch { readable = false; }
  check(`today: fpl.ts holds the ${ptcGuidelineYear(cy)} guidelines that ${cy} coverage needs`, readable,
    `fpl.ts holds ${FPL_YEAR} and ${FPL_PRIOR_YEAR}. Do not roll the prior table away while ${cy} coverage is being sold.`);
  if (now >= new RealDate(`${y}-10-01T00:00:00-04:00`)) {
    check(`open enrollment for ${y + 1} coverage opens Nov 1: aca.ts has ${y + 1} values`,
      (y + 1) in ACA_AFFORDABILITY_PCT && (y + 1) in ACA_APPLICABLE_PERCENTAGES,
      `Add coverage year ${y + 1} to aca.ts: the Rev. Proc. applicable-percentage table and required contribution percentage for ${y + 1}, a gate at ${y}-11-01, and ptcGuidelineYear(${y + 1}) = ${y}. Same change in BenefitsUSA.`);
  }
  if (now >= new RealDate(`${y}-11-01T00:00:00-04:00`)) {
    check(`after Nov 1, ${y}: the screener answers for ${y + 1} coverage`, cy === y + 1,
      `acaCoverageYear() returned ${cy}.`);
  }
}

console.log(failures ? `\n${failures} FAILED` : '\nall passed');
process.exit(failures ? 1 : 0);
