const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({ keyFile: '/Users/jacobposner/clawd/.secrets/google-service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU';
const TAB = 'Master Backlog';
const rows = [
  { sheetRow: 32, url: 'https://coveredusa.org/en/cost/ivf-north-carolina' },
  { sheetRow: 33, url: 'https://coveredusa.org/en/cost/ivf-south-carolina' },
  { sheetRow: 34, url: 'https://coveredusa.org/en/cost/ivf-tennessee' },
  { sheetRow: 35, url: 'https://coveredusa.org/en/cost/ivf-virginia' },
  { sheetRow: 36, url: 'https://coveredusa.org/en/cost/ivf-west-virginia' },
  { sheetRow: 37, url: 'https://coveredusa.org/en/qa/does-medicare-cover-ozempic' },
  { sheetRow: 38, url: 'https://coveredusa.org/en/qa/aca-marketplace-subsidy-eligibility-2026' },
  { sheetRow: 39, url: 'https://coveredusa.org/en/qa/state-pharmaceutical-assistance-programs' },
  { sheetRow: 40, url: 'https://coveredusa.org/en/glossary/hmo-vs-ppo-vs-epo-vs-pos' },
  { sheetRow: 41, url: 'https://coveredusa.org/en/qa/obamacare-still-available-2026' },
];
(async () => {
  const data = rows.map(r => ({ range: `${TAB}!S${r.sheetRow}:U${r.sheetRow}`, values: [['Ready', '', r.url]] }));
  const res = await sheets.spreadsheets.values.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { valueInputOption: 'USER_ENTERED', data } });
  console.log(`Updated ${res.data.totalUpdatedCells} cells across ${rows.length} rows.`);
})();
