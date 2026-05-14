# AI-SEO Operator Playbooks — Research Report (May 2026)

**Audience:** CoveredUSA team
**Author context:** Day-30 of a programmatic AI-SEO bet on healthcare. 7 content tracks live. Goal: get cited by Copilot, Perplexity, ChatGPT, Claude, AI Overviews.
**Scope:** What operators who have already cracked AI-SEO at scale are doing, what's working, what's failing, and how to apply it to CoveredUSA.

---

## TL;DR

**Top 3 operators worth copying:**

1. **NerdWallet** — the canonical example of programmatic state pages that survived multiple core updates. Their playbook is template + real data (rates, taxes, calculators) + topical-cluster guides feeding the money pages. Tens of millions of monthly organic visits, in YMYL (finance is YMYL-adjacent to healthcare).
2. **Vercel** — best public diary of LLM-traffic capture in 2025-2026. Reported ChatGPT going from 1% → 4.8% → ~10% of new signups within ~6 months. Published the technical playbook (SSR/SSG only, no JS-rendered content, strict robots.txt hygiene, content depth over breadth).
3. **Andrew Holland (JBH)** — public operator who shipped 346 AI-assisted articles and reported 123K SEO traffic + 641 conversions at the 3-month mark, +50% WoW. Self-reported, but rare in being public + specific. Useful as a counter-anchor to the Lily Ray "AI content kills SEO" thesis.

**Top 5 tactics worth implementing now on CoveredUSA:**

1. **Lead each page with a direct, citable answer.** 44.2% of LLM citations come from the first 30% of body text. Bury nothing in the conclusion. ([Position.Digital](https://www.position.digital/blog/ai-seo-statistics/))
2. **Adopt IndexNow + sitemap pings on every publish/refresh.** The first authoritative page on a topic often becomes Copilot's "seed source." Get there first, not later. ([Bing Webmaster blog](https://blogs.bing.com/webmaster/July-2025/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search))
3. **In-body primary-source linking (CMS, HHS, KFF, state DOI).** Lawrence Hitches' Copilot case study and Aleyda Solis' AI Search Checklist both flag inline citations to primary sources as the single biggest discrete tactic that moves citation rates.
4. **Stand up FAQPage + Speakable + Article schema.** Multiple studies (Frase, WPRiders) report 30-44% citation lift; Microsoft's Fabrice Canel confirmed at SMX Munich March 2025 that schema helps Microsoft's LLMs understand content.
5. **Display a real `dateModified` and refresh meaningfully.** ChatGPT cites pages updated within 30 days 76.4% of the time. Perplexity skews ~50% to current-year content. But — and this is critical — **artificial timestamp bumps backfire**. Edit the substance, not the meta. ([Ahrefs freshness study](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/), [Lily Ray](https://lilyraynyc.substack.com/p/your-geo-strategy-might-be-destroying))

The contrarian takeaway: most "GEO playbooks" being sold are noise. Strong classical SEO performance is still the precondition for AI citation, because every major AI search product runs RAG on top of Bing or Google. There is no GEO shortcut around indexing and ranking.

---

## Operator Profiles

### 1. NerdWallet — programmatic state pages that survived

NerdWallet generates dedicated programmatic pages for queries like "[STATE] mortgage calculator" and "[STATE] [LOAN TYPE] rates." Each page contains: a brief state housing market overview, an interactive calculator (a real tool, not a placeholder), current rates pulled from a live data feed, and a property-tax chart. Titles, H1s, and H2s are templated against the state variable. ([Ahrefs](https://ahrefs.com/blog/nerdwallet-seo-case-study/), [HOTH](https://www.thehoth.com/blog/nerdwallet-seo/))

The point isn't the template — it's the **wrapper layer**: NerdWallet then produces extensive non-programmatic guides ("How to refinance in Texas," "FHA loan requirements 2026") that interlink with the comparison/state pages. The programmatic pages are the money layer; the guides build topical authority that makes the programmatic pages credible to Google. Reported scale: tens of millions of monthly organic visits, sustained through 2024-2025 core updates.

Application to CoveredUSA: do not ship state Marketplace pages without state guides backing them up. The cluster is what protects the template from being classed as scaled content abuse.

### 2. Vercel — the only operator publishing real LLM-referral data

Vercel's blog has been the highest-signal corporate diary of 2025-2026 on this topic. They reported ChatGPT referrals climbing from ~1% of new signups (mid-2024) → 4.8% (early 2025) → ~10% (mid-2025). ([Vercel blog](https://vercel.com/blog/how-were-adapting-seo-for-llms-and-ai-search))

Their technical takeaways, which they describe as enforced internally:
- **No JS-rendered content for crawlable surfaces.** ChatGPT and Claude crawlers do not execute JavaScript. SSR/SSG/ISR only.
- **`robots.txt` must explicitly allow OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-User, GPTBot (where the model lets you allow training is a separate decision).**
- **Single-comprehensive-page beats five-thin-page on the same topic.** Their finding: depth wins because LLMs pull individual passages and prefer high-information-density pages.
- **Sitemap + IndexNow on every deploy.**

Self-reported but technically falsifiable (you can verify their crawler logs claims against published bot lists).

### 3. Andrew Holland (JBH) — public AI-content scale case

Holland publicly reported a single project that published 346 AI-assisted articles and generated 123K SEO traffic + 641 conversions within ~3 months, growing 50% week-on-week at that snapshot. ([LinkedIn](https://www.linkedin.com/posts/andrew-holland-seo_product-led-ai-seo-case-study-activity-7123385516804173824-G2Ys))

This is **self-reported, snapshot data, not third-party verified.** It does, however, illustrate a working pattern that several operators have echoed: AI-generated drafts + human editing + strong on-page templating + topical-cluster architecture. The risk vector — which Lily Ray's analysis confirms — is that snapshot growth like this often inverts during the next core update. Treat as a "this can work" proof point, not a "this is sustainable" proof point.

### 4. Lily Ray (Amsive, ex-Path Interactive) — the counter-operator

Ray is the most rigorous public skeptic of GEO-as-separate-discipline. Two posts from late 2025/early 2026 are required reading:

- ["A Reflection on SEO, GEO & AI Search in 2025"](https://lilyraynyc.substack.com/p/a-reflection-on-seo-and-ai-search) — argues every major AI search product is RAG on top of a classical index, so indexing/ranking *is* the GEO precondition.
- ["Your GEO Strategy Might Be Destroying Your SEO"](https://lilyraynyc.substack.com/p/your-geo-strategy-might-be-destroying) — five tactics she identifies as actively harmful: scaled AI content without value-add, artificial timestamp refreshing, self-promotional best-of listicles ranking your own brand #1, "summarize with AI" prompt-injection buttons (Microsoft formally classified this as a security issue in Feb 2026), and excessive comparison/versus pages. She tracked specific client domains (anonymized) whose traffic collapsed during the Jan 2026 core update after stacking these tactics.

Her practical recommendation: spend GEO budget on content depth, primary-source linking, and brand mentions across high-authority surfaces (Reddit, YouTube, industry pubs), not on hidden-prompt gimmicks.

### 5. Aleyda Solis — the most actionable public checklist

Solis released the AI Search Content Optimization Checklist on June 16, 2025, and stood up [LearningAIsearch.com](https://learningaisearch.com/about/) in July 2025. ([PPC.land coverage](https://ppc.land/seo-expert-releases-ai-search-content-optimization-checklist/))

Her eight optimization areas, applied to a healthcare context, distill to: clear answer in the lead, structured data, primary-source linking, author/reviewer expertise display, entity consistency, multi-language coverage (Spanish is high-value for CoveredUSA), schema for content type, and freshness signaling that reflects real updates.

### 6. Glen Allsopp / Detailed (now part of Ahrefs)

Allsopp's Detailed quarterly reports analyze ranking patterns across 3,078 "digital goliaths." Detailed was acquired by Ahrefs in September 2025 and Allsopp joined the company. His public warning on programmatic SEO case studies: even when authoritative sites create pages programmatically, there is no guarantee they hold up over time — site authority does the lifting, and removing that authority (or losing it via a core update) collapses the programmatic layer first.

His Q3/Q4 reports are paid but Ahrefs has been republishing summary data. Relevance to CoveredUSA: we don't have Goliath authority. We need to earn the equivalent through editorial wrapper content, primary-source linking, and external mentions. Programmatic templates without that scaffolding are the exact pattern that gets deindexed.

### 7. Microsoft (Bing Webmaster Tools team)

The **AI Performance report** launched in public preview February 9, 2026. ([Bing blog](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)) For the first time, publishers can see (sample-level) which URLs Copilot grounds answers on, the grounding queries used, and citation trends over time.

The most publicized real-world dataset (Nov 2025–Feb 2026, one publisher): 647 unique grounding queries → 30,398 grounding events across 173 pages, but **5 pages carried 74.6% of all citations** and programmatic pages contributed only **4.8% of citations**. This is the most important data point in the report. It tells us the citation distribution is power-law, not normal — a few "lighthouse" pages do nearly all the work. ([Bing blog comments, OtterlyAI analysis](https://otterly.ai/blog/bing-webmaster-tools-ai-performance-report/))

For CoveredUSA: the implication is to over-invest in 5-10 lighthouse pages per cluster, not to spread effort evenly across the long tail.

---

## The 2026 Programmatic AI-SEO Playbook (Consolidated)

Synthesizing across the seven operators above:

### Layer 1 — Index and rank classically. There is no shortcut.
- SSR/SSG/ISR only. JS-rendered content is invisible to ChatGPT/Claude crawlers.
- `robots.txt` explicitly allowing AI bots you want to be cited by. Block training bots only if you're confident.
- Sitemap kept clean (no 404s, no soft-404s, no parameter spam).
- IndexNow pings on every publish and meaningful refresh.

### Layer 2 — Build a hub-and-spoke architecture before scaling templates.
- 1 pillar guide per topic cluster (e.g., "How ACA Marketplace works in 2026" — 3000-5000 words, high editorial quality, human-reviewed).
- 10-30 cluster pages (state-specific, plan-type-specific, year-specific) that interlink to the pillar and to each other via contextual anchors.
- Internal link density 1-2%, anchors that reflect real entity relationships (not keyword stuffing).

### Layer 3 — Inject real data, not just text rephrasing.
- The thing that separates NerdWallet from a content farm: their pages contain a calculator with real numbers. Yours should pull rates from CMS data feeds, state Medicaid eligibility tables, plan availability files. **Data freshness is content freshness.**

### Layer 4 — Citation-shaped content.
- Direct-answer lead (44.2% of citations come from the first 30%).
- Numeric specificity in H2s ("What is the 2026 federal poverty level for a family of 4 in California?" beats "Federal poverty guidelines").
- Inline primary-source links in body, not as a separate references section.
- FAQ blocks for question-shaped queries.

### Layer 5 — Schema, schema, schema.
- `Article` with `dateModified`, `author`, `reviewer`.
- `FAQPage` for question blocks.
- `Speakable` markup on the lead and TL;DR.
- `MedicalWebPage` where applicable (we are a YMYL site).
- JSON-LD format, never microdata or RDFa.

### Layer 6 — Distribution beyond search.
- Multi-source consensus matters. AI engines confidence-weight sources that show up across Reddit, YouTube, industry pubs, and the brand site. Plan for at least one external mention per lighthouse page (Reddit AMA, syndication, expert quote).
- Bing Webmaster Tools URL submission for net-new pages (separate from IndexNow — both, not one).

### Layer 7 — Refresh meaningfully on a cadence.
- Ahrefs' 17M-citation study: AI assistants disproportionately cite fresh content (the "13-week rule" is the public name for the pattern — content edited within ~13 weeks is meaningfully more cited).
- BUT: bumping `dateModified` without a substantive content change is a flagged pattern. Update real numbers, real links, real claims.

### Layer 8 — Measure with the right surface.
- Bing Webmaster Tools AI Performance Report (citations from Copilot).
- Cloudflare AI Audit / Vercel observability for crawler hits.
- Otterly / Profound / Peec / ZipTie / SE Ranking AI module — third-party AI citation trackers. None of these are gospel yet; cross-reference at least two.
- GA4 referral data filtered on chat.openai.com, perplexity.ai, copilot.microsoft.com, claude.ai. Imperfect but real.

---

## AI-Citation-Specific Tactics (What's Different From Google SEO)

These are the tactics operators specifically report as working **for AI citations**, not (or in addition to) classical ranking:

**1. Direct-answer lead with citation-worthy specificity.**
"In 2026, the federal poverty level for a single person in the contiguous 48 states is $15,650/year. Subsidies on the ACA Marketplace are available up to 400% of FPL, which is $62,600/year." — that's citable. An LLM extracts that paragraph wholesale. Compare with: "Premium subsidies depend on your household's income relative to federal poverty guidelines, which vary based on family size and state of residence." — same information, uncitable.

**2. Inline primary-source links to .gov and academic domains.**
ChatGPT cites Wikipedia 47.9% of the time, Perplexity cites Reddit 46.7%, AI Overviews lean on YouTube. But for healthcare YMYL queries, all three lean disproportionately on CMS.gov, HHS, KFF, and state DOI sites. **You want to be the page that links to those sources fluently** — being one link removed from CMS.gov is the next best thing to being CMS.gov.

**3. Author + Reviewer markup with real credentials.**
For healthcare, this is non-negotiable. Author bio with credentials (MD, RN, JD, licensed broker), reviewer name + credentials + date reviewed, schema.org `author` and `reviewedBy` properties. AI engines look at these signals because they mirror E-E-A-T, which the underlying ranking layer already uses.

**4. Speakable schema on the lead paragraph and TL;DR.**
Tells Copilot which sections are safe to extract for voice and answer outputs. Underutilized in healthcare.

**5. Year-anchored titles and H2s that match query language.**
"2026 ACA Open Enrollment Dates by State" beats "ACA Open Enrollment Dates." Perplexity in particular shows a strong current-year bias.

**6. Bilingual coverage (es-MX especially).**
Healthcare queries in Spanish are a large under-served surface. AI engines route Spanish queries to Spanish-language sources. Hreflang done right + parallel Spanish content = an order-of-magnitude expansion in citation surface for the same effort.

**7. Structured comparison tables.**
Plan comparisons rendered as tables with consistent column headers. LLMs extract tabular data well and often cite the source.

**8. Numeric specificity, every paragraph.**
Replace "many," "most," "some" with actual numbers. Numbers are the unit of citation in LLM output.

---

## Failure Patterns to Avoid

From Lily Ray's analysis and Google's documented spam policies:

1. **Scaled content abuse.** Mass-publishing without value-add. Google's 2024 policy is explicit. The 2025 December core update and January 2026 update both correlated with deindexing of mass-AI sites.
2. **Artificial timestamp bumps.** Updating `dateModified` without changing content. Lily Ray and Glenn Gabe both document this in algorithm-update postmortems.
3. **"#1 best in our own category" listicles.** Self-ranked self-promotional content. Two named companies were tracked into traffic decline during Jan 2026.
4. **Excessive versus/alternatives page sprawl.** One company hit 51 versus pages and started losing ChatGPT citations alongside organic traffic.
5. **Hidden prompt-injection on "summarize with AI" buttons.** Microsoft formally classified this as AI Recommendation Poisoning in February 2026 and documented 50+ examples across 31 companies.
6. **Schema misuse.** Marking up content with FAQ schema when the content isn't actually FAQ-shaped, or marking up reviews that don't exist. Multiple manual actions documented in 2025.
7. **YMYL trust failures.** Author bylines missing, reviewer credentials absent, primary-source citations missing, "last reviewed" date stale. Healthcare-specific kill vectors.
8. **Programmatic pages without editorial wrapper.** The pattern: ship 1000 templated pages with no pillar guides. Survives 2-3 months, then deindexes during a core update. Confirmed across Grokipedia (which lost visibility late Jan/early Feb 2025 per Lily Ray and Glenn Gabe).

---

## Topic Selection Methodologies (Compared)

Five methodologies operators report using, from most rigorous to most exploratory:

**(A) Authority Map Methodology (cluster-led).** Pull GSC data, identify clusters where the domain already ranks in top-20. Expand programmatically inside clusters where you have authority. Used by NerdWallet implicitly. *Best for established sites.*

**(B) Search Volume × KD × Commercial Intent (Ahrefs-style).** Score every candidate topic on volume, keyword difficulty, and commercial value. Pick top decile. Most common; least differentiating. *Default starting point.*

**(C) Competitor Gap Analysis.** Find pages ranking on Healthline / WebMD / GoodRx / KFF where you have a structural advantage (more data, more recency, narrower angle). Build into those gaps. *High signal-to-noise but narrow.*

**(D) AI Query Log Mining.** Ask Copilot / Perplexity / Claude with structured prompts what queries they currently can't answer well in your vertical. Cross-reference with low-confidence answers from the same engines. This is increasingly the **operator move of 2026** — Aleyda Solis has been advocating this loudly. *Highest leverage, hardest to systematize.*

**(E) State × Topic × Year Cartesian.** The brute-force programmatic move. 50 states × 30 topics × 1 year = 1500 pages. Only works if each page has unique data, otherwise pure scaled-content-abuse signature.

For CoveredUSA, the right composition is **(D) for lighthouse selection + (A)/(E) hybrid for the long tail**, with each long-tail page required to contain at least one piece of state-specific real data.

---

## Tool Recommendations

**Use:**
- **Bing Webmaster Tools + AI Performance Report.** Mandatory. The only first-party Copilot citation surface.
- **Google Search Console.** Still the bedrock. Don't touch GEO until GSC is healthy.
- **IndexNow** (via key file or API).
- **Ahrefs or Semrush** for the gap analysis and authority mapping. Ahrefs has slightly better LLM-citation telemetry as of mid-2026.
- **One AI citation tracker:** Otterly, Profound, or Peec. None are great; pick one and stick with it for trend data.
- **Surfer SEO 2026 with AEO Scorer** or **Frase.io** for content optimization. Frase pulls Reddit + Quora + PAA questions which seed the FAQ blocks well.
- **Schema validator** (Google Rich Results Test + schema.org validator).
- **Screaming Frog or Sitebulb** for technical audits.

**Use with caution:**
- **Clearscope.** Enterprise-priced. Recently rebranded around AEO. Solid for long-form depth scoring but overlapping with Surfer/Frase.
- **MarketMuse.** Established but slow to adapt to AI-search specifics.

**Don't use:**
- **Any tool that promises "guaranteed AI citations" or "AI-proof content."** These are scams as of 2026. The space is too young.
- **Auto-generated content pipelines with no editorial layer.** The grade-against-rubric step is non-negotiable.
- **"Summarize with AI" buttons with hidden prompts.** Microsoft formally flagged this in Feb 2026 (see Failure Patterns).

---

## Application to CoveredUSA

We're 30 days in with 7 content tracks running. Specific recommendations:

**1. Audit the current 7 tracks against the lighthouse hypothesis.**
The Bing AI Performance Report data showed 5 pages drove 74.6% of one publisher's citations. We should not expect uniform performance across our pages. Pick the 5-10 candidate lighthouse pages per track and over-invest there: full editorial review, real data, primary-source links, Speakable schema, Spanish parallel.

**2. Stand up a pillar guide for each track immediately if we haven't.**
The 346-article Holland case and the NerdWallet pattern both rely on editorial wrapper content. If a track is pure programmatic with no pillar, we are exposed to scaled-content-abuse classification on the next core update.

**3. Implement IndexNow + sitemap re-ping on every publish.**
First-mover advantage is real on Copilot ("seed source" pattern). Cron job that pings on every CMS publish and on every meaningful refresh (defined as: >20% content delta, not just a date bump).

**4. Add author + reviewer credentials site-wide.**
Healthcare YMYL. Non-optional. Every page needs a bylined author with credentials, a reviewer name + date, and `author`/`reviewedBy` schema. If we don't have credentialed reviewers internally, partner with one — even one licensed health insurance broker reviewing a batch of pages adds significant trust signal.

**5. In-body primary-source linking on every page.**
At minimum 2-3 inline links per page to CMS.gov, HHS, KFF, state DOI, or peer-reviewed sources. Not in a references section — inline, in the paragraph where the claim is made.

**6. Numeric specificity sweep.**
Scrub all content for "many," "most," "varies." Replace with actual numbers from current 2026 data. This is the single highest-leverage content edit we can do.

**7. Bilingual track.**
Spanish-language parallel content for the lighthouse pages first. Hreflang done correctly. The CoveredUSA audience skews toward populations under-served by English-only health content; this is both ethically the right call and a citation-surface expansion.

**8. Stand up the AI citation tracking stack.**
- Bing Webmaster Tools (mandatory).
- One paid tracker (Otterly or Profound — pick one this week).
- GA4 referral segment for chat.openai.com, perplexity.ai, copilot.microsoft.com, claude.ai.
- Weekly review of which pages are picking up citations, double-down on those clusters.

**9. Avoid the five tactics Lily Ray flagged.**
Specifically: no "best of" listicles ranking ourselves, no artificial timestamp bumps, no hidden-prompt summarize buttons, no excessive versus/alternatives sprawl, no scaled AI content without an editorial layer.

**10. 90-day target.**
By day 120 (mid-August 2026), we should have:
- Bing AI Performance Report showing meaningful citation count (>100/day from Copilot).
- At least 3 lighthouse pages per track carrying disproportionate citation share.
- Pillar guide + 10-20 cluster pages per track at minimum.
- Spanish parallel for top 30 lighthouse pages.
- GA4 showing AI referrals >2% of total organic.

If we hit those, the strategic bet is validated. If not, the failure mode is probably either authority (we are too new to be trusted) or template quality (the programmatic layer doesn't have enough unique data per page). Both are fixable.

---

## Sources

- [Bing AI Performance Report announcement (Feb 2026)](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)
- [Bing: Keeping Content Discoverable with Sitemaps in AI Powered Search (July 2025)](https://blogs.bing.com/webmaster/July-2025/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search)
- [Lily Ray: A Reflection on SEO, GEO & AI Search in 2025](https://lilyraynyc.substack.com/p/a-reflection-on-seo-and-ai-search)
- [Lily Ray: Your GEO Strategy Might Be Destroying Your SEO](https://lilyraynyc.substack.com/p/your-geo-strategy-might-be-destroying)
- [Vercel: How we're adapting SEO for LLMs and AI search](https://vercel.com/blog/how-were-adapting-seo-for-llms-and-ai-search)
- [Aleyda Solis: AI Search Optimization checklist (PPC.land coverage)](https://ppc.land/seo-expert-releases-ai-search-content-optimization-checklist/)
- [Ahrefs: NerdWallet SEO case study](https://ahrefs.com/blog/nerdwallet-seo-case-study/)
- [HOTH: 7 SEO Ideas from NerdWallet's $520M Content Strategy](https://www.thehoth.com/blog/nerdwallet-seo/)
- [Ahrefs: New study — AI Assistants prefer to cite fresher content (17M citations)](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/)
- [Profound: AI Platform Citation Patterns](https://www.tryprofound.com/blog/ai-platform-citation-patterns)
- [Hacker News thread on 680M citations / 11% domain overlap](https://news.ycombinator.com/item?id=47223235)
- [Lawrence Hitches: Microsoft Copilot SEO Real Case Study](https://www.lawrencehitches.com/copilot-search-optimization/)
- [OtterlyAI: Bing Webmaster Tools AI Performance Report analysis](https://otterly.ai/blog/bing-webmaster-tools-ai-performance-report/)
- [Andrew Holland: Product-Led AI SEO Case Study (LinkedIn)](https://www.linkedin.com/posts/andrew-holland-seo_product-led-ai-seo-case-study-activity-7123385516804173824-G2Ys)
- [Search Engine Land: Blueprint for semantic programmatic SEO](https://searchengineland.com/semantic-programmatic-seo-blueprint-476262)
- [NoGood: Programmatic SEO at Scale (Feb 2025)](https://nogood.io/2025/02/18/programmatic-seo/)
- [Position.Digital: 150+ AI SEO Statistics for 2026](https://www.position.digital/blog/ai-seo-statistics/)
- [Frase: FAQ Schema for AI Search, GEO & AEO](https://www.frase.io/blog/faq-schema-ai-search-geo-aeo)
- [WPRiders: Schema Markup — 8 Tactics to Boost AI Citations](https://wpriders.com/schema-markup-for-ai-search-types-that-get-you-cited/)
- [Detailed (Glen Allsopp)](https://detailed.com/)
- [LearningAIsearch.com (Aleyda Solis)](https://learningaisearch.com/about/)

**Flagged self-reported claims (not third-party verified):**
- Andrew Holland's 346-article / 123K traffic / 641 conversions — self-reported on LinkedIn, snapshot data, no third-party verification.
- Vercel's ChatGPT referral percentages — first-party but plausible given the audience.
- NoGood's "65% of clients double revenue in 6 months / 84% retention" — agency self-reporting.
- The Bing AI Performance Report case study (647 grounding queries / 30,398 events / 173 pages / 4.8% programmatic citation share) — first-party Microsoft data, single publisher snapshot.
