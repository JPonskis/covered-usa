# CoveredUSA Agent Prompts

These are ready-to-go prompts for spinning up parallel agents. Each handles one workstream.

---

## AGENT 1: SEO Article Pipeline Setup (THE BIG ONE)

This agent sets up the full 2-stage SEO cron system for CoveredUSA. It creates a Google Sheet, populates it with healthcare article ideas, creates CoveredUSA-specific cron jobs, and adds CoveredUSA to the multi-product SEO config.

### Prompt

```
You are setting up the SEO article pipeline for CoveredUSA (coveredusa.org), a healthcare eligibility screening site. This mirrors the existing Benefits Navigator SEO system but for healthcare-only content.

## CONTEXT
- CoveredUSA is at /Users/frankthebot/clawd/projects/covered-usa/
- Blog content goes in /Users/frankthebot/clawd/projects/covered-usa/content/blog/ (English) and content/blog/es/ (Spanish)
- Frontmatter format: title, description, date, slug, keywords (YAML array). All values quoted strings. Extension: .md
- The site covers 6 programs: ACA Marketplace, Medicaid, Medicare, Medicare Savings Programs, CHIP, VA Healthcare
- Target audience: uninsured Americans, especially Spanish speakers
- Blog rendering: gray-matter + next-mdx-remote. Dates MUST be quoted strings in frontmatter.
- Site is deployed on Vercel (auto-deploys from... actually no git repo yet, so skip deploy step for now)

## YOUR TASKS

### TASK 1: Create CoveredUSA Google Sheet

Use the Google service account at /Users/frankthebot/clawd/.secrets/google-service-account.json with googleapis.

Create a new Google Sheet called "CoveredUSA SEO Ideas".

Sheet 1: "SEO Ideas" with these columns:
A: ID, B: Keyword, C: Title, D: State, E: Program, F: Type, G: Intent, H: Volume, I: CPC, J: Competition, K: RevenueScore, L: Priority, M: Status, N: Notes, O: URL, P: Created, Q: Source

Sheet 2: "SEO Articles" with these columns:
A: Slug, B: Title, C: Keyword, D: State, E: Program, F: Word Count, G: Date, H: URL

Share the sheet with jrp90272@gmail.com (editor access).

### TASK 2: Populate with Healthcare Article Ideas

Add 50-75 article ideas to the SEO Ideas sheet. Mix of:

**National articles (no state):**
- "how to apply for medicaid 2026" / "medicaid application guide 2026"
- "aca open enrollment dates 2026"
- "medicare part b cost 2026"
- "chip eligibility requirements"
- "free health insurance for low income"
- "medicaid vs marketplace insurance"
- "what is medicare savings program"
- "health insurance for unemployed"
- "can undocumented immigrants get health insurance"
- "health insurance for college students"
- "best health insurance for self-employed"
- "medicaid expansion states 2026"
- "medicare enrollment periods explained"
- "aca subsidy calculator 2026"
- "va healthcare eligibility"

**State-specific articles (high uninsured states: TX, FL, GA, NC, CA, AZ, NV, OH, PA, NY):**
- "[state] medicaid income limits 2026"
- "[state] health insurance options for low income"
- "how to apply for medicaid in [state]"
- "[state] aca marketplace plans 2026"
- "free health insurance [state] 2026"

**AI-optimized articles (for Bing/ChatGPT citations):**
- "medicaid income limits by state 2026" (comparison table)
- "aca subsidy amounts by income 2026" (comparison table)
- "medicare vs medicaid difference" (comparison)
- "cheapest health insurance options 2026"

For each article:
- ID: sequential (CU-001, CU-002, etc.)
- Status: "Ready"
- Source: "AI" for half, "Google" for half
- Priority: 1-3 (1 = highest)
- Type: "guide", "comparison", "state-specific", "reference"
- Intent: "informational", "transactional", "navigational"
- Program: relevant program(s)
- RevenueScore: 1-10 based on lead potential

### TASK 3: Create CoveredUSA Article Writer Agent

Create /Users/frankthebot/clawd/.claude/agents/coveredusa-article-writer.md:

```yaml
---
name: coveredusa-article-writer
description: Writes a single SEO article for CoveredUSA given a keyword, title, state, and program. Handles research, writing, and file saving.
model: sonnet
background: true
permissionMode: bypassPermissions
maxTurns: 40
tools: Read, Write, Edit, Bash, WebSearch, WebFetch, Glob, Grep
---
```

The agent should:
1. Read product context from /Users/frankthebot/clawd/projects/covered-usa/PLAN.md
2. If state-specific, check /Users/frankthebot/clawd/projects/covered-usa/src/lib/states/data/[state].json for state info
3. WebSearch the keyword for current facts
4. Write 1500-2500 word article with:
   - Income limit tables (markdown)
   - Step-by-step application instructions
   - FAQ section with ### headers
   - Internal links to /screener and relevant reference pages (/medicaid-income-limits, /medicare-eligibility, /aca-income-limits)
   - If state-specific, link to screener with state context
   - CTA buttons: "Check your eligibility now — it takes 2 minutes"
5. Frontmatter: title (quoted), description (quoted, 155 chars max), date (quoted YYYY-MM-DD), slug, keywords (YAML array)
6. Save to /Users/frankthebot/clawd/projects/covered-usa/content/blog/[slug].md
7. Return JSON: {"slug": "...", "word_count": N, "status": "success", "title": "..."}

Style rules:
- NO em dashes or en dashes
- No filler phrases
- Verify all income limits and FPL percentages
- Healthcare-specific: use terms like "coverage", "enroll", "qualify", not generic benefits language
- Reference coveredusa.org, not benefitsusa.org
- All internal links use relative paths (no domain prefix)

### TASK 4: Create CoveredUSA Stage 1 Cron Job

Create /Users/frankthebot/clawd/.claude/claudeclaw/jobs/coveredusa-seo-stage1.md

Same structure as the Benefits Navigator stage 1 (/Users/frankthebot/clawd/.claude/claudeclaw/jobs/seo-stage1.md) but with these changes:
- Schedule: "36 4 * * *" (4:36 UTC = 9:36 PM PST, 2 hours after Benefits USA)
- Sheet ID: [the new sheet you created]
- Article selector: Use the same /Users/frankthebot/clawd/scripts/seo-select-articles.js but you'll need to modify it or create a wrapper that accepts a sheet ID parameter
  - Actually, create a new script: /Users/frankthebot/clawd/scripts/coveredusa-select-articles.js that's a copy of seo-select-articles.js but with the CoveredUSA sheet ID hardcoded
- Agent: coveredusa-article-writer (not seo-article-writer)
- Articles per day: 3
- Save path: /Users/frankthebot/clawd/projects/covered-usa/content/blog/

### TASK 5: Create CoveredUSA Stage 2 Cron Job

Create /Users/frankthebot/clawd/.claude/claudeclaw/jobs/coveredusa-seo-stage2.md

Same structure as Benefits Navigator stage 2 but with:
- Schedule: "36 5 * * *" (5:36 UTC = 10:36 PM PST)
- Blog path: /Users/frankthebot/clawd/projects/covered-usa/content/blog/
- Spanish path: /Users/frankthebot/clawd/projects/covered-usa/content/blog/es/
- Translation state file: /Users/frankthebot/clawd/projects/covered-usa/.translation-state.json
- NO deploy step yet (no git repo connected to Vercel yet — skip Steps 4 and 5)
- NO IndexNow yet (need to set up Bing Webmaster Tools first)
- Just do discovery + translation for now

### TASK 6: Add CoveredUSA to Multi-Product Config

Update /Users/frankthebot/clawd/.claude/skills/seo-cron-manager/config.json to add:
{
  "name": "covered-usa",
  "enabled": true,
  "articles_per_day": 3,
  "sheet_id": "[NEW SHEET ID]",
  "context_file": "/Users/frankthebot/clawd/projects/covered-usa/PLAN.md",
  "blog_repo": "/Users/frankthebot/clawd/projects/covered-usa",
  "blog_content_path": "content/blog",
  "file_extension": ".md",
  "frontmatter_fields": ["title", "description", "date", "slug", "keywords"],
  "frontmatter_notes": "MUST use .md extension. All values must be quoted strings. Dates MUST be quoted."
}

### VERIFICATION
- [ ] Google Sheet exists and is shared with jrp90272@gmail.com
- [ ] Sheet has 50+ article ideas with Status "Ready"
- [ ] coveredusa-article-writer.md agent file exists and is valid
- [ ] coveredusa-seo-stage1.md cron job exists
- [ ] coveredusa-seo-stage2.md cron job exists
- [ ] coveredusa-select-articles.js script exists
- [ ] config.json updated with covered-usa entry
- [ ] Test: run coveredusa-select-articles.js and verify it returns articles

OUTPUT: Report what you created, the Google Sheet ID, and any issues.

IMPORTANT AUTH NOTE:
- Google Sheets: Use service account at /Users/frankthebot/clawd/.secrets/google-service-account.json
- googleapis is available at /Users/frankthebot/clawd/projects/benefits-navigator/app/node_modules/googleapis
- Node.js is at /opt/homebrew/bin/node
- Always prefix commands with PATH="/opt/homebrew/bin:$PATH"
```

---

## AGENT 2: GitHub Repo + Vercel Git Deploy

```
Set up the GitHub repository for CoveredUSA and connect it to Vercel for automatic deployments.

## CONTEXT
- Project is at /Users/frankthebot/clawd/projects/covered-usa/
- Already deployed to Vercel manually (project exists in jacobs-projects-9f6ae645 team)
- Domain coveredusa.org is already pointed and working
- GitHub user: JPonskis (authenticated via gh CLI)

## TASKS

### TASK 1: Init Git Repo
cd /Users/frankthebot/clawd/projects/covered-usa
git init
Create a .gitignore with: node_modules, .next, .vercel, .env.local, .env, .translation-state.json
git add -A
git commit -m "Initial commit: CoveredUSA healthcare eligibility screener"

### TASK 2: Create GitHub Repo
gh repo create JPonskis/covered-usa --public --source=. --remote=origin --push

### TASK 3: Connect Vercel to GitHub
Run: PATH="/opt/homebrew/bin:$PATH" npx vercel git connect --scope jacobs-projects-9f6ae645

If that doesn't work, try:
vercel link --scope jacobs-projects-9f6ae645
Then connect via: vercel git connect

### TASK 4: Set Vercel Env Vars (if not already set)
Check if env vars exist first. If not:
- NEXT_PUBLIC_SUPABASE_URL=https://jqbjsqlaujgqiwwcrdsp.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY=(read from .env.local)
- SUPABASE_SERVICE_ROLE_KEY=(read from .env.local)
- NEXT_PUBLIC_SITE_URL=https://coveredusa.org

### TASK 5: Test Deploy
git push origin main
Verify Vercel picks it up and deploys automatically.

### VERIFICATION
- [ ] GitHub repo exists at github.com/JPonskis/covered-usa
- [ ] Vercel is connected to the repo
- [ ] Push to main triggers auto-deploy
- [ ] coveredusa.org still loads after deploy

OUTPUT: GitHub repo URL, Vercel project status
```

---

## AGENT 3: Bing Webmaster Tools + IndexNow

```
Set up Bing Webmaster Tools for coveredusa.org and configure IndexNow for instant indexing.

## CONTEXT
- Site: coveredusa.org
- Already has robots.txt allowing all AI bots
- Already has sitemap at coveredusa.org/sitemap.xml
- Benefits Navigator uses IndexNow key: 0bfa7c9805ca2b749f7217226683691a
- CoveredUSA needs its own IndexNow key
- Browser automation available via openclaw profile (headless Chrome)

## TASKS

### TASK 1: Generate IndexNow Key
Generate a new IndexNow key (32 char hex string). 
Update /Users/frankthebot/clawd/projects/covered-usa/public/coveredusa-indexnow-key.txt with the key.
Also update the IndexNow API route at /Users/frankthebot/clawd/projects/covered-usa/src/app/api/indexnow/route.ts to return this key.

### TASK 2: Create CoveredUSA IndexNow Submit Script
Create /Users/frankthebot/clawd/scripts/coveredusa-indexnow-submit.js
Copy from /Users/frankthebot/clawd/scripts/indexnow-submit.js but change:
- HOST to 'coveredusa.org'
- INDEXNOW_KEY to the new key
- Blog path to /Users/frankthebot/clawd/projects/covered-usa/content/blog/
- URL prefix to https://coveredusa.org/en/blog/

### TASK 3: Bing Webmaster Tools Verification
Use the openclaw browser (profile="openclaw") to:
1. Go to bing.com/webmasters
2. Add coveredusa.org as a new site
3. Choose DNS verification method (preferred) or meta tag
4. Report what verification method/code is needed

If you can't complete browser automation, output the manual steps Jacob needs to take.

### TASK 4: Submit Sitemap to Bing
After verification (or provide steps to do after):
- Submit https://coveredusa.org/sitemap.xml to Bing Webmaster Tools

### VERIFICATION
- [ ] IndexNow key file exists in public/
- [ ] coveredusa-indexnow-submit.js script works (test with --dry-run or just verify it parses)
- [ ] Bing Webmaster verification code/method documented

OUTPUT: IndexNow key, Bing verification status/instructions
```

---

## AGENT 4: E-E-A-T Signals

```
Add Experience, Expertise, Authoritativeness, and Trustworthiness signals to CoveredUSA to improve AI citation and search ranking.

## CONTEXT
- Site: /Users/frankthebot/clawd/projects/covered-usa/
- Next.js App Router with next-intl (en/es locales)
- Blog uses gray-matter + next-mdx-remote for markdown rendering
- Blog post page: src/app/[locale]/blog/[slug]/page.tsx
- Main layout: src/app/[locale]/layout.tsx
- Structured data helpers: src/lib/structured-data.ts

## TASKS

### TASK 1: Author Bio Component
Create src/components/AuthorBio.tsx that shows:
- Author name: "CoveredUSA Team"
- A short bio: "Our team researches federal and state healthcare programs to help Americans understand their coverage options."
- "Reviewed by licensed insurance professionals" badge
- Schema.org Person/Organization markup

### TASK 2: Add Author to Blog Posts
Edit src/app/[locale]/blog/[slug]/page.tsx to include the AuthorBio component at the top of each article, below the title/date.

### TASK 3: "Last Updated" Dates
Add lastUpdated field support to blog frontmatter parsing in src/lib/blog.ts.
Show "Last updated: [date]" on blog posts when present.
This signals freshness to AI crawlers.

### TASK 4: Citation Formatting
Add a "Sources" section component for blog posts. Create src/components/Sources.tsx that renders a numbered source list with links.
Add example sources to the 3 existing blog articles:
- content/blog/do-i-qualify-for-medicaid-2026.md
- content/blog/medicare-eligibility-age-requirements-2026.md
- content/blog/aca-health-insurance-eligibility-2026.md

Sources should link to real .gov sites (medicaid.gov, medicare.gov, healthcare.gov, cms.gov).

### TASK 5: Trust Badges in Footer
Edit src/app/[locale]/layout.tsx footer to add trust signals:
- "Information verified against official government sources"
- "Updated for 2026 policy changes"
- Link to About page

### TASK 6: MedicalOrganization Schema
Verify src/lib/structured-data.ts has getMedicalOrganizationSchema() and it's included on the homepage. If not, add it.

### VERIFICATION
- [ ] AuthorBio component renders on blog posts
- [ ] "Last updated" shows when frontmatter includes it
- [ ] Sources section renders at bottom of articles
- [ ] Footer has trust badges
- [ ] Run: PATH="/opt/homebrew/bin:$PATH" npx tsc --noEmit (no type errors)

OUTPUT: List of files changed, any issues
```

---

## AGENT 5: Facebook Ads Landing Page (Spanish)

```
Create a dedicated Spanish-language landing page for Facebook ad traffic at /es/comenzar on CoveredUSA.

## CONTEXT
- Site: /Users/frankthebot/clawd/projects/covered-usa/
- Next.js App Router with next-intl (en/es)
- Screener is at /[locale]/screener
- Target: uninsured Hispanic/Latino population
- This page should be optimized for conversion from paid Facebook ads
- Keep it simple, fast, and trust-building

## TASKS

### TASK 1: Create Landing Page
Create src/app/[locale]/comenzar/page.tsx

Design:
- Hero: Large headline in Spanish: "Seguro medico gratis o de bajo costo. Verifica si calificas."
- Subheadline: "Miles de familias en [state] ya se inscribieron. Solo toma 2 minutos."
- Single prominent CTA button: "Verificar Mi Elegibilidad Gratis" linking to /es/screener
- Trust badges: "100% Gratis", "Confidencial", "Sin compromiso", "En Espanol"
- Social proof: "Mas de 25 millones de estadounidenses califican para cobertura y no lo saben"
- 3 simple icons: Check eligibility -> See your options -> Get help enrolling
- Disclaimer at bottom: "CoveredUSA no es una agencia del gobierno..."
- NO navigation header (clean landing page, reduce bounce)
- Minimal footer with privacy link only

### TASK 2: English Version
Also create an English version at /en/comenzar (or /en/get-started) for English Facebook ads:
- Same structure but in English
- "Free or low-cost health insurance. Check if you qualify."

### TASK 3: UTM Tracking
Make sure the page reads UTM parameters from the URL (utm_source, utm_medium, utm_campaign) and passes them through to the screener. The screener API already saves these to the submission record.

### TASK 4: Add translations
Add any new translation keys to messages/en.json and messages/es.json.

### VERIFICATION
- [ ] /es/comenzar loads with Spanish content
- [ ] /en/comenzar loads with English content  
- [ ] CTA links to screener
- [ ] No nav bar on landing page
- [ ] UTM params pass through
- [ ] PATH="/opt/homebrew/bin:$PATH" npx tsc --noEmit passes

OUTPUT: Files created, any issues
```

---

## Running Order

These are independent and can ALL run in parallel:
- Agent 1 (SEO Pipeline) — longest, start first
- Agent 2 (GitHub Repo) — quick, do early
- Agent 3 (Bing Webmaster) — depends on Agent 2 for git push, but IndexNow setup is independent
- Agent 4 (E-E-A-T) — independent
- Agent 5 (Facebook Landing) — independent

Agent 2 should ideally finish before Agent 3's Bing submission step, but Agent 3 can do everything except the final sitemap submission independently.
