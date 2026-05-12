# Template Spec — Comparison

**Reference:** [TEMPLATE_SYSTEM_SPEC.md](../TEMPLATE_SYSTEM_SPEC.md) for shared standards.

## 1. Purpose and target queries

Side-by-side comparison pages for "X vs Y" healthcare queries. High commercial intent — users are actively choosing between options.

**Example target queries:**
- "Medicaid vs Medicare"
- "HMO vs PPO"
- "Original Medicare vs Medicare Advantage"
- "Bronze vs Silver vs Gold plans"
- "HSA vs FSA"
- "Short-term vs ACA"
- "Urgent care vs ER"

## 2. URL pattern

`/[a]-vs-[b]` for two-way comparisons.
`/[a]-vs-[b]-vs-[c]` for three-way (rare; use sparingly).

Examples:
- `/medicaid-vs-medicare`
- `/hmo-vs-ppo`
- `/original-medicare-vs-medicare-advantage`
- `/bronze-vs-silver-vs-gold`
- `/hsa-vs-fsa`
- `/short-term-vs-aca`
- `/urgent-care-vs-er`

## 3. Data file shape

`content/data/comparisons/[slug].json`:

```json
{
  "slug": "medicaid-vs-medicare",
  "type": "comparison",
  "primaryQuery": "Medicaid vs Medicare",
  "title": "Medicaid vs Medicare: What's the Difference? (2026)",
  "description": "Medicaid is income-based; Medicare is age- or disability-based. Compare eligibility, cost, coverage, and how to enroll.",
  "h1": "Medicaid vs Medicare: 2026 Side-by-Side Comparison",
  "subhead": "Two completely different programs that millions of Americans confuse.",
  "quickAnswer": "Medicaid is a state-federal program for low-income Americans of any age (138% FPL in expansion states as of 2026). Medicare is a federal program for adults 65+ and people with qualifying disabilities. About 12 million Americans are dual-eligible for both.",
  "lastUpdated": "2026-05-12",
  "lastVerified": "2026-05-12",
  "cta": "screener",
  "optionA": {
    "name": "Medicaid",
    "shortDescription": "State-federal program for low-income Americans of any age.",
    "eligibility": "Income-based. 138% FPL in expansion states (~$22,000 single, ~$45,540 family of 4).",
    "cost": "Free or very low cost. Some states have small copays.",
    "coverage": "Comprehensive. Includes long-term care, behavioral health, dental and vision in most states.",
    "enrollment": "Year-round. Apply through state Medicaid agency or healthcare.gov."
  },
  "optionB": {
    "name": "Medicare",
    "shortDescription": "Federal program for adults 65+ and people with qualifying disabilities.",
    "eligibility": "Age 65+ OR receiving SSDI for 24+ months OR ESRD/ALS.",
    "cost": "Part A free (most), Part B $202.90/mo (2026), Part D varies, plus deductibles and coinsurance.",
    "coverage": "Hospital (A), medical (B), drugs (D). Does NOT cover long-term care, most dental, vision, or hearing.",
    "enrollment": "Initial Enrollment Period (3 months before 65 → 3 months after). Annual Election Period Oct 15 - Dec 7."
  },
  "comparisonTable": [
    { "feature": "Eligibility", "a": "Income-based, any age", "b": "Age 65+ or disability" },
    { "feature": "Cost", "a": "Free or minimal", "b": "$202.90/mo Part B + more" },
    { "feature": "Long-term care", "a": "Covered", "b": "Not covered" },
    { "feature": "Dental", "a": "Covered (most states)", "b": "Not covered (Original Medicare)" },
    { "feature": "Vision", "a": "Covered (most states)", "b": "Not covered" },
    { "feature": "Drug coverage", "a": "Included", "b": "Separate Part D" },
    { "feature": "Enrollment window", "a": "Year-round", "b": "Specific windows" }
  ],
  "decisionGuide": [
    { "if": "Under 65 and income under 138% FPL", "then": "Medicaid (apply year-round)" },
    { "if": "Age 65+ and not low-income", "then": "Medicare (enroll near birthday)" },
    { "if": "Age 65+ AND low-income", "then": "Both — dual eligible. Apply for Medicare + Medicaid + Medicare Savings Program" },
    { "if": "Under 65, disabled, on SSDI 24+ months", "then": "Medicare (and possibly Medicaid if low-income)" }
  ],
  "faqs": [
    { "q": "Can I have both Medicaid and Medicare?", "a": "Yes. About 12 million Americans are dual-eligible." },
    { "q": "Which is better, Medicaid or Medicare?", "a": "Neither is 'better' — they cover different people. Your eligibility determines which you can get." },
    { "q": "Is Medicaid free?", "a": "Usually yes. Most enrollees pay nothing." },
    { "q": "How much does Medicare cost in 2026?", "a": "Standard Part B premium is $202.90/month. Income-based surcharges (IRMAA) can raise it to $527.50." }
  ],
  "sources": [
    { "name": "Medicaid.gov", "url": "https://www.medicaid.gov/" },
    { "name": "Medicare.gov", "url": "https://www.medicare.gov/" },
    { "name": "KFF Dual-Eligible Beneficiaries", "url": "https://kff.org/..." }
  ],
  "relatedComparisons": ["medicare-vs-medicare-advantage", "medicaid-vs-aca", "medicare-vs-chip"]
}
```

## 4. Page structure

1. `<HubHero>` — H1, summary, `<LastVerified>`
2. `<QuickAnswer>` callout
3. **Pull-quote** — the clearest single distinction between the options
4. **`<ComparisonGrid>`** — side-by-side option A / option B summary cards
5. **Feature comparison table** — `<DataTable>` rendering the `comparisonTable` array
6. **Decision guide** — "If X, then choose Y" list
7. **When to choose A** — paragraph explaining
8. **When to choose B** — paragraph explaining
9. `<FAQSection>` — 4-6 FAQs
10. `<CTACard>` — Screener (most comparisons funnel to "let us tell you which one you qualify for")
11. **Related comparisons** internal-link grid
12. `<SourcesFooter>`

Target length: 800-1,200 words.

## 5. Schema markup

`@graph`:
- `MedicalWebPage`
- `FAQPage`
- `BreadcrumbList`
- `Article` with `comparisonTable` (the comparison itself can be Article-typed; the page is MedicalWebPage)

## 6. AI optimization specifics

- **Feature comparison table is gold for AI engines.** Clean two-column structure with consistent feature labels = parseable. Use `<DataTable>` semantic HTML.
- **The decision guide.** AI engines love "if/then" structures. Phrased as "If you are X, choose Y" with specific income thresholds and age ranges.
- **Quick Answer must contain BOTH options' core distinction in one sentence.** AI engines pull comparison answers as paragraphs; lead with the canonical distinction.
- **Avoid recommending one over the other.** Frame as "Y is right for you IF X." Decision frame, not opinion.

## 7. Sample pages to ship with template

5 highest-volume comparison queries:
1. `/medicaid-vs-medicare`
2. `/hmo-vs-ppo`
3. `/original-medicare-vs-medicare-advantage`
4. `/bronze-vs-silver-vs-gold`
5. `/short-term-vs-aca`

## 8. Reserved slugs / conflict checks

- Slug format: `[a]-vs-[b]`, all lowercase, hyphenated.
- Both `[a]-vs-[b]` and `[b]-vs-[a]` are valid queries; PICK ONE per pair (the higher-volume direction) and 301-redirect the other.
- Collision check across `content/data/comparisons/`.

## 9. CTA routing

Default `cta: "screener"`. Override:

| Comparison type | CTA |
|---|---|
| Plan choice (HMO vs PPO, Bronze vs Silver) | Screener |
| Program choice (Medicaid vs Medicare) | Screener |
| Cost comparison (Urgent care vs ER) | Analyzer |
| Surprise-bill-adjacent (in-network vs out-of-network) | Analyzer |
