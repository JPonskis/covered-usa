# Link Target Manifest — CoveredUSA

**Version:** 1.0
**Date:** 2026-05-14
**Anchored to commit:** covered-usa@2612ee7
**Companion docs:** `specs/URL_SLUG_FRAMEWORK.md`, `specs/AI_OPTIMIZATION_FRAMEWORK.md` (§2.4 cluster representative, §9 internal linking), `specs/CURRENT_STATE_AUDIT.md` (§2 universal pattern #4: no inline body links to lighthouses)

---

## 0. Purpose

This doc is the **system specification** for CoveredUSA's auto-generated internal-link routing. The actual link routing data lives at `content/link-index.json`, regenerated on every build. No human ever edits that file.

The goal: writer agents drop 3-5 inline body links per page to the right canonical URLs, with zero ongoing human edits and zero risk of URL drift.

### Why this exists

The audit (§2 universal pattern #4) flagged "no inline body links to lighthouses" as a sitewide gap across all 8 templates. The locked decision from the bridge (decision #6) is 3-5 inline body links per page, natural placement, no density forcing. But a writer agent needs to know WHERE to point those links. Without a manifest, agents either skip internal links or hallucinate URLs.

### Why it's fully automated (not human-curated)

CoveredUSA's content production runs on cron jobs. Human edit cycles don't keep pace. A stale link manifest is worse than no manifest — writer agents will route to URLs that 404 or skip URLs they should be using. Solution: derive the manifest from page-level metadata that writer agents fill in as part of writing the content. No separate edit step.

### Precedent

BenefitsUSA's writer agent prompt has two hardcoded link rules: "link to /screener; if state-specific, link to /states/[state]." That's the entire system. It works at 2,000+ articles because the AI writer is good at natural placement. CoveredUSA goes further because the topic surface is denser (Medicare, Medicaid, ACA, FPL, medical bills, drugs, procedures all have their own canonical link targets) — but the *zero human edits* principle is the same.

---

## 1. Page-level metadata contract

Every content data file declares three new fields. Writer agents fill these in as part of the write step; no separate manifest edit.

### 1.1 Schema additions

For JSON templates (`content/data/{procedures,drugs,qa,glossary,events,personas,medicare-advantage}/*.json`):

```json
{
  "topicCluster": "medicaid-income",
  "keyTerms": {
    "en": ["Medicaid income", "Medicaid income limit", "Medicaid income limits", "Medicaid eligibility income"],
    "es": ["límite de ingresos de Medicaid", "ingresos para Medicaid"]
  },
  "isLighthouse": true,
  "isDeprecated": false
}
```

For blog posts (`content/blog/*.md` frontmatter):

```yaml
topicCluster: medicaid-income
keyTerms:
  en: ["Medicaid income", "Medicaid income limit"]
  es: ["ingresos para Medicaid"]
isLighthouse: false
isDeprecated: false
```

For hardcoded reference pages (`src/app/[locale]/<slug>/page.tsx`): exported as a `linkIndexMeta` constant the build script imports.

```ts
export const linkIndexMeta = {
  topicCluster: 'medicaid-income',
  keyTerms: {
    en: ['Medicaid income', 'Medicaid income limit', 'Medicaid income limits'],
    es: ['límite de ingresos de Medicaid'],
  },
  isLighthouse: true,
  isDeprecated: false,
};
```

### 1.2 Field semantics

- **`topicCluster`** (required, string) — the topic this page belongs to. Slug-style identifier (lowercase, hyphenated). Each page belongs to exactly one cluster.
- **`keyTerms`** (required, `{ en: string[], es: string[] }`) — phrases that, when they appear in body content of OTHER pages, should hyperlink to THIS page. Treat each term like an SEO anchor candidate. Per locale.
- **`isLighthouse`** (optional, defaults `false`) — explicit lighthouse marker. At most one lighthouse per cluster.
- **`isDeprecated`** (optional, defaults `false`) — set `true` to exclude this page from the link index without changing its URL. The page stays live (per slug framework Rule 1: URLs are forever), but writer agents stop routing new links to it.

### 1.3 Locale handling

Each cluster's canonical URL is the same path; the locale prefix (`/en/...` vs `/es/...`) is added at link-emit time based on the writing locale. `keyTerms.en` and `keyTerms.es` cover the language-specific phrase matching. A Spanish blog post writing about "ingresos para Medicaid" auto-links to `/es/medicaid-income-limits`; an English page mentioning "Medicaid income" auto-links to `/en/medicaid-income-limits`.

---

## 2. Initial cluster taxonomy

The first build needs an initial taxonomy. The bootstrap script (§7) generates this once from existing content. Going forward, every new page declares its `topicCluster` and the taxonomy expands organically.

### 2.1 Bootstrap clusters (initial)

| Cluster ID | Tentative lighthouse | Spokes (examples) | Status |
|---|---|---|---|
| `medicaid-income` | `/medicaid-income-limits` | blog medicaid posts; `/qa/...medicaid...` | Hardcoded lighthouse live |
| `medicare-eligibility` | `/medicare-eligibility` | `/event/turning-65`; medicare blog posts | Hardcoded lighthouse live |
| `aca-income` | `/aca-income-limits` | aca-subsidy blog posts; aca Q&A | Hardcoded lighthouse live |
| `federal-poverty-level` | `/federal-poverty-level` | FPL-related blogs; persona FPL refs | Hardcoded lighthouse live |
| `medical-bill-analyzer` | `/medical-bill-analyzer` | bill negotiation blogs; future `/bill/*` | Hardcoded lighthouse live |
| `medicare-advantage` | `/medicare-advantage` (hub, planned) | 51 state spokes | Hub planned (Track D) |
| `medicare-costs` | `/medicare-costs` (planned) | Part B, MOOP, premium blog posts | Hub planned (Track D) |
| `aca-subsidy-cliff` | `/aca-subsidy-cliff` (planned) | cliff blog posts; cliff Q&A | Hub planned (Track D) |
| `glossary-hub` | `/glossary/health-insurance-terms-explained` (planned) | every `/glossary/*` term | Hub planned (Track D) |
| `mri-cost` | `/cost/mri` | MRI blog mentions | Template spoke is lighthouse |
| `magi` | `/glossary/magi` | MAGI mentions in any page | Template spoke is lighthouse |
| `oop-max` | `/glossary/out-of-pocket-maximum` | OOP refs | Template spoke is lighthouse |
| `turning-26` | `/event/turning-26` | T26 mentions | Template spoke is lighthouse |
| `turning-65` | `/event/turning-65` | T65 mentions | Template spoke is lighthouse |
| `lost-job` | `/event/lost-job` | Job-loss mentions | Template spoke is lighthouse |
| `gig-workers` | `/for/gig-workers` | Rideshare/gig mentions | Template spoke is lighthouse |
| `self-employed` | `/for/self-employed` | Freelancer/1099 mentions | Template spoke is lighthouse |
| ... | ... | ... | Expands per page |

### 2.2 The lighthouse-per-cluster rule

Each cluster has **exactly one** canonical link target. Selection priority:

1. Hardcoded reference page (`src/app/[locale]/<slug>/page.tsx`) with `isLighthouse: true`
2. Template page with `isLighthouse: true`
3. Oldest page in the cluster (longest accumulated authority)

If two pages declare `isLighthouse: true` in the same cluster, the validator fails the build. Forces explicit deconfliction.

### 2.3 Spokes link to lighthouses; lighthouses link laterally

- A spoke page mentions the cluster's primary entity → auto-links to the cluster's lighthouse
- A lighthouse page mentions ANOTHER cluster's primary entity → auto-links to that other cluster's lighthouse
- Lighthouses do not link to their own spokes (that's the spoke's job to link up)

---

## 3. Auto-generation algorithm

`scripts/coveredusa-build-link-index.js`, invoked as part of `prebuild`. Pseudocode:

```
1. Walk every content data file:
     content/data/*/*.json
     content/blog/*.md (frontmatter)
     src/app/[locale]/<slug>/page.tsx (linkIndexMeta export)

2. For each page, collect: { url, topicCluster, keyTerms, isLighthouse, isDeprecated, lastUpdated }

3. Skip pages where isDeprecated === true.

4. Group by topicCluster.

5. For each cluster, pick the canonical URL by §2.2 priority:
     - explicit isLighthouse hardcoded page
     - explicit isLighthouse template page
     - oldest page

6. Validation pass (fails the build on violation):
     - Every page has topicCluster and keyTerms (strict-fail)
     - At most one isLighthouse per cluster (strict-fail)
     - Every keyTerms entry maps to exactly one cluster sitewide
       (i.e., "MAGI" cannot appear in both 'magi' and 'aca-income' clusters)
     - Cluster lighthouse URL resolves (file exists)

7. Emit content/link-index.json with byTopic, byPhrase, lighthouses.

8. Emit content/link-index.stats.json with cluster size, last-updated, deprecation rate.
```

The script is deterministic, idempotent, and fast (under a second on the current ~75 pages).

---

## 4. Link index format

`content/link-index.json` — the consumable artifact.

```json
{
  "generatedAt": "2026-05-14T18:30:00Z",
  "commit": "abc123",
  "byTopic": {
    "medicaid-income": {
      "lighthouse": "/medicaid-income-limits",
      "spokes": ["/qa/who-qualifies-for-medicaid", "/blog/medicaid-vs-marketplace-insurance"]
    },
    "magi": {
      "lighthouse": "/glossary/magi",
      "spokes": []
    }
  },
  "byPhrase": {
    "en": {
      "Medicaid income": "medicaid-income",
      "Medicaid income limit": "medicaid-income",
      "Medicaid income limits": "medicaid-income",
      "MAGI": "magi",
      "modified adjusted gross income": "magi"
    },
    "es": {
      "ingresos para Medicaid": "medicaid-income",
      "MAGI": "magi"
    }
  },
  "lighthouses": [
    "/medicaid-income-limits",
    "/federal-poverty-level",
    "/medicare-eligibility",
    "/aca-income-limits",
    "/medical-bill-analyzer",
    "/glossary/magi",
    "/cost/mri"
  ]
}
```

---

## 5. Writer agent contract

Every writer agent prompt includes the following block:

```
INTERNAL LINK ROUTING

Before writing, load content/link-index.json.

When writing body prose, for each phrase you mention that appears in
link-index.byPhrase[<locale>], hyperlink the FIRST occurrence to the
mapped canonical URL: /<locale>/<lighthouse-path>.

Rules:
- Maximum 5 inline body links per page.
- Only first occurrence per phrase per page.
- Only in body prose, table cells, and FAQ answers — never in H1, H2, or H3.
- Never link to your own page (do not self-link).
- Never link a phrase already inside an existing link.
- If natural placement doesn't fit, skip — never force.

Also write your own page's metadata:
- topicCluster: pick a slug-style cluster ID (existing or new)
- keyTerms.{en,es}: list 3-8 phrases that other pages mentioning this
  page's primary entity should auto-link to this page
- isLighthouse: only set true for explicitly designated lighthouses;
  default false for spokes
- isDeprecated: leave false unless explicitly migrating
```

The writer agent never asks for human input on these fields. They're declared as part of the write.

---

## 6. Validator rules

Each per-template validator and the blog validator runs these checks:

### 6.1 Page-level (strict-fail)

- `topicCluster` is present and matches `/^[a-z0-9-]+$/`
- `keyTerms.en` is present and has ≥1 entry
- `keyTerms.es` is present and has ≥1 entry (if page has Spanish locale)
- `isLighthouse` and `isDeprecated` are booleans (if declared)

### 6.2 Sitewide (run by `coveredusa-build-link-index.js`)

- At most one `isLighthouse: true` per `topicCluster` (strict-fail with both URLs in error)
- Every `keyTerms` phrase maps to exactly one cluster (strict-fail with both URLs in error if duplicated)
- Every cluster lighthouse URL resolves (strict-fail)
- No `topicCluster` has zero pages (warn — orphaned cluster, possibly typo)
- No cluster has lighthouse but zero spokes after 30 days (warn — possibly dead cluster)

### 6.3 Output validation (run on built pages)

- Every page emits 3-5 inline body links (warn if outside range; not fail — natural placement trumps count)
- No inline body link is broken (strict-fail — URL must resolve)
- No page self-links (strict-fail)
- No phrase appears as anchor more than once on a page (strict-fail)

---

## 7. Edge cases and resolutions

### 7.1 Phrase appears in multiple cluster candidates

Example: "premium" could match ACA premium OR Medicare Part B premium clusters. Resolution: each cluster's `keyTerms` should be specific enough to disambiguate ("ACA premium," "Medicare Part B premium"). Bare "premium" should not be in any cluster's `keyTerms`. If a writer agent puts ambiguous "premium" in body content, no auto-link fires — safer than wrong-link.

The validator catches this: if "premium" appears in two clusters' `keyTerms`, build fails with both URLs in the error.

### 7.2 New cluster opens up

Writer agent declares a new `topicCluster` that doesn't exist yet. Build script accepts the new cluster, assigns the page as its lighthouse (if `isLighthouse: true`) or as a spoke. No human action required.

### 7.3 Cluster needs to split

Example: `medicaid-income` accumulates 30 pages and we realize "Medicaid income limits by state" should be its own cluster. Solution:
- A future writer agent creates `/medicaid-income-limits-california` with `topicCluster: medicaid-income-by-state`, `isLighthouse: true`
- Pages that should belong to the new cluster get updated `topicCluster` on next regen (Track E)
- No URL changes; no manifest edits

### 7.4 Lighthouse needs to be replaced

Example: `/medicare-costs` ships as the proper lighthouse for `medicare-costs` cluster, replacing some other page that was tentatively holding the slot. Solution:
- New lighthouse page declares `isLighthouse: true`
- Old page's `isLighthouse` flips to `false` (writer agent does this as part of the Track E regen, or one-off update)
- Build script picks up the change; all spoke links re-route

### 7.5 URL needs to be deprecated

Example: we decide a page is a near-duplicate and want to consolidate. We can't migrate the slug (Rule 1). Solution:
- Set `isDeprecated: true` on the loser page
- Build script excludes it from the link index
- The page stays live (existing inbound links still resolve), but no new outbound auto-links are routed to it
- Writer agents stop seeing it as a target

The slug framework's Rule 5 prevents most near-duplicates from being created in the first place, so deprecation should be rare.

### 7.6 Bootstrap drift on existing content

The 36 existing blog posts + 20 existing template pages don't have `topicCluster` or `keyTerms` yet. Solution: bootstrap script (§8) does one pass to populate sensible defaults from filename + frontmatter heuristics. Writer agents in Track C/E refine these during the bulk regen.

---

## 8. Lifecycle examples

### 8.1 Day-zero (Track A5 ship)

1. `coveredusa-build-link-index.js` runs for the first time.
2. Script throws errors: 75 pages missing `topicCluster` / `keyTerms`.
3. We run `scripts/coveredusa-bootstrap-link-index.js` (one-off): scans every existing page, infers `topicCluster` from filename heuristics, infers `keyTerms` from title + H1, sets `isLighthouse: true` on hardcoded reference pages.
4. Bootstrap commits the inferred metadata into each data file.
5. Build script runs clean. `content/link-index.json` is generated.
6. Day-zero validator integration: enforces `topicCluster` + `keyTerms` on every new page from this point forward.

### 8.2 Steady-state — daily blog post

1. Cron triggers Stage 1 article writer.
2. Writer agent reads `content/link-index.json`.
3. Writer drafts the blog post in markdown.
4. Writer auto-hyperlinks first-occurrence phrases matching `byPhrase`. Caps at 5 links.
5. Writer declares its own `topicCluster`, `keyTerms`, `isLighthouse: false`, `isDeprecated: false` in frontmatter.
6. Stage 2 cron commits. Prebuild regenerates `content/link-index.json` including the new post.
7. Next blog post tomorrow has access to today's post as a potential link target.

### 8.3 Track D lighthouse ship

1. Writer agent creates `/medicare-costs/page.tsx` with `linkIndexMeta` declaring `topicCluster: 'medicare-costs'`, `isLighthouse: true`, and `keyTerms` like `['Medicare costs', 'Medicare expenses', 'Medicare out-of-pocket']`.
2. Build script picks it up. New cluster registered. New lighthouse anchored.
3. Existing Medicare-cost-related blog posts (already in cluster `medicare-costs`) now auto-link to the new hub on next page render — no edits to those blog posts.
4. Going forward, every new page mentioning "Medicare costs" auto-links to `/medicare-costs`.

### 8.4 Cluster representative shift (BenefitsUSA learning applied)

If we discover Bing's grounding index has picked `/blog/medicare-part-b-cost-2026` as cluster representative for "Medicare Part B cost" (and we'd rather it be `/medicare-costs`):
- Track AA's Bing AI Performance Report ingestion surfaces this.
- We set `isLighthouse: true` on `/medicare-costs` and refine its `keyTerms` to specifically claim "Medicare Part B cost."
- Build script re-routes future links. Slug stays the same on the blog post per Rule 1.

---

## 9. Anti-target backstop

We don't maintain an anti-targets list because the slug framework's Rule 5 ("one URL per cluster") prevents near-duplicates from being created in the first place. The few cases where deprecation is needed are handled by `isDeprecated: true` per §7.5.

If a writer agent ever proposes a URL that:
- Doesn't exist (404)
- Is marked `isDeprecated: true`
- Self-links

The validator catches it at PR time. No anti-targets manifest required.

---

## 10. Cross-references

- `specs/URL_SLUG_FRAMEWORK.md` — slug rules (Rule 5: one URL per cluster, which backstops the anti-target absence)
- `specs/AI_OPTIMIZATION_FRAMEWORK.md` §2.4 — cluster representative mechanic (the citation-side reason this matters)
- `specs/AI_OPTIMIZATION_FRAMEWORK.md` §9 — internal linking guidance
- `specs/CURRENT_STATE_AUDIT.md` §2 universal pattern #4 — "no inline body links to lighthouses" was the gap this system closes
- `specs/CURRENT_STATE_AUDIT.md` §3.3 — persona consolidation decision (concrete cluster-split case)
- `specs/PHASE_5_BRIDGE.md` §3 — Jacob's empirical grounding-query data showing canonical-form coverage matters (FPL / federal poverty level / poverty line all generate volume)
- `specs/PHASE_5_BRIDGE.md` §10 — locked decision 6 (3-5 inline body links per page, no density forcing)

---

## 11. File map

| File | Role | Owner |
|---|---|---|
| `content/link-index.json` | Auto-generated link routing data | Build script |
| `content/link-index.stats.json` | Auto-generated cluster health stats | Build script |
| `scripts/coveredusa-build-link-index.js` | Build script (runs every prebuild) | Track A5 |
| `scripts/coveredusa-bootstrap-link-index.js` | One-off bootstrap for existing content | Track A5 |
| `scripts/validate-{procedures,drugs,qa,glossary,events,personas,medicare-advantage}.js` | Per-page validators | Track A5 |
| `scripts/validate-blog.js` | Blog frontmatter validator | Track A5 |
| Writer agents in `.claude/agents/coveredusa-*-writer.md` | Read link-index.json, auto-link, declare metadata | Tracks B1 / C |

---

*This is the system spec. The link index that writer agents actually consume regenerates every build with zero human input. The only human-facing changes are when slug framework or framework v1.1 rules change — which we expect roughly never after Phase 5 ships.*
