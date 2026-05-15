# MA-State Topic List — Adversarial Critique

**Date:** 2026-05-15
**Critic:** Frank
**Inputs:** `ma-state-topics-a.csv` (43), `ma-state-topics-b.csv` (43), `ma-state-adjacent-templates.csv` (12), both rationale docs
**External validation:** KFF 2026 MA Spotlight; CMS State/County Penetration (May 2026 lookup)

---

## 1. Verdict (read this first)

A and B converge on 8 of 10 Tier-1 picks. Their data is broadly consistent with CMS 2024 + KFF 2025 enrollment files. **No major structural error.** Two adjudications + one bigger miss below. Confidence: HIGH (~85%) that the corrected sequencing is right.

---

## 2. Final recommended 43-state sequencing

### Tier 1 (priority=1, 10 states — ship in coordinated batch)

| # | State | Medicare elig. | MA pen. | Spanish? | Why |
|---|---|---|---|---|---|
| 1 | Georgia | 1.75M | 55% | partial (Atlanta) | Top MA shopper pool not yet shipped + Kaiser-GA defensible answer |
| 2 | North Carolina | 2.05M | 55% | n | Largest total enrollment among remaining |
| 3 | Illinois | 2.05–2.3M | 41–55% (sources diverge — use KFF 2025 number on publish) | y (Chicago) | Highest absolute pop + Spanish twin |
| 4 | Arizona | 1.45M | 55% | y (strong) | Double-count via Spanish AI-citation surface |
| 5 | Tennessee | 1.34M | 59% | n | Highest penetration among remaining |
| 6 | Virginia | 1.5M | 43–49% | n | DC-metro adjacency |
| 7 | New Jersey | 1.55M | 46–49% | y | Largest non-done Northeast |
| 8 | Indiana | 1.32M | 46–50% | n | **Adjudication win — see §3.1** |
| 9 | Massachusetts | 1.3M | 40–46% | n | Big absolute pool, lower penetration |
| 10 | Washington | 1.42M | 42–49% | n | Pacific NW pair |

### Tier 2 (priority=2, 12 states)

OR, MO, WI, MN, CO (Spanish bonus), MD, SC, AL, LA, KY, CT, AR

(OR moves down to Tier 2 — see §3.2. CO promoted into Tier 2 head for Spanish.)

### Tier 3 (priority=3, 21 states)

NV, IA, OK, UT, NM (Spanish), MS, ID, NH, ME, RI, MT, DE, WV, HI, NE, KS, DC, ND, SD, VT, AK

VT + AK ship dead-last (KFF 2026: VT 1 plan available, AK 0 plans — these pages are mostly "MA barely exists here, consider Medigap"; ship them, but for citation surface, not conversion).

---

## 3. A vs B adjudications

### 3.1 Indiana vs Massachusetts/NJ/WA/OR for Tier 1 — **B wins on IN, but A is right that MA/NJ/WA all belong**

B's Priority-1 includes IN, drops MA/NJ/WA/OR. A's Tier 1 includes MA/NJ/WA/OR, drops IN.

**Adjudication:** Include IN AND MA/NJ/WA. Drop OR to Tier 2.

Reasoning: IN (1.32M × 50%) yields ~660K MA shoppers — more than OR (830K × 55% = 460K). B is correct that IN is being undervalued by A; A's penetration estimate for IN (46%) is low — KFF 2025 has IN closer to 50%. OR is genuinely smaller-pool and pairs cleanly with WA in a Pacific-NW Tier 2 batch.

### 3.2 Penetration disputes (A vs B differ on actual %)

| State | A | B | Use |
|---|---|---|---|
| GA | 55% | 57% | 55% (CMS 2024 verified; B's 57% is 2025 projection) |
| IL | 41% | 55% | Mid-publish, query CMS State/County Penetration file directly. **A's 41% looks stale — KFF 2024 has IL at ~50%.** Use 50%. |
| MA | 40% | 46% | 46% (B has more current source) |
| NJ | 49% | 46% | 46% (B has more current source) |
| IN | 46% | 50% | 50% (B) |
| WA | 42% | 49% | 49% (B) |
| OR | 55% | 53% | 53% (B) |
| AL | 55% | 57% | 57% (B) |
| TN | 59% | 59% | 59% (agreement) |

**Pattern:** A used 2024 reference; B used 2025 vintage. **B's penetration numbers are more current — use B's on publish.** A's enrollment totals are slightly more conservative and probably more trustworthy. Merge: B's penetration × A's enrollment.

---

## 4. DC and Puerto Rico

### 4.1 DC — ship as 51st page, low priority

DC has ~90-95K Medicare eligibles and ~40-49% MA penetration depending on vintage. Tiny population, but:
- Competitor-density genuinely drops (NerdWallet sometimes skips, MedicareGuide thin)
- 100% urban Medicare population with strong commercial intent
- Bing AI-citation upside in DC-localized grounding queries with weaker competitor pages

**Verdict:** Ship DC. Tier 3, late. Don't fold into MD or VA — that's the competitor pattern, and breaking it is a (small) differentiation move.

### 4.2 Puerto Rico — **skip, but flag**

Both researchers correctly excluded PR. CMS Medicare in PR has different rules: no Part B premium subsidization parity, separate MA plan filings, ~70% MA penetration (highest in the country), Spanish-first audience. **It's high-demand and zero-competitor (NerdWallet/US News don't cover PR).**

**Verdict:** Out of scope for the 51-state template. But surface to Jacob as a **standalone single-page opportunity** worth ~$30 of writer time. The page sits at `/medicare-advantage/puerto-rico` (or `/es/medicare-advantage/puerto-rico`) and is functionally a "territory edge case" page. Not part of the 51-state batch; not part of the Spanish twin track. Standalone.

Neither A nor B flagged USVI/Guam/American Samoa/CNMI — those have Medicare-eligible but tiny populations. Skip permanently.

---

## 5. Adjacent templates — ranked by ROI (top to bottom)

Both researchers correctly identified Spanish twin as #1. My ranking diverges from B on county vs persona×state ordering:

### Tier 1 (ship after the 43 single-state batch lands and indexes — ~3 months out)

1. **Spanish twin (51 pages).** Confirmed #1. Zero competitor coverage. Writer already produces ES. ROI: 10/10. Stagger 2-4 weeks after EN coordinated republish per B §4.
2. **Persona × state MVP (50 pages: top-5 personas × top-10 states).** Promoted above county. Higher lead quality (SNP-eligible + veteran + diabetes audiences route to broker at premium rates). Almost no competitor coverage. Cross-references existing persona template — reuses writer recipe with state overlay.
3. **County-level (top 50, not 3,000).** B's curated-50 approach beats MedicareAdvantage.com's scale-thin model. Defer behind persona×state because lead quality is lower (county pages skew informational).

### Tier 2 (Q4 2026 / Q1 2027)

4. **SNP × state (top 30 — high-D-SNP states only, not full 153).** Trim B's full 153-page build. D-SNP enrollment is heavily concentrated in 20-30 states. Skip institutional-SNP-by-state (federal rules, state context thin) — write 1 federal explainer + anchor sections.
5. **MA vs Medigap × state — but ONLY the 7 guaranteed-issue states first** (CA, CT, MA, MO, NY, OR, WA). Those 7 have genuinely state-specific rules. The other 44 are federal-rule rehashes — anchor sections in main state page suffice.
6. **Carrier × state (top 3 carriers × top 20 states = 60 pages, not 255).** Trim B/A's full 255-page build. UHC/Humana/Aetna are the only carriers with broad enough multi-state presence to justify per-state pages. Kaiser-state (9 states) is a separate side-quest.

### Tier 3 / skip

7. **Star Ratings, $0 premium, AEP, Dental, LEP by state** — anchor sections inside the main state page. Don't fork URLs. Both researchers agree; I agree.
8. **Non-Spanish language pages** — defer indefinitely. Translation accuracy cost not justified at current scale.
9. **County × persona (LA-veterans, etc.)** — defer to Phase 4+. Compounds Tier 1+2 above; build only after we see indexing data.

**Trimmed page-count projection from MA cluster:**
- 51 EN state + 51 ES state = 102
- 50 persona × state MVP = 50
- 50 county = 50
- 30 D-SNP × state = 30
- 7 MA-vs-Medigap × guaranteed-issue-state = 7
- 60 carrier × state = 60

**Total: ~300 pages** (vs B's 686). Better lead quality per page. Easier to maintain at annual republish.

---

## 6. Annual coordinated republish playbook — **recommend WITH modifications**

B's NerdWallet-style coordinated May republish is the right model, BUT it conflicts with Jacob's drip-publish strategy (he's specifically building drip infra to AVOID publishing spikes).

### Reconciliation

The conflict is illusory. Drip-publish is about **initial publish** of new content; coordinated republish is about **refresh** of already-indexed content. Different operations, different SEO signals.

- **Initial 43-state publish:** USE DRIP. 2-3 states/day across ~3 weeks. Avoids Bing/Google penalty for sudden 43-page injection from a low-DR site.
- **Annual coordinated republish (May each year, starting 2027):** USE COORDINATED. All 51 state pages get refresh + new `"Updated May X 2027"` timestamp + IndexNow push within a 7-day window. This IS the NerdWallet pattern and IS the right model for refresh.
- **Oct AEP refresh:** Smaller coordinated push. Star Ratings + plan counts updated. Same 7-day window.

**Net recommendation:** Adopt B's annual coordinated republish framework, but ONLY for the recurring refresh — not the initial 43-state shipping. Initial publish stays on the drip cron. Two distinct cron jobs.

---

## 7. Bing volume gap — alternatives

Both noted Bing API can't slice MA volume by state. Confirmed accurate. Alternatives:

1. **CMS State/County Penetration file** (https://www.cms.gov/data-research/statistics-trends-and-reports/medicare-advantagepart-d-contract-and-enrollment-data/ma-state/county-penetration) — actual enrollment counts per state, refreshed monthly. **This is the canonical demand proxy.** Both researchers should have linked this; A cites it loosely, B doesn't.
2. **KFF State Health Facts** (https://www.kff.org/medicare/state-indicator/total-enrollment-by-plan-type/) — state-by-state MA enrollment, regularly updated.
3. **KFF 2026 Spotlight** (https://www.kff.org/medicare/medicare-advantage-2026-spotlight-a-first-look-at-plan-offerings/) — 2026 plan counts per state. Use to validate the "plan availability" narrative in each state page.
4. **Google Trends (state breakdown)** — search "medicare advantage" with state-region filter. Free, gives relative interest by state. Not absolute volume but a tiebreaker.
5. **Bing GetQueryStats once pages rank** — the recursive method per HANDOFF.md §3. After Tier 1 ships, query our own state page Bing impressions to calibrate Tier 2 sequencing.

**Recommended:** Pull CMS State/County Penetration CSV directly at next publish wave. It's the closest thing to state-level demand we'll get without per-page rank data.

---

## 8. Other findings (didn't change sequencing but worth noting)

1. **A's `demand_score` formula is opaque.** It mixes Bing weekly impressions, Google monthly volume, and a multiplier. The scale is inconsistent across rows (some rows score 9200, others 1100, with no clear linear relationship to underlying enrollment × penetration). Replace with `medicare_enrollment × ma_penetration` directly — it's a cleaner proxy.
2. **B's `demand_score` is a 1-10 scale**, which is human-readable but loses precision. Either is fine; just be consistent.
3. **Neither flagged the 2026 KFF "fewer-than-5-plans" states** (AK 0, VT 1, WY 3 — but WY's already done, SD 4). These pages have a unique narrative shape ("plan availability is so thin here, your options are X carrier + Original Medicare + Medigap"). Worth noting in the writer prompt as a state-quirk handler.
4. **Florida Blue, Highmark, Geisinger** — B flagged state-specific carriers, A did not. B's right; these create defensible "best [state]" answer-shapes. Bake into the writer prompt as state-specific carrier facts.

---

## 9. What to do next

1. **Lock the Tier 1 batch of 10** (GA, NC, IL, AZ, TN, VA, NJ, IN, MA, WA) — write coordinated batch starting now, drip-publish 2-3/day.
2. **Use B's penetration numbers × A's enrollment totals** when populating each page's stat callouts.
3. **Ship DC at end of Tier 3.** Skip PR/territories from the 51-state template; surface PR to Jacob as a standalone-page side quest.
4. **Spanish twin = #1 adjacent template.** Persona × state MVP = #2. County = #3.
5. **Pull CMS State/County Penetration CSV** before each major batch — that's the canonical state-demand proxy this template can rely on.
6. **Adopt annual coordinated republish (May + Oct) as separate cron from drip-publish.** Drip handles initial publish; coordinated handles refresh.

---

*End of critique.*
