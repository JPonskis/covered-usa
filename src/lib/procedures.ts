/**
 * procedures.ts — Loader for procedure-cost data files.
 *
 * Mirrors src/lib/blog.ts pattern but reads JSON instead of markdown.
 *
 * Each procedure lives at `content/data/procedures/<slug>.json` and contains
 * everything the procedure-cost page template needs to render. The dynamic
 * route at `src/app/[locale]/cost/[procedure]/page.tsx` calls these loaders
 * to (a) generate static params at build time and (b) fetch a specific
 * procedure's data at render time.
 *
 * Shape design notes:
 * - Bilingual (EN+ES) values live in the same file for simplicity. If JSON
 *   files get too large we can split, but starting with one file per procedure.
 * - Required fields are everything the template MUST render. Optional fields
 *   are for procedure-specific sections (e.g., MRI has body-part variants,
 *   a vaccine doesn't).
 * - Numeric pricing data is typed (numbers); string-valued ranges (e.g.,
 *   "$400 – $1,200") are kept as strings so writers can use natural ranges
 *   without forcing low/high splits.
 */

import fs from 'fs';
import path from 'path';

const proceduresDir = path.join(process.cwd(), 'content/data/procedures');

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

export interface ProcedurePricing {
  /** Median price nationally without insurance, USD */
  nationalMedian: number;
  /** Low end of typical range, USD */
  nationalLow: number;
  /** High end of typical range, USD */
  nationalHigh: number;
  /** 2026 Medicare Physician Fee Schedule (non-facility) allowed amount, USD */
  medicarePfsRate: number;
  /**
   * 2026 Medicare Outpatient PPS (hospital outpatient) allowed amount, USD.
   * Optional — not all procedures have a separate OPPS rate.
   */
  medicareOppsRate?: number;
  /** Beneficiary coinsurance percentage after deductible (typically 20) */
  medicareCoinsurancePct: number;
  /** Year the Part B deductible figure references (e.g., 2026) */
  partBDeductibleYear: number;
  /** Part B annual deductible for that year, USD (2026 = $283) */
  partBDeductibleAmount: number;
}

export interface SiteOfServiceRow {
  siteName: LocalizedString;
  /** e.g., "$400 – $1,200" — string for flexibility */
  rangeWithoutInsurance: string;
  /**
   * Medicare rate label. Usually "$475" but can be "Bundled in DRG" or
   * "Included with admission" for inpatient.
   */
  medicareRate: LocalizedString;
}

export interface SiteOfServiceSection {
  rows: SiteOfServiceRow[];
  /** "Why hospital is more expensive" explanatory paragraphs */
  explanationParagraphs: LocalizedString[];
  /** Footnote on the pricing table */
  tableFootnote: LocalizedString;
  /** Inline citation for table source */
  tableSource: string;
}

export interface VariantSection {
  heading: LocalizedString;
  intro: LocalizedString;
  /** Column headers, e.g., ["Body Part", "Range", "With contrast (add)"] */
  headers: LocalizedStringArray;
  /** Each row is an array of cell strings, parallel to headers */
  rows: LocalizedStringArray[];
  footnote: LocalizedString;
  source: string;
}

export interface MedicareSection {
  paragraphs: LocalizedString[];
}

export interface FactorsSection {
  items: LocalizedString[];
}

export interface BillingErrorsSection {
  intro: LocalizedString;
  items: LocalizedString[];
}

export interface RelatedLink {
  label: LocalizedString;
  /** Relative path, e.g., "/medicare-eligibility" — locale prefix added by template */
  href: string;
}

export interface ProcedureSource {
  name: string;
  url: string;
  note: LocalizedString;
}

// ─── Full procedure shape ─────────────────────────────────────────────────

export interface Procedure {
  /** URL slug, also the JSON filename without extension. Lowercase, hyphens. */
  slug: string;
  /** Full procedure name for hero / schema. */
  procedureName: LocalizedString;
  /** Short name for breadcrumbs / titles. */
  shortName: LocalizedString;
  /** MedicalProcedure schema procedureType: "Diagnostic" | "Surgical" | "Therapeutic" etc. */
  procedureType: string;
  /** MedicalWebPage schema medicalSpecialty: "Radiology" | "Cardiology" | "Primary Care" etc. */
  medicalSpecialty: string;
  /** ISO date string of last review */
  lastUpdated: string;
  /** Reading time string, e.g., "8 min read" */
  readingTime: string;
  /** Public-domain HCPCS Level II codes if applicable. */
  hcpcsCodes?: string[];

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

  // Quick Answer blockquote
  quickAnswer: LocalizedString;

  // Pricing facts
  pricing: ProcedurePricing;

  // Intro narrative (2-3 paragraphs)
  introParagraphs: LocalizedString[];

  // Site-of-service section (always present)
  siteOfService: SiteOfServiceSection;

  // Variant section (optional — e.g., body part for MRI, dosage for drugs)
  variants?: VariantSection;

  // Medicare section
  medicareSection: MedicareSection;

  // Factors affecting cost
  factorsAffectingCost: FactorsSection;

  // Optional billing errors section
  commonBillingErrors?: BillingErrorsSection;

  // FAQs
  faqs: {
    en: LocalizedFAQ[];
    es: LocalizedFAQ[];
  };

  // Related internal links
  relatedLinks: RelatedLink[];

  // Sources
  sources: ProcedureSource[];
}

// ─── Loader functions ─────────────────────────────────────────────────────

function readProcedureFile(slug: string): Procedure | null {
  const filePath = path.join(proceduresDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw) as Procedure;
    // Defensive: ensure slug field matches filename
    if (parsed.slug !== slug) {
      parsed.slug = slug;
    }
    return parsed;
  } catch (err) {
    console.error(`[procedures] Failed to parse ${slug}.json:`, err);
    return null;
  }
}

/** Get every procedure JSON file as a fully-loaded Procedure. */
export function getAllProcedures(): Procedure[] {
  if (!fs.existsSync(proceduresDir)) {
    return [];
  }
  const fileNames = fs.readdirSync(proceduresDir);
  return fileNames
    .filter((name) => name.endsWith('.json') && !name.startsWith('_') && !name.endsWith('.tmp.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .map((slug) => readProcedureFile(slug))
    .filter((p): p is Procedure => p !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/** Get a single procedure by slug. Returns null if not found. */
export function getProcedureBySlug(slug: string): Procedure | null {
  return readProcedureFile(slug);
}

/** Get just the slugs — used by generateStaticParams + sitemap. */
export function getAllProcedureSlugs(): string[] {
  if (!fs.existsSync(proceduresDir)) {
    return [];
  }
  return fs
    .readdirSync(proceduresDir)
    .filter((name) => name.endsWith('.json') && !name.startsWith('_') && !name.endsWith('.tmp.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .sort();
}

/** Pick a localized string by locale, falling back to 'en' if 'es' is missing. */
export function pickLocale(ls: LocalizedString, locale: string): string {
  if (locale === 'es' && ls.es) return ls.es;
  return ls.en;
}

/** Same for arrays. */
export function pickLocaleArray(lsa: LocalizedStringArray, locale: string): string[] {
  if (locale === 'es' && lsa.es && lsa.es.length > 0) return lsa.es;
  return lsa.en;
}
