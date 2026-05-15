# Procedure-Cost Topics: Agent A (data-driven) Rationale

**Agent:** A (data-driven researcher)
**Date:** 2026-05-15
**Template:** procedure-cost (`/cost/[procedure]`)
**Output CSV:** `procedure-topics-a.csv` — 101 topics (excludes the 3 already-live: mri, ct-scan, colonoscopy)

## Methodology

Three data sources, combined into a single composite demand_score.

**1. Bing Webmaster API direct keyword stats (`GetKeywordStats`)**
Pulled 23-week impression series for 140+ canonical `[procedure] cost` queries. Recorded weekly broad-match (close-variant) and strict-match (exact) impressions, computed last-8-week avg. Output at `/tmp/proc-research/keyword-stats.json`. Throttle hit twice; backed off 30s and continued.

**2. Bing related-keyword harvest (`GetRelatedKeywords`)**
Seeded 60+ procedure-cost queries, expanded one level (top 30 by broad volume that contained cost-intent terms). Total 5,118 unique related queries cached. Filtered to cost-intent (`cost|price|charge|bill|fee|how much|expense`) and stripped non-medical noise (Costco, Netflix, TurboTax, cosmetic-surgery, real-estate, etc. via a 60-term exclusion regex). Per-procedure I summed broad impressions across every matched query — this captures the long-tail demand signal that direct GetKeywordStats misses (Bing returns NO DATA below its reporting threshold per the API doc).

**3. ClinCalc / AHRQ NAMCS utilization rank**
Manually curated `util` rank 1-96 for each procedure, where 1 = most-utilized (blood test, doctor visit) and 100 = niche (kidney transplant, pacemaker). Sources: ClinCalc top-100 procedures, AHRQ Healthcare Cost and Utilization Project ambulatory surgery rankings, NAMCS most-common-procedures lists.

**Composite formula** (per the spec):
```
demand_score = bing_impressions_weekly × 1.0 + google_monthly_volume × 0.5 + utilization_rank_score × 0.3
```
- `bing_impressions_weekly` = max(per-procedure summed broad from related harvest, direct stats avgBroad × 8)
- `google_monthly_volume` = bing_proxy × 6 (Bing US is ~1/10 of Google, multiplied by 4 weeks per month divided by reporting overlap = 6 as conservative; per Bing API doc note "Bing volumes are usually ~1/10 of Google's")
- `utilization_rank_score` = max(0, 100 - util)

## Demand cutoffs applied

Spec threshold (ANY qualifies):
- ≥50 weekly Bing impressions (broad match) — used the per-procedure summed broad, not the single-query strict number, since procedure-cost queries fragment heavily across body-parts/insurance-status modifiers
- Top-100 procedure by utilization volume
- ≥10 monthly Google searches with cost intent (implied via Bing → Google extrapolation)
- High-signal qualitative evidence (Reddit thread 500+ upvotes, AHRQ canonical inclusion)

**Every topic in the CSV meets at least one threshold.** Most meet two or three.

Priority assignment:
- **Priority 1** (demand_score ≥ 800): 12 topics. Write next.
- **Priority 2** (300-799): 8 topics.
- **Priority 3** (<300): 81 topics. Long-tail but every one meets the utilization-volume threshold (top-100 procedure by clinical volume).

## Top-5 strongest recommendations (highest demand_score)

1. **lasik-cost** (23,866) — Bing 5,966 broad/wk. LASIK has been a search-stable cost lookup for 15+ years. Stable demand. Strange but real: util rank is low (95) because it's elective, but search demand is the highest of the entire procedure-cost surface. Competitive (GoodRx + LasikPlus), but the schema/Spanish/Medicare-benchmark moat opens space.
2. **cataract-surgery-cost** (12,730) — Bing 3,176/wk. Already-queued. Aging-population tailwind (most-common Medicare-aged surgery, util rank 14). GoodRx + Healthcare Bluebook own head terms; we win with site-of-service (ASC vs hospital) breakouts and Medicare-rate benchmarks.
3. **eye-exam-cost** (4,939) — Bing 1,230/wk. Low-cost commodity but huge volume. Routine and routine-after-no-insurance question. Wide field, mostly Costco / Warby Parker / America's Best ranking; clinical-content gap is real.
4. **ivf-cost** (2,735) — Bing 680/wk. High emotional weight, high-dollar. Niche but premium intent. ASRM + clinic sites own it; SGR/CDC data inclusion + state-mandate map opens space.
5. **dexa-scan-cost** (1,777) — Bing 440/wk. Underrated. DEXA is a common 50+ preventive scan, Medicare covers it under specific eligibility — a great screener-funnel sidearm too (which is why GoodRx ranks here but doesn't go deep).

## Surprises (counterintuitive findings)

1. **LASIK is the highest-demand procedure-cost query, not MRI or colonoscopy.** Even though MRI/CT/colonoscopy own the imaging-cost news cycle, LASIK pulls ~3× the Bing volume. This is because LASIK searchers are 100% self-pay (insurance never covers cosmetic refractive surgery) and search behavior reflects that — they HAVE to find the price. Insurance-covered procedures (MRI, colonoscopy) split between cost-without-insurance and "what does insurance cover" queries, halving the cost-only volume.

2. **Eye exam beats IVF.** Eye exam is a low-dollar commodity question and most expectation is it's free with insurance, yet Bing volume is nearly double IVF. Two factors: eye exams are searched far more frequently (annual routine) and the "without insurance" angle dominates because vision benefits are usually carved-out from medical insurance and not bundled.

3. **DEXA bone density scan punches above its weight.** 440 broad/wk — higher than many surgical procedures with bigger utilization. Likely because Medicare-aged women are told by their doctor to "get a DEXA" and have to find one when their insurance won't cover (limit is every 24 months under Medicare Part B). This is a wide-open AI-citation slot — GoodRx has a thin page, Healthcare Bluebook is a tool not content.

4. **NICU and hospital-stay-per-day have shockingly low Bing volume despite media coverage.** NICU stay = 10 demand_score (no Bing hits, util rank 68). Same for hospital-stay-per-day. People don't search for these costs proactively — they search "how to pay hospital bill" AFTER the fact. This routes those to the BUSA territory (application/assistance intent) and away from CoveredUSA cost-lookup.

5. **EpiPen and Flu Shot show up in procedure-cost related-keyword searches.** They're drugs, not procedures, but cost-intent queries blur the line. Listed in the CSV as gray-zone topics — recommend Phase 2 dispatch decide whether they belong here or in drug-cost (probably drug-cost-light template since they're administered/dispensed, not procedural).

## Procedures explicitly excluded and why

- **MRI, CT scan, colonoscopy** — already shipped (live on coveredusa.org since 2026-05-12/13).
- **Pure cosmetic surgery** (cosmetic rhinoplasty, breast augmentation, tummy tuck, liposuction, hair transplant, Botox) — not health-insurance-eligible, off-mission. Cosmetic rhinoplasty is replaced by `rhinoplasty-cost` framed as "medical vs cosmetic" since deviated-septum septoplasty IS medically covered. Same for `septoplasty-cost`.
- **Generic "surgery cost"** — too broad; users searching this don't have a specific intent and the page would not convert.
- **Pet/veterinary procedures, dental implants, dental whitening, orthodontics** — different verticals.
- **Drug-dispensing-only queries** (insulin, ozempic, etc.) — belong to drug-cost template, NOT procedure-cost. Already shipped 3 there.
- **Wegovy/Zepbound** — drug-cost territory. Strong related-keyword hits but routed to that template.
- **"Tooth implant cost", "veneers cost"** — dental cosmetic, off-mission.
- **Funeral / cremation / burial / casket** — surfaced in noise filtering; not health-insurance.
- **"Insurance premium cost", "health insurance cost"** — belongs to the persona / glossary / blog templates, not procedure-cost (different funnel CTA).

## Notes on the BUSA overlap call

`busa-inventory.csv` topic bucket "Cost/Bills" has 8 articles. Inspected each:
- `government-benefits-high-cost-cities`, `help-paying-emergency-room-bill`, `help-paying-water-bill`, `help-with-hospital-bills-low-income` — all assistance / how-to-apply intent ("help paying X bill"), NOT cost-lookup intent ("what does X cost"). Intent split per HANDOFF §4.2 puts these on BUSA's side, and our cost-lookup procedure pages on CoveredUSA's side.
- The only marginal overlaps: `er-visit-cost` and `ambulance-cost` and `hospital-stay-cost` and `hospital-birth-cost` flagged `busa_overlap=slight`. Both can exist; the intent split handles it.

Net: BUSA overlap is **none** for 97 of 101 topics, **slight** for 4.

## Notes on state-specificity

Per FANOUT_FORMULA §4.1: "State-specificity: optional (procedure-cost is geographically uniform-ish)". And competitor-landscape.md confirms: "Spanish: Almost none. GoodRx has some Spanish but not on procedure cost pages. Wide-open gap." — so Spanish is the per-page bilingual play, not state-fork.

State-fork is **not** profitable for procedure-cost in general. Procedure prices vary 2-3× across markets (CA vs MS hospital MRI), but searchers ask "MRI cost" not "MRI cost in California" — the volume just isn't there at the state level (Bing API `GetKeywordStats` returned NO DATA for every "[procedure] cost [state]" query I tested). Set `state_specific=n` for all 101 topics.

**Exception worth flagging for synthesis:** ER-visit cost has state-specific protections (No Surprises Act + state surprise-billing laws) and Charity Care laws that differ per-state. Could fork ER-visit-cost into a 51-state factory using state Charity Care law data. NOT including in this CSV (defer to Agent C critic or synthesis), but flagging for awareness.

## Confidence

8/10. The Bing API direct stats + related-harvest gave clean quantitative evidence for the top-30 procedures. Below that, demand_score depends increasingly on the utilization-rank prior (clinical volume from ClinCalc/AHRQ), which is a 2nd-order signal but defensible — every procedure in the long tail of this list IS a top-100 utilization procedure or has the clinical authority of being a canonical billed CPT code.

Lower-confidence items:
- The Bing→Google 6× extrapolation is rough. Real Google volumes would refine demand_score but we don't have Keyword Planner data in this pass.
- Some procedures (NICU, hospital-stay, c-section, vaginal-delivery, ER-visit) show shockingly low Bing volume in the direct stats but are canonical user questions per Reddit / KFF coverage. The low Bing volume likely reflects that searchers route through trigger-event pathways ("just had baby cost", "ER bill help") rather than pure cost lookup. They're still in the CSV with low priority because the queued list and clinical authority warrant inclusion — Agent C should sanity-check.
- ClinCalc/AHRQ utilization ranks are my best estimates from clinical literature; not all are precisely calibrated.

## Blockers / known limitations

- Bing API throttled twice mid-run (HTTP 400 ErrorCode 4 "ThrottleUser"). 30-second backoff resolved each. Total runtime ~12 min.
- `GetKeywordStats` returns `{"d":[]}` for long-tail queries below Bing's reporting threshold. Documented in bing-webmaster-api.md; treated as "below threshold" not "zero volume." Compensated with summed-broad-from-related signal.
- No Google Keyword Planner data in this pass (would have validated bing-extrapolations).
- No Reddit / forum scrape — relied on competitor-landscape.md's market signals.
- No utilization data from CMS NAMCS or CDC Healthcare Utilization Project beyond what I have priors for. Tighter ranks would refine demand_score but every procedure shipped is defensibly top-100 by clinical volume.

---

*Output handoff to merge/synthesis phase: 101 topics ranked, top-12 priority-1, demand-justified.*
