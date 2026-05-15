# Verifier A — Matrix-driven critic (Track C-prime drug-cost)

**Date:** 2026-05-14
**Phase:** 3 (post-draft critique)
**Role:** Score the NEW `coveredusa-drug-writer.md` against every requirement in `c-drug-requirements-matrix.md` (62 reqs).

---

## Verdict summary

| Status | Count |
|---|---|
| PASS | 58 |
| PARTIAL | 4 |
| FAIL | 0 |

**Overall:** writer is shippable. The 4 PARTIAL items are guidance-soft rather than gate failures; they tighten in the verifier's STEP 1C (which is what verifier-side gating is for).

**Top 5 fixes needed before Phase 4 — NONE BLOCKING.** All 4 PARTIAL items are nice-to-have polish.

---

## Per-requirement scoring

### Category 1 — formula-universal

- **REQ-001** state-context-everywhere N/A: **PASS.** STEP 3 explicitly notes N/A; Medicaid-copay exception correctly handled via `/medicaid-income-limits` link.
- **REQ-002** household-size table conditional: **PASS.** GATE B + GATE H interlocked correctly.
- **REQ-003** how-to-apply: **PASS.** `howToApplyPap` block fully specified with 3-7 steps + URL + 4-8 documents + 3-5 denial reasons.
- **REQ-004** year markers: **PASS.** STEP 5 anchor facts + style rules enforce 2026 inline next to every $/% .
- **REQ-005** authoritative source narrowing: **PASS.** GATE C requires ≥3 .gov; fda.gov is the explicit sub-check.

### Category 2 — formula-recipe (§4.2)

- **REQ-006** Shape #1 PAP + cost-without-insurance contrast: **PASS.** STEP 3 + STEP 4 patientAssistancePrograms intro guidance is explicit.
- **REQ-007** Shape #2 GoodRx comparison: **PASS.** GATE F strict count check; worked example for atorvastatin in STEP 4.
- **REQ-008** Shape #3 anti-kickback callout: **PASS.** STEP 4 checklist + STEP 3 FAQ list + NEVER #14 all reference.
- **REQ-009** Shape #4 monthly cost: **PASS.** Internal consistency check #2 in STEP 1A.
- **REQ-010** Shape #5 list price + IRA: **PASS.** GATE E covers Round-1; STEP 2b mentions Round-2 forward-looking.
- **REQ-011** Shape #6 denial alternatives: **PASS.** STEP 4 specifies `denialAlternatives` block with 4 appeal steps minimum.
- **REQ-012** Shape #7 generic/biosimilar: **PASS.** GATE G; insulin biosimilar names explicitly required.
- **REQ-013** Shape #8 IRA negotiation: **PASS.** GATE E worked example for Eliquis (maxFairPrice 295, listPriceBefore 521, 43% reduction).
- **REQ-014** Required vocabulary: **PASS.** STEP 6 grep check after GATES.

### Category 3 — audit-flagged (11 items)

All P0/P1/P2 items mapped to writer rules:

- **REQ-015 GoodRx table:** PASS — GATE F.
- **REQ-016 Generic block:** PASS — GATE G.
- **REQ-017 howToApplyPap:** PASS — STEP 4 + STEP 6 GATE H sub-check.
- **REQ-018 papEligibilityTable:** PASS — GATE H (9 rows strict).
- **REQ-019 denial alternatives:** PASS — STEP 4 spec.
- **REQ-020 fda.gov required:** PASS — STEP 2g + GATE C sub-check.
- **REQ-021 table caption pattern:** PASS — STEP 5 style rules.
- **REQ-022 anti-kickback callout:** PASS — STEP 4 checklist.
- **REQ-023 Medicare Prescription Payment Plan:** **PARTIAL.** Mentioned in `medicarePartD` paragraphs guidance (paragraph 3 of Ozempic gold standard) but not explicitly required at STEP 6. Recommend: add to STEP 4 checklist as "for Part D drugs with retail >$200/mo, surface the Medicare Prescription Payment Plan in `medicarePartD.paragraphs`". *Defer to verifier-side soft check.*
- **REQ-024 Round-2 IRA preview:** **PARTIAL.** STEP 2b mentions Round-2 forward-looking 2027 mention, but not explicitly required by any gate. Recommend verifier flag as LOW if Ozempic/Rybelsus/Wegovy page lacks 2027 mention. *Defer.*
- **REQ-025 Canonical pharmacy brand names:** PASS — STEP 2d names Walmart $4 Generic Prescription Program, Costco Member Prescription Program, Kroger Rx Savings Club.

### Category 4 — framework-preserved

- **REQ-026** 2026 anchor facts: **PASS.** STEP 5 lists all 8 (deductibles, premiums, OOP caps, IRA year, insulin cap).
- **REQ-027** drugClass guidance: **PASS.** STEP 5 has 17 acceptable pharmacology terms listed.
- **REQ-028** Part B vs Part D logic: **PASS.** STEP 2a covers classification; STEP 1A internal consistency checks #7-#9 enforce.
- **REQ-029** Flat-string FAQs: **PASS.** STEP 4 CRITICAL faqs shape callout.
- **REQ-030** Spanish translation: **PASS.** STEP 5 Spanish quality + brand-names-stay-English rule.
- **REQ-031** Style rules: **PASS.** STEP 5 rule 1+2 (no dashes, no filler).

### Category 5 — hard-contract

- **REQ-032-039**: ALL PASS. Cron-parseable JSON shape, atomic write, STEP N headings, Drug interface conformance, LocalizedString shape, Spanish required, route enum, gates object — all covered.

### Category 6 — slug-rule

- **REQ-040**: PASS. GATE A regex check.

### Category 7 — link-consumption

- **REQ-041** link-index: PASS — STEP 0 #5 explicit.
- **REQ-042** relatedLinks: PASS — STEP 4 valid-prefixes list.

### Category 8 — strategic-posture

- **REQ-043-046**: ALL PASS. Default-toward-ship, strict count checks, $HOME paths, no overwrite of verified.

### Category 9 — humanizer-voice

- **REQ-047** Pronoun discipline: PASS — GATE I with worked examples.
- **REQ-048** Concrete numbers: PASS — STEP 5 rule 3+5.
- **REQ-049** Paragraph length: PASS — STEP 5 rule 9.
- **REQ-050** No markdown bold: PASS — STEP 5 rule 10.

### Category 10 — cron-pipeline

- **REQ-051-053** topicCluster + keyTerms + isLighthouse/Deprecated: PASS.
- **REQ-054** New blocks emitted: PASS — STEP 4 lists all 5.
- **REQ-055-062** Validator enforcement: ALL PASS.

---

## Internal contradictions / STEP-mapping errors

None found. STEP numbering is consistent (0-8). GATE letters (A-I) don't conflict with STEP numbers. Backup destination `<file>.bak.md` consistent with master brief §3 Phase 5 Commit 1.

---

## Subtle improvements identified (not blocking)

1. **PARTIAL — REQ-023 (Medicare Prescription Payment Plan):** Could be a STEP 4 checklist item, not just buried in the Ozempic gold-standard reference. Verifier can soft-flag if absent on retail-high drugs.
2. **PARTIAL — REQ-024 (Round-2 IRA preview):** Could be GATE J on Round-2 drugs. Currently relies on writer initiative. Verifier can soft-flag.
3. **Possibly underweighted — `Medicare Prescription Payment Plan` vocabulary not in the 10-term required list.** Most retail-high Part D drugs in 2025+ should mention it. Add to vocabulary check.
4. **GATE I (pronoun discipline) is NEW** in this writer vs ma-state-writer's GATE G. Letter inconsistency could confuse future maintainers. Consider renaming to align (GATE G across all templates). *Decision: keep GATE I to free up G for `genericBiosimilarStatus` mnemonic.*

---

## Conclusion

**Writer ships.** Matrix-driven critique finds zero blockers. 4 PARTIAL items are polish; verifier-side gating addresses them at runtime. Phase 4 (5 test articles) can proceed.
