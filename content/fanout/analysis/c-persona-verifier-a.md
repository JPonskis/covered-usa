# Track C-prime Persona Writer — Verifier A (matrix-driven critic)

**Phase:** 3 (3-verifier review)
**Subject:** `.claude/agents/coveredusa-persona-writer.md` (new draft, 2026-05-14)
**Matrix:** `c-persona-requirements-matrix.md` (61 requirements)
**Role:** Verify the new writer enforces every requirement; score PASS / PARTIAL / FAIL; confirm conflicts went formula-wins; flag internal contradictions.

---

## Verdict summary

- **PASS:** 58 / 61
- **PARTIAL:** 3 / 61
- **FAIL:** 0 / 61
- **All 8 resolved conflicts go formula-wins:** confirmed
- **No internal contradictions detected**

## PASS/PARTIAL/FAIL per requirement

### Category: formula-universal

| Req | Status | Evidence |
|---|---|---|
| REQ-001 (RULE 1 state-context CONDITIONAL) | PASS | STEP 3 RULE 1 section says "N/A by default for persona; EXCEPTION when shape #6 applies"; GATE H detection enforces |
| REQ-002 (RULE 2 hh-size table CONDITIONAL) | PASS | STEP 3 RULE 2 + STEP 6 GATE B explicit: "required for income-gated; skip for pure-status" |
| REQ-003 (RULE 3 how-to-apply) | PASS | STEP 3 RULE 3 explicit: express in SEP-triggers or "How to enroll" detailSection with 4 sub-fields |
| REQ-004 (RULE 4 year-markers) | PASS | STEP 5 anchor facts + style rule 4 + 26-check year-anchoring |
| REQ-005 (RULE 5 ≥3 .gov) | PASS | STEP 6 GATE C explicit count check |

### Category: formula-recipe (8 shapes)

| Req | Status | Evidence |
|---|---|---|
| REQ-006 (shape #1 coverage options) | PASS | STEP 3 shapes table + STEP 4 26-check #17 STRICT count |
| REQ-007 (shape #2 PTC) | PASS | STEP 3 + STEP 6 GATE F + STEP 5 detailSection structure pattern |
| REQ-008 (shape #3 1099/freelancer) | PASS | STEP 2 required vocabulary + GATE E synonym enforcement |
| REQ-009 (shape #4 Form 7206 + Schedule SE caveat) | PASS | STEP 3 + STEP 5 style rule 9 + STEP 6 GATE I + multiple NEVER mentions |
| REQ-010 (shape #5 HSA/HDHP/FSA) | PASS | STEP 3 detailSection pattern + STEP 6 GATE G |
| REQ-011 (shape #6 state-stipend) | PASS | STEP 3 conditional + STEP 6 GATE H + specific CA Prop 22 / MA Question 3 mention |
| REQ-012 (shape #7 catastrophic) | PASS | STEP 3 conditional table + STEP 2 anchor facts |
| REQ-013 (shape #8 SEP triggers) | PASS | STEP 3 detailSection structure + STEP 5 pattern |

### Category: audit-flagged

| Req | Status | Evidence |
|---|---|---|
| REQ-014 (PE-1 synonym ≥5 distinct ≥2 occurrences) | PASS | STEP 2 synonym block + STEP 6 GATE E with explicit count check + concatenation formula |
| REQ-015 (PE-2 enumerate 8 shapes) | PASS | STEP 3 shapes table is the entire planning section; STEP 6 has dedicated gates F/G/H/I |
| REQ-016 (PE-3 vocabulary + scam guard) | PASS | STEP 2 vocabulary list (8 canonical terms) + NEVER list #6 (scam guard) |
| REQ-017 (pronoun discipline) | PASS | STEP 5 style rule 7 explicit + NEVER list #4-5 |
| REQ-018 (Form 7206 + SE caveat factual error) | PASS | STEP 5 rule 9 + GATE I + NEVER list #2; explicit "reduces both" ban |
| REQ-019 (ACA cliff phasedown phrasing) | PASS | STEP 5 anchor facts + NEVER list #7 |
| REQ-020 (meta.description ≤160 chars) | PASS | STEP 4 field checklist + 26-check #11 |
| REQ-021 (introParagraphs[0] persona-anchored) | PASS | STEP 4 field checklist explicit + STEP 5 rule 7 + NEVER #5 |
| REQ-022 (FAQ 80-150 words) | PASS | STEP 5 rule 10 |
| REQ-023 (body paragraph 120-220 words) | PASS | STEP 5 rule 10 |
| REQ-024 (em-dash sweep) | PASS | STEP 5 rule 1 + STEP 6 GATE D + STEP 7 post-rename re-check |

### Category: framework-preserved

| Req | Status | Evidence |
|---|---|---|
| REQ-025 (2026 anchor facts) | PASS | STEP 5 anchor facts list (11 anchors) |
| REQ-026 (1099-K threshold $5,000 2026) | PASS | STEP 5 anchor facts list |
| REQ-027 (ACA cliff back 2026) | PASS | STEP 5 + Category B verifier check |
| REQ-028 (IRA 2022 not 2023) | PASS | STEP 5 anchor + verifier Category C |
| REQ-029 (Section 2714 age-out 26) | PASS | STEP 5 anchor (for college-students persona) |
| REQ-030 (statute years: IRA 2022, ARPA 2021, ACA 2010) | PASS | STEP 5 + verifier Category C |

### Category: hard-contract

| Req | Status | Evidence |
|---|---|---|
| REQ-031 (JSON return shape preserved + additive) | PASS | STEP 8 example JSON includes all old fields + new additives |
| REQ-032 (atomic write tmp → rename) | PASS | STEP 1 + STEP 7 explicit |
| REQ-033 (## STEP N headings) | PASS | All STEPs use ## numbered headings |
| REQ-034 (schema interface conformance) | PASS | STEP 4 26-check + STEP 0 reads personas.ts |
| REQ-035 (FAQ flat strings) | PASS | STEP 4 CRITICAL faqs shape section explicit |
| REQ-036 (Spanish parity idiomatic) | PASS | STEP 5 Spanish translation quality section |
| REQ-037 (no em/en/double-hyphen) | PASS | STEP 5 rule 1 + GATE D + NEVER #3 |
| REQ-038 (optionDetails === optionsOverview.rows STRICT) | PASS | STEP 4 + 26-check #17 + NEVER #11 |
| REQ-039 (locked enums) | PASS | STEP 1 enum definitions + 26-check #4 #7 |

### Category: slug-rule

| Req | Status | Evidence |
|---|---|---|
| REQ-040 (GATE A no year) | PASS | STEP 6 GATE A regex + worked examples |
| REQ-041 (no suffixes like health-insurance) | PASS | STEP 6 GATE A worked examples |
| REQ-042 (never migrate slugs) | PASS | STEP 1 existence check + URL_SLUG_FRAMEWORK reference |

### Category: link-consumption

| Req | Status | Evidence |
|---|---|---|
| REQ-043 (topicCluster: "persona") | PASS | STEP 4 additive fields + 26-check #24 |
| REQ-044 (keyTerms {en, es} object NOT flat) | PASS | STEP 4 explicit "Do NOT emit flat array" + JSON shape template |
| REQ-045 (isLighthouse/isDeprecated false) | PASS | STEP 4 + 26-check #26 |
| REQ-046 (link-index byPhrase consumption) | PASS | STEP 0 reads link-index.json |
| REQ-047 (self-link guard) | PASS | STEP 0 explicit |
| REQ-048 (≥1 link to /event/ or /qa/) | PASS | STEP 4 relatedLinks + 26-check #22 |

### Category: strategic-posture

| Req | Status | Evidence |
|---|---|---|
| REQ-049 (default toward auto-ship) | PASS | STEP 6 gate-routing logic explicit; reinforced in STEP 8 |
| REQ-050 (scam guard) | PASS | NEVER list #6 |
| REQ-051 (queue consolidation guard) | PARTIAL | STEP 1 existence check covers `verified` status; explicit synonym-whitelist not enforced (deferred to Track E per matrix gaps section) |

### Category: humanizer-voice

| Req | Status | Evidence |
|---|---|---|
| REQ-052 (no filler) | PASS | STEP 5 rule 2 with explicit banned phrase list |
| REQ-053 (lead with numbers) | PASS | STEP 5 rule 3 |
| REQ-054 (real facts only) | PASS | STEP 5 rule 5 + NEVER #1 |
| REQ-055 (no markdown bold in JSON) | PASS | STEP 5 rule 11 |

### Category: cron-pipeline

| Req | Status | Evidence |
|---|---|---|
| REQ-056 (INPUTS) | PASS | INPUTS section enumerates all 7 + optional 3 |
| REQ-057 (path portability $HOME/clawd) | PASS | STEP 0 + all paths use $HOME/clawd; NEVER #13 |
| REQ-058 (maxTurns 60 writer / 50 verifier) | PASS | YAML maxTurns: 60 |
| REQ-059 (tools list) | PASS | YAML tools enumerated |
| REQ-060 (model: sonnet) | PASS | YAML model: sonnet |
| REQ-061 (background: true; bypassPermissions) | PASS | YAML |

---

## Internal contradictions

None detected. Cross-checks:
- GATE B "n/a for pure-status" matches STEP 3 RULE 2 "skip for pure-status (college students, early retirees Medicare-bound)"
- GATE F "applies to marketplace-coverage personas" matches STEP 3 shapes table "ALL where marketplace is in scope (most)"
- GATE I "Self-Employment-category only" matches STEP 3 shapes table "Self-Employment only"
- STEP 5 anchor facts FPL hh-1 $15,960 / 138% $22,025 / 400% $63,840 — values internally consistent and match audit-flagged 2026 anchors
- HSA limits $4,400/$8,750 consistent across STEP 5 + verifier expects same

## Conflicts resolution audit (formula-wins direction confirmed)

All 8 resolved conflicts in the matrix went formula-wins:

1. Synonym discipline: NEW writer adds GATE E (formula wins over old writer's silence) ✓
2. detailSections min count + shape enumeration: NEW writer has STEP 3 shapes table (formula wins over old "min 2 free-form") ✓
3. FAQ 80-150 words: NEW writer style rule 10 (formula wins over old 40-100) ✓
4. Body paragraph 120-220 words: NEW writer style rule 10 (formula wins over old unspecified) ✓
5. Path portability $HOME/clawd: NEW writer all paths portable (portability wins over old hardcoded /Users/frankthebot/) ✓
6. GATE framing REJECT vs advisory: NEW writer STEP 6 has 9 HARD REJECTS + "STOP. Read this twice." (B1 lesson 1 wins) ✓
7. STRICT count checks: NEW writer STEP 6 GATE F count strict check + GATE E synonym distinct_count check (load-test patch wins) ✓
8. Additive forward-compat fields: NEW writer adds topicCluster, keyTerms, isLighthouse, isDeprecated, gates, synonym_distinct_count, gapsFlagged (additive wins) ✓

---

## Top 5 fixes needed before Phase 4

None required. The 3 PARTIAL items are:

1. **REQ-051 (queue consolidation):** intentionally deferred to Track E per matrix gaps section. Phase 4's 5 test slugs are net-new (3) + pre-queued (2) so consolidation guard is not exercised. Leave as-is.

2. **Schema additive fields not yet in TypeScript Persona interface:** addressed via "JSON.parse silently ignores extras" workaround. Track A1 will add them to the interface. Phase 4 unaffected.

3. **householdSizeTable / howToApply as first-class schema fields:** also a Track A1 concern. Persona writer emits these as `detailSection` substructures (table + list) instead. Phase 4 unaffected.

**Drafter is GO for Phase 4.**
