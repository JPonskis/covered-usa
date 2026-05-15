# Event Topics — Agent B (coverage + intuition) Rationale

**Template:** `/event/[event]`
**Scope:** trigger-event / qualifying-life-event / SEP-trigger pages
**Approach:** competitor enumeration + obvious-40 brainstorm + state-fork mapping + 2026 news-cycle anchors
**Output:** 152 event topics in `event-topics-b.csv`

---

## 1. Why this template, why now

Event template is the highest-intent surface CoveredUSA has. The user landing here
just had a thing happen — got fired, turned 26, had a baby, lost Medicaid, retiring.
They are shopping for coverage *right now*, not researching for next year.

Per competitor-landscape.md §5, Healthcare.gov pages are skeletal 500–800 words,
healthinsurance.org runs deep, Boomer Benefits owns turning-65, NerdWallet has
event content but mostly cost-focused. Spanish coverage is essentially absent.
Bing AI-citation surface is contested but not saturated. State × event combos
("turning 26 California 2026", "lost job Texas 2026") are wide open.

This is also the natural funnel-to-screener template (intent split per
master brief §8.4: events default to ctaTarget=screener, the broker-revenue path).
Quality > volume in lead generation matters more here than any other template.

---

## 2. Competitor enumeration map

### 2.1 Healthcare.gov /sep/ canonical pages (10 verified shapes)
- /sep/marriage
- /sep/divorce-or-legal-separation (gain coverage rule)
- /sep/birth
- /sep/adoption-foster-care
- /sep/loss-of-employer-coverage (job loss)
- /sep/cobra-ending
- /sep/loss-of-medicaid
- /sep/moving
- /sep/becoming-a-citizen
- /sep/changes-in-income (affecting subsidy)

All ~500–800 words. No schema. No state nuance. Spanish toggle exists but parity is shallow.

### 2.2 healthinsurance.org (Louise Norris) event coverage
- "What is a SEP?" anchor explainer (~3,000 words)
- Job loss / COBRA path explainer
- Turning 26 deep-dive
- Moving state SEP
- Marriage / divorce / new-baby coverage
- Pregnancy + Medicaid
- Income change SEPs
- Subsidy cliff coverage (refreshed annually)

Norris is the gold-standard editorial brand here. We can't out-author her on prose,
but we can win on structure (8-GATE formula, schema, year-anchored, 9-row tables).

### 2.3 Boomer Benefits (turning-65 corpus)
- Master "turning 65" guide
- IEP / GEP / SEP windows
- COBRA + Medicare interaction (CU-108 queued)
- Spouse / employer coordination
- Late enrollment penalty
- Medigap guaranteed-issue rights

Boomer owns retirement-age content. We compete on freshness (2026 dollar figures,
2026 IRA changes) + state nuance.

### 2.4 Medicare.gov / SSA enrollment event pages
- IEP (7 months around 65)
- GEP (Jan–Mar)
- SEP (working past 65, leaving employer, moving, plan terminating, etc.)
- IRMAA life-event re-determination

### 2.5 eHealth / GoHealth / SelectQuote event pages
- "Missed open enrollment" funnel pages — heavy commercial intent, thin content
- Job-loss + COBRA-decision content
- Retirement-age content

### 2.6 NerdWallet "what to do if X"
- "What to do if you lose health insurance"
- "What to do when you turn 26"
- "Health insurance after divorce"
- "Pregnancy + ACA"
- Strong tables, lighter on state nuance.

### 2.7 KFF event content
- Subsidy cliff explainers
- Medicaid unwinding tracker (5M+ disenrollments)
- DACA marketplace rule explainers
- IRA Part D $2,000 cap analysis (the 2026 news anchor)

---

## 3. The obvious-40 brainstorm

Every reasonable event template should include these. We hit all 40 except where
BUSA heavy-overlap signals "skip" (e.g., income-drop-aca: BUSA owns
/life-events/income-drop, intent-split barely defends it).

**Age transitions (10):** turning-18, turning-19 (CHIP cliff), turning-21 (foster
Medicaid cliff), turning-26, turning-30 (NY/NJ state extensions), turning-50
(preventive shift), turning-64 (pre-Medicare year), turning-65, turning-66/67 (SSA
FRA), turning-73 (RMD/HSA interactions)

**Job / employment (10):** just-laid-off, just-quit-job, just-hired, switching-jobs,
going-part-time, going-1099, going-W2, retiring, retiring-early, business-started,
business-closed

**Family / life (10):** got-married, got-divorced, spouse-died, having-a-baby,
adopting, foster-parent, legal-guardian, kids-leaving-home, caregiver-aging-parent,
kinship-care

**Coverage events (10):** lost-employer-coverage, COBRA-expiring, marketplace-plan-renewing,
plan-canceled, insurer-left-market, missed-open-enrollment, lost-subsidy, formulary-change,
out-of-network-doctor, plan-rate-increase

**Status changes:** moved-to-new-state, moved-international, returned-from-abroad,
new-citizen, green-card, DACA, asylum/refugee, emancipated-minor, incarceration-release

**Health changes:** new-chronic-condition, became-disabled, SSDI-approved, ESRD,
ALS, cancer-diagnosis, diabetes-diagnosis, mental-health-diagnosis, long-COVID,
gender-affirming-care

**Medicaid:** lost-Medicaid (unwinding), Medicaid-renewed, Medicaid-denied,
CHIP-aging-out, Medicaid-expansion-new-state, Medicaid-work-requirement,
new-coverage-gap (sub-100% FPL in non-expansion state)

**Veterans / military:** leaving-military, TRICARE-ending, VA-eligibility-starting,
veteran-turning-65, military-deployment-spouse

**Marketplace mechanics:** SEP-60-day-window, SEP-coverage-start-date, documents-needed-SEP,
SEP-denied-appeal, exceptional-circumstance-SEP

**Medicare enrollment-event surface:** Medicare-IEP, Medicare-GEP, Medicare-SEP,
Medicare-AEP, Medicare-OEP, Medicare-disenrollment-period, late-enrollment-penalty,
MA-plan-leaving-market, moved-from-MA-service-area, Medigap-guaranteed-issue,
turning-65-on-COBRA, turning-65-on-ACA, turning-65-still-working,
turning-65-spouse-employer, spouse-on-Medicare-you-not

**2026-anchored events:** IRA $2,000 Part D cap, ACA subsidy cliff snap-back,
2026 FPL update (subsidy eligibility reset every January), DACA final rule status,
Medicaid expansion 2026 cohort, work-requirement state activations

---

## 4. State-fork events (51-page candidates)

Per §3 in HANDOFF and FANOUT_FORMULA §5.1, the multipliers are massive when an
event has a state-specific variant. The included state-specific seeds (5 states
sampled, expandable to 51 each):

| Seed | State extensions / forks | Why fork |
|---|---|---|
| turning-26 | CA, TX, NY, FL, PA, IL, MA, NJ, OH, GA + 41 more | State age-extension laws differ (NJ age 31, NY age 29, FL age 30, OH age 28, others age 26) |
| moved-to-state | All 51 | 51 Marketplace portals, 51 Medicaid systems, 51 SEP routes |
| lost-job-state | All 51 | Mini-COBRA laws differ wildly (Cal-COBRA 36mo, NY mini-COBRA 36mo, TX continuation 9mo, many states none) |
| medicaid-unwinding-state | All 51 | Unwinding rules + transition paths (NY Essential Plan, MN MinnesotaCare, CA Covered California Bronze) |
| pregnant-medicaid-state | All 51 | Pregnancy-Medicaid FPL thresholds differ 138–375% FPL; CHIP-P programs by state |
| medicaid-expansion-new-state | The 10 non-expansion states + any 2026 cohort | Genuine news/coverage events |
| natural-disaster-sep | 51 (event-driven) | FEMA declarations annually trigger state SEPs |
| home-state-disaster-2026 | Hurricane-prone + wildfire-prone (FL, TX, CA, LA) | Annual seasonal demand |

**Expansion math:** 8 state-fork seeds × 51 states = 408 state-event pages potentially.
That's larger than any other template's state-fork surface. Stack these as Track-D-adjacent
factory output.

---

## 5. 2026 news-cycle events (time-bound demand spikes)

These get a demand multiplier because of the 2026 anchor:

1. **IRA $2,000 Part D cap implementation (Jan 1 2026)** — biggest Medicare news of the
   year. Every senior with brand-name drugs is searching for "what changes with my Part D in 2026".
2. **ACA enhanced-subsidies sunset / subsidy-cliff return** — depending on legislative
   status; KFF + Norris drive search volume.
3. **2026 FPL update (Jan 2026)** — annual reset; new subsidy thresholds = SEP-triggering
   for many household-income changes.
4. **Medicaid unwinding tail-end** — 5M+ disenrolled in 2023-25; some redeterminations still
   firing in 2026. Demand is steady but topical.
5. **DACA Marketplace rule** — final rule status is dynamic. Worth a 2026-anchored page.
6. **State Medicaid expansion / work-requirement cohort** — track KFF state expansion tracker.
   2026 may see new states activating.
7. **FEMA disaster-SEP activations** — annually triggered by hurricane / wildfire season.

---

## 6. Top-15 highest-confidence (write next)

1. **lost-medicaid-unwinding** — 5M+ disenrolled, ongoing, low BUSA overlap (BUSA covers
   benefits-application; we cover coverage decisions). Multiplier: 51 state forks. ROI:
   highest of any single event.
2. **plan-renewal-letter** — every ACA enrollee gets one in November; recurring
   high-frequency annual moment, no good competitor coverage of this exact decision.
3. **medicare-aep-2026** (already queued CU-206) — annual demand spike Oct-Dec.
4. **medicare-iep-2026** — every person turning 65 has this question; 4M+ Americans/year.
5. **medicare-sep-2026** — comprehensive landing page; multiplier for turning-65-COBRA,
   turning-65-on-ACA, turning-65-still-working sub-pages.
6. **ira-part-d-2000-cap** — 2026 news-cycle anchor; underserved by competitors as of
   early 2026; KFF + AARP own it but they're not lead-gen pages.
7. **aca-subsidy-cliff-2026** — high information asymmetry, lead-gen friendly.
8. **just-retired** — high-intent, broker-friendly, queued territory.
9. **retiring-early-before-65** — bridge-to-Medicare is one of the highest commercial-intent
   queries. Norris owns it, we structure-win it.
10. **green-card-coverage** — 5-year-bar explainer is searched but undercovered by
    competitor field outside NILC.
11. **daca-coverage-2026** — news-cycle, no competitor lead-gen page worth citing.
12. **employer-dropping-coverage** — common in 2026 as employers shed coverage; KFF
    tracks but no broker-lead-gen page exists.
13. **fpl-update-2026-january** — annual recurring event; subsidy-eligibility reset.
14. **medigap-guaranteed-issue** — high-stakes (lifetime price implications), niche, lead-gen
    friendly.
15. **documents-needed-sep** — the Healthcare.gov DMI rabbit-hole nobody explains well;
    competitor field is weak.

---

## 7. Deliberate exclusions / "skip" calls

- **cobra-vs-marketplace** (heavy BUSA overlap; BUSA has an exact-titled article in both
  EN and ES). Per intent-split: BUSA wins this. We can have a SEP/COBRA-decision page
  shaped differently (cobra-expiring) but not a head-to-head.
- **returning-from-abroad** (BUSA exact dupe + Spanish dupe). Skip.
- **became-disabled** (BUSA has /life-events/became-disabled). Skip the generic; cover
  the SSDI-Medicare-24-month sub-angle instead.
- **caregiver-aging-parent** (BUSA dupe). Skip.
- **turning-19-chip** (BUSA exact dupe benefits-ending-at-19). Skip generic; cover the
  turning-19-medicaid-loss state-fork instead.
- **income-drop-aca** (BUSA exact dupe /life-events/income-drop). Skip.
- **business-started / business-closed** — BUSA may pick these up; we have slight
  overlap. Keep, but flag.

---

## 8. Notes on demand approximation (Agent A has the Bing data)

Per Agent B's brief I omitted Bing impressions and Google volumes. Confidence is based
on:
- Competitor density (how many editorial sites have the page)
- BUSA-overlap signal (heavy = saturated)
- Year-anchored news-cycle signal
- State-fork multiplier (state variants compound demand)
- Lead-gen friendliness (broker-funnel-aligned)

The merge step (Phase 4) will fill in numeric demand from Agent A's Bing API output.

---

## 9. Final tally

- Total event topics: **152**
- Already live: 3 (turning-26, turning-65, just-lost-job)
- Already queued (in Google Sheets): 12 (CU-205, CU-218, CU-219, CU-221, CU-213, CU-217,
  CU-107, CU-119, CU-134, CU-197, CU-001, CU-023, CU-162, CU-167 + 2 Medicare-explainer
  crossovers)
- New state-fork candidates: 5 seeds × 51 = ~255 additional pages potential
- 2026 news-cycle anchors: 7
- BUSA heavy-overlap (skip): 7

**Conservative win-the-space estimate:** 100 net-new event pages + 250-400 state-fork
factory pages = **350-500 event-template pages within scope of the formula.**
