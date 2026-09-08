import { NextResponse } from 'next/server';

/**
 * /ads.txt, generated from env so the publisher id never has to be committed
 * and the file can be swapped to a different network's list without a code
 * change. With no id configured it 404s: an empty ads.txt is worse than none
 * (networks read it as "this site authorizes nobody").
 *
 *   ADSENSE_PUBLISHER_ID  pub-1234567890123456   (AdSense → Account → Publisher ID)
 *   ADS_TXT_EXTRA_LINES   optional, newline-separated lines a network hands you
 *
 * src/middleware.ts matches `/((?!api|_next|_vercel|monitoring|.*\..*).*)`,
 * which excludes any path containing a dot. That is why this is reachable at
 * the root and not redirected to /en/ads.txt.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  const pub = (process.env.ADSENSE_PUBLISHER_ID || '').trim().replace(/^ca-/, '');
  const extra = (process.env.ADS_TXT_EXTRA_LINES || '')
    .split(/\r?\n|\\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const lines: string[] = [];
  if (/^pub-\d{10,20}$/.test(pub)) lines.push(`google.com, ${pub}, DIRECT, f08c47fec0942fa0`);
  lines.push(...extra);
  if (lines.length === 0) {
    return new NextResponse('Not found', { status: 404, headers: { 'content-type': 'text/plain' } });
  }
  return new NextResponse(lines.join('\n') + '\n', {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}
