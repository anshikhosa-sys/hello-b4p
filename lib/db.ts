// server-side supabase client.
// until sign-in lands (phase 6) pages read with the service role key on the server only.
// that key never reaches the browser, and the app isn't deployed until phase 7.
// phase 6 switches page reads to the signed-in user's session so rls applies.
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

export function serverDb(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // no keys: the app falls back to built-in sample data
  client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return client;
}
