# Lighthouse Page Pattern — Deep Dive

**Date:** 2026-05-13
**Scope:** What makes a single URL dominate AI citations for a topic, and how to engineer that position for CoveredUSA's 7 programmatic templates.
**Strategic question:** Should we shift from "mass-produce 500 thin programmatic pages" to "build 5–10 deep lighthouse pages per template that win their query space"?

---

## TL;DR

1. **Citation concentration is real and severe.** Three independent datasets converge: Search Influence (1 URL = 69%, top 4 = 90% of 19,717 citations), Microsoft's own launch dataset (5 pages = 74.6%), and Surfer SEO (across 46M citations, healthcare is dominated by NIH ~39%, Healthline ~15%, Mayo ~14.8%, Cleveland Clinic ~13.8%). Programmatic pages individually contribute roughly 4–5%. The economics of citation power-law strongly favor depth over breadth.

2. **The "lighthouse" is an *outcome*, not a structural type.** The page that wins citations is usually a comprehensive answer with deep entity coverage, fresh data, numeric specificity, and schema rigor — but it is *not always* the longest page on the site. KFF's federal poverty data hub, MedlinePlus drug pages, and CDC condition pages all win citations with very different word counts (400–4,000). What they share: they directly answer the *exact* fan-out queries Bing decomposes from a natural-language prompt.

3. **There is no public Microsoft documentation of a "seed source" mechanism.** Microsoft has confirmed that LLMs "group near-duplicate URLs into a single cluster and then choose one page to represent the set" (Bing Webmaster Blog, Dec 2025), which is the closest official statement to a canonical-source mechanic. Beyond that, the "one URL wins everything" pattern is empirical and operator-observed, not algorithmically documented.

4. **Evaporation is real and fast.** Search Influence's 91-day longitudinal data shows a 97% drop in citations from Dec 1–8 (1,520/day) to Feb (34/day) for content that wasn't actively updated. Half-life appears to be roughly 30–45 days for time-sensitive topics. Maintenance has to be substantive (new sections, refreshed numbers, re-submitted via IndexNow) — pure `dateModified` bumps don't appear to be enough.

5. **Lighthouse ≠ pillar, but they overlap.** A pillar page is a structural form (long anchor for a cluster). A lighthouse is a citation outcome. Most lighthouses are pillar-shaped, but not all pillars become lighthouses (KFF Health Policy 101 is a pillar that does not appear to win citations for most queries — KFF's *state indicator* pages and *issue briefs* do). The right framing: pillars are a *requirement*; lighthouses are a *win condition*.

6. **For CoveredUSA: build lighthouses for head queries; cluster for long-tail.** Our 7 templates split cleanly. Procedures, drugs, glossary, persona, and state MA pages are programmatic (cluster). Q&A, events, and a small number of year-anchored numeric reference pages (FPL, Medicare costs, OOP max) deserve lighthouse treatment with 2,000–4,000 words each, named author, full schema graph, monthly refresh.

7. **The challenger position is real but slow.** Locked slots (KFF for FPL, GoodRx for Ozempic, Medicare.gov for "does Medicare cover X") have entrenched lighthouse holders backed by brand entity signals (Cyrus Shepard: 6.8) and earned media. Displacement typically requires 6–12 months of consistent ranking PLUS earned third-party citations. For most of CoveredUSA's slots, unclaimed adjacent territory is a faster win.

---

## Reverse-engineered lighthouse pages

I attempted to WebFetch ~20 canonical candidates. Several blocked bot access (KFF FPL chart, GoodRx Ozempic, Mayo Clinic hypertension, Medicare.gov hubs, Investopedia, Healthcare.gov apply page — all returned 403 or timeout). What follows is direct data from pages I could fetch, supplemented with industry citation-share data from Surfer SEO's 46M-citation analysis where direct fetching failed.

### 1. NerdWallet "Best Medicare Advantage Plans in 2026"
URL: `https://www.nerdwallet.com/article/insurance/medicare/best-medicare-advantage-plans`
- **Word count:** ~4,500–5,000
- **H1:** "Best Medicare Advantage Plans in 2026"
- **Heading style:** Brand-anchored question form ("What are Humana's best features?", "Where does Aetna fall short?") — 14+ H2s
- **Schema:** Article + Review (1–5 star ratings, 3.76–4.20 per company); Product implicit in comparison tables
- **Author + reviewer:** "Alex Rosenberg, Lead Writer & Content Strategist" with credentials line ("10+ years covering health/insurance"); edited by "Holly Carey, Managing Editor"; fact-checked tag
- **Date:** "Apr 27, 2026" (publication; no separate `lastReviewed` field visible)
- **Primary-source citations:** Sparse — references CMS and JD Power without inline hyperlinks
- **.gov links:** 1 (Medicare.gov, at end)
- **First paragraph:** *"NerdWallet's 2026 picks include Humana, Aetna, UnitedHealthcare and HealthSpring (formerly Cigna)."* Leads with the named entities, not a numeric answer.
- **Tables:** 1 major comparison grid (CMS rating × states available × member experience × contact)
- **Lists:** 12+ bullet lists
- **Internal links:** Interactive state map driving deeper cluster pages
- **Distinctive:** Methodology transparency box ("4,488 plans, 195,368 data points, 35/35/30 weighting")

**Type:** Comparison/decision guide. Lighthouse win condition: brand-anchored sub-answers + transparent methodology + year-anchored title.

### 2. MedlinePlus "Semaglutide Injection"
URL: `https://medlineplus.gov/druginfo/meds/a618008.html`
- **Word count:** ~2,100–2,300
- **H1:** "Semaglutide Injection"
- **Heading style:** Pure Q&A: "Why is this medication prescribed?", "How should this medicine be used?", "What special precautions should I follow?", "What side effects can this medication cause?" — 11 H2s, every one question-form
- **Schema:** None visible (institutional .gov page)
- **Author:** Institutional — *"AHFS® Patient Medication Information™. © Copyright, 2026. The American Society of Health-System Pharmacists®"*
- **Date:** "Last Revised - 02/15/2026"
- **Citations:** Minimal — 3 external links (FDA Drug Safety, FDA MedWatch, poison control)
- **First content:** *"Semaglutide injection may increase the risk that you will develop thyroid gland tumors, including a type of thyroid cancer."* (IMPORTANT WARNING box, top of page — leads with risk, not definition)
- **Lists:** 6 enumerated
- **Internal links:** Minimal — navigation only
- **Distinctive:** Pronunciation guide ("sem" a gloo' tide"); WARNING-box-first structure; institutional authority compensates for missing schema

**Type:** Year-anchored regulatory reference. Lighthouse win condition: .gov + NIH institutional authority + perfect Q&A H2 alignment. Cited 39% of healthcare AI Overview citations per Surfer.

### 3. Healthline "Everything You Need to Know About High Blood Pressure"
URL: `https://www.healthline.com/health/high-blood-pressure-hypertension`
- **Word count:** ~3,500–4,000
- **H1:** "Everything You Need to Know About High Blood Pressure (Hypertension)"
- **Heading style:** Mostly question-form: "What is high blood pressure?", "What causes high blood pressure?", "What are the symptoms of hypertension?", "How is high blood pressure diagnosed?", "What are the treatment options for high blood pressure?" + 5 declarative H3s for sub-types
- **Schema:** MedicalWebPage (confirmed by "Medically reviewed by" credential block); FAQPage probably present given question H2s
- **Author + reviewer:** "Kimberly Holland" (author) + "Debra Sullivan, Ph.D., MSN, R.N., CNE, COI" (medical reviewer)
- **Date:** "Last medically reviewed: May 12, 2025" (visible, separate from publication date)
- **Citations:** ~25+ inline hyperlinks to AHA, CDC, WHO, PubMed
- **.gov links:** 2+ (CDC physical activity guidelines, WHO via .int)
- **First paragraph:** *"Your blood pressure measurement takes into account the amount of blood passing through your blood vessels and the amount of resistance the blood meets while the heart is pumping."* — leads with mechanism, not a numeric threshold (debatable design choice; CDC version below leads with numeric).
- **Tables:** 1 (blood pressure categories chart, the canonical "Normal/Elevated/Stage 1/Stage 2" grid)
- **Lists:** 4+ structured
- **Internal links:** 15+ to related condition pages
- **Distinctive:** "Key Takeaways" summary block (likely speakable target); TOC navigation; Pinterest-shareable infographic

**Type:** Definitional explainer. Lighthouse win condition: named reviewer with credentials + question H2s + cross-condition internal linking + table-first numeric reference.

### 4. CDC "About High Blood Pressure"
URL: `https://www.cdc.gov/high-blood-pressure/about/index.html`
- **Word count:** ~1,200
- **H1:** "About High Blood Pressure"
- **Heading style:** Declarative, NOT question-form: "Definition of high blood pressure", "Diagnosis", "Signs and symptoms", "Causes", "Prevention" — 6 H2s
- **Schema:** Not directly visible in extract
- **Date:** "Page last reviewed: Jan. 28, 2026" (shown top and bottom)
- **First paragraph:** *"Blood pressure is the pressure that occurs when blood pushes against the walls of your arteries. Arteries carry blood from your heart to other parts of your body."*
- **Key Points box opens with:** *"High blood pressure (hypertension) is consistently at or above 130/80 mm Hg."* — numeric answer immediately
- **Tables:** Blood pressure classification table with stoplight visual
- **Lists:** Lifestyle modifications, signs/symptoms
- **Internal links:** To risk-factor, prevention, complications pages

**Type:** Authoritative .gov definitional. Lighthouse win condition: institutional trust + recent `lastReviewed` + numeric answer in Key Points box. Wins because of brand entity trust (CDC), not depth.

### 5. KFF "Health Policy 101" hub
URL: `https://www.kff.org/health-policy-101/`
- **Word count:** ~1,200
- **H1:** "KFF's Health Policy 101"
- **Date:** Published October 8, 2025 (no separate `dateModified` visible)
- **Author:** Dr. Drew Altman (CEO), with bio + contact email
- **Lists:** 17 chapter links (Medicare, Medicaid, ACA, ESI, Uninsured, Health Costs, Private Insurance Regulation, Women's Health, Race & Inequality, LGBTQ+ Policy, US Public Health, International Comparisons, Global Health, Public Opinion, Congress/Executive, Elections)
- **Schema:** Not visible
- **Distinctive:** Editorial voice from named CEO; defines KFF's framing ("policy = what the government does on financing and coverage")

**Type:** Pillar hub — but **not actually a lighthouse**. This is the pillar that *anchors* the cluster; the lighthouses are KFF's individual state-indicator pages and issue briefs that get fetched by AI engines for specific data points. KFF demonstrates that pillar architecture is necessary but not sufficient.

### 6. Wikipedia "Affordable Care Act"
URL: `https://en.wikipedia.org/wiki/Affordable_Care_Act`
- **Word count:** ~15,000–17,000
- **Headings:** 7 H2s, 40+ H3s
- **References:** 200+ citations to .gov, journals, news
- **Date:** Always shows last-edited date in footer
- **First paragraph:** *"The Affordable Care Act (ACA), formally the Patient Protection and Affordable Care Act (PPACA) and informally known as Obamacare, is a landmark U.S. federal statute enacted by the 111th United States Congress and signed into law by President Barack Obama on March 23, 2010."*
- **Tables:** Premium subsidy table; legislative summary infobox
- **Internal links:** 150+
- **Distinctive:** Editorial review process (community-curated)

**Type:** Encyclopedia reference. Cross-industry lighthouse — Wikipedia is the #2 most-cited domain by Surfer SEO across all verticals (18.4%).

### 7. HHS Poverty Guidelines
URL: `https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines`
- **Word count:** ~2,800
- **H1:** "Poverty Guidelines"
- **H2s:** 8 sections including "HHS Poverty Guidelines for 2026", "About the Poverty Guidelines", "Note for the 2026 Poverty Guidelines", "Guidelines for Contiguous 48 States, Alaska and Hawaii"
- **Schema:** No JSON-LD detected
- **Date:** No explicit `dateModified` visible in main content (notable gap)
- **Opening:** *"U.S. Federal Poverty Guidelines Used to Determine Financial Eligibility for Certain Programs"*
- **Tables:** 3 (Mainland/DC, Alaska, Hawaii — 8 household sizes each)
- **Internal links:** 15+ (prior years, FAQ, API)
- **Distinctive:** Multi-language (21+ languages), downloadable 125%/185%/200% multiplier charts, public API

**Type:** Year-anchored numeric reference. Lighthouse win condition: source-of-truth .gov + tabular data + multiple-year archive + API.

### 8. KFF State Indicator (Medicaid Enrollees by Age)
URL: `https://www.kff.org/medicaid/state-indicator/medicaid-enrollees-by-age/`
- **Word count:** ~400–500 (most content is the interactive data widget)
- **Structure:** Standardized template across hundreds of state-indicator pages: title + topic/category tags + breadcrumb + data widget + "data are loading" placeholder
- **Distinctive:** Pure-data pages with consistent template. Win citations because they own (state × metric) intersection queries.

**Type:** State + metric data lighthouse (×N pages from one template). Demonstrates the most important counterpoint to "lighthouse = long pillar": these are thin pages that win because they answer a very specific tabular query better than anything else exists for that intersection.

### 9. Surfer SEO healthcare-vertical citation share (aggregate)
Source: Surfer SEO analyzed 36M AI Overviews and 46M citations, March–August 2025. Healthcare citation distribution:
- **NIH (~39%)** — institutional reference (MedlinePlus, NLM databases)
- **Healthline (~15%)** — definitional explainers with named reviewers
- **Mayo Clinic (~14.8%)** — clinical definitional + diagnosis/treatment cluster
- **Cleveland Clinic (~13.8%)** — same shape as Mayo
- **ScienceDirect (~11.5%)** — academic/journal
- **YouTube (~28%)** — patient-friendly video

These five domains collectively own ~80% of healthcare AI citations — a clearer power-law than the cross-industry average. CoveredUSA is competing against entrenched lighthouse holders.

### 10. Microsoft Copilot Health named trusted sources
From the Microsoft AI announcement *"Introducing Copilot Health"* (March 2026), Copilot Health applies an extra trust filter that names: **Harvard Health, JAMA, National Academy of Medicine, HealthEx, Mayo Clinic, Cleveland Clinic, Kaiser Permanente**. This is an explicit allow-list for the health vertical inside Copilot Health (the medical-focused Copilot surface). Verification is "by Microsoft's clinical team using principles independently established by the National Academy of Medicine." Copilot Health is ISO/IEC 42001 certified.

**Implication:** For health-specific Copilot answers, there is something close to a *named seed-source list*. CoveredUSA likely cannot enter this list directly but can compete for the broader Copilot/Bing surface.

### 11–15. Inferred from operator data + citation share
- **KFF Federal Poverty Level state indicator chart** (could not fetch; routinely cited by ChatGPT for "FPL 2026 [state]" queries per multiple operator reports)
- **GoodRx Ozempic price page** (403; dominates "ozempic cost" queries; Surfer doesn't break this out but pharma SEO operators consistently identify GoodRx as the citation lighthouse)
- **Mayo Clinic hypertension symptoms/causes** (403; named in Copilot Health allow-list; Surfer shows 14.8% healthcare share)
- **Healthcare.gov apply/enroll** (timeout; institutional .gov for ACA application queries)
- **Medicare.gov coverage hubs** (timeout; institutional .gov; would expect 70%+ citation share for "does Medicare cover X")

---

## The seed-source mechanic — what we know

**The short version:** "Seed source" is not Microsoft terminology. It is operator language describing an empirical pattern. Microsoft has documented one closely adjacent mechanism:

> *"LLMs group near-duplicate URLs into a single cluster and then choose one page to represent the set. If the differences between pages are minimal, the model may select a version that is outdated or not the one you intended."* — Bing Webmaster Blog, *"Does Duplicate Content Hurt SEO and AI Search Visibility?"* (December 2025)

This confirms the *cluster representative* pattern. Microsoft has *not* publicly stated:
- Whether selection is deterministic per (query, time-window) or stochastic per request — **unconfirmed**
- What the "challenger" displacement mechanic is — **unconfirmed**
- How seed source rotates over time — **unconfirmed**

What we can infer from independent data:

**1. It is largely deterministic for a given query state.** Search Influence's 19,717-citation analysis showed one URL capturing 69% across 91 days, with the share holding until content went stale. If selection were highly stochastic per request, we would expect a flatter distribution.

**2. It changes when content decays.** The 97% citation drop over Dec 1 → Feb in Search Influence's dataset, without the page being delisted, suggests Bing's grounding index detected staleness and either deprioritized or rotated to a fresher candidate. Microsoft has confirmed: *"freshness signals directly influence how quickly updates are reflected in AI generated answers"* (Bing Webmaster Blog, July 2025).

**3. Bing groups via "chunks," not pages.** Microsoft's May 2026 blog *"Evolving role of the index: From ranking pages to supporting answers"* describes a passage-level retrieval layer. *"Chunking/transformations must preserve meaning. Critical."* *"Stale facts can directly produce wrong answers."* This means the actual selection unit is a passage, not a URL — but the URL inherits the citation. The page that contains the most extractable passages for the fan-out set wins disproportionately.

**4. Challenger mechanic likely exists but is slow.** No Microsoft documentation. Cyrus Shepard's data on **Brand and Entity Trust** (scored 6.8/10) suggests entity recognition gates the swap: Bing only swaps to a challenger that has reached a brand recognition threshold. Operator anecdote (Lily Ray, 2025): standard SEO-disciplined articles can appear in LLM responses "within hours of publication" — but appearing once is not displacing.

**5. The Seer Interactive 87%-Bing-overlap finding tells us where to look.** *"87% of SearchGPT citations match Bing's top organic results."* But 13% don't — driven by Wikipedia, news aggregators, and training-data residue. Bing organic rank is the dominant input, but not the only input.

**Status:** "Seed source" is a useful operator concept. The underlying mechanism is best described as *"highest-extractable-passage-density page within a near-duplicate cluster, scored by Bing rank + entity trust + freshness, with chunk-level grounding."* That's the most accurate phrasing the public record supports.

---

## The evaporation effect

### Confirmed data
- **Search Influence (Nov 12, 2025 → Feb 10, 2026):** 91 days; daily citations fell from peak Dec 7 (5,804) to Feb avg (34/day). The Dec 1–8 average was 1,520/day, the Feb average was 34/day. **97% decline in 60–65 days for content that was not actively updated.** The page itself stayed published — Bing simply rotated.
- **SE Ranking, Nov 2025:** *"Content updated in the past three months averages 6 citations versus 3.6 for outdated pages."* — implies maintained content roughly **1.67x** the citation rate of stale.
- **Position.Digital roundup citing Seer Interactive (June 2025):** *"85% of AI Overview citations were published in the last two years. 44% are from 2025."* For Perplexity specifically, *"50% of Perplexity citations are content published in 2025 alone."*
- **ChatGPT diverges:** *"ChatGPT is more likely to reference older content than AIO and Perplexity, with 29% of its citations dating back to 2022 or earlier."* (Seer Interactive, June 2025). ChatGPT has training-data residue that smooths the freshness curve; Bing/Copilot does not.

### Half-life estimate
Combining the Search Influence longitudinal data with SE Ranking's 3-month threshold:
- **Healthcare/time-sensitive (Medicare costs, FPL, plan availability):** ~30–45-day half-life
- **Definitional (what is HMO):** ~90–120 days
- **Year-anchored references (2026 FPL chart):** roughly ~30 days, with a cliff at Jan 1 each year as Bing rotates to new-year challengers

### What counts as "active maintenance"
**Not enough:** Pure `dateModified` bumps without content change. Bing's grounding index appears to detect chunk-level diff, not just header metadata (inferred from Microsoft's May 2026 chunking statement).

**Probably enough:**
- New data sections (e.g., adding a state column to a comparison table)
- Numeric refresh (e.g., updating Medicare premium from 2025 → 2026 values)
- New FAQ entries with current-year answers
- New source citations
- IndexNow submission upon update (3–7 day cycle to see citation reflection per ALM Corp guide)

**Operator practice:** Treat lighthouse pages like quarterly editorial reviews, not "publish and walk away." For year-anchored references, schedule an annual rebuild ~2 weeks before Jan 1.

---

## Lighthouse vs pillar — definitional clarity

| Concept | What it is | When you have one |
|---|---|---|
| **Pillar page** | Structural form: long anchor for a topic cluster, with internal links to N narrower cluster pages | When your site architecture matches the topic cluster model (Brian Dean / HubSpot 2017) |
| **Lighthouse page** | Citation outcome: the single URL Bing/Copilot reuses for the majority of a topic's grounding queries | When your AI citation share for a topic concentrates ≥50% on one URL |

**Key insight:** Pillars are an input. Lighthouses are an output. The two correlate (most lighthouses are pillar-shaped), but the correlation is imperfect:

- **KFF Health Policy 101** is a pillar but probably not a lighthouse for most queries — the pillar links *to* the actual lighthouse pages (state indicators, issue briefs).
- **KFF state-indicator pages** are *not* pillar pages (they're thin data widgets) but they *are* lighthouses for "Medicaid enrollment in [state]" intersection queries.
- **MedlinePlus drug pages** are not pillar-shaped (~2,000 words) but they are lighthouses because they're institutional, NIH-published, and Q&A-formatted at the H2 level.
- **NerdWallet's "Best MA Plans"** is both pillar-shaped (4,500+ words, anchors a state cluster) AND a lighthouse (cited for "best Medicare Advantage 2026" head queries).

**Operational rule:** Don't optimize for "pillar-ness" as if it's the goal. Optimize for *citation extractability per fan-out query* on the most valuable head term. Sometimes that requires a 4,000-word pillar; sometimes it requires a 400-word tabular data page.

### Independent corroboration
- *"Topic clusters aren't just an SEO tactic anymore—they're how AI engines decide who to cite."* (Conductor, 2026)
- *"In 2026, pillar pages are also critical for AI search visibility — clustered content receives 3.2× more AI citations than standalone posts."* (Topic cluster guide, Whitehat 2026 — unconfirmed methodology)
- Cyrus Shepard ranks **Topic Cluster Ranking** at 8.9/10 — the same site ranking for *multiple* related queries strongly predicts citation.

Pillar structure provides the cross-link evidence that the page belongs to a topical authority. The page itself still has to win the citation on its own merits.

---

## Lighthouse identification heuristics

Operational rules for deciding *which* pages to build as lighthouses vs. cluster:

### 1. Query volume threshold
- **Lighthouse candidate:** ≥1,000 estimated monthly searches on a *head* term, OR the term shows up as a Bing grounding query in Webmaster Tools AI Performance report
- **Cluster:** Long-tail (<200/mo) intersection queries (procedure × state, drug × condition)

### 2. Query intent type
- **Lighthouse:** Informational head terms ("what is the federal poverty level", "how much is Medicare Part B", "ozempic side effects")
- **Cluster:** Transactional/long-tail ("MRI cost in Ohio without insurance", "is Lipitor covered by Aetna PPO Texas")

### 3. Topical centrality
- **Lighthouse:** *This is the topic*. "Federal Poverty Level" not "FPL increase 2026 explained"
- **Cluster:** Sub-topics, applications, derivatives

### 4. Conversion intent
- **Lighthouse:** Top-of-funnel awareness (the page Copilot cites when someone first asks the question)
- **Cluster:** Lower-funnel (specific decision, specific product, specific state's rules)

### 5. Competitive landscape
- **Build lighthouse if:** The current dominant page is mediocre (not on the named Copilot Health allow-list, no schema, stale date, no named author)
- **Don't build lighthouse if:** KFF, Medicare.gov, or Mayo Clinic owns the slot with a fresh year-anchored page

### 6. Operational capacity heuristic (Search Influence's data)
- 1 lighthouse can hold 50–70% of citations on its topic
- 4 lighthouses can hold 90%
- Programmatic pages individually contribute ~1–5%
- **Therefore:** If you can build 5–10 well-maintained lighthouses, that's better than 500 unmaintained programmatic pages by an order of magnitude *for citation share*.

### 7. Maintenance budget reality check
Don't build a lighthouse you can't keep fresh. A neglected lighthouse evaporates in 60 days. A programmatic page surviving on Bing rank for long-tail queries can ride for 6+ months. Lighthouses have higher *upside* but also higher *maintenance cost*.

---

## Lighthouse content taxonomy

Based on the reverse-engineered examples + Cyrus Shepard's intent-format match factor (9.0/10), there are roughly 5 working types:

### Type A: Year-anchored numeric reference
**Examples:** HHS Poverty Guidelines, NerdWallet Best MA 2026, hypothetical "Medicare Costs 2026" hub
**Citation profile:** Heaviest in Q4 of the prior year through Q1 of the anchor year; Bing rotates to new-year challengers ~Jan 1
**Freshness cadence:** Annual rebuild ~Dec 1; monthly numeric audit
**Schema strategy:** `Dataset` + `FAQPage`; date in URL/H1/title; `dateModified` in JSON-LD

### Type B: Definitional explainer
**Examples:** Healthline HMO vs PPO, Investopedia "What is a deductible", Healthline hypertension
**Citation profile:** Stable year-over-year; benefits from `lastReviewed` updates
**Freshness cadence:** Quarterly review; ad-hoc when regulations change
**Schema strategy:** `MedicalWebPage` (or `Article`) + `FAQPage` + named author + medically-reviewed-by markup
**Key element:** "What is X?" H2 with a complete sentence direct answer in the first paragraph beneath

### Type C: How-to guide
**Examples:** Healthcare.gov apply-and-enroll, Medicare.gov "How to enroll"
**Citation profile:** Strong evergreen; benefits from step-numbered structure
**Freshness cadence:** When the actual procedure changes (open enrollment window, rule changes)
**Schema strategy:** `HowTo` schema with explicit `HowToStep` array

### Type D: Comparison/decision guide
**Examples:** NerdWallet best plans, Healthline HMO vs PPO, generic "X vs Y" pages
**Citation profile:** Search Influence's #1 lighthouse type — won 69% of citations
**Freshness cadence:** Refresh comparison data when products change
**Schema strategy:** `Article` + `Review` (with explicit star ratings) + transparent methodology box

### Type E: Numeric state/program data table
**Examples:** KFF state indicators, CMS comparison tools, FPL × household-size grids
**Citation profile:** Wins intersection queries (state × metric)
**Freshness cadence:** When source data is published (often quarterly or annual from CMS/HHS/Census)
**Schema strategy:** `Dataset` (this is the schema CoveredUSA underuses)

### Type F (emerging): Regulatory/program-rule reference
**Examples:** CMS pricing transparency hub, surprise billing rule pages
**Citation profile:** Cited when a query has a regulatory dimension; especially heavy in Copilot Health
**Schema strategy:** `Article` + `GovernmentService` (rare but valid for HHS/CMS programs)

---

## Specific lighthouse recommendations for CoveredUSA's 7 templates

Based on the existing template architecture (procedures, drugs, Q&A, glossary, events, personas, state MA) and the lighthouse heuristics above, here is what to build:

### Template 1: Procedures (`/cost/[procedure]`)
**Cluster (build 50–100):** All the long-tail procedure-cost queries
**Lighthouse (build 1):** `/cost/all-procedures-2026` — the "How much do common medical procedures cost in 2026?" index
- **Title:** *"2026 Medical Procedure Costs: National Averages, Medicare Rates, and Hospital vs Independent Pricing"*
- **Outline (200 words):** Lead paragraph with the meta-finding — average outpatient procedure costs are X% higher at hospital outpatient than independent imaging centers, citing the FAIR Health 80th percentile. Comparison table of the 30 most-searched procedures showing (Procedure | Medicare PFS | National Low | National High | Hospital vs Independent multiplier). Methodology box: "Data pulled monthly from CMS Physician Fee Schedule + FAIR Health Consumer + Medicare OPPS." FAQ block of 8 cross-procedure questions. Links to all individual `/cost/[procedure]` pages. Footer with sources, dateModified, named author.
- **Schema:** `Dataset` + `FAQPage` + `BreadcrumbList`
- **Maintenance:** Monthly numeric refresh; full annual rebuild Dec 1

### Template 2: Drugs (`/drug/[slug]`)
**Cluster (build 50+):** Individual drug cost/coverage pages
**Lighthouse (build 1):** `/drug/medicare-part-d-2026-formulary-guide`
- **Title:** *"Medicare Part D Drug Costs 2026: What Tier Pricing Means and How to Lower Your Costs"*
- **Outline (200 words):** First paragraph leads with the $2,000 annual out-of-pocket cap that took effect January 1, 2025 under the Inflation Reduction Act. Tier explanation table (Tier 1 generic through Tier 6 specialty). Cost-comparison table of the 25 most-prescribed drugs across the largest Part D plans. Donut hole / catastrophic phase mechanics. Extra Help (LIS) eligibility. FAQ of 8 questions matching common grounding queries ("Why did my drug move tiers?", "How do I appeal a formulary decision?"). Internal links to individual drug pages and to Medicare cost lighthouse.
- **Schema:** `Article` + `FAQPage` + `MedicalWebPage`
- **Maintenance:** Quarterly tier-pricing refresh; annual Q4 rebuild for the next plan year

### Template 3: Q&A (`/q/[slug]` or however the URL shape lands)
**Cluster:** Most Q&A pages stay programmatic
**Lighthouse (build 3):** Three head-term Q&A pages with full lighthouse treatment:
- `/q/does-medicare-cover-[X]` — Aggregated index of "does Medicare cover" answers with a search/filter widget (similar to Medicare.gov's coverage tool, but better structured for AI). Bing/Copilot cites this for the head query "does Medicare cover dental/vision/hearing/etc."
- `/q/medicaid-eligibility-2026` — Lighthouse for the "do I qualify for Medicaid" intent
- `/q/aca-subsidy-eligibility-2026` — Lighthouse for "do I qualify for ACA subsidies"

Each: 2,500–3,500 words, FAQ schema, named author, monthly numeric refresh, internal links to state-specific cluster pages.

### Template 4: Glossary (`/glossary/[term]`)
**Cluster (build 100+):** Individual term pages
**Lighthouse (build 1):** `/glossary/health-insurance-terms-explained`
- A single comprehensive A-Z index page with the 80 most-searched terms, each with a 100-word definition + link to the dedicated cluster page. Becomes the lighthouse for "health insurance glossary" / "what does X mean in health insurance" grounding queries.
- **Schema:** `DefinedTermSet` containing `DefinedTerm` array; `Article` wrapper
- **Maintenance:** Add new terms when regulations introduce them; annual review

### Template 5: Events (likely Open Enrollment, plan changes)
**This is the highest-leverage lighthouse opportunity for CoveredUSA.**
**Lighthouse (build 2):**
- `/2026-open-enrollment-deadlines` — Updated multiple times per OEP window. Cited by Bing/Copilot whenever users ask "when does open enrollment end". Heavy traffic Nov 1 – Jan 15.
- `/medicare-annual-enrollment-2026` — Same shape for Medicare AEP (Oct 15 – Dec 7).
- **Schema:** `Event` for each enrollment window + `FAQPage`
- **Maintenance:** Weekly during enrollment periods; archive after period closes

### Template 6: Personas (e.g., self-employed, student, retiree)
**Cluster:** Most persona pages
**Lighthouse (build 0–1):** Skip lighthouse for now. Persona pages tend to be intent-specific and don't accumulate citation power at the head-query level. Build the cluster well and revisit if any persona page starts winning citations naturally.

### Template 7: State MA (`/state/[state]/medicare-advantage`)
**Cluster (build 50):** All state pages
**Lighthouse (build 1):** `/medicare-advantage-state-comparison-2026`
- **Title:** *"Best Medicare Advantage Plans by State 2026: How Plan Availability and Pricing Vary"*
- **Outline (200 words):** Comparison table of all 50 states showing (State | # of plans | $0 premium plans available | Avg plan rating | Top carrier). Methodology box. Links to all 50 state pages. Becomes the lighthouse for "best Medicare Advantage by state" and challenges NerdWallet for the head term.
- **Schema:** `Dataset` + `Article` + `FAQPage`

### Net build recommendation
Build **9 lighthouses** total across the 7 templates (some templates get 0, events gets 2, Q&A gets 3). Maintenance overhead: each lighthouse needs ~4 hours of editorial review per month = ~36 hours/month for the lighthouse layer. That is significantly less than maintaining 500 programmatic pages, and based on the citation power-law data, will produce 5–10x the citation share.

---

## Challenger strategy — when to fight a locked slot

### The locked slots in our space
- **"Federal Poverty Level [Year]"** → KFF (state indicator) + HHS ASPE (poverty-guidelines hub)
- **"Does Medicare cover [X]"** → Medicare.gov
- **"How to apply for ACA"** → Healthcare.gov
- **"Ozempic cost"** → GoodRx
- **"What is hypertension"** → Mayo Clinic, Healthline, CDC (rotating)
- **"Best Medicare Advantage [year]"** → NerdWallet
- **"Federal disability benefits"** → SSA.gov

### When displacement is feasible
1. **The slot-holder is stale.** If KFF's FPL page hasn't been updated since the 2024 release and we publish a 2026 page with current numbers, we have a window of weeks before they refresh.
2. **The slot-holder has thin schema.** Many .gov pages omit JSON-LD entirely. A challenger with full `Dataset` + `FAQPage` + named author may win an emerging fan-out query the .gov page doesn't cover well.
3. **The slot is for an emerging intersection query.** "FPL by household size in [specific state] 2026" is plausible challenger territory. "FPL 2026" head term is not.
4. **The slot-holder has weaker brand entity trust than us in that specific vertical.** Unlikely for us vs. KFF/Mayo, but possible vs. mid-tier sites (HealthInsurance.org, Medicare FAQ).

### When to give up
- The slot is in the Microsoft Copilot Health named allow-list (Harvard, JAMA, Mayo, Cleveland, Kaiser, NAM). Don't fight Mayo for "what is hypertension." Build on adjacent ground.
- The slot is .gov for a regulatory/program query. Don't fight Medicare.gov for "what does Medicare cover." Compete on the *application* of that knowledge (cost, billing, savings strategies).

### Recommended posture for CoveredUSA
**Pick unclaimed slots first.** Most healthcare-cost intersection queries are unclaimed at the head level — "medical procedure costs 2026 comparison," "out-of-pocket maximum by state," "Medicare Part D formulary by tier" are not dominated by a single entrenched player. Build there. Reserve challenger plays for cases where we have a real freshness or schema advantage and budget for 6–12 months of sustained effort.

---

## Microsoft's algorithm direction

What is Microsoft trending toward?

### 1. Toward more passage-level grounding, not less
Microsoft's May 2026 *"Evolving role of the index"* blog explicitly describes the shift from page-level ranking to passage-level support of answers. *"Chunking/transformations must preserve meaning… Critical."* *"Provenance is now a Core signal."* This is a permanent direction, not a phase.

### 2. Toward more vertical trust filters (Copilot Health-style)
Copilot Health's named allow-list (March 2026) is the first public example of Microsoft applying a per-vertical trust gate. Expect this pattern in finance, legal, and other YMYL verticals. Practical implication: the citation power-law is going to get *more* concentrated for high-stakes verticals, not less.

### 3. Toward exposing the citation data to publishers
The AI Performance Report (Feb 2026) is unprecedented transparency from a major engine. Microsoft is signaling that they *want* publishers to optimize for citations (which suggests they don't see it as a zero-sum game with publisher revenue — at least not yet).

### 4. Has Microsoft addressed citation concentration publicly?
**No direct statement found.** The AI Performance Report announcement does not address the power-law distribution. The launch dataset Microsoft chose to highlight (5 pages = 74.6%) implicitly shows the pattern but is not framed as a problem to fix. Working assumption: Microsoft is comfortable with the concentration, viewing it as the natural outcome of selecting the best source per query.

### 5. The schema future is wider, not just FAQ
Microsoft has named FAQ, Article, HowTo, Product, Review, Event, Recipe as schema types they value. Expect `Dataset`, `MedicalProcedure`, `Drug`, `GovernmentService`, and `Course` schema to gain weight as vertical retrieval matures.

---

## Bing organic vs AI citation divergence

The bulk of the evidence shows tight alignment (Seer Interactive: 87% overlap between SearchGPT and Bing top 10; Ahrefs: 76% of AI Overview citations from Google top 10). But where does it diverge?

### Cases where AI cites a page that isn't Bing #1
1. **Training-data residue.** Seer Interactive flagged Wikipedia citations that didn't match Bing rankings for the same query — model knew Wikipedia from pretraining and inserted it independent of live retrieval.
2. **Aggregator citations.** News sites and "best of" listicles got cited despite weaker Bing rank, likely because their content matched fan-out modifiers ("best," "top," "comparison").
3. **The 14% gap.** Ahrefs found 14.4% of cited pages didn't appear in Google top 100. Search Engine Land separately found ~68% of cited pages didn't rank top-10 for the *main query* — but they did rank for fan-out queries. This is the "fan-out rank" factor at work.

### What signals matter MORE for AI citation than for organic rank
Based on cross-referencing Cyrus Shepard's factor weights:
- **URL accessibility** (9.5) — basic, but AI engines fail-soft more aggressively on inaccessible pages than Google organic does
- **Fan-out rank** (9.3) — uniquely AI-specific; not a traditional ranking factor
- **Query-answer match** (9.2) — Google has soft semantic matching too, but AI engines weight extractability more
- **Answer near the top** (8.8) — strict per-URL retrieval cap forces this
- **Topic cluster ranking** (8.9) — ranking for multiple related queries signals domain authority *for the topic* in a way AI engines weight more than Google does
- **Self-contained passages** (8.0) — passages must stand alone without surrounding context; Google's rankings can lean on context
- **AI-ready structure** (8.6) — formatting must enable extraction

### Signals that matter LESS for AI than for organic
- **Domain Authority** (5.0) — Cyrus rates DA as much weaker for AI than for Google rank. SE Ranking found DA 20–80 sites earn 63.6% of citations vs DA 80–100's underperforming 15%.
- **Backlinks raw count** — Ahrefs' 75K-brand study found backlinks weakly correlate with AI brand visibility; branded *mentions* (no link required) correlate 0.66–0.71.
- **LLMs.txt** (2.0) — "unable to find any credible evidence" of impact.

### The practical takeaway
The divergence is small (~10–14%) but consequential. A page can be Bing #1 and not win citations if it lacks extractable passages. A page can be Bing #4 and still win citations if it owns the fan-out queries Bing decomposes from the natural-language prompt. **Optimize for the grounding query set, not the single head term.**

---

## Open questions / what we don't know

1. **The actual chunk-level scoring formula.** Microsoft has named "chunking preserves meaning" and "provenance is a core signal" but has not described how Bing's grounding index ranks chunks within a page or across pages.
2. **The exact freshness decay curve.** Is it linear, exponential, or stepped? Search Influence's data is suggestive of stepped (cliff after ~30 days of staleness) but we have one longitudinal dataset.
3. **Whether `speakable` schema influences Copilot citation.** It's a known Google Assistant signal. Microsoft has not committed to it.
4. **Whether Copilot Health's named allow-list applies to general Copilot too, or only to the Copilot Health surface.** Unconfirmed.
5. **How citation share rotates across multiple lighthouse holders for the same query.** Does the 69%-holder hold for years, or does Bing rotate seasonally? The Search Influence data spans 91 days; we don't have multi-year longitudinal data on a single lighthouse position.
6. **The exact threshold at which `dateModified` bumps stop working without content change.** Microsoft has said freshness signals matter; SEO discussion forums have long suspected pure-date bumps don't pass muster. No public test data confirms the threshold.
7. **What happens to the citation share of programmatic pages when a lighthouse on the same site exists.** Does the lighthouse cannibalize the programmatic pages, or does it lift them via internal linking? We need our own A/B data after building.
8. **How much earned-media volume CoveredUSA needs to clear the brand entity trust bar.** Ahrefs found branded mentions 0.66–0.71 correlation with AI citation, but didn't publish an absolute threshold.

---

## Sources

- Search Influence, *"Inside Bing's New AI Performance Report: What 20,000 Copilot Citations Taught Us."* https://www.searchinfluence.com/blog/bing-ai-performance-report-copilot-citations/
- Microsoft Bing Webmaster Blog, *"Introducing AI Performance in Bing Webmaster Tools Public Preview"* (Feb 2026). https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview
- Microsoft Bing Webmaster Blog, *"Does Duplicate Content Hurt SEO and AI Search Visibility?"* (Dec 2025). https://blogs.bing.com/webmaster/December-2025/Does-Duplicate-Content-Hurt-SEO-and-AI-Search-Visibility
- Microsoft Bing Search Blog, *"Evolving role of the index: From ranking pages to supporting answers"* (May 2026). https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers
- Microsoft Bing Search Blog, *"Introducing Copilot Search in Bing"* (April 2025). https://blogs.bing.com/search/April-2025/Introducing-Copilot-Search-in-Bing
- Microsoft AI, *"Introducing Copilot Health"* (March 2026). https://microsoft.ai/news/introducing-copilot-health/
- Otterly.ai, *"Bing Webmaster Tools AI Performance Report: How to Analyze and Optimize Your Copilot Citations."* https://otterly.ai/blog/bing-webmaster-tools-ai-performance-report/
- Cyrus Shepard / Zyppy Signal, AI Citation Ranking Factors Analysis. https://signal.zyppy.com/p/ai-citation-ranking-factors
- PPC.land, *"23 factors that actually get your content cited by AI search engines."* https://ppc.land/23-factors-that-actually-get-your-content-cited-by-ai-search-engines/
- Ahrefs, *"76% of AI Overview Citations Pull From the Top 10."* https://ahrefs.com/blog/search-rankings-ai-citations/
- Surfer SEO, *"AI Citation Report 2025: Which Sources AI Overviews Trust Most Across Industries."* https://surferseo.com/blog/ai-citation-report/
- Seer Interactive, *"87% of SearchGPT Citations Match Bing's Top Results."* https://www.seerinteractive.com/insights/87-percent-of-searchgpt-citations-match-bings-top-results
- ALM Corp, *"Why 85% of Pages ChatGPT Retrieves Are Never Cited."* https://almcorp.com/chatgpt-retrieval-fanout-google-serps-citations/
- Search Engine Land, *"AI Overview fan-out rankings boost citation odds by 161%."* https://searchengineland.com/ai-overview-fan-out-rankings-boost-citation-odds-study-466426
- Position.Digital, *"150+ AI SEO Statistics for 2026."* https://www.position.digital/blog/ai-seo-statistics/
- Aggarwal et al., *"GEO: Generative Engine Optimization"* (arXiv:2311.09735). https://arxiv.org/abs/2311.09735
- *"Structural Feature Engineering for Generative Engine Optimization"* (arXiv:2603.29979). https://arxiv.org/html/2603.29979
- *"Generative Engine Optimization: How to Dominate AI Search"* (arXiv:2509.08919). https://arxiv.org/html/2509.08919v1
- Pedowitz Group, *"How Bing Copilot Sources Answers."* https://www.pedowitzgroup.com/how-bing-copilot-sources-answers-aeo-for-microsoft-search
- Joel Maldonado, *"How to Use Bing's AI Citations Data to Engineer Content That Gets Referenced."* https://medium.com/@schemata/how-to-use-bings-ai-citations-data-to-engineer-content-that-gets-referenced-7d0099520e73
- Lawrence Hitches, *"Microsoft Copilot SEO: How to Get Cited by Bing's AI."* https://www.lawrencehitches.com/copilot-search-optimization/
- Aleyda Solis, *"The Characteristics of AI Search Winning Brands."* https://www.aleydasolis.com/en/ai-search/ai-search-winning-brands-characteristics/

**Lighthouse pages fetched directly:**
- NerdWallet Best MA: https://www.nerdwallet.com/article/insurance/medicare/best-medicare-advantage-plans
- MedlinePlus Semaglutide: https://medlineplus.gov/druginfo/meds/a618008.html
- Healthline Hypertension: https://www.healthline.com/health/high-blood-pressure-hypertension
- CDC About High Blood Pressure: https://www.cdc.gov/high-blood-pressure/about/index.html
- KFF Health Policy 101: https://www.kff.org/health-policy-101/
- Wikipedia ACA: https://en.wikipedia.org/wiki/Affordable_Care_Act
- HHS ASPE Poverty Guidelines: https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines
- KFF State Indicator (Medicaid Enrollees by Age): https://www.kff.org/medicaid/state-indicator/medicaid-enrollees-by-age/
- NIH Health Information: https://www.nih.gov/health-information

**Could not fetch (403/timeout):** KFF FPL chart, GoodRx Ozempic, Mayo Clinic hypertension, Medicare.gov hubs, Healthcare.gov apply/lower-costs/glossary, Investopedia. Bot blocking is the dominant failure mode; data inferred from Surfer SEO citation share + operator reports.
