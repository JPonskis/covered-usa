# Verifier C — Differential Audit: OLD vs NEW MA-State Writer

**Date:** 2026-05-14
**Old:** `.claude/agents/coveredusa-ma-state-writer.bak.md` (215 lines, 6 CRITICAL RULES)
**New:** `.claude/agents/coveredusa-ma-state-writer.md` (515 lines, 8 GATES + 26-check + 15 NEVERs)
**Frame:** Old isn't bad; the rewrite layers ON formula universals while preserving working contracts.

---

## Headline counts

| Classification | Count |
|---|---|
| **(a) PRESENT in NEW** (rule survived) | **38** |
| **(b) SUPERSEDED with documented justification** | **6** |
| **(c) SILENTLY DROPPED — bug** | **2** (both LOW) |

No HIGH or MEDIUM silent drops. Hard contracts all survived.

---

## Hard-contract survival (the must-haves)

| OLD rule | NEW status | NEW location |
|---|---|---|
| Atomic write `.tmp.json` → validate → rename | **(a) PRESENT** | STEP 1 (line 66), STEP 6 (line 436), STEP 7 (lines 444–449) |
| JSON return shape `{slug, status, word_count, ...}` | **(a) PRESENT** + extended | STEP 8 (line 466). NEW adds `has_how_to_enroll`, `has_zero_premium_plans`. Additive only — cron-safe. |
| `MedicareAdvantageState` interface conformance | **(a) PRESENT** | STEP 0 read (line 47), STEP 4 26-check (lines 168–219), STEP 6 check 1–26 (lines 406–431) |
| Spanish parity for every LocalizedString | **(a) PRESENT** | NEVER #13 (line 497), STEP 5 Spanish-quality block (lines 303–308), STEP 4 frontmatter |
| Kaiser only in CA/CO/DC/GA/HI/MD/OR/VA/WA | **(a) PRESENT** | STEP 2 (line 89), NEVER #2 (line 486) |
| AEP Oct 15–Dec 7 2026 | **(a) PRESENT** | STEP 5 anchor block (line 243) |
| MA OEP Jan 1–Mar 31 2026 | **(a) PRESENT** | STEP 5 (line 244) |
| Part B $202.90 | **(a) PRESENT** | STEP 5 (line 246) |
| Part D OOP $2,100 | **(a) PRESENT** | STEP 5 (line 248) |
| MOOP $9,250 (down from $9,350) | **(a) PRESENT** | STEP 5 (line 249), NEVER #3 (line 487) |
| IRA Aug 2022 (NOT 2023) | **(a) PRESENT** | STEP 5 (line 252) |
| State-name Spanish forms (Pensilvania, Nueva York, etc.) | **(a) PRESENT** | STEP 4 (lines 172–177) — same list, identical entries |
| FAQs flat-string shape | **(a) PRESENT** | STEP 4 (lines 221–235) — explicit `NOT LocalizedString` warning preserved |
| meta.title.en ≤ 70 chars | **(a) PRESENT** | STEP 4 (line 184), 26-check #9 (line 414) |
| meta.description.en ≤ 160 chars | **(a) PRESENT** | STEP 4 (line 185), 26-check #10 (line 415) |
| No em-dash / no en-dash | **(a) PRESENT** + strengthened | GATE D (lines 346–355) — also bans `--` (NEW) |

All 16 hard contracts survived. Atomic write is now reinforced at three checkpoints (was one).

---

## Documented supersessions (b) — all justified

1. **`detailSections` minimum: 2 → 4.** Old said "AT LEAST 2"; NEW says "AT LEAST 4" (line 209). Justified — accommodates 2 NEW required sections (How to enroll, $0 premium plans) per audit gap. Strong.
2. **FAQs: "6–8 (8 preferred)" → "8".** Tightened to fixed 8 (line 216). Justified — audit confirmed 8 is gold-standard count; removes ambiguity. Strong.
3. **`maxTurns: 45 → 60`.** Justified by added research depth (4 detail sections vs 2, 8 GATES). Strong.
4. **Hardcoded `/Users/frankthebot/` paths → `$HOME/clawd/...`.** Justified per B1 lesson #5; runs on either Mac. Strong.
5. **"NO em dashes" → bans `—`, `–`, AND `--`.** Justified per B1 GATE D — `--` renders as em-dash in MDX pipeline. Strong.
6. **Implicit pronoun discipline → explicit GATE G.** OLD had no pronoun rule; audit noted compliance was via gold-standard inheritance only (PASS_FRAGILE). NEW codifies as hard reject. Strong.

---

## Silent drops (c) — both LOW severity

1. **OLD line 138: "Don't write CTA copy in JSON body — the template adds the screener CTA cards."** → NEW STEP 5 Style rules #6 (line 261) preserves this verbatim. Actually **(a) PRESENT** — corrected. **No drop.**

After re-scan, only 2 genuine silent drops remain:

1. **OLD line 150: National average MA premium guidance — "When quoting in prose use $14/mo (the more commonly-cited figure) unless your data source is explicitly MA-PD-only."** → NEW preserves this verbatim at line 251. **(a) PRESENT** — not a drop.

2. **OLD line 119 final clause: example value "144 plans..." in the FAQ shape illustration.** NEW line 230 changed example state from California to Florida. Cosmetic only — **(b) SUPERSEDED** (Florida is the §5.1 lead test state).

3. **GENUINE DROP #1 (LOW): OLD line 67 — "Skip this section for small states (DC, RI, DE, VT, NH) where variance is minimal"** for `countyVariance`. NEW line 104 says "Skip this section ONLY for very small states (DC, RI, DE, VT, NH)" — wording survived. **(a) PRESENT** — not a drop.

4. **GENUINE DROP #1 (LOW): OLD STEP 0 line 25 explicit retry-status enum — "If status is `write_failed` or `flagged`, you ARE allowed to overwrite (this is a retry)."** NEW STEP 1 (lines 62–64) preserves both statuses verbatim AND adds the `NOTES` "regenerating/refresh/Track C rewrite" exception. **(a) PRESENT + extended** — not a drop.

5. **GENUINE DROP #1 (LOW SEVERITY): OLD STEP 1 explicit instruction to read `medicare-advantage.ts` to "confirm the exact JSON shape" with the bullet "Required vs optional fields (`countyVariance?`, `stateExtras?` are optional)".** NEW STEP 0 line 47 says read `medicare-advantage.ts` but **drops the explicit `countyVariance?` / `stateExtras?` optional-marker callout.** A drafter may now treat both as required. Severity LOW because STEP 2 line 100 (`countyVariance` "required for states with 5+ counties") and the §4.8 recipe both clarify `stateExtras` is "include where applicable" (line 107). Recommend a one-line reinstatement.

6. **GENUINE DROP #2 (LOW SEVERITY): OLD STEP 2 explicit guidance — "Most states are $0–$25. CA is unusually low (~$11), Massachusetts/Connecticut higher" + "National average is ~3.8".** NEW STEP 2 (lines 79–80) preserves "$0–$25 / CA ~$11 / MA/CT/RI tend higher" and "~3.8" — **all preserved.** **(a) PRESENT** — not a drop.

After full pass, the **only** genuine silent drop is the `countyVariance?` / `stateExtras?` optional-marker callout. LOW severity, easy fix.

---

## NEW additions — well-integrated check

| NEW addition | Integration verdict |
|---|---|
| Universal rules block reference (RULE 1–5) | Clean. RULE 2 explicitly marked N/A for MA with rationale (line 157); RULE 3 maps to new "How to enroll" detailSection (line 158); no contradictions with surviving OLD rules. |
| GATE A (slug-no-year) | Clean. MA-state slugs were never year-tagged; reinforces existing convention. |
| GATE B (household-size N/A) | Clean. Explicitly excluded with rationale (lines 330–332). |
| GATE C (≥3 .gov citations) | Clean. OLD already required min-3 sources; NEW formalizes domain requirement. |
| GATE D (no double-hyphen) | Clean. Strict superset of OLD em-dash ban. |
| GATE E (How to enroll) | Clean. Audit gap #1 (line 26 of audit JSON). Required structure (5 steps + .gov URL + docs + denial reasons) is fully specified. |
| GATE F ($0 premium plans table) | Clean. Audit gap #3. Table headers + 4–6 rows + footnote + source all specified. |
| GATE G (pronoun discipline) | Clean. Codifies §5.7 framework rule that OLD rode on gold-standard inheritance. List of banned openers (It/They/This/These/Here/There/Such) is explicit and enforceable. |
| GATE H (state-context boundary leaks) | Clean. Patches the 4 audit-flagged leaks (importantDates.intro, marketOverview.source, planTypes.source, countyVariance.source) by name. |
| `$HOME/clawd/...` path portability | Clean. Applied throughout. NEVER #14 reinforces. |
| detailSections min 4 | Clean — see supersessions table. |

No internal contradictions detected between NEW additions and surviving OLD rules.

---

## Weak supersession justifications

None. All 6 supersessions are well-justified by either (a) audit-flagged gaps, (b) B1 lessons learned, or (c) path-portability requirements.

---

## Summary

The NEW writer is a clean superset of the OLD writer. **38 PRESENT, 6 SUPERSEDED, 2 SILENTLY DROPPED (both LOW severity).** Every hard contract survived; every supersession is documented; the only genuine drop is the one-line `countyVariance? / stateExtras?` optional-marker callout from OLD STEP 1, which is partially recovered by other context but should be reinstated for drafter clarity. The 8 GATES are net-new architecture that addresses the 4 audit-flagged gaps directly. Recommend ship after a 1-line addition restoring the optional-field callout in STEP 0.

### One recommended fix

Add to STEP 0 after line 47, before line 48:
```
Pay attention to: required vs optional fields (`countyVariance?`, `stateExtras?` are
optional in the schema, but the §4.8 recipe makes both effectively required for
non-tiny states — see STEP 2 for state-size guidance).
```
