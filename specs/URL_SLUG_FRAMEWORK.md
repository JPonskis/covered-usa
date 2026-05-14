# URL Slug Framework — CoveredUSA

**Version:** 1.0
**Date:** 2026-05-14
**Anchored to commit:** covered-usa@2612ee7
**Companion docs:** `specs/AI_OPTIMIZATION_FRAMEWORK.md` (§4.1, §2.4), `specs/CURRENT_STATE_AUDIT.md`, `specs/LINK_TARGET_MANIFEST.md`

---

## 0. Purpose

This is the single source of truth for URL slug rules on CoveredUSA. Every writer agent reads it. Every validator enforces it. Every new template inherits from it.

The doc exists because two things are absolute and one is empirical:

- **URL stability is absolute.** Slugs are forever. Migrating a slug — even with a 301 — rebuilds trust from zero and risks losing cluster representative status in Bing's grounding index. We have firsthand evidence (Jacob has tanked a page doing this).
- **Slug structure is a citation signal.** Cluster representative selection (Bing's near-duplicate dedup mechanic) favors short, entity-first URLs with state/locale as a static subdirectory.
- **Year-in-slug is empirically penalized over time.** A `/blog/...-2026` URL becomes structurally wrong on January 1, 2027 — when refreshed for the next year, the slug is either misleading (still says 2026) or has to be migrated (which we forbid). The fix: year markers belong in H1, title, meta description, and first paragraph — never the slug.

---

## 1. The 5 rules

### Rule 1 — Stability is absolute

Slugs never change. Not for SEO, not for AI optimization, not for cleanup. If a URL ships, it lives forever. Content inside can be rewritten freely; the URL is immutable.

**Why:** Jacob has personally tanked a page changing its slug. Accumulated organic authority and any in-flight cluster representative status are lost the moment the URL changes. Even with 301 redirects, the new URL has to rebuild trust from zero and Bing's cluster representative selection treats the migration as a new candidate.

**How to enforce:**
- No PR should change an existing slug in `content/blog/`, `content/data/*/`, or any dynamic route path.
- Renaming a file in `content/blog/` is forbidden.
- Renaming a JSON file's `slug` field is forbidden.
- Writer agents must check the existing slug list before proposing a new one — if a target topic already has a live page, write to that slug.

**Memory:** `feedback_never_migrate_slugs.md` persists this rule across sessions.

### Rule 2 — No year in slug

Year markers belong in H1, title, meta description, and first paragraph. Never the slug.

**Why:** A year-in-slug page becomes structurally wrong every January. Migrating to fix it violates Rule 1. The annual refresh problem is solved by keeping the slug evergreen and updating the in-page year markers.

**How to enforce:**
- Validator regex (strict-fail): `/\b(19|20)\d{2}\b/` against the slug → must NOT match for any new content.
- Writer agent prompt must explicitly forbid year-in-slug output.
- Applies to new content only. The 16 grandfathered blog slugs in §5 are exempt (they predate the rule and Rule 1 makes them immutable).

### Rule 3 — Primary entity closest to root

Slugs name the entity, not a marketing phrase. `/cost/mri`, not `/healthcare-costs/mri-pricing-guide`.

**Why:** Short, entity-first URLs are more readable, more likely to be selected as cluster representative, and parse more reliably across LLM citation surfaces. Long marketing-phrase URLs are operator-conventional but carry no measured retrieval benefit.

**How to enforce:**
- Validator (strict-fail): slug length ≤ 60 characters.
- Validator (strict-fail): characters limited to `[a-z0-9-]`. No underscores. No uppercase. No special characters.
- Validator (strict-fail): no leading/trailing hyphen. No consecutive hyphens.
- Validator (warn): stop-word list (`the`, `a`, `an`, `for`, `is`, `of`, `to`, `with`) → flag if slug starts with a stop word.
- Writer agent prompt: prefer singular noun forms (`mri`, not `mris`); skip stop words; entity name first.

### Rule 4 — State/locale as static subdirectory

`/medicare-advantage/california`, never `?state=california`. Locale is handled by Next.js `[locale]` at the top of the route tree (`/en/...`, `/es/...`). State-as-subdir is the canonical citation-friendly shape, empirically confirmed in Jacob's grounding-query data (state + program + topic is the dominant fan-out variant in `PHASE_5_BRIDGE.md` §3).

**Why:** Query parameters get dropped or normalized inconsistently by retrieval systems. Static subdirectories are robust. The state-name slug is also the natural anchor text and the natural mention surface for Specification fan-out variants.

**How to enforce:**
- Validator (strict-fail): no `?` or `&` in canonical paths.
- Template URL patterns in §2 below specify state position per template.
- State slugs are lowercase full state names (`california`, not `ca`; `new-mexico`, not `new_mexico` or `nm`).

### Rule 5 — One URL per cluster

Synonyms consolidate into one canonical URL. Don't ship `/cost/mri-scan` AND `/cost/mri`. Don't ship `/for/freelancers` AND `/for/self-employed` for overlapping personas. Pick the canonical form; cover synonyms in body content (H2s, table rows, prose entities).

**Why:** Bing's cluster representative mechanic (Framework §2.4, graded LIKELY) deduplicates near-duplicate URLs and picks one to represent the cluster. Two near-duplicate URLs split potential citation weight; one canonical URL with synonym body coverage wins both. Jacob's grounding data confirms this: `FPL`, `federal poverty level`, `poverty line`, `poverty guidelines` all generate separate query volume for the same concept — covered cleanly by one page that names all forms.

**How to enforce:**
- Pre-write check: writer agent searches `content/data/*/` and `content/blog/` for synonym slug variants before proposing a new slug. If a synonym exists, write to that slug (Rule 1) and add the synonym variant to its body content (Section 5.6 of the framework).
- New-template launches: audit queued sheet rows for synonym overlap before bulk-write (the 6 persona-variant rows surfaced in `CURRENT_STATE_AUDIT.md` §3.3 are the canonical example).

---

## 2. Per-template URL patterns

| Template | URL pattern | Slug shape | Example | Status |
|---|---|---|---|---|
| Procedure cost | `/cost/[procedure]` | Singular procedure entity, lowercase, no year | `/cost/mri` | Live |
| Drug cost | `/drug/[drug]` | Brand name OR generic, lowercase | `/drug/ozempic`, `/drug/metformin` | Live |
| Q&A | `/qa/[question]` | Condensed question phrase, no leading stop words | `/qa/does-medicare-cover-dental` | Live |
| Glossary | `/glossary/[term]` | Canonical industry term, hyphenated, lowercase | `/glossary/magi`, `/glossary/out-of-pocket-maximum` | Live |
| Life event | `/event/[event]` | Event-as-noun-phrase | `/event/turning-26`, `/event/lost-job` | Live |
| Persona | `/for/[persona]` | Persona descriptor, plural OK | `/for/gig-workers`, `/for/self-employed` | Live |
| State Medicare Advantage | `/medicare-advantage/[state]` | Lowercase full state name | `/medicare-advantage/california` | Live |
| Daily SEO blog | `/blog/[slug]` | Topic phrase, evergreen, no year | `/blog/how-to-negotiate-hospital-bills` | Live |
| Medical bill | `/bill/[topic]` | Sub-type-aware (see below) | `/bill/cedars-sinai-financial-assistance` | Planned |
| State ACA marketplace | `/aca-marketplace/[state]` | Lowercase full state name | `/aca-marketplace/california` | Planned |

### Lighthouse hubs (planned, hardcoded routes)

| URL | Anchors | Status |
|---|---|---|
| `/medicare-costs` | Medicare costs cluster (Part A/B/C/D, MOOP, premiums) | Planned |
| `/aca-subsidy-cliff` | ACA cliff topic cluster | Planned |
| `/glossary/health-insurance-terms-explained` | Glossary lighthouse for cluster representative concentration | Planned |
| `/medicare-advantage` (hub root) | 51 state Medicare Advantage spokes | Planned |

The bill template's six sub-types each have their own slug convention:

| Sub-type | Slug shape | Example |
|---|---|---|
| Hospital FAP | `[hospital-slug]-financial-assistance` | `/bill/cedars-sinai-financial-assistance` |
| State law | `[state]-surprise-billing-law` | `/bill/california-surprise-billing-law` |
| CPT code | `cpt-[code]-[entity]` | `/bill/cpt-99213-office-visit` |
| Concept | Concept-as-noun-phrase | `/bill/balance-billing` |
| HowTo | `how-to-[action]-[noun]` | `/bill/how-to-dispute-hospital-bill` |
| Viral markup | `[procedure]-[markup-claim]` | `/bill/saline-bag-markup` |

---

## 3. Validator specification

Each per-template validator (`scripts/validate-procedures.js`, etc.) and the blog frontmatter validator must implement these checks against the slug field.

### Strict-fail checks (block deploy)

```js
// Rule 2: no year-in-slug
if (/\b(19|20)\d{2}\b/.test(slug)) fail('Year markers belong in H1/title/meta, not slug');

// Rule 3: length cap
if (slug.length > 60) fail(`Slug ${slug.length} chars, max 60`);

// Rule 3: character set
if (!/^[a-z0-9-]+$/.test(slug)) fail('Slug must be [a-z0-9-] only — no underscores, uppercase, special chars');

// Rule 3: no edge hyphens, no doubled hyphens
if (/^-|-$|--/.test(slug)) fail('No leading/trailing/consecutive hyphens');

// Rule 4: no query parameters in canonical paths
if (slug.includes('?') || slug.includes('&')) fail('Use static subdirectories, not query params');
```

### Warn checks (flag but allow)

```js
// Rule 3: stop-word lead
const STOP_WORDS = ['the','a','an','for','is','of','to','with'];
if (STOP_WORDS.includes(slug.split('-')[0])) warn('Slug starts with stop word');
```

### Grandfather exemption

The 16 grandfathered slugs in §5 are exempt from Rule 2 (year-in-slug). Validators should skip the year check ONLY for slugs in this explicit allow-list. New slugs containing a year always fail.

---

## 4. Writer agent contract

Every writer agent prompt must include the following slug-generation contract:

1. **Receive the target topic.** From the sheet row or input.
2. **Check existing slugs.** Search `content/data/<template>/*.json` and `content/blog/*.md` for any synonym of the target. If found, write to the existing slug (Rule 1). If not found, proceed to step 3.
3. **Propose a slug.** Apply Rules 2-5: no year, ≤60 chars, lowercase kebab-case, entity-first, no stop-word leads, singular noun where natural.
4. **Self-validate before write.** Run the regex checks from §3 mentally; if any fail, revise the slug.
5. **Emit the slug.** Slug is the filename (for blog) or the `slug` field (for JSON data).

Writer agents do NOT propose slug migrations. Ever. If a writer agent suggests "the existing slug is suboptimal, here's a better one," that suggestion is rejected at verifier time and never reaches deploy.

---

## 5. Grandfathered slugs (Rule 1 exemptions)

These slugs predate the URL framework and are immutable per Rule 1. They are exempt from Rule 2 (year-in-slug) but no others. The list is closed — no new entries can be added.

### Blog (16 entries, year-in-slug)

```
aca-health-insurance-eligibility-2026
aca-income-limits-2026
aca-open-enrollment-dates-2026
aca-subsidy-amounts-by-income-2026
aca-subsidy-calculator-2026
aca-subsidy-cliff-2026
cost-of-medical-procedures-without-insurance-2026
do-i-qualify-for-medicaid-2026
federal-poverty-level-2026-guidelines
free-health-insurance-low-income-2026
how-medical-debt-affects-credit-score-2026
medicaid-vs-medicare-difference-2026
medicare-eligibility-age-requirements-2026
medicare-part-b-cost-2026
medicare-savings-programs-2026
obamacare-income-limits-2026
```

**Operational note:** when these pages get refreshed for 2027 content (per Framework §11.4 maintenance protocol), the slug stays. Year markers in H1, title, meta description, and first paragraph all update. The slug carries `2026` forever as a structural artifact of when it was written. This is fine — Rule 1 wins.

---

## 6. Worked examples — good vs bad

| Bad | Why bad | Good |
|---|---|---|
| `/cost/mri-scan-pricing-guide-2026` | Year-in-slug (R2); marketing phrase (R3); over-long | `/cost/mri` |
| `/glossary/what-is-magi-modified-adjusted-gross-income` | Stop-word lead (R3); marketing phrase | `/glossary/magi` |
| `/medicare-advantage?state=california` | Query parameter (R4) | `/medicare-advantage/california` |
| `/cost/MRI_Scan` | Uppercase + underscore (R3) | `/cost/mri` |
| `/for/freelancers` (when `/for/self-employed` exists) | Cluster split (R5) | Use `/for/self-employed`; add "freelancer" synonym coverage to body |
| `/qa/does-medicare-cover-dental-care-services-in-2026` | Year-in-slug (R2); stop-word noise; over-long | `/qa/does-medicare-cover-dental` |
| `/bill/how-to-negotiate-with-the-hospital-billing-department` | Over-long; not entity-first | `/bill/how-to-negotiate-hospital-bills` |

---

## 7. Cross-references

- **Framework §4.1** — original URL stability rule with cluster representative reasoning
- **Framework §2.4** — cluster representative mechanic (LIKELY-grade) underpinning Rule 5
- **Framework §5.7** — state-as-subdirectory pattern confirmed in MA-state template
- **Framework §11.4** — maintenance protocol for year-marker updates without slug change
- **Audit §4.8** — daily blog audit findings: 16 year-in-slug grandfathered entries
- **Audit §3.3** — persona cluster representative consolidation decision
- **Bridge §3** — Jacob's empirical grounding-query data confirming state + program + topic fan-out shape
- **Bridge §10** — locked decision 5 (URL stability is absolute) and 6 (internal linking policy)
- **`LINK_TARGET_MANIFEST.md`** — companion doc listing which of these URLs are valid internal-link targets, organized by topic cluster

---

*This is the URL contract. Writer agents reference it directly. Validators enforce it. Reviewers gate on it. If a future framework revision adds new templates, they get added here with their pattern before any code ships.*
