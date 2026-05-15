# Live Test — Glossary Track C-prime Execution Plan (Fresh Session Simulation)

**Premise:** I am simulating a fresh Claude Code session spawned to execute Track C-prime for the CoveredUSA Glossary template. My only context is the master brief (`TRACK_C_PARALLEL_PLAN.md` v1.3) and the Glossary PRD (`track-c-prime/glossary-prd.md`). I do not read the other 5 PRDs. This document is the execution plan I would write before touching any file, plus the uncertainties I would flag back to Jacob.

---

## Phase-by-phase execution plan

### Phase 0 — Pre-flight (~5 min)

Before spawning any agents, I would run the §11 pre-flight checklist literally:

1. `git pull origin main` in both `~/clawd` and `~/clawd/projects/covered-usa`
2. Confirm reference implementations exist: `coveredusa-ma-state-writer.md`, `coveredusa-ma-state-verifier.md`, `coveredusa-article-verifier.md`
3. Confirm `audit-glossary-writer.json` and `link-index.json` exist
4. Confirm the 3 prohibited slugs exist (sanity-check I never modify them): `magi.json`, `deductible.json`, `out-of-pocket-maximum.json`
5. Slug-collision check: `ls content/data/glossary/*.json | xargs -n1 basename | sed 's/.json//'`. Expected output: `_queue, deductible, magi, out-of-pocket-maximum`. Confirm none of my 5 planned test slugs collide.
6. Run the MAGI word-count one-liner to feel the bloat (`~1,658 words` target output, confirms I understand what NOT to produce)

I would also read the master brief through §4 + §3.5 + §6 + §5.7, this PRD end-to-end, the procedure-prd.md (as the PRD claims it's the structural template — but I won't read its content as a "fresh session"; I will only read it for STRUCTURE references), the B1 memory entry, and the two MA-state reference agents. The PRD's read order is explicit and well-scoped.

**Success criteria:** all checklist commands succeed; no surprises.

### Phase 1 — Inventory (~30 min)

I would spawn a planner agent via the literal prompt template in master brief §3 Phase 1, substituting `<TEMPLATE>` = `glossary`. The planner reads the 10 source files listed (current writer, universal rules block, FANOUT_FORMULA.md §3 + §4.5, AI_OPTIMIZATION_FRAMEWORK.md, URL_SLUG_FRAMEWORK.md, LINK_TARGET_MANIFEST.md, CURRENT_STATE_AUDIT.md §4.X, `audit-glossary-writer.json`, PHASE_5_BRIDGE.md §3, master brief §5.7) and extracts every rule with the 10-category taxonomy (formula-universal, formula-recipe, audit-flagged, framework-preserved, hard-contract, slug-rule, link-consumption, strategic-posture, humanizer-voice, cron-pipeline).

**Artifact produced:** `projects/covered-usa/content/fanout/analysis/c-glossary-requirements-matrix.md` in the same format B1 used. The matrix will be unusual relative to other templates because the dominant audit finding is SUBTRACTION (word cap, drop introParagraphs, cut FAQ count, cap detailSections). I'd expect ~40-60 requirements vs the ~80-120 typical for an additive template. The "Resolved Conflicts" section will primarily document where the old writer's MIN 2 detailSections / 6-8 FAQs / introParagraphs requirements are SUPERSEDED by §4.5's hard caps.

**Tools/agents:** one `Task` spawn (general-purpose agent, planner role) with the literal §3 Phase 1 prompt.

**Success criteria:** planner returns a 400-word summary with per-category counts, conflicts resolved (formula wins), and 3 most-important things for the drafter. Matrix file saved.

### Phase 2 — Draft (~60 min)

Back up the existing writer: `mv .claude/agents/coveredusa-glossary-writer.md .claude/agents/coveredusa-glossary-writer.bak.md`. Then write the new writer prompt from scratch using the §4.5 recipe + this PRD + the requirements matrix.

Structure I would produce (~3,500-5,000 words, mirroring `coveredusa-ma-state-writer.md`):

- **Identity + role** — 2 sentences, lead with "glossary's strategic role is internal-link target, NOT citation magnet"
- **§4.5 warning quote VERBATIM at the top** (PRD §0 requires this)
- **STRICT PROHIBITION block** naming `magi`, `deductible`, `out-of-pocket-maximum` — if cron payload arrives with one of these slugs, return `{slug, status: "error", error: "track-c-prohibited-slug"}` immediately
- **INPUTS section** — slug, term, category, ctaTarget, topicCluster, any context fields
- **STEP 0** — load context: $HOME-portable paths, universal rules block, link-index.json (read `byPhrase[en]` + `byPhrase[es]` for inline link insertion), product context
- **STEP 1** — slug-prohibition check (STOP if slug ∈ {magi, deductible, oop-max}); category validation; year-anchor setup
- **STEP 2** — research: ≥3 .gov/.edu/kff.org sources; cross-reference prior-year figures; for income-anchored terms, pull 2026 FPL from universal rules block
- **STEP 3** — plan structure per §4.5 recipe: definition (≤80 words) + optional 1 worked example + optional 1 lookup table + 3-4 FAQs + 3-5 inline body links
- **STEP 4** — write frontmatter: required Glossary schema fields + `topicCluster` + `keyTerms: {en: [...], es: [...]}` (NOT flat array) + `isLighthouse: false` + `isDeprecated: false`
- **STEP 5** — write body: definition leads with the claim; quickDefinition 3-4 sentences; emit `introParagraphs: []` (drop entirely); detailSections MAX 1 (only if comparison or lookup shaped); FAQs 3-4 lookup-shaped; insert 3-5 inline links per LINK_TARGET_MANIFEST §5
- **STEP 6** — self-validation with the 4 CRITICAL PRE-SAVE GATES (universal A/B/C/D + glossary E/F/G/H) at the top with "STOP. Read this twice." framing, then the universal 26-check list. GATE E is the DOMINANT gate — strict word-count check via the Node one-liner in PRD §6, REJECT if >500 EN words.
- **STEP 7** — atomic save: write `<slug>.tmp.json`, validate JSON parses, rename to `<slug>.json`
- **STEP 8** — return JSON: `{slug, status, claims_checked, claims_corrected, claims_flagged, change_log, gates: {a,b,c,d,e,f,g,h}, gates_failed, ...}`
- **CRITICAL BOUNDARIES** — NEVER touch prohibited slugs; NEVER emit `introParagraphs` with content; NEVER write `--`; NEVER exceed 500 words; NEVER skip inline links

**Artifact produced:** `.claude/agents/coveredusa-glossary-writer.md` (new) + `.bak.md` (backup).

**Success criteria:** new prompt is ~3,500-5,000 words, preserves Stage 1 cron JSON contracts (slug + status parseable), STEP headings are `## STEP N` (cron parses for logging), and explicitly drops introParagraphs + caps detailSections at 1 + caps FAQs at 3-4.

### Phase 3 — 3-verifier review (~45 min)

Spawn three parallel verifier agents using the literal prompt templates in master brief §3 Phase 3, substituting `glossary`:

- **Verifier A (matrix-driven critic):** scores each requirement in the matrix PASS/PARTIAL/FAIL against the new writer. Confirms all resolved conflicts went the formula-wins direction. Writes to `c-glossary-verifier-a.md`.
- **Verifier B (cold fresh-eyes):** designs its ideal writer from scratch WITHOUT reading the new draft. Reads FANOUT_FORMULA.md, _universal-rules-block.md, AI_OPTIMIZATION_FRAMEWORK.md, audit-glossary-writer.json, master brief §5.7. Sketches 2,000 words: section list, key rules, validation steps, JSON return shape. Writes to `c-glossary-verifier-b.md`.
- **Verifier C (differential):** OLD vs NEW writer; every rule PRESENT / SUPERSEDED with documented justification / SILENTLY DROPPED (bug). Writes to `c-glossary-verifier-c.md`.

Apply fixes from all three reports. Iterate until all 3 pass. Expected high-value catches: Verifier C will surface old-writer rules that the §4.5 subtraction work intentionally drops (introParagraphs requirement, MIN 2 detailSections, 6-8 FAQ floor) — each needs an explicit SUPERSEDED entry with justification, not a silent drop.

**Artifacts produced:** 3 verifier report markdown files in `content/fanout/analysis/`.

**Success criteria:** Verifier A returns ≥90% PASS; Verifier B's independent sketch aligns structurally with the new writer (same gates, same JSON return, same subtraction posture); Verifier C lists every supersession with formula-wins justification and zero silent drops.

### Phase 4 — Manual test cycle (~90 min)

Pick the 5 test slugs spelled out in PRD §7: `premium-tax-credit`, `copayment-vs-coinsurance`, `in-network-vs-out-of-network`, `special-enrollment-period`, `open-enrollment-period`. Run the slug-collision check first; confirm none match `_queue`, `deductible`, `magi`, `out-of-pocket-maximum`.

Spawn 5 writer agents in parallel via `subagent_type: coveredusa-glossary-writer`, each with a Stage 1-style payload including TOPIC_CLUSTER, FORMULA_RECIPE = `§4.5`, UNIVERSAL_RULES block reference, KEYWORD, TITLE, and category (varies per term — `Tax` for PTC, `Insurance` for copay/network, `ACA` for SEP/OEP). For each output:

- Run validators in strict mode (the existing `scripts/validate-glossary.js` or equivalent if it exists; mechanical JSON validation otherwise)
- Run the GATE E word-count one-liner mechanically — ALL 5 must be ≤500 EN words
- Spawn a verifier agent (still the OLD verifier — Phase 4.5 hasn't shipped yet) to score against universal rules + §4.5 recipe + audit gaps

**Pass criteria:** 5/5 strict + 4/5 rubric ≥80% + ALL 5 ≤500 EN words.

**Iteration expectation:** PRD §8 names 8 common failure modes. The two most likely first-pass failures are (1) writer over-writes (the 1,000+-word default norm is hard to escape — first pass likely produces a 600-800 word PTC page) and (2) writer parks all links in `relatedLinks` footer instead of inline body, failing GATE G. Budget 30-60 min for one iteration: tighten the writer prompt with louder STOP framing at GATE E + worked-example callout for GATE G, then re-test the failing slugs.

**Artifacts produced:** 5 JSON files in `content/data/glossary/` (the test articles).

### Phase 4.5 — Verifier update (~30-45 min)

Back up the existing verifier: `mv .claude/agents/coveredusa-glossary-verifier.md .claude/agents/coveredusa-glossary-verifier.bak.md`. Write the new verifier prompt mirroring `coveredusa-ma-state-verifier.md` structure with glossary-specific gates.

Per master brief Phase 4.5 + PRD §9, apply:

1. **Path portability:** `/Users/frankthebot/...` → `$HOME/clawd/...` everywhere
2. **Dual-purpose framing:** numeric fact-checking with auto-fix (existing role) + structural GATE detection (new, detect-only). Copy framing from MA-state verifier.
3. **STEP 1C: Structural GATE detection** mirroring writer STEP 6: universals A (slug-no-year, HOLD), B (mostly N/A for glossary; LOW flag for income-anchored without table), C (≥3 .gov, HOLD if 0-1, WARN if 2), D (no `--`, AUTO-FIX MANDATORY); glossary-specific E (≤500 words, HOLD — DOMINANT), F (definition ≤80 words, HOLD if >100), G (≥3 inline links, HOLD if 0, WARN if 1-2), H (≤1 detail section, HOLD if 2+).
4. **GATE D auto-fix hoist:** "AUTO-FIX MANDATORY" framing + Common-verifier-error callout naming the Ohio MA-state failure mode (verifier saw 11 `--` instances and marked them Category J informational instead of fixing).
5. **GATE E mechanical strictness:** embed the Node one-liner from PRD §6 directly in the verifier prompt — don't trust verifier self-count.
6. **`keyTerms` shape patch:** verifier must flag flat-array `keyTerms` as a schema warning (LOW flag, ship).
7. **STEP 6 return JSON:** include `gates: {a,b,c,d,e,f,g,h}` + `held` status.
8. **Slug-prohibition defense in depth:** verifier sees slug ∈ {magi, deductible, oop-max} → HOLD immediately with `error: "track-c-prohibited-slug"`.

Run the updated verifier on the 5 Phase-4 test articles. Expected: all `approved` or `corrected`. If any spurious HOLD: tighten the verifier prompt before shipping (common over-fires: GATE B applied to non-income-anchored term; GATE C counting plain-text mentions instead of hyperlinks; GATE G counting `relatedLinks` footer entries instead of inline body links).

**Artifacts produced:** `.claude/agents/coveredusa-glossary-verifier.md` (new) + `.bak.md` (backup) + verifier re-run output for each of the 5 test articles.

**Success criteria:** all 5 test articles pass the updated verifier with no spurious HOLDs. Verifier returns the expected gates object shape.

### Phase 5 — Activation + commit (~30 min)

Run pre-activation tripwires:

```bash
git -C ~/clawd/projects/covered-usa diff --name-status HEAD | grep "content/data/glossary/" | grep "^R"  # must be empty
git -C ~/clawd/projects/covered-usa diff HEAD -- content/data/glossary/magi.json content/data/glossary/deductible.json content/data/glossary/out-of-pocket-maximum.json  # must be empty
```

If either tripwire fires, STOP and audit. Then 4 commits per Track C-prime pattern:

1. **Commit 1 (clawd-workspace):** `.bak` move + new glossary-writer prompt
2. **Commit 2 (covered-usa):** 5 test articles + any verifier-caught Phase 4.5 corrections
3. **Commit 3 (covered-usa):** Requirements matrix + 3 verifier reports + retest verifier output in `content/fanout/analysis/`
4. **Commit 4 (clawd-workspace):** `.bak` move + new glossary-verifier prompt

Push order: clawd-workspace first (writer + verifier prompts go live for cron pickup), then covered-usa (test articles deploy to Vercel auto-deploy).

Write memory entry `feedback_track_c_glossary_writer_shipped.md` with per-article word counts, prohibited-slug check confirmations, 5-line summary of shipped articles, and bloat patterns successfully avoided.

**Success criteria:** all 4 commits land, push succeeds, Vercel deploys clean, no Telegram HOLD notifications fire on subsequent cron ticks for glossary topics.

---

## Aggregate uncertainties list

### BLOCKER (cannot execute without human answering)

None. Every blocker-tier question I could think of is answered somewhere in the master brief + this PRD. The PRD is unusually thorough — it spells out the 5 test slugs by name, the prohibited-slug list with rationale, the exact GATE thresholds, the exact word-count Node one-liner, the routing per gate, the pre-flight commands, and the post-flight tripwires.

### GUESS (would proceed with reasonable interpretation; flag for review)

1. **STEP numbering for the prohibited-slug check.** PRD §8 #5 says "If the cron payload arrives with slug = magi, the writer returns `{slug, status: 'error', error: 'track-c-prohibited-slug: magi belongs to Track E downsize'}`." I would place this check at STEP 1 (before research/planning to fail fast). The PRD doesn't specify the STEP placement; I'd guess STEP 1 because STEP 0 is reserved for context-loading per master brief Phase 2.

2. **Does `validate-glossary.js` exist as a Stage-1 validator?** Master brief §3 Phase 4 says "Run validators in strict mode (`STRICT_QUALITY_LINT=1` for JSON validators; manual check for blog markdown)." The PRD references `scripts/validate-medicare-advantage.js` analogously but doesn't confirm a glossary equivalent exists. I would `ls projects/covered-usa/scripts/validate-*.js` to check; if no glossary validator exists, I'd fall back to manual JSON-schema validation against `Glossary` TypeScript interface + the mechanical word-count check. Flagging because if the validator doesn't exist, "5/5 strict mode" passes degrades to "5/5 manual schema-check pass" which is a weaker bar.

3. **`alternateNames` content.** Schema requires `alternateNames: string[]` (plain strings, not LocalizedString). For `premium-tax-credit` the obvious entry is `["PTC", "Premium Tax Credit", "ACA premium subsidy"]`. For `copayment-vs-coinsurance` the natural fit is `["copay", "coinsurance", "cost sharing"]`. PRD doesn't explicitly direct content for this field per slug; I'd populate from common usage + audit JSON if it lists synonyms for the term, otherwise infer.

4. **`category` enum mapping for the 5 test slugs.** PRD §2 lists the locked enum: `ACA | Medicare | Medicaid | Insurance | Tax | Billing | Coverage`. I would map: PTC → `Tax`, copay-vs-coinsurance → `Insurance`, in-network-vs-out-of-network → `Insurance`, SEP → `ACA` (or `Coverage`?), OEP → `ACA` (or `Medicare`? — OEP applies to both ACA and Medicare). The SEP/OEP ambiguity is real; I'd default to `ACA` for SEP and `ACA` for OEP since the master brief framing leans ACA-first, but Medicare-OEP is a distinct concept. Flagging because the category enum drives `schema.about` routing.

5. **`workedExample` for PTC.** Income-threshold lookup is the obvious annualLimits table. Does PTC also warrant a workedExample showing the subsidy calc (e.g., "household of 3 at 200% FPL gets X subsidy")? PRD §3 says workedExample is "only for calculation-shaped terms" and PTC is calculation-shaped. I would include one. But adding a workedExample pushes word count up; with GATE E at 500 words, I might have to trim quickDefinition or drop the detailSection entirely. Trade-off call.

6. **`ctaTarget` enum value for each slug.** Locked enum: `screener | analyzer`. Glossary PRD doesn't direct which CTA per slug. PTC → `screener` (subsidy eligibility screening); copay-vs-coinsurance → `analyzer` (plan analysis); in-network-vs-out-of-network → `analyzer`; SEP → `screener` (event-triggered eligibility); OEP → `screener`. I'd guess based on the term's "what does the reader want next" intent.

7. **Inline-link insertion when the link-index `byPhrase` doesn't match natural definition prose.** The PRD requires ≥3 inline body links per GATE G. But what if the term's natural definition prose doesn't contain any byPhrase keys? E.g., `copayment-vs-coinsurance` body prose might not naturally include the phrase "federal poverty level." I would either (a) work the phrase into the prose deliberately or (b) place links in FAQ answers where the topic adjacency is more natural. PRD §3 says "max 5 inline body links per page" so I have headroom. Flagging because forcing phrases into prose to satisfy a link-density gate has bloat risk.

8. **GATE B for `premium-tax-credit`.** PRD §5 says GATE B is "N/A for most glossary; if PTC / MAGI / FPL with absent income table → ship + LOW flag." PTC's annualLimits table by household size IS the natural fit for a 9-row table — would the PTC test article need 9 data rows (sizes 1, 2, 3, 4, 5, 6, 7, 8 + "each additional person")? I would interpret yes if I include the income-threshold table, since GATE B's universal rule per master brief §7 is "exactly 9 data rows" for any household-size table. But the PRD's §3 "one lookup table" wording is ambiguous whether 9 rows is mandatory in that table or whether a shorter income-bracket table is acceptable.

9. **Spanish parity scope.** Every LocalizedString needs both `en` AND `es`. For a 500-word EN page, the ES translation adds another ~500 ES words. The GATE E word-count one-liner in PRD §6 counts ONLY EN. The verifier's GATE E should likewise count only EN. I would interpret yes (only EN counts toward the 500 cap). Flagging because if ES counted too, the cap becomes effectively 250 EN.

10. **The `_queue` directory entry.** Slug-collision check expects output `_queue, deductible, magi, out-of-pocket-maximum`. `_queue` is presumably a subdir, not a slug. My collision check would `xargs -n1 basename | sed 's/.json//'` — the `_queue` directory wouldn't match the `*.json` glob, so it shouldn't appear. The PRD listing it in the expected output is mildly confusing. I would proceed assuming `_queue` is a subdir holding queued-but-not-shipped articles and my test slugs are safe.

### MINOR (cosmetic ambiguity; doesn't affect execution)

1. **PRD §6 `gates` object key naming.** PRD §9 routing per gate names `gates.b: "n/a"` (lowercase letter key). Master brief §3 Phase 4.5 #5 says `gates: {a, b, c, d, ...}`. Consistent — proceed with lowercase letter keys.

2. **Whether `topicCluster` is one cluster per page or one cluster per template.** PRD §2 says "e.g., `'glossary'` or `'premium-tax-credit'` — slug-style; one cluster per page." Slightly ambiguous whether the cluster is per-term or per-template; I'd use per-term (`premium-tax-credit`, `copayment-coinsurance`, etc.) for richer cluster signal.

3. **The `readingTime` field format.** PRD §2 says "e.g., '3 min read' — should be SHORT, not '5 min read'." For ≤500 words I'd compute ~2-3 min. Format: `"2 min read"` or `"3 min read"`. Trivial.

4. **The "_queue" directory** in the collision-check expected output (also noted in GUESS #10, but the mismatch between `xargs basename` output expectations and reality is purely cosmetic — the check still works for collision-detection purposes).

5. **Whether the PRD's "300-500 words" target in §0 conflicts with the "≤500 words" hard cap in §3/§6.** §0 says "300-500 words" implying a floor as well as a cap. §6 GATE E only enforces the cap. I'd interpret: 300 is a soft floor (don't go below without justification), 500 is the hard cap. Definitional terms might land at 250-300 words naturally and that's fine. The PRD doesn't explicitly require a floor; treating it as guidance not gate.

6. **`change_log` field in STEP 8 return JSON.** Master brief lists `change_log` in the JSON shape but doesn't define its structure for writer output (it's clearer in verifier context). I'd emit `change_log: []` from writer (writer doesn't make changes; verifier does) and let the verifier populate it during Phase 4.5.

---

## Verdict

**YES_WITH_GUESSES.**

The PRD + master brief are sufficient for a fresh session to execute Track C-prime for Glossary end-to-end. There are zero true BLOCKERS. The ~10 GUESS-tier items are all "reasonable interpretation" calls a competent junior engineer can make without halting; none risk shipping broken work. The MINOR items are cosmetic.

The strongest evidence of self-containment: the PRD spells out the 5 test slugs by name, the prohibited slugs by name, every gate threshold with routing, the exact word-count Node one-liner, the schema interface field-by-field, the 6 things to SUBTRACT, the 8 common failure modes to watch for, and the 4-commit Phase 5 deliverable shape. The quick reference card in §12 is genuinely the kind of artifact you could print and pin to the monitor.

---

## 400-word summary

**(a) Blocker count:** 0
**(b) Guess count:** 10
**(c) Verdict:** YES_WITH_GUESSES

**(d) Three most impactful uncertainties:**

1. **Validator existence.** Master brief §3 Phase 4 says "run validators in strict mode" but the PRD doesn't confirm whether `scripts/validate-glossary.js` exists. Pass criterion "5/5 strict mode" is materially weaker if I have to fall back to manual schema validation. A single line in the PRD ("the strict-mode validator is `scripts/validate-glossary.js` — run with `STRICT_QUALITY_LINT=1`" OR "no strict validator exists; use mechanical JSON parse + the GATE E word-count one-liner as the strict bar") would close this.

2. **GATE B applicability for PTC's annualLimits table.** Universal GATE B mandates exactly 9 data rows on household-size tables. PTC's natural annualLimits table is income-by-household-size. PRD says GATE B is N/A for most glossary but "if PTC / MAGI / FPL with absent income table → ship + LOW flag." Unclear whether the PTC test article's table must hit 9 rows or whether a shorter bracket table satisfies. A worked example for PTC in PRD §6 (or §7's PTC row) showing the expected table shape would close this.

3. **The category enum mapping for SEP and OEP.** Locked enum is `ACA | Medicare | Medicaid | Insurance | Tax | Billing | Coverage`. SEP applies to both ACA and Medicare (and Medicaid). OEP applies to both ACA OEP and Medicare OEP. The PRD doesn't direct category-per-test-slug. A 5-row mapping table in §7 (slug → category → ctaTarget) would eliminate the guesswork.

**(e) PRD clarity assessment:**

This is the most self-contained PRD I could ask for. The §0 framing ("THIS IS DOWNSCOPE WORK — read first, no exceptions") sets the right cognitive posture immediately — the bug is reaching for "I'll add one more section to be thorough," and the PRD names that bug explicitly. The strict-prohibition block on `magi/deductible/oop-max` is repeated 4 times across §0.1/§7/§10/§12 which is exactly the right paranoia level given the audit's biggest risk is "a fresh Claude regenerating MAGI thinking it's fixing it." The §11 pre-flight checklist with literal commands is the gold standard for fresh-session ergonomics. The §12 quick reference card is genuinely useful as a monitor pin. Praise: the §8 "Common failure modes" section preempts the 8 most likely first-pass mistakes with named examples; the §6 gate-by-gate routing is explicit about HOLD vs WARN vs AUTO-FIX. Minor critique: a per-slug expected-shape table in §7 (category, ctaTarget, has annualLimits Y/N, has workedExample Y/N) would eliminate ~5 of the 10 GUESS-tier uncertainties in one stroke.
