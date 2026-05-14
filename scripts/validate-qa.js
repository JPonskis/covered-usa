#!/usr/bin/env node
/**
 * validate-qa.js
 *
 * Build-time schema validator for Q&A JSON files at content/data/qa/.
 * Same pattern as validate-procedures + validate-drugs. Wired in as
 * prebuild hook. One bad JSON fails Vercel build fast.
 */

const fs = require('fs');
const path = require('path');
const { validateContentQuality } = require('./lib/content-quality');

const QA_DIR = path.join(__dirname, '..', 'content', 'data', 'qa');

const VALID_CATEGORIES = new Set([
  'Medicare', 'Medicaid', 'ACA', 'CHIP', 'Hospital Bills', 'Prescription Drugs', 'Coverage Q&A',
]);
const VALID_CTA_TARGETS = new Set(['screener', 'analyzer']);
const VALID_STATUS = new Set(['yes', 'no', 'partial']);
const VALID_PAGE_TYPES = new Set(['coverage', 'terminology', 'definition', 'eligibility']);

// Heuristic check: status assignment matches cell value text direction
function statusTextHeuristicMismatch(statusCell) {
  if (!statusCell || !statusCell.value || !statusCell.value.en) return null;
  const text = statusCell.value.en.toLowerCase();
  const status = statusCell.status;
  // "yes" status should NOT contain explicit "no" or "varies"
  if (status === 'yes' && /\b(no|varies|limited|partial|sometimes)\b/.test(text))
    return `status="yes" but text contains "${text}"`;
  // "no" status should NOT contain explicit "yes" or "limited" or "partial"
  if (status === 'no' && /\b(yes|limited|partial|varies)\b/.test(text))
    return `status="no" but text contains "${text}"`;
  // "partial" status should NOT be bare "Yes" or "No"
  if (status === 'partial' && /^(yes|no)$/i.test(statusCell.value.en.trim()))
    return `status="partial" but text is bare "${statusCell.value.en}"`;
  return null;
}

function isLocalizedString(v) {
  return v && typeof v === 'object' && typeof v.en === 'string' && typeof v.es === 'string';
}

function isLocalizedArray(v) {
  return v && typeof v === 'object' && Array.isArray(v.en) && Array.isArray(v.es);
}

function isISODate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function isQATableCell(v) {
  // Plain LocalizedString OR status-coded cell
  if (isLocalizedString(v)) return true;
  if (v && typeof v === 'object' && isLocalizedString(v.value) && VALID_STATUS.has(v.status)) return true;
  return false;
}

function validateQA(slug, data) {
  const errors = [];
  const warn = (msg) => errors.push(msg);

  if (data.slug !== slug) warn(`slug field "${data.slug}" doesn't match filename "${slug}"`);
  if (!isLocalizedString(data.question)) warn('question must be {en, es}');
  if (!isLocalizedString(data.shortAnswer)) warn('shortAnswer must be {en, es}');
  if (!isLocalizedString(data.fullAnswer)) warn('fullAnswer must be {en, es}');
  if (!VALID_CATEGORIES.has(data.category))
    warn(`category "${data.category}" not in ${[...VALID_CATEGORIES].join(',')}`);
  if (typeof data.topic !== 'string') warn('topic must be a string');
  if (typeof data.medicalSpecialty !== 'string') warn('medicalSpecialty must be a string');
  if (!VALID_CTA_TARGETS.has(data.ctaTarget))
    warn(`ctaTarget "${data.ctaTarget}" must be one of: screener, analyzer`);
  // pageType is optional; defaults to "coverage" if omitted
  const pageType = data.pageType ?? 'coverage';
  if (!VALID_PAGE_TYPES.has(pageType))
    warn(`pageType "${data.pageType}" must be one of: ${[...VALID_PAGE_TYPES].join(', ')}`);
  if (!isISODate(data.lastUpdated)) warn(`lastUpdated "${data.lastUpdated}" not ISO YYYY-MM-DD`);
  if (typeof data.readingTime !== 'string') warn('readingTime must be a string');

  // meta
  if (!data.meta || !isLocalizedString(data.meta.title) || !isLocalizedString(data.meta.description))
    warn('meta.title and meta.description must be {en, es}');

  // hero
  if (!data.hero || !isLocalizedString(data.hero.h1)) warn('hero.h1 must be {en, es}');

  // introParagraphs
  if (!Array.isArray(data.introParagraphs) || data.introParagraphs.length < 1)
    warn('introParagraphs must be a non-empty array of {en,es}');
  else data.introParagraphs.forEach((p, i) => {
    if (!isLocalizedString(p)) warn(`introParagraphs[${i}] must be {en, es}`);
  });

  // coverageBreakdown — required when pageType is 'coverage' (default), optional otherwise
  if (pageType === 'coverage' && !data.coverageBreakdown) {
    warn('coverageBreakdown is required when pageType is "coverage" (the default)');
  }
  if (data.coverageBreakdown) {
    if (!isLocalizedArray(data.coverageBreakdown.headers))
      warn('coverageBreakdown.headers must be {en:[],es:[]}');
    if (!Array.isArray(data.coverageBreakdown.rows) || data.coverageBreakdown.rows.length < 1)
      warn('coverageBreakdown.rows must be a non-empty array when present');
    else data.coverageBreakdown.rows.forEach((r, i) => {
      if (!Array.isArray(r.cells)) warn(`coverageBreakdown.rows[${i}].cells must be an array`);
      else r.cells.forEach((c, j) => {
        if (!isQATableCell(c)) warn(`coverageBreakdown.rows[${i}].cells[${j}] must be LocalizedString or {value, status}`);
        // Status/text coherence heuristic
        if (c && c.status) {
          const msg = statusTextHeuristicMismatch(c);
          if (msg) warn(`coverageBreakdown.rows[${i}].cells[${j}]: ${msg}`);
        }
      });
    });
    if (!isLocalizedString(data.coverageBreakdown.footnote))
      warn('coverageBreakdown.footnote must be {en, es}');
    if (typeof data.coverageBreakdown.source !== 'string')
      warn('coverageBreakdown.source must be a string');
  }

  // detailSections — minimum 2 to support the mid-CTA split cleanly
  if (!Array.isArray(data.detailSections) || data.detailSections.length < 2)
    warn('detailSections must have at least 2 entries (mid-CTA split assumes 2+)');
  else data.detailSections.forEach((s, i) => {
    if (!isLocalizedString(s.heading)) warn(`detailSections[${i}].heading must be {en, es}`);
    if (!Array.isArray(s.paragraphs)) warn(`detailSections[${i}].paragraphs must be an array`);
    else s.paragraphs.forEach((p, j) => {
      if (!isLocalizedString(p)) warn(`detailSections[${i}].paragraphs[${j}] must be {en, es}`);
    });
    if (s.list !== undefined) {
      if (!Array.isArray(s.list)) warn(`detailSections[${i}].list must be an array`);
      else s.list.forEach((item, j) => {
        if (!isLocalizedString(item)) warn(`detailSections[${i}].list[${j}] must be {en, es}`);
      });
    }
    if (s.table !== undefined) {
      if (!isLocalizedString(s.table.caption)) warn(`detailSections[${i}].table.caption must be {en, es}`);
      if (!isLocalizedArray(s.table.headers)) warn(`detailSections[${i}].table.headers must be {en:[],es:[]}`);
      if (!Array.isArray(s.table.rows)) warn(`detailSections[${i}].table.rows must be an array`);
      else s.table.rows.forEach((row, j) => {
        if (!isLocalizedArray(row)) warn(`detailSections[${i}].table.rows[${j}] must be {en:[],es:[]}`);
      });
      if (!isLocalizedString(s.table.footnote)) warn(`detailSections[${i}].table.footnote must be {en, es}`);
      if (typeof s.table.source !== 'string') warn(`detailSections[${i}].table.source must be a string`);
    }
  });

  // faqs — flat strings (same rule as procedures + drugs)
  if (!data.faqs || !Array.isArray(data.faqs.en) || !Array.isArray(data.faqs.es)) {
    warn('faqs.en and faqs.es must each be arrays');
  } else {
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
  if (!Array.isArray(data.sources) || data.sources.length < 1) {
    warn('sources must be a non-empty array');
  } else {
    data.sources.forEach((s, i) => {
      if (typeof s.name !== 'string') warn(`sources[${i}].name must be a string`);
      if (typeof s.url !== 'string') warn(`sources[${i}].url must be a string`);
      if (!isLocalizedString(s.note)) warn(`sources[${i}].note must be {en, es}`);
    });
  }

  return errors;
}

function main() {
  if (!fs.existsSync(QA_DIR)) {
    console.log('No qa dir found (skipping).');
    return;
  }
  const files = fs.readdirSync(QA_DIR)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_') && !f.endsWith('.tmp.json'));

  let totalErrors = 0;
  let badFiles = 0;

  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    const filePath = path.join(QA_DIR, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error(`❌ ${file}: failed to parse JSON — ${err.message}`);
      totalErrors++;
      badFiles++;
      continue;
    }
    const errors = validateQA(slug, data);
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
  console.log(`Validated ${files.length} qa files. ${badFiles} bad. ${totalErrors} total issues.`);
  if (totalErrors > 0) process.exit(1);
}

main();
