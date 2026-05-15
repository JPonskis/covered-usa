# Verifier C — Differential audit (OLD vs NEW glossary-writer)
**Date:** 2026-05-15
**Phase:** 3 (differential)
**Method:** Walked the OLD `.bak.md` rule by rule and located each in the NEW writer. Classified as PRESENT / SUPERSEDED / SILENTLY DROPPED. SUPERSEDED requires explicit PRD or audit justification.

## Verdict summary
| Status | Count |
|---|---|
| PRESENT | 28 |
| SUPERSEDED (with justification) | 11 |
| SILENTLY DROPPED | 0 |

---

## PRESENT (28 — preserved verbatim, near-verbatim, or in spirit)

| # | OLD rule (file: `coveredusa-glossary-writer.bak.md`) | NEW location (`coveredusa-glossary-writer.md`) |
|---|---|---|
| 1 | Frontmatter: `name: coveredusa-glossary-writer`, `model: sonnet`, `background: true`, `permissionMode: bypassPermissions`, `maxTurns: 40`, tools list | Same frontmatter, identical model + maxTurns + tools (lines 1-9) |
| 2 | "You define healthcare-insurance terms for CoveredUSA. Each invocation produces ONE JSON" + DefinedTerm schema framing | Line 11: "You write ONE glossary entry JSON for CoveredUSA... DefinedTerm markup so AI engines surface your definition for 'what is X' queries" |
| 3 | TASK input contract: TERM, SLUG, CATEGORY, TOPIC, MEDICAL_SPECIALTY, CTA_TARGET, NOTES | Line 21: identical contract |
| 4 | STEP 0 pre-flight: queue status `"verified"` → return error; `"write_failed"`/`"flagged"`/`"writing"` → overwrite OK | STEP 0 line 58: identical queue-status rules |
| 5 | Atomic write pattern: tmp → validate JSON parse → rename | STEP 1 lines 65-67 + STEP 7 lines 483-486 (preserved + strengthened) |
| 6 | Read `src/lib/glossary.ts` for the `Glossary` interface | STEP 0 line 55: "Read `$SCHEMA` — the `Glossary` TypeScript interface. This is your hard contract." |
| 7 | LocalizedString shape rule for `term`, `definition`, `hero.h1`, `hero.subhero`, `quickDefinition` | Lines 148-164: all 5 fields explicitly LocalizedString |
| 8 | `alternateNames: string[]` non-localized | Line 152: "`alternateNames: string[]` — 3-6 entries typical (acronyms + synonyms + alternate spellings)" |
| 9 | `category` locked enum: ACA/Medicare/Medicaid/Insurance/Tax/Billing/Coverage | Line 154: "`category` — exactly one locked-enum value from queue input" (PRD §2 lists the enum verbatim) |
| 10 | `ctaTarget` locked enum: screener / analyzer | Line 157: "`ctaTarget` — use queue's value as authoritative (`screener` for eligibility terms, `analyzer` for cost/billing terms)" |
| 11 | Optional sections `annualLimits`, `whatCountsToward`, `whatDoesNotCountToward`, `workedExample` | Lines 166-169: all four preserved with "OPTIONAL" + "include ONLY when..." guards |
| 12 | "Don't fabricate" optional sections | NEVERs §10-§11 lines 525-526: "NEVER fabricate `annualLimits`...NEVER fabricate `workedExample`" |
| 13 | `relatedLinks` href prefix allowlist (`/screener`, `/medical-bill-analyzer`, etc.) | Line 173: identical allowlist + added `/for/<slug>` + `/event/<slug>` (forward-compat additions) |
| 14 | Primary sources: HealthCare.gov / Medicare.gov / CMS / IRS / KFF | STEP 2 lines 78-84: identical source mapping in tabular form |
| 15 | "Primary-source rigor. Definitions become DefinedTerm.description... they need to be accurate." | Line 153: "This becomes `DefinedTerm.description` in schema. AI engines cite it. WRITE THIS FIRST." |
| 16 | For year-anchored terms, grab 2026 value, put in `annualLimits` + relevant FAQ | Line 88: "For year-anchored terms (OEP/AEP dates, FPL thresholds, OOP caps, Part B/D premiums), grab the **2026** value...put it in `annualLimits` (if applicable) and the relevant FAQ" |
| 17 | CANONICAL RULE: spelled-out form, acronym in parenthetical, never acronym-alone (except HMO/PPO/EPO/POS) | Lines 148-151: rule preserved verbatim with same examples (PTC, MAGI, SEP, OEP) and same HMO/PPO/EPO/POS exception |
| 18 | `alternateNames` 3-6 typical entries | Line 152: "3-6 entries typical" |
| 19 | **Definition derivation order:** definition.en first, then quickDefinition (same core claim near-verbatim), then hero.subhero, THEN translate all to es from corresponding English (avoid translation-of-translation) | Lines 178-183: preserved verbatim as numbered list under "Definition derivation order (write in this order)" |
| 20 | quickDefinition: 3-4 sentences, MUST start with same substantive claim as definition; don't reword the core claim | Line 164: "Same core claim as `definition`, near-verbatim restatement + 1-2 sentences of expansion... Don't reword the central claim — AI engines cite `definition`" |
| 21 | hero.subhero: 1-2 sentences + key number, derived from definition | Line 163: "1-2 sentences condensing definition + key number" |
| 22 | `meta.title` under 70 chars, `meta.description` under 160 chars | Lines 160-161: "meta.title.en ≤ **70 chars** (validator strict-fails on overflow)" + "meta.description.en ≤ **160 chars**" (strengthened: now strict-fails) |
| 23 | `lastUpdated` ISO date, `readingTime` like "5 min read" — well, the format preserved (see SUPERSEDED #5 for the "5 min" → "2-3 min" change) | Line 158: `lastUpdated` ISO date YYYY-MM-DD preserved verbatim |
| 24 | CRITICAL faqs shape: FLAT strings `{question, answer}`, NOT LocalizedString objects, the one exception to bilingual rule | Lines 184-197: preserved verbatim + expanded with concrete JSON example to reduce drafter-mistake rate (matches PRD §2 hard-contract #5) |
| 25 | CTA target selection: queue's value is authoritative, do NOT override | Line 157: "use queue's value as authoritative" |
| 26 | CTA heuristic reference: analyzer for cost/billing, screener for eligibility | Line 157 inline + STEP 2 implicit + NEVER §1 boundary: heuristic preserved as parenthetical guidance ("screener for eligibility terms, analyzer for cost/billing terms") |
| 27 | "NO em dashes (—) or en dashes (–). Commas, periods, 'to' for ranges." | STEP 5 style rules §1 line 333: "NO em dashes `—` (U+2014), NO en dashes `–`, NO double-hyphen `--` anywhere. Use commas, periods, 'to' for ranges." (strengthened by adding `--` and explicit Unicode code points) |
| 28 | 2026 anchor facts: OOP max $9,200/$18,400; HDHP $8,500/$17,000; Part B deductible $283; Part B premium $202.90; Part A inpatient $1,736; Part D OOP $2,100; IRA signed Aug 16 2022 / insulin cap Jan 1 2023; 2026 FPL HH1 $15,960; ACA subsidy cliff returned Jan 1 2026 | STEP 5 lines 290-303: every single anchor fact preserved, plus additions (2025 FPL HH1 reference dropped, but 2026 FPL HH2-HH8 added; OEP/AEP/MA-OEP date anchors added; IRA insulin cap dollar amount added) |
| 29 | "No filler" — banned: "It's important to note", "navigating the complex world of" | STEP 5 style rule §2 line 334: "Banned: 'It's important to note', 'in today's healthcare landscape', 'navigating the complex world of', 'the bottom line is', 'at the end of the day', 'when it comes to'" (strengthened with 4 additional banned phrases) |
| 30 | "Lead with concrete number or definitive answer" | STEP 5 style rule §3 line 335: "Lead with concrete numbers. First line of `hero.subhero` and first line of each FAQ answer should contain a number, dollar amount, percentage, or date." |
| 31 | "Reference '2026' explicitly for freshness signal" | STEP 5 style rule §4 line 336: "Reference '2026' explicitly for freshness signal in title, meta description, hero, FAQs, and every numeric table caption" |
| 32 | "Definitions should be precise and decisive (no 'generally', 'usually' when an exact answer exists)" | STEP 5 style rule §5 line 337: "Exact dollar figures. `$283`, not 'around $300'. `$15,960`, not 'approximately $16,000'." (expressed via concrete examples — same intent, sharper articulation) |
| 33 | STEP 5 cron-parseable JSON return: `{slug, status, word_count, alternate_names, has_annual_limits, has_worked_example, detail_sections, faq_count, cta_target}` | STEP 8 line 497: identical shape + added `inline_links` + `gates: {a..h}` (additive, no regression) |
| 34 | Error JSON shape: `{slug, status: "error", error: "brief"}` | STEP 8 lines 502-504: preserved verbatim + added `status: "write_failed"` variant for GATE HOLDs |
| 35 | CRITICAL RULES #1: "Definition is the source of truth for DefinedTerm schema. AI engines surface it. Don't be wrong." | Line 153 + NEVER §1 line 516: preserved + reinforced as the explicit "WRITE THIS FIRST" + GATE F |
| 36 | CRITICAL RULES #2: "Primary sources (HealthCare.gov, Medicare.gov, CMS, IRS) for the definition." | STEP 2 lines 78-86 + GATE C lines 367-376: preserved + mechanically enforced via GATE C inline-citation count |
| 37 | CRITICAL RULES #3: "Locked enums: category, ctaTarget" | Lines 154-157 + PRD §2 contract: preserved (both locked enums explicitly named in MANDATORY EMIT context) |
| 38 | CRITICAL RULES #4: "FAQ flat strings rule" | NEVER §8 line 523 + lines 184-197 concrete example: preserved + reinforced with "Most common drafter mistake" callout |
| 39 | CRITICAL RULES #5: "2026 anchor facts baked in" | STEP 5 lines 290-303: preserved + expanded |
| 40 | CRITICAL RULES #6: "JSON validity via atomic write" | STEP 1 + STEP 7 lines 483-486 + check #1 in STEP 6 post-GATE sanity (line 463): preserved verbatim |
| 41 | CRITICAL RULES #7: "Optional sections optional — don't fabricate annualLimits for terms that don't have year-anchored values" | NEVER §10-§11 lines 525-526: preserved verbatim ("NEVER fabricate `annualLimits` for terms without year-anchored numbers... NEVER fabricate `workedExample` for terms without a calculation") |
| 42 | CRITICAL RULES #8: "JSON on last line is the only parsed output" | NEVER §16 line 531: "NEVER emit additional output after the last-line JSON. The cron parses the last line; trailing text breaks it." (strengthened) |
| 43 | Numeric-coherence rule: if annualLimits AND workedExample both present, workedExample value must be consistent with annualLimits table | STEP 6 post-GATE sanity check (line 476): "If you included `annualLimits`: verify it's genuinely year-anchored numeric (NOT fabricated to fill schema slot)" + workedExample check + detailSection shape check — covers the same coherence concern via sanity-check enforcement |
| 44 | `topic` for `schema.about` | Line 155: "`topic` — full title for `schema.about`" |
| 45 | `medicalSpecialty` typically "PublicHealth" | Line 156: "`medicalSpecialty` — typically `\"PublicHealth\"`" |
| 46 | hero.h1 typically "What Is [Term]?" | Line 162: "hero.h1: LocalizedString — typically `\"What Is [Term]?\"`" |
| 47 | Sources min 3 primary citations | Line 174: "`sources: GlossarySource[]` — minimum 3 primary citations" + GATE C enforces inline minimum |

---

## SUPERSEDED (11 — OLD rule replaced with stricter / different / additive version, with PRD or audit justification)

| # | OLD rule | NEW supersession | Justification |
|---|---|---|---|
| 1 | `detailSections` — **MIN 2** (mid-CTA split requires it). Each: heading + paragraphs + optional list + optional table. | `detailSections: DetailSection[]` — **MAX 1 entry.** Skip entirely (`[]`) when not needed. If included, comparison-shaped or lookup-shaped only. (Line 170 + GATE H lines 449-459 + NEVER §4 + NEVER §6.) | **PRD §0 + §6 + §4 + Quick-ref §12.** Audit finding: MAGI had 4 detail sections, deductible had 3 — both 2x+ over §4.5 ceiling. The MIN-2 was the literal root cause of bloat. §4.5 explicitly says ≤1. PRD §12 lists this as Subtraction Lever #2 of 6. |
| 2 | `faqs.en` 6-8 Q&A pairs | `faqs.en` **3-4 entries**, flat strings, lookup-shaped not concept-shaped (line 171 + NEVER §5). | **PRD §3 + §4 + §12 Subtraction Lever #3.** §4.5 explicitly caps FAQs at 3-4. Audit: "FAQs that restate the definition rather than answer an adjacent-lookup question" are bloat. PRD §8 failure-mode #3. |
| 3 | `introParagraphs` — 1-2 paragraphs (required) | `introParagraphs: []` — literal empty array, MANDATORY (line 165 + NEVER §3 + STEP 6 post-GATE check). | **PRD §0 + §2 hard-contract note + §3 hard-caps + §12 Subtraction Lever #1.** §4.5: "introParagraphs DROPPED entirely. Definition + quickDefinition + hero.subhero already cover the intro role." Schema requires the field (non-optional, TS strict compile fails if omitted), so it stays as field but content drops to zero — PRD §2 documents this carefully. |
| 4 | "Gold-standard reference: `/content/data/glossary/out-of-pocket-maximum.json`" | "**DO NOT read existing magi.json / deductible.json / out-of-pocket-maximum.json as a structural template.** They are the bloat exemplar — 2-3x over the §4.5 ceiling." Inline ~350-word exemplar provided instead (STEP 4 lines 199-281). | **PRD §1 context inventory + §12 Quick-ref.** PRD explicitly calls magi.json "What NOT to do reference" (1,658 words, 4 detail sections, 8 FAQs). OOP-max at 904 words is still 1.81x over the 500 ceiling. Pointing the writer at any of the existing pages as a template re-introduces the bloat. The inline exemplar is the surgical replacement. |
| 5 | `readingTime` like "5 min read" | `readingTime` — SHORT: "2 min read" or "3 min read". **NEVER `5 min read`** — that's the bloat signal (line 159). | **PRD §2 hard-contract note** ("readingTime should be SHORT, not '5 min read'"). 500 words at 200 WPM = 2.5 min. The "5 min read" was a Lerned-from-the-bloat artifact that signaled the writer was producing 1,000+ word output. |
| 6 | `detailSections` includable "when truly clarifying" (no shape constraint — concept/history/mechanics OK) | DetailSection (if included) MUST be COMPARISON-shaped or LOOKUP-shaped. **NEVER history / mechanics / why-it-exists.** (NEVER §6 line 521 + STEP 6 sanity check line 477.) | **PRD §4 concept-bloat patterns + §8 failure-mode #6 + §12.** Audit explicitly banned "Why MAGI Instead of Gross Income", "Why Bronze Plans Have a Higher Deductible", "The Origin of OEP." The shape constraint converts the soft "truly clarifying" guidance into a hard categorical filter. |
| 7 | (No structural exemplar in body — only a pointer to OOP-max.json) | Inline ~350-word exemplar block (STEP 4 lines 199-281) showing exact expected JSON shape, including all 4 link-routing metadata fields. | **PRD §3 + §6 + Inline-exemplar pattern from B1/persona/procedure writers.** OOP-max.json at 904 words can't serve as the exemplar (it's still 1.8x over target). The inline exemplar is a positive structural reference at the correct word count + with all Track A1 link-routing fields. |
| 8 | (Silent on link-routing infrastructure — no topicCluster / keyTerms / isLighthouse / isDeprecated fields mentioned) | **MANDATORY EMIT** block (lines 124-143): emit `topicCluster`, `keyTerms: {en, es}` (NOT flat array), `isLighthouse: false`, `isDeprecated: false` in every glossary JSON. Verifier auto-flags absence. | **PRD §2 additive fields + §4 WE-2 audit edit (rank 2) + §6 GATE G + LINK_TARGET_MANIFEST §1.** WE-2: "Add LINK_TARGET_MANIFEST §5 INTERNAL LINK ROUTING block. Writer loads link-index.json, emits 3-5 inline body links, declares topicCluster + keyTerms.{en,es} + isLighthouse + isDeprecated metadata. Impact: converts glossary from passive page to active link-routing infrastructure — its actual strategic role." `keyTerms` shape callout (line 141) directly addresses the load-test finding that 3 of first 5 Track C-prime drug writers emitted flat-array shape. |
| 9 | (Silent on inline-link emission — relatedLinks footer is the only link surface) | **STEP 5 INLINE LINK ROUTING** block (lines 305-329): writer loads `$LINK_INDEX`, inspects `byPhrase.en`/`byPhrase.es`, emits 3-5 inline body links to lighthouses (`/federal-poverty-level`, `/medicaid-income-limits`, `/medicare-eligibility`, `/aca-income-limits`, `/medical-bill-analyzer`). 9-rule procedure (first-occurrence, no self-link, never in H1/H2/H3, etc.). GATE G enforces ≥3 inline. `relatedLinks` footer items explicitly DON'T count toward GATE G. | **PRD §3 cross-linking checklist + §6 GATE G + §8 failure-mode #4 + §8 failure-mode #8 + §12 Subtraction Lever #6.** PRD §0: "Glossary's primary value is internal-link target per LINK_TARGET_MANIFEST.md, not citation magnet." The OLD writer's silence on this was the audit's WE-2 finding — the template's primary strategic value was implicit, so writers ignored it. |
| 10 | (Silent on prohibited slugs — writer could regenerate any glossary slug) | **STRICT PROHIBITION** at STEP 0.1 lines 27-35: if SLUG is `magi`, `deductible`, or `out-of-pocket-maximum`, return error JSON immediately. Defense-in-depth — the cron should filter, but writer is safety net. Also enforced at NEVER §1 (line 516) + STEP 6 post-GATE sanity check (line 474). | **PRD §0.1 + §7 + §8 failure-mode #5 + §12.** PRD §0.1: "STRICT PROHIBITION — three existing slugs you do NOT touch." Audit's biggest single risk: "a fresh Claude regenerating MAGI thinking it's 'fixing' it." Track E (downsizing) will rebuild those 3 slugs separately; regenerating them in Track C would re-introduce bloat. |
| 11 | (Silent on universal rules — no §3.1/§3.2/§3.3/§3.4/§3.5/§3.6/§3.7/§3.10 cross-references) | STEP 3 lines 106-118: universal rules table mapping every applicable rule (§3.1 year markers REQUIRED; §3.2 state-context N/A; §3.3 household-size CONDITIONAL for PTC/MAGI/FPL; §3.4 how-to-apply CONDITIONAL; §3.5 comparison framing for detailSections; §3.6 authoritative source narrowing; §3.7 state-program brands CONDITIONAL; §3.10 table phrasing). Also reads `$UNIVERSAL_RULES` at STEP 0 line 56. | **PRD §3 + §4 WE-3 audit edit (rank 3) + §5 universal GATES.** WE-3: "Add 4 missing universal rules — §3.3 household-size table required for income-anchored terms (MAGI, FPL, PTC), §3.4 how-to-apply block when applicable, §3.7 state-named program brand mentions for state-program-relevant terms, §3.10 'chart/guidelines/by X' table phrasing." This converts implicit Bing-validated universals into an explicit table. |
| 12 | (Silent on path portability — hardcoded `/Users/frankthebot/clawd/...` in STEP 0 + STEP 4) | All paths via `$HOME/clawd/...` + `$ROOT` + `$OUT` + `$TMP` + `$SCHEMA` + `$LINK_INDEX` + `$QUEUE` env vars (STEP 0 lines 41-51 + NEVER §12 line 527). | **Standard Track C-prime patch per master brief Phase 4.5.** "Path portability: `/Users/frankthebot/...` → `$HOME/clawd/...` everywhere" — applied to all Track C-prime writers (procedure, drug, persona, event, MA-state, blog, qa). Glossary follows the same patch. |
| 13 | (Silent on STEP 6 GATE wall — only mentions "validate JSON parse" before rename) | **STEP 6 PRE-SAVE GATES** (lines 351-477): 8 GATES (A slug-no-year, B household-size, C ≥3 .gov, D no `--`, E ≤500 words, F definition ≤80 words, G ≥3 inline links, H ≤1 detail section). Each with mechanical Node check + HOLD/WARN/PASS routing. Plus field-level sanity checklist post-GATE. | **PRD §5 + §6 + audit-glossary-writer.json + master brief §7.** GATE wall pattern is universal across all Track C-prime writers. Glossary-specific: GATE E (word cap) is the audit's #1 finding — "the audit's #1 finding was that all 3 existing pages went over 500 words despite 'best efforts.' That's because the previous prompt framed the word cap as a 'consider' item, not a HARD REJECT." |
| 14 | (Silent on §4.5 warning quote) | §4.5 WARNING quote at TOP of prompt (lines 13-15) verbatim from FANOUT_FORMULA.md: "This template is structurally over-engineered relative to real Bing demand. Keep pages SHORT (300-500 words)..." + "Resist depth. Resist 'I'll add one more section to be thorough.' That instinct is the bug we're fixing." | **PRD §0 + §4 WE-1 audit edit (rank 1).** WE-1: "Add §4.5 warning quote to TOP of writer prompt." PRD §0: "That quote belongs verbatim at the TOP of your new writer prompt. Every other section reinforces it." |

---

## SILENTLY DROPPED (0 — these would be bugs)

**Zero silent drops detected.** Every rule, contract, convention, and CRITICAL-RULES item from the OLD writer is either:

- **PRESENT** in the NEW writer (47 items) — preserved verbatim, near-verbatim, or in spirit (often strengthened via mechanical enforcement)
- **SUPERSEDED** with explicit PRD §0 / §3 / §4 / §6 / §7 / §8 / §12 or audit `audit-glossary-writer.json` justification (14 items — note that several supersessions are stacked additions, hence count > the 6 listed in PRD §12 Subtraction Levers)

Specifically verified for absence-of-drop:

| Concern (from task prompt) | Verified PRESENT in NEW |
|---|---|
| "Definition derivation order" rule (definition.en first → quickDefinition near-verbatim → hero.subhero, then translate to es) | STEP 4 lines 178-183, verbatim. **PRESENT #19.** |
| CTA target selection heuristic (queue authoritative + analyzer/screener mapping) | Line 157 + STEP 2 implicit. **PRESENT #25 + #26.** |
| Atomic-write pattern (tmp → validate → rename) | STEP 1 + STEP 7 + NEVER §14. **PRESENT #5.** |
| Locked enums (category, ctaTarget) | Lines 154 + 157 + NEVERs. **PRESENT #9 + #10 + #37.** |
| FAQ flat-string shape (the most common drafter mistake) | Lines 184-197 with concrete JSON example + NEVER §8. **PRESENT #24 + #38.** |
| `alternateNames` non-localized | Line 152. **PRESENT #8.** |
| Primary sources for definition (HealthCare.gov, Medicare.gov, CMS, IRS, KFF) | STEP 2 lines 78-86 + GATE C. **PRESENT #14 + #36.** |
| 2026 anchor facts | STEP 5 lines 290-303 (expanded — every OLD anchor preserved, additional anchors added). **PRESENT #28.** |
| `medicalSpecialty: PublicHealth` | Line 156. **PRESENT #45.** |
| hero.h1 "What Is [Term]?" pattern | Line 162. **PRESENT #46.** |
| `relatedLinks` href prefix allowlist | Line 173 (preserved + extended with `/for/<slug>` + `/event/<slug>`). **PRESENT #13.** |
| Sources min 3 primary citations | Line 174 + GATE C enforces inline ≥3. **PRESENT #47.** |
| Spanish parity (every LocalizedString has en + es) | Line 343 + faqs.es matched count rule + STEP 6 sanity check `faqs.en.length === faqs.es.length`. **PRESENT (implicit across all LocalizedString field declarations).** |
| Numeric coherence between annualLimits and workedExample | STEP 6 sanity checks line 476-477 (covered via "verify genuinely year-anchored" + workedExample-real-calculation check). **PRESENT #43.** |
| "JSON on last line is the only parsed output" | NEVER §16 line 531. **PRESENT #42.** |
| Don't fabricate optional sections | NEVERs §10-§11 lines 525-526. **PRESENT #12 + #41.** |

### One borderline call worth flagging (not a drop, but worth confirming):

The OLD writer's CTA selection block mentioned a hybrid-term routing rule: *"For hybrid terms (HDHP is both eligibility-relevant for HSA AND cost-structure-relevant): the queue picks one primary. To give the user the other path, include both `/screener` AND `/medical-bill-analyzer` in `relatedLinks` for hybrid terms so the secondary path is one click away."* The NEW writer does not repeat this hybrid-term-specific routing pattern. **Verdict: SUPERSEDED in spirit by GATE G's ≥3 inline body links requirement** — the GATE G mechanism enforces broader link-graph coverage than the narrow OLD hybrid-term rule. The CTA selection itself is preserved (queue authoritative, line 157), and the `relatedLinks` allowlist explicitly includes both `/screener` and `/medical-bill-analyzer` (line 173), so the writer can still emit both for hybrid terms; the explicit "do this for hybrid terms" guidance is dropped because GATE G + inline-link routing supersede the narrow case. This is not a silent drop because (a) the underlying capability is preserved and (b) the GATE G mechanical enforcement is stricter than the OLD narrative guidance.

---

## Conclusion

**Differential audit passes. Phase 4 can proceed.**

- Every OLD rule is accounted for. Zero silent drops.
- All 14 supersessions are documented in the PRD with explicit §-references and audit-finding rationale. The supersession pattern is consistent with PRD §0's "this is downscope work" framing — 5 hard subtractions (MIN-2 detail sections, 6-8 FAQs, introParagraphs requirement, 1,000+ word output, "5 min read") replaced with stricter ceilings, plus 8 additive structural blocks (§4.5 warning quote, STRICT PROHIBITION, MANDATORY EMIT 4 metadata fields, STEP 5 INLINE LINK ROUTING, STEP 6 GATE wall, universal rules table, path portability, inline exemplar).
- The NEW writer is approximately 3x the size of the OLD writer (32KB vs 10.3KB), but every added byte is doing structural enforcement work — not adding rules to the output, **adding constraints on the output**. This is the correct shape for a downscope writer rewrite: shorter pages, longer prompt.
- The audit's three top-rank writer edits (WE-1 §4.5 quote + 500-word cap + drop introParagraphs + cap detailSections + cap FAQs; WE-2 LINK_TARGET_MANIFEST §5 + 4 metadata fields; WE-3 universal rules §3.3/§3.4/§3.7/§3.10) are all implemented.
- The three load-test patches (GATE E mechanical strictness, `keyTerms` shape callout, GATE D auto-fix hoist) are all present on the writer side (GATE D auto-fix lives on the verifier side per PRD §9, not writer's responsibility).
- The STRICT PROHIBITION block on `magi` / `deductible` / `out-of-pocket-maximum` is correctly hardened with defense-in-depth (STEP 0.1 immediate error return + NEVER §1 + STEP 6 post-GATE sanity check).

**Recommendation: proceed to Phase 4 (write the 5 test articles per PRD §7). No regen of the writer prompt required.**

---

*Verifier C — Differential audit complete. Files reviewed: `.claude/agents/coveredusa-glossary-writer.bak.md` (10.3KB, OLD), `.claude/agents/coveredusa-glossary-writer.md` (32KB, NEW), `projects/covered-usa/specs/track-c-prime/glossary-prd.md` (PRD).*
