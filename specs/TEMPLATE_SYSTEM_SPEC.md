# CoveredUSA Template System — Master Spec

The master spec for the programmatic page system. Covers the design system refresh, AI-optimization standards applied across all templates, and the build sequence.

**Companion docs:**
- [PROGRAMMATIC_SEO_ARCHITECTURE.md](../PROGRAMMATIC_SEO_ARCHITECTURE.md) — architecture and routing
- [research/digest-programmatic-seo-2026-05-12.md](../research/digest-programmatic-seo-2026-05-12.md) — research findings driving this spec
- `specs/templates/*.md` — one spec per template (8 total)

**Target:** 2,500 programmatic pages across 8 templates + existing blog. ~85% funnel to bill analyzer, ~13% to screener, ~2% both.

---

## 1. Design system refresh

The 3 existing data hubs (`/medicaid-income-limits`, `/aca-income-limits`, `/medicare-eligibility`) look decent. Visual language stays. What changes is **architecture**: inline styles become design tokens, repeated patterns become shared components, AI-optimization-specific elements get added.

### 1.1 Design tokens (move to Tailwind config)

Extract from existing pages into `tailwind.config.ts`:

```ts
colors: {
  brand: {
    blue: '#1d4ed8',         // primary accent, key data points
    blueLight: '#dbeafe',    // eyebrow tag background
    navy: '#1e3a5f',         // table header background
  },
  ink: {
    primary: '#0f172a',      // headings
    secondary: '#475569',    // body
    tertiary: '#64748b',     // captions
    quaternary: '#94a3b8',   // footnotes
  },
  surface: {
    DEFAULT: '#f8fafc',      // page background
    white: '#ffffff',
    border: '#e2e8f0',
    borderSubtle: '#f1f5f9',
  },
  status: {
    yesBg: '#dcfce7', yesText: '#166534',
    noBg: '#fee2e2', noText: '#991b1b',
  },
},
```

After tokens land: never write color hex codes inline again. Migrate the 3 existing hubs in a follow-up cleanup.

### 1.2 Shared component library

Build under `src/components/programmatic/`:

| Component | Purpose |
|---|---|
| `<HubHero>` | Eyebrow tag + H1 + summary paragraph + last-verified date. `data-speakable` on H1 and summary. |
| `<QuickAnswer>` | "Quick Answer:" callout box near top. 1-3 sentence summary AI engines pull as snippet. `data-speakable`. |
| `<DataTable>` | Sortable table with brand-navy header, alternating row bg, rounded corners. Used for state matrices and pricing tables. |
| `<FAQSection>` | Renders FAQ list + auto-emits `FAQPage` JSON-LD. Takes `{q, a}[]` prop. |
| `<SourcesFooter>` | Citation footer with outbound links + "last verified" date per source. AI engines weight outbound citations as trust signals. |
| `<CTACard>` | Screener or analyzer CTA. Already partly exists in blog page; extract and standardize. |
| `<LastVerified>` | Inline date stamp shown on page ("Verified: May 12, 2026"). Reads from frontmatter, mirrors `lastReviewed` schema property. |
| `<ComparisonGrid>` | Side-by-side comparison block for `/X-vs-Y` pages. |
| `<StepList>` | Numbered step list for trigger-event and HowTo schemas. |
| `<ProcedureCostBlock>` | Specialized table showing cash / inpatient / outpatient / Medicare price columns. |

Each component:
- Tailwind-only (no inline styles)
- Locale-aware (`isEs` branch where applicable)
- Emits its own schema fragment when relevant (FAQ, BreadcrumbList, etc.)

### 1.3 What stays exactly the same

- Hero layout, eyebrow tag pattern
- Table-heavy aesthetic (this is the brand)
- Brand blue + navy + slate palette
- Section spacing and rhythm
- The 3 existing hub layouts in spirit — they get refactored to use shared components, not redesigned

### 1.4 What gets added that's new

- **Quick Answer callout** above all main content (AI snippet target)
- **Visible "Last verified" date stamp** on every page (freshness signal users can see + AI engines read from schema)
- **Sources footer** as a standard section (not just inline links)
- **Pull-quote callout** for the single most-citeable fact on each page (1-2 sentence, large type, brand color)

---

## 2. AI optimization standards — applied across ALL templates

Every template must satisfy this checklist. This is the non-negotiable baseline; per-template specs add specific requirements on top.

### 2.1 Schema markup

- [ ] Use **`MedicalWebPage`** as the page-level type (not generic `Article` or `WebPage`).
- [ ] Include `lastReviewed: YYYY-MM-DD` property (Today on every build).
- [ ] Include `reviewedBy: {Organization: CoveredUSA}` property.
- [ ] Wrap multi-schema pages in a `@graph` array (mirroring the pattern in `/medical-bill-analyzer/page.tsx`).
- [ ] Include `BreadcrumbList` schema.
- [ ] Include `FAQPage` schema with 4-6 highly specific Q&As (not generic — must contain numerical answers).
- [ ] When page has tabular data, include `Dataset` schema.
- [ ] Per-template specifics: see each template's spec file.

### 2.2 Content density (the "AI cite this" requirements)

- [ ] **Quick Answer callout** in the first 100 words. 1-3 sentences. Specific numbers. `data-speakable`.
- [ ] **"As of 2026"** temporal marker in the H1 area and in body text. Repeat at least 3 times across the page.
- [ ] **Specific dollar amounts and percentages** throughout. Quotable factual lines, not vague claims.
- [ ] **Clean H2/H3 hierarchy.** Each section's H2 should be a likely-quoted query phrase.
- [ ] **Tables with proper `thead/tbody/th`** semantics. AI engines parse table cells; sloppy markup = no extraction.
- [ ] **Outbound citations** to canonical authority sources (CMS, HHS, IRS, KFF, ASPE) in the Sources footer. Min 3 sources per page.
- [ ] **Internal links** to 2+ related programmatic pages. Builds topic cluster strength.
- [ ] **Minimum 500 words** rendered body content (excludes tables, FAQ). Avoid thin-content flags even on Bing.

### 2.3 Page metadata

- [ ] Canonical URL set in `<head>` via Next.js metadata `alternates.canonical`.
- [ ] Open Graph: title, description, type, image.
- [ ] Twitter Card metadata.
- [ ] Locale alternates if Spanish version exists.

### 2.4 Performance

- [ ] Static generation (`generateStaticParams` for dynamic routes). No SSR.
- [ ] Inline critical CSS via Tailwind.
- [ ] No client-side JS for content — purely server-rendered.

### 2.5 Routing and pipeline

- [ ] Data file lives at `content/data/[type]/[slug].json` (one file per page).
- [ ] Each data file has `type` field matching the template.
- [ ] Each data file has `cta: "screener" | "analyzer"` field.
- [ ] Each data file has `lastUpdated: YYYY-MM-DD` field.
- [ ] Sitemap auto-pulls from all `content/data/*` directories.
- [ ] IndexNow auto-submits on deploy for files where `lastUpdated === today`.

---

## 3. The 8 templates

Brief overview. Full specs in `specs/templates/*.md`.

| # | Template | URL pattern | Target queries | Page count | Funnel |
|---|---|---|---|---|---|
| 1 | **Hub** | `/[hub-slug]` | "FPL chart 2026", "Medicare costs 2026" | 10-15 | Screener |
| 2 | **Procedure cost** | `/cost/[procedure]` and `/cost/[procedure]/[state]` | "MRI cost without insurance" | 100 national + 1,500 state variants | Analyzer |
| 3 | **Drug** | `/drug/[drug]-cost` | "Insulin inpatient cost", "Ozempic markup" | 100 | Analyzer |
| 4 | **Glossary** | `/[term]-explained` | "Out of pocket maximum explained" | 25 | Mixed (default screener) |
| 5 | **Comparison** | `/[a]-vs-[b]` | "Medicaid vs Medicare", "HMO vs PPO" | 40 | Mostly screener |
| 6 | **Trigger event** | `/[event]-health-insurance` | "Just lost job health insurance" | 25 | Screener |
| 7 | **Persona** | `/health-insurance-for-[persona]` | "Health insurance for gig workers" | 25 | Screener |
| 8 | **Q&A** | `/does-[program]-cover-[X]` | "Does Medicare cover dental" | 80 | Screener |

Plus: 500 hospital pages (deferred — separate spec, requires CMS data ingestion).

Total programmatic inventory at target: **~2,500 pages**.

---

## 4. Build sequence

### Sprint 1 — Foundation (week 1)

- Day 1: Design tokens into Tailwind config. Build the 10 shared components in `src/components/programmatic/`. Tests by retrofitting the existing `/medicaid-income-limits` hub to use shared components — must look pixel-identical before refactor proceeds.
- Day 2-3: Build the content pipeline: `src/lib/content.ts` (unified loader for blog markdown + JSON data files), updated `sitemap.ts`, extended `coveredusa-indexnow-submit.js`.
- Day 4: Extend schema helpers in `src/lib/structured-data.ts` (add `getMedicalWebPageSchema`, `getMedicalProcedureSchema`, `getDatasetSchema`, `getDrugSchema`, `getDefinedTermSchema`, `getHowToStepSchema`, `getQAPageSchema`).
- Day 5: Slack day for fixes + first deploy.

### Sprint 2 — Templates (weeks 2-3)

Build all 8 templates. Each ships with 3-5 sample data files for visual validation:

| Day | Template | Sample pages |
|---|---|---|
| 6 | Hub | `/fpl-chart-2026` |
| 7 | Glossary | `/out-of-pocket-maximum`, `/deductible-vs-copay`, `/coinsurance-explained`, `/premium-vs-deductible`, `/in-network-vs-out-of-network` |
| 8 | Comparison | `/medicaid-vs-medicare`, `/hmo-vs-ppo`, `/original-medicare-vs-medicare-advantage`, `/bronze-vs-silver-vs-gold`, `/short-term-vs-aca` |
| 9 | Q&A | `/does-medicare-cover-dental`, `/does-medicaid-cover-therapy`, `/does-aca-cover-pre-existing-conditions`, `/does-medicare-cover-ozempic`, `/does-medicaid-cover-bariatric-surgery` |
| 10 | Trigger event | `/just-lost-job-health-insurance`, `/aging-off-parents-plan-26`, `/just-had-a-baby-coverage`, `/just-retired-medicare-or-marketplace`, `/just-moved-states-health-insurance` |
| 11 | Persona | `/health-insurance-for-gig-workers`, `/health-insurance-for-freelancers`, `/health-insurance-for-early-retirees`, `/health-insurance-for-college-students`, `/health-insurance-for-self-employed` |
| 12-13 | Procedure cost | `/cost/mri`, `/cost/urgent-care`, `/cost/colonoscopy`, `/cost/knee-replacement`, `/cost/er-visit` |
| 14-15 | Drug | `/drug/insulin-cost`, `/drug/ozempic-cost`, `/drug/epi-pen-cost`, `/drug/humira-cost`, `/drug/keytruda-cost` |

End of Sprint 2: 40 new programmatic pages + design system + content pipeline. Jacob reviews visual quality of each template before mass population.

### Sprint 3 — Mass population (weeks 4-7)

Once Jacob signs off on visual quality:

- Week 4: Populate procedure cost template — 95 more national procedures (total 100).
- Week 5: Spawn agents in parallel to populate state-variant procedure pages — 1,500 pages (top 30 procedures × 50 states).
- Week 6: Populate drug pages — 95 more drugs (total 100).
- Week 7: Fill out remaining templates: glossary +20, comparison +35, Q&A +75, trigger +20, persona +20, hubs +10.

End of Sprint 3: **~2,000 pages live**. Hospital template + 500 hospital pages held for Sprint 4.

### Sprint 4 — Hospital pages (weeks 8-10)

Separate spec required because data ingestion is its own project (CMS Hospital General Info + IRS 990 Schedule H + price transparency files).

---

## 5. Per-template spec contract

Each `specs/templates/*.md` file follows the same structure:

1. Purpose and target queries
2. URL pattern + sample URLs
3. Data file shape (JSON schema)
4. Page structure (sections in order)
5. Schema markup (which schema types apply)
6. AI optimization specifics (on top of the master checklist)
7. Sample pages to ship with the template
8. Reserved slugs / conflict checks
9. CTA routing (which tool the page funnels to)

This makes each template spec **self-contained** — an engineer or agent can build that template from its spec alone, referring to this master doc only for shared standards.

---

## 6. What's NOT in this spec

- Hospital pages — separate spec (Sprint 4)
- Spanish translation — initial build is English-only. Mirror blog ES-translation pattern when ready.
- The existing blog cron — stays as-is; programmatic pipeline is parallel.
- State-grid of thin Medicaid/Medicare pages — explicitly rejected.
- CPT code lookup pages — explicitly rejected (AMA licensing).
- Auto-generated dispute letters — explicitly rejected (legal exposure).
