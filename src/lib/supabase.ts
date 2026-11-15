import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export interface SupabaseEnvInfo {
  url: string;
  anonKey: string;
  host: string;
  configured: boolean;
}

export interface SupabaseConnectionCheckResult {
  connected: boolean;
  tablesReady: boolean;
  authenticated: boolean;
  latencyMs: number;
  message: string;
}

export function getSupabaseEnvInfo(): SupabaseEnvInfo {
  const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  let host = '';
  if (url) {
    try {
      host = new URL(url).host;
    } catch {
      host = url;
    }
  }
  return {
    url,
    anonKey,
    host,
    configured: Boolean(url && anonKey && /^https?:\/\//i.test(url)),
  };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnvInfo().configured;
}

export function getSupabaseClient(): SupabaseClient | null {
  const env = getSupabaseEnvInfo();
  if (!env.configured) return null;

  if (!cachedClient) {
    cachedClient = createClient(env.url, env.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return cachedClient;
}

export async function testSupabaseConnection(): Promise<SupabaseConnectionCheckResult> {
  const start = performance.now();
  const client = getSupabaseClient();

  if (!client) {
    return {
      connected: false,
      tablesReady: false,
      authenticated: false,
      latencyMs: 0,
      message:
        'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set in environment variables.',
    };
  }

  try {
    const { data: sessionData, error: authError } = await client.auth.getSession();
    if (authError) {
      return {
        connected: false,
        tablesReady: false,
        authenticated: false,
        latencyMs: Math.round(performance.now() - start),
        message: `Auth check failed: ${authError.message}`,
      };
    }

    const { error: tableError } = await client
      .from('organizations')
      .select('id', { count: 'exact', head: true });

    const latencyMs = Math.round(performance.now() - start);
    const authenticated = Boolean(sessionData.session);

    if (tableError) {
      const missingTable =
        tableError.code === '42P01' ||
        tableError.message.toLowerCase().includes('does not exist') ||
        tableError.message.toLowerCase().includes('schema cache');

      if (missingTable) {
        return {
          connected: true,
          tablesReady: false,
          authenticated,
          latencyMs,
          message:
            'Connected to Supabase project, but CRM tables have not been created yet. Run schema.sql in the Supabase SQL Editor.',
        };
      }

      // RLS may block anonymous select if not signed in yet; connection itself succeeded
      if (tableError.code === '42501') {
        return {
          connected: true,
          tablesReady: true,
          authenticated,
          latencyMs,
          message: authenticated
            ? 'Connected to Supabase PostgreSQL & Auth (RLS active).'
            : 'Connected to Supabase! Tables & RLS detected — sign in with Supabase Auth to sync rows.',
        };
      }

      return {
        connected: true,
        tablesReady: false,
        authenticated,
        latencyMs,
        message: `Connected, schema check returned: ${tableError.message}`,
      };
    }

    return {
      connected: true,
      tablesReady: true,
      authenticated,
      latencyMs,
      message: 'Connected to Supabase PostgreSQL & Auth — schema is ready.',
    };
  } catch (err) {
    return {
      connected: false,
      tablesReady: false,
      authenticated: false,
      latencyMs: Math.round(performance.now() - start),
      message: err instanceof Error ? err.message : 'Unable to reach Supabase host.',
    };
  }
}
