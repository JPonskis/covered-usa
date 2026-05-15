# Event PRD Verification — Track C-prime

**PRD verified:** `projects/covered-usa/specs/track-c-prime/event-prd.md`
**Verified by:** Frank (fresh-eyes + completeness pass)
**Date:** 2026-05-14

---

## PASS 1 — Fresh-eyes (read PRD cold, end-to-end)

Questions a fresh executor would ask before starting Phase 1, with status against the PRD's body:

### 1. HowTo schema — what are required vs optional fields? (SOFT GAP)
PRD says GATE E requires `steps[] >= 3` and `urgency.totalTimeISO8601` populated. It does NOT enumerate the schema.org HowTo required field set (`name`, `step[]` with `HowToStep.name` and `HowToStep.text`, `totalTime`). The `TriggerEvent.HowToStep` interface (§11 events.ts) only has `name` + `text` per step — no `image`, no `tip`, no `position`. PRD §2 schema reminder is implicit about this. GATE E currently checks only step count + totalTime, not full HowTo coverage. **Fresh executor would need to grep events.ts to confirm shape.** SOFT GAP — recommend inlining the HowTo step required-field list in §6 GATE E.

### 2. GATE D extra-strict — post-fix sanity grep pattern (GOOD, §6)
The grep pattern is specified at §6 line 214:
```
grep -n "—\|–" <slug>.json | grep -v '"name":' | grep -v '"sources"'
```
This is a literal grep over the file, piped through two excludes to skip source.name titles. Pattern is unambiguous. The 2-pass loop (auto-fix → re-grep → repeat up to 3 times, then WARN) is specified. GOOD.

Minor sub-question: the grep excludes `'"name":'` broadly, which would also skip `steps[].name` and `commonMistakes.items` if they happened to be objects with a `name` key. The current schema makes `steps[].name` a LocalizedString, so `"name":` appears in JSON for legitimate body content too. **Potential false negative** — if an em-dash leak lands inside a `steps[].name.en` field, the grep skips that line. SOFT GAP — recommend tightening to `grep -v '"sources"' | jq` or scoping the exclude to the sources array specifically.

### 3. SEP enrollment-window dates as start + end (GOOD, §3 + §6)
GATE F (§6 line 197-201) and §3 shape 2 (line 110) both call out: "60 days from coverage loss — typically January 1 through March 1 if you lose coverage on January 1, 2026." Worked example is explicit. Anchored start + end dates are mandatory. GOOD.

### 4. Income-gated vs pure-scheduling events for GATE B (GOOD, §6 + §7 table)
PRD §6 GATE B (line 181) and the §7 test mix table (lines 228-233) explicitly classify each test event:
- Income-gated (GATE B applies): having-a-baby, divorce, becoming-a-caregiver, lost-job
- Pure scheduling (GATE B N/A): turning-26, getting-married (without subsidy implications)
- OPTIONAL: moving-states (only if income-affected)

The N/A marker (`gates.b: "n/a"`) is specified. GOOD.

### 5. Becoming-a-caregiver — what data is the writer expected to research? (SOFT GAP)
PRD references the slug 4 times:
- §2 line 84: trigger for `householdSizeTable`
- §3 line 115: trigger for CHIP/Medicaid pivot
- §3 line 139: required "CHIP" vocabulary
- §7 line 233: "Medicaid Waiver programs; respite care funding; most complex test — tests Income Change + state-program-brand injection (Medi-Cal IHSS, NY CDPAP, etc.)"

What's MISSING: explicit research guidance on (a) HCBS waivers (Medicaid 1915(c)) and which states have waitlists, (b) federal Lifespan Respite Care Program funding, (c) the spousal-impoverishment income/asset rules, (d) caregiver tax credit (Section 21 dependent-care). The PRD relies on the writer to derive this from the topic — but every other event in the test mix has a clearer "what to cite" anchor. SOFT GAP — recommend adding a 2-3 line research footnote to §7 for becoming-a-caregiver (e.g., "Cite: Medicaid.gov HCBS Waivers page; ACL.gov Lifespan Respite; state-specific IHSS/CDPAP brand pages; KFF Medicaid HCBS dashboard").

### 6. GATES A-H — does GATE H exist? (HARD GAP)
The task prompt mentions "GATES A-H match master brief routing." Reality: master brief §7 (TRACK_C_PARALLEL_PLAN.md line 656-664) defines only **GATES A-D** as universal. The event PRD adds per-template GATES **E, F, G**. There is **no GATE H** in either the PRD or the master brief.

This is a wording issue in the task prompt, not the PRD. The PRD's GATE coverage (A-G) is correct. HARD GAP in the prompt to me; PRD itself is consistent. No PRD edit needed; note for caller.

### 7. Phase 4.5 verifier patches — clarity on "dual-purpose framing" (SOFT GAP, §9)
PRD §9 line 266 says "Add dual-purpose framing in YOUR TASK section (numeric auto-fix + structural detect-only). Copy the framing from `coveredusa-ma-state-verifier.md` YOUR TASK section." A fresh executor would have to open that file to know what they're copying. The phrase "structural detect-only" isn't defined locally. SOFT GAP — recommend a 2-3 line inline summary of the dual-purpose split.

### 8. Schema mismatch on additive fields (SOFT GAP, §2)
PRD §2 says emit `topicCluster`, `keyTerms`, `isLighthouse`, `isDeprecated`, `householdSizeTable`, `documentsNeeded`, `stateRules`, `commonDenialReasons`, `comparisonNarrative`. The `TriggerEvent` interface in events.ts has NONE of these fields (only `slug`, `eventName`, `category`, `topic`, ..., through `sources`). The PRD acknowledges this at line 93: "extra fields silently ignored at runtime." But this means the new structured content will NOT render on the page until the renderer is updated. Fresh executor would ask: "Where are these fields rendered? Or are they purely AI-citation-surface fields invisible to humans?" SOFT GAP — recommend a sentence in §2 confirming "these fields are JSON-only for now; page rendering is a Track A1 follow-up. The 5 test articles serve as the data fixture for renderer updates."

### 9. `comparisonNarrative` block — schema shape (SOFT GAP, §3 + §6)
GATE G says "ensure a `comparisonNarrative` block (or detailSection covering COBRA-vs-Marketplace) with at least 1 paragraph of prose." The shape `{heading: LocalizedString, body: LocalizedString}` is implied at audit E4 (line 159 of audit JSON: `comparisonNarrative: { heading, body }`). Not specified in PRD §2 (schema reminder). SOFT GAP — recommend §2 add `comparisonNarrative?: {heading: LocalizedString, body: LocalizedString}` to the additive fields list.

### 10. SEP `urgency.kind` decision table (SOFT GAP)
Common failure mode #7 (§8 line 253) warns about `urgency.kind` mismatch for Medicare IEP. PRD references "the urgency-kind decision table in the prompt" but no decision table appears in the PRD itself. Fresh executor would assume it's in the existing writer or master brief. SOFT GAP — recommend a 4-row decision matrix in §2 or §3:
- deadline → hard cutoff X days from event (most SEPs)
- window → enrollment spans before+during+after (Medicare IEP P7M)
- no-deadline → year-round (Medicaid, CHIP)

### 11. Pre-flight checklist — `validate-events.js` may not exist (SOFT GAP, §11)
§11 line 342 says "If validate-events.js doesn't exist, run the universal content-quality lint instead." This admits the validator may not be there. Fresh executor would benefit from a definitive lint command. SOFT GAP — clarify which script to run.

### 12. Memory entry path (GOOD, §10)
§10 line 302 specifies `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_track_c_event_writer_shipped.md` — full path, named to match the b1_blog_writer pattern. GOOD.

---

## PASS 2 — Mechanical completeness

### 2.1 Cited paths exist (§1, §11, §12) — PASS

All cited files verified to exist:
- `.claude/agents/coveredusa-event-writer.md` PASS
- `.claude/agents/coveredusa-event-verifier.md` PASS
- `.claude/agents/_universal-rules-block.md` PASS
- `.claude/agents/coveredusa-ma-state-writer.md` PASS
- `.claude/agents/coveredusa-ma-state-verifier.md` PASS
- `.claude/agents/coveredusa-article-verifier.md` PASS
- `projects/covered-usa/specs/FANOUT_FORMULA.md` PASS
- `projects/covered-usa/specs/AI_OPTIMIZATION_FRAMEWORK.md` PASS
- `projects/covered-usa/specs/URL_SLUG_FRAMEWORK.md` PASS
- `projects/covered-usa/specs/LINK_TARGET_MANIFEST.md` PASS
- `projects/covered-usa/specs/CURRENT_STATE_AUDIT.md` PASS
- `projects/covered-usa/specs/PHASE_5_BRIDGE.md` PASS
- `projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md` PASS
- `projects/covered-usa/src/lib/events.ts` PASS
- `projects/covered-usa/content/fanout/analysis/audit-event-writer.json` PASS
- `projects/covered-usa/content/data/events/just-lost-job-health-insurance.json` PASS
- `projects/covered-usa/content/data/events/turning-65-medicare.json` PASS
- `projects/covered-usa/content/data/events/turning-26-health-insurance.json` PASS

### 2.2 Audit findings match `audit-event-writer.json` — PASS

PRD §4 (line 154-176) faithfully summarizes the audit JSON:
- Pages audited: 3 (turning-26, turning-65, just-lost-job) — matches
- Alignment scores: T26 worst-style/best-content, T65 best-style/best-urgency, JL gold standard — matches audit `B_per_page_findings`
- "biggestInsight" quoted: PRD line 158 quote exactly matches audit JSON `biggestInsight` field
- 9 writer edits E1-E9 — all 9 listed in PRD §4, priorities P0/P1/P2 match audit JSON `C_writer_edits[].priority`
- T26 em-dash count: PRD says 23 (matches audit `criticalIssues`)
- T65 ES meta-description: PRD says 174 chars (matches audit)
- T26 meta-title: PRD says 80 chars (matches audit)
- 4 new structured fields (E1 P0): householdSizeTable, documentsNeeded, stateRules, commonDenialReasons — match audit E1

### 2.3 Schema fields match `events.ts` `TriggerEvent` interface — PARTIAL PASS

Confirmed against events.ts:
- All `TriggerEvent` required fields enumerated in PRD §2: PASS (slug, eventName, category, topic, medicalSpecialty, ctaTarget, lastUpdated, readingTime, meta, hero, urgency, quickAnswer, introParagraphs, steps, optionsComparison, commonMistakes, detailSections, faqs, relatedLinks, sources)
- `EventCategory` locked enum: PASS (7 values listed match exactly)
- `EventCtaTarget`: PASS (screener | analyzer)
- `UrgencyKind`: PASS (deadline | window | no-deadline)
- `UrgencyNotice.totalTimeISO8601` REQUIRED when kind=deadline/window, null when no-deadline: PASS — matches interface JSDoc
- `LocalizedFAQ` is flat strings not LocalizedString: PASS — PRD §2 line 94 + common-failure-mode #8 both call this out

**ONE discrepancy:** PRD §2 line 73 says `commonMistakes: CommonMistakesSection (3-6 items)`. The interface defines `items: LocalizedString[]` with no count enforcement at the type level. The 3-6 range is a writer-rule (consistent with existing pages) but not a schema contract. Minor wording — call this a "writer rule" not a schema constraint. SOFT GAP.

**Additive fields (topicCluster, keyTerms, etc.):** NONE are in the interface. PRD acknowledges at line 93 that extra fields are silently ignored. Verified.

### 2.4 Recipe references match FANOUT_FORMULA §4.6 — PASS

FANOUT_FORMULA §4.6 (lines 333-353):
- Variant distribution: Entailment 56.4% / Equivalent 19.0% / Specification 17.1% / Clarification 6.6% / Follow-up 0.9% — PRD line 103 matches EXACTLY
- Bing-validated shapes: 6 of 8 — PRD line 106 matches
- Top dominant shapes #1-7 in §4.6 list: PRD §3 lists 8 shapes (FANOUT lists 7 — PRD adds "HowTo schema with 5-7 numbered steps + totalTime" as shape #8). PRD's #8 is from FANOUT_FORMULA's "Writer-agent recipe" bullet ("Required HowTo schema with 5-7 numbered steps + totalTime"). Consistent.
- Required H2s match §4.6 writer-agent recipe — PASS
- Required FAQ topics: PRD §3 lists 6-8 (line 119); FANOUT lists 3 categories — PRD expands appropriately

### 2.5 All 12 sections present — PASS

PRD section index:
- §0 Read order: PRESENT (line 11)
- §1 Context inventory: PRESENT (line 26)
- §2 Schema reminder + hard contracts: PRESENT (line 47)
- §3 The §4.6 recipe expanded: PRESENT (line 101)
- §4 Audit findings synthesized: PRESENT (line 154)
- §5 Universal GATES recap: PRESENT (line 178)
- §6 Event-specific GATES: PRESENT (line 187)
- §7 Test mix — 5 events: PRESENT (line 223)
- §8 Common failure modes: PRESENT (line 245)
- §9 Verifier scope (Phase 4.5): PRESENT (line 259)
- §10 Atomic deliverable: PRESENT (line 291)
- §11 Pre-flight checklist: PRESENT (line 312)
- §12 Quick reference card: PRESENT (line 350)

All 13 sections (§0-§12) present. PASS.

### 2.6 GATES A-H match master brief routing — PARTIAL PASS / WORDING ISSUE

Master brief §7 (TRACK_C_PARALLEL_PLAN.md line 656-664) defines 4 universal GATES:
- GATE A (slug-no-year) — PRD §5 PASS, routing HOLD matches
- GATE B (household-size, CONDITIONAL for income-gated topics) — PRD §5 PASS, routing matches (HOLD if applies + absent; N/A if scheduling)
- GATE C (≥3 .gov citations) — PRD §5 PASS, routing matches (HOLD 0-1, WARN 2)
- GATE D (zero `--`, auto-fix) — PRD §5 PASS + extra-strict addendum + post-fix sanity grep

Per-template GATES added in PRD §6:
- GATE E (HowTo steps + totalTime) — PRESENT, routing HOLD matches master brief line 624
- GATE F (anchored SEP dates) — PRESENT, routing HOLD if neither matches the master brief "template-specific required section" pattern
- GATE G (COBRA-vs-Marketplace narrative for coverage-loss events) — PRESENT, LOW-flag routing (never HOLD) matches the "writer-side concern" framing

**There is NO GATE H** in the master brief or the PRD. The task prompt's "GATES A-H" wording is incorrect — actual coverage is GATES A-G. PRD is correct as written.

### 2.7 Test mix slugs don't collide — PASS

Existing event JSONs in `content/data/events/`:
- just-lost-job-health-insurance.json
- turning-26-health-insurance.json
- turning-65-medicare.json
- _queue.json (queue file, not a slug)

Proposed test slugs: getting-married, having-a-baby, moving-states, divorce, becoming-a-caregiver.

Zero collisions. PASS.

### 2.8 T26 em-dash leak (23 em-dashes) called out as GATE D justification — PASS

GATE D extra-strict addendum at §6 line 217 explicitly cites:
> "the T26 historical leak (23 em-dashes shipped because the first auto-fix pass missed several instances inside nested objects)"

Also cited in:
- §0 status line 7 ("closing the em-dash discipline gap that shipped 23 em-dashes on T26")
- §1 reference table line 43 ("23 em-dashes, 80-char title")
- §4 line 162 ("T26 shipped with 23 em-dashes (15 in body content)")
- §8 failure-mode #1 line 247
- §12 quick-ref line 362

5+ inline references. Justification is unmistakable. PASS.

### 2.9 HowTo schema requirement (5-7 steps + totalTime) enforced in GATE E — PASS

GATE E (§6 line 192-196):
- "Verify the JSON has `steps[]` with at least 3 entries (typical 5-7)"
- "`urgency.totalTimeISO8601` populated when `urgency.kind` is `deadline` or `window`"
- Routing: "HOLD if steps[] < 3 OR if kind = deadline/window AND totalTimeISO8601 = null"

Both the step-count enforcement and the totalTime conditional enforcement are explicit. PASS.

Minor gap (re-noted from PASS 1 Q1): GATE E does NOT enforce the inner HowToStep field shape (each step having BOTH `name` AND `text` populated in EN+ES). A writer could ship `steps[]` with 5 entries where some are missing `text.es`. SOFT GAP — recommend adding "each step has non-empty name.{en,es} and text.{en,es}" to GATE E.

---

## Summary

**Verdict:** SHIP — PRD is internally consistent, audit-grounded, and self-contained. All cited paths exist. Schema references match `events.ts` exactly. Recipe matches FANOUT_FORMULA §4.6 exactly. Test slugs have zero collisions. The T26 em-dash leak (23 dashes) is named 5+ times as the GATE D extra-strict justification.

**Gaps (none HARD, all SOFT):**

1. **GATE E should also enforce inner HowToStep field shape** (name.{en,es} + text.{en,es} non-empty). Currently only count + totalTime checked.
2. **GATE D post-fix grep pattern has a potential false negative** — the `grep -v '"name":'` exclude is too broad; would skip legitimate steps[].name + commonMistakes lines. Recommend scoping to sources array only.
3. **Becoming-a-caregiver research anchors not specified** — recommend a 2-3 line citation guide (HCBS waivers, Lifespan Respite, IHSS/CDPAP, spousal-impoverishment rules) in §7.
4. **Additive fields (`comparisonNarrative` shape, schema vs runtime gap)** — not in `TriggerEvent` interface; PRD acknowledges silent ignore but doesn't flag that page rendering for the 4 new structured fields is a Track A1 follow-up.
5. **Urgency.kind decision table not inlined** — referenced as "in the prompt" but not in the PRD itself.
6. **"Dual-purpose framing" for verifier referenced without inline explainer** — fresh executor must open the ma-state verifier to know what to copy.
7. **`validate-events.js` may not exist** — pre-flight checklist hedges; clarify the lint command.

**Wording note (not a PRD bug):** the verification task prompt says "GATES A-H" — actual master-brief + PRD coverage is **GATES A-G**. No GATE H exists.

**Recommendation:** Ship the PRD as-is for execution. SOFT GAPs are tuning improvements, none block Phase 1. The PRD is the best per-template plan reviewed so far — matches the audit's framing that event is the strongest writer in CoveredUSA.
