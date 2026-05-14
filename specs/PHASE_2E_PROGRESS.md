# Phase 2E — Trigger Event Pages Track

**Status:** In progress
**Started:** 2026-05-14
**Goal:** Templatize `/just-lost-job-health-insurance` into `/event/[event]` dynamic route + agent infra. Workflow first, mass production later.

## Why trigger events are different

Trigger events are **time-sensitive action pages** about life events that trigger Special Enrollment Periods (SEP) or other healthcare decisions. Unique features:
- **Urgency callout** at top — "You have 60 days from coverage loss date"
- **HowTo schema** with numbered steps for the enrollment process
- **Options comparison table** with deadlines column
- **Common Mistakes section** — high reader value because emotional urgency leads to mistakes
- Almost always `ctaTarget: "screener"` (eligibility funnel)

Examples: lost job, turning 26 (age out), turning 65 (Medicare), marriage, divorce, baby, move (state change), retiring, lost Medicaid.

## Schema-org HowTo

HowTo requires `step[]` array with `name` + `text` per step. Optional `totalTime` (ISO 8601 duration). Strong AI citation signal for "how to" queries.

## Tasks

| # | Task | Status |
|---|------|--------|
| E-A1 | Inventory trigger event page | todo |
| E-A2 | Define TriggerEvent schema (lib/events.ts) | todo |
| E-A3 | Extract lost-job content into JSON | todo |
| E-A4 | events.ts loader | todo |
| E-A5 | Dynamic route /event/[event] | todo |
| E-A6 | Sitemap | todo |
| E-A7 | validate-events.js + prebuild | todo |
| E-A8 | Build passes | todo |
| E-B1 | event-writer agent | todo |
| E-B2 | event-verifier agent | todo |
| E-B3 | event-bulkgen + queue + helper | todo |
| E-B4 | Test on 2 events | todo |
| E-B5 | Critic review + iterate | todo |
| Cmt | Commit + push | todo |

## Progress Log

### 2026-05-14
- Phases 2A-2D complete. 12 sample pages live.
- Started Phase 2E (Trigger Events / HowTo schema track).
- Built schema + loader + dynamic route + validator + 3 sample JSONs.
- Built event-writer + event-verifier + bulkgen + queue helper.
- Writer tests passed: Turning 26 (3,920 words) + Turning 65 Medicare (3,730 words).

**Critic review surfaced 11 issues, top 6 fixed:**

| # | Severity | Fix |
|---|----------|-----|
| 1 | Critical | Added `urgency.kind` discriminator (`deadline` / `window` / `no-deadline`). Medicare IEP is correctly `kind: "window"` (7-month period centered on birthday, not a deadline). Validator enforces kind/duration coherence. |
| 2 | High | Added `urgency.secondaryDeadlines` for multi-deadline events (job loss has 60-day marketplace + 30-day spouse + year-round Medicaid). Renders as chips below the main heading. |
| 3 | High | Validator now extracts day-counts from `urgency.heading` + `body` prose and compares against `totalTimeISO8601` — catches drift like "P60D" + "30 days" mismatch. Skipped for `kind: "window"` since multi-segment windows legitimately don't match total. |
| 4 | High | Verifier Category J requires action verbs in `steps[i].text` (apply / enroll / call / etc.) + specific nouns (healthcare.gov / 138% FPL / Form SSA-1-BK). Vague steps → flag, don't auto-edit. |
| 5 | Medium | Options table headers LOCKED to exact `["Option", "Typical cost", "Best for", "Deadline"]` (and Spanish equivalent). Writer prompt enforces. |
| 7 | Medium | Re-categorized `self-employed-no-coverage` from "Job Loss" → "Lost Other Coverage". Writer prompt notes frame difference. |
| 8 | Medium | Writer prompt category list reformatted as exact-strings enum (not slash-separated prose). Prevents "Move" vs "Relocation" split. |

**Deferred (low priority, acceptable):**
- Critic #6 (commonMistakes required) — kept as required, writer guided to "3-6 items, prefer fewer-and-specific over more-and-vague"
- Critic #9 (generateStaticParams cap at 20) — same pattern as other phases, acceptable
- Critic #10 (free-string topic) — minor
- Critic #11 (formatDate timezone bug) — known pattern from RESILIENCE.md, applies to all template pages. Deferred site-wide fix.

**Final test results:**
- 3 event JSONs validate (just-lost-job, turning-26, turning-65)
- Build exit 0
- Phase 2E infrastructure ready for mass production

**Phase 2E summary:**
- 1 dynamic route: `/event/[event]`
- 1 loader: `src/lib/events.ts`
- 1 validator: `scripts/validate-events.js` (with prose-vs-duration drift detection)
- 2 agents: `coveredusa-event-writer`, `coveredusa-event-verifier`
- 1 cron: `coveredusa-event-bulkgen`
- 1 helper: `coveredusa-event-queue.js`
- 3 sample events live (job loss + turning 26 + turning 65)
- 10 events queued for mass-production
