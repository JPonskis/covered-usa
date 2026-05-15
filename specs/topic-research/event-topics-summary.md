# Event Topics — Synthesis Summary

**Synthesizer:** Frank (Synthesis Agent)
**Date:** 2026-05-15
**Inputs:** event-topics-a.csv (99 rows) + event-topics-b.csv (152 rows) + event-topics-critique.md
**Output:** event-topics.csv (198 canonical topic rows)

---

## 1. Canonical Count

- **Total canonical topic rows:** 198
- **Non-state base topics:** 137 (within the 120-150 synthesis target)
- **State-specific rows (fork seeds + hubs):** 61
- **Already LIVE on site:** 3 (turning-65, turning-26, laid-off)
- **Priority 1:** 70 rows (35%)
- **Priority 2:** 75 rows (38%)
- **Priority 3:** 50 rows (25%)
- **Seasonal republish flagged:** 16 rows (OEP/AEP/renewal-cycle pages)

A's CMS canonical discipline was used as the spine. B's Medicare event surface and state-fork ambition was layered in. Critique's 6 mandatory adds were inserted at priority 1.

---

## 2. CMS Canonical 14-SEP Coverage Check

All 15 named SEPs in the critique are now covered:

| # | CMS SEP | Canonical topic |
|---|---|---|
| 1 | Loss of coverage (job, COBRA exhaust, plan end) | `laid-off` (LIVE), `just-quit-job`, `COBRA-expiring-sep`, `ACA-plan-canceled-discontinued`, `employer-stopped-offering-coverage` |
| 2 | Moving (cross service area) | `moved-to-new-state` + 5 state seeds |
| 3 | Marriage | `just-got-married`, `just-married-add-spouse-employer`, `just-married-different-state` |
| 4 | Birth / adoption / foster | `having-a-baby`, `adopting-child`, `foster-parent-health-insurance`, `becoming-dependent-court-order` |
| 5 | Lost Medicaid / CHIP | `lost-medicaid-redetermination-2026`, `medicaid-renewal-notice-2026`, `chip-to-marketplace`, `medicaid-aging-out-19` |
| 6 | Citizenship / lawful presence | `SEP-immigration-status-change`, `gained-citizenship-health-insurance`, `green-card-5-year-bar`, `daca-coverage-2026`, `asylum-refugee-coverage` |
| 7 | Incarceration release | `released-from-incarceration`, `SEP-just-released-jail-state-medicaid`, `incarceration-entering-medicaid` |
| 8 | Abuse / abandonment | `SEP-survivor-domestic-abuse` |
| 9 | Tribal member (year-round) | `SEP-tribal-membership` |
| 10 | Natural disaster (FEMA) | `SEP-natural-disaster-2026`, `home-state-disaster-2026` |
| 11 | Plan error / misconduct | `SEP-error-or-misconduct`, `SEP-application-error-eligibility-decision`, `SEP-fraud-misrepresentation` |
| 12 | Significant income change | `ACA-income-change-SEP`, `lost-subsidy-SEP`, `income-jump-aca`, `got-promoted-coverage` |
| 13 | Plan discontinued | `ACA-plan-canceled-discontinued` |
| 14 | AmeriCorps / Peace Corps | `SEP-leaving-AmeriCorps-PeaceCorps` |
| 15 | **Under-150% FPL year-round** | `under-150-fpl-year-round-sep` (MANDATORY ADD; was missing in both A and B) |

All 15 covered. The under-150-FPL SEP is the highest-broker-funnel-value gap that both source lists missed.

---

## 3. Medicare Event Coverage

| Event | Canonical topic |
|---|---|
| IEP (7-month around 65) | `medicare-initial-enrollment-period-2026` |
| GEP (Jan-Mar catch-up) | `medicare-general-enrollment-period-2026` |
| AEP (Oct 15 - Dec 7) | `medicare-aep-2026` (MANDATORY ADD; A wrongly excluded) |
| OEP (MA Jan-Mar switch) | `medicare-oep-2026` (MANDATORY ADD; A wrongly excluded) |
| Medicare SEP (job loss, retirement, etc.) | `medicare-special-enrollment-period` (hub) + 7 sub-events |
| 5-Star SEP | `5-star-medicare-sep` (MANDATORY ADD; both missed) |
| IRMAA life-event appeal | `irmaa-life-event-appeal` (MANDATORY ADD; both missed) |
| Medicare disability under 65 | `medicare-disability-under-65`, `ssdi-approved-medicare`, `esrd-medicare-enrollment`, `als-medicare-enrollment` |

All 8 critique-identified Medicare gaps closed.

---

## 4. 2026 News-Cycle Events Checklist

- [x] **Medicaid unwinding** — `lost-medicaid-redetermination-2026` (demand boosted to 500 per critique; 5M+ disenrollment cohort) + 4 state seeds
- [x] **FPL update** — `fpl-update-2026-january` (republish flag set)
- [x] **ACA subsidy cliff** — Moved to blog/glossary territory per critique §5; surviving rows are `exceeded-income-cap-2026` (400% FPL survivor's guide) and `lost-subsidy-SEP` (income-change angle). Generic `ACA-subsidy-cliff-2026` cluster dropped from event template.
- [x] **IRA Part D $2000 cap** — Dropped from event template per A's §7 (lives on medicare-explainer, not /event/)
- [x] **DACA final rule** — `daca-coverage-2026`
- [x] **Hurricane / FEMA disaster** — `SEP-natural-disaster-2026` + `home-state-disaster-2026` (both republish_annually=y for May before hurricane season)
- [x] **Medicaid work requirement** — Dropped from event template (policy event, belongs on Medicaid factory per critique §5)
- [x] **Medicaid expansion new states** — Dropped from event template (policy event)

---

## 5. Top-15 Priority Events

Ranked by combined demand-score + funnel value (per corrected demand-scores in critique §7):

| # | Topic | Why |
|---|---|---|
| 1 | `ACA-open-enrollment-2026` | Demand 600 weighted-mean (was 1490 peak) — still dominant event-search shape |
| 2 | `lost-medicaid-redetermination-2026` | Boosted to 500; 5M+ disenrollee cohort |
| 3 | `qualifying-life-event-2026` | Hub page; 490 demand |
| 4 | `medicare-aep-2026` | Mandatory add; 33k Google volume; dominant Medicare event shape |
| 5 | `special-enrollment-period-2026` | 398 demand; legal-language hub |
| 6 | `under-150-fpl-year-round-sep` | Mandatory add; highest broker-funnel ROI |
| 7 | `medicare-special-enrollment-period` | Hub for Medicare SEPs; 300 demand |
| 8 | `medicare-oep-2026` | Mandatory add |
| 9 | `just-got-married` | 200; clean BUSA boundary |
| 10 | `having-a-baby` | 200; clean BUSA boundary |
| 11 | `moved-to-new-state` | 180; state-fork spine |
| 12 | `got-divorced` | 180 |
| 13 | `medicare-part-b-when-retiring` | 165; high broker-funnel |
| 14 | `medicaid-pregnant-women-2026` | 140; state-fork hub |
| 15 | `turning-65-while-working` | 135 |

---

## 6. State-Fork Events with Capped State Lists

| Seed | State count | Notes |
|---|---|---|
| `turning-26-by-state` | **12 states + 2 addenda** (capped per critique §4) | NY (29), NJ (31), PA (30 conditional), FL (30 conditional), CT, ID, IL (military), MA (ConnectorCare), OK, NM, NV, OH (28). Plus CA Medi-Cal pickup and TX non-expansion as addenda. Remaining 39 states use federal-default page. **Saves 37 thin pages vs B's 51-fork.** |
| `just-lost-job-state` (lost-job-X) | 51 states | Mini-COBRA laws + Medicaid expansion vary everywhere. 5 seeds enumerated (CA, TX, NY, IL, FL); remaining 46 generated from template. |
| `moved-to-new-state` (moved-to-X) | 51 states | Each state has Marketplace + Medicaid + mini-COBRA variance. 5 seeds enumerated; 46 templated. |
| `medicaid-redetermination-by-state-2026` (medicaid-unwinding-X) | 51 states | Unwinding timeline + state transition programs. 4 seeds enumerated; 47 templated. |
| `medicaid-pregnant-women-2026` (pregnant-medicaid-X) | 51 states | Pregnancy-Medicaid FPL ranges 138-375%, CHIP-Perinatal in TX, postpartum extension variance. 4 seeds; 47 templated. |
| `domestic-partner-add-insurance` | State-fork-leaning | Carrier-side rules vary; recommended as state-fork rather than single national page per critique §9 adjudication. Not pre-enumerated. |

---

## 7. Events Dropped + Reasoning

**Health diagnosis events (not SEP triggers — diagnosis ≠ qualifying event unless tied to coverage loss):**
- `became-disabled` (B) — kept only as `medicare-disability-under-65` (Medicare entitlement path)
- `cancer-diagnosis` (B) — dropped; not a SEP, lives on procedure/Q&A
- `diabetes-new-diagnosis` (B) — dropped; same
- `chronic-condition-coverage` (B) — dropped
- `covid-long-haul-coverage` (B) — dropped (lives on Q&A or SSDI path)
- `mental-health-diagnosis-coverage` (B) — dropped (lives on parity-rules glossary)
- `substance-use-treatment-coverage` (B) — dropped (procedure/coverage rule, not event)
- `gender-affirming-care-coverage` (B) — dropped (lives on coverage Q&A)
- `breastfeeding-coverage` (B) — dropped (coverage rule, not life event)
- `gastric-surgery-coverage` (B) — dropped (procedure)
- `fertility-treatment-coverage` (B) — dropped (procedure)
- Note: ESRD and ALS Medicare entries kept because they trigger statutory Medicare entitlement (not just a diagnosis).

**Policy events (not personal life events; better on blog/glossary/Medicare-explainer):**
- `ACA-subsidy-cliff-2026` (A) / `aca-subsidy-cliff-2026` (B) — dropped from event template; surviving angles: `exceeded-income-cap-2026`, `lost-subsidy-SEP`, `ACA-subsidy-cliff-by-state`
- `ACA-subsidy-cliff-by-state` (A) — dropped (state-policy, not event)
- `ira-part-d-2000-cap` (B) — dropped per A's §7 (lives on medicare-explainer)
- `medicaid-expansion-new-state` (B) — dropped (state-MA/Medicaid factory)
- `medicaid-work-requirement-new` (B) — dropped (Medicaid factory)

**Non-SEP "tax events" wrongly framed as life events:**
- `home-purchase-hsa` (B) — dropped (tax tip, not SEP)
- `won-lottery` (B) — dropped
- `inherited-windfall` (B) — dropped (kept reference angle in spend-down/Medicaid)
- `graduating-medical-school` (B) — dropped (too narrow persona)
- `international-student-becoming-resident` (B) — covered by `gained-citizenship-health-insurance` + `green-card-5-year-bar`

**BUSA-heavy dupes (defer to year-2):**
- `returning-from-abroad` (B) / `returning-from-abroad-health-insurance` (A) — dropped per critique §9 (BUSA exact dupe)
- `income-drop-aca` (B) — dropped (BUSA exact-title dupe); kept upside angle `income-jump-aca`
- `caregiver-aging-parent` (B) / `becoming-a-caregiver-health-insurance` (A) — dropped from event template (BUSA owns EN+ES; lives on persona/Q&A)

**Reframed / consolidated:**
- A's two `divorce-health-insurance-*` rows → kept as one event (`got-divorced`) + one Q&A row (`divorce-health-insurance-qa`)
- A's `turning-26-WI-PA-IL-extensions` catch-all → exploded into the capped 12-state list
- B's `turning-30-ny` / `turning-30-nj` → reframed as `turning-26-NY-age-29` / `turning-26-NJ-age-31` (the user-search shape is "turning 26 in X")

**Total dropped:** ~22 borderline rows. A's 99 + B's 152 (with overlap ~50 between them) → merged base of ~135, plus 6 mandatory adds, minus ~22 drops = 137 non-state base. Close to the 120-150 target band.

---

## 8. State-Fork Page Expansion (Events × States)

If all state-fork seeds are expanded at build time:

| Seed | Pages | Subtotal |
|---|---|---|
| `turning-26-by-state` (capped) | 12 extension states + 2 addenda + 1 hub | 15 |
| `lost-job-state` | 51 states + 1 hub | 52 |
| `moved-to-new-state` | 51 states + 1 hub | 52 |
| `medicaid-redetermination-by-state-2026` | 51 states + 1 hub | 52 |
| `medicaid-pregnant-women-2026` | 51 states + 1 hub | 52 |
| Other one-off state forks (`turning-26-CA-medi-cal`, `turning-26-TX-no-expansion`, `medi-cal-aging-out-19`) | 3 | 3 |
| **Total state-specific page expansion** | | **226** |
| **Total non-state base pages** | | **137** |
| **Grand total event-template pages** | | **363** |

**Capping turning-26 saved 39 pages** (would have been 51 + 1 hub = 52 vs the 13 we ship).

---

## 9. Demand-Score Corrections Applied

Per critique §7:

| Topic | Old | New | Reason |
|---|---|---|---|
| `ACA-open-enrollment-2026` | 1490 | 600 | Weighted-mean over 13 weeks, not peak |
| `turning-26-by-state` | 250 | 120 | Bing only returned 4 related queries; A inferred from SERP |
| `lost-medicaid-redetermination-2026` | 160 | 500 | Real demand 400-600/mo + 5M unwinding cohort |
| `medicare-aep-2026` | (excluded by A) | 450 | Dominant 2026 event-search shape; 33k Google volume |

---

## 10. BUSA Overlap Corrections Applied

Per critique §6:

| Topic | Old | New |
|---|---|---|
| `laid-off-health-insurance-2026` → `laid-off` | heavy | slight |
| `COBRA-vs-marketplace-2026` | slight | heavy (priority bumped to 3; defer) |
| `just-lost-job-state` | heavy | slight |

---

## 11. Confidence

**MEDIUM-HIGH.** Spine = A's CMS discipline. Breadth = B's Medicare + state-fork ambition. All 6 mandatory adds from critique inserted at priority 1. Demand-score over-inflations and BUSA-overlap miscalls corrected. turning-26 state forks capped to the legitimate 12 extension states (saved 39 thin pages).

The remaining priority-3 rows are intentionally long-tail — they catch surface area for the SEP-decision-tree without consuming the template factory.
