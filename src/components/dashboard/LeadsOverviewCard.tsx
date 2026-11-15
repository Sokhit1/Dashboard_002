import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { LeadStatus } from '../../types/crm';

const LEAD_SEGMENTS: Array<{ key: LeadStatus; color: string }> = [
  { key: 'New', color: '#0AA6AD' },
  { key: 'Contacted', color: '#1C7ED6' },
  { key: 'Qualified', color: '#FF6155' },
  { key: 'Unqualified', color: '#CBD5E1' },
];

export const LeadsOverviewCard: React.FC = () => {
  const { metrics } = useCrm();
  const navigate = useNavigate();

  const data = LEAD_SEGMENTS.map((seg) => {
    const count = metrics.leadsByStatus[seg.key] || 0;
    const pct = metrics.totalLeads > 0 ? ((count / metrics.totalLeads) * 100).toFixed(1) : '0.0';
    return {
      name: seg.key,
      value: count,
      pct,
      color: seg.color,
    };
  });

  const handleSegmentClick = (status: LeadStatus) => {
    navigate(`/leads?status=${encodeURIComponent(status)}`);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.2 }}
      className="ios-card flex flex-col justify-between bg-white p-5 dark:bg-slate-900"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
          Leads Overview
        </h2>
        <Link
          to="/leads"
          className="text-xs font-semibold text-[#0AA6AD] hover:underline whitespace-nowrap shrink-0"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-center">
        <div className="relative h-[168px] sm:col-span-5">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={70}
                paddingAngle={2}
                stroke="none"
                onClick={(entry) => handleSegmentClick(entry.name as LeadStatus)}
                className="cursor-pointer focus:outline-none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-slate-200/80 bg-white/95 px-2.5 py-1.5 text-xs shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{item.name}: </span>
                      <span className="tabular-nums text-slate-600 dark:text-slate-300">
                        {item.value} ({item.pct}%)
                      </span>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {metrics.totalLeads}
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Total Leads
            </span>
          </div>
        </div>

        <div className="sm:col-span-7 space-y-2.5">
          <div className="space-y-1">
            {data.map((item) => (
              <motion.button
                key={item.name}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleSegmentClick(item.name as LeadStatus)}
                className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
              >
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.name}</span>
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                  {item.value}{' '}
                  <span className="text-slate-400 font-normal">({item.pct}%)</span>
                </span>
              </motion.button>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-2.5 px-2 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Conversion Rate
            </p>
            <div className="mt-0.5 flex items-baseline gap-2.5">
              <span className="text-xl font-bold text-[#0AA6AD] tabular-nums">
                {metrics.conversionRate}%
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3 w-3" />
                +3.2% vs last week
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
