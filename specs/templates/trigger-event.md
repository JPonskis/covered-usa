# Template Spec — Trigger Event

**Reference:** [TEMPLATE_SYSTEM_SPEC.md](../TEMPLATE_SYSTEM_SPEC.md) for shared standards.

## 1. Purpose and target queries

Life-event pages that catch users at the exact moment a major change creates a healthcare-coverage need. Extreme high-intent traffic.

**Example target queries:**
- "Just lost my job, need health insurance"
- "Aging off parents plan at 26"
- "Just had a baby, newborn coverage"
- "Just retired, Medicare or marketplace"
- "Just got divorced, health insurance"
- "Just moved states, health insurance"
- "Just turned 65, Medicare enrollment"

## 2. URL pattern

`/[event-phrase]-health-insurance` or `/[event-phrase]-coverage`

Examples:
- `/just-lost-job-health-insurance`
- `/aging-off-parents-plan-26`
- `/just-had-a-baby-coverage`
- `/just-retired-coverage`
- `/just-moved-states-health-insurance`
- `/turning-65-medicare-enrollment`
- `/just-got-divorced-health-insurance`

## 3. Data file shape

`content/data/trigger-events/[slug].json`:

```json
{
  "slug": "just-lost-job-health-insurance",
  "type": "trigger-event",
  "event": "Job loss",
  "eventDescription": "Lost or left a job that provided health insurance",
  "primaryQuery": "Lost job need health insurance",
  "title": "Just Lost Your Job? Health Insurance Options in 2026",
  "description": "A 60-day Special Enrollment Period kicks in when you lose job-based coverage. Compare COBRA, ACA marketplace subsidies, and Medicaid.",
  "h1": "Just Lost Your Job? Here Are Your Health Insurance Options",
  "subhead": "You have 60 days to enroll in coverage after losing job-based insurance.",
  "quickAnswer": "When you lose job-based health insurance, you trigger a 60-day Special Enrollment Period. Your three main options are: (1) ACA marketplace plan with subsidies — usually the cheapest, (2) COBRA continuation — keeps your old plan at full premium, often expensive, or (3) Medicaid if your new income qualifies. Most people in this situation qualify for major subsidies.",
  "lastUpdated": "2026-05-12",
  "lastVerified": "2026-05-12",
  "cta": "screener",
  "urgency": "60 days from job-loss date",
  "steps": [
    { "step": 1, "name": "Calculate your new household income", "description": "Use only what you'll actually earn going forward. If you'll be on unemployment, count that. ACA subsidies are based on projected annual income." },
    { "step": 2, "name": "Check if you qualify for Medicaid", "description": "In expansion states, anyone under 138% FPL qualifies. As of 2026 that's $22,024 single or $45,540 for a family of 4." },
    { "step": 3, "name": "If not Medicaid, compare ACA marketplace plans", "description": "Use the Special Enrollment Period for 60 days. Most people qualify for premium tax credits that make Silver plans $10-100/month." },
    { "step": 4, "name": "Consider COBRA as a fallback only", "description": "COBRA charges 102% of the full premium (employer + your share). Often $700-$2,000/month. Only worth it if you have ongoing treatment with a specific provider not in ACA networks." },
    { "step": 5, "name": "Enroll within 60 days", "description": "If you miss the SEP window, you may have to wait until November open enrollment unless another qualifying event occurs." }
  ],
  "optionsComparison": [
    { "option": "ACA Marketplace", "cost": "$10-300/mo (with subsidies)", "bestFor": "Most people losing job coverage", "deadline": "60-day SEP" },
    { "option": "Medicaid", "cost": "Free or near-free", "bestFor": "Income under 138% FPL", "deadline": "Year-round" },
    { "option": "COBRA", "cost": "$500-2,000+/mo", "bestFor": "Need to keep current providers/treatment", "deadline": "60 days from loss" }
  ],
  "commonMistakes": [
    "Defaulting to COBRA without comparing — usually much more expensive than ACA",
    "Reporting your old salary instead of projected income (misses subsidies)",
    "Missing the 60-day window and waiting until open enrollment"
  ],
  "faqs": [
    { "q": "How long do I have to get health insurance after losing my job?", "a": "60 days from your last day of coverage." },
    { "q": "Is COBRA worth it?", "a": "Usually no. ACA subsidies make marketplace plans cheaper than COBRA's 102% premium charge." },
    { "q": "Can I get Medicaid if I just lost my job?", "a": "Yes, if your new household income is under 138% FPL in expansion states (~$22,024 single in 2026)." },
    { "q": "Does unemployment income count toward ACA subsidy calculation?", "a": "Yes. Include it in your projected annual income." }
  ],
  "sources": [
    { "name": "HealthCare.gov — Lost Coverage Special Enrollment Period", "url": "https://www.healthcare.gov/screener/" },
    { "name": "Medicaid.gov", "url": "https://www.medicaid.gov/" }
  ],
  "relatedEvents": ["aging-off-parents-plan-26", "just-got-divorced-health-insurance"]
}
```

## 4. Page structure

1. `<HubHero>` — H1 phrased as the event ("Just Lost Your Job?"), summary, `<LastVerified>`
2. **Urgency callout** — "You have 60 days from [event] to enroll" (prominent, time-sensitive)
3. `<QuickAnswer>` callout
4. **Pull-quote** — most critical decision point
5. **`<StepList>`** — numbered steps to take, rendered with HowToStep schema
6. **Options comparison** — `<DataTable>` rendering `optionsComparison`
7. **Common mistakes** — bullet list of what users get wrong
8. `<FAQSection>` — 4-6 FAQs
9. `<CTACard>` — Screener ("Check which option you qualify for in 2 minutes")
10. **Related life events** internal-link grid
11. `<SourcesFooter>`

Target length: 900-1,300 words.

## 5. Schema markup

`@graph`:
- `MedicalWebPage`
- `HowTo` — `name`, `description`, `step` array (each step → `HowToStep`)
- `FAQPage`
- `BreadcrumbList`

## 6. AI optimization specifics

- **Urgency framing in title and Quick Answer.** "60 days" is the most-citeable fact for job-loss queries. Lead with it.
- **Step-by-step HowTo schema** is uniquely well-suited to trigger-event pages. AI engines pull these as ordered instruction sets.
- **Persona-specific income examples.** A user landing here has just lost income — show them concrete subsidy math at lower incomes.
- **Common mistakes section.** AI engines like "what NOT to do" framing for high-intent decisions. High citation rate.

## 7. Sample pages to ship with template

5 trigger events spanning life stages:
1. `/just-lost-job-health-insurance`
2. `/aging-off-parents-plan-26`
3. `/just-had-a-baby-coverage`
4. `/just-retired-coverage` (Medicare-or-marketplace decision)
5. `/just-moved-states-health-insurance`

## 8. Reserved slugs / conflict checks

- Slug format: `just-[event]-health-insurance` OR `[event]-[clarifier]`. Pick one per page.
- Collision check across `content/data/trigger-events/` and against existing routes.

## 9. CTA routing

**Always `cta: "screener"`.** Trigger events are the screener's home turf — user needs to find what they qualify for under their NEW circumstances.

CTA card copy: "Check which 2026 plans you qualify for in 2 minutes — free, no signup."
