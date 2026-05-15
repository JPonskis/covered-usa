# Procedure-Cost Topics: Adversarial Critique

**Critic:** Agent C (ruthless adversarial mode, Ralph verification)
**Date:** 2026-05-15
**Inputs reviewed:**
- `procedure-topics-a.csv` (101 rows) + `procedure-topics-a-rationale.md`
- `procedure-topics-b.csv` (120 rows) + `procedure-topics-b-rationale.md`
- `FANOUT_FORMULA.md` §4.1
- `competitor-landscape.md` §1 Procedure Costs
- `CONTENT_INVENTORY.md`
- `busa-inventory.csv` (full scan for cost/procedure rows)

**Headline:** Lists are broad but B's "obvious-50" frame missed several heavy clinical clusters that GoodRx, SingleCare, and Healthline absolutely cover. A's demand_score is methodologically inflated (see §2). The union (~155 unique topics after slug-normalization) is solid as a base but needs the additions in §1 to be defensible as "comprehensive."

---

## 1. Top 5 Missing Topics (with evidence)

These are absent from BOTH A and B (after normalizing slugs like `vasectomy` ≡ `vasectomy-cost`). Each is a real demand cluster competitors monetize today.

### 1.1 mohs-surgery-cost — MISSING

**Evidence:** Mohs micrographic surgery is the dominant skin-cancer treatment in the US (~876,000 procedures/year per American College of Mohs Surgery). GoodRx, Healthline, and CostHelper all have Mohs cost pages. Self-pay cost runs $1,000–$4,000+ per lesion, high-anxiety query, classic "without insurance" + "Medicare coverage" + "stage" splits. B includes `skin-cancer-screening` and `mole-removal` but skips the actual surgical treatment, which is the high-dollar question. A has `mole-removal-cost` (priority 3, demand 270) but no Mohs.
**Recommended:** Priority 1. Add `mohs-surgery-cost` with Stages I/II/III breakdown + Medicare Part B coverage angle.

### 1.2 cardiac-ablation-cost (catheter ablation for AFib) — MISSING

**Evidence:** ~500,000 catheter ablations/year in the US, growing 15%/yr with AFib prevalence. Without-insurance cost is $25,000–$80,000. GoodRx and Healthline both have ablation cost pages. A has `cardiac-cath-cost` (catheterization, demand 17) and `pacemaker-cost` (demand 2) but skips the ablation — which is far more searched than either. Strong analyzer-funnel fit (huge bill question).
**Recommended:** Priority 2.

### 1.3 lithotripsy / kidney-stone-removal-cost — MISSING

**Evidence:** Kidney stones affect ~600,000 Americans/year requiring intervention; ~150,000 ESWL (shockwave lithotripsy) procedures/year. GoodRx has a lithotripsy cost page; Cura4U and BillArmor both target this query. Self-pay $7,000–$15,000. Common ER follow-up cost question (high analyzer-funnel intent).
**Recommended:** Priority 2 — `lithotripsy-cost` or `kidney-stone-treatment-cost` (latter is more user-language).

### 1.4 gender-affirming-care-cost (top surgery / bottom surgery / HRT) — MISSING AND STATE-SPECIFIC

**Evidence:** Both lists totally omit this cluster. Per HHS and Williams Institute, ~1.6M US adults identify as trans; coverage varies dramatically by state and insurer. Top surgery $9,000–$13,000 self-pay; bottom surgery $20,000–$50,000+; HRT $30–$80/mo. GoodRx covers HRT cost. The query has explicit state-fork demand because ~20 states restrict or ban Medicaid coverage of gender-affirming care for adults (FL, TX, MO, etc.) while others mandate it (CA, OR, NY). Direct parallel to abortion's state-fork that B correctly flagged.
**Recommended:** Priority 2 with `state_specific=y`. Sub-topics: `top-surgery-cost`, `hrt-cost` at minimum.

### 1.5 individual lab panels: CMP, BMP, troponin, D-dimer, urinalysis — UNDER-COVERED

**Evidence:** A has `blood-test-cost` umbrella (demand 606) and `urinalysis-cost` (demand 18, priority 3). B has `cbc-test`, `a1c-test`, `lipid-panel`, `thyroid-test`, `vitamin-d-test`, `prostate-psa-test`. But the highest-volume ER-bill lab queries — CMP (comprehensive metabolic panel), BMP (basic metabolic panel), troponin (cardiac), D-dimer (DVT/PE rule-out) — are missing from both. These are line items on virtually every ER bill and the canonical analyzer-funnel question ("what is this CMP charge?"). LabCorp and Quest both publish their cash-pay prices for each individually.
**Recommended:** Priority 1 for `cmp-test-cost` and `bmp-test-cost`; Priority 2 for `troponin-test-cost` + `d-dimer-test-cost`. Strong analyzer fit since these dominate ER itemized bills.

**Honorable mentions** (would be top 5 in a longer list): pain-management injections (epidural steroid spine injection ~9M/yr, facet block, trigger point) → all absent; labor-induction-cost (separate from delivery; ~30% of US births are induced) → absent from both; second-opinion-consult-cost (telehealth boom) → absent; annual-wellness-visit-medicare → absent (different CPT than B's annual-physical); fluoroscopy / bone-scan / nuclear-stress-test / myelogram (imaging long-tail) → absent.

---

## 2. Top 5 Demand-Score Corrections

### 2.1 [METHODOLOGY FLAW] Agent A's `google_monthly_volume` is not an independent data source

**Evidence:** A's rationale §Methodology states `google_monthly_volume = bing_proxy × 6`. Spot-check: cataract row has bing=3,176 and google=19,056 (= 3,176 × 6). Eye-exam: bing=1,230, google=7,380 (= 1,230 × 6). Every single row follows this rule. The composite formula `bing×1 + google×0.5 + util×0.3` therefore reduces to `bing × 4 + util_bonus` — the spec required ≥2 independent data sources per topic but A is double-counting one source.
**Impact:** Doesn't change rank order materially within Priority 1 (the top 12 are still the top 12), but the absolute `demand_score` numbers are inflated ~4× vs reality and should not be treated as quantitative. Phase 4 merge should renormalize or relabel.

### 2.2 c-section-cost — UNDERSCORED (Priority 3 → Priority 1)

**Evidence:** A scores `c-section-cost` at 28 (Priority 3) because Bing direct stats returned no data. But ~1.16M C-sections/year (32% of US births), GoodRx + KFF + Healthline all rank for this, real-user Reddit threads in r/BabyBumps and r/Mommit constantly ask the question. The low Bing number reflects query fragmentation ("c-section cost", "c-section cost without insurance", "c-section out of pocket", etc.) — not lack of demand. A's own rationale §99 flags this exact concern.
**Recommended:** Promote to Priority 1. Same for `vaginal-delivery-cost`, `hospital-birth-cost`, `nicu-stay-cost` — all are buried at demand 27-30 in A.

### 2.3 lasik-cost — POTENTIALLY OVERSCORED + COMPETITIVELY BRUTAL

**Evidence:** A ranks LASIK #1 at demand 23,866. The Bing number (5,966 broad/wk) is real and reflects the unique 100%-self-pay nature of the procedure. BUT competitor-landscape.md and B's rationale both flag LASIK as "brutal AdWords + SEO market" dominated by LasikPlus, LASIK Vision Institute, GoodRx. B correctly tags it Priority 3 for that reason.
**Recommended:** Keep on the list but downgrade ROI expectation. Priority 2 not Priority 1 — write it for completeness, don't expect to rank #1. The expected CoveredUSA citation lift here is much smaller than for, e.g., a Mohs page where the field is thin.

### 2.4 telehealth-visit-cost — UNDERSCORED

**Evidence:** A scores 24 (Priority 3). But post-pandemic, telehealth utilization is at ~17% of all outpatient visits per CMS. GoodRx + SingleCare both have telehealth cost pages. ATA + KFF publish on it heavily. Should be Priority 2 minimum, especially given the analyzer-funnel fit (low-cost option page → conversion).
**Recommended:** Promote to Priority 2.

### 2.5 dexa-scan demand — A is right but B underweights

**Evidence:** A says DEXA (440 broad/wk) is "underrated" and Priority 1. B has `bone-density-dexa` at Priority 2. A is correct here per the Bing data + the Medicare coverage angle (Part B every 24 months) which is screener-adjacent. Trust A; Phase 4 should resolve to Priority 1.

---

## 3. Top 5 BUSA-Overlap Corrections

I scanned `busa-inventory.csv` for every cost/bill/hospital/procedure row. **Both A and B correctly flagged `busa_overlap=none` for ~all topics.** BUSA's "Cost/Bills" bucket has only 8 rows and they're all assistance/charity-care intent ("help paying X bill"), not cost-lookup intent. The intent split holds.

**Soft corrections (potential `slight` flags A and B both set as `none`):**

### 3.1 er-visit-cost / ambulance-cost / hospital-stay-cost — should be `slight` not `none`

**Evidence:** A's rationale §Notes admits these 4 are "marginal overlaps" with BUSA's `help-paying-emergency-room-bill`, `help-with-hospital-bills-low-income`. A then sets them to `none` anyway in the CSV. Inconsistency. Per HANDOFF §4.2 intent split, BUSA owns the "help paying" intent and CoveredUSA owns the "what does it cost" intent — both can exist, which is exactly what `slight` means. The flag should be `slight`, not `none`.
**Recommended:** Flag `er-visit-cost`, `ambulance-cost`, `hospital-stay-cost`, `hospital-birth-cost`, `nicu-stay-cost`, `inpatient-rehab-cost` as `slight` (BUSA covers the bill-help angle; CoveredUSA covers the price-lookup angle). No skip required.

### 3.2 c-section-cost / vaginal-delivery-cost — `none` is correct but flag for cross-link

**Evidence:** BUSA has `benefits-for-families-with-twins` and `pregnant-no-health-insurance` (cross-published on CoveredUSA blog actually). Not procedure-cost overlap, but procedure-cost pages should cross-link to BUSA's pregnancy benefits as the next-step. Operational note, not an overlap correction.

### 3.3 dialysis-cost — `none` is correct but cross-link to BUSA SSDI page

**Evidence:** BUSA has `ssdi-for-kidney-disease-dialysis`. Different intent (disability-application vs cost-lookup). No overlap. Flag for cross-link only.

### 3.4 hospital-stay-cost vs `help-with-hospital-bills-low-income` — same as 3.1 above

**Already covered.**

### 3.5 charity-care-cost / hospital-bill — N/A, CoveredUSA already covers via blog, not procedure template

**Evidence:** `charity-care-vs-medicaid` and `hospital-charity-care-501r-forgiveness` live on CoveredUSA blog (per CONTENT_INVENTORY.md). Both lists correctly avoided putting "hospital bill" or "charity care" in the procedure template since they're flow/help content, not cost-lookups.

**Net:** BUSA overlap calls are 95% correct. ~6 rows should flip `none` → `slight` for documentation accuracy but the action (write the CoveredUSA version) is unchanged either way.

---

## 4. A vs B Priority Adjudications (Top 10 conflicts)

After slug-normalizing (treating `mammogram` ≡ `mammogram-cost`, etc.):

| Topic | A Priority | B Priority | Adjudication | Reason |
|---|---|---|---|---|
| mammogram | 2 | 1 | **1** | Already queued + screening-vs-diagnostic fork is real Bing demand |
| ultrasound | 2 | 1 | **1** | Already queued + classic Bing-citable lookup |
| echocardiogram | 2 | 1 | **1** | Already queued |
| upper-endoscopy | 3 | 1 | **1** | Already queued + B is right that this is a top-volume GI procedure |
| physical-therapy | 3 | 1 | **1** | Already queued + huge per-session cost question |
| urgent-care-visit | 1 | 1 | **1** | Both agree |
| vasectomy | 1 | 1 | **1** | Both agree; A confirms 1,139 demand via Bing |
| dental-cleaning | 2 | 1 | **1** | B is right — classic Bing-citable lookup; A's util-rank-driven score underweights |
| lasik | 1 | 3 | **2** | A's Bing data wins (real 5,966/wk) but B's competitive reality check matters; split the difference |
| ivf | 1 | 3 | **2** | Same logic as LASIK; real demand but brutal field |
| therapy-session | 3 | 1 | **1** | B is right — mental-health-parity angle + thin GoodRx coverage = clean win |
| std-test | (absent) | 1 | **1** | B-only addition; high-intent query, thin field, add it |
| psychiatric-evaluation | (absent) | 1 | **1** | B-only; thin SEO field, real demand |
| heart-bypass | 3 | 3 | **3** | Both agree — brutal field |
| pet-scan | 2 | 2 | **2** | Both agree |

**Pattern:** Where A and B disagree, A is over-trusting raw Bing volume (puts LASIK/IVF at P1 despite the saturation) and under-trusting "thin-competition" plays that B identifies (therapy, dental-cleaning, dental-filling). B is over-trusting "obvious-50" intuition for some saturated topics. Merged ruling: trust B's competitive-density read, trust A's Bing data for tail rank-ordering.

---

## 5. Surprising Findings (where both A AND B missed/overshot)

### 5.1 The "Spanish twin" is on every page but no separate Spanish-only topic in either list

**Finding:** Both lists treat Spanish as a per-page bilingual play (per FANOUT_FORMULA §4.1 + competitor-landscape "wide-open gap"), which is right operationally. But this means the actual page count for production is 2× whatever these lists say. Phase 5 (TOPIC_ROADMAP synthesis) should make this explicit — 155 unique topics × 2 locales = ~310 pages from this template alone.

### 5.2 Both lists missed the "did this procedure cause an upcoded ER bill" analyzer-funnel angle

**Finding:** A and B both list procedures as pure cost-lookup. Neither lists the CPT-decoder pages (`what is CPT 99284`, `what is CPT 99285`) which are already in CONTENT_INVENTORY queue as blog rows (CU-306, CU-307). The procedure pages and the CPT-decoder blogs should cross-link aggressively — Phase 5 should call this out.

### 5.3 Both lists treated state-fork as binary instead of identifying the partial-fork procedures

**Finding:** B correctly identified abortion as state-fork. Both missed IVF (~21 states have insurance mandates per RESOLVE; CA, IL, NY, MA, NJ have comprehensive mandates), gender-affirming care (~20 states restrict Medicaid), Medicaid dental coverage (varies by state — relevant to all dental procedures), and abortion-adjacent procedures like D&C-for-miscarriage (legality varies post-Dobbs). These warrant `state_specific=y` either as 51-state forks or as a "key state callout box" in the body.
**Recommended:** Flag IVF + gender-affirming as `state_specific=y`. Add state-Medicaid-dental sidebar to all dental cost pages.

### 5.4 ER-visit-by-CPT-level is a unique fork B identified that A missed

**Finding:** B's `er-visit-cost-by-level` (CPT 99281-99285) is a smart fork that matches the queued CU-302/306/307/310 blogs. A has only `er-visit-cost` as a single page. The 5-level fork is the actual analyzer-funnel structure (since bill analyzer surfaces CPT levels). Phase 4 merge should keep the 5-level expansion, not collapse to one page.

### 5.5 Both overshot on niche surgery long-tail at Priority 3

**Finding:** A has 80+ Priority-3 topics with demand_score < 30 (e.g., `colposcopy-cost` at 7, `adenoidectomy-cost` at 6, `endometrial-ablation-cost` at 6). These are real procedures but the demand_score below 30 = "no Bing signal + low utilization." Many will never get organic traffic. Phase 4 should consider whether the long tail justifies a write-once-and-forget approach (still worth it for AI-citation, near-zero opportunity cost on Claude monthly plan) or whether to trim.
**Recommended:** Keep them (Jacob's "win-the-space, NO CAP" rule applies) but set them as Priority 4 / "long-tail batch" to make production sequencing explicit.

---

## 6. Year-Anchor + State-Specific Audit

**Year-anchor (2026):** A's titles all include "in 2026" ✓. B's titles all include "in 2026" ✓. No drift found. (B's `prescription-glasses-vs-contacts` title — "Prescription Glasses vs Contact Lenses Cost in 2026" — passes.)

**State-specific underflagging:**
- A: 0 of 101 topics flagged `state_specific=y`. A correctly identifies this in rationale §State-specificity (procedure cost is geographically uniform-ish).
- B: 1 of 120 (`abortion`). Correctly identified.
- **Missed state-forks:** IVF, gender-affirming care (see §5.3 above), dental procedures (state Medicaid dental coverage varies).

---

## 7. Verdict

**Confidence the merged A+B+critique list is comprehensive: 7.5/10.**

**Why not higher:**
- 5 real missing topics (mohs, cardiac-ablation, lithotripsy, gender-affirming, individual lab panels) — fixable with the §1 additions.
- A's demand_score methodology has the double-counting flaw (§2.1) — fixable by renormalizing or dropping `google_monthly_volume` as a separate column.
- ~6 high-volume topics (C-section, vaginal-delivery, hospital-stay, NICU, telehealth) are buried at Priority 3 due to Bing query fragmentation — fixable with the promotions in §2.
- State-fork is underflagged for IVF + gender-affirming care.

**Why this high:**
- The union (155 unique normalized slugs) is genuinely broad and covers all 8 of B's "obvious-50" anchor categories plus A's Bing-validated tail.
- Cross-reference with BUSA is correct (95%+).
- Year anchors uniform at 2026.
- Already-queued/already-shipped cross-references handled correctly.

**After the §1 additions + §2 corrections + §5.3 state-flag updates apply, confidence rises to 9/10.** The remaining 1 point is reserved for unknowable long-tail demand we'd only learn from shipping and watching Bing AI Performance Reports (per HANDOFF §7.2 calibration plan).

**Explicit gaps Phase 4 must resolve:**
1. Drop or rename A's `google_monthly_volume` column to clarify it's a bing-derived proxy, not independent data.
2. Add the 5 missing topics from §1 with priorities specified.
3. Promote 6 buried Priority-3 topics from §2 (C-section, vaginal-delivery, hospital-stay, NICU, telehealth, dental-cleaning).
4. Set `state_specific=y` on IVF + gender-affirming care.
5. Reconcile the slug-naming inconsistency between A (`-cost` suffix) and B (no suffix) — pick one canonical form (recommend `-cost` suffix to match A and the existing live `/cost/[procedure]` route pattern).

---

*End of critique. ~1,950 words.*
