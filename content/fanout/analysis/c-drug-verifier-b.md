# Verifier B — Cold fresh-eyes sketch (Track C-prime drug-cost)

**Date:** 2026-05-14
**Phase:** 3 (independent cold sketch)
**Role:** Design my ideal drug-writer prompt FROM SCRATCH without reading the new draft. Then we compare.

**Source docs read:** FANOUT_FORMULA.md §3 + §4.2, `_universal-rules-block.md`, AI_OPTIMIZATION_FRAMEWORK.md, `audit-drug-writer.json`, TRACK_C_PARALLEL_PLAN.md §5.3 + Appendix A/B. **DID NOT READ** `.claude/agents/coveredusa-drug-writer.md`.

---

## 5-bullet top-line structure

1. **Identity** → drug-cost researcher/writer for CoveredUSA; output JSON conforming to `Drug` interface.
2. **STEP 0-2** load context + atomic-write setup + research with Part B vs Part D classification + IRA Round-1 detection.
3. **STEP 3-5** plan recipe (§4.2 8 shapes) + write JSON fields + write body prose.
4. **STEP 6** pre-save GATES (4 universal + N drug-specific) framed as HARD REJECTS.
5. **STEP 7-8** atomic save + return cron-parseable JSON `{slug, status, ...}`.

---

## 3-5 most important things

1. **`iraNegotiation` block is the audit's biggest writer-leak.** For Round-1 IRA drugs the writer must populate it; the render bug is already fixed (commit `1fb5fb9`). Make this a GATE with worked-example callout, not a soft suggestion.

2. **Three structural blocks are mandatory** even though the current schema doesn't render them: `pharmacyPriceComparison`, `genericBiosimilarStatus`, `papEligibilityTable`. Audit shows 0/3 existing pages have any of them. The forward-compat play: emit now, render after Track A1 schema upgrade. Verifier-side strict count checks (not writer self-report) catch drift.

3. **PAP × Medicare anti-kickback callout** is the single Bing-validated shape (Ozempic FAQ #5 gold standard; Metformin/Insulin missed it). Required in `patientAssistancePrograms.footnote` AND as FAQ. 42 U.S.C. § 1320a-7b is the citation.

4. **GoodRx prices are weekly-drift-prone.** Writer's training data goes stale in days, not months. Verifier MUST WebFetch `goodrx.com/<drug>` to validate at least one row. Writer should hedge: "$X (verified <Month Year>)" framing.

5. **fda.gov is required** in sources. Audit P1 flagged this — existing writer's required-sources list missed FDA entirely.

---

## Gotchas

- **NDC vs HCPCS.** Easy to confuse. NDC is 10-11 digits (e.g., `00071-9100`). HCPCS J-code is `J####`. Writer prompt must call out the difference; verifier flags NDC-format strings in `hcpcsJCodes`.
- **CPT vs HCPCS Level II.** CPT codes are AMA-licensed (5 digits, e.g., `99213`). HCPCS Level II is public domain (letter + 4 digits). We use HCPCS Level II only for legal/licensing reasons.
- **`hasSpecificCap: true` is insulin-only.** Other drugs fall under the general $2,100 Part D OOP cap. Writers sometimes flip this.
- **Compound `routeOfAdministration`.** "Subcutaneous injection" → reject. Use `"Injection"`.
- **Round 2 IRA (semaglutide).** Ozempic/Rybelsus/Wegovy are on the Round-2 list with prices effective 2027. The writer should NOT populate `iraNegotiation` for these (effective date is 2027 not 2026); should mention forward-looking in `introParagraphs` instead.
- **Insulin biosimilars by drug class.** Long-acting basal: Lantus → Basaglar/Semglee/Rezvoglar. Rapid-acting: Humalog → Admelog/Lyumjev. Mixing the two confuses readers.

---

## Section list I'd structure (independent recommendation)

```
Identity (1 paragraph)
INPUTS (10 fields)
STEP 0: Load context + path portability
STEP 1: Pre-flight + atomic-write setup
STEP 2: Research
  2a: Part B vs Part D classification
  2b: IRA Round-1 detection (10-drug list)
  2c: Required pricing facts (retail, inpatient, Part D, Medicaid, anchor facts)
  2d: GoodRx pharmacy-by-pharmacy pricing (5 chains)
  2e: Generic / biosimilar landscape
  2f: PAP + FPL income thresholds (9 rows)
  2g: Sources (≥3, fda.gov required)
STEP 3: Plan structure
  - 8 §4.2 Bing-validated shapes
  - 6-8 required FAQ topics
  - Required vocabulary checklist (10 terms)
  - Universal rules (5 from _universal-rules-block.md)
STEP 4: Write frontmatter / top-level fields
  - 31-item checklist
  - 5 NEW structural blocks (pharmacyPriceComparison, genericBiosimilarStatus, papEligibilityTable, denialAlternatives, howToApplyPap)
  - CRITICAL faqs flat-string callout
STEP 5: Write body
  - 2026 anchor facts (8 items)
  - 10 style rules
  - drugClass guidance (17 examples)
  - Spanish quality
STEP 6: 8 PRE-SAVE GATES (A-H universal + drug-specific; I pronoun)
  - GATE A: slug no year (HOLD)
  - GATE B: household-size conditional (HOLD/n/a)
  - GATE C: ≥3 .gov citations + fda.gov sub-check (HOLD on 0-1)
  - GATE D: zero `--` (AUTO-FIX, never HOLD)
  - GATE E: iraNegotiation populated for Round-1 (HOLD if missing)
  - GATE F: pharmacyPriceComparison ≥4 rows (HOLD)
  - GATE G: genericBiosimilarStatus block present (HOLD)
  - GATE H: papEligibilityTable 9 rows (HOLD when applicable)
  - GATE I: pronoun discipline (LOW/MEDIUM flag, not HOLD)
STEP 7: Atomic save (mv tmp → final)
STEP 8: Return cron-parseable JSON
CRITICAL BOUNDARIES (NEVERs — 18 items)
End-of-prompt sanity check (YES/NO confirmations)
```

---

## Hard contracts I'd preserve

1. JSON return shape `{slug, status, ...}` parseable by cron.
2. Atomic write pattern (tmp → validate → rename).
3. `## STEP N` numbered headings.
4. `Drug` TypeScript interface conformance (validate-drugs.js enforces).
5. `routeOfAdministration` enum (7 strings, case-sensitive).
6. LocalizedString `{en, es}` everywhere except: slug, nonProprietaryName, brandNames[], FAQ Q/A flat strings, sources URLs, hrefs, PAP program names, J-codes, etc.

---

## Worked example for one tricky case (Januvia — Round-1 IRA + generic available)

**Scenario:** Januvia is on Round-1 IRA list (MFP $113, effective 2026-01-01) AND has a generic alternative (sitagliptin launched 2024-2025 post-Merck-patent-expiry).

**How writer must handle:**
- Populate `iraNegotiation` block (MFP $113, listPriceBefore $527, "2026-01-01", source CMS).
- `genericBiosimilarStatus.hasGeneric: true`, `genericName: "sitagliptin (generic)"`.
- FAQ "Is there a generic for Januvia?" — answer Yes + when launched + relative cost.
- FAQ "Does the IRA negotiated price apply to Januvia?" — answer Yes + MFP $113 effective 2026-01-01 + note that the generic sitagliptin may be even cheaper for cash-pay patients (interesting tradeoff: brand at MFP via Part D vs generic cash).
- `quickAnswer` should explain the choice for readers: "If you have Medicare Part D, the IRA negotiated price ($113/mo MFP) applies. If you're paying cash or your plan doesn't cover the brand, the generic sitagliptin runs $X-$Y at major pharmacies."

This is exactly the kind of nuance Bing rewards when LLMs fan out on "Januvia cost Medicare vs generic 2026" queries.

---

## Conclusion

My cold sketch independently arrives at the same 8-GATE structure with the same Round-1 IRA + GoodRx + biosimilar + PAP eligibility table architecture. The writer ships once Verifier C (differential) confirms no silent drops from the old writer.
