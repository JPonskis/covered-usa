# Track AA Plan — Fan-Out Measurement Loop

**Date:** 2026-05-14
**Status:** Planning
**Companion docs:** `specs/AI_OPTIMIZATION_FRAMEWORK.md` §2.1 (fan-out variants), `specs/PHASE_5_BRIDGE.md` §8 (Track AA spec), `specs/CURRENT_STATE_AUDIT.md` (gap analysis)

---

## 0. Purpose

Build the proprietary measurement loop that closes the gap between "we think this article covers the right fan-out variants" and "we know it does — here's the evidence."

The strategic thesis from the bridge (§2): "Build a proprietary measurement loop that lets us reverse-engineer fan-out coverage from real data, and we have an asset that compounds." Cyrus Shepard's 54-study synthesis ranks fan-out coverage as the single highest-correlation AI-citation signal (9.3/10). Without measurement, every writer-agent claim of "good fan-out coverage" is aspirational.

The system has four parts, three of which we build now (AA1-AA3) and one that lives inside the writer agent (AA4, built as part of Track B1).

---

## 1. The measurement model

When a user prompt enters Copilot/Bing AI, the LLM decomposes it into 5-8 sub-queries (the "fan-out variants" — Equivalent, Specification, Canonicalization, Entailment, Clarification, Generalization, Translation, Follow-up). Each sub-query independently retrieves candidates from Bing's grounding index. A page that hits MORE sub-queries gets MORE retrieval opportunities → more chances to be selected → more chances to be absorbed → more citations.

We can't see Bing's decomposition directly. But we have three proxies that ARE observable:

1. **Anthropic Claude with `web_search` tool** — each `tool_use` block emits a `query` string. Visible in the API response.
2. **OpenAI Responses API with `web_search` tool** — emits `web_search_call` items with the search query in `action.query`.
3. **Perplexity Sonar API** — returns `search_results` and the underlying queries (one form of the response).

Aggregate sub-queries across providers + multiple runs → that's our **proxy** for what Bing's fan-out actually does. Calibrate the proxy against Bing's actual grounding queries (via the Bing AI Performance Report) → over 2-3 cycles, we have a measured coefficient. Seer Interactive reports 87% citation overlap between Bing top-organic and ChatGPT Search; the calibration should land somewhere similar but we want the actual number for CoveredUSA's domain.

---

## 2. AA1 — Probe script

**File:** `scripts/coveredusa-fanout-probe.js`
**Input:** A target prompt from the 27-prompt set in `content/experiments/fanout-phase-1-prompts.json`.
**Output:** `content/fanout/<prompt-id>.json` with aggregated sub-queries per provider, ranked by frequency.

**Three providers** (Perplexity dropped — see §2.4):

### 2.1 Anthropic Claude probe

`@anthropic-ai/sdk` with model `claude-sonnet-4-6` (the consumer default on Claude.ai as of May 2026) and the `web_search_20250305` tool. Pass the prompt as a user message. Collect all `server_tool_use` blocks from the response. Each block's `input.query` field is a sub-query. Set `temperature: 1.0` so 3 runs actually produce variance.

Pricing: $3/MTok in + $15/MTok out + **$10 per 1,000 web searches**. ~$0.060/probe.

### 2.2 OpenAI Responses probe

OpenAI Responses API with model `gpt-5-mini` (the cost-optimized GPT-5 family variant). NOTE: the true consumer default is `gpt-5.5` at $5/$30 — using `gpt-5-mini` here to stay within Jacob's $7 OpenAI credit budget for Phase 1. We validate the gpt-5-mini-vs-gpt-5.5 fan-out assumption in Phase 1.5 with a small 5-prompt re-run. The fan-out SHAPE (variant patterns) should match across model tiers within the same family; only raw query count is expected to differ.

`tools: [{ type: "web_search" }]` on the Responses API. Walk response items — each `web_search_call` item exposes its query at `output[].action.query`. ~5-10% of `web_search_call` items have null `action.query` per OpenAI's docs — tolerate.

Pricing: $0.25/MTok in + $2.00/MTok out + web search content billed as input tokens. ~$0.010/probe.

### 2.3 Google Gemini probe

Gemini API with model `gemini-3-flash` (the consumer default on gemini.google.com as of April 2026) and Google Search grounding. Sub-queries are at `candidates[].groundingMetadata.webSearchQueries` (an array of literal query strings, explicitly documented for debugging).

Pricing: $0.50/MTok in + $3/MTok out + grounding **free for first 1,500 requests/day**, then $35/1K. 216 probes fits well within the free tier. ~$0.006/probe.

### 2.4 Why Perplexity is NOT in the experiment

Verified against `docs.perplexity.ai/api-reference/chat-completions-post`: the Sonar response exposes `search_results` (URLs + titles + snippets), `citations`, and `usage.num_search_queries` (an integer count). The literal query strings the model issued internally are NOT in the response schema. Since the entire experiment depends on capturing those queries, Perplexity is dropped. If we want a Perplexity row later, we'd switch to `sonar-reasoning-pro` and parse the `<think>` chain — unreliable for structured capture, so deferred.

### 2.5 Aggregation + storage

```json
{
  "target": "MRI cost without insurance 2026",
  "slug": "mri-cost-without-insurance-2026",
  "probedAt": "2026-05-14T22:00:00Z",
  "subQueries": [
    { "query": "MRI cost without insurance", "count": 8, "providers": ["claude", "openai", "perplexity"] },
    { "query": "MRI price 2026", "count": 6, "providers": ["claude", "openai"] },
    { "query": "MRI cost outpatient vs hospital", "count": 5, "providers": ["claude", "perplexity"] },
    { "query": "average MRI cost United States 2026", "count": 4, "providers": ["openai"] }
  ],
  "providers": {
    "claude": { "runs": 3, "uniqueQueries": 12 },
    "openai": { "runs": 3, "uniqueQueries": 9 },
    "perplexity": { "runs": 3, "uniqueQueries": 7 }
  }
}
```

Top 8-10 by `count` form the "expected fan-out variants" for that target.

---

## 3. AA2 — Scoring script

**File:** `scripts/coveredusa-fanout-score.js`
**Input:** A generated article (`content/blog/<slug>.md` or `content/data/<template>/<slug>.json`) + the corresponding `content/fanout/<slug>.json`.
**Output:** A coverage score (% of sub-queries with meaningful coverage in the article).

### Method

LLM-as-judge using Claude. For each top-ranked sub-query, ask: "Does this article have a section, paragraph, table, or FAQ that meaningfully answers '<sub-query>'? Y/N + 1-sentence justification."

Aggregate Y/N → coverage percentage. Below threshold (suggested 70%), the article fails AA scoring and goes back for revision.

Output:

```json
{
  "slug": "mri",
  "scoredAt": "2026-05-14T22:30:00Z",
  "coverage": 0.78,
  "covered": ["MRI cost without insurance", "MRI price 2026", "MRI cost outpatient vs hospital"],
  "uncovered": ["average MRI cost United States 2026", "MRI insurance copay 2026"],
  "verdict": "PASS",
  "threshold": 0.70
}
```

---

## 4. AA3 — Bing AI Performance Report ingestion

**File:** `scripts/coveredusa-bing-ai-report-import.js`
**Input:** Monthly CSV export from Bing Webmaster Tools → AI Performance Report → grounding queries per URL.
**Output:** `content/fanout/bing-actuals/<slug>-YYYY-MM.json`

CoveredUSA doesn't yet have meaningful Bing AI traffic, but BenefitsUSA does — the 24-row dataset in `PHASE_5_BRIDGE.md` §3 is from this report. We can ingest BenefitsUSA's CSV today as our calibration set. As CoveredUSA traffic grows, its own AI Performance Report becomes the ground truth.

Schema per ingested URL:

```json
{
  "url": "/blog/...",
  "month": "2026-05",
  "groundingQueries": [
    { "query": "poverty level income 2026", "citations": 2000 },
    { "query": "snap income limits 2026", "citations": 1900 }
  ]
}
```

---

## 5. Calibration coefficient

Over time, for each URL we have both `content/fanout/<slug>.json` (proxy from probing) and `content/fanout/bing-actuals/<slug>-YYYY-MM.json` (ground truth from Bing). The script `coveredusa-fanout-calibrate.js` (or just a notebook) computes:

- **Overlap rate:** % of Bing's actual grounding queries that ALSO appeared in our proxy probe
- **Provider weighting:** which proxy provider (Claude / OpenAI / Perplexity) predicts Bing best for healthcare/insurance domains
- **Variant drift:** which fan-out variants the proxies under- or over-predict relative to Bing

After 5-10 URLs have both proxy + actuals, we have a measured calibration coefficient. Writer agents trust the proxy more confidently for new content.

The empirical re-weighting from Jacob's grounding data in `PHASE_5_BRIDGE.md` §3 is the FIRST data point: Specification + Equivalent + Canonicalization dominate; Generalization + Translation + Follow-up are rare. Track AA produces a continuous version of that insight.

---

## 6. AA4 — Writer agent integration

Built as part of Track B1, not Track AA. The writer agent prompt gains a block:

```
Before writing, load content/fanout/<slug>.json if it exists. The
top 8 sub-queries are the H2s/sections your article must answer.
Each H2 should explicitly address one variant. If a sub-query is too
narrow for an H2, fold it into the parent H2's body.

If a Bing actuals file exists at content/fanout/bing-actuals/<slug>-*.json,
treat those as ground truth — they beat the proxy.

After writing, the verifier agent runs coveredusa-fanout-score.js. If
coverage < 0.70, the article goes back for revision.
```

---

## 7. Cost analysis (verified against live provider pricing pages, 2026-05-14)

Per-probe cost using current published prices (~50 input tokens + ~2,000 output tokens with tool-use overhead + ~3 web searches per probe):

| Provider | Model | Per-probe cost | × 81 probes (27 prompts × 3 runs) |
|---|---|---|---|
| Anthropic | `claude-haiku-4-5` ($1/$5 per MTok + $10/1K searches) | ~$0.040 | ~$3.24 |
| OpenAI | `gpt-5-mini` ($0.25/$2 per MTok) | ~$0.010 | ~$0.81 |
| Google | `gemini-2.5-flash` ($0.30/$2.50 per MTok, grounding free under 1,500 RPD) | ~$0.005 | ~$0.41 |
| **Total Phase 1 probe** | | | **~$4.50** |

Plus AA2 scoring (Claude judge over the 7-8 existing template articles + maybe a handful of blog posts) ≈ ~$0.50.

**Total Track AA bring-up: under $5.** My earlier $20 estimate was ~4x too high — Perplexity is no longer in the mix and Gemini's free grounding tier covers our volume.

Daily blog cron at 3 articles/day × 3 providers × 3 runs each = ~27 probes/day = ~$1/day = ~$30/month. Cheap.

Sources:
- [Anthropic web_search_tool docs](https://platform.claude.com/docs/en/docs/build-with-claude/tool-use/web-search-tool)
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)

---

## 8. Test plan — the scientific experiment

The proper scope. 27 prompts, 3 providers, 3 runs each → 243 probes → ~$4.50.

### 8.1 Phase 1 — baseline data collection

Run all 27 prompts (in `content/experiments/fanout-phase-1-prompts.json`) through the 3 providers. Capture every sub-query each LLM fires. Dump into a Google Sheet (`CoveredUSA — Fan-Out Experiment` in Jacob's Drive). Schema:

| prompt_id | template | topic | style | prompt | llm | model | run | sub_query | variant_tag | timestamp |
|---|---|---|---|---|---|---|---|---|---|---|

Each row is ONE sub-query the LLM fired. One prompt can produce many rows.

`variant_tag` is the fan-out type — Specification / Equivalent / Canonicalization / Entailment / Clarification / Generalization / Translation / Follow-up. Tagged by a Claude judge call after capture, OR hand-tagged in the sheet once we have the data.

### 8.2 Phase 1 — analysis

Pivot the sheet:

1. **Per-template patterns** — for procedure-cost prompts, does every LLM fire similar sub-queries (X cost without insurance / X cost 2026 / X cost vs Medicare rate / X cost hospital vs clinic)? Or does each provider do its own thing?
2. **Per-provider divergence** — does Claude fan out 3 sub-queries while Gemini fans out 8?
3. **Per-style sensitivity** — do conversational prompts get more Clarification variants? Do terse prompts get more Specification?
4. **Variant frequency** — does the BenefitsUSA finding from `PHASE_5_BRIDGE.md` §3 hold (Specification + Equivalent + Canonicalization dominate)? Or does the distribution shift per template?

### 8.3 Phase 2 — cross-reference existing articles

For each template, cross-reference the existing article(s) Jacob has already shipped (MRI for procedure, Ozempic for drug, etc.) against the dominant sub-queries we found in Phase 1:

| article | dominant sub-queries from Phase 1 | covered in article? | gap |
|---|---|---|---|
| /cost/mri | MRI cost without insurance / MRI cost 2026 / outpatient vs hospital / Medicare rate / contrast vs no contrast | ✓ ✓ ✓ ✓ ✗ | Add contrast vs no-contrast section |

Score each existing article high / medium / low alignment. Where they're low, we know exactly what's missing.

### 8.4 Phase 3 — revise writer-agent prompt + re-probe

Update the writer-agent prompt to TARGET the dominant sub-queries per template. Generate 1 fresh article per template (or just generate the outline — we don't need full articles to test the formula). Re-probe to see if the new outline covers what Phase 1 said it should.

### 8.5 Phase 4 — iterate

Repeat 8.3-8.4. Stop when marginal gains plateau (3 rounds with no significant improvement in coverage).

### 8.6 The end-state asset

A **derived formula** in `specs/FANOUT_FORMULA.md`:

- Per template: the 6-8 dominant sub-query shapes a page must answer
- General formula for the daily blog: a meta-pattern that works across topics
- Variant-weighting per template (which fan-out variants matter most for procedure-cost vs Q&A vs glossary, etc.)
- Provider notes (e.g., "Gemini fans out wider than Claude — write for Gemini's max width")

This formula is the proprietary asset. Track B1 writer-agent rewrite consumes it directly.

### 8.7 Acknowledged limitation: Phase 1 is 1 topic per template

With only one topic per template in Phase 1, we can't fully separate **template effects** from **topic effects**. Phase 1 formulas will be "MRI-shaped, Ozempic-shaped, MAGI-shaped" — not yet "procedure-shaped, drug-shaped, glossary-shaped." Phase 2 adds a second topic per template (colonoscopy, Eliquis, premium-tax-credit, etc.) and only the patterns that hold across BOTH topics in a template become the formula. Budget for Phase 2 expansion: another ~$5.

---

## 9. Open questions for Jacob

Before we can start, decide:

### 9.1 API keys — ✅ confirmed in `.secrets/`

- `anthropic-api-key.txt` (Jacob has credits)
- `openai-api-key.txt` (Jacob to confirm credits)
- `gemini-api-key.txt` (free tier covers our volume)

### 9.1a Operational gotchas surfaced during pricing audit

1. **Anthropic web search must be enabled by the org admin** in the Claude Console before the probe script will work. Verify on `jacob@benefitsusa.org` org.
2. **OpenAI Responses API** sometimes returns `web_search_call` items without a `.action.query` field (~5-10% per docs). Handle nulls gracefully.
3. **Gemini grounding free tier is daily** (1,500 RPD). 243 probes fits — but don't batch with other grounding work the same day.
4. **Run all 3 providers at `temperature: 1.0`** to actually get variance across the 3 runs per prompt. Default temperatures often produce near-identical query sets.
5. **Anthropic web search errors aren't billed** (max_uses_exceeded, etc. are free). Retry-safe.

### 9.2 Where probe data lives

Bridge says `content/fanout/<slug>.json` lives inside the covered-usa repo. Pros: writer agents read it via filesystem, no separate service. Cons: it bloats the repo over time (~5KB per probed target × 500+ targets = 2.5MB; fine, but worth noting).

Alternative: Supabase table. Tradeoff is writer agents need API call instead of file read. Recommend **filesystem for now** — keeps the system simple and the repo size cost is tiny.

### 9.3 Initial target set choice

The 3-target test set above (MRI, blog post, Texas Medicaid) is my default. Want different targets? Specifically — the Texas Medicaid calibration depends on having BenefitsUSA's actual Bing CSV. Do you have access to that? Or do you want to skip the calibration data point until next month's Bing report?

### 9.4 Coverage threshold

Bridge suggested 0.70. That's a guess. Two ways to validate:
- **Cold:** ship at 0.70 and adjust based on what actually ranks
- **Warm:** score the 8 existing TOP CoveredUSA pages (the audit-positive ones), use their median score as the floor

Recommend warm — gives us a data-grounded threshold from day one.

### 9.5 Should AA2 score block the writer cron?

Two options:
- **Hard gate:** Stage 2 (cron) blocks if coverage < threshold. Forces revision.
- **Soft surface:** Stage 2 publishes, logs the score, alerts you if below threshold.

Bridge says hard gate. But: if calibration shows the proxy isn't predictive enough (overlap < 60% with Bing actuals), hard-gating on proxy data could block good articles. Recommend **soft surface for first 30 days** until we have calibration data, then promote to hard gate.

### 9.6 What about cluster representative status?

The framework's §2.4 (LIKELY-grade) says Bing dedups near-duplicate URLs and picks one cluster representative. Track AA today probes for sub-query COVERAGE but doesn't measure whether the URL we're optimizing IS the cluster representative for those sub-queries. Adding that would require an additional step: for each high-volume sub-query, check whether our URL appears in the top organic results.

Not in v1. Flagged as a v2 enhancement.

---

## 10. Execution order

Once Jacob answers §9:

1. Wire up API keys to `.secrets/`
2. Write `scripts/coveredusa-fanout-probe.js`, test on MRI target
3. Write `scripts/coveredusa-fanout-score.js`, score MRI article
4. Write `scripts/coveredusa-bing-ai-report-import.js` (only if we have a CSV ready)
5. Run the 3-target test plan
6. Ship Track AA. Move to Track B1.

Estimated effort: 2-3 hours of coding once API keys are in place.

---

## 11. Cross-references

- `specs/AI_OPTIMIZATION_FRAMEWORK.md` §2.1 (fan-out variants), §4.5 (FAQ length conflict resolution informed by fan-out coverage)
- `specs/PHASE_5_BRIDGE.md` §3 (empirical grounding data — first proxy validation reference), §8 (Track AA original spec), §10 decision 9 (foundation-first execution)
- `specs/CURRENT_STATE_AUDIT.md` §3 (cross-cutting decisions where AA output informs B1+C)
- `specs/LINK_TARGET_MANIFEST.md` (writer agents consume both link-index AND fanout JSON at write time)
- Cyrus Shepard's 54-study synthesis (the 9.3/10 correlation rank for fan-out coverage)
- Seer Interactive 87% Bing/ChatGPT overlap study (proxy validation expectation)

---

*This is the plan. Once §9 is answered, we ship in roughly an afternoon. Calibration improves over weeks.*
