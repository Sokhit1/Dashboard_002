import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useCrm } from '../context/CrmContext';
import { formatCurrency } from '../utils/formatters';

export const ForecastPage: React.FC = () => {
  const { metrics, dataset } = useCrm();
  const [winRateMultiplier, setWinRateMultiplier] = useState(100);
  const currency = dataset.preferences.currency;

  const mult = winRateMultiplier / 100;

  const stageBreakdown = dataset.dealStages.map((s) => {
    const stageDeals = dataset.deals.filter((d) => d.stage === s.id);
    const rawValue = stageDeals.reduce((sum, d) => sum + d.amount, 0);
    const adjustedProb = s.id === 'closed_won' ? 100 : Math.min(100, Math.round(s.probability * mult));
    const weighted = Math.round((rawValue * adjustedProb) / 100);
    return {
      ...s,
      count: stageDeals.length,
      rawValue,
      adjustedProb,
      weighted,
    };
  });

  const totalWeighted = stageBreakdown.reduce((s, r) => s + r.weighted, 0);
  const chartData = metrics.forecastSummary.points.map((p) => ({
    ...p,
    adjustedExpected: Math.round(p.expected * (0.85 + 0.15 * mult)),
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Revenue Forecast</h1>
            <span className="text-xs font-medium text-slate-400">· Forward Estimate</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Weighted pipeline projections and scenario modeling (estimates, not confirmed GAAP revenue)
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
          <label htmlFor="win-rate-slider" className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Scenario Win-Rate: <strong className="text-[#0AA6AD] tabular-nums">{winRateMultiplier}%</strong>
          </label>
          <input
            id="win-rate-slider"
            type="range"
            min="70"
            max="130"
            step="5"
            value={winRateMultiplier}
            onChange={(e) => setWinRateMultiplier(Number(e.target.value))}
            className="accent-[#0AA6AD]"
          />
        </div>
      </div>

      {/* Forecast Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500">Predicted Revenue (Est.)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(Math.round(metrics.forecastSummary.predictedRevenue * (0.85 + 0.15 * mult)), currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500">Best Case Upside (Est.)</p>
          <p className="mt-1 text-2xl font-bold text-[#0AA6AD] tabular-nums">
            {formatCurrency(metrics.forecastSummary.bestCase, currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500">Weighted Pipeline Commit</p>
          <p className="mt-1 text-2xl font-bold text-[#09254A] dark:text-slate-100 tabular-nums">
            {formatCurrency(totalWeighted, currency)}
          </p>
        </div>
      </div>

      {/* Scenario Chart */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          Projected Scenario Trajectory (May–Oct 2025 Estimates)
        </h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0), currency)} />
              <Legend />
              <Area type="monotone" dataKey="bestCase" name="Best Case (Est.)" stroke="#1C7ED6" fill="#1C7ED6" fillOpacity={0.08} strokeDasharray="4 4" />
              <Area type="monotone" dataKey="adjustedExpected" name="Predicted (Est.)" stroke="#0AA6AD" fill="#0AA6AD" fillOpacity={0.18} strokeWidth={2.5} />
              <Area type="monotone" dataKey="commit" name="Weighted Commit" stroke="#09254A" fill="#09254A" fillOpacity={0.06} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stage Probability Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Weighted Stage Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
                <th className="px-4 py-3 font-semibold">Pipeline Stage</th>
                <th className="px-4 py-3 font-semibold text-right">Deals</th>
                <th className="px-4 py-3 font-semibold text-right">Gross Value</th>
                <th className="px-4 py-3 font-semibold text-right">Stage Probability</th>
                <th className="px-4 py-3 font-semibold text-right">Weighted Forecast</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stageBreakdown.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{row.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.count}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {formatCurrency(row.rawValue, currency)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.adjustedProb}%</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-[#0AA6AD] tabular-nums">
                    {formatCurrency(row.weighted, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
