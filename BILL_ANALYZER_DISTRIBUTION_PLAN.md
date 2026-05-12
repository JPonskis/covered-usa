# Medical Bill Analyzer — Content & Distribution Plan

**Created:** 2026-05-11
**Goal:** Build a multi-channel distribution engine (SEO, Reddit, social media) to drive users to the Medical Bill Analyzer and CoveredUSA screener.
**Working Directory:** `/Users/frankthebot/clawd/projects/covered-usa/`
**Reference:** `research/medical-bill-analyzer-content-strategy.md`, `research/MEDICAL_BILL_ANALYZER.md`

---

## Overview

Distribution is the entire game. The Medical Bill Analyzer is only valuable if people find it. This plan covers three channels that work together:

1. **SEO / GEO** (long game) — Articles, hospital pages, and procedure cost pages optimized for AI engines
2. **Reddit AEO** (medium game) — Expand existing Reddit cron to healthcare bill subreddits
3. **Social Media** (fast game) — Screen recording + voiceover content on TikTok/Reels/Shorts

Each channel feeds the others: social media drives direct traffic and Reddit engagement. Reddit answers get pulled into AI search. SEO articles get cited by AI engines. The tool page itself ranks for high-intent queries.

**Key principle:** We're optimizing for AI citation, not Google rankings. Every piece of content is structured so AI engines can extract and cite it. Google organic is a bonus, not the target.

## Success Criteria

The distribution system is DONE when ALL of these are true:
- [ ] 20+ medical bill/debt articles published on CoveredUSA blog (from existing sheet queue)
- [ ] Article writer agent updated to include bill analyzer CTA alongside screener CTA
- [ ] Reddit cron expanded to monitor r/HospitalBills, r/MedicalBill, r/HealthInsurance
- [ ] Reddit drafter updated with bill analyzer context and link format
- [ ] 15 hook scripts saved and ready for video production
- [ ] Content calendar template created for Jacob's first 2 weeks of posting
- [ ] Hospital charity care page template created (for future Phase 2 scale)
- [ ] Procedure cost page template created (for future Phase 2 scale)

---

## CHANNEL 1: SEO / GEO (AI-Optimized Content)

### Existing Infrastructure

The CoveredUSA SEO system is already running:
- **Article writer agent:** `/Users/frankthebot/clawd/.claude/agents/coveredusa-article-writer.md`
- **Selection script:** `/Users/frankthebot/clawd/scripts/coveredusa-select-articles.js`
- **Google Sheet:** `1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU`
- **Stage 1 cron:** Runs 3x/day, selects 3 articles, writes in parallel
- **Stage 2 cron:** Deploys + IndexNow submits
- **56 medical debt/pharma articles already queued** (CU-130 through CU-185, added today)

The pipeline is working. The changes needed are:

### TASK 1: Update Article Writer Agent for Bill Analyzer CTA

- **Status:** todo
- **Difficulty:** Easy

### What to Do
1. Edit `/Users/frankthebot/clawd/.claude/agents/coveredusa-article-writer.md`
2. Add a second CTA target: when the article topic relates to medical bills, hospital charges, medical debt, or billing errors, include a CTA to `/medical-bill-analyzer` in addition to (or instead of) the screener
3. Update the CTA copy:
   - Medical debt articles: "Upload your medical bill to our free analyzer to check for overcharges and billing errors"
   - Coverage/eligibility articles: keep existing screener CTA
   - Mixed articles: include both
4. Add the bill analyzer to the article writer's product context section

### Success Criteria
- [ ] Articles about medical bills link to the analyzer
- [ ] Articles about coverage/eligibility still link to screener
- [ ] CTA language is natural, not forced

---

### TASK 2: Enforce Island Test in Article Writer

- **Status:** todo
- **Difficulty:** Easy

### What to Do
1. Edit the article writer agent prompt to enforce the Island Test:
   - Every paragraph stands alone
   - No pronouns after headings (use explicit nouns)
   - SVO sentence structure
   - Every paragraph could be extracted by an AI and still make sense in isolation
2. Add to the writing rules section:
   ```
   ISLAND TEST: Every paragraph must stand alone. Never use "it", "this", "these" 
   to refer to something in a previous paragraph. Repeat the noun. 
   After every H2/H3, the first sentence must re-establish full context.
   Example BAD: "This program helps families..." (what program?)
   Example GOOD: "The Medicare Savings Program helps families..."
   ```

### Success Criteria
- [ ] Article writer prompt includes Island Test rules
- [ ] Spot-check 2-3 articles written after the update

---

### TASK 3: Create Hospital Charity Care Page Template

- **Status:** todo
- **Difficulty:** Medium

### What to Do
This is the template for the 2,900+ hospital-specific pages (Phase 2 build). Creating the template now so it's ready when we scale.

1. Create `/src/app/[locale]/hospitals/[slug]/page.tsx`
2. Template content (each hospital page):
   - H1: "[Hospital Name] Financial Assistance Program"
   - Summary: nonprofit status, income limits, application process
   - Structured data: FAQPage schema, LocalBusiness schema
   - "Check Your Bill" CTA → bill analyzer
   - "Check Your Benefits" CTA → screener
   - Related hospitals in same state (internal links)
3. Create a data file format for hospital entries: `src/lib/hospitals/data/[slug].json`
4. For MVP: create 5 example hospital pages (top 5 hospital systems by volume)
5. Include meta tags optimized for: "[Hospital Name] financial assistance", "[Hospital Name] charity care", "[Hospital Name] bill help"

### Notes
- We are NOT building all 2,900 pages now — just the template + 5 examples
- The full database build is a separate Phase 2 project
- Each page should target the queries: "[hospital] financial assistance", "[hospital] charity care", "[hospital] bill forgiveness"

### Success Criteria
- [ ] Template renders correctly for 5 example hospitals
- [ ] FAQPage + LocalBusiness schema present
- [ ] CTAs link to both analyzer and screener
- [ ] Pages are indexable and in sitemap

---

### TASK 4: Create Procedure Cost Page Template

- **Status:** todo
- **Difficulty:** Medium

### What to Do
Another Phase 2 template. These pages answer "how much does [procedure] cost?" using CMS data.

1. Create `/src/app/[locale]/costs/[procedure]/page.tsx`
2. Template content:
   - H1: "How Much Does [Procedure] Cost in 2026?"
   - National Medicare rate (from CMS data)
   - Average hospital chargemaster price (if available)
   - "Think you were overcharged?" CTA → bill analyzer
   - FAQ section (3-5 questions)
   - Related procedures (internal links)
3. Create data format: `src/lib/costs/data/[procedure-slug].json`
4. For MVP: create 10 example pages for the most searched procedures:
   - MRI, CT scan, ER visit, X-ray, blood work, colonoscopy, physical therapy, ultrasound, EKG, mammogram
5. These pages pull directly from the CMS data pipeline (Build Plan Task 1)

### Success Criteria
- [ ] Template renders for 10 common procedures
- [ ] Shows Medicare rate with source citation
- [ ] CTA links to analyzer
- [ ] FAQPage schema present

---

### TASK 5: Create State Medical Debt Law Pages

- **Status:** todo  
- **Difficulty:** Medium

### What to Do
50 state-specific pages covering medical debt protections, statute of limitations, and charity care requirements.

1. Create `/src/app/[locale]/medical-debt/[state]/page.tsx`
2. Template content per state:
   - H1: "[State] Medical Debt Laws & Protections (2026)"
   - Statute of limitations for medical debt
   - State-specific patient protections
   - Charity care requirements (if state has additional requirements beyond federal 501(r))
   - Collection agency rules
   - "Check Your Bill" CTA → analyzer
   - "Check Your Benefits" CTA → screener
3. Research data for all 50 states + DC (this is the hard part — needs web research per state)
4. For MVP: create 10 pages for highest-population states (CA, TX, FL, NY, PA, IL, OH, GA, NC, MI)
5. Store state data in `src/lib/medical-debt/data/[state].json`

### Success Criteria
- [ ] 10 state pages with accurate legal info
- [ ] Each cites sources (state statute numbers)
- [ ] FAQPage schema
- [ ] Internal links to related articles and tools

---

## CHANNEL 2: Reddit AEO (Answer Engine Optimization)

### Existing Infrastructure

The Reddit system is mature and battle-tested:
- **Orchestrator:** `/Users/frankthebot/clawd/projects/benefits-navigator/reddit-engagement/`
- **Pipeline:** Scanner → Drafter → Poster (Playwright browser automation)
- **Account:** Kind-Translator3195
- **Current subreddits:** r/benefitsadvice, r/SSDI, r/Medicaid, r/foodstamps, r/disability
- **Current phase:** `week5_limited_links` (links allowed, 4:1 ratio)
- **264 total comments posted**, 1 shadow ban detected
- **Crons:** reddit-am (4 AM), reddit-pm (1 PM)

### TASK 6: Add Healthcare Bill Subreddits to Scanner

- **Status:** todo
- **Difficulty:** Easy

### What to Do
1. Edit `projects/benefits-navigator/reddit-engagement/config.json`
2. **IMPORTANT: Stagger the rollout.** The account has 1 shadow ban on record. Adding 3 subreddits at once looks like spam behavior to Reddit's classifier. Add ONE new subreddit per week:
   - **Week 1:** r/HospitalBills (lowest risk, most relevant)
   ```json
   {
     "name": "HospitalBills",
     "riskLevel": "low",
     "context": "People sharing hospital bills and asking for help disputing or understanding them. Link to CoveredUSA bill analyzer when relevant.",
     "phase": 0
   }
   ```
   - **Week 2:** r/MedicalBill
   ```json
   {
     "name": "MedicalBill",
     "riskLevel": "low", 
     "context": "Similar to HospitalBills. People confused by their medical bills.",
     "phase": 0
   }
   ```
   - **Week 3:** r/HealthInsurance (stricter moderation, more aggressive link removal)
   ```json
   {
     "name": "HealthInsurance",
     "riskLevel": "medium",
     "context": "Insurance questions. Relevant when people are asking about coverage gaps, surprise bills, or out-of-network charges. STRICT moderation — pure value only, links only after 10+ pure-value comments in this sub.",
     "phase": 0
   }
   ```
   Note: `phase: 0` means NO LINKS initially in new subreddits. Build pure-value comment history first. Links only after 10+ helpful comments in each sub.
3. Add bill-analyzer-related keywords to scanner filter:
   - "hospital bill", "medical bill", "overcharged", "billing error", "charity care", "financial assistance", "can't afford", "surprise bill", "out of network", "dispute bill"

### Success Criteria
- [ ] Scanner picks up posts from new subreddits
- [ ] Keywords catch relevant posts
- [ ] Risk levels are appropriate

---

### TASK 7: Update Reddit Drafter for Bill Analyzer Context

- **Status:** todo
- **Difficulty:** Medium

### What to Do
1. Edit `projects/benefits-navigator/reddit-engagement/drafter/index.js`
2. Add bill analyzer awareness to the drafting prompt:
   - When the post is about a hospital bill, medical bill, or overcharges: the comment should offer genuinely helpful advice about disputing, AND mention the free tool when link budget allows
   - Link format: `https://www.coveredusa.org/en/medical-bill-analyzer?utm_source=reddit&utm_medium=comment&utm_campaign={sub}-{post_id}`
   - The comment should never be "just use this tool" — lead with real advice, tool is supplementary
3. Add CoveredUSA as a second allowed link domain (currently only `benefitsusa.org`)
4. Update link budget to track CoveredUSA links separately from BenefitsUSA links
5. Add subreddit-specific persona context:
   - r/HospitalBills: "You've dealt with ridiculous hospital bills before. You know most people don't realize they can dispute."
   - r/MedicalBill: "You've helped friends check their bills for errors. You know 80% of bills have mistakes."
   - r/HealthInsurance: "You understand coverage gaps. You know about charity care and financial assistance."

### Success Criteria
- [ ] Drafter generates relevant comments for bill-related posts
- [ ] CoveredUSA links use correct UTM format
- [ ] Comments lead with advice, not promotion
- [ ] Link budget tracks both domains separately
- [ ] Voice matches existing persona style

---

### TASK 8: Test Reddit Expansion with Dry Run

- **Status:** todo
- **Difficulty:** Easy
- **Dependencies:** Tasks 6, 7

### What to Do
1. Run scanner with `--dry-run` flag against new subreddits
2. Check that it finds relevant posts
3. Run drafter against 3-5 found posts to verify comment quality
4. Do NOT post yet — review output manually first
5. Share sample comments with Jacob for approval before going live

### Success Criteria
- [ ] Scanner finds 5+ relevant posts from new subreddits
- [ ] Drafted comments are helpful and natural
- [ ] No promotional tone
- [ ] Jacob approves the comment style

---

## CHANNEL 3: Social Media (Screen Recording + Voiceover)

### TASK 9: Create Video Hook Scripts

- **Status:** todo
- **Difficulty:** Easy

### What to Do
1. Create `/Users/frankthebot/clawd/projects/covered-usa/content/video-scripts/`
2. Write 15 hook scripts, each with:
   - **Hook** (first 3 seconds — the reason someone stops scrolling)
   - **Body** (15-30 seconds — the content)
   - **CTA** (3 seconds — what to do next)
   - **Format notes** (screen recording vs slideshow)
3. Categories:
   - 5 outrage hooks (overcharges, absurd pricing)
   - 5 information hooks (rights, laws, charity care)
   - 5 before/after hooks (bill analysis results)
4. Each script should work as a voiceover over screen recording of the tool

### Example Script Format
```markdown
# Script 01: The $8,000 ER Visit

**Hook:** "This hospital charged $8,000 for an ER visit. Let's see what it should actually cost."

**Body:** [Screen recording: upload bill to analyzer]
"So I uploaded this bill to a free tool that compares every charge to what Medicare actually pays. 
Line one, emergency room evaluation: charged $3,200. Medicare rate? $450.
Line two, CT scan: charged $2,800. Medicare rate? $340.
Line three, IV fluids: charged $1,400. Medicare rate? $85.
Total billed: $8,000. Total at Medicare rates: $1,100. 
That's a 7x markup."

**CTA:** "Link in bio. It's free. Upload your bill."

**Format:** Screen recording of tool with voiceover
**Duration:** ~45 seconds
```

### Success Criteria
- [ ] 15 scripts written
- [ ] Mix of formats (outrage, info, before/after)
- [ ] Each is under 60 seconds
- [ ] CTAs drive to the tool

---

### TASK 10: Create Content Calendar (First 2 Weeks)

- **Status:** todo
- **Difficulty:** Easy

### What to Do
1. Create `/Users/frankthebot/clawd/projects/covered-usa/content/CONTENT_CALENDAR.md`
2. Plan 14 days of content, 2 posts/day (28 total pieces)
3. Mix of:
   - Screen recordings of the tool (primary — needs tool to be built first)
   - Slideshow/educational content (can make now via larry-marketing)
   - "Did you know" facts about medical billing
4. Platform distribution: same content across TikTok, Reels, Shorts
5. Posting times: research and recommend optimal times for healthcare/finance content
6. Include which hook script maps to which day
7. Mark which pieces require the tool vs which can be made now

### Success Criteria
- [ ] 28 content pieces planned across 14 days
- [ ] Clear distinction between "needs tool" and "can make now"
- [ ] Posting times specified
- [ ] Each piece has a hook script reference

---

### TASK 11: Set Up larry-marketing for Slideshow Content

- **Status:** todo
- **Difficulty:** Medium

### What to Do
1. Read `/Users/frankthebot/clawd/.claude/skills/larry-marketing/SKILL.md`
2. Configure for CoveredUSA medical bill content:
   - Brand colors: navy (#1a365d), forest green (#059669), cream (#FDF8F3)
   - Logo/branding: CoveredUSA
   - Content themes: medical bill facts, patient rights, charity care eligibility
3. Create 5 slideshow posts as a test batch:
   - "5 Things Hospitals Don't Want You to Know About Your Bill"
   - "The 501(r) Law That Can Erase Your Hospital Debt"
   - "80% of Hospital Bills Have Errors. Here's How to Check."
   - "What Your Hospital Bill Should Actually Cost (Medicare Rates)"
   - "Free Ways to Fight Back Against Medical Debt"
4. These can be produced immediately — don't need the tool to be built

### Success Criteria
- [ ] 5 slideshow posts created
- [ ] Brand-consistent design
- [ ] Ready to post on TikTok/Instagram
- [ ] Can be produced before tool is built

---

### TASK 12: Create Benefits Screener Content Plan

- **Status:** todo
- **Difficulty:** Easy

### What to Do
Jacob also wants to make content for the Benefits USA screener using the same approach.

1. Create `/Users/frankthebot/clawd/projects/benefits-usa/SCREENER_CONTENT_PLAN.md`
2. Define video format for screener content:
   - "Let's see what a [persona] in [state] qualifies for"
   - Screen record the screener with different scenarios
   - Voiceover explaining each result
3. Write 10 screener hook scripts:
   - "A single mom in Texas making $28K might qualify for $15,000+ in benefits"
   - "Most people don't know they qualify for free health insurance"
   - "Let's see what a family of 4 in California can get"
4. Same format: hook + body + CTA, voiceover over screen recording
5. Same platform distribution: TikTok, Reels, Shorts

### Success Criteria
- [ ] 10 screener-specific hook scripts
- [ ] Diverse scenarios (different states, family sizes, income levels)
- [ ] Real numbers from the screener (run scenarios to get actual dollar amounts)

---

## Integration: How Everything Connects

```
┌──────────────────────────────────────────────────┐
│                 SOCIAL MEDIA                      │
│   Screen recordings + voiceover + slideshows     │
│   → Direct traffic to tool                       │
│   → Comments mention CoveredUSA                  │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│              BILL ANALYZER TOOL                   │
│   User uploads bill → gets analysis              │
│   → "You may qualify for..." → SCREENER          │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│              BENEFITS SCREENER                    │
│   User checks eligibility → email capture        │
│   → Lead to broker → 40% rev share              │
└──────────────────────────────────────────────────┘
               ▲
               │
┌──────────────┴───────────────────────────────────┐
│              SEO / GEO ARTICLES                   │
│   Medical debt articles → link to analyzer       │
│   Coverage articles → link to screener           │
│   Hospital pages → link to both                  │
│   Procedure cost pages → link to analyzer        │
│   All optimized for AI citation                  │
└──────────────────────────────────────────────────┘
               ▲
               │
┌──────────────┴───────────────────────────────────┐
│              REDDIT AEO                           │
│   Help people in r/HospitalBills etc.            │
│   → Link to tool when relevant                   │
│   → Reddit answers feed AI search results        │
└──────────────────────────────────────────────────┘
```

## Execution Order

```
CAN START IMMEDIATELY (no tool needed):
  Task 1: Update article writer agent CTA
  Task 2: Enforce Island Test
  Task 6: Add subreddits to scanner
  Task 7: Update Reddit drafter
  Task 9: Write video hook scripts
  Task 10: Create content calendar
  Task 11: Set up larry-marketing slideshows
  Task 12: Benefits screener content plan

AFTER REDDIT UPDATES:
  Task 8: Dry run test

TEMPLATES (can build anytime, populate later):
  Task 3: Hospital charity care page template
  Task 4: Procedure cost page template
  Task 5: State medical debt law pages

AFTER TOOL IS BUILT:
  - Film screen recording content
  - Start posting tool demo videos
  - Go live on Reddit with tool links
```

**Key insight:** Most distribution work can start BEFORE the tool is built. Slideshows, educational content, Reddit expansion, article updates, and hook scripts can all be done immediately. Screen recordings of the actual tool come after the build.

---

## CHANNEL 4: Additional Distribution (Low-Effort, High-Impact)

These were identified by verification review as missing channels that require minimal effort:

### TASK 13: Email Capture on Analyzer Results Page

- **Status:** todo
- **Difficulty:** Easy

### What to Do
1. After bill analysis results, prompt for email: "Want to save your results? Enter your email."
2. Follow the existing `EmailCaptureModal.tsx` pattern from the screener
3. Add to existing Resend email sequences — send a follow-up with:
   - Their analysis summary (dispute letter attached)
   - Link to screener
   - "Share this tool" referral link
4. This captures users who don't immediately click the screener — re-engage via email

### Success Criteria
- [ ] Email capture modal on results page
- [ ] Follow-up email with results + screener link
- [ ] Uses existing Resend infrastructure

---

### TASK 14: PR / Earned Media Prep

- **Status:** todo
- **Difficulty:** Medium

### What to Do
1. Write a press-ready one-pager about the tool (what it does, who it helps, the "college student built it" angle)
2. Compile a list of 20 journalists/newsletters to pitch:
   - Health beat reporters at local papers (LA Times, etc.)
   - Personal finance newsletters (Morning Brew, The Hustle)
   - Healthcare trade pubs
   - College press (The Dartmouth)
3. Draft a pitch email template (apply humanizer skill)
4. Save to `/projects/covered-usa/content/pr/`
5. Do NOT send yet — Jacob reviews and sends when tool is live

### Success Criteria
- [ ] One-pager written
- [ ] 20 journalist contacts compiled
- [ ] Pitch email drafted
- [ ] Jacob reviews before anything is sent

---

### TASK 15: Social Account Setup Checklist

- **Status:** todo
- **Difficulty:** Easy

### What to Do
1. Create/verify TikTok account for CoveredUSA
2. Create/verify Instagram account for CoveredUSA
3. Create/verify YouTube channel for CoveredUSA
4. Set up bios with consistent messaging: "Free tools to fight medical bills and find benefits you qualify for"
5. Add link-in-bio (Linktree or similar) pointing to:
   - Medical Bill Analyzer
   - Benefits Screener
   - Blog
6. Document all accounts in a checklist saved to `/projects/covered-usa/content/SOCIAL_ACCOUNTS.md`

### Success Criteria
- [ ] All 3 accounts exist and are configured
- [ ] Bios are consistent
- [ ] Link-in-bio set up with correct URLs

---

## Content Posting Cadence (Revised)

The original plan said 2-3 posts/day. That's unrealistic for one person who's also building tools, doing school, and running another company.

**Revised cadence:**
- **Week 1-2:** 1 post/day (find your voice, build the habit)
- **Week 3-4:** 1-2 posts/day (increase if Week 1-2 content performs)
- **Month 2+:** 2 posts/day max (only if sustainable)

Post the SAME content across TikTok, Reels, and Shorts. Yes, optimal formatting differs per platform, but getting content out matters more than platform-specific optimization at this stage.

**Focus on quality over quantity.** One video that gets 100K views is worth more than 30 videos that get 500 each. Put your energy into hooks and the first 3 seconds.

---

## Metrics to Track

| Metric | Target (Month 1) | Target (Month 3) |
|--------|-------------------|-------------------|
| Bill analyses/day | 10 | 100 |
| Social media views/week | 5K | 50K |
| Reddit comments/week (new subs) | 10 | 20 |
| Articles published | 20 | 60 |
| Screener clicks from analyzer | 2/day | 20/day |
| AI citations (weekly sweep) | 1 | 5 |
| Email captures from analyzer | 3/day | 30/day |

Month 1 targets are conservative — a new brand with no existing audience. Month 3 assumes at least one piece of content gets moderate traction.

**How to measure AI citations:** Use existing citation tracking cron (already running for BenefitsUSA). Add CoveredUSA queries to the sweep: "free medical bill analyzer", "check hospital bill for errors", "hospital charity care lookup".

---

## Content Quality Rules

Before any content goes live that cites statistics:
- **"80% of hospital bills have errors"** — this stat is widely cited but contested (studies range 40-80%). Use "up to 80%" or "studies suggest the majority of hospital bills contain errors" with a source link. Don't state it as unqualified fact.
- **Dollar amounts in before/after hooks** — label as "example" or "based on a demo analysis" if using fabricated bills. FTC endorsement guidelines require disclosure.
- **Dispute letter claims** — always include "this is informational, not legal advice" in both the tool and any content about it.

---

*This plan can be handed to a separate agent for execution. The build plan and distribution plan are designed to run in parallel — distribution prep starts immediately while the tool is being built.*
