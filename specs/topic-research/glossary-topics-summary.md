# Glossary Topic List — Canonical Synthesis

**Date:** 2026-05-15
**Source:** Merged A (64) + B (50), pruned per `glossary-topics-critique.md`
**Total canonical count:** 32

---

## Composition

| Category | Count |
|---|---:|
| Single-term-definition | 19 |
| Comparison-2hop | 11 |
| Term-with-state-data | 2 |
| **Total** | **32** |

Breakdown by ship status:
- Already shipped (Track-E downsize): 3
- Already queued: 10 (8 singles + 2 2-hops)
- Net new priority 1: 16 (8 singles + 8 2-hops — 1 of those queued)
- Net new priority 2 / fan-out skeleton: 3

---

## Top-10 Priority (priority-1 link-target tier, by validated internal-link hit count)

1. **premium-tax-credit** — 547 real internal hits (queued); 2026 enhanced-PTC-expired hook
2. **special-enrollment-period** — 383 real hits (queued); anchor for every event page
3. **household-size** — 282 real hits; anchor for every income-table page
4. **good-faith-estimate** — 187 real hits; procedure-template anchor
5. **hsa** — 488 internal hits (broad Bing inflated by HSA Bank/HSA-Homeland-Security noise)
6. **subsidy-cliff** — 144 real hits; 2026 cliff-returns = year-anchor news hook
7. **cost-sharing-reduction (CSR)** — 117 real hits; Silver-only subsidy math
8. **qualifying-life-event** — 90 real hits; sibling to SEP for event pages
9. **medicare-savings-program** — 112 internal (QMB 66 + SLMB 46); A-only cluster head
10. **prior-authorization** — 93 real hits (queued); 2026 CMS streamlining year-hook

(2-hops are scored on Bing, not link-target hits; top 2-hops below.)

### Top 2-hop comparisons by Bing demand

1. `hmo-vs-ppo` — 7,242 broad / 557 strict
2. `hmo-vs-ppo-vs-epo-vs-pos` — 2,027 broad / 156 strict (critic-mandated 4-way)
3. `epo-vs-ppo` — 1,769 broad / 136 strict
4. `in-network-vs-out-of-network-coinsurance` — 1,651 broad / 127 strict
5. `copay-deductible-coinsurance` — 1,500 broad / 80 strict (already queued CU-149)
6. `medicare-advantage-vs-original-plus-medigap` — 870 broad / 67 strict (critic-mandated 3-way)
7. `bronze-silver-gold` — 763 broad / 59 strict (already queued CU-151)
8. `deductible-vs-oop-vs-total-cost` — 762 broad / 59 strict (critic-mandated 3-way)
9. `magi-vs-agi` — 579 broad / 45 strict
10. `individual-vs-family-deductible-oop` — 300 broad / 23 strict (critic-mandated)
11. `hsa-vs-fsa` — 200 broad / 15 strict (already queued CU-175)

---

## Track-E Downsize Candidates (3 shipped, need ≤500-word rewrite)

Per FANOUT §4.5: glossary pages must be ≤500 words. These shipped pages were written long-form and need to be downsized:

1. **deductible** — `/glossary/deductible` (live; trim to ≤500 words, keep 2026 ACA OOP-max anchor data inline)
2. **magi** — `/glossary/magi` (live; trim to ≤500 words, keep ACA-vs-tax MAGI disambiguation)
3. **out-of-pocket-maximum** — `/glossary/out-of-pocket-maximum` (live; trim to ≤500 words, keep 2026 $10,150/$20,300 ACA limits)

Each rewrite: cut introParagraphs to ≤1, cap detailSection at 1, FAQ at 3-4, keep ≥3 inline body links with ≥2 pointing at lighthouse hub pages.

---

## Critic-Cut List (24+ slugs dropped vs merged A+B universe)

**BUSA-heavy entries (5):**
- `medicaid` (heavy BUSA overlap; 378+ BUSA articles)
- `chip` (BUSA owns)
- `federal-poverty-level` (single — duplicates existing `/federal-poverty-level` hub)
- `medicaid-vs-chip` (heavy BUSA overlap)
- `medicaid-vs-private-insurance` (weaker than medicare-vs-medicaid)

**Duplicate-slug collapses (3):**
- `high-deductible-health-plan` (kept `hdhp`)
- `gap-coverage-medicare` (kept `coverage-gap` — actually dropped entirely; IRA closed donut hole; covered inside `medicare-part-d`)
- `irmaa-chart-2026` (chart now lives inside `irmaa` page per §4.5 numeric-table recipe)

**Tiny-demand sub-comparisons (6):**
- `silver-vs-gold` (folded into bronze-silver-gold)
- `bronze-vs-silver` (folded into bronze-silver-gold)
- `fsa-vs-hra` (≤12/wk strict; constellation covered by hsa-vs-fsa + hsa-vs-hra)
- `qmb-vs-slmb` (folded into medicare-savings-program)
- `premium-vs-deductible` (cost-sharing trio covers)
- `medicare-part-c-vs-part-d` (pure jargon; link to MA page directly)

**B's noise-inflated standalones (6):**
- `pos` (511 grep hits = mostly `position`/`posner`/paths)
- `c-snp` (82 hits; D-SNP covers)
- `general-enrollment-period` (13 hits; mention inside IEP)
- `qualified-health-plan` (6 hits; dead weight)
- `allowed-amount` (17 hits; cover inline in EOB and balance-billing)
- `medicare-part-a` (medicare.gov+kff own; Medicare lighthouse covers)
- `medicare-part-b` (same)

**Standalone tier-2 folds (2):**
- `slmb` (folded into medicare-savings-program)
- `step-therapy` (folded into formulary page)

**Priority-2 niche dropped during final-32 trim (4):**
- `medigap` (380 hits but covered by MA-vs-Original+Medigap comparison)
- `short-term-health-insurance` (64 hits; lowest fan-out skeleton candidate)
- `medicaid-expansion` (slight BUSA overlap; state forks belong in Track D `/medicaid-income-limits/[state]`)
- `d-snp` (205 hits but niche SNP variant; Medicare lighthouse covers dual-eligible)

**Total cut: 26 slugs** (24 critic-mandated + 4 final-32 trim; some collapse pairs).

---

## Internal-Link-Target Validation (Top 10 by real grep hit count)

Re-greped against `/projects/covered-usa/content/` using both hyphenated slug and natural-language phrase variants (per critique §2 — B's hyphenated greps undercount, several slugs are noise-inflated):

| Rank | Slug | Real internal-link hits |
|---:|---|---:|
| 1 | `premium-tax-credit` | 547 |
| 2 | `hsa` | 488 |
| 3 | `special-enrollment-period` | 383 |
| 4 | `household-size` | 282 |
| 5 | `good-faith-estimate` | 187 |
| 6 | `subsidy-cliff` | 144 |
| 7 | `cost-sharing-reduction` | 117 |
| 8 | `medicare-savings-program` | 112 |
| 9 | `qualifying-life-event` | 90 |
| 10 | `prior-authorization` | 93 |

Noise-corrected: B's `pos` (511), `epo` (378), `metal-tier` (200), `hra` (515), `medicare-part-a` (159) all had heavy false-positive grep contamination and are NOT real link-target signals (see critique §2 noise table).

---

## Already-Live and Already-Queued Markers

**already_live=y (3):** deductible, magi, out-of-pocket-maximum

**already_queued=y (10):**
- copay (CU)
- coinsurance (CU)
- premium-tax-credit (CU)
- special-enrollment-period (CU)
- explanation-of-benefits / EOB (CU)
- prior-authorization (CU)
- hdhp (CU)
- balance-billing (CU)
- copay-deductible-coinsurance (CU-149)
- bronze-silver-gold (CU-151)
- hsa-vs-fsa (CU-175)

---

## Notes on Composition Choice

The critic's §7 list was followed structurally. Net total = 32. Single-term/2-hop split is 19/11 with 2 term-with-state-data hybrids (irmaa, medicare-part-d — both year-anchored numeric tables that combine definition + 2026 chart inline).

Per FANOUT §4.5 WARNING + competitor-landscape §4 LOW-leverage rating, the priority-1 internal-link-target tier was kept ruthlessly minimal (8 anchors). The 2-hop comparison set is where additional writer cycles pay off (Bing-citation magnets), so 11 2-hops were preserved including all 5 critic-mandated additions (4-way HMO/PPO/EPO/POS, 3-way MA-vs-Original+Medigap+PartD, 3-way deductible-vs-oop-vs-total, individual-vs-family-deductible-oop, in-network-vs-out-of-network-coinsurance).
