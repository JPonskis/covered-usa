const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: '/Users/jacobposner/clawd/.secrets/google-service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU';
const TAB = 'Master Backlog';

// Batch 2 rows MB-0011..MB-0020 = sheet rows 12..21
const rows = [
  { sheetRow: 12, url: 'https://coveredusa.org/en/medicare-advantage/washington' },
  { sheetRow: 13, url: 'https://coveredusa.org/en/medicare-advantage/indiana' },
  { sheetRow: 14, url: 'https://coveredusa.org/en/medicare-advantage/south-carolina' },
  { sheetRow: 15, url: 'https://coveredusa.org/en/medicare-advantage/alabama' },
  { sheetRow: 16, url: 'https://coveredusa.org/en/medicare-advantage/kentucky' },
  { sheetRow: 17, url: 'https://coveredusa.org/en/medicare-advantage/louisiana' },
  { sheetRow: 18, url: 'https://coveredusa.org/en/cost/eye-exam' },
  { sheetRow: 19, url: 'https://coveredusa.org/en/medicare-advantage/arkansas' },
  { sheetRow: 20, url: 'https://coveredusa.org/en/medicare-advantage/mississippi' },
  { sheetRow: 21, url: 'https://coveredusa.org/en/qa/extra-help-eligibility-2026' },
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
