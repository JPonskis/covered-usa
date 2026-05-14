# Phase 2D — Glossary Pages Track

**Status:** In progress
**Started:** 2026-05-14
**Goal:** Templatize `/out-of-pocket-maximum` into `/glossary/[term]` dynamic route + build agent infra. Per Jacob's directive: workflow first, mass production later.

## Why glossary pages are different from Q&A

Glossary pages are **term-anchored** (not question-anchored, not entity-anchored). Each page defines a single healthcare-insurance term. Key differences from Q&A:

- **Schema.org `DefinedTerm`** (not QAPage). Different AI citation behavior — terms surface in "what is X" queries.
- **`alternateNames` array** — terms commonly have abbreviations (OOP Max, MOOP, MAGI, FPL, EOB, PA, etc.) that need to be schema-discoverable.
- **No short/full answer split** — just a single canonical definition.
- **Optional numeric limits table** — some terms have year-anchored dollar values (OOP max 2026 = $9,200; FPL household-of-1 = $15,960), others don't ("prior authorization" has no numbers).
- **"What counts toward" / "What does NOT count toward" lists** — common pattern for boundary-sensitive terms.
- **Worked example table** — illustrates the term in practice.

## Schema sections (mostly optional, render conditionally)

Required: term, definition, intro, detailSections, FAQs, sources.
Optional: alternateNames, annualLimits table, whatCountsToward list, whatDoesNotCountToward list, workedExample table.

## Tasks

| # | Task | Status |
|---|------|--------|
| D-A1 | Inventory OOP max page | todo |
| D-A2 | Glossary TypeScript schema | todo |
| D-A3 | Extract OOP max JSON | todo |
| D-A4 | glossary.ts loader | todo |
| D-A5 | Dynamic route /glossary/[term] | todo |
| D-A6 | Sitemap | todo |
| D-A7 | validate-glossary.js + prebuild | todo |
| D-A8 | Build passes | todo |
| D-B1 | glossary-writer agent | todo |
| D-B2 | glossary-verifier agent | todo |
| D-B3 | glossary-bulkgen + queue + helper | todo |
| D-B4 | Test on 2 terms | todo |
| D-B5 | Critic review | todo |
| Iter | Apply fixes | todo |
| Cmt | Commit + push | todo |

## Progress Log

### 2026-05-14
- Phase 2A, 2B, 2C complete. 9 sample pages live across procedure/drug/Q&A.
- Started Phase 2D (Glossary track)
- Progress doc created

**Phase D-A (route + loader + data) — DONE.**
- D-A1-A4: Built `src/lib/glossary.ts` with full Glossary interface + loader (`_`-prefix filter, optional fields, pickLocale helpers).
- D-A3: Extracted `/out-of-pocket-maximum` → `content/data/glossary/out-of-pocket-maximum.json` with all 4 optional sections (annualLimits, whatCountsToward, whatDoesNotCountToward, workedExample).
- D-A5: Converted to `/glossary/[term]` dynamic route. generateStaticParams, generateMetadata, conditional rendering of optional sections, mid-CTA split guard.
- D-A6: Sitemap auto-pulls glossary slugs.
- D-A7: `scripts/validate-glossary.js` + prebuild hook.
- D-A8: Full build exit 0.

**Phase D-B (agents) — DONE.**
- D-B1: `coveredusa-glossary-writer` agent with full schema guidance + 2026 anchor facts + locked enums.
- D-B2: `coveredusa-glossary-verifier` agent with internal consistency pre-check + grep-then-edit + force-flag for definition errors (mirror of qa-verifier).
- D-B3: `coveredusa-glossary-bulkgen` on-demand cron + `coveredusa-glossary-queue.js` helper + 10-entry queue (deductible, copay, coinsurance, MAGI, PTC, SEP, EOB, prior auth, HDHP, balance billing).

**Writer tests — PASSED:**
- `deductible.json`: 3,073 EN words, 4 alternate names, all 4 optional sections included (annualLimits with metal tier breakdown, whatCountsToward, whatDoesNotCountToward, workedExample), 3 detail sections, 8 EN+ES FAQs, ctaTarget=analyzer. Demonstrates the "rich numeric term" pattern.
- `magi.json`: 1,289 EN words, 4 alternate names, NO annualLimits / NO workedExample (correctly omitted for definitional/non-numeric term), generous whatCountsToward (12 items) + whatDoesNotCountToward (11 items), 4 detail sections, 8 EN+ES FAQs, ctaTarget=screener. Demonstrates the "pure definitional term" pattern.

**Critic review — DONE.** 7 issues (2 high, 3 medium, 2 low). 5 fixed:

| # | Severity | Fix |
|---|----------|-----|
| 1 | High | `term` canonical rule: use SPELLED-OUT form, acronym goes in `alternateNames`. Updated queue MAGI entry. |
| 2 | High | Definition derivation order: write `definition.en` first, then `quickDefinition` (same core claim + expansion), then `hero.subhero` (condensed + key number). Prevents the three surfaces from drifting. |
| 3 | Medium | workedExample-uses-annualLimits-values rule (numeric coherence across page). |
| 4 | Medium | detailSections min=2 kept; writer prompt notes acceptable second-section templates (Common Mistakes / Related Term Comparisons) to avoid filler. |
| 5 | Medium | Queue's `ctaTarget` is authoritative — writer doesn't override. Hybrid terms include both screener + analyzer in relatedLinks. |

**Deferred (low severity, accepted):**
- Critic #6: `inDefinedTermSet.url` en-only (DefinedTermSet is locale-agnostic, acceptable as-is).
- Critic #7: alternateNames not localized (acronyms are language-neutral anyway).

**Final test results:**
- All 3 glossary JSONs validate (out-of-pocket-maximum, deductible, magi)
- Build exit 0
- Phase 2D infrastructure ready for mass production

**Phase 2D summary:**
- 1 dynamic route: `/glossary/[term]`
- 1 loader: `src/lib/glossary.ts`
- 1 validator: `scripts/validate-glossary.js`
- 2 agents: `coveredusa-glossary-writer`, `coveredusa-glossary-verifier`
- 1 cron: `coveredusa-glossary-bulkgen`
- 1 helper: `coveredusa-glossary-queue.js`
- 3 sample entries live (OOP max + deductible + MAGI)
- 10 entries queued for mass-production
