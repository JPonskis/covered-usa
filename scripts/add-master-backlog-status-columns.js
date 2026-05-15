#!/usr/bin/env node
// Add Status / PublishedDate / PublishedURL columns (S, T, U) to the
// "Master Backlog" tab on the CoveredUSA Sheet.
//
// Existing tab columns A-R (18). This script writes headers to S1, T1, U1
// and applies the same bold + light-blue header formatting used in
// push-master-backlog-tab.js so the new headers blend in.
//
// Idempotent: if S1/T1/U1 are already set to the expected headers, no write.
//
// Usage: node scripts/add-master-backlog-status-columns.js [--dry-run]

const { google } = require('/Users/jacobposner/clawd/node_modules/googleapis');

const SHEET_ID = '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU';
const SA_KEY = '/Users/jacobposner/clawd/.secrets/google-service-account.json';
const TAB = 'Master Backlog';
const HEADERS = ['Status', 'PublishedDate', 'PublishedURL'];
const HEADER_RANGE = `${TAB}!S1:U1`;
const DRY = process.argv.includes('--dry-run');

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SA_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function main() {
  const sheets = await getSheets();

  // Locate the tab's sheetId so we can format S1:U1.
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const tab = meta.data.sheets.find(s => s.properties.title === TAB);
  if (!tab) throw new Error(`Tab "${TAB}" not found.`);
  const sheetId = tab.properties.sheetId;
  const colCount = tab.properties.gridProperties.columnCount;
  console.log(`Found tab "${TAB}" sheetId=${sheetId} columnCount=${colCount}`);

  // Make sure the grid actually has columns S/T/U (21).
  if (colCount < 21) {
    console.log(`[!] Grid has ${colCount} columns, need >=21. Resizing to 30.`);
    if (!DRY) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            updateSheetProperties: {
              properties: { sheetId, gridProperties: { columnCount: 30 } },
              fields: 'gridProperties.columnCount',
            },
          }],
        },
      });
    }
  }

  // Read current S1:U1 to keep this idempotent.
  const cur = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: HEADER_RANGE,
  });
  const curRow = (cur.data.values && cur.data.values[0]) || [];
  const same = HEADERS.every((h, i) => (curRow[i] || '') === h);
  if (same) {
    console.log(`[=] Headers already in place at ${HEADER_RANGE}: ${HEADERS.join(', ')}. Nothing to do.`);
  } else {
    console.log(`[1] Writing headers to ${HEADER_RANGE}: ${HEADERS.join(', ')}`);
    if (!DRY) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: HEADER_RANGE,
        valueInputOption: 'RAW',
        requestBody: { values: [HEADERS] },
      });
    }
  }

  // Apply bold + light-blue background formatting (same as A1:R1).
  console.log(`[2] Formatting ${HEADER_RANGE} (bold + light-blue bg)...`);
  if (!DRY) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 18, // S = column index 18 (0-based)
              endColumnIndex: 21,   // U+1
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
                backgroundColor: { red: 0.93, green: 0.95, blue: 0.99 },
              },
            },
            fields: 'userEnteredFormat(textFormat,backgroundColor)',
          },
        }],
      },
    });
  }

  // Verify
  console.log(`[3] Verifying...`);
  const verify = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: HEADER_RANGE,
  });
  const v = (verify.data.values && verify.data.values[0]) || [];
  console.log(`    ${HEADER_RANGE} = [${v.map(x => `"${x}"`).join(', ')}]`);

  const tabUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=${sheetId}`;
  console.log(`\nDONE. ${DRY ? '(dry-run, no writes)' : 'Headers added.'} Tab URL: ${tabUrl}`);
}

main().catch(e => {
  console.error('FATAL:', e.message);
  if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
  process.exit(1);
});
