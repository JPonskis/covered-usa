# Q&A Topics — Agent A Rationale

**Date:** 2026-05-15
**Agent:** Data-driven researcher (Agent A) for the CoveredUSA Q&A template (`/qa/[question]`).
**Subtype split:** 72 qa-coverage / 30 qa-state-eligibility / 102 total seed topics.

---

## 1. Methodology

Primary data source: Bing Webmaster API `GetRelatedKeywords`. Two seed clusters were probed (90-day window, `country=us`, `language=en-US`):

- **Coverage cluster:** `medicare advantage`, `medicaid`, `medicare`, `dental insurance`, `vision insurance`, `ozempic`, `wegovy`, `hearing aids`, `therapy insurance`, `rehab cost`, `ozempic medicare`, `weight loss medicare`, `mental health insurance`, `nursing home medicaid`, `physical therapy medicare`, `chiropractor medicare`, `dental coverage`, `vision coverage`, `addiction treatment medicaid`, `long term care medicaid`. ~1,400 distinct related queries surfaced.
- **State-eligibility cluster:** `texas medicaid`, `california medicaid`, `florida medicaid`, `ohio medicaid`, `new york medicaid`, `georgia medicaid`, `pennsylvania medicaid`, `michigan medicaid`, `north carolina medicaid`, `illinois medicaid`, `medicaid income limits`, `medi-cal`, `ahcccs`, `medicaid eligibility`, `chip`, `marketplace insurance`, `qmb`, `slmb`, `extra help`, `ssi medicaid`, `snap medicaid`. ~700 distinct related queries surfaced.

**Gotcha logged:** Bing's `GetRelatedKeywords` returns empty arrays for 3+ word phrase seeds (e.g. `does medicare cover dental` returns 0; `medicare advantage` returns 100). All seeds were collapsed to 1–2 word forms. This is consistent with the API's date-format gotcha logged in `specs/research/bing-webmaster-api.md` §7 — the API's keyword index is term-level, not phrase-level.

Secondary references: FANOUT_FORMULA §4.3 (coverage) + §4.4 (state-Medicaid); competitor-landscape.md §3; BUSA inventory CSV for overlap flagging; CONTENT_INVENTORY.md to avoid duplicates.

Demand-score formula: `bing_impressions_weekly × 1.0 + google_monthly_volume × 0.5 + utilization_rank_score × 0.3`. Google volumes are estimated (Bing volumes confirmed). Where a state-fork is implicit, the demand_score reflects the per-state demand; the topic note flags the 51x multiplier.

---

## 2. Subtype split

| Subtype | Topics | Demand profile | Bing-validation | Notes |
|---|---|---|---|---|
| **qa-state-eligibility** | 30 | High (1,000–10,000 broad/week per state pattern) | **STRONG** (3/8 Bing-validated per FANOUT §4.4; "medicaid eligibility" 17,730 strict/week; "medi-cal" 11,592 strict/week; "ahcccs" 23,895 strict/week) | Highest single demand surface; near-total BUSA overlap requires strict intent split |
| **qa-coverage** | 72 | Mid (300–4,400 broad/week per query) | **WEAK** (Medicare.gov + AARP own head terms; long-tail open) | Bing reports only 4 distinct "does X cover Y" phrases above 1,000 broad/week — does-medicare-cover-dental (already shipped), does-medicare-cover-hearing-aids, does-medicare-cover-wegovy, hearing-aids-covered-by-medicare. Long-tail combo plays carry the volume. |

**Why coverage Q&A still gets 72 topics despite weak head-term Bing volume:** the FANOUT §4.3 recipe + competitor-landscape §3 both agree that the play here is long-tail and MA-add-on shapes ("does Medicare Advantage cover X", "does Medicaid cover X for adults in [state]"), where Medicare.gov is skeletal and AARP under-invests. Eight subgroups dominate:

1. **GLP-1 drug coverage** (Ozempic/Wegovy/Mounjaro/Zepbound across Medicare/Medicaid/ACA) — fresh demand, 2024 FDA cardiovascular approval changed coverage rules
2. **Hearing/vision/dental siblings** (extending existing CU dental/vision pages into braces, glasses, implants, dentures, MA add-ons)
3. **Long-term care** (nursing home, assisted living, home health — Medicare 100-day max trap is high-engagement)
4. **Mental health / therapy / chiropractor / acupuncture** — competitor-landscape §3 explicitly flags this as wide open
5. **Vaccines** (shingles/RSV/COVID/flu — Part D IRA rule changed in 2023)
6. **Medicare Advantage add-on benefits** (gym/meals/transportation/dental/vision — SSBCI rule)
7. **Dual eligibility + cross-program edge cases** (Medicare + Medicaid, ACA + employer, Medicaid + working) — these are pure CU intent (eligibility/shopping decision)
8. **"Who qualifies" framings** (Extra Help, MSP, ACA subsidy, MAGI) — overlap with existing CU pages flagged as `slight`

---

## 3. State-eligibility expansion math

| Pattern | Per-topic page count | Total page output |
|---|---|---|
| `state-medicaid-income-limits` (1 topic in CSV) | 51 (50 states + DC) | 51 |
| `state-medicaid-eligibility` | 51 | 51 |
| `state-chip-eligibility` | 51 | 51 |
| `state-aca-income-limits` | 51 | 51 |
| `state-msp-income-limits` | 51 | 51 |
| `state-medicaid-family-of-4` | 51 | 51 |
| `state-medicaid-asset-limits` | 51 | 51 |
| `state-medicaid-expansion-status` | 10 (non-expansion states only) | 10 |
| `state-medicaid-pregnant-women` | 51 | 51 |
| `state-medicaid-seniors` | 51 | 51 |
| `state-medicaid-disabled` | 51 | 51 |
| `state-medicaid-working-people` | 51 | 51 |
| `state-medicaid-undocumented` | 51 | 51 |
| `state-medicaid-after-job-loss` | 51 | 51 |
| `does-medicaid-cover-dental-adults` | 51 | 51 |
| `does-medicaid-cover-eye-exams` | 51 | 51 |
| `does-medicaid-cover-ivf` | 19 (mandate states only) | 19 |
| **13 state-brand variants** (medi-cal, ahcccs, mnsure, soonercare, etc.) | 1 each | 13 |
| **Non-forking state-eligibility topics** | 1 each (3 topics) | 3 |
| **Total state-eligibility surface** | — | **~840 pages potential** |

Add 53 coverage topics that don't fork by state = **~895 pages** total. Cap at priority-1 expansion (state-medicaid-income-limits 51 + state-medicaid-eligibility 51 + 13 brand variants + 53 coverage = **168 pages** for first build wave). Then expand into priority-2 forks for state-chip-eligibility / state-aca-income-limits / state-msp-income-limits at +153.

**Critical caveat: Track D will absorb the lighthouse `/medicaid-income-limits/[state]` route** (per HANDOFF §3 + FANOUT §5.1). That factory builds 51 pages on a NEW route, not under `/qa/`. Decision needed (escalate to Jacob in critic phase): does CoveredUSA build state-Medicaid eligibility under `/qa/medicaid-[state]` (FANOUT §4.4's stated URL pattern) OR `/medicaid-income-limits/[state]` (Track D's stated URL pattern)? They are the same content. Two reasonable paths:

- (a) Build 51 pages under `/medicaid-income-limits/[state]` (Track D) and 0 pages under `/qa/medicaid-[state]` — saves work, slightly worse for FANOUT §4.4's "income limit + state + year" lookup shape because URL doesn't match query as closely.
- (b) Build both. URLs are not sacred (slugs are; routes don't conflict). Cross-link aggressively. Doubles work.

**Recommendation: (a). Move state-Medicaid eligibility under Track D's `/medicaid-income-limits/[state]` route. The Q&A template then becomes mostly coverage Q&A.** This is also more honest about template purpose: `/qa/` should be Q&A in the "does X cover Y / can I get Z" framing, not lookup tables.

---

## 4. Top-5 coverage Q&A topics (highest confidence)

1. **`does-medicare-cover-hearing-aids`** — Bing-confirmed 2,487 broad/1,868 strict per week. Competitor-landscape §3 flags this as long-tail open; Medicare.gov has a 350-word skeletal page. We can build a 2,000-word FANOUT §4.3-aligned page with MA add-on, OTC alternatives, and out-of-pocket cost table.
2. **`does-medicare-cover-ozempic` / `does-medicare-cover-wegovy`** — Bing-confirmed 1,522 broad on Wegovy alone; Ozempic medicare cluster has 100 related queries pulling demand. 2024 FDA cardiovascular indication created fresh coverage Q&A demand. Bing trend strongly up.
3. **`does-medicaid-cover-dental-adults`** — State-by-state plays the FANOUT §3.2 state-context-everywhere rule. CMS state-Medicaid dental tracker is publicly available; we can fork into 51 pages or one page with comparison table.
4. **`does-medicare-cover-nursing-home`** — Mid-volume but high-engagement (the "100-day max" trap is a famous misconception). FANOUT §4.3 specification shape. Cross-links into existing CU rehab Q&A.
5. **`who-qualifies-for-msp` / `who-qualifies-for-extra-help-medicare`** — Bing-confirmed 13,183 broad on `qmb` alone; 21,942 broad on `extra help`. Existing CU pages (CU-104, CU-120) are queued at the head-term level; this Q&A is the entry-point variant that funnels to them.

---

## 5. Top-5 state-eligibility Q&As by demand × population

Ranked by `state_population × bing_volume_per_state`:

1. **California Medi-Cal Income Limits 2026** — Bing: `medi-cal` 52,377 broad / 11,592 strict; CA pop 39M; state-named brand validated. Note: already partially queued at CU-109.
2. **Texas Medicaid Income Limits 2026** — Bing: `texas medicaid` 15,490 broad; `medicaid texas` 4,318 broad; TX pop 30M. FANOUT real-Bing dataset shows `texas medicaid income limits 2026` got 1,079 citations in 2 months — top single state shape. Already queued at CU-027.
3. **Florida Medicaid Eligibility 2026** — Bing: `florida medicaid` 44,900 broad — second-highest state Bing volume behind Indiana. FL pop 22M. Already queued at CU-032 / CU-108.
4. **Arizona AHCCCS Income Limits 2026** — Bing: `ahcccs` 90,165 broad / 23,895 strict — single highest state-brand Bing volume in the dataset. Pop 7M but volume disproportionately high. Hispanic / Spanish translation upside.
5. **Ohio Medicaid Eligibility 2026** — Bing: `ohio medicaid` 23,889 broad. Pop 12M. FANOUT real-Bing has `ohio medicaid income limit for a family of 4 2026` as a top-citation pattern.

---

## 6. BUSA overlap warnings (count: 24 topics flagged)

**Heavy overlap (3 topics):**
- `state-medicaid-income-limits` — BUSA has 50 state pages titled `[state] Medicaid Income Limits 2026`. CU version distinguishes by FANOUT §4.4 structural shape: lookup-table-first vs. application-walkthrough-first. Intent split makes both viable BUT we must enforce the differentiator strictly in writer prompt.
- `state-medicaid-eligibility` — BUSA has 50 state pages titled `[state] Medicaid Eligibility 2026: Income Limits, Requirements, and How to Apply`. Same situation; BUSA leans application-walkthrough, CU should lean income-table + decision tree.
- `how-much-can-you-make-and-still-get-medicaid` — BUSA has multiple "How Much Can You Make" articles. CU version frames as state-eligibility decision tool (shopping intent).

**Slight overlap (21 topics):**
- All 13 state-brand variants (medi-cal, ahcccs, mnsure, soonercare, mainecare, badgercare, husky, tenncare, arhome, masshealth, ohp, hip, nj-familycare) — BUSA covers these under generic state-Medicaid titles. CU's state-brand variant uses brand-specific FANOUT §3.2 routing.
- `state-chip-eligibility` — BUSA has state-CHIP pages but framed as eligibility/application. CU framing: "Does my child qualify".
- `state-aca-income-limits` — BUSA has 50 state ACA eligibility pages. Same intent split.
- `state-medicaid-pregnant-women`, `state-medicaid-seniors`, `state-medicaid-disabled` — BUSA has tangential demographic-Medicaid coverage. Slight.
- `who-qualifies-for-aca-subsidy`, `who-qualifies-for-extra-help-medicare`, `who-qualifies-for-msp`, `what-counts-as-income-for-medicaid`, `what-counts-as-income-for-aca`, `how-to-keep-medicaid-when-income-increases`, `can-i-keep-medicaid-after-getting-job`, `is-medicaid-free` — BUSA has MAGI / income / qualification content with application-walkthrough framing. CU adds eligibility-decision framing.

**Recommendation:** writer prompt for qa-state-eligibility subtype must include a HARD GATE: "If this page would read like a how-to-apply walkthrough, abort. CoveredUSA's eligibility Q&A leads with the income-limit table and the qualify/don't-qualify decision."

---

## 7. Surprises

1. **`ahcccs` has 90,165 broad / 23,895 strict weekly Bing impressions — higher than any other state-Medicaid term including `medi-cal` (52,377 broad).** Arizona's pop is 7M; California's is 39M. This is a Bing-index quirk that disproportionately rewards the AHCCCS brand, possibly because of provider-portal queries dominating the surface. Translates to: AZ AHCCCS gets a higher priority than population-share would suggest. State-brand priority list should be: AHCCCS > Medi-Cal > MNsure > SoonerCare > BadgerCare > MaineCare > HIP > others.
2. **"Does medicare cover" head-term Bing volume is much thinner than expected.** Only 4 distinct phrases above 1,000 broad impressions/week passed the filter (dental, hearing aids, Wegovy, hearing aids covered by Medicare). Medicare.gov + AARP DO own this surface. The play is exclusively long-tail combo and MA add-on framings, NOT head terms. This validates the competitor-landscape §3 LOW-leverage call on head-term coverage Q&A.
3. **`extra help` (Medicare LIS) clocks 21,942 broad / 1,939 strict per week** — much higher than expected for what is widely considered a niche program. This suggests the lower-income Medicare cohort searches more than the program's enrollment numbers suggest. Strong implication: CU-120 (Extra Help) and CU-104 (MSP) lighthouse pages are under-prioritized in the existing roadmap. Q&A funnel-in pages (`who-qualifies-for-extra-help-medicare`, `who-qualifies-for-msp`) bump up to priority 1.
4. **`marketplace` alone gets 8,720,298 broad / 236,803 strict impressions per week.** That's an order of magnitude larger than any other healthcare insurance term. Note: large fraction is Facebook Marketplace pollution (Bing's term-level index doesn't disambiguate). Strict-match (`health insurance marketplace` 32,536 broad) is the cleaner signal. ACA / Marketplace coverage Q&A is a real surface even if head-term broad-match numbers are misleading.
5. **`chip` is dominated by `chocolate chip cookies` (146,538 broad).** Term collision makes CHIP children's-insurance Bing seeding useless without `health` or `eligibility` qualifier. State-CHIP Q&A demand is real but has to be inferred from state-Medicaid related queries + CMS enrollment tracker, not direct Bing seeding.
6. **`covered california income limits 2026` shows up as a distinct related query with 3,062 broad / 2,857 strict.** Covered California is the ACA marketplace, not Medi-Cal. This validates that state-ACA income-limit content has its own demand surface separate from state-Medicaid — and Covered California specifically is a brand worth its own page.

---

## 8. Topics deliberately excluded

- **`does Medicare cover X` head terms already shipped** (dental, vision) — skipped per HANDOFF §3 cross-reference rule.
- **`does Medicaid cover rehab`** — already shipped.
- **Pure MAGI deep dives** — handled by glossary track (Track E regen for the existing CU magi page). FANOUT §4.5 explicitly warns against over-investing in concept-only glossary pages; the qa-coverage track should not duplicate.
- **`medicaid provider portal` and login-flow queries** — high Bing volume but pure utility intent, not eligibility/coverage Q&A.
- **`obamacare` head term** — captured under `is-aca-still-available`. Pure brand head terms are owned by Healthcare.gov + healthinsurance.org.
- **State + drug + coverage combos** (e.g., "does Texas Medicaid cover Ozempic") — captured as state-fork extensions of `does-medicaid-cover-ozempic-weight-loss`. Listed as one topic with state expansion flag rather than 51 separate rows.
- **Spanish-only Q&A** — out of scope for this phase. Spanish opportunity flagged in competitor-landscape but Spanish content build is a separate track decision.

---

## 9. Confidence statement

**High confidence** in the qa-state-eligibility list (Bing data is strong, FANOUT §4.4 is 3/8 Bing-validated, BUSA proves demand by having already shipped 50-state coverage).

**Medium-high confidence** in the qa-coverage list. Bing data is thinner for head terms — competitor-landscape §3 + FANOUT §4.3 specifically tell us this — but the 8 subgroups identified above are organic-question-pattern validated (GLP-1 drug class, MA add-ons, long-term care misconceptions, vaccine rules) and have demand evidence even when individual queries don't pass the ≥50/week threshold.

**Lower confidence (priority 3)** on edge-case Q&A like `does-medicare-cover-eyeglasses-after-cataract`, `does-medicaid-cover-suboxone` — these are correct in principle but may not justify writer investment until higher-priority topics are exhausted.

---

*Agent A handoff complete. Pass to critic with the request to (a) check for missing GLP-1 / class-coverage Q&As; (b) re-adjudicate the BUSA-overlap intent split on state-Medicaid eligibility; (c) escalate the Track D vs `/qa/` URL conflict to Jacob.*
