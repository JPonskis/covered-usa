# CoveredUSA Medicare Advantage — State Template Topic Synthesis

**Date:** 2026-05-15
**Synthesizer:** Frank
**Inputs merged:** ma-state-topics-a.csv (43), ma-state-topics-b.csv (43), ma-state-adjacent-templates.csv (12), ma-state-topics-critique.md
**Already-live (excluded):** CA, TX, WY, FL, NY, MI, OH, PA (8 states)
**This template covers:** 43 remaining states + DC = 51-state cluster

---

## 1. Final 43-state sequencing

### Tier 1 — 10 states (coordinated batch, drip-publish 2-3/day across ~3 weeks)

Ordered by top-10 sequencing priority:

1. **Georgia** — 1.75M elig × 55% pen. Top MA shopper pool not yet shipped. Kaiser-GA defensible answer. Partial Spanish (Atlanta).
2. **North Carolina** — 2.05M elig × 55% pen. Largest total enrollment of unshipped states.
3. **Illinois** — 2.05M elig × 50% pen. Highest absolute Medicare pop remaining + strong Spanish twin (Chicago). *Penetration adjudicated 50% (A's 41% was stale, B's 55% was 2025 projection — KFF 2024 puts IL at ~50%).*
4. **Arizona** — 1.45M elig × 56% pen. Latino strength → Spanish twin double-count via AI-citation surface.
5. **Tennessee** — 1.34M elig × 59% pen. Highest Tier-1 penetration. TennCare brand.
6. **Virginia** — 1.5M elig × 49% pen. DC-metro adjacency.
7. **New Jersey** — 1.55M elig × 46% pen. Largest unshipped Northeast. Spanish opportunity.
8. **Indiana** — 1.32M elig × 50% pen. **Adjudication win:** A undervalued IN; ~660K MA shoppers beats OR's 460K. HIP brand.
9. **Massachusetts** — 1.3M elig × 46% pen. Big pool, lower penetration. MA-vs-Medigap guaranteed-issue state.
10. **Washington** — 1.42M elig × 49% pen. Pacific NW lead. Kaiser-WA strength. MA-vs-Medigap guaranteed-issue state.

### Tier 2 — 13 states

OR, MO, MD, WI, MN, CT, KY, LA, AL, CO, AR, SC, OK

*OR demoted from A's Tier 1 (smaller pool than IN). CO promoted into Tier 2 head for Spanish bonus. OK included per merge instructions.*

### Tier 3 — 20 states

NV, IA, UT, NM, MS, ID, NH, ME, RI, MT, DE, WV, HI, NE, KS, DC, ND, SD, VT, AK

**Ship-last cohort:** VT (1 plan available per KFF 2026) and AK (0 plans) — these pages exist for citation surface, not conversion. Narrative shape: "MA barely exists here, consider Medigap."

### Penetration data source

Used **B's 2025-vintage penetration percentages × A's 2024 enrollment totals**. Adjudications per critique §3.2:
- IL → 50% (not A's 41% or B's 55%)
- MA → 46%, NJ → 46%, IN → 50%, WA → 49%, OR → 53%, AL → 57% (B fresher than A)
- GA → 55% (CMS 2024 verified; B's 57% was projection)
- TN → 59% (agreement)

---

## 2. DC and PR handling

### DC — included as 51st page (Tier 3, late)

~90K Medicare eligibles, ~49% MA penetration. Tiny but:
- NerdWallet sometimes skips, MedicareGuide thin → competitor density genuinely drops
- 100% urban Medicare pop with strong commercial intent
- Bing AI-citation upside in DC-localized grounding queries

**Do NOT fold DC into MD or VA** — that's the competitor pattern, and breaking it is a (small) differentiation move.

### PR — EXCLUDED from this template

**PR side-quest:** ~70% MA penetration (highest in the country), ZERO competitor coverage in English/Spanish, separate CMS rules (no Part B premium subsidization parity, separate plan filings). Spanish-first audience.

**Handle separately:** Standalone single-page opportunity at `/medicare-advantage/puerto-rico` (or `/es/medicare-advantage/puerto-rico`). Not part of this 51-state factory. ~$30 of writer time. Surface to Jacob as a discrete side-quest.

USVI / Guam / American Samoa / CNMI — skip permanently. Medicare-eligible populations too small.

---

## 3. Adjacent templates — trimmed ROI ranking

Final 6-template roadmap (trimmed from B's 12 → ~300 pages total vs B's 686):

| ROI | Template | Pages | Why |
|---|---|---|---|
| 1 | **Spanish twin** | 51 | ZERO competitor coverage. Writer already produces ES. Lowest-competition adjacency by far. Bilingual is the moat. |
| 2 | **Persona × state MVP** | 50 | Top 5 personas (veterans, dual-eligibles, diabetics, low-income, Spanish-speakers) × top 10 states. Higher lead quality. Almost no competitor coverage. |
| 3 | **Curated county pages** | 50 | Top 5 counties × top 10 states (NOT all 3,000). Beats MedicareAdvantage.com's scale-thin model. Deferred behind persona×state — lower lead quality. |
| 4 | **D-SNP × top-30 states** | 30 | Trimmed from B's full 153-page SNP build. Heavily concentrated in 20-30 states. Skip institutional/chronic-condition SNP-by-state — federal rules thin in state context. |
| 5 | **MA-vs-Medigap × 7 guaranteed-issue states** | 7 | NY, CT, MA, ME, OR, CA, MO only. Other 44 states are federal-rule rehashes → anchor sections in main state page. |
| 6 | **Carrier × state trimmed** | 60 | Top 5 carriers (UHC, Humana, Aetna, Cigna, Anthem) × 12 highest-population states. Trimmed from B's 255. Kaiser-state (9 states) is separate side-quest. |

**Deferred / skip:** Star Ratings, $0-premium, AEP, Dental, LEP, Late-Enrollment — all anchor sections inside main state pages, not forked URLs. Non-Spanish language pages defer indefinitely. County × persona compounds defer to Phase 4+.

### Total MA-cluster page count

- **51 EN state pages** (43 new + 8 already-live)
- **51 ES state twin** (Spanish)
- **50 persona × state MVP**
- **50 curated county**
- **30 D-SNP × state**
- **7 MA-vs-Medigap (guaranteed-issue)**
- **60 carrier × state trimmed**
- **= ~300 pages total** (vs B's 686 — cut overgrown county/carrier/SNP factories)

Better lead quality per page. Easier to maintain at annual republish cadence.

---

## 4. Annual coordinated republish playbook (separate cron from drip-publish)

The drip-vs-coordinated conflict is illusory — they operate on different content states:

- **Drip-publish cron:** handles INITIAL publish of new state pages. 2-3 states/day across ~3 weeks. Avoids Bing/Google penalty for sudden 43-page injection from a low-DR site.
- **Annual coordinated republish cron:** handles REFRESH of already-indexed pages. SEPARATE cron job.
  - **May annual update (starting May 2027):** All 51 state pages get refresh + new `"Updated May X 2027"` timestamp + IndexNow push within 7-day window. NerdWallet-pattern.
  - **October Star Ratings / AEP update:** Smaller coordinated push. Star Ratings + plan counts refreshed. Same 7-day window.

**Two distinct cron jobs.** Initial publish = drip. Refresh = coordinated. Both ship.

---

## 5. Bing volume gap acknowledgment

The Bing API cannot slice MA search volume by state. Confirmed accurate. Canonical proxies for state-level demand:

1. **CMS State/County Penetration CSV** (`https://www.cms.gov/data-research/statistics-trends-and-reports/medicare-advantagepart-d-contract-and-enrollment-data/ma-state/county-penetration`) — actual enrollment counts per state, refreshed monthly. **Pull at every publish wave.** This is the canonical demand proxy this template relies on.
2. **KFF State Health Facts** — state-by-state MA enrollment, regularly updated.
3. **KFF 2026 Spotlight** — 2026 plan counts per state. Validates plan-availability narrative.
4. **Google Trends (state breakdown)** — relative interest by state. Tiebreaker only, not absolute volume.
5. **Bing GetQueryStats once pages rank** — recursive method per HANDOFF.md §3. After Tier 1 ships, query own state page Bing impressions to calibrate Tier 2 sequencing.

The `bing_impressions_weekly` and `google_monthly_volume` columns in `ma-state-topics.csv` are **estimates derived from enrollment × penetration × competitor-density signal**, not measured Bing data. Treat as tiebreakers only.

---

## 6. State-quirk handlers (writer prompt notes)

Bake into writer prompt:

- **AK (0 plans), VT (1 plan), SD (4 plans)** — plan-availability narrative: "your options are X carrier + Original Medicare + Medigap." KFF 2026 confirmed.
- **State-specific carriers:** Florida Blue (FL — already live), Highmark (PA — already live), Geisinger (PA — already live), SCAN (CA — already live), BCBS-state variants. For new states: bake state-specific carrier facts.
- **Guaranteed-issue Medigap states:** NY, CT, MA, ME, OR, CA, MO. Page should call out Medigap as viable alternative.
- **Kaiser regional applicability:** CA, CO, GA, HI, MD, OR, VA, WA, DC. Bake into state-specific carrier section.
- **TennCare (TN), HIP (IN), MNsure (MN), BadgerCare (WI), MaineCare (ME), CHP+ (CO), ARHOME (AR), SoonerCare (OK), OHP (OR)** — state Medicaid brand names. Use for dual-eligible-SNP context.

---

## 7. Next actions

1. **Lock Tier 1 batch of 10** (GA, NC, IL, AZ, TN, VA, NJ, IN, MA, WA). Begin coordinated writer batch now. Drip-publish 2-3/day.
2. **Pull CMS State/County Penetration CSV** before Tier 1 publish wave. Validate enrollment + penetration callouts.
3. **Ship DC at end of Tier 3.** Surface PR to Jacob as standalone side-quest.
4. **Phase 4 adjacencies in this order:** Spanish twin → Persona × state MVP → Curated county → D-SNP × top-30 → MA-vs-Medigap 7-state → Carrier × state trimmed.
5. **Set up two cron jobs:** drip-publish (initial) + annual-coordinated-republish (May + Oct refresh).

---

*End of synthesis.*
