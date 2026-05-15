# Persona Topics — Canonical Synthesis Summary

**Date:** 2026-05-15
**Inputs:** persona-topics-a.csv (101 rows, data-driven) + persona-topics-b.csv (130 rows, coverage) + persona-topics-critique.md
**Output:** persona-topics.csv (170 rows canonical)

---

## Total canonical count

- **170 rows total** in persona-topics.csv
- **162 writable** (excluding 7 LIVE pages + 1 LIVE row with dup early-retirees variant flagged for merge)
- **155 net new candidates** (162 writable − 7 already-queued items)

Slug convention: plural (`gig-workers`, `college-students`, `early-retirees`) — confirmed against live `/for/[persona]` content/data/personas/.

---

## Priority breakdown

| Priority | Total | Writable |
|---|---|---|
| P1 | 47 | 46 |
| P2 | 83 | 83 |
| P3 | 40 | 33 |

P1 is the bulk-publish target. P2 backfills after P1 ships. P3 is long-tail / niche occupation / deferred.

---

## Subsidy-cliff distribution

- **77 of 170 rows** (45%) flagged `subsidy_cliff_hit=y`
- Includes the standalone P1 persona `above-400-fpl-subsidy-cliff` (critique §4.1 — 2026 news-cycle persona)
- Highest-value subsidy-cliff personas: 1099-contractors, freelancers, sole-proprietors, sixtysomethings-pre-medicare, early-retirees-pre-65, families-of-4-plus, just-quit-to-start-business

---

## State-fork factory

- **22 base personas marked `state_specific=y`** (non-state-locked).
- Conservative 9 (per critique core list): gig-workers, doordash-uber-drivers, realtors, truckers, farmers, daca-recipients, undocumented, medicaid-gap-residents, rural-residents → **9 × 51 = 459 pages** Phase 2 commitment.
- Full 22 if executed: **22 × 51 = 1,122 pages** (includes traveling-nurses, remote-workers, trans-non-binary, multi-state-workers, ranchers, fishermen, etc.).
- Plus 8 state-locked head-pages already in canonical list (gig-workers-california-ab5, gig-workers-newyork, gig-workers-texas, self-employed-california through illinois).

**Recommendation:** Ship conservative 9 × 51 first. Trans-non-binary + rural-residents are urgent (state coverage bans, plan availability) so push those in batch 1.

---

## Top 15 priority personas (P1 writable, by demand)

| Rank | Topic | Demand | State-fork |
|---|---|---|---|
| 1 | children-kids | 1100 | n |
| 2 | veterans | 1000 | n |
| 3 | 1099-contractors | 940 | n |
| 4 | pregnant-women | 830 | n |
| 5 | small-business-owners | 820 | n |
| 6 | part-time-workers | 720 | n |
| 7 | unemployed | 700 | n |
| 8 | single-mothers | 610 | n |
| 9 | doordash-uber-drivers | 600 | **y** |
| 10 | single-parents | 520 | n |
| 11 | freelancers | 500 | n |
| 12 | sole-proprietors | 440 | n |
| 13 | immigrants-undocumented | 440 | **y** |
| 14 | between-jobs | 400 | n |
| 15 | just-laid-off | 400 | n |

Notable P1 critique-added (below top-15 by demand but unique angles): caregivers-aging-parents, just-quit-to-start-business, dependents-aging-off-26, rural-residents, dual-eligibles, above-400-fpl-subsidy-cliff.

---

## Personas dropped + reasoning

| Dropped/Skipped | Reason |
|---|---|
| seniors-medicare-eligible | Cannibalizes MA-state factory (critique §2.3). MA-state owns this surface. |
| onlyfans-creators | Brand-safety + lead-quality concerns (critique §5). Defer indefinitely. |
| seniors-over-65 / retirees-medicare-age (B variants) | Collapsed into MA-state template ownership. |
| Duplicate `early-retirees` (B's row) | Flagged as LIVE-dup; the A row `early-retirees-pre-65` flagged for merge or SEO-variant. |
| Standalone `entrepreneurs` (A demand=1240) | Demand-score inflated by brand non-coverage intent (critique §2.4). Merged into `startup-founders-entrepreneurs` at deflated demand=300. |

Demand deflations applied per critique §2:
- instacart-shoppers: 4120 → 400
- doordash-uber-drivers: 2890 → 600
- veterans: 2400 → 1000
- entrepreneurs: 1240 → folded into startup-founders-entrepreneurs at 300

---

## Niche occupation roster (P2 promoted from P3 per critique §4.3)

These were P3 long-tail in both A and B but have strong 1099-tax + SE-deduction angle + fragmented competition. Promoted to P2 for batch-2 publish:

- realtors (1.5M NAR, state-fork)
- truckers (2M, DOT state-fork)
- farmers (2M, P1 actually — premium-quadrupling story)
- cosmetologists-stylists (700K booth-renters)
- electricians-self-employed (700K)
- plumbers-self-employed (500K)
- fitness-trainers (450K)

Remaining P3 niche occupations (still ship-worthy, just lower priority): yoga-instructors, massage-therapists, dog-walkers-pet-care, nannies-au-pairs, photographers (covered by freelance-photographers P2), cleaners-self-employed, chefs-restaurant-owners, foster-parents, missionaries, podcasters, dancers.

---

## Judgment-call notes

1. **State-fork breadth.** Marked 22 personas as state-fork — more aggressive than critique's conservative-9 and aggressive-14. Documented above so the factory can ship at 9, 14, or 22 depending on capacity. The 9-conservative list is the safest first batch.

2. **`early-retirees-pre-65`** kept as a writable row even though `early-retirees` is LIVE. The "Pre-65 bridge" framing is keyword-distinct from the live `/for/early-retirees`. Flag for SEO review before generation — either merge into live or ship as a sibling page.

3. **`caregivers` BUSA overlap re-angle.** Critique §3.2 says reclassify the article title as "health-insurance-while-caregiving" (not "benefits for caregivers"). CSV title_hint already reflects this. Writer prompt must enforce.

4. **stay-at-home-moms SUBTYPE DISPATCH.** Critique called out that the persona needs to branch (Medicaid-spouse-income vs marketplace-under-spouse). Flagged in notes column; writer must handle subtype.

5. **`already_queued` honored per task spec.** doordash-uber-drivers, small-business-owners, part-time-workers, 1099-contractors — flagged `y` regardless of what `_queue.json` says (spec wins).

6. **Dropped redundant variants** by intent-collapse: artists + artists-musicians → artists-independent. Postmates + TaskRabbit → postmates-taskrabbit-gig. Upwork + Fiverr → upwork-fiverr-freelancers.
