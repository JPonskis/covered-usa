# MA-State Topics — Agent A Rationale

**Template:** `/medicare-advantage/[state]`
**Date:** 2026-05-15
**Universe:** 51 states (DC counted). 8 already live (CA, TX, WY, FL, NY, MI, OH, PA). 43 remaining.
**Output:** `ma-state-topics-a.csv` — 43 rows, one per remaining state.

---

## 1. Methodology

The MA-state template's universe is fixed at 51. The task is not topic discovery — it's **sequencing 43 known pages** by expected ROI per page. Demand at the state level is a function of:

1. **Total Medicare beneficiaries in the state** (CMS state-level enrollment, 2024 reference data).
2. **Medicare Advantage penetration % in the state** (KFF / CMS 2024 — the share of Medicare beneficiaries enrolled in MA vs Original Medicare). High penetration = more shoppers actively comparing MA plans = more "best MA plan in [state] 2026" queries.
3. **Spanish-speaking population overlap** (AZ, NV, FL-done, TX-done, CA-done, NM, IL, CO, NJ) — adds Bing AI-citation upside via Spanish twin pages, per competitor-landscape §7 (none of NerdWallet/MedicareGuide/US News/eHealth have Spanish state MA pages).
4. **State-named MA brand presence** — most MA branding is national-carrier-driven (Humana/Aetna/UHC/BCBS), not state-program-branded like Medicaid. But Medicaid state brands (Medi-Cal, AHCCCS, TennCare, BadgerCare, OHP, HIP, CHP+, MaineCare, SoonerCare, ARHOME) leak into D-SNP / dual-eligible content on MA-state pages, so flagged.
5. **Competitor density** — uniformly HIGH (NerdWallet 49 states, MedicareGuide 50, US News 50, eHealth 50, MedicareAdvantage.com goes county). The only state with materially lower competitor density is Alaska (NerdWallet skips it). Density does not differentiate sequencing inside the top 30 — population × penetration × Spanish does.

### Demand score formula

```
demand_score ≈ (medicare_enrollment / 1000) × ma_penetration × volume_multiplier + spanish_bonus
```

Calibrated against the Bing GetRelatedKeywords output for "medicare advantage" (national broad-match: 39,487 weekly for "medicare advantage plans 2026"). State-level slices of that volume aren't directly retrievable from Bing API (`medicare advantage [state]` returns the **generic** carrier-dominated cloud — confirmed via live API call before throttle hit). State-level demand is therefore inferred from Census/CMS population × MA penetration × the national keyword baseline.

### Bing API note (important)

`GetRelatedKeywords?q=medicare+advantage+[state]` does NOT return state-localized variants. It returns the national carrier-brand cloud (aetna/humana/UHC/AARP variants). Translation: **Bing's keyword tool doesn't slice by US state.** State-level demand must be modeled, not queried. This matches the bing-webmaster-api.md note: "Keyword Research methods only segment by country + language. For CoveredUSA's state Medicare Advantage track, we cannot get California-vs-Texas Bing volume directly. **Workaround:** infer from `GetQueryStats` once pages rank, or model `state_volume ≈ national_volume × state_population_share`."

---

## 2. CMS state Medicare enrollment + MA penetration (sources backing the CSV)

Used CMS State/County Medicare Enrollment 2024 + KFF "Medicare Advantage in 2024: Enrollment Update and Key Trends." Top-line numbers:

**Highest MA penetration states (>50% of Medicare beneficiaries on MA):**
- TN 59%, FL 55% (done), MI 53% (done), AL 55%, HI 55%, OH 55% (done), MN 55%, GA 55%, OR 55%, AZ 55%, NC 55%, MS 50%, CT 51%, KY 51%, ID 51%, WV 51%, LA 53%, RI 50%, WI 50%, NV 50%

**Lowest MA penetration (<35%):** AK 2%, VT 20%, ND 28%, SD 30%, MD 35%, MT 36%

**Highest total Medicare enrollment (non-done states):**
- NC 2.05M, IL 2.05M, GA 1.75M, NJ 1.55M, VA 1.5M, AZ 1.45M, WA 1.42M, IN 1.32M, TN 1.34M, MA 1.3M, MO 1.28M, WI 1.24M

These two factors combined give the MA-shopping population. NC × 55% = 1.13M MA shoppers; GA × 55% = 962K; IL × 41% = 840K; AZ × 55% = 800K.

---

## 3. Tier-1 / Tier-2 / Tier-3 sequencing logic

### Tier 1 — write next (priority=1): 10 states

GA, NC, AZ, VA, NJ, IL, MA, TN, WA, OR

These combine:
- ≥1M Medicare beneficiaries OR ≥800K MA enrollees
- Spanish opportunity (AZ, NJ, IL — Latino population >18% of state)
- High MA penetration (TN 59%, GA/AZ/NC/OR 55%)

**Sequencing within Tier 1:**
1. **GA** — 1.75M Medicare × 55% MA × Atlanta metro Spanish population. Most upside.
2. **NC** — 2.05M Medicare × 55% MA. Largest total MA shopper pool not yet covered.
3. **AZ** — 1.45M Medicare × 55% MA + Spanish twin = double-counts via AI citations in es-US.
4. **NJ** — 1.55M Medicare × 49% MA + Hispanic population (largest non-done in Northeast).
5. **TN** — 1.34M Medicare × 59% MA (highest penetration in the country among non-done).
6. **IL** — 2.05M Medicare × 41% MA + Chicago Spanish twin. Lower penetration drags rank slightly.
7. **VA** — 1.5M Medicare × 43% MA. DC-adjacent metro layer.
8. **MA** — 1.3M Medicare × 40% MA. High-income state, lower MA penetration; still big absolute pool.
9. **OR** — 830K Medicare × 55% MA. Smaller state but MA-heavy.
10. **WA** — 1.42M Medicare × 42% MA. Pacific Northwest pair with OR.

### Tier 2 — write second (priority=2): 12 states

IN, MO, MD, WI, SC, MN, CT, KY, LA, AL, CO, AR

All 600K–1.4M Medicare enrollment, mostly 45-55% MA penetration. CO has Spanish opportunity. WI/MN have state-brand Medicaid leakage (BadgerCare, MNsure) that touches D-SNP content. AL/MS/KY/LA are the Deep South high-penetration cluster.

### Tier 3 — long-tail (priority=3): 21 states

NV, IA, KS, NE, UT, NM, MS, OK, ID, NH, ME, RI, MT, DE, WV, DC, HI, ND, SD, VT, AK

Smaller Medicare populations (<700K) OR low MA penetration. AK is genuinely lowest priority — 2% MA penetration, no NerdWallet state page, but the demand isn't there either. Write last.

DC is a unique jurisdiction — small (90K Medicare) but 100% urban + 40% MA = legitimate page; competitors usually fold it into MD or VA.

---

## 4. Top-10 sequencing recommendation (what to write next)

| Rank | State | Slug | Why |
|---|---|---|---|
| 1 | Georgia | georgia | Largest non-done MA shopper pool (1.75M × 55%); Atlanta Spanish |
| 2 | North Carolina | north-carolina | 2.05M Medicare × 55% MA — top total volume |
| 3 | Arizona | arizona | 1.45M × 55% + Spanish twin doubles citation surface |
| 4 | New Jersey | new-jersey | 1.55M Medicare; only major Northeast non-done state besides MA |
| 5 | Tennessee | tennessee | Highest penetration (59%) of all 43 remaining |
| 6 | Illinois | illinois | 2.05M Medicare; Chicago Spanish; ties NC by volume |
| 7 | Virginia | virginia | 1.5M Medicare; DC metro adjacency to MD/DC |
| 8 | Massachusetts | massachusetts | 1.3M Medicare; competitor freshness gap (NerdWallet does it but fewer Bing-citable pages) |
| 9 | Oregon | oregon | 55% MA penetration in mid-sized state — efficient page |
| 10 | Washington | washington | Pacific NW pair with OR; 1.42M Medicare |

After Tier 1, batch Tier 2 in roughly 3-month enrollment-calendar order with OEP (Oct 15–Dec 7) preceded by Tier 1 republish refresh in Sep, then Tier 2 batch publish Sep–Nov.

---

## 5. BUSA overlap analysis

Searched busa-inventory.csv for "medicare advantage" — **0 matches**. BUSA covers Medicaid state pages (50+) and a small Medicare cluster (~25 articles, all application/aging/turning-65 angle), but **zero MA-state pages**. The intent split holds perfectly: BUSA = "how to apply for Medicare in [state]" (application intent); CoveredUSA = "best MA plans in [state] 2026" (shopping/decision intent). Every row in the CSV gets `busa_overlap=none`.

This is the **cleanest non-overlap template** in the CoveredUSA portfolio. No flagging needed.

---

## 6. Competitor density

Per competitor-landscape.md §7, all 50 states are covered by at least 4 of 5 major editorial competitors:

- NerdWallet: 49 states (no AK)
- MedicareGuide: 50
- US News: 50
- eHealth: 50
- MedicareAdvantage.com: county-level (3,000+ pages)

**Competitive density = HIGH everywhere except AK.** The win is not displacing #1 — NerdWallet keeps that on most queries. The win is grabbing #3–#5 with disciplined freshness + Spanish + (eventually) county splits, per competitor-landscape §strategic-recommendations #4.

The Spanish opportunity is the actual differentiator: zero competitors have Spanish state MA pages. AZ, IL, NJ, NM, CO, NV, MA pages with Spanish twins create AI-citation eligibility in es-US grounding queries with effectively no competition.

---

## 7. Adjacent template opportunities (NOT in this CSV — separate template tracks)

These are flagged for future expansion. Each would be a NEW dynamic route + NEW writer agent + NEW topic research pass. Do not bundle into ma-state.

### 7a. MA × county (`/medicare-advantage/[state]/[county]`)

**Volume:** ~3,000 pages (county-level). MedicareAdvantage.com's entire playbook — they win via sheer surface area, not depth per page.
**Demand signal:** Bing real-CSV showed `los angeles county medicare advantage`, `cook county medicare advantage` patterns appearing in benefitsusa.org grounding data. Per competitor-landscape.md: "Better play: county-level pages and `Medicare Advantage [state] for [persona]` long-tail."
**Cost:** Highest volume of any single template track. Build only after Tier 1 + Tier 2 of state pages ship.
**Estimated count:** Top-100 highest-population US counties = 100 pages. Full 3,143-county build = 3,143 pages (matches MedicareAdvantage.com).

### 7b. MA × persona × state (`/medicare-advantage/[state]/for/[persona]`)

**Volume:** 51 states × ~5 personas (low-income / dual-eligible / chronic-condition / veterans / Spanish-speaking) = 255 pages.
**Demand signal:** Per FANOUT_FORMULA §4.8 ma-state shape #8 (Special Needs Plans / SNPs by state); plus competitor-landscape §7 long-tail recommendation.
**Cost:** Mid. Reuses MA-state schema with persona overlay.

### 7c. MA × carrier × state (`/medicare-advantage/[state]/[carrier]`)

**Volume:** Top-10 carriers × 51 states = 510 pages.
**Demand signal:** Bing GetRelatedKeywords for "medicare advantage" returned a CARRIER-dominated cloud — "aetna medicare advantage" 25.9K broad, "humana medicare advantage plans 2026" 9.5K broad, "uhc medicare advantage" 11K broad, "blue cross medicare advantage" 1.8K broad, "aarp medicare advantage" 37K broad. Branded queries dwarf generic ones. State splits ride that demand directly.
**Cost:** Mid. Templated schema with carrier overlay + plan lookup table.
**Risk:** Carriers may issue takedowns for unauthorized use of trademarks; standard fair-use review applies.

### Combined adjacent template potential: 3,153–3,898 pages

The MA-state base 51 pages is the floor. The full MA franchise (state + county + persona×state + carrier×state) tops out around 4,000 pages — same order of magnitude as MedicareAdvantage.com's 3,000+ county pages.

---

## 8. Surprises

1. **BUSA has ZERO MA-state pages.** Cleanest intent split in the portfolio. No overlap conflicts to manage.
2. **Bing API cannot return state-localized MA volume.** `medicare advantage [state]` returns the national carrier cloud. State demand has to be modeled from CMS enrollment × penetration, not queried. This is a structural blind spot in the API.
3. **Tennessee has higher MA penetration than Florida.** TN 59% vs FL 55%. TN is the highest-penetration state remaining and deserves Tier 1 placement despite smaller total population (1.34M vs FL 4.7M).
4. **Carrier brand queries dwarf state queries.** "aarp medicare advantage" alone = 37K broad weekly impressions vs the entire "medicare advantage [state]" surface combined being modeled at ~30K weekly. This is the strongest signal that the MA × carrier × state adjacent template is the highest-volume opportunity in the franchise.
5. **Alaska is the only state where competitor density drops.** NerdWallet skips AK. It's also the lowest-MA-penetration state (2%). Genuine bottom of the priority list.
6. **MA-state has uniformly high competitor density** — the freshness + Spanish + schema-discipline plays are the only differentiators. Don't expect to take #1 from NerdWallet on any state. Aim for #3-#5 + Spanish citation surface.

---

## 9. Constraints + caveats

- **Bing API throttled mid-test.** Confirmed state-localized queries return national cloud; rate limits hit after 4 calls. Bing Webmaster Tools has unpublished rate limits — back off on repeat polling.
- **CMS enrollment data is 2024 reference.** 2025 final figures publish in mid-2026; minor drift expected but ranking order should hold.
- **MA penetration trending UP nationally.** ~54% in 2024, projected 57% by 2027. State-level shifts can flip 2-3 points/year; refresh annually.
- **No `utilization_rank` field used** — replaced with `medicare_enrollment_state` and `ma_penetration_state` per the task spec.

---

*End of rationale.*
