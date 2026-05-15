# Verifier B — MA-state writer cold sketch (Track C, Phase 3)

**Author:** Verifier B (designed from scratch, did NOT read the new draft)
**Date:** 2026-05-14
**Source corpus consulted:** FANOUT_FORMULA §3 + §4.8, `_universal-rules-block.md`, AI_OPTIMIZATION_FRAMEWORK §4 + §5.7 + §8.3, `audit-ma-state-writer.json`, TRACK_C_PARALLEL_PLAN §5.1 + §7, `feedback_b1_blog_writer_shipped.md`, `medicare-advantage.ts` interface, `california.json` gold standard.

This is what I would write if I had to author the writer from scratch with only the source docs. Used by Phase 3 as a fresh-eyes differential against the new draft.

---

## 0. The cron contract (cannot change)

The writer MUST return JSON parseable by the bulkgen cron and MUST atomically write a single file. Hard contracts:

1. **Final tool message is JSON** with at minimum `{slug, status, file, ...}`. Status values: `"ok"`, `"failed_validation"`, `"failed_input"`. Cron logs status; downstream Track D depends on it.
2. **Atomic write protocol:** Write `content/data/medicare-advantage/<slug>.tmp.json` first. Run all GATES against the tmp file. ONLY rename to `<slug>.json` after every GATE passes. If any GATE fails, leave tmp in place, return `failed_validation` with `gateFailed` field naming the failed gate(s).
3. **STEP N numbered headings** in the writer prompt — cron's logger parses for `## STEP \d+` to attribute timing per phase. Don't rename to "Phase" or "Stage."
4. **Schema conformance:** every emitted JSON must validate against `MedicareAdvantageState` (slug, stateName/LocalizedString, stateAbbreviation/2-letter, topic, medicalSpecialty, ctaTarget, lastUpdated/ISO, readingTime, meta, hero, quickAnswer, introParagraphs[≥3], marketOverview, planTypes, countyVariance optional, whatToLookFor, importantDates, stateExtras optional, detailSections[≥2], faqs.{en,es}, relatedLinks, sources[≥3]).
5. **Inputs:** `STATE_NAME`, `STATE_SLUG`, `STATE_ABBREVIATION`, optional `NOTES`. No per-row payload like daily blog. Writer infers all numeric facts via research + cross-verification against current CMS/KFF/state DOI.

---

## 1. Section list (the prompt skeleton)

```
# CoveredUSA MA-state writer

@.claude/agents/_universal-rules-block.md   ← embed verbatim, do NOT paraphrase

## ROLE & MISSION
## INPUTS
## REQUIRED OUTPUT (schema reference)
## STEP 0 — Verify inputs + load gold standard
## STEP 1 — Research the state's MA market (anchor facts)
## STEP 2 — Plan the page (H2 map, FAQ topics, table strategy)
## STEP 3 — Write English content
## STEP 4 — Write Spanish content (parity pass)
## STEP 5 — Assemble the JSON
## STEP 6 — CRITICAL PRE-SAVE GATES (HARD REJECT)
## STEP 7 — Atomic save + return JSON
## CRITICAL BOUNDARIES (NEVERs)
## ROLLBACK
```

This mirrors B1's shipped pattern. Section count is 8 STEP headings + bookends. Length target: ~4,000-5,000 words including the embedded universal block.

---

## 2. STEP-by-STEP content

### STEP 0 — Verify inputs + load gold standard
- Confirm STATE_NAME present, STATE_SLUG matches `^[a-z][a-z-]{1,30}$` and contains NO year.
- Read `content/data/medicare-advantage/california.json` for shape inheritance.
- Re-read `_universal-rules-block.md` (already embedded but reread for working memory).
- Establish: target word count 1800-2500 (CA=2500, WY=1800), reading time = ceil(words/200).

### STEP 1 — Research (anchor facts the writer cannot make up)
List the **anchor facts** the writer MUST source from authoritative live sources before writing prose. None of these are negotiable:

| Fact | Source priority |
|---|---|
| Total MA plans available statewide 2026 | CMS Medicare Plan Finder Q4 2025 → KFF MA Spotlight 2026 |
| Enrolled MA beneficiaries 2026 | KFF MA enrollment by state |
| Statewide MA penetration % | KFF |
| Statewide weighted avg monthly premium | KFF / CMS landscape file |
| Statewide weighted avg Star Rating | CMS Quality Rating System |
| Top 5-10 carriers by plan count | CMS landscape file |
| Per-carrier avg Star + premium + plan count | CMS landscape file |
| County-level variance (≥3 counties for big states) | CMS county-level landscape |
| 2026 Part B premium ($202.90) | medicare.gov |
| 2026 Part D OOP cap ($2,100) | medicare.gov / IRA |
| MOOP 2026 in-network maximum ($9,250) | CMS |
| AEP 2026 (Oct 15 - Dec 7, 2026 → coverage Jan 1, 2027) | medicare.gov |
| MA-OEP 2027 (Jan 1 - Mar 31, 2027) | medicare.gov |
| State DOI / state SHIP / state-specific Medicaid agency for D-SNP | per-state portal |

Writer must cite ≥3 of these inline with full URL anchor text containing the source domain (RULE 5 + GATE C).

### STEP 2 — Plan the page (H2 map for §4.8)
Required H2/section map — each maps to a §4.8 dominant shape:

| § | Required section | Schema field | Bing-validated? |
|---|---|---|---|
| 4.8.1 | AEP / MA-OEP / IEP / SEP dates | `importantDates` | yes |
| 4.8.2 | Plan count + top carriers + state | `marketOverview` + `planTypes` | yes |
| 4.8.3 | Star Ratings + state + 2026 | `marketOverview.averageStarRating` + dedicated `detailSection` "How Star Ratings work in [State]" | yes |
| 4.8.4 | $0 premium plans + state + 2026 | NEW required `detailSection` heading "$0 premium Medicare Advantage plans in [State] for 2026" with embedded table (carrier / plan / counties / star) | yes — closes audit gap #3 |
| 4.8.5 | MA vs Medigap + state | `detailSection` "Medicare Advantage vs Original Medicare in [State]" | yes |
| 4.8.6 | How to enroll + state + .gov + numbered steps + docs + denial reasons | NEW required `detailSection` heading "How to enroll in [State] Medicare Advantage" with embedded HowTo block | yes — closes audit gap #1 |
| 4.8.7 | SNPs eligibility | `detailSection` + dedicated FAQ | partial |
| 4.8.8 | County variance (when ≥10 counties of variance) | `countyVariance` | yes |

FAQs (8 required, EN+ES parity):
1. When can I enroll in a Medicare Advantage plan in [State]?
2. How do I enroll in [State] Medicare Advantage step by step?
3. What's the difference between HMO and PPO plans in [State]?
4. Are there free ($0 premium) MA plans in [State] for 2026?
5. What is a D-SNP / C-SNP and am I eligible in [State]?
6. Can I switch from Original Medicare to Medicare Advantage in [State]?
7. Do [State] MA plans cover dental, vision, hearing in 2026?
8. What happens to my [State] MA plan if I move?

### STEP 3 — Write English content
- Apply RULE 1, 2 (N/A — see §3 below), 3, 4, 5 from `_universal-rules-block.md`.
- Apply Framework §5.7 pronoun discipline as a **first-class rule**, not inheritance: every paragraph (introParagraphs, detailSections.paragraphs, FAQ answers, importantDates.intro, countyVariance.intro, stateExtras.intro, whatToLookFor.intro) **MUST open with a named entity**. Permitted openers: state name, carrier name, program name ("Medicare Advantage", "Medi-Cal D-SNP"), CMS, "[State] beneficiaries", concrete noun phrase. **Forbidden openers:** It, They, This, These, Those, Here, There, Such, Many, Some, Most (when used as bare pronouns).
- Paragraph length 150-300 words. FAQ answers 80-150 words.
- Inline `**bold**` density 5-10% on entities, dollar figures, dates.
- Year-anchoring rule (RULE 4): never write `$X` or `Y%` without a year in the same sentence or table caption.

### STEP 4 — Spanish parity
- Every `LocalizedString` populated with `en` AND `es`.
- Use Spanish program names: "Período Anual de Elección" (AEP), "Período Inicial de Elección" (IEP), "Plan de Necesidades Especiales" (SNP), "Plan de Necesidades Especiales para Doble Elegibles" (D-SNP).
- Spanish state name only when it differs (Pensilvania, Hawái, Carolina del Norte). Default to keeping English state name (California, Florida, Texas, Ohio).
- No machine-translation passthrough. No fake-Spanish source citations — keep English source URLs.

### STEP 5 — Assemble the JSON
- Set `slug` = STATE_SLUG (validate no year via `\b(19|20)\d{2}\b`).
- Set `stateAbbreviation` = uppercase 2-letter.
- Set `topic` = `"Medicare Advantage"`.
- Set `medicalSpecialty` = `"Geriatrics"`.
- Set `ctaTarget` = `"screener"`.
- Set `lastUpdated` = today's ISO date.
- Set `readingTime` = `"<N> min read"`.

### STEP 6 — CRITICAL PRE-SAVE GATES (HARD REJECT)

Open with literal "STOP. Read this twice." framing. Each gate has a regex / count / pattern check:

**Universal gates (B1 carry-forward):**
- **GATE A (slug-no-year):** `slug.match(/\b(19|20)\d{2}\b)` → must be null.
- **GATE B (household-size table):** **N/A for MA-state.** Medicare is age/disability-gated, NOT income-gated. Skip GATE B per TRACK_C_PARALLEL_PLAN §7. Document explicitly in writer prompt: "GATE B does not apply because Medicare Advantage eligibility is not income-based. The only income-gated MA artifact is D-SNP, and D-SNP eligibility intersects with state Medicaid which is covered by the separate Medicaid factory in Track D."
- **GATE C (.gov citation density):** count inline outbound links with anchor text containing `medicare.gov`, `cms.gov`, `kff.org`, `medicaid.gov`, or state DOI/HHS domain. Must be ≥3, with at minimum: 1 federal source + 1 state agency + 1 third-party (KFF). Plain-text mentions don't count — must be hyperlinked in source data (`sources[]` urls + inline anchor text in `paragraphs`).
- **GATE D (no `--` double-hyphen):** `JSON.stringify(output).indexOf('--') === -1`. AND `JSON.stringify(output).indexOf('—') === -1` (literal em-dash U+2014).

**MA-state-specific gates (audit-driven):**
- **GATE MA-1 (state-context-everywhere):** scan every section header, every paragraph opener, every table caption (planTypes.footnote, marketOverview.source, planTypes.source, countyVariance.source, whatToLookFor.intro, **importantDates.intro**, stateExtras.intro), every FAQ question. STATE_NAME must appear in:
  - title.{en,es} ✓
  - h1.{en,es} ✓
  - meta.description.{en,es} ✓
  - quickAnswer.{en,es} first sentence ✓
  - **importantDates.intro.{en,es}** — closes audit boundary leak #1
  - **planTypes.source** — must include state context in source string (e.g., `"KFF Medicare Advantage 2026 California Spotlight"` not `"KFF Medicare Advantage 2026 Spotlight"`) — closes audit boundary leak #2
  - **marketOverview.source** — same state-tagging rule
  - countyVariance.source (when present) — same
  - First sentence of every detailSection.paragraphs[0] — closes pronoun + state combo gap
- **GATE MA-2 (pronoun discipline):** for every paragraph string in introParagraphs, detailSections.paragraphs, importantDates.intro, FAQ answers, stateExtras.items.description, whatToLookFor.intro, countyVariance.intro: split on `\n` or `. ` to get sentences; first sentence must NOT match `^(It|They|This|These|Those|Here|There|Such|Many|Some|Most|Here's|There's)\b`. If it does, fail with `gateFailed: "MA-2"` and report the offending paragraph location.
- **GATE MA-3 (year-anchoring of dollar/% figures):** any `$\d+` or `\d+%` in body content must have a year (`\b20\d{2}\b`) in the same sentence OR in the immediately enclosing table caption. Run on flattened paragraph + table cell text.
- **GATE MA-4 (required §4.8 sections present):** detailSections array MUST contain (case-insensitive substring match on heading.en):
  - "How to enroll in [STATE_NAME] Medicare Advantage" — closes audit gap #1
  - "$0 premium" AND "[STATE_NAME]" in same heading — closes audit gap #3
  - "vs Original Medicare" OR "vs Medigap" — already passes
  - "Star Ratings" — already passes
- **GATE MA-5 (How-to-enroll completeness):** the "How to enroll" detailSection MUST contain:
  - 5-7 numbered steps (regex `^\d\.` count)
  - inline link to medicare.gov/plan-compare in `paragraphs` or `list`
  - "Documents needed" sub-list with 4-8 items
  - "Common reasons enrollment is denied or delayed" sub-list with 3-5 items (D-SNP Medicaid lapse, service area mismatch, late IEP, ineligible SEP, etc.)
- **GATE MA-6 ($0 premium table completeness):** the "$0 premium plans" detailSection MUST include a `table` with ≥4 rows and headers `["Carrier", "Plan Name", "Counties Available", "Star Rating"]` (or Spanish equivalent). Year in caption.
- **GATE MA-7 (Spanish parity):** every `LocalizedString` has both en and es non-empty. faqs.en.length === faqs.es.length === 8.
- **GATE MA-8 (em-dash zero):** count of U+2014 in JSON.stringify(output) === 0. (Restated separately because em-dash is the most-violated style rule.)
- **GATE MA-9 (anchor fact accuracy):** spot-check that quickAnswer.en mentions: total plans count, AEP date `October 15 - December 7, 2026`, statewide avg premium, top 1-2 carriers. Hardcoded facts must match marketOverview block exactly (no drift between hero/quick-answer numbers and marketOverview numbers).
- **GATE MA-10 (sources count):** `sources.length >= 3` AND each source has populated `name`, `url`, `note.{en,es}`.

If ANY gate fails: do NOT rename .tmp.json → .json. Return JSON `{slug, status: "failed_validation", file: "<slug>.tmp.json", gateFailed: ["GATE-X", ...], reason: "..."}`. Do NOT silently delete tmp file — leave it for debugging.

### STEP 7 — Atomic save + return JSON

```js
// pseudocode the writer must follow
fs.writeFileSync(`${dir}/${slug}.tmp.json`, JSON.stringify(output, null, 2));
const gates = runAllGates(output);
if (gates.failed.length === 0) {
  fs.renameSync(`${dir}/${slug}.tmp.json`, `${dir}/${slug}.json`);
  return { slug, status: "ok", file: `${slug}.json`, wordCountEn, gatesPassed: gates.passed };
} else {
  return { slug, status: "failed_validation", file: `${slug}.tmp.json`, gateFailed: gates.failed, reason: gates.reasons };
}
```

The `{slug, status, file, ...}` shape is the cron contract — additive fields (gatesPassed, wordCountEn, gateFailed, reason) are fine.

---

## 3. RULE 2 (household-size table) — explicit N/A handling

The writer prompt MUST include a one-paragraph carve-out:

> "RULE 2 (eligibility household-size table) does NOT apply to this template. Medicare eligibility is age (65+) or disability based, not income based. Do not invent an income table for MA. The closest income-related artifact is D-SNP eligibility, which intersects with state Medicaid — but that lives on the separate `/medicaid-income-limits/[state]` factory pages (Track D). On THIS template, mention D-SNP eligibility prose-only in the SNP detailSection, with a cross-link to the relevant state Medicaid page in `relatedLinks`. Do NOT include a `householdSizeTable` field."

This is the cleanest way to prevent the writer from "filling in" a table to satisfy a universal rule that doesn't apply here, AND to satisfy TRACK_C_PARALLEL_PLAN §7 which explicitly says "skip GATE B for ma-state."

---

## 4. Pronoun discipline (Framework §5.7) — making it permanent

The audit's biggest fragility is that pronoun discipline currently passes only because california.json (the gold standard) happens to model the right pattern. One regression in the writer prompt or one new state where the writer opens with "CMS publishes..." breaks ~40 paragraphs of inheritance.

Fix: hard-code the rule in three places.

1. **STEP 3 instruction** (style section): "Every paragraph MUST open with a named entity. Permitted: state name, carrier name, program name ('Medicare Advantage', 'Medi-Cal D-SNP'), CMS, 'California beneficiaries', concrete noun phrase. Forbidden: It, They, This, These, Those, Here, There, Such (when used as bare pronouns)."
2. **STEP 6 GATE MA-2** (regex check): `^(It|They|This|These|Those|Here|There|Such|Many|Some|Most|Here's|There's)\b` against first sentence of every paragraph string. Hard reject.
3. **Worked examples** in the prompt:
   - ❌ "These plans cover dental in 2026."
   - ✓ "California Medicare Advantage plans cover dental in 2026."
   - ❌ "It's important to enroll during AEP."
   - ✓ "California beneficiaries should enroll during the Annual Election Period (October 15 - December 7, 2026)."
   - ❌ "CMS publishes..." (allowed — CMS is a named entity)
   - ✓ "CMS publishes Star Ratings each October..."

Worked examples matter — B1 lesson #1 was that abstract rules without examples don't bind.

---

## 5. State-context-everywhere boundary leaks (audit gap)

Three specific places the audit flagged as state-agnostic across all 3 existing pages (CA, TX, WY). Writer prompt must call them out by NAME, not just rely on "state in every H2":

1. **`importantDates.intro.{en,es}`** — currently boilerplate "Medicare and Medicare Advantage have several enrollment windows." MUST be: "California Medicare and Medicare Advantage beneficiaries have several enrollment windows in 2026 and 2027." (state + year + "beneficiaries" or equivalent)
2. **`marketOverview.source` and `planTypes.source`** — currently "KFF Medicare Advantage 2026 Spotlight." MUST be: "KFF Medicare Advantage 2026 [STATE_NAME] Spotlight" or "CMS Medicare Plan Finder Q4 2025 — [STATE_NAME] landscape file". State-tagged source citations are the lookup-canonical phrasing per §3.10.
3. **`countyVariance.source`** (when section present) — same rule.

Each of these is checked in GATE MA-1.

---

## 6. CRITICAL BOUNDARIES (NEVERs — anti-patterns to forbid)

The writer prompt must end with a "NEVER" block:

- **NEVER write a year in the slug.** `california-medicare-advantage-2026` ❌; `california` ✓.
- **NEVER use em-dash `—` (U+2014) or `--`.** Use commas, periods, or parentheses. En-dash `–` is allowed in numeric ranges only (`$400–$3,500`).
- **NEVER invent an MA-specific household-size income table.** Medicare is not income-gated. RULE 2 is N/A.
- **NEVER open a paragraph with It / They / This / These / Those / Here / There / Such.** Lead with named entity.
- **NEVER write a dollar amount or percentage without a year in the same sentence or table caption.**
- **NEVER omit the "How to enroll in [STATE] Medicare Advantage" detailSection** — required by GATE MA-4.
- **NEVER omit the "$0 premium plans in [STATE] for 2026" detailSection with table** — required by GATE MA-4 + MA-6.
- **NEVER write `importantDates.intro` as state-agnostic boilerplate** — must reference [STATE_NAME] + year (GATE MA-1).
- **NEVER write `marketOverview.source` or `planTypes.source` without state context** — must include [STATE_NAME] (GATE MA-1).
- **NEVER fabricate Spanish primary sources.** Keep English URLs; translate the `note.{es}` description.
- **NEVER hallucinate plan counts, premiums, Star Ratings, or carrier rankings.** Cross-check every numeric claim against CMS landscape file or KFF before writing. If unverifiable, omit rather than guess.
- **NEVER skip the atomic write protocol.** No direct write to `<slug>.json`. Always tmp → validate → rename.
- **NEVER silently fail a gate.** Return `failed_validation` with `gateFailed` array — don't pretend gates passed.
- **NEVER rename schema fields** (slug, stateName, marketOverview, planTypes, etc.) — schema is contract.
- **NEVER add a `householdSizeTable` field** — schema doesn't define it for MA-state.
- **NEVER copy California's specific facts to another state.** Each state's anchor facts (plan count, carriers, premium, Stars) must be researched fresh for that state.

---

## 7. JSON return shape (preserve cron contract)

```json
{
  "slug": "florida",
  "status": "ok",
  "file": "florida.json",
  "wordCountEn": 2350,
  "readingTimeMinutes": 12,
  "gatesPassed": ["A", "C", "D", "MA-1", "MA-2", "MA-3", "MA-4", "MA-5", "MA-6", "MA-7", "MA-8", "MA-9", "MA-10"],
  "gatesSkipped": ["B"],
  "topicCluster": "medicare-advantage-florida",
  "keyTerms": ["florida medicare advantage", "florida medicare advantage plans 2026", "best medicare advantage plans florida"]
}
```

On failure:

```json
{
  "slug": "florida",
  "status": "failed_validation",
  "file": "florida.tmp.json",
  "gateFailed": ["MA-1", "MA-4"],
  "reason": "importantDates.intro is state-agnostic; missing How-to-enroll detailSection"
}
```

Cron-relevant required keys: `slug`, `status`, `file`. Everything else is additive context for the bulkgen log.

---

## 8. Rollback (every writer needs this)

At end of prompt, document the rollback command (for future Frank/agent that needs it):

```bash
cd /Users/jacobposner/clawd
cp .claude/agents/coveredusa-ma-state-writer.bak.md \
   .claude/agents/coveredusa-ma-state-writer.md
```

---

## 9. Word budget for the writer prompt

- ROLE/MISSION + INPUTS + OUTPUT + STEP 0: ~400 words
- STEP 1 (research): ~400 words
- STEP 2 (planning): ~500 words
- STEP 3 (English): ~700 words
- STEP 4 (Spanish): ~250 words
- STEP 5 (assemble): ~250 words
- STEP 6 (GATES) — the densest section: ~1,400 words
- STEP 7 (save): ~150 words
- CRITICAL BOUNDARIES + NEVER list: ~400 words
- Embedded `_universal-rules-block.md`: ~600 words

Total target: ~5,000 words. B1's shipped writer is ~4,500. The MA-state version is slightly longer because of the 10-gate STEP 6.

---

## 10. Differential value vs current (per audit)

If the new draft hits all of:
- Hard `_universal-rules-block.md` embed
- §4.8 H2 map including required How-to-enroll + $0 premium sections
- 10 GATES at STEP 6 with HARD REJECT framing
- Pronoun rule codified + worked examples
- State-context boundary fixes (importantDates.intro + sources state-tagged)
- Atomic save protocol
- N/A carve-out for RULE 2
- JSON return shape preserved
- All NEVERs from §6

… then it closes every gap the audit flagged + carries forward all 8 lessons from B1. That's the bar.

If the new draft is missing any of:
- The atomic write protocol (B1 lesson #4 — hard contracts cannot break)
- "STOP. Read this twice." framing on STEP 6 (B1 lesson #1)
- Worked examples for pronoun rule (B1 lesson #1)
- N/A carve-out for RULE 2 (template-specific)
- The 4 audit-flagged required detailSections (How-to-enroll, $0 premium, MA vs Medigap, Star Ratings)

… then it'll regress somewhere downstream when bulkgen scales to 48 states.

---

*End of cold sketch. ~2,000 words. Not a draft to ship — a comparator for Phase 3 differential review.*
