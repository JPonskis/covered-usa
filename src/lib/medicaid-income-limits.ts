/**
 * medicaid-income-limits.ts — Loader for state-level Medicaid income-limit pages.
 *
 * Mirrors src/lib/medicare-advantage.ts pattern: one JSON per state under
 * `content/data/medicaid-income-limits/<state-slug>.json`. Rendered by the
 * dynamic route at `src/app/[locale]/medicaid-income-limits/[state]/page.tsx`.
 *
 * Why this schema looks the way it does:
 *
 * - Per FANOUT_FORMULA §5.1, "{state} {program} income limits {year}" is the
 *   single dominant Bing citation pattern across the entire BenefitsUSA
 *   dataset (4,200+ weighted citations). LLMs barely surface it because they
 *   need the state in the prompt to fan out — but real users routinely ask
 *   state-specific questions. Each page makes the household-size lookup table
 *   first-class so it can BE the citation surface.
 *
 * - Per FANOUT §3.3, the 9-row household-size table is mandatory whenever
 *   income gates eligibility. Per FANOUT §3.7, when a state-named program
 *   brand exists (Medi-Cal, AHCCCS, ARHOME, MaineCare, BadgerCare, SoonerCare,
 *   TennCare, MassHealth, etc.) it MUST appear alongside the canonical
 *   "Medicaid" generic in body content + key terms.
 *
 * - Per FANOUT §3.4, every page needs an explicit how-to-apply block with
 *   numbered steps + .gov starting URL + documents-needed checklist + common
 *   denial reasons. That's `applicationProcess`.
 *
 * - Per FANOUT §3.6, minimum 3 .gov source URLs (state Medicaid agency, CMS,
 *   HHS ASPE for FPL grounding) — verified by source domain check.
 *
 * - The schema supports BOTH state-brand states (CA → Medi-Cal) and
 *   generic-Medicaid states (TX → "Texas Medicaid"). When no state brand
 *   exists, set programBrand to "Medicaid" and programBrandFullName to the
 *   long form ("Texas Medicaid").
 *
 * - 2026 anchor facts (FPL figures, MAGI rules, expansion status) live in the
 *   JSON, not the template. Year flips happen by editing data, not code.
 *
 * - Bilingual (EN+ES) values live in the same file for simplicity, identical
 *   to the medicare-advantage.ts pattern.
 */

import fs from 'fs';
import path from 'path';

const medicaidDir = path.join(
  process.cwd(),
  'content/data/medicaid-income-limits'
);

// ─── Localized text shapes (mirrors medicare-advantage.ts) ────────────────

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
 * One row of the 9-row household-size income table. FANOUT §3.3 mandates
 * household sizes 1-8 plus an "each additional person" row. For Medicaid we
 * surface separate adult / child / pregnant thresholds because Medicaid
 * income limits diverge across populations within the same state — children
 * commonly qualify up to higher FPL than adults, and pregnancy coverage is
 * usually the highest threshold of all.
 */
export interface HouseholdSizeRow {
  /** Household size (1-8) or 0 sentinel for the "each additional person" row. */
  size: number;
  /** Display label, e.g., "1 person" / "Each additional person". Localized. */
  label: LocalizedString;
  /** Annual income limit (USD) for adult MAGI Medicaid in this state. Use 0 if not covered. */
  annualIncomeAdult: number;
  /** Annual income limit (USD) for children's Medicaid (highest age-bracket cap). */
  annualIncomeChild: number;
  /** Annual income limit (USD) for pregnancy Medicaid in this state. */
  annualIncomePregnant: number;
  /** Monthly income limit for adult Medicaid (rounded). 0 if not covered. */
  monthlyIncomeAdult: number;
  /** Monthly income limit for children's Medicaid (rounded). */
  monthlyIncomeChild: number;
  /** Monthly income limit for pregnancy Medicaid (rounded). */
  monthlyIncomePregnant: number;
  /**
   * % FPL anchor for the adult column (e.g., 138 for expansion states, 17
   * for Texas parent-with-dependent-child). Useful to display alongside the
   * dollar figure so users see why the threshold is what it is.
   */
  fplPercentageAdult: number;
  /** % FPL for children's column (often 138-300% depending on state + age). */
  fplPercentageChild: number;
  /** % FPL for pregnancy column (typically 138-380%). */
  fplPercentagePregnant: number;
}

export interface HouseholdSizeTable {
  /** Year these thresholds apply to (e.g., 2026). */
  year: number;
  /** Caption shown above the table. Localized. */
  caption: LocalizedString;
  /** Optional notes shown below the table (state-specific gotchas). */
  footnote: LocalizedString;
  /** Source citation for the figures. */
  source: string;
  /** Eight household-size rows (1-8) plus optional "each additional person" row. */
  rows: HouseholdSizeRow[];
}

export interface EligibilityRequirementsSection {
  intro: LocalizedString;
  /** Non-income criteria: residency, citizenship, household composition, asset tests, etc. */
  items: LocalizedString[];
}

export interface IncomeSourcesSection {
  intro: LocalizedString;
  /** Income types counted toward MAGI / state Medicaid income calculation. */
  included: LocalizedString[];
  /** Income types excluded from the calculation. */
  excluded: LocalizedString[];
  source: string;
}

export interface ApplicationProcessSection {
  intro: LocalizedString;
  /** Numbered application steps (3-7 steps per FANOUT §3.4). */
  steps: LocalizedString[];
  /** Official state Medicaid application portal URL (e.g., yourtexasbenefits.com). */
  portalUrl: string;
  /** Display-friendly portal name, e.g., "yourtexasbenefits.com". */
  portalName: string;
  /** Documents needed checklist. */
  documentsNeeded: LocalizedString[];
  /** Free-text expected processing timeline ("45 days", "30-45 days", etc.). Localized. */
  processingTimeline: LocalizedString;
  /** Common denial reasons (Entailment shape — top Bing-validated pattern). */
  commonDenialReasons: LocalizedString[];
}

export interface CrossReferenceCallout {
  /** Heading for the callout. Localized. */
  heading: LocalizedString;
  /** Body text. Localized. */
  body: LocalizedString;
  /** Optional internal link (relative path; locale prefix added by template). */
  href?: string;
  /** Display label for the link. Localized. */
  linkLabel?: LocalizedString;
}

export interface RelatedLink {
  label: LocalizedString;
  /** Relative path, e.g., "/medicaid-income-limits". Locale prefix added by template. */
  href: string;
}

export interface MedicaidSource {
  name: string;
  url: string;
  note: LocalizedString;
}

// ─── Full Medicaid state shape ────────────────────────────────────────────

export interface MedicaidIncomeLimitsState {
  /** URL slug (lowercase state name, e.g., "california", "new-york", "dc"). */
  slug: string;
  /** Full state name. Localized. */
  stateName: LocalizedString;
  /** Two-letter postal abbreviation, e.g., "TX". Not localized. */
  stateAbbreviation: string;
  /** Topic anchor ("Medicaid Income Limits"). */
  topic: string;
  /**
   * State-named program brand: "Medi-Cal", "AHCCCS", "ARHOME", "MaineCare",
   * "BadgerCare", "SoonerCare", "TennCare", "MassHealth", "HUSKY Health",
   * "Apple Health", "TexasBenefits", etc. Use "Medicaid" if no state brand.
   */
  programBrand: string;
  /**
   * Long-form display name, e.g., "Medi-Cal (California Medicaid)" or
   * "Texas Medicaid". Used in headings + intro paragraphs.
   */
  programBrandFullName: LocalizedString;
  /** Plan year these stats describe (e.g., 2026). */
  year: number;
  /** Did this state expand Medicaid under the ACA? */
  expansionStatus: boolean;
  /** Brief expansion-status note (e.g., "Did not expand; very limited adult coverage"). */
  expansionNote: LocalizedString;
  /** ISO date of last review (YYYY-MM-DD). */
  lastUpdated: string;
  /** Reading time string, e.g., "8 min read". */
  readingTime: string;
  /** Topic cluster used by the validators (per FANOUT §5.1: medicaid-income-{state}). */
  topicCluster: string;
  /** Per-state key terms (used in JSON-LD keywords + meta inference). */
  keyTerms: LocalizedStringArray;

  // SEO metadata
  meta: {
    title: LocalizedString;
    description: LocalizedString;
  };

  // Hero
  hero: {
    h1: LocalizedString;
    subhero: LocalizedString;
    /** Quick-answer blockquote. State + year + program-brand anchored. */
    quickAnswer: LocalizedString;
  };

  // Intro narrative (2-3 paragraphs)
  introParagraphs: LocalizedString[];

  // The mandatory 9-row household-size income table (FANOUT §3.3)
  householdSizeTable: HouseholdSizeTable;

  // Non-income eligibility requirements
  eligibilityRequirements: EligibilityRequirementsSection;

  // What income counts / doesn't count
  incomeSources: IncomeSourcesSection;

  // How to apply (numbered steps + .gov URL + documents + denials)
  applicationProcess: ApplicationProcessSection;

  // CHIP cross-reference for kids when family income exceeds Medicaid limit
  chipCrossReference: CrossReferenceCallout;

  // Medicare Savings Programs cross-reference for elderly low-income
  medicareSavingsProgramsCrossReference: CrossReferenceCallout;

  // FAQs (FAQPage schema)
  faqs: {
    en: LocalizedFAQ[];
    es: LocalizedFAQ[];
  };

  // Related internal links
  relatedLinks: RelatedLink[];

  // Sources (minimum 3 .gov URLs per FANOUT §3.6)
  sources: MedicaidSource[];
}

// ─── Loader functions ─────────────────────────────────────────────────────

function readStateFile(slug: string): MedicaidIncomeLimitsState | null {
  const filePath = path.join(medicaidDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw) as MedicaidIncomeLimitsState;
    if (parsed.slug !== slug) {
      parsed.slug = slug;
    }
    return parsed;
  } catch (err) {
    console.error(`[medicaid-income-limits] Failed to parse ${slug}.json:`, err);
    return null;
  }
}

/** Get every state JSON file as a fully-loaded MedicaidIncomeLimitsState. */
export function getAllMedicaidStates(): MedicaidIncomeLimitsState[] {
  if (!fs.existsSync(medicaidDir)) {
    return [];
  }
  const fileNames = fs.readdirSync(medicaidDir);
  return fileNames
    .filter(
      (name) =>
        name.endsWith('.json') &&
        !name.startsWith('_') &&
        !name.endsWith('.tmp.json')
    )
    .map((name) => name.replace(/\.json$/, ''))
    .map((slug) => readStateFile(slug))
    .filter((p): p is MedicaidIncomeLimitsState => p !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/** Get a single state by slug. Returns null if not found. */
export function getMedicaidStateData(
  slug: string
): MedicaidIncomeLimitsState | null {
  return readStateFile(slug);
}

/** Get just the slugs — used by generateStaticParams + sitemap. */
export function getAllMedicaidStateSlugs(): string[] {
  if (!fs.existsSync(medicaidDir)) {
    return [];
  }
  return fs
    .readdirSync(medicaidDir)
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
