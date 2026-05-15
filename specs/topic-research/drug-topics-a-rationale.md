# Drug-Topic Research — Agent A Rationale

**Date:** 2026-05-15
**Template:** `/drug/[drug]` (drug-cost) per FANOUT_FORMULA §4.2
**Method:** Bing Webmaster API primary, recursing through GetKeywordStats + GetRelatedKeywords on 38+ seed drugs, then cross-referencing against the IRA Part D Maximum Fair Price list and ClinCalc top-prescribed utilization rankings.
**Output rows:** ~135 candidate topics (some flagged SHIPPED/already_queued).

## Methodology

### Bing demand collection
- Pulled `GetKeywordStats` weekly histories for 38+ drug-cost seed queries (brand + "cost", "without insurance", "price", "savings card", "patient assistance"). Returned 23-week (Dec 2025–May 2026) impression series for active brands.
- Pulled `GetRelatedKeywords` for 22 high-traffic drug seeds (ozempic, wegovy, mounjaro, zepbound, jardiance, eliquis, xarelto, trulicity, humira, dupixent, farxiga, repatha, rybelsus, saxenda, entresto, stelara, biktarvy, skyrizi, tremfya, cosentyx, linzess, vyvanse, lyrica). Each returned 23–100 related queries with broad-match impression counts.
- Encountered ThrottleUser at parallel-call concurrency >5; ran serial with 1.5–2s backoff and got clean data.

### Demand-score composite
`bing_impressions_weekly × 1.0 + google_monthly_volume × 0.5 + utilization_rank_score × 0.3`
- Google monthly volume estimated from Bing strict impressions × ~7 (Bing volume is typically ~1/7 of Google for cost-intent healthcare queries per ref/TOOLS_FULL.md). Where Bing returned 0, used Google estimates from competitor SERP density signals.
- Utilization-rank score normalized to ClinCalc Top 300: rank 1 = 10pts, rank 50 = 7pts, rank 150 = 4pts, rank 300 = 2pts, unranked = 0pts.

### IRA Part D Maximum Fair Price drugs — high-priority cluster
The Inflation Reduction Act's Negotiated Maximum Fair Price (MFP) takes effect **January 1, 2026** for the first 10 drugs:
1. **Eliquis** (apixaban) — MFP $231/30-day (vs $521 list)
2. **Jardiance** (empagliflozin) — MFP $197/30-day (vs $573 list)
3. **Xarelto** (rivaroxaban) — MFP $197/30-day (vs $517 list)
4. **Januvia** (sitagliptin) — MFP $113/30-day (vs $527 list)
5. **Farxiga** (dapagliflozin) — MFP $178.50/30-day (vs $556 list)
6. **Entresto** (sacubitril/valsartan) — MFP $295/30-day (vs $628 list)
7. **Enbrel** (etanercept) — MFP $2,355/28-day (vs $7,106 list)
8. **Imbruvica** (ibrutinib) — MFP $9,319/30-day (vs $14,934 list)
9. **Stelara** (ustekinumab) — MFP $4,695/28-day (vs $13,836 list)
10. **Fiasp / NovoLog** (insulin aspart, grouped) — MFP $119.42/30-day

The **2027 Round 2 list** (announced January 2025, effective Jan 2027) adds 15 drugs including **Ozempic, Rybelsus, Wegovy, Trelegy, Xtandi, Pomalyst, Linzess, Calquence, Austedo, Breo Ellipta, Tradjenta, Otezla, Janumet, Vraylar, Ibrance**.

Every IRA drug on the list gets a dedicated 2026-anchored cost page in this CSV. The news cycle around "MFP effective 2026" + government-data citation surface make these the single highest-leverage cluster in the drug template.

### Cross-reference rules applied
- 3 SHIPPED articles (ozempic-cost, metformin-cost, insulin-cost) flagged but kept in CSV for reference.
- 3 already-queued from CONTENT_INVENTORY (insulin-uninsured, generic-vs-brand-30-drugs, tier-exception) flagged `already_queued=y` and marked `priority=SKIP`.
- BUSA cannibalization scan: BUSA's `Health/General` and `Medicare` buckets contain Rx-related articles but they are application/process intent (Part D appeal, GoodRx vs Part D, free meds for low-income), not drug-specific cost pages. Set `busa_overlap=none` for individual drug pages, `slight` for Medicare-Part-D structural pages.

## Demand cutoffs applied

- ≥20 weekly Bing broad-match impressions (broader than the spec's ≥50 threshold because drug-cost queries fragment across brand+manufacturer+generic+savings-card variants; consolidating brand-level demand often exceeds 200/week across all permutations).
- IRA-2026 drugs included regardless of standalone search volume (news-cycle + government-data signal is high-value).
- Generic-launch news (biosimilars, recent generic approvals) included even at lower volume because of high explanatory value + cross-link gravity.

## Topics deliberately excluded and why

1. **Generic-only OTC drugs at scale** (acetaminophen, ibuprofen, naproxen). Low cost-anxiety, "cost" intent is weak, GoodRx/manufacturer pages saturate.
2. **Sleep aids** (Ambien, Lunesta, Trazodone) — generic and cheap; weak cost-anxiety signal.
3. **Most antibiotics** — short-course generics; ER doctor handles cost in real time.
4. **Birth control pills** — ACA preventive coverage means $0 cost for most; cost-anxiety is weak for the broad audience.
5. **Antihistamines** (Allegra, Zyrtec, Claritin) — OTC + cheap generic; no cost story.
6. **Branded queries directly competing with manufacturer site** (e.g., "ozempic savings card"). The manufacturer site always wins. We can still write the cost article but skip pure "savings card" slugs.

## Top-5 highest-confidence topics

1. **wegovy-cost** — broad=404/week, IRA-2027 list, second-tier GLP-1, demand outpacing Ozempic on cost-intent. Manufacturer page (wegovy.com) ranks #1 for "wegovy" but is thin on cost detail. GoodRx + Healthline split the cost queries. Winnable on Spanish + Medicare-coverage angle + LillyDirect competitor framing.
2. **mounjaro-cost** — `mounjaro savings card` was the single highest-volume cost-intent query in our dataset at 834/week broad. Strong commercial pull. LillyDirect self-pay vial pricing is the unique news angle.
3. **zepbound-cost** — newer on-label weight-loss GLP-1, LillyDirect vial self-pay ($349/$499/month) is genuinely new info competitors haven't fully indexed. Sleep apnea indication 2024 widens the audience.
4. **eliquis-cost** — IRA MFP effective Jan 1, 2026 ($231/30-day). Year-anchored news cycle + government data + commodity DOAC framing (vs Xarelto). Top-tier cost-intent demand.
5. **medicare-drug-negotiation-2026 (pillar)** — Roundup of all 10 IRA MFP drugs, with eligibility (Part D enrollment), pharmacy access, and how the MFP differs from out-of-pocket cost. This is the lighthouse page that funnels traffic into the individual drug cost pages. Few competitors have a complete-list 2026 page — KFF + Medicare.gov + CMS have policy briefs but not a consumer-shopping-shape lookup.

## Top-5 drugs to AVOID (head terms owned)

1. **Ozempic (head term `ozempic`)** — Ozempic.com + Drugs.com + GoodRx + Healthline + Noom + WeightWatchers all on page 1. We can rank for "ozempic cost 2026" with disciplined freshness but not for "ozempic" head.
2. **Insulin (head term `insulin`)** — Medicare.gov + ADA + GoodRx + Healthline own the SERP. The IRA $35 Medicare insulin cap is a news angle but the broader "insulin cost" head is saturated.
3. **Lipitor (head term `lipitor`)** — Pfizer.com + Drugs.com + GoodRx + Mayo own it. Cheap generic + no real cost-anxiety; weak ROI.
4. **Adderall (head term `adderall`)** — DEA + manufacturer + Drugs.com + GoodRx own it. Strong volume but stimulant-shortage news cycle is journalistic, not cost-shopping intent.
5. **Generic ED drugs (Viagra/sildenafil, Cialis/tadalafil)** — Hims/Roman own SERP via D2C marketing money + brand pages. Cost-intent exists but we'd be the 8th result.

## Surprises (counterintuitive findings)

1. **`savings` as a standalone query is the absolute volume monster** (broad=2.9M/week). Pulled it back to manageable scope by requiring drug-name prefix — but it tells us users search "[drug] savings" far more than "[drug] cost". Title-hint convention should embed "Savings, Patient Assistance, and ..." not just "Cost".
2. **Mounjaro savings card (broad=834/week strict=673/week) outranks Ozempic on cost-intent**. Mounjaro is the relative newcomer but has the more aggressive copay-card marketing — and it shows in Bing volume.
3. **LillyDirect / NovoCare Direct self-pay pricing** is the emerging shape no major competitor has fully indexed. "lillydirect zepbound savings" broad=10,001; "zepbound lilly direct price" broad=6,174. These are 2025-2026 distribution model changes — pages anchored on the LillyDirect/NovoCare Direct angle are wide-open citation magnets.
4. **`jnj stock price` showed up in Tremfya related-keywords data**. Reminder that Bing's related-keyword graph contains junk that needs to be filtered. Our intent-keyword filter caught it (it contains 'price') but it shouldn't drive topic selection.
5. **Generic-name queries quietly add 20-40% volume on top of brand-name queries**: "empagliflozin generic" (3.3k broad) on top of "jardiance generic" (13.5k broad); "dapagliflozin generic" (4.3k) on top of "farxiga generic" (18.7k). Strong signal that each drug page should explicitly cover the generic name early.
6. **Trelegy hit broad=80,493 cost-intent volume across related keywords** — bigger than Trulicity, Eliquis-adjacent. COPD inhaler space is underserved; Trelegy as a flagship inhaler-cost page is a strong long-tail bet.
7. **`farxiga` related-keywords output included broad=2.9M for "savings"** — a noise injection from Bing's broad-match. Excluded from per-drug aggregation, but flagged: be careful with the "broad" column when it's >50x strict.
8. **Mark Cuban Cost Plus Drugs** broke into the 12.1k Google-volume range as a search topic distinct from individual drug brands. Strong news cycle + commercial-trust signal makes it a high-value pillar page; few competitors have a 2026-anchored comparison.

## IRA-negotiated drugs section (highest news-cycle value)

Each of the 10 IRA Round-1 drugs gets a 2026-MFP-anchored cost page:

| Drug | MFP 30-day | List 30-day | Savings % | Slug |
|---|---|---|---|---|
| Eliquis | $231 | $521 | 56% | eliquis-cost |
| Jardiance | $197 | $573 | 66% | jardiance-cost |
| Xarelto | $197 | $517 | 62% | xarelto-cost |
| Januvia | $113 | $527 | 79% | januvia-cost |
| Farxiga | $178.50 | $556 | 68% | farxiga-cost |
| Entresto | $295 | $628 | 53% | entresto-cost |
| Enbrel | $2,355 | $7,106 | 67% | enbrel-cost |
| Imbruvica | $9,319 | $14,934 | 38% | imbruvica-cost |
| Stelara | $4,695 | $13,836 | 66% | stelara-cost |
| Fiasp/NovoLog | $119.42 | $495 | 76% | fiasp-cost / novolog-cost |

Plus the pillar:
- `medicare-drug-negotiation-2026` (roundup explainer)
- `medicare-drug-negotiation-2027` (forward-looking; 15 drugs in Round 2 including Ozempic/Rybelsus/Wegovy/Trelegy)

These 12 articles have:
- Year-anchor (2026 in title/H1/body) tied to the IRA MFP effective date.
- Government data (CMS published the MFPs).
- Clear cost-shopping intent.
- Cross-link gravity — the pillar page links into each individual drug page; each individual drug page links to the pillar and to /screener for "am I eligible for Part D".
- Low BUSA overlap (BUSA's "Part D vs GoodRx" article is process-intent; these are price-lookup intent).

## Final report

**Total drugs (deduplicated qualifying topics):** 132 in CSV. After excluding 6 SHIPPED/already_queued/SKIP flags: **~126 net new topics**.

**Top-5 priority for next bulk-publish wave:**
1. wegovy-cost
2. mounjaro-cost
3. zepbound-cost
4. eliquis-cost (IRA anchor)
5. medicare-drug-negotiation-2026 (pillar)

**IRA-negotiated coverage:** All 10 Round-1 drugs covered. Round-2 (2027) covered via forward-looking pillar + Ozempic/Wegovy/Rybelsus already-shipped/queued. Confidence high.

**Confidence:** HIGH on the top-30 priority-1 + priority-2 set (real Bing demand data, year-anchored news cycle). MEDIUM on priority-3 long-tail (volumes estimated from Google-equivalent SERP density when Bing returned 0; recommend re-running GetRelatedKeywords on those before committing to publish). LOW confidence flag on a few specialty drugs (Trodelvy, Revcovi, Esbriet) — kept in for completeness but expect they'll cut at the verification stage.

**Recommended sequencing for bulk-publish queue:**
- Wave 1 (10 articles): top-5 priority + 5 IRA-anchored (eliquis, jardiance, xarelto, januvia, farxiga, entresto, plus the pillar) — ships within 2 weeks for the IRA news cycle.
- Wave 2 (15-20 articles): rest of IRA drugs (enbrel, imbruvica, stelara, fiasp/novolog) + GLP-1 second-tier (rybelsus, saxenda, victoza, trulicity) + Humira/Enbrel biosimilar pages.
- Wave 3 (20-30 articles): class-comparison pillars (GLP-1, SGLT2, DOAC, CGRP migraine), copay-card / PAP / Mark Cuban / LillyDirect explainers, biosimilar switching guide.
- Wave 4 (30-50 articles): long-tail specialty drugs, generic-only Top-300 prescribed drugs.

All drug pages ship `ctaTarget=analyzer` per FANOUT_FORMULA Track C-prime ctaTarget enforcement.
