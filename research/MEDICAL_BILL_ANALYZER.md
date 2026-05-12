# Medical Bill Analyzer — Product Spec & Strategy

*Last updated: 2026-05-11*

---

## What It Is

A free tool where anyone can upload a medical bill and instantly get:
1. **Line-item analysis** identifying billing errors (upcoding, unbundling, duplicate charges)
2. **Fair price comparison** against Medicare reimbursement rates
3. **Charity care eligibility check** (501(r) financial assistance at nonprofit hospitals)
4. **Auto-generated dispute letter** they can send to the hospital

No signup. No login. Zero data retention. Upload, get results, done.

This is the flagship viral tool for CoveredUSA — the thing that brings traffic. The benefits screener converts that traffic into revenue.

---

## Why It Matters

- 100M+ Americans struggle with medical bills (not just uninsured — 70% have insurance)
- 80% of hospital bills contain errors
- Hospitals use opaque "chargemaster" pricing with no standard — often 3-10x Medicare rates
- Most people just pay because they don't know what's fair or how to fight back
- No free tool exists that does this end-to-end. Dollar For covers charity care only. NerdWallet covers content only. Nobody combines analysis + action.

---

## How It Works (Architecture)

### Step 1: Upload & OCR
- User uploads bill (photo or PDF)
- Vision AI (GPT-4o or Claude) extracts line items, procedure codes, charges, provider info
- Zero-retention: image processed in memory, deleted immediately after analysis

### Step 2: Code Identification
- LLM identifies medical procedures from bill descriptions
- Maps internally to CPT/HCPCS codes for database lookup
- **AMA copyright workaround:** CPT codes used only on backend for lookup. Never displayed to user. Output uses plain-language descriptions + public HCPCS Level II codes only.

### Step 3: Medicare Fair Price Lookup
- Query CMS Physician Fee Schedule (public, free, updated annually)
- For hospital charges: use CMS Hospital Price Transparency files (standardized JSON/CSV since July 2024)
- Compare each line item: "You were charged $4,200. Medicare rate: $890."
- Calculate total potential overcharge

### Step 4: Billing Error Detection
- **NCCI bundling rules** (public CMS data): Flag procedures that should be bundled but were billed separately
- **Duplicate charge detection:** Same code billed multiple times
- **Upcoding detection:** Higher-cost code used when lower-cost code fits the description
- **Modifier misuse:** Incorrect or missing modifiers

### Step 5: Financial Assistance Check
- Identify if the hospital is a 501(c)(3) nonprofit (IRS database, public)
- If yes: they're legally required to have a Financial Assistance Policy under 501(r)
- Check user's approximate income against typical FAP thresholds (100-400% FPL)
- Flag charity care eligibility with specific hospital policy link

### Step 6: Dispute Letter Generation
- LLM generates a formal dispute letter citing:
  - Specific billing errors found
  - Medicare fair price comparisons
  - 501(r) charity care rights (if applicable)
  - Hospital Price Transparency Act compliance requirements
- Downloadable as PDF, ready to print and mail

### Cost Per Analysis
- Vision AI OCR: ~$0.02-0.05
- LLM for code identification + letter gen: ~$0.03-0.05
- CMS data lookups: free (public databases)
- **Total: ~$0.05-0.10 per bill**

---

## Data Sources (All Free / Public)

| Data | Source | Format | Update Frequency |
|------|--------|--------|-----------------|
| Medicare physician rates | CMS Physician Fee Schedule | CSV | Annual (January) |
| Hospital prices | CMS Hospital Price Transparency files | JSON/CSV | Required since July 2024 |
| Bundling rules | CMS NCCI Edits | CSV | Quarterly |
| Nonprofit hospital list | IRS Exempt Organizations (990s) | CSV | Annual |
| 501(r) charity care policies | Individual hospital websites | Scraped/curated | As needed |
| Federal Poverty Level thresholds | HHS | Published | Annual (January) |

---

## Legal & Compliance

- **HIPAA:** Does NOT apply. Users voluntarily upload their own data to a consumer app. HIPAA covers covered entities (hospitals, insurers), not consumer tools.
- **AMA CPT Copyright:** Real risk. CPT codes are copyrighted ($19.50/user/year license). Workaround: backend-only usage, never expose codes to users, output in plain language + public HCPCS codes.
- **Not medical/legal advice:** Standard disclaimers. Tool provides information, not professional advice. Dispute letter is a starting point, not legal counsel.
- **Zero-retention architecture:** No bill data stored. Process in memory, return results, delete. This is both a privacy feature and a liability shield.

---

## Monetization Flow

```
User uploads bill (free, no signup)
    ↓
Gets full analysis + dispute letter
    ↓
Results page shows: "Based on your situation, you may qualify for:"
    - Charity care (501(r)) → guide them through application
    - Better insurance plan → CoveredUSA benefits screener
    - Medicaid (if income qualifies) → CoveredUSA screener
    - ACA marketplace plan → CoveredUSA screener
    ↓
Screener captures lead → routes to broker (Help Plan Advocates)
    ↓
Broker enrolls → 40% revenue share on enrollment
```

**Unit economics estimate:**
- 10K monthly users → ~15% are uninsured/underinsured (1,500)
- 10% of those start screener (150)
- At 40% rev share on enrollments (~$250/enrollment) = $37,500/month at scale

The tool is free. The tool is the marketing. Revenue comes from the screener funnel.

---

## Distribution Strategy

### 1. AI Search / GEO (Long Game)
- Every tool page has 500-1500 words of structured content around the widget
- FAQPage schema for 2.3-3.2x AI citation lift
- AI engines cite the tool directly: "Use CoveredUSA's bill analyzer at [link]"
- Already proven: BenefitsUSA went 0 → 11K Bing impressions/day in 2 months

### 2. Reddit AEO (Medium Game)
- Target subreddits: r/HospitalBills, r/MedicalBill, r/povertyfinance, r/HealthInsurance, r/personalfinance
- Help people with real questions, link tool where genuinely relevant
- Reddit answers get pulled into AI search results (Google, Perplexity)

### 3. Social Media / Viral Content (Fast Game)
- **Primary format:** Screen recordings of the tool analyzing real bills + Jacob's voiceover
- **Secondary format:** Slideshow/carousel educational content (via larry-marketing)
- **Platforms:** TikTok (primary), Instagram Reels, YouTube Shorts
- **Cadence:** 2-3 posts/day
- **Precedent:** Dollar For's single 60-second TikTok about 501(r) charity care erased $55M+ in debt
- **Hook formula:** Outrage (hospital overcharges) + actionable solution (free tool) = shares
- Content strategy details: `medical-bill-analyzer-content-strategy.md`

### 4. SEO Articles (Steady Game)
- 56 new articles already queued in Google Sheet (CU-130 through CU-185)
- Pillars: Medical Debt, Pharma Affordability, Coverage Gaps, Alternative Healthcare
- Each article links to relevant tools
- Island Test enforced: every paragraph stands alone for AI extraction

---

## Competitive Landscape

| Competitor | What They Do | Gap |
|-----------|-------------|-----|
| Dollar For | 501(r) charity care navigation | No bill analysis, no error detection, no fair price comparison |
| Medical Billing Advocates of America | Professional bill review ($50-200/hr) | Expensive, not self-service |
| BillFixers | Negotiate bills for you (30-50% of savings) | Takes a cut, slow process |
| CoPatient | Bill review service | Subscription model, not free |
| NerdWallet | Content about medical bills | Content only, no tool |
| GoodRx | Drug price comparison | Drugs only, not medical bills |

**Nobody offers free, instant, self-service bill analysis.** That's the gap.

---

## Deep Research Reports

Two independent deep research reports validate this strategy:

1. **GEO & AI Search Strategy for Healthcare** (ChatGPT Deep Research, May 11 2026)
   - File: `deep-research-geo-strategy-2026-05-11.pdf`
   - Key finding: Medical debt and pharma affordability are the two highest-emotional-intent pillars with weakest competition

2. **Medical Bill Analyzer Feasibility Study** (Google Gemini Deep Research, May 11 2026)
   - File: `deep-research-bill-analyzer-feasibility-2026-05-11.pdf`
   - Key findings: Technically feasible, all data sources are free/public, CPT copyright is manageable with backend-only approach, HIPAA doesn't apply, unit economics work at $0.05-0.10/bill, no direct competitor offers free self-service analysis

---

## MVP Build Plan

### Phase 1: Core Analysis Engine
- [ ] Bill upload UI (drag-and-drop PDF/image)
- [ ] Vision AI OCR pipeline (extract line items, charges, codes)
- [ ] CMS Medicare Fee Schedule integration (fair price lookup)
- [ ] Basic overcharge calculation and display
- [ ] Results page with clear breakdown

### Phase 2: Error Detection
- [ ] NCCI bundling rule checker
- [ ] Duplicate charge detection
- [ ] Upcoding flagging
- [ ] Error summary with plain-language explanations

### Phase 3: Action Items
- [ ] 501(r) charity care eligibility check
- [ ] Dispute letter generator (PDF download)
- [ ] Bridge to CoveredUSA benefits screener ("you may also qualify for...")

### Phase 4: Content & Launch
- [ ] Tool page with 1000+ words of structured content
- [ ] FAQPage schema
- [ ] First 10 demo bill screen recordings
- [ ] TikTok/Reels launch
- [ ] Reddit seeding in target subreddits

---

## Where This Fits in CoveredUSA

```
CoveredUSA.org
├── Benefits Screener (revenue engine — converts leads)
├── Medical Bill Analyzer (growth engine — attracts traffic)
├── Hospital Charity Care Lookup (future — 2,900 SEO pages)
├── Coverage Gap Navigator (future — "just lost insurance" tool)
├── Prescription Savings Finder (future — free meds via PAPs)
├── Health Plan Picker (future — Bronze vs Silver vs Gold)
└── Blog / Articles (SEO + AI citation content layer)
```

The bill analyzer brings people in. The screener makes money. Everything else deepens the moat and builds the "NerdWallet of Healthcare" destination.
