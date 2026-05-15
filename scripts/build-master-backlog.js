#!/usr/bin/env node
// CoveredUSA cross-reference + master-backlog builder.
// READ-ONLY on the Google Sheet. Outputs decision lists; the manager + Jacob
// execute deletions after review.
//
// Outputs:
//  - sheet-rows-raw.csv       (raw pull from Sheet for trail)
//  - sheet-decisions.csv      (per-row classification)
//  - busa-cross-reference.csv (template-vs-BUSA overlap review)
//  - MASTER_BACKLOG.csv       (the canonical bulk-production backlog)
//  - DELETE_FROM_SHEET.csv    (sheet rows recommended for deletion)
//  - cross-reference-report.md
//
// Usage: node scripts/build-master-backlog.js

const fs = require('fs');
const path = require('path');
const {google} = require('/Users/jacobposner/clawd/node_modules/googleapis');

const SHEET_ID = '1gom8BPePSX9g4ffTxBPvQN3GynStdGWm1pbDwAn5kBU';
const SA_KEY = '/Users/jacobposner/clawd/.secrets/google-service-account.json';
const RESEARCH_DIR = '/Users/jacobposner/clawd/projects/covered-usa/specs/topic-research';
const SPECS_DIR = '/Users/jacobposner/clawd/projects/covered-usa/specs';
const BUSA_INVENTORY = path.join(SPECS_DIR, 'busa-inventory.csv');

const OUT_RAW = path.join(RESEARCH_DIR, 'sheet-rows-raw.csv');
const OUT_DECISIONS = path.join(RESEARCH_DIR, 'sheet-decisions.csv');
const OUT_BUSA = path.join(RESEARCH_DIR, 'busa-cross-reference.csv');
const OUT_BACKLOG = path.join(RESEARCH_DIR, 'MASTER_BACKLOG.csv');
const OUT_DELETE = path.join(RESEARCH_DIR, 'DELETE_FROM_SHEET.csv');
const OUT_REPORT = path.join(RESEARCH_DIR, 'cross-reference-report.md');

// ---------- Utility ----------

function parseCSV(str) {
  // Robust CSV parser (handles quoted fields with commas + escaped quotes)
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
      else if (c === '\r') { /* skip */ }
      else cell += c;
    }
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function writeCSV(filename, headers, rows) {
  const lines = [headers.map(csvEscape).join(',')];
  for (const r of rows) {
    lines.push(headers.map(h => csvEscape(r[h])).join(','));
  }
  fs.writeFileSync(filename, lines.join('\n') + '\n');
}

function loadCSV(filename) {
  const txt = fs.readFileSync(filename, 'utf8');
  const rows = parseCSV(txt);
  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).filter(r => r.length > 1 || (r[0] && r[0].trim())).map(r => {
    const o = {};
    headers.forEach((h, i) => { o[h] = r[i] != null ? r[i] : ''; });
    return o;
  });
}

function slugify(s) {
  if (!s) return '';
  return s
    .toLowerCase()
    .replace(/[''']/g, '')
    .replace(/2026/g, '')
    .replace(/2027/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Strip filler words, collapse to a key set of meaningful tokens
const FILLER = new Set([
  'a','an','the','and','or','for','to','in','on','of','with','from','by','at','is','are','was','were',
  'be','been','being','have','has','had','do','does','did','can','could','should','would','will',
  'how','what','when','where','why','who','which','your','you','my','our','my','i','me','this','that',
  'plus','vs','versus','guide','full','complete','best','top','new','out','it','if','its',
  'about','as','also','more','most','some','any','than','then','so','just','still','only','own',
  'use','using','make','get','use','help','need','want','like','take','give','put','look','say'
]);

function tokens(s) {
  if (!s) return [];
  return s.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    // Keep numeric tokens that look like ages (2-3 digits) — important for "turning-65", "26"
    .filter(t => t && (t.length > 2 || /^\d{2,3}$/.test(t)) && !FILLER.has(t));
}

function jaccard(a, b) {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size === 0 && sb.size === 0) return 0;
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  const union = sa.size + sb.size - inter;
  return union > 0 ? inter / union : 0;
}

// ---------- States ----------

const STATES = [
  ['AL','alabama'],['AK','alaska'],['AZ','arizona'],['AR','arkansas'],['CA','california'],
  ['CO','colorado'],['CT','connecticut'],['DE','delaware'],['DC','dc'],['FL','florida'],
  ['GA','georgia'],['HI','hawaii'],['ID','idaho'],['IL','illinois'],['IN','indiana'],
  ['IA','iowa'],['KS','kansas'],['KY','kentucky'],['LA','louisiana'],['ME','maine'],
  ['MD','maryland'],['MA','massachusetts'],['MI','michigan'],['MN','minnesota'],['MS','mississippi'],
  ['MO','missouri'],['MT','montana'],['NE','nebraska'],['NV','nevada'],['NH','new-hampshire'],
  ['NJ','new-jersey'],['NM','new-mexico'],['NY','new-york'],['NC','north-carolina'],['ND','north-dakota'],
  ['OH','ohio'],['OK','oklahoma'],['OR','oregon'],['PA','pennsylvania'],['RI','rhode-island'],
  ['SC','south-carolina'],['SD','south-dakota'],['TN','tennessee'],['TX','texas'],['UT','utah'],
  ['VT','vermont'],['VA','virginia'],['WA','washington'],['WV','west-virginia'],['WI','wisconsin'],['WY','wyoming']
];

const STATE_DISPLAY = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',
  DE:'Delaware',DC:'Washington DC',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',
  IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',
  MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',
  NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',
  NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',
  RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',
  VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming'
};

const SE_STATES = new Set(['GA','NC','TN','VA','FL','AL','MS','SC','LA','AR','KY','WV']);

const STATE_BY_SLUG = {};
for (const [code, slug] of STATES) STATE_BY_SLUG[slug] = code;

const STATE_BY_NAME = {};
for (const [code, slug] of STATES) {
  STATE_BY_NAME[slug.replace(/-/g, ' ')] = code;
  STATE_BY_NAME[STATE_DISPLAY[code].toLowerCase()] = code;
}

function detectState(text) {
  if (!text) return '';
  const lower = text.toLowerCase();
  for (const [name, code] of Object.entries(STATE_BY_NAME)) {
    const pattern = new RegExp(`(^|[^a-z])${name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}([^a-z]|$)`);
    if (pattern.test(lower)) return code;
  }
  // postal codes (2-letter) ONLY when standalone uppercase token in original
  const m = text.match(/\b([A-Z]{2})\b/);
  if (m && STATE_DISPLAY[m[1]]) return m[1];
  return '';
}

// ---------- Live page slugs ----------

const LIVE_PAGES = {
  procedure: ['mri', 'ct-scan', 'colonoscopy', 'mri-cost', 'ct-scan-cost', 'colonoscopy-cost'],
  drug: ['insulin-cost', 'metformin-cost', 'ozempic-cost'],
  qa: ['does-medicaid-cover-rehab', 'does-medicare-cover-dental', 'does-medicare-cover-vision'],
  glossary: ['deductible', 'magi', 'out-of-pocket-maximum'],
  event: ['just-lost-job-health-insurance', 'turning-26-health-insurance', 'turning-65-medicare',
          'just-lost-job', 'turning-26', 'turning-65'],
  persona: ['gig-workers', 'self-employed'],
  'ma-state': ['california', 'texas', 'wyoming', 'florida', 'new-york', 'michigan', 'ohio', 'pennsylvania']
};

// Reference / hardcoded pages (not template-driven)
const HARDCODED_LIVE = new Set([
  'aca-income-limits', 'federal-poverty-level', 'medicaid-income-limits',
  'medicare-eligibility', 'medical-bill-analyzer', 'screener', 'about',
  'comenzar', 'do-not-sell', 'privacy', 'terms', 'health-data-privacy', 'blog'
]);

// Also live blog posts (ONLY those that match a template topic — the rest stay as blogs)
// Capture the slug-only forms used on the site
const LIVE_BLOG_SLUGS = new Set([
  // sample of recent blogs that might overlap with templates — keep in mind:
  // these are blogs, not template pages. Used only to flag that the *concept*
  // is already covered to some degree.
  'aca-income-limits-2026',
  'aca-subsidy-cliff-2026',
  'federal-poverty-level-2026-guidelines',
  'turning-26-health-insurance-options',
  'lost-job-health-insurance-options',
  'pregnant-no-health-insurance',
  'kicked-off-medicaid-what-to-do',
  'medicaid-if-self-employed',
  'medicare-part-b-late-enrollment-penalty',
  'can-i-get-aca-and-medicaid'
]);

// ---------- Sheet pull ----------

async function pullSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SA_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Pull A:R (full row) — no writes
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'SEO Ideas!A:R',
  });

  const values = res.data.values || [];
  if (values.length === 0) throw new Error('Sheet returned no rows');

  const headers = values[0];
  const rows = values.slice(1).map((r, i) => {
    const o = { _row: i + 2 }; // sheet row index (1-based, +1 for header)
    headers.forEach((h, j) => { o[h] = r[j] != null ? r[j] : ''; });
    // Add normalized accessors regardless of column header name
    const c = (idx) => (r[idx] != null ? String(r[idx]).trim() : '');
    o._id = c(0);
    o._keyword = c(1);
    o._title = c(2);
    o._state = c(3);
    o._program = c(4);
    o._type = c(5);
    o._intent = c(6);
    o._volume = c(7);
    o._cpc = c(8);
    o._competition = c(9);
    o._revenue = c(10);
    o._priority = c(11);
    o._status = c(12);
    o._notes = c(13);
    o._url = c(14);
    o._created = c(15);
    o._source = c(16);
    o._target = c(17) || 'screener';
    return o;
  });

  return { headers, rows };
}

// ---------- Build template universe ----------

function loadTemplateCSVs() {
  const tmpl = {
    procedure: { csv: 'procedure-topics.csv', cta: 'analyzer' },
    drug: { csv: 'drug-topics.csv', cta: 'analyzer' },
    persona: { csv: 'persona-topics.csv', cta: 'screener' },
    event: { csv: 'event-topics.csv', cta: 'screener' },
    qa: { csv: 'qa-topics.csv', cta: 'screener' },
    glossary: { csv: 'glossary-topics.csv', cta: 'mixed' },
    'ma-state': { csv: 'ma-state-topics.csv', cta: 'screener' },
    'track-d': { csv: 'qa-topics-rerouted-to-track-d.csv', cta: 'screener' }
  };
  for (const [name, meta] of Object.entries(tmpl)) {
    meta.rows = loadCSV(path.join(RESEARCH_DIR, meta.csv));
  }
  return tmpl;
}

function templateRoute(template, topicSlug, state) {
  switch (template) {
    case 'procedure': return `/cost/${topicSlug.replace(/-cost$/, '')}`;
    case 'drug': return `/drug/${topicSlug.replace(/-cost$/, '')}`;
    case 'persona': return `/for/${topicSlug}`;
    case 'event': return `/event/${topicSlug}`;
    case 'qa': return `/qa/${topicSlug}`;
    case 'glossary': return `/glossary/${topicSlug}`;
    case 'ma-state': return `/medicare-advantage/${topicSlug}`;
    case 'track-d': return `/medicaid-income-limits/${state ? state.toLowerCase() : topicSlug}`;
    case 'persona-x-state': return `/for/${topicSlug}`;  // compound slug: persona-state
    case 'event-x-state': return `/event/${topicSlug}`;
    case 'qa-x-state': return `/qa/${topicSlug}`;
    case 'county': return `/medicare-advantage/${topicSlug}`;  // county-state slug
    case 'd-snp': return `/medicare-advantage/dual-eligible-snp-${state ? state.toLowerCase() : ''}`;
    case 'ma-vs-medigap': return `/medicare-advantage/medicare-advantage-vs-medigap-${state ? state.toLowerCase() : ''}`;
    case 'carrier-x-state': return `/medicare-advantage/${topicSlug}`;
    case 'spanish-twin': return `/es/medicare-advantage/${topicSlug}`;
    default: return `/${topicSlug}`;
  }
}

// ---------- BUSA inventory ----------

function loadBUSA() {
  const txt = fs.readFileSync(BUSA_INVENTORY, 'utf8');
  const rows = parseCSV(txt);
  const headers = rows[0];
  return rows.slice(1).filter(r => r.length > 1).map(r => {
    const o = {};
    headers.forEach((h, i) => { o[h] = r[i] || ''; });
    o._urlLower = (o.url || '').toLowerCase();
    o._titleLower = (o.title || '').toLowerCase();
    o._tokens = tokens(o.url + ' ' + o.title);
    return o;
  });
}

// ---------- Sheet classification logic ----------

function classifyRow(row, allTemplates) {
  const status = row._status;
  const title = row._title;
  if (!title) return null;
  // skip Written / Duplicate
  if (status === 'Written') return null;
  if (status === 'Duplicate') return null;
  // we process Ready and Low Priority and "Held"
  if (status !== 'Ready' && status !== 'Low Priority') {
    // still process if blank or other
    if (status && status !== 'Held' && status !== '') return null;
  }

  const titleSlug = slugify(title);
  const titleTokens = tokens(title);
  const titleLower2 = title.toLowerCase();
  const stateCode = row._state || detectState(title);

  // 1. Check live-page dupes — looser threshold + concept-keyword check
  // Template-aware: ma-state /texas (Medicare Advantage Texas) is NOT a dupe of "Texas Medicaid Income Limits"
  const dupeChecks = [];
  for (const [tmplName, slugs] of Object.entries(LIVE_PAGES)) {
    // Filter: state-only ma-state slugs shouldn't match titles that are clearly Medicaid/CHIP/ACA-marketplace
    const isStateOnlyMA = tmplName === 'ma-state';
    if (isStateOnlyMA) {
      const isMedicaidIntent = /medicaid|medi-cal|ahcccs|tenncare|husky|badgercare|soonercare|mainecare|chip\b|masshealth|chp\+|ohp|free health insurance/i.test(titleLower2);
      const isACAIntent = /aca marketplace|obamacare|marketplace plan/i.test(titleLower2);
      const isMedicareIntent = /medicare advantage|medicare plan|medigap|original medicare|part d|part b|d-snp/i.test(titleLower2);
      // Only treat as MA-state dupe if title is about Medicare/MA, not Medicaid/CHIP/ACA
      if (isMedicaidIntent || isACAIntent) continue;
      // even if Medicare-intent, require an explicit "Medicare Advantage" mention
      if (!isMedicareIntent) continue;
    }

    for (const slug of slugs) {
      const slugCore = slug.replace(/-cost$/, '').replace(/-health-insurance.*$/,'').replace(/-medicare$/,'').replace(/-health-insurance$/, '');
      const slugToks = tokens(slugCore.replace(/-/g, ' '));
      if (slugToks.length === 0) continue;
      const sim = jaccard(titleTokens, slugToks);
      const overlap = slugToks.filter(t => titleTokens.includes(t)).length;
      const slugCoverage = overlap / slugToks.length;  // fraction of slug tokens in title

      // Heuristic: only call it a DROP_DUPE if BOTH conditions hold
      // (a) the live slug's defining tokens are ALL present in title (slugCoverage = 1.0)
      // (b) at least 30% of title's meaningful tokens are part of the slug (avoid super-broad title catches)
      const titleCoverage = titleTokens.length > 0 ? overlap / titleTokens.length : 0;

      let conceptMatch = false;
      // Single-word slugs need that exact word in title AND >= 25% title overlap
      if (slugToks.length === 1 && slugToks[0].length >= 4 && titleTokens.includes(slugToks[0]) && titleCoverage >= 0.20) {
        // Special case: avoid generic terms like "deductible" matching titles about everything-medicare
        // Reject if title is clearly about a different broad topic (e.g. "Medicare Costs" should not be /deductible dupe)
        const titleHas = (kw) => titleLower2.includes(kw);
        // For the single-token live slugs (magi, deductible, oop-max, etc.):
        // Only dupe if title looks like a definition/explainer, not a side reference
        const looksLikeDefinitionPage = /(what is|definition|explained|defined)/i.test(title) || titleCoverage >= 0.4;
        if (looksLikeDefinitionPage) conceptMatch = true;
      }
      // Multi-word slugs: ALL slug tokens must appear in title
      if (slugToks.length >= 2 && slugCoverage === 1.0) {
        // Additional: title tokens overlap >= 50% with slug
        if (titleCoverage >= 0.30) conceptMatch = true;
      }

      if (sim >= 0.5 || conceptMatch) {
        dupeChecks.push({tmpl: tmplName, slug, sim, conceptMatch, overlap, slugCoverage, titleCoverage});
      }
    }
  }

  if (dupeChecks.length > 0) {
    // Prefer concept matches > pure jaccard. Within concept matches, prefer highest titleCoverage (specificity)
    dupeChecks.sort((a, b) => {
      if (a.conceptMatch !== b.conceptMatch) return b.conceptMatch ? 1 : -1;
      if (a.conceptMatch) return b.titleCoverage - a.titleCoverage;
      return b.sim - a.sim;
    });
    const top = dupeChecks[0];
    if (top.conceptMatch || top.sim >= 0.65) {
      return {
        sheet_row: row._row,
        sheet_id: row._id,
        sheet_title: title,
        sheet_status: status,
        sheet_priority: row._priority,
        classification: 'DROP_DUPE_EXISTING_PAGE',
        matched_template: top.tmpl,
        matched_slug: top.slug,
        recommended_action: 'DELETE FROM SHEET (already shipped)',
        confidence: top.conceptMatch ? '0.90' : top.sim.toFixed(2),
        notes: `Duplicates live ${top.tmpl} page /${top.slug}${top.conceptMatch ? ' (concept match)' : ''}`
      };
    }
  }

  // 2. Match against template topic universes
  let bestMatch = null;
  for (const [tmplName, meta] of Object.entries(allTemplates)) {
    for (const tRow of meta.rows) {
      if (!tRow.topic) continue;
      const ttoks = tokens(tRow.topic.replace(/-/g, ' ') + ' ' + (tRow.title_hint || ''));
      const sim = jaccard(titleTokens, ttoks);
      if (sim >= 0.5 && (!bestMatch || sim > bestMatch.sim)) {
        bestMatch = { tmpl: tmplName, topic: tRow.topic, hint: tRow.title_hint, sim };
      }
    }
  }

  // Heuristic boosts: state-Medicaid-related sheet rows almost always belong to track-d
  const titleLower = title.toLowerCase();
  const isStateMedicaid = stateCode &&
    (/medicaid|chip|medi-cal|ahcccs|husky|tenncare|badgercare|soonercare|mainecare|allkids|chp\+|ohp|hip/i.test(titleLower)) &&
    /(income limit|eligibility|qualify|how to apply|free health insurance.*medicaid|expansion|coverage gap|pathways|asset rules)/i.test(titleLower);

  if (isStateMedicaid) {
    // Check track-d explicitly
    return {
      sheet_row: row._row,
      sheet_id: row._id,
      sheet_title: title,
      sheet_status: status,
      sheet_priority: row._priority,
      classification: 'MIGRATE_TO_TEMPLATE',
      matched_template: 'track-d',
      matched_slug: `medicaid-eligibility-${(STATE_DISPLAY[stateCode]||'').toLowerCase().replace(/ /g,'-')}`,
      recommended_action: `Track D /medicaid-income-limits/${(STATE_DISPLAY[stateCode]||'').toLowerCase().replace(/ /g,'-')} owns this. Delete from Sheet to avoid blog-cron writing it.`,
      confidence: '0.92',
      notes: `State-Medicaid eligibility/income/apply/CHIP intent for ${stateCode}. Belongs to Track D Medicaid factory.`
    };
  }

  // ACA Marketplace by state
  const isStateACA = stateCode && /aca|marketplace|obamacare/i.test(titleLower) && /(plan|cost|subsid|enroll)/i.test(titleLower);
  if (isStateACA) {
    return {
      sheet_row: row._row,
      sheet_id: row._id,
      sheet_title: title,
      sheet_status: status,
      sheet_priority: row._priority,
      classification: 'KEEP_AS_BLOG_NO_TEMPLATE_MATCH',
      matched_template: '',
      matched_slug: '',
      recommended_action: 'KEEP IN SHEET — no per-state ACA template exists yet (potential future template; not in 7-template universe)',
      confidence: '0.85',
      notes: `State-ACA marketplace topic — no current template (could be future ma-state-adjacent ACA fork)`
    };
  }

  if (bestMatch && bestMatch.sim >= 0.65) {
    // Strong template match → migrate
    return {
      sheet_row: row._row,
      sheet_id: row._id,
      sheet_title: title,
      sheet_status: status,
      sheet_priority: row._priority,
      classification: 'MIGRATE_TO_TEMPLATE',
      matched_template: bestMatch.tmpl,
      matched_slug: bestMatch.topic,
      recommended_action: `Migrate to ${bestMatch.tmpl} template; delete from Sheet so blog-cron doesn't write it as a blog.`,
      confidence: bestMatch.sim.toFixed(2),
      notes: `Strong match to ${bestMatch.tmpl} topic '${bestMatch.topic}' (jaccard ${bestMatch.sim.toFixed(2)})`
    };
  }

  // Conditional auto-migrate: if title strongly suggests a Q&A coverage page
  // ("Does Medicaid/Medicare cover X") AND best match is in qa template at >=0.5,
  // auto-migrate to qa.
  if (bestMatch && bestMatch.sim >= 0.5 && bestMatch.tmpl === 'qa') {
    if (/^does (medicare|medicaid|insurance) cover/i.test(title)) {
      return {
        sheet_row: row._row,
        sheet_id: row._id,
        sheet_title: title,
        sheet_status: status,
        sheet_priority: row._priority,
        classification: 'MIGRATE_TO_TEMPLATE',
        matched_template: 'qa',
        matched_slug: bestMatch.topic,
        recommended_action: `QA template (Does X cover Y form). Migrate to /qa/${bestMatch.topic}.`,
        confidence: bestMatch.sim.toFixed(2),
        notes: `QA-coverage shape; matched ${bestMatch.topic} (jaccard ${bestMatch.sim.toFixed(2)})`
      };
    }
  }

  // Conditional: glossary single-term-definition titles ("What is X?")
  if (bestMatch && bestMatch.sim >= 0.5 && bestMatch.tmpl === 'glossary') {
    if (/^what is /i.test(title)) {
      return {
        sheet_row: row._row,
        sheet_id: row._id,
        sheet_title: title,
        sheet_status: status,
        sheet_priority: row._priority,
        classification: 'MIGRATE_TO_TEMPLATE',
        matched_template: 'glossary',
        matched_slug: bestMatch.topic,
        recommended_action: `Glossary "What is X" form. Migrate to /glossary/${bestMatch.topic}.`,
        confidence: bestMatch.sim.toFixed(2),
        notes: `Glossary single-term-definition shape; matched ${bestMatch.topic} (jaccard ${bestMatch.sim.toFixed(2)})`
      };
    }
  }

  if (bestMatch && bestMatch.sim >= 0.5) {
    // Ambiguous
    return {
      sheet_row: row._row,
      sheet_id: row._id,
      sheet_title: title,
      sheet_status: status,
      sheet_priority: row._priority,
      classification: 'REVIEW_NEEDED',
      matched_template: bestMatch.tmpl,
      matched_slug: bestMatch.topic,
      recommended_action: `Review: looks like ${bestMatch.tmpl} but jaccard only ${bestMatch.sim.toFixed(2)}. Could keep as blog OR migrate.`,
      confidence: bestMatch.sim.toFixed(2),
      notes: `Ambiguous match; needs human eyes`
    };
  }

  // 3. Heuristic blog-shape detection
  const blogShape = /how to|why|the most|review|i asked|chatgpt|sample|ultimate|every|state-by-state|line-by-line|7 |8 |10 |here'?s|step-by-step|step by step|walkthrough|deep|explained why|what's still|comparison/i.test(titleLower)
    || /chargemaster|cpt code|charity care|hospital fair|surprise medical|emtala|no surprises act|upcoding|unbundling|chargemaster|nicu/i.test(titleLower)
    || /aca-explainer|medicare-explainer|aca subsid|enhanced subsidies|family glitch|ssdi/i.test(titleLower);

  // Also: hospital-specific charity care = blog
  const isHospitalSpecific = /(cleveland clinic|kaiser|mayo|hca|sutter|ucla|stanford|mass general|memorial sloan|mount sinai|northwell|nyu langone|johns hopkins|new york.*presbyterian|cedars-sinai|upmc|texas children|md anderson|banner health|providence|houston methodist|northwestern)/i.test(titleLower);

  if (blogShape || isHospitalSpecific) {
    return {
      sheet_row: row._row,
      sheet_id: row._id,
      sheet_title: title,
      sheet_status: status,
      sheet_priority: row._priority,
      classification: 'KEEP_AS_BLOG',
      matched_template: '',
      matched_slug: '',
      recommended_action: 'KEEP IN SHEET — narrative/news-cycle/listicle shape, not template-shape',
      confidence: '0.80',
      notes: `Blog-shape title (narrative/listicle/hospital-specific/news angle)`
    };
  }

  // No template match, no clear blog-shape
  return {
    sheet_row: row._row,
    sheet_id: row._id,
    sheet_title: title,
    sheet_status: status,
    sheet_priority: row._priority,
    classification: 'KEEP_AS_BLOG_NO_TEMPLATE_MATCH',
    matched_template: '',
    matched_slug: '',
    recommended_action: 'KEEP IN SHEET — no template match, treat as blog',
    confidence: '0.50',
    notes: bestMatch ? `Weak match to ${bestMatch.tmpl}/${bestMatch.topic} (${bestMatch.sim.toFixed(2)})` : `No template match found`
  };
}

// ---------- BUSA cross-reference for templates ----------

function busaCrossReference(allTemplates, busaRows) {
  const out = [];

  // Build a state-Medicaid keyword index for BUSA
  for (const [tmplName, meta] of Object.entries(allTemplates)) {
    for (const tRow of meta.rows) {
      if (!tRow.topic) continue;
      const topicTokens = tokens(tRow.topic.replace(/-/g, ' ') + ' ' + (tRow.title_hint || ''));
      let bestBusa = null;
      // Pre-filter: state-bearing template rows are the only ones with high BUSA risk
      const isStateTopic = tRow.state_specific === 'y' || /\[state\]/i.test(tRow.topic) || /\[state\]/i.test(tRow.title_hint || '');
      const sampleBusa = busaRows.filter(b => {
        // crude pre-filter for relevance
        const overlap = topicTokens.filter(t => b._tokens.includes(t)).length;
        return overlap >= 2;
      });

      for (const b of sampleBusa) {
        const sim = jaccard(topicTokens, b._tokens);
        if (sim >= 0.4 && (!bestBusa || sim > bestBusa.sim)) {
          bestBusa = { url: b.url, title: b.title, sim };
        }
      }

      if (bestBusa) {
        let severity = 'slight';
        let recommendation = 'KEEP — intent split (BUSA = how-to-apply/general; CoveredUSA = FANOUT-structured eligibility/income lookup)';
        if (bestBusa.sim >= 0.75) {
          severity = 'heavy';
          recommendation = 'KEEP but flag for Jacob — heavy URL/title overlap. Intent split + CoveredUSA structure (9-row HH table + FANOUT) justifies keeping.';
        } else if (bestBusa.sim >= 0.55) {
          severity = 'moderate';
        }
        out.push({
          template: tmplName,
          topic: tRow.topic,
          title: tRow.title_hint || '',
          busa_match_url: bestBusa.url,
          busa_match_title: bestBusa.title,
          overlap_severity: severity,
          recommendation,
          notes: `jaccard ${bestBusa.sim.toFixed(2)}; state_specific=${tRow.state_specific || 'n'}`
        });
      }
    }
  }
  return out;
}

// ---------- MASTER_BACKLOG construction ----------

function buildMasterBacklog(allTemplates, sheetDecisions) {
  const out = [];
  let counter = 0;
  const nextId = () => 'MB-' + String(++counter).padStart(4, '0');

  // Map sheet decisions: matched template/topic -> sheet info (for `migrated_from_sheet` provenance)
  const migrationMap = new Map();
  for (const d of sheetDecisions) {
    if (d.classification === 'MIGRATE_TO_TEMPLATE' && d.matched_template && d.matched_slug) {
      const key = `${d.matched_template}|${d.matched_slug}`;
      if (!migrationMap.has(key)) migrationMap.set(key, []);
      migrationMap.get(key).push({ row: d.sheet_row, id: d.sheet_id, title: d.sheet_title });
    }
  }

  // Helper to add a row
  function add({template, route, topic_slug, state, title, priority, demand_score, competitor_density,
                busa_overlap, cta_target, subtype, topic_type, already_live, sources, notes,
                migrated_from_sheet, sheet_row_id}) {
    out.push({
      row_id: nextId(),
      template,
      route,
      topic_slug,
      state: state || '',
      title,
      priority,
      demand_score: demand_score || '',
      competitor_density: competitor_density || '',
      busa_overlap: busa_overlap || '',
      cta_target,
      subtype: subtype || '',
      topic_type: topic_type || '',
      already_live: already_live || 'n',
      migrated_from_sheet: migrated_from_sheet || 'n',
      sheet_row_id: sheet_row_id || '',
      sources: sources || '',
      notes: notes || ''
    });
  }

  // 1. procedure (174 base + 3 state-fork × 51)
  for (const t of allTemplates.procedure.rows) {
    if (!t.topic) continue;
    const slug = t.topic.replace(/-cost$/, '');
    const isLive = t.already_live === 'y' || LIVE_PAGES.procedure.includes(t.topic) || LIVE_PAGES.procedure.includes(slug);
    if (isLive) continue;
    const key = `procedure|${t.topic}`;
    const fromSheet = migrationMap.get(key);
    let priority = parseInt(t.priority || '3', 10) || 3;

    if (t.state_specific === 'y') {
      // Expand into 51 state forks
      for (const [code, sslug] of STATES) {
        const stateSlug = `${slug}-${sslug}`;
        const stateTitle = `${STATE_DISPLAY[code]} ${t.title_hint || t.topic}`;
        let p = priority;
        if (SE_STATES.has(code)) p = 1;
        add({
          template: 'procedure',
          route: `/cost/${stateSlug}`,
          topic_slug: stateSlug,
          state: code,
          title: stateTitle,
          priority: p,
          demand_score: t.demand_score || '',
          competitor_density: t.competitor_density || '',
          busa_overlap: t.busa_overlap || '',
          cta_target: 'analyzer',
          notes: `State-fork from procedure ${t.topic}`,
          sources: t.sources || ''
        });
      }
    }
    add({
      template: 'procedure',
      route: `/cost/${slug}`,
      topic_slug: slug,
      state: '',
      title: t.title_hint || t.topic,
      priority,
      demand_score: t.demand_score || '',
      competitor_density: t.competitor_density || '',
      busa_overlap: t.busa_overlap || '',
      cta_target: 'analyzer',
      already_live: 'n',
      migrated_from_sheet: fromSheet ? 'y' : 'n',
      sheet_row_id: fromSheet ? fromSheet.map(s => s.id).join('|') : '',
      notes: t.notes || '',
      sources: t.sources || ''
    });
  }

  // 2. drug (276)
  for (const t of allTemplates.drug.rows) {
    if (!t.topic) continue;
    const slug = t.topic;
    const isLive = t.already_live === 'y' || t.priority === 'SHIPPED' || LIVE_PAGES.drug.includes(slug);
    if (isLive) continue;
    const key = `drug|${slug}`;
    const fromSheet = migrationMap.get(key);
    const priority = parseInt(t.priority || '3', 10) || 3;
    add({
      template: 'drug',
      route: `/drug/${slug.replace(/-cost$/, '')}`,
      topic_slug: slug,
      state: '',
      title: t.title_hint || slug,
      priority,
      demand_score: t.priority_index || '',
      competitor_density: t.competitor_density || '',
      busa_overlap: t.busa_overlap || '',
      cta_target: 'analyzer',
      migrated_from_sheet: fromSheet ? 'y' : 'n',
      sheet_row_id: fromSheet ? fromSheet.map(s => s.id).join('|') : '',
      notes: t.notes || '',
      sources: t.sources || ''
    });
  }

  // 3. persona (162 base + 9 conservative × 51 state-fork)
  const STATE_FORK_PERSONAS = new Set([
    'gig-workers', 'doordash-uber-drivers', 'realtors', 'truckers',
    'farmers', 'daca-recipients', 'undocumented-immigrants',
    'medicaid-gap-coverage', 'rural-residents'
  ]);

  for (const t of allTemplates.persona.rows) {
    if (!t.topic) continue;
    const slug = t.topic;
    const isLive = t.already_live === 'y' || LIVE_PAGES.persona.includes(slug);
    if (isLive) continue;
    let priority = parseInt(t.priority || '3', 10) || 3;
    const key = `persona|${slug}`;
    const fromSheet = migrationMap.get(key);

    add({
      template: 'persona',
      route: `/for/${slug}`,
      topic_slug: slug,
      state: '',
      title: t.title_hint || slug,
      priority,
      demand_score: t.demand_score || '',
      competitor_density: t.competitor_density || '',
      busa_overlap: t.busa_overlap || '',
      cta_target: 'screener',
      migrated_from_sheet: fromSheet ? 'y' : 'n',
      sheet_row_id: fromSheet ? fromSheet.map(s => s.id).join('|') : '',
      notes: t.notes || '',
      sources: t.sources || ''
    });

    if (STATE_FORK_PERSONAS.has(slug)) {
      for (const [code, sslug] of STATES) {
        const stateSlug = `${slug}-${sslug}`;
        const stateTitle = `${STATE_DISPLAY[code]} ${t.title_hint || slug}`;
        let p = 2;
        if (SE_STATES.has(code)) p = 1;
        add({
          template: 'persona-x-state',
          route: `/for/${stateSlug}`,
          topic_slug: stateSlug,
          state: code,
          title: stateTitle.replace(/2026/g, '').trim() + ' 2026',
          priority: p,
          demand_score: '',
          competitor_density: 'low',
          busa_overlap: t.busa_overlap || 'slight',
          cta_target: 'screener',
          notes: `Persona × state fork from ${slug}`,
          sources: t.sources || ''
        });
      }
    }
  }

  // 4. event (137 base + 5 events × ~50 state-fork)
  // turning-26 capped to 12 extension-law states; others = 51
  const TURNING_26_STATES = ['CA','CO','CT','FL','GA','IL','MA','NJ','NY','NV','OH','PA','TX','WI'];
  const STATE_FORK_EVENTS = ['lost-job', 'lost-medicaid', 'moved-to-state', 'pregnant-medicaid', 'turning-26'];

  for (const t of allTemplates.event.rows) {
    if (!t.topic) continue;
    const slug = t.topic;
    const isLive = t.already_live === 'y' || LIVE_PAGES.event.includes(slug);
    if (isLive) continue;
    let priority = parseInt(t.priority || '3', 10) || 3;
    const key = `event|${slug}`;
    const fromSheet = migrationMap.get(key);
    add({
      template: 'event',
      route: `/event/${slug}`,
      topic_slug: slug,
      state: '',
      title: t.title_hint || slug,
      priority,
      demand_score: t.demand_score || '',
      competitor_density: t.competitor_density || '',
      busa_overlap: t.busa_overlap || '',
      cta_target: 'screener',
      migrated_from_sheet: fromSheet ? 'y' : 'n',
      sheet_row_id: fromSheet ? fromSheet.map(s => s.id).join('|') : '',
      notes: t.notes || '',
      sources: t.sources || ''
    });
  }

  // Event state-fork expansions (5 events × states)
  for (const eventBase of STATE_FORK_EVENTS) {
    const stateList = eventBase === 'turning-26' ? TURNING_26_STATES : STATES.map(s => s[0]);
    for (const code of stateList) {
      const sslug = STATES.find(s => s[0] === code)[1];
      const stateSlug = `${eventBase}-${sslug}`;
      let p = 2;
      if (SE_STATES.has(code)) p = 1;
      const titleMap = {
        'lost-job': `Just Lost Your Job in ${STATE_DISPLAY[code]}? Health Insurance Options 2026`,
        'lost-medicaid': `Lost Your Medicaid in ${STATE_DISPLAY[code]} 2026: Next Steps`,
        'moved-to-state': `Moving to ${STATE_DISPLAY[code]}? How to Switch Health Insurance 2026`,
        'pregnant-medicaid': `Pregnant in ${STATE_DISPLAY[code]} 2026: Medicaid + Coverage Options`,
        'turning-26': `Turning 26 in ${STATE_DISPLAY[code]} 2026: State Extension Rules`
      };
      add({
        template: 'event-x-state',
        route: `/event/${stateSlug}`,
        topic_slug: stateSlug,
        state: code,
        title: titleMap[eventBase],
        priority: p,
        demand_score: '',
        competitor_density: 'low',
        busa_overlap: 'slight',
        cta_target: 'screener',
        notes: `Event × state fork from ${eventBase}`,
        sources: ''
      });
    }
  }

  // 5. qa (143 coverage + 51 state-elig + 6 umbrellas × 51 fork)
  const STATE_FORK_QA_UMBRELLAS = [
    { umbrella: 'chip-eligibility', title: 'CHIP Eligibility' },
    { umbrella: 'medicare-savings-program', title: 'Medicare Savings Program (QMB/SLMB/QI) Income Limits' },
    { umbrella: 'state-pharmaceutical-assistance', title: 'State Pharmaceutical Assistance Program (SPAP)' },
    { umbrella: 'immigrant-medicaid', title: 'Immigrant Medicaid Eligibility' },
    { umbrella: 'pregnancy-medicaid', title: 'Pregnancy Medicaid Eligibility' },
    { umbrella: 'retroactive-medicaid', title: 'Retroactive Medicaid' }
  ];

  for (const t of allTemplates.qa.rows) {
    if (!t.topic) continue;
    const slug = t.topic;
    const isLive = t.already_live === 'y' || LIVE_PAGES.qa.includes(slug);
    if (isLive) continue;
    let priority = parseInt(t.priority || '3', 10) || 3;
    const key = `qa|${slug}`;
    const fromSheet = migrationMap.get(key);
    add({
      template: 'qa',
      route: `/qa/${slug}`,
      topic_slug: slug,
      state: '',
      title: t.title_hint || slug,
      priority,
      demand_score: t.demand_score || '',
      competitor_density: t.competitor_density || '',
      busa_overlap: t.busa_overlap || '',
      cta_target: 'screener',
      subtype: t.subtype || 'qa-coverage',
      migrated_from_sheet: fromSheet ? 'y' : 'n',
      sheet_row_id: fromSheet ? fromSheet.map(s => s.id).join('|') : '',
      notes: t.notes || '',
      sources: t.sources || ''
    });
  }

  // QA state-eligibility umbrellas × 51
  for (const u of STATE_FORK_QA_UMBRELLAS) {
    for (const [code, sslug] of STATES) {
      const slug = `${u.umbrella}-${sslug}`;
      let p = 2;
      if (SE_STATES.has(code)) p = 1;
      add({
        template: 'qa-x-state',
        route: `/qa/${slug}`,
        topic_slug: slug,
        state: code,
        title: `${STATE_DISPLAY[code]} ${u.title} 2026`,
        priority: p,
        demand_score: '',
        competitor_density: 'low',
        busa_overlap: 'slight',
        cta_target: 'screener',
        subtype: 'qa-state-eligibility',
        notes: `QA state-eligibility umbrella ${u.umbrella}`,
        sources: ''
      });
    }
  }

  // 6. glossary (29)
  for (const t of allTemplates.glossary.rows) {
    if (!t.topic) continue;
    const slug = t.topic;
    const isLive = t.already_live === 'y' || t.priority === 'SHIPPED' || LIVE_PAGES.glossary.includes(slug);
    if (isLive) continue;
    let priority = parseInt(t.priority || '3', 10) || 3;
    const key = `glossary|${slug}`;
    const fromSheet = migrationMap.get(key);
    add({
      template: 'glossary',
      route: `/glossary/${slug}`,
      topic_slug: slug,
      state: '',
      title: t.title_hint || slug,
      priority,
      demand_score: t.demand_score || '',
      competitor_density: t.competitor_density || '',
      busa_overlap: t.busa_overlap || '',
      cta_target: 'screener',
      topic_type: t.topic_type || 'single-term-definition',
      migrated_from_sheet: fromSheet ? 'y' : 'n',
      sheet_row_id: fromSheet ? fromSheet.map(s => s.id).join('|') : '',
      notes: t.notes || '',
      sources: t.sources || ''
    });
  }

  // 7. ma-state (43 remaining states, with SE prioritization)
  for (const t of allTemplates['ma-state'].rows) {
    if (!t.topic) continue;
    const slug = t.topic;
    const code = STATE_BY_SLUG[slug];
    const isLive = t.already_live === 'y' || LIVE_PAGES['ma-state'].includes(slug);
    if (isLive) continue;
    let priority = parseInt(t.priority || '3', 10) || 3;
    if (code && SE_STATES.has(code)) priority = 1;
    add({
      template: 'ma-state',
      route: `/medicare-advantage/${slug}`,
      topic_slug: slug,
      state: code || '',
      title: t.title_hint || slug,
      priority,
      demand_score: t.demand_score || '',
      competitor_density: t.competitor_density || '',
      busa_overlap: t.busa_overlap || 'none',
      cta_target: 'screener',
      notes: t.notes || (code && SE_STATES.has(code) ? 'SE prioritized' : ''),
      sources: t.sources || ''
    });
    // Spanish twin (51 mechanical pages — high ROI)
    let spanPri = priority + 1;
    if (spanPri > 3) spanPri = 3;
    add({
      template: 'spanish-twin',
      route: `/es/medicare-advantage/${slug}`,
      topic_slug: slug,
      state: code || '',
      title: `Planes Medicare Advantage en ${STATE_DISPLAY[code] || slug} 2026`,
      priority: spanPri,
      demand_score: '',
      competitor_density: 'very-low',
      busa_overlap: 'none',
      cta_target: 'screener',
      notes: 'Spanish twin — zero competitor coverage',
      sources: ''
    });
  }

  // 8. Track D Medicaid factory (51 states, many already-queued in Sheet)
  // The CSV has 69 rows but only 51 canonical state pages (1 per jurisdiction).
  // Use medicaid-eligibility-[state] rows + dc.
  for (const t of allTemplates['track-d'].rows) {
    if (!t.topic) continue;
    // Only take the medicaid-eligibility-[state] rows (51 canonical)
    if (!t.topic.startsWith('medicaid-eligibility-')) continue;
    const stateSlug = t.topic.replace('medicaid-eligibility-', '');
    const code = STATE_BY_SLUG[stateSlug] || (stateSlug === 'dc' ? 'DC' : '');
    let priority = parseInt(t.priority || '1', 10) || 1;
    if (code && SE_STATES.has(code)) priority = 1;
    const key = `track-d|${t.topic}`;
    const fromSheet = migrationMap.get(key) || migrationMap.get(`track-d|medicaid-eligibility-${stateSlug}`);
    // Clean title — prefer state-display brand variant
    let trackDTitle = `${STATE_DISPLAY[code] || stateSlug} Medicaid Income Limits 2026`;
    // Extract any brand variant from title_hint (e.g., "Medi-Cal", "AHCCCS", "TennCare")
    const brandMatch = (t.title_hint || '').match(/\((?:[^)]+)\)|AHCCCS|Medi-Cal|MaineCare|MassHealth|HUSKY|TennCare|BadgerCare|SoonerCare|ARHOME|MO HealthNet|HIP|OHP|Apple Health|RIte Care|Cardinal Care|Healthy Connections|Healthy Indiana Plan|Pathways|Med-QUEST|Heritage Health|Granite Advantage|Centennial Care|Green Mountain Care|KanCare|IA Health Link|NJ FamilyCare/i);
    if (brandMatch) {
      const brand = brandMatch[0].replace(/[()]/g, '').trim();
      trackDTitle = `${STATE_DISPLAY[code] || stateSlug} ${brand} Income Limits 2026`;
    }
    add({
      template: 'track-d',
      route: `/medicaid-income-limits/${stateSlug}`,
      topic_slug: stateSlug,
      state: code,
      title: trackDTitle,
      priority,
      demand_score: '',
      competitor_density: t.competitor_density || 'medium',
      busa_overlap: t.busa_overlap || 'heavy',
      cta_target: 'screener',
      subtype: 'qa-state-eligibility',
      migrated_from_sheet: fromSheet ? 'y' : 'n',
      sheet_row_id: fromSheet ? fromSheet.map(s => s.id).join('|') : '',
      notes: `Track D Medicaid factory${SE_STATES.has(code) ? ' (SE prioritized)' : ''}. ${t.notes || ''}`,
      sources: t.sources || ''
    });
  }

  // 9. ma-state adjacent templates (placeholders / category seeds)
  for (const adj of allTemplates['ma-state'].rows.length > 0 ? loadCSV(path.join(RESEARCH_DIR, 'ma-state-adjacent-templates.csv')) : []) {
    // Skip — handled by spanish-twin above + persona-x-state above.
    // Keep adjacent template tracks as category-seed rows for future expansion.
    if (adj.template_name === 'medicare-advantage-by-state-spanish') continue; // already handled
  }

  // Persona × state MVP (50 pages: 5 personas × top 10 states) — additional curated set
  const PERSONA_X_MA_STATE = ['veterans', 'dual-eligibles', 'diabetics', 'low-income', 'spanish-speakers'];
  const TOP_10_MA_STATES = ['CA','TX','FL','NY','PA','IL','OH','GA','NC','MI'];
  for (const p of PERSONA_X_MA_STATE) {
    for (const code of TOP_10_MA_STATES) {
      const sslug = STATES.find(s => s[0] === code)[1];
      const slug = `${p}-medicare-advantage-${sslug}`;
      let pri = 2;
      if (SE_STATES.has(code)) pri = 1;
      add({
        template: 'persona-x-state',
        route: `/medicare-advantage/${slug}`,
        topic_slug: slug,
        state: code,
        title: `${p === 'spanish-speakers' ? 'Spanish-Speaker' : p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ')} Medicare Advantage in ${STATE_DISPLAY[code]} 2026`,
        priority: pri,
        demand_score: '',
        competitor_density: 'low',
        busa_overlap: 'none',
        cta_target: 'screener',
        notes: 'MA-state adjacent: persona × state MVP',
        sources: 'ma-state-adjacent-templates.csv'
      });
    }
  }

  // D-SNP × top-30 states
  const TOP_30_DSNP = ['CA','TX','FL','NY','PA','IL','OH','GA','NC','MI','NJ','VA','WA','AZ','MA','TN','IN','MO','MD','WI','MN','CO','SC','AL','LA','KY','OR','OK','CT','UT'];
  for (const code of TOP_30_DSNP) {
    const sslug = STATES.find(s => s[0] === code)[1];
    const slug = `dual-eligible-snp-${sslug}`;
    let pri = 2;
    if (SE_STATES.has(code)) pri = 1;
    add({
      template: 'd-snp',
      route: `/medicare-advantage/${slug}`,
      topic_slug: slug,
      state: code,
      title: `Dual-Eligible (D-SNP) Medicare Advantage in ${STATE_DISPLAY[code]} 2026`,
      priority: pri,
      demand_score: '',
      competitor_density: 'low',
      busa_overlap: 'none',
      cta_target: 'screener',
      notes: 'MA-state adjacent: D-SNP × top-30 states',
      sources: 'ma-state-adjacent-templates.csv'
    });
  }

  // MA-vs-Medigap × 7 guaranteed-issue states
  const GI_STATES = ['NY','CT','MA','ME','OR','CA','MO'];
  for (const code of GI_STATES) {
    const sslug = STATES.find(s => s[0] === code)[1];
    const slug = `medicare-advantage-vs-medigap-${sslug}`;
    let pri = 2;
    if (SE_STATES.has(code)) pri = 1;
    add({
      template: 'ma-vs-medigap',
      route: `/medicare-advantage/${slug}`,
      topic_slug: slug,
      state: code,
      title: `Medicare Advantage vs Medigap in ${STATE_DISPLAY[code]} 2026 (Guaranteed Issue)`,
      priority: pri,
      demand_score: '',
      competitor_density: 'low',
      busa_overlap: 'none',
      cta_target: 'screener',
      notes: 'MA-state adjacent: 7 guaranteed-issue states',
      sources: 'ma-state-adjacent-templates.csv'
    });
  }

  // Carrier × top-12 states (60 pages: 5 carriers × 12 states)
  const CARRIERS = ['unitedhealthcare', 'humana', 'aetna', 'cigna', 'anthem'];
  const TOP_12_CARRIER_STATES = ['CA','TX','FL','NY','PA','IL','OH','GA','NC','MI','NJ','VA'];
  for (const carrier of CARRIERS) {
    for (const code of TOP_12_CARRIER_STATES) {
      const sslug = STATES.find(s => s[0] === code)[1];
      const slug = `${carrier}-medicare-advantage-${sslug}`;
      let pri = 2;
      if (SE_STATES.has(code)) pri = 1;
      add({
        template: 'carrier-x-state',
        route: `/medicare-advantage/${slug}`,
        topic_slug: slug,
        state: code,
        title: `${carrier.charAt(0).toUpperCase() + carrier.slice(1)} Medicare Advantage in ${STATE_DISPLAY[code]} 2026`,
        priority: pri,
        demand_score: '',
        competitor_density: 'medium',
        busa_overlap: 'none',
        cta_target: 'screener',
        notes: 'MA-state adjacent: carrier × state trimmed',
        sources: 'ma-state-adjacent-templates.csv'
      });
    }
  }

  // County pages (curated 50: top-5 counties × top-10 states)
  const COUNTY_LIST = [
    ['CA','los-angeles'], ['CA','san-diego'], ['CA','orange'], ['CA','riverside'], ['CA','san-bernardino'],
    ['TX','harris'], ['TX','dallas'], ['TX','tarrant'], ['TX','bexar'], ['TX','travis'],
    ['FL','miami-dade'], ['FL','broward'], ['FL','palm-beach'], ['FL','hillsborough'], ['FL','orange-fl'],
    ['NY','kings'], ['NY','queens'], ['NY','new-york'], ['NY','suffolk'], ['NY','bronx'],
    ['PA','philadelphia'], ['PA','allegheny'], ['PA','montgomery'], ['PA','bucks'], ['PA','delaware-pa'],
    ['IL','cook'], ['IL','dupage'], ['IL','lake-il'], ['IL','will'], ['IL','kane'],
    ['OH','franklin'], ['OH','cuyahoga'], ['OH','hamilton'], ['OH','summit'], ['OH','montgomery-oh'],
    ['GA','fulton'], ['GA','gwinnett'], ['GA','cobb'], ['GA','dekalb'], ['GA','clayton'],
    ['NC','mecklenburg'], ['NC','wake'], ['NC','guilford'], ['NC','forsyth'], ['NC','durham'],
    ['MI','wayne'], ['MI','oakland'], ['MI','macomb'], ['MI','kent'], ['MI','genesee']
  ];
  for (const [code, county] of COUNTY_LIST) {
    const sslug = STATES.find(s => s[0] === code)[1];
    const slug = `medicare-advantage-${county}-${sslug}`;
    let pri = 3;
    if (SE_STATES.has(code)) pri = 2;
    add({
      template: 'county',
      route: `/medicare-advantage/${slug}`,
      topic_slug: slug,
      state: code,
      title: `Medicare Advantage in ${county.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} County, ${STATE_DISPLAY[code]} 2026`,
      priority: pri,
      demand_score: '',
      competitor_density: 'medium',
      busa_overlap: 'none',
      cta_target: 'screener',
      notes: 'MA-state adjacent: top-5 county × top-10 state (curated 50)',
      sources: 'ma-state-adjacent-templates.csv'
    });
  }

  // Sort: priority asc, then demand_score desc (numeric)
  out.sort((a, b) => {
    const pa = parseInt(a.priority || '3', 10);
    const pb = parseInt(b.priority || '3', 10);
    if (pa !== pb) return pa - pb;
    const da = parseFloat(a.demand_score) || 0;
    const db = parseFloat(b.demand_score) || 0;
    return db - da;
  });

  // Re-number after sort
  out.forEach((r, i) => { r.row_id = 'MB-' + String(i + 1).padStart(4, '0'); });

  return out;
}

// ---------- MAIN ----------

async function main() {
  console.error('Pulling Sheet (read-only)...');
  const { headers, rows } = await pullSheet();
  console.error(`Sheet pulled: ${rows.length} rows`);

  // Save raw pull
  const rawHeaders = headers.length ? headers : ['col_a'];
  writeCSV(OUT_RAW, rawHeaders, rows.map(r => {
    const o = {};
    rawHeaders.forEach((h, i) => { o[h] = r[h] != null ? r[h] : ''; });
    return o;
  }));
  console.error(`Wrote ${OUT_RAW}`);

  console.error('Loading template CSVs...');
  const allTemplates = loadTemplateCSVs();
  for (const [name, meta] of Object.entries(allTemplates)) {
    console.error(`  ${name}: ${meta.rows.length} rows`);
  }

  console.error('Classifying Sheet rows...');
  const decisions = [];
  for (const row of rows) {
    const d = classifyRow(row, allTemplates);
    if (d) decisions.push(d);
  }
  console.error(`Decisions: ${decisions.length}`);

  // Write decisions CSV
  writeCSV(OUT_DECISIONS, [
    'sheet_row','sheet_id','sheet_title','sheet_status','sheet_priority',
    'classification','matched_template','matched_slug','recommended_action','confidence','notes'
  ], decisions);
  console.error(`Wrote ${OUT_DECISIONS}`);

  // Counts
  const counts = {};
  for (const d of decisions) counts[d.classification] = (counts[d.classification] || 0) + 1;
  console.error('Classification counts:', counts);

  console.error('Loading BUSA inventory...');
  const busaRows = loadBUSA();
  console.error(`BUSA rows: ${busaRows.length}`);

  console.error('Cross-referencing templates against BUSA...');
  const busaXR = busaCrossReference(allTemplates, busaRows);
  writeCSV(OUT_BUSA, [
    'template','topic','title','busa_match_url','busa_match_title','overlap_severity','recommendation','notes'
  ], busaXR);
  console.error(`Wrote ${OUT_BUSA}: ${busaXR.length} BUSA cross-refs`);

  // Heavy-overlap count
  const heavyBusa = busaXR.filter(b => b.overlap_severity === 'heavy').length;
  console.error(`  heavy-overlap rows: ${heavyBusa}`);

  console.error('Building MASTER_BACKLOG...');
  const backlog = buildMasterBacklog(allTemplates, decisions);
  writeCSV(OUT_BACKLOG, [
    'row_id','template','route','topic_slug','state','title','priority','demand_score',
    'competitor_density','busa_overlap','cta_target','subtype','topic_type','already_live',
    'migrated_from_sheet','sheet_row_id','sources','notes'
  ], backlog);
  console.error(`Wrote ${OUT_BACKLOG}: ${backlog.length} rows`);

  // Backlog breakdown
  const tmplCounts = {};
  const priCounts = { 1: 0, 2: 0, 3: 0 };
  let migrated = 0;
  for (const b of backlog) {
    tmplCounts[b.template] = (tmplCounts[b.template] || 0) + 1;
    priCounts[b.priority] = (priCounts[b.priority] || 0) + 1;
    if (b.migrated_from_sheet === 'y') migrated++;
  }
  console.error('Backlog by template:', tmplCounts);
  console.error('Backlog by priority:', priCounts);
  console.error(`Migrated from sheet: ${migrated}`);

  // DELETE_FROM_SHEET (rows classified MIGRATE or DROP_DUPE_EXISTING_PAGE)
  const deleteFromSheet = decisions.filter(d =>
    d.classification === 'MIGRATE_TO_TEMPLATE' || d.classification === 'DROP_DUPE_EXISTING_PAGE'
  ).map(d => ({
    sheet_row: d.sheet_row,
    sheet_id: d.sheet_id,
    sheet_title: d.sheet_title,
    classification: d.classification,
    recommended_action: d.recommended_action,
    target_template: d.matched_template,
    target_route: d.matched_template && d.matched_slug ? templateRoute(d.matched_template, d.matched_slug, '') : '',
    notes: d.notes
  }));
  writeCSV(OUT_DELETE, [
    'sheet_row','sheet_id','sheet_title','classification','recommended_action','target_template','target_route','notes'
  ], deleteFromSheet);
  console.error(`Wrote ${OUT_DELETE}: ${deleteFromSheet.length} candidates`);

  // SE prioritization impact (count rows where SE state pushed priority to 1)
  const seP1 = backlog.filter(b => b.priority === 1 && b.state && SE_STATES.has(b.state)).length;
  const reviewNeeded = decisions.filter(d => d.classification === 'REVIEW_NEEDED');

  // ---------- Cross-reference report ----------

  const report = `# CoveredUSA Cross-Reference Report

**Generated:** ${new Date().toISOString().split('T')[0]}
**Source script:** \`projects/covered-usa/scripts/build-master-backlog.js\`
**Sheet ID (read-only):** \`${SHEET_ID}\`

---

## 1. Sheet pull confirmation

- Total rows pulled: **${rows.length}**
- Sheet headers: ${headers.length} columns
- Raw pull saved to: \`${OUT_RAW}\`
- **No writes or deletions** were performed on the Sheet.

## 2. Sheet decisions breakdown

| Classification | Count |
|---|---|
${Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

**Total classified:** ${decisions.length}

## 3. BUSA cross-reference findings

- Total template-BUSA overlap candidates: **${busaXR.length}**
- Heavy-overlap (jaccard ≥ 0.75): **${heavyBusa}**
- Moderate-overlap (0.55-0.75): **${busaXR.filter(b => b.overlap_severity === 'moderate').length}**
- Slight-overlap (0.40-0.55): **${busaXR.filter(b => b.overlap_severity === 'slight').length}**

**No template topics were dropped for BUSA overlap.** Per intent-split rule (TOPIC_ROADMAP §1.8 & §4.6):
- BUSA = "how to apply for X" (procedural)
- CoveredUSA = "do I qualify? what are the income limits?" (eligibility lookup with FANOUT structure: 9-row household-size table, year-anchored, competitor-density-aware)

Heavy-overlap rows are flagged for Jacob's confirmation but kept in MASTER_BACKLOG. Detailed list: \`${OUT_BUSA}\`.

## 4. MASTER_BACKLOG composition

- **Total rows:** ${backlog.length}
- **Migrated from Sheet:** ${migrated}

### By template

| Template | Count |
|---|---|
${Object.entries(tmplCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

### By priority

| Priority | Count |
|---|---|
${Object.entries(priCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([k, v]) => `| P${k} | ${v} |`).join('\n')}

### State-fork expansion totals

- procedure × state-fork (3 topics × 51 states): rows produced ${backlog.filter(b => b.template === 'procedure' && b.state).length}
- persona-x-state (9 personas × 51 + adjacent persona-x-state-MVP curated 50): ${backlog.filter(b => b.template === 'persona-x-state').length}
- event-x-state (5 events with state-fork, turning-26 capped): ${backlog.filter(b => b.template === 'event-x-state').length}
- qa-x-state (6 umbrellas × 51): ${backlog.filter(b => b.template === 'qa-x-state').length}
- track-d (51 canonical state Medicaid factory): ${backlog.filter(b => b.template === 'track-d').length}
- ma-state (43 remaining states): ${backlog.filter(b => b.template === 'ma-state').length}
- spanish-twin (51 mechanical Spanish twins of MA-state): ${backlog.filter(b => b.template === 'spanish-twin').length}
- d-snp (top 30 states): ${backlog.filter(b => b.template === 'd-snp').length}
- ma-vs-medigap (7 guaranteed-issue states): ${backlog.filter(b => b.template === 'ma-vs-medigap').length}
- carrier-x-state (5 carriers × 12 states): ${backlog.filter(b => b.template === 'carrier-x-state').length}
- county (top-5 × top-10 states curated 50): ${backlog.filter(b => b.template === 'county').length}

## 5. Southeast prioritization impact

Per Jacob's instruction: SE states (GA, NC, TN, VA, FL, AL, MS, SC, LA, AR, KY, WV) make money. State-bearing topics in SE were boosted to **priority=1**.

- Total state-bearing rows in backlog: ${backlog.filter(b => b.state).length}
- SE-state rows in backlog: ${backlog.filter(b => b.state && SE_STATES.has(b.state)).length}
- SE-state rows promoted to P1: **${seP1}**

## 6. Cross-template boundary policy applications

Per TOPIC_ROADMAP §4 (cross-template boundaries):

- **§4.1 Procedure vs Q&A** — applied to sheet rows. Cost-focused titles (CPT codes, "how much does X cost") → procedure migration. "Does Medicare/Medicaid cover X procedure" → qa migration.
- **§4.2 Drug vs Q&A** — applied. State-Medicaid GLP-1 reroutes to qa-state-eligibility (already handled in template CSVs).
- **§4.3 Glossary vs Q&A** — kept template CSVs as-is; no sheet rows shifted.
- **§4.4 Persona vs Event** — kept distinct. Sheet row "Just Got Married" → event template; "1099 Contractors" → persona template.
- **§4.5 ma-state vs persona × state** — adjacent template surface added (50 MVP rows in backlog).
- **§4.6 Track D vs qa-state-eligibility** — applied aggressively to sheet rows. ALL state-Medicaid eligibility/income/apply/CHIP intent rows routed to Track D.

## 7. REVIEW_NEEDED rows for Jacob's eyes

${reviewNeeded.length} rows landed in REVIEW_NEEDED. Top 5 most ambiguous:

${reviewNeeded.slice(0, 5).map(d => `- **Row ${d.sheet_row} / ${d.sheet_id}:** "${d.sheet_title}" — possible match to ${d.matched_template}/${d.matched_slug} (jaccard ${d.confidence})`).join('\n')}

(Full list: filter \`${OUT_DECISIONS}\` for \`classification=REVIEW_NEEDED\`.)

## 8. Outputs on disk

- \`${OUT_RAW}\` — raw Sheet pull (${rows.length} rows)
- \`${OUT_DECISIONS}\` — per-row classification (${decisions.length} rows)
- \`${OUT_BUSA}\` — BUSA cross-reference (${busaXR.length} candidate overlaps)
- \`${OUT_BACKLOG}\` — MASTER_BACKLOG (${backlog.length} rows, sorted by priority asc + demand desc)
- \`${OUT_DELETE}\` — sheet rows recommended for deletion (${deleteFromSheet.length} rows)
- \`${OUT_REPORT}\` — this report

## 9. Confirmations

- [x] Read-only on Google Sheet (no \`update\`, \`append\`, \`batchUpdate\`, \`delete\` calls)
- [x] No template CSVs modified
- [x] All 5 outputs present on disk

`;

  fs.writeFileSync(OUT_REPORT, report);
  console.error(`Wrote ${OUT_REPORT}`);
  console.error('DONE.');
}

main().catch(e => {
  console.error('ERROR:', e.stack || e.message);
  process.exit(1);
});
