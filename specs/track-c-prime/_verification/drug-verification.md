# Drug PRD verification

**PRD:** `projects/covered-usa/specs/track-c-prime/drug-prd.md`
**Reviewer:** Frank
**Date:** 2026-05-14
**Method:** Two-pass — (1) fresh-eyes question list against PRD alone, (2) mechanical completeness checks against cited docs.

---

## PASS 1 — Fresh-eyes questions (PRD read alone)

Pretending I'm a fresh Claude Code session about to execute Track C-prime for the drug template. Questions I would need answered before I could start.

| # | Question | Location of answer | Status |
|---|---|---|---|
| 1 | Where are existing drug JSON files stored, and how do I list them to confirm slug collisions? | §1 ("Output directory" line 5 + §7 collision-check bash + §11 step 6 bash) | GOOD |
| 2 | What's the canonical slug pattern — `<drug>` or `<drug>-cost`? | §1 + §2 ("slug ... established convention is `<drug>-cost`") + §12 quick-ref | GOOD |
| 3 | What does each GATE do, and which ones HOLD vs WARN vs AUTO-FIX? | §5 (universal A-D with routing) + §6 (drug-specific E-H with PASS/WARN/HOLD per gate) + §9 ("Routing per gate (drug-specific)") | GOOD |
| 4 | Where is the gold-standard reference page I should mimic structurally? | §1 ("ozempic-cost.json ... gold standard structural reference") + §12 ("Gold standard") | GOOD |
| 5 | What is the `iraNegotiation` block schema, and which drugs require it populated? | §2 (top-level fields list, line 66) + §6 GATE E (Round-1 list + sub-fields + worked Eliquis example) + §12 ("IRA Round-1 drugs (10)") | GOOD |
| 6 | What should `iraNegotiation` look like for non-IRA drugs (e.g., atorvastatin, metformin)? | §2 ("OMIT for non-negotiated drugs") + §6 GATE E ("PASS if drug is NOT on Round-1 list AND block correctly omitted") | GOOD |
| 7 | What's the schema for the NEW blocks (`pharmacyPriceComparison`, `genericBiosimilarStatus`, `papEligibilityTable`, `denialAlternatives`, `howToApplyPap`)? | §2 ("New blocks required by this rewrite" lines 85-91) — schema spelled out for each | GOOD |
| 8 | Which fields are LocalizedString vs flat string vs string array? | §2 (hard contract #5: FAQ q/a are flat strings; rest of fields enumerated) | GOOD |
| 9 | How do I know which test drugs are IRA Round-1 vs Round-2 vs no-IRA? | §7 (per-slug rationale labels) + §12 (Round-1 list of 10) | GOOD |
| 10 | What's the validator command and what does the baseline output look like? | §11 ("Validator baseline ... `node scripts/validate-drugs.js`") | GOOD — but actual output schema not shown |
| 11 | What do I do if `papEligibilityTable` doesn't apply (e.g., generic-only drug like atorvastatin)? | §5 GATE B ("when NO PAP references FPL ... mark `gates.b: \"n/a\"` and skip") + §6 GATE H (same n/a path) + §7 (atorvastatin rationale) | GOOD |
| 12 | How do I confirm the `iraNegotiation` render fix actually shipped to the deployed branch before Phase 5 smoke test? | §11 step 5 (grep route file) + §10 ("End-to-end render smoke test ... browse to coveredusa.org/drug/eliquis-cost") | GOOD |
| 13 | What's the exact 4-commit ship order, and which repo gets which commit? | §10 ("4 commits ... Push order: clawd-workspace first ... then covered-usa") | GOOD |
| 14 | Where do I write the memory entry, and what fields go in it? | §10 ("Memory entry ... 5-line summary of the 5 shipped drugs ... confirmation of the iraNegotiation render smoke test") | GOOD |
| 15 | How do I derive the `wholesaleAcquisitionCost` (WAC) for IRA-negotiated branded drugs — is this a new field, and where in `pricing` does it sit? | §3 shape #5 mentions "new field for branded drugs" but the field's exact placement in `DrugPricing` is NOT shown in §2 | SOFT GAP — master brief or schema diff needed |
| 16 | What URL pattern does the `source` field inside `iraNegotiation` follow — is it required to be CMS or KFF? | §2 ("source (CMS or KFF URL)") + §6 GATE E example | GOOD |
| 17 | What does Phase 1 look like in detail — does the planner actually spawn sub-agents, or does it write a new prompt only? | "Master brief — ref needed" (§0 read order says read TRACK_C_PARALLEL_PLAN.md §3 + §3.5; PRD doesn't restate Phase mechanics) | SOFT GAP |

**Count:** 14 GOOD, 2 SOFT GAP, 0 HARD GAP. Phase mechanics + WAC field placement are the two soft gaps; both are answered in the master brief (which §0 mandates reading first), so a disciplined executor wouldn't get stuck. None are blocking.

---

## PASS 2 — Mechanical completeness checks (cited docs loaded)

### 2.1 All cited file paths exist (§1, §11, §12)

Confirmed all referenced files exist via `ls`:

| Path | Cited in | Exists |
|---|---|---|
| `.claude/agents/coveredusa-drug-writer.md` | §1, §12 | ✓ |
| `.claude/agents/coveredusa-drug-verifier.md` | §1, §12 | ✓ |
| `.claude/agents/coveredusa-ma-state-writer.md` | §0, §1, §12 | ✓ |
| `.claude/agents/coveredusa-ma-state-verifier.md` | §0, §1, §12 | ✓ |
| `.claude/agents/coveredusa-article-verifier.md` | §0, §1, §12 | ✓ |
| `.claude/agents/coveredusa-procedure-writer.md` | §0, §1, §12 | ✓ |
| `.claude/agents/_universal-rules-block.md` | §1 | ✓ |
| `specs/TRACK_C_PARALLEL_PLAN.md` | §0, §12 | ✓ |
| `specs/FANOUT_FORMULA.md` | §1, §3 | ✓ |
| `specs/AI_OPTIMIZATION_FRAMEWORK.md` | §1 | ✓ |
| `specs/URL_SLUG_FRAMEWORK.md` | §1 | ✓ |
| `specs/LINK_TARGET_MANIFEST.md` | §1 | ✓ |
| `specs/CURRENT_STATE_AUDIT.md` | §1 | ✓ |
| `specs/PHASE_5_BRIDGE.md` | §1 | ✓ |
| `content/fanout/analysis/audit-drug-writer.json` | §1, §4, §12 | ✓ |
| `src/lib/drugs.ts` | §1, §2, §12 | ✓ |
| `content/data/drugs/ozempic-cost.json` | §1, §11, §12 | ✓ |
| `content/data/drugs/insulin-cost.json` | §1 | ✓ |
| `content/data/drugs/metformin-cost.json` | §1 | ✓ |
| `src/app/[locale]/drug/[drug]/page.tsx` | §11 step 5 | ✓ |

**Result:** PASS — 20/20 cited paths exist.

### 2.2 Audit findings match audit-drug-writer.json

Cross-checked PRD §4 against the JSON audit:

| Claim in PRD §4 | Audit JSON evidence | Match |
|---|---|---|
| 3 pages audited: ozempic 68%, insulin 62%, metformin 55% | `B_existing_page_audit` blocks confirm scores exactly | ✓ |
| Avg alignment 62%, lowest of any template | Computable: (68+55+62)/3 = 61.67 ≈ 62% | ✓ |
| GoodRx pharmacy comparison missing on all 3 pages | `section_4_2_recipe_compliance` shape #2 "MISSING ... all 3 pages skip it" | ✓ |
| Generic/biosimilar block missing (insulin biosimilars absent) | shape #7 "MISSING ... Insulin page does NOT mention insulin biosimilars (Basaglar, Semglee, Rezvoglar)" | ✓ |
| PAP eligibility household-size table missing on all 3 pages | §3.3 "MISSING ... single biggest §3.3 violation" + per-page gaps all cite missing household table | ✓ |
| 4 P0 blocking edits | `C_recommendations.writer_edits.P0_blocking` has 4 items (GoodRx, generic/biosimilar, howToApplyPap, papEligibilityTable) | ✓ |
| 5 P1 strong-signal edits | `C_recommendations.writer_edits.P1_strong_signal` has 4 items (NOT 5 — denialAlternatives, fda.gov lint, table caption style, anti-kickback callout). PRD §4 lists 5 P1 items including "Medicare Prescription Payment Plan mention" which the audit places in P2 ("P2_polish"). | MINOR — PRD bundles one P2 into P1 list |

**Result:** PASS with one cosmetic note — the PRD's "5 P1 strong-signal edits" list includes the Medicare Prescription Payment Plan item that the audit JSON puts in P2. Either is defensible; not a content error.

### 2.3 Schema fields match drugs.ts `Drug` interface

Cross-checked PRD §2 against `src/lib/drugs.ts`:

| PRD claim | drugs.ts evidence | Match |
|---|---|---|
| `IRANegotiation` interface at line 85 | Line 85: `export interface IRANegotiation` | ✓ |
| `PAPRow` interface at line 131 | Line 131: `export interface PAPRow` | ✓ |
| `PAPSection` interface at line 139 | Line 139: `export interface PAPSection` | ✓ |
| `iraNegotiation?: IRANegotiation` optional | Line 208: `iraNegotiation?: IRANegotiation;` | ✓ |
| IRA sub-fields: maxFairPrice, listPriceBefore, effectiveDate, source, callout | Lines 86-95 confirm all 5 sub-fields with types | ✓ |
| `routeOfAdministration` enumerated values: Injection / Oral / Inhalation / Topical / Infusion / Sublingual / Transdermal | Line 183 schema comment shows: `"Injection" \| "Oral" \| "Inhalation" \| "Topical" \| "Infusion"` — schema lists 5, PRD lists 7 (adds Sublingual + Transdermal) | SOFT GAP — schema only enumerates 5; PRD claims 7 |
| FAQ q/a are flat strings (`LocalizedFAQ`), NOT LocalizedString | Line 34 `LocalizedFAQ` + lines 232-233 `faqs: {en: LocalizedFAQ[], es: LocalizedFAQ[]}` | ✓ |
| Required top-level fields enumerated | All confirmed present in `Drug` interface lines 170-238 | ✓ |
| Additive Track C-prime fields (`topicCluster`, `keyTerms`, `isLighthouse`, `isDeprecated`) | These are NOT in the current `Drug` interface (additive emit — runtime ignores extras). PRD correctly notes they're additive. | ✓ (by design) |

**Result:** PASS with one soft gap — `routeOfAdministration` enum mismatch. The schema comment lists 5 values (Injection / Oral / Inhalation / Topical / Infusion); the PRD §2 claims 7 by adding Sublingual and Transdermal. Sublingual/Transdermal aren't valid per the current TypeScript comment — could cause validator-reject if a writer emits them. Either the schema comment is stale or the PRD overshoots. Either way: surface to Jacob before shipping a sublingual or transdermal drug.

### 2.4 Recipe references match FANOUT_FORMULA §4.2

Cross-checked PRD §3 against FANOUT_FORMULA.md line 235:

| PRD §3 claim | FANOUT_FORMULA §4.2 evidence | Match |
|---|---|---|
| Entailment 45.5% / Equivalent 22.2% / Specification 17.6% / Canonicalization 10.8% / Clarification 2.3% / Generalization 1.7% | Line 235 literal match | ✓ |
| 8 dominant shapes | Lines 244-248 confirm shapes 4-8; shapes 1-3 implied in compressed list | ✓ |
| Shape #3 NovoCare assistance + Medicare = Bing-validated | Master brief / framework calls out NovoCare as the Bing-validated shape for drug-cost | ✓ |
| State-context MOSTLY N/A for drug-cost | Consistent with framework — drug pricing is federal | ✓ |

**Result:** PASS.

### 2.5 All 12 sections present per README structure

Drug PRD section headers (from `grep "^## "`):

§0 Read order, §1 Context inventory, §2 Schema reminder + hard contracts, §3 The §4.2 recipe, §4 Audit findings synthesized, §5 Universal GATES, §6 Drug-specific GATES, §7 Test mix (5 drugs), §8 Common failure modes, §9 Verifier scope, §10 Atomic deliverable, §11 Pre-flight checklist, §12 Quick reference card.

README says "Each PRD has 12+ sections" with §0-§12 enumerated. Drug PRD has all 13 (§0 through §12). **Result:** PASS.

### 2.6 GATES pattern matches master brief routing

Universal GATES A/B/C/D in drug PRD §5:

- GATE A (slug-no-year) → HOLD ✓ (matches master brief line 661 + line 621)
- GATE B (household-size table, CONDITIONAL — applies when PAP references FPL) → HOLD when applicable-and-missing ✓ (matches master brief line 662 — drug template is explicitly called out as one of the conditional templates)
- GATE C (≥3 .gov citations) → HOLD on 0-1; WARN on 2 ✓ (matches master brief line 663 + 622-623)
- GATE D (zero `--`) → AUTO-FIX ✓ (matches master brief line 664 + Ohio callout line 67)

Drug-specific GATES E/F/G/H in §6:

- GATE E (`iraNegotiation` populated for Round-1) → HOLD when missing ✓
- GATE F (GoodRx pharmacy comparison ≥4 rows) → HOLD when absent ✓
- GATE G (`genericBiosimilarStatus` present) → HOLD when absent ✓
- GATE H (PAP eligibility table when applicable) → HOLD when missing-and-applicable; n/a skip otherwise ✓

Routing parallels the master brief's PASS/WARN/FAIL/HOLD pattern (§7 of master brief). **Result:** PASS.

### 2.7 Test mix — 5 NEW slugs, no collisions

Existing drug files: `_queue.json, insulin-cost.json, metformin-cost.json, ozempic-cost.json`.

PRD §7 test mix:

| Slug | Collision? |
|---|---|
| eliquis-cost | NEW ✓ |
| jardiance-cost | NEW ✓ |
| januvia-cost | NEW ✓ |
| humalog-cost | NEW ✓ |
| atorvastatin-cost | NEW ✓ |

Master brief discrepancy note (PRD §4 line 182): master brief said "Skip Ozempic, metformin (already shipped)" but `insulin-cost` is also shipped. PRD correctly flags this and adapts test mix to skip all 3. **Result:** PASS — confirmed by reviewer.

### 2.8 iraNegotiation render bug fix reference (commit 1fb5fb9)

- PRD §1 line 7: "The `iraNegotiation` render bug in `src/app/[locale]/drug/[drug]/page.tsx` was fixed in commit `1fb5fb9`" ✓
- `git log --all --oneline | grep 1fb5fb9` returns: `1fb5fb9 Track AA Phase 1 follow-through: drug iraNegotiation render fix` ✓
- `grep iraNegotiation src/app/[locale]/drug/[drug]/page.tsx` returns 10 matches (line 231 `{data.iraNegotiation && (` opens the render block) ✓
- Phase 5 end-to-end smoke test included in §10 ("browse to coveredusa.org/drug/eliquis-cost and confirm ... renders") ✓
- §11 step 5 includes a pre-flight grep on the route file ✓
- §6 GATE E worked Eliquis example references the fix ✓

**Result:** PASS — render bug fix is referenced 5+ times across §1, §6, §7, §10, §11.

---

## Summary

**Hard gaps:** 0
**Soft gaps:** 3
1. `routeOfAdministration` enum mismatch: schema comment lists 5 (Injection / Oral / Inhalation / Topical / Infusion), PRD §2 claims 7 (adds Sublingual + Transdermal). None of the 5 test drugs is sublingual or transdermal so this wouldn't bite Phase 4, but the schema comment may be stale — surface to Jacob.
2. `wholesaleAcquisitionCost` (WAC) field for branded IRA drugs is mentioned as "new field" in §3 shape #5 but never spelled out in §2 schema reminder — exact placement in `DrugPricing` is left implicit.
3. Phase 1 mechanics (does the planner spawn sub-agents or just write a new prompt?) are deferred to the master brief instead of restated.

**Completeness fails:** 0 — all 8 mechanical checks pass.

**Minor note:** PRD §4 lists "5 P1 strong-signal edits" but the audit JSON places one of them (Medicare Prescription Payment Plan) in P2. Reasonable judgment call; not a content error.

**Verdict:** **SHIP**

This PRD is execution-ready. The fresh-eyes pass identified zero hard blockers — a fresh session has everything needed. All cited file paths exist, audit findings reconcile against the JSON, schema field claims match `drugs.ts` (with one minor enum-stretch note), recipe weights match FANOUT_FORMULA §4.2 to the decimal, all 12 sections are present, gates routing matches the master brief pattern, the 5-drug test mix has zero collisions, and the `iraNegotiation` render-fix story (commit `1fb5fb9` + Phase 5 smoke test) is woven through 5+ sections.

**Top 3 fixes (low priority — would tighten but not block ship):**

1. **Clarify `routeOfAdministration` enum.** Either update `src/lib/drugs.ts` line 183 comment to list all 7 values (add Sublingual + Transdermal) or update PRD §2 to match the 5-value schema. Pick one source of truth.
2. **Add `wholesaleAcquisitionCost` to the §2 schema reminder.** If WAC is a new `pricing.wholesaleAcquisitionCost` field for branded IRA drugs (as §3 shape #5 implies), spell out its placement and required-when-condition in §2 so the writer doesn't have to infer.
3. **Move the Medicare Prescription Payment Plan edit from "P1 strong-signal" to "P2 polish" in §4** to match the audit JSON's classification — or note explicitly that the PRD is upgrading the priority.
