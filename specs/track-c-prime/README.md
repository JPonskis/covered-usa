# Track C-prime — Per-Template PRDs

This directory contains 6 self-contained briefs (PRDs) — one per template — that each parallel Claude Code session uses to execute Track C-prime for its assigned template.

**What Track C-prime is:** rewrite each remaining CoveredUSA template's writer + verifier to be formula-aligned (per `FANOUT_FORMULA.md`) with detect-only structural GATES + numeric auto-fix + held-queue routing. Mirror the pattern proven on the daily blog cron (Track B1) and the MA-state writer + verifier (Track C, shipped 2026-05-14).

**The work shape per session:** ~4-5 hours wall-clock, 4 commits, 1 memory entry. See the master brief for the 4-phase pattern (`projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md` v1.3).

---

## Recommended read order (for any parallel session, in this order)

1. **`projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md` v1.3** (master brief) through §4 + §3.5 (default-toward-ship) + §6 (held-queue) + Appendices A & B (real-world drift cases)
2. **This README** (you're reading it)
3. **Your template's PRD** (one of the 6 below) — read end to end before spawning any agents
4. **`~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_b1_blog_writer_shipped.md`** — B1 lessons learned
5. **The 3 reference implementations** (DO NOT MODIFY in your session):
   - `.claude/agents/coveredusa-ma-state-writer.md` (cleanest Track C-prime writer example)
   - `.claude/agents/coveredusa-ma-state-verifier.md` (cleanest Track C-prime verifier example)
   - `.claude/agents/coveredusa-article-verifier.md` (B1 + Track C-prime daily blog verifier)
6. **Source docs cited in your PRD's §1 Context Inventory** — schema, audit JSON, current writer/verifier, gold standard

---

## The 6 PRDs

| Template | PRD | Recipe | Output dir | Test mix focus | Expected time |
|---|---|---|---|---|---|
| **Procedure** | [`procedure-prd.md`](procedure-prd.md) | §4.1 | `content/data/procedures/` | x-ray, knee-mri, echocardiogram, mammogram, upper-endoscopy | 4-5 hr |
| **Drug** | [`drug-prd.md`](drug-prd.md) | §4.2 | `content/data/drugs/` | eliquis, jardiance, januvia, humalog, atorvastatin | 4-5 hr |
| **Persona** | [`persona-prd.md`](persona-prd.md) | §4.7 | `content/data/personas/` | uber-lyft-rideshare-drivers, freelance-designers-consultants, college-students, recently-lost-employer-coverage, near-retirement | 4-5 hr |
| **Event** | [`event-prd.md`](event-prd.md) | §4.6 | `content/data/events/` | getting-married, having-a-baby, moving-states, divorce, becoming-a-caregiver | 2-3 hr (smallest) |
| **Q&A** | [`qa-prd.md`](qa-prd.md) | §4.3 + §4.4 | `content/data/qa/` | 3 coverage + 2 state-eligibility (subtype dispatch) | 5-6 hr (largest, most complex) |
| **Glossary** | [`glossary-prd.md`](glossary-prd.md) | §4.5 | `content/data/glossary/` | premium-tax-credit, copayment-vs-coinsurance, in-network-vs-out-of-network, special-enrollment-period, open-enrollment-period | 1-2 hr (subtraction work) |

**MA-state PRD does not exist** — that template shipped via Track C earlier on 2026-05-14. Use `coveredusa-ma-state-writer.md` + `coveredusa-ma-state-verifier.md` as reference implementations instead.

---

## Sequencing for parallel execution

Per master brief §8 sequencing recommendation:

- **Round 1 (already complete):** MA-state writer + verifier shipped + load-tested at 4-state scale (FL/NY/MI/OH/PA all live).
- **Round 2 (this batch — Track C-prime parallel sessions):** spin up 5 parallel sessions for Procedure / Drug / Persona / Event / Glossary. Each takes ~3-5h wall-clock; together ~5h wall-clock for the whole batch. Q&A optionally solo (architecturally complex due to subtype dispatch — recommended to run alone for focus).
- **Round 3 (Track D, after Round 2):** state×Medicaid permutation factory + bulkgen of remaining MA states.
- **Round 4 (Track E):** bulk regen of existing pages (the 3 procedures, 3 drugs, 3 glossary terms, 3 events, 1-2 personas — using the new writer + verifier combo).
- **Round 5 (Track F):** BenefitsUSA optimization (LAST, separate site).

---

## Coordination rules for parallel sessions (recap from master brief §4)

1. **Each session works on EXACTLY ONE template.** No cross-template tweaks.
2. **Sessions NEVER modify shared infrastructure** (master brief §2 list). If a shared rule looks wrong, raise to Jacob as a separate task.
3. **Git workflow:** pull origin/main before starting; commit only your template's files; push when done. If push fails due to upstream changes from another session: `git pull --rebase` and re-push.
4. **The covered-usa repo has Vercel auto-deploy from main.** Every push deploys. Don't push half-finished work.
5. **The clawd-workspace repo is workspace-synced.** Commits propagate to frankthebot Mac mini; cron picks up writer prompt changes immediately.
6. **Test-article slugs must be unique across sessions.** Each session's test articles go into its own template's data subdir. Pre-Phase-4 collision check is in every PRD's §11.
7. **Don't run multiple Phase 4 cycles for the same template simultaneously.** One session per template at a time.

---

## What every PRD contains (uniform structure)

Each PRD has 12+ sections. Use the section numbers below to navigate quickly:

- **§0 Read order** — what to read before starting (mandatory)
- **§1 Context inventory** — source docs the planner agent will read in Phase 1
- **§2 Schema reminder + hard contracts** — TypeScript interface + non-negotiables
- **§3 Recipe expanded** — §4.X dominant shapes, required H2s, required FAQ topics, required vocabulary, with worked examples
- **§4 Audit findings synthesized** — specific page-level gaps with file:line citations from the audit JSON
- **§5 Universal GATES (recap)** — the 4 universal gates from the master brief, with template-specific applicability notes
- **§6 Template-specific GATES** — full PASS/WARN/FAIL/HOLD definitions with examples per gate
- **§7 Test mix** — 5 topics with rationale, plus collision check
- **§8 Common failure modes** — what to watch out for during writing + verification
- **§9 Verifier scope (Phase 4.5)** — what to update in the matching verifier (3 mandatory patches per master brief)
- **§10 Atomic deliverable** — 4-commit ship pattern + memory entry template
- **§11 Pre-flight checklist** — bash commands to run before Phase 1
- **§12 Quick reference card** — one-screen summary for monitor

Q&A PRD adds **§3.5 Subtype Dispatch** (only Q&A has this architectural mechanic).

---

## Verification status

Before any of these PRDs ships to a parallel session, the following verifications must pass:

- [ ] **Per-PRD completeness check** — all 12 sections present, cited file paths exist, audit findings match JSON, schema fields match TypeScript
- [ ] **Per-PRD fresh-eyes check** — a verifier agent reads the PRD cold and lists any clarifying questions; if questions can't be answered from the PRD + master brief, that's a gap to fix
- [ ] **Cross-PRD consistency check** — vocabulary identical across PRDs (same gate IDs, same status names, same return JSON shapes), patterns repeat correctly
- [ ] **Live test on Glossary PRD** — fresh agent executes Phase 1 (planner agent) using only the master brief + Glossary PRD; if it gets stuck or asks questions, the PRD has gaps

Verification is in progress (or complete — check git history for the verification commits).

---

## When to spawn each session

Per Jacob's preference, parallel sessions are spawned by him in his own Claude Code terminals (Max plan unlocks multiple simultaneous sessions). Each session opens its own conversation, reads the master brief + its assigned PRD, executes the 4-phase pattern, and ships 4 commits.

Recommended spawn batch: 5 sessions for Procedure + Drug + Persona + Event + Glossary in parallel (~5h wall-clock total). Q&A solo before or after the batch (~5-6h alone) since its subtype dispatch warrants undivided focus.

---

## Reference implementations (READ before writing your verifier)

These are the 3 working agents from B1 + Track C that prove the pattern. Copy structure; do not modify.

| Agent file | What it proves |
|---|---|
| `.claude/agents/coveredusa-article-writer.md` | B1 daily blog writer (formula-aligned, 4 GATES, $HOME-portable) |
| `.claude/agents/coveredusa-article-verifier.md` | Daily blog verifier (Track C-prime + 3 patches: GATE F count strict, keyTerms shape, GATE D auto-fix hoist) |
| `.claude/agents/coveredusa-ma-state-writer.md` | Track C MA-state writer (8 GATES: 4 universal + 4 MA-state-specific) |
| `.claude/agents/coveredusa-ma-state-verifier.md` | Track C MA-state verifier (8 GATES detect-only, default-toward-ship, all 3 patches applied) |

The MA-state pair is the cleanest reference for the 6 templates here — copy its structure (writer + verifier) and adapt to your template's recipe.

---

## Memory entry to write at completion

Each parallel session writes a memory entry on completion at `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_track_c_<template>_writer_shipped.md` with:

- Per-article scores from Phase 4 verifier
- New lessons learned (anything not covered in the master brief Appendix A/B)
- Specific drift caught by the verifier (PACENET-style cases)
- Patches applied that aren't in the master-brief 3-patch list (candidates for future master-brief upgrade)
- 5-line summary of the 5 shipped articles (slug, word count, status, gates result)

These memory entries inform future sessions and Track D/E/F planning.

---

*This index is the entrance to Track C-prime. Each PRD is its own front door for one parallel session. Combined with the master brief, you have everything you need to execute. Don't guess at scope; if anything is unclear, surface it before proceeding.*
