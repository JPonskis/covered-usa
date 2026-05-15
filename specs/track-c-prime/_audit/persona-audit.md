# Track C-prime PERSONA — Session Output Audit

**Date:** 2026-05-15
**Auditor:** parallel audit pass
**Subject:** persona-writer.md + persona-verifier.md rewrites + 5 Phase-4 test articles + analysis files

---

## Verdict

**PARTIAL PASS with one structural drift the team needs to resolve before claiming the audit's #1 fix landed.**

The session shipped 5 strict-validator-clean articles, the universal-rule strengthening landed (no dashes, no factual errors, full 9-letter GATE framework), and the body content does carry persona synonyms at a depth the prior gig-workers.json never had. But the writer + verifier prompts define GATE E in a way that counts occurrences of `keyTerms.en` entries in body content, and the writer emitted `keyTerms.en` as long search-phrase strings (e.g., "rideshare driver health insurance 2026", "Form 7206 deduction") that essentially never appear verbatim in body. Under a strict literal read of the prompt, GATE E FAILS on all 5 articles. Under the intent ("≥5 distinct persona synonyms in body"), GATE E PASSES on 4/5 (WARN on college-students at 4 distinct).

The retest doc claims "synonym distinct 11 / 5 / 9 / 7 / 9" but those counts come from a body-keyword scan, not from the rule the verifier prompt actually defines. That discrepancy is the single most important finding here.

---

## Per-check counts

| # | Check | Result |
|---|---|---|
| 1 | Writer prompt structure (STEP 0-8, $HOME paths) | PASS |
| 2 | Writer GATES (4 universal + E/F/G/H/I) | PARTIAL — GATE E definition mismatched against the keyTerms shape it produces |
| 3 | Verifier dual-purpose + structural detect | PASS (clean STEP 1A/1B/1C split, no auto-fix on structural except D) |
| 4 | Synonym density (audit's #1 fix) | PARTIAL — body has synonyms, but gate-as-written fails its own check |
| 5 | PTC eligibility section | PASS (all 5 articles, ≥2 PTC mentions) |
| 6 | HSA/FSA distinction | PARTIAL — HSA/HDHP solid; "FSA" only appears in 2/5 articles |
| 7 | Form 7206 reference (SE personas) | PASS (uber-lyft + freelance both name Form 7206 + Schedule SE caveat correct, no "reduces both") |
| 8 | State-specific stipend (CA Prop 22) | PASS (uber-lyft names Prop 22 + MA Question 3; freelance names NY FIFA) |
| 9 | ctaTarget = "screener" all 5 | PASS |
| 10 | GATE B applicability | PASS — income-gated 3/5 have 9-row table; college-students + early-retirees correctly skip |
| 11 | Validator clean | PASS (0 bad across all 5 test articles; warnings only on legacy gig-workers + self-employed) |
| 12 | Analysis files present (matrix + 3 verifiers + retest + memory) | PASS (6 files in `content/fanout/analysis/`; memory entry exists) |

Dash scan: 0 dashes across all 5 articles. GATE D effective.
Backups: both `coveredusa-persona-writer.bak.md` and `coveredusa-persona-verifier.bak.md` present.
isLighthouse / isDeprecated: **NOT EMITTED** on any of the 5 articles. The writer prompt lists them as required additive fields. Silent drop.

---

## Top 3 issues

### Issue 1 — GATE E shape/intent mismatch (the audit's #1 fix is half-landed)

The writer's STEP 6 GATE E and the verifier's STEP 1C GATE E both define synonym density as: "for each synonym S in `keyTerms.en`, count occurrences in body; if <3 distinct synonyms have ≥2 occurrences each, REJECT." But the writer emitted `keyTerms.en` like:

- uber-lyft: `["rideshare driver health insurance", "Uber driver health insurance 2026", "Lyft driver health insurance", "1099 contractor health insurance", "gig worker health insurance", "self-employed health insurance 2026", "California Prop 22 health stipend 2026", "Massachusetts rideshare driver health benefit fund", "Form 7206 self-employed health insurance deduction"]`
- early-retirees: `["early retiree health insurance", "pre-65 health coverage 2026", "ACA marketplace early retirement", "premium tax credit retiree", ...]`

These are search-phrase strings, not the bare synonyms the GATE wants counted. Running the literal GATE E algorithm against the shipped articles produces 0/9, 1/9, 1/6, 0/9, 0/9 distinct synonyms with ≥2 occurrences — i.e., HOLD on all 5.

The body content itself does carry bare synonyms (rideshare driver 6×, uber driver 6×, sole proprietor 3×, freelancer 3×, contractor 15×, pre-65 retiree 8×, etc.), so the audit's *intent* fix landed. But the gate as written cannot detect that. The retest doc reporting "synonym distinct 11" measured something different from what the verifier prompt defines.

Two valid resolutions: (a) change `keyTerms.en` to carry bare synonyms ("rideshare driver", "uber driver", "1099 contractor", ...) — but those then double as link-index targets which the LINK_TARGET_MANIFEST may prefer as longer phrases; or (b) change GATE E to scan a separately declared `synonyms[]` field (currently absent) or a writer-side derived list. Either way, the writer prompt's STEP 8 return JSON template currently shows `keyTerms.en` with phrase-shaped entries, and the writer followed that template, then GATE E failed under its own definition. The two halves of the prompt disagree.

### Issue 2 — isLighthouse + isDeprecated silently dropped

Writer prompt STEP 4 (checks 26 + 25) requires `isLighthouse: false` and `isDeprecated: false`. All 5 articles omit both fields. Validator doesn't enforce them (they default to undefined and React reads them as falsy), so this didn't fail the validator. But it's a writer-side regression vs the STEP 8 return-JSON template, and one of Track C-prime's stated Track A1 forward-compat goals.

### Issue 3 — "Flexible Spending Account" / "FSA" missing in 3/5 articles

The required-vocabulary checklist (writer STEP 2) lists FSA among the 8 canonical terms "to distinguish HSA from FSA." uber-lyft + freelance + early-retirees omit FSA entirely. Verifier Category B explicitly warns "Watch for conflation." The omission is a soft fail (HSA is well-covered with HDHP terms and 2026 limits), but it leaves the writer's own checklist incomplete on 60% of the test mix. Same pattern with Section 1095-A / Form 1095-A — absent from 5/5 articles despite being on the required-vocabulary list. catastrophic plan absent from uber-lyft + freelance + recently-lost (acceptable, since they're over-30 personas and the writer prompt allows "explicit ineligibility statement" — but no such statement appears either).

---

## Specific drift caught by the rewrites (positives)

- **2026 anchor facts:** retest doc shows 5 distinct anchor-fact corrections (HDHP $1,700, mileage $0.725, ACA OOP $10,600, FPL increment $5,680, Medicaid expansion count 40+DC). Verifier safety net working as designed.
- **Form 7206 + Schedule SE:** uber-lyft + freelance both name Form 7206 explicitly; neither contains the "reduces both income tax and SE tax" factual error. GATE I PASS.
- **State stipends:** uber-lyft cites both CA Prop 22 + MA Question 3; freelance cites NY FIFA. Audit's shape #6 gap on prior gig-workers (0 mentions) closed.
- **Household tables:** 3 income-gated articles ship 9-row tables; 2 pure-status articles correctly skip and link to /medicaid-income-limits.
- **Dash discipline:** 0/0/0/0/0 across all 5 articles. Old gig-workers / self-employed still carry em-dashes (validator warnings on the legacy files, not the new ones).

---

## Missing files

None. The 4-commit deliverable is structurally complete: writer.md, verifier.md, .bak pair, 5 JSON articles, matrix + 3 verifiers + retest in `content/fanout/analysis/`, and the memory entry at `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_track_c_persona_writer_shipped.md`.

---

## Recommendation

Before declaring Track C-prime PERSONA "done," fix the GATE E spec/output mismatch. Either rewrite the GATE to scan body content directly for a writer-declared `synonyms[]` (not `keyTerms.en`) list, or change the writer's `keyTerms.en` output template to carry bare-synonym tokens. Then re-run the verifier on the 5 shipped articles and confirm the GATE E result matches what the retest report claimed.

Also: add `isLighthouse: false` + `isDeprecated: false` to the 5 articles (one-line append per file). Optional but matches the prompt's own contract.
