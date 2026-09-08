/**
 * Asserts the display-ads allowlist against the routes that must carry ads and
 * the routes that must never carry them. Runs in `prebuild`, so a regex edit
 * that would put an ad tag on the screener fails the build instead of shipping.
 *
 * It imports the REAL src/lib/ads.ts rather than re-stating the regex: Node
 * strips the type annotations on import (>= 22.6 with type stripping, on by
 * default from 22.18). A copy of the rules here could pass while the module
 * shipped to users said something else, which is the whole failure this guards.
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const adsModule = path.join(here, '..', 'src', 'lib', 'ads.ts');

let adsAllowedOnPath;
try {
  ({ adsAllowedOnPath } = await import(adsModule));
} catch (err) {
  console.error('check-ads-routes: could not load src/lib/ads.ts');
  console.error(`  ${err && err.message}`);
  console.error('  Node >= 22.6 is required (TypeScript type stripping).');
  console.error(`  This Node is ${process.version}.`);
  process.exit(1);
}

// Ads MUST render here. A false is lost revenue, and a silent one.
const ALLOWED = [
  '/en/blog/aca-income-limits-2026',
  '/en/qa/does-medicare-cover-flu-shot',
  '/en/drug/wegovy-medicare-coverage',
  '/en/cost/mri',
  '/es/blog/x',
  '/en/event/lost-my-job',
  '/en/for/gig-workers',
  '/en/glossary/deductible',
  '/en/medicare-advantage/texas',
  '/en/medicaid-income-limits',
  '/en/medicaid-income-limits/texas',
  '/en/aca-income-limits',
  '/en/federal-poverty-level',
  '/en/medicare-eligibility',
  '/es/cost/mri/', // a trailing slash is the same page
  '/en/blog/aca-income-limits-2026?utm_source=x', // query strings are stripped
];

// Ads must NEVER render here. A true is a broken promise: the health-data
// policy, the privacy policy, and the home page all say so in words.
const FORBIDDEN = [
  '/en/screener',
  '/es/screener',
  '/en/results',
  '/en/results/abc123',
  '/en/medical-bill-analyzer',
  '/en/medical-bill-analyzer/analyze',
  '/en/medical-bill-analyzer/results/abc123',
  '/en',
  '/es',
  '/en/',
  '/',
  '/en/privacy',
  '/en/terms',
  '/en/about',
  '/en/do-not-sell',
  '/en/health-data-privacy',
  '/en/contact',
  '/en/editorial-standards',
  '/en/comenzar',
  '/es/comenzar',
  '/en/blog', // the index, not an article
  '/es/blog',
  '/api/lead',
  '/api/screen',
  '/ads.txt',
  '/robots.txt',
  '/sitemap.xml',
  '/fr/blog/x', // not a locale we serve
  '',
  null,
  undefined,
];

const failures = [];
for (const p of ALLOWED) {
  if (adsAllowedOnPath(p) !== true) failures.push(`ALLOWED but returned false: ${JSON.stringify(p)}`);
}
for (const p of FORBIDDEN) {
  if (adsAllowedOnPath(p) !== false) failures.push(`FORBIDDEN but returned true: ${JSON.stringify(p)}`);
}

if (failures.length > 0) {
  console.error(`check-ads-routes: ${failures.length} route(s) wrong`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}

console.log(
  `check-ads-routes: OK (${ALLOWED.length} allowed, ${FORBIDDEN.length} forbidden)`,
);
