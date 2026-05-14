# CoveredUSA Content-Prioritization Scoring Framework

Author: Frank (research compiled 2026-05-13)
Status: Proposal — pending weight calibration after first 50 articles ship

---

## TL;DR

**Proposed formula (normalized 0–100 final score):**

```
score = 0.22 · norm(bing_traffic_potential)
      + 0.20 · ai_citation_fit
      + 0.15 · inverse_kd_relative_to_us
      + 0.18 · commercial_intent
      + 0.10 · template_fit
      + 0.05 · freshness_window
      - 0.07 · benefitsusa_cannibalization
      - 0.03 · production_cost
```
All inputs are min-max normalized to [0,1] before weighting. Weights sum to 1.00 on the positive side (0.90) plus -0.10 of penalties, deliberately so that penalties can drop a borderline candidate below the publish threshold without erasing strong upside.

**Five-bullet reasoning:**
1. **Bing traffic potential beats raw search volume.** Ahrefs documents traffic-potential as the traffic the #1 page actually captures from a parent topic — accounts for long-tail spread that programmatic templates are designed to harvest.
2. **AI citation fit is now first-class.** Bing's AI Performance report (Feb 2026 public preview) makes Copilot citations measurable; ranking factor research from Cyrus Shepard and Aleyda Solís converges on URL accessibility, fan-out rank, query-answer match, and AI-ready structure as the dominant levers.
3. **Inverse KD must be *relative to our domain*, not absolute.** Both Ahrefs (backlink-weighted average of top-10 referring domains, log scale) and Semrush (median referring-domains plus 100+ params) score difficulty for "the average site." CoveredUSA is new — we need to bias toward KD ≤ 25.
4. **Commercial intent ties scoring to the funnel.** Two surfaces convert: `/screener` and `/medical-bill-analyzer`. Topics that route to one of those deserve a thumb on the scale; pure-informational topics do not.
5. **Penalties stay small but matter at the margin.** Cannibalization with benefitsusa.org is a real risk (semantic flux across linked domains, per Pi Datametrics). Production cost is a thumb on the scale, not a veto — vetoes happen at the hard-filter stage.

---

## 1. SEO platform scoring frameworks

This section catalogs how the major SEO tools score keywords. Where the math isn't published, it says so.

### Ahrefs

- **Keyword Difficulty (KD):** Weighted average of *referring domains* to the top-10 ranking pages, plotted on a 0–100 logarithmic scale. Each KD value corresponds to an approximate number of referring domains a page would need to reach page 1. Intentionally ignores on-page signals — Ahrefs' position is that backlinks are the only easily measurable confirmed ranking factor.
- **Traffic Potential (TP):** Estimated organic traffic of the page currently ranking #1 for the parent topic, summed across every keyword that page also ranks for in the top 100. Calculated from rank × volume × estimated CTR. *This is the single most useful "is this topic worth writing" metric in the industry.*
- **Parent Topic:** Highest-volume keyword whose top-3 results overlap with the target keyword's top-3 — used to cluster variants under one canonical page.
- **Click %:** Share of searches that result in any organic click. Lets you discount zero-click keywords (definitions Google answers directly).

### Semrush

- **Keyword Difficulty (KD%):** 0–100% score. Relaunched spring 2021. Three steps: (1) SERP analysis — *median* referring domains across top-10 and *median* follow/nofollow ratio (median, not mean, to dampen outliers); (2) keyword analysis — volume, word count, SERP features, branded vs. non-branded, weighted by impact on rankings; (3) regional weighting. Trained on 100,000+ keywords with 100+ parameters analyzed for correlation; final model uses the highest-correlating subset. Exact weights are proprietary.
- **Personal Keyword Difficulty (PKD):** Same as KD but adjusted for the user's domain authority. Useful conceptual model — we should mimic this by computing `kd_relative = max(0, kd_absolute - covered_usa_authority_proxy)`.
- **Topic Authority:** Proprietary site-level score combining topical relevance and link profile. Math not public.

### Moz

- **Keyword Difficulty:** 1–100, derived from Page Authority of URLs currently ranking on page 1. Proprietary blend.
- **Page Authority / Domain Authority:** Machine-learned models trained to best-fit a site's appearance in search. 40+ signals; exact features and weights not public. Updated 2019 to use a logistic regression / ML approach instead of the original hand-tuned formula.
- **Priority score:** Weighted blend of difficulty and opportunity (volume × CTR potential). The conceptual closest match to what we're building.

### Surfer SEO

- **Content Score (0–100):** Heavy on main-keyword usage, partial keywords, NLP terms, True Density, position of terms in content (title/H1/early paragraphs weighted higher), heading structure, and content length vs. SERP median. Reported ~26% correlation with actual rankings.
- **AI Search Score:** Newer sub-metric covering structure for AI visibility — direct answers, citation-friendly phrasing, schema.

### Clearscope

- **Content Grade (A+ to D):** Semantic-coverage based. Each recommended term has a relevance grade; the overall grade weights how thoroughly you cover them. Reported ~17.5% correlation with rankings (lower than Surfer per the same comparison studies).

### MarketMuse

- **Content Score (0–100):** 50 model topics × 2 points per topic = 100. One point per mention up to a cap of 2 per topic — explicit anti-gaming design (no benefit to repeating a term).
- **Topical Authority:** Site-level score derived from how comprehensively the site covers a topic cluster. Proprietary math.
- **Target Content Score:** Suggested optimization level, derived from word count and keyword coverage relative to top SERP competitors.

### Frase / Mangools / Others

- **Frase SEO Score:** Term-frequency + topic coverage against SERP competitors. Exact formula not public.
- **Mangools (KWFinder) SEO Difficulty:** 0–100, based on link profile and authority of top-10 results. Closest in spirit to Ahrefs KD. Proprietary blend.

### Summary

| Tool | KD scale | Primary inputs | Public formula? |
|---|---|---|---|
| Ahrefs | 0–100 log | Referring domains (top-10, weighted avg) | Conceptual yes, exact no |
| Semrush | 0–100% | 100+ params; median RD top-10 | No |
| Moz | 1–100 | PA of top-10 + 40 signals | No |
| Surfer | 0–100 | On-page NLP terms, structure | No |
| Clearscope | A+→D | Semantic coverage + relevance | No |
| MarketMuse | 0–100 | 50 model topics × 2 points | Yes (formula published) |

**Takeaway for CoveredUSA:** No vendor publishes the full math. We need our own scoring framework anyway because (a) we optimize for Bing, not Google, and (b) we need AI-citation fit as a top-3 input — none of the above expose that directly except Surfer's AI Search Score sub-component.

---

## 2. AI-citation scoring (emerging models)

This is the newer, weaker-evidence half. Several frameworks have been proposed since late 2025.

### Cyrus Shepard (Zyppy) — 23 AI Citation Ranking Factors

Empirically derived from cross-study analysis. Each factor scored 0–10 on evidence strength:

| Rank | Factor | Score |
|---|---|---|
| 1 | URL Accessibility | 9.5 |
| 2 | Search Rank | 9.4 |
| 3 | Fan-out Rank (rankings for related sub-queries) | 9.3 |
| 4 | Preview Control (nosnippet etc.) | 9.2 |
| 5 | Query-Answer Match | 9.2 |
| 6 | Intent-Format Match | 9.0 |
| 7 | Topic Cluster Ranking | 8.9 |
| 8 | Answer Near Top | 8.8 |
| 9 | AI-ready Structure | 8.6 |
| 10 | Factually Specific | 8.3 |
| 11 | Explicit Phrasing | 8.1 |
| 12 | Cites Sources | 8.0 |
| 13 | Self-Contained Passages | 8.0 |
| 14 | Content Visibility | 7.6 |
| 15 | Freshness | 7.0 |
| 16 | Brand/Entity Trust | 6.8 |
| 17 | Length | 6.7 |
| 20 | Structured Data | 5.6 |
| 22 | Domain Authority | 5.0 |
| 23 | LLMs.txt | 2.0 |

Notable: Structured data scores 5.6 — important but not the silver bullet vendors imply.

### Aleyda Solís — 3-Layer Framework

Solís proposes measuring AI search across three layers: (1) AI presence (does our brand appear in answers); (2) AI readiness (are individual pages cite-ready); (3) business impact (citations → traffic → conversion). Her recommended self-reported metric for users: "did you come across [brand] in an AI assistant or AI search experience?"

### GEO research (Aggarwal et al., arxiv 2311.09735)

Coined the term "Generative Engine Optimization." Defined Position-Adjusted Word Count as the canonical metric — citations weighted by position within the AI's generated answer and length of the cited snippet. Reported 30–40% relative improvement on PAWC from optimization techniques like authoritative source citation, statistical evidence, quotations.

### Citation Absorption framework (arxiv 2604.25707)

Five proposed dashboard metrics:
1. Selection rate — does page appear in citation pool for target prompts
2. Citation breadth — citations per prompt, domain recurrence
3. Absorption score — answer-level influence (how much of the answer leans on this source)
4. Position-adjusted impressions
5. Brand mention frequency (uncited but recognized)

### What we can actually measure (Bing-specific)

Bing Webmaster Tools' **AI Performance report** (public preview, Feb 11, 2026) gives us:
- Citation counts per URL across Copilot and Bing AI summaries
- **Grounding Queries** — the internal queries Copilot generates when retrieving content
- Citation timeline over time per URL

This is the feedback signal that lets us close the loop. Pre-launch we score on heuristics; post-launch we re-weight based on actual citation hit rate.

### Schema markup — mixed evidence

The Stackmatix / Frase guides claim FAQPage schema gives 28–30% citation rate lift. A Search/Atlas study from late 2024 found no correlation between schema breadth and citation rate. Reasonable interpretation: FAQ schema specifically helps because Q&A format matches AI's extraction pattern, but throwing 10 schema types at a page doesn't compound.

**Our AI citation fit composite** (input to formula above) should be a sub-formula:

```
ai_citation_fit = 0.25 · query_answer_match (heuristic, see §8)
                + 0.20 · fan_out_potential (count of variant queries our template would rank for)
                + 0.15 · intent_format_match (does template format match SERP feature?)
                + 0.15 · factually_specific (count of numeric facts available in source data)
                + 0.10 · faq_schema_applicable (binary 0/1)
                + 0.10 · freshness_anchor (year in URL/title viable?)
                + 0.05 · cites_sources (have ≥2 primary sources in research pack?)
```

Each input normalized 0–1. This sub-score itself feeds the main formula at weight 0.20.

---

## 3. Multi-criteria decision analysis (MCDA) methods

Five candidate methods, ranked by practicality for our use case:

### Linear weighted sum (chosen)

Score = Σ wᵢ · xᵢ_normalized. Simple, transparent, easy to explain, easy to tune. Used by virtually every "keyword opportunity score" template in the SEO industry (Minuttia, SEOmonitor, the ClearVoice variants). Weakness: assumes independence between criteria, which is false (volume and KD correlate, for example) — but the error is small relative to the gain in interpretability.

### AHP (Analytic Hierarchy Process)

Pairwise comparisons between criteria to derive weights (e.g., "is volume more important than intent? by how much?"). Output is mathematically defensible — you get consistency ratios that flag inconsistent judgments. Overkill for 8 criteria with one decision-maker, but useful when calibrating weights with Jacob: pairwise comparison feels easier than "rate this criterion 0–100."

### TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)

Rank candidates by Euclidean distance from a synthetic "ideal" topic (max on positives, min on negatives) and a "anti-ideal." Stronger than weighted sum when criteria have non-linear value (a topic with 50/100 on every axis can outrank one with 100/100/0/0 on four axes). Practical answer: use TOPSIS as a sanity check after weighted-sum ranking, not as primary.

### Pareto frontier ranking

Mark a topic dominated if another topic beats it on every criterion. Useful for elimination, not selection — most of our candidates won't be Pareto-dominated.

### Bayesian priors with empirical updating

Start with prior weights, update them as actual citation/conversion data comes in. This is the right *long-term* approach but requires shipping enough articles to gather statistics. Plan: linear weighted sum for first 50 articles, switch to Bayesian update once we have ≥10 articles per template track with measurable Copilot citations.

**Decision:** Linear weighted sum with min-max normalization, AHP-guided weight calibration, TOPSIS sanity check on the top 20 candidates, Bayesian re-weighting after enough data lands.

---

## 4. Empirical refinement / feedback loops

Once 50 articles ship, refine the formula using these signals (in priority order):

### Indexing speed
Time from publish → Bing indexed. Use IndexNow ping timestamp vs. Bing Webmaster Tools' first-crawl timestamp. Healthy = under 24 hours. If a template track consistently indexes slower, downgrade `template_fit` for that track.

### Time to first citation
Days from publish → first Copilot citation in Bing AI Performance report. Best single-number proxy for AI citation fit being calibrated correctly. Target: ≤14 days for top-quintile predicted scores.

### Citation count per page (90-day window)
Direct measurement. Bucket pages by predicted `ai_citation_fit` decile and check rank correlation between predicted decile and actual citation count. If Spearman ρ < 0.3, the heuristic sub-formula needs revision.

### Click-through rate
Bing Webmaster Tools impressions/clicks. Normalize against position to isolate title/meta quality. Tells us if our template *previews* well in AI summaries (where snippet quality drives click decisions).

### Conversion rate to /screener and /medical-bill-analyzer
The dollar-weighted truth. If a high-scoring topic ranks well, gets cited, drives traffic, but converts at 0.2% vs. site average of 1.5%, the `commercial_intent` weighting is mis-calibrated for that template track.

### Per-template performance variance
Compute mean and stdev of final outcomes (citations, conversions) per template. Templates with high mean *and* low variance get their `template_fit` baseline raised. High variance = our heuristic isn't capturing what makes a topic work for that template.

### Weight update cadence
Re-fit weights monthly using a constrained optimization (weights non-negative, sum to 1.0 on positive side, ±20% drift per cycle to prevent overfitting to noise).

---

## 5. The proposed CoveredUSA formula

```
score = 0.22 · norm(bing_traffic_potential)
      + 0.20 · ai_citation_fit             [sub-formula in §2]
      + 0.15 · inverse_kd_relative
      + 0.18 · commercial_intent
      + 0.10 · template_fit
      + 0.05 · freshness_window
      - 0.07 · benefitsusa_cannibalization
      - 0.03 · production_cost
```

### Weight reasoning

| Weight | Input | Why this weight |
|---|---|---|
| 0.22 | Bing traffic potential | Largest single input. Direct measure of upside. Slightly under traditional SEO playbooks (which would put it at 0.30+) because we're a new domain — high volume we can't capture is worthless. |
| 0.20 | AI citation fit | Co-leading weight. Bing-Copilot is the primary distribution surface and the only one that compounds (one cited page = many AI answers). |
| 0.15 | Inverse KD relative to us | Substantial but not dominant — we don't want to over-index on "easy keywords" and miss high-value ones we can still rank for via long-tail. |
| 0.18 | Commercial intent | Higher than industry norm (typically 0.10–0.12). Justified because we have two strong conversion surfaces (screener, analyzer) and a finite content budget. |
| 0.10 | Template fit | Heuristic but important. Procedures template handles "cost of X" topics beautifully; trying to force a life-events topic into the procedures template wastes effort. |
| 0.05 | Freshness window | Small weight, but Copilot citation research consistently shows freshness in the top 15 factors (Shepard score 7.0). Year-anchored topics (e.g., "Medicare Advantage 2026") get the bump. |
| -0.07 | BenefitsUSA cannibalization | Negative weight. Semantic flux is real (Pi Datametrics work) — two domains targeting the same phrase often split rankings. |
| -0.03 | Production cost | Small negative — most topics in our seven tracks have similar production cost given templates. The penalty bites only for topics that need bespoke research (no public data sources). |

### Why these inputs aren't weighted more

- *Word count target* — handled by template, not by topic selection.
- *Schema breadth* — included implicitly in `ai_citation_fit` via the FAQ-schema-applicable sub-input.
- *Internal linking opportunity* — too coupled to publish order to score at topic-selection time; handle at sitemap generation.
- *Author/E-E-A-T* — site-level, not topic-level. Doesn't belong in this formula.

### Normalization

Use min-max within the candidate set being scored (e.g., the 200 procedure-topic candidates for the procedures template). Not against the universe of all topics — comparing a Medicare topic against a glossary entry's volume is apples/oranges. Score within track, then apply track-level "boost" multipliers if Jacob wants to weight one track over another.

---

## 6. Hard filters vs. soft scores

**Hard filters (binary include/exclude — run BEFORE scoring):**

1. BenefitsUSA.org already has a ranking page (top 20) for this exact query → EXCLUDE. (Internal cannibalization is worse than external competition.)
2. Zero public data sources available for grounding → EXCLUDE. We don't write what we can't ground.
3. Bing monthly search volume = 0 across all variants → EXCLUDE. (Some zero-volume "definitional" pages are fine when they fan out, but they should be marked as fan-out plays and scored separately.)
4. Already in shipped queue or assigned to writer agent → EXCLUDE.
5. Topic requires medical/legal advice we can't responsibly give → EXCLUDE. (Patient-safety filter. We educate, we don't prescribe.)
6. SERP top-3 is YMYL-locked to .gov/.edu (CMS, HHS, Medicare.gov) with no informational gap → EXCLUDE. We won't outrank Medicare.gov on raw definitions.

**Soft scores (the weighted formula handles these):**

- Volume (continuous)
- KD relative (continuous)
- AI citation fit (continuous composite)
- Commercial intent (continuous, 0–1, scored by SERP feature analysis + keyword modifiers)
- Template fit (0–1 fit score per template, lookup table)
- Freshness window (0–1 based on whether year-anchored is viable and whether the topic decays annually)
- Cannibalization (continuous — semantic similarity to nearest benefitsusa.org URL via embedding cosine distance)
- Production cost (1 / number-of-public-sources-available, capped)

### Why this split

Filters protect against negative-value publishes (cannibalizing ourselves, ungrounded content) regardless of how good the topic scores on other axes. The formula handles positive-value tradeoffs.

---

## 7. Data sources required for each input

| Input | Source | Cost | Effort |
|---|---|---|---|
| Bing search volume | DataForSEO Bing Keyword Data API or Keywords Everywhere | ~$0.0005/keyword | Low — API call |
| Bing traffic potential | Approximate from Bing volume × estimated CTR by position. No "Bing TP" exists. | Free | Medium — need CTR curve assumption |
| KD relative | Ahrefs API or Semrush API (whichever already on subscription), minus heuristic CoveredUSA authority offset | ~$0.001/keyword | Low |
| AI citation fit | Heuristic pre-launch (sub-formula). Post-launch: replace with empirical citation rate from Bing Webmaster Tools AI Performance report | Free | Medium pre-launch, low post-launch |
| Commercial intent | SERP feature analysis (DataForSEO SERP API) + keyword modifier classifier (regex on "best/buy/cost/near me") | ~$0.005/keyword | Low |
| Template fit | Lookup table maintained by hand: topic shape × template | Free | Manual |
| Freshness window | Boolean: is there a current year, monthly statistic, or annual program that affects answer? | Free | Manual or LLM |
| BenefitsUSA cannibalization | Embed BenefitsUSA URL list once; compute cosine similarity of candidate topic vs. nearest BU URL | ~$0.0001/topic | Low — one-time embed + lookup |
| Production cost | Count of viable public data sources from research pack | Free | Medium — needs source crawl |

Total cost to score 500 candidates: roughly $5–10 in API fees. Trivial.

---

## 8. Implementation notes

### Architecture

Node.js script + Google Sheet, exactly the right shape. Sheet has one row per candidate, columns for each input, one column for normalized values, one for final score. Script writes the inputs, formulas in the sheet compute the score, conditional formatting flags the top quartile.

### Script outline

```javascript
// score-topics.js
const candidates = await loadCandidatesFromSheet(); // from track planning docs
const filtered = candidates.filter(passesHardFilters);

const enriched = await Promise.all(filtered.map(async (c) => ({
  ...c,
  bing_volume: await getBingVolume(c.primary_keyword),
  kd_absolute: await getKD(c.primary_keyword),
  serp_features: await getSerpFeatures(c.primary_keyword),
  cannibalization: await cosineToNearestBU(c.topic_text),
  source_count: c.research_pack.sources.length,
})));

const normalized = minMaxNormalize(enriched, [
  'bing_traffic_potential', 'inverse_kd_relative', 'commercial_intent',
  'template_fit', 'freshness_window', 'cannibalization', 'production_cost'
]);

const scored = normalized.map(c => ({
  ...c,
  ai_citation_fit: computeAiCitationFit(c),
  score: applyWeights(c, WEIGHTS),
}));

await writeBackToSheet(scored.sort((a,b) => b.score - a.score));
```

### Weight calibration UI

Add a "weights" tab to the sheet with named cells (W_VOLUME, W_KD, W_AI_FIT, etc.). All scoring formulas reference those cells. Lets Jacob tweak weights and see top-50 reordering in real time. No re-runs.

### Versioning

Each scoring run writes a timestamped sheet (`scoring_2026-05-13_run1`). Keep history so we can A/B retrospect — "topics in the top-20 of run 3 vs. run 7, did the new weights pick winners?"

### Re-weighting trigger

After 50 articles ship and 30 days pass: pull citation count, traffic, conversions per article. Compute Spearman ρ between predicted score and each outcome. If ρ for any single input < 0.15, demote its weight by 30% and redistribute. If above 0.6, promote.

### Where the writer agent plugs in

Top-K scored topics flow into the existing writer pipeline. The score sheet exports a JSON of approved-to-write topics plus their research packs. Writer agent never sees the score — that's a planning artifact, not a generation input.

---

## Sources

- [Ahrefs Keyword Difficulty Glossary](https://ahrefs.com/seo/glossary/keyword-difficulty)
- [Ahrefs KD blog post](https://ahrefs.com/blog/keyword-difficulty/)
- [Ahrefs Traffic Potential Help](https://help.ahrefs.com/en/articles/9046244-what-is-traffic-potential)
- [Ahrefs SEO Metrics Glossary](https://ahrefs.com/blog/ahrefs-seo-metrics/)
- [Semrush — Most Accurate Keyword Difficulty](https://www.semrush.com/blog/most-accurate-keyword-difficulty/)
- [Semrush Knowledge Base — Personal KD](https://www.semrush.com/kb/1434-how-is-personal-keyword-difficulty-calculated)
- [Moz KD Discussion](https://keytomic.com/blog/keyword-difficulty)
- [MarketMuse Content Score Docs](https://docs.marketmuse.com/marketmuse-terminology/what-is-content-score/)
- [MarketMuse Content Brief explainer](https://blog.marketmuse.com/what-is-a-marketmuse-content-brief/)
- [Surfer SEO Content Score Docs](https://docs.surferseo.com/en/articles/5700317-what-is-content-score)
- [Surfer vs Clearscope comparison](https://genesysgrowth.com/blog/surfer-seo-vs-clearscope-vs-marketmuse)
- [Cyrus Shepard / Zyppy — AI Citation Ranking Factors](https://signal.zyppy.com/p/ai-citation-ranking-factors)
- [Aleyda Solís — 3-Layer Framework for AI Search Measurement](https://www.aleydasolis.com/en/ai-search/a-3-layer-framework-to-measure-ai-presence-readiness-and-business-impact-redefining-metrics-for-the-ai-search-era/)
- [GEO paper (Aggarwal et al.)](https://arxiv.org/pdf/2311.09735)
- [Citation Absorption framework](https://arxiv.org/html/2604.25707v2)
- [Bing AI Performance Report announcement](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)
- [Bing AI Performance guide (ALM Corp)](https://almcorp.com/blog/bing-ai-performance-webmaster-tools-complete-guide/)
- [Minuttia — Weighted Keyword Selection](https://minuttia.com/keyword-selection/)
- [Ducalis VRDT Content Prioritization Framework](https://hello.ducalis.io/prioritization-frameworks/vrdt-content-prioritization)
- [DataForSEO Bing Keyword Data API](https://dataforseo.com/apis/bing-ads-api)
- [AHP-TOPSIS multi-criteria methodology](https://pmc.ncbi.nlm.nih.gov/articles/PMC4775722/)
- [Min-max normalization for hybrid scoring](https://amenra.github.io/ranx/normalization/)
- [Pi Datametrics — SEO cannibalization](https://pi-datametrics.com/blogs/cannibalisation/)
- [Frase — FAQ Schema for GEO/AEO](https://www.frase.io/blog/faq-schema-ai-search-geo-aeo)
- [Stackmatix — Structured Data for AI Search](https://www.stackmatix.com/blog/structured-data-ai-search)
- [Semrush — Search Intent Types](https://www.semrush.com/blog/types-of-keywords-commercial-informational-navigational-transactional/)
