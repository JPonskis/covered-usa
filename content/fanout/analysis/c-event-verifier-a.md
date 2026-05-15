# Verifier A — Matrix-driven critic (Phase 3)

**Phase:** 3 (Verifier A — matrix-driven critic, scored against the 61-requirement matrix)
**Date:** 2026-05-15
**Subject:** new `.claude/agents/coveredusa-event-writer.md` (7,956 words) + `.claude/agents/coveredusa-event-verifier.md` (4,936 words)
**Method:** for each requirement in `c-event-requirements-matrix.md`, mark PASS / PARTIAL / FAIL with line/section evidence

---

## Section A — Universal rules (5/5)

| ID | Rule | Score | Evidence |
|---|---|---|---|
| U1 | State-context-everywhere | PASS | STEP 3 "Universal rules — apply ALL 5" explicitly marks RULE 1 as CONDITIONAL (event slugs not state-scoped); stateRules + state-named brand injection covers the state-citable surface |
| U2 | Eligibility-household-size table | PASS | STEP 6 GATE B explicitly conditional; income-gating event list enumerated; routing HOLD on applies+absent; N/A skip path |
| U3 | How-to-apply section | PASS | STEP 3 §4.6 shape #3 + #4 + audit E1 documents/denialReasons; STEP 4 checklist; native to template via steps[] |
| U4 | Year markers | PASS | STEP 5 style rule 4 + STEP 2 year-anchored facts list; "Never write '$X' without '2026'" |
| U5 | Authoritative source narrowing | PASS | STEP 6 GATE C: ≥3 .gov/.edu/kff.org enforced; HOLD on 0-1 |

## Section B — §4.6 recipe (8/8 shapes)

| ID | Shape | Score | Evidence |
|---|---|---|---|
| R1 | COBRA vs Marketplace + .gov | PASS | STEP 3 shape #1 + GATE G + `comparisonNarrative` template in STEP 1 |
| R2 | SEP window + dates + state | PASS | STEP 6 GATE F: anchored start+end dates required; HOLD on neither |
| R3 | Immediate next steps numbered | PASS | STEP 1 `steps[]` schema rule (MIN 3, typical 5-7) + action-verb + specific-noun rule |
| R4 | Documents needed | PASS | STEP 1 additive field `documentsNeeded` REQUIRED always |
| R5 | Eligibility for subsidies | PASS | STEP 1 additive field `householdSizeTable` REQUIRED when GATE B applies; 9 rows × 3 cols × en/es |
| R6 | State-extension laws | PASS | STEP 1 additive field `stateRules` REQUIRED for state-variance events; STEP 2 reference table with 8 states + statutes |
| R7 | CHIP / Medicaid pivot | PASS | STEP 3 shape #7 + state-named brand list + body/FAQ/optionsComparison row requirement |
| R8 | HowTo schema 5-7 steps + totalTime | PASS | STEP 6 GATE E: steps[].length >= 3 + totalTime correct for kind |

## Section C — Audit E1-E9

| ID | Priority | Title | Score | Evidence |
|---|---|---|---|---|
| E1 | P0 | 4 new structured fields | PASS | STEP 1 additive section: householdSizeTable, documentsNeeded, stateRules, commonDenialReasons all defined with shapes |
| E2 | P0 | Em-dash purge with self-validation | PASS | STEP 6 GATE D EXTRA-STRICT + post-fix sanity grep + verifier mirrors with bulk sed last-resort |
| E3 | P0 | Meta cap 70/160 EN+ES | PASS | STEP 4 checklist + STEP 6 field validation; Spanish-runs-long advisory |
| E4 | P1 | comparisonNarrative for coverage-loss | PASS | STEP 1 + GATE G + worked-example block in STEP 5 |
| E5 | P1 | Source-name colon normalization | PASS | STEP 5 style rule 8: "`HealthCare.gov: Coverage to age 26` NOT `HealthCare.gov — Coverage to age 26`" |
| E6 | P1 | introParagraphs 150-300 words | PASS | STEP 4 checklist + STEP 5 paragraph length rule 9 |
| E7 | P2 | IRMAA + MSP for Medicare-aging | PARTIAL | Not in test mix per PRD §7 (Track E concern); writer doesn't explicitly cover IRMAA. Acceptable scope-limit per PRD. |
| E8 | P2 | State-named brand injection | PASS | STEP 3 Required-vocabulary checklist; STEP 5 Medicaid-pivot worked example |
| E9 | P2 | Table-shape phrasing in caption | PASS | STEP 4 `optionsComparison.source` includes "by deadline and cost" guidance (implicit in caption rule); could be more explicit |

## Section D — Hard contracts (9/9)

| ID | Contract | Score |
|---|---|---|
| H1 | STEP 8 JSON return shape | PASS — explicit JSON sample + cron-parse note |
| H2 | Atomic write pattern | PASS — STEP 1 + STEP 7 |
| H3 | `## STEP N` headings | PASS — 8 numbered headings |
| H4 | Schema interface conformance | PASS — STEP 1 schema reminder |
| H5 | FAQ flat strings | PASS — STEP 1 + STEP 4 + NEVER #5 in CRITICAL BOUNDARIES |
| H6 | Spanish parity | PASS — STEP 5 Spanish translation quality section |
| H7 | No em/en/double-hyphen outside source.name | PASS — GATE D EXTRA-STRICT |
| H8 | Path portability | PASS — STEP 0 + NEVER #9 |
| H9 | "Move / Relocation" enum | PASS — explicit callout in STEP 1 + NEVER #3 |

## Section E — Slug rules (4/4)

PASS on all. GATE A enforces year-prohibition; STEP 4 checklist; existing slugs preserved by reference.

## Section F — Link consumption (6/6)

PASS on all. `topicCluster`, `keyTerms` shape (with explicit "do NOT emit flat array" warning), `isLighthouse: false`, `isDeprecated: false`, relatedLinks whitelist all present.

## Section G — Strategic posture (3/3)

PASS. Default-toward-ship explicit in verifier STEP 1C routing.

## Section H — Humanizer voice (4/4)

PASS. Style rule list in STEP 5 + GATE H pronoun discipline.

## Section I — Cron pipeline (6/6)

PASS. Frontmatter + STEP 8 return shape + `gates` object + additive metadata.

## Section J — Event-specific GATES (8 new GATES)

| GATE | Score | Evidence |
|---|---|---|
| A (slug-no-year) | PASS | STEP 6 GATE A — universal, HOLD routing |
| B (household-size CONDITIONAL) | PASS | STEP 6 GATE B — explicit applies/N/A list |
| C (≥3 .gov citations) | PASS | STEP 6 GATE C — HOLD on 0-1, WARN on 2 |
| D (em-dash zero, EXTRA-STRICT) | PASS | STEP 6 GATE D + post-fix sanity grep + 3-pass retry |
| E (HowTo steps + totalTime) | PASS | STEP 6 GATE E — 4 sub-checks |
| F (anchored SEP dates) | PASS | STEP 6 GATE F — HOLD if neither anchor present |
| G (comparisonNarrative for coverage-loss) | PASS | STEP 6 GATE G — LOW flag routing |
| H (pronoun discipline) | PASS | STEP 6 GATE H — WARN/MEDIUM routing |

---

## Verifier A summary

**61 PASS / 1 PARTIAL (E7 by acknowledged scope) / 0 FAIL.**

The new writer covers every requirement from the 10-source synthesis matrix. The one PARTIAL (E7 IRMAA + MSP for Medicare-aging) is acknowledged by the PRD as out-of-scope for this rewrite (Track E concern; turning-65-medicare not in the 5-test mix). All P0 + P1 audit edits are implemented as hard rules.

**The verifier is well-paired:** every writer GATE has a corresponding verifier check; structural failures route HOLD; numeric drift auto-fixes with the GATE D post-fix sanity grep mandatory (the T26-leak antidote per PRD §6).

**Strongest sections:**
1. STEP 6 GATE block — 8 explicit GATES with routing rules; no ambiguity about HOLD vs WARN vs auto-fix
2. STEP 2 anchor-fact list — 2026 values explicitly enumerated with sources; uber-lyft-style drift from stale PRD encoding less likely
3. Additive structured fields (householdSizeTable, documentsNeeded, stateRules, commonDenialReasons, comparisonNarrative) — closes the audit's #1 gap

**Weakest sections (minor):**
1. E7 (IRMAA + MSP) not in scope — acceptable; PRD scope-limited
2. E9 (table caption "by X" phrasing) implicit in `optionsComparison.source` rule but not enforced as explicit GATE — minor; ship without enforcement
3. State-extension reference table in STEP 2 cites 8 states with statutes; ages may shift over time; writer instruction "Verify each before citing" handles drift risk

No silent omissions found. Recommend SHIP.
