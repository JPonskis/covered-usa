/**
 * drugs.ts — Loader for drug-cost data files.
 *
 * Mirrors src/lib/procedures.ts pattern. Each drug lives at
 * `content/data/drugs/<slug>.json` and conforms to the Drug interface.
 *
 * The dynamic route at `src/app/[locale]/drug/[drug]/page.tsx` uses
 * these loaders for (a) generateStaticParams and (b) per-request data.
 *
 * Lessons baked in from Phase 2A:
 * - `_`-prefix file exclusion in every directory read (so _queue.json etc.
 *   don't get treated as drugs and crash the build).
 * - `.tmp.json` exclusion (atomic-write tempfiles).
 * - JSON parse errors return null + log; route then 404s via notFound().
 */

import fs from 'fs';
import path from 'path';

const drugsDir = path.join(process.cwd(), 'content/data/drugs');

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

export interface DrugPricing {
  /**
   * Medicare Part B ASP (Average Sales Price) per the labeled unit, USD.
   * **NULL for oral Part D drugs** — they have no Part B ASP because they
   * aren't billed under Part B. Most outpatient prescriptions (metformin,
   * statins, ACE inhibitors, oral SGLT2 inhibitors, etc.) are Part D.
   * Injectables billed in-clinic (insulin J1815, infused biologics) are Part B.
   */
  medicareAspPerUnit: number | null;
  /** What "unit" means for this drug. Null when medicareAspPerUnit is null. */
  medicareAspUnit: LocalizedString | null;
  /** Retail low/high pharmacy cash price */
  retailLow: number;
  retailHigh: number;
  retailUnit: LocalizedString;
  /** Inpatient hospital charge range (the "markup angle") */
  inpatientLow: number;
  inpatientHigh: number;
  inpatientUnit: LocalizedString;
  /**
   * Medicare Part D monthly out-of-pocket cap for this drug, USD.
   * - $35 for insulin per IRA 2022 (effective 2023-01-01).
   * - null for drugs without a specific cap (they fall under the
   *   $2,100 annual Part D OOP cap effective 2026 instead).
   */
  medicarePartDMonthlyCap: number | null;
  /** Typical Medicaid copay range */
  medicaidCopayLow: number | null;
  medicaidCopayHigh: number | null;
  /** 2026 Part B deductible (anchor fact: $283) */
  partBDeductibleYear: number;
  partBDeductibleAmount: number;
  /** 2026 Part D annual OOP cap (anchor fact: $2,100) */
  partDAnnualOopCap: number;
}

/**
 * IRA Medicare drug price negotiation block.
 * Present for the first 10 drugs negotiated under the Inflation Reduction
 * Act of 2022, with maximum fair prices effective 2026-01-01:
 * Eliquis, Jardiance, Xarelto, Januvia, Farxiga, Entresto, Enbrel,
 * Imbruvica, Stelara, Fiasp/NovoLog.
 * Future rounds of negotiation will add more drugs.
 */
export interface IRANegotiation {
  /** Maximum Fair Price for a 30-day supply (or appropriate unit), USD */
  maxFairPrice: number;
  /** What the list price was before negotiation, USD */
  listPriceBefore: number;
  /** Effective date of the negotiated price (typically "2026-01-01") */
  effectiveDate: string;
  /** Source URL for the price (CMS or KFF) */
  source: string;
  /** Brief explanatory paragraph the page can render in a callout */
  callout: LocalizedString;
}

export interface PointOfPayRow {
  /** Where the patient pays (Medicare ASP, retail pharmacy, inpatient, Part D, Medicaid) */
  pointOfPay: LocalizedString;
  /** Cost label, e.g., "$12/unit" or "$25 - $300/vial" */
  cost: LocalizedString;
  notes: LocalizedString;
}

export interface PointOfPaySection {
  rows: PointOfPayRow[];
  /** Footnote on the pricing table */
  tableFootnote: LocalizedString;
  tableSource: string;
}

export interface WhyHospitalsChargeSection {
  paragraphs: LocalizedString[];
}

export interface HcpcsRow {
  /** The J-code itself */
  code: string;
  description: LocalizedString;
  whatToLookFor: LocalizedString;
}

export interface HcpcsSection {
  intro: LocalizedString;
  rows: HcpcsRow[];
  footnote: LocalizedString;
  source: string;
}

export interface PAPRow {
  /** Program name (proper noun — not localized) */
  program: string;
  costBenefit: LocalizedString;
  /** How to apply — a domain or URL */
  howToApply: string;
}

export interface PAPSection {
  intro: LocalizedString;
  rows: PAPRow[];
  footnote: LocalizedString;
  source: string;
}

export interface MedicarePartDSection {
  /** Whether this drug specifically has a Part D cap (e.g., $35 insulin cap) */
  hasSpecificCap: boolean;
  paragraphs: LocalizedString[];
}

export interface BillingErrorsSection {
  intro: LocalizedString;
  items: LocalizedString[];
}

export interface RelatedLink {
  label: LocalizedString;
  href: string;
}

export interface DrugSource {
  name: string;
  url: string;
  note: LocalizedString;
}

// ─── Full drug shape ──────────────────────────────────────────────────────

export interface Drug {
  /** URL slug, also JSON filename without extension */
  slug: string;
  /** Full drug name for hero / schema (e.g., "Insulin", "Ozempic") */
  drugName: LocalizedString;
  /** Short name for breadcrumbs */
  shortName: LocalizedString;
  /** Generic name(s), used in schema.org `nonProprietaryName` */
  nonProprietaryName: string;
  /** Major brand names */
  brandNames: string[];
  /** Pharmacology class, e.g., "GLP-1 receptor agonist", "Statin" */
  drugClass: LocalizedString;
  /** Route of administration: "Injection" | "Oral" | "Inhalation" | "Topical" | "Infusion" */
  routeOfAdministration: string;
  /** schema.org medicalSpecialty for MedicalWebPage */
  medicalSpecialty: string;
  /** ISO date of last review */
  lastUpdated: string;
  readingTime: string;
  /** HCPCS Level II J-codes (drug administration codes — public domain) */
  hcpcsJCodes: string[];

  meta: {
    title: LocalizedString;
    description: LocalizedString;
  };

  hero: {
    h1: LocalizedString;
    subhero: LocalizedString;
  };

  quickAnswer: LocalizedString;

  pricing: DrugPricing;

  /** IRA negotiated price block (only for IRA-negotiated drugs) */
  iraNegotiation?: IRANegotiation;

  introParagraphs: LocalizedString[];

  /** Pricing by point of pay (always present — this is the core data table) */
  pointOfPay: PointOfPaySection;

  /** "Why hospitals charge so much" explanation (always present) */
  whyHospitalsCharge: WhyHospitalsChargeSection;

  /** HCPCS J-codes table (present for any drug with administration codes) */
  hcpcsSection?: HcpcsSection;

  /** Patient Assistance Programs (present for drugs with manufacturer PAPs) */
  patientAssistancePrograms?: PAPSection;

  /** Medicare Part D coverage section (present for Part D drugs) */
  medicarePartD?: MedicarePartDSection;

  /** Common billing errors specific to this drug */
  commonBillingErrors?: BillingErrorsSection;

  /** FAQs — note: en and es arrays are FLAT {question, answer} pairs, NOT LocalizedString */
  faqs: {
    en: LocalizedFAQ[];
    es: LocalizedFAQ[];
  };

  relatedLinks: RelatedLink[];

  sources: DrugSource[];
}

// ─── Loader functions ─────────────────────────────────────────────────────

function readDrugFile(slug: string): Drug | null {
  const filePath = path.join(drugsDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw) as Drug;
    if (parsed.slug !== slug) {
      parsed.slug = slug;
    }
    return parsed;
  } catch (err) {
    console.error(`[drugs] Failed to parse ${slug}.json:`, err);
    return null;
  }
}

/** Get every drug JSON file (excluding _-prefix config files and .tmp.json). */
export function getAllDrugs(): Drug[] {
  if (!fs.existsSync(drugsDir)) {
    return [];
  }
  const fileNames = fs.readdirSync(drugsDir);
  return fileNames
    .filter((name) => name.endsWith('.json') && !name.startsWith('_') && !name.endsWith('.tmp.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .map((slug) => readDrugFile(slug))
    .filter((d): d is Drug => d !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/** Get a single drug by slug. */
export function getDrugBySlug(slug: string): Drug | null {
  return readDrugFile(slug);
}

/** Get just the slugs — used by generateStaticParams + sitemap. */
export function getAllDrugSlugs(): string[] {
  if (!fs.existsSync(drugsDir)) {
    return [];
  }
  return fs
    .readdirSync(drugsDir)
    .filter((name) => name.endsWith('.json') && !name.startsWith('_') && !name.endsWith('.tmp.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .sort();
}

/** Pick a localized string by locale, falling back to 'en'. */
export function pickLocale(ls: LocalizedString, locale: string): string {
  if (locale === 'es' && ls.es) return ls.es;
  return ls.en;
}

/** Same for arrays. */
export function pickLocaleArray(lsa: LocalizedStringArray, locale: string): string[] {
  if (locale === 'es' && lsa.es && lsa.es.length > 0) return lsa.es;
  return lsa.en;
}
