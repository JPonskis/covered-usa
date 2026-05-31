#!/usr/bin/env node
// coveredusa-batch-pick.js (CLOUD-PORTABLE)
// Reads CoveredUSA Master Backlog and returns the next N writable rows, formatted
// with the args needed to spawn the right writer agent.
//
// Portability vs the local clawd-workspace version:
//   - Repo root is derived from THIS script's location (scripts/cloud/ -> repo root),
//     overridable with COVERED_USA_ROOT. No host-specific /Users path.
//   - Service-account auth comes from GOOGLE_SERVICE_ACCOUNT_JSON (env, cloud) if set,
//     else falls back to a keyFile at $HOME/clawd/.secrets/google-service-account.json
//     (local Mac), overridable with GOOGLE_SA_KEYFILE.
//
// Usage:
//   node coveredusa-batch-pick.js 20            # pick 20 rows (JSON to stdout)
//   node coveredusa-batch-pick.js --recovery    # find stuck Writing rows w/ missing files
//
// Filtering (matches the sheet's "Group 1" view): Status blank, template not deferred,
// already_live != y, and the output file does NOT already exist on the working tree.
// Sort: priority asc, demand_score desc.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { google } = require('googleapis');

const SHEET_ID = '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU';
const TAB = 'Master Backlog';

// Repo root: prefer explicit env, else resolve from this file (scripts/cloud/ -> ../..).
const COVERED_USA_ROOT = process.env.COVERED_USA_ROOT || path.resolve(__dirname, '..', '..');

const DEFERRED_TEMPLATES = new Set([
  'spanish-twin', 'persona-x-state', 'county', 'carrier-x-state', 'd-snp', 'ma-vs-medigap',
]);

const TEMPLATE_CONFIG = {
  'procedure':     { agent: 'coveredusa-procedure-writer',   subdir: 'content/data/procedures' },
  'drug':          { agent: 'coveredusa-drug-writer',        subdir: 'content/data/drugs' },
  'persona':       { agent: 'coveredusa-persona-writer',     subdir: 'content/data/personas' },
  'event':         { agent: 'coveredusa-event-writer',       subdir: 'content/data/events' },
  'event-x-state': { agent: 'coveredusa-event-writer',       subdir: 'content/data/events' },
  'qa':            { agent: 'coveredusa-qa-writer',          subdir: 'content/data/qa' },
  'qa-x-state':    { agent: 'coveredusa-qa-writer',          subdir: 'content/data/qa', extraArg: 'SUBTYPE=qa-state-eligibility' },
  'glossary':      { agent: 'coveredusa-glossary-writer',    subdir: 'content/data/glossary' },
  'ma-state':      { agent: 'coveredusa-ma-state-writer',    subdir: 'content/data/medicare-advantage' },
  'track-d':       { agent: 'coveredusa-track-d-writer',     subdir: 'content/data/medicaid-income-limits' },
};

function buildAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (raw && raw.trim()) {
    let creds;
    try { creds = JSON.parse(raw); }
    catch (e) { throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is set but not valid JSON: ' + e.message); }
    return new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  }
  const keyFile = process.env.GOOGLE_SA_KEYFILE
    || path.join(os.homedir(), 'clawd', '.secrets', 'google-service-account.json');
  if (!fs.existsSync(keyFile)) {
    throw new Error(`No service-account creds: set GOOGLE_SERVICE_ACCOUNT_JSON or place a key at ${keyFile}`);
  }
  return new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

async function getSheet() {
  const auth = buildAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${TAB}'!A1:Z3000`,
  });
  const rows = r.data.values || [];
  if (!rows.length) throw new Error('Master Backlog is empty');
  const header = rows[0].map(h => (h || '').trim());
  const COL = {};
  header.forEach((h, i) => { COL[h] = i; });
  const required = ['row_id', 'template', 'topic_slug', 'state', 'title', 'priority', 'demand_score', 'already_live', 'Status'];
  for (const col of required) {
    if (!(col in COL)) throw new Error(`Master Backlog missing required column: ${col}`);
  }
  return { COL, data: rows.slice(1).map((r, i) => ({ sheetRow: i + 2, cells: r })) };
}

function buildRowObject(COL, row) {
  const get = (col) => (row.cells[COL[col]] || '').trim();
  const template = get('template');
  const config = TEMPLATE_CONFIG[template];
  if (!config) return null;
  const slug = get('topic_slug');
  const state = get('state');
  const title = get('title');
  const subtype = get('subtype');
  const obj = {
    row_id: get('row_id'),
    sheet_row: row.sheetRow,
    template,
    route: get('route'),
    topic_slug: slug,
    state,
    title,
    priority: parseInt(get('priority'), 10) || 999,
    demand_score: parseInt(get('demand_score'), 10) || 0,
    status: get('Status'),
    subtype,
    cta_target: get('cta_target'),
    writer_agent: config.agent,
    output_file: `${config.subdir}/${slug}.json`,
    output_file_absolute: path.join(COVERED_USA_ROOT, config.subdir, `${slug}.json`),
  };
  const args = [`TOPIC=${JSON.stringify(title)}`];
  if (state && state !== 'NA' && state !== '') args.push(`STATE=${state}`);
  if (config.extraArg) args.push(config.extraArg);
  if (template === 'qa-x-state' && subtype && subtype !== 'state-eligibility') {
    args[args.length - 1] = `SUBTYPE=${subtype === 'state-eligibility' ? 'qa-state-eligibility' : subtype}`;
  }
  args.push('YEAR=2026');
  obj.writer_args = args.join(' ');
  return obj;
}

function filterAndSort(COL, data) {
  return data
    .map(r => buildRowObject(COL, r))
    .filter(r => r !== null)
    .filter(r => !DEFERRED_TEMPLATES.has(r.template))
    .filter(r => {
      const alreadyLive = (data.find(d => d.sheetRow === r.sheet_row).cells[COL['already_live']] || '').trim();
      return alreadyLive !== 'y' && alreadyLive !== 'Y';
    })
    .filter(r => !r.status || r.status === '')
    .filter(r => !fs.existsSync(r.output_file_absolute))
    .sort((a, b) => a.priority - b.priority || b.demand_score - a.demand_score);
}

async function main() {
  const args = process.argv.slice(2);
  const recovery = args.includes('--recovery');
  const stats = args.includes('--stats');
  const countArg = args.find(a => /^\d+$/.test(a));
  const count = parseInt(countArg || '10', 10);

  const { COL, data } = await getSheet();

  if (stats) {
    // Queue-depth snapshot so the orchestrator can self-regulate volume
    // (write more while the drip-queue buffer is thin, less once it's deep).
    const tally = { Ready: 0, Writing: 0, Published: 0, blank: 0 };
    for (const row of data) {
      const obj = buildRowObject(COL, row);
      if (!obj) continue;
      const s = obj.status || 'blank';
      if (tally[s] === undefined) tally[s] = 0;
      tally[s] += 1;
    }
    const writable = filterAndSort(COL, data).length;
    console.log(JSON.stringify({
      ready_count: tally.Ready || 0,
      writing_count: tally.Writing || 0,
      published_count: tally.Published || 0,
      writable_remaining: writable,
    }, null, 2));
    return;
  }

  if (recovery) {
    const stuck = [];
    for (const row of data) {
      const obj = buildRowObject(COL, row);
      if (!obj) continue;
      if (obj.status === 'Writing' && !fs.existsSync(obj.output_file_absolute)) {
        stuck.push({ row_id: obj.row_id, sheet_row: obj.sheet_row, template: obj.template, output_file: obj.output_file });
      }
    }
    console.log(JSON.stringify({ stuck, total: stuck.length }, null, 2));
    return;
  }

  const filtered = filterAndSort(COL, data);
  const picked = filtered.slice(0, count);
  const byTemplate = {};
  picked.forEach(r => { byTemplate[r.template] = (byTemplate[r.template] || 0) + 1; });

  console.log(JSON.stringify({
    requested: count,
    available: filtered.length,
    picked_count: picked.length,
    repo_root: COVERED_USA_ROOT,
    by_template: byTemplate,
    picked,
  }, null, 2));
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
