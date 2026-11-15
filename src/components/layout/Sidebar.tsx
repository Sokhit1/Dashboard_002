import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  LayoutGrid,
  Users,
  Handshake,
  Contact,
  Building2,
  Activity,
  Calendar,
  BarChart3,
  Gauge,
  Package,
  FileText,
  Settings,
  UserPlus,
  ClipboardList,
  CalendarPlus,
  PlusCircle,
  StickyNote,
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { QuickCreateMode } from '../../types/crm';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenProModal: () => void;
}

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/deals', label: 'Deals', icon: Handshake },
  { to: '/contacts', label: 'Contacts', icon: Contact },
  { to: '/accounts', label: 'Accounts', icon: Building2 },
  { to: '/activities', label: 'Activities', icon: Activity },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/forecast', label: 'Forecast', icon: Gauge },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const QUICK_ACTIONS: Array<{ label: string; mode: QuickCreateMode; icon: React.ComponentType<{ className?: string }> }> = [
  { label: 'Add Lead', mode: 'lead', icon: UserPlus },
  { label: 'Log Activity', mode: 'activity', icon: ClipboardList },
  { label: 'Schedule Meeting', mode: 'meeting', icon: CalendarPlus },
  { label: 'Create Deal', mode: 'deal', icon: PlusCircle },
  { label: 'Add Note', mode: 'note', icon: StickyNote },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onOpenProModal,
}) => {
  const { openQuickCreate, dataset } = useCrm();
  const location = useLocation();

  const renderSidebarContent = (isMobileDrawer: boolean) => (
    <div className="flex h-full flex-col bg-[#09254A]/95 backdrop-blur-2xl text-white select-none border-r border-white/10">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
        <NavLink
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 min-w-0"
        >
          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0AA6AD]/20 ring-1 ring-white/15"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
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
          </motion.div>
          {(!collapsed || isMobileDrawer) && (
            <span className="text-[17px] font-bold tracking-tight text-white whitespace-nowrap shrink-0">
              Nexora CRM
            </span>
          )}
        </NavLink>

        {/* Desktop collapse button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </motion.button>

        {/* Mobile close button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="inline-flex lg:hidden h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Main Navigation with iOS Spring Active Pill */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5" aria-label="Primary Sidebar Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.end
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              title={collapsed && !isMobileDrawer ? item.label : undefined}
              className={`relative flex items-center ${
                collapsed && !isMobileDrawer ? 'justify-center px-2' : 'gap-3 px-3'
              } py-2 rounded-xl text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                isActive ? 'text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId={isMobileDrawer ? 'mobile-sidebar-active-pill' : 'sidebar-active-pill'}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-[#0AA6AD] shadow-[0_4px_14px_rgba(10,166,173,0.38)]"
                />
              )}
              <Icon className="relative z-10 h-4 w-4 shrink-0" />
              {(!collapsed || isMobileDrawer) && (
                <span className="relative z-10 truncate">{item.label}</span>
              )}
            </NavLink>
          );
        })}

        {/* Quick Actions Card */}
        {(!collapsed || isMobileDrawer) && (
          <div className="mt-4 pt-3">
            <div className="rounded-2xl border border-white/12 bg-white/6 p-3 backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Quick Actions</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => openQuickCreate('lead')}
                  aria-label="Quick add record"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-md text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                </motion.button>
              </div>
              <div className="space-y-1">
                {QUICK_ACTIONS.map((qa) => {
                  const QIcon = qa.icon;
                  return (
                    <motion.button
                      key={qa.mode}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => {
                        openQuickCreate(qa.mode);
                        onCloseMobile();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
                    >
                      <QIcon className="h-3.5 w-3.5 shrink-0 text-[#38D9DF]" />
                      <span className="truncate">{qa.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Upgrade Card + Demo Data indicator */}
      {(!collapsed || isMobileDrawer) && (
        <div className="p-3 space-y-2.5 border-t border-white/10">
          <div className="rounded-2xl bg-gradient-to-br from-[#0AA6AD] to-[#087E86] p-3.5 text-white shadow-sm ring-1 ring-white/15">
            <p className="text-xs font-bold">Upgrade to Pro</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/85">
              Unlock advanced insights, automation and more.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onOpenProModal}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-[#09254A] hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Upgrade Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.button>
          </div>
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span>Demo Data</span>
            <span className="tabular-nums">{dataset.leads.length} leads · {dataset.deals.length} deals</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-[width] duration-200 ${
          collapsed ? 'w-[72px]' : 'w-[236px]'
        }`}
      >
        <div className={`fixed inset-y-0 left-0 z-30 ${collapsed ? 'w-[72px]' : 'w-[236px]'} transition-[width] duration-200`}>
          {renderSidebarContent(false)}
        </div>
      </aside>

      {/* Mobile drawer overlay with iOS spring slide */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="relative z-10 w-[264px] max-w-[85vw] h-full shadow-2xl"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
