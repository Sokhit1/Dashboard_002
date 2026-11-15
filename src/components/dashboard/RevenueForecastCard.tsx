import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowUpRight } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency } from '../../utils/formatters';

type ForecastScenario = 'expected' | 'bestCase' | 'commit';

export const RevenueForecastCard: React.FC = () => {
  const { metrics, dataset } = useCrm();
  const [scenario, setScenario] = useState<ForecastScenario>('expected');
  const currency = dataset.preferences.currency;

  const { predictedRevenue, bestCase, weightedCommit, points } = metrics.forecastSummary;

  const activeHeadline =
    scenario === 'bestCase'
      ? bestCase
      : scenario === 'commit'
      ? weightedCommit
      : predictedRevenue;

  const activeLabel =
    scenario === 'bestCase'
      ? 'Best Case'
      : scenario === 'commit'
      ? 'Commit'
      : 'Predicted';

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.34 }}
      className="ios-card bg-white p-5 dark:bg-slate-900"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
            Revenue Forecast
          </h2>
          <span className="text-[11px] font-medium text-slate-400">· Estimate</span>
        </div>

        <div className="flex items-center gap-2">
          {/* iOS Spring Segmented Control */}
          <div className="flex items-center rounded-full bg-slate-100 p-0.5 dark:bg-slate-800">
            {(
              [
                { id: 'expected', label: 'Expected' },
                { id: 'bestCase', label: 'Best' },
                { id: 'commit', label: 'Commit' },
              ] as Array<{ id: ForecastScenario; label: string }>
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setScenario(tab.id)}
                className={`relative rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap ${
                  scenario === tab.id
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {scenario === tab.id && (
                  <motion.span
                    layoutId="forecast-scenario-pill"
                    transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-white shadow-xs dark:bg-slate-700"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
          <Link
            to="/forecast"
            className="text-xs font-semibold text-[#0AA6AD] hover:underline whitespace-nowrap shrink-0"
          >
            View Report
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-center">
        <div className="sm:col-span-5 space-y-3">
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Predicted Revenue
            </p>
            <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(predictedRevenue, currency)}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>16.3% vs last month</span>
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Best Case</p>
            <p className="text-sm font-bold text-[#0AA6AD] tabular-nums">
              {formatCurrency(bestCase, currency)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Commit (Weighted)
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatCurrency(weightedCommit, currency)}
            </p>
          </div>
        </div>

        <div className="relative sm:col-span-7 h-[175px]">
          <motion.div
            key={scenario}
            initial={{ opacity: 0.7, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="pointer-events-none absolute right-2 top-0 z-10 rounded-xl bg-[#0AA6AD] px-2.5 py-1 text-right text-white shadow-sm"
          >
            <p className="text-xs font-bold tabular-nums">
              {formatCurrency(activeHeadline, currency, true)}
            </p>
            <p className="text-[10px] text-white/85">{activeLabel} (Est.)</p>
          </motion.div>

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 28, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0AA6AD" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#0AA6AD" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94A3B8' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickFormatter={(v) =>
                  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}K`
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const pt = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-slate-200/80 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {pt.month} 2025 (Estimate)
                      </p>
                      <p className="mt-0.5 text-[#0AA6AD] tabular-nums">
                        {activeLabel}: {formatCurrency(pt[scenario], currency)}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey={scenario}
                stroke="#0AA6AD"
                strokeWidth={2}
                strokeDasharray="5 4"
                fill="url(#forecastGrad)"
                dot={{ r: 3, fill: '#0AA6AD', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#0AA6AD' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.section>
  );
};
