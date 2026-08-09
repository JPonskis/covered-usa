import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      supabase = createClient(url, key);
    }
  }
  return supabase;
}

const BOT_RE = /bot|crawl|spider|slurp|mediapartners|headless|preview|monitor/i;

const SEARCH_HOSTS: Array<[RegExp, string]> = [
  [/(^|\.)bing\.com$/, 'bing'],
  [/(^|\.)google\./, 'google'],
  [/(^|\.)duckduckgo\.com$/, 'duckduckgo'],
  [/(^|\.)search\.yahoo\.com$/, 'yahoo'],
  [/(^|\.)ecosia\.org$/, 'ecosia'],
  [/(^|\.)search\.brave\.com$/, 'brave'],
];

const SOCIAL_HOSTS =
  /(^|\.)(facebook\.com|m\.facebook\.com|instagram\.com|tiktok\.com|twitter\.com|x\.com|reddit\.com|linkedin\.com|youtube\.com|pinterest\.com|t\.co)$/;

/**
 * Where did this visit come from? Classified server-side from the referrer so
 * we get one consistent vocabulary in the DB instead of raw URLs.
 *
 * Note: on client-side (next/link) navigation document.referrer does NOT update,
 * so later pageviews in a session carry the session's ENTRY referrer. That is
 * deliberate — it means every row is attributable, and the stats script takes
 * the first row per session when it needs a true entry source.
 */
function classifySource(referrer: string | null, aiSource: string | null, selfHost: string): string {
  if (aiSource) return `ai:${aiSource}`;
  if (!referrer) return 'direct';

  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return 'other';
  }

  if (host === selfHost || host.endsWith('.' + selfHost)) return 'internal';
  for (const [re, name] of SEARCH_HOSTS) {
    if (re.test(host)) return name;
  }
  if (SOCIAL_HOSTS.test(host)) return 'social';
  return 'other';
}

function referrerHost(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const ua: string = body.user_agent || request.headers.get('user-agent') || '';
    if (BOT_RE.test(ua)) {
      return NextResponse.json({ ok: true, skipped: 'bot' });
    }

    const db = getSupabase();
    if (!db) {
      console.error('[analytics] NO DB — Supabase env vars missing, pageview dropped');
      return NextResponse.json({ ok: false, error: 'no_db' });
    }

    const path: string = body.path || '/';
    const referrer: string | null = body.referrer || null;
    const aiSource: string | null = body.ai_source || null;
    const country = request.headers.get('x-vercel-ip-country') || null;
    const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop';

    const selfHost = (process.env.NEXT_PUBLIC_SITE_URL || 'https://coveredusa.org')
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .toLowerCase();

    const source = classifySource(referrer, aiSource, selfHost);

    // Every non-bot pageview. This is the table that answers
    // "how many people opened the bill analyzer".
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: pvError } = await (db as any).from('covered_usa_pageviews').insert({
      session_id: body.session_id || null,
      path,
      referrer_url: referrer,
      referrer_host: referrerHost(referrer),
      source,
      ai_source: aiSource,
      device,
      country,
      user_agent: ua || null,
    });

    // A write that fails must not report success. The client ignores this body,
    // but the status/log make a broken tracker visible instead of invisible.
    if (pvError) {
      console.error('[analytics] PAGEVIEW INSERT FAILED:', pvError.message, pvError);
    }

    // AI-sourced visits also land in the dedicated table the AI-referral
    // reporting reads from.
    let aiError: { message: string } | null = null;
    if (aiSource) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (db as any).from('covered_usa_ai_analytics').insert({
        page_path: path,
        referrer_url: referrer,
        ai_source: aiSource,
        referrer_type: 'chat_referral',
        user_agent: ua || null,
        country,
        device,
      });
      aiError = res.error;
      if (aiError) {
        console.error('[analytics] AI INSERT FAILED:', aiError.message, aiError);
      }
    }

    if (pvError || aiError) {
      return NextResponse.json(
        { ok: false, error: pvError?.message || aiError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, source });
  } catch (err) {
    console.error('[analytics] error:', err);
    return NextResponse.json({ ok: false, error: 'exception' }, { status: 500 });
  }
}
