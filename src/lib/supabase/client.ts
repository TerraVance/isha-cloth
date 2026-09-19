import { createClient } from '@supabase/supabase-js';

/**
 * Browser-side Supabase client.
 * Uses the anon key — safe to expose to the client.
 * Subject to Row Level Security (RLS) policies.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
