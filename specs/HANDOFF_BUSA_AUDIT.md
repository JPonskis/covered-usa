# Handoff: BenefitsUSA Audit Task

**Date written:** 2026-05-15 evening (just before context compact)
**Author:** Frank, mid-session — wrote this for the next Claude that wakes up after Jacob compacts.
**Reader:** the next agent. Read this end-to-end before doing anything.

---

## 0. What Jacob wants you to do

**Audit BenefitsUSA (benefitsusa.org).** Full audit of the existing site: what's already shipped, what's queued, what's converting, what's not. Compare against the FANOUT formula we built for CoveredUSA and identify:

- What's already written and ranking well (don't touch the winners)
- What's already written but underperforming (rewrite candidates)
- What's in the queue that's well-targeted vs misaligned
- What gaps exist in the queue that should be filled
- Which pages convert to screener leads (the real business signal)

Jacob's framing (his words): "It could be that BenefitsUSA, because I put a lot of time and effort into it originally... is the one that is actually getting traffic right now, the one that has this huge catalogue, so it's possible that a lot of the work I want to do is going to be content going forward that I want to add to the pipeline."

So the deliverable is essentially: a strategic plan for what to do with BUSA over the next 30-60 days, grounded in real data (Bing impressions, conversions, existing content).

---

## 1. Quick context — what just happened tonight

We just finished a massive CoveredUSA push. You should know the state:

- **50 articles live + 4 more queued** (batch 6 partial). All published via the OLD method (direct git push to main → Vercel auto-deploy).
- **~150 articles total now in the system** per Jacob's count (he had another agent in another session also push articles to the drip-queue branch while this session was finishing up).
- **Drip-queue staging-branch architecture LIVE.** New canonical workflow: write JSON files → commit to `drip-queue` branch (not main) → Vercel ignores → drip cron promotes 15/day from drip-queue to main → those 15 go live → cron marks Status=Published in sheet.
- **Drip cron schedule:** daily 02:00 UTC. First run on the new architecture is tonight (a few hours from now). Should auto-publish 15 articles from the queue.
- **Daily blog cron:** unchanged. Still pushes ~10 daily blog articles direct to main. So total daily live cadence going forward: ~10 daily blog + 15 from drip = 25/day max.

Jacob said: "I always have more than 15 in the queue every day. When I think about it, I will spawn agents to do that, so we're looking very good."

So bulk production is on autopilot. The session that produced all this is closing.

---

## 2. CoveredUSA infrastructure (so you understand what exists)

You don't need to do anything with CoveredUSA. Just know it works.

| Component | Where | Purpose |
|---|---|---|
| Master Backlog (Google Sheet) | Sheet ID `1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU` tab "Master Backlog" (gid 639553785) | 2,344-row queue of all CoveredUSA pages to write. Each row has Status column: blank → Writing → Ready → Published |
| Drip cron script | `projects/covered-usa/scripts/coveredusa-drip-publish.js` | Runs daily 02:00 UTC. Reads Status=Ready rows. Promotes top 15 from drip-queue → main via `git checkout origin/drip-queue -- <path>` then commit + push + IndexNow + mark Published |
| Drip cron job def | `.claude/claudeclaw/jobs/coveredusa-drip-publish.md` | ClaudeClaw cron config |
| Staging branch | `drip-queue` on GitHub | Holding pen for written-but-not-published JSON files. Vercel ignores this branch |
| Topic plan | `projects/covered-usa/specs/topic-research/batch-100-plan.json` | First-100 batch plan (10 batches of 10) |
| Workflow doc | `projects/covered-usa/specs/topic-research/JACOB_WORKFLOW.md` | v1.1 with the staging-branch flow documented |
| Build plan | `projects/covered-usa/specs/topic-research/BUILD_PLAN.md` | Phase 1-5 master plan |

**Writer agents (subagent_types you can spawn for any template):**
- coveredusa-procedure-writer + coveredusa-procedure-verifier
- coveredusa-drug-writer + coveredusa-drug-verifier
- coveredusa-persona-writer + coveredusa-persona-verifier
- coveredusa-event-writer + coveredusa-event-verifier
- coveredusa-qa-writer + coveredusa-qa-verifier
- coveredusa-glossary-writer + coveredusa-glossary-verifier
- coveredusa-ma-state-writer + coveredusa-ma-state-verifier
- coveredusa-track-d-writer + coveredusa-track-d-verifier (built this session)

---

## 3. CRITICAL: 4 build-failure patterns we learned tonight (avoid them)

If you ever produce CoveredUSA content, run `npm run build` LOCALLY before pushing. Tonight we hit a chain of 4 Vercel build failures:

1. **Year in slug** → FANOUT GATE A hard reject. Never put `-2026` or `-2027` in slugs. Year goes in title/H1/meta only. Slugs like `extra-help-eligibility-2026` → `extra-help-eligibility`.

2. **status=yes paired with "None/No/Not/Never" cell text** → coverage-breakdown validator regex flags as contradiction. Rewrite cells: "None" → "Any / Open / All / Waived / Permitted." Example: `"None (not income-based)"` → `"Open eligibility (any income)"`.

3. **Missing `introParagraphs` field on glossary** → Track C-prime downscope schema requires `introParagraphs: []` (empty array literal). Don't omit it.

4. **keyTerm collisions across files** → if same phrase claimed by 2 topicClusters, link-index build fails. Coordinate keyTerms across new pages. The 4 collisions tonight: "Medicare Part D" (extra-help vs medicare-coverage), "Special Enrollment Period" (aca-coverage vs event-sep), "dual-eligible" (medicare-coverage vs medicaid-coverage), "Medicare Parte D" (same as #1 in Spanish).

Run `npm run build` locally. If it passes, the Vercel build will pass.

---

## 4. BenefitsUSA — paths, repos, and the deploy rule

**CRITICAL DEPLOY RULE (read CLAUDE.md):** Always work in `/Users/jacobposner/clawd/projects/benefits-navigator-deploy/`. Never use `/Users/jacobposner/clawd/projects/benefits-navigator/` — that's a stale sandbox that's behind production.

```bash
# Before touching anything:
git -C /Users/jacobposner/clawd/projects/benefits-navigator-deploy pull origin main

# Before pushing:
git -C /Users/jacobposner/clawd/projects/benefits-navigator-deploy log --oneline -5
# Verify the commits look right.
```

This rule applies on Mac mini (frankthebot) and MacBook (jacobposner). No exceptions.

---

## 5. Data sources you have available

### Bing Webmaster API (CRITICAL — this is the traffic-side data)
- Key: `/Users/jacobposner/clawd/.secrets/bing-webmaster-api-key.txt` (32 chars, verified)
- Both `benefitsusa.org` and `coveredusa.org` are verified sites
- Endpoint: `https://ssl.bing.com/webmaster/api.svc/json/<Method>?apikey=<KEY>`
- Methods you'll use:
  - `GetPageStats` — page-level impressions/clicks for benefitsusa.org
  - `GetKeywordStats` — keyword-level data
  - `GetUrlInfo` — per-URL traffic data
  - `GetCrawlIssues` — any indexation problems
  - `GetPageQueryStats` — query → URL mappings
  - `GetRankAndTrafficStats` — overall site trends
- Sanity check first: `curl -s "https://ssl.bing.com/webmaster/api.svc/json/GetUserSites?apikey=$KEY"` should return both sites with IsVerified:true
- Language param must be `en-US` (capital US, lowercase fails)

### BUSA URL inventory (already pulled)
- File: `/Users/jacobposner/clawd/projects/covered-usa/specs/busa-inventory.csv`
- 2,111 URLs from live sitemap.xml, classified by:
  - url, title, page_type (blog-post, programs-page, life-events-page, etc.), topic_bucket (Medicaid, SNAP, ACA, Medicare, etc.), lang (en/es), blog_date, sitemap_lastmod, has_es
- Topic distribution: Medicaid 378, SNAP 439, SSDI 237, ACA 215, Housing 157, Medicare 25, Cost/Bills 8
- Refresh: `node /Users/jacobposner/clawd/scripts/busa-inventory.js` re-runs from live sitemap

### BUSA article queue (Google Sheet — need to find the ID)
- Jacob has a queue of articles waiting to be written for BUSA. Different from the CoveredUSA Master Backlog.
- Likely lives in a Google Sheet. Ask Jacob for the Sheet ID, or grep memory + project files: `rg "benefitsusa.*1[A-Za-z0-9_-]{20,}" memory/ projects/`
- Service account access: `/Users/jacobposner/clawd/.secrets/google-service-account.json`
- The BUSA daily article cron pulls from this sheet — find the cron's selector script, it'll have the Sheet ID hardcoded

### BUSA article writers (already exist)
- `seo-article-writer` subagent type — writes a single SEO article for Benefits Navigator (Benefits USA)
- Existing BUSA cron at `/Users/jacobposner/clawd/.claude/claudeclaw/jobs/` (something like `benefits-usa-seo-stage1.md`) — find via `ls .claude/claudeclaw/jobs/`

### CoveredUSA FANOUT formula (the optimization playbook to apply to BUSA)
- `projects/covered-usa/specs/FANOUT_FORMULA.md` v1.0 (570 lines, the proprietary playbook)
- 5 universal rules + per-template recipes empirically derived from 281 LLM probes + BUSA real-Bing cross-check
- Section 5.1 explicitly flags WIC × state × year and SNAP × state × year as **BUSA's** highest-ROI permutation factories (not CoveredUSA's). This is directly applicable to the audit.

### CoveredUSA topic research (the BUSA cross-reference is already done)
- `projects/covered-usa/specs/topic-research/busa-cross-reference.csv` — 43 overlap candidates found between CoveredUSA's planned topics and BUSA content. ZERO genuine dupes per intent-split rule (BUSA = how-to-apply, CoveredUSA = do-I-qualify).
- `projects/covered-usa/specs/topic-research/TOPIC_ROADMAP.md` §1.8 + §4.6 — the locked intent-split decision
- `projects/covered-usa/specs/topic-research/HANDOFF.md` — the topic research handoff doc with rich BUSA context

---

## 6. The audit you should produce

Suggested structure of the final deliverable:

### Part 1: BUSA traffic baseline
- Pull last 30 days of Bing data via `GetRankAndTrafficStats`, `GetPageStats`, `GetPageQueryStats`
- Top 50 pages by impressions
- Top 50 pages by clicks
- Top 50 pages by CTR
- Top 50 queries (and which pages capture them)
- Comparison to last 90 days: trending up vs trending down

### Part 2: BUSA content audit
- 2,111 URLs in busa-inventory.csv — bucket by page_type and topic_bucket
- For each top-30 page by Bing impressions, audit against FANOUT formula:
  - Has year markers? (FANOUT §3.1)
  - State-context-everywhere if state-scoped? (§3.2)
  - 9-row household-size table if income-gated? (§3.3)
  - How-to-apply section with .gov URL + numbered steps? (§3.4)
  - State-named program brand (Medi-Cal, SoonerCare, etc.)? (§3.7)
- Identify under-performing pages (low CTR or impressions despite high topical relevance)
- Identify pages that violate the no-em-dash + no-year-in-slug + status/text rules

### Part 3: BUSA queue audit
- Pull BUSA's article queue (Sheet, once you find the ID)
- Total queued count, broken down by topic_bucket
- Check for overlap with already-published BUSA articles (don't re-write)
- Check for overlap with CoveredUSA Master Backlog (intent split — BUSA = application, CoveredUSA = eligibility shopping)
- Identify queue gaps: topics with high Bing impressions but no queued article

### Part 4: Conversion data (the most important part per Jacob)
- Jacob explicitly said "the page-to-screener conversion, because that's what really matters the most"
- Find: which BUSA pages drive the most screener conversions
- Data source: probably Supabase or a Google Analytics event stream. Jacob's screener tracks form-completion events.
- Cross-reference: top conversion pages × Bing impressions = best ROI per page

### Part 5: Strategic recommendations
- Top 10 BUSA pages to REWRITE using the FANOUT formula
- Top 10 NEW BUSA articles to write (gap-fill based on Bing impressions + zero current page)
- Top 5 BUSA programmatic permutations to build (e.g., SNAP × state × year per FANOUT §5.1)
- Anything in the BUSA queue that should be deprioritized or killed

Output the deliverable as `/Users/jacobposner/clawd/projects/benefits-navigator-deploy/specs/AUDIT_2026-05-16.md` (or similar).

---

## 7. What was committed today (paper trail)

In covered-usa repo (this session):
```
d955b8a Topic research phase complete: 7 templates ranked
a1b9259 Cross-reference + MASTER_BACKLOG: 2,344 canonical pages
64ebc8d Master Backlog rollout to live Google Sheet (2,344 rows + 85 dupes)
03db165 Phase 1: Drip-publish cron infrastructure
518656d Track D Phase 2: /medicaid-income-limits/[state] dynamic route + Texas
4e8e7e5 Phase 3: Jacob workflow doc + Master Backlog filter views
bcb87c2 Track D writer + verifier agent spec section
f5ea18e Track D: Arizona AHCCCS Medicaid income limits 2026
46fd6c0 Drip cron: bump MAX_PER_DAY 10 -> 15
cbe0cd1 Track D: align canonical schema across loader, template, JSONs
8a76156 Bulk content batch 1-3: 30 pages
db59551 Bulk content batch 4: 10 more pages (40 total)
09f24fb Bulk content batch 5: 10 more pages (50 total milestone)
ce25e32 Fix: rename 3 QA slugs that contained years (GATE A)
01709f6 Fix: status=yes/no-age-floor coherence
4faaa3b Fix: 3 more status=yes/None coherence false-positives
22a6a09 Fix: hmo-vs-ppo introParagraphs + 4 keyTerm collisions
b580585 (rebased push of 22a6a09)
0c5dfdf Drip cron: staging-branch architecture (drip-queue -> main throttle)
```
Plus today's daily blog cron commit (`03e9aa5` — 10 articles).

Branch `drip-queue` created in same repo. Whatever the other Jacob-spawned agent pushed is also on `drip-queue` now.

In clawd repo (agent defs):
```
e15eed5 Add Track D writer + verifier agents
21e4cc0 CoveredUSA article pipeline: editor-mode verifier (earlier)
```

---

## 8. State of batch 7 (in case you want to resume)

Batch 7 was in flight when usage hit the limit at 12:20am PT. 4 of 10 completed:
- ✅ MB-0061 wegovy-cost (drug) — file exists in `content/data/drugs/wegovy-cost.json` (may be on main or drip-queue depending on where current branch was)
- ✅ MB-0065 does-medicare-cover-cataract-surgery (qa)
- ✅ MB-0066 does-medicare-cover-therapy (qa)
- ✅ MB-0064 does-medicare-cover-eye-exams (qa)
- ❌ MB-0062 children-kids (persona) — usage limit
- ❌ MB-0063 does-medicaid-cover-glp1-by-state (qa) — usage limit
- ❌ MB-0067 who-qualifies-for-aca-subsidy (qa) — usage limit
- ❌ MB-0068 knee-replacement (procedure) — usage limit
- ❌ MB-0069 veterans (persona) — usage limit
- ❌ MB-0070 1099-contractors (persona) — usage limit

All 10 are pre-marked Status=Writing in the sheet. The 6 that didn't land need their Status reset to blank for retry later. Sheet rows 62-71.

Also 6 from batch 6 are dead/reset (sheet rows 54, 57, 58, 59, 60, 61): immigrant-medicaid, medicaid-dental-adults, cologuard, is-ozempic-covered-by-insurance, vasectomy, ambulance. These are back to Status=blank.

Don't sweat these. The drip cron just publishes whatever is Status=Ready. Missing files = skip + log.

---

## 9. How to start the BUSA audit (recipe)

1. Read this doc + CLAUDE.md + the FANOUT formula
2. `cd /Users/jacobposner/clawd/projects/benefits-navigator-deploy && git pull origin main`
3. Sanity-test the Bing API key: `curl -s "https://ssl.bing.com/webmaster/api.svc/json/GetUserSites?apikey=$(cat ~/clawd/.secrets/bing-webmaster-api-key.txt)"` — should show benefitsusa.org IsVerified:true
4. Pull Bing data for benefitsusa.org via the available methods (Page Stats, Query Stats, etc.) for the last 30+90 days
5. Find the BUSA article queue Sheet ID (look in BUSA cron jobs at `.claude/claudeclaw/jobs/`)
6. Find the screener conversion data source (probably Supabase — see `RESILIENCE.md` for Supabase access patterns)
7. Spawn parallel research subagents for: traffic audit, content audit, queue audit, conversion audit
8. Synthesize into the strategic recommendations doc
9. Show Jacob the top 10 pages to rewrite + top 10 new articles to write + top 5 programmatic permutations

This is parallel to but separate from the CoveredUSA work. They share the FANOUT formula but have different audiences (BUSA = how-to-apply intent; CoveredUSA = do-I-qualify shopping intent).

---

*End of handoff. Jacob will compact after this. The next agent should read this end-to-end before doing anything.*
