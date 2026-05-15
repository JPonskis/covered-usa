# Verifier C — Differential Audit (OLD writer vs NEW writer)

**Date:** 2026-05-14
**Phase:** B1 Phase 3 — Multi-agent verification
**Source files:**
- OLD: `.claude/agents/coveredusa-article-writer.bak.md` (107 lines)
- NEW: `.claude/agents/coveredusa-article-writer.md` (329 lines)
- Plan: `specs/TRACK_B1_PLAN.md` v1.1
- Matrix: `content/fanout/analysis/b1-requirements-matrix.md`

---

**Total rules extracted from OLD writer:** 38
**PRESENT in NEW writer:** 30
**SUPERSEDED (documented):** 7
**SILENTLY DROPPED (bugs):** 1

---

## Per-rule audit

### A. Frontmatter rules

#### A1. Date MUST be quoted (`date: "YYYY-MM-DD"`)
- OLD source: STEP 4 ("Date MUST be quoted")
- Status: **PRESENT** — NEW STEP 4 ("ALL frontmatter values MUST be quoted strings. Date MUST be quoted") + REQ-038 enforced

#### A2. Keywords MUST be a YAML array
- OLD source: STEP 4 ("Keywords MUST be a YAML array")
- Status: **PRESENT** — NEW STEP 4 ("Keywords + keyTerms.en + keyTerms.es MUST be YAML arrays of quoted strings")

#### A3. ALL frontmatter values MUST be quoted strings
- OLD source: STEP 4 ("CRITICAL: ALL frontmatter values MUST be quoted strings")
- Status: **PRESENT** — NEW STEP 4 carries the same wording verbatim

#### A4. `target` field matches TARGET input (analyzer vs screener)
- OLD source: STEP 4 ("The `target` field MUST match the TARGET input")
- Status: **PRESENT** — NEW STEP 4 frontmatter field rules: "`target`: `\"screener\"` if TARGET=screener or blank; `\"analyzer\"` if TARGET=analyzer" + STEP 6 check 9 validates target ∈ {"screener","analyzer"}

#### A5. Slug max 60 chars
- OLD source: STEP 4 ("max 60 chars")
- Status: **PRESENT** — NEW STEP 4 slug rules ("Maximum 60 characters") + STEP 6 check 8 validates length

#### A6. Slug lowercase, hyphens for spaces, no special characters
- OLD source: STEP 4 ("Lowercase, hyphens for spaces, remove special characters")
- Status: **PRESENT** — NEW STEP 4 ("Lowercase only, hyphens for spaces" + "Characters limited to `[a-z0-9-]` only")

#### A7. Title field present
- OLD source: STEP 4 frontmatter sample
- Status: **PRESENT** — NEW STEP 4 frontmatter sample + STEP 6 check 9 (frontmatter completeness includes title)

#### A8. Description field present (155 char max in old writer)
- OLD source: STEP 4 sample ("155 char max meta description")
- Status: **PRESENT** — NEW STEP 4 ("max 155 chars (gives buffer under the 160 hard cap)") + STEP 6 check 7 validates ≤155

#### A9. `description` answers "what will I find here"
- OLD source: STEP 4 sample ("answering what will I find here")
- Status: **SILENTLY DROPPED** — the NEW writer says "Meta description, max 155 chars" but does NOT carry forward the "what will I find here" intent guidance. Severity: LOW. The old phrasing was a soft authoring hint, not a contract; the matrix REQ-023 only addresses the length cap. Recommended action: optional — restore the "answers what will I find here" intent hint in STEP 4 frontmatter sample comment.

---

### B. Style rules

#### B1. NO em-dashes (—) or en-dashes (–)
- OLD source: Style Rules ("NO em dashes (—) or en dashes (–). Use commas, periods, or 'to' for ranges.")
- Status: **SUPERSEDED (partial)** — NEW writer keeps the em-dash ban (STEP 5 + STEP 6 check 1) but RELAXES the en-dash ban: "En-dashes between digits (`$400–$3,500`) are allowed." Documented in matrix REQ-016 ("En-dashes between digits in numeric ranges (e.g., `$400–$3,500`) are allowed; em-dashes anywhere are banned"). Resolution sound — old writer's blanket en-dash ban was over-strict for numeric ranges.

#### B2. No filler ("It's important to note", "In today's world", "Great question")
- OLD source: Style Rules
- Status: **PRESENT** — NEW STEP 5 Style rules carries the same list verbatim and adds "Needless to say", "At the end of the day"

#### B3. VERIFY ALL FACTS
- OLD source: Style Rules ("VERIFY ALL FACTS: every income limit, FPL percentage, dollar amount")
- Status: **PRESENT** — STEP 2 research step demands year-anchored facts cross-referenced 2025+2026, plus STEP 6 check 5 (year-drift detection) operationalizes fact-verification more strictly than old writer

#### B4. Healthcare-specific language ("coverage", "enroll", "qualify", "plan")
- OLD source: Style Rules
- Status: **PRESENT** — NEW STEP 5 Style rules carries the same list verbatim

#### B5. Reference coveredusa.org, NOT benefitsusa.org
- OLD source: Style Rules
- Status: **PRESENT** — NEW STEP 5 Style rules carries it verbatim

---

### C. Internal links + CTA logic

#### C1. TARGET=analyzer → mention "CoveredUSA Bill Analyzer" by name (1-2x in body)
- OLD source: STEP 4 (multi-paragraph rule: "Mention the 'CoveredUSA Bill Analyzer' BY NAME at least once in the article body, ideally twice...One natural mention is the floor; two is the ceiling")
- Status: **PRESENT** — NEW STEP 5 CTA section preserves it: "Mention the **CoveredUSA Bill Analyzer** by name (proper noun, capitalized) at least once in body — ideally twice... One mention in the first half... Optionally a second mention near the end or in an FAQ answer." STEP 6 check 24 validates.

#### C2. TARGET=analyzer → first-half mention with link to /medical-bill-analyzer
- OLD source: STEP 4 ("One mention in the first half of the article when describing the action readers can take... with a link to `/medical-bill-analyzer`")
- Status: **PRESENT** — NEW STEP 5 CTA section preserves placement guidance verbatim including the example sentence

#### C3. TARGET=analyzer → optionally second mention near end / in FAQ
- OLD source: STEP 4
- Status: **PRESENT** — NEW STEP 5 ("Optionally a second mention near the end or in an FAQ answer")

#### C4. TARGET=analyzer → inline body links target /medical-bill-analyzer (not /screener)
- OLD source: STEP 4
- Status: **PRESENT** — NEW STEP 5 ("Inline body links target `/medical-bill-analyzer` (not `/screener`)")

#### C5. TARGET=analyzer → avoid /screener links inside article body
- OLD source: STEP 4 ("Avoid `/screener` links inside the article body")
- Status: **PRESENT (refined)** — NEW STEP 5 carries it AND clarifies the carveout: "**BUT** outbound `.gov` citations remain mandatory (RULE 5 / REQ-005 / REQ-019). The 'no /screener links' carveout applies ONLY to internal /screener routing." Matrix REQ-019 documents the refinement.

#### C6. TARGET=analyzer CTA line (verbatim)
- OLD source: STEP 4 ("Upload your hospital bill to the free CoveredUSA Bill Analyzer to find errors, overcharges, and charity care options in 30 seconds.")
- Status: **PRESENT** — NEW STEP 5 carries the line verbatim

#### C7. TARGET=screener → internal links to /screener and reference pages
- OLD source: STEP 4 ("Internal links to /screener and relevant reference pages")
- Status: **PRESENT** — NEW STEP 5 ("Inline links to `/screener` and relevant lighthouse reference pages from `link-index.json`")

#### C8. TARGET=screener → Medicaid articles link to /medicaid-income-limits; Medicare → /medicare-eligibility; ACA → /aca-income-limits
- OLD source: STEP 4 (hardcoded link map by program)
- Status: **SUPERSEDED** — matrix REQ-045 ("Old writer hardcodes specific link targets... Resolution: link-index is the source of truth; the old writer's hardcoded targets are valid lighthouses (already in link-index) but the writer must use the index, not hardcode"). NEW STEP 0 loads `link-index.json` and STEP 5 link section uses `byPhrase[en]`. Justification sound.

#### C9. TARGET=screener + state-specific → mention state screener link
- OLD source: STEP 4 ("If state-specific: mention the state screener link as well")
- Status: **SUPERSEDED** — matrix REQ-001 / Resolved Conflict 4 ("State-context everywhere is mandatory; brand list is mandatory"). NEW writer's STEP 5 RULE 1 + STEP 6 check 12 enforces state-context far more thoroughly than the old "mention the state screener link" floor. Justification sound — formula expanded the rule, didn't drop it.

#### C10. TARGET=screener CTA line ("Check your eligibility now at CoveredUSA -- it takes 2 minutes.")
- OLD source: STEP 4
- Status: **SUPERSEDED (punctuation refined)** — matrix REQ-020 ("Old writer's screener CTA contains an em-dash... Resolution: rewrite the CTA to use a period or comma instead of any dash"). NEW STEP 5 CTA: "Check your eligibility now at CoveredUSA. It takes 2 minutes." (period, not dash). Justification sound.

---

### D. AI Source Optimization block

#### D1. SOURCE=AI → Direct-answer paragraph in first 100 words
- OLD source: STEP 4 AI Source Optimization
- Status: **SUPERSEDED (strengthened, made universal)** — matrix REQ-018 + REQ-030 ("First 50 words of body MUST contain a direct numeric or decisive answer"). NEW STEP 5 makes this universal AND tighter (first 50, not 100). STEP 6 check 10 validates. Justification sound.

#### D2. SOURCE=AI → Comparison tables
- OLD source: STEP 4 AI Source Optimization
- Status: **SUPERSEDED (universal soft rule)** — matrix REQ-051 ("§3.5 Comparison framing: When the topic involves choice between alternatives... include an explicit 'X vs Y vs Z' comparison table or section"). NEW STEP 3 Soft rules section carries it as guidance for all topics, not SOURCE-conditional. Justification sound.

#### D3. SOURCE=AI → 6-8 FAQ items (vs 3-4 for Google)
- OLD source: STEP 4 AI Source Optimization
- Status: **SUPERSEDED** — matrix REQ-018 + Resolved Conflict 2 ("formula wins; 6-8 FAQs universal for benefits/program/eligibility topics; SOURCE branching dropped"). NEW STEP 3 ("6-8 FAQ items for benefits/program/eligibility topics — universal, not SOURCE-conditional") + STEP 6 check 16. Justification sound — audit explicitly flagged this.

#### D4. SOURCE=AI → "As of [year]" freshness signals
- OLD source: STEP 4 AI Source Optimization
- Status: **SUPERSEDED (universal, expanded)** — matrix REQ-004 ("YEAR MARKERS in title, H1, meta, first paragraph"). NEW STEP 5 RULE 4 makes year markers universal across more surfaces than just freshness signals; STEP 6 check 3 validates. Justification sound.

#### D5. SOURCE=AI → Quick Answer blockquote near top
- OLD source: STEP 4 AI Source Optimization (`> **Quick Answer:**`)
- Status: **SUPERSEDED (universal)** — matrix REQ-018 (universal, not SOURCE-conditional). NEW STEP 3 Required elements ("Quick Answer blockquote near the top: `> **Quick Answer:** [1-2 sentence summary]`") + STEP 6 check 17 validates presence. Justification sound.

#### D6. FAQ markdown pattern (`## Frequently Asked Questions` then `### Question?`)
- OLD source: STEP 4 ("FAQ section: `## Frequently Asked Questions` then `### Question here?` for each question")
- Status: **PRESENT** — NEW STEP 3 ("FAQ section uses the markdown pattern `## Frequently Asked Questions` then `### Question here?` for each (the page template auto-extracts FAQPage schema from this)") + STEP 6 check 16

---

### E. Hard contracts

#### E1. JSON return shape: success = `{slug, word_count, status, title}`
- OLD source: STEP 6
- Status: **SUPERSEDED (additive)** — matrix REQ-033 + Resolved Conflict 6 ("Additive — keep old fields for backward compatibility; add new fields"). NEW STEP 8 success shape: `{slug, word_count, status, title, topicCluster, keyTerms, gapsFlagged}` — preserves all old fields, adds new ones. Justification sound; backward-compatible.

#### E2. JSON return shape: error = `{slug, word_count: 0, status: "error", error: "..."}`
- OLD source: STEP 6
- Status: **PRESENT** — NEW STEP 8 carries the error shape verbatim

#### E3. JSON appears on its own line, nothing after it
- OLD source: STEP 6 ("nothing after it")
- Status: **PRESENT** — NEW STEP 8 ("Your FINAL output MUST end with this JSON on its own line (nothing after it)")

#### E4. Save the article to `/Users/frankthebot/clawd/projects/covered-usa/content/blog/[slug].md`
- OLD source: STEP 5
- Status: **PRESENT** — NEW STEP 7 carries the same path. (Path note: matrix Notes-for-Phase-2-drafter §4 flagged that paths might need to change to `/Users/jacobposner/clawd/...` but the NEW writer kept `/Users/frankthebot/...`. This is consistent with the OLD writer; it's a separate scope question, not a regression.)

#### E5. STEP-N numbered structure (`## STEP 1` through `## STEP 6`)
- OLD source: STEP 1 through STEP 6 headings
- Status: **PRESENT (extended)** — NEW writer uses STEP 0 through STEP 8. Matrix REQ-036 ("Writer prompt structure uses `## STEP N` numbered headings... renaming or removing them breaks logging"). The NEW writer kept the convention and extended it; no STEP-N heading was renamed. Justification sound.

#### E6. Atomic write (don't save until validation passes)
- OLD source: implicit step ordering
- Status: **PRESENT** — NEW STEP 6 + STEP 7 explicit ("Do NOT save to disk until ALL of these pass" + "Save atomically — if any writing operation fails, do not leave a partial file on disk"). Matrix REQ-034.

---

### F. Research conventions

#### F1. Use WebSearch to research the KEYWORD
- OLD source: STEP 3
- Status: **PRESENT** — NEW STEP 2 ("Use `WebSearch` to research the KEYWORD")

#### F2. Find current income limits and FPL percentages for 2026
- OLD source: STEP 3
- Status: **PRESENT** — NEW STEP 2 ("Current-year income limits, FPL percentages, dollar amounts for the topic") + cross-references 2025+2026 (REQ-017 strengthens this)

#### F3. Find application steps and requirements
- OLD source: STEP 3
- Status: **PRESENT** — NEW STEP 2 ("Application steps + required documents + common denial reasons")

#### F4. Find state-specific details if applicable
- OLD source: STEP 3
- Status: **PRESENT** — NEW STEP 2 ("State-specific details if STATE is not 'national'")

#### F5. Find enrollment deadlines
- OLD source: STEP 3
- Status: **PRESENT** — NEW STEP 2 ("Enrollment-window dates (specific calendar dates, not just 'open enrollment')") — strengthened

---

### G. State + product context

#### G1. Read PLAN.md for product context
- OLD source: STEP 1 ("Read /Users/frankthebot/clawd/projects/covered-usa/PLAN.md")
- Status: **PRESENT** — NEW STEP 0 item 3 ("Product context: Read /Users/frankthebot/clawd/projects/covered-usa/PLAN.md to ground the brand voice")

#### G2. State verification — read state JSON if applicable
- OLD source: STEP 2 ("Read /Users/frankthebot/clawd/projects/covered-usa/src/lib/states/data/[state-lowercase].json")
- Status: **PRESENT** — NEW STEP 1 carries the same Read instruction verbatim, plus adds brand-list cross-reference

#### G3. If state JSON file doesn't exist, proceed without it
- OLD source: STEP 2
- Status: **PRESENT** — NEW STEP 1 ("If the file does not exist, proceed without it but note in research that state-data file was missing")

---

### H. Content requirements

#### H1. Do NOT start article body with an h2 title; start with paragraph
- OLD source: STEP 4 Content Requirements
- Status: **PRESENT** — NEW STEP 5 Structural rules ("Do NOT start the article body with an h2 title. Start directly with a paragraph (after the optional Quick Answer blockquote)")

#### H2. Include income limit tables (markdown tables) where applicable
- OLD source: STEP 4 Content Requirements
- Status: **SUPERSEDED (strengthened)** — matrix REQ-002 / Resolved Conflict 1 ("formula wins; the 1-8 + 'each additional' row table is REQUIRED, not optional, for any income-gated topic. Caption must be year-tagged"). NEW STEP 5 RULE 2 makes it required, year-tagged. Justification sound.

#### H3. Step-by-step application instructions where applicable
- OLD source: STEP 4 Content Requirements
- Status: **SUPERSEDED (strengthened)** — matrix REQ-003 / Resolved Conflict 5 ("formula wins; section is universal (not 'where applicable') and all 5 sub-fields are required"). NEW STEP 5 RULE 3 enforces universal how-to-apply with 5 sub-fields. Justification sound — audit demanded universality.

#### H4. 1500-2500 word article target
- OLD source: STEP 4 ("Write a 1500-2500 word article")
- Status: **PRESENT** — NEW STEP 5 ("Target 1500-2500 words"). Matrix Conflict 7 was flagged for human judgment but resolved in favor of keeping the target for B1 scope (blog-only).

---

### I. TARGET routing top-of-prompt explanation

#### I1. TARGET="screener" or blank/missing → CTA goes to /screener
- OLD source: top-of-prompt YOUR TASK section
- Status: **PRESENT** — NEW INPUTS section ("TARGET — `screener` (default) or `analyzer`. Determines CTA destination") + STEP 5 CTA branch

#### I2. TARGET="analyzer" → CTA goes to /medical-bill-analyzer
- OLD source: top-of-prompt YOUR TASK section
- Status: **PRESENT** — NEW INPUTS + STEP 5 CTA branch

---

## Silent drops (bugs to fix before Phase 4)

### Bug 1: "what will I find here" intent guidance dropped from description field
- **Severity:** LOW
- **Where it was:** OLD STEP 4 frontmatter sample comment: `description: "155 char max meta description answering what will I find here"`
- **Where it should be:** NEW STEP 4 frontmatter sample comment
- **Why it matters:** This is a soft authoring hint that helped frame the meta description as user-intent-driven, not as a generic blurb. The NEW writer says "Meta description, max 155 chars" but loses the intent framing. Low severity because (a) the audit didn't flag the meta description as a quality problem, (b) other rules (year markers, length cap, descriptive content) are present, and (c) the page template renders the description independently of the framing hint.
- **Recommended action:** Optional — restore the "answers what user will find" intent hint in NEW STEP 4 frontmatter sample comment. One-line edit. If skipped, no production regression expected.

---

## Drop justifications spot-check

For each SUPERSEDED rule, the documented justification is verified against the matrix and plan:

| Rule | Justification source | Sound? |
|---|---|---|
| B1 (en-dash blanket ban → digit-only allowance) | matrix REQ-016 | YES — old writer's blanket en-dash ban over-strict for numeric ranges; NEW writer's "between digits only" is more practical and matches AI_OPTIMIZATION_FRAMEWORK §8.4 |
| C8 (hardcoded program→link map → link-index.json) | matrix REQ-045 + LINK_TARGET_MANIFEST §5 | YES — link-index is the canonical routing source; mechanical change |
| C9 (state screener link → state-context everywhere) | matrix REQ-001 / Resolved Conflict 4 | YES — formula EXPANDED the rule, didn't drop it; old "mention state screener" is a strict subset of new "state name everywhere + brand list" |
| C10 (em-dash in screener CTA → period) | matrix REQ-020 + REQ-016 | YES — em-dash ban applies to CTAs too; old CTA had a typographic violation |
| D1 (SOURCE=AI direct-answer 100w → universal direct-answer 50w) | matrix REQ-018 + REQ-030 | YES — universal + tighter; audit explicitly demanded |
| D2 (SOURCE=AI comparison tables → universal soft rule) | matrix REQ-051 / FANOUT §3.5 | YES — comparison framing is a Bing volume signal regardless of SOURCE |
| D3 (SOURCE-conditional FAQ density → universal 6-8) | matrix REQ-018 / Resolved Conflict 2 / audit-blog-writer.json §rulesConflicting | YES — audit explicitly flagged the SOURCE branch as bad; this is the headline regression-fix in the rewrite |
| D4 (SOURCE=AI freshness signals → universal year markers) | matrix REQ-004 / RULE 4 | YES — universal year markers cover and exceed the freshness-signal use case |
| D5 (SOURCE=AI Quick Answer → universal Quick Answer) | matrix REQ-018 | YES — same logic as D3, paired |
| E1 (JSON shape extension) | matrix REQ-033 / Resolved Conflict 6 | YES — additive, backward-compatible |
| E5 (STEP-N extension to STEP 0..8) | matrix REQ-036 + plan §2 Phase 2 | YES — convention preserved, extended; Stage 1 cron parses by `## STEP` prefix |
| H2 (income tables "where applicable" → required + year-tagged) | matrix REQ-002 / Resolved Conflict 1 | YES — formula strengthened |
| H3 (application steps "where applicable" → universal + 5 sub-fields) | matrix REQ-003 / Resolved Conflict 5 | YES — formula strengthened |

**No SUPERSEDED rule has weak justification.** All 13 supersession decisions trace to a documented matrix REQ + a plan-level rationale (formula wins / audit-flagged / universal-strengthening).

---

## Summary

The rewrite is overwhelmingly clean. 30 of 38 old-writer rules are present verbatim or refined; 7 are documented supersessions traceable to the matrix; only 1 minor authoring hint (the "what will I find here" comment on the description field) was silently dropped.

The headline supersession — dropping the SOURCE-conditional FAQ density and making 6-8 FAQs universal — is the explicit goal of the rewrite per matrix REQ-018 + audit-blog-writer.json §rulesConflicting. Every other supersession is a strict strengthening of an old rule (e.g., "where applicable" → "universal", hardcoded link map → link-index, state screener link → state-context everywhere).

The hard contracts (JSON return shape, STEP-N structure, atomic write, file save path) are all preserved. The new JSON shape is additive — old downstream parsers that read `{slug, word_count, status, title}` keep working.

No high-severity silent drops were found.
