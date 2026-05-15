# Glossary Topic List — Adversarial Critique

**Date:** 2026-05-15
**Critic:** Frank
**Mode:** AGGRESSIVE PRUNING (FANOUT §4.5 WARNING; competitor-landscape §4 LOW leverage)
**Inputs:** glossary-topics-a.csv (64 rows), glossary-topics-b.csv (50 rows), both rationale docs

---

## Verdict at the top

**Both lists are still too long.** Researcher A says "scaffolding template, not cathedral" and then proposes 64 entries. Researcher B was told to hard-cap at 50 and did so without internalizing that the §4.5 WARNING and competitor §4 LOW-leverage rating *together* push toward a much smaller surface.

The merged-deduped universe is ~75 unique slugs. **Recommended final count: 32** (3 shipped + 29 net new). That is the smallest set that (a) covers every internal-link anchor our other templates need, (b) ships the high-Bing 2-hop pages, and (c) drops everything that is either head-term saturated, a BUSA dupe, or write-cycles-for-nothing.

Below: what to cut, why, and the corrections to A's demand numbers and B's hit-counts that justify it.

---

## 1) PRUNE LIST — cut these from the merged set

Cut these entirely (do not write, do not even keep as URL-slug placeholders):

| Slug | Reason to cut |
|---|---|
| `copay` (single) | A's own note: broad volume is dominated by drug-copay-card queries (Wegovy/Xarelto coupons) — wrong intent. GoodRx owns the coupon vertical. Cover the concept inside `copay-deductible-coinsurance` and `copay-vs-coinsurance`. |
| `medicaid` (single) | Head-term saturated AND BUSA has 378+ articles (busa-inventory grep returns 391 matches across medicaid/chip/FPL). Heavy dupe. Pure noise. |
| `chip` (single) | Same — BUSA owns this. |
| `federal-poverty-level` (single) | Already has the `/federal-poverty-level` reference hub. A glossary entry duplicates the hub and steals its link equity. B explicitly flags the coordination problem. CUT — use the hub. |
| `high-deductible-health-plan` | A lists this AND `hdhp` as separate slugs. One page, one slug. Pick `hdhp`. |
| `silver-vs-gold`, `bronze-vs-silver` | Both fold into the parent `bronze-silver-gold` (already queued as CU-151). Three pages for the same metal-tier concept is over-listing per §4.5. |
| `fsa-vs-hra` | A's demand 150 broad/13wk = ~12/wk. Below the doubled bar. The HSA/FSA/HRA constellation is already covered by `hsa-vs-fsa` + `hsa-vs-hra`. |
| `medicare-part-c-vs-part-d` | A admits "borderline; useful link target." 150 broad/13wk = 12/wk. Pure jargon comparison, no consumer mental model. Internal link can point to Medicare Advantage page directly. |
| `medigap-plan-g-vs-plan-n` | 200 broad/13wk = 15/wk. Niche enough that the Medigap lighthouse should handle it inline, not a standalone glossary entry. |
| `medicaid-vs-chip` | Heavy BUSA overlap + A flagged priority 3. CUT, don't even shadow-list. |
| `medicaid-vs-private-insurance` | A flagged "weaker than medicare-vs-medicaid." Same intent better served by medicare-vs-medicaid. |
| `premium-vs-deductible` | A: 200 broad/13wk = 15/wk. Cost-sharing trio already covers this confusion. |
| `qmb-vs-slmb` | 200 broad/13wk = 15/wk. The `medicare-savings-program` cluster page handles all three (QMB/SLMB/QI) better than a comparison. |
| `slmb` (standalone) | 255 broad/13wk = 20/wk. Fold into medicare-savings-program. |
| `general-enrollment-period` (B-only) | 13 internal hits per B. ~0 standalone demand. Mention inside `initial-enrollment-period`. |
| `qualified-health-plan` (B-only) | 6 internal hits, niche. Pure dead weight. |
| `allowed-amount` (B-only) | 17 internal hits, no standalone demand. Cover inline in EOB and balance-billing. |
| `c-snp` (B-only) | 82 hits; D-SNP is the workhorse for our dual-eligible funnel. Mention inside `d-snp`. |
| `step-therapy` (both) | A: 116 broad/13wk = 9/wk. Drug-page anchor only — fold into formulary page. |
| `catastrophic-health-plan` / `catastrophic-plan` (both, dupe slugs) | 99 broad/13wk in A. Pick ONE slug; either way it's a priority-2 link-target, fine to keep but disambiguate from Medicare-Part-D catastrophic coverage (B caught this — but the answer is still "one page"). |
| `medicare-part-a` (B-only) | 159 internal hits but medicare.gov+kff own it cold and our pages reference it incidentally, not as a deep anchor. Cover inside Medicare 4-part lighthouse. |
| `gap-coverage-medicare` (A) + `coverage-gap` (B) | Duplicate slugs for the same donut-hole concept. Pick `coverage-gap`. IRA structurally closed it; 2026 angle is historical-reference only — keep as priority 2, single page. |
| `irmaa-chart-2026` | A lists this as a SEPARATE page from `irmaa`. The chart belongs inside the `irmaa` page (year-anchored numeric table per §4.5 recipe). Don't split. |

**Total cut: 24 slugs.**

---

## 2) INTERNAL-LINK-TARGET VALIDATION — B's hit counts have noise

I re-ran `grep -roi` against `/projects/covered-usa/content/` for B's top claims. Two patterns emerged.

**B's hyphenated-slug greps undercount real usage** because content prose uses spaces, not hyphens. Re-greps with the natural-language phrase:

| Term | B claimed | Hyphenated re-grep | Phrase-form re-grep | Truth |
|---|---:|---:|---:|---|
| premium-tax-credit | 448 | 32 | 547 | high — confirm |
| special-enrollment-period | 382 | 17 | 383 | high — confirm |
| good-faith-estimate | 184 | 1 | 187 | high — confirm |
| household-size | 271 | 109 | 282 | high — confirm |
| qualifying-life-event | 85 | 0 | 90 | mid — confirm |
| subsidy-cliff | 125 | 7 | 144 | mid — confirm |
| metal-tier | 200 | 1 | 19 | **B INFLATED — actual ~19**, mostly the term doesn't appear; we use "Bronze/Silver/Gold" inline |
| federal-poverty-level (already a hub) | 2,038 | 79 | n/a | hub exists; entry duplicates |
| medicare-part-c | 1,493 | n/a | n/a | grep matches every "Part C" inline mention; misleading as link-target signal |
| hra | 515 | n/a | n/a | B's own footnote: matches "Lis" noise in code files. Real ~50-80. |
| pos | 511 | 617 | n/a | matches `position`, `posner`, paths — almost entirely false positives |
| epo | 378 | 390 | n/a | matches `repository`, `report`, etc — almost all false positives |

**B's hit-count framing reads as data-driven but several entries (metal-tier, HRA, POS, EPO, Medicare-Part-A) are inflated by noise patterns.** The §4.5 "scaffolding" argument still holds for the link-target tier, but don't pretend POS has 511 real anchor uses.

**Implication:** the priority-1 link-target tier should be:
1. premium-tax-credit (547 real)
2. special-enrollment-period (383)
3. household-size (282)
4. good-faith-estimate (187)
5. extra-help / lis (145)
6. subsidy-cliff (144)
7. cost-sharing-reduction (117)
8. qualifying-life-event (90)
9. open-enrollment-period (291) — already queued
10. balance-billing (42)

Everything else is either lower link-target value than B claimed or is already-shipped.

---

## 3) TOP 5 MISSING 2-HOP COMPARISONS

Both lists have most of the obvious 2-hops. The deficits:

1. **`deductible-vs-oop-vs-total-cost`** — three-way "what will I actually pay" page. Neither A nor B has it. Highest analyzer-funnel value of any glossary page; ties directly to the bill analyzer.
2. **`ma-vs-original-medicare-with-medigap-and-partd`** — the real Medicare decision is "MA-MAPD vs (Original + Medigap + PartD)". A's `medicare-advantage-vs-medigap` and `original-medicare-vs-medicare-advantage` both undershoot — the buyer needs the three-way head-to-head. Broker-funnel critical.
3. **`hmo-vs-ppo-vs-epo-vs-pos`** — A has the three-way (HMO/PPO/EPO) but POS is the missing fourth node. B has `pos` as a node. Wire them together — 4-way is a stronger Bing-citation magnet than 3-way.
4. **`individual-vs-family-deductible`** — embedded-vs-aggregate deductible logic confuses every family-plan buyer. Zero competitive coverage on the cleanly framed comparison. High analyzer angle.
5. **`in-network-vs-out-of-network-coinsurance`** — A only has the general `in-network-vs-out-of-network`. The COST-side comparison (different coinsurance %s, separate OOP max) is the actual user question. Add or rewrite the existing.

---

## 4) TOP 5 INTERNAL-LINK-TARGET GAPS (pages reference but no entry exists)

These get cited inline often and deserve glossary anchors:

1. **`enhanced-premium-tax-credit`** — distinct from PTC. ARPA/IRA-era subsidies that EXPIRED Jan 1, 2026. Every 2026 article references the expiration but there is no canonical anchor for "what was the enhanced PTC and what changed."
2. **`aca-cliff`** — neither list has this distinct from `subsidy-cliff` (B has subsidy-cliff). Internal references say "ACA cliff" 30+ times; canonicalize.
3. **`medicare-savings-program`** (A has it, B does NOT) — 66 internal `qmb` hits, 46 `slmb`. The cluster head IS the link target. KEEP A's slug; cut B's QMB/SLMB standalones.
4. **`income-limits-table`** / **`household-income`** — household-size + FPL + MAGI all reference the income-table concept. Worth a small anchor page.
5. **`60-day-window`** / SEP timing anchor — every event page says "you have 60 days." Belongs as part of `special-enrollment-period`, not standalone. Validate the existing SEP page covers it as a section anchor.

---

## 5) TOP 5 DEMAND-SCORE CORRECTIONS (priorities likely lower)

| Slug | Researcher claim | Reality | Recommendation |
|---|---|---|---|
| `medicare-advantage` (single, priority 1, A=15,046) | High | Bare-term Bing volume is heavily polluted by carrier branded queries (Humana MA, UHC MA, Aetna MA). Strict-impressions much lower. Healthcare.gov + medicare.gov own concept. | Priority 2, link-target only. Already covered by MA-state template fan-out. |
| `medicaid` (A=92,582) | Pri 3 by A | Correctly priced down. **Cut entirely** — don't even reserve the slug. BUSA dupe. |
| `irmaa` (A=7,018) | Priority 1 | Correct demand but the 2026 chart should live inside the page, not as separate `irmaa-chart-2026`. Collapse to one slug. |
| `extra-help-lis` (A=3,314 via related, strict 255) | Priority 1 | Real demand is ~255 strict, not 3,314 broad. Strict matches the §4.5 doubled-bar. Keep priority 1 but on link-target merit, not strict demand. |
| `hsa` (A=47,470 broad / B priority 1) | Priority 1 | The 47k broad is heavily polluted (Homeland Security Agency, HSA Bank branded queries). Real consumer search lower. Still keep priority 1 because of internal-link value, but don't justify on the inflated broad number. |

---

## 6) A vs B ADJUDICATIONS

| Slug | A | B | Verdict |
|---|---|---|---|
| `medicare-savings-program` | YES (priority 1) | NO | KEEP A — strong cluster head; QMB/SLMB/QI fold into it. |
| `qmb`, `slmb` standalones | YES (priority 1, 2) | NO | KEEP A on `qmb` only; CUT `slmb` (fold into MSP page). |
| `subsidy-cliff` | NO | YES (priority 1) | KEEP B — 2026 expiration is THE news hook. A missed it. |
| `metal-tier` | NO | YES | KEEP B (link-target) but cap at ≤500 words; demand is real for "what is silver plan" cluster. |
| `cost-sharing` (umbrella) | NO | YES (priority 2) | CUT — cost-sharing-reduction (CSR) is the citable variant; umbrella term redundant with copay/coinsurance/deductible trio. |
| `cost-sharing-reduction` (CSR) | A excluded (0 broad standalone) | B priority 1 | KEEP B — 117 internal hits, anchors PTC math, year-anchor hook (CSR-only-Silver mechanics matter under 2026 cliff). A was wrong to drop. |
| `medicare-part-a/b/c/d` individual pages | A only has `medicare-advantage` | B has all 4 | KEEP only `medicare-part-d` (2026 $2,100 OOP cap = year hook). Drop A and B. Other parts get covered by Medicare lighthouse and MA-state pages. |
| `pos` standalone | NO | YES | CUT B's POS standalone (grep noise; cover inside the HMO/PPO/EPO/POS 4-way). |
| `hsa-vs-fsa` | YES | implicit | KEEP A. |
| `medicaid-expansion` (state_specific=y) | NO | YES | KEEP B — but enforce: this is a NATIONAL definitional anchor; state forks live in `/medicaid-income-limits/[state]` Track D factory. Don't duplicate. |
| `dual-eligible` + `d-snp` | NO | YES (both) | KEEP both as priority 2 — D-SNP demand is real for senior dual-eligible funnel. Drop C-SNP (cover inside D-SNP). |
| `short-term-health-insurance` | NO | YES | KEEP — 2024 4-month rule is a year-anchor hook competitors haven't updated. |

---

## 7) FINAL RECOMMENDED LIST (32 slugs)

**Already shipped (3) — Track-E downsize candidates:**
deductible, magi, out-of-pocket-maximum

**Already queued in `_queue.json` (10) — leave in queue, ship next:**
copay, coinsurance, premium-tax-credit, special-enrollment-period, explanation-of-benefits (EOB), prior-authorization, hdhp, balance-billing, (deductible + magi already counted above)

**Net new priority 1 — single-term link-target anchors (8):**
hsa, fsa, medicare-savings-program, qualifying-life-event, household-size, subsidy-cliff, cost-sharing-reduction, good-faith-estimate

**Net new priority 1 — 2-hop comparisons (Bing-validated, the real money):**
hmo-vs-ppo, epo-vs-ppo, hmo-vs-ppo-vs-epo-vs-pos (4-way), magi-vs-agi, medicare-advantage-vs-medigap, original-medicare-vs-medicare-advantage, copay-deductible-coinsurance (CU-149 queued), bronze-silver-gold (CU-151 queued), deductible-vs-out-of-pocket-maximum, hsa-vs-fsa

**Net new priority 2 — fill out the fan-out skeleton (3):**
irmaa (chart inside), medigap, medicare-part-d (2026 $2,100 cap year-hook)

**Net new priority 2 — niche but year-hook valuable (3):**
short-term-health-insurance, medicaid-expansion (national-only; state forks = Track D), d-snp

**Cut/avoid (the 24 from §1).**

**Total: 32 slugs.** Composition: 3 shipped + 10 queued + 11 new priority 1 + 6 new priority 2 + 2 already-queued 2-hops in `_queue` adjacents. Composition: ~14 single-term + ~13 2-hop comparison + 3 shipped + 2 priority-2 niche.

This is the smallest set that scaffolds every other template's fan-out and ships the actual 2-hop demand. Everything else is dead weight per §4.5.

---

## 8) Confidence + verdict

**Verdict: CUT to 32. Both A and B over-listed.**

A's 64 includes too many "head-term link-target" entries that A's own commentary admits are BUSA dupes (medicaid/chip/fpl) or saturated by GoodRx (copay-as-coupon-card). B's 50 includes ~10 entries justified by inflated grep counts (POS, EPO, HRA, metal-tier, Medicare-Part-A).

**Confidence: HIGH** that 32 is the right ceiling. The §4.5 WARNING + competitor-landscape LOW-leverage rating + the empirical "real internal-link-target tier is ~10 anchors" finding all converge on the same answer. The 2-hop comparison set is where every additional writer cycle pays off; the single-term tier should be ruthlessly minimal.

**One thing worth surfacing to Jacob:** A's `irmaa-chart-2026` separate-page proposal is a structural question — under §4.5 the chart belongs inside `irmaa`, but Jacob's broader programmatic strategy may favor splitting year-tagged data tables into their own URLs for fresh-content advantage. Default to one page; flag if a state-by-state IRMAA story emerges.
