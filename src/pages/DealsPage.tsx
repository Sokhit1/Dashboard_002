import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Download, LayoutGrid, List, GripVertical } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { Deal, DealStageSlug } from '../types/crm';
import { formatCurrency } from '../utils/formatters';
import { exportToCsv } from '../utils/csvExport';
import { CompanyBadge, UserAvatar } from '../components/common/Avatar';
import { DealDetailModal } from '../components/dashboard/DealDetailModal';

export const DealsPage: React.FC = () => {
  const { dataset, moveDealStage, openQuickCreate } = useCrm();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStageSlug | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const currency = dataset.preferences.currency;

  const filteredDeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dataset.deals.filter((d) => {
      if (ownerFilter !== 'all' && d.ownerId !== ownerFilter) return false;
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (q) {
        const acc = dataset.accounts.find((a) => a.id === d.accountId)?.name || '';
        if (!`${d.title} ${acc}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [dataset.deals, dataset.accounts, ownerFilter, statusFilter, search]);

  const totalPipeline = filteredDeals.reduce((sum, d) => sum + d.amount, 0);

  const handleExport = () => {
    exportToCsv(
      'nexora-deals.csv',
      filteredDeals.map((d) => ({
        Title: d.title,
        Account: dataset.accounts.find((a) => a.id === d.accountId)?.name || '',
        Stage: dataset.dealStages.find((s) => s.id === d.stage)?.name || d.stage,
        Amount: d.amount,
        Status: d.status,
        Owner: dataset.users.find((u) => u.id === d.ownerId)?.name || '',
        ExpectedClose: d.expectedCloseDate,
      })),
      [
        { key: 'Title', label: 'Deal Title' },
        { key: 'Account', label: 'Account' },
        { key: 'Stage', label: 'Stage' },
        { key: 'Amount', label: 'Amount' },
        { key: 'Status', label: 'Status' },
        { key: 'Owner', label: 'Owner' },
        { key: 'ExpectedClose', label: 'Expected Close Date' },
      ]
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Deals Pipeline</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {filteredDeals.length} opportunities · Total value {formatCurrency(totalPipeline, currency)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-full bg-slate-200/70 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {viewMode === 'kanban' && (
                <motion.span
                  layoutId="deals-view-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-white shadow-xs dark:bg-slate-700"
                />
              )}
              <LayoutGrid className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {viewMode === 'list' && (
                <motion.span
                  layoutId="deals-view-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-white shadow-xs dark:bg-slate-700"
                />
              )}
              <List className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">List</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => openQuickCreate('deal')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92] whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Deal</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals or accounts..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs focus:border-[#0AA6AD] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <select
          aria-label="Filter deals by owner"
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">All Representatives</option>
          {dataset.users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter deals by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">All Statuses</option>
          <option value="On Track">On Track</option>
          <option value="Active">Active</option>
          <option value="At Risk">At Risk</option>
          <option value="Won">Won</option>
        </select>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[1050px] grid-cols-5 gap-4">
            {dataset.dealStages.map((stage) => {
              const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
              const stageSum = stageDeals.reduce((s, d) => s + d.amount, 0);
              const isDropTarget = dragOverStage === stage.id;

              return (
                <div
                  key={stage.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverStage(stage.id);
                  }}
                  onDragLeave={() => setDragOverStage(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverStage(null);
                    const id = e.dataTransfer.getData('text/plain') || draggedId;
                    if (id) moveDealStage(id, stage.id);
                    setDraggedId(null);
                  }}
                  className={`flex flex-col rounded-2xl border bg-slate-50/70 p-3 transition-colors dark:bg-slate-900/60 ${
                    isDropTarget
                      ? 'border-[#0AA6AD] bg-[#0AA6AD]/5'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div
                    style={{ backgroundColor: stage.color }}
                    className="mb-3 rounded-xl px-3.5 py-2.5 text-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{stage.name}</span>
                      <span className="text-[11px] font-medium text-white/90 tabular-nums">
                        {stageDeals.length}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs font-bold tabular-nums">
                      {formatCurrency(stageSum, currency)}
                    </p>
                  </div>

                  <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-0.5">
                    {stageDeals.map((deal) => {
                      const acc = dataset.accounts.find((a) => a.id === deal.accountId);
                      const owner = dataset.users.find((u) => u.id === deal.ownerId);
                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedId(deal.id);
                            e.dataTransfer.setData('text/plain', deal.id);
                          }}
                          onDragEnd={() => {
                            setDraggedId(null);
                            setDragOverStage(null);
                          }}
                          onClick={() => setSelectedDeal(deal)}
                          className="cursor-pointer rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs transition-all hover:border-[#0AA6AD]/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <CompanyBadge
                                name={acc?.name || 'Company'}
                                initials={acc?.logoInitials || 'CO'}
                                color={acc?.logoColor || '#09254A'}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                                  {deal.title}
                                </p>
                                <p className="truncate text-[11px] text-slate-500">{acc?.name}</p>
                              </div>
                            </div>
                            <GripVertical className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] dark:border-slate-800">
                            <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                              {formatCurrency(deal.amount, currency)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-medium ${
                                  deal.status === 'At Risk'
                                    ? 'text-[#FF6155]'
                                    : deal.status === 'Won'
                                    ? 'text-emerald-600'
                                    : 'text-slate-500'
                                }`}
                              >
                                {deal.status}
                              </span>
                              {owner && (
                                <UserAvatar
                                  name={owner.name}
                                  initials={owner.initials}
                                  color={owner.avatarColor}
                                  size="xs"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
                  <th className="px-4 py-3 font-semibold">Deal Title</th>
                  <th className="px-4 py-3 font-semibold">Account</th>
                  <th className="px-4 py-3 font-semibold">Stage</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">Expected Close</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDeals.map((d) => {
                  const acc = dataset.accounts.find((a) => a.id === d.accountId);
                  const owner = dataset.users.find((u) => u.id === d.ownerId);
                  return (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDeal(d)}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{d.title}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{acc?.name}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={d.stage}
                          onChange={(e) => moveDealStage(d.id, e.target.value as DealStageSlug)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                        >
                          {dataset.dealStages.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                        {formatCurrency(d.amount, currency)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{d.status}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{owner?.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-500 tabular-nums">{d.expectedCloseDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DealDetailModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
    </div>
  );
};
