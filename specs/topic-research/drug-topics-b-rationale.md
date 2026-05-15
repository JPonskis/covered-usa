# drug-topics-b — Rationale (Agent B, coverage + intuition)

**Author:** Agent B (coverage-and-intuition researcher)
**Date:** 2026-05-15
**Output file:** `drug-topics-b.csv` (180 topics)
**Method:** Competitor enumeration + chronic-condition brainstorm + IRA/policy coverage. Bing volume blank — Agent A merges in Phase 4.

---

## 1. Methodology

Three lenses applied:

1. **GoodRx catalog ceiling.** GoodRx has a page for essentially every approved Rx. They are THE bar per `competitor-landscape.md` §2. The realistic universe is "every drug GoodRx covers." I sampled their class-level pages (GLP-1, statins, SSRIs, biologics, CGRP, DOACs) and their "How much does X cost without insurance" sub-template — both are programmatic at scale.
2. **Chronic-condition brainstorm.** Top US chronic conditions (diabetes, hypertension, high cholesterol, heart disease, asthma/COPD, depression, anxiety, ADHD, HIV, hep C, RA, MS, Crohn's, cancer, migraine, ED, contraception). Each contributes 3–10 drugs.
3. **IRA + policy lens.** The Inflation Reduction Act Medicare Drug Price Negotiation Program is news-driven, year-anchored, and where GoodRx/Healthline have NOT locked down every variant (per `competitor-landscape.md` §2 — "MEDIUM leverage" call-out). Phase 1 list (10 drugs, prices effective Jan 2026) + Phase 2 list (15 drugs including Ozempic, prices effective Jan 2027) + the $2,100 Part D OOP cap + the new Medicare GLP-1 Bridge Program (July 2026 $50 Wegovy/Zepbound copay) + the BALANCE Model (Jan 2027 permanent) are all wide-open editorial opportunities.

## 2. Competitor coverage map

### GoodRx — saturated head terms (we skip OR coverage-angle only)
- Ozempic, Wegovy, Mounjaro, Zepbound (head) — manufacturer + GoodRx own these. Our angle: COVERAGE questions ("does Medicare cover Ozempic for diabetes 2026", "Wegovy prior auth appeal", "GLP-1 Medicaid by state").
- Eliquis, Jardiance, Xarelto, Humira — GoodRx has 2026-priced pages. Our angle: IRA-negotiation context + Medicare Part D coverage breakdown + manufacturer-assistance walk-through. The formula's §4.2 "manufacturer assistance + cost-without-insurance + year" Bing-dominant shape is where we can outshape GoodRx.
- Generic statins/SSRIs/lisinopril/metformin — GoodRx fully owns. Our list keeps the top 20 generics anyway because (a) ClinCalc top-200 ranking guarantees demand, (b) the formula's recipe (cost-without-insurance + tier table + GoodRx vs Mark Cuban vs Walmart $4 comparison) is differentiated, and (c) class-comparison pages (statins-class-cost-comparison) are open.

### Healthline — moderate coverage
- Healthline runs ~2,500-3,000 word drug pages with PharmD bylines and FAQPage schema. Fewer drugs covered than GoodRx but better long-tail. Their gap: state-Medicaid coverage variants, IRA-policy explainers, biosimilar switch guides.

### Drugs.com — encyclopedic, thin storytelling
- Drugs.com has full catalog parity with GoodRx but their pages are reference-bot ("what is this drug, side effects, interactions"). Almost zero year-anchored cost framing. Our cost-and-coverage focus wins on intent.

### Manufacturer sites — the unwinnable head terms
- Ozempic.com, Wegovy.com, Mounjaro.com, Jardiance.com, Eliquis.com, Humira.com, Stelara.com, Biktarvy.com — these always rank #1 for branded queries. **We don't compete on "Ozempic"** — we compete on "Ozempic cost without insurance 2026", "Ozempic prior auth appeal", "Ozempic Medicaid coverage by state". Coverage + cost + year is our wedge.

### KFF + healthinsurance.org — policy citation neighbors
- KFF dominates IRA explainer + Medicare drug negotiation policy queries. Healthinsurance.org runs Louise Norris editorial that ranks for "Medicare Part D 2026 changes". We can co-cite (per FANOUT_FORMULA §3.6 ≥3 inline .gov / .org citations) and write our own version with the screener handoff at end.

---

## 3. Drug class clusters worth pursuing (highest editorial ROI)

Class-level cost-comparison pages bundle 4-8 drugs into one comparison. High commercial intent + lower competitive density than head drug pages.

| Class | Drugs to compare | Why it wins |
|---|---|---|
| GLP-1 | Ozempic, Wegovy, Mounjaro, Zepbound, Rybelsus, Saxenda, Victoza, Foundayo | News-cycle + policy-anchored. Medicare GLP-1 Bridge starts July 2026 — fresh angle. |
| Statins | Lipitor, Crestor, Zocor, Pravachol, Livalo | All generic, ClinCalc top-10, $4-30/mo range — easy "best value" framing |
| SSRIs | Zoloft, Lexapro, Prozac, Celexa, Paxil | All generic, ClinCalc top-50, depression queries high volume |
| DOACs | Eliquis, Xarelto, Pradaxa, Savaysa + Warfarin baseline | 2 of 10 IRA-negotiated drugs. Post-2026 price drops material. |
| SGLT2 | Jardiance, Farxiga, Invokana, Steglatro | 2 of 10 IRA-negotiated. Diabetes drug-class comparison high-search. |
| CGRP migraine | Aimovig, Ajovy, Emgality, Vyepti + Nurtec/Ubrelvy/Qulipta orals | Niche but high LTV, manufacturer-assistance heavy |
| ADHD stimulants | Adderall, Vyvanse, Concerta, Ritalin, Focalin + Strattera non-stim | Shortage news cycle + 2024 Vyvanse generic launch keeps freshness alive |
| Biologics for RA/psoriasis/Crohn's | Humira, Enbrel, Stelara, Skyrizi, Rinvoq, Cosentyx, Otezla, Entyvio | Specialty tier coinsurance is THE unsolved cost question. Manufacturer assistance is decisive. |
| MS DMTs | Ocrevus, Tysabri, Tecfidera, Copaxone, Gilenya, Aubagio, Kesimpta | Annual $80-100K cost makes coverage queries existential |
| Asthma/COPD inhalers | Albuterol, Advair, Symbicort, Breo, Trelegy, Anoro | $35 inhaler cap (Boehringer) + new generics drive 2026 churn |

## 4. Drugs to skip (head terms manufacturer-owned)

We exclude or de-prioritize branded queries that are unwinnable in the SERP:

- **`Ozempic` head term** — manufacturer + Noom + TrimRx own. Already shipped `ozempic-cost`. Don't duplicate.
- **`Wegovy` head term** — manufacturer + Wegovy savings. Our angle is the GLP-1 Bridge / Medicare coverage / prior-auth appeal lens.
- **`Eliquis savings card`** — manufacturer-owned by definition. Skip; we cover the assistance program inside `eliquis-cost`.
- **`Humira savings card`** — same.
- **`Repatha SureClick savings`** — same.

But we DO cover `[drug]-cost` for these because the COST + COVERAGE + IRA frame is open. The manufacturer site doesn't run the dual-funnel + screener handoff that converts. We run cost + assistance + screener-route-to-Part-D-plan-finder.

## 5. Cross-template overlap callouts (Phase 5 will resolve)

Some topics straddle drug + Q&A or drug + glossary:
- `does-medicare-cover-ozempic-diabetes` could be `/qa/` slug. Recommend KEEPING on drug template because it's drug-specific and fits the formula's §4.2 "Coverage breakdown + Medicare coverage" required H2.
- `formulary-tier-1-vs-tier-2` could be `/glossary/` slug. Recommend KEEPING on drug template — cost-focused, decision intent, ctaTarget=analyzer.
- `prior-authorization-drugs-explained` could be `/glossary/`. Recommend drug template because it's drug-cost decision intent.
- `medicare-part-d-2100-cap-2026` could be `/event/` (post-OEP enrollment shift) or `/glossary/`. Recommend drug — it's a drug-cost policy explainer.
- `birth-control-pills-cost` overlaps slight w/ BUSA (`free-birth-control-low-income`). Different intent (cost shopping vs. application). KEEP on CoveredUSA.

## 6. BUSA overlap audit (from busa-inventory.csv grep)

Direct prescription-drug overlap with BUSA is minimal:
- `medicare-part-d-vs-goodrx` — BUSA covers, marked SLIGHT overlap; our drug template is more cost-comparison + screener-routed
- `free-prescription-drugs-low-income` — BUSA covers, marked HEAVY for `how-to-get-free-meds-low-income`; our angle is decision-tree-by-drug-class which is differentiated but flagged
- `medicare-extra-help-income-limits` — BUSA covers HEAVY, removed from list

Everything else is none-overlap. The drug template is among the LEAST-cannibalized in the BUSA inventory (drug-cost = 8 articles in BUSA per inventory summary; ours is open territory).

## 7. State-specific drugs (state_specific=y)

Three topics fork into 51-state factories:
- `glp1-medicaid-coverage-by-state` — each state Medicaid program covers Ozempic/Wegovy differently. Florida, Texas, CA, NY worth dedicated pages; remaining 47 can be programmatic. This is THE highest-intent GLP-1 query right now.
- `medicaid-cover-wegovy-by-state` — companion variant focused on weight-loss indication
- `free-narcan-by-state` — naloxone access programs differ per state (some states OTC + free; some pharmacy distribution)
- `state-pharmaceutical-assistance-programs` — 24 states run SPAPs (state-funded drug assistance); each needs a page

That's ~150 state-variant pages if we go full programmatic on the GLP-1 + Wegovy + SPAP triple.

## 8. Top-10 highest-confidence (write next)

1. **wegovy-cost** — Medicare GLP-1 Bridge launching July 2026 is a fresh news cycle, screener-compatible (coverage decision)
2. **mounjaro-cost** — Eli Lilly's Zepbound BALANCE Model partner, $1,000-1,200/mo cash cost is sticky question
3. **zepbound-cost** — partnered with Wegovy in 2026 Bridge program at $50 copay; SERP open
4. **medicare-drug-negotiation-2026** — 10-drug IRA list now in effect, KFF + CMS data-rich
5. **medicare-drug-negotiation-2027** — Second round announced, includes Ozempic — Q4 2026 search momentum
6. **glp1-class-cost-comparison** — bundles 8 drugs into one decision frame; analyzer/screener split obvious
7. **eliquis-cost** — 38-79% IRA negotiated price drop is fresh angle GoodRx hasn't fully integrated
8. **jardiance-cost** — same IRA freshness lever, diabetes-focused intent stronger than Eliquis
9. **adderall-cost** — ADHD shortage 2024-2026 keeps query volume hot; ClinCalc top-20
10. **manufacturer-coupon-vs-goodrx** — decision-stage page that funnels both to analyzer (cost shopping) AND screener (if they need Part D coverage). Dual-funnel friendly.

## 9. Surprises

- **The IRA negotiation list creates ~25 "fresh-price" articles** that competitors haven't fully re-pivoted to yet. GoodRx has updated their drug pages but the IRA-context framing is open.
- **The Medicare GLP-1 Bridge Program (July 2026)** is a tiny SERP — only a few insurance-broker blogs covering it. CoveredUSA can dominate this in 6 weeks.
- **Manufacturer-coupon-vs-GoodRx** is the highest-intent decision-stage drug query and nobody (incl. GoodRx) writes it neutrally. We have an editorial opening.
- **State-Medicaid GLP-1 coverage** is a 51-page state factory that no competitor has built yet.
- **The $2,100 Part D OOP cap (2026)** is the first year of true catastrophic protection in Medicare history. Major search momentum + zero competitor saturation. Should be a featured drug-and-policy page.

## 10. Volume notes (Agent A merge target)

Agent A is filling in bing_impressions_weekly and google_monthly_volume from the Bing Webmaster API. My list has 180 topics; expect Agent A's overlap to be ~30-50 of the strongest demand-validated terms. The merge should produce ~200-220 deduped topics. Topics I prioritized that are not in ClinCalc top-200 (e.g., Leqembi, Casgevy, Foundayo) are policy-momentum picks — they may show low Bing volume today but are 2026-2027 traffic acquisition plays.

---

*End of rationale.*
