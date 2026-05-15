# Event Writer + Verifier PRD (Track C-prime)

**Template:** event (`/event/[event]`)
**Files you will modify:** `.claude/agents/coveredusa-event-writer.md` + `.claude/agents/coveredusa-event-verifier.md`
**Output directory:** `projects/covered-usa/content/data/events/`
**Estimated time:** 2-3 hours
**Status:** event has the BEST per-template recipe of all 7 audited writers — 6/8 Bing-validated shapes, Entailment dominates at 56.4% (highest of any template). Writer already nails its §4.6 recipe. The work is layering universal rules on top + closing the em-dash discipline gap that shipped 23 em-dashes on T26.

---

## 0. Read order (MANDATORY before starting any phase)

1. **`projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md`** through §4 + §3.5 (default-toward-ship) + §6 (held-queue mechanism) + Appendix A (real-world drift case studies) + Appendix B (writer-leaks pattern). The master brief is the source of truth for the 4-phase pattern, the verifier dual-purpose model, and the gates routing.
2. **This PRD** end-to-end before spawning any agents.
3. **`~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_b1_blog_writer_shipped.md`** — the 8 B1 lessons.
4. **Reference implementations** (READ — do not modify in your session):
   - `.claude/agents/coveredusa-ma-state-writer.md` (cleanest example of Track C-prime writer pattern; copy STEP structure)
   - `.claude/agents/coveredusa-ma-state-verifier.md` (cleanest example of Track C-prime verifier pattern with all 3 patches applied; copy STEP 1A + STEP 1C)
   - `.claude/agents/coveredusa-article-verifier.md` (B1 + Track C-prime; daily blog verifier; useful for fact-check categories + the GATE D auto-fix hoist framing)
5. **Source docs cited in §1 below** — the Phase 1 planner agent will read these in full; you should skim first so you know what's in each.

If you skip step 1 or 4, you'll re-discover lessons we already learned. Don't.

---

## 1. Context inventory (Phase 1 planner reads these)

| Doc | What it tells you |
|---|---|
| `.claude/agents/coveredusa-event-writer.md` | Current writer prompt — already strong; what's there, what's missing |
| `.claude/agents/coveredusa-event-verifier.md` | Current verifier — Categories A-J for fact-check; needs GATE detection + dual-purpose framing + path portability |
| `.claude/agents/_universal-rules-block.md` | The 5 universal rules + 19-state program brand list |
| `projects/covered-usa/specs/FANOUT_FORMULA.md` §3 + **§4.6** | Universal rules + event recipe (8 dominant shapes, required H2s, required FAQ topics, HowTo schema) |
| `projects/covered-usa/specs/AI_OPTIMIZATION_FRAMEWORK.md` | The framework these recipes derive from |
| `projects/covered-usa/specs/URL_SLUG_FRAMEWORK.md` | Slug rules — never migrate existing slugs |
| `projects/covered-usa/specs/LINK_TARGET_MANIFEST.md` | Link routing system (link-index + topicCluster + keyTerms.{en,es}) |
| `projects/covered-usa/specs/CURRENT_STATE_AUDIT.md` §4.5 | Cross-template audit findings for event |
| `projects/covered-usa/content/fanout/analysis/audit-event-writer.json` | **THE most important doc** — synthesized audit of all 3 existing event pages with specific gaps + 9 recommended writer edits (E1 through E9) |
| `projects/covered-usa/specs/PHASE_5_BRIDGE.md` §3 | Track C bridge context |
| `projects/covered-usa/src/lib/events.ts` | The `TriggerEvent` TypeScript interface — your hard contract |
| `projects/covered-usa/content/data/events/just-lost-job-health-insurance.json` | **Gold standard structural reference** — cleanest existing page (3 em-dashes, all in source titles; secondaryDeadlines structure exemplary) |
| `projects/covered-usa/content/data/events/turning-65-medicare.json` | Best urgency framing (kind=window, P7M); reference for Medicare IEP shape |
| `projects/covered-usa/content/data/events/turning-26-health-insurance.json` | **What NOT to do** — strongest content body but worst style compliance (23 em-dashes, 80-char title); the em-dash leak that GATE D extra-strict exists to prevent |

---

## 2. Schema reminder + hard contracts

The `TriggerEvent` interface (`projects/covered-usa/src/lib/events.ts`) is your hard contract. Required top-level fields:

- `slug` (lowercase, hyphens — also the JSON filename)
- `eventName: LocalizedString`
- `category` — locked enum: `"Job Loss"` | `"Age Milestone"` | `"Family Change"` | `"Move / Relocation"` | `"Income Change"` | `"Plan Change"` | `"Lost Other Coverage"` (NOTE: "Move / Relocation" is ONE value with a slash inside — don't split)
- `topic` (string for schema.about, e.g., "Special Enrollment Period after Job Loss")
- `medicalSpecialty` (typically `"PublicHealth"`)
- `ctaTarget` — locked enum: `"screener"` | `"analyzer"` (almost always screener; analyzer only for bill-anchored events)
- `lastUpdated` (ISO YYYY-MM-DD)
- `readingTime` (string, e.g., "6 min read")
- `meta: {title, description}` (LocalizedString; **title ≤ 70 chars EN+ES, description ≤ 160 chars EN+ES** — validator enforces; T26 violated at 80; T65 ES-desc violated at 174)
- `hero: {h1, subhero}` (LocalizedString; subhero MUST contain the deadline number)
- `urgency: UrgencyNotice` — the distinctive feature of this template:
  - `kind` locked enum: `"deadline"` | `"window"` | `"no-deadline"`
  - `heading: LocalizedString` (phrasing depends on `kind` — see §3 below)
  - `body: LocalizedString` (consequences of missing the window)
  - `totalTimeISO8601`: ISO duration (`"P60D"`, `"P30D"`, `"P7M"`, `"P1Y"`) — REQUIRED when kind is `deadline` or `window`; MUST be `null` when `no-deadline`
  - `secondaryDeadlines?`: optional array of `{label: LocalizedString, days: number | null}`
- `quickAnswer: LocalizedString` (3-5 sentences with options + deadline + key qualifier)
- `introParagraphs: LocalizedString[]` (1-2 entries; per audit E6 lengthen to 150-300 words each)
- `steps: HowToStep[]` (MIN 3, typical 5-7; drives both `<ol>` rendering AND HowTo schema)
- `optionsComparison: OptionsComparison` (locked headers `["Option", "Typical cost", "Best for", "Deadline"]` EN; ES equivalent)
- `commonMistakes: CommonMistakesSection` (3-6 items)
- `detailSections?: DetailSection[]` (OPTIONAL — events already have lots of structure)
- `faqs: {en: LocalizedFAQ[], es: LocalizedFAQ[]}` (NOT LocalizedString — FAQ question/answer are FLAT STRINGS; most common drafter mistake)
- `relatedLinks: RelatedLink[]` (allowed prefixes: `/screener`, `/medical-bill-analyzer`, `/medicaid-income-limits`, `/medicare-eligibility`, `/aca-income-limits`, `/federal-poverty-level`, `/cost/<slug>`, `/drug/<slug>`, `/qa/<slug>`, `/glossary/<slug>`, `/event/<slug>`)
- `sources: EventSource[]` (min 3 primary citations)

**Additive Track C-prime fields (emit these too — clears `content-quality.js` warnings + Track A1 forward-compat):**
- `topicCluster: "event-sep"` (string, lowercase kebab-case; can also use `event-medicare-iep` for turning-65-style or `event-medicaid-pivot` for income-loss events)
- `keyTerms: {en: string[], es: string[]}` (NOT a flat array — see Phase 4.5 patches)
- `isLighthouse: false`
- `isDeprecated: false`

**Additive structured fields per audit E1 (P0 — the biggest gap):**
- `householdSizeTable?: { en: { caption, rows: [{householdSize, fpl138, fpl400}] }, es: {...} }` — REQUIRED when the event income-gates Medicaid/subsidy (lost-job, having-a-baby, divorce affecting subsidy, becoming-a-caregiver). N/A for pure scheduling events (turning-26, getting-married without subsidy implications).
- `documentsNeeded: { en: string[], es: string[] }` — REQUIRED, 4-8 items (proof of prior coverage / HIPAA cert / COBRA notice, pay stubs, SSN, address, marriage cert / birth cert / etc.)
- `stateRules?: [{state, rule, sourceUrl}]` — REQUIRED for events with known state variance (turning-26 state extensions, moving-states, having-a-baby for state CHIP brand). OPTIONAL otherwise.
- `commonDenialReasons: { en: string[], es: string[] }` — REQUIRED, 3-5 items (top Entailment Bing shape per §3.4 + §3.8 universal rules)

**Hard contracts (NEVER violate):**
1. JSON return shape from STEP 8 must be `{slug, status, claims_checked, claims_corrected, claims_flagged, change_log, gates, gates_failed, ...}` parseable by the cron. (STEP 8 is the return-JSON step per master brief; STEP 5 is write-body.)
2. Atomic write pattern: `<slug>.tmp.json` first → validate JSON parses → rename to `<slug>.json`
3. `## STEP N` numbered headings (cron may parse for logging)
4. Schema interface conformance — extra fields silently ignored at runtime; missing required fields crash the build
5. FAQ question/answer are FLAT STRINGS, not LocalizedString objects (most common drafter mistake)
6. Spanish parity — every LocalizedString needs both `en` AND `es`
7. No em-dash `—` (U+2014), no en-dash `–`, no double-hyphen `--` anywhere in body content (source.name titles allowed but should be normalized to colon per audit E5)
8. Path portability — use `$HOME/clawd/...` not `/Users/frankthebot/clawd/...`

---

## 3. The §4.6 recipe (expanded with worked examples)

**FANOUT_FORMULA.md §4.6 — event variant distribution:** Entailment 56.4% (HIGHEST of any template) / Equivalent 19.0% / Specification 17.1% / Clarification 6.6% / Follow-up 0.9%

**Bing-validated shapes:** 6 of 8 (HIGHEST validation rate of any template, tied with persona + daily-blog). The two unvalidated shapes (subsidy-eligibility-during-SEP, state-extension laws) are still strong recipe shapes — emit them.

### Top 8 dominant shapes (apply ALL of these in the new writer)

1. **COBRA-vs-Marketplace decision + .gov source** — Entailment, top weight. Render as both (a) a row in `optionsComparison` table AND (b) a NEW required narrative H2 / `comparisonNarrative` block giving 1 paragraph of prose comparison. Audit E4 calls out that prose narrative is missing — table alone doesn't satisfy Bing's comparison fan-out. **Required for job-loss / coverage-loss events; LOW-flag if missing.**
2. **SEP enrollment window + dates + state** — Specification. Render in `urgency.heading` + `urgency.body` + `urgency.totalTimeISO8601`. **Per GATE F:** dates MUST be explicit start + end dates anchored to the event date — e.g., "60 days from the date you lose coverage — typically January 1 through March 1 if you lose coverage on January 1, 2026." Generic "60 days" without anchored dates is GATE F FAIL.
3. **Immediate next steps (numbered, 3-7 steps)** — Entailment. Render in `steps[]`. Each step is one decisive action with a concrete verb (apply / enroll / log in / call / compare / calculate / check / submit) AND a specific noun (healthcare.gov / your state Medicaid agency / 138% FPL / Form SSA-1-BK / etc.).
4. **Documents needed for SEP application** — Entailment. Render in `documentsNeeded` array (4-8 items). Audit E1 P0 gap — 0/3 existing pages have this as structured field.
5. **Eligibility for subsidies during SEP** — Entailment. Render in `householdSizeTable` (138% FPL Medicaid + 400% FPL subsidy cliff columns × 9 rows household-size). Required when event income-gates eligibility.
6. **State-extension laws (turning-26 by state)** — Specification. Render in `stateRules[]` array. Required for turning-26, moving-states, having-a-baby (state-CHIP brand variance), Medicaid-unwinding.
7. **CHIP / Medicaid pivot if event-triggered** — Entailment. Render in body / FAQ + at least one row in `optionsComparison` for events touching family income (having-a-baby, divorce, lost-job, becoming-a-caregiver).
8. **HowTo schema with 5-7 numbered steps + totalTime** — Render in `steps[]` array (drives both `<ol>` AND HowTo schema markup). `urgency.totalTimeISO8601` provides the totalTime. **Per GATE E:** if absent OR < 3 steps → HOLD.

### Required FAQ topics (6-8 — must include ALL of these)

1. **What is the SEP window for [event]?** (canonical Q; deadline + start + end)
2. **How do I document [event] for SEP application?** (drives Documents-needed Entailment)
3. **What if I miss the SEP window?** (consequences — wait for OEP; pricing)
4. **Can I get retroactive coverage from [event]?** (varies by event + plan type)
5. **What's the difference between COBRA and Marketplace for [event]?** (required for job-loss / coverage-loss events; comparison framing per §3.5)
6. **What state-specific rules apply for [event]?** (required when stateRules populated)
7. *(Income-gated events only):* **Do I qualify for Medicaid after [event]?** (links household-size table to event)
8. *(Family-income events only):* **What happens to my children's coverage after [event]?** (CHIP pivot)

### Required-vocabulary checklist (event-specific)

Body content MUST explicitly use each of these canonical terms at least once:
- "Special Enrollment Period" (or "SEP")
- "Marketplace SEP" (or "Marketplace Special Enrollment Period")
- "COBRA"
- "1095-A"
- "qualifying life event" (or "QLE")
- "Section 9831 (HIPAA)" (only when discussing creditable coverage; required for lost-job + divorce)
- "60-day window" (or the appropriate window for the specific event)
- "CHIP" (where applicable — having-a-baby, divorce, lost-job, becoming-a-caregiver)
- State-named program brand if relevant — e.g., **"Medi-Cal"** for California events, **"AHCCCS"** for Arizona, **"BadgerCare"** for Wisconsin (per universal RULE 7 / §3.7)

This is auto-validatable via grep at STEP 6.

### Year-anchoring (RULE 4)

Every dollar amount + percentage must have a year in the same sentence or table caption. The Part B figures are 2026 (deductible $283, premium $202.90). FPL 2026 hh-1: $15,960; 138% FPL ≈ $22,025. ACA Marketplace OEP 2027: Nov 1, 2026 - Jan 15, 2027. Note the ACA subsidy cliff RETURNED for 2026 (enhanced PTCs from ARPA/IRA expired Jan 1, 2026) — any "cliff is extended" claim is OUTDATED.

### State-context

Per §3.2: state-context is **CONDITIONAL** for event template. Today the slugs aren't state-scoped (`/event/turning-26-health-insurance`, not `/event/california/turning-26-health-insurance`). Future Track D may add state-scoped event permutations. For now: don't force state-context on every page, but DO populate `stateRules[]` array for events with known state variance.

---

## 4. Audit findings synthesized (read `audit-event-writer.json` for the full version)

**Pages audited:** turning-26-health-insurance, turning-65-medicare, just-lost-job-health-insurance. Alignment scores: T26 strongest content / worst style; T65 best style + best urgency framing; JL gold-standard reference (cleanest of the three).

**THE biggest insight (audit's `biggestInsight` field):** "The event writer is the BEST of the 7 audited so far — and the event template is the BEST per-template Bing-validation score (6/8 shapes, 56.4% Entailment dominance). The gap is that the writer doesn't yet enforce the §3 UNIVERSAL rules — it nails its per-template Section 4.6 recipe but the §3.3 householdSizeTable, §3.4 documentsNeeded, §3.7 state-named brand, and §3.8 commonDenialReasons additions are missing as required fields."

**THE single highest-priority structural fix:** Add 4 new structured fields per audit E1 (P0). 0/3 existing pages have `householdSizeTable`, 0/3 have `documentsNeeded`, 0/3 have `stateRules` array, 0/3 have `commonDenialReasons`. Closing this gap converts event from "best per-template recipe" to "best universal-rule compliance."

**THE single highest-priority style fix:** Em-dash discipline. T26 shipped with 23 em-dashes (15 in body content). Writer rule says "NO em / en dashes" but writer self-discipline failed. **GATE D extra-strict (post-fix sanity grep) is the antidote.**

**9 recommended writer edits (E1 through E9 — your new writer must implement at least E1, E2, E3 as P0 required; E4, E5, E6 as P1 strongly recommended; E7, E8, E9 as P2 nice-to-have):**

- **E1 (P0):** Add 4 new required structured fields: `householdSizeTable`, `documentsNeeded`, `stateRules`, `commonDenialReasons`. Closes §3.3 + §3.4 + §3.7 + §3.8 universal-rule gaps.
- **E2 (P0):** Enforce em-dash purge with self-validation hook in STEP 6. Scan all body string fields (not source.name) for `—` / `–` / `--`. If found, fail and re-draft. Explicit field list: meta.title, meta.description, hero.*, urgency.*, quickAnswer, introParagraphs, steps[].name, steps[].text, commonMistakes.items, faqs.{en,es}[].question, faqs.{en,es}[].answer.
- **E3 (P0):** Hard-cap meta.title at 70 chars and meta.description at 160 chars in BOTH languages. Spanish runs ~10-20% longer than English; draft Spanish first or compress both to ~63/150 to leave margin. T26 hit 80 chars; T65 ES-desc hit 174 chars.
- **E4 (P1):** Require `comparisonNarrative` block (heading + body) for job-loss / aging-off / lost-Medicaid events. Separate from `optionsComparison` table.
- **E5 (P1):** Replace em-dash in source.name titles via colon normalization (`HealthCare.gov: Coverage to age 26` instead of `HealthCare.gov — Coverage to age 26`).
- **E6 (P1):** Lengthen introParagraphs target to 150-300 words each. JL intros are ~70 words each (well below universal target).
- **E7 (P2):** Add IRMAA + MSP household-size eligibility tables for Medicare-aging events (turning-65). Not in your test mix, so skip — but spec it for Track E refresh.
- **E8 (P2):** Inject state-named Medicaid brand in body / FAQ for events touching Medicaid (per universal RULE 7).
- **E9 (P2):** Add table-shape phrasing to `optionsComparison.caption` ("by deadline and cost", "chart", "guidelines") per §3.10.

---

## 5. Universal GATES (recap from master brief §7) — apply ALL to event

- **GATE A — slug must NOT contain a year.** Event slugs are pure event names (`getting-married`, `having-a-baby`, `moving-states`, `divorce`, `becoming-a-caregiver`). Never `getting-married-2026`. **HOLD on fail.**
- **GATE B — household-size table.** **CONDITIONAL for event** — APPLIES when the page's topic income-gates Medicaid/subsidy eligibility (lost-job, having-a-baby, divorce affecting subsidy, becoming-a-caregiver, income-change events). N/A for pure scheduling events (turning-26, getting-married without subsidy implications, plan-change without income shift). When applies: 9 data rows (sizes 1-8 + "each additional person") with year-tagged caption + 138% FPL + 400% FPL columns. **HOLD if applies + absent; mark `gates.b: "n/a"` if doesn't apply.**
- **GATE C — ≥3 inline outbound .gov / .edu / kff.org citations.** Required minimum: healthcare.gov (SEP rules) + medicaid.gov (year-round Medicaid pivot) + cms.gov OR kff.org (cost analysis). For Medicare-aging events: medicare.gov + ssa.gov. **HOLD on 0-1 .gov citations; WARN on exactly 2.**
- **GATE D — zero `--` (double-hyphen) anywhere. AUTO-FIX as style correction; never HOLD.** **EXTRA-STRICT for event:** the verifier should run the auto-fix as usual, AND THEN do a post-fix sanity-check `grep -n "—\|–\|--"` across all body string fields to confirm 0 em-dashes / en-dashes / double-hyphens remain. The T26 historical leak (23 em-dashes shipped) is the reason for the post-fix sanity check. The first fix-pass can miss instances; the second-pass grep catches them.

---

## 6. Event-specific GATES (your STEP 6 additions)

These are the template-specific gates. Frame them at STEP 6 with "STOP. Read this twice." language. Mirror the framing in the verifier's STEP 1C.

### GATE E — HowTo numbered steps present (5-7 steps with totalTime annotation)

Verify the JSON has `steps[]` with at least 3 entries (typical 5-7) AND `urgency.totalTimeISO8601` populated when `urgency.kind` is `deadline` or `window` (or null when `no-deadline`). HowTo schema is the distinctive Bing-citation surface for this template — pages that ship without it lose the schema.org markup that AI engines parse for "how to enroll after [X]" queries.

**Routing:** PASS if steps[] >= 3 AND totalTime correctly populated for kind. WARN if steps[] = 3-4 (under typical range, ship-with-LOW-flag). **HOLD if steps[] < 3 OR if kind = deadline/window AND totalTimeISO8601 = null.**

### GATE F — SEP enrollment-window dates explicit (start + end, not just "60 days")

Verify the JSON has explicit start date + end date in `urgency.body` (or a dedicated `enrollmentDates` field if you add one), anchored to the event date. E.g., "60 days from the date you lose coverage — typically January 1 through March 1 if you lose coverage on January 1, 2026." Generic "60 days" without anchored dates is FAIL.

**Routing:** PASS if anchored start + end dates present. WARN if only one of start/end present. **HOLD if neither start nor end date present (just "X days" with no anchor).**

### GATE G — COBRA vs Marketplace comparison framing (job-loss / coverage-loss events)

For events in category `"Job Loss"` OR `"Lost Other Coverage"` OR events whose topic involves coverage loss (divorce affecting spousal coverage, aging off parent's plan): verify the JSON has BOTH (a) a COBRA row in `optionsComparison` table AND (b) a `comparisonNarrative` block (or detailSection covering COBRA-vs-Marketplace) with at least 1 paragraph of prose comparison. Per audit E4.

**Routing:** PASS if both present. WARN if only table present (most common case — ship + LOW flag). N/A if event isn't job-loss / coverage-loss. **Never HOLD** (writer-side concern; LOW-flag).

### GATE D EXTRA-STRICT (event-specific addendum) — em-dash purge with post-fix sanity grep

Standard GATE D auto-fixes `—` / `–` / `--`. For event template specifically, the verifier MUST run a post-fix sanity grep over the entire JSON file (excluding `sources[].name` titles which can be normalized via colon per E5):

```bash
grep -n "—\|–" <slug>.json | grep -v '"name":' | grep -v '"sources"'
```

If the grep returns ANY hits after the auto-fix pass, the verifier must run a second auto-fix pass + re-grep. Repeat up to 3 times before flagging `gates.d: "WARN"` and shipping. This 2-pass-with-sanity-grep pattern is the antidote to the T26 historical leak (23 em-dashes shipped because the first auto-fix pass missed several instances inside nested objects).

**Routing:** PASS if 0 em-dashes / en-dashes after auto-fix passes. WARN if 1-3 remain after 3 passes (ship + LOW flag). **Never HOLD** (auto-fix policy holds).

---

## 7. Test mix — 5 events (Phase 4)

Skip the 3 already-shipped (turning-26-health-insurance, turning-65-medicare, just-lost-job-health-insurance — Track E will regen these for the audit's regen priorities). Test the new writer on 5 NET-NEW events:

| Slug | Why | GATE B applies? | GATE G applies? |
|---|---|---|---|
| `getting-married` | SEP trigger; spousal coverage decisions; tests Family Change category | N/A (scheduling event without subsidy implications by default) | N/A |
| `having-a-baby` | SEP; CHIP eligibility; pediatric coverage; tests Family Change + family-income pivot | YES (CHIP income-gates) | N/A |
| `moving-states` | SEP; Marketplace re-enrollment; Medicaid portability gaps; tests Move / Relocation category + stateRules | OPTIONAL (only if income-affected) | N/A |
| `divorce` | SEP; loss of employer-sponsored spousal coverage; tests Family Change + COBRA pivot | YES (income shift triggers subsidy recalc) | YES (loss of spousal coverage = COBRA decision) |
| `becoming-a-caregiver` | Medicaid Waiver programs; respite care funding; **most complex test** — tests Income Change + state-program-brand injection (Medi-Cal IHSS, NY CDPAP, etc.) | YES (caregiver income reduction often triggers Medicaid eligibility) | N/A |

**Pre-Phase-4 collision check:**
```bash
ls projects/covered-usa/content/data/events/*.json | xargs -n1 basename | sed 's/.json//'
```
Confirm none of your 5 planned slugs match existing slugs (currently: just-lost-job-health-insurance, turning-26-health-insurance, turning-65-medicare).

**Pass criteria:** 5/5 articles pass strict-mode validators + 4/5 score ≥80% on the rubric. **Plus** every test article has 0 em-dashes in body content (the audit's #1 style fix verified) AND every income-gated article has `householdSizeTable` populated (the audit's #1 structural fix verified).

---

## 8. Common failure modes for event (watch out for these)

1. **Em-dash leak in body prose** (T26 historical leak; 23 em-dashes shipped; writer rule was "NO em / en dashes" but discipline failed). Verifier's GATE D auto-fix + post-fix sanity grep is the antidote. Do NOT trust the writer to self-grep.
2. **"60 days" without anchored dates.** Writer says "you have 60 days from coverage loss" but doesn't compute "January 1, 2026 → March 1, 2026" for the worked example. GATE F catches this.
3. **Skipping COBRA-vs-Marketplace comparison for coverage-loss events.** Writer puts COBRA in the optionsComparison table row but doesn't write the prose narrative paragraph. GATE G catches this (LOW-flag).
4. **HowTo schema with totalTime missing.** Writer populates `steps[]` but forgets `urgency.totalTimeISO8601` (or sets it to null when kind=deadline). The HowTo schema then renders without a totalTime annotation, breaking the schema.org markup. GATE E catches this (HOLD).
5. **State extensions cited without enumerating which states.** Writer says "some states extend turning-26 to age 29" without naming NY/NJ/FL/PA/IL/CT/MA/WI. Audit flagged this on T26 — the structured `stateRules[]` array is the fix.
6. **Meta.title or meta.description over cap in Spanish.** ES runs 10-20% longer than EN. T65 ES-desc hit 174 chars (cap is 160). Draft ES first or compress both to leave 10-char margin.
7. **`urgency.kind` mismatch.** Writer uses `kind=deadline` for Medicare IEP (should be `kind=window` because the IEP starts 3 months BEFORE the 65th birthday). Verifier Category G catches this — but the writer should self-check via the urgency-kind decision table in the prompt.
8. **FAQ as LocalizedString objects instead of flat strings.** Most common drafter mistake. Schema interface enforces flat strings; if writer emits `{"question": {"en": "..."}, "answer": {"en": "..."}}` instead of `{"question": "...", "answer": "..."}`, JSON validates but page render breaks.
9. **`category` enum mistake — splitting "Move / Relocation" into two values.** It's ONE value with a slash inside. Locked enum.

---

## 9. Verifier scope (Phase 4.5 — per master brief)

Update `.claude/agents/coveredusa-event-verifier.md` to mirror the writer's new GATES.

**Non-negotiable patches per master brief Phase 4.5 (3 things to apply):**

1. **Path portability:** `/Users/frankthebot/...` → `$HOME/clawd/...` everywhere. Current verifier uses `/Users/frankthebot/...` in STEP 0 + STEP 1A.
2. **Add dual-purpose framing** in YOUR TASK section (numeric auto-fix + structural detect-only). Copy the framing from `coveredusa-ma-state-verifier.md` YOUR TASK section. Explain why the split: auto-edit prose = drift; structural failures should regen via writer.
3. **Insert STEP 1C: structural GATE detection** with all 4 universal + all 4 event-specific GATES (mirror writer's STEP 6).

**3 mandatory patches from the load-test (apply BOTH writer + verifier sides):**

- **GATE F count strictness (writer side):** strict count check on `steps[].length` + `optionsComparison.rows.length` + `commonMistakes.items.length`. Don't trust writer self-report. Use literal `JSON.parse(file)` length checks at STEP 6.
- **`keyTerms` shape example (writer side):** embed the `{en: [...], es: [...]}` template with explicit "do NOT emit flat array" rule. Show worked example in STEP 4.
- **GATE D auto-fix hoist (verifier side):** "AUTO-FIX MANDATORY" framing + Common-verifier-error callout naming the Ohio MA-state failure mode AND the T26 event failure mode (23 em-dashes shipped). Hoist GATE D auto-fix above Category J advisory framing — Category J reads as informational; auto-fix must read as mandatory.

**Routing per gate (event-specific):**
- GATE A FAIL → HOLD (slug bug)
- GATE B FAIL on income-gated event → HOLD; N/A on pure-scheduling event → skip + mark `gates.b: "n/a"`
- GATE C FAIL (0-1 .gov) → HOLD; WARN (2) → ship + LOW flag
- GATE D FAIL → AUTO-FIX as style correction; post-fix sanity grep; never HOLD
- GATE E FAIL (steps absent OR < 3 OR totalTime missing for kind=deadline/window) → HOLD (HowTo schema is the distinctive feature; never ship without)
- GATE F FAIL (no anchored start+end dates) → HOLD if neither present; WARN if only one
- GATE G FAIL (no comparisonNarrative for job-loss / coverage-loss) → ship + LOW flag (writer-side concern)
- Existing Categories A-J (verifier's current fact-check categories) → keep all; preserve grep-then-edit pattern; preserve force-flag rule for quickAnswer / urgency.heading / urgency.body central-claim corrections

**Verifier test:** after updating the verifier, run it on the 5 Phase-4 test articles. Expected: all `approved` or `corrected` (no false HOLDs). If any spurious HOLD: tighten the verifier prompt before shipping.

Common over-fire to watch: GATE B applied to pure-scheduling events (getting-married without income context); GATE G applied to non-coverage-loss events; GATE C counting plain-text mentions instead of hyperlinked anchors.

---

## 10. Atomic deliverable (Phase 5 — 4 commits)

Per master brief §3 Phase 5:

1. **Commit 1 (clawd-workspace):** `.bak` move + new event-writer prompt
2. **Commit 2 (covered-usa):** 5 test articles in `content/data/events/<slug>.json` + any verifier-caught corrections from Phase 4.5
3. **Commit 3 (covered-usa):** Requirements matrix + 3 verifier reports + retest verifier output in `content/fanout/analysis/c-event-*.md`
4. **Commit 4 (clawd-workspace):** `.bak` move + new event-verifier prompt (paired with the writer ship)

**Push order:** clawd-workspace first (writer + verifier prompts go live for any cron pickup), then covered-usa (test articles deploy to Vercel).

**Memory entry:** write `~/.claude/projects/-Users-jacobposner-clawd/memory/feedback_track_c_event_writer_shipped.md` with:
- Per-article scores from Phase 4 verifier
- Any new lessons learned (especially anything you discovered that the master brief Appendix A/B doesn't cover)
- Specific drift caught by the verifier (em-dash count per article + state-extension accuracy spot-check)
- Patches you applied that aren't in the master-brief 3-patch list (would be candidates for future master-brief upgrade)
- 5-line summary of the 5 shipped events (slug, word count, status, gates result, em-dash count post-fix)
- Confirm the post-fix sanity grep pattern caught any second-pass leaks (the T26 lesson)

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
ls -la ~/clawd/projects/covered-usa/content/fanout/analysis/audit-event-writer.json

# 4. Confirm gold-standard JSONs exist
ls -la ~/clawd/projects/covered-usa/content/data/events/just-lost-job-health-insurance.json \
       ~/clawd/projects/covered-usa/content/data/events/turning-65-medicare.json \
       ~/clawd/projects/covered-usa/content/data/events/turning-26-health-insurance.json

# 5. Slug collision check
ls ~/clawd/projects/covered-usa/content/data/events/*.json | xargs -n1 basename | sed 's/.json//'
# Expected: just-lost-job-health-insurance, turning-26-health-insurance, turning-65-medicare
# Your 5 test slugs (getting-married, having-a-baby, moving-states, divorce, becoming-a-caregiver) must NOT collide.

# 6. T26 em-dash baseline (the "what NOT to ship" reference)
grep -c "—\|–" ~/clawd/projects/covered-usa/content/data/events/turning-26-health-insurance.json
# Expected: ~23 (this is the shipped leak; your test articles must hit 0)

# 7. Validator baseline (run BEFORE you start; should be 0 bad — or document the existing T26 issues as known)
cd ~/clawd/projects/covered-usa && node scripts/validate-events.js 2>&1 | tail -10
# (If validate-events.js doesn't exist, run the universal content-quality lint instead)
```

If any of these fail or surprise you, surface to Jacob BEFORE proceeding. Don't guess at scope.

---

## 12. Quick reference card (post on monitor while working)

- **Master brief:** `projects/covered-usa/specs/TRACK_C_PARALLEL_PLAN.md`
- **Reference writer:** `.claude/agents/coveredusa-ma-state-writer.md`
- **Reference verifiers:** `.claude/agents/coveredusa-ma-state-verifier.md` + `.claude/agents/coveredusa-article-verifier.md`
- **Your writer file:** `.claude/agents/coveredusa-event-writer.md`
- **Your verifier file:** `.claude/agents/coveredusa-event-verifier.md`
- **Schema interface:** `projects/covered-usa/src/lib/events.ts` → `TriggerEvent`
- **Recipe:** FANOUT_FORMULA.md §4.6
- **Audit:** `content/fanout/analysis/audit-event-writer.json`
- **Gold standard:** `content/data/events/just-lost-job-health-insurance.json` (cleanest existing page)
- **Best urgency framing reference:** `content/data/events/turning-65-medicare.json` (kind=window, P7M)
- **What NOT to ship:** `content/data/events/turning-26-health-insurance.json` (23 em-dashes — the leak you're fixing)
- **Output dir:** `content/data/events/`
- **Phase 4 test slugs:** getting-married, having-a-baby, moving-states, divorce, becoming-a-caregiver
- **Universal GATES:** A (slug-no-year, HOLD), B (CONDITIONAL on income-gated event), C (≥3 .gov, HOLD if 0-1), D (no `--`, AUTO-FIX with post-fix sanity grep — EXTRA-STRICT for event)
- **Event GATES:** E (HowTo steps + totalTime, HOLD), F (anchored SEP dates, HOLD if neither), G (COBRA-vs-Marketplace narrative for coverage-loss, LOW flag)
- **Required vocabulary:** "Special Enrollment Period" (or "SEP"), "Marketplace SEP", "COBRA", "1095-A", "qualifying life event" (or "QLE"), "Section 9831 (HIPAA)", "60-day window", "CHIP" (where applicable), state-named brand
- **4 new structured fields (audit E1 P0):** `householdSizeTable` (when income-gated), `documentsNeeded` (always), `stateRules` (when state-variance), `commonDenialReasons` (always)
- **4-commit deliverable:** writer prompt + 5 test articles + analysis files + verifier prompt
- **Default toward auto-ship:** ~95% / ~4% / ~1% (HOLD only on genuine breakage — em-dash auto-fixes, never HOLDs)

---

*This PRD is self-contained. Combined with the master brief, it has everything a fresh parallel session needs to execute Track C-prime for event. The event template is the BEST per-template recipe in CoveredUSA — your job is to layer universal rules on top + close the em-dash discipline gap. If anything is unclear or missing, surface to Jacob before proceeding — don't guess at scope.*
