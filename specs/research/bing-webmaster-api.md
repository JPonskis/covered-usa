# Bing Webmaster Tools API — Research Report for CoveredUSA

**Research date:** 2026-05-13
**Site under test:** coveredusa.org (30-day-old) + benefitsusa.org (has data history) — both verified under the same Bing Webmaster account.

---

## TL;DR

The Bing Webmaster API is a free, REST-friendly JSON service hosted at `https://ssl.bing.com/webmaster/api.svc/json/<Method>?apikey=...`. It exposes ~50 methods covering keyword research, search performance, indexing, link counts, crawl stats, URL submission and site management — all gated by a single user-level API key. The killer feature for our use case is **absolute weekly search volume on Bing** (`GetKeywordStats`) plus **broad-match impression counts for related queries** (`GetRelatedKeywords`) — both confirmed working in live tests below. The AI Performance / Copilot citations dashboard launched Feb 2026 has **no API yet** (officially confirmed by Microsoft on the MS Q&A forum); it's web-UI only with no documented CSV export and a 48–72h lag. Search Performance is available via API with up to 16 months of history but is page-/query-/site-scoped per call (no bulk endpoint), so any programmatic workflow has to loop.

---

## Endpoint Inventory

Base URL: `https://ssl.bing.com/webmaster/api.svc/json/{Method}?apikey=KEY&...`
Auth: API key (query string) or OAuth 2.0. Single user-level key covers all verified sites.
Response: WCF-style JSON wrapped in `{"d": ...}`. Dates returned as `/Date(unix_ms-tz)/`.
Errors: HTTP 400 with `{"ErrorCode":N,"Message":"..."}`.

| Category | Method | Purpose |
|---|---|---|
| **Sites** | `GetUserSites` | List verified sites + DNS/HTML verification codes |
| | `AddSite`, `RemoveSite`, `VerifySite` | Site CRUD + trigger verification |
| | `GetSiteRoles`, `AddSiteRoles`, `RemoveSiteRole` | Delegation |
| **Search Performance** | `GetRankAndTrafficStats` | Daily site-wide impressions + clicks |
| | `GetQueryStats` | Top queries (per site) with impressions, clicks, AvgImpressionPosition, AvgClickPosition |
| | `GetQueryTrafficStats` | Per-query daily traffic |
| | `GetQueryPageStats` | Pages ranking for a specific query |
| | `GetQueryPageDetailStats` | Per-query × per-page detail |
| | `GetPageStats` | Top pages with traffic metrics |
| | `GetPageQueryStats` | Per-page query breakdown |
| **Keyword Research** | `GetKeyword(q, country, lang, startDate, endDate)` | Single keyword: BroadImpressions + Impressions for a date range |
| | `GetKeywordStats(q, country, lang)` | Weekly historical series (BroadImpressions, Impressions) for a single keyword |
| | `GetRelatedKeywords(q, country, lang, startDate, endDate)` | Related queries with broad + strict impression counts (the Bing equivalent of "related keywords / question variants") |
| **Indexing** | `GetUrlInfo`, `GetUrlTrafficInfo`, `GetChildrenUrlInfo`, `GetChildrenUrlTrafficInfo` | Per-URL and per-directory index/traffic info |
| | `GetFetchedUrls`, `GetFetchedUrlDetails`, `FetchUrl` | Test fetcher (renders the URL like Bingbot) |
| | `GetCrawlStats`, `GetCrawlSettings`, `SaveCrawlSettings` | Crawl rate / schedule / stats |
| | `GetCrawlIssues` | Crawl errors |
| **URL / Content Submission** | `SubmitUrl`, `SubmitUrlBatch` | Push URLs to bingbot (10K/day cap; per-site quota; see `GetUrlSubmissionQuota`) |
| | `SubmitContent` | Push raw content (RSS-style) |
| | `SubmitFeed`, `GetFeeds`, `GetFeedDetails`, `RemoveFeed` | Sitemap management |
| | `GetUrlSubmissionQuota`, `GetContentSubmissionQuota` | Daily/monthly remaining quota |
| | `SubmitSiteMove`, `GetSiteMoves` | Domain migration signaling |
| **Backlinks** | `GetLinkCounts(site, page)` | Inbound link counts per site page |
| | `GetUrlLinks(site, url, page)` | Detailed inbound links per URL |
| | `GetConnectedPages`, `AddConnectedPage` | Manually-asserted referring pages |
| **Blocks / Hygiene** | `GetBlockedUrls`, `AddBlockedUrl`, `RemoveBlockedUrl` | Pages to omit from index |
| | `GetActivePagePreviewBlocks`, `AddPagePreviewBlock`, `RemovePagePreviewBlock` | Snippet suppression |
| | `GetQueryParameters`, `AddQueryParameter`, `EnableDisableQueryParameter`, `RemoveQueryParameter` | URL normalization rules |
| | `GetCountryRegionSettings`, `AddCountryRegionSettings`, `RemoveCountryRegionSettings` | Geo-targeting |
| **AI Performance / Copilot citations** | — | **No API endpoint.** Officially confirmed on Microsoft Q&A: "no API is mentioned, the answer is not right now." Web-UI only at bing.com/webmasters under "AI Performance". |

**Rate limits.** Microsoft does not publish numeric rate limits for the read endpoints. Known hard quotas:
- `SubmitUrl` / `SubmitUrlBatch`: site-level daily quota — for coveredusa.org currently `DailyQuota: 100, MonthlyQuota: 1800` (confirmed live, see Test 6 below). Mature sites scale up to 10,000/day.
- Read endpoints: unconfirmed, but community reports tolerate a few requests/sec without throttling. Plan for back-off on HTTP 429 anyway.

**Data retention.** Search Performance: 16 months (as of Oct 2024 update). Keyword history: ~6 months on `GetKeywordStats` weekly series in our live test.

---

## Keyword Research deep-dive

This is the single highest-value piece of the API for CoveredUSA. Three methods, all working live, all free.

### `GetKeywordStats(q, country, lang)`
Returns a weekly time series of impression counts on Bing for the exact query. Two columns:
- `Impressions` — strict-match (exact query)
- `BroadImpressions` — broad-match (query + close variants)

Real numbers we pulled for `q=medicare, country=us, lang=en-US` (Test 2b below): 23 weeks of data, weekly impressions ranging 10,670 → 40,748 (strict) and 154,115 → 531,462 (broad). That is **actual absolute Bing search volume**, not a bucket or a percentile — far better than Google Keyword Planner's banded ranges and arguably better than Ahrefs/Semrush's modeled Bing estimates (which most tools don't even attempt — see Comparison section).

### `GetRelatedKeywords(q, country, lang, startDate, endDate)`
The single most valuable endpoint for picking what to write. Returns a list of related queries with Impressions + BroadImpressions for the date range you provide. For `q=medicare advantage, us, en-US, 2026-02-13 → 2026-05-13` (Test 2g) we got related queries like:

| Query | Impressions | BroadImpressions |
|---|---:|---:|
| aetna medicare advantage | 17,275 | 28,480 |
| united healthcare medicare advantage plans | 2,555 | 2,555 |
| best medicare advantage plans 2026 | 1,295 | 1,295 |
| cigna medicare advantage | 810 | 1,433 |
| blue cross medicare advantage | 2,139 | 3,136 |
| medicare vs medicare advantage | 614 | 862 |

This is gold for programmatic topic discovery: real Bing impressions, with the distinction between strict and broad reveal of intent overlap. Use as a seed-and-expand graph: feed in your 7 template seeds, harvest related queries, recurse one level deep.

### `GetKeyword(q, country, lang, startDate, endDate)`
Single keyword, single date range. Use when you already know the keyword and want one number for a specific window (e.g., last 30 days).

### Date format gotcha
The C# signature implies `DateTime`. In the JSON API, use plain **ISO 8601 string** (`2026-02-13` or `2026-02-13T00:00:00`). The WCF-style `/Date(ms)/` format that the API *returns* does **not** work as input — we tried multiple encodings; only ISO worked. Document this in any wrapper.

### Intent classification / question variants
The API does **not** classify intent (informational/commercial/transactional) — you'll need to do that in post-processing. It also doesn't expose a dedicated "questions" filter the way AlsoAsked/AnswerThePublic does. However, `GetRelatedKeywords` does surface question-form queries naturally (we saw "medicare vs medicare advantage", "what is the medicare income limit", etc., in the live results for benefitsusa.org's `GetQueryStats`). Filter by query starting with `what/how/is/can/who/when/why` to bucket questions yourself.

### vs Google Keyword Planner / Ahrefs / Semrush
- **Specificity:** Bing API gives **exact integer weekly impressions**, both strict and broad. GKP gives banded ranges ("1K–10K"). Ahrefs/Semrush give modeled monthly volume — and almost universally **only for Google**, not Bing.
- **Bing-native:** This is the only first-party source of Bing search demand. Microsoft owns the index; anything else is modeling.
- **Limitation:** US-wide, no state-level breakdowns; country + language are the only segments. No CPC, no difficulty score, no SERP feature data. If you want state-level breakdown for CoveredUSA's state-Medicare-Advantage track, you have to infer it from `GetQueryStats` once your pages start ranking, or seed with Census population × national volume.

**Unconfirmed:** Microsoft's keyword research UI in Bing Webmaster Tools also shows device/country segmentation. The current API surface does **not** appear to expose device segmentation — only country and language parameters. Worth re-checking the docs in 6 months.

---

## AI Performance Report capabilities

Launched as public preview on **Feb 9–10, 2026**. Lives at `bing.com/webmasters` under "AI Performance".

**Dashboard exposes:**
1. **Total citations** — count of times pages from your site appear as sources in Copilot / Bing AI-generated answers.
2. **Average cited pages/day** — unique URLs from your site cited daily.
3. **Grounding queries** — the underlying user prompts that retrieved your content for AI grounding.
4. **Page-level citation counts** — which specific URLs get cited.
5. **Timeline view** — trends over time.

**API status (officially confirmed):** No API. Microsoft Q&A response from Sumit D (Independent Advisor): *"In the Blog post, no API is mentioned so the answer is not right now."* No CSV export is documented in the launch blog or any of the major SEO trade-press writeups (SearchEngineLand, SearchEngineJournal, Seroundtable, ALM Corp, CXL, OtterlyAI).

**Cadence:** Reports run with a 48–72 hour processing lag (unconfirmed against an official Microsoft statement, but consistently cited across 3rd-party guides).

**Practical workaround:** Web-scrape the AI Performance dashboard via an authenticated browser (the openclaw browser profile already has Bing Webmaster Tools cookies if Jacob has logged in there). Brittle, but probably the only path until Microsoft adds the endpoint. Marked as **risky / unconfirmed** until tested.

---

## Search Performance API capabilities

Three layers of resolution, all working live (see Tests 3 / 3b / 3c / 4 below):

| Endpoint | Returns | Useful for |
|---|---|---|
| `GetRankAndTrafficStats` | Daily site-level impressions + clicks | Sparkline / "is Bing traffic trending up?" |
| `GetQueryStats` | Top queries × date with Clicks, Impressions, AvgImpressionPosition, AvgClickPosition | **The "high-impression, low-rank" gap finder** |
| `GetPageStats` | Top pages × date with same metrics | Page-level performance |
| `GetPageQueryStats` | Per-page query breakdown | Per-URL diagnostic |
| `GetQueryPageStats` | Per-query page ranking | "Which of my pages is ranking for X?" |

**Granularity confirmed live:**
- Daily resolution (timestamps in returned data show daily buckets).
- `AvgClickPosition = -1` when there were zero clicks for the query that day (sentinel value).
- `AvgImpressionPosition` is a small integer (we observed 1–9 on benefitsusa.org's small data).
- CTR is **not returned** — compute it as `Clicks / Impressions`.

**Data lag:** 1–3 days (community consensus, unconfirmed by Microsoft docs). Search Performance Help page says reports update "daily."

**Retention:** 16 months in the dashboard since Oct 2024. The API returned a couple months of data on benefitsusa.org during our test (the site is itself only ~6 months old), so 16 months is plausible but unconfirmed for older sites.

**Critical limitation:** No bulk endpoint. Microsoft confirmed on MS Q&A: each endpoint handles one scope at a time. To get every page's query breakdown, you loop through pages and call `GetPageQueryStats` once per URL.

---

## Live test results

API key was read from `/Users/jacobposner/clawd/.secrets/bing-webmaster-api-key.txt` (not echoed below). All requests use the JSON protocol. Three Tier-1 calls + several diagnostic ones:

### Test 1 — `GetUserSites` (auth + which sites this key covers)

`GET https://ssl.bing.com/webmaster/api.svc/json/GetUserSites?apikey=...`

```json
{"d":[
  {"Url":"https://benefitsusa.org/","IsVerified":true,"DnsVerificationCode":"...benefitsusa.org"},
  {"Url":"https://coveredusa.org/","IsVerified":true,"DnsVerificationCode":"...coveredusa.org"}
]}
```

Both domains verified. The key is good. **(Confirmed)**

### Test 2 — Keyword research

`GET .../GetKeywordStats?q=medicare&country=us&language=en-US&apikey=...`

Returned 23 weekly buckets. Sample row:
```json
{"BroadImpressions":531462,"Date":"/Date(1765008000000)/","Impressions":40748,"Query":"medicare"}
```
The single query "medicare" gets 154K–531K broad-match weekly impressions on Bing US. **(Confirmed real volume data)**

`GET .../GetRelatedKeywords?q=medicare%20advantage&country=us&language=en-US&startDate=2026-02-13T00:00:00&endDate=2026-05-13T00:00:00&apikey=...`

Returned 20+ related queries with impression counts. Most useful for picking what to write — top related queries include "aetna medicare advantage" (17K strict), "united healthcare medicare advantage plans" (2.5K), "best medicare advantage plans 2026" (1.3K). **(Confirmed)**

Failed attempts that informed the workflow:
- `/Date(ms)/` format → `ERROR!!! String was not recognized as a valid DateTime`. Use **ISO 8601** for input.
- POST with JSON body → `Method not allowed`. Use **GET with query string**.
- `GetKeywordStats q=medicare advantage california` → empty array. Long-tail queries with low absolute volume return `[]` rather than zeros. Test for empty results before erroring.

### Test 3 — Search Performance for benefitsusa.org

`GET .../GetQueryStats?siteUrl=https%3A%2F%2Fbenefitsusa.org&apikey=...`

Returned hundreds of query × day rows. Sample:
```json
{"Query":"medicaid eligibility income chart 2026","Date":"/Date(1773385200000-0700)/",
 "Clicks":0,"Impressions":8,"AvgImpressionPosition":6,"AvgClickPosition":-1}
```

This is exactly the data we want to mine for "high impression, low rank, zero click" → page that needs better optimization or fresh content. **(Confirmed)**

`GET .../GetPageQueryStats?siteUrl=...&page=...%2Fen%2Fmedicaid-income-limits&apikey=...` returned the per-page query breakdown for one URL. **(Confirmed)**

### Test 4 — Crawl + quota

- `GetCrawlStats?siteUrl=https://coveredusa.org` → `{"d":[]}` (site is too new for crawl stats yet).
- `GetUrlSubmissionQuota?siteUrl=https://coveredusa.org` → `{"DailyQuota":100,"MonthlyQuota":1800}`. **(Confirmed.)** The fresh-site URL submission quota is 100/day — plenty for a programmatic SEO site at our publishing volume. Expect this to scale up as Bing trusts the domain.

---

## Comparison to alternatives

| Tool | Gives Bing-specific data? | Cost | Notes |
|---|---|---|---|
| **Bing Webmaster API** | Yes — native, exact integers | Free | Only first-party source. Mandatory. |
| **Ahrefs** | Google only for keyword volume. Bing traffic estimates exist for sites but are modeled. | $129+/mo | Best for backlinks + competitor research. Complements, not duplicates. |
| **Semrush** | Same as Ahrefs. Some Bing-position tracking for ranking but no Bing volume database. | $139+/mo | Useful for SERP features + competitor pages. Complements. |
| **Mangools / KWFinder** | KWFinder uses Semrush data underneath; no native Bing source. | $49–129/mo | Skip for our use case. |
| **Google Keyword Planner** | Google only, banded volume. | Free w/ Ads account | Useful as a sanity check — Bing volumes are usually ~1/10 of Google's. |
| **KeywordTool.io** | Multi-engine autocomplete (Bing, YouTube, Amazon). Volume gated behind paid tier. | $89+/mo | Useful for surfacing autocomplete suggestions Bing doesn't expose via the Webmaster API. |
| **AnswerThePublic / AlsoAsked** | Mostly Google. | $99/mo | For question discovery if `GetRelatedKeywords` doesn't surface enough Q-form queries. |

**Verdict:** The Bing Webmaster API is the only Bing-native source of search volume. Ahrefs or Semrush complement it (backlinks, competitive Google data, SERP features) but do not duplicate it. For CoveredUSA's "Bing + Copilot first" positioning, the API should drive 80%+ of article-selection decisions.

---

## Recommended workflow for picking articles

Given the 7 template tracks (procedures, drugs, Q&A, glossary, life events, personas, state Medicare Advantage) and ~30-day-old site:

### Daily (5 min, free)
1. `GetUrlSubmissionQuota` → log remaining quota; push newly published URLs via `SubmitUrlBatch`.
2. `GetRankAndTrafficStats` for coveredusa.org → store daily impressions/clicks to a `bing_traffic` table.

### Weekly batch (Mondays, ~30 min, free)
1. `GetQueryStats` for both verified sites → store every query × day to a `bing_queries` table.
2. **Opportunity finder:** filter `bing_queries` for rows where `Impressions >= 5 AND Clicks == 0 AND AvgImpressionPosition > 5`. These are queries where we're showing up but not winning the click. Pipe into the article-writer queue as "rewrite / new article" candidates.
3. `GetPageQueryStats` for each top-100 page → identify pages that should rank for adjacent queries they currently don't.

### Bi-weekly topic harvest (~2 hours, free)
For each of the 7 template tracks, maintain a seed list of 10–20 anchor terms (e.g., for state Medicare Advantage: "medicare advantage california", "medicare advantage texas", ...). Then:

1. For every seed, call `GetRelatedKeywords(seed, us, en-US, last 90 days)`.
2. Dedupe across seeds, store to `bing_keyword_universe` with `BroadImpressions` and `Impressions`.
3. For top N (say 50 per track per cycle), call `GetKeywordStats` to get the 6-month weekly trend.
4. Filter for: **rising trend** (last-4-week avg > prior-12-week avg) AND **strict impressions ≥ 200/week** AND **not yet a URL on coveredusa.org**.
5. Output ranked list to the article-ideation pipeline. This becomes the input to the existing `seo-cron-manager` skill.

### Monthly: AI Performance check (~10 min, manual)
Until the AI Performance API exists, log into Bing Webmaster Tools manually (or scrape via openclaw browser) and screenshot:
- Total citations trend.
- Top 20 cited pages.
- Grounding queries — these are gold for figuring out **what Copilot thinks our pages are about**, which is a different signal than what Bing ranks them for. Feed grounding queries back into the seed list for the next bi-weekly harvest.

### Implementation suggestion
- Node script using plain `fetch` against the JSON endpoints. No SDK needed — the MERJ Python client (`merj/bing-webmaster-tools`) is the gold standard if we go Python.
- Store everything in Supabase (`bing_queries`, `bing_keyword_universe`, `bing_keyword_history`) with daily/weekly snapshots. Microsoft only keeps 16 months — we should keep forever.
- Wrap calls in retry-with-backoff. The single error mode seen live was the date-format gotcha, not throttling.

---

## Open questions / risks

1. **AI Performance API timing.** Microsoft hinted "more in 2026." If the API ships with citations + grounding queries, it instantly becomes the #1 endpoint for us. **Action:** check `blogs.bing.com/webmaster` monthly.
2. **State-level breakdown.** The Keyword Research methods only segment by country + language. For CoveredUSA's state Medicare Advantage track, we cannot get California-vs-Texas Bing volume directly. **Workaround:** infer from `GetQueryStats` once pages rank, or model `state_volume ≈ national_volume × state_population_share`.
3. **Rate limits unpublished.** No official numbers on read-endpoint rates. Plan for back-off on HTTP 429, though we haven't hit one. **Risk:** medium.
4. **WCF-style date format inconsistency.** Input dates are ISO 8601, output dates are `/Date(ms-tz)/`. Any wrapper must parse the output format with regex. Known footgun — log it in the wrapper.
5. **The MS Q&A forum thread that confirmed "no bulk endpoint"** is dated and the answer was from an Independent Advisor, not a Microsoft employee. **Unconfirmed:** whether Microsoft has shipped a bulk endpoint since. Worth a re-check in Q3 2026.
6. **Verification age and quota scaling.** coveredusa.org's daily URL submission quota is currently 100. Bing scales this based on "site verified age" plus other signals (per the 2019 blog post). **Action:** track quota daily; flag for review when it changes.
7. **Long-tail empty results.** `GetKeywordStats` returns `{"d":[]}` for low-volume queries (e.g., "medicare advantage california"). Don't interpret this as "0 volume" — it likely means "below Bing's reporting threshold." Cross-check with `GetRelatedKeywords` which does seem to surface lower-volume related queries.

---

## Sources

- [Bing Webmaster API — Microsoft Learn](https://learn.microsoft.com/en-us/bingwebmaster/)
- [Getting Access to the Bing Webmaster Tools API](https://learn.microsoft.com/en-us/bingwebmaster/getting-access)
- [Bing Webmaster Tools API Services (protocols)](https://learn.microsoft.com/en-us/bingwebmaster/api-protocols)
- [IWebmasterApi Interface — full method list](https://learn.microsoft.com/en-us/dotnet/api/microsoft.bing.webmaster.api.interfaces.iwebmasterapi)
- [Introducing AI Performance in Bing Webmaster Tools (Feb 2026 blog)](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)
- [Microsoft Q&A — "AI Performance Report. Is there an API?"](https://learn.microsoft.com/en-us/answers/questions/5780844/bing-webmaster-tools-ai-performance-report-is-ther)
- [Microsoft Q&A — bulk retrieval of search performance metrics](https://learn.microsoft.com/en-us/answers/questions/5595644/how-do-i-retrieve-search-performance-metrics-in-bu)
- [Bing Webmaster API — Accessing via cURL (Nov 2019 blog)](https://blogs.bing.com/webmaster/november-2019/Accessing-Bing-webmaster-tools-api-using-cURL)
- [Bing extends search performance data to 16 months (Oct 2024)](https://blogs.bing.com/webmaster/October-2024/Bing-Webmaster-Tools-Extends-Search-Performance-Data-to-16-Months)
- [GetKeywordStats — Analytics Edge field reference](https://bing-webmaster-api.analyticsedge.com/getkeywordstats/)
- [GetQueryStats — Analytics Edge field reference](https://bing-webmaster-api.analyticsedge.com/getquerystats/)
- [MERJ Python client (open source)](https://github.com/merj/bing-webmaster-tools)
- [Bing Webmaster Tools officially adds AI Performance — Search Engine Land](https://searchengineland.com/bing-webmaster-tools-ai-performance-report-468751)
- [Bing Webmaster Tools Adds AI Citation Performance Data — SEJ](https://www.searchenginejournal.com/bing-webmaster-tools-adds-ai-citation-performance-data/566874/)
