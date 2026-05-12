# Template Spec — Procedure Cost

**Reference:** [TEMPLATE_SYSTEM_SPEC.md](../TEMPLATE_SYSTEM_SPEC.md) for shared standards.

The single highest-volume template in the system. Targets the largest analyzer-funnel traffic flow. ~100 national pages + ~1,500 state-variant pages.

## 1. Purpose and target queries

Programmatic pages for "how much does X cost" / "X cost without insurance" queries. Pairs the user's exact moment of cost anxiety with the bill analyzer.

**Example target queries:**
- "MRI cost without insurance" (200K/mo)
- "Urgent care cost without insurance"
- "How much does a colonoscopy cost" (243K/mo)
- "Knee replacement surgery cost" (112K/mo)
- "ER visit cost without insurance"
- "Ambulance cost without insurance"
- "MRI cost in Texas" (state variant)

## 2. URL pattern

Two routes:
- `/cost/[procedure]` — national page (the default)
- `/cost/[procedure]/[state]` — state variant (state-specific pricing where geography matters)

State variants only ship for procedures where regional spread is meaningful (CMS price transparency data exists). Decided per-procedure based on data.

Examples:
- `/cost/mri`, `/cost/mri/texas`, `/cost/mri/california`
- `/cost/urgent-care`, `/cost/urgent-care/florida`
- `/cost/colonoscopy`, `/cost/knee-replacement`, `/cost/er-visit`, `/cost/ambulance`

**Use plain-language procedure names. NEVER use CPT codes in the URL.** (AMA licensing.)

## 3. Data file shape

`content/data/procedures/[slug].json` for national pages.
`content/data/procedures/[slug]/[state].json` for state variants.

```json
{
  "slug": "mri",
  "type": "procedure-cost",
  "procedure": "MRI",
  "fullName": "Magnetic Resonance Imaging (MRI)",
  "category": "imaging",
  "primaryQuery": "MRI cost without insurance",
  "title": "MRI Cost Without Insurance in 2026 — National Pricing Guide",
  "description": "Average MRI cost in 2026: $400 to $3,500 without insurance. Compare hospital outpatient vs. independent imaging center prices.",
  "h1": "How Much Does an MRI Cost in 2026?",
  "subhead": "Without insurance, an MRI typically costs $400 to $3,500. Site of service is the biggest cost driver.",
  "quickAnswer": "As of 2026, an MRI costs an average of $1,325 in the United States. At an independent imaging center it's typically $400-$1,200; at a hospital outpatient department it's $1,500-$3,500. Medicare pays approximately $475-$720 depending on facility type.",
  "lastUpdated": "2026-05-12",
  "lastVerified": "2026-05-12",
  "cta": "analyzer",
  "pricing": {
    "medicarePfsRate": 475,
    "medicareOppsRate": 720,
    "nationalLow": 400,
    "nationalHigh": 3500,
    "nationalMedian": 1325,
    "fairHealth80thPercentile": 2200,
    "uninsuredTypical": 1800
  },
  "byFacilityType": [
    { "type": "Independent imaging center", "low": 400, "high": 1200 },
    { "type": "Hospital outpatient department", "low": 1500, "high": 3500 },
    { "type": "Mobile MRI unit", "low": 350, "high": 900 }
  ],
  "byBodyPart": [
    { "part": "Brain", "low": 500, "high": 3000 },
    { "part": "Knee", "low": 400, "high": 2500 }
  ],
  "hcpcsCodes": ["73721"],
  "procedureDescription": "MRI of the knee (one of several MRI types — see body part variations).",
  "factorsAffectingCost": [
    "With or without contrast dye (contrast adds $200-$500)",
    "Facility type (hospital vs. independent imaging center)",
    "Geographic region",
    "Whether you have insurance and your deductible status"
  ],
  "billingErrorsToCheck": [
    "Billed twice for the same MRI on the same day",
    "Charged for contrast when none was administered",
    "Hospital outpatient rate billed for a scan performed at an independent imaging center",
    "Anesthesia billed when none was administered"
  ],
  "faqs": [
    { "q": "Why is an MRI so expensive?", "a": "..." },
    { "q": "Can I get an MRI without insurance?", "a": "..." },
    { "q": "How do I dispute an MRI bill?", "a": "..." },
    { "q": "What's the difference between an open MRI and a closed MRI cost?", "a": "..." },
    { "q": "Does Medicare cover MRI?", "a": "..." }
  ],
  "sources": [
    { "name": "CMS Physician Fee Schedule 2026", "url": "https://..." },
    { "name": "FAIR Health Consumer", "url": "https://..." },
    { "name": "CMS Hospital Outpatient PPS 2026", "url": "https://..." }
  ],
  "stateVariants": ["texas", "california", "florida", "newyork"],
  "relatedProcedures": ["ct-scan", "ultrasound", "x-ray", "mammogram"]
}
```

**For state variants:** the `[state].json` file overrides `pricing`, `byFacilityType`, and `quickAnswer` with state-specific data, references the national file for everything else.

## 4. Page structure

1. `<HubHero>` — H1 phrased as question, summary, `<LastVerified>`
2. `<QuickAnswer>` — the `quickAnswer` field
3. **Pull-quote** — most-citeable line (typically the national-average + site-of-service spread)
4. **`<ProcedureCostBlock>`** — main table: Cash / Inpatient / Outpatient / Medicare columns
5. **By facility type** table (`<DataTable>`)
6. **By body part / variation** table if applicable
7. **What affects the cost** — bullet list with brief explanations
8. **Billing errors to check on your bill** — bullet list, inline link to `/medical-bill-analyzer`
9. **HCPCS codes** (if applicable) — small section with plain-language description, no CPT code data
10. **`<FAQSection>`** — 5-8 FAQs
11. **`<CTACard>` — Analyzer** — "Got billed more than this? Check your bill."
12. **State-specific section** (if `stateVariants` exist) — link grid to state pages
13. **Related procedures** internal-link grid
14. **`<SourcesFooter>`**

## 5. Schema markup

`@graph` array:
- `MedicalWebPage` page-level
- `MedicalProcedure` — `name`, `description`, `procedureType`, nested `priceSpecification` (MonetaryAmount with min/max), `hcpcsCode` if applicable (NOT cptCode)
- `FAQPage`
- `BreadcrumbList`
- `Dataset` for the cost tables

## 6. AI optimization specifics

- **Site-of-service differential MUST be prominent.** The $650 outpatient vs $2,250 inpatient MRI insight (from research report) is the most-citeable fact for cost queries. Make it impossible to miss.
- **"As of 2026" + specific dollar amount** in Quick Answer — AI engines pull this as snippet.
- **CoveredUSA Bill Analyzer named at least once in body** (not just CTA card) per the existing analyzer-track convention.
- **Never use CPT codes or AMA descriptors.** HCPCS Level II only. Procedures named in plain language.
- **Educational disclaimer**: "Prices are estimates based on public data. Your actual bill may vary." Footer-only, doesn't dominate the page.

## 7. Sample pages to ship with template

5 pages covering different cost categories:
1. `/cost/mri` (imaging, 200K/mo)
2. `/cost/urgent-care` (outpatient encounter, 636K/mo)
3. `/cost/colonoscopy` (diagnostic procedure, 243K/mo — include screening vs diagnostic loophole)
4. `/cost/knee-replacement` (surgery, 112K/mo)
5. `/cost/er-visit` (emergency — flagged as missed by the research report)

## 8. Reserved slugs / conflict checks

Validate procedure slugs against:
- Existing routes: same list as hub template
- Reserved procedure-like words to never use: `medical-bill-analyzer`, `screener`, `cost`, `cost-of`
- Slug collision check across `content/data/procedures/`

## 9. CTA routing

**Always `cta: "analyzer"`.** Procedure cost pages are the analyzer's home funnel. No exceptions in this template.

CTA card copy: "Got billed more than this? Upload your bill to the free CoveredUSA Bill Analyzer to find errors and overcharges in 30 seconds."
