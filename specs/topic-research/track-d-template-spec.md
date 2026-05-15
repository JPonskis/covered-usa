# Track D — `/medicaid-income-limits/[state]` Template Spec

**Date:** 2026-05-15
**Status:** Infrastructure live. Texas test page rendered + production-build verified. Awaiting writer/verifier agents (parallel work) to fan out the remaining 50 states.
**Related:** `BUILD_PLAN.md` Phase 2, `FANOUT_FORMULA.md` §3.3, §3.7, §4.4, §5.1.

---

## Why this template exists

Per `FANOUT_FORMULA.md` §5.1: `{state} {program} income limits {year}` is the single dominant Bing citation pattern across the entire BenefitsUSA dataset (4,200+ weighted citations). LLM probes barely surface it because LLMs need state-specified user prompts to fan out into it — but real users routinely ask state-specific questions. This is the highest-ROI page cluster on CoveredUSA's roadmap. 51 pages = 50 states + DC.

The existing `/medicaid-income-limits` route stays put as the national lighthouse. The new dynamic route adds `/medicaid-income-limits/[state]` alongside it.

---

## Route

```
/[locale]/medicaid-income-limits/[state]
```

URL examples:
- `/en/medicaid-income-limits/texas`
- `/es/medicaid-income-limits/california`
- `/en/medicaid-income-limits/dc`

`generateStaticParams()` pre-renders the first 20 state slugs × 2 locales at build time. Beyond that, ISR (Next.js incremental static regeneration) handles the long tail — new state JSON files appear at the URL automatically without a code change.

---

## Files

| File | Purpose |
|---|---|
| `src/app/[locale]/medicaid-income-limits/[state]/page.tsx` | Dynamic route page component. ~480 lines. Mirrors `medicare-advantage/[state]/page.tsx`. |
| `src/lib/medicaid-income-limits.ts` | TypeScript loader + JSON schema (`MedicaidIncomeLimitsState` interface). ~280 lines. |
| `src/app/sitemap.ts` | Updated to auto-include all `getAllMedicaidStateSlugs()` entries. Priority 0.9 to match ma-state. |
| `content/data/medicaid-income-limits/<slug>.json` | One file per state. Texas is the gold-standard example. |
| `src/app/[locale]/medicaid-income-limits/page.tsx` | UNCHANGED — national lighthouse stays exactly as it was. |

---

## Data schema

The full TypeScript interface is `MedicaidIncomeLimitsState` in `src/lib/medicaid-income-limits.ts`. The schema deliberately supports BOTH state-brand states (CA → Medi-Cal, AZ → AHCCCS, AR → ARHOME) and generic-Medicaid states (TX → "Texas Medicaid"). When no state brand exists, set `programBrand: "Medicaid"` and `programBrandFullName: "<State> Medicaid"`.

### Top-level required fields

```ts
{
  slug: string;                       // matches filename (lowercase state name)
  stateName: { en, es };
  stateAbbreviation: string;          // "TX", "CA", "DC"
  topic: "Medicaid Income Limits";
  programBrand: string;               // "Medi-Cal" / "AHCCCS" / "Texas Medicaid" — never blank
  programBrandFullName: { en, es };
  year: 2026;
  expansionStatus: boolean;
  expansionNote: { en, es };
  lastUpdated: "YYYY-MM-DD";
  readingTime: "9 min read";
  topicCluster: "medicaid-income-<state>";  // per FANOUT §5.1
  keyTerms: { en: string[], es: string[] };
  meta: { title: {en,es}, description: {en,es} };
  hero: { h1, subhero, quickAnswer };       // all bilingual
  introParagraphs: LocalizedString[];        // 2-3 paragraphs each locale
  householdSizeTable: HouseholdSizeTable;
  eligibilityRequirements: { intro, items[] };
  incomeSources: { intro, included[], excluded[], source };
  applicationProcess: { intro, steps[3-7], portalUrl, portalName, documentsNeeded[], processingTimeline, commonDenialReasons[] };
  chipCrossReference: CrossReferenceCallout;
  medicareSavingsProgramsCrossReference: CrossReferenceCallout;
  faqs: { en: [{question, answer}], es: [{question, answer}] };  // 6-8 each
  relatedLinks: RelatedLink[];
  sources: MedicaidSource[];          // MINIMUM 3 .gov URLs (FANOUT §3.6)
}
```

### `householdSizeTable` shape — the FANOUT §3.3 mandatory artifact

Per FANOUT §3.3, every income-gating page MUST have a 9-row household-size table. This template fans the table across THREE population columns because Medicaid income gates differ across populations within the same state — adults qualify at one threshold (often very low in non-expansion states), children at a higher threshold, pregnant women at the highest.

```ts
householdSizeTable: {
  year: 2026,
  caption: { en, es },         // describes column derivation (% FPL anchors)
  footnote: { en, es },        // state-specific gotchas, rounding notes
  source: string,              // citation
  rows: [
    { size: 1, label, annualIncomeAdult, annualIncomeChild, annualIncomePregnant, monthlyIncomeAdult, monthlyIncomeChild, monthlyIncomePregnant, fplPercentageAdult, fplPercentageChild, fplPercentagePregnant },
    { size: 2, ... },
    ...
    { size: 8, ... },
    { size: 0, label: "Each additional person", ... }   // sentinel row — sentinel value 0
  ]
}
```

Rendered as a 7-column table: Household size | Adults annual | Adults monthly | Children annual | Children monthly | Pregnancy annual | Pregnancy monthly. Use `0` for any cell where the population isn't covered (renders as "—").

---

## Page component layout

The dynamic route renders, in order:

1. **Article header** (warm-texture banner) — category tag, last-updated date, reading time, byline, H1, subhero
2. **Quick Answer** blockquote — state + year + program-brand anchored, `data-speakable`
3. **Drop-cap intro paragraphs** (BlogDropCap)
4. **H2: `<programBrandFullName>` income limits by household size (year)** — the mandatory FANOUT §3.3 table
5. **H2: Eligibility requirements (non-income)** — citizenship, residency, asset tests, household composition
6. **H2: What income counts** — included / excluded with H3 sub-headings (MAGI rules)
7. **Mid-article ScreenerCTA** (variant=inline)
8. **H2: How to apply** — numbered steps, portal URL link, documents needed, processing timeline, common denial reasons
9. **H2: CHIP cross-reference** — for kids whose family income exceeds Medicaid limit
10. **H2: Medicare Savings Programs cross-reference** — for elderly low-income
11. **H2: FAQs** (FAQPage schema)
12. **End ScreenerCTA**
13. **Related links** + **Sources** footer

---

## Required FANOUT elements per page (validator hooks)

| FANOUT § | Requirement | How enforced |
|---|---|---|
| §3.1 year markers | "2026" must appear in title, hero, table caption, FAQ answers | `year` field + writer prompt |
| §3.2 state-context-everywhere | State name + state-named program brand throughout body | `programBrand` + `stateName` schema fields |
| §3.3 household-size table | 9-row table (sizes 1-8 + each-additional) | Schema requires `householdSizeTable.rows.length >= 9` |
| §3.4 how-to-apply | Numbered steps + .gov URL + documents-needed + denial reasons | `applicationProcess` block (all sub-fields required) |
| §3.6 source narrowing | Min 3 .gov URLs (medicaid.gov, state agency, aspe.hhs.gov) | `sources[]` with .gov filter check |
| §3.7 named-program lookup | Brand + canonical generic both in body | `programBrand` field; writer instructed to use both |
| §3.8 eligibility entailment | "Income limits" + "Eligibility requirements" + "Do I qualify" H2 phrasings | Page component hardcodes these H2s |
| §3.10 table/chart phrasing | Use "guidelines" / "by household size" in table captions | Page component caption hardcodes "income guidelines by household size" |
| §4.4 state-Medicaid Q&A recipe | Eligibility income table + state brand + numbered steps + denial reasons | All required by `MedicaidIncomeLimitsState` interface |

---

## Slug naming convention

- Lowercase state name, hyphen-separated multiword: `texas`, `california`, `new-york`, `north-carolina`, `west-virginia`
- DC = `dc` (not `district-of-columbia`)
- NO Puerto Rico or other territories — Medicaid in PR runs on a federal block-grant with completely different eligibility math; out of scope
- Filename matches slug exactly: `content/data/medicaid-income-limits/<slug>.json`

The loader validates `parsed.slug === filename slug` and overwrites if mismatched (defensive, mirrors ma-state pattern).

---

## Schema.org payload

The page emits 5 schema.org nodes total:

1. **MedicalWebPage** — page-level. `audience: "Patient"`, `medicalSpecialty: "PublicHealth"`, `about: "<programBrand> (<state> Medicaid)"`. Authored by `COVEREDUSA_AUTHOR`.
2. **BreadcrumbList** — Home > Medicaid Income Limits > `<State>`
3. **FAQPage** — 6-8 FAQs per locale
4. **GovernmentService** — signals to AI engines that this is a real government benefits program. `provider: GovernmentOrganization`, `areaServed: State`, `audience: Audience`. Includes brand `alternateName` (Medi-Cal / AHCCCS / etc.) when applicable.
5. **Dataset** — separate `<DatasetSchema>` component. Year-anchored data citation surface.

All non-Dataset nodes are merged into one `@graph` via `buildSchemaGraph()` so the JSON-LD stays single-script.

---

## Test page (Texas) — what's verified

- Production build (`npm run build`) succeeds, both `/en/medicaid-income-limits/texas` and `/es/medicaid-income-limits/texas` prerender
- Dev-server `curl` returns HTTP 200 with ~265 KB of HTML
- 5 schema.org node types render (MedicalWebPage, BreadcrumbList, FAQPage, GovernmentService, Dataset) and parse as valid JSON
- Texas Medicaid mentioned 156× in body content
- yourtexasbenefits.com link rendered with proper portal callout
- 6 sources, 4 of which are .gov (HHS ASPE, HHSC, yourtexasbenefits.com, medicaid.gov)
- Sitemap auto-includes `/en/medicaid-income-limits/texas` + `/es` alternate
- National lighthouse `/medicaid-income-limits` continues to work unchanged

---

## What's NOT done (writer/verifier scope)

The writer agent (`coveredusa-track-d-writer.md`) and verifier agent (`coveredusa-track-d-verifier.md`) are out of scope for this infra ticket. They're being built by a parallel agent. Once those land, the workflow per state is:

1. Writer agent generates the state JSON (Arizona is the planned 2nd test page)
2. Verifier agent runs structural + numeric checks, auto-fixes drift
3. File saved to `content/data/medicaid-income-limits/<slug>.json`
4. Master Backlog row Status flips to Ready
5. Daily drip-publish cron (Phase 1 of BUILD_PLAN) ships it at 2am UTC
6. IndexNow submission auto-pings Bing for the new URL

The infrastructure here makes step 3 valid: drop a JSON file in the directory and the page goes live with full schema.org markup, sitemap entry, and ISR rendering — no code change required.
