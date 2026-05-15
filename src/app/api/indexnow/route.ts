import { NextResponse } from 'next/server';

// Canonical Bing-verified IndexNow key for coveredusa.org. Daily cron's
// submit script (scripts/coveredusa-indexnow-submit.js) uses this same key.
// The unverified key b5a600e3...46 was replaced 2026-05-15 after IndexNow
// returned 403 "UserForbiddedToAccessSite" on a 114-URL backfill submission.
// Public key file: public/32f9a841f2ea4b809f1a21a529c1e6f6.txt
const INDEXNOW_KEY = '32f9a841f2ea4b809f1a21a529c1e6f6';

export async function GET() {
  return new NextResponse(INDEXNOW_KEY + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
