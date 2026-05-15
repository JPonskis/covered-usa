# Q&A PRD Verification

**Target:** `projects/covered-usa/specs/track-c-prime/qa-prd.md`
**Verified:** 2026-05-14
**Verifier mode:** Two-pass (fresh-eyes FIRST, then mechanical completeness)
**Unique complexity:** subtype dispatch (coverage vs state-eligibility) — the only Track C-prime template with branching architecture

---

## PASS 1 — Fresh-eyes (read PRD ALONE)

I read the PRD end-to-end as if I were a fresh session about to execute Track C-prime for Q&A. The following are the questions I'd surface to Jacob before I felt safe to spawn writer/verifier agents. Each marked GOOD (clearly answered), SOFT GAP (answered but ambiguous), or HARD GAP (missing — would force escalation).

### 1. STEP 0a — the 5-step fallback chain
**Q:** Walking into STEP 0a cold, is the dispatch order unambiguous? Can I implement it deterministically with no judgment calls?
**Verdict:** §3.5 (GOOD). Five steps are numbered and ordered: (1) read explicit `subtype` input → (2) infer from `topicCluster` regex → (3) infer from SLUG / CATEGORY / QUESTION text → (4) REJECT if still ambiguous → (5) persist resolved value + emit in JSON. The reject path returns explicit error JSON. This is the cleanest dispatch spec I'd expect.

### 2. topicCluster inference — pattern coverage
**Q:** Step 2 of dispatch says `medicare-*` / `aca-*` / `medicaid-coverage-*` → coverage; `medicaid-income-*` / `medicaid-eligibility-*` → state-eligibility. What if topicCluster is `chip-coverage`, `medigap-*`, or a kebab string that matches neither?
**Verdict:** §3.5 step 3 (GOOD — handled by fall-through). The PRD explicitly says "If `subtype` is still ambiguous (e.g., `topicCluster` is missing or matches neither pattern), check SLUG + CATEGORY + QUESTION text." So unmatched clusters automatically degrade to step 3. Not a gap.

### 3. SLUG regex / brand list — completeness
**Q:** The SLUG regex in step 3 enumerates 18 brand slugs (medi-cal, soonercare, ahcccs, mncare, badgercare, tenncare, arhome, husky, apple-health, nj-familycare, masshealth, hip, ohp, chp-plus, mainecare, med-quest, allkids, kynect). The universal RULE 1 table lists 19 entries (18 distinct programs + CalFresh as SNAP context). Is `calfresh` intentionally excluded from the SLUG regex?
**Verdict:** §3.5 step 3 + §12 (SOFT GAP). CalFresh is a SNAP program; it would never be a Medicaid eligibility Q&A slug. Implicitly correct, but the PRD doesn't explain why. A fresh executor might either add CalFresh to the regex (unnecessary) or wonder if it was an omission. **Suggested fix:** add a one-line note: "CalFresh is SNAP-only, not in Medicaid SLUG regex by design." Minor.

### 4. H2 set for §4.3 coverage
**Q:** What's the exact required H2 set for subtype=coverage? Are all H2s labeled in one place?
**Verdict:** §3 + §3.5 + §6 + §12 (GOOD). §3 (lines 122-129) enumerates 8 H2s for coverage: "Direct answer", "What Original Medicare covers", "What Medicare Advantage may add (2026)", "Cost without coverage (2026)", "Standalone supplemental options", "Eligibility criteria", "How to find a plan that covers [thing]", "FAQ on alternatives" (conditional). This is repeated and crosslinked from §3.5 STEP 3, §6 GATES, and §12 quick reference card.

### 5. H2 set for §4.4 state-eligibility
**Q:** Same question for subtype=state-eligibility.
**Verdict:** §3 (GOOD). §3 (lines 163-171) enumerates 8 H2s: "Direct answer", "[Brand] income limits by household size (2026)", "How to apply for [Brand]", "Documents needed to apply", "Is [state] a Medicaid expansion state?", "Common reasons applications get denied", "How to appeal a denial", "[Brand] context". Brand-name interpolation is explicit (uses `[Brand]` placeholder). Strong.

### 6. GATE B applicability — coverage vs state-eligibility
**Q:** Is it crystal clear that GATE B (9-row household table) is N/A for coverage subtype but REQUIRED for state-eligibility?
**Verdict:** §5 + §9 routing block (GOOD). §5 GATE B explicitly says "CONDITIONAL on subtype: `subtype: coverage` → **N/A.** Mark `gates.b: "n/a"`. Don't require. `subtype: state-eligibility` → **APPLIES, REQUIRED.** 9 data rows". The verifier routing in §9 ALSO restates this: "GATE B (coverage) → N/A; mark gates.b: 'n/a'; skip". Two-place crosslink is good defense against drift.

### 7. GATE F naming — F-cov vs F-elig
**Q:** GATE F splits by subtype. Does the PRD call them both "GATE F" (ambiguous when a verifier report says "GATE F failed") or explicitly distinguish?
**Verdict:** §6 + §9 + §12 (GOOD). The PRD consistently uses `GATE F-cov` and `GATE F-elig` as distinct named gates. §6 (lines 332-342) splits them into separate subsections with distinct PASS/HOLD routing. §9 verifier routing names them separately ("GATE F-cov FAIL", "GATE F-elig FAIL"). §12 quick-ref card names them as separate entries. No naming ambiguity. Same pattern for GATE G (G-cov / G-elig).

### 8. Direct-answer ≤80 words — universal scope
**Q:** Is the ≤80-word ceiling universal across both subtypes? Counted how (chars vs words)?
**Verdict:** §6 GATE E (GOOD). Explicitly says "≤ 80 words (verifier counts words via `wc -w` on the EN field — strict)". Universal scope is clear ("UNIVERSAL (both subtypes)" in the heading). The exact tool (`wc -w`) is specified. Strong.

### 9. State-named brand requirement — applicability
**Q:** Does the state-named brand rule (Medi-Cal, SoonerCare, etc.) apply universally or only to state-eligibility subtype?
**Verdict:** §6 GATE G-elig + §3 (GOOD). §6 GATE G-elig opens with "subtype: state-eligibility" framing — clearly subtype-conditional. §3 (line 215) handles the hybrid case: "State-context is N/A when subtype=coverage (unless the question is intrinsically state-scoped — e.g., 'Does Medi-Cal cover X?' which is a hybrid; default to coverage subtype but include brand in title)." This hybrid carveout is explicit. Good.

### 10. The 3 existing slugs to avoid
**Q:** Are the 3 existing slugs (does-medicaid-cover-rehab, does-medicare-cover-dental, does-medicare-cover-vision) listed prominently enough that a fresh executor won't collide?
**Verdict:** §7 (GOOD). Listed twice in §7 — once narratively ("Skip the 3 already-shipped") and once in a `Pre-Phase-4 collision check` bash block with the explicit ls command + expected output. Also restated in §11 step 5 pre-flight. Triply-anchored.

### 11. Dispatch test article — specification clarity
**Q:** §3.5 mentions a dispatch test that omits the `subtype` field. Is this test fully specified — which slug, which inputs, expected outcome?
**Verdict:** §7 (GOOD). Bottom of §7 has the "Mandatory dispatch test: spawn one writer invocation with `subtype` omitted (only `topicCluster` provided) for `do-i-qualify-for-medi-cal-california`. Verify STEP 0a correctly infers `state-eligibility` from `topicCluster: "medicaid-income-california"`." This is a complete spec — slug + input fields + expected result. A fresh executor could run this without further questions.

### 12. Schema extension path — decision required
**Q:** §2 says "pick ONE path in Phase 2" for the schema extension. Does the PRD make a recommendation, or push the call entirely to the executor?
**Verdict:** §2 (SOFT GAP). The PRD says "1. Add to `src/lib/qa.ts` as optional fields — preferred" — so preferred path IS stated. But the trade-offs language ("Pro/Con/may cause content-quality.js to warn") still allows wiggle room. Mostly fine — the recommendation is clear if you read the whole paragraph — but a fresh executor under time pressure might re-deliberate. **Suggested tightening:** lead with "Recommendation: take path 1 unless you encounter a blocker, then escalate before falling back to path 2."

### 13. pageType / subtype consistency rules
**Q:** GATE I requires `pageType` and `subtype` consistent. The PRD says coverage → "coverage" / "terminology" / "definition", state-eligibility → "eligibility". What if pageType is missing entirely (it's optional per `qa.ts`)?
**Verdict:** §6 GATE I + §2 (SOFT GAP). The §2 schema reminder says pageType is "currently soft; will become required + branch-determining in the rewrite". So this PRD assumes the executor makes pageType required. But the wording is "MAY become required" implication, not a hard "writer MUST emit pageType". §6 GATE I says "Verify `pageType` matches `subtype`" — implying it must be present, but doesn't explicitly mandate emission. **Risk:** writer could omit pageType and verifier wouldn't HOLD (because there's nothing to mismatch). **Suggested fix:** Add explicit "Writer MUST emit pageType (NOT optional in new writer); verifier HOLDs on missing pageType, not just mismatch."

### 14. GATE H-dispatch detection mechanics
**Q:** GATE H-dispatch says "verify the page's H2 set matches its declared subtype". How does the verifier detect H2 set match — keyword whitelist, regex, semantic compare? The PRD says "look for 'Original Medicare' / 'Medicare Advantage' / 'Standalone supplemental' pattern" for coverage and "'income limits' / 'how to apply' / 'documents needed' / brand-name" for state-eligibility.
**Verdict:** §6 (SOFT GAP). The detection rule is heuristic keyword matching. Good enough for the obvious cases, but the line between "matches §4.3 pattern" and "matches §4.4 pattern" isn't fully decision-tabled. What if a coverage page on Medi-Cal has both "Medicare Advantage" AND "Medi-Cal" in headings (the hybrid case)? **Suggested fix:** Specify a threshold like "≥3 of the 4 coverage keywords present AND <2 state-eligibility keywords → coverage match" or similar. Otherwise the verifier might HOLD on hybrid pages that legitimately straddle.

### 15. coverageBreakdown on state-eligibility
**Q:** §2 line 67 says "coverageBreakdown REQUIRED when pageType=coverage; OPTIONAL when terminology/definition; for eligibility include only if natural — see §3.5". Then §3.5 doesn't elaborate. So when IS it natural for state-eligibility?
**Verdict:** §3.5 (HARD GAP — small but real). §3.5 doesn't actually elaborate on when coverageBreakdown is natural for the eligibility subtype, despite §2 pointing to §3.5 for the answer. State-eligibility pages might want a "what counts as income vs not" 2-column table that's structurally a coverageBreakdown. Or they might use detailSection.table. **Suggested fix:** Add one sentence to §3.5 STEP 3 branch: "For state-eligibility subtype, coverageBreakdown is OPTIONAL. Use it only if the natural shape is a 2-column 'X counts as income / Y does not' or 'X eligibility criterion / Y exception' matrix. The 9-row household-size table is NOT a coverageBreakdown — it's a separate field (path 1) or detailSection.table (path 2)."

### 16. Spanish parity for new fields
**Q:** §2 hard contracts require Spanish parity for every LocalizedString. The new optional fields (`householdSizeTable`, `howToApply`, `stateBrand`) — are they LocalizedString? `stateBrand` is a proper noun ("Medi-Cal") which doesn't translate.
**Verdict:** §2 (SOFT GAP). The PRD says "every LocalizedString needs both `en` AND `es`" but never explicitly types the new optional fields. `stateBrand` is implicitly a flat string per §2 line 83 ("the canonical brand name like 'Medi-Cal' / 'SoonerCare' / 'AHCCCS' used throughout the page"). `householdSizeTable` would have caption + headers (LocalizedString) + rows (could go either way). `howToApply.numberedSteps` should be LocalizedString. **Suggested fix:** Add a small shape spec under §2 line 82-83 showing the JSON template for the 3 new fields with explicit `en`/`es` placement.

### Pass 1 verdict
**14/15 questions answered well by the PRD (12 GOOD, 3 SOFT GAP, 1 HARD GAP, 0 critical HARD GAPs).** The dispatch logic itself is unambiguous and well-crosslinked. Three minor gaps (5/12, 5/13, 5/15, 5/16) that a careful executor would surface and resolve, but none would force me to escalate before starting. The dispatch architecture is the unique complexity, and the PRD handles it with the rigor it deserves.

---

## PASS 2 — Completeness (mechanical)

Eight check items from the task spec.

### 2.1 Cited paths exist (§1, §11, §12)

All paths from §1 context inventory + §11 pre-flight commands + §12 quick-ref card verified via `ls`:

| Path | Status |
|---|---|
| `.claude/agents/coveredusa-qa-writer.md` | EXISTS (12,195 bytes) |
| `.claude/agents/coveredusa-qa-verifier.md` | EXISTS (10,340 bytes) |
| `.claude/agents/_universal-rules-block.md` | EXISTS (6,535 bytes) |
| `.claude/agents/coveredusa-ma-state-writer.md` | EXISTS (41,704 bytes) |
| `.claude/agents/coveredusa-ma-state-verifier.md` | EXISTS (24,472 bytes) |
| `.claude/agents/coveredusa-article-verifier.md` | EXISTS (26,414 bytes) |
| `specs/TRACK_C_PARALLEL_PLAN.md` | EXISTS (57,735 bytes) |
| `specs/FANOUT_FORMULA.md` | EXISTS (34,265 bytes) |
| `specs/AI_OPTIMIZATION_FRAMEWORK.md` | EXISTS (75,260 bytes) |
| `specs/URL_SLUG_FRAMEWORK.md` | EXISTS (13,869 bytes) |
| `specs/LINK_TARGET_MANIFEST.md` | EXISTS (19,331 bytes) |
| `specs/CURRENT_STATE_AUDIT.md` | EXISTS (38,380 bytes) |
| `specs/PHASE_5_BRIDGE.md` | EXISTS (33,305 bytes) |
| `specs/track-c-prime/procedure-prd.md` | EXISTS (24,601 bytes) |
| `content/fanout/analysis/audit-qa-writer.json` | EXISTS (22,011 bytes) |
| `src/lib/qa.ts` | EXISTS (8,834 bytes) |
| `content/data/qa/does-medicaid-cover-rehab.json` | EXISTS (30,380 bytes) |
| `content/data/qa/does-medicare-cover-dental.json` | EXISTS (18,644 bytes) |
| `content/data/qa/does-medicare-cover-vision.json` | EXISTS (23,817 bytes) |

**Verdict: 19/19 PASS.** No broken links. Includes the gold-standard structural exemplar and both reference implementations from MA-state.

**Minor:** §1 also references `memory/feedback_b1_blog_writer_shipped.md` at `~/.claude/projects/-Users-jacobposner-clawd/`. Auto-memory MEMORY.md confirms this entry exists ("B1 Blog Writer Shipped"). PASS.

### 2.2 Audit findings match audit-qa-writer.json

Cross-referenced PRD §4 against audit JSON sections:

| PRD claim | Audit JSON evidence | Match |
|---|---|---|
| 3 pages audited (rehab, dental, vision) | `B_pageAudits[]` 3 entries with those slugs | PASS |
| All 3 coverage subtype | All 3 entries have `"subtype": "coverage"` | PASS |
| Verdict STRONG; ready to ship with light edits | All 3 verdicts say "STRONG... ready to ship" / "gold-standard exemplar" | PASS |
| 6 writer edits WE-1 through WE-6 | `C_writerEditRecommendations` array has 6 entries, priorities 1-6 | PASS |
| WE-1 (HIGH, S) = STEP 0a dispatch | `priority: 1` = "Add §STEP 0a Subtype dispatch" | PASS |
| WE-2 (HIGH, M) = state-eligibility BRANCH | `priority: 2` = state-eligibility block with householdSizeTable, howToApply, etc. | PASS |
| WE-3 (HIGH, S) = universal howToApply | `priority: 3` = "Add a universal howToApply block to ALL Q&A pages" | PASS |
| WE-4 (MED, S) = ctaTarget heuristic | `priority: 4` = ctaTarget enforcement, $50 threshold | PASS |
| WE-5 (MED, S) = caption phrasing | `priority: 5` = lookup-phrasing captions | PASS |
| WE-6 (LOW, S) = schema extension | `priority: 6` = verify qa.ts supports new fields | PASS |
| ONE writer with subtype dispatch, NOT two | `D_splitTemplateFeasibility.splitDecision` = "ONE writer with hard subtype dispatch, NOT two writers" | PASS |
| 70% shared / 30% diverges | `D_splitTemplateFeasibility.rationale[0]` = exact 70% / 30% framing | PASS |

**Verdict: 12/12 PASS.** PRD faithfully synthesizes the audit. No misquotes, no fabricated recommendations.

**One tiny note:** PRD §4 says "WE-2 references the 19-state brand list referenced from universal-rules-block". The audit JSON `C-2 priority 2` says "16-state brand list" (it predates the universal-rules-block expansion to 19). The PRD correctly upgraded the count to match the actual block. PASS but flag-worthy for change-log purposes.

### 2.3 Schema fields match qa.ts QA interface

PRD §2 enumerates required + optional fields. Verified against `qa.ts`:

| PRD claim | qa.ts evidence | Match |
|---|---|---|
| slug, question, shortAnswer, fullAnswer | lines 134-150 | PASS |
| category: QACategory enum (7 values) | lines 115-122 (Medicare, Medicaid, ACA, CHIP, Hospital Bills, Prescription Drugs, Coverage Q&A) | PASS |
| topic, medicalSpecialty | lines 157-159 | PASS |
| ctaTarget: QACtaTarget (screener \| analyzer) | lines 109, 161 | PASS |
| pageType?: QAPageType (coverage \| terminology \| definition \| eligibility) | lines 131, 166 | PASS — and the `?` confirms "currently soft" per PRD |
| lastUpdated, readingTime | lines 168-169 | PASS |
| meta {title, description}, hero {h1} | lines 171-179 | PASS |
| introParagraphs (1-2 entries) | line 182 | PASS |
| coverageBreakdown?: CoverageBreakdown (REQUIRED when pageType=coverage) | lines 190 + JSDoc 185-189 | PASS |
| detailSections: DetailSection[] (MIN 2) | line 193 + JSDoc "(2+ required per Phase 2C critic feedback)" | PASS |
| faqs: {en: LocalizedFAQ[], es: LocalizedFAQ[]} — NOT LocalizedString | lines 196-199, LocalizedFAQ is flat strings (lines 37-40) | PASS — critical contract correctly named |
| relatedLinks: RelatedLink[] | line 201 | PASS |
| sources: QASource[] | line 203 | PASS |
| Additive Track C-prime: topicCluster, keyTerms{en,es}, isLighthouse, isDeprecated, subtype | NOT in qa.ts — extras emitted as additive | PASS — PRD line 96 ("extra fields silently ignored at runtime") |
| Schema extension fields: householdSizeTable, howToApply, stateBrand | NOT in qa.ts — explicitly called out as "schema extension you may need" (§2 line 80-83) | PASS — PRD owns this gap, offers two paths |

**Verdict: 16/16 PASS.** PRD's schema reminder is accurate; the additive fields are explicitly framed as extensions, not pretended-existing.

### 2.4 Recipe references match FANOUT_FORMULA §4.3 + §4.4

Read both FANOUT sections, cross-referenced with PRD §3:

**§4.3 (FANOUT) → PRD §3.3 coverage shapes:**
- FANOUT lists 6 dominant shapes (lines 270-277): MA benefits + year, Original-vs-MA, Medicare coverage + year, Standalone supplemental, OOP cost, Eligibility criteria
- PRD §3 line 112 says "Top 8 dominant shapes" but enumerates only 6 (numbered 1-6). The "8" appears to be a typo — count is 6.
- Each PRD shape maps 1:1 to a FANOUT shape, in the same order. PASS.
- Variant distribution PRD §3 line 106: "Entailment 38.4% / Equivalent 36.8% / Specification 24.9%" — matches FANOUT line 266 exactly. PASS.
- Bing-validated shapes: PRD "3 of 8" — matches FANOUT line 268 ("3 of 8"). PASS.
- Required H2 set (PRD §3 lines 122-129): 8 H2s. FANOUT §4.3 line 280 lists 5 H2s ("Direct answer", "What Original Medicare covers", "What Medicare Advantage may add", "Cost without coverage", "Standalone supplemental options"). PRD ADDS 3 more H2s ("Eligibility criteria", "How to find a plan that covers [thing]", "FAQ on alternatives"). The 3 added H2s are consistent with FANOUT §4.3 shape 6 ("Eligibility criteria for [topic] benefit") and audit recommendations WE-3 (universal howToApply). **PASS — PRD expands FANOUT recipe but doesn't contradict.**

**§4.4 (FANOUT) → PRD §3.4 state-eligibility shapes:**
- FANOUT §4.4 lists 6 dominant shapes (lines 290-297): State income limits, State-named brand, application process, expansion + ACA gap, family size, documents needed
- PRD §3 line 154 says "Top 6 dominant shapes" — count matches. PASS.
- 1:1 ordering match between PRD and FANOUT. PASS.
- Bing-validated shapes: PRD §3 line 108 says "Multiple Bing-validated shapes" without exact count; FANOUT doesn't give a count for §4.4 either (it says "Bing-validated" on shapes 1, 2, 3). PASS — accurate.
- Required H2 set (PRD §3 lines 163-171): 8 H2s. FANOUT §4.4 line 300 lists 5 H2s ("Eligibility income limits + household-size table", "State-named program brand explanation", "How to apply", "Documents needed checklist", "Common denial reasons"). PRD ADDS 3 more H2s ("Direct answer", "Is [state] a Medicaid expansion state?", "How to appeal a denial", "[Brand] context"). The added H2s are consistent with shape 4 (expansion + ACA gap) + universal RULE 3 (how-to-apply universally). **PASS — PRD expands FANOUT recipe but doesn't contradict.**

**Verdict: ALL recipe references PASS** with one typo flag: §3 line 112 says "Top 8 dominant shapes" for §4.3 but enumerates 6 (matching FANOUT's 6). Should read "Top 6 dominant shapes". Cosmetic; no executor confusion.

### 2.5 All 12 sections + §3.5 present

Section headers in qa-prd.md verified via Read:
- §0 Read order — PRESENT (line 11)
- §1 Context inventory — PRESENT (line 27)
- §2 Schema reminder + hard contracts — PRESENT (line 49)
- §3 §4.3 + §4.4 recipes (expanded with worked examples) — PRESENT (line 104)
- **§3.5 Subtype dispatch (THE unique architectural mechanic — read this twice)** — PRESENT (line 219) ← only Q&A has this
- §4 Audit findings synthesized — PRESENT (line 287)
- §5 Universal GATES — PRESENT (line 304)
- §6 Q&A-specific GATES — PRESENT (line 315)
- §7 Test mix — 5 Q&As — PRESENT (line 394)
- §8 Common failure modes — PRESENT (line 432)
- §9 Verifier scope — PRESENT (line 449)
- §10 Atomic deliverable (Phase 5 — 4 commits) — PRESENT (line 495)
- §11 Pre-flight checklist — PRESENT (line 516)
- §12 Quick reference card — PRESENT (line 551)

**Verdict: 13/13 PASS** (12 standard + §3.5 unique).

### 2.6 GATES include subtype-aware routing

Verified §6 + §9 routing:

| Gate | Subtype-aware? | Routing clarity |
|---|---|---|
| GATE A (slug-no-year) | UNIVERSAL | HOLD on fail — clear |
| GATE B (9-row table) | CONDITIONAL: N/A coverage, REQUIRED state-eligibility | Explicit in §5 + §9 routing — clear |
| GATE C (≥3 .gov) | UNIVERSAL | HOLD on 0-1, WARN on 2 — clear |
| GATE D (no `--`) | UNIVERSAL | AUTO-FIX, never HOLD — clear |
| GATE E (Direct-answer ≤80w) | UNIVERSAL | HOLD on missing/>80/no keyword — clear |
| GATE F-cov (comparison table) | coverage subtype only | HOLD if absent, WARN if <3 rows — clear |
| GATE F-elig (9-row table) | state-eligibility subtype only | HOLD if missing/wrong count/no caption brand — clear |
| GATE G-cov (alternatives on No/It-depends) | coverage subtype only | HOLD if missing — clear |
| GATE G-elig (brand throughout) | state-eligibility subtype only | HOLD on full absence, ship+LOW flag if 1-2 surfaces — clear |
| GATE H (vocabulary) | subtype-specific (9 terms coverage / 8 terms state-eligibility) | ship + MEDIUM flag if 3+ missing — clear |
| GATE H-dispatch (H2 set matches subtype) | UNIVERSAL but subtype-aware | HOLD on mismatch — clear |
| GATE I (pageType/subtype consistency) | UNIVERSAL | HOLD on mismatch — clear |

**Verdict: 12/12 gates have explicit subtype-aware routing.** §9 verifier routing block restates every gate's pass/HOLD condition, indexed by subtype where relevant. Strong.

### 2.7 Test mix collision check

Verified `ls /Users/jacobposner/clawd/projects/covered-usa/content/data/qa/`:

Existing files:
- `_queue.json` (config — excluded by `_*` prefix rule)
- `does-medicaid-cover-rehab.json`
- `does-medicare-cover-dental.json`
- `does-medicare-cover-vision.json`

PRD §7 test mix (5 slugs):
- Coverage (3): `does-medicare-cover-hearing-aids`, `does-aca-cover-preexisting-conditions`, `does-medicaid-cover-home-health-care`
- State-eligibility (2): `do-i-qualify-for-medi-cal-california`, `do-i-qualify-for-soonercare-oklahoma`

Cross-reference: 5 test slugs ∩ 3 existing slugs = **{} (empty set)**. No collisions.

**Subtype split check:** PRD §7 explicitly distributes 3 coverage + 2 state-eligibility. Specified exactly per task spec.

**Verdict: PASS.** No slug collisions; subtype distribution matches spec; PRD §7 includes the exact `ls` command Jacob would use to verify.

### 2.8 19-state brand list accuracy

Verified PRD §6 GATE G-elig brand list against `_universal-rules-block.md` RULE 1 table:

| State | PRD brand | Universal RULE 1 brand | Match |
|---|---|---|---|
| California | Medi-Cal | Medi-Cal (Medicaid) + CalFresh (SNAP) | PASS |
| Arizona | AHCCCS | AHCCCS | PASS |
| Minnesota | MNsure | MNsure (Marketplace) | PASS |
| Oklahoma | SoonerCare | SoonerCare | PASS |
| Maine | MaineCare | MaineCare | PASS |
| Wisconsin | BadgerCare | BadgerCare | PASS |
| Illinois | AllKids | AllKids (CHIP) | PASS |
| Tennessee | TennCare | TennCare | PASS |
| Arkansas | ARHOME | ARHOME | PASS |
| New Jersey | NJ FamilyCare | NJ FamilyCare | PASS |
| Massachusetts | MassHealth | MassHealth | PASS |
| Indiana | HIP | HIP (Healthy Indiana Plan) | PASS |
| Oregon | OHP | OHP (Oregon Health Plan) | PASS |
| Colorado | CHP+ | CHP+ (CHIP) | PASS |
| Kentucky | kynect | kynect (Marketplace) | PASS |
| Connecticut | HUSKY Health | HUSKY Health | PASS |
| Hawaii | Med-QUEST | Med-QUEST | PASS |
| Washington | Apple Health | Apple Health | PASS |
| California (SNAP context) | CalFresh | CalFresh | PASS (PRD §6 line 364 includes it) |

**Verdict: 19/19 PASS.** Brand list is accurate, exhaustive, and consistent across §6 GATE G-elig (line 364), §3.5 SLUG regex (line 240), and §12 quick-ref card (line 569). No brand drift across the three places it appears.

### Pass 2 verdict
**All 8 mechanical checks PASS.** PRD is internally consistent, accurate to source documents, and complete. Two cosmetic flags (typo in §3 "Top 8 dominant shapes" should be 6; flag for change-log that audit's 16-state count was correctly upgraded to 19) — no executor-blocking issues.

---

## Verdict & top fixes

**Overall verdict: SHIP with 3 minor tightening edits.** This is the most architecturally complex PRD of the 7, and it earned that complexity by handling subtype dispatch with crosslinked rigor: the dispatch logic appears in §3.5 (definition), §6 (gate routing), §9 (verifier routing), and §12 (quick reference). No internal contradictions. Brand list is consistent across 3 places. Audit JSON faithfully synthesized. Schema fields accurate. Test mix collision-free with explicit subtype distribution.

**Three small-but-real gaps surfaced in Pass 1:**

1. **§3.5 missing `coverageBreakdown` guidance for state-eligibility subtype** (Pass 1 Q15 — only HARD GAP). §2 line 67 says "for eligibility include only if natural — see §3.5", but §3.5 never elaborates. Add one sentence on when it's natural and clarify the 9-row household-size table is a SEPARATE field, not a coverageBreakdown.

2. **§2 + §6 GATE I missing explicit "writer MUST emit pageType" rule** (Pass 1 Q13). pageType is currently optional per qa.ts. The new writer needs to make it mandatory to enable GATE I's mismatch detection. Otherwise a writer could omit pageType and GATE I has nothing to check.

3. **§3.5 schema extension: missing JSON shape templates for new fields** (Pass 1 Q16). `householdSizeTable`, `howToApply`, `stateBrand` need explicit en/es shape templates so the writer doesn't accidentally emit `stateBrand` as a LocalizedString (it should be flat) or `howToApply.numberedSteps` as flat strings (should be LocalizedString).

**Two tiny cosmetic fixes:**

4. **§3 line 112 typo:** "Top 8 dominant shapes" should be "Top 6" to match enumerated count + FANOUT §4.3 (which lists 6).

5. **§3.5 step 3 SLUG regex CalFresh note:** add one-line "CalFresh excluded — SNAP-only, not a Medicaid eligibility slug" to head off executor confusion when comparing the regex (18 brands) against universal RULE 1 (19 brands including CalFresh).

None of these block execution. A fresh Phase-1 planner can read the PRD, do steps 0-1 (read order + context), and run to phase 4 without escalation. The subtype dispatch architecture is correctly framed as the unique mechanic and gets the airtime it deserves.

---

*Verification complete: 2026-05-14*
