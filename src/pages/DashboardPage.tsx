import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, ChevronDown, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { DateRangePreset } from '../types/crm';
import { KpiCards } from '../components/dashboard/KpiCards';
import { DealsPipelineCard } from '../components/dashboard/DealsPipelineCard';
import { SalesTargetCard } from '../components/dashboard/SalesTargetCard';
import { LeadsOverviewCard } from '../components/dashboard/LeadsOverviewCard';
import { TeamPerformanceCard } from '../components/dashboard/TeamPerformanceCard';
import { FollowUpRemindersCard } from '../components/dashboard/FollowUpRemindersCard';
import { ActivityTimelineCard } from '../components/dashboard/ActivityTimelineCard';
import { RevenueForecastCard } from '../components/dashboard/RevenueForecastCard';

const DATE_PRESETS: Array<{ id: DateRangePreset; label: string }> = [
  { id: 'week', label: 'May 12 – May 18, 2025' },
  { id: 'month', label: 'May 2025 (MTD)' },
  { id: 'quarter', label: 'Q2 2025' },
  { id: 'year', label: 'FY 2025 (YTD)' },
  { id: 'all', label: 'All Time' },
];

export const DashboardPage: React.FC = () => {
  const { dataset, currentUser, setDateRange } = useCrm();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  const firstName = currentUser.name.split(' ')[0];
  const currentDateLabel =
    DATE_PRESETS.find((d) => d.id === dataset.preferences.dateRange)?.label || 'May 12 – May 18, 2025';

  return (
    <div className="space-y-5">
      {/* Welcome Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {firstName}! 👋
            </h1>
            <span className="text-xs font-medium text-slate-400">· Demo Data</span>
          </div>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Here&apos;s what&apos;s happening with your sales today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Dropdown */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setDateDropdownOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-xs font-medium text-slate-700 shadow-2xs backdrop-blur-md hover:bg-white dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-200 whitespace-nowrap shrink-0"
            >
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{currentDateLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </motion.button>

            <AnimatePresence>
              {dateDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 30 }}
                  className="absolute right-0 top-full z-30 mt-2 w-52 rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
                >
                  {DATE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setDateRange(preset.id);
                        setDateDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs transition-colors ${
                        dataset.preferences.dateRange === preset.id
                          ? 'bg-[#0AA6AD]/12 font-semibold text-[#0AA6AD]'
                          : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filters Toggle */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-2xs transition-colors whitespace-nowrap shrink-0 ${
              filtersOpen || ownerFilter !== 'all' || statusFilter !== 'all'
                ? 'border-[#0AA6AD] bg-[#0AA6AD]/10 text-[#0AA6AD]'
                : 'border-slate-200/80 bg-white/90 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </motion.button>
        </div>
      </div>

      {/* Expandable Filter Toolbar with iOS spring reveal */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="ios-card flex flex-wrap items-center gap-3 bg-white px-4 py-3 dark:bg-slate-900"
          >
            <div className="flex items-center gap-2">
              <label htmlFor="dash-rep-filter" className="text-xs font-medium text-slate-500">
                Salesperson:
              </label>
              <select
                id="dash-rep-filter"
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="all">All Representatives</option>
                {dataset.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="dash-status-filter" className="text-xs font-medium text-slate-500">
                Deal Status:
              </label>
              <select
                id="dash-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="On Track">On Track</option>
                <option value="Active">Active</option>
                <option value="At Risk">At Risk</option>
                <option value="Won">Won</option>
              </select>
            </div>

            {(ownerFilter !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setOwnerFilter('all');
                  setStatusFilter('all');
                }}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-[#FF6155] hover:bg-[#FF6155]/10"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Clear Filters</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row 1: 4 KPI Cards */}
      <KpiCards />

      {/* Row 2: Deals Pipeline (7/12) + Sales Target Progress (5/12) */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 items-stretch">
        <div className="xl:col-span-7">
          <DealsPipelineCard ownerFilter={ownerFilter} statusFilter={statusFilter} />
        </div>
        <div className="xl:col-span-5">
          <SalesTargetCard />
        </div>
      </div>

      {/* Row 3: Leads Overview + Team Performance + Follow-up Reminders */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 items-stretch">
        <LeadsOverviewCard />
        <TeamPerformanceCard />
        <FollowUpRemindersCard />
      </div>

      {/* Row 4: Customer Activity Timeline (7/12) + Revenue Forecast (5/12) */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 items-stretch">
        <div className="xl:col-span-7">
          <ActivityTimelineCard />
        </div>
        <div className="xl:col-span-5">
          <RevenueForecastCard />
        </div>
      </div>
    </div>
  );
};
