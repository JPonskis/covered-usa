#!/usr/bin/env node
// Mark migrated SEO Ideas rows as "Duplicate" + append migration note.
//
// Reads DELETE_FROM_SHEET.csv (sheet_row, sheet_id, target_template, target_route, ...).
// For each row, batch-updates the SEO Ideas sheet:
//   - Status (column M, index 12)  -> "Duplicate"
//   - Notes  (column N, index 13)  -> existing notes + " | Migrated to template: <tmpl> at <route> on 2026-05-15."
//                                     (or just the migration note if cell was empty)
//
// Strategy: pull existing values for the affected rows so we can append (not clobber) the Notes column.
// One values.batchUpdate call sends all 85 ranges.
//
// Usage: node scripts/mark-sheet-duplicates.js [--dry-run]

const fs = require('fs');
const { google } = require('/Users/jacobposner/clawd/node_modules/googleapis');

const SHEET_ID = '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU';
const SA_KEY = '/Users/jacobposner/clawd/.secrets/google-service-account.json';
const TAB = 'SEO Ideas';
const SRC = '/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/DELETE_FROM_SHEET.csv';
const DRY = process.argv.includes('--dry-run');
const TODAY = '2026-05-15';

function parseCSV(str) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (inQuotes) {
      if (c === '"') {
        if (str[i+1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else cell += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (c === '\r') {}
      else cell += c;
    }
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function loadDeletes() {
  const txt = fs.readFileSync(SRC, 'utf8');
  const rows = parseCSV(txt).filter(r => r.length > 1 || (r[0] && r[0].trim()));
  const headers = rows[0];
  const idx = {};
  headers.forEach((h, i) => { idx[h] = i; });
  return rows.slice(1).map(r => ({
    sheet_row: parseInt(r[idx.sheet_row], 10),
    sheet_id: r[idx.sheet_id],
    sheet_title: r[idx.sheet_title],
    target_template: r[idx.target_template] || '(none)',
    target_route: r[idx.target_route] || '(none)',
  }));
}

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SA_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function main() {
  const items = loadDeletes();
  console.log(`Loaded ${items.length} rows to mark as Duplicate.`);
  if (items.length !== 85) {
    console.warn(`[WARN] Expected 85 rows, got ${items.length}. Continuing.`);
  }

  // Sanity: dedupe by sheet_row (first occurrence wins)
  const seen = new Set();
  const unique = [];
  for (const it of items) {
    if (!seen.has(it.sheet_row)) {
      seen.add(it.sheet_row);
      unique.push(it);
    } else {
      console.warn(`[WARN] Duplicate sheet_row ${it.sheet_row} (${it.sheet_id}); skipping second occurrence.`);
    }
  }
  console.log(`After dedupe: ${unique.length} unique rows.`);

  const sheets = await getSheets();

  // Step A: pull current Status + Notes for each row in one batch
  console.log(`[A] Pulling existing Status + Notes for ${unique.length} rows...`);
  const ranges = unique.map(it => `${TAB}!A${it.sheet_row}:N${it.sheet_row}`);
  const pull = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SHEET_ID,
    ranges,
  });
  const valueRanges = pull.data.valueRanges || [];

  // Build update payload
  const updates = [];
  const log = [];
  for (let i = 0; i < unique.length; i++) {
    const it = unique[i];
    const vr = valueRanges[i];
    const row = (vr && vr.values && vr.values[0]) || [];
    const currentId = (row[0] || '').trim();
    const currentStatus = (row[12] || '').trim();
    const currentNotes = (row[13] || '').trim();

    if (currentId !== it.sheet_id) {
      console.warn(`[WARN] row ${it.sheet_row}: expected ID=${it.sheet_id}, sheet has "${currentId}". Skipping (data drift).`);
      log.push({ ...it, skipped: true, reason: `id mismatch (sheet has "${currentId}")` });
      continue;
    }

    const migrationNote = `Migrated to template: ${it.target_template} at ${it.target_route} on ${TODAY}.`;
    const newNotes = currentNotes
      ? `${currentNotes} | ${migrationNote}`
      : migrationNote;

    // Update Status (M) and Notes (N) only — single 1x2 range per row.
    updates.push({
      range: `${TAB}!M${it.sheet_row}:N${it.sheet_row}`,
      values: [[ 'Duplicate', newNotes ]],
    });
    log.push({ ...it, prevStatus: currentStatus, prevNotes: currentNotes, newNotes });
  }

  console.log(`[B] Prepared ${updates.length} updates (skipped ${unique.length - updates.length}).`);

  if (DRY) {
    console.log('--- DRY RUN: not writing ---');
    console.log(JSON.stringify(updates.slice(0, 3), null, 2));
    return;
  }

  // Step B: batchUpdate all ranges in one call
  console.log(`[C] Sending values.batchUpdate (${updates.length} ranges)...`);
  const res = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates,
    },
  });
  console.log(`    totalUpdatedCells=${res.data.totalUpdatedCells}, totalUpdatedRanges=${res.data.totalUpdatedRanges}`);

  // Step C: spot-check CU-016, CU-027, CU-005
  console.log(`\n[D] Spot-checks:`);
  const spot = unique.filter(it => ['CU-016', 'CU-027', 'CU-005'].includes(it.sheet_id));
  for (const it of spot) {
    const r = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${TAB}!A${it.sheet_row}:N${it.sheet_row}`,
    });
    const row = (r.data.values && r.data.values[0]) || [];
    console.log(`  ${it.sheet_id} (row ${it.sheet_row}): Status="${row[12]}" Notes="${(row[13] || '').slice(0, 100)}"`);
  }

  // Step D: count total Duplicate rows in sheet
  console.log(`\n[E] Counting all Status=Duplicate rows in ${TAB}...`);
  const all = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${TAB}!M:M`,
  });
  const allValues = all.data.values || [];
  const dupCount = allValues.slice(1).filter(r => (r[0] || '').trim() === 'Duplicate').length;
  console.log(`    Total rows with Status=Duplicate: ${dupCount}`);

  // Persist log for the report
  const LOG_OUT = '/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/sheet-mark-log.json';
  fs.writeFileSync(LOG_OUT, JSON.stringify({
    ran_at: new Date().toISOString(),
    total_marked: updates.length,
    skipped: unique.length - updates.length,
    total_dup_in_sheet: dupCount,
    detail: log,
  }, null, 2));
  console.log(`    Log written: ${LOG_OUT}`);
}

main().catch(e => {
  console.error('FATAL:', e.message);
  if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
  process.exit(1);
});
