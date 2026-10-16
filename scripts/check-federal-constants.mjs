#!/usr/bin/env node
/**
 * check:constants: the guard that makes "the numbers are right" CHECKABLE on CoveredUSA.
 *
 * Ported from BenefitsUSA's scripts/check-federal-constants.mjs and from a CoveredUSA draft of
 * 2026-07-26 that was written on one machine and never committed (audit A20, W8 Notes #5). In
 * the eleven weeks it sat uncommitted, the two drifts it was written to catch shipped and stayed
 * live: /medicare-eligibility kept the 2025 Part B premium ($185) under a "2026 Cost" header
 * while the engine ran on $202.90, and the bill analyzer kept a private table named FPL_2026
 * that held the 2025 guidelines, so every charity-care percentage ran about 2% high. The
 * poverty-level page also quoted a 2024 figure ($60,240) as the ACA ceiling.
 *
 * A page that renders a stale number and still returns 200 is an invisible outage
 * (RESILIENCE.md). This turns that silence into a loud, dated failure. Three checks:
 *
 *   1. STALENESS: the HHS poverty guidelines declare the year they are valid for; fail once it is
 *      past (they publish during January, so from February 1).
 *   1b. DATED TABLES (jan1-other, eligibility audit 2026-10): Medicare and SSI figures live in
 *      src/lib/eligibility/constants.ts as one row per year with its effective instant, the
 *      shape BenefitsUSA uses. A published next-year row sits inert until January 1 and takes
 *      over on its own, so the calendar turning over never fails a build. What is checked: the
 *      rows are in order and the first is complete (a FAILURE when wrong), and from December 1
 *      (SSI: November 15) a NAG lists next year's empty or missing slots. The nag prints in
 *      every build log and never fails one, because until January 2027 this guard failed every
 *      CoveredUSA build from January 1, the daily drip-publish included, until somebody rolled
 *      the Medicare year by hand. CHECK_CONSTANTS_STRICT=1 turns the nag into a failure for a
 *      person who wants the reminder to stop them.
 *   2. REGRESSION: known-stale figures must never reappear anywhere in src/.
 *   3. DRIFT: canonical figures must not be retyped outside the files that own them.
 *
 * Run:  node scripts/check-federal-constants.mjs   (npm run check:constants; part of prebuild)
 * Test the clock: CHECK_CONSTANTS_NOW=2027-01-02T12:00:00Z node scripts/check-federal-constants.mjs
 * Escape hatch: put `canonical-ok` in a comment on the same line if a match is genuinely
 * unrelated (a ZIP code, a price, a coincidence).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');

/** Files allowed to contain the canonical figures as literals. */
const CANONICAL_FILES = [
  'src/lib/eligibility/fpl-guidelines.ts', // HHS poverty guidelines, both years
  'src/lib/eligibility/fpl.ts', // AK/HI adjustments and the functions over the table
  'src/lib/eligibility/constants.ts', // dated Medicare and SSI rows (medicareFor, ssaFor)
  'src/lib/eligibility/programs/aca.ts', // coverage-year PTC math; its comments quote the caps
];

/**
 * Where the year declarations live, and the date a declaration goes stale.
 * `staleFrom(year)` is the first instant the year's figures are no longer current.
 */
const YEAR_DECLARATIONS = [
  {
    file: 'src/lib/eligibility/fpl-guidelines.ts',
    key: 'FPL_YEAR',
    what: 'HHS poverty guidelines (ASPE publishes the new ones during January)',
    source: 'https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines',
    // January is left for ASPE to publish; failing on Jan 1 would block every build for
    // weeks while the current table is still the latest published one.
    staleFrom: (y) => new Date(`${y + 1}-02-01T00:00:00-05:00`),
  },
];

/**
 * Figures that were WRONG and have been removed. If one comes back, someone has retyped a
 * stale number: fail and say where. Checked everywhere, canonical files included; the prior-year
 * ACA table in fpl-guidelines.ts is the one legitimate home of a 2025 figure and carries
 * `canonical-ok`.
 *
 * NOT here, on purpose: $63,840 and $132,000. The July draft listed them as stale, which was
 * right for 2026 coverage, but they are the correct 400% caps for 2027 coverage (open
 * enrollment from Nov 1, 2026). They are policed as DRIFT below instead: no page may type them.
 */
const STALE = [
  { pat: /\$?15,?650\b/, was: 'poverty guideline, 1 person', year: 2025, now: 'getFPL() / getFPLForYear()' },
  { pat: /\$?21,?150\b/, was: 'poverty guideline, household of 2', year: 2025, now: 'getFPL()' },
  { pat: /\$?26,?650\b/, was: 'poverty guideline, household of 3', year: 2025, now: 'getFPL()' },
  { pat: /\$?32,?150\b/, was: 'poverty guideline, household of 4', year: 2025, now: 'getFPL()' },
  { pat: /\$?37,?650\b/, was: 'poverty guideline, household of 5', year: 2025, now: 'getFPL()' },
  { pat: /\$?43,?150\b/, was: 'poverty guideline, household of 6', year: 2025, now: 'getFPL()' },
  { pat: /\$?48,?650\b/, was: 'poverty guideline, household of 7', year: 2025, now: 'getFPL()' },
  { pat: /\$?54,?150\b/, was: 'poverty guideline, household of 8', year: 2025, now: 'getFPL()' },
  { pat: /\$60,?240\b/, was: '400% of the poverty line, 1 person, quoted as the ACA ceiling', year: 2024, now: 'acaPtcIncomeRange(1).max' },
  // `$` required: a bare 185 is too common to mean Medicare.
  { pat: /\$\s?185(\.00)?\b/, was: 'Medicare Part B standard premium', year: 2025, now: 'medicareFor().partBPremiumMonthly' },
];

/**
 * Current canonical figures. Correct, but they belong in ONE place. Finding one retyped elsewhere
 * means a new private copy is being born, which is how every drift above started.
 */
const DRIFT = [
  { pat: /\b15,?960\b/, name: 'FPL_BASE (call getFPL)' },
  { pat: /\b5,?680\b/, name: 'FPL_INCREMENT (call getFPL)' },
  { pat: /\b202\.90\b/, name: 'medicareFor().partBPremiumMonthly' },
  // The nursing-home income limit is 300% of the SSI rate and moves every January 1: read it
  // from nursingHomeIncomeLimitMonthly() (2026 $2,982, 2027 $3,087), never type it.
  { pat: /\$2,?982\b/, name: 'nursingHomeIncomeLimitMonthly() (2026)' },
  { pat: /\$3,?087\b/, name: 'nursingHomeIncomeLimitMonthly() (2027)' },
  // The ACA 400% caps for each coverage year: read them from acaPtcIncomeRange().
  { pat: /\$62,?600\b/, name: 'acaPtcIncomeRange(1).max for 2026 coverage' },
  { pat: /\$128,?600\b/, name: 'acaPtcIncomeRange(4).max for 2026 coverage' },
  { pat: /\$63,?840\b/, name: 'acaPtcIncomeRange(1).max for 2027 coverage' },
  { pat: /\$132,?000\b/, name: 'acaPtcIncomeRange(4).max for 2027 coverage' },
];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === '.next' || e.startsWith('.')) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|md)$/.test(e)) out.push(p);
  }
  return out;
}

const failures = [];
const files = walk(SRC);
const now = process.env.CHECK_CONSTANTS_NOW ? new Date(process.env.CHECK_CONSTANTS_NOW) : new Date();
if (Number.isNaN(now.getTime())) {
  console.error(`CHECK_CONSTANTS_NOW is not a date: ${process.env.CHECK_CONSTANTS_NOW}`);
  process.exit(1);
}

// ── 0. POSITIVE CONTROLS: a guard that read nothing would pass. ─────────────
if (files.length < 100) failures.push(`POSITIVE CONTROL: scanned only ${files.length} files under src/; the walk is broken.`);
for (const f of CANONICAL_FILES) {
  if (!existsSync(join(ROOT, f))) failures.push(`POSITIVE CONTROL: canonical file ${f} is missing; update CANONICAL_FILES.`);
}

// ── 1. STALENESS ─────────────────────────────────────────────────────────────
const declared = {};
/** A missing file is already reported by the positive control above; never crash on it. */
const readIfExists = (file) => (existsSync(join(ROOT, file)) ? readFileSync(join(ROOT, file), 'utf8') : '');

for (const { file, key, what, source, staleFrom } of YEAR_DECLARATIONS) {
  const text = readIfExists(file);
  const m = text.match(new RegExp(`export const ${key}\\s*=\\s*(\\d{4})`));
  if (!m) {
    failures.push(`${key} is missing from ${file}. Every federal figure must declare the year it is valid for.`);
    continue;
  }
  const year = Number(m[1]);
  declared[key] = year;
  const deadline = staleFrom(year);
  if (now >= deadline) {
    failures.push(
      `${key} is ${year}, and those figures stopped being current on ${deadline.toISOString().slice(0, 10)}. These are ${what}.\n` +
      `      Re-verify at ${source}, update the values AND the year in ${file}, then re-run.`
    );
  }
}
{
  const g = readIfExists('src/lib/eligibility/fpl-guidelines.ts');
  const prior = g.match(/export const FPL_PRIOR_YEAR\s*=\s*(\d{4})/);
  if (!prior) failures.push('FPL_PRIOR_YEAR is missing from src/lib/eligibility/fpl-guidelines.ts.');
  else if (declared.FPL_YEAR && Number(prior[1]) !== declared.FPL_YEAR - 1) {
    failures.push(`fpl-guidelines.ts says FPL_YEAR ${declared.FPL_YEAR} and FPL_PRIOR_YEAR ${prior[1]}; the prior table must be the year before. Roll both together.`);
  }
}

// ── 1b. DATED TABLES (Medicare, SSI) ────────────────────────────────────────
/* Loaded through the repo's TS hook (package.json runs this script with
   --import ./scripts/register-ts.mjs). A load failure is a hard failure, never a skip. */
const nags = [];
let medicareNow = null;
try {
  const C = await import('../src/lib/eligibility/constants.ts');
  const etDate = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const today = etDate(now);
  const thisYear = Number(today.slice(0, 4));

  for (const [name, rows] of [['SSA_BY_YEAR', C.SSA_BY_YEAR], ['MEDICARE_BY_YEAR', C.MEDICARE_BY_YEAR]]) {
    if (!rows?.length) { failures.push(`${name} is empty in src/lib/eligibility/constants.ts.`); continue; }
    rows.forEach((r, i) => {
      const t = Date.parse(r.effective);
      if (Number.isNaN(t)) failures.push(`${name} ${r.year}: effective "${r.effective}" is not an instant.`);
      if (!/^\d{4}-01-01T00:00:00-05:00$/.test(r.effective) || Number(r.effective.slice(0, 4)) !== r.year) {
        failures.push(`${name} ${r.year}: effective must be midnight Eastern on January 1 of its own year, got ${r.effective}.`);
      }
      if (i > 0 && !(t > Date.parse(rows[i - 1].effective) && r.year === rows[i - 1].year + 1)) {
        failures.push(`${name}: rows must run one year at a time in effective order (${rows[i - 1].year} then ${r.year}).`);
      }
    });
  }
  const first = C.MEDICARE_BY_YEAR[0];
  for (const [k, v] of Object.entries(first)) {
    if (v === null) failures.push(`MEDICARE_BY_YEAR ${first.year}: ${k} is empty; the first row must be complete (later rows fall back to it).`);
  }
  for (const r of C.SSA_BY_YEAR) {
    if (!(r.ssiIndividualMonthly > 0)) failures.push(`SSA_BY_YEAR ${r.year}: ssiIndividualMonthly must be the published SSI rate.`);
  }

  // Never early, never late: one minute before a row's instant the selectors still answer the row
  // before it, one minute after they answer the new row. And the nursing-home limit is 300% of the
  // SSI rate in force (42 CFR 435.1005), on both sides.
  for (const [name, rows, pick] of [['ssaFor', C.SSA_BY_YEAR, C.ssaFor], ['medicareFor', C.MEDICARE_BY_YEAR, C.medicareFor]]) {
    rows.forEach((r, i) => {
      if (i === 0) return;
      const t = Date.parse(r.effective);
      const before = pick(new Date(t - 60e3)).year;
      const after = pick(new Date(t + 60e3)).year;
      if (before !== rows[i - 1].year || after !== r.year) failures.push(`${name}: a minute either side of ${r.effective} answered ${before} / ${after}, expected ${rows[i - 1].year} / ${r.year}.`);
      if (name === 'ssaFor') {
        const nhBefore = C.nursingHomeIncomeLimitMonthly(new Date(t - 60e3)).amount;
        const nhAfter = C.nursingHomeIncomeLimitMonthly(new Date(t + 60e3)).amount;
        if (nhBefore !== 3 * rows[i - 1].ssiIndividualMonthly || nhAfter !== 3 * r.ssiIndividualMonthly) {
          failures.push(`nursingHomeIncomeLimitMonthly around ${r.effective}: $${nhBefore} / $${nhAfter}, expected 300% of the SSI rate ($${3 * rows[i - 1].ssiIndividualMonthly} / $${3 * r.ssiIndividualMonthly}).`);
        }
      }
    });
  }

  // A row must answer every instant from the first effective date on (the selectors throw otherwise).
  medicareNow = C.medicareFor(now);
  const ssaNow = C.ssaFor(now);

  // NAGS. Next year's row: from November 15 (SSA publishes the COLA in October) and December 1
  // (CMS publishes Part A/B in November). In force with carried slots: from January 1.
  const next = thisYear + 1;
  if (today >= `${thisYear}-11-15` && !C.SSA_BY_YEAR.some((r) => r.year === next)) {
    nags.push(`SSA_BY_YEAR has no ${next} row. SSA publishes the SSI rate for ${next} with the COLA in October (ssa.gov/oact/cola/SSIamts.html); add it with its quote.`);
  }
  if (today >= `${thisYear}-12-01`) {
    const row = C.MEDICARE_BY_YEAR.find((r) => r.year === next);
    if (!row) nags.push(`MEDICARE_BY_YEAR has no ${next} row. Add it from CMS's ${next} fact sheet and notices, leaving anything unpublished null.`);
    else {
      const empty = Object.entries(row).filter(([, v]) => v === null).map(([k]) => k);
      if (empty.length) nags.push(`MEDICARE_BY_YEAR ${next} still has empty slots: ${empty.join(', ')}. CMS publishes Part A/B in November (cms.gov newsroom fact sheet) and the MSP/LIS resource limits around October 31 (cms.gov/files/document/cy${next}-lis-resource-limits-memo.pdf). Fill each from its source; leave it null only if the agency has truly not published it.`);
    }
  }
  if (medicareNow.fallbacks.length) {
    nags.push(`The Medicare row in force (${medicareNow.year}) is answering ${medicareNow.fallbacks.length} slot(s) from an earlier year: ${medicareNow.fallbacks.map((f) => `${f.field} (${f.fromYear})`).join(', ')}. Pages label those figures with their own year, so nothing is mislabelled, but they are a year old.`);
  }
  if (ssaNow.year !== thisYear) nags.push(`The SSI row in force is ${ssaNow.year} on ${today}; add the ${thisYear} row.`);
} catch (e) {
  failures.push(`could not load src/lib/eligibility/constants.ts (${e?.message || e}). Run this script with --import ./scripts/register-ts.mjs, as package.json does. A load failure is a failure, never a skip.`);
}

// ── 2 & 3. REGRESSION AND DRIFT ─────────────────────────────────────────────
for (const file of files) {
  const rel = relative(ROOT, file);
  const isCanonical = CANONICAL_FILES.includes(rel);
  const lines = readFileSync(file, 'utf8').split('\n');

  lines.forEach((line, i) => {
    if (line.includes('canonical-ok')) return;

    for (const s of STALE) {
      if (s.pat.test(line)) {
        failures.push(
          `STALE VALUE at ${rel}:${i + 1}\n` +
          `      "${line.trim().slice(0, 110)}"\n` +
          `      That is the ${s.year} ${s.was}. Use ${s.now}.`
        );
      }
    }

    if (isCanonical) return;
    for (const d of DRIFT) {
      if (d.pat.test(line)) {
        failures.push(
          `RETYPED CONSTANT at ${rel}:${i + 1}\n` +
          `      "${line.trim().slice(0, 110)}"\n` +
          `      Import ${d.name} from src/lib/eligibility/ instead of typing it.`
        );
      }
    }
  });
}

if (nags.length) {
  const strict = process.env.CHECK_CONSTANTS_STRICT === '1';
  const out = strict ? console.error : console.warn;
  out(`\n${strict ? '✗' : '⚠'} check:constants NAG (${nags.length}): dated figures need a person. ${strict ? 'CHECK_CONSTANTS_STRICT=1, so this fails.' : 'This does not fail the build.'}\n`);
  nags.forEach((n, i) => out(`  ${i + 1}. ${n}\n`));
  if (strict) failures.push(`${nags.length} nag(s) above (CHECK_CONSTANTS_STRICT=1).`);
}

if (failures.length) {
  console.error(`\n✗ check:constants: ${failures.length} problem(s)\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  console.error(
    'Federal figures live in src/lib/eligibility/. Import them; never retype them.\n' +
    'Vintage rule: ACA premium tax credits for a coverage year use the guidelines in effect when its\n' +
    'open enrollment began (26 CFR 1.36B-1(h)); read them with acaPtcIncomeRange / getFPLForYear.\n' +
    'Medicaid, CHIP, MSP and any displayed "% of FPL" use the CURRENT table via getFPL.\n' +
    'If a match here is a genuine coincidence, add `canonical-ok` to that line.\n'
  );
  process.exit(1);
}

console.log(
  `✓ check:constants: ${files.length} source files clean. Poverty guidelines ${declared.FPL_YEAR}, ` +
  `Medicare row ${medicareNow?.year}${medicareNow?.fallbacks.length ? ` (${medicareNow.fallbacks.length} slots carried from an earlier year)` : ''}, as of ${now.toISOString().slice(0, 10)}.`
);
