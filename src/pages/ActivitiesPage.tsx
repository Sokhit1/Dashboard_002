import React, { useMemo, useState } from 'react';
import { Plus, Check, Trash2, Clock, Search } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatRelativeTime } from '../utils/formatters';

export const ActivitiesPage: React.FC = () => {
  const { dataset, updateFollowUp, deleteFollowUp, deleteActivity, openQuickCreate } = useCrm();
  const [tab, setTab] = useState<'followups' | 'timeline'>('followups');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed' | 'Rescheduled'>('All');

  const filteredFollowUps = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dataset.followUps.filter((f) => {
      if (statusFilter !== 'All' && f.status !== statusFilter) return false;
      if (q) {
        const acc = dataset.accounts.find((a) => a.id === f.accountId)?.name || '';
        if (!`${f.description} ${acc}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [dataset.followUps, dataset.accounts, statusFilter, search]);

  const filteredActivities = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dataset.activities.filter((a) => {
      if (!q) return true;
      const acc = dataset.accounts.find((ac) => ac.id === a.accountId)?.name || '';
      return `${a.title} ${a.description} ${a.type} ${acc}`.toLowerCase().includes(q);
    });
  }, [dataset.activities, dataset.accounts, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Activities & Follow-ups</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track scheduled customer follow-ups, logged calls, emails, and meeting touchpoints
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => openQuickCreate('followup')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Clock className="h-3.5 w-3.5 text-[#0AA6AD]" />
            <span>New Reminder</span>
          </button>
          <button
            type="button"
            onClick={() => openQuickCreate('activity')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Activity</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setTab('followups')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
              tab === 'followups'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Follow-up Tasks ({dataset.followUps.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('timeline')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
              tab === 'timeline'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Activity Stream ({dataset.activities.length})
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {tab === 'followups' && (
            <select
              aria-label="Filter follow-ups by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          )}
          <div className="relative min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs focus:border-[#0AA6AD] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {tab === 'followups' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
                  <th className="px-4 py-3 font-semibold">Date & Time</th>
                  <th className="px-4 py-3 font-semibold">Account</th>
                  <th className="px-4 py-3 font-semibold">Task Description</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFollowUps.map((fu) => {
                  const acc = dataset.accounts.find((a) => a.id === fu.accountId);
                  const owner = dataset.users.find((u) => u.id === fu.ownerId);
                  return (
                    <tr key={fu.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {fu.dueDate} · {fu.timeLabel}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {acc?.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{fu.description}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold ${
                            fu.priority === 'High'
                              ? 'text-[#FF6155]'
                              : fu.priority === 'Medium'
                              ? 'text-amber-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {fu.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{owner?.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold ${
                            fu.status === 'Completed' ? 'text-emerald-600' : 'text-[#0AA6AD]'
                          }`}
                        >
                          {fu.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateFollowUp(fu.id, {
                                status: fu.status === 'Completed' ? 'Pending' : 'Completed',
                              })
                            }
                            title="Toggle completed"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-500/10"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteFollowUp(fu.id)}
                            title="Delete reminder"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#FF6155] hover:bg-[#FF6155]/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredActivities.map((act) => {
            const acc = dataset.accounts.find((a) => a.id === act.accountId);
            const owner = dataset.users.find((u) => u.id === act.ownerId);
            return (
              <div
                key={act.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-[#0AA6AD]">{act.type}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{act.title}</span>
                    {acc && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">{acc.name}</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{act.description}</p>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    {owner?.name || 'System'} · {act.relativeTimeLabel || formatRelativeTime(act.occurredAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteActivity(act.id)}
                  title="Delete activity"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-[#FF6155]/10 hover:text-[#FF6155]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
