#!/usr/bin/env node
/**
 * validate-events.js
 * Build-time schema validator for trigger event JSONs. Wired into prebuild.
 */

const fs = require('fs');
const path = require('path');
const { validateContentQuality } = require('./lib/content-quality');

const DIR = path.join(__dirname, '..', 'content', 'data', 'events');

const VALID_CATEGORIES = new Set([
  'Job Loss', 'Age Milestone', 'Family Change', 'Move / Relocation',
  'Income Change', 'Plan Change', 'Lost Other Coverage',
]);
const VALID_CTA = new Set(['screener', 'analyzer']);
const VALID_URGENCY_KIND = new Set(['deadline', 'window', 'no-deadline']);

/**
 * Extract day-count numbers from a string (for drift detection).
 * Catches "60 days", "30 days", "7 months", "1 year".
 */
function extractDayCounts(s) {
  if (typeof s !== 'string') return [];
  const counts = [];
  const re = /(\d+)\s*(day|days|month|months|year|years)/gi;
  let m;
  while ((m = re.exec(s)) !== null) {
    const n = parseInt(m[1], 10);
    const unit = m[2].toLowerCase();
    let days = n;
    if (unit.startsWith('month')) days = n * 30;
    if (unit.startsWith('year')) days = n * 365;
    counts.push({ raw: m[0], days });
  }
  return counts;
}

/** Parse ISO 8601 duration (P60D, P7M, P1Y) → approximate day count. */
function isoDurationToDays(iso) {
  if (!iso) return null;
  const m = iso.match(/^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?/);
  if (!m) return null;
  const y = parseInt(m[1] || '0', 10);
  const months = parseInt(m[2] || '0', 10);
  const days = parseInt(m[3] || '0', 10);
  return y * 365 + months * 30 + days;
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
function isISODuration(s) {
  // ISO 8601 duration: P30D, P60D, P1Y, PT1H, etc.
  return typeof s === 'string' && /^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?)?$/.test(s);
}

function validateEvent(slug, data) {
  const errors = [];
  const warn = (msg) => errors.push(msg);

  if (data.slug !== slug) warn(`slug "${data.slug}" doesn't match filename "${slug}"`);
  if (!isLocalizedString(data.eventName)) warn('eventName must be {en, es}');
  if (!VALID_CATEGORIES.has(data.category))
    warn(`category "${data.category}" not in ${[...VALID_CATEGORIES].join(',')}`);
  if (typeof data.topic !== 'string') warn('topic must be a string');
  if (typeof data.medicalSpecialty !== 'string') warn('medicalSpecialty must be a string');
  if (!VALID_CTA.has(data.ctaTarget))
    warn(`ctaTarget "${data.ctaTarget}" must be screener or analyzer`);
  if (!isISODate(data.lastUpdated)) warn(`lastUpdated "${data.lastUpdated}" not ISO YYYY-MM-DD`);
  if (typeof data.readingTime !== 'string') warn('readingTime must be a string');

  if (!data.meta || !isLocalizedString(data.meta.title) || !isLocalizedString(data.meta.description))
    warn('meta.title and meta.description must be {en, es}');
  if (!data.hero || !isLocalizedString(data.hero.h1) || !isLocalizedString(data.hero.subhero))
    warn('hero.h1 and hero.subhero must be {en, es}');

  // urgency
  if (!data.urgency) warn('urgency object missing');
  else {
    if (!VALID_URGENCY_KIND.has(data.urgency.kind))
      warn(`urgency.kind "${data.urgency.kind}" must be one of: deadline, window, no-deadline`);
    if (!isLocalizedString(data.urgency.heading)) warn('urgency.heading must be {en, es}');
    if (!isLocalizedString(data.urgency.body)) warn('urgency.body must be {en, es}');
    if (data.urgency.totalTimeISO8601 !== null && !isISODuration(data.urgency.totalTimeISO8601))
      warn(`urgency.totalTimeISO8601 "${data.urgency.totalTimeISO8601}" must be ISO 8601 duration (e.g. P60D) or null`);

    // Kind-vs-duration coherence
    if (data.urgency.kind === 'no-deadline' && data.urgency.totalTimeISO8601 !== null)
      warn('urgency.kind="no-deadline" requires totalTimeISO8601=null');
    if ((data.urgency.kind === 'deadline' || data.urgency.kind === 'window') &&
        data.urgency.totalTimeISO8601 === null)
      warn(`urgency.kind="${data.urgency.kind}" requires non-null totalTimeISO8601`);

    // Drift detection: ISO duration vs prose mentions of days/months
    // Skip when kind="window" — windows are multi-segment (3+1+3 month for Medicare IEP)
    // and individual segments legitimately don't match the total duration.
    if (data.urgency.kind === 'deadline') {
      const isoDays = isoDurationToDays(data.urgency.totalTimeISO8601);
      if (isoDays !== null) {
        const headingCounts = extractDayCounts((data.urgency.heading && data.urgency.heading.en) || '');
        const bodyCounts = extractDayCounts((data.urgency.body && data.urgency.body.en) || '');
        const allProseCounts = [...headingCounts, ...bodyCounts];
        if (allProseCounts.length > 0) {
          const matches = allProseCounts.some((c) => Math.abs(c.days - isoDays) <= 5);
          if (!matches)
            warn(`urgency drift: totalTimeISO8601=${data.urgency.totalTimeISO8601} (~${isoDays} days) but heading/body mentions ${allProseCounts.map((c) => c.raw).join(', ')}`);
        }
      }
    }

    // secondaryDeadlines (optional)
    if (data.urgency.secondaryDeadlines !== undefined) {
      if (!Array.isArray(data.urgency.secondaryDeadlines))
        warn('urgency.secondaryDeadlines, if present, must be an array');
      else data.urgency.secondaryDeadlines.forEach((sd, i) => {
        if (!isLocalizedString(sd.label)) warn(`urgency.secondaryDeadlines[${i}].label must be {en, es}`);
        if (sd.days !== null && (typeof sd.days !== 'number' || sd.days <= 0))
          warn(`urgency.secondaryDeadlines[${i}].days must be a positive number or null`);
      });
    }
  }

  if (!isLocalizedString(data.quickAnswer)) warn('quickAnswer must be {en, es}');

  if (!Array.isArray(data.introParagraphs) || data.introParagraphs.length < 1)
    warn('introParagraphs must be a non-empty array');
  else data.introParagraphs.forEach((p, i) => {
    if (!isLocalizedString(p)) warn(`introParagraphs[${i}] must be {en, es}`);
  });

  // steps (HowTo schema)
  if (!Array.isArray(data.steps) || data.steps.length < 3)
    warn('steps must have at least 3 entries (HowTo schema needs meaningful step count)');
  else data.steps.forEach((s, i) => {
    if (!isLocalizedString(s.name)) warn(`steps[${i}].name must be {en, es}`);
    if (!isLocalizedString(s.text)) warn(`steps[${i}].text must be {en, es}`);
  });

  // optionsComparison
  if (!data.optionsComparison) warn('optionsComparison missing');
  else {
    if (!isLocalizedArray(data.optionsComparison.headers))
      warn('optionsComparison.headers must be {en:[], es:[]}');
    if (!Array.isArray(data.optionsComparison.rows) || data.optionsComparison.rows.length < 1)
      warn('optionsComparison.rows must be non-empty');
    else data.optionsComparison.rows.forEach((r, i) => {
      if (!isLocalizedArray(r)) warn(`optionsComparison.rows[${i}] must be {en:[], es:[]}`);
    });
    if (!isLocalizedString(data.optionsComparison.footnote))
      warn('optionsComparison.footnote must be {en, es}');
    if (typeof data.optionsComparison.source !== 'string')
      warn('optionsComparison.source must be a string');
  }

  // commonMistakes
  if (!data.commonMistakes) warn('commonMistakes missing');
  else {
    if (!isLocalizedString(data.commonMistakes.intro))
      warn('commonMistakes.intro must be {en, es}');
    if (!Array.isArray(data.commonMistakes.items) || data.commonMistakes.items.length < 1)
      warn('commonMistakes.items must be non-empty');
  }

  // detailSections (optional for events)
  if (data.detailSections !== undefined && !Array.isArray(data.detailSections))
    warn('detailSections, if present, must be an array');

  // faqs flat strings
  if (!data.faqs || !Array.isArray(data.faqs.en) || !Array.isArray(data.faqs.es))
    warn('faqs.en and faqs.es must each be arrays');
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
      warn(`faqs.en (${data.faqs.en.length}) vs es (${data.faqs.es.length}) count mismatch`);
  }

  // relatedLinks + sources
  if (!Array.isArray(data.relatedLinks)) warn('relatedLinks must be an array');
  else data.relatedLinks.forEach((l, i) => {
    if (!isLocalizedString(l.label)) warn(`relatedLinks[${i}].label must be {en, es}`);
    if (typeof l.href !== 'string') warn(`relatedLinks[${i}].href must be a string`);
  });
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
  if (!fs.existsSync(DIR)) { console.log('No events dir found (skipping).'); return; }
  const files = fs.readdirSync(DIR)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_') && !f.endsWith('.tmp.json'));

  let totalErrors = 0, badFiles = 0;
  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8')); }
    catch (err) { console.error(`❌ ${file}: ${err.message}`); totalErrors++; badFiles++; continue; }
    const errors = validateEvent(slug, data);
    const cq = validateContentQuality(slug, data);
    cq.warnings.forEach((w) => console.warn(`  ⚠️  ${file}: ${w}`));
    const allErrors = [...errors, ...cq.errors];
    if (allErrors.length > 0) {
      console.error(`❌ ${file} (${allErrors.length} issues):`);
      allErrors.forEach((e) => console.error(`    - ${e}`));
      totalErrors += allErrors.length; badFiles++;
    } else if (cq.warnings.length > 0) {
      console.log(`✅ ${file} (${cq.warnings.length} content-quality warnings)`);
    } else {
      console.log(`✅ ${file}`);
    }
  }
  console.log('---');
  console.log(`Validated ${files.length} event files. ${badFiles} bad. ${totalErrors} total.`);
  if (totalErrors > 0) process.exit(1);
}

main();
