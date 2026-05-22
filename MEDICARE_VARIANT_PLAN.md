# Medicare Landing-Page + Screener Variant — Execution Plan

**Created:** 2026-05-22
**Goal:** Build a Medicare-optimized landing page variant on `/comenzar` AND a dedicated Medicare-tailored screener flow, both bilingual (EN + ES), so paid ads to 65+ audiences land on Medicare-relevant copy and complete a shorter Medicare-only screener that posts to Aaron's broker dialer as a Medicare lead.
**Working Directory:** `/Users/jacobposner/clawd/projects/covered-usa`
**Framework:** Ralph (Research → Plan → Approval → Execute → Verify → Report)

---

## Overview

CoveredUSA already has `/en/comenzar` and `/es/comenzar` — but they're generic and the downstream `/screener` asks 10+ ACA-relevant questions (household size, income, pregnancy, kids) that are irrelevant to a 65+ Medicare audience. Running paid Meta/Google ads to "Medicare Advantage" or "Compare Medicare Plans" creatives needs a separate funnel — different hero copy, different urgency framing, a shorter Medicare-specific question set, prominent TPMO disclaimer above the fold, and a lead that posts to Aaron's TLD CRM tagged as Medicare.

Existing infra we'll reuse: the `/comenzar` page structure, the existing screener page (`/screener`), `AnalyticsTracker`, `MetaPixel`, `postToBrokerDialer`, `buildScreenerNote`, and the Medicare eligibility logic in `src/lib/eligibility/programs/medicare.ts`. Existing infra we'll extend: the screener form (to become focus-aware), `/api/screen` (accept focus + skip ACA-only questions), `/api/lead` (force `leadType=medicare` when focus=medicare).

URL convention: `?focus=medicare` query param threads from /comenzar → /screener → screener API → broker. No new routes, no domain split, no schema migration required.

---

## Success Criteria

The project is DONE when ALL of these are true:

- [ ] `/en/comenzar?focus=medicare` renders a Medicare-specific hero (different headline, sub, badges, stat, step copy)
- [ ] `/es/comenzar?focus=medicare` renders the Spanish Medicare variant
- [ ] TPMO disclaimer appears **above the CTA**, not just in the footer, on both Medicare landing pages (CMS audit posture)
- [ ] The "Check My Eligibility" CTA on Medicare landing passes `focus=medicare` to `/screener`
- [ ] `/screener?focus=medicare` renders a Medicare-tailored question set: ZIP + age + current Medicare status + needs → name + email (3 steps, ≤6 inputs)
- [ ] Medicare screener hides ACA-only fields (household size, # children, income, pregnant, veteran, currently insured)
- [ ] Submitting the Medicare screener saves to `covered_usa_submissions` with focus stored (either as a column or inferable from `eligible_programs`)
- [ ] Lead capture on results page posts to broker with `leadType=medicare` regardless of age (so Aaron's team gets Medicare-tagged leads)
- [ ] Self-serve secondary CTA on Medicare results points to **Medicare.gov**, not HealthSherpa
- [ ] TypeScript compiles clean (`npx tsc --noEmit`)
- [ ] Production build succeeds (`npm run build`)
- [ ] All four URLs return HTTP 200 in production: `/en/comenzar?focus=medicare`, `/es/comenzar?focus=medicare`, `/en/screener?focus=medicare`, `/es/screener?focus=medicare`
- [ ] Dry-run test: a Medicare-flow test submission lands in Supabase with the right shape and the broker payload (verified via `buildScreenerNote` preview) carries `leadType=medicare` + TPMO note
- [ ] Adversarial critic finds zero substantive issues

---

## Pre-Execution Setup

1. `cd /Users/jacobposner/clawd/projects/covered-usa`
2. `git pull origin main` — confirmed clean
3. Latest deploy is READY (verified)

---

## TASK 1: /comenzar — Medicare hero variant

- **Status:** todo
- **Difficulty:** Easy
- **Files:** `src/app/[locale]/(landing)/comenzar/page.tsx`, `src/app/[locale]/(landing)/comenzar/cta-button.tsx`

### What to Do
1. Add `?focus` to searchParams in `comenzar/page.tsx`. Branch the `content` dict by `(locale, focus)`. Medicare keys override headline, sub, trustBadges, statHeadline, stepsTitle, steps, cta, ctaBottom, disclaimer.
2. Medicare-variant copy (EN):
   - badge: "Free Medicare Plan Comparison"
   - headline: "Compare Medicare Plans in Your Area — Free Help from a Licensed Agent"
   - sub: "2 minutes. 100% free. No commitment."
   - trustBadges: ['✓ Free', '✓ Licensed agents', '✓ No sign-up', '✓ In Spanish']
   - statHeadline: "Medicare plans change every year. Make sure yours still works for you."
   - stepsTitle: "Three steps, two minutes"
   - steps:
     1. "Tell us about your Medicare situation" / "Tell us your ZIP, age, and whether you have Medicare already. Takes a minute."
     2. "See plans available where you live" / "We check Medicare Advantage, Medicare Supplement, and Part D options in your area."
     3. "Get help from a licensed Medicare agent" / "A licensed agent walks you through your options at no cost. No pressure, ever."
   - cta + ctaBottom: "Compare Medicare Plans Free →"
3. Medicare-variant copy (ES): Spanish translation of the above, in matching tone.
4. In the page JSX, when `focus === 'medicare'`, render the TPMO disclaimer block as a prominent strip ABOVE the bottom CTA section (background slightly lighter, ~0.85rem text, max-w-2xl, centered). Keep the same TPMO text in footer as belt-and-suspenders.
5. Update `cta-button.tsx` to also forward `focus` (alongside the utm_* params) so the screener URL becomes `/${locale}/screener?focus=medicare&utm_*=...`.

### Verification Commands
```bash
cd /Users/jacobposner/clawd/projects/covered-usa
npx tsc --noEmit
npm run build
```

### Success Criteria
- [ ] `?focus=medicare` toggles every Medicare-specific copy element
- [ ] TPMO disclaimer is visible above-fold (above the bottom CTA section)
- [ ] CTA href contains `focus=medicare`
- [ ] EN + ES both render

### Notes
_(Worker fills this in)_

---

## TASK 2: /screener — focus-aware question set

- **Status:** todo
- **Difficulty:** Medium
- **Files:** `src/components/ScreenerContent.tsx`, `src/app/[locale]/screener/page.tsx`

### What to Do
1. `screener/page.tsx`: read `focus` from `searchParams`. Pass to `ScreenerContent` as a prop.
2. `ScreenerContent.tsx`: accept `focus?: 'medicare'` prop. Add new fields to FormData:
   - `medicareStatus`: 'none' | 'partAB' | 'advantage' | 'supplement' | 'unsure'
   - `medicareNeeds`: 'newToMedicare' | 'compareAdvantage' | 'compareSupplement' | 'partD' | 'lostCoverage' | 'other'
3. When `focus === 'medicare'`, render a different 3-step UI:
   - **Step 1:** ZIP + age (same as ACA flow but with Medicare-specific helper text: "We use this to find plans in your area")
   - **Step 2:** medicareStatus (radio group) + medicareNeeds (radio group). Replace the household/income/flags step entirely.
   - **Step 3:** First name + email (same as ACA flow). Keep email optional for Medicare (less critical than phone).
4. When `focus === 'medicare'`, hide the entire Step 2 ACA UI (income, household size, # children, currentlyInsured, isPregnant, hasDisability, isVeteran toggles).
5. Submit payload now includes `focus`, `medicareStatus`, `medicareNeeds`. ACA payload unchanged.
6. Add EN + ES labels/options to the page (inline like existing locale checks) — Medicare status options + needs options + helper text.
7. Update the screener page title to "Compare Medicare Plans — CoveredUSA" when focus=medicare. (`generateMetadata` if it exists; otherwise leave the static metadata generic since these are noindex anyway.)

### Verification Commands
```bash
cd /Users/jacobposner/clawd/projects/covered-usa
npx tsc --noEmit
npm run build
```

### Success Criteria
- [ ] `/en/screener?focus=medicare` shows Medicare-only question set
- [ ] No ACA fields visible in Medicare flow (no household, no income, no pregnant, no veteran)
- [ ] Submit payload includes `focus=medicare`, `medicareStatus`, `medicareNeeds`
- [ ] ACA flow (no `?focus`) is unchanged
- [ ] EN + ES both work

### Notes
_(Worker fills this in)_

---

## TASK 3: /api/screen — accept Medicare payload + tag the row

- **Status:** todo
- **Difficulty:** Easy
- **Files:** `src/app/api/screen/route.ts`

### What to Do
1. Accept `focus`, `medicareStatus`, `medicareNeeds` from request body.
2. For Medicare flow, set sensible defaults for fields the screener didn't collect (so `checkEligibility` doesn't blow up):
   - `householdSize = 1`
   - `numChildren = 0`
   - `annualIncome = 0` (won't cause Medicare eligibility issues since Medicare isn't income-tested)
   - `currentlyInsured` = derive from medicareStatus (any except 'none' → true)
   - `insuranceSource` = derive from medicareStatus ('advantage'/'supplement'/'partAB' → 'medicare', 'none' → 'none')
   - `isPregnant`, `hasDisability`, `isVeteran` = false
3. Store on row: existing columns + write the Medicare-specific fields into `insurance_source` (already exists), `eligible_programs` (force include 'medicare'). Encode `focus=medicare` and `medicareStatus`/`medicareNeeds` as a JSON blob in an existing text-y column OR add a tiny inline marker we can detect downstream.

   **Decision:** to avoid a migration, store `focus=medicare` + Medicare answers in the existing `insurance_source` field as `"medicare:<status>:<needs>"` (e.g. `"medicare:partAB:compareAdvantage"`). The /api/lead route can parse this back out and lift it into the broker note. Insurance_source is already a free-form text column.
4. For Medicare flow, hard-set `eligible_programs` to include `['medicare', 'medicare-savings']` if age 65+, else `['medicare']` (still a Medicare lead even if age 63–64 "approaching").

### Verification Commands
```bash
cd /Users/jacobposner/clawd/projects/covered-usa
npx tsc --noEmit
npm run build
# Direct POST test (after deploy):
curl -s -X POST https://coveredusa.org/api/screen \
  -H "Content-Type: application/json" \
  -d '{"zipCode":"75201","age":67,"focus":"medicare","medicareStatus":"partAB","medicareNeeds":"compareAdvantage","firstName":"DRYRUN","email":"test@test.com","language":"en"}' \
  | python3 -m json.tool
```

### Success Criteria
- [ ] Medicare payload accepted (returns submissionId)
- [ ] `covered_usa_submissions` row has insurance_source = `medicare:<status>:<needs>`, eligible_programs includes 'medicare'
- [ ] ACA payload still works (regression-free)

### Notes
_(Worker fills this in)_

---

## TASK 4: /api/lead — force leadType=medicare for Medicare flow

- **Status:** todo
- **Difficulty:** Easy
- **Files:** `src/app/api/lead/route.ts`, `src/lib/broker-posting.ts` (only if note enrichment needed)

### What to Do
1. When pulling the submission row, parse `insurance_source` — if it starts with `"medicare:"`, extract `medicareStatus` and `medicareNeeds`, set `leadType = 'medicare'`, and include both in the broker note via `buildScreenerNote`.
2. `buildScreenerNote` already supports arbitrary screener fields via the `ScreenerRow` type. Add a `medicareDetails?: { status: string; needs: string }` field to the optional shape, and render an extra `-- MEDICARE STATUS --` block in the note when present (e.g. "Current: Original Medicare (Part A+B). Looking for: Compare Medicare Advantage plans.").
3. For Medicare leads, the broker `source` tag should be `"benefitsusa:medicare"` base (with UTM ad campaign tags layered on top via the existing utm_source/utm_campaign mechanism — no new code, just confirm the existing tracking_id logic produces e.g. `benefitsusa:facebook:medicare-aca-v1` and falls back to `benefitsusa:medicare` if no UTM).

   **Edit needed:** the current code does `sourceWithCampaign = adCampaign ? \`benefitsusa:${utm}:${campaign}\` : 'benefitsusa'` — leadType isn't in the tag. Update so Medicare leads always have `:medicare` somewhere in the tag. Cleanest: `tracking_id` in broker-posting.ts already appends `:${leadType}` — so the final form-encoded `tracking_id` field becomes `benefitsusa:facebook:campaign-v1:medicare`. Verify this works as-is, no edit may be needed.

### Verification Commands
```bash
cd /Users/jacobposner/clawd/projects/covered-usa
npx tsc --noEmit
npm run build
# After deploy, verify the broker payload preview matches expectations using the same preview script from earlier dry-run.
```

### Success Criteria
- [ ] Medicare submissions land at /api/lead → broker post body has `tracking_id` ending in `:medicare`
- [ ] Broker note includes a `-- MEDICARE STATUS --` block
- [ ] ACA flow regression-free (tracking_id still `:health`)

### Notes
_(Worker fills this in)_

---

## TASK 5: Results page — Medicare-specific framing + Medicare.gov self-serve

- **Status:** todo
- **Difficulty:** Easy
- **Files:** `src/components/ResultsClient.tsx`

### What to Do
1. Detect Medicare focus from the submission row (passed down via props OR inferred from `eligible_programs[0] === 'medicare'`). Add a `isMedicareFlow` boolean to props.
2. When `isMedicareFlow`:
   - Replace the lead-capture form headline from "Want help choosing a health plan?" to "Want help comparing Medicare plans?"
   - Replace the body copy to be Medicare-framed ("A licensed Medicare agent can compare Advantage, Supplement, and Part D plans in your area — at no cost to you.")
   - Replace the HealthSherpa "Apply Yourself" link with a Medicare.gov link: `https://www.medicare.gov/plan-compare` (no agent attribution available there — Medicare.gov is the canonical .gov self-serve)
   - Add a small "Or call (855) 819-2471" line below the form for the call-now path
3. ACA flow unchanged.

### Verification Commands
```bash
cd /Users/jacobposner/clawd/projects/covered-usa
npx tsc --noEmit
npm run build
```

### Success Criteria
- [ ] Medicare results page shows Medicare-framed copy
- [ ] Self-serve link goes to Medicare.gov, not HealthSherpa
- [ ] Phone CTA visible below the form
- [ ] ACA results page unchanged

### Notes
_(Worker fills this in)_

---

## TASK 6: Adversarial verification

- **Status:** todo
- **Difficulty:** Easy (delegated to critic subagent)

### What to Do
1. Spawn a critic subagent (general-purpose, fresh context) with the prompt:
   > "You are a ruthless critic. Read MEDICARE_VARIANT_PLAN.md and inspect the actual code changes in this repo. Find every issue: TCPA/CMS compliance gaps, conversion-rate red flags, broken UX paths, type errors, missing translations, edge cases (age 63–64 'approaching Medicare', dual-eligible Medicare+Medicaid, TPMO placement), drift between EN and ES copy, anything Aaron's team would push back on. Report at least 5 substantive issues OR explicitly state 'no substantive issues found after thorough review.'"
2. Worker fixes everything the critic found (max 2 iterations).
3. Re-spawn critic. Repeat until zero substantive issues.

### Verification Commands
N/A — adversarial loop.

### Success Criteria
- [ ] Critic finds zero substantive issues on final pass

### Notes
_(Manager runs this — not a sub-task for the build worker)_

---

## TASK 7: Live verification + dry-run lead

- **Status:** todo
- **Difficulty:** Easy

### What to Do
1. Confirm all 4 URLs return HTTP 200 in production.
2. Submit a Medicare-flow dry-run via `/api/screen` (test data, clearly tagged).
3. Pull the saved row from Supabase. Verify shape.
4. Generate the broker payload preview with `buildScreenerNote` for the test submission. Verify `tracking_id`, `note1_note` shape, Medicare details.
5. Delete the dry-run row from `covered_usa_submissions`.

### Verification Commands
```bash
# URLs live
for u in \
  "https://coveredusa.org/en/comenzar?focus=medicare" \
  "https://coveredusa.org/es/comenzar?focus=medicare" \
  "https://coveredusa.org/en/screener?focus=medicare" \
  "https://coveredusa.org/es/screener?focus=medicare"; do
  echo "$u → $(curl -s -o /dev/null -w '%{http_code}' "$u")"
done

# Dry-run lead submission (cleaned up after)
curl -s -X POST https://coveredusa.org/api/screen \
  -H "Content-Type: application/json" \
  -d '{"zipCode":"75201","age":67,"focus":"medicare","medicareStatus":"partAB","medicareNeeds":"compareAdvantage","firstName":"DRYRUN_MEDICARE","email":"frank-medicare-dryrun@test.com","language":"en"}' \
  | python3 -m json.tool
```

### Success Criteria
- [ ] All 4 URLs HTTP 200
- [ ] Dry-run row lands in Supabase with `insurance_source` starting `medicare:`
- [ ] Broker payload preview shows `tracking_id` containing `:medicare` and notes with Medicare details
- [ ] Dry-run row cleaned up

### Notes
_(Manager runs this — final live check)_

---

## Execution Order

Sequential. Each task touches files the next depends on.

1. TASK 1 (landing page Medicare variant)
2. TASK 2 (screener focus-aware) — depends on TASK 1's CTA passing `focus`
3. TASK 3 (/api/screen accepts focus) — depends on TASK 2's payload shape
4. TASK 4 (/api/lead Medicare leadType) — depends on TASK 3's row shape
5. TASK 5 (results page Medicare framing)
6. Commit + push + wait for deploy
7. TASK 6 (adversarial verification with critic subagent)
8. TASK 7 (live verification + dry-run lead)

## Risks / Unknowns

- **Inferring focus from `insurance_source`** is a hack. Cleaner: add `lead_focus` column via SQL migration. Skipping the migration for speed; if Aaron's team needs cleaner data downstream, we add the column later.
- **No new translation namespace** — Medicare copy is inlined in the page component like the existing /comenzar content. If we want next-intl-grade i18n, that's a follow-up.
- **Medicare "approaching" leads (age 60–64):** Aaron's TPMO might restrict marketing to 60+. Keeping age 60+ as the floor on the Medicare screener.
- **TCPA consent text** is already Aaron-specific ("Help Plan Advocates") and works for Medicare too — verified.

---

*Plan version 1. Updated as we learn.*
