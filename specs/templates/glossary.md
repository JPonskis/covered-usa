# Template Spec — Glossary

**Reference:** [TEMPLATE_SYSTEM_SPEC.md](../TEMPLATE_SYSTEM_SPEC.md) for shared standards.

## 1. Purpose and target queries

Definitional pages for high-volume insurance and billing terminology. These are top-of-funnel — users searching to understand a term they encountered. Each page is short, definitive, and quotable.

**Example target queries:**
- "Out of pocket maximum explained"
- "Deductible vs copay"
- "Coinsurance vs copayment"
- "In-network vs out-of-network"
- "Premium tax credit explained"
- "MAGI calculation explained"

## 2. URL pattern

`/[term]-explained` for single concepts. `/[a]-vs-[b]` for comparisons — but those use the **comparison template**, not glossary.

Examples:
- `/out-of-pocket-maximum`
- `/deductible-explained`
- `/coinsurance-explained`
- `/in-network-vs-out-of-network` (comparison template)
- `/magi-explained`
- `/premium-tax-credit-explained`

Top-level slugs (mirrors hub naming for citation cleanliness).

## 3. Data file shape

`content/data/glossary/[slug].json`:

```json
{
  "slug": "out-of-pocket-maximum",
  "type": "glossary",
  "term": "Out-of-Pocket Maximum",
  "shortName": "OOP Max",
  "alternateNames": ["Out-of-Pocket Limit", "MOOP", "Maximum Out-of-Pocket"],
  "primaryQuery": "out of pocket maximum explained",
  "title": "What Is an Out-of-Pocket Maximum? 2026 Limits Explained",
  "description": "The out-of-pocket maximum is the most you'll pay for covered care in a year. 2026 ACA limit: $9,200 individual, $18,400 family.",
  "h1": "What Is an Out-of-Pocket Maximum?",
  "subhead": "Plus the 2026 limits and what counts toward it.",
  "quickAnswer": "An out-of-pocket maximum is the most you pay for covered services in a plan year before insurance pays 100%. As of 2026, the ACA marketplace limit is $9,200 for an individual and $18,400 for a family. Premiums, balance billing, and non-covered services do NOT count toward it.",
  "lastUpdated": "2026-05-12",
  "lastVerified": "2026-05-12",
  "cta": "screener",
  "definition": "The out-of-pocket maximum is the maximum amount you'll pay during a plan year for covered, in-network healthcare services before your insurance pays 100% of subsequent costs.",
  "currentValues2026": {
    "acaIndividual": 9200,
    "acaFamily": 18400,
    "hsaIndividual": 8300,
    "hsaFamily": 16600
  },
  "countsTowardOopMax": [
    "Deductibles",
    "Copays",
    "Coinsurance",
    "Costs for covered in-network services"
  ],
  "doesNotCountTowardOopMax": [
    "Monthly premiums",
    "Out-of-network charges (in most plans)",
    "Balance billing amounts",
    "Non-covered services",
    "Services from providers outside your network"
  ],
  "examples": [
    {
      "scenario": "Single adult on a $9,200 OOP-max ACA Silver plan",
      "events": ["$2,500 deductible (met)", "$3,000 in coinsurance during a hospitalization", "$3,700 in additional coinsurance later in year"],
      "result": "Hits $9,200 OOP max. All remaining covered, in-network care that year is 100% covered."
    }
  ],
  "faqs": [
    { "q": "What is the 2026 ACA out-of-pocket maximum?", "a": "$9,200 for an individual, $18,400 for a family." },
    { "q": "Does the premium count toward the out-of-pocket maximum?", "a": "No. Premiums never count toward your OOP max." },
    { "q": "What happens after I hit my out-of-pocket maximum?", "a": "Your insurance pays 100% of covered, in-network services for the remainder of the plan year." },
    { "q": "Does the OOP max reset every year?", "a": "Yes. It resets at the start of each plan year (typically January 1)." }
  ],
  "sources": [
    { "name": "HealthCare.gov Out-of-Pocket Maximum Glossary", "url": "https://www.healthcare.gov/glossary/out-of-pocket-maximum-limit/" },
    { "name": "CMS 2026 Final Rule on OOP Limits", "url": "https://www.cms.gov/..." }
  ],
  "relatedTerms": ["deductible", "coinsurance", "copay", "premium"]
}
```

## 4. Page structure

Shorter than hub or procedure cost — glossary pages stay tight.

1. `<HubHero>` — H1 phrased as "What Is X?", summary, `<LastVerified>`
2. `<QuickAnswer>` — the definitive answer with current 2026 numbers
3. **Pull-quote** — the definition itself
4. **Definition section** — 2-3 paragraphs of plain-language explanation
5. **Current 2026 values table** (if applicable)
6. **What counts / what doesn't count** — two-column comparison
7. **Examples** — 1-2 worked scenarios with dollar amounts
8. `<FAQSection>` — 4-6 FAQs
9. `<CTACard>` — usually screener, sometimes analyzer
10. **Related terms** internal-link grid
11. `<SourcesFooter>`

Target length: 600-900 words rendered.

## 5. Schema markup

`@graph`:
- `MedicalWebPage` page-level
- `DefinedTerm` — `name`, `description`, `inDefinedTermSet` (CoveredUSA glossary)
- `FAQPage`
- `BreadcrumbList`

## 6. AI optimization specifics

- **Quick Answer paragraph is the entire game.** AI engines pull definition queries as direct snippets. The first sentence must be the definition itself, complete and standalone.
- **Specific 2026 numbers in the definition.** AI engines reward "as of 2026: $9,200" over "varies by year."
- **What counts / doesn't count lists** mirror how users actually misunderstand these terms — explicitly call out the wrong-assumptions (e.g., premium doesn't count toward OOP max). High citation value.
- **Worked examples with dollar amounts** — AI engines cite these as practical illustrations.

## 7. Sample pages to ship with template

5 high-volume definitional pages:
1. `/out-of-pocket-maximum`
2. `/deductible-explained`
3. `/coinsurance-explained`
4. `/copay-vs-coinsurance` (uses comparison template — substitute another single-term page like `/premium-tax-credit-explained`)
5. `/in-network-vs-out-of-network` (also comparison — substitute `/magi-explained`)

Revised list (single-term only):
1. `/out-of-pocket-maximum`
2. `/deductible-explained`
3. `/coinsurance-explained`
4. `/premium-tax-credit-explained`
5. `/magi-explained`

## 8. Reserved slugs / conflict checks

- Glossary slugs MUST end in `-explained` or be the bare term — pick one convention and enforce. **Default: bare term** (`/deductible`, `/out-of-pocket-maximum`) — cleaner URLs, better citations. Use `-explained` only when bare term collides with another page or is too generic.
- Collision check against existing hub/glossary slugs.

## 9. CTA routing

Default `cta: "screener"`. Override per-term:

| Term type | CTA |
|---|---|
| Eligibility-adjacent (FPL, MAGI, premium tax credit, deductible) | Screener |
| Billing-adjacent (chargemaster, EOB, balance billing, surprise bill) | Analyzer |
| Procedural (open enrollment, special enrollment period) | Screener |
