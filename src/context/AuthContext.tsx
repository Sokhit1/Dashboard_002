import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SEED_USERS } from '../data/seedData';
import { getSupabaseConfig } from '../services/dataService';

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

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  registeredAccounts: AuthAccountRecord[];
  authProviderMode: 'local' | 'supabase';
  signIn: (email: string, password: string) => AuthResult;
  signUp: (input: { name: string; email: string; password: string; role: string }) => AuthResult;
  signInWithProvider: (provider: 'google' | 'apple', profile?: { name: string; email: string }) => void;
  signInDemo: (email?: string) => void;
  resetPassword: (email: string, newPassword: string) => AuthResult;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function hashPassword(raw: string): string {
  // Deterministic lightweight client-side digest for local demo auth
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

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) {
      // Auto-start with Alex Morgan demo session on first visit so dashboard is immediately usable
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredAccounts, setRegisteredAccounts] = useState<AuthAccountRecord[]>(() => loadAccounts());
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const supabase = getSupabaseConfig();

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(registeredAccounts));
    } catch {
      // ignore storage errors
    }
  }, [registeredAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore storage errors
    }
  }, [session]);

  const signIn = useCallback(
    (email: string, password: string): AuthResult => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) {
        return { ok: false, error: 'Please enter both your email and password.' };
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
    (input: { name: string; email: string; password: string; role: string }): AuthResult => {
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
    (provider: 'google' | 'apple', profile?: { name: string; email: string }) => {
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
    (email: string, newPassword: string): AuthResult => {
      const normalized = email.trim().toLowerCase();
      if (!normalized) return { ok: false, error: 'Enter your account email.' };
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
      return { ok: true };
    },
    [registeredAccounts]
  );

  const signOut = useCallback(() => {
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: Boolean(session),
        registeredAccounts,
        authProviderMode: supabase.configured ? 'supabase' : 'local',
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
