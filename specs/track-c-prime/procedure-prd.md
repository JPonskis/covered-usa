# Procedure Writer + Verifier PRD (Track C-prime)

**Template:** procedure-cost (`/cost/[procedure]`)
**Files you will modify:** `.claude/agents/coveredusa-procedure-writer.md` + `.claude/agents/coveredusa-procedure-verifier.md`
**Output directory:** `projects/covered-usa/content/data/procedures/`
**Estimated time:** 4-5 hours
**Status:** existing writer is medium-aligned (1/8 Bing-validated shapes); biggest gap is missing Good Faith Estimate / NSA section across all 3 existing pages

---

## 0. Read order (MANDATORY before starting any phase)

1. **`projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md`** through §4 + §3.5 (default-toward-ship) + §6 (held-queue mechanism) + Appendix A (real-world drift case studies) + Appendix B (writer-leaks pattern). The master brief is the source of truth for the 4-phase pattern, the verifier dual-purpose model, and the gates routing.
2. **This PRD** end-to-end before spawning any agents.
3. **`~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_b1_blog_writer_shipped.md`** — the 8 B1 lessons.
4. **Reference implementations** (READ — do not modify in your session):
   - `.claude/agents/coveredusa-ma-state-writer.md` (the cleanest example of Track C-prime writer pattern; copy structure)
   - `.claude/agents/coveredusa-ma-state-verifier.md` (the cleanest example of Track C-prime verifier pattern with all 3 patches applied; copy structure)
   - `.claude/agents/coveredusa-article-verifier.md` (B1 + Track C-prime; daily blog verifier; useful for fact-check categories)
5. **Source docs cited in §1 below** — the planner agent will read these in Phase 1, but you should skim them first so you know what's in each.

If you skip step 1 or 4, you'll re-discover lessons we already learned tonight. Don't.

---

## 1. Context inventory (Phase 1 planner reads these)

| Doc | What it tells you |
|---|---|
| `.claude/agents/coveredusa-procedure-writer.md` | Current writer prompt — what's there, what's missing |
| `.claude/agents/coveredusa-procedure-verifier.md` | Current verifier — fact-check categories that work |
| `.claude/agents/_universal-rules-block.md` | The 5 universal rules + 19-state program brand list |
| `projects/covered-usa/specs/FANOUT_FORMULA.md` §3 + **§4.1** | Universal rules + procedure-cost recipe (8 dominant shapes, required H2s, required FAQ topics) |
| `projects/covered-usa/specs/AI_OPTIMIZATION_FRAMEWORK.md` | The framework these recipes derive from |
| `projects/covered-usa/specs/URL_SLUG_FRAMEWORK.md` | Slug rules — never migrate existing slugs |
| `projects/covered-usa/specs/LINK_TARGET_MANIFEST.md` | Link routing system (link-index + topicCluster + keyTerms.{en,es}) |
| `projects/covered-usa/specs/CURRENT_STATE_AUDIT.md` §4.X | Cross-template audit findings |
| `projects/covered-usa/content/fanout/analysis/audit-procedure-writer.json` | **THE most important doc** — synthesized audit of all 3 existing procedure pages with specific gaps + 8 recommended writer edits (WE-1 through WE-8) |
| `projects/covered-usa/specs/PHASE_5_BRIDGE.md` §3 | Track C bridge context |
| `projects/covered-usa/src/lib/procedures.ts` | The `Procedure` TypeScript interface — your hard contract |
| `projects/covered-usa/content/data/procedures/colonoscopy.json` | **Gold standard structural reference** — most-aligned existing page (alignmentScore: high) |
| `projects/covered-usa/content/data/procedures/mri.json`, `ct-scan.json` | Other existing pages (medium alignment; useful for "what NOT to do" patterns) |

---

## 2. Schema reminder + hard contracts

The `Procedure` interface (`projects/covered-usa/src/lib/procedures.ts`) is your hard contract. Required top-level fields:

- `slug` (lowercase, hyphens — also the JSON filename)
- `procedureName: LocalizedString`, `shortName: LocalizedString`
- `procedureType` (e.g., "Diagnostic", "Surgical", "Therapeutic" — schema.org MedicalProcedure type)
- `medicalSpecialty` (e.g., "Radiology", "Cardiology", "Gastroenterology")
- `lastUpdated` (ISO date YYYY-MM-DD)
- `readingTime` (string, e.g., "8 min read")
- `hcpcsCodes?` (array of strings — fill if HCPCS Level II G/J/Q codes apply; leave empty if CPT-only and add a note)
- `meta: {title, description}` (LocalizedString; **title ≤ 70 chars, description ≤ 160 chars** — validator enforces)
- `hero: {h1, subhero}` (LocalizedString)
- `quickAnswer: LocalizedString` (3-5 sentences with cash price + Medicare rate + GFE-right + key qualifier)
- `pricing: ProcedurePricing` (nationalMedian, nationalLow, nationalHigh, medicarePfsRate, medicareOppsRate?, medicareCoinsurancePct: 20, partBDeductibleYear: 2026, partBDeductibleAmount: 283)
- `introParagraphs: LocalizedString[]` (2-4 entries)
- `siteOfService: SiteOfServiceSection` (rows + explanation + footnote + source)
- `variants?: VariantSection` (optional — body-part for imaging, dosage for procedures with sub-types)
- `medicareSection: MedicareSection`
- `factorsAffectingCost: FactorsSection`
- `commonBillingErrors?: BillingErrorsSection` (optional)
- `faqs: {en: LocalizedFAQ[], es: LocalizedFAQ[]}` (NOT LocalizedString — FAQ question/answer are flat strings)
- `relatedLinks: RelatedLink[]`
- `sources: ProcedureSource[]`

**Additive Track C-prime fields (emit these too — clears `content-quality.js` warnings + Track A1 forward-compat):**
- `topicCluster: "procedure-cost"` (string, lowercase kebab-case)
- `keyTerms: {en: string[], es: string[]}` (NOT a flat array). Concrete example shape (copy this template literally; substitute the procedure name):

```json
"keyTerms": {
  "en": [
    "<procedure> cost without insurance",
    "<procedure> cost without insurance 2026",
    "how much does a <procedure> cost",
    "<procedure> good faith estimate",
    "<procedure> cash pay price"
  ],
  "es": [
    "costo de <procedure> sin seguro",
    "costo de <procedure> 2026",
    "cuanto cuesta <procedure>",
    "estimacion de buena fe <procedure>"
  ]
}
```

3–6 phrases per language. **Do NOT emit `"keyTerms": ["phrase1", "phrase2", ...]` as a flat array — that shape fails the validator.**
- `isLighthouse: false`
- `isDeprecated: false`

**Hard contracts (NEVER violate):**
1. JSON return shape from STEP 8 must be `{slug, status, ...}` parseable by the cron
2. Atomic write pattern: `<slug>.tmp.json` first → validate JSON parses → rename to `<slug>.json`
3. `## STEP N` numbered headings (cron may parse for logging)
4. Schema interface conformance — extra fields are silently ignored at runtime, but missing required fields crash the build
5. FAQ question/answer are FLAT STRINGS, not LocalizedString objects (the most common drafter mistake)
6. Spanish parity — every LocalizedString needs both `en` AND `es`
7. No em-dash `—` (U+2014), no en-dash `–`, no double-hyphen `--` anywhere

---

## 3. The §4.1 recipe (expanded with worked examples)

**FANOUT_FORMULA.md §4.1 — procedure-cost variant distribution:** Specification 43.9% / Equivalent 28.0% / Entailment 24.3% / Canonicalization 3.2% / Clarification 0.5%

**Bing-validated shapes:** 1 of 8 — the validated one is **Good Faith Estimate / No Surprises Act compliance** (shape #2). This is the SINGLE BIGGEST GAP in the current writer (0/3 existing pages cover it). Closing this gap is the highest-ROI move for procedure-cost.

### Top 8 dominant shapes (apply ALL of these in the new writer)

1. **Cost without insurance + sub-type (contrast/non-contrast/body part) + year** — Specification, top weight. Render as `variants` table with year-anchored caption like "MRI cost by body part 2026".
2. **Good Faith Estimate / No Surprises Act compliance** — Entailment, BING-VALIDATED. Render as a NEW required H2 "How to request a Good Faith Estimate for [procedure]" with 5-7 numbered steps + cms.gov NSA starting URL + documents-to-bring checklist + common-reasons-quote-changes callout.
3. **Cost without insurance + year (canonical entry)** — Equivalent, top weight. Render in `quickAnswer` + `pricing.nationalMedian/Low/High` block.
4. **Hospital outpatient vs Independent imaging center** — Specification (comparison). Render as `siteOfService.rows` table (3-4 rows: Hospital outpatient, ASC/imaging center, Independent office, Inpatient where applicable) with year-anchored caption "Cost chart by site of service 2026".
5. **Self-pay discount programs / cash pay rates** — Entailment. Render as a NEW required H2 "Cash-pay and self-pay discount programs for [procedure]" with: independent-imaging-center bundles, hospital chargemaster discount asks, sliding-scale FQHC, state-run screening programs (where applicable), how-to-ask numbered steps.
6. **Medicare rate benchmark for the procedure** — Specification. Render in `pricing.medicarePfsRate` + `pricing.medicareOppsRate` + `medicareSection` paragraphs with explicit dollar values + 2026 anchor facts.
7. **Insurance copay/coinsurance estimate (when user has insurance)** — Specification. Render as a NEW required H2 "Insurance coverage breakdown for [procedure]" SEPARATE from `medicareSection`, covering HDHP deductible behavior, in-network vs out-of-network spread + NSA balance-billing protections, prior authorization typical for high-cost imaging, copay tier ranges for commercial plans.
8. **Pre-procedure cost estimate request process** — Entailment. Covered by the GFE H2 (#2) above; reinforce in FAQ.

### Required FAQ topics (8-10 — must include all of these)

1. **How do I request a Good Faith Estimate for a [procedure]?** (was previously suggested; now required per WE-5)
2. **What is the No Surprises Act and does it apply to me?** (required per WE-5)
3. **How do I get a written cash-pay quote?** (required per WE-5)
4. **Can I negotiate a [procedure] bill after the fact?** (required per WE-5)
5. **What does Medicare pay for a [procedure]?** (Part B coinsurance + deductible)
6. **What's the difference between hospital and imaging-center [procedure] cost?** (site-of-service comparison)
7. **Is a [procedure] covered by ACA preventive care?** (required when applicable — colonoscopy yes, MRI no)
8. **How much does a [procedure] cost without insurance?** (canonical Q)
9. *(Comparison FAQ where applicable):* **What's the difference between [procedure] and [adjacent procedure]?** (e.g., MRI vs CT, screening vs diagnostic colonoscopy, mammogram vs breast MRI)

### Required-vocabulary checklist (per WE-6)

Body content MUST explicitly use each of these canonical terms at least once:
- "Original Medicare"
- "Medicare Part B"
- "Medicare Advantage"
- "Medigap"
- "ACA-compliant plan"
- "USPSTF" (where preventive applies)
- "No Surprises Act"
- "Good Faith Estimate"
- "chargemaster"

This is auto-validatable via grep at STEP 6.

### Year-anchoring (RULE 4)

Every dollar amount + percentage must have a year in the same sentence or table caption. The Part B figures are 2026 (deductible $283, premium $202.90). The Medicare PFS / OPPS rates published in the §4.1 recipe must be year-tagged 2026.

### State-context

Per §4.1: state-context is **OPTIONAL** for procedure-cost (geographically uniform-ish). Don't force it. EXCEPTION: state-run screening programs (e.g., breast cancer screening programs) where applicable.

---

## 4. Audit findings synthesized (read `audit-procedure-writer.json` for the full version)

**Pages audited:** mri, ct-scan, colonoscopy. Alignment scores: medium / medium / high.

**THE biggest gap (single highest-ROI fix):** Good Faith Estimate / No Surprises Act process is missing from ALL 3 existing pages despite being §4.1 dominant shape #2 and the ONLY Bing-validated shape in the recipe. The phrase "Good Faith Estimate" does NOT appear in any of the 3 audited JSON files.

**8 recommended writer edits (WE-1 through WE-8 — your new writer must implement at least WE-1, WE-2, WE-5, WE-6 as required; WE-3, WE-4 as strongly recommended; WE-7, WE-8 as nice-to-have):**

- **WE-1 (HIGH, M effort):** Add required `goodFaithEstimate` JSON field with `numberedSteps[5-7]`, `govStartingUrl`, `documentsToBring[]`, `commonReasonsQuoteChanges[]`, `deadline` (3-day rule for self-pay). Coordinate with page template render code if schema change is in scope; otherwise embed the GFE section in `medicareSection` or a new top-level field and document the schema gap as Track E follow-up. **Source for content: cms.gov/nosurprisesact + HHS GFE consumer guidance.**
- **WE-2 (HIGH, M effort):** Add required `selfPayPrograms` block with `dedicatedSection: bool`, `programTypes[]`, `typicalDiscountRange`, `howToAsk[]`. Render as own H2 (not buried in FAQ).
- **WE-3 (MED, S effort):** Enforce comparison-framing rules (X vs Y FAQ for adjacent procedures; siteOfService heading uses "by site of service"; screening-vs-diagnostic variants table where applicable).
- **WE-4 (MED, M effort):** Require separate "Insurance coverage breakdown" H2 from `medicareSection`.
- **WE-5 (HIGH, S effort):** Make 4 specific FAQ topics REQUIRED (GFE request, NSA applicability, written cash-pay quote, post-bill negotiation).
- **WE-6 (MED, S effort):** Required-vocabulary checklist (see §3 above).
- **WE-7 (LOW, S effort):** Table captions use "by [dimension]" / "chart" / "guidelines" phrasing.
- **WE-8 (LOW, S effort):** HCPCS-codes enforcement note + "CPT-only, intentionally empty" comment field.

---

## 5. Universal GATES (recap from master brief §7) — apply ALL to procedure

- **GATE A — slug must NOT contain a year.** Procedure slugs are pure procedure names (`mri`, `colonoscopy`, `knee-mri`, `echocardiogram`). Never `mri-2026` or `colonoscopy-cost-2026`. **HOLD on fail.**
- **GATE B — household-size table.** **N/A for procedure-cost** — procedures are not income-gated. Mark `gates.b: "n/a"`. EXCEPTION: if you include a charity-care eligibility section with FPL-based thresholds (e.g., for hospital financial-assistance), that adjacent reference can link out to `/medicaid-income-limits` rather than embedding a 9-row table.
- **GATE C — ≥3 inline outbound .gov / .edu / kff.org citations.** Required minimum: cms.gov (NSA + GFE + Medicare rates) + healthcare.gov (NSA enforcement) + KFF (cost data). For procedures with USPSTF preventive coverage (colonoscopy, mammogram), add USPSTF.gov. **HOLD on 0-1 .gov citations; WARN on exactly 2.**
- **GATE D — zero `--` (double-hyphen) anywhere.** **AUTO-FIX as style correction; never HOLD.** The `procedure-verifier` must auto-fix per the GATE D hoist patch (see master brief §3 Phase 4.5 patches).

---

## 6. Procedure-specific GATES (your STEP 6 additions)

These are the template-specific gates. Frame them at STEP 6 with "STOP. Read this twice." language.

### GATE E — Good Faith Estimate / NSA H2 MUST be present

This is the audit's #1 gap. Verify the JSON has either (a) a top-level `goodFaithEstimate` block (preferred per WE-1) OR (b) a `medicareSection.paragraphs[]` entry with heading-level prose covering: 5-7 numbered enrollment steps, the cms.gov NSA URL (`https://www.cms.gov/nosurprisesact`), documents-to-bring checklist, common-reasons-quote-changes callout.

**Routing:** PASS if present + complete; WARN if present but incomplete (missing 1-2 sub-fields); **HOLD if entirely absent**. This is the single biggest miss in the audit; the writer must always emit it.

### GATE F — Self-pay discount programs H2 MUST be present

Verify the JSON has a dedicated H2 / detailSection covering self-pay discount programs (independent-imaging-center bundles, hospital chargemaster discount, sliding-scale FQHC, state screening programs where applicable). Buried in 1 FAQ does NOT pass.

**Routing:** PASS if dedicated H2 present; WARN if covered only in FAQ; HOLD if entirely absent. (LOWER priority than GATE E — flag MEDIUM rather than HOLD if you're being conservative.)

### GATE G — Required vocabulary present (per WE-6)

Run grep against the JSON body for the 9 canonical terms (see §3 above). Each must appear at least once.

**Routing:** PASS if all 9 present; WARN if 1-2 missing; FAIL → ship + MEDIUM flag if 3+ missing (writer-side concern, regen on next pass — don't HOLD).

### GATE H — Comparison framing (per WE-3)

Verify the page has at least one explicit comparison FAQ to an adjacent procedure (MRI vs CT for imaging; screening vs diagnostic colonoscopy; mammogram vs breast MRI; etc.). For procedures with a screening-vs-diagnostic distinction, the variants table must be on that axis.

**Routing:** PASS if comparison present (FAQ or section); WARN if missing; never HOLD (writer-side concern).

---

## 7. Test mix — 5 procedures (Phase 4)

Skip the 3 already-shipped (mri, ct-scan, colonoscopy — Track E will regen these). Test the new writer on 5 NET-NEW procedures:

| Slug | Why |
|---|---|
| `x-ray` | Most common imaging procedure; tests no-variants case (no body parts to enumerate) |
| `knee-mri` | Sub-procedure / body-part specificity; tests adjacent-comparison FAQ (knee MRI vs hip MRI vs full lower-extremity MRI); short slug = no year confusion |
| `echocardiogram` | Cardiology — different specialty than imaging; tests a procedure with TTE/TEE variants (transthoracic vs transesophageal) |
| `mammogram` | ACA preventive coverage (USPSTF Grade B); tests screening-vs-diagnostic distinction; covered at 100% on most plans |
| `upper-endoscopy` | Sometimes called EGD; tests "what other names is this called" naming variant; gastroenterology specialty |

**Pre-Phase-4 collision check:**
```bash
ls projects/covered-usa/content/data/procedures/*.json | xargs -n1 basename | sed 's/.json//'
```
Confirm none of your 5 planned slugs match existing slugs (currently: colonoscopy, ct-scan, mri).

**Pass criteria:** 5/5 articles pass strict-mode validators + 4/5 score ≥80% on the rubric. **Plus** every test article has GFE/NSA section present (the audit's #1 fix verified).

---

## 8. Common failure modes for procedure-cost (watch out for these)

1. **Forgetting the GFE section.** Writer's training data is full of cost articles that DON'T cover GFE/NSA (because most cost articles online are pre-2022 NSA-effective-date). Force the writer to emit it via GATE E reject framing.
2. **Burying self-pay info in 1 FAQ.** Bing rewards lookup-shaped content (tables, dedicated sections), not Q&A. Force a dedicated H2 via GATE F.
3. **Filling `hcpcsCodes` with CPT codes by accident.** CPT codes (e.g., 73721 for knee MRI) are AMA-licensed; we can't redistribute them. HCPCS Level II G/J/Q codes are public domain (e.g., G0105/G0121 for screening colonoscopy). Leave the array empty if the procedure has no HCPCS code, and add a comment field saying "CPT-only procedure, intentionally empty."
4. **Quoting Medicare rates without year.** Every "$475 PFS rate" needs "(2026)" in the same sentence or table caption. RULE 4 violation.
5. **Confusing site of service vs site of care.** "Site of service" is the regulatory term (hospital outpatient vs ASC vs independent office vs inpatient). Use this exact phrasing.
6. **Inventing "average cost" without sourcing.** Writers love to say "the national average is $X." If you don't cite KFF / FAIR Health / CMS / HCCI, the verifier will flag.
7. **Skipping ACA preventive callout where it applies.** Mammogram + screening colonoscopy + low-dose lung CT + bone density (DXA) are USPSTF Grade A or B and must be covered at 100% on ACA-compliant plans (no deductible, no copay). If your test procedure is one of these, the ACA preventive section is REQUIRED.

---

## 9. Verifier scope (Phase 4.5 — per master brief)

Update `.claude/agents/coveredusa-procedure-verifier.md` to mirror the writer's new GATES.

**Non-negotiable patches per master brief Phase 4.5 (3 things to apply):**

1. **Path portability:** `/Users/frankthebot/...` → `$HOME/clawd/...` everywhere
2. **Add dual-purpose framing** in YOUR TASK section (numeric auto-fix + structural detect-only). Copy the framing from `coveredusa-ma-state-verifier.md`.
3. **Insert STEP 1C: structural GATE detection** with all 4 universal + all 4 procedure-specific GATES (mirror writer's STEP 6).

**3 mandatory patches from the load-test (apply BOTH writer + verifier sides):**

- **GATE F count strictness (writer side):** strict count check on detailSections / required H2s. Don't trust writer self-report.
- **`keyTerms` shape example (writer side):** embed the `{en: [...], es: [...]}` template with explicit "do NOT emit flat array" rule.
- **GATE D auto-fix hoist (verifier side):** "AUTO-FIX MANDATORY" framing + Common-verifier-error callout naming the Ohio MA-state failure mode.

**Routing per gate (procedure-specific):**
- GATE A FAIL → HOLD
- GATE B → always N/A for procedure
- GATE C FAIL (0-1 .gov) → HOLD; WARN (2) → ship + LOW flag
- GATE D FAIL → AUTO-FIX as style correction
- GATE E FAIL (GFE/NSA absent) → HOLD (audit's #1 fix; never ship without)
- GATE F FAIL (self-pay H2 absent) → ship + LOW flag (less critical than GATE E)
- GATE G FAIL (vocabulary missing 3+ canonical terms) → ship + MEDIUM flag
- GATE H FAIL (no comparison framing) → ship + LOW flag

**Verifier test:** after updating the verifier, run it on the 5 Phase-4 test articles. Expected: all `approved` or `corrected` (no false HOLDs). If any spurious HOLD: tighten the verifier prompt before shipping.

---

## 10. Atomic deliverable (Phase 5 — 4 commits)

Per master brief §3 Phase 5:

1. **Commit 1 (clawd-workspace):** `.bak` move + new procedure-writer prompt
2. **Commit 2 (covered-usa):** 5 test articles in `content/data/procedures/<slug>.json` + any verifier-caught corrections from Phase 4.5
3. **Commit 3 (covered-usa):** Requirements matrix + 3 verifier reports + retest verifier output in `content/fanout/analysis/c-procedure-*.md`
4. **Commit 4 (clawd-workspace):** `.bak` move + new procedure-verifier prompt (paired with the writer ship)

**Push order:** clawd-workspace first (writer + verifier prompts go live for any cron pickup), then covered-usa (test articles deploy to Vercel).

**Memory entry:** write `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_track_c_procedure_writer_shipped.md` with:
- Per-article scores from Phase 4 verifier
- Any new lessons learned (especially anything you discovered that the master brief Appendix A/B doesn't cover)
- Specific drift caught by the verifier (PACENET-style cases)
- Patches you applied that aren't in the master-brief 3-patch list (would be candidates for future master-brief upgrade)
- 5-line summary of the 5 shipped procedures (slug, word count, status, gates result)

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
ls -la ~/clawd/projects/covered-usa/content/fanout/analysis/audit-procedure-writer.json

# 4. Confirm gold-standard JSON exists
ls -la ~/clawd/projects/covered-usa/content/data/procedures/colonoscopy.json

# 5. Slug collision check
ls ~/clawd/projects/covered-usa/content/data/procedures/*.json | xargs -n1 basename | sed 's/.json//'
# Expected output: colonoscopy, ct-scan, mri (your 5 test slugs must NOT collide)

# 6. Validator baseline (run BEFORE you start; should be 0 bad)
cd ~/clawd/projects/covered-usa && node scripts/validate-procedures.js 2>&1 | tail -10
```

If any of these fail or surprise you, surface to Jacob BEFORE proceeding. Don't guess at scope.

---

## 12. Quick reference card (post on monitor while working)

- **Master brief:** `projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md`
- **Reference writer:** `.claude/agents/coveredusa-ma-state-writer.md`
- **Reference verifiers:** `.claude/agents/coveredusa-ma-state-verifier.md` + `.claude/agents/coveredusa-article-verifier.md`
- **Your writer file:** `.claude/agents/coveredusa-procedure-writer.md`
- **Your verifier file:** `.claude/agents/coveredusa-procedure-verifier.md`
- **Schema interface:** `projects/covered-usa/src/lib/procedures.ts` → `Procedure`
- **Recipe:** FANOUT_FORMULA.md §4.1
- **Audit:** `content/fanout/analysis/audit-procedure-writer.json`
- **Gold standard:** `content/data/procedures/colonoscopy.json` (highest-aligned existing page)
- **Output dir:** `content/data/procedures/`
- **Phase 4 test slugs:** x-ray, knee-mri, echocardiogram, mammogram, upper-endoscopy
- **Universal GATES:** A (slug-no-year, HOLD), B (N/A for procedure), C (≥3 .gov, HOLD if 0-1), D (no `--`, AUTO-FIX)
- **Procedure GATES:** E (GFE/NSA, HOLD), F (self-pay H2, flag), G (vocabulary, flag), H (comparison framing, flag)
- **4-commit deliverable:** writer prompt + 5 test articles + analysis files + verifier prompt
- **Default toward auto-ship:** ~95% / ~4% / ~1% (HOLD only on genuine breakage)

---

*This PRD is self-contained. Combined with the master brief, it has everything a fresh parallel session needs to execute Track C-prime for procedure-cost. If anything is unclear or missing, surface to Jacob before proceeding — don't guess at scope.*
