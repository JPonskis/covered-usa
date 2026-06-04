#!/usr/bin/env node
// CoveredUSA Drip Publish — Phase 1 of the bulk-production pipeline.
//
// ARCHITECTURE (staging-branch flow, since 2026-05-15):
//   1. Bulk producers write JSON files to the `drip-queue` git branch (NOT
//      main). Vercel auto-deploys main only, so files on drip-queue stay
//      hidden. This branch is the queue.
//   2. Producers mark Master Backlog rows Status=Ready in the Google Sheet
//      once their JSON is on drip-queue.
//   3. This cron (daily 02:00 UTC) reads Status=Ready rows, sorts by
//      priority + demand, picks up to MAX_PER_DAY, then for each one runs
//      `git checkout origin/drip-queue -- <path>` to promote that file
//      from drip-queue into main's working tree, then commits + pushes
//      main → Vercel deploys those N pages.
//   4. Cron sleeps for Vercel, submits the URLs to IndexNow (Bing/Yandex),
//      then stamps Master Backlog with Status=Published / PublishedDate /
//      PublishedURL. If a row had a sheet_row_id back-ref to SEO Ideas, it
//      appends a note to that source row.
//
// Backwards-compatible: if drip-queue doesn't exist on origin (legacy state
// or first run), the cron falls back to "main-only" mode and just publishes
// files already present on main. This is what happens for content the
// human pushes directly to main as a one-off.
//
// PURE PUBLISHER — no writing, no AI calls, no JSON generation. Pages must
// exist either on `drip-queue` (preferred) or already on main.
//
// Usage:
//   node scripts/coveredusa-drip-publish.js              # ship up to MAX_PER_DAY
//   node scripts/coveredusa-drip-publish.js --dry-run    # show what would ship; no writes
//   node scripts/coveredusa-drip-publish.js --limit=5    # cap to 5 for testing
//   node scripts/coveredusa-drip-publish.js --dry-run --limit=3
//
// Cron: daily at 02:00 UTC via .claude/claudeclaw/jobs/coveredusa-drip-publish.md

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ────────────────────────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────────────────────────
const MAX_PER_DAY = 15;
const SHEET_ID = '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU';
const MASTER_TAB = 'Master Backlog';
const SEO_IDEAS_TAB = 'SEO Ideas';
const HOST = 'coveredusa.org';
const INDEXNOW_KEY = '32f9a841f2ea4b809f1a21a529c1e6f6';
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
];
const VERCEL_DEPLOY_WAIT_MS = 60_000;

// Resolve the repo root from this script's location so it works on both
// /Users/jacobposner/clawd (MacBook) and /Users/frankthebot/clawd (Mac mini).
const REPO_ROOT = path.resolve(__dirname, '..');
const CONTENT_DATA = path.join(REPO_ROOT, 'content', 'data');

// Service-account key + googleapis: try Mac mini first, fall back to MacBook.
const SA_CANDIDATES = [
  '/Users/frankthebot/clawd/.secrets/google-service-account.json',
  '/Users/jacobposner/clawd/.secrets/google-service-account.json',
];
const GOOGLEAPIS_CANDIDATES = [
  '/Users/frankthebot/clawd/node_modules/googleapis',
  '/Users/jacobposner/clawd/node_modules/googleapis',
];
const SA_KEY = SA_CANDIDATES.find(p => fs.existsSync(p));
const GOOGLEAPIS_PATH = GOOGLEAPIS_CANDIDATES.find(p => fs.existsSync(p));
if (!SA_KEY) {
  console.error('FATAL: no Google service-account key found. Tried:', SA_CANDIDATES);
  process.exit(1);
}
if (!GOOGLEAPIS_PATH) {
  console.error('FATAL: googleapis module not found. Tried:', GOOGLEAPIS_CANDIDATES);
  process.exit(1);
}
const { google } = require(GOOGLEAPIS_PATH);

// Vercel token (for verifying the deploy actually built after we push).
const VERCEL_TOKEN_CANDIDATES = [
  '/Users/frankthebot/clawd/.secrets/vercel-token.txt',
  '/Users/jacobposner/clawd/.secrets/vercel-token.txt',
];
const VERCEL_TOKEN_FILE = VERCEL_TOKEN_CANDIDATES.find(p => fs.existsSync(p));
const VERCEL_TOKEN = VERCEL_TOKEN_FILE ? fs.readFileSync(VERCEL_TOKEN_FILE, 'utf8').trim() : null;

// Maps `template` value → directory under content/data/.
// Templates listed as DEFER are part of Phase 5 and will be skipped with a
// "deferred-template" reason until their routes/components ship.
const TEMPLATE_TO_DIR = {
  procedure: 'procedures',
  drug: 'drugs',
  persona: 'personas',
  event: 'events',
  qa: 'qa',
  'qa-x-state': 'qa',
  'event-x-state': 'events',
  glossary: 'glossary',
  'ma-state': 'medicare-advantage',
  'track-d': 'medicaid-income-limits',
  // Skipped explicitly:
  'spanish-twin': null,        // defer; ES-twin handling not built yet
  'persona-x-state': null,     // Phase 5
  county: null,                // Phase 5
  'carrier-x-state': null,     // Phase 5
  'd-snp': null,               // Phase 5
  'ma-vs-medigap': null,       // Phase 5
  template: null,              // sentinel/placeholder rows
};

// Route prefix per template — used to reconstruct a route when the sheet's
// route column is blank/malformed but the file resolved fine.
const TEMPLATE_TO_PREFIX = {
  procedure: '/cost',
  drug: '/drug',
  persona: '/for',
  event: '/event',
  'event-x-state': '/event',
  qa: '/qa',
  'qa-x-state': '/qa',
  glossary: '/glossary',
  'ma-state': '/medicare-advantage',
  'track-d': '/medicaid-income-limits',
};

// Template -> the prebuild validator that gates it. `npm run prebuild` chains
// these with &&, so ANY bad file fails the whole Vercel build. The publisher
// must therefore never promote a page that its validator rejects.
// (track-d has no prebuild validator, so it isn't gated.)
const VALIDATOR_FOR = {
  procedure: 'validate-procedures.js',
  drug: 'validate-drugs.js',
  persona: 'validate-personas.js',
  event: 'validate-events.js',
  'event-x-state': 'validate-events.js',
  qa: 'validate-qa.js',
  'qa-x-state': 'validate-qa.js',
  glossary: 'validate-glossary.js',
  'ma-state': 'validate-medicare-advantage.js',
};

// ────────────────────────────────────────────────────────────────────────────
// CLI args
// ────────────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
let limit = MAX_PER_DAY;
for (const a of args) {
  const m = a.match(/^--limit=(\d+)$/);
  if (m) limit = parseInt(m[1], 10);
}
const TODAY = new Date().toISOString().slice(0, 10);

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SA_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function sh(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  return execSync(cmd, {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    ...opts,
  });
}

// Build the live URL for a row. The Master Backlog `route` column already
// holds the canonical path (e.g. /cost/cataract-surgery, /qa/foo-bar) so we
// just prefix the host. /en/ default; /es/* paths render as-is.
function liveUrlFor(route) {
  route = (route || '').trim();
  if (!route.startsWith('/')) return null;
  // Spanish twin rows have routes like /es/medicare-advantage/georgia.
  // English template rows have routes like /cost/cataract-surgery — render at /en/...
  if (route.startsWith('/es/')) {
    return `https://${HOST}${route}`;
  }
  return `https://${HOST}/en${route}`;
}

// ── Slug resolution helpers ──────────────────────────────────────────────────
// The join key across the pipeline is the slug. Writers strip years to pass
// GATE A, so a sheet topic_slug like "jardiance-medicare-2026" can map to a file
// named "jardiance-medicare.json". We resolve the ACTUAL file deterministically
// so a slug drift can never strand a written page.

// Strip any 4-digit year (1900-2099) segment from a slug and tidy hyphens.
function stripYear(slug) {
  return String(slug || '')
    .replace(/-(19|20)\d{2}(?=-|$)/g, '')
    .replace(/(^|-)(19|20)\d{2}-/g, '$1')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

const norm = s => stripYear(String(s || '').toLowerCase());

// Does a path exist on origin/drip-queue? (no working-tree changes)
function existsOnDripQueue(relPath) {
  try {
    execSync(`git cat-file -e "origin/drip-queue:${relPath}"`, { cwd: REPO_ROOT, stdio: 'ignore' });
    return true;
  } catch { return false; }
}

// Slugs of JSON files in a template dir on origin/drip-queue.
function listDripDirSlugs(dir) {
  try {
    const out = execSync(`git ls-tree -r --name-only origin/drip-queue -- content/data/${dir}/`, { cwd: REPO_ROOT, encoding: 'utf8' });
    return out.trim().split('\n').filter(f => f.endsWith('.json'))
      .map(f => f.replace(/^content\/data\/[^/]+\//, '').replace(/\.json$/, ''));
  } catch { return []; }
}

// Resolve the actual file for a Ready row.
// Returns { dir, slug, relPath, source:'main'|'drip', needsSheetFix } on success,
// { skipReason } for deferred/unknown template or missing slug,
// or { dir, slug:null, relPath:null } when no file is written anywhere yet.
function resolveFileForRow(row, dripQueueAvailable) {
  const tmpl = (row.template || '').trim();
  const dir = TEMPLATE_TO_DIR[tmpl];
  if (dir === undefined) return { skipReason: `unknown-template "${tmpl}"` };
  if (dir === null) return { skipReason: `deferred-template "${tmpl}"` };
  const sheetSlug = (row.topic_slug || '').trim();
  if (!sheetSlug) return { skipReason: 'missing topic_slug' };

  // Deterministic candidates: exact, year-stripped, lowercased, both.
  // (Writers lowercase filenames; the cloud routine runs on case-sensitive Linux.)
  const cands = [];
  for (const c of [sheetSlug, stripYear(sheetSlug), sheetSlug.toLowerCase(), stripYear(sheetSlug).toLowerCase()]) {
    if (c && !cands.includes(c)) cands.push(c);
  }

  for (const slug of cands) {
    const relPath = `content/data/${dir}/${slug}.json`;
    if (fs.existsSync(path.join(REPO_ROOT, relPath))) {
      return { dir, slug, relPath, source: 'main', needsSheetFix: slug !== sheetSlug };
    }
    if (dripQueueAvailable && existsOnDripQueue(relPath)) {
      return { dir, slug, relPath, source: 'drip', needsSheetFix: slug !== sheetSlug };
    }
  }

  // Last resort: a UNIQUE normalized (year-stripped, lowercased) match in the
  // template dir on drip-queue. Only used when exactly one file matches, so we
  // never guess between ambiguous candidates.
  if (dripQueueAvailable) {
    const want = norm(sheetSlug);
    const matches = listDripDirSlugs(dir).filter(s => norm(s) === want);
    if (matches.length === 1) {
      const slug = matches[0];
      return { dir, slug, relPath: `content/data/${dir}/${slug}.json`, source: 'drip', needsSheetFix: slug !== sheetSlug };
    }
  }
  return { dir, slug: null, relPath: null };
}

// Corrected route = swap the final path segment for the actual slug.
function routeForSlug(oldRoute, actualSlug) {
  const r = (oldRoute || '').trim();
  if (!r.startsWith('/')) return r;
  return r.replace(/[^/]+$/, actualSlug);
}

// Run the prebuild validators for the templates we're about to ship and return
// the SET of slugs flagged bad (❌). A flagged page would fail `npm run build`'s
// prebuild step and break the entire Vercel deploy, so it must never reach main.
// The validators scan all files of a type; we only act on the slugs WE promoted.
function validatePromotedSlugs(rows) {
  const flagged = new Set();
  const validators = new Set(
    rows.map(r => VALIDATOR_FOR[(r.template || '').trim()]).filter(Boolean)
  );
  for (const v of validators) {
    let out = '';
    try {
      out = execSync(`node scripts/${v}`, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
      out = `${e.stdout || ''}\n${e.stderr || ''}`; // validator exits non-zero on bad files
    }
    for (const line of out.split('\n')) {
      const m = line.match(/❌\s+([A-Za-z0-9._-]+)\.json/);
      if (m) flagged.add(m[1]);
    }
  }
  return flagged;
}

// Run the cross-page link-index builder (the LAST prebuild step) and return the
// keyword phrases it reports as collisions. A collision exits non-zero and fails
// the whole Vercel build — the per-file validators can't see it because it's a
// cross-page conflict. Reverts the regenerated link-index so the working tree
// stays clean for the push (the build regenerates it anyway).
function linkIndexCollisionPhrases() {
  let out = '';
  let ok = true;
  try {
    out = execSync('node scripts/coveredusa-build-link-index.js', { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    ok = false;
    out = `${e.stdout || ''}\n${e.stderr || ''}`;
  }
  try { execSync('git checkout -- content/link-index.json', { cwd: REPO_ROOT, stdio: 'ignore' }); } catch (_) {}
  const phrases = [];
  if (!ok) {
    for (const line of out.split('\n')) {
      const m = line.match(/❌ phrase "(.+?)" \((?:en|es)\)/);
      if (m) phrases.push(m[1]);
    }
  }
  return phrases;
}

// Full build-gate: runs the EXACT prebuild Vercel runs (per-file validators +
// the cross-page link-index builder) against the promoted working tree, and
// returns the SET of OUR promoted slugs that would break the build. We hold only
// our own pages — never the existing pages already live on main.
function runBuildGate(rows) {
  const flagged = validatePromotedSlugs(rows);
  const phrases = linkIndexCollisionPhrases();
  if (phrases.length) {
    for (const row of rows) {
      try {
        const d = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, row._relPath), 'utf8'));
        const kt = d.keyTerms || {};
        const all = [...(kt.en || []), ...(kt.es || [])];
        if (phrases.some(p => all.includes(p))) flagged.add(row._actualSlug);
      } catch (_) { /* unreadable; validators will have caught shape issues */ }
    }
  }
  return flagged;
}

// Poll Vercel for the production deployment of `sha` until it resolves or times
// out. Returns 'READY' | 'ERROR' | 'CANCELED' | 'UNKNOWN'. This is the safety net
// so the cron never reports "shipped" while the site is actually frozen.
async function verifyDeploy(sha) {
  if (!VERCEL_TOKEN) return 'UNKNOWN';
  const short = (sha || '').slice(0, 7);
  for (let attempt = 0; attempt < 12; attempt++) { // ~6 minutes
    try {
      const r = await fetch('https://api.vercel.com/v6/deployments?limit=10&projectId=covered-usa&target=production', {
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
      });
      const j = await r.json();
      const deps = j.deployments || [];
      const dep = deps.find(d => d.meta && (d.meta.githubCommitSha || '').startsWith(short)) || deps[0];
      const state = dep && (dep.state || dep.readyState);
      if (state === 'READY' || state === 'ERROR' || state === 'CANCELED') return state;
    } catch (e) { /* transient — keep polling */ }
    await sleep(30_000);
  }
  return 'UNKNOWN';
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet read
// ────────────────────────────────────────────────────────────────────────────
//
// Master Backlog columns (1-indexed):
//   A row_id, B template, C route, D topic_slug, E state, F title,
//   G priority, H demand_score, I competitor_density, J busa_overlap,
//   K cta_target, L subtype, M topic_type, N already_live,
//   O migrated_from_sheet, P sheet_row_id, Q sources, R notes,
//   S Status, T PublishedDate, U PublishedURL
const COLUMN_KEYS = [
  'row_id', 'template', 'route', 'topic_slug', 'state', 'title',
  'priority', 'demand_score', 'competitor_density', 'busa_overlap',
  'cta_target', 'subtype', 'topic_type', 'already_live',
  'migrated_from_sheet', 'sheet_row_id', 'sources', 'notes',
  'Status', 'PublishedDate', 'PublishedURL',
];

async function readMasterBacklog(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${MASTER_TAB}!A2:U`,
  });
  const values = res.data.values || [];
  return values.map((cells, i) => {
    const row = { _sheetRow: i + 2 }; // +2 because A2 is row 2
    COLUMN_KEYS.forEach((k, j) => {
      row[k] = (cells[j] !== undefined && cells[j] !== null) ? String(cells[j]) : '';
    });
    return row;
  });
}

// ────────────────────────────────────────────────────────────────────────────
// IndexNow
// ────────────────────────────────────────────────────────────────────────────
async function submitIndexNow(urls) {
  if (!urls.length) {
    console.log('  IndexNow: no URLs to submit.');
    return { ok: true, submitted: 0, results: [] };
  }
  console.log(`  IndexNow: submitting ${urls.length} URLs...`);
  const body = JSON.stringify({
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  });
  const results = [];
  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
      });
      console.log(`    ${endpoint} → ${r.status} ${r.statusText}`);
      results.push({ endpoint, status: r.status });
    } catch (err) {
      console.error(`    ${endpoint} → FAILED: ${err.message}`);
      results.push({ endpoint, error: err.message });
    }
  }
  // We treat any 200/202 from at least one endpoint as success — IndexNow
  // is best-effort, sub-endpoint errors shouldn't break the cron.
  const ok = results.some(r => r.status === 200 || r.status === 202);
  return { ok, submitted: urls.length, results };
}

// ────────────────────────────────────────────────────────────────────────────
// Sheet writes
// ────────────────────────────────────────────────────────────────────────────
async function markPublished(sheets, shipped) {
  if (!shipped.length) return;
  const data = shipped.map(row => ({
    range: `${MASTER_TAB}!S${row._sheetRow}:U${row._sheetRow}`,
    values: [['Published', TODAY, row._liveUrl]],
  }));
  // Self-heal: if we resolved this row via a slug fallback (sheet slug had a
  // year / drifted from the actual filename), correct topic_slug (D) + route (C)
  // so future lookups are exact and the published URL matches the sheet.
  let fixed = 0;
  for (const row of shipped) {
    if (row._needsSheetFix && row._actualSlug) {
      data.push({ range: `${MASTER_TAB}!C${row._sheetRow}`, values: [[row._actualRoute]] });
      data.push({ range: `${MASTER_TAB}!D${row._sheetRow}`, values: [[row._actualSlug]] });
      fixed++;
    }
  }
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'RAW', data },
  });
  console.log(`  Sheet: marked ${shipped.length} rows Status=Published${fixed ? ` (self-healed ${fixed} slug/route mismatches)` : ''}.`);
}

// Park rows we refused to publish because they fail their validator: revert to
// blank Status + a held note, so they don't sit falsely Ready and a human/regen
// can fix them. Status=blank, notes (col R).
async function markHeld(sheets, rows, reason) {
  if (!rows.length) return;
  const data = [];
  for (const row of rows) {
    data.push({ range: `${MASTER_TAB}!S${row._sheetRow}`, values: [['']] });
    data.push({ range: `${MASTER_TAB}!R${row._sheetRow}`, values: [[`held ${TODAY}: ${reason}`]] });
  }
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'RAW', data },
  });
  console.log(`  Sheet: parked ${rows.length} build-failing rows (Status=blank + held note).`);
}

// For rows that came from SEO Ideas (sheet_row_id populated), append a
// back-reference to the SEO Ideas Notes column so we have a paper trail.
async function updateSeoIdeasBackrefs(sheets, shipped) {
  const withSrc = shipped.filter(r => r.sheet_row_id && /^\d+$/.test(r.sheet_row_id.trim()));
  if (!withSrc.length) {
    console.log('  Sheet: no SEO Ideas back-refs to update.');
    return;
  }
  console.log(`  Sheet: updating ${withSrc.length} SEO Ideas back-refs...`);

  // Pull current Notes (column N, index 13) so we can append.
  const ranges = withSrc.map(r => `${SEO_IDEAS_TAB}!N${r.sheet_row_id}`);
  const pull = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SHEET_ID,
    ranges,
  });
  const current = pull.data.valueRanges || [];

  const data = [];
  for (let i = 0; i < withSrc.length; i++) {
    const row = withSrc[i];
    const cur = (current[i] && current[i].values && current[i].values[0] && current[i].values[0][0]) || '';
    const note = `Published as template page at ${row._liveUrl} on ${TODAY}`;
    const merged = cur ? `${cur} | ${note}` : note;
    data.push({
      range: `${SEO_IDEAS_TAB}!N${row.sheet_row_id}`,
      values: [[merged]],
    });
  }
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'RAW', data },
  });
  console.log(`  Sheet: appended back-ref note on ${data.length} SEO Ideas rows.`);
}

// ────────────────────────────────────────────────────────────────────────────
// Telegram (best-effort, only used on errors)
// ────────────────────────────────────────────────────────────────────────────
function sendTelegram(text) {
  // Send-script lives on the Mac mini under /Users/frankthebot. On the
  // MacBook there's a copy at /Users/jacobposner. Try both, swallow errors.
  const candidates = [
    '/Users/frankthebot/clawd/scripts/send-telegram.sh',
    '/Users/jacobposner/clawd/scripts/send-telegram.sh',
  ];
  const script = candidates.find(p => fs.existsSync(p));
  if (!script) {
    console.warn('  Telegram: no send-telegram.sh found; skipping notification.');
    return;
  }
  try {
    const safe = String(text).replace(/"/g, '\\"');
    execSync(`bash "${script}" 8424956848 "${safe}"`, { stdio: 'ignore' });
  } catch (e) {
    console.warn('  Telegram: send failed:', e.message);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`CoveredUSA Drip Publish — ${TODAY}`);
  console.log(`  Repo: ${REPO_ROOT}`);
  console.log(`  Mode: ${DRY ? 'DRY RUN' : 'LIVE'}`);
  console.log(`  Limit: ${limit} (MAX_PER_DAY=${MAX_PER_DAY})`);
  console.log('');

  const sheets = await getSheets();

  console.log(`[1] Reading ${MASTER_TAB} tab...`);
  const all = await readMasterBacklog(sheets);
  console.log(`    ${all.length} total rows.`);

  const ready = all.filter(r => (r.Status || '').trim() === 'Ready');
  console.log(`    ${ready.length} rows with Status=Ready.`);
  if (!ready.length) {
    console.log('\n[done] No rows ready to ship. Nothing to publish.');
    return;
  }

  // Sort: priority ASC (numeric, blanks last), then demand_score DESC.
  ready.sort((a, b) => {
    const pa = parseInt(a.priority, 10);
    const pb = parseInt(b.priority, 10);
    const paN = isNaN(pa) ? 999 : pa;
    const pbN = isNaN(pb) ? 999 : pb;
    if (paN !== pbN) return paN - pbN;
    const da = parseInt(a.demand_score, 10) || 0;
    const db = parseInt(b.demand_score, 10) || 0;
    return db - da;
  });

  // ── Step 2.5: fetch latest drip-queue ref so we can resolve/promote files ──
  // Architecture: bulk-production writes JSON files to the `drip-queue` branch
  // (Vercel ignores it). The cron promotes N files/day from drip-queue → main.
  // If drip-queue doesn't exist (legacy push-to-main flow), fall back to
  // main-only mode and just check fs.existsSync.
  let dripQueueAvailable = false;
  try {
    sh('git fetch origin drip-queue 2>&1 || git fetch origin drip-queue:refs/remotes/origin/drip-queue 2>&1');
    dripQueueAvailable = true;
    console.log('  [✓] drip-queue branch fetched.');
  } catch (e) {
    console.warn('  [!] drip-queue branch not found on origin — running in main-only mode.');
  }

  // Resolve EVERY Ready row to a real file FIRST, then cap. Rows whose file
  // isn't written yet (or whose slug can't be resolved) never burn a daily slot
  // — only genuinely-shippable rows count toward MAX_PER_DAY. This is the fix
  // for the "skips waste the cap" bug.
  const resolved = [];      // rows mapping to a real file (main or drip-queue)
  const skipped = [];       // deferred / unknown-template / bad-route / duplicate-file
  const seenRel = new Set();// dedup: two Ready rows must never map to the same file
  let noFileYet = 0;        // Ready but not written anywhere yet (normal, not an error)
  for (const row of ready) {
    const res = resolveFileForRow(row, dripQueueAvailable);
    if (res.skipReason) { skipped.push({ row, reason: res.skipReason }); continue; }
    if (!res.relPath) { noFileYet++; continue; }
    if (seenRel.has(res.relPath)) {
      skipped.push({ row, reason: `duplicate-file: another Ready row already maps to ${res.relPath}` });
      continue;
    }
    // Route: prefer the (possibly corrected) sheet route; if it's blank/malformed,
    // reconstruct from the template prefix + the actual slug so a junk route can't
    // strand an otherwise-shippable page.
    let actualRoute = res.needsSheetFix ? routeForSlug(row.route, res.slug) : (row.route || '').trim();
    let liveUrl = liveUrlFor(actualRoute);
    if (!liveUrl) {
      const prefix = TEMPLATE_TO_PREFIX[(row.template || '').trim()];
      if (prefix) { actualRoute = `${prefix}/${res.slug}`; liveUrl = liveUrlFor(actualRoute); }
    }
    if (!liveUrl) { skipped.push({ row, reason: `bad route "${row.route}" (could not reconstruct)` }); continue; }
    if (actualRoute !== (row.route || '').trim()) res.needsSheetFix = true; // self-heal route on publish
    seenRel.add(res.relPath);
    resolved.push({ row, res, actualRoute, liveUrl });
  }
  console.log(`[2] ${resolved.length} Ready rows resolve to a real file; ${noFileYet} not-written-yet; ${skipped.length} skipped (template/route). Capping at ${limit}.`);

  // Cap AFTER resolution — guarantees up to `limit` REAL pages ship.
  const toShip = resolved.slice(0, limit);

  // Promote the chosen files from drip-queue into main's working tree.
  const shipReady = [];
  for (const { row, res, actualRoute, liveUrl } of toShip) {
    const absPath = path.join(REPO_ROOT, res.relPath);
    if (res.source === 'drip' && !fs.existsSync(absPath)) {
      try {
        execSync(`git checkout origin/drip-queue -- "${res.relPath}"`, {
          cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8',
        });
        console.log(`  [↓] Promoted from drip-queue: ${res.relPath}`);
      } catch (e) { /* fall through to existence check */ }
    }
    if (!fs.existsSync(absPath)) {
      skipped.push({ row, reason: `file vanished during promote: ${res.relPath}` });
      continue;
    }
    row._filePath = absPath;
    row._relPath = res.relPath;
    row._liveUrl = liveUrl;
    row._actualSlug = res.slug;
    row._actualRoute = actualRoute;
    row._needsSheetFix = res.needsSheetFix;
    shipReady.push(row);
  }

  // ── Build-gate: never push a state that fails the prebuild ──
  // Runs the EXACT prebuild Vercel runs (per-file validators + the cross-page
  // link-index builder) against the promoted working tree. Any of OUR pages that
  // would break it are un-promoted + parked, so only build-passing pages reach
  // main. This catches BOTH a per-file validator failure AND a keyTerms
  // collision — the two freezes we hit.
  const validationFailed = [];
  if (shipReady.length) {
    const flagged = runBuildGate(shipReady);
    if (flagged.size) {
      const survivors = [];
      for (const row of shipReady) {
        if (flagged.has(row._actualSlug)) {
          try { execSync(`git restore --staged --worktree -- "${row._relPath}"`, { cwd: REPO_ROOT, stdio: 'ignore' }); } catch (e) { /* best effort */ }
          validationFailed.push(row);
          skipped.push({ row, reason: `build-gate: would break the build, held: ${row._relPath}` });
        } else {
          survivors.push(row);
        }
      }
      shipReady.length = 0;
      shipReady.push(...survivors);
      console.log(`  [build-gate] held ${validationFailed.length} page(s) that fail the prebuild; kept off main.`);

      // Re-run the gate on the survivors. If the prebuild STILL fails we can't
      // safely pin the culprit — ABORT the whole push so main never breaks,
      // un-promote everything, park the held rows, and alert for manual review.
      if (shipReady.length && runBuildGate(shipReady).size) {
        for (const row of shipReady) {
          try { execSync(`git restore --staged --worktree -- "${row._relPath}"`, { cwd: REPO_ROOT, stdio: 'ignore' }); } catch (e) { /* best effort */ }
        }
        console.error('  [build-gate] prebuild STILL failing after holding culprits — ABORTING push to protect main.');
        if (!DRY) {
          try { await markHeld(sheets, validationFailed, 'failed prebuild (build-gate)'); } catch (e) { /* best effort */ }
          sendTelegram(`CoveredUSA drip-publish ${TODAY}: ABORTED — prebuild still failing after holding ${validationFailed.length} page(s). Main NOT touched. Manual review needed.`);
        }
        return;
      }
    }
  }
  // Park the held rows (real runs only) so they don't sit falsely Ready.
  if (!DRY && validationFailed.length) {
    try { await markHeld(sheets, validationFailed, 'failed prebuild (build-gate); regenerate'); }
    catch (e) { console.error('  markHeld failed:', e.message); }
  }

  console.log(`[3] ${shipReady.length} ready to ship, ${skipped.length} skipped.`);
  for (const s of skipped) {
    console.log(`    SKIP ${s.row.row_id} (${s.row.template}/${s.row.topic_slug}): ${s.reason}`);
  }
  for (const r of shipReady) {
    console.log(`    SHIP ${r.row_id} ${r.template}/${r.topic_slug} → ${r._relPath}`);
    console.log(`         URL → ${r._liveUrl}`);
  }

  if (!shipReady.length) {
    console.log('\n[done] Nothing valid to ship after filtering. (See SKIPs above.)');
    return;
  }

  if (DRY) {
    console.log('\n[dry-run] Would commit + push + IndexNow + sheet-update for the SHIP rows above. No writes performed.');
    return;
  }

  // ── Step 4: git add + commit + push ──
  console.log(`\n[4] git add + commit + push (${shipReady.length} files)...`);
  try {
    // Sanity: stop if working tree has unrelated unstaged changes that look risky.
    const status = sh('git status --porcelain');
    if (status.trim()) {
      console.warn('  [!] Working tree not clean before drip-publish. Existing changes:');
      console.warn(status);
      console.warn('  Continuing — git add only the explicit drip files.');
    }

    const escaped = shipReady.map(r => `"${r._relPath}"`).join(' ');
    sh(`git add ${escaped}`);

    // Confirm what's actually staged for our paths.
    const staged = sh('git diff --cached --name-only').trim().split('\n').filter(Boolean);
    if (!staged.length) {
      console.log('  [=] git add produced no staged changes — files were already committed. Skipping push.');
    } else {
      console.log(`  Staged ${staged.length} files.`);
      const msg = `drip-publish: ship ${shipReady.length} template pages ${TODAY}`;
      sh(`git commit -m "${msg}"`);
      // Sync with any concurrent push (e.g. a manual run on another host) before
      // pushing, so the publisher never fails on a non-fast-forward. Promoted
      // files are additive, so the rebase is conflict-free in practice.
      sh('git pull --rebase origin main');
      sh(`git push origin main`);
      console.log('  Pushed.');
    }
  } catch (e) {
    console.error('  git step FAILED:', e.message);
    sendTelegram(`CoveredUSA drip-publish ${TODAY} FAILED at git step: ${e.message.slice(0, 200)}`);
    throw e;
  }

  // ── Step 5: verify the deploy actually built (don't trust "pushed" == "live") ──
  const deployedSha = sh('git rev-parse HEAD').trim();
  console.log(`\n[5] Verifying Vercel production deploy of ${deployedSha.slice(0, 7)}...`);
  await sleep(VERCEL_DEPLOY_WAIT_MS); // let the deploy register before polling
  const deployState = await verifyDeploy(deployedSha);
  console.log(`  Deploy state: ${deployState}`);
  if (deployState === 'ERROR' || deployState === 'CANCELED') {
    console.error('  [FATAL] Vercel build did NOT go live. Skipping IndexNow + Published-marking; pages stay Ready to retry.');
    sendTelegram(`CoveredUSA drip-publish ${TODAY}: pushed ${shipReady.length} pages but the Vercel build came back ${deployState} — pages are NOT live and were NOT marked Published (they will retry). Investigate commit ${deployedSha.slice(0, 7)}.`);
    console.log(`\n────────────────────────────────────────\nDEPLOY ${deployState}. ${shipReady.length} pages pushed but NOT live. ${TODAY}`);
    return;
  }
  if (deployState === 'UNKNOWN') {
    console.warn('  [!] Could not confirm deploy state via Vercel API. Proceeding — the build-gate already passed the full prebuild locally.');
  }

  // ── Step 6: IndexNow ──
  console.log(`\n[6] Submitting ${shipReady.length} URLs to IndexNow...`);
  const urls = shipReady.map(r => r._liveUrl);
  const idx = await submitIndexNow(urls);
  if (!idx.ok) {
    console.warn('  IndexNow: all endpoints failed. Will still mark published — IndexNow is best-effort.');
  }

  // ── Step 7: mark Published in Master Backlog ──
  console.log(`\n[7] Marking ${shipReady.length} rows Status=Published in Master Backlog...`);
  try {
    await markPublished(sheets, shipReady);
  } catch (e) {
    console.error('  Master Backlog update FAILED:', e.message);
    sendTelegram(`CoveredUSA drip-publish ${TODAY}: pages SHIPPED to git but Master Backlog status update FAILED: ${e.message.slice(0, 200)}. Manual fix needed.`);
    throw e;
  }

  // ── Step 8: SEO Ideas back-refs ──
  console.log(`\n[8] Updating SEO Ideas back-refs (where sheet_row_id present)...`);
  try {
    await updateSeoIdeasBackrefs(sheets, shipReady);
  } catch (e) {
    console.error('  SEO Ideas back-ref update FAILED:', e.message);
    sendTelegram(`CoveredUSA drip-publish ${TODAY}: pages SHIPPED + Master Backlog updated, but SEO Ideas back-refs FAILED: ${e.message.slice(0, 200)}. Non-blocking.`);
    // Don't throw — we don't want to fail the whole run for the back-ref step.
  }

  // ── Step 9: summary ──
  console.log(`\n────────────────────────────────────────`);
  console.log(`DONE. ${shipReady.length} pages shipped, ${skipped.length} skipped. ${TODAY}`);
  console.log(`Shipped URLs:`);
  for (const r of shipReady) console.log(`  ${r._liveUrl}`);
  if (skipped.length) {
    console.log(`Skipped:`);
    for (const s of skipped) {
      console.log(`  ${s.row.row_id} (${s.row.template}/${s.row.topic_slug}): ${s.reason}`);
    }
  }
}

main().catch(e => {
  console.error('FATAL:', e.message);
  if (e.stack) console.error(e.stack);
  sendTelegram(`CoveredUSA drip-publish ${TODAY} FATAL: ${e.message.slice(0, 300)}`);
  process.exit(1);
});
