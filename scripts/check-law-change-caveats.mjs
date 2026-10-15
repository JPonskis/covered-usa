/**
 * Law-change caveats on screener results (audit item A8A9A10-cusa; W8-08, W8-09, W5-06,
 * W5-08, W5-11, W5-12 and both critics, W9_critic_W8 and W9_critic_W5).
 *
 * P.L. 119-21 narrowed Medicaid/CHIP for immigrants from Oct 1, 2026 and the premium tax credit
 * from 2027 coverage, and added a Medicaid work requirement for expansion adults. The screener
 * asks neither status nor work hours, so (Jacob, 2026-10-14) every affected result carries one
 * plain caveat line, and the answer itself never changes.
 *
 * This runs the REAL engine for the item's people at pinned instants and fails if a caveat goes
 * missing, shows before its date, reaches someone it does not apply to, loses one of the
 * critic's carve-outs, or changes an answer. It also guards the California hub note (A9).
 */
import { readFileSync } from 'node:fs';
import { checkEligibility } from '../src/lib/eligibility/index.ts';
import { caveatKey, caveatText } from '../src/lib/eligibility/caveats.ts';

const RealDate = Date;
/** Run fn with the engine's clock pinned to iso (the engine reads `new Date()`). */
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

const SEP_30 = '2026-09-30T23:59:59-04:00';
const OCT_15 = '2026-10-15T12:00:00-04:00';
const OCT_31 = '2026-10-31T23:59:59-04:00';
const NOV_1 = '2026-11-01T00:00:01-04:00';
const JAN_2027 = '2027-01-20T12:00:00-05:00';

const base = {
  employmentStatus: 'employed', isPregnant: false, hasDisability: false, currentlyInsured: false,
  isVeteran: false, numChildren: 0, householdSize: 1, age: 40,
};
const run = (iso, p) => at(iso, () => checkEligibility({ ...base, ...p })).programs;
const prog = (programs, id) => programs.find((x) => x.id === id);
const ids = (r) => (r?.caveats ?? []).map((c) => c.id);
const allCaveats = (programs) => programs.flatMap((x) => x.caveats ?? []);
const strip = (programs) => programs.map(({ caveats, ...rest }) => rest);

console.log('Law-change caveats: immigration (Medicaid/CHIP now, tax credit from Nov 1) and work rules\n');

// 1. Texas single adult at ~120% FPL: the tax-credit caveat exists ONLY from Nov 1 (2027 coverage).
{
  const tx = { state: 'TX', annualIncome: 19200 };
  const before = prog(run(OCT_31, tx), 'aca');
  const after = prog(run(NOV_1, tx), 'aca');
  const jan = prog(run(JAN_2027, tx), 'aca');
  check('TX $19,200 on Oct 31: ACA likely, NO immigration caveat yet',
    before.eligibilityStatus === 'likely_eligible' && !before.caveats,
    `got ${before.eligibilityStatus} ${JSON.stringify(before.caveats)}. The 2027 limit is showing before 2027 coverage is on sale.`);
  check('TX $19,200 on Nov 1: ACA still likely, carries ptc_immigration_2027 once',
    after.eligibilityStatus === 'likely_eligible' && ids(after).join() === 'ptc_immigration_2027',
    `got ${after.eligibilityStatus} ${JSON.stringify(after.caveats)}. P.L. 119-21 s.71301 limits the 2027 credit; nobody here was asked their status.`);
  check('TX $19,200 on Jan 20, 2027: caveat still there', ids(jan).join() === 'ptc_immigration_2027',
    JSON.stringify(jan.caveats));
  check('TX $19,200: the answer itself (status, value) is the same with and without the caveat',
    after.estimatedValue === before.estimatedValue && after.eligible === before.eligible,
    `${before.estimatedValue}/${before.eligible} -> ${after.estimatedValue}/${after.eligible}`);
}

// 2. California adult at 100% FPL: Medi-Cal likely, with the immigration and work lines.
{
  const ca = { state: 'CA', annualIncome: 15960 };
  const m = prog(run(OCT_15, ca), 'medicaid');
  check('CA $15,960: Medi-Cal likely_eligible, unchanged answer',
    m.eligibilityStatus === 'likely_eligible' && m.estimatedValue === 10000, `${m.eligibilityStatus} ${m.estimatedValue}`);
  check('CA $15,960: carries the work line (expansion adult, 6-month renewals) and the immigration line',
    ids(m).join() === 'medicaid_work,medicaid_immigration' && m.caveats[0].renewEvery6Months === true && m.caveats[0].state === 'CA',
    JSON.stringify(m.caveats));
  const sep = prog(run(SEP_30, ca), 'medicaid');
  check('CA $15,960 on Sep 30, 2026: no immigration line before s.71109 took effect',
    !ids(sep).includes('medicaid_immigration'), JSON.stringify(sep.caveats));
  const all = prog(run(OCT_15, { ...ca, citizenshipStatus: 'all' }), 'medicaid');
  check('CA household answering "all citizens or green card holders": no immigration line',
    !ids(all).includes('medicaid_immigration'), JSON.stringify(all.caveats));
}

// 3. CONTROLS: answers that must not move and must carry nothing.
for (const [label, p] of [
  ['65+ control, OH 70, $30,000 (Medicare only)', { state: 'OH', age: 70, annualIncome: 30000 }],
  ['coverage-gap control, TX 40, $12,000', { state: 'TX', annualIncome: 12000 }],
  ['over-400% control, FL 40, $150,000', { state: 'FL', annualIncome: 150000 }],
]) {
  for (const iso of [OCT_15, NOV_1, JAN_2027]) {
    const ps = run(iso, p);
    check(`${label} at ${iso.slice(0, 10)}: no caveat on any program`, allCaveats(ps).length === 0,
      JSON.stringify(allCaveats(ps)));
  }
}
{
  const ps = run(OCT_15, { state: 'OH', age: 70, annualIncome: 30000 });
  check('65+ control: Medicare likely, Medicaid not eligible (unchanged)',
    prog(ps, 'medicare').eligibilityStatus === 'likely_eligible' && prog(ps, 'medicaid').eligible === false,
    JSON.stringify(strip(ps).map((x) => [x.id, x.eligibilityStatus])));
}

// 4. Who the work line must NOT reach (W5-08: pregnant, disabled, 65+; never a non-expansion
//    child-only answer).
{
  const preg = prog(run(OCT_15, { state: 'TX', age: 29, isPregnant: true, annualIncome: 36000 }), 'medicaid');
  check('pregnant TX $36,000: immigration line only, no work line',
    ids(preg).join() === 'medicaid_immigration', JSON.stringify(preg.caveats));
  const dis = prog(run(OCT_15, { state: 'OH', age: 40, hasDisability: true, annualIncome: 15000 }), 'medicaid');
  check('expansion adult with a disability: no work line', !ids(dis).includes('medicaid_work'),
    JSON.stringify(dis.caveats));
  const aged = prog(run(OCT_15, { state: 'OH', age: 70, annualIncome: 10000 }), 'medicaid');
  check('OH 70, $10,000 (aged Medicaid): immigration line, no work line',
    ids(aged).join() === 'medicaid_immigration', JSON.stringify(aged.caveats));
  const kids = run(OCT_15, { state: 'TX', age: 35, householdSize: 3, numChildren: 2, annualIncome: 40000 });
  check('TX parent, children-only Medicaid/CHIP: no work line (the parent is not covered)',
    !allCaveats(kids).some((c) => c.id === 'medicaid_work'), JSON.stringify(allCaveats(kids)));
  check('TX children: Medicaid AND CHIP both carry the immigration line (s.71109(b) covers CHIP)',
    ids(prog(kids, 'medicaid')).includes('medicaid_immigration') && ids(prog(kids, 'chip')).includes('medicaid_immigration'),
    JSON.stringify([prog(kids, 'medicaid').caveats, prog(kids, 'chip').caveats]));
  const [a, b] = [prog(kids, 'medicaid').caveats[0], prog(kids, 'chip').caveats[0]];
  check('...and they share one key, so the results page prints it once', caveatKey(a) === caveatKey(b),
    `${caveatKey(a)} vs ${caveatKey(b)}`);
}

// 5. State variants of the work line (NE, MT already enforce; IA from Dec 1, 2026; WI waiver).
const workText = (state, locale = 'en') => {
  const m = prog(run(OCT_15, { state, age: 30, annualIncome: 15000 }), 'medicaid');
  const w = (m.caveats ?? []).find((c) => c.id === 'medicaid_work');
  return w ? caveatText(w, locale).body : '';
};
check('NE: "Nebraska already requires"', workText('NE').startsWith('Nebraska already requires'), workText('NE'));
check('MT: "Montana already requires"', workText('MT').startsWith('Montana already requires'), workText('MT'));
check('IA: names December 1, 2026', workText('IA').includes('December 1, 2026'), workText('IA'));
check('OH (any other expansion state): "as early as January 2027 depending on your state"',
  workText('OH').includes('starting as early as January 2027 depending on your state'), workText('OH'));
check('every work line says GET and keep (critic W5-08: work is a condition of getting coverage)',
  ['NE', 'MT', 'IA', 'OH'].every((s) => workText(s).includes('get and keep')), 'missing "get and keep"');
check('expansion work line names the 6-month renewal from 2027 (s.71107)',
  workText('OH').includes('renew every 6 months'), workText('OH'));
{
  const wi = prog(run(OCT_15, { state: 'WI', age: 35, annualIncome: 12000 }), 'aca');
  const w = (wi.caveats ?? []).find((c) => c.id === 'medicaid_work');
  check('WI $12,000: the BadgerCare pointer carries the work line (waiver adults, critic W8-09)',
    !!w && w.renewEvery6Months === false, JSON.stringify(wi.caveats));
  check('...without the 6-month renewal line (unresolved for WI waiver adults, W9_critic_W5)',
    !!w && !caveatText(w, 'en').body.includes('6 months') && !caveatText(w, 'es').body.includes('6 meses'),
    w ? caveatText(w, 'en').body : 'no caveat');
}

// 6. Tax-credit caveat edge cases.
{
  const none = prog(run(NOV_1, { state: 'TX', annualIncome: 19200, citizenshipStatus: 'none' }), 'aca');
  check('"none" household on Nov 1: status reason already explains, no duplicate caveat', !none.caveats,
    JSON.stringify(none.caveats));
  const emp = prog(run(NOV_1, { state: 'TX', annualIncome: 40000, currentlyInsured: true, insuranceSource: 'employer' }), 'aca');
  check('employer-plan "maybe" on Nov 1 carries the tax-credit caveat', ids(emp).join() === 'ptc_immigration_2027',
    JSON.stringify(emp.caveats));
  const empOct = prog(run(OCT_31, { state: 'TX', annualIncome: 40000, currentlyInsured: true, insuranceSource: 'employer' }), 'aca');
  check('...and not on Oct 31', !empOct.caveats, JSON.stringify(empOct.caveats));
}

// 7. The words: both languages, no em dash, and every carve-out the critics require.
{
  const samples = [
    { id: 'medicaid_immigration' }, { id: 'ptc_immigration_2027' },
    { id: 'medicaid_work', state: 'OH', renewEvery6Months: true },
    { id: 'medicaid_work', state: 'NE', renewEvery6Months: true },
    { id: 'medicaid_work', state: 'IA', renewEvery6Months: true },
    { id: 'medicaid_work', state: 'WI', renewEvery6Months: false },
  ];
  for (const c of samples) {
    const en = caveatText(c, 'en');
    const es = caveatText(c, 'es');
    const tag = caveatKey(c);
    check(`${tag}: English and Spanish both present and different`,
      en.body.length > 40 && es.body.length > 40 && en.body !== es.body && en.label && es.label, `${en.body} | ${es.body}`);
    check(`${tag}: no em dash in either language`, !/\u2014/.test(en.body + en.label + es.body + es.label),
      'house rule: no em dashes in copy');
  }
  const mi = caveatText({ id: 'medicaid_immigration' }, 'en').body;
  const miEs = caveatText({ id: 'medicaid_immigration' }, 'es').body;
  for (const [carve, en, es] of [
    ['emergency Medicaid', 'Emergency Medicaid', 'Medicaid de emergencia'],
    ['state option for lawfully residing children and pregnant women', 'lawfully residing children and pregnant women', 'niños y mujeres embarazadas'],
    ['5-year wait for green card holders', '5 years', '5 años'],
    ['refugees and asylees are not held to the wait', 'unless they came as a refugee or asylee', 'refugiados o asilados'],
    ['the four groups that still qualify', 'green card holders, Cuban and Haitian entrants', 'entrantes cubanos y haitianos'],
  ]) {
    check(`Medicaid/CHIP caveat keeps: ${carve}`, mi.includes(en) && miEs.includes(es), `${mi}\n        ${miEs}`);
  }
  const pt = caveatText({ id: 'ptc_immigration_2027' }, 'en').body;
  check('tax-credit caveat names only green card holders, Cuban/Haitian entrants and COFA citizens',
    pt.includes('green card holders, Cuban and Haitian entrants') && pt.includes('Compact of Free Association') && pt.includes('2027 coverage'),
    pt);
}

// 8. A9: the California hub note must not say California enrolls undocumented adults.
{
  const src = readFileSync(new URL('../src/app/[locale]/medicaid-income-limits/page.tsx', import.meta.url), 'utf8');
  check('medicaid-income-limits hub: no "covers undocumented adults" (DHCS ACWDL 25-33 freeze, 19+)',
    !/covers undocumented adults|cubre adultos indocumentados/.test(src),
    'California stopped new full-scope enrollment of undocumented adults 19+ on Jan 1, 2026.');
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nall passed');
process.exit(failures ? 1 : 0);
