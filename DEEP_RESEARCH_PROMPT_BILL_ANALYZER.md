# Bill Analyzer — AI Citation & Bing Strategy Deep Research Prompt

Paste everything below the dividing line into Gemini Deep Research (or Perplexity Deep Research). The prompt is self-contained.

---

## PROMPT

I run a US healthcare site called CoveredUSA (coveredusa.org). It already has one free tool: a benefits eligibility screener that helps uninsured Americans figure out if they qualify for ACA Marketplace subsidies, Medicaid, Medicare, Medicare Savings Programs, CHIP, or VA Healthcare.

I am now launching a **second free tool: a Medical Bill Analyzer**. It lives at `coveredusa.org/medical-bill-analyzer`. A user uploads a hospital bill (PDF or photo) and the tool does five things:

1. Uses vision AI to extract every line item, code, description, quantity, and charge from the bill.
2. Compares each line item to the Medicare fair-price reimbursement rate from the CMS Physician Fee Schedule.
3. Flags billing errors using NCCI edit rules: duplicate charges, unbundled codes, upcoded levels of service, missing/wrong modifiers.
4. Checks whether the user qualifies for 501(r) charity care at that specific nonprofit hospital (based on their income vs. the hospital's published FAP thresholds).
5. Generates a downloadable, hospital-specific dispute letter the user can send.

The tool is free, no signup required, zero data retention. The CTA on every article we publish will be "Upload your bill to our free analyzer."

### Why I need this research

I am a low-domain-authority site competing against KFF.org, NerdWallet, Dollar For, CFPB, and individual hospital sites. I cannot win on traditional Google SEO at my DA. I can win on two channels:

1. **AI citation.** Get cited by ChatGPT, Perplexity, Claude, Gemini AI Mode, and Bing Copilot when users ask any question that involves a medical bill, a hospital charge, a billing code, a charity care program, or a dispute. The Seer Interactive data shows ~87% of ChatGPT citations match Bing's top-10 results, so Bing rankings are the gating factor.
2. **Bing organic.** Bing is the second-largest search engine outright, indexes faster than Google, has weaker competition in the medical-billing niche, and favors fresh + directly-answered content. We are already submitting URLs via IndexNow.

The funnel: user types a query into ChatGPT/Perplexity/Bing → an AI summary cites our article (or mentions our tool by name) → user clicks through to coveredusa.org → user uploads a bill → conversion.

### What I already have (do NOT re-research)

I already have separate research on:
- General Generative Engine Optimization (GEO) principles — FAQ schema, direct-answer-first paragraphs, citation rates per platform, freshness signals, DR-63 threshold, etc.
- Eligibility-query keyword research for the screener tool — Medicaid income limits, ACA subsidies, Medicare enrollment, state-by-state coverage.
- The CMS, NCCI, IRS 501(r), and No Surprises Act source documents.

This research should focus narrowly on the **medical bill analyzer funnel**. Do not re-derive general SEO/GEO best practices. Do not re-research eligibility queries for pre-bill intent (those are the screener's territory).

---

## RESEARCH OBJECTIVES

Answer all of the following sections. Use real examples, real query strings, real source URLs, and real numbers wherever possible.

---

### SECTION 1: Post-Bill Query Intent Mapping

What do real Americans type or speak when they receive a hospital bill they don't understand, can't afford, or suspect is wrong? Sources to mine:
- Reddit: r/HospitalBills, r/MedicalBill, r/HealthInsurance, r/povertyfinance, r/personalfinance, r/legaladvice. Look specifically for posts that mention asking ChatGPT, Perplexity, Copilot, or "I asked AI" — those reveal the actual prompts people use.
- Quora questions tagged Medical Billing, Health Insurance, Hospital Bills.
- Google "People Also Ask" + Bing "Related Searches" for seed terms: "hospital bill too high", "dispute medical bill", "Medicare rate for [procedure]", "how to apply for charity care", "is my hospital bill wrong", "hospital overcharged me".
- TikTok/YouTube transcripts where creators read bills aloud and dispute charges (Dollar For, Sasha Karabachi, Brad Wright, others).

Produce **8 to 12 query intent clusters**. For each cluster:
- Cluster name and one-sentence definition
- 5 to 10 verbatim example queries
- Estimated US monthly query volume (any reliable engine; cite source)
- Emotional state of the searcher (panic, confusion, anger, resignation, due diligence)
- Conversion potential to a bill-analyzer CTA on a 1 to 10 scale, with reasoning

---

### SECTION 2: Procedure Cost Query Universe

The biggest evergreen cluster is "how much does [procedure] actually cost?" Research:

1. Identify the **top 50 procedure-cost queries by US search volume**. Include the search query as typed, the procedure CPT/HCPCS code, the rough Medicare reimbursement rate, and a sample of the chargemaster price spread across hospitals.
2. For 10 of the top 50, run the queries through ChatGPT or Perplexity (or describe what they currently return, citing the cited sources). Identify whether they cite weak sources — Healthcare Bluebook, FAIR Health Consumer, random hospital marketing pages, outdated KFF data, individual blog posts.
3. Identify the **10 procedures with the widest chargemaster-vs-Medicare price spread**. These have the strongest virality and citation potential because the numbers themselves are inherently shareable.
4. Identify **5 to 10 high-volume procedure queries where AI engines currently give poor or contradictory answers** — those are our highest-yield article targets.

---

### SECTION 3: Hospital-Specific Query Universe

Users frequently type "[Hospital Name] charity care", "[Hospital Name] financial assistance", "[Hospital Name] discount for cash pay". Research:

1. The **25 largest US hospital systems** by revenue (HCA, CommonSpirit, Ascension, Trinity, Kaiser Permanente, Providence, etc.) and the **15 most-searched individual hospitals** (Mayo Clinic, Cleveland Clinic, Cedars-Sinai, Mass General, etc.).
2. For each: list the actual queries users type, with example monthly volumes where available.
3. For each: where do ChatGPT/Perplexity currently pull answers from? The hospital's own FAP PDF? Dollar For's hospital database? GoodRx's hospital pages? Hospital review sites?
4. Identify **the 15 hospital systems with the weakest current AI-cited answers**. Those are where a CoveredUSA hospital-specific page could plausibly become the cited source.
5. Note any hospital systems where the FAP eligibility threshold is unusually generous (some go up to 400% FPL) — those are the most viral angles.

---

### SECTION 4: Billing Error & Code/Term Decoder Query Universe

Users searching for help understanding specific codes or suspected errors. Research:

1. Top **CPT/HCPCS code lookup queries** — "what is CPT 99284", "what is CPT 36415", "what is HCPCS J3490", etc. Volume + the 25 most-searched codes.
2. Top **"level X" service queries** — "what is a level 3 ER visit", "what is level 5 office visit", "what is observation status billing".
3. Top **billing-term explainer queries** — "what is balance billing", "what is upcoding", "what is unbundling", "what is the chargemaster", "what is a facility fee".
4. Top **error-pattern queries** — "why are there two of the same charge on my bill", "why did the hospital charge me $X for Tylenol", "why is my anesthesiology bill separate".
5. Where AI engines currently pull these answers from (AAPC? CodingIntel? Medical Billing & Coding subreddit? Wikipedia? KFF? CMS?). Identify the weakest current answers.

---

### SECTION 5: State-Specific Legal & Protection Query Universe

Each US state has different rules on medical debt statute of limitations, surprise billing protections beyond the federal No Surprises Act, charity care requirements, and credit reporting. Research:

1. Top **"[state] medical debt" / "[state] hospital bill law" / "[state] surprise billing"** queries by US state.
2. **Which 15 states have the highest search volume** for protection-related medical-bill queries?
3. Which states have **the most complex or strict consumer protections** (CA, NY, NJ, IL, MD, OR, CT — confirm) that are worth comprehensive explainer articles?
4. Where do AI engines currently cite for state-specific medical-debt law? (NCLC, state AG sites, Nolo, local TV news investigations, state bar association FAQs?)
5. Identify **10 states with the weakest current AI-citable answers** for medical debt protections.

---

### SECTION 6: Dispute & Action Query Universe

Users actively trying to dispute, negotiate, or get help. Research:

1. Top **"how to dispute medical bill"** / "how to negotiate hospital bill" / "medical bill negotiation script" / "medical bill negotiation letter" queries with volumes.
2. Top **No Surprises Act invocation** queries — "how to file IDR No Surprises Act", "how to dispute surprise bill", "what to do about out of network anesthesiologist".
3. Top **"medical billing advocate"** / "patient advocate" / "professional medical bill negotiator" queries.
4. Top **template/script queries** — "medical bill dispute letter template", "charity care application letter", "hospital bill itemization request letter".
5. Which sites dominate citations for these queries? Identify the gaps.

---

### SECTION 7: Competitor & Source Citation Audit

Research which specific sites currently dominate AI citations for medical-bill queries. For each of the following, identify which query types they win and what makes them citable:

- Dollar For (dollarfor.org) — charity care navigator
- Undue Medical Debt / RIP Medical Debt (undueMedicaldebt.org)
- Solve Medical Debt (solvemedicaldebt.com)
- Resolve Medical Bills (resolvemedicalbills.com)
- CarePayment, Healthcare Bluebook, FAIR Health Consumer
- KFF.org (Kaiser Family Foundation)
- Patient Advocate Foundation
- NerdWallet, GoodRx, GoodBill
- ConsumerReports.org (their hospital bill coverage)
- The Wall Street Journal, ProPublica medical-bill investigations
- CFPB.gov, CMS.gov, IRS.gov on charity care
- Reddit threads themselves (Perplexity weights Reddit heavily)
- AAPC, AMA on codes
- Local TV station "I-team" / consumer investigations

For each, surface:
- Their AI citation footprint (which query clusters they own)
- The structural reason they get cited (entity authority, format, freshness, FAQPage schema, original data)
- The query clusters they leave open (where their content is weak, dated, or absent)

---

### SECTION 8: Bing-Specific Opportunities

Bing's ranking algorithm is different from Google's. Research:

1. Known Bing ranking signals for YMYL medical/financial content as of 2025-2026.
2. Bing IndexNow adoption rate and tactics — is fast indexing a meaningful ranking edge in medical-billing topics?
3. Which medical-bill query types currently have **weak Bing top-10 results** — low-DA blogs, dated content, irrelevant pages — where a new well-structured page could rank fast?
4. Bing Copilot citation patterns vs. Bing organic. Do Copilot citations correlate 1:1 with top-10 organic rankings, or are there structural differences (FAQ schema bonus, attribute-rich JSON-LD bonus, etc.)?
5. Does Bing's medical-bill query coverage skew older than Google's? Quantify the recency-of-top-result delta if possible.
6. Any Bing-specific levers (Bing Pages for organizations, Bing Webmaster Tools features, Microsoft Start partnerships).

---

### SECTION 9: Emerging & Underserved Query Patterns (2025-2026)

Recent developments are creating new query patterns AI engines have not caught up to yet. Research:

1. **CFPB medical debt credit reporting rule** — its proposal, litigation, and 2025 status. What queries does it generate?
2. **2026 No Surprises Act updates and IDR enforcement** — what's new vs. 2022.
3. **State-level Hospital Price Transparency Act enforcement actions** since 2024 — hospitals being fined, public lists of non-compliant hospitals.
4. **AI bill-analyzer awareness** — are people typing "AI tool to check my hospital bill" or "ChatGPT medical bill review"? What competitors are surfacing (Goodbill.com, billy.health, others)?
5. **The 2025 elimination of the Medicare Part D donut hole / $2,000 OOP cap** — only tangentially related to bills but generating spillover queries.
6. **Any 2026 changes to 501(r) enforcement or IRS requirements** for nonprofit hospital charity care.

For each, list 5 to 10 example emerging queries with rough volume estimates.

---

### SECTION 10: Prioritized 100-Article Batch — THE PRIMARY DELIVERABLE

Based on all sections above, produce a prioritized list of **100 specific article topics** for CoveredUSA that will:

- Be cited by AI engines when users have a medical bill problem.
- Rank in Bing's top 10 for the target keyword.
- Funnel naturally to the "upload your bill to our free analyzer" CTA.

Format as a single table with the columns below. Rank 1 = highest priority. Include every article — do not summarize.

| Rank | Title | Primary Keyword | Cluster | Geo (National/State) | Est. Monthly Search Volume | AI Citation Gap (1-10) | Citation Difficulty (1-10) | Recommended Format | Why This Wins |

**Cluster** must be one of: Procedure Cost, Hospital-Specific Guide, State Legal Explainer, Code/Term Decoder, Dispute HowTo, Comparison/Decision Tree, Billing Error Explainer, Statistical Reference, Charity Care Guide, No Surprises Act Guide.

**Recommended Format** must be one of: Q&A FAQ-Heavy, Comparison Table, HowTo Step-by-Step, Statistical Reference Article, Definition + Explanation Block, Entity Profile Page.

**AI Citation Gap (1-10):** 10 = current top AI answer is terrible, easy to displace. 1 = strong existing source dominates.

**Citation Difficulty (1-10):** 10 = needs original data / heavy citations / topical authority to win. 1 = simple direct answer wins.

Mix of clusters in the final 100: roughly 25 Procedure Cost, 15 Hospital-Specific, 15 State Legal, 12 Code/Term Decoder, 10 Dispute HowTo, 10 Billing Error Explainer, 8 Charity Care Guide, 5 No Surprises Act, the rest filled with statistical references and comparisons.

For each article, the title must be the **actual headline** I would publish, not a topic description. The keyword must be the literal search string users type.

---

## DELIVERABLE FORMAT

- Structure the report by section number (1 through 10), in order.
- Open with a one-page **executive summary** listing the 5 biggest insights and the 3 highest-priority article clusters.
- Within each section, use real examples — verbatim queries in quotes, real source URLs, real numbers — not generic guidance.
- Section 10 is the primary deliverable. Make the table copy-pasteable into a spreadsheet (use pipe-separated or tab-separated rows). Do not truncate; produce all 100 rows.
- Cite every data point with a source URL and a date.

## QUALITY CONSTRAINTS

- **Geography:** United States only.
- **Recency:** 2024-2026 sources only, except for foundational legal references (ACA 1986, 501(r), No Surprises Act 2022).
- **Avoid:** Insurance carrier marketing pages, lead-generation sites masquerading as resources, content farms.
- **Prefer:** Real user query examples from Reddit/Quora/social, .gov sources, KFF, CFPB, IRS data, AHA data, peer-reviewed research, journalism from ProPublica/WSJ/NYT.

## OUT OF SCOPE — DO NOT RESEARCH

- General "what is GEO/SEO" content — already researched.
- Pre-bill eligibility queries (Medicaid, ACA, Medicare enrollment) — those belong to a separate funnel.
- International or non-US healthcare billing.
- Pharmaceutical pricing in retail pharmacy contexts — only relevant if drugs appear on hospital bills (e.g., chemo, infusions, 340B drugs).
- Medical procedure clinical/outcome research — we are focused exclusively on cost, billing, and dispute.

---

## END OF PROMPT
