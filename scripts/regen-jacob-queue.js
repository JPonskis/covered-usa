#!/usr/bin/env node
// Regenerate specs/topic-research/JACOB_QUEUE_TOP_50.md from the live Master
// Backlog tab. Markdown is human-readable: top 50 writable P1 rows in
// publish-priority order, with the writer agent name and conventional file
// path inlined for each row.
//
// Filtering matches the "Group 1: Ready to Write" filter view:
//   - excludes deferred templates (persona-x-state, county, carrier-x-state,
//     d-snp, ma-vs-medigap, spanish-twin)
//   - excludes already_live=y
//   - excludes Status in {Published, Writing, Ready}
//
// Sorted by priority asc + demand_score desc, then capped at 50.
//
// Usage: node scripts/regen-jacob-queue.js

const fs = require('fs');
const { google } = require('/Users/jacobposner/clawd/node_modules/googleapis');

const SHEET_ID = '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU';
const SA_KEY = '/Users/jacobposner/clawd/.secrets/google-service-account.json';
const TAB = 'Master Backlog';
const OUT = '/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research/JACOB_QUEUE_TOP_50.md';
const TODAY = '2026-05-15';
const QUEUE_SIZE = 50;

const DEFERRED_TEMPLATES = new Set([
  'persona-x-state',
  'county',
  'carrier-x-state',
  'd-snp',
  'ma-vs-medigap',
  'spanish-twin',
]);
const IN_FLIGHT_STATUS = new Set(['Published', 'Writing', 'Ready']);

// template -> { agent, file_dir, file_ext }
// file path is `${file_dir}/${slug}${file_ext}` unless overridden.
const TEMPLATE_MAP = {
  procedure:      { agent: 'coveredusa-procedure-writer', dir: 'content/data/procedures' },
  drug:           { agent: 'coveredusa-drug-writer',      dir: 'content/data/drugs' },
  persona:        { agent: 'coveredusa-persona-writer',   dir: 'content/data/personas' },
  event:          { agent: 'coveredusa-event-writer',     dir: 'content/data/events' },
  'event-x-state':{ agent: 'coveredusa-event-writer',     dir: 'content/data/events' },
  qa:             { agent: 'coveredusa-qa-writer',        dir: 'content/data/qa' },
  'qa-x-state':   { agent: 'coveredusa-qa-writer',        dir: 'content/data/qa' },
  glossary:       { agent: 'coveredusa-glossary-writer',  dir: 'content/data/glossary' },
  'ma-state':     { agent: 'coveredusa-ma-state-writer',  dir: 'content/data/medicare-advantage' },
  'track-d':      { agent: 'coveredusa-track-d-writer',   dir: 'content/data/medicaid-income-limits' },
};

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan',
  MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
  WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

function deriveSpawnArgs(row) {
  const { template, slug, state, title } = row;
  const stateName = state && STATE_NAMES[state] ? STATE_NAMES[state] : state || '';
  if (template === 'track-d') {
    return `TOPIC="${stateName} Medicaid" STATE=${state} YEAR=2026`;
  }
  if (template === 'ma-state') {
    return `TOPIC="${stateName}" STATE=${state} YEAR=2026`;
  }
  if (template === 'qa-x-state') {
    return `TOPIC="${title}" STATE=${state} SUBTYPE=qa-state-eligibility YEAR=2026`;
  }
  if (template === 'qa') {
    return `TOPIC="${title}" YEAR=2026`;
  }
  if (template === 'event-x-state') {
    return `TOPIC="${title}" STATE=${state} YEAR=2026`;
  }
  return `TOPIC="${title}" YEAR=2026`;
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SA_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log(`Reading ${TAB}...`);
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${TAB}!A2:U`,
  });
  const raw = resp.data.values || [];
  console.log(`  ${raw.length} data rows pulled`);

  // Parse + filter
  const rows = raw.map(r => ({
    row_id: r[0] || '',
    template: r[1] || '',
    route: r[2] || '',
    slug: r[3] || '',
    state: (r[4] || '').trim(),
    title: r[5] || '',
    priority: parseInt(r[6] || '99', 10),
    demand_score: parseInt(r[7] || '0', 10),
    already_live: (r[13] || '').trim(),
    status: (r[18] || '').trim(),
  }));

  const writable = rows.filter(r =>
    !DEFERRED_TEMPLATES.has(r.template) &&
    r.already_live !== 'y' &&
    !IN_FLIGHT_STATUS.has(r.status)
  );
  console.log(`  ${writable.length} writable rows after Group 1 filter`);

  // Only P1 for the queue
  const p1 = writable.filter(r => r.priority === 1);
  console.log(`  ${p1.length} P1 rows (eligible for queue)`);

  // Sort by priority asc + demand desc and cap
  p1.sort((a, b) => a.priority - b.priority || b.demand_score - a.demand_score);
  const queue = p1.slice(0, QUEUE_SIZE);

  // Group breakdown across the whole writable set + within the top 50
  const writableTplCounts = {};
  for (const r of writable) writableTplCounts[r.template] = (writableTplCounts[r.template] || 0) + 1;
  const queueTplCounts = {};
  for (const r of queue) queueTplCounts[r.template] = (queueTplCounts[r.template] || 0) + 1;

  // Build the markdown
  const lines = [];
  lines.push('# Jacob Queue — Top 50 P1');
  lines.push('');
  lines.push(`**Auto-generated:** ${TODAY}`);
  lines.push(`**Source:** Master Backlog tab (live), filtered to "Group 1: Ready to Write" + priority=1, sorted by priority asc + demand_score desc.`);
  lines.push(`**Regenerate:** \`node scripts/regen-jacob-queue.js\``);
  lines.push('');
  lines.push(`Of **${writable.length}** writable rows in Group 1, **${p1.length}** are P1.  ` +
             `This file lists the top **${queue.length}** of those.`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Templates in this queue');
  lines.push('');
  Object.entries(queueTplCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tpl, n]) => {
      const total = writableTplCounts[tpl] || 0;
      lines.push(`- \`${tpl}\` — **${n}** in this top-50 (out of ${total} writable in Group 1)`);
    });
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## The next 50 pages to write');
  lines.push('');
  lines.push('Each line is one page. Pick from the top, spawn the writer with the listed args, file lands at the listed path, mark Master Backlog Status=Ready.');
  lines.push('');

  for (const row of queue) {
    const map = TEMPLATE_MAP[row.template];
    if (!map) {
      lines.push(`- **${row.row_id}** | \`${row.template}\` | \`${row.route}\` | priority=${row.priority}, demand=${row.demand_score} | **NO WRITER MAPPING — skip**`);
      continue;
    }
    const filePath = `${map.dir}/${row.slug}.json`;
    const args = deriveSpawnArgs(row);
    lines.push(
      `- **${row.row_id}** | \`${row.template}\` | \`${row.route}\` | ` +
      `priority=${row.priority}, demand=${row.demand_score} | ` +
      `writer: \`${map.agent}\` | file: \`${filePath}\` | ${args}`
    );
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## How to use this queue');
  lines.push('');
  lines.push('1. **Pick the top row** that has not been started yet. The list is already sorted by priority + demand.');
  lines.push('2. **Spawn the writer agent** named in the `writer:` field. Pass the args at the end of the line as the agent input.');
  lines.push('3. **The writer creates the JSON file** at the `file:` path. The verifier runs auto-fixes per the 2026-05-15 editor-mode cron rewrite (numeric drift, structural detect-only, prose regen on MEDIUM+ flags).');
  lines.push('4. **Mark the Master Backlog row Status=Ready** (column S) so the daily 2am UTC drip cron picks it up.');
  lines.push('5. **The cron ships it** automatically: git push → Vercel deploy → IndexNow ping → Status flips to Published with PublishedDate + PublishedURL stamped.');
  lines.push('');
  lines.push('See `JACOB_WORKFLOW.md` in this directory for the full workflow + per-template details + troubleshooting.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`*Re-run \`node scripts/regen-jacob-queue.js\` at any time to refresh this list. Recommended cadence: weekly, or after publishing any large batch.*`);
  lines.push('');

  fs.writeFileSync(OUT, lines.join('\n'));
  console.log(`\nWrote ${OUT}`);
  console.log(`Queue size: ${queue.length}`);
}

main().catch(e => {
  console.error('FATAL:', e.message);
  if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
  process.exit(1);
});
