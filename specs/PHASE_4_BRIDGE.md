# Phase 4 Bridge — AI Optimization Framework Build

**Last updated:** 2026-05-14
**Purpose:** Bridge doc for a fresh agent picking up after compaction. Self-contained — everything needed to continue is here.

---

## TL;DR — Where we are right now

Phase 2 (6 template tracks) and Phase 3A (state Medicare Advantage) are **fully shipped and live on coveredusa.org.** Phase 4 strategic planning is **complete** (the plan is in `specs/PHASE_4_PLAN.md` — a 3,000-word strategic doc with 9 specific lighthouse picks and a scoring framework). Author byline is **live everywhere** (Jacob Posner, Founder & Editor — visible byline + JSON-LD author on all 7 template types in EN+ES). Content inventory is **complete** (`specs/CONTENT_INVENTORY.md` covers all 20 template pages, 36 blog posts, 15 hardcoded pages, 420 SEO Ideas sheet rows). All shipped via `covered-usa@48c89ee` and `clawd-workspace@9b5b982`.

**The current question we're trying to answer next session:** how does Bing's grounding index and Microsoft Copilot's citation mechanism actually work at engineering precision, so we can reverse-engineer ALL our content (not just lighthouses) to match every element the algorithm rewards?

**What Jacob just did:** Ran the deep-research prompt I wrote (saved at `specs/research/grounding-mechanics-deep-research-prompt.md`) through TWO different deep-research tools (Google Deep Research + GPT Deep Research, or similar) to cover blind spots. He'll paste both reports into the next session.

**What the fresh agent does next:** Read this bridge doc, then both deep-research reports, then execute the next-session plan in Section 11 below.

---

## 1. Where the strategy landed (and why)

Six prior research threads (6 reports already saved in `specs/research/`) drove a strategic pivot:

**The core insight: citation distribution is power-law, not normal.**
- Microsoft's Bing AI Performance Report launch dataset: **5 pages drove 74.6% of all Copilot citations**, programmatic pages contributed only 4.8%.
- Search Influence's independent 20K-citation analysis: **1 URL captured 69%** of citations, top 4 captured 90%.
- Surfer SEO's 46M-citation healthcare breakdown: NIH (39%) + Healthline (15%) + Mayo (14.8%) + Cleveland Clinic (13.8%) = 5 domains own ~80%.

**Strategic translation:**
1. Stop spreading effort across 500 thin programmatic pages.
2. Build 5–10 deep "lighthouse" pages per template that win their query space (the citations).
3. Programmatic cluster pages still get built but their primary value is SEO traffic + supporting topical authority, not direct citations.
4. Lighthouse + cluster = the hub-and-spoke architecture that survives core updates (NerdWallet, Healthline, GoodRx all do this).

**Why Bing-first:**
- 87% of SearchGPT (ChatGPT Search) citations match Bing top-organic results (Seer Interactive).
- Microsoft Copilot grounds directly in Bing.
- Optimizing for Bing = 3 surfaces at once (Bing organic + Copilot + ChatGPT Search). Google effort = Google only.

**Templates re-ranked by competitive leverage** (from the competitor landscape research):
- **HIGH leverage:** Procedure costs, trigger events, personas
- **MEDIUM:** State Medicare Advantage (Phase 3A shipped), drug long-tail
- **LOW (skip head terms):** Glossary, Q&A — Healthcare.gov + Medicare.gov + AARP entrenched

---

## 2. The 9 lighthouse picks (already decided, build order set)

From `PHASE_4_PLAN.md` Appendix A. Each lighthouse anchors its template's cluster pages.

| # | Build order | URL | Type | Why this slot |
|---|---|---|---|---|
| 1 | First | `/qa/aca-subsidy-eligibility-2026` | Year-anchored definitional | Most timely. ACA subsidy cliff is BACK for 2026 — unclaimed slot, fresh data window |
| 2 | Second | `/event/2026-open-enrollment-deadlines` | Year-anchored how-to | Must be live by Oct 15 for AEP |
| 3 | Third | `/event/medicare-aep-2026` | Year-anchored how-to | Same Oct 15 urgency |
| 4 | Fourth | `/cost/all-procedures-2026` | Year-anchored numeric reference | Anchors highest-leverage template (procedures) |
| 5 | Fifth | `/medicare-advantage-state-comparison-2026` | Year-anchored numeric reference | Anchors the 50 MA state pages |
| 6 | Sixth | `/glossary/health-insurance-terms-explained` | Definitional A-Z hub | Easy win, supports internal linking |
| 7 | Seventh | `/qa/medicaid-eligibility-2026` | Year-anchored definitional | Federal-rule lens (carefully avoids BenefitsUSA overlap) |
| 8 | Eighth | `/qa/does-medicare-cover-hub-2026` | Comparison/decision guide | Challenger play vs Medicare.gov |
| 9 | Ninth | `/drug/medicare-part-d-2026-formulary-guide` | Year-anchored definitional | After we've validated the pattern works |

**Personas gets ZERO lighthouses.** They're intent-specific; don't accumulate head-query citation power. Build the cluster well only.

**Maintenance reality:** ~4 hours per lighthouse per month = ~36 hours/month for the 9-lighthouse layer. Annual coordinated republish (NerdWallet pattern) for year-anchored ones.

---

## 3. What we already shipped this session

**Author byline (live everywhere):**
- `src/lib/structured-data.ts` now exports `COVEREDUSA_AUTHOR` constant: `{name: 'Jacob Posner', jobTitle: 'Founder & Editor', url: '/en/about'}`.
- `getMedicalWebPageSchema` extended to accept `author`, `reviewedBy`, `datePublished`, `dateModified` fields.
- All 7 template routes (`cost`, `drug`, `qa`, `glossary`, `event`, `for`, `medicare-advantage`) pass `COVEREDUSA_AUTHOR` to schema.
- Visible byline "By Jacob Posner, Founder & Editor" / "Por Jacob Posner, Fundador y Editor" renders on every template page in both locales.
- Blog page unified to same "Founder & Editor" job title.
- Verified end-to-end: TypeScript clean, `npx next build` exit 0, JSON-LD confirmed in built HTML for all 7 templates.

**Content inventory:**
- New re-runnable script: `scripts/coveredusa-content-inventory.js` (in clawd-workspace repo)
- Output: `specs/CONTENT_INVENTORY.md`
- Captures: 20 live template pages, 36 blog posts, 15 hardcoded pages, 420 SEO Ideas sheet rows
- 220 sheet rows still "unclassified" by the heuristic — mostly the medical-bill-analyzer content cluster that doesn't fit our current 7 templates (potentially a NEW template track or just blog-post fodder)

**Bing Webmaster API:**
- API key stored at `.secrets/bing-webmaster-api-key.txt`
- Verified working on both BenefitsUSA + CoveredUSA
- Three killer endpoints documented: `GetKeywordStats`, `GetRelatedKeywords`, `GetQueryStats`

**Both repos pushed:**
- `covered-usa@48c89ee` — research docs + plan + inventory + author byline
- `clawd-workspace@9b5b982` — inventory script

---

## 4. The big strategic insight Jacob articulated for next session

This is the framing he wants the next session to build on:

> **Instead of writing content that "answers the query," we need to write content that is "food for the LLM."**
>
> When a user asks Copilot a question, Bing's grounding index doesn't search for "one perfect answer." It runs **query fan-out** — decomposing the user prompt into 8–12 sub-queries — then retrieves chunks (passages) from the web that match each sub-query. The LLM then synthesizes an answer using those chunks and cites the URLs they came from.
>
> So: for any target query, we need to predict what sub-queries Bing would generate, then engineer our article to contain matching, **extractable, standalone chunks** that cover the full fan-out set.

This is the operational frame for everything next session. Our existing articles probably do some of this already, but we haven't engineered it consciously. The deep-research reports should give us the algorithm-level precision to do it consciously.

---

## 5. The Google Search Console indexing email

Jacob received an email this morning from Google Search Console saying some CoveredUSA content is **not being indexed by Google.** Specific URL list is in his GSC dashboard.

**This is a clue we should investigate early in next session because:**
- Google indexing failures often share root causes with Bing indexing failures (canonical issues, robots.txt blocks, sitemap omissions, noindex headers, etc.)
- If Bing has the same issue, it's blocking AI citation eligibility (URL accessibility is Cyrus Shepard's #1 ranked factor at 9.5/10)
- Even if Bing is fine, fixing Google issues prevents a separate downstream problem

**Action for next session:** Pull the GSC report, identify the unindexed URLs, diagnose the root cause (likely candidates: parameter URL clutter, soft 404s on dynamic routes with missing data, canonical chain issues, the `.tmp.json` files in content/data leaking into sitemap, or accidental noindex on some template type). Cross-check Bing Webmaster Tools `GetCrawlIssues` endpoint for parallel diagnosis.

---

## 6. Two deep-research reports Jacob is about to paste

Jacob ran the prompt at `specs/research/grounding-mechanics-deep-research-prompt.md` through two different deep-research tools (likely Google Deep Research + GPT Deep Research, or similar). He's going to paste both into the next session.

**What both should cover (per the prompt):**
1. Bing grounding index mechanics (retrieval pipeline, embedding model, chunking, reranker, chunk scoring formula)
2. Query fan-out mechanism (architectural location, sub-query types, predictability)
3. Freshness + evaporation mechanism (decay curve, signals, semantic drift vs factual currency)
4. Microsoft Copilot Health YMYL filters
5. Cross-engine alignment (Bing → Copilot → ChatGPT Search → Claude.ai → Perplexity)
6. Per-page engineering checklist (80–120 items, each with WHAT/WHY/HOW/IMPACT)
7. Three worked examples reverse-engineering `/cost/mri`, `/medicare-advantage/california`, `/for/gig-workers`
8. Open questions / what would need live experimentation

**Why two reports:** Coverage of blind spots. Each tool has different source biases. Cross-referencing both will surface higher-confidence findings (when they converge) and flag gaps (when they don't).

**Save the merged synthesis to:** `specs/research/grounding-mechanics-reverse-engineering.md`

---

## 7. The full session plan for what we're about to do

Order of operations once the fresh agent has read both reports:

### Step A — Read + cross-reference both deep-research reports
- Identify convergence (high-confidence findings, both reports agree)
- Identify divergence (gaps where they disagree — flag for further investigation)
- Identify gaps (questions one report didn't address)

### Step B — Investigate the Google Search Console indexing issue
- Pull GSC unindexed URLs list (Jacob will provide)
- Run `GetCrawlIssues` on both sites via Bing Webmaster API
- Diagnose root cause
- Fix if a quick win

### Step C — Build the AI optimization framework doc
- New file: `specs/AI_OPTIMIZATION_FRAMEWORK.md`
- Distills the deep-research findings into a single operational reference
- Sections:
  1. How Bing/Copilot citation actually works (mechanism)
  2. The per-page engineering checklist (80–120 items adapted to our stack)
  3. The chunk-design rules (how every paragraph should be structured)
  4. The schema requirements per template type
  5. The freshness signal stack + maintenance cadence per template
  6. The internal linking architecture (hub/cluster/lighthouse)
  7. The reverse-engineering protocol for any new page ("for query X, fan out the sub-queries, then engineer chunks to match")
- This is the **rubric we engineer every future page against.**

### Step D — Audit + backfill existing content against the framework
- Score the 20 template pages + 36 blog posts against the new checklist
- Identify highest-impact fixes (page-by-page)
- Update writer agents (`coveredusa-*-writer.md`) to enforce framework requirements at generation time
- Update validators (`scripts/validate-*.js`) to fail the build on missing critical elements
- Update `src/lib/structured-data.ts` with any missing schema helpers (Dataset schema, Speakable refinements, etc.)
- Update the `<Byline>` and dynamic route templates with any required visible elements

### Step E — Decide on new content types
- The 220 "unclassified" sheet rows (medical-bill-analyzer cluster) — promote to a new template track, or leave as blog posts?
- Any new lighthouse types the framework surfaces?
- Any new programmatic templates the framework suggests we're missing?

### Step F — Build the first lighthouse
- Start with `/qa/aca-subsidy-eligibility-2026` (lighthouse #1, most timely)
- Use the framework checklist as the rubric
- Hand-curated, ~2,500–3,500 words, named author, primary-source inline citations, full schema graph, IndexNow ping on publish

### Step G — Verify + commit
- Build green, JSON-LD valid, all framework checklist items pass
- Commit + push both repos
- Document what we learned for the next 8 lighthouses

---

## 8. Open strategic questions Jacob raised for the framework

These need answers in the framework doc:

1. **URL strategy for year-anchored pages.** Stable URL (`/cost/mri`) with content updates, or year-anchored URL (`/cost/mri-2026`) that gets retired each year? The freshness research has implications either way — semantic drift vs factual currency.

2. **Internal linking architecture.** When we have 9 lighthouses + 200 cluster pages, how should they link to each other? Specifically:
   - Lighthouse → cluster (down): How many anchor links? What anchor text patterns?
   - Cluster → lighthouse (up): One canonical link in body, or breadcrumb-style hub link?
   - Cluster → cluster (across): When is this beneficial vs cannibalizing?
   - Lighthouse → external high-authority (.gov, KFF, primary sources): Citation density per chunk?

3. **Update / freshness cadence per page type.** Lighthouse, cluster, blog, reference hub all decay differently. What's the operational rule per type?

4. **Year anchors in titles.** Jacob noticed "2026" in titles seems to help. Confirm with deep-research findings. If so, codify the rule: every year-anchored page should have year in title, H1, URL, meta description, first paragraph, schema.

5. **Hub page strategy.** If we have a lighthouse `/cost/all-procedures-2026`, should there ALSO be a hub at `/cost/` that links to every cluster + the lighthouse? Or does the lighthouse serve as the hub?

6. **Spanish parallels — when to invest.** Every page or just lighthouses? Most healthcare-Spanish search demand is sizable but our current Spanish content is auto-generated; quality may be insufficient for AI citation eligibility.

7. **The medical-bill-analyzer content cluster.** 220 unclassified sheet rows, ~100 of which are about hospital chargemaster, dispute letters, charity care, etc. New template track? Lighthouse + blog cluster? Tied to the existing `/medical-bill-analyzer` tool page?

---

## 9. Important files + outputs from this session

**Strategic + planning:**
- `specs/PHASE_4_PLAN.md` — the 3,000-word Phase 4 plan + 9-lighthouse picks (Appendix A)
- `specs/PHASE_3_CONTEXT.md` — prior bridge doc, still useful for state Medicare Advantage context
- `specs/CONTENT_INVENTORY.md` — full inventory of every URL + every queued sheet row

**Research (6 prior reports + 1 prompt for the deep-research run):**
- `specs/research/bing-webmaster-api.md` — Bing Webmaster API endpoint inventory + live API tests with our key
- `specs/research/copilot-citation-mechanics.md` — 30-point optimization checklist + signal-by-signal evidence
- `specs/research/competitor-landscape.md` — per-template competitor scorecard (procedures + events + personas = HIGH leverage; glossary + Q&A = LOW)
- `specs/research/ai-seo-operator-playbooks.md` — NerdWallet/Vercel/Andrew Holland/Lily Ray operator analysis
- `specs/research/scoring-framework.md` — weighted-sum scoring formula proposal
- `specs/research/bing-ai-tooling.md` — Microsoft Clarity + MS Advertising + MS Start + Copilot Studio inventory
- `specs/research/lighthouse-pattern-deep-dive.md` — 6,400-word lighthouse pattern analysis + 10 reverse-engineered lighthouse pages + the 9 picks for CoveredUSA
- `specs/research/grounding-mechanics-deep-research-prompt.md` — the deep-research prompt Jacob ran on two different tools

**Code that matters:**
- `src/lib/structured-data.ts` — schema helpers (MedicalWebPage, FAQPage, BreadcrumbList, MedicalProcedure, Drug, DefinedTerm, QAPage, HowTo, Speakable, **COVEREDUSA_AUTHOR**)
- `src/lib/{procedures,drugs,qa,glossary,events,personas,medicare-advantage}.ts` — loaders for the 7 templates
- `src/app/[locale]/{cost,drug,qa,glossary,event,for,medicare-advantage}/[slug]/page.tsx` — 7 dynamic routes
- `scripts/validate-{procedures,drugs,qa,glossary,events,personas,medicare-advantage}.js` — 7 validators wired into prebuild
- `.claude/agents/coveredusa-{procedures,drugs,qa,glossary,events,personas,medicare-advantage}-{writer,verifier}.md` — 14 writer + verifier agents
- `scripts/coveredusa-content-inventory.js` — re-runnable inventory script

**Both repos pushed:**
- `covered-usa@48c89ee` (https://github.com/JPonskis/covered-usa.git)
- `clawd-workspace@9b5b982` (https://github.com/JPonskis/clawd-workspace.git)

**Live URLs to spot-check:**
- https://coveredusa.org/en/cost/mri (procedure cost gold standard)
- https://coveredusa.org/en/medicare-advantage/california (state MA gold standard)
- https://coveredusa.org/en/for/gig-workers (persona gold standard)
- All 7 templates × ~3 slugs each = ~20 template pages live; all in EN+ES

---

## 10. Data + tools available

**Bing Webmaster API:** key at `.secrets/bing-webmaster-api-key.txt`. Both BenefitsUSA + CoveredUSA verified. Use `GetKeywordStats` + `GetRelatedKeywords` + `GetQueryStats` + `GetCrawlIssues`.

**Bing AI Performance Report:** in Bing Webmaster Tools UI (no API yet). Shows Copilot citation counts + grounding queries per URL. Manual download until API ships. Already pulled for BenefitsUSA (the CSV Jacob shared earlier). CoveredUSA is too new to have meaningful data yet.

**Google Search Console:** Jacob has access. New indexing issue just surfaced (Section 5 above).

**Google service account for Sheets API:** at `.secrets/google-service-account.json`. Used by the inventory script + the SEO article pipeline.

**Microsoft Clarity:** not yet installed on CoveredUSA. Quick win listed in PHASE_4_PLAN.md week-1 todo.

**Microsoft Advertising Keyword Planner:** free Bing-specific keyword volume. Account not yet created.

**Anthropic Claude API:** for all writer/verifier agents. Already integrated via ClaudeClaw on the Mac mini.

---

## 11. The concrete next-session checklist (do this in order)

Once the fresh agent has read this bridge doc + both deep-research reports:

1. **Cross-reference the two deep-research reports.** Identify convergence, divergence, gaps. Output a one-line summary of high-confidence findings.

2. **Investigate the Google Search Console indexing issue.** Pull the URL list from Jacob. Run `GetCrawlIssues` via Bing Webmaster API. Diagnose root cause. Fix if quick.

3. **Build `specs/AI_OPTIMIZATION_FRAMEWORK.md`** — the operational framework doc. Includes the per-page engineering checklist (80–120 items), the chunk-design rules, the schema requirements per template type, the freshness signal stack, the internal linking architecture, and the reverse-engineering protocol ("for query X, predict the sub-queries, then engineer chunks").

4. **Audit existing content against the framework.** Score the 3 gold-standard pages (`/cost/mri`, `/medicare-advantage/california`, `/for/gig-workers`) and identify top fixes.

5. **Update infrastructure to enforce the framework:**
   - Writer agents (`coveredusa-*-writer.md`) — enforce checklist items at generation time
   - Validators (`scripts/validate-*.js`) — fail build on missing critical elements
   - `src/lib/structured-data.ts` — add any missing schema helpers (Dataset, refined Speakable, etc.)
   - Dynamic route templates — add any missing visible elements

6. **Decide on the 220 unclassified content cluster** (medical-bill-analyzer territory). New template, lighthouse + blog, or stay as blog?

7. **Build lighthouse #1: `/qa/aca-subsidy-eligibility-2026`.** Hand-curated. ~2,500–3,500 words. Use the framework checklist as the rubric. Named author (Jacob Posner, Founder & Editor). Primary-source inline citations. Full schema graph. IndexNow ping on publish.

8. **Verify + commit.** Build green, JSON-LD valid, all framework checklist items pass.

9. **Spec-out lighthouses #2–9** with the framework as the rubric. Don't build all 9 in this session; spec them for the next-next session.

10. **Update `PHASE_4_PLAN.md`** with what we learned + any framework-driven changes.

**Estimated time:** 4–6 hours, mostly hands-on once the framework is built. The framework is the longest part (~1.5 hours of synthesis writing).

---

## 12. Strategic context that needs to persist

These are the things that should stay top-of-mind across sessions:

- **Bing-first, not Google-first.** Optimizing for Bing = winning Bing + Copilot + ChatGPT Search simultaneously. Most operators ignore Bing; we exploit that.
- **Lighthouse + cluster, not pure programmatic.** Programmatic alone gets deindexed in core updates. Pillar/lighthouse provides topical authority cover.
- **Power-law citation distribution.** 5 pages = 74.6% of citations. Don't spread effort; concentrate it.
- **Passage-level grounding.** Bing selects chunks, not URLs. Every paragraph should be self-contained + extractable.
- **Evaporation is fast.** 97% citation drop in 60 days for unmaintained content. Maintenance is a continuous obligation, not a one-time publish.
- **YMYL trust matters more for healthcare than for any other vertical.** Named author + reviewer + inline primary-source citations are non-negotiable.
- **BenefitsUSA territorial split.** BenefitsUSA owns eligibility/government programs (Medicaid, SNAP, ACA eligibility). CoveredUSA owns healthcare navigation/care+cost. Don't cannibalize.
- **Microsoft Copilot Health has an explicit named allow-list** (Harvard, JAMA, NAM, Mayo, Cleveland, Kaiser). We can't enter directly; compete in adjacent territory.
- **Author is Jacob Posner, Founder & Editor.** Reviewer slot is open — when Jacob sources a credentialed health insurance broker, we add `reviewedBy` via the `MedicalAuthor` interface in structured-data.ts.

---

## 13. What we explicitly decided NOT to do (and why)

- **Skip Phase 3B (state ACA marketplaces).** Competition entrenched (NerdWallet, healthinsurance.org), lower commission, partial BenefitsUSA overlap.
- **Skip glossary head terms as growth bets.** Healthcare.gov + carriers + Investopedia entrenched. Keep glossary template as internal-link nodes only.
- **Skip Q&A head terms** ("does Medicare cover dental"). Medicare.gov + AARP own them. Long-tail (state + program + year) is fair game.
- **Skip drug cost head terms** (Ozempic, insulin). GoodRx + manufacturer entrenched. Second-tier drugs + class/policy queries are fair game.
- **No "best of [our category]" listicles ranking ourselves #1.** Lily Ray's algorithm-update kill vector.
- **No artificial `dateModified` bumps.** Real content updates only — chunk-level diff is what Bing detects.
- **No hidden prompt-injection summarize buttons.** Microsoft classified this as AI Recommendation Poisoning in Feb 2026.
- **No mass programmatic without pillar guides.** This is the pattern that gets deindexed during core updates.

---

## 14. The file the fresh agent reads after this one

`specs/research/grounding-mechanics-deep-research-prompt.md` is the prompt; the actual reports are coming from Jacob. Save them merged to `specs/research/grounding-mechanics-reverse-engineering.md`.

Then build `specs/AI_OPTIMIZATION_FRAMEWORK.md` (new file, distilled actionable framework).

Then go do the work in Section 11.

---

*This doc is the bridge. After compaction, the fresh agent reads this doc + the two deep-research reports Jacob will paste, then executes Section 11. Everything needed to continue is here.*
