# Deep Research Prompt — Reverse-Engineering Bing/Copilot AI Citation Mechanics

**Purpose:** Copy-paste prompt for a deep research agent (Google Deep Research, GPT Deep Research, Perplexity Pro Deep Research, Claude Research, etc.).
**Owner:** Jacob Posner, CoveredUSA
**Saved here:** `specs/research/grounding-mechanics-deep-research-prompt.md`
**Once research lands, save the report to:** `specs/research/grounding-mechanics-reverse-engineering.md` and we'll integrate it into the Phase 4 plan.

---

```
# Research Brief: Reverse-Engineering Bing/Copilot AI Citation Mechanics

## Mission

I need you to produce a definitive, evidence-graded technical specification of how Microsoft Bing's grounding index and Microsoft Copilot decide which web pages to cite when answering user queries — at sufficient depth that I can reverse-engineer my content to meet every element the algorithm rewards. This is the foundational document I will engineer every future page against. Generality and "best-practice" advice are useless. I need mechanisms, signals, weights, thresholds, decay curves, and named technical primitives.

The output of this research will directly drive 200+ engineering decisions on a healthcare information site that is positioning around Bing + Copilot citations (not Google). I cannot afford guesswork.

## Who I Am and Why This Matters

I run CoveredUSA (coveredusa.org), a healthcare-information site optimized for Bing + Copilot citations. Strategic premises (already validated by prior research):

- Microsoft Bing is the underlying engine for Microsoft Copilot. 87% of SearchGPT (ChatGPT Search) citations match Bing's top organic results per Seer Interactive's analysis. So Bing optimization buys visibility on Bing organic + Copilot + ChatGPT Search simultaneously.
- The Bing AI Performance Report (launched Feb 9, 2026 in Bing Webmaster Tools) is the only first-party Copilot citation telemetry currently available.
- Citation distribution is power-law: in Microsoft's published launch dataset, 5 pages drove 74.6% of all Copilot citations. In Search Influence's independent 20,000-citation analysis, 1 URL captured 69% and the top 4 captured 90%. Programmatic pages individually contribute ~1–5%.
- Microsoft has stated Bing now operates at passage/chunk level not URL level ("Evolving role of the index: From ranking pages to supporting answers," May 2026).
- Microsoft has confirmed a "cluster representative" mechanic: "LLMs group near-duplicate URLs into a single cluster and then choose one page to represent the set" (Bing Webmaster Blog, Dec 2025).
- Microsoft Copilot Health (launched March 2026) applies an explicit per-vertical trust filter naming Harvard Health, JAMA, National Academy of Medicine, HealthEx, Mayo Clinic, Cleveland Clinic, Kaiser Permanente.
- Search Influence's 91-day longitudinal data shows a 97% citation drop in 60 days for content that was not actively updated — the "evaporation" effect.

What I do NOT yet have, and what I need this research to produce:

1. The actual technical mechanism of Bing's grounding-index retrieval pipeline (embedding model, chunking strategy, reranker, scoring formula).
2. The actual mechanism of query fan-out — where in the pipeline it happens, how many sub-queries are generated, what variant types, whether the fan-out set is predictable.
3. Chunk-level signal scoring at engineering precision — semantic similarity vs lexical match vs page rank vs freshness vs extractability vs provenance vs schema.org context, with weights or strong rankings.
4. The actual evaporation mechanism — decay curve shape, the specific signals Bing reads for freshness, semantic drift vs factual currency as separate phenomena, the challenger/displacement mechanic.
5. An actionable per-page engineering checklist (80–120 items) covering every element a page should hit to maximize citation probability.
6. Three worked examples reverse-engineering existing CoveredUSA pages against that checklist with specific fixes.

## Core Research Questions

Answer each in order. For each, prioritize primary sources (Microsoft Learn, Bing Engineering Blog, Microsoft AI announcements, academic arXiv papers) over secondary commentary. Where primary sources are absent, label inferences explicitly.

### Part 1 — Bing Grounding Index Mechanics

1.1. **Retrieval pipeline architecture.** What is the actual end-to-end pipeline from "user submits prompt to Copilot" to "chunks are retrieved from Bing's grounding index"? Specifically:
- How does Microsoft architect this internally? Is the grounding index a separate vector store, a slice of the main Bing index, or a hybrid?
- What embedding model does Bing use for chunk vectorization? (Microsoft research papers on E5, OpenAI's text-embedding-3, BERT variants — what's the current state of the art at Microsoft as of 2025-2026?)
- Is retrieval pure semantic (dense vector), pure lexical (BM25), or hybrid? What's the weighting?
- Is there a reranker model applied after first-pass retrieval? (Microsoft has published research on monoT5, cross-encoders.)
- What's the typical retrieval depth — top-K = 5? 10? 50?

1.2. **Chunking strategy.** How are pages chunked for retrieval?
- Typical chunk size — 256 tokens? 512? 1024? Variable?
- Overlap between adjacent chunks?
- Boundary detection — sentence break, paragraph break, heading boundary, or semantic chunking?
- Per-URL chunk cap — what's the max chunks pulled from any single page per query?
- How do chunks inherit page-level metadata (URL, title, dateModified, schema)?

1.3. **Chunk scoring formula.** Once chunks are retrieved, what determines which ones the LLM actually uses to ground the answer?
- Semantic similarity (embedding cosine) — confirmed signal, but what weight?
- Lexical overlap (BM25 score) — confirmed weight?
- Source page Bing organic rank — does it carry through to chunk score?
- Source page domain authority signals (backlinks, brand mentions)
- Freshness signal (dateModified, lastmod, content age)
- Provenance (inline source citations within the chunk pointing to high-authority domains like CMS.gov, NIH.gov)
- Schema.org context (does FAQ/Article/Dataset markup boost chunk eligibility?)
- Position-on-page (top of page weighted higher than bottom?)
- Chunk extractability (self-contained, numeric, named entities) — is this a named signal or inferred?

1.4. **Citation attribution.** When the LLM generates an answer using chunks from multiple pages, how does it decide which URL to cite for which claim?
- Is there a "primary source per claim" attribution model?
- Is there an explicit diversity constraint (don't cite the same URL more than N times in one answer)?
- Does Copilot bias toward attributing to fewer URLs (the "seed source" pattern)?
- How does this differ across Copilot vs ChatGPT Search vs Perplexity vs Claude.ai (which all use Bing for retrieval)?

### Part 2 — Query Fan-out Mechanism

2.1. **Architectural location.** Where in the pipeline does query fan-out happen?
- Is it at the LLM layer — Copilot's underlying model (GPT-4, GPT-5) decomposes the user prompt into sub-queries before any retrieval call?
- Or at the retrieval layer — Bing's grounding index receives the prompt and decomposes internally?
- Or both — Copilot generates an initial decomposition, retrieves, then iteratively refines with follow-up sub-queries?
- Source the answer to publicly published Microsoft technical docs, Microsoft Build talks 2024-2026, OpenAI research on Q-decomposition, or academic literature on RAG fan-out.

2.2. **Sub-query generation.** How many sub-queries are generated per user prompt? What types?
- iPullRank reports 8-12 sub-queries for typical Copilot answers, hundreds for Deep Search. Confirm with primary or secondary research.
- Variant types: equivalent, follow-up, generalization, specification, canonicalization, translation, entailment, clarification (per iPullRank). Confirm completeness; add any missed types.
- User-attribute injection: does Bing/Copilot automatically inject location, current year, language into fan-out variants? Microsoft has implied yes; find primary-source confirmation.

2.3. **Predictability.** Can a content operator predict the fan-out set for a given user prompt?
- Is there a tool, API, or technique to generate the likely fan-out set programmatically?
- Are the "grounding queries" surfaced in the Bing Webmaster Tools AI Performance Report the actual fan-out queries Bing used? Confirmed or inferred?
- If we know the fan-out queries, we can engineer pages to match them. Is this approach in use by AI-SEO operators (Aleyda Solis, Cyrus Shepard, Andrew Holland, Lawrence Hitches)?

### Part 3 — Freshness + Evaporation Mechanism

3.1. **The decay curve.** What does the actual citation-decay curve look like for a page that has stopped being updated?
- Linear, exponential, stepped, or hybrid?
- Plot the empirical curve using available data: Search Influence's 91-day longitudinal data (Nov 12, 2025 → Feb 10, 2026, 97% drop), SE Ranking's 3-month-threshold finding (3.6 vs 6 citations for stale vs fresh), Ahrefs' 17M-citation freshness study, Position.Digital's roundup.
- Does the curve differ by query type — year-anchored vs definitional vs how-to vs comparison?
- Is there a freshness "cliff" at specific intervals (e.g., 30 days, 90 days, 365 days)?

3.2. **Freshness signals.** What signals does Bing actually read to determine if a page is fresh?
- Schema.org `dateModified` — confirmed signal, but pure date bumps without content change apparently don't pass. Where's the threshold?
- Visible "Updated [date]" line in page body — does Bing parse this?
- Sitemap `lastmod` — confirmed (Bing July 2025 blog).
- IndexNow ping timestamp — confirmed signal, what's the freshness boost window post-ping?
- HTTP `Last-Modified` header — does Bing read it?
- Content diff at chunk level — Microsoft has hinted at this (May 2026 blog "chunking preserves meaning"). What's the technical mechanism — content hash, embedding drift, both?
- Outbound link freshness — does Bing penalize pages that cite stale primary sources?

3.3. **Two evaporation mechanisms — semantic drift vs factual currency.**
- Semantic drift: query fan-out changes over time (e.g., "2024 FPL" sub-query in 2024 → "2026 FPL" sub-query in 2026). Older pages match fewer current sub-queries.
- Factual currency: the world changes (regulations, prices, programs sunset). Content that was correct becomes wrong. Bing's grounding index may explicitly detect this via cross-reference with newer sources.
- Which mechanism dominates? Search Influence's data is the strongest longitudinal evidence; reinterpret their findings through this lens.
- Implication for URL strategy: stable URLs (`/cost/mri`) with content updates vs. year-anchored URLs (`/cost/mri-2026`) that get retired each year. Which approach does the evidence favor?

3.4. **Challenger / displacement mechanism.** How does a new page displace an entrenched cluster representative?
- Is there an explicit "challenger detection" algorithm, or does displacement emerge from underlying score changes?
- Has anyone documented a specific A → B citation displacement with dates and root cause? Search published case studies.
- What's the brand-entity-trust threshold before a challenger can win? Ahrefs' 75K-brand study (correlations: 0.66–0.71 for branded mentions, 0.35–0.47 for branded search volume) — convert this to operational guidance.
- Typical time-to-displace for a fresh-but-low-authority challenger entering a slot held by KFF/Mayo Clinic/Medicare.gov?

3.5. **Active maintenance practices ranked by effectiveness.** What specifically counts as "real maintenance" that prevents evaporation?
- Pure dateModified bump (probably ineffective alone)
- Adding new sections
- Refreshing numeric values in existing sections
- Adding new FAQ entries
- Adding new inline source citations
- Restructuring headings (introducing new H2s)
- Adding new internal links
- Adding images / tables / Dataset schema
- Adding Speakable selectors
- Re-publishing with new date stamp
- Issuing an IndexNow ping

Rank these by reported effectiveness based on empirical operator data. What's the minimum content delta to trigger Bing's "this is fresh" recognition?

### Part 4 — Microsoft Copilot Health and YMYL Vertical Filters

4.1. **Copilot Health's allow-list.** Microsoft Copilot Health names Harvard Health, JAMA, National Academy of Medicine, HealthEx, Mayo Clinic, Cleveland Clinic, Kaiser Permanente as trusted sources. Beyond this:
- Is this allow-list applied to ALL Copilot health-related answers, or only to the dedicated Copilot Health surface?
- Can a non-allow-listed publisher still earn citations from Copilot Health, or are they strictly excluded?
- What's the application path to be added to the allow-list — confirmed criteria, confirmed contact?
- How does Microsoft's clinical team verify additions?
- Has Microsoft announced similar per-vertical filters for finance, legal, education, or other YMYL verticals?

4.2. **Operational implications.** For a non-allow-listed health publisher like CoveredUSA:
- Compete on the broader Copilot surface (non-Copilot-Health queries) — which is most healthcare queries
- Compete in unclaimed adjacent territory (medical-bill analysis, ACA navigation, Medicare cost optimization, drug pricing transparency)
- What's the empirical evidence that non-allow-listed health publishers can still win significant citation share?

### Part 5 — Cross-Engine Alignment and Divergence

5.1. **Bing → Copilot fidelity.** What's the actual rate of "Bing top-3 result is also Copilot citation"? Seer Interactive's 87% number — is this query-dependent?

5.2. **Bing → ChatGPT Search.** Same question. 87% per Seer.

5.3. **Bing → Claude.ai search and Perplexity.** What's the citation overlap with Bing organic for these other engines? Where do they diverge?

5.4. **Divergence cases.** When does AI cite a page that ISN'T in Bing's top organic? Specifically:
- Training-data residue (Wikipedia gets cited even when ranking lower because the model knows it from pretraining)
- Aggregator / news / "best of" listicles cited despite weaker Bing rank
- Fan-out-rank wins (page ranks for sub-queries but not the main head query) — Search Engine Land found ~68% of cited pages don't rank top-10 for the main query but DO rank for fan-out queries
- Schema-rich pages with weak rank winning citation
- Long-tail query specificity where Bing organic is sparse

5.5. **Signals that matter MORE for AI than for Google organic.** Cross-reference Cyrus Shepard's 23-factor analysis with traditional Google ranking factors. Identify specific signals that are AI-unique (Fan-out Rank, Answer-Near-Top, Self-Contained Passages, AI-ready Structure).

### Part 6 — The Per-Page Engineering Checklist

Synthesize everything above into a single actionable per-page engineering checklist. For EACH item, provide:
- **WHAT** (concrete instruction)
- **WHY** (the underlying signal it triggers, citing the research)
- **HOW** (test, validator, or measurement)
- **IMPACT** (high/medium/low based on the research)

Categorize:
1. URL + slug design (year anchors, state anchors, primary keyword position, slug length, URL depth)
2. Title tag + meta description (length caps, keyword position, numeric specificity, year anchor)
3. H1 + heading hierarchy (question form vs declarative, count, depth, semantic structure)
4. First-paragraph design (numeric answer in first 50 words, primary source citation, year anchor, named entities)
5. Per-paragraph chunk design (self-containment, length, named-entity density, pronoun avoidance, internal references)
6. Table + list usage (Dataset schema, comparison structure, footnotes, source attribution)
7. Schema.org graph (MedicalWebPage, FAQPage, Article, Dataset, Speakable, BreadcrumbList, MedicalProcedure, Drug, DefinedTerm, HowTo, Person/Organization for author and reviewer)
8. Author + reviewer attribution (visible byline + JSON-LD, credentials, links to author pages)
9. Inline source citations (primary source links per claim, anchor text patterns)
10. Internal linking (anchor text, density, lighthouse → cluster, cluster → cluster, cluster → lighthouse)
11. Freshness signals (datePublished, dateModified, lastReviewed, visible Updated line, IndexNow ping timing, sitemap lastmod alignment)
12. Spanish parallel (hreflang, separate URL, distinct content, locale-appropriate sources)
13. Mobile + Core Web Vitals + accessibility (basic hygiene that gates indexing)
14. Robots.txt + crawler permissions (allow Bingbot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, GPTBot explicitly)
15. Any other categories the research surfaces

Target: 80–120 specific items. Each one decision-grade.

### Part 7 — Three Worked Examples

Pick three pages from coveredusa.org and reverse-engineer them against the checklist:

1. https://coveredusa.org/en/cost/mri (procedure cost gold standard)
2. https://coveredusa.org/en/medicare-advantage/california (state MA gold standard)
3. https://coveredusa.org/en/for/gig-workers (persona gold standard)

For each: WebFetch the live page, parse the visible content + the embedded JSON-LD schema, score against the checklist. Identify the top 5 highest-impact fixes per page (specific text/schema/structure changes that would meaningfully raise citation probability).

### Part 8 — What We Still Don't Know

Honest assessment of remaining unknowns. What couldn't you find primary-source evidence for? Where did you have to infer? What would require live experimentation to answer (A/B testing two URL versions, observing time-to-citation under controlled freshness conditions, etc.)?

## Source Priorities

Prioritize in this order:

1. **Microsoft primary sources**
   - Microsoft Learn docs: learn.microsoft.com/en-us/bingwebmaster, learn.microsoft.com/en-us/copilot
   - Bing Engineering Blog: blogs.bing.com (search webmaster + search blogs)
   - Bing Webmaster Blog "Evolving role of the index" (May 2026)
   - Bing Webmaster Blog "Introducing AI Performance" (Feb 2026)
   - Bing Webmaster Blog "Optimizing Your Content for Inclusion in AI Search Answers" (Oct 2025)
   - Bing Webmaster Blog "Does Duplicate Content Hurt SEO and AI Search Visibility?" (Dec 2025)
   - Bing Webmaster Blog "Keeping Content Discoverable with Sitemaps in AI-Powered Search" (July 2025)
   - Microsoft AI announcement "Introducing Copilot Health" (March 2026): microsoft.ai/news/introducing-copilot-health
   - Microsoft Build conference talks 2024, 2025, 2026 on Bing AI, Copilot architecture, RAG retrieval, grounding
   - Microsoft Research papers on retrieval (E5 embeddings, BEIR benchmark, REALM, etc.)

2. **Academic papers** (search arXiv)
   - Aggarwal et al., "GEO: Generative Engine Optimization" (arXiv:2311.09735)
   - "Structural Feature Engineering for Generative Engine Optimization" (arXiv:2603.29979)
   - "Citation Selection to Citation Absorption" (arXiv:2604.25707)
   - "Generative Engine Optimization: How to Dominate AI Search" (arXiv:2509.08919)
   - Recent papers on passage-level retrieval, RAG citation attribution, freshness in vector stores

3. **AI-SEO operator research** (rigor varies; cross-reference claims)
   - Cyrus Shepard / Zyppy — 23 AI Citation Ranking Factors
   - Aleyda Solis — AI Search Optimization Roadmap + 3-Layer Framework
   - Andrew Holland (JBH) — programmatic AI-SEO case studies
   - Lawrence Hitches — Microsoft Copilot SEO case study
   - Lily Ray (Amsive) — "Your GEO Strategy Might Be Destroying Your SEO," reflection posts
   - Glen Allsopp (Detailed / Ahrefs)
   - Search Influence — 20,000-Copilot-citation longitudinal analysis
   - Otterly.ai — Bing AI Performance Report analysis
   - ALM Corp — Bing AI Performance guide
   - Pedowitz Group — How Bing Copilot Sources Answers

4. **Major SEO publications**
   - Ahrefs Blog (especially the 75K-brand study, the 17M-citation freshness study, the NerdWallet case study)
   - Search Engine Land (especially the AI Overview fan-out ranking article)
   - Search Engine Journal
   - Seer Interactive (87% SearchGPT/Bing overlap)
   - SE Ranking citation pattern data

5. **Independent operator publications** (highly variable quality)
   - Substack writers covering AI-SEO
   - Twitter / LinkedIn posts from named operators
   - Conference talks (SMX, MozCon, BrightonSEO, Pubcon) where transcripts available

## Anti-patterns — What I Don't Want

Aggressively reject:

- Vague "best practice" advice ("write quality content," "be authoritative") without mechanism
- Citation of stats without source URL
- Speculation presented as fact
- Generalizations across Google and Bing/Copilot (these engines work differently — be specific which one)
- Engagement-metric arguments ("Bing rewards time on page") — Bing doesn't have first-party engagement data on most sites
- "AI loves Schema.org" without specifying which schema types and what weight
- Year-anchored research older than 2024 unless it's an underlying technical paper (RAG mechanics from 2020-2023 are still relevant; SEO advice from 2022 mostly isn't)
- LLM-generated meta-advice (e.g., "to rank in AI search, use AI search optimization") with no underlying evidence
- "Top 10 factors" listicles without methodology

## Evidence Grading Scale

For every claim in the final report, label it with one of:

- **CONFIRMED** — primary-source Microsoft statement, confirmed academic finding, or independent replication across 3+ datasets
- **LIKELY** — strong inferential evidence from 1–2 sources, but no primary confirmation
- **INFERRED** — operator pattern observation or single-source claim
- **SPECULATIVE** — reasoned hypothesis with no direct evidence; flagged for future testing

## Output Format Requirements

Deliver as a single markdown document, 8,000–12,000 words. Use this exact section structure:

1. **Executive Summary** (400–600 words) — the 15 most important findings, ranked by engineering impact
2. **Section 1: Bing Grounding Index Mechanics** — answers to Part 1 questions
3. **Section 2: Query Fan-out Mechanism** — answers to Part 2 questions
4. **Section 3: Freshness + Evaporation Mechanism** — answers to Part 3 questions, including a plotted decay curve in markdown (use a code block with ASCII chart or a table-as-chart)
5. **Section 4: Microsoft Copilot Health + YMYL Filters** — answers to Part 4
6. **Section 5: Cross-Engine Alignment and Divergence** — answers to Part 5
7. **Section 6: Per-Page Engineering Checklist** — the 80–120 item checklist with WHAT/WHY/HOW/IMPACT for each
8. **Section 7: Three Worked Examples** — reverse-engineering /cost/mri, /medicare-advantage/california, /for/gig-workers
9. **Section 8: Open Questions and Future Testing** — what we still don't know

Use markdown tables liberally where appropriate. Cite every claim with a URL in markdown link format. Quote Microsoft statements verbatim where applicable. Distinguish operator opinion from Microsoft fact.

## Success Criteria

The research succeeds if I can read the final report and, for any of my 200+ existing or planned content pages, answer with concrete confidence:

1. What specific elements should this page contain to maximize the probability that Bing's grounding index selects its chunks for citation?
2. What specific maintenance actions, on what schedule, will prevent this page's citation share from evaporating?
3. If a competitor page currently holds the citation slot for this topic, what would it take to displace them?
4. Which schema.org types specifically matter for this page type, and how should they be assembled?
5. How should the first paragraph be structured to maximize "answer near top" scoring?
6. How should chunks be sized and bounded to maximize extractability?
7. What's the exact freshness signal stack I should emit, and at what cadence?

If the report supports those answers with primary-source evidence, you've done your job.

## What to Skip

- Don't repeat well-established Google SEO fundamentals (crawlability, mobile-friendliness, HTTPS) — assume those are done
- Don't dwell on social signals — there's little evidence they matter for AI citation
- Don't give me a 3,000-word section on "AI is the future of search" — that's premise, not research

Now go. Produce the report.
```

---

## How to use this prompt

1. **Copy the entire block between the triple-backtick fences above** (the `# Research Brief...` through `Now go. Produce the report.` content).
2. **Paste into the deep research tool of choice:**
   - **Google Deep Research** (gemini.google.com → Deep Research) — strongest for academic + Microsoft primary source coverage; takes 5-15 minutes.
   - **GPT Deep Research** (chatgpt.com → Deep Research mode if subscribed) — strong for cross-source synthesis; takes 10-30 minutes.
   - **Perplexity Pro Deep Research** — strong on operator/SEO publications; faster (5-10 minutes).
   - **Claude.ai Research** — strong on technical/academic reasoning; takes 10-30 minutes.
3. **Save the output to `specs/research/grounding-mechanics-reverse-engineering.md`** in the covered-usa repo.
4. **Hand it back to Frank** — I'll synthesize the per-page checklist into the actual writer-agent prompts, validators, and dynamic route templates.

## What we expect back

- **8,000–12,000 word report** (deep research tools typically produce 10K-15K word outputs)
- **50–150 cited sources** (Microsoft Learn, Bing Engineering Blog, arXiv papers, Cyrus Shepard, Aleyda Solis, Search Influence, Ahrefs, etc.)
- **An 80–120 item engineering checklist** that we can convert directly into writer-agent prompt updates, validator checks, and structured-data.ts helpers
- **Three worked reverse-engineering examples** with specific page fixes
- **Evidence grading** on every claim (CONFIRMED / LIKELY / INFERRED / SPECULATIVE)

## After it lands

I'll integrate the findings into:
1. `PHASE_4_PLAN.md` — add the engineering checklist as Appendix B
2. `src/lib/structured-data.ts` — add any missing schema helpers (Dataset, Speakable refinements, etc.)
3. Writer agents (`coveredusa-*-writer.md`) — enforce checklist items at generation time
4. Validators (`scripts/validate-*.js`) — fail the build on missing critical elements
5. `<Byline>` and other React components — implement visible-page elements

Then we start writing the 9 lighthouse pages with the checklist as the rubric.
