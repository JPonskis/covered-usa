# Glossary Topics — Agent B (Coverage + Intuition) Rationale

**Date:** 2026-05-15
**Template:** `/glossary/[term]` (per FANOUT_FORMULA §4.5)
**Agent:** B (coverage breadth, competitor enumeration, intuition — paired with Agent A's Bing-API data work)
**Total topics proposed:** 50 (at hard cap)

---

## TL;DR

Glossary is the LOW-leverage template per competitor-landscape §4. Healthcare.gov + carrier glossaries + Investopedia + GoodRx own every head term. **Primary value of this template = internal-link target + 2-hop comparison pages**, not direct head-term citation. The selection below applies that lens ruthlessly.

50 terms passed the filter from a ~150-term canonical universe. Selection criteria, in order:
1. **Internal-link hit rate** ≥50 mentions across CoveredUSA content (measured via grep — see §4 below).
2. **2-hop comparison opportunity** (term pairs naturally with another → comparison page).
3. **State-data anchor** (term needs a stateful table that other templates can reuse).
4. **2026-year-anchor hook** (regulatory change makes the term newly citation-relevant).

Anything failing all four was dropped.

---

## Universe ceiling: Healthcare.gov canonical glossary

Healthcare.gov runs ~150 terms covering: ACA / Marketplace concepts; plan-type acronyms (HMO/PPO/EPO/POS); cost-sharing terms (deductible/copay/coinsurance/OOP); Medicare program parts; Medicaid eligibility concepts; tax-treatment terms (PTC/CSR/HSA/FSA/HRA); enrollment-period terms (OEP/SEP/AEP/IEP/GEP); billing/insurer-process terms (formulary/EOB/prior-auth/balance billing/allowed amount); consumer-protection terms (NSA/GFE/guaranteed issue/grandfathered/preventive care); subsidy + safety-net terms (Extra Help/LIS/dual-eligible/SNP variants).

Plus: carrier glossaries (UHC/Cigna/Aetna/Anthem/Kaiser) overlap ~90% with Healthcare.gov. GoodRx + Healthline + eHealth expand each term into 1,500–2,500-word standalone explainers — but FANOUT §4.5 explicitly says **don't do that**. Glossary pages ≤500 words.

WebFetch of healthcare.gov/glossary timed out twice; sitemap signal is well-documented in competitor-landscape.md §4 — relied on that instead of re-scraping.

---

## Filter rationale: 150 → 50

### Cut category A: head-term saturation (~60 terms cut)
Terms where Healthcare.gov ranks #1 + carriers occupy #2-10 + Investopedia/GoodRx/Healthline have long-form explainers. Examples: "premium" (Bing won't cite us over Cigna), "claim", "beneficiary", "dependent", "preauthorization" (we keep prior-authorization), "primary care provider", "specialist", "appeal", "grievance", "EHB" (essential health benefits — we touched on metal-tier instead), "lifetime maximum" (mostly historical post-ACA). These terms have demand but zero competitive opening + no anchor value our other templates need.

### Cut category B: too-niche-to-bother (~30 terms cut)
Terms with low internal-link hit rate AND zero standalone search demand AND no 2-hop opportunity. Examples: "actuarial value", "rider", "skilled nursing facility care" (own glossary entry vs. fold into Medicare-Part-A page), "DME", "TRICARE", "VHA", "FEHB", "midlevel provider", "habilitative services", "non-grandfathered plan", "external review", "minimum essential coverage". Mostly insurance-industry jargon civilians never type into Bing.

### Cut category C: BUSA overlap exists (~10 terms cut)
Glanced at busa-inventory.csv — BUSA's blog has thin glossary-style overlap (no `/glossary/` template). Notably BUSA touches: "premium tax credit vs cost-sharing reduction" (1 BUSA blog), "what is SSDI", "SSI vs SSDI". For glossary template these are flagged `slight` not `heavy` — BUSA's intent is application/walkthrough, CoveredUSA's is definitional. Both can coexist. Zero `heavy` overlap found.

### What survived (50 terms)
**Already queued (10):** deductible, copay, coinsurance, magi, premium-tax-credit, special-enrollment-period, explanation-of-benefits, prior-authorization, hdhp, balance-billing. All listed with `already_queued=y` in CSV sources column. Phase 4 merge should NOT re-create. Note: 3 already live (deductible, magi, oop-max) excluded from this list per cross-reference rules.

**Net new (40):** the 40 below are net additions to the queue.

---

## §4 — Internal-link hit-rate analysis (the highest-signal input)

Ran `grep -roih` across `/projects/covered-usa/content/` for every candidate term. Sorted by mention count. This is the proprietary signal: **terms that get referenced 100+ times across our existing 91 pages have demonstrable link-target value, regardless of head-term search volume.**

Top hits (raw counts; case-insensitive):

| Term | Hits | Status |
|---|---:|---|
| FPL / federal poverty level | 2,038 | hub exists; glossary entry as anchor |
| Medicare Advantage | 1,493 | already an MA template; glossary supports |
| premium | 1,083 | head-term saturated; skip standalone |
| MAGI | 1,003 | already live |
| Part D | 594 | new entry |
| Part B | 541 | new entry |
| HSA | 488 | new entry |
| premium tax credit | 448 | already queued |
| Medigap | 380 | new entry |
| EPO | 378 | new entry (low-search, high-internal) |
| HMO | 310 | new entry |
| copay | 256 | already queued |
| out-of-pocket | 235 | already live (oop-max) |
| special enrollment | 382 (combined) | already queued |
| PPO | 218 | new entry |
| cost-sharing | 214 | new entry |
| catastrophic | 208 | new entry |
| D-SNP | 205 | new entry |
| in-network | 182 | new entry |
| HDHP | 176 | already queued |
| coinsurance | 175 | already queued |
| open enrollment (case combined) | 277 | already queued |
| household size | 271 | new entry |
| GFE / good faith estimate | 184 | new entry |
| Medicaid expansion | 182 | new entry |
| AEP | 152 | new entry |
| Extra Help / LIS | 158 | new entry |
| OEP | 120 | (folded into open-enrollment) |
| CSR / cost-sharing reduction | 217 (combined) | new entry |
| subsidy cliff | 125 | new entry |
| MOOP | 100 | new entry |
| Star Rating | 165 | new entry |
| C-SNP | 82 | new entry |
| in-network | 182 | new entry |
| formulary | 80 | new entry |
| coverage gap | 79 | new entry |
| qualifying life event | 85 | new entry |
| IEP | 78 | new entry |
| short-term | 64 | new entry |

**The link-target hit rate is what justifies most of this list.** Without it, half these terms would fail the FANOUT-§4.5 "is this worth a glossary page" test. With it, they're proven internal anchors.

---

## §5 — 2-hop comparison opportunities (HIGH-VALUE tier)

Per competitor-landscape.md §4: "Real money in this template is the 2-hop pages — `out-of-pocket maximum vs deductible 2026`, `coinsurance calculator example`, `MOOP for family plans` — where GoodRx and Healthline have partial coverage but not complete coverage."

These 50 terms cluster into 8 comparison constellations. The terms are the nodes; the comparison pages are the edges (lighthouse/cluster pages in a separate template, but glossary entries serve as anchors).

1. **Cost-sharing trio:** deductible × copay × coinsurance × OOP max. Comparison page: "Deductible vs copay vs coinsurance vs OOP max: how they stack 2026."
2. **HSA family:** HSA × FSA × HRA × HDHP. Comparison pages: HSA vs FSA, HSA + HDHP eligibility math, ICHRA vs traditional HRA.
3. **Network type quad:** HMO × PPO × EPO × POS. Comparison: 4-way network comparison + when each makes sense.
4. **Metal tier ladder:** metal-tier glossary entry anchors Bronze vs Silver vs Gold vs Platinum cost-sharing comparison.
5. **Enrollment periods:** OEP × AEP × IEP × GEP × SEP. Multiple 2-hop pairs (OEP vs AEP, AEP vs MAEP, SEP vs QLE).
6. **Medicare structure:** Part A × B × C × D × Medigap. Multiple pairs (Medicare Advantage vs Medigap, Original Medicare vs MA).
7. **ACA subsidies:** PTC × CSR × subsidy cliff × FPL × MAGI. CSR-only-on-Silver math is the centerpiece.
8. **Safety net Medicare:** Extra Help × LIS × dual-eligible × D-SNP × C-SNP × I-SNP. SNP-variant comparison.

CSV `topic_type` column tags these as `2-hop-comparison`. 15 of 50 entries.

---

## §6 — Pure internal-link-target tier (SMALL pages only — ≤500 words)

35 of 50 entries are pure link-target plays. These get short, structured glossary pages whose value is being the canonical CoveredUSA `/glossary/[term]` URL that every relevant procedure/drug/persona/event/qa article links to. Bing won't cite them over Healthcare.gov for the head term — that's fine. They earn their keep through internal PageRank flow and being the trusted definition our other pages reference.

Examples: EOB (only 17 internal hits but every bill-analyzer page references), formulary (80 hits, drug pages anchor), allowed-amount (low volume but bill-analyzer essential), guaranteed-issue (conceptual core of ACA pages), Q-H-P (niche but the marketplace lighthouse references).

**Hard discipline:** these are ≤500 words. Definition + 1 worked example + 1 lookup table + cross-link block. Per FANOUT §4.5.

---

## §7 — State-data anchor terms (overlap with reference-hub)

Three glossary terms anchor stateful data tables:
1. **federal-poverty-level** — already has `/federal-poverty-level` reference hub. Glossary entry should be the *definitional* version; the hub is the lookup version. Coordinate to avoid duplication.
2. **medicaid-expansion** — flagged `state_specific=y`. 41 expansion states + 10 holdouts. Glossary entry stays national; the state-fork lives in `/medicaid-income-limits/[state]` (Track D factory per HANDOFF §3 Phase 5).
3. **household-size** — definitional anchor for every income-table page. Doesn't fork by state but feeds state-page table rows.

---

## §8 — 2026-year-anchor hooks (timely citation opportunities)

Year markers per FANOUT §2 universal rule #4: every numeric callout pinned to 2026 + 2027. These terms have a **2026 regulatory or numeric change** that gives them fresh-content advantage over the entrenched Healthcare.gov page:

1. **premium-tax-credit** — Enhanced PTC EXPIRED Jan 1, 2026. Subsidy cliff at 400% FPL is back. Healthcare.gov + IRS have stale 2025-era text in many places. Win opportunity.
2. **subsidy-cliff** — same hook, dedicated page.
3. **hdhp** — 2026 IRS minimums $1,650 self / $3,300 family. New numbers every year.
4. **medicare-part-d** — 2026 OOP cap $2,100 (IRA capped at $2,000 in 2025, indexed up). Coverage-gap structure permanently closed.
5. **coverage-gap** — narrate the IRA-driven structural change. Most existing pages haven't updated.
6. **prior-authorization** — CMS Interoperability + PA Final Rule starts 2026. Healthcare.gov definition is stale.
7. **short-term-health-insurance** — 2024 final rule limits to 4 months. Many third-party pages still say 12 months.
8. **moop** — 2026 MA MOOP cap $9,250 in-network.

These eight are the highest-confidence Bing-citation candidates *despite* the WEAK §4.5 warning, specifically because the year-anchor data is fresh and the competition is stale.

---

## §9 — Topics deliberately excluded + why

- **"premium"** — head-term saturated. Every carrier owns it. No 2-hop story.
- **"actuarial value"** — too jargon-y for civilian searches; <5 internal hits.
- **"primary care physician" / "specialist"** — Healthcare.gov + every carrier glossary; zero opening.
- **"claim" / "appeal" / "grievance"** — same.
- **"essential health benefits"** — folded into metal-tier page.
- **"qualified medical expenses"** — folded into HSA page (it's a sub-concept).
- **"silver loading"** — too inside-baseball, fold into CSR page.
- **"reference pricing"** — emerging concept, almost no consumer search.
- **"TRICARE / FEHB / IHS / VHA"** — out-of-scope (military/federal-worker/native systems aren't CoveredUSA's funnel territory).
- **"lifetime maximum"** — banned by ACA in 2010; legacy term, historical only.
- **"midlevel provider / NP / PA"** — too provider-side; CoveredUSA is consumer-facing.
- **"abortion"** — Planned Parenthood owns the editorial layer; we cover via state-Medicaid + event pages, not glossary.
- **"DME / durable medical equipment"** — Medicare.gov + AARP entrenched; <30 hits.
- **"continuous glucose monitor"** — niche product, not glossary.

**Also:** every "vs" page — those are 2-hop comparison pages (different template / lighthouse format), not glossary entries. We list the *nodes* here, not the *edges*. Phase 4 / Phase 5 master roadmap should treat 2-hop comparison pages as a separate lane.

---

## §10 — Top-10 highest-confidence recommendations

Ranked by (link-target hit rate × 2026 year-anchor freshness × Bing-citation lane) ÷ competitive entrenchment:

1. **premium-tax-credit** — 2026 enhanced-PTC expiration is the news hook. Every subsidy page references. Healthcare.gov + IRS have stale text. Strong screener-funnel signal. (already queued)
2. **federal-poverty-level** — 2,038 internal hits. Coordinate with existing `/federal-poverty-level` hub. Glossary becomes the canonical definitional anchor.
3. **medicare-part-d** — 2026 OOP cap $2,100 + closed donut hole. Fresh-data citation lane.
4. **subsidy-cliff** — 2026 return of the cliff = editorial news. KFF + CBPP are the only fresh-data players; we can match.
5. **special-enrollment-period** — 382 internal hits + anchor for every event-template page. (already queued)
6. **good-faith-estimate** — 184 hits. Procedure/drug template anchor. Bill-analyzer funnel hook. Fresh-data lane (NSA enforcement evolving 2025-2026).
7. **hsa** — 488 hits. Triple-tax-advantage explainer. 2026 limits $4,400 / $8,750.
8. **medigap** — 380 hits. Pair with Medicare Advantage. Stage-of-life decision anchor.
9. **household-size** — 271 hits. Income-table foundation. MAGI + FPL companion.
10. **extra-help-lis** — 158 hits. Screener funnel for lower-income Medicare. Bing-citable lookup.

---

## §11 — Surprises

1. **EPO ranks 378 hits internally** despite being the least-searched of the 4 network types externally. Means our MA-state + plan-comparison pages reference it heavily as a foil. Worth a small page even though search demand is thin.
2. **POS has 511 hits** internally — even higher than EPO. Same logic.
3. **HRA grep returns 515 hits but most are false positives** matching the "Lis" pattern in code/data files. Real count probably 50-80. Still worth a page (ICHRA is a real 2026 employer story) but don't oversize.
4. **subsidy-cliff (125 hits) outpaces guaranteed-issue (17 hits)** by 7×. Reveals our content is more focused on subsidy economics than ACA-conceptual-protections. Reinforces: write subsidy-cliff page; minimize guaranteed-issue.
5. **D-SNP at 205 hits vs C-SNP at 82** — D-SNP is the workhorse SNP variant CoveredUSA references most (because dual-eligibles = a real funnel target). C-SNP can be lower priority.
6. **No internal hits at all for some Healthcare.gov "core" terms** — "rider", "appeal", "grievance", "claim", "beneficiary" all return <5 hits. Tells me FANOUT §4.5's WEAK warning is empirically right: our other pages don't naturally lean on most glossary-canonical vocab. The selection here is *our* link-target universe, not Healthcare.gov's.

---

## §12 — Validation source key (CSV `sources` column)

- `already_queued=y` = term is in `content/data/glossary/_queue.json`
- `healthcare.gov` = page exists at healthcare.gov/glossary/[term]/
- `cigna` / `uhc` / `aetna` / `anthem` = carrier glossary page
- `medicare.gov` = page exists on medicare.gov
- `cms` = CMS regulatory source available
- `irs` = IRS publication source (for HSA / HDHP / FSA / PTC numbers)
- `kff` = Kaiser Family Foundation has tracker/explainer
- `goodrx` = goodrx.com glossary or explainer
- `hhs` = HHS / aspe.hhs.gov canonical (FPL)
- `obvious-50` = my brainstorm; every healthcare-insurance operator includes
- `cbpp` = Center on Budget and Policy Priorities (subsidy / cliff)
- `ssa` = Social Security Administration (Extra Help / LIS)
- `uspstf` = US Preventive Services Task Force (preventive care list)
- `ama` = American Medical Association (prior-auth advocacy)
- `cfpb` = Consumer Financial Protection Bureau (balance billing consumer rights)

---

*End of rationale. 50 terms at hard cap. Selection-driven, not coverage-driven.*
