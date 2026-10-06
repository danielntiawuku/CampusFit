import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when real credentials have been supplied via .env */
export const isSupabaseConfigured = Boolean(
  url &&
    anonKey &&
    !url.includes('YOUR-PROJECT-REF') &&
    !anonKey.startsWith('YOUR-')
);

let client: SupabaseClient | null = null;

/**
 * Returns the shared Supabase client.
 * Throws only when actually used without configuration, so the UI can render
 * in a demo/offline mode instead of crashing on import.
 */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Copy .env.example to .env and set ' +
        'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }
  if (!client) {
    client = createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

/** Non-throwing accessor for code paths that support demo mode. */
export function supabaseOrNull(): SupabaseClient | null {
  try {
    return getSupabase();
  } catch {
    return null;
  }
}
