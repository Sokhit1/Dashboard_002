import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, RotateCcw, Database, Sun, Moon } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { getSupabaseConfig } from '../services/dataService';
import { CurrencyCode } from '../types/crm';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const {
    dataset,
    currentUser,
    updateCurrentUser,
    updateOrganization,
    updatePreferences,
    resetDemoData,
  } = useCrm();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState(currentUser.role);
  const [phone, setPhone] = useState(currentUser.phone);
  const [orgName, setOrgName] = useState(dataset.organization.name);
  const [currency, setCurrency] = useState<CurrencyCode>(dataset.preferences.currency);
  const [annualTarget, setAnnualTarget] = useState(String(dataset.organization.annualTarget));
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const supabaseStatus = getSupabaseConfig();

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
          Manage your profile, workspace currency, appearance, notification preferences, and data layer
        </p>
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

      {/* Database & Demo Data Architecture */}
      <div className="ios-card bg-white p-5 dark:bg-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#0AA6AD]" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Data Layer & Supabase Integration
            </h2>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6155]/40 px-3.5 py-1.5 text-xs font-medium text-[#FF6155] hover:bg-[#FF6155]/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Data</span>
          </motion.button>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Active Provider:{' '}
          <strong className="text-slate-900 dark:text-white">
            {supabaseStatus.configured ? 'Supabase PostgreSQL' : 'Local Demo Persistence (localStorage)'}
          </strong>
          . All 15 relational tables, indexes, and organization-scoped RLS policies are defined in{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] dark:bg-slate-800">
            src/database/schema.sql
          </code>
          . Configure <code className="font-mono text-[11px]">VITE_SUPABASE_URL</code> and{' '}
          <code className="font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code> in your environment to switch from Demo Data to live Supabase PostgreSQL.
        </p>
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
