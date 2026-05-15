# Drug-Topic Research — Adversarial Critique

**Date:** 2026-05-15
**Critic:** Ralph adversarial mode
**Inputs:** drug-topics-a.csv (173) + drug-topics-b.csv (199) + rationale docs

---

## Top-5 missing drugs

1. **Xtandi (enzalutamide)** — IRA Round 2 (2027). Prostate cancer; one of the higher-volume Round 2 names. Absent from both A and B. Add `xtandi-cost-2026` with 2027-MFP forward anchor, priority 2.
2. **Ibrance (palbociclib)** — IRA Round 2. CDK4/6 inhibitor, metastatic breast cancer. Major patient-assistance + Medicare-Part-B-vs-D framing. Absent from both. Add `ibrance-cost-2026`, priority 2.
3. **Pomalyst (pomalidomide) + Calquence (acalabrutinib) + Austedo (deutetrabenazine) + Janumet (sitagliptin/metformin)** — 4 of the remaining IRA Round 2 drugs missing from both lists. Janumet especially: pairs with already-listed Januvia and is a Top-150 prescribed combo. Add all four.
4. **Trikafta / Kaftrio (elexacaftor/tezacaftor/ivacaftor)** — Vertex CF flagship, ~$311K/yr list price. Highest-cost specialty franchise in the modern formulary; coverage-decision intent is existential for ~30K US CF patients + parents. Absent from both. Critic spec explicitly called out Vertex CF drugs. Add `trikafta-cost-2026`, priority 2 (low-volume, high-LTV / high-citation specialty).
5. **Cyclobenzaprine + Meloxicam (top-30 ClinCalc)** — Both in the top-30 most-prescribed list per critic spec; both absent from both A and B. Cheap generics so demand is low-anxiety, but ClinCalc rank guarantees baseline traffic. Add as priority-3 stubs.

Also flag (sub-top-5 misses worth listing): **Tradjenta** is in A as misspelled `trajenta-cost` (should be `tradjenta-cost`, it IS IRA-Round-2); **Cibinqo** (top biologic per critic spec) absent from both; **Hemgenix** only buried inside B's generic `gene-therapy-cost` aggregator — deserves its own slug given $3.5M sticker.

---

## Top-5 demand-score corrections

1. **mounjaro-cost demand_score=890** is propped up by a single `mounjaro savings card` broad=834. Real per-query strict volume across Mounjaro+cost intent is closer to ~150-200/wk. Correction: demand_score ~600. Still priority-1, but don't let one inflated broad-match query frame the comparison.
2. **A's demand_score column does NOT match the documented formula** (`bing × 1.0 + google × 0.5 + util × 0.3`). E.g., wegovy-cost: 404 + 40500×0.5 = 20,654, NOT 1,100. The scores look eyeballed/normalized to a hidden scale. Either re-publish with the literal formula applied or rename the column `priority_index` so downstream readers don't trust it as raw demand math.
3. **eliquis-cost (820) vs jardiance-cost (720)** ordering is wrong on Google volume alone — both have google=40500 / 18100, and Jardiance has the bigger IRA % savings (66% vs 56%) and stronger diabetes-class pull. Swap or tie at priority-1; don't anchor Eliquis higher.
4. **revcovi-cost (80), sovaldi-cost (80), esbriet-cost (80), nexlizet-cost (80), addyi-cost (80)** all fail the ≥50 weekly Bing AND <top-100 utilization threshold. A's own rationale §"Demand cutoffs applied" sets ≥20/wk, but these are <10/wk strict-equivalent. Drop or move to "deep-tail backlog, do not write until traffic justifies."
5. **B's `glp1-medicaid-coverage-by-state` (priority-1, state_specific=y)** has demand split across 51 state pages. Don't list as one priority-1 — split into "build template" (priority-1 infra) and "150 individual state pages" (priority-2 factory). Otherwise it dominates the visible top-10 unfairly.

---

## Top-5 BUSA-overlap corrections

Drug template should be ~0 BUSA overlap (BUSA only has 8 drug-cost articles per CONTENT_INVENTORY). Spurious flags found:

1. **B's `medicare-extra-help-2026` flagged HEAVY** — correct. BUSA has `medicaid-spend-down-vs-extra-help`. A flagged same topic SLIGHT. **A wrong, B right.** Either skip OR re-pitch as a screener-routed page (LIS is a screener-funnel topic anyway, not really drug-cost).
2. **A's `goodrx-vs-insurance-2026` flagged HEAVY → SKIP** — verified, BUSA has `medicare-part-d-vs-goodrx`. Correct call. B's near-dupe `manufacturer-coupon-vs-goodrx` flagged SLIGHT — should also be HEAVY-leaning given how similar BUSA's title is. Recommend ONE coupon-vs-pharmacy-discount-card article on CoveredUSA with a clearly different angle (stacking rules + analyzer handoff), not three.
3. **B's `medicare-part-d-late-enrollment-penalty` HEAVY** — overstated. BUSA inventory grep shows no LEP article in the drug/Medicare bucket. Downgrade to NONE. Real miss = we should write this.
4. **A's `humalog-cost` + `lantus-cost` flagged `already_queued`** — verify against busa-inventory; these aren't in BUSA at all. Probably means CoveredUSA's own daily-blog queue. If so, the cross-reference column is conflating BUSA-overlap with internal-queue conflicts. Separate these signals; busa_overlap should reflect ONLY busa-inventory.csv.
5. **B's `brand-vs-generic-drug-cost` HEAVY** — BUSA inventory grep returns nothing similar (drug-test articles dominate). Likely the flag confused CoveredUSA's own `CU-161` queue entry (per A) with BUSA. Downgrade to NONE; this is a strong pillar page.

Net: at least 3 of A/B's HEAVY flags are wrong-template confusion (CoveredUSA internal queue ≠ BUSA). Re-grep `busa-inventory.csv` for each HEAVY before final merge.

---

## Surprises (3-5)

1. **State-Medicaid GLP-1 should NOT live on the drug template.** B's 150-page state-fork plan (glp1-medicaid-coverage-by-state, medicaid-cover-wegovy-by-state) maps cleanly onto FANOUT_FORMULA §4.4 qa-state-eligibility — the §4.2 drug-cost recipe is manufacturer-assistance + pharmacy-comparison + GoodRx, NOT state-Medicaid-eligibility table + Medi-Cal/AHCCCS brand names. Shoehorning destroys the formula. Move these to the qa-state-eligibility topic list. Drug template handles ONE pillar `glp1-medicaid-coverage-overview` linking out to the qa-state pages.
2. **Both lists massively under-covered the IRA Round 2 list.** Critic spec named 15 drugs; A covered ~8 explicitly, B covered ~6 explicitly. 6+ Round 2 drugs absent from both — biggest objective miss of the whole exercise. Round 2 is announced (Jan 2025) and effective Jan 2027 — the "Medicare drug negotiation 2027 list" news cycle is RIGHT NOW.
3. **A and B agree the IRA Round 1 effective Jan 2026 is a huge news cycle, and both correctly created 10 individual drug pages + the round-up pillar.** This is the strongest concordance in the dataset. Confidence: high that the IRA-2026 cluster is the #1 publish wave.
4. **Demand-score math is inconsistent across A's rows.** Treat the column as ordinal-only, not cardinal. Real merge should re-derive from raw bing/google columns.
5. **Specialty CF / hemophilia / gene therapies are entirely absent from A and only sparsely covered by B.** These are low-volume but the highest-LTV / highest-citation-magnet rare-disease cluster. Quick win = 5-10 specialty stubs (Trikafta, Kalydeco, Symdeko, Orkambi for CF; Hemlibra, Adynovate for hemophilia; Zolgensma, Casgevy, Hemgenix as gene-therapy trinity).

---

## A vs B priority adjudications (10 rows)

| Topic | A pri | B pri | Verdict | Rationale |
|---|---|---|---|---|
| eliquis-cost | 1 | 1 | **1** | Both agree; IRA Jan 2026 anchor. |
| wegovy-cost | 1 | 1 | **1** | Both agree; highest GLP-1 demand. |
| medicare-drug-negotiation-2026 | 1 | 1 | **1** | Pillar page; both agree. |
| stelara-cost | 1 | 1 | **1** | IRA Round 1 + Wezlana biosimilar — strong news. |
| atorvastatin-cost | 3 | 1 | **3** | B over-prioritized. Cheap generic, head-term locked by GoodRx, no real cost-anxiety. A correct. |
| medicare-extra-help-2026 | 1 | 3 (heavy BUSA) | **2** (move to screener-funnel template) | Real BUSA overlap exists; not pure drug-cost. Re-route to qa or screener pillar. |
| trelegy-cost | 2 | 2 | **1** | A's broad=80,493 cost-intent number is exceptional; both under-prioritized. IRA Round 2 anchor too. Promote. |
| glp1-class-cost-comparison | 1 | 1 | **1** | Both agree; class-pillar with low competitive density. |
| birth-control-pills-cost | absent | 1 | **3** | A correctly excluded (ACA $0 coverage = weak cost-anxiety). B wrong to elevate. |
| brand-vs-generic-drug-cost | SKIP (queued) | 2 (heavy) | **1** | Both flags wrong (see BUSA correction #5). Strong pillar; write it. |

---

## Verdict

**Confidence: 7/10.**

Strengths: IRA Round 1 cluster fully covered. GLP-1 saturation complete. Top-30 ClinCalc mostly handled across the A+B merge. Class-comparison pillars correctly identified.

Weaknesses: 6+ IRA Round 2 drugs missing — the single biggest gap. Specialty / orphan / CF / hemophilia cluster under-developed. State-Medicaid GLP-1 mis-templated (belongs in qa-state-eligibility, not drug-cost). BUSA-overlap flags conflated with CoveredUSA internal queue in at least 3 rows. A's demand_score column is not derivable from the stated formula.

**Required fixes before Phase 4 merge:**
1. Add Xtandi, Pomalyst, Ibrance, Calquence, Austedo, Janumet (IRA Round 2 backfill).
2. Add Trikafta + 4-6 specialty cluster stubs.
3. Re-flag BUSA overlap by literal grep of busa-inventory.csv, not internal-queue confusion.
4. Move glp1-medicaid-by-state and medicaid-cover-wegovy-by-state to the qa-state-eligibility template list. Keep ONE overview pillar on drug template.
5. Either re-publish demand_score with the literal formula applied OR rename the column to `priority_index`.
6. Fix tradjenta misspelling (`trajenta-cost` → `tradjenta-cost`).
