import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Download } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatCurrency } from '../utils/formatters';
import { exportToCsv } from '../utils/csvExport';

export const ReportsPage: React.FC = () => {
  const { metrics, dataset } = useCrm();
  const currency = dataset.preferences.currency;

  const pipelineByStage = dataset.dealStages.map((s) => {
    const stageDeals = dataset.deals.filter((d) => d.stage === s.id);
    return {
      stage: s.name,
      deals: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + d.amount, 0),
    };
  });

  const handleExportReport = () => {
    exportToCsv(
      'nexora-revenue-report.csv',
      metrics.monthlySales.map((m) => ({
        Month: m.month,
        Actual: m.actual,
        Target: m.target,
        Projected: m.projected,
      })),
      [
        { key: 'Month', label: 'Month' },
        { key: 'Actual', label: 'Actual Revenue' },
        { key: 'Target', label: 'Target Revenue' },
        { key: 'Projected', label: 'Projected Revenue' },
      ]
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Revenue performance, pipeline distribution, lead conversion, and rep attainment
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportReport}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92] whitespace-nowrap shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Revenue CSV</span>
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500">YTD Revenue Achieved</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(metrics.annualAchieved, currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500">Active Open Pipeline</p>
          <p className="mt-1 text-xl font-bold text-[#0AA6AD] tabular-nums">
            {formatCurrency(metrics.openPipelineValue, currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500">Avg. Closed Deal Size</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(
              metrics.closedWonCount > 0
                ? Math.round(metrics.closedWonValue / metrics.closedWonCount)
                : 0,
              currency
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500">Lead Qualification Rate</p>
          <p className="mt-1 text-xl font-bold text-[#FF6155] tabular-nums">
            {metrics.conversionRate}%
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            Monthly Revenue vs. Quota Target
          </h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  tickFormatter={(v) => `${Math.round(v / 1000)}K`}
                />
                <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0), currency)} />
                <Legend />
                <Line type="monotone" dataKey="actual" name="Actual" stroke="#0AA6AD" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#09254A" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            Pipeline Value by Stage
          </h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineByStage}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  tickFormatter={(v) => `${Math.round(v / 1000)}K`}
                />
                <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0), currency)} />
                <Bar dataKey="value" name="Stage Value" fill="#0AA6AD" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Rep Performance Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Team Quota Attainment</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
                <th className="px-4 py-3 font-semibold">Representative</th>
                <th className="px-4 py-3 font-semibold text-right">Deals Won</th>
                <th className="px-4 py-3 font-semibold text-right">Revenue Attributed</th>
                <th className="px-4 py-3 font-semibold text-right">Quota Target</th>
                <th className="px-4 py-3 font-semibold text-right">Attainment</th>
                <th className="px-4 py-3 font-semibold text-right">Lead Conv. Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {metrics.teamPerformance.map((m) => (
                <tr key={m.user.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {m.user.name} <span className="font-normal text-slate-400">· {m.user.role}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{m.dealsWon}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                    {formatCurrency(m.revenue, currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500">
                    {formatCurrency(m.target, currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0AA6AD] tabular-nums">
                    {m.achievementPct}%
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{m.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
