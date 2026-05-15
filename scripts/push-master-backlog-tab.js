#!/usr/bin/env node
// Push MASTER_BACKLOG.csv to a new "Master Backlog" tab on the CoveredUSA Sheet.
//
// Steps:
//   1. Create new tab "Master Backlog" (light blue tab color) via batchUpdate.
//   2. Read MASTER_BACKLOG.csv (header + 2,344 data rows = 2,345 lines).
//   3. Write all rows to the new tab starting at A1 via values.update.
//   4. Format the header row as bold + frozen via batchUpdate (repeatCell + updateSheetProperties).
//   5. Verify row count by reading back via values.get.
//
// Usage: node scripts/push-master-backlog-tab.js

const fs = require('fs');
const path = require('path');
const { google } = require('/Users/jacobposner/clawd/node_modules/googleapis');

const SHEET_ID = '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU';
const SA_KEY = '/Users/jacobposner/clawd/.secrets/google-service-account.json';
const TAB_NAME = 'Master Backlog';
const SRC_CSV = '/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/MASTER_BACKLOG.csv';

// Robust CSV parser
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

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SA_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function main() {
  const sheets = await getSheets();

  // Step 0: check if tab already exists
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existing = meta.data.sheets.find(s => s.properties.title === TAB_NAME);
  let sheetId;
  if (existing) {
    console.log(`[!] Tab "${TAB_NAME}" already exists with sheetId=${existing.properties.sheetId}. Will reuse + clear.`);
    sheetId = existing.properties.sheetId;
    // Clear contents
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: `${TAB_NAME}!A1:ZZZ`,
    });
  } else {
    // Step 1: create the new tab with light blue color + 30 columns
    console.log(`[1] Creating tab "${TAB_NAME}"...`);
    const addRes = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: TAB_NAME,
              tabColor: { red: 0.6, green: 0.8, blue: 1.0 }, // light blue
              gridProperties: { rowCount: 2400, columnCount: 30 },
            },
          },
        }],
      },
    });
    sheetId = addRes.data.replies[0].addSheet.properties.sheetId;
    console.log(`    sheetId=${sheetId}`);
  }

  // Step 2: read CSV
  console.log(`[2] Reading ${SRC_CSV}...`);
  const txt = fs.readFileSync(SRC_CSV, 'utf8');
  const rows = parseCSV(txt).filter(r => r.length > 1 || (r[0] && r[0].trim()));
  console.log(`    ${rows.length} total lines (header + ${rows.length - 1} data rows)`);
  if (rows.length !== 2345) {
    console.warn(`    [WARN] Expected 2345 lines, got ${rows.length}. Continuing anyway.`);
  }

  // Step 3: write all rows
  console.log(`[3] Writing ${rows.length} rows to ${TAB_NAME}!A1...`);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${TAB_NAME}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
  console.log(`    OK`);

  // Step 4: format header row bold + freeze
  console.log(`[4] Formatting header (bold + frozen)...`);
  const numCols = rows[0].length;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: numCols,
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
                backgroundColor: { red: 0.93, green: 0.95, blue: 0.99 },
              },
            },
            fields: 'userEnteredFormat(textFormat,backgroundColor)',
          },
        },
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              gridProperties: { frozenRowCount: 1 },
            },
            fields: 'gridProperties.frozenRowCount',
          },
        },
      ],
    },
  });
  console.log(`    OK`);

  // Step 5: verify by reading back
  console.log(`[5] Verifying via values.get...`);
  const verify = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${TAB_NAME}!A:A`,
  });
  const verifyRows = verify.data.values || [];
  console.log(`    Read back ${verifyRows.length} rows in column A (header + ${verifyRows.length - 1} data rows)`);

  // Build URL
  const tabUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=${sheetId}`;
  console.log(`\nDONE. Tab URL: ${tabUrl}`);
  console.log(`Data row count: ${verifyRows.length - 1}`);
}

main().catch(e => {
  console.error('FATAL:', e.message);
  if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
  process.exit(1);
});
