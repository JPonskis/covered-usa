# CoveredUSA Topic Roadmap

**Version:** 1.0
**Date:** 2026-05-15
**Status:** Locked. Output of the Ralph-framework topic-research phase (21 agents: 14 researchers + 7 critics + 7 synthesizers).
**Companion docs:** `FANOUT_FORMULA.md` v1.0 (the playbook), `TRACK_C_PARALLEL_PLAN.md` v1.3 (Track C-prime master brief), `competitor-landscape.md`, `bing-webmaster-api.md`, `busa-inventory.csv`, `CONTENT_INVENTORY.md`, per-template `*-topics.csv` + `*-topics-summary.md` files

---

## 0. TL;DR

Topic research locked across all 7 CoveredUSA content templates. **Demand-driven, no count cap.** Aggregate writable surface: **~1,100 base pages + ~2,200 state-variant pages = ~3,300 pages at full saturation** — same order of magnitude as MedicareAdvantage.com's county-level surface. AI-citation-optimized via FANOUT_FORMULA v1.0 (5 universal rules + per-template recipes).

**Highest-ROI templates** (screener funnel + Bing-validated + competitor-thin):
1. **MA-state** (43 remaining + 300 adjacent — 5/8 Bing-validated; Spanish twin = zero competition)
2. **Persona** (162 base + 459 state-fork — 8/8 Bing-validated; fragmented competition)
3. **Event/trigger** (198 base + ~170 state-fork — 6/8 Bing-validated; Healthcare.gov skeletal)
4. **Track D Medicaid state factory** (51 canonical pages — highest single Bing-citation pattern in entire dataset; rerouted from QA)

**Lower-direct-ROI but on-brand:**
5. QA (194 base + state-fork — long-tail wins, head-terms saturated)
6. Procedure (174 — analyzer funnel; cost-content franchise)
7. Drug (276 — analyzer funnel; IRA-news-cycle is the highest sub-cluster)
8. Glossary (29 — internal-link target, not direct citation)

**Critical strategic decision (LOCKED):** Track D `/medicaid-income-limits/[state]` owns 51 state-Medicaid income-limit pages. `/qa/` owns coverage Q&A only. 69 slugs rerouted from QA → Track D queue. Resolves the §4.4 vs §5.1 URL conflict flagged by both QA researchers.

---

## 1. Per-template summary

### 1.1 procedure-cost (`/cost/[procedure]`)
- **Canonical CSV:** `procedure-topics.csv` (177 rows)
- **Priority breakdown:** 40 P1 / 52 P2 / 85 P3
- **Already live:** 3 (mri-cost, ct-scan-cost, colonoscopy-cost)
- **Already queued in SEO sheet:** 16
- **State-fork candidates:** 3 (ivf-cost, gender-affirming-care-cost, abortion-cost — state law variance)
- **CTA target:** analyzer (cost intent → bill-analyzer funnel)
- **Bing validation:** 1/8 shapes (low — Phase 2 should expand to second-topic verification)
- **Top-10 priority by demand:**
  1. lasik-cost (P2 — competitive but high demand)
  2. cataract-surgery-cost (P1)
  3. eye-exam-cost (P1)
  4. ivf-cost (P2, state-fork)
  5. dexa-scan-cost (P1)
  6. wisdom-teeth-removal-cost (P1)
  7. cologuard-cost (P1)
  8. vasectomy-cost (P1)
  9. ambulance-cost (P1)
  10. knee-replacement-cost (P1)
- **Critique-mandated additions applied:** mohs-surgery, cardiac-ablation, lithotripsy, gender-affirming-care, lab panel set (CMP/BMP/troponin/d-dimer/urinalysis)

### 1.2 drug-cost (`/drug/[drug]`)
- **Canonical CSV:** `drug-topics.csv` (279 rows)
- **Priority breakdown:** 157 in active queue (P1+P2) + 122 P3 long-tail
- **Already live:** 3 (insulin-cost, metformin-cost, ozempic-cost)
- **Already queued:** 3 (insulin-uninsured, tier-exceptions, generic-vs-brand)
- **CTA target:** analyzer
- **Bing validation:** 1/8 (low — Phase 2 should expand to second-drug verification)
- **IRA news cycle coverage (highest-value sub-cluster):**
  - IRA Round 1 (Jan 2026 effective): 10/10 covered with 2026 anchor — Eliquis, Jardiance, Xarelto, Januvia, Farxiga, Entresto, Enbrel, Imbruvica, Stelara, NovoLog
  - IRA Round 2 (Jan 2027 effective): 15/15 covered with 2027 anchor — Ozempic+Wegovy+Rybelsus (semaglutide), Trelegy, Xtandi, Pomalyst, Ibrance, Ofev, Linzess, Calquence, Austedo, Breo, Tradjenta, Vraylar, Otezla, Janumet
- **Cross-reference flag:** State-Medicaid GLP-1 fork (~51 pages) REROUTED to `/qa/does-medicaid-cover-glp1-by-state` per QA-template subtype dispatch (FANOUT §4.4). Drug template keeps 1 pillar `glp1-medicaid-coverage-overview`.
- **Top-10 by priority_index:** wegovy-cost, mounjaro-cost, zepbound-cost, medicare-drug-negotiation-2026, medicare-drug-negotiation-2027, glp1-class-cost-comparison, eliquis-cost, jardiance-cost, adderall-cost (shortage news), manufacturer-coupon-vs-goodrx

### 1.3 persona (`/for/[persona]`)
- **Canonical CSV:** `persona-topics.csv` (170 rows; 162 writable, 8 live/queued)
- **Priority breakdown:** 46 P1 / 83 P2 / 33 P3
- **Already live:** gig-workers, self-employed
- **Already queued:** doordash-uber-drivers, small-business-owners, part-time-workers, 1099-contractors
- **State-fork:** 22 personas with state variance; conservative 9 × 51 = **459 expansion pages**
- **CTA target:** screener (revenue path)
- **Bing validation:** 8/8 shapes (highest of any template, tied with daily-blog)
- **Subsidy-cliff hit:** 77/170 rows flagged (Jan 2026 ACA enhanced subsidy expiration affects all personas above 400% FPL)
- **Top-15 P1 by demand:** children-kids, veterans, 1099-contractors, pregnant-women, small-business-owners, part-time-workers, unemployed, single-mothers, doordash-uber-drivers, single-parents, freelancers, sole-proprietors, immigrants-undocumented, between-jobs, just-laid-off
- **Conservative state-fork-9 personas:** gig-workers (CA AB5), doordash-uber, realtors, truckers, farmers, DACA-recipients, undocumented, medicaid-gap, rural-residents

### 1.4 event/trigger (`/event/[event]`)
- **Canonical CSV:** `event-topics.csv` (198 rows; 137 non-state base + 61 state-seeds)
- **Priority breakdown:** 70 P1 / 75 P2 / 50 P3 / 3 LIVE
- **Already live:** just-lost-job, turning-26, turning-65
- **State-fork seeds:** 5 conservative events × 51 = **~226 expansion pages**; grand total ~363 pages
- **CTA target:** screener (highest intent — losing coverage = shopping NOW)
- **Bing validation:** 6/8 shapes
- **CMS canonical SEP coverage:** 15/15 complete (including the under-150% FPL year-round SEP both researchers initially missed)
- **Medicare event coverage:** IEP/GEP/AEP/OEP/SEP-Medicare/5-Star/IRMAA-appeal/TRICARE-young-adult — all covered
- **2026 news-cycle anchors:** ACA subsidy cliff snap-back, IRA Part D $2,000 cap, Medicaid unwinding tail, FPL January update — all primary topics
- **Top-10 priority:** ACA-OEP-2026, lost-medicaid-redetermination, qualifying-life-event-2026, medicare-aep-2026, special-enrollment-period-2026, under-150-fpl-year-round-sep, medicare-sep, medicare-oep-2026, just-got-married, having-a-baby

### 1.5 qa (`/qa/[question]`)
- **Canonical CSV:** `qa-topics.csv` (194 rows: 143 coverage + 51 state-elig post-Track-D-routing)
- **Plus rerouted file:** `qa-topics-rerouted-to-track-d.csv` (69 rows → Track D queue)
- **Priority breakdown:** 92 P1 / 87 P2 / 15 P3
- **Already live:** does-medicaid-cover-rehab, does-medicare-cover-dental, does-medicare-cover-vision
- **State-fork:** ~700-750 expanded pages (GLP-1-by-state, abortion, gender-affirming, IVF, adult-dental + 6 state-elig umbrellas × 51)
- **CTA target:** screener
- **Bing validation:** 3/8 shapes (state-Medicaid carries validation; coverage Q&A weakly validated per FANOUT §4.3)
- **Subtype split:** qa-coverage (FANOUT §4.3) vs qa-state-eligibility (FANOUT §4.4). Writer dispatches based on `subtype` field.
- **Top-15 priority:** extra-help-eligibility-2026, chip-eligibility-by-state, medicare-savings-program-by-state, does-medicare-cover-ozempic, aca-marketplace-subsidy-eligibility-2026, state-pharmaceutical-assistance-programs, obamacare-still-available-2026, does-medicare-cover-hearing-aids, does-medicare-cover-wegovy, glp1-by-state umbrella, mental-health-by-state, medicaid-nursing-home, medicare-vs-medicaid eligibility, medicare-vs-medicaid coverage, immigrant-medicaid-by-state

### 1.6 glossary (`/glossary/[term]`)
- **Canonical CSV:** `glossary-topics.csv` (32 rows — AGGRESSIVELY pruned from 64+50 candidate union)
- **Priority breakdown:** 28 P1 / 1 P2 / 3 SHIPPED
- **Already live:** deductible, magi, out-of-pocket-maximum — ALL flagged for Track-E ≤500-word downsize
- **CTA target:** mixed (screener for coverage terms, analyzer for cost terms)
- **Bing validation:** 1/8 shapes (per FANOUT §4.5 WARNING — concept-only pages weakly cited; value is internal-link target)
- **Composition:** 19 single-term-definition / 11 comparison-2hop / 2 term-with-state-data
- **All 5 critique-mandated 2-hops added:** deductible-vs-oop-vs-total, MA-vs-original-plus-medigap, hmo-vs-ppo-vs-epo-vs-pos, individual-vs-family-deductible-oop, in-vs-out-network-coinsurance
- **Top-10 by internal-link hit count:** premium-tax-credit (547 hits), hsa (488), SEP (383), household-size (282), good-faith-estimate (187), subsidy-cliff (144), CSR (117), MSP (112), prior-auth (93), QLE (90)

### 1.7 ma-state (`/medicare-advantage/[state]`)
- **Canonical CSV:** `ma-state-topics.csv` (43 rows for remaining states)
- **Adjacent templates CSV:** `ma-state-adjacent-templates.csv` (6 trimmed adjacent template opportunities)
- **Already live:** 8 (CA, TX, WY, FL, NY, MI, OH, PA)
- **CTA target:** screener (HIGH commission: $694 avg Medicare enrollment, Jacob earns 40%)
- **Bing validation:** 5/8 shapes
- **Tier 1 (10 states, write next):** GA, NC, IL, AZ, TN, VA, NJ, IN, MA, WA
- **Tier 2 (13 states):** OR, MO, MD, WI, MN, CT, KY, LA, AL, CO, AR, SC, OK
- **Tier 3 (20 states):** NV, IA, KS, NE, UT, NM, MS, ID, NH, ME, RI, MT, DE, WV, DC, HI, ND, SD, VT, AK
- **DC handling:** Include as 51st page, Tier 3
- **PR handling:** EXCLUDE from this template — side-quest standalone bilingual page (~70% MA penetration, zero competitor coverage)
- **Adjacent template ROI ranking (~300 additional pages):**
  1. **Spanish twin (51 pages)** — ZERO competitor coverage, highest leverage
  2. **Persona × state MVP (50 pages)** — veterans/dual-eligibles/diabetics/low-income/Spanish-speakers × top 10 states; higher lead quality
  3. **Curated county pages (50)** — top-5 counties × top-10 states
  4. **D-SNP × top-30 states (30 pages)** — dual-eligible Medicare premium
  5. **MA-vs-Medigap × 7 guaranteed-issue states (7)** — high decisional intent
  6. **Carrier × state trimmed (60 pages)** — top-5 carriers × top-12 states

### 1.8 Track D (`/medicaid-income-limits/[state]`) — REROUTED from QA

This is a NEW template (not in the original 7) that emerged from the QA-template routing decision. FANOUT §5.1 names this as the **highest-ROI content investment** in the entire system: `{state} {program} income limits {year}` is the single dominant Bing citation pattern (4,200+ weighted citations in BenefitsUSA cross-check).

- **Source CSV:** `qa-topics-rerouted-to-track-d.csv` (69 rows)
- **Canonical structure:** 51 state pages (Medi-Cal CA, AHCCCS AZ, Texas Medicaid, Florida Medicaid, etc.) + 17 state-brand variants + household-size facets
- **Existing route:** `/medicaid-income-limits` (single hardcoded lighthouse) — extend to `/medicaid-income-limits/[state]` dynamic route
- **CTA target:** screener
- **Bing validation:** YES — `texas medicaid income limits 2026` (1,079 citations), `missouri medicaid income limits 2026` (563), validated across BenefitsUSA real-Bing data
- **AHCCCS surprise from QA research:** 90,165 broad weekly Bing impressions — highest state-brand volume in the entire dataset; Arizona Medicaid page should be near the top of the queue
- **BUSA cannibalization caveat:** state-Medicaid eligibility is HEAVY BUSA overlap (Medicaid = 378 BUSA articles). Intent-split rule applies (BUSA = how-to-apply, CoveredUSA = do-I-qualify income lookup). 9-row household-size table + FANOUT structure makes CoveredUSA version structurally different.

---

## 2. Cross-template ROI ranking

ROI = monetization weight × demand × competitive feasibility.

### 2.1 Monetization weights (per Track C-prime master brief §8.4)

- **1.0 (screener funnel — revenue path):** persona, event, qa-coverage + state-eligibility, ma-state, Track D Medicaid factory, glossary (coverage terms)
- **0.5 (analyzer funnel — engagement, monetization path being built):** procedure, drug, cost-Q&A, glossary (cost terms)

### 2.2 Bing-validation tier (from FANOUT_FORMULA §4)

| Template | Shapes Bing-validated | Tier |
|---|---|---|
| persona | 8/8 | tier 1 |
| event | 6/8 | tier 1 |
| ma-state | 5/8 | tier 1 |
| qa-state-eligibility | 3/8 (validated subset carries it) | tier 2 |
| qa-coverage | weakly validated (Medicare.gov + AARP own head terms) | tier 3 |
| procedure | 1/8 | tier 3 (Phase 2 verification needed) |
| drug | 1/8 | tier 3 (Phase 2 verification needed) |
| glossary | 1/8 (concept-pages sparse) | tier 4 (link-target, not direct citation) |
| **Track D Medicaid factory** | **highest single pattern in entire dataset** (4,200+ citations) | **tier 0 (highest priority)** |

### 2.3 Competitive feasibility (per competitor-landscape.md)

| Template | Competitor strength | Leverage |
|---|---|---|
| procedure-cost | medium (GoodRx top, long tail weak) | HIGH |
| trigger events | medium (Healthcare.gov skeletal) | HIGH |
| persona | medium (fragmented, Stride/Catch don't win SEO) | HIGH |
| ma-state | high (NerdWallet, US News, MedicareGuide own top-5) | MEDIUM (with Spanish twin) |
| drug | high (GoodRx, Healthline, manufacturer dominant) | LOW-MED (head); MED (class/policy) |
| qa-coverage | very high (Medicare.gov + AARP) | LOW (head); MEDIUM (long-tail/state combos) |
| Track D Medicaid | low-medium (Healthcare.gov + BenefitsUSA) | HIGH (per FANOUT §5.1 + intent split) |
| glossary head | very high (.gov + carriers + Investopedia) | LOW (skip head); MED (2-hop comparison) |

### 2.4 Final ROI-ranked templates (write order)

**Rank by `monetization × Bing-validation × competitive-feasibility × demand`:**

| Rank | Template | Rationale |
|---|---|---|
| 1 | **Track D Medicaid factory** | Screener funnel × highest Bing pattern × medium competition × high demand. The biggest single move per FANOUT §5.1. Ship 51 pages. |
| 2 | **MA-state remaining 43** | Screener funnel × 5/8 Bing-validated × high competition (but #3-#5 rank is achievable) × commission $$$. Plus 51 Spanish twins (zero competition). |
| 3 | **Persona P1** | Screener funnel × 8/8 Bing-validated × fragmented competition × high demand. 46 P1 + 9 × 51 state-fork (459 expansion) eventually. |
| 4 | **Event P1** | Screener funnel × 6/8 Bing-validated × Healthcare.gov skeletal × highest intent. 70 P1 + 226 state-fork. |
| 5 | **QA coverage P1 (long-tail + state-fork combos)** | Screener funnel × 3/8 validated subset × long-tail is open × moderate demand. 92 P1. Skip head-term Medicare.gov territory. |
| 6 | **Drug IRA-anchored cluster** | Analyzer funnel × 1/8 (Phase 2 needed) × manufacturer-dominant at head × IRA news cycle is wide open × moderate demand. Focus on 25 IRA Round 1+2 drugs. |
| 7 | **Procedure cost-focused P1** | Analyzer funnel × 1/8 validated × GoodRx top but long-tail weak × moderate demand. 40 P1. |
| 8 | **Persona × state MVP** | Adjacent template (cross-references persona + ma-state). 50 pages. Higher lead quality than pure state pages. |
| 9 | **MA-state Spanish twins** | 51 pages, zero competitor coverage, mechanical content production (writer already supports ES). |
| 10 | **Glossary 2-hop comparisons** | Internal-link target × medium competition × moderate demand. 11 2-hop comparison pages. |
| 11 | **Event state-fork P1** | 5 events × ~50 capped (state extension laws apply only to ~12 states for turning-26). ~226 pages. |
| 12 | **QA state-eligibility (non-Track-D)** | CHIP/MSP/SPAP/immigrant-Medicaid by state. ~6 umbrellas × 51 = ~306 pages. |
| 13 | **MA-state county pages (curated 50)** | Top-5 counties × top-10 states. MedicareAdvantage.com's playbook trimmed. |
| 14 | **Drug remaining P1+P2** | Procedure-style mass production once analyzer funnel monetization solidifies. ~150 pages. |
| 15 | **Procedure remaining P1+P2 + Spanish twins** | Mass production once monetization path proven. |

---

## 3. Bulk-publish sequencing recommendation

**Constraint:** Bing/Google flag sudden publishing spikes. Use drip-publish cron at 10-25 articles/day. Stage 2 cron picks up + IndexNow-submits everything. Annual coordinated republish cron (separate from drip-publish) for refreshes of already-indexed pages (May data update + October Star Ratings/AEP update — NerdWallet's playbook).

### Wave 1 (weeks 1-4) — ~120 pages

**Target:** Highest-ROI, highest-Bing-validation, fastest-deploy.

- **Track D Medicaid factory: 51 pages** (the single biggest move). Sequence by Bing impressions × state population: AZ first (90,165 broad/wk — the AHCCCS surprise), CA, TX, FL, NY, IL, OH, GA, NC, MI, PA (8 already exist for MA but not for Medicaid factory) — ship all 51.
- **MA-state Tier 1: 10 pages** (GA, NC, IL, AZ, TN, VA, NJ, IN, MA, WA).
- **Persona P1 highest-demand: 15 pages** (children-kids, veterans, pregnant-women, small-business-owners, freelancers, single-mothers, single-parents, sole-proprietors, immigrants, unemployed, between-jobs, just-laid-off, dual-eligibles, caregivers-aging-parents, rural-residents — many overlap with Wave 1 of event).
- **Event P1 IRA-news + ACA-cliff anchored: 10 pages** (ACA-OEP-2026, qualifying-life-event-2026, lost-medicaid-redetermination, under-150-fpl-year-round-sep, ACA-subsidy-cliff-snap-back, IRA-Part-D-$2000-cap, FPL-January-2026-update, medicare-aep-2026, medicare-oep-2026, 5-star-medicare-sep).
- **Drug IRA Round 1: 10 pages** (Eliquis, Jardiance, Xarelto, Januvia, Farxiga, Entresto, Enbrel, Imbruvica, Stelara, NovoLog — all with 2026 anchor).

**End of Wave 1 count:** 96 base pages + 8 MA-state already live + 3 procedure/drug live + ~80 hardcoded/blog = **~190 total CoveredUSA pages live.**

### Wave 2 (weeks 5-8) — ~120 pages

- **MA-state Tier 2: 13 pages** (OR, MO, MD, WI, MN, CT, KY, LA, AL, CO, AR, SC, OK).
- **Drug IRA Round 2: 15 pages** (Ozempic Round 2 anchor, Trelegy, Xtandi, Pomalyst, Ibrance, Ofev, Linzess, Calquence, Austedo, Breo, Tradjenta, Vraylar, Otezla, Janumet — all with 2027 anchor).
- **Persona P1 remaining: 31 pages**.
- **Event P1 remaining: 60 pages** (next-step SEP variants, life events, Medicare events).
- **QA P1 coverage long-tail: 15 pages** (Medicare GLP-1 coverage, hearing aids 2026 update, telehealth Medicare 2026, etc.).

**End of Wave 2:** ~310 pages total.

### Wave 3 (weeks 9-12) — ~120 pages

- **MA-state Tier 3 + DC: 20 pages**.
- **Persona × state MVP: 50 pages** (veterans/dual-eligibles/diabetics/low-income/Spanish-speakers × top 10 states).
- **Glossary 2-hop comparisons: 11 pages**.
- **Event state-fork P1: 25 pages** (start the 5 × ~50 state-fork rollout with top-25 highest-demand combos).
- **Drug P1 non-IRA: 15 pages** (Mounjaro, Wegovy, Zepbound, GLP-1 class, Adderall shortage, etc.).

**End of Wave 3:** ~430 pages total.

### Wave 4 (months 4-6) — ~250 pages

- **MA-state Spanish twins: 51 pages** (mechanical — writer already supports ES).
- **MA-state county pages curated: 50 pages**.
- **Procedure P1: 40 pages**.
- **QA state-eligibility (post-Track-D): 30 pages** (CHIP-by-state, MSP-by-state, SPAP-by-state seeds).
- **Event remaining P1 + state-fork tail: 50 pages**.
- **Glossary P1 remaining: 17 pages**.
- **Drug P2: 30 pages**.

**End of Wave 4 (~6 months out):** ~680 pages total.

### Wave 5+ (months 7-12) — ~600+ pages

- **Persona state-fork rollout: 459 pages** (9 personas × 51 states; staggered)
- **Event state-fork remaining: 200 pages**
- **QA state-eligibility umbrellas full rollout: 200 pages**
- **MA-state adjacent templates remainder: 250 pages** (D-SNP × 30, MA-vs-Medigap × 7, carrier × state × 60, county tail × 150)
- **Procedure P2/P3 + drug P2/P3 mass-production**: 250 pages

**End of 12 months:** ~1,500-2,000 pages live. Matches the master brief §8.5 moonshot.

**End of 18-24 months (full saturation):** ~3,300 pages live. State of MedicareAdvantage.com county-level surface.

---

## 4. Cross-template boundary policies

Decisions for ambiguous topics that could live in multiple templates. **Apply these in writer-dispatch logic.**

### 4.1 Procedure vs Q&A
- Cost-focused page (dollar amounts + analyzer funnel) → **procedure** template
- Coverage-only ("Does Medicare cover X procedure") → **qa-coverage** template
- Example: `mri-cost` → procedure. `does-medicare-cover-mri` → qa-coverage.

### 4.2 Drug vs Q&A
- Cost-focused (cost without insurance + manufacturer assistance + analyzer) → **drug** template
- Coverage-only ("Does Medicare cover Ozempic") → **qa-coverage** template
- State-Medicaid drug coverage ("Does Medicaid cover Ozempic in [state]") → **qa-state-eligibility** template (NOT drug — per critique routing decision)
- Example: `ozempic-cost` → drug. `does-medicare-cover-ozempic-2026` → qa-coverage. `does-medicaid-cover-glp1-by-state` → qa-state-eligibility (51-fork).

### 4.3 Glossary vs Q&A
- ≤500-word concept definition with FAQ ≤3 items → **glossary**
- >500-word with coverage breakdown, FAQ ≥3 items, eligibility tables → **qa**
- 2-hop comparison ≤500 words → **glossary** (`hsa-vs-fsa`, `hmo-vs-ppo`)
- 2-hop comparison >500 words with state-fork → **qa** (`medicaid-vs-chip-eligibility-by-state`)

### 4.4 Persona vs Event
- Ongoing status / who you are → **persona** (e.g., `freelancer`, `early-retiree`)
- Transition trigger → **event** (e.g., `just-quit-to-start-business`, `turning-65`)
- Edge case: `just-laid-off` could be both. Resolution: persona = "what to do as someone who's between jobs"; event = "your first 60 days after layoff with SEP timing". Both exist — different surfaces.

### 4.5 ma-state vs persona × state (adjacent)
- Generic state Medicare Advantage → **ma-state** (the 51 canonical)
- Persona-specific state Medicare Advantage → **adjacent persona × state MVP** (50 pages: veterans-MA-CA, dual-eligibles-MA-FL, etc.)

### 4.6 Track D vs qa-state-eligibility
- State Medicaid income limits + household-size table → **Track D** `/medicaid-income-limits/[state]` (51 pages)
- State CHIP / MSP / SPAP / immigrant Medicaid eligibility → **qa-state-eligibility** `/qa/[question]` (~300 pages across 6 umbrellas × 51)
- All `medicaid-eligibility-[state]` and `[state-brand]-income-limits` slugs → Track D (69 slugs rerouted from QA)

---

## 5. State-variant expansion math

How the base ~1,100 pages scale to ~3,300 with state-fork expansion:

| Category | Base pages | State-fork multiplier | Expansion total |
|---|---|---|---|
| procedure | 174 | 3 state-fork topics × 51 = 153 (IVF, gender-affirming, abortion) | 327 |
| drug | 276 | 0 (state-Medicaid GLP-1 rerouted to qa) | 276 |
| persona | 162 | 9 personas × 51 (conservative) | 162 + 459 = 621 |
| event | 137 base + 61 state-seeds = 198 | 5 events × ~50 (capped, turning-26 = 12) | 198 + ~165 = 363 |
| qa-coverage | 143 | ~6 state-fork combos × 51 (GLP-1, abortion, gender-affirming, IVF, adult-dental, second-opinion) | 143 + ~280 = 423 |
| qa-state-eligibility | 51 (post-Track-D) | 6 umbrellas × 51 (CHIP, MSP, SPAP, immigrant, pregnancy, retroactive) | 51 + ~306 = 357 |
| glossary | 29 | 0 (definitions don't fork) | 29 |
| ma-state | 43 | Spanish twin = 51; persona×state = 50; county = 50; D-SNP = 30; MA-vs-Medigap = 7; carrier = 60 | 43 + 248 = 291 |
| Track D Medicaid factory | 51 | (already state-fork — 51 IS the universe) | 51 |
| **TOTAL** | **~1,103** | | **~2,738** |

**Plus already-live (~91) + hardcoded (~15) = ~2,800+ pages at 12-18mo saturation.**

After full Wave 5+ rollout including persona × state, event × state, qa × state — **~3,300 page ceiling.**

---

## 6. Cross-template conflicts flagged for Jacob

Decisions you should explicitly confirm before bulk production starts.

### 6.1 LOCKED — Track D vs §4.4 routing
**Resolution:** Track D owns Medicaid state income-limit pages. `/qa/` owns coverage Q&A and non-Medicaid state-eligibility.
**Status:** Both researchers + critic confirmed. Proceed.

### 6.2 OPEN — Persona × state factory
The 9 conservative state-fork personas (gig-workers, doordash-uber, realtors, truckers, farmers, DACA, undocumented, medicaid-gap, rural-residents) × 51 = 459 pages.
**Question for Jacob:** Build all 9 × 51 in Waves 5-12, or trim to top-3 highest-demand (gig-workers, doordash-uber, undocumented = 153 pages)?
**Recommendation:** Start with top-3 × 51 = 153 pages in Wave 5. Expand to all 9 if Waves 5-6 perform well (>30% citation share on indexed pages).

### 6.3 OPEN — Annual coordinated republish cron
Per NerdWallet playbook + ma-state synth recommendation: coordinated May data update + October Star Ratings/AEP update for ALL 51 MA-state pages in single week.
**Question:** Build this cron NOW (before May 2027 data drop) or defer to next year?
**Recommendation:** Build infrastructure now; first execution May 2027. Drip-publish cron handles initial publish; annual cron handles refreshes only.

### 6.4 OPEN — Spanish twin priority
Spanish twin for all 51 MA-state pages = #1 adjacent template ROI per critic (zero competitor coverage).
**Question:** Ship Spanish twins in parallel with EN main pages (Wave 1-3), or as Wave 4 batch?
**Recommendation:** Ship Spanish twins 2-4 weeks BEHIND each EN state-page batch for analytics signal-isolation (per ma-state-B rationale). Avoids confounding initial indexing signal.

### 6.5 OPEN — Procedure/drug Phase 2 verification
FANOUT_FORMULA §4.1 + §4.2 are based on single-topic data (MRI for procedure, Ozempic for drug). Phase 2 expansion should verify against a second topic (colonoscopy, Eliquis) before scaling mass production.
**Question:** Run Phase 2 verification (~$5-7, 1 hour) before kicking off Wave 4 procedure mass production?
**Recommendation:** Yes. Run the probe + cross-check; only then trigger Wave 4 procedure production.

### 6.6 OPEN — Track E (regen existing pages)
56 pre-formula CoveredUSA pages exist (Track C-prime audit). Glossary downsizing affects 3 pages (deductible, magi, oop-max — currently 1500-1700 words each; target ≤500 per FANOUT §4.5).
**Question:** Track E sits before, during, or after the bulk content production?
**Recommendation:** Track E runs in parallel with Wave 4-5 (months 4-6). Doesn't block bulk production. Glossary downsizing should be batched (3 pages, single PR).

---

## 7. Key references & artifacts

### Inputs
- `FANOUT_FORMULA.md` v1.0 — the playbook (§3 universal rules, §4 per-template recipes)
- `TRACK_C_PARALLEL_PLAN.md` v1.3 — Track C-prime master brief (§8.4 monetization, §8.4.5 analyzer-screener handoff, §8.5 page count math)
- `research/competitor-landscape.md` — per-template competitor scorecard
- `research/bing-webmaster-api.md` — primary data source documentation
- `CONTENT_INVENTORY.md` — existing CoveredUSA inventory
- `busa-inventory.csv` — BUSA URL inventory (2,111 rows) for cross-reference

### Outputs of this phase (canonical CSVs)
- `topic-research/procedure-topics.csv` (177)
- `topic-research/drug-topics.csv` (279)
- `topic-research/persona-topics.csv` (170)
- `topic-research/event-topics.csv` (198)
- `topic-research/qa-topics.csv` (194) + `qa-topics-rerouted-to-track-d.csv` (69)
- `topic-research/glossary-topics.csv` (32)
- `topic-research/ma-state-topics.csv` (43) + `ma-state-adjacent-templates.csv` (6)
- Per-template `*-topics-summary.md` + `*-topics-a-rationale.md` + `*-topics-b-rationale.md` + `*-topics-critique.md` (research provenance)

### Crons (existing + needed)
- Existing: Stage 1 daily blog (3/day) + Stage 2 deploy + IndexNow
- **NEW NEEDED:** Drip-publish cron (10-25 articles/day from topic-research queue) + Stage 2 IndexNow on drip cron
- **NEW NEEDED:** Annual coordinated republish cron (May + October, separate from drip)

### Bing API key + sites
- API key: `.secrets/bing-webmaster-api-key.txt` (32 chars, verified)
- Verified sites: benefitsusa.org, coveredusa.org
- Language: `en-US` (capital US)
- Endpoint: `https://ssl.bing.com/webmaster/api.svc/json/<Method>?apikey=...`

---

## 8. Verdict

**Topic research phase COMPLETE.** 21 agents executed (14 researchers + 7 critics + 7 synthesizers). Mean per-template confidence: 8.2/10. No template flagged below 7/10. Track D rerouting unanimously confirmed by independent QA researchers + critic.

**Aggregate writable surface (canonical):** 1,103 base pages + 2,738 state-fork expansion = ~3,300 pages at full saturation.

**Wave 1 (4 weeks):** 96 high-confidence pages ship — Track D 51 + MA-state Tier 1 10 + Persona P1 15 + Event P1 10 + Drug IRA Round 1 10.

**12-month target (per master brief moonshot):** 1,500-2,000 pages live.

**18-24 month full-saturation:** 3,300 pages. Matches MedicareAdvantage.com county-level surface — but unlike them, every page is FANOUT-aligned for AI citation.

**Ready to execute** subject to Jacob's six confirmations in §6.

---

*End of TOPIC_ROADMAP. The plan is locked. Bulk production begins after Jacob signoff.*
