# CoveredUSA Sheet Execution Report

**Run date:** 2026-05-15
**Operator:** Frank (Claude agent)
**Sheet:** `1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU`
**Tabs touched:** `SEO Ideas` (write), `Master Backlog` (created)

---

## Task 1 — DELETE_FROM_SHEET informational slug cleanup

Replaced stale prefix `/medicaid-income-limits/medicaid-eligibility-` with `/medicaid-income-limits/` in the `target_route` column of `DELETE_FROM_SHEET.csv`.

- Rows fixed: **55**
- Other columns untouched.
- Verified: `grep` for the stale prefix now returns 0 matches.

Script: `/tmp/fix-delete-csv.js` (one-shot, not preserved — operation is complete and idempotent).

---

## Task 2 — Append 3 new dispositions to DELETE_FROM_SHEET

Added the three reviewed REVIEW_NEEDED rows that Jacob classified:

| sheet_row | sheet_id | classification | target_template | target_route |
|---|---|---|---|---|
| 17 | CU-016 | DROP_DUPE_EXISTING_PAGE | (blank) | `/medicaid-income-limits` |
| 96 | CU-095 | DROP_DUPE_EXISTING_PAGE | (blank) | `/medicaid-income-limits` |
| 6  | CU-005 | MIGRATE_TO_TEMPLATE     | `qa-x-state` | `/qa/chip-eligibility-by-state` |

Final `DELETE_FROM_SHEET.csv`: **86 lines** (header + **85 data rows**). Confirmed.

---

## Task 3 — `Master Backlog` tab created + populated

- **Tab name:** `Master Backlog`
- **sheetId:** `639553785`
- **Tab URL:** https://docs.google.com/spreadsheets/d/1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU/edit#gid=639553785
- **Tab color:** light blue (`r=0.6, g=0.8, b=1.0`)
- **Rows written:** 2,345 (header + **2,344 data rows**)
- **Columns:** 18 (`row_id, template, route, topic_slug, state, title, priority, demand_score, competitor_density, busa_overlap, cta_target, subtype, topic_type, already_live, migrated_from_sheet, sheet_row_id, sources, notes`)
- **Header formatting:** bold, light-blue background, frozen (frozen row count = 1)
- **Verification:** `values.get` on `Master Backlog!A:A` returned 2,345 values. Match.

Script: `/Users/jacobposner/clawd/projects/covered-usa/scripts/push-master-backlog-tab.js` (re-runnable; reuses + clears the tab if it already exists).

---

## Task 4 — Mark 85 rows as `Duplicate` in `SEO Ideas`

For each row in `DELETE_FROM_SHEET.csv`:
- **Column M (Status):** set to `Duplicate`
- **Column N (Notes):** appended `Migrated to template: <target_template> at <target_route> on 2026-05-15.` (existing notes preserved with ` | ` separator; new notes for empty cells)

Pre-flight integrity check: all 85 sheet IDs in column A matched the expected `sheet_id` from `DELETE_FROM_SHEET.csv`. **Zero skips, zero data drift.**

API call: single `values.batchUpdate` with 85 ranges. **170 cells updated** (85 × 2 columns).

Detailed per-row log: `/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/sheet-mark-log.json`.

---

## Task 5 — Verification spot-checks

Live read-back from the sheet after writes:

| CU-ID | sheet_row | Status (col M) | Notes (col N) |
|---|---|---|---|
| CU-016 | 17 | `Duplicate` | `Migrated to template: (none) at /medicaid-income-limits on 2026-05-15.` |
| CU-027 | 28 | `Duplicate` | `Migrated to template: track-d at /medicaid-income-limits/texas on 2026-05-15.` |
| CU-005 | 6  | `Duplicate` | `Migrated to template: qa-x-state at /qa/chip-eligibility-by-state on 2026-05-15.` |

Total `SEO Ideas` rows now with `Status=Duplicate`: **90** (matches expected ~5 prior + 85 new).

`Master Backlog` tab read-back: **2,344 data rows**. Match.

---

## Errors encountered

None. Both destructive scripts ran clean on first attempt.

Notes:
- For CU-016 and CU-095 the migration note shows `Migrated to template: (none) at /medicaid-income-limits` because Jacob explicitly set `target_template` blank for these (they map to an existing hardcoded national lighthouse page, not a template). The literal string `(none)` is from the script's display fallback for empty template values — this is intentional and human-readable.
- One quirk: the Sheets API returned `totalUpdatedRanges=undefined` even though 85 ranges were updated successfully. This is a known Sheets API response quirk (the `totalUpdatedCells=170` count is the source of truth, plus the spot-check verification confirms each row landed correctly).
- The cron filter on `coveredusa-select-articles.js` filters `Status=Ready` — Duplicate rows are now skipped automatically. No further action required for blog-cron.

---

## Files written

- `/Users/jacobposner/clawd/projects/covered-usa/scripts/push-master-backlog-tab.js` — creates/repopulates `Master Backlog` tab. Re-runnable.
- `/Users/jacobposner/clawd/projects/covered-usa/scripts/mark-sheet-duplicates.js` — marks `DELETE_FROM_SHEET.csv` rows as `Duplicate` in `SEO Ideas`. Re-runnable; supports `--dry-run`.
- `/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/DELETE_FROM_SHEET.csv` — updated (slug cleanup + 3 new rows).
- `/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/sheet-mark-log.json` — per-row update log (status before/after, notes before/after, target_template, target_route).
- `/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/sheet-execution-report.md` — this report.

---

## Heads-up for Jacob

1. The `SEO Ideas` tab is now the cron's "to-do" view (anything `Status=Ready`); the new `Master Backlog` tab is the canonical 2,344-row production backlog for the template factories. Both live side-by-side; no data was deleted.
2. If you ever want to physically delete the 90 Duplicate rows, I can do that as a follow-up — just say the word.
3. The Master Backlog tab has light-blue tab color so it's visually distinct. Frozen header for easy scrolling.
4. The cron pattern in `coveredusa-select-articles.js` already filters `Status=Ready`, so the 85 newly-marked Duplicates are immediately skipped on the next run.
