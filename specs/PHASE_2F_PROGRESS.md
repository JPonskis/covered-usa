# Phase 2F — Persona Pages Track

**Status:** In progress
**Started:** 2026-05-14
**Goal:** Templatize `/health-insurance-for-gig-workers` into `/for/[persona]` dynamic route + agent infra. Sixth and final template track.

## What persona pages are

Audience-anchored landing pages. The persona (gig worker, self-employed, college student, early retiree, freelancer, small business owner, contractor, veteran, etc.) lands here and gets persona-specific framing of their coverage options.

Distinct from Q&A (question-anchored) and trigger events (life-event-anchored): persona pages target a STATUS (your work / life situation), not an event or question.

## Page structure

1. Hero with persona-specific framing
2. Quick Answer
3. Intro paragraphs
4. "Your N Real Options" — options table with brief comparison
5. Per-option detail sections (typically 3 options, each with heading + paragraphs)
6. Traps section — table of pitfalls + why-to-avoid
7. Persona-specific advice sections (tax deduction for self-employed, projecting income for variable earners, etc.)
8. FAQs (6-8)
9. Related links + sources

## Tasks

| # | Task | Status |
|---|------|--------|
| F-A1 | Inventory gig workers page | todo |
| F-A2-A4 | Persona schema + loader + JSON extraction | todo |
| F-A5 | Dynamic route /for/[persona] | todo |
| F-A6-A8 | Sitemap + validator + build | todo |
| F-B1-B3 | persona-writer, verifier, bulkgen | todo |
| F-B4-B5 | Tests + critic | todo |
| Cmt | Commit + push | todo |

## Progress Log

### 2026-05-14
- Phases 2A-2E shipped. 15 sample pages live.
- Started Phase 2F (Persona track) — last template type.
- Built schema + loader + dynamic route + validator + 2 sample JSONs.
- Built persona-writer + persona-verifier + bulkgen + queue helper.
- Writer tests:
  - Self-Employed (5,033 words, 4 options/4 details, 5 traps, 4 detail sections) — correctly handled SE tax deduction nuance (does NOT reduce SE tax) in FAQ #5. Minor fix applied to HSA section (same nuance applies).
  - Veterans — agent produced functional 2,670-word file BUT critic flagged structural fit issues (VA priority groups 1-8, CHAMPVA for dependents not vets, TRICARE plan variants don't fit options table cleanly). Pulled file + marked queue entry deferred pending dedicated veteran schema.

**Critic review surfaced 14 issues, 6 fixed + 2 deferred:**

| # | Severity | Fix |
|---|----------|-----|
| 1 | Critical | Veterans + Noncitizens personas marked `status: "deferred"` in queue (need dedicated schemas / legal review). |
| 2 | High | optionsOverview.rows.length MUST equal optionDetails.length now enforced in validator. Updated gig-workers.json to match (added 4th detail section for CHIP). |
| 3 | High | Self-employed health insurance deduction FACTUAL ERROR fixed in gig-workers.json (FAQ #2 + detail section + Spanish equivalents). The deduction reduces income tax ONLY, not self-employment tax. Writer + verifier prompts now strictly enforce this. |
| 4 | High | Persona pages must include `/event/<slug>` or `/qa/<slug>` in relatedLinks to avoid duplicate content. Writer prompt teaches: link, don't restate. |
| 5 | High | Non-expansion state coverage gap section MANDATORY for personas where Medicaid is option #1 or #2 (uninsured-low-income, domestic workers). |
| 6 | Medium | detailSections min raised to 2 (was 1, gold standard had 2 — kept consistent). |
| 7 | Medium | ACA cliff phrasing tightened in writer prompt: "subsidies phase down approaching 400% FPL and stop at 400%" not "below 400% FPL = subsidies". |

**Deferred (low priority / out of scope):**
- Critic #11 (hardcoded frankthebot paths): established pattern across all 6 tracks
- Critic #14 (lastUpdated freshness check): cosmetic, acceptable as-is
- Critic #13 (year suffix in h1 → stale Jan 1 2027): defer to annual refresh
- Critic #10 (generateStaticParams cap at 20): same pattern as other phases
- Tax facts central anchor file: real improvement but cross-phase refactor, deferred

**Final test results:**
- 2 persona JSONs validate: gig-workers ✅, self-employed ✅
- Build exit 0
- Veterans + Noncitizens deferred (queue entries kept for future when dedicated schemas exist)

**Phase 2F summary:**
- 1 dynamic route: `/for/[persona]`
- 1 loader: `src/lib/personas.ts`
- 1 validator: `scripts/validate-personas.js` (with 1-to-1 optionsOverview vs optionDetails check)
- 2 agents: persona-writer, persona-verifier
- 1 cron: persona-bulkgen
- 1 helper: coveredusa-persona-queue.js
- 2 sample personas live (gig-workers + self-employed)
- 8 personas queued + 2 deferred (Veterans + Noncitizens)
