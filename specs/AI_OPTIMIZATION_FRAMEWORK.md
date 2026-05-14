# AI Optimization Framework — CoveredUSA

**Version:** 1.0
**Date:** 2026-05-14
**Status:** Draft pending Jacob review
**Maintained by:** Jacob Posner

---

## 0. How to Read This Doc

This is the rubric we engineer every CoveredUSA page against. It distills how Bing's grounding index and Microsoft Copilot's citation mechanism actually work, at engineering precision, so we can reverse-engineer content to match what the algorithm rewards.

### Quick map — where to go for what

| If you have | Read |
|---|---|
| 5 minutes | Section 1 (5-rule TL;DR) and Section 14 (quick-reference card + decision tree) |
| 30 minutes | Sections 1, 2 (mental model), 5 (per-template playbook for the template you're working on), 14 |
| 2 hours | Read straight through Sections 1–9, skim Sections 10–14 |
| Writing a new page | Section 5 (per-template playbook) + Section 4 (rules) + Section 14 decision tree |
| Auditing an existing page | Section 13 (worked-example pattern) + Section 4 (categories) |
| Refactoring a writer agent | Section 8 (validation hooks, especially 8.3 prompt additions) + the rule's category in Section 4 |
| Confused by a term | Section 12 (glossary) |

### Evidence grading

Every claim is source-graded. Tags appear inline as `[CONFIRMED]`, `[CONFIRMED PRIMARY]`, `[CONFIRMED SECONDARY]`, `[LIKELY]`, `[INFERRED]`, `[CONTESTED]`, or `[UNVERIFIED]`. The grade determines how literally to follow the rule:

- **CONFIRMED** — Microsoft primary source or peer-reviewed academic paper. Hardcode into agents and validators.
- **CONFIRMED PRIMARY / SECONDARY** — Microsoft says it / a reputable secondary outlet reports it. Apply but cite correctly.
- **LIKELY** — Strong inference from adjacent Microsoft docs or repeated operator data. Apply with caution.
- **INFERRED** — Operator framework based on observed behavior. Useful heuristic, not law.
- **CONTESTED** — Sources disagree. Flagged for further testing.
- **UNVERIFIED** — Repeated in operator commentary but no primary source. Treat as hypothesis.

When a rule is hardcoded into a writer agent or validator, the implementation must reference its grade so engineers know whether the rule is empirical truth or convention.

**This doc does not yet include current-state audit.** That's a separate doc (`specs/CURRENT_STATE_AUDIT.md`) written after Jacob approves this framework. Refactor work to existing templates and agents happens only after both docs are approved.

---

## 1. The 5-Rule TL;DR

If you only read this section, optimize for these five and you'll capture most of the framework's value.

| # | Rule | Source grade |
|---|---|---|
| 1 | **Optimize for citation absorption, not just selection.** Visible citations come from text the LLM *reuses* in its answer, not from text it merely retrieves. Engineer prose to be quotable. | CONFIRMED — arXiv 2604.25707 |
| 2 | **Paragraph length 150–300 words. Tables + lists 25–35% of page. Headings H2–H4 only.** These three structural targets together cover most of what makes content absorbable. | CONFIRMED — arXiv 2603.29979 (Bing Chat tested directly) |
| 3 | **Direct numeric answer in the first 50 words. Repeat named entity in every paragraph-opening sentence.** Chunks get extracted in isolation — they must stand alone. | INFERRED operator-consensus on first-50; LLM-judge enforcement |
| 4 | **Cite .gov / Harvard Health / NAM inline next to numeric claims.** These are the primary-confirmed Microsoft-trusted sources; inline citation density proxies the trust signal we can't earn via Copilot Health's closed allow-list. | CONFIRMED PRIMARY — Microsoft Copilot Health blog |
| 5 | **Substantive monthly updates + IndexNow ping after every edit.** Citation visibility decays fast on unmaintained content (Search Influence's single-domain data: 97% drop over ~60 days). Metadata-only bumps don't count. | CONFIRMED for IndexNow recommendation; decay generalization INFERRED |

The other 10 high-impact rules are in Section 1.5 below. The complete operational checklist is Section 4. The quick-reference card (5 numbers + 8 fan-out variants + cadence) is Section 14.

## 1.5 The Next 10 Rules (read these too)

6. **Sentence-initial `<strong>` on key entities at 5–10% density.** Density target hardcoded; position preference is heuristic. [CONFIRMED density; INFERRED position]
7. **Stable canonical URL slugs (no year anchor); year markers in titles/H1/content only.** Preserves URL authority across years. [LIKELY — Seer 247-URL study]
8. **Map H2s to the 8 fan-out variants** (Equivalent, Follow-up, Generalization, Specification, Canonicalization, Translation, Entailment, Clarification). [INFERRED — operator framework]
9. **MedicalWebPage + type-specific schema (FAQPage/QAPage/Drug/MedicalProcedure/DefinedTerm) on every health page,** linked via `@graph` not stacked `@type`. [CONFIRMED operational best practice]
10. **Author byline visible + JSON-LD; reviewer slot to be filled when we source a credentialed reviewer** (current gap on YMYL trust signal). [LIKELY]
11. **Allow Bingbot, Bing-AISearchCrawler, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot in robots.txt.** Bing-first optimization but all crawlers allowed. [CONFIRMED operational best practice]
12. **87% of ChatGPT Search citations match Bing's top organic.** Bing optimization compounds across Copilot + ChatGPT Search. [CONFIRMED, Seer Interactive]
13. **Citation distribution is power-law on a per-domain basis.** Search Influence's single-site data: 1 page captured 69%; top 4 captured 90%. Concentrate effort on lighthouses, not breadth. [CONFIRMED for single-domain; do NOT attribute to Microsoft]
14. **AI-cited URLs average ~1,056 days for Copilot (1,064 across all AI surfaces).** ~25.7% fresher than organic average of 1,432 days. [CONFIRMED, Ahrefs 16.975M-citation study]
15. **Engineer for absorption mechanism, not for Equation (2) weights.** Paper 1's formula `0.20·ref_count + 0.15·position + 0.20·paragraph_coverage + 0.25·tfidf_cosine + 0.20·n-gram_overlap` is the authors' *measurement scheme*, NOT Bing's retrieval algorithm. Use the five inputs as a checklist of what makes content absorbable; ignore the weights. [CONFIRMED methodological warning, arXiv 2604.25707]

---

## 2. Mental Model

### 2.1 Citation Selection vs Citation Absorption

**The takeaway up front:** Optimize for what the LLM actually reuses, not just what gets retrieved. Generative engines run a two-step process — they retrieve a candidate pool (selection), then incorporate text from a subset into the generated answer (absorption). Visible citations come from absorption, not retrieval. A page that gets pulled into context but doesn't get quoted earns nothing. [CONFIRMED, arXiv 2604.25707]

**Do not engineer to specific weight ratios.** Paper 1 publishes an "Influence formula" — `Influence_i = 0.20·min(ref_count/3, 1) + 0.15·(1 − first_position_ratio) + 0.20·paragraph_coverage + 0.25·tfidf_cosine + 0.20·(bigram + trigram)/2` — and the authors *explicitly warn* against treating its components as independent drivers of citation: *"Variables used inside Equation (2)... should not be claimed as independent drivers of influence in a regression that uses influence_score as the dependent variable."* Treat the five inputs as a checklist of what makes content absorbable. Ignore the coefficients.

**The actual independent predictors** of citation influence (from the paper's regression analysis, not its measurement formula):

| Predictor | Correlation |
|---|---|
| LLM relevance score | r = 0.4322 |
| Answer-citation embedding similarity | r = 0.3561 |
| LLM content quality | r = 0.2917 |
| Question-citation embedding similarity | r = 0.2548 |

[CONFIRMED, arXiv 2604.25707 — across 21,143 citations]

**Caveat for Bing/Copilot application:** Paper 1 studies ChatGPT, Google AIO/Gemini, and Perplexity. Bing/Copilot is NOT in its test set. Findings transfer with caution. (Paper 2, covered in Section 3, DOES include Bing Chat and is the stronger source for Bing-specific claims.)

### 2.2 The Retrieval Pipeline

Microsoft has not published consumer Bing/Copilot retrieval internals. Azure AI Search's public stack is the strongest documented proxy. The pipeline:

```
[User prompt]
     |
     v
+----------------------------+
| 1. LLM routing layer       |   Decomposes prompt into a fan-out
| (fan-out generation)       |   of sub-queries (~3 avg in Azure
+----------------------------+   docs; consumer Copilot count unknown)
     |
     v
+----------------------------+
| 2. Hybrid retrieval        |   BM25 (lexical) + HNSW/eKNN (vector)
| (against grounding index)  |   run in parallel, merged by
+----------------------------+   Reciprocal Rank Fusion (RRF)
     |
     v
+----------------------------+
| 3. Semantic reranker       |   Cross-encoder, multilingual,
| (top 50 candidates only)   |   "adapted from Microsoft Bing"
+----------------------------+
     |
     v
+----------------------------+
| 4. LLM synthesis           |   Chunks/passages flow into the
| + citation attachment      |   answer; cited URLs surfaced
+----------------------------+
     |
     v
[Generated answer with citations]
```

**Per-stage detail:**

1. **LLM intercepts the prompt and generates a fan-out of sub-queries.** Microsoft confirms Copilot "parses the user's prompt and identifies terms where information from the web would improve the quality of the response. Based on these terms, Copilot generates a search query that it sends to the Bing search service... a few words informed by the user's prompt." [CONFIRMED PRIMARY, M365 Copilot docs]

2. **Hybrid retrieval against the grounding index.** Azure AI Search "runs full-text search and vector search in parallel. Merges results from each query by using Reciprocal Rank Fusion (RRF)" with BM25 for text and HNSW/eKNN for vectors. [CONFIRMED PRIMARY, Azure AI Search hybrid docs]

3. **Cross-encoder semantic reranker.** "Multilingual, deep learning models adapted from Microsoft Bing to promote the most semantically relevant results." Reranking is capped at the top 50 initial matches. [CONFIRMED PRIMARY, Azure AI Search semantic ranker docs]

4. **Chunks/passages feed LLM synthesis with citations attached.** Microsoft's framing: *"search indexing was built to help humans decide what to read. Grounding indexing is being built to help AI systems decide what to say."* The interpretation that Bing is now passage-based, not URL-based, is INFERRED from that statement and from passage-level academic literature. [LIKELY, Bing blog May 2026]

**On embedding model:** Microsoft's likely deployed model is in the E5 family (initialized from xlm-roberta-base, contrastive pre-trained). Not confirmed for consumer Bing/Copilot specifically. [LIKELY]

**On agentic retrieval subquery count:** Azure AI Search's documentation gives "~3 subqueries per query plan on average" as a cost-estimation example, not an empirical measurement. The widely-cited operator claim of "8–12 sub-queries per Copilot answer" has no primary source. Treat consumer Copilot subquery count as UNKNOWN.

### 2.3 The 8 Fan-Out Variants

When the LLM routing layer decomposes a user prompt, it generates variants in eight documented categories:

1. **Equivalent** — alternate phrasing, same intent ("how much does MRI cost" / "MRI price")
2. **Follow-up** — sequential build ("MRI cost" → "MRI insurance coverage")
3. **Generalization** — broader version ("MRI cost" → "medical imaging costs")
4. **Specification** — narrower version ("MRI cost" → "MRI cost with contrast in California")
5. **Canonicalization** — industry-standard terminology ("MRI" → "magnetic resonance imaging")
6. **Translation** — cross-lingual representation
7. **Entailment** — implied consequences/prerequisites ("MRI cost" → "do I need prior authorization for MRI")
8. **Clarification** — disambiguation ("MRI" → "MRI scan vs MRI machine")

This taxonomy is documented by both iPullRank and Search Engine Land, derived from Google patent language on query expansion. It is NOT a Microsoft-published framework — apply it as a structural design heuristic for H2s, not as a literal reflection of Bing's query planner. [INFERRED — operator framework with consistent documentation across multiple SEO operators, but not verified against Bing's actual query planner]

Bing Webmaster Tools' AI Performance Report exposes the actual generated "grounding queries" used to retrieve each cited URL — sampled, not exhaustive. Microsoft 365 Copilot's citation detail exposes the exact search queries sent to Bing, available for 24 hours after the chat. These are the highest-fidelity observable surface for fan-out behavior. [CONFIRMED PRIMARY, Bing Webmaster + M365 Copilot docs]

### 2.4 Cluster Representative Mechanic

When near-duplicate URLs exist within a domain or across domains, the grounding index groups them into semantic clusters and selects a single authoritative representative for the cluster. Other duplicates are discarded to enforce diversity in the generated answer's source set. [LIKELY — Microsoft has confirmed deduplication behavior generally but has not published the specific mechanism]

The operational implication: a challenger page must demonstrate distinct semantic value (novel tabular data, higher-resolution numeric specificity, unique methodology) to displace an entrenched representative. Content parity is insufficient. [INFERRED]

**Important: consolidation ≠ killing legitimate specifications.** This rule is about removing true duplicates, not state-anchored or persona-anchored programmatic pages. Two "best ACA plans in California" articles are duplicates and should be consolidated; the California state Medicare Advantage page and the Texas state Medicare Advantage page are legitimate Specification fan-out variants (Section 2.3) and should both exist. The test: does the second page contain materially different facts, or just paraphrased prose? If the former, keep both. If the latter, consolidate.

### 2.5 Power-Law Citation Distribution

Per-domain citation distribution is highly concentrated. Search Influence's 91-day analysis of their own site recorded 19,717 total Copilot citations across 86 pages. Findings:

- **1 page captured 69% of total citations**
- **Top 4 pages captured ~90% of total citations**

[CONFIRMED, Search Influence single-domain dataset]

The widely-cited "5 pages drove 74.6% of citations" figure (sometimes attributed to Microsoft) does NOT appear in Microsoft's primary materials or in Search Influence's own article. It appears to be a misattribution circulating in operator commentary. We use Search Influence's actual numbers and the single-domain caveat.

Across-domain corroboration exists in healthcare specifically: Surfer SEO's 46-million-citation analysis of Google AI Overviews found NIH (39%) + Healthline (15%) + Mayo Clinic (14.8%) + Cleveland Clinic (13.8%) + ScienceDirect (11.5%) own ~94% of healthcare AI citations. **Caveat:** that data is Google AI Overviews, not Bing/Copilot. Different retrieval stacks. [CONFIRMED for AIO, INFERRED for Copilot]

The strategic translation: don't spread effort across hundreds of thin programmatic pages. Build a small number of lighthouse pages engineered to win their query space.

---

## 3. Two Papers — What's Hardcoded, What's Heuristic

### 3.1 The Hard Numbers (use as engineering targets)

These come from arXiv 2603.29979 — "Structural Feature Engineering for Generative Engine Optimization." **Methodology:** 200 articles × 6 domains (Biography, Health, Technology, Finance, Travel, Science) × 377 real-world queries × 6 generative engines (Google SGE, **Bing Chat**, Perplexity AI, Phind, ChatGPT, Claude) = 2,400 test cases. The paper directly tests Bing Chat — the strongest available research backing for our use case.

**Hardcoded targets** (write into writer agents; use as validator default thresholds):

| Target | Value | Verified |
|---|---|---|
| Paragraph length | `L_p ∈ [150, 300]` words | [CONFIRMED, verbatim] |
| Structural element proportion (tables + lists ÷ total) | `F_d ∈ [0.25, 0.35]` | [CONFIRMED, verbatim] |
| Heading hierarchy depth | `d_h ∈ [3, 5]` (H2–H4 only) | [CONFIRMED, verbatim] |
| Visual marker density | `E_d ∈ [0.05, 0.10]` | [CONFIRMED, verbatim] |
| Extraction accuracy lift for structured formats vs prose | 43% | [CONFIRMED, verbatim] |
| Reported citation improvement | 17.3% | [CONFIRMED] |
| Reported perceptual quality improvement | 18.5% | [CONFIRMED — note: "perceptual quality," not "citation quality"] |

**Treat as heuristic, not measurement:**

- **Attention position weights** `w_i = {2.0 sentence-initial, 1.5 section-boundary, 1.0 standard}` are the paper's *proposed weighting scheme* within its measurement framework — NOT measured transformer attention magnitudes. Same caveat that applies to Paper 1's Equation (2). Apply the density target (`E_d`) as a rule; treat the position preference as directional (sentence-initial > section-boundary > mid-paragraph for `<strong>` placement) without engineering to specific weight ratios.

**Cross-domain caveat:** The paper's targets are cross-domain averages across 6 domains. The paper did not publish per-domain optima. Healthcare YMYL content with heavy numeric tables may legitimately need 35–45% structural proportion; conversational FAQ answers may need 80–150 word paragraphs. **Use the numbers as soft defaults for writer agents (warn at boundary, fail only at extreme outliers — see Section 8 for severity tiers).**

### 3.2 The Soft Model (use as intuition)

From arXiv 2604.25707 — "Citation Absorption."

**Methodology:** 602 controlled prompts × 21,143 valid search-layer citations × 23,745 citation-level feature records × 18,151 successfully fetched pages × 72 extracted features. Tests ChatGPT, Google AIO/Gemini, Perplexity — **NOT Bing/Copilot**. Bing-specific application is inferential.

**Use as mental model, not literal weights:**

- The five components of citation influence (TF-IDF cosine, n-gram overlap, paragraph coverage, repeated reference, position) are real engineering levers, but their relative weights in Microsoft's algorithm are unknown.
- Citation breadth ≠ citation depth: ChatGPT cites fewer sources per prompt (6.88) but each cited page averages ~4× higher influence than Google's or Perplexity's. "Fewer but heavier" vs "many but lighter."
- Independent correlates of citation influence are LLM-judged relevance (r=0.4322) and answer-embedding similarity (r=0.3561) — engineer for those mechanisms, not for specific weight ratios.

[CONFIRMED, arXiv 2604.25707]

---

## 4. The 14-Category Engineering Checklist

For each category: the mechanism, the rules, the evidence grade.

### 4.1 URL & Slug Architecture

**Mechanism:** Stable URLs accumulate organic authority that strengthens AI citation correlation over time (r=0.47 → r=0.82 over 2 years). Cluster representative selection favors a single canonical URL per intent.

**Rules:**
- Use stable canonical URL slugs (e.g., `/cost/mri`), not year-anchored slugs (`/cost/mri-2026`). [LIKELY, Seer 247-URL study]
- **Year markers belong in titles, H1s, and visible content** — not in the slug. This separates evergreen URL authority from time-sensitive content freshness. (Section 4.2 covers the year-in-title rule.)
- Position the primary entity closest to the root directory. [INFERRED from BM25 lexical weighting]
- Slug length under 60 characters. Hyphens, not underscores.
- State/locale anchored as static subdirectory (`/medicare-advantage/california`), not query parameter. [INFERRED — cluster representative mechanic]

**Hard rule on existing slugs: NEVER migrate them.** Jacob has tanked a page before by changing its slug. The accumulated organic authority and any in-flight cluster representative status are lost the moment the URL changes, and the new URL has to rebuild trust from zero. Even with 301 redirects, Bing treats the new URL as a new candidate during the cluster representative reselection.

Operational rule:
- Existing pages keep their current slugs, year-in-slug or not. No exceptions.
- New pages created from the day this framework ships use stable slugs (no year anchor).
- Year markers go in the H1, title, meta description, and first paragraph — never in the slug going forward.

### 4.2 Title Tag & Meta Description

**Mechanism:** Lexical retrieval (BM25) operates on title content before semantic reranking. The title is also the primary candidate for first-pass extraction.

**Rules:**
- Front-load exact intent match in the title.
- Inject current-year markers ("2026") in titles for time-sensitive YMYL topics.
- Include numeric specificity where applicable ("MRI Cost $400–$3,500").
- Meta description as a dense, self-contained factual answer (not ad copy).
- Title under 70 characters; meta description under 160 characters (already enforced by validators).

### 4.3 H1 & Heading Hierarchy

**Mechanism:** H2 structure is where the 8 fan-out variants are addressed. Heading depth beyond H4 dilutes transformer attention.

**Rules:**
- Map H2s to fan-out variants for the page's primary entity (Equivalent / Follow-up / Generalization / Specification / Canonicalization / Translation / Entailment / Clarification).
- Phrase H2s as explicit natural-language questions where genuine user-question intent exists.
- Heading depth strictly H2–H4. No H5 or H6. [CONFIRMED, arXiv 2603.29979]
- H3s entity-rich and declarative; avoid generic "Overview" or "Introduction."

### 4.4 First-Paragraph Design

**Mechanism:** Bing applies per-URL retrieval caps. Facts buried below the fold may never be extracted. The opening paragraph is also the most likely chunk to be passed to the LLM synthesis context window.

**Rules:**
- Direct numeric answer in the first 50 words (or 80 words for non-numeric Q&A pages).
- Exclude introductory fluff, anecdotes, rhetorical questions.
- Use explicit, unhedged numeric claims inline ($1,328, not "around $1,300"). Inline numbers in the hero answer; comparison/breakdown numbers belong in tables (Section 4.6). The two rules apply to different content positions, not the same content.
- Sentence-initial `<strong>` on core entities (density target 5–10% per Section 3.1). [CONFIRMED for density; position preference INFERRED]
- The first sentence of each paragraph (including the hero) must contain the named entity explicitly. Subsequent sentences may use pronouns with a clear referent. (This is the operational form of the "no pronouns" rule — see Section 4.5.)

### 4.5 Per-Paragraph Chunk Design

**Mechanism:** Embedding models like E5 vectorize at the paragraph level. The optimal paragraph length balances information density (high enough to be useful) with attention span (low enough to be parseable in a single attention pass).

**Rules:**
- Paragraph length 150–300 words for body prose. FAQ answers may run 80–150 words because conversational Q&A absorption favors shorter chunks. [CONFIRMED for body prose target, arXiv 2603.29979; FAQ exception INFERRED]
- Every paragraph self-contained — no "as mentioned above," no orphan pronouns. The test: extract the paragraph from context and read it alone. Does it still convey its claim? If not, rewrite.
- **First sentence of each paragraph must include the named entity explicitly** ("California Medicare Advantage plans," not "these plans"). Subsequent sentences may use pronouns when the referent is unambiguous. This is the implementable form of the no-pronouns rule — natural prose stays readable, chunk extraction stays grounded.
- Maximize bigram/trigram overlap with likely LLM phrasing of the answer. [INFERRED from arXiv 2604.25707 components]
- Use canonical industry terminology (Canonicalization fan-out variant alignment).
- Standard HTML block elements as semantic boundaries (`<p>`, `<section>`, `<article>`).

### 4.6 Table & List Usage

**Mechanism:** Structured formats demonstrate 43% higher extraction accuracy because they provide explicit syntactic boundaries that guide transformer attention.

**Rules:**
- Tables + lists comprise 25–35% of total page content. [CONFIRMED, arXiv 2603.29979]
- Use HTML `<table>` exclusively for tabular data. No CSS-grid layouts substituting for tables.
- Numeric data embedded in tables, not inline prose.
- Explicit `<th>` headers on every table.
- `<caption>` tags on tables for dense-vector linkage to surrounding prose.
- Precede every table with a one-sentence prose summary of what it shows.

### 4.7 Schema.org Graph

**Mechanism:** Schema.org markup provides explicit machine-readable context that helps the grounding index disambiguate topic boundaries and identify high-confidence factual surfaces.

**Rules:**
- `MedicalWebPage` schema on every health content page.
- `FAQPage` schema with the visible Q&A actually present in the DOM (markup-to-content parity required — pure schema without visible content provides minimal lift per Ahrefs schema study).
- `Dataset` schema for substantive numeric tables.
- `DefinedTerm` schema for glossary entries.
- `Article` or `MedicalWebPage` author + `Person` schema for authors and reviewers.
- `@id` linking across schema entities for cohesive knowledge graph.

**Schema stacking guidance:** When a page needs both `MedicalWebPage` and a type-specific schema (e.g., `QAPage`, `MedicalProcedure`, `Drug`, `DefinedTerm`), emit each as a separate node in a `@graph` and connect them via `mainEntityOfPage` references. Do NOT stack `@type: ["MedicalWebPage", "QAPage"]` on a single node — Google's Rich Results test warns against `@type` collisions. Current `src/lib/structured-data.ts` already implements separate-node emission for most templates; the daily blog post template needs upgrade to add `MedicalWebPage` alongside `Article`.

### 4.8 Author & Reviewer Attribution

**Mechanism:** YMYL trust signals matter more for healthcare than for any other vertical. Named experts with verifiable credentials approximate the "Credentialed Knowledge" tier without entry to Microsoft's allow-list.

**Rules:**
- Visible credentialed byline on every health content page (already implemented for CoveredUSA via "Jacob Posner, Founder & Editor").
- `Person` schema with `sameAs` links to LinkedIn / ORCID where applicable.
- Visible medical/policy reviewer when content makes clinical claims (gap: not yet implemented; needs credentialed reviewer source).
- Editorial methodology page linked from each author bio (gap).

### 4.9 Inline Source Citations

**Mechanism:** Cross-encoder reranker measures source attribution quality. Links to .gov / .edu / vetted-medical-institution sources increase factual fidelity scores and proxy the trust signal of Copilot Health's allow-list.

**Rules:**
- Cite CMS.gov, NIH.gov, healthcare.gov, IRS.gov, KFF.org, congress.gov inline beside numeric claims.
- Bracketed numeric citations ([1], [2]) — LLMs are pre-trained on academic literature and recognize the pattern as a verifiable-fact marker.
- Avoid linking to unverified aggregators or direct competitors.
- Anchor text contains descriptive semantic context ("CMS 2026 Medicare Physician Fee Schedule" not "click here").

### 4.10 Internal Linking Architecture

**Mechanism:** Internal links concentrate semantic authority toward cluster representatives. Hub-and-spoke architecture mirrors how head queries branch into fan-out subqueries.

**Rules:**
- Link heavily to designated lighthouse/cluster-representative URLs from supporting pages.
- Use exact-match, entity-dense anchor text.
- Keep internal-link density moderate — roughly 1 link per 150-200 word chunk is a working heuristic to avoid attention dilution. [INFERRED — no primary-source measurement, this is operator convention]
- Strict hub-and-spoke: lighthouse → cluster (down) and cluster → lighthouse (up); minimize cluster ↔ cluster cross-linking where it cannibalizes.

### 4.11 Freshness Signals

**Mechanism:** Microsoft's grounding index favors recently-updated content. Search Influence's single-domain data shows a 97% citation decline over ~60 days for unmaintained content (1,520 → 34 daily citations). SE Ranking's AI Mode study finds pages updated within 2 months get ~28% more citations than pages untouched > 2 years.

**Important caveat:** SE Ranking's own feature-importance analysis ranks freshness BELOW domain traffic and backlinks. Freshness is a notable lever, not the dominant lever.

**Rules:**
- Substantive monthly content review for high-value pages (lighthouses, top procedure/MA pages). [INFERRED cadence based on Search Influence's single-domain 60-day decay observation + SE Ranking's "updated within 2 months" finding]
- Update numeric data points and pricing tables (operator-consensus hypothesis: real DOM mutations matter more than metadata-only updates). [INFERRED — Microsoft has not explicitly stated this; treat as hypothesis we're operationalizing]
- IndexNow API ping immediately after every content edit. [CONFIRMED PRIMARY, Bing Webmaster Blog July 2025]
- Sync schema.org `dateModified` with sitemap `lastmod` and visible "Updated" date — three sources must align.
- `data-nosnippet` HTML attribute on legacy disclaimers, expired promotions, outdated examples — Microsoft explicitly supports this for excluding stale content from AI summaries while keeping the page indexed. [CONFIRMED PRIMARY, Bing Webmaster Blog October 2025]

**Mid-year numeric change protocol.** When a year-anchored numeric value changes mid-year (e.g., FPL adjusts January, ACA premium changes November, drug list changes quarterly):
1. Update the numeric value in place on the existing URL.
2. Update visible "Updated" date, schema `dateModified`, and sitemap `lastmod` to the edit date.
3. Send IndexNow ping for the affected URL.
4. Do NOT create a new versioned URL for the value change — preserve URL authority.
5. Only create a new URL when the year itself rolls (year-rollover protocol covered in Section 6.4).

### 4.12 Spanish / Localization

**Mechanism:** Cross-lingual retrieval relies on multilingual embedding alignment. xlm-roberta-based models like E5 natively support 100+ languages but require high-fidelity translation.

**Rules:**
- Bidirectional `hreflang` tags on every page.
- High-fidelity translation; no colloquialisms; no machine-translation passthrough.
- Cite Spanish-language primary sources where they exist (Medicare en Español, healthcare.gov/es, Medicaid.gov en Español).
- **Fallback for thin source ecosystems:** when a topic has no genuine Spanish primary-source equivalent (some technical procedures, manufacturer PAPs), use the English source as the primary citation. Do not invent or fabricate a Spanish source to satisfy a localization rule.
- Spanish state names where they differ (Pennsylvania → Pensilvania, Hawaii → Hawái).

### 4.13 Core Web Vitals & Hygiene

**Mechanism:** Grounding bots operate on aggressive timeouts. Slow rendering results in partial or truncated chunk extraction.

**Rules:**
- Sub-second DOM text rendering on initial load.
- Server-rendered core answer content (Next.js SSR is already implemented).
- Mobile responsiveness — mobile drives the majority of AI health queries.
- No critical content hidden behind tabs or JavaScript state.

### 4.14 Robots.txt & Crawler Permissions

**Mechanism:** Bingbot is the primary ingestion crawler for the Bing index. Distinct AI crawlers ingest content for different AI products with different retrieval models.

**Crawlers to allow** (full list per AI surface):

| Crawler | Used by | Behavior |
|---|---|---|
| `Bingbot` | Bing index (powers Copilot grounding) | Standard crawl + ingestion |
| `Bing-AISearchCrawler` | Bing AI experiences (real-time fetch) | Lazy fetch on demand |
| `OAI-SearchBot` | ChatGPT Search citation pool | Index ingestion |
| `ChatGPT-User` | ChatGPT real-time browsing | Lazy fetch |
| `GPTBot` | OpenAI model training | Bulk crawl |
| `PerplexityBot` | Perplexity citation pool | Index + fetch |
| `Perplexity-User` | Perplexity real-time browsing | Lazy fetch |
| `ClaudeBot` | Anthropic model training | Bulk crawl |
| `Claude-User` | Claude.ai real-time browsing | Lazy fetch |

**Strategic position:** We are Bing-first (per Rule 13 — 87% Bing/SearchGPT overlap means Bing optimization covers most of ChatGPT Search for free). Perplexity and Claude are happy side effects of Bing-optimized content, not co-equal optimization targets. We allow all the above crawlers but engineer specifically for Bing/Copilot retrieval.

**Other rules:**
- Use `nosnippet` meta tag sparingly — it can suppress AI answer use.
- Use `data-nosnippet` for fine-grained section-level exclusion instead of whole-page suppression.
- Keep canonical, hreflang, and redirect signals internally consistent.

---

## 5. Per-Template Playbook (CoveredUSA)

Each template maps the framework rules to a specific page archetype. Update writer agents and validators to enforce these per-template requirements.

### 5.1 Procedure Cost (`/cost/[procedure]`)

**Sample pages:** MRI, CT scan, colonoscopy
**Strongest target fan-out variants:** Equivalent ("how much does X cost"), Specification ("X cost with Medicare"), Entailment ("does insurance cover X")

**Highest-impact engineering for this template:**
1. **First-50-words direct numeric answer** in the hero subhero (already done well — "an MRI typically costs $400 to $3,500").
2. **Site-of-service comparison table** (already implemented — 4 rows × 3 columns). Confirm 25–35% structural proportion across the full page.
3. **Variant tables** for body parts, contrast, etc. — keep these; they're the Specification fan-out coverage.
4. **Named-entity-first sentence discipline:** sweep for paragraph-opening "it costs", "the scan", "this procedure" → replace with named entity ("an MRI", "the MRI scan"). Subsequent sentences may use pronouns.

**Maintenance cadence:** Monthly numeric refresh (pricing volatile). IndexNow ping after each refresh.

### 5.2 Drug Cost (`/drug/[drug]`)

**Sample pages:** Ozempic, insulin, metformin
**Strongest target fan-out variants:** Equivalent ("Ozempic cost"), Specification ("Ozempic with Medicare Part D"), Entailment ("how to afford Ozempic")

**Highest-impact engineering:**
1. PAP (Patient Assistance Program) details and manufacturer copay cards as their own section with structured comparison table.
2. Medicare Part D coverage rules table with 2026 OOP cap ($2,100) explicitly stated.
3. Generic vs brand comparison table for any drug with generic equivalents.
4. Self-contained FAQ chunks (already 8 FAQs per page — confirm 150–300 words each).

**Maintenance cadence:** Quarterly (drug prices change slower than facility-side procedure costs).

### 5.3 Q&A (`/qa/[question]`)

**Sample pages:** Does Medicare cover dental / vision; Does Medicaid cover rehab
**Strongest target fan-out variants:** Clarification + Equivalent + Follow-up

**Highest-impact engineering:**
1. Decisive `shortAnswer` (current writer-agent rule targets under 80 chars; validator does NOT yet enforce — gap to close in the refactor). The full first-50-words requirement is met by `quickAnswer` / first introParagraph, not `shortAnswer` alone.
2. Coverage breakdown table (already implemented — `coverageBreakdown.rows[].cells[]`) — confirm cells use status codes correctly.
3. **Alternatives section** when answer is "no" — covers Entailment fan-out (what to do instead).
4. **Dual-eligible / state-variation sections** — covers Specification fan-out.

**Maintenance cadence:** Quarterly minimum, monthly for coverage-rule pages during AEP (October–December).

### 5.4 Glossary (`/glossary/[term]`)

**Sample pages:** Deductible, MAGI, Out-of-Pocket Maximum
**Strongest target fan-out variants:** Clarification + Canonicalization

**Two sub-types — different cadences:**

| Sub-type | Examples | Cadence | Year anchoring |
|---|---|---|---|
| Monetary glossary | FPL, OOP Maximum, Part B deductible, MAGI thresholds | Annual (with mid-year update when value changes) | Yes — value depends on year |
| Concept glossary | Premium, Copay, Coinsurance, Deductible (concept), PPO, HMO | Quarterly review minimum; major rewrites only when concept changes | No — definitions are evergreen |

Splitting these prevents two failure modes: (a) annually-republished concept entries that don't actually change, (b) monetary entries left stale because the cadence was set to "annual."

**Highest-impact engineering:**
1. **DefinedTerm schema** (already implemented).
2. **One-sentence canonical definition** in first 50 words.
3. **Related-term table** linking other glossary entries (internal-link concentration toward the lighthouse `/glossary/health-insurance-terms-explained`).
4. **2026 anchor values for monetary entries.** Concept entries do not require year markers in body content; they may omit year for evergreen readability.

### 5.5 Event (`/event/[event]`)

**Sample pages:** Turning 26, Turning 65, Just Lost Job
**Strongest target fan-out variants:** Specification (date) + Follow-up (next steps) + Entailment (consequences)

**Highest-impact engineering:**
1. **HowTo schema with numbered steps** (already implemented).
2. **Deadline-anchored hero** in first 50 words (specific dates, day counts).
3. **Eligibility decision tree** as a structured list or table.
4. **State-variant callouts** for SEP-eligible life events.

**Maintenance cadence:** Annual for date-anchored events (recalculate windows each year). Monthly during AEP for Medicare events.

### 5.6 Persona (`/for/[persona]`)

**Sample pages:** Gig workers, Self-employed
**Strongest target fan-out variants:** Clarification (persona synonyms) + Entailment (income/coverage implications)

**Highest-impact engineering:**
1. **Aggressive persona synonym coverage in H1, H2s, and body** — gig workers, freelancers, 1099, contractors, rideshare drivers, self-employed. Lexical match on every variant.
2. **Decision-matrix table** comparing Marketplace / Medicaid / spouse plan / short-term coverage, with "best when" / "downside" / "what affects cost" columns.
3. **Irregular-income FAQ cluster** for personas with variable income.
4. **Government-source citation density** for tax and subsidy claims.

**Maintenance cadence:** Quarterly.

### 5.7 State Medicare Advantage (`/medicare-advantage/[state]`)

**Sample pages:** California, Texas, Wyoming
**Strongest target fan-out variants:** Specification (state, county) + Equivalent ("MA plans in X") + Follow-up (enrollment)

**Highest-impact engineering:**
1. **Pronoun discipline:** "California Medicare Advantage plans" not "these plans." Critical for chunk extraction.
2. **Current-year state-specific data in opening 50 words** (plan count, enrollee count, top carriers, AEP date).
3. **County-variance table** for states with 5+ counties of meaningful variance.
4. **Cluster-representative concentration:** internal links from county-level / niche state pages point heavy entity-dense anchor text back to the state-level lighthouse.

**Maintenance cadence:** Pre-AEP refresh (September) + post-AEP refresh (January). Plan count + premium + Star Rating data updates.

### 5.8 Daily SEO Blog Post (`/blog/[slug]`)

**Sample pages:** 36 blog posts at 1,500–2,500 words each, generated daily via the SEO cron pipeline.

**Current schema gaps:**
- Article schema only; no MedicalWebPage; no Dataset for embedded tables.
- Long unstructured prose chunks (writer agent allows freeform markdown).
- "AI Source Optimization" branch in the writer agent (when SOURCE is "AI") is directionally right but not enforced via validator.

**Highest-impact engineering:**
1. Promote blog posts to MedicalWebPage + Article schema combo for health/insurance topics (using the `@graph` pattern from Section 4.7).
2. Enforce paragraph-length validator on MDX content (150–300 word target — soft warn, not hard fail; see Section 8 severity tiers).
3. Enforce structural proportion (25–35% tables/lists) for blog posts — currently variable.
4. Add Dataset schema when post embeds a numeric reference table.

**Maintenance cadence:** Quarterly review of high-citation posts (identify via Bing Webmaster AI Performance Report — manual export until API ships). Update or sunset low-performers.

**Retrofit strategy for the 36 existing posts:**
- Validators on existing blog posts run in **warn mode** (output warnings, do not fail the build).
- New blog posts run in **strict mode** from the day the validator ships.
- Top-cited 5 posts (per Bing AI Performance Report data) get prioritized retrofits to strict mode.
- Posts with 0 Copilot citations after 90 days are candidates for sunset (unpublish) or rewrite. Threshold to be calibrated once we have meaningful Bing AI Performance Report data on CoveredUSA.

### 5.9 Pages Outside the Per-Template Framework

The inventory surfaces three content cohorts that do not fit the 8 template playbooks. Each needs an explicit archetype assignment.

**Medical-bill-analyzer cluster (~220 sheet rows, ~85 analyzer-tagged queued) — new template track `/bill/[topic]`.** Topics span hospital chargemaster, CPT code explainers, dispute letter templates, hospital-specific charity care (HCA, Mayo, Cleveland, Kaiser, etc.), state medical-debt law, and AI-vs-human bill-review comparisons.

**Decision: build a new template track at `/bill/[topic]`** with the same structured-JSON + schema-rich pattern as our existing 8 templates. Rationale: CoveredUSA's bottleneck is not content production speed (AI handles execution); the bottleneck is structural quality per page. Every page we ship should be the maximally-optimized version of itself. A schema-rich JSON-data template guarantees that structure across all 220 future pages, where a freeform blog approach would leave structural quality variable.

Template requirements (mirror the procedure/drug/qa template pattern):
- `Bill` TypeScript interface defining the JSON shape
- Dynamic route at `/[locale]/bill/[slug]/page.tsx`
- Sample data files under `content/data/bills/`
- Schema graph: `MedicalWebPage` + topic-specific schema (`Dataset` for charity-care income thresholds; `HowTo` for dispute walkthroughs; `FAQPage` always)
- Writer agent + verifier agent following the existing pattern
- Bulkgen cron + queue helper
- Validator with all the standard checks (em-dash ban, paragraph length, 25–35% structural proportion, etc.)

The medical-bill-analyzer tool page itself (`/medical-bill-analyzer`) is the natural cluster hub.

Build infrastructure first, then route the 220 queued rows through the bulkgen cron. Treat this as Phase 5 after the framework refactor lands.

**Hardcoded reference pages (15 pages: `/federal-poverty-level`, `/medicare-eligibility`, `/medicaid-income-limits`, `/aca-income-limits`, plus tool/landing pages).** These are not template-driven and don't fit a per-template playbook. They function as site-level reference hubs and should be engineered to lighthouse standard: full schema graph (`MedicalWebPage` + `Dataset` for numeric tables + `BreadcrumbList`), 150–300 word paragraphs, 25–35% structural proportion, monthly numeric refresh for the income-limit pages, primary-source citation density.

**BenefitsUSA-overlap queue (63 rows: state Medicaid income limits, state CHIP eligibility, "free health insurance in [state]" titles).** These topics structurally overlap with BenefitsUSA's eligibility screener territory. Per existing territorial split (CoveredUSA owns healthcare navigation/care+cost; BenefitsUSA owns government-program eligibility), these rows should be reassigned to BenefitsUSA or skipped on CoveredUSA. Do NOT route them through CoveredUSA writer agents — direct cannibalization risk.

---

## 6. Maintenance Protocol

### 6.1 The Evaporation Reality

Search Influence's single-domain analysis showed average daily Copilot citations dropping from 1,520 to 34 over roughly 60 days — a 97% decline. Their candidate explanations (none tested): (a) freshness window aging, (b) competing content displacement, (c) Microsoft retrieval-weight change. [CONFIRMED for that dataset]

**Important framing:** This is one publisher's data on one website. We do NOT have a verified universal decay curve. We DO have strong corroboration that unmaintained AI-favored content is at risk:
- Ahrefs 16.975M-citation study: Copilot-cited URLs average 1,056 days old vs 1,432 for organic.
- SE Ranking AI Mode study: pages updated within 2 months average ~28% more citations than pages untouched > 2 years.

### 6.2 What Counts as a Substantive Update

Microsoft has not explicitly defined a "substantive update" threshold for grounding-index re-embedding. The operator-consistent view: metadata-only `dateModified` bumps without DOM changes are ineffective. [INFERRED]

In practice, substantive updates should mutate the chunk-level vector embedding. That means:

**High-effectiveness updates:**
- Replacing numeric values in HTML tables (pricing, premium, deductible, FPL, OOP cap).
- Adding new H2/H3 sections for emerging fan-out queries surfaced in Bing AI Performance Report.
- Refreshing inline primary-source citations to current government docs.
- Rewriting outdated paragraph text to match current-year policy.

**Low-effectiveness updates:**
- `dateModified` schema bump without DOM mutation.
- Sitemap `lastmod` change without content change.
- "Updated" visible date without text edit.

### 6.3 IndexNow Flow

Microsoft confirms IndexNow + sitemap `lastmod` as the strongest combined freshness signal for AI search. [CONFIRMED PRIMARY, Bing Webmaster Blog July 2025]

Implementation requirement:
1. Any data file edit (content/data/**, content/blog/**) triggers an IndexNow ping for the affected URL on next deploy.
2. Sitemap `lastmod` updates to current ISO date.
3. Schema.org `dateModified` updates to match.
4. Visible "Updated" date on page renders the same date.

Current state: IndexNow ping runs on Stage 2 of the daily SEO cron after new article deploy. We need to extend this to fire on edits to existing pages, not just new publishes.

### 6.4 Cadence by Page Type

| Template | Cadence | Trigger events |
|---|---|---|
| Procedure cost | Monthly | Pricing volatility |
| Drug cost | Quarterly | PAP / formulary changes |
| Q&A | Quarterly minimum | Coverage rule changes |
| Glossary | Annual | Rule changes only |
| Event | Annual + AEP refresh | Date window changes |
| Persona | Quarterly | Income / tax rule changes |
| State MA | Pre + post AEP | AEP open/close |
| Blog | Quarterly review | High-citation post sweep |

### 6.5 Cluster Representative Consolidation

When two pages cover near-duplicate intent (e.g., two "best ACA plans in California" articles), one will win the cluster representative slot and the other will be discarded by retrieval.

Action items:
- Identify near-duplicate URLs via the inventory script.
- Consolidate or redirect duplicates.
- Concentrate internal link equity (anchor text density) toward the lighthouse / canonical version.

### 6.6 Bing Webmaster AI Performance Report Workflow

Microsoft does not yet publish an API for the AI Performance Report — UI/CSV-only as of May 2026. We will work in monthly cycles until the API ships.

**Monthly workflow:**
1. Export AI Performance Report CSV from Bing Webmaster Tools (manual).
2. Identify top 10 pages by Copilot citation count.
3. For each top page, export its grounding queries (the actual sub-queries that retrieved it).
4. Cluster grounding queries by topic; map clusters to existing H2 sections.
5. Identify gaps — grounding queries with no corresponding H2. Each gap is a candidate H2 addition for the next content refresh.
6. Identify pages with 0 Copilot citations after 60+ days post-publish — flag for sunset or rewrite review.
7. Save the analysis to `specs/monthly-ai-performance-YYYY-MM.md` for trend tracking.

**Year-rollover protocol.** Every January, the year-marker validator (Section 8) will fail every page that still says "2026" in titles/H1/meta. Two execution options:
1. **December 28–31 batch update**: scripted find-and-replace across all year-anchored pages, increment "2026" → "2027" in titles, H1s, meta descriptions, first paragraphs. IndexNow ping batch. Substantive content review deferred to subsequent monthly cycles.
2. **Phased rollover by template**: high-priority pages (procedures, state MA, events) updated first week of January with substantive numeric refreshes; lower-traffic templates updated within 30 days.

Recommendation: phased rollover (option 2) — the batch find-and-replace alone is a metadata-only update and per Section 6.2 is INFERRED to be ineffective.

---

## 7. What We Don't Engineer For

### 7.1 Microsoft Copilot Health Clinical Surface

Microsoft launched Copilot Health in March 2026 as a separate, secure consumer health surface. Microsoft primary confirms the following:

- Verified by Microsoft's clinical team using principles independently established by the **National Academy of Medicine**. [CONFIRMED PRIMARY]
- Expert-written answer cards from **Harvard Health**. [CONFIRMED PRIMARY]
- External advisory panel of 230+ physicians from 24+ countries. [CONFIRMED PRIMARY]
- Integrates Apple Health, Oura, Function (diagnostic labs), and 50,000+ U.S. hospitals via HealthEx. [CONFIRMED PRIMARY]
- Microsoft consumer products respond to 50M+ health questions/day. [CONFIRMED PRIMARY]

**Secondary-only attributions (not in Microsoft primary):**
- JAMA, Mayo Clinic, Cleveland Clinic, Kaiser Permanente — appear in Newsweek (Oct 2025) and healthcare.digital. [CONFIRMED SECONDARY]
- The phrase "Credentialed Knowledge" is healthcare.digital framing, not a Microsoft term.
- The phrase "walled, highly regulated ecosystem" is editorial framing, not a Microsoft quote.
- TEFCA mechanism is mentioned only in healthcare.digital secondary coverage, not Microsoft primary.

**No application path exists** for non-allow-listed publishers to enter the vetted source tier. [ABSENCE CONFIRMED]

**Strategic implication:** CoveredUSA does not attempt to compete for clinical / symptomology / diagnostic / treatment-pathway citations within the Copilot Health surface. We target the broader standard Copilot surface where:

- Medical bill analysis
- ACA navigation and eligibility
- Medicare cost optimization
- Facility pricing transparency
- Insurance procedural guides
- Coverage Q&A (does plan cover X)
- Persona-specific decision support

These are unclaimed territories where the Copilot Health allow-list does not gate retrieval and where existing clinical publishers (Mayo, Cleveland Clinic, NIH) are structurally weaker than they are on clinical content.

### 7.2 Operations We Don't Do

- **No artificial `dateModified` bumps** without corresponding DOM mutation. [INFERRED — operator best practice, not Microsoft-documented]
- **No "best of [our category]" listicles ranking ourselves #1.** [INFERRED — operator best practice; Lily Ray and other SEO operators have documented this as an algorithm-update vulnerability, no Bing/Google primary source]
- **No mass programmatic content without pillar/lighthouse guides.** [INFERRED — pattern observed in NerdWallet, Healthline core-update analysis]
- **No hidden prompt-injection content** intended to manipulate AI summaries. Microsoft has framed this category as "AI Recommendation Poisoning" in its prompt-injection security guidance. [LIKELY — Microsoft has discussed this category; exact framing varies]

### 7.3 Dragon Copilot ≠ Copilot Health

Microsoft's Dragon Copilot transparency whitepaper documents an "Intent Classification Module" that rejects prompts related to medical advice or clinical decision-making, plus a "Dynamic Blocklist." These mechanisms apply to **Dragon Copilot** (clinician documentation tool), not consumer Copilot Health. Do not conflate the two when reasoning about consumer-facing AI behavior. [CONFIRMED PRIMARY]

---

## 8. Validation Hooks

For each framework rule, the enforcement mechanism. Implementation work happens after Jacob approves this framework (separate refactor doc).

### 8.1 Enforcement Type Per Rule

Three enforcement types, distinguished because they need different infrastructure:

- **[STATIC]** — A regex / word-count / DOM check can verify this. Hardcode into a validator script.
- **[LLM-JUDGE]** — Requires content judgment (e.g., "is this paragraph self-contained?"). Enforce via writer agent prompt and verifier agent check; static validator cannot reliably check.
- **[MANUAL]** — Requires editorial review. Add to per-page audit checklist.

### 8.2 Severity Tiers

Each validator check supports two modes:

- **`strict`** — Fails the build. Used for new pages and pages flagged for retrofit.
- **`warn`** — Outputs a warning, build proceeds. Used as the default for retrofitted existing content.

The prebuild script runs `warn` mode on the existing 36 blog posts + 20 template pages and `strict` mode on any page modified or newly created in the current build. New writer-agent output gets `strict` from day one.

### 8.3 Writer Agent Prompt Additions

Each `.claude/agents/coveredusa-*-writer.md` should enforce at generation time:

| Rule | Enforcement | Writer-agent instruction |
|---|---|---|
| 150–300 word paragraphs | [LLM-JUDGE] | "Each paragraph in introParagraphs, detailSections, explanationParagraphs, and FAQ answers should be 150–300 words. FAQ answers may run shorter (80–150 words) for conversational pacing. Aim for the middle of the range." |
| 25–35% structural proportion | [LLM-JUDGE] | "Combined word count of all tables + lists should approximate 25–35% of total page word count. If below 25%, add a comparison table or structured list. If above 35%, expand prose." |
| First-50-words direct answer | [LLM-JUDGE] | "The first 50 words of the page body (quickAnswer + first introParagraph) must contain a direct numeric or decisive answer to the page's primary query." |
| Named entity in paragraph-opening sentences | [LLM-JUDGE] | "The first sentence of each paragraph must explicitly name the primary entity (e.g., 'California Medicare Advantage plans,' not 'these plans'). Subsequent sentences may use pronouns with a clear referent." |
| 8 fan-out variants for H2 mapping | [LLM-JUDGE] | "Generate H2 sections that cover the fan-out variants applicable to the page type (Equivalent, Follow-up, Generalization, Specification, Canonicalization, Translation, Entailment, Clarification). Not all variants apply to every page; aim for at least 4-5 of the 8 covered by distinct H2 sections." |
| `<strong>` density | [LLM-JUDGE] | "Apply visual emphasis (markdown **bold**) to 5–10% of total content. Prioritize sentence-initial positions on core entities, dollar amounts, dates, and key claims." |

### 8.4 Validator Script Checks

| Rule | Enforcement | Validator check | Default mode |
|---|---|---|---|
| Paragraph length | [STATIC] | Count words per paragraph; warn if < 80 or > 400, fail (strict) if < 50 or > 500 | warn |
| Em-dash ban | [STATIC] | `grep -c -- "—"` (em-dash only, NOT en-dash) → must be 0. **En-dashes between digits in price ranges (e.g., `$400–$3,500`) are allowed.** Validator regex: match em-dash anywhere, en-dash only when not between digits. | strict |
| Heading depth | [STATIC] | No H5 or H6 in rendered output | strict |
| Schema completeness | [STATIC] | Build-time check for required schemas per template (already implemented for 7 templates) | strict |
| Sources count | [STATIC] | Minimum 3 sources per page (already enforced) | strict |
| Year freshness | [STATIC] | Page contains current year in title, H1, meta description, and first paragraph (only for year-anchored page types — see Section 5.4 for glossary exceptions) | strict |
| Author byline | [STATIC] | Visible byline + JSON-LD `author` field present (already enforced) | strict |
| Spanish parity | [STATIC] | Every LocalizedString has both `en` and `es` populated (already enforced) | strict |
| Internal link density | [STATIC] | Internal links per 150-word chunk between 0 and 2 (warn if > 3) | warn |
| Structural proportion | [STATIC] | Combined `<table>` + `<ul>` + `<ol>` content as fraction of total body content; warn if outside `[0.20, 0.40]`, fail if outside `[0.10, 0.50]` | warn |

### 8.5 Build-Time Gates

- TypeScript compile passes (`npx tsc --noEmit`).
- Next build passes (`npx next build`).
- All `strict`-mode validators pass (`prebuild` script).
- `warn`-mode validators output warnings to a build log for review but do not fail.
- Sitemap regenerates with current `lastmod`.

### 8.6 Post-Publish Automation

- IndexNow ping on every published edit (extend Stage 2 cron to fire on edits to existing pages, not just new publishes).
- Sitemap `lastmod` updates on file change.
- Schema `dateModified` parity with sitemap.
- Visible "Updated" date in page header matches `dateModified`.

---

## 9. Open Questions / Future Tests

These are intentionally unresolved. Surface them in any future framework revision.

1. **Exact Bing/Copilot embedding model is undisclosed.** E5 family is the strongest inference. [UNKNOWN]
2. **Exact consumer Copilot subquery count is undisclosed.** Microsoft's Azure agentic example gives ~3 average; operator estimates of 8–12 have no primary source. [CONTESTED]
3. **Exact DOM-mutation threshold for re-embedding is undisclosed.** Test: A/B 5%, 10%, 20% token changes; monitor time-to-reindex via Bing AI Performance Report. [UNKNOWN]
4. **Bing AI Performance Report has no public API.** UI-only as of May 2026. Microsoft has not announced an API roadmap. [ABSENCE DOCUMENTED]
5. **Cross-encoder schema weighting coefficients are unpublished.** Test: A/B identical content with and without Dataset / FAQPage schema. [UNKNOWN]
6. **Copilot Health allow-list expansion mechanism is opaque.** No public application path. [ABSENCE CONFIRMED]
7. **Challenger displacement timeframe is undisclosed.** Test: monitor highly volatile queries (monthly premium changes) and clock how fast a Bing-organic challenger displaces an entrenched citation. [UNKNOWN]
8. **Generalizability of Search Influence's evaporation curve.** N=1 domain dataset; not validated across publishers. Test: replicate with our own Bing AI Performance Report data once meaningful citation volume accumulates. [SINGLE-DATASET]
9. **Microsoft's specific "passage-based not URL-based" framing.** Microsoft's actual language is "Grounding indexing is being built to help AI systems decide what to say." The passage interpretation is sound but technically inferred. [LIKELY]

---

## 10. Source Index

Each citation in this doc maps to a source below. URLs verified as of 2026-05-14.

### Microsoft Primary Sources

- [Microsoft Bing — Building the New Bing (Prometheus, Feb 2023)](https://blogs.bing.com/search-quality-insights/february-2023/Building-the-New-Bing)
- [Microsoft Bing — Evolving role of the index (May 2026)](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers)
- [Microsoft Bing — Elevating the Role of Grounding (Feb 2026)](https://blogs.bing.com/search/February-2026/Elevating-the-Role-of-Grounding-on-the-AI-Web)
- [Microsoft Bing Webmaster — AI Performance Public Preview (Feb 2026)](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)
- [Microsoft Bing Webmaster — Sitemaps in AI-Powered Search (July 2025)](https://blogs.bing.com/webmaster/July-2025/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search)
- [Microsoft Bing Webmaster — data-nosnippet Support (October 2025)](https://blogs.bing.com/webmaster/October-2025/Bing-Introduces-Support-for-the-data-nosnippet-HTML-Attribute)
- [Azure AI Search — Hybrid Search Overview](https://learn.microsoft.com/en-us/azure/search/hybrid-search-overview)
- [Azure AI Search — Semantic Ranking Overview](https://learn.microsoft.com/en-us/azure/search/semantic-search-overview)
- [Azure AI Search — Agentic Retrieval Overview](https://learn.microsoft.com/en-us/azure/search/search-agentic-retrieval-concept)
- [Microsoft 365 Copilot — Web Search Data, Privacy, Security](https://learn.microsoft.com/en-us/microsoft-365-copilot/manage-public-web-access)
- [Microsoft AI — Introducing Copilot Health](https://microsoft.ai/news/introducing-copilot-health/)
- [Microsoft Learn — Dragon Copilot Transparency White Paper](https://learn.microsoft.com/en-us/industry/healthcare/dragon-copilot/whitepapers/transparency)

### Academic Sources (Peer-Reviewed Equivalent)

- [arXiv 2604.25707 — From Citation Selection to Citation Absorption (April 2026)](https://arxiv.org/abs/2604.25707)
- [arXiv 2603.29979 — Structural Feature Engineering for Generative Engine Optimization / GEO-SFE (March 2026)](https://arxiv.org/abs/2603.29979)
- [arXiv 2311.09735 — GEO: Generative Engine Optimization (foundational)](https://arxiv.org/abs/2311.09735)

### Operator / Industry Sources

- [Seer Interactive — 87% of SearchGPT Citations Match Bing's Top Results](https://www.seerinteractive.com/insights/87-percent-of-searchgpt-citations-match-bings-top-results)
- [Seer Interactive — Where Organic Search & AI Traffic Behave the Same and Where They Diverge (247-URL study)](https://www.seerinteractive.com/insights/where-organic-search-ai-traffic-behave-the-same-and-where-they-diverge-a-study-of-2-years-of-blog-data)
- [Search Influence — Inside Bing's New AI Performance Report (91-day Copilot citations analysis)](https://www.searchinfluence.com/blog/bing-ai-performance-report-copilot-citations/)
- [Ahrefs — Do AI Assistants Prefer to Cite Fresh Content? (16.975M citations)](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/)
- [Ahrefs — Schema Markup and AI Citations Study](https://ahrefs.com/blog/schema-ai-citations/)
- [SE Ranking — How to Optimize for AI Mode (2.3M pages study)](https://seranking.com/blog/how-to-optimize-for-ai-mode/)
- [Cyrus Shepard / Zyppy — AI Citation Ranking Factors (54-study synthesis)](https://signal.zyppy.com/p/ai-citation-ranking-factors)
- [iPullRank — Expanding Queries with Fan-Out](https://ipullrank.com/expanding-queries-with-fanout)
- [Search Engine Land — How to Optimize for Query Fan-Out](https://searchengineland.com/guide/how-to-optimize-for-query-fan-out)
- [Surfer SEO — AI Citation Report (46M citations across Google AI Overviews)](https://surferseo.com/blog/ai-citation-report/)

### Secondary Reporting (Copilot Health Allow-List)

- [Newsweek — Microsoft Copilot Update Includes Care Navigation, Harvard Health (October 2025)](https://www.newsweek.com/microsoft-copilot-update-includes-care-navigation-harvard-medical-access-health-10928582)
- [Healthcare Brew — Microsoft Launches AI Platform, Copilot Health](https://www.healthcare-brew.com/stories/2026/03/12/microsoft-launches-ai-platform-copilot-health)
- [Healthcare Digital — Copilot Health: Microsoft's Major Move Into Consumer Healthcare](https://www.healthcare.digital/single-post/copilot-health-microsoft-s-major-move-into-consumer-healthcare)

---

## 11. Next Steps (Post-Approval)

After Jacob reviews and approves this framework:

1. **Write `specs/CURRENT_STATE_AUDIT.md`** — score every existing template, writer agent, and sample page against the rules in this framework. Produce a per-template gap report.
2. **Write `specs/REFACTOR_PRIORITY.md`** — rank gaps by (impact × pages affected) / effort. Drives the actual implementation work.
3. **Implement the refactor.** Writer agents, validators, structured-data.ts, page templates updated to enforce framework rules.
4. **Build the first lighthouse page** (`/qa/aca-subsidy-eligibility-2026`) using the framework as the rubric from page-1.
5. **Set up the maintenance cadence cron** for monthly substantive updates on top-citation pages.
6. **Monitor Bing AI Performance Report monthly** (Section 6.6 workflow) to identify emerging grounding queries.

### Measurement / A-B Reservation

To distinguish framework-driven gains from noise, the refactor must preserve at least one control cohort per template:

- For each template, leave one existing page **untouched** while the others are refactored. Compare 30-day and 90-day Copilot citation counts.
- The first lighthouse (`/qa/aca-subsidy-eligibility-2026`) is the framework-positive cohort; the closest comparable existing Q&A page (e.g., `/qa/does-medicare-cover-dental`) is the control.
- If after 90 days no measurable delta exists, surface the result in the Open Questions section and reassess which rules actually move the needle.

This deliberately holds back full refactoring until we have one cycle of feedback. Without holdouts we cannot attribute any future citation change to any specific rule.

### Key file paths for the refactor

| File | Purpose |
|---|---|
| `.claude/agents/coveredusa-*-writer.md` | 8 writer agents (article, procedure, drug, qa, glossary, event, persona, ma-state) |
| `.claude/agents/coveredusa-*-verifier.md` | 8 verifier agents — parallel to writers |
| `.claude/claudeclaw/jobs/coveredusa-seo-stage1.md` + `stage2.md` | Daily SEO cron pair |
| `.claude/claudeclaw/jobs/coveredusa-*-bulkgen.md` | Per-template on-demand bulkgen crons |
| `projects/covered-usa/src/lib/structured-data.ts` | Schema helpers (MedicalWebPage, FAQPage, Dataset, etc.) |
| `projects/covered-usa/src/lib/{procedures,drugs,qa,glossary,events,personas,medicare-advantage}.ts` | TypeScript loaders for each template |
| `projects/covered-usa/src/app/[locale]/{cost,drug,qa,glossary,event,for,medicare-advantage}/[slug]/page.tsx` | 7 dynamic route templates |
| `projects/covered-usa/scripts/validate-*.js` | 7 validators wired into prebuild |
| `projects/covered-usa/content/data/{procedures,drugs,qa,glossary,events,personas,medicare-advantage}/*.json` | Source data files |
| `projects/covered-usa/content/blog/*.md` | 36 daily SEO blog posts (MDX) |

---

## 12. Glossary

Terms used throughout this framework, defined consolidated:

- **Absorption** — When the LLM incorporates text from a retrieved source into the generated answer. Visible citations come from absorption, not from selection alone.
- **Selection** — The retrieval step. Pulls candidate URLs into the LLM's context window. Selection is necessary but not sufficient for citation.
- **Cluster representative** — When near-duplicate URLs exist, the grounding index groups them and elevates one as the authoritative representative for the cluster. The others are discarded.
- **Fan-out variant** — One of 8 types of sub-query the LLM routing layer generates from the user's prompt (Equivalent, Follow-up, Generalization, Specification, Canonicalization, Translation, Entailment, Clarification).
- **Grounding index** — Bing's index optimized for AI answer support, distinct from the traditional ranking index. Operates on passages/chunks rather than URL-level documents.
- **Grounding query** — The actual generated sub-query Bing/Copilot uses to retrieve a cited URL. Visible in Bing Webmaster Tools' AI Performance Report (sampled) and Microsoft 365 Copilot citation details (24-hour window).
- **Lighthouse page** — A hand-engineered authoritative page designed to win its query space and anchor a cluster of supporting "spoke" pages. Each template has 1–3 designated lighthouses (see Phase 4 plan).
- **Cluster (or hub-and-spoke)** — A lighthouse plus its set of related programmatic / specification pages that link up to it.
- **Hard number / Soft model** — Hard numbers are arXiv-verified engineering targets (paragraph length, structural %). Soft models are mental frameworks (the 5 absorption-influence components) that inform engineering judgment but should NOT be engineered to specific ratios.
- **YMYL** — "Your Money or Your Life" — Google/Bing classification for health/finance/legal content with elevated trust requirements.

---

## 13. Worked Example: `/cost/mri` Through All 14 Categories

A walkthrough of the existing `/cost/mri` page against each rule in Section 4. This is the audit pattern to repeat for every page once the framework is approved. Status: **as-of 2026-05-14** read of `content/data/procedures/mri.json` + `src/app/[locale]/cost/[procedure]/page.tsx`.

| § | Rule | MRI page status | Action |
|---|---|---|---|
| 4.1 | Stable canonical URL `/cost/mri` | ✅ Pass | None |
| 4.1 | Year not in slug | ✅ Pass | None |
| 4.2 | Year in title | ✅ Pass — "MRI Cost Without Insurance in 2026" | None |
| 4.2 | Numeric specificity in title | ⚠️ Title doesn't include a dollar figure | Consider "MRI Cost $400–$3,500 in 2026" |
| 4.3 | H2s mapped to fan-out variants | ⚠️ Partial — has Equivalent, Specification, Entailment; missing Clarification + Generalization | Add H2 sections for "When is an MRI medically necessary?" (Clarification) and "How does MRI compare to other imaging?" (Generalization) |
| 4.3 | Heading depth H2–H4 only | ✅ Pass | None |
| 4.4 | Direct numeric answer first 50 words | ✅ Pass — hero subhero "Without insurance, an MRI typically costs $400 to $3,500" | None |
| 4.4 | Sentence-initial `<strong>` on entities | ⚠️ Underused — markdown is plain prose | Audit body for sentence-initial bold; target 5–10% density |
| 4.5 | 150–300 word paragraphs | ⚠️ Mixed — introParagraphs are ~50–80 words each (short of 150 target) | Expand intro paragraphs to 150–300; aim for the middle of the range |
| 4.5 | Named entity in paragraph-opening sentences | ⚠️ Some paragraphs open with "It" / "The same scan" | Sweep and replace with "An MRI" / "The MRI scan" |
| 4.6 | 25–35% tables + lists proportion | ✅ Likely pass (site-of-service table + variant table + factors list + billing-errors list + 8-FAQ block) | Confirm with actual word-count math |
| 4.6 | Tables for numeric data | ✅ Pass | None |
| 4.6 | `<th>` headers + `<caption>` | ✅ Pass via `ReferenceTable` component | None |
| 4.7 | MedicalWebPage + MedicalProcedure + Dataset + FAQPage + BreadcrumbList | ✅ Pass | None |
| 4.8 | Visible credentialed byline | ✅ Pass — "By Jacob Posner, Founder & Editor" | None |
| 4.8 | Medical reviewer | ❌ Gap — no `reviewedBy` populated | Source a credentialed reviewer (see Open Questions) |
| 4.9 | Inline .gov citations | ✅ Pass — CMS PFS, CMS OPPS, FAIR Health cited in sources array | Consider adding inline bracketed [1] [2] citations in body, not only in sources block |
| 4.10 | Internal links to /medicare-eligibility, /federal-poverty-level, /medical-bill-analyzer | ✅ Pass — 3 relatedLinks | None |
| 4.11 | `dateModified` syncs sitemap lastmod + visible "Updated" | ✅ Pass via `lastUpdated` field | None |
| 4.11 | IndexNow ping on edit | ❌ Gap — Stage 2 cron pings on publish only, not on edit | Extend Stage 2 cron |
| 4.11 | Monthly numeric refresh | ❌ Gap — no maintenance cadence cron exists | Build maintenance cron |
| 4.12 | Bidirectional `hreflang` | ✅ Pass | None |
| 4.12 | High-fidelity Spanish | ✅ Pass | None |
| 4.13 | Server-rendered core content | ✅ Pass — Next.js SSR | None |
| 4.13 | Mobile responsive | ✅ Pass | None |
| 4.14 | `Bingbot` + `OAI-SearchBot` + others allowed | ⚠️ Audit needed — check site `robots.txt` against the table in Section 4.14 | Audit |
| 4.14 | No content hidden behind tabs/JS | ✅ Pass | None |
| Style | Em-dash audit | ❌ Found in meta title — "MRI Cost Without Insurance in 2026 — National Pricing Guide" | Replace em-dash with colon or pipe |

**Net assessment for MRI:** ~15 of 20 rules pass cleanly; 5 partial-pass / clear gaps; 3 require new infrastructure (reviewer source, IndexNow on edit, maintenance cron). The MRI page is one of our better-engineered procedure pages; expect similar or worse status on other procedure pages, drug pages, and especially the 36 daily blog posts.

---

## 14. Quick-Reference Card

For agents and validators that don't need the full doc — the 5 hardcoded numeric targets + the 8 fan-out variants + the cadence table.

### The 5 Hard Numbers (arXiv 2603.29979)

| Target | Value |
|---|---|
| Paragraph length | 150–300 words (FAQ 80–150 acceptable) |
| Structural element proportion | 25–35% of page body |
| Heading hierarchy depth | H2–H4 only |
| Visual marker (`<strong>`) density | 5–10% of content |
| First answer position | Within first 50 words |

### The 8 Fan-Out Variants

For H2 mapping per page's primary entity:

1. **Equivalent** — alt phrasing same intent
2. **Follow-up** — sequential build
3. **Generalization** — broader version
4. **Specification** — narrower (year, state, sub-type)
5. **Canonicalization** — industry-standard terminology
6. **Translation** — cross-lingual representation
7. **Entailment** — implied consequence/prerequisite
8. **Clarification** — disambiguation

### Maintenance Cadence Table

| Template | Cadence | Rollover trigger |
|---|---|---|
| Procedure cost | Monthly | Pricing volatility |
| Drug cost | Quarterly | PAP/formulary changes |
| Q&A | Quarterly minimum | Coverage rule changes |
| Glossary (monetary) | Annual + mid-year on value change | Year rollover |
| Glossary (concept) | Quarterly review | Concept change only |
| Event | Annual + AEP refresh | AEP open/close |
| Persona | Quarterly | Tax/income rule changes |
| State MA | Biannual (pre + post AEP) | AEP open/close |
| Daily blog (top citations) | Quarterly review | High-citation list refresh |
| Hardcoded reference | Monthly for income-limit pages | Numeric value changes |

### Decision Tree — "What Should I Do Right Now?"

```
Am I writing a NEW page?
  YES → Use Section 5 (per-template playbook) + Section 4 (rules) + strict-mode validator from day one
  NO ↓

Am I auditing an EXISTING page?
  YES → Walk Section 13's worked-example pattern, score per Section 4, log gaps
  NO ↓

Am I REFACTORING a writer agent?
  YES → Apply Section 8.3 (writer-agent prompt additions) for the template, grade-tag each rule
  NO ↓

Am I MAINTAINING an existing page?
  YES → Section 6.2 (substantive update protocol) + Section 6.6 (Bing AI Performance Report) + IndexNow ping
```

---

*Framework v1.1 — revised after two-reviewer pass (adversarial critic + fresh-eyes review). Subsequent revisions should preserve evidence grading and update Open Questions as new data arrives.*
