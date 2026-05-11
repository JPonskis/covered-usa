import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client with service role key - bypasses RLS
// Only use server-side (API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
