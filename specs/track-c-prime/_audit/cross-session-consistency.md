# Track C-prime — Cross-Session Consistency Audit

**Date:** 2026-05-15
**Auditor:** Frank (autonomous session)
**Scope:** 12 agent files across 6 Track C-prime template sessions (procedure, drug, persona, event, qa, glossary), checked against MA-state reference baseline + `TRACK_C_PARALLEL_PLAN.md` master brief.

---

## 1. Per-dimension PASS/DRIFT scoring

| # | Dimension | Verdict | Notes |
|---|---|---|---|
| 1 | Universal vocabulary (GATE A-D, PASS/WARN/FAIL/HOLD, approved/corrected/flagged/held, auto-fix vs detect-only, default-toward-auto-ship) | **PASS** | All 12 files use the same status enum + GATE A-D semantics. Default-toward-ship language present in all 7 verifiers (glossary phrases it slightly differently — "Default toward ship" vs "Default-toward-ship preference" — but same semantic). |
| 2 | Step numbering (writers STEP 0-8; verifiers STEP 0 → 1A → 1B → 1C → 2 → 6) | **DRIFT (minor)** | (a) **QA-verifier truncates STEP 6 → STEP 5** (last step is `## STEP 5: Return result`, no STEP 6). Confusing but harmless — content identical. (b) QA-writer has additive `STEP 0a: SUBTYPE DISPATCH` which is legitimate (subtype-aware architecture). |
| 3 | JSON return shape (`gates.{a-h}` lowercase keys, `gates_failed: [{gate, reason}]`) | **DRIFT (one outlier)** | **Glossary-verifier uses `gates_failed: ["e"]` (flat string array)** whereas all 6 other verifiers use `gates_failed: [{"gate": "X", "reason": "..."}]` (object array). This breaks cron parsing if the cron expects the object shape. Also glossary-verifier is **MISSING the "Output-shape note (consistency)"** lock-down clause (`Always use the gates field name with single-letter keys… Do NOT use gate_results, GATE_A, verbose strings`). |
| 4 | Gates routing (A→HOLD, B applicable→HOLD / N/A→skip, C 0-1→HOLD / 2→WARN, D→AUTO-FIX never HOLD) | **PASS** | All 7 verifiers route GATE A→HOLD, GATE C 0-1→HOLD, GATE D→AUTO-FIX. GATE B routing per-template (correct — MA-state always N/A, persona/event conditional, glossary "never HOLD on B"). No verifier HOLDs on GATE D. The post-Ohio MA-state load-test patch language ("11 unfixed `--` because verifier marked them informational") is present in **all 7 verifiers**. |
| 5 | 3 mandatory patches (writer: strict count, keyTerms {en,es}; verifier: GATE D auto-fix hoisted above Category J) | **DRIFT (writer-side)** | keyTerms `{en, es}` shape: **all 6 writers** explicitly call this out. STRICT COUNT programmatic check: **drug + persona writers HAVE IT; procedure, event, qa, glossary writers DO NOT have an explicit `JSON.parse(file).<field>.length` programmatic check pattern**. MA-state reference baseline has the check on `detailSections.length >= 4`. Verifier-side GATE D auto-fix above Category J: **all 7 verifiers explicitly include the post-Ohio precedence language**. |
| 6 | Phase numbering (no rogue Phase 6 / STEP 9+) | **PASS** | No agent file has `STEP 9`, `STEP 10`, `Phase 6`, `Phase 7`, or `Phase 8` headers. Master-brief Phases 1-5 + 4.5 referenced consistently. QA-writer's `STEP 0a` is legitimate (subtype dispatch sub-step, not a renumber). |
| 7 | ctaTarget consistency in writer prompts per master brief §8.4 | **DRIFT (critical for procedure + drug)** | **Procedure-writer and drug-writer have NO `ctaTarget` reference at all** in the prompt body. Per master brief §8.4 they MUST default to `"analyzer"` (cost-focused intent). Persona, event, qa, glossary, ma-state all explicitly call out their `ctaTarget` default. |
| 8 | Test article ctaTarget actual values | **DRIFT (procedure + drug have 0 ctaTarget; rest mostly correct)** | (a) **ALL 8 procedure test articles MISSING `ctaTarget` field** (colonoscopy, ct-scan, echocardiogram, knee-mri, mammogram, mri, upper-endoscopy, x-ray = all MISSING). (b) **ALL 8 drug test articles MISSING `ctaTarget` field** (atorvastatin-cost, eliquis-cost, humalog-cost, insulin-cost, januvia-cost, jardiance-cost, metformin-cost, ozempic-cost = all MISSING). (c) Personas (7/7) = `screener` ✓. (d) Events (8/8) = `screener` ✓. (e) Q&A (8 articles): 7 = `screener`, 1 = `analyzer` (`does-medicare-cover-hearing-aids` — defensible per "any page citing $X > $50 = analyzer unless who-qualifies"). (f) Glossary (8 articles): 7 = `screener`, 1 = `analyzer` (`deductible` — defensible per master-brief §8.4 cost-term rule). |
| 9 | Memory entry naming (`feedback_track_c_<template>_writer_shipped.md`) | **PASS** | All 6 expected entries present: procedure, drug, persona, event, qa, glossary. Plus the b1_blog_writer_shipped baseline. |
| 10 | Section structure parity (writer STEP 5=body, STEP 6=gates, STEP 7=atomic save, STEP 8=return JSON) | **PASS** | All 6 writers have STEP 5 (body) → STEP 6 (gates) → STEP 7 (atomic save) → STEP 8 (return JSON). Headings vary in cosmetic word ordering ("CRITICAL PRE-SAVE GATES" vs "PRE-SAVE GATES") but structurally identical. |

**Score:** 6 PASS, 4 DRIFT — of which 1 is critical (dimension 7+8 = ctaTarget gap in procedure/drug), 2 are surgical (dimension 2 QA step renumber + dimension 3 glossary shape), 1 is bookkeeping (dimension 5 strict-count programmatic check pattern not propagated to 4 of 6 writers).

---

## 2. Specific drift examples (PRD × dimension)

### Drift D1 — Procedure-writer + drug-writer (dimension 7+8) — CRITICAL
Procedure-writer.md (671 lines) and drug-writer.md (873 lines) contain ZERO `ctaTarget` references. The procedure schema's TS interface (`procedures.ts`) and `drugs.ts` interface also lack the field today. Result: all 16 test articles (8 procedures + 8 drugs) ship with no `ctaTarget`, defaulting renderer to whatever fallback the route handler uses. Per master brief §8.4: "procedure + drug pages MUST be 'analyzer'" — without writer-prompt enforcement, this is silently broken on all 16 articles already in production. The verifier's GATE F was supposed to flag this, but no procedure/drug verifier currently checks ctaTarget either.

### Drift D2 — Glossary-verifier (dimension 3)
`gates_failed: ["e"]` (flat-string array) at line 433 deviates from all 6 other verifiers, which use `gates_failed: [{"gate": "X", "reason": "..."}]` (object array). Also missing the "Output-shape note (consistency)" lock-down clause that all 6 other verifiers carry verbatim. Risk: if cron parses the `gates_failed` array with `.gate` field access, glossary results crash.

### Drift D3 — QA-verifier (dimension 2)
Last step is `## STEP 5: Return result` instead of `## STEP 6: Return result`. The "Force-flag rule" got merged into STEP 4 (case 1-bis) rather than its own STEP 4. Net effect: same content, off-by-one numbering. Confusing for readers comparing side-by-side with the other 6 verifiers.

### Drift D4 — Procedure / event / qa / glossary writers (dimension 5)
Drug-writer and persona-writer carry the post-PA/MI patch ("STRICT COUNT CHECK: Run `JSON.parse(file).<field>.length`"). The other 4 writers describe count requirements in prose ("≥4 entries", "5-8 items") but lack the programmatic check that catches LLM self-report drift. MA-state baseline has it explicitly on `detailSections.length >= 4`.

---

## 3. Verdict

**CONSISTENT_WITH_MINOR_DRIFT**

Reasoning: 6 of 10 dimensions PASS cleanly. The 4 drift dimensions break down as:
- 1 critical (ctaTarget on procedure/drug — affects revenue funnel routing on 16 live test articles; affects all future bulkgen output);
- 1 cron-parse hazard (glossary `gates_failed` shape) — fixable in ~5 minutes by editing glossary-verifier.md;
- 1 cosmetic step renumber (QA STEP 5 instead of STEP 6) — fixable in ~2 minutes;
- 1 bookkeeping/durability gap (strict-count programmatic check) — desirable but not blocking.

Track D is shippable IF the ctaTarget gap is closed before scaling. The system is fundamentally coherent — 6 of 6 writers obey the same STEP 0-8 contract, 7 of 7 verifiers route GATE D as auto-fix not HOLD, all 12 files use the same status enum, and all 6 memory entries were filed. No session invented a competing architecture. The drift is surgical, not structural.

---

## 4. Top 5 cross-cutting fixes

1. **Add `ctaTarget` enforcement to procedure-writer.md and drug-writer.md.** Add to STEP 4 checklist: `[ ] ctaTarget = "analyzer"` (with a sentence: "Procedure + drug pages are cost-focused; users with billing intent route to analyzer per master brief §8.4"). Add to NEVERs: "NEVER set ctaTarget to 'screener' — cost-focused pages route to analyzer." Add to STEP 8 return JSON example. Add to procedure-verifier + drug-verifier as a Category F check (warn LOW if wrong, never HOLD).

2. **Backfill `ctaTarget: "analyzer"` to all 16 existing procedure + drug test articles.** Add the field directly via narrow JSON edits. This is a 10-minute mechanical sweep — `node -e` with `JSON.parse` + `JSON.stringify` per file. Confirm the route handler reads ctaTarget (it should already; if not, that's a separate Track A1 schema issue).

3. **Fix glossary-verifier.md `gates_failed` shape to match the other 6.** Change `gates_failed: ["e"]` examples to `gates_failed: [{"gate": "e", "reason": "..."}]` and add the missing "Output-shape note (consistency)" lock-down clause. Mirror the wording from ma-state-verifier line 314.

4. **Renumber QA-verifier's last step from `STEP 5` to `STEP 6`** and promote "Force-flag rule" back into its own `## STEP 4`. Pure cosmetic; aligns reading parity across the 7 verifiers.

5. **Propagate the strict-count programmatic check** to procedure-writer, event-writer, qa-writer, and glossary-writer. Pick the highest-risk count requirement per template and add an explicit `JSON.parse(file).<field>.length` block (procedure: `detailSections.length`, event: `urgency.steps.length`, qa: `coverageBreakdown.rows.length` or equivalent, glossary: `detailSections.length <= 1`).

---

## 5. Most divergent session

**Glossary** is the most divergent of the 6 — it carries two of the four drift findings (D2 `gates_failed` shape + missing output-shape lock-down clause) and is the only template where the verifier's return JSON could break cron parsing. The glossary session also has structural differences justified by §4.5 (≤500-word cap, ≤1 detailSection, dropped introParagraphs), so some divergence is intended. But the JSON-shape and lock-down-clause gaps are pure oversight, not template-justified. Worth a focused ~15-minute rework pass on `coveredusa-glossary-verifier.md` before Track D ships.

**Runner-up: procedure-writer + drug-writer** (tied) for the ctaTarget oversight. Not structural drift — both followed the §4.1 / §4.2 recipes faithfully and emitted all required GFE/NSA / IRA / GoodRx blocks. The ctaTarget gap is a master-brief §8.4 alignment miss that propagated through both sessions identically. Suggests the §8.4 dual-funnel rule was added to the master brief AFTER those two sessions started — a process learning, not a session quality issue.

---

## 6. What's working well

- 7 of 7 verifiers correctly hoisted GATE D auto-fix above Category J informational (the post-Ohio MA-state load-test patch). This is the most-tracked patch from the load test and it propagated cleanly.
- All 6 writers consistently flag the keyTerms `{en, es}` object shape (not flat array) — the second-most-tracked patch from the MI/OH load test.
- Status enum (`approved` / `corrected` / `flagged` / `held` / `error`) is identical across all 7 verifiers.
- `gates: {a: ..., h: ...}` lowercase single-letter keys is identical across all 7 verifiers (no `GATE_A`, no `gate_results`, no verbose strings).
- All 6 writers use `$HOME/clawd/...` paths (not hardcoded `/Users/frankthebot/` or `/Users/jacobposner/`) — host-portable.
- All 6 memory entries filed (`feedback_track_c_<template>_writer_shipped.md`).
- All 6 writers reference 2026 anchor facts: Part B deductible $283, Part D OOP cap $2,100, Part A deductible $1,736, IRA signed 2022, MA MOOP $9,250, insulin cap $35.

---

*End audit. Total agent file lines audited: ~6,000 (excluding `.bak.md` legacy files). Total time: single-session.*
