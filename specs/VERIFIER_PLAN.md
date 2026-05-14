# CoveredUSA Article Verifier — Execution Plan

**Created:** 2026-05-13
**Goal:** Add an automated fact-verification step to the daily SEO cron so every newly-written article gets its numeric, date, statute, and policy claims checked against primary sources before commit.
**Working Directory:** `/Users/jacobposner/clawd/`

---

## Overview

The daily CoveredUSA SEO cron (`coveredusa-seo-stage1.md`) currently spawns 10 parallel `coveredusa-article-writer` agents. Each writer does its own web research and writes blindly — no second pass. This causes fact drift across the corpus (e.g., article correctly states "ACA uses 2025 FPL" but lists 2024 FPL numbers; IRA dated 2022 in one paragraph and 2023 in another).

Fix: insert a `coveredusa-article-verifier` agent step after the writers complete. Each verifier reads one newly-written `.md` file, identifies numeric claims / statute references / policy-state claims, web-researches each against primary sources, and either approves or rewrites in place. Auto-commit with a change log.

Architecture decision (locked in with Jacob):
- **No central reference doc.** Verifier does live web research.
- **Tight instructions in the agent prompt** specify which sources to prefer (CMS.gov for Medicare, ASPE.HHS.gov for FPL, Congress.gov for statutes, KFF for ACA policy state).
- **Auto-commit corrections.** No human-in-the-loop. Daily change log goes to Telegram via cron summary.
- **Narrow edit scope.** Verifier only rewrites the specific claim, not surrounding context.

---

## Success Criteria

The work is DONE when ALL of these are true:

- [ ] `coveredusa-article-verifier` agent definition exists at `.claude/agents/coveredusa-article-verifier.md`
- [ ] Stage 1 cron (`.claude/claudeclaw/jobs/coveredusa-seo-stage1.md`) spawns verifiers in parallel after writers complete
- [ ] Test against `aca-subsidy-cliff-2026.md`: verifier flags or corrects the `$15,060` (2024 FPL) → `$15,650` (2025 FPL) discrepancy
- [ ] Test against `drug/insulin-cost/page.tsx`: verifier identifies the IRA-2022-vs-2023 inconsistency (it's a `.tsx` not a `.md`, so we test by extracting the relevant text into a temp `.md` first)
- [ ] Verifier returns valid JSON: `{status, claims_checked, claims_corrected, claims_flagged, change_log[]}`
- [ ] Cron's Step 6 (Report) includes the verifier change log
- [ ] An independent critic agent reviews the verifier design and finds no critical issues
- [ ] All changes committed to git with a clear message

---

## Pre-Execution Setup

Before any task starts:
1. Confirm `/Users/jacobposner/clawd/projects/covered-usa/src/lib/facts-2026.ts` exists (will be trashed in Task 1)
2. Confirm `.claude/agents/coveredusa-article-writer.md` exists (we'll mirror its frontmatter pattern)
3. Confirm `.claude/claudeclaw/jobs/coveredusa-seo-stage1.md` exists (we'll modify it)

---

## TASK 1: Trash `facts-2026.ts`

- **Status:** todo
- **Difficulty:** Easy

### What to Do
Delete the TypeScript constants file. It was the wrong shape for the problem.

### Verification Commands
```bash
ls /Users/jacobposner/clawd/projects/covered-usa/src/lib/facts-2026.ts 2>&1
# Should output: ls: ... No such file or directory
```

### Success Criteria
- [ ] File no longer exists
- [ ] No other files in the codebase import from `facts-2026.ts` (grep confirms)

---

## TASK 2: Draft `coveredusa-article-verifier` agent

- **Status:** todo
- **Difficulty:** Hard

### What to Do
Create `.claude/agents/coveredusa-article-verifier.md`. Frontmatter mirrors `coveredusa-article-writer.md` pattern (model: sonnet, background: true, permissionMode: bypassPermissions, maxTurns appropriate for verification work).

Body of agent prompt must include:

**Inputs:** path to a `.md` file just written by the article writer.

**Process:**
1. Read the .md file completely
2. Identify "high-risk claims" — these are the categories that drift most:
   - Dollar amounts that look like federal benefit thresholds ($15,060, $15,650, $15,960, etc.)
   - Percentages of FPL ("100% FPL = $X")
   - References to statutes by year (e.g., "Inflation Reduction Act of 2022")
   - Statements about current policy state ("the subsidy cliff is in effect", "the CFPB rule removes medical debt from credit reports")
   - Medicare premium / deductible figures
   - Year-anchored claims ("as of 2026", "in 2026")
3. For each high-risk claim:
   - Identify the canonical primary source (rules in the prompt: CMS.gov for Medicare, ASPE.HHS.gov for FPL, Congress.gov for statutes, KFF for ACA policy state, IRS.gov for tax stuff)
   - Use WebSearch to find the current authoritative value
   - Compare to what the article says
   - If different: edit the .md file in place with the correction (narrow scope — just the claim, not surrounding context)
   - If unverifiable (e.g., "most patients save hundreds"): flag, don't edit
4. Special case: FPL claims need context check
   - If article says "uses 2025 FPL" but lists numbers, verify those numbers ARE 2025 FPL
   - If article says "uses 2026 FPL", verify against 2026 FPL
   - Don't blindly swap to current year — use the year the article claims to cite
5. Style violations: also catch
   - Em dashes (—) and en dashes (–) → replace with commas, periods, or "to"
   - Filler phrases: "in conclusion", "in today's fast-paced", "navigating the complex world"

**Output:** JSON on the final line:
```json
{"status": "approved|corrected|flagged", "claims_checked": N, "claims_corrected": N, "claims_flagged": N, "change_log": [{"claim": "...", "before": "...", "after": "...", "source": "..."}]}
```

**Critical rules:**
- Use `Edit` tool with narrow scope for corrections (specific old_string → new_string)
- Never rewrite entire paragraphs
- Confidence threshold: only edit if the primary source clearly disagrees. If ambiguous, flag.
- Tools: Read, Edit, WebSearch, WebFetch, Bash, Grep

### Verification Commands
```bash
test -f /Users/jacobposner/clawd/.claude/agents/coveredusa-article-verifier.md && echo OK
grep -c "permissionMode" /Users/jacobposner/clawd/.claude/agents/coveredusa-article-verifier.md
grep -c "ASPE" /Users/jacobposner/clawd/.claude/agents/coveredusa-article-verifier.md
grep -c "narrow" /Users/jacobposner/clawd/.claude/agents/coveredusa-article-verifier.md
```

### Success Criteria
- [ ] File exists at correct path
- [ ] Frontmatter is valid YAML
- [ ] Prompt includes preferred-source rules (CMS, ASPE, Congress, KFF, IRS)
- [ ] Prompt includes narrow-edit-scope rule
- [ ] Prompt includes year-context rule (don't blindly swap FPL years)
- [ ] Output JSON shape documented
- [ ] Tools list is appropriate (Read, Edit, WebSearch, WebFetch, Bash, Grep)

---

## TASK 3: Update Stage 1 cron to spawn verifiers

- **Status:** todo
- **Difficulty:** Medium

### What to Do
Edit `.claude/claudeclaw/jobs/coveredusa-seo-stage1.md`.

Insert a new step between current STEP 4 (Collect Results) and STEP 5 (Update Google Sheet):

**NEW STEP 4.5: Verify Articles**

After collecting writer results, for each article with `status: "success"`, spawn a `coveredusa-article-verifier` agent in parallel. Each verifier gets one .md path. Wait for all to complete.

Collect verifier results into a separate `verifications` array. Each entry: `{slug, verifier_status, claims_corrected, change_log}`.

Modify STEP 5 (Update Google Sheet) to NOT mark articles "Written" if their verifier `status: "flagged"`. Those stay in `Verifying` status for manual review.

Modify STEP 6 (Report) to include verifier summary:
```
🔍 Verification Summary
✅ Approved: N articles
🔧 Corrected: N articles (X total claims corrected)
⚠️ Flagged for review: N articles
[List of slugs that need review]
```

### Verification Commands
```bash
grep -c "coveredusa-article-verifier" /Users/jacobposner/clawd/.claude/claudeclaw/jobs/coveredusa-seo-stage1.md
grep -c "STEP 4.5" /Users/jacobposner/clawd/.claude/claudeclaw/jobs/coveredusa-seo-stage1.md
grep -c "PARALLEL" /Users/jacobposner/clawd/.claude/claudeclaw/jobs/coveredusa-seo-stage1.md
```

### Success Criteria
- [ ] STEP 4.5 exists with explicit parallel-spawn instruction
- [ ] STEP 5 updated to handle "flagged" status (don't mark Written)
- [ ] STEP 6 includes verifier summary in Telegram report
- [ ] No regressions to existing writer flow

---

## TASK 4: Test verifier on `aca-subsidy-cliff-2026.md`

- **Status:** todo
- **Difficulty:** Medium

### What to Do
Run the verifier agent against `content/blog/aca-subsidy-cliff-2026.md`. Known bug: article claims "uses 2025 FPL" but lists 2024 FPL numbers ($15,060 for household-of-1 should be $15,650).

Use the Agent tool to invoke `coveredusa-article-verifier` with the article path.

### Verification Commands
```bash
# Save before-state
cp /Users/jacobposner/clawd/projects/covered-usa/content/blog/aca-subsidy-cliff-2026.md /tmp/cliff-before.md

# After running verifier:
diff /tmp/cliff-before.md /Users/jacobposner/clawd/projects/covered-usa/content/blog/aca-subsidy-cliff-2026.md

# Verify the specific fix
grep "15,060\|15,650" /Users/jacobposner/clawd/projects/covered-usa/content/blog/aca-subsidy-cliff-2026.md
# Should show 15,650 (corrected), not 15,060 (original)
```

### Success Criteria
- [ ] Verifier returns valid JSON
- [ ] `claims_corrected >= 1`
- [ ] `change_log` contains an entry for the FPL number
- [ ] The .md file now contains $15,650 (or other accurate 2025 FPL numbers) where it previously had $15,060
- [ ] No other unintended edits to the article
- [ ] If verifier flags instead of corrects, that's also acceptable as long as it CAUGHT the issue

---

## TASK 5: Test verifier on a fresh-written clean article

- **Status:** todo
- **Difficulty:** Easy

### What to Do
Pick an article we believe is accurate (e.g., `how-to-negotiate-hospital-bills.md` — quality agent rated 8/10 with no flagged facts). Run verifier against it. Should approve, no corrections.

### Verification Commands
```bash
cp /Users/jacobposner/clawd/projects/covered-usa/content/blog/how-to-negotiate-hospital-bills.md /tmp/negotiate-before.md

# After running verifier:
diff /tmp/negotiate-before.md /Users/jacobposner/clawd/projects/covered-usa/content/blog/how-to-negotiate-hospital-bills.md
# Expect: no diff, OR small style fixes only (em dash → comma)
```

### Success Criteria
- [ ] Verifier returns `status: "approved"` or `"corrected"` with only minor style fixes
- [ ] No fabricated "corrections" to claims that were actually accurate
- [ ] Verifier didn't hallucinate a problem where none exists

---

## TASK 6: Critic agent — review verifier design

- **Status:** todo
- **Difficulty:** Medium

### What to Do
Spawn an independent code-review agent with this prompt:

"Review the new verifier agent at `.claude/agents/coveredusa-article-verifier.md` and the cron modifications at `.claude/claudeclaw/jobs/coveredusa-seo-stage1.md`. Be ruthless. Find every flaw — design issues, edge cases not handled, hallucination risks, prompt ambiguities, integration bugs with the cron. Report under 600 words with severity ratings."

### Verification Commands
```bash
# Agent output will be the verification artifact
```

### Success Criteria
- [ ] Critic produces a structured review
- [ ] Critic identifies at least 3 specific issues (if fewer, ask it to look harder)
- [ ] All critical-severity issues addressed before completion

---

## TASK 7: Iterate based on critic findings

- **Status:** todo
- **Difficulty:** Variable

### What to Do
Apply fixes for any critical-severity issues. Re-run tests from Tasks 4 + 5 if changes affect behavior.

### Success Criteria
- [ ] All critical issues from critic resolved
- [ ] Re-verification confirms fixes work

---

## TASK 8: Commit and report

- **Status:** todo
- **Difficulty:** Easy

### What to Do
Git status, git diff, commit changes with descriptive message. Push or hold for Jacob's review (don't push without asking).

Files in the commit:
- DELETED: `projects/covered-usa/src/lib/facts-2026.ts`
- NEW: `.claude/agents/coveredusa-article-verifier.md`
- MODIFIED: `.claude/claudeclaw/jobs/coveredusa-seo-stage1.md`
- POSSIBLY MODIFIED: `content/blog/aca-subsidy-cliff-2026.md` (if test in Task 4 corrected it)
- NEW: `specs/VERIFIER_PLAN.md` (this file)

Report to Jacob:
- What was built
- What the verifier caught on the test article
- Any open questions or things he should review
- Whether to push or hold

### Success Criteria
- [ ] Clean git status after commit (or only intended untracked files)
- [ ] Commit message describes the change clearly
- [ ] Jacob has a clear summary to review

---

## Risks / Unknowns

1. **Verifier might hallucinate corrections.** Mitigation: narrow edit scope, confidence threshold, daily change log for spot-checking.
2. **Verifier might be slow** (web research per claim). Mitigation: it runs in parallel with all other verifiers, so wall-time is one article's worth.
3. **Cost.** Estimated $0.10-0.30/run × 10 runs/day = $1-3/day. Acceptable.
4. **Edge case: verifier "corrects" a claim that was actually right.** Mitigation: test against a known-clean article (Task 5).
5. **Edge case: writer produces a `.md` with a frontmatter the verifier breaks.** Mitigation: verifier must only Edit body, never frontmatter, unless explicitly checking a date there.

---

## Execution Order

```
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
```

Tasks 4 and 5 can run in parallel.
