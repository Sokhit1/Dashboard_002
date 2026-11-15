import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { Deal, DealStageSlug } from '../../types/crm';
import { formatCurrency } from '../../utils/formatters';
import { CompanyBadge } from '../common/Avatar';
import { DealDetailModal } from './DealDetailModal';

interface DealsPipelineCardProps {
  ownerFilter: string;
  statusFilter: string;
}

export const DealsPipelineCard: React.FC<DealsPipelineCardProps> = ({
  ownerFilter,
  statusFilter,
}) => {
  const { dataset, moveDealStage, openQuickCreate } = useCrm();
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStageSlug | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [expandedStage, setExpandedStage] = useState<DealStageSlug | null>(null);

  const currency = dataset.preferences.currency;

  const filteredDeals = useMemo(() => {
    return dataset.deals.filter((d) => {
      if (ownerFilter !== 'all' && d.ownerId !== ownerFilter) return false;
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      return true;
    });
  }, [dataset.deals, ownerFilter, statusFilter]);

  const dealsByStage = useMemo(() => {
    const map: Record<DealStageSlug, Deal[]> = {
      prospecting: [],
      qualification: [],
      proposal: [],
      negotiation: [],
      closed_won: [],
    };
    filteredDeals.forEach((d) => {
      if (map[d.stage]) map[d.stage].push(d);
    });
    return map;
  }, [filteredDeals]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.12 }}
      className="ios-card bg-white p-5 dark:bg-slate-900"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
            Deals Pipeline
          </h2>
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => openQuickCreate('deal')}
            title="Add deal to pipeline"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-[#0AA6AD] hover:text-[#0AA6AD] dark:border-slate-700 dark:text-slate-400"
          >
            <Plus className="h-3.5 w-3.5" />
          </motion.button>
        </div>
        <Link
          to="/deals"
          className="text-xs font-semibold text-[#0AA6AD] hover:underline whitespace-nowrap shrink-0"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="grid min-w-[740px] grid-cols-5 gap-2">
          {dataset.dealStages.map((stage, idx) => {
            const stageDeals = dealsByStage[stage.id] || [];
            const totalValue = stageDeals.reduce((sum, d) => sum + d.amount, 0);
            const isExpanded = expandedStage === stage.id;
            const visibleDeals = isExpanded ? stageDeals : stageDeals.slice(0, 3);
            const remainingCount = Math.max(0, stageDeals.length - visibleDeals.length);
            const isDropTarget = dragOverStage === stage.id;

            const clipPath =
              idx === 0
                ? 'polygon(0% 0%, 92% 0%, 100% 50%, 92% 100%, 0% 100%)'
                : 'polygon(0% 0%, 92% 0%, 100% 50%, 92% 100%, 0% 100%, 8% 50%)';

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
                  const id = e.dataTransfer.getData('text/plain') || draggedDealId;
                  if (id) moveDealStage(id, stage.id);
                  setDraggedDealId(null);
                }}
                className={`flex flex-col rounded-2xl transition-colors ${
                  isDropTarget ? 'bg-[#0AA6AD]/8 ring-2 ring-[#0AA6AD]/40' : ''
                }`}
              >
                <div
                  style={{ backgroundColor: stage.color, clipPath }}
                  className={`flex flex-col justify-center px-3.5 py-2.5 text-white ${
                    idx === 0 ? 'rounded-l-xl pl-3' : 'pl-5'
                  }`}
                >
                  <span className="text-xs font-semibold leading-tight truncate">{stage.name}</span>
                  <span className="mt-0.5 text-[11px] text-white/85 tabular-nums">
                    {stageDeals.length} {stageDeals.length === 1 ? 'Deal' : 'Deals'}
                  </span>
                </div>

                <div className="border-b border-slate-100 px-2 py-2 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatCurrency(totalValue, currency)}
                  </p>
                </div>

                <div className="flex-1 space-y-2 pt-2.5">
                  {visibleDeals.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 px-2 py-4 text-center text-[11px] text-slate-400 dark:border-slate-800">
                      Drop deal here
                    </div>
                  ) : (
                    visibleDeals.map((deal) => {
                      const account = dataset.accounts.find((a) => a.id === deal.accountId);
                      const owner = dataset.users.find((u) => u.id === deal.ownerId);
                      return (
                        <motion.div
                          key={deal.id}
                          whileHover={{ y: -1.5, scale: 1.01 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                          draggable
                          onDragStart={(e) => {
                            const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
                            setDraggedDealId(deal.id);
                            dragEvent.dataTransfer?.setData('text/plain', deal.id);
                          }}
                          onDragEnd={() => {
                            setDraggedDealId(null);
                            setDragOverStage(null);
                          }}
                          onClick={() => setSelectedDeal(deal)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedDeal(deal);
                            }
                          }}
                          title={`${deal.title} · Owner: ${owner?.name || 'Rep'} · Close: ${deal.expectedCloseDate}`}
                          className="group cursor-pointer rounded-xl border border-slate-200/70 bg-slate-50/75 p-2 transition-shadow hover:border-[#0AA6AD]/40 hover:bg-white hover:shadow-xs dark:border-white/10 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <CompanyBadge
                              name={account?.name || 'Company'}
                              initials={account?.logoInitials || 'CO'}
                              color={account?.logoColor || '#09254A'}
                              size="sm"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[11px] font-semibold text-slate-800 group-hover:text-[#0AA6AD] dark:text-slate-100">
                                {account?.name || deal.title}
                              </p>
                              <p className="font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                                {formatCurrency(deal.amount, currency)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="truncate">{owner?.initials || 'Rep'} · {deal.status}</span>
                            <span className="tabular-nums shrink-0">{deal.expectedCloseDate.slice(5)}</span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}

                  {remainingCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpandedStage(stage.id)}
                      className="w-full pt-1 text-left text-[11px] font-medium text-slate-500 hover:text-[#0AA6AD] dark:text-slate-400"
                    >
                      +{remainingCount} more
                    </button>
                  )}
                  {isExpanded && stageDeals.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setExpandedStage(null)}
                      className="w-full pt-1 text-left text-[11px] font-medium text-[#0AA6AD] hover:underline"
                    >
                      Show less
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DealDetailModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
    </motion.section>
  );
};
