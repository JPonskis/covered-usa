# Template Spec — Q&A ("Does X cover Y")

**Reference:** [TEMPLATE_SYSTEM_SPEC.md](../TEMPLATE_SYSTEM_SPEC.md) for shared standards.

## 1. Purpose and target queries

Narrow Q&A pages that answer one specific question definitively. Highest-volume target is "does [program] cover [service]" — millions of these queries per year, narrow intent, perfect for AI citation.

**Example target queries:**
- "Does Medicare cover dental"
- "Does Medicaid cover therapy"
- "Does ACA cover pre-existing conditions"
- "Does Medicare cover Ozempic"
- "Does Medicaid cover bariatric surgery"
- "Does Medicare cover hearing aids"
- "Does CHIP cover braces"

## 2. URL pattern

`/does-[program]-cover-[service]`

Examples:
- `/does-medicare-cover-dental`
- `/does-medicaid-cover-therapy`
- `/does-aca-cover-pre-existing-conditions`
- `/does-medicare-cover-ozempic`
- `/does-medicaid-cover-bariatric-surgery`
- `/does-medicare-cover-hearing-aids`

## 3. Data file shape

`content/data/qa/[slug].json`:

```json
{
  "slug": "does-medicare-cover-dental",
  "type": "qa",
  "program": "Medicare",
  "service": "Dental",
  "primaryQuery": "Does Medicare cover dental",
  "title": "Does Medicare Cover Dental? (2026 Answer)",
  "description": "Original Medicare does not cover routine dental care. Some Medicare Advantage plans include limited dental coverage.",
  "h1": "Does Medicare Cover Dental? (2026)",
  "subhead": "Short answer: Original Medicare doesn't. Medicare Advantage might.",
  "quickAnswer": "As of 2026, Original Medicare (Parts A and B) does NOT cover routine dental care including cleanings, fillings, dentures, or tooth extractions. Medicare Advantage (Part C) plans often include limited dental coverage as a supplemental benefit, typically with an annual cap of $1,000-$5,000. Medicare may cover dental procedures that are medically necessary as part of another covered procedure (e.g., jaw reconstruction after an accident).",
  "lastUpdated": "2026-05-12",
  "lastVerified": "2026-05-12",
  "cta": "screener",
  "shortAnswer": "No (Original Medicare). Sometimes (Medicare Advantage).",
  "detailedAnswer": {
    "originalMedicare": {
      "covered": false,
      "exceptions": [
        "Dental procedures medically necessary for a covered medical treatment (e.g., jaw cancer surgery, organ transplant prep)",
        "Hospital-based dental services during inpatient admission for a medical condition"
      ],
      "notCovered": [
        "Routine cleanings and exams",
        "Fillings, crowns, root canals",
        "Dentures and partials",
        "Tooth extractions (in most circumstances)",
        "Orthodontia"
      ]
    },
    "medicareAdvantage": {
      "covered": "Varies by plan",
      "typicalCap": "$1,000-$5,000 annual",
      "commonInclusions": ["Cleanings 2x/year", "X-rays", "Basic fillings"],
      "commonExclusions": ["Major dental work (crowns, dentures) often capped or excluded", "Orthodontia"]
    }
  },
  "alternatives": [
    {
      "option": "Standalone dental insurance",
      "cost": "$20-50/mo",
      "fitFor": "Most Medicare beneficiaries who want comprehensive dental"
    },
    {
      "option": "Medicare Advantage plan with dental",
      "cost": "Varies",
      "fitFor": "Beneficiaries who want medical + dental in one plan"
    },
    {
      "option": "Dental discount plans",
      "cost": "$10-30/mo",
      "fitFor": "Pay-as-you-go users; not insurance, just discounts"
    },
    {
      "option": "Medicaid dental (if dual-eligible)",
      "cost": "Free or near-free",
      "fitFor": "Dual-eligible (Medicare + Medicaid) beneficiaries; coverage varies by state"
    }
  ],
  "faqs": [
    { "q": "Does Medicare Part B cover dental cleanings?", "a": "No. Cleanings, exams, and routine dental work are excluded from Original Medicare." },
    { "q": "Do Medicare Advantage plans cover dental in 2026?", "a": "Many do, but coverage varies. Typical plans cap dental at $1,000-$5,000 annually." },
    { "q": "Will Medicare ever cover dental?", "a": "Original Medicare has not expanded to cover dental as of 2026. Several legislative proposals to add dental coverage have not passed." },
    { "q": "Can I get free dental care on Medicare?", "a": "Possibly, if you also qualify for Medicaid (dual-eligible). Some states cover dental for Medicaid enrollees." }
  ],
  "sources": [
    { "name": "Medicare.gov — Dental Services", "url": "https://www.medicare.gov/coverage/dental-services" },
    { "name": "KFF — Medicare Advantage Dental Coverage 2026", "url": "https://kff.org/..." }
  ],
  "relatedQuestions": ["does-medicare-cover-vision", "does-medicare-cover-hearing-aids", "does-medicaid-cover-dental"]
}
```

## 4. Page structure

Tighter than other templates — Q&A pages stay focused.

1. `<HubHero>` — H1 is the literal question, summary is the literal short answer
2. **Bold short answer** — "Short answer: No (Original Medicare). Sometimes (Medicare Advantage)." prominent, large type
3. `<QuickAnswer>` callout — full nuanced answer
4. **Detailed breakdown** — sections for each scenario (Original Medicare vs Medicare Advantage)
5. **Alternatives** — `<DataTable>` for alternative coverage options
6. `<FAQSection>` — 4-6 FAQs (often deeper variations of the main question)
7. `<CTACard>` — Screener
8. **Related questions** internal-link grid
9. `<SourcesFooter>`

Target length: 700-1,000 words. Q&A pages don't need to be long — they need to be definitive.

## 5. Schema markup

`@graph`:
- `MedicalWebPage`
- `QAPage` — `mainEntity` is a `Question` with `acceptedAnswer` (the canonical short answer)
- `FAQPage` (separate from the QAPage — handles supplementary FAQs)
- `BreadcrumbList`

**Note: `QAPage` is different from `FAQPage`.** QAPage = one main question is the focus of the page. FAQPage = multiple related questions. Use both: QAPage for the main question (the page's reason for existing), FAQPage for the secondary questions in the FAQ section.

## 6. AI optimization specifics

- **Short answer in 1-2 sentences at the top of the body.** AI engines often pull the literal short answer as the snippet. Make it bold and impossible to miss.
- **"Yes / No / Sometimes" framing.** Q&A pages benefit from explicit binary or trinary framing at the top. "Yes, but only if X." "No, unless X." Clear.
- **Coverage / exception breakdown** is the heart of these pages. Most Q&A queries are nuanced ("does Medicare cover dental" → no for routine, yes for medically necessary). Capture both halves.
- **Alternatives section** for "no" answers. If the answer is "no, X doesn't cover Y," AI engines also need to know what users CAN do instead.

## 7. Sample pages to ship with template

5 high-volume Q&A pages:
1. `/does-medicare-cover-dental`
2. `/does-medicaid-cover-therapy`
3. `/does-aca-cover-pre-existing-conditions`
4. `/does-medicare-cover-ozempic` (high trending volume)
5. `/does-medicaid-cover-bariatric-surgery`

## 8. Reserved slugs / conflict checks

- Slug format: `does-[program-slug]-cover-[service-slug]`
- Program slugs: `medicare`, `medicaid`, `aca`, `chip`, `medicare-advantage`, `original-medicare`, `medigap`
- Service slugs: hyphenated, lowercase
- Collision check across `content/data/qa/`.
- A different program × different service can share a service slug (no collision).

## 9. CTA routing

Default `cta: "screener"` — most Q&A queries are about coverage / eligibility.

Override `cta: "analyzer"` when:
- The question is billing-adjacent (e.g., "does my hospital bill have to include CPT codes")
- The "no" answer's main alternative is the analyzer (e.g., "does Medicaid cover [X]?" → maybe analyzer if user already has a bill)

CTA card copy: "Not sure what you qualify for? Check in 2 minutes — free, no signup."
