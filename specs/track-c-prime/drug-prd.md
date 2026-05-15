# Drug Writer + Verifier PRD (Track C-prime)

**Template:** drug-cost (`/drug/[drug]`)
**Files you will modify:** `.claude/agents/coveredusa-drug-writer.md` + `.claude/agents/coveredusa-drug-verifier.md`
**Output directory:** `projects/covered-usa/content/data/drugs/`
**Estimated time:** 4-5 hours
**Status:** Lowest-aligned of any template (62% average across 3 existing pages — Ozempic 68%, Insulin 62%, Metformin 55%). Three biggest gaps: GoodRx pharmacy comparison table missing on all 3 existing pages; generic/biosimilar block missing (insulin biosimilars story entirely absent); PAP eligibility household-size income table missing (0/3 pages). The `iraNegotiation` render bug in `src/app/[locale]/drug/[drug]/page.tsx` was fixed in commit `1fb5fb9` — the field renders correctly now. Writer must populate it for IRA-negotiated drugs.

---

## 0. Read order (MANDATORY before starting any phase)

1. **`projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md`** through §4 + §3.5 (default-toward-ship) + §6 (held-queue mechanism) + Appendix A (real-world drift case studies) + Appendix B (writer-leaks pattern). The master brief is the source of truth for the 4-phase pattern, the verifier dual-purpose model, and the gates routing.
2. **This PRD** end-to-end before spawning any agents.
3. **`~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_b1_blog_writer_shipped.md`** — the 8 B1 lessons.
4. **Reference implementations** (READ — do not modify in your session):
   - `.claude/agents/coveredusa-ma-state-writer.md` (the cleanest example of Track C-prime writer pattern; copy structure)
   - `.claude/agents/coveredusa-ma-state-verifier.md` (the cleanest example of Track C-prime verifier pattern with all 3 patches applied; copy structure)
   - `.claude/agents/coveredusa-article-verifier.md` (B1 + Track C-prime; daily blog verifier; useful for fact-check categories)
   - `.claude/agents/coveredusa-procedure-writer.md` (sister template; same Part B / Medicare logic shape; useful for §3.4 how-to-apply parallels)
5. **Source docs cited in §1 below** — the planner agent will read these in Phase 1, but you should skim them first so you know what's in each.

If you skip step 1 or 4, you'll re-discover lessons we already learned tonight. Don't.

---

## 1. Context inventory (Phase 1 planner reads these)

| Doc | What it tells you |
|---|---|
| `.claude/agents/coveredusa-drug-writer.md` | Current writer prompt — strong on Part B / Part D split + atomic write + anchor facts; weak on §4.2 fan-out enforcement (manufacturer/GoodRx/cost-without-insurance triad is implicit, not required) |
| `.claude/agents/coveredusa-drug-verifier.md` | Current verifier — solid 8-category fact-check (Medicare anchors / ASP / J-codes / years / IRA statute / PAPs / sources / internal consistency). Adapt structural GATES on top of these. |
| `.claude/agents/_universal-rules-block.md` | The 5 universal rules + 19-state program brand list |
| `projects/covered-usa/specs/FANOUT_FORMULA.md` §3 + **§4.2** | Universal rules + drug-cost recipe (8 dominant shapes, required H2s, required FAQ topics) |
| `projects/covered-usa/specs/AI_OPTIMIZATION_FRAMEWORK.md` | The framework these recipes derive from |
| `projects/covered-usa/specs/URL_SLUG_FRAMEWORK.md` | Slug rules — never migrate existing slugs (`-cost` suffix is established) |
| `projects/covered-usa/specs/LINK_TARGET_MANIFEST.md` | Link routing system (link-index + topicCluster + keyTerms.{en,es}) |
| `projects/covered-usa/specs/CURRENT_STATE_AUDIT.md` §4.2 | Cross-template audit findings (notes the iraNegotiation render bug — now fixed) |
| `projects/covered-usa/content/fanout/analysis/audit-drug-writer.json` | **THE most important doc** — synthesized audit of all 3 existing drug pages with specific gaps + 11 recommended writer edits across P0/P1/P2 priorities |
| `projects/covered-usa/specs/PHASE_5_BRIDGE.md` §3 | Track C bridge context |
| `projects/covered-usa/src/lib/drugs.ts` | The `Drug` TypeScript interface — your hard contract. `iraNegotiation` defined at line 85; `PAPRow` at line 131; `PAPSection` at line 139. |
| `projects/covered-usa/content/data/drugs/ozempic-cost.json` | **Gold standard structural reference** — most-aligned existing page (alignmentScore: 68%, highest of three). Best Wegovy disambiguation, best NovoCare/Medicare anti-kickback FAQ. Use as the structural skeleton; ADD the GATE-flagged gaps. |
| `projects/covered-usa/content/data/drugs/insulin-cost.json` | Useful negative example — strong on Part B mechanics + IRA $35 cap, but biosimilar story (Basaglar/Semglee/Rezvoglar) is entirely absent. |
| `projects/covered-usa/content/data/drugs/metformin-cost.json` | Useful negative example — Walmart $4 generic story is good, but no GoodRx comparison table, no PAP household-size table. |

---

## 2. Schema reminder + hard contracts

The `Drug` interface (`projects/covered-usa/src/lib/drugs.ts`) is your hard contract. Required top-level fields:

- `slug` (lowercase, hyphens — also the JSON filename; established convention is `<drug>-cost`)
- `drugName: LocalizedString`, `shortName: LocalizedString`
- `nonProprietaryName: string` (generic name; used in schema.org `nonProprietaryName`)
- `brandNames: string[]` (3-6 most common brand names)
- `drugClass: LocalizedString` (precise pharmacology class — see writer's existing drugClass guidance; "Antidiabetic medication" is NOT acceptable; "GLP-1 receptor agonist" is)
- `routeOfAdministration: string` (EXACTLY one of: Injection / Oral / Inhalation / Topical / Infusion / Sublingual / Transdermal)
- `medicalSpecialty: string` (real schema.org medicalSpecialty)
- `lastUpdated` (ISO YYYY-MM-DD)
- `readingTime` (e.g., "6 min read")
- `hcpcsJCodes: string[]` (HCPCS Level II J-codes only; empty array for oral/topical/inhalation/sublingual/transdermal)
- `meta: {title, description}` (LocalizedString; **title ≤ 70 chars, description ≤ 160 chars** — validator enforces)
- `hero: {h1, subhero}` (LocalizedString)
- `quickAnswer: LocalizedString` (one paragraph: retail price + Medicare picture + IRA status if applicable)
- `pricing: DrugPricing` (medicareAspPerUnit, medicareAspUnit, retailLow, retailHigh, retailUnit, inpatientLow, inpatientHigh, inpatientUnit, medicarePartDMonthlyCap, medicaidCopayLow, medicaidCopayHigh, partBDeductibleYear: 2026, partBDeductibleAmount: 283, partDAnnualOopCap: 2100)
- `iraNegotiation?: IRANegotiation` (PRESENT for Round-1 IRA drugs: Eliquis, Jardiance, Xarelto, Januvia, Farxiga, Entresto, Enbrel, Imbruvica, Stelara, Fiasp/NovoLog. OMIT for non-negotiated drugs.) Required sub-fields when present: `maxFairPrice`, `listPriceBefore`, `effectiveDate` ("2026-01-01"), `source` (CMS or KFF URL), `callout: LocalizedString`.
- `introParagraphs: LocalizedString[]` (2-3 entries)
- `pointOfPay: PointOfPaySection` (rows + tableFootnote + tableSource — this is the core data table)
- `whyHospitalsCharge: WhyHospitalsChargeSection` (2-3 paragraphs explaining facility-rate markup)
- `hcpcsSection?` (present when hcpcsJCodes is non-empty)
- `patientAssistancePrograms?: PAPSection` (intro + rows + footnote + source)
- `medicarePartD?` (Part D drugs only; `hasSpecificCap: true` ONLY for insulin)
- `commonBillingErrors?` (drugs with notable billing-error patterns)
- `faqs: {en: LocalizedFAQ[], es: LocalizedFAQ[]}` (NOT LocalizedString — FAQ question/answer are flat strings)
- `relatedLinks: RelatedLink[]`
- `sources: DrugSource[]` (minimum 3)

**Additive Track C-prime fields (emit these too — clears `content-quality.js` warnings + Track A1 forward-compat):**

- `topicCluster: "drug-cost"` (string, lowercase kebab-case)
- `keyTerms: {en: string[], es: string[]}` (NOT a flat array — see Phase 2 patch list)
- `isLighthouse: false`
- `isDeprecated: false`

**New blocks required by this rewrite (additive — don't crash the route if absent, but the writer must emit them):**

- `pharmacyPriceComparison: {rows: [...], tableFootnote, tableSource}` — GoodRx + 4-5 chain pharmacy pricing table. Caption pattern: "<Drug> price by pharmacy (2026)".
- `genericBiosimilarStatus: {hasGeneric: bool, genericName?: string, patentExpiry?: number, biosimilars?: [{brand, manufacturer, relativeCost}], note: LocalizedString}` — even if all-null, MUST be present so the page can answer "is there a generic for this?"
- `papEligibilityTable: {rows: [{householdSize, incomeThreshold, fplPct}], year, source}` — 9-row household-size × income-threshold lookup. Required when ANY PAP references FPL %.
- `denialAlternatives: {appealSteps: [...], stepTherapyOverride, papFallback, genericAlternative}` — what to do if insurance denies coverage. Required H2.
- `howToApplyPap: {numberedSteps: [3-7], govStartingUrl OR manufacturerStartingUrl, documentsNeeded: [...], commonDenialReasons: [...]}` — REQUIRED nested under each PAP row when `patientAssistancePrograms` is present.

**Hard contracts (NEVER violate):**

1. JSON return shape from STEP 8 must be `{slug, status, claims_checked, claims_corrected, claims_flagged, change_log, gates, gates_failed, ...}` parseable by the cron. (STEP 8 is the return-JSON step per master brief; STEP 5 is write-body.)
2. Atomic write pattern: `<slug>.tmp.json` first → validate JSON parses → rename to `<slug>.json`
3. `## STEP N` numbered headings (cron may parse for logging)
4. Schema interface conformance — extra fields are silently ignored at runtime, but missing required fields crash the build
5. FAQ question/answer are FLAT STRINGS, not LocalizedString objects (the most common drafter mistake — writer prompt currently calls this out; preserve the loud framing)
6. Spanish parity — every LocalizedString needs both `en` AND `es`
7. No em-dash `—` (U+2014), no en-dash `–`, no double-hyphen `--` anywhere
8. `routeOfAdministration` is one of 7 enumerated strings — no compound values like "Subcutaneous injection"

---

## 3. The §4.2 recipe (expanded with worked examples)

**FANOUT_FORMULA.md §4.2 — drug-cost variant distribution:** Entailment 45.5% / Equivalent 22.2% / Specification 17.6% / Canonicalization 10.8% / Clarification 2.3% / Generalization 1.7%

**Bing-validated shapes:** 1 of 8 — the validated one is **NovoCare assistance + Medicare coverage** (shape #3). The recipe is single-drug-derived (Ozempic only). Phase 4 test mix below verifies it generalizes against IRA-negotiated drugs (Eliquis, Jardiance, Januvia) and biosimilar-flavored drugs (insulin) before scaling.

### Top 8 dominant shapes (apply ALL of these in the new writer)

1. **Manufacturer assistance program + cost-without-insurance + year** — Entailment, top weight. Render as a required H2 "Patient assistance for uninsured patients" that wires PAP eligibility directly to the retail-cash-price baseline. Currently scattered across PAP table + FAQ — consolidate.
2. **GoodRx pharmacy price comparison + year** — Entailment. Render as a NEW required H2 "GoodRx and pharmacy discount comparison" with `pharmacyPriceComparison` table. Rows: Walmart, Costco, Kroger, CVS, Walgreens. Caption: "<Drug> price by pharmacy (2026)". **All 3 existing pages skip this — single biggest gap.**
3. **NovoCare-style assistance + Medicare coverage interaction (Bing-validated)** — Entailment. Render as required callout in `patientAssistancePrograms`: "If you have Medicare/Medicaid/TRICARE/VA, manufacturer copay cards are blocked by federal anti-kickback statute. Use the income-based PAP instead." Ozempic FAQ #5 is the gold standard; Metformin/Insulin missed it.
4. **Monthly cost without insurance + year** — Equivalent, top weight. Render in `quickAnswer` + `pricing.retailLow/retailHigh` block + `pointOfPay` retail row. **Already enforced** — preserve.
5. **List price + IRA negotiation status** — Specification. For IRA-negotiated drugs: `pricing.wholesaleAcquisitionCost` (WAC) — new field for branded drugs — plus full `iraNegotiation` block. For non-IRA drugs: list price in `quickAnswer` or `pricing` callout. The render bug is fixed (commit `1fb5fb9`); the writer's job is to populate the field.
6. **Coverage denial → alternative options** — Entailment. Render as a NEW required H2 "What to do if your insurance denies coverage" with `denialAlternatives` block: appeal process numbered steps (3-5), step-therapy override path, PAP fallback, generic/biosimilar alternative if available.
7. **Generic / biosimilar availability** — Specification. Render as a NEW required H2 "Generic and biosimilar alternatives" with `genericBiosimilarStatus` block. **For drugs WITH no generic yet** (Ozempic, Eliquis pre-2028, etc.): explicit "No generic available as of 2026; expected [date if known]." **For insulin specifically:** Basaglar, Semglee, Rezvoglar are biosimilars and MUST be named. **For atorvastatin:** generic-by-default with named alternative tier behavior.
8. **IRA Medicare negotiation status** — Specification, year-anchored. For Round-1 drugs (Eliquis, Jardiance, Xarelto, Januvia, Farxiga, Entresto, Enbrel, Imbruvica, Stelara, Fiasp/NovoLog): full `iraNegotiation` block with maxFairPrice + listPriceBefore + effectiveDate ("2026-01-01") + source + callout.{en,es}. For Round-2 preview drugs (Ozempic semaglutide → 2027 effective date): mention forward-looking in introParagraph.

### Required FAQ topics (6-8 — must include all of these)

1. **Is there a generic / biosimilar for [drug]?** (required per audit P0; explicit Yes/No + named alternatives or "No generic available as of 2026; patent expires ~[year]")
2. **How do I apply for the [Manufacturer] patient assistance program?** (required per §3.4 + audit P0)
3. **Can I use the [Drug] savings card with Medicare?** (anti-kickback statute callout; Bing-validated shape — Ozempic FAQ #5 is the gold standard)
4. **What if my insurance denies coverage for [drug]?** (appeal + step-therapy override; required per §4.2 shape #6)
5. **Does the IRA negotiated price apply to [drug]?** (Yes for Round-1 drugs with effective date; No for non-negotiated with link to general $2,100 Part D OOP cap; Round-2 preview where applicable)
6. **What does [drug] cost without insurance at the pharmacy counter?** (canonical Q; reinforce the GoodRx comparison)
7. **Do I qualify for the [Manufacturer] patient assistance program?** (eligibility framing per §3.8 — concrete income thresholds + non-income requirements: US residency, prescription, no other insurance)
8. *(Drug-specific):* Wegovy-vs-Ozempic / Glucophage-vs-metformin / Basaglar-vs-Lantus disambiguation FAQ where applicable

### Required-vocabulary checklist (per audit P1 + drug-domain canonical terms)

Body content MUST explicitly use each of these canonical terms at least once (auto-validatable via grep at STEP 6):

- "Inflation Reduction Act"
- "Maximum Fair Price"
- "Medicare Part D"
- "Medicaid"
- "patient assistance program"
- "manufacturer coupon"
- "generic"
- "biosimilar"
- "formulary tier"
- "prior authorization"

### Year-anchoring (RULE 4)

Every dollar amount + percentage must have a year in the same sentence or table caption. The Part B figures are 2026 (deductible $283, premium $202.90). Part D OOP cap is $2,100 in 2026 (was $2,000 in 2025 — common drift point). IRA negotiated MFPs are effective 2026-01-01. Insulin $35/mo cap effective 2023-01-01. **Numeric table captions follow the pattern `<Drug> <metric> by <dimension> (<year>)`** — e.g., "Ozempic cost by coverage type (2026)", "Insulin price by point of pay (2026)", "PAP eligibility by household size (2026)".

### State-context

Per §4.2: state-context is **MOSTLY N/A for drug-cost** (drug pricing is largely federally-determined). Don't force it. EXCEPTION: Medicaid copay ranges vary by state ($1-$4 typical) — the Medicaid section can mention state variability and link to `/medicaid-income-limits`. We are NOT shipping state-scoped drug pages in Track C.

---

## 4. Audit findings synthesized (read `audit-drug-writer.json` for the full version)

**Pages audited:** ozempic-cost (68%), insulin-cost (62%), metformin-cost (55%). Average alignment 62%. **Lowest of any template.**

**THE biggest gaps (single highest-ROI fixes — 4 P0 blocking edits per the audit):**

1. **GoodRx pharmacy comparison table missing on ALL 3 pages.** Shape #2 by §4.2 weight; under-enforcing the second-most-important entailment. Must add `pharmacyPriceComparison` block as REQUIRED.
2. **Generic/biosimilar block missing.** Shape #7. Insulin page silently dropped the entire biosimilar story (Basaglar/Semglee/Rezvoglar). Ozempic page never said "no generic exists yet." Must add `genericBiosimilarStatus` block as REQUIRED — even if all-null, the field's presence answers the LLM fan-out "is there a generic for [drug]?"
3. **PAP how-to-apply block missing.** §3.4 entailment shape demands an apply flow; current writer outputs only a domain URL. Must add `howToApplyPap` block (numberedSteps[3-7] + govStartingUrl OR manufacturerStartingUrl + documentsNeeded[] + commonDenialReasons[]) nested under each PAP row.
4. **PAP eligibility household-size income table missing on ALL 3 pages.** §3.3 universal rule; "400% FPL" is a string only — Bing rewards literal "household of 3 + 400% FPL" lookup. Must add `papEligibilityTable` (rows: 1-8 household sizes × income threshold $ × FPL %) when any PAP references FPL %.

**5 P1 strong-signal edits:**

- Add §4.2 "Coverage denial → alternative" H2 with `denialAlternatives` block (appeal numberedSteps + stepTherapyOverride + papFallback + genericAlternative)
- Lint: every drug page MUST cite at least one fda.gov URL (label info, generic approval status — currently absent from writer's required sources list)
- Style rule: numeric table captions use "<Drug> <metric> by <dimension> (<year>)" pattern — current "Point of Pay" caption isn't lookup-format
- PAP × Medicare anti-kickback callout REQUIRED in `patientAssistancePrograms` block (Ozempic FAQ #5 gold standard; Metformin/Insulin missed)
- Add Medicare Prescription Payment Plan mention as REQUIRED for Part D drugs with retail > $200/mo (newer 2025 IRA feature)

**Verification of source-of-truth claims (done before writing this PRD):**

- Audit JSON read in full at `content/fanout/analysis/audit-drug-writer.json`. Gaps cited above match.
- TypeScript interface read at `src/lib/drugs.ts`. `IRANegotiation` shape (line 85): `maxFairPrice`, `listPriceBefore`, `effectiveDate`, `source`, `callout: LocalizedString`. Confirmed.
- Existing drug directory list: `_queue.json`, `insulin-cost.json`, `metformin-cost.json`, `ozempic-cost.json`. **Note discrepancy with Track C plan §5.3 wording:** the master brief said "Skip Ozempic, metformin (already shipped)" — but `insulin-cost` is also shipped. Test mix below skips all 3 (Track E will regen them). Surface this minor wording drift to Jacob if the regen plan changes.

---

## 5. Universal GATES (recap from master brief §7) — apply ALL to drug

- **GATE A — slug must NOT contain a year.** Drug slugs are pure drug names with established `-cost` suffix (`ozempic-cost`, `insulin-cost`, `eliquis-cost`). Never `ozempic-cost-2026`. **HOLD on fail.**
- **GATE B — household-size table.** **CONDITIONALLY APPLIES to drug** — when the page has a PAP that references FPL % (which is most drugs with manufacturer PAPs), the `papEligibilityTable` must have exactly 9 data rows (sizes 1-8 PLUS "each additional person"). When NO PAP references FPL (rare — generic-only drugs like atorvastatin where the assistance story is "use $4 generic"), mark `gates.b: "n/a"` and skip. **HOLD if applicable-and-missing.**
- **GATE C — ≥3 inline outbound .gov / .edu / kff.org citations.** Required minimum: cms.gov (Part D + IRA negotiated prices) + fda.gov (label / generic status — currently absent from writer's required sources; ADD per audit P1) + 1 third-party (KFF for IRA / NeedyMeds for PAP directory). **HOLD on 0-1 .gov citations; WARN on exactly 2.**
- **GATE D — zero `--` (double-hyphen) anywhere.** **AUTO-FIX as style correction; never HOLD.** The `drug-verifier` must auto-fix per the GATE D hoist patch (see master brief §3 Phase 4.5 patches).

---

## 6. Drug-specific GATES (your STEP 6 additions)

These are the template-specific gates. Frame them at STEP 6 with "STOP. Read this twice." language.

### GATE E — `iraNegotiation` block populated for IRA-negotiated drugs

For the Round-1 IRA drugs (Eliquis, Jardiance, Xarelto, Januvia, Farxiga, Entresto, Enbrel, Imbruvica, Stelara, Fiasp/NovoLog), the JSON MUST have a populated `iraNegotiation` block with ALL required sub-fields: `maxFairPrice`, `listPriceBefore`, `effectiveDate` ("2026-01-01"), `source` (CMS or KFF URL), `callout.{en,es}`. The render bug is fixed (commit `1fb5fb9`) — the field renders correctly now. The schema field exists, but the audit flagged that the writer often ignores it.

Worked example for Eliquis: `maxFairPrice: 295` (30-day supply), `listPriceBefore: 521`, `effectiveDate: "2026-01-01"`, `source: "https://www.cms.gov/inflation-reduction-act-and-medicare/..."`, `callout.en`: "Starting January 1, 2026, Medicare beneficiaries pay a Maximum Fair Price of $295 for a 30-day supply of Eliquis, down from a list price of $521 — a 43% reduction under the Inflation Reduction Act of 2022." (en+es).

**Routing:** PASS if drug is on Round-1 list AND block present + complete; PASS if drug is NOT on Round-1 list AND block correctly omitted; WARN if drug on list AND block present but missing 1-2 sub-fields; **HOLD if drug on Round-1 list AND block entirely absent**. This is a known writer-leak failure mode per the audit — the field exists but the writer ignores it. Verifier-side cross-check is non-negotiable.

### GATE F — GoodRx pharmacy comparison table required

Verify the JSON has a `pharmacyPriceComparison` block with rows for at least 4 of the 5 major chains (Walmart, Costco, Kroger, CVS, Walgreens). Caption follows the "<Drug> price by pharmacy (2026)" pattern. Plain-text mention of GoodRx in 1 FAQ does NOT pass.

Worked example for Atorvastatin (already-generic): `rows: [{pharmacy: "Walmart", price: "$4 (30-day, 10mg)"}, {pharmacy: "Costco", price: "$8.50 (30-day)"}, {pharmacy: "Kroger Rx", price: "$10.99"}, {pharmacy: "CVS GoodRx coupon", price: "$12-15"}, {pharmacy: "Walgreens", price: "$18-22"}]`, footnote: "GoodRx and pharmacy member-program prices vary by ZIP and are subject to change. Verified [date 2026].", source: "https://www.goodrx.com/atorvastatin".

**Routing:** PASS if dedicated block present with ≥4 rows; WARN if block present with 2-3 rows; **HOLD if entirely absent**. This is the audit's #1 missing artifact (0/3 existing pages have it). The writer must always emit it.

### GATE G — Generic / biosimilar coverage section required when alternatives exist

Verify the JSON has a `genericBiosimilarStatus` block. The block MUST be present even if all-null (so the page can answer "is there a generic for [drug]?"). Specifically:

- **Insulin (Humalog, Lantus, etc.):** `biosimilars: [{brand: "Basaglar", manufacturer: "Eli Lilly", relativeCost: "..."}, {brand: "Semglee", manufacturer: "Viatris/Biocon", relativeCost: "..."}, {brand: "Rezvoglar", manufacturer: "Eli Lilly", relativeCost: "..."}]`
- **Atorvastatin:** `hasGeneric: true, genericName: "atorvastatin (generic)"` (the drug IS the generic; brand Lipitor patent expired 2011)
- **Eliquis / Jardiance / Januvia (no generic until patent expiry):** `hasGeneric: false, patentExpiry: <year if known>, note.{en,es}: "No generic or biosimilar approved as of 2026; expected ~[year]"`
- **Ozempic (Round-2 IRA semaglutide):** `hasGeneric: false, patentExpiry: 2031, note: "..."` plus Round-2 forward-looking IRA mention in introParagraph

**Routing:** PASS if block present with correct shape for the drug class; WARN if block present but biosimilar names missing for insulin (the most-common gap); **HOLD if block entirely absent**. Insulin pages without biosimilar mention are the audit's single most material content miss.

### GATE H — Patient Assistance Program eligibility table required

Verify the JSON has a `papEligibilityTable` block with ≥4 columns and ≥4 rows of `program × income-tier × discount × how-to-apply` data. Specifically: for each manufacturer PAP listed in `patientAssistancePrograms.rows`, the eligibility table must show concrete income thresholds (not "400% FPL" as a bare string) per household size.

Worked example for Eliquis (Bristol Myers Squibb Patient Assistance Foundation):

| Household Size | 2026 Income Threshold | FPL % | How to Apply |
|---|---|---|---|
| 1 | ≤ $62,640 | 400% | bmspaf.org or call 1-800-... |
| 2 | ≤ $84,600 | 400% | bmspaf.org |
| 3 | ≤ $106,560 | 400% | bmspaf.org |
| 4 | ≤ $128,520 | 400% | bmspaf.org |
| Each additional person | + $21,960 | 400% | bmspaf.org |

(Plus rows 5-8 explicitly enumerated; total 9 data rows per universal RULE 3 / GATE B intersection.)

**Routing:** PASS if dedicated block present with ≥9 data rows; WARN if present with 4-8 rows; **HOLD if absent AND any PAP references FPL %**. If the drug has no PAP that references FPL (rare — generic-only drugs like atorvastatin), mark `gates.h: "n/a"` and skip.

---

## 7. Test mix — 5 drugs (Phase 4)

Skip the 3 already-shipped (ozempic-cost, metformin-cost, insulin-cost — Track E will regen these). Test the new writer on 5 NET-NEW drugs:

| Slug | Why |
|---|---|
| `eliquis-cost` | Round-1 IRA-negotiated; Part D oral DOAC (factor Xa inhibitor); no generic until ~2028; verifies `iraNegotiation` block populated + renders (commit `1fb5fb9` — first end-to-end smoke test of the render path) |
| `jardiance-cost` | Round-1 IRA-negotiated; Part D oral SGLT2 inhibitor; verifies render again with a different drug class; cross-class diabetes-coverage angle |
| `januvia-cost` | Round-1 IRA-negotiated; DPP-4 inhibitor; **generic alternative exists (sitagliptin generic launched 2024-2025)** — tests `genericBiosimilarStatus` block with `hasGeneric: true` AND `iraNegotiation` simultaneously, an interesting interaction (do you take the negotiated brand or the cheaper generic?) |
| `humalog-cost` | Insulin (rapid-acting analog) — tests biosimilar story (Basaglar/Semglee/Rezvoglar); $35/mo Part D cap; Lilly Insulin Value Program PAP; J1815 J-code; the biosimilar gap is the audit's single biggest content miss |
| `atorvastatin-cost` | Already-generic statin (HMG-CoA reductase inhibitor); baseline for non-IRA non-novel drug; tests the GoodRx pharmacy comparison table at $4-$22 price-band; tests `gates.h: "n/a"` skip when the assistance story is "use $4 generic" instead of manufacturer PAP |

**Pre-Phase-4 collision check:**
```bash
ls projects/covered-usa/content/data/drugs/*.json | xargs -n1 basename | sed 's/.json//'
```
Confirm none of your 5 planned slugs match existing slugs (currently: `_queue`, `insulin-cost`, `metformin-cost`, `ozempic-cost`).

**Pass criteria:** 5/5 articles pass strict-mode validators + 4/5 score ≥80% on the rubric. **Plus:**
- Eliquis / Jardiance / Januvia: `iraNegotiation` block populated AND renders correctly on the live page (Maximum Fair Price + listPriceBefore + effectiveDate + source link visible)
- Humalog: `genericBiosimilarStatus.biosimilars[]` includes Basaglar + Semglee + Rezvoglar by name
- All 5: `pharmacyPriceComparison` table has ≥4 chain rows
- All 5 with PAP: `papEligibilityTable` has 9 data rows

---

## 8. Common failure modes for drug-cost (watch out for these)

1. **Writer hallucinates pharmacy prices.** GoodRx prices fluctuate weekly; the writer's training data is stale. Verifier should cross-check at least one row via WebFetch on goodrx.com/<drug>. If the writer claims "Walmart $4" for a drug that's actually $19 at Walmart, that's a Florida-style 4x error — auto-fix via verifier.
2. **Writer cites old "savings" promotions that have expired.** Manufacturer copay-card terms change yearly+. "$25/mo for commercially insured patients" was 2024; in 2026 it may be $35/mo or income-tiered. Verifier WebFetches the manufacturer program page; if a key term doesn't appear on the live page, flag.
3. **Writer mentions "free with insurance" without specifying Part D tier behavior.** Most novel drugs are Tier 3 (preferred brand) or Tier 4 (non-preferred brand) on commercial formularies, not free. Writer must reference `formulary tier` + `prior authorization` explicitly when discussing insurance coverage.
4. **Writer claims generic equivalents that don't exist.** Most novel drugs have NO generics until patent expires. Ozempic (semaglutide) has no generic and won't until ~2031. Eliquis (apixaban) — patent litigation ongoing; no generic as of 2026. Writers love to say "ask about the generic" — for novel drugs, that's wrong. The `genericBiosimilarStatus.hasGeneric: false` block + explicit "No generic available as of 2026; expected ~[year]" defends against this.
5. **Writer forgets to populate `iraNegotiation` block for an IRA-negotiated drug.** The schema field exists but the writer ignores it — the audit explicitly flagged this. The render bug is fixed (commit `1fb5fb9`), so the field works end-to-end now. GATE E rejection at STEP 6 is the defense.
6. **Confusing Part B vs Part D classification.** Insulin (J1815) is Part B when administered in clinic, Part D for self-administered injectables. Writers sometimes mix the two. The existing writer prompt has clean Part-B-vs-Part-D split logic — preserve it.
7. **Quoting Medicare Part D cap as $2,000 instead of $2,100.** Common drift: $2,000 was the 2025 cap, $2,100 is 2026. The verifier's Category A enforcement catches this; preserve it.
8. **Filling `hcpcsJCodes` with NDC codes.** NDC = National Drug Code (10-11 digits, e.g., `00071-9100`). HCPCS Level II J-codes are letter+4 digits (`J1815`). Verifier's Category C catches this.
9. **PAP × Medicare anti-kickback statute confusion.** Manufacturer copay cards are blocked for Medicare/Medicaid/TRICARE/VA beneficiaries by federal anti-kickback statute. Writer must include the callout in `patientAssistancePrograms` (Ozempic FAQ #5 gold standard).
10. **Using compound `routeOfAdministration` values.** "Subcutaneous injection" → use "Injection". "Oral tablet" → use "Oral". The schema enum is strict; the validator rejects compound values.

---

## 9. Verifier scope (Phase 4.5 — per master brief)

Update `.claude/agents/coveredusa-drug-verifier.md` to mirror the writer's new GATES.

**Non-negotiable patches per master brief Phase 4.5 (3 things to apply):**

1. **Path portability:** `/Users/frankthebot/...` → `$HOME/clawd/...` everywhere
2. **Add dual-purpose framing** in YOUR TASK section (numeric auto-fix + structural detect-only). Copy the framing from `coveredusa-ma-state-verifier.md`. The existing 8-category fact-check (A-H) is the "numeric" half; the new GATE E-H detection is the "structural" half.
3. **Insert STEP 1C: structural GATE detection** with all 4 universal + all 4 drug-specific GATES (mirror writer's STEP 6).

**3 mandatory patches from the load-test (apply BOTH writer + verifier sides):**

- **GATE F count strictness (writer side):** strict count check on `pharmacyPriceComparison.rows.length >= 4`. Don't trust writer self-report. The PA / MI load-test failure mode (writer reports "all gates pass" but section count below threshold) applies here too — strict count guards against it.
- **`keyTerms` shape example (writer side):** embed the `{en: [...], es: [...]}` template with explicit "do NOT emit flat array" rule. Drug-specific recommended `keyTerms.en` includes: `<drug name>`, "patient assistance program", "Maximum Fair Price", "Medicare Part D", "biosimilar", "manufacturer coupon".
- **GATE D auto-fix hoist (verifier side):** "AUTO-FIX MANDATORY" framing + Common-verifier-error callout naming the Ohio MA-state failure mode (verifier saw 11 `--` instances and marked them informational instead of fixing).

**Routing per gate (drug-specific):**

- GATE A FAIL → HOLD
- GATE B (PAP table income-gated): FAIL when applicable-and-missing → HOLD; N/A on generic-only drugs → skip
- GATE C FAIL (0-1 .gov) → HOLD; WARN (2) → ship + LOW flag
- GATE D FAIL → AUTO-FIX as style correction
- GATE E FAIL (`iraNegotiation` block missing on Round-1 drug) → HOLD (audit's single most-tracked writer-leak; never ship without)
- GATE F FAIL (GoodRx comparison table absent) → HOLD (audit's #1 missing artifact)
- GATE G FAIL (`genericBiosimilarStatus` block absent) → HOLD; FAIL (block present but biosimilar names missing for insulin) → ship + MEDIUM flag
- GATE H FAIL (PAP eligibility table absent when applicable) → HOLD

**Verifier test:** after updating the verifier, run it on the 5 Phase-4 test articles. Expected: all `approved` or `corrected` (no false HOLDs). If any spurious HOLD: tighten the verifier prompt before shipping. Common over-fire: GATE B applied when no PAP references FPL; GATE H applied to atorvastatin (which has no PAP); GATE G missing-biosimilar flag on a non-insulin non-biologic (where biosimilars don't exist).

---

## 10. Atomic deliverable (Phase 5 — 4 commits)

Per master brief §3 Phase 5:

1. **Commit 1 (clawd-workspace):** `.bak` move + new drug-writer prompt
2. **Commit 2 (covered-usa):** 5 test articles in `content/data/drugs/<slug>.json` + any verifier-caught corrections from Phase 4.5
3. **Commit 3 (covered-usa):** Requirements matrix + 3 verifier reports + retest verifier output in `content/fanout/analysis/c-drug-*.md`
4. **Commit 4 (clawd-workspace):** `.bak` move + new drug-verifier prompt (paired with the writer ship)

**Push order:** clawd-workspace first (writer + verifier prompts go live for any cron pickup), then covered-usa (test articles deploy to Vercel).

**End-to-end render smoke test:** after the 3 IRA drugs (Eliquis / Jardiance / Januvia) ship to Vercel, browse to `coveredusa.org/drug/eliquis-cost` and confirm the IRA Negotiation green-callout component renders with `maxFairPrice` + `listPriceBefore` + `effectiveDate` + source link. The render bug fix (commit `1fb5fb9`) is the prerequisite for §4.2 shape #8 to land in production. If the callout doesn't render, the bug fix didn't ship to the deployed branch — investigate before Phase 5 close.

**Memory entry:** write `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_track_c_drug_writer_shipped.md` with:

- Per-article scores from Phase 4 verifier
- Any new lessons learned (especially anything you discovered that the master brief Appendix A/B doesn't cover)
- Specific drift caught by the verifier (PACENET-style cases — for drugs, this might be stale GoodRx prices, expired copay-card terms, hallucinated generic equivalents)
- Patches you applied that aren't in the master-brief 3-patch list (would be candidates for future master-brief upgrade)
- 5-line summary of the 5 shipped drugs (slug, word count, status, gates result)
- Confirmation of the iraNegotiation render smoke test

---

## 11. Pre-flight checklist (run BEFORE Phase 1)

```bash
# 1. Pull latest on both repos
cd ~/clawd && git pull origin main
cd ~/clawd/projects/covered-usa && git pull origin main

# 2. Confirm reference implementations exist
ls -la ~/clawd/.claude/agents/coveredusa-ma-state-writer.md \
       ~/clawd/.claude/agents/coveredusa-ma-state-verifier.md \
       ~/clawd/.claude/agents/coveredusa-article-verifier.md \
       ~/clawd/.claude/agents/coveredusa-procedure-writer.md

# 3. Confirm audit JSON exists
ls -la ~/clawd/projects/covered-usa/content/fanout/analysis/audit-drug-writer.json

# 4. Confirm gold-standard JSON exists
ls -la ~/clawd/projects/covered-usa/content/data/drugs/ozempic-cost.json

# 5. Confirm iraNegotiation render bug fix is in place
grep -r "iraNegotiation" ~/clawd/projects/covered-usa/src/app/[locale]/drug/[drug]/page.tsx
# Expected: at least one match (the green-callout component). If 0 matches, the
# fix from commit 1fb5fb9 is not on the current branch — surface to Jacob.

# 6. Slug collision check
ls ~/clawd/projects/covered-usa/content/data/drugs/*.json | xargs -n1 basename | sed 's/.json//'
# Expected output: _queue, insulin-cost, metformin-cost, ozempic-cost
# Your 5 test slugs (eliquis-cost / jardiance-cost / januvia-cost / humalog-cost /
# atorvastatin-cost) must NOT collide.

# 7. Validator baseline (run BEFORE you start; should be 0 bad)
cd ~/clawd/projects/covered-usa && node scripts/validate-drugs.js 2>&1 | tail -10
```

If any of these fail or surprise you, surface to Jacob BEFORE proceeding. Don't guess at scope.

---

## 12. Quick reference card (post on monitor while working)

- **Master brief:** `projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md`
- **Reference writer:** `.claude/agents/coveredusa-ma-state-writer.md` + `.claude/agents/coveredusa-procedure-writer.md` (sister template)
- **Reference verifiers:** `.claude/agents/coveredusa-ma-state-verifier.md` + `.claude/agents/coveredusa-article-verifier.md`
- **Your writer file:** `.claude/agents/coveredusa-drug-writer.md`
- **Your verifier file:** `.claude/agents/coveredusa-drug-verifier.md`
- **Schema interface:** `projects/covered-usa/src/lib/drugs.ts` → `Drug`
- **Recipe:** FANOUT_FORMULA.md §4.2
- **Audit:** `content/fanout/analysis/audit-drug-writer.json`
- **Gold standard:** `content/data/drugs/ozempic-cost.json` (alignment 68%, highest existing)
- **Output dir:** `content/data/drugs/`
- **Phase 4 test slugs:** eliquis-cost, jardiance-cost, januvia-cost, humalog-cost, atorvastatin-cost
- **Universal GATES:** A (slug-no-year, HOLD), B (PAP household-size table when applicable, HOLD if missing), C (≥3 .gov inc. fda.gov, HOLD if 0-1), D (no `--`, AUTO-FIX)
- **Drug GATES:** E (`iraNegotiation` for Round-1 drugs, HOLD), F (GoodRx pharmacy comparison table, HOLD), G (`genericBiosimilarStatus` block, HOLD), H (PAP eligibility table when applicable, HOLD)
- **IRA Round-1 drugs (10):** Eliquis, Jardiance, Xarelto, Januvia, Farxiga, Entresto, Enbrel, Imbruvica, Stelara, Fiasp/NovoLog. Round-2 preview drugs include semaglutide (Ozempic) effective 2027.
- **Required vocabulary:** Inflation Reduction Act / Maximum Fair Price / Medicare Part D / Medicaid / patient assistance program / manufacturer coupon / generic / biosimilar / formulary tier / prior authorization
- **2026 anchor facts:** Part B deductible $283 / Part B premium $202.90 / Part A inpatient $1,736 / Part D OOP $2,100 / IRA = 2022 / insulin $35 cap effective 2023-01-01 / IRA Round-1 MFPs effective 2026-01-01
- **Render bug status:** `iraNegotiation` render fix shipped in commit `1fb5fb9`. Verify on Eliquis live page after Phase 5.
- **4-commit deliverable:** writer prompt + 5 test articles + analysis files + verifier prompt
- **Default toward auto-ship:** ~95% / ~4% / ~1% (HOLD only on genuine breakage)

---

*This PRD is self-contained. Combined with the master brief, it has everything a fresh parallel session needs to execute Track C-prime for drug-cost. If anything is unclear or missing, surface to Jacob before proceeding — don't guess at scope.*
