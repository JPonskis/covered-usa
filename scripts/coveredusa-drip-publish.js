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
function liveUrlFor(row) {
  const route = (row.route || '').trim();
  if (!route.startsWith('/')) return null;
  // Spanish twin rows have routes like /es/medicare-advantage/georgia.
  // English template rows have routes like /cost/cataract-surgery — render at /en/...
  if (route.startsWith('/es/')) {
    return `https://${HOST}${route}`;
  }
  return `https://${HOST}/en${route}`;
}

// Map a row to its expected JSON file path (or null if template is deferred).
function expectedFilePathFor(row) {
  const tmpl = (row.template || '').trim();
  const dir = TEMPLATE_TO_DIR[tmpl];
  if (dir === undefined) {
    return { path: null, reason: `unknown-template "${tmpl}"` };
  }
  if (dir === null) {
    return { path: null, reason: `deferred-template "${tmpl}"` };
  }
  const slug = (row.topic_slug || '').trim();
  if (!slug) return { path: null, reason: 'missing topic_slug' };
  const filePath = path.join(CONTENT_DATA, dir, `${slug}.json`);
  return { path: filePath, reason: null };
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
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'RAW', data },
  });
  console.log(`  Sheet: marked ${shipped.length} rows Status=Published.`);
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

  const candidates = ready.slice(0, limit);
  console.log(`[2] Top ${candidates.length} candidates after sort + cap.`);

  // ── Step 2.5: fetch latest drip-queue ref so we can promote staged files ──
  // Architecture: bulk-production writes JSON files to the `drip-queue` branch
  // (Vercel ignores it). The cron promotes N files/day from drip-queue → main.
  // This gives us a true 15/day publish throttle even when many files are
  // queued. If drip-queue doesn't exist (e.g. legacy push-to-main flow), we
  // fall back to main-only mode and just check fs.existsSync.
  let dripQueueAvailable = false;
  try {
    sh('git fetch origin drip-queue 2>&1 || git fetch origin drip-queue:refs/remotes/origin/drip-queue 2>&1');
    dripQueueAvailable = true;
    console.log('  [✓] drip-queue branch fetched.');
  } catch (e) {
    console.warn('  [!] drip-queue branch not found on origin — running in main-only mode.');
  }

  // Resolve file paths + URLs.
  const shipReady = [];
  const skipped = [];
  for (const row of candidates) {
    const { path: filePath, reason } = expectedFilePathFor(row);
    const liveUrl = liveUrlFor(row);
    if (!filePath) {
      skipped.push({ row, reason });
      continue;
    }
    if (!liveUrl) {
      skipped.push({ row, reason: `bad route "${row.route}"` });
      continue;
    }
    // If the file isn't already on main's working tree, try to promote it
    // from drip-queue. `git checkout origin/drip-queue -- <path>` brings it
    // into the working tree AND stages it in one shot.
    let promotedFromQueue = false;
    if (!fs.existsSync(filePath) && dripQueueAvailable) {
      const relPath = path.relative(REPO_ROOT, filePath);
      try {
        execSync(`git checkout origin/drip-queue -- "${relPath}"`, {
          cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8',
        });
        if (fs.existsSync(filePath)) {
          promotedFromQueue = true;
          console.log(`  [↓] Promoted from drip-queue: ${relPath}`);
        }
      } catch (e) {
        // File not on drip-queue either — fall through to skip.
      }
    }
    if (!fs.existsSync(filePath)) {
      const where = dripQueueAvailable ? 'main AND drip-queue' : 'main';
      skipped.push({ row, reason: `file missing on ${where}: ${path.relative(REPO_ROOT, filePath)}` });
      continue;
    }
    row._filePath = filePath;
    row._liveUrl = liveUrl;
    row._relPath = path.relative(REPO_ROOT, filePath);
    row._promotedFromQueue = promotedFromQueue;
    shipReady.push(row);
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
      sh(`git push origin main`);
      console.log('  Pushed.');
    }
  } catch (e) {
    console.error('  git step FAILED:', e.message);
    sendTelegram(`CoveredUSA drip-publish ${TODAY} FAILED at git step: ${e.message.slice(0, 200)}`);
    throw e;
  }

  // ── Step 5: wait for Vercel ──
  console.log(`\n[5] Sleeping ${VERCEL_DEPLOY_WAIT_MS / 1000}s for Vercel deploy...`);
  await sleep(VERCEL_DEPLOY_WAIT_MS);

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
