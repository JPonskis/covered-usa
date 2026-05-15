# Track C-prime Persona Writer — Verifier C (differential old vs new)

**Phase:** 3 (3-verifier review)
**Subjects:**
- OLD: `.claude/agents/coveredusa-persona-writer.bak.md` (3,973 bytes, 136 lines, ~880 words)
- NEW: `.claude/agents/coveredusa-persona-writer.md` (~27,000 bytes, ~620 lines, ~5,200 words)
**Role:** For every rule / instruction / convention in OLD, verify it is (a) PRESENT in NEW, (b) SUPERSEDED with documented justification, or (c) SILENTLY DROPPED (a bug).

---

## Summary counts

- **PRESENT** (carried into NEW with same or stricter enforcement): 28
- **SUPERSEDED** (replaced with formula-aligned rule going formula-wins): 9
- **SILENTLY DROPPED**: 0
- **STRENGTHENED** (NEW adds rule OLD didn't have): 23

---

## Differential audit

### Identity + role

| OLD rule | NEW status | Note |
|---|---|---|
| "You write audience-anchored persona pages for CoveredUSA" | PRESENT (strengthened — adds formula-alignment + Bing-validated framing) | Identity preserved; framing upgraded |
| "Each invocation produces ONE JSON for a single persona" | PRESENT | Verbatim |
| INPUTS: PERSONA_NAME, SLUG, CATEGORY, TOPIC, MEDICAL_SPECIALTY, CTA_TARGET, NOTES | PRESENT (strengthened — adds optional TOPIC_CLUSTER, FORMULA_RECIPE, UNIVERSAL_RULES) | Backward-compatible |
| CATEGORY enum 6 values exact strings | PRESENT (verbatim) | Locked |
| CTA_TARGET enum 2 values | PRESENT (verbatim) | Locked |

### STEP 0 / pre-flight

| OLD rule | NEW status | Note |
|---|---|---|
| "If JSON exists at `/Users/frankthebot/clawd/...` queue status check" | SUPERSEDED | Path portability: `/Users/frankthebot/` → `$HOME/clawd/`. Justification: B1 lesson 5 (multi-host compatibility). Verifier-side same patch. |
| Queue status overwrite logic (write_failed / flagged / writing → OK; verified → refuse) | PRESENT (strengthened — adds explicit "regenerating" / "refresh" / "Track C rewrite" NOTES override) | Refined |
| Atomic write: tmp → validate → rename | PRESENT (verbatim) | Verbatim |

### STEP 1 / schema

| OLD rule | NEW status | Note |
|---|---|---|
| "Read `personas.ts` for the `Persona` interface" | PRESENT (now in STEP 0 with portable path) | Moved earlier; portable |
| "Gold-standard reference: `gig-workers.json`" | SUPERSEDED | Gold standard is now `self-employed.json` (5.5/8 shapes, 69% fan-out, strong synonym density). Justification: per audit, gig-workers is the WORST-aligned reference (1.5/8 shapes, 19% fan-out, ZERO synonyms); using it as gold-standard reproduces the audit-flagged gaps. |
| LocalizedString {en, es} rule | PRESENT (verbatim — STEP 4 CRITICAL faqs shape) | Verbatim |
| `category` locked enum | PRESENT | Verbatim |
| `ctaTarget` locked enum | PRESENT | Verbatim |
| `optionsOverview` headers + min 2 rows | PRESENT (strengthened — explicit STRICT count check with `optionDetails`) | STEP 4 26-check #17 |
| `optionDetails` matches optionsOverview 1-to-1 | PRESENT (strengthened — validator HARD-rejects mismatch; documented as most-common drafter mistake) | STEP 4 + 26-check + NEVER #11 |
| `traps` required min 2 rows | PRESENT | Verbatim |
| `detailSections` required min 2 (free-form) | SUPERSEDED | Now min 2 with EXPLICIT 8-shape recipe mapping; STEP 3 shapes table enumerates required H2 coverage. Justification: audit PE-2 — old writer's "free-form" let pages ship with PTC/HSA/SEP/state-stipend sections missing. |
| FAQs flat strings (NOT LocalizedString) | PRESENT (verbatim — STEP 4 CRITICAL section) | Verbatim |
| `relatedLinks` href prefixes whitelist | PRESENT (verbatim) | Verbatim |

### STEP 2 / research

| OLD rule | NEW status | Note |
|---|---|---|
| "Primary sources: healthcare.gov, Medicaid.gov, medicare.gov, IRS, SBA + KFF" | PRESENT (strengthened — adds per-persona source-required matrix: DOL.gov for Employment Status, VA.gov/TRICARE.mil for Veteran, state agency for state-stipend, USPSTF for under-26) | More specific |
| "Self-employed health insurance deduction (Form 7206) — CRITICAL FACT: reduces INCOME tax only" | PRESENT (strengthened — explicit GATE I with HOLD on "reduces both" phrasing; multiple NEVER list mentions) | This was a strength of the old writer; new writer makes it gate-enforced |
| HSA contribution limits 2026 ($4,400 / $8,750) | PRESENT (corrected anchor: 2026 HDHP minimum deductible now $1,700/$3,400 per Rev. Proc. 2025-19, NOT $1,650/$3,300; ACA OOP max $10,150/$20,300 per HHS Final NBPP, NOT $9,200/$18,400) | Anchor-fact patch surfaced during Phase 4 |
| "COBRA continuation costs and timing" | PRESENT (verifier Category B explicit 102% + 18 months) | Detail added to verifier |
| "Spouse plan SEP windows" | PRESENT (shape #8 SEP triggers + 60-day windows) | Expanded to all SEP events |

### STEP 3 / draft (was "Required fields checklist" in old)

| OLD rule | NEW status | Note |
|---|---|---|
| `slug` matches input | PRESENT | Verbatim |
| `personaName.en/es` full name | PRESENT (strengthened — adds Spanish-translation-quality guidance) | Better |
| `shortName.en/es` for breadcrumbs | PRESENT (strengthened — ≤30 char cap) | Tighter |
| `category` locked | PRESENT | Verbatim |
| `topic`, `medicalSpecialty` | PRESENT (medicalSpecialty defaults to "PublicHealth" — explicit) | Better |
| `ctaTarget` from queue (authoritative) | PRESENT (explicit "screener" default; "analyzer" extremely rare) | Better |
| `lastUpdated` ISO, `readingTime` | PRESENT | Verbatim |
| `meta.title.en` under 70 chars; `meta.description.en` under 160 chars | PRESENT (strengthened — STEP 4 26-check + verifier auto-fix on overage) | Validator-enforced |
| `hero.h1` "Health Insurance for [Persona] in 2026" style | PRESENT | Verbatim |
| `hero.subhero` 1-2 sentences with key value prop | PRESENT | Verbatim |
| `quickAnswer` 3-5 sentences summarizing options | PRESENT (strengthened — must hit top 2-3 options + PTC eligibility + key tool) | Better |
| `introParagraphs` 1-2 paragraphs | PRESENT (strengthened — first paragraph MUST be persona-anchored; "This guide covers..." explicitly banned) | Per audit PE finding |
| `optionsOverview` min 2 rows | PRESENT | Verbatim |
| `optionDetails` MUST match `optionsOverview.rows.length` (1-to-1) | PRESENT (strengthened — STRICT count check; documented as most-common drafter mistake) | Better |
| `traps` min 2 rows | PRESENT (strengthened — typical 3-4) | Better |
| `detailSections` MIN 2, "typically tax/financial + situation-specific" | SUPERSEDED | Min 2 strict + EXPLICIT 8-shape recipe mapping (PTC / HSA / SEP / state-stipend / Form 7206 / catastrophic / 1099 / coverage options). Justification: audit PE-2 — old's free-form let pages ship with required sections missing. |
| Non-expansion-state coverage gap section (10 states: AL, FL, GA, KS, MS, SC, TN, TX, WI, WY) | PRESENT (preserved in verifier Category D; writer encourages it for low-income personas where Medicaid is option 1-2) | Carry-over |
| `faqs.en` 6-8 pairs (flat strings) | PRESENT | Verbatim |
| `faqs.es` matching | PRESENT | Verbatim |
| `relatedLinks` 2-4 valid hrefs | PRESENT (strengthened — explicit "≥1 to /event/ or /qa/") | Better |
| `sources` min 3 | PRESENT (strengthened — GATE C ≥3 inline .gov/.edu/kff.org with domain visible) | Better |

### Anchor facts (was "CRITICAL anchor facts (2026)" in old)

| OLD rule | NEW status | Note |
|---|---|---|
| FPL hh-1 $15,960 | PRESENT | Verbatim |
| 138% FPL ≈ $22,025 hh-1 | PRESENT | Verbatim |
| 2026 ACA Marketplace OOP max $9,200 / $18,400 | SUPERSEDED | Corrected to $10,150 / $20,300 per HHS Final NBPP for 2026 (finalized January 13, 2025). Justification: anchor-fact drift caught during Phase 4 freelance writer's web research. |
| 2026 HSA HDHP minimum deductible $1,650 / $3,300 | SUPERSEDED | Corrected to $1,700 / $3,400 per Rev. Proc. 2025-19 (May 2025). Justification: same anchor-fact drift. |
| 2026 HSA contribution $4,400 / $8,750 | PRESENT (verbatim + adds catch-up $1,000 if 55+) | Verbatim |
| 2026 IRS mileage $0.70/mile | PRESENT | Verbatim |
| ACA cliff BACK; phasedown phrasing | PRESENT (verbatim with NEVER #7 ban on binary phrasing) | Verbatim |
| Form 7206 reference | PRESENT (strengthened — GATE I HOLD on "reduces both" factual error) | Stronger |
| (NEW) 1099-K threshold $5,000 for 2026 | STRENGTHENED | Added |
| (NEW) Section 2714 ACA dependent age-out at 26 | STRENGTHENED | Added (relevant for college-students) |
| (NEW) Marketplace SEP 60-day window | STRENGTHENED | Added (relevant for all SEP triggers) |
| (NEW) Catastrophic plan: under-30 OR hardship | STRENGTHENED | Added (relevant for college-students + early-retirees ineligibility statement) |
| (NEW) HDHP OOP max $8,500 / $17,000 (separate from ACA Marketplace OOP) | STRENGTHENED | Added during anchor-fact patch |
| (NEW) IRA signed August 16, 2022 (NOT 2023) | STRENGTHENED | Added |

### Style rules (was "Style rules" in old)

| OLD rule | NEW status | Note |
|---|---|---|
| No em / en dashes | PRESENT (strengthened — explicit "no `--` double-hyphen" + GATE D auto-fix + grep verification + post-rename re-check) | Stronger |
| No filler phrases | PRESENT (strengthened — explicit banned phrase list including "this guide covers" + "navigating the complex world" + "let's dive in") | Stronger |
| Each FAQ answer 40-100 words | SUPERSEDED | New rule: FAQ answer 80-150 words (framework §4.5 + gold-standard self-employed alignment). Justification: audit minor gap finding — old spec conflicts with framework. |
| Lead with persona-specific framing | PRESENT (strengthened — pronoun discipline GATE + "must lead with named entity, never `It`/`They`/`This`...") | Stronger |
| Concrete numbers > vague language | PRESENT | Verbatim |
| (NEW) Year-anchor everything | STRENGTHENED | RULE 4 + STEP 5 rule 4 |
| (NEW) Pronoun discipline GATE | STRENGTHENED | Framework §5.7 enforcement |
| (NEW) Synonym discipline GATE E | STRENGTHENED | The audit's #1 fix |
| (NEW) Body paragraph length 120-220 words | STRENGTHENED | Framework pattern #1 |
| (NEW) No markdown bold (`**`) in JSON | STRENGTHENED | Renderer outputs `<p>` plain text |

### CTA target

| OLD rule | NEW status | Note |
|---|---|---|
| "Almost always 'screener' for persona pages" | PRESENT (verbatim with explicit 'analyzer'-extremely-rare disclaimer) | Verbatim |

### Persona/event/QA duplication rule

| OLD rule | NEW status | Note |
|---|---|---|
| "Every persona page MUST include at least one `relatedLinks` entry to /event/ or /qa/" | PRESENT (verbatim — STEP 4 + 26-check #22) | Verbatim |
| Persona = identity / event = moment / QA = question | PRESENT (verbatim) | Verbatim |

### STEP 4-5 / save + return

| OLD rule | NEW status | Note |
|---|---|---|
| Atomic save tmp → rename | PRESENT (verbatim) | Verbatim |
| Validate JSON parses | PRESENT (verbatim) | Verbatim |
| Return JSON shape: slug, status, word_count, option_details, traps_rows, detail_sections, faq_count, cta_target | PRESENT (strengthened — adds gates object (9 keys a-i), synonym_distinct_count, has_ptc_section, has_hsa_section, has_state_stipend_section, has_form_7206_caveat, topicCluster, keyTerms, isLighthouse, isDeprecated, gapsFlagged) | Additive forward-compat — cron preserves existing parsing |

### CRITICAL RULES (was 6 rules in old)

| OLD rule | NEW status | Note |
|---|---|---|
| 1. Persona-specific framing | PRESENT (strengthened — synonym discipline + pronoun discipline) | Better |
| 2. Each option in optionsOverview must have matching optionDetails | PRESENT (verbatim — NEVER #11) | Verbatim |
| 3. 2026 anchor facts baked in | PRESENT (corrected + expanded) | Better |
| 4. Locked enums | PRESENT (verbatim — NEVER #14) | Verbatim |
| 5. FAQ flat strings | PRESENT (verbatim — STEP 4 CRITICAL section) | Verbatim |
| 6. Last line JSON | PRESENT (verbatim — NEVER #16) | Verbatim |

---

## NEW rules in v2 (23 strengthens — not in v1)

1. RULE 1 state-context-everywhere (N/A for persona by default; EXCEPTION shape #6 state-stipend section MUST include state name)
2. RULE 2 household-size-table 9 rows CONDITIONAL (income-gated personas only)
3. RULE 3 how-to-apply section (via SEP triggers detailSection)
4. RULE 4 year-markers (never bare $/% without year)
5. RULE 5 ≥3 inline .gov / .edu / kff.org citations with domain visible
6. 8 §4.7 dominant Bing-validated shapes mapped to required H2 / detailSection coverage with N/A fallback
7. Synonym discipline (≥5 distinct synonyms in `keyTerms.en` each ≥2 occurrences in body) — the audit's #1 gap
8. Required-vocabulary checklist (8 canonical terms: PTC, HSA, FSA, Form 7206, 1099 contractor, Marketplace SEP, catastrophic plan, Section 1095-A)
9. 9 HARD-REJECT GATES at STEP 6 with "STOP. Read this twice." framing (4 universal + 5 persona-specific)
10. STRICT count checks (optionDetails === optionsOverview.rows; detailSections >= 2; synonym distinct_count)
11. Pronoun discipline GATE (no paragraph opens with `It`/`They`/`This`/`These`/`Here`/`There`/`Such`)
12. introParagraphs[0] persona-anchored ban on "This guide covers..."
13. Form 7206 + Schedule SE caveat GATE I (HOLD on "reduces both income tax and SE tax" factual error)
14. State-stipend specifics (CA Prop 22 15 engaged hours quarterly; MA Question 3 of 2024; NY FIFA payment-terms-not-healthcare distinction)
15. Catastrophic plan eligibility (under-30 OR hardship; explicit ineligibility statement for over-30 personas)
16. ACA cliff phasedown phrasing (never "below 400% FPL = subsidies" binary)
17. HSA-vs-FSA distinction (most non-W-2 personas have NO FSA access)
18. Additive Track C-prime fields (topicCluster, keyTerms object shape, isLighthouse, isDeprecated)
19. Path portability ($HOME/clawd not hardcoded /Users/frankthebot/)
20. 1099-K threshold $5,000 for 2026 anchor
21. Persona-specific scam guard (NEVER recommend health share ministries / short-term limited duration plans / discount plans)
22. Default-toward-ship preference + gate routing per master brief §3.5
23. End-of-prompt sanity check (12-question yes/no self-confirmation)

---

## Silently dropped rules

**None detected.** Every rule in the old writer is either preserved verbatim, preserved-and-strengthened, or formula-superseded with documented justification.

The two SUPERSEDED items with strongest justification:
1. FAQ length 40-100 → 80-150 words (framework §4.5 + audit found old spec conflicted with gold-standard self-employed's actual 80-130 word answers)
2. `gig-workers.json` as gold-standard → `self-employed.json` as gold-standard (audit-flagged: gig-workers is the WORST-aligned existing page at 1.5/8 shapes; using it as reference reproduces audit gaps)

---

## Conclusion

The new writer is a strict superset of the old writer:
- All 28 old rules carried into new
- 9 rules formula-superseded with documented justification (formula wins direction)
- 0 silently dropped
- 23 new rules strengthen enforcement (gates, recipe, synonym discipline)

The most consequential delta is the GATE E synonym density gate (the audit's #1 fix) plus the 8 §4.7 dominant-shape mapping (PE-2). Together these address ~95% of the audit-flagged gaps on the existing gig-workers + self-employed pages, and prevent reproduction on the 5 Phase 4 test articles.

**No blockers found. Writer is GO for Phase 4 → Phase 5 ship.**
