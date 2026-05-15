# Glossary PRD — Verification Report

**Verified:** 2026-05-14
**Verifier:** Frank (fresh-session two-pass methodology)
**Subject:** `projects/covered-usa/specs/track-c-prime/glossary-prd.md`
**Verdict:** **READY TO EXECUTE** with minor fixes (no HARD GAPs blocking; 4 SOFT GAPs flagged).

---

## PASS 1 — Fresh-eyes (read PRD alone, before any other files)

The 12 questions a cold executor would surface, end-to-end:

### Q1. Is the DOWNSCOPE framing loud enough?
**§0 GOOD.** PRD opens with "## 0. THIS IS DOWNSCOPE WORK — read first, no exceptions" and explicitly contrasts with other PRDs ("Every other Track C-prime PRD is about ADDING structure... This one is the opposite"). The word "subtraction" appears in §0, §12, and the closing paragraph. Hammer count: 9 mentions of "downscope/subtraction" theme across PRD. **Sufficient.**

### Q2. Is the strict prohibition on `magi` / `deductible` / `out-of-pocket-maximum` clear?
**§0.1 + §2 + §6 + §7 + §8 + §9 + §10 + §11 + §12 GOOD.** Prohibition explicitly named at 9 distinct locations (target was ≥4 per request):
1. §0.1 dedicated section
2. §2 hard contract #8
3. §6 GATE H discussion (referenced via audit finding)
4. §7 callout (in CRITICAL paragraph + collision-check)
5. §8 failure-mode #5
6. §9 verifier routing slug-prohibition rule
7. §10 pre-push tripwires (mechanical git-diff check)
8. §11 pre-flight #5
9. §12 quick-ref card

PRD also defines the writer-side defensive check: "If the cron payload arrives with slug = magi, the writer returns `{slug, status: 'error', error: 'track-c-prohibited-slug: magi belongs to Track E downsize'}`." That's a runtime guard on top of the doc-level rule. **Crystal clear — exceeds target.**

### Q3. Word count GATE E — exactly how is "≤500 EN words" measured?
**§6 GOOD with one SOFT GAP.**
- The Node one-liner IS provided in full (§6 lines 224-238).
- Counted: `definition.en`, `quickDefinition.en`, `hero.subhero.en`, `introParagraphs[].en`, `detailSections[].heading + paragraphs`, `faqs.en[].question + answer`, `annualLimits.footnote.en`, `workedExample.intro + footnote`.
- Excluded (per prose only, not in code): frontmatter, source citation labels, link anchor text.
- Exit-code-1 routing for `w > 500` makes the writer self-block.

**SOFT GAP:** The word counter includes `introParagraphs[].en` even though §2 says the field is DROPPED entirely. This is defensible (defensive against a writer that accidentally emits the field) but the PRD doesn't explain the apparent contradiction. A fresh executor may read this as "the field is allowed if I keep it under 500 words total." **Fix:** Add 1-line note: "introParagraphs is included in the counter for defense-in-depth; the writer must emit `[]` regardless."

### Q4. Internal-link target as PRIMARY value — is this clear?
**§3 + §6 + §12 GOOD.** Stated at:
- §0: "§4.5 recipe explicitly says glossary's strategic role is internal-link target — NOT citation magnet"
- §3: "glossary is a **link-target spoke**" — bolded
- §3 hard caps: "Aggressive cross-linking — 3-5 inline body links to lighthouses (the template's primary value)"
- §6 GATE G: "The template's primary value is link-target infrastructure"
- §12 LINK_TARGET_MANIFEST callout: "(CRITICAL — link-target is the template's primary value)"

The PRIMARY framing is reinforced 5+ times. **Unambiguous.**

### Q5. introParagraphs DROP entirely — clear and emphasized?
**§2 + §3 + §8 + §12 GOOD with one SOFT GAP.**
- §2 explicit: "DROP this field entirely in the new writer. Schema may still accept it (back-compat); writer must emit `[]` or omit it."
- §3 hard caps: "introParagraphs DROPPED entirely"
- §8 failure mode #2: "Writer emits introParagraphs. The old prompt encouraged 1-2 intro paragraphs. New prompt drops the field entirely."
- §12 subtraction list item #1

**SOFT GAP:** `src/lib/glossary.ts` line 144 declares `introParagraphs: LocalizedString[]` as **non-optional** (no `?` marker). A writer that omits the field will fail TypeScript strict-mode at build. PRD's "emit `[]` or omit it" hedges — but `[]` is the only safe choice. Recommend tightening to: "writer MUST emit `introParagraphs: []` (empty array; the field is required by the TypeScript interface)."

### Q6. Minimum internal links per page — ≥3 from link-index byPhrase keys?
**§3 + §6 + §12 GOOD.**
- §3: "3-5 inline body links"
- §6 GATE G: "≥3 distinct hrefs; WARN if 1-2; HOLD if 0"
- §6 subtle-point: "`relatedLinks` footer items don't count toward this gate. Inline body links inside `quickDefinition`, `detailSections[].paragraphs[]`, or FAQ answers DO count."
- §8 failure mode #8 reinforces footer-doesn't-count rule
- §12 quick-ref: "G (≥3 inline links, HOLD if 0)"

Distinction between inline vs footer links is explicit and repeated. **Clear.**

### Q7. §4.5 warning quote at TOP of writer prompt — is exact quote provided?
**§0 GOOD with one SOFT GAP.**
The quote is provided in §0 lines 20-21 (the indented blockquote starting with "WARNING:...").

**SOFT GAP:** The PRD calls this "paraphrased from FANOUT_FORMULA.md" (§0 line 19) AND says "That quote belongs verbatim at the TOP of your new writer prompt" (§0 line 23). Cross-checking against FANOUT_FORMULA.md §4.5 (lines 308-329), the actual recipe doesn't have a single verbatim WARNING block matching the PRD quote — the PRD's quote is a synthesis of: §4.5 header WARNING line + 300-500 word guidance + strategic note. Verbatim-vs-paraphrased ambiguity may make a fresh executor uncertain whether to copy the PRD's quote or fetch FANOUT-source. Either resolves the ambiguity: (a) drop "paraphrased" wording, (b) clarify "use the PRD quote verbatim as it consolidates §4.5's WARNING + word ceiling + strategic-role guidance."

### Q8. 5 NEW glossary slugs — do they collide with existing?
**§7 GOOD.** Slugs proposed: `premium-tax-credit`, `copayment-vs-coinsurance`, `in-network-vs-out-of-network`, `special-enrollment-period`, `open-enrollment-period`. PRD includes mechanical collision-check command + expected output `_queue, deductible, magi, out-of-pocket-maximum`. Pass-2 mechanical check below confirms reality. **No collisions.**

### Q9. Cross-template alignment — does §9 verifier scope match master brief Phase 4.5 patches?
**§9 GOOD.** All 3 master-brief patches listed (path portability, dual-purpose framing, STEP 1C structural detect-only) + all 3 load-test patches (GATE E mechanical strict, keyTerms shape, GATE D auto-fix hoist). Routing per gate enumerated. **Complete.**

### Q10. Default-toward-ship calibration — explicit?
**§12 GOOD.** "Default toward auto-ship: ~95% / ~4% / ~1% (HOLD only on genuine breakage — for glossary, that means word-over-cap, missing inline links, or extra detail sections)." Same shape as master brief §3.5. **Aligned.**

### Q11. GATE H (≤1 detail section) — new addition, properly grounded?
**§6 GOOD.** GATE H is NEW in the PRD (the master brief §5.7 only specifies 3 glossary gates: word cap, ≥3 internal links, definition in first 80 words). PRD adds GATE H as a 4th gate citing audit finding ("MAGI had 4 detail sections, deductible had 3. Both bloated word count"). Grounded in §4 audit data. **Defensible addition** — sharper enforcement of the §4.5 "1 worked example + 1 lookup table" caveat.

### Q12. Atomic deliverable + tripwires — are git checks defense-in-depth or required?
**§10 GOOD.** Pre-push tripwires are defense-in-depth — they detect accidental modifications to the 3 prohibited slugs even if writer-side and verifier-side prohibitions both failed. The "Expected: empty" framing makes the check pass/fail mechanical. **Strong.**

---

## PASS 2 — Mechanical completeness

### Check 1: Cited paths exist (§1, §11, §12)

All paths confirmed via `ls`:

| Path | Exists |
|---|---|
| `.claude/agents/coveredusa-glossary-writer.md` | ✓ |
| `.claude/agents/coveredusa-glossary-verifier.md` | ✓ |
| `.claude/agents/_universal-rules-block.md` | ✓ |
| `.claude/agents/coveredusa-ma-state-writer.md` | ✓ |
| `.claude/agents/coveredusa-ma-state-verifier.md` | ✓ |
| `.claude/agents/coveredusa-article-verifier.md` | ✓ |
| `specs/TRACK_C_PARALLEL_PLAN.md` | ✓ |
| `specs/track-c-prime/procedure-prd.md` | ✓ |
| `specs/FANOUT_FORMULA.md` | ✓ |
| `specs/AI_OPTIMIZATION_FRAMEWORK.md` | ✓ |
| `specs/URL_SLUG_FRAMEWORK.md` | ✓ |
| `specs/LINK_TARGET_MANIFEST.md` | ✓ |
| `specs/CURRENT_STATE_AUDIT.md` | ✓ |
| `specs/PHASE_5_BRIDGE.md` | ✓ |
| `content/fanout/analysis/audit-glossary-writer.json` | ✓ |
| `src/lib/glossary.ts` | ✓ |
| `content/link-index.json` | ✓ |
| `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_b1_blog_writer_shipped.md` | ✓ |

**Status:** ALL paths resolve. No HARD GAP.

### Check 2: Audit findings match `audit-glossary-writer.json`

| PRD claim (§4) | Audit JSON | Match |
|---|---|---|
| magi 1,658 words / 3.32x over | `wordCountEN: 1658` / `ratio_vs_500_ceiling: "3.32x over"` | ✓ |
| deductible 1,464 / 2.93x over | `wordCountEN: 1464` / `2.93x over` | ✓ |
| oop-max 904 / 1.81x over | `wordCountEN: 904` / `1.81x over` | ✓ |
| Average 1,342 / 2.68x over | `average.words: 1342, 2.68x over` | ✓ |
| WE-1: §4.5 quote + word cap + drop introParagraphs + detailSections MAX 1 + FAQ 3-4 | `topWriterEdits[0]` matches | ✓ |
| WE-2: link-index.json + 3-5 inline links + topicCluster + keyTerms + isLighthouse + isDeprecated | `topWriterEdits[1]` matches | ✓ |
| WE-3: §3.3 household-size + §3.4 how-to-apply + §3.7 state-named programs + §3.10 chart phrasing | `topWriterEdits[2]` matches | ✓ |
| Concept-bloat banned: "Why MAGI Instead of Gross Income" + "Why Bronze Plans Have Higher Deductible" | `bloatedWithConceptExplanation.examples` matches | ✓ |

**Status:** PRD audit synthesis is faithful. No HARD GAP.

### Check 3: Schema fields match `src/lib/glossary.ts` interface

Verified `Glossary` interface (lines 108-170) against PRD §2:

| PRD §2 field | Schema | Match |
|---|---|---|
| `slug` | `slug: string` | ✓ |
| `term: LocalizedString` | `term: LocalizedString` | ✓ |
| `alternateNames: string[]` | `alternateNames: string[]` | ✓ |
| `definition: LocalizedString` | `definition: LocalizedString` | ✓ |
| `category` (enum 7 values) | `GlossaryCategory` enum 7 values | ✓ |
| `ctaTarget` (screener \| analyzer) | `GlossaryCtaTarget` matches | ✓ |
| `meta.{title, description}` | `meta: { title, description }` | ✓ |
| `hero.{h1, subhero}` | `hero: { h1, subhero }` | ✓ |
| `quickDefinition` | `quickDefinition: LocalizedString` | ✓ |
| `introParagraphs[]` | `introParagraphs: LocalizedString[]` | ✓ (NON-optional — see SOFT GAP under Q5) |
| `annualLimits?` | `annualLimits?: AnnualLimitsSection` | ✓ |
| `whatCountsToward?` / `whatDoesNotCountToward?` | both `?:` optional | ✓ |
| `workedExample?` | `workedExample?: WorkedExampleSection` | ✓ |
| `detailSections` (MAX 1 per PRD) | `detailSections: DetailSection[]` (non-optional; schema doc-comment says "MIN 2 for mid-CTA split") | **SOFT GAP — stale schema comment** |
| `faqs: { en, es }` (3-4 entries) | `faqs: { en: LocalizedFAQ[], es: LocalizedFAQ[] }` | ✓ |
| `relatedLinks` | `relatedLinks: RelatedTerm[]` | ✓ |
| `sources` | `sources: GlossarySource[]` | ✓ |

**SOFT GAP:** `src/lib/glossary.ts` line 158 carries a stale comment: `/** Flexible array of detail sections (MIN 2 for mid-CTA split) */`. The PRD's new direction is MAX 1. A fresh executor reading the schema as ground truth could get confused. The PRD does not flag this stale comment.

**HARD GAP candidates:**
- "Additive Track C-prime fields" `topicCluster`, `keyTerms.{en,es}`, `isLighthouse`, `isDeprecated` are NOT in the formal `Glossary` interface. PRD §2 acknowledges: "extra fields are silently ignored at runtime, but missing required fields crash the build" — TRUE per runtime behavior, but TypeScript strict-mode at build will warn on excess properties unless the loader uses a permissive cast. Inspection of `readGlossaryFile` (line 181): `const parsed = JSON.parse(raw) as Glossary;` — this is an unchecked type assertion, so extra properties pass silently. **NOT a hard gap** since the build will accept them.

### Check 4: Recipe references match FANOUT_FORMULA.md §4.5

Verified FANOUT_FORMULA.md §4.5 (lines 308-329):

| PRD §3 claim | FANOUT_FORMULA §4.5 | Match |
|---|---|---|
| Canonicalization 45.9% / Specification 19.3% / Entailment 19.3% / Clarification 12.6% / Equivalent 3.0% | identical | ✓ |
| Bing-validated: 1 of 8 | "1 of 8 (very weak)" | ✓ |
| 4 MAGI queries in 2 months | identical | ✓ |
| 300-500 words target | identical | ✓ |
| Definition + 1 worked example + 1 lookup table | identical | ✓ |
| Cross-link aggressively | identical | ✓ |
| Primary value: internal-link target (LINK_TARGET_MANIFEST) | "Strategic note: Glossary's primary value is internal-link target (per LINK_TARGET_MANIFEST.md)" | ✓ |

**Status:** Recipe transcription is faithful. No HARD GAP.

**SOFT GAP (from Q7):** The PRD's "warning quote" is a synthesis, not a verbatim extract from FANOUT-source. Re-stated under Q7.

### Check 5: All 12 sections present

Verified PRD has all numbered sections:
- §0 ✓ DOWNSCOPE WORK
- §0.1 ✓ STRICT PROHIBITION
- §0.2 ✓ Read order
- §1 ✓ Context inventory
- §2 ✓ Schema + hard contracts
- §3 ✓ §4.5 recipe DOWNSCOPE-FIRST
- §4 ✓ Audit findings
- §5 ✓ Universal GATES
- §6 ✓ Glossary GATES (E/F/G/H)
- §7 ✓ Test mix (5 NEW)
- §8 ✓ Common failure modes
- §9 ✓ Verifier scope
- §10 ✓ Atomic deliverable
- §11 ✓ Pre-flight checklist
- §12 ✓ Quick-reference card

**Status:** All present, plus 3 §0.X subsections (adds rigor). No HARD GAP.

### Check 6: GATES A-H match master brief routing

Cross-referenced TRACK_C_PARALLEL_PLAN.md §7 (universal gates) + §5.7 (glossary gates) + §6 (HELD triggers):

| Gate | PRD routing | Master brief | Match |
|---|---|---|---|
| A — slug-no-year | HOLD | "always HOLD" §6 | ✓ |
| B — household-size table | N/A for most glossary; LOW flag for income-anchored | "N/A on non-income → skip" §3 Phase 4.5 | ✓ |
| C — ≥3 .gov citations | HOLD if 0-1; WARN if 2 | "HOLD; WARN (2) → ship + LOW flag" §7 | ✓ |
| D — zero `--` | AUTO-FIX | "AUTO-FIX as style correction" §7 | ✓ |
| E — ≤500 words | HOLD if >500 | "REJECT if over" §5.7 | ✓ |
| F — definition ≤80 words | HOLD if >100; WARN 81-100 | "Definition in first 80 words" §5.7 | ✓ (PRD adds WARN tier — sharper) |
| G — ≥3 inline links | HOLD if 0; WARN if 1-2 | "Required ≥3 internal links" §5.7 | ✓ (PRD adds WARN tier — sharper) |
| H — ≤1 detail section | HOLD if 2+ | NOT in master brief — PRD-specific | **PRD addition, grounded in audit** |

**Status:** All gates aligned. GATE H is a PRD-specific addition that the master brief does not list — documented in PRD §4 as audit finding. **Defensible — no gap.**

### Check 7: Test mix slug collision

Listed `content/data/glossary/`:
```
_queue.json
deductible.json
magi.json
out-of-pocket-maximum.json
```

PRD-proposed Phase-4 slugs:
- `premium-tax-credit` — NOT present ✓
- `copayment-vs-coinsurance` — NOT present ✓
- `in-network-vs-out-of-network` — NOT present ✓
- `special-enrollment-period` — NOT present ✓
- `open-enrollment-period` — NOT present ✓

PRD expected `ls` output (line 288): "Expected output: `_queue`, `deductible`, `magi`, `out-of-pocket-maximum`" — matches reality exactly.

**Status:** Zero collisions. No HARD GAP.

### Check 8: Prohibition mentioned ≥4 times

Counted explicit prohibition mentions of `magi`/`deductible`/`out-of-pocket-maximum`:
1. §0.1 dedicated section
2. §2 hard contract #8
3. §3 (implicit via "1 of 8 Bing-validated shapes" — N/A, doesn't count)
4. §6 GATE H discussion
5. §7 CRITICAL paragraph + collision check + expected `ls` output
6. §8 failure mode #5
7. §9 verifier routing slug-prohibition
8. §10 pre-push tripwires (mechanical git-diff against the 3 files)
9. §11 pre-flight #5 (verify the 3 files exist as sanity)
10. §12 quick-ref "PROHIBITED SLUGS"

**Count: 9-10 distinct mentions** (target ≥4). **Far exceeds requirement.**

---

## Summary of gaps

### SOFT GAPs (4)

1. **Stale `src/lib/glossary.ts` line 158 comment** (`MIN 2 for mid-CTA split`) contradicts PRD's MAX-1 direction. Fresh executor reading schema may get confused. **Fix:** Either update schema doc-comment as part of this work, OR add explicit callout in PRD §2 (e.g., "Note: `src/lib/glossary.ts` line 158 has a stale doc-comment claiming MIN 2; the PRD overrides — emit MAX 1.").

2. **`introParagraphs` empty-array vs omit ambiguity.** Schema declares `introParagraphs: LocalizedString[]` as NON-optional. PRD says "emit `[]` or omit." Omit will fail TS strict-mode. **Fix:** Tighten to "writer MUST emit `introParagraphs: []`."

3. **§4.5 warning quote is paraphrased/synthesized, not verbatim.** PRD says "verbatim" but the quote consolidates multiple FANOUT-source lines. **Fix:** Drop "paraphrased" wording OR clarify "use this PRD-consolidated quote verbatim — it synthesizes §4.5's WARNING + word ceiling + strategic-role guidance."

4. **`introParagraphs` field is INCLUDED in the GATE E word-count Node one-liner** even though §3 says drop entirely. Defense-in-depth (correct) but unexplained. **Fix:** 1-line comment in §6 noting "introParagraphs is included in the counter as defensive coverage; writer must still emit `[]`."

### HARD GAPs

**None identified.** The PRD is internally consistent, all cited paths exist, audit findings match, schema matches, all 12 sections present, GATES align with master brief (plus 1 defensible addition), zero slug collisions, prohibition stated 9-10 times (≥4 requirement).

### Verdict

**READY TO EXECUTE.** A fresh parallel session can pick this up and run Phases 1-5 without ambiguity blocking work. The 4 SOFT GAPs are tightening opportunities, not blockers; an executor will resolve them in-context (especially the schema-comment one, which they'll see when reading `src/lib/glossary.ts` during Phase 1).

### Top 3 fixes

1. **Tighten `introParagraphs` instruction** (Q5 / SOFT-2): "writer MUST emit `introParagraphs: []`" — eliminates the omit-vs-empty-array ambiguity given the non-optional schema field.

2. **Flag the stale schema doc-comment in `src/lib/glossary.ts` line 158** (SOFT-1): Add a 1-line note in PRD §2 OR include a sub-task in Phase 5 to update the doc-comment alongside the writer/verifier prompt ship.

3. **Clarify "verbatim" framing of the §4.5 warning quote** (Q7 / SOFT-3): Either replace "paraphrased" with "this PRD's consolidation of §4.5's WARNING + word-ceiling + strategic-role lines" OR direct-quote the FANOUT-source lines with explicit line references.
