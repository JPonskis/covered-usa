-- CoveredUSA email drip columns
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/jqbjsqlaujgqiwwcrdsp/sql

ALTER TABLE covered_usa_submissions
  ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_welcome_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_day3_sent BOOLEAN DEFAULT FALSE;

-- Index for efficient followup cron queries
CREATE INDEX IF NOT EXISTS idx_covered_usa_followup
  ON covered_usa_submissions (email_welcome_sent, email_day3_sent, phone, unsubscribed, created_at)
  WHERE email IS NOT NULL;
