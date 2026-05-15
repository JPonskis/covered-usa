# Glossary Writer + Verifier PRD (Track C-prime)

**Template:** glossary (`/glossary/[term]`)
**Files you will modify:** `.claude/agents/coveredusa-glossary-writer.md` + `.claude/agents/coveredusa-glossary-verifier.md`
**Output directory:** `projects/covered-usa/content/data/glossary/`
**Estimated time:** 1-2 hours (less than the other 5 PRDs — subtraction is faster than addition)
**Status:** Existing pages 1.8-3.3x OVER the §4.5 word ceiling. MAGI 1,658 words. Deductible 1,464 words. OOP-max 904 words. Target is 300-500. The writer prompt is the root cause — it pushes MIN 2 detail sections + 6-8 FAQs + introParagraphs.

---

## 0. THIS IS DOWNSCOPE WORK — read first, no exceptions

Every other Track C-prime PRD is about ADDING structure the writer is missing. This one is the opposite: **the writer is over-built**, the existing pages are too long, and the §4.5 recipe explicitly says glossary's strategic role is internal-link target — NOT citation magnet. Per the audit:

> "Only 4 MAGI queries in 2 months across all of BenefitsUSA. The writer prompt is operating from the old over-engineered template philosophy."

**Your job is mostly subtraction.** Word ceiling. Field removal. FAQ count cut. Detail-section cap. The writer should produce SHORTER, LINK-DENSER pages — not longer, deeper ones. Resist the instinct to "fix" perceived gaps by adding more sections; that's the bloat path we're escaping.

The §4.5 explicit warning, paraphrased from FANOUT_FORMULA.md:

> "WARNING: This template is structurally over-engineered relative to real Bing demand. Keep pages SHORT (300-500 words). Don't write 2,000-word concept deep-dives. Glossary's primary value is internal-link target per LINK_TARGET_MANIFEST.md, not citation magnet."

That quote belongs verbatim at the TOP of your new writer prompt. Every other section reinforces it.

---

## 0.1 STRICT PROHIBITION — three existing slugs you do NOT touch

**Track C glossary work must not regenerate any of these existing pages:**

- `magi`
- `deductible`
- `out-of-pocket-maximum`

These belong to **Track E (downsizing)**, NOT Track C (writer rewrite). They will be re-shrunk in a later track using the updated writer, but you regenerating them in Track C violates the slug-stability rule AND risks publishing a non-downsized version that overwrites the live page. **The whole point of glossary is the downsizing; doing it without the downsize is worse than leaving them alone.**

If your Phase 4 test mix accidentally lands on one of these slugs, STOP and pick a different test term. Your 5 test slugs are spelled out in §7 below.

(Repeated in §7, §10, §12 because the audit's biggest single risk is a fresh Claude regenerating MAGI thinking it's "fixing" it.)

---

## 0.2 Read order (MANDATORY before starting any phase)

1. **`projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md`** through §4 + §3.5 (default-toward-ship) + §6 (held-queue mechanism) + §5.7 (this template). The master brief is the source of truth for the 4-phase pattern and gates routing.
2. **This PRD** end-to-end before spawning any agents.
3. **`projects/covered-usa/specs/track-c-prime/procedure-prd.md`** — structural template for the writer/verifier rewrite (copy the section structure; this PRD is shorter because the work is shorter).
4. **`~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_b1_blog_writer_shipped.md`** — the 8 B1 lessons.
5. **Reference implementations** (READ — do not modify in your session):
   - `.claude/agents/coveredusa-ma-state-writer.md` (the cleanest Track C-prime writer pattern; copy structure)
   - `.claude/agents/coveredusa-ma-state-verifier.md` (the cleanest Track C-prime verifier pattern with all 3 patches applied; copy structure)
   - `.claude/agents/coveredusa-article-verifier.md` (B1 + Track C-prime; useful for fact-check categories)
6. **Source docs in §1 below.** Skim before Phase 1.

If you skip step 1 or 3 you'll re-add the bloat we're removing. Don't.

---

## 1. Context inventory (Phase 1 planner reads these)

| Doc | What it tells you |
|---|---|
| `.claude/agents/coveredusa-glossary-writer.md` | Current writer — pushes MIN 2 detailSections + 6-8 FAQs + introParagraphs |
| `.claude/agents/coveredusa-glossary-verifier.md` | Current verifier — fact-check categories work; structural gates absent |
| `.claude/agents/_universal-rules-block.md` | The 5 universal rules + 19-state program brand list |
| `projects/covered-usa/specs/FANOUT_FORMULA.md` §3 + **§4.5** | Universal rules + glossary recipe (DOWNSCOPE explicit; 300-500 words; 1 of 8 Bing-validated shapes) |
| `projects/covered-usa/specs/AI_OPTIMIZATION_FRAMEWORK.md` | The framework these recipes derive from |
| `projects/covered-usa/specs/URL_SLUG_FRAMEWORK.md` | Slug rules — never migrate existing slugs |
| **`projects/covered-usa/specs/LINK_TARGET_MANIFEST.md`** | **CRITICAL for glossary — link-target is the template's primary strategic value.** Read §1-§5 fully. |
| `projects/covered-usa/specs/CURRENT_STATE_AUDIT.md` §4.X | Cross-template audit findings |
| **`projects/covered-usa/content/fanout/analysis/audit-glossary-writer.json`** | **THE most important doc** — synthesized audit naming the 3-page bloat + the 3 top-rank writer edits |
| `projects/covered-usa/specs/PHASE_5_BRIDGE.md` §3 | Track C bridge context |
| `projects/covered-usa/src/lib/glossary.ts` | The `Glossary` TypeScript interface — your hard contract |
| `projects/covered-usa/content/data/glossary/magi.json` | **"What NOT to do" reference** — 1,658 words, 4 detail sections, 8 FAQs. Read it to feel the bloat. |
| `projects/covered-usa/content/data/glossary/out-of-pocket-maximum.json` | Slightly less bloated (904 words) — closest existing example to the target shape but still over |
| `projects/covered-usa/content/link-index.json` | Auto-built link routing; writer reads `byPhrase` to pick inline-link insertion points |

---

## 2. Schema reminder + hard contracts

The `Glossary` interface (`projects/covered-usa/src/lib/glossary.ts`) is your hard contract. Required top-level fields:

- `slug` (lowercase, hyphens — also the JSON filename)
- `term: LocalizedString` (use spelled-out form when one exists, e.g., "Premium Tax Credit (PTC)" not "PTC")
- `alternateNames: string[]` (plain strings; abbreviations/synonyms; non-localized for schema compatibility)
- `definition: LocalizedString` (1-2 sentences — the schema source of truth, becomes `DefinedTerm.description`)
- `category` (locked enum: `ACA | Medicare | Medicaid | Insurance | Tax | Billing | Coverage`)
- `topic` (string for schema.about)
- `medicalSpecialty` (typically `"PublicHealth"`)
- `ctaTarget` (locked enum: `screener | analyzer`)
- `lastUpdated` (ISO date YYYY-MM-DD)
- `readingTime` (string, e.g., "3 min read" — should be SHORT, not "5 min read")
- `meta: {title, description}` (LocalizedString; **title ≤ 70 chars, description ≤ 160 chars** — validator enforces)
- `hero: {h1, subhero}` (LocalizedString)
- `quickDefinition: LocalizedString` (3-4 sentences max — leads with the number)
- `introParagraphs: LocalizedString[]` — **the field is required by the schema (non-optional, will fail TypeScript strict compile if omitted).** Writer MUST emit `"introParagraphs": []` (literal empty array) in every glossary JSON. **DO NOT** populate the array — definition + hero.subhero + quickDefinition already cover the intro role. The empty array is the back-compat signal that the glossary writer is intentionally downscoping past intro prose.
- `annualLimits?` (optional — include ONLY when the term has year-anchored numbers; this is the "1 lookup table" from §4.5)
- `whatCountsToward?` (optional — keep ONLY for boundary-sensitive cost terms like OOP max / deductible; drop for definitional terms)
- `whatDoesNotCountToward?` (optional — same rule)
- `workedExample?` (optional — include ONLY for calculation-shaped terms; this is the "1 worked example" from §4.5)
- `detailSections: DetailSection[]` — **MAX 1 entry**, optional. Only when truly clarifying (comparison or lookup shape). Drop concept/history/why-it-exists sections entirely.
- `faqs: {en: LocalizedFAQ[], es: LocalizedFAQ[]}` — **3-4 entries** (was 6-8 in old writer)
- `relatedLinks: RelatedTerm[]` (2-4 footer entries with valid prefixes)
- `sources: GlossarySource[]` (min 3 primary citations)

**Additive Track C-prime fields (emit these too — clears `content-quality.js` warnings + Track A1 forward-compat + supplies link-index metadata):**

- `topicCluster: string` (e.g., `"glossary"` or `"premium-tax-credit"` — slug-style; one cluster per page)
- `keyTerms: {en: string[], es: string[]}` (NOT a flat array — see Phase 4.5 patch list)
- `isLighthouse: false` (every glossary page is a spoke, not a lighthouse — the lighthouses are the FPL/Medicaid-income/Medicare-eligibility pages)
- `isDeprecated: false`

**Hard contracts (NEVER violate):**

1. JSON return shape from STEP 8 must be `{slug, status, claims_checked, claims_corrected, claims_flagged, change_log, gates, gates_failed, ...}` parseable by the cron. (STEP 8 is the return-JSON step per master brief; STEP 5 is write-body.)
2. Atomic write pattern: `<slug>.tmp.json` first → validate JSON parses → rename to `<slug>.json`
3. `## STEP N` numbered headings (cron may parse for logging)
4. Schema interface conformance — extra fields are silently ignored at runtime, but missing required fields crash the build
5. FAQ question/answer are FLAT STRINGS, not LocalizedString objects (the most common drafter mistake)
6. Spanish parity — every LocalizedString needs both `en` AND `es`
7. No em-dash `—` (U+2014), no en-dash `–`, no double-hyphen `--` anywhere
8. **DO NOT regenerate `magi`, `deductible`, `out-of-pocket-maximum` in Track C.** Track E only.

---

## 3. The §4.5 recipe — DOWNSCOPE-FIRST

**FANOUT_FORMULA.md §4.5 — glossary variant distribution:** Canonicalization 45.9% / Specification 19.3% / Entailment 19.3% / Clarification 12.6% / Equivalent 3.0%

**Bing-validated shapes:** 1 of 8 (the weakest of any template — only 4 MAGI queries in 2 months across all of BenefitsUSA).

**Strategic role:** glossary is a **link-target spoke**. Every glossary page exists so that OTHER pages (procedure, drug, persona, event, blog, MA-state) can hyperlink to it via `link-index.byPhrase`. The page itself is a definition + cross-link emitter, NOT a citation magnet.

### Target structure per page (apply EVERY page)

- **Definition** — 1 paragraph, ≤80 words, leads with the number when applicable. This is `definition` + `quickDefinition` + `hero.subhero` derived from the same core claim. AI engines cite the DefinedTerm.description so it MUST be accurate.
- **One worked example** — only if the term has a calculation (MAGI math, deductible burndown, PTC subsidy calc). Render in `workedExample`. Skip if definitional (in-network vs out-of-network is conceptual, no calc needed).
- **One lookup table** — only if the term has year-anchored numeric thresholds (PTC subsidy table by income, OEP date table). Render in `annualLimits`. Skip if not numeric.
- **3-4 FAQs** — lookup-shaped, not concept-shaped. Each answer 40-100 words, self-contained.
- **Aggressive cross-linking** — 3-5 inline body links to lighthouses (the template's primary value).

### Hard caps (the dominant subtraction levers)

- **500 EN words MAX.** Count rendered prose; exclude frontmatter, source-citation labels, link anchor text. HOLD if over.
- **`introParagraphs` DROPPED entirely.** Existing pages have 4+ intro paragraphs — these go away. Definition + quickDefinition + hero.subhero already cover the intro role.
- **`detailSections` MAX 1** (was MIN 2 in old writer). Only if comparison-shaped or lookup-shaped. Drop history / mechanics / why-it-exists sections.
- **FAQs 3-4** (was 6-8). Cut concept-restating FAQs; keep lookup-shaped only.

### Cross-linking checklist (the template's primary value)

The writer MUST emit at least 3 inline body links pointing at canonical lighthouse pages. Likely candidates (consult `content/link-index.json` byPhrase keys for the authoritative list):

- `/federal-poverty-level` — for any term tied to income thresholds
- `/medicaid-income-limits` — for any Medicaid-eligibility term
- `/medicare-eligibility` — for any Medicare term
- `/aca-income-limits` — for any ACA / subsidy / PTC term
- `/event/<slug>` — when SEP / OEP references a coverage-change event
- Other `/glossary/<slug>` pages — when the term has near-neighbor concepts

**Insertion pattern:** the writer reads `content/link-index.byPhrase[<locale>]`. For each phrase that matches body content, hyperlink the FIRST occurrence (per LINK_TARGET_MANIFEST §5). Max 5 inline body links per page.

### Required vocabulary

**Keep it minimal.** Glossary pages should NOT use technical jargon; they should DEFINE technical jargon. Don't enforce a 9-term canonical-vocabulary checklist like procedure does. The one term every glossary page MUST contain: **the term itself, spelled out, in both `term.en` and `definition.en`**.

### Year-anchoring (universal rule)

Every dollar amount + percentage must have a year in the same sentence or table caption. The Part B figures are 2026 (deductible $283, premium $202.90). The 2026 FPL figures published in the universal rules block must be year-tagged 2026.

### State-context

Per §4.5: state-context is **OPTIONAL** for glossary (concept terms aren't state-scoped). Don't force it. EXCEPTION: glossary terms tied to MAGI-Medicaid eligibility should reference state-named program brands (Medi-Cal, AHCCCS, MNsure, BadgerCare) at least once each — the audit flagged the absence as a missed citation surface for income-defining terms.

---

## 4. Audit findings synthesized (read `audit-glossary-writer.json` for the full version)

**Pages audited:** magi, deductible, out-of-pocket-maximum. Verdicts: OVER_ENGINEERED / OVER_ENGINEERED / BORDERLINE.

**Word-count analysis:**

| Slug | Words | vs 500 ceiling | Verdict |
|---|---|---|---|
| magi | 1,658 | 3.32x over | OVER |
| deductible | 1,464 | 2.93x over | OVER |
| out-of-pocket-maximum | 904 | 1.81x over | BORDERLINE |
| **average** | **1,342** | **2.68x over** | **bloated baseline** |

**Top 3 writer edits per the audit (your new writer must implement all 3):**

- **WE-1 (rank 1):** Add §4.5 warning quote to TOP of writer prompt. Hard-cap output at 500 EN words. Drop `introParagraphs`. Change `detailSections` from MIN 2 to MAX 1 (only if comparison or lookup shaped). Drop FAQ count from 6-8 to 3-4. **Impact: brings glossary in line with §4.5 explicit guidance; cuts wasted writer cycles ~60%.**
- **WE-2 (rank 2):** Add LINK_TARGET_MANIFEST §5 INTERNAL LINK ROUTING block. Writer loads `content/link-index.json`, emits 3-5 inline body links, declares `topicCluster + keyTerms.{en,es} + isLighthouse + isDeprecated` metadata. **Impact: converts glossary from passive page to active link-routing infrastructure — its actual strategic role.**
- **WE-3 (rank 3):** Add 4 missing universal rules — §3.3 household-size table required for income-anchored terms (MAGI, FPL, PTC), §3.4 how-to-apply block when applicable, §3.7 state-named program brand mentions for state-program-relevant terms, §3.10 "chart/guidelines/by X" table phrasing. **Impact: aligns writer with Bing-validated universals.**

**Concept-bloat patterns to explicitly prohibit in the new writer:**

- "Why MAGI Instead of Gross Income?" (history lesson; zero Bing demand)
- "Why Bronze Plans Have a Higher Deductible" (actuarial mechanics; users skip to the number)
- introParagraphs as throat-clearing prose
- FAQs that restate the definition rather than answer an adjacent-lookup question

---

## 5. Universal GATES (recap from master brief §7) — apply ALL to glossary

- **GATE A — slug must NOT contain a year.** Glossary slugs are pure concept names (`magi`, `deductible`, `premium-tax-credit`, `open-enrollment-period`). Never `magi-2026` or `premium-tax-credit-2026`. **HOLD on fail.**
- **GATE B — household-size table.** **N/A for most glossary terms.** EXCEPTION: income-anchored terms (PTC, MAGI, FPL) SHOULD include a household-size threshold table — but the table goes in `annualLimits` or `detailSections[0]`, NOT as the primary content (which is the ≤80-word definition). For non-income terms (copayment-vs-coinsurance, in-network-vs-out-of-network, SEP, OEP), skip the gate entirely. Mark `gates.b: "n/a"` in verifier output.
- **GATE C — ≥3 inline outbound .gov / .edu / kff.org citations.** Required minimum: HealthCare.gov + (Medicare.gov OR CMS.gov OR IRS.gov depending on term) + 1 third-party authority (KFF preferred). **HOLD on 0-1; WARN on exactly 2.**
- **GATE D — zero `--` (double-hyphen) anywhere.** **AUTO-FIX as style correction; never HOLD.** Verifier auto-fixes per the GATE D hoist patch (see master brief §3 Phase 4.5 patches).

---

## 6. Glossary-specific GATES (your STEP 6 additions)

These are the template-specific gates. Frame them at STEP 6 with "STOP. Read this twice." language. **GATE E is the dominant gate for glossary.**

### GATE E — Word count ≤ 500 EN words (DOMINANT GATE)

Count from rendered prose (definition + quickDefinition + introParagraphs + annualLimits.footnote + workedExample.intro + workedExample.footnote + detailSections[].paragraphs[] + faqs.en[].answer). Exclude frontmatter, source citation labels, link anchor text.

Mechanical count check before save (writer side):

```
node -e "
const j = JSON.parse(require('fs').readFileSync('<path>','utf8'));
let w = 0;
const grab = s => { if (typeof s === 'string') w += s.split(/\s+/).filter(Boolean).length; };
grab(j.definition?.en); grab(j.quickDefinition?.en); grab(j.hero?.subhero?.en);
(j.introParagraphs||[]).forEach(p => grab(p.en));
(j.detailSections||[]).forEach(s => { grab(s.heading?.en); (s.paragraphs||[]).forEach(p => grab(p.en)); });
(j.faqs?.en||[]).forEach(f => { grab(f.question); grab(f.answer); });
if (j.annualLimits) grab(j.annualLimits.footnote?.en);
if (j.workedExample) { grab(j.workedExample.intro?.en); grab(j.workedExample.footnote?.en); }
console.log('EN_WORD_COUNT='+w);
if (w > 500) process.exit(1);
"
```

**Routing:** PASS if ≤500; HOLD if >500. This is the audit's #1 finding; the writer must always honor it.

### GATE F — Definition in first 80 words

`definition.en` must be ≤80 words AND must be a complete 1-2 sentence definition leading with the substantive claim (not throat-clearing). The reader should NOT need to scroll/skim past the definition to learn what the term means.

Check: `definition.en.split(/\s+/).filter(Boolean).length <= 80` AND first sentence starts with a noun phrase or "The" / "A" / "An" (not "It's" / "When" / "There are").

**Routing:** PASS if ≤80 words + lead-claim direct; WARN if 81-100 words; HOLD if >100 words OR definition buried behind throat-clearing.

### GATE G — ≥3 internal links from link-index byPhrase keys

The template's primary value is link-target infrastructure. Verify body content contains ≥3 inline links matching `content/link-index.byPhrase[<locale>]` keys (lighthouse pages — `/federal-poverty-level`, `/medicaid-income-limits`, `/medicare-eligibility`, `/aca-income-limits`, etc.).

**Routing:** PASS if ≥3 distinct hrefs; WARN if 1-2; HOLD if 0. Without internal links, the glossary page fails its strategic role.

(Subtle point: `relatedLinks` footer items don't count toward this gate. Inline body links inside `quickDefinition`, `detailSections[].paragraphs[]`, or FAQ answers DO count. The writer must declaratively place links — not park them all in the footer.)

### GATE H — ≤ 1 detail section (audit gap — existing pages have 4+ sections)

Verify `detailSections.length <= 1`. Audit finding: MAGI had 4 detail sections, deductible had 3. Both bloated word count.

**Routing:** PASS if 0 or 1 detail section; HOLD if 2+. (No "soft warn" tier — if the writer emits 2 detail sections, the page is over the §4.5 ceiling and needs regen.)

---

## 7. Test mix — 5 NEW glossary terms (Phase 4)

**CRITICAL: do NOT touch `magi`, `deductible`, or `out-of-pocket-maximum`.** Those belong to Track E. If any of your 5 Phase-4 slugs match those existing slugs, STOP and pick a different term.

Test the new writer on these 5 NET-NEW glossary terms:

| Slug | Term | Why |
|---|---|---|
| `premium-tax-credit` | Premium Tax Credit (PTC) | Heavily cross-linked from procedure / FPL / persona pages. Tests income-threshold lookup table (annualLimits by household size). Tests inline link emission to /federal-poverty-level + /aca-income-limits + /medicaid-income-limits. The "lighthouse hub" feel without being a lighthouse itself. |
| `copayment-vs-coinsurance` | Copayment vs Coinsurance | Comparison framing (§3.5). Tests two-column definition table. Tests "comparison glossary" shape — purely conceptual, no calculation. |
| `in-network-vs-out-of-network` | In-Network vs Out-of-Network | Comparison framing. Tests NSA balance-billing protection reference (cross-link to /event/lost-job or similar). Tests boundary-sensitive definition without becoming a procedure-cost page. |
| `special-enrollment-period` | Special Enrollment Period (SEP) | Cross-template link target (every event page references SEP). Tests inline link emission to /event/getting-married, /event/having-a-baby, /event/moving-states. Tests qualifying-events list as ONE bullet-list inside `detailSections[0]` (or no detail section + a list in quickDefinition). |
| `open-enrollment-period` | Open Enrollment Period (OEP) | Annual lookup — 2026 dates table goes in `annualLimits`. Tests year-anchoring on a non-dollar value. Heavily cross-linked from MA-state pages (every state mentions OEP dates). |

**Why these 5:** they cover the dominant glossary shapes — pure definition (SEP, OEP), comparison framing (copay-vs-coinsurance, in-network-vs-out-of-network), and income-threshold lookup (PTC). They exercise GATE E (word cap), GATE F (definition density), GATE G (inline links), GATE H (detail-section cap) without redundancy.

### Per-slug expected shape table

| Slug | `category` | `ctaTarget` | `annualLimits` | `detailSections` count | Worked example |
|---|---|---|---|---|---|
| `premium-tax-credit` | `ACA` | `screener` | YES (income-by-household table; 9 rows preferred to satisfy RULE 2; ≥4 rows acceptable for glossary downscope) | 1 max (income-threshold table block) | 1 — show $X PTC for a single filer at 250% FPL |
| `copayment-vs-coinsurance` | `Insurance` | `screener` | NO | 0-1 (a 2-row comparison table is fine; no detail section needed if quickDefinition handles it) | 1 — concrete dollar example for both |
| `in-network-vs-out-of-network` | `Insurance` | `screener` | NO | 0-1 (similar 2-row comparison) | 1 — same dollar visit at in-net vs out-of-net |
| `special-enrollment-period` | `ACA` (primary — link out to Medicare SEP context for Medicare overlap) | `screener` | NO | 0-1 (qualifying-events bullet list in `detailSections[0]` OR inside quickDefinition) | 1 — concrete example like "moved to a new state on June 15" → SEP window |
| `open-enrollment-period` | `ACA` (primary — note Medicare OEP overlap in body) | `screener` | YES (annual dates: 2026 ACA OEP, 2026 Medicare AEP, 2026 MA OEP — all three dates as one lookup table) | 0-1 (the annualLimits table is the meat; an extra detailSection isn't needed) | 1 — "If today is November 15, 2026, ACA OEP is open until January 15, 2027" |

**Disambiguation:** GATE B (9-row household-size table) is conditional on RULE 2 income-gating. For `premium-tax-credit` specifically, the table is a *threshold lookup* that benefits from 9-row coverage (sizes 1-8 + each-additional). For glossary, 9 rows is the IDEAL but the downscope work means a 4-row representative table (1, 2, 4, 8) can satisfy the gate if word count is tight. The verifier should mark `gates.b: "warn"` rather than HOLD if PTC has < 9 rows but presents the threshold accurately. For the other 4 test terms, GATE B is `n/a` (no income-gating).

**Pre-Phase-4 collision check:**

```bash
ls projects/covered-usa/content/data/glossary/*.json | xargs -n1 basename | sed 's/.json//'
```

Expected output: `_queue`, `deductible`, `magi`, `out-of-pocket-maximum`. Confirm none of your 5 planned slugs match these.

**Pass criteria:** 5/5 articles pass strict-mode validators + 4/5 score ≥80% on the rubric + **every test article is ≤500 EN words** (the dominant gate verified mechanically).

**Strict-mode validator confirmation:** `projects/covered-usa/scripts/validate-glossary.js` EXISTS and is the canonical pre-build check. Run with `STRICT_QUALITY_LINT=1 node projects/covered-usa/scripts/validate-glossary.js` for the strict pass. If it returns "0 bad" with only `keyTerms` / `topicCluster` warnings, you pass.

---

## 8. Common failure modes for glossary (watch out for these)

1. **Writer over-writes (most common).** Writers love depth — they'll happily expand a 4-sentence definition into a 4-paragraph essay. Resist via GATE E mechanical word-count check + the §4.5 quote at the top of the prompt.
2. **Writer emits `introParagraphs`.** The old prompt encouraged 1-2 intro paragraphs. New prompt drops the field entirely. The definition IS the intro. If the writer emits `introParagraphs: [{en: "...", es: "..."}]`, reject + regen.
3. **Writer writes 6+ FAQs.** The old pattern. New cap is 3-4. FAQs that restate the definition ("What is a [term]?") are filler — replace with lookup-shaped FAQs ("What's the 2026 threshold for [term]?", "Does [term] apply to [adjacent program]?").
4. **Writer skips internal links.** The template's primary value. If the body has zero hyperlinks to `/federal-poverty-level` / `/medicaid-income-limits` / `/medicare-eligibility` / `/aca-income-limits` / `/event/<slug>`, the page fails its strategic role. GATE G catches this; the writer prompt must reinforce it as PRIMARY VALUE not nice-to-have.
5. **Writer regenerates `magi` / `deductible` / `out-of-pocket-maximum`.** **STRICT PROHIBITION.** Track E only. Writer prompt must include a NEVER list naming these 3 slugs explicitly. If the cron payload arrives with slug = magi, the writer returns `{slug, status: "error", error: "track-c-prohibited-slug: magi belongs to Track E downsize"}`.
6. **Writer adds a concept-history detail section.** "Why MAGI Instead of Gross Income" / "Why Bronze Plans Have a Higher Deductible" / "The Origin of OEP" — all banned. Detail sections (if any) must be comparison-shaped or lookup-shaped. NEVER history / mechanics / why-it-exists.
7. **Writer fabricates `annualLimits` for terms without year-anchored numbers.** Copayment-vs-coinsurance has no annual limit. In-network-vs-out-of-network has no annual limit. SEP has no annual limit. Don't invent one to fill the schema slot — leave `annualLimits` unset (it's optional). OEP HAS an annual lookup (dates by enrollment type) — that one earns the table.
8. **Writer puts cross-links only in `relatedLinks` footer.** Inline body links count for GATE G; footer links don't. The writer must place at least 3 inline links in body prose (definition, quickDefinition, detailSection paragraphs, FAQ answers).

---

## 9. Verifier scope (Phase 4.5 — per master brief)

Update `.claude/agents/coveredusa-glossary-verifier.md` to mirror the writer's new GATES.

**Non-negotiable patches per master brief Phase 4.5 (3 things to apply):**

1. **Path portability:** `/Users/frankthebot/...` → `$HOME/clawd/...` everywhere
2. **Add dual-purpose framing** in YOUR TASK section (numeric auto-fix + structural detect-only). Copy framing from `coveredusa-ma-state-verifier.md`.
3. **Insert STEP 1C: structural GATE detection** with all 4 universal + all 4 glossary-specific GATES (mirror writer's STEP 6).

**3 mandatory patches from the load-test (apply BOTH writer + verifier sides):**

- **GATE E mechanical strictness (writer side):** strict word-count check via the Node one-liner in §6 above. Don't trust writer self-report. The audit's biggest finding is that all 3 existing pages went over the ceiling despite "best efforts."
- **`keyTerms` shape example (writer side):** embed the `{en: [...], es: [...]}` template with explicit "do NOT emit flat array" rule.
- **GATE D auto-fix hoist (verifier side):** "AUTO-FIX MANDATORY" framing + Common-verifier-error callout naming the Ohio MA-state failure mode.

**Routing per gate (glossary-specific):**

- GATE A FAIL → HOLD
- GATE B → N/A for most glossary; if PTC / MAGI / FPL with absent income table → ship + LOW flag (HOLD only if writer was specifically asked for a household-size table and skipped)
- GATE C FAIL (0-1 .gov) → HOLD; WARN (2) → ship + LOW flag
- GATE D FAIL → AUTO-FIX as style correction
- **GATE E FAIL (>500 words) → HOLD** (audit's #1 fix; never ship over-cap)
- GATE F FAIL (>100 word definition) → HOLD; WARN (81-100)
- **GATE G FAIL (0 inline links) → HOLD** (template's primary value); WARN (1-2 inline links)
- **GATE H FAIL (2+ detail sections) → HOLD** (audit gap)
- Slug-prohibition (slug ∈ {magi, deductible, out-of-pocket-maximum}) → HOLD immediately with `error: "track-c-prohibited-slug"` (this is a writer-side check too — defense in depth)

**Verifier test:** after updating the verifier, run it on the 5 Phase-4 test articles. Expected: all `approved` or `corrected` (no false HOLDs). If any spurious HOLD: tighten the verifier prompt before shipping.

---

## 10. Atomic deliverable (Phase 5 — 4 commits)

Per master brief §3 Phase 5:

1. **Commit 1 (clawd-workspace):** `.bak` move + new glossary-writer prompt
2. **Commit 2 (covered-usa):** 5 test articles in `content/data/glossary/<slug>.json` + any verifier-caught corrections from Phase 4.5
3. **Commit 3 (covered-usa):** Requirements matrix + 3 verifier reports + retest verifier output in `content/fanout/analysis/c-glossary-*.md`
4. **Commit 4 (clawd-workspace):** `.bak` move + new glossary-verifier prompt (paired with the writer ship)

**Push order:** clawd-workspace first (writer + verifier prompts go live for any cron pickup), then covered-usa (test articles deploy to Vercel).

**Pre-push tripwires (RUN BOTH BEFORE COMMIT 2):**

```bash
# 1. Confirm no rename of existing glossary slugs
git -C ~/clawd/projects/covered-usa diff --name-status HEAD | grep "content/data/glossary/" | grep "^R"
# Expected: empty

# 2. Confirm magi/deductible/out-of-pocket-maximum are NOT modified
git -C ~/clawd/projects/covered-usa diff HEAD -- \
  content/data/glossary/magi.json \
  content/data/glossary/deductible.json \
  content/data/glossary/out-of-pocket-maximum.json
# Expected: empty (zero modifications to those 3 files)
```

If either tripwire fires, **STOP and audit your work.** You almost certainly touched a Track-E slug by accident.

**Memory entry:** write `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_track_c_glossary_writer_shipped.md` with:

- Per-article word counts from Phase 4 (verify all 5 are ≤500)
- Any new lessons learned (especially around the subtraction work pattern)
- The 3 prohibited-slug check confirmations (magi/deductible/oop-max untouched)
- 5-line summary of the 5 shipped glossary terms (slug, word count, inline-link count, status, gates result)
- Specific bloat patterns the new writer successfully avoided (compare against the old MAGI page's 4 detail sections, 8 FAQs, intro paragraphs)

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
ls -la ~/clawd/projects/covered-usa/content/fanout/analysis/audit-glossary-writer.json

# 4. Confirm link-index exists (writer reads this for inline-link emission)
ls -la ~/clawd/projects/covered-usa/content/link-index.json

# 5. Confirm the 3 prohibited slugs exist (sanity — you should NEVER modify these)
ls -la ~/clawd/projects/covered-usa/content/data/glossary/magi.json \
       ~/clawd/projects/covered-usa/content/data/glossary/deductible.json \
       ~/clawd/projects/covered-usa/content/data/glossary/out-of-pocket-maximum.json

# 6. Slug collision check — your 5 new slugs must NOT be in this list
ls ~/clawd/projects/covered-usa/content/data/glossary/*.json | xargs -n1 basename | sed 's/.json//'
# Expected output: _queue, deductible, magi, out-of-pocket-maximum

# 7. Read the over-engineered MAGI page to feel the bloat you're escaping
node -e "const j=JSON.parse(require('fs').readFileSync('$HOME/clawd/projects/covered-usa/content/data/glossary/magi.json','utf8')); let w=0; const grab=s=>{if(typeof s==='string')w+=s.split(/\s+/).filter(Boolean).length}; grab(j.definition?.en); grab(j.quickDefinition?.en); (j.introParagraphs||[]).forEach(p=>grab(p.en)); (j.detailSections||[]).forEach(s=>{grab(s.heading?.en); (s.paragraphs||[]).forEach(p=>grab(p.en))}); (j.faqs?.en||[]).forEach(f=>{grab(f.question); grab(f.answer)}); console.log('MAGI_WORDS='+w+'; target=500')"
# Expected: ~1,658 words (3.3x over target). This is what you're NOT producing.
```

If any check fails or surprises you, surface to Jacob BEFORE proceeding.

---

## 12. Quick reference card (post on monitor while working)

- **Master brief:** `projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md`
- **Reference writer (structure):** `.claude/agents/coveredusa-ma-state-writer.md`
- **Reference verifiers:** `.claude/agents/coveredusa-ma-state-verifier.md` + `.claude/agents/coveredusa-article-verifier.md`
- **Your writer file:** `.claude/agents/coveredusa-glossary-writer.md`
- **Your verifier file:** `.claude/agents/coveredusa-glossary-verifier.md`
- **Schema interface:** `projects/covered-usa/src/lib/glossary.ts` → `Glossary`
- **Recipe:** FANOUT_FORMULA.md §4.5 (DOWNSCOPE explicit)
- **Audit:** `content/fanout/analysis/audit-glossary-writer.json`
- **Link manifest:** `specs/LINK_TARGET_MANIFEST.md` (CRITICAL — link-target is the template's primary value)
- **Link index:** `content/link-index.json` byPhrase
- **"What NOT to do" reference:** `content/data/glossary/magi.json` (1,658 words — bloat exemplar)
- **Output dir:** `content/data/glossary/`
- **Phase 4 test slugs:** `premium-tax-credit`, `copayment-vs-coinsurance`, `in-network-vs-out-of-network`, `special-enrollment-period`, `open-enrollment-period`
- **PROHIBITED SLUGS (Track E only — DO NOT TOUCH):** `magi`, `deductible`, `out-of-pocket-maximum`
- **Universal GATES:** A (slug-no-year, HOLD), B (mostly N/A; LOW flag for income-anchored without table), C (≥3 .gov, HOLD if 0-1), D (no `--`, AUTO-FIX)
- **Glossary GATES:** **E (≤500 words, HOLD — DOMINANT)**, F (definition ≤80 words, HOLD if >100), G (≥3 inline links, HOLD if 0), H (≤1 detail section, HOLD if 2+)
- **4-commit deliverable:** writer prompt + 5 test articles + analysis files + verifier prompt
- **Default toward auto-ship:** ~95% / ~4% / ~1% (HOLD only on genuine breakage — for glossary, that means word-over-cap, missing inline links, or extra detail sections)
- **The 6 things to SUBTRACT** from the old writer prompt:
  1. `introParagraphs` requirement (drop entirely)
  2. `detailSections` MIN 2 (cut to MAX 1)
  3. FAQ floor 6-8 (cut to 3-4)
  4. Optional concept-history detail sections (banned outright)
  5. 1,000+ word output norm (hard-cap 500)
  6. Silent on link-index consumption (now REQUIRED — 3-5 inline body links per page)

---

*This PRD is self-contained. Combined with the master brief, it has everything a fresh parallel session needs to execute Track C-prime for glossary. The work is mostly subtraction — resist the urge to add. If you find yourself reaching for "I'll just add one more section to be thorough" — STOP. That instinct is the bug we're fixing. If anything is unclear or missing, surface to Jacob before proceeding.*
