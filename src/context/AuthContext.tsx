import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session as SupabaseSession } from '@supabase/supabase-js';
import { SEED_USERS } from '../data/seedData';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

const AUTH_USERS_KEY = 'nexora_auth_users_v1';
const AUTH_SESSION_KEY = 'nexora_auth_session_v1';

export interface AuthAccountRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  passwordHash: string;
  provider: 'email' | 'google' | 'apple';
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  name: string;
  email: string;
  role: string;
  provider: 'email' | 'google' | 'apple';
  signedInAt: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  message?: string;
}

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  registeredAccounts: AuthAccountRecord[];
  authProviderMode: 'local' | 'supabase';
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: { name: string; email: string; password: string; role: string }) => Promise<AuthResult>;
  signInWithProvider: (
    provider: 'google' | 'apple',
    profile?: { name: string; email: string }
  ) => Promise<AuthResult>;
  signInDemo: (email?: string) => void;
  resetPassword: (email: string, newPassword?: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function hashPassword(raw: string): string {
  let hash = 5381;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 33) ^ raw.charCodeAt(i);
  }
  return `nx_${(hash >>> 0).toString(16)}`;
}

function createInitialAccounts(): AuthAccountRecord[] {
  return SEED_USERS.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email.toLowerCase(),
    role: u.role,
    passwordHash: hashPassword('Nexora2025!'),
    provider: 'email',
    createdAt: u.createdAt,
  }));
}

function loadAccounts(): AuthAccountRecord[] {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    if (!raw) {
      const initial = createInitialAccounts();
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as AuthAccountRecord[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : createInitialAccounts();
  } catch {
    return createInitialAccounts();
  }
}

function loadLocalSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) {
      const defaultUser = SEED_USERS[0];
      const initialSession: AuthSession = {
        userId: defaultUser.id,
        name: defaultUser.name,
        email: defaultUser.email,
        role: defaultUser.role,
        provider: 'email',
        signedInAt: new Date().toISOString(),
      };
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(initialSession));
      return initialSession;
    }
    if (raw === 'null') return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

function mapSupabaseSession(sbSession: SupabaseSession | null): AuthSession | null {
  if (!sbSession?.user) return null;
  const u = sbSession.user;
  const meta = (u.user_metadata || {}) as Record<string, unknown>;
  const providerRaw = String(u.app_metadata?.provider || 'email').toLowerCase();
  const provider: AuthSession['provider'] =
    providerRaw === 'google' ? 'google' : providerRaw === 'apple' ? 'apple' : 'email';

  const fallbackName = u.email ? u.email.split('@')[0].replace(/[._]/g, ' ') : 'Workspace User';
  const name = String(meta.full_name || meta.name || fallbackName);

  return {
    userId: u.id,
    name,
    email: u.email || '',
    role: String(meta.role || 'Account Executive'),
    provider,
    signedInAt: u.last_sign_in_at || new Date().toISOString(),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabaseReady = isSupabaseConfigured();
  const [registeredAccounts, setRegisteredAccounts] = useState<AuthAccountRecord[]>(() => loadAccounts());
  const [session, setSession] = useState<AuthSession | null>(() =>
    supabaseReady ? null : loadLocalSession()
  );
  const [authLoading, setAuthLoading] = useState<boolean>(supabaseReady);

  // Sync Supabase Auth session when configured
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;
    client.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const mapped = mapSupabaseSession(data.session);
      setSession(mapped ?? loadLocalSession());
      setAuthLoading(false);
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, sbSession) => {
      if (!mounted) return;
      setSession(mapSupabaseSession(sbSession));
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(registeredAccounts));
    } catch {
      // ignore storage errors
    }
  }, [registeredAccounts]);

  useEffect(() => {
    if (supabaseReady) return;
    try {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore storage errors
    }
  }, [session, supabaseReady]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) {
        return { ok: false, error: 'Please enter both your email and password.' };
      }

      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client.auth.signInWithPassword({
          email: normalized,
          password,
        });
        if (error) {
          return { ok: false, error: error.message };
        }
        setSession(mapSupabaseSession(data.session));
        return { ok: true };
      }

      const found = registeredAccounts.find((a) => a.email.toLowerCase() === normalized);
      if (!found) {
        return { ok: false, error: 'No account found with that email address. Try signing up first.' };
      }

      if (found.passwordHash !== hashPassword(password)) {
        return { ok: false, error: 'Incorrect password. Please try again or use Forgot Password.' };
      }

      setSession({
        userId: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
        provider: found.provider,
        signedInAt: new Date().toISOString(),
      });
      return { ok: true };
    },
    [registeredAccounts]
  );

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string; role: string }): Promise<AuthResult> => {
      const cleanName = input.name.trim();
      const cleanEmail = input.email.trim().toLowerCase();
      const cleanRole = input.role.trim() || 'Account Executive';

      if (!cleanName || cleanName.length < 2) {
        return { ok: false, error: 'Please enter your full name.' };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { ok: false, error: 'Please enter a valid work email address.' };
      }
      if (input.password.length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters long.' };
      }

      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
          password: input.password,
          options: {
            data: {
              full_name: cleanName,
              role: cleanRole,
            },
          },
        });
        if (error) {
          return { ok: false, error: error.message };
        }
        if (data.session) {
          setSession(mapSupabaseSession(data.session));
          return { ok: true };
        }
        return {
          ok: true,
          message: 'Account created! Check your inbox to confirm your email address before signing in.',
        };
      }

      const exists = registeredAccounts.some((a) => a.email.toLowerCase() === cleanEmail);
      if (exists) {
        return { ok: false, error: 'An account with this email already exists. Please sign in instead.' };
      }

      const newRecord: AuthAccountRecord = {
        id: `user-${Date.now().toString(36)}`,
        name: cleanName,
        email: cleanEmail,
        role: cleanRole,
        passwordHash: hashPassword(input.password),
        provider: 'email',
        createdAt: new Date().toISOString(),
      };

      setRegisteredAccounts((prev) => [...prev, newRecord]);
      setSession({
        userId: newRecord.id,
        name: newRecord.name,
        email: newRecord.email,
        role: newRecord.role,
        provider: 'email',
        signedInAt: new Date().toISOString(),
      });
      return { ok: true };
    },
    [registeredAccounts]
  );

  const signInWithProvider = useCallback(
    async (
      provider: 'google' | 'apple',
      profile?: { name: string; email: string }
    ): Promise<AuthResult> => {
      const client = getSupabaseClient();
      if (client) {
        const { error } = await client.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) {
          return { ok: false, error: error.message };
        }
        return { ok: true };
      }

      const targetEmail = (profile?.email || 'alex.morgan@nexoracrm.io').trim().toLowerCase();
      const targetName = (profile?.name || 'Alex Morgan').trim();

      let account = registeredAccounts.find((a) => a.email.toLowerCase() === targetEmail);
      if (!account) {
        account = {
          id: `user-${Date.now().toString(36)}`,
          name: targetName,
          email: targetEmail,
          role: 'Sales Manager',
          passwordHash: hashPassword('OAuthProviderSession'),
          provider,
          createdAt: new Date().toISOString(),
        };
        setRegisteredAccounts((prev) => [...prev, account!]);
      }

      setSession({
        userId: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        provider,
        signedInAt: new Date().toISOString(),
      });
      return { ok: true };
    },
    [registeredAccounts]
  );

  const signInDemo = useCallback(
    (email = 'alex.morgan@nexoracrm.io') => {
      const account =
        registeredAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase()) ||
        registeredAccounts[0];
      if (!account) return;
      setSession({
        userId: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        provider: account.provider,
        signedInAt: new Date().toISOString(),
      });
    },
    [registeredAccounts]
  );

  const resetPassword = useCallback(
    async (email: string, newPassword = ''): Promise<AuthResult> => {
      const normalized = email.trim().toLowerCase();
      if (!normalized) return { ok: false, error: 'Enter your account email.' };

      const client = getSupabaseClient();
      if (client) {
        const { error } = await client.auth.resetPasswordForEmail(normalized, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) {
          return { ok: false, error: error.message };
        }
        return {
          ok: true,
          message: 'Password reset link sent to your email via Supabase Auth.',
        };
      }

      if (newPassword.length < 6) {
        return { ok: false, error: 'New password must be at least 6 characters.' };
      }
      const found = registeredAccounts.find((a) => a.email.toLowerCase() === normalized);
      if (!found) {
        return { ok: false, error: 'No registered account matches that email.' };
      }
      setRegisteredAccounts((prev) =>
        prev.map((a) =>
          a.email.toLowerCase() === normalized ? { ...a, passwordHash: hashPassword(newPassword) } : a
        )
      );
      return {
        ok: true,
        message: 'Password updated! You can now sign in with your new password.',
      };
    },
    [registeredAccounts]
  );

  const signOut = useCallback(async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    setSession(null);
    try {
      localStorage.setItem(AUTH_SESSION_KEY, 'null');
    } catch {
      // ignore storage errors
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: Boolean(session),
        authLoading,
        registeredAccounts,
        authProviderMode: supabaseReady ? 'supabase' : 'local',
        signIn,
        signUp,
        signInWithProvider,
        signInDemo,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
