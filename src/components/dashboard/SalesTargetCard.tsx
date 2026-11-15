import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency } from '../../utils/formatters';

export const SalesTargetCard: React.FC = () => {
  const { metrics, dataset } = useCrm();
  const currency = dataset.preferences.currency;

  const r = 70;
  const cx = 90;
  const cy = 84;
  const halfCircumference = Math.PI * r;
  const progressLength = (Math.min(100, metrics.targetPercent) / 100) * halfCircumference;

  const barData = metrics.monthlySales.map((m) => ({
    month: m.month,
    actual: m.actual,
    projected: m.projected,
    value: m.isFuture ? m.projected : m.actual,
    target: m.target,
    isFuture: m.isFuture,
  }));

  const avgMonthlyTarget = Math.round(metrics.annualTarget / 12);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.16 }}
      className="ios-card flex flex-col bg-white p-5 dark:bg-slate-900"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
          Sales Target Progress
        </h2>
        <Link
          to="/reports"
          className="text-xs font-semibold text-[#0AA6AD] hover:underline whitespace-nowrap shrink-0"
        >
          View Report
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-center">
        <div className="sm:col-span-5 space-y-2.5">
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Annual Target</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(metrics.annualTarget, currency)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Achieved</p>
            <p className="text-sm font-bold text-[#0AA6AD] tabular-nums">
              {formatCurrency(metrics.annualAchieved, currency)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Remaining</p>
            <p className="text-sm font-bold text-[#FF6155] tabular-nums">
              {formatCurrency(metrics.annualRemaining, currency)}
            </p>
          </div>
        </div>

        <div className="sm:col-span-7 flex flex-col items-center justify-center">
          <svg viewBox="0 0 180 102" className="w-full max-w-[210px]">
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              strokeLinecap="round"
              className="text-slate-100 dark:text-slate-800"
            />
            <motion.path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke="#0AA6AD"
              strokeWidth="16"
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${halfCircumference}` }}
              animate={{ strokeDasharray: `${progressLength} ${halfCircumference}` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
            />
            <text
              x={cx}
              y={cy - 18}
              textAnchor="middle"
              className="fill-slate-900 dark:fill-white text-[26px] font-bold tabular-nums"
            >
              {metrics.targetPercent}%
            </text>
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              className="fill-slate-500 dark:fill-slate-400 text-[10px] font-medium"
            >
              of annual target
            </text>
          </svg>
        </div>
      </div>

      <div className="mt-4 h-[155px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 14, right: 8, left: -18, bottom: 0 }}>
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
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}K` : `${v}`)}
            />
            <Tooltip
              cursor={{ fill: 'rgba(10, 166, 173, 0.08)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-xl border border-slate-200/80 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{d.month} 2025</p>
                    <p className="mt-0.5 text-[#0AA6AD] tabular-nums">
                      {d.isFuture ? 'Projected: ' : 'Actual: '}
                      {formatCurrency(d.value, currency)}
                    </p>
                    <p className="text-slate-500 tabular-nums">
                      Target: {formatCurrency(d.target, currency)}
                    </p>
                  </div>
                );
              }}
            />
            <ReferenceLine
              y={avgMonthlyTarget}
              stroke="#0AA6AD"
              strokeDasharray="3 3"
              label={{
                value: 'Target',
                position: 'right',
                fill: '#0AA6AD',
                fontSize: 10,
                fontWeight: 600,
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={18}>
              {barData.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={entry.isFuture ? '#CBD5E1' : '#0AA6AD'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
};
