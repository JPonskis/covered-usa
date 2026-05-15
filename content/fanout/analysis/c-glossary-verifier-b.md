# Verifier B — Cold fresh-eyes review
**Date:** 2026-05-15
**Phase:** 3 (cold fresh-eyes)

## What I read

1. `/Users/jacobposner/clawd/.claude/agents/coveredusa-glossary-writer.md` — the NEW writer prompt (Track C-prime rewrite). 552 lines. Eight numbered STEPs, 8 GATES, 17 NEVERs, an inline structural exemplar, and a 12-item end-of-prompt sanity check. I read it once start-to-finish exactly as if I had just been spawned by the cron and handed the prompt.
2. `/Users/jacobposner/clawd/projects/covered-usa/src/lib/glossary.ts` — schema. The `Glossary` interface has `introParagraphs: LocalizedString[]` (non-optional, no `?`). The 4 metadata fields (`topicCluster`, `keyTerms`, `isLighthouse`, `isDeprecated`) are **NOT** in the interface — they are additive forward-compat fields the prompt is asking me to emit even though TypeScript would `excess-property-check` them away if I tried to construct a `Glossary` literal in strict TS. Important: the loader uses `as Glossary` cast and `JSON.parse` swallows extras at runtime. Nothing in the schema file references the 4 fields.
3. `/Users/jacobposner/clawd/projects/covered-usa/content/data/glossary/magi.json` — the bloat exemplar. 1,298 EN rendered words. 2 introParagraphs, 4 detailSections (including "Why MAGI Instead of Gross Income?" — pure history/mechanics, exactly what the new prompt bans). 8 EN FAQs, 12-item `whatCountsToward`, 11-item `whatDoesNotCountToward`. ZERO inline markdown body links — every link lives in `relatedLinks` footer. ZERO of the 4 metadata fields. Reading length: ~6 min. The "What NOT to produce" lesson lands hard — I can feel the over-investment.

### Cold-eyes mental model after the read

The prompt is unusually well-organized. Step 0 ("Load context") is path-portable. Step 3 has a §4.5 recipe. Step 4 starts with a "MANDATORY EMIT" block in bold and a "**STOP. Read this twice.**" framing. Step 6 has 8 GATES with explicit HOLD/WARN/PASS routing. The exemplar in STEP 4 is ~350 words — visibly leaner than magi.json. I can see the bones of a working page.

I'm now going to walk a hypothetical `premium-tax-credit` task and ask whether I would actually honor each gate on first try.

---

## Walk-through findings (premium-tax-credit hypothetical)

### Q1 — §4.5 ≤500 word cap: would I feel HELD?

**Yes, mostly.** The framing is the strongest in the prompt. Five separate reinforcements:

1. Front-matter `description` field calls out "300-500 word hard cap".
2. The §4.5 callout quote at line 13 cites FANOUT_FORMULA verbatim and says "Don't write 2,000-word concept deep-dives."
3. Line 15: "The audit (2026-05-14) measured the 3 existing glossary pages at 1,298 / 1,078 / 683 EN words... Your job is to NOT replicate that." Specific numbers = concrete pressure.
4. Step 4 heading: "**Draft the JSON (≤500 words EN rendered prose — DOMINANT CONSTRAINT)**".
5. GATE E is marked "DOMINANT GATE" with an executable `node -e` one-liner that exits 1 on >500. NEVER #2 says: "NEVER exceed 500 EN words rendered prose. GATE E HOLD. Run the Node count BEFORE save, EVERY TIME."

The Node one-liner is the killer feature — it's concrete, runnable, exit-1-on-fail. I would actually run it. I would feel held.

**One weakness I'd flag:** the GATE E Node script counts `definition.en + quickDefinition.en + hero.subhero.en + introParagraphs + detailSections.heading + detailSections.paragraphs + faqs.en (Q + A) + annualLimits.footnote + workedExample.intro + workedExample.footnote`. It does NOT count:

- `meta.title.en` / `meta.description.en`
- `hero.h1.en`
- `term.en` / `alternateNames`
- `annualLimits.headers`, `annualLimits.rows` cell contents
- `detailSections[].list[]` entries (the schema allows them)
- `detailSections[].table.caption`, `.headers`, `.rows` cells
- `workedExample.headers`, `workedExample.rows` cell contents
- `whatCountsToward.intro` + `.items[]` (if I included it)
- `whatDoesNotCountToward.intro` + `.items[]` (if I included it)
- `relatedLinks[].label.en`
- `sources[].note.en`

For premium-tax-credit specifically I'd probably emit a 9-row `annualLimits` table and a `workedExample` with 4 rows. The combined cell content there could easily add 100-150 rendered words to what the user sees on the page but score 0 in the GATE E count. **I might pass GATE E at 487 words and ship a page that renders 600+ words.** That's the same failure mode as the previous prompt — the cap was framed as a "consider," but here it's framed strongly and still the counter is too narrow.

**Verdict:** held on the count GATE E measures. NOT held on what the user actually reads on the page. This is a real risk.

### Q2 — 4 MANDATORY-EMIT metadata fields: would I skip them?

**No — I'd emit all 4 on first try.** The framing is markedly stronger than the drug writer's first pass ("additive — JSON.parse ignores extras"). Specifically:

- The section heading is literally **"MANDATORY EMIT — 4 link-routing metadata fields (verifier WILL flag)"** in bold.
- Below the heading: "**STOP. Read this twice.**"
- The paragraph after: "If absent, the validator emits warnings and the page fails its strategic role. **Emit all 4 in every glossary JSON, every time. No exceptions.**"
- The example jsonc block shows the exact shape inline.
- The `keyTerms` shape callout is explicit: "the value is an OBJECT `{en: string[], es: string[]}`, NOT a flat array `["..."]`. The flat-array shape is the most common drafter mistake — load-test caught it in 3 of the first 5 Track C-prime drug writers."
- The required-fields checklist at line 175 lists "`topicCluster`, `keyTerms`, `isLighthouse`, `isDeprecated` — see MANDATORY EMIT block above" as the last bullet.
- The "After GATES pass — run field-level sanity checks" block at lines 470-472 has 5 separate bullets dedicated to these fields.
- The end-of-prompt sanity check #7 asks: "Did you emit `topicCluster + keyTerms.{en,es} + isLighthouse:false + isDeprecated:false`?"
- NEVER #8 forbids the flat-array shape. NEVER #17 forbids skipping them on `JSON.parse-ignore-extras` rationale (this is the specific failure mode the drug writer hit — the new prompt names and forbids it).

This is the strongest part of the prompt. I would honor it.

**Minor risk:** the schema file (`glossary.ts`) does NOT declare these 4 fields. A drafter reading the schema after the prompt could panic that "the schema doesn't even have these fields, so they must be optional." The prompt addresses this implicitly ("forward-compat with Track A1 link-routing infrastructure") but it does NOT explicitly say: "these 4 fields are NOT in glossary.ts and that's INTENTIONAL — emit them anyway." A fresh agent might second-guess. **Suggested edit:** add one sentence: "Note: these 4 fields are intentionally absent from `glossary.ts` because they're additive forward-compat. The TS loader casts via `as Glossary` and `JSON.parse` accepts the extras. Emit them anyway — the validator and link-router read them."

### Q3 — GATE G inline links: would I get 3 inside body prose, not just `relatedLinks`?

**Mostly yes, but with one realistic failure mode.** The prompt does a lot of work here:

- Step 4 required-fields checklist line 173 explicitly says "These [`relatedLinks`] do NOT count toward GATE G."
- Step 5 has a dedicated "Inline link routing (LINK_TARGET_MANIFEST §5 — template's PRIMARY value)" subsection with 9 process steps.
- GATE G is executable with a runnable Node script that scans only body fields (`definition.en`, `quickDefinition.en`, `hero.subhero.en`, `detailSections[].paragraphs[].en`, `faqs.en[].answer`, `annualLimits.footnote.en`, `workedExample.intro.en` + `.footnote.en`). HOLD if 0, WARN if 1-2, PASS if ≥3.
- NEVER #7: "NEVER park internal links only in `relatedLinks` footer. GATE G requires ≥3 inline body links."
- The exemplar in STEP 4 has inline links explicitly placed in `quickDefinition.en` (FPL), `workedExample.intro.en` (`/aca-income-limits`), and `detailSections.paragraphs.en` (`/medicaid-income-limits`).

The bullet at line 426 says inline links can also point at "another glossary slug." But the GATE G Node check only counts `distinct.size` of all `\[[^\]]+\]\(\/[^)]+\)` matches in body — it doesn't filter by lighthouse-vs-glossary. So if I link to `/glossary/agi` and `/glossary/aca-marketplace` and `/glossary/ssdi`, I pass GATE G with 3 distinct hrefs, but I've routed ZERO traffic to lighthouse pages — which is the strategic point the prompt opens with. **The check is looser than the policy.**

**Suggested edit:** tighten GATE G to require ≥2 of the 5 lighthouse paths specifically (`/federal-poverty-level`, `/medicaid-income-limits`, `/medicare-eligibility`, `/aca-income-limits`, `/medical-bill-analyzer`). Allow `/glossary/<slug>` to count toward the 3rd link but not as one of the required 2.

**Second weakness:** the prompt says to load `$LINK_INDEX` (`content/link-index.json`) in STEP 0 and use `byPhrase.en` to find anchorable phrases. But I don't know what's actually in `$LINK_INDEX` until I read it. The prompt doesn't show me what `byPhrase.en` keys look like — if the file is empty, missing, or has phrases I can't naturally place in 500 words, I'm stuck. The prompt's fallback ("If natural placement doesn't fit, skip — don't force") conflicts with GATE G's HOLD-on-zero requirement. **A fresh agent might end up with 2 forced links and 1 awkward link, or worse, 0 and a HOLD.**

**Suggested edit:** before STEP 5, add a 2-line "If `$LINK_INDEX` is empty or missing, fall back to the 5 lighthouse paths from line 313 and find natural placements yourself." Currently the prompt implies the link-index is the source of truth but doesn't say what to do if it's underbuilt.

### Q4 — `introParagraphs: []` literal empty array: would I be tempted to populate?

**Yes, I would be tempted.** The schema declares `introParagraphs: LocalizedString[]` (no `?`, non-optional). When I read glossary.ts on cold-eyes pass, my first instinct is "TypeScript strict mode will reject `introParagraphs: []` if the contents are required." Then I read magi.json and see it populated with 2 paragraphs. Anchor-bias kicks in.

The prompt addresses this in 4 places:

- Step 3 §4.5 recipe: "`introParagraphs: []` — literal empty array. The field stays in the schema but the content drops to zero."
- Step 4 required-fields line 165: "**`introParagraphs: []`** — literal empty array. The field is required by the schema (non-optional, TypeScript strict compile fails if omitted). DO NOT populate. Definition + hero.subhero + quickDefinition already cover the intro role."
- NEVER #3: "NEVER populate `introParagraphs`. Literal `[]`. Schema requires the field; downscope strategy zeroes the content."
- End-of-prompt sanity check #4: "Is `introParagraphs` literal `[]`?"

This is enough. Four mentions. The reasoning is given inline ("Definition + hero.subhero + quickDefinition already cover the intro role"). I would honor it.

**One micro-risk:** the schema comment in glossary.ts line 144 has no comment on `introParagraphs` (unlike `quickDefinition` which has a `/** Longer "quick answer" definition (3-4 sentences), renders in cream blockquote */` comment). A fresh agent looking at the schema might infer from the type alone that the field is meant for content. The prompt's 4-place reinforcement overrides this, but it's a friction. Not a HOLD risk.

### Q5 — Slug prohibition (magi/deductible/oop-max): would I refuse?

**Yes, absolutely.** The prohibition is given 4 separate reinforcements:

- Lines 27-36: a dedicated **"STRICT PROHIBITION — three slugs you MUST refuse"** section, top of prompt (before STEP 0). Has the exact error-JSON template. Has the rationale ("This is the audit's biggest single risk").
- STEP 0 line 59: "DO NOT read existing magi.json / deductible.json / out-of-pocket-maximum.json as a structural template. They are the bloat exemplar."
- Step 6 GATE checklist line 474: "If `slug` is in `["magi", "deductible", "out-of-pocket-maximum"]`: **STOP**. You bypassed STEP 0 prohibition." — defense-in-depth.
- NEVER #1: "NEVER write to `magi`, `deductible`, or `out-of-pocket-maximum` slugs. Track E only. Return error JSON immediately."
- Step 8 has the exact error-JSON template.

Four mentions + a defense-in-depth check at GATE-time. Strong. I would refuse the slug immediately at STEP 0 and emit the error JSON as the last line. No way I'd accidentally write `magi`.

**Sole nit:** the prohibition is mentioned at the very top, BEFORE STEP 0. A fresh agent reading top-to-bottom might process it before they know what STEP 0 is. By the time I get to STEP 0 I might forget the rule. The GATE-time check at line 474 catches this — good defense-in-depth. Not a real risk.

### Q6 — GATEs E F G H + would I ship `premium-tax-credit.json` clean on first try?

Let me walk each gate, assuming I'm drafting in good faith.

**GATE A (slug no year):** trivially pass. `premium-tax-credit` has no year.

**GATE B (household-size table conditional):** PTC IS income-anchored, so I should emit `annualLimits`. The prompt says 4-row representative table is acceptable if word count is tight. I'd probably emit a 9-row table (HH 1-8 + each-additional) because the §3.3 universal rule favors 9. Pass with possible WARN.

**GATE C (≥3 inline .gov/.edu/kff.org citations):** the grep counts `.gov[/"]|.edu[/"]|kff\.org` in the entire `$TMP` file. That includes the `sources[]` URLs. With 3+ primary sources in `sources[]`, I trivially pass GATE C. **This is a weak check** — it'd pass even if zero of those URLs were anchored inline in body prose. The prompt's §3.6 universal rule says "Cite primary sources INLINE (in body prose anchor text), not just in the `sources[]` footer. ≥3 inline `.gov` / `.edu` / `kff.org` citations." But GATE C's grep can't tell apart inline vs footer. **The check doesn't enforce what the policy describes.** First-try risk: I pass GATE C and ship a page with zero inline citation anchor text, just URLs in the footer.

**Suggested edit:** rewrite GATE C to count markdown anchors `[...](https://...gov...)`-style or use a Node script that pulls body strings and matches anchor patterns pointing to `.gov`/`.edu`/`kff.org` hosts. Otherwise this gate is decorative.

**GATE D (no `--`):** trivially pass if I avoid double-hyphens. I will.

**GATE E (≤500 words):** see Q1 above. I'd pass the gate's narrow counter but might ship a 600+ rendered-word page if I'm aggressive on annualLimits/workedExample cells.

**GATE F (definition ≤80 words + substantive lead):** the Node script checks `>100` not `>80` for HOLD (only HOLDs if >100 OR throat-clear lead). So 81-100 is WARN. I'd write a 70-word definition leading with "The Premium Tax Credit (PTC) is..." — pass.

**GATE G (≥3 inline body links):** see Q3 above. Real risk of forcing awkward placements or routing to non-lighthouses.

**GATE H (≤1 detailSection):** I'd be tempted to emit 1 (a "PTC vs Cost-Sharing Reduction" comparison) and pass. The NEVER #6 list ("Why MAGI Instead of Gross Income", "Why Bronze Plans Have a Higher Deductible", "The Origin of OEP") gives concrete banned examples that anchor me. I'd honor.

**End-to-end first-try verdict:** I'd ship a JSON that:

- ✅ Passes GATE A trivially
- ⚠️ GATE B: might emit 9-row table, possible word-count pressure
- ⚠️ GATE C: passes the grep but might not actually have inline citations
- ✅ GATE D: pass
- ⚠️ GATE E: passes the narrow counter but could be 600+ rendered words
- ✅ GATE F: pass
- ⚠️ GATE G: probably 3 inline links but could be non-lighthouse glossary slugs
- ✅ GATE H: pass

**Net: 5 passes, 3 yellow flags.** Probability of a "first try clean" outcome (all 8 gates true-green, page renders at <500 words, all 3 inline links go to lighthouses, 3 inline `.gov` anchors): I'd put it at **55-65%**.

The drug writer's first pass had 0/5 with new structural blocks because the framing was too soft. The glossary prompt's framing is much stronger — but the gates have measurement gaps that let weakly-compliant pages through. Phase 4 will probably surface 1-2 of these on the first sample of 5 pages and need a tightening round.

---

## What I'd want the prompt to be CLEARER about

These are ordered by load-bearing-ness, biggest risk first.

### 1. GATE E word counter scope is narrower than what renders to users (HIGH)

**Problem:** the Node counter excludes table cells (`annualLimits.rows`, `workedExample.rows`, `detailSections[0].table.rows`), `whatCountsToward.items[]`, `whatDoesNotCountToward.items[]`, `meta.title`/`description`, `hero.h1`, `detailSections[].list[]`. For a term like PTC with a 9-row `annualLimits` table + 4-row `workedExample`, that's easily 150 extra rendered words.

**Fix:** extend the counter to include row cells and items. Sample replacement:

```js
// after the existing FAQ loop:
if (j.annualLimits) {
  (j.annualLimits.headers?.en || []).forEach(grab);
  (j.annualLimits.rows || []).forEach(r => (r.en || []).forEach(grab));
}
if (j.workedExample) {
  (j.workedExample.headers?.en || []).forEach(grab);
  (j.workedExample.rows || []).forEach(r => (r.en || []).forEach(grab));
}
if (j.whatCountsToward) { (j.whatCountsToward.items || []).forEach(it => grab(it.en)); grab(j.whatCountsToward.intro?.en); }
if (j.whatDoesNotCountToward) { (j.whatDoesNotCountToward.items || []).forEach(it => grab(it.en)); grab(j.whatDoesNotCountToward.intro?.en); }
(j.detailSections || []).forEach(s => (s.list || []).forEach(it => grab(it.en)));
```

Without this, a "compliant" page can still render at 600-700 words.

### 2. GATE C measures the wrong thing (HIGH)

**Problem:** the grep counts `.gov[/"]|.edu[/"]|kff\.org` anywhere in the file, including the `sources[]` URL list. That means a page with zero inline citation anchor text trivially passes. The policy in §3.6 says inline anchors are required.

**Fix:** replace the grep with a Node script that:
1. Concatenates body strings (same set as GATE G's `bodies` array).
2. Runs `\[[^\]]+\]\((https?://[^)]*(\.gov|\.edu|kff\.org)[^)]*)\)` regex.
3. Counts distinct matches.

If <3, HOLD.

### 3. GATE G should require ≥2 lighthouse paths specifically (HIGH)

**Problem:** GATE G's regex `\[[^\]]+\]\(\/[^)]+\)` matches ANY in-site path. A drafter linking to 3 other `/glossary/...` slugs passes GATE G but doesn't route traffic to the canonical lookup lighthouses, which is the entire strategic point.

**Fix:** require at least 2 of the 3 distinct hrefs to match one of the 5 lighthouse paths. The 3rd can be a `/glossary/` slug or a screener/analyzer route.

### 4. Schema mismatch on 4 metadata fields needs explicit reassurance (MEDIUM)

**Problem:** `glossary.ts` doesn't declare `topicCluster`, `keyTerms`, `isLighthouse`, or `isDeprecated`. A fresh agent reading the schema after the prompt may second-guess emitting them ("the schema is the hard contract per STEP 0; the fields aren't in the schema; therefore don't emit").

**Fix:** add one sentence to the MANDATORY EMIT block:

> Note: these 4 fields are intentionally NOT declared in `glossary.ts`. The TS loader uses `as Glossary` cast and `JSON.parse` accepts the extras at runtime. Emit them anyway — the validator and Track A1 link-router infrastructure read them. Do not "fix" the schema; emit the additive fields.

### 5. `$LINK_INDEX` underbuild fallback isn't specified (MEDIUM)

**Problem:** STEP 5 routes inline links via `$LINK_INDEX.byPhrase.en` but doesn't say what to do if the file is empty, missing, or has fewer than 3 placeable phrases for this term. The "If natural placement doesn't fit, skip — don't force" guidance conflicts with GATE G's HOLD-on-zero requirement.

**Fix:** insert before "Process:" in STEP 5:

> If `$LINK_INDEX` is missing or `byPhrase.en` has < 3 anchorable phrases for this term, fall back to the 5 lighthouse paths listed below. Place links naturally in `quickDefinition.en`, the first `detailSection.paragraphs[0].en` (if you emit one), and a FAQ answer. Minimum 3 lighthouse-target links required per GATE G — find phrases yourself if the index doesn't provide them.

### 6. "readingTime" tied to word count needs explicit ceiling (LOW)

**Problem:** Step 4 says `"2 min read"` or `"3 min read"`, NEVER `"5 min read"`. But 500 words at ~200 wpm = 2.5 minutes. A 4-row table + worked example might genuinely render at ~3-3.5 min. A fresh agent might pick "3 min read" as a safe default. That's fine, but the prompt could be cleaner.

**Fix:** "Pick `2 min read` if word count ≤ 350, `3 min read` if 351-500. Anything labeled `4 min read` or higher is a self-evident GATE E violation."

### 7. `keyTerms` content not specified — what makes a good `keyTerm`? (LOW)

**Problem:** the exemplar shows `keyTerms.en: ["term name", "TN", "alternate name 1", "alternate name 2 2026"]`. But there's no rule for how many keyTerms, what they should be, whether they should overlap with `alternateNames`, or whether they should include search-intent phrases like "how do I qualify for premium tax credit". A fresh agent might emit 1 keyTerm (the slug itself) or 30 (every phrase that comes to mind).

**Fix:** add to MANDATORY EMIT block: "Emit 3-6 keyTerms per locale. Include: the canonical term, the most common acronym, 1-2 search-intent phrases (e.g., 'qualify for premium tax credit'), 1 year-anchored phrase ('premium tax credit 2026'). Don't duplicate `alternateNames` verbatim — keyTerms are search phrases, alternateNames are abbreviation aliases."

### 8. CTA target inference vs. cron payload precedence (LOW)

**Problem:** STEP 4 says "use queue's value as authoritative (`screener` for eligibility terms, `analyzer` for cost/billing terms)". If the queue says `screener` but the term is a billing term (e.g., `eob`), should I overrule the queue? The prompt isn't clear.

**Fix:** "queue value wins. If the queue's ctaTarget mismatches the obvious category fit, emit the queue value AND flag in the return JSON: `"cta_target_mismatch": true`."

### 9. Track-E hand-off after Track-C-prime ships (LOW)

**Problem:** the prompt says magi/deductible/oop-max belong to Track E. Where does Track E live? When does it run? What happens to those slugs in the meantime? A fresh agent doesn't know. Not blocking for my task, but blocks any agent who tries to be helpful and tries to "fix" magi.

**Fix:** add to STRICT PROHIBITION block: "Track E (downsize pass) rewrites these 3 slugs separately. It's queued for [date or trigger]. Until then, the existing bloated files remain on disk — do NOT delete, regenerate, or edit them."

---

## Phase 4 confidence (1-10)

**Score: 6.5 / 10**

The prompt is markedly better than the prior drug-writer iteration. The MANDATORY-EMIT framing for the 4 metadata fields is best-in-class — bold heading + "STOP. Read this twice." + 4 reinforcements + explicit "JSON.parse-ignore-extras rationale" forbidden in NEVER #17. I genuinely believe a fresh agent emits all 4 fields on first try.

The slug prohibition is rock-solid: 4 reinforcements including defense-in-depth at GATE-time.

The §4.5 word cap framing is strong (5 reinforcements + runnable Node script + DOMINANT GATE labeling), BUT the Node script measures a strictly narrower scope than what renders on the page. A drafter emitting an aggressive `annualLimits` table or `whatCountsToward` list will pass GATE E at 487 words while shipping a 600-word page. **This is the highest-probability Phase 4 failure mode.**

GATE C is decorative — it counts `.gov` substrings anywhere in the file, so any compliant `sources[]` array passes. It does not enforce inline citation anchor text despite §3.6 saying it must. **Second-highest failure mode.**

GATE G's regex doesn't distinguish lighthouse paths from generic /glossary/ slugs, so 3 inter-glossary links would falsely satisfy the strategic goal. **Third-highest failure mode.**

Net: Phase 4 will probably ship 3/5 or 4/5 clean on first run. The 1-2 that fail will fail on word-count-after-render (GATE E gap) or on inline-citation-anchor-absence (GATE C gap). After one tightening round on those two gates, the writer should hit 5/5.

If the 3 HIGH fixes above land before Phase 4 kicks off, I'd push my confidence to 8.5/10.

If they don't, expect Phase 5 friction similar to drug-writer iteration 1.
