# Track C-prime Event — Phase 1 requirements matrix

**Phase:** 1 (inventory + requirements synthesis)
**Date:** 2026-05-15
**Subject:** rewrite of `.claude/agents/coveredusa-event-writer.md` + `.claude/agents/coveredusa-event-verifier.md`
**Source docs synthesized (10):** event-prd.md, master brief TRACK_C_PARALLEL_PLAN.md §3-§7 + Appendix A/B, FANOUT_FORMULA.md §3 + §4.6, _universal-rules-block.md, audit-event-writer.json, AI_OPTIMIZATION_FRAMEWORK.md, URL_SLUG_FRAMEWORK.md, LINK_TARGET_MANIFEST.md, CURRENT_STATE_AUDIT.md §4.5, content-quality.js + validate-events.js

---

## Conflict resolutions (formula wins)

| # | Conflict | Old behavior (event-writer v1) | New rule (resolved) |
|---|---|---|---|
| C1 | FAQ word count | "40–100 words" | **80–150 words** (FANOUT_FORMULA §4.5) — but tolerate 50–150 since audit notes event FAQ baseline is ~60-100. Hard floor 50, soft target 80–150. |
| C2 | Paragraph length intro | not enforced | **150–300 words per introParagraph** (audit E6 + content-quality.js soft target). Hard floor 50 words to avoid the JL "70 word" baseline. |
| C3 | Em-dash policy | "NO em / en dashes" rule unenforced; T26 shipped 18-23 | **GATE D auto-fix + post-fix sanity grep** mandatory; `--`, `—`, `–` all banned outside `sources[].name` |
| C4 | Path portability | `/Users/frankthebot/...` hardcoded | `$HOME/clawd/...` everywhere |
| C5 | detailSections requirement | "OPTIONAL — events already have steps + options + mistakes" | **MIN 2 detailSections** (audit E1 + E4 require them) — `comparisonNarrative` for coverage-loss events + 1 of: documents-deepdive / state-extension-deepdive / Medicaid-pivot-deepdive |
| C6 | Additive structured fields | none | **4 new top-level fields per audit E1 P0:** `householdSizeTable?`, `documentsNeeded`, `stateRules?`, `commonDenialReasons` |
| C7 | topicCluster / keyTerms | not emitted | required (content-quality.js soft warn → strict warn; Track C-prime mandate); `keyTerms: {en: [], es: []}` object shape (NOT flat array) |
| C8 | Source title em-dashes | unaddressed | per audit E5 — normalize `HealthCare.gov — Coverage to 26` to `HealthCare.gov: Coverage to 26` via colon |

---

## Requirements inventory (61 total across 9 categories)

### A. Universal rules (5, all PASS-required)

| ID | Rule | Application to event template |
|---|---|---|
| U1 | State-context-everywhere | **CONDITIONAL.** Event slugs not state-scoped today; future Track D adds `/event/[event]/[state]`. For now: don't force per-state; DO populate `stateRules[]` for events with known state variance; DO mention state-named brand (Medi-Cal, AHCCCS, BadgerCare, MassHealth) when discussing Medicaid pivot. |
| U2 | Eligibility-household-size table | **CONDITIONAL per GATE B.** Applies when event income-gates Medicaid/subsidy (lost-job, having-a-baby, divorce affecting subsidy, becoming-a-caregiver, income-change). N/A for pure scheduling events (turning-26 absent income, getting-married default, plan-change). When applies: 9-row table (sizes 1-8 + each-additional), year-tagged caption, 138% FPL + 400% FPL columns. |
| U3 | How-to-apply section | **NATIVE TO TEMPLATE.** Already covered by `steps[]` + `optionsComparison`. Add `documentsNeeded` (4-8 items) + `commonDenialReasons` (3-5 items) per audit E1 to fully satisfy. |
| U4 | Year markers | **MANDATORY.** Every dollar/percentage in same sentence as 2026 (or 2027 for forward AEP); table captions year-tagged; meta + hero + quickAnswer reference 2026 explicitly. |
| U5 | Authoritative source narrowing | **GATE C — min 3 .gov/.edu/kff.org inline citations.** Required: healthcare.gov (SEP) + medicaid.gov (year-round Medicaid pivot) + cms.gov or kff.org. Medicare-aging events also need medicare.gov + ssa.gov. |

### B. §4.6 recipe (8 dominant shapes — Bing-validated 6/8, highest of any template)

| ID | Shape | Variant | Audit status | New writer enforcement |
|---|---|---|---|---|
| R1 | COBRA vs Marketplace decision + .gov | Entailment top weight | PARTIAL (table only) | `comparisonNarrative` block REQUIRED for Job Loss / Lost Other Coverage / coverage-loss-implicating Family Change (divorce). GATE G. |
| R2 | SEP enrollment window + dates + state | Specification | PASS | Anchored start + end dates in `urgency.body` ("60 days from coverage loss — typically Jan 1 - March 1 if you lose coverage Jan 1, 2026"). GATE F. |
| R3 | Immediate next steps (numbered, 3-7) | Entailment | PASS | `steps[]` min 3, typical 5-7. Action-verb + specific-noun rule. GATE E. |
| R4 | Documents needed for SEP application | Entailment | MISS | NEW REQUIRED FIELD `documentsNeeded: {en: [], es: []}` 4-8 items. |
| R5 | Eligibility for subsidies during SEP | Entailment | PARTIAL | NEW REQUIRED FIELD `householdSizeTable` when income-gated. GATE B conditional. |
| R6 | State-extension laws (turning-26 by state) | Specification (unvalidated but strong) | PARTIAL | NEW FIELD `stateRules: [{state, rule, sourceUrl}]` REQUIRED for moving-states, having-a-baby (state-CHIP), Medicaid unwinding. OPTIONAL otherwise. |
| R7 | CHIP / Medicaid pivot if event-triggered | Entailment | PASS | Body + FAQ + ≥1 row in `optionsComparison` for events touching family income. |
| R8 | HowTo schema 5-7 steps + totalTime | Specification | PASS | `steps[].length >= 3` AND `urgency.totalTimeISO8601` populated for kind=deadline/window OR null for no-deadline. GATE E. |

### C. Audit E1-E9 (9 writer edits — P0/P1/P2)

| ID | Priority | Title | New writer enforcement |
|---|---|---|---|
| E1 | P0 | Add 4 new required structured fields | `householdSizeTable?`, `documentsNeeded`, `stateRules?`, `commonDenialReasons` — see C6 conflict resolution |
| E2 | P0 | Em-dash purge with self-validation hook | STEP 6 GATE D — grep + auto-fix + post-fix sanity grep |
| E3 | P0 | Hard-cap meta.title 70 + meta.description 160 in EN+ES | STEP 4 + STEP 6 check |
| E4 | P1 | comparisonNarrative for coverage-loss events | GATE G, required for Job Loss / Lost Other Coverage / divorce |
| E5 | P1 | Colon normalization for source.name em-dashes | STEP 3 + STEP 6 |
| E6 | P1 | introParagraphs 150-300 words each | STEP 5 word-count check |
| E7 | P2 | IRMAA + MSP for Medicare-aging | spec for Track E (regen) — not in this rewrite's test mix |
| E8 | P2 | State-named brand injection for Medicaid-pivot events | STEP 5 body content rule + GATE E check on body strings |
| E9 | P2 | Table-shape phrasing in caption | "by deadline and cost" / "chart" / "guidelines" — STEP 4 optionsComparison caption rule |

### D. Hard contracts (9 — NEVERs)

| ID | Contract | Source |
|---|---|---|
| H1 | STEP 8 JSON return shape | master brief §3 Phase 5 |
| H2 | Atomic write: `<slug>.tmp.json` → validate → rename | master brief + validator pattern |
| H3 | `## STEP N` numbered headings | cron parsing |
| H4 | Schema interface conformance (TriggerEvent) — required fields present | events.ts |
| H5 | FAQ q/a as FLAT strings (NOT LocalizedString) | Appendix B; validator hard error |
| H6 | Spanish parity — every LocalizedString needs en AND es | Appendix B |
| H7 | No em-dash `—` (U+2014), no en-dash `–`, no `--` outside source.name | content-quality.js warning + GATE D |
| H8 | Path portability `$HOME/clawd/...` | master brief |
| H9 | category enum — "Move / Relocation" is ONE value with internal slash | events.ts + Appendix B failure mode |

### E. Slug-rule (URL_SLUG_FRAMEWORK)

| ID | Rule | Application |
|---|---|---|
| S1 | No year in slug | GATE A — `getting-married` not `getting-married-2026` |
| S2 | Lowercase, [a-z0-9-] only, no leading/trailing hyphens | content-quality.js hard error |
| S3 | Length ≤ 60 chars | content-quality.js |
| S4 | Never migrate existing slugs (Jacob's burned memory) | preserve existing 3 slugs verbatim |

### F. Link consumption (LINK_TARGET_MANIFEST)

| ID | Rule | Application |
|---|---|---|
| L1 | `topicCluster` declared | New required field. Use `event-sep` (default), `event-medicare-iep` (Age Milestone Medicare), `event-medicaid-pivot` (income-loss events) |
| L2 | `keyTerms: {en: [], es: []}` object shape | NOT flat array (Appendix B failure mode); 3-6 phrases each |
| L3 | `isLighthouse: false` | event pages are spokes |
| L4 | `isDeprecated: false` | default new |
| L5 | relatedLinks href prefixes — whitelist | `/screener`, `/medical-bill-analyzer`, `/medicaid-income-limits`, `/medicare-eligibility`, `/aca-income-limits`, `/federal-poverty-level`, `/cost/`, `/drug/`, `/qa/`, `/glossary/`, `/event/`, `/for/`, `/medicare-advantage/` |
| L6 | Inline body links use natural phrases that match link-index `byPhrase` | "Medicaid income limits", "FPL", "Medicare eligibility" |

### G. Strategic posture (master brief §3.5 default-toward-ship)

| ID | Rule | Application |
|---|---|---|
| P1 | ~95% ship / ~4% flag / ~1% HOLD | default-toward-auto-ship gate routing |
| P2 | Numeric drift → auto-fix (narrow Edit) | verifier STEP 1B Categories A-J |
| P3 | Structural failure → HOLD; route back to writer (DON'T verifier-rewrite) | verifier STEP 1C structural gates |

### H. Humanizer voice (per SOUL.md + persona predecessor)

| ID | Rule | Application |
|---|---|---|
| V1 | No filler ("Great question", "It's important to note", "navigating the complex world of") | STEP 5 banned-phrase list |
| V2 | Decisive language — "You have 60 days" not "You may have approximately" | STEP 5 voice rule |
| V3 | Lead with the deadline anchor in hero + urgency callout | STEP 4 hero rule |
| V4 | Pronoun discipline — never open a paragraph with It/They/This/These/Here/There/Such | STEP 5 GATE H (mirror of MA-state GATE G) |

### I. Cron pipeline (operational concerns)

| ID | Rule | Application |
|---|---|---|
| O1 | Background agent — model: sonnet, maxTurns: 40-60 | frontmatter |
| O2 | Tools list — Read, Write, Edit, Bash, WebSearch, WebFetch, Glob, Grep | frontmatter |
| O3 | Last line of output = parseable JSON only | STEP 8 |
| O4 | Status enum: `success` / `error` / `rejected` | STEP 8 |
| O5 | `gates` object + `gates_failed` array in return shape | STEP 8 (mirror MA-state) |
| O6 | additive metadata in return JSON (topicCluster, keyTerms, isLighthouse, isDeprecated) | forward-compat |

---

## Net new GATES (event-specific) — for STEP 6 of new writer

| GATE | Frame | Routing |
|---|---|---|
| **A** | Slug must NOT contain year — UNIVERSAL | HOLD on fail |
| **B** | Household-size table — CONDITIONAL on income-gated event (Job Loss, Income Change, family-income Family Change, Lost Other Coverage if income shifts) | HOLD if applies + absent; mark `gates.b: "n/a"` otherwise |
| **C** | ≥3 inline outbound .gov/.edu/kff.org citations | HOLD if 0-1; WARN if 2 |
| **D** | Zero em-dash / en-dash / `--` outside source.name; **EXTRA-STRICT: post-fix sanity grep** | AUTO-FIX, never HOLD |
| **E** | HowTo `steps[].length >= 3` (typical 5-7) AND `urgency.totalTimeISO8601` populated correctly for `urgency.kind` | HOLD if absent OR <3 OR kind/duration mismatch |
| **F** | SEP enrollment window — explicit start + end dates (anchored to event date), not just "60 days" | HOLD if NEITHER present; WARN if only one |
| **G** | comparisonNarrative for Job Loss / Lost Other Coverage / coverage-loss-implicating Family Change (divorce, aging-off) | LOW flag (writer-side concern), never HOLD |
| **H** | Pronoun discipline (paragraphs never open with It/They/This/These/Here/There/Such) | LOW (1-3 violations) / MEDIUM (4+); never HOLD |
| **I** | SE-tax / Schedule SE caveat — N/A for event template | skip (only applies to persona/QA Self-Employment) |

---

## Synthesis decisions

1. **Match the MA-state writer skeleton** (STEP 0-8) since the master brief explicitly endorses it as the cleanest reference pattern.
2. **Inherit Appendix B `keyTerms` shape patch** — embed JSON template literally + "do NOT emit flat array" callout.
3. **Inherit Appendix A drift case studies** in verifier — anchor facts that the persona session caught (HDHP, mileage, ACA OOP, FPL increment) apply only to events that reference those facts (income-gated events). Event-specific drift focus: SEP deadlines, COBRA cost ranges, FPL hh-1 for 2026, Medicare Part B/A 2026 anchors for Age Milestone events.
4. **Event-template-specific anchor: T26 em-dash leak is the headline.** GATE D EXTRA-STRICT — post-fix sanity grep is the defense.
5. **Add new optional top-level fields** (householdSizeTable, documentsNeeded, stateRules, commonDenialReasons, comparisonNarrative). TypeScript silently ignores extras at runtime per events.ts loader. Renderer upgrade is Track A1 forward-compat.
6. **Slug preservation** — never migrate the 3 existing slugs. New slugs follow the same naming convention (event-name only, no year, no "health-insurance" prefix unless the event is specifically about insurance loss — `just-lost-job-health-insurance` is grandfathered; `getting-married` is canonical).

---

## Test-mix collision check (Phase 4)

Existing event slugs:
- `just-lost-job-health-insurance` ✓
- `turning-26-health-insurance` ✓
- `turning-65-medicare` ✓

Planned Phase 4 slugs (per PRD §7):
- `getting-married` — no collision
- `having-a-baby` — no collision
- `moving-states` — no collision
- `divorce` — no collision
- `becoming-a-caregiver` — no collision

All 5 are net-new.

---

## Expected size growth

Old event-writer: ~5,400 words (already 2.5x larger than the persona old-writer baseline of ~880; event-writer is the strongest single template per audit).
Old event-verifier: ~2,400 words.

New event-writer target: ~5,500-6,500 words (layer universal rules + GATES + structured fields on top of existing strong recipe; not a full rewrite the way persona needed).
New event-verifier target: ~4,200-4,800 words (mirror MA-state-verifier with event-specific GATE F/G + extra-strict GATE D).
