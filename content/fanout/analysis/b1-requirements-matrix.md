# B1 Requirements Matrix

**Phase:** 1 (Inventory)
**Date:** 2026-05-14
**Source plan:** `specs/TRACK_B1_PLAN.md` v1.1
**Purpose:** Master list of every rule the new `coveredusa-article-writer.md` must honor. The Phase 2 drafter relies on this file exclusively.

---

**Total requirements:** 62
**Conflicts found:** 7 (resolved: 6, flagged for human: 1)

Category counts:
- 1 — formula-universal: 5
- 2 — formula-recipe (§4.9 FPL super-shape): 4
- 3 — audit-flagged blog gaps: 11
- 4 — framework-preserved (AI_OPTIMIZATION_FRAMEWORK): 12
- 5 — hard-contract (preserved from existing writer): 6
- 6 — slug-rule: 5
- 7 — link-consumption: 5
- 8 — strategic-posture: 3
- 9 — humanizer-voice: 7
- 10 — cron-pipeline integration: 4

---

## Category 1: MUST — formula compliance (5 universal rules)

### REQ-001 — STATE-CONTEXT-EVERYWHERE
- **Source:** `_universal-rules-block.md` §RULE 1; FANOUT_FORMULA.md §3.2; §3.7
- **Category:** formula-universal
- **Rule:** When STATE is in scope (not "national"), the state name MUST appear in: Title, H1, Meta description, the first sentence of every H2 section, every table caption, and inline next to every numeric threshold quoted in body content (e.g., "Texas Medicaid threshold: $X" — never bare "$X"). When the state has a state-named program brand (Medi-Cal, AHCCCS, MNsure, SoonerCare, MaineCare, BadgerCare, AllKids, TennCare, ARHOME, NJ FamilyCare, MassHealth, HIP, OHP, CHP+, kynect, HUSKY Health, Med-QUEST, Apple Health, CalFresh), USE THE BRAND. Generic "[state] Medicaid" is INSUFFICIENT. Use the brand as the page's primary entity, with the generic as alternateName/synonym in body.
- **Enforcement:** STEP 0 (load universal rules block). STEP 2 (plan structure — confirm state-name discipline applies). STEP 3 (write content — every H2 first sentence + every table caption). STEP 5 (self-validation — scan for bare "$X" without state context; scan for "California Medicaid" violations against brand list).
- **Conflicts:** Old writer §STEP 4 says "If state-specific: mention the state screener link as well" only. Resolution: formula wins; state name appears EVERYWHERE listed above, not just in the screener link mention.

### REQ-002 — ELIGIBILITY-HOUSEHOLD-SIZE-TABLE
- **Source:** `_universal-rules-block.md` §RULE 2; FANOUT_FORMULA.md §3.3
- **Category:** formula-universal
- **Rule:** Every page covering income-based eligibility (Medicaid, ACA subsidies, FPL, SNAP, WIC, persona-income-eligibility, medical-bill charity care) MUST include a household-size lookup table with rows for Household Size 1 through 8, plus an "Each additional" row. Table caption MUST include the year explicitly (e.g., "Texas Medicaid Income Limits — 2026"). Threshold values MUST be year-anchored against the most recent published guidelines.
- **Enforcement:** STEP 2 (plan — flag income-gated topics). STEP 3 (write — emit table). STEP 5 (self-validation — for income-gated topicCluster, verify presence of 8-row household table with year-tagged caption).
- **Conflicts:** Old writer says "Include income limit tables (markdown tables) where applicable" — vague. Resolution: formula wins; the 1-8 + "each additional" row table is REQUIRED, not optional, for any income-gated topic. Caption must be year-tagged.

### REQ-003 — HOW-TO-APPLY-SECTION
- **Source:** `_universal-rules-block.md` §RULE 3; FANOUT_FORMULA.md §3.4
- **Category:** formula-universal
- **Rule:** Every page MUST have a next-steps H2 (typically titled "How to apply" or "Next steps") containing all 5 sub-fields: (1) Specific enrollment-window dates (or "open enrollment" if year-round); (2) Numbered application steps, between 3 and 7 (no fewer than 3, no more than 7); (3) The official .gov starting URL (Medicare.gov, Healthcare.gov, Medicaid.gov, or state-specific portal — see brand list); (4) "Documents needed" bullet checklist with 4-8 items; (5) "Common reasons applications get denied" callout with 3-5 items.
- **Enforcement:** STEP 2 (plan — always include this H2). STEP 3 (write — populate all 5 sub-fields). STEP 5 (self-validation — count: 1 H2 named some variant of "How to apply"/"Next steps"; 3-7 numbered steps; ≥1 .gov URL; 4-8 doc bullets; 3-5 denial reasons).
- **Conflicts:** Old writer §STEP 4 says "Step-by-step application instructions where applicable" — "where applicable" softens to optional. Resolution: formula wins; section is universal (not "where applicable") and all 5 sub-fields are required.

### REQ-004 — YEAR-MARKERS-AND-YEAR-ANCHORING
- **Source:** `_universal-rules-block.md` §RULE 4; FANOUT_FORMULA.md §3.1; AI_OPTIMIZATION_FRAMEWORK.md §4.2 + §8.4
- **Category:** formula-universal
- **Rule:** Every page MUST include the current year in: Title, H1, Meta description, First paragraph, every numeric table caption, every section heading that references a numeric value, and inline next to every dollar amount or percentage in body prose (e.g., "the 2026 threshold is $X" — NEVER bare "$X"). Year-anchoring rule: never write a $/% without a year within the same sentence or table caption. Forward-looking topics (COLA projections, plan-year costs, projected benefits) MUST also include next-year markers.
- **Enforcement:** STEP 3 (write — never emit a bare $ or %). STEP 5 (self-validation — regex scan: every `\$[\d,.]+` and `\d+%` token must have a 4-digit year within the same sentence or in the immediate table caption; year MUST appear in title, H1, meta, and first paragraph).
- **Conflicts:** none.

### REQ-005 — AUTHORITATIVE-SOURCE-NARROWING
- **Source:** `_universal-rules-block.md` §RULE 5; FANOUT_FORMULA.md §3.6; AI_OPTIMIZATION_FRAMEWORK.md §4.9
- **Category:** formula-universal
- **Rule:** Cite primary sources INLINE (not just at the page foot) with anchor text containing the source domain. Required source domains by topic: Medicare → medicare.gov, cms.gov; Medicaid → medicaid.gov + state-specific Medicaid agency; ACA → healthcare.gov, kff.org; FPL → aspe.hhs.gov; Drug pricing → cms.gov, fda.gov, manufacturer site; Tax topics → irs.gov. Minimum 3 inline outbound `.gov` / `.edu` / KFF.org / healthcare.gov / cms.gov / nih.gov citations per page. Anchor text must contain descriptive context with the source domain (e.g., "[CMS 2026 Medicare Physician Fee Schedule](https://...)" — not "click here").
- **Enforcement:** STEP 3 (write — every numeric claim gets an inline .gov anchor). STEP 5 (self-validation — count outbound .gov/.edu/kff.org links in body; if <3, fail).
- **Conflicts:** Old writer says "VERIFY ALL FACTS" but has no rule for inline .gov anchoring. Audit found 31 of 36 existing posts have ZERO outbound external URLs. Resolution: formula wins; ≥3 inline outbound .gov links per page is mandatory.

---

## Category 2: MUST — formula recipe (§4.9 daily-blog FPL super-shape)

### REQ-006 — FPL-SUPER-SHAPE-H2-LIST
- **Source:** FANOUT_FORMULA.md §4.9; TRACK_B1_PLAN.md §3 ("From FANOUT_FORMULA.md §4.9 daily-blog recipe")
- **Category:** formula-recipe
- **Rule:** For FPL / Medicaid-income / ACA-subsidy / income-anchored topics, REQUIRED H2s in this verbatim order:
  1. FPL chart [year]  (the canonical lookup table — household size 1-8 × percentage thresholds 100% / 138% / 150% / 200% / 250% / 400%)
  2. By household size  (explanatory section under the chart)
  3. By percentage thresholds  (what each threshold qualifies for: 100% / 138% / 150% / 200% / 250% / 400%)
  4. FPL × Medicaid eligibility  (with state expansion overlay)
  5. FPL × ACA subsidies  (premium tax credit thresholds)
  6. FPL × CHIP  (where applicable)
  7. FPL × WIC  (income guidelines)
  8. FPL × SNAP  (income guidelines)
  9. Alaska + Hawaii FPL adjustments  (always include the per-state higher thresholds)
  10. State-by-state Medicaid expansion status table
  11. How to apply  (per universal rule §3.4 / REQ-003)

  For NON-FPL daily-blog topics, the writer applies the relevant subset of these H2s plus topic-appropriate analog tables (e.g., a Medicare Part B blog uses MSP household-size tables and a Medicare-Part-B-by-income analog).
- **Enforcement:** STEP 2 (plan — branch on FORMULA_RECIPE field; if FPL-shape, lay down all 11 H2s; if non-FPL, derive subset). STEP 5 (self-validation for FPL-shape: presence of all 11 H2s in order; presence of full FPL chart with 1-8 × 6 percentage thresholds).
- **Conflicts:** none — entirely additive (old writer had no recipe awareness).

### REQ-007 — REQUIRED-FPL-CHART-TABLE
- **Source:** FANOUT_FORMULA.md §4.9 ("Required tables: full FPL chart (1-8 person households × percentage thresholds), year-tagged")
- **Category:** formula-recipe
- **Rule:** For FPL-shape blog posts, the page MUST include the canonical FPL chart as a markdown table with rows for household size 1 through 8 (plus "Each additional"), columns for the 6 percentage thresholds (100% / 138% / 150% / 200% / 250% / 400%), and a year-tagged caption.
- **Enforcement:** STEP 3 (write — emit the chart). STEP 5 (self-validation — table with ≥9 rows + ≥6 percentage columns + year in caption).
- **Conflicts:** none.

### REQ-008 — STATE-BY-STATE-EXPANSION-TABLE
- **Source:** FANOUT_FORMULA.md §4.9 ("State-specificity: include state-by-state Medicaid expansion status table")
- **Category:** formula-recipe
- **Rule:** For FPL-shape and Medicaid-eligibility-shape blog posts, include a state-by-state Medicaid expansion status table (38 expansion states vs 12 non-expansion states — list each non-expansion state explicitly).
- **Enforcement:** STEP 3 (write — emit table when topic is FPL/Medicaid-eligibility). STEP 5 (self-validation for FPL recipe: presence of expansion-status table).
- **Conflicts:** none.

### REQ-009 — REQUIRED-FAQ-TOPICS-FPL
- **Source:** FANOUT_FORMULA.md §4.9 ("Required FAQ topics: how FPL is calculated, Alaska/Hawaii differences, percentage threshold meaning")
- **Category:** formula-recipe
- **Rule:** For FPL-shape blog posts, FAQ section MUST include topics covering: how FPL is calculated, Alaska/Hawaii differences, percentage threshold meaning. For non-FPL topics, FAQ topics adapt to the recipe (e.g., for Medicare Part B: enrollment timing, IRMAA reconsideration, late-enrollment penalties).
- **Enforcement:** STEP 3 (write FAQ). STEP 5 (for FPL recipe: scan FAQ section for all 3 required topic anchors).
- **Conflicts:** none.

---

## Category 3: MUST — audit-flagged blog gaps

### REQ-010 — EXTERNAL-URL-DENSITY-EVERY-NUMERIC-CLAIM
- **Source:** `audit-blog-writer.json` §existingPages (FPL article: "no inline .gov citations"); `audit-blog-writer.json` §recommendations.writerEdits item 6; CURRENT_STATE_AUDIT.md §4.8 ("31 of 36 posts have ZERO outbound external URLs")
- **Category:** audit-flagged
- **Rule:** Every numeric claim in body content gets an inline .gov citation. Hyperlink the source domain in anchor text — never leave a .gov reference as plain prose ("according to ssa.gov" must be hyperlinked, not text-only).
- **Enforcement:** STEP 3 (write — anchor every $/% statement to a .gov source). STEP 5 (self-validation — count `(.gov|.edu|kff.org)` markdown links in body; flag plain-text .gov mentions that lack hyperlinks).
- **Conflicts:** Builds on REQ-005 (which sets the ≥3 floor); this rule extends to "every numeric claim," not just 3 minimum. Resolution: REQ-005 is the floor; REQ-010 is the per-claim discipline.

### REQ-011 — HREFLANG-IN-METADATA
- **Source:** `audit-blog-writer.json` §recommendations (implicit); CURRENT_STATE_AUDIT.md §4.8 ("No `hreflang` in blog `generateMetadata`")
- **Category:** audit-flagged
- **Rule:** Every blog post MUST emit hreflang metadata for both `en` and `es` locales. The frontmatter and the rendered page metadata must declare the alternate locale URL.
- **Enforcement:** STEP 4 (write frontmatter — include hreflang fields or ensure the en+es file pair is structured so the page template auto-generates hreflang). STEP 5 (self-validation — confirm both locale files exist and frontmatter includes locale-pair references).
- **Conflicts:** none.

### REQ-012 — TOPIC-CLUSTER-AND-KEY-TERMS-IN-FRONTMATTER
- **Source:** LINK_TARGET_MANIFEST.md §1.1 (blog frontmatter schema); audit-blog-writer.json §cronPipelineGaps; TRACK_B1_PLAN.md §3
- **Category:** audit-flagged
- **Rule:** Frontmatter MUST include `topicCluster` (lowercase slug-style identifier matching one of the existing clusters or declaring a new one — see LINK_TARGET_MANIFEST.md §2.1) and `keyTerms` with `en` and `es` arrays of 3-8 anchor-candidate phrases. Also include `isLighthouse: false` (default for blog spokes) and `isDeprecated: false`.
- **Enforcement:** STEP 4 (write frontmatter). STEP 5 (validate: topicCluster present, matches `/^[a-z0-9-]+$/`; keyTerms.en has ≥1 entry; keyTerms.es has ≥1 entry).
- **Conflicts:** Old writer frontmatter omits these fields entirely. Resolution: formula wins; new fields are mandatory.

### REQ-013 — NO-YEAR-IN-SLUG
- **Source:** URL_SLUG_FRAMEWORK.md §Rule 2; audit-blog-writer.json (CURRENT_STATE_AUDIT.md notes ~16 of 36 posts produced with year-in-slug)
- **Category:** audit-flagged
- **Rule:** New blog slugs MUST NOT contain a 4-digit year (regex `/\b(19|20)\d{2}\b/` against slug → must NOT match). Year markers belong in H1, title, meta description, and first paragraph only.
- **Enforcement:** STEP 4 (slug generation — strip any year). STEP 5 (validate slug regex).
- **Conflicts:** Old writer has no year-in-slug rule. Resolution: formula + URL_SLUG_FRAMEWORK win; year in slug is forbidden for all new content.

### REQ-014 — TARGET-FIELD-IN-FRONTMATTER
- **Source:** Old writer §STEP 4 (preserved); audit-blog-writer.json §existingPages (Medicare Part B article: "Frontmatter missing 'target' field (should be 'screener')")
- **Category:** audit-flagged
- **Rule:** Frontmatter MUST include `target: "screener"` or `target: "analyzer"` matching the TARGET input. If TARGET is "analyzer", set `target: "analyzer"`; otherwise (TARGET="screener" or blank), set `target: "screener"`. This drives which CTA card the blog page template renders.
- **Enforcement:** STEP 4 (frontmatter). STEP 5 (validate: target field present, value ∈ {"screener", "analyzer"}, matches TARGET input).
- **Conflicts:** none — preserved from old writer; audit confirmed it must be present on every page.

### REQ-015 — DATEMODIFIED-CONSISTENCY
- **Source:** CURRENT_STATE_AUDIT.md §4.8 ("`dateModified` inconsistent: articleSchema uses `lastUpdated || date`, sitemap uses `date` only"); AI_OPTIMIZATION_FRAMEWORK.md §4.11 ("Sync schema.org `dateModified` with sitemap `lastmod` and visible 'Updated' date — three sources must align")
- **Category:** audit-flagged
- **Rule:** Frontmatter `date` field is the authoritative publish date. If the writer is updating an existing post, also emit `lastUpdated` matching the edit date. Both must be quoted strings in YYYY-MM-DD format. (The schema/sitemap consistency fix is a code-side concern; the writer's contract is to emit both fields cleanly.)
- **Enforcement:** STEP 4 (frontmatter — emit `date` always; `lastUpdated` if updating).
- **Conflicts:** none — this rule exists at the writer level only as a clean-emission requirement.

### REQ-016 — EM-DASH-PURGE-IN-SELF-VALIDATION
- **Source:** Old writer §Style Rules; AI_OPTIMIZATION_FRAMEWORK.md §8.4 (em-dash ban regex); audit-blog-writer.json §recommendations
- **Category:** audit-flagged
- **Rule:** Em-dash count in body content MUST be 0. Use commas, periods, parentheses, or "to" for ranges. En-dashes between digits in numeric ranges (e.g., `$400–$3,500`) are allowed; em-dashes anywhere are banned.
- **Enforcement:** STEP 3 (write — never use em-dashes). STEP 5 (self-validation — `grep -c -- "—"` on the file → must be 0; en-dash regex must only match between digits).
- **Conflicts:** none — preserved from old writer; reinforced by audit.

### REQ-017 — YEAR-DRIFT-DETECTION
- **Source:** audit-blog-writer.json §existingPages (hospital-bills article: "Year markers in tables — 'Typical 2026 Charity Care Income Thresholds' uses 2025 FPL numbers"); audit-blog-writer.json §recommendations.writerEdits item 7; TRACK_B1_PLAN.md §3
- **Category:** audit-flagged
- **Rule:** No numeric threshold in body content may use a prior-year value while the surrounding caption or sentence says current year. Specific check: when a table caption says "2026" or a sentence says "2026", every $ value in that table/sentence must match the published 2026 figure. The hospital-bills article had `$15,650 / $32,150` (2025 FPL numbers) labeled as 2026; verifier missed this.
- **Enforcement:** STEP 1 (research — fetch current-year canonical numbers from .gov sources; cross-check). STEP 5 (self-validation — for every year-tagged numeric table, spot-check the values against research notes; flag if any value matches a known prior-year figure).
- **Conflicts:** none.

### REQ-018 — DROP-SOURCE-CONDITIONAL-FAQ-DENSITY
- **Source:** audit-blog-writer.json §rulesConflicting ("AI Source Optimization block ('More FAQ questions: Aim for 6-8 FAQ items (vs 3-4 for Google source)') makes FAQ density conditional on SOURCE field. The formula treats high-FAQ density as universal."); audit-blog-writer.json §recommendations.writerEdits item 3
- **Category:** audit-flagged
- **Rule:** Remove the SOURCE=AI conditional gating on FAQ density, Quick Answer blockquote, and freshness signals. ALL benefits/program/eligibility blog topics get 6-8 FAQ items, a `> **Quick Answer:**` blockquote near the top, and "As of [year]" freshness signals — regardless of SOURCE field. The fan-out formula treats Bing-grounding optimization as universal.
- **Enforcement:** STEP 3 (write — always 6-8 FAQs for benefits/eligibility/program topics; always include Quick Answer blockquote and year freshness signals).
- **Conflicts:** Old writer says SOURCE=Google → 3-4 FAQs; SOURCE=AI → 6-8 FAQs. Resolution: formula wins; 6-8 FAQs universal for benefits/program/eligibility topics; SOURCE branching dropped.

### REQ-019 — TARGET-ANALYZER-PRESERVES-GOV-CITATION-DENSITY
- **Source:** audit-blog-writer.json §rulesConflicting ("TARGET=analyzer rule 'Avoid /screener links inside the article body' is fine on its own, but conflicts with §3.4 'official .gov starting URL'"); audit-blog-writer.json §recommendations.writerEdits item 4
- **Category:** audit-flagged
- **Rule:** When TARGET=analyzer, the writer MUST NOT use this as a carveout to skip inline .gov citations. The "avoid /screener links inside body" rule applies ONLY to internal /screener links; .gov outbound citations (medicare.gov, cms.gov, healthcare.gov, irs.gov, aspe.hhs.gov, etc.) MUST still be ≥3 inline per page per REQ-005. The how-to-apply section's .gov starting URL is also still required per REQ-003.
- **Enforcement:** STEP 3 (write — distinguish "internal /screener link" (skip when TARGET=analyzer) from "outbound .gov citation" (always required)). STEP 5 (validate ≥3 .gov citations regardless of TARGET).
- **Conflicts:** Old writer's TARGET=analyzer block could be misread as "avoid all body links." Resolution: formula wins; internal /screener links are dropped for TARGET=analyzer, but outbound .gov citations remain mandatory.

### REQ-020 — CTA-MENTIONS-BILL-ANALYZER-BY-NAME-WHEN-TARGET-ANALYZER
- **Source:** Old writer §STEP 4 (preserved — "Mention the 'CoveredUSA Bill Analyzer' BY NAME at least once in the article body, ideally twice")
- **Category:** audit-flagged (also hard-contract; preserved)
- **Rule:** When TARGET=analyzer, mention "the CoveredUSA Bill Analyzer" by name (proper noun, capitalized) at least once in the article body — ideally twice — not just in the CTA card. One mention in the first half of the article when describing reader actions (with link to `/medical-bill-analyzer`); optionally a second mention near the end or in an FAQ answer. Inline body links target `/medical-bill-analyzer`, not `/screener`. CTA line: "Upload your hospital bill to the free CoveredUSA Bill Analyzer to find errors, overcharges, and charity care options in 30 seconds." When TARGET="screener" or blank, CTA line: "Check your eligibility now at CoveredUSA — it takes 2 minutes." (Note: per REQ-016, replace the em-dash in the screener CTA with a comma or period.)
- **Enforcement:** STEP 3 (write — branch on TARGET; emit correct CTA + inline links). STEP 5 (validate: TARGET=analyzer → "CoveredUSA Bill Analyzer" appears ≥1 time; TARGET=screener → "/screener" CTA present).
- **Conflicts:** Old writer's screener CTA contains an em-dash ("—" in "CoveredUSA -- it takes 2 minutes" written as "--" in old prompt). The current screener CTA template already uses "--" not em-dash, but the new writer must ensure no em-dash leaks in. Resolution: rewrite the CTA to use a period or comma instead of any dash.

---

## Category 4: MUST — framework-preserved (AI_OPTIMIZATION_FRAMEWORK rules to keep)

### REQ-021 — PARAGRAPH-LENGTH-150-300
- **Source:** AI_OPTIMIZATION_FRAMEWORK.md §3.1 + §4.5 + §8.4 (warn outside 80-400; fail outside 50-500); CURRENT_STATE_AUDIT.md §4.8 ("100% of sampled body paragraphs under 100 words")
- **Category:** framework-preserved
- **Rule:** Body prose paragraphs target 150-300 words. FAQ answers may run 80-150 words for conversational pacing. Validator warns at <80 or >400; fails at <50 or >500.
- **Enforcement:** STEP 3 (write — aim for middle of range). STEP 5 (self-validation — count words per paragraph; flag any <80 or >400).
- **Conflicts:** Old writer has no paragraph-length rule. Audit shows current output averages 30-90 words. Resolution: framework wins; new writer enforces 150-300 target.

### REQ-022 — META-TITLE-CAP
- **Source:** AI_OPTIMIZATION_FRAMEWORK.md §4.2 + §8.4 ("Title under 70 characters")
- **Category:** framework-preserved
- **Rule:** Meta title ≤ 70 characters.
- **Enforcement:** STEP 4 (write title). STEP 5 (validate length).
- **Conflicts:** none.

### REQ-023 — META-DESCRIPTION-CAP
- **Source:** AI_OPTIMIZATION_FRAMEWORK.md §4.2 + §8.4 ("meta description under 160 characters")
- **Category:** framework-preserved
- **Rule:** Meta description ≤ 160 characters.
- **Enforcement:** STEP 4 (write description — old writer says "155 char max" which is safer; keep 155 as the writer's working cap to leave a safety buffer). STEP 5 (validate length ≤ 160).
- **Conflicts:** Old writer says 155; framework allows 160. Resolution: writer-prompt cap = 155 (safer, gives buffer); validator hard-fail = 160. No real conflict — old writer's tighter cap is acceptable.

### REQ-024 — STRUCTURAL-PROPORTION-25-35
- **Source:** AI_OPTIMIZATION_FRAMEWORK.md §3.1 + §4.6 + §8.4 (warn outside [0.20, 0.40]; fail outside [0.10, 0.50])
- **Category:** framework-preserved
- **Rule:** Combined `<table>` + `<ul>` + `<ol>` content as fraction of total body content should be 25-35%. Validator warns outside [0.20, 0.40]; fails outside [0.10, 0.50].
- **Enforcement:** STEP 3 (write — add tables/lists if prose-heavy). STEP 5 (validate ratio).
- **Conflicts:** none.

### REQ-025 — SOURCE-COUNT-MIN-3
- **Source:** AI_OPTIMIZATION_FRAMEWORK.md §8.4 ("Sources count: Minimum 3 sources per page")
- **Category:** framework-preserved
- **Rule:** Minimum 3 distinct primary sources cited inline in body (overlaps with REQ-005's .gov density floor). Validator counts unique source domains.
- **Enforcement:** STEP 5 (validate source count).
- **Conflicts:** none.

### REQ-026 — SCHEMA-ARTICLE-PLUS-MEDICALWEBPAGE
- **Source:** AI_OPTIMIZATION_FRAMEWORK.md §4.7 + §5.8 ("Promote blog posts to MedicalWebPage + Article schema combo for health/insurance topics"); CURRENT_STATE_AUDIT.md §4.8 ("Schema `@type: ['Article', 'MedicalWebPage']` stacked combo" — already cascaded by Track A1)
- **Category:** framework-preserved
- **Rule:** Blog posts emit Article + MedicalWebPage stacked schema (already implemented at the page-template level via Track A1 `@graph` refactor). The writer's contract: produce frontmatter + body that the template can serialize correctly. Writer does not hand-roll schema; the template does.
- **Enforcement:** Writer does not enforce directly; template handles. Writer's job: emit clean frontmatter (title, description, date, slug, keywords, target, topicCluster, keyTerms) so the template can build the schema graph.
- **Conflicts:** none.

### REQ-027 — SCHEMA-FAQPAGE-AUTO-EXTRACTED
- **Source:** AI_OPTIMIZATION_FRAMEWORK.md §4.7; CURRENT_STATE_AUDIT.md §4.8 ("FAQPage auto-extracted")
- **Category:** framework-preserved
- **Rule:** FAQ section MUST follow the markdown pattern `## Frequently Asked Questions` then `### Question here?` for each question, with the answer prose immediately following. The page template auto-extracts this into FAQPage schema.
- **Enforcement:** STEP 3 (write FAQ in this exact pattern).
- **Conflicts:** none — preserved from old writer.

### REQ-028 — SCHEMA-HOWTO-WHEN-HOW-TO-APPLY-PRESENT
- **Source:** AI_OPTIMIZATION_FRAMEWORK.md §4.7; FANOUT_FORMULA.md §4.6 (event template HowTo); REQ-003
- **Category:** framework-preserved
- **Rule:** When the article includes a how-to-apply section (REQ-003 makes this universal), the numbered steps must be authored in a markdown-extractable pattern (numbered list with verb-led step titles) so HowTo schema can be auto-extracted by the template.
- **Enforcement:** STEP 3 (write numbered steps clearly).
- **Conflicts:** none.

### REQ-029 — AUTHOR-BYLINE
- **Source:** AI_OPTIMIZATION_FRAMEWORK.md §4.8 ("'By Jacob Posner, Founder & Editor'"); CURRENT_STATE_AUDIT.md §4.8 ("Conflicting author identity" noted but byline normalization is page-template work)
- **Category:** framework-preserved
- **Rule:** Author byline = "Jacob Posner, Founder & Editor" (rendered by the page template). Writer does not need to emit byline in frontmatter (template handles), but MUST NOT contradict it (e.g., do not write "By the CoveredUSA Editorial Team" in body).
- **Enforcement:** STEP 3 (write — never override author identity in body).
- **Conflicts:** none — handled at template level.

### REQ-030 — DIRECT-NUMERIC-ANSWER-FIRST-50-WORDS
- **Source:** AI_OPTIMIZATION_FRAMEWORK.md §1 (TL;DR rule 3) + §4.4 + §8.3 ("The first 50 words of the page body must contain a direct numeric or decisive answer")
- **Category:** framework-preserved
- **Rule:** First 50 words of body content MUST contain a direct numeric or decisive answer to the keyword question. No introductory fluff, anecdotes, rhetorical questions. Use unhedged numeric claims ($1,328, not "around $1,300"). For non-numeric Q&A pages, allow 80 words.
- **Enforcement:** STEP 3 (write first paragraph). STEP 5 (validate first 50 words contain a $ figure or decisive answer).
- **Conflicts:** Old writer says "Do NOT start the article body with an h2 title. Start directly with a paragraph." That's compatible; this rule extends it.

### REQ-031 — NAMED-ENTITY-IN-PARAGRAPH-OPENING
- **Source:** AI_OPTIMIZATION_FRAMEWORK.md §4.4 + §4.5 + §8.3 ("First sentence of each paragraph must include the named entity explicitly")
- **Category:** framework-preserved
- **Rule:** First sentence of each paragraph MUST explicitly name the primary entity (e.g., "California Medi-Cal eligibility," not "these requirements"). Subsequent sentences may use pronouns when the referent is unambiguous.
- **Enforcement:** STEP 3 (write — sweep for "It," "The same," "These," "This" at paragraph starts). STEP 5 (LLM-judge style check on first sentences).
- **Conflicts:** none.

### REQ-032 — STRONG-DENSITY-5-10
- **Source:** AI_OPTIMIZATION_FRAMEWORK.md §1.5 (rule 6) + §4.4 + §8.3 ("Apply visual emphasis (markdown **bold**) to 5-10% of total content")
- **Category:** framework-preserved
- **Rule:** Apply markdown `**bold**` to 5-10% of total content. Prioritize sentence-initial positions on core entities, dollar amounts, dates, and key claims.
- **Enforcement:** STEP 3 (write — bold key entities sentence-initial when natural).
- **Conflicts:** none.

---

## Category 5: MUST — hard-contracts (preserved from existing writer)

### REQ-033 — JSON-RETURN-SHAPE
- **Source:** Old writer §STEP 6; TRACK_B1_PLAN.md §2 Phase 2 ("The JSON return shape (Stage 1 cron parses this)")
- **Category:** hard-contract
- **Rule:** Final output of the writer agent MUST end with a JSON object on its own line, parseable by Stage 1 cron. Success shape: `{"slug": "the-actual-slug", "word_count": 1842, "status": "success", "title": "The Article Title"}`. Error shape: `{"slug": "attempted-slug-or-empty", "word_count": 0, "status": "error", "error": "brief description"}`. Nothing comes after the JSON line. Per TRACK_B1_PLAN.md §2 Phase 2 the new writer may extend this with `topicCluster`, `keyTerms`, and `gapsFlagged` fields (additive, not replacing).
- **Enforcement:** STEP 6 (return JSON last). Hard contract — Stage 1 cron parses this.
- **Conflicts:** TRACK_B1_PLAN.md proposes adding `{slug, status, topicCluster, keyTerms, gapsFlagged}` while old writer specifies `{slug, word_count, status, title}`. Resolution: ADDITIVE — keep old fields (slug, word_count, status, title) for backward compatibility AND add new fields (topicCluster, keyTerms, gapsFlagged) so Stage 1 can pick up either shape. Both stages (Stage 1 cron parsing) need to tolerate the larger object.

### REQ-034 — ATOMIC-WRITE-AFTER-VALIDATION
- **Source:** Old writer (implicit STEP order); TRACK_B1_PLAN.md §2 Phase 2 ("The atomic-write pattern (don't save until self-validation passes)")
- **Category:** hard-contract
- **Rule:** Do NOT save the file to disk until STEP 5 self-validation passes. If validation fails, fix the issue first, re-validate, then save. Both en + es files must save atomically — if either fails, neither saves.
- **Enforcement:** STEP 5 must complete before STEP 6 (save). Implementation: write to a temp variable / draft buffer; save only after all checks pass.
- **Conflicts:** none.

### REQ-035 — EN-PLUS-ES-FILE-PAIR
- **Source:** Old writer (implicit; current writer produces en + es); TRACK_B1_PLAN.md §4 critical boundary 8 ("NEVER skip the en + es translation pair. Both files must be saved atomically")
- **Category:** hard-contract
- **Rule:** Every blog post produces TWO files: English at `projects/covered-usa/content/blog/[slug].md` and Spanish at the corresponding Spanish path (template-determined). Both files must save atomically; if either fails, neither saves.
- **Enforcement:** STEP 6 (save both or roll back). STEP 5 includes parity check (Spanish file generated, hreflang declared per REQ-011).
- **Conflicts:** none.

### REQ-036 — STEP-N-NUMBERED-STRUCTURE
- **Source:** TRACK_B1_PLAN.md §2 Phase 2 ("The `## STEP N` numbered structure (familiar; the cron parses it)")
- **Category:** hard-contract
- **Rule:** Writer prompt structure uses `## STEP N` numbered headings (STEP 0 through STEP 6 per the plan's skeleton). The cron's progress logging parses these headers; renaming or removing them breaks logging.
- **Enforcement:** Prompt structure constraint; verifier checks heading shape.
- **Conflicts:** none.

### REQ-037 — STAGE-1-CRON-PAYLOAD-FIELDS
- **Source:** Old writer §INPUTS; TRACK_B1_PLAN.md §3 Phase 2 step 2; coveredusa-seo-stage1.md lines 64-74 (verified)
- **Category:** hard-contract
- **Rule:** Writer accepts these inputs from Stage 1 cron payload: KEYWORD, TITLE, STATE, PROGRAM, ROW_NUMBER, SHEET_ID, SOURCE, TARGET (preserved from old writer) PLUS three new fields: TOPIC_CLUSTER, FORMULA_RECIPE, UNIVERSAL_RULES (added by Stage 1 cron per audit recommendation; verified in stage1.md lines 72-74).
- **Enforcement:** STEP 0 / INPUTS section (consume all 11 fields).
- **Conflicts:** none — additive.

### REQ-038 — FRONTMATTER-QUOTING-RULES
- **Source:** Old writer §STEP 4 ("CRITICAL: ALL frontmatter values MUST be quoted strings. Date MUST be quoted. Keywords MUST be a YAML array.")
- **Category:** hard-contract
- **Rule:** ALL frontmatter values are quoted strings. Date is quoted (`date: "2026-05-14"`). Keywords are a YAML array of quoted strings (`keywords: ["keyword1", "keyword2"]`). topicCluster, target, slug all quoted. keyTerms.en and keyTerms.es are YAML arrays of quoted strings.
- **Enforcement:** STEP 4 (frontmatter discipline). Reason: `gray-matter` parses unquoted YAML date as a Date object and crashes the build (documented in RESILIENCE.md "MDX/Frontmatter Build Crashes").
- **Conflicts:** none — preserved.

---

## Category 6: MUST — slug rules

### REQ-039 — SLUG-MAX-60-CHARS
- **Source:** URL_SLUG_FRAMEWORK.md §Rule 3 + §3
- **Category:** slug-rule
- **Rule:** Slug ≤ 60 characters.
- **Enforcement:** STEP 4 (slug generation). STEP 5 (validate length).
- **Conflicts:** none — old writer also says max 60.

### REQ-040 — SLUG-KEBAB-CASE-ONLY
- **Source:** URL_SLUG_FRAMEWORK.md §Rule 3 + §3
- **Category:** slug-rule
- **Rule:** Slug characters limited to `[a-z0-9-]` only. No underscores, no uppercase, no special characters. No leading/trailing hyphens. No consecutive (`--`) hyphens.
- **Enforcement:** STEP 4 (slug). STEP 5 (regex validation).
- **Conflicts:** none.

### REQ-041 — SLUG-NO-LEADING-STOP-WORDS
- **Source:** URL_SLUG_FRAMEWORK.md §Rule 3 + §3.warn
- **Category:** slug-rule
- **Rule:** Slug should not start with a stop word: `the`, `a`, `an`, `for`, `is`, `of`, `to`, `with`. (Warn-level; allowed but discouraged.)
- **Enforcement:** STEP 4 (slug — prefer entity-first naming).
- **Conflicts:** none.

### REQ-042 — SLUG-PRIMARY-ENTITY-FIRST
- **Source:** URL_SLUG_FRAMEWORK.md §Rule 3
- **Category:** slug-rule
- **Rule:** Slug names the primary entity (singular noun preferred), not a marketing phrase. `/cost/mri`, not `/healthcare-costs/mri-pricing-guide`.
- **Enforcement:** STEP 4 (slug — favor short entity-first form).
- **Conflicts:** none.

### REQ-043 — NEVER-MIGRATE-EXISTING-SLUGS
- **Source:** URL_SLUG_FRAMEWORK.md §Rule 1; TRACK_B1_PLAN.md §4 critical boundary 1; memory entry `feedback_never_migrate_slugs.md`
- **Category:** slug-rule
- **Rule:** Writer agents NEVER propose slug migrations. Even with 301 redirects. Before proposing a new slug, the writer searches `content/blog/*.md` for any synonym of the target topic; if found, writes to the existing slug. If a writer suggests "the existing slug is suboptimal, here's a better one," that suggestion is rejected at verifier time.
- **Enforcement:** STEP 4 (slug check — query existing blog posts before proposing new slug). STEP 5 (verify slug is either net-new or matches an existing one being updated).
- **Conflicts:** none.

---

## Category 7: MUST — link-index consumption

### REQ-044 — LOAD-LINK-INDEX-AT-WRITE-TIME
- **Source:** LINK_TARGET_MANIFEST.md §5 ("Before writing, load content/link-index.json")
- **Category:** link-consumption
- **Rule:** STEP 0 of the writer MUST load `content/link-index.json` before writing. This file contains the canonical link routing (`byTopic`, `byPhrase`, `lighthouses`).
- **Enforcement:** STEP 0 (read file). If file missing, fall back to a hardcoded minimal lighthouse list (medicaid-income-limits, federal-poverty-level, medicare-eligibility, aca-income-limits, medical-bill-analyzer) and flag in output.
- **Conflicts:** none.

### REQ-045 — INLINE-BODY-LINKS-3-TO-5
- **Source:** LINK_TARGET_MANIFEST.md §5 + §6.3 ("Maximum 5 inline body links per page" + "Every page emits 3-5 inline body links — warn if outside range; not fail — natural placement trumps count")
- **Category:** link-consumption
- **Rule:** Each page emits 3-5 inline body links to canonical URLs from `content/link-index.json`. Match phrases on first occurrence per `byPhrase[locale]`. Hyperlink the FIRST occurrence to the mapped canonical URL `/<locale>/<lighthouse-path>`. Cap at 5. Natural placement trumps count — if natural placement doesn't fit, skip rather than force.
- **Enforcement:** STEP 3 (write — auto-link first occurrences from byPhrase). STEP 5 (count: warn if outside 3-5).
- **Conflicts:** Old writer hardcodes specific link targets (Medicaid → /medicaid-income-limits; Medicare → /medicare-eligibility; ACA → /aca-income-limits) without using the link-index. Resolution: link-index is the source of truth; the old writer's hardcoded targets are valid lighthouses (already in link-index) but the writer must use the index, not hardcode.

### REQ-046 — NEVER-SELF-LINK
- **Source:** LINK_TARGET_MANIFEST.md §5 + §6.3 ("No page self-links — strict-fail")
- **Category:** link-consumption
- **Rule:** The writer MUST NOT link a phrase on the page being written to that same page's URL. Skip self-link targets when scanning byPhrase.
- **Enforcement:** STEP 3 (write — exclude own slug from link candidates). STEP 5 (validate no self-link).
- **Conflicts:** none.

### REQ-047 — NEVER-LINK-A-PHRASE-INSIDE-AN-EXISTING-LINK
- **Source:** LINK_TARGET_MANIFEST.md §5 ("Never link a phrase already inside an existing link")
- **Category:** link-consumption
- **Rule:** Once a phrase is inside an existing markdown link, the writer does not nest another link inside it. Each phrase gets one link maximum.
- **Enforcement:** STEP 3 (write — single-pass link insertion).
- **Conflicts:** none.

### REQ-048 — NEVER-LINK-IN-HEADINGS
- **Source:** LINK_TARGET_MANIFEST.md §5 ("Only in body prose, table cells, and FAQ answers — never in H1, H2, or H3")
- **Category:** link-consumption
- **Rule:** Internal links go in body prose, table cells, and FAQ answers ONLY. Never in H1, H2, or H3 headings.
- **Enforcement:** STEP 3 (write — strip any auto-link that would land in a heading).
- **Conflicts:** none.

---

## Category 8: SOFT — strategic posture (writer-prompt guidance)

### REQ-049 — LOOKUP-CONTENT-BIAS
- **Source:** FANOUT_FORMULA.md §1 (strategic thesis: "Bing wants LOOKUP CONTENT, not explainers"); TRACK_B1_PLAN.md §3
- **Category:** strategic-posture
- **Rule:** Bias content toward LOOKUP shape: tables, charts, state-specific lookups, household-size matrices, percentage thresholds. De-prioritize concept-only deep-dives — Bing has thin demand for those (only 4 MAGI queries in 2 months on BenefitsUSA across all of it).
- **Enforcement:** STEP 2 (plan — prefer table-shaped sections over concept-only essays). Writer-prompt guidance, not a strict validator.
- **Conflicts:** none.

### REQ-050 — VARIANT-WEIGHTING-SPEC-EQUIV-CANON
- **Source:** PHASE_5_BRIDGE.md §3 (empirical re-weighting); FANOUT_FORMULA.md §2 (provider weighting); TRACK_B1_PLAN.md §3
- **Category:** strategic-posture
- **Rule:** When mapping H2s to fan-out variants, weight Specification + Equivalent + Canonicalization as HIGH. Cover Entailment + Clarification as MEDIUM. Don't waste H2 budget on Generalization, Translation, or Follow-up unless naturally warranted. Concrete tactic: list canonical industry term + acronym + colloquial variants for the page's primary entity and use all of them naturally in body content (e.g., "FPL" / "federal poverty level" / "poverty line" / "poverty guidelines" all generate separate Bing volume; one page covering all forms wins all variants).
- **Enforcement:** STEP 2 (plan H2 mapping). Writer-prompt guidance.
- **Conflicts:** none.

### REQ-051 — SOFT-RULES-COMPARISON-DEMOGRAPHIC-TABLE-PHRASING
- **Source:** FANOUT_FORMULA.md §3.5 + §3.9 + §3.10; TRACK_B1_PLAN.md §3 ("SOFT — universal rules §3.5/§3.9/§3.10")
- **Category:** strategic-posture
- **Rule:** Three soft rules — guidance, not strict enforcement:
  - **§3.5 Comparison framing:** When the topic involves choice between alternatives (Medicare Advantage vs Medigap vs Original; COBRA vs Marketplace vs Employer; MAGI vs AGI), include an explicit "X vs Y vs Z" comparison table or section.
  - **§3.9 Demographic specificity:** When the topic has natural demographic dimensions (family of N, single mom, 1099, self-employed, senior), surface those as table rows or H2 sections.
  - **§3.10 Table/chart-shape phrasing:** Use literal "chart" / "guidelines" / "by [dimension]" phrasings in section headings and table captions. Bing user search-intent signal — `federal poverty level 2026 chart` gets 253 weighted citations.
- **Enforcement:** STEP 2/3 (writer-prompt guidance). Not validated.
- **Conflicts:** none.

---

## Category 9: MUST — humanizer voice

### REQ-052 — NO-EM-DASHES
- **Source:** Old writer §Style Rules; humanizer skill; AI_OPTIMIZATION_FRAMEWORK.md §8.4 (em-dash regex)
- **Category:** humanizer-voice
- **Rule:** Zero em-dashes (`—`) in body content, frontmatter, titles, descriptions, FAQ answers, or any rendered surface. Use commas, periods, parentheses, or "to" for ranges. En-dashes between digits in numeric ranges are allowed.
- **Enforcement:** STEP 5 (validation — see REQ-016).
- **Conflicts:** none.

### REQ-053 — NO-FILLER-PHRASES
- **Source:** Old writer §Style Rules; humanizer skill
- **Category:** humanizer-voice
- **Rule:** No filler phrases: "It's important to note...", "In today's world...", "Great question", "It's worth mentioning...", "Needless to say...", "At the end of the day...".
- **Enforcement:** STEP 3 (write — avoid). STEP 5 (LLM-judge for filler).
- **Conflicts:** none — preserved.

### REQ-054 — NO-CORPORATE-VERBS
- **Source:** humanizer skill; CLAUDE.md ("No corporate verbs")
- **Category:** humanizer-voice
- **Rule:** No corporate verbs: "leverage", "utilize", "facilitate", "synergize", "optimize" (when "improve" works), "operationalize".
- **Enforcement:** STEP 3 (write). STEP 5 (LLM-judge).
- **Conflicts:** none.

### REQ-055 — NO-TRIPLE-STACKS
- **Source:** humanizer skill; CLAUDE.md ("No triple-stacks")
- **Category:** humanizer-voice
- **Rule:** No triple-stack noun chains used reflexively: "X, Y, and Z" patterns deployed as filler. Use them only when the three items are genuinely distinct and additive.
- **Enforcement:** STEP 3 (write). STEP 5 (LLM-judge).
- **Conflicts:** none.

### REQ-056 — NO-SIGNIFICANCE-INFLATION
- **Source:** humanizer skill; CLAUDE.md ("No significance inflation")
- **Category:** humanizer-voice
- **Rule:** No "groundbreaking", "revolutionary", "game-changing", "transformative", "unprecedented", "critical" (used as filler intensifier).
- **Enforcement:** STEP 3 (write). STEP 5 (LLM-judge).
- **Conflicts:** none.

### REQ-057 — NO-SMOOTH-TRANSITIONS
- **Source:** humanizer skill; CLAUDE.md ("No smooth transitions")
- **Category:** humanizer-voice
- **Rule:** No transitional connectives that exist only to smooth flow: "Furthermore", "Moreover", "Additionally" (used as paragraph-openers without adding content), "In conclusion", "To summarize".
- **Enforcement:** STEP 3 (write — let paragraphs stand alone).
- **Conflicts:** none.

### REQ-058 — CONVERSATIONAL-SENTENCE-LENGTH-VARIATION
- **Source:** humanizer skill; TRACK_B1_PLAN.md §3
- **Category:** humanizer-voice
- **Rule:** Vary sentence length. Mix short punchy sentences with longer explanatory ones. Do not write all-uniform-medium-length sentences (an AI tell).
- **Enforcement:** STEP 3 (write).
- **Conflicts:** none.

---

## Category 10: MUST — cron-pipeline integration

### REQ-059 — CONSUME-TOPIC-CLUSTER-FROM-PAYLOAD
- **Source:** coveredusa-seo-stage1.md lines 72-74 (Stage 1 cron now passes TOPIC_CLUSTER); TRACK_B1_PLAN.md §3 ("From cron-pipeline (REFACTOR_ROADMAP.md §1.2 — already shipped in `f2f7791`)")
- **Category:** cron-pipeline
- **Rule:** Writer reads TOPIC_CLUSTER from input payload. Stage 1 derives this from the Program field (e.g., "medicare-eligibility" for Medicare; "medicaid-income" for Medicaid with no state; "medicaid-income-{state-slug}" for state-Medicaid; "aca-income" for ACA; "federal-poverty-level" for FPL; "medical-bill-analyzer" for medical-bill topics). If TOPIC_CLUSTER is missing or "unknown", writer falls back to inferring from KEYWORD + STATE + PROGRAM (use a routing map: keyword contains "medicaid" → medicaid-income; "medicare" → medicare-eligibility; "fpl"/"poverty" → federal-poverty-level; "aca"/"obamacare"/"marketplace" → aca-income; "bill"/"hospital" → medical-bill-analyzer).
- **Enforcement:** STEP 0 (consume input). STEP 4 (emit topicCluster in frontmatter — REQ-012).
- **Conflicts:** none.

### REQ-060 — CONSUME-FORMULA-RECIPE-FROM-PAYLOAD
- **Source:** coveredusa-seo-stage1.md line 73 (Stage 1 cron passes FORMULA_RECIPE); TRACK_B1_PLAN.md §3
- **Category:** cron-pipeline
- **Rule:** Writer reads FORMULA_RECIPE from input payload. Stage 1 sets this to "daily-blog" (always, since this is the daily-blog cron) and points the writer at FANOUT_FORMULA.md §4.9 — FPL super-shape. Writer applies the recipe specified. If FORMULA_RECIPE is missing, default to FANOUT_FORMULA.md §4.9 daily-blog recipe.
- **Enforcement:** STEP 0 (consume). STEP 2 (use recipe to plan H2s — REQ-006).
- **Conflicts:** none.

### REQ-061 — CONSUME-UNIVERSAL-RULES-FROM-PAYLOAD
- **Source:** coveredusa-seo-stage1.md line 74 ("UNIVERSAL_RULES: load .claude/agents/_universal-rules-block.md — apply all 5 rules"); TRACK_B1_PLAN.md §3
- **Category:** cron-pipeline
- **Rule:** Writer reads UNIVERSAL_RULES instruction from payload. The instruction directs the writer to load `.claude/agents/_universal-rules-block.md` verbatim and apply all 5 rules (REQ-001 through REQ-005). Writer loads the file in STEP 0.
- **Enforcement:** STEP 0 (load `_universal-rules-block.md`).
- **Conflicts:** none.

### REQ-062 — DO-NOT-EDIT-UNIVERSAL-RULES-BLOCK
- **Source:** TRACK_B1_PLAN.md §4 critical boundary 7 ("NEVER edit `_universal-rules-block.md` as part of B1. That block is shared infra for Track C")
- **Category:** cron-pipeline
- **Rule:** The writer agent (and the B1 implementation as a whole) does NOT modify `_universal-rules-block.md`. That block is shared infrastructure for the future Track C writers. If a rule needs to change, do it as a separate commit explicitly noted as out of B1 scope.
- **Enforcement:** Process rule, not a runtime check. Phase 3 verifier confirms the file was not edited.
- **Conflicts:** none.

---

## Resolved Conflicts

### Conflict 1: Paragraph length (Old writer vs Framework §4.5)
- **Rule A (old writer):** No paragraph-length rule; current output averages 30-90 words.
- **Rule B (framework):** Body prose 150-300 words; FAQ 80-150 words; warn outside 80-400; fail outside 50-500.
- **Resolution:** Framework wins. The new writer enforces 150-300 word paragraphs (REQ-021). Audit confirms current 30-90-word output is a critical violation.

### Conflict 2: FAQ density (Old writer SOURCE-conditional vs Formula universal)
- **Rule A (old writer):** SOURCE=Google → 3-4 FAQs; SOURCE=AI → 6-8 FAQs.
- **Rule B (formula):** Bing-grounding optimization is universal; 6-8 FAQs for benefits/program/eligibility topics regardless of SOURCE.
- **Resolution:** Formula wins (REQ-018). Drop the SOURCE=AI conditional gating. Always emit 6-8 FAQs + Quick Answer blockquote + freshness signals for benefits/program/eligibility topics.

### Conflict 3: TARGET=analyzer body-link rule (Old writer vs Universal Rule 5)
- **Rule A (old writer):** "Avoid /screener links inside the article body" when TARGET=analyzer (could be misread as "avoid all body links").
- **Rule B (formula §3.6 + §3.4):** ≥3 inline outbound .gov citations universal; how-to-apply section's .gov starting URL universal.
- **Resolution:** Formula wins (REQ-019). The old rule applies ONLY to internal /screener links. Outbound .gov citations and the how-to-apply .gov URL remain mandatory for TARGET=analyzer pages. Add explicit carveout in writer prompt.

### Conflict 4: State-context coverage (Old writer's "mention state screener link" vs Universal Rule 1)
- **Rule A (old writer):** "If state-specific: mention the state screener link as well."
- **Rule B (universal RULE 1):** State name in title, H1, meta, every H2 first sentence, every table caption, every numeric threshold; state-named program brand from canonical list.
- **Resolution:** Formula wins (REQ-001). State-context everywhere is mandatory; brand list is mandatory.

### Conflict 5: How-to-apply universality (Old writer's "where applicable" vs Universal Rule 3)
- **Rule A (old writer):** "Step-by-step application instructions where applicable."
- **Rule B (universal RULE 3):** Every page MUST have a how-to-apply H2 with all 5 sub-fields.
- **Resolution:** Formula wins (REQ-003). Section is universal; "where applicable" is removed.

### Conflict 6: JSON return shape extension (Old writer minimal vs Plan extended)
- **Rule A (old writer):** `{slug, word_count, status, title}`.
- **Rule B (plan):** `{slug, status, topicCluster, keyTerms, gapsFlagged}`.
- **Resolution:** Additive (REQ-033). Keep old fields for backward compatibility; add new fields. Stage 1 cron tolerates the larger object. Final shape: `{slug, word_count, status, title, topicCluster, keyTerms, gapsFlagged}`.

---

## Flagged for Human Judgment

### Conflict 7: Article word-count target (Old writer "1500-2500" vs Glossary recipe "300-500")
- **Question:** The old writer hardcodes "1500-2500 word article" target. FANOUT_FORMULA.md §4.5 explicitly says glossary pages should be SHORT (300-500 words) — Bing doesn't reward 2,000-word concept deep-dives. The audit notes this would mis-shape glossary if the writer ever routes there. For the daily blog writer (Track B1 scope), should we keep the 1500-2500 target as-is (since this writer is blog-only and the daily-blog FPL super-shape recipe naturally calls for long lookup-rich content), or should we make the word-count target conditional on FORMULA_RECIPE?
- **Context:** Track B1 scope is the daily blog writer ONLY (per TRACK_B1_PLAN.md §4 critical boundary 9). The glossary writer is a separate Track C writer. So the old 1500-2500 target is technically safe for B1 scope. But if this writer is ever reused for a non-blog template (e.g., emergency override), the conflict surfaces. Recommendation: keep 1500-2500 for B1 (blog-only) AND add a note that the writer is not to be reused for glossary/short templates without recipe-aware adjustment. Confirm with Jacob.

---

## Notes for the Phase 2 drafter

1. **The 5 universal rules are the spine.** Every other requirement layers on top. Load `_universal-rules-block.md` verbatim in STEP 0; don't paraphrase it.

2. **The §4.9 FPL super-shape is the daily-blog recipe.** Stage 1 cron always passes FORMULA_RECIPE="daily-blog" pointing at this recipe. The 11 H2s (REQ-006) are the canonical structure. For non-FPL daily-blog topics, the writer derives the relevant subset.

3. **`content/link-index.json` is the link source of truth.** Old writer hardcoded link targets (e.g., Medicaid → /medicaid-income-limits); the new writer reads them from the index. The hardcoded targets are still valid (they're in the index as lighthouses), so the change is mechanical — load the index and use it instead of hardcoding.

4. **All paths in the writer prompt should be portable.** Old writer uses `/Users/frankthebot/clawd/...` paths. The new writer should use `/Users/jacobposner/clawd/...` (per the audit, the cron runs on Jacob's MacBook now and the frankthebot paths fail). Confirm with Jacob whether the writer runs on Mac mini (frankthebot) or MacBook (jacobposner) — likely jacobposner per the gitStatus.

5. **The hard contracts (Category 5) cannot be silently changed.** Stage 1 cron parses the JSON return shape (REQ-033), the `## STEP N` headings (REQ-036), and the file-pair save pattern (REQ-035). Phase 2 drafter must preserve all of these.

6. **Year-drift detection (REQ-017) is the most subtle audit finding.** The hospital-bills article has 2025 FPL numbers labeled as 2026 — verifier missed this. The new writer's STEP 5 self-validation must explicitly cross-check year-tagged numbers against research notes. This is a manual-check rule (LLM-judge), not a regex.

7. **Soft rules (Category 8) are guidance only.** The writer prompt should include them as "consider" / "prefer" language, not "MUST" — they are explicitly soft per FANOUT_FORMULA.md.

---

*This matrix was compiled from 10 source files in Phase 1. It is the contract for Phase 2 (drafting). Phase 3 (verification) checks the new writer against every REQ ID listed here.*
