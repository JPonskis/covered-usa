# CoveredUSA Cloud Writer Routine

**Purpose:** A Claude Code **routine** (claude.ai/code/routines) that writes CoveredUSA
templatized pages from the Master Backlog every day and pushes them to the `drip-queue`
branch. It refills the buffer that the always-on Mac Mini `coveredusa-drip-publish` cron
drains at 15/day. Runs on Anthropic cloud infra (works with the laptop off), billed to the
claude.ai account that owns the routine.

This is the cloud twin of the local `/write-coveredusa-batch` command. It does the **writing**
only. The Mac Mini still does the **publishing** (Status=Ready -> live, IndexNow, etc.).

```
2 AM PT  this routine (cloud)              02:00 UTC  drip-publish (Mac Mini, unchanged)
  pick N from Master Backlog                 ships <=15 Status=Ready pages to main
  spawn writer + verifier agents             IndexNow + Status=Published
  commit JSON -> drip-queue branch
  mark Status=Ready in the sheet
  Telegram "it ran" report
```

---

## SECTION A — Cloud environment SETUP SCRIPT

Paste this into the environment's **Setup script** field. It only installs the one dependency
the helper scripts need (`googleapis`). It is cached, so it does not re-run every session.

```bash
#!/bin/bash
# Install googleapis for the Sheets pick/status scripts. Cached after first run.
npm install -g googleapis || true
```

(Node, git, jq, ripgrep are pre-installed in cloud sessions — nothing else to add.)

---

## SECTION B — Cloud environment VARIABLES

Add these under the environment's **Environment variables** (`.env` format, one per line,
**no quotes around values**):

```
GOOGLE_SERVICE_ACCOUNT_JSON=<the ENTIRE contents of .secrets/google-service-account.json, as a single line>
TELEGRAM_BOT_TOKEN=<the BOT_TOKEN value from scripts/send-telegram.sh>
TELEGRAM_CHAT_ID=8424956848
```

Notes:
- `GOOGLE_SERVICE_ACCOUNT_JSON` must be the full JSON on ONE line (the scripts `JSON.parse`
  it). If pasting collapses newlines inside the private key, that's fine — the key uses `\n`
  escapes already.
- Secrets in an environment are visible to anyone who can edit that environment. This is a
  solo account, so acceptable. (Rotate the committed-to-git service-account key separately.)

---

## SECTION C — Routine PROMPT (paste into the routine's Instructions box)

Model: pick a strong model (the agents do real research). Network: **Full**. Repository:
`JPonskis/covered-usa`. Permissions: enable **Allow unrestricted branch pushes** for that repo
(so it can push `drip-queue`, which is not a `claude/`-prefixed branch).

> You are the CoveredUSA cloud writer orchestrator. Each run, you write a batch of templatized
> pages from the Master Backlog, push them to the `drip-queue` branch, mark them Status=Ready in
> the sheet, and send a Telegram report. You run fully autonomously — no human is watching.
>
> The repository is already cloned and is your current working directory. The writer/verifier
> agents and the helper scripts are committed in this repo.
>
> ## STEP 0 — Bootstrap the $HOME/clawd compatibility layout
>
> The writer/verifier agents reference files at `$HOME/clawd/projects/covered-usa/...` (they are
> written to run on multiple hosts). Recreate that layout so their reads resolve, then sanity-check
> the googleapis dependency:
>
> ```bash
> set -e
> REPO="$(pwd)"
> mkdir -p "$HOME/clawd/projects"
> ln -sfn "$REPO" "$HOME/clawd/projects/covered-usa"
> ln -sfn "$REPO/.claude" "$HOME/clawd/.claude"
> export NODE_PATH="$(npm root -g)"
> node -e "require('googleapis'); console.log('googleapis OK')"
> echo "REPO=$REPO"
> ```
>
> Use `NODE_PATH="$(npm root -g)"` on every `node scripts/cloud/...` call below so the scripts can
> require googleapis.
>
> ## STEP 1 — Decide volume + recovery sweep
>
> Read the queue depth and clear any rows stuck in Status=Writing from a prior crashed run:
>
> ```bash
> export NODE_PATH="$(npm root -g)"
> node scripts/cloud/coveredusa-batch-pick.js --stats
> node scripts/cloud/coveredusa-batch-pick.js --recovery > /tmp/stuck.json
> cat /tmp/stuck.json
> ```
>
> - **SPIKE MODE:** if the env var `SPIKE` equals `1`, set N = **1** and skip the buffer logic. Use
>   this for the first de-risking run. Remove `SPIKE` from the environment once the 1-page run is clean.
> - **Target volume (buffer-first):** otherwise, if `ready_count` from `--stats` is **< 100**, set
>   N = **20**. If `ready_count` is **>= 100**, set N = **15**. (The Mac Mini drains 15/day; writing 20
>   until the buffer is ~100 deep gives a cushion, then steady-state 15.)
> - **Recovery:** if `/tmp/stuck.json` has `total > 0`, build an updates array reverting each stuck
>   row to blank Status with a note, and apply it with
>   `node scripts/cloud/coveredusa-batch-update-status.js /tmp/recover.json`.
>
> ## STEP 2 — Pick N rows and pre-mark them Writing
>
> ```bash
> export NODE_PATH="$(npm root -g)"
> node scripts/cloud/coveredusa-batch-pick.js N > /tmp/pick.json
> cat /tmp/pick.json
> ```
>
> If `picked_count` is 0, send a Telegram note that the backlog is drained and STOP. Otherwise build
> `/tmp/premark.json` = `[{"row_id","sheet_row","status":"Writing"}, ...]` for every picked row and
> apply it with `coveredusa-batch-update-status.js`. (Pre-marking prevents a second run from
> double-picking the same rows.)
>
> ## STEP 3 — Write the pages in waves of <= 10 (parallel)
>
> Split the picked rows into waves of at most 10. **WebSearch is rate-limited per account, so never
> run more than 10 writers at once.** For each wave:
>
> 3a. Spawn ALL wave writers in PARALLEL (issue every Agent call in a single message). For each row,
> spawn its `writer_agent` (from the pick output) with this prompt:
>
> ```
> Generate the CoveredUSA page for this Master Backlog row.
> ROW_ID: <row_id>
> TEMPLATE: <template>
> TOPIC: <title>
> STATE: <state, or NA>
> SUBTYPE: <subtype if the writer_args include one, else omit>
> YEAR: 2026
> OUTPUT_FILE: <output_file_absolute>
> Follow your full pipeline (research -> draft JSON -> all GATES -> atomic write). Use $HOME/clawd
> paths as your agent instructions specify. End with your STEP 8 one-line JSON result.
> ```
>
> 3b. When the wave's writers finish, for every writer that returned status=success AND whose
> OUTPUT_FILE exists on disk, spawn the matching verifier in PARALLEL (the writer agents cannot spawn
> their own verifier — you do it). The verifier name is the writer name with `-writer` replaced by
> `-verifier`. Prompt:
>
> ```
> Verify and auto-fix the CoveredUSA page at <output_file_absolute>. ROW_ID <row_id>, TEMPLATE
> <template>, YEAR 2026. Auto-fix numeric/prose drift in place per your pipeline. End with your
> one-line JSON verdict (approved | corrected | flagged | critical).
> ```
>
> 3c. Classify each row:
> - **ship** = writer success + file exists + verifier in {approved, corrected}
> - **flagged** = writer success + verifier=flagged (ship it, but note the warning)
> - **drop** = writer error, file missing, or verifier=critical
>
> ## STEP 4 — Commit the shipped + flagged files to drip-queue (per wave)
>
> ```bash
> git fetch origin drip-queue
> git checkout -B drip-queue origin/drip-queue
> git add <relative paths of ship + flagged files in this wave>
> git commit -m "drip-queue cloud batch: <count> pages (<template breakdown>)"
> git push origin drip-queue
> git checkout main
> ```
>
> If a push fails, record the slugs as needs_manual_commit and continue — do not abort the batch.
>
> ## STEP 5 — Update Master Backlog statuses
>
> Build `/tmp/status.json` and apply with `coveredusa-batch-update-status.js`:
> - ship -> `status="Ready"`
> - flagged -> `status="Ready"`, `notes="verifier flagged: <reason>; review before refresh"`
> - drop -> `status="blank"`, `notes="<writer/verifier failure reason> (cloud run YYYY-MM-DD)"`
>
> ## STEP 6 — Telegram report (always send — this is the "it ran" ping)
>
> ```bash
> SESSION_URL="https://claude.ai/code/${CLAUDE_CODE_REMOTE_SESSION_ID/#cse_/session_}"
> MSG="CoveredUSA cloud writer ran $(date -u +%Y-%m-%d).
> Shipped to drip-queue: <S> pages (<template breakdown>).
> Flagged (shipped w/ warnings): <F>. Dropped: <D>.
> Ready-queue depth now ~<ready_count_after>. Backlog remaining: <writable_remaining>.
> Session: ${SESSION_URL}"
> curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
>   --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
>   --data-urlencode "text=${MSG}" >/dev/null && echo "telegram sent"
> ```
>
> Also print the same summary as your final output.
>
> ## Rules
> - Never push pages to `main` — only `drip-queue`. The Mac Mini promotes them to main at 15/day.
> - Waves of <= 10 writers. Sequential git ops between waves.
> - Atomic writes only (the agents handle this). Confirm each file exists before committing it.
> - If the whole run fails early, still send a Telegram error so the silence isn't mistaken for success.

---

## SECTION D — Schedule + one-time setup

- **Schedule:** daily, **2:00 AM America/Los_Angeles** (entered in local time; the routine UI
  converts to UTC automatically). Custom cron via `/schedule update` if needed; min interval 1 hour.
- **GitHub:** connect the account (run `/web-setup`, or authorize the Claude GitHub App) so the
  cloud can clone `JPonskis/covered-usa`.
- **Branch push:** enable **Allow unrestricted branch pushes** for covered-usa (drip-queue is not a
  `claude/` branch).
- **De-risk first:** add `SPIKE=1` to the environment variables, then click **Run now**. That forces
  a single-page run to prove the full chain in the cloud — agent spawn, Sheets read/write, .gov
  WebFetch, JSON write, drip-queue push, Telegram. After a clean 1-page run, remove `SPIKE` and enable
  the daily 2 AM PT schedule.

## Coexistence with existing crons (all on the Mac Mini, unchanged)
- `coveredusa-drip-publish` @ 02:00 UTC — publishes Status=Ready (the consumer of this routine).
- `coveredusa-seo-stage1/2` @ 13:00 / 14:00 UTC — the daily *blog* writer (separate content type).
- This routine @ 09:00 UTC (2 AM PT, PDT) — its Ready rows get published by drip-publish the next
  02:00 UTC tick. No git-push collision.
