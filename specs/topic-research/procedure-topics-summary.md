# Procedure-Cost Topics: Canonical Synthesis Summary

**Synthesizer:** Phase 4 merge agent
**Date:** 2026-05-15
**Inputs:** procedure-topics-a.csv (101), procedure-topics-b.csv (120), procedure-topics-critique.md
**Output:** procedure-topics.csv

---

## Headline Numbers

- **Total canonical topics:** 177 (slug-normalized union of A + B + critique additions)
- **Already live (shipped):** 3 — mri-cost, ct-scan-cost, colonoscopy-cost
- **Already queued (CONTENT_INVENTORY):** 16
- **State-fork (`state_specific=y`):** 3 — ivf-cost, gender-affirming-care-cost, abortion-cost
- **BUSA overlap = slight:** 7 (the rest = none)

Note: The critique projected "~155." Actual canonical = 177 because B contributed several long-tail clusters A omitted (vaccines, body-part MRI forks, dental specifics, DME) that survived slug-normalization. All retained per Jacob's "win-the-space" rule. The critique's directional verdict (broad union with critique-add fixes) still holds.

---

## Breakdown by Priority

| Priority | Count |
|---|---:|
| P1 (write first) | 40 |
| P2 (high-value tail) | 52 |
| P3 (long-tail) | 85 |
| **Total** | **177** |

---

## Top 20 by demand_score (Bing-validated, Agent A column)

| # | demand_score | priority | topic |
|---:|---:|:---:|:---|
| 1 | 23,866 | P2 | lasik-cost *(critique downgraded P1→P2 — brutal AdWords field)* |
| 2 | 12,730 | P1 | cataract-surgery-cost |
| 3 | 4,939 | P1 | eye-exam-cost |
| 4 | 2,735 | P2 | ivf-cost *(critique downgraded P1→P2 + state_specific=y)* |
| 5 | 1,777 | P1 | dexa-scan-cost |
| 6 | 1,593 | P1 | wisdom-teeth-removal-cost |
| 7 | 1,230 | P1 | cologuard-cost |
| 8 | 1,139 | P1 | vasectomy-cost |
| 9 | 1,131 | P1 | ambulance-cost *(BUSA slight overlap)* |
| 10 | 1,023 | P1 | knee-replacement-cost |
| 11 | 923 | P1 | urgent-care-cost |
| 12 | 821 | P1 | echocardiogram-cost |
| 13 | 751 | P2 | pet-scan-cost |
| 14 | 726 | P2 | hysterectomy-cost |
| 15 | 695 | P2 | flu-shot-cost |
| 16 | 683 | P2 | eeg-cost |
| 17 | 657 | P2 | sleep-study-cost |
| 18 | 606 | P2 | blood-test-cost |
| 19 | 602 | P1 | mammogram-cost |
| 20 | 572 | P1 | ultrasound-cost |

Caveat: A's `google_monthly_volume` column = `bing × 6` (extrapolation, not independent data). Renormalized in the canonical CSV: `google_monthly_volume = "extrapolated-bingx6"` to flag the dependency. Use `bing_impressions_weekly` as the true Bing-validated signal. Critique-added topics (mohs, cardiac-ablation, lithotripsy, gender-affirming, CMP/BMP/troponin/d-dimer) have no Bing data yet — added on utilization + competitor-page evidence.

---

## State-Fork Distribution

3 topics flagged `state_specific=y`:

| Topic | Priority | Rationale |
|---|:---:|---|
| ivf-cost | P2 | ~21 states with insurance mandates per RESOLVE (CA, IL, NY, MA, NJ comprehensive) |
| gender-affirming-care-cost | P2 | ~20 states restrict Medicaid; mirrors abortion's state-fork pattern (critique §1.4) |
| abortion-cost | P2 | State-fork by law (post-Dobbs) |

Not state-forked but should carry state-Medicaid sidebar callouts (per critique §5.3): all dental procedures (state Medicaid dental coverage varies widely).

---

## BUSA Overlap Distribution

| Flag | Count | Topics |
|---|---:|---|
| none | 170 | (default) |
| slight | 7 | ambulance-cost, er-visit-cost, hospital-stay-cost, hospital-birth-cost, nicu-stay-cost, inpatient-rehab-cost, inpatient-mental-health-cost |
| heavy | 0 | — |

`slight` flags applied per critique §3.1: BUSA owns "help paying X bill" intent; CoveredUSA owns "what does X cost." Both ship; cross-link from procedure-cost page to BUSA bill-help page in the calculator/CTA region.

---

## Already-Live / Already-Queued

**Live (3):** mri-cost, ct-scan-cost, colonoscopy-cost

**Queued in CONTENT_INVENTORY (16):**
cataract-surgery-cost, knee-replacement-cost, urgent-care-cost, echocardiogram-cost, mammogram-cost, ultrasound-cost, hip-replacement-cost, upper-endoscopy-cost, physical-therapy-cost, er-visit-cost, c-section-cost, vaginal-delivery-cost, nicu-stay-cost, x-ray-cost, gallbladder-surgery-cost, appendectomy-cost

---

## Critique Findings Applied — Checklist

- [x] **§1.1 Add mohs-surgery-cost** — P1, added with stages I-III + Medicare Part B angle
- [x] **§1.2 Add cardiac-ablation-cost** — P1, ~500K/yr AFib utilization
- [x] **§1.3 Add lithotripsy-cost** — P2, kidney-stone-removal language in title
- [x] **§1.4 Add gender-affirming-care-cost** — P2, state_specific=y
- [x] **§1.5 Add CMP/BMP/troponin/d-dimer lab panels** — cmp=P2, bmp/troponin/d-dimer/urinalysis=P3
- [x] **§2.1 Discard A's google_monthly_volume as independent** — column kept but values renormalized to "extrapolated-bingx6" string flag
- [x] **§2.2 Promote C-section, vaginal-delivery, hospital-stay, NICU, telehealth from P3 → P1/P2** — c-section P1, vaginal-delivery P1, hospital-stay P1, nicu P2, telehealth P2, hospital-birth P2
- [x] **§2.3 Demote LASIK P1 → P2** — applied (brutal competitive field)
- [x] **§2.4 Promote telehealth-visit-cost P3 → P2** — applied
- [x] **§2.5 DEXA stays P1** — confirmed (A was correct)
- [x] **§3.1 BUSA slight overlap flag** — applied to 7 topics (ER, ambulance, hospital-stay, hospital-birth, NICU, inpatient-rehab, inpatient-mental-health)
- [x] **§4 A vs B adjudications** — mammogram/ultrasound/echocardiogram/upper-endoscopy/physical-therapy/dental-cleaning/therapy-session promoted to P1 per B + already-queued + thin-field reasoning
- [x] **§5.3 IVF + gender-affirming flagged state_specific=y** — applied
- [x] **§5.4 ER-visit kept as 5-level CPT fork** — preserved in notes
- [x] **§5.5 Long-tail kept (Priority 3)** — kept all niche surgery rows; not split into P4 bucket (single P3 tier maintained for simpler production sequencing — judgment call, see below)
- [x] **§7.5 Slug-naming convention** — all slugs normalized to `-cost` suffix matching `/cost/[procedure]` route

---

## Judgment Calls on Conflict Rows

**LASIK-cost (A: P1 demand 23,866 / B: P3 / critique: P2):** Took critique's P2 split-the-difference. The Bing demand is real but the field includes LasikPlus, LASIK Vision Institute, Craft Body Scan, Ezra, BetterCare — all spending heavily on AdWords + content. Realistic ROI is small even if we rank top-5.

**IVF-cost (A: P1 / B: P3 / critique: P2):** Same logic as LASIK. Added `state_specific=y` per critique §5.3 (RESOLVE mandate map).

**Therapy-session-cost (A: P3 / B: P1):** Took B's P1. Critique agreed (§4 conflict table) — thin GoodRx coverage + mental-health-parity angle = clean win. Deduped the row (B's slug `therapy-session-cost` matched A's exactly, so only one row in output).

**Dental-cleaning-cost (A: P2 demand 501 / B: P1):** Took B's P1. Bing-citable lookup, thin-competition tail, per critique §4.

**Hospital-stay-cost (A: P3 demand 30 / critique: promote):** Took critique's P1 — demand-score is suppressed by query fragmentation ("hospital stay cost", "hospital cost per day", "inpatient cost", etc.). High-utilization line item with BUSA slight overlap (cross-link opportunity).

**P3 long-tail kept as-is, not split into P4:** Critique §5.5 suggested splitting Priority 3 into a P3 + P4 bucket to make production sequencing explicit. I kept a single P3 tier (85 topics) — production order can be governed by `demand_score` desc within P3 without a separate column. Simpler schema, same outcome. If Jacob wants a hard P4 cut later, easy to add.

**B-only "obvious-50" topics with no Bing data:** Carried at B's stated priority (P1/P2/P3). The "obvious-50" reasoning (GoodRx/SingleCare/CareCredit all have a page on this) is enough signal absent Bing numbers. Demand-score fields left empty for these rows so they don't look quantitatively comparable to A's Bing-validated rows.

**Schema lock-in:** 14 columns final: `topic, title_hint, demand_score, bing_impressions_weekly, google_monthly_volume, utilization_rank, busa_overlap, competitor_density, state_specific, priority, sources, already_live, already_queued, notes`. This schema should propagate to the next template (drug-cost, event-SEP, etc.) per the spec.

---

## Production Sequencing Recommendation

1. **Sprint 1 (P1, already-queued, already-live skipped):** 21 net-new P1 pages to write — anchor the template with these.
2. **Sprint 2 (P1 critique-adds + B-only P1):** mohs, cardiac-ablation + dental specifics, std-test, lipid-panel, a1c, hearing-test, annual-physical, psychiatric-evaluation, therapy-session.
3. **Sprint 3 (P2, top demand_score first):** 52 pages.
4. **Sprint 4 (P3 long-tail):** 85 pages, write-once batch via writer agent.

Bilingual (×2) doubles the page count at any time scale. Per critique §5.1, that's the real production volume.

---

*End of summary.*
