#!/usr/bin/env node
// Create (or update) three Filter Views on the "Master Backlog" tab to make it
// dead-simple for Jacob to scan the queue.
//
// Filter Views:
//   1. "Group 1: Ready to Write"
//        - Excludes templates that need new code (persona-x-state, county,
//          carrier-x-state, d-snp, ma-vs-medigap, spanish-twin)
//        - Excludes already_live=y rows
//        - Excludes Status=Published / Writing / Ready (already in flight or shipped)
//        - Sort: priority asc, demand_score desc
//
//   2. "Top 50 P1"
//        - priority=1, all writable templates
//        - Sort: priority asc, demand_score desc
//        - (the user uses this to grab the literal next 50 P1s; Sheets filter
//           views don't have a row-count cap, so the "Top 50" is just the first
//           50 visible rows)
//
//   3. "Southeast P1"
//        - state ∈ {GA, NC, TN, VA, FL, AL, MS, SC, LA, AR, KY, WV} AND priority=1
//        - Sort: demand_score desc
//
// Re-runnable: detects existing filter views by title and deletes-then-recreates
// rather than duplicating.
//
// Usage: node scripts/create-master-backlog-filter-views.js

const { google } = require('/Users/jacobposner/clawd/node_modules/googleapis');

const SHEET_ID = '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU';
const SA_KEY = '/Users/jacobposner/clawd/.secrets/google-service-account.json';
const TAB_NAME = 'Master Backlog';

// Master Backlog column indexes (0-based)
const COL = {
  row_id: 0,           // A
  template: 1,         // B
  route: 2,            // C
  topic_slug: 3,       // D
  state: 4,            // E
  title: 5,            // F
  priority: 6,         // G
  demand_score: 7,     // H
  competitor_density: 8, // I
  busa_overlap: 9,     // J
  cta_target: 10,      // K
  subtype: 11,         // L
  topic_type: 12,      // M
  already_live: 13,    // N
  migrated_from_sheet: 14, // O
  sheet_row_id: 15,    // P
  sources: 16,         // Q
  notes: 17,           // R
  Status: 18,          // S
  PublishedDate: 19,   // T
  PublishedURL: 20,    // U
};

// Templates that need brand-new code/routes/agents (Phase 5 backlog).
// Track-d agent is being built by a parallel session, so include track-d in the
// pickable queue.
const DEFERRED_TEMPLATES = [
  'persona-x-state',
  'county',
  'carrier-x-state',
  'd-snp',
  'ma-vs-medigap',
  'spanish-twin',
];

const SE_STATES = ['GA', 'NC', 'TN', 'VA', 'FL', 'AL', 'MS', 'SC', 'LA', 'AR', 'KY', 'WV'];

const FILTER_TITLES = {
  GROUP1: 'Group 1: Ready to Write',
  TOP_P1: 'Top 50 P1',
  SE_P1:  'Southeast P1',
};

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SA_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// Build a "exclude these literal values" filter criterion using hiddenValues.
function hiddenValues(values) {
  return { hiddenValues: values };
}

// Build a "value is empty OR in this list" filter using a custom formula won't
// help here — hiddenValues is the cleanest way to *exclude*. To *include* a
// list of values, we hide everything else via custom formula.
function customFormulaInclude(formula) {
  return { condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: formula }] } };
}

function customFormulaCriterion(formula) {
  return { condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: formula }] } };
}

// Build the "Group 1: Ready to Write" filter view spec.
// Range: A:U on the Master Backlog tab; sheet_id resolved at runtime.
function buildGroup1FilterView(masterSheetId) {
  return {
    title: FILTER_TITLES.GROUP1,
    range: {
      sheetId: masterSheetId,
      startRowIndex: 0,
      endRowIndex: 2345,
      startColumnIndex: 0,
      endColumnIndex: 21,
    },
    sortSpecs: [
      { dimensionIndex: COL.priority, sortOrder: 'ASCENDING' },
      { dimensionIndex: COL.demand_score, sortOrder: 'DESCENDING' },
    ],
    criteria: {
      // Hide deferred templates
      [COL.template]: hiddenValues(DEFERRED_TEMPLATES),
      // Hide already_live=y
      [COL.already_live]: hiddenValues(['y']),
      // Hide rows that are already shipped or in-flight (Status in
      // {Published, Writing, Ready}). Status column may be blank for fresh rows.
      [COL.Status]: hiddenValues(['Published', 'Writing', 'Ready']),
    },
  };
}

function buildTop50P1FilterView(masterSheetId) {
  return {
    title: FILTER_TITLES.TOP_P1,
    range: {
      sheetId: masterSheetId,
      startRowIndex: 0,
      endRowIndex: 2345,
      startColumnIndex: 0,
      endColumnIndex: 21,
    },
    sortSpecs: [
      { dimensionIndex: COL.priority, sortOrder: 'ASCENDING' },
      { dimensionIndex: COL.demand_score, sortOrder: 'DESCENDING' },
    ],
    criteria: {
      // Only priority=1
      [COL.priority]: customFormulaCriterion('=$G2=1'),
      // Hide deferred templates
      [COL.template]: hiddenValues(DEFERRED_TEMPLATES),
      // Hide already_live=y
      [COL.already_live]: hiddenValues(['y']),
      // Hide already-shipped / in-flight
      [COL.Status]: hiddenValues(['Published', 'Writing', 'Ready']),
    },
  };
}

function buildSoutheastP1FilterView(masterSheetId) {
  // For state inclusion we use a custom formula — exclude all other state
  // values via hiddenValues would need every non-SE state listed. Easier:
  // custom formula on the state column itself.
  // Custom formulas in basic filters reference $E2 (the row's state cell).
  const stateFormula = `=AND($G2=1, OR(${SE_STATES.map(s => `$E2="${s}"`).join(', ')}))`;
  return {
    title: FILTER_TITLES.SE_P1,
    range: {
      sheetId: masterSheetId,
      startRowIndex: 0,
      endRowIndex: 2345,
      startColumnIndex: 0,
      endColumnIndex: 21,
    },
    sortSpecs: [
      { dimensionIndex: COL.demand_score, sortOrder: 'DESCENDING' },
    ],
    criteria: {
      // Single custom-formula criterion on column G is enough; Sheets evaluates
      // the formula per row.
      [COL.priority]: customFormulaCriterion(stateFormula),
      // Hide deferred templates + shipped rows defensively
      [COL.template]: hiddenValues(DEFERRED_TEMPLATES),
      [COL.already_live]: hiddenValues(['y']),
      [COL.Status]: hiddenValues(['Published', 'Writing', 'Ready']),
    },
  };
}

async function main() {
  const sheets = await getSheets();

  // Resolve master backlog sheet_id and pull existing filter views
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    fields: 'sheets(properties(sheetId,title),filterViews(filterViewId,title))',
  });
  const masterTab = meta.data.sheets.find(s => s.properties.title === TAB_NAME);
  if (!masterTab) {
    throw new Error(`Tab "${TAB_NAME}" not found.`);
  }
  const masterSheetId = masterTab.properties.sheetId;
  console.log(`[1] Master Backlog sheetId=${masterSheetId}`);

  const existingViews = masterTab.filterViews || [];
  console.log(`[2] Existing filter views on tab: ${existingViews.length}`);
  existingViews.forEach(fv => console.log(`    - "${fv.title}" (id=${fv.filterViewId})`));

  // Detect ones we manage
  const managedTitles = new Set(Object.values(FILTER_TITLES));
  const toDelete = existingViews.filter(fv => managedTitles.has(fv.title));
  const requests = [];

  // Step A: delete any of our managed views (if they already exist) so we can
  // re-add cleanly. Sheets API does not have a clean "update" for filter
  // views — easier to delete + add.
  for (const fv of toDelete) {
    requests.push({
      deleteFilterView: { filterId: fv.filterViewId },
    });
  }
  if (toDelete.length) {
    console.log(`[3] Will replace ${toDelete.length} managed filter view(s).`);
  }

  // Step B: add the three filter views
  const specs = [
    buildGroup1FilterView(masterSheetId),
    buildTop50P1FilterView(masterSheetId),
    buildSoutheastP1FilterView(masterSheetId),
  ];
  for (const spec of specs) {
    requests.push({
      addFilterView: { filter: spec },
    });
  }

  console.log(`[4] Sending batchUpdate with ${requests.length} request(s)...`);
  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests },
    fields: 'replies',
  });

  // Pull back the created filter view IDs
  const created = (res.data.replies || [])
    .map(r => r.addFilterView)
    .filter(Boolean)
    .map(x => x.filter);

  console.log(`\n[5] Created ${created.length} filter view(s):`);
  created.forEach(fv => {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=${masterSheetId}&fvid=${fv.filterViewId}`;
    console.log(`   - "${fv.title}" (id=${fv.filterViewId})`);
    console.log(`     ${url}`);
  });

  console.log('\nDONE.');
}

main().catch(e => {
  console.error('FATAL:', e.message);
  if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
  process.exit(1);
});
