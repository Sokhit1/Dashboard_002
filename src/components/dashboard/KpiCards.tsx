import React from 'react';
import { motion } from 'motion/react';
import { Users, Briefcase, DollarSign, Target, ArrowUpRight } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency } from '../../utils/formatters';

const CARD_SPRING = { type: 'spring' as const, stiffness: 360, damping: 28 };

export const KpiCards: React.FC = () => {
  const { metrics, dataset } = useCrm();
  const currency = dataset.preferences.currency;

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (Math.min(100, metrics.targetPercent) / 100) * circumference;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Card 1: Total Leads */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...CARD_SPRING, delay: 0.02 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        className="ios-card flex items-center gap-4 bg-white p-5 transition-shadow hover:shadow-md dark:bg-slate-900"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0AA6AD] text-white shadow-[0_6px_14px_rgba(10,166,173,0.28)]">
          <Users className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Leads</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {metrics.totalLeads.toLocaleString('en-US')}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3 w-3 shrink-0" />
            <span>+18.6% vs last week</span>
          </p>
        </div>
      </motion.div>

      {/* Card 2: Open Deals */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...CARD_SPRING, delay: 0.07 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        className="ios-card flex items-center gap-4 bg-white p-5 transition-shadow hover:shadow-md dark:bg-slate-900"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#09254A] text-white shadow-[0_6px_14px_rgba(9,37,74,0.26)]">
          <Briefcase className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Open Deals</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {metrics.openDealsCount.toLocaleString('en-US')}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3 w-3 shrink-0" />
            <span>+12.4% vs last week</span>
          </p>
        </div>
      </motion.div>

      {/* Card 3: Revenue (MTD) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...CARD_SPRING, delay: 0.12 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        className="ios-card flex items-center gap-4 bg-white p-5 transition-shadow hover:shadow-md dark:bg-slate-900"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FF6155] text-white shadow-[0_6px_14px_rgba(255,97,85,0.28)]">
          <DollarSign className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Revenue (MTD)</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(metrics.mtdRevenue, currency)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3 w-3 shrink-0" />
            <span>+22.7% vs last month</span>
          </p>
        </div>
      </motion.div>

      {/* Card 4: Sales Target */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...CARD_SPRING, delay: 0.17 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        className="ios-card flex items-center justify-between gap-3 bg-white p-5 transition-shadow hover:shadow-md dark:bg-slate-900"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0AA6AD] text-white shadow-[0_6px_14px_rgba(10,166,173,0.28)]">
            <Target className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sales Target</p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {metrics.targetPercent}%
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums truncate">
              {formatCurrency(metrics.annualAchieved, currency, true)} / {formatCurrency(metrics.annualTarget, currency, true)}
            </p>
          </div>
        </div>

        <div className="relative h-14 w-14 shrink-0">
          <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className="text-slate-100 dark:text-slate-800"
            />
            <motion.circle
              cx="28"
              cy="28"
              r={radius}
              fill="none"
              stroke="#0AA6AD"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeOffset }}
              transition={{ type: 'spring', stiffness: 120, damping: 22, delay: 0.25 }}
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};
