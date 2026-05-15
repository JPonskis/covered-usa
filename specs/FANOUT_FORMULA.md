# Fan-Out Formula — CoveredUSA

**Version:** 1.0
**Date:** 2026-05-14
**Status:** Phase 1 derived from 281 LLM probes + BenefitsUSA real-Bing cross-check
**Companion docs:** `specs/AI_OPTIMIZATION_FRAMEWORK.md` (the underlying framework), `specs/TRACK_AA_PLAN.md` (the experiment design), `specs/PHASE_5_BRIDGE.md` §3 (empirical grounding-query data)
**Source data:** `content/fanout/aggregate-phase1.json`, `content/fanout/analysis/per-template-formula-Y.json`, `content/fanout/analysis/universal-patterns.json`, `content/fanout/analysis/benefitsusa-crosscheck.json`

---

## 0. Purpose

This is the proprietary asset Track AA was built to produce. It tells every CoveredUSA writer agent — for any given content target — what sub-query shapes the page must cover to earn Bing AI / Copilot citations.

The formula has two layers:

1. **Universal rules** that apply to ALL templates (Section 2)
2. **Per-template formulas** with the 6-8 dominant sub-query shapes per template type (Section 3)

Writer agents in Tracks B1 and C consume this directly. Phase 2-4 of the experiment will refine it as we ship content and observe real Bing performance — the formula is versioned so we can track drift.

---

## 1. Strategic thesis (the ONE insight)

**Bing wants LOOKUP CONTENT, not explainers.** When a user asks an AI a healthcare-navigation question, Bing's grounding index decomposes that question into number-lookup queries (state + program + year + table format) far more than concept-explanation queries.

**Empirical evidence:**
- BenefitsUSA real-Bing CSV (461 grounding queries, ~21,700 weighted citations): top patterns are `texas medicaid income limits 2026` (1,079 citations), `wic income guidelines 2026` (717), `missouri medicaid income limits 2026` (563), `2026 federal poverty guidelines` (600). All lookup-format queries.
- Conceptual / mechanics queries are sparse: only **4 MAGI queries in 2 months** across all of BenefitsUSA. LLMs over-fan into MAGI mechanics; real users skip the concept and go straight to the number.
- Cross-check: OpenAI gpt-5-mini predicts Bing's actual fan-out at **58.7% match rate** — the highest of all 4 providers tested.

**Implication for CoveredUSA:** Pages that are state-specific + year-anchored + table-formatted + eligibility-explicit dominate the citation surface. Pages that are conceptual deep-dives into definitional mechanics (MAGI, ACA subsidy cliff theory, etc.) are good for human readers but poor citation magnets.

This thesis drives every formula below.

---

## 2. Provider weighting (non-negotiable)

Empirically derived from the BenefitsUSA real-Bing cross-check. Use these weights when interpreting any future fan-out data:

| Provider | Model | Weight | Why |
|---|---|---|---|
| **OpenAI** | `gpt-5-mini` | **1.0 (primary)** | Best Bing predictor at 58.7% match rate. ChatGPT Search uses Bing. Copilot uses Bing. Direct-line predictive. |
| **OpenAI Pro** | `gpt-5.5` | 1.0 (when available) | Hybrid spot-check showed 50% match, lower n. Treat as confirmatory; mini's volume is the workhorse. |
| **Anthropic** | `claude-sonnet-4-6` | **0.5 (confirmatory)** | Brave Search backend (different from Bing). 30.8% Bing match. Conservative fan-out — useful for shape confirmation but treat literal queries with caution. |
| **Google** | `gemini-3-flash-preview` | **0.25 (diversity)** | Google Search ecosystem. 38.1% Bing match. Highest fan-out volume but noisy — useful for surfacing edge cases, not for driving formula decisions. Gemini frequently goes deep into MAGI mechanics, 401(k) edge cases, IRA policy — none of which Bing actually decomposes into. |

**Rule:** when shapes appear in OpenAI's data, they go in the formula. When shapes appear ONLY in Gemini, treat them as creativity-layer candidates — log but don't enforce.

---

## 3. Universal rules (apply to ALL templates)

These shapes appeared in 4+ of 8 templates and are validated by the BenefitsUSA real-Bing data. Every writer agent's base prompt must enforce these.

### 3.1 Year-marker injection (8/8 templates)

**Rule:** Every page MUST include the current year (and next year for forward-looking topics like COLA, projected benefits) in:
- Title
- H1
- Meta description
- First paragraph
- Every numeric table caption
- Every section heading that references a numeric value

**Why:** 91.6% of BenefitsUSA Bing grounding queries had year markers (`2026`, `2027`, `2025` for fading queries). LLMs across all 4 providers automatically append year markers to user prompts that don't include them.

**Validator enforcement:** Already exists (Framework §4.2 + Audit §6 universal pattern). Year-in-content is enforced; year-in-slug is forbidden (URL_SLUG_FRAMEWORK §1).

### 3.2 State-context-everywhere (when state is in scope)

**Rule:** When the page topic includes a state (e.g., `/medicare-advantage/california`, `/qa/medicaid-texas`), the state name MUST appear in:
- Title
- H1
- Meta description
- Every H2 first sentence
- Every table caption
- All numeric thresholds quoted in body

Generic "Medicaid in California" is INSUFFICIENT. Use the state-named program brand if one exists: **Medi-Cal** (CA), **AHCCCS** (AZ), **MNsure** (MN), **SoonerCare** (OK), **MaineCare** (ME), **BadgerCare** (WI), **AllKids** (IL), **TennCare** (TN), **ARHOME** (AR), **NJ FamilyCare** (NJ), **MassHealth** (MA), **HIP** (IN), **OHP** (OR), **CHP+** (CO), **CalFresh** (CA SNAP).

**Why:** State-named program brands generate disproportionate Bing volume — `mnsure` (269 cites), `soonercare` (262), `mainecare` (155), `medi-cal` (272), `calfresh` (1,028), `badgercare` (96). LLMs often normalize to "[state] Medicaid" — Bing routes to the brand.

**Validator enforcement:** NEW. Add to A5 lint: when `topicCluster` contains a state slug, scan body content for the state name + state-named program brand.

**Status: MISSING from current Framework. Add.**

### 3.3 Eligibility household-size table (when income is gating)

**Rule:** Every page covering income-based eligibility (Medicaid, ACA subsidies, FPL, persona-income-eligibility) MUST include a household-size lookup table:

| Household Size | Income Threshold (Year) | Notes |
|---|---|---|
| 1 | $X,XXX | |
| 2 | $X,XXX | |
| 3 | $X,XXX | |
| 4 | $X,XXX | |
| 5+ | $X,XXX × per additional person | |

The table MUST have a year-tagged caption. The threshold values MUST be year-anchored.

**Why:** Real Bing grounding queries cluster around `family of 4`, `household of 3`, etc. Users want the literal lookup, not the derivation.

**Validator enforcement:** NEW. Add to A5 lint: any page with `eligibility` or `income limits` in topicCluster requires a `householdSizeTable` field in the JSON.

**Status: MISSING from current Framework. Add.**

### 3.4 How-to-apply section (with .gov starting URL + numbered steps + documents-needed checklist)

**Rule:** Every page must have a next-steps H2 with:
- Specific enrollment-window dates (or "open enrollment" if year-round)
- Numbered application steps (3-7 steps)
- The official .gov starting URL (Medicare.gov, Healthcare.gov, Medicaid.gov, state-specific portal)
- A "Documents needed" bullet checklist
- A "Common reasons applications get denied" callout (Entailment-shape — top Bing-validated pattern in event/persona templates)

**Why:** Entailment is the dominant fan-out variant (~35% of all sub-queries in Phase 1). LLMs always expand into "how to apply" / "what to do next" even when the user prompt didn't ask. Bing real data confirms application-flow queries appear during enrollment windows (e.g., `iowa medicaid application 2026` = 764 citations); the Bing-validation signal is rated MEDIUM in the source cross-check.

**Validator enforcement:** NEW. Add to A5 lint: every JSON template requires a `howToApply` block with the listed sub-fields.

**Status: PARTIALLY enforced (event template has `HowTo` schema; needs to be universal). Add to all templates.**

### 3.5 Comparison framing (X vs Y format)

**Rule:** When the topic involves choice between alternatives, include an explicit "X vs Y vs Z" comparison table or section. Examples:
- Medicare Advantage vs Medigap vs Original Medicare
- Hospital outpatient vs Independent imaging center
- COBRA vs Marketplace vs Employer plan
- MAGI vs AGI vs taxable income

**Why:** Comparison framing appeared in 7/8 templates. Bing-validation rated PARTIAL — the CSV doesn't show heavy literal "X vs Y" queries (Bing's grounding favors literal lookups), but the framing converts well to TABLE-shaped pages which Bing does cite.

**Validator enforcement:** Soft. Writer-agent prompt includes an instruction to consider whether comparison framing applies; not strictly enforceable.

**Status: PARTIALLY enforced (some templates emit comparison tables). Codify as universal.**

### 3.6 Authoritative source narrowing with site: operators

**Rule:** Cite primary sources inline with anchor text containing the source domain. Required source domains by topic:
- Medicare topics → `medicare.gov`, `cms.gov`
- Medicaid topics → `medicaid.gov`, state-specific Medicaid agencies
- ACA topics → `healthcare.gov`, `kff.org`
- FPL → `aspe.hhs.gov`
- Drug pricing → `cms.gov`, `fda.gov`, manufacturer site

**Why:** OpenAI gpt-5-mini (the best Bing predictor) consistently appended `site:medicare.gov`, `site:hhs.gov`, `site:aspe.hhs.gov` to its sub-queries. Bing rewards content that matches the same authority pattern.

**Validator enforcement:** Already partial (Framework §4.9 requires .gov citation density). Extend to ensure topic-appropriate domain coverage.

### 3.7 Named-program lookup (7/8 templates)

**Rule:** Use the official program name in body content + key terms when one exists. Medicare Advantage → "Medicare Advantage" (not "MA plan"). Medicaid → also include the state-named brand if state-scoped (Medi-Cal, AHCCCS, MNsure, SoonerCare, MaineCare, BadgerCare, AllKids, TennCare, ARHOME, NJ FamilyCare, MassHealth, HIP, OHP, CHP+, CalFresh).

**Why:** State-named program brands generate disproportionate Bing volume. The cross-check blind-spot patterns are dominated by named-program × state × year permutations weighted at 4,197 citations. Our LLM proxies under-generate this — Bing knows the brand; LLMs default to "[state] Medicaid".

**Validator enforcement:** NEW. Add to A5 lint: when a state-named program applies, scan body content for the brand name + canonical generic name.

**Status: MISSING from current Framework. Add.**

### 3.8 Eligibility entailment ("do I qualify" / "income limits" / "requirements")

**Rule:** Every page covering benefits/programs/coverage must include an explicit eligibility section answering "do I qualify" with concrete numeric thresholds. Use these literal H2 phrasings: "Income limits", "Eligibility requirements", "Do I qualify".

**Why:** Eligibility is the #1 high-volume query shape on BenefitsUSA. `fpl 2026` (398), `poverty guidelines 2026` (579), `wic income guidelines 2026` (717), `food stamp income guidelines 2026` (316). 5/8 templates exhibit this fan-out shape. Bing-validated.

**Validator enforcement:** NEW. Add to A5 lint: any page on a benefits/program topic requires an `eligibility` block with `incomeThresholds`, `nonIncomeRequirements`, and `commonReasonsDenied`.

**Status: MISSING from current Framework. Add.**

### 3.9 Demographic specificity ("family of N" / "single mom" / "1099" / "self-employed" / "senior")

**Rule:** When a topic has natural demographic dimensions (household size, employment status, age bracket, family structure), surface those as explicit table rows or H2 sections. Generic content gets less citation lift than demographic-specific content.

**Why:** 5/8 templates exhibit this. BenefitsUSA Bing CSV contains `family of 4` style lookups. The household-size table is the canonical Bing-citable artifact (overlap with §3.3). Bing-validated.

**Validator enforcement:** Soft per-template. Hard for any page where eligibility is income-based (already required by §3.3).

**Status: PARTIALLY enforced (per-template). Codify as universal where demographically relevant.**

### 3.10 Table/chart-shape framing ("by household size" / "by state" / "guidelines")

**Rule:** Use literal "guidelines" / "chart" / "by [dimension]" phrasings in section headings and table captions. Users searching for visual lookup signal that intent in the query string.

**Why:** Bing real-data shows table/chart-shaped queries weighted at 253 citations (`federal poverty level 2026 chart`, `2026 poverty guidelines chart`, `fpl 2026 chart`). 4/8 templates exhibit. Bing-validated.

**Validator enforcement:** Soft. Writer-agent prompt includes an instruction to use "chart"/"guidelines"/"by X" phrasings when emitting numeric tables.

**Status: PARTIALLY enforced (Framework §6 requires structural content); needs explicit lookup-table phrasing rule. Add.**

### 3.11 Lower-confidence universal candidates (record but don't enforce yet)

Two patterns appeared in 4/8 templates but with weak Bing validation. Track for Phase 2 but don't bake into writer-agent prompts:

- **Subsidy / Premium Tax Credit reference framing** — overshoot risk per cross-check (LLMs over-generate policy-debate queries that Bing doesn't fan out into).
- **Local-search / find-near-me framing** — Bing handles local intent through geo-routing, not LLM grounding queries; weak signal.

---

## 4. Per-template formulas

Each template's top 6-8 dominant sub-query shapes, weighted by OpenAI > Anthropic > Gemini, with Bing-validation status. Writer agents map these directly to H2 sections, FAQ topics, and required schema fields.

### 4.1 procedure-cost (`/cost/[procedure]`)

**Variant distribution:** Specification 43.9% / Equivalent 28.0% / Entailment 24.3% / Canonicalization 3.2% / Clarification 0.5%

**Bing-validated shapes:** 1 of 8 (low — single-procedure data; expand in Phase 2)

**Top dominant shapes (weighted):**

1. **Cost without insurance + sub-type (contrast/non-contrast/body part) + year** — Specification, top weight. Example: "MRI cost without insurance by body part 2026", "knee MRI cost without insurance"
2. **Good Faith Estimate / No Surprises Act compliance** — Entailment, **Bing-validated**. Example: "how to request good faith estimate for medical imaging self-pay"
3. **Cost without insurance + year (canonical entry)** — Equivalent, top weight. Example: "MRI cost without insurance 2026"
4. **Hospital outpatient vs Independent imaging center** — Specification (comparison). Example: "MRI cost hospital vs imaging center"
5. **Self-pay discount programs / cash pay rates** — Entailment. Example: "cash pay MRI cost average 2025"
6. **Medicare rate benchmark for the procedure** — Specification. Example: "Medicare reimbursement rate for MRI 2026"
7. **Insurance copay/coinsurance estimate (when user has insurance)** — Specification.
8. **Pre-procedure cost estimate request process** — Entailment.

**Writer-agent recipe:**
- Required H2 sections: "Cost without insurance", "Hospital vs imaging center", "Good Faith Estimate process", "Insurance coverage breakdown"
- Required tables: cost-by-body-part × site-of-service (year-tagged caption); Medicare rate benchmark
- Required FAQ topics: How to request a Good Faith Estimate; What's covered by Medicare/Medicaid; Cash-pay discount programs
- State-specificity: optional (procedure-cost is geographically uniform-ish)
- Year markers: required in all numeric callouts

**Cross-prompt-variant consistency:** First-person-urgent + caretaker + info-seeking variants converge on the same shape set. One formula handles all three.

---

### 4.2 drug-cost (`/drug/[drug]`)

**Variant distribution:** Entailment 45.5% / Equivalent 22.2% / Specification 17.6% / Canonicalization 10.8% / Clarification 2.3% / Generalization 1.7%

**Bing-validated shapes:** 1 of 8 (low — single-drug data; Phase 2 must verify against Eliquis or Jardiance)

**Top dominant shapes:**

1. **Manufacturer assistance program + cost-without-insurance + year** — Entailment, top weight. Example: "Novo Nordisk Ozempic patient assistance program for uninsured"
2. **GoodRx pharmacy price comparison + year** — Entailment. Example: "GoodRx Ozempic price 2026"
3. **NovoCare assistance + Medicare coverage** — Entailment, **Bing-validated**.
4. **Monthly cost without insurance + year** — Equivalent. Example: "Ozempic cost per month without insurance 2025"
5. **List price comparison** — Specification. Example: "Ozempic list price per month 2024 2025"
6. **Coverage denial → alternative options** — Entailment.
7. **Generic / biosimilar availability** — Specification.
8. **IRA Medicare negotiation status** — Specification (year-anchored).

**Writer-agent recipe:**
- Required H2 sections: "Cost without insurance", "Manufacturer patient assistance program", "GoodRx + pharmacy comparison", "Insurance coverage breakdown", "Generic alternatives"
- Required tables: monthly cost × pharmacy (year-tagged); manufacturer assistance eligibility
- Required FAQ topics: How to apply for patient assistance; What if insurance denies coverage; IRA negotiation impact
- Year markers: required

**Cross-prompt-variant consistency:** Consistent across first-person/caretaker/info-seeking.

**Phase 2 caveat:** Single-drug data (Ozempic only). Verify formula generalizes against a second drug (Eliquis or Jardiance) before scaling.

---

### 4.3 qa (Medicare-coverage variant) (`/qa/[question]`)

**NOTE:** The qa template should be SPLIT into two distinct sub-templates because the dominant shapes are completely disjoint. See §5 architectural recommendations.

**Variant distribution (full qa template):** Entailment 38.4% / Equivalent 36.8% / Specification 24.9%

**Bing-validated shapes:** 3 of 8 (the state-Medicaid sub-shapes carry the validation; Medicare-coverage shapes are weakly validated)

**Top dominant shapes for Medicare-coverage Q&A:**

1. **Medicare Advantage [topic] benefits + year + .gov source** — Specification, top weight. Example: "Medicare Advantage dental benefits 2026 medicare.gov"
2. **Original Medicare vs Medicare Advantage on [topic]** — Specification (comparison).
3. **Medicare [topic] coverage + year + .gov source** — Equivalent.
4. **Standalone supplemental [topic] insurance** — Entailment. Example: "standalone dental insurance for Medicare beneficiaries"
5. **Out-of-pocket cost without coverage** — Specification.
6. **Eligibility criteria for [topic] benefit** — Entailment.

**Writer-agent recipe (Medicare-coverage Q&A):**
- Required H2 sections: "Direct answer (Yes/No/It depends)", "What Original Medicare covers", "What Medicare Advantage may add", "Cost without coverage", "Standalone supplemental options"
- Required FAQ topics: top 5 follow-up questions per the dominant shapes
- Year markers: required

---

### 4.4 qa (state-Medicaid variant) (`/qa/medicaid-[state]`)

**This is the SPLIT-OUT sub-template** (see §5).

**Top dominant shapes:**

1. **State Medicaid income limits + state + year** — Specification, top weight, **Bing-validated**. Example: "texas medicaid income limits 2026", "ohio medicaid income limit for a family of 4 2026"
2. **State-named program brand + year** — Canonicalization, **Bing-validated**. Example: "medi-cal income limits 2026", "ahcccs eligibility requirements 2026"
3. **State Medicaid application process** — Entailment, **Bing-validated**. Example: "texas medicaid application", "apply for medicaid in arizona"
4. **State Medicaid expansion status + ACA gap** — Specification.
5. **State Medicaid + family size + year** — Specification.
6. **State Medicaid eligibility documents needed** — Entailment.

**Writer-agent recipe (state-Medicaid Q&A):**
- Required H2 sections: "Eligibility income limits + household-size table", "State-named program brand explanation", "How to apply (numbered steps + .gov URL)", "Documents needed checklist", "Common denial reasons"
- Required tables: household-size × income-limit (year-tagged); income-source-includes / income-source-excludes table
- Required FAQ topics: How to apply, expansion status, what counts as income, working while on Medicaid
- State-specificity: REQUIRED throughout
- Year markers: required

---

### 4.5 glossary (`/glossary/[term]`)

**WARNING: This template is structurally over-engineered relative to real Bing demand.**

**Variant distribution:** Canonicalization 45.9% / Specification 19.3% / Entailment 19.3% / Clarification 12.6% / Equivalent 3.0%

**Bing-validated shapes:** 1 of 8 (very weak; only 4 MAGI-related queries in 2 months across all of BenefitsUSA)

**Top dominant shapes:**

1. **Definition + scope of inclusion** — Canonicalization. Example: "what does MAGI include", "MAGI definition"
2. **Calculation walkthrough with worked example** — Clarification. Example: "how to calculate MAGI for ACA"
3. **Term × adjacent program eligibility** — Entailment. Example: "MAGI for premium tax credit"

**Bing-validation:** WEAK. Only 4 MAGI queries in 2 months across all of BenefitsUSA — far below LLM proxy fan-out volume. **Don't over-invest in concept-only glossary pages.**

**Writer-agent recipe (glossary, conservative):**
- Keep glossary pages SHORT (300-500 words). Don't write 2,000-word concept deep-dives — Bing doesn't reward them.
- Required: definition + 1 worked example + 1 lookup table (the specific numeric thresholds)
- Cross-link aggressively to lookup pages (FPL chart, Medicaid income limits, etc.) — that's where the citation surface is

**Strategic note:** Glossary's primary value is **internal-link target** (per `LINK_TARGET_MANIFEST.md`), not direct citation magnet. Treat it that way.

---

### 4.6 event (`/event/[event]`)

**Variant distribution:** Entailment 56.4% (highest of any template) / Equivalent 19.0% / Specification 17.1% / Clarification 6.6% / Follow-up 0.9%

**Bing-validated shapes:** 6 of 8

**Top dominant shapes:**

1. **Aging-out / event + COBRA-vs-Marketplace decision + .gov source** — Entailment. Example: "lost job COBRA vs Marketplace better choice"
2. **SEP enrollment window + dates + state** — Specification.
3. **What to do if event + immediate next steps** — Entailment.
4. **Documents needed for SEP application** — Entailment.
5. **Eligibility for subsidies during SEP** — Entailment.
6. **State-extension laws (turning 26 by state)** — Specification.
7. **CHIP / Medicaid pivot if event-triggered** — Entailment.

**Writer-agent recipe:**
- Required H2 sections: "Immediate next steps (numbered)", "SEP window + deadlines", "COBRA vs Marketplace comparison", "Documents needed", "State-specific rules"
- Required HowTo schema with 5-7 numbered steps + totalTime
- Required FAQ topics: SEP eligibility, timing, subsidy interactions
- Year markers: required (especially for AEP/OEP/SEP date references)

---

### 4.7 persona (`/for/[persona]`)

**Variant distribution:** Entailment 50.2% / Equivalent 22.2% / Canonicalization 15.3% / Specification 12.0% / Follow-up 0.3%

**Bing-validated shapes:** 8 of 8 (highest validation rate of any template, tied with daily-blog)

**Top dominant shapes:**

1. **Persona-specific coverage options + year** — Specification, top weight. Example: "health insurance for gig workers 2026"
2. **Premium tax credit + persona subsidy eligibility + year** — Entailment.
3. **1099 / freelancer coverage options + year** — Specification.
4. **Self-employment health deduction (tax angle)** — Entailment.
5. **HSA / FSA eligibility for persona** — Entailment.
6. **State-specific stipend / program for persona** — Specification.
7. **Catastrophic plan eligibility for persona** — Specification.
8. **Persona × Marketplace SEP triggers** — Entailment.

**Writer-agent recipe:**
- Required H2 sections: "Coverage options for [persona]", "Subsidy + tax credit eligibility", "Self-employment health deduction", "HSA/FSA fit", "State-specific programs"
- Required FAQ topics: covering all 8 dominant shapes
- Year markers: required
- Synonym coverage: required (per Audit §3.3 + Framework §5.6) — list canonical persona term + acronym + colloquial synonyms in body content

---

### 4.8 ma-state (`/medicare-advantage/[state]`)

**Variant distribution:** Entailment 36.7% / Specification 36.2% / Equivalent 26.6% / Clarification 0.4%

**Bing-validated shapes:** 5 of 8

**Top dominant shapes:**

1. **MA enrollment periods (AEP / OEP) + year + .gov source** — Specification.
2. **MA by state + year (county-level shapes mixed in)** — Specification, top weight.
3. **MA Star Ratings + state + year** — Specification.
4. **Plan count + carrier breakdown + state + year** — Specification.
5. **MA enrollment process + state + .gov source** — Entailment.
6. **MA vs Medigap decision + state** — Specification (comparison).
7. **$0 premium plans + state + year** — Specification.
8. **Special Needs Plans (SNPs) + state + year** — Specification.

**Writer-agent recipe:**
- Required H2 sections: "AEP/OEP dates", "Plan count + top carriers", "Star Ratings overview", "$0 premium plans", "MA vs Medigap comparison", "How to enroll"
- Required tables: plan count × carrier (year-tagged); Star Rating distribution; $0 premium plan list
- Required FAQ topics: enrollment timing, carrier comparison, SNPs eligibility
- State-specificity: REQUIRED everywhere
- Year markers: required

---

### 4.9 daily-blog (`/blog/[slug]`) — and the FPL super-shape

**Variant distribution:** Canonicalization 37.6% / Specification 27.4% / Entailment 25.2% / Equivalent 8.0% / Clarification 1.8%

**Bing-validated shapes:** 8 of 8 (tied with persona for highest validation rate of any template)

**Top dominant shapes:**

1. **FPL by household size + year + .gov source** — Canonicalization, top weight (13.0). Example: "federal poverty level 2026 chart by household size"
2. **FPL by household size + state + year** — Specification.
3. **FPL by household size + Medicaid eligibility + year** — Entailment.
4. **FPL × ACA subsidy threshold + year** — Specification.
5. **FPL × SNAP eligibility + year + state** — Specification.
6. **FPL × WIC eligibility + year** — Specification.
7. **FPL chart format (table/PDF lookup)** — Specification.
8. **FPL by percentage (100% / 138% / 150% / 200% / 250% / 400%)** — Specification.

**Writer-agent recipe (FPL-shape blog):**
- Required H2 sections: "FPL chart 2026", "By household size", "By percentage thresholds", "FPL × Medicaid", "FPL × ACA subsidies", "FPL × CHIP / WIC / SNAP", "Alaska + Hawaii adjustments"
- Required tables: full FPL chart (1-8 person households × percentage thresholds), year-tagged
- Required FAQ topics: how FPL is calculated, Alaska/Hawaii differences, percentage threshold meaning
- State-specificity: include state-by-state Medicaid expansion status table
- Year markers: required

---

## 5. Architectural recommendations (highest-leverage changes)

These are the 3 concrete moves that emerged from the analysis. Stack-ranked by ROI.

### 5.1 [HIGHEST ROI] Build the state × program permutation factory

The single dominant Bing citation pattern across the entire BenefitsUSA dataset is `{state} {program} income limits {year}`. This pattern owns 4,200+ weighted citations that LLM probes barely surface (because LLMs need state-specified user prompts to fan out into them, but real users routinely ask state-specific questions).

**What to build:**
- Template: `/medicaid-income-limits/[state]` (extension of existing hardcoded `/medicaid-income-limits` lighthouse)
- Coverage: 50 states × 1 page = 50 pages, each with the household-size income table for that state
- Year-anchored: republish annually (2026 → 2027 in January)
- Schema: each page declares `topicCluster: medicaid-income-{state}`, `keyTerms: ["[state] medicaid income limits", "[state-named program brand] income limits", "[state] medicaid eligibility income"]`
- Cross-link: every state page links to the canonical `/medicaid-income-limits` lighthouse and vice versa

**Why this beats every other Track D candidate:** double-signal proof. Both highest-derived shape AND largest empirical Bing blind spot.

**Status:** Goes into Track D.

### 5.1b Adjacent permutation factories (out of CoveredUSA scope but flagged)

The cross-check showed two MORE high-volume Bing patterns that are SEPARATE from Medicaid:
- **WIC income guidelines × state × year** — `wic income guidelines 2026` alone got 717 citations
- **SNAP / food stamps × state × year** — multiple variants in CSV (`snap income limits 2026` 1,895 citations; `calfresh income limits 2026` 1,028; `food stamp income guidelines 2026` 316)

These are food-benefits, NOT health-insurance — out of CoveredUSA's content scope. **Flagging for BenefitsUSA's Track F**: BenefitsUSA covers food benefits and could absorb similar permutation factories for WIC and SNAP. Don't build for CoveredUSA.

### 5.2 Split the qa template into qa-coverage and qa-state-eligibility

Current `/qa/[question]` template handles both:
- "Does Medicare cover dental?" (coverage Q&A)
- "Do I qualify for Medicaid in Texas?" (state-eligibility Q&A)

These have completely disjoint dominant shapes (§4.3 vs §4.4). Merging them into one writer-agent prompt dilutes the formula for both.

**What to do:**
- Keep existing `/qa/[question]` URLs intact (slug stability rule)
- Internally route to two writer agents based on `topicCluster`:
  - `qa-coverage` → uses §4.3 formula
  - `qa-state-eligibility` → uses §4.4 formula
- Update `coveredusa-qa-writer.md` to dispatch on subtype

**Status:** Goes into Track C.

### 5.3 Add the 3 missing universal rules to the Framework

Per §3.2 + §3.3 + §3.4 above:
- STATE-CONTEXT-EVERYWHERE
- ELIGIBILITY-HOUSEHOLD-SIZE-TABLE
- HOW-TO-APPLY SECTION (universal, not just event/persona)

These need to:
1. Be added to `specs/AI_OPTIMIZATION_FRAMEWORK.md` as new universal rules
2. Be enforced by the validators (Track A5 lint extensions)
3. Be embedded in every writer-agent prompt block

**Status:** Quick-follow-up to Phase 5; can ship in days.

---

## 6. Validator integration points (next code work)

The formula needs validator backing. Specific extensions to `scripts/lib/content-quality.js` and per-template validators:

| Rule | Validator addition |
|---|---|
| §3.1 year markers | Already enforced (Framework §4.2). |
| §3.2 state-context | Add: when topicCluster matches `*-{state-slug}*`, scan body for state name + state-named program brand. |
| §3.3 eligibility household-size table | Add: when topicCluster contains `eligibility` or `income-limits`, JSON requires `householdSizeTable` field. |
| §3.4 how-to-apply | Add: every JSON template requires a `howToApply` block with `enrollmentDates`, `numberedSteps[3-7]`, `govStartingUrl`, `documentsNeeded[]`, `commonDenialReasons[]`. |
| §3.5 comparison framing | Soft. Writer-agent prompt instruction. |
| §3.6 source domain narrowing | Already enforced (Framework §4.9). Extend to topic-appropriate domain coverage check. |
| §3.7 named-program lookup | Add: when state-named program applies, scan body for both brand and canonical generic. |
| §3.8 eligibility entailment | Add: any benefits-page requires `eligibility` block (incomeThresholds + nonIncomeRequirements + commonReasonsDenied). |
| §3.9 demographic specificity | Soft per-template. Hard via §3.3 when income-based. |
| §3.10 table/chart phrasing | Soft. Writer-agent prompt: use "chart"/"guidelines"/"by [dim]" in table captions. |

---

## 7. Open questions + Phase 2 roadmap

### 7.1 Phase 2 — second-topic per template

Phase 1 used 1 main topic per template (MRI for procedure-cost, Ozempic for drug-cost, etc.) plus 8 state-specific additions. The single-topic constraint means our derived formulas may be partially "MRI-shaped" or "Ozempic-shaped" rather than purely "procedure-shaped" or "drug-shaped."

**Phase 2 expansion (run after Track B1 ships):**
- Add second topic per template: colonoscopy, Eliquis, premium-tax-credit, getting-married, college-students, Florida-MA, ACA-subsidy-cliff
- Re-probe with same 3-provider × 3-run structure
- Re-derive formulas; only patterns that hold across BOTH topics in a template survive into v2 of FANOUT_FORMULA.md

Cost: ~$5-7. Effort: 1 hour.

### 7.2 Calibration coefficient (long-term)

As CoveredUSA accumulates Bing AI Performance Report data, compare proxy fan-out (this experiment) against actual Bing grounding queries on CoveredUSA's own URLs. Refine the OpenAI-mini weighting upward or downward based on observed match rate.

### 7.3 Provider drift monitoring

Models change. GPT-5.5 → GPT-6, Gemini 3 → Gemini 4, Claude Sonnet 4.6 → 4.7. Re-run Phase 1 quarterly to detect formula drift. Budget ~$5/quarter.

---

## 8. Reproducibility

To re-derive this formula:

```bash
# Re-run the probe (uses cached data; only re-probes new prompts)
node scripts/coveredusa-fanout-probe.js --hybrid --runs 3

# Re-aggregate
node scripts/coveredusa-fanout-probe.js --aggregate

# Push to Sheet
node scripts/coveredusa-fanout-probe.js --push-sheet

# Re-run analysis (manual: spawn agents per Track AA workflow)
```

All raw probe data: `content/fanout/raw/*.json` (281 files as of v1).
Aggregated: `content/fanout/aggregate-phase1.json`.
Analysis: `content/fanout/analysis/*.json`.

---

## 9. Cross-references

- `specs/AI_OPTIMIZATION_FRAMEWORK.md` — the underlying framework (this formula extends §2.1 fan-out variants and §5 per-template playbooks)
- `specs/TRACK_AA_PLAN.md` — the experiment design that produced this formula
- `specs/CURRENT_STATE_AUDIT.md` — what current CoveredUSA pages are missing (cross-reference §4 per-template formulas with audit findings to derive Track E regen priority)
- `specs/PHASE_5_BRIDGE.md` §3 — empirical grounding-query data that seeded this work
- `specs/URL_SLUG_FRAMEWORK.md` — slug rules (year-in-slug forbidden; year-in-content required)
- `specs/LINK_TARGET_MANIFEST.md` — link-routing system (glossary's primary value is as link target per §4.5 above)

---

*This is the formula. Versioned, source-traced, validation-backed. Writer agents in Tracks B1 and C consume it directly. Phase 2 refines it. The proprietary asset Phase 5 was built to produce.*
