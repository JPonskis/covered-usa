# Persona PRD Verification (Track C-prime)

**Target:** `/Users/jacobposner/clawd/projects/covered-usa/specs/track-c-prime/persona-prd.md`
**Verifier:** two-pass (fresh-eyes + completeness)
**Date:** 2026-05-14

---

## PASS 1 — Fresh-eyes (read PRD alone, list questions a fresh executor would ask)

Pretending I am a fresh session about to execute Track C-prime for persona, I read the PRD cold end-to-end and would need answers to the following before starting. Each is tagged:
- **GOOD** — answered in PRD with §ref
- **SOFT GAP** — partially answered; would need to cross-reference master brief / sibling docs to fully resolve
- **HARD GAP** — not answered; would block execution or force me to invent scope

### Q1. Synonym block enforcement — what exactly is the mechanism?
The PRD §3 ("Synonym block — THE PERSONA-SPECIFIC GATE") tells the WRITER to "use each synonym at least 2-3 times" and tells the VERIFIER (§9) to grep body content. The pseudocode in §9 specifies "case-insensitive, word-boundary" and "concatenate body" — concrete enough to implement. **Verdict: GOOD (§3 synonym block + §6 GATE E + §9 pseudocode).**
Minor follow-up: §3 says "2-3 times" but §6 GATE E says "≥2 occurrences" and the §9 pseudocode says `count >= 2`. The "2-3" range in §3 is aspirational guidance; the verifier threshold is unambiguously 2. **Verdict on subtlety: SOFT GAP** — a reader could be confused about whether the writer should aim for 3 (gold-standard) vs the verifier passing at 2; clarification one-liner would help.

### Q2. GATE B applicability — when EXACTLY is a persona "income-gated"?
The PRD §6 GATE B (and §5 universal GATES recap) gives examples: gig-workers, freelance-designers-consultants, recently-lost-employer-coverage YES; college-students, near-retirement NO. The criterion stated is "income-gated by PTC subsidy thresholds or Medicaid expansion eligibility." **Verdict: GOOD (§5 + §6 GATE B routing).**
Subtlety: §7 says `freelance-designers-consultants` "tests household-size table for income-gating" but `near-retirement` is income-gated too (PTC eligibility for pre-Medicare 60-64), and the PRD says GATE B is N/A there. The rationale (Medicare-bound = handoff vs marketplace-primary) is implicit. **Verdict: SOFT GAP** — would benefit from one explicit sentence: "near-retirement is treated as N/A because the persona's primary path is Medicare hand-off, not multi-year marketplace."

### Q3. Form 7206 fact-check — what scope does the verifier validate?
§3 says verifier MUST flag "reduces both income tax and SE tax" phrasing. §6 GATE I narrows to (a) Form 7206 appears AND (b) explicit Schedule SE caveat. The PRD does NOT require the verifier to validate the form NUMBER per se (e.g., to detect "Form 7202" or "Form 8889" misnomers) — it relies on the literal string "Form 7206" being present. Line-item validation ("Schedule 1 line 17") is mentioned in §3 shape #4 as "or above-the-line deduction language" — interchangeable. 2026 deduction-cap validation (100% of premium, IRS cap) is NOT explicitly required of the verifier. **Verdict: GOOD scope for fact-check categories; SOFT GAP on numeric caps** — a fresh executor could ship a page that says "deduction is capped at $X" with the wrong $X and the verifier would not catch it.

### Q4. State-specific stipend programs — how does a fresh agent know which states have them?
§3 shape #6 names four programs: CA Prop 22, MA Init 1, NY Freelance Isn't Free Act, WA portable benefits pilot. §8 failure mode #5 names the same four. Test mix §7 says uber-lyft-rideshare-drivers "tests CA Prop 22 state-specific section." **Verdict: GOOD for the 5 test slugs** — agent has enough to research each.
**SOFT GAP**: for any future persona (e.g., `delivery-couriers`, `caregiving-aides`), the PRD does not encode a research recipe ("search labor.[state].gov + KFF state-policy + the state legislature site"). A fresh agent would need to invent this. The PRD §6 GATE H "flag LOW" stance (never HOLD on absence) makes this less risky in practice, but the gap is real.

### Q5. The "Additive Track C-prime fields" claim (§2)
§2 says emit `topicCluster`, `keyTerms`, `isLighthouse`, `isDeprecated` "additive" because "extra fields are silently ignored at runtime." I verified `personas.ts` — these fields are NOT in the `Persona` interface. The contract says emitting them is safe (TypeScript silently allows extras when parsing JSON). The verifier expects `keyTerms.en` as the synonym source (§6 GATE E, §9). **Verdict: GOOD — well-justified.**
Subtlety: validator (`scripts/validate-personas.js`) behavior on extra fields is not confirmed in the PRD. If validator uses strict schema mode (e.g., Zod `.strict()`), extras crash. **Verdict: SOFT GAP** — pre-flight checklist §11 runs `validate-personas.js` baseline but the PRD doesn't explicitly say "this validator tolerates extra fields"; an agent could pre-flight green and then post-write red on a strict-mode rejection.

### Q6. FAQ word count — 40-100 or 80-150?
The PRD §3 mentions FAQ topics but does NOT specify a word-count target. The audit JSON (B_self_employed.other_findings) calls out that the writer prompt currently says 40-100 words while framework Section 4.5 wants 80-150, and self-employed.json's 80-130 word answers are "ironically aligned with framework." The PRD does NOT resolve this conflict explicitly. **Verdict: HARD GAP** — fresh executor doesn't know whether to target 40-100, 80-150, or something else. (The audit's "minor gap" calls this out but the PRD doesn't promote the fix to a writer rule.)

### Q7. The §3 variant distribution numbers vs FANOUT_FORMULA §4.7
PRD §3 line: "Entailment 50.2% / Specification 25.1% / Equivalent 18.4% / Clarification 5.2% / Canonicalization 1.1%"
FANOUT_FORMULA.md §4.7 line: "Entailment 50.2% / Equivalent 22.2% / Canonicalization 15.3% / Specification 12.0% / Follow-up 0.3%"
These numbers do not match. **Verdict: HARD GAP** — one of them is wrong, and a fresh executor referencing both would be confused. Same problem with shape #3 (PRD calls it Entailment; FANOUT says Specification) and shape #5 (PRD calls Specification; FANOUT says Entailment).

### Q8. `personaName: LocalizedString` vs the §2 hard contract example
§2 lists `personaName: LocalizedString` (good — matches `personas.ts`). The PRD nowhere shows a worked example of the EN/ES pair, and the audit-finding rule "FAQ question/answer are FLAT STRINGS not LocalizedString" is the kind of subtlety where a fresh executor learns by drafting → validator-rejecting. The PRD §2 footer item 5 calls this out as the most common drafter mistake. **Verdict: GOOD (§2 item 5).**

### Q9. `householdSizeTable` vs `detailSections.table`
Audit §3.3 says the writer needs a NEW schema field `householdSizeTable`. The personas.ts interface does NOT have that field — it has `detailSections[].table?` as the canonical place to render any table. PRD §6 GATE B routing says "table MUST have exactly 9 data rows" — but does NOT specify which schema field holds it. **Verdict: SOFT GAP** — fresh executor would default to `detailSections[].table` (correct per current schema), but the audit's "schema migration" recommendation isn't reconciled with the PRD's "extra fields silently ignored" stance. The audit says "schema migration second"; the PRD says "ship now in detailSections.table." Inconsistency.

### Q10. The 8 dominant shapes vs schema slots
PRD §3 maps shapes 1-8 to optionsOverview / optionDetails / detailSections / FAQ. Specifically: shape #2 (PTC) "Render as a NEW required H2 / detailSection." Shape #5 (HSA/FSA) "Render as a dedicated detailSection." Shape #6 (state stipend) "Render as a dedicated detailSection." Shape #8 (SEP) "Render as a dedicated H2 / detailSection." That's at minimum 4 detailSections required + the open "tax/financial + situation-specific strategy" pair from §2. **Verdict: SOFT GAP** — PRD §2 says "MIN 2" detailSections, but the §3 shape distribution implies MIN 4+ for income-relevant personas. A fresh executor reading §2 alone could ship a 2-detailSection page that satisfies the schema but fails the §3 shape recipe.

### Q11. Linking-out vs embedding (procedure-prd vs persona-prd consistency)
PRD §7 says `recently-lost-employer-coverage` "MUST link to `/event/just-lost-job-health-insurance`" and §3 shape #8 says "For overlap-heavy events, link out to the matching `/event/<slug>` page rather than restate." The procedure-prd sibling presumably does NOT have this linking-out rule (procedures are leaves). **Verdict: GOOD — clearly stated.**

### Q12. ES synonym list — where does it come from?
§3 synonym table lists EN synonyms only. §9 says verifier counts EN body occurrences. The schema requires `keyTerms.es: string[]` (Spanish parity). The PRD does NOT specify whether Spanish synonyms must hit the same density (≥5 distinct, ≥2 occurrences each) or are exempt. The §9 pseudocode pseudocode reads `JSON.keyTerms.en` only. **Verdict: SOFT GAP** — fresh executor might emit a 5-synonym EN list and a 1-synonym ES list (just the canonical Spanish term) and pass the verifier. The Spanish parity rule (§2 item 6) is "every LocalizedString needs both en AND es" but doesn't address parallel synonym density.

---

## PASS 2 — Completeness (mechanical checks)

### Check 1 — Cited paths exist (§1 + §11 + §12)

All 13 cited paths verified to exist on disk:

| Path | Exists |
|---|---|
| `.claude/agents/coveredusa-persona-writer.md` | YES |
| `.claude/agents/coveredusa-persona-verifier.md` | YES |
| `.claude/agents/_universal-rules-block.md` | YES |
| `.claude/agents/coveredusa-ma-state-writer.md` | YES |
| `.claude/agents/coveredusa-ma-state-verifier.md` | YES |
| `.claude/agents/coveredusa-article-verifier.md` | YES |
| `projects/covered-usa/specs/FANOUT_FORMULA.md` | YES |
| `projects/covered-usa/specs/AI_OPTIMIZATION_FRAMEWORK.md` | YES |
| `projects/covered-usa/specs/URL_SLUG_FRAMEWORK.md` | YES |
| `projects/covered-usa/specs/LINK_TARGET_MANIFEST.md` | YES |
| `projects/covered-usa/specs/CURRENT_STATE_AUDIT.md` | YES |
| `projects/covered-usa/specs/PHASE_5_BRIDGE.md` | YES |
| `projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md` | YES |
| `projects/covered-usa/specs/track-c-prime/procedure-prd.md` | YES |
| `projects/covered-usa/content/fanout/analysis/audit-persona-writer.json` | YES |
| `projects/covered-usa/src/lib/personas.ts` | YES |
| `projects/covered-usa/content/data/personas/self-employed.json` | YES |
| `projects/covered-usa/content/data/personas/gig-workers.json` | YES |

**PASS.**

### Check 2 — Audit findings match `audit-persona-writer.json`

PRD §4 claims:
- "gig-workers 19% / self-employed 69% fan-out coverage" → audit confirms 1.5/8 (19%) and 5.5/8 (69%). **MATCH.**
- "freelancer 25, consultant 4, sole proprietor 2, 1099 16" in self-employed → audit confirms 25 / 4 / 2 / 16. **MATCH.**
- "0 freelancer, 0 contractor, 0 rideshare, 0 sole proprietor, 0 independent contractor, 0 lyft, 0 1099-K, only 2 mentions of 1099" in gig-workers → audit confirms each count. **MATCH.**
- "PE-1 synonym block, PE-2 8-shape enumeration, PE-3 vocabulary checklist + scam guard" → audit's top-3 writer edits are: (1) synonym coverage block, (2) enumerate 8 §4.7 shapes, (3) add householdSizeTable + howToApply schema. **MISMATCH on PE-3.** The audit's #3 fix is "schema migration for householdSizeTable + howToApply" — NOT "required-vocabulary checklist + scam guard." The PRD substitutes a different #3. This is a deliberate scope choice (the PRD downgrades schema migration to a future task, which is reasonable given the §2 "extras silently ignored" stance) but it should be called out explicitly. **SOFT GAP / inconsistency** with audit recommendations.

### Check 3 — Schema fields match `personas.ts` Persona interface

PRD §2 top-level field list cross-checked against `personas.ts` lines 100-162:

| PRD field | Interface match |
|---|---|
| slug | YES |
| personaName: LocalizedString | YES |
| shortName: LocalizedString | YES |
| category: PersonaCategory | YES (enum matches lines 89-95) |
| topic: string | YES |
| medicalSpecialty: string | YES |
| ctaTarget: PersonaCtaTarget | YES (enum matches line 98) |
| lastUpdated, readingTime | YES |
| meta.{title, description}: LocalizedString | YES |
| hero.{h1, subhero}: LocalizedString | YES |
| quickAnswer: LocalizedString | YES |
| introParagraphs: LocalizedString[] | YES |
| optionsOverview | YES |
| optionDetails: OptionDetail[] | YES |
| traps: TrapsSection | YES |
| detailSections: DetailSection[] | YES |
| faqs.{en, es}: LocalizedFAQ[] | YES (FLAT strings — interface lines 31-34 match the PRD §2 item 5 caveat) |
| relatedLinks: RelatedLink[] | YES |
| sources: PersonaSource[] | YES |

PRD's "additive" fields (`topicCluster`, `keyTerms`, `isLighthouse`, `isDeprecated`) are NOT in the Persona interface. The PRD explicitly flags this as "additive (extra fields silently ignored at runtime)." **Match status: PASS for required fields; the additive claim is a runtime assumption that depends on `validate-personas.js` not running strict-mode schema validation** (see Q5 SOFT GAP above).

### Check 4 — Recipe references match FANOUT_FORMULA §4.7

| Claim | FANOUT §4.7 actual |
|---|---|
| "Entailment 50.2% / Specification 25.1% / Equivalent 18.4% / Clarification 5.2% / Canonicalization 1.1%" (PRD §3) | **MISMATCH.** FANOUT §4.7 says "Entailment 50.2% / Equivalent 22.2% / Canonicalization 15.3% / Specification 12.0% / Follow-up 0.3%". Only the Entailment 50.2% top-line matches. |
| "8 of 8 Bing-validated, tied with daily-blog" | MATCH (FANOUT §4.7 says exactly that) |
| Shape #1 = Specification | MATCH |
| Shape #2 = Entailment (PTC) | MATCH |
| Shape #3 = Entailment (PRD); = Specification (FANOUT) | **MISMATCH** |
| Shape #4 = Entailment | MATCH |
| Shape #5 = Specification (PRD); = Entailment (FANOUT) | **MISMATCH** |
| Shape #6 = Specification | MATCH |
| Shape #7 = Specification | MATCH |
| Shape #8 = Entailment | MATCH |
| Required H2s "Coverage options, Subsidy + tax credit, Self-employment deduction, HSA/FSA, State-specific" | MATCH |
| "Synonym coverage required" | MATCH |

**MISMATCH** on variant-distribution percentages and on shape #3 + shape #5 variant tags. This is the single biggest factual error in the PRD. Either the PRD or FANOUT_FORMULA must be wrong; both can't be right.

### Check 5 — All 12 sections present

| Section | Present | Notes |
|---|---|---|
| 0. Read order | YES | |
| 1. Context inventory | YES | |
| 2. Schema reminder + hard contracts | YES | |
| 3. The §4.7 recipe (worked examples) | YES | |
| 4. Audit findings synthesized | YES | |
| 5. Universal GATES | YES | A, B, C, D |
| 6. Persona-specific GATES | YES | E, F, G, H, I (5 gates — labelled E-I; the PRD's §12 quick-ref card calls out 5 persona gates so the I-letter is intentional) |
| 7. Test mix (5 personas) | YES | |
| 8. Common failure modes | YES | 9 modes enumerated |
| 9. Verifier scope (Phase 4.5) | YES | Includes the 3 mandatory patches |
| 10. Atomic deliverable (4 commits) | YES | |
| 11. Pre-flight checklist | YES | 7 commands |
| 12. Quick reference card | YES | |

**PASS — all 12 (technically 13 counting §0) sections present.**

### Check 6 — Universal GATES A-D + persona GATES E-I match master brief routing

Master brief §7 routing:
- GATE A FAIL → HOLD ✓ PRD matches (§5 "HOLD on fail")
- GATE B → CONDITIONAL on income-gating, FAIL → HOLD when applicable ✓ PRD matches (§5 + §6)
- GATE C FAIL (0-1 .gov) → HOLD; WARN at 2 ✓ PRD matches (§5)
- GATE D → AUTO-FIX, never HOLD ✓ PRD matches (§5)

Master brief §3 Phase 4.5 three patches:
- (1) GATE F count strictness ✓ PRD §9 includes ("strict count check on detailSections / required H2s / synonym occurrences")
- (2) `keyTerms` shape example with explicit "do NOT emit flat array" ✓ PRD §9 includes
- (3) GATE D auto-fix hoist ✓ PRD §9 includes

**PASS.**

PRD-specific gates E-I are well-defined, with routing per gate matching the master brief's "default toward auto-ship" principle (HOLD only for synonym <3, PTC absent for marketplace persona, Schedule SE factual error, year-in-slug, 0-1 .gov).

### Check 7 — Test mix collision check

Existing JSON files in `content/data/personas/`: `gig-workers.json`, `self-employed.json`, `_queue.json` (3 files, 2 personas).

PRD test slugs: `uber-lyft-rideshare-drivers`, `freelance-designers-consultants`, `college-students`, `recently-lost-employer-coverage`, `near-retirement`.

| Slug | Collides with existing JSON? | Collides with `_queue.json` entry? |
|---|---|---|
| uber-lyft-rideshare-drivers | NO | NO |
| freelance-designers-consultants | NO | NO |
| college-students | NO | **YES — exact match in queue (status: queued)** |
| recently-lost-employer-coverage | NO | NO |
| near-retirement | NO | **SEMANTIC overlap — queue has `early-retirees` (status: queued, "Early Retirement Healthcare Bridge", "Bridge years 60-65 critical")** |

**MIXED.** No JSON-file collisions (the gating check is clean), but:
- `college-students` is already in the queue. The PRD treats it as a NEW slug. Either the queue entry becomes the deliverable, or the PRD overwrites it. The PRD does not address this overlap. **SOFT GAP.**
- `near-retirement` semantically overlaps `early-retirees` (same persona, different slug). This is the slug-migration risk Jacob has flagged in memory ("Never Migrate URL Slugs"). The PRD picks `near-retirement` without justifying why over the queue's `early-retirees`. **SOFT GAP.**

### Check 8 — `_universal-rules-block.md` state-program brand list

The PRD references "the 19-state program brand list" (§1 + §12).

Actual `_universal-rules-block.md` table: **19 brand rows** but **18 distinct states** (California appears twice — Medi-Cal and CalFresh).

**MINOR INACCURACY.** "19-state" is technically wrong; "19-brand, 18-state" or "19-program-brand" would be correct. Low impact — the agent will read the actual block at runtime — but the PRD's claim is off by one state.

### Check 9 — Recipe references match FANOUT_FORMULA §4.7 (writer recipe block)

FANOUT §4.7 "Writer-agent recipe" lists:
- Required H2s: "Coverage options for [persona]", "Subsidy + tax credit eligibility", "Self-employment health deduction", "HSA/FSA fit", "State-specific programs"
- Required FAQs: covering all 8 dominant shapes
- Year markers: required
- Synonym coverage: required per Audit §3.3 + Framework §5.6

PRD §3:
- Required H2s match (PRD names same 5 + adds Marketplace SEP + Catastrophic plans as H2s 6-7-8 from the shape list)
- Required FAQs: 6-8 (PRD enumerates 8 specific Qs)
- Year markers: required (RULE 4 + §3 year-anchoring)
- Synonym coverage: required (new GATE E)

**MATCH** on writer recipe block (modulo the variant-distribution numbers mismatch flagged in Check 4).

---

## Verdict

**Overall:** ACCEPT WITH FIXES. The PRD is comprehensive, structurally complete, and operationally executable. All 12 sections present, all 17 cited paths exist, schema field list matches the interface, audit findings synthesize correctly, GATE routing matches the master brief, file-collision check is clean. The verifier pseudocode in §9 is concrete enough for a fresh executor to implement without ambiguity.

**Three classes of issues:**
1. **HARD GAPS (must fix before ship):** (a) Variant-distribution percentages in §3 do not match FANOUT_FORMULA §4.7; shape #3 and shape #5 variant tags also disagree. One of the two docs is wrong. (b) FAQ word-count target is unspecified despite the audit calling out a 40-100 vs 80-150 conflict.
2. **SOFT GAPS (would benefit from clarification):** (a) `near-retirement` vs queue's `early-retirees` slug rationale unstated; `college-students` already in queue. (b) GATE B applicability to `near-retirement` rationale unstated (Medicare hand-off vs marketplace-primary). (c) PE-3 in §4 substitutes "vocabulary + scam guard" where the audit's #3 is "schema migration"; deliberate but undocumented choice. (d) `topicCluster`/`keyTerms` "additive" stance depends on a validator runtime assumption that isn't verified in §11 pre-flight.
3. **MINOR INACCURACIES:** (a) "19-state program brand list" — actually 19 brands, 18 states. (b) Synonym threshold inconsistency: §3 aspirational "2-3 times" vs §9 verifier "≥2".

The PRD is significantly stronger than the audit baseline — it codifies the synonym fix (PE-1) as a HOLD-grade gate, enumerates all 8 shapes with concrete render-targets, and gives verifier pseudocode tight enough to implement. A fresh executor could ship 5 articles from this PRD with high confidence, accepting the variant-distribution mismatch as a defer-to-FANOUT decision.

## Top 3 fixes

1. **Reconcile variant-distribution percentages and shape #3 / #5 variant tags between PRD §3 and FANOUT_FORMULA §4.7.** Pick whichever doc is authoritative (likely FANOUT, since it's the source) and edit the other. The current state is the largest factual error in the PRD.
2. **Resolve the slug collisions / overlaps with `_queue.json`.** `college-students` already exists in queue (status: queued) — either remove from queue and treat as Phase 4 test article, or pick a different test slug. `near-retirement` semantically duplicates `early-retirees` — pick one canonical slug and justify the choice (memory note: "Never Migrate URL Slugs" warns against retitling).
3. **Specify FAQ word-count target** (recommend 80-150 words per framework Section 4.5, with one-line justification — matches what `self-employed.json` already does and aligns with the audit's "ironically correct" finding). Also bolt down the synonym density threshold: pick either "≥2 per synonym, ≥5 distinct" (verifier-enforced; current §9 pseudocode) or "2-3 per synonym, ≥5 distinct" (writer aspirational) — but make them consistent.

---

## Summary (200 words)

The Persona PRD is structurally complete, executable, and a meaningful upgrade over the current writer baseline. All 12 sections present, all 17 cited paths exist on disk, schema fields cross-check cleanly with `personas.ts`, audit-finding counts match `audit-persona-writer.json` exactly, GATE routing matches the master brief, and the verifier pseudocode in §9 is concrete (case-insensitive word-boundary grep, distinct-count threshold). The PRD correctly elevates the audit's #1 fix (synonym density) to a HOLD-grade gate (GATE E) and enumerates all 8 §4.7 dominant shapes with concrete render-targets.

Three hard gaps require fixes before a fresh executor ships: (1) variant-distribution percentages in §3 do NOT match FANOUT_FORMULA §4.7 (PRD says Specification 25.1%; FANOUT says 12.0%) and shape #3/#5 variant tags disagree; (2) FAQ word count is unspecified despite the audit flagging a 40-100 vs 80-150 conflict; (3) slug overlap with `_queue.json` is unresolved (college-students already queued; near-retirement semantically duplicates early-retirees). Plus minor inaccuracies (19-state vs 19-brand, synonym threshold inconsistency between §3 "2-3" and §9 "≥2"). Verdict: ACCEPT WITH FIXES. Top 3 fixes are: reconcile §3 ↔ FANOUT §4.7 numbers, resolve queue-slug collisions, and pin a FAQ word-count target.
