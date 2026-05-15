# Persona Writer + Verifier PRD (Track C-prime)

**Template:** persona (`/for/[persona]`)
**Files you will modify:** `.claude/agents/coveredusa-persona-writer.md` + `.claude/agents/coveredusa-persona-verifier.md`
**Output directory:** `projects/covered-usa/content/data/personas/`
**Estimated time:** 4-5 hours
**Status:** existing writer is medium-aligned; current pages cover only 1.5/8 (gig-workers) and 5.5/8 (self-employed) of §4.7 dominant shapes; **THE biggest gap is SYNONYM DENSITY** — the word "synonym" doesn't appear in the current writer prompt and gig-workers.json has 0 mentions of "freelancer," 0 of "contractor," 0 of "rideshare driver," 0 of "sole proprietor"

---

## 0. Read order (MANDATORY before starting any phase)

1. **`projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md`** through §4 + §3.5 (default-toward-ship) + §6 (held-queue mechanism) + Appendix A (real-world drift case studies) + Appendix B (writer-leaks pattern). The master brief is the source of truth for the 4-phase pattern, the verifier dual-purpose model, and the gates routing.
2. **This PRD** end-to-end before spawning any agents.
3. **`~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_b1_blog_writer_shipped.md`** — the 8 B1 lessons.
4. **Reference implementations** (READ — do not modify in your session):
   - `.claude/agents/coveredusa-ma-state-writer.md` (the cleanest example of Track C-prime writer pattern; copy structure)
   - `.claude/agents/coveredusa-ma-state-verifier.md` (the cleanest example of Track C-prime verifier pattern with all 3 patches applied; copy structure)
   - `.claude/agents/coveredusa-article-verifier.md` (B1 + Track C-prime; daily blog verifier; useful for fact-check categories)
5. **Sibling PRD for cross-reference:** `specs/track-c-prime/procedure-prd.md` (the structural template — copy section 0-12 layout exactly).
6. **Source docs cited in §1 below** — the planner agent will read these in Phase 1, but you should skim them first.

If you skip step 1 or 4, you'll re-discover lessons we already learned. Don't.

---

## 1. Context inventory (Phase 1 planner reads these)

| Doc | What it tells you |
|---|---|
| `.claude/agents/coveredusa-persona-writer.md` | Current writer prompt — tax facts strong, recipe enforcement weak, synonym discipline absent |
| `.claude/agents/coveredusa-persona-verifier.md` | Current verifier — fact-check categories that work; missing synonym density check |
| `.claude/agents/_universal-rules-block.md` | The 5 universal rules + 19-state program brand list |
| `projects/covered-usa/specs/FANOUT_FORMULA.md` §3 + **§4.7** | Universal rules + persona recipe (8 dominant shapes Bing-validated, tied with daily-blog for highest) |
| `projects/covered-usa/specs/AI_OPTIMIZATION_FRAMEWORK.md` | The framework these recipes derive from (especially §5.6 demographic specificity / synonym coverage) |
| `projects/covered-usa/specs/URL_SLUG_FRAMEWORK.md` | Slug rules — never migrate existing slugs |
| `projects/covered-usa/specs/LINK_TARGET_MANIFEST.md` | Link routing system (link-index + topicCluster + keyTerms.{en,es}) |
| `projects/covered-usa/specs/CURRENT_STATE_AUDIT.md` §4.6 | Cross-template audit findings — synonym gap is THE persona finding |
| `projects/covered-usa/content/fanout/analysis/audit-persona-writer.json` | **THE most important doc** — synthesized audit of gig-workers + self-employed with shape-by-shape coverage matrix and the 3 prioritized writer edits |
| `projects/covered-usa/specs/PHASE_5_BRIDGE.md` §3 | Track C bridge context |
| `projects/covered-usa/src/lib/personas.ts` | The `Persona` TypeScript interface — your hard contract |
| `projects/covered-usa/content/data/personas/self-employed.json` | **Gold standard structural reference** — most-aligned existing page (5.5/8 shapes, 69% fan-out coverage, strong synonym density: freelancer 25, consultant 4, sole proprietor 2, 1099 16) |
| `projects/covered-usa/content/data/personas/gig-workers.json` | Worst-aligned existing page (1.5/8 shapes, 19% fan-out); useful for "what NOT to do" patterns and as the canonical synonym-gap example |

---

## 2. Schema reminder + hard contracts

The `Persona` interface (`projects/covered-usa/src/lib/personas.ts`) is your hard contract. Required top-level fields:

- `slug` (lowercase, hyphens — also the JSON filename)
- `personaName: LocalizedString`, `shortName: LocalizedString`
- `category: PersonaCategory` (LOCKED ENUM — exact strings: "Self-Employment", "Age / Life Stage", "Employment Status", "Family Status", "Income Status", "Veteran / Service")
- `topic` (string for schema.about, e.g., "Self-Employed Health Insurance", "Student Health Insurance")
- `medicalSpecialty` (typically "PublicHealth" for persona)
- `ctaTarget: PersonaCtaTarget` (LOCKED ENUM — "screener" or "analyzer"; almost always "screener" for persona)
- `lastUpdated` (ISO date YYYY-MM-DD)
- `readingTime` (string, e.g., "8 min read")
- `meta: {title, description}` (LocalizedString; **title ≤ 70 chars, description ≤ 160 chars** — validator enforces)
- `hero: {h1, subhero}` (LocalizedString) — H1 typically "Health Insurance for [Persona] in 2026"
- `quickAnswer: LocalizedString` (3-5 sentences with persona-anchored options + 2026 marker)
- `introParagraphs: LocalizedString[]` (1-2 entries; opener MUST be persona-anchored — NOT "This guide covers...")
- `optionsOverview: OptionsOverview` (required; min 2 rows; headers typically `["Option", "Best for", "Typical cost"]`)
- `optionDetails: OptionDetail[]` (required; **MUST match `optionsOverview.rows.length` exactly** — 1-to-1 correspondence; validator enforces)
- `traps: TrapsSection` (required; min 2 rows of pitfalls)
- `detailSections: DetailSection[]` (required; **MIN 2** — typically tax/financial + situation-specific strategy)
- `faqs: {en: LocalizedFAQ[], es: LocalizedFAQ[]}` (FLAT strings — `{question, answer}` not LocalizedString)
- `relatedLinks: RelatedLink[]` (2-4 entries; allowed prefixes: `/screener`, `/medical-bill-analyzer`, `/medicaid-income-limits`, `/medicare-eligibility`, `/aca-income-limits`, `/federal-poverty-level`, `/cost/`, `/drug/`, `/qa/`, `/glossary/`, `/event/`, `/for/`)
- `sources: PersonaSource[]` (min 3)

**Additive Track C-prime fields (emit these too — clears `content-quality.js` warnings + Track A1 forward-compat):**
- `topicCluster: "persona"` (string, lowercase kebab-case)
- `keyTerms: {en: string[], es: string[]}` (NOT a flat array — see Phase 2 patch list; this is where the synonym list LIVES + gets emitted)
- `isLighthouse: false`
- `isDeprecated: false`

**Hard contracts (NEVER violate):**
1. JSON return shape from STEP 8 must be `{slug, status, ...}` parseable by the cron
2. Atomic write pattern: `<slug>.tmp.json` first → validate JSON parses → rename to `<slug>.json`
3. `## STEP N` numbered headings (cron may parse for logging)
4. Schema interface conformance — extra fields are silently ignored at runtime, but missing required fields crash the build
5. FAQ question/answer are FLAT STRINGS, not LocalizedString objects (most common drafter mistake)
6. Spanish parity — every LocalizedString needs both `en` AND `es`
7. No em-dash `—` (U+2014), no en-dash `–`, no double-hyphen `--` anywhere
8. `optionDetails` length === `optionsOverview.rows` length (validator-enforced; the most common persona-specific drafter mistake)
9. `category` and `ctaTarget` are LOCKED ENUMS — never invent new values

---

## 3. The §4.7 recipe (expanded with worked examples)

**FANOUT_FORMULA.md §4.7 — persona variant distribution:** Entailment 50.2% (DOMINANT — highest of any template) / Equivalent 22.2% / Canonicalization 15.3% / Specification 12.0% / Follow-up 0.3%

**Bing-validated shapes:** **8 of 8** — persona is one of the two highest-validated templates in the entire fan-out study (tied with daily-blog). The template has the strongest theoretical citation upside in the codebase. The current writer realizes only ~19-69% of that upside. Closing the recipe gaps + the synonym gap is the highest-ROI move on persona.

### Top 8 dominant shapes (apply ALL of these in the new writer)

1. **Coverage options for [persona] + year** — Specification, top weight. Render as `optionsOverview` table + matching `optionDetails` (1-to-1). Year-anchor table caption: "Coverage options for [persona] 2026". Year in EVERY optionDetails heading or first paragraph.
2. **Premium tax credit / persona subsidy eligibility** — Entailment, BING-VALIDATED. Render as a NEW required H2 / detailSection: "Premium Tax Credit (PTC) eligibility for [persona] in 2026" — must explicitly use the canonical term "Premium Tax Credit" (or "PTC"); MUST cover the 2026 cliff (ARPA expanded subsidies expired Jan 1, 2026); subsidy-cliff phrasing: "subsidies phase down approaching 400% FPL and stop at 400%" (NOT "below 400% = subsidies"); MUST cover MAGI projection for variable-income personas.
3. **1099 / freelancer coverage options + year** — Entailment, BING-VALIDATED. Render with explicit use of "1099 contractor" + "Section 1095-A" (the IRS form for marketplace enrollees). For self-employment-category personas, this is the dominant shape — synonym gap kills it (gig-workers has 0 of "1099 contractor", "freelancer", "contractor").
4. **Self-employment health insurance deduction (Form 7206)** — Entailment, BING-VALIDATED. Render as a dedicated detailSection with: explicit "Form 7206" mention; "Schedule 1 line 17" or "above-the-line deduction" language; **CRITICAL caveat — the deduction reduces INCOME tax only; it does NOT reduce self-employment tax (Schedule SE)**. Most-common LLM hallucination is to claim the deduction reduces both. Verifier MUST flag any "reduces both income tax and SE tax" phrasing.
5. **HSA / FSA fit for [persona]** — Specification, BING-VALIDATED. Render as a dedicated detailSection covering: HSA eligibility requires pairing with an HDHP (2026 minimum deductible $1,650 self / $3,300 family); HSA contribution limit (2026 $4,400 self / $8,750 family + $1,000 catch-up if 55+); HSA triple tax advantage (tax-deductible contribution, tax-free growth, tax-free qualified withdrawal); FSA is employer-only (most personas don't have access — flag explicitly when the persona is non-W-2). MUST distinguish HSA vs FSA — common drafter conflation. The gig-workers page has 0 mentions of HSA/HDHP/FSA — this is FAIL today.
6. **State-specific stipend / portable benefits program for [persona]** — Specification, BING-VALIDATED. Render as a dedicated detailSection where applicable. Examples: California Prop 22 (2020) requires Uber/Lyft/DoorDash to offer healthcare stipend to gig drivers averaging 15+ engaged hours/week; Massachusetts Init 1 (2024) similar gig-driver stipend; New York's freelance-protection laws (Freelance Isn't Free Act); Washington state's portable benefits pilot. Flag (LOW) if applicable but missing — never HOLD.
7. **Catastrophic plan eligibility for [persona]** — Specification, BING-VALIDATED. Catastrophic plans on the marketplace are restricted to (a) under-30 enrollees OR (b) hardship-exemption holders. For personas where this applies (college-students under 30; early-retirees uninsurable hardship cases), include a dedicated H2 / paragraph. For personas where it doesn't apply (over-30 self-employed without hardship), explicitly state "catastrophic plans are not available for this persona" — that itself is an entailment-style answer.
8. **Persona × Marketplace SEP triggers** — Entailment, BING-VALIDATED. Render as a dedicated H2 / detailSection: "When does a [persona] qualify for a Marketplace SEP?" Use the canonical term "Marketplace SEP" (Special Enrollment Period). Enumerate 4-7 qualifying life events (loss of coverage; marriage/divorce; moving states; income change crossing Medicaid threshold; adding a child; turning 26; retirement). For each, give the SEP window in days (typically 60). For overlap-heavy events, link out to the matching `/event/<slug>` page rather than restate.

### Required FAQ topics (6-8 — must include all of these)

1. **What's the cheapest health insurance option for [persona] in 2026?** (canonical Q; covers shape #1)
2. **Do [persona] qualify for the Premium Tax Credit?** (covers shape #2; required vocabulary "PTC")
3. **Can [persona] deduct health insurance premiums on taxes?** (covers shape #4; required vocabulary "Form 7206"; required Schedule SE caveat)
4. **Can [persona] use an HSA?** (covers shape #5; required vocabulary "HSA" + "HDHP")
5. **What if [persona] makes too much for subsidies?** (covers the 2026 cliff; required for income-relevant personas)
6. **When can [persona] enroll in a Marketplace plan outside open enrollment?** (covers shape #8 SEP triggers)
7. *(Where applicable):* **Does [persona]'s state offer a healthcare stipend or portable benefits program?** (covers shape #6)
8. *(Where applicable):* **Can [persona] enroll in a catastrophic plan?** (covers shape #7; especially for under-30 personas)

### Required-vocabulary checklist (persona-specific, per audit + recipe)

Body content MUST explicitly use each of these canonical terms at least once:
- "Premium Tax Credit" (or "PTC")
- "Health Savings Account" (or "HSA")
- "Flexible Spending Account" (or "FSA") — at minimum to distinguish from HSA
- "Form 7206" (self-employed health insurance deduction; required for Self-Employment-category personas; mention "N/A for non-self-employed personas" explicitly otherwise)
- "1099 contractor" (required for Self-Employment + Employment Status personas)
- "Marketplace SEP" (or "Special Enrollment Period")
- "catastrophic plan" (whether to confirm eligibility OR explicitly note ineligibility)
- "Section 1095-A" (the IRS form marketplace enrollees use to reconcile PTC; required for any persona where PTC applies)

This is auto-validatable via grep at STEP 6.

### Synonym block — THE PERSONA-SPECIFIC GATE (per §3.9 + §5.6)

This is the single largest writer-side gap per audit. The current writer has ZERO mention of synonym coverage. The fix:

**Writer rule (new):** STEP 3 must include a "Synonym discipline" subsection requiring the writer to:
1. Derive a canonical persona term + ≥5 distinct persona-related synonyms.
2. List ALL of them in `keyTerms.en` (and Spanish equivalents in `keyTerms.es`).
3. Use each synonym at least 2-3 times in body content (across H1/H2/intro/optionDetails/FAQ — distributed, not stacked).

**Synonym lists per persona (writer should reference these as starting points):**

| Persona | Required synonyms in body (≥5) |
|---|---|
| `uber-lyft-rideshare-drivers` (gig-workers refresh) | rideshare driver, delivery driver, freelancer, independent contractor, 1099 contractor, sole proprietor, Uber driver, Lyft driver, DoorDash driver, Instacart shopper, gig worker |
| `freelance-designers-consultants` | freelancer, consultant, contractor, sole proprietor, Schedule C filer, 1099 contractor, independent professional, solo practitioner, self-employed |
| `college-students` | college student, undergraduate, graduate student, dependent under 26, student plan enrollee, university health plan enrollee |
| `recently-lost-employer-coverage` | recently uninsured, just lost coverage, COBRA-eligible, post-employment enrollee, between-jobs worker, displaced worker |
| `early-retirees` | pre-retiree, near-retiree, ages 60-64, early-retiree, soon-to-be-Medicare-eligible, transitioning-to-Medicare |

**Verifier rule (new):** STEP 1B must include a synonym-density check — count occurrences of each declared `keyTerms.en` synonym in body content; FAIL the gate (HOLD) if <3 distinct synonyms appear; WARN if 3-4; PASS if ≥5.

### Year-anchoring (RULE 4)

Every dollar amount + percentage must have a year in the same sentence or table caption. The 2026 anchor facts are: FPL hh-1 $15,960 (48 states); 138% FPL $22,025 hh-1; 400% FPL $63,840 hh-1; ACA OOP max $9,200 individual / $18,400 family; HSA HDHP min deductible $1,650 self / $3,300 family; HSA contribution limit $4,400 self / $8,750 family; IRS standard mileage rate $0.70/mile; ACA subsidy cliff BACK for 2026 (enhanced PTCs expired Jan 1, 2026).

### State-context

Per §4.7: state-context is **CONDITIONAL** for persona — required when shape #6 applies (state-specific stipends / portable benefits programs). For personas where no state-specific program exists, an explicit "no state-specific stipend exists for this persona; coverage is via the federal/state ACA marketplace" sentence satisfies the entailment shape.

---

## 4. Audit findings synthesized (read `audit-persona-writer.json` for the full version)

**Pages audited:** gig-workers, self-employed. Alignment scores: 19% / 69% fan-out coverage of §4.7 dominant shapes.

**THE biggest gap (single highest-ROI fix):** SYNONYM DENSITY. The word "synonym" does NOT appear in the current writer prompt. gig-workers.json has 0 mentions of "freelancer," 0 of "contractor," 0 of "rideshare," 0 of "rideshare driver," 0 of "sole proprietor," 0 of "independent contractor," 0 of "1099-K," 0 of "lyft" — and only 2 mentions of "1099". This kills Clarification fan-out per §3.9 demographic specificity. AI engines surface persona pages for adjacent persona queries via synonym overlap; with zero synonyms the page can only be retrieved by its exact slug term.

**Other shape gaps (gig-workers — the worst-aligned page):**
- Shape #2 PTC: PARTIAL (covered in Option 1; no dedicated PTC section)
- Shape #3 1099/freelancer: FAIL (zero 1099-anchored content beyond a token)
- Shape #5 HSA/FSA: FAIL (zero mention of HSA, HDHP, FSA)
- Shape #6 state-specific: FAIL (zero state-specific stipend section despite Prop 22 directly governing Uber drivers)
- Shape #7 catastrophic: FAIL (zero mention)
- Shape #8 SEP triggers: FAIL (no SEP section)

**3 prioritized writer edits (PE-1 through PE-3 — your new writer must implement all 3):**

- **PE-1 (HIGHEST priority, S effort):** Add Section 5.6 / §3.9 synonym block to STEP 3. Writer must declare ≥5 persona synonyms in `keyTerms.en` and ensure each appears 2-3 times in body content. Verifier MUST check density via grep. **This is the single most impactful change for persona; without it the recipe shapes can fire but Bing won't surface the page on adjacent persona queries.**
- **PE-2 (HIGH priority, M effort):** Enumerate the 8 dominant §4.7 shapes as required H2/section coverage. Replace the loose "min 2 detailSections" in current writer with an explicit 8-shape checklist that maps to optionDetails / detailSections / FAQ. Allow "N/A — explicitly stated in body" fallback for shapes that genuinely don't apply (e.g., catastrophic plans for over-30 self-employed without hardship; Form 7206 for college students).
- **PE-3 (MED priority, M effort):** Add required-vocabulary checklist (8 canonical terms per §3 above) + persona-specific scam guard (the verifier already has this but writer doesn't — never recommend health share ministries, short-term limited duration plans, or discount plans).

**Audit's strongest existing-page reference:** `self-employed.json` — covers 5.5/8 shapes including PTC + Form 7206 + HSA/HDHP table + 1099/freelancer overlap + partial SEP. Strong synonym density (freelancer 25, consultant 4, sole proprietor 2, 1099 16). The structural template for the new writer should match this page's section ordering and density.

---

## 5. Universal GATES (recap from master brief §7) — apply ALL to persona

- **GATE A — slug must NOT contain a year.** Persona slugs are pure persona names (`gig-workers`, `college-students`, `early-retirees`). Never `gig-workers-2026` or `college-students-coverage-2026`. **HOLD on fail.**
- **GATE B — household-size table.** **CONDITIONAL for persona.** Required when the persona's coverage decision is income-gated by PTC subsidy thresholds or Medicaid expansion eligibility (gig-workers, freelance-designers-consultants, recently-lost-employer-coverage when income drops). Skip ("N/A") for pure-status personas without income-gating (college-students often dependent-coverage; early-retirees transitioning to Medicare). When skipping, mark `gates.b: "n/a"` and link out to `/medicaid-income-limits` rather than embed a table. When applying, the table MUST have exactly 9 data rows (hh sizes 1-8 + "each additional person") with at minimum: 138% FPL column, 400% FPL column.
- **GATE C — ≥3 inline outbound .gov / .edu / kff.org citations** with domain visible in anchor text. Required minimum: healthcare.gov (PTC + marketplace) + IRS.gov (Form 7206 + HSA limits) + KFF (subsidy data). For state-stipend sections, add the state's gig-worker program URL (e.g., labor.ca.gov for Prop 22). **HOLD on 0-1 .gov citations; WARN on exactly 2.**
- **GATE D — zero `--` (double-hyphen) anywhere.** **AUTO-FIX as style correction; never HOLD.** The persona-verifier must auto-fix per the GATE D hoist patch (see master brief §3 Phase 4.5 patches). self-employed.json has 8-10 em-dashes per audit — sweep these on regen.

---

## 6. Persona-specific GATES (your STEP 6 additions)

These are the template-specific gates. Frame them at STEP 6 with "STOP. Read this twice." language.

### GATE E — Synonym density ≥5 distinct persona-related synonyms in body content

This is the audit's #1 gap. Verifier must count occurrences of each declared `keyTerms.en` synonym in body content (concatenate all LocalizedString.en across personaName + hero + quickAnswer + introParagraphs + optionsOverview + optionDetails + traps + detailSections + faqs.en).

**Routing:** PASS if ≥5 distinct synonyms appear (each with ≥2 occurrences); WARN if 3-4 distinct synonyms; **HOLD if <3 distinct synonyms**. This is the SINGLE BIGGEST persona gap; without it the page can't surface for adjacent persona queries.

### GATE F — PTC eligibility section MUST be present for income-relevant personas

Verify the JSON has either (a) a dedicated detailSection covering Premium Tax Credit eligibility OR (b) an optionDetails entry with PTC as the primary subject, AND the canonical term "Premium Tax Credit" (or "PTC") appears at least 2 times in body content.

**Applies to:** every persona whose primary coverage path includes the marketplace (gig-workers, freelance-designers-consultants, recently-lost-employer-coverage, early-retirees pre-65). **Does NOT apply to:** college-students with parent coverage as primary path (PTC may still be mentioned but not required as dedicated section).

**Routing:** PASS if present + complete; WARN if mentioned only in passing; **HOLD if absent for marketplace-coverage personas**.

### GATE G — HSA / FSA fit section MUST be present

Verify the JSON has a dedicated detailSection (or optionDetails entry) covering HSA eligibility for the persona. MUST distinguish HSA from FSA explicitly (don't conflate). Required vocabulary: "HSA" + "HDHP" + at least one of {"$4,400" / "$8,750" / "triple tax advantage"}.

**Routing:** PASS if dedicated section present with HSA + HDHP terms + 2026 limits; WARN if covered only in FAQ; **HOLD if HSA + HDHP both entirely absent from body content**. (Slightly lower priority than GATE E + F — flag MEDIUM if you're being conservative.)

### GATE H — State-specific stipend / program section flag (LOW)

For personas with applicable state-specific portable-benefits programs (gig-driver personas → CA Prop 22, MA Init 1; freelancer personas → NY Freelance Isn't Free Act, WA portable benefits pilot), verify the JSON has at least one detailSection or paragraph mentioning the state program by name.

**Routing:** PASS if present; **flag LOW if applicable but missing** (never HOLD — state-context for persona is conditional, not mandatory).

### GATE I (auxiliary) — Form 7206 + Schedule SE caveat for Self-Employment-category personas

For personas with `category: "Self-Employment"`, verify (a) the term "Form 7206" appears in body content AND (b) the body explicitly states the deduction does NOT reduce self-employment tax (Schedule SE). Common LLM hallucination is "reduces both income tax and SE tax" — auto-fix or HOLD.

**Routing:** PASS if Form 7206 present + Schedule SE caveat correct; WARN if Form 7206 present but caveat missing; **HOLD if "reduces both" or equivalent appears anywhere** (factual error; user-financial-harm risk).

---

## 7. Test mix — 5 personas (Phase 4)

Skip the 2 already-shipped (gig-workers, self-employed — Track E will regen these). Test the new writer on 5 NET-NEW personas:

| Slug | Why | Notes |
|---|---|---|
| `uber-lyft-rideshare-drivers` | NEW slug — DON'T migrate gig-workers; synonym-rich; PTC + 1099 focus; tests CA Prop 22 state-specific section | category: Self-Employment; ctaTarget: screener; tests synonym discipline at maximum density |
| `freelance-designers-consultants` | NEW; 1099 + self-employed overlap; Form 7206 + Schedule SE caveat; tests Schedule C synonym set | category: Self-Employment; ctaTarget: screener; tests household-size table for income-gating |
| `college-students` | NEW; CHIP / parent coverage / student plan tradeoffs; tests catastrophic plan eligibility (under-30); tests "Form 7206 N/A" pattern | category: Age / Life Stage; ctaTarget: screener; tests under-30 catastrophic eligibility |
| `recently-lost-employer-coverage` | NEW; COBRA vs Marketplace SEP — overlap with `/event/lost-job`; tests linking-out pattern; tests SEP shape | category: Employment Status; ctaTarget: screener; MUST link to `/event/just-lost-job-health-insurance` |
| `early-retirees` | NEW; transitioning from employer plan to Medicare; tests IRMAA awareness; tests pre-Medicare PTC + post-Medicare hand-off | category: Age / Life Stage; ctaTarget: screener; tests Medicare-eligibility cross-link |

Skip self-employed (existing — Track E will refresh).

**Pre-Phase-4 collision check:**
```bash
ls projects/covered-usa/content/data/personas/*.json | xargs -n1 basename | sed 's/.json//'
```
Confirm none of your 5 planned slugs match existing SHIPPED slugs (currently: gig-workers, self-employed).

**Important note on `_queue.json` overlap (intentional, not a collision):**
Two of the 5 test slugs (`college-students` + `early-retirees`) appear in `content/data/personas/_queue.json` with status `"queued"`. This is intentional — writing them via Track C **consumes the queued idea early**. The queue is a list of planned personas, not shipped ones. After your Phase 5 commit, the queue entry's status implicitly transitions from "queued" to "shipped" (the slug now has a real JSON file). You do NOT need to edit `_queue.json` to remove these entries — the build validator looks at `*.json` files in the directory, not the queue.

`uber-lyft-rideshare-drivers` + `freelance-designers-consultants` + `recently-lost-employer-coverage` are net-new (not in the queue).

**Pass criteria:** 5/5 articles pass strict-mode validators + 4/5 score ≥80% on the rubric. **Plus** every test article has ≥5 distinct persona synonyms (the audit's #1 fix verified) AND every Self-Employment-category article (uber-lyft-rideshare-drivers + freelance-designers-consultants) has Form 7206 + Schedule SE caveat correct.

---

## 8. Common failure modes for persona (watch out for these)

1. **Treating "gig worker" as one synonym.** Writer's training data conflates the persona's canonical term with itself. Force ≥5 distinct synonyms via GATE E reject framing. The current gig-workers page is the canonical example of this failure (29 instances of "gig worker", 0 of "freelancer").
2. **Skipping Form 7206 citation.** Writers love to say "you can deduct your premiums" without naming the actual IRS form. Force "Form 7206" inclusion via GATE I. (Older writers may still emit "Form 1040 Schedule 1 line 17" — that's the LINE the Form 7206 result flows to, but Form 7206 is the calculation form. Both can appear; Form 7206 is the one that must.)
3. **Conflating HSA with FSA.** Different account types, different rules. HSA: requires HDHP pairing, portable, can be opened independently. FSA: employer-only, use-it-or-lose-it (with limited carryover), requires employer plan. Most personas don't have FSA access (no employer); writer must distinguish. The simple rule: if persona is non-W-2, FSA is N/A; only HSA applies.
4. **Claiming "premiums are tax-deductible" without distinguishing self-employed vs employee.** Self-employed: above-the-line deduction via Form 7206 (100% of premiums; reduces income tax only, NOT SE tax). Employee: pretax payroll deduction if employer offers it (reduces both income tax AND payroll tax on the employee side, but only for employer plans). Conflating these two produces wrong advice. Verifier MUST flag any "tax-deductible" claim that doesn't specify which tax + which mechanism.
5. **Skipping state-specific stipend / portable-benefits programs.** California Prop 22 (2020) requires Uber/Lyft/DoorDash to offer healthcare stipend to gig drivers averaging 15+ engaged hours/week — this is THE most important state program for the rideshare-drivers test article. Massachusetts Init 1 (2024) similar. NY Freelance Isn't Free Act (2017) protects freelancer payment terms but doesn't offer healthcare. Skipping these for applicable personas is a §4.7 shape #6 fail.
6. **Claiming PTC subsidies are "available below 400% FPL" as a binary.** Post-2026, the cliff is back — subsidies phase down approaching 400% and stop entirely AT 400%. Writer must use phasedown phrasing, not binary. Premiums climb steeply in the 350-400% range.
7. **Recommending scam products.** Health share ministries (NOT insurance — no consumer protections, no guaranteed coverage, can deny pre-existing); short-term limited duration plans (don't cover pre-existing, can rescind, sub-ACA quality); discount plans (NOT insurance, just network discounts). Verifier flags these regardless of source.
8. **Pronoun discipline failures.** `introParagraphs[1]` opens with "This guide covers..." in gig-workers.json — the same template tic flagged in MA-state. Writer must lead with named entity (the persona term, not "this guide" or "these workers" or "they").
9. **`optionDetails.length !== optionsOverview.rows.length`.** The most common persona-specific drafter mistake. Writer adds a 5th optionDetails entry without a matching row, or vice versa. Validator catches at build but cron logs are noisy. Writer's STEP 6 self-check must verify this 1-to-1 correspondence.

---

## 9. Verifier scope (Phase 4.5 — per master brief)

Update `.claude/agents/coveredusa-persona-verifier.md` to mirror the writer's new GATES.

**Non-negotiable patches per master brief Phase 4.5 (3 things to apply):**

1. **Path portability:** `/Users/frankthebot/...` → `$HOME/clawd/...` everywhere
2. **Add dual-purpose framing** in YOUR TASK section (numeric/factual auto-fix + structural detect-only). Copy the framing from `coveredusa-ma-state-verifier.md`.
3. **Insert STEP 1C: structural GATE detection** with all 4 universal + all 5 persona-specific GATES (mirror writer's STEP 6). Persona-specific gates are E (synonym density), F (PTC section), G (HSA/FSA section), H (state-specific stipend flag), I (Form 7206 + Schedule SE caveat for Self-Employment).

**3 mandatory patches from the load-test (apply BOTH writer + verifier sides):**

- **GATE F count strictness (writer side):** strict count check on detailSections / required H2s / synonym occurrences. Don't trust writer self-report. If §4.7 requires N detailSections, writer's STEP 6 must run a strict count: `if (JSON.parse(file).detailSections.length < 2) REJECT`. Synonym count likewise: `for each declared synonym in keyTerms.en, count occurrences in body; if <3 distinct synonyms with ≥2 occurrences each, REJECT`.
- **`keyTerms` shape example (writer side):** embed the `{en: [...], es: [...]}` template in the writer prompt with explicit "do NOT emit flat array" rule. For persona, `keyTerms.en` is where the synonym list LIVES — emit `{en: ["rideshare driver", "Uber driver", "Lyft driver", "DoorDash driver", "1099 contractor", "freelancer", "independent contractor", "sole proprietor"], es: ["conductor de viajes compartidos", "conductor de Uber", ...]}`.
- **GATE D auto-fix hoist (verifier side):** "AUTO-FIX MANDATORY" framing + Common-verifier-error callout naming the Ohio MA-state failure mode. self-employed.json has 8-10 em-dashes per audit — verifier must auto-fix on regen, not advisory-flag.

**Routing per gate (persona-specific):**
- GATE A FAIL → HOLD
- GATE B → CONDITIONAL — required for income-gated personas (gig-driver, freelance-consultant, lost-coverage); N/A for pure-status personas (college-students with parent coverage, early-retirees Medicare-bound). When N/A, verifier marks `gates.b: "n/a"` and skips. When applicable, FAIL → HOLD.
- GATE C FAIL (0-1 .gov) → HOLD; WARN (2) → ship + LOW flag
- GATE D FAIL → AUTO-FIX as style correction
- GATE E FAIL (synonym density <3) → HOLD; WARN (3-4) → ship + MEDIUM flag
- GATE F FAIL (PTC section absent for marketplace-coverage personas) → HOLD; N/A for non-marketplace-primary personas
- GATE G FAIL (HSA/FSA section absent) → ship + MEDIUM flag (don't HOLD — less critical than synonym density)
- GATE H FAIL (state-specific stipend absent where applicable) → ship + LOW flag
- GATE I FAIL ("reduces both income tax and SE tax" appears) → HOLD (factual error); auto-fix to correct phrasing if feasible

**Verifier test:** after updating the verifier, run it on the 5 Phase-4 test articles. Expected: all `approved` or `corrected` (no false HOLDs). If any spurious HOLD: tighten the verifier prompt before shipping. Common over-fire: GATE B applied to college-students; GATE F applied where PTC is mentioned in passing; GATE E counting synonyms in keyTerms but not in body.

**New verifier check — synonym density (specific to persona):**
```
For each synonym S in JSON.keyTerms.en:
  count = occurrences of S (case-insensitive, word-boundary) in CONCATENATED body
          (personaName + hero + quickAnswer + introParagraphs + optionsOverview rows + optionDetails paragraphs + traps rows + detailSections paragraphs + faqs.en answers)
  if count >= 2: distinct_count += 1
if distinct_count < 3: GATE E FAIL (HOLD)
elif distinct_count < 5: GATE E WARN (ship + MEDIUM flag)
else: GATE E PASS
```

---

## 10. Atomic deliverable (Phase 5 — 4 commits)

Per master brief §3 Phase 5:

1. **Commit 1 (clawd-workspace):** `.bak` move + new persona-writer prompt
2. **Commit 2 (covered-usa):** 5 test articles in `content/data/personas/<slug>.json` + any verifier-caught corrections from Phase 4.5
3. **Commit 3 (covered-usa):** Requirements matrix + 3 verifier reports + retest verifier output in `content/fanout/analysis/c-persona-*.md`
4. **Commit 4 (clawd-workspace):** `.bak` move + new persona-verifier prompt (paired with the writer ship)

**Push order:** clawd-workspace first (writer + verifier prompts go live for any cron pickup), then covered-usa (test articles deploy to Vercel).

**Memory entry:** write `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_track_c_persona_writer_shipped.md` with:
- Per-article scores from Phase 4 verifier
- Synonym density per article (the audit's #1 metric — confirm the fix landed)
- Per-article shape coverage (X / 8) — confirm we beat self-employed's 5.5/8 baseline
- Any new lessons learned (especially around state-stipend research; CA Prop 22 + MA Init 1 verification process)
- Specific drift caught by the verifier (Schedule SE hallucinations especially)
- Patches you applied that aren't in the master-brief 3-patch list (would be candidates for future master-brief upgrade)
- 5-line summary of the 5 shipped personas (slug, word count, status, gates result, synonym count)

---

## 11. Pre-flight checklist (run BEFORE Phase 1)

```bash
# 1. Pull latest on both repos
cd ~/clawd && git pull origin main
cd ~/clawd/projects/covered-usa && git pull origin main

# 2. Confirm reference implementations exist
ls -la ~/clawd/.claude/agents/coveredusa-ma-state-writer.md \
       ~/clawd/.claude/agents/coveredusa-ma-state-verifier.md \
       ~/clawd/.claude/agents/coveredusa-article-verifier.md

# 3. Confirm audit JSON exists
ls -la ~/clawd/projects/covered-usa/content/fanout/analysis/audit-persona-writer.json

# 4. Confirm gold-standard JSON exists
ls -la ~/clawd/projects/covered-usa/content/data/personas/self-employed.json

# 5. Slug collision check
ls ~/clawd/projects/covered-usa/content/data/personas/*.json | xargs -n1 basename | sed 's/.json//'
# Expected output: gig-workers, self-employed (your 5 test slugs must NOT collide)

# 6. Validator baseline (run BEFORE you start; should be 0 bad)
cd ~/clawd/projects/covered-usa && node scripts/validate-personas.js 2>&1 | tail -10

# 7. Synonym baseline check on gig-workers (the canonical synonym-failure case)
grep -ic "freelancer\|contractor\|rideshare\|sole proprietor" \
  ~/clawd/projects/covered-usa/content/data/personas/gig-workers.json
# Expected: 0 — confirms the audit finding still holds at the moment you start
```

If any of these fail or surprise you, surface to Jacob BEFORE proceeding. Don't guess at scope.

---

## 12. Quick reference card (post on monitor while working)

- **Master brief:** `projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md`
- **Reference writer:** `.claude/agents/coveredusa-ma-state-writer.md`
- **Reference verifiers:** `.claude/agents/coveredusa-ma-state-verifier.md` + `.claude/agents/coveredusa-article-verifier.md`
- **Sibling PRD (structural template):** `specs/track-c-prime/procedure-prd.md`
- **Your writer file:** `.claude/agents/coveredusa-persona-writer.md`
- **Your verifier file:** `.claude/agents/coveredusa-persona-verifier.md`
- **Schema interface:** `projects/covered-usa/src/lib/personas.ts` → `Persona`
- **Recipe:** FANOUT_FORMULA.md §4.7 (8/8 Bing-validated shapes — tied for highest in codebase)
- **Audit:** `content/fanout/analysis/audit-persona-writer.json`
- **Gold standard:** `content/data/personas/self-employed.json` (5.5/8 shapes, 69% fan-out, strong synonym density)
- **Worst-case reference:** `content/data/personas/gig-workers.json` (1.5/8 shapes, 19% fan-out, ZERO synonyms — the canonical "what NOT to do")
- **Output dir:** `content/data/personas/`
- **Phase 4 test slugs:** uber-lyft-rideshare-drivers, freelance-designers-consultants, college-students, recently-lost-employer-coverage, early-retirees
- **Universal GATES:** A (slug-no-year, HOLD), B (CONDITIONAL — income-gated personas only), C (≥3 .gov, HOLD if 0-1), D (no `--`, AUTO-FIX)
- **Persona GATES:** E (synonym density ≥5, HOLD if <3), F (PTC section, HOLD for marketplace personas), G (HSA/FSA section, flag MEDIUM), H (state stipend, flag LOW), I (Form 7206 + Schedule SE caveat for Self-Employment, HOLD on factual error)
- **Required vocabulary:** "Premium Tax Credit" / "PTC", "Health Savings Account" / "HSA", "Flexible Spending Account" / "FSA", "Form 7206", "1099 contractor", "Marketplace SEP", "catastrophic plan", "Section 1095-A"
- **4-commit deliverable:** writer prompt + 5 test articles + analysis files + verifier prompt
- **Default toward auto-ship:** ~95% / ~4% / ~1% (HOLD only on genuine breakage — synonym <3, PTC absent for marketplace persona, Schedule SE factual error, year-in-slug, 0-1 .gov)

---

*This PRD is self-contained. Combined with the master brief, it has everything a fresh parallel session needs to execute Track C-prime for persona. If anything is unclear or missing, surface to Jacob before proceeding — don't guess at scope.*
