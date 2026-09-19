import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase admin client.
 * Uses the service_role key — FULL database access, bypasses RLS.
 * ⚠️ NEVER import this in client components or expose to the browser.
 * Use ONLY in: API routes, Server Components, Server Actions.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
