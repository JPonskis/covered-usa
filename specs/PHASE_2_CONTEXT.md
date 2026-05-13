# CoveredUSA Programmatic SEO — Phase 2 Context

**Purpose:** This doc bridges the compaction so the next agent can pick up Phase 2 work without re-deriving context. Read this first.

**Status as of 2026-05-12:** Phase 1 complete. 8 live programmatic pages across 7 template types. Ready for Phase 2 templatization.

---

## TL;DR — Where you're picking up

We're building **~2,500 programmatic pages** for CoveredUSA (coveredusa.org) optimized for Bing + AI search (ChatGPT, Perplexity, Copilot, Gemini), NOT Google.

- **Phase 1 (DONE):** Build one sample page for each of the 7 template types to prove the format and component library. ✅
- **Phase 2 (NEXT):** Templatize the high-volume tracks (procedure cost + drug, then optionally Q&A + glossary) so agents can mass-populate JSON data files. Then deploy agents in parallel — same model as the existing blog cron (5+5/day).
- **Phase 3:** Mass populate via agents. Hand-fill the lower-volume templates using samples as blueprints.

Jacob's explicit guidance for Phase 2 data acquisition: **"Use the same approach as the daily blog cron — deploy agents to do it."** Concretely: agents read a content idea, do deep research, output a JSON data file at `content/data/[type]/[slug].json` instead of a markdown blog post.

---

## The 8 live samples (Phase 1 outputs)

All on production at https://coveredusa.org. All bilingual (EN + ES). All using the proven blog article format with brand colors, locked-in CTAs, and AI-optimization schema.

| # | Template | URL | File path | Funnel | What it proves |
|---|---|---|---|---|---|
| 1 | Hub (existing, retrofitted) | `/en/medicaid-income-limits` | `src/app/[locale]/medicaid-income-limits/page.tsx` | Screener | BenefitsUSA-style hardcoded data hub pattern with brand teal + new components |
| 2 | Hub (new) | `/en/federal-poverty-level` | `src/app/[locale]/federal-poverty-level/page.tsx` | Screener | Same hub pattern, fresh page |
| 3 | Procedure cost | `/en/cost/mri` | `src/app/[locale]/cost/mri/page.tsx` | Analyzer | Blog article format, site-of-service pricing, HCPCS J-codes, billing errors |
| 4 | Glossary | `/en/out-of-pocket-maximum` | `src/app/[locale]/out-of-pocket-maximum/page.tsx` | Screener | Definitional page with `DefinedTerm` schema |
| 5 | Comparison | *(format proven, deleted dupe — see "Dedup notes")* | n/a | Screener | Side-by-side option cards, decision-guide structure |
| 6 | Trigger event | `/en/just-lost-job-health-insurance` | `src/app/[locale]/just-lost-job-health-insurance/page.tsx` | Screener | Urgency callout, `HowTo`+`HowToStep` schema, options comparison |
| 7 | Q&A | `/en/does-medicare-cover-dental` | `src/app/[locale]/does-medicare-cover-dental/page.tsx` | Screener | Big "Short answer:" subheadline, `QAPage` schema, alternatives table |
| 8 | Drug | `/en/drug/insulin-cost` | `src/app/[locale]/drug/insulin-cost/page.tsx` | Analyzer | Inpatient markup angle, `Drug` schema, PAP table, J-codes |
| 9 | Persona | `/en/health-insurance-for-gig-workers` | `src/app/[locale]/health-insurance-for-gig-workers/page.tsx` | Screener | Audience-targeted, options + traps + self-employed tax deduction |

---

## Architecture (what's already built)

### Reference component library — `src/components/reference/`

Used by every sample page. Mirror of BenefitsUSA's pattern.

| Component | Purpose |
|---|---|
| `ReferenceTable.tsx` | Data tables with optional yes/no status cells (checkmark/X icons). **Critical fix in place: inline styles override `.article-content table` cascade from globals.css to prevent 2rem top margin + th background override.** Do NOT remove those inline styles. |
| `FAQSection.tsx` | FAQ cards + optional auto-emit of FAQPage schema |
| `LastUpdated.tsx` | Date stamp + source line (AI freshness signal) |
| `DatasetSchema.tsx` | Emits Schema.org Dataset JSON-LD |
| `ScreenerCTA.tsx` | Variant prop: `'hub'` (full-width teal banner) or `'inline'` (cream bg, teal border, flex layout). Default `'hub'`. **Locked-in copy in defaults — do not override per-page unless you have a strong reason.** |
| `AnalyzerCTA.tsx` | Same variant prop. **Locked-in copy in defaults.** |
| `QuickAnswer.tsx` | AI-snippet target block (teal bg, "Quick Answer" eyebrow, `data-speakable`). Wrap in `max-w-3xl` when used inside the hero. |
| `PullQuote.tsx` | Magazine-style citeable aside. Italic, amber quotation glyph. Use sparingly. |
| `index.ts` | Barrel export. |

### Schema helpers — `src/lib/structured-data.ts`

| Helper | Schema type | Used for |
|---|---|---|
| `getFAQSchema(faqs)` | `FAQPage` | All pages with multiple Q&As |
| `getBreadcrumbSchema(items)` | `BreadcrumbList` | All pages |
| `getSpeakableSchema(url, selectors)` | `WebPage`+`SpeakableSpecification` | Optional |
| `getWebApplicationSchema()` | Array of 2 `WebApplication` | Screener + analyzer (page-level on tool pages) |
| `getHowToSchema(locale)` | `HowTo` | Existing hardcoded for screener. Trigger event pages inline their own HowTo. |
| `getMedicalOrganizationSchema()` | `Organization` | Site-wide |
| **`getMedicalWebPageSchema(props)`** | `MedicalWebPage` | **Every programmatic page** — adds `lastReviewed`, `reviewedBy`, `audience`, `medicalSpecialty`, `about`. AI engines weight this higher than generic `Article`. |
| **`getMedicalProcedureSchema(props)`** | `MedicalProcedure` | Procedure cost pages. HCPCS only (never CPT). Nests `priceSpecification` for AI quote-ready cost range. |
| **`getDefinedTermSchema(props)`** | `DefinedTerm` | Glossary pages. Includes `inDefinedTermSet` linking to a future `/glossary` index. |
| **`getQAPageSchema(props)`** | `QAPage` | Single-question Q&A pages. Used IN ADDITION to FAQPage (QAPage = the main page question; FAQPage = secondary FAQs). |
| **`getDrugSchema(props)`** | `Drug` | Drug pages. `drugClass`, `nonProprietaryName`, brand `alternateName`, HCPCS J-codes (public domain). |

### Sitemap — `src/app/sitemap.ts`

Hand-maintained `localizedEntry(...)` calls. Phase 2 needs to extend this to auto-loop over `content/data/procedures/*.json` and `content/data/drugs/*.json`.

### IndexNow — `scripts/coveredusa-indexnow-submit.js`

Currently auto-detects today's blog posts via `--today`. Phase 2 needs to extend this to detect new programmatic JSON files too — probably add `--new-programmatic` and `--all-programmatic` flags.

### Blog cron (the pattern Phase 2 will mirror)

Two ClaudeClaw jobs in `.claude/claudeclaw/jobs/`:
- `coveredusa-seo-stage1.md` — 6am PDT daily. Picks 5 screener + 5 analyzer articles from Google Sheet, spawns 10 `coveredusa-article-writer` agents in parallel, each writes a markdown file to `content/blog/`, manager updates sheet.
- `coveredusa-seo-stage2.md` — 7am PDT daily. Git commits + pushes + waits 60s + submits new URLs to IndexNow.

Phase 2 will create analogous flows for `content/data/procedures/` and `content/data/drugs/` JSON files. Probably with `coveredusa-procedure-writer` and `coveredusa-drug-writer` agents instead of `coveredusa-article-writer`.

---

## Brand + design constraints (don't break these)

### Color palette

Defined in `src/app/globals.css` `:root`:
- `--teal: #0d9488` (primary brand color, CTAs)
- `--teal-dark: #0f766e` (text on white, links)
- `--primary-deeper: #134e4a` (table header bg)
- `--primary-lightest: #ccfbf1` (eyebrow tag bg for screener-funnel pages)
- `--accent: #c2732a` (warm amber — used on analyzer-funnel page borders and amber-dot bullets in option cards)
- `--accent-lightest: #fef3c7` (amber tag bg for procedure-cost pages, urgency callouts)
- `--cream: #FDF8F3` (CTA card background)
- `--warm-white: #FFFCF9` (page background)
- `--text-primary: #1C1A16`, `--text-secondary: #44403c`, `--text-muted: #78716c`
- `--border: #d6cfc5`

### Typography

`--font-display`: Fraunces (serif)
`--font-body`: Source Serif 4 (serif)
Both serif. Headings auto-pick up Fraunces via global `h1, h2, h3, ...` rule.

### CTA copy (LOCKED — do not change without explicit Jacob approval)

**Analyzer:**
- Heading: "Lower your hospital bill. Or get it forgiven."
- Body: "Free in 30 seconds. We check every charge for errors and overcharges, see if you qualify for free care at your hospital, and write a custom dispute letter ready to send. Most patients save hundreds."
- Button: "Lower my bill — free"

**Screener:**
- Heading: "You may qualify for free health insurance."
- Body: "Our 2-minute screener checks Medicaid, ACA, Medicare, CHIP, and more. Most uninsured Americans qualify for $0/month coverage they didn't know about."
- Button: "Check what I qualify for — free"

Defaults baked into both component files. Override props exist but should NOT be used unless there's a specific reason. The blog template (`src/app/[locale]/blog/[slug]/page.tsx`) has the same copy in its `CTA_COPY` dict.

### Writing rules (CLAUDE.md humanizer)

- **No em dashes** (—) in body content. Use periods, commas, or colons. Em dashes are allowed in CTA button text only (e.g., "Lower my bill — free") as a stylistic UI element.
- No filler ("It's important to note", "In today's world", "Great question")
- No corporate verbs
- Specific dollar amounts and percentages
- "As of 2026" markers throughout (AI freshness signal)
- Healthcare-specific language: "coverage", "enroll", "qualify", "plan"
- Reference coveredusa.org, NOT benefitsusa.org

### Schema requirements per programmatic page

Every Phase 2 page MUST emit:
1. `MedicalWebPage` with `lastReviewed` (today's date in YYYY-MM-DD)
2. `BreadcrumbList`
3. `FAQPage` (4-8 Q&As)
4. Plus the template-specific schema (`MedicalProcedure` / `Drug` / `DefinedTerm` / `QAPage`)
5. Optional but recommended: `Dataset` for tabular pages

---

## Phase 2 plan (engineering + content)

### Order of operations

1. **Procedure cost templatization (2-3 days)**
   - Extract `/cost/mri` content into `content/data/procedures/mri.json`
   - Convert `src/app/[locale]/cost/mri/page.tsx` into `src/app/[locale]/cost/[procedure]/page.tsx` dynamic route reading the JSON
   - Build `src/lib/procedures.ts` loader (mirrors `src/lib/blog.ts` — `getAllProcedures`, `getProcedureBySlug`, `getAllProcedureSlugs`)
   - Extend sitemap.ts to loop over `content/data/procedures/*.json`
   - Extend IndexNow script with `--new-procedures` and `--all-procedures` flags
   - Ship 2-3 more procedure JSONs as validation (e.g., urgent-care, colonoscopy, er-visit)

2. **Drug templatization (1-2 days)** — same pattern at `content/data/drugs/` + `[drug]` route

3. **Q&A and glossary templatization (1-2 days each, OPTIONAL)** — only if scaling them feels worth the engineering. Hand-curating 50-100 Q&A pages might be fine without templates.

4. **Build content pipeline:** `src/lib/content.ts` as a unified loader (blog markdown + JSON data files). Probably worth this since both procedures and drugs need similar JSON loaders.

5. **Build agent for data acquisition:** `coveredusa-procedure-writer` (and `coveredusa-drug-writer`) modeled after the existing `coveredusa-article-writer` agent at `.claude/agents/coveredusa-article-writer.md`. Reads a content idea, does WebSearch research, outputs a JSON data file instead of markdown.

6. **Build cron job:** `coveredusa-seo-stage1-procedures.md` (or extend existing stage1 with a procedure track). Picks N procedure ideas from a sheet, spawns N agents in parallel, agents write JSON files, manager commits + pushes.

### Data acquisition — what each agent does

Per Jacob's directive ("use the same approach as the daily blog cron — deploy agents"), each procedure writer agent should:

1. Receive a procedure slug + research seed from the manager (e.g., "mri", with hint "imaging procedure, 200K/mo searches")
2. WebSearch CMS Physician Fee Schedule 2026 for the procedure's Medicare rate
3. WebSearch FAIR Health Consumer or similar for retail/cash price ranges
4. WebSearch for site-of-service spread (independent vs hospital outpatient)
5. WebSearch for body-part variations and contrast pricing if applicable
6. Identify HCPCS codes (J-codes if drug, otherwise HCPCS Level II if available, or skip codes if only CPT exists — never use CPT)
7. Generate 5-8 FAQ Q&A pairs targeting top long-tail queries for this procedure
8. Write a JSON file at `content/data/procedures/[slug].json` following the schema defined by the `/cost/[procedure]` template
9. Return slug + status to manager

Same shape for drug writer (insulin-cost.json is the existing reference).

### JSON data file shape — `content/data/procedures/[slug].json`

Based on the `/cost/mri` content. Template details in `specs/templates/procedure-cost.md`. Key fields:

```json
{
  "slug": "mri",
  "procedure": "MRI",
  "fullName": "Magnetic Resonance Imaging (MRI)",
  "category": "imaging",
  "primaryQuery": "MRI cost without insurance",
  "title": "...",
  "description": "...",
  "h1": "...",
  "subhead": "...",
  "quickAnswer": "...",
  "lastUpdated": "2026-05-12",
  "cta": "analyzer",
  "pricing": {
    "medicarePfsRate": 475,
    "medicareOppsRate": 720,
    "nationalLow": 400,
    "nationalHigh": 3500,
    "nationalMedian": 1325
  },
  "byFacilityType": [...],
  "byBodyPart": [...],
  "hcpcsCodes": ["73721"],
  "factorsAffectingCost": [...],
  "billingErrorsToCheck": [...],
  "faqs": [{ "q": "...", "a": "..." }, ...],
  "sources": [{ "name": "...", "url": "..." }, ...]
}
```

Drug data file shape (see `/drug/insulin-cost` for reference):

```json
{
  "slug": "insulin-cost",
  "drugName": "Insulin",
  "nonProprietaryName": "...",
  "brandNames": ["Humalog", "Novolog", "..."],
  "drugClass": "...",
  "primaryQuery": "Insulin inpatient cost",
  "title": "...",
  "h1": "...",
  "quickAnswer": "...",
  "pricing": {
    "medicareAspPerUnit": 12,
    "retailLow": 25, "retailHigh": 300,
    "inpatientLow": 200, "inpatientHigh": 500,
    "medicarePartDCap": 35
  },
  "hcpcsJCodes": ["J1815", "J1817"],
  "patientAssistancePrograms": [...],
  "billingErrorsToCheck": [...],
  "faqs": [...],
  "sources": [...]
}
```

### Validation per page

Each new procedure/drug JSON should produce a page that:
- Returns 200 on EN + ES URLs
- Renders all required schemas (`MedicalWebPage` + `MedicalProcedure`/`Drug` + `FAQPage` + `BreadcrumbList` + `Dataset`)
- Uses the locked-in CTA copy (no per-page overrides)
- Contains "as of 2026" markers
- Has 4-8 specific factual FAQs
- Sources cited

---

## Dedup workflow (don't ship duplicates)

Before building ANY new programmatic page, grep `content/blog/` for related slugs:

```bash
ls /Users/jacobposner/clawd/projects/covered-usa/content/blog/*.md | xargs basename | grep -i "<keyword>"
```

**Examples of conflicts caught during Phase 1:**
- `/medicaid-vs-medicare` programmatic page — DELETED because two blog posts already covered the topic (`medicaid-vs-medicare-difference-2026.md` + `medicare-vs-medicaid-difference.md`)

**Existing blog slugs to be aware of** (as of 2026-05-12, snapshot):

```
aca-health-insurance-eligibility-2026
aca-income-limits-2026
aca-open-enrollment-dates-2026
aca-subsidy-amounts-by-income-2026
aca-subsidy-calculator-2026
aca-subsidy-cliff-2026
do-i-qualify-for-medicaid-2026
federal-poverty-level-2026-guidelines  (← also have /federal-poverty-level programmatic; intentional duplication on canonical FPL topic)
free-health-insurance-low-income-2026
health-insurance-if-you-cant-afford-it
hospital-charity-care-501r-forgiveness
how-medical-debt-affects-credit-score-2026
how-to-audit-itemized-hospital-bill
how-to-negotiate-hospital-bills
kicked-off-medicaid-what-to-do
medicaid-if-self-employed
medicaid-vs-marketplace-insurance
medicaid-vs-medicare-difference-2026
medical-bill-cant-pay-options
medicare-eligibility-age-requirements-2026
medicare-part-b-cost-2026
medicare-savings-programs-2026
medicare-vs-medicaid-difference
obamacare-income-limits-2026
statute-of-limitations-medical-debt-by-state
what-is-medicare-savings-program
```

**Jacob's policy: "no redirects ever."** If a blog already covers a topic, do NOT ship a competing programmatic page. Pick a different topic.

---

## Gotchas + workflow notes

### Vercel edge cache lag

After `git push`, Vercel deploys but the edge cache for previously-fetched URLs can serve STALE HTML for 1-5 minutes per region. Polling pattern:

```bash
until curl -s "https://coveredusa.org/<new-content-signature>" | grep -q "<unique-new-string>"; do sleep 10; done
```

Use a unique-to-the-fix string (not just "200 status") so the poll exits only when the actual content has propagated.

### Git push needs rebase sometimes

Other sessions/people push to this repo (BillAnalyzer WIP, scroll fixes, cron jobs). Frequent pattern:

```bash
git push  # rejected: non-fast-forward
git stash -u  # stash build artifacts
git pull --rebase origin main
git push
git stash pop
```

### CWD drift

Long-running shells drift back to `/Users/jacobposner/clawd`. Always check pwd or use absolute paths. `npm run build` from the wrong dir fails with "Missing script: build". Fix: `cd /Users/jacobposner/clawd/projects/covered-usa && npm run build`.

### tsconfig + next-env build artifacts

`tsconfig.tsbuildinfo` and `next-env.d.ts` get modified by every build. Never commit these. Git will show them as modified after every build but they should stay unstaged. Sometimes a `.syncthing.tsconfig.tsbuildinfo.tmp` sync conflict file appears — also ignore.

### BillAnalyzer WIP from another session

`src/components/BillAnalyzer.tsx` and `src/app/api/bill-analyzer-lead/route.ts` have WIP changes that periodically appear and disappear due to sync events. DO NOT touch those files. DO NOT include them in your commits. Stage only your specific Sprint files by name.

### The article-content cascade gotcha

`globals.css` has rules like `.article-content table { margin: 2rem 0; border: 1px solid; ... }` and `.article-content th { background: var(--primary); }`. When `<ReferenceTable>` renders inside `<div className="article-content">`, the inner table picks up these rules and breaks the design.

**Already fixed in `ReferenceTable.tsx` via inline styles** — but if you add a new component that renders tables inside article-content, you need to escape this cascade the same way. Inline styles win.

---

## Open strategic decisions (deferred from Sprint 1)

1. **Hospital pages (Tier 2 from research)** — `/hospital/[slug]`, ~500-3,000 pages. Requires multi-source data acquisition: CMS Hospital General Information dataset + IRS 990 Schedule H for charity care + ProPublica for lawsuit data. 2-4 week project for ingestion + template + first batch. Big SEO upside (charity-care data nobody has consolidated). Decision NOT yet made.

2. **Billing code library** — REJECTED earlier due to AMA CPT licensing risk. Could revisit with HCPCS-only scope (J-codes are public domain). Maybe 100-200 J-code pages tied to drug + procedure pages. Decision pending.

3. **Spanish translation strategy** — All Phase 1 samples are bilingual. Continue this pattern for Phase 2. Blog has uneven Spanish coverage; not urgent to address.

4. **Annual refresh process** — Every January, "2026" content needs to become "2027". FPL changes, Medicare premiums update, IRMAA brackets shift. Could be a single script that finds + replaces year refs and key dollar amounts across all data files. Decision deferred to Q4 2026.

5. **Retrofit `/aca-income-limits` and `/medicare-eligibility`** — still using inline-styled blue/navy palette (drift from brand). Same fix as `/medicaid-income-limits`. Low priority but worth doing for visual consistency.

6. **Idea harvester cron** — greenlit Sprint 1, deferred. Pull questions from Reddit r/HealthInsurance, r/medicalbills, AlsoAsked, Search Console. Auto-append to sheet. Replenishes both blog and programmatic queues. ~1-2 day build.

---

## Reference docs (existing specs you should know about)

| Doc | What's in it |
|---|---|
| `specs/TEMPLATE_SYSTEM_SPEC.md` | Master template system spec (~228 lines). Shared standards. |
| `specs/sprint-1-plan.md` | Original Sprint 1 plan |
| `specs/sprint-1-completion.md` | Sprint 1 completion report with verification evidence |
| `specs/templates/hub.md` | Hub template spec |
| `specs/templates/procedure-cost.md` | Procedure cost template spec — **USE THIS as JSON shape reference** |
| `specs/templates/drug.md` | Drug template spec — same |
| `specs/templates/glossary.md`, `comparison.md`, `trigger-event.md`, `persona.md`, `q-and-a.md` | One per template type |
| `research/digest-programmatic-seo-2026-05-12.md` | Synthesis of the Gemini deep research + critical analysis. Top-15 priority pages list. |
| `research/deep-research-programmatic-seo-2026-05-12.pdf` | Original deep research PDF |
| `PROGRAMMATIC_SEO_ARCHITECTURE.md` (at project root) | Architecture scoping doc, mostly superseded by the spec files but useful for context |

---

## Project paths cheat sheet

```
/Users/jacobposner/clawd/projects/covered-usa/        ← live deploy repo (origin: github.com/JPonskis/covered-usa)
├── content/
│   ├── blog/                                          ← existing blog markdown (en) + content/blog/es/
│   └── data/                                          ← NEW directory (will be created in Phase 2)
│       ├── procedures/                                ← procedure JSON files (Phase 2)
│       ├── drugs/                                     ← drug JSON files (Phase 2)
│       ├── glossary/                                  ← optional (Phase 2)
│       └── qa/                                        ← optional (Phase 2)
├── specs/                                             ← all template specs + Sprint plans + THIS DOC
├── src/
│   ├── app/
│   │   ├── [locale]/                                  ← all locale-prefixed pages
│   │   │   ├── (landing)/                             ← homepage
│   │   │   ├── blog/[slug]/page.tsx                   ← blog template (has CTA_COPY dict)
│   │   │   ├── medicaid-income-limits/page.tsx        ← hub sample #1
│   │   │   ├── federal-poverty-level/page.tsx         ← hub sample #2
│   │   │   ├── out-of-pocket-maximum/page.tsx         ← glossary sample
│   │   │   ├── just-lost-job-health-insurance/...     ← trigger event sample
│   │   │   ├── does-medicare-cover-dental/...         ← Q&A sample
│   │   │   ├── health-insurance-for-gig-workers/...   ← persona sample
│   │   │   ├── cost/mri/page.tsx                      ← procedure cost sample (will become [procedure]/page.tsx)
│   │   │   ├── drug/insulin-cost/page.tsx             ← drug sample (will become [drug]/page.tsx)
│   │   │   ├── screener/                              ← eligibility screener tool
│   │   │   └── medical-bill-analyzer/                 ← bill analyzer tool
│   │   ├── api/                                       ← API routes (analyze-bill, screen, etc.)
│   │   ├── globals.css                                ← brand palette, article-content typography, .warm-texture
│   │   └── sitemap.ts                                 ← sitemap (extend for procedures/drugs in Phase 2)
│   ├── components/
│   │   ├── reference/                                 ← THE shared component library (Phase 1 output)
│   │   ├── BillAnalyzer.tsx                           ← DO NOT TOUCH (WIP from another session)
│   │   ├── BlogDropCap.tsx                            ← client component for blog/programmatic drop caps
│   │   └── ...
│   └── lib/
│       ├── blog.ts                                    ← blog markdown loader (mirror this for procedures/drugs)
│       ├── structured-data.ts                         ← all schema helpers
│       └── ...
├── scripts/                                           ← NOTE: scripts/coveredusa-indexnow-submit.js
└── package.json
```

Cron jobs live one level up: `/Users/jacobposner/clawd/.claude/claudeclaw/jobs/coveredusa-seo-stage1.md` and `stage2.md`.

Agent definitions: `/Users/jacobposner/clawd/.claude/agents/coveredusa-article-writer.md`.

---

## Verification gates for new pages (apply to every Phase 2 page)

Before declaring a new procedure/drug/glossary/q&a page "done":

```bash
# 1. TypeScript clean
cd /Users/jacobposner/clawd/projects/covered-usa && npm run build 2>&1 | grep -E "(error|⨯|Compiled)" | head -3

# 2. Schemas present in pre-rendered HTML
grep -oE "(MedicalWebPage|FAQPage|BreadcrumbList|MedicalProcedure|Drug|DefinedTerm|QAPage|Dataset)" \
  .next/server/app/en/<path>.html | sort -u

# 3. Brand colors used (not old blue/navy drift)
grep -oE "(0d9488|0f766e|ccfbf1|c2732a|fef3c7)" .next/server/app/en/<path>.html | sort -u

# 4. Old palette ABSENT
grep -oE "(1d4ed8|1e3a5f|3b82f6)" .next/server/app/en/<path>.html | sort -u
# (should be empty)

# 5. Em dashes in body (should be 0 or 1 — the CTA button text only)
grep -c "—" .next/server/app/en/<path>.html

# 6. Locked-in CTA copy
grep -oE "(You may qualify for free health insurance|Lower your hospital bill\\. Or get it forgiven)" \
  .next/server/app/en/<path>.html

# 7. Deploy + wait for cache
git push origin main
until curl -s "https://coveredusa.org/en/<path>" | grep -q "<unique-new-string>"; do sleep 10; done

# 8. Final status check
curl -s -o /dev/null -w "EN: %{http_code}\n" "https://coveredusa.org/en/<path>"
curl -s -o /dev/null -w "ES: %{http_code}\n" "https://coveredusa.org/es/<path>"
```

---

## What "done" looks like at end of Phase 2

- Procedure cost: dynamic route + 50-100 JSON files + agent-driven population working
- Drug pages: dynamic route + 100+ JSON files
- Optionally Q&A + glossary templatized
- Total live programmatic inventory: ~200-500 pages
- Cron jobs producing 10-20 new programmatic pages per day on autopilot

End state of the whole project (Phase 1 + 2 + 3 + 4 over 4-8 weeks): **~2,500 programmatic pages**.

---

## Quick orientation for the fresh agent

1. Read this doc fully
2. Skim `specs/templates/procedure-cost.md` and `specs/templates/drug.md` for JSON shape details
3. Look at `src/app/[locale]/cost/mri/page.tsx` — this is the source you'll templatize first
4. Look at `src/lib/blog.ts` — the loader pattern you'll mirror for `src/lib/procedures.ts`
5. Look at `.claude/agents/coveredusa-article-writer.md` and `.claude/claudeclaw/jobs/coveredusa-seo-stage1.md` — the cron + agent pattern you'll mirror

Start Phase 2 with **procedure cost templatization**. That's the highest leverage. Drug pages second. Q&A and glossary templating only if you decide they're worth the engineering.

Good luck. The samples work, the patterns are proven, the components are battle-tested. Phase 2 is mostly engineering + agent prompts.
