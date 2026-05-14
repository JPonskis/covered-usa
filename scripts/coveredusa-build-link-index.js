#!/usr/bin/env node
/**
 * coveredusa-build-link-index.js
 *
 * Auto-generates content/link-index.json — the routing map writer agents
 * consume to drop inline body links to canonical URLs. Zero human-edit
 * pipeline per LINK_TARGET_MANIFEST.md.
 *
 * Walks:
 *   - content/data/<template>/*.json  (procedures, drugs, qa, glossary,
 *     events, personas, medicare-advantage)
 *   - content/blog/*.md  (English) and content/blog/es/*.md  (Spanish)
 *   - content/data/hardcoded-pages.json  (sidecar for /federal-poverty-level,
 *     /medicaid-income-limits, /aca-income-limits, /medicare-eligibility,
 *     /medical-bill-analyzer, /medicare-costs, /aca-subsidy-cliff,
 *     /medicare-advantage hub, and the glossary lighthouse hub once shipped)
 *
 * Aggregates by topicCluster. For each cluster, picks the canonical URL by:
 *   1. Page with `isLighthouse: true` (hardcoded reference pages win ties)
 *   2. Oldest page (longest accumulated authority) — fallback only
 *
 * Validates sitewide invariants (no duplicate phrase mappings across
 * clusters, no two pages claim isLighthouse for the same cluster) and
 * exits non-zero on violation.
 *
 * Emits content/link-index.json with shape:
 *   { generatedAt, commit, byTopic, byPhrase, lighthouses }
 *
 * Wired into prebuild so the index is fresh every deploy.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(REPO_ROOT, 'content', 'data');
const BLOG_DIR = path.join(REPO_ROOT, 'content', 'blog');
const HARDCODED_PATH = path.join(DATA_DIR, 'hardcoded-pages.json');
const OUTPUT_PATH = path.join(REPO_ROOT, 'content', 'link-index.json');

// Template subdir → URL path prefix. Mirrors DATA_DIR_URL_PREFIX in
// coveredusa-indexnow-submit.js (kept in sync deliberately; if either
// gets a new template, update both).
const TEMPLATE_URL_PREFIX = {
  procedures: 'cost',
  drugs: 'drug',
  qa: 'qa',
  glossary: 'glossary',
  events: 'event',
  personas: 'for',
  'medicare-advantage': 'medicare-advantage',
};

function getCurrentCommit() {
  try {
    const { execSync } = require('child_process');
    return execSync('git rev-parse HEAD', { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function collectPages() {
  const pages = [];

  // ─── Template JSON data ─────────────────────────────────────────────
  for (const [subdir, urlPrefix] of Object.entries(TEMPLATE_URL_PREFIX)) {
    const tmplDir = path.join(DATA_DIR, subdir);
    if (!fs.existsSync(tmplDir)) continue;
    const files = fs.readdirSync(tmplDir).filter(
      f => f.endsWith('.json') && !f.startsWith('_'),
    );
    for (const file of files) {
      let data;
      try {
        data = JSON.parse(fs.readFileSync(path.join(tmplDir, file), 'utf8'));
      } catch (err) {
        console.warn(`  parse error: ${subdir}/${file} — ${err.message}`);
        continue;
      }
      if (data.isDeprecated === true) continue;
      const slug = data.slug || file.replace('.json', '');
      pages.push({
        url: `/${urlPrefix}/${slug}`,
        topicCluster: data.topicCluster,
        keyTerms: data.keyTerms,
        isLighthouse: Boolean(data.isLighthouse),
        lastUpdated: data.lastUpdated,
        source: `data/${subdir}/${file}`,
      });
    }
  }

  // ─── Blog markdown frontmatter ──────────────────────────────────────
  if (fs.existsSync(BLOG_DIR)) {
    const blogFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
    for (const file of blogFiles) {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
      const meta = parseFrontmatter(raw);
      if (!meta) continue;
      if (meta.isDeprecated === true) continue;
      const slug = file.replace('.md', '');
      pages.push({
        url: `/blog/${slug}`,
        topicCluster: meta.topicCluster,
        keyTerms: meta.keyTerms,
        isLighthouse: Boolean(meta.isLighthouse),
        lastUpdated: meta.date || meta.lastUpdated,
        source: `blog/${file}`,
      });
    }
  }

  // ─── Hardcoded reference pages (single sidecar file) ───────────────
  if (fs.existsSync(HARDCODED_PATH)) {
    let hardcoded;
    try {
      hardcoded = JSON.parse(fs.readFileSync(HARDCODED_PATH, 'utf8'));
    } catch (err) {
      console.warn(`  parse error: hardcoded-pages.json — ${err.message}`);
      hardcoded = [];
    }
    for (const entry of hardcoded) {
      if (entry.isDeprecated === true) continue;
      pages.push({
        url: entry.url,
        topicCluster: entry.topicCluster,
        keyTerms: entry.keyTerms,
        isLighthouse: Boolean(entry.isLighthouse),
        isPlanned: Boolean(entry.isPlanned),
        lastUpdated: entry.lastUpdated || null,
        source: 'hardcoded-pages.json',
      });
    }
  }

  return pages;
}

/** Minimal YAML frontmatter parser — handles strings, booleans, dates,
 *  one-level objects ({en: [], es: []}) and arrays. Avoids a gray-matter dep. */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const yaml = m[1];
  // Very small subset YAML — line by line key parsing.
  const obj = {};
  const lines = yaml.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const km = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (!km) { i++; continue; }
    const key = km[1];
    let value = km[2].trim();
    if (value === '') {
      // Possible nested block — look for indented children
      const children = {};
      let j = i + 1;
      while (j < lines.length && /^\s{2,}/.test(lines[j])) {
        const cm = lines[j].match(/^\s+([a-zA-Z][\w-]*):\s*(.*)$/);
        if (cm) {
          let cv = cm[2].trim();
          if (cv.startsWith('[') && cv.endsWith(']')) {
            children[cm[1]] = cv.slice(1, -1).split(',').map(s =>
              s.trim().replace(/^["']|["']$/g, '')
            ).filter(Boolean);
          } else {
            children[cm[1]] = cv.replace(/^["']|["']$/g, '');
          }
        }
        j++;
      }
      obj[key] = children;
      i = j;
      continue;
    }
    if (value.startsWith('[') && value.endsWith(']')) {
      obj[key] = value.slice(1, -1).split(',').map(s =>
        s.trim().replace(/^["']|["']$/g, '')
      ).filter(Boolean);
    } else if (value === 'true' || value === 'false') {
      obj[key] = value === 'true';
    } else {
      obj[key] = value.replace(/^["']|["']$/g, '');
    }
    i++;
  }
  return obj;
}

function buildIndex(pages) {
  const byCluster = new Map();
  const phraseToCluster = { en: {}, es: {} };
  const lighthouses = [];
  const warnings = [];
  const errors = [];

  for (const page of pages) {
    if (!page.topicCluster) {
      warnings.push(`${page.source} missing topicCluster — skipped`);
      continue;
    }
    if (!page.keyTerms || !page.keyTerms.en || !page.keyTerms.es) {
      warnings.push(`${page.source} missing keyTerms.{en,es} — skipped`);
      continue;
    }
    if (!byCluster.has(page.topicCluster)) {
      byCluster.set(page.topicCluster, { lighthouse: null, lighthouseRank: -1, spokes: [] });
    }
    const entry = byCluster.get(page.topicCluster);

    // Lighthouse selection: hardcoded sidecar entries win ties; isLighthouse=true
    // wins over false; oldest lastUpdated wins among same-rank.
    const rank = page.isLighthouse
      ? (page.source === 'hardcoded-pages.json' ? 3 : 2)
      : 1;
    if (entry.lighthouse === null || rank > entry.lighthouseRank) {
      if (entry.lighthouse) entry.spokes.push(entry.lighthouse);
      entry.lighthouse = page.url;
      entry.lighthouseRank = rank;
    } else if (rank === entry.lighthouseRank && page.isLighthouse) {
      // Two pages both claim isLighthouse in same cluster — hard error
      errors.push(
        `cluster "${page.topicCluster}" has two lighthouse claims: ` +
        `${entry.lighthouse} and ${page.url}`,
      );
    } else {
      entry.spokes.push(page.url);
    }

    // Phrase mapping
    for (const locale of ['en', 'es']) {
      const terms = page.keyTerms[locale] || [];
      for (const term of terms) {
        const existing = phraseToCluster[locale][term];
        if (existing && existing !== page.topicCluster) {
          errors.push(
            `phrase "${term}" (${locale}) maps to two clusters: ` +
            `"${existing}" and "${page.topicCluster}"`,
          );
        } else {
          phraseToCluster[locale][term] = page.topicCluster;
        }
      }
    }
  }

  // Materialize byTopic + lighthouses
  const byTopic = {};
  for (const [cluster, entry] of byCluster.entries()) {
    byTopic[cluster] = {
      lighthouse: entry.lighthouse,
      spokes: entry.spokes,
    };
    if (entry.lighthouse) lighthouses.push(entry.lighthouse);
  }

  return {
    index: {
      generatedAt: new Date().toISOString(),
      commit: getCurrentCommit(),
      byTopic,
      byPhrase: phraseToCluster,
      lighthouses: lighthouses.sort(),
    },
    warnings,
    errors,
  };
}

function main() {
  console.log(`Building link index from ${DATA_DIR} + ${BLOG_DIR} + ${HARDCODED_PATH}...`);
  const pages = collectPages();
  console.log(`  collected ${pages.length} pages`);

  const { index, warnings, errors } = buildIndex(pages);

  for (const w of warnings) console.warn(`  ⚠️  ${w}`);
  for (const e of errors) console.error(`  ❌ ${e}`);

  console.log(`  clusters: ${Object.keys(index.byTopic).length}`);
  console.log(`  lighthouses: ${index.lighthouses.length}`);
  console.log(`  phrase mappings: ${Object.keys(index.byPhrase.en).length} en / ${Object.keys(index.byPhrase.es).length} es`);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2) + '\n');
  console.log(`  wrote ${OUTPUT_PATH}`);

  if (errors.length > 0) {
    console.error(`Link-index build failed with ${errors.length} errors.`);
    process.exit(1);
  }
  console.log('Done.');
}

main();
