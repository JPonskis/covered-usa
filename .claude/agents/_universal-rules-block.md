# Universal Writer-Agent Rules — CoveredUSA

**Source:** `projects/covered-usa/specs/FANOUT_FORMULA.md` §3
**Status:** v1.0 — derived from Track AA Phase 1 (281 LLM probes + BenefitsUSA real-Bing cross-check, 2026-05-14)

This block is included by reference in every CoveredUSA writer agent. The 5 universal rules below are missing from current writer prompts and apply to ALL templates. Per-template recipes layer on top.

---

## RULE 1 — STATE-CONTEXT-EVERYWHERE (when state is in scope)

If the page topic includes a state (e.g., the topicCluster contains a state slug, the title mentions a state, or the user prompt specified a state), the state name MUST appear in:

- Title
- H1
- Meta description
- First sentence of every H2 section
- Every table caption
- All numeric thresholds quoted in body content (e.g., "Texas Medicaid threshold: $X" not just "$X")

**When a state-named program brand exists, USE THE BRAND. Generic "[state] Medicaid" is INSUFFICIENT.**

Canonical state-program brand list (use the brand name as the page's primary entity, with the generic as alternateName for SEO):

| State | Program brand | Type |
|---|---|---|
| California | **Medi-Cal** | Medicaid |
| California | **CalFresh** | SNAP |
| Arizona | **AHCCCS** | Medicaid |
| Minnesota | **MNsure** | Marketplace |
| Oklahoma | **SoonerCare** | Medicaid |
| Maine | **MaineCare** | Medicaid |
| Wisconsin | **BadgerCare** | Medicaid |
| Illinois | **AllKids** | CHIP |
| Tennessee | **TennCare** | Medicaid |
| Arkansas | **ARHOME** | Medicaid |
| New Jersey | **NJ FamilyCare** | Medicaid |
| Massachusetts | **MassHealth** | Medicaid |
| Indiana | **HIP** (Healthy Indiana Plan) | Medicaid |
| Oregon | **OHP** (Oregon Health Plan) | Medicaid |
| Colorado | **CHP+** | CHIP |
| Kentucky | **kynect** | Marketplace |
| Connecticut | **HUSKY Health** | Medicaid |
| Hawaii | **Med-QUEST** | Medicaid |
| Washington | **Apple Health** | Medicaid |

**Why:** State-named program brands generate disproportionate Bing volume — `mnsure` (269 cites in 2 months on BenefitsUSA), `soonercare` (262), `medi-cal` (272), `calfresh` (1,028), `ahcccs` (208). LLM proxies under-generate the brand; Bing routes to the brand.

---

## RULE 2 — ELIGIBILITY-HOUSEHOLD-SIZE-TABLE (when income gates eligibility)

Every page covering income-based eligibility (Medicaid, ACA subsidies, FPL pages, SNAP, WIC, persona-income-eligibility, etc.) MUST include a household-size lookup table:

```
| Household Size | Income Threshold ([year]) | Notes |
|---|---|---|
| 1 | $X,XXX | |
| 2 | $X,XXX | |
| 3 | $X,XXX | |
| 4 | $X,XXX | |
| 5 | $X,XXX | |
| 6 | $X,XXX | |
| 7 | $X,XXX | |
| 8 | $X,XXX | |
| Each additional | + $X,XXX | |
```

The table caption MUST include the year explicitly (e.g., "Texas Medicaid Income Limits — 2026").

The threshold values MUST be year-anchored against the most recent published guidelines.

**Why:** Real Bing grounding queries cluster around `family of 4`, `household of 3`. Users want the literal lookup, not the derivation. The household-size table is the canonical Bing-citable artifact.

---

## RULE 3 — HOW-TO-APPLY SECTION (every page, not just events)

Every page MUST have a next-steps H2 (typically titled "How to apply" or "Next steps") with:

1. **Specific enrollment-window dates** (or "open enrollment" if year-round)
2. **Numbered application steps** (3-7 steps, no fewer than 3, no more than 7)
3. **The official .gov starting URL** (Medicare.gov, Healthcare.gov, Medicaid.gov, state-specific portal — see brand list above)
4. **A "Documents needed" bullet checklist** (4-8 items)
5. **A "Common reasons applications get denied" callout** (3-5 items)

**Why:** Entailment is the dominant fan-out variant (~35% of all sub-queries in Phase 1). LLMs always expand into "how to apply" / "what to do next" even when the user prompt didn't ask. Real Bing data confirms application-flow queries are dense (e.g., `texas medicaid application` 980 cites, `iowa medicaid application 2026` 764).

---

## RULE 4 — YEAR MARKERS (already enforced framework-wide; reinforced here)

Every page MUST include the current year (and next year for forward-looking topics like COLA, projected benefits, plan-year costs) in:

- Title
- H1
- Meta description
- First paragraph
- Every numeric table caption
- Every section heading that references a numeric value
- Inline next to every dollar amount or percentage in body prose (e.g., "the 2026 threshold is $X" — never bare "$X")

**Year-anchoring rule:** Never write a dollar amount or percentage without a year within the same sentence or table caption.

**Why:** 91.6% of BenefitsUSA Bing grounding queries have year markers. LLMs across all 4 providers tested automatically append year markers to user prompts that don't include them.

---

## RULE 5 — AUTHORITATIVE SOURCE NARROWING

Cite primary sources INLINE (not just at the page foot) with anchor text containing the source domain. Required source domains by topic:

- **Medicare topics** → medicare.gov, cms.gov
- **Medicaid topics** → medicaid.gov, plus the state-specific Medicaid agency
- **ACA topics** → healthcare.gov, kff.org
- **FPL** → aspe.hhs.gov
- **Drug pricing** → cms.gov, fda.gov, manufacturer site
- **Tax topics** → irs.gov

Minimum 3 inline outbound `.gov` / `.edu` / KFF.org / healthcare.gov / cms.gov / nih.gov citations per page.

**Why:** OpenAI gpt-5-mini (the best Bing predictor at 58.7%) consistently appended `site:medicare.gov`, `site:hhs.gov`, `site:aspe.hhs.gov` to its sub-queries in our experiment. Bing rewards content that matches the same authority pattern.

---

## How to apply this block

1. Every CoveredUSA writer agent (`coveredusa-{procedure,drug,qa,glossary,event,persona,ma-state,article}-writer.md`) includes this block by reference in its system prompt.
2. The 5 rules above apply ALWAYS, regardless of template.
3. Per-template recipes (in `FANOUT_FORMULA.md` §4) layer on top — they don't replace these.
4. Validators (`scripts/validate-*.js` + `scripts/lib/content-quality.js`) enforce these as hard errors where possible (year markers, household-size table presence, .gov citation density).

## Cross-references

- `projects/covered-usa/specs/FANOUT_FORMULA.md` §3 — full derivation + Bing-validation evidence per rule
- `projects/covered-usa/specs/AI_OPTIMIZATION_FRAMEWORK.md` — the underlying framework (gets updated to incorporate these 5 rules)
- `projects/covered-usa/specs/REFACTOR_ROADMAP.md` — the per-writer execution order
