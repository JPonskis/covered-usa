# CoveredUSA Bill Analyzer Article Track — Architecture Extension Plan

**Created:** 2026-05-12
**Goal:** Extend the existing daily SEO article pipeline so a subset of articles CTA to the Medical Bill Analyzer (`/medical-bill-analyzer`) instead of the eligibility screener, with no disruption to the existing screener-funnel articles.
**Working Directory:** `/Users/jacobposner/clawd/projects/covered-usa/` (and `/Users/jacobposner/clawd/` for cron job files and scripts)

---

## Overview

The existing pipeline writes 3 articles/run, 3 runs/day, all of which CTA to the screener. We want a second article track that CTAs to the bill analyzer instead. The minimum-touch approach mirrors the existing `Source` pattern: add a column to the sheet, propagate it through the selector, manager, agent, and React template, with a safe default (`screener`) so existing 255 Ready rows are unaffected.

The 56 medical-debt/pharma rows queued by `coveredusa-add-articles-batch2.js` are stranded today (Source column was never written, so the selector silently skips them). They are exactly the bill-analyzer audience by topic. Fixing those rows is the first batch of analyzer-track content; no new rows needed to start.

### Approach decision: same cron, not separate

Recommended: use the existing Stage 1 + Stage 2 crons unchanged. Just teach the selector to optionally bias the daily mix (e.g. 1 analyzer + 2 screener per run) and let Priority (col L) handle finer ordering. Separate crons add scheduling overhead and a parallel-pipeline failure surface for no real gain.

### Approach decision: explicit `Target` column, not auto-detect

Recommended: add column R `Target` with values `screener` / `analyzer` / `both`. Default blank = `screener` (preserves current 255 Ready rows). Explicit beats inferring from Program/keyword — articles tagged `Medical Debt` could legitimately go to either tool depending on the angle, and we want per-article control.

---

## Success Criteria

The extension is DONE when ALL of these are true:

- [ ] Column R `Target` exists in the `SEO Ideas` tab. Default blank treated as `screener` everywhere downstream.
- [ ] `coveredusa-select-articles.js` reads col R, passes it through, and does NOT regress on selection of existing Source-tagged rows.
- [ ] `coveredusa-seo-stage1.md` passes `TARGET: {Target}` into the article-writer agent prompt.
- [ ] `coveredusa-article-writer.md` agent emits `target: "<value>"` into the markdown frontmatter and uses analyzer-flavored CTA copy when Target=`analyzer`.
- [ ] `src/lib/blog.ts` `PostFrontmatter` reads the new field.
- [ ] `src/app/[locale]/blog/[slug]/page.tsx` renders the analyzer CTA card (different copy + `/medical-bill-analyzer` href + UTM) when `post.target === 'analyzer'`. Renders screener (current behavior) for `screener` or blank. Renders both stacked for `both`.
- [ ] `src/app/sitemap.ts` includes `/medical-bill-analyzer` in both locales.
- [ ] `src/lib/structured-data.ts` WebApplication schema either points at both tools or has a parallel entry for the analyzer.
- [ ] One published analyzer-track article exists on the live site, verified by WebFetch — CTA cards link to `/en/medical-bill-analyzer?utm_*`.
- [ ] The 56 stranded batch2 rows have `Source` backfilled to `AI` AND `Target` set to `analyzer`.
- [ ] No regression: pull any existing Written-status article URL, verify its CTAs still point to `/screener`.

---

## Pre-Execution Setup

Before starting ANY task:

1. Both repos confirmed clean against `origin/main`:
   - `cd /Users/jacobposner/clawd && git pull origin main`
   - `cd /Users/jacobposner/clawd/projects/covered-usa && git pull origin main`
2. Confirm Mac mini host (frankthebot) is reachable for cron testing — if not, plan for cron changes to land via git and be picked up by the next scheduled run automatically (ClaudeClaw reads the job markdown fresh each tick).
3. Read these reference files in full before touching anything:
   - `.claude/claudeclaw/jobs/coveredusa-seo-stage1.md`
   - `.claude/agents/coveredusa-article-writer.md`
   - `scripts/coveredusa-select-articles.js`
   - `projects/covered-usa/src/app/[locale]/blog/[slug]/page.tsx`
   - `projects/covered-usa/src/lib/blog.ts`

---

## Phase A — Sheet hygiene (do first, low-risk, unblocks everything)

### Task A1: Backfill Source + Type on the 56 stranded batch2 rows

- **Status:** todo
- **Difficulty:** Easy
- **Risk:** Low — operates on rows currently invisible to the selector

#### What to do

Write a one-shot script `scripts/coveredusa-fix-batch2-rows.js` that:
1. Reads `SEO Ideas!F2:Q307` from the sheet.
2. For every row in the range 252-307 (inclusive) where col F=`AI` AND col Q is blank:
   - Set col F (`Type`) to `informational`
   - Set col Q (`Source`) to `AI`
3. Use `spreadsheets.values.batchUpdate` to write both columns in one call per row range.
4. Print a diff (which rows changed) before applying. Add a `--dry-run` flag.

#### Verification

```bash
# Dry-run first
node scripts/coveredusa-fix-batch2-rows.js --dry-run
# Should report: "Would update 56 rows: F=informational, Q=AI for rows 252-307"

# Apply
node scripts/coveredusa-fix-batch2-rows.js

# Re-verify live
node -e "
const {google} = require('googleapis');
(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: '/Users/jacobposner/clawd/.secrets/google-service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU',
    range: 'SEO Ideas!Q252:Q307'
  });
  const blank = (r.data.values||[]).filter(v => !v[0]).length;
  console.log('Blank Source rows in 252-307 after fix:', blank);
})();
" # (run from /Users/jacobposner/clawd/projects/benefits-usa/ for the googleapis resolve)
```

#### Success criteria

- [ ] Zero rows in range 252-307 have blank Source after fix
- [ ] Re-running the existing selector now picks up these rows (test with `node scripts/coveredusa-select-articles.js 3` and confirm at least one CU-130..CU-185 row is in the output)

---

### Task A2: (Optional) Renumber duplicate IDs

- **Status:** todo (defer)
- **Difficulty:** Easy
- **Risk:** Low — selector keys on row, not ID

#### What to do

Skip for now. The duplicates don't affect pipeline behavior. Revisit when we add a future seeding script that needs unambiguous ID continuity, or when we add analytics keyed on ID.

If we do renumber later: assign CU-300+ to all row-222-through-307 entries (the second occurrences of CU-100..CU-185).

---

## Phase B — Add the Target column (the plumbing)

### Task B1: Add column R `Target` to the sheet

- **Status:** todo
- **Difficulty:** Easy
- **Risk:** Low — additive only

#### What to do

1. Open the sheet manually OR use a one-shot script to:
   - Set R1 = `Target`
   - Leave R2:R307 blank (default = `screener` semantics, handled downstream)
2. Document in `BILL_ANALYZER_ARTICLE_TRACK_PLAN.md` Notes section that the column is live.

#### Verification

```bash
node -e "
const {google} = require('googleapis');
(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: '/Users/jacobposner/clawd/.secrets/google-service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU',
    range: 'SEO Ideas!R1'
  });
  console.log('R1:', (r.data.values||[[]])[0][0]);
})();
"
# Expect: R1: Target
```

#### Success criteria

- [ ] Header R1 = `Target`
- [ ] No existing pipeline run breaks (Stage 1 next tick should still complete normally because the selector hasn't been updated yet and silently ignores col R)

---

### Task B2: Update `coveredusa-select-articles.js` to read and pass through Target

- **Status:** todo
- **Difficulty:** Easy
- **Risk:** Low — additive
- **Dependencies:** B1

#### What to do

1. Extend the lightweight pre-read to include col R alongside L, M, Q:
   ```js
   const [statusRes, priorityRes, sourceRes, targetRes] = await Promise.all([
     sheets.spreadsheets.values.get({spreadsheetId: SHEET_ID, range: 'SEO Ideas!M:M'}),
     sheets.spreadsheets.values.get({spreadsheetId: SHEET_ID, range: 'SEO Ideas!L:L'}),
     sheets.spreadsheets.values.get({spreadsheetId: SHEET_ID, range: 'SEO Ideas!Q:Q'}),
     sheets.spreadsheets.values.get({spreadsheetId: SHEET_ID, range: 'SEO Ideas!R:R'}),
   ]);
   ```
2. Extend the full-row batch-get to `A:R` instead of `A:Q`.
3. Extend `COLS` array to include `'Target'` as the 18th entry.
4. Decide quota: leave Source bucketing unchanged. Do NOT add Target bucketing yet — let Priority drive it.
5. Add Target normalization: if blank, treat as `screener` in the output JSON (`obj.Target = obj.Target || 'screener'`).

#### Verification

```bash
node scripts/coveredusa-select-articles.js 3 | jq '.selected[].Target'
# Expect: 3 values, all "screener" (since R is all blank right now)
```

#### Success criteria

- [ ] Selector output includes `Target` field for every selected row
- [ ] Blank Target normalized to `"screener"`
- [ ] Existing AI/Google bucket split still works (1 AI + 2 Google)
- [ ] No JSON shape break — Stage 1 job parses the output successfully (run `node scripts/coveredusa-select-articles.js 3 | jq '.selected | length'` → 3)

---

### Task B3: Update Stage 1 cron to pass TARGET to the agent

- **Status:** todo
- **Difficulty:** Easy
- **Risk:** Low — additive payload field
- **Dependencies:** B2

#### What to do

Edit `.claude/claudeclaw/jobs/coveredusa-seo-stage1.md`:
1. Line ~21 doc string: list `Target` in the payload field documentation.
2. Lines 54-71 agent spawn template: add `TARGET: {Target}` to the payload.

#### Verification

After deploying, wait for next Stage 1 tick OR trigger manually on the Mac mini. Inspect the resulting article markdown — frontmatter should now include `target: "screener"` (per the next task's agent update). Also check `claudeclaw` logs for the cron run.

#### Success criteria

- [ ] Cron job markdown contains `TARGET: {Target}` in the agent payload section
- [ ] Next live Stage 1 run completes without errors

---

### Task B4: Update article writer agent to handle Target

- **Status:** todo
- **Difficulty:** Medium
- **Risk:** Medium — touches the article output format
- **Dependencies:** B3

#### What to do

Edit `.claude/agents/coveredusa-article-writer.md`:

1. **Update inputs (line ~14)**: List TARGET alongside KEYWORD, TITLE, etc.

2. **Add to frontmatter spec (lines 36-45)**: Require the agent to emit
   ```yaml
   target: "screener"   # or "analyzer" or "both"
   ```
   Default to `"screener"` if TARGET input is blank.

3. **Replace internal-link guidance (lines 52-57)** with target-aware version:
   ```
   ### CTA and internal links
   The article must end with a CTA that matches the TARGET:

   - TARGET="screener" (or blank/default):
     - CTA line: "Check your eligibility now at CoveredUSA -- it takes 2 minutes."
     - Inline link target: /screener
     - Also link to /medicaid-income-limits (Medicaid articles), /medicare-eligibility (Medicare), /aca-income-limits (ACA)

   - TARGET="analyzer":
     - CTA line: "Upload your hospital bill to our free analyzer at CoveredUSA -- find errors and charity care options in 30 seconds."
     - Inline link target: /medical-bill-analyzer
     - Avoid /screener links inside the body (the React template will still render the screener card chrome if appropriate)

   - TARGET="both":
     - Include BOTH CTA lines, separated naturally. Primary link target is /medical-bill-analyzer.
   ```

4. **Fix the existing em-dash bug** at line 57 — current "CoveredUSA — it takes 2 minutes" violates the agent's own no-em-dash rule (line 68). Replace with "--" or rephrase.

5. **Keep the existing SOURCE branch (lines 59-65)** — Target and Source are orthogonal axes. An article can be Source=AI Target=analyzer.

#### Verification

Manually run the agent with a test payload TARGET=analyzer (use a throwaway sheet row OR test via direct prompt) and inspect:
- Frontmatter contains `target: "analyzer"`
- Body contains `/medical-bill-analyzer` link, NOT `/screener`
- CTA copy matches the analyzer variant

#### Success criteria

- [ ] Agent emits `target:` in frontmatter (verify by reading the next produced .md file)
- [ ] Agent uses correct CTA copy + link per Target value (manual review of 1 screener + 1 analyzer test)
- [ ] No em-dashes in generated articles (grep `content/blog/*.md` for `—`)

---

### Task B5: Extend `PostFrontmatter` and post loading

- **Status:** todo
- **Difficulty:** Easy
- **Risk:** Low — additive interface change
- **Dependencies:** B4 (so we have real frontmatter to test against)

#### What to do

Edit `projects/covered-usa/src/lib/blog.ts`:

1. Extend `PostFrontmatter` interface (lines 15-25):
   ```ts
   export type CTATarget = 'screener' | 'analyzer' | 'both';
   export interface PostFrontmatter {
     title: string;
     description: string;
     date: string;
     slug: string;
     keywords?: string[];
     image?: string;
     lastUpdated?: string;
     target?: CTATarget;   // NEW
   }
   ```

2. In `getPostBySlug` and `getAllPosts`, ensure `target` is read from `data.target` and exposed on the returned post. Default to `'screener'` if absent.

#### Verification

```bash
cd /Users/jacobposner/clawd/projects/covered-usa
npx tsc --noEmit
# Should pass with no errors
```

#### Success criteria

- [ ] TypeScript compiles
- [ ] `getAllPosts()` returns posts with `target` field present (default `'screener'` for legacy posts)

---

### Task B6: Branch the CTA cards in `blog/[slug]/page.tsx`

- **Status:** todo
- **Difficulty:** Medium
- **Risk:** Medium — visible site change, must verify both targets render correctly
- **Dependencies:** B5

#### What to do

Edit `projects/covered-usa/src/app/[locale]/blog/[slug]/page.tsx`:

1. Around line 60-69 (the `MID_CTA` dict): add analyzer variants.
   ```ts
   const MID_CTA = {
     screener: {
       en: { heading: '...', body: '...', button: 'Check Your Eligibility' },
       es: { ... },
     },
     analyzer: {
       en: { heading: 'Check Your Hospital Bill', body: 'Upload your bill — find errors and overcharges in 30 seconds. Free.', button: 'Analyze My Bill' },
       es: { ... },
     },
   };
   ```
   (Replace `—` with `--` if matching repo style.)

2. Around lines 244-265 (mid-article CTA card): branch on `post.target`. If `'analyzer'`, render the analyzer card with `href={`/${locale}/medical-bill-analyzer?utm_source=blog&utm_medium=mid-cta&utm_campaign=${slug}`}`. If `'both'`, decide: maybe show analyzer mid-card + screener end-card (or vice versa) for natural flow.

3. Around lines 282-302 (end-of-article CTA card): same branching pattern.

4. Add similar analyzer copy to the end-CTA dict.

5. Keep the 3+ H2 gate for the mid-card.

#### Verification

```bash
cd /Users/jacobposner/clawd/projects/covered-usa
npm run dev
# Visit a screener-target article (existing): CTAs → /en/screener
# Visit an analyzer-target article (test by adding target: "analyzer" to a local-only .md file): CTAs → /en/medical-bill-analyzer
```

Also run `npm run build` to confirm no SSR breakage.

#### Success criteria

- [ ] Existing screener articles: CTAs unchanged (verify on staging or dev)
- [ ] Analyzer-target article: both CTA cards link to `/en/medical-bill-analyzer` with UTMs
- [ ] No TypeScript or build errors
- [ ] Mobile responsive (both card variants render correctly on 375px width)

---

### Task B7: Add `/medical-bill-analyzer` to sitemap

- **Status:** todo
- **Difficulty:** Easy
- **Risk:** Low

#### What to do

Edit `projects/covered-usa/src/app/sitemap.ts`. Add an entry around line 50-58 (near the screener entry):
```ts
{
  url: 'https://coveredusa.org/en/medical-bill-analyzer',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.95,
},
{
  url: 'https://coveredusa.org/es/medical-bill-analyzer',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.95,
},
```

#### Verification

```bash
curl -s https://coveredusa.org/sitemap.xml | grep -c medical-bill-analyzer
# Expect: 2 (after next deploy)
```

#### Success criteria

- [ ] `/en/medical-bill-analyzer` and `/es/medical-bill-analyzer` present in sitemap.xml after deploy

---

### Task B8: Update structured data for the bill analyzer

- **Status:** todo
- **Difficulty:** Easy
- **Risk:** Low

#### What to do

Edit `projects/covered-usa/src/lib/structured-data.ts`. The current `WebApplication` schema at line 48 references `/screener`. Add a parallel WebApplication entry for `/medical-bill-analyzer`, OR convert the schema to an array with both tools. Include `applicationCategory: "HealthApplication"`, `offers: { price: "0" }`, and an `audience`.

(The analyzer page itself at `src/app/[locale]/medical-bill-analyzer/page.tsx` already has page-level SoftwareApplication + HowTo schemas per Investigator A. This task is for the site-level WebApplication schema only.)

#### Verification

```bash
curl -s https://coveredusa.org/en/ | grep -o 'WebApplication' | wc -l
# Expect: at least 2 (one per tool)
```

#### Success criteria

- [ ] Both tools represented in site-level structured data

---

## Phase C — Backfill the 56 stranded rows as analyzer-target

### Task C1: Mark CU-130 through CU-185 (second occurrences) as Target=analyzer

- **Status:** todo
- **Difficulty:** Easy
- **Risk:** Low (purely metadata; rows are still queued, just now tagged)
- **Dependencies:** A1, B1, B6 (don't tag until CTA routing actually works, otherwise they'd ship as screener-CTA when picked up)

#### What to do

After A1 (Source backfill) and B1-B6 (Target plumbing) are complete:

1. Write a one-shot `scripts/coveredusa-tag-batch2-analyzer.js`:
   - Read rows 252-307
   - For each, set col R = `analyzer`
2. Run with `--dry-run` first, then apply.

The 56 rows currently have topics: 501(r) charity care, medical debt statute of limitations, credit-score impact, itemized bill audit, No Surprises Act, charity care denial, debt collector violations, surprise billing, hospital FAP comparison, billing advocates, anesthesiology/radiology disputes, plus several pharma rows (Medicare Part D, GoodRx, biosimilars, etc.).

Decision points (TBD by Jacob):
- All 56 → `analyzer`? Or the pharma ones (CU-135 insulin, CU-137 PAPs, CU-153 tier exceptions, CU-154 SPAPs, CU-155 specialty meds, CU-156 340B, CU-157 biosimilars, CU-158 Part D denial, CU-160 GoodRx vs CostPlus, CU-161 generics, CU-181 GoodRx + Medicare, CU-185 Canadian pharmacies) → `screener` since they're more eligibility-adjacent?
- Or set Target=`both` on the dual-fit ones?

Default recommendation: tag the medical-debt cluster (~40 rows) `analyzer`. Tag the pharma cluster `screener`. Tag boundary cases (e.g. "Lost Your Job? COBRA vs ACA" CU-163) `screener`.

#### Verification

```bash
node -e "/* sheet read script to count R=analyzer */"
# Expect: ~40 rows with R=analyzer after tagging
```

#### Success criteria

- [ ] Targeted rows have R column populated correctly
- [ ] At least one analyzer-target row gets selected on the next Stage 1 tick (verify by inspecting the generated `.md` file's frontmatter)

---

## Phase D — Verify end-to-end

### Task D1: First live analyzer-target article ships

- **Status:** todo
- **Difficulty:** Easy (just monitor)
- **Risk:** Low
- **Dependencies:** all of A, B, C

#### What to do

After C1 lands, wait for the next Stage 1 tick (or trigger manually on Mac mini). One of the selected articles should be Target=analyzer. After Stage 2 deploys it:

1. Read the published `.md` file. Verify frontmatter has `target: "analyzer"`.
2. WebFetch the live URL. Verify both CTA cards link to `/en/medical-bill-analyzer?utm_source=blog&...`.
3. Check Bing IndexNow logs (or coveredusa.org/api/indexnow audit) for the URL submission.
4. Verify the screener track still works: pull any same-day Target=screener article from the live site and confirm its CTAs still point to `/screener`.

#### Verification

```bash
# Find the most recent analyzer article
grep -l 'target: "analyzer"' /Users/jacobposner/clawd/projects/covered-usa/content/blog/*.md | head -1

# Fetch the live page and check the CTA hrefs
curl -s https://coveredusa.org/en/blog/<slug> | grep -o '/en/medical-bill-analyzer[^"]*' | head -2
```

#### Success criteria

- [ ] One published article with `target: "analyzer"` exists
- [ ] Both CTA cards on the live page link to `/medical-bill-analyzer`
- [ ] UTMs are present and correct
- [ ] An existing screener article on the same day still has `/screener` CTAs (no regression)

---

## Execution Order

```
Phase A:  A1 (sheet hygiene)
Phase B:  B1 → B2 → B3 → B4 → B5 → B6  (must be sequential; each builds on prior)
          B7, B8 can run in parallel with B-chain
Phase C:  C1 (after A1, B1-B6 complete)
Phase D:  D1 (after C1, gated on next live cron tick)
```

Estimated time: 4-6 hours of focused work spread over 1-2 days, plus 6 hours of cron-tick wait time for end-to-end verification.

---

## Open Questions for Jacob

1. **Mix policy in the selector**: leave Source-only bucketing (1 AI + 2 Google per run, Target ignored in selection), or enforce a Target quota too (e.g. "at least 1 analyzer/day")? Default recommendation: Source-only for now, revisit after we see the first 5-10 analyzer articles ship.

2. **`both` rendering**: when Target=`both`, should we show analyzer mid-card + screener end-card? Or a single stacked card with both CTAs? Default recommendation: analyzer mid + screener end, in that order (matches the natural reader flow — "I have a bill" → "While you're here, check your benefits").

3. **Tagging the pharma cluster**: tag as `screener`, `analyzer`, or `both`? Default recommendation: `screener` for pharma (they're eligibility-adjacent — Medicare Part D, Extra Help, etc.). Confirm before C1.

4. **Stale ID cleanup (Task A2)**: defer indefinitely or do as part of this batch? Default recommendation: defer.

5. **GitHub token in covered-usa git remote URL**: not part of this plan but worth flagging — there's a PAT embedded in `origin` for `covered-usa`. If you ever share screen recordings or paste git config publicly, scrub it.

---

## Notes Section

_(Workers fill this in as tasks complete)_

### A1: ___
### B1: ___
### B2: ___
### B3: ___
### B4: ___
### B5: ___
### B6: ___
### B7: ___
### B8: ___
### C1: ___
### D1: ___
