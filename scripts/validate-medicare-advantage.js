#!/usr/bin/env node
/**
 * validate-medicare-advantage.js
 *
 * Build-time schema validator for state Medicare Advantage JSON files.
 * Run before `next build` (or as part of `prebuild`) to catch malformed
 * data before it crashes the dynamic route at render time.
 *
 * Exits non-zero on any structural problem so CI / Vercel build fails fast.
 */

const fs = require('fs');
const path = require('path');
const { validateContentQuality } = require('./lib/content-quality');

const MA_DIR = path.join(
  __dirname,
  '..',
  'content',
  'data',
  'medicare-advantage'
);

const VALID_CTA_TARGETS = new Set(['screener', 'analyzer']);

// Required data year for the current generation cycle.
// Bump this each calendar year when the 2026 anchor facts roll over.
const REQUIRED_DATA_YEAR = 2026;

// Meta tag length caps for SEO (Google/Bing truncate beyond these).
const META_TITLE_MAX = 70;
const META_DESCRIPTION_MAX = 160;

// Sanity bound on monthly premium (anything above is almost certainly an annual
// vs monthly mix-up; California's highest single carrier averages ~$45/mo).
const MONTHLY_PREMIUM_MAX = 300;

// US states + DC. Used to sanity-check stateAbbreviation against canonical list.
const VALID_STATE_ABBREVIATIONS = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY',
]);

// Allowed relatedLinks href prefixes — must match a real CoveredUSA route.
// If a writer puts /medicare-supplement or /medigap, the build should fail.
const VALID_HREF_PREFIXES = [
  '/screener',
  '/medical-bill-analyzer',
  '/medicare-eligibility',
  '/medicaid-income-limits',
  '/aca-income-limits',
  '/federal-poverty-level',
  '/cost/',
  '/drug/',
  '/qa/',
  '/glossary/',
  '/event/',
  '/for/',
  '/medicare-advantage/',
  '/blog/',
  '/about',
  '/',
];

function hasValidPrefix(href) {
  if (typeof href !== 'string' || !href.startsWith('/')) return false;
  return VALID_HREF_PREFIXES.some((p) => href === p || href.startsWith(p));
}

function isLocalizedString(v) {
  return (
    v &&
    typeof v === 'object' &&
    typeof v.en === 'string' &&
    typeof v.es === 'string'
  );
}

function isLocalizedArray(v) {
  return (
    v &&
    typeof v === 'object' &&
    Array.isArray(v.en) &&
    Array.isArray(v.es)
  );
}

function isISODate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

// Strict positive integer (> 0). Use for fields where zero is nonsensical
// (plan count, enrollee count, dataYear, etc.).
function isPositiveInt(v) {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 && Math.floor(v) === v;
}

// Non-negative integer (>= 0). Use for fields where zero is plausible
// (carrier planCount could legitimately be 0 if the writer wants to list
// a carrier that exited the state, though that's an edge case).
function isNonNegativeInt(v) {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && Math.floor(v) === v;
}

function isNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

function isStarRating(v) {
  return isNumber(v) && v >= 1.0 && v <= 5.0;
}

function isPercent(v) {
  return isNumber(v) && v >= 0 && v <= 100;
}

function validateMAState(slug, data) {
  const errors = [];
  const warn = (msg) => errors.push(msg);

  // ─── Top-level identity ──────────────────────────────────────────────
  if (data.slug !== slug) {
    warn(`slug field "${data.slug}" doesn't match filename "${slug}"`);
  }
  // Slug must be lowercase + hyphens only (no spaces, no underscores).
  if (typeof slug !== 'string' || !/^[a-z][a-z0-9-]*$/.test(slug)) {
    warn(`slug "${slug}" must be lowercase letters/digits/hyphens only`);
  }
  if (!isLocalizedString(data.stateName)) {
    warn('stateName must be {en, es}');
  }
  if (
    typeof data.stateAbbreviation !== 'string' ||
    !/^[A-Z]{2}$/.test(data.stateAbbreviation) ||
    !VALID_STATE_ABBREVIATIONS.has(data.stateAbbreviation)
  ) {
    warn(
      `stateAbbreviation "${data.stateAbbreviation}" must be a 2-letter US state/DC code`
    );
  }
  if (typeof data.topic !== 'string') warn('topic must be a string');
  if (typeof data.medicalSpecialty !== 'string')
    warn('medicalSpecialty must be a string');
  if (!VALID_CTA_TARGETS.has(data.ctaTarget))
    warn(
      `ctaTarget "${data.ctaTarget}" must be one of ${[...VALID_CTA_TARGETS].join(',')}`
    );
  if (!isISODate(data.lastUpdated))
    warn(`lastUpdated "${data.lastUpdated}" not ISO YYYY-MM-DD`);
  if (typeof data.readingTime !== 'string')
    warn('readingTime must be a string');

  // ─── meta ────────────────────────────────────────────────────────────
  if (
    !data.meta ||
    !isLocalizedString(data.meta.title) ||
    !isLocalizedString(data.meta.description)
  ) {
    warn('meta.title and meta.description must be {en, es}');
  } else {
    if (data.meta.title.en.length > META_TITLE_MAX)
      warn(
        `meta.title.en is ${data.meta.title.en.length} chars (max ${META_TITLE_MAX}); will truncate in SERP`
      );
    if (data.meta.title.es.length > META_TITLE_MAX)
      warn(
        `meta.title.es is ${data.meta.title.es.length} chars (max ${META_TITLE_MAX}); will truncate in SERP`
      );
    if (data.meta.description.en.length > META_DESCRIPTION_MAX)
      warn(
        `meta.description.en is ${data.meta.description.en.length} chars (max ${META_DESCRIPTION_MAX}); will truncate in SERP`
      );
    if (data.meta.description.es.length > META_DESCRIPTION_MAX)
      warn(
        `meta.description.es is ${data.meta.description.es.length} chars (max ${META_DESCRIPTION_MAX}); will truncate in SERP`
      );
  }

  // ─── hero ────────────────────────────────────────────────────────────
  if (
    !data.hero ||
    !isLocalizedString(data.hero.h1) ||
    !isLocalizedString(data.hero.subhero)
  ) {
    warn('hero.h1 and hero.subhero must be {en, es}');
  }

  // ─── quickAnswer ─────────────────────────────────────────────────────
  if (!isLocalizedString(data.quickAnswer)) {
    warn('quickAnswer must be {en, es}');
  }

  // ─── introParagraphs ─────────────────────────────────────────────────
  if (!Array.isArray(data.introParagraphs) || data.introParagraphs.length < 1) {
    warn('introParagraphs must be a non-empty array of {en,es}');
  } else {
    data.introParagraphs.forEach((p, i) => {
      if (!isLocalizedString(p)) warn(`introParagraphs[${i}] must be {en, es}`);
    });
  }

  // ─── marketOverview ──────────────────────────────────────────────────
  if (!data.marketOverview) {
    warn('marketOverview object missing');
  } else {
    const m = data.marketOverview;
    if (m.dataYear !== REQUIRED_DATA_YEAR)
      warn(
        `marketOverview.dataYear must be ${REQUIRED_DATA_YEAR} (got ${m.dataYear}); using stale-year data risks shipping wrong anchor facts`
      );
    if (!isPositiveInt(m.totalPlansAvailable))
      warn('marketOverview.totalPlansAvailable must be a positive integer');
    if (!isPositiveInt(m.enrolledBeneficiaries))
      warn('marketOverview.enrolledBeneficiaries must be a positive integer');
    if (!isPercent(m.penetrationPct))
      warn('marketOverview.penetrationPct must be a number 0-100');
    if (!isNumber(m.averageMonthlyPremium) || m.averageMonthlyPremium < 0)
      warn('marketOverview.averageMonthlyPremium must be a non-negative number');
    if (
      isNumber(m.averageMonthlyPremium) &&
      m.averageMonthlyPremium > MONTHLY_PREMIUM_MAX
    )
      warn(
        `marketOverview.averageMonthlyPremium ${m.averageMonthlyPremium} exceeds sanity max $${MONTHLY_PREMIUM_MAX}/mo (likely annual/monthly mix-up)`
      );
    if (!isStarRating(m.averageStarRating))
      warn('marketOverview.averageStarRating must be a number 1.0-5.0');
    if (!Array.isArray(m.topCarriers) || m.topCarriers.length < 1) {
      warn('marketOverview.topCarriers must be a non-empty array');
    } else {
      let carrierPlanCountSum = 0;
      m.topCarriers.forEach((c, i) => {
        if (typeof c.name !== 'string' || c.name.length === 0)
          warn(`topCarriers[${i}].name must be a non-empty string`);
        if (!isNonNegativeInt(c.planCount)) {
          warn(`topCarriers[${i}].planCount must be a non-negative integer`);
        } else {
          carrierPlanCountSum += c.planCount;
        }
        if (!isStarRating(c.averageStarRating))
          warn(`topCarriers[${i}].averageStarRating must be 1.0-5.0`);
        if (!isNumber(c.averagePremium) || c.averagePremium < 0)
          warn(`topCarriers[${i}].averagePremium must be a non-negative number`);
        if (
          isNumber(c.averagePremium) &&
          c.averagePremium > MONTHLY_PREMIUM_MAX
        )
          warn(
            `topCarriers[${i}].averagePremium ${c.averagePremium} exceeds sanity max $${MONTHLY_PREMIUM_MAX}/mo`
          );
        if (c.notes !== undefined && !isLocalizedString(c.notes))
          warn(`topCarriers[${i}].notes must be {en,es} when present`);
      });
      // Allow up to 2x overlap (carriers + plan types overlap in CMS data),
      // but reject obvious fabrication where carrier sum is unreasonably high.
      if (
        isPositiveInt(m.totalPlansAvailable) &&
        carrierPlanCountSum > 2 * m.totalPlansAvailable
      ) {
        warn(
          `topCarriers planCount sum (${carrierPlanCountSum}) > 2x totalPlansAvailable (${m.totalPlansAvailable}) — possible fabrication`
        );
      }
    }
    if (typeof m.source !== 'string' || m.source.length === 0)
      warn('marketOverview.source must be a non-empty string');
  }

  // ─── planTypes ───────────────────────────────────────────────────────
  if (!data.planTypes) {
    warn('planTypes object missing');
  } else {
    const pt = data.planTypes;
    if (!isLocalizedArray(pt.headers))
      warn('planTypes.headers must be {en:[],es:[]}');
    if (!Array.isArray(pt.rows) || pt.rows.length < 1) {
      warn('planTypes.rows must be a non-empty array');
    } else {
      const expectedCols = isLocalizedArray(pt.headers) ? pt.headers.en.length : null;
      pt.rows.forEach((r, i) => {
        if (!isLocalizedArray(r)) {
          warn(`planTypes.rows[${i}] must be {en:[],es:[]}`);
        } else if (expectedCols !== null) {
          if (r.en.length !== expectedCols)
            warn(
              `planTypes.rows[${i}].en has ${r.en.length} cells, expected ${expectedCols}`
            );
          if (r.es.length !== expectedCols)
            warn(
              `planTypes.rows[${i}].es has ${r.es.length} cells, expected ${expectedCols}`
            );
        }
      });
    }
    if (!isLocalizedString(pt.footnote))
      warn('planTypes.footnote must be {en,es}');
    if (typeof pt.source !== 'string')
      warn('planTypes.source must be a string');
  }

  // ─── countyVariance (optional) ───────────────────────────────────────
  if (data.countyVariance !== undefined) {
    const cv = data.countyVariance;
    if (!isLocalizedString(cv.intro)) warn('countyVariance.intro must be {en,es}');
    if (!Array.isArray(cv.examples) || cv.examples.length < 1) {
      warn('countyVariance.examples must be a non-empty array when present');
    } else {
      cv.examples.forEach((e, i) => {
        if (!isLocalizedString(e.county))
          warn(`countyVariance.examples[${i}].county must be {en,es}`);
        if (!isPositiveInt(e.planCount))
          warn(
            `countyVariance.examples[${i}].planCount must be a non-negative integer`
          );
        if (!isNumber(e.averagePremium) || e.averagePremium < 0)
          warn(
            `countyVariance.examples[${i}].averagePremium must be a non-negative number`
          );
        if (e.classification !== undefined && !isLocalizedString(e.classification))
          warn(`countyVariance.examples[${i}].classification must be {en,es}`);
      });
    }
    if (!isLocalizedString(cv.footnote))
      warn('countyVariance.footnote must be {en,es}');
    if (typeof cv.source !== 'string')
      warn('countyVariance.source must be a string');
  }

  // ─── whatToLookFor ───────────────────────────────────────────────────
  if (!data.whatToLookFor) {
    warn('whatToLookFor object missing');
  } else {
    if (!isLocalizedString(data.whatToLookFor.intro))
      warn('whatToLookFor.intro must be {en,es}');
    if (
      !Array.isArray(data.whatToLookFor.items) ||
      data.whatToLookFor.items.length < 3
    ) {
      warn('whatToLookFor.items must be an array of at least 3 LocalizedStrings');
    } else {
      data.whatToLookFor.items.forEach((it, i) => {
        if (!isLocalizedString(it))
          warn(`whatToLookFor.items[${i}] must be {en,es}`);
      });
    }
  }

  // ─── importantDates ──────────────────────────────────────────────────
  if (!data.importantDates) {
    warn('importantDates object missing');
  } else {
    if (!isLocalizedString(data.importantDates.intro))
      warn('importantDates.intro must be {en,es}');
    if (
      !Array.isArray(data.importantDates.items) ||
      data.importantDates.items.length < 1
    ) {
      warn('importantDates.items must be a non-empty array');
    } else {
      data.importantDates.items.forEach((it, i) => {
        if (!isLocalizedString(it.label))
          warn(`importantDates.items[${i}].label must be {en,es}`);
        if (!isLocalizedString(it.date))
          warn(`importantDates.items[${i}].date must be {en,es}`);
        if (it.note !== undefined && !isLocalizedString(it.note))
          warn(`importantDates.items[${i}].note must be {en,es} when present`);
      });
    }
  }

  // ─── stateExtras (optional) ──────────────────────────────────────────
  if (data.stateExtras !== undefined) {
    if (!isLocalizedString(data.stateExtras.intro))
      warn('stateExtras.intro must be {en,es}');
    if (
      !Array.isArray(data.stateExtras.items) ||
      data.stateExtras.items.length < 1
    ) {
      warn('stateExtras.items must be a non-empty array when present');
    } else {
      data.stateExtras.items.forEach((it, i) => {
        if (!isLocalizedString(it.label))
          warn(`stateExtras.items[${i}].label must be {en,es}`);
        if (!isLocalizedString(it.description))
          warn(`stateExtras.items[${i}].description must be {en,es}`);
      });
    }
  }

  // ─── detailSections ──────────────────────────────────────────────────
  if (!Array.isArray(data.detailSections) || data.detailSections.length < 2) {
    warn('detailSections must be an array of at least 2 sections');
  } else {
    data.detailSections.forEach((s, i) => {
      if (!isLocalizedString(s.heading))
        warn(`detailSections[${i}].heading must be {en,es}`);
      if (!Array.isArray(s.paragraphs) || s.paragraphs.length < 1) {
        warn(`detailSections[${i}].paragraphs must be a non-empty array`);
      } else {
        s.paragraphs.forEach((p, j) => {
          if (!isLocalizedString(p))
            warn(`detailSections[${i}].paragraphs[${j}] must be {en,es}`);
        });
      }
      if (s.list !== undefined) {
        if (!Array.isArray(s.list))
          warn(`detailSections[${i}].list must be an array when present`);
        else
          s.list.forEach((li, j) => {
            if (!isLocalizedString(li))
              warn(`detailSections[${i}].list[${j}] must be {en,es}`);
          });
      }
      if (s.table !== undefined) {
        if (!isLocalizedArray(s.table.headers))
          warn(`detailSections[${i}].table.headers must be {en:[],es:[]}`);
        if (!Array.isArray(s.table.rows))
          warn(`detailSections[${i}].table.rows must be an array`);
        else {
          const expectedCols = isLocalizedArray(s.table.headers)
            ? s.table.headers.en.length
            : null;
          s.table.rows.forEach((r, j) => {
            if (!isLocalizedArray(r))
              warn(`detailSections[${i}].table.rows[${j}] must be {en:[],es:[]}`);
            else if (expectedCols !== null) {
              if (r.en.length !== expectedCols)
                warn(
                  `detailSections[${i}].table.rows[${j}].en has ${r.en.length} cells, expected ${expectedCols}`
                );
            }
          });
        }
        if (s.table.footnote !== undefined && !isLocalizedString(s.table.footnote))
          warn(`detailSections[${i}].table.footnote must be {en,es} when present`);
      }
    });
  }

  // ─── faqs (flat strings, en/es lengths match, min 6) ─────────────────
  if (!data.faqs || !Array.isArray(data.faqs.en) || !Array.isArray(data.faqs.es)) {
    warn('faqs.en and faqs.es must each be arrays');
  } else {
    if (data.faqs.en.length < 6)
      warn(`faqs.en should have at least 6 entries, got ${data.faqs.en.length}`);
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
      warn(
        `faqs.en (${data.faqs.en.length}) and faqs.es (${data.faqs.es.length}) length mismatch`
      );
  }

  // ─── relatedLinks ────────────────────────────────────────────────────
  if (!Array.isArray(data.relatedLinks))
    warn('relatedLinks must be an array');
  else
    data.relatedLinks.forEach((l, i) => {
      if (!isLocalizedString(l.label))
        warn(`relatedLinks[${i}].label must be {en,es}`);
      if (typeof l.href !== 'string' || !l.href.startsWith('/'))
        warn(`relatedLinks[${i}].href must be a relative path starting with /`);
      else if (!hasValidPrefix(l.href))
        warn(
          `relatedLinks[${i}].href "${l.href}" doesn't match any known CoveredUSA route prefix — will 404`
        );
    });

  // ─── sources ─────────────────────────────────────────────────────────
  if (!Array.isArray(data.sources) || data.sources.length < 3) {
    warn('sources must be an array of at least 3 entries');
  } else {
    data.sources.forEach((s, i) => {
      if (typeof s.name !== 'string')
        warn(`sources[${i}].name must be a string`);
      if (typeof s.url !== 'string' || !/^https?:\/\//.test(s.url))
        warn(`sources[${i}].url must be a valid http(s) URL`);
      if (!isLocalizedString(s.note))
        warn(`sources[${i}].note must be {en,es}`);
    });
  }

  return errors;
}

function main() {
  if (!fs.existsSync(MA_DIR)) {
    console.log(`No medicare-advantage dir yet (${MA_DIR}). Nothing to validate.`);
    return;
  }
  const files = fs
    .readdirSync(MA_DIR)
    .filter(
      (f) =>
        f.endsWith('.json') && !f.startsWith('_') && !f.endsWith('.tmp.json')
    );

  if (files.length === 0) {
    console.log('No medicare-advantage JSON files yet. Nothing to validate.');
    return;
  }

  let totalErrors = 0;
  let badFiles = 0;

  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    const filePath = path.join(MA_DIR, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error(`❌ ${file}: failed to parse JSON — ${err.message}`);
      totalErrors++;
      badFiles++;
      continue;
    }
    const errors = validateMAState(slug, data);
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
  console.log(
    `Validated ${files.length} Medicare Advantage state files. ${badFiles} bad. ${totalErrors} total issues.`
  );
  if (totalErrors > 0) {
    process.exit(1);
  }
}

main();
