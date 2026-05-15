# C-Procedure Requirements Matrix

**Phase:** 1 (Inventory) — Track C-prime, procedure-cost writer rewrite
**Date:** 2026-05-14
**Source plan:** `specs/track-c-prime/procedure-prd.md` + `specs/TRACK_C_PARALLEL_PLAN.md`
**Reference template:** `c-ma-state-requirements-matrix.md`, `b1-requirements-matrix.md`
**Purpose:** Master list of every rule the new `coveredusa-procedure-writer.md` must honor. The new writer prompt is the single deliverable shipped against this matrix.

---

**Total requirements:** 71
**Conflicts found:** 7 (resolved: 7; 0 flagged for human)

Category counts:
- 1 — formula-universal (5 rules): 5
- 2 — formula-recipe (§4.1 procedure-cost): 8 dominant shapes + 9 required FAQs
- 3 — audit-flagged gaps (WE-1 through WE-8): 8 writer edits
- 4 — framework-preserved (AI_OPTIMIZATION_FRAMEWORK): 9
- 5 — hard-contract (preserved from existing writer): 10
- 6 — slug-rule: 4
- 7 — link-consumption: 4
- 8 — humanizer-voice: 7
- 9 — cron-pipeline integration: 4
- (subtotal Spanish-parity + ACA-preventive + HCPCS handling: 13 cross-cutting requirements covered inside the categories above)

---

## Category 1: MUST — formula compliance (5 universal rules)

### REQ-001 — STATE-CONTEXT-EVERYWHERE (CONDITIONAL — N/A as hard rule for procedure-cost)

- **Source:** `_universal-rules-block.md` §RULE 1; `FANOUT_FORMULA.md` §4.1 ("State-specificity: optional"); `audit-procedure-writer.json` §rulesMissing.3_2_stateContextEverywhere (recorded as N/A by formula)
- **Category:** formula-universal
- **Rule:** Procedure-cost pages are geographically uniform-ish (federal cost-sharing rules apply nationwide; CMS PFS/OPPS rates are national). The state-context-everywhere rule does NOT apply as a hard requirement. EXCEPTION: state-run screening programs (CDC NBCCEDP, CDC CRCCP, state-specific lung-CT pilots) where applicable — the program reference should include the state name when one specific state is named.
- **Enforcement:** STEP 3 plan structure notes RULE 1 as N/A; STEP 5 enforces state-naming only when a specific state program is cited.
- **Conflicts:** None. Formula explicitly de-prioritizes for procedure-cost.

### REQ-002 — ELIGIBILITY-HOUSEHOLD-SIZE-TABLE (N/A — procedure-cost is not income-gated)

- **Source:** `_universal-rules-block.md` §RULE 2; `FANOUT_FORMULA.md` §4.1; `audit-procedure-writer.json` §rulesMissing.3_3_eligibilityHouseholdSizeTable (N/A)
- **Category:** formula-universal
- **Rule:** Procedure-cost pages are NOT income-gated. The 9-row household-size table rule applies to Medicaid/ACA/FPL pages. EXCEPTION: when discussing FQHC sliding-scale fees or hospital charity-care eligibility, link out to `/medicaid-income-limits` or `/federal-poverty-level` rather than embedding a 9-row table.
- **Enforcement:** STEP 6 GATE B always returns `n/a`. If a writer accidentally embeds a 9-row income table for the primary procedure content, verifier flags MEDIUM (writer over-applied the rule) but does NOT HOLD.
- **Conflicts:** None.

### REQ-003 — HOW-TO-APPLY SECTION (HARD — manifests as the GFE/NSA request process — biggest audit gap)

- **Source:** `_universal-rules-block.md` §RULE 3; `FANOUT_FORMULA.md` §3.4 + §4.1 (dominant shape #2 + #8); `audit-procedure-writer.json` §rulesMissing.3_4_howToApplySection (HIGH impact — single largest miss)
- **Category:** formula-universal
- **Rule:** Every procedure-cost page MUST include the equivalent of RULE 3's "how-to-apply" section, but framed as the **Good Faith Estimate / No Surprises Act request process** (since procedures are not application-gated like Medicaid is). The 5 required sub-fields map as follows:
  1. **Specific timing dates** → GFE timing rule: 3 business days before service if scheduled 10+ business days out; 1 business day before service if scheduled 3–9 business days out; NSA effective date January 1, 2022; PPDR dispute window 120 days from bill date.
  2. **Numbered request steps (5–7 steps)** → embedded in `medicareSection.paragraphs` AND `goodFaithEstimate.numberedSteps` additive field. Steps cover: (i) identify as self-pay, (ii) request written GFE with codes/components, (iii) provide ZIP and add-ons, (iv) confirm timing rule, (v) keep GFE for PPDR dispute.
  3. **Official .gov starting URL** → `cms.gov/nosurprisesact` (or full URL `https://www.cms.gov/nosurprisesact`) cited inline AND in `sources[]`.
  4. **Documents-needed checklist (4–8 items)** → `goodFaithEstimate.documentsToBring[]` additive field AND prose mention in `medicareSection.paragraphs`. Items: photo ID, insurance card if any, prior imaging results, list of current medications, physician referral if required, ZIP code, household income (for FQHC sliding-scale), HSA/FSA card if using.
  5. **Common reasons quotes change (3–5 items)** → `goodFaithEstimate.commonReasonsQuoteChanges[]` additive field AND prose callout. Items: unexpected pathology, longer anesthesia time, additional imaging during encounter, recovery-room time beyond standard, supplies not in original estimate.
- **Enforcement:** STEP 3 plan (slot GFE/NSA content as REQUIRED `medicareSection.paragraphs` 3-of-the-6 paragraphs + additive `goodFaithEstimate` field). STEP 5 (write all 5 sub-fields). STEP 6 GATE E: 6 sub-checks — phrase "Good Faith Estimate" appears ≥3 times, phrase "No Surprises Act" appears ≥2 times, 5-step numbered process present, cms.gov NSA URL present, `goodFaithEstimate` additive field present, 2 dedicated FAQs (GFE request + NSA applicability) present. FAIL → HOLD (audit's #1 fix; never ship without).
- **Conflicts:** Old writer has NO GFE/NSA requirement; none of 3 existing pages mention it. Resolution: formula wins; this is now a HARD REJECT GATE with 6 sub-checks. **Single biggest writer-prompt change.**

### REQ-004 — YEAR-MARKERS-AND-YEAR-ANCHORING (HARD)

- **Source:** `_universal-rules-block.md` §RULE 4; `FANOUT_FORMULA.md` §3.1; `audit-procedure-writer.json` §rulesEnforced.3_1_yearMarkerInjection (PASS — strongest part of old writer)
- **Category:** formula-universal
- **Rule:** Every page MUST include 2026 in: `meta.title` (en + es), `meta.description` (en + es), `hero.h1`, `hero.subhero`, `quickAnswer`, every table caption (siteOfService, variants), every section paragraph that references a numeric value, `pricing.partBDeductibleYear` (numeric 2026), AND inline next to every `$` / `%` in body prose. Never bare `$X` or `Y%` — always year-anchored.
- **Enforcement:** STEP 4 (write — never emit a bare $ or %). STEP 6 (regex scan in field-level validation: every `\$[\d,.]+` token in body prose has a year within the same sentence or table caption; "2026" appears in title, h1, meta description, hero subhero, quickAnswer).
- **Conflicts:** None. Reinforce existing discipline.

### REQ-005 — AUTHORITATIVE-SOURCE-NARROWING (HARD — extend to inline anchoring + 4-source minimum)

- **Source:** `_universal-rules-block.md` §RULE 5; `FANOUT_FORMULA.md` §3.6; `audit-procedure-writer.json` §rulesEnforced.3_6 (PASS at footer level; needs inline upgrade)
- **Category:** formula-universal
- **Rule:** Minimum 4 entries in `sources[]` AND minimum 3 inline outbound .gov / .edu / kff.org / USPSTF citations in body prose. Required domain coverage: CMS.gov (PFS or OPPS or NSA) + healthcare.gov OR medicare.gov + KFF + FAIR Health (or equivalent national price benchmark). For preventive procedures (mammogram, screening colonoscopy, lung-CT, DXA, AAA): also USPSTF.org and CDC.gov (NBCCEDP, CRCCP).
- **Enforcement:** STEP 2 (research — gather ≥4 primary sources). STEP 4 (sources array ≥4). STEP 5 (write — inline anchors in `medicareSection.paragraphs` + `factorsAffectingCost.items` + FAQ answers). STEP 6 GATE C: count outbound .gov/kff URLs ≥3; HOLD if 0–1, WARN if 2.
- **Conflicts:** Old writer requires `sources[]` ≥3 entries (footer-only). New requirement is ≥4 entries + inline anchoring. Resolution: formula tightens; verifier enforces minimum 4.

---

## Category 2: MUST — formula recipe (§4.1 procedure-cost)

### REQ-006 — REQUIRED 8 DOMINANT SHAPES (FANOUT_FORMULA §4.1)

- **Source:** `FANOUT_FORMULA.md` §4.1; `audit-procedure-writer.json` §A.perTemplateRecipeCoverage
- **Category:** formula-recipe
- **Rule:** Every procedure-cost page MUST cover the 8 dominant shapes (Bing-validated: shape #2 only, the highest-leverage gap):
  1. **Cost without insurance + sub-type + year** → `variants` table when applicable (year-anchored caption). Optional for procedures without natural sub-types (x-ray).
  2. **Good Faith Estimate / No Surprises Act compliance** (BING-VALIDATED) → `medicareSection.paragraphs` 2–3 paragraphs + additive `goodFaithEstimate` field + 2 dedicated FAQs (REQ-003 above).
  3. **Cost without insurance + year (canonical)** → `quickAnswer` + `pricing.nationalMedian/Low/High` + lead FAQ.
  4. **Hospital outpatient vs Independent imaging center / ASC** → `siteOfService.rows` (3–4 rows, year-anchored caption).
  5. **Self-pay discount programs / cash-pay rates** → additive `selfPayPrograms` field + ≥2 `factorsAffectingCost.items` covering specific program types + 2 dedicated FAQs.
  6. **Medicare rate benchmark** → `pricing.medicarePfsRate` + `pricing.medicareOppsRate` + `medicareSection.paragraphs` with explicit dollar values.
  7. **Insurance copay/coinsurance estimate** → `medicareSection.paragraphs` covering HDHP deductible, in-network vs OON spread, NSA balance-billing protections, prior auth, copay tier ranges.
  8. **Pre-procedure cost estimate request process** → covered by shape #2 above + FAQ reinforcement.
- **Enforcement:** STEP 3 plan structure maps each shape to a specific schema field. STEP 6 GATE E (shape #2), GATE F (shape #5), GATE H (shape #1 + #4 comparison framing) enforce. Other shapes verified via 26-check field-level validation.
- **Conflicts:** Old writer covered shapes #3, #4, #6, #7 — missing shape #2 (Bing-validated). Resolution: new writer adds shape #2 as GATE E HARD REJECT.

### REQ-007 — REQUIRED FAQ TOPICS (9 mandatory, per WE-5)

- **Source:** `FANOUT_FORMULA.md` §4.1 ("Required FAQ topics" line); `audit-procedure-writer.json` §recommendations.writerEdits.WE-5 (HIGH priority)
- **Category:** formula-recipe
- **Rule:** Every procedure-cost page MUST have these 9 FAQ topics (in this rough order — adjust slightly per procedure):
  1. **How much does a [procedure] cost without insurance?** (canonical lead Q)
  2. **What does Medicare pay for a [procedure]?**
  3. **How do I request a Good Faith Estimate for a [procedure]?**
  4. **What is the No Surprises Act and does it apply to me?**
  5. **How do I get a written cash-pay quote for a [procedure]?**
  6. **Can I negotiate a [procedure] bill after the fact?**
  7. **What's the difference between hospital and imaging-center / ASC [procedure] cost?**
  8. **Is a [procedure] covered by ACA preventive care?** (or "Will my insurance cover [procedure]?" for non-preventive)
  9. **Comparison FAQ to adjacent procedure** (e.g., MRI vs CT, screening vs diagnostic, TTE vs TEE, EGD vs colonoscopy)
- **Enforcement:** STEP 4 checklist requires `faqs.en.length` between 8 and 10. STEP 6 GATE E sub-check #6 requires FAQs #3 and #4. GATE H requires FAQ #9 (comparison).
- **Conflicts:** Old writer suggested some FAQ topics as recommendations, not requirements. Resolution: WE-5 makes these REQUIRED.

### REQ-008 — REQUIRED VOCABULARY (WE-6)

- **Source:** `FANOUT_FORMULA.md` §3.7 (named-program lookup); `audit-procedure-writer.json` §recommendations.writerEdits.WE-6 (MEDIUM)
- **Category:** formula-recipe
- **Rule:** Body content MUST explicitly use each of these 9 canonical terms at least once:
  - Original Medicare
  - Medicare Part B
  - Medicare Advantage
  - Medigap
  - ACA-compliant plan (or "ACA plan" or "marketplace plan")
  - USPSTF (REQUIRED only for procedures with USPSTF preventive coverage: mammogram, screening colonoscopy, low-dose CT lung cancer screening, DXA, AAA; for non-preventive procedures, term is N/A and may be replaced with an explicit "not a USPSTF preventive service" note)
  - No Surprises Act
  - Good Faith Estimate
  - chargemaster
- **Enforcement:** STEP 3 plan (vocabulary discipline note). STEP 5 (write — distribute vocabulary across medicareSection, factorsAffectingCost, FAQs naturally). STEP 6 GATE G: grep for each term; missing 3+ → MEDIUM flag (ship + regen on next pass); missing 1–2 → LOW flag.
- **Conflicts:** None.

---

## Category 3: MUST — audit-flagged gaps (8 writer edits WE-1 through WE-8)

### REQ-009 — WE-1: Required `goodFaithEstimate` additive field (HIGH)

- **Source:** `audit-procedure-writer.json` §recommendations.writerEdits.WE-1 (HIGH, M effort)
- **Category:** audit-flagged
- **Rule:** Emit additive top-level field `goodFaithEstimate` with sub-fields `numberedSteps[5-7]`, `govStartingUrl`, `documentsToBring[]`, `commonReasonsQuoteChanges[]`, `deadline`. Forward-compatible (current page template does NOT render this field but Track E will pick it up). PLUS embed the same content in `medicareSection.paragraphs` 2–4 paragraphs for visible render today.
- **Enforcement:** STEP 4 additive-field checklist + STEP 6 GATE E sub-check #5.
- **Conflicts:** Schema interface doesn't include this field. Resolution: JSON.parse silently ignores extra keys at runtime; documented as Track E forward-compat.

### REQ-010 — WE-2: Required `selfPayPrograms` additive field + visible content (HIGH)

- **Source:** `audit-procedure-writer.json` §recommendations.writerEdits.WE-2 (HIGH, M effort)
- **Category:** audit-flagged
- **Rule:** Emit additive top-level field `selfPayPrograms` with sub-fields `dedicatedSection` (boolean), `programTypes[]`, `typicalDiscountRange`, `howToAsk[]`. PLUS embed ≥2 explicit self-pay items in `factorsAffectingCost.items` covering independent imaging center cash bundles, hospital chargemaster discount asks, sliding-scale FQHC, state screening programs (where applicable). PLUS 2 dedicated FAQs (written cash-pay quote, post-bill negotiation).
- **Enforcement:** STEP 4 additive-field checklist + STEP 6 GATE F (4 sub-checks).
- **Conflicts:** Schema interface doesn't include this field. Resolution: same as WE-1, Track E forward-compat.

### REQ-011 — WE-3: Comparison framing universally enforced (MEDIUM)

- **Source:** `audit-procedure-writer.json` §recommendations.writerEdits.WE-3 (MEDIUM, S effort)
- **Category:** audit-flagged
- **Rule:** Every page MUST have at least one explicit comparison FAQ to an adjacent procedure. Also: siteOfService heading should use "by site of service" phrasing in the body prose (table caption is auto-generated by the template). For procedures with screening-vs-diagnostic distinction (colonoscopy, mammogram), variants table on that axis.
- **Enforcement:** STEP 6 GATE H — comparison FAQ scan via grep `"difference between"|"vs"|"versus"|"compared to"`.
- **Conflicts:** None.

### REQ-012 — WE-4: Separate "Insurance coverage breakdown" content from Medicare section (MEDIUM)

- **Source:** `audit-procedure-writer.json` §recommendations.writerEdits.WE-4 (MEDIUM, M effort)
- **Category:** audit-flagged
- **Rule:** `medicareSection.paragraphs` covers BOTH Original Medicare coverage (paragraphs 1–2) AND a parallel commercial-insurance breakdown (HDHP deductible behavior, in-network vs OON spread, NSA balance-billing, prior auth, copay tiers). The 4–6 paragraph requirement makes room for both topics.
- **Enforcement:** STEP 4 checklist (medicareSection has 4–6 paragraphs). STEP 5 prose structure rule.
- **Conflicts:** None. (Track E may add a dedicated `insuranceCoverage` field for cleaner H2 separation.)

### REQ-013 — WE-5: 4 specific FAQ topics REQUIRED (HIGH)

- **Source:** `audit-procedure-writer.json` §recommendations.writerEdits.WE-5 (HIGH, S effort)
- **Category:** audit-flagged
- **Rule:** Make REQUIRED (not optional): (1) GFE request, (2) NSA applicability, (3) written cash-pay quote, (4) post-bill negotiation. See REQ-007.
- **Enforcement:** STEP 6 GATE E sub-check #6 + GATE F sub-check #3.
- **Conflicts:** None.

### REQ-014 — WE-6: Required-vocabulary checklist (MEDIUM)

- **Source:** `audit-procedure-writer.json` §recommendations.writerEdits.WE-6 (MEDIUM, S effort)
- **Category:** audit-flagged
- **Rule:** See REQ-008.
- **Enforcement:** STEP 6 GATE G grep.

### REQ-015 — WE-7: Table caption "by [dimension]" phrasing (LOW)

- **Source:** `audit-procedure-writer.json` §recommendations.writerEdits.WE-7 (LOW, S effort)
- **Category:** audit-flagged
- **Rule:** Body prose intro paragraphs before tables should use "by [dimension]" phrasing where applicable (e.g., "Knee MRI cost by site of service in 2026"). The page template auto-generates "[Procedure] cost by site of service ([year]) Medicare rates" — so the writer's job is to surface the phrasing in `variants.heading` and in section intros.
- **Enforcement:** STEP 5 prose-style guidance.
- **Conflicts:** None.

### REQ-016 — WE-8: HCPCS enforcement + intentionally-empty note (LOW)

- **Source:** `audit-procedure-writer.json` §recommendations.writerEdits.WE-8 (LOW, S effort)
- **Category:** audit-flagged
- **Rule:** Prefer to fill `hcpcsCodes` whenever a Level II G/J/Q code applies (G0105/G0121 for screening colonoscopy; G0202 for screening mammography; G0297 for low-dose CT lung cancer screening). For CPT-only procedures (MRI, CT, echocardiogram, upper endoscopy), leave `hcpcsCodes` empty AND note "CPT-only, intentionally empty" in the STEP 8 return JSON's `gapsFlagged` field.
- **Enforcement:** STEP 2 research (look up HCPCS Level II if applicable). STEP 4 checklist. STEP 8 return JSON note.
- **Conflicts:** None.

---

## Category 4: MUST — framework-preserved (AI_OPTIMIZATION_FRAMEWORK)

### REQ-017 through REQ-025 — preserved from `AI_OPTIMIZATION_FRAMEWORK.md`

- Year-marker discipline (§4.2 + §8.4) — preserved via REQ-004
- Pronoun discipline §5.7 — every paragraph opens with a named entity, never "It"/"They"/"This"/"These"/"Here"/"There"/"Such" — enforced in STEP 5 style rules
- Schema-org MedicalProcedure controlled vocabulary — `procedureType` ∈ {"Diagnostic", "Surgical", "Therapeutic", "Palliative"}
- Speakable schema markup — `data-speakable` on H1 and quick answer (template handles)
- DatasetSchema markup — template handles from siteOfService data
- FAQPage markup — template handles from `faqs[]`
- BreadcrumbList markup — template handles
- MedicalWebPage markup — template handles from `meta` + `medicalSpecialty`
- LocalizedString discipline — every human-readable text field has `{en, es}` (Spanish parity)

---

## Category 5: MUST — hard-contract (preserved from existing writer)

### REQ-026 through REQ-035 — preserved hard contracts

- JSON return shape from STEP 8 must be `{slug, status, word_count, ...}` parseable by cron
- Atomic write pattern: `<slug>.tmp.json` → validate → rename to `<slug>.json`
- `## STEP N` numbered headings (cron may parse for logging)
- Schema interface conformance — extra fields are silently ignored at runtime, but missing required fields crash the build
- FAQ question/answer are FLAT STRINGS, not LocalizedString objects (preserved from prior writer)
- Spanish parity — every LocalizedString needs both `en` AND `es`
- No em-dash `—` (U+2014), no en-dash `–`, no double-hyphen `--` anywhere
- No CPT codes in `hcpcsCodes` array (AMA license)
- 2026 anchor facts strictly enforced (Part B deductible $283, etc.)
- Atomic-write rename only after all GATES pass + JSON valid

---

## Category 6: MUST — slug-rule (4 rules)

### REQ-036 — Slug must NOT contain a year (GATE A)
### REQ-037 — Slug is the procedure name only, no "cost"/"price"/"without-insurance" suffix
### REQ-038 — Slug is lowercase + hyphens, no underscores or spaces
### REQ-039 — Sub-procedure slugs use `<part>-<procedure>` pattern (e.g., `knee-mri`, `chest-x-ray`)

- **Source:** Slug framework + GATE A from MA-state writer
- **Enforcement:** STEP 6 GATE A regex `\b(19|20)\d{2}\b` against slug.

---

## Category 7: MUST — link-consumption (4 rules)

### REQ-040 — Read `link-index.json` and proactively include 3–5 `relatedLinks`
### REQ-041 — Self-link guard: never link this page to itself
### REQ-042 — `relatedLinks[].href` must start with `/` and point to a real page
### REQ-043 — Always link to `/no-surprises-act` (lighthouse) and either `/medical-bill-analyzer` or `/screener` (CTA-adjacent)

- **Source:** `LINK_TARGET_MANIFEST.md`; `_universal-rules-block.md` linking conventions
- **Enforcement:** STEP 4 checklist on `relatedLinks` (2–4 entries).

---

## Category 8: MUST — humanizer-voice (7 rules)

### REQ-044 through REQ-050 — preserved from humanizer skill

- No em-dashes
- No filler ("navigating", "explore the options", "It's important to note")
- No triple-stacks
- No corporate verbs ("leverage", "utilize", "facilitate" — use "use", "do", "help")
- No smooth transitions ("Furthermore", "Moreover", "In addition")
- No significance inflation ("This important section", "Critically important")
- Lead with concrete numbers, year-anchored, source-attributed

---

## Category 9: MUST — cron-pipeline integration (4 rules)

### REQ-051 — STEP 8 return JSON shape preserved: `{slug, status, word_count, ...}`
### REQ-052 — Additive fields in STEP 8: `topicCluster`, `keyTerms`, `isLighthouse`, `isDeprecated`, `goodFaithEstimate`, `selfPayPrograms`, `gapsFlagged`
### REQ-053 — `status` ∈ {`success`, `error`, `rejected`} — `rejected` includes `gates_failed[]` array
### REQ-054 — Atomic write before STEP 8 return (no half-written files)

- **Source:** Track C-prime master brief; cron stage 2 commit logic
- **Enforcement:** STEP 8 instructions explicit.

---

## Cross-cutting requirements (covered inside above categories)

### Spanish parity (10 sub-requirements)
- Every `LocalizedString` has `en` AND `es`
- FAQ `question`/`answer` are flat strings (NOT LocalizedString) but `faqs.es` has parallel Spanish content
- Idiomatic procedure-name translations ("Resonancia Magnética", "Ecocardiograma", "Mamografía", "Endoscopia Superior", "Radiografía", "Tomografía Computarizada")
- Idiomatic NSA terminology ("Ley de No Sorpresas" / "Ley contra Facturas Sorpresa", "Estimación de Buena Fe")
- Idiomatic Medicare program names ("Medicare Original", "Medicare Parte B", "Medigap" as-is, "Medicare Advantage" as-is)
- Localized USPSTF reference ("Grupo de Trabajo de Servicios Preventivos de EE.UU.")
- Localized state/regional anchors where Spanish-speakers commonly use them
- Numeric format same in both languages (`$283`, `$202.90`)
- `meta.title.es` ≤ 70 chars (Spanish often runs longer; trim aggressively)
- `meta.description.es` ≤ 160 chars

### ACA preventive coverage handling (3 conditional requirements)
- For USPSTF Grade A/B procedures (mammogram, screening colonoscopy, lung-CT, DXA, AAA): GATE G's USPSTF term IS required + the page explicitly says "covered at 100% on ACA-compliant plans"
- For non-preventive procedures (knee MRI, echocardiogram for symptoms, diagnostic colonoscopy, upper endoscopy, x-ray, CT for symptoms): GATE G's USPSTF term IS N/A; writer notes "not a USPSTF preventive service" once
- USPSTF grading accuracy: screening mammography Grade B (2024 update for women 40–74, NOT 50–74); screening colonoscopy Grade A (45–75) and Grade B (76–85); low-dose CT Grade B; DXA Grade B (women 65+); AAA Grade B (men 65–75 smoker history)

---

**Phase 1 deliverable complete.** The Phase 2 drafter (which IS the new `coveredusa-procedure-writer.md` prompt) consumes this matrix at writer-load time and applies every rule with REJECT framing at STEP 6.

**Phase 3 (verifier-side critique) skipped** — relying instead on empirical Phase 4 verification across 5 test articles (x-ray, knee-mri, echocardiogram, mammogram, upper-endoscopy). Verifier prompt also rewritten in parallel (Track C-prime Phase 4.5).

**Phase 4 expected outcome:** 5/5 articles pass strict-mode validators + 4/5 score ≥80% on the rubric, with GFE/NSA content verified present on every test article (audit's #1 fix). Per-article verifier reports written to `c-procedure-verifier-{slug}.md` files in this same directory.
