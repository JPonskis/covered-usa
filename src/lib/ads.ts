/**
 * Display advertising: where it is allowed to render, and nothing else.
 *
 * The rule is an ALLOWLIST of content routes. Anything not listed gets no ad
 * script and no ad unit, so a new tool route is ad-free by default instead of
 * ad-carrying by accident. Three promises depend on this file staying strict:
 *   - /health-data-privacy: "We do not use consumer health data for
 *     advertising, marketing profiling, or sale to data brokers" and "We do not
 *     share consumer health data with: data brokers, advertising networks..."
 *     are true only while the screener, results and bill analyzer never load an
 *     ad script.
 *   - /privacy (Advertising section): "The screener, your results, and the bill
 *     analyzer never load advertising."
 *   - home.privacy1Desc: "the screener and your results never [show ads]."
 *
 * Routes that must NEVER match, and are asserted in scripts/check-ads-routes.mjs:
 *   /en /es                          the home page
 *   /en/screener                     the screening surface
 *   /en/results/<id>                 a person's own eligibility results
 *   /en/medical-bill-analyzer[/...]  upload, analyze and results
 *   /en/comenzar                     the paid-ad landing route
 *   /en/about /privacy /terms        legal and institutional pages
 *   /en/do-not-sell                  the CCPA opt-out form
 *   /en/health-data-privacy          the health-data promise itself
 *   /en/contact /editorial-standards
 *   /en/blog                         the index (articles are allowed, the list is not)
 *   /api/*                           never rendered, never an ad surface
 *
 * scripts/check-ads-routes.mjs imports THIS module (Node strips the types) and
 * asserts both lists, and it runs in prebuild.
 */

const CONTENT_ROUTE = new RegExp(
  '^/(en|es)/(' +
    [
      'blog/[^/]+', // articles, never the /blog index
      'qa/[^/]+',
      'drug/[^/]+',
      'cost/[^/]+',
      'event/[^/]+',
      'for/[^/]+',
      'glossary/[^/]+',
      'medicare-advantage/[^/]+',
      // The only listed route whose index is also a content page: it is a
      // reference table of state limits, ranked with the flat pages below in
      // sitemap.ts, not a listing of links.
      'medicaid-income-limits(/[^/]+)?',
      'aca-income-limits',
      'federal-poverty-level',
      'medicare-eligibility',
    ].join('|') +
    ')/?$',
);

/** True only for a route where display ads may load. */
export function adsAllowedOnPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const p = pathname.split('?')[0].split('#')[0];
  return CONTENT_ROUTE.test(p);
}

/** `ca-pub-…` from NEXT_PUBLIC_ADSENSE_CLIENT, or null when ads are off. */
export function adsenseClient(): string | null {
  const raw = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '').trim();
  if (!raw) return null;
  const id = raw.startsWith('ca-') ? raw : `ca-${raw}`;
  return /^ca-pub-\d{10,20}$/.test(id) ? id : null;
}

/** Slot id for the in-article unit, or null (auto ads only). */
export function adsenseInArticleSlot(): string | null {
  const raw = (process.env.NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE || '').trim();
  return /^\d{6,12}$/.test(raw) ? raw : null;
}
