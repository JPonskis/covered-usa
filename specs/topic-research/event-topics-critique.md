# Event Topics — Adversarial Critique

**Reviewer:** Frank (Critic Agent C)
**Date:** 2026-05-15
**Inputs:** event-topics-a.csv (99 rows) + event-topics-b.csv (152 rows) + both rationales

---

## 1. CMS Canonical SEP Coverage — Audit

The Marketplace SEP set is closed. Checked all 15 named in the prompt against both lists.

| # | CMS SEP | A | B | Notes |
|---|---|---|---|---|
| 1 | Loss of coverage (job, COBRA exhaust, plan year end, etc.) | y | y | Multiple variants both |
| 2 | Moving (cross service area) | y | y | |
| 3 | Marriage | y | y | |
| 4 | Birth/adoption/foster | y | y | |
| 5 | Lost Medicaid/CHIP | y | y | |
| 6 | Citizenship/lawful presence | y | y | A has green-card-coverage; B has new-citizen-status + DACA + asylum |
| 7 | Incarceration release | y | y | |
| 8 | Abuse/abandonment | y | y | A: SEP-survivor-domestic-abuse; B: domestic-violence-survivor |
| 9 | Tribal member (year-round) | y | n | **B MISSED IT.** Critical CMS SEP gap on B's side. |
| 10 | Natural disaster (FEMA) | y | y | |
| 11 | Plan error/misconduct | y | y | |
| 12 | Significant income change | y | y | |
| 13 | Plan discontinued | y | y | |
| 14 | AmeriCorps/Peace Corps | y | n | **B MISSED IT.** |
| 15 | SEP for low-income (under 150% FPL year-round) | **n** | **n** | **BOTH MISSED IT.** Massive Marketplace SEP shipped 2022, year-round window for sub-150% FPL households. High BUSA-funnel value (lowest-income enrollees = ACA-zero-premium-eligible). |

## 2. Medicare event coverage — Audit

| Event | A | B | Notes |
|---|---|---|---|
| IEP (7-mo around 65) | y | y | |
| GEP (Jan-Mar) | y | y | |
| Medicare SEP (working past 65 etc.) | y | y | |
| AEP (Oct 15 - Dec 7) | n | y | **A MISSED IT.** A explicitly excluded in §7 rationale, calling it ma-state territory. Wrong — AEP is the dominant 2026 event-search shape (5,020-broad-impression peak that A itself reported). It is BOTH a calendar event AND lives on /event/. |
| OEP (MA Jan-Mar) | n | y | **A MISSED IT.** Same logic. |
| 5-Star SEP | n | n | **BOTH MISSED IT.** Year-round Medicare SEP allowing switch to a 5-star MA/PDP. Boomer Benefits owns the citation. |
| Lost-creditable-coverage SEP | y (medicare-creditable-coverage-lost) | n | |
| IRMAA appeal life-event | n | n | **BOTH MISSED IT.** Form SSA-44; triggered by divorce/retirement/spouse-death. High-income retiree funnel. |

## 3. State-extension laws

A enumerated NY(29) / NJ(31) / FL + WI-IL-PA-SC catch-all. B enumerated NY(29) / NJ(31) / FL(30) / OH(28) / IL military / MA + 4 more.

**B is broader and more accurate.** OH age-28 dependent rule is real and A missed it. PA does NOT extend to 30 — B's turning-26-pennsylvania row is technically correct that PA defaults at 26 but B's seed flag inconsistency between turning-30-NY / turning-30-NJ implies similar 30-year endpoints in other states that don't have them. **MA has no extension past 26** — B's turning-26-massachusetts is fine, but Massachusetts page should not over-promise.

## 4. State-fork count audit (the prompt's specific check)

B claims 51-fork for: turning-26, lost-job, moved-state, lost-Medicaid, pregnant.

| Seed | 51 legit? | Verdict |
|---|---|---|
| turning-26 × state | **No, ~12 legit** | Federal default is 26 everywhere; only ~10-12 states materially differ. Forking to 51 produces 39 duplicate-content pages. **Cap at ~12 state pages + 1 national hub.** |
| moved-to-state | **Yes, 51** | Each state has Marketplace + Medicaid + mini-COBRA + state-exchange variance. Legit fork. |
| lost-job-state | **Yes, 51** | Mini-COBRA laws + state Medicaid expansion differ everywhere. Legit. |
| lost-Medicaid-state | **Yes, 51** | Unwinding timeline + state-specific transition programs (NY Essential Plan, MN MinnesotaCare, etc.). Legit. |
| pregnant-Medicaid-state | **Yes, 51** | Pregnancy-Medicaid FPL ranges 138-375%; CHIP-Perinatal in TX; postpartum extensions differ. Legit. |

**Net:** B over-forks turning-26 by ~39 pages. The other 4 stand.

## 5. Over-listing — events that aren't events

Both lists include borderline "policy event" rather than personal life event:
- `ACA-subsidy-cliff-2026` / `aca-subsidy-cliff-2026` (A + B) — this is a policy event, not a SEP. Lives better on /blog/ or /glossary/. **Demand is real but template-fit is wrong.**
- `fpl-update-2026-january` (B) — annual policy update, not a life event. Same issue.
- `ira-part-d-2000-cap` (B) — policy event; lives on medicare-explainer per A's own §7 exclusions list. **B contradicts A.**
- `medicaid-expansion-new-state` / `medicaid-work-requirement-new` (B) — policy events. Better on state-MA / Medicaid factory.
- `home-purchase-hsa`, `won-lottery`, `inherited-windfall` (B) — these are tax-affecting events but not Marketplace SEP triggers. Cut or move to glossary/Q&A.

## 6. BUSA-overlap corrections

| Topic | A's flag | B's flag | Correct |
|---|---|---|---|
| `laid-off-health-insurance-2026` (A) / `laid-off` (B) | heavy | slight | **slight.** BUSA lost-job-what-benefits is application/SNAP intent; the marketplace-SEP intent is different. A is over-defensive. |
| `cobra-vs-marketplace-2026` (A) / `cobra-vs-marketplace` (B) | slight | heavy | **heavy.** BUSA has exact-title EN+ES. A is under-flagging. B correct. |
| `having-a-baby` (B) | slight | slight | Correct, but BUSA `/en/life-events/new-baby` + `government-benefits-after-having-a-baby` are both application-intent (SNAP/WIC/TANF), not health-marketplace. Stays slight. |
| `divorce-health-insurance-2026` (A) | slight | slight | OK. BUSA divorce content is benefits-application not health-coverage. |
| `caregiver-aging-parent` (B) | heavy | heavy | Correct. BUSA owns both EN + ES. |
| `lost-medicaid-redetermination-2026` (A) | slight | slight | Correct. BUSA covers application-side; we own coverage-decision. |

## 7. Top 5 demand-score corrections

1. **`ACA-open-enrollment-2026` (A, 1,490)** — accurate at peak; A's note says off-season is 200-400/wk. Composite demand_score should be **weighted-mean ~600**, not peak 1,490. A inflates by 2-3×.
2. **`turning-26-by-state` (A, 250)** — A admits Bing returned only 4 related queries. Inferred from competitor SERP. Real composite should be **~120**. A over-scores by 2×.
3. **`medicare-special-enrollment-period` (A, 300)** — 50 broad / 549 related. 300 is fair, but title overlap with Medicare AEP/OEP/IEP suggests this should be a HUB page consolidating, not a single thin page. Same score, different scope.
4. **`open-enrollment` seasonal weighting (both)** — neither list seasonally tags pages. AEP-dependent pages need a "republish trigger: September annually" flag. Missing.
5. **`lost-medicaid-redetermination-2026` (A, 160) vs `lost-medicaid-unwinding` (B, no score)** — both lists capture this but at different demand altitudes. Real demand is ~400-600/mo Google + KFF's tracker shows 5M+ disenrollments. Should rank **top-5 priority, not mid-pack**.

## 8. Top 5 missing events (write next, all priority 1)

1. **SEP for under-150% FPL year-round enrollment.** CMS-shipped 2022; lowest-income enrollees can sign up any month. Highest broker-funnel value (zero-premium plans = easy closes). Neither list has it.
2. **5-Star Medicare SEP.** Year-round switch to 5-star MA/PDP. Boomer-validated demand.
3. **IRMAA life-event appeal (SSA-44).** Triggered by retirement, divorce, spouse death, work stoppage. High-income retiree funnel.
4. **Medicare AEP 2026 + Medicare OEP 2026 as event-template pages.** A excluded these, but they're the dominant Medicare event-search shapes per Bing data.
5. **Turning 26 + military dependent SEPs (TRICARE Young Adult / age-up rules).** B touched leaving-military but missed the TRICARE-Young-Adult-age-26-to-23 cliff.

## 9. A vs B adjudications (top 10 disagreements)

| Topic | A says | B says | Adjudication |
|---|---|---|---|
| AEP 2026 lives on /event/ | No (excluded) | Yes | **B wins.** Dominant search shape. |
| OEP 2026 lives on /event/ | No | Yes | **B wins.** |
| turning-26 state forks count | ~7-10 | 51 | **A wins on count.** B forks too aggressively. |
| ACA-subsidy-cliff lives here | Yes | Yes | **Both wrong.** It's policy-event; belongs on blog/glossary. |
| COBRA-vs-marketplace template fit | Event | Event (but heavy BUSA) | **A correct on template; B correct on BUSA flag.** Merge: ship, but heavy-flag → defer. |
| `business-started` is event-template | n/a | Yes priority 1 | **Persona template, not event.** Move. |
| Health-change events (diabetes, cancer, mental-health diagnosis) | n/a | Yes priority 2-3 | **Skip.** Not SEPs. Belongs on procedure or Q&A. |
| Returning-from-abroad | priority 3 (A) | heavy BUSA skip | **B correct.** Skip. |
| Foster-parent | priority 2 (A) | priority 3 (B) | **A correct.** Real SEP trigger, low competition. |
| Domestic-partner | A has 2 rows; B has 0 | Adjudicate: **A correct on inclusion** but carrier-side rules vary too much for a single page. Make it a state-fork. |

## 10. Surprises

1. **Both lists missed the under-150% FPL year-round SEP.** This is the single highest-ROI CMS SEP for broker-funnel given 40%-commission economics + lowest-premium plans = highest close rate.
2. **B has IRA Part D cap on event template, A excludes it.** A is right per CONTENT_INVENTORY scoping but the demand is real — it should LIVE somewhere, not be orphaned.
3. **A has 6 turning-26 state pages but only 4 state-specific events flagged.** Inconsistent state-fork accounting.
4. **Neither list distinguishes between 60-day SEP window vs 90-day Medicaid window.** Real-user confusion source. Healthcare.gov DMI document-proof process is undercovered.
5. **State-extension laws beyond age 26 are way more nuanced than either captured.** OH age-28, NJ DU31 age-31, NY age-29, FL age-30 with conditions, IL military-dependent age-30, WI age-27, PA up to 30 if unmarried + no employer coverage. 7 legit state-specific dependent-extension pages. A captured 4; B captured 6. Truth is ~7.

## 11. Verdict

**Confidence: MEDIUM-HIGH.** The merged A+B+critique list is **comprehensive enough to ship**, but has 3 priority-1 gaps that must be added:
1. SEP for under-150% FPL
2. 5-Star Medicare SEP
3. IRMAA appeal (SSA-44)

And one accounting fix: **cap turning-26 state forks at ~12, not 51**. Saves 39 thin pages.

A is stronger on demand discipline + CMS canonical enumeration. B is stronger on Medicare event surface + state-fork ambition + obvious-40 coverage. Merge takes A's spine and B's breadth.

Recommend Phase 4 (synthesis) drops ~15-20 of B's borderline "events" (health diagnoses, lottery, home purchase) that aren't SEP triggers, and adds the 5 missing high-priority topics in §8.
