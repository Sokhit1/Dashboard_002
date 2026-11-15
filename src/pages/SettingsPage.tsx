import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Save,
  RotateCcw,
  Database,
  Sun,
  Moon,
  ShieldCheck,
  LogOut,
  ArrowRightLeft,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  PlugZap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCrm } from '../context/CrmContext';
import { getSupabaseEnvInfo, testSupabaseConnection, SupabaseConnectionCheckResult } from '../lib/supabase';
import schemaSql from '../database/schema.sql?raw';
import { CurrencyCode } from '../types/crm';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { UserAvatar } from '../components/common/Avatar';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, authProviderMode, signOut } = useAuth();
  const {
    dataset,
    currentUser,
    supabaseSync,
    syncFromSupabase,
    pushDemoToSupabase,
    updateCurrentUser,
    updateOrganization,
    updatePreferences,
    resetDemoData,
    addToast,
  } = useCrm();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState(currentUser.role);
  const [phone, setPhone] = useState(currentUser.phone);
  const [orgName, setOrgName] = useState(dataset.organization.name);
  const [currency, setCurrency] = useState<CurrencyCode>(dataset.preferences.currency);
  const [annualTarget, setAnnualTarget] = useState(String(dataset.organization.annualTarget));
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const [checkingConn, setCheckingConn] = useState(false);
  const [connResult, setConnResult] = useState<SupabaseConnectionCheckResult | null>(null);
  const [showSchemaPreview, setShowSchemaPreview] = useState(false);

  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setRole(currentUser.role);
    setPhone(currentUser.phone);
  }, [currentUser.id, currentUser.name, currentUser.email, currentUser.role, currentUser.phone]);

  const supabaseEnv = getSupabaseEnvInfo();

  const handleTestSupabase = async () => {
    setCheckingConn(true);
    const res = await testSupabaseConnection();
    setConnResult(res);
    setCheckingConn(false);
    addToast(
      res.connected ? 'Supabase connection verified' : 'Supabase not connected',
      res.message,
      res.connected ? 'success' : 'info'
    );
  };

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(schemaSql);
      addToast('SQL schema copied', 'Paste into your Supabase SQL Editor and run.');
    } catch {
      addToast('Clipboard unavailable', 'Use Download schema.sql instead.', 'warning');
    }
  };

  const handleDownloadSchema = () => {
    const blob = new Blob([schemaSql], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexora_crm_supabase_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
    addToast('Downloaded schema.sql', 'Run this file in Supabase SQL Editor.');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = name.trim().split(' ');
    const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
    updateCurrentUser({
      name: name.trim() || currentUser.name,
      email: email.trim() || currentUser.email,
      role: role.trim() || currentUser.role,
      phone: phone.trim(),
      initials,
    });
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization({
      name: orgName.trim() || dataset.organization.name,
      currency,
      annualTarget: Math.max(10000, Number(annualTarget) || 1000000),
    });
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#0AA6AD] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your account session, profile, workspace currency, appearance, notifications, and data layer
        </p>
      </div>

      {/* Account & Authentication Session */}
      <div className="ios-card bg-white p-5 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <UserAvatar
              name={currentUser.name}
              initials={currentUser.initials}
              color={currentUser.avatarColor}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {session?.name || currentUser.name}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-[#0AA6AD] dark:bg-teal-950/60">
                  <ShieldCheck className="h-3 w-3" />
                  {authProviderMode === 'supabase' ? 'Supabase Auth' : 'Active Session'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {session?.email || currentUser.email} · {session?.role || currentUser.role}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={async () => {
                await signOut();
                navigate('/signup');
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-[#0AA6AD]" />
              <span>Switch Account / Sign Up</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={async () => {
                await signOut();
                addToast('Signed out', 'You have signed out of Nexora CRM.', 'info');
                navigate('/login');
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6155]/40 px-3.5 py-1.5 text-xs font-medium text-[#FF6155] hover:bg-[#FF6155]/10 whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <form
        onSubmit={handleSaveProfile}
        className="ios-card bg-white p-5 dark:bg-slate-900 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">User Profile</h2>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0AA6AD] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#088c92]"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Profile</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium">Full Name</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Role Title</label>
            <input className={inputCls} value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Email</label>
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Phone</label>
            <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
      </form>

      {/* Organization & Targets */}
      <form
        onSubmit={handleSaveOrg}
        className="ios-card bg-white p-5 dark:bg-slate-900 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Workspace & Revenue Preferences
          </h2>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#09254A] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0c3162]"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Apply Workspace</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium">Organization Name</label>
            <input className={inputCls} value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Display Currency</label>
            <select
              className={inputCls}
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Annual Revenue Target ($)</label>
            <input
              type="number"
              className={inputCls}
              value={annualTarget}
              onChange={(e) => setAnnualTarget(e.target.value)}
            />
          </div>
        </div>
      </form>

      {/* Appearance & Native iOS Toggles */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="ios-card bg-white p-5 dark:bg-slate-900 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Appearance</h2>
          <div className="flex items-center rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            {(
              [
                { id: 'light', label: 'Light Mode', icon: Sun },
                { id: 'dark', label: 'Dark Mode', icon: Moon },
              ] as const
            ).map((mode) => {
              const Icon = mode.icon;
              const isActive = dataset.preferences.theme === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => updatePreferences({ theme: mode.id })}
                  className={`relative flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="ios-theme-segmented-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-slate-700"
                    />
                  )}
                  <Icon className="relative z-10 h-4 w-4 text-[#0AA6AD]" />
                  <span className="relative z-10">{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="ios-card bg-white p-5 dark:bg-slate-900 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(
              [
                { key: 'emailNotifications', label: 'Email activity alerts' },
                { key: 'dealAlerts', label: 'Deal stage & Closed Won alerts' },
                { key: 'reminderAlerts', label: 'Follow-up reminder notifications' },
                { key: 'weeklyDigest', label: 'Weekly executive pipeline digest' },
              ] as const
            ).map((item) => {
              const enabled = dataset.preferences[item.key];
              return (
                <div key={item.key} className="flex items-center justify-between py-2 text-xs text-slate-700 dark:text-slate-300">
                  <span>{item.label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={item.label}
                    onClick={() => updatePreferences({ [item.key]: !enabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ${
                      enabled ? 'bg-[#34C759]' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
                      className={`h-5 w-5 rounded-full bg-white shadow-sm ${
                        enabled ? 'ml-auto' : 'mr-auto'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Connect to Supabase & Data Layer */}
      <div className="ios-card bg-white p-5 dark:bg-slate-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3ECF8E]/15 text-[#179C63]">
              <Database className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Connect to Supabase
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    supabaseEnv.configured
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {supabaseEnv.configured ? 'Configured' : 'Local Demo Mode'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {supabaseEnv.configured
                  ? `Project host: ${supabaseEnv.host}`
                  : 'Sync Nexora CRM Auth & all 15 relational tables with your Supabase PostgreSQL project'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              disabled={checkingConn}
              onClick={() => void handleTestSupabase()}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#09254A] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0c3162] disabled:opacity-60 whitespace-nowrap"
            >
              <PlugZap className="h-3.5 w-3.5 text-[#3ECF8E]" />
              <span>{checkingConn ? 'Testing...' : 'Test Connection'}</span>
            </motion.button>

            {supabaseEnv.configured && (
              <>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  disabled={supabaseSync.syncing}
                  onClick={() => void syncFromSupabase()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-[#0AA6AD] ${supabaseSync.syncing ? 'animate-spin' : ''}`} />
                  <span>Pull from Supabase</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  disabled={supabaseSync.syncing}
                  onClick={() => void pushDemoToSupabase()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0AA6AD] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#088c92] disabled:opacity-60 whitespace-nowrap"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Push Sample Data</span>
                </motion.button>
              </>
            )}

            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6155]/40 px-3.5 py-1.5 text-xs font-medium text-[#FF6155] hover:bg-[#FF6155]/10 whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Demo Data</span>
            </motion.button>
          </div>
        </div>

        {/* Live Connection Test Output */}
        {connResult && (
          <div
            className={`flex items-start gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs ${
              connResult.connected
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
            }`}
          >
            {connResult.connected ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div className="space-y-0.5">
              <p className="font-semibold">
                {connResult.connected
                  ? `Connected (${connResult.latencyMs} ms)${connResult.tablesReady ? ' · Schema Ready' : ' · Schema Pending'}`
                  : 'Environment Setup Required'}
              </p>
              <p className="text-[11px] opacity-90">{connResult.message}</p>
            </div>
          </div>
        )}

        {/* Setup Steps & SQL Schema Controls */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-800/50 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              Supabase Connection Setup (3 Steps)
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handleCopySchema()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Copy className="h-3 w-3 text-[#0AA6AD]" />
                <span>Copy schema.sql</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadSchema}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Download className="h-3 w-3 text-[#0AA6AD]" />
                <span>Download schema.sql</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSchemaPreview((s) => !s)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[#0AA6AD] hover:bg-teal-50 dark:hover:bg-teal-950/40"
              >
                <span>{showSchemaPreview ? 'Hide SQL' : 'Preview SQL'}</span>
                {showSchemaPreview ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          </div>

          <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <li>
              In your Supabase project&apos;s <strong>SQL Editor</strong>, paste and run{' '}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] dark:bg-slate-900">
                src/database/schema.sql
              </code>{' '}
              to create all 15 CRM tables, seed stages, and RLS policies.
            </li>
            <li>
              Add{' '}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] dark:bg-slate-900">
                VITE_SUPABASE_URL
              </code>{' '}
              and{' '}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] dark:bg-slate-900">
                VITE_SUPABASE_ANON_KEY
              </code>{' '}
              to your environment secrets (found under Supabase Project Settings → API).
            </li>
            <li>
              Sign in with Supabase Auth, click <strong>Test Connection</strong>, and click{' '}
              <strong>Push Sample Data</strong> to populate your database in one click.
            </li>
          </ol>

          {showSchemaPreview && (
            <pre className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-3 font-mono text-[11px] text-slate-200 dark:border-slate-700">
              {schemaSql}
            </pre>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={resetDemoData}
        title="Reset Demo Data?"
        message="This will clear any edits saved in localStorage and restore the original Nexora CRM sample dataset."
        confirmLabel="Reset Dataset"
      />
    </div>
  );
};
