#!/usr/bin/env node
// coveredusa-batch-update-status.js (CLOUD-PORTABLE)
// Applies a batch of Status (col S) + Notes (col R) updates to the Master Backlog.
// Input: JSON file with [{row_id, sheet_row, status, notes?}, ...]
//
// Auth: GOOGLE_SERVICE_ACCOUNT_JSON (env, cloud) if set, else keyFile at
//   $HOME/clawd/.secrets/google-service-account.json (local), override GOOGLE_SA_KEYFILE.
//
// Usage:
//   node coveredusa-batch-update-status.js /tmp/updates.json
//   node coveredusa-batch-update-status.js --dry-run /tmp/updates.json

const fs = require('fs');
const os = require('os');
const path = require('path');
const { google } = require('googleapis');

const SHEET_ID = '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU';
const TAB = 'Master Backlog';
// row_id=A ... notes=R, Status=S, PublishedDate=T, PublishedURL=U
const STATUS_COL_LETTER = 'S';
const NOTES_COL_LETTER = 'R';

function buildAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (raw && raw.trim()) {
    let creds;
    try { creds = JSON.parse(raw); }
    catch (e) { throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is set but not valid JSON: ' + e.message); }
    return new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }
  const keyFile = process.env.GOOGLE_SA_KEYFILE
    || path.join(os.homedir(), 'clawd', '.secrets', 'google-service-account.json');
  if (!fs.existsSync(keyFile)) {
    throw new Error(`No service-account creds: set GOOGLE_SERVICE_ACCOUNT_JSON or place a key at ${keyFile}`);
  }
  return new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const file = args.find(a => !a.startsWith('--'));
  if (!file) { console.error('Usage: node coveredusa-batch-update-status.js [--dry-run] <updates.json>'); process.exit(1); }
  const updates = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(updates)) { console.error('Updates JSON must be an array'); process.exit(1); }

  const sheets = google.sheets({ version: 'v4', auth: buildAuth() });

  const data = [];
  updates.forEach(u => {
    if (!u.sheet_row) { console.error(`Skipping update without sheet_row: ${JSON.stringify(u)}`); return; }
    if (u.status !== undefined) {
      const value = (u.status === 'blank' || u.status === '') ? '' : u.status;
      data.push({ range: `'${TAB}'!${STATUS_COL_LETTER}${u.sheet_row}`, values: [[value]] });
    }
    if (u.notes) {
      data.push({ range: `'${TAB}'!${NOTES_COL_LETTER}${u.sheet_row}`, values: [[u.notes]] });
    }
  });

  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'APPLY'}`);
  console.log(`Updates queued: ${data.length} cell writes across ${updates.length} rows`);

  if (dryRun) {
    data.slice(0, 10).forEach(d => console.log(`  ${d.range} -> "${d.values[0][0]}"`));
    if (data.length > 10) console.log(`  ... (${data.length - 10} more)`);
    return;
  }

  for (let i = 0; i < data.length; i += 100) {
    const chunk = data.slice(i, i + 100);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'USER_ENTERED', data: chunk },
    });
    console.error(`Wrote chunk ${i / 100 + 1}/${Math.ceil(data.length / 100)}`);
  }
  console.log(`\nApplied ${data.length} cell writes successfully.`);
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
