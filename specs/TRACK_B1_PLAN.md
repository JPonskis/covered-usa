# Track B1 Plan — Blog Writer Rewrite

**Version:** 1.1 (verifier-corrected)
**Date:** 2026-05-14
**Purpose:** Self-contained execution plan for rewriting `coveredusa-article-writer.md` (the daily blog writer agent) so it consumes the FANOUT_FORMULA.md + universal rules + all prior research findings. Written specifically as a post-compact handoff doc — the post-compact agent reads this first and executes.

---

## 0. Read order (do this FIRST, post-compact)

Before doing anything, read these files in order:

1. **This doc** (TRACK_B1_PLAN.md) — orient
2. **`projects/covered-usa/specs/FANOUT_FORMULA.md`** — the formula being applied (especially §3 universals + §4.9 daily-blog recipe)
3. **`projects/covered-usa/specs/REFACTOR_ROADMAP.md`** — the broader execution context (where B1 fits)
4. **`.claude/agents/_universal-rules-block.md`** — the shared rules block to reference (5 universal rules + 19-state program brand list)
5. **`.claude/agents/coveredusa-article-writer.md`** — the CURRENT writer prompt (the thing we're rewriting; preserve what works)
6. **`.claude/claudeclaw/jobs/coveredusa-seo-stage1.md`** — Stage 1 cron, the context source that calls the writer
7. **`.claude/claudeclaw/jobs/coveredusa-seo-stage2.md`** — Stage 2 cron, deploys the output
8. **`projects/covered-usa/content/fanout/analysis/audit-blog-writer.json`** — the writer audit findings driving this rewrite
9. **`projects/covered-usa/specs/CURRENT_STATE_AUDIT.md`** §4.8 — daily blog audit findings from before the formula

Then start Phase 1.

**Scope boundary clarification:** the drug `iraNegotiation` render bug (`REFACTOR_ROADMAP.md` §1.1) is OUT OF SCOPE for B1 — already fixed in commit `1fb5fb9`. B1 is the blog writer ONLY.

---

## 1. The framing (don't lose this)

**The current writer isn't bad.** It has working pieces — schema emission, FAQ structure, paragraph templates, translation handling, source discipline, em-dash rules. Don't blow it away. Layer the new rules ON TOP.

**The new writer = old writer + everything we've learned in the last week.** Specifically:
- All 5 universal rules from FANOUT_FORMULA.md §3
- The §4.9 daily-blog FPL super-shape recipe
- The Bing-wants-lookups strategic thesis
- All audit-flagged blog gaps from `audit-blog-writer.json`
- All framework rules from AI_OPTIMIZATION_FRAMEWORK.md
- URL_SLUG_FRAMEWORK rules (no year in slug)
- LINK_TARGET_MANIFEST consumption (3-5 inline body links from `content/link-index.json`)
- The PHASE_5_BRIDGE.md §3 empirical re-weighting (Specification + Equivalent + Canonicalization dominate)

**Nothing gets dropped silently.** If something doesn't make it in, the commit message documents WHY (deliberately superseded by something newer).

---

## 2. The four phases (execute in order)

### Phase 1 — Inventory (~30 min)

**Goal:** Compile a master list of EVERY rule/requirement the new writer must honor. Output is a "requirements matrix" doc.

**Steps:**

1. Spawn a planner agent with this prompt:
   ```
   You are building the requirements matrix for the CoveredUSA blog writer
   rewrite. Read these source files and extract every rule/requirement the
   new writer must honor:
   - .claude/agents/coveredusa-article-writer.md (current writer)
   - .claude/agents/_universal-rules-block.md (shared universals)
   - projects/covered-usa/specs/FANOUT_FORMULA.md (especially §3 + §4.9)
   - projects/covered-usa/specs/AI_OPTIMIZATION_FRAMEWORK.md
   - projects/covered-usa/specs/URL_SLUG_FRAMEWORK.md
   - projects/covered-usa/specs/LINK_TARGET_MANIFEST.md
   - projects/covered-usa/specs/CURRENT_STATE_AUDIT.md (especially blog template section)
   - projects/covered-usa/content/fanout/analysis/audit-blog-writer.json
   - projects/covered-usa/specs/PHASE_5_BRIDGE.md §3 (grounding query data)

   Output: structured matrix at projects/covered-usa/content/fanout/analysis/b1-requirements-matrix.md
   Categories:
   - MUST (formula compliance)
   - MUST (audit-flagged blog gaps)
   - MUST (preserved from existing writer)
   - MUST (framework rules)
   - Strategic posture
   - Slug rules
   - Link-index consumption

   For each requirement, cite source doc + section. Flag any conflicts
   between sources (e.g., old writer says X words, formula says Y words).
   ```

2. Read the resulting matrix. Note any conflicts that need resolution.

3. **Resolve conflicts.** Where the formula contradicts the existing writer, the FORMULA WINS. Where the audit contradicts the formula, both go to me (the executing agent) for human-style judgment.

### Phase 2 — Draft (~60 min)

**Goal:** Write the new writer prompt. Save as `.claude/agents/coveredusa-article-writer.md`. Move the old one to `.claude/agents/coveredusa-article-writer.bak.md` first.

**Structural skeleton (target ~4,500-5,500 words):**

```
1. Identity + role (2 sentences)
2. INPUTS section (KEYWORD, TITLE, STATE, PROGRAM, TOPIC_CLUSTER, FORMULA_RECIPE, UNIVERSAL_RULES, SOURCE, TARGET, ROW_NUMBER, SHEET_ID)
3. STEP 0 — Pre-write context loading
   - Load .claude/agents/_universal-rules-block.md verbatim
   - Load content/link-index.json to know valid internal-link targets
   - Confirm topic cluster is one of the known clusters or a new one
4. STEP 1 — Research
   - Use existing research patterns (gov sources, year-anchored facts)
   - Apply Bing-wants-lookups thesis: prioritize numeric thresholds, tables, charts
5. STEP 2 — Plan article structure
   - Apply §4.9 FPL super-shape recipe (or topic-appropriate recipe)
   - Required H2s per recipe + universal rules
   - Required tables (household-size income table for income-gated topics)
   - Required FAQ topics
   - Required how-to-apply section with all 5 sub-fields
6. STEP 3 — Write content
   - Apply 5 universal rules throughout
   - Year-anchoring rule: never $/% without year nearby
   - State-context rule: thread state name everywhere if in scope
   - Use state-named program brands (Medi-Cal, AHCCCS, etc.) when applicable
   - 3-5 inline body links to canonical URLs from link-index.json
   - 3+ inline outbound .gov citations
   - Paragraph length 150-300 words
   - Em-dash discipline (zero em-dashes)
7. STEP 4 — Write frontmatter
   - Slug: no year (URL_SLUG_FRAMEWORK Rule 2), ≤60 chars, kebab-case
   - topicCluster + keyTerms.{en,es} (LINK_TARGET_MANIFEST §1)
   - hreflang for both en + es
   - target field (screener vs analyzer routing)
8. STEP 5 — Self-validation before save
   - Em-dash scan
   - Paragraph length check
   - Meta cap check (title ≤70, description ≤160)
   - Year markers present in title/H1/meta/first-paragraph
   - 3+ inline outbound .gov links present
   - 3-5 inline internal links present
   - household-size table present if income-gated topic
   - how-to-apply section present
9. STEP 6 — Save + return JSON result
   - Save to projects/covered-usa/content/blog/[slug].md
   - Return {slug, status: "success", topicCluster, keyTerms, gapsFlagged}
10. CRITICAL BOUNDARIES (negative space)
    - NEVER use em-dashes
    - NEVER write $/% without a year
    - NEVER include year in slug
    - NEVER skip the how-to-apply section
    - NEVER use "California Medicaid" instead of "Medi-Cal" when state-named brand applies
```

**Wording patterns to preserve from existing writer:**
- The `## STEP N` numbered structure (familiar; the cron parses it)
- The atomic-write pattern (don't save until self-validation passes)
- The JSON return shape (Stage 1 cron parses this)
- The translation handling (en + es file pair)
- The humanizer voice rules (no AI tells, no corporate verbs)

### Phase 3 — Multi-agent verification (~45 min)

**Goal:** Catch errors before the prompt goes live.

**Spawn 3 agents in parallel:**

**Verifier A — Critic against requirements matrix:**
```
You are reviewing the freshly-drafted CoveredUSA blog writer prompt.
Read these:
1. .claude/agents/coveredusa-article-writer.md (the new draft)
2. projects/covered-usa/content/fanout/analysis/b1-requirements-matrix.md (Phase 1 output)
3. .claude/agents/_universal-rules-block.md
4. projects/covered-usa/specs/FANOUT_FORMULA.md §3 + §4.9

For EACH requirement in the matrix, verify the new writer enforces it.
Flag anything missing, contradictory, or weakly enforced.
Return: structured pass/fail per requirement + recommended edits.
Save report to: projects/covered-usa/content/fanout/analysis/b1-verifier-a.md
```

**Verifier B — Cold fresh-eyes (with hard-contract awareness):**
```
You are designing a CoveredUSA blog writer prompt from scratch. Read these:
1. projects/covered-usa/specs/FANOUT_FORMULA.md
2. .claude/agents/_universal-rules-block.md
3. projects/covered-usa/specs/AI_OPTIMIZATION_FRAMEWORK.md
4. projects/covered-usa/content/fanout/analysis/audit-blog-writer.json

IMPORTANT: your sketch will be compared against an existing writer that
has hard contract constraints YOU MUST RESPECT — even though you're
writing from scratch:
- The Stage 1 cron parses the writer's JSON return shape; do not change it
- The writer must perform atomic writes (don't save until self-validation passes)
- The writer must produce both en + es file pair (translation pair invariant)
- The writer must follow the existing `## STEP N` numbered structure (the cron parses these)

Sketch the structure of YOUR ideal blog writer prompt — section list,
key rules, validation steps. Don't read the existing draft. Output a
~2,000-word structural sketch.
Save report to: projects/covered-usa/content/fanout/analysis/b1-verifier-b.md
```

**Verifier C — Differential (catches silent drops from old writer):**
```
You are doing a differential audit of the CoveredUSA blog writer rewrite.
Read these:
1. .claude/agents/coveredusa-article-writer.bak.md (the OLD writer preserved as .bak)
2. .claude/agents/coveredusa-article-writer.md (the NEW writer)
3. The git diff between them
4. The commit message draft for the rewrite

For every rule, instruction, or constraint in the OLD writer, verify
either: (a) it's present in the NEW writer, OR (b) the commit message
explicitly documents WHY it was deliberately superseded.

Flag any silent drops — anything from the old writer that vanished
without justification.
Save report to: projects/covered-usa/content/fanout/analysis/b1-verifier-c.md
```

After all three finish: compare Verifier B's sketch against the actual draft (blind-spot check). Address Verifier A's matrix gaps (requirements completeness check). Address Verifier C's silent drops (regression check).

Iterate the writer prompt until all 3 verifiers pass.

### Phase 4 — Manual test cycle (~90 min)

**Goal:** Prove the new writer produces formula-compliant output before letting the cron use it.

**Steps:**

1. Pick 5 test topics from the queued sheet rows (`scripts/coveredusa-select-articles.js` reads from sheet ID `1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU`, columns A-R; pick rows with status=Ready). Mix to maximize coverage:
   - 1 FPL-style topic (tests §4.9 daily-blog recipe directly) — must be SOURCE=Google
   - 1 procedure-cost-style topic — must be SOURCE=AI (tests SOURCE-conditional FAQ-density logic)
   - 1 Q&A-style topic (e.g., "Does Medicare cover X")
   - 1 state-specific topic (tests state-context rule + brand list) — must be TARGET=screener
   - 1 persona-adjacent or medical-bill-related topic — must be TARGET=analyzer (tests TARGET routing preserves .gov citation density)

2. Invoke the new writer agent on each topic SEPARATELY (not via cron — direct manual invocation). Pass full payload including TOPIC_CLUSTER, FORMULA_RECIPE, UNIVERSAL_RULES per Stage 1 cron format.

3. For each output:
   - Run validators on the produced .md file (in STRICT MODE — `STRICT_QUALITY_LINT=1`)
   - Spawn a verifier agent to score the article against:
     - The 5 universal rules (yes/no on each)
     - The §4.9 daily-blog recipe shapes (% covered)
     - The audit-flagged gaps (year markers, hreflang, external citation density, household-size table for FPL topic, year-drift detection, etc.)

4. **Pass criteria (BOTH must hold):**
   - **5 of 5 articles pass strict-mode validators** (year markers, household-size table presence on income-gated topics, .gov citation density ≥3, em-dash count = 0, slug rules, no year-drift) — these are mechanical and binary
   - **4 of 5 articles score ≥80%** on the universal-rule rubric (multi-agent verifier scoring)

5. If failing: identify root cause (writer prompt issue vs source data issue), fix, re-test.

6. **Keep the cron running on the OLD writer throughout Phase 4.** Don't activate the new writer until pass criteria met.

### Phase 5 — Activation + commit

When Phase 4 passes:

1. **Pre-activation tripwires:** confirm zero file renames in content/blog/, zero slug changes (slug-stability rule from URL_SLUG_FRAMEWORK).

2. **Commit granularity** — split into 3 commits for git-blame clarity:
   - Commit 1: `.bak` move + new writer prompt + commit message documenting what changed
   - Commit 2: 5 test articles (with full Phase 4 verification reports referenced)
   - Commit 3: B1 plan + requirements matrix + verifier reports archived

3. **Stay-attached for first cron tick post-activation.** After commit, monitor the next cron run (within ~6 hours) — read each produced article through validators in strict mode. If any of the first 3 articles fails strict validators OR scores <80% on the universal-rule rubric, IMMEDIATELY:
   - Roll back: `cp .claude/agents/coveredusa-article-writer.bak.md .claude/agents/coveredusa-article-writer.md`
   - Commit the rollback
   - Surface to Jacob with the specific failure mode

4. **Extended success window:** track output for 3 cron ticks (9 articles). Success means: zero strict-validator failures, average rubric score ≥80%. Below that → rollback per step 3.

5. **Memory entry on completion:** save `feedback_b1_blog_writer_shipped.md` summarizing what shipped, the test results, and any new conventions to persist across future sessions.

---

## 3. The "must include" checklist

The new writer MUST honor every item below. Phase 3 verification confirms this; Phase 4 testing proves it.

### From the 5 universal rules (`_universal-rules-block.md`)
- [ ] STATE-CONTEXT-EVERYWHERE when state in scope (use state-named program brand from 19-state list)
- [ ] ELIGIBILITY-HOUSEHOLD-SIZE-TABLE when income gates eligibility
- [ ] HOW-TO-APPLY section with 5 sub-fields (enrollment dates, numbered steps, .gov URL, documents needed, common denial reasons)
- [ ] YEAR MARKERS in title, H1, meta, first paragraph, every numeric table caption — and never $/% without year nearby
- [ ] AUTHORITATIVE SOURCE NARROWING (3+ inline outbound .gov / .edu / KFF / etc. with domain in anchor text)

### From FANOUT_FORMULA.md §4.9 daily-blog recipe (FPL super-shape — verbatim H2 list)

For FPL / Medicaid-income / ACA-subsidy / income-anchored topics, REQUIRED H2s (in this order):
- [ ] FPL chart [year] (the canonical lookup table — household size 1-8 × percentage thresholds 100% / 138% / 150% / 200% / 250% / 400%)
- [ ] By household size — explanatory section under the chart
- [ ] By percentage thresholds — what each threshold (100% / 138% / 150% / 200% / 250% / 400%) qualifies for
- [ ] FPL × Medicaid eligibility (with state expansion overlay)
- [ ] FPL × ACA subsidies (premium tax credit thresholds)
- [ ] FPL × CHIP (where applicable)
- [ ] FPL × WIC (income guidelines)
- [ ] FPL × SNAP (income guidelines)
- [ ] Alaska + Hawaii FPL adjustments (always include the per-state higher thresholds)
- [ ] State-by-state Medicaid expansion status table
- [ ] How to apply (per universal rule §3.4)

For non-FPL daily-blog topics, the relevant subset of these H2s + the topic-appropriate analog tables.

- [ ] Year-anchoring rule (never bare $/%)
- [ ] **Year-drift detection in self-validation** — explicit check that no numeric threshold in body content uses a prior-year value while the surrounding caption says current year. (The audit caught a real bug: hospital-bills article had 2025 FPL numbers labeled as 2026.)

### From audit-blog-writer.json (audit-flagged gaps)
- [ ] External URL density: every numeric claim gets an inline `.gov` citation
- [ ] hreflang in metadata for both en + es
- [ ] topicCluster + keyTerms.{en,es} in frontmatter
- [ ] No year in slug
- [ ] target field set (screener vs analyzer)
- [ ] dateModified consistency (articleSchema + sitemap match)
- [ ] Em-dash purge in self-validation
- [ ] Year-drift detection in self-validation (audit caught 2025-FPL-mislabeled-as-2026 in hospital-bills article)
- [ ] SOURCE-conditional FAQ-density consistency (current writer has a SOURCE=AI vs SOURCE=Google branch that drops FAQs inconsistently)
- [ ] TARGET=analyzer routing preserves .gov citation density (audit flagged a TARGET=analyzer carveout conflict)

### From cron-pipeline (REFACTOR_ROADMAP.md §1.2 — already shipped in `f2f7791`)
- [ ] New writer must consume the new Stage 1 payload fields: TOPIC_CLUSTER, FORMULA_RECIPE, UNIVERSAL_RULES (per Stage 1 spec — already in cron, writer just needs to use them)
- [ ] If TOPIC_CLUSTER is missing or "unknown", writer falls back to inferring from KEYWORD + STATE + PROGRAM

### From AI_OPTIMIZATION_FRAMEWORK.md (preserved)
- [ ] Paragraph length 150-300 words (warn outside 80-400; fail outside 50-500)
- [ ] Meta title ≤70 chars; meta description ≤160 chars
- [ ] Structural proportion 25-35% (tables + lists ÷ total body)
- [ ] Em-dash count = 0 in body content
- [ ] Source count ≥3 with domain hygiene
- [ ] Schema: Article + MedicalWebPage stacked (already cascaded by Track A1)
- [ ] FAQPage schema auto-extracted from FAQ section
- [ ] HowTo schema when how-to-apply section is present
- [ ] Author byline = "Jacob Posner, Founder & Editor"

### From URL_SLUG_FRAMEWORK.md
- [ ] Slug ≤60 chars, kebab-case, no year, no underscores, no leading stop words
- [ ] No slug migrations (existing slugs immutable; new slugs follow rules)

### From LINK_TARGET_MANIFEST.md
- [ ] Load `content/link-index.json` at write time
- [ ] 3-5 inline body links to canonical URLs (no forcing; natural placement)
- [ ] Never self-link
- [ ] Never link a phrase already inside an existing link
- [ ] Never link in headings

### Strategic posture (FANOUT_FORMULA.md §1 thesis)
- [ ] Bias toward LOOKUP CONTENT (tables, charts, state-specific lookups)
- [ ] De-prioritize concept-only deep-dives (Bing has thin demand for those)
- [ ] Variant weighting: Specification + Equivalent + Canonicalization dominate; cover Entailment + Clarification; don't over-invest in Generalization/Translation/Follow-up

### Soft universal rules (FANOUT_FORMULA.md §3.5, §3.9, §3.10 — present in framework but not strictly enforced; writer-prompt instructions only)
- [ ] §3.5 Comparison framing (use "X vs Y vs Z" sections when topic involves choice between alternatives — Medicare Advantage vs Medigap vs Original; COBRA vs Marketplace vs Employer; etc.)
- [ ] §3.9 Demographic specificity (when topic has natural demographic dimensions: family of N, single mom, 1099, self-employed, senior — surface as table rows or H2 sections)
- [ ] §3.10 Table/chart-shape phrasing (use "chart" / "guidelines" / "by [dimension]" wording in section headings and table captions — Bing user search intent signal)

### Preserved from existing writer (humanizer + voice)
- [ ] No em-dashes (also enforced in universal rules)
- [ ] No filler phrases ("It's important to note...")
- [ ] No corporate verbs ("leverage", "utilize", "facilitate")
- [ ] No triple-stacks ("X, Y, and Z" three-noun chains used reflexively)
- [ ] No significance inflation ("groundbreaking", "revolutionary")
- [ ] Conversational sentence-length variation
- [ ] Atomic-write: don't save until self-validation passes
- [ ] JSON return shape unchanged (Stage 1 cron parses this)
- [ ] Translation pair: en + es file under correct paths

---

## 4. Critical boundaries (NEVER do)

1. **NEVER migrate existing slugs.** Even with 301s. Memory entry persists. URL_SLUG_FRAMEWORK Rule 1.
2. **NEVER activate the new writer before Phase 4 passes.** Cron stays on OLD writer until pass criteria (5/5 strict validators + 4/5 rubric ≥80%) met.
3. **NEVER blow away the old writer file.** Move to `.bak` so we can roll back.
4. **NEVER skip Phase 3 verification.** Multi-agent review caught real bugs in FANOUT_FORMULA.md v0; expect the same here.
5. **NEVER skip the slug-stability tripwires** before commit (`git diff --name-status | grep ^R` and `git diff -G '"slug":'`).
6. **NEVER add features beyond what this plan specifies.** No bonus refactors. Track B1 is blog writer only.
7. **NEVER edit `_universal-rules-block.md` as part of B1.** That block is shared infra for Track C; if B1 modifies it, all 7 future writers inherit untested changes. If a rule needs to change, do it as a SEPARATE commit explicitly noted as out of B1 scope.
8. **NEVER skip the en + es translation pair.** Both files must be saved atomically; if either fails, neither saves. (Preserved invariant from existing writer.)
9. **NEVER touch Track AA Phase 2, Track C, Track D, Track E, or Track F as part of B1.** B1 is one writer. Stay focused.

## 4b. Rollback recipe (if Phase 5 step 3 fails)

```bash
cd /Users/jacobposner/clawd
cp .claude/agents/coveredusa-article-writer.bak.md \
   .claude/agents/coveredusa-article-writer.md
git add .claude/agents/coveredusa-article-writer.md
git commit -m "Roll back B1 blog writer rewrite — failed Phase 5 first-tick validation

Reason: [specific failure mode here]
Rolling back to pre-B1 prompt; re-investigate before retry.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## 5. Success criteria

Track B1 is complete when ALL of these are true:

- [ ] New writer prompt drafted and committed
- [ ] Old writer preserved as `.bak`
- [ ] Phase 3 verification: ALL 3 verifiers (A matrix, B fresh-eyes, C differential) pass on the prompt
- [ ] Phase 4 testing: 5 of 5 articles pass strict-mode validators AND 4 of 5 score ≥80% on the universal-rule rubric
- [ ] Slug-stability tripwires green
- [ ] Stage 1 cron context-passing fix (TOPIC_CLUSTER + FORMULA_RECIPE + UNIVERSAL_RULES) is consumed correctly by the new writer
- [ ] Phase 5 first-tick validation: first 3 cron-produced articles all pass strict validators + average ≥80% rubric
- [ ] Phase 5 extended success: 3 cron ticks (9 articles) — zero strict-validator failures, average rubric ≥80%
- [ ] Memory entry written on completion
- [ ] Commit message documents what changed and why

After Track B1 completes, the daily blog cron is producing formula-compliant content automatically, every day, with marginal human cost = zero.

---

## 6. What comes next (Track C foreshadow)

Once Track B1 lands, Track C executes the same 4-phase pattern on each of the 7 template writers (in audit-priority order: MA-state → procedure → drug → persona → event → qa → glossary). Each template writer rewrite is independent and can be sequential.

The shared `_universal-rules-block.md` is already in place — every Track C writer just includes it by reference. Track B1 is the proof point that the pattern works.

---

## 7. Memory entries (for future-self continuity)

If Track B1 introduces NEW persistent rules (e.g., a new validator, a new convention), save a memory entry. Existing relevant memory:
- `feedback_never_migrate_slugs.md` — slug stability rule
- `feedback_structural_quality_over_volume.md` — quality > volume

---

## 8. Cross-references

- `specs/FANOUT_FORMULA.md` — the formula being applied
- `specs/REFACTOR_ROADMAP.md` — broader execution context
- `specs/AI_OPTIMIZATION_FRAMEWORK.md` — underlying framework rules
- `specs/AUDIT_RUBRIC.md` — scoring conventions for Phase 4 verification
- `specs/CURRENT_STATE_AUDIT.md` — pre-Phase-5 baseline
- `specs/URL_SLUG_FRAMEWORK.md` — slug rules
- `specs/LINK_TARGET_MANIFEST.md` — link routing
- `specs/PHASE_5_BRIDGE.md` — Phase 5 strategic context
- `specs/TRACK_AA_PLAN.md` — fan-out experiment design
- `content/fanout/analysis/audit-blog-writer.json` — writer audit findings
- `content/fanout/aggregate-phase1.json` — raw fan-out data
- `.claude/agents/_universal-rules-block.md` — shared universal rules

---

## 9. First 5 actions for the post-compact agent

1. **Read this doc** + the 6 source files in §0
2. **Confirm the plan with Jacob** — single-sentence check: "Phase 1 inventory next?" before executing
3. **Spawn the Phase 1 planner agent** with the prompt block in §2 Phase 1
4. **Read the resulting requirements matrix**, resolve any conflicts
5. **Begin Phase 2 — draft the new writer prompt**

---

*This is the plan. Self-contained, verification-first, audit-grounded. Post-compact agent reads this and executes. No major decisions deferred to the post-compact agent — this plan IS the decision.*
