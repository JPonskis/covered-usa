# CoveredUSA Bulk Production — Build Plan

**Date:** 2026-05-15
**Status:** Draft. Awaiting Jacob sign-off before execution.
**Related:** `TOPIC_ROADMAP.md`, `MASTER_BACKLOG.csv` (live in Google Sheet "Master Backlog" tab)

---

## TL;DR

Three phases of infrastructure work, then Jacob writes pages on his own time:

1. **Drip-publish cron** (~half day) — the publishing pipeline that ships pre-written pages from the Master Backlog tab
2. **Track D template extension** (~1-2 hours of code) — extends `/medicaid-income-limits` to accept `/[state]`, unlocks 51 highest-ROI pages
3. **Jacob workflow doc + Group 1 priority view** (~30 min) — clean queue for Jacob to grind through

After all three are done, Jacob writes pages at his own pace, drops them in the right content directory, marks Master Backlog Status=Ready, and the drip cron auto-ships them daily. No more "waves" — just a steady stream.

Adjacent templates (persona-x-state, county, carrier-x-state, d-snp, ma-vs-medigap = 503 pages) are deferred until the existing-template pipeline is humming.

---

## Phase 1 — Drip-publish cron (PRIORITY)

**Goal:** Daily cron that reads the Master Backlog tab, finds rows ready to ship, commits them to git, pushes to Vercel, submits to IndexNow, marks them as Published. **Publishing-only — no writing.** Mirrors Stage 2 of existing daily blog cron.

### Architecture

- **New file:** `.claude/claudeclaw/jobs/coveredusa-drip-publish.md`
- **Schedule:** Daily at 2am UTC (offset from existing daily blog cron at 0/13/19 UTC so they don't collide).
- **Throttle:** Configurable `MAX_PER_DAY` constant, start at 10-25 pages/day.

### Workflow

1. Read Master Backlog tab (gid 639553785) via service account.
2. Find rows where `Status=Ready` (sorted by priority asc + demand_score desc — already the default sort).
3. Cap at `MAX_PER_DAY`.
4. For each row, derive expected file path from `template` + `topic_slug`:
   - `procedure` → `content/data/procedures/<slug>.json`
   - `drug` → `content/data/drugs/<slug>.json`
   - `persona` → `content/data/personas/<slug>.json`
   - `event` → `content/data/events/<slug>.json`
   - `qa` (and `qa-x-state`) → `content/data/qa/<slug>.json`
   - `glossary` → `content/data/glossary/<slug>.json`
   - `ma-state` → `content/data/medicare-advantage/<slug>.json`
   - `spanish-twin` → `content/data/medicare-advantage/<slug>-es.json` (or appropriate ES path)
   - `track-d` → `content/data/medicaid-income-limits/<slug>.json` (after Phase 2)
   - `event-x-state` → `content/data/events/<slug>.json`
   - Adjacent templates (persona-x-state, county, etc.) → DEFER until Phase 5
5. Verify each expected file exists. If not, log warning + skip that row (don't fail the whole batch).
6. Run `git add` + `git commit` + `git push` for all valid files in one batch.
7. Sleep 60s for Vercel deploy.
8. Run IndexNow submission for the new URLs (use existing `scripts/coveredusa-indexnow-submit.js` pattern).
9. Update Master Backlog Status: `Ready` → `Published` for shipped rows. Stamp `PublishedDate` + `PublishedURL` columns.
10. If anything fails, log + send Telegram alert (existing pattern from daily blog cron).

### Master Backlog schema additions

Need to add three columns to the Master Backlog tab:
- **Column S:** `Status` (Queued → Writing → Ready → Published; default blank = Queued)
- **Column T:** `PublishedDate` (set by cron when Status flips to Published)
- **Column U:** `PublishedURL` (set by cron — the live coveredusa.org URL)

### Reusable code

- `scripts/coveredusa-indexnow-submit.js` — IndexNow logic, already verified key
- `.claude/claudeclaw/jobs/coveredusa-seo-stage2.md` — git push + IndexNow + sheet update patterns
- `scripts/coveredusa-select-articles.js` — googleapis read pattern
- `scripts/mark-sheet-duplicates.js` — googleapis write pattern (the one I just shipped)

### Estimated effort

- Cron job markdown: ~30 min (mostly copy from Stage 2)
- New script `scripts/coveredusa-drip-publish.js` (Master Backlog reader + status updater): ~2-3 hr
- Test on a synthetic ready row: ~30 min
- **Total: ~3-4 hours**

---

## Phase 2 — Track D template extension

**Goal:** Enable `/medicaid-income-limits/[state]` for the 51 highest-ROI state Medicaid pages.

### Current state

`/medicaid-income-limits` is a hardcoded React component (national lighthouse). No state sub-pages.

### Code work

1. **Refactor existing route:** Move current `/medicaid-income-limits/page.tsx` content to be the index/root, keeping it intact (national lighthouse stays).
2. **New dynamic route:** Create `/medicaid-income-limits/[state]/page.tsx` using `generateStaticParams()` over the 51 states (like the existing ma-state route does).
3. **Page component:** Copy the ma-state page component (`/medicare-advantage/[state]/page.tsx`) as a starting point. Replace MA-specific content with Medicaid-specific content (income limits, household-size table, state-named program brand like Medi-Cal/AHCCCS, ARHOME, etc.).
4. **JSON data structure:** Add `content/data/medicaid-income-limits/` directory. Each state file follows a schema like the ma-state JSON but Medicaid-shaped.
5. **TypeScript loader:** Add a loader function in `src/lib/medicaid-income-limits.ts` (mirror `src/lib/medicare-advantage.ts` pattern).
6. **Sitemap:** Auto-include via `getAllMedicaidStateSlugs()` loader in `src/app/sitemap.ts`.

### Writer + verifier agents

Need two new agents:
- `.claude/agents/coveredusa-track-d-writer.md` — writer that produces state Medicaid JSON. Mirror the ma-state writer pattern. Apply FANOUT §4.4 (state-Medicaid Q&A recipe) + §3.3 (9-row household-size table mandatory) + §3.7 (state-named program brand).
- `.claude/agents/coveredusa-track-d-verifier.md` — verifier mirroring ma-state verifier (numeric auto-fix + structural detect-only + editor-mode auto-fix).

### Test plan

Write Texas Medicaid page first as a single test:
- Run writer agent
- Verify JSON validates
- Confirm all 8 GATES pass
- Page renders at `/medicaid-income-limits/texas`
- Schema.org JSON-LD looks correct
- IndexNow can be submitted

If Texas works: proceed to all 51 states.

### Estimated effort

- Route refactor + new dynamic route: ~1 hr
- Page component + state JSON schema: ~2 hr
- Writer agent prompt: ~1 hr
- Verifier agent prompt: ~30 min
- Test on Texas: ~30 min
- **Total: ~5 hr**

(Said 1-2 hours initially but the writer/verifier agents are real work. 5 hours is more honest.)

---

## Phase 3 — Jacob workflow doc + Group 1 priority view

**Goal:** Make it dead-simple for Jacob to pick a row and write it.

### Workflow doc

Create `specs/topic-research/JACOB_WORKFLOW.md` with:
- "How to pick the next page to write" (look at Master Backlog tab, sort/filter by Status=blank + Priority=1)
- "Which writer agent to use per template" (mapping table)
- "Where to save the output file" (path conventions)
- "How to mark it ready" (Status column update)
- "What the cron will do automatically"

### Priority view

Master Backlog tab is already sorted by priority asc + demand_score desc, so the top of the sheet is the queue. But add three convenience things:
- **Filter view:** "Group 1 Ready to Write" — filters out track-d (until Phase 2), persona-x-state/county/carrier-x-state/d-snp/ma-vs-medigap (need new templates), already_live=y, Status=Published. Shows Jacob the actual pickable queue.
- **Filter view:** "Top 50 P1" — shows top 50 P1 rows for quick grab.
- **Filter view:** "Southeast P1" — SE-state-fork rows ranked by demand.

### Companion markdown queue

`specs/topic-research/JACOB_QUEUE_TOP_50.md` — auto-regenerable markdown listing the top 50 P1 rows in human-readable format. Easy to scan + has the writer agent name + file path next to each topic. Regenerate weekly via a small script.

### Estimated effort

- Workflow doc: ~30 min
- Three filter views in Sheet: ~15 min
- Auto-regen script for JACOB_QUEUE_TOP_50.md: ~30 min
- **Total: ~1.5 hr**

---

## Phase 4 — Jacob grinds through Group 1

**Not a build task. This is just the operational mode.**

Per row Jacob picks:
1. Spawn the appropriate writer agent (coveredusa-procedure-writer for procedure rows, etc.)
2. Writer produces the file at the conventional path. Editor-mode verifier (per the 2026-05-15 cron rewrite memory) auto-fixes structural drift.
3. Jacob marks the Master Backlog row Status=Ready.
4. Daily drip cron picks it up at 2am UTC and ships it.

Cadence is up to Jacob. 5/day, 50/day, 500/day — whatever Claude credits + free time allow.

### Pace estimates

- At 10/day: 1,790 / 10 = 179 days = ~6 months to clear Group 1
- At 25/day: 1,790 / 25 = 72 days = ~2.5 months
- At 50/day: 1,790 / 50 = 36 days = ~5 weeks

These are aggressive. Realistic pace probably 5-15/day given Claude credit windows + life.

---

## Phase 5 — Adjacent templates (DEFERRED)

Wait until Group 1 + Track D + qa-x-state + event-x-state are in production.

Templates needed:
- **persona-x-state** (356 pages) — `/for/[persona]/[state]` route
- **carrier-x-state** (60) — `/medicare-advantage/[carrier]/[state]` route
- **county** (50) — `/medicare-advantage/[state]/[county]` route
- **d-snp** (30) — `/d-snp/[state]` route
- **ma-vs-medigap** (7) — could be a sub-page of ma-state, not a separate template

Each new template is roughly:
- New dynamic Next.js route + page component (1-2 hr)
- Writer agent prompt (1 hr)
- Verifier agent prompt (30 min)
- Test on first state (30 min)
- = ~3-4 hr per template
- = ~15-20 hr total for all 5

---

## Execution order

```
Phase 1 (drip-publish cron, ~3-4 hr)
  ║
  ╠══ Phase 2 (Track D extension, ~5 hr) — can run in parallel
  ║
  ╠══ Phase 3 (Jacob workflow + priority view, ~1.5 hr) — can run in parallel
  ║
  ╚══ Phase 4 (Jacob writes, indefinite) — starts when 1+2+3 done
        ║
        ╚══ Phase 5 (adjacent templates, ~15-20 hr) — starts when Phase 4 in production
```

Total infrastructure build time before Jacob can start writing: **~10 hours of code work**, parallelizable into ~6 wall-clock hours.

---

## Open questions for Jacob

1. **Drip cron schedule:** 2am UTC (8pm Eastern, 5pm Pacific) — OK?
2. **Throttle:** Start at MAX_PER_DAY=10? 25? Bing/Google penalize sudden spikes; 10-25 is the safe band per FANOUT research.
3. **Track D template structure:** Mirror ma-state page structure (state-specific JSON + dynamic route)? Or a different template design? My recommendation: mirror ma-state.
4. **Adjacent templates priority:** persona-x-state is 356 pages and biggest impact. Build that first when we get to Phase 5? Or build all 5 in parallel?
5. **Spanish twin handling:** You said skip for now. Confirm: spanish-twin rows in Master Backlog stay Status=blank indefinitely (no writer assigned)?
6. **Mark-as-published fanout:** Should the cron also auto-update the SEO Ideas tab if a Master Backlog row had a `sheet_row_id` populated (for the 35 migrated rows)? Probably yes for paper trail. Confirm.

---

*End of plan. Ready for sign-off.*
