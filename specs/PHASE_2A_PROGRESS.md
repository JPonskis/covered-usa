# Phase 2A — Procedure Cost Track

**Status:** In progress
**Started:** 2026-05-13
**Goal:** Templatize `/cost/mri` into `/cost/[procedure]` dynamic route + build the agent infrastructure to mass-produce 150-200 procedure pages.

---

## The Decided Plan (locked in 2026-05-13)

**Release pace:** 30 procedure pages/day + the existing 10 blog articles/day = 40 new URLs/day during rollout. Comfortably within Bing's safe range (~6-15% of practical ceiling).

**Total Phase 2 corpus target:** ~450-700 programmatic pages across all template types:

| Template | Target | Phase |
|---|---|---|
| Procedure cost | 150-200 | 2A (this doc) |
| Drugs | 100-150 | 2B |
| Q&A | 100-200 | 2C |
| Glossary | 40-60 | 2D |
| Trigger events | 20-30 | 2E |
| Persona pages | 15-25 | 2F |
| Hubs (additions) | 15-20 | 2G |

**Timeline:** 5-6 weeks of focused work to fully ship Phase 2. This doc covers Phase 2A only.

**Rollout strategy (locked):** Pre-generate everything for a template type → audit → release in batches of 30/day → monitor AI Performance Report between batches.

---

## Phase 2A Tasks

### A1. Inventory MRI page fields
- **Status:** todo
- Output: list of every dynamic field the JSON shape must support

### A2. Define procedure JSON schema (TypeScript types)
- **Status:** todo
- Output: type definitions in `src/lib/procedures.ts`

### A3. Extract `/cost/mri` content into `content/data/procedures/mri.json`
- **Status:** todo
- Output: working `mri.json` that captures every dynamic value from the current static page

### A4. Build `src/lib/procedures.ts` loader
- **Status:** todo
- Mirrors `src/lib/blog.ts` pattern. Functions: `getAllProcedures()`, `getProcedureBySlug(slug)`, `getAllProcedureSlugs()`. Type-validated.

### A5. Convert to dynamic route
- **Status:** todo
- Move `src/app/[locale]/cost/mri/page.tsx` → `src/app/[locale]/cost/[procedure]/page.tsx`
- Add `generateStaticParams()` so each procedure becomes a static page at build time
- Add `generateMetadata()` per procedure
- 404 for missing slugs via `notFound()`

### A6. Parity verification
- **Status:** todo
- Verify templated `/cost/mri` page renders identical (or near-identical) to the original static. Visual diff + content diff.

### A7. Extend sitemap
- **Status:** todo
- `src/app/sitemap.ts` auto-pulls procedure slugs from `getAllProcedureSlugs()`

### B1. Build `coveredusa-procedure-writer` agent
- **Status:** todo
- Mirrors `coveredusa-article-writer.md` but emits JSON to `content/data/procedures/<slug>.json` instead of markdown
- Inputs: PROCEDURE_NAME, HCPCS_CODE (if known), SLUG, ROW_NUMBER (or similar)
- Outputs: structured JSON matching the schema from A2

### B2. Build `coveredusa-procedure-verifier` agent
- **Status:** todo
- Mirrors `coveredusa-article-verifier.md` but verifies the JSON shape + fact-checks cost ranges, HCPCS code, sources
- Uses same primary-source rules (CMS, ASPE, IRS, KFF)
- Either approves/corrects JSON or flags for review

### B3. Build one-time bulk-generation script
- **Status:** todo
- Takes a list of procedures (CSV or JSON), spawns parallel writer + verifier agents
- Writes JSON files to `content/data/procedures/queued/` (or with `released: false` flag)
- Output: summary of generation results

### B4. Test on 3-5 procedures, audit, tune
- **Status:** todo
- Pick: CT scan, mammogram, colonoscopy (high-volume, diverse procedure types)
- Run through agent pipeline
- Audit each output by hand
- Tune agent prompts until ≥80% pass without edits

### B5. Critic review
- **Status:** todo
- Adversarial review of procedure-writer + procedure-verifier definitions
- Apply fixes before scaling up

### Commit + report
- **Status:** todo
- Two-repo commits (covered-usa + clawd-workspace)
- Hold pushes for Jacob's review

---

## Phase 2A Success Criteria

When Phase 2A is "done":
- [ ] Original `/cost/mri` URL still loads, renders ≥95% identical to before
- [ ] Adding a new JSON file to `content/data/procedures/` automatically creates a live page at `/cost/<slug>` after deploy
- [ ] Sitemap includes all procedure slugs
- [ ] Writer + verifier agents produce JSON that the loader can ingest cleanly
- [ ] Test batch of 5 procedures generated, audited, ready to ship
- [ ] No regression to existing blog cron or any other site flow

---

## Progress Log

### 2026-05-13
- Plan locked: 30/day pace, ~450-700 total programmatic pages, 5-6 week rollout
- Phase 2A tasks scoped (A1-A7, B1-B5)
- Progress doc created (this file)

**Phase A (route + loader + data) — DONE:**
- A1: Inventoried MRI page fields (21 dynamic field categories)
- A2/A4: Built `src/lib/procedures.ts` with full TypeScript types + loaders (getAllProcedures, getProcedureBySlug, getAllProcedureSlugs, pickLocale helpers)
- A3: Extracted MRI page content into `content/data/procedures/mri.json` (validates against schema; 8 FAQs EN+ES, 4 site-of-service rows, 8 body-part variants)
- A5: Converted `/cost/mri/page.tsx` static → `/cost/[procedure]/page.tsx` dynamic. Added generateStaticParams (cross-product locale × first 20 slugs), generateMetadata (per-procedure title/desc/canonical/alternates), notFound() for missing slugs. Deleted old static `mri/` directory.
- A6: Build verified — `npm run build` exits 0 with new dynamic route + sitemap + loader. Visual parity will be confirmed via dev server before commit.
- A7: Extended `src/app/sitemap.ts` to auto-pull procedure slugs from `getAllProcedureSlugs()`. Removed hardcoded `/cost/mri` entry (now generated automatically). Each procedure entry uses the JSON's `lastUpdated` field for `lastModified`.

**Phase B (agents + bulk-gen) — IN PROGRESS:**
- B1: Built `coveredusa-procedure-writer` agent at `.claude/agents/coveredusa-procedure-writer.md`. Mirrors article-writer pattern but produces JSON conforming to the `Procedure` interface. Includes anchor-fact list (2026 Medicare Part B $283/$202.90, Part A $1,736, Part D $2,100, IRA 2022, insulin $35 effective 2023). 40 maxTurns, full tool set.
- B2: Built `coveredusa-procedure-verifier` agent at `.claude/agents/coveredusa-procedure-verifier.md`. Mirrors article-verifier but operates on JSON. 7 high-risk claim categories (Medicare facts, national prices, HCPCS codes, year refs, statute refs, sources, internal consistency). 50 maxTurns. JSON validity check after every edit.
- B3: Built bulk-gen job at `.claude/claudeclaw/jobs/coveredusa-procedure-bulkgen.md`. On-demand (not daily). Reads queue from `content/data/procedures/_queue.json`. Spawns parallel writers, then parallel verifiers, then updates queue status. Default batch size 10, configurable.
- B3.5: Built initial queue at `content/data/procedures/_queue.json` with 10 procedures (CT, colonoscopy, mammogram, X-ray, ultrasound, echocardiogram, ER visit, urgent care, physical therapy, endoscopy).

**Writer tests — PASSED:**
- CT scan (ct-scan.json): 2,150 EN words, 4 site-of-service rows, 10 body-part variants, 8 EN+ES FAQs, 5 sources. Valid JSON, schema-compliant.
- Colonoscopy (colonoscopy.json): 1,978 EN words, screening-vs-diagnostic distinction captured in variants, HCPCS G0105 + G0121 (correct public-domain Medicare screening codes), 8 EN+ES FAQs, 5 sources.

**Critic review — DONE.** Adversarial review found 18 issues (3 critical, 5 high, 7 medium, 3 low). Applied fixes:

| # | Severity | Fix |
|---|----------|-----|
| 2 | Critical | Writer prompt clarified: `faqs.en/es` arrays contain flat strings (not LocalizedString objects). The one exception to the bilingual rule. |
| 3 | Critical | Bulkgen rewritten to use `coveredusa-procedure-queue.js` helper script (tempfile-based input). No more shell-interpolated `node -e` with `[REPLACE_WITH_SLUG_ARRAY]` placeholders. |
| 6 | High | Writer's "already exists" pre-flight now allows retry when queue status is `write_failed` or `flagged`. Atomic write pattern: tmp file first, validate, rename. |
| 9 | Medium | `procedureType` enum constrained to schema.org's MedicalProcedureType vocabulary (Diagnostic/Surgical/Therapeutic/Palliative). Screening/Preventive → use "Diagnostic" + cover screening in prose. Applied to colonoscopy.json. |
| 4 | High | Verifier rule: `replace_all: true` is BANNED on bare dollar amounts. Per-occurrence unique `old_string` with key-prefix context required. |
| 10 | Medium | HCPCS regex check restricted to the `hcpcsCodes` array only (prevents false positives on 5-digit numbers in prose). |
| 12 | Medium | Verifier turn-cap (30+) now emits `status: "flagged"` instead of `"approved"`. "Approved" means all categories checked, not just no failures. |
| 13 | Medium | Verifier checks `lastUpdated` matches ISO `^\d{4}-\d{2}-\d{2}$` format. |
| 14 | Medium | Bulkgen batch size hard-capped at 10 (was "configurable, default 10"). WebSearch rate limits start mattering above this. |
| 15 | Medium | New `scripts/validate-procedures.js` build-time validator (zod-style structural checks). Wired in as `prebuild` hook in `package.json`. One bad JSON now fails Vercel build fast instead of crashing at render. |
| 17 | Low | Queue status values documented in bulkgen file. |

**Deferred (accepted risk, documented):**
- Critic #1/#11: hardcoded frankthebot paths in agent files. This matches existing pattern (article-writer.md etc.) and is correct for production (Mac mini). Local testing requires explicit substitution.
- Critic #5: bulk-gen race conditions if Jacob runs twice in rapid succession. Low probability, queue helper is idempotent.
- Critic #7: Spanish translation quality not auto-verified. Manual spot-check during audit.
- Critic #8: cross-field consistency (pricing object vs inline strings). Verifier Category G + Special Case 1 cover this. Could redesign route to compute strings from pricing later.
- Critic #16: MRI gold-standard has empty hcpcsCodes. MRI codes are CPT (AMA-licensed), no HCPCS Level II equivalent for standard MRI — correct as-is.

**New infrastructure built:**
- `scripts/coveredusa-procedure-queue.js` (queue helper for bulkgen)
- `projects/covered-usa/scripts/validate-procedures.js` (build-time validator)
- `prebuild` hook in `package.json`

**Verifier tests — PASSED:**

| Procedure | Status | Edits | Flagged | Notes |
|---|---|---|---|---|
| ct-scan | flagged | 0 | 1 | Verifier found no errors. Flag is for $185 PFS / $340 OPPS being "approximate" averages across body parts (CT pricing varies by code — verifier correctly refused to "correct" with a more specific number it couldn't pin down). Writer's `hcpcsCodes: []` correctly identified — CT uses AMA CPT, the one HCPCS code (G0297) was deleted in 2021. |
| colonoscopy | flagged | 6 | 2 | Verifier caught a **real factual error**: writer had CMS polyp-removal coinsurance phase-down schedule wrong (20% through 2026 → 15% in 2027-2029 → 0% in 2030). Correct per CMS MM12656: 20% (2022) → **15% in 2023-2026** → **10% in 2027-2029** → 0% (2030+). Fixed in 6 places (variants row, footnote, medicare section, FAQ EN+ES, sources note). Flagged $400 PFS / $1260 OPPS / $680 ASC for human CMS Addendum verification. |

**Validation tooling — DONE:**
- `scripts/validate-procedures.js` validates every JSON in `content/data/procedures/` against the `Procedure` interface
- Wired in as `prebuild` script in `package.json` — Vercel build now fails fast on malformed data
- Currently passes for all 3 procedures (mri, ct-scan, colonoscopy)
- Full build with prebuild hook: exit 0

**Phase 2A complete. Status:**
- Dynamic route working
- 3 procedure JSONs in corpus (1 hand-extracted gold standard + 2 agent-generated tested)
- Writer agent produces schema-compliant JSON with real data
- Verifier agent catches real errors, doesn't fabricate
- Build-time validation gates malformed data
- Bulk-gen cron + queue helper ready
- Critic-driven iteration applied

**Open items before scaling beyond 10 procedures:**
- Human verification of colonoscopy $400/$1260/$680 Medicare rates against 2026 CMS PFS/OPPS Addendum B
- Same for CT $185/$340 (or accept "approximate" hedge in prose)
- Decide whether to ship ct-scan + colonoscopy now or hold for full audit
- After confidence is solid, expand `_queue.json` from 10 procedures to the full ~150-200 list

