# Track C-prime Cross-PRD Consistency Verification

**Date:** 2026-05-14
**Auditor:** Frank (Claude Opus 4.7, 1M context)
**Docs verified:** 7 total (master brief v1.3 + 6 template PRDs)

Scope of verification: vocabulary, section numbering, JSON return shape, phase numbering, 3 mandatory patches, 4-commit deliverable, memory entry naming, reference implementations.

---

## 1. Universal vocabulary — PASS (with one minor drift)

### "GATE A / B / C / D" definitions — PASS

Every PRD defines the four universal GATES with consistent semantics:
- GATE A = slug must not contain a year (universal, HOLD on fail)
- GATE B = household-size 9-row table (conditional per template — N/A or HOLD)
- GATE C = ≥3 inline outbound .gov/.edu/kff.org citations (HOLD on 0-1, WARN on 2)
- GATE D = zero `--`, AUTO-FIX as style correction, never HOLD

All 6 PRDs use the same gate IDs and the same routing semantics for A/B/C/D. Master brief §7 matches.

### "PASS / WARN / FAIL / HOLD" routing — PASS

All PRDs follow the master brief §7 routing schema:
- HOLD = HIGH structural failure
- WARN = ship-with-flag (numeric/ambiguous)
- AUTO-FIX = surgical edit + ship
- N/A = gate doesn't apply for this template/subtype

Drug §6, Event §6, Glossary §6, Persona §6, Procedure §6, Q&A §6 all use identical routing language.

### "approved / corrected / flagged / held / error" status — PASS

Master brief §6 enumerates the 5 status strings. None of the 6 PRDs redefine them — they reference the master brief verbatim ("all `approved` or `corrected`" in Phase 4.5 verifier-test sections of every PRD).

### "auto-fix vs detect-only" distinction — PASS

All 6 PRDs frame the verifier as dual-purpose: numeric auto-fix + structural detect-only. Master brief §3 Phase 4.5 defines this; every PRD §9 explicitly copies the framing.

### "default toward auto-ship" — PASS

All 6 PRDs reference `~95% / ~4% / ~1%` distribution in their §12 quick-reference cards. Master brief §3.5 + §6 define it. Consistent.

### "Track C-prime" — PASS

All 6 PRDs use "Track C-prime" consistently (6-7 mentions each).

### "the 4 universal GATES" — PASS

All 6 PRDs reference "all 4 universal" in §9 verifier scope. None of them say "5 universal" or "8 universal" by mistake.

### Minor vocabulary drift — Q&A uses "subtype" alongside "pageType"

Q&A PRD introduces `subtype` as a new top-level field (not in master brief) and notes it must be consistent with `pageType`. This is template-specific architecture (not a vocab drift) and is well-documented in §3.5. Not a contradiction; just unique to Q&A.

---

## 2. Section-numbering consistency — PASS

All 6 PRDs use the 12-section structure (§0 through §12) per the README:
- Procedure: §0 → §12 ✓
- Drug: §0 → §12 ✓
- Persona: §0 → §12 ✓
- Event: §0 → §12 ✓
- Q&A: §0 → §12 + §3.5 Subtype Dispatch ✓ (as expected — the architectural mechanic)
- Glossary: §0, §0.1, §0.2, then §1 → §12 ✓ (the §0.1 and §0.2 are sub-sections explicit to the DOWNSCOPE prohibition and read-order; not a drift — extension)

All PRDs use §1/§2/§3... numbering (no §A/§B/§C drift).

Q&A's §3.5 is the only architectural addition; README explicitly notes "Q&A PRD adds §3.5 Subtype Dispatch".

Glossary's §0.1 + §0.2 split is a slight schema departure but consistent with the README's prediction that the work shape differs. The README does not enumerate §0.1/§0.2 explicitly. **Minor drift:** Glossary uses §0 / §0.1 / §0.2 / §1; the other 5 PRDs use §0 / §1 / §2. The Glossary structure is reasonable but the README should be updated to acknowledge it OR Glossary should fold §0.1 + §0.2 into §0.

---

## 3. JSON return shape — DRIFT FOUND (1 case)

### Top-level fields prescribed in §2 hard contracts — DRIFT

The master brief §3 Phase 4.5 says "Update **STEP 6** return JSON to include `gates: {a, b, c, d, ...}` object + new `held` status." But master brief line 148 says **STEP 8 = return JSON**.

Master brief is internally inconsistent: lines 146-148 list STEP 6 = self-validation, STEP 7 = save, STEP 8 = return JSON; but line 256 calls "STEP 6 return JSON".

Per-PRD §2 hard contracts inherit this drift:
- **Procedure §2.1:** "JSON return shape from **STEP 8** must be `{slug, status, ...}`" ✓ (matches master brief line 148)
- **Persona §2.1:** "JSON return shape from **STEP 8**" ✓
- **Q&A §2.1:** "JSON return shape from **STEP 8**" ✓
- **Drug §2.1:** "JSON return shape from **STEP 5**" ✗ DRIFT
- **Event §2.1:** "JSON return shape from **STEP 5**" ✗ DRIFT
- **Glossary §2.1:** "JSON return shape from **STEP 5**" ✗ DRIFT

**3 of 6 PRDs cite the wrong STEP number for return JSON.** This is a clear cross-PRD drift. Fresh agents reading drug/event/glossary will look for return JSON at STEP 5 (which the master brief defines as "write body"), then be confused.

### Detailed gates object shape — IMPLICIT

The user's prompt expected a fully-spelled return JSON: `{slug, status, claims_checked, claims_corrected, claims_flagged, change_log, gates, gates_failed}`. None of the 6 PRDs prescribe this full shape explicitly in their §2 hard contracts. They reference `{slug, status, ...}` and individually reference `gates.b: "n/a"`, `gates.h: "n/a"`, `gates.d: "WARN"` in routing sections. Master brief line 256 specifies `gates: {a, b, c, d, ...}` (only 4 letters explicit, with ellipsis).

**Drift severity:** medium. The full JSON return shape is documented implicitly via the reference implementations (`coveredusa-ma-state-verifier.md`) rather than spelled out in any PRD. Fresh agents reading the PRDs alone wouldn't know the exact shape — they'd have to read the reference verifier file. This is by design (PRDs say "copy from `coveredusa-ma-state-verifier.md`"), but the master brief could surface the canonical shape explicitly.

### `gates` object values — IMPLICIT

User asked: do PRDs prescribe values from `"pass" | "fail" | "warn" | "n/a" | "auto-fixed"`? Answer: implicitly yes. Glossary §6 explicit `gates.b: "n/a"` lower-case. Drug §6 explicit `gates.h: "n/a"` lower-case. Event §6 references `gates.d: "WARN"` UPPER-CASE. **Minor casing drift:** event-prd uses `"WARN"` upper-case; the others use `"n/a"` lower-case. Probably fine at runtime but inconsistent.

---

## 4. Phase numbering — PASS (with master-brief-internal drift)

Master brief has explicit phases: Phase 1 (Inventory), Phase 2 (Draft), Phase 3 (3-verifier review), **Phase 3.5 (Default-toward-ship preference)**, Phase 4 (Manual test cycle), **Phase 4.5 (Verifier update)**, Phase 5 (Activation + commit).

All 6 PRDs consistently:
- Reference Phase 4.5 in §9 title ("Verifier scope (Phase 4.5 — per master brief)") ✓
- Reference Phase 5 in §10 title ("Atomic deliverable (Phase 5 — 4 commits)") ✓
- Don't invent "Phase 6" or "Step 4.5" — clean.

**Minor master-brief-internal drift (not PRD-side):** master brief calls it "Phase 3.5" at line 221 ("Phase 3.5 — Default-toward-ship preference") AND "Phase 4.5" at line 239. The user's prompt asked about Phase 4.5 (verifier update), which all PRDs reference consistently. The master brief's Phase 3.5 sub-section appears between Phase 4 and Phase 4.5 in document order, which is confusing — but no PRD inherits this confusion. PRDs consistently use Phase 4.5 for verifier update.

---

## 5. The 3 mandatory patches — PASS

All 6 PRDs §9 list all 3 patches:
1. GATE F count strictness (writer side)
2. `keyTerms` shape `{en: [...], es: [...]}` (writer side)
3. GATE D auto-fix hoist with "AUTO-FIX MANDATORY" framing (verifier side)

PRDs apply identical bullet-point framing for the patches. Each PRD names the Ohio MA-state failure mode for GATE D (Event PRD additionally names the T26 em-dash leak — a useful addition, not a drift).

**One minor inconsistency:** Glossary §9.3 lists only 2 of the 3 patches by name (skips GATE F count strictness explicitly, but covers it via its own "GATE E mechanical strictness" patch — equivalent in spirit but renamed). Not a fatal drift; Glossary's GATE E word-count check IS the count strictness for glossary, just under a different name.

---

## 6. The 4-commit deliverable — PASS

All 6 PRDs §10 list 4 commits in identical order:
1. Commit 1 (clawd-workspace): `.bak` move + new writer prompt
2. Commit 2 (covered-usa): 5 test articles + verifier-caught corrections
3. Commit 3 (covered-usa): Requirements matrix + 3 verifier reports + retest verifier output
4. Commit 4 (clawd-workspace): `.bak` move + new verifier prompt

All 6 PRDs use identical wording verbatim. Q&A PRD adds an optional schema extension to Commit 2 (`src/lib/qa.ts` if path 1 chosen) — that's a template-specific addition, not a drift.

---

## 7. Memory entry naming — PASS

All 6 PRDs prescribe:
- `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_track_c_<template>_writer_shipped.md`

Confirmed substitutions:
- Drug: `feedback_track_c_drug_writer_shipped.md` ✓
- Event: `feedback_track_c_event_writer_shipped.md` ✓
- Glossary: `feedback_track_c_glossary_writer_shipped.md` ✓
- Persona: `feedback_track_c_persona_writer_shipped.md` ✓
- Procedure: `feedback_track_c_procedure_writer_shipped.md` ✓
- Q&A: `feedback_track_c_qa_writer_shipped.md` ✓

Naming is uniform.

---

## 8. Reference implementations — PASS

All 6 PRDs §0 read-order reference the same trio (with identical bullet structure):
- `.claude/agents/coveredusa-ma-state-writer.md`
- `.claude/agents/coveredusa-ma-state-verifier.md`
- `.claude/agents/coveredusa-article-verifier.md`

**Drug PRD adds a fourth:** `coveredusa-procedure-writer.md` ("sister template; same Part B / Medicare logic shape"). This is template-specific helpful — not a drift but an enhancement.

**Persona PRD adds a fifth:** §0 lists `procedure-prd.md` as "Sibling PRD for cross-reference" (the structural template). Useful cross-link.

README §"Reference implementations" lists 4 agent files including `coveredusa-article-writer.md` (B1 daily blog writer) — but the PRDs themselves don't list `coveredusa-article-writer.md` as a reference. **Minor drift:** README mentions article-writer but PRDs don't pull it in. Probably fine because the article-writer's pattern is captured by ma-state-writer + verifier. The README discrepancy doesn't propagate to action items.

---

## Drift summary table

| Dimension | Status | Drift count |
|---|---|---|
| 1. Universal vocabulary | PASS | 0 critical |
| 2. Section numbering | PASS (minor) | 1 (Glossary §0.1/§0.2 split) |
| 3. JSON return shape — STEP # | **DRIFT** | 3 (drug/event/glossary cite STEP 5; should be STEP 8) |
| 3. JSON return shape — full schema | IMPLICIT | 0 explicit, but full shape not spelled out in any PRD |
| 3. `gates` object case | DRIFT | 1 (event uses `"WARN"` upper-case; others lower-case) |
| 4. Phase numbering | PASS | 0 (master brief has Phase 3.5 anomaly but PRDs ignore) |
| 5. 3 mandatory patches | PASS | 0 (Glossary renames patch 1 to "GATE E mechanical strictness" — equivalent) |
| 6. 4-commit deliverable | PASS | 0 |
| 7. Memory entry naming | PASS | 0 |
| 8. Reference implementations | PASS | 0 (Drug/Persona add helpful cross-refs) |

**Total drift cases:** 4 (1 critical, 3 minor)

---

## Verdict on coherence as a system

**The 6 PRDs + master brief form a coherent system.** A fresh parallel agent reading the master brief + their assigned PRD will execute the 4-phase pattern correctly and produce a writer + verifier that fits the Track C-prime mold.

The vocabulary is uniform on the high-impact dimensions (GATE IDs, status names, routing semantics, 3 patches, 4 commits, memory naming). The one **critical drift** — STEP 5 vs STEP 8 for return JSON — is recoverable because the master brief at lines 140-148 spells out the correct sequence (STEP 5 = write body, STEP 8 = return JSON). Fresh agents who read both will catch the inconsistency and default to the master brief.

Lower-impact drifts (Glossary section sub-numbering, event WARN case, README reference-implementations list) won't confuse agents — they're cosmetic.

---

## Top 5 cross-cutting fixes (ranked by impact)

1. **Fix STEP 5 → STEP 8 in drug/event/glossary §2 hard contracts** (HIGHEST priority). The return JSON lives at STEP 8 per master brief lines 146-148. Three PRDs say STEP 5 — this is internally contradictory and will confuse fresh agents. One-line edit per PRD.
2. **Spell out the full return JSON shape in the master brief** (HIGH). Currently only `gates: {a, b, c, d, ...}` + `held` status. The user's expected canonical schema (`{slug, status, claims_checked, claims_corrected, claims_flagged, change_log, gates, gates_failed}`) isn't in any PRD. Add a canonical example near master brief §7 or in a new §11 "Verifier return JSON canonical shape".
3. **Resolve master brief's Phase 3.5 vs Phase 4.5 mid-document anomaly** (MEDIUM). Master brief line 221 introduces "Phase 3.5" after Phase 4 has been introduced. Either renumber to keep linear order (1, 2, 3, 4, 4.5, 5) or move Phase 3.5 content (default-toward-ship) under Phase 4 as a §preamble. Otherwise readers may flip past it expecting it to come before Phase 4.
4. **Normalize gates-object value casing across PRDs** (LOW). Event uses `"WARN"` upper-case; others use `"n/a"` / `"pass"` lower-case. Pick one (probably lower-case, matching JSON convention) and align all PRDs.
5. **Update README to acknowledge Glossary's §0.1 / §0.2 sub-numbering** OR fold them back into §0 (LOW). Currently README §"What every PRD contains" promises "§0 Read order" only. Glossary departs harmlessly but the README claim is technically wrong.

---

## Final report (~400 words for caller summary)

**Dimensions passed cleanly (5 of 8):** universal vocabulary, phase numbering, 3 mandatory patches, 4-commit deliverable, memory entry naming. All 6 PRDs use identical gate IDs (A-I plus subtype-specific suffixes for Q&A), identical status names (approved/corrected/flagged/held/error inherited from master brief §6), identical routing semantics (HOLD on HIGH structural failure, AUTO-FIX on GATE D, ship+flag on numeric/style ambiguity), and identical 4-commit ship pattern.

**Dimensions with drift (3 of 8):** section numbering (Glossary's §0.1/§0.2 sub-split), JSON return shape (3 PRDs cite STEP 5 instead of STEP 8), reference implementations (Drug + Persona add legitimate cross-refs not in others — enhancement, not drift). Plus one minor casing drift on `gates` object values (Event upper-case, others lower-case).

**Per-dimension drift count:** Vocabulary 0 / Section numbering 1 / JSON return shape 4 (3 STEP-# + 1 casing) / Phase numbering 0 / 3 patches 0 / 4 commits 0 / Memory naming 0 / Reference implementations 1 (Drug/Persona enhancements, README mismatch).

**Specific cases:**
- Drug PRD §2 hard contract #1: "JSON return shape from STEP 5" — should be STEP 8
- Event PRD §2 hard contract #1: "JSON return shape from STEP 5" — should be STEP 8
- Glossary PRD §2 hard contract #1: "JSON return shape from STEP 5" — should be STEP 8
- Event PRD line 217: `gates.d: "WARN"` upper-case — others use lower-case `"n/a"`
- Glossary uses §0, §0.1, §0.2 splits; other 5 use single §0; README doesn't acknowledge

**Verdict: COHERENT SYSTEM.** The 6 PRDs + master brief work as an integrated brief for fresh parallel agents. The critical STEP 5 vs STEP 8 drift is recoverable (master brief spells the correct sequence at lines 140-148; agents who read both catch it). Other drifts are cosmetic. No PRD contradicts another on routing, patches, or deliverables. Vocabulary is identical on every high-impact dimension — gate IDs, status names, patch names, default-toward-ship percentages, memory paths.

**Top 5 cross-cutting fixes:** (1) STEP 5 → STEP 8 in drug/event/glossary §2; (2) spell out full return JSON canonical shape in master brief; (3) resolve master brief Phase 3.5 vs 4.5 numbering anomaly; (4) normalize `gates` value casing to lower-case; (5) update README §"What every PRD contains" to acknowledge Glossary's §0.1/§0.2 sub-numbering OR fold those back into §0.

System is shippable to parallel sessions as-is. The STEP # fix would tighten it.
