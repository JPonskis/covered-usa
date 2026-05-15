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

---

## Writer + Verifier agents (this ticket)

The two agent prompts that consume the schema above and produce / validate JSON files for `/medicaid-income-limits/<state>` pages.

### Writer agent

**File:** `$HOME/clawd/.claude/agents/coveredusa-track-d-writer.md`
**Model:** sonnet, maxTurns 60, background, bypassPermissions
**Tools:** Read, Write, Edit, Bash, WebSearch, WebFetch, Glob, Grep

**Inputs (queue payload):**
- `STATE_NAME` — full state name ("Texas")
- `STATE_SLUG` — lowercase hyphenated slug ("texas")
- `STATE_ABBREVIATION` — 2-letter postal code ("TX")
- `YEAR` — defaults to 2026
- `NOTES` — optional retry / regen context (e.g., `PREVIOUS_FAILURE` block)
- `TOPIC_CLUSTER` — defaults to `medicaid-income-<state-slug>`

**Output file:** `content/data/medicaid-income-limits/<STATE_SLUG>.json`
**Atomic write:** `<slug>.tmp.json` first, rename only after all 8 GATES pass + JSON parses.

**Pipeline:**
1. STEP 0 — Load context (universal-rules block + FANOUT §3.3 + §3.7 + §4.4 + §5.1 + schema lib + 2 gold-standard reference JSONs)
2. STEP 1 — Pre-flight existence check + atomic-write setup
3. STEP 2 — Research state (federal anchors + state-specific facts: expansion status, brand, adult/pregnant/child/disabled limits, application URL, MAGI rules)
4. STEP 3 — Plan JSON structure per §4.4 recipe (≥6 detailSections, 9-row householdSizeTable, full applicationWorkflow, incomeSourceRules, eligibilityCategories, crossReferences)
5. STEP 4 — CTA target = `screener` (Track D constant; never `analyzer`)
6. STEP 5 — Write body content (style + linking + universal-rule enforcement)
7. STEP 6 — 8 GATES (HARD REJECTS, "STOP. Read this twice." framing)
8. STEP 7 — Compute schema.org JSON-LD (MedicalWebPage + GovernmentService + FAQPage)
9. STEP 8 — Atomic save + return JSON result

**8 GATES enforced (all HARD REJECTS):**
- **GATE A** — slug must NOT contain a year (regex `\b(19|20)\d{2}\b`)
- **GATE B** — `householdSizeTable.rows.length === 9` (sizes 1-8 + "Each additional"); per-row 138% × 2026 FPL math sanity (±$50 tolerance)
- **GATE C** — ≥3 inline outbound `.gov` / `.edu` / `kff.org` citations (medicaid.gov + state agency .gov + ASPE + KFF preferred set)
- **GATE D** — zero `--` / `—` / `–` anywhere (verifier auto-fixes)
- **GATE E** — state-named program brand (Medi-Cal, AHCCCS, SoonerCare, ARHOME, etc.) MUST appear in title + H1 + meta + body if state is in the 19-state brand list; mark `n/a` for non-brand states
- **GATE F** — `applicationWorkflow` has all 4 sub-fields: `numberedSteps[3-7]` + state-specific `govStartingUrl` (NOT generic medicaid.gov) + `documentsNeeded[4-8]` + `commonDenialReasons[3-5]`
- **GATE G** — `incomeSourceRules` field with `counted[≥6]` + `notCounted[≥4]` + `stateAdjustments`; PLUS dedicated detailSection covering it
- **GATE H** — CHIP + Medicare Savings Programs cross-references (`crossReferences` field with ≥2 entries) + body mentions of both

**Expected JSON return shape:**

```json
{
  "status": "complete",
  "slug": "<state-slug>",
  "title": "<the title>",
  "file_path": "content/data/medicaid-income-limits/<slug>.json",
  "gates_passed": ["a","b","c","d","e","f","g","h"],
  "gates_failed": [],
  "warnings": [],
  "word_count": 2450,
  "citations_count": 6,
  "household_table_rows": 9,
  "state_brand_used": "Medi-Cal" | null,
  "expansion_status": "expanded" | "non-expanded" | "partial",
  "topicCluster": "medicaid-income-<state-slug>",
  "keyTerms": {"en": [...], "es": [...]},
  "isLighthouse": false,
  "isDeprecated": false,
  "gapsFlagged": []
}
```

Error / rejection shapes documented in agent's STEP 8.

### Verifier agent

**File:** `$HOME/clawd/.claude/agents/coveredusa-track-d-verifier.md`
**Model:** sonnet, maxTurns 60, background, bypassPermissions
**Tools:** Read, Edit, WebSearch, WebFetch, Bash, Grep

**Inputs:** path to a `.json` file under `content/data/medicaid-income-limits/`

**Editor-mode pattern (per 2026-05-15 rollout):**
- The held bucket is gone. Two outcomes only: `complete` (ships) OR `regenerate` (writer re-spawns with `PREVIOUS_FAILURE` + `ATTEMPT_NUMBER:N+1`).
- Numeric drift → narrow auto-fix Edits in place
- GATE D (`--`/`—`/`–`) → auto-fix mandatory (replace_all OK)
- GATE A (slug-year) → auto-fix (strip year + rename file)
- Brand field empty when state has brand → auto-fix (populate field)
- Generic medicaid.gov in `govStartingUrl` → auto-fix with state portal lookup (Category E table)
- MEDIUM+ structural drift (missing detailSection, fewer than 9 household rows, missing applicationWorkflow sub-field, brand-throughout body gap, missing incomeSourceRules, missing crossReferences) → signal regen via `regenerate_sections`
- 1-retry cap; after that ships with flag

**Pipeline:**
1. STEP 0 — Pre-flight (Read + JSON parse + schema check + brand cross-ref load)
2. STEP 1A — Internal consistency pre-check (138% × FPL math, brand consistency, expansion status, central-claim agreement across quickAnswer/hero/meta)
3. STEP 1B — High-risk external claims (Categories A-J: federal anchors, state thresholds, brand assignment, expansion status, application URL, sources, locked enums, statute references, hrefs, style)
4. STEP 1C — 8 structural GATES (auto-fix where surgical, regen-signal otherwise)
5. STEP 2 — Per-claim primary-source verification (ASPE / KFF / state agency / medicaid.gov)
6. STEP 3 — Edit-scope rules (narrow `old_string`, grep-then-edit for repeated values, JSON-valid after each edit)
7. STEP 4 — Force-flag rule (central-claim corrections force `flagged` even after edit)
8. STEP 5 — Special cases (brand-wrong-state → regen; income off >10% → auto-fix; expansion wrong → auto-fix; URL generic → auto-fix; turn-budget → flagged)
9. STEP 6 — Return result

**Expected JSON return shape:**

```json
{
  "status": "complete" | "regenerate" | "held",
  "slug": "<slug>",
  "verifier_pass": true | false,
  "auto_fixes_applied": [{"gate": "d", "type": "em-dash", "count": 3}, ...],
  "gates_failed": [{"gate": "b", "reason": "householdSizeTable has 7 rows, expected 9"}, ...],
  "regenerate_sections": ["<section names if any>"],
  "fact_corrections": [{"field": "...", "wrong": "$15,000", "correct": "$15,650", "source": "aspe.hhs.gov"}],
  "warnings": [{"claim": "...", "severity": "LOW"}],
  "gates": {"a": "pass", "b": "pass", "c": "pass", "d": "auto-fixed", "e": "n/a" | "pass" | "fail", "f": "pass", "g": "pass", "h": "pass"},
  "claims_checked": 18,
  "claims_corrected": 0,
  "claims_flagged": 0,
  "telegram_alert": "..."
}
```

Status definitions:
- `complete` — every check passed (or fixes applied surgically); article ships
- `regenerate` — at least one HIGH structural gate failed; cron re-spawns writer; do NOT ship
- `held` — catastrophic failure (invalid JSON, can't read); telegram-alert + manual intervention

### Invocation pattern

**Direct (Jacob writes a state by hand):**
```
Use the Task tool with subagent_type "coveredusa-track-d-writer" and a prompt like:
"STATE_NAME: Texas
STATE_SLUG: texas
STATE_ABBREVIATION: TX
YEAR: 2026"
```

Then verify:
```
Use the Task tool with subagent_type "coveredusa-track-d-verifier" and the file path:
"$HOME/clawd/projects/covered-usa/content/data/medicaid-income-limits/texas.json"
```

**Cron (bulk-gen pipeline):**
- Stage 1 (writer): bulk-gen cron reads Master Backlog rows where `template=track-d` AND `Status=Queued`, spawns N parallel writers (N = throttle), each produces one JSON
- Stage 1.5 (verifier): cron spawns verifier per produced JSON; if `regenerate`, re-spawns writer once with `PREVIOUS_FAILURE` + `ATTEMPT_NUMBER:2`; if regen STILL fails, ships with flag
- Stage 2 (drip-publish): daily cron at 2am UTC commits all `Ready`-status files, pushes to Vercel, submits IndexNow, marks rows `Published`

### Coverage targets

51 Track D pages total = 50 states + DC (the FANOUT §5.1 highest-ROI permutation). Per-page word target: 2,000-2,800 words.

Schema-fanout dependencies (all encoded in agent prompts, no schema-level deps unmet):
- `MedicaidIncomeLimitsState` interface (parallel template-code agent — verifier falls back to MA-state shape if not yet shipped)
- `_universal-rules-block.md` 19-state brand list (already exists)
- 2026 ASPE FPL constants (memorized in prompts; verifier cross-checks against aspe.hhs.gov)

### Backups

Both agent files are net-new — no `.bak.md` to preserve. Cost watch: each writer + verifier pair on Sonnet ≈ $0.50-$1.50 per state at current rates. Full 51-state run: ~$25-75 in Claude credits (writer + verifier combined). Add 1-retry buffer for regen: budget $40-100 total.
