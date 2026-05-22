-- Adds dedicated columns for Medicare-flow data, replacing the temporary
-- "medicare:<status>:<needs>" encoding in the insurance_source column.
--
-- Until this runs, /api/screen continues writing the encoded format to
-- insurance_source and /api/lead parses it back out. After this migration runs,
-- update both routes to write/read the dedicated columns instead — see the
-- TODO in src/app/api/screen/route.ts and src/app/api/lead/route.ts.
--
-- Run via Supabase SQL Editor:
-- https://supabase.com/dashboard/project/<PROJECT_REF>/sql

ALTER TABLE covered_usa_submissions
  ADD COLUMN IF NOT EXISTS lead_focus      text,
  ADD COLUMN IF NOT EXISTS medicare_status text,
  ADD COLUMN IF NOT EXISTS medicare_needs  text;

-- Backfill from the encoded insurance_source format for any rows that already
-- went through the focus=medicare funnel before this migration ran.
UPDATE covered_usa_submissions
SET
  lead_focus       = 'medicare',
  medicare_status  = SPLIT_PART(insurance_source, ':', 2),
  medicare_needs   = SPLIT_PART(insurance_source, ':', 3),
  insurance_source = 'medicare'
WHERE insurance_source LIKE 'medicare:%';

CREATE INDEX IF NOT EXISTS covered_usa_submissions_lead_focus_idx ON covered_usa_submissions (lead_focus);
