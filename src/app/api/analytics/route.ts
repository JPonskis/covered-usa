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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Only track AI-sourced visits — skip everything else
    if (!body.ai_source) {
      return NextResponse.json({ ok: true, skipped: 'not_ai' });
    }

    const db = getSupabase();
    if (!db) {
      return NextResponse.json({ ok: true, skipped: 'no_db' });
    }

    const country = request.headers.get('x-vercel-ip-country') || null;
    const ua = body.user_agent || '';
    const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).from('covered_usa_ai_analytics').insert({
      page_path: body.path || '/',
      referrer_url: body.referrer || null,
      referrer_source: body.ai_source,
      referrer_type: 'chat_referral',
      user_agent: ua || null,
      country,
      device,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[analytics] error:', err);
    return NextResponse.json({ ok: true, skipped: 'error' });
  }
}
