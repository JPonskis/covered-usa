# Phase 3A — State Medicare Advantage Pages

**Status:** In progress (infrastructure shipped, 1 verified, 2 flagged, 48 queued)
**Started:** 2026-05-14
**Goal:** Build state-by-state Medicare Advantage template track at `/medicare-advantage/[state]`. 50 states + DC = 51 pages total. Designed to win AI citations for "best Medicare Advantage in [state]" queries and funnel to the screener for broker-affiliate enrollment ($300-$600+ commission per MA enrollment).

## What state MA pages are

State-anchored Medicare Advantage market overview. Each page covers:
- Total plans available statewide
- Enrolled beneficiaries + MA penetration rate
- Top carriers by plan count, Star Rating, average premium
- Plan type breakdown (HMO / PPO / SNP / MSA)
- Optional county variance (for states where it matters)
- What to look for when shopping
- Key Medicare dates (AEP, MA OEP, IEP, SEPs)
- Optional state-specific extras (CA Medi-Cal D-SNPs, FL hurricane SEPs, etc.)
- Detail sections (MA vs Original Medicare, Star Ratings explained, state-specific topic)
- FAQs in EN + ES
- Sources + related links

## Page structure

1. Hero (state name + 2026 + plan count + enrollees + premium + Star Rating)
2. Quick Answer
3. Intro paragraphs
4. Market Overview table (top carriers)
5. Plan Types table (HMO / PPO / SNP / MSA)
6. County Variance table (optional, urban + rural examples)
7. Mid-article CTA
8. What to Look For (list)
9. Important Dates (list)
10. State Extras (optional, list)
11. Detail Sections (heading + paragraphs + optional list/table)
12. FAQs (6-8)
13. End CTA
14. Related Links + Sources

## Tasks

| # | Task | Status |
|---|------|--------|
| 3A-1 | Schema + loader (`src/lib/medicare-advantage.ts`) | done |
| 3A-2 | Validator + prebuild wiring | done |
| 3A-3 | Dynamic route `/medicare-advantage/[state]` | done |
| 3A-4 | Sitemap entries (priority 0.9) | done |
| 3A-5 | California gold-standard JSON | done (corrected after critic) |
| 3A-6 | Writer + verifier agents | done |
| 3A-7 | Bulkgen cron + queue helper + initial queue | done (51 entries) |
| 3A-8 | Stress test: WY + TX writer runs | done (em-dashes cleaned, MOOP fixed, flagged for verifier) |
| 3A-9 | Adversarial critic review + fixes | done (10 issues addressed) |
| 3A-10 | Commit + push | done |

## Progress Log

### 2026-05-14

- Built schema + loader + route + validator + sitemap + agents + bulkgen + queue + 1 sample (California) — half day
- Validator wired into prebuild alongside Phase 2A-2F validators
- Sitemap entries at priority 0.9 (above the 0.85 of Phase 2 templates, reflecting higher monetization)
- Stress-test writers spawned in parallel: Wyoming (smallest market, sparse data, no countyVariance) + Texas (large market, big urban/rural variance, no Kaiser)
  - WY: 30 plans, 28K enrollees, 25% penetration, $32 premium, 6 carriers, 8 FAQs (validates clean)
  - TX: 156 plans, 2.3M enrollees, 51% penetration, $13 premium, 8 carriers, 6 county examples (validates clean)
  - Both initially shipped with em-dashes; cleaned via batch script
  - Both marked `flagged` in queue pending formal verifier re-pass (market stats not yet KFF-cross-checked)

**Critic review surfaced 35 issues. 10 fixed before commit:**

| # | Severity | Fix |
|---|----------|-----|
| 1 | Critical | California `totalPlansAvailable` 144 → **402** (KFF 2026 Spotlight). Cascade: hero, quickAnswer, intro, meta description, FAQs #1 + #6, planTypes rows, all top-carrier planCount values, countyVariance examples. |
| 2 | Critical | 2026 MA in-network MOOP $9,350 → **$9,250** (NCOA, KFF confirm $100 YoY drop). Fixed in writer prompt, verifier prompt, all 3 state JSONs. |
| 3 | Critical | California penetrationPct 57 → 51 + enrolledBeneficiaries 4.5M → 3.6M. Reconciled with ~7M Medicare-eligible Californians per KFF state indicator. |
| 4 | Critical | Validator now enforces `marketOverview.dataYear === 2026` (was `>= 0`, would silently accept stale data). |
| 5 | Critical | Validator now enforces `relatedLinks[].href` against an allowlist of real CoveredUSA route prefixes (matches verifier prompt enumeration). |
| 6 | High | Validator now enforces `meta.title.en` ≤ 70 chars and `meta.description.en` ≤ 160 chars (Google/Bing truncate beyond). All 3 state JSONs trimmed to fit. |
| 7 | High | Validator now caps `averageMonthlyPremium` at $300/mo (catches annual/monthly mix-ups). |
| 8 | High | Validator now soft-checks `topCarriers.planCount` sum ≤ 2x `totalPlansAvailable` (catches obvious fabrication). |
| 9 | High | Writer + verifier prompts now list Kaiser as operating in CA, CO, **DC**, GA, HI, MD, OR, VA, WA (DC was missing from the writer's list). |
| 10 | High | Writer prompt "ONE exception" wording (which technically misled writers into wrapping carrier names in `{en,es}`) replaced with an explicit flat-string field list. Also fixed mangled "Pennsylvania / Pensilvania / Pennsylvania" example. Added Hawaii → Hawái. National MA premium ambiguity ($14 CMS vs $11.50 KFF) clarified. Verifier internal-consistency item 1 corrected (was "all four spots" listing 3). |
| 11 | High | Writer prompt STEP 4 now includes a `grep -c '—\|–'` em-dash check before rename. Zero-tolerance. Two stress-test states would have caught their own em-dashes if this rule had been in place. |
| 12 | Medium | California fabricated claim "Three California plans hold the rare 5-star rating" softened to "A small number of California plans..." (CMS Star Ratings for plan-year 2026 don't release until later in 2025). |
| 13 | Medium | California fabricated D-SNP count ("15 D-SNPs in 2026") softened to "multiple D-SNPs, varying by county." |

**Deferred (low priority / cross-phase):**
- Schema per-section `source: string` → `{name, url}` struct (would link out per-table). Real improvement but cross-phase refactor across all 6 prior tracks; defer.
- `generateStaticParams.slice(0, 20)` — same Phase 2 pattern; defer until closer to AEP 2026 when all 51 + 2 locales = 102 pages should pre-render.
- `/tmp/coveredusa-ma-picked.json` race condition — single-instance assumption is documented; defer.
- `isPositiveInt` → `isNonNegativeInt` rename (cosmetic, naming) — done as part of validator hardening pass.
- Per-plan structured data — backlog enhancement after the first 10 states ship.
- Spanish native-speaker pass on FAQs — defer until 10+ states are shipped.

**Final test results:**
- 3 state JSONs validate: california ✅, texas ✅, wyoming ✅
- Build exit 0
- All 3 states pre-render in both EN + ES (`/en/medicare-advantage/california`, `/es/medicare-advantage/california`, etc.)
- 1 verified (California, gold standard), 2 flagged (Wyoming + Texas pending verifier re-pass), 48 queued

**Phase 3A summary:**
- 1 dynamic route: `/medicare-advantage/[state]`
- 1 loader: `src/lib/medicare-advantage.ts`
- 1 validator: `scripts/validate-medicare-advantage.js` with 8 categories of checks
- 2 agents: ma-state-writer, ma-state-verifier
- 1 cron: ma-state-bulkgen
- 1 helper: coveredusa-ma-state-queue.js
- 1 state page live (California, KFF-verified)
- 2 stress-test states needing verifier re-pass (Wyoming + Texas)
- 48 states queued + AEP-ready before October 15, 2026

## Next steps

1. Run formal verifier agent on Wyoming + Texas to convert flagged → verified (or re-flag with specific factual issues)
2. Run bulkgen in batches of 10 starting with high-monetization states (Florida, New York, Pennsylvania, Ohio, Michigan, Arizona, Georgia, North Carolina, Illinois, New Jersey)
3. Apply medium-priority improvements (per-section source as {name, url}, generateStaticParams unbounded) once 10-15 states are in production
4. Then Phase 3B — State Health Insurance Exchange pages (`/marketplace/[state]`)

## Strategic notes

- **AEP starts October 15, 2026.** That gives us ~5 months to ship 50 state pages and accumulate indexing/citation signal.
- **California is the structural template.** Future state writers reference california.json as the gold standard. Getting the gold standard right (after critic correction) prevents 50 sibling pages from inheriting the same fabrication patterns.
- **Verifier is non-optional.** The critic's biggest finding was that the original writer-generated 144 plan count was wildly off (KFF says 402). The verifier prompt now has explicit "what to do when the writer's stat differs from KFF" guidance and primary-source bias.
- **All Critical + High issues from critic are fixed.** Medium issues either fixed or deferred with explicit reasoning.
