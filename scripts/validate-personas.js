#!/usr/bin/env node
/**
 * validate-personas.js
 * Build-time schema validator for persona JSONs. Wired into prebuild.
 */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'content', 'data', 'personas');

const VALID_CATEGORIES = new Set([
  'Self-Employment', 'Age / Life Stage', 'Employment Status',
  'Family Status', 'Income Status', 'Veteran / Service',
]);
const VALID_CTA = new Set(['screener', 'analyzer']);

function isLocalizedString(v) {
  return v && typeof v === 'object' && typeof v.en === 'string' && typeof v.es === 'string';
}
function isLocalizedArray(v) {
  return v && typeof v === 'object' && Array.isArray(v.en) && Array.isArray(v.es);
}
function isISODate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function validatePersona(slug, data) {
  const errors = [];
  const warn = (msg) => errors.push(msg);

  if (data.slug !== slug) warn(`slug "${data.slug}" doesn't match filename`);
  if (!isLocalizedString(data.personaName)) warn('personaName must be {en, es}');
  if (!isLocalizedString(data.shortName)) warn('shortName must be {en, es}');
  if (!VALID_CATEGORIES.has(data.category))
    warn(`category "${data.category}" not in ${[...VALID_CATEGORIES].join(',')}`);
  if (typeof data.topic !== 'string') warn('topic must be a string');
  if (typeof data.medicalSpecialty !== 'string') warn('medicalSpecialty must be a string');
  if (!VALID_CTA.has(data.ctaTarget)) warn(`ctaTarget "${data.ctaTarget}" invalid`);
  if (!isISODate(data.lastUpdated)) warn(`lastUpdated "${data.lastUpdated}" not ISO`);
  if (typeof data.readingTime !== 'string') warn('readingTime must be a string');

  if (!data.meta || !isLocalizedString(data.meta.title) || !isLocalizedString(data.meta.description))
    warn('meta.title and description must be {en, es}');
  if (!data.hero || !isLocalizedString(data.hero.h1) || !isLocalizedString(data.hero.subhero))
    warn('hero must be {h1, subhero} both {en, es}');
  if (!isLocalizedString(data.quickAnswer)) warn('quickAnswer must be {en, es}');

  if (!Array.isArray(data.introParagraphs) || data.introParagraphs.length < 1)
    warn('introParagraphs must be non-empty');
  else data.introParagraphs.forEach((p, i) => {
    if (!isLocalizedString(p)) warn(`introParagraphs[${i}] must be {en, es}`);
  });

  // optionsOverview
  if (!data.optionsOverview) warn('optionsOverview missing');
  else {
    if (!isLocalizedArray(data.optionsOverview.headers)) warn('optionsOverview.headers must be {en:[], es:[]}');
    if (!Array.isArray(data.optionsOverview.rows) || data.optionsOverview.rows.length < 2)
      warn('optionsOverview.rows must have at least 2 rows');
    if (!isLocalizedString(data.optionsOverview.footnote)) warn('optionsOverview.footnote must be {en, es}');
    if (typeof data.optionsOverview.source !== 'string') warn('optionsOverview.source must be a string');
  }

  // optionDetails — MIN 2 (matches the options in the table)
  if (!Array.isArray(data.optionDetails) || data.optionDetails.length < 2)
    warn('optionDetails must have at least 2 entries (matches options table)');
  else data.optionDetails.forEach((opt, i) => {
    if (!isLocalizedString(opt.heading)) warn(`optionDetails[${i}].heading must be {en, es}`);
    if (!Array.isArray(opt.paragraphs)) warn(`optionDetails[${i}].paragraphs must be an array`);
  });

  // optionsOverview rows count vs optionDetails count — must be 1-to-1
  if (Array.isArray(data.optionDetails) && data.optionsOverview && Array.isArray(data.optionsOverview.rows)) {
    if (data.optionsOverview.rows.length !== data.optionDetails.length)
      warn(`optionsOverview.rows (${data.optionsOverview.rows.length}) must match optionDetails count (${data.optionDetails.length}) — every row in the table needs a matching detail section`);
  }

  // traps
  if (!data.traps) warn('traps missing');
  else {
    if (!isLocalizedString(data.traps.intro)) warn('traps.intro must be {en, es}');
    if (!isLocalizedArray(data.traps.headers)) warn('traps.headers must be {en:[], es:[]}');
    if (!Array.isArray(data.traps.rows) || data.traps.rows.length < 1)
      warn('traps.rows must be non-empty');
    if (!isLocalizedString(data.traps.footnote)) warn('traps.footnote must be {en, es}');
    if (typeof data.traps.source !== 'string') warn('traps.source must be a string');
  }

  // detailSections — MIN 2 (persona-specific value: tax/financial + situation-specific)
  if (!Array.isArray(data.detailSections) || data.detailSections.length < 2)
    warn('detailSections must have at least 2 entries (e.g., one tax/financial + one situation-specific)');
  else data.detailSections.forEach((s, i) => {
    if (!isLocalizedString(s.heading)) warn(`detailSections[${i}].heading must be {en, es}`);
    if (!Array.isArray(s.paragraphs)) warn(`detailSections[${i}].paragraphs must be an array`);
  });

  // faqs flat strings
  if (!data.faqs || !Array.isArray(data.faqs.en) || !Array.isArray(data.faqs.es))
    warn('faqs.en and faqs.es must be arrays');
  else {
    data.faqs.en.forEach((f, i) => {
      if (typeof f.question !== 'string') warn(`faqs.en[${i}].question must be flat string`);
      if (typeof f.answer !== 'string') warn(`faqs.en[${i}].answer must be flat string`);
    });
    data.faqs.es.forEach((f, i) => {
      if (typeof f.question !== 'string') warn(`faqs.es[${i}].question must be flat string`);
      if (typeof f.answer !== 'string') warn(`faqs.es[${i}].answer must be flat string`);
    });
    if (data.faqs.en.length !== data.faqs.es.length)
      warn(`faqs en/es count mismatch`);
  }

  if (!Array.isArray(data.relatedLinks)) warn('relatedLinks must be array');
  else data.relatedLinks.forEach((l, i) => {
    if (!isLocalizedString(l.label)) warn(`relatedLinks[${i}].label must be {en, es}`);
    if (typeof l.href !== 'string') warn(`relatedLinks[${i}].href must be string`);
  });
  if (!Array.isArray(data.sources) || data.sources.length < 1)
    warn('sources must be non-empty');
  else data.sources.forEach((s, i) => {
    if (typeof s.name !== 'string') warn(`sources[${i}].name must be string`);
    if (typeof s.url !== 'string') warn(`sources[${i}].url must be string`);
    if (!isLocalizedString(s.note)) warn(`sources[${i}].note must be {en, es}`);
  });

  return errors;
}

function main() {
  if (!fs.existsSync(DIR)) { console.log('No personas dir found (skipping).'); return; }
  const files = fs.readdirSync(DIR)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_') && !f.endsWith('.tmp.json'));

  let totalErrors = 0, badFiles = 0;
  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8')); }
    catch (err) { console.error(`❌ ${file}: ${err.message}`); totalErrors++; badFiles++; continue; }
    const errors = validatePersona(slug, data);
    if (errors.length > 0) {
      console.error(`❌ ${file} (${errors.length} issues):`);
      errors.forEach((e) => console.error(`    - ${e}`));
      totalErrors += errors.length; badFiles++;
    } else {
      console.log(`✅ ${file}`);
    }
  }
  console.log('---');
  console.log(`Validated ${files.length} persona files. ${badFiles} bad. ${totalErrors} total.`);
  if (totalErrors > 0) process.exit(1);
}

main();
