# Programmatic SEO Architecture — CoveredUSA

Scope doc for the data-driven product-page layer (Tier 1 of the SEO strategy). Drafted before deep research lands so we can ship same-day when the keyword/data tables arrive.

**Optimizing for:** Bing organic + AI search citation (ChatGPT, Perplexity, Copilot, Gemini AI Mode). Not Google-first.

**Out of scope of this doc:** which procedures/hubs to build (deep research output decides), hospital pages, drug pages, billing code library, Spanish translation (mirror English first, translate later).

---

## 1. What already exists (do not rebuild)

Three live data hubs share an architecture we should reuse:

- `/[locale]/medicaid-income-limits` ([page.tsx](src/app/[locale]/medicaid-income-limits/page.tsx), 331 lines)
- `/[locale]/aca-income-limits` (326 lines)
- `/[locale]/medicare-eligibility` (346 lines)

**Pattern:** Hardcoded data constants at top of `page.tsx`, FPL math inline, hero section, household-size table, state table, FAQ list, FAQ + Breadcrumb JSON-LD. i18n via `setRequestLocale` + `isEs` branches.

**Existing schema helpers** in [src/lib/structured-data.ts](src/lib/structured-data.ts):
- `getFAQSchema(faqs)` → `FAQPage`
- `getBreadcrumbSchema(items)` → `BreadcrumbList`
- `getSpeakableSchema(url, selectors)` → `WebPage` + `SpeakableSpecification`
- `getWebApplicationSchema()` → array of 2 `WebApplication` entries (screener + analyzer)
- `getHowToSchema(locale)` → `HowTo`
- `getMedicalOrganizationSchema()` → `Organization`

**Sitemap** ([src/app/sitemap.ts](src/app/sitemap.ts)) is hand-maintained via `localizedEntry()` helper. Adding programmatic entries = `.map()` over a data file.

**IndexNow** ([scripts/coveredusa-indexnow-submit.js](../../scripts/coveredusa-indexnow-submit.js)) only auto-detects today's blog posts. Needs extension to handle product pages.

**Key constraint:** None of the existing data hubs use external data files. They hardcode constants. Procedure cost pages will be the first programmatic dynamic-route layer (`[procedure-slug]`) outside `/blog`.

---

## 2. Two page archetypes

### Archetype A — Data Hub (one comprehensive page per high-volume query)

The "FPL chart by state" pattern. One page ranks for hundreds of long-tail variants. Examples:
- `/medicaid-income-limits` (live)
- `/aca-income-limits` (live)
- `/2026-fpl-chart` (new)
- `/medicare-costs-2026` (new)
- `/out-of-pocket-maximum` (new)
- `/medical-debt-statute-of-limitations` (new)

**Build pattern:** Mirror existing hubs. One file per hub at `src/app/[locale]/[hub-slug]/page.tsx`. Hardcoded data constants. ~300-400 lines each. Manual addition to sitemap.

**Why not data-file-driven:** ~10 hubs total. Each is unique enough (different data shape, different tables, different FAQs) that templating offers little leverage. Keeps parity with the 3 live hubs.

### Archetype B — Programmatic Product Page (dynamic route, many pages from one template)

The procedure cost pattern. One template renders 50-100+ pages from data files. Examples:
- `/mri-cost`, `/colonoscopy-cost`, `/er-visit-cost`, `/ambulance-cost`, `/c-section-cost`, ...

**Build pattern:** Dynamic route `src/app/[locale]/[procedure-slug]/page.tsx` (top-level) OR `src/app/[locale]/cost/[procedure]/page.tsx`. Data per page loaded from `content/data/procedures/[slug].json`. One template, N pages.

**This is the new architecture.** Section 3 specs it in detail.

---

## 3. Procedure cost template — full spec

### 3.1 URL structure — **decision: top-level flat URLs**

Use `/[procedure-slug]-cost` style, top-level, mirroring existing hubs:
- `/mri-cost`, `/colonoscopy-cost`, `/er-visit-cost`

**Rationale:**
- Matches existing hub naming (`/medicaid-income-limits`, `/aca-income-limits`). Consistent URL shape across the site.
- Cleaner for AI citation. "Source: coveredusa.org/mri-cost" reads better than "coveredusa.org/cost/mri".
- No need for a `/cost` parent hub; can add `/all-procedure-costs` later as a landing index if helpful.

**Trade-off:** Top-level pollutes the root namespace. With ~100 procedures + 10 hubs + 2 tools + blog, we're at ~115 top-level slugs. Manageable. Reserved slugs need a denylist on the data ingestion script (`screener`, `medical-bill-analyzer`, `blog`, `about`, `privacy`, etc.).

**Implementation note:** Top-level dynamic route conflicts are tricky in Next.js. Cleaner is `src/app/[locale]/cost/[procedure]/page.tsx` rendering at `/cost/mri`. **Revisit this decision when building** — if the build complexity is meaningful, fall back to `/cost/[procedure]`. URL aesthetic is small win vs. routing simplicity.

### 3.2 Data file format

One JSON file per procedure at `content/data/procedures/[slug].json`:

```json
{
  "slug": "mri-cost",
  "procedure": "MRI",
  "fullName": "Magnetic Resonance Imaging (MRI)",
  "category": "imaging",
  "primaryQuery": "how much does an MRI cost",
  "summary": "An MRI typically costs $400 to $3,500 without insurance, with a national median around $1,325. Medicare pays approximately $475 for an outpatient MRI. The biggest cost driver is facility type — hospital outpatient departments charge 2-3x more than independent imaging centers for the same scan.",
  "lastUpdated": "2026-05-12",
  "pricing": {
    "medicarePfsRate": 475,
    "medicareOppsRate": 720,
    "nationalLow": 400,
    "nationalHigh": 3500,
    "nationalMedian": 1325,
    "fairHealth80thPercentile": 2200,
    "withoutInsuranceTypical": 1800,
    "withInsuranceTypical": 350
  },
  "byFacilityType": [
    {"type": "Independent imaging center", "low": 400, "high": 1200},
    {"type": "Hospital outpatient", "low": 1500, "high": 3500},
    {"type": "Mobile MRI unit", "low": 350, "high": 900}
  ],
  "byBodyPart": [
    {"part": "Brain", "low": 500, "high": 3000},
    {"part": "Knee", "low": 400, "high": 2500},
    {"part": "Lumbar spine", "low": 450, "high": 3000}
  ],
  "billingCodes": ["70551", "70552", "70553"],
  "factorsAffectingCost": [
    "With or without contrast dye (contrast adds $200-500)",
    "Facility type (hospital vs. independent imaging center)",
    "Geographic location",
    "Whether you have insurance and your deductible status"
  ],
  "billingErrorsToCheck": [
    "Billed twice for the same MRI on the same day",
    "Charged for contrast when none was used",
    "Hospital outpatient rate billed for an independent imaging center scan",
    "Anesthesia billed when none was administered"
  ],
  "faqs": [
    {"q": "Why is an MRI so expensive?", "a": "..."},
    {"q": "Can I get an MRI without insurance?", "a": "..."},
    {"q": "How do I dispute an MRI bill?", "a": "..."}
  ],
  "sources": [
    {"name": "CMS Physician Fee Schedule 2026", "url": "https://..."},
    {"name": "FAIR Health Consumer", "url": "https://..."}
  ],
  "cta": "analyzer"
}
```

**Schema decisions:**
- `slug` includes the `-cost` suffix so it can be used as the URL directly without further string manipulation
- `lastUpdated` populates the "as of 2026" freshness markers AI engines look for
- `sources` array generates citation footer (AI engines weight outbound citations to authoritative sources)
- `cta` field controls which tool the page funnels to. Default `analyzer` for procedure cost pages.
- All dollar amounts are integers (no formatting in data — formatting happens in the template)

### 3.3 Template structure

`src/app/[locale]/cost/[procedure]/page.tsx`:

1. **`generateStaticParams`** — reads all JSON files in `content/data/procedures/`, returns slug list. Pages are statically generated at build time.
2. **`generateMetadata`** — pulls title/description/canonical from JSON
3. **`Page` component**:
   - JSON-LD `@graph` block (FAQPage + BreadcrumbList + MedicalProcedure + Dataset). One `<script>` tag, see Section 3.4.
   - **Hero**: H1 = "How Much Does an MRI Cost in 2026?", subhead = summary paragraph (first 100 words, the AI snippet target), `data-speakable` on both
   - **TL;DR box**: blockquote-style, summary paragraph repeated as quick-answer (AI engines love these). "Quick Answer:" prefix.
   - **Pricing table**: Medicare rates + national range + with/without insurance. Sortable. Schema.org Table semantics.
   - **By facility type**: smaller table
   - **By body part** (if applicable): smaller table
   - **Factors that affect cost**: bullet list
   - **What to check on your bill**: bullet list. Inline CTA to analyzer.
   - **Billing codes**: small section listing CPT/HCPCS codes. Each code links to a future `/billing-code/[code]` page (Tier 3).
   - **FAQs**: 6-8 items. Question = H3, answer = paragraph. Pulled into FAQ schema.
   - **Sources**: footer list of canonical sources with links and "last updated" date.
   - **CTA card**: matches the analyzer CTA on blog pages (same Tailwind classes, different copy if needed). Heading: "Got billed more than this? Check your bill." Button → `/[locale]/medical-bill-analyzer?utm_source=cost-page&utm_medium=cta&utm_campaign=[slug]`

**Length:** Each rendered page should be ~600-1,200 words to clear the "thin programmatic" bar. Data tables + factual context get us there easily.

**Reuse from existing hubs:** Inline style approach (Tailwind utility + `style={{}}` constants for brand colors). Match background `#f8fafc`, brand blue `#1d4ed8`, table header `#1e3a5f`. Pulled from the medicaid-income-limits page.

### 3.4 Schema markup — `@graph` block

Use Next.js `<script type="application/ld+json">` with a `@graph` array combining all relevant schemas. Pattern lifted from existing `medical-bill-analyzer/page.tsx`.

New helpers to add to `src/lib/structured-data.ts`:

```ts
export function getMedicalProcedureSchema(procedure: {
  name: string;
  description: string;
  url: string;
  codes?: string[];
  estimatedCostLow?: number;
  estimatedCostHigh?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: procedure.name,
    description: procedure.description,
    url: procedure.url,
    code: procedure.codes?.map((c) => ({
      '@type': 'MedicalCode',
      codeValue: c,
      codingSystem: 'CPT'
    })),
    ...(procedure.estimatedCostLow && procedure.estimatedCostHigh ? {
      estimatedCost: {
        '@type': 'MonetaryAmount',
        minValue: procedure.estimatedCostLow,
        maxValue: procedure.estimatedCostHigh,
        currency: 'USD'
      }
    } : {})
  };
}

export function getDatasetSchema(dataset: {
  name: string;
  description: string;
  url: string;
  lastUpdated: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: dataset.name,
    description: dataset.description,
    url: dataset.url,
    dateModified: dataset.lastUpdated,
    creator: { '@type': 'Organization', name: 'CoveredUSA', url: 'https://coveredusa.org' },
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
  };
}
```

The procedure page emits:
- `MedicalProcedure` (the central entity)
- `Dataset` (signals to AI engines: "this is structured data, parse the tables")
- `FAQPage` (existing helper)
- `BreadcrumbList` (existing helper)

For data hubs, swap `MedicalProcedure` for `Dataset` only. Income limit hubs already use `FAQPage` + `BreadcrumbList`; add `Dataset` when refactoring or building new hubs.

### 3.5 Sitemap integration

Extend [src/app/sitemap.ts](src/app/sitemap.ts):

```ts
import fs from 'fs';
import path from 'path';

const procedureFiles = fs.readdirSync(
  path.join(process.cwd(), 'content/data/procedures')
).filter(f => f.endsWith('.json'));

const procedureEntries = procedureFiles.map((file) => {
  const slug = file.replace('.json', '');
  return localizedEntry(`/cost/${slug}`, {
    changeFrequency: 'monthly',
    priority: 0.85,
  });
});
```

Same pattern for hub additions: each new hub gets a hand-written `localizedEntry()` line, just like the existing 3.

### 3.6 IndexNow extension

[scripts/coveredusa-indexnow-submit.js](../../scripts/coveredusa-indexnow-submit.js) currently auto-detects today's blog posts. Two changes:

1. **Add `--new-procedures` flag**: scans `content/data/procedures/*.json` for files with `lastUpdated === today`, submits those URLs.
2. **Add `--all-programmatic` flag**: submits every procedure URL + every hub URL. Run once per batch deploy.

Procedure pages and hubs are not auto-submitted on every cron run (unlike blog). They're submitted explicitly when batches ship.

### 3.7 i18n strategy — **start English-only**

Ship every procedure page and new hub in English first. Spanish translation is a follow-up batch (mirror the blog ES-translation pattern: optional, sitemap conditionally adds ES alternate only when the file exists).

For dynamic procedure routes, the data JSON could have an optional `es` block per field. Skip for now. When we do Spanish, the structure is:
```json
{ "slug": "mri-cost", "en": { ... }, "es": { ... } }
```

The sitemap helper already conditionally includes ES alternates only when the data exists, so this Just Works.

---

## 4. CTA routing rules

| Page type | CTA target | URL |
|---|---|---|
| Procedure cost pages | Bill Analyzer | `/[locale]/medical-bill-analyzer` |
| Hospital pages (future) | Bill Analyzer | `/[locale]/medical-bill-analyzer` |
| Drug pages — billing/inpatient angle (future) | Bill Analyzer | `/[locale]/medical-bill-analyzer` |
| Income limit hubs (existing + new) | Screener | `/[locale]/screener` |
| Medicare cost hub | Screener | `/[locale]/screener` |
| FPL chart | Screener | `/[locale]/screener` |
| Medical debt rules | Bill Analyzer | `/[locale]/medical-bill-analyzer` |
| Surprise billing rules | Bill Analyzer | `/[locale]/medical-bill-analyzer` |
| OOP max / deductible definitions | Screener (eligibility-adjacent) | `/[locale]/screener` |

Rule of thumb: pre-bill / eligibility / "what programs can I get on" → screener. Post-bill / "I have a bill in hand" → analyzer.

All CTAs use UTM params: `utm_source=programmatic&utm_medium=cta&utm_campaign=[slug]`.

---

## 5. Folder structure (after this lands)

```
projects/covered-usa/
├── content/
│   ├── blog/                        # existing — markdown articles
│   └── data/                        # NEW
│       └── procedures/              # NEW — one JSON per procedure cost page
│           ├── mri-cost.json
│           ├── colonoscopy-cost.json
│           └── ...
├── src/
│   ├── app/[locale]/
│   │   ├── medicaid-income-limits/  # existing hub
│   │   ├── aca-income-limits/       # existing hub
│   │   ├── medicare-eligibility/    # existing hub
│   │   ├── 2026-fpl-chart/          # NEW hub (one of ~10)
│   │   ├── medicare-costs-2026/     # NEW hub
│   │   ├── cost/                    # NEW
│   │   │   └── [procedure]/
│   │   │       └── page.tsx         # NEW — template for all procedure pages
│   │   └── ...
│   └── lib/
│       ├── structured-data.ts       # extended with MedicalProcedure + Dataset helpers
│       └── procedures.ts            # NEW — data file loader, getProcedureBySlug(), getAllProcedures()
└── scripts/
    └── coveredusa-load-procedures.js  # NEW — validates JSON files, can dry-run
```

The mirror of `src/lib/blog.ts` is `src/lib/procedures.ts`. Same shape: `getAllProcedures()`, `getProcedureBySlug(slug)`, `getAllProcedureSlugs()`.

---

## 6. Build sequence (when research lands)

Order optimized for shipping fastest-to-most-impact:

### Step 1 — Build infrastructure (1 day)
- Add `MedicalProcedure` + `Dataset` schema helpers to `structured-data.ts`
- Create `src/lib/procedures.ts` loader
- Create `src/app/[locale]/cost/[procedure]/page.tsx` template
- Create `content/data/procedures/` directory with 1 hand-crafted sample (MRI) to validate the template renders end-to-end
- Extend `sitemap.ts` with the procedures `.map()` block
- Extend `coveredusa-indexnow-submit.js` with `--new-procedures` and `--all-programmatic` flags

**Verify before continuing:**
- `npm run build` — no errors
- Visit `/en/cost/mri-cost` locally — page renders, FAQ schema valid (Google Rich Results Test), Dataset schema valid
- `curl localhost:3000/sitemap.xml` shows the procedure entry
- IndexNow `--new-procedures` correctly identifies the new file

### Step 2 — Populate procedure data (1-2 days)
Use research-output table to generate ~50 procedure JSON files. Could be done by an agent (parallel writers, one per procedure, similar to the article-writer pattern) OR by a single ingestion script that pulls from the research-output spreadsheet.

Each JSON is ~50 lines. Hand-validated for accuracy on the first 5 (especially the Medicare PFS rates).

### Step 3 — Ship first batch (same day)
- Push to git
- Vercel deploys
- Run `coveredusa-indexnow-submit.js --new-procedures`
- Verify pages render on production
- Verify schema validates on Google Rich Results Test
- Spot-check 5 pages on production

### Step 4 — Ship hubs (parallel track, 1 week)
Build the ~7 new hubs in priority order from research output. Each is a copy-paste-modify of an existing hub. Estimated 3-4 hours per hub once the first one is templated.

### Step 5 — Iterate based on Bing/AI signals (ongoing)
- Submit to Bing Webmaster Tools
- Monitor Bing impressions per page (Bing Webmaster Tools has per-URL reporting)
- Run sample queries through ChatGPT/Perplexity/Copilot to spot-check citations
- Identify weak pages (low impressions or AI engines citing wrong info), iterate

---

## 7. Schema validation checklist (apply to every new page type)

Before shipping a new programmatic page type:

- [ ] `<script type="application/ld+json">` block parses as valid JSON
- [ ] Passes Google Rich Results Test (`search.google.com/test/rich-results`)
- [ ] Passes Schema.org validator (`validator.schema.org`)
- [ ] `data-speakable` on H1 and TL;DR paragraph
- [ ] `lastUpdated` date present in JSON-LD + visible on page (freshness signal)
- [ ] Canonical URL set in `<head>` via `alternates.canonical`
- [ ] Open Graph image set (default to site OG image if no custom one)
- [ ] All outbound source links open in new tab and have `rel="noopener"`
- [ ] Page has internal links: at minimum, to the matching CTA tool and 2 related pages
- [ ] Page word count >500 (avoid thin-content flags even though Bing is more lenient than Google)
- [ ] FAQ has ≥4 questions
- [ ] Sitemap entry added (auto for procedures, manual for hubs)
- [ ] IndexNow submitted on first deploy

---

## 8. Reserved slugs (do not let procedure data files use these)

Add to `coveredusa-load-procedures.js` as a validation block. Reject any procedure JSON whose `slug` collides with:

```
screener, medical-bill-analyzer, blog, about, privacy, terms,
do-not-sell, health-data-privacy, results,
medicaid-income-limits, aca-income-limits, medicare-eligibility,
2026-fpl-chart, medicare-costs-2026, out-of-pocket-maximum,
chip-income-limits, medical-debt-statute-of-limitations,
surprise-billing-protections,
api, _next, favicon.ico, robots.txt, sitemap.xml
```

The exact list of reserved hub slugs comes from research output; lock it before populating procedures.

---

## 9. Out of scope of this layer

- **Hospital pages** (`/hospital/[slug]`) — Tier 2, post-research. Different data sources (CMS Hospital General Info + IRS 990 Schedule H + ProPublica). Different template.
- **Drug pages** (`/drug/[slug]`) — Tier 3. Possibly merge with billing code pages.
- **Billing code library** (`/billing-code/[code]`) — Tier 3. CPT/HCPCS/CARC/RARC.
- **Insurance payer dispute pages** — Tier 3, low priority.
- **State-specific procedure cost variants** (`/cost/[procedure]/[state]`) — defer. Build national pages first. Promote to per-state only if research shows clear regional spread + search volume.
- **Spanish translation** — defer. Ship English-only, mirror blog ES pattern when batch-translating.
- **Idea-harvester cron** — separate workstream, fully independent of this architecture.

---

## 10. Open decisions (require deep research output before locking)

1. **Top-level slugs vs `/cost/` subpath**: tentatively `/cost/[procedure]` for routing safety. Revisit if research shows specific high-volume queries demand the flatter shape.
2. **Final list of ~10 hubs to build**: locked once research returns Section 2 of the prompt.
3. **`/cost` landing page**: build an index page listing all procedures? Helps SEO depth and discoverability. Probably yes, after first 20 procedures ship.
4. **Schema.org `Dataset` vs `MedicalEntity` for hub pages**: pick one based on competitor analysis from research Section 4.
5. **Whether to add per-state pricing inside a procedure page** (collapsible section) or push to a separate `/cost/[procedure]/[state]` page: data-dependent.

---

## 11. Success criteria

The Tier 1 layer is "done" when:

- [ ] First 5 procedure pages live, indexed by Bing, valid schema
- [ ] Sitemap auto-generates procedure entries
- [ ] IndexNow submits new procedure URLs on batch deploy
- [ ] All 50-100 procedures from research output shipped within 2 weeks of research return
- [ ] All ~10 new data hubs shipped within 4 weeks of research return
- [ ] At least one procedure page or hub gets cited by ChatGPT, Perplexity, or Copilot for its primary query within 60 days of going live (verification via running sample queries through each engine and checking the citation list)
