import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Mail,
  Lock,
  User,
  Briefcase,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'signin' | 'signup' | 'forgot';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'signin' }) => {
  const { signIn, signUp, signInWithProvider, signInDemo, resetPassword, authProviderMode } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialMode === 'signup' ? '' : 'alex.morgan@nexoracrm.io');
  const [role, setRole] = useState('Account Executive');
  const [password, setPassword] = useState(initialMode === 'signup' ? '' : 'Nexora2025!');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Quick provider modal state for Google / Apple sign-in
  const [providerPrompt, setProviderPrompt] = useState<'google' | 'apple' | null>(null);
  const [providerName, setProviderName] = useState('Sokhit');
  const [providerEmail, setProviderEmail] = useState('sokhit1@gmail.com');

  const passwordScore =
    (password.length >= 6 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError('');
    setSuccessMsg('');
    if (next === 'signup') {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else if (next === 'signin') {
      setEmail('alex.morgan@nexoracrm.io');
      setPassword('Nexora2025!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'signin') {
      const res = signIn(email, password);
      if (!res.ok) {
        setError(res.error || 'Unable to sign in.');
        return;
      }
      navigate('/', { replace: true });
    } else if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      const res = signUp({ name, email, password, role });
      if (!res.ok) {
        setError(res.error || 'Unable to create account.');
        return;
      }
      navigate('/', { replace: true });
    } else {
      const res = resetPassword(email, password);
      if (!res.ok) {
        setError(res.error || 'Unable to reset password.');
        return;
      }
      setSuccessMsg('Password updated! You can now sign in with your new password.');
      setMode('signin');
    }
  };

  const handleProviderContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerPrompt) return;
    signInWithProvider(providerPrompt, {
      name: providerName.trim() || 'Alex Morgan',
      email: providerEmail.trim() || 'alex.morgan@nexoracrm.io',
    });
    setProviderPrompt(null);
    navigate('/', { replace: true });
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200/80 bg-white/85 py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0AA6AD] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0AA6AD]/12 transition-all dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100';

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#09254A] via-[#0B2D59] to-[#084D5B] p-4">
      {/* Subtle Ambient Orbs */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[#0AA6AD]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[#FF6155]/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        className="relative z-10 w-full max-w-md rounded-[28px] border border-white/25 bg-white/92 p-6 sm:p-8 shadow-[0_28px_70px_-15px_rgba(0,0,0,0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/92"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#09254A] shadow-lg ring-1 ring-white/20">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
              <path
                d="M4 5L12 19L20 5"
                stroke="#0AA6AD"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 5L12 11.5L15.5 5"
                stroke="#38D9DF"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="mt-3.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Nexora CRM
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {mode === 'signin'
              ? 'Sign in to access your sales pipeline and analytics'
              : mode === 'signup'
              ? 'Create your workspace account in seconds'
              : 'Reset your account password'}
          </p>
        </div>

        {/* iOS Segmented Mode Switcher */}
        {mode !== 'forgot' && (
          <div className="mt-6 flex rounded-full bg-slate-100 p-1 dark:bg-slate-800">
            {(
              [
                { id: 'signin', label: 'Sign In' },
                { id: 'signup', label: 'Sign Up' },
              ] as const
            ).map((tab) => {
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchMode(tab.id)}
                  className={`relative flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
                    active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="auth-mode-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-white shadow-xs dark:bg-slate-700"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 flex items-start gap-2 rounded-2xl bg-[#FF6155]/10 px-3.5 py-2.5 text-xs font-medium text-[#FF6155]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 flex items-start gap-2 rounded-2xl bg-emerald-500/10 px-3.5 py-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Role / Title
                </label>
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Sales Manager"
                    className={inputCls}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Work Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {mode === 'forgot' ? 'New Password' : 'Password'}
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-[11px] font-semibold text-[#0AA6AD] hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {mode === 'signup' && password.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5">
                {[1, 2, 3, 4].map((lvl) => (
                  <span
                    key={lvl}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordScore >= lvl
                        ? passwordScore >= 3
                          ? 'bg-[#0AA6AD]'
                          : 'bg-amber-400'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
                <span className="text-[10px] text-slate-400 ml-1">
                  {passwordScore >= 3 ? 'Strong' : 'Fair'}
                </span>
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls}
                />
              </div>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#0AA6AD] py-2.5 text-xs font-semibold text-white shadow-[0_6px_18px_rgba(10,166,173,0.35)] hover:bg-[#088c92] transition-colors"
          >
            <span>
              {mode === 'signin'
                ? 'Sign In'
                : mode === 'signup'
                ? 'Create Account'
                : 'Update Password'}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400"
            >
              Back to Sign In
            </button>
          )}
        </form>

        {/* Real Provider Icons & Quick Demo Access */}
        {mode !== 'forgot' && (
          <>
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-[11px] font-medium text-slate-400">Or continue with</span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setProviderPrompt('google')}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {/* Authentic Google G SVG */}
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                <span>Google</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setProviderPrompt('apple')}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {/* Authentic Apple SVG */}
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43Zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45Z" />
                </svg>
                <span>Apple</span>
              </motion.button>
            </div>

            <button
              type="button"
              onClick={() => {
                signInDemo('alex.morgan@nexoracrm.io');
                navigate('/', { replace: true });
              }}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#0AA6AD]" />
              <span>Continue as Demo Manager (Alex Morgan)</span>
            </button>
          </>
        )}

        <p className="mt-5 text-center text-[11px] text-slate-400">
          Auth Mode: {authProviderMode === 'supabase' ? 'Supabase Auth' : 'Local Demo Auth'} · Demo password:{' '}
          <span className="font-mono">Nexora2025!</span>
        </p>
      </motion.div>

      {/* Provider Account Chooser Sub-dialog */}
      <AnimatePresence>
        {providerPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onSubmit={handleProviderContinue}
              className="w-full max-w-sm rounded-3xl border border-white/20 bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-4"
            >
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Continue with {providerPrompt === 'google' ? 'Google' : 'Apple'}
              </h2>
              <p className="text-xs text-slate-500">
                Choose the profile details for your {providerPrompt === 'google' ? 'Google' : 'Apple'} session:
              </p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">Display Name</label>
                  <input
                    required
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Email</label>
                  <input
                    required
                    type="email"
                    value={providerEmail}
                    onChange={(e) => setProviderEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProviderPrompt(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92]"
                >
                  Continue
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
