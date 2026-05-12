# Template Spec — Hub

**Reference:** [TEMPLATE_SYSTEM_SPEC.md](../TEMPLATE_SYSTEM_SPEC.md) for shared standards.

## 1. Purpose and target queries

Comprehensive single-page data references on high-volume canonical queries. One page ranks for hundreds of long-tail variants. Mirrors the pattern of the existing `/medicaid-income-limits`, `/aca-income-limits`, `/medicare-eligibility` pages — but using the refreshed component library.

**Example target queries:**
- "2026 FPL chart"
- "Medicare costs 2026"
- "QMB income limits 2026"
- "Medical debt statute of limitations by state"
- "ACA open enrollment 2026"

## 2. URL pattern

Top-level slug, no parent path:
- `/fpl-chart-2026`
- `/medicare-costs-2026`
- `/medicare-savings-program-limits`
- `/medical-debt-statute-of-limitations`
- `/open-enrollment-dates-2026`
- `/chip-income-limits-by-state`

i18n: `/[locale]/[hub-slug]` via existing Next.js `[locale]` param.

## 3. Data file shape

`content/data/hubs/[slug].json`:

```json
{
  "slug": "fpl-chart-2026",
  "type": "hub",
  "title": "2026 Federal Poverty Level (FPL) Chart by State",
  "description": "Complete 2026 FPL chart with income thresholds by household size and state. Updated for 2026 HHS guidelines.",
  "h1": "2026 Federal Poverty Level Chart",
  "subhead": "Income thresholds by household size for all 50 states plus Alaska and Hawaii.",
  "quickAnswer": "As of 2026, the Federal Poverty Level for a single person is $15,960 in the 48 contiguous states, $19,950 in Alaska, and $18,360 in Hawaii. For a family of four, FPL is $33,000.",
  "eyebrowTag": "2026 Reference",
  "lastUpdated": "2026-05-12",
  "lastVerified": "2026-05-12",
  "cta": "screener",
  "sections": [
    { "type": "table", "title": "FPL by Household Size (2026)", "data": "fpl-household-table" },
    { "type": "table", "title": "FPL by State (Alaska + Hawaii Variations)", "data": "fpl-state-table" },
    { "type": "table", "title": "FPL Multipliers by Program", "data": "fpl-program-table" },
    { "type": "text", "title": "How the FPL Is Used", "body": "..." }
  ],
  "faqs": [
    { "q": "What is the FPL for a family of 4 in 2026?", "a": "$33,000 in the 48 contiguous states." },
    { "q": "How is the 2026 FPL different in Alaska?", "a": "..." }
  ],
  "sources": [
    { "name": "2026 HHS Poverty Guidelines", "url": "https://aspe.hhs.gov/...", "verified": "2026-05-12" },
    { "name": "KFF Medicaid Eligibility Database", "url": "https://kff.org/...", "verified": "2026-05-12" }
  ],
  "relatedPages": ["/medicaid-income-limits", "/aca-income-limits", "/chip-income-limits-by-state"],
  "schemaProperties": {
    "medicalSpecialty": "PublicHealth",
    "audience": "Patient"
  }
}
```

Table data references load from `content/data/hubs/_tables/[name].json` so large 50-state matrices stay reusable across hubs.

## 4. Page structure (top to bottom)

1. **`<HubHero>`** — eyebrow tag, H1, subhead, `<LastVerified>` date stamp
2. **`<QuickAnswer>`** callout — the `quickAnswer` field, `data-speakable`
3. **Pull-quote** — single most-citeable factual line, large type
4. **For each `sections` entry**: render `<DataTable>` or text section
5. **`<FAQSection>`** — emits FAQPage JSON-LD
6. **"How to use this data"** — short educational paragraph
7. **`<CTACard>`** — screener for income-limit hubs, analyzer for debt/billing hubs
8. **Related pages** internal-link grid
9. **`<SourcesFooter>`** — outbound citations with last-verified dates

## 5. Schema markup

`@graph` array containing:
- `MedicalWebPage` (page-level) with `lastReviewed`, `reviewedBy`, `audience`, `medicalSpecialty`
- `Dataset` — the page's tabular data, with `dateModified`, `creator`, `license`, `isAccessibleForFree`
- `FAQPage`
- `BreadcrumbList`
- Optional `WebApplication` reference for the relevant CoveredUSA tool

## 6. AI optimization specifics

- **"As of 2026"** must appear in: H1 area, Quick Answer, every section H2 where data is year-anchored, page meta description.
- **Tables MUST use proper semantic HTML.** Use `<DataTable>` component which enforces this.
- **State variations** (Alaska, Hawaii, expansion vs non-expansion) must be called out explicitly in tables — AI engines often miss state-specific variations.
- **Outbound citations to primary sources** (HHS ASPE PDF, CMS Final Rule, state statute citations) — minimum 3 per page.
- **At least one section H2 phrased as a question:** "What is the 2026 FPL for a family of 4?" — improves AI citation odds.

## 7. Sample pages to ship with template

5 pages spanning the funnel mix:
1. `/fpl-chart-2026` (screener funnel, very high volume)
2. `/medicare-costs-2026` (screener funnel, high volume, includes IRMAA section)
3. `/medicare-savings-program-limits` (screener funnel)
4. `/medical-debt-statute-of-limitations` (analyzer funnel, legal-risk: educational framing only, no advice)
5. `/open-enrollment-dates-2026` (screener funnel, seasonal)

## 8. Reserved slugs / conflict checks

Hub slugs collide with the top-level namespace. Validate against:
- Existing routes: `screener`, `medical-bill-analyzer`, `blog`, `about`, `privacy`, `terms`, `results`, `do-not-sell`, `health-data-privacy`
- Existing hubs: `medicaid-income-limits`, `aca-income-limits`, `medicare-eligibility`
- Reserved: `api`, `_next`, `favicon.ico`, `robots.txt`, `sitemap.xml`

## 9. CTA routing

Hub-by-hub mapping:

| Hub topic | CTA |
|---|---|
| FPL / income limits / eligibility data | Screener |
| Medicare costs / Part D penalty | Screener |
| Medicaid limits | Screener |
| CHIP limits | Screener |
| Open enrollment dates | Screener |
| Medical debt SOL | Analyzer |
| Charity care laws | Analyzer |
| No Surprises Act process | Analyzer |
| OOP max / deductible (definitional — see glossary template) | Glossary handles these |
