# Phase 5 Bridge — CoveredUSA AI-Optimization Refactor

**Last updated:** 2026-05-14
**Anchored to commit:** covered-usa@2612ee7 (post-compact agent should `git pull` first; main may have advanced)
**Purpose:** Bridge doc for the fresh agent after compaction. Reads this first, then executes the plan in §5.

---

## 0. Read these in order

1. **This doc** (PHASE_5_BRIDGE.md) — orient.
2. `specs/AI_OPTIMIZATION_FRAMEWORK.md` v1.1 — the rules we engineer against. Already complete.
3. `specs/CURRENT_STATE_AUDIT.md` v1.0 — the per-template gap report. Already complete.
4. `specs/AUDIT_RUBRIC.md` — scoring conventions used in the audit. Reference only.

Don't re-do work already done. The framework is locked, the audit is locked. We're executing.

---

## 1. TL;DR — Where we are

CoveredUSA is a healthcare-information site optimized primarily for **Bing AI Search citation eligibility** with cascading benefits across Copilot (which grounds in Bing), ChatGPT Search (87% citation overlap with Bing top-organic per Seer), Perplexity, and Claude.ai. We've completed the strategic framework + a full implementation audit. Jacob has approved a refactor plan with concrete decisions on 9 of 10 issues. We're now ready to execute.

**The strategic thesis Jacob articulated**: Bing/AI rewards engineering against retrieval mechanics in a way Google doesn't. New domains can win on Bing/AI without long-history domain authority. The fan-out approach — engineering pages to hit the 5-8 actual sub-queries an LLM generates for a target — is the single highest-correlation citation signal (Cyrus Shepard's 54-study synthesis: 9.3/10 correlation). Build a proprietary measurement loop that lets us reverse-engineer fan-out coverage from real data, and we have an asset that compounds — once the system produces framework-correct content via writer agents on a cron, marginal cost approaches zero.

---

## 2. What's already built and locked

**Framework (`specs/AI_OPTIMIZATION_FRAMEWORK.md` v1.1)** — 962 lines, ~10,200 words. 14 categories of engineering rules with evidence grades (CONFIRMED / LIKELY / INFERRED). Verified against arXiv 2603.29979 (Bing Chat in test set) and arXiv 2604.25707 (Citation Absorption). All major Microsoft primary sources cross-checked. Two reviewer passes (adversarial critic + fresh-eyes) applied.

**Audit (`specs/CURRENT_STATE_AUDIT.md` v1.0)** — 439 lines, ~5,500 words. Per-template gap scorecards via 10 parallel audit agents (7 templates + daily blog + infrastructure + queue). Two reviewer passes applied. Counts verified against codebase.

**Rubric (`specs/AUDIT_RUBRIC.md`)** — scoring criteria, severity tags, effort tiers, output schema. Used by all audit agents.

**9 of 10 locked decisions** — see §10 below.

**Memory entries persisted across sessions:**
- `feedback_never_migrate_slugs.md` — Jacob has tanked a page changing slugs; never migrate URLs even with redirects.
- `feedback_structural_quality_over_volume.md` — bottleneck isn't content production; it's max-quality per page in a finite topic ecosystem.

---

## 3. Jacob's empirical grounding-query data (preserved for next session)

Jacob shared real Bing Webmaster Tools grounding-query data from BenefitsUSA. This is the actual data showing what sub-queries Copilot/Bing AI generated when retrieving his cited URLs. 24 queries with citation counts:

```
poverty level income 2026          2.0K
snap income limits 2026            1.9K
texas medicaid income limits 2026  1.1K
calfresh income limits 2026        1.0K
texas medicaid application         980
iowa medicaid application 2026     764
wic income guidelines 2026         717
social security cola 2027          646
federal poverty guidelines 2026    600
federal poverty level 2025         590
2027 cola estimate                 590
poverty guidelines 2026            579
missouri medicaid income limits 2026  563
2027 social security cola          520
projected cola for 2027            485
2026 federal poverty guidelines    457
affordable connectivity program 2026  435
fpl 2026                           398
ssi income limits 2026             388
sc medicaid income limits 2026     370
ticket to work program 2026        366
medicaid application texas         352
poverty line 2026                  346
snap income limits for 2026        329
```

### What this data tells us (must inform Track AA + every writer agent)

**Year markers in 91.6% of queries** (22 of 24). The framework's Rule 2.2 ("current-year markers in titles for YMYL") isn't just directional — it's empirically dominant. Tight enforcement justified.

**Forward-looking year markers also matter.** Four queries already target 2027 ("social security cola 2027," "2027 cola estimate," "2027 social security cola," "projected cola for 2027"). In May 2026, Copilot is already generating sub-queries for next year on forward-looking topics. Implication: for topics with projected/estimate/forward-looking framing (COLA, premiums, deductibles, plan years), pages should include both current-year AND next-year markers in body content (e.g., a 2026 Medicare costs page should have an H2 or callout addressing "What's projected for 2027 Medicare Part B premiums").

**Specification dominates the variant mix.** Almost every query is state + program + topic + year (texas medicaid income limits 2026, iowa medicaid application 2026, missouri medicaid income limits 2026, sc medicaid income limits 2026, calfresh income limits 2026). Equivalent + Canonicalization are also present (fpl / federal poverty level / poverty guidelines / poverty line all generating volume for the same concept). Generalization, Translation, Follow-up — barely visible. **Empirical re-weighting of the 8 variants:**

| Variant | Empirical weight |
|---|---|
| Specification | **HIGH** — state + year + topic + program shape dominates |
| Equivalent | **HIGH** — multiple phrasings of same concept get separate volume |
| Canonicalization | **HIGH** — acronyms, long forms, colloquial forms each generate queries |
| Entailment | MEDIUM — "application," "how to apply" action queries present |
| Clarification | MEDIUM — acronym disambiguation ("fpl" needs the long form for clarification) |
| Generalization | LOW — broad queries underrepresented; LLMs tend to narrow |
| Follow-up | LOW — sequential build not visible in single-query snapshot |
| Translation | LOW — all-English snapshot; would need separate locale data |

**Writer agent rule update:** Tell agents to weight Specification + Equivalent + Canonicalization for sure. Cover Entailment + Clarification. Don't waste H2 budget on Generalization/Translation/Follow-up unless naturally warranted.

**Canonical-form coverage is concrete and required.** "FPL" / "federal poverty level" / "poverty line" / "poverty guidelines" all get traffic on the same concept. A page covering all canonical forms in body content picks up Equivalent variants automatically. Writer agent should list canonical industry term + acronym + colloquial variants for each page's primary entity and use all of them naturally in body content.

**State + program is the hot shape.** Confirms `/medicare-advantage/[state]` template + the proposed `/aca-marketplace/[state]` template are the right architecture for YMYL benefits content.

---

## 4. The 9 locked decisions

From audit `CURRENT_STATE_AUDIT.md` §9 + the conversation that followed:

1. **`<strong>` density mechanism: option (a) Markdown-rich paragraphs.** JSON paragraphs accept `**bold**`; template renders via markdown-to-React converter. Honors framework's sentence-initial position preference. Cost: data file regen is already required for paragraph length, so marginal cost is small.

2. **Reviewer slot strategy: contracted credentialed reviewer.** RN, MD, or Licensed Health Insurance Producer. Cost-effective relative to Jacob getting his own broker license. Closes the largest YMYL trust gap. Status: not yet sourced — Jacob to action.

3. **Persona duplicates: consolidate before writing.** Don't write the 6 persona-variant queue rows as separate pages; merge synonyms into existing `/for/gig-workers` + `/for/self-employed`.

4. **Blog retrofit: strict-on-new + selective backfill of top-cited.** Strict mode validators on every new post from day one. Manual surgical retrofit of the 5-10 highest-citation posts once Bing AI Performance Report has CoveredUSA data. Don't bulk-retrofit all 36 at once.

5. **URL stability is absolute.** NEVER migrate existing slugs. Jacob has tanked a page doing this. Content rewrite is fine; URL change is forbidden. Memory entry persists.

6. **Internal linking: 3-5 inline body links per page, no density target enforcement.** Drop the "1 link per 150-200 words" heuristic. Real rule: every page links inline to lighthouse / cluster representatives where natural; entity-dense anchor text; do not force links into prose. The audit's framing was too SEO-traditional; corrected.

7. **Fan-out variants: every writer agent embeds per-template variant examples.** Writer agent prompt includes a concrete worked-example block showing what each variant looks like for that template's domain (procedure → "MRI vs CT scan" for Clarification; persona → synonym-named H2s for Clarification; etc.). Without examples, agents generate vague H2s. With examples, they match the pattern.

8. **Blog first, hold new templates.** Don't build `/bill/[topic]` or `/aca-marketplace/[state]` until existing templates are framework-correct. The blog cron runs daily, so the compounding effect of fixing it first is highest.

9. **Foundation-first execution.** Track 0 (URL slug framework doc) before any code/content. Then Track A (infrastructure cascades). Then Track AA (fan-out measurement loop). Then Track B (blog writer rewrite + manual test). Then C → D → E → F.

**Open question still pending Jacob:** lighthouse hub order (Track D timing) — `/medicare-costs` vs `/aca-subsidy-cliff` vs `/glossary/health-insurance-terms-explained` vs `/medicare-advantage`. Defer until after Tracks 0-B prove the framework works.

---

## 5. Execution plan — full track order

**Track 0 — URL slug framework doc + link target manifest.** Few hours. The smallest, most foundational deliverable. See §6 below for spec.

**Track A — Infrastructure cascades.** 5 universal fixes, each touches one file but cascades across all 8 templates. See §7 for the list with file paths.

**Track AA — Fan-out measurement loop.** The proprietary keystone. Build the probe + scoring + Bing data ingestion pipeline. See §8 for spec. This is what makes the system measurable and self-improving.

**Track B1 — Blog writer agent rewrite + manual test cycle.** Update `coveredusa-article-writer.md` with all new rules (URL slug rules from Track 0; fan-out variant blocks with examples; paragraph length 150-300; `<strong>` density via markdown; internal body links 3-5, no forcing; external `.gov` citation density; named-entity sentence discipline; canonical-form coverage). **Manual test**: directly invoke the agent on 5-10 test keywords, run validators, render in dev, score fan-out coverage, iterate writer prompt. Don't flip the daily cron until output is consistently framework-compliant.

**Track B2 — Flip daily blog cron live.** Once B1 output is proven, swap the new writer in. From here forward, every new blog post is framework-correct.

**Track C — Template-by-template writer agent updates.** Same pattern as B1, applied to each JSON template. Order: MA-state first (already cleanest, validates the pattern), then the harder templates (Q&A, persona, glossary), then procedure + drug + event. One template per day. Manual test before flipping each.

**Track D — New template builds.** `/bill/[topic]` (with 6 sub-types: Hospital FAP, State Law, CPT Code, Concept, HowTo, Viral Markup). `/aca-marketplace/[state]` (mirrors MA-state). Lighthouse hubs (`/medicare-costs`, `/aca-subsidy-cliff`, `/glossary/health-insurance-terms-explained`, `/medicare-advantage`). Built day-one framework-correct.

**Track E — Existing content regeneration.** Once writer agents are framework-correct, regenerate the 20 existing template pages + 36 existing blog posts using the new writers. URLs stay (per locked decision 5); only content inside changes. Bulk-gen with overwrite mode.

**Track F — BenefitsUSA audit at the very end.** Apply the framework + measurement loop to BenefitsUSA. EXTREME caution required — Jacob has tanked a page on BenefitsUSA before by changing URLs. Strictly content updates + writer agent improvements; never URL changes; never anything that touches cluster representative status of existing pages.

---

## 6. Track 0 spec — URL slug framework + link target manifest

**Deliverable 1: `specs/URL_SLUG_FRAMEWORK.md`** — a focused reference doc that gets fed into every writer agent prompt as required reading.

Required content:

1. **Stability rule.** Slugs are forever. Never migrate. Even with 301 redirects, the new URL rebuilds trust from zero. Memory entry confirms.
2. **No year in slug.** Year markers belong in H1, title, meta description, first paragraph only. Validator should fail any slug containing 4-digit year pattern.
3. **Primary entity closest to root.** `/cost/mri`, not `/healthcare-costs/mri-pricing-guide`. Validator should fail slugs over 60 characters or with underscores.
4. **State/locale as static subdirectory.** `/medicare-advantage/california`. Never a query parameter.
5. **Per-template URL patterns documented:**
   - `/cost/[procedure]` for procedure-cost pages
   - `/drug/[drug]` for drug-cost pages
   - `/qa/[question]` for Q&A pages
   - `/glossary/[term]` for glossary entries
   - `/event/[event]` for life events
   - `/for/[persona]` for personas
   - `/medicare-advantage/[state]` for state MA pages
   - `/blog/[slug]` for daily SEO blog posts
   - `/bill/[topic]` (future) for medical-bill content
   - `/aca-marketplace/[state]` (future) for state ACA marketplace pages
6. **Existing-slug audit.** 16 of 36 existing blog posts have year-in-slug (e.g., `/blog/aca-income-limits-2026`). These are grandfathered per the stability rule. The writer agent for blog must NOT generate year-in-slug for new posts going forward.

**Deliverable 2: `specs/LINK_TARGET_MANIFEST.md`** — list of what writer agents can link to internally, organized by topic cluster.

Required content:
- Lighthouse pages (current and planned)
- Cluster representatives per topic cluster
- Per-program canonical link targets (Medicaid → `/medicaid-income-limits`; Medicare → `/medicare-eligibility`; ACA → `/aca-income-limits`; FPL → `/federal-poverty-level`)
- Hardcoded reference pages
- "Not yet built but planned" entries (so writers know what's coming and can stub references)

Writer agents reference this manifest when generating inline body links. As we add lighthouse hubs (Track D), the manifest expands. Writer agents always know what's linkable.

---

## 7. Track A spec — 5 universal infrastructure cascades

Each touches one file but cascades across all 8 templates.

### A1. Schema `@graph` refactor

**File:** `src/lib/structured-data.ts`
**What:** Add a `buildSchemaGraph(nodes, pageUrl)` helper that wraps multiple schema nodes into a single `@graph` with `@id` linking and `mainEntityOfPage` references. Each existing helper (`getMedicalWebPageSchema`, `getFAQSchema`, etc.) gains an optional `@id` arg; the wrapper strips per-node `@context` and assigns `@id` URIs.
**Affected templates:** All 8 (every template currently emits 3-5 separate `<script>` tags).
**Severity:** MAJOR (Framework Rule 7.6).
**Effort:** M.

### A2. ReferenceTable `<caption>` fix

**File:** `src/components/reference/ReferenceTable.tsx`
**What:** Current implementation renders caption as a `<div>` sibling (lines 88-96, CSS workaround). Change to real `<caption>` element with `caption-side: top` and `background: transparent` to dodge the original CSS bleed.
**Affected templates:** Procedures, drugs, glossary, event, persona, MA-state (every template using ReferenceTable).
**Severity:** MAJOR (Framework Rule 6.5).
**Effort:** S.
**Verify UI still looks good per Jacob — visual review required before merging.**

### A3. IndexNow on edits (not just publishes)

**File:** `scripts/coveredusa-indexnow-submit.js` (in clawd-workspace `/Users/jacobposner/clawd/scripts/`)
**What:** Current `--today` mode resolves URLs by scanning blog markdown frontmatter for `date: today`. Extend `getTodaysUrls()` to also walk `content/data/*/*.json` and emit `/cost/<slug>`, `/drug/<slug>`, `/qa/<slug>`, `/glossary/<slug>`, `/event/<slug>`, `/for/<slug>`, `/medicare-advantage/<slug>` when the JSON's `lastUpdated == today`. Stage 2 cron continues to call `--today` once per day; new behavior covers all template edits, not just new blog publishes.
**Severity:** MAJOR (Framework Rule 11.3).
**Effort:** M.

### A4. Robots.txt missing crawlers

**File:** `src/app/robots.ts`
**What:** Add explicit `Allow: /` for `Claude-User` (Claude.ai browsing) and `Claude-SearchBot` (Claude search-style indexing) — both distinct from `ClaudeBot` (training). Earlier draft of this spec called for `Bing-AISearchCrawler`; verification against Microsoft's official crawler documentation on 2026-05-14 confirmed no such user-agent exists. Bingbot itself powers Copilot grounding per Microsoft docs, so no separate Bing-AI crawler entry is needed.
**Severity:** MAJOR.
**Effort:** S (2-line addition).

### A5. Validator content-quality lint per template

**Files:** `scripts/validate-procedures.js`, `validate-drugs.js`, `validate-qa.js`, `validate-glossary.js`, `validate-events.js`, `validate-personas.js`, `validate-medicare-advantage.js` (7 validators).
**What:** Add these deterministic checks to each:
- Em-dash regex: `grep -c "—"` on full JSON string → must be 0. En-dash between digits in price ranges (`$400–$3,500`) is allowed; match em-dash anywhere, en-dash only when not between digits.
- Paragraph word count: warn if any body paragraph < 80 or > 400; strict-fail if < 50 or > 500.
- Meta title length: strict ≤70.
- Meta description length: strict ≤160.
- Structural proportion: combined `<table>` + `<ul>` + `<ol>` word content as fraction of total body; warn if outside `[0.20, 0.40]`, fail if outside `[0.10, 0.50]`.
- Source count: ≥3 sources per page (already in some validators — extend to all).
- Year freshness: page contains current year in title, H1, meta description, first paragraph (for year-anchored page types; glossary concept-subtype exempt per Section 5.4).
**Severity:** MAJOR (covers Framework Rules 2.4, 2.5, 4.1, 5.1, 6.1, 9.1).
**Effort:** M per validator × 7 validators.

**Order within Track A:** A4 first (2-line trivial fix; build confidence). Then A2 (visual review with Jacob). Then A1 (cascading benefit). Then A3 (IndexNow). Then A5 (multi-file but mechanical).

---

## 8. Track AA spec — fan-out measurement loop (the proprietary keystone)

This is the system Jacob articulated. Build it as a top-line priority — without it, every "fan-out coverage" claim is aspirational rather than measured.

### AA1. Probe script — `scripts/coveredusa-fanout-probe.js`

**Input:** Target query (e.g., "MRI cost without insurance 2026").
**What it does:**
- Spins up parallel API calls to Anthropic Claude (with `web_search` tool), OpenAI ChatGPT Search, and Perplexity Sonar.
- Captures every sub-query each model issues. Anthropic's `web_search` tool input is visible in tool call logs. Perplexity's Sonar API returns sub-queries in the response. ChatGPT Search exposes them similarly.
- Aggregates sub-queries by frequency across runs (run each model 3-5 times for stability).
- Outputs `content/fanout/<slug>.json` containing the aggregated sub-queries.

**API keys needed:**
- Anthropic API key (already have via ClaudeClaw)
- OpenAI API key (Jacob can provide if not on hand)
- Perplexity API key

### AA2. Scoring script — `scripts/coveredusa-fanout-score.js`

**Input:** A generated article (.md or .json) + the corresponding fan-out JSON.
**What it does:**
- Uses an LLM (Claude or GPT-4) as a judge: "Does this article have an H2 / section / content block that meaningfully answers each of these sub-queries?"
- Outputs a coverage score (% of sub-queries covered).
- Below threshold (suggested 70%), the article fails and goes back for revision.

### AA3. Bing AI Performance Report ingestion (monthly manual + script)

**File:** `scripts/coveredusa-bing-ai-report-import.js`
**What it does:**
- Jacob manually exports the AI Performance Report CSV from Bing Webmaster Tools monthly.
- Script ingests the CSV, parses grounding queries per URL, stores them in `content/fanout/bing-actuals/<slug>-YYYY-MM.json`.
- Provides ground truth for refining the writer agent's variant model over time.

### AA4. Writer agent integration point

Each writer agent's prompt updated to:
1. Read `content/fanout/<slug>.json` if it exists (probe data).
2. If Bing actuals exist (`content/fanout/bing-actuals/<slug>-*.json`), prioritize those — real data beats proxy data.
3. Generate H2s that cover at least 70% of the observed sub-queries.
4. Verifier checks coverage post-write.

**Integration timing:** Build AA1-AA3 before Track B1. AA4 happens AS PART of Track B1's writer-agent rewrite.

**The calibration question Track AA answers over time:** "How well do proxy LLM sub-queries (Claude / ChatGPT / Perplexity) predict Bing's actual grounding queries on healthcare-navigation content?" Seer's 87% overlap data suggests reasonably well, but the 13% divergence matters. After 2-3 cycles of probe + publish + Bing CSV comparison, we have a measured calibration coefficient. That coefficient tells us how much to trust the proxy for net-new content.

---

## 9. Track B1 spec — blog writer agent rewrite

**File:** `.claude/agents/coveredusa-article-writer.md`
**Companion files to update:** `.claude/agents/coveredusa-article-verifier.md`, `.claude/claudeclaw/jobs/coveredusa-seo-stage1.md`, `.claude/claudeclaw/jobs/coveredusa-seo-stage2.md`

**Rules to add to writer prompt** (assumes Track 0, Track A, Track AA are complete first):

1. **URL slug rules** — point to `specs/URL_SLUG_FRAMEWORK.md`. No year in slug. Validator catches violations.
2. **Fan-out variant block** with concrete examples for blog post format (the worked-example template Jacob explicitly asked for). Per-variant, show what an H2 looks like.
3. **Variant weighting from observed data** (§3 of this bridge): emphasize Specification + Equivalent + Canonicalization. Cover Entailment + Clarification. Don't over-invest in Generalization/Translation/Follow-up.
4. **Paragraph length:** 150-300 words for body prose, 80-150 for FAQ answers.
5. **`<strong>` density:** use `**bold**` markdown for 5-10% of body content. Prioritize sentence-initial entities, dollar amounts, dates.
6. **Internal body links:** 3-5 inline links to lighthouses/cluster representatives per `LINK_TARGET_MANIFEST.md`. No density target; natural placement only. Entity-dense anchor text.
7. **External citation density:** ≥3 inline outbound links to `.gov` / `.edu` / KFF.org / healthcare.gov / cms.gov / nih.gov / IRS / Congress.gov beside numeric claims. The current "31 of 36 blog posts have zero external URLs" gap is CRITICAL violation of Rule 9.1.
8. **Named-entity sentence discipline:** first sentence of every paragraph (including hero, FAQ answers) must contain the named entity explicitly. Pronouns OK in subsequent sentences with clear referent.
9. **Canonical-form coverage:** list canonical industry term + acronym + colloquial variants for the page's primary entity in the writer's planning phase. Use all forms naturally distributed in body content. (Empirical evidence: "FPL" / "federal poverty level" / "poverty line" / "poverty guidelines" all generate separate grounding query volume — single page covering all canonical forms wins Equivalent variants automatically.)
10. **Year markers:** current year in title, H1, meta description, first paragraph. For forward-looking topics (COLA, projected, estimate, next year's something), also include next-year markers in body content.
11. **Author byline:** `Jacob Posner, Founder & Editor` already established. Add `sameAs` LinkedIn URL when available.
12. **`hreflang` in metadata:** blog template currently only sets `canonical`; add `alternates.languages` for `en` + `es` per template parity.

**Manual test cycle:**
1. Pick 5-10 target keywords (mix of currently-queued blog topics + topics that exist on BenefitsUSA so we have proxy fan-out data).
2. Run Track AA probe to generate fan-out JSON for each.
3. Invoke the new article writer directly (NOT via daily cron). One agent call per target.
4. Validate output: run all validators, render the post in dev, score fan-out coverage via Track AA scorer.
5. Iterate writer prompt until output is consistently framework-compliant (probably 2-3 iteration rounds).
6. **Don't flip the daily cron until output passes a hard threshold** (e.g., 8 of 10 test articles score above 70% fan-out coverage AND pass all validators in strict mode).

---

## 10. Track C-F — brief

**Track C — Template-by-template, one per day, manual test before flipping each cron.**
Order: MA-state (cleanest, validates pattern), Q&A (worst Q&A H2 coverage), Persona (biggest synonym gap), Glossary (sub-type field addition), Procedure, Drug (with `iraNegotiation` rendering bug fix), Event (with calendar-date hero examples).

**Track D — New templates day-one framework-correct.**
`/bill/[topic]` with 6 sub-types (Hospital FAP, State Law, CPT Code, Concept, HowTo, Viral Markup) — see audit §4.9 for full sub-type schema spec.
`/aca-marketplace/[state]` mirroring `/medicare-advantage/[state]` — 10 queued rows fit immediately.
Lighthouse hubs in priority TBD: `/medicare-costs`, `/aca-subsidy-cliff`, `/glossary/health-insurance-terms-explained`, `/medicare-advantage`.

**Track E — Bulk regenerate existing content using new writers.** URLs stay. Content inside changes. Per template, bulk-gen with overwrite mode. Blog corpus: 36 posts. Templates: ~20 pages. Total: ~56 regenerations.

**Track F — BenefitsUSA optimization.** Apply framework + measurement loop. EXTREME caution. Strictly content + writer-agent updates. Never URL changes. Use BenefitsUSA's already-rich grounding query data as the empirical validation set.

---

## 11. Critical boundaries — what NOT to do

1. **NEVER migrate existing slugs.** Jacob has tanked a page doing this. Even with 301s, new URL rebuilds trust from zero. Memory entry `feedback_never_migrate_slugs.md`.

2. **NEVER bulk-deploy refactored content without test validation.** Manual test cycle before flipping every cron live. Auto-deploy bad content via cron compounds daily.

3. **NEVER touch BenefitsUSA until CoveredUSA is proven.** BenefitsUSA is a fragile asset with accumulated cluster representative status. Track F is last for a reason.

4. **NEVER force internal links into prose.** The "1 link per 150-200 words" density target from the audit is dropped. 3-5 natural inline links per page; if no natural place exists, skip.

5. **NEVER stack `@type` collisions on schema nodes.** Use `@graph` with `@id` linking instead (Track A1).

6. **NEVER add features beyond what each track requires.** Bug fixes don't need surrounding cleanup. The framework is the rubric; don't extend beyond it without explicit approval.

---

## 12. Open questions for Jacob (pending input)

1. **Lighthouse hub priority order** (for Track D timing): `/medicare-costs` vs `/aca-subsidy-cliff` vs `/glossary/health-insurance-terms-explained` vs `/medicare-advantage` — which first? Defer until after Tracks 0-B prove the framework works; revisit when Track D approaches.

2. **Reviewer sourcing** — Jacob to identify and contract a credentialed reviewer (RN, MD, or Licensed Health Insurance Producer). Once sourced, populate `COVEREDUSA_REVIEWER` constant in `structured-data.ts`. Cascades to all templates via `reviewedBy` field on `MedicalWebPage` schema.

3. **OpenAI API key for Track AA probe** — Jacob to confirm we have access or provide one. Anthropic key already available via ClaudeClaw.

4. **Perplexity API key for Track AA probe** — Jacob to provision or confirm we have one.

---

## 13. Concrete first 5 actions for post-compact agent

After reading this doc + skimming the framework + audit:

1. **`git pull` and verify HEAD** — main may have advanced since 2612ee7. If so, re-verify Track 0/A target files still exist at the paths cited.

2. **Confirm the plan with Jacob.** Brief check-in: "I've read the bridge doc, framework, and audit. The plan is Track 0 → A → AA → B → C → D → E → F. Starting with Track 0 (`URL_SLUG_FRAMEWORK.md` and `LINK_TARGET_MANIFEST.md`). Sound right?" Don't start work without confirmation.

3. **Write `specs/URL_SLUG_FRAMEWORK.md`** per Track 0 spec in §6. Self-contained reference doc that gets fed into every writer agent. ~500-800 words.

4. **Write `specs/LINK_TARGET_MANIFEST.md`** per Track 0 spec in §6. List of linkable internal pages organized by topic cluster. Living document — expands as we add lighthouse hubs.

5. **Verify both Track 0 docs with Jacob.** Brief review: do the URL rules + link manifest cover everything? Once approved, move to Track A.

---

## 14. Key files and where they live

**Strategic + planning** (covered-usa repo, `specs/`):
- `AI_OPTIMIZATION_FRAMEWORK.md` v1.1 — the framework
- `CURRENT_STATE_AUDIT.md` v1.0 — the audit
- `AUDIT_RUBRIC.md` — scoring conventions
- `PHASE_5_BRIDGE.md` — this doc
- `URL_SLUG_FRAMEWORK.md` (to be written — Track 0)
- `LINK_TARGET_MANIFEST.md` (to be written — Track 0)
- `PHASE_4_BRIDGE.md` — prior bridge (pre-compaction context)
- `PHASE_4_PLAN.md` — Phase 4 lighthouse-strategy plan
- `CONTENT_INVENTORY.md` — 420 sheet rows + 71 live pages

**Research** (covered-usa repo, `specs/research/`):
- `grounding-mechanics-deep-research-prompt.md` — the deep-research prompt
- `bing-webmaster-api.md`
- `copilot-citation-mechanics.md`
- `competitor-landscape.md`
- `ai-seo-operator-playbooks.md`
- `scoring-framework.md`
- `bing-ai-tooling.md`
- `lighthouse-pattern-deep-dive.md`

**Code** (covered-usa repo, `src/`):
- `lib/structured-data.ts` — schema helpers (Track A1 refactor target)
- `lib/{procedures,drugs,qa,glossary,events,personas,medicare-advantage,blog}.ts` — template loaders
- `app/[locale]/{cost,drug,qa,glossary,event,for,medicare-advantage,blog}/[slug]/page.tsx` — dynamic routes
- `app/sitemap.ts`, `app/robots.ts` — site-level config
- `components/reference/ReferenceTable.tsx` — Track A2 fix target

**Validators** (covered-usa repo, `scripts/`):
- `validate-{procedures,drugs,qa,glossary,events,personas,medicare-advantage}.js` — 7 validators, all need Track A5 content-quality lint

**Writer + verifier agents** (clawd-workspace repo, `.claude/agents/`):
- `coveredusa-article-{writer,verifier}.md` — daily blog (Track B1 target)
- `coveredusa-{procedure,drug,qa,glossary,event,persona,ma-state}-{writer,verifier}.md` — 14 template agents (Track C targets)

**Crons** (clawd-workspace repo, `.claude/claudeclaw/jobs/`):
- `coveredusa-seo-{stage1,stage2}.md` — daily blog cron pair
- `coveredusa-{procedure,drug,qa,glossary,event,persona,ma-state}-bulkgen.md` — per-template on-demand bulkgen

**Indexing** (clawd-workspace repo, `scripts/`):
- `coveredusa-indexnow-submit.js` — Track A3 extension target
- `coveredusa-content-inventory.js` — re-runnable inventory script

---

## 15. Memory entries (persist across sessions)

Already saved at `/Users/jacobposner/.claude/projects/-Users-jacobposner-clawd/memory/`:
- `feedback_never_migrate_slugs.md`
- `feedback_structural_quality_over_volume.md`

If Track 0 introduces additional persistent rules, save new memory entries before compaction.

---

## 16. Strategic context that needs to persist

- **CoveredUSA is Bing/AI-first.** Google is happy side effect, not primary target.
- **The fan-out approach is THE keystone signal.** Cyrus Shepard 9.3/10 correlation, highest of any single AI-citation signal.
- **The system is the asset.** Content is API calls on a cron once the system is right.
- **Marginal cost of content approaches zero** once writer agents + validators + verifiers are framework-correct.
- **URL stability is absolute** — never migrate slugs even with 301s. Memory persists.
- **BenefitsUSA optimization comes LAST.** Fragile asset; do not risk it until CoveredUSA is proven.
- **The framework is graded** — CONFIRMED rules are CRITICAL severity; INFERRED rules are MINOR. Don't engineer to operator conventions as if they were Microsoft-confirmed.
- **Jacob trusts the audit-recommended decisions on items 1-9.** Open question only on lighthouse hub order (Track D).
- **Empirical data trumps theoretical framework.** Jacob's grounding queries from BenefitsUSA shape variant weighting (§3). When real data and framework disagree, real data wins.

---

*This is the bridge. After compaction, the fresh agent reads this doc + the framework + the audit, then executes §13's first 5 actions in order. Everything needed to continue is here.*
