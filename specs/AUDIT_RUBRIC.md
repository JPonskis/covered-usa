# Audit Rubric

**Anchored to commit:** covered-usa@2612ee7 (Phase 4 bridge doc + deep-research prompt for grounding mechanics)
**Framework reference:** `specs/AI_OPTIMIZATION_FRAMEWORK.md` v1.1
**Purpose:** Scoring rubric for all parallel audit agents. Every agent uses these same criteria so scores are comparable across templates.

---

## Scoring conventions

Each rule in each category gets one of four scores:

- **PASS** — Implementation matches the framework rule.
- **PARTIAL** — Implementation matches the rule for some pages / cases but not others, OR matches in spirit but not literally.
- **FAIL** — Implementation does not match the rule.
- **N/A** — The rule does not apply to this template / surface.

## Severity tagging

Each FAIL or PARTIAL gets a severity, anchored to the framework's evidence grade for that rule:

- **CRITICAL** — Rule is `[CONFIRMED]` or `[CONFIRMED PRIMARY]` in the framework. Direct evidence of citation impact.
- **MAJOR** — Rule is `[LIKELY]` or `[CONFIRMED SECONDARY]`. Strong inference.
- **MINOR** — Rule is `[INFERRED]`. Operator convention, not proven.

## Effort tagging

Each gap gets an effort tag:

- **S** (small) — Writer-agent prompt edit only. No code change, no data regeneration.
- **M** (medium) — Writer-agent prompt + validator script change + selective re-run of existing data files.
- **L** (large) — New template, new schema, new dynamic route, OR template-wide regeneration of all existing pages.

## Verification method tagging

Each rule check declares how it was verified:

- **[STATIC]** — Verified via file read / grep / DOM check. Reproducible.
- **[LLM-JUDGE]** — Required content judgment. Reviewer's call.
- **[MANUAL]** — Editorial review required; flagged for human assessment.

---

## The 14-Category Scoring Rubric

### Category 1 — URL & Slug Architecture

**Rule 1.1.** Existing pages retain current slugs; new pages use stable slugs (no year anchor). [LIKELY → MAJOR if fails]
- PASS: New template slugs are stable; existing pages untouched.
- FAIL: Any new content (post-audit anchor commit) uses year-anchored slugs.
- Verify: [STATIC] grep new content files for `-202X` in slug.

**Rule 1.2.** Primary entity closest to root in slug. [INFERRED → MINOR]
- PASS: Slug like `/cost/mri` puts entity first.
- FAIL: Slug like `/healthcare-costs/mri-pricing-guide-2026` buries entity.
- Verify: [LLM-JUDGE]

**Rule 1.3.** Slug ≤ 60 chars. Hyphens only. [INFERRED → MINOR]
- Verify: [STATIC]

**Rule 1.4.** State/locale anchored as static subdirectory, not query param. [INFERRED → MINOR]
- PASS: `/medicare-advantage/california`.
- FAIL: `/medicare-advantage?state=ca`.
- Verify: [STATIC]

### Category 2 — Title Tag & Meta Description

**Rule 2.1.** Front-load exact intent match in title. [INFERRED → MINOR]
- PASS: Title starts with primary entity + answer intent.
- Verify: [LLM-JUDGE]

**Rule 2.2.** Current-year markers (2026) in titles for YMYL topics. [INFERRED → MINOR]
- PASS: Title contains "2026".
- Verify: [STATIC] grep `2026` in `meta.title.en`.

**Rule 2.3.** Numeric specificity in title where applicable. [INFERRED → MINOR]
- PASS: Title includes dollar figure / count / percentage when relevant.
- Verify: [LLM-JUDGE]

**Rule 2.4.** Meta description as dense factual answer; under 160 chars; title under 70 chars. [LIKELY → MAJOR for length caps; INFERRED → MINOR for density]
- Verify: [STATIC] character count of `meta.title.en` and `meta.description.en`.

**Rule 2.5.** Em-dashes banned in meta title and description. **En-dashes between digits in price ranges are allowed.** [LIKELY → MAJOR]
- Verify: [STATIC] grep `—` (em-dash) anywhere; grep `–` (en-dash) only outside `\d–\d` patterns.

### Category 3 — H1 & Heading Hierarchy

**Rule 3.1.** H2s map to fan-out variants (Equivalent / Follow-up / Generalization / Specification / Canonicalization / Translation / Entailment / Clarification). At least 4-5 of 8 variants covered. [INFERRED → MINOR]
- Verify: [LLM-JUDGE] Inspect H2 list; map to fan-out variants.

**Rule 3.2.** H2s phrased as natural-language questions where user-question intent exists. [INFERRED → MINOR]
- Verify: [LLM-JUDGE]

**Rule 3.3.** Heading depth H2–H4 only; no H5/H6. [CONFIRMED → CRITICAL]
- Verify: [STATIC] grep for `^#####` in markdown or `<h5>`/`<h6>` in rendered output.

**Rule 3.4.** Balanced section length distribution (ratio approximately 0.3 ± across non-root sections). [CONFIRMED — relaxed; this is a soft heuristic]
- Verify: [LLM-JUDGE]

**Rule 3.5.** H3s entity-rich; no generic "Overview". [INFERRED → MINOR]
- Verify: [LLM-JUDGE]

### Category 4 — First-Paragraph Design

**Rule 4.1.** Direct numeric answer in first 50 words (or 80 for non-numeric Q&A). [INFERRED → MAJOR — high-leverage operator convention]
- Verify: [LLM-JUDGE] Read hero + quickAnswer + first introParagraph; check for direct numeric/decisive answer.

**Rule 4.2.** No fluff openings; no rhetorical questions; no anecdotes. [INFERRED → MINOR]
- Verify: [LLM-JUDGE]

**Rule 4.3.** Unhedged numeric claims inline ($1,328, not "around $1,300"). [INFERRED → MINOR]
- Verify: [LLM-JUDGE]

**Rule 4.4.** Sentence-initial `<strong>` on core entities. [CONFIRMED density target, INFERRED position → MAJOR for density gap, MINOR for position]
- Verify: [STATIC] count `<strong>` tags vs total word count for density; [LLM-JUDGE] for position.

**Rule 4.5.** First sentence of each paragraph includes the named entity explicitly. [INFERRED → MINOR]
- Verify: [LLM-JUDGE] Read each paragraph-opening sentence; check for pronouns referring to primary entity.

### Category 5 — Per-Paragraph Chunk Design

**Rule 5.1.** Paragraph length 150–300 words for body prose; FAQ answers may run 80–150. [CONFIRMED for body, INFERRED for FAQ → CRITICAL for body, MINOR for FAQ]
- Verify: [STATIC] count words per paragraph in introParagraphs, detailSections, explanationParagraphs, FAQ answers.

**Rule 5.2.** Self-contained paragraphs; no "as mentioned above" / no orphan pronouns. [INFERRED → MAJOR]
- Verify: [LLM-JUDGE] Extract each paragraph in isolation; does it still convey its claim?

**Rule 5.3.** Bigram/trigram overlap with likely LLM phrasing. [INFERRED → MINOR]
- Verify: [LLM-JUDGE]

**Rule 5.4.** Canonical industry terminology (Canonicalization fan-out alignment). [INFERRED → MINOR]
- Verify: [LLM-JUDGE]

**Rule 5.5.** Standard HTML block elements as semantic boundaries. [CONFIRMED → CRITICAL if violated]
- Verify: [STATIC]

### Category 6 — Table & List Usage

**Rule 6.1.** Combined `<table>` + `<ul>` + `<ol>` content as fraction of total body content: 25–35%. [CONFIRMED → CRITICAL if outside `[0.10, 0.50]`; MINOR if outside `[0.20, 0.40]`]
- Verify: [STATIC] count table/list word content vs total body word count.

**Rule 6.2.** HTML `<table>` only for tabular data (not CSS grid). [CONFIRMED → CRITICAL]
- Verify: [STATIC] inspect rendered output.

**Rule 6.3.** Numeric comparison data embedded in tables, not inline prose. [LIKELY → MAJOR]
- Verify: [LLM-JUDGE]

**Rule 6.4.** Explicit `<th>` column headers on every table. [CONFIRMED → CRITICAL]
- Verify: [STATIC]

**Rule 6.5.** `<caption>` tags on tables. [CONFIRMED → MAJOR]
- Verify: [STATIC]

### Category 7 — Schema.org Graph

**Rule 7.1.** `MedicalWebPage` schema on every health content page. [LIKELY → MAJOR]
- Verify: [STATIC] grep for `MedicalWebPage` JSON-LD emission in route file.

**Rule 7.2.** `FAQPage` schema with visible Q&A in DOM. [CONFIRMED → CRITICAL]
- Verify: [STATIC]

**Rule 7.3.** `Dataset` schema for substantive numeric tables. [INFERRED → MAJOR]
- Verify: [STATIC]

**Rule 7.4.** `DefinedTerm` schema on glossary entries. [LIKELY → MAJOR]
- Verify: [STATIC]

**Rule 7.5.** Type-specific schema (MedicalProcedure / Drug / QAPage / HowTo) per template. [LIKELY → MAJOR]
- Verify: [STATIC]

**Rule 7.6.** Schemas linked via `@graph` not stacked `@type`. [LIKELY → MAJOR]
- Verify: [STATIC]

**Rule 7.7.** Author + reviewer marked up with `Person` schema. [LIKELY → MAJOR for author, INFERRED → MINOR for reviewer until reviewer slot populated]
- Verify: [STATIC]

### Category 8 — Author & Reviewer Attribution

**Rule 8.1.** Visible credentialed byline on every health content page. [CONFIRMED → CRITICAL]
- Verify: [STATIC] page-template inspection for byline rendering.

**Rule 8.2.** `Person` schema with `sameAs` to LinkedIn/ORCID. [INFERRED → MINOR]
- Verify: [STATIC]

**Rule 8.3.** Visible medical/policy reviewer for clinical claims. [LIKELY → MAJOR — known gap, no reviewer sourced yet]
- Verify: [STATIC]

**Rule 8.4.** Editorial methodology page linked from author bio. [INFERRED → MINOR]
- Verify: [STATIC]

### Category 9 — Inline Source Citations

**Rule 9.1.** ≥ 3 primary sources per page; .gov / .edu / Microsoft-allow-listed entities preferred. [CONFIRMED → CRITICAL]
- Verify: [STATIC] count `sources` array length; check domain.

**Rule 9.2.** Bracketed numeric citations ([1], [2]) inline beside claims. [INFERRED → MINOR — currently uncommon in templates]
- Verify: [LLM-JUDGE]

**Rule 9.3.** No outbound links to unverified aggregators / direct competitors. [INFERRED → MAJOR]
- Verify: [LLM-JUDGE]

**Rule 9.4.** Descriptive anchor text on sources. [INFERRED → MINOR]
- Verify: [LLM-JUDGE]

### Category 10 — Internal Linking Architecture

**Rule 10.1.** Internal links present to designated cluster representatives / lighthouses. [LIKELY → MAJOR]
- Verify: [LLM-JUDGE]

**Rule 10.2.** Exact-match, entity-dense anchor text on internal links. [INFERRED → MINOR]
- Verify: [LLM-JUDGE]

**Rule 10.3.** ~1 internal link per 150-200 word chunk. [INFERRED → MINOR]
- Verify: [STATIC] count internal links / total word count.

**Rule 10.4.** Hub-and-spoke (lighthouse ↔ cluster) architecture. [INFERRED → MINOR — depends on overall site IA]
- Verify: [LLM-JUDGE]

### Category 11 — Freshness Signals

**Rule 11.1.** Substantive monthly content review for high-value pages. [INFERRED → MINOR — no maintenance cron exists yet]
- Verify: [MANUAL — no infrastructure to check yet]

**Rule 11.2.** Real DOM mutations on update (not metadata-only bumps). [INFERRED → MINOR]
- Verify: [MANUAL]

**Rule 11.3.** IndexNow API ping on every edit (not just publish). [CONFIRMED PRIMARY recommendation → MAJOR — known gap, Stage 2 cron currently fires only on publish]
- Verify: [STATIC] inspect Stage 2 cron + IndexNow script for edit-trigger.

**Rule 11.4.** `dateModified` schema syncs with sitemap `lastmod` and visible "Updated". [CONFIRMED PRIMARY recommendation → MAJOR]
- Verify: [STATIC] check schema emission vs sitemap.ts vs page template.

**Rule 11.5.** `data-nosnippet` available for stale section exclusion. [CONFIRMED PRIMARY → MINOR — currently optional, no need to enforce yet]
- Verify: [STATIC]

### Category 12 — Spanish / Localization

**Rule 12.1.** Bidirectional `hreflang` tags. [CONFIRMED → CRITICAL]
- Verify: [STATIC] inspect generateMetadata in each route.

**Rule 12.2.** High-fidelity Spanish translation (no machine-translation passthrough). [LIKELY → MAJOR]
- Verify: [LLM-JUDGE]

**Rule 12.3.** Spanish-language primary sources where they exist; English fallback when not. [INFERRED → MINOR]
- Verify: [LLM-JUDGE]

**Rule 12.4.** Spanish state names where they differ. [INFERRED → MINOR]
- Verify: [LLM-JUDGE]

### Category 13 — Core Web Vitals & Hygiene

**Rule 13.1.** Sub-second DOM text rendering on initial load. [LIKELY → MINOR — out of audit scope, infrastructure check]
- Verify: [MANUAL]

**Rule 13.2.** Server-rendered core answer content. [CONFIRMED → CRITICAL]
- Verify: [STATIC] Next.js SSR confirmed via build output.

**Rule 13.3.** Mobile responsive. [LIKELY → MINOR]
- Verify: [MANUAL]

**Rule 13.4.** No critical content hidden behind tabs/JS. [LIKELY → MAJOR]
- Verify: [LLM-JUDGE]

### Category 14 — Robots.txt & Crawler Permissions

**Rule 14.1.** `Allow: /` for `Bingbot`. [CONFIRMED → CRITICAL]
- Verify: [STATIC] inspect robots.ts.

**Rule 14.2.** ~~`Allow: /` for `Bing-AISearchCrawler`.~~ **REMOVED 2026-05-14** — verification against Microsoft's official crawler documentation confirmed no such user-agent exists. Bingbot itself powers Copilot grounding.

**Rule 14.3.** `Allow: /` for `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `PerplexityBot`, `Perplexity-User`, `ClaudeBot`, `Claude-User`, `Claude-SearchBot`. [INFERRED → MINOR]
- Verify: [STATIC]

**Rule 14.4.** `nosnippet` not applied to whole pages. [CONFIRMED PRIMARY → MAJOR]
- Verify: [STATIC]

**Rule 14.5.** `data-nosnippet` used selectively (optional). [CONFIRMED PRIMARY → MINOR]
- Verify: [STATIC]

---

## Output schema per audit agent

Each audit agent returns Markdown with this structure:

```
## Template / Surface: [name]

**Files inspected:**
- [list of files with paths]

**Per-page scorecards:**
| Rule ID | Page | Score | Severity | Effort | Notes |
|---|---|---|---|---|---|
| 5.1 | mri | FAIL | CRITICAL | M | introParagraphs avg 65 words (target 150-300) |

**Template-level pattern findings:**
- [Pattern across all pages of this template, e.g., "All 4 procedure pages have introParagraphs below 80 words"]

**Effort summary:**
- S gaps: N
- M gaps: N
- L gaps: N

**Recommendations (no implementation, just identification):**
- [What needs to change at template level, not page level]
```

---

## Calibration: /cost/mri scorecard

Section 13 of the framework already walks `/cost/mri` through the 14 categories. The audit agent for the procedure template MUST reproduce that scorecard. If the agent's MRI score diverges materially from Section 13, the rubric is mis-aligned.

Reference scorecard from framework Section 13:

| Rule | Status in Section 13 |
|---|---|
| 4.1 stable slug + no year-in-slug | PASS |
| 4.2 year in title | PASS |
| 4.2 numeric specificity in title | PARTIAL |
| 4.3 H2s mapped to fan-out variants | PARTIAL |
| 4.3 heading depth H2-H4 | PASS |
| 4.4 first 50 words direct answer | PASS |
| 4.4 sentence-initial strong | PARTIAL (underused) |
| 4.5 paragraph length 150-300 | PARTIAL (currently ~50-80 words) |
| 4.5 named entity in paragraph-opening sentences | PARTIAL |
| 4.6 25-35% structural | PASS |
| 4.7 full schema stack | PASS |
| 4.8 visible byline | PASS |
| 4.8 medical reviewer | FAIL |
| 4.9 inline .gov citations | PASS (could add bracketed [1] [2]) |
| 4.10 internal links | PASS |
| 4.11 IndexNow on edit | FAIL |
| 4.11 monthly numeric refresh | FAIL |
| 4.12 hreflang + Spanish | PASS |
| 4.13 SSR + mobile | PASS |
| 4.14 crawlers | PARTIAL (audit needed) |
| Style — em-dash in meta title | FAIL |

Net: ~15 pass / 5 partial / 5 fail. Agent should reproduce this.
