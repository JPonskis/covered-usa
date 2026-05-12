# Template Spec — Drug

**Reference:** [TEMPLATE_SYSTEM_SPEC.md](../TEMPLATE_SYSTEM_SPEC.md) for shared standards.

## 1. Purpose and target queries

Drug pricing pages focused on **inpatient billing / hospital markup**, not retail pharmacy pricing. GoodRx owns retail; our angle is "you got billed $X for this drug in the hospital — was that fair?"

**Example target queries:**
- "Insulin inpatient cost"
- "Ozempic hospital charge"
- "Why did the hospital charge $X for Tylenol"
- "Inpatient drug markup"
- "Amlodipine billed at hospital"
- "Epi-pen cost without insurance"

## 2. URL pattern

`/drug/[drug-slug]-cost`

Examples:
- `/drug/insulin-cost`
- `/drug/ozempic-cost`
- `/drug/epi-pen-cost`
- `/drug/humira-cost`
- `/drug/keytruda-cost`

**No CPT codes. HCPCS J-codes are public domain — use them freely.**

## 3. Data file shape

`content/data/drugs/[slug].json`:

```json
{
  "slug": "insulin-cost",
  "type": "drug",
  "drugName": "Insulin",
  "genericName": "Insulin (multiple formulations)",
  "brandNames": ["Humalog", "Novolog", "Lantus", "Levemir", "Tresiba"],
  "drugClass": "Antidiabetic agent (hormone replacement)",
  "primaryQuery": "Insulin inpatient cost",
  "title": "Insulin Inpatient Cost in 2026 — Hospital Billing Guide",
  "description": "What hospitals charge for insulin in 2026: typical inpatient charges, Medicare ASP rates, common billing errors, and patient assistance programs.",
  "h1": "What Hospitals Charge for Insulin in 2026",
  "subhead": "Typical inpatient charges, the Medicare-paid rate, and how to spot overbilling.",
  "quickAnswer": "As of 2026, a hospital may bill $200-$500+ per insulin dose inpatient even though the Medicare ASP rate is $4-$15 per unit. Markups of 1,000%+ are common. Several manufacturer patient assistance programs offer free supply for income-qualified patients.",
  "lastUpdated": "2026-05-12",
  "lastVerified": "2026-05-12",
  "cta": "analyzer",
  "pricing": {
    "medicareAspRate": 12,
    "retailPriceLow": 25,
    "retailPriceHigh": 300,
    "inpatientChargeLow": 200,
    "inpatientChargeHigh": 500,
    "markupMultiplier": "16-40x",
    "retailContextNote": "Retail pricing is best researched via GoodRx; this page focuses on hospital billing."
  },
  "hcpcsJCodes": [
    { "code": "J1815", "description": "Insulin injection, per 5 units (HCPCS Level II — public domain)" }
  ],
  "patientAssistancePrograms": [
    {
      "name": "Lilly Insulin Value Program",
      "incomeLimit": "Up to 500% FPL",
      "supply": "$35/month cap",
      "url": "https://insulinaffordability.com/"
    },
    {
      "name": "Novo Nordisk Patient Assistance",
      "incomeLimit": "Up to 400% FPL",
      "supply": "Free for income-qualified",
      "url": "https://novocare.com/"
    }
  ],
  "billingErrorsToCheck": [
    "Charged the inpatient rate for outpatient dosing",
    "Duplicate dose billing (same vial billed twice)",
    "Wrong J-code (J1815 vs J1817) inflating units",
    "Billed for full vial when only partial used"
  ],
  "factorsAffectingCost": [
    "Formulation (rapid-acting vs long-acting)",
    "Site of administration (hospital floor vs outpatient infusion center)",
    "Insurance coverage and deductible status",
    "Manufacturer patient assistance eligibility"
  ],
  "faqs": [
    { "q": "Why did the hospital charge so much for insulin?", "a": "..." },
    { "q": "What is the Medicare price for insulin in 2026?", "a": "..." },
    { "q": "How do I qualify for free insulin?", "a": "..." },
    { "q": "Can I dispute an inpatient insulin bill?", "a": "..." }
  ],
  "sources": [
    { "name": "CMS Medicare Part B ASP Pricing File (2026)", "url": "https://www.cms.gov/medicare/medicare-part-b-drug-average-sales-price" },
    { "name": "NeedyMeds Patient Assistance Database", "url": "https://needymeds.org/" }
  ],
  "relatedDrugs": ["ozempic-cost", "humalog-cost", "lantus-cost"]
}
```

## 4. Page structure

1. `<HubHero>` — H1, summary, `<LastVerified>`
2. `<QuickAnswer>` callout
3. **Pull-quote** — typically the markup multiplier ("16-40x markup")
4. **Pricing comparison table** — Medicare ASP / Retail / Inpatient charge columns
5. **HCPCS J-codes section** — the public codes, what to check on your bill
6. **Patient assistance programs table** — manufacturer PAP info with income limits and URLs
7. **Billing errors to check** — bullet list, inline link to analyzer
8. **What affects the cost**
9. `<FAQSection>` — 5-8 FAQs
10. `<CTACard>` — Analyzer
11. **Related drugs** internal-link grid
12. `<SourcesFooter>`

## 5. Schema markup

`@graph`:
- `MedicalWebPage`
- `Drug` (Schema.org type) — `name`, `nonProprietaryName`, `drugClass`, `code` (HCPCS only), nested `offers` for PAP programs
- `FAQPage`
- `BreadcrumbList`
- `Dataset` for the pricing table

## 6. AI optimization specifics

- **Markup multiplier as quotable line.** "Hospitals charge 16-40x the Medicare rate" is the viral angle. Lead with it.
- **PAP eligibility is high-intent value.** Make manufacturer income limits prominent and tabular.
- **Differentiate retail vs inpatient throughout.** AI engines confuse the two; we explicitly disambiguate.
- **Always link to GoodRx** for retail pricing context, NOT as a competitor — as a "if you're shopping retail, check GoodRx; this page is about hospital billing." Honest framing builds AI trust.
- **No medical advice.** "Talk to your doctor or pharmacist about alternative formulations" is the safe framing. Never recommend a specific drug or dose.

## 7. Sample pages to ship with template

5 pages covering different drug classes:
1. `/drug/insulin-cost` (chronic disease, PAP-heavy, multiple manufacturers)
2. `/drug/ozempic-cost` (trending, GLP-1, brand-only)
3. `/drug/epi-pen-cost` (acute, viral markup story)
4. `/drug/humira-cost` (biologic, very high markup)
5. `/drug/keytruda-cost` (oncology, J-code billing common)

## 8. Reserved slugs / conflict checks

Drug slug collisions:
- Common words to never use: `cost`, `price`, `drug`
- Slug format: lowercase, hyphenated, ends in `-cost`
- Collision check across `content/data/drugs/`

## 9. CTA routing

**Always `cta: "analyzer"`.** Drug pages are billing-focused.
