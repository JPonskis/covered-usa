# Microsoft Copilot Citation Mechanics — Definitive Guide for CoveredUSA

**Date:** 2026-05-13
**Scope:** What signals cause Microsoft Copilot and Bing AI to cite a web page, with primary-source citations. Practical implications for CoveredUSA.

---

## TL;DR — Top 10 Signals, Ranked

Ranked by primary-source confidence. Signals lower on the list are still important; they just have less direct documentation behind them.

1. **Be indexed and rankable in Bing.** Copilot retrieves from Bing's index. If you're not findable in Bing for the grounding query, you cannot be cited. Microsoft confirmed AI citations strongly correlate with traditional Bing rank. [Bing Webmaster Blog, Oct 2025](https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers)
2. **Direct, atomic, extractable answers in plain HTML.** No accordions, tabs, PDFs, or interactive-element gating. The crawler must see the answer in the initial HTML response. [Bing Webmaster Blog, Oct 2025](https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers)
3. **Numeric specificity and named entities.** Statistics, exact dollar/percent figures, and uniquely named entities get cited. Independent research found numbers/statistics produce +61.5% citation absorption uplift; definitions +57.3%. [arXiv 2604.25707](https://arxiv.org/html/2604.25707v2)
4. **Macro structure** (heading hierarchy, navigation, cross-references) — single biggest structural lever. Contributes 44.9% of citation-rate gains; meso (lists, tables, sections) 39.7%; micro (sentence-level emphasis) 15.4%. [arXiv 2603.29979](https://arxiv.org/html/2603.29979)
5. **Freshness via `lastmod` + IndexNow.** Microsoft says "freshness signals directly influence how quickly updates are reflected in… AI generated answers." Sites using IndexNow see citation changes appear 3–7 days after a recrawl. [Bing Webmaster Blog, July 2025](https://blogs.bing.com/webmaster/July-2025/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search) · [ALM Corp guide](https://almcorp.com/blog/bing-ai-performance-webmaster-tools-complete-guide/)
6. **Schema.org structured data**, especially `FAQPage`, `Article`, `HowTo`, `QAPage`, `Dataset`, and vertical-specific types (`MedicalWebPage`, `Drug`, `MedicalProcedure`). Microsoft names schema as a citation signal; healthcare research shows schema-marked medical pages 2x more likely to appear in AI overviews. [Pedowitz Group](https://www.pedowitzgroup.com/how-bing-copilot-sources-answers-aeo-for-microsoft-search) · [Healthcare Success](https://healthcaresuccess.com/blog/healthcare-marketing/technical-seo-schema-making-your-healthcare-site-machine-readable-for-ai.html)
7. **Topical authority concentration.** Search Influence's 20,000-citation analysis found one URL captured 69% of citations and the top four pages held 90%. "Depth beats breadth." Being the *second-best* on a topic often means zero citations. [Search Influence](https://www.searchinfluence.com/blog/bing-ai-performance-report-copilot-citations/)
8. **Brand search volume + earned media** (off-site authority). Ahrefs' 75K-brand study: branded web mentions correlate 0.66–0.71 with AI citation; brand search volume 0.35–0.47; backlink counts weak. The Stacker/Princeton GEO research finds brand search volume is the single strongest predictor. [Ahrefs](https://ahrefs.com/blog/ai-brand-visibility-correlations/) · [Stacker pickup quality](https://stacker.com/blog/pickup-quality-the-x-factor-for-llm-visibility)
9. **For YMYL health content:** named clinical guidelines, named clinician authors with credentials, explicit `reviewedBy` markup, and review dates. Healthcare has the highest citation bar of any vertical. [Stridec AEO for Healthcare](https://www.stridec.com/blog/aeo-for-healthcare/) · [Microsoft Copilot Health](https://microsoft.ai/news/introducing-copilot-health/)
10. **Q&A-shaped headings + direct answer immediately under** — but be careful. Microsoft says "direct questions with clear answers… assistants can often lift these pairs word for word." Independent research on absorption found Q&A *format* alone is slightly negative (-5.7%) without substantive answers behind it. Question H2 + numeric, sourced answer is the winning combination. [Bing Webmaster Blog, Oct 2025](https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers) · [arXiv 2604.25707](https://arxiv.org/html/2604.25707v2)

---

## Public Microsoft Statements

### Microsoft Bing / Webmaster Blog

- **"Optimizing Your Content for Inclusion in AI Search Answers"** (Krishna Madhavan, Principal Product Manager, Bing — Oct 8, 2025): The framework rests on two stages: **discoverability** (page must be in Bing's result set for the grounding query) and **selection** (page must be "clear, structured, and trustworthy enough to win the citation over competitors"). Specific named factors: title/H1/description alignment, descriptive H2/H3 (avoid "Learn More"), lists/tables/comparisons, schema.org JSON-LD, anchor claims in "measurable facts" not adjectives, Q&A pairs. Explicit anti-patterns: accordions, tabbed interfaces, PDFs for core info, key info in images, walls of text. [Source](https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers)
- **"Keeping Content Discoverable with Sitemaps in AI-Powered Search"** (July 2025): "Freshness signals directly influence how quickly updates are reflected in search results and AI generated answers." `lastmod` is "a key signal." IndexNow ensures "changes are surfaced quickly, especially important for freshness in AI search." [Source](https://blogs.bing.com/webmaster/July-2025/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search)
- **"Does Duplicate Content Hurt SEO and AI Search Visibility?"** (December 2025): "LLMs group near-duplicate URLs into a single cluster and then choose one page to represent the set. If the differences between pages are minimal, the model may select a version that is outdated or not the one you intended." Confirms canonicalization, distinct-content rule, and per-locale uniqueness all matter for AI citation. [Source](https://blogs.bing.com/webmaster/December-2025/Does-Duplicate-Content-Hurt-SEO-and-AI-Search-Visibility)
- **"Introducing AI Performance in Bing Webmaster Tools"** (Feb 9, 2026): The dashboard exposes total citations, average cited pages per day, grounding queries, page-level citations, and trends. Named recommendation signals: "Clear headings, tables, and FAQ sections," "deepening coverage in related areas to reinforce authority," "examples, data, and cited sources help build trust." [Source](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)
- **"Evolving role of the index: From ranking pages to supporting answers"** (May 2026): Defines the Bing grounding index. Core signals named: "Chunking/transformations must preserve meaning… Critical," provenance is now a "Core signal," "stale facts can directly produce wrong answers," "must detect and represent conflict." Confirms the architectural shift toward passage-level retrieval. [Source](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers)

### Microsoft Copilot Blog / Microsoft AI

- **"Bringing the best of AI search to Copilot"** (Nov 7, 2025): Confirms inline clickable citations, expandable source pane, dedicated search mode with "richer references and citations." Notes responses are "grounded in the best of the web." [Source](https://www.microsoft.com/en-us/microsoft-copilot/blog/2025/11/07/bringing-the-best-of-ai-search-to-copilot/)
- **"Introducing Copilot Health"** (March 2026): Health verticals get extra trust filtering. Named trusted sources include **Harvard Health, JAMA, National Academy of Medicine, HealthEx (50,000+ U.S. hospitals), Mayo Clinic, Cleveland Clinic, Kaiser Permanente**. Verification is "by Microsoft's clinical team using principles independently established by the National Academy of Medicine." Copilot Health is **ISO/IEC 42001 certified**. [Source](https://microsoft.ai/news/introducing-copilot-health/)

### What Microsoft Has *Not* Confirmed Publicly

- Whether Bing decomposes queries into explicit `(state, program, year)` tuples — **unconfirmed**. Industry consensus describes query fan-out at the entity-attribute level but no Microsoft document names this pattern directly.
- Exact weights of individual schema types — **unconfirmed**.
- Whether `speakable` schema influences Copilot citation specifically — **unconfirmed** (it's a known Google Assistant signal; Microsoft has not committed to it).

---

## Independent Research Findings

### Academic / arXiv

- **GEO: Generative Engine Optimization** (Aggarwal et al., KDD 2024, arXiv:2311.09735). Found GEO methods can boost visibility by **up to 40%**. Including citations, quotations from authoritative sources, and statistics produce the largest uplift. [Source](https://arxiv.org/abs/2311.09735)
- **Structural Feature Engineering for GEO** (arXiv:2603.29979). 17.3% overall citation rate improvement (p<0.001). **Macro structure 44.9% of gains, meso 39.7%, micro 15.4%.** Optimal targets: paragraph length 150–300 words, structured elements 25–35% of content, heading depth 3–5 levels, emphasis on 5–10% of tokens. [Source](https://arxiv.org/html/2603.29979)
- **Citation Selection to Citation Absorption** (arXiv:2604.25707). Distinguishes being cited (selection) from being load-bearing in the answer (absorption). **Top quartile structural pages: 11.4x more word count, 12.5x more headings, 8.9x list density, 5.7x paragraph count.** Evidence-genre uplift: code +76.9%, numbers/statistics +61.5%, definitions +57.3%, comparisons +55.3%, Q&A format alone −5.7%. Mean citations per prompt: ChatGPT 6.88, Google 12.06, Perplexity 16.35. [Source](https://arxiv.org/html/2604.25707v2)
- **GEO: How to Dominate AI Search** (arXiv:2509.08919). Notes AI engines show 69–92% bias toward earned media versus Google's 22–45%. Schema rigor matters: brands need to be "API-able." Local-language earned coverage is critical for non-English markets. [Source](https://arxiv.org/html/2509.08919v1)

### SEO Operator Research

- **Ahrefs 75K-brand study**: Top correlations with AI brand visibility: YouTube mentions 0.74, branded web mentions 0.66–0.71, branded anchors 0.51–0.63, brand search volume 0.35–0.47, DR 0.27–0.33, backlinks weak, total site pages 0.19 (essentially noise). [Source](https://ahrefs.com/blog/ai-brand-visibility-correlations/)
- **Search Influence's 20,000-Copilot-citation analysis**: Citations concentrate dramatically. One URL captured 69% of all citations; top 4 captured 90%. Citations dropped 97% over two months for non-updated content. Comparison/listicle pages with pricing + named vendors dominated. [Source](https://www.searchinfluence.com/blog/bing-ai-performance-report-copilot-citations/)
- **Lily Ray, 2025 reflection**: "Brand mentions on popular websites, top-tier reviews, and positive social media reputation" became essential. Articles can appear in LLM responses "within hours of publication" with standard SEO discipline — no special AEO needed. [Source](https://lilyraynyc.substack.com/p/a-reflection-on-seo-and-ai-search)
- **Aleyda Solis, AI Search Optimization Roadmap**: Shift from "ranking" to "inclusion." Topical clusters with pillar + cluster pages, semantically cross-linked, are the structural unit. Query fan-out makes pages compete at the passage level. [Source](https://speakerdeck.com/aleyda/the-ai-search-optimization-roadmap-by-aleyda-solis)
- **iPullRank on query fan-out**: AI search systems decompose queries into 8–12 sub-queries (hundreds in Deep Search). Variant types: equivalent, follow-up, generalization, specification, canonicalization, translation, entailment, clarification. Modifiers commonly added: "best," "top," "reviews," and the current year. [Source](https://ipullrank.com/expanding-queries-with-fanout)

---

## Signal-by-Signal Analysis

| Signal | Evidence Strength | Confirmed By | Practical Impact |
|---|---|---|---|
| Bing indexability (HTML in initial response, no JS-only content) | **Very strong** | Microsoft Oct 2025 | Mandatory baseline. Failing this = invisible. |
| `lastmod` + IndexNow submission | **Strong** | Microsoft July 2025; ALM Corp data | 3–7 day cycle for citations to reflect changes. |
| Exact numeric facts (dollars, %, FPL thresholds) | **Strong** | arXiv 2604.25707 +61.5% absorption | Single highest content-feature uplift after structure. |
| Schema.org FAQ / Article / HowTo / Dataset | **Strong** | Microsoft Oct 2025; Pedowitz Group | Microsoft names schema by example (FAQ, Product, Review, Event). |
| `MedicalWebPage` / `MedicalProcedure` / `Drug` schema | **Moderate** (vertical-specific) | Healthcare Success; Schema App | "2x more likely" finding is third-party but consistent across vendor studies. |
| Question-shape H2 + direct answer paragraph | **Strong** | Microsoft Oct 2025 | Q&A as a *pattern* works; Q&A as a *format gimmick* without numeric substance has slight negative impact. |
| Tables / comparison grids | **Strong** | Microsoft Oct 2025; Search Influence | Best-performing single content shape in Copilot citation analysis. |
| Year anchor in URL/title/H1 | **Moderate** | iPullRank (fan-out adds year modifier); Search Influence | Year-anchored pages caught in Bing's grounding queries. Unconfirmed by Microsoft directly but logically downstream of "the current year" being a fan-out modifier. |
| State anchor in URL/title/H1 | **Moderate** | Query fan-out user-attribute injection | Location is explicit user attribute; pages matching (location, intent) win the retrieval lottery. |
| Author byline + credentials + reviewer markup | **Strong (YMYL)** | Stridec; Microsoft Copilot Health | Mandatory for health content to clear the citation bar. |
| Primary-source citations in body (CMS, KFF, HHS) | **Strong** | arXiv 2311.09735 (~40% boost); Microsoft Oct 2025 | "Cited sources help build trust when content is reused in AI-generated answers." |
| Speakable schema | **Weak/unconfirmed for Copilot** | Schema.org docs; Google only | Cheap to add, but no Microsoft confirmation. |
| Brand authority / earned media | **Very strong** | Ahrefs 75K study; Stacker/Princeton | Off-site signals outweigh on-site for "should this brand be mentioned at all." |
| Internal linking depth & topical clusters | **Strong** | Aleyda Solis; Microsoft "deepening coverage" | Concentrate authority on a topic, don't sprinkle it. |
| Freshness signals (`dateModified`, `lastReviewed`) | **Strong** | Microsoft May 2026 "stale facts can directly produce wrong answers" | Essential for year-anchored content. |
| Bilingual content (`hreflang`, separate `es` URLs) | **Moderate** | Microsoft duplicate-content guidance | Spanish-language earned coverage helps Spanish queries; do NOT machine-translate duplicates without distinct content. |
| HTTPS / Core Web Vitals | **Weak/standard** | Bing general SEO | Hygiene, not citation lever. |
| HTML lists / bulleted answers | **Strong** | Microsoft Oct 2025; arXiv 2603.29979 (8.94x list density in top-quartile cited) | Specific, scannable, extractable. |

---

## The State + Program + Year Pattern

**Why this pattern works (synthesizing the evidence):**

1. **Query fan-out injects user attributes.** AI systems decompose "Medicare eligibility" into variants like "Medicare eligibility California 2026," "Medicare income limits California," "California Medicare Advantage 2026 plans." User location and current year are explicit fan-out modifiers. [iPullRank](https://ipullrank.com/expanding-queries-with-fanout)
2. **Specification queries reward specific pages.** One of the 8 fan-out variant types is "specification query" — more detailed versions of the original. A page titled "California Medicaid Eligibility 2026" matches a specification variant exactly; a generic "Medicaid Eligibility" page does not.
3. **Grounding queries are keyword-dense.** Search Influence's 20K-citation analysis observed Copilot's grounding queries "were keyword-dense search queries optimized for Bing's index." Year-anchored, state-anchored pages are written in that same keyword-dense voice.
4. **Freshness disambiguation.** When multiple pages cover the same program, "2026" in the URL/title is a strong signal Bing uses to disambiguate which one to ground on. Microsoft's "stale facts can produce wrong answers" framing means a 2024-anchored page is actively penalized for a 2026 query.
5. **Entity tuple matching.** Copilot's grounding likely scores each candidate page against the entity tuple `(program=Medicaid, state=CA, year=2026)`. A page that emits all three in the title, H1, URL, and body wins on every axis.

**Caveat:** Microsoft has *not* publicly confirmed an explicit `(state, program, year)` tuple decomposition. This is inference from query fan-out literature plus observed citation patterns on benefitsusa.org. Treat as **strong working hypothesis**, not Microsoft-documented behavior.

---

## Health Vertical Considerations

Health is the **highest-caution YMYL category** in Microsoft Copilot. The citation bar is meaningfully higher than for generic consumer content.

**What gets cited:**
- Patient-facing explainers that name the clinical practice guideline, issuing body, and year. [Stridec](https://www.stridec.com/blog/aeo-for-healthcare/)
- Pages with clinician bylines (name, credential, specialty, registration body).
- Pages with explicit `reviewedBy` / `lastReviewed` markup and a real review date.
- Pages that state scope explicitly ("This page covers Medicare Part A for residents of California in 2026").
- Symptom/procedure pages that list population-level facts, name red-flag features, and route to a clinician.

**What gets hedged or refused:**
- Diagnostic-shaped content ("if you have X you probably have Y") without clinical authoring.
- Unsubstantiated medical claims without evidence anchoring.
- Pages without author or reviewer signals.

**Trusted source hierarchy** (Microsoft Copilot Health explicitly names):
1. National Academy of Medicine principles (Microsoft's verification framework)
2. Harvard Health, JAMA
3. Mayo Clinic, Cleveland Clinic, Kaiser Permanente
4. WHO, CDC, NIH, MedlinePlus, NICE, USPSTF
5. Professional societies (AHA, ESC, etc.)

For CoveredUSA: **citing CMS, KFF, HHS, IRS, state Medicaid/Marketplace pages, and Healthcare.gov** in the body of every article maps directly onto this hierarchy. These are the equivalent "authoritative bodies" for benefits/coverage questions.

---

## Anti-Patterns To Avoid

From Microsoft directly and corroborated research:

1. **JS-rendered or accordion/tab-hidden answers.** "If your pricing is only visible after clicking a button, the crawler will not see it." [Microsoft Oct 2025](https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers)
2. **PDFs for core info.** Use HTML.
3. **Key information only in images.** No OCR fallback at the retrieval layer.
4. **Walls of text** with no headings or lists.
5. **Vague phrasing.** "Innovative," "industry-leading," "best." Replace with measurable facts.
6. **Decorative arrows, symbol strings, em-dash chains.** Microsoft explicitly calls these out.
7. **Duplicate content** across locales, parameter variants, syndicated copies, staging pages. LLMs cluster duplicates and pick one — often not the version you wanted. [Microsoft Dec 2025](https://blogs.bing.com/webmaster/December-2025/Does-Duplicate-Content-Hurt-SEO-and-AI-Search-Visibility)
8. **Stale year anchors.** A page titled "2024 FPL Chart" actively *loses* to a 2026 page during grounding for 2026 queries.
9. **Footer/header bloat.** Boilerplate content dilutes the signal of the main answer.
10. **AI-generated tells.** Em-dashes, triple-stacks, corporate verbs, smooth transitions. Beyond style: pattern-matched AI content gets de-prioritized as low-quality grounding material.
11. **Q&A format without substance.** Q&A pattern alone is slightly negative (-5.7% absorption); only effective when the answer contains numbers, named entities, or definitions. [arXiv 2604.25707](https://arxiv.org/html/2604.25707v2)
12. **Translating English machine-style into a second locale.** Microsoft's duplicate guidance specifically calls out "localization pages that are nearly identical across regions in the same language" as harmful.

---

## 30-Point Optimization Checklist

For every page that should be Copilot-cite-ready. Treat as a gating checklist.

### Discoverability (must all be true to be eligible)
1. Page is in Bing's index. Verify in Bing Webmaster Tools.
2. URL is submitted via IndexNow on publish *and* on any update.
3. `sitemap.xml` includes the page with accurate `lastmod`.
4. No JS-rendering of the primary answer. Critical content in initial HTML.
5. No accordions/tabs hiding the primary answer text.
6. `robots.txt` does not block Bingbot or `Bing-AISearchCrawler`.

### URL & title shape
7. URL contains the entity tuple. e.g. `/california-medicaid-eligibility-2026`, `/mri-cost-2026`, `/healthcare-gov-deadline-2026`.
8. `<title>` repeats the entity tuple in natural language: "California Medicaid Eligibility 2026: Income Limits and How to Apply."
9. `<meta description>` opens with the exact 2026 numeric fact users want.
10. `<h1>` matches the `<title>` semantically.

### Above-the-fold answer block
11. First paragraph contains the headline numeric fact (exact dollar/percent) for the current year.
12. Year ("2026") appears at least once in the first 100 words.
13. State (where applicable) appears in the first 100 words.
14. Primary source linked inline in the first paragraph (CMS, KFF, HHS, Healthcare.gov, IRS, state portal).

### Structure
15. H2s are in question form for the highest-volume long-tail variants ("What is the 2026 FPL for a family of 4 in California?").
16. Each H2 is followed by a 2–3 sentence direct answer, *then* expansion.
17. At least one comparison table with clear column headers (state, program, year, value).
18. At least one bulleted or numbered list (steps, eligibility criteria, document checklist).
19. 3–5 heading levels, 25–35% of content is structured elements (lists/tables/blockquotes).
20. Paragraphs are 150–300 words; no walls of text.

### Schema.org
21. `Article` or `MedicalWebPage` JSON-LD with `headline`, `datePublished`, `dateModified`, `author`, `publisher`.
22. `FAQPage` schema with at least 5 Q/A pairs, mirroring on-page H2s exactly.
23. `BreadcrumbList` schema with topical hierarchy.
24. For procedures: `MedicalProcedure`. For drugs: `Drug`. For glossary: `DefinedTerm`. For step content: `HowTo`.
25. `lastReviewed` and (where applicable) `reviewedBy` (with `Person` having `jobTitle`/`hasCredential`) on every YMYL page.

### Authority & trust
26. Visible byline at top of article with author name and credential.
27. Visible "Last reviewed: [date] by [name, credential]" line.
28. At least 3 outbound primary-source citations (CMS, HHS, IRS, KFF, state Medicaid, Healthcare.gov, NIH, MedlinePlus).
29. No syndicated or duplicate content across other CoveredUSA pages or external sites without `rel=canonical`.

### Freshness
30. `dateModified` updated on every meaningful change, IndexNow re-submitted, and a brief "Updated: [date] — [what changed]" note visible to readers.

---

## CoveredUSA Assessment

### What CoveredUSA Is Already Doing Right

- **State + program + year URL pattern** is baked into the programmatic architecture (`PROGRAMMATIC_SEO_ARCHITECTURE.md`). Top-level slugs like `/2026-fpl-chart`, `/medicare-costs-2026`, `/medicaid-income-limits` match the entity-tuple shape that wins grounding queries.
- **Schema helpers exist** for FAQ, Breadcrumb, Speakable, WebApplication, HowTo, and MedicalOrganization (`src/lib/structured-data.ts`). This is well above industry baseline.
- **IndexNow on push** is wired (`scripts/coveredusa-indexnow-submit.js`) — the 3–7 day citation cycle is achievable.
- **Hardcoded data hubs** with comparison tables, FAQ lists, FAQ + Breadcrumb JSON-LD match the Search Influence finding that comparison/table content dominates Copilot citations.
- **Bilingual via `[locale]` route** with `setRequestLocale` — proper hreflang patterns, not lazy machine translation in the same URL.
- **Numeric anchoring** (FPL thresholds, Medicare costs, OOP max) is the dominant content style. This is exactly the +61.5% numbers-uplift content.

### Where CoveredUSA Is Weak / Missing

- **No `MedicalWebPage` / `MedicalProcedure` / `Drug` / `DefinedTerm` schema in the helper library** — only generic `Article` and `Organization`. Procedure cost pages, drug cost pages, and glossary pages should emit vertical-specific schema. This is a meaningful gap given the YMYL bar.
- **No `lastReviewed` / `reviewedBy` markup** documented anywhere. For health-vertical YMYL content this is the single highest-leverage missing piece.
- **No visible author bylines or credential disclosure** in the existing data hub pattern.
- **IndexNow script only auto-detects today's blog posts** — needs extension to programmatic product pages and to fire on `dateModified` bumps for hubs.
- **Q&A format without sourcing** — the FAQ pattern is in place but FAQs need to cite CMS/KFF/HHS inline to clear the "trust" bar. Q&A alone is slightly negative; sourced Q&A is strong.
- **No explicit "Updated: [date]" visible-to-reader line** on hub pages. Schema-only freshness is weaker than schema + visible.
- **`speakable` schema is implemented broadly** — fine, low-cost, but don't over-invest. Unconfirmed for Copilot specifically.
- **No conflict-resolution language**. Microsoft's May 2026 grounding-index post specifically flags conflict detection. Where CMS and a state portal disagree on a number, the page should acknowledge it explicitly rather than silently pick one.

### Three Highest-Leverage Changes

1. **Add `MedicalWebPage` + `lastReviewed` + `reviewedBy` to every YMYL page** (procedure costs, drug costs, healthcare Q&A, glossary). One schema-helper addition unlocks the full health-vertical citation tier.
2. **Visible author + reviewer block** at the top of every page: "By [name], [credential]. Reviewed [date] by [reviewer, credential]." This is the strongest trust signal Copilot Health's framework rewards, and it costs almost nothing.
3. **Inline-cited primary sources in the first paragraph** of every page. Not "Sources" footer — first paragraph. "According to CMS, the 2026 federal poverty level for a family of 4 is $32,150" beats "The 2026 FPL is $32,150" by a wide margin in both selection and absorption scoring.

---

## Sources Cited

- [Bing Webmaster Blog — Optimizing Content for AI Search (Oct 2025)](https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers)
- [Bing Webmaster Blog — Sitemaps in AI-Powered Search (July 2025)](https://blogs.bing.com/webmaster/July-2025/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search)
- [Bing Webmaster Blog — Duplicate Content & AI Search (Dec 2025)](https://blogs.bing.com/webmaster/December-2025/Does-Duplicate-Content-Hurt-SEO-and-AI-Search-Visibility)
- [Bing Webmaster Blog — AI Performance Public Preview (Feb 2026)](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)
- [Bing Search Blog — Evolving Role of the Index (May 2026)](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers)
- [Microsoft Copilot Blog — Bringing the Best of AI Search to Copilot (Nov 2025)](https://www.microsoft.com/en-us/microsoft-copilot/blog/2025/11/07/bringing-the-best-of-ai-search-to-copilot/)
- [Microsoft AI — Introducing Copilot Health (March 2026)](https://microsoft.ai/news/introducing-copilot-health/)
- [arXiv 2311.09735 — GEO: Generative Engine Optimization](https://arxiv.org/abs/2311.09735)
- [arXiv 2603.29979 — Structural Feature Engineering for GEO](https://arxiv.org/html/2603.29979)
- [arXiv 2604.25707 — Citation Selection to Citation Absorption](https://arxiv.org/html/2604.25707v2)
- [arXiv 2509.08919 — GEO: How to Dominate AI Search](https://arxiv.org/html/2509.08919v1)
- [Ahrefs — AI Brand Visibility Correlations (75K brands)](https://ahrefs.com/blog/ai-brand-visibility-correlations/)
- [Search Influence — 20,000 Copilot Citations Analysis](https://www.searchinfluence.com/blog/bing-ai-performance-report-copilot-citations/)
- [Pedowitz Group — How Bing Copilot Sources Answers](https://www.pedowitzgroup.com/how-bing-copilot-sources-answers-aeo-for-microsoft-search)
- [Stridec — AEO for Healthcare](https://www.stridec.com/blog/aeo-for-healthcare/)
- [Healthcare Success — Schema & AI for Healthcare](https://healthcaresuccess.com/blog/healthcare-marketing/technical-seo-schema-making-your-healthcare-site-machine-readable-for-ai.html)
- [Lily Ray — A Reflection on SEO and AI Search (2025)](https://lilyraynyc.substack.com/p/a-reflection-on-seo-and-ai-search)
- [Aleyda Solis — AI Search Optimization Roadmap](https://speakerdeck.com/aleyda/the-ai-search-optimization-roadmap-by-aleyda-solis)
- [iPullRank — Query Fan-Out](https://ipullrank.com/expanding-queries-with-fanout)
- [Stacker — Pickup Quality, the X-Factor for LLM Visibility](https://stacker.com/blog/pickup-quality-the-x-factor-for-llm-visibility)
- [ALM Corp — Bing Webmaster Tools AI Performance Guide (2026)](https://almcorp.com/blog/bing-ai-performance-webmaster-tools-complete-guide/)
- [Search Engine Land — Bing Webmaster Tools AI Performance Report](https://searchengineland.com/bing-webmaster-tools-ai-performance-report-468751)
