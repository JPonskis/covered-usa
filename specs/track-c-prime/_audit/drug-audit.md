# Track C-prime DRUG session — Audit

**Date:** 2026-05-15
**Auditor:** Audit subagent (Opus 1M)
**Scope:** `.claude/agents/coveredusa-drug-writer.md` + `coveredusa-drug-verifier.md` (rewritten) plus 5 Phase 4 test articles (eliquis, jardiance, januvia, humalog, atorvastatin).

---

## Verdict: PARTIAL (ships with caveats)

Writer + verifier prompts are well-structured and shippable. The 5 test articles validate cleanly and have most required structure. **Three real problems** prevent a clean PASS: (1) `ctaTarget` field missing on all 5 articles (PRD §2 hard requirement); (2) `denialAlternatives` and `howToApplyPap` schema drift on humalog + atorvastatin (writer emitted different shapes than prompt); (3) Humalog has no fda.gov source citation (audit P1 / GATE C sub-check). All three are surface-able as deferred fixes — none break the page render — but they are real gaps against the PRD.

---

## Per-check results

| # | Check | Result | Notes |
|---|---|---|---|
| 1 | Writer prompt STEP 0-8 structure, `$HOME`, "STOP. Read this twice." | **PASS** | STEPs 0-8 numbered, `$HOME/clawd` used throughout, "STOP. Read this twice." appears in STEP 4 MANDATORY-BLOCKS and STEP 6 GATES. |
| 2 | Writer 4 universal + 4 drug GATES (A-H) | **PASS** | All 8 gates present with worked examples, routing, and STRICT count checks for F (≥4 rows) and H (=9 rows). GATE I (pronoun discipline) added as bonus. |
| 3 | Verifier dual-purpose (STEP 1C structural + GATE D auto-fix mandatory) | **PASS** | Dual-purpose framing in YOUR TASK; STEP 1C is explicit; GATE D framed as "AUTO-FIX MANDATORY" with Ohio failure-mode callout. |
| 4 | `iraNegotiation` populated on Eliquis/Jardiance/Januvia | **PASS** | All 3 have `maxFairPrice` + `listPriceBefore` + `effectiveDate: "2026-01-01"` + CMS source + bilingual callout. Eliquis $231 / Jardiance $197 / Januvia $113 — matches CMS published MFPs. (Writer prompt's worked example says $295 for Eliquis; that is now stale vs CMS — minor lesson, doesn't block ship.) |
| 5 | `pharmacyPriceComparison` ≥4 rows on all 5 | **PASS** | 5/5 rows on all 5 drugs. GATE F satisfied. |
| 6 | Generic/biosimilar block correctness | **PARTIAL** | Atorvastatin: `hasGeneric: true`, biosimilars `[]` (correct). Humalog: `hasGeneric: undefined`, `biosimilars: null`, but `products[]` array names Admelog + Lyumjev correctly with `notIncluded` callout explaining Basaglar/Semglee/Rezvoglar are NOT Humalog biosimilars (rapid- vs long-acting). The shape DRIFTS from the prompt's spec (no `biosimilars[]` array, `hasGeneric` undefined), but content is arguably correct. PRD's GATE G as written would HOLD this. |
| 7 | `papEligibilityTable` 9 rows on ≥3 of 5 | **PARTIAL — 3/5** | Eliquis 9 rows, Januvia 9 rows, Humalog 9 rows. Jardiance MISSING (PAP refs FPL via "based on FPL guidelines" phrasing — GATE H should have caught this). Atorvastatin correctly omitted (no PAP, `gates.h: n/a`). |
| 8 | `ctaTarget = "analyzer"` on ALL 5 | **FAIL — 0/5** | `ctaTarget` is `undefined` on every article. PRD §2 hard contract violated. Writer prompt does NOT mention `ctaTarget` anywhere — silent drop from spec. |
| 9 | 2026 anchor facts | **PASS** | Part D OOP $2,100 + Part B deductible $283 on all 5. IRA dated 2022. Insulin $35 cap referenced on humalog. |
| 10 | Validator clean | **PASS** | `node scripts/validate-drugs.js`: 0 bad. All 5 new files pass strict mode. (3 existing drugs — insulin, metformin, ozempic — have pre-existing warnings; out of scope.) |
| 11 | Analysis files | **PARTIAL** | Requirements matrix present (`c-drug-requirements-matrix.md`). 3 verifier reports present (`c-drug-verifier-a/b/c.md`). Memory entry present (`feedback_track_c_drug_writer_shipped.md`). **MISSING: `c-drug-phase4-results.md` and `c-drug-verifier-retest.md`** (peer templates like procedure / qa / event / persona shipped these; drug skipped them). |

**Dash scan:** 0 dashes on all 5 files. GATE D enforcement working.

---

## Top 3 issues

### 1. `ctaTarget` field is completely absent from all 5 articles
PRD §2 explicitly locks `ctaTarget` to the enum `"screener" | "analyzer"` and says drug pages default to `"analyzer"` ("any page citing a dollar amount > $50 MUST use ctaTarget: analyzer"). The writer prompt never mentions `ctaTarget` — neither in STEP 4 checklist nor in NEVERs nor in STEP 8 return JSON. The verifier prompt also never checks for it. All 5 articles emit JSON without the field, so the page falls back to default (likely `screener`). **Severity: HIGH-LOW** (real PRD violation, but the page renders fine without it — the analyzer CTA just wouldn't show). Fix: add `ctaTarget` to the writer's required-fields checklist + add a verifier check.

### 2. Schema drift on humalog + atorvastatin: `denialAlternatives` and `howToApplyPap` use different shapes
The writer prompt specifies `denialAlternatives` as `{appealSteps[], stepTherapyOverride, papFallback, genericAlternative}` and `howToApplyPap` as a top-level block with `{programName, numberedSteps[], govStartingUrl, manufacturerStartingUrl, documentsNeeded[], commonDenialReasons[]}`. Eliquis, Jardiance, and Januvia follow this. **Humalog and Atorvastatin invented different shapes:**
- humalog `denialAlternatives` = `{intro, options[]}` (no `appealSteps[]`)
- humalog `howToApplyPap` = `{programs[]}` (nested array of programs, each with `steps[]`)
- atorvastatin `denialAlternatives` = `{intro, genericAlternative, stepTherapyOverride}` (no `appealSteps[]`)
- atorvastatin no `howToApplyPap` (acceptable — no PAP)

The verifier's STEP 1C does not check for these sub-fields with strict shape — it only checks block presence. Result: schema drift shipped. **Severity: MEDIUM.** Pages render but block structure doesn't match what Track A1 renderer will eventually expect. Fix: writer prompt should enforce the exact sub-field names (currently shows them in examples but doesn't grep for them); verifier STEP 1C should add a `denialAlternatives.appealSteps.length >= 3` strict check.

### 3. Jardiance is missing `papEligibilityTable` despite a FPL-referencing PAP
Jardiance's `patientAssistancePrograms.rows[0].costBenefit.en` literally says "income threshold not publicly published but based on FPL guidelines". That triggers GATE H (PAP references FPL). The article shipped without the table. Either GATE H needs broader FPL phrasing detection (current implicit trigger is the string "400% FPL" / "400 percent of FPL"; the verifier's regex in STEP 1C is implicit) or the writer should have emitted a "best-effort" 400% FPL table with a footnote about BI Cares not publishing exact thresholds. **Severity: MEDIUM.** Humalog has no fda.gov citation either (GATE C sub-check WARN, but verifier didn't flag it in the shipped file).

---

## Specific drift examples

- **Eliquis MFP $231 vs writer-prompt worked example $295.** Memory entry confirms $231 is correct (CMS-published value). Writer prompt's worked example is stale and could mislead future passes. Trivial doc fix.
- **Humalog `genericBiosimilarStatus.hasGeneric: undefined`** (should be `false` per Drug interface). Verifier flagged the conceptual issue (insulin disambiguation) and the writer responded with a creative shape (`products[]` + `notIncluded` callout) instead of the standard one. Content is strong; shape is non-conforming.
- **Humalog `denialAlternatives.appealSteps.length === 0`** and `howToApplyPap.numberedSteps.length === 0` — those arrays don't exist; the data lives under different keys. A strict verifier count would HOLD this article.
- **Atorvastatin has FAQ count 8/8 but `patientAssistancePrograms: undefined`** and `papEligibilityTable: undefined` — both correct for a generic-only drug (`gates.h: n/a`). Writer handled the edge case well.
- **Required-vocabulary grep:** humalog missing 4 of 10 canonical terms ("Maximum Fair Price", "manufacturer coupon", "formulary tier", "prior authorization"); atorvastatin missing 3 of 10. The writer prompt has a grep self-check at STEP 6 — it did not enforce.

---

## Missing analysis files

Per PRD §10 and per the pattern set by procedure/qa/event/persona Track C-prime sessions:

1. **`content/fanout/analysis/c-drug-phase4-results.md`** — per-article rubric scores. Peer templates (`c-procedure-phase4-results.md`, `c-qa-phase4-results.md`) shipped this; drug skipped. Memory entry has the data but the canonical analysis file is missing.
2. **`content/fanout/analysis/c-drug-verifier-retest.md`** — peer templates (`c-event-verifier-retest.md`, `c-persona-verifier-retest.md`) include a retest report after verifier updates. Drug session did not produce one.

Present and correct: requirements matrix, 3 verifier reports (a/b/c), memory feedback file, both `.bak` backups, both rewritten prompts, 5 test articles.

---

## Files referenced

- `/Users/jacobposner/clawd/.claude/agents/coveredusa-drug-writer.md`
- `/Users/jacobposner/clawd/.claude/agents/coveredusa-drug-verifier.md`
- `/Users/jacobposner/clawd/.claude/agents/coveredusa-drug-writer.bak.md`
- `/Users/jacobposner/clawd/.claude/agents/coveredusa-drug-verifier.bak.md`
- `/Users/jacobposner/clawd/projects/covered-usa/content/data/drugs/{eliquis,jardiance,januvia,humalog,atorvastatin}-cost.json`
- `/Users/jacobposner/clawd/projects/covered-usa/content/fanout/analysis/c-drug-{requirements-matrix,verifier-a,verifier-b,verifier-c}.md`
- `/Users/jacobposner/.claude/projects/-Users-jacobposner-clawd/memory/feedback_track_c_drug_writer_shipped.md`
