# CoveredUSA.org — Complete Strategy & Build Plan

**Created:** 2026-05-11
**Domain:** coveredusa.org (purchased)
**Status:** Building MVP tonight

---

## The Big Picture

### What Is This?

A healthcare-focused eligibility screening tool that helps people find out if they qualify for Medicaid, ACA marketplace plans, Medicare, Medicare Savings Programs, CHIP, or VA healthcare. When someone completes the screener, they become a qualified lead that gets routed to a licensed broker (Help Plan Advocates) who enrolls them. Jacob gets 40% rev share on every enrollment.

### Why This Exists (Jacob's Strategy)

Benefits USA (benefitsusa.org) is a broad government benefits screener — 21 programs. It's a great tool but has two problems:

1. **Traffic died.** Bing SEO was the only real channel (0 → 11K impressions/day, 315 clicks/day in 2 months). Then a URL restructure on April 17, 2026 tanked it to zero. Google never worked (YMYL penalty on fresh sites). Orgs don't distribute. Minimal ads didn't convert.

2. **Intent mismatch.** People who search for general benefits (SNAP, food stamps, FPL tables) don't have healthcare purchase intent. Of $20 in ads sending traffic to the broad screener, 3 completions, 0 wanted ACA/Medicare help. The funnel from "general benefits user" → "healthcare lead" is too leaky.

**CoveredUSA solves both problems:**
- Fresh domain = clean SEO slate (Benefits USA's Bing domain trust is damaged)
- Healthcare-only focus = every visitor has healthcare intent = every completion is a monetizable lead
- Same AI-optimized SEO engine that was proven to work, pointed at healthcare keywords

### The Revenue Model

- Broker: Help Plan Advocates (Aaron)
- Deal: 40% rev share on enrollments
- Lead value: ACA lead → enrollment → broker commission ~$300-500 → Jacob gets $120-200
- Medicare lead → enrollment → broker commission varies → Jacob gets 40%
- **NOT pay-per-lead.** Only pay on enrollment. Higher risk, higher reward.
- At 5 enrolled leads/day = $600-1000/day revenue

### Why Now

1. Broker deal is closed (Help Plan Advocates onboarded)
2. Spanish UGC video ads are ready to run (made tonight — ACA + Medicare)
3. SEO content engine is battle-tested (5-10 articles/day at scale)
4. All eligibility logic already exists in Benefits USA codebase
5. The competition isn't doing AI-optimized content for Bing/AI search
6. Spanish-language healthcare content is massively underserved

### Relationship to Benefits USA

Benefits USA is NOT being abandoned. It's the long-term play (Credit Karma for government benefits). CoveredUSA is the revenue engine — the thing that pays the bills while the broader vision compounds. Think of it like Google's AdWords funding everything else.

They're complementary:
- Benefits USA = broad tool, brand, long-term organic traffic play
- CoveredUSA = focused healthcare lead gen, immediate revenue

---

## Jacob's Key Insights (His Words)

> "The only real signal I've had in this entire process is Bing/AI SEO. That's the only thing that popped off and worked. Two months in, in the grand scheme of things, is not crazy."

> "The biggest problem in this space is lead generation. It just is."

> "People aren't really trying to tackle that specific problem in a startup kind of way."

> "If the smartest people in startups were trying to solve the problem of lead generation for Medicare and ACA, how would they do it?"

> "I have a broker who is willing to accept my leads. I just need to generate them."

> "What I realized is that people don't have intent [on the broad screener]. The funnel from screener completed to paying — the big money is Medicare and ACA."

> "What if I just say, for Medicare for ACA, I'm just gonna do some research first, and then try to dominate AI search for those things, and then funnel it all to lead capture for this brokerage?"

> "It's essentially taking my current tool and making it a healthcare screener. That's it."

---

## Competitive Landscape (Pending Deep Research)

**Gemini Deep Research running on:**
- Who else does healthcare eligibility screening online?
- How do major lead gen companies operate? (boberdoo, EverQuote, MediaAlpha)
- How competitive are healthcare keywords on Bing specifically?
- Are health insurance questions common in AI search (ChatGPT, Perplexity, Copilot)?
- CMS/ACA regulatory requirements for lead gen sites
- Flaws/risks in this strategy
- Market size data
- Spanish-language gap quantification

**Gemini Deep Research Completed (May 11, 2026).** Full report saved. Key findings:

**Market Size (confirmed):**
- 23.1M ACA marketplace enrollees (2026), down 4.9% from 2025 after enhanced PTCs lapsed
- 35.57M Medicare Advantage enrollees (51% of all Medicare)
- 75.7M Medicaid + CHIP enrollees
- Combined ACA + Medicare lead-gen market: $4-6B+ annual marketing spend (order of magnitude)

**Unit Economics (confirmed):**
- ACA broker commissions: $20-30 PMPM. Family of 3 = $900/year. 40% rev-share = $360/year/household.
- Medicare Advantage initial commissions: $694-864/year (2026). 40% rev-share = $278-346.
- Real-time exclusive ACA web lead: $20-50. Medicare: $30-60.
- Exclusive Medicare web lead → ~9% issued policy. ACA → 12-18% close rate.

**Spanish Gap (confirmed and quantified):**
- CuidadoDeSalud.gov: only 303K visits/month vs HealthCare.gov's 6.2M
- Hispanic uninsured: 18.4% vs 6.8% non-Hispanic White
- 3.8M of 10.2M uninsured Latinos use Spanish as main language
- CuidadoDeSalud.gov criticized by navigators as "Spanglish" with poor UX
- No existing player owns Spanish healthcare eligibility query space

**AI Search (confirmed):**
- ChatGPT search runs on Bing's index — optimizing for Bing = optimizing for ChatGPT
- Content updated within 30 days gets 3.2x more AI citations
- Only 12% cross-platform citation overlap — can be cited by AI without ranking #1 on Google
- No Spanish-language AI citation study exists for healthcare — first mover terrain

**Regulatory Notes:**
- TPMO disclaimer required on site (already planned)
- Compliance burden is on the broker (call recording, SOA, PEWC), not the referral site
- ACA "switcher fraud" crackdown was on unauthorized enrollments — not relevant to us
- Google scaled content abuse policy: relevant for Google rankings, less so for Bing/AI

**Known competitors:**
- healthcare.gov (government, not lead gen)
- eHealth ($461.6M commission revenue 2024, named in DOJ complaint May 2025)
- GoHealth (revenue collapsed 54.7% in 2025, $497.8M net loss, negative equity)
- HealthSherpa (dominant ACA enrollment platform, 3M+ monthly visits)
- SelectQuote (named in DOJ complaint)
- Assurance IQ (shut down May 2024, $381M losses, $100M FTC settlement)
- BenefitsCheckUp/NCOA (only multi-program screener with credibility, but not SEO/AI optimized, not commercial intent)
- Stride Health (gig/1099 focused, ~4.6M cumulative users)

**Why none of them are doing what Jacob's doing:**
- Nobody is optimizing for AI search (new channel, <2 years old)
- Nobody is doing Spanish-first content at scale
- Everyone is fighting over Google Ads ($50-100/click for healthcare)
- The big players are brokerages, not lead gen tools with organic distribution
- The paid-ads-only model is collapsing (GoHealth, Assurance IQ, e-TeleQuote all failed)

---

## Technical Architecture

### Stack (Same as Benefits USA)
- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (same project, new tables)
- Vercel deployment
- next-intl for i18n (en/es)

### What We're Stealing From Benefits USA

**Eligibility Engine (keeping these programs only):**
- ACA Marketplace (`src/lib/eligibility/programs/aca.ts`)
- Medicaid (`src/lib/eligibility/programs/medicaid.ts`)
- Medicare (`src/lib/eligibility/programs/medicare.ts`)
- Medicare Savings Program (`src/lib/eligibility/programs/medicare-savings.ts`)
- CHIP (for children) — build new or extract from Medicaid logic
- VA Healthcare (`src/lib/eligibility/programs/va-healthcare.ts`)

**Screener Questions (simplified — only need healthcare-relevant fields):**
- zipCode, state
- age
- householdSize
- annualIncome
- employmentStatus (for ACA employer coverage check)
- isPregnant (Medicaid pregnancy threshold)
- hasDisability (Medicare disability pathway)
- currentlyInsured, insuranceSource
- citizenshipStatus
- isVeteran (VA eligibility)

That's ~10 questions vs Benefits USA's 44. Way faster. 2-minute screener max.

**Infrastructure to copy:**
- i18n setup (next-intl, en/es message files)
- Blog system (markdown parsing, MDX rendering)
- Supabase client setup
- Vercel deployment config
- Email system (Resend) — adapt for healthcare follow-ups
- PDF results download (simplified)
- IndexNow API integration

### LLM Optimizations to Replicate (Non-Blog, Site-Level)

These are the things that made Benefits USA get cited by AI search engines:

1. **robots.txt** — Explicitly allow all AI bots:
   - OAI-SearchBot, ChatGPT-User, GPTBot (OpenAI)
   - ClaudeBot, claude-web, anthropic-ai (Anthropic)
   - PerplexityBot, Perplexity-User
   - Google-Extended, Amazonbot, Applebot, Applebot-Extended
   - DuckAssistBot, CCBot
   - Block Bytespider (Chinese crawler)
   - Disallow /api/ and /_next/

2. **Structured Data (Schema.org JSON-LD):**
   - `SpeakableSpecification` — tells AI which content to read aloud/cite (targets h1, [data-speakable], first paragraph)
   - `BreadcrumbList` — helps AI understand site hierarchy
   - `FAQPage` — FAQ content gets pulled directly into AI answers
   - `WebApplication` — signals this is an interactive tool
   - `HowTo` — step-by-step usage that AI can cite as instructions

3. **AI Referral Detection** (`AnalyticsTracker.tsx`):
   - Detects visits from ChatGPT, Perplexity, Claude, Gemini, Copilot, Bing Chat, DuckDuckGo AI, You.com, Grok, Phind, Kagi, Brave Leo, Mistral
   - Persists source in sessionStorage across page navigations
   - Logs to Supabase `ai_analytics` table
   - Critical for measuring which AI engines cite us

4. **Sitemap with hreflang alternates:**
   - Every page has en/es alternate links
   - Smart: only adds Spanish alternate if translation actually exists (avoids 404 penalties)
   - Priority hints: homepage 1.0, screener 0.9, blog posts 0.7
   - Change frequency signals (daily for homepage, monthly for posts)

5. **Reference Data Pages** (these are what AI engines LOVE to cite):
   - Federal Poverty Level tables
   - Income limits by state for each program
   - Eligibility charts/comparison matrices
   - These are the equivalent of "answer boxes" — structured, factual, citable

6. **Clean URL structure:**
   - No query parameters for main content
   - State pages as clean slugs: /ca, /tx, /fl
   - Blog at /en/blog/[slug] and /es/blog/[slug]
   - No redirects on launch (Benefits USA's redirects are what killed Bing trust)

7. **Meta tags:**
   - OpenGraph + Twitter cards on every page
   - Bing verification meta tag
   - Canonical URLs (prevent duplicate content)
   - Keyword meta tags (still used by Bing)

8. **Content formatting for LLMs:**
   - Clear H2/H3 hierarchy
   - Tables for data (LLMs parse tables well)
   - Bullet points for lists
   - Direct answers early in content (not buried after long intros)
   - FAQ sections with clear Q&A format

### New Database Tables (same Supabase project)

```sql
-- Main submissions table
CREATE TABLE covered_usa_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  zip_code TEXT,
  state TEXT,
  age INT,
  household_size INT,
  annual_income NUMERIC,
  employment_status TEXT,
  is_pregnant BOOLEAN DEFAULT FALSE,
  has_disability BOOLEAN DEFAULT FALSE,
  currently_insured BOOLEAN,
  insurance_source TEXT,
  citizenship_status TEXT,
  is_veteran BOOLEAN DEFAULT FALSE,
  -- Results
  eligible_programs JSONB,
  -- Lead capture
  first_name TEXT,
  phone TEXT,
  email TEXT,
  language TEXT DEFAULT 'en',
  wants_help BOOLEAN DEFAULT FALSE,
  -- Broker routing
  lead_sent_to_broker BOOLEAN DEFAULT FALSE,
  broker_sent_at TIMESTAMPTZ,
  enrollment_confirmed BOOLEAN DEFAULT FALSE,
  enrollment_confirmed_at TIMESTAMPTZ,
  -- Tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ai_source TEXT,
  referral_url TEXT
);

-- AI analytics (same structure as Benefits USA)
CREATE TABLE covered_usa_ai_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  page_path TEXT,
  ai_source TEXT,
  country TEXT
);
```

---

## Content Strategy

### SEO Article Engine

Same system as Benefits USA. 5 articles/day (may adjust based on quality vs volume tradeoff — Google penalizes "scaled content abuse" but Bing doesn't apply the same rules. Focus on density and quality regardless of volume). Every article optimized for AI search citation.

### E-E-A-T Signals (Critical for AI Citations)

Per Gemini deep research: AI engines prioritize content with Experience, Expertise, Authoritativeness, Trustworthiness signals. Every article and reference page must include:

1. **Author bio with credentials.** Create an author identity (e.g., "CoveredUSA Editorial Team, reviewed by a licensed health insurance professional"). Eventually get a real licensed agent's NPN (National Producer Number) visible on the site.
2. **Cite primary sources in every article.** CMS.gov, HealthCare.gov, KFF.org, ASPE.hhs.gov, Medicare.gov, Medicaid.gov. Not just links — inline citations that AI can trace.
3. **"Last updated" dates on all reference pages.** Content freshness = 3.2x more AI citations (Qwairy data, 118K AI responses). Update Medicaid income limits, ACA subsidy info, Medicare premiums monthly.
4. **Plain-language summaries at the top of every article.** 1-3 sentences an AI can lift verbatim as an answer. FAQ schema wrapping these.
5. **Schema markup:** HealthInsurancePlan, FAQPage, GovernmentService types. WebApplication for the screener.
6. **TPMO disclaimer on all pages** (already in footer, but ensure it's prominent): "We do not offer every plan available in your area. Currently we connect you with licensed agents who can help you explore your options. You can always contact Medicare.gov, 1-800-MEDICARE, or your local State Health Insurance Program (SHIP) for help with plan choices."

**Keyword Categories (broad healthcare, not just ACA/Medicare):**

Tier 1 — High monetization intent:
- "Do I qualify for free health insurance [state]?"
- "Medicare eligibility requirements 2026"
- "ACA marketplace plans [state]"
- "How to enroll in Medicaid [state]"
- "Medicare Part D enrollment"
- "¿Califico para seguro médico gratis?"
- "Ayuda con Medicare en español"
- "Planes de salud ACA [state]"

Tier 2 — Informational (drives traffic, builds authority):
- "Medicaid income limits by state 2026"
- "Medicare vs Medicaid difference"
- "What is the ACA marketplace"
- "Health insurance for self-employed"
- "CHIP eligibility for children"
- "Medicare enrollment periods explained"
- "Medicaid expansion states list"

Tier 3 — Broad health topics (high volume, lower intent):
- "How to get health insurance without a job"
- "Cheapest health insurance options"
- "Health insurance open enrollment dates 2026"
- "Can I get health insurance if I missed open enrollment"
- "Prescription drug assistance programs"

**Every article ends with:** CTA linking to the screener. "Check if you qualify in 2 minutes — free, confidential, available in Spanish."

### Reference Pages (AI Citation Magnets)

These are structured data pages that AI engines love to cite:
- `/medicaid-income-limits` — State-by-state table
- `/medicare-eligibility-guide` — Age, disability, ESRD pathways
- `/aca-income-limits` — FPL thresholds for subsidies by state
- `/aca-open-enrollment-dates` — Current year dates
- `/chip-eligibility` — State-by-state for children
- `/medicare-enrollment-periods` — IEP, GEP, AEP, SEP explained
- `/health-insurance-types-compared` — ACA vs Medicare vs Medicaid vs CHIP matrix

### Cron Schedule

Benefits USA SEO crons run at specific times. CoveredUSA crons run at DIFFERENT times to avoid resource conflicts.

**Benefits USA (existing):** Runs early morning UTC
**CoveredUSA (new):** Will run at different time — TBD after checking current cron schedule

---

## Build Plan — Execution Phases

### Phase 1: Foundation (Tonight)

1. ~~Fork Benefits USA deploy repo~~ → Create fresh Next.js project inspired by Benefits USA
2. Set up project structure matching Benefits USA's architecture
3. Configure Vercel project + domain (coveredusa.org)
4. Set up Tailwind with new color scheme (blues/teals — healthcare trust colors)
5. Configure next-intl (en/es)
6. Set up Supabase client (same project, new tables)
7. Create new tables in Supabase (covered_usa_submissions, covered_usa_ai_analytics)
8. Set up robots.txt with full AI bot allowlist
9. Set up sitemap.ts with hreflang alternates
10. Set up structured data utilities (Speakable, FAQ, WebApplication, HowTo, Breadcrumb)
11. Set up AI referral detection (AnalyticsTracker adapted)
12. Set up IndexNow for Bing
13. Privacy policy, terms, disclaimers (adapted from Benefits USA, healthcare-specific)
14. Bing Webmaster Tools verification

### Phase 2: Screener Tool (Tonight)

15. Build simplified screener UI (10 questions max, 2-minute completion)
16. Port eligibility logic for: ACA, Medicaid, Medicare, Medicare Savings, CHIP, VA Healthcare
17. Results page with clear eligibility determination
18. Lead capture CTA on results: "Want free help enrolling? A licensed agent speaks your language."
19. Lead capture form: first name, phone, email, preferred language
20. Store submission in Supabase
21. Broker endpoint placeholder (POST to broker API when endpoint provided)
22. Thank you / confirmation page after lead capture
23. Full Spanish translation of screener + results

### Phase 3: Homepage & Core Pages (Tonight)

24. Homepage with hero, trust signals, screener CTA
25. "How it works" section (3 steps: Answer questions → See results → Get free help)
26. FAQ section with structured data
27. Reference pages: Medicaid income limits, ACA income limits, Medicare eligibility guide
28. About page
29. Contact page
30. State pages (simplified — healthcare programs only per state)

### Phase 4: SEO Engine (Tomorrow AM)

31. Set up blog infrastructure (markdown parsing, rendering, slug-based routing)
32. Create blog layout with LLM-optimized content formatting
33. Deep dive into Benefits USA's article generation cron system
34. Copy and adapt the pipeline for healthcare keywords
35. Write initial batch of seed articles (10-20 manually to bootstrap)
36. Set up article generation cron at non-conflicting time
37. Configure IndexNow to ping Bing on each new article publish
38. Submit sitemap to Bing Webmaster Tools

### Phase 5: Go Live & Launch

39. Deploy to Vercel
40. Point coveredusa.org DNS to Vercel
41. Verify all pages rendering correctly in both languages
42. Submit sitemap to Bing + Google
43. Set up Bing Webmaster Tools
44. Run first batch of articles through cron
45. Point Spanish UGC video ads to CoveredUSA
46. Wire up broker endpoint when Aaron provides POST URL

---

## Ads Strategy (Immediate Traffic While SEO Ramps)

**Already made (tonight):**
- ACA Spanish UGC video ad (photo-to-video, 15-second, 9:16 vertical)
- Medicare Spanish UGC video ad (photo-to-video, 15-second, 9:16 vertical)

**Ad → Site flow:**
- Facebook/Instagram ad (Spanish, UGC style) → CoveredUSA landing page → Screener → Results → Lead capture → Broker

**Landing page for ads:** Should be Spanish-first, matches ad language, direct CTA to screener. Possibly a dedicated `/es/comenzar` or `/es/verificar` page that's streamlined for ad traffic.

**Meta Special Ad Category:** Healthcare ads require Special Ad Category designation. No age/ZIP/gender targeting. Spanish-only content IS the demographic filter.

---

## Compliance & Legal

### ACA Compliance
- $0 cost claims MUST include income qualifier ("depending on income")
- Must state: "CoveredUSA is not a government agency"
- Must disclose: connection to licensed brokers/agents
- "Free" consultation is accurate (brokers paid by insurance companies, not consumers)

### Medicare (CMS) Compliance
- STRICTER than ACA
- Cannot promise specific dollar benefits
- Cannot use "free benefits you're missing" framing
- Cannot use Medicare name/logo in ways implying government endorsement
- CAN: offer free consultation with licensed agent
- CAN: provide educational content about Medicare
- Must include: "CoveredUSA is not connected with or endorsed by the United States government or the federal Medicare program"

### Privacy
- HIPAA doesn't apply (we're not a covered entity) BUT health data is sensitive
- Need health data privacy policy (adapting from Benefits USA)
- CCPA "Do Not Sell" page (California requirement)
- Clear consent language before collecting health-related screening data
- Data retention policy

---

## Broker Integration (Help Plan Advocates)

**Status:** Deal closed. Waiting on:
- [ ] POST URL / API endpoint from Aaron
- [ ] API key or authentication method
- [ ] Confirmation Aaron has Spanish-speaking agents
- [ ] Exact state list for ACA and Medicare coverage
- [ ] Any specific lead format requirements

**Talking points for Aaron email (Monday):** Saved at `/Users/frankthebot/clawd/memory/aaron-email-talking-points-2026-05-12.md`

**Lead data we'll send:**
```json
{
  "first_name": "Maria",
  "phone": "+1-555-123-4567",
  "email": "maria@example.com",
  "state": "CA",
  "age": 42,
  "household_size": 4,
  "annual_income": 35000,
  "eligible_programs": ["aca_marketplace"],
  "language": "es",
  "source": "coveredusa.org",
  "utm_campaign": "spanish_ugc_aca"
}
```

---

## Success Metrics

**Week 1:**
- Site live and functional
- 10+ articles published
- Spanish ads running and driving traffic to site
- First screener completions coming in
- Lead capture working (stored in Supabase even without broker endpoint)

**Month 1:**
- 100+ articles published (healthcare SEO)
- Appearing in Bing results for some healthcare queries
- First leads sent to broker
- First enrollment confirmed (first revenue!)
- Bing impressions trending up

**Month 3:**
- 500+ articles
- Bing/AI search driving organic traffic
- 5-10 leads/day
- Revenue from enrollments covering ad spend + profit

**Month 6:**
- 1000+ articles
- Dominant Spanish healthcare content presence on AI search
- 20-50 leads/day
- Significant monthly revenue
- Potentially add more broker partners for different states/specialties

---

## Key Decisions Made

1. **New domain, not sub-section of Benefits USA** — because Bing domain trust is damaged, and focused branding converts better
2. **English-first with strong Spanish** — because English articles drove more traffic on Benefits USA (larger search volume), but Spanish is the competitive moat
3. **.org domain** — trust signal, mirrors Benefits USA branding
4. **Same Supabase project** — simpler infrastructure, shared capabilities
5. **Same tech stack** — no learning curve, proven at scale
6. **Healthcare only (6 programs)** — not all 21. Focus = intent alignment = better conversion
7. **Simplified screener (10 questions)** — faster completion, lower drop-off, still captures enough data for lead qualification
8. **Revenue share model (not pay-per-lead)** — what the broker offered. Higher risk but potentially much higher reward per lead.

---

## Files & Locations

- **This plan:** `/Users/frankthebot/clawd/projects/covered-usa/PLAN.md`
- **Benefits USA (reference):** `/Users/frankthebot/clawd/projects/benefits-navigator-deploy/`
- **CoveredUSA project:** `/Users/frankthebot/clawd/projects/covered-usa/` (TBD — may use different location for deploy)
- **Spanish UGC ad prompts:** Delivered in chat session (not saved to file — see conversation summary)
- **Broker email talking points:** `/Users/frankthebot/clawd/memory/aaron-email-talking-points-2026-05-12.md`
- **Daily memory:** `/Users/frankthebot/clawd/memory/2026-05-11.md`

---

## What Could Go Wrong

1. **Bing AI search doesn't work for healthcare keywords** — Maybe it only worked for generic FPL queries. Healthcare might be too competitive even on Bing. Mitigated by: Spanish content (less competition), starting with long-tail keywords, ads as bridge.

2. **Low enrollment rate** — We generate leads but broker can't convert them (language barrier, poor follow-up, people aren't serious). Mitigated by: only capturing high-intent leads (people who actively request help), tracking enrollment rates, potentially switching brokers.

3. **CMS compliance issues** — Medicare marketing rules are strict. Could get flagged. Mitigated by: conservative copy, clear disclaimers, educational framing.

4. **Same SEO disaster as Benefits USA** — URL changes, technical issues tank traffic again. Mitigated by: NEVER restructure URLs once set. Clean architecture from day 1. No redirects.

5. **Broker relationship falls apart** — Aaron stops buying leads, company goes under. Mitigated by: build relationships with multiple brokers, don't be dependent on one.

6. **The deep research reveals a fatal flaw** — Maybe someone IS doing this already and doing it well. Wait for Gemini report before investing too heavily.

---

*This document is the single source of truth for the CoveredUSA project. Update it as decisions are made and progress happens.*
