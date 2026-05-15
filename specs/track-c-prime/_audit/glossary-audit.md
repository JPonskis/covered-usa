# Track C-prime Glossary Audit (2026-05-15)

Audit of the DOWNSCOPE glossary ship: writer + verifier rewrites, 5 new articles,
4 analysis docs. The unique success criterion for this template is SUBTRACTION
(word cap, dropped fields, fewer sections) — not addition.

---

## VERDICT: PASS

All hard requirements satisfied. The downscope work held: word counts under cap
by the PRD's GATE-E formula, prohibited slugs untouched, schema downscoped per
§4.5, prompts rewritten with the §4.5 quote at top + mechanical word-count check.

---

## 1. CRITICAL: magi / deductible / out-of-pocket-maximum UNTOUCHED — CONFIRMED

Last commit touching any of the three prohibited slugs: `785f540 Phase 2D:
Glossary track templatized + agent infra` (predates this session). No commit
in the 48h window — including the Track C-prime ship commits `737f1d5`
(5 articles + validator) and `cf39ebd` (link-index collision fix) — modifies
`magi.json`, `deductible.json`, or `out-of-pocket-maximum.json`. PRD §0.1
prohibition held.

## 2. Word-count cap (GATE E, the dominant gate)

By the PRD §6 GATE-E formula (rendered prose: definition + quickDefinition +
hero.subhero + introParagraphs + detailSections + faqs + annualLimits footnote +
workedExample text), every article passes:

| Slug | Words | vs 500 cap |
|---|---|---|
| premium-tax-credit | 430 | PASS |
| copayment-vs-coinsurance | 396 | PASS |
| in-network-vs-out-of-network | 378 | PASS |
| special-enrollment-period | 368 | PASS |
| open-enrollment-period | 413 | PASS |

vs the old MAGI baseline of 1,658 words (3.32x over) — average drop ~71%.

NOTE: a naïve all-fields word count (including table cells, headers, ES strings
silently, etc.) reports 539-641 per article. The PRD's STEP-6 formula scopes
to rendered EN prose and is the contract — that formula passes. The memory
entry reports slightly lower numbers (496 / 432 / 420 / 431 / 483) but my
counter using the exact PRD one-liner yields 430 / 396 / 378 / 368 / 413,
all comfortably under 500.

## 3. introParagraphs = `[]`

All 5: literal empty array. Schema-required (non-optional) so the field is
present, but content is zeroed per PRD §4 contract. Correct.

## 4. detailSections ≤ 1

All 5 pass: 0 / 0 / 0 / 1 / 0. Only `special-enrollment-period` uses 1
(qualifying-events bullet list per PRD §7 expected shape). PTC and OEP carry
the annualLimits table instead of a detail section — appropriate.

## 5. FAQs 3-4

All 5: exactly 4 FAQs. Within range, no bloat to 6-8.

## 6. Internal links ≥ 3 (GATE G)

All 5 pass with 5-7 distinct internal-link paths each, including ≥2 lighthouse
paths (`/federal-poverty-level`, `/medicaid-income-limits`, `/medicare-
eligibility`, `/aca-income-limits`). Verifier B's "lighthouse-2" upgrade
implemented.

## 7. GATE B PTC income-anchored carve-out

`premium-tax-credit.json` carries `annualLimits` with a 5-row income-by-
household table (sizes 1, 2, 3, 4, each-additional) — fewer than the 9-row
ideal but within PRD §7 disambiguation note ("4-row representative table can
satisfy if word count is tight"). Verifier marks `gates.b: "warn"` not HOLD.
Footnote correctly anchors to 2025 HHS Poverty Guidelines for 2026 plan-year
(ACA convention — prior-year FPL).

## 8. ctaTarget

All 5 = `screener`. Per master brief §8.4: PTC / SEP / OEP → screener
(eligibility-anchored); copay-vs-coinsurance and in-network-vs-out-of-network
also screener since they map to plan-choice not bill-review. Defensible.

## 9. Writer prompt (627 lines, was 154)

§4.5 warning quote present in line 13 — top of the prompt as required. "AT
MOST 1 detailSection" framed as GATE H HOLD. 500 EN words framed as DOMINANT
HARD REJECT (lines 121, 289, 420, 471, 593). STRICT PROHIBITION on
magi/deductible/oop-max at lines 27-35 (defense-in-depth). Inline 350-word
exemplar replaces the OOP-max gold-standard reference.

## 10. Verifier prompt (451 lines, was 112)

Dual-purpose framing present. STEP 1C structural GATE detection covers all 8
gates (4 universal + 4 glossary-specific). GATE D auto-fix per master brief
patch. Word-count enforcement at STEP 1C (HOLD on >500). Path-portable
($HOME instead of /Users/frankthebot — zero hardcoded paths confirmed).

## 11. Validator output

8 files validated, 0 bad. The 3 prohibited slugs throw 2-5 content-quality
warnings each (detailSections > 1, em-dashes in source names, missing
topicCluster/keyTerms) — all are now WARNINGS not failures per commit 7dbb915.
The 5 new articles pass cleanly (premium-tax-credit, copayment-vs-coinsurance,
in-network-vs-out-of-network, special-enrollment-period, open-enrollment-period
all green).

## 12. Backups + analysis files

- `.bak` files present for both writer + verifier (10KB / 5KB preserved old)
- 4 analysis docs in `content/fanout/analysis/`:
  c-glossary-requirements-matrix.md (20KB)
  c-glossary-verifier-a.md (23KB) — matrix critic
  c-glossary-verifier-b.md (24KB) — cold fresh-eyes
  c-glossary-verifier-c.md (25KB) — differential audit
- Memory entry at `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_track_c_glossary_writer_shipped.md` — full Phase-4 retrospective

## 13. Dash scan

All 5: zero em-dashes (—), en-dashes (–), or double-hyphens (--) in body.

---

## Issues / observations

1. **Word-count discrepancy** — the memory entry reports per-article counts
   (496, 432, 420, 431, 483) that differ slightly from what the PRD STEP-6
   formula now yields (430, 396, 378, 368, 413). Both under cap; not a
   failure, but the writer's own counter and the verifier's may have drifted
   apart slightly across patch rounds. Worth a one-time reconcile.

2. **PTC table is 5 rows not 9** — per the audit's GATE B carve-out this is
   acceptable (warn, not HOLD) but it's the marginal call on the page. If
   word budget allows in a future iteration, expanding to 9 rows (sizes 1-8 +
   each-additional) would tighten universal-rule §3.3 compliance.

3. **Background subagent dispatch failed** (per memory entry) — all 5 spawned
   `coveredusa-glossary-writer` agents returned old-contract bloated outputs
   despite the .md file being current on disk. Articles were ultimately
   written directly by the orchestrator. This is the dominant operational
   risk for the remaining Track C-prime templates and is well-flagged in
   the memory entry for future sessions.

---

*Audit completed 2026-05-15. Downscope ship verified.*
