# Track C-prime Persona Writer + Verifier — Requirements Matrix

**Phase:** 1 (Inventory)
**Template:** persona (`/for/[persona]`)
**Date:** 2026-05-14
**Master brief:** `specs/TRACK_C_PARALLEL_PLAN.md`
**Per-template PRD:** `specs/track-c-prime/persona-prd.md`
**Recipe anchor:** `FANOUT_FORMULA.md` §3 (universals) + §4.7 (persona, 8/8 Bing-validated dominant shapes — tied for highest in codebase)
**Audit anchor:** `content/fanout/analysis/audit-persona-writer.json` (synonym density is the #1 gap)

This matrix synthesizes every rule the new writer must honor. Categories: formula-universal, formula-recipe, audit-flagged, framework-preserved, hard-contract, slug-rule, link-consumption, strategic-posture, humanizer-voice, cron-pipeline. Resolved conflicts go formula-wins. The 3 most important things for the drafter:

1. **GATE E synonym density is the audit's #1 gap.** Skipping it reproduces the gig-workers failure mode (0 distinct synonyms beyond canonical "gig worker"). Enforce ≥5 distinct synonyms each ≥2 occurrences.
2. **The 9-letter GATE set (A-I) is non-negotiable.** 4 universal + 5 persona-specific. STEP 6 must frame these as HARD REJECTS with "STOP. Read this twice." language.
3. **Form 7206 + Schedule SE caveat is user-financial-harm.** Self-Employment personas MUST state explicitly that the deduction reduces income tax only, NOT self-employment tax. NEVER ship "reduces both."

---

## Requirements (61 total)

### Category: formula-universal (RULES 1-5 from `_universal-rules-block.md`)

| ID | Rule | Source | Enforcement | Conflicts |
|---|---|---|---|---|
| REQ-001 | RULE 1 state-context-everywhere: N/A by default for persona (identity-scoped, not state-scoped); EXCEPTION shape #6 state-stipend section MUST include state name in heading + first paragraph + table caption | `_universal-rules-block.md` §RULE 1; PRD §3 RULE 1 | STEP 5 style rules + GATE H detection | None |
| REQ-002 | RULE 2 eligibility-household-size-table 9 rows: CONDITIONAL for persona — required for income-gated personas (rideshare/freelance/lost-coverage); N/A for pure-status (college students with parent coverage primary; early retirees Medicare-bound) | `_universal-rules-block.md` §RULE 2; PRD §5 GATE B | STEP 6 GATE B; verifier STEP 1C | None |
| REQ-003 | RULE 3 how-to-apply: required. Express within "Marketplace SEP triggers" detailSection OR separate "How to enroll" detailSection. Numbered steps (3-5), HealthCare.gov starting URL, documents-needed checklist, common-denial-reasons callout | `_universal-rules-block.md` §RULE 3; PRD §3 RULE 3 | STEP 3 detailSection plan | None |
| REQ-004 | RULE 4 year-markers: every $/% must have 2026 in same sentence or caption; never bare numbers | `_universal-rules-block.md` §RULE 4; PRD §3 RULE 4 | STEP 5 style rule 4 + 2026 anchor facts list | None |
| REQ-005 | RULE 5 authoritative source narrowing: ≥3 inline outbound .gov/.edu/kff.org citations with domain visible | `_universal-rules-block.md` §RULE 5; PRD §5 GATE C | STEP 6 GATE C; STEP 2 required sources | Old writer said "min 3 sources" but didn't require .gov density — formula wins |

### Category: formula-recipe (FANOUT_FORMULA §4.7 — 8 dominant shapes Bing-validated)

| ID | Rule | Source | Enforcement | Conflicts |
|---|---|---|---|---|
| REQ-006 | Shape #1 Coverage options + year: render as optionsOverview + matching optionDetails (1-to-1 length match) | FANOUT_FORMULA §4.7; audit §4.7.shape_1 | STEP 4 fields + validator STRICT count check | None |
| REQ-007 | Shape #2 PTC eligibility 2026: dedicated detailSection "Premium Tax Credit (PTC) eligibility for [persona] in 2026"; cover MAGI projection for variable-income personas; cliff phasedown phrasing | FANOUT_FORMULA §4.7; audit §4.7.shape_2 | STEP 3 detailSection plan + STEP 6 GATE F | None |
| REQ-008 | Shape #3 1099/freelancer coverage + year: required vocabulary "1099 contractor" + "Section 1095-A"; for Self-Employment + Employment Status personas | FANOUT_FORMULA §4.7; audit §4.7.shape_3 | STEP 2 required vocabulary + GATE E synonym density | gig-workers had 0 mentions; formula wins via GATE E |
| REQ-009 | Shape #4 Form 7206 self-employed health insurance deduction: dedicated detailSection for Self-Employment personas; **CRITICAL Schedule SE caveat** (does NOT reduce SE tax) | FANOUT_FORMULA §4.7; PRD §3 shape #4; CURRENT_STATE_AUDIT §4.6 | STEP 3 + STEP 5 style rule 9 + STEP 6 GATE I | None |
| REQ-010 | Shape #5 HSA/HDHP/FSA fit: dedicated detailSection "HSA and HDHP fit for [persona] in 2026"; HSA vs FSA distinguished explicitly; 2026 limits ($4,400/$8,750) | FANOUT_FORMULA §4.7; audit §4.7.shape_5 | STEP 3 + STEP 6 GATE G | gig-workers had 0 mention — HOLD-worthy under new gate |
| REQ-011 | Shape #6 State-specific stipend: render as detailSection for applicable personas (rideshare → CA Prop 22 + MA Question 3 of 2024; freelance → NY FIFA + WA portable benefits) | FANOUT_FORMULA §4.7; PRD §3 shape #6 | STEP 3 + STEP 6 GATE H (LOW flag never HOLD) | None |
| REQ-012 | Shape #7 Catastrophic plan eligibility: required for under-30 personas (college students); explicit ineligibility-statement for over-30 personas | FANOUT_FORMULA §4.7; PRD §3 shape #7 | STEP 3 detailSection or FAQ + STEP 6 (no specific gate; informational) | None |
| REQ-013 | Shape #8 Marketplace SEP triggers: dedicated detailSection "Marketplace Special Enrollment Period (SEP) triggers for [persona]"; enumerate 4-7 qualifying life events with 60-day windows | FANOUT_FORMULA §4.7; PRD §3 shape #8 | STEP 3 + STEP 5 detailSection pattern | gig-workers had 0 SEP section — required per new writer |

### Category: audit-flagged (highest-ROI fixes)

| ID | Rule | Source | Enforcement | Conflicts |
|---|---|---|---|---|
| REQ-014 | **PE-1 synonym discipline (HIGHEST priority).** ≥5 distinct persona-related synonyms in `keyTerms.en`, each appearing ≥2 times in body content (case-insensitive, word-boundary across personaName+hero+quickAnswer+intros+options+optionDetails+traps+detailSections+faqs.en) | `audit-persona-writer.json` §C.writer_edits_top_3.priority_1; PRD §4 PE-1 + §3 synonym block | STEP 2 synonym block + STEP 6 GATE E + verifier STEP 1B Category G + STEP 1C GATE E | Old writer had ZERO mention of synonyms — formula+audit wins |
| REQ-015 | **PE-2 enumerate 8 dominant §4.7 shapes as required H2 coverage** with explicit "N/A — explicitly stated in body" fallback for genuinely-inapplicable shapes | `audit-persona-writer.json` §C.writer_edits_top_3.priority_2; PRD §4 PE-2 | STEP 3 detailSection plan + STEP 6 GATEs F/G/H/I | Old writer treated detailSections as free-form ≥1 — formula wins |
| REQ-016 | **PE-3 required-vocabulary checklist + persona-specific scam guard.** 8 canonical terms (PTC, HSA, FSA, Form 7206, 1099 contractor, Marketplace SEP, catastrophic plan, Section 1095-A). NEVER recommend health share ministries, short-term limited duration plans, discount plans | `audit-persona-writer.json` §C.writer_edits_top_3.priority_3; PRD §4 PE-3 | STEP 2 vocabulary list + STEP 6 grep + verifier Category F | None |
| REQ-017 | Pronoun discipline (Framework §5.7): no paragraph opens with It/They/This/These/Here/There/Such. The gig-workers `introParagraphs[1]` "This guide covers..." pattern is the canonical failure | `audit-persona-writer.json` writer_critical_gaps; PRD §8 common failure #8 | STEP 5 style rule 7 + verifier STEP 1C (advisory note) | None |
| REQ-018 | **Form 7206 + Schedule SE factual error guard.** "Reduces both income tax and self-employment tax" is FACTUALLY WRONG — HOLD-worthy financial-harm error | `audit-persona-writer.json` writer_strengths (existing caveat) + PRD §6 GATE I | STEP 5 style rule 9 + STEP 6 GATE I + verifier Category B + GATE I | None |
| REQ-019 | ACA cliff phrasing nuance: never write "below 400% FPL = subsidies" as binary; use "subsidies phase down approaching 400% FPL and stop at 400%" | `audit-persona-writer.json` writer_strengths (preserve) + PRD §5 RULE 4 | STEP 5 + verifier Category B | None |
| REQ-020 | meta.description.en ≤160 chars (gig-workers.bak shipped at 181 — repeats fail validator) | `audit-persona-writer.json` page_audits.gig_workers.other_findings | STEP 4 field checklist + validator | None |
| REQ-021 | introParagraphs[0] MUST be persona-anchored, NOT "This guide covers..." | `audit-persona-writer.json` page_audits.gig_workers.other_findings; PRD §8 #8 | STEP 4 field checklist + STEP 5 style rule 7 | None |
| REQ-022 | FAQ answer length 80-150 words (framework §4.5 — overrode old writer's 40-100 spec) | CURRENT_STATE_AUDIT pattern #15; gold-standard self-employed runs 80-130 | STEP 5 style rule 10 (FAQ answers tighter) | Old writer said 40-100 — formula wins |
| REQ-023 | Body paragraph length 120-220 words (target 150-300 per framework; gold-standard self-employed achieves) | CURRENT_STATE_AUDIT pattern #1 | STEP 5 style rule 10 | None |
| REQ-024 | Em-dash sweep on regen (self-employed.json has 8-10 em-dashes per audit — auto-fix on regen) | `audit-persona-writer.json` page_audits.self_employed.other_findings | STEP 6 GATE D + verifier GATE D auto-fix | None |

### Category: framework-preserved (existing strengths to keep)

| ID | Rule | Source | Enforcement | Conflicts |
|---|---|---|---|---|
| REQ-025 | 2026 anchor facts (corrected during Phase 4 anchor-fact patch): FPL hh-1 $15,960; 138% FPL $22,025; 400% FPL $63,840; ACA Marketplace OOP max **$10,150/$20,300** (HHS Final NBPP for 2026; corrected from initial PRD's stale $9,200/$18,400); HSA HDHP minimum deductible **$1,700/$3,400** (Rev. Proc. 2025-19; corrected from initial PRD's stale $1,650/$3,300); HDHP OOP max **$8,500/$17,000**; HSA contribution $4,400/$8,750 + $1,000 catch-up; IRS mileage $0.70/mi | Rev. Proc. 2025-19 (May 2025) + HHS Final NBPP for 2026 (Jan 2025); patched during Phase 4 freelance writer's web research | STEP 5 anchor facts list (post-patch) | Initial PRD had stale 2025 values for HDHP min ded + ACA OOP — corrected mid-Phase-4 once freelance writer flagged via WebSearch |
| REQ-026 | 1099-K threshold 2026: $5,000 (post-IRS phase-in; was $20,000 pre-2024) | IRS 2026 guidance | STEP 5 + verifier Category A | New — was not in old writer |
| REQ-027 | ACA subsidy cliff BACK for 2026 (enhanced PTCs from ARPA/IRA expired Jan 1, 2026) | Old writer + framework | STEP 5 anchor + REQ-019 | None |
| REQ-028 | IRA signed August 16, **2022** (NOT 2023); insulin cap effective 2023 at $35/mo | Verifier Category C | STEP 5 + verifier | None |
| REQ-029 | Section 2714 ACA dependent age-out at 26 (regardless of student/marital/financial status) | Verifier Category C | STEP 5 anchor (for college-students persona) | None |
| REQ-030 | Inflation Reduction Act (IRA) signed 2022 (NOT 2023); ARPA 2021; ACA 2010 | Verifier Category C | Verifier Category C | None |

### Category: hard-contract (cannot violate)

| ID | Rule | Source | Enforcement | Conflicts |
|---|---|---|---|---|
| REQ-031 | JSON return shape from STEP 8: `{slug, status, ...}` parseable by cron; preserve existing fields, ADD additive (topicCluster, keyTerms, isLighthouse, isDeprecated, gates, synonym_distinct_count, gapsFlagged) | PRD §2 hard contract 1 | STEP 8 return format | None |
| REQ-032 | Atomic write pattern: `<slug>.tmp.json` first → validate JSON parses → rename to `<slug>.json` | PRD §2 hard contract 2 | STEP 1 + STEP 7 | None |
| REQ-033 | `## STEP N` numbered headings (cron may parse for logging) | PRD §2 hard contract 3 | All STEPs | None |
| REQ-034 | Schema interface conformance — extras silently ignored at runtime; missing required crash the build | PRD §2 hard contract 4 | STEP 4 26-check + validator | None |
| REQ-035 | FAQ question/answer are FLAT STRINGS, not LocalizedString objects (most common drafter mistake) | PRD §2 hard contract 5 + validator | STEP 4 + STEP 6 26-check #20 | None |
| REQ-036 | Spanish parity — every LocalizedString needs `en` AND `es` (idiomatic, not literal) | PRD §2 hard contract 6 + validator | STEP 5 Spanish translation quality + validator | None |
| REQ-037 | No em-dash `—` (U+2014), no en-dash `–`, no double-hyphen `--` anywhere | PRD §2 hard contract 7 + GATE D | STEP 5 style rule 1 + STEP 6 GATE D + verifier GATE D auto-fix | None |
| REQ-038 | **`optionDetails.length === optionsOverview.rows.length` exactly** — 1-to-1 correspondence; validator HARD-rejects mismatch | PRD §2 hard contract 8 + validator | STEP 4 field checklist + STEP 6 26-check #17 | Most common persona-specific drafter mistake — STRICT count check at STEP 6 |
| REQ-039 | `category` LOCKED enum (6 exact strings); `ctaTarget` LOCKED enum (2 exact strings) | PRD §2 hard contract 9 + validator | STEP 1 enum list + STEP 4 26-check | None |

### Category: slug-rule

| ID | Rule | Source | Enforcement | Conflicts |
|---|---|---|---|---|
| REQ-040 | GATE A: slug NO YEAR (regex `\b(19|20)\d{2}\b`) | PRD §5 GATE A; B1 lessons | STEP 6 GATE A + verifier STEP 1C GATE A | None |
| REQ-041 | Persona slugs are pure persona names — no "health-insurance" or "coverage" suffixes (route prefix `/for/` encodes that) | PRD §6 GATE A worked examples | STEP 1 SLUG derivation + STEP 6 | None |
| REQ-042 | NEVER migrate existing slugs (URL_SLUG_FRAMEWORK §3) — apply new URL rules to new content only | URL_SLUG_FRAMEWORK; memory feedback_never_migrate_slugs | STEP 1 existence check (don't overwrite verified slug) | None |

### Category: link-consumption (link-index.json + topicCluster + keyTerms)

| ID | Rule | Source | Enforcement | Conflicts |
|---|---|---|---|---|
| REQ-043 | `topicCluster: "persona"` (lowercase kebab-case); required by content-quality.js | LINK_TARGET_MANIFEST §1; content-quality.js | STEP 4 additive fields | None |
| REQ-044 | `keyTerms` as `{en: [...], es: [...]}` OBJECT (NOT flat array). Validator + link-index builder both expect this shape | LINK_TARGET_MANIFEST §1; PRD §9 mandatory patches | STEP 4 additive fields + STEP 6 26-check #25 | MI + OH MA-state writers emitted flat arrays — pattern explicitly banned per Track C-prime mandatory patches |
| REQ-045 | `isLighthouse: false`, `isDeprecated: false` | LINK_TARGET_MANIFEST §1 | STEP 4 additive fields | None |
| REQ-046 | Read link-index.json `byPhrase.en/es` at STEP 0; body phrases matching these keys auto-route to lighthouse pages | LINK_TARGET_MANIFEST §1 | STEP 0 + STEP 5 link consumption | None |
| REQ-047 | Self-link guard: never link a persona page to itself | LINK_TARGET_MANIFEST §1 | STEP 5 | None |
| REQ-048 | Every persona page MUST include ≥1 link to `/event/<slug>` or `/qa/<slug>` (anti-duplication; persona = identity; event = moment; QA = question) | Old writer §STEP 3 + PRD §4 (preserve strength) | STEP 4 relatedLinks check + STEP 6 26-check #22 | None |

### Category: strategic-posture

| ID | Rule | Source | Enforcement | Conflicts |
|---|---|---|---|---|
| REQ-049 | Default toward auto-ship (~95/~4/~1 distribution). HOLD only on genuine breakage: GATE A year-in-slug, GATE C 0-1 .gov, GATE E synonym <3, GATE F PTC absent for marketplace persona, GATE I Form 7206 factual error | Master brief §3.5 | STEP 6 + STEP 8 gates routing | None |
| REQ-050 | Persona-specific scam guard: never recommend health share ministries, short-term limited duration plans, discount plans | `audit-persona-writer.json` PE-3 | STEP 5 NEVER list #6 + verifier Category F | None |
| REQ-051 | Queue consolidation guard at STEP 1 pre-flight: refuse if slug synonym-matches existing verified persona within synonym whitelist (forward-looking — not enforced strictly Phase 4 since 5 test slugs are net-new + 2 are pre-queued) | `audit-persona-writer.json` §C.queue_consolidation_finding | STEP 1 existence check | Audit recommendation; defer strict enforcement to Track E |

### Category: humanizer-voice

| ID | Rule | Source | Enforcement | Conflicts |
|---|---|---|---|---|
| REQ-052 | No filler phrases: "navigating the complex world", "It's important to understand", "Great question", "let's dive in", "the world of [anything]", "in today's world", "explore the options" | Old writer style rule + framework humanizer | STEP 5 style rule 2 | None |
| REQ-053 | Lead with concrete numbers in hero, quickAnswer, FAQs; year-anchored + source-attributed in same sentence | Old writer style rule 3 | STEP 5 style rule 3 | None |
| REQ-054 | Real facts only — no fabricated statute names, IRS form numbers, state programs, income thresholds | Old writer style rule 5 + framework | STEP 5 style rule 5 + STEP 2 sources | None |
| REQ-055 | No markdown bold (`**text**`) in JSON content (renderer outputs `<p>{text}</p>` and would render literal asterisks) | Old writer style rule 11 (preserve) | STEP 5 style rule 11 | None |

### Category: cron-pipeline (Stage 1 cron + writer-spawn payload)

| ID | Rule | Source | Enforcement | Conflicts |
|---|---|---|---|---|
| REQ-056 | INPUTS: PERSONA_NAME, SLUG, CATEGORY, TOPIC, MEDICAL_SPECIALTY, CTA_TARGET, NOTES + optional TOPIC_CLUSTER / FORMULA_RECIPE / UNIVERSAL_RULES | PRD §1 INPUTS | STEP 0 INPUTS section | None |
| REQ-057 | Path portability: `$HOME/clawd/...` not hardcoded `/Users/frankthebot/...` or `/Users/jacobposner/...` | B1 lesson 5; master brief Phase 4.5 patch 1 | All file references | Old writer hardcoded `/Users/frankthebot/` — formula + portability wins |
| REQ-058 | maxTurns: 60 (writer); maxTurns: 50 (verifier) — sufficient for 8-shape coverage + research without runaway | YAML frontmatter | YAML | None |
| REQ-059 | tools: writer = Read, Write, Edit, Bash, WebSearch, WebFetch, Glob, Grep; verifier = Read, Edit, WebSearch, WebFetch, Bash, Grep | YAML | YAML | None |
| REQ-060 | model: sonnet (both writer + verifier; opus reserved for higher-stakes orchestration) | YAML | YAML | None |
| REQ-061 | background: true; permissionMode: bypassPermissions (consistent with other Track C-prime agents) | YAML | YAML | None |

---

## Resolved conflicts (formula-wins direction)

| # | Old writer rule | New writer rule | Resolution |
|---|---|---|---|
| 1 | Old: ZERO synonym discipline | New: ≥5 distinct synonyms, each ≥2 occurrences, GATE E enforced | FORMULA WINS (PE-1 + audit's #1 gap) |
| 2 | Old: `detailSections` min 2, free-form | New: min 2 strict count; enumerate 8 §4.7 dominant shapes as required H2 coverage | FORMULA WINS (PE-2) |
| 3 | Old: FAQ answer 40-100 words | New: FAQ answer 80-150 words | FORMULA WINS (framework §4.5 + gold-standard alignment) |
| 4 | Old: paragraph length not specified (pages run 50-110 words) | New: 120-220 words per body paragraph; 80-150 per FAQ answer | FORMULA WINS (framework pattern #1) |
| 5 | Old: hardcoded `/Users/frankthebot/...` paths | New: `$HOME/clawd/...` path portability | PORTABILITY WINS (B1 lesson 5) |
| 6 | Old: no GATE framing; STEP 5 self-validation as advisory checklist | New: STEP 6 with 9 HARD-REJECT GATES + "STOP. Read this twice." | B1 LESSON 1 WINS (gates must be REJECT-framed) |
| 7 | Old: 26-check field validation only | New: 26-check + STRICT count check (optionDetails === optionsOverview.rows; detailSections >= 2; synonym distinct count) | LOAD-TEST PATCH WINS (writer-leaks pattern) |
| 8 | Old: returned JSON `{slug, status, word_count, option_details, traps_rows, detail_sections, faq_count, cta_target}` | New: same + adds gates object + synonym_distinct_count + topicCluster + keyTerms + isLighthouse + isDeprecated + gapsFlagged | ADDITIVE-FORWARD-COMPAT WINS |

No unresolved conflicts. No flagged ambiguity requiring human judgment.

---

## Per-category counts

- formula-universal: 5
- formula-recipe: 8
- audit-flagged: 11
- framework-preserved: 6
- hard-contract: 9
- slug-rule: 3
- link-consumption: 6
- strategic-posture: 3
- humanizer-voice: 4
- cron-pipeline: 6

**Total: 61 requirements.**

## Gaps in source docs

- **Persona schema does NOT yet include** `householdSizeTable` or `howToApply` as dedicated fields (audit recommended adding both). Workaround: emit a `detailSection` with `table` substructure for household-size data when income-gated; emit a `detailSection` with `list` substructure for how-to-apply steps. Track A1 / Track E should add these as first-class schema fields later.
- **Persona schema does NOT yet include** `topicCluster`, `keyTerms`, `isLighthouse`, `isDeprecated` (Track C-prime additive fields). Workaround: emit them as top-level keys anyway — JSON.parse silently ignores extras; the link-index builder + content-quality.js validator pick them up. Adding to the TypeScript `Persona` interface is a separate Track A1 task.
- **CURRENT_STATE_AUDIT.md** wasn't fully read in this matrix; we relied on the audit-persona-writer.json synthesis which references it.
