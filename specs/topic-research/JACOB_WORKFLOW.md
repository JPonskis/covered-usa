# Jacob Workflow — How to Write a CoveredUSA Page

**Version:** 1.1 (staging-branch flow as of 2026-05-15 evening)
**Audience:** Jacob (the human writing pages). Companion ops doc for Phase 4 of `BUILD_PLAN.md`.
**Companion files:** `JACOB_QUEUE_TOP_50.md` (auto-regenerable next-50 queue), `MASTER_BACKLOG.csv` (full 2,344-row backlog), `BUILD_PLAN.md` (the plan you signed off on).

---

## 1. The high-level flow (one paragraph)

Open the Master Backlog tab, switch to the "Group 1: Ready to Write" filter view, pick the top row, spawn the writer agent named for that template with the row's TOPIC/STATE/YEAR args. The writer drops a JSON file at the conventional `content/data/<subdir>/<slug>.json` path while the verifier auto-fixes drift. You commit the file to the **`drip-queue`** branch (NOT main — Vercel ignores drip-queue so the page stays hidden), push, then mark Status=Ready in column S of the Master Backlog. The daily 2am UTC drip cron picks the top 15 Status=Ready rows, promotes those JSON files from `drip-queue` → `main` via `git checkout`, pushes main, IndexNow-pings, and flips Status=Published. Repeat as fast as you can write. No matter how many you queue, only 15/day go live.

---

## 1.5. CRITICAL: where to commit your finished JSON files

**Always commit to the `drip-queue` branch. Never push to main directly.**

Why: pushing JSON to main triggers an immediate Vercel deploy → page goes live the same minute. That bypasses the drip throttle and risks Bing seeing a publishing spike. The whole staging-branch architecture exists to make sure go-live is paced at 15/day regardless of how fast you write.

The flow looks like this:

```bash
# 1. You wrote a new page (writer agent dropped the file on disk)
ls content/data/procedures/cataract-surgery.json   # exists, on main's working tree

# 2. Switch to drip-queue and commit there
git checkout drip-queue
git pull origin drip-queue
git add content/data/procedures/cataract-surgery.json
git commit -m "drip-queue: cataract-surgery procedure"
git push origin drip-queue

# 3. Switch back to main (clean working tree on main; the file is now ONLY on drip-queue)
git checkout main

# 4. Mark the Master Backlog row Status=Ready in the Sheet (column S)
# Tomorrow's 2am UTC cron will pick it up + ship to main + IndexNow.
```

The drip-publish cron handles the rest: reads Master Backlog for Status=Ready rows, picks top 15 by priority + demand, runs `git checkout origin/drip-queue -- <path>` to bring each file into main's working tree, commits + pushes main, sleeps 60s for Vercel, IndexNow-submits, marks Status=Published.

**If a file is already on main** (e.g., one-off direct push or older content), the cron just publishes from there — backwards compatible.

---

## 2. How to pick the next page

1. Open the Sheet:
   `https://docs.google.com/spreadsheets/d/1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU/edit#gid=639553785`
2. Above the column letters, click the funnel icon and pick **"Group 1: Ready to Write"**.
   - This view hides all 503 deferred-template rows (persona-x-state, county, carrier-x-state, d-snp, ma-vs-medigap, spanish-twin), all already-shipped rows (`already_live=y`), and any rows currently in flight (`Status` ∈ {Writing, Ready, Published}).
   - Group 1 = ~1,798 actually-pickable rows.
3. Sort is already priority asc + demand_score desc, so the top of the visible list is the next thing to write.
4. Two convenience filter views exist for narrower picks:
   - **"Top 50 P1"** — only priority=1 rows (565 of them after Group 1 filter); grab the next 50 by demand.
   - **"Southeast P1"** — P1 rows in {GA, NC, TN, VA, FL, AL, MS, SC, LA, AR, KY, WV} (181 rows). Useful when batching SE state-fork content.
5. Even faster path: open `JACOB_QUEUE_TOP_50.md` in this directory. It has the next 50 rows pre-formatted with writer agent + spawn args + file path on each line. Regenerate anytime via `node scripts/regen-jacob-queue.js`.

---

## 3. Writer agent per template

| Template | Writer agent | Output file path |
|---|---|---|
| `procedure` | `coveredusa-procedure-writer` | `content/data/procedures/<slug>.json` |
| `drug` | `coveredusa-drug-writer` | `content/data/drugs/<slug>.json` |
| `persona` | `coveredusa-persona-writer` | `content/data/personas/<slug>.json` |
| `event` | `coveredusa-event-writer` | `content/data/events/<slug>.json` |
| `event-x-state` | `coveredusa-event-writer` | `content/data/events/<slug>.json` (slug already includes the state) |
| `qa` | `coveredusa-qa-writer` | `content/data/qa/<slug>.json` |
| `qa-x-state` | `coveredusa-qa-writer` | `content/data/qa/<slug>.json` (pass `SUBTYPE=qa-state-eligibility`) |
| `glossary` | `coveredusa-glossary-writer` | `content/data/glossary/<slug>.json` |
| `ma-state` | `coveredusa-ma-state-writer` | `content/data/medicare-advantage/<slug>.json` |
| `track-d` | `coveredusa-track-d-writer` | `content/data/medicaid-income-limits/<slug>.json` |
| `spanish-twin` | DEFERRED — skip until ES build infra ships |
| `persona-x-state`, `county`, `carrier-x-state`, `d-snp`, `ma-vs-medigap` | DEFERRED — Phase 5 templates do not exist yet |

The Group 1 filter view hides all DEFERRED rows so you should never see one in your pickable queue.

---

## 4. How to spawn the writer

Spawn the writer agent through Claude (Task / Agent tool) with the args that already live in `JACOB_QUEUE_TOP_50.md` for the row. The shape is:

```
Use the <writer-agent-name> agent to write the page for <row_id>.

Inputs:
  TOPIC="<title or topic from Master Backlog>"
  STATE=<two-letter postal code>   # only for state-bearing templates
  SUBTYPE=qa-state-eligibility     # only for qa-x-state rows
  YEAR=2026

Output: content/data/<subdir>/<slug>.json
```

Examples (taken from the live queue):

- **`MB-0002` Georgia MA-state:**
  agent `coveredusa-ma-state-writer`, args `TOPIC="Georgia" STATE=GA YEAR=2026`,
  output `content/data/medicare-advantage/georgia.json`.
- **`MB-0022` CHIP eligibility (state Q&A):**
  agent `coveredusa-qa-writer`, args `TOPIC="CHIP Eligibility by State in 2026: Income Limits for Children (51-Fork)" STATE=NA SUBTYPE=qa-state-eligibility YEAR=2026`,
  output `content/data/qa/chip-eligibility-by-state.json`.
- **(Phase 2) Texas Medicaid Track D:**
  agent `coveredusa-track-d-writer`, args `TOPIC="Texas Medicaid" STATE=TX YEAR=2026`,
  output `content/data/medicaid-income-limits/texas.json`.

The writer agents are formula-aligned per `FANOUT_FORMULA.md` §3 + per-template recipes (§4.1 procedure, §4.2 drug, §4.3 qa-coverage, §4.4 qa-state-elig, §4.5 glossary, §4.6 event, §4.7 persona). Each writer reads its recipe + the universal rules block + the shipped gold-standard reference page before writing. You don't need to hand-feed the recipe.

---

## 5. What the verifier does automatically

Per the 2026-05-15 editor-mode cron rewrite (see `memory/LONG_TERM.md` / TRACK_C_PARALLEL_PLAN.md v1.3), every writer chain runs the matching `*-verifier` agent immediately after the writer:

- **Numeric drift → AUTO-FIX in place.** Wrong year anchors, stale FPL bracket, outdated drug list-price, deleted CPT code, etc. — verifier patches the JSON and re-saves.
- **Structural gaps → DETECT-only.** Missing GATE blocks, wrong section count, schema-mandated fields absent. Verifier flags + the writer is re-invoked in a single auto-correction loop (max 2 rounds).
- **Prose drift → REGEN on MEDIUM+ flags.** Em-dash leaks, AI-tells, FANOUT recipe violations. Verifier regenerates the offending field(s) inline.
- **Hard fails (CRITICAL) → block save + dump report.** Wrong slug, schema-shape break, unverifiable named source — these surface to you with a concrete fix list. Rare on shipped agents (Track C-prime had 5/5 zero-warning ship rates across all writer subtypes).

You do not need to manually run the verifier. The writer agent invokes it as STEP 8 of its own pipeline. You only see the result when the file lands on disk.

---

## 6. How to mark a page Ready

Open the Master Backlog tab, find the `row_id` you just wrote (column A — the queue MD shows it bold like `**MB-0023**`), and set column **S (Status) = `Ready`**.

That's it. Single-cell edit. No other columns get touched manually — the cron stamps T (PublishedDate) and U (PublishedURL) when it ships.

The `Status` lifecycle:

```
(blank)  →  Writing  →  Ready  →  Published
   |          |          |          |
queue       in-flight  cron picks  shipped + indexed
            (optional, you can     up at next 2am UTC
             skip this state)
```

If you want to mark a row `Writing` while you're working on it, the Group 1 filter hides it from your pickable queue so you don't accidentally double-spawn. Optional but recommended for parallel sessions.

---

## 7. What the cron will do

The job lives at `.claude/claudeclaw/jobs/coveredusa-drip-publish.md`, runs daily at 2am UTC (8pm Eastern / 5pm Pacific the previous calendar day), and:

1. Reads `Master Backlog!A2:U` via service account.
2. Filters `Status=Ready`, sorts by priority asc + demand_score desc, **caps at MAX_PER_DAY=10**.
3. For each Ready row, derives the file path from `template` + `topic_slug`, verifies the file actually exists on disk under `content/data/<subdir>/`. Missing files are skipped (warning logged, not failure).
4. `git add` + `git commit -m "drip-publish: ship N template pages YYYY-MM-DD"` + `git push origin main`.
5. Sleeps 60s for Vercel deploy.
6. Submits new live URLs to IndexNow (api.indexnow.org + bing.com/indexnow).
7. Stamps S=`Published`, T=YYYY-MM-DD, U=live URL.
8. Appends "Published as template page at <URL> on <date>" to the SEO Ideas Notes column for any rows with `sheet_row_id` populated (paper trail for the 35 migrated rows).
9. Posts to Telegram with the URL list (or stays silent if nothing was Ready — the normal idle state).

If MAX_PER_DAY=10 feels low after a few weeks of clean shipping, bump it in `scripts/coveredusa-drip-publish.js`. The 10/day floor is a safety buffer against Bing/Google penalizing sudden bulk indexing.

---

## 8. Pace estimates

Group 1 has ~1,798 writable rows.

- **5/day** → 360 days = ~12 months
- **10/day** → 180 days = ~6 months  *(matches MAX_PER_DAY default)*
- **25/day** → 72 days = ~2.5 months  *(needs bumping the cron cap to 25)*
- **50/day** → 36 days = ~5 weeks  *(needs both writing throughput + cap bump; might trip indexing throttles)*

Realistic pace given Claude credit windows + life is probably **5-15/day**. The cron just needs to drain whatever Status=Ready rows you queue up; it scales up to MAX_PER_DAY without intervention.

Any backlog beyond Group 1 (track-d 51 + qa-x-state 306 + event-x-state 218 + spanish-twin 43) lands as new templates ship. Phase 5 templates (persona-x-state etc., 503 rows) get unlocked when the existing-template pipeline is humming.

---

## 9. Special notes

- **Track D pages (`/medicaid-income-limits/<state>`):** spawn `coveredusa-track-d-writer` with `TOPIC="<state name> Medicaid" STATE=<two-letter> YEAR=2026`. Writer + dynamic route ship in Phase 2 (in flight as of 2026-05-15 in a parallel session). Don't try to write track-d rows until that lands — the dynamic route doesn't exist yet, so the JSON would have nowhere to render.
- **QA-x-state pages (`/qa/<topic-by-state>`):** spawn `coveredusa-qa-writer` with `SUBTYPE=qa-state-eligibility` so the writer dispatches to the §4.4 recipe (51-fork eligibility table) instead of the §4.3 coverage recipe. The Master Backlog row's `subtype` column may already say `state-eligibility`; if it does, mirror it into the spawn args.
- **Event-x-state pages (`/event/<event>-<state>`):** spawn the regular `coveredusa-event-writer`. The slug already encodes the state (e.g., `losing-medicaid-texas`), so no separate route or template is needed.
- **Spanish twins (43 rows):** DEFERRED. Don't write these yet — the ES build pipeline (locale-aware sitemap + hreflang tags + Spanish lighthouse pages) hasn't shipped. Status stays blank until then.
- **Personas:** the `cta_target` column says `screener` for all of them — these are the highest-revenue funnel pages. Ship as many P1 personas as you can stomach.
- **Procedure-cost IVF state forks:** `MB-0024` through `MB-0035` (12 SE state IVF pages, all demand=2735) are quick wins — you can spawn all 12 procedure writers in parallel.

---

## 10. Troubleshooting

**Writer fails verifier with CRITICAL flags.** Read the verifier report (printed at the end of the writer's stdout). Re-spawn the writer with `RETRY_NOTES="<the verifier complaints>"` so it knows what to fix. If it fails twice, escalate (paste the report into the chat).

**Writer crashes or returns a partially-written JSON.** Delete the partial file, re-spawn. Writers are idempotent and re-research from scratch.

**File didn't render after deploy.** Check `npx vercel logs` from `projects/covered-usa/` — TypeScript errors usually mean the JSON shape doesn't match the loader's interface. Compare against the shipped gold-standard reference page (e.g., `colonoscopy.json` for procedure, `delaware.json` for ma-state).

**Drip cron didn't ship anything.**
- Most likely: no rows had Status=Ready. The cron stays silent on idle days.
- Verify: open Sheet, filter Status=Ready, check the count.
- If rows are Ready but nothing shipped: check `cron runs` log for the job, look for FATAL.
- Manual override: `cd /Users/jacobposner/clawd/projects/covered-usa && node scripts/coveredusa-drip-publish.js` (runs the same code path as the cron).

**Dry-run the cron without shipping.** The script supports a `--dry-run` flag that prints what *would* ship without committing or stamping the sheet:

```bash
cd /Users/jacobposner/clawd/projects/covered-usa
PATH="/opt/homebrew/bin:$PATH" node scripts/coveredusa-drip-publish.js --dry-run
```

**Manually trigger a publish for one specific row.** Set its Status=Ready, then run the script with `MAX_PER_DAY=1` env override or just let the next 2am UTC tick pick it up. The cron is the safe path; it always runs the same git + IndexNow + Sheet update sequence.

**Force-revert a bad ship.** If a published page broke the build or had a bad fact:
```bash
cd /Users/jacobposner/clawd/projects/covered-usa
git log --oneline -5            # find the bad SHA
git revert <bad-sha> --no-edit  # creates a clean revert commit
git push origin main
```
Then manually flip that Master Backlog row's Status back to `Ready` (and clear T + U) to re-queue it for the next day's drip after fixing the JSON.

**Where to file issues / scope notes.** Write them to `memory/YYYY-MM-DD.md` with a short tag like `[coveredusa-prod]`. Use the daily memory pattern, not a separate ops doc.

---

*Last updated: 2026-05-15. Update this file when the cron behavior, agent map, or sheet schema changes.*
