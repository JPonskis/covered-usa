# Topic Research Phase — Handoff Document

**Date:** 2026-05-15
**Author:** Frank (previous session, before context compaction)
**Reader:** the next Claude Code session that picks up this work
**Status:** Plan approved by Jacob. Ready to execute. Bing Webmaster API key verified working.

---

## You're reading this because

The previous session ran out of context. You're picking up mid-execution of a Ralph-framework task: **build a ranked topic roadmap for each of CoveredUSA's 7 content templates**, so when bulk-publishing starts we know exactly what to write next with demand evidence backing every topic.

This doc has everything you need. Don't re-research what's already established. Read this end-to-end, then start Phase 2.

---

## 1. The immediate goal

**Goal:** Produce a verified, demand-ranked topic roadmap per template — `specs/topic-research/[template]-topics.csv` + `[template]-topics-rationale.md` — so when CoveredUSA's bulk-publish queue starts running, every article has demand evidence.

**Success criteria:**
- 7 ranked topic CSVs in `specs/topic-research/`, one per template (procedure, drug, persona, event, qa, glossary, ma-state)
- Each topic validated by ≥2 independent data sources
- Each list reviewed by an adversarial critic agent (Ralph adversarial verification mode)
- Each list cross-referenced against `specs/busa-inventory.csv` for BUSA-overlap flags
- Final master synthesis `specs/topic-research/TOPIC_ROADMAP.md` that ranks templates by ROI + recommends bulk-publish sequencing
- All artifacts committed + pushed

**Demand-driven, NO CAP on topic count.** Each template's list could be 30 or 500. Jacob explicitly said: "If 500 qualify, write 500. The goal is to win the space, not minimize." Demand threshold: ≥50 weekly Bing impressions OR top-100 in category by utilization OR ≥10 monthly Google searches with healthcare intent.

---

## 2. Where you are in the grand scheme

CoveredUSA is a healthcare-insurance content site optimized for AI-citation traffic (Bing Copilot, ChatGPT, Perplexity, Google AI Overviews). The system funnels traffic to a screener → broker partnership for revenue (Medicare/ACA leads, 40% commission split on closed sales) and to a bill analyzer (engagement; eventual monetization). Two on-ramps, one funnel — broker pays Jacob 40% of sales, not per-lead, which means lead QUALITY > volume.

### Where we've landed (everything shipped before you):

- **Track B1 (daily blog writer rewrite):** shipped 2026-05-14. Daily blog cron now produces formula-aligned content via the new writer + verifier at 3 articles/day. 51 blog articles live.
- **Track C MA-state writer rewrite:** shipped 2026-05-14 with Florida + NY/MI/OH/PA load test (5 new state pages). MA-state writer + verifier are the proven reference implementations.
- **Track C-prime (6 parallel template rewrites):** shipped 2026-05-15. 6 sessions wrote procedure/drug/persona/event/qa/glossary writers + verifiers + 5 test articles per template (30 new pages). Audit complete, 3 critical fixes applied:
  1. ctaTarget=analyzer added to procedure + drug writers + 16 article JSONs backfilled
  2. Glossary-verifier `gates_failed` shape canonicalized to object array
  3. Procedure + drug writer prompts now explicit on STEP 4 ctaTarget enforcement
- **IndexNow backfill:** 114 CoveredUSA URLs submitted (api.indexnow.org + bing.com/indexnow both 200 OK). Found + fixed a latent bug where `/api/indexnow` route was serving an unverified key; now serves the verified `32f9a841...` key.
- **BUSA inventory CSV:** 2,111 URLs (1024 EN + 985 ES + ~100 utility) catalogued + topic-bucketed at `specs/busa-inventory.csv`. Script at `scripts/busa-inventory.js` for re-runs.

### Current live page count on coveredusa.org: ~91 pages
- 51 blog (daily blog cron, autonomous)
- 8 MA-state (CA, TX, WY pre-formula + FL, NY, MI, OH, PA formula-aligned)
- 8 procedure (mri, ct-scan, colonoscopy + 5 new)
- 8 drug (ozempic, metformin, insulin + 5 new)
- 7 persona (gig-workers, self-employed + 5 new)
- 8 event (turning-26, turning-65, lost-job + 5 new)
- 8 Q&A (rehab, dental, vision + 5 new)
- 8 glossary (magi, deductible, oop-max + 5 new)
- ~9 hardcoded routes (root, screener, analyzer, about, lighthouse pages)

### What comes AFTER you finish topic research (the next 30 days):

1. **Bulk content production** (Track D scaled). Spawn writer subagents per template using the topic roadmap you produce. NO CAP. Demand-driven volume. Cost is essentially free (Jacob on Claude monthly plan). Constraint is monitoring + Claude usage windows.
2. **Drip-publish cron** (NEW infrastructure to build). Bulk-produced content sits in a queue; drip-cron releases N articles/day (target 10-25/day) so Bing/Google don't see a publishing spike. Stage 2 cron picks up + IndexNow-submits everything. Separate from but parallel to the daily blog cron.
3. **Sitemap auto-updates** at Vercel build time — already handled. New articles auto-listed.
4. **IndexNow on everything** — Stage 2 cron handles `--today` flag for daily blog. The drip cron needs to also call IndexNow for its drips. New script needed.
5. **Track D state factory:** 51 Medicaid state pages at `/medicaid-income-limits/[state]` (new dynamic route + new template + 51 state pages with household-size income tables using state-program brands). This is the highest-ROI content investment per FANOUT_FORMULA §5.1.
6. **Track E (regen existing pages):** Run the 56 pre-formula pages through the new writers + verifiers. Special focus: glossary downsizing (magi/deductible/oop-max are 1,500-1,700 words; target ≤500).
7. **Track F (BenefitsUSA optimization):** Apply the formula + writer pattern to BUSA. Intent split (BUSA = application/how-to-apply; CoveredUSA = eligibility/shopping). Rewrite BUSA's underperforming health-insurance content (306 articles overlap CoveredUSA territory). LAST — fragile asset, never URL changes.

After Track D + E: ~206 pages live. After Track F + 60-90 days of drip-publish: 500+ pages. After 12 months with state×topic permutation factories: 1,500+ pages potentially.

---

## 3. The plan you're executing — Phase 2 onward

Phase 1 (data sources + API verification) is DONE. You start at Phase 2.

### Phase 2 — Spawn 21 parallel research agents (2 researchers + 1 critic per template × 7 templates)

For EACH of the 7 templates, spawn 3 agents in parallel:

#### Agent A: data-driven researcher

**Prompt template:**

```
You are the data-driven topic researcher for the CoveredUSA <TEMPLATE> template.

Goal: produce a comprehensive ranked list of topics this template should cover,
backed by quantitative demand data. NO CAP on count. If 500 topics meet threshold,
list 500. Jacob is trying to win the AI-citation space; volume is not a constraint.

## Read first

1. /Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/HANDOFF.md (this doc)
2. /Users/jacobposner/clawd/projects/covered-usa/specs/FANOUT_FORMULA.md §3 + §4.<X for your template>
3. /Users/jacobposner/clawd/projects/covered-usa/specs/research/competitor-landscape.md (template-specific competition)
4. /Users/jacobposner/clawd/projects/covered-usa/specs/research/bing-webmaster-api.md (your primary data source documentation)
5. /Users/jacobposner/clawd/projects/covered-usa/specs/busa-inventory.csv (BUSA overlap reference)
6. /Users/jacobposner/clawd/projects/covered-usa/specs/CONTENT_INVENTORY.md (existing CoveredUSA inventory; don't propose dupes)

## Data sources (use ≥2 per topic)

PRIMARY:
- Bing Webmaster API at https://ssl.bing.com/webmaster/api.svc/json/<Method>?apikey=<KEY>
  - Key location: /Users/jacobposner/clawd/.secrets/bing-webmaster-api-key.txt
  - Methods you need: GetKeyword (single keyword volume), GetKeywordStats (weekly history), GetRelatedKeywords (related queries with impression counts)
  - Note: language parameter must be 'en-US' (capital US, not 'en-us')
  - Country: 'us'
  - GetRelatedKeywords is the MVP — give it seed queries and it returns Bing's "related keyword" universe with broad + strict impression counts

SECONDARY (template-specific public data):
- Procedure: ClinCalc + AHRQ NAMCS (top procedures by utilization)
- Drug: ClinCalc Top 300 Most-Prescribed Drugs (yearly, free)
- Q&A: Google "People Also Ask" data via WebSearch on seed queries
- Event: CMS qualifying-life-event canonical list + state-extension laws
- Persona: BLS occupation tables + Census demographic categories
- Glossary: Cross-reference Investopedia + Healthcare.gov + KFF + GoodRx glossary inventories
- MA-state: CMS Medicare enrollee population per state (state already capped at 51)

TERTIARY (fallback):
- Google Keyword Planner via Google Ads API (Jacob's OAuth at .secrets/google-token.json)
- WebSearch via Claude for "top healthcare questions about X"
- Reddit / forum scrape for organic question patterns

## Demand threshold (any topic that meets one of these qualifies)

- ≥50 weekly Bing impressions (broad match via GetRelatedKeywords)
- Top-100 in its category by utilization (drug prescription volume, procedure volume, etc.)
- ≥10 monthly Google searches with healthcare intent
- High-signal qualitative evidence (e.g., Reddit thread with 500+ upvotes asking the question)

## Cross-reference rules

- Skip topics already shipped on CoveredUSA (check CONTENT_INVENTORY.md)
- Flag overlap with BUSA via busa-inventory.csv:
  - "heavy" if exact title match or very-similar phrasing
  - "slight" if same topic but different angle (BUSA = application intent, this = eligibility intent — that's OK, list it as "slight")
  - "none" if BUSA doesn't touch it
- Heavy-overlap topics get a demand premium of 0 (skip); slight-overlap is normal; none-overlap gets a +20% bonus.

## Output spec

Write to `specs/topic-research/<TEMPLATE>-topics-a.csv` (the "a" suffix indicates Agent A).

Columns:
- topic — slug-friendly identifier (lowercase, hyphens)
- title_hint — proposed article title (year-anchored 2026 where applicable)
- demand_score — composite (bing_weekly_impressions × 1.0 + google_monthly_volume × 0.5 + utilization_rank_score × 0.3)
- bing_impressions_weekly — from GetKeywordStats or GetRelatedKeywords (broad match)
- google_monthly_volume — from Keyword Planner or WebSearch evidence
- utilization_rank — for procedure/drug; null for others
- busa_overlap — none | slight | heavy
- competitor_density — low | medium | high (per competitor-landscape.md)
- state_specific — y | n (if y, forks into a 51-page state factory)
- priority — 1 | 2 | 3 (you assign; 1 = write next, 3 = long-tail)
- sources — comma-separated list of validation sources

Also write a rationale doc: `specs/topic-research/<TEMPLATE>-topics-a-rationale.md` covering:
- Methodology used
- Demand cutoffs applied
- Topics deliberately excluded and why
- Top-5 highest-confidence topics (your strongest recommendations)
- Surprises (counterintuitive high-demand topics you wouldn't have guessed)

Time budget: 20-30 min. Be thorough. Win-the-space framing throughout.
```

#### Agent B: coverage + intuition researcher

**Prompt template:**

```
You are the coverage-and-intuition topic researcher for the CoveredUSA <TEMPLATE> template.

Same goal as Agent A: comprehensive ranked topic list, NO CAP. But your approach is
different. You optimize for:
- Coverage breadth (don't miss obvious topics)
- Competitor enumeration (what topics do GoodRx / NerdWallet / Healthline / KFF have?)
- Real-user question patterns (WebSearch for organic question lists)
- Manual brainstorm (the "obvious 50" everyone would expect on this template)

## Read first (same as Agent A)

[same list — HANDOFF.md, FANOUT_FORMULA, competitor-landscape, busa-inventory, CONTENT_INVENTORY]

## Approach

1. **Enumerate competitors' coverage.** WebSearch for "GoodRx <topic>" / "NerdWallet <topic>" / "Healthline <topic>" / "KFF <topic>" — what pages/articles do they have on this template's surface? List them.
2. **Brainstorm the obvious.** What are the 30-50 "no-brainer" topics anyone building this template would include? Don't be data-driven — be obvious-driven.
3. **Cross-reference user question patterns.** WebSearch for "<template-keyword> reddit" / "<template-keyword> questions people ask" — find organic intent.
4. **State variants.** For any topic that has a state-specific variant, flag state_specific=y.

## Output spec

Same as Agent A but write to `<TEMPLATE>-topics-b.csv` + `<TEMPLATE>-topics-b-rationale.md`.

The CSV may have fewer demand metrics (you don't have Agent A's Bing API focus) but
should have stronger competitor_enumeration_source + manual_brainstorm_score fields.

You can omit bing_impressions_weekly and google_monthly_volume if you can't easily get them.
The merge step (Phase 4) will fill those in from Agent A's data.

Time budget: 20-30 min.
```

#### Agent C: adversarial critic

**Prompt template (spawned AFTER A + B return):**

```
You are the ruthless adversarial critic for the CoveredUSA <TEMPLATE> topic list.

Read both researcher outputs:
- specs/topic-research/<TEMPLATE>-topics-a.csv (data-driven)
- specs/topic-research/<TEMPLATE>-topics-b.csv (coverage + intuition)
- Their rationale docs (-a-rationale.md and -b-rationale.md)

Your job: find every flaw. Be brutal. Specifically check:
1. **Missing topics.** What MAJOR topics are absent from both lists that any reasonable
   <TEMPLATE> roadmap would include?
2. **Bad demand justifications.** Where is "demand_score" set high but the underlying
   data doesn't support it?
3. **Mis-flagged BUSA overlap.** Where did A or B mark "none" when busa-inventory.csv
   shows a clear match? Where did they mark "heavy" when it's actually slight?
4. **Conflict between A and B.** Where do A and B disagree on the same topic's
   priority or demand? Adjudicate.
5. **Competitor blind spots.** What topics does the competitor-landscape doc imply
   we should cover but neither list includes?
6. **Year-anchor drift.** Does any title_hint use a non-2026 year or omit a year
   where one is needed?
7. **State-specific underflagging.** Did either list miss a topic that has 51 state
   variants (e.g., "[state] Medicaid eligibility" treated as one topic instead of 51)?

Output: `specs/topic-research/<TEMPLATE>-topics-critique.md` with:
- Top 5 missing topics (with demand evidence to back the addition)
- Top 5 demand-score corrections (with primary source citing)
- Top 5 BUSA-overlap corrections
- 3-5 surprising findings (where A and B both missed something or both overshot)
- Verdict: how confident are you that the merged A+B+critique list is comprehensive?

Time budget: 15-20 min.
```

### Spawn order

Spawn all 14 researchers (2 per template × 7 templates) IN A SINGLE MESSAGE. They run in parallel. Wall-clock for the batch: ~25-30 min.

Then once all 14 return, spawn 7 critics in parallel. Wall-clock: ~15-20 min.

### Phase 3 — Critic iteration loop (per template)

Per Ralph adversarial mode: after critic returns, the original researcher (or a fresh one) addresses each critique. Iterate until critic has zero substantive findings.

In practice this usually means: read critique → apply additions/corrections to merged A+B list → re-run critic → confirm clean.

Budget 1-2 iterations per template max. If a template is taking 3+ iterations, surface to Jacob — it means the topic landscape is genuinely contested or fuzzy and needs human judgment.

### Phase 4 — Synthesis per template

For each template, you (the manager) merge:
- A's CSV (data-driven, has best demand numbers)
- B's CSV (coverage-driven, has best obvious-topic enumeration)
- Critic's additions + corrections

Dedupe by `topic` slug. Where A and B both list the same topic, take the highest demand_score and merge all source citations. Apply critic's BUSA-overlap corrections.

Output: `specs/topic-research/<TEMPLATE>-topics.csv` (the canonical merged file).

### Phase 5 — Master TOPIC_ROADMAP.md

Synthesize the 7 template files into `specs/topic-research/TOPIC_ROADMAP.md`:

- **Per-template summary:** total topics qualifying, top-10 priority, demand surface size
- **Cross-template ranking by ROI:** sum of demand × monetization weight × competitive feasibility. Monetization weights per master brief §8.4:
  - Screener funnel (broker leads): persona, event, qa-coverage, ma-state, medicaid-factory, glossary — high weight (1.0)
  - Analyzer funnel: procedure, drug, cost-q&a, cost-glossary — medium weight (0.5, until analyzer monetization path is built)
- **Bulk-publish sequencing recommendation:** which template ships first based on ROI score
- **Estimated final page count:** sum of all topic counts. Compare to master brief §8.5's "moonshot" math (~500 at 6mo, 1,500+ at 12mo)
- **Cross-template conflicts:** topics that could be a Q&A or a glossary entry (which template wins?) — flag for Jacob's call
- **State-variant expansion:** topics where each state needs a separate page (e.g., "[state] Medicaid income limits" → 51 pages). Multiply demand × 51 for state-variant topics in the total page count.

### Phase 6 — Commit + push + report back

Commit + push all artifacts. Report to Jacob with:
- Total topics qualifying across all templates
- Per-template top-10 priority topics (the "next-articles" list)
- Recommended bulk-publish sequencing
- Any surprises (templates that have way more or way less demand than expected)

---

## 4. Critical context — strategic decisions made in the previous session

### 4.1 Dual-funnel monetization model

CoveredUSA has TWO user tools, both feeding the broker partnership:

- **`/screener`** (revenue path) — eligibility screener. Completed screeners route to broker for Medicare/ACA enrollment. Jacob earns 40% of closed sale commission ($120-280 per Medicare enrollment first year).
- **`/medical-bill-analyzer`** (engagement + secondary path) — analyzes bills, identifies coding errors, computes FPL%, surfaces program eligibility. Hands off to `/screener` post-analysis with bill data pre-filled.

Both tools eventually feed the same broker. The analyzer is the value-build + trust step; the screener is the conversion step.

**ctaTarget on each template** (per master brief §8.4):
- Screener: ma-state, persona, event, qa coverage + state-eligibility, glossary coverage terms, blog eligibility articles, Medicaid factory (NEW Track D)
- Analyzer: procedure, drug, cost q&a, glossary cost terms, blog cost articles

**Heuristic:** "Any page citing a dollar amount > $50 → analyzer unless the question is fundamentally who-qualifies."

### 4.2 BUSA cannibalization model (intent-split)

BenefitsUSA (BUSA) is a separate site with 2,111 URLs (966 EN blog + 928 ES blog + ~200 utility/state pages). Of those, ~306 articles overlap with CoveredUSA's health-insurance territory.

**Intent split (Jacob's call, locked):**
- **BUSA territory:** application / how-to-apply intent. "How to apply for Medicare", "Healthcare.gov walkthrough", "Medicaid application by state".
- **CoveredUSA territory:** eligibility / shopping / decision intent. "Do I qualify for X", "Best plan comparison", "[State] [Program] income limits".

For each CoveredUSA topic being considered: glance at `specs/busa-inventory.csv` for obvious dupes. If BUSA has an exact dupe, skip on CoveredUSA. If slight overlap by intent split, both can exist — formula structure makes the CoveredUSA version different enough.

**Topic distribution in BUSA inventory:**
- Medicaid: 378 articles (biggest overlap battlefield)
- ACA: 215 (moderate overlap; intent split handles it)
- Medicare: 25 (small overlap; CoveredUSA can expand aggressively)
- Cost/Bills: 8 (CoveredUSA territory — virtually uncontested)
- SNAP/WIC/SSDI/Housing/TANF: 800+ combined (BUSA-only; leave alone)

### 4.3 The formula is the proprietary asset

The FANOUT_FORMULA (5 universal rules + per-template recipes) was empirically derived from Bing AI grounding query data (281 LLM probes + BenefitsUSA real-Bing cross-check). It's the playbook for what shapes AI engines actually cite.

5 universal rules:
1. State-context-everywhere (when state is in scope; use program brand names like Medi-Cal/AHCCCS)
2. Eligibility household-size table (when income gates eligibility; exactly 9 rows: sizes 1-8 + each-additional)
3. How-to-apply section (numbered steps + .gov URL + documents checklist + denial reasons callout)
4. Year markers (2026 + 2027 in title/H1/meta/every numeric callout; never bare $X without a year)
5. Authoritative source narrowing (≥3 inline .gov/.edu/kff.org citations)

8 STEP-6 hard-reject GATES enforced by every writer:
- GATE A: slug must NOT contain a year
- GATE B: 9-row household-size table when income-gated; N/A otherwise
- GATE C: ≥3 inline .gov citations
- GATE D: zero `--` (auto-fix via verifier)
- GATE E-H: template-specific (see each writer prompt)

### 4.4 Subagent cache caveat (important for understanding past audit findings)

Agent definitions are loaded at SESSION-START time, not at subagent-spawn time. If you start a new conversation/session, you load the LATEST writer/verifier prompts from disk. But within a single long-running session, spawned subagents use the agent definitions from when YOUR session started.

**Practical implication for you:** if you spawn `coveredusa-procedure-writer` in this session, it should load the current (post-Track-C-prime + 3 critical patches) version from disk. But test it once at start to verify — spawn a diagnostic prompt asking the agent to introspect its own prompt and confirm it has the Track C-prime structure (STEP 6 with 8 GATES, $HOME paths, ctaTarget enforcement).

The audit found that the previous session's spawned subagents had STALE cached prompts (from before Track C-prime committed). This is why Glossary's parallel session hand-wrote test articles instead of spawning the writer — the writer subagent in that session had the OLD prompt cached.

**For YOU specifically:** the topic research phase doesn't spawn writer subagents — only general-purpose research subagents. The cache caveat is mainly informational. But if you later move into bulk content production (after this phase), you'll want to verify writer subagents are loading current prompts.

---

## 5. The full SEO plan — what comes after this topic research phase

### Sequence:

1. **This phase: topic research per template** (~2-3 hours wall-clock; 21 agents) — produces the ranked content roadmap.
2. **Bulk content production** — spawn writer subagents per template using the topic roadmap as the queue. Demand-driven volumes (could be 50-500 articles per template). Constraint = Claude usage windows + monitoring time, not infrastructure cost.
3. **Drip-publish cron** (NEW infrastructure) — separate cron from the daily blog cron. Pulls from the topic-research output, releases 10-25 articles/day to avoid publishing-spike penalties. Stage 2 cron picks up + IndexNow-submits.
4. **Track D: Medicaid state factory** — new `/medicaid-income-limits/[state]` route + 51 state pages with household-size income tables using state-program brands. Highest-ROI content investment per FANOUT_FORMULA §5.1.
5. **Track E: regen existing pages** — run the 56 pre-formula pages through the new writers + verifiers. Includes glossary downsizing (magi/deductible/oop-max from 1500-1700 words to ≤500).
6. **Track F: BenefitsUSA optimization** — apply formula + writer pattern to BUSA. Rewrite the 306 health-insurance-overlap articles to AI-optimization standard. LAST track — BUSA is fragile, never URL changes.

### Cron architecture (current + needed):

**Existing crons (verified):**
- Stage 1 (daily blog cron): runs 0 13 * * * UTC (6am PDT). Selects 5 screener + 5 analyzer articles from Google Sheets queue → spawns writer + verifier → updates sheet status (Written / Needs Review / Held).
- Stage 2 (daily deploy cron): runs 0 14 * * * UTC. `git add -A && git push` for today's articles → waits 60s for Vercel → submits today's URLs to IndexNow via `coveredusa-indexnow-submit.js --today`.

**New cron needed (post-topic-research):**
- Stage 1 drip-publish cron: runs daily. Reads from topic-research output. Selects N topics from priority queue. Spawns writer + verifier per topic. Commits to repo.
- Stage 2 drip-publish IndexNow: runs N hours later. Submits new URLs to IndexNow. Same pattern as daily blog Stage 2.

**Note:** the existing IndexNow submit script (`scripts/coveredusa-indexnow-submit.js`) uses the verified key `32f9a841...`. The route at `/api/indexnow` was patched in commit `f125054` to also use this verified key. Don't introduce a different key.

### IndexNow status:

114 URLs (current full inventory) submitted via backfill on 2026-05-15. Daily cron handles fresh articles. Drip-publish needs its own IndexNow submission step.

### Sitemap status:

`src/app/sitemap.ts` auto-includes every URL from every template's `getAllXSlugs()` loader. Every new article auto-appears in the sitemap at next Vercel build. No manual sitemap maintenance needed.

---

## 6. Files + references you need

### Strategic docs (read for context):

| File | Purpose |
|---|---|
| `specs/FANOUT_FORMULA.md` | THE playbook — universal rules + per-template recipes |
| `specs/TRACK_C_PARALLEL_PLAN.md` v1.3 | Master brief for Track C-prime; includes §8.4 monetization, §8.4.5 analyzer-screener handoff, §8.5 page count math |
| `specs/research/competitor-landscape.md` | Per-template competitor scorecard |
| `specs/research/bing-webmaster-api.md` | API documentation — your primary data source |
| `specs/research/copilot-citation-mechanics.md` | Bing AI citation mechanics (background) |
| `specs/CONTENT_INVENTORY.md` | Auto-generated CoveredUSA inventory + 420-row Google Sheets queue |
| `specs/busa-inventory.csv` | BUSA URL inventory (2,111 rows) for cross-reference |
| `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_b1_blog_writer_shipped.md` | B1 lessons learned (4 GATES, "STOP. Read this twice." framing) |
| `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_track_c_*_writer_shipped.md` | One memory file per Track C-prime template session |

### Reference implementations (the proven writers + verifiers):

| File | Purpose |
|---|---|
| `.claude/agents/coveredusa-article-writer.md` | B1 daily blog writer (Track B1) |
| `.claude/agents/coveredusa-article-verifier.md` | Daily blog verifier (Track C-prime updated) |
| `.claude/agents/coveredusa-ma-state-writer.md` | MA-state writer (gold standard reference) |
| `.claude/agents/coveredusa-ma-state-verifier.md` | MA-state verifier (gold standard reference) |
| `.claude/agents/coveredusa-{procedure,drug,persona,event,qa,glossary}-writer.md` | 6 Track C-prime template writers |
| `.claude/agents/coveredusa-{procedure,drug,persona,event,qa,glossary}-verifier.md` | 6 Track C-prime template verifiers |

### Cron job definitions:

| File | Purpose |
|---|---|
| `.claude/claudeclaw/jobs/coveredusa-seo-stage1.md` | Daily blog Stage 1 cron — has held-queue + Telegram routing wired in |
| `.claude/claudeclaw/jobs/coveredusa-seo-stage2.md` | Daily blog Stage 2 cron — git push + IndexNow `--today` |

### Scripts (deployable + already working):

| File | Purpose |
|---|---|
| `scripts/coveredusa-indexnow-submit.js` | Lives on frankthebot Mac mini. Uses verified key `32f9a841...`. Daily cron calls with `--today` flag. |
| `scripts/coveredusa-select-articles.js` | Daily blog Stage 1 selector — picks articles from Google Sheets queue |
| `scripts/busa-inventory.js` | Refreshes BUSA URL inventory from live sitemap (you can re-run anytime) |
| `scripts/validate-{procedures,drugs,personas,events,qa,glossary,medicare-advantage}.js` | Validators per template |

### Secrets (locations on disk):

| File | Purpose |
|---|---|
| `.secrets/bing-webmaster-api-key.txt` | **Bing Webmaster API key — your primary data source** (32 chars; verified working) |
| `.secrets/google-token.json` | Google APIs OAuth (Gmail, Calendar, Drive, Sheets) |
| `.secrets/google-token-gsc.json` | Google Search Console OAuth (use sparingly; CoveredUSA barely ranks in Google per Jacob) |
| `.secrets/google-service-account.json` | Service account for Sheets reads (the daily blog cron uses this) |
| `.secrets/anthropic-api-key.txt` | (for reference; Claude is already this session's runtime) |

### Verified Bing Webmaster API endpoints (sanity-checked 2026-05-15):

```bash
KEY=$(cat /Users/jacobposner/clawd/.secrets/bing-webmaster-api-key.txt)
# GetUserSites — confirms key works
curl -s "https://ssl.bing.com/webmaster/api.svc/json/GetUserSites?apikey=$KEY"
# Both benefitsusa.org + coveredusa.org returned IsVerified:true
```

For keyword research, use language='en-US' (capital US). The previous session's test used 'en-us' lowercase and got an error.

---

## 7. Lessons learned (from prior sessions in this conversation)

These are real things that bit us. Don't repeat them.

1. **Subagent cache.** Already covered in §4.4. If you spawn `coveredusa-X-writer` in a session that pre-dates the latest prompt commit, you get the old prompt. Restart the session or verify via diagnostic introspection.

2. **GATE D auto-fix is mandatory, not advisory.** The verifier prompts initially treated `--` (double-hyphen) as Category J informational. Result: Ohio MA-state shipped with 11 unfixed `--` instances. Fix: GATE D framing is "AUTO-FIX MANDATORY", not "auto-fix as style correction." This patch was applied in commit `ae6c9c9` after the load test caught it.

3. **PRDs added later don't reach earlier sessions.** Procedure + drug writers shipped without ctaTarget enforcement because master brief §8.4 (dual-funnel) was added after those parallel sessions kicked off. They faithfully followed their PRDs which didn't have the rule yet. Patched after audit.

4. **Verifier-side checks miss what writer claims pass.** Writer-leaks pattern: writer self-reports "all gates pass" but verifier finds otherwise. Example: PA + MI MA-state shipped with `detailSections.length=3` (need ≥4); writer claimed gates pass. Verifier should run strict programmatic checks (`JSON.parse(file).<field>.length`), not trust writer self-report.

5. **JSON shape consistency matters for cron parsing.** Glossary-verifier originally emitted `gates_failed: ["e"]` (flat string array) while 6 other verifiers used `gates_failed: [{gate, reason}]` (object array). Stage 1 cron parses this structurally — inconsistent shape breaks it.

6. **CTA target affects revenue routing.** ctaTarget=analyzer routes to bill analyzer (engagement); ctaTarget=screener routes to broker (revenue). Cost-focused content (procedure/drug) defaults to analyzer (intent match); coverage-focused content (persona/event/qa/glossary) defaults to screener (revenue path). Don't mix these up.

7. **Don't migrate URL slugs.** Jacob has tanked pages this way before. New rules apply to new content only. Existing slugs are sacred.

8. **Bing AI-citation traffic is what we optimize for, not Google PageRank.** CoveredUSA barely ranks in Google per Jacob. Google Search Console data is low-signal. Bing Webmaster Tools is high-signal. This is why the formula was derived from Bing data + why your topic research should prioritize Bing API over Google KP.

9. **40% commission on sales, not per-lead.** Jacob's broker partnership pays 40% of closed sale commissions ($120-280 per Medicare first-year). This means LEAD QUALITY matters more than VOLUME. Don't optimize for click-through alone — optimize for self-qualified intent (which the screener enforces).

10. **Win-the-space framing.** Jacob explicitly said: "If 500 topics qualify, write 500. Not 50. Volume is not a constraint." Don't artificially cap. The agent cost is essentially free (Claude monthly plan). Only constraint is Claude usage windows + monitoring time.

---

## 8. How to start

When you read this doc, the user will likely say "execute the plan" or "start Phase 2" or similar.

**Your immediate action:**

1. Read this entire doc carefully.
2. Read FANOUT_FORMULA.md §4.1 through §4.8 (one section per template).
3. Read competitor-landscape.md (per-template competitor mapping).
4. Read 1-2 reference writer prompts (ma-state-writer is the gold standard) to understand what the templates look like.
5. Read busa-inventory.csv first 20 rows to understand the cross-reference format.
6. Sanity-test the Bing Webmaster API key with `GetUserSites` (the curl example in §6 above).
7. Spawn 14 research agents in parallel (2 per template × 7 templates). Use Agent tool with `run_in_background: true`. Send all 14 in a single message.
8. Wait for all 14 to return.
9. Spawn 7 critic agents in parallel.
10. Iterate per template until critics return clean.
11. Synthesize per template + write master TOPIC_ROADMAP.md.
12. Commit + push.
13. Report back to Jacob with: total topics, per-template top-10, recommended sequencing.

If you hit Claude usage limits mid-phase: pause, surface to Jacob. Don't half-do things.

If something doesn't work that you expected to work: surface it, don't guess. The previous session learned the subagent-cache thing the hard way; explicit verification beats trial-and-error.

If Jacob asks why you're doing something: it's all in this doc. Reference §X.Y for specifics.

---

## 9. The end-state vision (so you understand what you're building toward)

After the full SEO plan finishes (topic research → bulk production → drip cron → Track D → Track E → Track F):

- **CoveredUSA:** ~500-1,500+ pages live, all formula-aligned. Daily blog cron continues at 3/day. State factory active. Drip-publish cron releasing 10-25/day from the topic-research queue.
- **BenefitsUSA:** ~2,500 pages (post-Track-F refresh), intent-split with CoveredUSA. Underperforming health-insurance articles rewritten to formula. Application/how-to-apply territory.
- **Both sites feed the same broker funnel.** CoveredUSA owns eligibility/shopping decisions; BUSA owns application/action steps. Cross-linked aggressively.
- **AI-citation organic traffic dominant.** Bing Copilot + ChatGPT + Perplexity + Google AI Overviews surface CoveredUSA/BUSA as canonical sources for healthcare-insurance lookups.
- **Revenue:** $10-100K/month achievable at scale through broker commissions, depending on funnel conversion. Per master brief §8.4 + memory:project_benefitsusa_status_april2026.md — Medicare avg $694/enrollment, ACA $240-360/year per enrollment, Jacob's cut is 40%.

The topic research phase you're about to execute is the input to this whole machine. Get it right.

---

*Handoff complete. Read this end-to-end before doing anything. The plan is locked. Jacob approved on 2026-05-15.*
