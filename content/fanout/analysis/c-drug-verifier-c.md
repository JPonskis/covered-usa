# Verifier C — Differential audit (OLD vs NEW drug-writer)

**Date:** 2026-05-14
**Phase:** 3 (differential)
**Role:** For every rule/instruction/convention in the OLD writer, verify either (a) PRESENT in NEW, (b) SUPERSEDED with documented justification, or (c) SILENTLY DROPPED (a bug).

**Files compared:**
- OLD: `.claude/agents/coveredusa-drug-writer.bak.md` (11,979 bytes, 234 lines)
- NEW: `.claude/agents/coveredusa-drug-writer.md` (~28,000 bytes, ~660 lines — Track C-prime expansion)

---

## Verdict summary

| Status | Count |
|---|---|
| PRESENT | 47 |
| SUPERSEDED (with justification) | 8 |
| SILENTLY DROPPED | 0 |

**Overall:** zero silent drops. The 8 SUPERSEDED items all gain stricter framing or different placement (e.g., "use this gold standard" → "GATE F enforces with strict count check"). Track C-prime expansion is purely additive on the framework side.

---

## PRESENT (47 — preserved verbatim or near-verbatim)

| # | OLD rule | NEW location |
|---|---|---|
| 1 | Atomic write pattern (`<slug>.tmp.json` → validate → rename) | STEP 1 + STEP 7 |
| 2 | Refuse to overwrite `verified` files via `_queue.json` check | STEP 1 existence-check |
| 3 | Read `drugs.ts` schema | STEP 0 #3 |
| 4 | Read `insulin-cost.json` as structural reference | UPGRADED to `ozempic-cost.json` (higher alignment 68% vs 62%; SUPERSEDED item below) |
| 5 | Part B vs Part D classification logic | STEP 2a (expanded with edge cases for insulin + semaglutide) |
| 6 | `medicareAspPerUnit: null` for oral Part D drugs | STEP 2a |
| 7 | `hcpcsJCodes: []` for oral / inhalation / topical / sublingual / transdermal | STEP 2a |
| 8 | "Medicare ASP rate" row OMITTED from `pointOfPay` for Part D drugs | STEP 2a |
| 9 | Retail cash price + inpatient charge range + Part D + Medicaid copay | STEP 2c |
| 10 | 2026 anchor facts (Part B $283, Part B premium $202.90, Part A $1,736, Part D OOP $2,100) | STEP 5 anchor facts |
| 11 | IRA = 2022 (not 2023); insulin $35 cap effective 2023-01-01 | STEP 5 anchor facts |
| 12 | IRA Round-1 drug list (10 drugs by name) | STEP 2b expanded with table + class info |
| 13 | IRA Round-1 effective 2026-01-01 | STEP 5 anchor facts |
| 14 | `iraNegotiation` block fields (maxFairPrice, listPriceBefore, effectiveDate, source, callout) | STEP 4 + GATE E worked example |
| 15 | OMIT `iraNegotiation` if drug NOT on Round-1 list | STEP 2b |
| 16 | HCPCS J-codes are public domain; NEVER CPT (AMA-licensed) | NEVERs #3 + verifier Category C |
| 17 | drugClass guidance with 17 examples + banned generic terms | STEP 5 drugClass guidance (verbatim preserved) |
| 18 | Pharmacology specificity (Statin, GLP-1, SGLT2, DPP-4, etc.) | STEP 5 |
| 19 | `routeOfAdministration` strict enum (7 values, case-sensitive, no compound) | STEP 4 + NEVERs #2 |
| 20 | LocalizedString `{en, es}` shape | STEP 4 |
| 21 | Brand names + Medicare/Medicaid US program names stay English | STEP 5 Spanish quality |
| 22 | FAQ Q/A FLAT STRINGS exception (NOT LocalizedString) | STEP 4 CRITICAL faqs shape |
| 23 | `faqs.en.length === faqs.es.length` matched count | STEP 4 |
| 24 | Patient Assistance Programs research (Lilly, Novo Nordisk, Sanofi, Merck, Pfizer, AstraZeneca, Boehringer Ingelheim, BMS) | STEP 2f (expanded with 11 verified manufacturer programs + their URLs) |
| 25 | NeedyMeds.org as PAP directory | STEP 2f |
| 26 | Common billing errors (wrong J-code, wrong unit, brand-substitution, deductible-rate-after-cap, etc.) | `commonBillingErrors` schema field preserved |
| 27 | Minimum 3 primary citations in `sources[]` | STEP 6 GATE C |
| 28 | CMS, HHS/ASPE, NeedyMeds, manufacturer as preferred sources | STEP 2g |
| 29 | No em-dashes (`—`), no en-dashes (`–`) | STEP 5 style rule 1 |
| 30 | No filler ("It's important to note", "in today's world", etc.) | STEP 5 style rule 2 |
| 31 | Lead with concrete numbers in hero, quickAnswer, FAQ | STEP 5 style rule 3 |
| 32 | Exact dollar figures ($475, not "around $500") | STEP 5 style rule 5 |
| 33 | "2026" explicit throughout for freshness | STEP 5 style rule 4 |
| 34 | Don't editorialize — factual information service | STEP 5 style rule 6 |
| 35 | "CoveredUSA" only in meta title + Analyzer CTA | STEP 5 style rule 7 |
| 36 | Spanish medical terminology ("Hipertension", "Diabetes tipo 2") | STEP 5 Spanish quality |
| 37 | JSON validity non-negotiable | STEP 7 |
| 38 | Real sources, no invented numbers | STEP 5 + NEVERs #1 + #13 |
| 39 | `meta.title.en` ≤ 70 chars; `meta.description.en` ≤ 160 chars | STEP 4 checklist (validator enforces) |
| 40 | `hero.h1` as question or statement | STEP 4 checklist |
| 41 | 2-3 introParagraphs | STEP 4 checklist |
| 42 | 3-5 pointOfPay rows | STEP 4 checklist |
| 43 | 6-8 FAQs | STEP 4 checklist |
| 44 | relatedLinks valid prefixes (no invented routes) | STEP 4 checklist |
| 45 | Last-line JSON is the only thing parsed by manager | NEVERs #18 |
| 46 | Manufacturer copay-cards blocked for Medicare beneficiaries (anti-kickback) | NEVERs #14 + STEP 3 FAQ list |
| 47 | `medicarePartD.hasSpecificCap: true` ONLY for insulin | STEP 2c + verifier Category H |

---

## SUPERSEDED (8 — old rule replaced with stricter version)

| # | OLD rule | NEW supersession | Justification |
|---|---|---|---|
| 1 | "Insulin-cost.json" as gold-standard reference | UPGRADED to "ozempic-cost.json" | Audit alignment scores: Ozempic 68%, Insulin 62%. Ozempic is the most-aligned existing page; better skeleton for new writer. |
| 2 | GoodRx mentioned in research sources only | REQUIRED structural block `pharmacyPriceComparison` with ≥4 chain rows | §4.2 Shape #2 is top-2 entailment by weight; old writer under-enforced. |
| 3 | PAP details in `patientAssistancePrograms.rows[]` with bare URL | REQUIRED `howToApplyPap` block with 3-7 numbered steps + documents + denial reasons | §3.4 + audit P0; bare URL fails the entailment shape. |
| 4 | "400% FPL" as bare string | REQUIRED `papEligibilityTable` with 9 rows (sizes 1-8 + each-additional) | §3.3 + audit P0; the canonical Bing-citable artifact for income-gated PAPs. |
| 5 | Generic/biosimilar mentioned in passing FAQ | REQUIRED `genericBiosimilarStatus` block (even if all-null) | §4.2 Shape #7 + audit P0; the block answers "is there a generic for [drug]?" |
| 6 | Coverage denial → alternatives addressed inconsistently | REQUIRED `denialAlternatives` block (appeal steps + override + PAP fallback + generic alternative) | §4.2 Shape #6 + audit P1. |
| 7 | Required sources: CMS + HHS + NeedyMeds + manufacturer | REQUIRED: above PLUS fda.gov | Audit P1; fda.gov was previously missing from required-sources list. |
| 8 | STEP 6 self-validation as "checklist of things to consider" | STEP 6 as 8 PRE-SAVE GATES framed as HARD REJECTS with "STOP. Read this twice." | B1 lesson #1; old framing was advisory, agent skipped it. |

---

## SILENTLY DROPPED (0)

**None.** Every rule from the old writer is either preserved verbatim or superseded with explicit justification.

---

## Severity analysis

Even the 8 SUPERSEDED items aren't "drops" — they're tightenings. The new writer is a strict super-set of the old writer's content rules, plus 5 new structural blocks + 8 GATE-framed pre-save checks.

---

## Conclusion

**Differential audit passes.** Zero silent drops. Phase 4 (5 test articles) can proceed.

Memory entry on completion should call out two things future maintainers will need:
1. Old writer's `insulin-cost.json` structural reference was upgraded to `ozempic-cost.json` (better alignment score).
2. Old writer's PAP-as-bare-URL pattern is gone — replaced with the `howToApplyPap` numbered-step block. Existing 3 drug pages do NOT have this block (audit gap); a Track E refresh pass should regen them.
