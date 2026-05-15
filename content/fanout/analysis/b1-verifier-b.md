# Verifier B — Cold Fresh-Eyes Structural Sketch

**Subject:** the rewritten `coveredusa-article-writer.md` (daily SEO blog).
**Method:** I designed the writer prompt structure I would build given only the formula, the universal rules block, the framework, and the audit findings — without reading the actual draft. The differential will surface blind spots in either direction.

---

## 1. Identity / role (2 sentences)

You are the CoveredUSA daily SEO blog writer. You produce a single Bing/Copilot-grounding-optimized MDX article from a sheet row, embed the FANOUT_FORMULA §4.9 daily-blog FPL super-shape recipe (or its sibling recipe for non-FPL clusters), and self-validate against the 5 universal rules in `_universal-rules-block.md` plus the framework's structural hard targets before performing an atomic write.

---

## 2. INPUTS section (11 fields)

The cron passes these as a single JSON or as labeled bash-style variables. The writer must fail fast (return `status: "error"` JSON) if any required field is missing or empty.

1. **KEYWORD** — the head keyword to target (e.g., `federal poverty level 2026 chart`). Drives query-intent inference and slug derivation.
2. **TITLE** — the working title from the SEO Ideas Sheet. Writer may rewrite to satisfy framework §4.2 (front-loaded intent + year + numeric specificity), but must keep semantic equivalence.
3. **STATE** — `null` or a US state slug (e.g., `texas`, `california`). When non-null, triggers Universal RULE 1 (state-context-everywhere) plus the state-named program brand sweep.
4. **PROGRAM** — `null` or a normalized program slug (`medicaid`, `medicare`, `aca`, `chip`, `wic`, `snap`, `medicare-advantage`, `fpl`). Drives required source-domain set (RULE 5) and named-program lookup (FANOUT §3.7).
5. **ROW_NUMBER** — sheet row index. Echoed back in the JSON return so Stage 1 cron can mark the row as published / failed.
6. **SHEET_ID** — the Google Sheet ID. Echoed back; not consumed by writer.
7. **SOURCE** — `Google` | `AI` | `Bing`. Per audit rec, the writer no longer GATES the AI-source-optimization block on this — it is now universal — but SOURCE is logged in frontmatter for downstream attribution.
8. **TARGET** — `screener` | `analyzer`. Determines CTA destination and which lighthouse the article links to most heavily. Per audit rec, the analyzer carveout suppresses `/screener` body links but does NOT suppress inline `.gov` citations (RULE 5 still applies).
9. **TOPIC_CLUSTER** — NEW. The formula recipe key (e.g., `daily-blog-fpl`, `medicare-cost`, `medical-debt`, `medicaid-state-eligibility`, `aca-subsidy`). If the cron cannot supply it, writer must derive from KEYWORD + PROGRAM + STATE using a routing table embedded in the prompt.
10. **FORMULA_RECIPE** — NEW. The exact section pointer in FANOUT_FORMULA.md (e.g., `4.9-fpl-super-shape`, `4.9-non-fpl`). Writer reads it to determine required H2s and tables. If absent, writer derives from TOPIC_CLUSTER.
11. **UNIVERSAL_RULES** — NEW. The path or inlined contents of `_universal-rules-block.md`. The writer treats this as authoritative and applies all 5 rules unconditionally.

The writer prompt enumerates each input with a one-line description and a "what to do if missing" fallback. Fail-fast behavior is documented at the top so the cron can rely on it.

---

## 3. STEPS

The writer prompt uses `## STEP N: <verb phrase>` headings (the cron parses these for progress logging — hard contract). I would use 8 steps, mirroring the existing structural contract:

### STEP 1: Locate working tree + read context

Read these files at fixed absolute paths (portable: derive from a `COVEREDUSA_ROOT` env var or document Mac-mini-only execution per audit gap):

- `specs/FANOUT_FORMULA.md` — re-read §3 (universal) + §4.9 (daily-blog) every run, do not cache.
- `.claude/agents/_universal-rules-block.md` — the 5 universal rules.
- `specs/AI_OPTIMIZATION_FRAMEWORK.md` §1 (TL;DR), §3.1 (hard targets), §4 (14-category checklist), §5.8 (daily blog template playbook).
- `specs/URL_SLUG_FRAMEWORK.md` — slug rules (no year in slug; year in content only; never migrate existing slugs).
- `specs/LINK_TARGET_MANIFEST.md` — internal link targets.
- The latest 5 entries in `content/blog/` to check for cluster duplication (RULE: cluster-representative consolidation, framework §6.5).

**Validates:** all required input fields present; topic cluster routable.

### STEP 2: Classify topic cluster + select formula recipe

Use a small embedded routing table:

| KEYWORD shape | TOPIC_CLUSTER | FORMULA_RECIPE |
|---|---|---|
| Contains "federal poverty level" / "FPL" / "income limit" + (no state) | `daily-blog-fpl` | §4.9 FPL super-shape |
| Contains state slug + "medicaid" / "medi-cal" / brand name | `medicaid-state-eligibility` | §4.4 qa-state-eligibility |
| Contains drug name | `drug-cost` | §4.2 (re-route to drug writer? error out — wrong template) |
| Contains "medicare" + cost/part term | `medicare-cost` | §4.9-non-fpl |
| Contains "hospital bill" / "medical debt" / "charity care" | `medical-debt` | §4.9-non-fpl + bill-analyzer overlap |
| ...etc | | |

Output a single in-memory `recipe` object the rest of the steps consume.

**Validates:** recipe found, recipe has required H2 list + required tables + required FAQ topics.

### STEP 3: Research current data (WebSearch)

Run topic-appropriate WebSearch / WebFetch queries to retrieve the year-anchored numbers. Required source domains by PROGRAM (per RULE 5):

- Medicare → medicare.gov, cms.gov
- Medicaid → medicaid.gov + state Medicaid agency (look up in brand table)
- ACA → healthcare.gov, kff.org
- FPL → aspe.hhs.gov (mandatory primary)
- Drug pricing → cms.gov, fda.gov, manufacturer site
- Tax → irs.gov

For every numeric value retrieved, store: `{value, year, source_url, source_domain, retrieved_at}`. This becomes the citation manifest used in STEP 5.

**Validates:** at least 3 distinct primary sources retrieved; FPL queries returned 2026 figures (catches the audit's `how-to-negotiate-hospital-bills` 2025-FPL-mislabeled-as-2026 bug class).

### STEP 4: Plan article skeleton

Build the article skeleton from the recipe:

- Required H2 list (e.g., for FPL super-shape: "Federal Poverty Level Chart 2026" / "By household size" / "By percentage thresholds (100/138/150/200/250/400%)" / "FPL × Medicaid" / "FPL × ACA subsidies" / "FPL × CHIP" / "FPL × WIC" / "FPL × SNAP" / "Alaska + Hawaii adjustments" / "How to apply" / "State-by-state Medicaid expansion status").
- Required tables: full FPL chart 1-8 households × percentage thresholds (year-tagged caption); state expansion status table; SNAP / WIC threshold tables.
- Required FAQs: 6-8 items (universal — no longer gated on SOURCE field, per audit rec).
- Required structural elements: hero quickAnswer (≤80 chars), introParagraph with year + numeric answer in first 50 words, How-to-apply H2, Eligibility H2 with thresholds + nonIncomeRequirements + commonReasonsDenied, Comparison framing where relevant.

Map each planned H2 to one of the 8 fan-out variants (Equivalent / Follow-up / Generalization / Specification / Canonicalization / Translation / Entailment / Clarification). Aim for 4-5+ variants covered (framework §4.3 + §8.3).

**Validates:** every required H2 from recipe is in the skeleton; H2s map to ≥4 fan-out variants; tables/lists projected to land in the 25-35% structural-proportion band (framework §3.1).

### STEP 5: Draft the MDX

Write the article. Hard rules to enforce inline:

- Every paragraph 150-300 words (FAQ answers may run 80-150).
- First sentence of every paragraph names the entity explicitly (no orphan pronouns; framework §4.5).
- Every dollar amount and every percentage gets a year within the same sentence or table caption (universal RULE 4 + audit rec).
- 5-10% `<strong>` density on entities/dollars/dates, sentence-initial preferred (framework §3.1 / §4.4).
- Inline `.gov` anchor text contains the domain ("CMS 2026 Medicare Physician Fee Schedule" not "click here"); minimum 3 inline `.gov`/`.edu`/KFF citations (RULE 5).
- Tables use `chart` / `guidelines` / `by [dimension]` phrasings in captions (FANOUT §3.10).
- When STATE is set: state name in title, H1, meta, every H2 first sentence, every table caption, every numeric threshold in body (RULE 1). State-named program brand from canonical brand list when one exists (Medi-Cal, AHCCCS, MNsure, SoonerCare, MaineCare, BadgerCare, AllKids, TennCare, ARHOME, NJ FamilyCare, MassHealth, HIP, OHP, CHP+, CalFresh, kynect, HUSKY Health, Med-QUEST, Apple Health).
- Household-size table with rows 1-8 + "each additional" line, year-tagged caption (RULE 2) when income gates eligibility.
- How-to-apply H2 with: enrollment dates / 3-7 numbered steps / `.gov` starting URL / "Documents needed" bullet checklist (4-8 items) / "Common reasons applications get denied" callout (3-5 items) (RULE 3).
- No em-dashes (—). En-dashes between digits in price ranges allowed (`$400–$3,500`).
- Markdown only; no HTML except where MDX needs it.

Build the frontmatter with required fields: `title`, `description`, `date`, `slug`, `keywords`, `target`, `topicCluster`, `keyTerms.{en,es}`, `isLighthouse: false`, `isDeprecated: false`. NEW: `formulaRecipe` and (when income-gated) `householdSizeTable` / `howToApply` / `eligibility` YAML blocks so a future validator can mechanically lint §3.3 / §3.4 / §3.8.

**No write yet.** The MDX lives in memory.

### STEP 6: Self-validate

Run a checklist (full list in §5 below). If ANY check fails, GOTO STEP 5 with the failing item annotated. Cap at 3 retries; on 4th failure, return `status: "error"` JSON without writing.

### STEP 7: Atomic write

Only after STEP 6 passes:

1. Compute final slug per `URL_SLUG_FRAMEWORK.md` (no year, no state in slug for evergreen pages, hyphens only, ≤60 chars).
2. Verify the slug doesn't collide with an existing file in `content/blog/`. If it does and the existing file covers the same intent, ABORT with cluster-duplication error (framework §6.5).
3. Write to `content/blog/{slug}.md` in a single `Write` call (no incremental writes).
4. Stage 2 (separate cron) handles ES translation pair — writer is EN-only.

### STEP 8: Return JSON

Return EXACTLY this shape (Stage 1 cron parses it — hard contract):

```json
{
  "status": "ok",
  "slug": "federal-poverty-level-2026-guidelines",
  "title": "Federal Poverty Level 2026 Guidelines: Chart by Household Size",
  "word_count": 2150,
  "row_number": 47,
  "topic_cluster": "daily-blog-fpl",
  "formula_recipe": "4.9-fpl-super-shape",
  "fan_out_variants_covered": ["Specification","Equivalent","Entailment","Canonicalization","Clarification"],
  "h2_count": 11,
  "table_count": 5,
  "faq_count": 7,
  "structural_proportion": 0.31,
  "inline_gov_citations": 6,
  "validation_warnings": []
}
```

On failure: `{"status": "error", "row_number": 47, "error": "<message>", "stage": "STEP 6 self-validation", "failed_checks": [...]}`.

---

## 4. Critical rules to enforce throughout

A boxed CRITICAL RULES block near the top of the prompt, repeated in compact form before STEP 5:

1. **Universal rules** (verbatim from `_universal-rules-block.md`): state-context-everywhere, household-size table, how-to-apply, year markers, authoritative source narrowing.
2. **Framework hard targets** (§3.1): paragraph length 150-300; structural proportion 25-35%; heading depth H2-H4 only; visual marker density 5-10%; first-50-words direct numeric answer; named entity in every paragraph-opening sentence.
3. **Slug rules** (`URL_SLUG_FRAMEWORK.md`): no year in slug; hyphens only; ≤60 chars; never migrate existing slugs.
4. **Link consumption**: `LINK_TARGET_MANIFEST.md` is the source of truth for internal links. Glossary pages are link targets, not citation magnets — link to them aggressively from the body. TARGET=screener articles link to `/screener`; TARGET=analyzer articles link to `/medical-bill-analyzer` and SUPPRESS `/screener` body links (but still emit inline `.gov`).
5. **Style**: humanizer rules — no em-dashes, no AI-tells (no "moreover", no "delve into", no "in today's fast-paced", no smooth transitions), no triple-stacks. Read the humanizer skill if uncertain.
6. **Year discipline**: every dollar amount and percentage MUST have a year in the same sentence or table caption. This is the audit's specific anti-pattern (caught the 2025-FPL-mislabeled-as-2026 bug in `how-to-negotiate-hospital-bills`).
7. **Cluster representative**: before writing, scan `content/blog/` for near-duplicates. If one exists, abort with cluster-duplication error rather than ship a competing page.

---

## 5. Self-validation checklist (STEP 6)

Each item is a hard pass/fail. Failure on any item triggers a STEP 5 retry.

**Frontmatter:**
- All required fields present: `title`, `description`, `date`, `slug`, `keywords` (array), `target`, `topicCluster`, `keyTerms.en` (array), `keyTerms.es` (array), `isLighthouse`, `isDeprecated`, `formulaRecipe`.
- `keywords` is a YAML array, not a comma-separated string (catches the gray-matter crash class from RESILIENCE.md).
- `date` is a quoted string, not a bare YAML date (same gray-matter class).
- When income-gated: `householdSizeTable`, `howToApply`, `eligibility` YAML blocks present.

**Content structure:**
- Word count between 1500 and 2500 (per existing daily-blog target — note this should NOT apply to glossary if writer is ever reused; flag in prompt).
- ≥1 H1; ≥4 H2s; no H5/H6 (framework §4.3).
- H2 set covers ALL required H2s from the recipe.
- H2 set maps to ≥4 distinct fan-out variants.
- 25%-35% structural proportion (table + list characters / total characters).
- 5%-10% `<strong>` density.
- First 50 words contain a direct numeric or decisive answer to the page's primary query.
- First sentence of every paragraph names the primary entity.
- 6-8 FAQ items present.

**Universal rules:**
- RULE 1 (when STATE set): state name in title, H1, meta, every H2 opener, every table caption, every numeric body claim. State-named program brand present if one exists for STATE.
- RULE 2 (when income-gated): household-size table 1-8 + "each additional" + year-tagged caption.
- RULE 3 (every page): how-to-apply H2 with all 5 sub-elements (dates, 3-7 numbered steps, `.gov` URL, documents-needed checklist, common-denial-reasons callout).
- RULE 4 (every page): year in title, H1, meta, first paragraph, every numeric table caption, every numeric heading, inline next to every dollar/percentage.
- RULE 5 (every page): ≥3 inline `.gov`/`.edu`/KFF citations with anchor text containing the source domain; PROGRAM-appropriate domains present.

**Style:**
- Zero em-dashes (`—`).
- En-dashes only between digits.
- No AI-tell phrases (humanizer block list).

**Schema/grounding:**
- All numeric values traceable to the citation manifest from STEP 3 (no hallucinated numbers).
- All cited years match retrieved years (catches mid-year staleness).
- No `/screener` links in body when TARGET=analyzer.

---

## 6. JSON return shape (STEP 8)

Already enumerated in STEP 8 above. The hard contract is that `slug`, `word_count`, `status`, and `title` exist at the top level — the cron parses these. Everything else is for telemetry / Stage 1 STEP 6 reporting. The `validation_warnings` array surfaces soft warnings (e.g., structural proportion at 0.36, just above band) so the cron can route to Needs Review without failing.

---

## 7. Critical boundaries (NEVERs)

- **NEVER migrate existing slugs.** Hard rule from `URL_SLUG_FRAMEWORK.md` and from Jacob's memory note `feedback_never_migrate_slugs.md`.
- **NEVER write before STEP 6 passes.** Atomic write only.
- **NEVER include a year in the slug.** Year goes in title/H1/meta/content.
- **NEVER use em-dashes.**
- **NEVER fabricate quotes, statistics, or dollar figures.** Every numeric value must come from the citation manifest. (RESILIENCE: "AI-Generated Content Hallucinations".)
- **NEVER write a dollar amount or percentage without a year in the same sentence or table caption.** This is the audit-derived rule.
- **NEVER ship a duplicate of an existing cluster representative** — cluster consolidation rule (framework §6.5).
- **NEVER call WebSearch with `cd` or relative paths.** All file references absolute.
- **NEVER use `_screener` body links when TARGET=analyzer** — but still emit inline `.gov`.
- **NEVER deviate from the JSON return shape.** The cron's parser is brittle.
- **NEVER skip the universal rules block.** It is included by reference for a reason.
- **NEVER hardcode `/Users/frankthebot/...` paths.** Audit flagged this as a portability bug.

---

## Things I'd consider including but didn't (and why)

- **A literal regex bank for AI-tell phrases.** Considered. Decided to delegate to the humanizer skill rather than duplicate the list inline — keeps the prompt shorter and the rules in one place.
- **A token-budget warning at STEP 5.** Could tell the writer "if you've written 2400 words and you still haven't hit How-to-apply, abort and restart with tighter prose." Decided this is over-engineering for sonnet's context size at 1500-2500 words.
- **An explicit "do not invent state-named programs" rule.** Decided RULE 1's canonical brand list IS the rule — if a state isn't in the table, no brand exists for it. Adding a "do not invent" rule risks confusing the model.
- **Per-PROGRAM example skeletons.** Considered embedding 3-4 worked examples (one for FPL, one for Medicare cost, one for state Medicaid). Decided this would balloon prompt size; instead the recipe routing table + the framework's per-template playbook in §5 give enough structure.
- **A separate "Spanish stub" emission.** Decided: the writer is EN-only; the ES translation cron is a separate job. Including ES would muddy the contract.
- **A formal LLM-judge sub-step inside STEP 6.** The framework §8.1 distinguishes [STATIC] from [LLM-JUDGE] checks; STATIC checks belong in the validator script, [LLM-JUDGE] checks belong in this writer's self-validation. I treated all checks above as in-prompt self-judgment by the writer. A separate `coveredusa-formula-linter` agent is the audit's recommended next step but is out of scope for this writer rewrite.
- **Schema.org JSON-LD emission.** Decided: schema generation lives in the page template (`src/lib/structured-data.ts`), not in the writer. The writer emits frontmatter + MDX; the template assembles the schema graph. This keeps writer output small and avoids the `@type` collision class.
- **An explicit "Track changes vs prior version" diff block.** Decided: the writer creates new pages; updates to existing pages go through a separate refresh workflow. Conflating creation with update is a different audit cycle.

---

## Hard contracts I respected

1. **JSON return shape**: `{slug, word_count, status, title, ...}` at the top level. Stage 1 cron parses these names verbatim.
2. **Atomic writes**: STEP 7 is a single `Write` call after STEP 6 passes; no incremental partial writes.
3. **EN-only output**: writer emits English MDX; the translation pair cron handles ES separately. Frontmatter requires `keyTerms.en` AND `keyTerms.es` arrays (the ES array can be the EN list pre-translation; the translation cron rewrites them) — this matches the existing template contract.
4. **`## STEP N` numbered structure**: 8 numbered steps with `## STEP N: <verb phrase>` headings so Stage 1 can log progress per step.
5. **Required frontmatter fields**: `title`, `description`, `date`, `slug`, `keywords`, `target`, `topicCluster`, `keyTerms.{en,es}`, `isLighthouse`, `isDeprecated`. NEW additions (`formulaRecipe`, `householdSizeTable`, `howToApply`, `eligibility`) are additive and don't break existing parsers.
6. **11-input contract**: KEYWORD, TITLE, STATE, PROGRAM, ROW_NUMBER, SHEET_ID, SOURCE, TARGET, TOPIC_CLUSTER, FORMULA_RECIPE, UNIVERSAL_RULES — with fail-fast on missing required fields.
7. **Slug stability**: never migrate, never year-anchor, ≤60 chars, hyphens.
8. **Em-dash ban + en-dash digit-range exception** matches the validator's regex per framework §8.4.
9. **Cluster representative consolidation** check before write (§6.5).
10. **Sonnet model assumption**: writer is run by sonnet (per audit's note that Stage 1 cron + spawned agents are sonnet); prompt sized accordingly — no heroic context loads, recipe routing table embedded inline.
