# CoveredUSA Cross-Reference Report

**Generated:** 2026-05-15
**Source script:** `projects/covered-usa/scripts/build-master-backlog.js`
**Sheet ID (read-only):** `1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU`

---

## 1. Sheet pull confirmation

- Total rows pulled: **420**
- Sheet headers: 18 columns
- Raw pull saved to: `/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/sheet-rows-raw.csv`
- **No writes or deletions** were performed on the Sheet.

## 2. Sheet decisions breakdown

| Classification | Count |
|---|---|
| KEEP_AS_BLOG | 120 |
| KEEP_AS_BLOG_NO_TEMPLATE_MATCH | 120 |
| MIGRATE_TO_TEMPLATE | 78 |
| REVIEW_NEEDED | 45 |
| DROP_DUPE_EXISTING_PAGE | 4 |

**Total classified:** 367

## 3. BUSA cross-reference findings

- Total template-BUSA overlap candidates: **43**
- Heavy-overlap (jaccard ≥ 0.75): **0**
- Moderate-overlap (0.55-0.75): **2**
- Slight-overlap (0.40-0.55): **41**

**No template topics were dropped for BUSA overlap.** Per intent-split rule (TOPIC_ROADMAP §1.8 & §4.6):
- BUSA = "how to apply for X" (procedural)
- CoveredUSA = "do I qualify? what are the income limits?" (eligibility lookup with FANOUT structure: 9-row household-size table, year-anchored, competitor-density-aware)

Heavy-overlap rows are flagged for Jacob's confirmation but kept in MASTER_BACKLOG. Detailed list: `/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/busa-cross-reference.csv`.

## 4. MASTER_BACKLOG composition

- **Total rows:** 2344
- **Migrated from Sheet:** 35

### By template

| Template | Count |
|---|---|
| persona-x-state | 356 |
| procedure | 327 |
| qa-x-state | 306 |
| drug | 276 |
| event-x-state | 218 |
| event | 195 |
| qa | 191 |
| persona | 162 |
| carrier-x-state | 60 |
| track-d | 51 |
| county | 50 |
| ma-state | 43 |
| spanish-twin | 43 |
| d-snp | 30 |
| glossary | 29 |
| ma-vs-medigap | 7 |

### By priority

| Priority | Count |
|---|---|
| P1 | 681 |
| P2 | 1282 |
| P3 | 381 |

### State-fork expansion totals

- procedure × state-fork (3 topics × 51 states): rows produced 153
- persona-x-state (9 personas × 51 + adjacent persona-x-state-MVP curated 50): 356
- event-x-state (5 events with state-fork, turning-26 capped): 218
- qa-x-state (6 umbrellas × 51): 306
- track-d (51 canonical state Medicaid factory): 51
- ma-state (43 remaining states): 43
- spanish-twin (51 mechanical Spanish twins of MA-state): 43
- d-snp (top 30 states): 30
- ma-vs-medigap (7 guaranteed-issue states): 7
- carrier-x-state (5 carriers × 12 states): 60
- county (top-5 × top-10 states curated 50): 50

## 5. Southeast prioritization impact

Per Jacob's instruction: SE states (GA, NC, TN, VA, FL, AL, MS, SC, LA, AR, KY, WV) make money. State-bearing topics in SE were boosted to **priority=1**.

- Total state-bearing rows in backlog: 1317
- SE-state rows in backlog: 323
- SE-state rows promoted to P1: **297**

## 6. Cross-template boundary policy applications

Per TOPIC_ROADMAP §4 (cross-template boundaries):

- **§4.1 Procedure vs Q&A** — applied to sheet rows. Cost-focused titles (CPT codes, "how much does X cost") → procedure migration. "Does Medicare/Medicaid cover X procedure" → qa migration.
- **§4.2 Drug vs Q&A** — applied. State-Medicaid GLP-1 reroutes to qa-state-eligibility (already handled in template CSVs).
- **§4.3 Glossary vs Q&A** — kept template CSVs as-is; no sheet rows shifted.
- **§4.4 Persona vs Event** — kept distinct. Sheet row "Just Got Married" → event template; "1099 Contractors" → persona template.
- **§4.5 ma-state vs persona × state** — adjacent template surface added (50 MVP rows in backlog).
- **§4.6 Track D vs qa-state-eligibility** — applied aggressively to sheet rows. ALL state-Medicaid eligibility/income/apply/CHIP intent rows routed to Track D.

## 7. REVIEW_NEEDED rows for Jacob's eyes

45 rows landed in REVIEW_NEEDED. Top 5 most ambiguous:

- **Row 6 / CU-005:** "CHIP Eligibility Requirements 2026: Does Your Child Qualify?" — possible match to qa/chip-eligibility-new-york (jaccard 0.63)
- **Row 10 / CU-009:** "Health Insurance Options When You Are Unemployed in 2026" — possible match to persona/freelancers (jaccard 0.50)
- **Row 11 / CU-010:** "Health Insurance for College Students: Cheapest 2026 Options" — possible match to event/graduated-college (jaccard 0.56)
- **Row 17 / CU-016:** "Medicaid Income Limits by State 2026: Complete Chart" — possible match to event/medicaid-pregnant-women-2026 (jaccard 0.56)
- **Row 20 / CU-019:** "Cheapest Health Insurance Options in 2026" — possible match to persona/freelancers (jaccard 0.50)

(Full list: filter `/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/sheet-decisions.csv` for `classification=REVIEW_NEEDED`.)

## 8. Outputs on disk

- `/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/sheet-rows-raw.csv` — raw Sheet pull (420 rows)
- `/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/sheet-decisions.csv` — per-row classification (367 rows)
- `/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/busa-cross-reference.csv` — BUSA cross-reference (43 candidate overlaps)
- `/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/MASTER_BACKLOG.csv` — MASTER_BACKLOG (2344 rows, sorted by priority asc + demand desc)
- `/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/DELETE_FROM_SHEET.csv` — sheet rows recommended for deletion (82 rows)
- `/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/cross-reference-report.md` — this report

## 9. Confirmations

- [x] Read-only on Google Sheet (no `update`, `append`, `batchUpdate`, `delete` calls)
- [x] No template CSVs modified
- [x] All 5 outputs present on disk

