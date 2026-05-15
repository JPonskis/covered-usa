# Q&A Topics — Adversarial Critique

**Date:** 2026-05-15
**Critic:** Agent C (adversarial)
**Inputs:** qa-topics-a.csv (102 rows), qa-topics-b.csv (180 rows), both rationale docs, FANOUT §4.3/§4.4/§5.1/§5.2, competitor-landscape §3, busa-inventory.csv (2,111 rows), CONTENT_INVENTORY.

---

## 1. ROUTING VERDICT: Track D wins state-Medicaid eligibility (CONFIRMED)

**Send `/medicaid-income-limits/[state]` (Track D, FANOUT §5.1) the 51 state-Medicaid eligibility pages. Send `/qa/` ONLY non-Medicaid-income-limits state Q&As and pure coverage Q&As.**

Three independent reasons converge:

1. **URL-as-query alignment.** FANOUT §5.1 is doctrine: the dominant Bing citation pattern is literally `{state} {program} income limits {year}`. A URL of `/medicaid-income-limits/california` matches that query string verbatim. `/qa/medicaid-california` does not. Lookup-format Bing citations reward the literal URL match more than they reward Q&A framing.

2. **Template-purpose honesty.** Agent A nailed this in its own §3 recommendation. `/qa/` should be "does X cover Y / can I get Z" conversational Q&A. A 51-row income-limit table page is not a Q&A — it's a lookup factory. Routing it under `/qa/` weakens the template's structural signal and dilutes Bing's understanding of the URL family.

3. **Avoiding self-cannibalization.** Building both `/medicaid-income-limits/[state]` (Track D) AND `/qa/medicaid-[state]` (FANOUT §4.4 literal reading) creates two CoveredUSA URLs competing for the same query. Agent A correctly flagged this as the duplicate-work path. Pick one. Track D's URL is structurally stronger.

**Impact on qa-state-eligibility subset:**
- Agent A's 30-row state-eligibility list → drops to ~10 rows after Track D absorbs the 51-state Medicaid eligibility + state-brand variants.
- Agent B's 180-row list (heavy state-Medicaid duplication) → drops by ~57 rows (51 medicaid-eligibility-[state] + 6 already-queued state-MSP pages) → ~123 rows.
- Surviving qa-state-eligibility content: state-CHIP, state-MSP (programs vary materially by state), immigrant Medicaid (CA/NY/IL/MA/OR/WA state laws), pregnancy Medicaid (200%+ FPL state variants), state-fork coverage Q&As (abortion, gender-affirming, adult dental, IVF).

**Confidence: HIGH.** Both rationale docs independently reach the same conclusion. No counter-evidence.

---

## 2. Top 5 missing qa-coverage topics

Agent A + B between them covered most of the brief's checklist, but the following are absent or under-prioritized:

1. **`does-medicare-cover-cologuard`** — Cologuard at-home colonoscopy alternative; high Bing volume, Medicare covers every 3 years for average-risk; both lists miss it (B has generic colonoscopy).
2. **`does-medicaid-cover-glp1-weight-loss-state-by-state`** — State Medicaid GLP-1 weight-loss coverage is the hottest 2026 fork; CA/NC/PA/CT cover, most don't. A has `does-medicaid-cover-ozempic-weight-loss` (no state fork). B has `does-medicaid-cover-ozempic` (no state fork). Add the state-fork comparison companion.
3. **`does-medicare-cover-pap-smear` / `does-medicare-cover-hpv-test` / `does-medicare-cover-psa-test`** — preventive screenings not in either list (A has prostate at item 38; cervical/HPV/PSA detail missing).
4. **`does-medicare-cover-second-opinions`** — explicit Medicare benefit; high-engagement question, neither list has it.
5. **`does-aca-cover-acupuncture` / `does-aca-cover-chiropractic`** — ACA EHB ambiguity is state-Marketplace specific; high search intent ("is acupuncture covered by Obamacare"), both lists skipped.

Honorable mention: standalone supplemental dental/vision/hearing insurance for Medicare beneficiaries (B flagged in §7 but didn't add rows; should be 3-4 dedicated entries since FANOUT §4.3 shape #4 is "standalone supplemental").

---

## 3. Top 5 missing qa-state-eligibility topics (post-Track-D routing)

After Track D absorbs the 51 state-Medicaid eligibility pages, `/qa/` still needs:

1. **State emergency Medicaid for undocumented + state-funded expansion** (CA Medi-Cal full undocumented, NY Essential Plan, IL Health Benefits for Immigrant Adults, MA, OR, WA). A has `state-medicaid-undocumented` but priority 3 — bump to priority 1. The 6-7 state expansion details are politically hot 2026 search territory.
2. **State pharmaceutical assistance programs (SPAPs)** — neither list has this. ~20 states run SPAPs (NY EPIC, NJ PAAD, PA PACE/PACENET, MA Prescription Advantage). Brand-named, finite, BUSA doesn't cover. Real demand surface.
3. **`state-msp-income-limits` by state with brand programs** — A has it as one row scaling 51x; B has 5 sampled. CT, MN, ME, NY have state-funded MSP-expansion programs above federal floors. This belongs under `/qa/` (programs vary; not pure income-limit lookup).
4. **State Medicaid retroactive eligibility / 3-month look-back** — varies by state (some states eliminated it). Niche but high-intent for people facing big medical bills; neither list has it.
5. **State continuous eligibility for kids (12 months vs 24 months)** — CHIP/Medicaid kids' continuous eligibility now varies materially by state per CMS 2024 rule changes. Neither list has it.

---

## 4. Top 5 demand-score corrections

1. **`state-medicaid-income-limits` (A, demand=9500)** — moot under routing verdict (moves to Track D). Reassign demand to the Track D roadmap.
2. **`does-medicare-cover-hearing-aids` (A, demand=3200)** — Bing 2,487 broad / 1,868 strict cited. Strict-match 1,868 is the cleaner signal; demand should be ~1,900, not 3,200. A is double-counting broad. Correct down.
3. **`is-aca-still-available` (A, demand=720)** — UNDERSCORED. `obamacare` clocks 20,909 broad/week; 2025 OBBB just removed enhanced subsidies; this is one of the highest-political-news-interest 2026 queries. Bump to priority 1 with demand ~2,000.
4. **`who-qualifies-for-extra-help-medicare` (A, demand=820)** — A's own surprise §7 item 3 flags `extra help` at 21,942 broad. Demand should be ~3,000-4,000, not 820. Even discounting Facebook Marketplace style brand collisions, this is significantly under-scored. Bump to priority 1.
5. **`ahcccs-income-limits` (A, demand=3200)** — UNDERSCORED. A's own surprise §7 item 1 documents AHCCCS at 90,165 broad / 23,895 strict (highest state-brand Bing volume). Even accounting for provider-portal pollution, demand should be 6,000-8,000. (Moot under routing — moves to Track D — but Track D should know AZ is #1 state-brand priority.)

---

## 5. Top 5 BUSA-overlap corrections

1. **`does-medicaid-cover-dental-adults` (A, busa_overlap=none)** — WRONG. BUSA has `chip-income-limits-2026`, `adult-dental-medicaid-by-state` style coverage. Actually slight-to-heavy. Re-flag as slight.
2. **`who-qualifies-for-aca-subsidy` (A, busa_overlap=slight)** — UNDERSTATED. BUSA has 51 `[state]-aca-eligibility-2026` pages (per Agent B §5). Heavy. Move CoveredUSA framing strictly to the screener-decision Q&A and skip the state forks (let BUSA own state-ACA eligibility entirely).
3. **`state-chip-eligibility` (A, busa_overlap=heavy)** — OVERSTATED at the state-brand level. BUSA has `chip-income-limits-2026` umbrella + `chip-income-limits-by-state-2025` (one stale page), not 51 brand pages. CoveredUSA can win on the state-brand canonicalization (PeachCare/KidCare/Apple Health for Kids) — slight, not heavy.
4. **`is-medicare-supplement-worth-it` (A, busa_overlap=none)** — likely slight; BUSA touches Medigap content. Re-verify against busa-inventory.csv.
5. **`can-i-have-medicare-and-medicaid` (A, busa_overlap=none) vs `can-i-have-medicaid-and-aca` (B, heavy)** — inconsistent. Both touch BUSA's dual-eligibility content. Both should be `slight`. A under-flags; B over-flags slightly.

---

## 6. A vs B adjudications (top conflicts)

1. **`does-medicaid-cover-ivf` priority** — A=3, B=2 (state-fork). B wins. Fresh KFF state-mandate tracker is 2026-actionable content with no canonical Bing competitor.
2. **`does-medicare-cover-glp1-weight-loss` umbrella** — A has Ozempic/Wegovy/Mounjaro separate; B has a class umbrella too. Keep B's class-umbrella PLUS A's per-drug. Both shapes get searched.
3. **`does-medicaid-cover-gender-affirming-care`** — A=priority 3 (`state-medicaid-undocumented` analog), B=priority 1. B wins. KFF data exists, no AI-citation Q&A page exists, politically hot.
4. **51 state-Medicaid eligibility (B) vs 1-row + 51-fork (A)** — moot under routing verdict; both move to Track D.
5. **`medicaid-eligibility-dc` (B has)** — A doesn't include DC. Add. DC counts as 51st jurisdiction. Track D scope = 50 states + DC.
6. **`extra-help-eligibility-2026` (B) vs `who-qualifies-for-extra-help-medicare` (A)** — same topic, different slug. Use B's `extra-help-eligibility-2026` (year-anchored framing matches FANOUT §3.1).
7. **CHIP per-state — A=51x one row, B=11 sampled.** A wins on completeness; build all 51 under `/qa/chip-eligibility-[state]` since Track D's URL is Medicaid-specific (a separate CHIP factory at `/chip-income-limits/[state]` is the cleaner long-run answer, but flag for Jacob — out of current scope).
8. **`medicaid-immigrant-eligibility` (B, priority 1) vs `state-medicaid-undocumented` (A, priority 3)** — B wins. 2024-2026 CA/NY/IL/OR/WA expansions are real 2026 news.
9. **`medicaid-asset-limits-elderly` (B) vs `state-medicaid-asset-limits` (A, 51-fork)** — A is more aggressive but B is more honest. Asset limits don't vary as dramatically as income limits state-by-state. Build one umbrella + 5-7 high-population state forks, not 51.
10. **`is-medicare-free` (A) vs missing in B** — A wins. Basic premium-by-Part Q&A is a real demand surface.

---

## 7. Head-term competitor saturation check

Competitor-landscape §3 is explicit: LOW leverage on head terms (Medicare.gov + AARP own them), MEDIUM-HIGH on long-tail combos. Both lists over-weight head terms relative to this guidance.

**Recommendation:** Demote priority-1 status on the following head-term coverage Q&As to priority-2 unless they include a state-fork or year-rule angle:
- `does-medicare-cover-flu-shot`, `does-medicare-cover-er-visits`, `does-aca-cover-preventive-care`, `does-aca-cover-essential-health-benefits`, `does-medicare-cover-physical-therapy` (pure head term, no policy news, government owns it).

**Promote** long-tail combos to priority 1:
- `does-medicare-cover-ozempic-weight-loss-2026` (year + policy nuance) vs A's generic `does-medicare-cover-ozempic`.
- `does-medicaid-cover-glp1-by-state-2026` (state-fork combo, neither list has).
- `does-medicare-advantage-cover-dental-2026` (MA-add-on + year, FANOUT §4.3 shape #1, explicitly Bing-friendly).

---

## 8. Year-anchor + state-fork audit

- All A title_hints have `2026` anchor. PASS.
- B has many title_hints WITHOUT year anchor (rows 2-92 mostly say "(2026 Answer)" but the underlying title doesn't year-anchor the topic phrase). Per FANOUT §3.1, year MUST be in the title not just in parens. Rewrite B's title_hints to `Does Medicare Cover X in 2026?` rather than `Does Medicare Cover X? (2026 Answer)`.
- State-fork flagging: B uses `state_fork=y` column; A uses `state_specific=y`. Merge step needs to canonicalize.

---

## 9. Verdict + confidence

**Routing verdict: Track D owns `/medicaid-income-limits/[state]` (51 pages, FANOUT §5.1 doctrine). `/qa/` owns coverage Q&A + non-income-limit state eligibility (CHIP, MSP, immigrant, pregnancy, asset limits, state-fork coverage Q&As).** HIGH confidence — three independent arguments converge, both researchers independently agree.

**Post-routing qa-coverage list:** ~120-140 topics after additions in §2. Confidence MEDIUM-HIGH. Bing head-term volume is thin; FANOUT §4.3 + competitor-landscape §3 both warn this is long-tail territory.

**Post-routing qa-state-eligibility list:** ~50-70 topics (down from 840 expanded). Confidence HIGH. Surviving topics are uncontested by Track D and uncontested by BUSA (BUSA has heavy state-Medicaid coverage but not state-CHIP-by-brand, state-MSP-by-program, state-immigrant Medicaid, or state-fork coverage Q&As).

**Phase 4 synthesis MUST:**
1. Apply routing verdict — strip 51 state-Medicaid rows from `/qa/` list.
2. Add 5 missing qa-coverage topics (§2) + 5 missing qa-state-eligibility (§3).
3. Apply demand-score corrections (§4) and BUSA-overlap corrections (§5).
4. Adjudicate A vs B per §6.
5. Demote head-term coverage Q&As per §7; promote long-tail combos.
6. Year-anchor all B titles in-line per §8.

**Escalate to Jacob:** routing verdict + the CHIP-factory question (build `/chip-income-limits/[state]` as Track D extension, or keep CHIP under `/qa/chip-eligibility-[state]`?). My recommendation: defer CHIP factory; build under `/qa/` first wave, promote to factory if data justifies in 3 months.
