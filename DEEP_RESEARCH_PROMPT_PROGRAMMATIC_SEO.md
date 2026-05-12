# CoveredUSA Programmatic SEO — High-Volume Page Research

Paste everything below the dividing line into Gemini Deep Research (or Perplexity Deep Research). The prompt is self-contained.

---

## PROMPT

I run a US healthcare site called CoveredUSA (coveredusa.org). It has two free tools:

1. **Eligibility screener** at `/screener` — helps uninsured Americans figure out if they qualify for ACA Marketplace subsidies, Medicaid, Medicare, Medicare Savings Programs, CHIP, or VA Healthcare.
2. **Medical Bill Analyzer** at `/medical-bill-analyzer` — user uploads a hospital bill, the tool compares each line to Medicare rates, flags billing errors via NCCI rules, checks 501(r) charity care eligibility, and generates a dispute letter.

I already run a working daily blog SEO pipeline (5+5 hand-written articles per day, half funneling to the screener, half to the analyzer). That track is fine.

**This research is for a different layer: high-volume programmatic product pages.** Not blog posts. Database-backed dynamic pages outside `/blog`, rendered from structured data files, with rich schema.org markup, designed to win Bing organic and get cited by AI search engines (ChatGPT, Perplexity, Copilot, Gemini AI Mode).

The bet: comprehensive data-heavy pages on high-volume keywords (the "FPL chart by state" pattern) beat scattered niche articles. I want the top of the funnel where the biggest healthcare-cost and eligibility-data searches happen.

### What I already have (do NOT re-research)

- General GEO/AI-citation best practices (FAQ schema, direct-answer-first, DR-63 threshold, etc.)
- The Medical Bill Analyzer's keyword universe (billing codes, NCCI rules, charity care, hospital-specific disputes) — covered by a separate research run
- Generic Medicaid/ACA/Medicare eligibility article ideas — those are blog-track territory

This research should focus on **programmatic page opportunities**: high-volume queries that map to ONE comprehensive data page (not narrative articles).

### Strategic framing — go where volume is

I am optimizing for Bing + AI search, not Google-first. The architectural insight I want you to apply throughout:

- A SINGLE comprehensive page like `/medicaid-income-limits-2026` with a sortable 50-state table ranks for hundreds of long-tail variations ("Texas Medicaid income limits", "Florida Medicaid income limits", "Medicaid income limits 2026 by state", etc.) better than 50 thin per-state pages.
- AI engines cite **density and structure** (clean tables, FAQ schema, specific numbers, "as of 2026" markers) more than raw word count.
- Look for the healthcare equivalents of "FPL chart by state" — single hub pages that aggregate huge amounts of comparable data.

---

## Required deliverables

Five sections. Each must include specific volume numbers with sourcing, not vibes.

### Section 1 — Procedure cost research (THE BIG ONE)

A ranked table of the **top 100 healthcare procedure / service / event cost queries** in the United States by monthly search volume.

For each row, provide:

| Column | What |
|---|---|
| Procedure / service | e.g. "MRI", "ER visit", "ambulance ride", "colonoscopy" |
| Primary query | The exact highest-volume phrasing (e.g. "how much does an MRI cost") |
| Monthly US search volume | Number + tool source (Ahrefs, SEMrush, Keywords Everywhere, etc.) |
| Top 5 long-tail variants | With volume each |
| Medicare PFS rate (2026) | If applicable |
| Medicare Hospital Outpatient PPS rate (2026) | If applicable |
| FAIR Health Consumer 80th percentile range | National and where regional variation matters |
| Average chargemaster range | From CMS Hospital Price Transparency data |
| Top 3 currently ranking pages on Bing | URLs + what they do well + what they're missing |
| Suggested page angle | One line on what would beat the incumbent |

**Coverage requirements:**
- Cover imaging (MRI, CT, ultrasound, X-ray, mammogram, PET scan), diagnostic procedures (colonoscopy, endoscopy, biopsy), ER and urgent care, ambulance (ground and air), surgical procedures (knee replacement, hip replacement, gallbladder, hernia, C-section, vaginal delivery, appendectomy, cataract), labor/delivery, NICU, dental, mental health (therapy session, psychiatric admission), substance use treatment, dialysis, chemotherapy, radiation, physical therapy
- Include "common life event" queries: cost to have a baby, cost of broken arm, cost of stitches, cost of an MRI without insurance
- Include high-volume "without insurance" variants ("MRI cost without insurance" etc.)

**Stretch deliverable:** Top 10 procedures by regional spread (where geography matters most for pricing). Useful for deciding if we need `/cost/[procedure]/[state]` sub-pages or one national page.

### Section 2 — Healthcare data hub research

A ranked table of the **top 30 "data hub" queries** — the high-volume, data-heavy, single-page-wins-many-queries pattern.

Categories to cover:
- Income limits: Medicaid (with state variation), ACA Marketplace subsidies, CHIP, Medicare Savings Programs (QMB/SLMB/QI)
- Federal Poverty Level chart 2026 (including Alaska and Hawaii variations)
- Medicare costs 2026: Part A premium, Part B premium, Part D, IRMAA brackets, deductibles, OOP max
- Open enrollment dates (Marketplace, Medicare AEP, special enrollment events)
- Cost concept definitions with current values: out-of-pocket maximum, deductible, coinsurance, copay
- Medical debt: statute of limitations by state, hospital lawsuit rules, FCRA rules
- Charity care: hospital obligations under 501(r), state laws stacking on top
- No Surprises Act: which bills are covered, dispute process timeline
- Coverage gap rules (states without Medicaid expansion)

For each row:

| Column | What |
|---|---|
| Hub query | e.g. "Medicaid income limits 2026" |
| Monthly US search volume | Number + source |
| Top 5 long-tail variants | With volume each |
| Canonical data source(s) | KFF, CMS, HHS, healthcare.gov, etc. — URL + update frequency |
| Current 2026 values | The actual data (e.g. FPL 2026 numbers, premium amounts, income thresholds) |
| Top 3 ranking pages on Bing | URLs + what's good and weak |
| Suggested page angle |

### Section 3 — Open exploration: what are people actually searching, and what are LLMs surfacing?

This is the unknown-unknowns section. Stop being constrained by my categories above and tell me what I might be missing.

**3a. High-volume healthcare cost/eligibility queries I might not have considered.**
Surface the top 50 queries in the US healthcare-cost-and-coverage space (combined volume) that aren't already obvious from Sections 1 and 2. Include long-tail patterns ("can I afford X", "how to pay for Y when uninsured"), trigger-event queries ("just lost my job and need insurance"), persona queries ("health insurance for gig workers / freelancers / new graduates / early retirees"), insurance product comparisons, and anything else high-volume and underserved.

**3b. AI search citation landscape audit.**
For a sample of ~15 high-volume queries spanning costs, eligibility, and billing — pick a representative cross-section — actually run them through ChatGPT (or ChatGPT Search), Perplexity, Bing Copilot, and Gemini. For each query, document:

- Which sources the AI engines cite (with URLs)
- How accurate / up-to-date the AI response is (call out specific outdated numbers, hallucinated stats, or missing context)
- Where the AI answer is weak or wrong — these are our opportunity gaps
- The format of the answer (paragraph? table? list?) so we know what structure AI engines prefer for this query type

Specifically flag: queries where AI engines are giving **outdated** info (2023/2024 numbers when 2026 numbers exist), **hallucinated** numbers, or **shallow** answers without proper sourcing. Those are exactly where a well-structured CoveredUSA page can win citations fast.

**3c. The citation winners.**
For healthcare cost and eligibility queries, who currently dominates AI citations? KFF, NerdWallet, GoodHealth, Healthline, CMS.gov, individual hospital sites? What format are they winning with? Where is their content thin or out of date?

### Section 4 — Schema.org and structured data competitive analysis

For top-ranking pages in the cost/eligibility/billing space, what schema patterns are they using? Specifically:

- `FAQPage` usage patterns (how many Q&As, what format)
- `MedicalEntity` / `Drug` / `Hospital` / `Service` schema usage
- `Article` vs `WebPage` vs `Dataset` schema choices
- `Table` markup conventions
- JSON-LD examples worth copying

What schema combinations correlate with AI citation rate (qualitatively — note where you see patterns)?

### Section 5 — Recommended priority

Given Sections 1-4, output a single ranked priority list of the **top 15 programmatic page templates to build**, ordered by:

1. Aggregate monthly search volume across all queries the page would target
2. AI-citation opportunity (gap between current AI answer quality and what we could ship)
3. Strategic fit with our two products (screener and analyzer)
4. Engineering cost to ship (rough complexity)

For each: page URL pattern, primary query targeted, estimated combined monthly volume, citation opportunity score, complexity score, one-sentence pitch.

---

## Output format

- Markdown
- All tables formatted as markdown tables
- Every volume number must cite its source (tool + date checked)
- Every data point in price/income tables must link to its canonical source
- Use "as of 2026" markers throughout — these are freshness signals we'll reuse on our pages
- Length is fine; comprehensiveness over brevity. This is research, not a memo.

### Important: avoid these traps

- **No vibe estimates.** If you can't find a volume number, say so and skip the row rather than guessing.
- **No 2023/2024 data presented as current.** If the latest canonical data is 2025, say so. We are publishing in 2026 with 2026 numbers wherever they exist.
- **No re-deriving GEO best practices** — assume I already have that research and focus on healthcare-specific opportunities.
- **No state-grid filler.** We're not building 50 thin state pages. Comprehensive multi-state hubs only.
- **Bias toward high-volume.** I'd rather have 50 great rows in Section 1 than 100 mediocre ones. Volume × intent × citation gap is the ranking function.
