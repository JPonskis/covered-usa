#!/usr/bin/env node
/**
 * validate-glossary.js
 *
 * Build-time schema validator for glossary JSON files. Wired in as prebuild.
 */

const fs = require('fs');
const path = require('path');
const { validateContentQuality } = require('./lib/content-quality');

const DIR = path.join(__dirname, '..', 'content', 'data', 'glossary');

const VALID_CATEGORIES = new Set(['ACA', 'Medicare', 'Medicaid', 'Insurance', 'Tax', 'Billing', 'Coverage']);
const VALID_CTA_TARGETS = new Set(['screener', 'analyzer']);

function isLocalizedString(v) {
  return v && typeof v === 'object' && typeof v.en === 'string' && typeof v.es === 'string';
}

function isLocalizedArray(v) {
  return v && typeof v === 'object' && Array.isArray(v.en) && Array.isArray(v.es);
}

function isISODate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function validateGlossary(slug, data) {
  const errors = [];
  const warn = (msg) => errors.push(msg);

  if (data.slug !== slug) warn(`slug "${data.slug}" doesn't match filename "${slug}"`);
  if (!isLocalizedString(data.term)) warn('term must be {en, es}');
  if (!Array.isArray(data.alternateNames)) warn('alternateNames must be an array');
  if (!isLocalizedString(data.definition)) warn('definition must be {en, es}');
  if (!VALID_CATEGORIES.has(data.category))
    warn(`category "${data.category}" not in ${[...VALID_CATEGORIES].join(',')}`);
  if (typeof data.topic !== 'string') warn('topic must be a string');
  if (typeof data.medicalSpecialty !== 'string') warn('medicalSpecialty must be a string');
  if (!VALID_CTA_TARGETS.has(data.ctaTarget))
    warn(`ctaTarget "${data.ctaTarget}" must be screener or analyzer`);
  if (!isISODate(data.lastUpdated)) warn(`lastUpdated "${data.lastUpdated}" not ISO YYYY-MM-DD`);
  if (typeof data.readingTime !== 'string') warn('readingTime must be a string');

  if (!data.meta || !isLocalizedString(data.meta.title) || !isLocalizedString(data.meta.description))
    warn('meta.title and meta.description must be {en, es}');

  if (!data.hero || !isLocalizedString(data.hero.h1) || !isLocalizedString(data.hero.subhero))
    warn('hero.h1 and hero.subhero must be {en, es}');

  if (!isLocalizedString(data.quickDefinition)) warn('quickDefinition must be {en, es}');

  // introParagraphs — Track C-prime DOWNSCOPE: empty array is the canonical shape
  // per FANOUT_FORMULA §4.5. Definition + quickDefinition + hero.subhero cover the
  // intro role. Field is required by schema (TS non-optional) but content drops to zero.
  if (!Array.isArray(data.introParagraphs))
    warn('introParagraphs must be an array (use [] for Track C-prime downscope shape)');
  else data.introParagraphs.forEach((p, i) => {
    if (!isLocalizedString(p)) warn(`introParagraphs[${i}] must be {en, es}`);
  });

  // annualLimits (optional)
  if (data.annualLimits !== undefined) {
    if (!isLocalizedArray(data.annualLimits.headers))
      warn('annualLimits.headers must be {en:[], es:[]}');
    if (!Array.isArray(data.annualLimits.rows))
      warn('annualLimits.rows must be an array');
    else data.annualLimits.rows.forEach((r, i) => {
      if (!isLocalizedArray(r)) warn(`annualLimits.rows[${i}] must be {en:[], es:[]}`);
    });
    if (!isLocalizedString(data.annualLimits.footnote))
      warn('annualLimits.footnote must be {en, es}');
    if (typeof data.annualLimits.source !== 'string')
      warn('annualLimits.source must be a string');
  }

  // whatCountsToward (optional)
  if (data.whatCountsToward !== undefined) {
    if (!isLocalizedString(data.whatCountsToward.intro))
      warn('whatCountsToward.intro must be {en, es}');
    if (!Array.isArray(data.whatCountsToward.items))
      warn('whatCountsToward.items must be an array');
  }

  // whatDoesNotCountToward (optional)
  if (data.whatDoesNotCountToward !== undefined) {
    if (!isLocalizedString(data.whatDoesNotCountToward.intro))
      warn('whatDoesNotCountToward.intro must be {en, es}');
    if (!Array.isArray(data.whatDoesNotCountToward.items))
      warn('whatDoesNotCountToward.items must be an array');
  }

  // workedExample (optional)
  if (data.workedExample !== undefined) {
    if (!isLocalizedString(data.workedExample.intro))
      warn('workedExample.intro must be {en, es}');
    if (!isLocalizedArray(data.workedExample.headers))
      warn('workedExample.headers must be {en:[], es:[]}');
    if (!Array.isArray(data.workedExample.rows))
      warn('workedExample.rows must be an array');
    if (!isLocalizedString(data.workedExample.footnote))
      warn('workedExample.footnote must be {en, es}');
  }

  // detailSections — Track C-prime DOWNSCOPE: ≤1 entry, only when comparison- or
  // lookup-shaped. NEVER history/mechanics/why-it-exists. Per FANOUT_FORMULA §4.5
  // glossary's strategic role is internal-link target, not citation magnet.
  // Previously required MIN 2; the old contract drove the bloat the audit flagged.
  //
  // Note: the >1 check is writer-time enforcement via GATE H (in the writer prompt
  // and verifier agent). Build-time validator only enforces the SHAPE here — pages
  // that pre-date Track C-prime (magi, deductible, out-of-pocket-maximum) have
  // 2-4 legacy detailSections and remain in place until Track E downsize. Logging
  // the over-cap count as a warning rather than a build failure keeps the build
  // green during the contract-evolution window.
  if (!Array.isArray(data.detailSections))
    warn('detailSections must be an array (use [] for Track C-prime downscope shape, max 1 entry)');
  else {
    if (data.detailSections.length > 1)
      console.warn(`  ⚠️  ${slug}.json: detailSections has ${data.detailSections.length} entries (Track C-prime §4.5 cap is 1; Track E downsize pending)`);
    data.detailSections.forEach((s, i) => {
      if (!isLocalizedString(s.heading)) warn(`detailSections[${i}].heading must be {en, es}`);
      if (!Array.isArray(s.paragraphs)) warn(`detailSections[${i}].paragraphs must be an array`);
    });
  }

  // faqs flat-strings rule
  if (!data.faqs || !Array.isArray(data.faqs.en) || !Array.isArray(data.faqs.es))
    warn('faqs.en and faqs.es must each be arrays');
  else {
    data.faqs.en.forEach((f, i) => {
      if (typeof f.question !== 'string') warn(`faqs.en[${i}].question must be a flat string`);
      if (typeof f.answer !== 'string') warn(`faqs.en[${i}].answer must be a flat string`);
    });
    data.faqs.es.forEach((f, i) => {
      if (typeof f.question !== 'string') warn(`faqs.es[${i}].question must be a flat string`);
      if (typeof f.answer !== 'string') warn(`faqs.es[${i}].answer must be a flat string`);
    });
    if (data.faqs.en.length !== data.faqs.es.length)
      warn(`faqs.en (${data.faqs.en.length}) and faqs.es (${data.faqs.es.length}) length mismatch`);
  }

  // relatedLinks
  if (!Array.isArray(data.relatedLinks)) warn('relatedLinks must be an array');
  else data.relatedLinks.forEach((l, i) => {
    if (!isLocalizedString(l.label)) warn(`relatedLinks[${i}].label must be {en, es}`);
    if (typeof l.href !== 'string') warn(`relatedLinks[${i}].href must be a string`);
  });

  // sources
  if (!Array.isArray(data.sources) || data.sources.length < 1)
    warn('sources must be a non-empty array');
  else data.sources.forEach((s, i) => {
    if (typeof s.name !== 'string') warn(`sources[${i}].name must be a string`);
    if (typeof s.url !== 'string') warn(`sources[${i}].url must be a string`);
    if (!isLocalizedString(s.note)) warn(`sources[${i}].note must be {en, es}`);
  });

  return errors;
}

function main() {
  if (!fs.existsSync(DIR)) {
    console.log('No glossary dir found (skipping).');
    return;
  }
  const files = fs.readdirSync(DIR)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_') && !f.endsWith('.tmp.json'));

  let totalErrors = 0;
  let badFiles = 0;
  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
    } catch (err) {
      console.error(`❌ ${file}: failed to parse JSON — ${err.message}`);
      totalErrors++; badFiles++; continue;
    }
    const errors = validateGlossary(slug, data);
    const cq = validateContentQuality(slug, data);
    cq.warnings.forEach((w) => console.warn(`  ⚠️  ${file}: ${w}`));
    const allErrors = [...errors, ...cq.errors];
    if (allErrors.length > 0) {
      console.error(`❌ ${file} (${allErrors.length} issues):`);
      allErrors.forEach((e) => console.error(`    - ${e}`));
      totalErrors += allErrors.length;
      badFiles++;
    } else if (cq.warnings.length > 0) {
      console.log(`✅ ${file} (${cq.warnings.length} content-quality warnings)`);
    } else {
      console.log(`✅ ${file}`);
    }
  }
  console.log('---');
  console.log(`Validated ${files.length} glossary files. ${badFiles} bad. ${totalErrors} total issues.`);
  if (totalErrors > 0) process.exit(1);
}

main();
