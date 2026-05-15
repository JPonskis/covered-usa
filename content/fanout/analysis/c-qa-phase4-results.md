# Track C-prime: Q&A Phase 4 Results

**Date:** 2026-05-15
**Pipeline:** 5 parallel writer agents → 5 parallel verifier agents → main-session strict-validator
**Pass criteria:** 5/5 strict-validator pass + 4/5 ≥80% rubric + subtype dispatch verified on all 5

---

## Result: **5/5 STRICT VALIDATORS PASS. 0 BAD FILES. SUBTYPE DISPATCH VERIFIED.**

```
$ node scripts/validate-qa.js
✅ do-i-qualify-for-medi-cal-california.json
✅ do-i-qualify-for-soonercare-oklahoma.json
✅ does-aca-cover-preexisting-conditions.json
✅ does-medicaid-cover-home-health-care.json
✅ does-medicare-cover-hearing-aids.json
Validated 8 qa files. 0 bad. 0 total issues.
```

The 3 pre-existing pages (`does-medicaid-cover-rehab`, `does-medicare-cover-dental`, `does-medicare-cover-vision`) still emit content-quality warnings (missing `topicCluster` + `keyTerms`); Track E will regenerate them.

---

## 5-article scorecard

| Slug | Subtype | Words | FAQs | Verifier status | Notes |
|---|---|---|---|---|---|
| does-medicare-cover-hearing-aids | coverage | 4,134 | 8 | corrected (6 edits) | 97% → 98% MA hearing benefit (KFF 2026); analyzer CTA; 5 alternatives |
| does-aca-cover-preexisting-conditions | coverage | 3,883 | 8 | held → fixed | $62,600 → $128,600 (400% FPL hh-of-4); $20,783 → $22,025 (138% FPL hh-of-1); fullAnswer rewritten to ≤80 words + Yes opener |
| does-medicaid-cover-home-health-care | coverage | 4,752 | 8 | flagged → fixed | HCBS waiver count corrected: "all 50 states + DC" → "47 states"; fullAnswer rewritten to ≤80 words + Yes opener |
| do-i-qualify-for-medi-cal-california | state-eligibility | 4,342 | 8 | held → fixed | **Subtype dispatch test PASSED** — writer correctly inferred `state-eligibility` from `topicCluster: medicaid-income-california` (SUBTYPE intentionally omitted); fullAnswer rewritten + 3 vocab terms patched |
| do-i-qualify-for-soonercare-oklahoma | state-eligibility | 4,231 | 8 | partial → fixed | fullAnswer rewritten to ≤80 words + Yes opener; $22,176/$45,864 OHCA values harmonized across all surfaces |

**Total:** 21,342 words shipped across 5 articles. Average 4,268 words per article.

---

## Subtype dispatch verification

The mandatory test was on `do-i-qualify-for-medi-cal-california`:
- INPUTS: SUBTYPE **intentionally omitted**; only TOPIC_CLUSTER = `medicaid-income-california` provided
- Expected behavior (per writer's STEP 0a.2): infer `subtype = state-eligibility` from `topicCluster` regex `medicaid-income-*`
- Result: ✅ Writer correctly resolved to `state-eligibility`, applied §4.4 recipe, produced 9-row `householdSizeTable`, `stateBrand: "Medi-Cal"`, `howToApply` block, `pageType: "eligibility"`
- Writer return JSON: `{"slug": "do-i-qualify-for-medi-cal-california", "status": "success", "subtype": "state-eligibility", "pageType": "eligibility", "stateBrand": "Medi-Cal", ...}`

**Dispatch fallback chain works.** This validates the ONE-writer-with-subtype-dispatch architecture (audit §D decision).

---

## Concrete drift caught by the verifier

These are the substantive content errors that would have shipped silently under the old prompt. The verifier caught all of them:

### 1. ACA preexisting: 400% FPL hh-of-4 calculation error (HIGH)
- **Writer wrote:** `$62,600 for a family of four` (400% of hh-of-1 FPL × 4 — math error)
- **Verifier corrected:** `$128,600 for a family of four` (400% × 2025 FPL hh-of-4 of $32,150)
- **Source:** 2025 HHS ASPE FPL table; 2026 ACA marketplace uses 2025 FPL
- **Why it matters:** 400% FPL is the post-cliff threshold; this is the exact number AI engines surface in subsidy-cliff queries

### 2. ACA preexisting: 138% FPL hh-of-1 was 2 cycles stale (HIGH)
- **Writer wrote:** `about $20,783 for an individual` (138% × 2024 FPL of $15,060)
- **Verifier corrected:** `about $22,025 for an individual` (138% × 2026 FPL of $15,960)
- **Why it matters:** Federal Medicaid eligibility threshold; stale by 2 plan years
- **Same writer also used wrong $62,600** — pattern suggests it relied on outdated training data

### 3. Medicaid home health: HCBS waiver state count fabricated (HIGH — force-flagged)
- **Writer wrote:** `all 50 states plus DC operate at least one HCBS waiver program as of 2026` (in fullAnswer.en + coverageBreakdown footnote)
- **Verifier confirmed via KFF 2025 HCBS survey:** Only **47 states** operate at least one §1915(c) HCBS waiver
- **Verifier force-flagged** per Case 1-bis (cannot auto-edit fullAnswer)
- **Main session manually fixed** fullAnswer + 2 surrounding occurrences
- **Why it matters:** fullAnswer is schema.acceptedAnswer — AI engines surface this verbatim

### 4. Hearing aids: 97% → 98% MA hearing benefit (LOW — auto-fixed across 6 places)
- **Writer wrote:** `~97% of MA plans include some hearing benefit in 2026` (2025 KFF data)
- **Verifier corrected to:** `~98% of MA plans` (2026 KFF Spotlight)
- **Auto-fix swept 6 occurrences** via narrow grep-then-edit

### 5. ACA preexisting: STLD non-enforcement caveat (MEDIUM — flagged for human review)
- **Writer wrote:** "Federal rules finalized in 2024 cap STLD plans at 4 months total duration including renewals"
- **Verifier note:** As of Aug 7, 2025, the Trump administration announced non-enforcement of the 2024 STLD definition rules; STLD plans may effectively exceed 4 months without federal penalty in 2026
- **Action:** flagged_for_review — MEDIUM severity, ships with disclosure pending future human edit

### 6. SoonerCare: $22,025 vs $22,176 internal inconsistency (caught in main-session review)
- **Writer used $22,176 in body + table** (OHCA's published value with 5% income disregard)
- **Verifier prompt asked for $22,025** (pure 138% × $15,960 = $22,025)
- **Resolution:** Used $22,176 throughout (matches OHCA's published 2026 income chart; the 5% disregard is explained in the FAQ section). Internal consistency > pure-FPL math.

### 7. Medi-Cal CA: GATE E word-count failure (writer self-validation gap)
- **Writer's fullAnswer.en was 96 words** (16 over the 80-word limit) opening with "In 2026, ..."
- **Writer's STEP 6 GATE E check did NOT fire** despite the 80-word cap being in the prompt — pattern repeated across 4 of 5 articles (CA, OK, home-health, ACA all hit GATE E fail)
- **Verifier correctly caught it on 2/4 articles** (Medi-Cal CA + ACA); missed on 2 (home-health, SoonerCare) due to category labeling drift in verifier output
- **Pattern:** writer treats GATE E as "preferred" rather than "REJECT" despite explicit framing — need writer-side strict word-count check at STEP 6 before save

---

## Patches applied beyond the master-brief 3-patch list (candidates for master-brief upgrade)

These are patterns Track C-prime Q&A load-test discovered:

### 1. Writer-side strict word-count + opener check at STEP 6 (HIGH PRIORITY)
The 80-word cap + Yes/No opener rule on GATE E was in the writer prompt as a "MUST" but 4 of 5 writers shipped fullAnswer over 80 words. Writer-side fix: add a STEP 6 sub-check that programmatically counts fullAnswer words via `node -e "const j=...; const wc=j.fullAnswer.en.split(/\s+/).length; if (wc > 80) console.log('FAIL: '+wc+' words'); else console.log('PASS')"` and rejects if FAIL. Currently the writer's self-validation is prose-level + GATE summary, not arithmetic.

### 2. Verifier-side GATE E enforcement also gappy (MEDIUM)
The verifier prompt's GATE E states ≤80 words + Yes/No opener as a HOLD condition, but 2 of 4 verifier instances correctly fired HOLD while 2 returned `gates.e: "pass"` despite the same violation. Verifier model interpretation drift. Fix: tighten verifier prompt's GATE E section with an explicit code-block check it MUST run, like:

```bash
node -e "const j=JSON.parse(require('fs').readFileSync('<path>','utf8')); const wc=j.fullAnswer.en.split(/\s+/).filter(Boolean).length; const opener=/^(yes|no|it depends|sometimes|depends)/i.test(j.fullAnswer.en); console.log('E:', wc<=80 && opener ? 'PASS' : 'FAIL ('+wc+' words, opener='+opener+')')"
```

### 3. Verifier-side category labeling drift (LOW)
Two verifiers labeled gates with their own taxonomy ("GATE A (year-anchored facts)", "GATE E (Medicaid expansion list)") instead of the verifier-prompt's GATE letter scheme (A/B/C/D/E/F/G/H/H-dispatch/I). Functional gates still ran but the return JSON `gates` object had inconsistent keys. Fix: pin the verifier output schema with an explicit "use EXACTLY these keys" example block.

### 4. Writer-side meta description over-length (LOW)
3 of 5 articles emitted meta descriptions over 160 chars (168/173/189). Validator catches at content-quality.js but should be a writer STEP 6 gate. Same as keyTerms shape regression we caught in procedure load test.

### 5. Verifier turn-budget exhaustion (MEDIUM — Ohio MA-state pattern recurrence)
SoonerCare verifier hit 60-turn limit mid-fix, returning a non-JSON terminal message. Pattern: large detailSection-heavy articles + many em-dash auto-fixes consume turns. Fix: bump verifier maxTurns from 50 → 80 for QA template, OR enforce GATE D em-dash auto-fix as ONE batched Edit call with `replace_all: true` instead of N narrow edits.

---

## 5-line summary of shipped Q&As

| Slug | Subtype | Words | FAQs | Status | Notable |
|---|---|---|---|---|---|
| does-medicare-cover-hearing-aids | coverage | 4,134 | 8 | ships | analyzer CTA; 5 alternatives (MA, VA, Medicaid, Costco, state); 98% MA hearing benefit 2026 |
| does-aca-cover-preexisting-conditions | coverage | 3,883 | 8 | ships | 42 USC §300gg-3; Title I PPACA; 10 EHBs; STLD non-compliance |
| does-medicaid-cover-home-health-care | coverage | 4,752 | 8 | ships | 42 CFR 440.70 mandatory; 47 states HCBS waivers; homebound distinction; 12M dual-eligibles |
| do-i-qualify-for-medi-cal-california | state-eligibility | 4,342 | 8 | ships | **Subtype dispatch test PASSED**; 9-row table; Medi-Cal brand throughout; 138% FPL = $22,025 hh-1 |
| do-i-qualify-for-soonercare-oklahoma | state-eligibility | 4,231 | 8 | ships | SQ 802 + July 2021 expansion; OHCA 5% disregard ($22,176 hh-1); ACA cliff 2026 |

---

## Files changed

**clawd-workspace:**
- `.claude/agents/coveredusa-qa-writer.md` (full rewrite, ~7,500 words)
- `.claude/agents/coveredusa-qa-writer.bak.md` (preserved old, ~1,300 words)
- `.claude/agents/coveredusa-qa-verifier.md` (full rewrite, ~7,800 words)
- `.claude/agents/coveredusa-qa-verifier.bak.md` (preserved old, ~1,500 words)

**covered-usa:**
- 5 new JSONs in `content/data/qa/{does-medicare-cover-hearing-aids,does-aca-cover-preexisting-conditions,does-medicaid-cover-home-health-care,do-i-qualify-for-medi-cal-california,do-i-qualify-for-soonercare-oklahoma}.json`
- `src/lib/qa.ts` extended with optional fields (QASubtype, HouseholdSizeRow, HouseholdSizeTable, HowToApply + QA top-level optional fields subtype/stateBrand/householdSizeTable/howToApply/topicCluster/keyTerms/isLighthouse/isDeprecated)
- `content/fanout/analysis/c-qa-requirements-matrix.md` (Phase 1 deliverable)
- `content/fanout/analysis/c-qa-phase4-results.md` (this file)

---

*Validation: `node scripts/validate-qa.js` returns 0 bad, 0 total issues across all 5 Track C-prime test articles.*
