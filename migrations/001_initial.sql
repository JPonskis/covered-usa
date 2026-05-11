-- CoveredUSA initial schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/jqbjsqlaujgqiwwcrdsp/sql

-- Table 1: Main submissions
CREATE TABLE IF NOT EXISTS covered_usa_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  state TEXT,
  age INT,
  household_size INT,
  annual_income NUMERIC,
  employment_status TEXT,
  is_pregnant BOOLEAN DEFAULT FALSE,
  has_disability BOOLEAN DEFAULT FALSE,
  currently_insured BOOLEAN,
  insurance_source TEXT,
  citizenship_status TEXT,
  is_veteran BOOLEAN DEFAULT FALSE,
  num_children INT DEFAULT 0,
  eligible_programs JSONB,
  first_name TEXT,
  phone TEXT,
  email TEXT,
  language TEXT DEFAULT 'en',
  language_preference TEXT,
  wants_help BOOLEAN DEFAULT FALSE,
  lead_captured_at TIMESTAMPTZ,
  lead_sent_to_broker BOOLEAN DEFAULT FALSE,
  broker_sent_at TIMESTAMPTZ,
  enrollment_confirmed BOOLEAN DEFAULT FALSE,
  enrollment_confirmed_at TIMESTAMPTZ,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ai_source TEXT,
  referral_url TEXT
);

-- Table 2: AI analytics
CREATE TABLE IF NOT EXISTS covered_usa_ai_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  page_path TEXT,
  ai_source TEXT,
  country TEXT
);

-- Enable RLS
ALTER TABLE covered_usa_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE covered_usa_ai_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies: service role can do everything, anon can insert
CREATE POLICY "service_role_all_submissions" ON covered_usa_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "anon_insert_submissions" ON covered_usa_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_submissions" ON covered_usa_submissions FOR SELECT TO anon USING (true);
CREATE POLICY "service_role_all_analytics" ON covered_usa_ai_analytics FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "anon_insert_analytics" ON covered_usa_ai_analytics FOR INSERT TO anon WITH CHECK (true);
