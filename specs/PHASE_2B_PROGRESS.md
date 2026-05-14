# Phase 2B — Drug Pages Track

**Status:** In progress
**Started:** 2026-05-13 (continuing 2026-05-14)
**Goal:** Templatize `/drug/insulin-cost` into `/drug/[drug]` dynamic route + build the agent pipeline to mass-produce 100-150 drug pages.

---

## Why drugs are different from procedures

Drugs have different anchor data than procedures:
- HCPCS J-codes (drug administration codes — J1815 short-acting insulin, J1817 pump insulin, J0XXX series for chemotherapy, etc.) instead of procedure codes
- Brand name vs generic name distinction (matters for pricing)
- Drug class (e.g., "GLP-1 receptor agonist", "Statin", "Insulin analog")
- **Inpatient hospital markup angle** — drugs billed during hospital admission can cost 10-100x outpatient cost. This is the key proprietary data point for drug pages.
- Patient Assistance Programs (PAPs) — manufacturer-specific programs (Lilly Insulin Value, Novo Nordisk PAP, Sanofi Valyou, etc.)
- Medicare Part D vs Part B coverage rules differ
- IRA 2022 anchor facts: $35/mo insulin cap (effective 2023), $2,100 Part D OOP cap (2026)

Schema.org `Drug` type is what we use (separate from `MedicalProcedure`).

## Pace target

30/day rollout same as procedures. Total drug corpus target: 100-150 pages. At 30/day = 4-5 days of pure release once infra is built.

## Anchor facts to bake into the agents

- Medicare 2026 Part D OOP cap: **$2,100** (was $2,000 in 2025)
- Medicare Part D insulin cap: **$35/month** per IRA 2022 (effective 2023-01-01)
- Part B-billed drugs (chemotherapy, immune globulin, some inpatient drugs) use 20% coinsurance after Part B deductible ($283 in 2026)
- IRA 2022 = signed Aug 16, 2022 (NOT 2023). Insulin cap effective 2023-01-01.
- IRA Medicare drug price negotiation: first 10 drugs negotiated, new prices effective 2026-01-01 (drugs include Eliquis, Jardiance, Xarelto, Januvia, Farxiga, Entresto, Enbrel, Imbruvica, Stelara, NovoLog/Fiasp). Verify with each drug.

## Lessons learned from Phase 2A (apply from the start)

1. **`_`-prefix file exclusion in the loader.** `_queue.json` must not be picked up as a drug. Build the filter into the first version of `drugs.ts`.
2. **Schema.org Drug type controlled vocabulary.** Drug type doesn't have a strict enum like MedicalProcedure, but `drugClass` should be a real pharmacology class. No invented categories.
3. **HCPCS J-codes only, no CPT.** AMA license issue.
4. **FAQ shape: flat strings, not LocalizedString.** Same rule as procedures.
5. **Atomic write pattern from the start.** Writer writes to `.tmp.json` first, validates JSON parses, renames.
6. **Replace_all banned on bare dollar amounts.** Per-occurrence unique old_string in verifier.
7. **HCPCS regex scoped to `hcpcsCodes` array only.** No false-positive scans of prose.
8. **Turn-cap behavior: emit "flagged" not "approved" on incomplete checks.**
9. **`lastUpdated` ISO format check.**
10. **Bulkgen batch cap at 10 (WebSearch rate limits).**
11. **Tempfile-based parameter passing in bulkgen** (no shell-interp risk).
12. **Build-time schema validator + prebuild hook.**

All of these will be baked into the drug-* files from the first commit.

## Tasks

| # | Task | Status |
|---|------|--------|
| B-A1 | Inventory insulin page fields | todo |
| B-A2 | Define Drug TypeScript schema | todo |
| B-A3 | Extract insulin-cost.tsx → insulin-cost.json | todo |
| B-A4 | Build src/lib/drugs.ts loader | todo |
| B-A5 | Convert /drug/insulin-cost → /drug/[drug] | todo |
| B-A6 | Extend sitemap | todo |
| B-A7 | Add validate-drugs.js + prebuild hook | todo |
| B-A8 | Verify build passes | todo |
| B-B1 | Build coveredusa-drug-writer agent | todo |
| B-B2 | Build coveredusa-drug-verifier agent | todo |
| B-B3 | Build drug-bulkgen job + queue + helper | todo |
| B-B4 | Test on 2 drugs (2 different classes) | todo |
| B-B5 | Critic review | todo |
| Iter | Apply critic fixes | todo |
| Cmt | Commit + push both repos | todo |

## Progress Log

### 2026-05-13/14
- Phase 2A shipped successfully — all 3 procedure pages live on coveredusa.org
- Plan locked: same approach for drugs, just swap schema
- Progress doc created (this file)

**Phase B-A (route + loader + data) — DONE:**
- B-A1: Inventoried insulin page fields. Drug pages have ~25 dynamic field categories — 5-point pricing dimension (Medicare ASP, retail, inpatient, Part D, Medicaid), PAP table, J-code table, brand names list.
- B-A2/B-A4: Built `src/lib/drugs.ts` with full TypeScript types + loaders (`getAllDrugs`, `getDrugBySlug`, `getAllDrugSlugs`, `pickLocale` helpers). Filter for `_`-prefix files baked in FROM THE START (lesson from Phase 2A bug).
- B-A3: Extracted insulin page content into `content/data/drugs/insulin-cost.json`. 25 sections, 8 EN+ES FAQs, 5 pricing rows, 3 PAPs, 2 J-codes. JSON validates.
- B-A5: Converted `/drug/insulin-cost/page.tsx` static → `/drug/[drug]/page.tsx` dynamic route. generateStaticParams (locale × first 20 slugs), generateMetadata per drug, notFound() for missing. Same components (ReferenceTable, AnalyzerCTA, BlogDropCap) and brand styling. Optional sections (PAP, Part D, billing errors, HCPCS, variants) conditionally render.
- B-A6: Extended `src/app/sitemap.ts` to auto-pull drug slugs (uses `getAllDrugSlugs()` + lastUpdated). Removed hardcoded `/drug/insulin-cost` entry.
- B-A7: Added `scripts/validate-drugs.js` build-time validator. Wired in as `prebuild` hook (now runs `validate:procedures && validate:drugs`).
- B-A8: Full build verified — `npm run build` exits 0.

**Phase B-B (agents) — DONE:**
- B-B1: Built `coveredusa-drug-writer` agent at `.claude/agents/coveredusa-drug-writer.md`. Mirrors procedure-writer pattern. Includes anchor-fact list (2026 Medicare Part B $283, Part B premium $202.90, Part A $1,736, Part D OOP $2,100, IRA 2022, insulin cap 2023). Explicit FAQ flat-string rule, atomic write pattern, drug-class guidance (real pharmacology terms, not invented categories), IRA Medicare drug price negotiation list (Eliquis, Jardiance, Xarelto, Januvia, Farxiga, Entresto, Enbrel, Imbruvica, Stelara, Fiasp/NovoLog).
- B-B2: Built `coveredusa-drug-verifier` agent. Same 8 high-risk categories adapted for drugs. Verifies Medicare ASP, J-codes (Level II only, no NDCs, no CPT), PAP existence/terms, IRA statute facts, internal consistency.
- B-B3: Built `coveredusa-drug-bulkgen.md` on-demand cron + `coveredusa-drug-queue.js` helper. 10 drugs pre-loaded in `_queue.json` (Ozempic, Metformin, Humira, Eliquis, Atorvastatin, Lisinopril, Albuterol, Jardiance, Levothyroxine, Wegovy).

**Writer tests — PASSED:**
- Ozempic (injectable, GLP-1, common case): 3,800 EN words, 8 EN+ES FAQs, 5 sources, Novo Nordisk PAP cited, Wegovy/Medicare exclusion covered. hcpcsJCodes: [] correctly (self-administered, no J-code despite being injectable).
- Metformin (oral, Part D): 3,716 EN words. BUT exposed critic's Critical #1 — the writer used `medicareAspPerUnit: 0` as a hack because the field was non-nullable. Confirmed the Part B-centric schema needed to handle Part D drugs cleanly.

**Critic review — DONE.** 12 issues (2 critical, 4 high, 4 medium, 2 low). All actionable issues fixed:

| # | Severity | Fix |
|---|----------|-----|
| 1 | Critical | Made `medicareAspPerUnit` + `medicareAspUnit` nullable in Drug interface + validator. Updated writer prompt: Part B drugs use ASP, Part D drugs use null + omit the ASP pointOfPay row. |
| 2 | Critical | Added optional `IRANegotiation` block (maxFairPrice, listPriceBefore, effectiveDate, source, callout) for the 10 IRA-negotiated drugs. Writer prompt requires it for Eliquis/Jardiance/Xarelto/etc. |
| 3 | High | Verifier Category C + Case 6 now check `routeOfAdministration` — Oral/Inhalation/Topical/Sublingual/Transdermal expect empty `hcpcsJCodes`, only Injection/Infusion flag for missing J-codes. |
| 4 | High | Validator cross-field check: `medicarePartD.hasSpecificCap === true` requires `pricing.medicarePartDMonthlyCap !== null`. |
| 5 | High | Writer prompt clarifies drugName vs nonProprietaryName vs brandNames routing (brand pages use brand as drugName, generic pages use generic). |
| 6 | High | Verifier corrections now require Grep-based occurrence enumeration before edits to catch all prose-level mentions when correcting pricing values. |
| 7 | Medium | Atomic write pattern explicitly walks through tmp → validate → rename. |
| 9 | Medium | Tightened insulin gold-standard `drugClass`: "Insulin analog (rapid-, intermediate-, and long-acting hormone replacement)" instead of generic "Antidiabetic agent". Writer prompt now lists acceptable specificity examples. |
| bonus | Low | `routeOfAdministration` enum tightened ("Injection" not "Subcutaneous injection"). Step 0 retry semantics fixed (writer can overwrite when status is `writing` since bulkgen pre-marks). Related links rule: only use known route prefixes. |

**Deferred (accepted risk):**
- Critic #8: PAP verification overflag risk. Verifier instructions say "flag if can't verify" but realistic browser blocking will overflag. Will tune after running first real batch.
- Critic Bonus #3: Wegovy + Ozempic same molecule, duplicate content risk. Mitigation: queue notes for Wegovy emphasize the obesity-specific angle (Medicare exclusion, $1,300+/mo retail). If pages end up too similar, drop Wegovy from queue.

**Final test results (post-fix):**
- All 3 drug JSONs pass `validate-drugs.js`: insulin-cost ✅, ozempic-cost ✅, metformin-cost ✅ (with `medicareAspPerUnit: null` now)
- Full build: exit 0
- Phase 2B infrastructure ready to scale
