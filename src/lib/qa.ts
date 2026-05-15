/**
 * qa.ts — Loader for Q&A (single-question) data files.
 *
 * Each Q&A lives at `content/data/qa/<slug>.json` and conforms to the
 * `QA` interface. Rendered by the dynamic route at
 * `src/app/[locale]/qa/[question]/page.tsx`.
 *
 * Q&A pages use schema.org `QAPage` (single canonical question + answer)
 * which is distinct from FAQPage (multiple Q&As). AI engines (Copilot,
 * ChatGPT, Perplexity) treat QAPage as a definitive source for the
 * specific question.
 *
 * Lessons baked in from Phase 2A and 2B:
 * - `_`-prefix file exclusion in directory reads
 * - `.tmp.json` exclusion (atomic write tempfiles)
 * - Nullable optional fields, predictable defaults
 * - JSON parse errors return null + log; route 404s via notFound()
 */

import fs from 'fs';
import path from 'path';

const qaDir = path.join(process.cwd(), 'content/data/qa');

// ─── Localized text shapes ────────────────────────────────────────────────

export interface LocalizedString {
  en: string;
  es: string;
}

export interface LocalizedStringArray {
  en: string[];
  es: string[];
}

export interface LocalizedFAQ {
  question: string;
  answer: string;
}

// ─── Section shapes ───────────────────────────────────────────────────────

/**
 * A status-coded cell value (renders as ✓/✗/partial-tick icon in the table).
 * Use for clear yes/no/partial breakdowns; otherwise use plain LocalizedString cell.
 */
export interface StatusCell {
  value: LocalizedString;
  status: 'yes' | 'no' | 'partial';
}

/** A table cell can be plain localized text OR a status-coded cell. */
export type QATableCell = LocalizedString | StatusCell;

export interface CoverageBreakdownRow {
  /** Cells across the row, parallel to the headers */
  cells: QATableCell[];
}

export interface CoverageBreakdown {
  /** Table headers, e.g., ["Plan Type", "Dental Coverage", "Services", "Annual Cap"] */
  headers: LocalizedStringArray;
  rows: CoverageBreakdownRow[];
  footnote: LocalizedString;
  source: string;
}

/**
 * A detail section — flexible building block for the variable middle content.
 * Each section has a heading + paragraphs, and OPTIONALLY a bulleted list
 * and/or a sub-table. Lets the writer compose any combination of
 * explanation + bullet points + comparison table per question.
 */
export interface DetailSection {
  heading: LocalizedString;
  paragraphs: LocalizedString[];
  /** Optional bulleted list */
  list?: LocalizedString[];
  /** Optional sub-table for things like "alternatives", "options", etc. */
  table?: {
    caption: LocalizedString;
    headers: LocalizedStringArray;
    rows: LocalizedStringArray[];
    footnote: LocalizedString;
    source: string;
  };
}

export interface RelatedLink {
  label: LocalizedString;
  /** Relative path — locale prefix added by template */
  href: string;
}

export interface QASource {
  name: string;
  url: string;
  note: LocalizedString;
}

// ─── Full Q&A shape ───────────────────────────────────────────────────────

/**
 * CTA target — which tool the page funnels the reader to.
 * - 'screener': eligibility screener at /screener (default for most Q&As)
 * - 'analyzer': bill analyzer at /medical-bill-analyzer (for bill/cost Q&As)
 */
export type QACtaTarget = 'screener' | 'analyzer';

/**
 * Category — used for the breadcrumb tag and topical grouping.
 * Locked to a small enum to keep categorization consistent.
 */
export type QACategory =
  | 'Medicare'
  | 'Medicaid'
  | 'ACA'
  | 'CHIP'
  | 'Hospital Bills'
  | 'Prescription Drugs'
  | 'Coverage Q&A';

/**
 * Q&A page type. Drives whether `coverageBreakdown` is required:
 * - 'coverage': benefit/coverage question with a natural matrix table (default)
 * - 'terminology': "what is X" / "is A the same as B" — no coverage matrix
 * - 'definition': "what counts as Y" — defines a concept, no matrix
 * - 'eligibility': "can I get X if Y" — qualification question, optional matrix
 */
export type QAPageType = 'coverage' | 'terminology' | 'definition' | 'eligibility';

/**
 * Subtype dispatch. Determines which §4 recipe applies:
 * - 'coverage': §4.3 Medicare/ACA/federal-Medicaid coverage Q&A
 * - 'state-eligibility': §4.4 state-Medicaid eligibility (Medi-Cal, SoonerCare, AHCCCS, etc.)
 *
 * GATE I enforces: subtype=coverage ↔ pageType ∈ {coverage, terminology, definition};
 * subtype=state-eligibility ↔ pageType=eligibility.
 */
export type QASubtype = 'coverage' | 'state-eligibility';

/**
 * 9-row household-size income table (state-eligibility subtype).
 * Required exactly 9 rows: sizes 1-8 + "Each additional".
 * Caption MUST be year-tagged AND include the state brand.
 */
export interface HouseholdSizeRow {
  /** "1" | "2" | ... | "8" | "Each additional" */
  size: string;
  incomeLimit: LocalizedString;
  notes?: LocalizedString;
}

export interface HouseholdSizeTable {
  caption: LocalizedString;
  year: number;
  rows: HouseholdSizeRow[];
  footnote?: LocalizedString;
  source: string;
}

/**
 * How-to-apply block (universal — both subtypes).
 * Coverage subtype gets a thinner version (enrollment dates, OEP/AEP);
 * state-eligibility subtype gets the full numbered application workflow.
 */
export interface HowToApply {
  /** 3-7 numbered steps */
  numberedSteps: LocalizedString[];
  /** Starting URL (.gov for state-elig; medicare.gov or healthcare.gov for coverage) */
  govStartingUrl: string;
  /** 4-8 items */
  documentsNeeded: LocalizedString[];
  /** 3-5 items */
  commonDenialReasons: LocalizedString[];
  /** Optional enrollment window or deadline (e.g., "Year-round for Medicaid", "Oct 15 - Dec 7, 2026 for AEP") */
  deadline?: LocalizedString;
}

export interface QA {
  /** URL slug, also JSON filename without extension. Slug typically IS the question, e.g., "does-medicare-cover-dental". */
  slug: string;
  /**
   * The canonical question being answered. This appears as H1 + in QAPage schema.
   * Localized.
   */
  question: LocalizedString;
  /**
   * One-line short answer ("Yes (with limits)", "No (Original Medicare)", "Depends on state").
   * Renders in hero as bold subhero. Must be very brief — under 80 chars.
   */
  shortAnswer: LocalizedString;
  /**
   * 2-4 sentence detailed answer. Renders in the quickAnswer blockquote
   * AND fed into the QAPage schema.acceptedAnswer.
   */
  fullAnswer: LocalizedString;
  /** Category for breadcrumb tag */
  category: QACategory;
  /**
   * Topic for schema.about (e.g., "Medicare Dental Coverage", "ACA Subsidy Eligibility").
   * Non-localized for schema compatibility.
   */
  topic: string;
  /** schema.org medicalSpecialty (e.g., "PublicHealth", "PrimaryCare") */
  medicalSpecialty: string;
  /** Which CTA to render */
  ctaTarget: QACtaTarget;
  /**
   * Page type. Controls whether `coverageBreakdown` is required.
   * Defaults to 'coverage' if omitted (back-compat with existing files).
   */
  pageType?: QAPageType;
  /** ISO date of last review */
  lastUpdated: string;
  readingTime: string;

  meta: {
    title: LocalizedString;
    description: LocalizedString;
  };

  hero: {
    /** H1 (typically the question with year suffix, e.g., "Does Medicare Cover Dental? (2026)") */
    h1: LocalizedString;
  };

  /** Intro paragraphs (1-2 paragraphs setting up the answer) */
  introParagraphs: LocalizedString[];

  /**
   * Main coverage breakdown table.
   * - REQUIRED when `pageType` is 'coverage' or omitted (default).
   * - OPTIONAL when `pageType` is 'terminology' / 'definition' / 'eligibility'.
   *   In those cases, omit the field entirely rather than fabricating a table.
   */
  coverageBreakdown?: CoverageBreakdown;

  /** Flexible array of detail sections (2+ required per Phase 2C critic feedback) */
  detailSections: DetailSection[];

  /** FAQs — flat strings (NOT LocalizedString), same rule as procedures/drugs */
  faqs: {
    en: LocalizedFAQ[];
    es: LocalizedFAQ[];
  };

  relatedLinks: RelatedLink[];

  sources: QASource[];

  // ─── Track C-prime additive fields (optional; gracefully degrade if absent) ──
  // Renderer-side wiring lands in Track E. Until then, fields ship in the JSON
  // and the validator picks them up but the page template doesn't render them
  // as dedicated H2s (writer embeds equivalent content in detailSections too).

  /**
   * Subtype dispatch. Set by writer's STEP 0a.
   * GATE I enforces consistency with pageType.
   */
  subtype?: QASubtype;

  /**
   * Kebab-case topic cluster (e.g., "medicare-coverage", "aca-coverage",
   * "medicaid-coverage", "medicaid-income-california", "medicaid-eligibility-oklahoma").
   * Used by link-index builder + content-quality validator.
   */
  topicCluster?: string;

  /**
   * Bilingual key terms object (NOT a flat array — flat array fails content-quality.js).
   * 3-6 phrases per language.
   */
  keyTerms?: {
    en: string[];
    es: string[];
  };

  /** Q&A pages are spokes, not lighthouses. */
  isLighthouse?: boolean;

  /** Set true when sunsetting a page. */
  isDeprecated?: boolean;

  /**
   * Canonical state-program brand (e.g., "Medi-Cal", "SoonerCare", "AHCCCS").
   * Required when subtype=state-eligibility per GATE G-elig.
   */
  stateBrand?: string;

  /**
   * 9-row household-size income table (REQUIRED when subtype=state-eligibility per GATE F-elig).
   * Sizes 1-8 + "Each additional". Year-tagged caption including state brand.
   */
  householdSizeTable?: HouseholdSizeTable;

  /**
   * How-to-apply block (RECOMMENDED universal per RULE 3; REQUIRED state-eligibility subtype).
   * Coverage subtype gets a thinner version; state-eligibility gets the full workflow.
   */
  howToApply?: HowToApply;
}

// ─── Loader functions ─────────────────────────────────────────────────────

function readQAFile(slug: string): QA | null {
  const filePath = path.join(qaDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw) as QA;
    if (parsed.slug !== slug) {
      parsed.slug = slug;
    }
    return parsed;
  } catch (err) {
    console.error(`[qa] Failed to parse ${slug}.json:`, err);
    return null;
  }
}

/** Get every Q&A JSON file (excluding _-prefix config files and .tmp.json). */
export function getAllQAs(): QA[] {
  if (!fs.existsSync(qaDir)) {
    return [];
  }
  const fileNames = fs.readdirSync(qaDir);
  return fileNames
    .filter((name) => name.endsWith('.json') && !name.startsWith('_') && !name.endsWith('.tmp.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .map((slug) => readQAFile(slug))
    .filter((q): q is QA => q !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/** Get a single Q&A by slug. */
export function getQABySlug(slug: string): QA | null {
  return readQAFile(slug);
}

/** Get just the slugs — used by generateStaticParams + sitemap. */
export function getAllQASlugs(): string[] {
  if (!fs.existsSync(qaDir)) {
    return [];
  }
  return fs
    .readdirSync(qaDir)
    .filter((name) => name.endsWith('.json') && !name.startsWith('_') && !name.endsWith('.tmp.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .sort();
}

/** Pick a localized string by locale, falling back to 'en'. */
export function pickLocale(ls: LocalizedString, locale: string): string {
  if (locale === 'es' && ls.es) return ls.es;
  return ls.en;
}

export function pickLocaleArray(lsa: LocalizedStringArray, locale: string): string[] {
  if (locale === 'es' && lsa.es && lsa.es.length > 0) return lsa.es;
  return lsa.en;
}

/** Type guard: cell is a StatusCell (vs plain LocalizedString) */
export function isStatusCell(cell: QATableCell): cell is StatusCell {
  return (cell as StatusCell).status !== undefined;
}
