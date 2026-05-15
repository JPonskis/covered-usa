# Track C-prime EVENT Audit

Date: 2026-05-15
Auditor: Frank
Verdict: **PARTIAL PASS — ship-worthy with material P0 gaps**

---

## Top-line verdict

The em-dash discipline win is REAL — the headline T26 antidote held. All 5 articles validate clean and ctaTarget/topicCluster/keyTerms shapes are correct. But the audit's stated #1 P0 structural fix (E1 — 4 new required structured fields) is *not* enforced. Only 1 of 5 articles (`having-a-baby`) emits the audit-mandated E1 fields. The other 4 ship without `documentsNeeded`, `commonDenialReasons`, etc. — the very fields the writer prompt declares "REQUIRED (always)." This is a writer-discipline regression, not an em-dash regression. GATE D is fixed; GATE B+E1 universal-rule enforcement is not.

---

## Top 3 issues (ranked by impact)

### 1. E1 P0 structural fields missing on 4 of 5 articles (HIGH)

The audit's biggest insight was: writer needs to layer the §3.3 / §3.4 / §3.7 / §3.8 universal rules on top of the §4.6 recipe. New writer prompt declares `documentsNeeded` "REQUIRED (always), 4-8 items" and `commonDenialReasons` "REQUIRED (always), 3-5 items." Reality:

| Slug | householdSizeTable | documentsNeeded | stateRules | commonDenialReasons | comparisonNarrative |
|---|---|---|---|---|---|
| getting-married | N/A (correct) | **MISSING** | N/A | **MISSING** | N/A |
| having-a-baby | present (9 rows) | present (7) | present (7) | present (5) | absent |
| moving-states | absent | **MISSING** | present (6) | **MISSING** | absent |
| divorce | **MISSING (GATE B applies)** | **MISSING** | absent | **MISSING** | **MISSING (GATE G applies)** |
| becoming-a-caregiver | **MISSING (GATE B applies)** | **MISSING** | **MISSING (state variance is core to caregiver topic — Medi-Cal IHSS, NY CDPAP, etc.)** | **MISSING** | N/A |

`becoming-a-caregiver` and `divorce` should both be HELD by verifier per GATE B (income-gated event without table). They shipped. `having-a-baby` is the only article that actually implemented E1. The writer prompt has the right framing; the writer did not enforce it on 4 of 5 attempts.

### 2. GATE F (anchored SEP dates) failing on 2 of 4 deadline events (MEDIUM)

Writer GATE F requires explicit start + end dates anchored to event date. Per audit:

- `getting-married` — only "November 2026" appears (1 anchor). Generic "60-day window" without start+end pair.
- `having-a-baby` — 2 anchors found ("June 1", "July 31") — PASS
- `moving-states` — **0 anchored dates** in `urgency.body.en`. FAIL.
- `divorce` — **0 anchored dates** in `urgency.body.en`. FAIL.
- `becoming-a-caregiver` — kind=no-deadline, N/A.

Per writer prompt: "HOLD if neither start nor end date present (just 'X days' with no anchor)." Two articles shipped that should have been held by the writer's own GATE F.

### 3. GATE G (COBRA-vs-Marketplace narrative for divorce) missing (MEDIUM)

`divorce` is the canonical coverage-loss Family Change event. 54 COBRA mentions in body. Zero `comparisonNarrative` field. Zero detail-section heading mentions COBRA/Marketplace/Spouse comparison. Audit E4 P1 strongly recommends this; writer prompt names it as required for divorce category. The article has COBRA *information* but not the canonical Bing-citable comparison narrative shape. Verifier docs explicitly call this out as a divorce-specific writer-side concern (LOW flag, never HOLD), so ship-worthy — but the audit's intent was the OPPOSITE: this is the second-highest priority §4.6 fan-out shape.

---

## Em-dash audit (THE marquee result — clean)

```
=== getting-married ===     em: 0, en: 0, --: 0
=== having-a-baby ===       em: 0, en: 0, --: 0
=== moving-states ===       em: 0, en: 0, --: 0
=== divorce ===             em: 0, en: 0, --: 0
=== becoming-a-caregiver === em: 0, en: 0, --: 0
```

**Five articles, zero em-dashes, zero en-dashes, zero double-hyphens.** This is the T26 regression antidote working as designed. The post-fix sanity grep + 2-pass GATE D in the verifier and the writer's STEP 6 self-grep both held. This is the MOST important result of the audit (per the prompt's framing) — the leak that shipped 23 em-dashes on T26 did not recur. The em-dash discipline gap is closed.

Compare to baseline:
- `turning-26-health-insurance.json` (T26 historical leak): 23 em-dashes shipped
- `turning-65-medicare.json` (gold-standard for urgency framing): em-dash in source title (acceptable per E5)
- `just-lost-job-health-insurance.json` (gold-standard structural): em-dash in source title (acceptable per E5)

---

## Other findings

### Validator

```
✅ becoming-a-caregiver.json
✅ divorce.json
✅ getting-married.json
✅ having-a-baby.json
✅ moving-states.json
Validated 8 event files. 0 bad. 0 total.
```

All 5 new articles ship clean on the validator. **0 bad.** All meta caps under 70 EN / 70 ES title, under 160 EN / 160 ES description. FAQ counts match (8/8 on every article).

### HowTo schema

| Slug | steps[] | urgency.kind | totalTimeISO8601 |
|---|---|---|---|
| getting-married | 6 | deadline | P60D ✅ |
| having-a-baby | 6 | deadline | P60D ✅ |
| moving-states | 7 | deadline | P60D ✅ |
| divorce | 7 | deadline | P60D ✅ |
| becoming-a-caregiver | 7 | no-deadline | null ✅ |

GATE E passes everywhere. Steps in 5-7 typical range; kind/totalTime correctly paired (including the no-deadline → null pairing for caregiver — the validator hard-fail trap is avoided).

### Track C-prime forward-compat fields

All 5 articles emit:
- `topicCluster` = correct kebab-case slug (`event-sep` for 4, `event-medicaid-pivot` for caregiver)
- `keyTerms` = OBJECT shape `{en, es}`, NOT flat array — Appendix B failure mode avoided
- `ctaTarget` = `"screener"` (correct for all SEP-driven events)
- `category` enum locked values respected (including `"Move / Relocation"` ONE value)

### .gov / .edu / kff.org citations (GATE C)

| Slug | Total sources | Authoritative |
|---|---|---|
| getting-married | 5 | 5 |
| having-a-baby | 5 | 5 |
| moving-states | 5 | 4 |
| divorce | 5 | 5 |
| becoming-a-caregiver | 7 | 7 |

All ≥3 distinct authoritative sources. GATE C passes everywhere.

### GATE H pronoun discipline

| Slug | violations |
|---|---|
| getting-married | 1 (intro[1] opens with "This") |
| having-a-baby | 1 (faqs.en[6] opens with "It") |
| moving-states | 1 (faqs.en[3] opens with "This") |
| divorce | 1 (intro[1] opens with "This") |
| becoming-a-caregiver | 2 (intro[1] "This" + faqs.en[6] "It") |

LOW-flag territory (verifier explicitly never HOLDs on GATE H). But the "This guide covers..." opener appears on 3 of 5 intros — that's a recurring writer template tic, not random drift. Worth a writer-prompt patch.

### Slug compliance (GATE A)

All 5 slugs pass — no year anywhere. ✅

### Word counts (audit E6: 150-300 words/intro)

| Slug | intro[0] word count |
|---|---|
| getting-married | 64 |
| having-a-baby | 92 |
| moving-states | 69 |
| divorce | 59 |
| becoming-a-caregiver | 50 |

**All 5 are well below the 150-word floor.** Audit E6 P1 lengthening was not implemented. JL baseline was ~70 words; new articles are at or below baseline. The writer prompt names "150-300 words each" in 4 different STEPs but the writer did not enforce.

---

## Missing files / artifacts

All required deliverable artifacts ARE present:

- `.claude/agents/coveredusa-event-writer.md` (rewritten) — present, 757 lines
- `.claude/agents/coveredusa-event-verifier.md` (rewritten) — present, 438 lines
- `.bak` backups for both — present
- 5 test articles — present, all validate
- `c-event-requirements-matrix.md` — present (179 lines)
- `c-event-verifier-a.md`, `c-event-verifier-b.md`, `c-event-verifier-c.md` — present
- `c-event-verifier-retest.md` — present (event-only artifact per PRD)
- Memory entry `feedback_track_c_event_writer_shipped.md` — present

All Phase 5 commit deliverables accounted for.

---

## Verifier dual-purpose framing

`coveredusa-event-verifier.md` STEP 1C (structural GATE detection) is present and correctly framed as detect-only EXCEPT GATE D. The dual-purpose YOUR TASK section explicitly calls out the split (numeric auto-fix vs structural detect-only) and names the Ohio MA-state failure mode AND the T26 event failure mode (23 em-dashes shipped) in the Common Verifier Error callout. Path portability fixed (`$HOME/clawd` throughout, no hardcoded `/Users/frankthebot/`).

GATE D auto-fix is correctly hoisted above Category K with "AUTO-FIX MANDATORY" framing and post-fix sanity grep + 3-pass loop + sed bulk-sweep escape hatch. This is exactly the spec.

**Verifier dual-purpose: PASS.**

---

## Verdict summary

**Ship-worthy: YES, with caveats.** The 5 articles are objectively better than the existing 3 baseline pages on the em-dash discipline axis, validate clean, and have correct schema shape. The em-dash discipline antidote works. The forward-compat metadata fields (topicCluster, keyTerms object shape) are clean. No build-breaking issues.

**But the audit's stated P0 (E1 structural fields) is largely unenforced.** 4 of 5 articles ship without `documentsNeeded` (which the writer prompt declares "REQUIRED always"). 2 of 5 income-gated events ship without `householdSizeTable` (GATE B violation that the verifier should have caught as HOLD per its own routing rules). Either:

1. The writer is intentionally treating these fields as optional per its own discretion despite the prompt language, OR
2. The verifier's GATE B detect-only behavior is firing N/A when it should fire FAIL.

Both should be patched in a follow-up cycle. **Recommended next step:** tighten the verifier's GATE B applicability detection so income-gated `Family Change` (divorce, becoming-a-caregiver as Income Change) actually HOLDs on missing householdSizeTable, and tighten the writer's STEP 4 checklist enforcement so `documentsNeeded` + `commonDenialReasons` are non-skippable.

**Em-dash discipline: SHIPPED. 0 leaks across 5 articles. T26 regression cured.**
