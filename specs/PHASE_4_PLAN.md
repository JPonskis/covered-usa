# Phase 4 Plan: From Templates to Citations

**Status:** Proposed — pending Jacob approval
**Author:** Frank, 2026-05-13
**Synthesis of 6 research threads:** Bing Webmaster API, Copilot citation mechanics, healthcare competitor landscape, AI-SEO operator playbooks, content scoring framework, Bing AI tooling beyond search.
**Backing reports:** `specs/research/{bing-webmaster-api,copilot-citation-mechanics,competitor-landscape,ai-seo-operator-playbooks,scoring-framework,bing-ai-tooling}.md`

---

## TL;DR

**The strategic question:** how do we figure out which specific articles to write for each of our 7 templates?

**The strategic answer:** stop thinking "mass-produce 500 thin programmatic pages." Instead, build **5–10 lighthouse pages per template that win their query space**, plus a programmatic long tail for SEO traffic. Citation distribution is power-law — in Microsoft's published dataset, **5 pages drove 74.6% of all Copilot citations and programmatic pages contributed only 4.8%**.

**The five concrete pivots:**

1. **Re-rank templates by leverage.** Procedure costs + trigger events + personas are HIGH leverage. Glossary + Q&A head terms are LOW (skip as growth bets). State Medicare Advantage is MEDIUM (already shipped Phase 3A). Drug costs are LOW for head terms but MEDIUM for second-tier drugs + class queries.

2. **Wire up the data pipeline.** Bing Webmaster API (we have it, key validates), Microsoft Clarity (free heatmaps + Claude-queryable via MCP), Microsoft Advertising Keyword Planner (free Bing keyword volume), and Microsoft Start Partner program (RSS syndication to MSN). All free, all setup today.

3. **Pick articles by formula, not vibes.** 8-input weighted-sum score: Bing traffic potential (0.22), AI citation fit (0.20), inverse KD relative to our domain (0.15), commercial intent (0.18), template fit (0.10), freshness window (0.05), minus BenefitsUSA cannibalization (0.07) and production cost (0.03). Hard filters before scoring. Tunable in a Google Sheet.

4. **Patch the architecture for AI citations.** Three citation-killing gaps in our current pages: no `reviewedBy`/`lastReviewed` in MedicalWebPage schema, no visible bylines/credentials, primary sources buried in `sources[]` instead of inline in the opening paragraph. Plus we should add Speakable JSON-LD for TL;DR + FAQ blocks.

5. **Adopt lighthouse + cluster shape.** For each template, one pillar guide (3,000–5,000 words, deeply researched, real data, primary sources inline, named author + reviewer) plus 10–20 cluster pages linked to it. Programmatic pages without a pillar guide are exposed to scaled-content-abuse classification.

If we approve this plan, the next step is: **set up the data pipeline (half day), build the scoring script (half day), score 500 candidates across 3 priority templates, ship 5 lighthouse pages + 25 cluster pages in the first batch (procedure costs first).** Target: by August (before AEP Oct 15), we have 60–80 lighthouse + cluster pages live with measurable Copilot citation pickup.

---

## The 5 strategic shifts (with evidence)

### Shift 1: Power-law citation, not normal distribution

Microsoft's first published publisher dataset (Nov 2025–Feb 2026): 647 grounding queries → 30,398 citation events across 173 pages, but **5 pages carried 74.6% of all citations**. Programmatic pages, despite making up the bulk of the URL surface, contributed only **4.8%** of citations. [Bing AI Performance launch · OtterlyAI analysis]

Search Influence's independent analysis of 20,000 Copilot citations found one URL captured **69% of citations** and the top 4 captured **90%**. "Depth beats breadth."

**Implication:** Spreading effort uniformly across 100 templated pages is wrong. The same effort concentrated into 5 lighthouse pages — deeply researched, primary-source-cited, fresh, schema-rich, named-author — will out-cite the 100 templated pages by an order of magnitude.

Our existing templates aren't wrong. They're under-invested. Each one needs a lighthouse before the long tail.

### Shift 2: Bing-first means three surfaces for the price of one

Seer Interactive's analysis: **87% of SearchGPT citations match Bing's top organic results.** Microsoft Copilot grounds in Bing directly. Optimizing for Bing organic = optimizing simultaneously for:

- Bing organic search (~10% of US search)
- Microsoft Copilot citations
- ChatGPT Search citations

Google effort serves Google plus a smaller share of AI Overviews. The Microsoft side is the leverage play. We've been instinctively right; the research validates it.

### Shift 3: Re-rank templates by competitive leverage

The competitor research mapped every template against actual SERP saturation. Verdict:

| Template | Top competitor | Our leverage | Recommendation |
|---|---|---|---|
| Procedure costs | GoodRx + SingleCare (long tail = AI-spun low-DR junk) | **HIGH** | **Mass-produce first.** Beat the long tail on schema, Spanish, Medicare rate inclusion. |
| Trigger events | Healthcare.gov + healthinsurance.org | **HIGH** | Mass-produce second. .gov pages are skeletal; state combos wide open. |
| Personas | Stride + Catch + BenAvest (fragmented) | **HIGH** | Mass-produce third. App brands aren't winning SEO. |
| State Medicare Advantage | NerdWallet + US News + MedicareGuide | MEDIUM | Phase 3A shipped CA, finish the 50 but accept #3–#5 ranks. Win on county + Spanish + persona splits. |
| Drug costs | GoodRx + Drugs.com + manufacturer | LOW (head) / MEDIUM (long-tail) | Skip Ozempic, insulin head. Hit second-tier + class queries + Part D OOP cap explainers. |
| Q&A | Medicare.gov + AARP | LOW (head) / MEDIUM (long-tail) | Skip "does Medicare cover dental." Hit state + program + year combos like "does Medicaid cover rehab in Texas 2026." |
| Glossary | Healthcare.gov + carriers + Investopedia | LOW | Skip as growth bet. Keep as internal-link nodes only. |

Order of attack: **Procedure costs → Trigger events → Personas → finish state MA → Drug long-tail.** Glossary + Q&A head terms are not growth bets; they're plumbing for internal linking.

### Shift 4: Schema gaps are bigger than I thought

The Copilot citation research surfaces three architectural gaps in our current Phase 2 + Phase 3A pages:

1. **MedicalWebPage schema is emitted but lacks `lastReviewed` + `reviewedBy`.** For YMYL health content this is the single highest-leverage missing piece. Microsoft Copilot Health specifically rewards `reviewedBy` with a clinician credential.

2. **No visible author bylines.** Every page should show "By [name, credential]. Reviewed [date] by [reviewer, credential]" at the top. AI engines mirror E-E-A-T signals from on-page presence.

3. **Primary sources buried in `sources[]` footer block instead of inline in opening paragraph.** "According to CMS, the 2026 federal poverty level for a family of 4 is $32,150" beats "The 2026 FPL is $32,150" by a wide margin in both selection and absorption scoring.

Plus one straightforward addition: **Speakable JSON-LD** on the Quick Answer + FAQ blocks. Microsoft hasn't confirmed it for Copilot specifically but it's cheap and consistent with the voice/answer extraction pattern.

### Shift 5: Lighthouse + cluster, not just programmatic

The most consistent operator pattern (NerdWallet, Vercel, Andrew Holland, Aleyda Solis) is **hub-and-spoke architecture**, not pure programmatic.

- **1 pillar guide per topic cluster** (3,000–5,000 words, editorially curated, named author + reviewer, primary-source heavy).
- **10–30 cluster pages** (programmatic templates) linking up to the pillar and across to each other.
- Internal link density 1–2%.

Programmatic pages without pillar guides are the exact pattern that gets deindexed during core updates. Grokipedia is the cautionary tale (lost visibility Jan/Feb 2025 per Lily Ray + Glenn Gabe).

**Practical translation for CoveredUSA:** before mass-producing the 10 procedure cost cluster pages, ship the procedure cost pillar guide first (`/cost/` hub or a dedicated `/how-medical-procedures-are-priced-2026` lighthouse). Same for trigger events and personas.

---

## The data pipeline

These are the data sources we wire up and what each gives us.

### Tier 1 — must have, set up this week

| Source | Endpoint | Cost | What we get |
|---|---|---|---|
| **Bing Webmaster Tools API** | `https://ssl.bing.com/webmaster/api.svc/json/<Method>?apikey=...` | Free | Bing keyword volume, related keywords, our site's query performance, crawl issues, URL submission. Key already validated on both BenefitsUSA + CoveredUSA. |
| **Bing AI Performance Report** | Web UI only (manual export until API ships) | Free | Per-URL Copilot citation counts + grounding queries. Only first-party AI-citation telemetry. |
| **Microsoft Clarity** | JS tag + `@microsoft/clarity` npm + MCP server | Free | Unlimited heatmaps + session replay + AI-summarized insights. MCP server lets Claude query analytics natively. |
| **Microsoft Advertising Keyword Planner** | Web UI (free; API requires developer token) | Free | Bing-specific keyword volume + CPC + intent data, orthogonal to Google Keyword Planner. |
| **Google Search Console (BenefitsUSA + CoveredUSA)** | Existing OAuth | Free | Cannibalization detection. What's already ranking on BenefitsUSA (avoid). What's getting impressions on CoveredUSA (double down). |
| **IndexNow** | Already wired | Free | Push-notify on every publish + meaningful refresh. |

### Tier 2 — high-leverage, set up over the next month

| Source | Cost | What we get |
|---|---|---|
| **Microsoft Start Partner program** | Free, approval-gated | RSS-syndicated to MSN.com + Edge new-tab feed + Microsoft Start mobile app. Requires `/feed.xml`, `/about`, named author pages. |
| **Bing News Pubhub** | Free | Submission to Bing News index. Provides news-shaped content distribution. |
| **One paid AI-citation tracker (Otterly OR Profound OR Peec)** | $50–200/mo | Cross-engine citation tracking (Copilot + Perplexity + ChatGPT + Claude). Pick one, none are great yet. |
| **DataForSEO Bing Keyword Data API** | ~$0.0005/keyword | Programmatic keyword volume at scale (the Bing Webmaster API has rate limits + per-query overhead). |

### Tier 3 — consider later

- **Ahrefs** ($129/mo) — backlinks + competitor research + traffic potential. Adds Bing position tracking but not Bing volume database. Use as a complement to Bing Webmaster API once we have budget.
- **Surfer SEO with AEO Scorer** or **Frase** ($59–199/mo) — content optimization. Useful when writing lighthouse pages.
- **Copilot Studio agent** — strategic play, build a "CoveredUSA Healthcare Helper" Copilot agent using our content as knowledge. Discoverable in Copilot's AppSource catalog. Strategic, not urgent.

### What we're explicitly NOT setting up

- **Bing Search API v7 / Custom Search** — retired Aug 11, 2025
- **Azure AI Foundry Grounding with Bing Search** — $35 per 1K queries, only useful for customer-facing agents
- **Azure OpenAI** — no ranking benefit, switching from Claude buys us nothing
- **Bing Places for Business** — irrelevant for national informational site
- **"AI citation guaranteed" tools** — vendor scams as of 2026

---

## The scoring formula

**This is the answer to "how do we weight the data points."**

```
score = 0.22 · norm(bing_traffic_potential)
      + 0.20 · ai_citation_fit              [sub-formula below]
      + 0.15 · inverse_kd_relative
      + 0.18 · commercial_intent
      + 0.10 · template_fit
      + 0.05 · freshness_window
      - 0.07 · benefitsusa_cannibalization
      - 0.03 · production_cost
```

All inputs are min-max normalized to [0,1] within the candidate set being scored (e.g., 200 procedure-cost candidates, not against the universe). Weights sum to 1.00 on the positive side (0.90) plus -0.10 of penalties.

### Sub-formula: `ai_citation_fit`

```
ai_citation_fit = 0.25 · query_answer_match     [heuristic: does our template structure match the SERP feature shape for this query?]
                + 0.20 · fan_out_potential       [count of variant queries our template would rank for]
                + 0.15 · intent_format_match     [does template format match SERP intent: list, table, definition, comparison?]
                + 0.15 · factually_specific      [count of numeric facts available in source data — FPL thresholds, dollar amounts, dates]
                + 0.10 · faq_schema_applicable   [binary 0/1]
                + 0.10 · freshness_anchor        [year in URL/title viable? 0/1]
                + 0.05 · cites_sources           [≥2 primary sources in research pack? 0/1]
```

### Weight reasoning

| Input | Weight | Justification |
|---|---|---|
| Bing traffic potential | 0.22 | Largest single input. Direct measure of upside. |
| AI citation fit | 0.20 | Co-leading. Bing-Copilot is our primary surface and compounds (one cited page → many AI answers). |
| Inverse KD relative | 0.15 | We're new — biased toward KD ≤ 25 we can actually rank for. |
| Commercial intent | 0.18 | Higher than industry norm (0.10–0.12). We have two strong conversion surfaces (`/screener`, `/medical-bill-analyzer`) and finite content budget. |
| Template fit | 0.10 | Heuristic but important — forcing a life-event topic into the procedure template wastes effort. |
| Freshness window | 0.05 | Small but year-anchored topics get the bump (Shepard ranks freshness 7.0/10 across AI citation factors). |
| BenefitsUSA cannibalization | -0.07 | Penalty. Semantic flux is real; two domains targeting the same query split rankings. |
| Production cost | -0.03 | Small thumb on scale. Penalty bites only when no public data sources exist. |

### Hard filters (run BEFORE scoring)

A topic is excluded entirely if any apply:

1. BenefitsUSA already has a top-20 ranking page for this exact query
2. Zero public data sources available for grounding
3. Bing monthly volume = 0 across all variants AND no fan-out value
4. Already in shipped queue
5. Topic requires medical/legal advice we can't responsibly give (patient safety filter)
6. SERP top-3 is YMYL-locked to .gov/.edu with no informational gap we can exploit

### Empirical refinement loop

After 50 articles ship and 30 days pass:

1. Pull citation count + traffic + conversions per article from Bing AI Performance, Bing Search Performance, GA4.
2. Compute Spearman ρ between predicted score and each outcome.
3. If any single input's ρ < 0.15, demote its weight by 30% and redistribute.
4. If above 0.6, promote.
5. Re-score remaining queue. Tunable in a Google Sheet's named cells.

---

## Production process: lighthouse + cluster

For each template, the production order is:

1. **Pillar guide** (lighthouse, 3,000–5,000 words, hand-curated, named author + reviewer)
2. **10–20 cluster pages** (programmatic via existing writer/verifier agents, refined per template)
3. **Internal linking pass** (anchor texts reflect real entity relationships)
4. **Spanish parallel** for the pillar and top 5 cluster pages
5. **Coordinated republish event** (NerdWallet-style annual refresh — all year-anchored pages updated in one wave)

### What changes in the writer agent

Existing Phase 2 writers don't enforce:

- `reviewedBy` + `lastReviewed` in JSON output
- Author byline + credential (currently no `author` field in our `MedicalWebPage` schema helper)
- Primary source linked inline in first paragraph (currently lives in `sources[]` footer only)
- Speakable schema on Quick Answer + FAQ

**Action:** Update `src/lib/structured-data.ts` to add `getMedicalWebPageSchema` overloads accepting `reviewedBy` + `author` + `lastReviewed`. Update writers' JSON schemas (in their `.md` prompts) to require author + reviewer + reviewed date fields. Update dynamic routes to render visible bylines.

### Freshness cadence

- **Annual coordinated republish** for year-anchored pages (state MA, FPL-anchored guides, OEP-anchored pages). Schedule one week in October before AEP.
- **Quarterly substantive refresh** on lighthouses (verify all 2026 data, add new sources, update internal links).
- **Monthly spot updates** when CMS/HHS/IRS publishes new data (Part D cap, FPL, premiums).

Critical: **never bump `dateModified` without substantive content change.** Microsoft and Lily Ray both flag this as an algorithm-update kill vector. Update the substance; the date follows.

---

## Schema upgrades needed (covered-usa repo)

Concrete code changes for the next sprint:

### 1. `src/lib/structured-data.ts`

```typescript
// Update MedicalWebPageSchemaProps to accept author + reviewer
interface MedicalWebPageSchemaProps {
  url: string;
  name: string;
  description: string;
  lastReviewed: string;
  lastUpdated?: string;        // NEW: separate from lastReviewed
  author: {                    // NEW: required
    name: string;
    jobTitle: string;
    credential?: string;
    url?: string;
  };
  reviewedBy?: {               // NEW: optional but high-value
    name: string;
    jobTitle: string;
    credential: string;
    url?: string;
  };
  about?: string;
  audience?: 'Patient' | 'PublicHealth' | 'Consumer';
  medicalSpecialty?: string;
}
```

### 2. Speakable schema helper

```typescript
export function getSpeakableSchema(url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SpeakableSpecification',
    cssSelector: ['.quick-answer', '.faq-question', '.faq-answer', 'h1', 'h2'],
  };
}
```

Already partially implemented but inconsistent — make it the standard on every page.

### 3. Visible byline component

New React component `<Byline>` at the top of every template page rendering:

> By Dr. [Name], [Credential]. Reviewed [date] by [Reviewer], [Credential].

This is the strongest trust signal we can add for almost no effort. Even if we use one reviewer name across many pages (with their permission), it clears the YMYL bar.

### 4. Inline primary-source linking

Update each template writer agent prompt to require:
> First paragraph MUST cite a primary source inline. Example: "According to CMS, the 2026 Part B deductible is $283." Not just a fact statement.

### 5. Atom/RSS feed for Microsoft Start application

Add `/feed.xml` listing all articles in publish order, full body, author, dateModified. Required for Microsoft Start Partner program application.

### 6. `/about` + `/authors/[name]` pages

Microsoft Start requires transparent ownership + named authors. Add `/about` describing CoveredUSA's editorial process, plus author pages with bio, credentials, contact. Even one author page is enough to apply.

---

## Quick wins to ship this week (each <30 min)

1. **Install Microsoft Clarity tracking script** on coveredusa.org. One JS tag, prod-only.
2. **Verify CoveredUSA in Bing Webmaster Tools** (already done per API test — confirm both domains show).
3. **Submit CoveredUSA to Bing News Pubhub.**
4. **Create Microsoft Advertising account** (free, no campaign). Run keyword-planner pass on the 7 template seeds.
5. **Set up Clarity MCP server** in Claude. `clone microsoft/clarity-mcp-server`, config in `~/.claude.json`.
6. **Add `dateModified` baseline** to every existing JSON file. Even a synced-once snapshot helps.
7. **Telegram alert on Bing crawl issues** via daily `GetCrawlIssues` cron.
8. **Take baseline screenshots** of the Bing AI Performance dashboard on both domains. Track weekly.

---

## First-batch picks

Once the data pipeline is wired and the scoring script runs, here's where I'd start. **None of these are final — they need to be scored first.** But based on competitor analysis + Bing demand signals already observed:

### Procedure costs — first lighthouse + 10 cluster pages

**Lighthouse pillar:** `/cost/medical-procedures-2026-pricing-guide` (3,500 words, "what determines medical procedure pricing, site-of-service spread, Medicare reimbursement math, how to negotiate, billing errors, charity care, your rights")

**Cluster pages (start with these 10):**
1. CT scan cost without insurance 2026
2. Colonoscopy cost 2026 (screening vs diagnostic distinction = high citation lure)
3. Mammogram cost 2026 (2D vs 3D)
4. Ultrasound cost 2026
5. Echocardiogram cost 2026
6. Emergency room visit cost 2026 (huge surprise-billing query)
7. Urgent care visit cost 2026
8. Physical therapy cost per session 2026
9. Hip replacement cost 2026 (commercial intent: medical-bill-analyzer funnel)
10. Knee replacement cost 2026

We already have MRI live. With pillar + 10 cluster + MRI = 12 procedure cost pages.

### Trigger events — first lighthouse + 8 cluster pages

**Lighthouse pillar:** `/event/health-insurance-life-events-2026` (master guide to qualifying life events triggering Special Enrollment Periods)

**Cluster pages:**
1. Just lost job, what to do for health insurance 2026 (already shipped, refresh as lighthouse)
2. Turning 26 health insurance options 2026 (already shipped)
3. Turning 65 Medicare sign-up 2026 (already shipped)
4. Just had a baby health insurance 2026
5. Just got married health insurance 2026
6. Just got divorced health insurance 2026
7. Moving states health insurance 2026
8. Just lost Medicaid coverage 2026 (timely — millions losing post-PHE coverage)

State + life-event combos are the long tail. "Turning 26 in California 2026" is wide open.

### Personas — first lighthouse + 5 cluster pages

**Lighthouse pillar:** `/for/non-traditional-workers-health-insurance-2026` (covers all 1099 + gig + freelance + part-time)

**Cluster pages:**
1. Health insurance for gig workers 2026 (already shipped, refresh)
2. Health insurance for self-employed 2026 (already shipped, refresh)
3. Health insurance for freelancers 2026
4. Health insurance for Uber/Lyft drivers 2026 (state splits possible)
5. Health insurance for DoorDash/Instacart workers 2026
6. Health insurance for small business owners 2026

State splits ("health insurance for gig workers in California 2026") are the long tail — second wave.

### What we're NOT writing in batch 1

- Drug costs head terms (Ozempic, insulin) — GoodRx + manufacturer entrenched
- Glossary head terms — Healthcare.gov entrenched
- Q&A head terms — Medicare.gov entrenched
- More state Medicare Advantage — Phase 3A already in motion, finish via existing bulkgen

---

## Implementation plan

### Week 1 (this week)

- [ ] Set up Microsoft Clarity (install JS tag + MCP server)
- [ ] Submit to Bing News Pubhub
- [ ] Create MS Advertising account
- [ ] Patch `src/lib/structured-data.ts` (author + reviewer + Speakable)
- [ ] Add `/about` and at least one `/authors/[name]` page
- [ ] Add `/feed.xml` Atom feed
- [ ] Apply to Microsoft Start Partner program
- [ ] Daily `GetCrawlIssues` cron → Telegram alert
- [ ] Daily `GetPageStats` + `GetQueryStats` snapshot into Supabase

### Week 2

- [ ] Write the topic-scoring script (Node.js + Google Sheet)
- [ ] Run scoring on 200 procedure-cost candidates → top 50
- [ ] Run scoring on 100 trigger-event candidates → top 30
- [ ] Run scoring on 100 persona candidates → top 30
- [ ] Update Phase 2 writer agents to enforce author/reviewer/inline-citation
- [ ] Add `<Byline>` React component, deploy site-wide

### Week 3–6

- [ ] Ship procedure-cost lighthouse guide (handwritten, ~8 hrs editorial)
- [ ] Run procedure-cost bulkgen on top 10 scored cluster topics
- [ ] Critic + verifier pass (existing pipeline)
- [ ] Ship trigger-event lighthouse + 8 cluster pages
- [ ] Ship persona lighthouse + 5 cluster pages
- [ ] Spanish parallels for all 3 lighthouses + top 5 cluster pages each

### Week 7+

- [ ] Empirical re-weighting based on 30-day citation + traffic data
- [ ] Second batch (next 50 scored topics)
- [ ] Annual coordinated republish (October, before AEP)

### Target by mid-August 2026

- 3 pillar guides shipped (procedure, trigger, persona)
- 30 cluster pages shipped in those 3 templates
- 50 MA state pages shipped (Phase 3A bulkgen)
- 10+ Spanish parallels
- Author byline + reviewer + inline-citation site-wide
- Bing AI Performance Report showing measurable citation pickup (>30/day)
- GA4 AI-referral segment showing real traffic from chat.openai.com + perplexity.ai + copilot.microsoft.com

---

## What we're explicitly NOT doing

These came up in research and were ruled out:

1. **No Phase 3B (state ACA marketplaces).** Competition entrenched (NerdWallet, healthinsurance.org), low commission ($50-$200 vs MA $300-$600), partial BenefitsUSA overlap. Skip as a track.
2. **No glossary head terms.** Healthcare.gov + carriers + Investopedia own them. Keep glossary template as internal-link nodes only.
3. **No Q&A head terms.** Medicare.gov + AARP own them. Same as above.
4. **No drug cost head terms.** GoodRx + manufacturer. Only second-tier + class queries.
5. **No "best of [our category]" listicles ranking ourselves #1.** Lily Ray's algorithm-update kill vector.
6. **No artificial `dateModified` bumps.** Real content updates only.
7. **No hidden prompt-injection summarize buttons.** Microsoft classified this as AI Recommendation Poisoning in Feb 2026.
8. **No Azure OpenAI switch from Anthropic.** Zero ranking benefit, confirmed myth.
9. **No buying Bing Ads for ranking.** Microsoft doesn't reward advertisers organically.
10. **No mass programmatic without pillar guides.** This is the pattern that gets deindexed during core updates.

---

## Open questions for Jacob

1. **Editorial bandwidth.** Lighthouse pages need ~8 hours of editorial work each (research + writing + review + Spanish + schema). Do we have the bandwidth, or do we hire one part-time content editor?
2. **Named author/reviewer.** Do we use Jacob's name + credential ("Jacob Posner, healthcare policy researcher") or do we partner with a licensed health insurance broker / licensed RN for the YMYL credibility? Even one reviewer name across many pages would clear the YMYL bar.
3. **Microsoft Start application.** Do you want to apply now, or wait until we have 50+ pages + author pages live? (My recommendation: wait, get to 50 pages first to look credible.)
4. **AI citation tracker budget.** Pick one of Otterly ($50/mo), Profound ($150/mo), or Peec? Or skip until we have data worth tracking? (Recommendation: skip until 30-day Bing AI Performance shows meaningful citations.)
5. **First batch sign-off.** The procedure / trigger / persona article picks listed above — any swaps, additions, removals before we score them and start writing?

---

## Sources

Backing reports in `specs/research/`:
- `bing-webmaster-api.md` — endpoint inventory, live API tests, recommended workflow
- `copilot-citation-mechanics.md` — 30-point optimization checklist + signal-by-signal evidence
- `competitor-landscape.md` — per-template scorecard, who to copy, what to skip
- `ai-seo-operator-playbooks.md` — NerdWallet/Vercel/Holland/Ray operator analysis + 2026 playbook
- `scoring-framework.md` — the weighted formula + AHP/TOPSIS comparison + empirical loop
- `bing-ai-tooling.md` — Microsoft Clarity, MS Advertising, MS Start, Copilot Studio

Combined: ~17,000 words of primary research with ~80 cited sources. Read them in full before any major divergence from this plan.
