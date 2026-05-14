# Phase 2C — Q&A Pages Track

**Status:** In progress
**Started:** 2026-05-14
**Goal:** Templatize `/does-medicare-cover-dental` into `/qa/[question]` dynamic route + build agent infra for mass-production. Workflow first, mass-production later (per Jacob's directive — build all template tracks first, then bulk-run them at once).

---

## Why Q&A pages are different from procedures/drugs

Q&A pages are **question-anchored** (not entity-anchored). The URL is the question. The page renders:
1. The question as H1
2. A one-line short answer (yes/no/sometimes)
3. A 2-4 sentence full answer (nuanced)
4. A coverage breakdown table (often comparing plan types)
5. Flexible detail sections (varies by question — some have alternatives, some don't)
6. FAQ section with related sub-questions
7. ScreenerCTA (not AnalyzerCTA — Q&A funnels to eligibility tool)

**Schema.org:** Uses `QAPage` (single canonical Q&A) — distinct from FAQPage. This matters for AI citation: ChatGPT/Perplexity treat QAPage as a definitive answer source.

**CTA target:** Defaults to `screener` (eligibility), can be `analyzer` for bill-related Q&As.

## Pace target

Same as procedures/drugs. 30/day rollout. Total Q&A corpus target: 100-200 pages.

## Lessons from 2A + 2B (baked in from start)

1. `_`-prefix file exclusion in loader from the start
2. Nullable fields where the entity doesn't have them (some Q&As don't have alternatives, some don't have dual-eligible angle)
3. FAQ shape: flat strings, not LocalizedString (same rule)
4. Atomic write pattern
5. replace_all banned on bare values in verifier
6. Build-time validator + prebuild hook
7. Schema.org enum strictness (categorical fields locked to valid values)
8. routeOfAdministration-style enum for ctaTarget ('screener' | 'analyzer')

## Tasks

| # | Task | Status |
|---|------|--------|
| C-A1 | Inventory dental page fields | todo |
| C-A2 | Define QA TypeScript schema | todo |
| C-A3 | Extract dental.tsx → dental.json | todo |
| C-A4 | Build src/lib/qa.ts loader | todo |
| C-A5 | Convert /does-medicare-cover-dental → /qa/[question] | todo |
| C-A6 | Extend sitemap | todo |
| C-A7 | validate-qa.js + prebuild hook | todo |
| C-A8 | Build passes | todo |
| C-B1 | qa-writer agent | todo |
| C-B2 | qa-verifier agent | todo |
| C-B3 | qa-bulkgen + queue + helper | todo |
| C-B4 | Test on 2 Q&A pages | todo |
| C-B5 | Critic review | todo |
| Iter | Apply critic fixes | todo |
| Cmt | Commit + push | todo |

## Progress Log

### 2026-05-14
- Phase 2A (procedures) + 2B (drugs) shipped successfully
- Jacob directive: build workflows for all remaining template types (Q&A, glossary, trigger events, persona, hub) before mass-producing
- Started Phase 2C (Q&A track)
- Progress doc created (this file)

**Phase C-A (route + loader + data) — DONE.**
- C-A1-A4: Built `src/lib/qa.ts` with full QA interface + loaders. Lessons baked in from start: `_`-prefix filter, optional fields, status-coded table cells (yes/no/partial — added `partial` since Q&A has more nuanced coverage states than procedures/drugs).
- C-A3: Extracted `/does-medicare-cover-dental` to `content/data/qa/does-medicare-cover-dental.json`. 18 sections, 8 EN+ES FAQs.
- C-A5: Converted to `/qa/[question]` dynamic route. ScreenerCTA vs AnalyzerCTA chosen by `ctaTarget` field.
- C-A6: Sitemap auto-pulls QA slugs.
- C-A7: `scripts/validate-qa.js` + prebuild hook.
- C-A8: Build exit 0.
- **Extended `ReferenceTable` component** to support `status: 'partial'` (amber dash icon). First Phase 2 change to a shared component.

**Phase C-B (agents) — DONE.**
- C-B1: `coveredusa-qa-writer` agent.
- C-B2: `coveredusa-qa-verifier` agent.
- C-B3: `coveredusa-qa-bulkgen` cron + `coveredusa-qa-queue.js` helper + 10-entry queue.

**Writer tests — PASSED:**
- `does-medicare-cover-vision`: 1,700 words, 5 detail sections, 3 coverage rows, 8 EN+ES FAQs, locked enums correct.
- `does-medicaid-cover-rehab`: 1,750 words, 5 detail sections, 6 coverage rows (mixing yes/partial statuses), 8 EN+ES FAQs. Stress-tested "yes" answer pattern. ACA EHB referenced, 40+DC expansion states cited.

**Critic review — DONE.** 12 issues (2 critical, 4 high, 4 medium, 2 low). 8 actionable fixes applied:

| # | Severity | Fix |
|---|----------|-----|
| 1 | Critical | Verifier now does INTERNAL CONSISTENCY CHECK as STEP 1A (before primary-source work). shortAnswer/fullAnswer/coverageBreakdown drift → always FLAG, never silently edit one field to match another. |
| 2 | Critical | Added `pageType` enum: `coverage` (default, requires coverageBreakdown) / `terminology` / `definition` / `eligibility` (coverageBreakdown optional). Writer prompt: don't fabricate tables for terminology questions. Validator enforces. |
| 3 | High | Status/text coherence lint in validate-qa.js. `status="no"` cell with text "Yes" → build fail. |
| 4 | High | Mid-CTA split guard: pages with ≤2 detail sections render them all pre-CTA (avoids back-to-back CTAs). Validator requires minimum 2 sections. |
| 5 | High | Verifier MUST force `status: "flagged"` when fullAnswer contains a value corrected elsewhere. Never let the fullAnswer ship with stale data while other fields are updated. |
| 6 | High | ctaTarget heuristic tightened in writer prompt: use "analyzer" whenever answer discusses cost-share/deductible/coinsurance, "screener" only for who-qualifies questions. Recategorized cataract-surgery + physical-therapy queue entries to analyzer. |
| 7 | Medium | Coverage Q&A enum now has guidance: use for terminology/definition/cross-category. Recategorized `is-aca-marketplace-the-same-as-obamacare` + `what-counts-as-income-for-medicaid` queue entries. |
| 8 | Medium | Validator allows pageType to default to "coverage" if omitted (back-compat). |

**Deferred (accepted/low):**
- Critic #8 (frankthebot path bug): same as Phase 2A/2B — established pattern, hardcoded for production Mac mini, local tests substitute jacobposner.
- Critic #9 (dead /qa/<slug> link validation): defer until we have more Q&As in flight.
- Critic #10 (amber color polish for partial icon): cosmetic, acceptable as-is.
- Critic #11 (atomic write Bash mv detail): minor clarity issue, no harm.
- Critic #12 (category equality enforcement): writer prompt now says "MUST equal CATEGORY input"; soft rule.

**Final test results:**
- 3 QA JSONs validate: dental ✅, vision ✅, rehab ✅
- Full build: exit 0
- Phase 2C infrastructure ready for mass production

**Phase 2C summary at a glance:**
- 1 dynamic route: `/qa/[question]`
- 1 loader: `src/lib/qa.ts`
- 1 validator: `scripts/validate-qa.js`
- 2 agents: `coveredusa-qa-writer`, `coveredusa-qa-verifier`
- 1 cron: `coveredusa-qa-bulkgen`
- 1 helper: `coveredusa-qa-queue.js`
- 3 sample QAs live (dental + vision + rehab)
- 10 QAs queued for next batch
