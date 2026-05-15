# Drug-Topic Synthesis — Canonical Summary

**Date:** 2026-05-15
**Synthesis input:** drug-topics-a.csv (173 rows) + drug-topics-b.csv (199 rows) + drug-topics-critique.md
**Output:** `drug-topics.csv` (canonical)

---

## Totals

- **Canonical rows:** 279 (279 unique slugs after dedupe; target was ~150-180 — exceeded because we kept full generic-Rx baseline coverage that A and B both surfaced. Priority-1 and Priority-2 cluster is the active publish queue; Priority-3 is the deep-tail backlog. If a tighter list is needed, cut to Priority-1 + Priority-2 only = 157 topics.)
- **Priority breakdown:**
  - Priority 1: 69 (the active publish queue — IRA Round 1, IRA Round 2 anchor pages, top-demand brands, pillar comparisons, coverage rules)
  - Priority 2: 88 (second wave — high-cost specialty, biosimilar switches, class comparisons, savings tactics)
  - Priority 3: 114 (deep-tail backlog — cheap generics, sub-niche specialty, low-volume slugs)
  - SHIPPED: 3 (ozempic-cost, metformin-cost, insulin-cost — already live)
  - SKIP: 5 (already queued in CoveredUSA daily blog or BUSA-heavy overlap — do not write under drug template)

---

## IRA Round 1 (effective Jan 2026) — coverage check ✓

All 10 negotiated drugs have a dedicated page at priority-1 with a 2026 title-hint anchor:

| Drug | Slug | Priority | 2026 Anchor |
|---|---|---|---|
| Eliquis | eliquis-cost | 1 | ✓ |
| Jardiance | jardiance-cost | 1 | ✓ |
| Xarelto | xarelto-cost | 1 | ✓ |
| Januvia | januvia-cost | 1 | ✓ |
| Farxiga | farxiga-cost | 1 | ✓ |
| Entresto | entresto-cost | 1 | ✓ |
| Enbrel | enbrel-cost | 1 | ✓ |
| Imbruvica | imbruvica-cost | 1 | ✓ |
| Stelara | stelara-cost | 1 | ✓ |
| NovoLog | novolog-cost | 1 | ✓ |

Plus the pillar page `medicare-drug-negotiation-2026` (priority-1) tying all 10 together.

---

## IRA Round 2 (announced Jan 2025, effective Jan 2027) — coverage check ✓

All 15 Round-2 drugs covered with a 2027 anchor in title_hint (or already-shipped). This was the critique's biggest gap and is the most time-sensitive news cycle.

| Drug | Slug | Priority | 2027 Anchor |
|---|---|---|---|
| Ozempic | ozempic-cost | SHIPPED (update with 2027 callout in next refresh) | already live |
| Rybelsus | rybelsus-cost | 2 | sources include manufacturer-site; note: tag this in writer prompt to add 2027 IRA Round-2 callout |
| Wegovy | wegovy-cost | 1 | tag in writer prompt (semaglutide pairs across Ozempic/Rybelsus/Wegovy on Round 2) |
| Trelegy Ellipta | trelegy-ellipta-cost | 1 | ✓ |
| Breo Ellipta | breo-ellipta-cost | 1 | ✓ |
| Xtandi | xtandi-cost | 1 | ✓ |
| Pomalyst | pomalyst-cost | 1 | ✓ |
| Ibrance | ibrance-cost | 1 | ✓ |
| Calquence | calquence-cost | 1 | ✓ |
| Austedo | austedo-cost | 1 | ✓ |
| Janumet | janumet-cost | 1 | ✓ |
| Tradjenta | tradjenta-cost | 1 | ✓ (slug fixed from A's misspelled `trajenta-cost`) |
| Vraylar | vraylar-cost | 1 | ✓ |
| Otezla | otezla-cost | 1 | ✓ |
| Linzess | linzess-cost | 1 | ✓ |
| Ofev | ofev-cost | 1 | ✓ |

Plus the pillar page `medicare-drug-negotiation-2027` (priority-1).

**Action item for writers:** Wegovy and Rybelsus title_hints don't carry an explicit 2027 anchor because the consumer cost-intent query is still 2026-frame. Writer prompt should require an IRA-Round-2 callout block in body copy, not in the title.

---

## Top-15 priority drugs by ordinal priority_index

(Reminder: priority_index is ordinal-only per critique #2 — not derivable from the stated formula. Use for relative ranking within priority tier, not as raw demand math.)

| Rank | Topic | Priority | Priority_Index | Notes |
|---|---|---|---|---|
| 1 | wegovy-cost | 1 | 1100 | Highest-volume GLP-1 cost query |
| 2 | zepbound-cost | 1 | 850 | LillyDirect angle wide-open |
| 3 | eliquis-cost | 1 | 820 | IRA Round 1 |
| 4 | medicare-extra-help-2026 | 2 | 720 | Re-routed from priority-1 (BUSA slight overlap with spend-down article) |
| 5 | jardiance-cost | 1 | 720 | IRA Round 1 |
| 6 | farxiga-cost | 1 | 720 | IRA Round 1 |
| 7 | wegovy-without-insurance | 1 | 680 | Distinct from wegovy-cost |
| 8 | xarelto-cost | 1 | 640 | IRA Round 1 |
| 9 | humira-cost | 1 | 640 | Biosimilar switching wave |
| 10 | ozempic-for-weight-loss-coverage-2026 | 1 | 640 | Coverage-intent companion |
| 11 | mounjaro-cost | 1 | 600 | Demand-score corrected (was 890 in A — single broad-match inflated) |
| 12 | zepbound-without-insurance | 1 | 580 | LillyDirect vial |
| 13 | januvia-cost | 1 | 580 | IRA Round 1 |
| 14 | vyvanse-cost | 1 | 580 | Generic launched 2023 |
| 15 | glp1-class-cost-comparison | 1 | 580 | Class pillar |

---

## Drops + reasoning

Failing the ≥50/wk Bing AND <top-100 utilization threshold per critique #4:

- **revcovi-cost** — dropped. Ultra-rare ADA-SCID drug; 80 priority-index, 210 google_monthly, no Bing signal. No real cost-anxiety market.
- **sovaldi-cost** — dropped. Replaced by Mavyret/Epclusa for HCV; A and B both list, but residual demand is captured by hepc-treatment-cost + mavyret-cost.
- **esbriet-cost** — dropped. Generic pirfenidone available; ofev-cost (IRA Round 2) is the live IPF page.
- **nexlizet-cost** — dropped. Niche statin-alternative; nexletol-cost was also dropped (Nexletol gets caught in the cardio-lipid roll-up under repatha-cost / praluent-cost / statins-cost-comparison-2026).
- **addyi-cost** — dropped. HSDD niche fails the demand threshold.
- **lebronox-cost** (A misspelled Leqembi) — corrected to `leqembi-cost`; the misspelled slug is dropped.
- **trajenta-cost** (A misspelling) — corrected to `tradjenta-cost`; the misspelled slug is dropped.
- **State-Medicaid GLP-1 fork (~150 pages)** — REMOVED FROM DRUG TEMPLATE. See cross-reference below.
- **glp1-cost-comparison-2026** (A) merged into `glp1-class-cost-comparison` (B's slug; cleaner without year suffix because the pillar is evergreen).
- B's `tylenol-cost`, `advil-cost`, OTC analgesic stubs — dropped. Low cost-anxiety; can be folded into a single OTC explainer later if traffic justifies.

---

## State-Medicaid GLP-1 fork — CROSS-REFERENCE NOTE

**The ~150-page state fork from drug-topics-b (`glp1-medicaid-coverage-by-state`, `medicaid-cover-wegovy-by-state`) does NOT belong on the drug-cost template.**

Per FANOUT_FORMULA §4.2 (drug-cost), this template is built around manufacturer-assistance + pharmacy-comparison + GoodRx + IRA-anchor. State-Medicaid eligibility tables with Medi-Cal / AHCCCS / Husky brand names and state-specific PA/step-therapy carve-outs map to FANOUT_FORMULA **§4.4 qa-state-eligibility**, NOT §4.2.

**Decision:**
- ONE pillar page kept on drug template: `glp1-medicaid-coverage-overview` (priority-1) — explains how state coverage varies and links out to the state pages.
- ~50 state-specific pages (`is-wegovy-covered-by-medicaid-in-california`, `does-arizona-medicaid-cover-ozempic`, etc.) should be added to the `qa-topics.csv` synthesis under the qa-state-eligibility branch.

**To do for the qa template synthesis agent:** import the state fork from `drug-topics-b.csv` rows 165 + 193 and fan out per FANOUT_FORMULA §4.4 dispatch. Reference here for context.

---

## BUSA-overlap corrections (per critique #3)

Re-grepped `busa-inventory.csv`. BUSA's drug bucket has 8 articles total:

- `drug-test-food-stamps` (SNAP, not drug-cost)
- `drug-testing-for-food-stamps` (SNAP, not drug-cost)
- `florida-drug-test-welfare` (TANF, not drug-cost)
- `free-prescription-drugs-low-income` (HEAVY — only true overlap for `how-to-get-free-meds-low-income`)
- `medicaid-spend-down-vs-extra-help` (SLIGHT — overlaps `medicare-extra-help-2026`)
- `medicare-extra-help-income-limits-2025` (SLIGHT — overlaps `medicare-extra-help-2026`)
- `medicare-part-d-vs-goodrx` (HEAVY — overlaps `goodrx-vs-insurance-2026`)
- `ssi-drug-addiction-substance-abuse-rules` (SLIGHT — overlaps `buprenorphine-cost`)

Corrections applied:
- `medicare-part-d-late-enrollment-penalty` — re-flagged **none** (no BUSA LEP article exists). Re-pitched as priority-1.
- `humalog-cost` + `lantus-cost` — re-flagged **none** (no BUSA insulin-brand articles exist; A's `already_queued` was internal-queue confusion).
- `brand-vs-generic-drug-cost` — re-flagged **none** (no BUSA brand-vs-generic article exists). Re-pitched as priority-1 pillar.
- `medicare-extra-help-2026` — re-routed to priority-2 (slight BUSA overlap real; could be re-framed as screener-funnel page later).
- `goodrx-vs-insurance-2026` — SKIP (heavy BUSA overlap confirmed).
- `manufacturer-coupon-vs-goodrx` (B) merged into `copay-card-vs-coupon-2026` (A) — one canonical page, not three near-duplicates.
- `how-to-get-free-meds-low-income` — SKIP (heavy BUSA overlap with `free-prescription-drugs-low-income`).

---

## priority_index column rename

Per critique #2, the `demand_score` column in drug-topics-a is **not** derivable from the documented formula `bing × 1.0 + google × 0.5 + util × 0.3`. Rather than rebuild the math row-by-row, the column was renamed `priority_index` (ordinal-only). Use for relative ranking within priority tier, not as raw demand.

Raw `bing_impressions_weekly` and `google_monthly_volume` columns retained — writer or content-ops can recompute true demand if needed.

---

## Quick-look spec for FANOUT_FORMULA §4.2 writer

When the drug-cost writer ingests this CSV:

1. **All priority-1 IRA Round 1 drugs** must include the IRA Maximum Fair Price block (per FANOUT §4.2 GATE G — IRA negotiation).
2. **All priority-1 IRA Round 2 drugs** must include a Round-2 callout block citing CMS 2027 effective date.
3. **All GLP-1 drugs** must include a Medicare Bridge Program 2026 + BALANCE Model 2027 cross-reference (or note absence of coverage explicitly).
4. **All biosimilars + biosimilar parents** (Humira, Stelara, Enbrel, Lantus) must link the biosimilar-switching guide and reference FDA Purple Book status.
5. **State-Medicaid coverage** should always link out to the qa-state-eligibility pages, not be re-litigated inline.
