/**
 * medicare-advantage.ts — Loader for state-level Medicare Advantage data files.
 *
 * Mirrors src/lib/procedures.ts pattern: one JSON per state under
 * `content/data/medicare-advantage/<state-slug>.json`. Rendered by the
 * dynamic route at `src/app/[locale]/medicare-advantage/[state]/page.tsx`.
 *
 * Why this schema looks the way it does:
 *
 * - Medicare Advantage market data IS the proprietary content. Plan count,
 *   enrolled beneficiaries, average premium, top carriers, county variance
 *   are all numeric facts AI engines love to cite. Structured fields > prose.
 *
 * - State-by-state variance is real: California has ~140 plans and Kaiser as
 *   the dominant carrier; Wyoming has ~25 plans across the whole state.
 *   The same template renders both without forcing one shape on the other.
 *
 * - 2026 anchor facts (AEP dates, OEP dates, Part B premium, Part D OOP cap)
 *   live in the JSON, not the template. The template is locale-aware but
 *   data-agnostic — change a fact in JSON, the page updates.
 *
 * - Bilingual (EN+ES) values live in the same file for simplicity, identical
 *   to the Phase 2 pattern.
 */

import fs from 'fs';
import path from 'path';

const medicareAdvantageDir = path.join(
  process.cwd(),
  'content/data/medicare-advantage'
);

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

export interface CarrierRow {
  /** Carrier name as commonly known. Not localized — proper noun. */
  name: string;
  /** Number of plans offered statewide. */
  planCount: number;
  /** Carrier-wide average Star Rating (1.0 to 5.0, half-step). */
  averageStarRating: number;
  /** Carrier-wide average monthly premium in USD. */
  averagePremium: number;
  /** Optional carrier notes ("Dominant in NorCal; HMO-only", etc.). */
  notes?: LocalizedString;
}

export interface MarketOverview {
  /** Plan year these stats describe (e.g., 2026). */
  dataYear: number;
  /** Total MA plans available statewide. */
  totalPlansAvailable: number;
  /** Enrolled MA beneficiaries statewide. */
  enrolledBeneficiaries: number;
  /** Statewide MA penetration rate (%) — MA enrollees / total Medicare eligibles. */
  penetrationPct: number;
  /** Statewide weighted-average monthly premium in USD (incl. $0 plans). */
  averageMonthlyPremium: number;
  /** Statewide weighted-average Star Rating (1.0 to 5.0). */
  averageStarRating: number;
  /** Top carriers by plan count (5-10 rows recommended). */
  topCarriers: CarrierRow[];
  /** Source citation, e.g., "CMS Medicare Plan Finder Q4 2025, KFF". */
  source: string;
}

export interface PlanTypesSection {
  /** Column headers, e.g., ["Plan Type", "Plans", "Avg Premium", "Notes"]. */
  headers: LocalizedStringArray;
  /** One row per plan type (HMO / PPO / SNP / PFFS / MSA). */
  rows: LocalizedStringArray[];
  footnote: LocalizedString;
  source: string;
}

export interface CountyExample {
  /** County name as commonly known, e.g., "Los Angeles County". */
  county: LocalizedString;
  /** Plans available in that county. */
  planCount: number;
  /** Average premium in that county (USD). */
  averagePremium: number;
  /** Optional shading: "urban", "rural", "mixed". */
  classification?: LocalizedString;
}

export interface CountyVarianceSection {
  intro: LocalizedString;
  examples: CountyExample[];
  footnote: LocalizedString;
  source: string;
}

export interface WhatToLookForSection {
  intro: LocalizedString;
  items: LocalizedString[];
}

export interface ImportantDate {
  label: LocalizedString;
  /** Free-text date range (e.g., "October 15 - December 7, 2026"). */
  date: LocalizedString;
  /** Optional one-sentence note explaining what this period is for. */
  note?: LocalizedString;
}

export interface ImportantDatesSection {
  intro: LocalizedString;
  items: ImportantDate[];
}

export interface DetailSectionTable {
  headers: LocalizedStringArray;
  rows: LocalizedStringArray[];
  footnote?: LocalizedString;
  source?: string;
}

export interface DetailSection {
  heading: LocalizedString;
  paragraphs: LocalizedString[];
  list?: LocalizedString[];
  table?: DetailSectionTable;
}

export interface StateExtra {
  label: LocalizedString;
  description: LocalizedString;
}

export interface StateExtrasSection {
  intro: LocalizedString;
  items: StateExtra[];
}

export interface RelatedLink {
  label: LocalizedString;
  /** Relative path, e.g., "/medicare-eligibility". Locale prefix added by template. */
  href: string;
}

export interface MASource {
  name: string;
  url: string;
  note: LocalizedString;
}

// ─── Full Medicare Advantage state shape ─────────────────────────────────

export interface MedicareAdvantageState {
  /** URL slug (lowercase state name, e.g., "california", "new-york"). */
  slug: string;
  /** Full state name. */
  stateName: LocalizedString;
  /** Two-letter postal abbreviation, e.g., "CA". Not localized. */
  stateAbbreviation: string;
  /** Topic anchor ("Medicare Advantage"). */
  topic: string;
  /** MedicalSpecialty schema field ("Geriatrics" / "Medicare"). */
  medicalSpecialty: string;
  /** CTA destination — Medicare-shoppers should hit the screener for now. */
  ctaTarget: 'screener' | 'analyzer';
  /** ISO date of last review (YYYY-MM-DD). */
  lastUpdated: string;
  /** Reading time string, e.g., "9 min read". */
  readingTime: string;

  // SEO metadata
  meta: {
    title: LocalizedString;
    description: LocalizedString;
  };

  // Hero
  hero: {
    h1: LocalizedString;
    subhero: LocalizedString;
  };

  // Quick Answer blockquote (state-anchored, plan-count + premium + AEP)
  quickAnswer: LocalizedString;

  // Intro narrative (2-3 paragraphs)
  introParagraphs: LocalizedString[];

  // Market snapshot (the proprietary numeric content)
  marketOverview: MarketOverview;

  // Plan type breakdown table
  planTypes: PlanTypesSection;

  // County-level variance callout (optional but high-value for big states)
  countyVariance?: CountyVarianceSection;

  // What to look for in a plan
  whatToLookFor: WhatToLookForSection;

  // Key dates (AEP, OEP, IEP, etc.)
  importantDates: ImportantDatesSection;

  // State-specific extras (optional — e.g., CA's transportation benefits,
  // NY's home health add-ons, FL's hurricane-area provisions)
  stateExtras?: StateExtrasSection;

  // Flexible detail sections (MA vs Original, Star Ratings explanation, etc.)
  detailSections: DetailSection[];

  // FAQs
  faqs: {
    en: LocalizedFAQ[];
    es: LocalizedFAQ[];
  };

  // Related internal links
  relatedLinks: RelatedLink[];

  // Sources
  sources: MASource[];
}

// ─── Loader functions ─────────────────────────────────────────────────────

function readStateFile(slug: string): MedicareAdvantageState | null {
  const filePath = path.join(medicareAdvantageDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw) as MedicareAdvantageState;
    if (parsed.slug !== slug) {
      parsed.slug = slug;
    }
    return parsed;
  } catch (err) {
    console.error(`[medicare-advantage] Failed to parse ${slug}.json:`, err);
    return null;
  }
}

/** Get every state JSON file as a fully-loaded MedicareAdvantageState. */
export function getAllMAStates(): MedicareAdvantageState[] {
  if (!fs.existsSync(medicareAdvantageDir)) {
    return [];
  }
  const fileNames = fs.readdirSync(medicareAdvantageDir);
  return fileNames
    .filter(
      (name) =>
        name.endsWith('.json') &&
        !name.startsWith('_') &&
        !name.endsWith('.tmp.json')
    )
    .map((name) => name.replace(/\.json$/, ''))
    .map((slug) => readStateFile(slug))
    .filter((p): p is MedicareAdvantageState => p !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/** Get a single state by slug. Returns null if not found. */
export function getMAStateBySlug(slug: string): MedicareAdvantageState | null {
  return readStateFile(slug);
}

/** Get just the slugs — used by generateStaticParams + sitemap. */
export function getAllMAStateSlugs(): string[] {
  if (!fs.existsSync(medicareAdvantageDir)) {
    return [];
  }
  return fs
    .readdirSync(medicareAdvantageDir)
    .filter(
      (name) =>
        name.endsWith('.json') &&
        !name.startsWith('_') &&
        !name.endsWith('.tmp.json')
    )
    .map((name) => name.replace(/\.json$/, ''))
    .sort();
}

/** Pick a localized string by locale, falling back to 'en' if 'es' is missing. */
export function pickLocale(ls: LocalizedString, locale: string): string {
  if (locale === 'es' && ls.es) return ls.es;
  return ls.en;
}

/** Same for arrays. */
export function pickLocaleArray(
  lsa: LocalizedStringArray,
  locale: string
): string[] {
  if (locale === 'es' && lsa.es && lsa.es.length > 0) return lsa.es;
  return lsa.en;
}
