# Track D — Canonical Schema (single source of truth)

This doc is the canonical contract for Track D state Medicaid income-limit pages on
coveredusa.org. All five other surfaces (TypeScript interface, page template,
Texas JSON, Arizona JSON, writer agent prompt, verifier agent prompt) MUST agree
with this shape. If any of them drifts, fix it back to match this doc.

## Background — why this doc exists

Two pages shipped before this alignment:

- `texas.json` was hand-written by the template-code agent with English-only flat
  string fields and used `programBrand`/`year`/`expansionStatus: bool`.
- `arizona.json` was produced by the writer agent later, using bilingual
  `{en, es}` objects everywhere AND the same field names as the TS interface
  (`programBrand`/`year`/`expansionStatus: bool`).

Both rendered correctly because the page template was permissive. But the writer
agent prompt + verifier agent prompt referenced a third, incompatible shape
(`stateBrand`/`dataYear`/`expansionStatus: "expanded"`/`detailSections`/
`incomeSourceRules`/`applicationWorkflow`) that was never actually implemented
in the loader, page template, or any data file. That was a 6-way drift waiting
to break the next state we shipped.

This doc resolves the drift: **TS interface field names win, writer's bilingual
structure wins, expansionStatus becomes a structured object.**

## Decision summary

| Concern | Decision | Rationale |
|---|---|---|
| Brand field name | `stateBrand` (rename from `programBrand`) | Cleaner, semantic — it's the state-named program brand, not a generic program brand |
| Brand long-form | `stateBrandFullName` (rename from `programBrandFullName`) | Match `stateBrand` parent |
| Year field | `dataYear` (rename from `year`) | Disambiguates from `householdSizeTable.year` and from year-in-prose |
| Bilingual fields | `{en, es}` LocalizedString objects | Enables real Spanish translation by data, not by template duplication |
| Expansion status | `{status: 'expanded'\|'not-expanded', effectiveDate?, expansionNote?}` | Captures the date + the localized prose alongside the boolean-ish status |
| Stateful (non-translatable) fields | Stay as flat strings/numbers | Not user-facing prose: slug, abbreviation, URLs, dates, dollar values, FPL percentages |

## Canonical TypeScript interface

```ts
export interface LocalizedString {
  en: string;
  es: string;
}

export interface LocalizedStringArray {
  en: string[];
  es: string[];
}

/** FAQ Q&A pair — flat strings; one per locale via `faqs.{en|es}` arrays. */
export interface LocalizedFAQ {
  question: string;
  answer: string;
}

/** One row of the 9-row household-size income table. FANOUT §3.3 mandate. */
export interface HouseholdSizeRow {
  /** Household size (1-8) or 0 sentinel for the "each additional person" row. */
  size: number;
  /** Display label, e.g., "1 person" / "Each additional person". Localized. */
  label: LocalizedString;
  /** Annual income limit (USD) for adult MAGI Medicaid. 0 if not covered. */
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
  /** % FPL anchor for the adult column. */
  fplPercentageAdult: number;
  /** % FPL for children's column. */
  fplPercentageChild: number;
  /** % FPL for pregnancy column. */
  fplPercentagePregnant: number;
}

export interface HouseholdSizeTable {
  /** Plan year these thresholds apply to (e.g., 2026). NOT the page dataYear (same value typically). */
  year: number;
  /** Caption shown above the table. Localized. */
  caption: LocalizedString;
  /** Notes shown below the table (state-specific gotchas). */
  footnote: LocalizedString;
  /** Source citation. Flat string (URL/agency name, not translated). */
  source: string;
  /** EXACTLY 9 rows: sizes 1-8 + the "each additional person" sentinel (size: 0). */
  rows: HouseholdSizeRow[];
}

export interface EligibilityRequirementsSection {
  intro: LocalizedString;
  /** Non-income criteria: residency, citizenship, household composition, asset tests. */
  items: LocalizedString[];
}

export interface IncomeSourcesSection {
  intro: LocalizedString;
  included: LocalizedString[];
  excluded: LocalizedString[];
  /** Source citation. Flat string. */
  source: string;
}

export interface ApplicationProcessSection {
  intro: LocalizedString;
  /** Numbered application steps (3-7 steps per FANOUT §3.4). */
  steps: LocalizedString[];
  /** Official state Medicaid application portal URL. Flat string (URL not translated). */
  portalUrl: string;
  /** Display-friendly portal name. Flat string. */
  portalName: string;
  /** Documents needed checklist. */
  documentsNeeded: LocalizedString[];
  /** Free-text expected processing timeline. Localized. */
  processingTimeline: LocalizedString;
  /** Common denial reasons. */
  commonDenialReasons: LocalizedString[];
}

export interface CrossReferenceCallout {
  heading: LocalizedString;
  body: LocalizedString;
  /** Optional internal link (relative path, e.g., "/medicaid-income-limits"). Flat string. */
  href?: string;
  linkLabel?: LocalizedString;
}

export interface RelatedLink {
  label: LocalizedString;
  /** Relative path. Flat string. */
  href: string;
}

export interface MedicaidSource {
  /** Display name. Flat string (proper-noun publication titles aren't translated). */
  name: string;
  /** URL. Flat string. */
  url: string;
  note: LocalizedString;
}

/** Expansion status — STRUCTURED object (not boolean). */
export interface ExpansionStatus {
  status: 'expanded' | 'not-expanded' | 'partial';
  /** ISO date the state expanded (or the date of partial expansion). Flat string. */
  effectiveDate?: string;
  /** Brief localized note explaining context (e.g., "did not expand; covers parents only ~17% FPL"). */
  expansionNote?: LocalizedString;
}

export interface MedicaidIncomeLimitsState {
  /** URL slug. Flat string. */
  slug: string;
  /** Full state name. Localized (Spanish form where it differs). */
  stateName: LocalizedString;
  /** Two-letter postal abbreviation. Flat string. */
  stateAbbreviation: string;
  /** Topic anchor. Flat string. */
  topic: string;
  /**
   * State-named program brand: "Medi-Cal", "AHCCCS", "ARHOME", etc.
   * Flat string. Use "Medicaid" if no state brand. (Renamed from programBrand.)
   */
  stateBrand: string;
  /**
   * Long-form display name, e.g., "Medi-Cal (California Medicaid)" or
   * "Texas Medicaid". Localized. (Renamed from programBrandFullName.)
   */
  stateBrandFullName: LocalizedString;
  /** Plan year these stats describe (e.g., 2026). Flat number. (Renamed from year.) */
  dataYear: number;
  /** Did this state expand Medicaid under the ACA? STRUCTURED OBJECT. */
  expansionStatus: ExpansionStatus;
  /** ISO date of last review (YYYY-MM-DD). Flat string. */
  lastUpdated: string;
  /** Reading time string. Flat string. */
  readingTime: string;
  /** Topic cluster. Flat string. */
  topicCluster: string;
  /** Per-state key terms used in JSON-LD keywords + meta inference. */
  keyTerms: LocalizedStringArray;

  meta: {
    title: LocalizedString;
    description: LocalizedString;
  };

  hero: {
    h1: LocalizedString;
    subhero: LocalizedString;
    quickAnswer: LocalizedString;
  };

  introParagraphs: LocalizedString[];
  householdSizeTable: HouseholdSizeTable;
  eligibilityRequirements: EligibilityRequirementsSection;
  incomeSources: IncomeSourcesSection;
  applicationProcess: ApplicationProcessSection;
  chipCrossReference: CrossReferenceCallout;
  medicareSavingsProgramsCrossReference: CrossReferenceCallout;

  /** FAQs — TWO parallel arrays of LocalizedFAQ. NOT one array of bilingual objects. */
  faqs: {
    en: LocalizedFAQ[];
    es: LocalizedFAQ[];
  };

  relatedLinks: RelatedLink[];
  /** Sources (minimum 3 .gov URLs per FANOUT §3.6). */
  sources: MedicaidSource[];
}
```

## Field-by-field rationale

### Why bilingual?
Every translatable prose field uses `LocalizedString = {en, es}`. This is the only
shape that makes the Spanish twin actually Spanish — not a fallback to English.
The page template's `pickLocale` helper extracts the right language at render
time. If we left these as flat strings, the `/es/` route would either show
English fallback (current bug for the Texas page after migration) OR require a
parallel template tree (worst-case bloat).

### Why rename programBrand → stateBrand?
Semantic clarity. The brand is owned by the state (Medi-Cal is California's
Medicaid brand; AHCCCS is Arizona's Medicaid brand). "programBrand" is
overloaded — it suggested generic "Medicaid" might also be a brand, which is
wrong. Other places in the codebase already use the noun "state brand" to
refer to this concept.

### Why rename year → dataYear?
Avoids shadowing. The `householdSizeTable` already has a `year` field on it
(the year the table values apply to). Having a top-level `year` next to a
nested `householdSizeTable.year` was a footgun — easy to mis-reference in the
page template or writer prompt. `dataYear` reads as "the data-year of this page."

### Why expansionStatus as object, not bool?
The boolean `true/false` answered the wrong question. The real question users
ask is: "When did my state expand?" or "What's the workaround if it didn't?"
Capturing the effective date alongside the boolean-ish status (and a localized
prose note) packages all three answers in one field. Renderer can show
"Expanded January 1, 2014" instead of just a green checkmark.

### Why are URLs/dates/dollar amounts NOT bilingual?
URLs don't translate. ISO dates don't translate. Dollar amounts use the same
glyphs in both languages (the page template handles localized number formatting
via `toLocaleString(isEs ? 'es-US' : 'en-US')`). Keeping these flat keeps the
JSON smaller and avoids the trap of accidentally giving the Spanish locale a
different URL than the English locale.

### Why `faqs: {en: LocalizedFAQ[], es: LocalizedFAQ[]}` instead of one
`LocalizedFAQ[]` with bilingual question/answer?
Two parallel arrays let the writer translate (or even reorder) FAQs per locale
without forcing a 1-to-1 mapping. Spanish FAQs may reorder by importance or
include culturally-specific extras. The current page template already consumes
this shape; this preserves that capability.

## Migration map (old → new)

For Texas JSON (English-only flat → bilingual structure):
- All `meta.title`, `meta.description`, `hero.*`, `introParagraphs[]`,
  `householdSizeTable.caption/footnote`, every section's intro/items/etc.,
  every `chipCrossReference`/`medicareSavingsProgramsCrossReference` text
  field → wrap in `{en, es}` with native Spanish translations.
- `faqs[]` (single array) → `faqs: {en: [...], es: [...]}`.
- `keyTerms[]` (flat array) → `keyTerms: {en: [...], es: [...]}`.

For Arizona JSON (already bilingual, just rename fields):
- `programBrand` → `stateBrand`
- `programBrandFullName` → `stateBrandFullName`
- `year` → `dataYear`
- `expansionStatus: true` (bool) + `expansionNote: {en, es}` (sibling) →
  `expansionStatus: { status: "expanded", effectiveDate: "2014-01-01", expansionNote: {en, es} }`

For TS interface:
- Rename `programBrand` → `stateBrand`.
- Rename `programBrandFullName` → `stateBrandFullName`.
- Rename `year` → `dataYear`.
- Rename `expansionNote` (top-level) → moves into `expansionStatus.expansionNote`.
- Change `expansionStatus: boolean` → `expansionStatus: ExpansionStatus` object.
- Add `ExpansionStatus` interface.

For page template:
- Replace `data.programBrand` references with `data.stateBrand`.
- Replace `data.programBrandFullName` references with `data.stateBrandFullName`.
- Replace `data.year` references with `data.dataYear`.
- Replace `data.expansionStatus` (used as bool) with `data.expansionStatus.status === 'expanded'` etc.
- All other rendering paths stay the same — `pickLocale` already handles
  bilingual fields correctly.

For writer prompt:
- All field-name references must use canonical (`stateBrand`, `stateBrandFullName`,
  `dataYear`, structured `expansionStatus`).
- Worked-example JSON snippets must reflect canonical shape.
- The writer's prior-mentioned `incomeSourceRules`, `applicationWorkflow`,
  `eligibilityCategories`, `detailSections`, `crossReferences` schema is
  REPLACED with the canonical `eligibilityRequirements`, `incomeSources`,
  `applicationProcess`, `chipCrossReference`, `medicareSavingsProgramsCrossReference`
  shape that actually matches the loader.

For verifier prompt:
- All gate checks reference canonical field names.
- GATE B: `householdSizeTable.rows.length === 9` (unchanged, but field path same).
- GATE E: `stateBrand` (not `programBrand`).
- GATE F: check `applicationProcess` field (not `applicationWorkflow`):
  `applicationProcess.steps`, `applicationProcess.portalUrl`,
  `applicationProcess.documentsNeeded`, `applicationProcess.commonDenialReasons`.
- GATE G: check `incomeSources.included` (≥6) + `incomeSources.excluded` (≥4).
- GATE H: check `chipCrossReference` + `medicareSavingsProgramsCrossReference` (both required, unlike "≥2 entries in crossReferences[] array").
- expansionStatus structural check: must be object with `status` field.

## Side-by-side comparison (Texas current vs Arizona current vs canonical)

| Field | Texas (pre-migration) | Arizona (pre-rename) | Canonical |
|---|---|---|---|
| `programBrand` / `stateBrand` | `"Texas Medicaid"` | `"AHCCCS"` | `stateBrand: "Texas Medicaid" \| "AHCCCS"` |
| `programBrandFullName` / `stateBrandFullName` | `{en: "Texas Medicaid", es: "Texas Medicaid"}` | `{en: "AHCCCS (Arizona...)", es: "AHCCCS (Sistema...)"}` | `stateBrandFullName: LocalizedString` |
| `year` / `dataYear` | `2026` | `2026` | `dataYear: 2026` |
| `expansionStatus` | `false` | `true` | `{status: "not-expanded", effectiveDate?: "...", expansionNote: {en, es}}` |
| `expansionNote` (top-level) | `{en: "Texas did not expand...", es: "Texas no expandió..."}` | `{en: "Arizona expanded...", es: "Arizona expandió..."}` | MOVED to `expansionStatus.expansionNote` |
| `meta.title` | `{en, es}` (already bilingual) | `{en, es}` | `LocalizedString` |
| `hero.*` | `{en, es}` (already bilingual) | `{en, es}` | `LocalizedString` |
| `introParagraphs[]` | array of `{en, es}` | array of `{en, es}` | `LocalizedString[]` |
| `householdSizeTable.caption` | `{en, es}` (already bilingual) | `{en, es}` | `LocalizedString` |
| `householdSizeTable.rows[].label` | `{en, es}` | `{en, es}` | `LocalizedString` |
| `eligibilityRequirements` | bilingual structure | bilingual structure | `EligibilityRequirementsSection` |
| `incomeSources` | bilingual structure | bilingual structure | `IncomeSourcesSection` |
| `applicationProcess` | bilingual structure | bilingual structure | `ApplicationProcessSection` |
| `chipCrossReference` | `{heading, body, href, linkLabel}` all bilingual | same | `CrossReferenceCallout` |
| `medicareSavingsProgramsCrossReference` | same | same | `CrossReferenceCallout` |
| `faqs` | `{en: LocalizedFAQ[], es: LocalizedFAQ[]}` | same | `{en, es}` parallel arrays |
| `relatedLinks[].label` | `{en, es}` | `{en, es}` | `LocalizedString` |
| `sources[].note` | `{en, es}` | `{en, es}` | `LocalizedString` |
| `keyTerms` | `{en: [...], es: [...]}` | `{en: [...], es: [...]}` | `LocalizedStringArray` |

NOTE: as of this doc, BOTH Texas and Arizona JSONs are already fully bilingual.
The remaining work is JUST the field renames (programBrand → stateBrand, year →
dataYear, expansionStatus bool → object) plus moving `expansionNote` inside
`expansionStatus`. No new translation work needed for the data files — the
template-code agent had already done full Spanish translations on Texas during
its initial write.

## Last updated

2026-05-15 — initial alignment.
