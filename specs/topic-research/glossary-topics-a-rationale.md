# Glossary Topic Research — Agent A Rationale

**Template:** `/glossary/[term]` (single-term definitions + 2-hop comparisons)
**Date:** 2026-05-15
**Threshold:** ≥100 broad weekly Bing impressions OR strong 2-hop comparison demand. **DOUBLED bar** per FANOUT §4.5 WARNING.

---

## TL;DR

64 total topics qualified (after aggressive filter). Composition:
- **36 single-term-definition** (head terms)
- **28 comparison-2hop** (the real opportunity per competitor-landscape §4)
- **0 term-with-state-data** (definitions don't fork by state)

3 already shipped (deductible, magi, out-of-pocket-maximum) and 8 already queued in the Sheet, flagged with `already_queued=y` context in notes.

Most important strategic move: the 2-hop list is where the dollar lives. `hmo vs ppo` alone is 7,242 broad impressions / quarter, more than the entire `magi` query family in FANOUT's empirical sample.

---

## Methodology

1. **Bing Webmaster API primary.** Pulled `GetKeyword` (broad + strict impressions) across a 13-week window (2026-02-15 → 2026-05-15) for ~120 candidate queries. Ran a second pass on bare terms (`deductible` instead of `what is a deductible`) because "what is" framing produced 0s for most head terms — users type bare terms.
2. **Bing `GetRelatedKeywords`** for 8 high-value seeds (`medicare advantage vs medigap`, `irmaa 2026`, `hdhp vs ppo`, `original medicare vs advantage`, etc.) to surface comparison-2hop queries with real impression counts.
3. **Cross-reference vs Healthcare.gov canonical 150-term glossary** (per competitor-landscape §4) — every term I included is in the gov glossary OR is a 2-hop comparison that gov doesn't cover well.
4. **BUSA overlap check** against `busa-inventory.csv` — flagged `heavy` for Medicaid/CHIP/FPL (BUSA has 378 + Medicaid articles, full FPL coverage); `slight` for COBRA, ACA-marketplace, HSA-vs-FSA-style terms; `none` otherwise.
5. **De-duped** against shipped pages (deductible, magi, oop-max) and queued sheet rows (8 entries).

### Specific calibrations

- **"What is X" head queries returned 0 for ~70% of the obvious head terms** (deductible, copay, coinsurance, HMO, PPO, EPO, magi, fpl, medicare part a/b/d, etc.). Going to bare terms got real numbers — but the bare-term broad numbers include MASSIVE off-topic noise (FSA = Future Farmers of America, HSA = Homeland Security Agency, marketplace = Facebook Marketplace, donut hole = literal donuts/dunkin munchkins). I used `GetRelatedKeywords` and the strict-impression subset to filter to health-insurance intent.
- **The MAGI lesson from FANOUT was real but not the whole story.** "What is magi" got 0 broad in this window, BUT bare "magi" returned 64,519 broad / 7,424 strict over 13 weeks. The 4-MAGI-queries-in-2-months finding in FANOUT was BenefitsUSA-specific GSC data, not Bing universal demand. MAGI's a real-volume term — just not as a "what is" page format. **This validates the glossary template's existence at all**, but reinforces the §4.5 advisory: ≤500 words, link target first.

---

## The aggressive-filter argument: which terms FAILED the doubled demand bar

**Excluded (failed bar):**
- `what is a referral` — 0 broad in window
- `what is upcoding` — 0 broad
- `dual eligible` — 45 broad/13wk = 3/wk; below bar despite obvious topic
- `cost sharing reduction` (CSR) — 0 broad as standalone (despite ACA subsidy importance)
- `obamacare meaning` — 0 broad
- `narrow network` — 0 broad
- `actuarial value` — not even bothered (zero conversational demand)
- `essential health benefits / EHB` — 0 broad
- `metal tier` — 0 broad
- `medicare donut hole` (long-form) — 52 broad/13wk; collapsed into `gap-coverage-medicare`

Most "industry-jargon" glossary terms FAILED. Users don't query them. They query the BARE term or the SYMPTOM (e.g., "out-of-pocket maximum meaning" hits 808 broad — 62/wk — but "out-of-pocket maximum" itself hits 0 in this window).

**Excluded (priority 3 = link-target only, not write-priority):**
- `medicaid`, `chip`, `federal poverty level`, `copay` — too broad / too head-of-funnel / heavy BUSA overlap. Keep them in the URL space (already shipped or queued via track-E) for internal linking but don't burn writer cycles on them at scale.

**Excluded (already shipped):**
- `deductible`, `magi`, `out-of-pocket-maximum` — three live pages, all flagged for Track-E downsize (current word counts 1,500-1,700; target ≤500 per FANOUT §4.5).

---

## The 2-hop comparison terms: the real opportunity

Per competitor-landscape §4: "Real money in this template is the 2-hop pages — `out-of-pocket maximum vs deductible 2026`, `coinsurance calculator example`, `MOOP for family plans` — where GoodRx and Healthline have partial coverage but not complete coverage."

Bing-validated 2-hop comparisons (sorted by impressions):

| Topic | Broad 13wk | Notes |
|---|---:|---|
| `hmo-vs-ppo` | 7,242 | CRITICAL write — highest 2-hop volume in entire glossary |
| `epo-vs-ppo` | 1,769 | Strong |
| `medicare-vs-medicaid` | 1,200 (est) | Heavy BUSA overlap; intent-split angle |
| `original-medicare-vs-medicare-advantage` | 870 | Already queued |
| `medicare-advantage-vs-medigap` | 776 | Bing-related-validated |
| `bronze-silver-gold` | 763 | Already queued |
| `deductible-vs-out-of-pocket-maximum` | 762 | Explicitly called out in competitor doc |
| `copay-vs-coinsurance` | 585 | Bing-validated |
| `magi-vs-agi` | 579 | High intent (tax-time + ACA subsidy) |
| `hdhp-vs-ppo` | 372 | Funnel-aligned (HSA pairing) |
| `deductible-vs-copay` | 270 | Bing-validated |
| `cobra-vs-marketplace` | ~500 | Already queued; BUSA dupe risk |

**Recommendation:** ship the 2-hop list FIRST. Single-term head pages exist to deduct internal-link target value; 2-hops actually pull citation traffic.

---

## Internal-link target value analysis

Per §4.5 + `LINK_TARGET_MANIFEST.md`: glossary's primary value is as a link target. The single-term pages should be in the URL space even if they don't pull citations, because templates fan-out to them.

Highest link-target value (cross-references in many CoveredUSA pages):

1. `magi` — referenced in every ACA subsidy article, every Medicaid eligibility article (already live)
2. `fpl` / `federal-poverty-level` — referenced in every income-gated topic (write the redirect/canonical question first — currently FPL chart is its own page on the site)
3. `qualifying-life-event` — referenced in every event template page (SHIP — strong link target despite borderline demand of 176/wk)
4. `special-enrollment-period` — same fan-out (mid-priority)
5. `prior-authorization` — referenced in every drug page (14k/wk — high demand AND high link-target value, rare combination)
6. `irmaa` — referenced in every Medicare page (7k/wk)
7. `formulary` — referenced in every drug page (6k/wk)
8. `extra-help-lis` — referenced in every Part D / drug page (Bing 3k/wk via related)
9. `premium-tax-credit` — referenced in every screener page (303/wk)
10. `qmb` / `medicare-savings-program` — referenced in every Medicaid + Medicare Advantage page

These are mostly priority-1 regardless of standalone demand, because the formula's `≥3 inline .gov citations` rule + LINK_TARGET_MANIFEST routing relies on them being there.

---

## Top-5 highest-confidence (likely 2-hop comparisons)

1. **`hmo-vs-ppo`** — 7,242 broad / 13wk. Zero competitor BUSA dupe. Plan-type 2-hop. Healthcare.gov has 2 separate definitions but no head-to-head. Highest-confidence single write in the entire template.
2. **`irmaa`** + **`irmaa-chart-2026`** (paired) — 7,018 + 8,195 broad / 13wk. IRMAA brackets are reset annually, so year-anchored. Senior-funnel critical. Low BUSA overlap.
3. **`medicare-advantage-vs-medigap`** — 776 broad / 13wk via related. Broker-funnel-critical. The single biggest "which should I pick" decision at age 65. Direct revenue path.
4. **`prior-authorization`** — 14,464 broad / 13wk. High demand + analyzer-funnel-aligned (bill-pain question). Healthcare.gov + CMS have weak content here; we can lead with appeal-letter angle.
5. **`hdhp`** (paired with `hdhp-vs-ppo`) — 571 + 372 broad / 13wk. HSA-tax-savings angle is high-intent; ties into the FSA/HSA cluster which has $617K + $271K bare-term broad. Even after dedup-noise, the HDHP-buyer searches are real and underserved.

---

## Top-5 terms to AVOID (saturated head terms)

These either fail the doubled demand bar OR have such heavy BUSA overlap that they belong elsewhere:

1. **`medicaid`** (head term alone) — 92,582 broad / wk but BUSA has 378 articles. Heavy overlap. Useful only as anchor/redirect; not a write target.
2. **`chip`** (head term alone) — 40,356 broad / wk but BUSA has full CHIP coverage. Heavy overlap.
3. **`copay`** as a definitional page — 17K/wk broad but the volume is dominated by drug-copay-card searches (Wegovy / Xarelto / Ajovy / Otezla copay cards). The intent is "find a coupon," not "learn what copay means." Saturated by GoodRx.
4. **`federal-poverty-level`** as a glossary page — FPL chart is already its own page on the site + BUSA has full FPL coverage. Cannibalization risk.
5. **`marketplace`** alone — 622K broad / wk but it's a navigational query for healthcare.gov, NOT a definitional intent. Will never be cited as a glossary.

---

## Year-anchor + structural notes

- All `title_hint` values include `2026` per FANOUT §3.1. IRMAA chart specifically year-anchored because brackets reset annually.
- All slugs are year-free (GATE A) — even when title says 2026.
- `state_specific=n` for nearly every entry. Exception: NONE. Definitions don't fork by state. (Medicaid/FPL CAN fork by state, but those are MA-state-template / Medicaid-factory territory per Track D.)
- BUSA overlap: 4 heavy (medicaid, chip, fpl, medicare-vs-medicaid, medicaid-vs-chip), 7 slight (medicare-advantage, hsa, cobra, premium-tax-credit, special-enrollment-period, prior-authorization, cobra-vs-marketplace, medicare-vs-employer-insurance, bronze-vs-silver, original-medicare-vs-medicare-advantage, medicaid-vs-private-insurance), 50+ none.

---

## Confidence + next steps

Confidence: high on the 2-hop list, medium on the single-term list. The single-term list is conservative because §4.5 explicitly warns the template is over-engineered. If we ship the 21 2-hops + the ~15 high-link-target singles (priority 1) + the 3 already-shipped, we have ~39 glossary pages — enough to feed every other template's fan-out without burning writer cycles on saturated head terms.

Cutting through the noise: glossary is a SCAFFOLDING template. Build the scaffolding. Don't build a cathedral.

---

## Summary stats

| Metric | Value |
|---|---:|
| Total topics | 64 |
| Already shipped | 3 |
| Priority 1 (write next) | 34 |
| Priority 2 (write later) | 22 |
| Priority 3 (link-target only, don't write) | 5 |
| Single-term-definition | 36 |
| Comparison-2hop | 28 |
| BUSA overlap heavy | 5 |
| BUSA overlap slight | 11 |
| BUSA overlap none | 48 |
| State-specific (forks 51x) | 0 |
