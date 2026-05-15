# Phase 3 Verifier A — coveredusa-ma-state-writer Rewrite

**Date:** 2026-05-14
**Verifier:** A (independent review of new writer draft against requirements matrix)
**Inputs:** `coveredusa-ma-state-writer.md` (new draft), `c-ma-state-requirements-matrix.md` (78 REQs), `_universal-rules-block.md`, `FANOUT_FORMULA.md` §3 + §4.8

---

## Summary scores (78 total REQs)

- **PASS: 56**
- **PARTIAL: 17**
- **FAIL: 5**

---

## Verdict

**NOT PHASE-4-READY.** One more iteration required. The writer has the spine right (8 GATES, atomic write, 2026 anchors, Kaiser geography, pronoun discipline, $0 premium + how-to-enroll required) but has 5 hard FAILs that will cascade into Phase 4 failures. The most damaging gap is silent omission of the cron-pipeline integration fields (`topicCluster`, `keyTerms`, `gapsFlagged`, `isLighthouse`, `isDeprecated`) in STEP 8 — without these, Track C's link-index integration is decoupled and the bulkgen cron has no signal that this writer was even formula-aware.

---

## Resolved-conflicts audit (formula-wins direction confirmed)

| # | Conflict | Direction | Status |
|---|---|---|---|
| C1 | how-to-enroll universality | required (GATE E + REQ-003 sub-fields enumerated, line 357–366) | PASS |
| C2 | state-context coverage | extended to importantDates.intro + source captions + detailSection openers (GATE H, line 397–407) | PASS |
| C3 | $0 premium framing | required detailSection with table (GATE F, line 368–376) | PASS |
| C4 | pronoun discipline as GATE | codified as STEP 6 GATE G with worked examples (line 378–395) | PASS |
| C5 | FAQ length tightened to 8 | "8 total preferred" + checklist says "8 Q&A pairs" (line 144 + line 216) | PASS |
| C6 | word-count expanded for new sections | writer still states "1,800–2,500 words" / "9–10 min read" (line 183, 422). Matrix REQ-034 says 2,200–2,800 / 11–14 min | **PARTIAL** |
| C7 | path portability `$HOME/clawd/...` | applied throughout (STEP 0 line 37, all subsequent paths) | PASS |
| C8 | JSON return shape additive | preserved old fields; **did NOT add `topicCluster`, `keyTerms`, `gapsFlagged`** (line 475) | **FAIL** |

---

## Top 5 fixes needed before Phase 4

### Fix 1 (BLOCKER) — STEP 8 JSON return shape missing additive fields (REQ-035 + REQ-054 + REQ-066)
Writer line 475 emits `{slug, status, word_count, total_plans, top_carrier_count, faq_count, has_county_variance, has_state_extras, has_how_to_enroll, has_zero_premium_plans, detail_section_count}`. Matrix requires additive `topicCluster`, `keyTerms`, `gapsFlagged`, plus emitting `topicCluster`/`keyTerms`/`isLighthouse`/`isDeprecated` in the JSON output itself (REQ-054 line 458–467). Cron pipeline + link-index builder both depend on these. Add to STEP 5 field checklist + STEP 8 return shape.

### Fix 2 (BLOCKER) — link-index.json consumption never mentioned (REQ-049, REQ-050, REQ-051, REQ-052, REQ-053)
Writer STEP 0 (line 43–50) does not load `$HOME/clawd/projects/covered-usa/content/link-index.json`. STEP 5 has no instruction to emit 3–5 inline body links via byPhrase lookup. No self-link guard. No "no links in headings" rule. Five REQs all fail. Add a STEP 0.5 "load link-index" + STEP 5 inline-linking subsection.

### Fix 3 (HIGH) — REQ-002 D-SNP household-size table conditional GATE B not handled
Writer GATE B (line 330–332) flatly says "Skip. N/A for MA-state." Matrix REQ-002 says: when D-SNP / dual-eligible content is present, emit a 9-row MSP/Medicaid income table with year-tagged caption. Current GATE B is a hard skip; should be conditional ("skip unless D-SNP block is present in detailSections; if present, require 9-row table"). Otherwise we drop the audit-flagged dual-eligible coverage.

### Fix 4 (HIGH) — Paragraph length rules missing (REQ-022)
Writer never specifies 150–300 words for body paragraphs or 80–150 for FAQ answers. Matrix flags this as a universal CRITICAL gap (8/8 templates affected per CURRENT_STATE_AUDIT). Add to STEP 5 style rules + STEP 6 26-check.

### Fix 5 (MEDIUM) — REQ-029 markdown bold guidance is ABSENT (correctly handled by omission, but flagged conflict needs explicit acknowledgment)
The writer correctly does NOT instruct embedding `**bold**` markers anywhere — this matches the safe default given the current renderer outputs plain `<p>{text}</p>`. **This is the right call** for the renderer state. However, REQ-029 is the matrix's only "flagged for human" item (Conflict 9). The writer should explicitly state in STEP 5 something like "do NOT embed markdown bold markers in JSON paragraph fields — current renderer emits plain `<p>{text}</p>`; reintroduce when Track A1 markdown converter ships." Without that note, the next agent maintaining this prompt may "fix" the omission and break production.

---

## Internal contradictions / STEP-mapping errors

- **None critical found.** STEP 6 GATEs A–H map cleanly to Categories 1–3. The 26-check field-level validation correctly references STEPs 4–5 fields. No rule contradicts itself across STEPs.
- **Minor:** Line 184 says "9 min read or 10 min read"; line 422 (#8 in 26-check) repeats. With REQ-034 expansion to 11–14 min, both should update.

## Source-doc references — all exist
Verified: `_universal-rules-block.md`, `FANOUT_FORMULA.md`, `medicare-advantage.ts`, `california.json`, `_queue.json`. All referenced paths resolve under `$HOME/clawd/`.

## REQ-029 (markdown bold) — handled correctly
Writer does NOT instruct embedding `**bold**` markers. This is the safe default per the renderer's current `<p>{text}</p>` output. Confirmed correct, but recommend explicit "do NOT embed" note for future maintainers (see Fix 5).

---

## PARTIAL/FAIL detail (selected — full table available on request)

| REQ | Status | Matrix line | Writer line | Note |
|---|---|---|---|---|
| REQ-002 | FAIL | 41–43 | 330–332 | GATE B unconditionally skips; should be conditional on D-SNP block presence |
| REQ-005 | PARTIAL | 67 | 160, 334 | Inline anchoring described in §C universal rules but no STEP 6 hard count of inline `.gov` markdown links |
| REQ-019 | PARTIAL | 184–186 | 152 | SNP FAQ in suggested topic list but not enforced as required |
| REQ-022 | FAIL | 210 | absent | 150–300 / 80–150 paragraph-length rule missing entirely |
| REQ-029 | PASS (correct omission) | 259–260 | absent | Correctly does not embed markdown bold; add explicit note |
| REQ-034 | PARTIAL | 304 | 183, 422 | Word/reading-time still 1,800–2,500 / 9–10 min; should be 2,200–2,800 / 11–14 min |
| REQ-035 | FAIL | 314–315 | 475 | Missing `topicCluster`, `keyTerms`, `gapsFlagged` |
| REQ-049 | FAIL | 426 | absent | link-index.json never loaded |
| REQ-050 | FAIL | 433 | absent | 3–5 inline body links via byPhrase never mentioned |
| REQ-054 | FAIL | 461–466 | absent | `topicCluster`/`keyTerms`/`isLighthouse`/`isDeprecated` not emitted in JSON output |
| REQ-058 | PARTIAL | 497 | 296 | "by [dim]" caption phrasing mentioned once; matrix wants ≥3 hard count |
| REQ-066–068 | PARTIAL | 561, 568, 575 | 27–29 | Inputs accepted but never explicitly consumed downstream |

---

## Recommendation

Iterate once. Fixes 1–4 are mechanical (add 2 STEPs, expand return shape, add length rules, soften GATE B). Fix 5 is a one-line note. Re-verify against matrix after revision; should land 70+/78 PASS and clear Phase 4.
