# Programmatic SEO Deep Research — Digest

**Source:** [deep-research-programmatic-seo-2026-05-12.pdf](deep-research-programmatic-seo-2026-05-12.pdf) (31 pages, Gemini Deep Research, 2026-05-12)

**Analysis run:** 2026-05-12. Parallel agents: existing-inventory cross-check + independent critical review.

---

## Section A — Report Rundown

The report is structured in 5 sections plus an architectural conclusion. The core thesis: AI search engines reward structured, data-dense, single-source-of-truth pages with explicit 2026 temporal markers, and KFF/GoodRx/CMS leave a hallucination gap CoveredUSA can intercept by becoming the "definitive translation layer" for healthcare financial data.

### Section 1 — Procedure Cost Research (9 procedures, with data)

| Procedure | Primary Query | Volume | 2026 Anchor | Funnel |
|---|---|---|---|---|
| Urgent Care | "Urgent Care near me" | 636K (Semrush) | $150-250 cash, CPT 99203/99213 | Analyzer |
| Obamacare / Health Insurance | "Obamacare" / "Health insurance" | 550K / 368K (WordStream) | FPL-driven | Screener |
| Colonoscopy | "How much does a colonoscopy cost" | 243K (Semrush) | $1,500-3,000+ (screening vs diagnostic loophole) | Analyzer |
| MRI | "MRI cost" | 203K (Semrush) | National $1,325, Inpatient $2,250, Outpatient $650 | Analyzer |
| Knee Replacement | "Knee replacement surgery cost" | 112K (Semrush) | $15K-35K+, CPT 27447 | Analyzer |
| Bariatric Surgery | "Bariatric surgery cost" | 92K (Semrush) | $10K-25K, CPT 43889 | Screener (eligibility) |
| Primary Care / Doctor Visit | "Doctor appointment cost" | 30K / 7.9K | $100-200, E/M CPT 99213 | Analyzer |
| Childbirth / L&D | "Cost to have a baby" | High intent (no number) | Avg $18,865; vaginal $15,712 | Screener (pregnancy Medicaid) |

**Key architectural insight:** Site of service > geography for pricing. MRI = $650 outpatient vs $2,250 inpatient. 2026 Hospital Price Transparency rules mandate hospitals publish median + 10th + 90th percentile allowed amounts.

### Section 2 — Healthcare Data Hub Research (10 hubs)

| Hub | Volume | 2026 Anchor | Source |
|---|---|---|---|
| Federal Poverty Level 2026 | "FPL chart 2026" | Indiv $15,960 (48 states), $19,950 AK, $18,360 HI; Family of 4: $33,000 | HHS / ASPE (Annual Jan) |
| Medicaid Income Limits 2026 | "Medicaid income limit by state" | Nursing Home Medicaid: $2,982/mo | State agencies (Annual Spring) |
| Medicare Part B Premium 2026 | "Medicare cost 2026" | Base Prem $202.90; Deductible $283; Max IRMAA Prem $527.50 | CMS (Annual Nov) |
| Medicare Savings Programs | "QMB income limits 2026" | QMB Indiv $15,960/yr; SLMB $19,152/yr; QI $21,546/yr | CMS / NCOA |
| Medicare Part A Costs 2026 | "Part A deductible 2026" | Deductible $1,736; Days 61-90 $434/day; SNF $217/day | CMS |
| Medicare Part D Premium 2026 | "Medicare Part D penalty 2026" | Base Prem $38.99; Max IRMAA Surcharge $91.00 | CMS |
| Medical Debt SOL | "Medical debt SOL by state" | NY 3yr, NC 3yr, NM 6yr, TX 4yr, CA 4yr | State Statutes |
| Hospital Charity Care 501(r) | "Hospital financial assistance" | Median cutoff 200-300% FPL | IRS / State Laws |
| Open Enrollment Dates 2026 | "ACA open enrollment 2026" | Fed ACA: Nov 1, 2025 - Jan 15, 2026; Medicare AEP: Oct 15 - Dec 7 | Healthcare.gov / CMS |
| CHIP Income Limits 2026 | "CHIP guidelines 2026" | Typically 200-300% FPL | HHS / CMS |

### Section 3 — Open Exploration & AI Citation Landscape

**3a. High-volume trigger events / personas:**
- "Cost to have a baby without insurance" — catastrophic event trigger
- "Surprise medical bill from emergency room" — No Surprises Act
- "Lost job need health insurance" / "COBRA vs ACA cost" — 60-day SEP
- "Health insurance for freelancers and gig workers" — persona
- "Medicaid for nursing home care" — elder care
- "Using life insurance to build wealth" (1100% spike) — **out of scope for CoveredUSA**

**3b. AI citation mechanics:**
- 89% of healthcare queries trigger AI overviews (source: upGrowth blog — shaky, see Flag #13)
- 5% of ChatGPT messages globally are healthcare-related; 1 in 4 daily active users sends healthcare prompts; ~2M weekly messages on insurance navigation/cost-sharing (source: OpenAI report — solid)
- AI engines prefer HTML tables, ordered lists, FAQ structures
- Hallucination gap: engines frequently confuse 2025 vs 2026 limits because of ACA subsidy lookback complexity
- 7 in 10 healthcare conversations in ChatGPT occur outside clinical hours
- Cross-engine citations have 71% higher quality scores

**3c. Citation winners:** KFF (domain authority + primary research), GoodRx (parsable numerical ranges), CMS (locked in PDFs — extractable opportunity), NerdWallet.

### Section 4 — Schema.org Patterns

- Use `MedicalWebPage` (not generic `Article`). Add `lastReviewed` + `reviewedBy` properties.
- `MedicalProcedure` with `code` property → CPT identifier. Nest `priceSpecification`.
- `FAQPage`: 4-6 highly specific data-driven Q&A pairs per page (not generic).
- `Dataset` schema for tabular hubs (50-state matrices).
- JSON-LD nesting: `MedicalWebPage` is `about` a `MedicalProcedure`, which has a `MedicalCode`, and features an `FAQPage`.

### Section 5 — Recommended Priority Roadmap (15 pages)

Reproduced verbatim with my notes appended (see Section C for my reranked version):

| # | URL | Volume | Citation Opp | Complexity |
|---|---|---|---|---|
| 1 | `/fpl-chart-2026` | Very High | 10 | 2 |
| 2 | `/medicaid-income-limits-2026-by-state` | Very High | 9 | 4 |
| 3 | `/medicare-costs-2026` | High | 10 | 3 |
| 4 | `/cost/[procedure]-without-insurance` | Massive | 9 | 7 |
| 5 | `/medical-debt-statute-of-limitations` | High | 8 | 3 |
| 6 | `/medicare-savings-program-limits` | Medium | 8 | 3 |
| 7 | `/hospital-charity-care-laws-by-state` | Medium | 9 | 5 |
| 8 | `/cost-to-have-a-baby` | High | 7 | 4 |
| 9 | `/open-enrollment-dates` | High (Seasonal) | 8 | 2 |
| 10 | `/cpt-code-lookup` | Massive | 8 | 8 |
| 11 | `/medicare-part-d-penalty-calculator` | Medium | 7 | 5 |
| 12 | `/urgent-care-vs-er-cost` | High | 8 | 4 |
| 13 | `/no-surprises-act-dispute-timeline` | Low | 9 | 4 |
| 14 | `/chip-income-limits-by-state` | Medium | 8 | 3 |
| 15 | `/medicare-irmaa-brackets-2026` | Medium | 9 | 2 |

---

## Section B — Critical Flags

### B1. The CPT code lookup (Priority #10) is a legal landmine

Report recommends "/cpt-code-lookup — A massive programmatic database converting raw federal fee schedule data files into searchable, consumer-friendly pricing pages." **It does not mention AMA licensing.**

CPT codes are AMA-copyrighted. Commercial distribution of CPT code data (including code descriptors and full code lists) requires an AMA license. CMS public-use files carry explicit AMA notice. Listing 10K+ CPT codes on a programmatic site is precisely what gets you takedown letters from AMA legal. **Reject this priority, or massively rescope** to HCPCS Level II codes (public domain) or a curated handful of the top ~50 codes with fair-use cover.

### B2. The "two conversion factors" framing is misleading

Report leans on "$33.57 for qualifying APM, $33.40 for non-qualifying" as foundational for all procedure cost math (pp. 10, 22). In reality, the qualifying-APM bonus matters to providers' bonus payments, not to consumer out-of-pocket. **Use $33.40 as the standard non-facility consumer rate. Drop the dual-CF framing.**

### B3. Ranking is internally inconsistent

- **Priority #4 (procedure costs, "Massive" volume) should outrank #2 and #3** (both "Very High" / "High"). It's the only "Massive" entry. Penalized for complexity 7, yet #10 with complexity 8 ranks higher.
- **Priority #15 (IRMAA brackets) at rank 15 with Citation Opp 9 and Complexity 2 is a ranking error.** Should be top tier. The report itself names IRMAA as a frequent hallucination — that's the gap-to-exploit.
- **Priority #13 (No Surprises Act timeline)** has "Low" volume but ranks above #14, #15. Defensible only if you weight legal exposure / referral value.

### B4. Volume numbers are mostly hand-waved

Only 4 of 15 priorities have verifiable Semrush/Ahrefs numbers. The rest say "Very High / High / Medium / Low" with no figure. The report opened by promising it "excludes rows without verifiable search volumes" — then ranks #1 and #3 with no numbers. Treat all unsourced volume labels as estimates.

Long-tail volume column on pages 2-8 is ~80% "(N/A)". The few numbers cited come from WordStream — a free, often-stale list, not a live Ahrefs/Semrush pull.

### B5. Legal/regulatory risk on three priorities

- **#7 (Hospital charity care 501(r))** — Telling users they qualify for charity care creates implicit advice liability if state 501(r) rules are wrong.
- **#5 (Medical debt SOL)** — Statutory limitation advice borders on UPL (unauthorized practice of law) in some states if framed as "you can't be sued." Footnote sources are SoloSuit and PaidNice — marketing sites, not statute citations.
- **#13 (No Surprises Act dispute timeline)** — Report explicitly proposes "seamlessly integrated into the analyzer's output letter generation." Generating dispute letters is billing advocacy. Each of these needs attorney review before launch.

### B6. State-by-state data staleness is unaddressed

Three priorities depend on 50-state data (#2, #5, #7). State Medicaid thresholds update on no fixed schedule; some lag a year. State 501(r) charity care policies vary per-hospital. The report says "lastReviewed schema" — that doesn't help if the underlying number is stale. **No automated update mechanism is proposed.** This is the actual hard problem.

### B7. Major omissions from the procedure list

The report misses high-volume cost queries:
- "ER visit cost" / "emergency room cost without insurance" (very high volume; implied by #12 but no standalone)
- "Ambulance cost without insurance" (huge surprise-bill category)
- "Therapy cost without insurance" / "psychiatrist cost"
- "Dental cleaning cost" / "root canal cost without insurance"
- **"Out of pocket maximum explained"** and **"deductible vs copay"** definitional pages (massive top-of-funnel, perpetual evergreen volume)
- Drug-specific pages (insulin, epi-pen, specialty biologics — inpatient markup angle)
- Hospital-specific pages (chargemaster transparency data exists)

### B8. "Life insurance to build wealth" trigger is out of scope

p. 17 lists this as a Persona-Driven Vector with 1100% search spike. Nothing to do with eligibility screening or bill analysis. Cut.

### B9. KFF/GoodRx competitive read is naive

Report says KFF is "constrained, often locked in complex interactive elements which language models struggle to parse." KFF actually invests heavily in structured data and gets cited by Perplexity/ChatGPT regularly. KFF also has domain authority CoveredUSA can't match short-term. GoodRx is actively shipping LLM-friendly schema. The "translation layer" play is real but harder than the report makes it sound.

### B10. 89% AI-overview stat is sourced to a marketing-agency blog

Footnote 1 is upGrowth. Not a primary source. The 5% / 1-in-4 / 2M-per-week stats trace to OpenAI's official report (footnote 2) — those are solid. **Drop the 89% number from any internal/external comm.**

### B11. Hospital chargemaster claim ($150-250 urgent care) conflates "cash price" and "chargemaster"

These are very different numbers. Real chargemaster for level-3 urgent care visit (CPT 99213) is typically $200-400+ before any cash discount. The report uses them interchangeably on p. 2. Don't repeat this confusion on our pages.

### B12. Bing-first vs AI-citation-first not separated

The report discusses Perplexity, ChatGPT, Copilot, and Gemini interchangeably. Bing organic SERP strategy and AI citation strategy aren't identical (Bing still rewards exact-match keywords and backlinks more than Google; AI engines reward structured data and freshness). The roadmap is generic-AI-shaped, not Bing-shaped.

---

## Section C — Existing CoveredUSA Inventory Cross-Check

| # | Recommended URL | Status | Existing path | Gap |
|---|---|---|---|---|
| 1 | `/fpl-chart-2026` | PARTIAL | Calculations embedded in 2 hubs | No standalone FPL chart page |
| 2 | `/medicaid-income-limits-2026-by-state` | EXISTS — INCOMPLETE | `/medicaid-income-limits` | Only **15 states** in current STATES array. Needs all 50. |
| 3 | `/medicare-costs-2026` | NET-NEW | None | Existing `/medicare-eligibility` covers enrollment only, not costs |
| 4 | `/cost/[procedure]-without-insurance` | NET-NEW | — | Programmatic template doesn't exist |
| 5 | `/medical-debt-statute-of-limitations` | PARTIAL | Blog only | No hub page |
| 6 | `/medicare-savings-program-limits` | PARTIAL | Mentioned in `/medicare-eligibility` | No income table page |
| 7 | `/hospital-charity-care-laws-by-state` | PARTIAL | Logic in bill analyzer | No public reference page |
| 8 | `/cost-to-have-a-baby` | NET-NEW | None | Zero coverage |
| 9 | `/open-enrollment-dates` | PARTIAL | `/medicare-eligibility` covers AEP | No ACA marketplace open enrollment hub |
| 10 | `/cpt-code-lookup` | NET-NEW | — | **Reject — AMA legal risk** |
| 11 | `/medicare-part-d-penalty-calculator` | NET-NEW | None | — |
| 12 | `/urgent-care-vs-er-cost` | NET-NEW | None | — |
| 13 | `/no-surprises-act-dispute-timeline` | NET-NEW | None | **Legal risk on letter generation** |
| 14 | `/chip-income-limits-by-state` | NET-NEW | None | — |
| 15 | `/medicare-irmaa-brackets-2026` | NET-NEW | None | — |

**Other existing pages worth knowing:** `/aca-income-limits` (covers Obamacare 550K query reasonably well), `/screener`, `/medical-bill-analyzer`, `/results`. ~13 blog posts already cover overlapping topics — listed in agent output, not duplicated here.

---

## Section D — Recommended Page Build Order (My Ranking)

Reranked combining the report's roadmap, agent critical analysis, existing inventory, and engineering complexity from the [architecture scope doc](../PROGRAMMATIC_SEO_ARCHITECTURE.md).

### Tier 1 — Build first (next 2 weeks)

1. **`/fpl-chart-2026`** — Net-new. Complexity 2. Highest citation opportunity (10). Standalone FPL reference. Foundation for every other eligibility page. Build first.
2. **`/medicare-costs-2026`** — Net-new. Complexity 3. Citation opportunity 10. Centralizes Part A/B/D + IRMAA in one place. Fold #15 (IRMAA brackets) into this page; standalone IRMAA section with deep-link anchor.
3. **Augment `/medicaid-income-limits`** — Existing, but only 15 of 50 states. Expand to all 50, add Nursing Home Medicaid ($2,982/mo) row, add 2026 verified anchors. Not a new page — an in-place upgrade.
4. **`/cost/[procedure]` programmatic template + 5 procedure pages** — Net-new architecture. Per Agent 2 critique, this should arguably be #1 by raw volume. Start with: MRI, urgent care, colonoscopy, knee replacement, ER visit (which the report missed). Build template per the [architecture scope doc](../PROGRAMMATIC_SEO_ARCHITECTURE.md).
5. **`/cost-to-have-a-baby`** — Net-new. Zero existing coverage. High emotion, high intent, dual funnel (Medicaid pregnancy screener + bill analyzer for NICU bills).

### Tier 2 — Build next (weeks 3-4)

6. **`/medical-debt-statute-of-limitations`** — Hub upgrade from blog. **Frame as educational, not legal advice. Add disclaimer.** Cite primary state statutes, not SoloSuit.
7. **`/medicare-savings-program-limits`** — Net-new hub. QMB/SLMB/QI tables.
8. **`/chip-income-limits-by-state`** — Net-new. Cheap, completes the eligibility hub set.
9. **`/open-enrollment-dates-2026`** — Net-new. Seasonal Q4-Q1 traffic.
10. **`/out-of-pocket-maximum-explained` + `/deductible-vs-copay`** — Definitional pages the report missed. Massive top-funnel volume. Cheap to build.

### Tier 3 — Build with legal review or rescope (weeks 5-6)

11. **`/hospital-charity-care-laws-by-state`** — Has legal exposure. Need attorney to review framing before launch. Either ship as pure data aggregation ("here's what the law says") or wait.
12. **`/no-surprises-act-dispute-timeline`** — Rescope. Strip the "auto-generated dispute letter" feature. Educational page only. Link to analyzer for billing comparison but don't generate legal documents.

### Tier 4 — Procedure cost expansion (weeks 7+)

13. **Procedure pages 6-50** — Bariatric, primary care, ambulance, ER visit, therapy/psychiatry, dental procedures, gallbladder, hernia, hip replacement, ultrasound, CT, X-ray, mammogram, c-section, etc. Use the same template.

### Reject / Defer

- **`/cpt-code-lookup` (Report #10)** — Reject as scoped. AMA copyright risk. Replace with curated top-50 procedure codes baked into the procedure cost pages (descriptive use, not full code distribution).
- **`/medicare-part-d-penalty-calculator` (Report #11)** — Fold into `/medicare-costs-2026` as a section. Not worth standalone.

---

## Section E — Engineering Reality (vs Architecture Scope Doc)

The [architecture scope doc](../PROGRAMMATIC_SEO_ARCHITECTURE.md) covers most of what's needed. One material change based on this research:

- **Hub-page schema upgrade.** Existing hubs use `FAQPage` + `BreadcrumbList`. Report says winners use `MedicalWebPage` with `lastReviewed` + `reviewedBy` + nested `Dataset`. Add this to `src/lib/structured-data.ts` and apply to all new hubs + retrofit the 3 existing ones.
- **State-data freshness pipeline.** The doc treats data as hand-curated. For 50-state hubs (Medicaid, SOL, charity care, CHIP), we need a re-verification cadence. Suggest quarterly cron that re-pulls KFF Medicaid eligibility tables, IRS 501(r) updates, state SOL statutes. Out-of-date data on a definitive-hub page is worse than not shipping the page.
- **`MedicalProcedure` schema with `code` property is fine — but limit `code` to HCPCS Level II only** if AMA licensing isn't acquired. Don't emit full CPT code descriptors in JSON-LD without a license.

---

## Section F — Action Items

1. **Decide:** Acquire AMA CPT license (~$3K/yr+) or limit code emissions to HCPCS Level II + descriptive language? Locks the scope of procedure cost pages.
2. **Verify:** Re-confirm 2026 FPL family-of-4 figure ($33,000) against HHS ASPE PDF (footnote 22 in report), not the HealthCare.gov glossary.
3. **Verify:** Re-pull live Ahrefs/Semrush numbers for the 11 priorities without sourced volume before locking the build order.
4. **Legal:** Retainer attorney to review charity care, debt SOL, and dispute-timeline page copy before launch.
5. **Build sequence:** Start with `/fpl-chart-2026` (Tier 1.1) since it's the cheapest, highest-citation-opportunity, and unblocks the rest of the eligibility hubs.

---

*Compiled: 2026-05-12. Cross-references: [PROGRAMMATIC_SEO_ARCHITECTURE.md](../PROGRAMMATIC_SEO_ARCHITECTURE.md), [DEEP_RESEARCH_PROMPT_PROGRAMMATIC_SEO.md](../DEEP_RESEARCH_PROMPT_PROGRAMMATIC_SEO.md)*
