import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency } from '../../utils/formatters';
import { UserAvatar } from '../common/Avatar';
import { Modal } from '../common/Modal';

type SortMetric = 'revenue' | 'achievement' | 'conversion';

export const TeamPerformanceCard: React.FC = () => {
  const { metrics, dataset } = useCrm();
  const [sortBy, setSortBy] = useState<SortMetric>('revenue');
  const [modalOpen, setModalOpen] = useState(false);

  const currency = dataset.preferences.currency;

  const sortedTeam = useMemo(() => {
    const list = [...metrics.teamPerformance];
    list.sort((a, b) => {
      if (sortBy === 'revenue') return b.revenue - a.revenue;
      if (sortBy === 'achievement') return b.achievementPct - a.achievementPct;
      return b.conversionRate - a.conversionRate;
    });
    return list;
  }, [metrics.teamPerformance, sortBy]);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.24 }}
        className="ios-card flex flex-col justify-between bg-white p-5 dark:bg-slate-900"
      >
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              Team Performance
            </h2>
            <div className="flex items-center gap-2">
              <select
                aria-label="Sort team performance"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortMetric)}
                className="rounded-full border border-slate-200/80 bg-slate-100/70 px-2.5 py-1 text-[11px] font-medium text-slate-600 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="revenue">By Revenue</option>
                <option value="achievement">By Target %</option>
                <option value="conversion">By Conversion</option>
              </select>
              <Link
                to="/reports"
                className="text-xs font-semibold text-[#0AA6AD] hover:underline whitespace-nowrap shrink-0"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {sortedTeam.map((member, idx) => {
              const barPct = Math.min(100, member.achievementPct);
              return (
                <motion.div
                  key={member.user.id}
                  layout
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="flex items-center gap-3"
                >
                  <UserAvatar
                    name={member.user.name}
                    initials={member.user.initials}
                    color={member.user.avatarColor}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {member.user.name}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white tabular-nums shrink-0">
                        {formatCurrency(member.revenue, currency)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2.5">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: barPct / 100 }}
                          transition={{ type: 'spring', stiffness: 160, damping: 24, delay: 0.25 + idx * 0.04 }}
                          style={{ transformOrigin: 'left center' }}
                          className="h-full w-full rounded-full bg-[#0AA6AD]"
                        />
                      </div>
                      <span className="w-9 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                        {sortBy === 'conversion'
                          ? `${member.conversionRate}%`
                          : `${member.achievementPct}%`}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => setModalOpen(true)}
          className="mt-4 w-full border-t border-slate-100 pt-3 text-center text-xs font-semibold text-[#0AA6AD] hover:underline dark:border-slate-800"
        >
          View Full Leaderboard
        </motion.button>
      </motion.section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sales Team Leaderboard"
        subtitle="Ranked performance across revenue, quota attainment, and lead conversion"
        maxWidth="lg"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2 pr-3 font-semibold">Rank</th>
                <th className="py-2 pr-3 font-semibold">Representative</th>
                <th className="py-2 pr-3 font-semibold text-right">Deals Won</th>
                <th className="py-2 pr-3 font-semibold text-right">Revenue</th>
                <th className="py-2 pr-3 font-semibold text-right">Target %</th>
                <th className="py-2 font-semibold text-right">Conv. Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedTeam.map((m, idx) => (
                <tr key={m.user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 pr-3 font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                    {idx === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[#0AA6AD]">
                        <Trophy className="h-3.5 w-3.5" /> #1
                      </span>
                    ) : (
                      `#${idx + 1}`
                    )}
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        name={m.user.name}
                        initials={m.user.initials}
                        color={m.user.avatarColor}
                        size="sm"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{m.user.name}</p>
                        <p className="text-[11px] text-slate-500">{m.user.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{m.dealsWon}</td>
                  <td className="py-2.5 pr-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatCurrency(m.revenue, currency)}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold text-[#0AA6AD] tabular-nums">
                    {m.achievementPct}%
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">
                    {m.conversionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
};
