# Current State Audit — CoveredUSA

**Version:** 1.0 (pending review)
**Date:** 2026-05-14
**Anchored to commit:** covered-usa@2612ee7
**Framework:** specs/AI_OPTIMIZATION_FRAMEWORK.md v1.1
**Rubric:** specs/AUDIT_RUBRIC.md
**Audited via:** 10 parallel audit agents (7 templates + daily blog + infrastructure + queue)

---

## 0. How to read this doc

This audit scores the current CoveredUSA implementation against the rules in `specs/AI_OPTIMIZATION_FRAMEWORK.md`. It describes what is, not what to do — the prioritized fix list lives in `specs/REFACTOR_PRIORITY.md` (written next).

### What CoveredUSA is optimizing for

CoveredUSA targets **Bing AI search citation eligibility** (primary) and the cascade benefits this provides — Microsoft Copilot (which grounds in Bing), ChatGPT Search (87% of citations match Bing top-organic per Seer), and adjacent surfaces (Perplexity, Claude.ai). Google AI Overviews is a happy side effect but not the primary target. The framework is built around Bing's grounding-index mechanics, not Google's.

### Quick term-key

Domain-specific terms used throughout. Skip if you've read the framework recently.

- **Fan-out** — when a user prompt enters Copilot, the LLM decomposes it into 8 query variants (Equivalent, Follow-up, Generalization, Specification, Canonicalization, Translation, Entailment, Clarification). H2s should map to these variants.
- **Cluster representative** — when near-duplicate URLs exist, Bing's grounding index groups them and picks one to represent the cluster. Others are discarded.
- **Citation absorption vs selection** — selection = retrieval pulls a URL into context; absorption = the LLM actually reuses text from that URL in the generated answer. Visible citations come from absorption.
- **Lighthouse page** — a hand-engineered authoritative page that anchors a cluster of supporting "spoke" pages.
- **YMYL** — "Your Money or Your Life" — Google/Bing classification for health/finance/legal content with elevated trust requirements.
- **Structural proportion (`F_d`)** — combined word count of tables + lists ÷ total page word count. Framework target 25-35% per arXiv 2603.29979.
- **`<strong>` density (`E_d`)** — `<strong>`-wrapped words ÷ total body words. Framework target 5-10%.
- **`@graph`** — schema.org pattern that wraps multiple JSON-LD nodes into one connected graph via `@id` references. Recommended over stacked separate `<script>` tags.
- **`MOOP`** — Maximum Out-of-Pocket. Annual cost cap on Medicare Advantage plans. Framework anchor: $9,250 for 2026.
- **`IRA`** — Inflation Reduction Act, signed August 16, 2022. Provides Medicare Part D OOP cap ($2,100 for 2026) and Round 1 drug-pricing negotiations.

### Severity tags inherit from the framework's evidence grade:
- **CRITICAL** — framework rule is `[CONFIRMED]` or `[CONFIRMED PRIMARY]`
- **MAJOR** — rule is `[LIKELY]` or `[CONFIRMED SECONDARY]`
- **MINOR** — rule is `[INFERRED]`

### Effort tags:
- **S** — Writer-agent prompt edit only
- **M** — Writer + validator + selective re-run of existing data files
- **L** — New infrastructure, new template, or template-wide regeneration

### What this audit is NOT
1. Not a refactor plan — that's `REFACTOR_PRIORITY.md` (next).
2. Not a quality judgment on existing pages — many are very good. Audit measures delta from framework, not absolute quality.
3. Not a directive to migrate existing slugs — framework §4.1 is explicit: never migrate existing slugs regardless of audit findings.

### Site scope at audit time
- 20 live template pages (3 procedure + 3 drug + 3 qa + 3 glossary + 3 event + 2 persona + 3 MA-state) + 36 daily blog posts + 15 hardcoded reference pages = 71 live pages
- 7 dynamic templates (cost, drug, qa, glossary, event, for, medicare-advantage) + 1 blog pipeline
- 420 sheet rows queued
- Anchored to commit covered-usa@2612ee7, framework v1.1

---

## 1. TL;DR — The Headline Numbers

### Top 5 fixes by leverage

If you only do five things, do these — they each affect 6+ templates simultaneously and represent the highest single-action ROI in the audit:

1. **Schema `@graph` refactor in `structured-data.ts`** — every template emits 3-5 separate `<script>` tags; consolidate into one `@graph` with `@id` linking. One library change cascades to all 8 templates. **M effort, MAJOR severity, 8/8 templates affected.**
2. **`ReferenceTable.tsx` caption fix** — currently renders as `<div>` (CSS workaround); change to real `<caption>` element. One component change cascades to 6 templates. **S effort, MAJOR severity.**
3. **Extend IndexNow ping to fire on `content/data/*/*.json` edits** — currently only fires on new blog publishes (Stage 2 grep matches `date == today`). One script change covers all template edits. **M effort, MAJOR severity, 8/8 templates affected.**
4. **Add validator content-quality lint** to every `scripts/validate-*.js` — em-dash regex, paragraph word-count, char-caps on title/description, structural proportion. No validator currently catches these; every writer-agent style rule has zero enforcement. **M effort per validator × 7 validators, MAJOR severity.**
5. **Add `Bing-AISearchCrawler` + `Claude-User` to `robots.ts`** — 2-line additions, sitewide impact. **S effort, MAJOR severity.**



**Overall scorecard across 8 templates + blog + infrastructure (rough averages):**

| Severity | Per-template count (typical) | Sitewide universal gaps |
|---|---|---|
| CRITICAL gaps | 1–2 per template | Paragraph length (universal) |
| MAJOR gaps | 6–8 per template | 12 sitewide patterns (see §2) |
| MINOR gaps | 8–12 per template | Internal-link density, year markers, hedging |

**Templates ranked by audit-pass density** (best to worst):

| Rank | Template | Bright spots | Worst gap |
|---|---|---|---|
| 1 | State Medicare Advantage (`/medicare-advantage/[state]`) | Pronoun discipline PASS; structural % in target; em-dash discipline clean; best Spanish translation; 0 L-effort gaps | Paragraph length (50-90 words) |
| 2 | Drug (`/drug/[drug]`) | 0 em-dashes anywhere; Dataset schema emitted; anchor facts validated hard | Structural % 14-17% (worst of any template); `iraNegotiation` defined but never rendered |
| 3 | Procedure (`/cost/[procedure]`) | Reproduces Section 13 MRI scorecard exactly; Dataset schema emitted; good fan-out coverage | Em-dash in ALL 3 meta titles; mechanical "The difference shows up" scaffolding |
| 4 | Event (`/event/[event]`) | HowTo schema is the strongest schema work in any template; deadline anchoring with day counts | T26 title 80 chars (over cap); T26 has 11 em-dashes in body |
| 5 | Persona (`/for/[persona]`) | Better Section 5.6 coverage on self-employed | gig-workers has 0 mentions of "freelancer", "contractor", "rideshare driver" — kills Clarification fan-out |
| 6 | Q&A (`/qa/[question]`) | Clean meta length, good source-domain hygiene | 0 of 13 H2s phrased as questions (Q&A is THE template where this matters); FAQ length spec conflict (writer 40-100 vs framework 80-150) |
| 7 | Glossary (`/glossary/[term]`) | Some genuine PASS items (canonical terminology, hreflang) | MAGI structural % 14.4%; sub-type field missing (no monetary/concept distinction); em-dashes in source names |
| 8 | Daily SEO Blog (`/blog/[slug]`) | Schema auto-extraction (FAQPage, HowTo), correct internal links | 33 of 37 posts have ZERO external URLs; 100% of paragraphs under 100 words; no hreflang in `generateMetadata` |

**Two infrastructure-layer findings carry the most leverage:**
1. **Schema emission is stacked `<script>` tags, not `@graph`** — affects every page on the site. Single fix in `structured-data.ts` cascades to all 8 templates + blog.
2. **`ReferenceTable.tsx` renders caption as a `<div>` not a real `<caption>` element** — affects every template using ReferenceTable (procedures, drugs, glossary, event, persona, MA state). One-line CSS fix.

---

## 2. Universal Patterns (Sitewide Gaps)

These apply across every template audited. Fixing them in shared infrastructure (writer-agent prompts, validators, `structured-data.ts`, `ReferenceTable.tsx`, `robots.ts`, Stage 2 cron) is the highest leverage work.

| # | Universal pattern | Severity | Effort | Confirmed in N templates |
|---|---|---|---|---|
| 1 | **Body paragraphs are 30-90 words; target is 150-300** | CRITICAL | L (writer prompt + validator + regen of all ~25 existing data files + 36 blog posts) | 8/8 |
| 2 | **`<strong>` density is 0-1.1%; target is 5-10%** | MAJOR | M (schema field or render-time injector + writer prompt + regen) | 8/8 |
| 3 | **Schemas emit as 3-5 separate `<script>` blocks, not `@graph`** | MAJOR | M (`structured-data.ts` refactor — one fix, cascades sitewide) | 8/8 |
| 4 | **No inline body links to lighthouses** — all internal links concentrated in foot `relatedLinks` block | MINOR | S (writer prompt) + M (regen) | 8/8 |
| 5 | **No bracketed `[1] [2]` inline citations** — sources only listed at page foot | MINOR | M (writer prompt + structural schema + regen) | 8/8 |
| 6 | **No credentialed medical reviewer** — `reviewedBy` falls back to Organization site-wide | MAJOR | L (source credentialed reviewer + populate constant) | 8/8 |
| 7 | **IndexNow only fires on publish, not on edits** — Stage 2 cron grep matches `date == today` only | MAJOR | M (extend `coveredusa-indexnow-submit.js` to scan `content/data/*/*.json` for `lastUpdated == today`) | 8/8 |
| 8 | **`Bing-AISearchCrawler` missing from `robots.ts`** | MAJOR | S (1-line addition) | 8/8 |
| 9 | **`Claude-User` missing from `robots.ts`** | MINOR | S (1-line addition) | 8/8 |
| 10 | **`ReferenceTable.tsx` renders caption as `<div>`, not `<caption>` element** | MAJOR | S (component CSS fix) | 6/6 (every template using ReferenceTable) |
| 11 | **Validators don't enforce style rules** — no em-dash check on JSON string fields, no paragraph length, no meta character caps | MAJOR | M (validator additions per template) | 7/7 |
| 12 | **Spanish source URLs not localized** — sources cite English `.gov` URLs even when `/es/` variants exist | MINOR | S (writer prompt + verifier check) | 7/7 |
| 13 | **No `sameAs` on `MedicalAuthor`** — `COVEREDUSA_AUTHOR` has `url` but no LinkedIn/ORCID | MINOR | S (1-line schema addition) | 8/8 |
| 14 | **Dataset schema missing on numeric tables** (procedure + drug + MA-state DO emit it; qa + glossary + event + persona + blog DO NOT) | MAJOR | M | 5/8 |
| 15 | **FAQ-answer length spec conflict** — all 7 writer agents say "40-100 words"; framework Section 4.5 says "80-150 words". Existing FAQ content lives in writer's range (37-71 words). | MAJOR | S (update all 7 writer agents) | 7/7 writer agents |
| 16 | **No maintenance cron** — framework specifies monthly numeric refresh; no automation exists | MINOR | L (build new cron) | infrastructure |

Of these 15 patterns, **only #1, #2, #3, and #11 are direct retrieval/citation mechanism issues** (framework Sections 3.1 and 4.5/4.6). The other 11 are operational, observability, or trust-signal gaps.

---

## 3. Cross-Cutting Decisions Surfaced for Jacob

Four strategic decisions cleanly surface from the audit. None can be resolved without your input.

**3.1 — `<strong>` density mechanism.** No page on the site hits the framework's 5-10% `<strong>` density target. Reason: the JSON templates render paragraphs as plain text — `<p>{text}</p>` — so even if the writer agent put `**bold**` markers in the JSON, nothing would render them. (Some templates do emit `<strong>` for fixed UI labels — MA-state uses it for "Quick Answer:" prefix labels, importantDates labels, stateExtras labels — but those don't count toward body-content density.)

Three viable mechanisms, each with a real trade-off:

| Approach | Pros | Cons |
|---|---|---|
| **(a) Markdown-rich paragraphs** — JSON paragraphs accept `**bold**`, template renders via a markdown-to-React converter | Writer agent picks emphasis intentionally; honors framework's sentence-initial position preference | Schema change; need sanitizer; regen all data files |
| **(b) `boldedTerms` field** — separate `LocalizedStringArray` per page; renderer wraps matches in `<strong>` on first occurrence per paragraph | Surgical; preserves prose data integrity; honors first-occurrence positional preference | Writer must maintain a parallel list; misses some entities |
| **(c) Render-time entity highlighter** — template wraps known entities (Medicare, $X, dates, IRA, MAGI, etc.) in `<strong>` automatically on first occurrence per paragraph | No data changes; works for all existing data | **Sacrifices sentence-initial position preference** — auto-bolding wraps every occurrence regardless of where in the sentence it appears, which the framework explicitly says is heuristic only. Density gets there; positional weight doesn't. |

**Recommendation: (a) markdown-rich paragraphs.** Yes it requires the data-file regeneration we're already doing for paragraph length (Universal Pattern #1 is L-effort regen anyway), so the marginal cost of also adding `**bold**` markers is small. Honors the framework's positional preference, which option (c) sacrifices. Option (b) is the middle ground if (a) feels too invasive.

**3.2 — Reviewer slot strategy.** The framework's #1 YMYL trust gap, and the most strategically-stakes-bearing of these four decisions because of framework §7.1: CoveredUSA cannot enter Microsoft Copilot Health's primary allow-list (Harvard Health + NAM). Reviewer sourcing is the highest-leverage *partial* mitigation available to a non-allow-listed publisher — inline `.gov` citations + a credentialed reviewer is the closest we get to proxying allow-list trust.

Three options:

- **Source a credentialed reviewer now.** RN, MD, Licensed Health Insurance Producer. Adds a real Person to `reviewedBy` site-wide. Cost: ongoing relationship + payment.
- **Use yourself as reviewer with a state insurance broker license.** Requires Jacob to obtain the license (state-by-state, varies in time/cost).
- **Defer entirely.** Continue with Organization fallback. Accept the YMYL trust penalty.

**Recommendation: contracted reviewer (option 1).** Cheaper than licensing, faster to deploy, and the credential is what Bing/Copilot's Person schema actually wants. Defer (option 3) leaves the largest YMYL trust gap unaddressed and is the worst option given §7.1's strategic context.

**3.3 — Persona duplicates pre-consolidation.** The queue has 3 self-employed-variants and 3 gig-worker-variants (CU-011, CU-104, CU-098, CU-156, CU-220, plus a 1099-contractor row). Per Section 2.4 cluster representative mechanic, Bing **likely** deduplicates near-duplicates (Section 2.4 is graded `[LIKELY]`, not `[CONFIRMED]`). Two paths:

- **Consolidate before queueing new writes.** Merge synonyms into the existing `/for/gig-workers` + `/for/self-employed` pages (already shipped). Add synonym coverage per Section 5.6. Pro: preserves URL authority on one canonical page; eliminates duplicate-write effort. Con: less coverage if Bing's cluster representative selection isn't as aggressive on persona pages as on news content.
- **Write all of them anyway.** Pro: defensive coverage if Bing's clustering shifts or if cluster representative selection favors a different synonym than the one we'd choose; provides training data variety. Con: writes ~40 hours' worth of content for unclear citation lift.

**Recommendation: consolidate (option 1).** Bing's cluster representative mechanic is graded LIKELY, but the framework's Cluster Representative Consolidation guidance in §2.4 specifically calls out persona variants as a consolidation target. Defensive coverage isn't free — every duplicate written is editorial bandwidth not spent on the higher-leverage `/bill/[topic]` template build.

**3.4 — Blog template scope.** The blog audit surfaced two architectural questions:

- **External citation backfill.** 31 of 36 existing posts have zero outbound external URLs. Two backfill strategies: (a) mechanical sweep adding citations from existing source data, (b) leave existing posts as-is and only enforce strict-mode on new posts. **Recommendation: strict-on-new + selective backfill of top-cited posts** per framework §8.2 retrofit strategy. Bulk backfilling 31 posts at once risks editorial-quality regressions; surgical retrofit of the 5-10 highest-cited posts after Bing's AI Performance Report has meaningful CoveredUSA data is framework-aligned.
- **`Dataset` + `HowTo` schema emission from markdown tables.** Standard markdown can't emit `<caption>` or Dataset schema. **Recommendation: custom MDX component (`<DataTable>`)** — cleaner authoring story, writer agent emits the component explicitly. Cost: ~1 day component build.

---

## 4. Per-Template Deltas

Each template has the universal patterns from §2. This section captures only the deltas that are unique to a template, plus per-template bright spots worth preserving.

### 4.1 Procedure Cost — `/cost/[procedure]`

Net: ~15 PASS / 5 PARTIAL / 5 FAIL. Reproduces framework §13 directional pattern.

**Deltas (beyond universal patterns):**
- ALL 3 meta titles >70 chars (71, 72, 76); ALL 3 meta descriptions >160 chars (183, 189, 193); ALL 3 contain em-dash in title (`... in 2026 — National Pricing Guide`)
- Mechanical scaffolding sentences leak across pages — *"The difference shows up..."*, *"The practical takeaway..."*, *"This guide covers..."* appear identically on all 3, all lacking the procedure entity in the opening sentence. Pattern is writer-agent template, not page-specific.
- CT-scan has em-dash in `sources[].name` field

**Bright spots:** Dataset schema emitted. MedicalProcedure schema with `estimatedCost` MonetaryAmount.

### 4.2 Drug Cost — `/drug/[drug]`

Net: ~18 PASS / 12 mixed / 8 N/A.

**Deltas:**
- ALL 3 meta descriptions >160 chars (181, 197, 203 en; metformin es is **256**)
- Structural proportion lowest of any template — Oz 17.4%, Ins 15.1%, Met 14.3%
- Metformin sources include GoodRx + Walmart — borderline competitor/aggregator
- **`iraNegotiation` block defined in `src/lib/drugs.ts` but NEVER RENDERED in route** — Round 1 IRA drugs (Eliquis, Jardiance) will silently drop Maximum Fair Price + effective date when they ship. Code bug, not content gap.

**Bright spots:** 0 em-dashes anywhere. Drug schema with `nonProprietaryName`, `alternateName`, `drugClass`. 2026 anchor facts hard-validated.

### 4.3 Q&A — `/qa/[question]`

Net: ~25 PASS / 12 PARTIAL / 13 FAIL.

**Deltas:**
- `shortAnswer` 80-char cap not enforced — vision sits at exactly 80 chars (1 word from break)
- `meta.title`/`meta.description` char caps not enforced — rehab description at exactly 160 chars
- 0 of 13 detail-section H2s phrased as questions — Q&A is THE template where natural-question H2s should dominate
- Dental opens with meta-rhetorical fluff (*"It is one of the most common questions..."*)
- DentalPlans.com cited as source — borderline aggregator

**Bright spots:** Coverage-breakdown table with status-codes. QAPage schema emitted. Strong source-domain hygiene on Vision + Rehab.

### 4.4 Glossary — `/glossary/[term]`

Net: ~30 PASS / 15 PARTIAL / 20 FAIL.

**Deltas:**
- **Sub-type field doesn't exist** — framework's monetary/concept distinction (§5.4) is unimplementable. All 3 pages treated identically.
- MAGI structural proportion 14.4% — MINOR per rubric (CRITICAL only triggers <10%). Concept entries don't have `annualLimits`/`workedExample` to anchor structure.
- MAGI meta description 172 en / **202 es**; OOP-max title.es 77 chars
- Em-dashes in `sources[].name` visible in page footer (4 on MAGI, 3 on OOP-max) — validator doesn't scan this field
- `/glossary/health-insurance-terms-explained` lighthouse hub referenced in framework §5.4 but doesn't exist as a built page

**Bright spots:** DefinedTerm schema with `inDefinedTermSet`. Canonical terminology discipline excellent.

### 4.5 Event — `/event/[event]`

Net: ~16 PASS / 12 PARTIAL / 12 FAIL.

**Deltas:**
- T26 meta title **80 chars** (over cap)
- T26 has **11 em-dashes** in body prose
- Deadline anchoring partial — day counts in hero ✓, but no specific calendar-date examples (e.g., "If you turn 65 in August 2026, your IEP runs May 1 to November 30, 2026") in hero zone; only in FAQ #1 of T65
- JOB intro opens with anecdote fluff
- T26 title lacks "2026" marker

**Bright spots:** **HowTo schema is the strongest schema work in the codebase.** 5-6 steps per page, `totalTime` set, decisive action verbs, entity-anchored step names. Use as the reference pattern for the future `/bill/[topic]` HowTo subtype.

### 4.6 Persona — `/for/[persona]`

Net: ~15 PASS / 11 PARTIAL / 13 FAIL.

**THE biggest single audit finding** — Section 5.6 synonym coverage. Framework says "aggressive persona synonym coverage in H1, H2s, and body." Actual coverage (counted via `grep -oi <term> | wc -l` on the JSON):

| Synonym | gig-workers.json | self-employed.json |
|---|---|---|
| freelancer(s) | **0** | 25 |
| contractor(s) | **0** | 1 |
| rideshare driver(s) | **0** | 0 |
| 1099 | 2 | 16 |
| self-employed | 10 | 31 |
| sole proprietor | **0** | 2 |
| independent contractor | **0** | **0** |
| consultant | n/a | 4 |

The gig-workers page — *the rideshare-platform persona* — has ZERO mentions of "freelancer", "contractor", "rideshare driver", "sole proprietor", or "independent contractor". Kills Clarification fan-out.

**Other deltas:** gig-workers description 181 chars (over cap); self-employed has 8+ body em-dashes; structural proportion 13.4%/18.0%; no persona-specific type schema beyond MedicalWebPage (no `Audience` type).

### 4.7 State Medicare Advantage — `/medicare-advantage/[state]`

Net: ~32 PASS / 9 PARTIAL / 11 FAIL — **best template scorecard ratio.**

**Deltas (the model template):**
- **Pronoun discipline (§5.7 spotlight rule) passes** — only 1 marginal exception across ~40 paragraphs. Pattern is consistent: *"California is..."*, *"Texas has..."*, *"Picking a Medicare Advantage plan in [State]..."*. Pattern holds via writer-agent gold-standard reference, NOT verifier enforcement.
- **Critical verifier gap:** the verifier does NOT check the pronoun rule. The only template passing §5.7 is one regression away from failing. **Severity: MAJOR. Effort: S** (add explicit pronoun-discipline check to `coveredusa-ma-state-verifier.md` STEP 2).
- 0 em-dashes; structural proportion IN TARGET (CA 34.6%, TX 37.5%, WY 36.2%); meta caps PASS; best Spanish translation quality of any template.
- **No `/medicare-advantage` lighthouse hub URL exists** — 51 state spokes have no cluster-representative target to link upward to.

**Bright spots:** 0 L-effort gaps; template architecture is sound.

### 4.8 Daily SEO Blog — `/blog/[slug]`

Net: ~8 PASS / 9 PARTIAL / 14 FAIL — **worst template scorecard ratio.**

**Deltas** (counts verified against `content/blog/*.md`, 36 total English posts):
- **External citation desert** — **31 of 36 posts have ZERO outbound external URLs**. Posts mention `.gov` in plain text, never hyperlink. CRITICAL violation of Rule 9.1.
- 100% of sampled body paragraphs under 100 words
- ~16 of 36 posts still being produced with year-in-slug (writer agent not updated with framework §4.1 rule)
- **9 of 36 titles >70 chars; 5 of 36 descriptions >160 chars**
- **No `hreflang` in blog `generateMetadata`** — 6 Spanish translations exist; only `canonical` set in metadata
- **Conflicting author identity:** AuthorBio component renders "CoveredUSA Editorial Team" (Organization schema); header byline renders "By Jacob Posner"; JSON-LD says Person/Jacob Posner
- IndexNow trigger broken on edits (Stage 2 uses `date == today` regex — only catches new publishes)
- `dateModified` inconsistent: articleSchema uses `lastUpdated || date`, sitemap uses `date` only
- No `<caption>` possible — standard markdown tables can't emit it

**Bright spots:** Schema `@type: ['Article', 'MedicalWebPage']` stacked combo. FAQPage auto-extracted. Internal links to correct lighthouses per program.

### 4.9 Shared Infrastructure

**Files:** `src/lib/structured-data.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `package.json`, `coveredusa-indexnow-submit.js`, Stage 2 cron.

**Critical infrastructure findings:**

1. **Schema emission is "stacked tags," not `@graph`** — every template route emits 3-5 separate `<script type="application/ld+json">` blocks, each with its own `@context`. Framework Section 4.7 requires `@graph` with `@id` linking and `mainEntityOfPage` references. Only `/medical-bill-analyzer` uses `@graph` (hand-rolled). **Fix: single `buildSchemaGraph(nodes, pageUrl)` helper in `structured-data.ts` that wraps an array of helper outputs into `@graph`, strips per-node `@context`, auto-assigns `@id` URIs, adds back-references.** Once shipped, every template's render block changes from 4 script tags to 1.

2. **IndexNow ping is publish-only, not edit-aware.** `coveredusa-indexnow-submit.js --today` only resolves URLs by scanning blog markdown frontmatter for `date: today`. Does not scan `content/data/**/*.json` for `lastUpdated == today`. Any operator edit to a procedure/drug/MA-state JSON file deploys silently without IndexNow. **Fix: extend `getTodaysUrls()` to read all `content/data/*/*.json` files and emit `/cost/<slug>`, `/drug/<slug>`, etc. when `lastUpdated == today`.**

3. **`Bing-AISearchCrawler` missing from `robots.ts`** — the lazy-fetch crawler for Bing AI experiences. Default `*` rule covers it but explicit allow is the framework convention.

4. **`Claude-User` missing from `robots.ts`** — minor.

5. **No `tsc --noEmit` in `prebuild`** — Next 16 default build does run TS during compile, but a stricter pre-flight would catch type drift before the slow Next build pass.

6. **Author `sameAs` not supported** — `MedicalAuthor` interface has no `sameAs` field. Add `sameAs?: string[]`; populate LinkedIn URL.

7. **Reviewer slot infrastructure ready, no reviewer sourced.** `reviewedBy?` accepts a `MedicalAuthor` and falls back to Organization. The day a credentialed reviewer is sourced, it's a one-call-site change per template.

**Bright spots:**
- `/medical-bill-analyzer` IS in the sitemap (closing one pre-compaction known gap)
- Single source of truth for freshness dates: `lastUpdated` → schema `lastReviewed` / `dateModified` → sitemap `lastModified` → visible "Updated" date. Architecturally clean.
- All 7 validators wired into `prebuild`. Build fails on any validator failure.
- All schema helpers present (`MedicalWebPage`, `FAQPage`, `Dataset`, `DefinedTerm`, `MedicalProcedure`, `Drug`, `QAPage`, `HowTo`, `BreadcrumbList`, `Person`).

### 4.9 Sheet Queue Topic Assignment (summary — full content in REFACTOR_PRIORITY.md)

The queue audit walked all 420 sheet rows and revised the inventory's heuristic classification. Headline totals:

| Disposition | Inventory said | Audit revised |
|---|---|---|
| `/bill/[topic]` (new template) | 200 | ~132 |
| Existing 8 templates | ~140 | ~134 |
| Reference-hub (new + updated) | 45 | ~43 |
| BenefitsUSA territory (skip) | 63 | ~74 |
| Blog | n/a | ~18 |
| Flag for editorial review | n/a | ~19 |
| **Total** | 420 | 420 |

**Classifier bugs surfaced** (audit findings on `scripts/coveredusa-content-inventory.js`):
- 16 hospital-FAP rows (Cedars-Sinai, UPMC, etc.) mislabeled as BenefitsUSA-overlap — they're `/bill/[hospital-slug]`
- 10 state-CHIP rows misclassified as reference-hub — actually BenefitsUSA territory
- 9 CPT-anchored procedure-cost rows misclassified as unclassified — they're `/cost/[procedure]` extensions
- ~25 screener-side unclassified rows are actually `/qa/[question]` candidates
- ~15 "X vs Y" rows are `/glossary/` comparison-subtype candidates
- 3 persona duplicates not detected (self-employed × 3, gig-worker × 3)

**Implications captured for REFACTOR_PRIORITY.md:**
- `/bill/[topic]` template needs 6-subtype discriminated union from v1 (Hospital FAP, State Law, CPT Code, Concept, HowTo, Viral Markup)
- New `/aca-marketplace/[state]` template mirrors `/medicare-advantage/[state]` — 10 queued rows fit immediately
- New hardcoded lighthouses: `/medicare-costs` (9 rows absorbed), `/aca-subsidy-cliff` (3 rows absorbed)
- Inventory classifier needs patches before the next run

Full sub-type schema specs, classifier fixes, and per-row reclassifications live in REFACTOR_PRIORITY.md §4 (new templates) and §5 (queue routing).

---

## 5. Effort Distribution

Aggregate across all 10 audits:

| Effort tier | Count of distinct gaps | Examples |
|---|---|---|
| S (small) | ~85 | Validator char caps, em-dash extension, `sameAs` field, Bing-AISearchCrawler add, persona synonym coverage |
| M (medium) | ~45 | Paragraph length retrofit, `<strong>` injector, `@graph` consolidation, IndexNow edit-trigger, Dataset schema emission |
| L (large) | ~12 | New `/bill/[topic]` template (6 sub-types), new `/aca-marketplace/[state]` template, new `/medicare-costs` + `/aca-subsidy-cliff` lighthouses, credentialed reviewer sourcing, maintenance cron |

**Heat map: where the work concentrates:**

| Surface | Touch count |
|---|---|
| `structured-data.ts` | 8 (one `@graph` refactor cascades to all templates) |
| `ReferenceTable.tsx` | 1 (one `<caption>` fix cascades to 6 templates) |
| Stage 2 cron + IndexNow script | 1 (one extension covers all template edits) |
| `robots.ts` | 1 (2-line addition: Bing-AISearchCrawler + Claude-User) |
| Writer agents (×8) | 8 (each needs paragraph-length + `<strong>` density + char caps + Section-specific rules) |
| Validators (×7) | 7 (each needs em-dash extension + char cap + paragraph length + structural-proportion checks) |
| Existing data files | ~25 (selective regen for top-cited pages; warn-mode for rest per blog retrofit strategy) |
| New template build | 2 (`/bill/[topic]` with 6 sub-types; `/aca-marketplace/[state]`) |
| New lighthouse pages | 3 (glossary hub, `/medicare-costs`, `/aca-subsidy-cliff`) + 1 existing-template hub (`/medicare-advantage`) |

---

## 6. What Passes Cleanly (Don't Touch)

To prevent revisions from breaking working systems, these are the parts of the implementation that PASS the framework and should remain unchanged:

- **Author byline + JSON-LD `author` on all 7 JSON templates** — visible "By Jacob Posner, Founder & Editor" rendering correctly across templates with Person schema. (Add `sameAs`, but don't refactor the rendering.)
- **`MedicalWebPage` schema emission on every health content page** — all 7 templates correctly invoke `getMedicalWebPageSchema`.
- **`FAQPage` schema with visible Q&A DOM parity** — all 7 templates correctly emit FAQPage and render visible Q&A pairs.
- **Type-specific schemas per template** — MedicalProcedure (procedure), Drug (drug), QAPage (qa), DefinedTerm (glossary), HowTo (event), MedicalWebPage+Audience-implicit (persona), Dataset (procedure + drug + MA-state).
- **`generateStaticParams` SSR** — all 7 JSON templates server-render correctly. ISR fallback on blog.
- **`hreflang` bidirectional alternates** — all 7 JSON templates emit `alternates.languages.en + .es`. (Blog template is the exception — needs adding.)
- **Spanish translation quality** — MA-state, glossary, qa, event all have human-quality Spanish. (Source URLs not localized is a separate fixable gap.)
- **`/medical-bill-analyzer` sitemap entry** — closed pre-compaction known gap. Don't remove.
- **Single source of truth for freshness dates** — `lastUpdated` → schema + sitemap + visible date. Don't introduce parallel sources.
- **2026 anchor facts validated** — Part B $283, Part D OOP $2,100, AEP Oct 15-Dec 7, MOOP $9,250 are all hard-validated in scripts. Don't relax.
- **Pronoun discipline on MA state template** — Section 5.7 spotlight rule passes cleanly via implicit California gold-standard pattern. Codify in verifier so it doesn't regress; don't change the writer's pattern.
- **HowTo schema on Event template** — the strongest schema work in the codebase. Use as the reference pattern for `/bill/[topic]` sub-type E.

---

## 7. What's Missing That Section 5.9 / 5.7 Already Anticipated

Two URLs the framework names but that don't exist:

1. **`/glossary/health-insurance-terms-explained`** — framework Section 5.4 calls this out as the glossary lighthouse hub. Doesn't exist.
2. **`/medicare-advantage` hub URL** — framework Section 5.7 calls for cluster-representative concentration toward a state-level lighthouse. The 51 state spokes have no upstream hub.

Plus three the queue audit surfaced:

3. **`/medicare-costs` hardcoded lighthouse** — 9 queued reference-hub rows want this.
4. **`/aca-subsidy-cliff` hardcoded lighthouse** — 3 queued editorial rows want this.
5. **`/aca-marketplace/[state]` template** — 10 queued rows want this (and they currently get misrouted to qa or aca-explainer buckets).

---

## 8. Calibration / Self-Check

Per the audit rubric's calibration anchor, all per-template audits should reproduce the framework Section 13 `/cost/mri` scorecard when applied to MRI. The procedure audit reproduced the directional pattern of Section 13 — all major anchors hit (em-dash in meta title CONFIRMED on all 3 procedure pages; paragraph length under target CONFIRMED; `<strong>` underused CONFIRMED; missing reviewer CONFIRMED; no IndexNow-on-edit CONFIRMED; no maintenance cron CONFIRMED). The pass/partial/fail totals don't tie out to Section 13's exact row count (rubric Section 13 lists ~21 rule rows; procedure audit reports ~15/5/5 = 25), but the rule-by-rule grades align where they overlap.

The 10 audits show variation by template but converge on the same universal patterns documented in §2. **Where agents disagreed:** primarily on numeric counts (Dataset on 2 vs 3 templates — verified actual is 3; blog post count 36 vs 37 — verified actual is 36; persona synonym counts — verified above). Where the audits diverged on count, this revised audit uses the post-verification counts. No audit returned a wildly different qualitative gap list.

**Audit scope gaps acknowledged** (not audited in this pass; should be addressed in future audits):

1. **Rubric Category 13 (Core Web Vitals)** — confirmed SSR via `generateStaticParams` but did not run actual sub-second-DOM test or mobile-responsiveness sweep.
2. **Rule 14.4/14.5 `nosnippet`/`data-nosnippet`** — confirmed neither is used anywhere in the codebase; counts as PASS for 14.4 (no whole-page nosnippet) and N/A for 14.5 (optional).
3. **`/medical-bill-analyzer` page itself was not audited** — only listed in §6 as the lone `@graph` user. Should be audited against the lighthouse standard called out in framework §5.9 in a follow-up pass.
4. **15 hardcoded reference pages** (`/federal-poverty-level`, `/medicare-eligibility`, `/medicaid-income-limits`, `/aca-income-limits`, plus tool/landing pages) — not per-template audited. Framework §5.9 says these should be engineered to lighthouse standard. Follow-up pass needed.
5. **Spanish blog translation quality** — only the 7 JSON-template Spanish translations were assessed (all PASS). The 6 Spanish blog posts were not LLM-judge reviewed.
6. **Validator failure path was not tested** — audit takes on faith that validators correctly fail builds. A sanity-check pass (introduce em-dash → verify validator fails) would be S effort + high confidence. Recommend doing this before relying on validators as the enforcement layer.
7. **Schema validation against Google Rich Results test** — audit verified schema emission but did not run actual JSON-LD through the test. Stacked `<script>` blocks each with their own `@context` are valid but may produce warnings.

---

## 9. Decisions Required Before Refactor Priority

This audit surfaces 4 decisions that REFACTOR_PRIORITY.md cannot make without input. Each carries a recommendation; Jacob can accept or push back.

| # | Decision | Audit recommendation | Owner |
|---|---|---|---|
| 1 | `<strong>` density mechanism (§3.1) | **(a) Markdown-rich paragraphs** — honors framework's sentence-initial position preference; marginal cost over the already-required paragraph regen is small | Jacob |
| 2 | Reviewer sourcing strategy (§3.2) | **Contracted credentialed reviewer** — cheapest path to closing the §7.1 YMYL trust gap | Jacob |
| 3 | Persona consolidation policy (§3.3) | **Consolidate before writing duplicates** — preserves URL authority; eliminates duplicate-write effort | Jacob |
| 4 | Blog retrofit boundary (§3.4) | **Strict-on-new + selective backfill of top-cited posts** — avoids bulk-retrofit editorial risk; surgical retrofit once Bing AI Performance Report has CoveredUSA data | Jacob |

**Strategic questions for prioritization (open):**

5. **First-wave write priority** — which existing template gets the framework-positive refactor first (procedure with strong Dataset emission already; MA-state which is already the cleanest template; persona which has the biggest fan-out gap on gig-workers; blog which has the worst external-citation gap)? Plus which new template build kicks off first (`/bill/[topic]` with 132 queued rows OR `/aca-marketplace/[state]` which is a cleaner port from MA-state)? Both are buildable in parallel (no resource constraint forces serial). The actual decision is which set of slugs ships first.

6. **Lighthouse hub priorities** — four hubs surfaced: `/medicare-costs` (absorbs 9 queued rows), `/aca-subsidy-cliff` (absorbs 3 rows), `/glossary/health-insurance-terms-explained` (anchors existing glossary spokes), `/medicare-advantage` (anchors existing MA spokes). Which order?

(Note: framework §8.2 already answers the question of validator strictness rollout — warn mode on existing + strict on new. Removed from this list to avoid confusion.)

---

*Audit v1.0 — full results pending adversarial critic + fresh-eyes review. Subsequent revisions will refine effort estimates and surface gaps the parallel agents may have missed.*
