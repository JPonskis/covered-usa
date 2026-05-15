# Q&A Topic Research — Agent B Rationale

**Author:** Agent B (coverage + intuition researcher)
**Date:** 2026-05-15
**Template:** `/qa/[question]` (split into `qa-coverage` + `qa-state-eligibility` subtypes per FANOUT_FORMULA §4.3 + §4.4)
**Approach:** competitor enumeration + manual brainstorm + state-fork mapping. No Bing API in this pass — Agent A owns quantitative demand.

---

## 1. Methodology

I optimized for **coverage breadth, not data precision**. The goal was to enumerate every Q&A that any reasonable healthcare-Q&A inventory would include, then layer in state-eligibility coverage (51 × N programs) plus state-fork coverage Q&As (abortion, gender-affirming, IVF — where the answer changes by state and political nuance matters).

### Sources walked
- **Medicare.gov coverage directory** (`/coverage/[service]`) — finite, authoritative; ~70 pages I treated as the canonical Medicare Q&A enumeration. Each page maps 1:1 to a CoveredUSA Q&A.
- **Healthcare.gov FAQ + glossary** — finite, ACA territory.
- **AARP /medicare/...** — runs hundreds of Q&A pages, high authority, high content density. Reviewed top categories: dental, vision, hearing, drugs, mental health, home care, MA-vs-original.
- **NCOA + Healthline** — secondary aggregators for Medicare/Medicaid Q&A; useful for spotting long-tail.
- **Carrier sites** — Cigna, Humana, UHC, BCBS — they publish near-duplicate Q&A as lead-gen content. Indicates demand exists (they wouldn't publish if it didn't).
- **KFF + Guttmacher + HRC** — for state-fork issues (abortion, gender-affirming care, immigrant eligibility).
- **State Medicaid agency directory** — confirmed program brand names per state (Medi-Cal, AHCCCS, HUSKY, MO HealthNet, Cardinal Care, etc.) for the 51-row eligibility matrix.

### Cross-reference passes
- **CONTENT_INVENTORY.md** — skipped 3 live slugs: `does-medicaid-cover-rehab`, `does-medicare-cover-dental`, `does-medicare-cover-vision`. Also noted 4 already-queued slugs to flag with `already_queued=y` (Medicaid dental, ACA open-enrollment, Medicaid with job, GoodRx + Medicare).
- **busa-inventory.csv** — searched on `medicaid-eligibility-[state]`, `[state]-aca-eligibility-2026`, `chip-`, and `medicare-savings`. Confirmed: BUSA has 50+ `[state]-medicaid-eligibility-2026` pages already. This is the HEAVY-overlap battlefield.

---

## 2. Coverage Q&A enumeration

I bucketed coverage Q&As by **program** (Medicare / Medicaid / ACA) and then by **service category**. Approximate counts:

- **Medicare coverage** (~52 Q&As): dental sub-bucket (implants/dentures/root canal/crowns — adjacent to live page), vision sub-bucket (glasses/eye exams/LASIK/cataracts), hearing aids, mental health bucket (therapy/psychiatry/rehab), GLP-1 bucket (Ozempic/Wegovy/Mounjaro/bariatric), DME (CPAP/oxygen/wheelchair/walker), therapy bucket (PT/OT/speech/chiro/acupuncture), home/end-of-life bucket (home health/hospice/palliative/nursing home/assisted living), preventive bucket (colonoscopy/mammogram/prostate/lung), vaccines, telehealth/urgent/ER/ambulance/transport, Part D core (insulin/general), MA-only benefits (Silver Sneakers/meal delivery/OTC), pre-existing.
- **Medicaid coverage** (~22 Q&As): dental/vision/hearing for adults (varies by state), mental health/therapy, pregnancy/abortion/birth-control/IVF (high state-fork), gender-affirming/top-surgery/HRT (high state-fork), autism ABA, in-home care/HCBS, nursing home, NEMT transportation, drugs/GLP-1, ER, undocumented (state-fork — CA/NY/IL/WA cover).
- **ACA coverage** (~10 Q&As): pre-existing, EHB enumeration, mental health, maternity, birth control, breast pumps, lactation, preventive 100%, dental ride-along, vision ride-along, vaccines.
- **Comparisons** (~3 Q&As): Medicare-vs-Medicaid, MA-vs-Original, Medigap-vs-MA.

### Topics deliberately excluded
- "Does Medicare cover dental?" — live.
- "Does Medicare cover vision?" — live.
- "Does Medicaid cover rehab?" — live.
- "Does Medicaid cover X drug" for non-blockbusters (e.g., Eliquis, Jardiance, etc.) — these belong in the **drug** template per §4.2, not Q&A.
- Cost-shape questions ("how much does X cost") — belong in **procedure** or **drug** templates.
- Generic "how do I apply" — belongs to BUSA per intent-split locked decision (HANDOFF §4.2). Coverage Q&As stay; application-process Q&As go to BUSA.

---

## 3. State-eligibility matrix (qa-state-eligibility subtype)

Per FANOUT_FORMULA §4.4, state-Medicaid eligibility is the **most Bing-validated** Q&A shape (top dominant shape #1, validated by real Bing impressions). The brief mandates a 51 × N program matrix:

### What I enumerated (per state)
- **Medicaid eligibility** — 51 rows. All 50 states + DC. Each titled with the canonical state-program brand (Medi-Cal, AHCCCS, HUSKY, MaineCare, MassHealth, MO HealthNet, NJ FamilyCare, Centennial Care, SoonerCare, OHP, RIte Care, Healthy Connections, TennCare, BadgerCare Plus, Granite Advantage, Apple Health, Pathways, ARHOME, Cardinal Care, Heritage Health, IA Health Link, Healthy Indiana Plan, HIP, Healthy Louisiana, Healthy Michigan, KanCare, Med-QUEST). Used the state-brand to surface canonicalization signal per §4.4 Bing-validated shape #2.
- **CHIP eligibility** — 11 sampled (Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Florida, Georgia, NY, Texas). Not fully enumerated; CHIP is lower-volume than Medicaid but uses high-recognition brands (Florida KidCare, PeachCare for Kids, NY Child Health Plus). Recommend filling out remaining 40 in a Phase 4 cleanup if priority budget allows.
- **Medicare Savings Programs (QMB/SLMB/QI)** — 5 sampled (AL, CA, FL, NY, TX) + one umbrella "all states" Q&A. Per FANOUT_FORMULA §4.4 the state-fork shape applies but volume is thinner; sampled instead of full 51.
- **ACA Marketplace subsidy** — 1 umbrella (federal income limits don't vary state-by-state, only state-marketplace branding does). BUSA already has 51 `[state]-aca-eligibility-2026` slugs — leaning HEAVY overlap. CoveredUSA should let BUSA own this and focus on the "Do I qualify for subsidies?" decision Q&A.
- **Pregnancy Medicaid** — 1 umbrella + state-fork mapping. Pregnancy Medicaid income limits go UP to 200%+ FPL in many states — high-traffic search shape.
- **Long-term care Medicaid** — 1 umbrella. State-specific LTC eligibility is its own niche.

### State-eligibility topics flagged `already_queued=y`
All 50+ Medicaid state rows are flagged. BUSA has near-identical slugs. Intent split applies: CoveredUSA = "Do I qualify?" decision intent (lead with the household-size table + the answer). BUSA = "How do I apply?" intent (lead with the application walkthrough). Per HANDOFF §4.2 these can both exist.

---

## 4. State-fork coverage Q&As (high political nuance)

These are coverage Q&As where the answer materially varies by state. Each is one row in the CSV with `state_fork=y`, plus I added a separate companion "by state" comparison page where the search intent supports it.

### High-fork Medicaid coverage
- **Abortion** — Hyde Amendment limits federal funding; ~17 states use state funds to cover. Single Q&A page with a state-by-state table → priority 1. Companion: `abortion-coverage-medicaid-by-state`.
- **Gender-affirming care** — ~25 states cover; ~15 explicitly exclude; rest unclear. Single Q&A + companion comparison page.
- **IVF and fertility** — Variable; private mandate states (NY, IL, MA, etc.) differ from Medicaid coverage. Lower-volume but distinctive intent.
- **Adult dental** — Variable by state (extensive in CA/NY/OR; emergency-only in TX/FL). Companion comparison page included.
- **Undocumented immigrants** — CA Medi-Cal expanded to all undocumented adults 2024; NY/IL/WA cover certain groups. State-fork.
- **HCBS waivers / in-home care** — Each state has different waiver programs; can be deep-linked from the umbrella Q&A.

### How I'm framing political-sensitive topics
Stick to **factual coverage status** with .gov / KFF / Guttmacher / HRC citations. No editorializing. Per the brief on AI-citation: write to be the canonical source the AI engine cites; let the source determine the politics.

---

## 5. BUSA overlap heavy-hitters

Topics where BUSA has a near-identical slug. Per intent-split rule, both can exist BUT the CoveredUSA version must lead with eligibility/decision intent, not application/how-to.

- All 50 state-Medicaid-eligibility Q&As (heavy)
- All 51 state-ACA-eligibility (heavy — BUSA's `[state]-aca-eligibility-2026` series is comprehensive; I recommend ONE CoveredUSA umbrella Q&A instead of 51 state pages, since federal subsidies don't change by state)
- `texas-chip-eligibility` (heavy — BUSA has exact match)
- `chip-income-limits-2026` umbrella (heavy)
- `can-i-have-medicaid-and-aca` (heavy — BUSA has `can-i-get-aca-and-medicaid`)
- `can-i-get-medicaid-with-job` (heavy)
- `can-i-buy-aca-outside-open-enrollment` (heavy)
- `can-i-use-goodrx-with-medicare` (heavy)

### Coverage Q&As with NO BUSA overlap (uncontested CoveredUSA territory)
- Every "does Medicare cover X" coverage Q&A — BUSA does not produce this shape.
- Every "does Medicaid cover X" coverage Q&A (e.g., dental adult, vision, gender-affirming, abortion) — BUSA does not produce this shape.
- Every "does ACA cover X" coverage Q&A.
- All comparison Q&As (Medicare vs Medicaid, MA vs Original, Medigap vs MA).
- All Medicare-coverage MA-vs-original distinctions.

The bigger CoveredUSA bet should be the **coverage Q&A wing** (Medicare/Medicaid/ACA), which has 0 BUSA cannibalization. State-eligibility is high-traffic but contested.

---

## 6. Top-20 highest-confidence Q&A topics

These are the topics where I'd start the bulk-publish queue. Each is uncontested (or low-overlap) and has clear demand evidence from the competitor enumeration.

1. **`does-medicare-cover-hearing-aids`** — Medicare.gov + AARP both rank #1 for this query. Massive search volume. Live BenefitsUSA does not touch this. Win.
2. **`does-medicare-cover-ozempic`** — Hot 2026 topic. KFF + GoodRx have content; AARP has long-form. CoveredUSA can compete with current FDA + CMS guidance (year-anchored 2026).
3. **`does-medicare-cover-wegovy`** — Same shape as Ozempic. CMS just changed the rule for cardiovascular-risk patients in 2024 — fresh 2026 framing wins.
4. **`does-medicare-cover-nursing-home`** — High-volume eldercare query. Combines coverage Q&A + state-Medicaid handoff. Routes to screener.
5. **`does-medicare-cover-home-health-care`** — Big AARP territory. CoveredUSA can win on year-anchored 2026 specifics.
6. **`does-medicaid-cover-dental`** — Adult Medicaid dental is one of the most-searched coverage questions; state-fork makes it perfect for the AI-citation shape (state-context-everywhere rule). Companion state-by-state comparison.
7. **`does-medicaid-cover-pregnancy`** — High-volume + clear screener-funnel intent (pregnancy Medicaid in many states reaches 200%+ FPL — wider eligibility than realized).
8. **`does-medicaid-cover-mental-health`** — Coverage Q&A; not contested by BUSA; pairs with daily-blog mental-health content.
9. **`does-aca-cover-pre-existing-conditions`** — Healthcare.gov owns the head term but AI-citation needs structured comparison data. CoveredUSA can win on the FANOUT_FORMULA shape.
10. **`does-aca-cover-maternity`** — High volume; ACA maternity is one of the 10 EHB; clear screener intent.
11. **`medicare-vs-medicaid-coverage`** — Foundational comparison query. AARP owns the head; structured formula can compete.
12. **`medicare-advantage-vs-original-medicare`** — High-intent decision query; routes directly to MA-state pages + screener.
13. **`medigap-vs-medicare-advantage`** — Decision query; high-funnel-intent.
14. **`can-i-have-medicare-and-medicaid`** — Dual-eligibility; high volume; routes to screener with high lead quality (dual-eligibles are valuable broker leads).
15. **`does-medicaid-cover-gender-affirming-care`** — Hot topic, state-fork; not yet contested by major publishers in a structured way. CoveredUSA can OWN this with state-by-state companion.
16. **`does-medicare-cover-mental-health`** — Same as Medicaid version; complete coverage of mental-health Q&A territory.
17. **`medicaid-eligibility-california`** (Medi-Cal) — Highest-traffic state. Even with BUSA overlap, the eligibility-decision angle wins differently.
18. **`medicaid-eligibility-texas`** — Same as CA; non-expansion state makes the answer interesting (high coverage gap; many ineligible adults).
19. **`medicaid-eligibility-new-york`** — Highest-traffic-per-capita Medicaid market.
20. **`medicaid-eligibility-florida`** — Non-expansion, large senior population, high MA penetration.

---

## 7. Surprises + counterintuitive notes

1. **Medicaid abortion / gender-affirming care state-fork is a content gap, not a saturation.** KFF and Guttmacher have data; nobody has built the AI-citation Q&A shape for "does my state's Medicaid cover X." High-leverage.
2. **Carrier sites (Cigna/Humana/UHC) publish coverage Q&A as lead-gen.** This is BOTH evidence of demand AND ranking competition. Their content is mediocre; our structured shape beats them.
3. **Adult Medicaid dental coverage by state** is one of the most-searched coverage queries with zero comprehensive resource (KFF has data tables; nobody has a Q&A-shape page). Easy win.
4. **CHIP eligibility per state** has stronger brand recognition than expected — `Florida KidCare`, `PeachCare for Kids`, `Apple Health for Kids`, `Child Health Plus`. Treat each state's CHIP brand as canonicalization-signal in the title.
5. **GLP-1 weight-loss Medicare coverage** is shifting fast (CMS approved Wegovy for cardiovascular indication in Nov 2024). Year-anchored 2026 content can dominate while the policy landscape is in flux.
6. **Standalone supplemental insurance** (dental insurance for Medicare beneficiaries, vision insurance addons) is shape #4 in FANOUT_FORMULA §4.3 — I added these implicitly to coverage Q&As but could be broken out as a dedicated 5-10 article sub-cluster if priority budget supports.
7. **Pregnancy Medicaid** income limits are 2-4x higher than regular Medicaid in many states — a surprise to many users. High-quality content opportunity.

---

## 8. Open questions for the critic / Phase 4 synthesis

- Should `medicaid-eligibility-[state]` pages live in the **qa** template or the new **Medicaid factory** at `/medicaid-income-limits/[state]` (Track D mentioned in HANDOFF §2)? My read: the factory page is the lighthouse (formal income tables + FPL math); the qa page is the decision-form ("Do I qualify?" answered conversationally + linked to the factory). Both should exist; they target different intent.
- Should the 4 `already_queued=y` rows be reconciled — write them via the topic-research queue or honor the existing queue? My recommendation: include in the canonical merged list so the priority + demand evidence is preserved.
- BUSA owns 50+ state-eligibility pages. Should CoveredUSA still publish all 51? My recommendation: YES. Intent-split is real; eligibility-decision intent ≠ application-walkthrough intent. The Bing AI-citation surface rewards both shapes for different queries.
- Abortion + gender-affirming care are politically sensitive. Recommended approach is **strict factual + .gov/KFF citations only**, no editorializing. Surface to Jacob before publishing for sign-off on tone.

---

*End of Agent B rationale.*
