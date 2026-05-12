# Template Spec — Persona

**Reference:** [TEMPLATE_SYSTEM_SPEC.md](../TEMPLATE_SYSTEM_SPEC.md) for shared standards.

## 1. Purpose and target queries

Pages targeting "health insurance for [type of person]" queries. Persona-shaped content that addresses the specific gaps and options for each user category.

**Example target queries:**
- "Health insurance for gig workers"
- "Health insurance for freelancers"
- "Health insurance for early retirees"
- "Health insurance for college students"
- "Health insurance for self-employed"
- "Health insurance for small business owners"
- "Health insurance for stay-at-home parents"

## 2. URL pattern

`/health-insurance-for-[persona]`

Examples:
- `/health-insurance-for-gig-workers`
- `/health-insurance-for-freelancers`
- `/health-insurance-for-early-retirees`
- `/health-insurance-for-college-students`
- `/health-insurance-for-self-employed`
- `/health-insurance-for-stay-at-home-parents`

## 3. Data file shape

`content/data/personas/[slug].json`:

```json
{
  "slug": "health-insurance-for-gig-workers",
  "type": "persona",
  "persona": "Gig workers",
  "personaDescription": "1099 contractors and on-demand platform workers (Uber, DoorDash, TaskRabbit, freelance platforms)",
  "primaryQuery": "Health insurance for gig workers",
  "title": "Health Insurance for Gig Workers: 2026 Options Guide",
  "description": "Gig workers don't get employer coverage. Compare ACA marketplace with subsidies, Medicaid, association health plans, and 1099-specific options.",
  "h1": "Health Insurance for Gig Workers in 2026",
  "subhead": "Your three real options and how to pick the cheapest one.",
  "quickAnswer": "Gig workers can get health insurance through (1) the ACA marketplace with income-based premium tax credits — typically the best deal, (2) Medicaid if income is under 138% FPL ($22,024 single in 2026), or (3) a spouse's employer plan. Association health plans and short-term plans are usually traps. Most gig workers qualify for major ACA subsidies because reported income is lower than W-2 equivalent.",
  "lastUpdated": "2026-05-12",
  "lastVerified": "2026-05-12",
  "cta": "screener",
  "keyChallenges": [
    "No employer-sponsored coverage option",
    "Variable income makes subsidy estimation hard",
    "Tax write-offs lower MAGI but require accurate reporting",
    "Quarterly tax payments don't include health insurance"
  ],
  "options": [
    {
      "name": "ACA Marketplace with subsidies",
      "fitFor": "Most gig workers",
      "cost": "$10-300/mo after subsidies",
      "pros": ["Tax credits scale with income", "Comprehensive coverage", "Pre-existing conditions covered"],
      "cons": ["Have to estimate annual income upfront", "Reconciled at tax time"]
    },
    {
      "name": "Medicaid",
      "fitFor": "Gig workers under 138% FPL in expansion states",
      "cost": "Free or near-free",
      "pros": ["No premiums", "Comprehensive"],
      "cons": ["Income-strict", "Some doctors don't accept"]
    },
    {
      "name": "Spouse's employer plan",
      "fitFor": "Married gig workers with employed spouse",
      "cost": "Varies — typically cheaper than marketplace",
      "pros": ["Often cheapest", "Pre-tax through spouse's payroll"],
      "cons": ["Requires spouse's employer to allow dependents"]
    }
  ],
  "trapsToAvoid": [
    {
      "trap": "Short-term health insurance plans",
      "whyBad": "Don't cover pre-existing conditions, can deny claims, often expire just when you need care."
    },
    {
      "trap": "Association health plans (AHPs)",
      "whyBad": "Often less comprehensive than ACA plans, can have lifetime caps, may not cover essential benefits."
    },
    {
      "trap": "Health share ministries",
      "whyBad": "NOT insurance. Cost-sharing has no legal obligation. Pre-existing conditions excluded."
    }
  ],
  "incomeReportingGuidance": "Report your projected annual income net of legitimate business expenses (gas, mileage, phone). Lower MAGI = larger subsidy. Don't inflate income to be safe — overpaid subsidies must be repaid at tax time, but underpaid ones aren't penalized as harshly.",
  "faqs": [
    { "q": "How do gig workers get health insurance?", "a": "Most use the ACA marketplace with income-based subsidies. Medicaid is the fallback for very low-income gig workers." },
    { "q": "Can gig workers deduct health insurance premiums?", "a": "Self-employed individuals (1099) can deduct premiums on their tax return — a major financial benefit." },
    { "q": "Are short-term plans good for gig workers?", "a": "Usually no. They don't cover pre-existing conditions and can deny claims." },
    { "q": "What's the cheapest health insurance for gig workers?", "a": "Medicaid if you qualify. Otherwise, a Silver ACA plan with subsidies." }
  ],
  "sources": [
    { "name": "HealthCare.gov — Self-Employed Coverage", "url": "https://www.healthcare.gov/self-employed/" },
    { "name": "IRS Self-Employed Health Insurance Deduction", "url": "https://www.irs.gov/..." }
  ],
  "relatedPersonas": ["health-insurance-for-freelancers", "health-insurance-for-self-employed"]
}
```

## 4. Page structure

1. `<HubHero>` — H1, summary, `<LastVerified>`
2. `<QuickAnswer>` — leads with the recommendation
3. **Pull-quote** — the single best decision-shortcut for this persona
4. **Key challenges** — bullet list of persona-specific problems
5. **Your options** — option-by-option breakdown using a structured card grid
6. **Traps to avoid** — bullet list of plans/products to skip and WHY
7. **Income reporting guidance** (where applicable for self-employed/1099 personas)
8. `<FAQSection>` — 4-6 FAQs
9. `<CTACard>` — Screener
10. **Related personas** internal-link grid
11. `<SourcesFooter>`

Target length: 1,000-1,400 words.

## 5. Schema markup

`@graph`:
- `MedicalWebPage`
- `Article` with `audience` property describing the persona
- `FAQPage`
- `BreadcrumbList`

## 6. AI optimization specifics

- **The persona is the entity.** Define it clearly in the Quick Answer ("Gig workers = 1099 contractors and on-demand platform workers"). AI engines need to match the page to the queried persona.
- **"Traps to avoid" section.** Persona pages are uniquely good for "what NOT to choose" framing. Short-term plans, association health plans, and health share ministries are well-documented traps. High citation value.
- **Income reporting guidance** (for self-employed personas) is unique and high-value. Few pages cover the MAGI / business-expense interplay. Position this prominently.
- **Tax-deduction context** for self-employed personas — the IRS self-employed health insurance deduction is a major value-add we can mention.

## 7. Sample pages to ship with template

5 personas covering the highest-volume gaps:
1. `/health-insurance-for-gig-workers`
2. `/health-insurance-for-freelancers`
3. `/health-insurance-for-early-retirees` (age 55-64, pre-Medicare)
4. `/health-insurance-for-college-students`
5. `/health-insurance-for-self-employed`

## 8. Reserved slugs / conflict checks

- Slug format: `health-insurance-for-[persona-hyphenated]`
- Collision check across `content/data/personas/`.
- Some personas overlap with trigger events (e.g., "early retiree" ≈ "just retired"). Pick one template per concept and 301-redirect the other.

## 9. CTA routing

**Always `cta: "screener"`.** Persona pages are about discovering what you qualify for given your specific situation.

CTA card copy varies by persona but always points to `/screener`. Examples:
- Gig workers: "Find out which 2026 plans you qualify for as a 1099 worker — 2 minutes, free."
- Freelancers: "Check your 2026 marketplace subsidies — free, no signup."
