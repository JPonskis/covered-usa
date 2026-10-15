# CoveredUSA Google Analytics

Configured October 14, 2026. This is a separate GA4 property under the existing
Benefits USA account; BenefitsUSA's property and tag are unchanged.

- Account: `383707805`
- Property: `559096033` (CoveredUSA)
- Web stream: `16131650434` (CoveredUSA website, `https://coveredusa.org`)
- Public measurement ID: `G-SS1C1W1VB3`
- Reporting time zone: America/New_York; currency: USD
- Dashboard: https://analytics.google.com/analytics/web/#/a383707805p559096033/reports/intelligenthome

## Collection

`GoogleAnalytics` is mounted once in the root layout. It loads the Google tag only
on `coveredusa.org` and `www.coveredusa.org`, then sends a pageview on initial load
and client-side pathname changes. Development and Vercel preview hosts are excluded.

**Keep Enhanced measurement OFF in the web stream.** This was explicitly approved
by Jacob. Automatic history-based pageviews would duplicate controlled pageviews
and could send unfiltered URLs. Form, link, download, and search tracking are off.

The integration strips query strings/fragments, masks everything after `/results`,
and reduces external referrers to their origins. Only `utm_source`, `utm_medium`,
and `utm_campaign` are retained as campaign fields, with character/length checks.
It sends no form answers, contact information, uploaded bills, or submission IDs.
Google signals and advertising personalization are disabled in the tag configuration.

The existing internal `/api/analytics` tracker remains in place. Its optional GA
AI-referral event also uses the sanitized pathname.

## Validation

Run `node --import ./scripts/register-ts.mjs --no-warnings scripts/test-google-analytics.ts`
and `npx tsc --noEmit --incremental false`, then build the site.
After deployment, visit the live site and confirm activity in this property's
Realtime report. Standard reports take longer to populate and cannot backfill
visits from before this tag was installed.
