# Persona Topics — Adversarial Critique

**Date:** 2026-05-15
**Inputs:** persona-topics-a.csv (101 rows, data-driven) + persona-topics-b.csv (130 rows, coverage) + both rationale docs
**Posture:** brutal. Persona is the highest-leverage template (8/8 Bing-validated; competitor-landscape §6 calls it HIGH leverage). Don't ship something with obvious holes.

---

## 1. Top 5 missing personas

These are absent from BOTH lists OR present at far-too-low priority. Each has demand evidence + a unique funnel angle (revenue path: ctaTarget=screener).

1. **caregivers-aging-parents (boomer + sandwich-gen, not "family caregivers" generic).** A has `caregivers` at priority=2 demand=260; B has `caregivers` at priority=2. AARP = 53M unpaid caregivers, sandwich-gen searches "health insurance my mom" / "do I keep my plan if I quit to care for parent" are dense. BUSA has 4+ caregiver articles (Other/Mixed) — those are SNAP/SSI angle. The HEALTH-INSURANCE-coverage-while-I-care angle is unowned. Promote to priority=1.

2. **just-quit-to-start-business (different from `just-laid-off` and `between-jobs`).** Voluntary-exit cohort has different SEP triggers (no involuntary-loss SEP — only loss-of-MEC SEP) and they're solving "do I get COBRA, marketplace, or both." This is a high-tax-angle persona (most-likely 1099 path next). Neither list has it.

3. **dependents-aging-off-26 (turning-26 is in event template, not persona).** B has `recent-grads` at p1 but not "26-year-olds dropping off parent plan" as a persona — distinct from college-grad. Bing data behind turning-26 cohort is dense (~22 weekly broad on `health insurance turning 26`). Persona variant pairs with event-template page; cross-link both.

4. **rural-residents.** B has it at priority=2 medium, A has it MISSING entirely. KFF has dedicated rural-health content. Plan-availability + carrier-density × state is a real fork — 46M Americans rural per Census. Strong state-fork candidate (rural × non-expansion state = double-pressure).

5. **dual-eligibles (Medicare + Medicaid).** B has it at priority=1 demand=N/A; A doesn't list it cleanly (only `elderly-non-dual-eligible` at priority=3, which is the inverse). 12M dual-eligibles, D-SNP shopping is high-revenue (Medicare commission $694), KFF + CMS source-density is strong. Promote dual-eligibles to priority=1.

**Honorable mentions** (real gaps but lower-priority): incarcerated-reentry (B has it; A missing — strong state-Medicaid-reentry angle, 600K released/yr), homeless (B priority=2; A missing — HRSA + Medicaid sign-up at shelters is real demand), foster-youth-aging-out (B priority=2; A priority=3 — Medicaid-to-26 ACA provision is genuinely underexposed; promote to p2).

---

## 2. Top 5 demand-score corrections (Agent A only — B has no demand_score values)

A's `demand_score` formula appears to mash bing-related universe volume into a composite that over-rewards brand-aware platform queries. Spot-checked 10 high-scored rows. Five are clearly wrong:

1. **instacart-shoppers demand=4120.** A cites "bing-related(1141168)(instacart)" as primary input. That's INSTACART THE PLATFORM, not "health insurance for instacart shoppers." 99% of the 1.1M is grocery-shopper intent, not coverage-shopper. True health-coverage demand ~150-400. Correct demand to ~400.

2. **doordash-uber-drivers demand=2890.** Same issue. 86K on "doordash delivery" is food-ordering intent, not driver-coverage. Correct to ~600-900 (actual driver-coverage signal exists but is one-tenth of the cited number).

3. **seniors-medicare-eligible demand=9100.** A correctly flags this overlaps with MA-state pages but still ranks it. The cited 701K + 680K + 33K on "senior" / "seniors" / "insurance for seniors" is mostly MA-shopping intent that the MA-state factory already owns. Persona page would cannibalize. Either demote to priority=3 OR redirect to MA-state. Don't write a persona page here.

4. **entrepreneurs demand=1240.** Cited "bing-related(38391)(entrepreneur)" — 38K on the WORD "entrepreneur" is brand/news/inspiration intent (Forbes lists, Inc. Magazine). Almost zero is coverage-shopping. Correct to ~200-400 and merge with startup-founders.

5. **veterans demand=2400.** Cited 394K on "veterans" — most of that is benefits/jobs/news, not coverage. Real coverage demand is probably 600-1200 (still high). The persona is still priority=1 but the number is inflated by ~2x. Note: this doesn't change ranking but should change the demand_score normalization.

**Methodology fix:** A's demand_score should DISCOUNT brand-aware universe volume by ~80% when the seed brand has dominant non-coverage intent (Instacart, DoorDash, "entrepreneur", "veterans" the word). Otherwise the top-10 is just a brand-popularity ranking.

---

## 3. Top 5 BUSA-overlap corrections

A defaults to `slight` for everything that has any BUSA persona article. B defaults to `none` more aggressively. Both miss real overlaps because BUSA inventory is benefits-application, but a few articles ARE health-insurance-coverage and cross the intent split.

1. **self-employed → BUSA overlap should be HEAVY, not slight.** BUSA has `can-self-employed-get-benefits` (5-12-2026) + `self-employed-government-benefits` (3-15-2026) + others. The CoveredUSA `/for/self-employed` page is already LIVE — but if a new article is contemplated, it's a dupe risk. A correctly marks LIVE; B's `self-employed` row should be marked LIVE-skip explicitly.

2. **caregivers / caregivers-paid → HEAVY, not slight.** BUSA has 4+ caregiver articles: `benefits-for-family-caregivers`, `government-benefits-for-caregivers-elderly-parents`, `government-benefits-for-family-caregivers`, `kinship-caregiver-benefits`. The intent split holds (BUSA = SNAP/SSI/programs, CoveredUSA = health-insurance), but the surface area is dense — a CoveredUSA persona page must explicitly own "health insurance while caregiving" not "benefits for caregivers." A's `slight` flag is borderline; reclassify the title as `health-insurance-while-caregiving` and keep slight, otherwise heavy.

3. **gig-workers / 1099-contractors → BUSA overlap is HEAVIER than slight.** BUSA has `government-benefits-gig-workers`, `gig-economy-income-affects-benefits`, `snap-eligibility-gig-workers-uber-drivers`, `unemployment-benefits-gig-workers`. Intent split applies but it's a contested surface. CoveredUSA's existing live `/for/gig-workers` page is on stable ground; new variants (doordash-uber-drivers, instacart-shoppers, amazon-flex-drivers) are clear and should stay `slight`. Confirm A's flags hold.

4. **veterans → BUSA overlap is real (slight → flagged-but-real).** BUSA has `va-aid-and-attendance-vs-medicaid-home-care`, `va-disability-rating-changes-2026`, `veteran-spouse-benefits-derivative`. All adjacent. The CoveredUSA "VA + Marketplace + TRICARE stack" angle is distinct — keep slight, but note in writer prompt: don't duplicate VA-disability-rating content.

5. **low-income-workers → HEAVY (B got it right; A marked slight).** BUSA owns the low-income-workers SNAP/Medicaid surface densely. CoveredUSA priority=2 on this is probably too high; demote to priority=3 OR re-angle as "Medicaid coverage gap" (which is a distinct topic per B's `medicaid-gap-residents`).

---

## 4. Three surprises

1. **Both A and B undercount the 2026 subsidy-cliff persona.** A flags 31 personas as subsidy-cliff-hit but doesn't carve "subsidy-cliff-survivors / Above-400%-FPL" as a STANDALONE persona. B has `abp-aboveallcoverage-cliff` at priority=1 — that's actually the right call. A should adopt this. Subsidy cliff is the single biggest 2026 news-cycle persona and "I make $130K, what do I do" is a high-revenue query.

2. **State-fork breadth is HUGE and both lists undershoot.** A lists 8 state-specific personas. B lists 14. Real candidates per FANOUT §4.7 + §5.1 logic: gig-workers (CA AB5, NY new rules), self-employed (5 top states), truckers (DOT base state), farmers (Farm Bureau by state), DACA/undocumented (CA/NY/IL/OR), Medicaid-gap (10 non-expansion states), trans-non-binary (state coverage bans), realtors (state license/brokerage), rural (state plan availability). Conservative: 9 personas × 51 states = 459 pages. Aggressive (per B's analysis): 14 personas × 51 = 714 pages. Either way, persona × state is the BIGGEST volume lever in this template after the base persona list.

3. **Niche occupations with strong tax angle are systematically priority=3 when they should be priority=2.** Realtors (1.5M NAR), truckers (2M, owner-op concentration), farmers (2M operators), cosmetologists (700K booth-renters), photographers (150K), fitness trainers (450K) — all 1099-heavy with SE deduction + subsidy interplay. A puts them at priority=3 "long-tail"; B is more generous. These ARE the high-intent commercial-shopping queries — fewer competitors AND clearer monetization. Promote the top-tier (realtors, truckers, farmers, cosmetologists, fitness trainers) to priority=2 and ship with state-fork variants.

---

## 5. A vs B priority adjudications (top 10 conflicts)

| Topic | A priority | B priority | Critic verdict | Reason |
|---|---|---|---|---|
| veterans | 1 | 1 | **1** | Both right. Highest single-persona opportunity. |
| dual-eligibles | not listed cleanly | 1 | **1 (adopt B)** | A missed; 12M cohort, D-SNP shopping = Medicare revenue. |
| early-retirees-pre-65 | 1 | 1 (early-retirees) | **1** | Both agree (A's row); B's `early-retirees` is the LIVE page — flag dup. |
| seniors-medicare-eligible | 2 | 2 (seniors-over-65) | **3 / skip** | Cannibalizes MA-state factory. Either don't write or aggressively cross-link to MA-state. |
| farmers-ranchers | 2 | 1 (farmers separately) | **1** | B is right. 2026 premium-quadrupling story + Farm Bureau state-fork = strong. |
| realtors | 2 | 1 | **1** | B is right. 1.5M NAR, fragmented competition, state-fork ready. |
| truck-drivers | 2 | 1 (truckers) | **1** | B is right. 2M cohort, DOT-state fork, owner-operator tax angle. |
| children-kids | 1 | 1 (multiple variants) | **1** | Both agree. Promote state-CHIP-brand factory variant (state-fork). |
| caregivers | 2 | 2 | **1** | Promote per §1.1 above. Sandwich-gen + AARP-53M is dense. |
| daca-recipients | 2 | 1 | **1** | B is right. 2026 CMS rule + state-fork = news-cycle goldmine. |
| 1099-contractors | 1 | 1 | **1** | Both agree; already queued. |
| onlyfans-creators | not listed | 2 | **3 (don't ship from main persona surface)** | B's call to include is fair, but brand-safety + lead-quality concerns; defer. |
| stay-at-home-moms | 2 | 2 (stay-at-home-parents) | **2** | A's intent-split warning is correct — needs SUBTYPE DISPATCH (Medicaid-spouse-income vs marketplace-under-spouse). |

**Net effect of adjudication:** ~15 topics move up to priority=1 (B's list bias was correct on niche-occupational + identity/status personas; A's list bias was correct on data-validated demand at the top of the funnel).

---

## 6. Verdict + confidence

**Verdict:** The merged A+B list is comprehensive enough to BEGIN bulk publish, but needs three structural fixes before drip-cron pickup:

1. **Demand-score normalization in A.** Discount brand-aware universe volume (Instacart, DoorDash, "veterans" the word) by ~80%. Otherwise the ranking is contaminated by non-coverage intent.
2. **Promote the 5 missing personas** (caregivers-aging-parents, just-quit-to-start-business, dependents-aging-off-26, rural-residents, dual-eligibles) into priority=1/2.
3. **Carve the subsidy-cliff-survivor persona** as a standalone priority=1 topic (B has it; A doesn't). 2026 news cycle requires it.

**State-fork expansion** is the volume multiplier — recommend committing to 9 persona × 51 state = 459 pages as Phase 2 after base list ships. This is the single biggest output of the template per FANOUT §4.7 + §5.1.

**Confidence:** MEDIUM-HIGH. Persona surface is fragmented and both researchers had partial visibility (A had quantitative blind spots on intent purity; B had qualitative blind spots on tax/cliff specifics). The merged list with these fixes lands in the top quartile of credible persona roadmaps for this space. Brutal honest read: ship base list, but don't claim "comprehensive" until the state-fork factory is also in the queue.

---

*~200-word final report in next message.*
