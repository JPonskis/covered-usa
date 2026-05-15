# Drip-Publish Cron — Spec

**Owner:** CoveredUSA bulk-production pipeline (Phase 1 of `BUILD_PLAN.md`)
**Status:** Live
**Date:** 2026-05-15

---

## Purpose

Daily cron that ships pre-written template JSON pages from the **Master Backlog** Google Sheet tab to coveredusa.org. Pure publisher — no AI, no writing, no JSON generation. Pages live on disk as `content/data/<subdir>/<slug>.json` before this cron runs.

This frees Jacob (and per-template writer agents) to produce pages on their own cadence. The drip cron picks them up the next morning, commits them in a single batch, and submits to IndexNow so they get indexed fast.

---

## Architecture

```
[Writer agents / Jacob] → write JSON → content/data/<subdir>/<slug>.json
                                          │
                       Mark Master Backlog row Status=Ready
                                          │
                                          ▼
              ┌──── Daily cron 02:00 UTC ────┐
              │ coveredusa-drip-publish.md   │
              │     ↓                         │
              │ scripts/coveredusa-drip-     │
              │   publish.js                  │
              └───────────────┬───────────────┘
                              ▼
       1. Read Master Backlog tab (Status=Ready, top 10)
       2. Verify file exists for each row
       3. git add + commit + push
       4. Sleep 60s for Vercel deploy
       5. Submit URLs to IndexNow (Bing + api.indexnow.org)
       6. Mark Master Backlog Status=Published / PublishedDate / PublishedURL
       7. Append back-ref to SEO Ideas Notes (if sheet_row_id populated)
       8. Telegram report (silent if zero shipped)
```

---

## Trigger

| Property      | Value                                          |
|---------------|------------------------------------------------|
| Schedule      | `0 2 * * *` (daily at 02:00 UTC)               |
| Cron file     | `.claude/claudeclaw/jobs/coveredusa-drip-publish.md` |
| Script        | `projects/covered-usa/scripts/coveredusa-drip-publish.js` |
| Throttle      | `MAX_PER_DAY = 10` (constant in script)        |
| Host          | Mac mini (`/Users/frankthebot/clawd`)          |
| Notification  | Telegram (silent on zero ships, alert on failure) |

The 02:00 UTC schedule is offset from the daily blog cron (Stage 1 at 13 UTC, Stage 2 at 14 UTC) to avoid git-push collisions.

---

## File path conventions per template

| `template` value      | Directory under `content/data/` | Example URL |
|-----------------------|---------------------------------|-------------|
| `procedure`           | `procedures/`                   | `/en/cost/<slug>` |
| `drug`                | `drugs/`                        | `/en/drug/<slug>` |
| `persona`             | `personas/`                     | `/en/for/<slug>` |
| `event`               | `events/`                       | `/en/event/<slug>` |
| `event-x-state`       | `events/`                       | `/en/event/<slug>` |
| `qa`                  | `qa/`                           | `/en/qa/<slug>` |
| `qa-x-state`          | `qa/`                           | `/en/qa/<slug>` |
| `glossary`            | `glossary/`                     | `/en/glossary/<slug>` |
| `ma-state`            | `medicare-advantage/`           | `/en/medicare-advantage/<slug>` |
| `track-d`             | `medicaid-income-limits/`       | `/en/medicaid-income-limits/<slug>` (after Phase 2) |
| `spanish-twin`        | DEFERRED                        | (skipped) |
| `persona-x-state`     | DEFERRED (Phase 5)              | (skipped) |
| `county`              | DEFERRED (Phase 5)              | (skipped) |
| `carrier-x-state`     | DEFERRED (Phase 5)              | (skipped) |
| `d-snp`               | DEFERRED (Phase 5)              | (skipped) |
| `ma-vs-medigap`       | DEFERRED (Phase 5)              | (skipped) |

URL is built from the `route` column in the Sheet, prefixed with `/en` (or used as-is for `/es/*` Spanish twins). The `route` is the canonical source — don't derive it from `template + slug`.

---

## Status flow

| Status      | Set by      | Meaning |
|-------------|-------------|---------|
| (blank)     | default     | Queued. Not yet started. |
| `Writing`   | Jacob/agent | Writer is in flight (optional state — informational). |
| `Ready`     | Jacob/agent | JSON file is on disk and reviewed. Drip will pick this up next run. |
| `Published` | Drip cron   | Shipped to git + indexed. `PublishedDate` and `PublishedURL` are set. |

The cron only acts on `Status=Ready`. Anything else is ignored.

---

## Master Backlog schema

Tab: `Master Backlog` (gid 639553785) on Sheet ID `1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU`.

| Col | Header             | Source       |
|-----|--------------------|--------------|
| A   | row_id             | seed         |
| B   | template           | seed         |
| C   | route              | seed         |
| D   | topic_slug         | seed         |
| E   | state              | seed         |
| F   | title              | seed         |
| G   | priority           | seed         |
| H   | demand_score       | seed         |
| I   | competitor_density | seed         |
| J   | busa_overlap       | seed         |
| K   | cta_target         | seed         |
| L   | subtype            | seed         |
| M   | topic_type         | seed         |
| N   | already_live       | seed         |
| O   | migrated_from_sheet| seed         |
| P   | sheet_row_id       | seed         |
| Q   | sources            | seed         |
| R   | notes              | seed         |
| **S** | **Status**       | **drip cron + Jacob** |
| **T** | **PublishedDate**| **drip cron** |
| **U** | **PublishedURL** | **drip cron** |

Columns S/T/U were added by `scripts/add-master-backlog-status-columns.js`.

---

## Failure modes & recovery

| Failure                                     | What happens                                                                  | How to recover |
|---------------------------------------------|-------------------------------------------------------------------------------|----------------|
| File missing (Status=Ready but no JSON)     | Logged as SKIP, batch continues with remaining rows. Row stays Status=Ready.  | Either write the file or revert the row's Status. |
| Deferred template (e.g. `county`)            | Logged as SKIP with reason `deferred-template`. Row stays Ready.              | Don't mark Status=Ready until Phase 5 templates ship. |
| `git push` fails (auth, conflict)            | Hard fail. Telegram alert. Sheet not updated. Files staged but not pushed.    | Fix git auth (`gh auth status`), then `git push origin main` manually + manually flip Status=Published. |
| Vercel deploy slow (URL not live yet)        | IndexNow returns 200 but Bing won't find the URL on first crawl.              | Non-fatal. Bing recrawls on its next sweep. |
| IndexNow all endpoints fail                  | Logged as warning, Sheet still flips to Status=Published.                     | Manually retry with `scripts/coveredusa-indexnow-submit.js <url>...`. |
| Sheet update fails after git push            | Telegram alert: pages shipped to git, sheet stale. Won't auto-retry.          | Manually flip Status=Published / set columns S/T/U on shipped rows. |
| SEO Ideas back-ref update fails              | Non-fatal warning, drip continues. Master Backlog still updated correctly.    | Optional: manually append note to SEO Ideas Notes. |

The script always prints a SHIP/SKIP line per row plus a final summary block, so the Telegram report has enough context to drive any manual cleanup.

---

## Manual triggers

| Goal                          | Command |
|-------------------------------|---------|
| Run normally (cap at MAX_PER_DAY=10) | `node scripts/coveredusa-drip-publish.js` |
| Preview only — no writes      | `node scripts/coveredusa-drip-publish.js --dry-run` |
| Catch-up burst                | `node scripts/coveredusa-drip-publish.js --limit=25` |
| Test a single row             | `node scripts/coveredusa-drip-publish.js --dry-run --limit=1` |
| Combine flags                 | `node scripts/coveredusa-drip-publish.js --dry-run --limit=5` |

All commands run from the repo root: `/Users/frankthebot/clawd/projects/covered-usa/` (Mac mini) or the equivalent on MacBook. The script uses `__dirname` so it works on both.

Always prefix with `PATH="/opt/homebrew/bin:$PATH"` when invoking under cron.

---

## Throttle tuning

Starting at 10/day. The FANOUT research (and general SEO consensus) suggests 10-25/day is the safe band for a small site to avoid sudden-spike penalties from Bing/Google. After 2-3 weeks of clean cron runs, consider raising to 25.

To raise: edit `MAX_PER_DAY` in `scripts/coveredusa-drip-publish.js`.

---

## Reusable code

This script borrows patterns from:
- `scripts/coveredusa-indexnow-submit.js` — IndexNow endpoint logic + verified key
- `scripts/mark-sheet-duplicates.js` — googleapis batchUpdate write pattern
- `scripts/build-master-backlog.js` — googleapis read pattern
- `.claude/claudeclaw/jobs/coveredusa-seo-stage2.md` — git push + 60s deploy wait
