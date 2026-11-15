import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, LayoutGrid, Users, Handshake, Calendar, Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { QuickCreateModal } from '../common/QuickCreateModal';
import { ToastContainer } from '../common/ToastContainer';
import { Modal } from '../common/Modal';
import { useCrm } from '../../context/CrmContext';

const MOBILE_DOCK_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutGrid, end: true },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/deals', label: 'Deals', icon: Handshake },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { dataset, updateOrganization } = useCrm();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-[#F2F4F8] text-slate-900 dark:bg-[#090F1E] dark:text-slate-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenProModal={() => setProModalOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 pb-24 lg:p-6 lg:pb-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* iOS Frosted Mobile Tab Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="ios-glass fixed bottom-0 inset-x-0 z-30 flex lg:hidden h-14 items-center justify-around border-t border-slate-200/70 px-2 dark:border-white/10"
      >
        {MOBILE_DOCK_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.end
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="relative flex flex-col items-center justify-center px-3 py-1 text-[10px] font-medium"
            >
              {isActive && (
                <motion.span
                  layoutId="ios-mobile-tab-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute inset-x-1 inset-y-0.5 rounded-xl bg-[#0AA6AD]/12"
                />
              )}
              <Icon
                className={`relative z-10 h-4 w-4 ${
                  isActive ? 'text-[#0AA6AD]' : 'text-slate-500 dark:text-slate-400'
                }`}
              />
              <span
                className={`relative z-10 mt-0.5 ${
                  isActive ? 'text-[#0AA6AD] font-semibold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center px-3 py-1 text-[10px] font-medium text-slate-500 dark:text-slate-400"
        >
          <Menu className="h-4 w-4" />
          <span className="mt-0.5">More</span>
        </button>
      </nav>

      <QuickCreateModal />
      <ToastContainer />

      <Modal
        open={proModalOpen}
        onClose={() => setProModalOpen(false)}
        title="Upgrade Nexora CRM Workspace"
        subtitle={`Current plan: ${dataset.organization.plan}`}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#0AA6AD]/30 bg-[#0AA6AD]/5 p-4">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Enterprise Revenue Intelligence
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Unlock multi-pipeline forecasting, automated lead scoring, territory quotas, and Supabase sync.
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {[
                'Unlimited custom deal stages & workflow automations',
                'Weighted commit & best-case scenario modeling',
                'Organization-scoped Supabase PostgreSQL & RLS sync',
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#0AA6AD] shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setProModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                updateOrganization({ plan: 'Enterprise' });
                setProModalOpen(false);
              }}
              className="rounded-xl bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92]"
            >
              Switch Demo to Enterprise
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
