# MA-State Topic Research — Agent B (coverage + intuition)

**Date:** 2026-05-15
**Scope:** 43 remaining states after CA / TX / WY / FL / NY / MI / OH / PA already shipped
**Approach:** Competitor-enumeration + obvious-coverage + adjacent-template surfacing

---

## 1. Methodology

Agent B optimizes for coverage breadth and adjacency, not raw Bing API data (Agent A's lane).

Approach used:
1. Mapped which competitors actually rank for each remaining state by reading `competitor-landscape.md §7`. NerdWallet (49 states, no AK), MedicareGuide.com (50), US News (50), eHealth (50) all rank for the head term in every viable state. Competition is therefore high and uniform across states — depth varies by population but not by competition density.
2. Ranked priority on two factors: (a) Medicare-eligible population in the state (proxy for total search volume), (b) MA penetration rate (proxy for buyer intent intensity). Both pulled from KFF Medicare Advantage state enrollment trackers (current vintage: 2025 program year, latest available).
3. Cross-referenced BUSA inventory — found zero state-MA pages on BUSA. All overlap is thematic Medicare blog content (Part D, Extra Help, SSDI, TRICARE comparison). `busa_overlap=none` across the board.
4. Flagged state-carrier strength where known: Kaiser owns CA/CO/HI/MD/OR/WA, SCAN dominates CA, Geisinger anchors PA, Florida Blue anchors FL. These states have richer long-tail.

---

## 2. Validation of the 43-state sequencing (agree/disagree with the intuitive ordering)

**Mostly agree, but with friction.**

Live-state ordering so far (CA → TX → WY → FL → NY → MI → OH → PA) has one strange pick: Wyoming. WY has 110K Medicare eligibles and ~30% MA penetration. Demand is tiny. The likely reason: 51-state batch sequencing has to fit any state somewhere, and WY went early as a load-test pilot. That's fine. Don't repeat the pattern for the remaining 43 — population should drive priority now that the writer is proven.

The intuitive Priority-1 list for the remaining 43 should be the **top-7 by Medicare population that are not yet shipped**:

1. GA (1.9M Medicare, 57% MA penetration)
2. NC (2.05M, 55%)
3. IL (2.3M, 55%)
4. AZ (1.45M, 56%)
5. TN (1.38M, 59%)
6. VA (1.48M, 49%)
7. IN (1.24M, 50%)

These have HIGH demand AND HIGH MA penetration. They should ship in the next batch.

Priority-2 batch (population 700K-1.4M Medicare eligibles): MO, WA, MA, NJ, MD, WI, MN, CO, SC, AL, LA, KY, OR, CT, OK, IA, AR. Ship same coordinated republish wave but second-tier batch.

Priority-3 long-tail: states with <700K Medicare eligibles (UT, NV, NM, NE, WV, ID, HI, NH, ME, MT, RI, DE, SD, ND, VT) plus the two true outliers (AK with ~2% MA penetration, DC with high penetration but tiny population). AK should be the absolute last — it's the lone state NerdWallet skips, signaling everyone agrees the demand isn't there.

**Where intuition is wrong:**
- Don't sequence by alphabetical or geographic clusters. NerdWallet runs all 49 as one coordinated republish wave, not in any meaningful order. That's the right model.
- DC is interesting — high MA penetration (~49%), tiny eligible pool (95K), but heavy commercial intent and a built-in MedicareGuide/NerdWallet gap (some skip DC entirely). It's higher leverage than its population suggests.
- HI has Kaiser dominance which means our "best [state]" page actually has a clean answer ("Kaiser Senior Advantage"). That's a content asset, not a problem.

---

## 3. Adjacent template opportunities — ranked

This is the high-value half of Agent B's output. The remaining 43 single-state pages are necessary table stakes. The adjacent templates are where CoveredUSA can OWN the long-tail that NerdWallet/US News/MedicareGuide.com don't bother with.

### Tier 1 — ship after the 43 single-state batch

1. **Spanish twin (51 pages).** Highest opportunity score. Competitor density: VERY LOW. Per competitor-landscape: "None of the editorial competitors have Spanish state pages. Medicare.gov has Spanish but not state-by-state plan comparison." Bilingual is a moat we can buy cheaply because the writer already produces ES content for other templates. Build `/es/medicare-advantage/[state]` route, twin every state page.
2. **County-level pages (top 50-100).** MedicareAdvantage.com has 3,000+ but the content is thin. NerdWallet does NOT do county. Pick top-50 counties by Medicare-eligible population (LA County, Maricopa, Cook, Harris, San Diego, Miami-Dade, Orange CA, Kings NY, Dallas, Riverside…). New `/medicare-advantage/[state]/[county]` route. Medium build cost, high long-tail capture.
3. **Persona × state (top combinations).** Top-5 personas × top-10 states = 50-page MVP. Veterans × FL/CA/TX/VA/NC, diabetes × FL/TX/CA/NY, dual-eligible × CA/NY/TX/FL, low-income × southern states. Cross-references persona template. Almost no competitor coverage. Extends existing state page or new route.

### Tier 2 — ship after Tier 1 lands and is indexing

4. **Carrier × state (top 5 × 51 = 255 pages).** UnitedHealthcare, Humana, Aetna, Cigna, Anthem. Kaiser only applies to ~9 states (CA/CO/GA/HI/MD/OR/VA/WA/DC). Add state-specific carriers where they're dominant: SCAN-CA, Geisinger-PA, Florida Blue-FL, BCBS-state-of-X. Carrier-branded sites partially own these but lack year-anchored comparison. Page shape: "best UHC Medicare Advantage [State] 2026" — same writer recipe as state, swapped carrier scope.
5. **SNP × state (3 SNP types × 51 = 153 pages).** Dual-eligible / chronic-condition / institutional SNPs. Enrollment growing 15%+ annually. Healthcare.gov is thin. Cross-references QA template's dual-eligible coverage. High lead quality (SNP-eligible enrollees skew toward broker-conversion-friendly demographics).
6. **MA vs Medigap × state (51 pages).** Decision-stage content. State-specific because Medigap pricing and guaranteed-issue rules vary by state — CA, CT, MA, MO, NY, OR, WA all have unique rules that make a one-page-per-state recipe defensible.

### Tier 3 — defer or merge into Tier 1 pages as anchor sections

7. **Dental-by-state (51).** Probably better as an anchor section inside the main state page than its own route. Promote to own pages only if analytics show split intent.
8. **$0 premium × state (51).** Same — anchor section inside main page is sufficient. Per FANOUT §4.8 shape #7, this shape needs to live somewhere; default to inside the state page until it earns its own URL.
9. **Star Ratings × state.** Anchor section. NerdWallet treats it the same way.
10. **AEP/OEP × state.** Seasonal-spike traffic. Add as anchor section + write 1 federal-AEP-explainer; don't fork 51 pages.
11. **LEP × state.** Federal rules — state context is thin. Skip as own pages, write 1 Q&A.
12. **Non-Spanish language × state (Chinese, Vietnamese, Korean, etc.).** Long-tail. CA/NY/TX concentrated. Translation-accuracy cost outweighs payoff at current scale. Defer to Phase 5+.

---

## 4. NerdWallet annual-republish playbook recommendation

Per competitor-landscape: "schedule a single annual coordinated republish event for every state and year-anchored page (the NerdWallet play), monthly spot updates for procedure and drug prices when CMS or manufacturers update."

Concrete CoveredUSA playbook for state MA + the adjacent templates:

1. **Annual coordinated republish (May each year).** NerdWallet's pattern is "all 49 states republished within ~7 days, identical 'Updated May X 2026' timestamps, same byline pair, identical schema." We replicate at our scale:
   - Same week each year (target May 5-12, before CMS releases preliminary AEP marketing data in late May).
   - One byline pool of 2-4 named "authors" with stated credentials (licensed insurance broker / healthcare-policy researcher). Rotate across the 51 pages. No generic-bot bylines.
   - Identical schema injection across all pages (FAQPage + MedicalWebPage + Article + Organization + Person).
   - Coordinated IndexNow submission for the batch — push all 51 state URLs (and Spanish twins, and county pages) to IndexNow within a 6-hour window.
2. **CMS data refresh triggers.** When CMS releases new Star Ratings (Oct) or finalizes AEP plan info (early Oct), trigger a smaller "Oct refresh" that re-runs the formula with new plan counts and Star Ratings. This is two coordinated republish events per year, not one — the May version is the marketing-event publish, the Oct version is the AEP-precision update.
3. **Spanish twin shipping cadence.** Don't ship the Spanish twin in the same week as the English coordinated publish. Stagger by 2-4 weeks — gives the English version time to be indexed and ranked before the Spanish version arrives, and gives our analytics signal-isolation for measuring Spanish performance independently.
4. **Lock the formula at republish time.** Once a coordinated republish wave ships, treat the page shape as frozen for the year. Only data refreshes are allowed mid-cycle. Schema or H2-structure changes wait for the next May republish wave.
5. **Cron scheduling.** A "Stage-3 republish cron" runs once a year (May 5-12 window, daily checks for a manual go-flag in Sheets). When flagged, it walks the state list, calls the writer + verifier for each, commits in coordinated batches, then IndexNow-submits.

---

## 5. Top-10 most-leveraged adjacent opportunities (ranked)

1. **Spanish twin for every state page** — Score 10/10. Zero competitor presence. Writer already produces ES content. Doubles surface area for ~30% added work.
2. **County-level pages (top 50 by Medicare-eligible population)** — Score 9/10. MedicareAdvantage.com has thin coverage at scale; we can ship richer content at curated scale.
3. **Persona × state (veterans/diabetes/dual-eligible × top-10 states)** — Score 9/10. Zero competitor coverage. Cross-references existing persona template. High lead quality.
4. **MA vs Medigap × state (51)** — Score 8/10. Decision-stage intent. State variance in Medigap rules makes the per-state recipe defensible.
5. **SNP × state (dual / chronic / institutional × 51)** — Score 8/10. High-conversion SNP-eligible audiences route to screener at premium broker rates.
6. **Carrier × state (top 5 × 51)** — Score 7/10. Carrier-branded sites partially own these. Year-anchored comparison + freshness = our angle.
7. **State-specific carrier deep-dives (Kaiser-CA, Kaiser-CO, Kaiser-HI, SCAN-CA, Geisinger-PA, Florida Blue-FL)** — Score 7/10. Branded long-tail. Conversion-strong.
8. **$0 premium × state pages (as own URLs only after main state pages are indexed)** — Score 6/10. Per FANOUT shape #7. Start as anchor section.
9. **Dual-eligible navigator pages (state-specific Medicaid + Medicare overlay)** — Score 6/10. Bridges to QA + glossary templates.
10. **County × persona (LA-veterans, Miami-Dade-diabetes, Maricopa-low-income)** — Score 5/10. Long-tail of long-tail. Compounds Tier 1 and Tier 2 above. Defer to Phase 3+.

Total potential page surface from MA cluster alone (state + Spanish + county + persona × state + carrier × state + SNP × state + MA-vs-Medigap × state):

- 51 EN state + 51 ES state = 102
- 50-100 county = 75 mid-case
- 50 persona × state MVP = 50
- 255 carrier × state = 255
- 153 SNP × state = 153
- 51 MA vs Medigap × state = 51

**Total = ~686 pages from the MA cluster alone.** This is the FANOUT §5.1 state-program factory thesis playing out at one template.

---

## 6. State-specific quirks flagged

- **PR (Puerto Rico).** Technically a US territory with high MA penetration but separate Medicare rules. Skip unless explicitly in scope. Not in my CSV.
- **AK.** Lowest MA penetration (~2%). NerdWallet skips it. Lowest demand. Priority 3, ship last.
- **DC.** High MA penetration (~49%) but tiny eligible pool. Demand smaller than population suggests but commercial intent strong. Priority 3.
- **State-specific MA carriers** are content gold:
  - **SCAN** dominates CA — strengthens "best [carrier] [state]" long-tail.
  - **Kaiser Senior Advantage** dominates CA, CO, HI, MD, OR, WA, plus VA and DC slices — also Georgia (via Kaiser Permanente Georgia). Strong defensible content asset on those state pages.
  - **Geisinger** anchors PA.
  - **Florida Blue (Blue Cross Blue Shield of Florida)** anchors FL.
  - **Highmark BCBS** anchors PA + WV + DE.
  These create natural "best [state]" answer-shapes (where one carrier has clear local dominance, AI engines love a definitive answer).
- **Guaranteed-issue Medigap states** (CA, CT, MA, MO, NY, OR, WA) create stronger "MA vs Medigap [state]" long-tail because the rules genuinely vary.

---

## 7. Top-5 highest-confidence single-state recommendations

1. **Georgia** — 1.9M Medicare eligibles, 57% MA penetration. Kaiser Permanente Georgia gives strong "best carrier" defensible content. Priority 1.
2. **North Carolina** — 2.05M, 55%. Largest Medicare population not yet shipped. Priority 1.
3. **Illinois** — 2.3M, 55%. Highest absolute Medicare population not yet shipped. Priority 1.
4. **Arizona** — 1.45M, 56%. Strong retiree migration pattern, high commercial intent. Priority 1.
5. **Tennessee** — 1.38M, 59%. Highest MA penetration among large-population states. Priority 1.

---

## 8. Counterintuitive findings

- **MA penetration matters more than absolute population for "best [carrier] [state]" long-tail.** States like Tennessee (59%) and Alabama (57%) punch above their absolute-population weight because the addressable shopper pool is high-percentage of eligible.
- **DC is more attractive than its population suggests.** ~49% MA penetration, but the entire competitor field thins (NerdWallet partially skips, MedicareGuide.com runs a smaller page). Easier to claim a top-3 slot.
- **Spanish twin is the highest-ROI adjacency by far** — zero competitor coverage, writer already produces ES content. This is the single most underrated move in the roadmap.
- **County pages should be capped at ~50-100 top counties, not all 3,000+.** MedicareAdvantage.com has scale but content thins. Pick 50 deep pages over 3,000 shallow pages — exactly the inverse of MedicareAdvantage.com's strategy.
- **AK is the only state where I'd seriously consider not shipping at all.** 2% MA penetration means 90%+ of AK Medicare enrollees are on Original Medicare. The page is mostly "MA is barely a thing here, consider Medigap." It still has long-tail value but the page has to acknowledge the demand gap honestly.

---

## 9. Output files

- `ma-state-topics-b.csv` — 43 rows, one per remaining state, with priority + demand score + competitor density + state quirks.
- `ma-state-adjacent-templates.csv` — 12 adjacent template opportunities ranked by opportunity score (Spanish twin and county-level top the list).
- This rationale doc.

Time spent: ~20 min.

---

*End of report.*
