#!/usr/bin/env node
/**
 * validate-procedures.js
 *
 * Build-time schema validator for procedure JSON files.
 * Run before `next build` (or as part of `prebuild`) to catch malformed
 * procedure data before it crashes the dynamic route at render time.
 *
 * Exits non-zero on any structural problem so CI / Vercel build fails fast.
 */

const fs = require('fs');
const path = require('path');
const { validateContentQuality } = require('./lib/content-quality');

const PROCEDURES_DIR = path.join(__dirname, '..', 'content', 'data', 'procedures');

const VALID_PROCEDURE_TYPES = new Set([
  'Diagnostic',
  'Surgical',
  'Therapeutic',
  'Palliative',
]);

function isLocalizedString(v) {
  return v && typeof v === 'object' && typeof v.en === 'string' && typeof v.es === 'string';
}

function isLocalizedArray(v) {
  return v && typeof v === 'object' && Array.isArray(v.en) && Array.isArray(v.es);
}

function isISODate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function validateProcedure(slug, data) {
  const errors = [];
  const warn = (msg) => errors.push(msg);

  // Top-level required fields
  if (data.slug !== slug) warn(`slug field "${data.slug}" doesn't match filename "${slug}"`);
  if (!isLocalizedString(data.procedureName)) warn('procedureName must be {en, es}');
  if (!isLocalizedString(data.shortName)) warn('shortName must be {en, es}');
  if (!VALID_PROCEDURE_TYPES.has(data.procedureType))
    warn(`procedureType "${data.procedureType}" not in ${[...VALID_PROCEDURE_TYPES].join(',')}`);
  if (typeof data.medicalSpecialty !== 'string') warn('medicalSpecialty must be a string');
  if (!isISODate(data.lastUpdated)) warn(`lastUpdated "${data.lastUpdated}" not ISO YYYY-MM-DD`);
  if (typeof data.readingTime !== 'string') warn('readingTime must be a string');
  if (!Array.isArray(data.hcpcsCodes)) warn('hcpcsCodes must be an array');

  // meta
  if (!data.meta || !isLocalizedString(data.meta.title) || !isLocalizedString(data.meta.description))
    warn('meta.title and meta.description must be {en, es}');

  // hero
  if (!data.hero || !isLocalizedString(data.hero.h1) || !isLocalizedString(data.hero.subhero))
    warn('hero.h1 and hero.subhero must be {en, es}');

  // quickAnswer
  if (!isLocalizedString(data.quickAnswer)) warn('quickAnswer must be {en, es}');

  // pricing
  if (!data.pricing) {
    warn('pricing object missing');
  } else {
    const p = data.pricing;
    if (typeof p.nationalMedian !== 'number') warn('pricing.nationalMedian must be a number');
    if (typeof p.nationalLow !== 'number') warn('pricing.nationalLow must be a number');
    if (typeof p.nationalHigh !== 'number') warn('pricing.nationalHigh must be a number');
    if (typeof p.medicarePfsRate !== 'number') warn('pricing.medicarePfsRate must be a number');
    if (p.medicareOppsRate !== undefined && typeof p.medicareOppsRate !== 'number')
      warn('pricing.medicareOppsRate must be a number when present');
    if (typeof p.medicareCoinsurancePct !== 'number')
      warn('pricing.medicareCoinsurancePct must be a number');
    if (typeof p.partBDeductibleYear !== 'number') warn('pricing.partBDeductibleYear must be a number');
    if (typeof p.partBDeductibleAmount !== 'number')
      warn('pricing.partBDeductibleAmount must be a number');
    if (p.nationalLow > p.nationalHigh)
      warn(`pricing: nationalLow (${p.nationalLow}) > nationalHigh (${p.nationalHigh})`);
    if (p.nationalMedian < p.nationalLow || p.nationalMedian > p.nationalHigh)
      warn(
        `pricing: nationalMedian (${p.nationalMedian}) outside [${p.nationalLow}, ${p.nationalHigh}]`
      );
    if (p.partBDeductibleYear === 2026 && p.partBDeductibleAmount !== 283)
      warn(`pricing: partBDeductibleAmount for 2026 should be 283, got ${p.partBDeductibleAmount}`);
  }

  // introParagraphs
  if (!Array.isArray(data.introParagraphs) || data.introParagraphs.length < 1)
    warn('introParagraphs must be a non-empty array of {en,es}');
  else data.introParagraphs.forEach((p, i) => {
    if (!isLocalizedString(p)) warn(`introParagraphs[${i}] must be {en, es}`);
  });

  // siteOfService
  if (!data.siteOfService) {
    warn('siteOfService object missing');
  } else {
    if (!Array.isArray(data.siteOfService.rows) || data.siteOfService.rows.length < 1)
      warn('siteOfService.rows must be a non-empty array');
    else data.siteOfService.rows.forEach((r, i) => {
      if (!isLocalizedString(r.siteName)) warn(`siteOfService.rows[${i}].siteName must be {en,es}`);
      if (typeof r.rangeWithoutInsurance !== 'string')
        warn(`siteOfService.rows[${i}].rangeWithoutInsurance must be a string`);
      if (!isLocalizedString(r.medicareRate))
        warn(`siteOfService.rows[${i}].medicareRate must be {en,es}`);
    });
    if (!Array.isArray(data.siteOfService.explanationParagraphs))
      warn('siteOfService.explanationParagraphs must be an array');
    if (!isLocalizedString(data.siteOfService.tableFootnote))
      warn('siteOfService.tableFootnote must be {en,es}');
    if (typeof data.siteOfService.tableSource !== 'string')
      warn('siteOfService.tableSource must be a string');
  }

  // variants (optional)
  if (data.variants !== undefined) {
    const v = data.variants;
    if (!isLocalizedString(v.heading)) warn('variants.heading must be {en,es}');
    if (!isLocalizedString(v.intro)) warn('variants.intro must be {en,es}');
    if (!isLocalizedArray(v.headers)) warn('variants.headers must be {en:[],es:[]}');
    if (!Array.isArray(v.rows)) warn('variants.rows must be an array');
    else v.rows.forEach((r, i) => {
      if (!isLocalizedArray(r)) warn(`variants.rows[${i}] must be {en:[],es:[]}`);
    });
  }

  // medicareSection
  if (!data.medicareSection || !Array.isArray(data.medicareSection.paragraphs))
    warn('medicareSection.paragraphs must be an array');

  // factorsAffectingCost
  if (!data.factorsAffectingCost || !Array.isArray(data.factorsAffectingCost.items))
    warn('factorsAffectingCost.items must be an array');

  // commonBillingErrors (optional)
  if (data.commonBillingErrors !== undefined) {
    if (!isLocalizedString(data.commonBillingErrors.intro))
      warn('commonBillingErrors.intro must be {en,es}');
    if (!Array.isArray(data.commonBillingErrors.items))
      warn('commonBillingErrors.items must be an array');
  }

  // faqs — CRITICAL: en/es arrays of FLAT {question,answer} strings, NOT LocalizedString
  if (!data.faqs || !Array.isArray(data.faqs.en) || !Array.isArray(data.faqs.es)) {
    warn('faqs.en and faqs.es must each be arrays');
  } else {
    data.faqs.en.forEach((f, i) => {
      if (typeof f.question !== 'string')
        warn(`faqs.en[${i}].question must be a flat string (not LocalizedString)`);
      if (typeof f.answer !== 'string')
        warn(`faqs.en[${i}].answer must be a flat string (not LocalizedString)`);
    });
    data.faqs.es.forEach((f, i) => {
      if (typeof f.question !== 'string')
        warn(`faqs.es[${i}].question must be a flat string (not LocalizedString)`);
      if (typeof f.answer !== 'string')
        warn(`faqs.es[${i}].answer must be a flat string (not LocalizedString)`);
    });
    if (data.faqs.en.length !== data.faqs.es.length)
      warn(`faqs.en (${data.faqs.en.length}) and faqs.es (${data.faqs.es.length}) length mismatch`);
  }

  // relatedLinks
  if (!Array.isArray(data.relatedLinks)) warn('relatedLinks must be an array');
  else data.relatedLinks.forEach((l, i) => {
    if (!isLocalizedString(l.label)) warn(`relatedLinks[${i}].label must be {en,es}`);
    if (typeof l.href !== 'string') warn(`relatedLinks[${i}].href must be a string`);
  });

  // sources
  if (!Array.isArray(data.sources) || data.sources.length < 1) {
    warn('sources must be a non-empty array');
  } else {
    data.sources.forEach((s, i) => {
      if (typeof s.name !== 'string') warn(`sources[${i}].name must be a string`);
      if (typeof s.url !== 'string') warn(`sources[${i}].url must be a string`);
      if (!isLocalizedString(s.note)) warn(`sources[${i}].note must be {en,es}`);
    });
  }

  return errors;
}

function main() {
  if (!fs.existsSync(PROCEDURES_DIR)) {
    console.error(`Procedures dir not found: ${PROCEDURES_DIR}`);
    process.exit(1);
  }
  const files = fs
    .readdirSync(PROCEDURES_DIR)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_') && !f.endsWith('.tmp.json'));

  let totalErrors = 0;
  let badFiles = 0;

  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    const filePath = path.join(PROCEDURES_DIR, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error(`❌ ${file}: failed to parse JSON — ${err.message}`);
      totalErrors++;
      badFiles++;
      continue;
    }
    const errors = validateProcedure(slug, data);
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
  console.log(`Validated ${files.length} procedure files. ${badFiles} bad. ${totalErrors} total issues.`);
  if (totalErrors > 0) {
    process.exit(1);
  }
}

main();
