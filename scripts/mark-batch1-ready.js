const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: '/Users/jacobposner/clawd/.secrets/google-service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU';
const TAB = 'Master Backlog';

const rows = [
  { sheetRow: 2,  url: 'https://coveredusa.org/en/cost/cataract-surgery' },
  { sheetRow: 4,  url: 'https://coveredusa.org/en/medicare-advantage/north-carolina' },
  { sheetRow: 5,  url: 'https://coveredusa.org/en/medicare-advantage/arizona' },
  { sheetRow: 6,  url: 'https://coveredusa.org/en/medicare-advantage/tennessee' },
  { sheetRow: 7,  url: 'https://coveredusa.org/en/medicare-advantage/new-jersey' },
  { sheetRow: 8,  url: 'https://coveredusa.org/en/medicare-advantage/illinois' },
  { sheetRow: 9,  url: 'https://coveredusa.org/en/medicare-advantage/virginia' },
  { sheetRow: 11, url: 'https://coveredusa.org/en/medicare-advantage/massachusetts' },
];

(async () => {
  const data = rows.map(r => ({
    range: `${TAB}!S${r.sheetRow}:U${r.sheetRow}`,
    values: [['Ready', '', r.url]],
  }));
  const res = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data },
  });
  console.log(`Updated ${res.data.totalUpdatedCells} cells across ${rows.length} rows.`);
})();
