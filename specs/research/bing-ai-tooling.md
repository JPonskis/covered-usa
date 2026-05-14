# Microsoft Bing & Copilot Tooling for CoveredUSA

Research date: 2026-05-13
Scope: Every Microsoft tool, API, and data source useful to a programmatic-SEO operator who is optimizing for Bing + Copilot citations.

---

## TL;DR — Top 5 free Microsoft tools to set up today

1. **Bing Webmaster Tools AI Performance Report** (public preview since Feb 2026). Shows total Copilot citations, daily average cited URLs, grounding queries, and per-URL citation activity. No extra config beyond site verification. UI only right now — API is on Microsoft's backlog but unscheduled. This is the single most important dashboard we don't yet have.
2. **Bing Webmaster API + URL Submission API**. 10,000 URLs/day quota, real-time crawl on submission. We should already be using IndexNow, but the direct Webmaster API also exposes `GetPageStats`, `GetQueryStats`, `GetPageQueryStats`, `GetUrlInfo`, `GetCrawlIssues`, `GetUrlSubmissionQuota`, etc. We can pull every Bing performance metric programmatically into our Postgres. Free.
3. **Microsoft Clarity + Clarity MCP Server**. Free unlimited heatmaps and session recordings. Has a Data Export API (JWT-gated). Has an official MCP server that lets Claude query analytics in natural language. Setup is one script tag. The MCP server is rate-limited (10 requests/day, 3 days of data, 3 dimensions max), but the underlying tool is fully free.
4. **Microsoft Advertising Keyword Planner**. Free with any MS Advertising account — no ad spend required. Pulls search volume, trends, and cost-per-click data more granular than the Bing Webmaster keyword research panel. Useful for pSEO topic discovery on the Bing side.
5. **Microsoft Start Partner program (auto-publish via RSS/Atom feed)**. CoveredUSA can apply to syndicate articles directly into MSN.com and the Edge new-tab feed. Free. Approval gated. If approved, every published article gets distributed to the Microsoft Start audience automatically.

---

## Tool inventory

| Tool | What it does | Free/Paid | Access | Worth setup? |
|---|---|---|---|---|
| Bing Webmaster Tools (UI) | Standard webmaster console | Free | UI | Already have it |
| Bing Webmaster API | Programmatic access to all WMT data | Free | REST JSON + XML, OAuth or API key | **Yes — high priority** |
| URL Submission API | Submit URLs for instant index | Free, 10K/day quota | REST | **Yes — for re-crawls beyond IndexNow** |
| IndexNow | Push-notify protocol | Free | REST, key file | **Already in use, keep** |
| Bing Webmaster AI Performance Report | Copilot citation tracking | Free | UI only | **Yes — critical** |
| Microsoft Clarity | Heatmaps, session replay, AI insights | Free, unlimited | UI + Data Export API + MCP server | **Yes — install this week** |
| Microsoft Advertising Keyword Planner | Keyword volume, CPC, intent | Free | UI | **Yes — for pSEO topic mining** |
| Microsoft Start Partner program | Syndicate articles to MSN + Edge feed | Free, approval gated | RSS/Atom feed ingestion | **Apply, high upside** |
| Bing Places for Business | Local pack listing | Free | UI at bing.com/forbusiness | Maybe — only if we build state-level "business" entities |
| Bing Search API v7 / Custom Search | Programmatic SERP results | **Retired Aug 11, 2025** | — | Skip |
| Grounding with Bing Search (Azure AI) | API replacement, AI grounding | $35 / 1K queries | Azure AI Foundry | Skip unless we build an agent |
| Copilot Studio | Build a Copilot agent w/ our knowledge | Free tier exists, paid for production | UI + connectors | Strategic — see deep dive |
| Edge browser / MS Start integration | New-tab feed distribution | Free via partner program | Same as Microsoft Start | Same path as MS Start |
| Bing News Pubhub | Submit publisher to Bing News | Free | UI form | **Yes — submit CoveredUSA** |

---

## Deep dive — Top 5 tools

### 1. Bing Webmaster API (the underused superpower)

This API has been around since 2019 and almost nobody uses it. It exposes every piece of data the Bing Webmaster UI shows, plus several that the UI doesn't surface well. The full method list from `IWebmasterApi`:

**Submission**
- `SubmitUrl` — single URL
- `SubmitUrlBatch` — list of URLs
- `SubmitFeed` — sitemap
- `SubmitContent` — submit full HTML content of a URL (faster than crawl)
- `GetUrlSubmissionQuota` / `GetContentSubmissionQuota` — quota check
- `FetchUrl` + `GetFetchedUrls` + `GetFetchedUrlDetails` — force-fetch URL like "Inspect URL"

**Traffic / performance**
- `GetRankAndTrafficStats` — overall traffic
- `GetPageStats` — top pages with impressions/clicks
- `GetQueryStats` — top queries with impressions/clicks
- `GetPageQueryStats` — per-page query breakdown
- `GetQueryPageStats` — per-query page breakdown
- `GetQueryPageDetailStats` — drill into a (query, page) pair
- `GetQueryTrafficStats` — historical traffic per query

**Keyword research**
- `GetKeyword` — impressions for a keyword over a date range
- `GetKeywordStats` — broad-match + strict-match impressions
- `GetRelatedKeywords` — related keyword suggestions

**Crawl**
- `GetCrawlStats` — daily crawl counts
- `GetCrawlIssues` — Bingbot errors
- `GetCrawlSettings` / `SaveCrawlSettings` — control crawl rate
- `GetUrlInfo` — index status for a single URL (depth, errors, last crawl)
- `GetChildrenUrlInfo` — index status for a directory
- `GetUrlTrafficInfo` / `GetChildrenUrlTrafficInfo` — traffic by URL/directory

**Links**
- `GetLinkCounts` — pages with inbound links
- `GetUrlLinks` — inbound links for a specific URL
- `GetConnectedPages` / `AddConnectedPage` — pages that link to you

**Block / control**
- `GetBlockedUrls` / `AddBlockedUrl` / `RemoveBlockedUrl` — temporarily hide URLs from Bing
- `GetQueryParameters` / `AddQueryParameter` / `RemoveQueryParameter` / `EnableDisableQueryParameter` — URL normalization
- `GetActivePagePreviewBlocks` / `AddPagePreviewBlock` / `RemovePagePreviewBlock` — page snippet control
- `GetCountryRegionSettings` / `AddCountryRegionSettings` / `RemoveCountryRegionSettings` — geotargeting per URL/folder/subdomain
- `SubmitSiteMove` + `GetSiteMoves` — domain migration

Endpoints follow `https://ssl.bing.com/webmaster/api.svc/json/<Method>?apikey=<KEY>&siteUrl=<URL>` for GET or POST. JSON and XML (pox) both supported. OAuth 2.0 is also available.

**Practical value for CoveredUSA**: nightly cron pulls `GetPageStats`, `GetPageQueryStats`, and `GetQueryStats` into Postgres. Cross-join with our article publish dates and we get "article X earned Y Bing impressions in N days, ranking on these queries." Hard to do that any other way. Also `GetCrawlIssues` should be a daily Telegram alert.

### 2. Bing Webmaster AI Performance Report (UI only, for now)

Launched as public preview Feb 9, 2026. Metrics:
- **Total citations** — how many times site is cited in AI answers in the window
- **Average cited pages** — daily average unique URLs referenced
- **Grounding queries** — sample user queries that triggered the citation
- **Page-level citation activity** — which URLs are cited and how often
- **Visibility trend** — citation count over time

Covers Microsoft Copilot, AI summaries in Bing, and "select partner integrations." Fabrice Canel (MS) has publicly said API support is "on backlog" but no timeline. For now, scrape the dashboard or download CSV manually.

**Practical value**: this is the only first-party AI-citation telemetry we will ever get from Microsoft. Manually export weekly until the API ships. Use the grounding queries as content prompts.

### 3. Microsoft Clarity + Clarity MCP Server

Free heatmaps and session recordings with no traffic cap. Install: one JS snippet, or npm `@microsoft/clarity` for SPAs.

Three integration layers:
- **UI**: dashboards, heatmaps, session replay, AI-summarized insights ("Heatmap Insights with Copilot," GPT-4o powered).
- **Data Export API**: JWT-gated. Endpoint `project-live-insights` returns JSON for last 1/2/3 days, breakdown by up to 3 dimensions. Token generation: Clarity → Settings → Data Export → Generate new API token.
- **Clarity MCP Server**: official Microsoft MCP. Natural-language queries from Claude/Cursor against the Clarity data. Limits: 10 API requests/day per project, 3 days of data, 3 dimensions per request. Setup is in the Microsoft Learn docs and GitHub repo `microsoft/clarity-mcp-server`.

**Practical value**: install the JS today, get heatmaps for every state/topic landing page. Wire the MCP into Frank's session and ask things like "which CoveredUSA pages have the worst scroll depth on mobile" each week.

### 4. Microsoft Advertising Keyword Planner

Free with a Microsoft Advertising account. No campaign required, no spend required, no credit card on first creation. Tools → Keyword Planner. Inputs accept keyword seeds or a competitor URL. Outputs: monthly search volume, year-over-year trend, suggested bid (CPC), competition level, related keyword expansions.

Volumes on Bing are roughly 1/5 of Google for most healthcare queries, but the data is real and the keyword expansion graph is different from Google's — surfaces opportunities we'd otherwise miss. Also exposes the *Microsoft Advertising API* (B2B, paid) with `KeywordIdeas` and `KeywordHistorical` endpoints if we want programmatic access later.

**Practical value**: monthly competitive seed run. Feed seeds like "ACA subsidy [STATE]", "healthcare.gov 2026 deadline", "medicaid eligibility [STATE]" and pull the related-keyword list. This becomes a programmatic article-topic pipeline orthogonal to Google's. The Wordstream Free Keyword Tool is a Microsoft-Advertising-API frontend — useful as a fast check without making an account.

### 5. Microsoft Start Partner program

Microsoft Start (formerly MSN) is the news/content surface on msn.com, Edge new-tab, Windows widgets, and the Microsoft Start mobile app. Combined audience is enormous (Microsoft Start cites "4,500 premium publisher brands"). Auto-publishing happens by RSS or Atom feed ingestion once approved.

Process:
1. Apply via Microsoft Start Partner Hub.
2. Provide RSS/Atom feed URL.
3. Pass content review (no clickbait, no sensationalism, transparent authorship, syndication rights asserted).
4. Auto-publish kicks in if feed complies with publishing rules.

WordPress plugin `microsoft-start` exists for sites on WP — we're on Next.js so we'll generate the feed ourselves.

**Practical value**: if approved, every CoveredUSA article gets a second distribution surface on MSN homepage cards + Edge feed. Zero ongoing cost. Pass-through traffic is real. Approval rate is the unknown — try.

---

## Setup guides

### Bing Webmaster API
1. Bing Webmaster Tools → Settings → API Access → Generate API Key.
2. Store the key in `.secrets/bing-webmaster-api-key.txt`.
3. Write a Node client (no official SDK in JS — they have .NET). Use plain `fetch` against `https://ssl.bing.com/webmaster/api.svc/json/<Method>` with `?apikey=...&siteUrl=https://coveredusa.com`.
4. Cron: nightly pull of `GetPageStats`, `GetQueryStats`, `GetPageQueryStats`, `GetCrawlIssues`. Land in a Supabase `bing_metrics` table.
5. Cron: hourly `SubmitUrlBatch` for newly published articles (in addition to IndexNow — belt + suspenders).

### Microsoft Clarity
1. Sign up at clarity.microsoft.com (uses Microsoft account or GitHub login).
2. Create project. Get tracking script.
3. Add the script tag to `app/layout.tsx` for Next.js — wrap in a check so it only loads in production.
4. Verify pings within 2 hours.
5. Optionally: generate a Data Export API JWT and wire to our daily reporting.
6. Optionally: clone `microsoft/clarity-mcp-server`, configure in `~/.claude.json`, restart Claude Code.

### Microsoft Start
1. Go to partnerhub.microsoftstart.com (or the Microsoft Start Partner application page).
2. Submit CoveredUSA, contact email, RSS feed URL (need to add an Atom or RSS feed to the Next.js site — small task).
3. Provide author bios + transparent ownership (we'll need a real `/about` and `/authors/*` pages).
4. Wait for content review. Typical timeline weeks, not days.

### Microsoft Advertising Keyword Planner
1. ads.microsoft.com → sign up with Microsoft account.
2. Skip campaign setup (you'll be prompted — close the modal).
3. Tools → Keyword Planner.
4. Use the UI for ad-hoc, or apply for API access at the Microsoft Advertising API portal for programmatic access (developer token required).

### Bing News Pubhub
1. bing.com/news/pubhub — submit CoveredUSA as a news source.
2. Provide RSS feed.
3. Wait for editorial approval.

---

## Integration with our existing stack

Our stack: Next.js on Vercel + Postgres (via Supabase) + ClaudeClaw cron jobs that run on the Mac mini.

**Cron jobs to add** (all live in our existing ClaudeClaw scheduler):

- `bing-metrics-pull` — daily 3 AM PT. Calls Webmaster API for last day's stats. Writes to `bing_page_metrics`, `bing_query_metrics`, `bing_crawl_issues` tables. Telegram alert if crawl issues > 0.
- `bing-url-submission` — runs after every article publish. Calls `SubmitUrlBatch` with the new URL (and parents if directory pages changed). Logs to `bing_submissions`.
- `clarity-export` — weekly Monday 9 AM PT. Pulls last week of dashboard data via Data Export API. Lands in `clarity_weekly` table.
- `bing-ai-citations-csv` — manual weekly task until API ships. Add a cron reminder that pings Frank to download the CSV from the AI Performance dashboard and ingest.

**Next.js changes**:
- Add an Atom or RSS feed at `/feed.xml` covering all articles (needed for Microsoft Start application).
- Confirm we emit proper JSON-LD: Article, BreadcrumbList, Organization, FAQPage where relevant, Speakable on key answers. Bing reads Schema.org reliably. Speakable specifically signals voice + Copilot answer suitability.
- Confirm canonical tags + `<link rel="alternate" hreflang>` per state if we localize.
- Install Clarity tracking script (one tag, prod-only).

**Vercel**: no special integration. Bing Webmaster verification is via meta tag, DNS, or XML file — all easy via Vercel.

---

## Quick wins (<30 min each)

- Install Microsoft Clarity script. Free, instant heatmaps for the next session of users.
- Verify CoveredUSA in Bing Webmaster Tools if not already. Generate API key.
- Open the AI Performance dashboard, screenshot baseline citation counts, set up a weekly Telegram reminder to capture the CSV.
- Submit CoveredUSA to Bing News Pubhub.
- Create a Microsoft Advertising account, run one keyword-planner pass on our top 20 article topics. Compare volume vs. our Google data.
- Wire up `SubmitUrlBatch` from our publish pipeline as a redundancy to IndexNow.
- Validate structured data: run our top 10 article URLs through Bing's Markup Validator + Schema.org validator. Fix any errors.

## Strategic plays (more work, higher payoff)

- **Apply to Microsoft Start as a publisher.** Real surface for our content, multiplies impressions. Requires a clean `/about`, named authors with bios, RSS feed, and editorial standards page. Approval is the gate.
- **Build a Copilot Studio agent** ("CoveredUSA Healthcare Helper") that uses our content as a knowledge source via the Copilot Studio knowledge connector. Lets users ask plan/eligibility questions and get answers grounded in our pages. Microsoft promotes published Copilot agents in their AppSource catalog and surfaces them in Copilot itself — early-mover advantage in healthcare-specific agents on the platform.
- **Daily Bing Webmaster API pull into Postgres + a Looker/Metabase dashboard.** This gives us a "Search Console" equivalent for Bing that updates automatically. Nobody on the SEO side has this dialed in for Bing; we will.
- **Speakable JSON-LD on every article's TL;DR + FAQ blocks.** This is the explicit Bing/Copilot signal for "this is the answer; read it aloud." Low effort, plausibly direct citation impact.

## What to skip / not worth setting up

- **Bing Search API v7 / Custom Search.** Retired August 11, 2025. Gone.
- **Grounding with Bing Search (Azure AI Agent Service).** $35 per 1,000 queries. Brutal price increase from the retired API. Only use if we're building a customer-facing agent and need the data; otherwise use Tavily/Exa/Firecrawl alternatives.
- **Azure OpenAI for "preferential Bing indexing."** Confirmed myth. Using Azure OpenAI for our writer/verifier agents instead of Anthropic gives us zero ranking or citation benefit on Bing or Copilot. Not worth switching from Claude.
- **Bing Places for Business.** Worth it only if we incorporate state-level "business" entities (e.g., "CoveredUSA Texas" as a brand). For a single national site, skip — local pack will rarely surface on healthcare informational queries anyway.
- **Bing Maps APIs / Autosuggest.** Irrelevant to our use case.
- **Bing Custom Search index hosting.** Retired with v7.
- **IndexNow extended features beyond what we already use.** IndexNow is intentionally minimal. 10K URLs per POST, no priority signaling, no batch quotas beyond rate limiting (429 if you flood it). Submit modified URLs only. We already do this right.
- **Buying Microsoft ads "for ranking benefit."** Microsoft does not give an organic boost to advertisers. Spend on ads only if the unit economics work as ads.

---

## A note on the AI-search alignment thesis

87% of SearchGPT citations match Bing's top organic results (per Seer Interactive's analysis). That means optimizing for organic Bing is more or less synonymous with optimizing for ChatGPT Search visibility. Combine that with Copilot's direct grounding in Bing's index and our positioning is clear: every dollar of effort on Bing serves three surfaces (Bing organic, Copilot, ChatGPT Search) instead of one. Google's effort serves Google plus a smaller share of AI Overviews. The Microsoft side is the leverage play.

---

## Sources

- [Bing Webmaster API - Microsoft Learn](https://learn.microsoft.com/en-us/bingwebmaster/)
- [IWebmasterApi Interface - Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/api/microsoft.bing.webmaster.api.interfaces.iwebmasterapi?view=bing-webmaster-dotnet)
- [Bing Webmaster Tools URL and Content Submission API](https://www.bing.com/webmasters/url-submission-api)
- [Introducing AI Performance in Bing Webmaster Tools Public Preview](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)
- [Bing Webmaster Tools officially adds AI Performance report - Search Engine Land](https://searchengineland.com/bing-webmaster-tools-ai-performance-report-468751)
- [Microsoft Clarity Data Export API - Microsoft Learn](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-data-export-api)
- [Microsoft Clarity MCP Server - Microsoft Learn](https://learn.microsoft.com/en-us/clarity/third-party-integrations/clarity-mcp-server)
- [Heatmap Insights with Copilot - Microsoft Learn](https://learn.microsoft.com/en-us/clarity/copilot/heatmaps-insights)
- [Bing Search APIs Retiring on August 11, 2025 - Microsoft Lifecycle](https://learn.microsoft.com/en-us/lifecycle/announcements/bing-search-api-retirement)
- [Grounding with Bing Pricing Details](https://www.microsoft.com/en-us/bing/apis/grounding-pricing)
- [IndexNow FAQ](https://www.indexnow.org/faq)
- [IndexNow Documentation](https://www.indexnow.org/documentation)
- [Microsoft Advertising Keyword Planner](https://about.ads.microsoft.com/en/tools/planning/keyword-planner)
- [Publishing Guidelines for Microsoft Start Partners](https://helpcenter.microsoftstart.com/kb/articles/70-publishing-guidelines-for-microsoft-start-partners)
- [Knowledge sources summary - Microsoft Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)
- [Bing structured data markup](https://www.bing.com/webmasters/help/marking-up-your-site-with-structured-data-3a93e731)
- [Introducing the New Bing Places for Business (Oct 2025)](https://blogs.bing.com/search/October-2025/Introducing-the-New-Bing-Places-for-Business-Built-for-Business-Owners,-Powered-by-Research)
- [Block URLs from Bing - Bing Webmaster Tools](https://www.bing.com/webmasters/help/block-urls-from-bing-264e560a)
- [Accessing Bing Webmaster Tools API using cURL](https://blogs.bing.com/webmaster/november-2019/Accessing-Bing-webmaster-tools-api-using-cURL)
- [87% of SearchGPT Citations Match Bing's Top Results - Seer Interactive](https://www.seerinteractive.com/insights/87-percent-of-searchgpt-citations-match-bings-top-results)
- [ChatGPT Search makes Microsoft Bing an SEO priority - Search Engine Land](https://searchengineland.com/chatgpt-search-microsoft-bing-seo-448019)
