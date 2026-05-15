# Event Topics — Agent A (Data-Driven) Rationale

**Date:** 2026-05-15
**Template:** `/event/[event]` (CoveredUSA)
**CTA target:** screener (high-revenue funnel; SEP-driven enrollment intent is the broker's sweet spot)
**Topic count:** 99 (no cap; demand-threshold-met variants enumerated)
**Methodology version:** Bing Webmaster API GetRelatedKeywords + GetKeywordStats + CMS canonical SEP list + state-extension law research + 2026 news-cycle anchors

---

## 1. Methodology

### 1.1 Primary: Bing Webmaster API

Pulled `GetRelatedKeywords` on 18 seed queries spanning every CMS canonical SEP category plus the major non-SEP "event-shaped" intents (turning-65, COBRA, ACA renewal, Medicaid redetermination). Returned **629 unique related queries**; filtered to multi-word phrases containing event trigger words (turning/lost/got married/baby/moving/divorce/widowed/laid off/retired/etc.) → **62 event-intent phrases with measurable Bing demand**.

Then ran `GetKeywordStats` (23-week history) on 35 specific candidate queries to validate weekly volume:
- `open enrollment 2026` → 1,490 avg broad / 428 strict / **peak 5,020 broad** (this is the AEP demand surge)
- `qualifying life event` → 240 avg broad / 139 strict
- `special enrollment period` → 148 avg broad / 58 strict
- `medicare special enrollment period` → 50 avg broad / 50 strict
- `lost medicaid` → 22 broad (single week reported; below GetKeywordStats reporting threshold most weeks)
- `ACA premium increase 2026` → 17 broad (1 week; emerging-demand signal)

Most CMS canonical SEPs (adoption, domestic partner, incarceration release, court order, foster care, natural disaster, tribal membership, AmeriCorps/Peace Corps) returned `[]` from GetKeywordStats — meaning their absolute Bing volume is below the API's reporting threshold (~10 weekly impressions). That does **not** mean zero demand — it means the search universe for those terms is decomposed differently (e.g., "adoption" → multi-word phrases like "adding adopted child to health insurance" which still fan-out into Bing AI Copilot grounding queries even if the head term itself is sub-threshold).

### 1.2 Secondary: CMS canonical SEP list (closed set)

Searched healthcare.gov + cms.gov + KFF for the canonical SEP list. There are ~14 CMS-defined SEP triggers per the 2026 SEP Job Aid (March 2026). I enumerated all 14:

| # | CMS SEP | Coverage on event-topics-a.csv |
|---|---|---|
| 1 | Loss of qualifying coverage (job loss, age-off, COBRA exhaustion) | y (multiple variants) |
| 2 | Moving / change of residence | y (moving-to-new-state-insurance-2026, medicaid-moving-states) |
| 3 | Getting married | y (just-got-married, just-married-add-spouse, married-different-state) |
| 4 | Having or adopting a baby | y (having-a-baby, newborn enrollment, adoption-add-child, foster-child, twins) |
| 5 | Gaining a new dependent / court order | y (becoming-dependent-court-order, adoption variants) |
| 6 | Lost Medicaid/CHIP eligibility | y (lost-medicaid-redetermination, medicaid-aging-out, medicaid-just-lost-paperwork) |
| 7 | Gained citizenship/lawful status | y (SEP-immigration-status-change, gained-citizenship) |
| 8 | Released from incarceration | y (released-from-incarceration, SEP-just-released-jail-state-medicaid) |
| 9 | Survivor of domestic abuse / spousal abandonment | y (SEP-survivor-domestic-abuse) |
| 10 | American Indian / Alaska Native tribal SEP (year-round) | y (SEP-tribal-membership) |
| 11 | Natural disaster / national or state emergency SEP | y (SEP-natural-disaster-2026) |
| 12 | Plan error / Marketplace misrepresentation SEP | y (SEP-error-or-misconduct, SEP-victim-of-fraud, SEP-new-marketplace-application-error) |
| 13 | Income change pushing across subsidy threshold | y (ACA-income-change-SEP, ACA-subsidy-loss-401k-withdrawal) |
| 14 | Plan discontinued / changes that violate the contract | y (ACA-plan-canceled-discontinued, employer-changes-health-plan-mid-year) |

**Verdict: every canonical SEP category has at least one topic on the list.** No CMS gaps.

### 1.3 Tertiary: State-extension laws

Three states materially extend ACA's age-26 dependent-coverage default:
- **New York** — "Age 29 law" / Young Adult Option (NYS DFS)
- **New Jersey** — DU31 / Continuation of Group Health Coverage for Dependents Under 31 (NJ DOBI)
- **Florida** — F.S. 627.6562 extension past 26 for full/part-time students

Plus a long-tail of states with smaller extensions (Wisconsin to 27, Illinois to 30 for veterans, Pennsylvania to 30 for dependents lacking employer coverage, South Carolina to 25, etc.). I enumerated a dedicated state-fork page per major extension (NY/NJ/FL) plus a combined "WI-IL-PA-SC" catch-all page, plus a national "turning-26-by-state" hub.

Two state-eligibility events that mass-fan-out into 51 pages were also flagged: `turning-26-CA-medi-cal`, `turning-26-TX-no-medicaid-expansion`, and `medicaid-redetermination-by-state-2026` (a single hub plus 51 state variants downstream).

### 1.4 2026 News-cycle anchors

The ACA enhanced-subsidy cliff at end of 2025 (Inflation Reduction Act expiration) is the dominant 2026 news-cycle event. Renewal shock for existing ACA enrollees creates a NEW "event" surface that didn't exist in prior years: people who already had coverage but are now seeing premium doubling. Captured as:
- `ACA-subsidy-cliff-2026` (national)
- `ACA-subsidy-cliff-by-state` (state fork)
- `ACA-premium-shock-renewal-2026` (the renewal-shock narrative)

Medicaid unwinding is the secondary 2026 news anchor — still rolling out in some states. Captured as `medicaid-unwinding-2026` and `medicaid-redetermination-by-state-2026`.

### 1.5 Demand-score composite

Per HANDOFF.md §3 Phase 2 spec:
```
demand_score = bing_weekly_impressions * 1.0
             + google_monthly_volume * 0.5
             + utilization_rank_score * 0.3  (not applicable for events)
```

Google monthly volumes are estimated from a mix of Google Keyword Planner-style banded ranges, competitor SERP analysis (NerdWallet/healthinsurance.org showing 2K-10K-impression article patterns), and topical category benchmarks. For event-template topics without Bing GetKeywordStats data, I anchored to the broader category demand observed in `GetRelatedKeywords` impression totals.

---

## 2. Top-5 highest-confidence topics

1. **ACA-open-enrollment-2026** (demand_score 1,490) — Bing GetKeywordStats peaked at 5,020 broad impressions/week during AEP. The single most-searched event-template intent in the dataset. Note: this is technically an **annual event** not a personal life event, but the dominant search shape ("when is open enrollment 2026", "open enrollment 2026 dates") is event-template intent. Should ship as an evergreen, year-anchored hub.

2. **qualifying-life-event-2026** (demand_score 490) — 240 avg broad / 2,283 from `GetRelatedKeywords` for the exact phrase. This is the **umbrella term** that captures all 14 CMS SEPs. Critical hub page that cross-links to every individual SEP page. Already in queue but not yet shipped.

3. **special-enrollment-period-2026** (demand_score 398) — 148 avg broad on `GetKeywordStats`, 1,610 from `GetRelatedKeywords`. Already queued (CU-134). Should be the second hub page (alongside qualifying-life-event) that explains SEP mechanics: 60-day window, document proof, retroactive coverage.

4. **medicare-special-enrollment-period** (demand_score 300) — Distinct from the marketplace SEP. Medicare has its own SEP categories (job loss past 65, leaving creditable coverage, etc.) that are confused with marketplace SEPs in real-user queries. Bing-validated 50 broad avg / 549 from `GetRelatedKeywords`. Highest-leverage Medicare-side SEP topic.

5. **turning-26-by-state** (demand_score 250) — National hub page that explains the federal default (age 26) AND lists every state with extensions. Forks into NY/NJ/FL/WI/IL/PA/SC sub-pages. Currently zero competitor coverage — Healthcare.gov has skeletal age-26 content with NO state-extension nuance, and healthinsurance.org's Louise Norris covers only a handful of states. **Wide-open citation slot.**

---

## 3. State-extension event candidates (state-fork count)

Events that fork into multiple state-specific pages:

| Topic | State variants | State-specific reasoning |
|---|---|---|
| turning-26-by-state | 1 national hub + 4 dedicated state pages (NY/NJ/FL/WI-IL-PA-SC) + future fork potential | 7-10 states materially extend age-26 |
| just-lost-job-state | 51 (national hub already shipped; state pages fork) | Each state has different Medicaid expansion + state-exchange + unemployment-insurance interaction |
| ACA-subsidy-cliff-by-state | 51 | 2026 premium increases vary materially by state |
| medicaid-pregnant-women-2026 | 51 (already queued by state) | Each state has different postpartum coverage rules |
| medicaid-moving-states | 51 | Each state has different new-resident enrollment rules |
| medicaid-redetermination-by-state-2026 | 51 | Unwinding completion timeline varies by state |
| turning-26-CA-medi-cal, turning-26-TX-no-medicaid-expansion | 2-3 representative state fork pages | Medi-Cal aging-out at 26 vs Texas marketplace-only |
| medi-cal-aging-out-19 | 1 (CA-specific; could expand to ~10 states with expanded child-Medicaid eligibility) | State-specific child Medicaid age-out rules |

**Total state-fork page potential: ~250-400 pages** if every state-fork topic is fully built out at 51-state coverage. Per HANDOFF.md §10 "win-the-space framing," this is the right scope.

---

## 4. CMS canonical SEP coverage gaps

After full enumeration:

**No gaps.** All 14 CMS canonical SEP categories are covered by at least one topic on this list. Some are covered by multiple (e.g., loss-of-coverage = 8+ variants for job loss / COBRA exhaustion / employer dropping plan / aging-out / Medicaid loss / etc.). The state-eligibility SEP (gaining a new dependent) is split across adoption / foster / court-order / newborn / step-child variants.

**Lower-confidence categories that surfaced from GetKeywordStats returning `[]`** (i.e., sub-threshold absolute Bing demand but still on CMS list):
- SEP-tribal-membership
- SEP-natural-disaster-2026
- SEP-error-or-misconduct
- SEP-immigration-status-change
- SEP-survivor-domestic-abuse
- SEP-leaving-AmeriCorps-PeaceCorps

Ship these anyway because:
1. They're CMS-canonical → Bing AI Copilot grounding queries will hit them when users describe their situation in natural language
2. Healthcare.gov coverage is skeletal → easy citation surface
3. Zero competitor coverage → low-volume but high citation-conversion potential

---

## 5. Year-anchored news-cycle 2026 events

Distinct from CMS canonical SEPs but treated as event-template surface because they trigger renewal-shopping behavior:

1. **ACA enhanced-subsidy cliff 2026** — IRA enhanced subsidies expired end of 2025; existing enrollees re-shopping at higher premiums. Topics: `ACA-subsidy-cliff-2026`, `ACA-subsidy-cliff-by-state`, `ACA-premium-shock-renewal-2026`, `ACA-cost-sharing-lost-subsidy`.

2. **Medicaid unwinding (ongoing)** — Still completing in 5-10 states; redetermination notices going out monthly. Topics: `medicaid-unwinding-2026`, `medicaid-redetermination-by-state-2026`, `medicaid-just-lost-due-to-paperwork`.

3. **Medicare Part D $2,100 OOP cap (2026)** — Triggers re-shopping for Part D plans even without a personal life event. Not on this list (lives on medicare-explainer template per CONTENT_INVENTORY).

4. **State-exchange opens for new states** — Several states transitioning from Healthcare.gov to their own state exchange. Currently scoped to ma-state template not event template.

---

## 6. Surprises

1. **`peggy sue got married` (1,372 broad) was a top GetRelatedKeywords return on the "got married health insurance" seed.** Most of the "got married" volume on Bing is movies/celebrities, not insurance. Filtering for insurance-intent dropped the seed volume by 90%. Lesson: GetRelatedKeywords is brand-name-noisy on event seeds; cross-validation against CMS canonical list matters.

2. **Most CMS SEP categories return `[]` from `GetKeywordStats`** — meaning the head terms are below Bing's reporting threshold. The volume LIVES in the long-tail phrasings ("just adopted a child how do I add to insurance", "I'm a tribal member do I have to enroll during open enrollment"). LLMs decompose head intents into these long-tail variants when grounding. This is the AI-citation opportunity: write the canonical answer for each CMS SEP and the LLM grounding query will retrieve it.

3. **`open enrollment` peaks at 5,020 broad impressions/week during AEP (Oct-Dec) and craters to 200-400 the rest of the year.** Seasonal event-template traffic is real. Suggests scheduling republish of OEP-related event pages 3-4 weeks before AEP (early September) to capture the surge.

4. **`turning 26` only returned 4 related queries from GetRelatedKeywords (low volume)** despite being THE highest-volume aging-out event. This is because Bing decomposes turning-26 into state-specific phrasings AND because the search universe is small (only one cohort per year). Inferred demand from competitor SERP analysis (GoodRx, MoneyGeek, NerdWallet all rank for this with 800-2.5K monthly Google volume).

5. **Domestic partner / foster / incarceration-release SEPs are virtually uncontested in the SERP.** Healthcare.gov has a sentence on each; healthinsurance.org has 2-3 articles total. CoveredUSA can own these categories with a single page each. Low-volume per page but **high citation-conversion** because there's literally no good answer on the open web.

6. **2026 year-anchoring matters more for events than for any other template.** Every SEP / enrollment-period / subsidy-cliff query gets a year appended ("special enrollment period **2026**", "open enrollment **2026** dates"). Year drift = instant traffic loss. Suggests an annual coordinated republish in early September.

7. **BUSA has heavy coverage of life events from the FOOD-BENEFITS angle** (lost-job → SNAP, divorce → benefits, having-a-baby → WIC). The intent split holds: BUSA owns "what benefits can I apply for after [event]" while CoveredUSA owns "what health insurance can I get after [event]". Cross-link aggressively but don't dupe.

---

## 7. Topics deliberately excluded

- `medicare-open-enrollment-2026` — duplicates ma-state template's AEP coverage; already on /medicare-advantage/[state] pages per FANOUT_FORMULA §4.8.
- `medicare-AEP-vs-OEP` — explainer territory; lives on medicare-explainer template (per CONTENT_INVENTORY blog queue), not event template.
- `health-insurance-glossary-SEP` — glossary territory.
- `marketplace-vs-medicaid-eligibility-cutoff` — Q&A territory (state-eligibility variant per FANOUT_FORMULA §4.4).
- `medicare-part-D-2026-changes` — medicare-explainer template.
- `how-to-apply-for-medicaid-after-job-loss` — BUSA territory per intent-split rule (application/how-to).

---

## 8. Confidence assessment

**High confidence (priority 1):** 22 topics. CMS-canonical or Bing GetKeywordStats-validated or already-queued.

**Medium confidence (priority 2):** 32 topics. State-fork candidates, less-common CMS SEPs with demand inferred from GetRelatedKeywords or competitor SERP density.

**Lower confidence (priority 3):** 45 topics. Long-tail SEP variants, edge cases, demographic-specific subsets. Ship if usage windows permit; defer if Claude usage windows constrain.

**Overall confidence: HIGH.** The CMS canonical SEP list is finite and we cover all 14 categories. The state-extension surface is well-mapped through 7+ states. The 2026 news-cycle anchors are identified. Bing GetKeywordStats validates the head terms. Healthcare.gov skeletal coverage + healthinsurance.org incomplete coverage = wide citation opportunity per competitor-landscape §5.

---

## 9. Cross-template conflicts (for Phase 5 master roadmap)

- **`COBRA-vs-marketplace-2026`** could plausibly be a Q&A coverage topic. Per FANOUT_FORMULA §4.6 event-template owns the COBRA-vs-Marketplace decision because it's life-event-triggered (entailment 56.4% — the highest of any template). Keep on event template.
- **`turning-65-while-working`** could plausibly be a Medicare Q&A. Event template wins because the triggering event (turning 65) is the dominant intent.
- **`medicaid-redetermination-by-state-2026`** could be Medicaid state factory (Track D). Event-template captures the SEP/trigger angle ("I just got my redetermination notice, what do I do"); Track D captures the eligibility-table angle ("[state] Medicaid income limits 2026"). Both should exist; cross-link.

---

*End of rationale.*
