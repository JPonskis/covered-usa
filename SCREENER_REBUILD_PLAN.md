# CoveredUSA Screener + Results Rebuild — Execution Plan

**Created:** 2026-05-11
**Goal:** Rebuild the screener (3 steps with email capture) and results page (health-focused, BenefitsUSA-quality UI) into a lead generation funnel.
**Working Directory:** `/Users/frankthebot/clawd/projects/covered-usa/`

---

## Overview

CoveredUSA's screener and results page need a full rebuild. The current screener has 4 steps with dead-weight fields (employment status, citizenship — unused by the eligibility engine), no lead capture, and styling that ignores the site's own design system. The results page shows a flat list of 6 programs with no priority logic and a basic lead capture form.

The rebuild turns this into a proper lead generation funnel:
- **Screener:** 3 quick steps — health questions → lead capture (name + email) → results
- **Results:** Health-focused with ACA/Medicare as primary results (revenue plays), FQHC clinics for Medicaid, phone capture for hot leads
- **UI:** Ported from BenefitsUSA's proven design patterns — warm color palette, card hierarchy, toggle buttons, progressive disclosure

## Success Criteria

The project is DONE when ALL of these are true:
- [ ] Screener has 3 steps: (1) ZIP/age/household/kids, (2) income/checkboxes/insured, (3) name+email
- [ ] ZIP code derives state automatically via zipToState lookup
- [ ] Screener UI matches BenefitsUSA quality (warm palette, card layout, toggle buttons, progress bar)
- [ ] Results page shows ONE primary program (Medicare > ACA > Medicaid override logic)
- [ ] ACA results show broker CTA + HealthSherpa self-apply placeholder
- [ ] Medicare results show broker CTA only
- [ ] Medicaid results show FQHC clinics within 30 miles of user's ZIP
- [ ] Phone number capture on results page for ACA/Medicare (hot lead)
- [ ] TCPA consent checkbox with proper language for phone capture
- [ ] Full Spanish translations for all new UI
- [ ] Supabase saves: screener data + name/email at screener stage, phone at results stage
- [ ] Dev server builds without errors, full flow works end-to-end
- [ ] Visual quality verified via dev server screenshots

---

## Pre-Execution Setup

Before starting ANY task:
1. `cd /Users/frankthebot/clawd/projects/covered-usa`
2. Reference BenefitsUSA deploy repo at `/Users/frankthebot/clawd/projects/benefits-navigator-deploy/`
3. CoveredUSA uses teal (`--primary: #0d9488`) not BenefitsUSA's forest green (`#059669`) — adapt all ported patterns to teal
4. All ported code must use CoveredUSA's existing CSS variable system from `globals.css`

---

## TASK 1: Infrastructure — Port Utilities from BenefitsUSA

- **Status:** todo
- **Difficulty:** Easy
- **Dependencies:** None

### What to Do

1. Copy ZIP-to-state lookup from BenefitsUSA:
   - Source: `benefits-navigator-deploy/src/lib/states/zipToState.ts`
   - Destination: `covered-usa/src/lib/states/zipToState.ts`
   - This is a self-contained module with zero dependencies

2. Copy FQHC clinic data and finder:
   - Source: `benefits-navigator-deploy/src/data/fqhc-sites.json` → `covered-usa/src/data/fqhc-sites.json`
   - Source: `benefits-navigator-deploy/src/data/zip-centroids.json` → `covered-usa/src/data/zip-centroids.json`
   - Source: `benefits-navigator-deploy/src/lib/clinic-finder.ts` → `covered-usa/src/lib/clinic-finder.ts`
   - Adjust import paths if needed

3. Copy FFM states list (determines where ACA broker operates):
   - Source: `benefits-navigator-deploy/src/lib/ffm-states.ts` → `covered-usa/src/lib/ffm-states.ts`

4. Fix ACA checker Alaska/Hawaii bug:
   - In `src/lib/eligibility/programs/aca.ts`, find calls to `getFPL()` that are missing the `state` parameter
   - Add `state` parameter to all `getFPL()` calls

5. Remove `employmentStatus` from the screener flow (not used by any eligibility checker)

### Verification Commands
```bash
npx tsc --noEmit  # TypeScript compiles
node -e "const z = require('./src/lib/states/zipToState'); console.log(z.zipToState('90210'))"  # Should output 'CA'
ls -la src/data/fqhc-sites.json src/data/zip-centroids.json  # Files exist
```

### Success Criteria
- [ ] zipToState('90210') returns 'CA', zipToState('10001') returns 'NY'
- [ ] fqhc-sites.json and zip-centroids.json exist in src/data/
- [ ] clinic-finder.ts imports and exports correctly
- [ ] ACA checker passes state to all getFPL calls
- [ ] TypeScript compiles with no errors

---

## TASK 2: Supabase Schema Update

- **Status:** todo
- **Difficulty:** Easy
- **Dependencies:** None (parallel with Task 1)

### What to Do

1. Check if `covered_usa_submissions` table already has these columns (it should from the migration):
   - `zip_code` (text) — NEW, not in current schema
   - `first_name`, `email`, `phone` — already exist
   - `wants_help`, `lead_captured_at` — already exist

2. Add `zip_code` column to `covered_usa_submissions` via Supabase REST API or SQL:
   ```sql
   ALTER TABLE covered_usa_submissions ADD COLUMN IF NOT EXISTS zip_code text;
   ```

3. Remove `employment_status` column (no longer collected):
   - Actually, leave it — don't break existing rows. Just stop writing to it.

4. Add a `clinic_referrals` table for tracking FQHC clicks:
   ```sql
   CREATE TABLE IF NOT EXISTS covered_usa_clinic_referrals (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     created_at timestamptz DEFAULT now(),
     submission_id uuid REFERENCES covered_usa_submissions(id),
     clinic_id text NOT NULL,
     clinic_name text,
     action text NOT NULL, -- 'call', 'directions', 'website'
     zip_code text
   );
   ```

### Verification Commands
```bash
# Verify via Supabase REST API
curl -s "https://jqbjsqlaujgqiwwcrdsp.supabase.co/rest/v1/covered_usa_submissions?select=zip_code&limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

### Success Criteria
- [ ] `zip_code` column exists on `covered_usa_submissions`
- [ ] `covered_usa_clinic_referrals` table exists
- [ ] No existing data was lost

---

## TASK 3: Rewrite Screener Component

- **Status:** todo
- **Difficulty:** Hard (largest task)
- **Dependencies:** Task 1 (needs zipToState)

### What to Do

Rewrite `src/components/ScreenerContent.tsx` from scratch. Port BenefitsUSA's screener UI patterns but simplified to 3 steps for health insurance only.

**Design reference:** Read `benefits-navigator-deploy/src/components/ScreenerContent.tsx` for exact styling patterns.

**3-Step Flow:**

**Step 1: About You**
- ZIP code input (5 digits, validated, derives state silently)
- Age (number input, required)
- Household size (dropdown 1-10)
- Children under 19 (dropdown 0-8)

**Step 2: Your Situation**
- Annual household income (currency input with $ prefix)
- Checkboxes in a gray card: pregnant, disability, veteran
- "Do you currently have health insurance?" (toggle button pair: Yes/No)
- If yes: insurance source dropdown (employer, ACA, Medicaid, Medicare, other)

**Step 3: Get Your Results**
- Heading: "Where should we send your results?"
- Subtext: "We'll email you a personalized summary of what you qualify for."
- First name input (required)
- Email input (required)
- CTA button: "See My Results"
- Small text: "No spam. We only use your email to send your results."

**Styling requirements (from BenefitsUSA patterns):**
- Use CoveredUSA's teal (`var(--primary)`) as the brand color, not BenefitsUSA's green
- Header: `var(--primary-deeper)` background with back arrow + site name + language toggle
- Progress bar: `h-2 rounded-full` with animated fill, step title + percentage
- Form card: `bg-white border border-[var(--border-light)] rounded-xl p-6 md:p-8 shadow-sm`
- Input styling: `px-4 py-3 border border-[var(--border)] rounded-lg` with `focus:ring-2 focus:ring-[var(--primary)]`
- Toggle buttons: `grid grid-cols-2 gap-2`, selected state fills brand color
- Checkbox group: `bg-[var(--cream)] rounded-lg p-4 space-y-3`
- Currency input: `$` absolute positioned, `inputMode="numeric"`, comma formatting
- Nav buttons: Back (outline) + Continue (filled brand color), `flex gap-4 mt-8`
- Validation errors: amber background box
- Privacy note below card

**Bilingual:** All text must use `locale === 'es' ? spanish : english` ternaries (matching current pattern in the file).

**On submit:** POST to `/api/screen` with all data including name + email. Redirect to results page.

### Verification Commands
```bash
npx tsc --noEmit
npm run dev  # Start dev server, navigate to /en/screener and /es/screener
```

### Success Criteria
- [ ] 3 steps, not 4
- [ ] ZIP code collected and validated (5 digits)
- [ ] State derived from ZIP (not a separate field)
- [ ] Name + email collected on step 3
- [ ] No employment status field
- [ ] No citizenship status field
- [ ] Uses CSS variables from globals.css, not hardcoded hex colors
- [ ] Toggle buttons for yes/no questions
- [ ] Progress bar with step title and percentage
- [ ] Spanish translation for all text
- [ ] Form submits successfully and redirects to results

---

## TASK 4: Update API Routes

- **Status:** todo
- **Difficulty:** Medium
- **Dependencies:** Task 2 (Supabase schema)

### What to Do

1. **Update `/api/screen/route.ts`:**
   - Accept `zipCode` instead of `state`
   - Derive state from ZIP using `zipToState()`
   - Save `zip_code` to Supabase
   - Save `first_name` and `email` at screener submission time (not just at lead capture)
   - Remove `employmentStatus` from the payload (or default it for the eligibility engine)
   - Pass derived `state` to `checkEligibility()`

2. **Update `/api/lead/route.ts`:**
   - This now only receives `phone` + `tcpaConsent` (name and email already saved)
   - Update the existing submission with phone + consent fields
   - Add rate limiting (5 per IP per hour)
   - Keep the TODO for broker CRM endpoint

3. **Add `/api/clinic-click/route.ts`:**
   - POST endpoint to track FQHC clinic interactions
   - Saves to `covered_usa_clinic_referrals` table
   - Fields: submission_id, clinic_id, clinic_name, action, zip_code

### Verification Commands
```bash
npx tsc --noEmit
# Test screen endpoint:
curl -X POST http://localhost:3000/api/screen \
  -H "Content-Type: application/json" \
  -d '{"zipCode":"90210","age":35,"householdSize":3,"annualIncome":40000,"numChildren":1,"isPregnant":false,"hasDisability":false,"isVeteran":false,"currentlyInsured":false,"firstName":"Test","email":"test@test.com"}'
```

### Success Criteria
- [ ] /api/screen accepts zipCode, derives state, returns results + submissionId
- [ ] Submission saved with zip_code, first_name, email
- [ ] /api/lead accepts phone + tcpaConsent, updates existing submission
- [ ] /api/clinic-click saves click events
- [ ] TypeScript compiles

---

## TASK 5: Rewrite Results Page

- **Status:** todo
- **Difficulty:** Hard
- **Dependencies:** Tasks 1, 3, 4

### What to Do

Rewrite `src/app/[locale]/results/[id]/page.tsx` (server component) and `ResultsClient.tsx` (client component). Port BenefitsUSA's results page UI.

**Design reference:** Read `benefits-navigator-deploy/src/app/[locale]/results/[id]/page.tsx` for the exact UI patterns.

**Priority/Override Logic:**

The results page determines ONE primary program to feature:
1. If Medicare eligible → Medicare is primary (broker CTA only)
2. Else if ACA eligible → ACA is primary (broker CTA + HealthSherpa link)
3. Else if Medicaid eligible → Medicaid is primary (FQHC clinics + state portal)
4. Else → show all results normally

Secondary programs (ones they also qualify for but aren't primary) shown below with less visual weight.

**Page Structure:**
```
<header> (teal, site name + back link + language toggle)
<div max-w-3xl mx-auto>
  <SummaryCard>
    - "Your Health Coverage Options" heading
    - Primary program callout with value estimate
    - If ACA: "You could save up to $X/month on health insurance"
    - If Medicare: "You're eligible for Medicare coverage"
    - If Medicaid: "You likely qualify for free coverage through [State Program]"
  </SummaryCard>

  <PrimaryProgramCard>
    - Full details: program name, explanation, estimated value
    - "Why You Qualify" box (cream background, reason text)
    - For ACA/Medicare: PhoneCaptureForm (just phone + TCPA consent)
    - For ACA: HealthSherpa self-apply button below the phone capture
    - For Medicaid: NearbyClinics component + state portal link
  </PrimaryProgramCard>

  <SecondaryPrograms> (if any)
    - Smaller cards, less visual weight
    - "You may also qualify for:" heading
    - Program name + brief reason + apply link
  </SecondaryPrograms>

  <NotEligible> (collapsible details/summary)
    - Programs they don't qualify for with reasons

  <Disclaimer>
    - Standard "these are estimates" text
</div>
```

**Phone Capture Component (for ACA/Medicare):**
- Shows only for ACA and Medicare primary results
- Heading: "Want free help enrolling?"
- Subtext: "A licensed agent can walk you through your options at no cost."
- Phone number input (the user's name + email are already captured)
- TCPA consent checkbox with appropriate language
- Submit button: "Connect Me With an Agent"
- Success state: "You're all set! An agent will call you shortly."
- Trust signals: "Free consultation", "Licensed agents", "No obligation"

**Styling (from BenefitsUSA patterns):**
- Warm color palette using CSS variables
- Summary card: white with subtle shadow, teal accent
- Primary program card: white card with `border-l-4 border-l-[var(--primary)]` accent
- "Why You Qualify" box: `bg-[var(--cream)] p-3 rounded-lg`
- Phone capture: `bg-[var(--cream)] rounded-xl p-5` inner card
- Not-eligible: native `<details>/<summary>`, muted styling
- `max-w-3xl` container (slightly wider than screener's `max-w-2xl`)

**Bilingual:** All text must support en/es.

### Verification Commands
```bash
npx tsc --noEmit
npm run dev  # Complete a screener, check results page
```

### Success Criteria
- [ ] Primary program shown prominently based on override logic
- [ ] ACA shows broker CTA + HealthSherpa placeholder
- [ ] Medicare shows broker CTA only
- [ ] Medicaid shows FQHC clinics
- [ ] Phone capture form works for ACA/Medicare results
- [ ] TCPA consent with proper language
- [ ] Secondary programs shown with less weight
- [ ] Not-eligible programs in collapsible section
- [ ] Spanish translations for all text
- [ ] Visual quality matches BenefitsUSA results page

---

## TASK 6: FQHC Nearby Clinics Component

- **Status:** todo
- **Difficulty:** Medium
- **Dependencies:** Task 1 (clinic data + finder)

### What to Do

Create `src/components/NearbyClinics.tsx` — ported from BenefitsUSA but adapted to CoveredUSA's design.

**Reference:** `benefits-navigator-deploy/src/components/NearbyClinics.tsx`

**Component props:** `{ zipCode: string, submissionId?: string, locale: string }`

**Behavior:**
1. On mount, call clinic-finder with ZIP code
2. Show top 3 clinics within 30 miles
3. Per clinic: org name, site name (if not satellite), address, distance
4. Action links: Call (tel:), Directions (Google Maps), Visit Website
5. Track clicks via `/api/clinic-click`
6. HRSA attribution text at bottom

**If no clinics within 30 miles:** Show "No clinics found nearby" with link to findahealthcenter.hrsa.gov

**Styling:** Cards with border, teal accent on action links. Match BenefitsUSA's clean layout.

### Verification Commands
```bash
npx tsc --noEmit
# Test with a known ZIP that has nearby FQHCs
npm run dev  # Submit screener as Medicaid-eligible, check clinics show
```

### Success Criteria
- [ ] Shows top 3 clinics for a given ZIP
- [ ] Call/Directions/Website links work
- [ ] Click tracking fires
- [ ] Handles no-results gracefully
- [ ] Spanish labels for action links

---

## TASK 7: Spanish Translations

- **Status:** todo
- **Difficulty:** Medium
- **Dependencies:** Tasks 3, 5, 6

### What to Do

Ensure ALL new UI text in the screener, results page, and clinic component is bilingual.

The screener uses inline `locale === 'es' ? ... : ...` ternaries. The results page should do the same (it's a client component that receives `locale` as a prop).

**Key strings to translate:**
- All screener labels, placeholders, validation messages, step titles
- Results page headings, program explanations, CTA text
- Phone capture form labels, TCPA consent text
- Clinic component labels (Call, Directions, Website)
- Error messages and loading states

### Verification Commands
```bash
npm run dev  # Navigate through /es/screener → /es/results/[id]
```

### Success Criteria
- [ ] /es/screener shows full Spanish UI
- [ ] /es/results shows full Spanish UI
- [ ] No English text visible on Spanish pages
- [ ] TCPA consent in Spanish

---

## TASK 8: End-to-End Verification + Visual QA

- **Status:** todo
- **Difficulty:** Medium
- **Dependencies:** All previous tasks

### What to Do

1. Start dev server (`npm run dev`)
2. Walk through the ENTIRE flow in English:
   - Enter ZIP 90210, age 30, household 3, 1 child
   - Enter income $30,000, check pregnant, not insured
   - Enter name "Test User", email "test@test.com"
   - Submit → verify results page shows correctly
   - Verify primary program is correct for this profile (should be Medicaid in CA)
   - Verify FQHC clinics show for Medicaid result
   - Test phone capture form

3. Walk through in Spanish (/es/screener)

4. Test edge cases:
   - Age 67 (should get Medicare as primary)
   - Income $50k household of 1 (should get ACA as primary)
   - Veteran checked (should show VA Healthcare)
   - Invalid ZIP (should show error)

5. Take screenshots of key screens for Jacob's review

6. Run TypeScript check: `npx tsc --noEmit`
7. Run build: `npm run build`

### Verification Commands
```bash
npx tsc --noEmit
npm run build
npm run dev
```

### Success Criteria
- [ ] Full flow works: screener → API → results page
- [ ] TypeScript compiles clean
- [ ] Build succeeds
- [ ] English flow complete and correct
- [ ] Spanish flow complete and correct
- [ ] Medicare override works (age 67 test)
- [ ] ACA override works (income $50k test)
- [ ] Medicaid + FQHC clinics work (low income test)
- [ ] Screenshots captured for review

---

## Execution Order

```
Task 1 (Infrastructure) ──┐
                           ├──→ Task 3 (Screener) ──→ Task 4 (API) ──→ Task 5 (Results) ──┐
Task 2 (Supabase) ────────┘                                                                 │
                                                                Task 6 (Clinics) ───────────┤
                                                                                             ├──→ Task 7 (Spanish) → Task 8 (Verify)
```

Tasks 1 and 2 can run in parallel. Task 3 needs Task 1. Tasks 4-6 are sequential. Task 7 after all UI is built. Task 8 is final verification.
