# Verifier A — Matrix Compliance Audit

**Date:** 2026-05-14
**Writer audited:** `.claude/agents/coveredusa-article-writer.md`
**Matrix:** `projects/covered-usa/content/fanout/analysis/b1-requirements-matrix.md` (62 requirements)

**Total requirements checked:** 62
**PASS:** 49
**PARTIAL:** 9
**FAIL:** 4

---

## Per-requirement scoring

### REQ-001 — STATE-CONTEXT-EVERYWHERE — PASS
- Enforced in: STEP 0 (load `_universal-rules-block.md`), STEP 1 (state verification + brand check), STEP 5 (RULE 1 verbatim including bare-$ ban), STEP 6 check 12 (state-context discipline sweep).
- Notes: Brand list is duplicated in STEP 1 and STEP 5 RULE 1, both referring to the universal-rules block; consistent.

### REQ-002 — ELIGIBILITY-HOUSEHOLD-SIZE-TABLE — PASS
- Enforced in: STEP 3 "Required elements" (lists income-gated topics + 1-8 + Each-additional + year-tagged caption), STEP 5 RULE 2, STEP 6 check 13 (presence check).
- Notes: Income-gated topic list matches matrix scope (Medicaid / ACA / FPL / SNAP / WIC / persona-income / charity care).

### REQ-003 — HOW-TO-APPLY-SECTION — PASS
- Enforced in: STEP 3 "Required elements" (3-7 numbered steps), STEP 5 RULE 3 (all 5 sub-fields explicit), STEP 6 check 15 (validates all 5 sub-fields), CRITICAL BOUNDARIES #5 ("NEVER skip").
- Notes: All 5 sub-fields (enrollment dates, 3-7 steps, .gov URL, 4-8 docs, 3-5 denial reasons) called out by name in check 15.

### REQ-004 — YEAR-MARKERS-AND-YEAR-ANCHORING — PASS
- Enforced in: STEP 5 RULE 4, STEP 6 checks 3 + 4 (year-in-metadata + first-paragraph + per-claim sweep), CRITICAL BOUNDARY #3.
- Notes: Bare `$` and `%` ban is explicit at sentence/caption granularity.

### REQ-005 — AUTHORITATIVE-SOURCE-NARROWING — PASS
- Enforced in: STEP 2 (research + required source domains by topic), STEP 5 RULE 5, STEP 6 checks 18 + 23.
- Notes: Domains list (medicare.gov / cms.gov / medicaid.gov / healthcare.gov / kff.org / aspe.hhs.gov / irs.gov / fda.gov) matches matrix.

### REQ-006 — FPL-SUPER-SHAPE-H2-LIST — PASS
- Enforced in: STEP 3 Branch A (all 11 H2s laid out in verbatim order), STEP 6 (implicit via the H2 list — though check 14 only validates expansion table, not the full 11-H2 sequence).
- Notes: Order and naming match §4.9 exactly (FPL chart [year], By household size, By percentage thresholds, FPL × Medicaid, FPL × ACA subsidies, FPL × CHIP, FPL × WIC, FPL × SNAP, AK+HI adjustments, expansion table, How to apply). Slight gap: STEP 6 lacks an explicit "11 H2s present in order" check — relies on writer following STEP 3 plan honestly.

### REQ-007 — REQUIRED-FPL-CHART-TABLE — PARTIAL
- Issue: STEP 3 Branch A H2 #1 names "FPL chart [year]" with the 1-8 × 6 percentage threshold structure, but STEP 6 has no dedicated check that the rendered chart actually has ≥9 rows × ≥6 percentage columns + year caption. Check 13 covers a generic household-size table; check 14 covers the expansion table. The FPL canonical chart is implicitly covered but not separately validated.
- Recommended fix: Add a STEP 6 sub-check for FPL-recipe pages: "FPL canonical chart present with rows for household sizes 1-8 (+ Each additional), columns for 100/138/150/200/250/400%, year-tagged caption."

### REQ-008 — STATE-BY-STATE-EXPANSION-TABLE — PASS
- Enforced in: STEP 3 Branch A H2 #10, STEP 3 "Required elements" universal note, STEP 6 check 14.
- Notes: "38 expansion vs 12 non-expansion states (list non-expansion explicitly)" matches matrix.

### REQ-009 — REQUIRED-FAQ-TOPICS-FPL — FAIL
- Issue: The matrix mandates that for FPL-shape posts, FAQ MUST cover (a) how FPL is calculated, (b) Alaska/Hawaii differences, (c) percentage threshold meaning. Writer prompt mentions "6-8 FAQ items" universally but never specifies these three required FPL FAQ anchor topics. STEP 6 check 16 only counts FAQs (6-8) — does not check FPL-required-topic coverage.
- Recommended fix: Add to STEP 3 Branch A: "Required FAQ topics for FPL-shape: (1) how FPL is calculated, (2) Alaska/Hawaii differences, (3) percentage threshold meaning." Add corresponding STEP 6 sub-check.

### REQ-010 — EXTERNAL-URL-DENSITY-EVERY-NUMERIC-CLAIM — PARTIAL
- Issue: REQ-005 floor (≥3) is enforced, but the matrix's per-claim discipline ("every numeric claim gets an inline .gov citation, never as plain prose") is only stated in STEP 3 "Required elements" ("every numeric claim gets one") and STEP 5 RULE 5. STEP 6 check 18 counts the floor but does not validate per-claim coverage.
- Recommended fix: Add STEP 6 sub-check: "For every `\$[\d,]+` and `\d+%` token in body, verify a markdown link to a .gov/.edu/kff.org domain appears in the same sentence; flag plain-text 'according to ssa.gov' style references."

### REQ-011 — HREFLANG-IN-METADATA — FAIL
- Issue: Writer prompt has zero mention of `hreflang`. STEP 4 frontmatter schema does not include hreflang fields or alternate-locale URL declarations. STEP 7 explicitly says "Spanish translation is handled by a separate cron — not this writer's responsibility" and writer only saves the EN file. STEP 5 has no hreflang validation. The matrix says "frontmatter and the rendered page metadata must declare the alternate locale URL."
- Recommended fix: Either (a) add `hreflang` / alternate-URL fields to frontmatter schema in STEP 4 with a STEP 6 validation check, OR (b) explicitly note that hreflang is handled by the page template's `generateMetadata` plus the en/es file-pair convention, and add a STEP 6 check that confirms the slug used will resolve a Spanish counterpart. Currently the writer produces no signal that the en/es pair exists.

### REQ-012 — TOPIC-CLUSTER-AND-KEY-TERMS-IN-FRONTMATTER — PASS
- Enforced in: STEP 4 frontmatter schema (topicCluster, keyTerms.en, keyTerms.es, isLighthouse, isDeprecated all present), STEP 6 check 9 validates all fields.
- Notes: kebab-case requirement explicit; arrays of quoted strings explicit.

### REQ-013 — NO-YEAR-IN-SLUG — PASS
- Enforced in: STEP 4 slug rules (explicit "NO YEAR IN SLUG" + regex `\b(19|20)\d{2}\b` must NOT match), STEP 6 check 8, CRITICAL BOUNDARY #2.
- Notes: Strongly enforced with regex.

### REQ-014 — TARGET-FIELD-IN-FRONTMATTER — PASS
- Enforced in: STEP 4 frontmatter rules, STEP 6 check 9 (target ∈ {"screener", "analyzer"}).
- Notes: Default-to-screener-when-blank logic preserved.

### REQ-015 — DATEMODIFIED-CONSISTENCY — PARTIAL
- Issue: STEP 4 frontmatter schema includes `date` but NOT `lastUpdated`. The matrix says "if updating an existing post, also emit `lastUpdated` matching the edit date." Writer prompt has no branch on "is this an update vs net-new" and no `lastUpdated` field documented.
- Recommended fix: Add to STEP 4: "If updating an existing slug (matched in REQ-043 search), emit `lastUpdated: '<today>'` field. New posts only emit `date`."

### REQ-016 — EM-DASH-PURGE-IN-SELF-VALIDATION — PASS
- Enforced in: STEP 5 Style rules ("NO em-dashes (`—`). Anywhere"), STEP 6 checks 1 + 2 (em-dash count must be 0; en-dash digit-only enforcement), CRITICAL BOUNDARY #4.
- Notes: Explicit U+2014 / U+2013 codepoint references.

### REQ-017 — YEAR-DRIFT-DETECTION — PASS
- Enforced in: STEP 2 research note (cross-reference 2025 vs 2026 figures explicitly), STEP 6 check 5 (with the 6 specific known-prior-year traps: 2025 FPL $15,650 / $32,150, 2026 FPL $15,950 / $32,950, 2025 Part B $185, 2026 Part B $283), CRITICAL BOUNDARY #11.
- Notes: This is well-enforced — the explicit known traps are a strong signal. Subtle risk: the trap list will go stale annually; needs a maintenance note.

### REQ-018 — DROP-SOURCE-CONDITIONAL-FAQ-DENSITY — PASS
- Enforced in: STEP 3 "Required elements" ("6-8 FAQ items for benefits/program/eligibility topics — universal, not SOURCE-conditional"), STEP 6 check 16 ("universal, not SOURCE-conditional"), CRITICAL BOUNDARY #7.
- Notes: SOURCE field is explicitly noted as "no longer used for branching" in INPUTS — clean removal.

### REQ-019 — TARGET-ANALYZER-PRESERVES-GOV-CITATION-DENSITY — PASS
- Enforced in: STEP 5 CTA section ("BUT outbound `.gov` citations remain mandatory… The 'no /screener links' carveout applies ONLY to internal /screener routing"), STEP 6 check 24 (validates .gov + analyzer-link separately).
- Notes: Explicit carveout language is exactly what matrix Conflict #3 requires.

### REQ-020 — CTA-MENTIONS-BILL-ANALYZER-BY-NAME-WHEN-TARGET-ANALYZER — PASS
- Enforced in: STEP 5 CTA section (analyzer requires Bill Analyzer mention ≥1, ideally twice; both CTA strings spelled out verbatim with em-dash purge applied to screener CTA), STEP 6 check 24.
- Notes: Screener CTA correctly uses period not em-dash ("Check your eligibility now at CoveredUSA. It takes 2 minutes.") — Conflict #6 resolution honored.

### REQ-021 — PARAGRAPH-LENGTH-150-300 — PASS
- Enforced in: STEP 5 Structural rules (150-300 target; FAQ 80-150; warn <80 or >400; fail <50 or >500), STEP 6 check 20 (matches matrix ranges exactly).
- Notes: Conflict #1 resolution applied verbatim.

### REQ-022 — META-TITLE-CAP — PASS
- Enforced in: STEP 4 frontmatter (max 70 chars), STEP 6 check 6.

### REQ-023 — META-DESCRIPTION-CAP — PASS
- Enforced in: STEP 4 (writer cap 155 with buffer note), STEP 6 check 7 (≤155).
- Notes: Slight discrepancy with matrix — matrix says writer-cap 155 but validator hard-fail 160. Writer's check 7 is 155, not 160. This is stricter than matrix mandates, which is acceptable per Conflict #6 resolution (no real conflict).

### REQ-024 — STRUCTURAL-PROPORTION-25-35 — PASS
- Enforced in: STEP 5 Structural rules, STEP 6 check 22 (warn outside [0.20, 0.40]; fail outside [0.10, 0.50]).

### REQ-025 — SOURCE-COUNT-MIN-3 — PASS
- Enforced in: STEP 2 ("at least 3 distinct primary sources"), STEP 6 checks 18 + 23.

### REQ-026 — SCHEMA-ARTICLE-PLUS-MEDICALWEBPAGE — PASS
- Enforced in: Implicit — STEP 4 emits clean frontmatter (title, description, date, slug, keywords, target, topicCluster, keyTerms) sufficient for the page-template schema graph. Writer doesn't hand-roll schema, matching matrix expectation.

### REQ-027 — SCHEMA-FAQPAGE-AUTO-EXTRACTED — PASS
- Enforced in: STEP 3 "Required elements" (explicit `## Frequently Asked Questions` + `### Question?` pattern noted), STEP 6 check 16 reiterates the pattern.

### REQ-028 — SCHEMA-HOWTO-WHEN-HOW-TO-APPLY-PRESENT — PASS
- Enforced in: STEP 3 "Required elements" ("verb-led step titles for HowTo schema auto-extraction"), STEP 5 RULE 3 #2 ("verb-led titles for HowTo schema").

### REQ-029 — AUTHOR-BYLINE — PASS
- Enforced in: CRITICAL BOUNDARY #10 ("NEVER override the author byline (Jacob Posner, Founder & Editor)").

### REQ-030 — DIRECT-NUMERIC-ANSWER-FIRST-50-WORDS — PASS
- Enforced in: STEP 3 "Required elements" ("Direct numeric answer in first 50 words of body — unhedged ($1,328, not 'around $1,300')"), STEP 5 Structural rules (with 80-word allowance for non-numeric Q&A), STEP 6 check 10.

### REQ-031 — NAMED-ENTITY-IN-PARAGRAPH-OPENING — PASS
- Enforced in: STEP 5 Structural rules ("First sentence of each paragraph MUST explicitly name the primary entity"), STEP 6 checks 11 + 26.
- Notes: Sweep list of pronouns ("It," "The same," "These," "This," "There," "Here") is explicit.

### REQ-032 — STRONG-DENSITY-5-10 — PASS
- Enforced in: STEP 5 Structural rules, STEP 6 check 21.

### REQ-033 — JSON-RETURN-SHAPE — PASS
- Enforced in: STEP 8 (success shape includes slug, word_count, status, title, topicCluster, keyTerms, gapsFlagged — additive per Conflict #6 resolution), CRITICAL BOUNDARY #12.
- Notes: Backward-compatible additive shape exactly matches Conflict #6 resolution.

### REQ-034 — ATOMIC-WRITE-AFTER-VALIDATION — PASS
- Enforced in: STEP 6 ("BLOCKER for STEP 7… Do NOT save to disk until ALL of these pass"), STEP 7 ("Save atomically — if any writing operation fails, do not leave a partial file"), CRITICAL BOUNDARY #9.

### REQ-035 — EN-PLUS-ES-FILE-PAIR — FAIL
- Issue: Matrix mandates "Every blog post produces TWO files: English at `projects/covered-usa/content/blog/[slug].md` and Spanish at the corresponding Spanish path… Both files must save atomically; if either fails, neither saves." Writer prompt explicitly says the OPPOSITE: STEP 7 says "Spanish translation is handled by a separate cron — not this writer's responsibility." Only the EN file is saved. There is no parity check.
- Recommended fix: This is a substantive disagreement between writer and matrix. Either (a) the writer must produce both files atomically (matching matrix REQ-035 + REQ-011 hreflang), OR (b) the matrix must be updated to reflect the new pipeline split where translation is downstream. **Flag for human decision before Phase 4.** Per the matrix language and TRACK_B1_PLAN.md §4 critical boundary 8 ("NEVER skip the en + es translation pair"), the matrix language is normative. If translation has been pipelined to a separate cron, the matrix and Track B1 plan need an explicit amendment.

### REQ-036 — STEP-N-NUMBERED-STRUCTURE — PASS
- Enforced in: Writer uses `## STEP 0` through `## STEP 8` headers (matrix said "STEP 0 through STEP 6 per the plan's skeleton" but writer extends to STEP 8 — additive, no break to cron parsing as long as cron searches for `## STEP N` prefix).
- Notes: Slight mismatch with matrix's "STEP 0 through STEP 6" wording; if cron's progress logging is hardcoded to expect exactly 7 steps (0-6), the extra STEP 7 + STEP 8 headers may not break parsing but may not log either. Minor — flag for cron-side check.

### REQ-037 — STAGE-1-CRON-PAYLOAD-FIELDS — PASS
- Enforced in: INPUTS section consumes all 11 fields (KEYWORD, TITLE, STATE, PROGRAM, ROW_NUMBER, SHEET_ID, SOURCE, TARGET, TOPIC_CLUSTER, FORMULA_RECIPE, UNIVERSAL_RULES).

### REQ-038 — FRONTMATTER-QUOTING-RULES — PASS
- Enforced in: STEP 4 ("ALL frontmatter values MUST be quoted strings. Date MUST be quoted. Keywords + keyTerms.en + keyTerms.es MUST be YAML arrays of quoted strings"), STEP 6 check 9.

### REQ-039 — SLUG-MAX-60-CHARS — PASS
- Enforced in: STEP 4, STEP 6 check 8.

### REQ-040 — SLUG-KEBAB-CASE-ONLY — PASS
- Enforced in: STEP 4 (`[a-z0-9-]` only, no uppercase, no underscores, no leading/trailing/consecutive hyphens), STEP 6 check 8 (regex `^[a-z0-9-]+$`).

### REQ-041 — SLUG-NO-LEADING-STOP-WORDS — PASS
- Enforced in: STEP 4 (lists the 8 stop words: `the`, `a`, `an`, `for`, `is`, `of`, `to`, `with`), STEP 6 check 8.

### REQ-042 — SLUG-PRIMARY-ENTITY-FIRST — PASS
- Enforced in: STEP 4 ("Primary entity first (`/blog/medicare-part-b-cost`, not `/blog/the-cost-of-medicare-part-b`)").

### REQ-043 — NEVER-MIGRATE-EXISTING-SLUGS — PARTIAL
- Issue: STEP 4 says "Search `content/blog/*.md` for any synonym before creating a new slug; if found, write to that existing slug." CRITICAL BOUNDARY #1 reiterates. However, STEP 6 has no validation that the writer actually performed this search. The check is process-only, not output-validated. Matrix says "STEP 5 (verify slug is either net-new or matches an existing one being updated)."
- Recommended fix: Add STEP 6 check: "Confirm a Glob/Grep over `content/blog/*.md` was run for slug-synonym candidates before finalizing slug. If matching synonyms were found, justify why the proposed slug is net-new vs an update."

### REQ-044 — LOAD-LINK-INDEX-AT-WRITE-TIME — PASS
- Enforced in: STEP 0 #2 (Read `content/link-index.json`; fallback to hardcoded lighthouse list if missing; flag in return JSON).

### REQ-045 — INLINE-BODY-LINKS-3-TO-5 — PASS
- Enforced in: STEP 5 Internal linking (3-5, cap at 5, natural placement trumps count), STEP 6 check 19.

### REQ-046 — NEVER-SELF-LINK — PASS
- Enforced in: STEP 5 ("Never self-link — exclude the slug being written from candidates"), STEP 6 check 19 (validates).

### REQ-047 — NEVER-LINK-A-PHRASE-INSIDE-AN-EXISTING-LINK — PASS
- Enforced in: STEP 5 Internal linking ("Never link a phrase already inside an existing link").

### REQ-048 — NEVER-LINK-IN-HEADINGS — PASS
- Enforced in: STEP 5 ("Never link inside H1, H2, or H3 headings. Body prose, table cells, FAQ answers only"), STEP 6 check 19.

### REQ-049 — LOOKUP-CONTENT-BIAS — PARTIAL
- Issue: Matrix calls this strategic-posture / writer guidance. Writer prompt's STEP 3 covers FPL super-shape mechanically (lookup-heavy by default) but does NOT include explicit "bias toward LOOKUP shape" guidance language at the planning step. Soft guidance is implicit in the recipe, not stated as a strategic bias.
- Recommended fix: Add to STEP 3 (or STEP 2 research): "Bias content toward LOOKUP shape (tables, charts, state-specific lookups, household-size matrices, percentage thresholds). De-prioritize concept-only deep-dives — Bing has thin demand."

### REQ-050 — VARIANT-WEIGHTING-SPEC-EQUIV-CANON — PASS
- Enforced in: STEP 3 "Variant weighting" section explicitly lists HIGH (Specification, Equivalent, Canonicalization), MEDIUM (Entailment, Clarification), LOW (Generalization, Translation, Follow-up), with concrete tactic for canonical + acronym + colloquial coverage.

### REQ-051 — SOFT-RULES-COMPARISON-DEMOGRAPHIC-TABLE-PHRASING — PASS
- Enforced in: STEP 3 "Soft rules" section covers all three (comparison framing, demographic specificity, table/chart-shape phrasing) with the matrix's exact §3.5/§3.9/§3.10 references.

### REQ-052 — NO-EM-DASHES — PASS
- Enforced in: STEP 5 Style rules + STEP 6 check 1 (overlaps REQ-016).

### REQ-053 — NO-FILLER-PHRASES — PASS
- Enforced in: STEP 5 Style rules (lists "It's important to note", "In today's world", "Great question", "Needless to say", "At the end of the day"), STEP 6 check 25.

### REQ-054 — NO-CORPORATE-VERBS — PASS
- Enforced in: STEP 5 Style rules (lists "leverage", "utilize", "facilitate", "synergize", "operationalize"), STEP 6 check 25.
- Notes: Matrix lists "optimize (when 'improve' works)" as banned; writer omits "optimize". Minor — could add for full coverage.

### REQ-055 — NO-TRIPLE-STACKS — PASS
- Enforced in: STEP 5 Style rules ("Only use when items are genuinely distinct").

### REQ-056 — NO-SIGNIFICANCE-INFLATION — PASS
- Enforced in: STEP 5 Style rules (lists "groundbreaking", "revolutionary", "game-changing", "transformative", "unprecedented"), STEP 6 check 25.
- Notes: Matrix also lists "critical (used as filler intensifier)" — writer omits this. Minor gap.

### REQ-057 — NO-SMOOTH-TRANSITIONS — PASS
- Enforced in: STEP 5 Style rules (lists "Furthermore", "Moreover", "Additionally", "In conclusion", "To summarize").

### REQ-058 — CONVERSATIONAL-SENTENCE-LENGTH-VARIATION — PASS
- Enforced in: STEP 5 Style rules ("Vary sentence length — mix short punchy sentences with longer explanatory ones (avoiding the AI all-uniform-medium-length tell)").

### REQ-059 — CONSUME-TOPIC-CLUSTER-FROM-PAYLOAD — PASS
- Enforced in: INPUTS (TOPIC_CLUSTER documented), STEP 0 #4 (confirm via fallback routing map matching matrix verbatim), STEP 4 (emits topicCluster in frontmatter).

### REQ-060 — CONSUME-FORMULA-RECIPE-FROM-PAYLOAD — PASS
- Enforced in: INPUTS (FORMULA_RECIPE documented; default to §4.9 daily-blog), STEP 0 #5, STEP 3 branches on FORMULA_RECIPE.

### REQ-061 — CONSUME-UNIVERSAL-RULES-FROM-PAYLOAD — PASS
- Enforced in: INPUTS (UNIVERSAL_RULES instruction documented), STEP 0 #1 (Read the universal rules block).

### REQ-062 — DO-NOT-EDIT-UNIVERSAL-RULES-BLOCK — PASS
- Enforced in: CRITICAL BOUNDARY #8 ("NEVER edit `_universal-rules-block.md`. That file is shared infrastructure for other writer agents").

---

## Internal contradictions

1. **STEP 7 explicitly disclaims Spanish file production while REQ-035 mandates it.** Writer says "Spanish translation is handled by a separate cron — not this writer's responsibility" — but matrix REQ-035 (a hard-contract category) mandates atomic en+es file pair. This is the single largest disagreement between writer and matrix. (See REQ-035 + REQ-011.)

2. **Path inconsistency.** STEP 0 #1 reads `/Users/frankthebot/clawd/.claude/agents/_universal-rules-block.md`. STEP 0 #2 reads `/Users/frankthebot/clawd/projects/covered-usa/content/link-index.json`. STEP 0 #3 reads `/Users/frankthebot/clawd/projects/covered-usa/PLAN.md`. STEP 1 reads `/Users/frankthebot/clawd/projects/covered-usa/src/lib/states/data/...`. STEP 7 saves to `/Users/frankthebot/clawd/projects/covered-usa/content/blog/...`. The matrix's "Notes for Phase 2 drafter" #4 explicitly says: "Old writer uses `/Users/frankthebot/clawd/...` paths. The new writer should use `/Users/jacobposner/clawd/...` (per the audit, the cron runs on Jacob's MacBook now and the frankthebot paths fail)." All paths in the writer are still `frankthebot` — none switched to `jacobposner`. **Cron will fail on Jacob's MacBook.**

3. **STEP 6 says "26 checks" but the matrix references "STEP 5 self-validation" in many requirements.** Writer renumbered to STEP 6. Cron parsing of `## STEP N` (REQ-036) may break if cron expects STEP 5 = validation step.

4. **STEP 5 paragraph rule says "Do NOT start the article body with an h2 title. Start directly with a paragraph (after the optional Quick Answer blockquote)."** STEP 3 "Required elements" mandates the Quick Answer blockquote near the top. The two are compatible — but the word "optional" in STEP 5 weakens the STEP 3 requirement. Should read "the required Quick Answer blockquote."

5. **Word-count target.** STEP 5 says "Target 1500-2500 words." Matrix flags this as the only conflict left for human judgment (Conflict #7). Writer kept the old 1500-2500 number — acceptable for B1 scope (blog-only), but no inline note was added warning future maintainers not to reuse this writer for glossary/short templates without recipe-aware adjustment.

---

## Resolved-conflict compliance

- **Conflict 1 (Paragraph length 150-300 + warn 80-400 + fail 50-500):** ✓ writer enforces verbatim in STEP 5 + STEP 6 check 20.
- **Conflict 2 (FAQ density universal 6-8, drop SOURCE branching):** ✓ writer enforces; SOURCE noted as deprecated in INPUTS.
- **Conflict 3 (TARGET=analyzer keeps .gov citations):** ✓ writer has explicit carveout language in STEP 5 CTA section and STEP 6 check 24.
- **Conflict 4 (State-context everywhere, brand list mandatory):** ✓ writer enforces in STEP 0 / STEP 1 / STEP 5 RULE 1 / STEP 6 check 12.
- **Conflict 5 (How-to-apply universal, not "where applicable"):** ✓ writer enforces; CRITICAL BOUNDARY #5 reiterates.
- **Conflict 6 (JSON return shape additive):** ✓ writer's STEP 8 success shape includes both old fields (slug, word_count, status, title) and new fields (topicCluster, keyTerms, gapsFlagged).

All 6 resolved conflicts are honored. Conflict 7 (1500-2500 word target) is the open human-judgment item; writer kept the old number, which the matrix said is acceptable for B1 scope.

---

## Top 5 most important fixes (ordered by severity)

1. **REQ-035 / EN+ES file pair (FAIL).** Writer disclaims Spanish file production; matrix says it's a hard-contract requirement and TRACK_B1_PLAN.md §4 critical boundary 8 explicitly forbids skipping the pair. Either fix the writer to produce both files atomically OR amend the matrix + plan to acknowledge the new translation-cron split. **Decide before Phase 4 testing**, because the test rubric will check for both files.

2. **Path portability — `frankthebot` vs `jacobposner` (internal contradiction #2, blocks Phase 4 entirely on Jacob's MacBook).** Every absolute path in the writer (`Read`, `Write`, output destination) uses `/Users/frankthebot/...`. Matrix's "Notes for Phase 2 drafter" #4 mandates `/Users/jacobposner/...` for the MacBook environment. This will produce file-not-found errors on read AND wrong save destination on write. Mass-replace `frankthebot` → `jacobposner` throughout the writer.

3. **REQ-011 / hreflang metadata (FAIL).** No hreflang signal in frontmatter, no parity check in STEP 6, no en/es file-pair production. Coupled with REQ-035 above — both must be resolved together. Without hreflang, the audit's existing-blog gap continues.

4. **REQ-009 / FPL FAQ topic anchors (FAIL).** FPL-shape posts must include FAQ entries on (a) how FPL is calculated, (b) Alaska/Hawaii differences, (c) percentage threshold meaning. Currently writer just says "6-8 FAQ items" generically. Add explicit required-topic list to STEP 3 Branch A and a STEP 6 sub-check.

5. **REQ-007 / FPL canonical chart structure (PARTIAL) + REQ-010 / per-claim citation (PARTIAL) + REQ-043 / slug-search-was-performed (PARTIAL).** Three partial enforcements that the writer mentions but doesn't validate at STEP 6. Add specific sub-checks: (a) FPL chart has ≥9 rows × ≥6 percentage columns + year caption; (b) every numeric token has an inline .gov link in the same sentence; (c) Glob/Grep search for synonym slugs was performed before finalizing slug.
