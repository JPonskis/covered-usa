/**
 * glossary.ts — Loader for glossary (definitional) data files.
 *
 * Each glossary entry lives at `content/data/glossary/<slug>.json` and
 * conforms to the `Glossary` interface. Rendered by the dynamic route at
 * `src/app/[locale]/glossary/[term]/page.tsx`.
 *
 * Uses schema.org `DefinedTerm` (distinct from QAPage, MedicalProcedure,
 * Drug). DefinedTerm allows `alternateName` for abbreviations (OOP Max,
 * MOOP, MAGI, FPL, EOB) — important for AI engines discovering the term
 * by alias.
 *
 * Lessons from Phase 2A/2B/2C baked in: `_`-prefix filter, optional fields,
 * locked enums, FAQ flat strings, atomic write.
 */

import fs from 'fs';
import path from 'path';

const glossaryDir = path.join(process.cwd(), 'content/data/glossary');

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

export interface AnnualLimitsSection {
  /** Headers, e.g., ["Plan Type", "Individual", "Family"] */
  headers: LocalizedStringArray;
  /** Rows of cells, parallel to headers. Each cell is a plain localized string. */
  rows: LocalizedStringArray[];
  footnote: LocalizedString;
  source: string;
}

export interface CountsTowardSection {
  intro: LocalizedString;
  items: LocalizedString[];
}

export interface WorkedExampleSection {
  intro: LocalizedString;
  /** Headers, e.g., ["Spending category", "Amount"] */
  headers: LocalizedStringArray;
  rows: LocalizedStringArray[];
  footnote: LocalizedString;
}

export interface DetailSection {
  heading: LocalizedString;
  paragraphs: LocalizedString[];
  /** Optional bulleted list */
  list?: LocalizedString[];
  /** Optional sub-table */
  table?: {
    caption: LocalizedString;
    headers: LocalizedStringArray;
    rows: LocalizedStringArray[];
    footnote: LocalizedString;
    source: string;
  };
}

export interface RelatedTerm {
  label: LocalizedString;
  /** Relative path, e.g., "/glossary/deductible" — locale prefix added by template */
  href: string;
}

export interface GlossarySource {
  name: string;
  url: string;
  note: LocalizedString;
}

// ─── Full Glossary entry shape ────────────────────────────────────────────

/**
 * Category for breadcrumb tagging + topical grouping.
 * Locked enum to keep categorization consistent.
 */
export type GlossaryCategory =
  | 'ACA'
  | 'Medicare'
  | 'Medicaid'
  | 'Insurance'
  | 'Tax'
  | 'Billing'
  | 'Coverage';

/** CTA target — same enum as QA pages. */
export type GlossaryCtaTarget = 'screener' | 'analyzer';

export interface Glossary {
  /** URL slug, also JSON filename (e.g., "out-of-pocket-maximum") */
  slug: string;
  /** The term itself, used in hero/H1/schema name */
  term: LocalizedString;
  /**
   * Alternate names (abbreviations, synonyms) for DefinedTerm.alternateName.
   * Examples: OOP Max ["OOP Max", "MOOP", "Out-of-Pocket Limit"]
   * Non-localized for schema compatibility.
   */
  alternateNames: string[];
  /**
   * Canonical 1-2 sentence definition. Becomes DefinedTerm.description.
   * AI engines surface this for "what is X" queries.
   */
  definition: LocalizedString;
  category: GlossaryCategory;
  topic: string;
  medicalSpecialty: string;
  ctaTarget: GlossaryCtaTarget;
  lastUpdated: string;
  readingTime: string;

  meta: {
    title: LocalizedString;
    description: LocalizedString;
  };

  hero: {
    h1: LocalizedString;
    subhero: LocalizedString;
  };

  /** Longer "quick answer" definition (3-4 sentences), renders in cream blockquote */
  quickDefinition: LocalizedString;

  introParagraphs: LocalizedString[];

  /** Optional annual limits table (for year-anchored terms like OOP max, FPL) */
  annualLimits?: AnnualLimitsSection;

  /** Optional "what counts toward" list */
  whatCountsToward?: CountsTowardSection;

  /** Optional "what does NOT count toward" list */
  whatDoesNotCountToward?: CountsTowardSection;

  /** Optional worked example table */
  workedExample?: WorkedExampleSection;

  /** Flexible array of detail sections (MIN 2 for mid-CTA split) */
  detailSections: DetailSection[];

  /** FAQs — flat strings */
  faqs: {
    en: LocalizedFAQ[];
    es: LocalizedFAQ[];
  };

  relatedLinks: RelatedTerm[];

  sources: GlossarySource[];
}

// ─── Loader functions ─────────────────────────────────────────────────────

function readGlossaryFile(slug: string): Glossary | null {
  const filePath = path.join(glossaryDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw) as Glossary;
    if (parsed.slug !== slug) parsed.slug = slug;
    return parsed;
  } catch (err) {
    console.error(`[glossary] Failed to parse ${slug}.json:`, err);
    return null;
  }
}

export function getAllGlossaryEntries(): Glossary[] {
  if (!fs.existsSync(glossaryDir)) return [];
  const fileNames = fs.readdirSync(glossaryDir);
  return fileNames
    .filter((name) => name.endsWith('.json') && !name.startsWith('_') && !name.endsWith('.tmp.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .map((slug) => readGlossaryFile(slug))
    .filter((g): g is Glossary => g !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getGlossaryBySlug(slug: string): Glossary | null {
  return readGlossaryFile(slug);
}

export function getAllGlossarySlugs(): string[] {
  if (!fs.existsSync(glossaryDir)) return [];
  return fs
    .readdirSync(glossaryDir)
    .filter((name) => name.endsWith('.json') && !name.startsWith('_') && !name.endsWith('.tmp.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .sort();
}

export function pickLocale(ls: LocalizedString, locale: string): string {
  if (locale === 'es' && ls.es) return ls.es;
  return ls.en;
}

export function pickLocaleArray(lsa: LocalizedStringArray, locale: string): string[] {
  if (locale === 'es' && lsa.es && lsa.es.length > 0) return lsa.es;
  return lsa.en;
}
