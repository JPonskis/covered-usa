# Refactor Roadmap — Phase 5 Track B / C / D / E execution plan

**Version:** 1.0
**Date:** 2026-05-15
**Source:** 8 parallel audit agents on each writer + sample existing pages, scored against `specs/FANOUT_FORMULA.md`
**Audit JSONs:** `content/fanout/analysis/audit-{blog,procedure,drug,qa,glossary,event,persona,ma-state}-writer.json`

---

## 0. Headline — what came out of the audit

**One single thing drives 80% of the work: the 5 missing universal rules.** They're missing from every one of the 8 writer agents. Build them once as a shared "universal rules block," include in all 8 writer prompts, every writer improves at once.

The 5 universal rules (from `FANOUT_FORMULA.md` §3):

1. **§3.2 STATE-CONTEXT-EVERYWHERE** — when state is in scope, thread state name through title + H1 + meta + every H2 first sentence + every table caption
2. **§3.3 ELIGIBILITY-HOUSEHOLD-SIZE-TABLE** — any income-gated page needs a household-size lookup table with year-tagged caption
3. **§3.4 HOW-TO-APPLY SECTION** — every page needs a next-steps H2 with enrollment dates + numbered steps + .gov starting URL + documents-needed checklist + common-denial-reasons callout
4. **§3.7 NAMED-PROGRAM LOOKUP** — when a state-named program applies (Medi-Cal, AHCCCS, MNsure, SoonerCare, MaineCare, BadgerCare, AllKids, TennCare, ARHOME, NJ FamilyCare, MassHealth, HIP, OHP, CHP+, CalFresh), use the brand name not "[state] Medicaid"
5. **§3.8 ELIGIBILITY ENTAILMENT** — every benefits page needs explicit eligibility section with concrete numeric thresholds + nonIncomeRequirements + commonReasonsDenied

Plus 1 critical code bug + per-template specifics.

---

## 1. The blockers (fix first)

### 1.1 Drug `iraNegotiation` render bug [CRITICAL]

The `iraNegotiation` field is fully defined in `src/lib/drugs.ts` and the writer agent emits it correctly. But it is **NEVER RENDERED** in `src/app/[locale]/drug/[drug]/page.tsx`. Confirmed via `grep iraNegotiation src/app/` returning zero matches.

**When this matters:** Round-1 IRA-negotiated drugs (Eliquis, Jardiance, Januvia, Farxiga, Entresto, Enbrel, Imbruvica, Stelara, Xarelto, Novolog/Fiasp) ship with a Maximum Fair Price + 2026 effective date that gets silently dropped.

**Fix:** Add the `iraNegotiation` block to the drug page template. Estimated ~30 minutes of code work in `page.tsx`.

**Status:** P0 BLOCKER. Fix BEFORE drug-template work in Track C.

### 1.2 Cron Stage 1 doesn't pass formula context to writer

`coveredusa-seo-stage1.md` doesn't pass `topicCluster` or formula-recipe context to the writer agent. Without it, even an updated writer can't dispatch correctly into per-template recipes.

**Fix:** Add `Target` and `topicCluster` fields to the Stage 1 → writer payload. Small edit.

**Status:** P0. Fix as part of Track B1.

---

## 2. The shared universal-rules block

Single text block included in all 8 writer prompts. Source content lives in `FANOUT_FORMULA.md` §3; this block is the writer-agent-friendly extraction.

**File:** `.claude/agents/_universal-rules-block.md` (new file, included by reference in each writer)

Contents (sketch):

```
## UNIVERSAL RULES (apply to every page you write)

### 1. State context everywhere (when state is in scope)
If the page topic includes a state, the state name MUST appear in:
- Title, H1, meta description
- First sentence of every H2
- Every table caption
- All numeric thresholds quoted in body

When a state-named program brand exists, USE THE BRAND:
Medi-Cal (CA), AHCCCS (AZ), MNsure (MN), SoonerCare (OK), MaineCare (ME),
BadgerCare (WI), AllKids (IL), TennCare (TN), ARHOME (AR), NJ FamilyCare (NJ),
MassHealth (MA), HIP (IN), OHP (OR), CHP+ (CO), CalFresh (CA SNAP).
Generic "[state] Medicaid" is INSUFFICIENT.

### 2. Eligibility household-size table (when income gates eligibility)
Every page covering income-based eligibility (Medicaid, ACA subsidies, FPL,
persona-income-eligibility) MUST include:

| Household Size | Income Threshold ([year]) | Notes |
|---|---|---|
| 1 | $X,XXX | |
| 2 | $X,XXX | |
| 3 | $X,XXX | |
| 4 | $X,XXX | |
| 5+ | $X,XXX × per additional | |

Year-tagged caption. Year-anchored thresholds.

### 3. How-to-apply section (universal — every page)
Every page MUST have a "How to apply" or "Next steps" H2 with:
- Specific enrollment-window dates (or "open enrollment" if year-round)
- Numbered application steps (3-7 steps)
- The official .gov starting URL
- A "Documents needed" bullet checklist
- A "Common reasons applications get denied" callout

### 4. Year markers (already enforced site-wide)
Current year + next year (for forward-looking topics) in title, H1, meta,
first paragraph, every numeric table caption, every section heading
referencing a numeric value.

### 5. Authoritative source narrowing
Cite primary sources inline with anchor text containing the source domain:
- Medicare → medicare.gov, cms.gov
- Medicaid → medicaid.gov, state agencies
- ACA → healthcare.gov, kff.org
- FPL → aspe.hhs.gov
- Drug → cms.gov, fda.gov, manufacturer site
```

**Effort:** S (~30 min to write the block + paste into 8 writer prompts).

---

## 3. Per-writer priority matrix

Stack-ranked by ROI. Each row's effort is on top of the universal-rules block (which is shared work).

| Order | Writer | Status | Top template-specific edit | Effort | Why this order |
|---|---|---|---|---|---|
| 1 | **Blog** | All universals missing + no §4.9 recipe | Add full §4.9 FPL super-shape recipe (FPL chart H2 / by household size / by percentage thresholds / × Medicaid / × ACA / × CHIP/WIC/SNAP / Alaska+Hawaii adjustments / state-by-state expansion) + year-anchoring rule for $/% values | M (2-3 hrs) | Runs daily. Every day of delay = ~3 misaligned articles. |
| 2 | **MA-state** | **Cleanest template — closest to formula** | Add how-to-enroll H2; codify pronoun discipline (named-entity-first); add $0 premium plans table; fix state-context boundary leaks | S (all S edits) | Closest to ready. Unlocks Track D state×program factory. Proof point that the formula works. |
| 3 | **Procedure** | All 3 pages missing the only Bing-validated shape | Add `goodFaithEstimate` JSON field (numbered steps, .gov URL, documents to bring, common reasons quote changes) + required H2 "How to request a Good Faith Estimate" | M (~1 day) | Single biggest single shape fix in any template. |
| 4 | **Drug** | 55-68% alignment + render bug | First: §1.1 render fix. Then: GoodRx pharmacy comparison table + generic/biosimilar status block + PAP eligibility table | M (after bug fix) | Blocked on §1.1. After bug fix, big lift in alignment. |
| 5 | **Persona** | Synonym gap UNCHANGED from prior audit | Section 5.6 synonym coverage block (writer prompt explicitly requires synonym density check) + enumerate 8 §4.7 shapes as required H2s + householdSizeTable + howToApply schema fields | M | gig-workers regen is BLOCKED on this fix. |
| 6 | **Event** | Best per-template recipe of all writers; just needs universals | Add 4 structured fields: `householdSizeTable`, `documentsNeeded`, `stateRules`, `commonDenialReasons`. Em-dash purge in self-validation step. | M | Already strong; just needs universals layered on. |
| 7 | **Q&A** | Coverage works; state-eligibility branch missing | **Single writer with `subtype: coverage|state-eligibility` dispatch** (NOT two writers). Add state-eligibility BRANCH block in STEP 3 with 16-state brand list + missing required fields | M | Forking would duplicate 70% of writer logic. Conditional branch is cleaner. |
| 8 | **Glossary** | **DOWNSCOPE — pages 1.8-3.3x over §4.5 word cap** | Hard-cap 500 words; drop introParagraphs; cut FAQs 6-8→3-4; add LINK_TARGET_MANIFEST routing block; add §4.5 warning quote at top of writer prompt | S+M | Counterintuitive but critical. 1,000-word MAGI explainers are wasted effort for citations. |

**Total estimated effort across all 8 writers + universal block + bug fix:** ~3-4 working days.

---

## 4. Page regen priority list (for Track E)

Once writers are updated, regen pages in this order. Priority is severity-weighted: factual errors first, then formula-gap severity.

### HIGH urgency (blockers / factual errors)

| Page | Why | Notes |
|---|---|---|
| `/blog/hospital-...` (the 2025 FPL drift article) | **FACTUAL ERROR** — 2025 FPL numbers labeled as 2026 in charity-care threshold table | Verifier missed real numeric drift |
| `/blog/federal-poverty-level-2026-guidelines` | THE canonical FPL page; needs full §4.9 recipe | High traffic; canonical exemplar |
| `/cost/mri` and `/cost/ct-scan` | Missing Good Faith Estimate / NSA entirely (only Bing-validated procedure shape) | Both medium-alignment now; full regen → high |
| `/drug/insulin-cost` | Biosimilars story (Basaglar/Semglee/Rezvoglar) missing entirely | Insulin biosimilar coverage is a real gap |
| `/for/gig-workers` | Synonym gap UNCHANGED from prior audit | BLOCKED on writer patch first |
| `/event/turning-26-health-insurance` | 23 em-dashes + missing structured fields + 80-char title | Multiple violations |

### MEDIUM urgency (touch-up regens)

- `/cost/colonoscopy` (already strong; just needs GFE H2 added)
- `/drug/ozempic-cost` (already strong; needs GoodRx table)
- `/for/self-employed` (~8 body em-dashes; missing some §4.7 shapes)
- `/event/turning-65-medicare` (Spanish meta length; missing structured fields)
- `/event/just-lost-job-health-insurance` (gold-standard reference; minor tweaks)
- `/medicare-advantage/texas` and `/medicare-advantage/wyoming` (light edits per ma-state writer fixes)

### LOW urgency (already strong or rarely viewed)

- `/drug/metformin-cost`
- `/medicare-advantage/california` (canonical exemplar — leave alone)
- `/blog/medicare-part-b-cost-2026` (medium alignment; touch-up only)

---

## 5. Cron pipeline keep-running policy

**Recommendation: KEEP the daily blog cron RUNNING during Track B1.**

Rationale:
- Pausing 3-10 articles/day for 1-2 days of writer rewrite costs more than letting medium-alignment output continue
- The current writer is OK, just not formula-aligned — output isn't garbage, just suboptimal
- Track E will regen everything anyway
- Once Track B1 ships (~tomorrow), the cron immediately picks up the new prompt

**Single Stage 1 fix needed before B1 ship:** add `topicCluster` + `formulaRecipe` (or `target`) to the writer payload so the new writer can dispatch correctly.

---

## 6. Execution order (the actual to-do list)

```
Tonight / next session:
[ ] Fix drug iraNegotiation render bug in src/app/[locale]/drug/[drug]/page.tsx
[ ] Write .claude/agents/_universal-rules-block.md (the shared block)
[ ] Update Stage 1 cron to pass topicCluster/target to writer

Track B1 (next 1-2 days):
[ ] Add universal rules block + §4.9 FPL recipe to coveredusa-article-writer.md
[ ] Manual test: invoke writer on 5 keywords, validate output, score fan-out coverage
[ ] When passing: Track B2 (cron picks up new writer automatically; no flip needed since cron is running)

Track C (next 3-4 days, ordered by audit ROI):
[ ] MA-state writer fixes (S — fastest; unblocks Track D)
[ ] Procedure writer + goodFaithEstimate field (M)
[ ] Drug writer + GoodRx + biosimilar + PAP fields (M; depends on §1.1 bug fix)
[ ] Persona writer + synonym block (M)
[ ] Event writer + 4 structured fields + em-dash purge (M)
[ ] Q&A writer + subtype dispatch (M)
[ ] Glossary writer DOWNSCOPE (S+M)

Track D (after Track C MA-state):
[ ] Bulkgen MA pages for remaining 48 states using updated writer
[ ] Build state×Medicaid permutation factory (50 state pages w/ household-size income tables)

Track E (after Track C complete):
[ ] Bulk regen HIGH-priority pages (per §4 above)
[ ] Bulk regen MEDIUM-priority pages
[ ] LOW priority pages: regen on next quarterly content sweep

Track F (LAST, after CoveredUSA proves out):
[ ] Apply formula + universal rules to BenefitsUSA (EXTREME caution)
[ ] Build WIC + SNAP permutation factories on BenefitsUSA (per FANOUT_FORMULA.md §5.1b)
```

---

## 7. What this roadmap does NOT cover

- **Track AA Phase 2** (second-topic-per-template re-probe) — deferred until Track B1 ships and we have new content to test against
- **Calibration coefficient measurement** — deferred until CoveredUSA accumulates Bing AI Performance Report data
- **Provider drift monitoring** (re-running the experiment quarterly) — calendar reminder, not a near-term execution item

---

## 8. Cross-references

- `specs/FANOUT_FORMULA.md` — the underlying formula (the universal rules + per-template recipes this roadmap implements)
- `specs/AI_OPTIMIZATION_FRAMEWORK.md` — gets updated with the 5 new universal rules from §3 of the formula
- `specs/CURRENT_STATE_AUDIT.md` — the prior audit findings; per-template gap analysis here extends those
- `specs/PHASE_5_BRIDGE.md` — original execution plan (this roadmap supersedes the Track B/C/D/E ordering with audit-grounded priority)
- `specs/URL_SLUG_FRAMEWORK.md` — slug rules (no URL changes in any of this work)
- `specs/LINK_TARGET_MANIFEST.md` — link-routing system (writer agents include the universal-rules block + consult link-index.json)

---

*This is the refactor roadmap. The audit data lives in `content/fanout/analysis/audit-*-writer.json` if you need to re-derive any of these priorities. Versioned for revision as Track B1+ ships.*
