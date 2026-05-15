# Track C-prime drug-cost writer — Requirements Matrix

**Date:** 2026-05-14
**Phase:** 1 (planner output)
**Source:** Synthesized from 10 source docs per `TRACK_C_PARALLEL_PLAN.md` §3 Phase 1
**Authored by:** Track C-prime drug session (parent agent)

**Format:** Each requirement gets ID, source, category, rule text, enforcement, and conflict resolution. Categories follow the master brief: `formula-universal | formula-recipe | audit-flagged | framework-preserved | hard-contract | slug-rule | link-consumption | strategic-posture | humanizer-voice | cron-pipeline`.

---

## Summary

- **62 requirements** extracted across all 10 categories.
- **0 unresolved conflicts.** 4 conflicts resolved formula-wins (old writer's implicit treatment of §4.2 fan-out → new writer makes them required GATES).
- **3 most important things for Phase 2 drafter:**
  1. `iraNegotiation` block MUST be populated for Round-1 IRA drugs (Eliquis/Jardiance/Xarelto/Januvia/Farxiga/Entresto/Enbrel/Imbruvica/Stelara/Fiasp+NovoLog) — the audit's biggest writer-leak. Render bug fixed in commit `1fb5fb9`.
  2. Three audit-flagged NEW structural blocks are required (audit P0): `pharmacyPriceComparison`, `genericBiosimilarStatus`, `papEligibilityTable`. All 3 missing from all 3 existing pages.
  3. PAP×Medicare anti-kickback callout (Ozempic FAQ #5 gold standard) must be enforced in `patientAssistancePrograms.footnote` — Metformin/Insulin pages missed it; the writer-side gate now requires it.

- **Gaps in source docs:** none material. FANOUT_FORMULA §4.2 is single-drug-derived (Ozempic only); Phase 4 cross-validates against Eliquis/Jardiance/Januvia (Round-1 IRA, oral, different classes) + Humalog (insulin biosimilars) + Atorvastatin (already-generic baseline).

---

## Category 1 — formula-universal (5 reqs)

| ID | Source | Rule | Enforcement |
|---|---|---|---|
| REQ-001 | `_universal-rules-block.md` §1 | RULE 1 state-context-everywhere is **N/A for drug-cost** (drug pricing is federally-determined). EXCEPTION: Medicaid copay range varies by state — link out to `/medicaid-income-limits`. | STEP 3 explicit note |
| REQ-002 | `_universal-rules-block.md` §2 | RULE 2 household-size-table is **CONDITIONAL**: required when any PAP references FPL %. 9 rows (sizes 1-8 + each-additional). | STEP 6 GATE H |
| REQ-003 | `_universal-rules-block.md` §3 | RULE 3 how-to-apply: required `howToApplyPap` block (3-7 numbered steps + .gov OR manufacturer URL + documents needed 4-8 items + denial reasons 3-5 items). | STEP 4 checklist + STEP 6 GATE H sub-check |
| REQ-004 | `_universal-rules-block.md` §4 | RULE 4 year markers: 2026 in title, H1, meta, hero, quickAnswer, every table caption, every numeric heading, inline next to every $/% in body. | STEP 5 style rules |
| REQ-005 | `_universal-rules-block.md` §5 | RULE 5 authoritative source narrowing: ≥3 inline outbound .gov / .edu / kff.org citations. **fda.gov required** per audit P1. | STEP 6 GATE C |

## Category 2 — formula-recipe (§4.2 — 9 reqs)

| ID | Shape | Rule | Enforcement |
|---|---|---|---|
| REQ-006 | §4.2 Shape #1 | Manufacturer PAP + cost-without-insurance contrast in a single section (`patientAssistancePrograms`); intro must answer "I have no insurance, what does PAP get me?" | STEP 3 H2 list |
| REQ-007 | §4.2 Shape #2 | NEW `pharmacyPriceComparison` block REQUIRED (5 chains: Walmart, Costco, Kroger, CVS, Walgreens; ≥4 rows minimum). Caption: `<Drug> price by pharmacy (2026)`. **Audit's #1 missing artifact (0/3 pages).** | STEP 6 GATE F (strict count) |
| REQ-008 | §4.2 Shape #3 | PAP × Medicare anti-kickback callout (42 U.S.C. § 1320a-7b) in `patientAssistancePrograms.footnote` AND surface as FAQ. Ozempic FAQ #5 gold standard. | STEP 3 FAQ list |
| REQ-009 | §4.2 Shape #4 | Monthly cost without insurance: `pricing.retailLow/retailHigh` + `hero.subhero` + `quickAnswer` + `pointOfPay` retail row all agree, year-anchored. | STEP 1A internal consistency |
| REQ-010 | §4.2 Shape #5 | List price + IRA negotiation status: for Round-1 drugs populate `iraNegotiation`; for non-IRA include list price in `quickAnswer` or `whyHospitalsCharge`. | STEP 6 GATE E |
| REQ-011 | §4.2 Shape #6 | NEW `denialAlternatives` block REQUIRED: appeal steps (3-5), step-therapy override, PAP fallback, generic alternative. Plus FAQ "What if my insurance denies coverage for [drug]?" | STEP 3 H2 list |
| REQ-012 | §4.2 Shape #7 | NEW `genericBiosimilarStatus` block REQUIRED (even if all-null). For insulin: MUST name Basaglar/Semglee/Rezvoglar. Plus FAQ "Is there a generic / biosimilar for [drug]?" | STEP 6 GATE G |
| REQ-013 | §4.2 Shape #8 | `iraNegotiation` block populated for Round-1 IRA drugs (maxFairPrice, listPriceBefore, effectiveDate "2026-01-01", source CMS/KFF URL, callout.{en,es}). Round-2 forward-looking 2027 mention in `introParagraphs` for semaglutide. | STEP 6 GATE E |
| REQ-014 | §4.2 §4.2 vocabulary | Required canonical vocabulary in body: "Inflation Reduction Act", "Maximum Fair Price", "Medicare Part D", "Medicaid", "patient assistance program", "manufacturer coupon", "generic", "biosimilar", "formulary tier", "prior authorization". | STEP 6 grep check |

## Category 3 — audit-flagged (11 reqs from audit P0/P1/P2)

| ID | Audit ref | Rule | Enforcement |
|---|---|---|---|
| REQ-015 | P0 #1 | Add GoodRx pharmacy comparison table as REQUIRED H2. | GATE F |
| REQ-016 | P0 #2 | Add `genericBiosimilarStatus` block as REQUIRED. | GATE G |
| REQ-017 | P0 #3 | Add `howToApplyPap` block as REQUIRED nested under each PAP row. | STEP 4 checklist |
| REQ-018 | P0 #4 | Add `papEligibilityTable` (9 rows) when any PAP references FPL %. | GATE H |
| REQ-019 | P1 #1 | Add §4.2 "Coverage denial → alternative" H2 (`denialAlternatives` block). | STEP 4 checklist |
| REQ-020 | P1 #2 | **Every drug page MUST cite at least one fda.gov URL.** | GATE C sub-check |
| REQ-021 | P1 #3 | Style rule: numeric table captions use `<Drug> <metric> by <dimension> (<year>)` pattern. | STEP 5 style rules |
| REQ-022 | P1 #4 | PAP × Medicare anti-kickback callout in `patientAssistancePrograms.footnote` (REQUIRED). | STEP 4 checklist |
| REQ-023 | P1 #5 | Medicare Prescription Payment Plan mention REQUIRED for Part D drugs with retail >$200/mo. | STEP 5 anchor facts |
| REQ-024 | P2 #1 | Round-2 IRA preview for selected-but-not-yet-effective drugs (semaglutide → 2027). | STEP 2b |
| REQ-025 | P2 #2 | Reference "Walmart $4 Generic" + "Costco Member Prescription Program" + "Kroger Rx Savings Club" by canonical brand names. | STEP 2d |

## Category 4 — framework-preserved (preserved from old writer — 6 reqs)

| ID | Source | Rule |
|---|---|---|
| REQ-026 | old writer §"CRITICAL anchor facts" | 2026 anchor facts ($283 Part B / $202.90 Part B premium / $1,736 Part A / $2,100 Part D OOP / 20% Part B coinsurance / IRA = 2022). |
| REQ-027 | old writer §"drugClass guidance" | drugClass MUST be precise pharmacology term ("Statin", "ACE inhibitor", "GLP-1 receptor agonist" — NOT "antidiabetic medication"). |
| REQ-028 | old writer | Part B vs Part D classification logic: `medicareAspPerUnit` non-null + J-code only for Part B drugs (Injection/Infusion). `null` + empty `hcpcsJCodes` for Oral/Inhalation/Topical/Sublingual/Transdermal. |
| REQ-029 | old writer §"CRITICAL faqs shape" | FAQ question/answer are FLAT STRINGS, NOT LocalizedString. Loudly framed in old writer; preserved. |
| REQ-030 | old writer §"Spanish translation rules" | Brand names + US program names stay in English; medical terms use accepted Spanish equivalents. |
| REQ-031 | old writer §"Style rules" | No em-dashes, no en-dashes, no double-hyphens, no filler ("It's important to note", "navigating the complex world of"). |

## Category 5 — hard-contract (cron-parseable — 8 reqs)

| ID | Rule | Enforcement |
|---|---|---|
| REQ-032 | JSON return shape `{slug, status, ...}` parseable by cron at STEP 8. | STEP 8 |
| REQ-033 | Atomic write pattern: `<slug>.tmp.json` first → validate → rename to `<slug>.json`. | STEP 1 |
| REQ-034 | `## STEP N` numbered headings (cron may parse for logging). | Writer structure |
| REQ-035 | `Drug` interface conformance (validate-drugs.js enforces at prebuild). | STEP 6 30-check |
| REQ-036 | LocalizedString = `{en, es}` everywhere except flat-string exceptions (FAQ Q/A, slug, sources URLs, etc.). | STEP 4 checklist |
| REQ-037 | Every LocalizedString needs both `en` AND `es`. | STEP 5 Spanish |
| REQ-038 | `routeOfAdministration` is one of 7 enumerated strings (case-sensitive). | STEP 4 checklist |
| REQ-039 | `gates` return object with single-letter keys `{a, b, c, d, e, f, g, h}` mapped to lowercase string values. | STEP 8 |

## Category 6 — slug-rule (1 req)

| ID | Rule | Enforcement |
|---|---|---|
| REQ-040 | Slug always `<drug>-cost`, never contains year, never migrated. | STEP 6 GATE A |

## Category 7 — link-consumption (2 reqs)

| ID | Rule | Enforcement |
|---|---|---|
| REQ-041 | Read `content/link-index.json` `byPhrase.en` / `byPhrase.es` at STEP 0. Use natural phrases that match for auto-routing. | STEP 0 |
| REQ-042 | `relatedLinks[]` only uses hrefs that resolve to live routes. Valid prefixes: `/medical-bill-analyzer`, `/medicaid-income-limits`, `/medicare-eligibility`, `/aca-income-limits`, `/federal-poverty-level`, `/cost/<slug>`, `/drug/<slug>`. | STEP 4 checklist |

## Category 8 — strategic-posture (4 reqs)

| ID | Rule | Enforcement |
|---|---|---|
| REQ-043 | Default toward auto-ship (95% / 4% / 1% distribution). HOLD only on genuine structural failures. | STEP 6 gate routing |
| REQ-044 | Verifier-side independent re-check (don't trust writer self-report); strict count checks on `pharmacyPriceComparison.rows.length`, `papEligibilityTable.rows.length`. | Verifier STEP 1C |
| REQ-045 | Path portability: `$HOME/clawd/...` not hardcoded `/Users/frankthebot/` or `/Users/jacobposner/`. | STEP 0 |
| REQ-046 | Never overwrite a `verified` file. Check `_queue.json` before writing. | STEP 1 |

## Category 9 — humanizer-voice (4 reqs)

| ID | Rule | Enforcement |
|---|---|---|
| REQ-047 | Pronoun discipline: paragraphs lead with named entity, never "It"/"They"/"This"/"These"/"Here"/"There"/"Such". | STEP 6 GATE I |
| REQ-048 | Concrete numbers in hero, quickAnswer, FAQs; no "around $500" — "$998/month" exact. | STEP 5 style |
| REQ-049 | Paragraph length 120-250 words for body; 60-120 for FAQ answers. | STEP 5 style |
| REQ-050 | No markdown bold (`**text**`) embedded in JSON content. | STEP 5 style |

## Category 10 — cron-pipeline (12 reqs)

| ID | Rule | Enforcement |
|---|---|---|
| REQ-051 | `topicCluster: "drug-cost"` top-level key (forward-compat). | STEP 4 checklist |
| REQ-052 | `keyTerms: {en: [...], es: [...]}` OBJECT shape, NOT flat array. | STEP 4 checklist |
| REQ-053 | `isLighthouse: false`, `isDeprecated: false`. | STEP 4 checklist |
| REQ-054 | New blocks emitted at top level (forward-compat with Track A1 schema): `pharmacyPriceComparison`, `genericBiosimilarStatus`, `papEligibilityTable`, `denialAlternatives`, `howToApplyPap`. | STEP 4 |
| REQ-055 | `iraNegotiation` schema field present-and-complete for Round-1 drugs; omitted for non-Round-1 (don't emit as null). | GATE E |
| REQ-056 | `medicarePartD.hasSpecificCap: true` ONLY for insulin ($35/mo cap). | STEP 1A check #10 |
| REQ-057 | `hcpcsJCodes` non-empty AND `medicareAspPerUnit` non-null for Part B drugs (Injection/Infusion); both empty/null for Part D. | STEP 1A check #7-#9 |
| REQ-058 | Validator's cross-field: `medicarePartDMonthlyCap` non-null when `hasSpecificCap: true`. | validate-drugs.js |
| REQ-059 | 2026 Part B deductible = 283 (validator enforces); 2026 Part D OOP cap = 2100 (validator enforces). | validate-drugs.js |
| REQ-060 | `meta.title.en` ≤ 70 chars; `meta.description.en` ≤ 160 chars (content-quality.js enforces). | STEP 4 checklist |
| REQ-061 | FAQs are flat strings, validator catches LocalizedString-shaped FAQs. | validate-drugs.js |
| REQ-062 | Sources minimum 3 entries; each entry needs `name`, `url`, `note.{en,es}`. | validate-drugs.js |

---

## Resolved conflicts (4 — all formula-wins)

| Conflict | Old writer (implicit) | New writer (formula-aligned) | Resolution |
|---|---|---|---|
| C1 | GoodRx mentioned in research sources only, not required content | §4.2 Shape #2 is top-2 entailment; required structural block + GATE | Formula wins |
| C2 | PAP details listed but no household-size income table | RULE 2 + §3.3 mandate the 9-row table when income-gated | Formula wins |
| C3 | "How to apply" is just a URL in `patientAssistancePrograms.rows[].howToApply` | RULE 3 + §3.4 mandate numbered steps + documents + denial reasons | Formula wins |
| C4 | Generic/biosimilar mentioned in passing in some FAQ answers | §4.2 Shape #7 demands a dedicated block (even if all-null) | Formula wins |

## Open questions for next session

1. **Schema upgrade (Track A1).** The 5 new structural blocks (`pharmacyPriceComparison`, `genericBiosimilarStatus`, `papEligibilityTable`, `denialAlternatives`, `howToApplyPap`) are emitted as JSON top-level keys but the `Drug` TypeScript interface does NOT include them. The route `page.tsx` does NOT render them. They're forward-compatible (JSON.parse ignores extras) but invisible on the live page TODAY. Track A1 schema upgrade should add these to the interface and render them. Until then, the page surfaces this data only via existing schema slots (FAQs, `patientAssistancePrograms.footnote`, `pointOfPay.notes`).
2. **GoodRx price freshness.** The verifier's GATE F includes a WebFetch on goodrx.com/<drug>. GoodRx prices fluctuate weekly — the verifier should auto-fix stale prices. Validate on first 5-10 production cron-produced articles whether the auto-fix rate is acceptable (target: <20% of articles need price corrections).
3. **Round-2 IRA preview.** Ozempic page mentions Round-2 forward-looking (effective 2027). Other Round-2 drugs (Rybelsus, Wegovy, Trulicity, Ozempic, Imbruvica extension, etc.) should get the same treatment. Track E refresh pass.
