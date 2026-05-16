const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: '/Users/jacobposner/clawd/.secrets/google-service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU';
const TAB = 'Master Backlog';
const rows = [
  { sheetRow: 22, url: 'https://coveredusa.org/en/medicare-advantage/west-virginia' },
  { sheetRow: 23, url: 'https://coveredusa.org/en/qa/chip-eligibility-by-state' },
  { sheetRow: 24, url: 'https://coveredusa.org/en/qa/medicare-savings-program-by-state' },
  { sheetRow: 25, url: 'https://coveredusa.org/en/cost/ivf-alabama' },
  { sheetRow: 26, url: 'https://coveredusa.org/en/cost/ivf-arkansas' },
  { sheetRow: 27, url: 'https://coveredusa.org/en/cost/ivf-florida' },
  { sheetRow: 28, url: 'https://coveredusa.org/en/cost/ivf-georgia' },
  { sheetRow: 29, url: 'https://coveredusa.org/en/cost/ivf-kentucky' },
  { sheetRow: 30, url: 'https://coveredusa.org/en/cost/ivf-louisiana' },
  { sheetRow: 31, url: 'https://coveredusa.org/en/cost/ivf-mississippi' },
];
(async () => {
  const data = rows.map(r => ({ range: `${TAB}!S${r.sheetRow}:U${r.sheetRow}`, values: [['Ready', '', r.url]] }));
  const res = await sheets.spreadsheets.values.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { valueInputOption: 'USER_ENTERED', data } });
  console.log(`Updated ${res.data.totalUpdatedCells} cells across ${rows.length} rows.`);
})();
