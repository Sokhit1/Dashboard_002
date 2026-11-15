import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Search,
  Plus,
  Phone,
  Bell,
  Mail,
  ChevronDown,
  Menu,
  Sun,
  Moon,
  UserPlus,
  Handshake,
  Contact,
  Building2,
  ClipboardList,
  Settings,
  RotateCcw,
  Check,
  Calendar,
  LogOut,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import { DateRangePreset, QuickCreateMode } from '../../types/crm';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { UserAvatar } from '../common/Avatar';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

const DATE_RANGE_LABELS: Record<DateRangePreset, string> = {
  week: 'May 12 – May 18, 2025',
  month: 'May 2025 (MTD)',
  quarter: 'Q2 2025',
  year: 'FY 2025 (YTD)',
  all: 'All Time',
};

const POPOVER_MOTION = {
  initial: { opacity: 0, y: -6, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.96 },
  transition: { type: 'spring' as const, stiffness: 460, damping: 30 },
};

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const {
    dataset,
    currentUser,
    openQuickCreate,
    toggleTheme,
    setDateRange,
    markNotificationRead,
    markAllNotificationsRead,
    addActivity,
    addToast,
    resetDemoData,
  } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const [dialAccountId, setDialAccountId] = useState(dataset.accounts[0]?.id || '');
  const [callNotes, setCallNotes] = useState('');
  const [mailTo, setMailTo] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(
    () => dataset.notifications.filter((n) => !n.read).length,
    [dataset.notifications]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setAddMenuOpen(false);
        setNotifOpen(false);
        setPhoneOpen(false);
        setMailOpen(false);
        setProfileOpen(false);
        setDateOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setAddMenuOpen(false);
        setNotifOpen(false);
        setPhoneOpen(false);
        setMailOpen(false);
        setProfileOpen(false);
        setDateOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { deals: [], leads: [], contacts: [], accounts: [] };

    return {
      deals: dataset.deals.filter((d) => d.title.toLowerCase().includes(q)).slice(0, 4),
      leads: dataset.leads
        .filter(
          (l) =>
            `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
            l.company.toLowerCase().includes(q) ||
            l.email.toLowerCase().includes(q)
        )
        .slice(0, 4),
      contacts: dataset.contacts
        .filter(
          (c) =>
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q)
        )
        .slice(0, 4),
      accounts: dataset.accounts
        .filter((a) => a.name.toLowerCase().includes(q) || a.industry.toLowerCase().includes(q))
        .slice(0, 4),
    };
  }, [searchQuery, dataset]);

  const totalMatches =
    searchResults.deals.length +
    searchResults.leads.length +
    searchResults.contacts.length +
    searchResults.accounts.length;

  const closeAllPopovers = () => {
    setAddMenuOpen(false);
    setNotifOpen(false);
    setPhoneOpen(false);
    setMailOpen(false);
    setProfileOpen(false);
    setDateOpen(false);
  };

  const handleLogCall = (e: React.FormEvent) => {
    e.preventDefault();
    const acc = dataset.accounts.find((a) => a.id === dialAccountId);
    addActivity({
      type: 'Call Logged',
      title: `Outbound Call — ${acc?.name || 'Customer'}`,
      description: callNotes.trim() || `Completed discovery/follow-up call with ${acc?.name || 'contact'}.`,
      accountId: dialAccountId,
      ownerId: currentUser.id,
    });
    setCallNotes('');
    setPhoneOpen(false);
  };

  const handleSendQuickEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailTo.trim() || !mailSubject.trim()) return;
    addActivity({
      type: 'Email Opened',
      title: `Email Sent: ${mailSubject.trim()}`,
      description: `Sent to ${mailTo.trim()} — ${mailBody.trim().slice(0, 120)}`,
      ownerId: currentUser.id,
    });
    addToast('Email logged & sent', `Dispatched to ${mailTo.trim()}`);
    setMailTo('');
    setMailSubject('');
    setMailBody('');
    setMailOpen(false);
  };

  const popoverCls =
    'rounded-2xl border border-slate-200/80 bg-white/92 backdrop-blur-2xl shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-900/92';

  return (
    <header
      ref={headerRef}
      className="ios-glass sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200/70 px-4 lg:px-6 dark:border-white/10"
    >
      {/* Left: Mobile Menu + iOS Spotlight-style Search */}
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="inline-flex lg:hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-300"
        >
          <Menu className="h-4 w-4" />
        </motion.button>

        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            placeholder="Search deals, leads, contacts..."
            aria-label="Global search for deals, leads, contacts, and accounts"
            className="w-full rounded-full border border-slate-200/80 bg-slate-100/70 py-2 pl-10 pr-14 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0AA6AD] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0AA6AD]/12 transition-all dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200/80 bg-white/90 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-900">
            ⌘ K
          </kbd>

          <AnimatePresence>
            {searchOpen && searchQuery.trim().length > 0 && (
              <motion.div
                {...POPOVER_MOTION}
                className={`absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto p-2 ${popoverCls}`}
              >
                {totalMatches === 0 ? (
                  <p className="px-3 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    No matching deals, leads, contacts, or accounts for &ldquo;{searchQuery}&rdquo;.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {searchResults.deals.length > 0 && (
                      <div>
                        <p className="px-2 py-1 text-[11px] font-semibold text-slate-400">Deals</p>
                        {searchResults.deals.map((d) => {
                          const acc = dataset.accounts.find((a) => a.id === d.accountId);
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => {
                                setSearchOpen(false);
                                navigate('/deals');
                              }}
                              className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs hover:bg-slate-100/80 dark:hover:bg-slate-800"
                            >
                              <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                {d.title} · <span className="text-slate-500 font-normal">{acc?.name}</span>
                              </span>
                              <span className="ml-2 font-mono text-xs font-semibold text-[#0AA6AD] tabular-nums shrink-0">
                                {formatCurrency(d.amount, dataset.preferences.currency)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {searchResults.leads.length > 0 && (
                      <div>
                        <p className="px-2 py-1 text-[11px] font-semibold text-slate-400">Leads</p>
                        {searchResults.leads.map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => {
                              setSearchOpen(false);
                              navigate('/leads');
                            }}
                            className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs hover:bg-slate-100/80 dark:hover:bg-slate-800"
                          >
                            <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {l.firstName} {l.lastName} · <span className="text-slate-500 font-normal">{l.company}</span>
                            </span>
                            <span className="ml-2 text-[11px] text-slate-500 shrink-0">{l.status}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.contacts.length > 0 && (
                      <div>
                        <p className="px-2 py-1 text-[11px] font-semibold text-slate-400">Contacts</p>
                        {searchResults.contacts.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSearchOpen(false);
                              navigate('/contacts');
                            }}
                            className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs hover:bg-slate-100/80 dark:hover:bg-slate-800"
                          >
                            <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {c.firstName} {c.lastName}
                            </span>
                            <span className="ml-2 text-[11px] text-slate-500 truncate">{c.email}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.accounts.length > 0 && (
                      <div>
                        <p className="px-2 py-1 text-[11px] font-semibold text-slate-400">Accounts</p>
                        {searchResults.accounts.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                              setSearchOpen(false);
                              navigate('/accounts');
                            }}
                            className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs hover:bg-slate-100/80 dark:hover:bg-slate-800"
                          >
                            <span className="font-medium text-slate-900 dark:text-slate-100 truncate">{a.name}</span>
                            <span className="ml-2 text-[11px] text-slate-500 shrink-0">{a.industry}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Utility Actions & User Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Global Date Range Selector */}
        <div className="relative hidden xl:block">
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => {
              const next = !dateOpen;
              closeAllPopovers();
              setDateOpen(next);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100/80 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
          >
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{DATE_RANGE_LABELS[dataset.preferences.dateRange]}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </motion.button>

          <AnimatePresence>
            {dateOpen && (
              <motion.div
                {...POPOVER_MOTION}
                className={`absolute right-0 top-full z-40 mt-2 w-52 p-1.5 ${popoverCls}`}
              >
                {(Object.keys(DATE_RANGE_LABELS) as DateRangePreset[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setDateRange(key);
                      setDateOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span>{DATE_RANGE_LABELS[key]}</span>
                    {dataset.preferences.dateRange === key && <Check className="h-3.5 w-3.5 text-[#0AA6AD]" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Teal + Add New Button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => {
              const next = !addMenuOpen;
              closeAllPopovers();
              setAddMenuOpen(next);
            }}
            aria-label="Add new record"
            title="Add New"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0AA6AD] text-white shadow-[0_4px_12px_rgba(10,166,173,0.35)] hover:bg-[#088c92] transition-colors"
          >
            <Plus className="h-4 w-4" />
          </motion.button>

          <AnimatePresence>
            {addMenuOpen && (
              <motion.div
                {...POPOVER_MOTION}
                className={`absolute right-0 top-full z-40 mt-2 w-48 p-1.5 ${popoverCls}`}
              >
                {(
                  [
                    { mode: 'lead', label: 'New Lead', icon: UserPlus },
                    { mode: 'deal', label: 'New Deal', icon: Handshake },
                    { mode: 'contact', label: 'New Contact', icon: Contact },
                    { mode: 'account', label: 'New Account', icon: Building2 },
                    { mode: 'activity', label: 'Log Activity', icon: ClipboardList },
                  ] as Array<{ mode: QuickCreateMode; label: string; icon: React.ComponentType<{ className?: string }> }>
                ).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => {
                        setAddMenuOpen(false);
                        openQuickCreate(item.mode);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#0AA6AD]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Phone Quick Dialer */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => {
              const next = !phoneOpen;
              closeAllPopovers();
              setPhoneOpen(next);
            }}
            aria-label="Quick call logger"
            title="Log a Call"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <Phone className="h-4 w-4" />
          </motion.button>

          <AnimatePresence>
            {phoneOpen && (
              <motion.form
                {...POPOVER_MOTION}
                onSubmit={handleLogCall}
                className={`absolute right-0 top-full z-40 mt-2 w-72 p-4 space-y-3 ${popoverCls}`}
              >
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Quick Call Log</p>
                <select
                  value={dialAccountId}
                  onChange={(e) => setDialAccountId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {dataset.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <textarea
                  rows={2}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Call outcome & next steps..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#0AA6AD] py-2 text-xs font-semibold text-white hover:bg-[#088c92]"
                >
                  Log Call Activity
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => {
              const next = !notifOpen;
              closeAllPopovers();
              setNotifOpen(next);
            }}
            aria-label="Notifications"
            title="Notifications"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF6155] px-1 text-[10px] font-bold text-white tabular-nums">
                {unreadCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                {...POPOVER_MOTION}
                className={`absolute right-0 top-full z-40 mt-2 w-80 p-3 ${popoverCls}`}
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Notifications ({unreadCount} unread)
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-medium text-[#0AA6AD] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {dataset.notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => markNotificationRead(n.id)}
                      className={`w-full px-2 py-2.5 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/60 ${
                        n.read ? 'opacity-65' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{n.message}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Email Quick Compose */}
        <div className="relative hidden sm:block">
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => {
              const next = !mailOpen;
              closeAllPopovers();
              setMailOpen(next);
            }}
            aria-label="Quick message"
            title="Compose Email"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <Mail className="h-4 w-4" />
          </motion.button>

          <AnimatePresence>
            {mailOpen && (
              <motion.form
                {...POPOVER_MOTION}
                onSubmit={handleSendQuickEmail}
                className={`absolute right-0 top-full z-40 mt-2 w-80 p-4 space-y-2.5 ${popoverCls}`}
              >
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Quick Email</p>
                <input
                  type="email"
                  required
                  value={mailTo}
                  onChange={(e) => setMailTo(e.target.value)}
                  placeholder="Recipient email..."
                  className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <input
                  type="text"
                  required
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  placeholder="Subject..."
                  className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <textarea
                  rows={3}
                  value={mailBody}
                  onChange={(e) => setMailBody(e.target.value)}
                  placeholder="Message body..."
                  className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#0AA6AD] py-2 text-xs font-semibold text-white hover:bg-[#088c92]"
                >
                  Send & Log Email
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <motion.button
          whileTap={{ scale: 0.9, rotate: 18 }}
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          title={dataset.preferences.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          {dataset.preferences.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.button>

        {/* User Profile Dropdown */}
        <div className="relative pl-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => {
              const next = !profileOpen;
              closeAllPopovers();
              setProfileOpen(next);
            }}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors"
          >
            <UserAvatar
              name={currentUser.name}
              initials={currentUser.initials}
              color={currentUser.avatarColor}
              size="md"
            />
            <div className="hidden md:block text-left leading-tight">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {currentUser.role}
              </p>
            </div>
            <ChevronDown className="hidden md:block h-3.5 w-3.5 text-slate-400" />
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                {...POPOVER_MOTION}
                className={`absolute right-0 top-full z-40 mt-2 w-56 p-1.5 ${popoverCls}`}
              >
                <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  {session && (
                    <span className="mt-1 inline-block rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-[#0AA6AD] dark:bg-teal-950/60">
                      Signed in via {session.provider === 'email' ? 'Email' : session.provider === 'google' ? 'Google' : 'Apple'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/settings');
                  }}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Profile & Settings</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setProfileOpen(false);
                    await signOut();
                    navigate('/signup');
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 text-[#0AA6AD]" />
                  <span>Switch Account / Sign Up</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    setResetConfirmOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                  <span>Reset Demo Data</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  type="button"
                  onClick={async () => {
                    setProfileOpen(false);
                    await signOut();
                    addToast('Signed out', 'You have securely signed out of Nexora CRM.', 'info');
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#FF6155] hover:bg-[#FF6155]/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={resetDemoData}
        title="Reset Demo Data?"
        message="This will restore all leads, deals, contacts, accounts, and activities back to the initial Nexora CRM sample dataset."
        confirmLabel="Reset Dataset"
      />
    </header>
  );
};
