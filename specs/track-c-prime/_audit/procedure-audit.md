# Track C-prime Procedure Audit

**Date:** 2026-05-15
**Auditor:** parallel audit session
**Scope:** writer prompt + verifier prompt + 5 Phase-4 test articles + analysis artifacts
**Verdict:** **SHIP_WITH_PATCHES**

---

## Headline

The prompts themselves are world-class (writer 6,500 words, verifier 7,500 words, both fully aligned to PRD §1-12). All 5 test articles ship through the strict validator with 0 bad files and 0 em-dashes / double-hyphens. Memory entry written. Bak files preserved.

But: the writer **execution** (not the prompt) drifted on schema for 4 of 5 articles. The Phase 4 results doc candidly documents this. And there are 3 spec-vs-shipped gaps the parent session should be aware of before Track D starts.

---

## Per-check results

| # | Check | Result | Notes |
|---|---|---|---|
| 1 | Writer prompt structure (identity, INPUTS, STEP 0–8, BOUNDARIES, $HOME paths) | **PASS** | Path-portable everywhere (`$HOME/clawd/...`); STEP 0–8 numbered; CRITICAL BOUNDARIES has 14 NEVERs; no `/Users/frankthebot/` or `/Users/jacobposner/` hardcoding. |
| 2 | Writer GATES at STEP 6 (4 universal A/B/C/D + 4 procedure E/F/G/H, "STOP. Read this twice." framing) | **PASS** | All 8 GATES present with correct routing. STEP 6 opens with "STOP. Read this twice." Universal GATE D `--` ban explicitly cited. Procedure GATE E has 6 sub-checks (most rigorous); F has 4; G has 9 vocab terms; H comparison table by procedure. |
| 3 | Verifier dual-purpose (STEP 1C structural gates, GATE D AUTO-FIX MANDATORY, `held` status) | **PASS** | STEP 1C present with all 8 gates. GATE D framed as "AUTO-FIX MANDATORY" and explicitly calls out the Ohio MA-state Category J failure mode. `held` status defined and routed to "regenerate via writer" recommendation. |
| 4 | Test articles structural (GFE/NSA, self-pay H2, ≥3 .gov, no `--`, keyTerms `{en,es}` shape) | **PARTIAL** | All 5 have GFE content (4–8 mentions each), all 5 have NSA content (3–11 mentions), all 5 have ≥3 .gov citations, all 5 are 0 dashes, all 5 have `keyTerms: {en, es}` object shape. **But** 4 of 5 have non-conforming `goodFaithEstimate` and `selfPayPrograms` sub-field shapes (see Issue #1). |
| 5 | Test articles numeric (2026 anchor facts) | **PARTIAL** | Part B deductible $283 + year 2026 + 20% coinsurance: all 5 PASS. Part B premium $202.90: only upper-endoscopy mentions. Part A inpatient $1,736: 0 of 5 mention. (Both are optional context, not violations, but worth noting.) |
| 6 | `ctaTarget: "analyzer"` per PRD §2 | **FAIL** | All 5 articles have `ctaTarget: undefined`. The field is missing from both prompts AND missing from the `Procedure` TypeScript interface in `src/lib/procedures.ts`. The `/cost/[procedure]/page.tsx` route hardcodes `AnalyzerCTA` regardless, so this is **functionally non-breaking** but is a real spec/prompt/schema divergence. |
| 7 | Validator passes | **PASS** | `node scripts/validate-procedures.js` → 5/5 new files pass strict mode, 0 bad files, 0 content-quality warnings on all 5 new pages. (The 3 pre-existing `mri.json`, `ct-scan.json` show 10 warnings each but that's a Track E known follow-up.) |
| 8 | Analysis files (requirements matrix, 3 verifier reviews, Phase 4 results, memory entry) | **PARTIAL** | Requirements matrix PRESENT (71 reqs, 7 conflicts resolved). Phase 4 results PRESENT (per-article scorecard + lessons learned + 5-line summary). Memory entry PRESENT (`feedback_track_c_procedure_writer_shipped.md`, fully populated). **MISSING:** the 3 verifier review files `c-procedure-verifier-{a,b,c}.md` that other Track C-prime templates have. Every other Track C-prime template (drug, event, glossary, ma-state, persona) has 3 verifier review files; procedure does not. |
| 9 | Hard contracts (STEP 8 JSON parseable, atomic write, `## STEP N` headings) | **PASS** | STEP 8 return shape is a single-line JSON, parseable. Atomic write pattern (`<slug>.tmp.json` → rename) documented at STEP 1 and STEP 7. All STEP headings use `## STEP N` form. |
| 10 | Backup files (`.bak.md` for both writer and verifier) | **PASS** | Both `.bak.md` files exist at `~/clawd/.claude/agents/coveredusa-procedure-{writer,verifier}.bak.md`. |

**Tally:** 6 PASS / 3 PARTIAL / 1 FAIL.

---

## Top 3 issues found

### Issue #1 — `goodFaithEstimate` and `selfPayPrograms` sub-field schema drift in 4 of 5 articles (writer-execution bug, not prompt bug)

The writer **prompt** prescribes exact sub-field names:
- `goodFaithEstimate` should have `{numberedSteps, govStartingUrl, documentsToBring, commonReasonsQuoteChanges, deadline}` (5 keys)
- `selfPayPrograms` should have `{dedicatedSection, programTypes, typicalDiscountRange, howToAsk}` (4 keys)

The shipped articles have:

| Slug | goodFaithEstimate keys | selfPayPrograms keys |
|---|---|---|
| x-ray | numberedSteps, govStartingUrl, documentsToBring, commonReasonsQuoteChanges, deadline (5/5 OK) | dedicatedSection, programTypes, typicalDiscountRange, howToAsk (4/4 OK) |
| knee-mri | applicability, disputeThreshold, howToRequest (3, all non-conforming) | overview, strategies (2, both non-conforming) |
| echocardiogram | required, thresholdDollars, disputeWindowDays, advanceNoticeDays, noteEn, noteEs (6, all non-conforming) | noteEn, noteEs (2, both non-conforming) |
| mammogram | applicability, howToRequest, protectionAmount, protectionWindowDays, regulationUrl (5, all non-conforming) | intro, programs (2, both non-conforming) |
| upper-endoscopy | required, triggerDays, thresholdUSD, disputeWindowDays, note (5, all non-conforming) | available, note (2, both non-conforming) |

Only **x-ray** ships with the exact prompt-prescribed shape. The Phase 4 results doc explicitly identifies this as the "schema-drift on additive fields (mammogram pattern)" lesson, and the memory file lists "Verifier-side additive-field schema enforcement" as a candidate master-brief upgrade. The verifier prompt's GATE E sub-check #5 currently only validates field PRESENCE, not sub-field-name conformance, so the drift slipped through.

Impact today: the additive fields aren't yet rendered by the page template (Track E does that), so content displays correctly via prose embedding in `medicareSection.paragraphs` and `factorsAffectingCost.items`. But when Track E ships, 4 of 5 procedures will need to be re-emitted because their data-shape won't match the template's expected reads.

**Patch:** strengthen verifier GATE E sub-check #5 to validate exact sub-field key names against the prescribed contract before Track D.

### Issue #2 — `ctaTarget` field entirely missing from prompts, schema, and all 5 procedure JSONs

PRD §2 explicitly lists `ctaTarget: "screener" | "analyzer"` as a required top-level field, defaulting to `"analyzer"` for procedure-cost. The PRD even cites a heuristic ("any page citing a dollar amount > $50 MUST use ctaTarget: analyzer unless the question is fundamentally who-qualifies").

Reality check:
- Writer prompt: 0 mentions of `ctaTarget`
- Verifier prompt: 0 mentions of `ctaTarget`
- `src/lib/procedures.ts` `Procedure` interface: field absent
- All 5 new JSONs: `ctaTarget` undefined
- All 3 pre-existing JSONs: `ctaTarget` undefined
- `/cost/[procedure]/page.tsx`: hardcodes `AnalyzerCTA` regardless

Other templates (glossary, qa, event, persona, medicare-advantage) all declare and consume `ctaTarget` in both their schema and their page route. Procedure is the outlier — the page hardcodes the analyzer choice instead of reading from data.

This is **non-breaking** but it's a real spec violation. It means dual-funnel monetization (the master brief §8.4 logic) can't override per-page for procedures — every procedure forces the analyzer CTA regardless of intent. For now that's fine (procedure pages always cite dollar amounts → analyzer is correct), but if Track A1 introduces procedure pages with screener-friendly intent, the system has no toggle.

**Patch options:** (a) add `ctaTarget: 'screener' | 'analyzer'` to the `Procedure` interface + writer prompt + verifier prompt + all 8 procedure JSONs, then update `/cost/[procedure]/page.tsx` to read it; or (b) explicitly note in the PRD that procedure ctaTarget is locked-analyzer and the field is intentionally omitted from this template.

### Issue #3 — Missing `c-procedure-verifier-{a,b,c}.md` 3-verifier review files

PRD §10 Phase 5 commit 3 deliverable: "Requirements matrix + 3 verifier reports + retest verifier output in `content/fanout/analysis/c-procedure-*.md`."

What was shipped:
- `c-procedure-requirements-matrix.md` ✓
- `c-procedure-phase4-results.md` ✓
- (no `c-procedure-verifier-a.md`)
- (no `c-procedure-verifier-b.md`)
- (no `c-procedure-verifier-c.md`)

Every other Track C-prime template (drug, event, glossary, ma-state, persona) has all 3 verifier review files; procedure has 0. The Phase 4 results file partially substitutes by including per-article verifier outputs in a table, but it's not the same artifact — the per-verifier reviews are independent critiques of the verifier prompt itself, not of test-article output.

**Patch:** spawn the 3 verifier reviewers retroactively (or skip if Track C-prime is fully shipped and accepted) before Track D.

---

## Specific drift examples in test articles

**Numeric (from Phase 4 results doc):**
- Mammogram `hcpcsCodes: [G0202]` — CMS deleted G0202 Jan 1, 2018. Verifier caught; manually removed by main session. Final: `hcpcsCodes: []`.
- Mammogram `medicareOppsRate: 185` — fabricated; screening mammography is statutorily PFS-only in all settings, no OPPS rate exists. Verifier caught; manually removed.
- Upper-endoscopy PFS rate $250 → $111 — verifier corrected all 17 inline EN+ES mentions to match CMS 2026 PFS for CPT 43235.
- Echocardiogram $210 label — writer called it "professional component"; actually the global non-facility rate (professional-only is $85-95). Verifier MEDIUM-flagged; ships with flag.

**Structural:**
- knee-mri shipped with literal `"$1 to $2"` placeholder strings in all 4 `siteOfService.rows[].rangeWithoutInsurance` cells and all 8 `variants.rows` cells. Writer self-validated PASS because no GATE checked for placeholder patterns. Manually fixed by main session.
- echocardiogram had 12 en-dashes in `rangeWithoutInsurance` and `variants` cells rationalized from stale `mri.json` precedent. Verifier auto-fixed all 12 via GATE D.
- mammogram had 13 dashes (4 em-dashes in meta.title + sources, 9 en-dashes in ranges). Verifier auto-fixed all 13 via GATE D.
- All 4 non-x-ray articles emitted non-conforming `goodFaithEstimate` and `selfPayPrograms` sub-field shapes. See Issue #1.

**Vocabulary:**
- echocardiogram + mammogram: `chargemaster` term has 0 occurrences. GATE F sub-check #4 fails on both. Verifier MEDIUM-flagged; ships with flag.
- x-ray: `Original Medicare` term has 0 occurrences. GATE G one missing term; verifier should LOW-flag.
- knee-mri: `Medigap` term has 0 occurrences. GATE G one missing term.
- mammogram: `Medicare Part B` term has 0 occurrences (the page has "Medicare Part B" content but uses "Part B" + "Medicare" separately). Acceptable substitution semantics may apply but the verifier's grep wouldn't pick it up.

---

## Missing analysis files (PRD §10 Phase 5 commit 3 deliverable)

Required:
- `c-procedure-verifier-a.md` — MISSING
- `c-procedure-verifier-b.md` — MISSING
- `c-procedure-verifier-c.md` — MISSING
- `c-procedure-verifier-retest.md` (optional, only event + persona have it) — MISSING

Present:
- `c-procedure-requirements-matrix.md` ✓
- `c-procedure-phase4-results.md` ✓ (substantive, candid, includes per-article scorecard + lessons learned + post-verifier interventions)

---

## Verdict: SHIP_WITH_PATCHES

The prompts are world-class. The infrastructure is solid (backup files, validator passes, em-dashes zero, analysis files mostly present, memory entry written). The Phase 4 results doc is honest about every drift caught.

**But** before Track D, apply 3 patches:

1. **Strengthen verifier GATE E sub-check #5** to validate `goodFaithEstimate` and `selfPayPrograms` sub-field key conformance (not just presence). This catches the schema-drift pattern that ships in 4 of 5 articles today.
2. **Decide `ctaTarget` strategy:** either add the field to schema + prompts + JSONs (matches PRD §2 and other templates) or document the lock-to-analyzer rationale in the PRD and remove the §2 requirement.
3. **Spawn the 3 verifier review files** (`c-procedure-verifier-{a,b,c}.md`) to match the Track C-prime artifact pattern (or accept the divergence explicitly).

After those 3 patches, the work fully ships and Track D can start clean.

Don't reblock on a full re-run of Phase 4. The drift is cataloged, the test articles ship through the validator, and the highest-priority lesson (sub-field schema enforcement) is a verifier-prompt patch not a rerun.
