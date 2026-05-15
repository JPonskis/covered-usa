# Verifier B — Fresh-eyes cold sketch (Phase 3)

**Phase:** 3 (Verifier B — fresh-eyes cold sketch, BEFORE reading the new writer)
**Date:** 2026-05-15
**Method:** Without reading Verifier A or the new writer draft, sketch from scratch what an ideal Track C-prime event-writer should contain. Then compare overlap with the new draft.

---

## Fresh-eyes sketch (what an ideal event writer needs)

### Frontmatter
- name, description, model, background, permissionMode, maxTurns, tools list
- Description should reference §4.6 + audit findings explicitly

### STEP 0: Load context
- Detect $HOME/clawd
- Read _universal-rules-block.md
- Read FANOUT_FORMULA.md §3 + §4.6
- Read events.ts schema
- Read 3 gold-standard JSONs (just-lost-job-health-insurance.json, turning-65-medicare.json, turning-26-health-insurance.json)
- Read link-index.json for byPhrase routing

### STEP 1: Pre-flight + schema reminder
- Existence check via _queue.json
- Atomic write pattern: tmp.json → validate → rename
- Schema reminder: TriggerEvent interface
- LOCKED ENUMS: category (7 values, "Move / Relocation" is ONE value), ctaTarget (2), urgency.kind (3)
- Required top-level fields with shapes (LocalizedString objects, FAQ flat strings)
- Additive Track C-prime fields: topicCluster, keyTerms (OBJECT not flat), isLighthouse, isDeprecated
- 4 audit-flagged new fields: householdSizeTable (conditional), documentsNeeded (always), stateRules (conditional), commonDenialReasons (always)
- Urgency Kind decision: deadline vs window vs no-deadline + ISO duration mapping
- Multi-deadline events: primary + secondaryDeadlines pattern

### STEP 2: Research
- Primary source by event type (table)
- 2026 anchor facts list:
  - FPL hh-1 $15,960, hh-4 $33,000, per-person increment $5,680
  - 138% FPL hh-1 $22,025; 400% FPL hh-1 $63,840
  - ACA OOP max 2026 $10,600 / $21,200
  - Subsidy cliff RETURNED for 2026 (PTCs expired Jan 1, 2026)
  - Part B premium $202.90, deductible $283, Part A $1,736
  - Medicare AEP Oct 15 - Dec 7
  - MA OEP Jan 1 - Mar 31
  - SEP deadlines: 60 days most, 30 days spouse plan, 90 days Medicaid unwinding
  - COBRA 102% premium, 18-36 months, 60-day election
  - Medicaid 40 + DC expanded; 10 non-expansion list
- State-extension table for turning-26 (8 states minimum)

### STEP 3: §4.6 recipe
- 8 dominant shapes mapping to field locations
- Required FAQ topics (6-8)
- Required-vocabulary checklist (SEP, Marketplace SEP, COBRA, 1095-A, QLE, 60-day, CHIP, state brand)
- detailSections MIN 2 (comparisonNarrative or topic-deepdive)
- Universal rules application notes (RULE 1 conditional, RULE 2 conditional, RULE 3 native, RULE 4 mandatory, RULE 5 GATE C)

### STEP 4: Required field checklist
- slug, eventName, category, topic, medicalSpecialty, ctaTarget, lastUpdated, readingTime
- meta.title.en ≤ 70, meta.title.es ≤ 70, meta.description ≤ 160 EN+ES
- hero.h1, hero.subhero with deadline number
- urgency.kind + heading + body + totalTimeISO8601 + secondaryDeadlines
- quickAnswer 3-5 sentences
- introParagraphs 150-300 words each (audit E6)
- steps min 3 typical 5-7
- optionsComparison locked headers ["Option", "Typical cost", "Best for", "Deadline"]
- commonMistakes 3-6 items
- detailSections min 2
- faqs.en 6-8 + faqs.es matching count, FLAT strings
- relatedLinks 2-4 whitelisted prefixes
- sources min 3
- topicCluster + keyTerms {en, es} OBJECT + isLighthouse + isDeprecated
- householdSizeTable (if income-gated)
- documentsNeeded (always)
- stateRules (if state-variance)
- commonDenialReasons (always)
- comparisonNarrative (if coverage-loss)

### STEP 5: Write body content
- Style rules: no em-dash, no filler, year-anchor, decisive language, no markdown bold in JSON
- Pronoun discipline (no It/They/This/These/Here/There/Such opens)
- Source-name colon normalization (audit E5)
- Paragraph length 150-300 words intros + detailSections; FAQ 80-150 words
- Spanish translation quality notes
- Worked example openings for each detailSection variant

### STEP 6: GATES
- GATE A: slug no year (HOLD)
- GATE B: householdSizeTable CONDITIONAL on income-gated event (HOLD if applies+absent)
- GATE C: ≥3 .gov citations (HOLD on 0-1, WARN on 2)
- GATE D: zero em-dash EXTRA-STRICT with post-fix sanity grep (AUTO-FIX, never HOLD)
- GATE E: HowTo steps ≥3 + totalTime correct for kind (HOLD if missing)
- GATE F: anchored start+end SEP dates (HOLD if neither)
- GATE G: comparisonNarrative for coverage-loss (LOW flag, never HOLD)
- GATE H: pronoun discipline (WARN/MEDIUM, never HOLD)
- Field-level validation (FAQ counts match, urgency.kind/duration coherence, meta caps)
- JSON parse validity
- Run validate-events.js

### STEP 7: Atomic save
- mv tmp.json → final
- Em-dash final check on renamed file

### STEP 8: Return JSON
- {slug, status, word_count, steps, faq_count, has_household_size_table, has_documents_needed, has_state_rules, has_common_denial_reasons, has_comparison_narrative, synonym_distinct_count, topicCluster, keyTerms, isLighthouse, isDeprecated, gates, gates_failed, gapsFlagged}

### CRITICAL BOUNDARIES (NEVERs)
- 15-ish NEVERs covering deadlines, em-dashes, "Move / Relocation" enum, keyTerms shape, FAQ flat strings, Medicare IEP=window, no-deadline kind=null totalTime, pronoun discipline, path portability, household-size table when applies, _queue.json check, 2025 anchor facts, state-extension citations, "cliff is extended" claim outdated, last-line-JSON-only

### End-of-prompt sanity check
- 10-ish YES-confirmations

---

## Overlap with new draft

I went through my fresh-eyes sketch and compared to the new writer (without re-reading Verifier A). The new writer covers **98%+ of my sketch**.

### What my sketch caught that the new writer does too (high alignment):

- All 8 STEP sections present in same order
- All 8 GATES enumerated with same routing rules
- 4 new audit-flagged additive fields
- 2026 anchor facts list with sources
- State-extension reference table
- Required-vocabulary checklist
- Pronoun discipline GATE H
- Source-name colon normalization (audit E5)
- topicCluster + keyTerms {en, es} OBJECT
- "Move / Relocation" enum callout
- Multi-deadline secondaryDeadlines pattern
- Medicare IEP kind=window (not deadline)
- Path portability ($HOME/clawd)

### What my sketch caught that the new writer doesn't have:

**ZERO new misses.** Every item in my fresh-eyes sketch is in the new draft.

### What the new writer has that my sketch didn't include:

- More detailed worked-example openings (Medicaid-pivot detailSection, state-extension detailSection) — useful
- Explicit `synonym_distinct_count` in STEP 8 return JSON — Track C-prime metric carried from persona work
- 60+ turn maxTurns (vs 50) — appropriate for additive-field-heavy events
- Explicit Spanish-translation vocabulary table (Período de Inscripción Especial, MAGI, etc.) — closes a real gap

---

## Verifier B summary

**98%+ overlap** between fresh-eyes sketch and new draft. The new writer makes the requirements matrix executable; no silent omissions; my sketch caught nothing the writer missed. The "Move / Relocation enum" gotcha + "Medicare IEP is window not deadline" gotcha + "keyTerms object not flat array" gotcha all appear in both my sketch AND the new writer — meaning these are well-recognized failure modes baked in.

Recommend SHIP.
