const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({ keyFile: '/Users/jacobposner/clawd/.secrets/google-service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU';
const TAB = 'Master Backlog';
const rows = [
  { sheetRow: 42, url: 'https://coveredusa.org/en/qa/does-medicare-cover-hearing-aids' },
  { sheetRow: 43, url: 'https://coveredusa.org/en/qa/does-medicare-cover-wegovy' },
  { sheetRow: 44, url: 'https://coveredusa.org/en/cost/dexa-scan' },
  { sheetRow: 45, url: 'https://coveredusa.org/en/glossary/epo-vs-ppo' },
  { sheetRow: 46, url: 'https://coveredusa.org/en/glossary/in-network-vs-out-of-network-coinsurance' },
  { sheetRow: 47, url: 'https://coveredusa.org/en/cost/wisdom-teeth-removal' },
  { sheetRow: 48, url: 'https://coveredusa.org/en/glossary/copay-deductible-coinsurance' },
  { sheetRow: 49, url: 'https://coveredusa.org/en/qa/does-medicare-cover-glp1-weight-loss' },
  { sheetRow: 50, url: 'https://coveredusa.org/en/qa/does-medicare-cover-mental-health' },
  { sheetRow: 51, url: 'https://coveredusa.org/en/qa/does-medicaid-cover-nursing-home' },
];
(async () => {
  const data = rows.map(r => ({ range: `${TAB}!S${r.sheetRow}:U${r.sheetRow}`, values: [['Ready', '', r.url]] }));
  const res = await sheets.spreadsheets.values.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { valueInputOption: 'USER_ENTERED', data } });
  console.log(`Updated ${res.data.totalUpdatedCells} cells across ${rows.length} rows.`);
})();
