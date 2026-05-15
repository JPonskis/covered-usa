# Procedure PRD Verification Report

**PRD:** `projects/covered-usa/specs/track-c-prime/procedure-prd.md`
**Verified:** 2026-05-14
**Method:** Two-pass (fresh-eyes + cited-doc cross-check)

---

## PASS 1 — Fresh-eyes questions

Read the PRD end to end with NO other context loaded. Below: every question a cold-read executor would need to answer before starting Track C-prime for procedure-cost.

| # | Question a fresh executor would ask | Where answered | Label |
|---|---|---|---|
| 1 | What are the exact slugs that already exist (so I don't collide in Phase 4)? | §7 test-mix + §11 pre-flight checklist step 5 (`ls projects/covered-usa/content/data/procedures/*.json`) | GOOD |
| 2 | What does GATE D do when `--` is found? | §5: "AUTO-FIX as style correction; never HOLD"; reinforced in §9 routing | GOOD |
| 3 | What's the exact path to the gold-standard reference page? | §1 (`content/data/procedures/colonoscopy.json`) + §12 quick-reference card | GOOD |
| 4 | What does the `Procedure` TypeScript interface look like? | §2 lists required fields + cites `src/lib/procedures.ts` in §1 | GOOD |
| 5 | How exactly should `keyTerms` be shaped, with a concrete example? | §2 says `{en: string[], es: string[]}` + §9 mentions "embed the `{en: [...], es: [...]}` template" but no full example block in PRD | SOFT GAP (PRD assumes drafter pulls example from master-brief §3 Phase 4.5 patches) |
| 6 | What are the 5 universal rules + 19-state program brand list? | §1 cites `_universal-rules-block.md` but does NOT enumerate; the rules + brands themselves never appear in the PRD | SOFT GAP (Master brief + universal-rules-block — ref needed; PRD assumes drafter loads them) |
| 7 | What are the "8 B1 lessons" referenced in §0? | §0 cites `memory/feedback_b1_blog_writer_shipped.md` but doesn't summarize | SOFT GAP (Master brief — ref needed) |
| 8 | What's the full phase breakdown (Phases 1-5, with 3.5 and 4.5 sub-phases)? | §9 mentions Phase 4.5, §10 says "Phase 5 — 4 commits", but PRD never enumerates Phase 1 / 2 / 3 / 3.5 / 4 directly | SOFT GAP (Master brief §3 — ref needed; PRD assumes order-of-read in §0 covers this) |
| 9 | Who is the "Phase 1 planner" agent — what spawns it, what does it produce, what's its prompt? | §1 says "the planner agent will read these in Phase 1" with no further definition. PRD never tells you that the planner is a generic sub-agent spawn (not a named agent file) defined in master brief §3 Phase 1 | SOFT GAP (Master brief — ref needed; novice would miss this) |
| 10 | What are the 4 universal GATES exactly, and how do they map to A/B/C/D? | §5 enumerates them and §12 summarizes. Names + routing match master brief §7. | GOOD |
| 11 | What is "default-toward-ship" routing precisely? | §12 cites the 95%/4%/1% ratio. Full definition lives in master brief §3 Phase 3.5 (§0 directs drafter there). | GOOD with caveat |
| 12 | Where is the cron entry that picks up the writer prompt + what cron parses STEP 8 JSON? | Not specified in the PRD. §2 mentions "the cron may parse for logging" but never names which cron, where the cron lives, or how to test it. | HARD GAP |
| 13 | What does the validator script `scripts/validate-procedures.js` check exactly (§11 step 6)? | §11 references it without describing checks. Drafter needs to read the script to know what `0 bad` means. | SOFT GAP |
| 14 | What is the "Ohio MA-state failure mode" referenced in the GATE D auto-fix hoist patch (§9)? | §9 references it but doesn't describe. Master brief §3 Phase 4.5 patch 3 describes it (verifier saw 11 `--` instances and marked them informational instead of fixing). | SOFT GAP |
| 15 | Does WE-1's schema change (`goodFaithEstimate` top-level field) actually get added to `src/lib/procedures.ts` in this Track C-prime session, or is it deferred to Track E? | §6 GATE E says "either (a) top-level `goodFaithEstimate` block (preferred per WE-1) OR (b) `medicareSection.paragraphs[]` entry with heading-level prose" — escape hatch present, but PRD never resolves which option to ship with. Drafter would have to pick. | SOFT GAP (decision needed; PRD leaves it open) |

**Tally:** 1 HARD GAP / 8 SOFT GAPS / 6 GOOD.

The single hard gap is the cron-pickup question (#12). It's load-bearing for Phase 5 ("watch the first content production round" per master brief §3 Phase 5) but the PRD never names a cron file or test command. A cold-read executor would not know where to look.

---

## PASS 2 — Completeness checks (cited-doc verification)

### Check 1: All cited file paths exist

| Path | Cited in PRD | Status |
|---|---|---|
| `.claude/agents/coveredusa-procedure-writer.md` | §1, §12 | PASS (12,421 bytes) |
| `.claude/agents/coveredusa-procedure-verifier.md` | §1, §12 | PASS (12,421 bytes) |
| `.claude/agents/coveredusa-ma-state-writer.md` | §0, §12 | PASS (41,704 bytes) |
| `.claude/agents/coveredusa-ma-state-verifier.md` | §0, §9, §12 | PASS (24,472 bytes) |
| `.claude/agents/coveredusa-article-verifier.md` | §0, §12 | PASS (26,414 bytes) |
| `.claude/agents/_universal-rules-block.md` | §1 | PASS (6,535 bytes) |
| `specs/TRACK_C_PARALLEL_PLAN.md` | §0, §12 | PASS (57,735 bytes) |
| `specs/FANOUT_FORMULA.md` | §1, §3, §12 | PASS (34,265 bytes) |
| `specs/AI_OPTIMIZATION_FRAMEWORK.md` | §1 | PASS (75,260 bytes) |
| `specs/URL_SLUG_FRAMEWORK.md` | §1 | PASS (13,869 bytes) |
| `specs/LINK_TARGET_MANIFEST.md` | §1 | PASS (19,331 bytes) |
| `specs/CURRENT_STATE_AUDIT.md` | §1 | PASS (38,380 bytes) |
| `specs/PHASE_5_BRIDGE.md` | §1 | PASS (33,305 bytes) |
| `src/lib/procedures.ts` | §1, §2, §12 | PASS (8,203 bytes) |
| `content/fanout/analysis/audit-procedure-writer.json` | §1, §11, §12 | PASS (20,803 bytes) |
| `content/data/procedures/colonoscopy.json` | §1, §11, §12 | PASS (33,006 bytes) |
| `content/data/procedures/mri.json` | §1 | PASS (20,825 bytes) |
| `content/data/procedures/ct-scan.json` | §1 | PASS (26,499 bytes) |
| `memory/feedback_b1_blog_writer_shipped.md` | §0 | PASS (6,071 bytes) |

**Result: PASS — every cited path exists.**

### Check 2: Audit findings match the audit JSON

| PRD claim (§4) | Audit JSON reality | Match? |
|---|---|---|
| 3 pages audited: mri, ct-scan, colonoscopy | `pagesAudited` = `/cost/mri`, `/cost/ct-scan`, `/cost/colonoscopy` | PASS |
| Alignment scores: medium / medium / high | mri = medium, ct-scan = medium, colonoscopy = high | PASS |
| "Good Faith Estimate" phrase does NOT appear in any of the 3 audited JSON files | Audit `biggestInsight` + per-page `shapesMissing` confirms ZERO GFE mentions across all 3 | PASS |
| 8 writer edits (WE-1 through WE-8) with HIGH/MED/LOW priorities | Audit `recommendations.writerEdits` = WE-1 through WE-8 with priorities HIGH/HIGH/MED/MED/HIGH/MED/LOW/LOW | PASS (matches exactly) |
| PRD §4 ranks "WE-1, WE-2, WE-5, WE-6 as required; WE-3, WE-4 as strongly recommended; WE-7, WE-8 as nice-to-have" | Audit priorities for those are HIGH/HIGH/HIGH/MED vs MED/MED vs LOW/LOW. PRD's required/recommended/nice-to-have grouping matches the audit's HIGH/MED/LOW priority bands cleanly. | PASS |
| Single biggest miss = GFE/NSA absence | Audit `biggestInsight` confirms: "silent on the #2 shape (Good Faith Estimate / No Surprises Act process), which is the ONLY Bing-validated shape in the §4.1 recipe" | PASS |

**Result: PASS — every audit claim in the PRD is supported by the JSON.**

### Check 3: Schema field references match `procedures.ts`

| PRD §2 field | Exists in `Procedure` interface? | Notes |
|---|---|---|
| `slug` | YES | required string |
| `procedureName`, `shortName` | YES | LocalizedString |
| `procedureType`, `medicalSpecialty` | YES | strings |
| `lastUpdated`, `readingTime` | YES | strings |
| `hcpcsCodes?` | YES | optional string[] |
| `meta.{title, description}` (LocalizedString) | YES | matches |
| `hero.{h1, subhero}` | YES | matches |
| `quickAnswer` | YES | LocalizedString |
| `pricing.{nationalMedian, nationalLow, nationalHigh, medicarePfsRate, medicareOppsRate?, medicareCoinsurancePct, partBDeductibleYear, partBDeductibleAmount}` | YES | every sub-field present |
| `introParagraphs[]` | YES | LocalizedString[] |
| `siteOfService` | YES | matches `SiteOfServiceSection` |
| `variants?` | YES | optional `VariantSection` |
| `medicareSection` | YES | matches |
| `factorsAffectingCost` | YES | matches `FactorsSection` |
| `commonBillingErrors?` | YES | optional |
| `faqs: {en, es}` (LocalizedFAQ — flat strings) | YES | hard contract #5 verified — `LocalizedFAQ` is `{question: string; answer: string}`, NOT LocalizedString |
| `relatedLinks[]`, `sources[]` | YES | match |
| **Additive fields:** `topicCluster`, `keyTerms`, `isLighthouse`, `isDeprecated` | **NOT IN INTERFACE** | PRD §2 correctly labels these "Additive Track C-prime fields" that are "silently ignored at runtime" per hard-contract #4. JSON-extra fields are safe. NOT drift, but a fresh reader could be confused since §2 lists them adjacent to true schema fields. |
| **WE-1 field:** `goodFaithEstimate` | **NOT IN INTERFACE** | PRD §6 GATE E offers escape hatch (either top-level field OR embed in `medicareSection.paragraphs[]`). If executor picks option (a), they'd need to add the field to `procedures.ts` AND the page template. This decision is the SOFT GAP #15 above. |

**Result: PASS with one drift caveat** — every named schema field is real; the "additive" fields are correctly disclosed but easy to misread as already-present.

### Check 4: Recipe references match FANOUT_FORMULA.md §4.1

| PRD §3 claim | FANOUT §4.1 reality | Match? |
|---|---|---|
| Variant distribution: Specification 43.9% / Equivalent 28.0% / Entailment 24.3% / Canonicalization 3.2% / Clarification 0.5% | §4.1 line 207: identical figures | PASS |
| Bing-validated shapes: 1 of 8 | §4.1 line 209: "1 of 8 (low)" | PASS |
| Bing-validated shape is GFE/NSA (shape #2) | §4.1 line 214: shape #2 = "Good Faith Estimate / No Surprises Act compliance — Entailment, **Bing-validated**" | PASS |
| Top 8 dominant shapes (PRD §3) | §4.1 lines 213-220 enumerate shapes 1-8 with identical names and ordering | PASS |
| Required H2s | §4.1 line 223: "Cost without insurance", "Hospital vs imaging center", "Good Faith Estimate process", "Insurance coverage breakdown" — PRD §3 expands beyond these (adds self-pay H2, Medicare benchmark) per WE-2 + WE-4 | PASS (PRD intentionally adds; documented in §4) |
| Required FAQ topics | §4.1 line 225 lists 3 suggestions (GFE; Medicare/Medicaid coverage; cash-pay discount). PRD §3 promotes these to 8-10 required FAQs per WE-5 (GFE request, NSA applicability, written cash-pay quote, post-bill negotiation + Medicare/cost/comparison). | PASS (intentional expansion; documented as WE-5 in §4) |
| State-specificity optional | §4.1 line 226: "optional (procedure-cost is geographically uniform-ish)" | PASS |

**Result: PASS — recipe claims accurate; intentional expansions documented.**

### Check 5: All 12 sections present per the README structure

PRD section count:

- §0 Read order — present
- §1 Context inventory — present
- §2 Schema reminder + hard contracts — present
- §3 The §4.1 recipe (expanded with worked examples) — present
- §3.5 N/A for procedure (procedure has no state-context expansion) — correctly omitted per PRD note
- §4 Audit findings synthesized — present
- §5 Universal GATES — present
- §6 Procedure-specific GATES — present
- §7 Test mix — present
- §8 Common failure modes — present
- §9 Verifier scope (Phase 4.5) — present
- §10 Atomic deliverable (Phase 5 — 4 commits) — present
- §11 Pre-flight checklist — present
- §12 Quick reference card — present

**Result: PASS — all sections 0-12 present; §3.5 correctly omitted (procedure has no state-context expansion).**

### Check 6: GATEs (4 universal + 4 template-specific) match master brief structure

**Universal gates (PRD §5 vs master brief §7):**

| Gate | PRD §5 | Master brief §7 | Match? |
|---|---|---|---|
| GATE A — slug-no-year | HOLD on fail | "regex match → reject" (HOLD) | PASS |
| GATE B — household-size | N/A for procedure (correct per §7: "Templates where it does NOT apply: ... procedure (skip unless charity-care eligibility table)") | Conditional, skip for procedure | PASS |
| GATE C — ≥3 .gov/.edu/kff.org | HOLD on 0-1; WARN on exactly 2 | Universal; same routing (HOLD 0-1, WARN 2) | PASS |
| GATE D — zero `--` | AUTO-FIX, never HOLD | Universal; AUTO-FIX as style correction | PASS |

**Template-specific gates (PRD §6 vs master brief §5.2):**

| Gate | PRD §6 | Master brief §5.2 "Special STEP 6 GATES" | Match? |
|---|---|---|---|
| GATE E — GFE/NSA H2 present | HOLD if absent | "GFE section MUST be present" | PASS |
| GATE F — Self-pay H2 present | ship + LOW flag | (not explicit in §5.2, but consistent with default-toward-ship) | PASS (within tolerance) |
| GATE G — Required vocabulary | flag MEDIUM if 3+ missing | (not explicit in §5.2 — derived from WE-6) | PASS (derived) |
| GATE H — Comparison framing | flag LOW if missing | (not explicit in §5.2 — derived from WE-3) | PASS (derived) |

Master brief §5.2 also lists "Hospital outpatient vs imaging center comparison table required" + "Medicare reimbursement rate (year-anchored) cited inline with cms.gov link" as STEP 6 gates. PRD covers both implicitly through GATE C (cms.gov requirement) + the H2 list in §3, but doesn't promote them to standalone gates. Minor drift; not load-bearing because the schema requires `siteOfService.rows` and `pricing.medicarePfsRate` anyway — the writer cannot ship without them or the validator fails.

**Routing language (PASS/WARN/FAIL/HOLD):** PRD uses PASS/WARN/FAIL/HOLD consistently across §5, §6, §9. Master brief uses the same lexicon throughout §3 Phase 4.5 + §7. **Match.**

**Result: PASS — gate IDs, routing, and language align with master brief.**

### Check 7: Test mix has 5 NEW slugs that don't collide with existing pages

**Existing procedure slugs** (from `ls content/data/procedures/`):
- `colonoscopy`
- `ct-scan`
- `mri`
- `_queue` (queue file, not a procedure)

**PRD §7 test mix:**
- `x-ray` — does NOT exist (collision-free)
- `knee-mri` — does NOT exist (collision-free; not the same as `mri`)
- `echocardiogram` — does NOT exist
- `mammogram` — does NOT exist
- `upper-endoscopy` — does NOT exist

All 5 slugs are net-new. Master brief §5.2 specifies a different test mix (`CT scan / X-ray / Colonoscopy / Knee MRI / Echocardiogram`); PRD §7 deviates by skipping CT scan + colonoscopy (already shipped) and substituting `mammogram` + `upper-endoscopy`. PRD §7 explains the substitution: "Skip the 3 already-shipped (mri, ct-scan, colonoscopy — Track E will regen these)." This is an intentional improvement over the master brief.

**Result: PASS — 5/5 slugs are collision-free with the 3 existing shipped pages.**

---

## Summary

(a) Hard gap count: **1** (cron-pickup mechanism / where the writer is consumed in production is unspecified)

(b) Soft gap count: **8** (universal rules block + B1 lessons not inlined; Phase 1 planner role implicit; `keyTerms` example not shown; phase breakdown not enumerated in PRD; validator script behavior not described; "Ohio MA-state failure mode" unexplained; WE-1 ship-decision left open between top-level field vs embed-in-medicareSection)

(c) Completeness fail count: **0** (all 7 mechanical checks PASS; minor caveats noted on additive-field disclosure clarity and master-brief §5.2 gates not promoted to standalone GATEs in §6)

(d) Verdict: **SHIP_WITH_PATCHES**

The PRD is structurally complete and accurate. The one hard gap (cron pickup) is annoying but not blocking — Phase 5 §10 says "watch the first content production round" and master brief Phase 5 explains the procedure. A drafter can find the cron entry by grep. Soft gaps are mostly "PRD assumes you read the master brief first," which §0 explicitly mandates.

(e) Top 3 fixes needed:

1. **Add a Phase 5 cron-pickup paragraph to §10** — name the cron (e.g., bulkgen cron job ID or the script that consumes writer prompts), the test command, and what "watch the first content production round" means in practice. This is the only true hard gap.

2. **Resolve the WE-1 ship-decision in §6 GATE E** — pick one: either (a) Track C-prime adds `goodFaithEstimate` to `procedures.ts` + page template, OR (b) procedure-cost embeds GFE prose inside `medicareSection.paragraphs[]` and a Track E ticket adds the schema field. Leaving it open forces every parallel session to re-litigate the decision.

3. **Inline a concrete `keyTerms` JSON example in §2** (3-4 lines: `{"en": ["term1", "term2"], "es": ["término1", "término2"]}`) — the master-brief patch language ("embed the exact JSON shape template") explicitly says this should be in the writer prompt, and the PRD is the closest the drafter has to that source. Closing the inline gap prevents the flat-array bug that the patch was designed to prevent.
