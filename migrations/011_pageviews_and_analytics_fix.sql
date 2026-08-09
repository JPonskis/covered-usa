-- 2026-08-09 — fix two dead trackers and add real pageview tracking.
--
-- Applied to production on 2026-08-09 (run twice to prove idempotency).
--
-- Why: /api/analytics had NEVER written a row. It inserted referrer_url,
-- referrer_source, referrer_type, user_agent and device — none of which
-- existed on covered_usa_ai_analytics. PostgREST rejected every insert, the
-- route caught the error and returned 200, so the failure was invisible.
-- Same disease on /api/clinic-click, which inserted a clicked_at column that
-- does not exist (created_at already defaults to now(), so the code drops it
-- rather than the table gaining a duplicate timestamp).
--
-- covered_usa_pageviews is new: the site had no pageview analytics at all
-- (no GA4, no Vercel Analytics), so "how many people opened the bill
-- analyzer" was unanswerable. Now it isn't.

alter table covered_usa_ai_analytics
  add column if not exists referrer_url text,
  add column if not exists referrer_type text,
  add column if not exists user_agent text,
  add column if not exists device text;

create table if not exists covered_usa_pageviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text,            -- per-tab id, groups pageviews into a visit
  path text not null,
  referrer_url text,
  referrer_host text,
  source text,                -- bing | google | ai:<name> | social | internal | direct | other
  ai_source text,
  device text,                -- mobile | desktop
  country text,
  user_agent text
);

create index if not exists idx_cu_pageviews_created_at on covered_usa_pageviews (created_at desc);
create index if not exists idx_cu_pageviews_path on covered_usa_pageviews (path);
create index if not exists idx_cu_pageviews_session on covered_usa_pageviews (session_id);

-- No policies: service-role writes only, same as the other covered_usa tables.
alter table covered_usa_pageviews enable row level security;
