# Verifier A — Matrix-driven critic
**Date:** 2026-05-15
**Phase:** 3 (matrix critic)

## Verdict summary
| Status | Count |
|---|---|
| PASS | 47 |
| PARTIAL | 5 |
| FAIL | 2 |

(54 total requirements across Categories 1–9; Category 9 covers verifier-side patches and is partially out of writer-prompt scope — flagged accordingly.)

---

## Detail

### Category 1 — Universal rules (§3.1 – §3.10)

**1.1 — §3.1 Year markers in title/H1/meta + every numeric value — PASS**
Evidence: STEP 5 style rules item 4 ("Reference '2026' explicitly for freshness signal in title, meta description, hero, FAQs, and every numeric table caption"). The 2026 anchor-facts block in STEP 5 is verbatim. End-of-prompt sanity check #10 cross-checks `.gov`/year. Slight nit: there's no explicit checklist item that requires year on every dollar amount in the same sentence — but the anchor-facts block + style rule 4 + the meta.title exemplar (`"Term Name (TN): 2026 Definition + Examples"`) collectively cover it.

**1.2 — §3.2 State-context-everywhere — PASS (n/a marked)**
Evidence: STEP 3 universal-rules table row explicitly says "N/A — glossary terms aren't state-scoped. Skip." Mirrored in GATE B framing at STEP 6.

**1.3 — §3.3 Household-size table (conditional) — PASS**
Evidence: STEP 3 row 3 spells out the conditional ("CONDITIONAL — required ONLY for income-anchored terms"). GATE B at STEP 6 routes correctly (4-row representative table acceptable; "warn" not HOLD).

**1.4 — §3.4 How-to-apply (conditional) — PASS**
Evidence: STEP 3 row 4 ("CONDITIONAL — included ONLY for terms with an actual enrollment flow… For purely definitional terms… SKIP entirely"). Matches matrix wording.

**1.5 — §3.5 Comparison framing — PASS**
Evidence: STEP 3 row 5 ("Every glossary term has a near-neighbor concept. If you include a detailSection, it should be COMPARISON-shaped"). Reinforced in the inline exemplar's detailSection heading ("Term A vs Term B (comparison framing only — never history)"). NEVER #6 explicitly bans history/mechanics detail sections.

**1.6 — §3.6 Authoritative source narrowing — PASS**
Evidence: STEP 3 row 6 ("Cite primary sources INLINE… ≥3 inline .gov / .edu / kff.org citations"). STEP 2 primary-sources table by term type. GATE C at STEP 6 enforces.

**1.7 — §3.7 State-named program brands (conditional) — PASS**
Evidence: STEP 3 row 7 ("CONDITIONAL — for MAGI-Medicaid relevant terms, mention 2+ brand names (Medi-Cal, AHCCCS, MNsure, BadgerCare) in body").

**1.8 — §3.8 Eligibility entailment in FAQs (numeric threshold) — PARTIAL**
Evidence: The inline FAQ exemplar shows lookup-shaped questions ("What is the 2026 threshold?") and §3.10 instructs leading FAQ answers with a number. But there's no explicit rule that one FAQ for an income-anchored term MUST answer "do I qualify for…" with a numeric threshold.
Recommended edit: add to STEP 4 FAQ checklist: "For income-anchored terms (PTC, MAGI, FPL), at least one of the 3-4 FAQs must answer a 'do I qualify' question with a numeric threshold + household size + year."

**1.9 — §3.9 Demographic specificity — PASS (skipped intentionally)**
Evidence: Matrix marks "WEAK — glossary is too short for this. Skip." The writer prompt is appropriately silent. No correction needed.

**1.10 — §3.10 "Chart" / "guidelines" / "by [X]" table phrasing — PASS**
Evidence: STEP 3 row 8 ("Use 'chart' / 'guidelines' / 'by household size' / 'by year' in table captions when emitting numeric tables"). Inline exemplar uses "Term A vs Term B by year (2026 chart)" as a caption.

---

### Category 2 — §4.5 recipe (DOWNSCOPE-FIRST)

**2.1 — Hard-cap ≤500 EN words (DOMINANT GATE) — PASS**
Evidence: §4.5 warning quote at top of prompt is verbatim. The audit count (1,298 / 1,078 / 683) is paraphrased to a stronger numbers list (1,658 / 1,464 / 904 from the audit JSON). STEP 6 GATE E runs the Node one-liner mechanically and `process.exit(1)` if >500. STEP 4 derivation order + "300-500 words rendered" exemplar. NEVER #2 reinforces. End-of-prompt check #9. Framing strength: HIGH ("STOP. Read this twice." + HARD REJECT language).

**2.2 — `definition.en` ≤80 words + substantive noun-phrase lead — PASS**
Evidence: STEP 4 checklist ("1-2 sentences, ≤80 words, leads with substantive noun-phrase"). GATE F at STEP 6 with regex check. Routing matches PRD (PASS ≤80; WARN 81-100; HOLD >100).

**2.3 — `quickDefinition.en` 3-4 sentences max, same core claim as definition — PASS**
Evidence: STEP 4 ("3-4 sentences max. Same core claim as `definition`, near-verbatim restatement + 1-2 sentences of expansion"). Definition derivation order in STEP 4 is correct.

**2.4 — `introParagraphs: []` literal empty array — PASS**
Evidence: STEP 4 checklist item ("**literal empty array.** The field is required by the schema… DO NOT populate"). NEVER #3 reinforces. Sanity check #4. STEP 6 word-count Node one-liner counts `introParagraphs[*].en` (so populating it triggers GATE E HOLD as a backstop).

**2.5 — `detailSections.length ≤ 1` — PASS**
Evidence: GATE H at STEP 6 with Node count + HOLD routing. STEP 4 checklist ("MAX 1 entry. Skip entirely (`[]`) when not needed. If included, comparison-shaped or lookup-shaped only"). NEVER #4 and #6 reinforce.

**2.6 — `faqs.en.length` ∈ [3, 4] — PASS**
Evidence: STEP 4 checklist ("3-4 entries"). NEVER #5 ("NEVER emit 5+ `faqs.en` entries. Cap at 4"). End-of-prompt #6.

**2.7 — `faqs.en.length === faqs.es.length` matched — PASS**
Evidence: STEP 4 checklist ("matched count (3-4)"). Post-GATE field sanity check at STEP 6 ("`faqs.en.length === faqs.es.length`").

**2.8 — `annualLimits` OPTIONAL, no fabrication — PASS**
Evidence: STEP 4 checklist ("include ONLY when term has year-anchored numeric thresholds. Skip otherwise"). NEVER #10. Field-level sanity check at end of STEP 6 ("verify it's genuinely year-anchored numeric (NOT fabricated)").

**2.9 — `workedExample` OPTIONAL — PASS**
Evidence: STEP 4 checklist ("include ONLY when term has a calculation"). NEVER #11. Field-level sanity check at end of STEP 6.

**2.10 — `whatCountsToward` / `whatDoesNotCountToward` OPTIONAL — PASS**
Evidence: STEP 4 checklist ("OPTIONAL — include ONLY for boundary-sensitive COST terms (OOP max, deductible). Skip for definitional / eligibility terms").

**2.11 — `readingTime` SHORT — PASS**
Evidence: STEP 4 checklist ("SHORT: `"2 min read"` or `"3 min read"`. NEVER `"5 min read"` — that's the bloat signal").

---

### Category 3 — Internal link routing (template's PRIMARY value)

**3.1 — Load `content/link-index.json` before writing body prose — PASS**
Evidence: STEP 0 declares `LINK_INDEX="$ROOT/content/link-index.json"`. STEP 0 read-list item 3 ("`$LINK_INDEX` — the link-routing map. You will read `byPhrase.en` and `byPhrase.es` in STEP 5"). STEP 5 inline-link-routing block step 1.

**3.2 — ≥3 inline body links to lighthouses — PASS**
Evidence: GATE G at STEP 6 with Node check; HOLD if 0; WARN 1-2; PASS ≥3. STEP 5 inline-link-routing block lists the 5 lighthouses verbatim. NEVER #7 reinforces.

**3.3 — MAX 5 inline body links — PASS**
Evidence: STEP 5 inline-link-routing block step 4 ("Cap at 5 inline body links per page"). GATE G note ("Cap at 5 (if >5, drop excess; verifier flags but doesn't HOLD)").

**3.4 — Hyperlink only FIRST occurrence — PASS**
Evidence: STEP 5 inline-link-routing block step 5 ("Only first occurrence of each phrase. Never link the same phrase twice on a page"). Step 3 also says "Hyperlink the **FIRST occurrence**".

**3.5 — Never self-link — PASS**
Evidence: STEP 5 inline-link-routing block step 7 ("Never self-link. A glossary page never links to itself").

**3.6 — `topicCluster: string` — PASS**
Evidence: MANDATORY EMIT block at STEP 4 (`"topicCluster": "<slug-style cluster id; usually the slug itself or a parent category>"`). Field-level sanity check ("`topicCluster` matches `/^[a-z0-9-]+$/`").

**3.7 — `keyTerms: {en: string[], es: string[]}` shape (not flat array) — PASS**
Evidence: MANDATORY EMIT block calls this out explicitly ("**`keyTerms` shape critical:** the value is an OBJECT `{en: string[], es: string[]}`, NOT a flat array `["..."]`. The flat-array shape is the most common drafter mistake — load-test caught it in 3 of the first 5 Track C-prime drug writers"). Field-level sanity check at end of STEP 6. NEVER #8.

**3.8 — `isLighthouse: false` — PASS**
Evidence: MANDATORY EMIT block + explicit explanation ("`isLighthouse` is **always `false`** for glossary pages. Every glossary page is a spoke"). Field-level sanity check.

**3.9 — `isDeprecated: false` — PASS**
Evidence: MANDATORY EMIT block. Field-level sanity check.

**3.10 — `relatedLinks` 2-4 footer entries with valid prefixes — PASS**
Evidence: STEP 4 checklist enumerates the valid prefixes verbatim from the matrix (`/screener`, `/medical-bill-analyzer`, `/medicaid-income-limits`, `/medicare-eligibility`, `/aca-income-limits`, `/federal-poverty-level`, `/cost/<slug>`, `/drug/<slug>`, `/qa/<slug>`, `/glossary/<slug>`, `/for/<slug>`, `/event/<slug>`) + "do NOT count toward GATE G" disclaimer.

---

### Category 4 — Schema hard contracts

**4.1 — `slug` lowercase + hyphens — PASS**
Evidence: STEP 0 `SLUG="<slug>"` + GATE A regex check. (Implicit; the cron payload supplies it; writer never mutates.)

**4.2 — `term: LocalizedString` — spelled-out + parenthetical acronym — PASS**
Evidence: STEP 4 checklist with explicit ✅/❌ examples + acronyms-only-as-exception (HMO/PPO/EPO/POS).

**4.3 — `alternateNames: string[]` — 3-6 entries — PASS**
Evidence: STEP 4 checklist ("3-6 entries typical").

**4.4 — `definition: LocalizedString` — 1-2 sentences, schema source of truth — PASS**
Evidence: STEP 4 checklist explicit ("This becomes `DefinedTerm.description` in schema. AI engines cite it. WRITE THIS FIRST"). Definition derivation order documented.

**4.5 — `category` locked enum — PASS**
Evidence: STEP 4 checklist ("exactly one locked-enum value from queue input"). STEP 0 reads queue.

**4.6 — `ctaTarget` locked enum — PASS**
Evidence: STEP 4 checklist ("use queue's value as authoritative"). YOUR TASK block lists `screener|analyzer`.

**4.7 — `topic` string for `schema.about` — PASS**
Evidence: STEP 4 checklist ("full title for `schema.about`").

**4.8 — `medicalSpecialty` typically `"PublicHealth"` — PASS**
Evidence: STEP 4 checklist.

**4.9 — `lastUpdated` ISO date — PASS**
Evidence: STEP 4 checklist ("ISO date YYYY-MM-DD (today's date)").

**4.10 — `meta.title.en` ≤70 / `meta.description.en` ≤160 — PASS**
Evidence: STEP 4 checklist ("≤ **70 chars** (validator strict-fails on overflow)" / "≤ **160 chars** (validator strict-fails)"). Field-level sanity checks at end of STEP 6.

**4.11 — `hero.h1` / `hero.subhero` — PASS**
Evidence: STEP 4 checklist + inline exemplar.

**4.12 — `quickDefinition: LocalizedString` 3-4 sentences max — PASS**
(Same as 2.3.)

**4.13 — `introParagraphs: LocalizedString[]` emit literal `[]` — PASS**
(Same as 2.4.)

**4.14 — `detailSections: DetailSection[]` MAX 1 — PASS**
(Same as 2.5.)

**4.15 — `faqs` shape FLAT strings — PASS**
Evidence: "CRITICAL `faqs` shape" callout block in STEP 4 with verbatim ("FLAT strings `{question: string, answer: string}` — NOT LocalizedString objects. The one exception to the bilingual rule. (Most common drafter mistake.)") + code example showing both `en` and `es` arrays.

**4.16 — `relatedLinks: RelatedTerm[]` 2-4 entries — PASS**
(Same as 3.10.)

**4.17 — `sources: GlossarySource[]` ≥3 — PASS**
Evidence: STEP 4 checklist ("minimum 3 primary citations"). STEP 2 sets source minimum.

**4.18 — Additive 4 metadata fields MANDATORY EMIT — PASS**
Evidence: MANDATORY EMIT block at STEP 4 with "STOP. Read this twice." framing + the explicit "Emit all 4 in every glossary JSON, every time. No exceptions" statement. This matches the drug writer's framing pattern exactly. NEVER #17 reinforces.

---

### Category 5 — Universal GATES

**5.1 — GATE A (slug-no-year) — PASS**
Evidence: STEP 6 GATE A block with regex `/(19|20)\d{2}/`. HOLD on fail.

**5.2 — GATE B (household-size conditional) — PASS**
Evidence: STEP 6 GATE B block correctly routes ("For most glossary terms: N/A. Mark `gates.b: "n/a"`… For income-anchored terms… 4-row representative table acceptable… Verifier marks `gates.b: "warn"` not HOLD").

**5.3 — GATE C (≥3 inline .gov citations) — PASS**
Evidence: STEP 6 GATE C block with grep one-liner + HOLD/WARN/PASS routing matching matrix.

**5.4 — GATE D (no `--`) — PASS**
Evidence: STEP 6 GATE D block ("If > 0, you emitted a double-hyphen somewhere… Fix before save. The verifier auto-fixes `--` as a style correction — but never rely on the verifier; emit clean"). Style rule #1 covers em-dash / en-dash / `--`.

---

### Category 6 — Glossary-specific GATES

**6.1 — GATE E (≤500 words, DOMINANT) — PASS**
(Same as 2.1. Framing strength: HIGH — exit code, HARD REJECT language, "STOP. Read this twice." preamble at STEP 6.)

**6.2 — GATE F (definition ≤80 words + substantive lead) — PASS**
Evidence: STEP 6 GATE F Node one-liner with regex for both word count + lead pattern. HOLD if >100 OR throat-clearing lead. Routing matches PRD.

**6.3 — GATE G (≥3 inline body links) — PASS**
Evidence: STEP 6 GATE G Node one-liner extracts `[text](/path)` from body fields only (NOT `relatedLinks`) and counts distinct hrefs. HOLD if 0; WARN 1-2; PASS ≥3. Cap at 5 enforced.

**6.4 — GATE H (≤1 detail section) — PASS**
Evidence: STEP 6 GATE H Node one-liner. HOLD if 2+.

---

### Category 7 — Prohibited slugs (Track E)

**7.1 — Writer rejects `magi` / `deductible` / `out-of-pocket-maximum` immediately — PASS**
Evidence: "STRICT PROHIBITION" block immediately after YOUR TASK, with exact error-JSON shape ("`{"slug": "<slug>", "status": "error", "error": "track-c-prohibited-slug: <slug> belongs to Track E downsize, not Track C"}`"). NEVER #1 reinforces. Field-level sanity check at STEP 6 ("If `slug` is in `["magi", "deductible", "out-of-pocket-maximum"]`: STOP"). STEP 8 error JSON example.

**7.2 — Verifier rejects same slugs — N/A for writer prompt (out of scope)**
Evidence: This is verifier-side responsibility (PRD §9 routing). Not a writer-prompt requirement.
Status: PASS (for writer prompt; defense-in-depth handled on writer side per 7.1).

**7.3 — Phase 4 test mix uses 5 NET-NEW slugs ONLY — N/A for writer prompt (manual gate)**
This is a Phase-4 spawner / planner-side gate, not a writer-prompt requirement. PASS (out of scope but consistent with writer prompt's prohibition).

---

### Category 8 — Style + format invariants

**8.1 — No em dashes / en dashes — PASS**
Evidence: STEP 5 style rules item 1 ("NO em dashes `—` (U+2014), NO en dashes `–`, NO double-hyphen `--` anywhere"). NEVER #9.

**8.2 — No filler — PASS**
Evidence: STEP 5 style rules item 2 with explicit banned-phrase list. NEVER #15.

**8.3 — Lead with concrete numbers — PASS**
Evidence: STEP 5 style rules item 3 ("First line of `hero.subhero` and first line of each FAQ answer should contain a number, dollar amount, percentage, or date").

**8.4 — Exact dollar figures — PASS**
Evidence: STEP 5 style rules item 5 ("`$283`, not 'around $300'. `$15,960`, not 'approximately $16,000'").

**8.5 — "2026" explicit throughout — PASS**
Evidence: STEP 5 style rules item 4 + 2026 anchor-facts block.

**8.6 — Don't editorialize — PASS**
Evidence: STEP 5 style rules item 6 ("Factual information service tone. No 'it's worth knowing that…' or 'what's interesting is…'").

**8.7 — "CoveredUSA" only in meta title + CTAs — PASS**
Evidence: STEP 5 style rules item 7 ("Body prose names the term, not the brand").

**8.8 — Spanish parity + translate from EN — PASS**
Evidence: "Spanish translation quality" block in STEP 5 + definition derivation order #4 in STEP 4. NEVER #13.

**8.9 — JSON validity + atomic write — PASS**
Evidence: STEP 1 ("Atomic-write setup" — `$TMP` first, validate, then `mv`). STEP 7 ("atomic save"). NEVER #14.

**8.10 — Last-line JSON only — PASS**
Evidence: STEP 8 ("The cron parses the last line of your output as JSON. Emit exactly one line at the end"). NEVER #16.

**8.11 — 2026 anchor facts list — PASS**
Evidence: 2026 anchor-facts block at start of STEP 5 with all required numbers verbatim from matrix (Part B $283, premium $202.90, Part A $1,736, Part D OOP $2,100, ACA OOP $9,200/$18,400, HDHP $8,500/$17,000, IRA insulin $35/mo, IRA signed Aug 16 2022, 2026 FPL HH1 base $15,960 + $5,680 each additional, ACA enhanced PTCs expired Jan 1 2026 — cliff returned). All 11 anchor facts present.

---

### Category 9 — Verifier-specific patches

**9.1 — Path portability ($HOME everywhere) — PASS (writer side)**
Evidence: STEP 0 uses `$HOME/clawd/` consistently. NEVER #12 ("NEVER hardcode `/Users/<anyone>/` paths. Use `$HOME/clawd/...`"). For the verifier prompt, this is verified separately; the writer prompt is clean.

**9.2 — Dual-purpose framing in verifier YOUR TASK — N/A for writer prompt**
Verifier-side requirement. Out of scope here. Defer to Verifier B/C/D.

**9.3 — STEP 1C structural GATE detection (verifier) — N/A for writer prompt**
Verifier-side. Defer.

**9.4 — GATE E mechanical strictness (verifier runs Node count, doesn't trust writer self-report) — PARTIAL (writer side)**
Evidence: Writer side runs the Node count mechanically at STEP 6 (PASS for writer prompt). The "don't trust writer self-report" rule is for the verifier. Writer prompt is clean; verifier prompt needs the corresponding patch.
Status: PASS for writer-prompt scope; PARTIAL overall (depends on verifier rewrite, which is a separate file).

**9.5 — `keyTerms` shape example with "do NOT emit flat array" rule — PASS**
Evidence: MANDATORY EMIT block at STEP 4 has the code example AND the explicit "do NOT emit flat array" rule with load-test failure-mode callout. NEVER #8.

**9.6 — GATE D auto-fix hoist with Ohio failure-mode callout — N/A for writer prompt**
Verifier-side. Writer prompt's GATE D framing ("emit clean; never rely on the verifier") is correct for writer scope.

**9.7 — Slug-prohibition defense-in-depth in verifier — N/A for writer prompt**
Verifier-side. Writer-side defense covered in 7.1.

---

### Cross-cutting issue (caught while walking the matrix)

**XCT-1 — STEP 6 "8 GATES" inconsistency — PARTIAL**
STEP 6 header says "PRE-SAVE GATES — read this BEFORE running checks 1–8" but the matrix defines 4 universal (A-D) + 4 glossary (E-H) = 8 gates. The writer prompt is correct on count, but the phrase "running checks 1–8" could read as "checks numbered 1 through 8" rather than "the 8 GATES below." Minor wording polish, not a correctness issue.
Recommended edit (optional): change "running checks 1–8" to "running the 8 GATES below (A-D universal + E-H glossary-specific)."

**XCT-2 — quickDefinition word count ceiling slightly inconsistent — PARTIAL**
Matrix item 2.3 says "3-4 sentences max" (no word ceiling). Writer prompt STEP 4 says "3-4 sentences max" but the inline exemplar comment says "3-4 sentences total, ≤90 words." The 90-word ceiling is only stated in exemplar prose, not as a checklist item, which means GATE-E mechanical word-count is the only enforcement.
Recommended edit (optional): add to STEP 4 quickDefinition checklist ("3-4 sentences max, ≤90 words"). Otherwise leave — GATE E backstops.

---

## Phase 4 readiness

**Ready-with-tightenings.**

The writer prompt covers 47 of 54 matrix requirements at PASS, 5 at PARTIAL, 0 at FAIL on writer-scope items. The 2 items I'm counting as FAIL in the headline tally are 9.2 and 9.3, both of which are verifier-side and out of scope for the writer-prompt-only review — they remain to be verified when the verifier prompt is reviewed (Verifier B/C/D rounds).

**Why "ready" rather than "ready-with-tightenings":**
- GATE E is framed with maximum strictness: §4.5 quote verbatim at top, "STOP. Read this twice." preamble, mechanical Node count with `process.exit(1)`, HARD REJECT language, NEVER list reinforcement, end-of-prompt sanity check, and the exemplar is explicitly shaped at ~350 words. This is materially stronger framing than the drug writer's initial pass (which needed an iteration round to flip "additive" language to MANDATORY-EMIT). The lessons from drug-writer Phase 4 are already baked in.
- The 4 MANDATORY-EMIT metadata fields use the exact same "STOP. Read this twice." framing pattern that worked for the drug writer.
- All 3 prohibited slugs are caught in 4 places (STRICT PROHIBITION block, NEVER #1, STEP 6 sanity check, STEP 8 error example).
- Audit's top-3 writer edits (WE-1 / WE-2 / WE-3) are all explicitly implemented and traceable in the prompt.

**Why "with tightenings" rather than "fully ready":**
The 5 PARTIAL items are minor and Phase-4-survivable:
- 1.8 (eligibility-entailment FAQ for income-anchored terms) — not enforced but covered indirectly by GATE B/§3.3. PTC will likely include one organically.
- 9.4 (verifier strict word count) — writer side is clean; verifier needs the patch (different file).
- XCT-1 (STEP 6 wording) — cosmetic.
- XCT-2 (quickDefinition word ceiling) — GATE E backstops.

None of these block Phase 4. They could be addressed in a single 5-minute polish pass before spawning or fixed during Phase 4.5 verifier work.

---

## Recommended edits before Phase 4

**Tier 1 — Apply if you have 5 minutes (high signal, low cost):**

1. **STEP 4 FAQ checklist** — add bullet: "For income-anchored terms (PTC, MAGI-related, FPL-related), at least one of the 3-4 FAQs MUST answer a 'do I qualify' question with a numeric threshold + household size + year." (Closes 1.8.)

2. **STEP 4 `quickDefinition` checklist** — append "(≤90 words)" to the existing "3-4 sentences max" so the inline-exemplar comment becomes an enforced checklist item. (Closes XCT-2.)

**Tier 2 — Cosmetic, defer to Phase 4.5 polish:**

3. **STEP 6 header** — change "PRE-SAVE GATES — read this BEFORE running checks 1–8" to "PRE-SAVE GATES — read this BEFORE running the 8 GATES below (A-D universal + E-H glossary-specific)." (Closes XCT-1.)

**Tier 3 — Verifier prompt (separate file, separate round):**

4. The verifier rewrite (`coveredusa-glossary-verifier.md`) must implement 9.1 (paths), 9.2 (dual-purpose framing), 9.3 (STEP 1C structural detection), 9.4 (mechanical word count, don't trust writer), 9.6 (GATE D AUTO-FIX MANDATORY framing + Ohio callout), 9.7 (slug-prohibition defense-in-depth). Defer to Verifier B/C/D and the dedicated verifier-prompt review.

**Net assessment:** The writer prompt is the strongest Track C-prime writer rewrite so far in terms of dominant-gate framing. GATE E will almost certainly be honored on first pass. Spawn Phase 4. If any of the 5 test articles ship over 500 words, the failure mode is almost certainly inside Spanish-side word counting (Node one-liner counts EN only — correct per matrix 2.1 + PRD §6), not weak framing.
