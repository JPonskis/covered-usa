# Track C-prime Persona Writer — Verifier B (cold fresh-eyes sketch)

**Phase:** 3 (3-verifier review)
**Role:** Design an ideal persona-writer prompt FROM SCRATCH without reading the new draft. Read only FANOUT_FORMULA + universal rules block + AI_OPTIMIZATION_FRAMEWORK + audit-persona-writer.json + master brief §5.X for persona.
**Goal:** Top-line structure + 3-5 most important things + gotchas.

---

## Top-line structure (2,000-word sketch)

A persona writer for CoveredUSA should be a 5,000-word prompt structured around STEP-numbered phases (cron parses STEP N headings for logging). Identity is "audience-anchored health-insurance researcher and writer." The cron passes a payload of PERSONA_NAME + SLUG + CATEGORY + TOPIC + MEDICAL_SPECIALTY + CTA_TARGET + NOTES with optional TOPIC_CLUSTER / FORMULA_RECIPE / UNIVERSAL_RULES fields. Output is ONE JSON file at `content/data/personas/<slug>.json` conforming to the `Persona` TypeScript interface.

The structure should be:

**STEP 0 — Load context (path-portable).** Use `$HOME/clawd` not hardcoded `/Users/frankthebot/`. Read in order: universal rules block (5 rules + state-program brand list); FANOUT_FORMULA §3 + §4.7; `personas.ts` interface; gold-standard reference page (`self-employed.json`); `link-index.json` if it exists.

**STEP 1 — Pre-flight + atomic-write setup.** Existence check against `_queue.json` (refuse to overwrite verified). Atomic write pattern: write to `<slug>.tmp.json` first; rename only after validity + gate checks pass. Define the LOCKED enum lists explicitly: CATEGORY ∈ {Self-Employment, Age / Life Stage, Employment Status, Family Status, Income Status, Veteran / Service}; CTA_TARGET ∈ {screener, analyzer}.

**STEP 2 — Research the persona.** Year-anchored, primary sources only. Cover all 8 §4.7 dominant Bing-validated shapes with the canonical primary source for each (HealthCare.gov for marketplace + PTC; IRS for tax forms + HSA; KFF for cost data; state agency for stipend programs). **Critically, embed a synonym discipline step here:** derive ≥5 distinct persona-related synonyms BEFORE drafting, list them in `keyTerms.en`, ensure each appears ≥2 times across body content. Include starter lists per common persona type (rideshare drivers / freelance consultants / college students / coverage-loss / early retirees / stay-at-home parents / veterans). Define required-vocabulary checklist of 8 canonical terms (PTC, HSA, FSA, Form 7206, 1099 contractor, Marketplace SEP, catastrophic plan, Section 1095-A) auto-validatable via grep.

**STEP 3 — Plan JSON structure.** This is where the 8 §4.7 shapes get expressed as required H2 / detailSection coverage with explicit mapping ("shape #2 PTC eligibility → dedicated `detailSection` 'Premium Tax Credit (PTC) eligibility for [persona] in 2026'"). Allow "N/A — explicitly stated in body" fallback for genuinely-inapplicable shapes (e.g., Form 7206 for college students). Required FAQ topics: 6-8 with the canonical Q pattern matching each shape. Apply RULE 1-5 with persona-specific rulings (RULE 1 N/A by default; RULE 2 CONDITIONAL income-gated; RULE 3 required; RULE 4 strict; RULE 5 ≥3 .gov).

**STEP 4 — Write frontmatter / top-level fields.** Required field checklist matching the `Persona` interface. STRICT 1-to-1 between `optionsOverview.rows.length` and `optionDetails.length` (validator HARD-rejects mismatch). FAQs are FLAT STRINGS, not LocalizedString — most common drafter mistake. Track C-prime additive fields: `topicCluster: "persona"`, `keyTerms` as `{en: [...], es: [...]}` OBJECT (NOT flat array — load-test patch), `isLighthouse: false`, `isDeprecated: false`. Embed the JSON shape template literally with "do NOT emit flat array" warning.

**STEP 5 — Write body content.** Style rules: no em-dash/en-dash/`--`; no filler; lead with concrete numbers; year-anchor everything; real facts only; pronoun discipline (no `It` / `They` / `This` / `These` / `Here` / `There` / `Such` paragraph openers); synonym discipline (≥5 distinct, each ≥2). 2026 anchor facts list with exact values (FPL hh-1 $15,960; 138% FPL $22,025; 400% FPL $63,840; HSA $4,400 self / $8,750 family; mileage $0.70/mi; ACA cliff BACK; 1099-K $5,000; SEP 60-day window; catastrophic <30 or hardship; Section 2714 age-out 26; IRA 2022). **CRITICAL Form 7206 + Schedule SE caveat phrasing requirement** — never write "reduces both income tax and SE tax." Required detailSection patterns: PTC eligibility, HSA/HDHP fit, SEP triggers, Form 7206 (Self-Employment only), state-stipend (gig/rideshare only). Spanish translation quality: idiomatic, not literal; use localized program names; keep IRS form numbers as English.

**STEP 6 — CRITICAL PRE-SAVE GATES.** "STOP. Read this twice." framing. 9 GATES:
- GATE A: slug no year (regex `\b(19|20)\d{2}\b`) — HOLD
- GATE B: household-size table 9 rows (CONDITIONAL for persona — required when income-gated; N/A for pure-status) — HOLD if income-gated and missing
- GATE C: ≥3 .gov/.edu/kff.org citations — HOLD if 0-1
- GATE D: zero `--` — AUTO-FIX (not HOLD)
- GATE E: synonym density ≥5 distinct each ≥2 occurrences — HOLD if <3 distinct
- GATE F: PTC eligibility detailSection present for marketplace-coverage personas — HOLD if absent
- GATE G: HSA/HDHP/FSA fit detailSection present + HSA/HDHP terms in body — ship + MEDIUM flag if absent (don't HOLD)
- GATE H: state-stipend section flag (LOW only — never HOLD)
- GATE I: Form 7206 + Schedule SE caveat (Self-Employment-category only) — HOLD on factual error "reduces both"

After GATES, run the 26-check field-level validation + JSON parse test.

**STEP 7 — Atomic save.** Rename tmp → final. Post-rename em-dash check (defense in depth).

**STEP 8 — Return JSON.** Single line. Includes: slug, status, word_count, option_details, options_overview_rows, traps_rows, detail_section_count, faq_count, cta_target, category, synonym_distinct_count, has_ptc_section, has_hsa_section, has_state_stipend_section, has_form_7206_caveat, topicCluster, keyTerms (object shape), isLighthouse, isDeprecated, gates object (9 keys a-i, each "pass"|"fail"|"warn"|"n/a"), gapsFlagged array.

**CRITICAL BOUNDARIES (NEVERs).** ~15 items covering: no fabricated facts; no "reduces both" Form 7206 error; no em-dashes; pronoun discipline; no "this guide covers" intro; no scam products; ACA cliff phasedown phrasing; HSA-FSA distinction; 2026 HSA limits ($4,400/$8,750 not 2025's $4,300/$8,550); synonym density; optionDetails/optionsOverview count match; Spanish parity; path portability; ctaTarget=screener default; never overwrite verified file.

---

## 3-5 most important things

1. **GATE E synonym density is the #1 lever.** The audit's single biggest finding was that the prior writer had ZERO synonym discipline and gig-workers.json had 0 mentions of "freelancer," "contractor," "rideshare driver," "sole proprietor." Without this gate, the page can only be retrieved by its exact slug term — AI engines can't surface it for adjacent queries. The fix is mechanical: declare ≥5 distinct synonyms in `keyTerms.en` + count occurrences in body. STRICT count check at STEP 6. HOLD if <3 distinct.

2. **GATE I Form 7206 + Schedule SE caveat is the #1 user-harm risk.** LLMs commonly emit "the self-employed health insurance deduction reduces both income tax and self-employment tax" — this is factually WRONG. The deduction (Form 7206 → Schedule 1 line 17) reduces INCOME tax only. SE tax (Schedule SE, 15.3%) is NOT reduced. Shipping the wrong version produces user financial harm. The writer must explicitly state the correct caveat; the verifier must HOLD on the wrong phrasing.

3. **8 §4.7 dominant shapes mapped to required H2 coverage with N/A fallback.** Old writer's `detailSections >= 2` was too soft — it let pages ship with PTC absent (no dedicated section), HSA absent (no mention at all), SEP absent (no enumeration of qualifying events). New writer maps each of 8 shapes to a specific render location with explicit "N/A — explicitly stated in body" fallback for shapes that genuinely don't apply to a given persona. STEP 6 GATEs F/G/H/I enforce.

4. **GATE B is CONDITIONAL for persona.** Income-gated personas (rideshare drivers, freelance consultants, recently lost coverage when income drops, income-status personas) need the 9-row household-size table. Pure-status personas (college students with parent coverage primary; early retirees Medicare-bound; veterans on TRICARE) don't. Conflating these produces either spurious HOLDs (over-strict on college students) or missed gates (under-strict on rideshare). The writer must decide per-persona and mark `gates.b: "pass" | "n/a"` accordingly.

5. **Pronoun discipline + introParagraphs[0] persona-anchored.** The gig-workers `introParagraphs[1]` opening "This guide covers..." is the canonical failure pattern flagged in the audit + MA-state audit + B1 audit. Writer must lead with the persona term, the program, a year, or a concrete noun. Never `It` / `They` / `This` / `These` / `Here` / `There` / `Such` as first word.

---

## Gotchas (specific to persona)

1. **Persona = identity. Event = moment. QA = question.** Don't restate. Every persona page MUST link to ≥1 `/event/<slug>` or `/qa/<slug>` for situational drill-down. The recently-lost-employer-coverage persona must link to `/event/just-lost-job-health-insurance`; the college-students persona to `/event/turning-26` (or similar).

2. **Catastrophic plan: under-30 OR hardship.** For college-students this is THE primary additional option. For over-30 self-employed without hardship, the writer must explicitly state ineligibility — that statement itself is the entailment fan-out shape #7.

3. **HSA vs FSA: most non-W-2 personas have NO FSA access.** FSA is employer-only + use-it-or-lose-it. HSA is portable + requires HDHP. Conflating these produces wrong advice. The writer must distinguish explicitly: "if you don't have an employer plan, FSA is N/A — only HSA applies."

4. **ACA cliff phrasing.** Never "below 400% FPL = subsidies" (binary). Use "subsidies phase down approaching 400% FPL and stop at 400%." The 2026 cliff is BACK (enhanced PTCs from ARPA/IRA expired January 1, 2026).

5. **MAGI for self-employed is AFTER business expenses, half-SE-tax, AND Form 7206 deduction.** A consultant with $90K gross 1099 income can easily land at MAGI $55-65K once deductions stack. This means PTC eligibility happens for many freelancers who think they "make too much." Writer must explain the MAGI projection mechanic explicitly for variable-income personas.

6. **State-stipend specifics matter.** California Prop 22: 15 engaged hours/week (not 10), quarterly stipend (not monthly), tied to ACA Bronze average. Massachusetts Question 3 of 2024 (not "Init 1 of 2023" — the 2024 ballot question). NY Freelance Isn't Free Act protects payment terms (24-hour late penalty + double damages) but does NOT provide healthcare. Fabricating these specifics is a verifier auto-fix or HOLD candidate.

7. **2026 HSA limits are $4,400 / $8,750.** 2025 was $4,300 / $8,550. Writer-training-data drift on this number is high — verifier should always cross-check Rev. Proc. 2024-25.

8. **`keyTerms` as flat array is the most-common Track C-prime drafter mistake.** Per master brief: MI + OH MA-state writers emitted flat arrays that triggered `content-quality.js` warnings. Embed the JSON shape template literally + "do NOT emit flat array" warning in the writer prompt. This applies just as much to persona as it did to MA-state.

9. **`optionDetails.length !== optionsOverview.rows.length` is the most-common persona-specific drafter mistake.** Writer adds a 5th optionDetails entry without a matching row, or vice versa. Validator catches at build but cron logs are noisy. STRICT count check at STEP 6.

10. **Spanish parity required everywhere except FAQ fields.** FAQ q/a are flat strings; everything else is LocalizedString {en, es}. Use idiomatic Spanish — "trabajador independiente" not "trabajador autónomo" for casual usage; "Crédito Fiscal de Prima" for PTC; keep IRS form numbers ("Formulario 7206") in English numeral.

---

## Where this sketch overlaps the actual new draft

Strong overlap (98%+) on structure: STEP 0-8 mapping, 9 GATES at STEP 6, NEVER list at end, additive fields, JSON return shape, atomic write pattern.

Strong overlap on substance: synonym discipline GATE E, Form 7206 + Schedule SE caveat GATE I, 8 shapes mapped, 2026 anchor facts, ACA cliff phrasing, state-stipend specifics, HSA/FSA distinction.

Minor differences (B's sketch slightly shorter on some sub-rules; doesn't enumerate `gapsFlagged` examples; doesn't include the `medicalSpecialty="PublicHealth"` reminder). These are non-blocking — the new writer's coverage is a superset of B's sketch.

**Conclusion: writer goes to Phase 4.**
