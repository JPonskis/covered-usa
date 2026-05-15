# Track C Parallel Execution Plan — Master Brief (v1.3)

**Version:** 1.3 (Track C-prime + load-test learnings + per-template PRD index)
**Date:** 2026-05-14
**Status:** Plan complete; per-template PRDs at `specs/track-c-prime/<template>-prd.md`; ready for parallel-session execution
**Prerequisite:** Track B1 (blog writer rewrite) shipped — commits `226a884` + `e32f344` + `9e85861`. MA-state writer + verifier shipped + load-tested at 4-state scale (FL/NY/MI/OH/PA all live).

**Read these first (non-negotiable):**
1. This doc through §4 (shared framing + 4-phase pattern) + §3 Phase 4.5 (verifier scope) + §6 (held-queue mechanism)
2. `specs/track-c-prime/<your-template>-prd.md` — your template-specific brief (NEW per v1.3)
3. `feedback_b1_blog_writer_shipped.md` memory entry (B1 lessons learned)
4. The 3 reference implementations:
   - `.claude/agents/coveredusa-article-writer.md` (B1 — daily blog)
   - `.claude/agents/coveredusa-ma-state-writer.md` (Track C — state MA)
   - `.claude/agents/coveredusa-article-verifier.md` + `.claude/agents/coveredusa-ma-state-verifier.md` (Track C-prime)

**v1.3 changes (load-test learnings):**
- Each per-template plan §5.X now points at a dedicated PRD at `specs/track-c-prime/<template>-prd.md` (more depth than the §5.X summary; self-contained for fresh agents)
- Added §1.5 "What Track C-prime taught us tonight" — concrete examples from the FL/NY/MI/OH/PA load test
- Added §6 "Held-queue mechanism" — full spec for the Stage 1 cron's HOLD path + Stage 2 file-move + glob exclusion
- Updated §7 with PASS/WARN/FAIL/HOLD routing per gate + worked examples
- Added §3.5 "Default-toward-ship preference" — Jacob's bar (95/4/1 distribution; verifier exists to catch drift, not to bottleneck the cron)
- Added Appendix A "Real-world drift case studies" — the Florida $8, MI invalid href, OH `--`, NY logical contradiction, PA PACENET cases
- Added Appendix B "Writer-leaks pattern" — 4 documented cases where the writer claimed gates pass but the verifier found otherwise
- Updated Phase 4.5 with the 3 verifier patches we shipped after the load test (GATE F count strict, keyTerms shape, GATE D auto-fix hoist)

---

## 0. How this doc is used

Each parallel Claude Code session reads:

1. **This doc** for the shared framing + sequencing rules
2. **§5.X** for its specific template (only the section that applies — don't read other templates' sections, they're sized to fit one session each)
3. The cited source docs (FANOUT_FORMULA.md, _universal-rules-block.md, the audit JSON for its template, the existing writer prompt for its template)

Sessions execute the 4-phase pattern from §3 against their assigned template, commit, and report back. Multiple sessions can run simultaneously because each touches different files.

---

## 1. The framing

**The pattern is proven.** Track B1 shipped on 2026-05-14 — the daily blog writer is now formula-aligned and producing content via the existing cron. Phase 4 of B1 verified the pattern at 93/100 average across 4 test articles. Track C runs the same 4-phase pattern against the 7 remaining template writers.

**Each template is independent.** Different writer file, different test-output directory, different per-template recipe, different audit findings. Shared infrastructure (universal rules block, link-index, validator content-quality module) is READ-ONLY for Track C.

**Parallelization is genuinely safe** because no two templates touch the same files. Coordination rules in §4.

**The proprietary asset is the FORMULA.** Every writer prompt is an application of the formula to a specific content surface. The formula doesn't change template-to-template; the recipe does.

---

## 1.5 What Track C-prime taught us tonight

Track C MA-state shipped on 2026-05-14 — Florida produced first, then a 4-state load test (NY/MI/OH/PA). Both writer and verifier were rewritten to formula-aligned + dual-purpose. Five concrete lessons came out of it that change how the next 6 sessions should work:

**Lesson 1 — The verifier IS the safety net for numeric drift; assume the writer will hallucinate.**
Florida's writer claimed `averageMonthlyPremium = 8` in 10 different fields (meta, hero, quickAnswer, FAQ, prose) when CMS says $2.11. The writer's OWN source citation correctly cited $2.11 — then it wrote $8 anyway. The verifier caught and auto-fixed all 10 occurrences. **Implication for your session:** the writer's research ≠ the writer's output. Don't trust gate self-reports; the verifier is non-optional.

**Lesson 2 — Writer-side GATES are necessary but not sufficient.**
PA + MI both reported "all 8 gates PASS" in their STEP 8 return JSON. Verifier disagreed: PA had 3 detailSections (need ≥4), MI had `/medicare-part-d` invalid href. The writer was wrong about its own work. **Implication:** verifier-side gates are independent verification, not redundancy. Both layers matter.

**Lesson 3 — Default toward auto-ship; HOLD is rare.**
Across 4 load-test articles + 4 B1 retests, ZERO false HOLDs. ~95% auto-ship, ~4% ship-with-flag, ~1% HOLD is the realistic distribution. Don't tighten thresholds out of fear; calibrate them to actually-broken output.

**Lesson 4 — Verifier prompts can drift on enforcement.**
The verifier we updated for daily blog correctly auto-fixed 16 `--` instances across 4 B1 articles (GATE D worked). But the SAME verifier on Ohio MA-state shipped 11 unfixed `--` because it interpreted them as Category J informational instead of GATE D auto-fix. Same prompt, different output. **Implication:** "AUTO-FIX MANDATORY" framing must be loud + repeated; "fix as style correction" framing reads as advisory and gets skipped.

**Lesson 5 — Real drift the verifier catches saves real face.**
PA's PACENET income limits in the writer's output were $23,500 single / $31,500 couple — pre-Act-94-of-2021 figures. Real CMS values are $33,500 / $41,500. NY's prose said "53% penetration is above the national average of 54%" (logically impossible). These are the kind of errors that erode trust if shipped. The verifier found them. Without the verifier they'd be live now.

These 5 lessons inform every per-template PRD in `specs/track-c-prime/`. Read your PRD. Don't skip the verifier work.

---

## 2. Shared infrastructure (DO NOT MODIFY in Track C)

These files are read-only for Track C sessions. If a rule needs to change, raise it as a separate commit explicitly noted as out of Track C scope.

| File | Purpose | Owner |
|---|---|---|
| `.claude/agents/_universal-rules-block.md` | The 5 universal rules + 19-state program brand list | Locked after B1 |
| `projects/covered-usa/specs/FANOUT_FORMULA.md` | The playbook (universals + per-template recipes) | Locked |
| `projects/covered-usa/specs/URL_SLUG_FRAMEWORK.md` | Slug rules | Locked |
| `projects/covered-usa/specs/LINK_TARGET_MANIFEST.md` | Link routing system spec | Locked |
| `projects/covered-usa/content/link-index.json` | Auto-generated link routing (read at write time) | Auto-built; don't edit |
| `projects/covered-usa/scripts/lib/content-quality.js` | Shared validator | Locked |
| `projects/covered-usa/scripts/coveredusa-build-link-index.js` | Link index builder | Locked |

If you're a Track C session and find yourself wanting to edit one of these — STOP. Either (a) the rule actually applies to your template and you should call it out in your commit message, or (b) you're misreading the scope. Don't modify shared infrastructure.

---

## 3. The 4-phase pattern (every Track C session runs this)

### Phase 1 — Inventory (~30 min)

Spawn a planner agent to extract every rule the new writer must honor. Use this literal prompt template, substituting `<TEMPLATE>` with your template name (e.g., `procedure`, `drug`, `qa`, `glossary`, `event`, `persona`, `ma-state`):

```
You are the Phase 1 planner for the CoveredUSA <TEMPLATE> writer rewrite (Track C).
Your job: compile a master requirements matrix that the Phase 2 drafter will use.

## Read these 10 source files

1. `/Users/jacobposner/clawd/.claude/agents/coveredusa-<TEMPLATE>-writer.md` (current writer)
2. `/Users/jacobposner/clawd/.claude/agents/_universal-rules-block.md`
3. `/Users/jacobposner/clawd/projects/covered-usa/specs/FANOUT_FORMULA.md` (especially §3 + §4.X for <TEMPLATE>)
4. `/Users/jacobposner/clawd/projects/covered-usa/specs/AI_OPTIMIZATION_FRAMEWORK.md`
5. `/Users/jacobposner/clawd/projects/covered-usa/specs/URL_SLUG_FRAMEWORK.md`
6. `/Users/jacobposner/clawd/projects/covered-usa/specs/LINK_TARGET_MANIFEST.md`
7. `/Users/jacobposner/clawd/projects/covered-usa/specs/CURRENT_STATE_AUDIT.md` (§4.X for <TEMPLATE>)
8. `/Users/jacobposner/clawd/projects/covered-usa/content/fanout/analysis/audit-<TEMPLATE>-writer.json`
9. `/Users/jacobposner/clawd/projects/covered-usa/specs/PHASE_5_BRIDGE.md` §3
10. `/Users/jacobposner/clawd/projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md` §5.X for <TEMPLATE>

Extract every rule/requirement/constraint the new writer must honor. For each, capture:
- Rule ID (REQ-001, REQ-002, ...)
- Source (file + section)
- Category (formula-universal | formula-recipe | audit-flagged | framework-preserved | hard-contract | slug-rule | link-consumption | strategic-posture | humanizer-voice | cron-pipeline)
- Rule text (copyable into the writer prompt)
- Enforcement (STEP block, validator, self-check, or guidance)
- Conflicts (if any, with resolution — FORMULA WINS over old writer)

Cover all 10 categories. Resolve conflicts (formula wins). Flag any ambiguity for human judgment.

Write to /Users/jacobposner/clawd/projects/covered-usa/content/fanout/analysis/c-<TEMPLATE>-requirements-matrix.md in the same format B1 used (b1-requirements-matrix.md as the reference).

Return a 400-word summary: per-category counts, conflicts found vs resolved vs flagged, the 3 most important things for the Phase 2 drafter, any gaps in source docs.
```

Output: `projects/covered-usa/content/fanout/analysis/c-<template>-requirements-matrix.md`.

### Phase 2 — Draft (~60 min)

Back up the old writer to `.bak`. Write the new writer prompt. Target ~3,500-5,000 words. Structure (preserving Stage 1 cron contracts):

- Identity + role (2 sentences)
- INPUTS section
- STEP 0: load context ($HOME-portable paths + universal rules block + link-index + product context)
- STEP 1: template-specific setup (state verification for state-scoped templates; per-entity data lookup, etc.)
- STEP 2: research (year-anchored; cross-reference prior year)
- STEP 3: plan structure (apply the §4.X recipe — see your template's section §5.X below)
- STEP 4: write frontmatter (template-specific schema + topicCluster + keyTerms.{en,es})
- STEP 5: write body (5 universal rules + framework rules + linking + CTAs)
- STEP 6: self-validation with 4 CRITICAL PRE-SAVE GATES at the top (see §7) + the universal 26-check list
- STEP 7: save (atomic; EN-only for most templates; see template-specific notes)
- STEP 8: return JSON (preserve existing shape; add additive fields)
- CRITICAL BOUNDARIES section (NEVERs)

### Phase 3 — 3-verifier review (~45 min)

Spawn three parallel verifier agents using these literal prompt templates (substitute `<TEMPLATE>`):

**Verifier A — matrix-driven critic:**
```
You are Verifier A for the CoveredUSA <TEMPLATE> writer rewrite (Track C, Phase 3). Read:
1. /Users/jacobposner/clawd/.claude/agents/coveredusa-<TEMPLATE>-writer.md (the new draft)
2. /Users/jacobposner/clawd/projects/covered-usa/content/fanout/analysis/c-<TEMPLATE>-requirements-matrix.md
3. /Users/jacobposner/clawd/.claude/agents/_universal-rules-block.md
4. /Users/jacobposner/clawd/projects/covered-usa/specs/FANOUT_FORMULA.md §3 + §4.X

For EACH requirement in the matrix, verify the new writer enforces it. Score each PASS/PARTIAL/FAIL. Confirm all resolved conflicts went the formula-wins direction. Flag internal contradictions and STEP-mapping errors.

Write to /Users/jacobposner/clawd/projects/covered-usa/content/fanout/analysis/c-<TEMPLATE>-verifier-a.md.
Return: PASS/PARTIAL/FAIL counts + top 5 fixes needed before Phase 4.
```

**Verifier B — cold fresh-eyes:**
```
You are Verifier B for the CoveredUSA <TEMPLATE> writer rewrite (Track C, Phase 3). Design YOUR ideal writer prompt FROM SCRATCH without reading the new draft.

DO NOT READ: /Users/jacobposner/clawd/.claude/agents/coveredusa-<TEMPLATE>-writer.md (the new draft).
DO READ: FANOUT_FORMULA.md, _universal-rules-block.md, AI_OPTIMIZATION_FRAMEWORK.md, audit-<TEMPLATE>-writer.json, and TRACK_C_PARALLEL_PLAN.md §5.X for <TEMPLATE>.

CRITICAL hard contracts you must respect even when designing from scratch:
1. JSON return shape — keep `{slug, status, ...}` parseable by the cron
2. Atomic writes — don't save until self-validation passes
3. `## STEP N` numbered headings — cron may parse for logging
4. Required frontmatter fields (template-specific — see §5.X)
5. Stage 1 cron payload fields (KEYWORD, TITLE, STATE, PROGRAM, etc. + the new TOPIC_CLUSTER/FORMULA_RECIPE/UNIVERSAL_RULES)

Sketch the structure (2,000 words). Section list, key rules, validation steps, JSON return shape, NEVERs.

Write to /Users/jacobposner/clawd/projects/covered-usa/content/fanout/analysis/c-<TEMPLATE>-verifier-b.md.
Return: 5-bullet top-line structure + 3-5 most important things + gotchas.
```

**Verifier C — differential:**
```
You are Verifier C for the CoveredUSA <TEMPLATE> writer rewrite (Track C, Phase 3). Do a differential audit between OLD and NEW writer.

Read:
1. /Users/jacobposner/clawd/.claude/agents/coveredusa-<TEMPLATE>-writer.bak.md (OLD)
2. /Users/jacobposner/clawd/.claude/agents/coveredusa-<TEMPLATE>-writer.md (NEW)
3. /Users/jacobposner/clawd/projects/covered-usa/content/fanout/analysis/c-<TEMPLATE>-requirements-matrix.md (especially "Resolved Conflicts" section)
4. /Users/jacobposner/clawd/projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md §1 ("framing — current isn't bad, layer ON top")

For every rule/instruction/convention in the OLD writer, verify either: (a) PRESENT in NEW, (b) SUPERSEDED with documented justification, or (c) SILENTLY DROPPED (a bug).

Write to /Users/jacobposner/clawd/projects/covered-usa/content/fanout/analysis/c-<TEMPLATE>-verifier-c.md.
Return: PRESENT/SUPERSEDED/SILENTLY-DROPPED counts + every silent drop with severity + weak supersession justifications.
```

Apply fixes from all three verifier reports before Phase 4. Iterate until all 3 pass.

### Phase 4 — Manual test cycle (~90 min)

Pick 5 template-appropriate test topics (see §5.X for per-template suggestions). Spawn 5 writer agents in parallel via `subagent_type: coveredusa-<template>-writer`. Each agent gets a Stage 1-style payload.

For each output:
- Run validators in strict mode (`STRICT_QUALITY_LINT=1` for JSON validators; manual check for blog markdown)
- Spawn a verifier agent to score against the universal rules + the §4.X recipe + audit-flagged gaps

**Pass criteria:**
- 5 of 5 articles pass strict-mode validators (mechanical and binary)
- 4 of 5 articles score ≥80% on the universal-rule rubric

**Expect to iterate.** B1 first-pass produced 4/5 articles with year-in-slug despite the rule being in the prompt. The fix was tightening the writer prompt with hard-reject GATES at STEP 6, then re-testing the failing case. Budget 30-60 min for one iteration round.

### Phase 3.5 — Default-toward-ship preference (read before Phase 4)

Jacob's bar: **the system runs automatically.** The verifier exists to catch drift, not to bottleneck the cron. Expected runtime distribution across hundreds of cron-produced articles:

- **~95% auto-ship clean** — verifier checks pass, no edits needed (or only narrow numeric Edits applied)
- **~4% ship with LOW/MEDIUM flag** — verifier flags an item for the weekly review queue but the article still ships; no Telegram notification (would be too noisy)
- **~1% HOLD** — verifier finds a HIGH structural failure (year-in-slug, missing required section, 0-1 .gov citations); article moves to `_held/` subdir, Telegram notification fires, Jacob un-holds manually OR regenerates via writer

**Calibrate gates accordingly:**
- HOLD only on genuine breakage that degrades the page (visible URL bug, missing required section, fabricated entity, ≤1 source). Anything else flags + ships.
- Numeric drift: auto-fix and ship. Don't HOLD for fixable numbers.
- Style issues (`--`, em-dash): auto-fix and ship. Don't HOLD.
- Voice/style preferences: don't touch. Verifier doesn't rewrite prose.

**The cost of over-strictness is real.** If 10% of articles HOLD, Jacob gets 1+ Telegram notifications per cron tick (3x daily = 3+/day), the un-hold workflow becomes a daily burden, and the cron loses its "set and forget" property. The cost of under-strictness is a small drift slipping through to production — recoverable on the next regen.

**When in doubt: default toward ship.** Better to ship with a LOW flag in the queue than to HOLD a fixable article.

### Phase 4.5 — Verifier update (~30-45 min) — NEW per Track C-prime

After the writer ships and 5 test articles pass, **update the matching verifier agent** to mirror the writer's new structural rules. This is mandatory — without it, the writer enforces structural rules at write-time but the verifier can't detect drift in production output. Pattern proven on `coveredusa-article-verifier` (daily blog) and `coveredusa-ma-state-verifier` already.

**Scope of verifier update (apply to `.claude/agents/coveredusa-<template>-verifier.md`):**

1. **Path portability:** `/Users/frankthebot/...` → `$HOME/clawd/...` (multi-host compatibility)
2. **Add dual-purpose framing** in YOUR TASK: numeric fact-checking with auto-fix (existing role) + structural GATE detection (new, detect-only). Explain why the split (auto-edit prose = drift; structure failures should regen via writer).
3. **Insert STEP 1C (or 2.5): Structural GATE detection.** Mirror the writer's STEP 6 GATES:
   - **Universal GATES (every template):** A (slug-no-year), B (household-size table — usually N/A), C (≥3 .gov citations), D (zero `--`).
   - **Template-specific GATES:** copy from writer's STEP 6 (e.g., MA-state has E/F/G/H for How-to-enroll, $0 plans, pronoun discipline, state-context).
4. **Routing rules** (default toward auto-ship):
   - GATE A FAIL → HOLD (slug bug)
   - GATE B FAIL on income-gated → HOLD; N/A on non-income → skip
   - GATE C FAIL (0-1 .gov) → HOLD; WARN (2) → ship + LOW flag
   - GATE D FAIL → AUTO-FIX as style correction (don't HOLD; surgical)
   - Template-specific structural FAILs → HOLD if missing required section; flag-only if pronoun/boundary leaks
5. **Update STEP 6 return JSON** to include `gates: {a, b, c, d, ...}` object + new `held` status.
6. **Add CRITICAL RULE:** structural gates are DETECT-ONLY (except GATE D auto-fix); never write missing sections.
7. **Add CRITICAL RULE:** default toward auto-ship per Jacob's preference. Don't be the bottleneck.

**3 mandatory patches per the post-load-test learnings (apply to BOTH writer and verifier):**

1. **GATE F count strictness (writer side):** if your template requires N detailSections, write a strict count check `if (JSON.parse(file).detailSections.length < N) REJECT`. Don't trust the writer to count. PA + MI both shipped with detail_section_count = 3 (need ≥4) because the writer interpreted "≥4" as a soft preference. Strict count check fixes it.

2. **`keyTerms` shape example (writer side):** writer must emit `keyTerms` as `{en: [...], es: [...]}` object, NOT a flat array. MI + OH writers emitted flat arrays that triggered `content-quality.js` warnings. Embed the exact JSON shape template in the writer prompt + an explicit "do NOT emit flat array" rule.

3. **GATE D auto-fix hoist (verifier side):** the verifier must AUTO-FIX `--` instances (same logic as em-dash), NOT mark them as Category J informational. Use "AUTO-FIX MANDATORY" framing + a "Common verifier error" callout that names the Ohio failure mode (verifier saw 11 `--` instances and marked them informational instead of fixing). The hoist matters because verifier prompts naturally read "auto-fix as style correction" as advisory; explicit "MANDATORY" + worked-example framing fixes it.

**Verification of the verifier update:**
- Run the updated verifier on the 5 test articles from Phase 4. Expected: all pass without spurious HOLDs (since they were just produced by the writer and meet the structural bar).
- If any spurious HOLD: tighten the verifier prompt before shipping. Common over-fire: GATE B applied to non-income-gated topic; GATE C counted plain-text mentions instead of hyperlinks.

**Reference implementations** (read these before writing your verifier update):
- `.claude/agents/coveredusa-article-verifier.md` (Track C-prime updated + 3 patches applied, daily blog)
- `.claude/agents/coveredusa-ma-state-verifier.md` (Track C-prime updated + 3 patches applied, MA-state)
- `.claude/agents/coveredusa-<template>-verifier.bak.md` (backup of pre-update verifier — for reference, do NOT restore unless rolling back)

### Phase 5 — Activation + commit (~30 min)

Pre-activation tripwires:
- `git diff --name-status HEAD | grep "^R"` must be empty (no renames)
- `git diff -G '"slug":' HEAD -- content/data/<template>/*.json` must be empty (no slug field changes in existing files)

4 commits per the Track C-prime pattern (was 3 in the B1 pattern; adds the verifier):
1. **Commit 1:** `.bak` move + new writer prompt (in clawd-workspace)
2. **Commit 2:** 5 test articles (in covered-usa) — INCLUDING any verifier-caught corrections from Phase 4.5
3. **Commit 3:** Requirements matrix + 3 verifier reports + retest verifier (in covered-usa)
4. **Commit 4:** `.bak` move + new VERIFIER prompt (in clawd-workspace) — paired with the writer ship

Then watch the first content production round. For templates with bulkgen crons (procedure, drug, persona, etc.), this means running a small bulkgen batch (3-5 pages) and validating. For templates without active crons, this means letting the writer sit until the next on-demand batch.

If any first-tick output fails strict validators: roll back via `cp .claude/agents/coveredusa-<template>-writer.bak.md .claude/agents/coveredusa-<template>-writer.md` + commit.

Write a memory entry on completion: `feedback_track_c_<template>_writer_shipped.md`.

---

## 4. Coordination rules for parallel sessions

Multiple sessions running simultaneously must respect these to avoid collisions:

1. **Each session works on EXACTLY ONE template.** No "while I'm at it" cross-template tweaks.
2. **Sessions NEVER modify shared infrastructure** (see §2 list). If a shared rule looks wrong, raise it to Jacob as a separate task.
3. **Git workflow:** pull origin/main before starting; commit only your template's files; push when done. If push fails due to upstream changes from another session, `git pull --rebase` and re-push.
4. **The covered-usa repo has Vercel auto-deploy from main.** Every push deploys. Don't push half-finished work.
5. **The clawd-workspace repo is workspace-synced.** Commits here propagate via Syncthing/Dropbox to the frankthebot Mac mini. The cron on frankthebot picks up writer prompt changes immediately.
6. **Test-article slugs must be unique across sessions.** Each session's test articles go into its template's data subdir per this map (ACTUAL directory names — use these exactly):
   - **MA-state** → `projects/covered-usa/content/data/medicare-advantage/<slug>.json`
   - **Procedure** → `projects/covered-usa/content/data/procedures/<slug>.json`
   - **Drug** → `projects/covered-usa/content/data/drugs/<slug>.json`
   - **Persona** → `projects/covered-usa/content/data/personas/<slug>.json`
   - **Event** → `projects/covered-usa/content/data/events/<slug>.json`
   - **Q&A** → `projects/covered-usa/content/data/qa/<slug>.json`
   - **Glossary** → `projects/covered-usa/content/data/glossary/<slug>.json`

   Note: directories are PLURAL except `qa` and `medicare-advantage`. Don't create `drug/` or `procedure/` — those won't be picked up by the validators and page-template routes.

   **Pre-Phase-4 collision check:** every session runs `ls projects/covered-usa/content/data/<their-dir>/*.json | xargs -n1 basename | sed 's/.json//'` to list existing slugs, then confirms its planned test slugs don't collide.
7. **Don't run multiple Phase 4 cycles for the same template simultaneously.** One session per template at a time.

---

## 5. Per-template plans

### 5.1 MA-state writer (HIGHEST PRIORITY — sequence FIRST, alone)

**File:** `.claude/agents/coveredusa-ma-state-writer.md`
**Recipe:** FANOUT_FORMULA.md §4.8
**Audit:** `audit-ma-state-writer.json`
**Status:** Cleanest existing template — scored 5/8 Bing-validated in audit. Closest to formula-aligned of any writer.

**Why first + alone:** This template is the proof point. The cleaner one means a smoother first parallel-ish run. More importantly: **once this writer ships, Track D's state×Medicaid permutation factory is immediately unblocked.** That factory (50 state pages with household-size income tables for each state's Medicaid program) is the single highest-ROI content investment on the entire Phase 5 roadmap (per FANOUT_FORMULA §5.1). Running MA-state alone in this conversation or in a focused single session lets us hand off to bulkgen the next day.

**Per-template specifics:**
- Most states do NOT have a state-named brand for Medicare Advantage (it's just "California Medicare Advantage", "Texas Medicare Advantage", etc. — carrier-branded, not state-branded). Brand-list directive from RULE 1 doesn't substitute for most states. State-context-everywhere still applies in full.
- Required H2s per §4.8: AEP/OEP enrollment periods, plan count + top carriers, Star Ratings overview, $0 premium plans, MA vs Medigap comparison, How to enroll, SNPs eligibility.
- Pronoun discipline (Framework §5.7) is a known strength of this writer — codify in STEP 6 self-validation.
- Two known gaps from audit: missing "$0 premium plans in [State] 2026" table; how-to-enroll H2 needs all 5 sub-fields.

**Test mix (5 states):**
- Florida (large state, retiree-heavy, plan-rich)
- New York (different program mix; non-expansion state for ACA; expansion for Medicaid)
- Michigan (Midwest; large MA market)
- Ohio (existing test — refresh)
- Pennsylvania (mid-Atlantic; different carrier mix)

Skip California, Texas, Wyoming (already shipped).

**Pass criteria:** 5/5 strict + 4/5 rubric ≥80%.

**Special STEP 6 GATES for MA-state:**
- State name in title + H1 + meta + every H2 first sentence + every table caption (the universal RULE 1 enforcement)
- AEP dates always include both 2026 and 2027 (forward-looking topic)
- Pronoun discipline check: no "It" / "These plans" / "This" as paragraph openers — must lead with named entity (state, carrier, program)

**Expected time:** 3-4 hours.

**Downstream:** After this ships, Track D move 1 (bulkgen the remaining 45+ states with household-size Medicaid income tables) becomes a one-day effort with the new writer pattern.

---

### 5.2 Procedure writer

**File:** `.claude/agents/coveredusa-procedure-writer.md`
**Recipe:** FANOUT_FORMULA.md §4.1
**Audit:** `audit-procedure-writer.json`
**Status:** MAJOR gap on Good Faith Estimate / No Surprises Act section — 0 of 3 existing procedure pages have it. This is §4.1's only Bing-validated shape currently missing.

**Per-template specifics:**
- Required H2s per §4.1: Cost without insurance + sub-type (contrast/non-contrast/body part) + year; Good Faith Estimate / NSA compliance; Hospital outpatient vs Independent imaging center; Self-pay discount / cash pay programs; Medicare rate benchmark for the procedure; Insurance copay estimate (when applicable); Pre-procedure cost estimate request process.
- Schema additions (audit recommendation): `goodFaithEstimate` JSON field with `numberedSteps[5-7]`, `govStartingUrl`, `documentsToBring[]`, `commonReasonsQuoteChanges[]`. Adding the schema field is a one-time data-layer change — coordinate with the page template render code if not yet done. (If schema change feels out of B1/C scope, embed the GFE section in the existing `bestSourcesToCite` or `narrativeBody` fields and document the schema gap as a Track E follow-up.)
- Required FAQ topics: GFE request process; NSA applicability; written cash-pay quote requesting; post-bill negotiation tactics.

**Test mix (5 procedures):**
- CT scan
- X-ray
- Colonoscopy (forces screening vs diagnostic CPT split — strong specification fan-out)
- Knee MRI (sub-procedure / body-part specificity)
- Echocardiogram (cardiology — different specialty)

Skip MRI (already shipped — though could be regenerated in Track E).

**Pass criteria:** 5/5 strict + 4/5 rubric ≥80%.

**Special STEP 6 GATES for procedure:**
- GFE section MUST be present (test will catch absence)
- Hospital outpatient vs imaging center comparison table required
- Medicare reimbursement rate (year-anchored) cited inline with cms.gov link

**Expected time:** 3-4 hours.

---

### 5.3 Drug writer

**File:** `.claude/agents/coveredusa-drug-writer.md`
**Recipe:** FANOUT_FORMULA.md §4.2
**Audit:** `audit-drug-writer.json`
**Status:** 55-68% alignment (lowest of any template). Key gaps: GoodRx pharmacy comparison table missing on all 3 existing pages; generic/biosimilar block missing (insulin biosimilars story entirely absent); PAP eligibility table missing.

**CRITICAL — the iraNegotiation render bug is ALREADY FIXED.** Commit `1fb5fb9` added the iraNegotiation green-callout render block to `src/app/[locale]/drug/[drug]/page.tsx`. When Eliquis / Jardiance / other IRA-negotiated drugs ship through the new writer, their Maximum Fair Price + 2026 effective date will render correctly. Verify this end-to-end on one test page.

**Per-template specifics:**
- Required H2s per §4.2: Cost without insurance + monthly + year; Manufacturer patient assistance program; GoodRx pharmacy price comparison + year; NovoCare-style PAP + Medicare coverage; List price + IRA negotiation status; Generic / biosimilar availability; Coverage denial → alternative options; How to apply for PAP / financial assistance.
- Required tables: monthly cost × pharmacy (year-tagged); manufacturer assistance eligibility (household-size); generic vs brand pricing.
- Required FAQ topics: how to apply for patient assistance; what if insurance denies coverage; IRA negotiation impact; generic equivalence.

**Test mix (5 drugs — mix of IRA-negotiated + non-negotiated):**
- Eliquis (Round 1 IRA-negotiated) — verifies iraNegotiation render
- Jardiance (Round 1 IRA-negotiated) — verifies render again
- Januvia (Round 1 IRA-negotiated, generic alternative exists)
- Insulin Humalog (biosimilar story; Basaglar/Semglee/Rezvoglar competitors)
- Atorvastatin (already-generic statin; baseline for non-IRA non-novel drug)

Skip Ozempic, metformin (already shipped).

**Pass criteria:** 5/5 strict + 4/5 rubric ≥80%. PLUS the IRA negotiation render verifies correctly on the 3 IRA drugs (Maximum Fair Price + effective date + savings %).

**Special STEP 6 GATES for drug:**
- For IRA-negotiated drugs: iraNegotiation block populated (maxFairPrice, listPriceBefore, effectiveDate, source, callout.{en,es})
- GoodRx pharmacy comparison table required
- Generic/biosimilar coverage section required when alternatives exist

**Expected time:** 3-4 hours.

---

### 5.4 Persona writer

**File:** `.claude/agents/coveredusa-persona-writer.md`
**Recipe:** FANOUT_FORMULA.md §4.7
**Audit:** `audit-persona-writer.json`
**Status:** Synonym gap UNCHANGED from prior audit. gig-workers page has 0 mentions of "freelancer," 0 of "contractor," 0 of "rideshare driver," 0 of "sole proprietor." Kills Clarification fan-out per §3.9 demographic specificity.

**Per-template specifics:**
- Required H2s per §4.7: Coverage options for [persona] + year; Premium tax credit + persona subsidy eligibility; 1099 / freelancer coverage options; Self-employment health deduction (Form 7206); HSA / FSA eligibility for persona; State-specific stipend / program for persona; Catastrophic plan eligibility for persona; Persona × Marketplace SEP triggers.
- Synonym block enforcement (Framework §5.6 / §3.9 demographic specificity): writer MUST list canonical persona term + synonyms in body content. E.g., gig-workers page must include: "freelancer," "contractor," "rideshare driver," "1099 contractor," "sole proprietor," "independent contractor," "Uber driver," "DoorDash driver," "Lyft driver."
- The writer should accept a `synonyms[]` field in INPUTS or derive it from `keyTerms.en`.

**Test mix (5 personas):**
- Uber-Lyft-rideshare-drivers (the gig-workers refresh — synonym-rich)
- Freelance designers / consultants (1099 + Self-employed overlap)
- College students (CHIP / parent coverage / student plan tradeoffs)
- Recently lost employer coverage (COBRA vs Marketplace SEP — overlap with event/lost-job)
- Near-retirement (transitioning from employer plan to Medicare; IRMAA awareness)

Skip self-employed (existing — can refresh in Track E).

**Pass criteria:** 5/5 strict + 4/5 rubric ≥80%. PLUS synonym density check: ≥5 distinct persona-related synonyms per page.

**Special STEP 6 GATES for persona:**
- Synonym block (≥5 distinct synonyms in body — STOP and add if missing)
- PTC eligibility section required
- HSA/FSA fit section required
- State-specific stipend section required where applicable (some states have gig-worker portable benefits programs)

**Expected time:** 3-4 hours.

---

### 5.5 Event writer

**File:** `.claude/agents/coveredusa-event-writer.md`
**Recipe:** FANOUT_FORMULA.md §4.6
**Audit:** `audit-event-writer.json`
**Status:** Best per-template recipe of all writers; just needs universal rules layered on. Entailment dominates at 56.4% (highest of any template). 6/8 Bing-validated shapes.

**Per-template specifics:**
- Required H2s per §4.6: Immediate next steps (numbered, 3-7 steps); SEP enrollment window + dates + state; COBRA vs Marketplace decision; Documents needed for SEP application; Eligibility for subsidies during SEP; State-extension laws (turning-26 by state); CHIP / Medicaid pivot if event-triggered.
- Required HowTo schema with 5-7 numbered steps + totalTime.
- T26 (existing) had 23 em-dashes in body — em-dash purge MUST be enforced strictly (GATE D from B1 is critical here).

**Test mix (5 events):**
- Getting married (SEP trigger; spousal coverage decisions)
- Having a baby (SEP; CHIP eligibility; pediatric coverage)
- Moving states (SEP; Marketplace re-enrollment; Medicaid portability gaps)
- Divorce (SEP; loss of employer-sponsored spousal coverage)
- Becoming a caregiver for an aging parent (Medicaid Waiver programs; respite care funding)

Skip turning-26, turning-65, lost-job (already shipped).

**Pass criteria:** 5/5 strict + 4/5 rubric ≥80%.

**Special STEP 6 GATES for event:**
- Em-dash purge (GATE D extra-strict here — historical bug)
- SEP enrollment-window dates explicit (start date + end date, not just "60 days")
- COBRA vs Marketplace comparison framing required for job-loss / coverage-loss events

**Expected time:** 2-3 hours (less work than other templates).

---

### 5.6 Q&A writer (subtype dispatch — most architecturally complex)

**File:** `.claude/agents/coveredusa-qa-writer.md`
**Recipe:** FANOUT_FORMULA.md §4.3 (coverage variant) + §4.4 (state-eligibility variant)
**Audit:** `audit-qa-writer.json`
**Status:** Current writer is solid for Medicare-coverage Q&A (§4.3) but INADEQUATE for state-Medicaid eligibility Q&A (§4.4). Audit recommends ONE writer with `subtype: coverage|state-eligibility` dispatch, NOT two separate writers (forking duplicates 70% of writer logic).

**Per-template specifics — this is the architectural one:**

The writer must accept a `subtype` field in INPUTS:
- `subtype: coverage` → applies §4.3 recipe (Direct answer + Original Medicare coverage + MA may add + Cost without coverage + Standalone supplemental options + Eligibility criteria)
- `subtype: state-eligibility` → applies §4.4 recipe (State Medicaid income limits + state + year; State Medicaid application process; State Medicaid expansion status + ACA gap; State Medicaid + family size + year; State Medicaid eligibility documents needed)

If `subtype` is missing, infer from `topicCluster`: `medicare-*` or `aca-*` or `medicaid-coverage-*` → coverage; `medicaid-income-*` or `medicaid-eligibility-*` → state-eligibility.

The writer prompt has a STEP 0 dispatch step that branches the rest of the prompt.

**Test mix (5 Q&As — 3 coverage + 2 state-eligibility to test both branches):**

Coverage:
- "Does Medicare cover hearing aids in 2026?" (NOT vision; existing slug `does-medicare-cover-vision` blocks that test topic)
- "Does ACA marketplace insurance cover preexisting conditions?" (legal-rule based; tests Direct-answer entailment)
- "Does Medicaid cover home health care?" (mixed federal/state; tests state-overlay)

**Existing Q&A slugs to AVOID** (collision check via `ls content/data/qa/*.json | xargs -n1 basename`):
- does-medicaid-cover-rehab
- does-medicare-cover-dental
- does-medicare-cover-vision

Don't write test articles whose slug would match any of these.

State-eligibility:
- "Do I qualify for Medi-Cal in California 2026?" (uses Medi-Cal brand)
- "Do I qualify for SoonerCare in Oklahoma 2026?" (uses SoonerCare brand)

**Pass criteria:** 5/5 strict + 4/5 rubric ≥80%. PLUS subtype dispatch verified — each variant test produces output that matches its recipe's required H2s.

**Special STEP 6 GATES for Q&A:**
- For state-eligibility subtype: 9-row household-size table mandatory + state-named brand used throughout
- For coverage subtype: comparison table (Original Medicare vs MA vs Standalone vs Other) mandatory
- Both: Direct-answer ≤ 80 words must contain Yes/No/It depends + key qualifier

**Expected time:** 5-6 hours (most architectural complexity — subtype dispatch + two disjoint recipes + 5 test articles across both subtypes).

---

### 5.7 Glossary writer (DOWNSCOPE — different work shape)

**File:** `.claude/agents/coveredusa-glossary-writer.md`
**Recipe:** FANOUT_FORMULA.md §4.5
**Audit:** `audit-glossary-writer.json`
**Status:** Pages 1.8-3.3x over §4.5 word ceiling (MAGI 1,658 words; deductible 1,464; OOP-max 904). Target: 300-500 words. **DOWNSCOPE, not enhance.**

**Per-template specifics — this is the subtraction one:**
- Hard-cap 500 EN words. Drop `introParagraphs` field. Change `detailSections` from MIN 2 to MAX 1. Cut FAQs from 6-8 to 3-4.
- Add §4.5 warning quote at top of writer prompt: "Glossary's primary value is internal-link target per LINK_TARGET_MANIFEST.md, not citation magnet. Only 4 MAGI queries in 2 months across all of BenefitsUSA. Don't write a 2,000-word concept deep-dive."
- Required structure: definition (1 paragraph, ≤80 words) + 1 worked example + 1 lookup table (the specific numeric thresholds when applicable) + 3-4 FAQs.
- Cross-link aggressively to lighthouse pages: link to FPL chart, Medicaid income limits, Medicare eligibility, ACA income limits.

**Test mix (5 glossary terms):**
- Premium tax credit (PTC) — heavily cross-linked
- Copayment vs coinsurance (comparison framing)
- In-network vs out-of-network (comparison framing)
- Special enrollment period (SEP) (link to event template via link-index)
- Open enrollment period (OEP) (annual lookup)

Skip MAGI, deductible, out-of-pocket-maximum (existing — these need DOWNSIZING in Track E, not B1-style rewrites in C).

**DO NOT TOUCH** the following existing glossary slugs as part of Track C — they belong to Track E downsizing only:
- `magi`
- `deductible`
- `out-of-pocket-maximum`

If you rewrite any of these as part of Track C glossary work, you violate the slug-stability rule + risk publishing a non-downsized version. The whole point of glossary is the downsizing; doing it without the downsize is worse than leaving them alone.

**Pass criteria:** 5/5 strict + 4/5 rubric ≥80% AND word count ≤500 per page.

**Special STEP 6 GATES for glossary:**
- Word count hard-cap 500 — REJECT if over
- Required ≥3 internal links from link-index.json (this template's primary value is link-target infrastructure)
- Definition in first 80 words

**Expected time:** 1-2 hours (mostly subtraction; less work than other templates).

---

## 5.X' — Per-template PRD pointers (NEW per v1.3)

Each template now has a dedicated PRD at `specs/track-c-prime/<template>-prd.md`. The PRD is the SELF-CONTAINED brief for a fresh parallel session. The §5.X summaries above are kept for backward-reference but the authoritative spec is in the PRD.

| Template | PRD path | Reference |
|---|---|---|
| Procedure | `specs/track-c-prime/procedure-prd.md` | (reference template — most-detailed PRD; copy patterns from this) |
| Drug | `specs/track-c-prime/drug-prd.md` | iraNegotiation render bug already fixed (commit `1fb5fb9`) |
| Persona | `specs/track-c-prime/persona-prd.md` | synonym density requirement (≥5 per page) |
| Event | `specs/track-c-prime/event-prd.md` | HowTo schema; em-dash purge extra-strict |
| Q&A | `specs/track-c-prime/qa-prd.md` | subtype dispatch (coverage vs state-eligibility); most architecturally complex |
| Glossary | `specs/track-c-prime/glossary-prd.md` | DOWNSCOPE work — ≤500 words; do NOT touch existing magi/deductible/oop-max slugs |

**MA-state PRD is not needed** — that template shipped via Track C earlier today. Use `coveredusa-ma-state-writer.md` and `coveredusa-ma-state-verifier.md` as reference implementations.

**Index doc:** `specs/track-c-prime/README.md` lists all 6 PRDs + master brief + recommended read order.

---

## 6. Held-queue mechanism (Stage 1 cron + _held/ subdir)

The held-queue path is what gives the verifier teeth. Without it, `status: "held"` is just a string in a JSON return — no downstream consequence. With it, HELD articles actually don't ship + Telegram-notify Jacob.

### How it works (full flow)

1. **Stage 1 cron STEP 4.5** spawns the verifier per article. Verifier returns one of: `approved`, `corrected`, `flagged`, `held`, `error`.
2. **Stage 1 cron STEP 5** routes by status:
   - `approved` / `corrected` → sheet status "Written" (Stage 2 will deploy)
   - `flagged` / `error` → sheet status "Needs Review" (Stage 2 skips by glob; human un-holds)
   - `held` → sheet status "Held" + failure reason in Notes col + **MOVE the .md file** from `content/blog/<slug>.md` to `content/blog/_held/<slug>.md`
3. **Stage 2 cron** runs ~1 hour later. Its grep glob is `content/blog/*.md` — does NOT recurse into subdirectories. Articles in `_held/` are invisible to the deploy step.
4. **Telegram notification** fires via Stage 1's existing `notify: true` cron header. The Stage 1 report includes a "🛑 HELD" section listing each held article + failure reason + recommended action.
5. **Un-holding** is manual: Jacob reviews the failure reason, either (a) regenerates the article via writer (fixes the structural issue), (b) manually edits and `mv`s back to main blog dir, or (c) overrides-ships if the verifier was wrong.

### Why this design

- **Defensible default.** "Don't ship broken work" is the conservative choice. HOLD blocks deploy; everything else ships.
- **Verifier doesn't write prose.** Held articles regenerate via writer (which has the GATES), not via verifier (which would drift from the writer's voice).
- **Glob exclusion is mechanical.** No code change to Stage 2 — just a file-system convention. `_held/` is a hidden-by-glob subdir.
- **Sheet status as audit trail.** "Held" status in Google Sheet preserves the row + failure reason; un-holding updates the status back to "Written" + Stage 2 picks it up next tick.

### What triggers HELD (HIGH structural failures only)

- **GATE A** (year in slug): always HOLD — slug is a visible URL bug; only fix is regen with new slug
- **GATE B** (income-gated topic, table totally absent): HOLD — required structural section missing
- **GATE C** (0 or 1 .gov citations): HOLD — article is unsourced
- **GATE E/F** (template-specific required section absent): HOLD — required structural section missing
- **Anything else**: ship + flag (don't HOLD)

### What does NOT trigger HELD

- Numeric drift → auto-fix and ship
- Ambiguous numeric claim → ship + flag
- Style issues (`--`, em-dash) → auto-fix and ship
- Pronoun discipline violations (1-3) → ship + LOW flag
- Pronoun discipline violations (4+) → ship + MEDIUM flag (writer-side issue, regen on next pass)
- State-context boundary leaks → ship + LOW/MEDIUM flag
- Schema validator warnings (`keyTerms` shape, etc.) → ship + flag
- Source URL 404 → flag (don't auto-replace)

### Test fire (validated 2026-05-14)

Held queue mechanism was test-fired with a synthetic article (`test-held-queue-2026.md` with intentional year-in-slug). Verifier returned `status: "held"` with `gates_failed: [{gate: "A", ...}]`. File-move-to-_held/ logic + Stage 2 *.md glob exclusion both validated. Test artifact deleted after.

---

## 6.5 Test articles + pass criteria (universal)

Every template's Phase 4 follows the same shape:

- **5 test pages** (1-3 may be regenerations of existing pages; 2-4 should be net-new topics that don't collide with existing slugs)
- **Verifier scoring** on 0-100 rubric covering universal rules + recipe + audit gaps
- **Pass:** 5/5 strict mode validators + 4/5 rubric ≥80%
- **Iterate** if any fail; budget 30-60 min for one iteration round
- **Save outputs to** `content/data/<template>/<slug>.json` (or `content/blog/<slug>.md` for blog)

---

## 7. The 4 universal GATES (carry from B1 — REQUIRED in every Track C writer's STEP 6)

These were derived during B1 Phase 4 testing. The agent doesn't enforce STEP 6 strictly unless these are framed as HARD REJECTS. Include at the TOP of every writer's STEP 6 with "STOP. Read this twice." language.

- **GATE A — slug must not contain a year. UNIVERSAL — applies to all templates.** Regex `\b(19|20)\d{2}\b` against slug → reject if match. Include worked examples of wrong vs right (mri-cost-2026 ❌; mri-cost ✓).
- **GATE B — household-size tables have exactly 9 data rows** (sizes 1, 2, 3, 4, 5, 6, 7, 8 PLUS "each additional person" row). Multiple tables per page must each hit 9. **CONDITIONAL — applies only when the page's topic is income-gated.** Templates where it applies: ma-state (state Medicaid income context as supporting table), persona (income-eligibility for PTC/subsidies), event (income-eligibility for Medicaid/CHIP after coverage loss), Q&A state-eligibility subtype, daily-blog FPL-shape. Templates where it does NOT apply: glossary (skip), drug (skip unless PAP eligibility table), procedure (skip unless charity-care eligibility table), Q&A coverage subtype (skip). When skipping, omit GATE B from STEP 6.
- **GATE C — ≥3 inline outbound .gov / .edu / kff.org citations** with domain visible in anchor text. **UNIVERSAL.** For state articles: federal source + state agency (HYPERLINKED, not plain text) + 1 third-party authority.
- **GATE D — zero `--` (double-hyphen) anywhere. UNIVERSAL.** Literal `--` renders as em-dash in MDX/typography. Em-dash ban covers BOTH `—` (U+2014) AND `--`.

Plus per-template GATES from §5.X.

**Rollback recipe** (every session must have this ready if Phase 5 first-tick output fails strict validators):
```bash
cd /Users/jacobposner/clawd
cp .claude/agents/coveredusa-<template>-writer.bak.md \
   .claude/agents/coveredusa-<template>-writer.md
git add .claude/agents/coveredusa-<template>-writer.md
git commit -m "Roll back Track C <template> writer rewrite — first-tick failure

Reason: [specific failure mode]
Rolling back to pre-Track-C prompt; re-investigate before retry."
```

---

## 8. Sequencing recommendation

**Round 1 (sequential, alone): MA-state writer.** 3-4 hours. Highest priority; closest to formula-aligned; unblocks Track D state×Medicaid factory which is the biggest content ROI on the roadmap.

**Round 2 (parallel batch of 5 + Q&A optional solo): Procedure + Drug + Persona + Event + Glossary in parallel; Q&A optionally solo (architecturally complex due to subtype dispatch).** End-to-end wall-clock: 5-6 hours (longest single session — Q&A if done in batch). If Q&A runs solo before/after the parallel batch, the parallel batch wall-clock is ~3-4 hours (longest = drug at ~4 hours).

Why Q&A is the optional-solo: it's the only template with subtype-dispatch architecture (one writer, two recipes, conditional branch). Drafter needs more focus than the others; running solo reduces context-switching risk.

**Round 3 (Track D — depends on MA-state completion): bulkgen 51 state MA pages + 50 state Medicaid permutation factory.** With the updated MA-state writer, this is mostly automated.

**Round 4 (Track E): bulk regen of existing pages.** Using the now-updated writers, regenerate the 56 existing pages (36 blog + 20 template) to the new standard.

**Round 5 (Track F): BenefitsUSA optimization.** Last. Apply the framework + writer pattern to BenefitsUSA with extreme caution (fragile asset; never URL changes).

If you want to compress Round 2 further: Q&A is the most architecturally complex (subtype dispatch). It's safe to do that solo while the others parallelize. Glossary is the easiest (mostly subtraction). The middle four (procedure, drug, persona, event) are textbook applications of the pattern.

---

## 8.5 End-state page count math (added v1.3)

How many pages will CoveredUSA have at each phase? Planning anchor for Track D / E / F sessions.

### Right now (2026-05-14, mid-Track-C-prime)

~61 pages live across coveredusa.org:

| Surface | Count | Notes |
|---|---|---|
| Daily blog | 36 | B1 cron producing ~3/day |
| MA-state | 8 | CA/TX/WY pre-formula + FL/NY/MI/OH/PA formula-aligned |
| Procedure | 3 | mri, ct-scan, colonoscopy |
| Drug | 3 | ozempic, metformin, insulin |
| Persona | 2 | gig-workers, self-employed |
| Event | 3 | turning-26, turning-65-medicare, lost-job |
| Q&A | 3 | medicaid-rehab, medicare-dental, medicare-vision |
| Glossary | 3 | magi, deductible, oop-max |

### After this batch (Track C-prime, 6 parallel sessions complete)

~91 pages — each session adds 5 net-new test articles = +30. Plus daily blog keeps adding ~3/day during execution.

| Surface | After C-prime |
|---|---|
| Daily blog | 36+ (growing daily) |
| MA-state | 8 |
| Procedure | 8 (+5) |
| Drug | 8 (+5) |
| Persona | 7 (+5) |
| Event | 8 (+5) |
| Q&A | 8 (+5) |
| Glossary | 8 (+5) |

### After Track D (MA bulkgen + Medicaid state factory)

~206 pages — Track D is the single biggest content move on the roadmap. Two parts:

1. **MA-state bulkgen:** finish the remaining 43 states + DC using the proven MA-state writer + verifier. Wall-clock: ~1 day with parallel batches.
2. **Medicaid state factory:** new `/medicaid-income-limits/[state]` route + 50 state pages with household-size income tables using state-program brand names (Medi-Cal, AHCCCS, MNsure, SoonerCare, kynect, etc.). This is the highest-ROI content investment per FANOUT_FORMULA §5.1.

| Surface | After Track D |
|---|---|
| Daily blog | ~50+ |
| MA-state | **51** (capped — US has 51 jurisdictions) |
| Medicaid state factory (NEW) | **51** |
| Procedure | 8 |
| Drug | 8 |
| Persona | 7 |
| Event | 8 |
| Q&A | 8 |
| Glossary | 8 |

### After Track E (bulk regen of existing 56 pages)

Still ~206 pages — Track E doesn't add pages, it regens existing ones to the new formula standard. Glossary downsizing (magi/deductible/oop-max) happens here.

### Realistic 6-month future state (~500 pages)

What the templates ENABLE when bulkgens run on top of Tracks C/D/E:

| Surface | 6-month target | Constraint |
|---|---|---|
| Daily blog | ~216 | 36 today + ~180 over 6 months at 3/day |
| MA-state | 51 | capped |
| Medicaid state factory | 51 | capped |
| Procedure | ~20 | top-20 most-searched (knee/shoulder/spine MRI variants, CT scan variants, colonoscopy, mammogram, x-ray, echocardiogram, ultrasound, EGD, biopsy, etc.) |
| Drug | ~30 | top-30 prescribed + IRA drugs (Eliquis, Jardiance, Ozempic, Wegovy, Humira, Mounjaro, insulin variants, top statins, BP meds, etc.) |
| Persona | ~12 | gig drivers, freelancers, college students, divorcees, military, immigrants, etc. |
| Event | ~12 | marriage, divorce, baby, lost-job, retire, turn-26, turn-65, move-states, become-caregiver, lose-spouse, etc. |
| Q&A | ~100 | "does X cover Y" / "do I qualify for Z" patterns — scales linearly with effort |
| Glossary | ~30 | HSA, FSA, PTC, copay, coinsurance, deductible, MOOP, HDHP, EHB, formulary, etc. |
| **Total** | **~530** | |

### Long-tail permutation scale (12+ months)

The templates SUPPORT state × topic permutations. Sample:

- Drug × state: 30 drugs × 51 states = **1,530 drug-cost-by-state pages**
- Procedure × state: 20 procedures × 51 states = **1,020 procedure-cost-by-state pages**
- Persona × state: 12 personas × 51 states (where state-specific stipends exist) = up to ~600
- Event × state: 12 events × 51 states (SEP rules vary) = up to ~600

**Theoretical permutation ceiling: 3,000-5,000+ pages.** The cap isn't infrastructure — each new page costs ~$0.50 in agent time. The cap is editorial decision on what's worth writing.

### The strategic picture

- **Today: 61 pages.** Patchwork.
- **After Track C-prime: 91.** Every template now formula-aligned + verifier-backed. Foundation complete.
- **After Track D: 206.** State coverage achieved (MA-state 51 + Medicaid 51). The "lookup by state" SEO pattern owned.
- **6 months out: ~500.** Template-driven bulkgens running. Daily blog continues at 3/day.
- **12 months out: 1,500+.** Permutation factories running. Category moat established.

Track C-prime is the LAST FOUNDATIONAL work. After it ships, every page produced going forward inherits the new standard. Bulkgens become mechanical: spawn 10 writer agents in parallel, each writes 1 page, verifier fact-checks each, ship the batch. ~$5 in agent costs per batch of 10 pages.

The 500-page mark is where the SEO/AI-citation moat starts mattering. The 1,500-page mark is where you own the healthcare-insurance lookup category.

---

## 9. Cross-references

- `projects/covered-usa/specs/FANOUT_FORMULA.md` — the playbook
- `projects/covered-usa/specs/REFACTOR_ROADMAP.md` — broader Track ordering
- `projects/covered-usa/specs/TRACK_B1_PLAN.md` — the B1 plan (model for these per-template plans)
- `projects/covered-usa/specs/URL_SLUG_FRAMEWORK.md` — slug rules
- `projects/covered-usa/specs/LINK_TARGET_MANIFEST.md` — link routing
- `.claude/agents/_universal-rules-block.md` — shared universals (read-only)
- `projects/covered-usa/content/fanout/analysis/audit-*-writer.json` — per-template audit findings
- Memory: `feedback_b1_blog_writer_shipped.md` — B1 lessons learned (the 4 GATES, the "STOP. Read this twice." framing, the verifier pattern)

---

## 10. First 5 actions for any parallel Track C session

1. Read this doc through §4 (shared framing) + §3 Phase 4.5 (verifier scope). Then read §5.X for YOUR template only.
2. Read `feedback_b1_blog_writer_shipped.md` memory entry for the lessons learned.
3. Read the cited source docs in §3 Phase 1 for your template + the two reference verifiers (`coveredusa-article-verifier.md`, `coveredusa-ma-state-verifier.md`) for the verifier update pattern.
4. Pull origin/main on both repos (clawd-workspace and covered-usa) before doing anything.
5. Start Phase 1 — spawn the planner agent with the prompt template from §3 Phase 1.

**Atomic deliverable per session:** writer rewrite + verifier rewrite + 5 test articles + requirements matrix + 3 verifier reports + memory entry. All ship together (4 commits total per §3 Phase 5).

If anything in this doc is unclear, surface it to Jacob BEFORE proceeding. Don't guess at scope.

---

*This is the plan. Self-contained, verification-first, audit-grounded, parallel-execution-ready. Multiple Claude Code sessions can execute simultaneously without collision. The proprietary asset is the formula; each template is just an application.*

---

## Appendix A — Real-world drift case studies (from the 2026-05-14 load test)

These are the actual factual + structural drift cases the new verifier caught during the FL/NY/MI/OH/PA load test. Read them — they're concrete examples of the kind of thing the verifier exists to prevent shipping. Each one would have eroded user trust if shipped uncaught.

**Case 1 — Florida `averageMonthlyPremium` $8 → $2 (4x error in 10 places)**
- Writer claimed $8/mo across `marketOverview`, `meta.description`, `hero.subhero`, `quickAnswer`, all FAQ answers, multiple detailSection paragraphs.
- CMS 2026 MA/Part D Landscape State Fact Sheet: $2.11/mo for Florida.
- **Most damning detail:** the writer's OWN source citation note correctly cited $2.11. It cited the right number then wrote $8 in every prose location anyway.
- Verifier auto-fixed all 10 occurrences. Florida shipped clean.
- **Implication for your session:** numeric drift can be 4x and still pass writer self-check. Verifier is the safety net.

**Case 2 — New York logical contradiction "53% above 54%"**
- Writer prose said: "That penetration rate is above the national average of 54%". Penetration rate field: 53%. 53 < 54.
- Writer made a logically-impossible claim and shipped it confidently.
- Verifier caught it during STEP 1A internal-consistency pre-check. Auto-fixed to "just below the national average of 54%" in both EN and ES.
- **Implication:** writers can confidently emit logically-impossible claims; verifier's internal-consistency pass exists to catch these.

**Case 3 — Pennsylvania PACENET income limits drift ($23,500 → $33,500)**
- Writer claimed PACENET single income limit = $23,500, couple = $31,500. Real CMS values: $33,500 single, $41,500 couple (Act 94 of 2021, effective Feb 2022).
- Writer's training data had pre-Act-94 figures; writer didn't web-search to verify.
- Verifier WebSearched PA.gov + PHLP.org, confirmed correct values, auto-fixed all 4 instances (EN + ES stateExtras, EN + ES FAQs).
- **Implication:** statute-driven income limits change yearly+; writer training data goes stale. Verifier WebSearch is non-optional for this class of claim.

**Case 4 — Michigan invalid `/medicare-part-d` href**
- Writer added a relatedLink to `/medicare-part-d`. That route doesn't exist in the CoveredUSA app (no page builds at that path).
- Writer didn't validate href against the canonical VALID_HREF_PREFIXES list in `validate-medicare-advantage.js`.
- Verifier flagged as MEDIUM (couldn't auto-fix because no clear replacement existed). Manually dropped the link entry.
- **Implication:** if the build validator (`scripts/validate-*.js`) would reject the field, the verifier should HOLD, not flag MEDIUM. Patch this in your verifier prompt.

**Case 5 — Ohio 11 unfixed `--` double-hyphens**
- Writer shipped 11 `--` instances throughout body prose.
- Verifier saw them, marked them as "Category J style — informational, not blocking", did NOT auto-fix.
- Article would have shipped with rendered em-dashes in production typography (visual style violation).
- Manually fixed via `replace_all " -- " → ", "`.
- **Root cause:** verifier prompt's GATE D auto-fix instruction was too soft. Track C-prime patches hoisted GATE D auto-fix above Category J advisory framing with "AUTO-FIX MANDATORY" + worked-example callouts.
- **Implication:** style fixes that are surgical + safe to auto-edit MUST fire as auto-fix, not as informational notes. Hoist the framing in your verifier prompt.

---

## Appendix B — Writer-leaks pattern (writer claims gates pass; verifier disagrees)

Across the 4-state load test, writer self-reports of "all gates pass" were UNRELIABLE. Concrete leaks:

- **PA writer:** "All 8 Gates pass" + `detail_section_count: 3`. Spec requires ≥4. Writer interpreted "≥4" as advisory.
- **MI writer:** "Gate H: PASS" + included invalid `/medicare-part-d` href. Writer didn't check VALID_HREF_PREFIXES.
- **OH writer:** "Gate D: PASS" + 11 `--` instances in prose. Writer's own grep didn't fire.
- **NY writer:** "All gates pass" + introParagraphs[2] opened with "This guide" (pronoun violation, GATE G). Florida had the same issue (introParagraphs[2] opened with "This").

**The pattern:** writers misinterpret "soft" gate language ("≥4" / "should not start with") as advisory rather than strict. They also under-grep their own output. **The fix is at the verifier:** independent gate checks + REJECT-on-fail framing. Don't rely on writer self-report; verify externally.

---

## Appendix C — Quick reference: file paths every parallel session needs

```
# Master brief (this doc)
projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md

# Per-template PRDs (read your one)
projects/covered-usa/specs/track-c-prime/<template>-prd.md
projects/covered-usa/specs/track-c-prime/README.md  # index

# Universal infrastructure (DO NOT MODIFY)
.claude/agents/_universal-rules-block.md
projects/covered-usa/specs/FANOUT_FORMULA.md
projects/covered-usa/specs/URL_SLUG_FRAMEWORK.md
projects/covered-usa/specs/LINK_TARGET_MANIFEST.md
projects/covered-usa/content/link-index.json
projects/covered-usa/scripts/lib/content-quality.js

# Reference implementations (READ — DO NOT MODIFY in your session)
.claude/agents/coveredusa-article-writer.md       # B1 daily blog writer
.claude/agents/coveredusa-article-verifier.md     # daily blog verifier (Track C-prime)
.claude/agents/coveredusa-ma-state-writer.md      # Track C MA-state writer
.claude/agents/coveredusa-ma-state-verifier.md    # Track C MA-state verifier (Track C-prime)

# Your template's files (THIS is what you modify)
.claude/agents/coveredusa-<template>-writer.md
.claude/agents/coveredusa-<template>-verifier.md
projects/covered-usa/content/data/<template-dir>/  # output directory for test articles

# Memory (READ before starting)
~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_b1_blog_writer_shipped.md

# Audit findings for your template
projects/covered-usa/content/fanout/analysis/audit-<template>-writer.json

# Output paths for your Phase 1 + 3 deliverables
projects/covered-usa/content/fanout/analysis/c-<template>-requirements-matrix.md
projects/covered-usa/content/fanout/analysis/c-<template>-verifier-{a,b,c}.md
```

