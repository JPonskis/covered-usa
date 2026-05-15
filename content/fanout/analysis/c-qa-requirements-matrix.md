# Track C-prime: Q&A Writer/Verifier Requirements Matrix

**Phase 1 deliverable.** Synthesized from `qa-prd.md`, `TRACK_C_PARALLEL_PLAN.md`, `audit-qa-writer.json`, `FANOUT_FORMULA.md` §3 + §4.3 + §4.4, and the 5 universal rules in `_universal-rules-block.md`.

**Date:** 2026-05-15
**Author:** main session (Track C-prime executor)

---

## 1. Hard contracts (from schema + PRD §2)

| # | Contract | Source | Severity |
|---|---|---|---|
| 1 | JSON return shape from STEP 8 is `{slug, status, ...}` parseable | PRD §2.1 | CRITICAL |
| 2 | Atomic write pattern: `<slug>.tmp.json` → validate → rename | PRD §2.2 | CRITICAL |
| 3 | `## STEP N` numbered headings preserved (cron parses) | PRD §2.3 | CRITICAL |
| 4 | Schema interface conformance; extra fields silently ignored | PRD §2.4 | CRITICAL |
| 5 | FAQ question/answer are flat strings, NOT LocalizedString | PRD §2.5 + qa.ts | CRITICAL |
| 6 | Spanish parity for every LocalizedString | PRD §2.6 | HIGH |
| 7 | No em-dash `—`, no en-dash `–`, no `--` anywhere | PRD §2.7 | HIGH (auto-fix) |
| 8 | `pageType` and `subtype` MUST be consistent | PRD §2.8 | HIGH |
| 9 | Slug NEVER contains a year | UNIVERSAL GATE A | HIGH |
| 10 | Path portability: `$HOME/clawd` not hardcoded user paths | Master brief Patch 1 | HIGH |

---

## 2. Subtype dispatch (THE unique architectural mechanic)

**Per PRD §3.5.** Writer's STEP 0a does this order:

1. Read `subtype` from INPUTS. If present and ∈ {coverage, state-eligibility}, use it. Skip to step 4.
2. If missing, infer from `topicCluster`:
   - `medicare-*` / `aca-*` / `medicaid-coverage-*` → coverage
   - `medicaid-income-*` / `medicaid-eligibility-*` → state-eligibility
3. If still ambiguous, check SLUG + CATEGORY + QUESTION text:
   - SLUG matches `medicaid-<state>` / `qualify-for-<state>-medicaid` / `apply-for-medicaid-in-<state>` → state-eligibility
   - SLUG matches 19-state brand slugs (`medi-cal`, `soonercare`, `ahcccs`, `mncare`, `badgercare`, `tenncare`, `arhome`, `husky`, `apple-health`, `nj-familycare`, `masshealth`, `hip`, `ohp`, `chp-plus`, `mainecare`, `med-quest`, `allkids`, `kynect`) → state-eligibility
   - CATEGORY = Medicaid AND QUESTION contains "qualify" / "apply" / "do I get" / "income limit" → state-eligibility
   - Otherwise → coverage (default)
4. If still ambiguous after all 3 rounds → REJECT. Don't guess.
5. Persist resolved subtype + emit in JSON output as `subtype` field.

**Why ONE writer not two (audit §D):** 70% of writer logic is shared; 30% diverges; subtype is deterministically detectable; forking doubles maintenance.

---

## 3. §4.3 coverage subtype requirements

**Required H2 set:**
- Direct answer (≤ 80 words; Yes/No/It depends + qualifier — GATE E)
- What Original Medicare covers
- What Medicare Advantage may add (2026)
- Cost without coverage (2026)
- Standalone supplemental options
- Eligibility criteria
- How to find a plan that covers [thing]
- (For No/It-depends) FAQ on alternatives — GATE G-cov

**Required FAQ topics (6-8):**
1. Does Original Medicare cover [thing]?
2. Does Medicare Advantage cover [thing]?
3. What is the cost without coverage?
4. What standalone insurance options exist?
5. Are there state-specific programs for [thing]?
6. When does Medicare cover [thing] medically necessary?
7. (No/It-depends) What are alternatives if Medicare doesn't cover?
8. (Where applicable) Difference between [thing] and [adjacent thing]?

**Required vocabulary (9 terms):**
- Original Medicare / Medicare Part A / Part B / Part D / Medicare Advantage / Medigap / ACA-compliant / preexisting condition / essential health benefits

**Required `coverageBreakdown`:** 3-4 rows comparing Original Medicare / Medicare Advantage / Medigap / Standalone supplemental — year-anchored caption.

---

## 4. §4.4 state-eligibility subtype requirements

**Required H2 set:**
- Direct answer (≤ 80 words — GATE E)
- [Brand] income limits by household size (2026) — must include 9-row table (GATE F-elig)
- How to apply for [Brand] (numberedSteps + govStartingUrl)
- Documents needed to apply
- Is [state] a Medicaid expansion state? (expansion status + ACA gap context)
- Common reasons applications get denied
- How to appeal a denial
- [Brand] context (what covers, who runs, when started)

**Required FAQ topics (6-8):**
1. What is the income limit for a family of 4 in [state] (2026)?
2. What counts as income for [Brand]?
3. What documents do I need to apply?
4. What happens if I'm denied?
5. Can I work and still get [Brand]?
6. Is [state] a Medicaid expansion state?
7. How long does the application process take?
8. Difference between [Brand] and Medicare?

**Required vocabulary (8 terms):**
- The state-program brand (Medi-Cal, SoonerCare, etc.)
- Medicaid expansion / ACA gap / 138% FPL / Federal Poverty Level / family size / household composition / MAGI

**Required `householdSizeTable`:** 9 data rows (sizes 1-8 + each-additional) + year-tagged caption with brand.

**Required `howToApply`:** `{numberedSteps[3-7], govStartingUrl, documentsNeeded[4-8], commonDenialReasons[3-5], deadline?}`.

**Required `stateBrand`:** canonical brand string used throughout.

---

## 5. 2026 anchor facts (RULE 4 + PRD §3)

| Fact | Value | Notes |
|---|---|---|
| Part B deductible | $283 | NOT $257 |
| Part B premium | $202.90/mo | standard |
| Part A inpatient deductible | $1,736 | |
| Part D OOP cap | $2,100 | |
| Part D insulin cap | $35/mo | per IRA 2022 |
| IRA signed | Aug 16, 2022 | NOT 2023 |
| ACA subsidy cliff | RETURNED for 2026 | enhanced PTCs expired Jan 1, 2026 |
| FPL hh-of-1 | $15,960 | 48 states |
| FPL hh-of-4 | $33,000 | 48 states |
| ACA marketplace 2026 | uses 2025 FPL | $15,650 hh-of-1 |
| Expansion states | 40 + DC | NC Dec 2023, SD July 2023 |
| Non-expansion (10) | AL, FL, GA, KS, MS, SC, TN, TX, WI, WY | |
| Dual-eligibles | 12M Americans | |

---

## 6. 8 GATES (universal + Q&A-specific, subtype-aware)

| GATE | Scope | Coverage subtype | State-eligibility subtype | Routing |
|---|---|---|---|---|
| **A** | Slug-no-year | UNIVERSAL | UNIVERSAL | HOLD on year |
| **B** | 9-row household-size table | N/A | REQUIRED | HOLD if absent / wrong count (state-elig only) |
| **C** | ≥3 inline .gov / .edu / kff.org | UNIVERSAL | UNIVERSAL | HOLD on 0-1, WARN on 2 |
| **D** | Zero `--` em/en-dash | UNIVERSAL | UNIVERSAL | AUTO-FIX |
| **E** | Direct-answer ≤80 words + Yes/No/It-depends | UNIVERSAL | UNIVERSAL | HOLD on absent / >80 words / no keyword |
| **F-cov** | `coverageBreakdown` with ≥3 rows + year caption | REQUIRED | N/A | HOLD if absent |
| **F-elig** | 9-row household-size income table + brand + year | N/A | REQUIRED | HOLD if absent / wrong count |
| **G-cov** | "Alternatives" section when answer is No / It depends | REQUIRED if applicable | N/A | HOLD on No/It-depends without alternatives |
| **G-elig** | State-named brand used throughout 5 surfaces | N/A | REQUIRED | HOLD on full absence; ship+LOW if 1-2 surfaces |
| **H** | Required vocabulary present (9 cov / 8 elig terms) | UNIVERSAL (by subtype) | UNIVERSAL (by subtype) | Ship + MEDIUM flag if 3+ missing |
| **H-dispatch** | H2 set matches declared subtype | UNIVERSAL | UNIVERSAL | HOLD on mismatch |
| **I** | pageType ↔ subtype consistency | UNIVERSAL | UNIVERSAL | HOLD on mismatch |

---

## 7. Schema extension (PRD §2 Path 1 — preferred)

Extend `src/lib/qa.ts` with optional fields (renderer-side updates land in Track E):

```typescript
export interface HouseholdSizeRow {
  size: string; // "1" | "2" | ... | "8" | "Each additional"
  incomeLimit: LocalizedString;
  notes?: LocalizedString;
}

export interface HouseholdSizeTable {
  caption: LocalizedString;
  year: number;
  rows: HouseholdSizeRow[]; // exactly 9
  footnote?: LocalizedString;
  source: string;
}

export interface HowToApply {
  numberedSteps: LocalizedString[]; // 3-7
  govStartingUrl: string;
  documentsNeeded: LocalizedString[]; // 4-8
  commonDenialReasons: LocalizedString[]; // 3-5
  deadline?: LocalizedString;
}

export type QASubtype = 'coverage' | 'state-eligibility';
```

Add to `QA` interface (all optional):
- `subtype?: QASubtype`
- `topicCluster?: string`
- `keyTerms?: { en: string[]; es: string[] }`
- `isLighthouse?: boolean`
- `isDeprecated?: boolean`
- `stateBrand?: string`
- `householdSizeTable?: HouseholdSizeTable`
- `howToApply?: HowToApply`

Renderer falls back to embedding in `detailSections` until Track E renders the dedicated fields.

---

## 8. 19-state brand list (RULE 1 anchor)

| State | Brand | Type |
|---|---|---|
| California | Medi-Cal | Medicaid |
| California | CalFresh | SNAP |
| Arizona | AHCCCS | Medicaid |
| Minnesota | MNsure | Marketplace |
| Oklahoma | SoonerCare | Medicaid |
| Maine | MaineCare | Medicaid |
| Wisconsin | BadgerCare | Medicaid |
| Illinois | AllKids | CHIP |
| Tennessee | TennCare | Medicaid |
| Arkansas | ARHOME | Medicaid |
| New Jersey | NJ FamilyCare | Medicaid |
| Massachusetts | MassHealth | Medicaid |
| Indiana | HIP (Healthy Indiana Plan) | Medicaid |
| Oregon | OHP (Oregon Health Plan) | Medicaid |
| Colorado | CHP+ | CHIP |
| Kentucky | kynect | Marketplace |
| Connecticut | HUSKY Health | Medicaid |
| Hawaii | Med-QUEST | Medicaid |
| Washington | Apple Health | Medicaid |

---

## 9. Verifier scope (Phase 4.5)

**Non-negotiable patches per master brief Phase 4.5:**
1. Path portability: `/Users/frankthebot/...` → `$HOME/clawd/...`
2. Dual-purpose framing in YOUR TASK: numeric fact-check with auto-fix + structural GATE detection (detect-only)
3. STEP 1C: structural GATE detection — READS resolved `subtype` from JSON, branches gate evaluation

**3 mandatory patches from load-test:**
- GATE F-elig count strictness (writer-side): strict count `if (subtype === "state-eligibility" && rows.length !== 9) REJECT`
- `keyTerms` shape: object `{en: [...], es: [...]}` NOT flat array
- GATE D AUTO-FIX MANDATORY framing on verifier side (Ohio MA-state failure mode callout)

**Preserve from existing verifier:**
- Case 1-bis force-flag (fullAnswer drift never auto-edited)
- Internal-consistency pre-check (STEP 1A)
- Categories A-I from existing verifier

**Add Category J (new):** subtype-dispatch sanity — read `subtype`, infer if missing, verify H2 set matches.

**Routing per gate (subtype-aware):**
- GATE A FAIL → HOLD
- GATE B (state-eligibility only) FAIL → HOLD
- GATE B (coverage) → N/A (skip)
- GATE C FAIL (0-1 .gov) → HOLD; WARN (2) → ship + LOW flag
- GATE D FAIL → AUTO-FIX
- GATE E FAIL → HOLD
- GATE F-cov FAIL → HOLD
- GATE F-elig FAIL → HOLD
- GATE G-cov FAIL → HOLD
- GATE G-elig FAIL (full absence) → HOLD; (1-2 surfaces) → ship + LOW
- GATE H FAIL (3+ vocab missing) → ship + MEDIUM
- GATE H-dispatch FAIL → HOLD
- GATE I FAIL → HOLD

---

## 10. 5 Phase-4 test slugs

| Slug | Question | Subtype | Why |
|---|---|---|---|
| `does-medicare-cover-hearing-aids` | Does Medicare cover hearing aids in 2026? | coverage | Tests GATE G-cov (No answer + alternatives) |
| `does-aca-cover-preexisting-conditions` | Does ACA marketplace insurance cover preexisting conditions? | coverage | Tests Direct-answer entailment + legal citation rigor |
| `does-medicaid-cover-home-health-care` | Does Medicaid cover home health care? | coverage | Federal/state overlay; borderline cov vs state-elig |
| `do-i-qualify-for-medi-cal-california` | Do I qualify for Medi-Cal in California 2026? | state-eligibility | Full §4.4 recipe: 9-row table, brand, application, expansion (CA = expansion) |
| `do-i-qualify-for-soonercare-oklahoma` | Do I qualify for SoonerCare in Oklahoma 2026? | state-eligibility | OK = NON-expansion state — tests ACA-gap context |

**Dispatch test:** One writer call with `subtype` omitted (only `topicCluster: medicaid-income-california`) for medi-cal — verify STEP 0a infers correctly.

**Pass criteria:** 5/5 strict validators + 4/5 ≥80% rubric + subtype dispatch verified on all 5.

---

## 11. Atomic deliverable (Phase 5)

1. **Commit 1 (clawd-workspace):** `.bak` move + new qa-writer prompt
2. **Commit 2 (covered-usa):** 5 test articles + schema extension to `src/lib/qa.ts`
3. **Commit 3 (covered-usa):** Requirements matrix + Phase 4 results in `content/fanout/analysis/c-qa-*.md`
4. **Commit 4 (clawd-workspace):** `.bak` move + new qa-verifier prompt

**Push order:** clawd-workspace first, then covered-usa.

**Memory entry:** `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_track_c_qa_writer_shipped.md`.

---

## 12. Conflicts surfaced + resolved

| # | Conflict | Resolution |
|---|---|---|
| 1 | PRD says "8 GATES" but lists 12 (A, B, C, D, E, F-cov, F-elig, G-cov, G-elig, H, H-dispatch, I) | Treat F-cov/F-elig as ONE subtype-branched gate F. Same for G. So gate count is 8 conceptually (A,B,C,D,E,F,G,H+H-dispatch,I). Number checks reference the 8 named gates in §6 above. |
| 2 | Audit recommends `commonDenialReasons` as separate top-level field; PRD §2 path 1 nests it under `howToApply` | Nest under `howToApply.commonDenialReasons` (matches procedure-writer pattern of nesting under `goodFaithEstimate`). |
| 3 | PRD §3.5 says "REJECT if subtype ambiguous"; current writer §STEP 0 has no error path | Add explicit return-error JSON `{slug, status: "error", error: "Subtype dispatch failed: ..."}`. |
| 4 | Audit says "9-row household-size table"; FANOUT §3 RULE 2 also says 9 rows | Reaffirm: exactly 9 rows (sizes 1, 2, 3, 4, 5, 6, 7, 8 + "each additional"). Sub-counts are non-negotiable. |
| 5 | PRD says "minimum 2 detailSections" (existing schema); recipe requires 4+ for state-elig | State-eligibility subtype MUST emit ≥6 detailSections to cover all required H2s. Coverage subtype MUST emit ≥4. Enforce as STEP 6 sub-check. |
| 6 | Audit says `ctaTarget` should be analyzer if dollar amounts mentioned; PRD §4 WE-4 says same | Apply uniformly via STRICT heuristic with explicit override paragraph. |
| 7 | Schema path: Path 1 (extend qa.ts) vs Path 2 (embed in detailSections) | Take Path 1 (preferred per PRD §2). Renderer gracefully degrades — fields ship but only render if template upgraded in Track E. |

---

*End of requirements matrix. Total requirements: 76 across 12 categories. Conflicts: 7 resolved.*
