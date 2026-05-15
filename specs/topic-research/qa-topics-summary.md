# Q&A Topics — Phase 4 Synthesis Summary

**Date:** 2026-05-15
**Inputs merged:** qa-topics-a.csv (102 rows) + qa-topics-b.csv (180 rows) + qa-topics-critique.md
**Output:** qa-topics.csv (canonical) + qa-topics-rerouted-to-track-d.csv (Track D handoff)

---

## 1. Routing Verdict Applied (CRITICAL)

Per critique §1 + §9 (HIGH confidence, three independent arguments converge): **Track D `/medicaid-income-limits/[state]` owns all 51 state-Medicaid income-limit + state-Medicaid-eligibility pages.** `/qa/` keeps coverage Q&A + non-income-limit state eligibility (CHIP, MSP, SPAPs, immigrant Medicaid, pregnancy state-fork, state-fork coverage Q&As).

**Three reasons (HIGH confidence):**
1. URL-as-query alignment (FANOUT §5.1) — `/medicaid-income-limits/california` matches "california medicaid income limits 2026" verbatim; `/qa/medicaid-california` does not.
2. Template-purpose honesty — 51-row income-limit tables are lookup factories, not conversational Q&As.
3. Self-cannibalization avoidance — never build two CoveredUSA URLs for the same query.

---

## 2. Final Counts

| Bucket | Count |
|---|---|
| **Canonical Q&A (qa-topics.csv) total** | **194** |
| ├ qa-coverage | 143 |
| ├ qa-state-eligibility | 51 |
| **Rerouted to Track D (qa-topics-rerouted-to-track-d.csv)** | **69** |
| ├ state-Medicaid income-limit slugs (state-brand variants) | 17 |
| ├ medicaid-eligibility-[state] from B (50 states + DC + family-of-4 facet) | 52 |
| Already live (reference only, in canonical) | 3 |
| Already queued (BUSA universe match, in canonical) | 5 |
| Priority 1 | 92 |
| Priority 2 | 87 |
| Priority 3 | 15 |

**Coverage Q&A expansion:** 143 base rows. With state-fork pages built out (does-medicaid-cover-glp1-by-state alone = 51 fork pages; abortion/gender-affirming/IVF/adult-dental Medicaid forks ~30 more), realistic expanded coverage page count is ~280-320.

**State-elig Q&A expansion:** 51 base rows of which 6 are 51-fork umbrellas (CHIP-by-state, MSP-by-state, SPAPs-by-state, pregnancy-by-state, retroactive-by-state, immigrant-by-state). Realistic expanded fork count: 6 × 51 = **~306 state-fork pages** under `/qa/`. The 8 sampled CHIP child pages and 7 sampled MSP child pages already in the canonical CSV are the priority/brand-strength examples; the writer agent will generate the full 51 set per umbrella using state-fork doctrine.

**Total `/qa/` URL count target:** ~150 unique topics + ~280 coverage forks + ~306 state-elig forks ≈ **~700-750 final pages.** Track D adds another ~51 income-limit factory pages on top.

---

## 3. Critique additions applied

**Added coverage Q&As (§2):**
- `does-medicare-cover-cologuard`
- `does-medicare-cover-pap-smear`
- `does-medicare-cover-hpv-test`
- `does-medicare-cover-psa-test`
- `does-medicare-cover-lung-ct-screening`
- `does-aca-cover-acupuncture-2026` (state-fork)
- `does-aca-cover-chiropractic-2026` (state-fork)
- `does-medicare-second-opinion-coverage`
- `does-medicare-cover-mounjaro-2026` (state-fork)
- `does-medicare-cover-zepbound-2026` (state-fork)
- `does-medicaid-cover-glp1-by-state` (51-fork — drug-critique homed here)

**Added state-elig Q&As (§3):**
- `chip-eligibility-by-state` (51-fork umbrella + 8 sampled brand pages: AL, CA, FL, GA, NY, TX, WA, IL)
- `medicare-savings-program-by-state` (51-fork umbrella + 7 sampled: AL, CA, CT*, FL, ME*, MN*, NY*, TX — *P1 due to state-funded expansion)
- `state-pharmaceutical-assistance-programs` (51-fork umbrella + 4 brand pages: NY EPIC, NJ PAAD, PA PACE, MA Prescription Advantage)
- `medicaid-immigrant-coverage-by-state` (51-fork)
- `pregnancy-medicaid-by-state` (51-fork)
- `medicaid-retroactive-eligibility-by-state` (51-fork)
- `state-continuous-eligibility-kids` (51-fork)

**Demand corrections applied (§4):**
- `does-medicare-cover-hearing-aids`: 3200 → 1900 (strict-match clean signal; A was double-counting broad)
- `obamacare-still-available-2026`: 720 → 2000, priority 1 (OBBB policy news angle)
- `extra-help-eligibility-2026`: 820 → 3500, priority 1 (Bing 21,942 broad)
- `state-medicaid-income-limits`/`-ahcccs-`: corrected to 8000 in reroute CSV (AHCCCS is #1 state-brand)

**BUSA overlap corrections (§5):**
- `does-medicaid-cover-dental-adults`: none → slight
- `who-qualifies-for-aca-subsidy`: slight → heavy (skip state fork, BUSA owns)
- `is-medicare-supplement-worth-it`: none → slight
- `can-i-have-both-medicare-and-medicaid`: none → slight
- `can-i-have-medicaid-and-aca`: heavy → slight

**Title fixes (§8):** All B's `(2026 Answer)` parens-in-title rewritten to in-flow text (e.g., "Does Medicare Cover Dental Care in 2026?").

**Head-term demotions (§7):** `does-medicare-cover-flu-shot`, `does-medicare-cover-er-visits`, `does-aca-cover-preventive-care`, `does-aca-cover-essential-health-benefits`, `does-medicare-cover-physical-therapy`, `does-medicare-cover-glasses` → P2.

**Long-tail promotions (§7):** `does-medicare-advantage-cover-dental-2026`, GLP-1 state-fork, year-anchored MA add-on Q&As → P1.

---

## 4. Top 15 priority Q&As (by corrected demand)

1. `extra-help-eligibility-2026` (3500, P1) — Bing 21,942 broad, BUSA-slight
2. `chip-eligibility-by-state` (3200, P1) — 51-fork umbrella
3. `medicare-savings-program-by-state` (3000, P1) — 51-fork umbrella, state-funded expansion angle
4. `does-medicare-cover-ozempic` (2400, P1) — Type-2 vs WL policy hook
5. `aca-marketplace-subsidy-eligibility-2026` (2400, P1) — subsidy cliff news
6. `state-pharmaceutical-assistance-programs` (2200, P1) — SPAPs, BUSA blank space
7. `obamacare-still-available-2026` (2000, P1) — OBBB policy news
8. `does-medicare-cover-hearing-aids` (1900, P1) — strict-match corrected
9. `does-medicare-cover-wegovy` (1900, P1) — CV indication angle
10. `does-medicare-cover-glp1-weight-loss` (1400, P1) — class umbrella
11. `does-medicare-cover-mental-health` (1400, P1) — high-utilization
12. `does-medicaid-cover-nursing-home` (1400, P1) — income/asset rules
13. `medicare-vs-medicaid-coverage` (1400, P1) — comparison-shape
14. `medicaid-vs-medicare-eligibility` (1400, P1) — sibling comparison
15. `medicaid-immigrant-coverage-by-state` (1400, P1) — politically hot 2026 expansion

---

## 5. Track D coordination

**Files for Track D handoff:** `qa-topics-rerouted-to-track-d.csv` (69 rows) is the Q&A team's contribution to Track D scope. Track D should:

1. Build `/medicaid-income-limits/[state]` for all 50 states + DC = 51 pages (the canonical lookup factory).
2. Use the rerouted brand-variant rows (Medi-Cal, AHCCCS, HUSKY, BadgerCare, MaineCare, SoonerCare, MNsure, HIP, NJ FamilyCare, OHP, TennCare, ARHOME, MassHealth, AllKids, CHP+, MO HealthNet, Cardinal Care, Apple Health, Granite Advantage, Centennial Care, Pathways, Healthy Connections, Healthy Louisiana, Heritage Health, IA Health Link, KanCare, Med-QUEST, Healthy Michigan, RIte Care, Cardinal Care, Green Mountain Care) — these inform the H1/title/intro-prose state-brand canonicalization on each page.
3. Family-of-4 + household-size variants live as facets on the Track D state pages (not separate URLs) per FANOUT §4.4.
4. **#1 priority state-brand: AZ AHCCCS** (90,165 broad / 23,895 strict Bing impressions — highest state-brand volume per critique §4).

**Cross-reference notes:**
- **State-Medicaid GLP-1 fork now lives at `/qa/does-medicaid-cover-glp1-by-state`** (51-fork Q&A) — Drug-critique flagged this as misplaced under drug template; Q&A is the correct home per FANOUT §4.3 coverage-Q&A shape with state-fork.
- **State-MSP page expansion** (CT/MN/ME/NY have state-funded MSP above federal floors) lives under `/qa/medicare-savings-program-by-state` and per-state children — NOT under Track D (these are program-eligibility variations, not Medicaid income-limit lookups).
- **CHIP factory question (escalation to Jacob):** critique §9 recommended deferring a `/chip-income-limits/[state]` factory. CHIP is currently built under `/qa/chip-eligibility-[state]`. Revisit in 3 months if data justifies promotion.

---

## 6. Open questions / risks

- **CHIP-factory decision:** defer per critique §9; currently `/qa/` owns.
- **Pregnancy-Medicaid state-fork:** 2 entries (`pregnancy-medicaid-by-state` umbrella + `state-medicaid-pregnant-women` income-detail) intentionally kept separate — one is national Q&A coverage shape, the other is per-state income-limit detail. Writer should consolidate if signal overlaps.
- **State-MSP expansion states (CT/ME/MN/NY) flagged P1 individually** since the state-funded expansion is the distinctive content angle Bing/AI can't easily synthesize from federal sources.
