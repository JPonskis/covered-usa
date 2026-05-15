# Persona Topics — Agent A (data-driven) Rationale

**Date:** 2026-05-15
**Output:** `persona-topics-a.csv` — 97 topics ranked, 7 marked LIVE (already shipped), 5 flagged `already_queued=y`.
**Methodology:** Bing Webmaster API GetRelatedKeywords (81 persona seeds fetched, 462 persona-filtered queries in the universe) + GetKeywordStats (12 seeds returned non-empty volume) + cross-reference with BLS occupation tables, Census demographic data, CONTENT_INVENTORY, and busa-inventory.csv.

---

## Data sources used

1. **Bing Webmaster API — primary.** 81 persona seeds × `GetRelatedKeywords` (en-US, 2026-02-13 to 2026-05-13) yielded a universe of 1,166 distinct queries. After filtering for persona-segmented intent (positive patterns: `1099`, `self employed`, `gig worker`, `veteran`, `senior`, `single mom`, `pregnant`, `kids`, etc.; negative patterns: carrier names, head terms like `marketplace`, `medicare`, `.gov` URLs), 462 persona-relevant queries remained.
2. **GetKeywordStats** returned non-empty data for 12 seed phrases (14-46 weekly broad). Most long-tail "health insurance for [persona]" phrases hit Bing's reporting threshold and returned empty — interpreted as "below threshold" not "zero demand" per the API note in `bing-webmaster-api.md`. Notable confirmed: `self employed health insurance deduction` (23 weekly broad), `1099 health insurance` (19), `small business health insurance options` (19), `health insurance for federal employees` (20).
3. **BLS Occupational Employment Statistics** for utilization rank on occupation-personas (truck drivers 2M, RNs 3M, K-12 teachers 3.1M, etc.).
4. **Census ACS / CPS** for demographic-persona rank (single moms 15M, widows 12M, stay-at-home parents 11M).
5. **IRS SOI** for tax-segmented personas (27M Schedule C filers, 15M+ 1099 filers, 22M HSA accounts).
6. **CMS/KFF/AARP** for healthcare-cohort sizing (60M Medicare-eligible, 53M unpaid caregivers, 42M with disability).

## Demand cutoff applied

- ≥50 weekly Bing broad impressions across persona-tagged queries (after filter)
- OR top-30 occupation by BLS employment (truck drivers, RNs, teachers all qualified)
- OR top-15 demographic category by Census share (single moms, widows, stay-at-home parents)
- OR strong qualitative signal: state-program brand surfaces (`nj familycare` 22K, `texas children's health plan` 1.7K — implies persona-by-state demand for "family/kids" segment)

## Topics deliberately excluded and why

- **`seniors`** as a standalone persona — excluded because Medicare-eligible seniors already get full coverage via `/medicare-advantage/[state]` MA-state pages. Listed at priority=2 with note "overlap with MA-state."
- **Generic "men" / "women"** — too broad. Kept `women` as priority-2 with preventive-care + maternity angle; demoted `men` to `men-over-50` early-retiree-overlap niche.
- **"Insurance for retirees" without "early"** — overlaps with seniors-Medicare-eligible; the value is in `early-retirees-pre-65`.
- **State-fork personas for low-population states** — included only CA/TX/FL/NY/IL because the top-5 states cover ~38% of US population and have distinct Marketplace platforms (Covered CA, NY State of Health, Get Covered IL).
- **Duplicate occupational sub-niches that fold into "self-employed [trade]"** — many BLS-sourced trades (cosmetologist, plumber, photographer, etc.) listed but at priority=3 because they generally aggregate under sole-proprietor/1099 head pages. Ship as long-tail later.

## Top-5 highest-confidence topics (by demand_score × CTAr-revenue weight)

1. **veterans** (demand=2400) — 394K broad impressions on "veterans" + 56K on "veterans administration" + 49K on "veterans affairs" + bing-stats(46-weekly-broad on the exact persona phrase). Massive demand, no live coverage, only `slight` BUSA overlap (VA-Aid/Attendance, derivative spouse benefits — application intent, not coverage shopping). High-conviction next-ship.
2. **children-kids** (demand=1100) — bing-stats(24-strict-22weeks) confirms steady persona demand. Massive related universe: `nj familycare` 22K, `florida healthy kids` 4.4K, `peachcare for kids` 2.6K, `texas children's health plan` 1.7K, `chip medicaid` 540, `chip insurance for kids` 600. The state-program-brand pattern matches what FANOUT_FORMULA §5.1 calls highest-ROI surface (state×program×year).
3. **1099-contractors** (demand=940) — already queued (CU-220) but Agent A confirms strong demand: bing-related(1099 + 117 strict on health-insurance-for-self-employed) + 15M+ IRS 1099-NEC filers + subsidy cliff hit + self-employed health deduction tax angle = best-in-class persona × tax intersection.
4. **pregnant-women** (demand=830) — bing-stats(16-broad-3weeks) + 3.6M births/yr (CDC) + SEP trigger + Medicaid pregnancy income limits (huge BUSA overlap but intent-split clean: BUSA = application; CoveredUSA = coverage options). High intent, life-event timing.
5. **small-business-owners** (demand=820, already queued CU-215) — bing-related(924+379+111+358 across 4 SBO queries) + 32M small businesses + ICHRA/QSEHRA/SHOP comparison is genuinely complex and underserved + subsidy cliff hit for ALL high-revenue owners.

## Persona × 2026 subsidy cliff overlap (which personas are hit?)

The 2026 ACA enhanced subsidy expiration affects everyone earning >400% FPL. Personas with high earner concentration:
- **small-business-owners**: established LLCs/S-corps frequently >$120K household — full cliff hit
- **1099-contractors**: median established 1099 >$80K solo, >$140K household — partial-to-full cliff
- **sole-proprietors**: 27M Schedule C filers, top quartile >$150K — full cliff hit
- **early-retirees-pre-65**: high savings draw + side income → >400% FPL common — full cliff
- **startup-founders / entrepreneurs**: post-funding founder salary $120-200K — full cliff hit
- **freelance-writers / designers / consultants**: established practice often >$100K solo — partial cliff
- **realtors-real-estate-agents**: top quartile NAR member >$200K commission income — full cliff
- **truck-drivers (owner-operators)**: gross $200K+ but net often <400% after expenses — variable
- **digital-nomads**: tech-skewed cohort, high earner concentration — full cliff
- **remote-workers (tech)**: top quartile >$150K — full cliff
- **couples-both-self-employed**: stacked household income — full cliff
- **high-deductible-hsa-eligible (self-employed)**: HDHP + HSA = tax-savvy mid-high earners — partial cliff

Total subsidy-cliff-flagged in CSV: **31 topics** (column `subsidy_cliff_hit=y`). This is the persona × news cycle angle FANOUT_FORMULA §4.7 calls out.

## Persona × tax angle (unique tax interplays)

Personas with column `tax_angle=y` (33 topics):
- **All 1099 / self-employed / sole-proprietor variants** get the Self-Employment Health Insurance Deduction (Schedule 1 Line 17) — directly reduces AGI, stacks with premium tax credit
- **HSA-eligible self-employed**: triple tax advantage (deductible + tax-free growth + tax-free qualified withdrawals)
- **Couples both self-employed**: tax stacking — both can take SE deduction
- **Clergy**: housing allowance affects MAGI calculation
- **Owner-operator truck drivers**: per-diem deduction + SE health deduction layered
- **Cosmetologists/booth renters**: Schedule C with rent deduction + SE health deduction

This is FANOUT_FORMULA §4.7 dominant shape #4: "Self-employment health deduction (tax angle) — Entailment."

## Persona × state-fork candidates

`state_specific=y` (8 topics):
- **gig-workers-california-ab5** — AB5 + Medi-Cal expansion + ICHRA variance
- **gig-workers-texas** — no Medicaid expansion + Marketplace-only strategy
- **immigrants-undocumented** — CA Medi-Cal expansion (all-ages 2024), NY Essential Plan, IL HBI, OR Oregon Health Plan — wildly different state-by-state
- **self-employed-california / texas / florida / new-york / illinois** — top-5 states have distinct Marketplace platforms (Covered CA / Get Covered IL = state-based; HealthCare.gov = federal)
- **trans-non-binary** — gender-affirming care coverage bans vary by state (TX/FL/AL bans vs CA/NY mandates)
- **remote-workers** — out-of-state network issues = state-fork
- **medicaid-expansion-state-resident** — 10M in coverage gap, 10 non-expansion states

These are candidates for a future persona × state factory (similar to the Medicaid factory in Track D).

## Surprises (counterintuitive high-demand topics)

1. **Children/kids was the second-highest demand cluster** I wouldn't have predicted as a "persona" — but Bing's related universe surfaced massive demand for CHIP/state-children's-health-program brands (`nj familycare`, `florida healthy kids`, `texas children's health plan`, `peachcare for kids`, `allkids`, `arkids`). This implies a strong /for/children-kids page that aggregates state-CHIP-brand lookup to a single canonical entry point. State-fork potential = 51 pages.

2. **Veterans demand dwarfs all other personas combined.** 394K broad impressions on the single word "veterans" (vs 26K for "self employed", 22K for "familycare"). Existing live persona pages target gig-worker / self-employed / freelance niches but ignore the 19M-veteran cohort with one of the most confusing coverage stacks (VA + TRICARE + CHAMPVA + Marketplace + Medicare-eligibility-at-65). This is the single biggest persona-shaped opportunity in the data.

3. **State-employee + non-profit-employee demand is low but intent is strong.** Bing related is weak (200-360 demand_score range) but these cohorts have unique pain points (state-plan ending after departure → need Marketplace; non-profit small-org coverage gaps). Long-tail priority=3 but high lead-quality due to clear subsidy-shopping intent.

4. **"Stay-at-home moms" demand is real (260) but the intent is wildly mixed** — split between (a) Medicaid eligibility (spouse-income-test edge cases), (b) marketplace under spouse's plan vs solo, (c) "do I qualify if I have no income but he does." Need careful subtype handling, similar to Q&A SUBTYPE DISPATCH pattern from Track C-prime.

5. **Trans/non-binary state-fork potential** is bigger than expected (180 demand_score nationally, but state-fork to TX/FL/AL/AR/etc. anti-bans vs CA/NY/CO/WA pro-coverage = 8-10 high-intent state pages with virtually no competition).

6. **DoorDash + Instacart + Amazon Flex brand-aware queries are MASSIVE.** Instacart broad-related volume hit 1.14M (the highest single related-query in the entire persona universe), DoorDash hit 86K+76K+9K across brand variants, Amazon Flex hit 44K. Brand-aware platform-shopper search intent vastly exceeds the generic "gig worker" demand. Recommendation: ship one persona page per major platform (already queued for DoorDash/Uber; add Instacart + Amazon Flex), not a single consolidated gig-worker page.

## Confidence assessment

- **High** confidence on top-5 ranked topics (veterans, kids, 1099, pregnant, SBO): triangulated 3+ sources, strong Bing data, clear monetization path via screener (CTA=screener for all).
- **Medium** confidence on niche occupational personas (massage therapists, photographers, etc.) — limited Bing volume per persona but BLS occupation rank supports demand existence; priority=3 long-tail.
- **Low** confidence on edge demographic-personas (DACA, H1B, trans-non-binary) — limited Bing data + niche cohort, but high lead-quality because intent is unambiguous and few competitors target them.

## What Agent A leaves to Agent B / Critic

- Competitor enumeration (Stride/Catch/BenAvest/HSAforAmerica/Healthline persona-content coverage) — Agent B should map this.
- Reddit/forum question-mining for organic intent patterns — Agent B's strength.
- Critic should pressure-test the BUSA overlap flags (Agent A defaulted to `slight` for all topics where BUSA had any persona-tagged article because the intent split is application vs coverage-shopping — but a heavy-handed critic might re-classify some as `heavy` if the BUSA article actually answers the coverage question).

---

**Volume committed:** 97 topics on the CSV (90 active candidates after subtracting 7 LIVE rows). Highest priority: 15 topics at priority=1 (write next). Priority=2 long-tail: 48. Priority=3 future: 27.

**Recommended bulk-publish wave 1 (next 30 days):** All 15 priority=1 topics (veterans, kids, 1099-contractors, small-business-owners, doordash-uber-drivers, instacart-shoppers, part-time-workers, pregnant-women, single-mothers, single-parents, unemployed, early-retirees-pre-65, sole-proprietors, immigrants-undocumented, plus state-forks for gig-workers-california, self-employed-california) = 15 articles. All ctaTarget=screener (revenue path).
