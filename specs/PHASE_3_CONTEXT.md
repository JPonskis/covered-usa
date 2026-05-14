# Phase 3 Context — State-Based Pages

**Last updated:** 2026-05-14
**Purpose:** Bridge doc for a fresh agent picking up after compaction. Self-contained — everything needed to continue is here.

---

## TL;DR

Phase 2 is **fully shipped** — all 6 template tracks (procedures, drugs, Q&A, glossary, events, personas) have dynamic routes + agents + bulkgen + sample pages live. 16+ pages live, ~58 entries queued for mass production.

**What's next: Phase 3 — Two state-based template tracks.**

After analyzing the BenefitsUSA AI Performance Report (Bing's Copilot citation data), I shifted strategy. Don't bulk-expand the existing 6 queues yet. Instead:

1. **Phase 3A — State Medicare Advantage pages** (`/medicare-advantage/[state]`) — 50 pages. Highest monetization per page (broker affiliate at $300-$600+ per enrollment). Zero BenefitsUSA overlap. Real state/county variance in data.

2. **Phase 3B — State Health Insurance Exchange pages** (`/marketplace/[state]`) — 18 pages. The 18 states + DC that run their own ACA marketplace (Covered California, NY State of Health, MA Health Connector, Pennie, etc.). High citation potential, ACA-funnel monetization.

Build infra for both, then start mass production. **Pattern reuses everything from Phase 2** — same writer/verifier/bulkgen/queue/validator architecture, new schemas.

---

## What I just shipped this session

### Phase 2 — Six template tracks, all complete

| Phase | Track | Route | Schema file | Live pages | Queued |
|---|---|---|---|---|---|
| 2A | Procedure cost | `/cost/[procedure]` | `src/lib/procedures.ts` | mri, ct-scan, colonoscopy | 10 |
| 2B | Drugs | `/drug/[drug]` | `src/lib/drugs.ts` | insulin-cost, ozempic-cost, metformin-cost | 10 |
| 2C | Q&A | `/qa/[question]` | `src/lib/qa.ts` | dental, vision, rehab | 10 |
| 2D | Glossary | `/glossary/[term]` | `src/lib/glossary.ts` | oop-max, deductible, magi | 10 |
| 2E | Trigger events | `/event/[event]` | `src/lib/events.ts` | lost-job, turning-26, turning-65-medicare | 10 |
| 2F | Personas | `/for/[persona]` | `src/lib/personas.ts` | gig-workers, self-employed | 8 (+2 deferred) |

**Each track has:**
- Dynamic Next.js route at `src/app/[locale]/<track>/[slug]/page.tsx`
- TypeScript loader at `src/lib/<track>.ts` with `getAllX`, `getXBySlug`, `getAllXSlugs`, `pickLocale`, `pickLocaleArray`
- Build-time validator at `scripts/validate-<track>.js` wired into `prebuild` hook
- Writer agent at `.claude/agents/coveredusa-<track>-writer.md`
- Verifier agent at `.claude/agents/coveredusa-<track>-verifier.md`
- On-demand bulkgen cron at `.claude/claudeclaw/jobs/coveredusa-<track>-bulkgen.md`
- Queue helper at `scripts/coveredusa-<track>-queue.js` with `pick / mark-writing / update / summary`
- Progress doc at `specs/PHASE_2<X>_PROGRESS.md`

**Each writer + verifier was reviewed by an adversarial critic agent before commit.** Six critic reviews caught bugs that would have shipped to production:

1. Phase 2A: `_queue.json` was rendering as a procedure page (build crash)
2. Phase 2B: `medicareAspPerUnit` was required but doesn't apply to oral Part D drugs (would have crashed metformin pages)
3. Phase 2C: shortAnswer/fullAnswer drift in QAPage schema (would have shipped contradictions)
4. Phase 2D: `term` canonical rule (MAGI was queued wrong — acronym vs spelled-out)
5. Phase 2E: Medicare IEP doesn't fit "deadline" framing (7-month window, not deadline)
6. Phase 2F: **Self-employed health insurance deduction does NOT reduce SE tax** — was already shipped in gold standard, would have propagated to every persona/Q&A page mentioning it

All fixed before push.

---

## Patterns that hardened over 6 iterations (reuse these)

**Schema design:**
- All bilingual text uses `LocalizedString = {en: string, es: string}`
- All FAQs are flat `{question: string, answer: string}` arrays — NEVER LocalizedString objects (the one exception, hard-learned)
- Optional sections are truly optional (validator allows omission)
- Locked enums for category/ctaTarget/status fields
- `lastUpdated` ISO format check
- 2026 anchor facts baked into both writer and verifier prompts

**Loader pattern:**
- Read from `content/data/<track>/*.json`
- Filter out `_`-prefix files and `.tmp.json` (atomic write tempfiles)
- Return null on parse failure, route uses `notFound()`
- `pickLocale(ls, locale)` helper for rendering

**Atomic write pattern (writer agent):**
1. Write to `<slug>.tmp.json`
2. Validate JSON parses: `node -e "JSON.parse(...)"`
3. `mv <slug>.tmp.json <slug>.json`

**Validator pattern:**
- Type-checks every required + optional field
- Cross-field coherence checks (e.g., `partBDeductibleAmount` matches `partBDeductibleYear`)
- Status/text coherence (e.g., status="yes" cells don't say "No")
- Locked enum enforcement
- ISO date format check
- Skip `_`-prefix + `.tmp.json` files

**Verifier pattern:**
- STEP 1A: Internal consistency pre-check (BEFORE primary-source research)
- Drift between key fields → always FLAG, never silently edit one to match another
- Grep-then-edit for repeated values (no `replace_all` on bare $ amounts)
- Force-flag rule: when high-stakes claim (fullAnswer, definition, hero.subhero, urgency.heading) needs correction → flag, don't auto-edit
- 30+ turns without all categories checked → emit `flagged` (not `approved`)
- Use primary sources (CMS.gov, ASPE.HHS.gov, IRS, KFF) over secondary

**Bulkgen cron pattern:**
- Read queue (`pick N`)
- Mark batch as `writing` (atomic)
- Spawn N parallel writer agents
- Spawn N parallel verifier agents
- Bucket results: `verified` / `flagged` / `write_failed`
- Update queue status
- Report summary

**Critic agent process (BEFORE committing):**
- Spawn `general-purpose` agent
- Give it all writer/verifier/cron/schema files for the track
- Ask for ruthless review with severity ratings
- Apply Critical + High fixes before committing
- Defer or accept Medium/Low with notes

---

## Key 2026 anchor facts (baked into all writers + verifiers)

These are referenced across every track. **DO NOT let writers drift on these:**

| Fact | Value | Source |
|---|---|---|
| FPL household-of-1, 48 states (2026) | $15,960 | ASPE.HHS.gov |
| FPL household-of-1, 48 states (2025, used for 2026 ACA plans) | $15,650 | ASPE archived |
| 138% FPL Medicaid expansion line | $22,025 hh-1 | derived |
| 400% FPL ACA cliff | $63,840 hh-1 | derived (cliff IS back for 2026) |
| Medicare Part B 2026 premium | $202.90/mo | CMS |
| Medicare Part B 2026 deductible | $283 | CMS |
| Medicare Part A 2026 inpatient deductible | $1,736 | CMS |
| Medicare Part D 2026 OOP cap | $2,100 | IRA 2022 |
| Medicare Part D insulin cap | $35/mo | IRA 2022 (effective 2023) |
| ACA 2026 OOP max | $9,200 individual / $18,400 family | HHS |
| HSA HDHP 2026 OOP max | $8,500 / $17,000 | IRS |
| HSA 2026 contribution limit | $4,400 / $8,750 | IRS |
| IRS 2026 mileage rate | $0.70/mile | IRS |
| Inflation Reduction Act | signed Aug 16, 2022 (NOT 2023) | Congress.gov |
| Medicaid expansion (as of May 2026) | 40 + DC expanded; 10 non-expansion | KFF |
| Non-expansion states | AL, FL, GA, KS, MS, SC, TN, TX, WI, WY | KFF |

**ACA SUBSIDY CLIFF IS BACK FOR 2026.** Enhanced PTCs from ARPA/IRA expired Jan 1, 2026. Any claim that the cliff is "extended through 2025" is OUTDATED and must be corrected. Phrasing: "subsidies phase down approaching 400% FPL and stop at 400%" — not "below 400% = subsidies" (which suggests binary).

**Self-employed health insurance deduction (Form 7206) reduces INCOME tax only. Does NOT reduce self-employment tax.** HSA contributions for sole proprietors same rule. Critical correction — was shipped in gold standard, now hardcoded into every relevant writer + verifier.

---

## The strategic insight that drove Phase 3

Jacob has Google Search Console / Bing AI Performance Report access for **BenefitsUSA.org** (not CoveredUSA yet — too new). The May 2026 AI Citation Report on BenefitsUSA showed:

**Top pages by Copilot citations:**

| Page | Citations | Pattern |
|---|---|---|
| social-security-cola-2027 | 7,290 | Year-anchored numeric fact |
| federal-poverty-level-2026 | 6,924 | Year-anchored numeric fact |
| federal-poverty-level (hub) | 4,925 | Programmatic reference |
| snap-income-limits | 4,234 | Numeric fact |
| california-medicaid-eligibility-2026 | 2,079 | **State + program + year** |
| texas-medicaid-application | 1,741 | **State + how-to-apply** |

**Three lessons:**

1. **AI engines reward year-anchored numeric facts.** Validates Phase 2 architecture — our procedure cost / drug cost / glossary annual limits / event deadline pages all hit this shape.

2. **State + program + year pages get MASSIVE citations.** California Medicaid 2079, Texas Medicaid 1408, Iowa, Missouri, Ohio, Arizona, NC, Oregon — every state Medicaid page gets cited. This is the highest-leverage gap.

3. **The 6-track architecture is correct.** /life-events, /compare, eligibility hubs all show citations. We just need more of the right shapes.

**But the obvious move (build CoveredUSA state Medicaid/SNAP pages) is wrong.** BenefitsUSA already owns those. Building parallel CoveredUSA versions would cannibalize.

**The clean separation:**

- **BenefitsUSA** = eligibility/application/"am I eligible for government program X" (state Medicaid, state SNAP, state ACA eligibility, SSI/SSDI, Section 8, TANF). Already ranks. Don't compete.
- **CoveredUSA** = healthcare navigation/care+cost/"how do I get this care or fix this bill." Procedure costs, drug costs, medical bills, charity care, network/provider, plan selection, Medicare specifics, surprise billing. **This is where state-by-state can win without overlap.**

---

## Phase 3A — State Medicare Advantage pages

### Why this first

- **Highest monetization per page.** Medicare Advantage enrollments pay brokers $300-$600+ commission. One MA enrollment from a state page = many months of CoveredUSA general traffic in revenue.
- **Zero BenefitsUSA overlap.** Medicare Advantage is commercial insurance, not government benefits.
- **Genuine state/county data variance.** Plan availability varies by county (rural 3 plans, urban 50+). Carrier participation, Star Ratings, premiums all state-specific.
- **High commercial intent queries.** "Best Medicare Advantage plans in [state]", "Medicare Advantage plans near me", "[Insurer] Medicare Advantage [state]" are huge volume.
- **Annual Election Period (Oct 15 - Dec 7) is peak demand.** Be ready for AEP 2026.
- **AI citation shape fits.** Year-anchored ("2026 Medicare Advantage plans in California"), state-specific, numeric, listable.

### Schema design notes (for the agent picking this up)

Route: `/medicare-advantage/[state]/page.tsx`
Loader: `src/lib/medicare-advantage.ts`
Data: `content/data/medicare-advantage/<state-slug>.json`
Validator: `scripts/validate-medicare-advantage.js`
Writer agent: `.claude/agents/coveredusa-medicare-advantage-writer.md`
Verifier agent: `.claude/agents/coveredusa-medicare-advantage-verifier.md`

**Suggested schema fields:**

```typescript
interface MedicareAdvantageState {
  slug: string;                    // "california", "texas", etc.
  stateName: LocalizedString;      // "California", "Texas"
  stateAbbreviation: string;       // "CA", "TX"
  topic: string;
  medicalSpecialty: string;
  ctaTarget: 'screener' | 'analyzer';  // probably "screener"
  lastUpdated: string;
  readingTime: string;

  meta: { title, description };
  hero: { h1, subhero };
  quickAnswer: LocalizedString;

  // State MA market data (the proprietary numeric content)
  marketOverview: {
    totalPlansAvailable: number;        // e.g., 137 plans in CA
    enrolledBeneficiaries: number;      // e.g., 4.5M enrollees in CA
    averageMonthlyPremium: number;      // e.g., $42 average
    averageStarRating: number;          // e.g., 4.2 stars
    topCarriers: Array<{               // top 5-10 carriers
      name: string;                     // "Humana", "UCC", "Aetna"
      planCount: number;
      averageStarRating: number;
      averagePremium: number;
    }>;
    source: string;                     // "CMS Plan Finder data Q4 2025"
  };

  // Plan type breakdown
  planTypes: {
    headers: LocalizedStringArray;     // ["Plan Type", "Plans Available", "Avg Premium"]
    rows: LocalizedStringArray[];      // HMO / PPO / SNP / PFFS rows
    footnote: LocalizedString;
    source: string;
  };

  // County-level variance callout (optional but high-value)
  countyVariance?: {
    intro: LocalizedString;
    examples: Array<{
      county: LocalizedString;
      planCount: number;
      averagePremium: number;
    }>;
  };

  // What to look for (educational, applies AI citation rewards)
  whatToLookFor: {
    intro: LocalizedString;
    items: LocalizedString[];         // network, prescription drug coverage, Star Rating, extras, OOP max
  };

  // Key dates
  importantDates: {
    intro: LocalizedString;
    items: Array<{
      label: LocalizedString;
      date: string;                    // "October 15 - December 7, 2026"
    }>;
  };

  // Detail sections (flexible, e.g., "How MA differs from Original Medicare in CA", "State extras unique to this state")
  detailSections: Array<{
    heading: LocalizedString;
    paragraphs: LocalizedString[];
    list?: LocalizedString[];
    table?: { ... };
  }>;

  faqs: { en: LocalizedFAQ[]; es: LocalizedFAQ[] };
  relatedLinks: RelatedLink[];
  sources: Source[];
}
```

**Data sources for writer agent:**
- CMS Medicare Plan Finder (https://www.medicare.gov/plan-compare/) — state-level plan counts
- CMS Star Ratings reports (https://www.cms.gov/medicare/quality/medicare-advantage-quality-rating-system)
- KFF Medicare Advantage in [State] briefs (https://www.kff.org/medicare/)
- State Insurance Department websites for state-specific rules

**Critical anchor facts for MA writer:**
- 2026 Medicare Advantage AEP: October 15 - December 7, 2026
- 2026 MA OEP (Medicare Advantage Open Enrollment Period): January 1 - March 31, 2026
- Original Medicare Part B premium $202.90, Part B deductible $283 (referenced when explaining "vs Original Medicare")
- $2,100 Part D OOP cap (most MA plans include drug coverage / MA-PD)

### Output target
50 state pages + 1 DC. Total 51.

### Build steps (mirror Phase 2 pattern)

1. **Schema + loader + dynamic route + validator + sitemap + 1 sample page (California)** — half day
2. **Writer agent + verifier agent + bulkgen + queue helper + queue file** — half day
3. **Test writer on 2 stress-test states (e.g., California — high competition, Wyoming — low plan count)** — parallel run
4. **Adversarial critic review** — apply critical/high fixes
5. **Run bulkgen in batches of 10 until 51 states done** — ~1 week

---

## Phase 3B — State Health Insurance Exchange pages

### Why this second

- 18 states + DC run their own ACA marketplace (state-based exchange / SBE) instead of using healthcare.gov
- Each SBE has a unique application UX, unique carrier mix, sometimes unique subsidies (CA, NJ, MD, WA add state subsidies above federal PTC)
- BenefitsUSA's state ACA pages exist but get fewer citations than state Medicaid pages — suggests gap to fill
- Finite scope: 18 pages, not 50

### The 18 SBE states + DC

CA (Covered California), CO (Connect for Health Colorado), CT (Access Health CT), DC (DC Health Link), GA (Georgia Access), ID (Your Health Idaho), IL (Get Covered Illinois), KY (kynect), ME (CoverME.gov), MD (Maryland Health Connection), MA (Health Connector), MN (MNsure), NV (Nevada Health Link), NJ (Get Covered New Jersey), NM (beWellnm), NY (NY State of Health), OR (Oregon Health Insurance Marketplace), PA (Pennie), RI (HealthSource RI), VT (Vermont Health Connect), VA (Virginia's Insurance Marketplace), WA (Washington Healthplanfinder).

That's actually 22 — DC + 21 states. Let me recount: as of 2026 it's roughly 21 SBE entities (some shared with federal platform). Verify count when building.

### Schema design notes

Route: `/marketplace/[state]/page.tsx`
Loader: `src/lib/marketplaces.ts`

**Suggested fields:**

```typescript
interface StateMarketplace {
  slug: string;
  stateName: LocalizedString;
  exchangeName: string;            // "Covered California", "NY State of Health", etc.
  exchangeURL: string;             // "https://www.coveredca.com"
  exchangeType: 'state-based' | 'federal-partnership' | 'state-based-using-federal-platform';
  topic: string;
  medicalSpecialty: string;
  ctaTarget: 'screener';
  lastUpdated: string;
  readingTime: string;

  meta: { title, description };
  hero: { h1, subhero };
  quickAnswer: LocalizedString;

  // Key dates
  openEnrollmentPeriod: {
    start: string;                  // "2026-11-01"
    end: string;                    // "2027-01-15"
  };

  // Premium / subsidy data
  premiumOverview: {
    averageMonthlyPremium: number;
    averageAfterSubsidies: number;
    medianAnnualSubsidy: number;
    enrolledCount: number;
    source: string;
  };

  // Carrier breakdown
  topCarriers: Array<{
    name: string;
    planCount: number;
  }>;

  // State-specific subsidies (only some states)
  stateSubsidies?: {
    intro: LocalizedString;
    details: LocalizedString[];     // e.g., "California state subsidies above 400% FPL"
  };

  // How to apply
  howToApply: {
    intro: LocalizedString;
    steps: Array<{ name, text }>;   // HowTo schema steps
  };

  // Cost-sharing reductions
  costSharingReductions?: {
    intro: LocalizedString;
    incomeLimit: string;            // "Below 250% FPL"
  };

  detailSections: DetailSection[];
  faqs: { en, es };
  relatedLinks: RelatedLink[];
  sources: Source[];
}
```

**Critical anchor facts for marketplace writer:**
- ACA Open Enrollment 2027 (for 2027 plans): Nov 1 2026 - Jan 15 2027
- Subsidy cliff IS back for 2026
- States with state-funded subsidies above 400% FPL: California, New Jersey, Massachusetts (some), DC, etc. — verify per state
- 2025 FPL is the income measure for 2026 marketplace plans (use FPL_2025 from anchor facts)
- 2026 FPL becomes the measure for 2027 marketplace plans

### Output target
~21 state pages.

### Build steps
Same pattern as Phase 3A.

---

## Critical reuse — what's already built

Every Phase 2 pattern transfers directly to Phase 3:

**Files to mirror when building Phase 3A:**
- `src/lib/procedures.ts` → mirror to `src/lib/medicare-advantage.ts`
- `src/app/[locale]/cost/[procedure]/page.tsx` → mirror to `src/app/[locale]/medicare-advantage/[state]/page.tsx`
- `scripts/validate-procedures.js` → mirror to `scripts/validate-medicare-advantage.js`
- `.claude/agents/coveredusa-procedure-writer.md` → mirror to `.claude/agents/coveredusa-medicare-advantage-writer.md`
- `.claude/agents/coveredusa-procedure-verifier.md` → mirror to `.claude/agents/coveredusa-medicare-advantage-verifier.md`
- `.claude/claudeclaw/jobs/coveredusa-procedure-bulkgen.md` → mirror
- `scripts/coveredusa-procedure-queue.js` → mirror
- `content/data/procedures/_queue.json` → mirror
- `content/data/procedures/mri.json` (gold standard) → mirror to `content/data/medicare-advantage/california.json`

Don't reinvent. Copy and modify.

---

## What I deliberately decided NOT to do

- **State Medicaid eligibility pages on CoveredUSA** — BenefitsUSA territory. Would cannibalize.
- **State SNAP / Section 8 / TANF / SSI pages** — All BenefitsUSA territory.
- **Generic state ACA eligibility pages** — BenefitsUSA has these. Ambiguous overlap. Better to focus CoveredUSA's state work on healthcare-unique angles.
- **State surprise billing pages** — Could work later (Tier 3) but not immediate priority.
- **State procedure cost variants** ("MRI cost in California") — Could be high-volume but state price variance for many procedures isn't that big. Focus national procedure pages first, add state variants only for genuinely high-variance procedures later.
- **Veterans persona track** — Marked deferred in Phase 2F. VA priority groups (1-8), CHAMPVA, TRICARE plan variants don't fit the optionsOverview/optionDetails schema. Needs dedicated schema.
- **Noncitizens/Immigrants persona** — Marked deferred. Legal accuracy risk. Needs legal-services review (NILC) before generation.
- **Pure keyword research agent expansion of existing queues** — Considered, decided state expansion is higher leverage.

---

## What's queued and ready to mass-generate (Phase 2 production)

After Phase 3 infra is built, you can ALSO start running Phase 2 mass production in parallel. Currently queued:

| Track | Queued |
|---|---|
| Procedures | 10 (CT, colonoscopy, mammogram, X-ray, ultrasound, echocardiogram, ER visit, urgent care, PT, endoscopy) |
| Drugs | 10 (Ozempic, Metformin, Humira, Eliquis, Atorvastatin, Lisinopril, Albuterol, Jardiance, Levothyroxine, Wegovy) |
| Q&A | 10 (vision, hearing aids, Medicaid dental by state, ACA pre-existing, drug rehab, cataract surgery, etc.) |
| Glossary | 10 (deductible, copay, coinsurance, MAGI, PTC, SEP, EOB, prior auth, HDHP, balance billing) |
| Events | 10 (turning 26, marriage, baby, lost Medicaid, move, retire before Medicare, divorce, self-employed, college grad, plus already-built lost job + turning 65) |
| Personas | 8 (college students, early retirees, small business, uninsured low-income, stay-at-home parents, part-time workers, domestic workers, plus already-built gig-workers + self-employed) |

Run bulkgen via:
```bash
# On the Mac mini (frankthebot) — ClaudeClaw triggers
claudeclaw run coveredusa-procedure-bulkgen
claudeclaw run coveredusa-drug-bulkgen
# etc.
```

Hard cap of 10 per run (WebSearch rate limits). Audit each batch before scaling up.

---

## Live URL examples (eyeball these to see the patterns)

- https://coveredusa.org/en/cost/mri (procedure cost)
- https://coveredusa.org/en/drug/insulin-cost (drug cost)
- https://coveredusa.org/en/qa/does-medicare-cover-dental (Q&A)
- https://coveredusa.org/en/glossary/out-of-pocket-maximum (glossary)
- https://coveredusa.org/en/event/just-lost-job-health-insurance (trigger event)
- https://coveredusa.org/en/for/gig-workers (persona)

All Spanish versions also live (`/es/...`).

---

## Concrete next-session start

1. **Read this doc.**
2. **Read `src/lib/procedures.ts`** — that's the cleanest pattern to mirror.
3. **Read `content/data/procedures/mri.json`** — gold-standard data shape.
4. **Read `.claude/agents/coveredusa-procedure-writer.md` + procedure-verifier.md + procedure-bulkgen.md** — full agent pattern.
5. **Build Phase 3A — State Medicare Advantage** following the schema design notes above.
6. **California first** as the sample state (highest plan count, highest enrollment, best stress test).
7. **Spawn parallel writer test (CA + WY) + critic review** like every other phase.
8. **Apply critic fixes, commit + push both repos** (covered-usa + clawd-workspace).
9. **Then Phase 3B — State Health Insurance Exchanges** following same pattern.
10. **THEN mass production** of Phase 2 queues + new Phase 3 queues.

Total horizon to fully shipped (Phase 3 infra + all mass production): ~4-6 weeks part-time.

---

## Project paths cheatsheet

| Type | Path |
|---|---|
| Project root | `/Users/jacobposner/clawd/projects/covered-usa/` (local) or `/Users/frankthebot/clawd/projects/covered-usa/` (Mac mini production) |
| Source code | `src/` |
| Data files | `content/data/<track>/*.json` |
| Validators | `scripts/validate-<track>.js` |
| Sitemap | `src/app/sitemap.ts` |
| Phase progress docs | `specs/PHASE_2<X>_PROGRESS.md` |
| This doc | `specs/PHASE_3_CONTEXT.md` |
| Agents | `/Users/jacobposner/clawd/.claude/agents/coveredusa-*-writer.md` and `*-verifier.md` |
| Cron jobs | `/Users/jacobposner/clawd/.claude/claudeclaw/jobs/coveredusa-*-bulkgen.md` |
| Queue helpers | `/Users/jacobposner/clawd/scripts/coveredusa-*-queue.js` |

Two git repos:
- `https://github.com/JPonskis/covered-usa.git` — the Next.js project (deploys to Vercel automatically on push)
- `https://github.com/JPonskis/clawd-workspace.git` — the agent/cron/script files (Mac mini pulls from this for production cron runs)

---

## Strategic context to keep in mind

- **CoveredUSA monetizes through ACA enrollment + Medicare plan selection.** Every content decision should route toward one of these funnels.
- **Bing + AI citations are the primary distribution channel**, not Google. The Bing AI Performance Report (set up in Bing Webmaster Tools — free) is the highest-signal source we have for what's working. Set it up for CoveredUSA NOW so data accumulates.
- **CoveredUSA is ~30 days old** as of May 2026. Too new for own GSC/AI citation data — that's why we leaned on BenefitsUSA data this session.
- **BenefitsUSA gets ~10K-11K impressions/day and ~300 clicks/day** as of May 2026. Authority is established. CoveredUSA can leverage the same cross-domain authority via link-building.
- **The ACA subsidy cliff returning for 2026** is a big content opportunity. Anyone earning 350-400% FPL is going to be confused about their costs — content explaining the cliff + state-specific subsidies (CA, NJ have state ones) is high-value.
- **AEP 2026** (Medicare Advantage Open Enrollment Period) is Oct 15 - Dec 7 2026. Have state MA pages live by Sept 1, 2026 to capture the seasonal traffic spike.

---

*This doc is the bridge. After compaction, the fresh agent reads this and continues from "build Phase 3A — state Medicare Advantage." Nothing else needed to ramp up.*
