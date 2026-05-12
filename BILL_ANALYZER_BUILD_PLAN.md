# Medical Bill Analyzer — Build Plan

**Created:** 2026-05-11
**Goal:** Build a free medical bill analysis tool on CoveredUSA that lets users upload a hospital bill, get a line-by-line Medicare fair price comparison, error detection, charity care eligibility check, and auto-generated dispute letter.
**Working Directory:** `/Users/frankthebot/clawd/projects/covered-usa/`
**Reference:** `research/MEDICAL_BILL_ANALYZER.md`

---

## Overview

The Medical Bill Analyzer is the growth engine for CoveredUSA. Users upload a bill (PDF or photo), and the tool instantly shows them what each line item should actually cost (Medicare rates), flags billing errors, checks if they qualify for charity care, and generates a dispute letter they can send to the hospital. Free, no signup, zero data retention.

This builds on the existing CoveredUSA Next.js 16 + Supabase + Tailwind v4 stack. The tool follows the same pattern as the benefits screener: a `'use client'` component with local state, calling an API route, displaying results inline.

## Tech Stack (Existing)

- Next.js 16.1.6, React 19.2.3, TypeScript 5.9.3
- Tailwind CSS v4 (no component library)
- Supabase (anon + service role clients)
- @react-pdf/renderer (for PDF generation — verify installed, install if not)
- App Router with i18n (en/es via next-intl)
- Deployed on Vercel, auto-deploys on push to main

## Critical Vercel Constraints (Read Before Building)

These will silently break the build if not addressed:
1. **Request body limit:** Vercel default is 4.5MB. Base64-encoded 10MB file = 13.3MB. MUST use `FormData` multipart upload instead of JSON body, OR set `export const config = { api: { bodyParser: { sizeLimit: '20mb' } } }` in the route.
2. **Function timeout:** Vercel default is 10 seconds (Pro: 60s). Vision OCR + analysis can take 15-20s. Set `export const maxDuration = 60` in the API route (requires Pro plan or higher).
3. **Serverless rate limiting:** In-memory `Map` rate limiting does NOT work on Vercel (each request may hit a different instance). Use Supabase or Vercel KV for persistent rate limiting, or use Vercel's built-in WAF rate limiting.
4. **Sentry captures request bodies on errors.** For zero-retention, configure Sentry to scrub request bodies for the `/api/analyze-bill` route. Add `beforeSend` filter in `sentry.server.config.ts`.

## Success Criteria

The project is DONE when ALL of these are true:
- [ ] User can upload a PDF or image of a medical bill at `/en/medical-bill-analyzer`
- [ ] Vision AI extracts line items, charges, and procedure descriptions
- [ ] Each line item shows the Medicare fair price comparison
- [ ] Total potential savings is calculated and displayed
- [ ] Billing errors are flagged (duplicates, unbundling, upcoding)
- [ ] 501(r) charity care eligibility is checked based on hospital + income
- [ ] A dispute letter is generated and downloadable as PDF
- [ ] Results page bridges to CoveredUSA benefits screener
- [ ] Tool page has 1000+ words of structured content + FAQPage schema
- [ ] Zero bill data is stored server-side (process in memory, return, delete)
- [ ] Works on mobile (responsive)
- [ ] Page loads fast (no heavy client-side dependencies)
- [ ] Disclaimer is present ("not medical or legal advice")

---

## Pre-Execution Setup

Before starting ANY task:
1. `cd /Users/frankthebot/clawd/projects/covered-usa/`
2. `git pull origin main` (get latest)
3. Read `src/components/ScreenerContent.tsx` as the pattern reference for client components
4. Read `src/app/api/screen/route.ts` as the pattern reference for API routes
5. Read `src/app/[locale]/screener/page.tsx` as the pattern reference for pages
6. Read `src/app/globals.css` to get actual CSS variable names (don't assume from memory)
7. Verify `@react-pdf/renderer` is in `package.json` — install if missing
8. Add `ANTHROPIC_API_KEY` to `.env.local` (read from `/Users/frankthebot/clawd/.secrets/anthropic-api-key.txt`)
9. Verify Vercel plan supports `maxDuration > 10` — if hobby plan, may need to use streaming response pattern

---

## TASK 0: Environment & Vercel Configuration

- **Status:** todo
- **Difficulty:** Easy
- **Dependencies:** None (DO THIS FIRST)

### What to Do
1. Add `ANTHROPIC_API_KEY` to `.env.local` and to Vercel project environment variables
2. Verify `@react-pdf/renderer` is installed — if not, `npm install @react-pdf/renderer`
3. Update `vercel.json` to set function max duration for the analyze-bill route
4. Configure Sentry to scrub request bodies for `/api/analyze-bill` (in `sentry.server.config.ts`, add a `beforeSend` that strips `request.data` when URL matches)
5. Add rate limiting infrastructure: create a `bill_analysis_rate_limits` table in Supabase (ip TEXT, timestamp TIMESTAMPTZ), or use Vercel KV if available
6. Create analytics table in Supabase: `bill_analyses` (id UUID, created_at TIMESTAMPTZ, total_billed NUMERIC, total_savings NUMERIC, errors_found INT, charity_eligible BOOLEAN) — no PII, just aggregate stats

### Success Criteria
- [ ] `ANTHROPIC_API_KEY` works in API route
- [ ] `@react-pdf/renderer` imports without error
- [ ] Rate limiting persists across serverless invocations
- [ ] Sentry won't capture bill data on errors

---

## PHASE 1: CMS Data Pipeline (Backend Foundation)

### TASK 1: Download and Process CMS Medicare Fee Schedule

- **Status:** todo
- **Difficulty:** Medium
- **Dependencies:** None

### What to Do
1. Go to `https://www.cms.gov/medicare/payment/fee-schedules/physician` — download the **National Payment Amount File** (it's inside a ZIP, may contain multiple CSVs/Excel files)
2. The file you want has columns including: HCPCS code, Modifier, Non-Facility Price, Facility Price, and Locality. Use **Locality 0000000** (national) for the base rates.
3. Create `/src/lib/bill-analyzer/cms-data.ts` module
4. Pre-process the data into a **Supabase table** `medicare_rates` (hcpcs_code TEXT, modifier TEXT, facility_rate NUMERIC, non_facility_rate NUMERIC, description TEXT). This is better than a JSON file because:
   - No cold-start memory issues on Vercel serverless
   - Easy to update annually
   - Fast indexed lookups
5. Create a loader script at `scripts/load-cms-data.js` that parses the download and inserts into Supabase
6. Create `getMedicareRate(code: string, modifier?: string): Promise<{ facilityRate: number, nonFacilityRate: number, description: string } | null>` function that queries Supabase
7. Include FPL (Federal Poverty Level) thresholds for 2026 as a simple constant array in a separate file `src/lib/bill-analyzer/fpl.ts`
8. **Data refresh:** Add a comment in the loader script noting the data updates annually in January. Future: create a cron job to check for updates.

### Verification Commands
```bash
# Test the lookup function
npx tsx -e "
const { getMedicareRate } = require('./src/lib/bill-analyzer/cms-data');
// CPT 99213 is a common office visit
console.log(getMedicareRate('99213'));
// Should return a rate object, not null
"
```

### Success Criteria
- [ ] Medicare rate lookup works for common CPT/HCPCS codes
- [ ] Returns null gracefully for unknown codes
- [ ] Data file is under 10MB (processed/compressed)
- [ ] Function is fast (<50ms per lookup)

---

### TASK 2: Create NCCI Bundling Rules Lookup

- **Status:** todo
- **Difficulty:** Medium
- **Dependencies:** None (can run parallel with Task 1)

### What to Do
1. Download NCCI edits from `https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-edits` — get the practitioner and hospital outpatient PTP (Procedure-to-Procedure) edits. **Note:** These are distributed as Excel files (.xlsx), not CSV.
2. Create `/src/lib/bill-analyzer/ncci-rules.ts`
3. Store in Supabase table `ncci_edits` (column1_code TEXT, column2_code TEXT, effective_date DATE, deletion_date DATE, modifier_indicator TEXT). Index on both code columns.
4. Create loader script at `scripts/load-ncci-data.js` using `xlsx` npm package to parse Excel files
5. Function: `checkBundling(code1: string, code2: string): Promise<{ shouldBundle: boolean, explanation: string } | null>`
6. **Data refresh:** NCCI edits update quarterly (Jan, Apr, Jul, Oct). Add a note in the loader script. Future: quarterly cron to re-download and reload.

### Verification Commands
```bash
# Test bundling check
npx tsx -e "
const { checkBundling } = require('./src/lib/bill-analyzer/ncci-rules');
// 99213 + 99214 should flag (same E/M family, can't bill both)
console.log(checkBundling('99213', '99214'));
"
```

### Success Criteria
- [ ] Bundling lookup works for common code pairs
- [ ] Returns null for unknown pairs (not a false positive)
- [ ] Data file is under 5MB

---

### TASK 3: Create 501(r) Hospital Nonprofit Database

- **Status:** todo
- **Difficulty:** Medium
- **Dependencies:** None (can run parallel)

### What to Do
1. Download IRS Exempt Organizations data (990 extracts) from `https://www.irs.gov/statistics/soi-tax-stats-annual-extract-of-tax-exempt-organization-financial-data`
2. Filter to NTEE code E (healthcare) + 501(c)(3) status
3. Create `/src/lib/bill-analyzer/hospital-data.ts`
4. Build lookup: given a hospital name or EIN, return nonprofit status and typical FAP thresholds
5. Function: `lookupHospital(name: string, state?: string): { isNonprofit: boolean, ein?: string, name: string, fapUrl?: string } | null`
6. For MVP, use fuzzy name matching (Levenshtein or simple normalized string comparison)
7. For top hospital FAP URLs: use web search to find FAP pages for the 25 largest US hospital systems by revenue (HCA, CommonSpirit, Ascension, Trinity, etc.). Store as a `hospital_fap_urls` table in Supabase (hospital_name TEXT, system_name TEXT, state TEXT, ein TEXT, fap_url TEXT, is_nonprofit BOOLEAN). Start with 25, expand over time.

### Verification Commands
```bash
npx tsx -e "
const { lookupHospital } = require('./src/lib/bill-analyzer/hospital-data');
console.log(lookupHospital('Cedars-Sinai', 'CA'));
console.log(lookupHospital('Mayo Clinic', 'MN'));
"
```

### Success Criteria
- [ ] Lookup returns nonprofit status for major hospital systems
- [ ] Fuzzy matching handles common name variations
- [ ] Top 100 hospital systems have FAP URLs
- [ ] FPL income thresholds are included for charity care eligibility check

---

## PHASE 2: AI Analysis Engine (Core Logic)

### TASK 4: Build Vision AI OCR Pipeline

- **Status:** todo
- **Difficulty:** Hard
- **Dependencies:** None

### What to Do
1. Create `/src/lib/bill-analyzer/ocr.ts`
2. Accept a file (PDF or image) as a base64 string or Buffer
3. For PDFs: send PDF bytes directly to Claude Vision API (Claude supports PDF input natively as of 2025). No image conversion needed. For multi-page bills, limit to first 10 pages to control costs (~$0.005/page for claude-sonnet-4-6 vision input).
4. Send to vision AI (Claude claude-sonnet-4-6 or GPT-4o) with a structured extraction prompt
5. The prompt should extract:
   - Patient name (for display only, not stored)
   - Hospital/provider name
   - Date of service
   - Line items: description, code (if visible), quantity, unit charge, total charge
   - Total billed amount
   - Insurance adjustments (if visible)
   - Patient responsibility amount
6. Return as structured JSON: `BillData` type
7. Handle multi-page bills (common for hospital stays)

### Prompt Engineering Notes
The extraction prompt is critical. It must:
- Handle wildly different bill formats (every hospital has a different template)
- Extract codes when visible, but not hallucinate codes when they're not shown
- Distinguish between line items vs subtotals vs taxes
- Handle both itemized bills and summary bills
- Return a confidence score for each extracted field

### Type Definition
```typescript
interface BillData {
  provider: { name: string; state?: string; address?: string };
  patient: { name?: string };
  dateOfService?: string;
  lineItems: Array<{
    description: string;
    code?: string; // CPT/HCPCS if visible on bill
    quantity: number;
    unitCharge: number;
    totalCharge: number;
    confidence: number; // 0-1
  }>;
  totalBilled: number;
  insuranceAdjustment?: number;
  patientResponsibility?: number;
  rawText?: string; // full OCR text for fallback
}
```

### Verification Commands
```bash
# Test with a sample bill image (create a test fixture)
npx tsx src/lib/bill-analyzer/__tests__/ocr.test.ts
```

### Success Criteria
- [ ] Extracts line items from a sample hospital bill image
- [ ] Extracts line items from a sample hospital bill PDF
- [ ] Handles bills with and without CPT codes visible
- [ ] Returns structured BillData JSON
- [ ] Costs under $0.05 per bill for OCR step

---

### TASK 5: Build Bill Analysis Engine

- **Status:** todo
- **Difficulty:** Hard
- **Dependencies:** Tasks 1, 2, 3, 4

### What to Do
1. Create `/src/lib/bill-analyzer/analyzer.ts`
2. This is the core orchestrator that ties everything together:
   a. Take `BillData` from OCR
   b. For each line item, use LLM to identify the most likely CPT/HCPCS code (if not already on bill)
   c. Look up Medicare rate for each code
   d. Run NCCI bundling check across all code pairs
   e. Check for duplicate charges (same code, same date)
   f. Check for upcoding (LLM judgment: does the description match the code level?)
   g. Look up hospital nonprofit status
   h. Calculate charity care eligibility based on income input
3. Return `AnalysisResult`:

```typescript
interface AnalysisResult {
  provider: { name: string; isNonprofit: boolean; fapUrl?: string };
  lineItems: Array<{
    description: string;
    billedAmount: number;
    medicareRate: number | null;
    overchargeAmount: number | null;
    overchargePercent: number | null;
    flags: Array<{
      type: 'duplicate' | 'unbundled' | 'upcoding' | 'modifier_error';
      explanation: string;
      severity: 'high' | 'medium' | 'low';
    }>;
  }>;
  summary: {
    totalBilled: number;
    totalMedicareRate: number;
    totalOvercharge: number;
    overchargePercent: number;
    errorsFound: number;
    errorBreakdown: Record<string, number>;
  };
  charityCare: {
    eligible: boolean;
    hospitalIsNonprofit: boolean;
    fplPercent?: number;
    explanation: string;
    nextSteps: string[];
  };
}
```

4. The LLM code identification step should use a focused prompt:
   - Input: line item description + charge amount
   - Output: most likely CPT/HCPCS code + confidence
   - Use Claude claude-haiku-4-5-20251001 for cost efficiency (~$0.01 per bill for this step)
   - NEVER output CPT codes to the user — this is backend only

### Verification Commands
```bash
npx tsx src/lib/bill-analyzer/__tests__/analyzer.test.ts
```

### Success Criteria
- [ ] Given OCR output, produces full analysis with Medicare comparisons
- [ ] Flags at least basic errors (duplicates, obvious unbundling)
- [ ] Charity care check works for nonprofit hospitals
- [ ] Total cost per analysis is under $0.10
- [ ] All CPT codes stay backend-only (verify no codes in response meant for client)

---

## PHASE 3: Frontend + API

### TASK 6: Create API Route `/api/analyze-bill`

- **Status:** todo
- **Difficulty:** Medium
- **Dependencies:** Tasks 4, 5

### What to Do
1. Create `/src/app/api/analyze-bill/route.ts`
2. POST handler accepts `FormData` (NOT JSON body — avoids Vercel 4.5MB body limit):
   - `file`: File object (PDF or image)
   - `income` (optional): annual household income for charity care check
   - `householdSize` (optional): for FPL calculation
3. Add route config:
   ```typescript
   export const maxDuration = 60; // Vercel Pro allows up to 60s
   export const config = { api: { bodyParser: false } }; // Handle FormData manually
   ```
4. Pipeline:
   a. Parse FormData, validate file size (<10MB) and type (pdf, jpeg, png)
   b. Convert file to base64 for Vision API
   c. Run OCR (Task 4)
   d. Run analysis (Task 5)
   e. Return `AnalysisResult` JSON
   f. Do NOT store any data — process in memory only
5. Rate limiting: query Supabase `bill_analysis_rate_limits` table (set up in Task 0). Max 5 analyses per IP per hour.
6. Error handling: return structured errors for bad files, OCR failures, API timeouts
7. Add page limit: if PDF has >10 pages, only process first 10 and warn user

### Verification Commands
```bash
# Test with curl using FormData
curl -X POST http://localhost:3000/api/analyze-bill \
  -F "file=@test-bill.pdf" \
  -F "income=35000" \
  -F "householdSize=2"
```

### Success Criteria
- [ ] Accepts PDF and image uploads via FormData
- [ ] Returns AnalysisResult JSON
- [ ] Rate limited via Supabase (5/hour/IP, persists across serverless instances)
- [ ] Rejects files over 10MB
- [ ] Limits PDF to 10 pages with warning
- [ ] No bill data persisted anywhere
- [ ] Returns in under 30 seconds (with maxDuration=60 as safety margin)

---

### TASK 7: Build Dispute Letter Generator

- **Status:** todo
- **Difficulty:** Medium
- **Dependencies:** Tasks 3, 5

### What to Do
1. Create `/src/lib/bill-analyzer/dispute-letter.ts`
2. Takes `AnalysisResult` + user info (name, address — entered on results page, not stored)
3. Uses LLM (Claude claude-haiku-4-5-20251001) to generate a formal dispute letter that cites:
   - Specific billing errors found with descriptions
   - Medicare fair price for each overcharged item
   - 501(r) rights if applicable (from Task 3 hospital data)
   - Hospital Price Transparency Act requirements
   - Request for itemized bill review
4. Create `/src/app/api/generate-letter/route.ts` — POST handler
5. Returns letter as both plain text AND generates a PDF server-side using @react-pdf/renderer (follow existing `BenefitsPDF.tsx` pattern — check that it's installed first per Task 0)
6. **Important:** The letter must include a disclaimer: "This letter is for informational purposes only and does not constitute legal advice."

### Verification Commands
```bash
# Test letter generation
npx tsx -e "
const { generateDisputeLetter } = require('./src/lib/bill-analyzer/dispute-letter');
const mockResult = { /* mock AnalysisResult */ };
const letter = await generateDisputeLetter(mockResult, { name: 'Test User' });
console.log(letter.substring(0, 500));
"
```

### Success Criteria
- [ ] Generates a professional, accurate dispute letter
- [ ] Cites specific findings from the analysis
- [ ] Includes correct legal references (501(r), Price Transparency Act)
- [ ] Downloadable as PDF
- [ ] Letter does NOT contain any CPT codes (plain language only)

---

### TASK 8: Build Frontend Component — Upload & Analysis UI

- **Status:** todo
- **Difficulty:** Hard
- **Dependencies:** Task 6

### What to Do
1. Create `/src/app/[locale]/medical-bill-analyzer/page.tsx` — server component wrapper
2. Create `/src/components/BillAnalyzer.tsx` — main client component

Follow the ScreenerContent.tsx pattern: single 'use client' component, local useState, form steps.

**UI Flow (3 states):**

**State 1: Upload**
- Drag-and-drop zone + file input (PDF or image)
- "Take a photo" option on mobile (camera input)
- Optional: income + household size fields (for charity care check)
- Privacy notice: "Your bill is analyzed securely and never stored"
- Big CTA button: "Analyze My Bill"

**State 2: Analyzing (loading)**
- Progress animation
- "Extracting line items..." → "Comparing to Medicare rates..." → "Checking for errors..."
- Estimated time: "Usually takes 10-15 seconds"

**State 3: Results**
- **Summary card at top:** Total billed, Medicare fair price, potential savings (big green number), errors found
- **Line item table:** Each row shows description, your charge, Medicare rate, difference, flags (color-coded)
- **Error section:** Flagged issues with plain-language explanations
- **Charity care section:** If eligible, show hospital's FAP info + next steps
- **Action buttons:**
  - "Download Dispute Letter" (PDF)
  - "Check Your Benefits" → links to /screener
  - "Share This Tool" (social share links)
- **Disclaimer:** "This is for informational purposes only. Not medical or legal advice."

**Styling:** Use existing CSS variables (`--forest`, `--cream`, `--warm-white`), `.card`, `.card-elevated`, `.btn-primary` classes. Match the CoveredUSA visual identity.

3. Add i18n keys to `/messages/en.json` and `/messages/es.json` under `billAnalyzer` namespace

### Verification Commands
```bash
npm run dev
# Visit http://localhost:3000/en/medical-bill-analyzer
# Test upload flow with a sample bill
```

### Success Criteria
- [ ] Upload works for PDF and images (including mobile camera)
- [ ] Loading state shows meaningful progress
- [ ] Results display is clear, scannable, and mobile-responsive
- [ ] Line items show billed vs Medicare rate with clear visual diff
- [ ] Error flags are color-coded and have plain-language explanations
- [ ] Charity care section appears when applicable
- [ ] Dispute letter downloads as PDF
- [ ] "Check Your Benefits" links to screener
- [ ] Disclaimer is visible
- [ ] Matches CoveredUSA design language

---

### TASK 9: Build Tool Page Content + Schema

- **Status:** todo
- **Difficulty:** Medium
- **Dependencies:** Task 8

### What to Do
1. Add structured content around the tool on the page (above and below the widget)
2. Content sections (1000-1500 words total):
   - H1: "Free Medical Bill Analyzer"
   - Intro paragraph: what the tool does, who it's for
   - "How It Works" section (3 steps: upload, analyze, act)
   - "What We Check For" section (overcharges, errors, charity care)
   - "Your Rights" section (No Surprises Act, Price Transparency Act, 501(r))
   - FAQ section (6-8 questions)
3. Add JSON-LD structured data:
   - FAQPage schema (critical for AI citation)
   - SoftwareApplication schema
   - BreadcrumbList schema
   - HowTo schema (for the "how to use" steps)
4. Add meta tags (title, description, og:image)
5. Internal links from the tool page to related blog articles

### Verification Commands
```bash
# Check JSON-LD is valid
curl -s http://localhost:3000/en/medical-bill-analyzer | grep 'application/ld+json'
```

### Success Criteria
- [ ] Page has 1000+ words of structured content
- [ ] FAQPage, HowTo, SoftwareApplication, BreadcrumbList schemas present
- [ ] Content follows Island Test (every paragraph stands alone)
- [ ] Internal links to related articles
- [ ] OG tags + meta description set

---

## PHASE 4: Integration + Polish

### TASK 10: Wire Up Analytics + Screener Bridge

- **Status:** todo
- **Difficulty:** Easy
- **Dependencies:** Task 8

### What to Do
1. Track bill analysis events via existing `/api/analytics` endpoint:
   - `bill_upload` (file type, file size)
   - `bill_analysis_complete` (total billed, total savings, errors found)
   - `dispute_letter_downloaded`
   - `screener_clicked_from_analyzer`
2. Add UTM params to screener link: `?utm_source=bill_analyzer&utm_medium=cta`
3. Optional: save anonymous aggregate stats to Supabase (no PII):
   - Average overcharge percent
   - Most common error types
   - Average savings found
   - These become content: "Our users have found an average of $X in overcharges"

### Success Criteria
- [ ] All key events tracked
- [ ] Screener link has UTM attribution
- [ ] No PII in analytics

---

### TASK 11: Add Navigation + Internal Links

- **Status:** todo
- **Difficulty:** Easy
- **Dependencies:** Task 8

### What to Do
1. Add "Bill Analyzer" to the main navigation (header)
2. Add link from screener results page: "Have a medical bill? Check it for free →"
3. Add link from relevant blog articles (medical debt, hospital bills, etc.)
4. Add to sitemap
5. Update robots.txt if needed

### Success Criteria
- [ ] Accessible from main nav
- [ ] Cross-linked from screener results
- [ ] In sitemap
- [ ] Discoverable by crawlers

---

### TASK 12: Create Demo Bills for Testing + Content

- **Status:** todo
- **Difficulty:** Easy
- **Dependencies:** Task 8

### What to Do
1. Create 5-10 realistic but fake hospital bills (PDF format)
2. Each should cover a different scenario:
   - Simple ER visit with obvious overcharges
   - Surgery with unbundled codes
   - Hospital stay with duplicate charges
   - Bill from a nonprofit hospital (501(r) eligible)
   - Bill with insurance adjustments already applied
   - Outpatient procedure (imaging/lab)
3. Save to `/src/lib/bill-analyzer/__fixtures__/`
4. These double as test fixtures AND content creation material (screen recordings)

### Success Criteria
- [ ] 5+ demo bills covering different scenarios
- [ ] Each produces meaningful analysis results
- [ ] Bills look realistic (not obviously fake)
- [ ] Can be used for screen recording content

---

### TASK 13: Mobile Optimization + Final Polish

- **Status:** todo
- **Difficulty:** Medium
- **Dependencies:** All previous tasks

### What to Do
1. Test full flow on mobile viewport (375px width)
2. Ensure camera upload works on iOS and Android
3. Results table should scroll horizontally on mobile or stack vertically
4. Large numbers (savings amount) should be prominently visible
5. Dispute letter download should work on mobile
6. Test with slow connection (3G throttle) — loading states matter
7. Add error states: bad file, OCR failure, API timeout
8. Add share functionality (native share on mobile, copy link on desktop)

### Success Criteria
- [ ] Full flow works on iPhone Safari and Android Chrome
- [ ] Camera capture works
- [ ] Results are readable on small screens
- [ ] Error states are handled gracefully
- [ ] Share works on mobile

---

## Execution Order

```
PARALLEL GROUP 1 (Data Pipeline — no dependencies):
  Task 1: CMS Medicare Fee Schedule
  Task 2: NCCI Bundling Rules
  Task 3: Hospital Nonprofit Database

SEQUENTIAL (Core Engine — needs data pipeline):
  Task 4: Vision AI OCR Pipeline
  Task 5: Bill Analysis Engine (needs 1, 2, 3, 4)

PARALLEL GROUP 2 (Frontend + API — needs engine):
  Task 6: API Route
  Task 7: Dispute Letter Generator
  Task 8: Frontend Component (needs 6)

PARALLEL GROUP 3 (Polish — needs frontend):
  Task 9: Tool Page Content + Schema
  Task 10: Analytics + Screener Bridge
  Task 11: Navigation + Internal Links
  Task 12: Demo Bills

FINAL:
  Task 13: Mobile Optimization + Final Polish
```

**Estimated timeline:** 1.5-2 weeks for a polished MVP. Phase 1 data pipeline tasks run in parallel (2-3 days). Phase 2 core engine is the hardest part (3-4 days — prompt engineering + iteration). Phase 3 frontend + API (2-3 days). Phase 4 polish (2-3 days). Budget for iteration — first OCR prompts and analysis logic will need 2-3 rounds of refinement on real bill formats.

---

## API Keys Needed

| Service | Key Location | Purpose |
|---------|-------------|---------|
| Anthropic (Claude) | `.secrets/anthropic-api-key.txt` | Vision OCR + code identification + letter gen |
| Supabase | `supabase-admin.ts` (already configured) | Hospital data, analytics |
| OpenAI (optional) | `.secrets/openai-api-key.txt` | Alternative vision model |

Existing keys in `.secrets/` work. The critical step is making them available in the project's `.env.local` and Vercel environment (Task 0).

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| CMS data files are huge | Store in Supabase tables, not JSON files. Indexed lookups. |
| NCCI data is Excel, not CSV | Use `xlsx` npm package for parsing |
| NCCI data goes stale quarterly | Document refresh schedule. Future: quarterly cron. |
| Vision OCR misreads bills | Include confidence scores, show "low confidence" warnings, fallback UI |
| CPT code identification is wrong | Show as "estimated" comparison, not definitive |
| AMA sends cease & desist | CPT codes never shown to users, only used for backend lookup. Consider legal review before launch. |
| Bill formats vary wildly | Robust OCR prompt + fallback to "we couldn't fully read this bill" with partial results |
| Multi-page bills are expensive | Cap at 10 pages, warn user. Cost per 10-page bill: ~$0.05-0.15 |
| Vercel body size limit | Use FormData upload, not JSON base64 |
| Vercel function timeout | Set maxDuration=60, use streaming if needed |
| Rate limiting on serverless | Supabase-backed rate limiter, not in-memory Map |
| Sentry captures bill data | beforeSend scrubber for /api/analyze-bill route |
| Cost per analysis spikes | Monitor daily, set alerts at $10/day, cap at 10 pages per bill |
| User lies about income for charity care | Label charity care check as "estimate based on self-reported information" |

---

*This plan is the blueprint. Each task can be assigned to a sub-agent with enough context to execute independently.*
