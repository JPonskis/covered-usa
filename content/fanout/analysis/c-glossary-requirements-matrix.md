# Glossary Writer Requirements Matrix — Phase 1 (Track C-prime)

**Date:** 2026-05-15
**Phase:** 1 (planner)
**Inputs synthesized:** PRD (`specs/track-c-prime/glossary-prd.md`), audit JSON (`content/fanout/analysis/audit-glossary-writer.json`), FANOUT_FORMULA §3 + **§4.5** (DOWNSCOPE), LINK_TARGET_MANIFEST §5, master brief TRACK_C_PARALLEL_PLAN §3.5/§5.7/§6/§7, _universal-rules-block.md, `glossary.ts` schema, current writer/verifier prompts.
**Output:** 54 atomic requirements across 9 categories. **The dominant theme is SUBTRACTION.** Resolve at end before drafting writer.

---

## 0. Strategic posture (read this first)

Glossary is the **only** Track C-prime template where the work is mostly **deletion**, not addition. Per §4.5: 1 of 8 Bing-validated shapes, only 4 MAGI queries in 2 months across all of BenefitsUSA, primary strategic role is **internal-link target**, NOT citation magnet. Every existing page (MAGI 1,298 / Deductible 1,078 / OOP-max 683 EN words rendered-prose count) is OVER the 500-word ceiling. The §4.5 explicit warning belongs verbatim at the TOP of the new writer prompt.

The audit's verdict: **"DOWNSCOPE_AGGRESSIVELY."** This matrix encodes that as 54 enforceable requirements.

---

## 1. Universal rules (§3.1 – §3.10 from `_universal-rules-block.md`)

| # | Rule | Applies to glossary? | Source | Enforcement |
|---|---|---|---|---|
| 1.1 | §3.1 Year markers in title/H1/meta + every numeric value | YES, ALWAYS | universal-rules | STEP 4 checklist + GATE D (style auto-fix) |
| 1.2 | §3.2 State-context-everywhere | N/A — glossary terms aren't state-scoped | §4.5 + audit B.4.5 | Verifier marks `gates.b: "n/a"` for most terms |
| 1.3 | §3.3 Household-size eligibility table | **CONDITIONAL** — only when term is income-anchored (PTC, MAGI, FPL) | audit A.3.3 + PRD §5 GATE B | Conditional gate — see §6 below |
| 1.4 | §3.4 How-to-apply numbered steps | **CONDITIONAL** — only for terms with an actual enrollment flow (PTC application, SEP filing, OEP enrollment). SKIP for purely definitional terms (copay-vs-coinsurance, in-network-vs-out-of-network) | audit A.3.4 + PRD §3 | Conditional; verifier doesn't HOLD if missing for definitional terms |
| 1.5 | §3.5 Comparison framing for adjacent concepts | YES — every glossary term has a near-neighbor concept | audit A.3.5 + PRD §3 | Built into detailSection (MAX 1, comparison-shaped acceptable) |
| 1.6 | §3.6 Authoritative source narrowing (HealthCare.gov / Medicare.gov / CMS / IRS / KFF inline) | YES | universal-rules | STEP 4 + GATE C (≥3 .gov) |
| 1.7 | §3.7 State-named program brands when term applies to MAGI-Medicaid eligibility (Medi-Cal, AHCCCS, MNsure, BadgerCare, etc.) | **CONDITIONAL** — fires only for MAGI/PTC/income-anchored terms | audit A.3.7 + PRD §3 + universal-rules brand list | Soft requirement — mention ≥2 brand names for MAGI-relevant terms |
| 1.8 | §3.8 Eligibility entailment (numeric thresholds in FAQs) | CONDITIONAL — for eligibility terms | audit A.3.8 | One FAQ should answer "do I qualify for…" with the numeric threshold |
| 1.9 | §3.9 Demographic specificity | WEAK — glossary is too short for this | audit A.3.9 | Skip — too much volume for this template |
| 1.10 | §3.10 "Chart" / "guidelines" / "by [X]" table phrasing | YES — when emitting numeric table | audit A.3.10 | Table captions use "chart" / "by household size" / "by year" phrasing |

---

## 2. §4.5 recipe (DOWNSCOPE-FIRST)

| # | Requirement | Source | Enforcement |
|---|---|---|---|
| 2.1 | **Hard-cap ≤500 EN words** rendered prose (definition + quickDefinition + hero.subhero + introParagraphs + annualLimits.footnote + workedExample.intro/footnote + detailSections paragraphs + faqs.en[].question + faqs.en[].answer). Excludes frontmatter / link anchor text / source citation labels. | §4.5 + audit D + PRD §3 + PRD §6 GATE E | **GATE E — DOMINANT.** Mechanical Node count in STEP 6. HOLD if >500. |
| 2.2 | `definition.en` ≤80 words AND lead with substantive noun-phrase claim | PRD §6 GATE F | GATE F — HOLD if >100 words OR throat-clearing lead |
| 2.3 | `quickDefinition.en` 3-4 sentences max, same core claim as `definition` (near-verbatim restatement + 1-2 sentences of expansion) | audit C + PRD §3 + current-writer step-3 | STEP 4 checklist (derivation order: definition → quickDefinition → hero.subhero) |
| 2.4 | `introParagraphs: []` (literal empty array — required by schema, MUST NOT populate) | PRD §2 + audit D removedFields | STEP 4 checklist + GATE-E mechanical check (any `introParagraphs[*].en` content counts toward word count) |
| 2.5 | `detailSections.length ≤ 1` (was MIN 2 in old writer). If included, must be COMPARISON-shaped or LOOKUP-shaped — NEVER history / mechanics / why-it-exists | §4.5 + audit C + PRD §6 GATE H | GATE H — HOLD if 2+ detail sections |
| 2.6 | `faqs.en.length` ∈ [3, 4] (was 6-8 in old writer). Each answer 40-100 words, lookup-shaped, self-contained, not concept-restating | §4.5 + audit C + PRD §3 | STEP 4 checklist |
| 2.7 | `faqs.en.length === faqs.es.length` matched count | universal | STEP 4 checklist |
| 2.8 | `annualLimits` OPTIONAL — include ONLY when term has year-anchored numeric thresholds. NEVER fabricate to fill schema slot. | §4.5 + PRD §3 + PRD §8 failure mode #7 | STEP 4 conditional + verifier "don't fabricate" check |
| 2.9 | `workedExample` OPTIONAL — include ONLY when term has a calculation | §4.5 + PRD §3 | STEP 4 conditional |
| 2.10 | `whatCountsToward` / `whatDoesNotCountToward` OPTIONAL — only for boundary-sensitive COST terms (OOP max, deductible). DROP for definitional terms. | §4.5 + audit D + PRD §2 | STEP 4 conditional |
| 2.11 | `readingTime` should be SHORT ("2 min read" or "3 min read") — NEVER "5 min read" | PRD §2 | STEP 4 checklist |

---

## 3. Internal link routing (template's PRIMARY strategic value)

| # | Requirement | Source | Enforcement |
|---|---|---|---|
| 3.1 | Load `content/link-index.json` before writing body prose | LINK_TARGET_MANIFEST §5 + PRD §4 WE-2 | STEP 2 (Research) |
| 3.2 | Emit **≥3 inline body links** matching `link-index.byPhrase[<locale>]` keys, pointing at canonical lighthouse paths (`/federal-poverty-level`, `/medicaid-income-limits`, `/medicare-eligibility`, `/aca-income-limits`, `/medical-bill-analyzer`) | LINK_TARGET_MANIFEST §5 + PRD §6 GATE G | **GATE G — HOLD if 0 inline links; WARN if 1-2.** Inline = body prose, table cells, FAQ answers (NOT H1/H2/H3, NOT `relatedLinks` footer) |
| 3.3 | **MAX 5** inline body links per page | LINK_TARGET_MANIFEST §5 | STEP 6 cap check |
| 3.4 | Hyperlink only **FIRST occurrence** of each phrase per page | LINK_TARGET_MANIFEST §5 | STEP 5 implementation rule |
| 3.5 | Never self-link (a glossary page never links to itself) | LINK_TARGET_MANIFEST §5 | STEP 5 implementation rule |
| 3.6 | `topicCluster: string` (slug-style; one cluster per page; e.g., `"glossary"` for definitional terms or `"premium-tax-credit"` for income-anchored income clusters) | LINK_TARGET_MANIFEST §1 + PRD §2 | STEP 4 checklist (NEW field) |
| 3.7 | `keyTerms: {en: string[], es: string[]}` — 3-8 phrases per locale. NOT a flat array. | LINK_TARGET_MANIFEST §1 + audit + PRD §9 patch | STEP 4 checklist with shape example |
| 3.8 | `isLighthouse: false` (every glossary page is a spoke) | LINK_TARGET_MANIFEST §1 + PRD §2 | STEP 4 checklist (literal false) |
| 3.9 | `isDeprecated: false` | LINK_TARGET_MANIFEST §1 + PRD §2 | STEP 4 checklist (literal false) |
| 3.10 | `relatedLinks` 2-4 footer entries with valid prefixes (`/screener`, `/medical-bill-analyzer`, `/medicaid-income-limits`, `/medicare-eligibility`, `/aca-income-limits`, `/federal-poverty-level`, `/cost/<slug>`, `/drug/<slug>`, `/qa/<slug>`, `/glossary/<slug>`, `/for/<slug>`, `/event/<slug>`) — these do NOT count toward GATE G | current-writer + PRD §2 | STEP 4 checklist |

---

## 4. Schema hard contracts (`glossary.ts` `Glossary` interface)

| # | Requirement | Source | Enforcement |
|---|---|---|---|
| 4.1 | `slug` lowercase + hyphens, also JSON filename | glossary.ts | STEP 0 (atomic write) |
| 4.2 | `term: LocalizedString` — use SPELLED-OUT form with parenthetical acronym (e.g., "Premium Tax Credit (PTC)"). Acronyms go in `alternateNames`, NOT as primary term | current-writer + PRD §2 | STEP 4 checklist |
| 4.3 | `alternateNames: string[]` — 3-6 entries typical | current-writer | STEP 4 checklist |
| 4.4 | `definition: LocalizedString` — 1-2 sentences, schema source of truth, becomes `DefinedTerm.description` AI engines cite | glossary.ts + current-writer | STEP 4 + GATE F |
| 4.5 | `category` locked enum: ACA / Medicare / Medicaid / Insurance / Tax / Billing / Coverage | glossary.ts | STEP 4 (assigned from queue input) |
| 4.6 | `ctaTarget` locked enum: screener / analyzer | glossary.ts | STEP 4 (queue authoritative) |
| 4.7 | `topic` string for `schema.about` | glossary.ts | STEP 4 |
| 4.8 | `medicalSpecialty` typically `"PublicHealth"` | glossary.ts | STEP 4 |
| 4.9 | `lastUpdated` ISO date YYYY-MM-DD | glossary.ts | STEP 4 |
| 4.10 | `meta.title.en` ≤ 70 chars; `meta.description.en` ≤ 160 chars | glossary.ts + validator | STEP 4 + STEP 6 length check |
| 4.11 | `hero.h1` typically "What Is [Term]?"; `hero.subhero` 1-2 sentences condensing definition + key number | current-writer + audit C | STEP 4 |
| 4.12 | `quickDefinition: LocalizedString` 3-4 sentences max | current-writer + PRD §2 | STEP 4 |
| 4.13 | `introParagraphs: LocalizedString[]` — emit literal `[]` (back-compat signal; schema requires the field, downscope strategy is to leave empty) | PRD §2 hard contract | STEP 4 + GATE E penalty if populated |
| 4.14 | `detailSections: DetailSection[]` — MAX 1; if included, must have `heading`, 1-2 short paragraphs, optional list, optional table (comparison or lookup shape) | glossary.ts + PRD §6 GATE H | GATE H |
| 4.15 | `faqs` = `{en: LocalizedFAQ[], es: LocalizedFAQ[]}` where `LocalizedFAQ = {question: string, answer: string}` (FLAT strings — most common drafter mistake) | glossary.ts + current-writer | STEP 4 CRITICAL faqs shape callout |
| 4.16 | `relatedLinks: RelatedTerm[]` 2-4 entries | glossary.ts + current-writer | STEP 4 |
| 4.17 | `sources: GlossarySource[]` ≥3 primary citations | glossary.ts + current-writer | STEP 4 + GATE C |
| 4.18 | Additive Track C-prime fields: `topicCluster: string`, `keyTerms: {en: string[], es: string[]}`, `isLighthouse: false`, `isDeprecated: false` (MANDATORY EMIT — schema is forward-compat with Track A1; validator will warn if missing) | LINK_TARGET_MANIFEST §1 + PRD §2 | STEP 4 MANDATORY-EMIT callout (same framing pattern as drug writer's MANDATORY STRUCTURAL BLOCKS) |

---

## 5. Universal GATES (master brief §7 + PRD §5)

| # | Gate | Routing | Verifier action |
|---|---|---|---|
| 5.1 | GATE A — slug must NOT contain a year (`magi-2026` BANNED; valid: `magi`, `premium-tax-credit`, `open-enrollment-period`) | HOLD on fail | Writer prevents at STEP 0; verifier double-checks |
| 5.2 | GATE B — household-size table — **N/A for most glossary**; conditional for income-anchored (PTC, MAGI, FPL) | LOW flag if income-anchored without table; PASS for definitional | Verifier marks `gates.b: "n/a"` or `"warn"` |
| 5.3 | GATE C — ≥3 inline outbound `.gov` / `.edu` / `kff.org` citations | HOLD if 0-1; WARN if exactly 2 | Verifier counts inline anchors |
| 5.4 | GATE D — zero `--` (double-hyphen) anywhere | AUTO-FIX as style correction; NEVER HOLD | Verifier auto-fixes per GATE D hoist patch (Track C-prime patch 3) |

---

## 6. Glossary-specific GATES (PRD §6)

| # | Gate | Routing | Verifier action |
|---|---|---|---|
| 6.1 | **GATE E — Word count ≤500 EN words (DOMINANT)** | HOLD if >500 | Verifier runs Node word-count one-liner; force-flag if writer self-reported but actual count exceeds |
| 6.2 | GATE F — `definition.en` ≤80 words AND lead with substantive noun-phrase | HOLD if >100; WARN if 81-100 | Verifier counts + checks lead pattern |
| 6.3 | GATE G — ≥3 inline body links to lighthouses | HOLD if 0; WARN if 1-2 | Verifier counts hyperlinks in body prose (NOT relatedLinks footer) |
| 6.4 | GATE H — `detailSections.length ≤ 1` | HOLD if 2+ | Verifier counts |

---

## 7. Prohibited slugs (Track E only — STRICT)

| # | Requirement | Source | Enforcement |
|---|---|---|---|
| 7.1 | Writer MUST reject slugs `magi`, `deductible`, `out-of-pocket-maximum` immediately. Return `{slug, status: "error", error: "track-c-prohibited-slug: <slug> belongs to Track E downsize"}` | PRD §0.1 + PRD §8 failure mode #5 | STEP 0 pre-flight check (defense-in-depth at writer side) |
| 7.2 | Verifier MUST also reject if input file path matches one of the 3 prohibited slugs | PRD §9 routing | Verifier STEP 0 |
| 7.3 | Phase 4 test mix uses 5 NET-NEW slugs ONLY (premium-tax-credit, copayment-vs-coinsurance, in-network-vs-out-of-network, special-enrollment-period, open-enrollment-period) | PRD §7 | Manual gate before Phase 4 |

---

## 8. Style + format invariants (carried from current writer; preserved)

| # | Requirement | Source | Enforcement |
|---|---|---|---|
| 8.1 | NO em dashes (`—`), NO en dashes (`–`) — use commas / periods / "to" | current-writer + universal | STEP 5 style + GATE D auto-fix |
| 8.2 | No filler ("It's important to note", "in today's world", "navigating the complex world of") | current-writer + universal | STEP 5 style |
| 8.3 | Lead with concrete numbers (definition + quickDefinition + FAQ answers) | current-writer | STEP 5 style |
| 8.4 | Exact dollar figures ($283, not "around $300") | current-writer | STEP 5 style |
| 8.5 | "2026" explicit throughout for freshness signal | current-writer + universal §3.1 + §4.5 | STEP 5 + STEP 6 |
| 8.6 | Don't editorialize — factual information service tone | current-writer | STEP 5 style |
| 8.7 | "CoveredUSA" only in meta title + Analyzer/Screener CTA | current-writer | STEP 5 style |
| 8.8 | Spanish parity: every LocalizedString needs both `en` AND `es`. Translate from corresponding English (definition → definition.es; NOT cascade). Brand names + program names stay English. | current-writer | STEP 5 Spanish quality |
| 8.9 | JSON validity non-negotiable — atomic write pattern `<slug>.tmp.json` → validate parse → rename | current-writer + master brief §7 | STEP 7 |
| 8.10 | Last-line JSON is the only thing the cron parses | current-writer + master brief | STEP 8 |
| 8.11 | 2026 anchor facts (Part B $283, Part B premium $202.90, Part A $1,736, Part D OOP $2,100, ACA OOP $9,200/$18,400, HDHP OOP $8,500/$17,000, IRA insulin cap $35/mo, IRA signed Aug 16 2022, 2026 FPL HH1 base $15,960 + $5,680 each additional, ACA enhanced PTCs expired Jan 1 2026 — cliff returned for 2026) | current-writer + master brief + drug-writer experience | STEP 5 anchor facts block |

---

## 9. Verifier-specific patches (master brief Phase 4.5 + Track C-prime load-test)

| # | Requirement | Source | Enforcement |
|---|---|---|---|
| 9.1 | Path portability: `/Users/frankthebot/...` → `$HOME/clawd/...` everywhere | master brief Phase 4.5 patch 1 + PRD §9 | Replace all paths in writer + verifier |
| 9.2 | Dual-purpose framing in verifier YOUR TASK section (numeric AUTO-FIX + structural DETECT-ONLY for HOLD-class GATES) | master brief Phase 4.5 patch 2 + MA-state verifier reference | Add framing block at top |
| 9.3 | STEP 1C — Structural GATE detection mirroring writer's STEP 6 (4 universal + 4 glossary-specific) | master brief Phase 4.5 patch 3 + PRD §9 | New STEP 1C section |
| 9.4 | GATE E mechanical strictness (verifier runs the word-count Node one-liner; don't trust writer self-report) | PRD §9 mandatory patch + audit's biggest finding | STEP 1C GATE E check |
| 9.5 | `keyTerms` shape example with explicit "do NOT emit flat array" rule | master brief load-test patch + drug-writer experience | STEP 4 of writer (with code example) |
| 9.6 | GATE D auto-fix hoist with "AUTO-FIX MANDATORY" framing + Ohio failure-mode callout | master brief Track C-prime patch 3 + PRD §9 | Verifier STEP 1C GATE D |
| 9.7 | Slug-prohibition defense-in-depth: verifier rejects with `error: "track-c-prohibited-slug"` if input file is magi/deductible/oop-max | PRD §9 routing | Verifier STEP 0 |

---

## Resolved conflicts (4 — all formula-wins per master brief §3.5)

| Conflict | OLD writer says | §4.5 + PRD says | Resolution |
|---|---|---|---|
| 1 | detailSections MIN 2 (mid-CTA split requires it) | detailSections MAX 1 (only if comparison/lookup shape) | **Formula wins.** Drop to MAX 1. GATE H enforces. Mid-CTA split is acceptable mid-quickDefinition or mid-detailSection — doesn't require 2 distinct sections. |
| 2 | FAQ floor 6-8 | FAQ 3-4 | **Formula wins.** Drop to 3-4 lookup-shaped. |
| 3 | `introParagraphs` 1-2 paragraphs required | `introParagraphs: []` (literal empty array) | **Formula wins.** Schema field stays for back-compat; content drops to zero. |
| 4 | Optional sections optional (no required structural blocks beyond definition + detailSections) | `topicCluster + keyTerms + isLighthouse + isDeprecated` MANDATORY EMIT for forward-compat with Track A1 + link-index infrastructure | **Formula wins.** Add the 4 metadata fields as MANDATORY EMIT (same framing pattern as drug writer's 5 structural blocks). |

---

## Gold-standard reference upgrade

OLD writer pointed to `out-of-pocket-maximum.json` as gold-standard. That page is 683 words rendered prose — 1.4x OVER the 500-word target.

**NEW reference:** No existing glossary page is gold-standard for the new downscope shape. The writer prompt instead provides:
1. A worked structural exemplar inline (8-field minimal page with definition + quickDefinition + 1 lookup table + 0 detailSections + 3 FAQs + 3 inline links — ~350 words rendered)
2. A "what NOT to do" link to `content/data/glossary/magi.json` so the writer can FEEL the bloat being escaped

---

## Test-slug shape decisions (PRD §7)

| Slug | category | ctaTarget | annualLimits | detailSections | workedExample | Universal §3.7 brands | GATE G inline-link priority targets |
|---|---|---|---|---|---|---|---|
| `premium-tax-credit` | ACA | screener | YES — 9-row 2026 FPL × subsidy threshold table | 1 max — "How PTC ties to FPL" comparison block | YES — $X PTC for single filer at 250% FPL | 2+ brand mentions (Medi-Cal, MNsure, AHCCCS — relevant for MAGI-Medicaid spillover) | `/federal-poverty-level`, `/aca-income-limits`, `/medicaid-income-limits` |
| `copayment-vs-coinsurance` | Insurance | screener | NO | 0-1 — 2-row comparison table (copay $X flat vs coinsurance Y% of allowed) | 1 — same $200 visit, $25 copay vs 20% coinsurance | None — definitional term, no state-program tie | `/medical-bill-analyzer`, `/aca-income-limits`, `/federal-poverty-level` (loosely) |
| `in-network-vs-out-of-network` | Insurance | screener | NO | 0-1 — 2-row comparison (in-net deductible/coinsurance vs out-of-net) | 1 — same $1,000 visit, in-net vs out-of-net split | None | `/medical-bill-analyzer`, `/medicare-eligibility` (NSA context), `/federal-poverty-level` |
| `special-enrollment-period` | ACA | screener | NO | 0-1 — qualifying events bullet list (10-12 events) | 1 — "moved June 15, SEP open June 15 – August 15" | 1+ brand (Medi-Cal/MNsure) | `/aca-income-limits`, `/medicaid-income-limits`, `/federal-poverty-level`, plus event-page mentions in body |
| `open-enrollment-period` | ACA | screener | YES — 2026 dates table (ACA OEP 11/1/26-1/15/27; Medicare AEP 10/15-12/7/26; MA OEP 1/1-3/31/27) | 0-1 — none needed (annualLimits IS the meat) | 1 — "today is November 15, 2026; ACA OEP is open until January 15, 2027" | 1+ brand mentions for state marketplaces | `/aca-income-limits`, `/medicare-eligibility`, `/federal-poverty-level` |

---

## Summary

54 requirements. 4 resolved conflicts, all formula-wins. **0 silent drops** from old writer (every old rule either preserved or superseded with explicit justification — see Phase 3 differential audit).

The writer prompt that consumes this matrix is **smaller** than every other Track C-prime writer (drug 65KB, MA-state 41KB, procedure ~50KB) — target ~25-35KB. Because the work is subtraction.

The dominant theme: **GATE E (word cap ≤500) is the single hardest gate.** Everything else flows from honoring it. Writers love depth — the §4.5 quote at the TOP of the prompt + the mechanical Node count + the "MANDATORY STRUCTURAL BLOCKS — verifier WILL HOLD" framing pattern (from drug writer's B1 lesson #1) is how we keep them from inflating.

Phase 2 starts now: writer prompt rewrite using this matrix as the source of truth.
