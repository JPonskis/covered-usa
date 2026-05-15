# C-MA-State Requirements Matrix

**Phase:** 1 (Inventory) — Track C, MA-state writer rewrite
**Date:** 2026-05-14
**Source plan:** `specs/TRACK_C_PARALLEL_PLAN.md` §5.1
**Reference template:** `b1-requirements-matrix.md`
**Purpose:** Master list of every rule the new `coveredusa-ma-state-writer.md` must honor. The Phase 2 drafter relies on this file exclusively.

---

**Total requirements:** 78
**Conflicts found:** 9 (resolved: 8, flagged for human: 1)

Category counts:
- 1 — formula-universal: 5
- 2 — formula-recipe (§4.8 ma-state): 7
- 3 — audit-flagged ma-state gaps: 9
- 4 — framework-preserved (AI_OPTIMIZATION_FRAMEWORK): 13
- 5 — hard-contract (preserved from existing writer): 9
- 6 — slug-rule: 5
- 7 — link-consumption: 5
- 8 — strategic-posture: 4
- 9 — humanizer-voice: 7
- 10 — cron-pipeline integration: 4
- (subtotal Spanish-parity / state-specific extras): 10 nested cross-cutting requirements covered inside the categories above

---

## Category 1: MUST — formula compliance (5 universal rules)

### REQ-001 — STATE-CONTEXT-EVERYWHERE (HARD)
- **Source:** `_universal-rules-block.md` §RULE 1; `FANOUT_FORMULA.md` §3.2 + §3.7; `audit-ma-state-writer.json` §A.universalRulesCoverage.3_2_stateContextEverywhere (PARTIAL today)
- **Category:** formula-universal
- **Rule:** STATE_NAME (as passed in INPUTS) MUST appear in: meta.title (en + es), meta.description (en + es), hero.h1 (en + es), the FIRST sentence of every detailSection.heading paragraph (en + es), the FIRST sentence of whatToLookFor.intro / countyVariance.intro / importantDates.intro / stateExtras.intro / howToEnroll.intro (en + es), every table caption (planTypes.footnote, marketOverview.source, planTypes.source, countyVariance.source, detailSections[].table.footnote/source), and inline next to every numeric threshold quoted in body content (e.g., "California Medicare Advantage MOOP: $9,250 (2026)" not bare "$9,250"). Generic "this state" / "the state" is INSUFFICIENT — use STATE_NAME literally. **MA does NOT have state-named program brands** (unlike Medi-Cal/AHCCCS for Medicaid) — do not invent a brand. Adjacent state-named programs (Medi-Cal D-SNP, Texas HHSC, SHIIP) MAY appear when relevant in stateExtras.
- **Enforcement:** STEP 0 (load `_universal-rules-block.md`). STEP 3 (plan structure — codify state-context discipline). STEP 5 (write — every detailSection paragraph opener + every table caption). STEP 6 PRE-SAVE GATE (regex: `importantDates.intro` MUST contain STATE_NAME; every `source` field MUST contain STATE_NAME or be cited as state-tagged).
- **Conflicts:** Old writer has STATE_NAME in title/H1/meta/hero/quickAnswer but DOES NOT enforce it in importantDates.intro (state-agnostic across CA/TX/WY) or table source captions. Resolution: formula wins; tighten enforcement at STEP 6.

### REQ-002 — ELIGIBILITY-HOUSEHOLD-SIZE-TABLE (CONDITIONAL — see GATE B applicability)
- **Source:** `_universal-rules-block.md` §RULE 2; `FANOUT_FORMULA.md` §3.3; `audit-ma-state-writer.json` §A.universalRulesCoverage.3_3_eligibilityHouseholdSizeTable (currently N/A)
- **Category:** formula-universal
- **Rule:** MA-state pages are NOT income-gated as the primary topic (Medicare eligibility is age/disability based). However, when the page covers D-SNP / dual-eligible / Medicaid Savings Program (MSP) topics — which most state MA pages SHOULD touch — include a 9-row household-size table for MSP/Medicaid income limits in [STATE] (sizes 1, 2, 3, 4, 5, 6, 7, 8 + "Each additional"). Caption MUST be year-tagged (e.g., "[State] Medicare Savings Program Income Limits — 2026"). This is the supporting "state Medicaid income context" table flagged in the Track C plan, NOT the page's primary topic table. If the state has no meaningful D-SNP / dual-eligible content (rare), skip the table and document the skip in STEP 6 self-validation.
- **Enforcement:** STEP 3 (plan — emit one supporting MSP/Medicaid household-size table when D-SNP coverage applies). STEP 6 GATE B: if D-SNP block present in detailSections, require 9-row income table. Skip GATE B otherwise; document skip in self-validation.
- **Conflicts:** Audit currently marks this N/A. Resolution: formula softens for MA-state but applies to the D-SNP supporting table. Do NOT force a primary-topic income table.

### REQ-003 — HOW-TO-ENROLL SECTION (HARD — biggest audit gap)
- **Source:** `_universal-rules-block.md` §RULE 3; `FANOUT_FORMULA.md` §3.4 + §4.8 (recipe item "How to enroll"); `audit-ma-state-writer.json` §A.universalRulesCoverage.3_4_howToApplySection (MISSING) + §C.topThreeWriterEdits[1] (rank 1 fix)
- **Category:** formula-universal
- **Rule:** Every MA-state page MUST have a dedicated "How to enroll in [STATE_NAME] Medicare Advantage" detailSection (or a top-level `howToEnroll` block) containing all 5 sub-fields:
  1. Specific enrollment-window dates: AEP October 15 – December 7, 2026 (coverage Jan 1, 2027); MA OEP Jan 1 – March 31, 2026; IEP 7-month window around 65th birthday; SEPs.
  2. Numbered application steps (5–7 steps): e.g., (1) Confirm eligibility (Part A + Part B + live in service area); (2) Gather documents (Medicare card, ZIP code, doctor list, drug list, current Part D plan info); (3) Compare plans at medicare.gov/plan-compare; (4) Apply through medicare.gov or carrier; (5) Confirm coverage start date.
  3. The official .gov starting URL (medicare.gov/plan-compare) hyperlinked inline, not plain text.
  4. "Documents needed" bullet checklist (4–8 items): Medicare card (red/white/blue), ZIP code, list of current doctors/specialists, list of current prescriptions (drug + dosage), current Part D plan (if applicable), bank info for premium auto-pay, Medicaid card if dual-eligible, broker contact (optional).
  5. "Common reasons enrollments are denied or delayed" callout (3–5 items): Missing Part B enrollment; living outside the plan's service area; trying to enroll outside AEP/SEP without qualifying event; missing/incorrect Medicare number; carrier underwriting flags for ESRD-affected enrollees on certain plans.
- **Enforcement:** STEP 3 (plan — slot howToEnroll as REQUIRED detailSection or new top-level block). STEP 5 (write all 5 sub-fields). STEP 6 GATE: count numbered steps (3–7), confirm medicare.gov hyperlinked, confirm 4–8 docs, confirm 3–5 denial reasons.
- **Conflicts:** Old writer marks importantDates section as the AEP/OEP coverage and treats "How to enroll" as conversational FAQ content only. Resolution: formula wins; this is now a REQUIRED dedicated section with all 5 sub-fields, not an optional FAQ topic.

### REQ-004 — YEAR-MARKERS-AND-YEAR-ANCHORING (HARD)
- **Source:** `_universal-rules-block.md` §RULE 4; `FANOUT_FORMULA.md` §3.1; `AI_OPTIMIZATION_FRAMEWORK.md` §4.2 + §8.4; `audit-ma-state-writer.json` §A.universalRulesCoverage.3_1_yearMarkerInjection (PASS — strongest part of writer)
- **Category:** formula-universal
- **Rule:** Every page MUST include 2026 in: meta.title (en + es), meta.description (en + es), hero.h1, hero.subhero, quickAnswer, marketOverview.dataYear (numeric 2026), every numeric table caption, every importantDate label/note where year is present, every detailSection.heading that references a numeric value, and inline next to every $ / %  in body prose. **Forward-looking AEP rule:** AEP dates always reference BOTH 2026 AND 2027 (AEP Oct 15 – Dec 7, 2026 → coverage starts January 1, 2027). The audit confirmed year discipline is already strong; preserve.
- **Enforcement:** STEP 3 (write — never emit a bare $ or %). STEP 6 (regex scan: every `\$[\d,.]+` and `\d+%` token must have a 4-digit year within the same sentence or table caption; "2026" MUST appear in title, h1, meta description, hero subhero, and quickAnswer; "2027" MUST appear in AEP coverage-start references).
- **Conflicts:** None. Reinforce existing discipline.

### REQ-005 — AUTHORITATIVE-SOURCE-NARROWING (HARD — extend to inline anchoring)
- **Source:** `_universal-rules-block.md` §RULE 5; `FANOUT_FORMULA.md` §3.6; `AI_OPTIMIZATION_FRAMEWORK.md` §4.9; `audit-ma-state-writer.json` §A.universalRulesCoverage.3_6 (PASS at sources-list level; needs inline upgrade)
- **Category:** formula-universal
- **Rule:** Cite primary sources INLINE (not just at the page foot in `sources[]`) with anchor text containing the source domain. Required source domains: medicare.gov, cms.gov (Star Ratings, MOOP, AEP/OEP), kff.org (state MA penetration / spotlight), state DOI / state HHS / state SHIP (state-specific Star Ratings + plan counts). Minimum 3 inline outbound .gov / kff.org citations per page. Anchor text must be descriptive ("[CMS Medicare Plan Finder Q4 2025](https://...)" not "click here"). The `sources[]` array remains for footer attribution; inline links live in `quickAnswer`, `introParagraphs`, `marketOverview.source` (state-tagged), `importantDates.items[].note`, `detailSections[].paragraphs`, and `howToEnroll` (medicare.gov starting URL).
- **Enforcement:** STEP 5 (write — every numeric claim gets an inline .gov anchor). STEP 6 GATE C: count outbound `(medicare.gov|cms.gov|kff.org|<state>.gov)` markdown links across all body fields; if <3, fail.
- **Conflicts:** Old writer requires `sources[]` ≥3 entries (footer-only) but does not require inline anchoring. Resolution: formula wins; inline ≥3 plus footer `sources[]` ≥3 (overlap allowed).

---

## Category 2: MUST — formula recipe (§4.8 ma-state)

### REQ-006 — REQUIRED-H2-LIST (FANOUT_FORMULA §4.8)
- **Source:** `FANOUT_FORMULA.md` §4.8; `audit-ma-state-writer.json` §A.perTemplateRecipeCoverage_4_8
- **Category:** formula-recipe
- **Rule:** Every MA-state page MUST include the following H2-equivalent sections (mapped to existing schema fields where possible):
  1. **AEP/OEP enrollment periods** → `importantDates` section (year-tagged 2026 + 2027).
  2. **Plan count + top carriers breakdown** → `marketOverview.totalPlansAvailable` + `marketOverview.topCarriers[]` (5–10 rows).
  3. **Star Ratings overview** → `marketOverview.averageStarRating` + per-carrier `averageStarRating` + a dedicated `detailSections[]` entry titled "How Star Ratings work in [STATE_NAME] Medicare Advantage 2026".
  4. **$0 premium plans in [STATE_NAME] 2026** → NEW dedicated `detailSections[]` entry with a 4–6-row table (Carrier / Plan Type / Counties Available / Star Rating). This was MISSING on all 3 audited pages — close the gap.
  5. **MA vs Original Medicare + Medigap comparison in [STATE_NAME]** → `detailSections[]` with a comparison table.
  6. **How to enroll in [STATE_NAME] Medicare Advantage** → REQ-003 howToEnroll section.
  7. **SNPs (Special Needs Plans) eligibility in [STATE_NAME]** → row in `planTypes` PLUS a dedicated `detailSections[]` entry covering D-SNP / C-SNP / I-SNP eligibility (chronic condition list, dual-eligible MSP overlap).
- **Enforcement:** STEP 3 (plan — slot all 7 sections). STEP 6 (count: 7 required sections present; $0 premium table has 4–6 rows; SNP detailSection present).
- **Conflicts:** Audit confirms 5/7 currently present; $0 premium plans table MISSING; how-to-enroll MISSING. Resolution: add both as REQUIRED.

### REQ-007 — TOP-CARRIERS TABLE (5–10 rows, fully populated)
- **Source:** Old writer §STEP 2 ("Top carriers" REQUIRED); `FANOUT_FORMULA.md` §4.8 shape #4
- **Category:** formula-recipe
- **Rule:** `marketOverview.topCarriers[]` has 5–10 rows. Each row populates: `name` (proper noun, real carrier — NEVER fabricate), `planCount`, `averageStarRating` (1.0–5.0), `averagePremium` (USD), and an optional `notes` LocalizedString that includes geographic context (sub-state regions, dominant counties) — this is part of state-context discipline. **Kaiser Permanente rule:** list ONLY in CA, CO, DC, GA, HI, MD, OR, VA, WA. Common national carriers: UnitedHealthcare, Humana, Aetna (CVS), Anthem (Elevance), Cigna, WellCare (Centene). State Blue Cross plans where relevant.
- **Enforcement:** STEP 3 (research). STEP 6 (validate row count + Kaiser geography rule + carrier names against a known list).
- **Conflicts:** None — preserved from old writer.

### REQ-008 — PLAN-TYPES TABLE (HMO / PPO / SNP / PFFS / MSA)
- **Source:** Old writer §STEP 2 ("Plan type breakdown" REQUIRED); `FANOUT_FORMULA.md` §4.8 + §3.5 comparison framing
- **Category:** formula-recipe
- **Rule:** `planTypes.headers` (LocalizedStringArray) and `planTypes.rows` (each row a LocalizedStringArray with matching column count). Cover HMO / PPO / SNP / PFFS / MSA — fill with what the state actually has. HMO usually dominant; PPO growing; SNP varies by state Medicaid program complexity; PFFS / MSA often 0–5 plans. `planTypes.footnote` is a state-tagged narrative summary (e.g., "HMO plans dominate California Medicare Advantage in 2026, with...") — this satisfies the §3.10 table/chart-shape framing requirement when phrased "by plan type" / "Medicare Advantage plans by carrier in [STATE_NAME] 2026".
- **Enforcement:** STEP 3 (write). STEP 6 (matching column count; footnote contains STATE_NAME).
- **Conflicts:** None.

### REQ-009 — COUNTY VARIANCE (OPTIONAL — required for states with 5+ counties of meaningful variance)
- **Source:** Old writer §STEP 2 ("County variance OPTIONAL but recommended"); `FANOUT_FORMULA.md` §4.8 shape #2 (county-level shapes mixed in)
- **Category:** formula-recipe
- **Rule:** For states with 5+ counties of meaningful variance (CA, TX, FL, NY, IL, OH, MI, GA, NC, PA, etc.), include `countyVariance` section with 4–6 example counties showing the spread. Include at least one urban county and one rural county. Each `CountyExample` populates `county` (LocalizedString), `planCount`, `averagePremium`, optional `classification` (LocalizedString: "urban"/"rural"/"mixed"). Skip for small states (DC, RI, DE, VT, NH, WY) where variance is minimal — Wyoming did not include this. Caption phrasing: "Medicare Advantage premiums by county in [STATE_NAME] 2026" (lookup-canonical phrasing per §3.10).
- **Enforcement:** STEP 3 (decide based on state size). STEP 6 (if state ≥5 counties of variance, presence required; if skipped on a large state, fail).
- **Conflicts:** None.

### REQ-010 — STATE EXTRAS (OPTIONAL — required when state has unique MA features)
- **Source:** Old writer §STEP 2 ("State-specific extras OPTIONAL"); `FANOUT_FORMULA.md` §4.8 (state-specificity REQUIRED everywhere)
- **Category:** formula-recipe
- **Rule:** Include `stateExtras` when the state has unique MA features. Examples: CA (Medi-Cal D-SNPs, Medigap birthday rule), FL (hurricane provisions), NY (Medicaid integration), HI (limited carrier choice / unique reciprocal arrangements), OR/WA (Medicare Savings Programs at higher income thresholds). Each `StateExtra` populates `label` + `description` (both LocalizedString). Skip if the state's MA market is generic — but document the skip in self-validation.
- **Enforcement:** STEP 3 (decide). STEP 6 (intro contains STATE_NAME; if skipped, document why).
- **Conflicts:** None.

### REQ-011 — DETAIL-SECTIONS MIN 2 (recommend 4: MA-vs-Original, Star Ratings, $0 plans, How-to-enroll)
- **Source:** Old writer §STEP 3 required-fields checklist ("`detailSections` must have at least 2 entries"); `FANOUT_FORMULA.md` §4.8
- **Category:** formula-recipe
- **Rule:** `detailSections[]` has at least 2 entries (hard validator min). Recommended composition for MA-state with the new universal rules layered on:
  - "Medicare Advantage vs Original Medicare in [STATE_NAME] 2026" (comparison + Medigap mention)
  - "How Star Ratings work in [STATE_NAME] Medicare Advantage 2026"
  - "$0 premium Medicare Advantage plans in [STATE_NAME] 2026" (with table)
  - "How to enroll in [STATE_NAME] Medicare Advantage 2026" (REQ-003 howToEnroll content if not slotted as a separate top-level field)
  - Optional: "Special Needs Plans (D-SNP / C-SNP / I-SNP) in [STATE_NAME] 2026" (eligibility, MSP overlap)
- **Enforcement:** STEP 3 (plan). STEP 6 (validate count ≥2; recommend ≥4 for new pages).
- **Conflicts:** Old writer min is 2; recipe favors 4. Resolution: keep min 2 hard requirement; recommend 4 in writer prompt to satisfy the §4.8 recipe.

### REQ-012 — FAQS 6–8 EN + ES PARITY (required topics list)
- **Source:** Old writer §STEP 3 required-fields checklist ("`faqs.en` has 6-8 Q&A pairs (8 preferred)"); `FANOUT_FORMULA.md` §4.8 (FAQ topics: enrollment timing, carrier comparison, SNPs eligibility); `audit-ma-state-writer.json` §A.perTemplateRecipeCoverage_4_8.SNPs (no SNP-specific FAQ — close gap)
- **Category:** formula-recipe
- **Rule:** `faqs.en` is an array of `{question, answer}` flat-string objects (not LocalizedString). 8 preferred (6 hard min). Required topic coverage: (1) enrollment timing (AEP/OEP), (2) carrier comparison ("Which carrier has the most plans in [STATE_NAME]?"), (3) MA vs Original Medicare in [STATE_NAME], (4) HMO vs PPO trade-offs, (5) $0 premium plans availability, (6) SNP eligibility (close audit gap), (7) How to enroll in [STATE_NAME] MA, (8) state-specific extras (Medi-Cal D-SNP, Medigap birthday rule, etc., where applicable). `faqs.es` matches `faqs.en` count and content. Each FAQ answer 80–150 words (per Framework §4.5 FAQ exception).
- **Enforcement:** STEP 5 (write). STEP 6 (count ≥6, Spanish parity, SNP topic present, each answer 80–150 words).
- **Conflicts:** Old writer says "60-90 words" implicitly via 1,800-2,500 word total; framework says 80–150. Resolution: framework wins; aim 80–150 per FAQ answer.

---

## Category 3: MUST — audit-flagged ma-state gaps

### REQ-013 — HOW-TO-ENROLL DETAIL SECTION (audit rank 1 fix; see REQ-003 for full sub-fields)
- **Source:** `audit-ma-state-writer.json` §C.topThreeWriterEdits[1]; §B.formulaRecipeCoverage.howToEnroll (MISSING all 3)
- **Category:** audit-flagged
- **Rule:** See REQ-003 for full content spec. This entry tracks the audit rank — closing this gap is the single biggest impact item for Track C MA-state.
- **Enforcement:** Bound to REQ-003.
- **Conflicts:** None (covered by REQ-003).

### REQ-014 — $0 PREMIUM PLANS TABLE (audit rank 3 fix)
- **Source:** `audit-ma-state-writer.json` §C.topThreeWriterEdits[3]; §B.formulaRecipeCoverage.zeroPremiumPlansSection (MISSING all 3); `FANOUT_FORMULA.md` §4.8 shape #7
- **Category:** audit-flagged
- **Rule:** Add a dedicated `detailSections[]` entry titled "$0 premium Medicare Advantage plans in [STATE_NAME] 2026" with a 4–6-row table. Columns: Carrier / Plan Name (or Plan Type) / Counties Available / Star Rating. Use real data — pull representative $0-premium plans from medicare.gov/plan-compare for the state. If a state has only 1–2 $0 plans, document that fact and list what's available. If a state has zero $0 plans (rare; typically Hawaii or some niche markets), state that explicitly with a one-paragraph explanation.
- **Enforcement:** STEP 3 (research $0 plans). STEP 5 (write detailSection.table). STEP 6 (validate table presence + 4–6 rows + state-tagged caption).
- **Conflicts:** None — purely additive.

### REQ-015 — STATE-CONTEXT BOUNDARY FIXES (audit rank 2 fix, part 1)
- **Source:** `audit-ma-state-writer.json` §C.topThreeWriterEdits[2]; §B.stateContextScan (importantDates.intro state-agnostic on all 3 pages, source captions state-agnostic on all 3)
- **Category:** audit-flagged
- **Rule:** `importantDates.intro` MUST contain STATE_NAME (e.g., "California Medicare and Medicare Advantage have several enrollment windows in 2026..."). Every `source` string field (in `marketOverview.source`, `planTypes.source`, `countyVariance.source`, every `detailSections[].table.source`) MUST include STATE_NAME or be tagged with a state qualifier (e.g., "KFF Medicare Advantage 2026 California Spotlight" not bare "KFF Medicare Advantage 2026 Spotlight").
- **Enforcement:** STEP 5 (write — bake STATE_NAME into all intro paragraphs and source citations). STEP 6 PRE-SAVE GATE (regex: `importantDates.intro.en` and `.es` MUST contain STATE_NAME; every `source` string MUST contain STATE_NAME or "<state-abbreviation>" qualifier).
- **Conflicts:** None — directly addresses audit boundary leak.

### REQ-016 — PRONOUN DISCIPLINE / NAMED-ENTITY-FIRST-SENTENCE (audit rank 2 fix, part 2)
- **Source:** `audit-ma-state-writer.json` §A.stylePronounDiscipline_5_7 (PASS_FRAGILE — currently rides on gold-standard inheritance only); §C.topThreeWriterEdits[2]; `AI_OPTIMIZATION_FRAMEWORK.md` §4.4 + §4.5 + §5.7
- **Category:** audit-flagged
- **Rule:** Every paragraph (in `quickAnswer`, `introParagraphs[]`, `whatToLookFor.intro`, `countyVariance.intro`, `importantDates.intro`, `stateExtras.intro`, every `detailSections[].paragraphs[]`, every `faqs.en[].answer`, every `faqs.es[].answer`) MUST OPEN with a named entity (STATE_NAME, a carrier name, a program name like "Medicare Advantage" or "AEP", or a concrete noun phrase). Never open with: "It", "They", "This", "These", "Here", "There", "Such", "That". Subsequent sentences may use pronouns when the referent is unambiguous.
- **Enforcement:** STEP 5 (write — sweep paragraph openers). STEP 6 PRE-SAVE GATE: regex on every paragraph-opening sentence — if first word matches `(It|They|This|These|Here|There|Such|That)\b` and not followed by a named-entity recovery, FAIL. Codify so this doesn't ride on gold-standard inheritance only.
- **Conflicts:** Old writer relies on gold-standard inheritance from california.json. Resolution: codify in STEP 6 as a hard-reject GATE.

### REQ-017 — TABLE/CHART-SHAPE FRAMING IN CAPTIONS
- **Source:** `audit-ma-state-writer.json` §A.universalRulesCoverage.3_10_tableChartShapeFraming (PARTIAL); `FANOUT_FORMULA.md` §3.10
- **Category:** audit-flagged
- **Rule:** Every table caption / footnote / source string for `planTypes`, `countyVariance`, `topCarriers` (in narrative summary), and `detailSections[].table` SHOULD use lookup-canonical phrasings: "Medicare Advantage plans by carrier in [STATE_NAME] 2026", "Medicare Advantage premiums by county in [STATE_NAME] 2026", "$0 premium Medicare Advantage plans in [STATE_NAME] 2026", "Medicare Advantage Star Ratings by carrier in [STATE_NAME] 2026", "Medicare Advantage by plan type in [STATE_NAME] 2026". Use literal "by [dimension]" / "chart" / "guidelines" framing in at least 3 captions per page.
- **Enforcement:** STEP 5 (write captions). STEP 6 (count: ≥3 captions use "by [dim]" or "chart" framing).
- **Conflicts:** Soft (already enforced as soft); upgrade to ≥3 hard count.

### REQ-018 — ELIGIBILITY ENTAILMENT ("Am I eligible for MA in [STATE]")
- **Source:** `audit-ma-state-writer.json` §A.universalRulesCoverage.3_8_eligibilityEntailment (PARTIAL); `FANOUT_FORMULA.md` §3.8
- **Category:** audit-flagged
- **Rule:** Add a section or FAQ entry covering MA eligibility prerequisites for [STATE_NAME] residents: must have Medicare Part A AND Part B; must live in the plan's service area (state-by-county dependent); ESRD enrollees may have restricted plan options (post-21st Century Cures Act, most plans accept ESRD but some limit; clarify per state). Acceptable to satisfy via a dedicated detailSection OR an FAQ entry titled "Am I eligible for Medicare Advantage in [STATE_NAME] in 2026?".
- **Enforcement:** STEP 5 (write). STEP 6 (presence check in either detailSections or FAQs).
- **Conflicts:** None.

### REQ-019 — SNP DEDICATED FAQ + SNP DETAIL CONTENT
- **Source:** `audit-ma-state-writer.json` §A.perTemplateRecipeCoverage_4_8.SNPs (PARTIAL: row in planTypes + mention in detailSections, no dedicated FAQ); `FANOUT_FORMULA.md` §4.8 shape #8
- **Category:** audit-flagged
- **Rule:** Add at least one SNP-specific FAQ ("Who qualifies for a D-SNP / C-SNP / I-SNP in [STATE_NAME]?") with the chronic-condition list (D-SNP: Medicaid eligibility; C-SNP: chronic conditions like diabetes, CHF, ESRD, COPD; I-SNP: institutional/skilled-nursing residence). Pair with a dedicated detailSection if the state has notable SNP penetration (CA Medi-Cal D-SNP integration is the canonical example).
- **Enforcement:** STEP 5 (write). STEP 6 (FAQ topic count includes SNP).
- **Conflicts:** None.

### REQ-020 — DEMOGRAPHIC SPECIFICITY (turning-65, snowbirds, low-income, working-past-65)
- **Source:** `audit-ma-state-writer.json` §A.universalRulesCoverage.3_9_demographicSpecificity (PARTIAL — geographic via countyVariance + chronic-condition via SNP, but beneficiary demographics not surfaced); `FANOUT_FORMULA.md` §3.9
- **Category:** audit-flagged
- **Rule:** Acceptable for MA-state. Demographic dimensions (turning-65 → /event/turning-65; snowbirds → cross-state coverage; working-past-65 → IEP/SEP overlap; low-income → MSP/D-SNP overlap) primarily live in adjacent /event/ and /for/ templates. The MA-state writer should LINK to those templates via `relatedLinks` (REQ-049) rather than duplicate. No new content requirement here; document in STEP 3 plan that demographic depth lives in linked templates.
- **Enforcement:** STEP 3 (plan — note that demographics route to linked templates). No hard validation.
- **Conflicts:** None.

### REQ-021 — DON'T INVENT STATE-SPECIFIC FACTS
- **Source:** Old writer §STEP 3 ("CRITICAL: Don't invent state-specific facts"); `audit-ma-state-writer.json` §B.anchorFactsAccuracy (PASS — no fabrication detected)
- **Category:** audit-flagged
- **Rule:** If a niche stat (a specific carrier's Star Rating in a specific state) cannot be verified, use a defensible aggregate or omit the optional section. Verifier WILL catch fabricated stats. Better to skip a `notes` field than to fabricate. NEVER invent: carrier presence (Kaiser only in 9 states + DC), plan counts, Star Ratings, premium dollar figures, beneficiary counts. Always cite the source.
- **Enforcement:** STEP 1 + STEP 3 (research). STEP 6 (LLM-judge: cross-check claims against research notes).
- **Conflicts:** None — preserved + reinforced.

---

## Category 4: MUST — framework-preserved (AI_OPTIMIZATION_FRAMEWORK rules to keep)

### REQ-022 — PARAGRAPH-LENGTH-150-300 (body) / 80-150 (FAQ)
- **Source:** `AI_OPTIMIZATION_FRAMEWORK.md` §3.1 + §4.5 + §8.4; `CURRENT_STATE_AUDIT.md` §1 (paragraph length is universal CRITICAL gap, 8/8 templates affected)
- **Category:** framework-preserved
- **Rule:** Body prose paragraphs (in `introParagraphs[]`, `quickAnswer`, every `detailSections[].paragraphs[]`, every `*.intro`) target 150–300 words. FAQ answers run 80–150 words for conversational pacing. Validator warns at <80 or >400; fails at <50 or >500.
- **Enforcement:** STEP 5 (write — aim middle of range). STEP 6 (count words per paragraph; flag any <80 or >400; FAQ answers checked at 80–150).
- **Conflicts:** Old writer has no explicit paragraph-length rule. Resolution: framework wins.

### REQ-023 — META-TITLE-CAP ≤70 CHARS (en + es)
- **Source:** `AI_OPTIMIZATION_FRAMEWORK.md` §4.2 + §8.4; old writer §STEP 3 ("Validator enforces — over 70 chars fails the build"); `validate-medicare-advantage.js` (META_TITLE_MAX = 70)
- **Category:** framework-preserved
- **Rule:** `meta.title.en` ≤ 70 chars AND `meta.title.es` ≤ 70 chars. Hard fail in validator. Recommended writer-prompt cap: 65 chars (safety buffer for Spanish, which often runs longer). Must include "CoveredUSA" suffix, STATE_NAME, and "2026".
- **Enforcement:** STEP 4 (write title). STEP 6 (validate length both locales).
- **Conflicts:** None.

### REQ-024 — META-DESCRIPTION-CAP ≤160 CHARS (en + es)
- **Source:** `AI_OPTIMIZATION_FRAMEWORK.md` §4.2 + §8.4; `validate-medicare-advantage.js` (META_DESCRIPTION_MAX = 160)
- **Category:** framework-preserved
- **Rule:** `meta.description.en` ≤ 160 chars AND `meta.description.es` ≤ 160 chars. Hard fail. Writer-prompt working cap: 155 chars (safety buffer).
- **Enforcement:** STEP 4 (write description). STEP 6 (validate length both locales).
- **Conflicts:** None.

### REQ-025 — STRUCTURAL-PROPORTION 25–35% (warn outside 20–40, fail outside 10–50)
- **Source:** `AI_OPTIMIZATION_FRAMEWORK.md` §3.1 + §4.6 + §8.4; `audit-ma-state-writer.json` §B.structural (CA 34.6% / TX 37.5% / WY 36.2% — IN TARGET, preserve)
- **Category:** framework-preserved
- **Rule:** Combined `<table>` + `<ul>` + `<ol>` content as fraction of total body content target 25–35%. Audit confirms current MA-state pages PASS this. The new $0 premium plans table + howToEnroll docs-needed checklist + denial-reasons callout add structural mass — re-verify after additions.
- **Enforcement:** STEP 5 (balance prose vs structure). STEP 6 (validate ratio).
- **Conflicts:** None.

### REQ-026 — SOURCE-COUNT-MIN-3
- **Source:** `AI_OPTIMIZATION_FRAMEWORK.md` §8.4; old writer §STEP 3 ("`sources` has minimum 3 entries"); `validate-medicare-advantage.js`
- **Category:** framework-preserved
- **Rule:** `sources[]` array has ≥3 distinct entries. Each `MASource` has `name` (string), `url` (string), `note` (LocalizedString). Prefer medicare.gov, cms.gov, kff.org, state DOI. State Plan Finder data + KFF + state-specific = canonical 3.
- **Enforcement:** STEP 6 (validate count + populated fields).
- **Conflicts:** None.

### REQ-027 — SCHEMA: MEDICALWEBPAGE + DATASET (handled by template; writer emits clean JSON)
- **Source:** `AI_OPTIMIZATION_FRAMEWORK.md` §4.7 + §5.7; `CURRENT_STATE_AUDIT.md` §6 (MedicalWebPage + Dataset already emitted on MA-state); Track A1 `@graph` refactor pending
- **Category:** framework-preserved
- **Rule:** The writer does NOT hand-roll schema. The page template at `src/app/[locale]/medicare-advantage/[state]/page.tsx` builds schema graph from JSON. Writer's contract: emit clean JSON conforming to `MedicareAdvantageState` interface. Don't add schema fields to the JSON — the template handles them.
- **Enforcement:** STEP 5 (don't fabricate schema fields).
- **Conflicts:** None.

### REQ-028 — DIRECT NUMERIC ANSWER IN FIRST 50 WORDS (hero subhero + quickAnswer)
- **Source:** `AI_OPTIMIZATION_FRAMEWORK.md` §1 (TL;DR rule 3) + §4.4 + §8.3
- **Category:** framework-preserved
- **Rule:** First 50 words of body content (`hero.subhero` + first sentence of `quickAnswer`) MUST contain a direct numeric answer to "What is Medicare Advantage in [STATE_NAME] for 2026?" — i.e., total plans available + enrolled beneficiaries OR penetration % + AEP date + average premium OR average Star Rating. Use unhedged numeric claims ($14/mo, not "around $14"). Audit confirms current pages do this well.
- **Enforcement:** STEP 5 (write hero.subhero + quickAnswer). STEP 6 (regex: first 50 words MUST contain a `\$|\d+%|\d+,\d{3}` token + STATE_NAME).
- **Conflicts:** None.

### REQ-029 — STRONG-DENSITY 5–10% (markdown bold via JSON paragraph fields)
- **Source:** `AI_OPTIMIZATION_FRAMEWORK.md` §1.5 (rule 6) + §4.4 + §8.3; locked decision (PHASE_5_BRIDGE.md §4.1) — markdown-rich paragraphs
- **Category:** framework-preserved
- **Rule:** Apply markdown `**bold**` to 5–10% of total body content. Prioritize sentence-initial positions on STATE_NAME, dollar amounts, dates ("AEP October 15"), and key claims. The MA-state JSON template currently renders plain `<p>{text}</p>` for paragraphs — when Track A1 `@graph` refactor lands, markdown rendering may follow. **For now, embed `**bold**` markers in paragraph strings; renderer upgrade is out of Track C scope.** The validator should not block on missing bold density during this transition.
- **Enforcement:** STEP 5 (write — embed markdown bold). STEP 6 (warn-only on density during transition).
- **Conflicts:** Renderer may not yet honor markdown. Resolution: write the markdown anyway; warn-only validation; full enforcement when renderer ships. Document in STEP 5 that bold may render literally until template upgrade.

### REQ-030 — SPANISH PARITY (every LocalizedString has en + es)
- **Source:** Old writer ("Spanish translation is required"); `validate-medicare-advantage.js` enforces; `audit-ma-state-writer.json` §B.structural.spanishParity (PASS — best Spanish translation of any template; preserve quality)
- **Category:** framework-preserved
- **Rule:** Every `LocalizedString` field has BOTH `en` AND `es`. `LocalizedStringArray` has both `en[]` and `es[]` with matching item counts. `faqs.en[].count === faqs.es[].count` and content matches semantically. Use Spanish state names where they differ (Pensilvania, Misisipi, Hawái, Nuevo Hampshire, Nueva Jersey, Nuevo México, Nueva York, Carolina del Norte, Carolina del Sur, Dakota del Norte, Dakota del Sur, Virginia Occidental). Use canonical Spanish program terms ("Período Anual de Elección" for AEP, "Plan de Necesidades Especiales" for SNP).
- **Enforcement:** STEP 5 (write Spanish concurrently). STEP 6 (parity check).
- **Conflicts:** None.

### REQ-031 — FLAT-STRING FIELDS (do NOT wrap in {en,es})
- **Source:** Old writer §STEP 3 ("CRITICAL faqs shape clarification" + flat-string list); `medicare-advantage.ts` interface
- **Category:** framework-preserved
- **Rule:** These fields are FLAT strings (do NOT wrap in `{en,es}`): `slug`, `stateAbbreviation`, `topic`, `medicalSpecialty`, `ctaTarget`, `lastUpdated`, `readingTime`, every `source` field (in marketOverview / planTypes / countyVariance / detailSections.table / sources[]), every `topCarriers[].name`, every FAQ `question`/`answer`, every `sources[].name`/`sources[].url`, every `relatedLinks[].href`. Everything else that is human-readable prose is `LocalizedString = {en, es}`.
- **Enforcement:** STEP 5 (writing). STEP 6 (validator catches type errors at JSON parse time).
- **Conflicts:** None — preserved verbatim.

### REQ-032 — 2026 ANCHOR FACTS (CRITICAL — no inventing or stale 2025 figures)
- **Source:** Old writer §STEP 3 ("CRITICAL: 2026 anchor facts only"); `audit-ma-state-writer.json` §B.anchorFactsAccuracy (PASS); `AI_OPTIMIZATION_FRAMEWORK.md` §4.11 (mid-year numeric change protocol)
- **Category:** framework-preserved
- **Rule:** Use these EXACT 2026 anchor facts:
  - **AEP**: October 15 – December 7, 2026 (coverage starts January 1, **2027**)
  - **MA OEP**: January 1 – March 31, 2026 (one switch only, existing MA enrollees)
  - **IEP**: 7-month window around 65th birthday
  - **2026 Part B premium**: $202.90/mo (standard); $283 annual deductible
  - **2026 Part A inpatient deductible**: $1,736
  - **2026 Part D OOP cap**: $2,100 (set by IRA 2022)
  - **2026 MA in-network MOOP federal ceiling**: $9,250 (NOT $9,350 — that's 2025)
  - **Insulin cap**: $35/mo (IRA 2022, effective 2023)
  - **National average MA premium 2026**: $14/mo (CMS, all MA enrollees) or $11.50/mo (KFF, MA-PD only). Use $14/mo in prose unless source is explicitly MA-PD-only.
  - **Inflation Reduction Act**: signed August 16, **2022** (NOT 2023)
- **Enforcement:** STEP 1 (research). STEP 6 (regex: NO occurrence of "$9,350" — that's 2025 MOOP; flag every $ figure for cross-check).
- **Conflicts:** None — reinforce.

### REQ-033 — RELATED LINKS 2-4 INTERNAL (use link-index)
- **Source:** Old writer §STEP 3 ("`relatedLinks` has 2-4 internal links"); `LINK_TARGET_MANIFEST.md` §2.1
- **Category:** framework-preserved
- **Rule:** `relatedLinks[]` has 2–4 entries. Each `RelatedLink` has `label` (LocalizedString) + `href` (relative path, no locale prefix — template adds it). Valid hrefs: `/medicare-eligibility`, `/event/turning-65`, `/screener`, `/glossary/<term>`, `/medical-bill-analyzer`, `/medicaid-income-limits`. Don't link to `/medicare-supplement` (does not exist). Validator enforces href prefix list.
- **Enforcement:** STEP 5. STEP 6 (count 2–4 + validator catches bad hrefs).
- **Conflicts:** None — preserved.

### REQ-034 — READING-TIME FORMAT
- **Source:** Old writer §STEP 3 ("`readingTime` is a string like '9 min read'")
- **Category:** framework-preserved
- **Rule:** `readingTime` is a flat string like "9 min read". Estimate at ~200 wpm; aim for 1,800–2,500 word total page → 9–12 min. With Track C additions (howToEnroll + $0 premium table + SNP detailSection), expect creep to 2,200–2,800 words → 11–14 min.
- **Enforcement:** STEP 5.
- **Conflicts:** Old writer says 1,800–2,500. New rule expands to 2,200–2,800 to accommodate REQ-003 + REQ-014 + REQ-019 additions. Resolution: framework wins — don't sacrifice required sections for word-count target.

---

## Category 5: MUST — hard-contracts (preserved from existing writer)

### REQ-035 — JSON-RETURN-SHAPE (extended additively per B1 pattern)
- **Source:** Old writer §STEP 5; `b1-requirements-matrix.md` REQ-033; bulkgen cron parses this
- **Category:** hard-contract
- **Rule:** Final output of writer agent MUST end with a JSON object on its own line. Success shape: `{"slug": "the-slug", "status": "success", "word_count": 2100, "total_plans": 144, "top_carrier_count": 8, "faq_count": 8, "has_county_variance": true, "has_state_extras": true, "detail_section_count": 4, "topicCluster": "medicare-advantage", "keyTerms": ["...", "..."], "gapsFlagged": []}`. Error shape: `{"slug": "attempted-slug", "status": "error", "error": "brief description"}`. Nothing comes after the JSON line. New additive fields (`topicCluster`, `keyTerms`, `gapsFlagged`) are OK; do not rename or remove existing fields.
- **Enforcement:** Last line of agent output. Parsed by bulkgen cron (`coveredusa-ma-state-bulkgen.md`).
- **Conflicts:** Old writer omits `topicCluster`/`keyTerms`/`gapsFlagged`. Resolution: additive — preserve old fields, add new fields. Bulkgen tolerates the larger object.

### REQ-036 — ATOMIC WRITE PATTERN (.tmp.json → validate → rename)
- **Source:** Old writer §STEP 0 + §STEP 4 ("Atomic write pattern")
- **Category:** hard-contract
- **Rule:** Write to `<slug>.tmp.json` first. Validate with `node -e "JSON.parse(require('fs').readFileSync('...', 'utf8'))"` and confirm `VALID_JSON` output. Run em-dash check (`grep -c -- "—\|–"` — must be 0; en-dash between digits in price ranges allowed). Run STEP 6 GATES. Only then `mv <slug>.tmp.json <slug>.json`. Prevents half-written files from masquerading as "exists" on next retry.
- **Enforcement:** STEP 7 (save).
- **Conflicts:** None — preserved verbatim.

### REQ-037 — STEP-N NUMBERED HEADINGS (cron parses for logging)
- **Source:** `TRACK_C_PARALLEL_PLAN.md` §3 Phase 2; `b1-requirements-matrix.md` REQ-036
- **Category:** hard-contract
- **Rule:** Writer prompt structure uses `## STEP N` numbered headings (STEP 0 through STEP 8 per B1's skeleton; map cleanly to existing STEP 0–STEP 5 in old MA-state writer + add STEP 6 self-validation, STEP 7 save, STEP 8 return JSON if not already split). Bulkgen cron parses these for progress logging.
- **Enforcement:** Prompt structure constraint. Phase 3 verifier checks heading shape.
- **Conflicts:** None.

### REQ-038 — PRE-FLIGHT: OVERWRITE GUARD VIA QUEUE STATUS
- **Source:** Old writer §STEP 0 ("Pre-flight"); `_queue.json` exists at `content/data/medicare-advantage/_queue.json`
- **Category:** hard-contract
- **Rule:** STEP 0 — if target JSON exists at `<slug>.json`, check `_queue.json` for the slug's `status`. If `"write_failed"` or `"flagged"` → ALLOWED to overwrite (retry case). Otherwise (status is "verified" or entry doesn't exist in queue) → return error JSON with reason "already exists" and exit. Do NOT overwrite verified files.
- **Enforcement:** STEP 0.
- **Conflicts:** None — preserved verbatim.

### REQ-039 — INPUTS CONTRACT (STATE_NAME, STATE_SLUG, STATE_ABBREVIATION + bulkgen-supplied TOPIC_CLUSTER, FORMULA_RECIPE, UNIVERSAL_RULES)
- **Source:** Old writer §"YOUR TASK"; bulkgen pipeline (TRACK_C_PARALLEL_PLAN.md §5.1)
- **Category:** hard-contract
- **Rule:** Writer accepts these inputs from bulkgen payload: STATE_NAME (full state name, e.g., "Florida"), STATE_SLUG (lowercase hyphenated, e.g., "florida"), STATE_ABBREVIATION (uppercase 2-letter, e.g., "FL"), optional NOTES. PLUS three new fields per B1 pattern (additive, not replacing): TOPIC_CLUSTER (default "medicare-advantage"), FORMULA_RECIPE (default "ma-state" pointing at `FANOUT_FORMULA.md` §4.8), UNIVERSAL_RULES (instruction to load `_universal-rules-block.md` verbatim).
- **Enforcement:** STEP 0 / INPUTS section.
- **Conflicts:** None — additive.

### REQ-040 — TARGET FILE PATH + DIRECTORY (PLURAL `medicare-advantage` — exact)
- **Source:** Old writer §STEP 0 (path); `TRACK_C_PARALLEL_PLAN.md` §4 ("ACTUAL directory names — use these exactly: MA-state → `projects/covered-usa/content/data/medicare-advantage/<slug>.json`"); `medicare-advantage.ts` loader path
- **Category:** hard-contract
- **Rule:** Output goes to `$HOME/clawd/projects/covered-usa/content/data/medicare-advantage/<slug>.json` (full state name, hyphenated). Directory MUST be `medicare-advantage` (with hyphen, no plural-s — this is how `medicare-advantage.ts` reads it). Writing to any other directory means the validator and page route won't pick it up.
- **Enforcement:** STEP 0 / STEP 7. Use `$HOME` for path portability.
- **Conflicts:** Old writer hardcodes `/Users/frankthebot/clawd/...`. Resolution: rewrite to `$HOME/clawd/...` per B1 lessons learned (path portability across MacBook + Mac mini).

### REQ-041 — SCHEMA INTERFACE CONFORMANCE (`MedicareAdvantageState`)
- **Source:** Old writer §STEP 1 ("Read the schema + gold standard"); `src/lib/medicare-advantage.ts`
- **Category:** hard-contract
- **Rule:** The output JSON MUST conform exactly to the `MedicareAdvantageState` TypeScript interface in `src/lib/medicare-advantage.ts`. Page crashes at build time if shape diverges. Required vs optional fields:
  - **Required:** `slug`, `stateName`, `stateAbbreviation`, `topic`, `medicalSpecialty`, `ctaTarget`, `lastUpdated`, `readingTime`, `meta`, `hero`, `quickAnswer`, `introParagraphs`, `marketOverview`, `planTypes`, `whatToLookFor`, `importantDates`, `detailSections`, `faqs`, `relatedLinks`, `sources`
  - **Optional:** `countyVariance?`, `stateExtras?`
  - **CTA:** `ctaTarget` literal type — only `'screener'` or `'analyzer'` allowed (default `'screener'` for Medicare flows)
  - **Numeric ranges:** `marketOverview.penetrationPct` 0–100; `marketOverview.averageStarRating` 1.0–5.0; `marketOverview.averageMonthlyPremium` non-negative (validator caps at MONTHLY_PREMIUM_MAX = 300)
  - **Column-count match:** `planTypes.headers` and each `planTypes.rows[i]` must have matching column count; same for `detailSections[].table` if present
- **Enforcement:** STEP 1 (read schema). STEP 5 (write conforming JSON). STEP 7 (validator catches divergence).
- **Conflicts:** None — preserved.

### REQ-042 — GOLD STANDARD REFERENCE (california.json)
- **Source:** Old writer §STEP 1
- **Category:** hard-contract
- **Rule:** Read `$HOME/clawd/projects/covered-usa/content/data/medicare-advantage/california.json` as structural reference. **Important:** as part of Track C, california.json should be UPDATED to include the new howToEnroll detailSection, state-tagged `importantDates.intro`, state-tagged source captions, and $0 premium plans table — so all downstream parallel writers inherit the new pattern (see audit §trackD_scaleUpReadiness.preFlightChecklist[2]). If reading california.json BEFORE that update, the writer must layer the new requirements ON TOP of the existing gold-standard pattern, not blindly copy. Coordinate with Phase 5 to refresh california.json as part of the activation step.
- **Enforcement:** STEP 1.
- **Conflicts:** None — but flag that gold standard needs refresh.

### REQ-043 — DATA YEAR + lastUpdated DATE
- **Source:** Old writer §STEP 3; `validate-medicare-advantage.js` (REQUIRED_DATA_YEAR = 2026)
- **Category:** hard-contract
- **Rule:** `marketOverview.dataYear` = 2026 (numeric, hard-required by validator). `lastUpdated` = today's ISO date (YYYY-MM-DD format). When 2026 → 2027 rolls over (per Framework §6.4), update REQUIRED_DATA_YEAR in validator AND every page's data, but DO NOT migrate slugs.
- **Enforcement:** STEP 5 (write). STEP 6 (validate).
- **Conflicts:** None.

---

## Category 6: MUST — slug rules

### REQ-044 — SLUG MAX 60 CHARS
- **Source:** `URL_SLUG_FRAMEWORK.md` §Rule 3; `scripts/lib/content-quality.js` `checkSlug()`
- **Category:** slug-rule
- **Rule:** Slug ≤ 60 characters.
- **Enforcement:** STEP 3 (slug). STEP 6 (validate length). For MA-state, slug is the state name — all 50 + DC fit comfortably ("south-carolina" = 14 chars).
- **Conflicts:** None.

### REQ-045 — SLUG KEBAB-CASE ONLY (`[a-z0-9-]`)
- **Source:** `URL_SLUG_FRAMEWORK.md` §Rule 3; `content-quality.js` `checkSlug()`
- **Category:** slug-rule
- **Rule:** Slug characters limited to `[a-z0-9-]`. No underscores, no uppercase, no special characters. No leading/trailing hyphens. No consecutive (`--`) hyphens. State slugs are lowercase full state names (`california`, not `ca`; `new-mexico`, not `new_mexico` or `nm`; `dc` for D.C. — confirm convention with existing pages).
- **Enforcement:** STEP 3. STEP 6 (regex).
- **Conflicts:** None.

### REQ-046 — NO YEAR IN SLUG
- **Source:** `URL_SLUG_FRAMEWORK.md` §Rule 2; `content-quality.js` `checkSlug()`; B1 lessons learned (GATE A)
- **Category:** slug-rule
- **Rule:** Slug MUST NOT contain a 4-digit year (regex `/\b(19|20)\d{2}\b/` against slug → must NOT match). Year markers go in title, h1, meta, hero, and body content only. Validator hard-fails. Worked example: `california` ✓; `california-2026` ❌; `medicare-advantage-california-2026` ❌.
- **Enforcement:** STEP 6 PRE-SAVE GATE A. STEP 7 (validator).
- **Conflicts:** None.

### REQ-047 — NEVER MIGRATE EXISTING SLUGS
- **Source:** `URL_SLUG_FRAMEWORK.md` §Rule 1; memory entry `feedback_never_migrate_slugs.md`; `TRACK_C_PARALLEL_PLAN.md` Phase 5 tripwires
- **Category:** slug-rule
- **Rule:** Writer NEVER proposes slug migrations, even with 301 redirects. Existing slugs (california, texas, wyoming) are immutable. Pre-flight at STEP 0: if slug already exists and queue status is "verified", return error JSON, don't overwrite. New states (florida, new-york, michigan, ohio, pennsylvania for Phase 4 test) propose new slugs that follow REQ-044/045/046.
- **Enforcement:** STEP 0 (overwrite guard). Phase 5 git tripwires (`git diff --name-status HEAD | grep "^R"` must be empty; `git diff -G '"slug":' HEAD` must be empty for existing files).
- **Conflicts:** None.

### REQ-048 — STATE/LOCALE AS STATIC SUBDIRECTORY
- **Source:** `URL_SLUG_FRAMEWORK.md` §Rule 4; `audit-ma-state-writer.json` §A.universalRulesCoverage (state-as-subdir confirmed PASS)
- **Category:** slug-rule
- **Rule:** Path is `/medicare-advantage/[state]`, never `?state=...`. The `[locale]` prefix (`/en/`, `/es/`) is added by Next.js at the route layer. The writer doesn't emit locale prefixes in the slug.
- **Enforcement:** STEP 0 (target path); STEP 7.
- **Conflicts:** None.

---

## Category 7: MUST — link-index consumption

### REQ-049 — LOAD link-index.json AT WRITE TIME
- **Source:** `LINK_TARGET_MANIFEST.md` §5; `TRACK_C_PARALLEL_PLAN.md` §3 Phase 2
- **Category:** link-consumption
- **Rule:** STEP 0 — load `$HOME/clawd/projects/covered-usa/content/link-index.json` (auto-built; do not edit). The file contains `byTopic`, `byPhrase`, `lighthouses`. If file missing, fall back to a hardcoded minimal lighthouse list (`/medicare-eligibility`, `/medicaid-income-limits`, `/federal-poverty-level`, `/medical-bill-analyzer`, `/event/turning-65`, `/screener`) and flag in `gapsFlagged` field of return JSON.
- **Enforcement:** STEP 0 (load). STEP 5 (use for inline body links + relatedLinks).
- **Conflicts:** None.

### REQ-050 — INLINE BODY LINKS 3–5 (auto-link first occurrence per phrase)
- **Source:** `LINK_TARGET_MANIFEST.md` §5 + §6.3 (3–5 warn, max 5 hard); `b1-requirements-matrix.md` REQ-045
- **Category:** link-consumption
- **Rule:** Each MA-state page emits 3–5 inline body links to canonical lighthouses from `link-index.json`. For each phrase mentioned in body content matching `link-index.byPhrase[<locale>]`, hyperlink the FIRST occurrence to the mapped canonical URL `/<locale>/<lighthouse-path>`. Cap at 5. Natural placement trumps count — if no natural placement, skip rather than force. Embed inline markdown links in `quickAnswer`, `introParagraphs[]`, `detailSections[].paragraphs[]`, FAQ answers, and `howToEnroll` content. **Locale-aware:** Spanish version uses `byPhrase.es` and links to `/es/<path>`.
- **Enforcement:** STEP 5 (write). STEP 6 (count: 3–5 inline links).
- **Conflicts:** Old writer hardcodes link targets without using link-index. Resolution: link-index is source of truth.

### REQ-051 — NEVER SELF-LINK
- **Source:** `LINK_TARGET_MANIFEST.md` §6.3 (strict-fail no self-link)
- **Category:** link-consumption
- **Rule:** Don't link a phrase on this page to this page's own URL (`/medicare-advantage/<slug>`). Skip self-link targets when scanning byPhrase.
- **Enforcement:** STEP 5. STEP 6.
- **Conflicts:** None.

### REQ-052 — NEVER LINK A PHRASE INSIDE AN EXISTING LINK
- **Source:** `LINK_TARGET_MANIFEST.md` §5
- **Category:** link-consumption
- **Rule:** Once a phrase is inside a markdown link, don't nest another link inside it. One link per phrase per page.
- **Enforcement:** STEP 5.
- **Conflicts:** None.

### REQ-053 — NEVER LINK IN HEADINGS (h1/h2/h3)
- **Source:** `LINK_TARGET_MANIFEST.md` §5
- **Category:** link-consumption
- **Rule:** Internal links go in body prose, table cells, FAQ answers, and `*.intro` paragraphs ONLY. Never in `meta.title`, `hero.h1`, `detailSections[].heading`, or any structural heading. For MA-state JSON, this means: no markdown links in `meta.title`, `hero.h1`, `detailSections[].heading`, `whatToLookFor.items[]` (those are list items rendered as headings), `importantDates.items[].label`.
- **Enforcement:** STEP 5.
- **Conflicts:** None.

### REQ-054 — DECLARE topicCluster + keyTerms FOR THIS PAGE'S OWN METADATA
- **Source:** `LINK_TARGET_MANIFEST.md` §1.1 + §5; `TRACK_C_PARALLEL_PLAN.md` §3 Phase 2
- **Category:** link-consumption
- **Rule:** Add three new top-level fields to the JSON output (additive; if `MedicareAdvantageState` interface doesn't yet declare them, add as optional in coordination with Track A1; for now emit in the JSON and let the link-index builder consume):
  - `topicCluster: "medicare-advantage"` (or `"medicare-advantage-<state-slug>"` if state-specific cluster anchored later)
  - `keyTerms: { en: [...], es: [...] }` — 3–8 anchor-candidate phrases per locale, e.g., `["California Medicare Advantage", "Medicare Advantage in California", "California MA plans 2026", "Medicare Advantage California carriers"]`
  - `isLighthouse: false` (state spokes default false; the future `/medicare-advantage` hub will be the lighthouse)
  - `isDeprecated: false`
- **Enforcement:** STEP 5 (emit fields). STEP 6 (validate keyTerms.en ≥1, keyTerms.es ≥1, topicCluster matches `/^[a-z0-9-]+$/`).
- **Conflicts:** Old writer JSON shape doesn't include these fields. Resolution: additive — emit in writer; link-index builder consumes; eventual schema upgrade.

---

## Category 8: SOFT — strategic posture (writer-prompt guidance)

### REQ-055 — LOOKUP-CONTENT BIAS
- **Source:** `FANOUT_FORMULA.md` §1 ("Bing wants LOOKUP CONTENT, not explainers"); `audit-ma-state-writer.json` §A.universalRulesCoverage.3_10 + §3_8
- **Category:** strategic-posture
- **Rule:** Bias toward LOOKUP shape: tables (planTypes, county variance, top carriers, $0 premium plans, MSP income limits when D-SNP applies), state-specific numeric callouts (plan count, beneficiary count, penetration %, Star Rating). De-prioritize concept-only deep-dives. Audit confirmed structural % is in target on existing pages (CA 34.6% / TX 37.5% / WY 36.2%).
- **Enforcement:** STEP 3 (plan — favor table-shaped content over essay-shaped).
- **Conflicts:** None.

### REQ-056 — VARIANT WEIGHTING (Specification + Equivalent + Canonicalization HIGH)
- **Source:** `PHASE_5_BRIDGE.md` §3 (empirical re-weighting); `FANOUT_FORMULA.md` §4.8 (Specification 36.2%, Equivalent 26.6%, Entailment 36.7%)
- **Category:** strategic-posture
- **Rule:** When mapping H2s to fan-out variants for MA-state, weight: **Specification HIGH** (state + year + topic — `/medicare-advantage/[state]` IS the Specification template), **Equivalent HIGH** (multiple phrasings: "MA plans in [STATE]", "Medicare Advantage [STATE]", "[STATE] Medicare Advantage 2026"), **Entailment HIGH** (how-to-enroll, eligibility, what-to-do-next). Cover: Clarification (HMO vs PPO vs SNP), Generalization (national MA context). Skip: Translation (locale-handled separately), Follow-up (sequential build less visible). Use canonical-form coverage: list "Medicare Advantage", "MA", "Part C" (the Medicare-Part-C name for MA), "Medicare Health Plan" naturally distributed.
- **Enforcement:** STEP 3 (plan H2 mapping).
- **Conflicts:** None.

### REQ-057 — COMPARISON FRAMING (MA vs Medigap vs Original; HMO vs PPO; D-SNP vs C-SNP vs I-SNP)
- **Source:** `FANOUT_FORMULA.md` §3.5; `audit-ma-state-writer.json` §A.universalRulesCoverage.3_5 (PASS — preserve)
- **Category:** strategic-posture
- **Rule:** Audit confirms STRONG comparison framing on current pages (MA vs Original Medicare detailSection; HMO vs PPO vs SNP planTypes table). Preserve. Ensure each MA-state page contains at least 2 explicit "X vs Y vs Z" sections.
- **Enforcement:** STEP 3 (plan).
- **Conflicts:** None.

### REQ-058 — TABLE/CHART-SHAPE PHRASING (use "by [dim]" / "chart" / "guidelines")
- **Source:** `FANOUT_FORMULA.md` §3.10; REQ-017 (audit-flagged upgrade)
- **Category:** strategic-posture
- **Rule:** Use literal "chart" / "guidelines" / "by [dim]" phrasings in table captions and section headings (e.g., "Medicare Advantage by carrier in [STATE_NAME] 2026", "Medicare Advantage premiums by county in [STATE_NAME] 2026"). Bing rewards lookup-shape signaling.
- **Enforcement:** STEP 5 (write captions). STEP 6 (≥3 captions match).
- **Conflicts:** None — covered by REQ-017.

---

## Category 9: MUST — humanizer voice

### REQ-059 — NO EM-DASHES (and no `--` literals)
- **Source:** Old writer §"Style rules"; `humanizer/SKILL.md`; `AI_OPTIMIZATION_FRAMEWORK.md` §8.4; B1 GATE D
- **Category:** humanizer-voice
- **Rule:** Zero em-dashes (`—` U+2014) AND zero double-hyphens (`--`) anywhere in body content, frontmatter, titles, descriptions, FAQ answers, or any rendered surface. Use commas, periods, parentheses, or "to" for ranges. **En-dashes (`–` U+2013) between digits in numeric ranges (e.g., `$400–$3,500`, `Oct 15–Dec 7`) are allowed**; bare en-dashes elsewhere are banned.
- **Enforcement:** STEP 5 (write). STEP 6 PRE-SAVE GATE D: `grep -c -- "—"` MUST be 0; `grep -c -- "--"` MUST be 0; en-dash regex must only match between digits.
- **Conflicts:** None — preserved + B1 lesson reinforced.

### REQ-060 — NO FILLER PHRASES
- **Source:** Old writer §"Style rules"; `humanizer/SKILL.md`
- **Category:** humanizer-voice
- **Rule:** No filler: "navigating the complex world of", "It's important to understand", "Great question", "It's worth mentioning", "In today's world", "At the end of the day", "Needless to say".
- **Enforcement:** STEP 5 (write). STEP 6 (LLM-judge filler scan).
- **Conflicts:** None.

### REQ-061 — NO CORPORATE VERBS
- **Source:** `humanizer/SKILL.md`; CLAUDE.md
- **Category:** humanizer-voice
- **Rule:** No "leverage", "utilize", "facilitate", "synergize", "optimize" (when "improve" works), "operationalize".
- **Enforcement:** STEP 5. STEP 6.
- **Conflicts:** None.

### REQ-062 — NO TRIPLE-STACKS
- **Source:** `humanizer/SKILL.md`; CLAUDE.md
- **Category:** humanizer-voice
- **Rule:** No reflexive "X, Y, and Z" triplets used as filler. Use only when items are genuinely distinct.
- **Enforcement:** STEP 5. STEP 6.
- **Conflicts:** None.

### REQ-063 — NO SIGNIFICANCE INFLATION
- **Source:** `humanizer/SKILL.md`; CLAUDE.md
- **Category:** humanizer-voice
- **Rule:** No "groundbreaking", "revolutionary", "game-changing", "transformative", "unprecedented", "critical" (used as filler intensifier).
- **Enforcement:** STEP 5. STEP 6.
- **Conflicts:** None.

### REQ-064 — NO SMOOTH TRANSITIONS / NO SECTION-OPENER FILLER
- **Source:** `humanizer/SKILL.md`; CLAUDE.md
- **Category:** humanizer-voice
- **Rule:** No "Furthermore", "Moreover", "Additionally" (as paragraph-openers without content), "In conclusion", "To summarize". Sections stand alone — no smooth transitions between detailSections required.
- **Enforcement:** STEP 5. STEP 6.
- **Conflicts:** None.

### REQ-065 — NO EDITORIAL CARRIER FAVORITISM
- **Source:** Old writer §"CRITICAL RULES" rule 4 ("Don't editorialize about specific carriers")
- **Category:** humanizer-voice
- **Rule:** Describe carriers factually. Don't write "Kaiser is the best plan" — write "Kaiser leads market share in California with 4.5-star average." No qualitative ranking; only numeric facts.
- **Enforcement:** STEP 5 (write top carriers + carrier notes). STEP 6 (LLM-judge: scan for value-laden adjectives like "best", "top", "leading" without numeric backing).
- **Conflicts:** None — preserved.

---

## Category 10: MUST — cron-pipeline integration

### REQ-066 — CONSUME TOPIC_CLUSTER FROM PAYLOAD (default "medicare-advantage")
- **Source:** B1 pattern (cron-pipeline integration); `TRACK_C_PARALLEL_PLAN.md` §3 Phase 2
- **Category:** cron-pipeline
- **Rule:** Writer reads `TOPIC_CLUSTER` from bulkgen payload. For MA-state, default is `"medicare-advantage"` (all state spokes share the cluster; the future `/medicare-advantage` hub becomes the lighthouse). If TOPIC_CLUSTER is missing or "unknown", default to `"medicare-advantage"`.
- **Enforcement:** STEP 0 (consume input). STEP 5 (emit `topicCluster` in JSON output — REQ-054).
- **Conflicts:** None.

### REQ-067 — CONSUME FORMULA_RECIPE FROM PAYLOAD (default "ma-state" / FANOUT_FORMULA §4.8)
- **Source:** B1 pattern; `TRACK_C_PARALLEL_PLAN.md` §3 Phase 2
- **Category:** cron-pipeline
- **Rule:** Writer reads `FORMULA_RECIPE` from payload. Default `"ma-state"` (always, since this is the MA-state writer). Recipe directs writer at `FANOUT_FORMULA.md` §4.8. If missing, default to ma-state recipe.
- **Enforcement:** STEP 0 (consume). STEP 3 (apply recipe — REQ-006).
- **Conflicts:** None.

### REQ-068 — CONSUME UNIVERSAL_RULES INSTRUCTION (load `_universal-rules-block.md`)
- **Source:** B1 pattern; shared infrastructure (read-only per Track C plan §2)
- **Category:** cron-pipeline
- **Rule:** Writer reads `UNIVERSAL_RULES` instruction from payload. Instruction directs writer to load `$HOME/clawd/.claude/agents/_universal-rules-block.md` verbatim and apply all 5 rules (REQ-001 through REQ-005). The block is shared infra; do NOT edit it as part of Track C MA-state.
- **Enforcement:** STEP 0 (load file). Phase 3 verifier confirms file unchanged.
- **Conflicts:** None.

### REQ-069 — DO NOT EDIT SHARED INFRASTRUCTURE
- **Source:** `TRACK_C_PARALLEL_PLAN.md` §2 (DO NOT MODIFY list)
- **Category:** cron-pipeline
- **Rule:** Track C MA-state writer rewrite does NOT modify: `_universal-rules-block.md`, `FANOUT_FORMULA.md`, `URL_SLUG_FRAMEWORK.md`, `LINK_TARGET_MANIFEST.md`, `link-index.json`, `scripts/lib/content-quality.js`, `scripts/coveredusa-build-link-index.js`. If a shared rule looks wrong, surface to Jacob as a separate task.
- **Enforcement:** Process rule.
- **Conflicts:** None.

---

## Resolved Conflicts

### Conflict 1: How-to-enroll universality (Old writer optional FAQ vs Universal Rule 3)
- **Rule A (old writer):** "How to enroll" mentioned conversationally in FAQs as a recommended FAQ topic.
- **Rule B (universal RULE 3 + §4.8 recipe):** Every page MUST have dedicated How-to-enroll H2 with all 5 sub-fields (dates, numbered steps, .gov URL, docs needed, denial reasons).
- **Resolution:** Formula wins (REQ-003 + REQ-013). Section is REQUIRED detailSection (or top-level howToEnroll block), not an optional FAQ topic.

### Conflict 2: State-context coverage (Old writer title/H1/meta only vs Universal Rule 1)
- **Rule A (old writer):** STATE_NAME enforced in title, H1, meta, hero, quickAnswer; importantDates.intro and table source captions left state-agnostic.
- **Rule B (universal RULE 1):** STATE_NAME in title, H1, meta, every H2 first sentence, every table caption, every numeric threshold.
- **Resolution:** Formula wins (REQ-001 + REQ-015). Tighten enforcement to importantDates.intro and source captions.

### Conflict 3: $0 premium plans framing (Old writer prose mention vs §4.8 dedicated table)
- **Rule A (old writer):** $0 plans mentioned in carrier notes + one FAQ.
- **Rule B (FANOUT_FORMULA §4.8):** Dedicated "$0 premium plans in [State] 2026" table.
- **Resolution:** Formula wins (REQ-014). Add dedicated detailSection with 4–6-row table.

### Conflict 4: Pronoun discipline (Old writer gold-standard inheritance vs Framework §5.7)
- **Rule A (old writer):** Pattern holds via california.json gold-standard reference; not codified in writer prompt.
- **Rule B (framework + audit fragility flag):** Codify named-entity-first-sentence rule as hard rule in writer prompt + verifier check.
- **Resolution:** Formula wins (REQ-016). Add as STEP 6 PRE-SAVE GATE; codify in Style rules.

### Conflict 5: FAQ answer length (Old writer implicit short vs Framework §4.5 80-150)
- **Rule A (old writer):** No explicit FAQ answer length rule; implicit short via 1,800–2,500 word total.
- **Rule B (framework §4.5):** FAQ answers 80–150 words for conversational pacing.
- **Resolution:** Framework wins (REQ-022). Aim 80–150 per FAQ answer.

### Conflict 6: Word count target (Old writer 1,800–2,500 vs new requirements add mass)
- **Rule A (old writer):** 1,800–2,500 word page; readingTime 9 min.
- **Rule B (new requirements):** howToEnroll detailSection + $0 premium plans table + SNP detailSection + state-context boundary fixes add mass; expect 2,200–2,800 words; readingTime 11–14 min.
- **Resolution:** Framework wins (REQ-034). Don't sacrifice required sections for word-count ceiling.

### Conflict 7: Path portability (Old writer hardcoded `/Users/frankthebot/...` vs B1 lessons learned)
- **Rule A (old writer):** All paths hardcoded `/Users/frankthebot/clawd/...`.
- **Rule B (B1 lessons learned + Track C plan):** Use `$HOME/clawd/...` for path portability across MacBook + Mac mini.
- **Resolution:** B1 wins (REQ-040 + REQ-049). Rewrite all paths to `$HOME/clawd/...`.

### Conflict 8: JSON return shape extension (Old writer minimal vs B1 additive shape)
- **Rule A (old writer):** `{slug, status, word_count, total_plans, top_carrier_count, faq_count, has_county_variance, has_state_extras, detail_section_count}`.
- **Rule B (B1 pattern):** Add `topicCluster`, `keyTerms`, `gapsFlagged`.
- **Resolution:** Additive (REQ-035). Preserve all old fields; add new fields. Bulkgen tolerates larger object.

---

## Flagged for Human Judgment

### Conflict 9: Markdown bold density when renderer doesn't yet honor markdown (REQ-029)
- **Question:** The framework requires 5–10% `**bold**` density in body content. The MA-state JSON template currently renders paragraphs as plain `<p>{text}</p>` — markdown markers will render literally as `**bold**` until Track A1 `@graph` refactor lands a markdown-to-React converter. Should the new MA-state writer:
  - **(a)** Embed `**bold**` markers anyway (markdown text in JSON paragraph fields), warn-only validation, full enforcement when renderer ships? OR
  - **(b)** Skip bold density requirement entirely until renderer is ready, reintroduce in a follow-up Track C revision?
- **Context:** Locked decision in PHASE_5_BRIDGE.md §4.1 chose option (a) — markdown-rich paragraphs — but acknowledges renderer upgrade is part of paragraph-length regen. For Track C, the renderer state is uncertain. If we embed bold markers and the renderer renders them literally, every page ships with visible `**` characters — a clear regression. If we skip, we accept temporary 0% density.
- **Recommendation:** Option (a) — embed `**bold**` markers in paragraph text; warn-only validation; coordinate with Track A1 to ensure renderer ships before pages with bold markers go live. If renderer is NOT ready by Track C activation, fall back to option (b) for this round and revisit. **Confirm with Jacob before Phase 4 starts.**

---

## Notes for the Phase 2 drafter

1. **The 5 universal rules are the spine.** Load `_universal-rules-block.md` verbatim in STEP 0; don't paraphrase. Apply RULE 1 (state-context-everywhere) most aggressively — it's the strongest writer-level lever for MA-state and audit identified two specific boundary leaks (importantDates.intro + source captions) to close.

2. **The §4.8 ma-state recipe layers on top of the existing solid structure.** Old writer is the cleanest in the repo (per audit). Don't rewrite from scratch — preserve the schema interface conformance, atomic-write pattern, gold-standard reference, and STEP structure. ADD: howToEnroll detailSection (REQ-003/013), $0 premium plans table (REQ-014), SNP-specific FAQ (REQ-019), inline .gov anchoring upgrade (REQ-005), state-tagged source captions (REQ-015), pronoun-discipline GATE (REQ-016).

3. **The 4 universal GATES from B1 carry over with applicability notes:**
   - **GATE A** (slug-no-year) — UNIVERSAL, applies always. State slugs are state names; no year ever.
   - **GATE B** (household-size 9 rows) — CONDITIONAL. Applies when D-SNP / dual-eligible content includes a supporting MSP/Medicaid income table (REQ-002). Skip GATE B otherwise; document skip in self-validation.
   - **GATE C** (≥3 inline .gov citations) — UNIVERSAL. medicare.gov + cms.gov + state DOI/state HHS hyperlinked.
   - **GATE D** (zero `--` and zero `—`) — UNIVERSAL. Plus en-dash allowed only between digits.

4. **STEP 6 must be framed as HARD REJECT, not checklist.** B1 lesson: "STOP. Read this twice." language at the TOP of STEP 6 with worked examples. Without that framing, agents read STEP 6 as advisory and ship violations.

5. **Hard contracts cannot change silently.** JSON return shape (REQ-035 — additive only, never rename), atomic write pattern (REQ-036), `## STEP N` headings (REQ-037), schema interface conformance (REQ-041), atomic .tmp.json → validate → rename (REQ-036). All preserved.

6. **Path portability is non-negotiable.** Use `$HOME/clawd/...` everywhere. Old writer's `/Users/frankthebot/...` paths fail on the MacBook host where Track C runs.

7. **Gold standard refresh is part of activation.** california.json should be updated to demonstrate the new pattern (howToEnroll, $0 premium table, state-tagged source captions, importantDates.intro with STATE_NAME) BEFORE Phase 4 test articles are spawned. Otherwise downstream parallel writers inherit the old pattern and Phase 4 fails. This is part of the audit's pre-flight checklist (§trackD_scaleUpReadiness.preFlightChecklist[2]).

8. **5 test states for Phase 4: Florida, New York, Michigan, Ohio, Pennsylvania.** Skip California, Texas, Wyoming (already shipped — those are gold-standard refresh / Track E regen targets, not Track C Phase 4 targets).

9. **Empirical data trumps theoretical framework.** Per PHASE_5_BRIDGE §3, Specification + Equivalent + Canonicalization variants dominate. MA-state is the canonical Specification template (`/medicare-advantage/[state]` IS the variant). Don't waste H2 budget on Generalization or Translation.

10. **Soft rules (Category 8) are guidance.** Use "consider" / "prefer" language in writer prompt for §3.5 / §3.9 / §3.10 / variant-weighting. Reserve "MUST" for hard rules.

---

*This matrix was compiled from 10 source files in Phase 1 (Track C MA-state). It is the contract for Phase 2 (drafting). Phase 3 (verification) checks the new writer against every REQ ID listed here.*
