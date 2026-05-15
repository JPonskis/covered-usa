# Q&A Writer + Verifier PRD (Track C-prime)

**Template:** qa (`/qa/[question]`)
**Files you will modify:** `.claude/agents/coveredusa-qa-writer.md` + `.claude/agents/coveredusa-qa-verifier.md`
**Output directory:** `projects/covered-usa/content/data/qa/`
**Estimated time:** 5-6 hours
**Status:** existing writer is solid for the §4.3 coverage variant (3 of 3 audited pages ship-ready with light edits) but STRUCTURALLY INADEQUATE for the §4.4 state-eligibility variant (no state brand list, no household-size table, no how-to-apply block, no documents checklist, no common-denial-reasons callout). The unique architectural complexity: ONE writer must dispatch on a `subtype` input field, branching the rest of the prompt between two disjoint recipes.

---

## 0. Read order (MANDATORY before starting any phase)

1. **`projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md`** through §4 (shared framing + 4-phase pattern) + §3.5 (default-toward-ship) + §6 (held-queue mechanism) + Appendix A (real-world drift case studies) + Appendix B (writer-leaks pattern). The master brief is the source of truth.
2. **This PRD** end-to-end before spawning any agents. Pay special attention to §3.5 — subtype dispatch is the unique architectural mechanic and the entire reason this template is the most complex of the 7.
3. **`~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_b1_blog_writer_shipped.md`** — the 8 B1 lessons.
4. **Reference implementations** (READ — do not modify in your session):
   - `.claude/agents/coveredusa-ma-state-writer.md` (the cleanest example of Track C-prime writer pattern; copy structure)
   - `.claude/agents/coveredusa-ma-state-verifier.md` (the cleanest example of Track C-prime verifier pattern with all 3 patches applied; copy structure)
   - `.claude/agents/coveredusa-article-verifier.md` (B1 + Track C-prime; daily blog verifier)
   - `.claude/agents/coveredusa-procedure-writer-prd.md` reference at `specs/track-c-prime/procedure-prd.md` — your structural template; this PRD copies its section structure 0-12 and ADDS §3.5 for subtype dispatch
5. **Source docs cited in §1 below** — Phase 1 planner will read these; you should skim them first.

If you skip step 1 or 4, you'll re-discover lessons we already learned tonight. Don't. The Q&A template is the one where skipping the verifier framing will hurt you most — half your test articles use a recipe (§4.4) that the current writer has never produced before, so verifier independence is the only safety net.

---

## 1. Context inventory (Phase 1 planner reads these)

| Doc | What it tells you |
|---|---|
| `.claude/agents/coveredusa-qa-writer.md` | Current writer prompt — solid for coverage; missing state-eligibility entirely |
| `.claude/agents/coveredusa-qa-verifier.md` | Current verifier — strong on fact-check categories A-I + Case 1-bis fullAnswer-flag rule; missing structural gates |
| `.claude/agents/_universal-rules-block.md` | The 5 universal rules + 19-state program brand list (Medi-Cal, AHCCCS, SoonerCare, BadgerCare, etc.) — CRITICAL for state-eligibility subtype |
| `projects/covered-usa/specs/FANOUT_FORMULA.md` §3 + **§4.3** + **§4.4** | Universal rules + BOTH coverage and state-eligibility recipes — read both in full |
| `projects/covered-usa/specs/AI_OPTIMIZATION_FRAMEWORK.md` | Framework these recipes derive from |
| `projects/covered-usa/specs/URL_SLUG_FRAMEWORK.md` | Slug rules — never migrate existing slugs |
| `projects/covered-usa/specs/LINK_TARGET_MANIFEST.md` | Link routing system |
| `projects/covered-usa/specs/CURRENT_STATE_AUDIT.md` §4.X | Cross-template audit findings |
| `projects/covered-usa/content/fanout/analysis/audit-qa-writer.json` | **THE most important doc** — synthesized audit of 3 existing pages with subtype-split feasibility analysis (§D), top 3 immediate writer edits, and explicit "ONE writer with subtype dispatch, NOT two writers" decision |
| `projects/covered-usa/specs/PHASE_5_BRIDGE.md` §3 | Track C bridge context |
| `projects/covered-usa/src/lib/qa.ts` | The `QA` TypeScript interface — your hard contract; you may need to extend it (see §2 below) |
| `projects/covered-usa/content/data/qa/does-medicaid-cover-rehab.json` | **Gold standard structural reference** for coverage subtype |
| `projects/covered-usa/content/data/qa/does-medicare-cover-dental.json`, `does-medicare-cover-vision.json` | Other existing pages (both coverage subtype) |

**No state-eligibility page exists yet.** That makes this PRD's Phase 4 the first time §4.4 has produced output — Verifier independence + the 5-gate STEP 6 will be doing real work.

---

## 2. Schema reminder + hard contracts

The `QA` interface (`projects/covered-usa/src/lib/qa.ts`) is your hard contract. Required top-level fields:

- `slug` (lowercase, hyphens — also the JSON filename)
- `question: LocalizedString` (the canonical question; H1 + QAPage schema)
- `shortAnswer: LocalizedString` (under 80 chars; "Yes / No / It depends" + key qualifier)
- `fullAnswer: LocalizedString` (2-4 sentences; becomes schema.acceptedAnswer — definitive for AI engines)
- `category: QACategory` (locked enum: Medicare | Medicaid | ACA | CHIP | Hospital Bills | Prescription Drugs | Coverage Q&A)
- `topic: string` (non-localized; schema.about)
- `medicalSpecialty: string` (schema.org medicalSpecialty)
- `ctaTarget: QACtaTarget` (locked enum: screener | analyzer)
- `pageType?: QAPageType` (coverage | terminology | definition | eligibility — currently soft; will become required + branch-determining in the rewrite)
- `lastUpdated` (ISO date YYYY-MM-DD)
- `readingTime` (string, e.g., "6 min read")
- `meta: {title, description}` (LocalizedString; **title ≤ 70 chars, description ≤ 160 chars**)
- `hero: {h1}` (LocalizedString; usually question + " (2026)" suffix)
- `introParagraphs: LocalizedString[]` (1-2 entries)
- `coverageBreakdown?: CoverageBreakdown` (REQUIRED when pageType=coverage; OPTIONAL when terminology/definition; for eligibility include only if natural — see §3.5 below)
- `detailSections: DetailSection[]` (MIN 2; see §3.5 for subtype-specific H2 sets)
- `faqs: {en: LocalizedFAQ[], es: LocalizedFAQ[]}` (NOT LocalizedString — FAQ question/answer are flat strings)
- `relatedLinks: RelatedLink[]`
- `sources: QASource[]`

**Additive Track C-prime fields (emit these too — clears `content-quality.js` warnings + Track A1 forward-compat):**
- `topicCluster: "medicare-coverage" | "medicare-eligibility" | "aca-coverage" | "medicaid-coverage" | "medicaid-income-<state>" | "medicaid-eligibility-<state>"` (kebab-case; per audit recommendation §C-1 the cluster signals subtype)
- `keyTerms: {en: string[], es: string[]}` (NOT a flat array — flat array triggers content-quality warning)
- `isLighthouse: false`
- `isDeprecated: false`
- `subtype: "coverage" | "state-eligibility"` (NEW — the dispatch input; you may also emit as audit metadata)

**Schema extension you may need (audit §C-6 calls this out):** the state-eligibility subtype requires fields that don't exist in the current `QA` interface:
- `householdSizeTable` (optional; 9-row table — sizes 1-8 + each-additional — with income limits + year-tagged caption + source)
- `howToApply` (optional; numberedSteps[3-7], govStartingUrl, documentsNeeded[], commonDenialReasons[])
- `stateBrand` (optional; the canonical brand name like "Medi-Cal" / "SoonerCare" / "AHCCCS" used throughout the page)

**Two paths for the schema extension (pick ONE in Phase 2, document in commit message):**

1. **Add to `src/lib/qa.ts` as optional fields** — preferred. Renderer-side changes can land in a follow-up Track E commit; until then the JSON ships with the data and the page template just doesn't render it (graceful degrade). Pro: writer + verifier can enforce the structure from day one. Con: requires a tiny schema edit + may cause `content-quality.js` to warn until renderer catches up.
2. **Embed inside `detailSections[]` as conventional sections** — fallback. The state-eligibility page renders the household-size table as a `detailSection.table`, the numbered steps as a `detailSection.list`, the documents-needed as another `detailSection.list`. Pro: no schema change. Con: writer/verifier enforcement is structural-by-convention, not type-checked. The verifier must grep for the specific captions.

If you take path 2, the verifier STEP 1C gates grep against `detailSections[].heading` and `detailSections[].table.caption` to confirm presence. Either path works; document your choice.

**Hard contracts (NEVER violate):**
1. JSON return shape from STEP 8 must be `{slug, status, ...}` parseable by the cron
2. Atomic write pattern: `<slug>.tmp.json` first → validate JSON parses → rename to `<slug>.json`
3. `## STEP N` numbered headings (cron may parse for logging)
4. Schema interface conformance — extra fields are silently ignored at runtime, but missing required fields crash the build
5. FAQ question/answer are FLAT STRINGS, not LocalizedString objects (the most common drafter mistake)
6. Spanish parity — every LocalizedString needs both `en` AND `es`
7. No em-dash `—` (U+2014), no en-dash `–`, no double-hyphen `--` anywhere
8. `pageType` and `subtype` MUST be consistent: pageType=coverage ↔ subtype=coverage; pageType=eligibility ↔ subtype=state-eligibility. Inconsistent emit = REJECT.

---

## 3. The §4.3 + §4.4 recipes (expanded with worked examples)

**FANOUT_FORMULA.md §4.3 — Medicare-coverage variant distribution:** Entailment 38.4% / Equivalent 36.8% / Specification 24.9%. Bing-validated shapes: 3 of 8 (weak — Medicare-coverage shapes are LLM-proxy-heavy, less Bing-validated than state-eligibility).

**FANOUT_FORMULA.md §4.4 — state-Medicaid variant.** Multiple Bing-validated shapes (state-Medicaid income limits, state-named brand + year, state Medicaid application). The brand-name shape (`medi-cal income limits 2026`, `ahcccs eligibility 2026`) is the highest-leverage gap.

### §4.3 (coverage) — required H2s + dominant shapes

Top 8 dominant shapes — apply ALL of these when subtype=coverage:

1. **Medicare Advantage [topic] benefits + year + .gov source** — Specification, top weight. Render as required H2 "What Medicare Advantage may add (2026)" with concrete benefit examples + medicare.gov inline citation.
2. **Original Medicare vs Medicare Advantage on [topic]** — Specification (comparison). Render as `coverageBreakdown` table with 3-4 rows: Original Medicare / Medicare Advantage / Medigap / Standalone supplemental — year-anchored caption like "X coverage by plan type 2026".
3. **Medicare [topic] coverage + year + .gov source** — Equivalent, top weight. Render in `fullAnswer` + first detailSection.
4. **Standalone supplemental [topic] insurance** — Entailment. Required H2 "Standalone supplemental options" with discount-plan / private-policy callouts.
5. **Out-of-pocket cost without coverage** — Specification. Required H2 "Cost without coverage (2026)" with concrete dollar ranges.
6. **Eligibility criteria for [topic] benefit** — Entailment. Required H2 "Eligibility criteria" for the benefit itself (not the program — e.g., glaucoma screening eligibility within Part B).

**Required H2 set (coverage subtype):**
- "Direct answer" (≤ 80 words; Yes / No / It depends + the key qualifier; this is the GATE E content)
- "What Original Medicare covers"
- "What Medicare Advantage may add (2026)"
- "Cost without coverage (2026)"
- "Standalone supplemental options"
- "Eligibility criteria"
- "How to find a plan that covers [thing]"
- "FAQ on alternatives" (when answer is No / It depends — see GATE G-cov below)

**Required FAQ topics (coverage subtype, 6-8 FAQs):**
1. **Does Original Medicare cover [thing]?** (the canonical Q)
2. **Does Medicare Advantage cover [thing]?**
3. **What is the cost without coverage?**
4. **What standalone insurance options exist?**
5. **Are there state-specific programs for [thing]?**
6. **When does Medicare cover [thing] medically necessary?** (the exception case)
7. *(For No / It depends answers)* **What are alternatives if Medicare doesn't cover [thing]?**
8. *(Comparison FAQ where applicable)* **What's the difference between [thing] and [adjacent thing]?**

**Required vocabulary (coverage subtype, per audit §C-2 + universal):**
- "Original Medicare"
- "Medicare Part A"
- "Medicare Part B"
- "Medicare Part D"
- "Medicare Advantage"
- "Medigap"
- "ACA-compliant"
- "preexisting condition" (when relevant)
- "essential health benefits" (when relevant)

### §4.4 (state-eligibility) — required H2s + dominant shapes

Top 6 dominant shapes — apply ALL when subtype=state-eligibility:

1. **State Medicaid income limits + state + year** — Specification, top weight, Bing-validated. Render as `householdSizeTable` with 9 rows (sizes 1-8 + each-additional) + year-anchored caption like "Medi-Cal income limits by household size 2026".
2. **State-named program brand + year** — Canonicalization, Bing-validated. Use the brand throughout per RULE 1. Title, H1, meta, every H2 first sentence, every table caption. Generic "[state] Medicaid" when a brand exists = GATE G-elig FAIL.
3. **State Medicaid application process** — Entailment, Bing-validated. Required H2 "How to apply for [brand]" with numberedSteps[3-7] + govStartingUrl.
4. **State Medicaid expansion status + ACA gap** — Specification. Required H2 "Is [state] a Medicaid expansion state?" with expansion status + ACA-gap explanation (10 non-expansion states list when relevant).
5. **State Medicaid + family size + year** — Specification. Covered by the 9-row table; reinforce in FAQ ("What's the income limit for a family of 4 in [state]?").
6. **State Medicaid eligibility documents needed** — Entailment. Required H2 "Documents needed to apply" with 4-8 item bullet checklist.

**Required H2 set (state-eligibility subtype):**
- "Direct answer" (≤ 80 words; Yes / No / It depends + the key qualifier — GATE E)
- "[Brand] income limits by household size (2026)" — must include the 9-row table (GATE F-elig)
- "How to apply for [Brand]" (numberedSteps + govStartingUrl)
- "Documents needed to apply"
- "Is [state] a Medicaid expansion state?" (expansion status + ACA gap context)
- "Common reasons applications get denied"
- "How to appeal a denial"
- "[Brand] context" (what the program covers, who runs it, when it started — short)

**Required FAQ topics (state-eligibility subtype, 6-8 FAQs):**
1. **What is the income limit for a family of 4 in [state] (2026)?**
2. **What counts as income for [Brand]?**
3. **What documents do I need to apply?**
4. **What happens if I'm denied?**
5. **Can I work and still get [Brand]?**
6. **Is [state] a Medicaid expansion state?**
7. **How long does the application process take?**
8. **What's the difference between [Brand] and Medicare?** (when comparison adds value)

**Required vocabulary (state-eligibility subtype):**
- The state-program brand (e.g., "Medi-Cal", "SoonerCare", "AHCCCS", "MNsure" — see universal RULE 1 19-state list)
- "Medicaid expansion"
- "ACA gap" (when state is non-expansion)
- "138% FPL"
- "Federal Poverty Level"
- "family size"
- "household composition"
- "MAGI" (Modified Adjusted Gross Income)

### Year-anchoring (RULE 4 — applies to both subtypes)

Every dollar amount + percentage must have a year in the same sentence or table caption. **2026 anchor facts (CRITICAL — don't drift):**

- Medicare 2026 Part B deductible: **$283** (NOT $257 — old)
- Medicare 2026 Part B premium: **$202.90/mo**
- Medicare 2026 Part A inpatient deductible: **$1,736**
- Medicare 2026 Part D OOP cap: **$2,100**
- Medicare 2026 Part D insulin cap: **$35/month** (per IRA 2022)
- IRA signed Aug 16, **2022** (NOT 2023)
- ACA subsidy cliff is BACK for 2026 (enhanced PTCs from ARPA/IRA expired Jan 1, 2026)
- 2026 FPL household-of-1 = **$15,960** (48 states)
- 2026 FPL household-of-4 = **$33,000** (48 states)
- 2026 ACA marketplace used 2025 FPL ($15,650 for household-of-1)
- 40 states + DC expanded Medicaid; **10 have not (AL, FL, GA, KS, MS, SC, TN, TX, WI, WY)**
- NC expanded Dec 2023; SD expanded July 2023
- 12M Americans dual-eligible

If you see a writer emit `$257 Part B deductible` or `IRA signed 2023` or `enhanced PTCs through 2025` → those are stale. Verifier auto-fixes per Case 3 / Case 4 of the existing verifier.

### State-context

Per RULE 1 + §4.4: state-context is **MANDATORY** when subtype=state-eligibility. State name in title + H1 + meta + first sentence of every H2 + every table caption + every numeric threshold. State-context is N/A when subtype=coverage (unless the question is intrinsically state-scoped — e.g., "Does Medi-Cal cover X?" which is a hybrid; default to coverage subtype but include brand in title).

---

## 3.5 Subtype dispatch (THE unique architectural mechanic — read this twice)

This is what makes Q&A the most complex of the 7 templates. Every other template applies ONE recipe. Q&A applies one of two based on input. The dispatch logic lives in STEP 0 of the writer prompt and BRANCHES the rest of the prompt.

### The architecture

The writer accepts a `subtype` field in INPUTS. Values:

- **`subtype: coverage`** → applies §4.3 recipe (Direct answer + Original Medicare coverage + MA may add + Cost without coverage + Standalone supplemental options + Eligibility criteria + How to find a plan + alternatives FAQ)
- **`subtype: state-eligibility`** → applies §4.4 recipe (State Medicaid income limits + 9-row table + State Medicaid application process + State Medicaid expansion status + ACA gap + State Medicaid + family size + State Medicaid eligibility documents needed + appeals)

### Dispatch order (STEP 0a in the writer prompt — INSERT BEFORE pre-flight in current STEP 0)

The writer's STEP 0a MUST do the following, in order:

1. **Read `subtype` from INPUTS.** If present and ∈ {coverage, state-eligibility}, use it. Skip to step 4.
2. **If `subtype` is missing, infer from `topicCluster`** per these rules:
   - `medicare-*` OR `aca-*` OR `medicaid-coverage-*` → `subtype = coverage`
   - `medicaid-income-*` OR `medicaid-eligibility-*` → `subtype = state-eligibility`
3. **If `subtype` is still ambiguous** (e.g., `topicCluster` is missing or matches neither pattern), check SLUG + CATEGORY + QUESTION text:
   - SLUG matches `medicaid-<state>` / `qualify-for-<state>-medicaid` / `apply-for-medicaid-in-<state>` → `subtype = state-eligibility`
   - SLUG matches `medi-cal` / `soonercare` / `ahcccs` / `mncare` / `badgercare` / `tenncare` / `arhome` / `husky` / `apple-health` / `nj-familycare` / `masshealth` / `hip` / `ohp` / `chp-plus` / `mainecare` / `med-quest` / `allkids` / `kynect` (any of the 19 brand names from universal RULE 1) → `subtype = state-eligibility`
   - CATEGORY = Medicaid AND QUESTION contains "qualify" / "apply" / "do I get" / "income limit" → `subtype = state-eligibility`
   - Otherwise → `subtype = coverage` (default)
4. **If still ambiguous after all 3 rounds, REJECT.** Don't guess — return error JSON: `{"slug": "<input>", "status": "error", "error": "Subtype dispatch failed: cannot determine coverage vs state-eligibility from inputs. Pass explicit subtype field."}`
5. **Persist the resolved subtype** to a local variable used throughout the rest of the prompt + emit it in the JSON output as the `subtype` field for downstream verifier consumption.

### How the BRANCH renders in the rest of the prompt

Every subsequent STEP must reference the resolved subtype. Use this framing throughout:

- **STEP 1 (schema check):** No branch — schema is shared.
- **STEP 2 (research):** Branch primary-source list:
  - subtype=coverage → medicare.gov, healthcare.gov, kff.org, congress.gov
  - subtype=state-eligibility → medicaid.gov + state agency portal (e.g., dhcs.ca.gov for Medi-Cal, oklahoma.gov/ohca for SoonerCare) + KFF state-Medicaid trackers + state-specific .gov
- **STEP 3 (plan structure):** Branch H2 set + required fields:
  - subtype=coverage → §4.3 H2 set (above)
  - subtype=state-eligibility → §4.4 H2 set (above) + householdSizeTable + howToApply + stateBrand fields
- **STEP 4 (frontmatter):** Branch `topicCluster` + `keyTerms`:
  - subtype=coverage → cluster = "medicare-coverage" / "aca-coverage" / "medicaid-coverage"; keyTerms include Medicare/ACA vocab
  - subtype=state-eligibility → cluster = "medicaid-income-<state>" / "medicaid-eligibility-<state>"; keyTerms include the brand + FPL terms
- **STEP 5 (body write):** Branch required vocabulary checklist (see §3 above).
- **STEP 6 (self-validation):** Branch which gates apply (see §6 below).
- **STEP 7 (save):** No branch — atomic write is shared.
- **STEP 8 (return JSON):** Emit `subtype` in the return so the verifier knows which gate set to apply.

### Why ONE writer not two (per audit §D)

The audit's `D_splitTemplateFeasibility` analysis was explicit: ONE writer with hard subtype dispatch, NOT two writers. Reasons:

1. **70% of writer logic is shared:** schema (QA interface), bilingual rules, FAQ shape (flat strings), source rigor, year-anchor facts, atomic-write contract, return-JSON shape, primary-source domain list, 2026 anchor values. Forking duplicates all of this and creates drift risk (one writer gets a 2026 update, the other doesn't).
2. **The 30% that diverges** (required H2s, required fields, brand-list lookup, state-context enforcement, household-size table, howToApply numbered steps) is small enough to express as conditional sections.
3. **Subtype is deterministically detectable** from inputs — no need for separate queue dispatch.
4. **Two writers double the cron-orchestration surface** for no concrete benefit.

The architectural decision is locked. Don't fork into `coveredusa-qa-coverage-writer.md` + `coveredusa-qa-state-eligibility-writer.md` — that path was rejected by the audit.

### `coverageBreakdown` field guidance per subtype

The `QA` schema has an optional `coverageBreakdown?: CoverageBreakdown` field (referenced in §2). When to populate it:

- **subtype=coverage → `coverageBreakdown` is REQUIRED.** Render as a 3-4 row comparison table (Original Medicare / Medicare Advantage / Medigap / Standalone supplemental) with year-anchored caption. This satisfies GATE F-cov. Without it, the page fails the comparison-table mandate.
- **subtype=state-eligibility → `coverageBreakdown` is N/A.** Do NOT populate it. The canonical lookup for state-eligibility is the **9-row household-size income table** (in a dedicated `householdSizeTable` field or rendered as a detailSection table). Using `coverageBreakdown` for state-eligibility creates a structural mismatch — the reader expects an income-by-household lookup, not a plan-type comparison. Mark the field absent in the JSON output (don't emit `coverageBreakdown: null` either — omit the key entirely).

The verifier's GATE F is subtype-aware: GATE F-cov checks for `coverageBreakdown` presence; GATE F-elig checks for `householdSizeTable` or equivalent 9-row content. Never both gates fire on the same page.

### Common subtype-dispatch failure modes (watch for these in Phase 4)

1. **Writer ignores subtype and writes coverage-shaped content for an eligibility question.** Especially likely on the "Do I qualify for Medi-Cal?" test article — the writer's training data has many "does Medicare cover X" patterns and may default to coverage shape. STEP 0a + GATE F-elig catch this.
2. **Writer dispatches to coverage when state-eligibility was specified.** If subtype is explicitly `state-eligibility` in INPUTS, the writer MUST honor it even if other signals (CATEGORY, QUESTION) lean coverage.
3. **Writer emits both H2 sets** (writes ALL the H2s — both §4.3 and §4.4 — resulting in a 3,000-word page). STEP 6 GATE H-dispatch checks the H2 count + types match one subtype exclusively.
4. **Writer infers wrong subtype** when `subtype` is missing. The fallback chain (topicCluster → slug regex → category+question) must be deterministic. If you can't determine confidently, REJECT — don't guess.
5. **Writer drops the brand on state-eligibility.** Says "California Medicaid" instead of "Medi-Cal" throughout. Universal RULE 1 + GATE G-elig catch this.
6. **Writer mixes pageType and subtype.** Emits `pageType: "coverage"` with `subtype: "state-eligibility"`. STEP 6 GATE I-consistency rejects this.

---

## 4. Audit findings synthesized (read `audit-qa-writer.json` for the full version)

**Pages audited:** does-medicaid-cover-rehab (gold standard), does-medicare-cover-dental, does-medicare-cover-vision. All 3 are coverage subtype. Verdict: STRONG for §4.3 coverage; READY TO SHIP with light edits (≤ 15 min each).

**THE biggest gap:** the §4.4 state-eligibility subtype has never been produced. The current writer cannot write a state-eligibility Q&A. Adding the subtype dispatch + the §4.4 branch is the single highest-ROI change in the rewrite.

**6 recommended writer edits (WE-1 through WE-6 from audit §C — your new writer must implement WE-1, WE-2, WE-3, WE-4 as required; WE-5, WE-6 as strongly recommended):**

- **WE-1 (HIGH, S effort):** Add STEP 0a Subtype dispatch (per §3.5 above). 10-line block. Detect from `subtype` input → `topicCluster` → SLUG/CATEGORY/QUESTION. Default to coverage if all signals neutral. REJECT if ambiguous.
- **WE-2 (HIGH, M effort):** Add state-eligibility BRANCH to STEP 3 with the new required fields (householdSizeTable with 9 rows + year-tagged caption, howToApply.numberedSteps[3-7], howToApply.govStartingUrl, howToApply.documentsNeeded[4-8 items], howToApply.commonDenialReasons[3-5 items], stateBrand, state-context-everywhere checklist, 19-state brand list referenced from universal-rules-block).
- **WE-3 (HIGH, S effort):** Add universal howToApply block to ALL Q&A pages (both subtypes) per universal RULE 3. Coverage pages get a thinner version (when-to-enroll-in-MA-for-supplement, OEP/AEP dates). State-eligibility gets the full numbered application workflow.
- **WE-4 (MED, S effort):** Tighten `ctaTarget` enforcement: any page citing a dollar amount > $50 MUST use `ctaTarget: analyzer` unless the question is fundamentally who-qualifies. Adds an explicit override paragraph. Forces existing dental + vision pages to flip from screener to analyzer (consistent with cost-curious-user-wins thesis).
- **WE-5 (MED, S effort):** Update coverageBreakdown caption guidance to use lookup-phrasing per §3.10: "X coverage by plan type 2026", "[Brand] income limits by household size 2026", "Services covered by service type 2026".
- **WE-6 (LOW, S effort):** Schema extension — verify `src/lib/qa.ts` supports new optional fields (householdSizeTable, howToApply, stateBrand, subtype). Either extend the interface (preferred per §2 path 1) or embed in detailSections per path 2.

---

## 5. Universal GATES (recap from master brief §7) — applicability varies by subtype

- **GATE A — slug must NOT contain a year.** Q&A slugs are pure question phrases (`does-medicare-cover-hearing-aids`, `do-i-qualify-for-medi-cal-california`). Never `does-medicare-cover-hearing-aids-2026`. **UNIVERSAL — applies to both subtypes.** **HOLD on fail.**
- **GATE B — household-size table with exactly 9 data rows.** **CONDITIONAL on subtype:**
  - `subtype: coverage` → **N/A.** Mark `gates.b: "n/a"`. Don't require.
  - `subtype: state-eligibility` → **APPLIES, REQUIRED.** 9 data rows (sizes 1, 2, 3, 4, 5, 6, 7, 8 + "each additional person"). Year-tagged caption. **HOLD if absent or row count != 9.**
- **GATE C — ≥3 inline outbound .gov / .edu / kff.org citations** with domain visible in anchor text. **UNIVERSAL.** For state-eligibility: federal source (medicaid.gov) + state agency portal (HYPERLINKED, not plain text) + 1 third-party authority (KFF). For coverage: medicare.gov + healthcare.gov + KFF. **HOLD on 0-1 .gov citations; WARN on exactly 2.**
- **GATE D — zero `--` (double-hyphen) anywhere. UNIVERSAL.** **AUTO-FIX as style correction; never HOLD.** Per master brief Phase 4.5 patches — "AUTO-FIX MANDATORY" framing on the verifier side.

---

## 6. Q&A-specific GATES (your STEP 6 additions — conditional on subtype)

Frame these at STEP 6 with "STOP. Read this twice." language. Read which gates apply based on the resolved subtype.

### GATE E — Direct-answer (≤ 80 words) MUST be present — UNIVERSAL (both subtypes)

The page MUST open with a Direct-answer block. Top of body or first detailSection.heading = "Direct answer" / "Quick answer" / equivalent. Content requirements:

- ≤ 80 words (verifier counts words via `wc -w` on the EN field — strict)
- Contains explicit "Yes" / "No" / "It depends" / "Sometimes" as the literal first or second word
- Followed by the key qualifier (e.g., "Yes, but only if medically necessary for jaw surgery" / "No, Original Medicare does not cover hearing aids; Medicare Advantage may add limited benefits")
- This is the content that becomes schema.acceptedAnswer + the Bing-cited definitive answer

**Routing:** PASS if present + ≤ 80 words + has explicit Yes/No/It-depends keyword; **HOLD if missing or > 80 words or no decisive keyword.**

### GATE F — STRUCTURAL (subtype-specific)

#### GATE F-cov (subtype: coverage) — comparison table MUST be present

`coverageBreakdown` MUST be present with at least 3 rows comparing Original Medicare / Medicare Advantage / (Medigap | Standalone supplemental | Other). Year-tagged caption ("X coverage by plan type 2026"). Status cells used correctly (yes/no/partial coherent with cell text per existing verifier Category B).

**Routing:** PASS if present + ≥ 3 rows + year-tagged caption; WARN if present but < 3 rows; **HOLD if absent entirely.**

#### GATE F-elig (subtype: state-eligibility) — 9-row household-size income table MUST be present

The page MUST contain a household-size lookup table with exactly 9 data rows (sizes 1-8 + each-additional). Year-tagged caption including the state brand (e.g., "Medi-Cal income limits by household size 2026"). Income thresholds year-anchored against 2026 FPL ($15,960 hh-of-1 / $33,000 hh-of-4 for 48 states; AK + HI have separate FPL values).

**Routing:** PASS if 9 data rows + year + brand in caption; **HOLD if missing, wrong row count, or no year/brand in caption.**

### GATE G — STRUCTURAL (subtype-specific)

#### GATE G-cov (subtype: coverage) — alternative options when answer is No / It depends

If shortAnswer / fullAnswer is "No" or "It depends", the page MUST include an "Alternatives" section (H2 or detailSection) listing concrete alternatives (e.g., "Medicare doesn't cover hearing aids, but here are 5 alternatives: 1. Medicare Advantage plans with hearing benefit; 2. VA benefits for veterans; 3. State assistance programs; 4. Dental discount plans bundled with hearing; 5. Costco / Sam's Club hearing aid programs").

**Routing:** PASS if "No"/"It depends" answer + alternatives section present; WARN if answer is "Yes" (gate doesn't apply); **HOLD if "No"/"It depends" without alternatives section.**

#### GATE G-elig (subtype: state-eligibility) — state-named brand used throughout

The state-program brand from universal RULE 1's 19-state list MUST be used as the page's primary entity. Generic "[state] Medicaid" when a brand exists = FAIL. Specifically:

- Title contains brand (not generic)
- H1 contains brand
- Meta description contains brand
- First sentence of every H2 contains brand
- Every table caption contains brand
- `stateBrand` field populated (if path 1) OR explicit brand mention in introParagraphs[0] (if path 2)

Brand list (re-anchored from `_universal-rules-block.md`):
California → Medi-Cal | California → CalFresh (SNAP context) | Arizona → AHCCCS | Minnesota → MNsure | Oklahoma → SoonerCare | Maine → MaineCare | Wisconsin → BadgerCare | Illinois → AllKids | Tennessee → TennCare | Arkansas → ARHOME | New Jersey → NJ FamilyCare | Massachusetts → MassHealth | Indiana → HIP | Oregon → OHP | Colorado → CHP+ | Kentucky → kynect (marketplace) | Connecticut → HUSKY Health | Hawaii → Med-QUEST | Washington → Apple Health.

**Routing:** PASS if brand used in all 5 required surfaces; WARN if 1-2 surfaces use generic; **HOLD if brand exists but page uses generic "[state] Medicaid" throughout.**

### GATE H — Required vocabulary present (subtype-specific)

Run grep against the JSON body for the canonical terms (see §3 above):
- Coverage subtype: 9 terms (Original Medicare, Part A, Part B, Part D, MA, Medigap, ACA-compliant, preexisting condition, essential health benefits)
- State-eligibility subtype: 8 terms (brand, Medicaid expansion, ACA gap, 138% FPL, Federal Poverty Level, family size, household composition, MAGI)

**Routing:** PASS if all present; WARN if 1-2 missing; FAIL → ship + MEDIUM flag if 3+ missing (writer-side concern; don't HOLD).

### GATE I — pageType / subtype consistency — UNIVERSAL

Verify `pageType` matches `subtype`:
- `subtype: coverage` → `pageType: "coverage"` (or "terminology" / "definition" for non-matrix coverage Q&As)
- `subtype: state-eligibility` → `pageType: "eligibility"`

Mismatch = REJECT. **HOLD on inconsistency.**

### GATE H-dispatch — subtype dispatch sanity — UNIVERSAL

Verify the page's H2 set matches its declared subtype:
- subtype=coverage → H2s match §4.3 set (look for "Original Medicare" / "Medicare Advantage" / "Standalone supplemental" pattern)
- subtype=state-eligibility → H2s match §4.4 set (look for "income limits" / "how to apply" / "documents needed" / brand-name)

If the page declares subtype=coverage but the H2s look like §4.4 (or vice versa) → the writer dispatched incorrectly. **HOLD.**

---

## 7. Test mix — 5 Q&As (Phase 4) — 3 coverage + 2 state-eligibility to test both branches

Skip the 3 already-shipped (does-medicaid-cover-rehab, does-medicare-cover-dental, does-medicare-cover-vision — Track E will regen these). Test the new writer on 5 NET-NEW Q&As that exercise BOTH subtypes.

**Coverage subtype (3 articles):**

| Slug | Question | Why |
|---|---|---|
| `does-medicare-cover-hearing-aids` | "Does Medicare cover hearing aids in 2026?" | NOT vision (existing slug `does-medicare-cover-vision` blocks that test topic). Classic "No, Original Medicare doesn't cover" answer with rich alternatives section. Tests GATE G-cov (alternatives required). |
| `does-aca-cover-preexisting-conditions` | "Does ACA marketplace insurance cover preexisting conditions?" | Legal-rule-based answer ("Yes, per Title I of ACA"). Tests Direct-answer entailment + legal citation rigor. |
| `does-medicaid-cover-home-health-care` | "Does Medicaid cover home health care?" | Mixed federal/state answer ("Yes federally, varies by state"). Tests state-overlay in coverage subtype. Borderline coverage vs state-eligibility — should resolve to coverage because the question is federal-program-level. |

**State-eligibility subtype (2 articles):**

| Slug | Question | Why |
|---|---|---|
| `do-i-qualify-for-medi-cal-california` | "Do I qualify for Medi-Cal in California 2026?" | Uses Medi-Cal brand per universal RULE 1. Tests full §4.4 recipe: 9-row table, application steps, brand throughout, expansion-state context (CA is expansion), documents checklist. |
| `do-i-qualify-for-soonercare-oklahoma` | "Do I qualify for SoonerCare in Oklahoma 2026?" | Uses SoonerCare brand. OK is a NON-expansion state — tests ACA-gap explanation requirement. Distinct from Medi-Cal test (different brand, different expansion status, different agency portal). |

**Pre-Phase-4 collision check:**
```bash
ls projects/covered-usa/content/data/qa/*.json | xargs -n1 basename | sed 's/.json//'
```
Expected existing slugs to AVOID:
- does-medicaid-cover-rehab
- does-medicare-cover-dental
- does-medicare-cover-vision

Confirm none of your 5 planned slugs match. (None do — the test slugs above are net-new.)

**Pass criteria:** 5/5 articles pass strict-mode validators + 4/5 score ≥80% on the rubric. **Plus subtype dispatch verified:**
- 3/3 coverage articles emit `subtype: "coverage"` + §4.3 H2 set + comparison table
- 2/2 state-eligibility articles emit `subtype: "state-eligibility"` + §4.4 H2 set + 9-row household-size table + brand throughout

**Mandatory dispatch test:** spawn one writer invocation with `subtype` omitted (only `topicCluster` provided) for `do-i-qualify-for-medi-cal-california`. Verify STEP 0a correctly infers `state-eligibility` from `topicCluster: "medicaid-income-california"`. This proves the fallback chain works.

---

## 8. Common failure modes for Q&A (watch out for these)

1. **Subtype dispatch defaults to coverage when state-eligibility was intended.** The writer's training data has many "does X cover Y" patterns; even with explicit subtype input it may revert to coverage shape on prose generation. STEP 0a's explicit branch reference throughout the prompt is the mitigation; GATE H-dispatch is the verifier-side catch.
2. **Direct-answer > 80 words.** Writers love to qualify. The 80-word ceiling is strict — count via `wc -w` not paragraph length. GATE E catches.
3. **"Yes, Medicare covers X" without distinguishing Original Medicare vs MA.** Most "does Medicare cover" questions have a nuanced answer (Original = no, MA = sometimes). Writer says "Yes" when the truthful answer is "Original = no, MA = sometimes". This is a Category G fullAnswer accuracy failure — the existing verifier catches it, but the writer should also self-check before save.
4. **Writer uses generic "California Medicaid" instead of "Medi-Cal".** Universal RULE 1 violation. The 19-state brand list is in `_universal-rules-block.md`; writer must include the brand throughout. GATE G-elig catches.
5. **Writer skips the 9-row household-size table on state-eligibility subtype.** Maybe writes 3 rows (1, 2, 4) thinking "key sizes". GATE B + GATE F-elig require exactly 9 — sizes 1-8 + each-additional.
6. **Writer cites stale FPL thresholds.** Uses 2024 FPL ($15,060 hh-1) instead of 2026 ($15,960 hh-1). Verifier auto-fixes via Case 3.
7. **Writer cites stale Medicare anchor facts.** `$257 Part B deductible` (was 2025) instead of `$283` (2026). Verifier auto-fixes; but writer prompt's anchor-facts block should prevent.
8. **ctaTarget=screener when answer cites dollar amounts.** Existing dental + vision pages had this drift. WE-4 fixes via explicit "dollar amount > $50 → analyzer" override.
9. **Writer omits the howToApply block on coverage subtype.** Universal RULE 3 requires every page to have how-to-apply. Coverage pages get the thinner version (when-to-enroll-in-MA, OEP/AEP dates). Without it, GATE D from universal-rules is violated.
10. **Writer emits BOTH H2 sets** (writes a 3,000-word page covering §4.3 AND §4.4). GATE H-dispatch catches.
11. **Status cells incoherent with cell text.** `status: "yes"` on a cell that says "Varies by state". Existing verifier Category B catches; writer should self-check before save.
12. **fullAnswer drift from shortAnswer.** shortAnswer = "No", fullAnswer = "Yes, with conditions...". STEP 1A internal-consistency pre-check catches; writer must self-check before save.

---

## 9. Verifier scope (Phase 4.5 — per master brief)

Update `.claude/agents/coveredusa-qa-verifier.md` to mirror the writer's new GATES + the subtype-dispatch architecture.

**Non-negotiable patches per master brief Phase 4.5 (3 things to apply):**

1. **Path portability:** `/Users/frankthebot/...` → `$HOME/clawd/...` everywhere
2. **Add dual-purpose framing** in YOUR TASK section: numeric fact-checking with auto-fix (existing role — strong; preserve Categories A-I + Case 1-bis force-flag rule for fullAnswer drift) + structural GATE detection (new, detect-only). Copy the framing from `coveredusa-ma-state-verifier.md`.
3. **Insert STEP 1C: structural GATE detection** with all 4 universal + 6 Q&A-specific gates. STEP 1C READS the resolved subtype from the JSON (`subtype` field) + branches which gates to evaluate accordingly.

**3 mandatory patches from the load-test (apply BOTH writer + verifier sides):**

- **GATE F count strictness (writer side):** the 9-row household-size table requirement is a strict count `if (subtype === "state-eligibility" && (table.rows.length !== 9)) REJECT`. Don't trust writer self-report. PA + MI in the MA-state load test both shipped with wrong detail-section counts because the writer interpreted "≥4" as soft preference.
- **`keyTerms` shape example (writer side):** writer must emit `keyTerms` as `{en: [...], es: [...]}` object, NOT a flat array. Embed the exact JSON shape template in the writer prompt + an explicit "do NOT emit flat array" rule.
- **GATE D auto-fix hoist (verifier side):** "AUTO-FIX MANDATORY" framing + Common-verifier-error callout naming the Ohio MA-state failure mode (verifier saw 11 `--` and marked them informational instead of fixing).

**Routing per gate (Q&A-specific, subtype-aware):**
- GATE A FAIL → HOLD
- GATE B (state-eligibility only) FAIL → HOLD
- GATE B (coverage) → N/A; mark gates.b: "n/a"; skip
- GATE C FAIL (0-1 .gov) → HOLD; WARN (2) → ship + LOW flag
- GATE D FAIL → AUTO-FIX as style correction
- GATE E FAIL (Direct-answer absent or > 80 words or no Yes/No/It-depends keyword) → HOLD
- GATE F-cov FAIL (comparison table absent on coverage) → HOLD
- GATE F-elig FAIL (9-row table absent on state-eligibility) → HOLD
- GATE G-cov FAIL ("No"/"It depends" without alternatives) → HOLD
- GATE G-elig FAIL (brand absent from required surfaces) → HOLD on full absence; ship + LOW flag if 1-2 surfaces only
- GATE H FAIL (vocabulary 3+ missing) → ship + MEDIUM flag
- GATE H-dispatch FAIL (H2 set doesn't match declared subtype) → HOLD
- GATE I FAIL (pageType/subtype mismatch) → HOLD

**Special verifier additions for Q&A (preserve from existing verifier):**
- Case 1-bis force-flag: if fullAnswer contains a numeric value that the verifier corrected elsewhere via grep-then-edit, and fullAnswer still contains the old value → FORCE-FLAG (never auto-edit fullAnswer because it's the schema.acceptedAnswer source). This rule supersedes all auto-correct logic for fullAnswer. Keep it.
- Internal-consistency pre-check (STEP 1A): shortAnswer vs fullAnswer direction; shortAnswer/fullAnswer vs coverageBreakdown status; FAQ answers vs fullAnswer. Any internal contradiction = flag, never silent-edit.
- STEP 1B Categories A-I unchanged from existing verifier. Add Category J (subtype-dispatch sanity):
  - Read `subtype` from JSON. If missing, infer using same fallback chain as writer's STEP 0a.
  - Verify the page's H2 set matches the resolved subtype.
  - Mismatch → flag with severity = high (HOLD-eligible).

**Verifier test:** after updating the verifier, run it on the 5 Phase-4 test articles. Expected: all `approved` or `corrected` (no false HOLDs). If any spurious HOLD: tighten the verifier prompt before shipping. Common over-fire risks:
- GATE B applied to coverage subtype (should be N/A)
- GATE E word-count off-by-one (`wc -w` quirks with apostrophes)
- GATE G-elig flagging when the state has no brand (e.g., Texas Medicaid is literally "Texas Medicaid" — no special brand)

---

## 10. Atomic deliverable (Phase 5 — 4 commits)

Per master brief §3 Phase 5:

1. **Commit 1 (clawd-workspace):** `.bak` move + new qa-writer prompt
2. **Commit 2 (covered-usa):** 5 test articles in `content/data/qa/<slug>.json` + any verifier-caught corrections from Phase 4.5 + optional schema extension in `src/lib/qa.ts` if you took path 1 of §2
3. **Commit 3 (covered-usa):** Requirements matrix + 3 verifier reports + retest verifier output in `content/fanout/analysis/c-qa-*.md`
4. **Commit 4 (clawd-workspace):** `.bak` move + new qa-verifier prompt (paired with the writer ship)

**Push order:** clawd-workspace first (writer + verifier prompts go live for any cron pickup), then covered-usa (test articles deploy to Vercel).

**Memory entry:** write `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_track_c_qa_writer_shipped.md` with:
- Per-article scores from Phase 4 verifier (especially: did subtype dispatch resolve correctly in all 5?)
- Concrete dispatch-failure cases caught (if any — even one is valuable signal)
- Any new lessons learned (especially anything about subtype-dispatch architecture that future templates with similar branching would benefit from)
- Specific drift caught by the verifier (PACENET-style or fullAnswer-drift cases)
- Patches you applied that aren't in the master-brief 3-patch list
- 5-line summary of the 5 shipped Q&As (slug, subtype, word count, status, gates result)

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
ls -la ~/clawd/projects/covered-usa/content/fanout/analysis/audit-qa-writer.json

# 4. Confirm gold-standard JSON exists
ls -la ~/clawd/projects/covered-usa/content/data/qa/does-medicaid-cover-rehab.json

# 5. Slug collision check
ls ~/clawd/projects/covered-usa/content/data/qa/*.json | xargs -n1 basename | sed 's/.json//'
# Expected output: does-medicaid-cover-rehab, does-medicare-cover-dental, does-medicare-cover-vision
# Your 5 test slugs must NOT collide.

# 6. Universal-rules-block has the 19-state brand list
grep -c "Medi-Cal\|SoonerCare\|AHCCCS\|MNsure" ~/clawd/.claude/agents/_universal-rules-block.md
# Expected: >= 4 brand mentions

# 7. Validator baseline (should be 0 bad)
cd ~/clawd/projects/covered-usa && find content/data/qa -name "*.json" -not -name "_*" -not -name "*.tmp.json" | xargs -I{} node -e "JSON.parse(require('fs').readFileSync('{}', 'utf8'))" 2>&1 | tail -10
```

If any of these fail or surprise you, surface to Jacob BEFORE proceeding. Don't guess at scope.

---

## 12. Quick reference card (post on monitor while working)

- **Master brief:** `projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md`
- **Reference writer:** `.claude/agents/coveredusa-ma-state-writer.md`
- **Reference verifiers:** `.claude/agents/coveredusa-ma-state-verifier.md` + `.claude/agents/coveredusa-article-verifier.md`
- **Your writer file:** `.claude/agents/coveredusa-qa-writer.md`
- **Your verifier file:** `.claude/agents/coveredusa-qa-verifier.md`
- **Schema interface:** `projects/covered-usa/src/lib/qa.ts` → `QA`
- **Recipes:** FANOUT_FORMULA.md §4.3 (coverage) + §4.4 (state-eligibility)
- **Audit:** `content/fanout/analysis/audit-qa-writer.json`
- **Gold standard:** `content/data/qa/does-medicaid-cover-rehab.json` (coverage subtype exemplar)
- **Output dir:** `content/data/qa/`
- **Phase 4 test slugs (3 coverage + 2 state-eligibility):**
  - Coverage: `does-medicare-cover-hearing-aids`, `does-aca-cover-preexisting-conditions`, `does-medicaid-cover-home-health-care`
  - State-eligibility: `do-i-qualify-for-medi-cal-california`, `do-i-qualify-for-soonercare-oklahoma`
- **Universal GATES:** A (slug-no-year, HOLD), B (9-row table — N/A coverage / REQUIRED state-eligibility), C (≥3 .gov, HOLD if 0-1), D (no `--`, AUTO-FIX)
- **Q&A GATES:** E (Direct-answer ≤80 words, HOLD), F-cov (comparison table, HOLD), F-elig (9-row table, HOLD), G-cov (alternatives on No/It-depends, HOLD), G-elig (state-named brand throughout, HOLD), H (vocabulary, flag), H-dispatch (H2 set matches subtype, HOLD), I (pageType/subtype consistent, HOLD)
- **Subtype dispatch:** STEP 0a — read `subtype` → infer from `topicCluster` → infer from SLUG/CATEGORY/QUESTION → REJECT if ambiguous; persist throughout; emit in return JSON
- **19-state brand list:** Medi-Cal, CalFresh, AHCCCS, MNsure, SoonerCare, MaineCare, BadgerCare, AllKids, TennCare, ARHOME, NJ FamilyCare, MassHealth, HIP, OHP, CHP+, kynect, HUSKY Health, Med-QUEST, Apple Health
- **4-commit deliverable:** writer prompt + 5 test articles + analysis files + verifier prompt
- **Default toward auto-ship:** ~95% / ~4% / ~1% (HOLD only on genuine breakage)

---

*This PRD is self-contained. Combined with the master brief, it has everything a fresh parallel session needs to execute Track C-prime for Q&A. The subtype-dispatch architecture is the unique architectural mechanic of this template — read §3.5 twice and don't skip the verifier's STEP 1C subtype-aware gate routing. If anything is unclear or missing, surface to Jacob before proceeding — don't guess at scope.*
