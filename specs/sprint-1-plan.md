# Sprint 1 Plan — Foundation

The 5-day foundation sprint that unblocks all 8 templates. After Sprint 1, every template becomes "wire up the data file + arrange shared components" — no more inline-styling, no more bespoke schema, no more per-page sitemap edits.

**References:** [TEMPLATE_SYSTEM_SPEC.md](TEMPLATE_SYSTEM_SPEC.md), [PROGRAMMATIC_SEO_ARCHITECTURE.md](../PROGRAMMATIC_SEO_ARCHITECTURE.md)

---

## Decision required before starting

**Palette: warm brand (A) vs blue/navy data-hub (B)?**

- Existing `globals.css` brand: warm teal `#0d9488`, amber `#c2732a`, cream `#FFFCF9`, serif (Georgia)
- Existing data hubs (inline-styled, drift): blue `#1d4ed8`, navy `#1e3a5f`, cool gray `#f8fafc`, sans-serif feel
- **Recommendation: A.** Brand consistency + fix the drift. Plan below assumes A.

Other Sprint 1 assumptions (call out if any are wrong):
- TypeScript-strict on all new files
- New components live in `src/components/programmatic/` to avoid colliding with existing `src/components/`
- Existing `Sources.tsx` gets renamed/replaced by `<SourcesFooter>` on Day 5 retrofit
- No Spanish work in Sprint 1 (existing EN-only data hubs stay EN-only)
- Vercel auto-deploy on push to `main` stays as-is

---

## Sprint 1 goal

After 5 days:
1. Design tokens live in `globals.css` via Tailwind v4 `@theme`
2. 10 shared components built, tested, documented in `src/components/programmatic/`
3. Content pipeline `src/lib/content.ts` reads blog markdown + JSON data files uniformly
4. 7 new schema helpers in `src/lib/structured-data.ts`
5. `sitemap.ts` auto-pulls from all content sources
6. `coveredusa-indexnow-submit.js` auto-detects new product pages
7. Existing `/medicaid-income-limits` retrofitted to use the new components — **must look pixel-identical (or pixel-identical given palette swap if Option A)** before merging
8. Production deploy succeeds, no regressions on screener / analyzer / blog / hubs

---

## Day-by-day

### Day 1 — Design tokens + first 4 components

**Goal:** Tokens in place. The hero-zone components built and visually validated on a throwaway test page.

**Files touched:**
- `src/app/globals.css` — extend the `:root` block with programmatic-page tokens
- `src/components/programmatic/HubHero.tsx` *(NEW)*
- `src/components/programmatic/QuickAnswer.tsx` *(NEW)*
- `src/components/programmatic/LastVerified.tsx` *(NEW)*
- `src/components/programmatic/PullQuote.tsx` *(NEW)*
- `src/app/[locale]/_dev/programmatic-test/page.tsx` *(NEW, dev-only — gitignored or deleted Day 5)*

**Design tokens to add (assuming Option A — warm brand):**

```css
/* In :root, after existing palette */
:root {
  /* Programmatic-page accents (extend brand) */
  --hub-eyebrow-bg: var(--primary-lightest);    /* light teal */
  --hub-eyebrow-text: var(--primary-dark);
  --table-header-bg: var(--primary-deeper);     /* deep teal */
  --table-header-text: white;
  --table-row-alt: var(--cream);
  --table-border: var(--border);
  --quick-answer-bg: var(--accent-lightest);    /* amber tint */
  --quick-answer-border: var(--accent);
  --pull-quote-color: var(--primary);
  --status-yes-bg: var(--success-light);
  --status-yes-text: var(--success);
  --status-no-bg: var(--error-light);
  --status-no-text: var(--error);
}

@theme inline {
  /* Existing entries stay. Add: */
  --color-hub-eyebrow-bg: var(--hub-eyebrow-bg);
  --color-hub-eyebrow-text: var(--hub-eyebrow-text);
  --color-table-header: var(--table-header-bg);
  /* ...etc — exposes tokens as Tailwind utility classes */
}
```

**Component prop interfaces:**

```ts
// HubHero.tsx
interface HubHeroProps {
  eyebrowText?: string;          // e.g. "2026 Reference"
  h1: string;
  subhead?: string;
  lastVerified?: string;         // YYYY-MM-DD
  locale: string;
}

// QuickAnswer.tsx
interface QuickAnswerProps {
  text: string;                  // 1-3 sentences, contains specific numbers
  locale: string;
}

// LastVerified.tsx
interface LastVerifiedProps {
  date: string;                  // YYYY-MM-DD
  locale: string;
}

// PullQuote.tsx
interface PullQuoteProps {
  text: string;                  // single citeable factual line
  source?: string;               // optional attribution
}
```

**Validation gate Day 1:**
- `npm run build` succeeds
- Test page renders all 4 components with realistic props
- `data-speakable` attribute correctly applied to H1 and QuickAnswer
- Browser DevTools confirms tokens resolve correctly

### Day 2 — Remaining 6 components

**Files touched:**
- `src/components/programmatic/DataTable.tsx` *(NEW)*
- `src/components/programmatic/FAQSection.tsx` *(NEW)*
- `src/components/programmatic/SourcesFooter.tsx` *(NEW — replaces Sources.tsx in Day 5 retrofit)*
- `src/components/programmatic/CTACard.tsx` *(NEW — extract+generalize from blog page)*
- `src/components/programmatic/ComparisonGrid.tsx` *(NEW)*
- `src/components/programmatic/StepList.tsx` *(NEW)*
- `src/components/programmatic/ProcedureCostBlock.tsx` *(NEW)*

That's 7 components (I miscounted in the master spec — there are 11 total, not 10). Doable in a day if I batch.

**Critical interfaces:**

```ts
// DataTable.tsx — for state matrices, pricing tables, all hub data
interface DataTableProps {
  caption?: string;
  columns: { key: string; label: string; align?: 'left' | 'right' | 'center' }[];
  rows: Record<string, string | number | { value: string; status?: 'yes' | 'no' }>[];
  emitDatasetSchema?: boolean;   // if true, component emits its own Dataset JSON-LD fragment
  datasetName?: string;
}

// FAQSection.tsx — emits FAQPage JSON-LD automatically
interface FAQSectionProps {
  faqs: { q: string; a: string }[];
  locale: string;
  // Component returns: <section>…</section> + <script type="application/ld+json">…</script>
}

// CTACard.tsx — single component, two variants
interface CTACardProps {
  variant: 'screener' | 'analyzer';
  context?: 'mid' | 'end';       // determines copy
  locale: string;
  utmCampaign: string;           // page slug for tracking
}
```

**Validation gate Day 2:**
- All 7 components render on the dev test page
- `<FAQSection>` emits valid `FAQPage` JSON-LD (verify with Schema.org validator)
- `<CTACard>` href correctly switches between `/screener` and `/medical-bill-analyzer` based on variant
- `<DataTable>` table semantics correct (proper `thead`, `th`, `scope`, `tbody`)

### Day 3 — Content pipeline + schema helpers

**Files touched:**
- `src/lib/content.ts` *(NEW)* — unified content loader
- `src/lib/types/content.ts` *(NEW)* — TypeScript types for each content type
- `src/lib/structured-data.ts` — extended with 7 new helpers
- `content/data/` *(NEW directory structure)*

**Directory structure created:**

```
content/
├── blog/                              # existing
└── data/                              # NEW
    ├── hubs/
    ├── procedures/
    ├── drugs/
    ├── glossary/
    ├── comparisons/
    ├── trigger-events/
    ├── personas/
    └── qa/
```

**Content pipeline API:**

```ts
// src/lib/content.ts
export type ContentType = 'blog' | 'hub' | 'procedure-cost' | 'drug' | 'glossary' | 'comparison' | 'trigger-event' | 'persona' | 'qa';

export interface ContentItem<T = unknown> {
  type: ContentType;
  slug: string;
  url: string;                   // full path including locale
  title: string;
  description: string;
  lastUpdated: string;
  cta: 'screener' | 'analyzer';
  data: T;                       // typed per ContentType
}

export function getAllContent(opts?: { type?: ContentType; locale?: string }): ContentItem[];
export function getContentBySlug(slug: string, type: ContentType, locale?: string): ContentItem | null;
export function getAllContentSlugs(type: ContentType, locale?: string): string[];
```

**Schema helpers added to `src/lib/structured-data.ts`:**

```ts
export function getMedicalWebPageSchema(props: {
  url: string;
  name: string;
  description: string;
  lastReviewed: string;
  about?: string;                // e.g. MedicalProcedure name
  audience?: 'Patient' | 'PublicHealth';
  medicalSpecialty?: string;
});

export function getMedicalProcedureSchema(props: {
  name: string;
  description: string;
  url: string;
  hcpcsCodes?: string[];         // NEVER include CPT
  estimatedCostLow?: number;
  estimatedCostHigh?: number;
});

export function getDatasetSchema(props: {
  name: string;
  description: string;
  url: string;
  dateModified: string;
});

export function getDrugSchema(props: {
  name: string;
  nonProprietaryName?: string;
  brandNames?: string[];
  drugClass?: string;
  hcpcsJCode?: string;
});

export function getDefinedTermSchema(props: {
  name: string;
  description: string;
  url: string;
  alternateNames?: string[];
});

export function getHowToSchema(props: {
  name: string;
  description: string;
  steps: { position: number; name: string; text: string }[];
});  // updates existing helper to take props instead of just locale

export function getQAPageSchema(props: {
  question: string;
  answer: string;
  url: string;
});
```

**Validation gate Day 3:**
- `npm run build` succeeds with new content/data directory empty (no files yet — pipeline must handle gracefully)
- Each schema helper outputs valid Schema.org JSON-LD verified via validator.schema.org
- `getAllContent({ type: 'blog' })` returns existing blog posts (no regression)

### Day 4 — Sitemap + IndexNow extension

**Files touched:**
- `src/app/sitemap.ts` — auto-pull from `content/data/`
- `scripts/coveredusa-indexnow-submit.js` — extend to auto-detect product pages
- `src/lib/content.ts` — add `getAllUrls()` helper if not done Day 3

**Sitemap changes:**

```ts
// In sitemap.ts default export, after existing localizedPages array:
const programmaticEntries: MetadataRoute.Sitemap = await Promise.all(
  (['hub','procedure-cost','drug','glossary','comparison','trigger-event','persona','qa'] as ContentType[]).flatMap(async (type) => {
    const items = getAllContent({ type });
    return items.map((item) => localizedEntry(item.url.replace(/^\/[a-z]{2}/, ''), {
      changeFrequency: 'monthly',
      priority: 0.85,
      lastModified: new Date(item.lastUpdated),
    }));
  })
);

return [...localizedPages, ...blogEntries, ...programmaticEntries];
```

**IndexNow extension:**

```js
// scripts/coveredusa-indexnow-submit.js
// Existing --today flag stays. Add:
// --all-programmatic: submit every product page URL (use for major batch deploys)
// --new-programmatic: scan content/data/*/*.json for lastUpdated === today, submit those
```

**Validation gate Day 4:**
- `curl localhost:3000/sitemap.xml` returns valid XML with all existing entries (no regression)
- IndexNow `--new-programmatic` finds zero new URLs (correct — nothing yet) without errors
- `npm run build` succeeds

### Day 5 — Retrofit + verify + deploy

**Goal:** Existing `/medicaid-income-limits` uses the new system, looks visually correct, and ships to production with zero regressions.

**Files touched:**
- `src/app/[locale]/medicaid-income-limits/page.tsx` — refactor to use shared components + content data file
- `content/data/hubs/medicaid-income-limits.json` *(NEW)* — extract the inline data (FPL math, STATES array, FAQS) into a data file
- Delete `src/components/Sources.tsx` (replaced by `SourcesFooter`)
- Or: rename existing `Sources.tsx` → `_legacy_Sources.tsx` if any other file still imports it (grep first)

**Visual validation:**

If **Option A (warm brand palette)**: the retrofit page WILL look different from the live page — that's the intended drift fix. Compare side-by-side, verify the new version uses brand tokens correctly, all elements present (hero, household table, state table, FAQs, sources). Take screenshots before/after.

If **Option B (keep blue/navy)**: the retrofit MUST be pixel-identical to current production. DevTools color picker confirms hex values match.

**Build + deploy checklist:**

- [ ] `npm run build` — no errors, no warnings beyond baseline
- [ ] All three existing hubs render correctly (`/medicaid-income-limits` refactored, `/aca-income-limits` + `/medicare-eligibility` untouched and still working)
- [ ] `/screener`, `/medical-bill-analyzer`, `/` (homepage) render correctly
- [ ] One existing blog post renders correctly
- [ ] Sitemap valid
- [ ] FAQ schema validates on Google Rich Results Test for retrofitted page
- [ ] Push to `main`, Vercel deploys, smoke-test production
- [ ] No errors in Vercel deploy logs

**End-of-sprint state:**
- Infrastructure: 100% built
- Programmatic pages live: 1 (retrofitted Medicaid hub) — no new content yet
- Existing site: unchanged behavior, possibly refreshed Medicaid hub visual

---

## Validation gates summary

| Gate | When | Pass criteria |
|---|---|---|
| Component visual | End of Day 2 | All 7 (+4 from Day 1) components render correctly on dev test page |
| Schema validity | End of Day 3 | All 7 new schema helpers pass validator.schema.org |
| Sitemap integrity | End of Day 4 | `/sitemap.xml` valid, all existing URLs present, no 404s |
| Retrofit fidelity | End of Day 5 | Refactored Medicaid hub renders correctly per chosen palette option |
| Production smoke test | End of Day 5 | Vercel deploy succeeds, screener + analyzer + 3 hubs + 1 blog post all render |

---

## Risks + mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Tailwind v4 `@theme` syntax differs from what I know | Medium | Spike on Day 1; budget 1 hour for syntax exploration before building tokens |
| Sources.tsx is imported by blog or other pages | High (likely yes) | Grep before deleting; rename or keep with deprecation comment |
| Refactor breaks existing Medicaid hub | Medium | Take screenshots of live page before starting; revert and reapproach if regression |
| Schema helpers return invalid JSON-LD | Low | Validate every helper output against schema.org validator before Day 4 |
| Existing inline-styled hubs visible color drift bothers users | Low–Medium (Option A only) | Document the brand alignment as intentional; offer to backfill `/aca-income-limits` + `/medicare-eligibility` in Sprint 2 day 0 |
| Next.js 16 + React 19 component patterns I don't know | Low | Existing components in `src/components/` show the conventions — match them |

---

## What I'll do after sign-off

The moment you approve:
1. Lock the palette choice (A or B)
2. Greenlight any of the Sprint 1 assumptions (TS strict, new folder location, Sources.tsx deletion strategy)
3. I start Day 1 immediately

End of Day 5 deliverable to you: a Loom-style screenshot diff of the retrofitted Medicaid hub + production URL + confirmation all validation gates passed. Then we start Sprint 2 building the 8 templates.

---

## Questions for you

1. **Palette: A (warm brand) or B (keep blue/navy)?**
2. **Sources.tsx**: delete and replace with `SourcesFooter`, or leave as-is and add the new one parallel?
3. **Existing 2 unrefactored hubs** (`/aca-income-limits`, `/medicare-eligibility`): refactor in Sprint 1 (adds 1-2 days) or save for after Sprint 2?
4. **Deploy at end of Sprint 1**: ship to production end of Day 5, or hold infrastructure on a branch and merge after Sprint 2 ships first new template?
