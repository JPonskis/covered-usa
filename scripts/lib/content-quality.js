/**
 * Shared content-quality validators for CoveredUSA template data files.
 *
 * Imported by every per-template validator (validate-procedures.js,
 * validate-drugs.js, etc.) so the rules stay consistent across templates.
 *
 * Rules enforce specs/AI_OPTIMIZATION_FRAMEWORK.md (paragraph length,
 * meta caps, structural proportion, source count, year freshness) and
 * specs/URL_SLUG_FRAMEWORK.md (slug regex, no year, length cap, charset)
 * and specs/LINK_TARGET_MANIFEST.md (topicCluster, keyTerms).
 *
 * Each helper returns an array of error strings (empty = pass). Callers
 * collect errors and exit non-zero if any are non-empty.
 */

const CURRENT_YEAR = new Date().getFullYear();
const STOP_WORDS = new Set(['the', 'a', 'an', 'for', 'is', 'of', 'to', 'with']);

// ─── Slug rules (URL_SLUG_FRAMEWORK.md §1) ─────────────────────────────────

/**
 * Validate a slug against the URL framework's structural rules.
 * Returns an array of error strings (empty = pass).
 */
function checkSlug(slug, { grandfathered = false } = {}) {
  const errors = [];
  if (typeof slug !== 'string' || !slug.length) {
    return [`slug must be a non-empty string`];
  }
  // Rule 2: no year-in-slug (unless explicitly grandfathered)
  if (!grandfathered && /\b(19|20)\d{2}\b/.test(slug)) {
    errors.push(`slug "${slug}" contains a year — year markers belong in H1/title/meta, never the slug`);
  }
  // Rule 3a: length cap
  if (slug.length > 60) {
    errors.push(`slug "${slug}" is ${slug.length} chars (max 60)`);
  }
  // Rule 3b: charset
  if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.push(`slug "${slug}" must be [a-z0-9-] only — no underscores, uppercase, or special chars`);
  }
  // Rule 3c: no edge or doubled hyphens
  if (/^-|-$|--/.test(slug)) {
    errors.push(`slug "${slug}" has leading/trailing/consecutive hyphens`);
  }
  // Rule 4: no query params (defensive — should never see in a slug, but cheap)
  if (slug.includes('?') || slug.includes('&')) {
    errors.push(`slug "${slug}" contains query-parameter chars — use static subdirectories`);
  }
  // Rule 3 warn: stop-word lead
  const firstWord = slug.split('-')[0];
  if (STOP_WORDS.has(firstWord)) {
    errors.push(`slug "${slug}" leads with stop word "${firstWord}" (warn)`);
  }
  return errors;
}

// ─── Meta caps (Framework Section 2.4, 2.5) ────────────────────────────────

function checkMetaTitle(title, { locale = '' } = {}) {
  if (typeof title !== 'string') return [`meta.title.${locale} must be a string`];
  const errors = [];
  if (title.length > 70) errors.push(`meta.title.${locale} is ${title.length} chars (max 70)`);
  if (title.length < 30) errors.push(`meta.title.${locale} is ${title.length} chars (warn: under 30 may be too short)`);
  return errors;
}

function checkMetaDescription(desc, { locale = '' } = {}) {
  if (typeof desc !== 'string') return [`meta.description.${locale} must be a string`];
  const errors = [];
  if (desc.length > 160) errors.push(`meta.description.${locale} is ${desc.length} chars (max 160)`);
  if (desc.length < 80) errors.push(`meta.description.${locale} is ${desc.length} chars (warn: under 80 may be too short)`);
  return errors;
}

// ─── Em-dash detection (no em-dashes anywhere; en-dash allowed only between digits) ─

/**
 * Returns array of error messages for any em-dash (—) found in the
 * stringified JSON. En-dash (–) is allowed only between digits or
 * between digit/dollar-sign (price ranges like $400–$3,500).
 */
function checkNoEmDashes(jsonString, label = 'data') {
  const errors = [];
  if (jsonString.includes('—')) {
    // Find first occurrence with line context
    const idx = jsonString.indexOf('—');
    const snippet = jsonString.slice(Math.max(0, idx - 40), idx + 40);
    errors.push(`${label} contains em-dash (—) — replace with hyphens or rewrite sentence: ...${snippet}...`);
  }
  // Strict en-dash check: allow between digits only
  const enDashRegex = /[^0-9\$\.][–][^0-9\$]/g;
  let m;
  while ((m = enDashRegex.exec(jsonString)) !== null) {
    const idx = m.index;
    const snippet = jsonString.slice(Math.max(0, idx - 20), idx + 20);
    errors.push(`${label} en-dash (–) found outside digit range: ...${snippet}...`);
    if (errors.length >= 5) break;
  }
  return errors;
}

// ─── Paragraph length (Framework Section 4.1) ──────────────────────────────

function countWords(text) {
  if (typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Soft target 150-300 words. Warn outside [80, 400]. Fail outside [50, 500].
 * Returns array of error strings (one per locale per paragraph).
 */
function checkParagraphLength(text, { label = 'paragraph', strict = true } = {}) {
  const errors = [];
  const n = countWords(text);
  if (n === 0) return [`${label} is empty`];
  if (strict && n < 50) errors.push(`${label} is ${n} words (strict fail: <50)`);
  if (strict && n > 500) errors.push(`${label} is ${n} words (strict fail: >500)`);
  if (n >= 50 && n < 80) errors.push(`${label} is ${n} words (warn: <80 may be too short)`);
  if (n > 400 && n <= 500) errors.push(`${label} is ${n} words (warn: >400 may be too long)`);
  return errors;
}

// ─── Source count (Framework Section 9) ────────────────────────────────────

function checkSourceCount(sources, { min = 3 } = {}) {
  if (!Array.isArray(sources)) return [`sources must be an array`];
  if (sources.length < min) return [`sources has ${sources.length} entries (need ≥${min})`];
  return [];
}

// ─── Year freshness (Framework Section 2.2, year markers in YMYL) ──────────

/**
 * For year-anchored page types, check that the current year appears in
 * meta.title, hero.h1, meta.description, or quickAnswer. Skip glossary
 * concept-subtype (Framework Section 5.4 exempts).
 */
function checkYearFreshness(fields, { skip = false, currentYear = CURRENT_YEAR } = {}) {
  if (skip) return [];
  const errors = [];
  const yearStr = String(currentYear);
  for (const [name, value] of Object.entries(fields)) {
    if (typeof value !== 'string') continue;
    if (!value.includes(yearStr)) {
      errors.push(`${name} missing current year (${yearStr}) — year markers required on YMYL year-anchored content`);
    }
  }
  return errors;
}

// ─── Link manifest contract (LINK_TARGET_MANIFEST.md §1) ───────────────────

/**
 * Every page must declare topicCluster + keyTerms.en + keyTerms.es. This
 * is the input the link-index build script aggregates into the routing
 * map writer agents consume.
 */
function checkLinkMetadata(data) {
  const errors = [];
  if (typeof data.topicCluster !== 'string' || !data.topicCluster.length) {
    errors.push('topicCluster missing — every page must declare its cluster (LINK_TARGET_MANIFEST §1)');
  } else if (!/^[a-z0-9-]+$/.test(data.topicCluster)) {
    errors.push(`topicCluster "${data.topicCluster}" must be lowercase kebab-case slug`);
  }
  if (!data.keyTerms || typeof data.keyTerms !== 'object') {
    errors.push('keyTerms missing — must be {en: string[], es: string[]} per LINK_TARGET_MANIFEST §1');
  } else {
    if (!Array.isArray(data.keyTerms.en) || data.keyTerms.en.length === 0) {
      errors.push('keyTerms.en missing or empty — need ≥1 phrase for English link routing');
    }
    if (!Array.isArray(data.keyTerms.es) || data.keyTerms.es.length === 0) {
      errors.push('keyTerms.es missing or empty — need ≥1 phrase for Spanish link routing');
    }
  }
  if (data.isLighthouse !== undefined && typeof data.isLighthouse !== 'boolean') {
    errors.push('isLighthouse must be a boolean if present');
  }
  if (data.isDeprecated !== undefined && typeof data.isDeprecated !== 'boolean') {
    errors.push('isDeprecated must be a boolean if present');
  }
  return errors;
}

// ─── Aggregate validator (called by each per-template validator) ───────────

/**
 * Runs the universal content-quality checks on a parsed JSON data file.
 * Slug check uses HARD errors (existing slugs all pass — verified at
 * Track A5 ship time). Other checks (em-dash, meta caps, source count,
 * topicCluster/keyTerms) return as WARNINGS by default; the
 * STRICT_QUALITY_LINT=1 env flag escalates them to errors. This lets us
 * surface the audit's gap inventory without breaking the build before
 * Track E regenerates existing content with the new writer agents.
 *
 * Returns `{ errors: string[], warnings: string[] }`.
 *
 * @param {string} slug Filename without extension.
 * @param {object} data Parsed JSON.
 * @param {object} [opts] { skipYearFreshness?: boolean, yearFreshnessFields?: object }
 */
function validateContentQuality(slug, data, opts = {}) {
  const strict = process.env.STRICT_QUALITY_LINT === '1';
  const errors = [];
  const warnings = [];
  const collect = (issues, escalate = false) => {
    if (!issues || !issues.length) return;
    const bucket = escalate || strict ? errors : warnings;
    for (const i of issues) bucket.push(i);
  };

  // Slug is always hard. Existing slugs verified to pass at Track A5 ship.
  collect(checkSlug(slug), true);

  // Meta caps (en + es)
  if (data.meta) {
    if (data.meta.title && typeof data.meta.title === 'object') {
      collect(checkMetaTitle(data.meta.title.en, { locale: 'en' }));
      collect(checkMetaTitle(data.meta.title.es, { locale: 'es' }));
    }
    if (data.meta.description && typeof data.meta.description === 'object') {
      collect(checkMetaDescription(data.meta.description.en, { locale: 'en' }));
      collect(checkMetaDescription(data.meta.description.es, { locale: 'es' }));
    }
  }

  // Em-dash check on the whole stringified file
  collect(checkNoEmDashes(JSON.stringify(data), slug));

  // Source count if sources field present
  if (Array.isArray(data.sources)) {
    collect(checkSourceCount(data.sources));
  }

  // Year freshness — opt-in (some templates exempt, e.g. glossary concept subtype)
  if (opts.yearFreshnessFields && !opts.skipYearFreshness) {
    collect(checkYearFreshness(opts.yearFreshnessFields));
  }

  // Link manifest contract (LINK_TARGET_MANIFEST §1)
  collect(checkLinkMetadata(data));

  return { errors, warnings };
}

/**
 * Prints a content-quality result with the conventional ⚠️/❌ prefixes.
 * Returns the number of hard errors (for the caller's exit code).
 */
function reportContentQuality(file, result) {
  const { errors, warnings } = result;
  for (const w of warnings) console.warn(`  ⚠️  ${file}: ${w}`);
  for (const e of errors) console.error(`  ❌ ${file}: ${e}`);
  return errors.length;
}

module.exports = {
  CURRENT_YEAR,
  checkSlug,
  checkMetaTitle,
  checkMetaDescription,
  checkNoEmDashes,
  checkParagraphLength,
  checkSourceCount,
  checkYearFreshness,
  checkLinkMetadata,
  countWords,
  validateContentQuality,
  reportContentQuality,
};
