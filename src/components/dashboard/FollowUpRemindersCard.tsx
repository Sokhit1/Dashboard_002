import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Phone, Calendar, Check, Clock, Plus, Trash2 } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { FollowUp } from '../../types/crm';
import { CompanyBadge } from '../common/Avatar';
import { Modal } from '../common/Modal';

export const FollowUpRemindersCard: React.FC = () => {
  const { dataset, updateFollowUp, deleteFollowUp, openQuickCreate } = useCrm();
  const navigate = useNavigate();
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [editTime, setEditTime] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const visibleFollowUps = dataset.followUps.slice(0, 4);

  const openReschedule = (fu: FollowUp) => {
    setEditingFollowUp(fu);
    setEditTime(fu.timeLabel);
    setEditDate(fu.dueDate);
    setEditDesc(fu.description);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFollowUp) return;
    updateFollowUp(editingFollowUp.id, {
      timeLabel: editTime.trim() || editingFollowUp.timeLabel,
      dueDate: editDate || editingFollowUp.dueDate,
      description: editDesc.trim() || editingFollowUp.description,
      status: 'Rescheduled',
    });
    setEditingFollowUp(null);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.28 }}
        className="ios-card flex flex-col justify-between bg-white p-5 dark:bg-slate-900"
      >
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                Follow-up Reminders
              </h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => openQuickCreate('followup')}
                title="Create follow-up reminder"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-[#0AA6AD] hover:text-[#0AA6AD] dark:border-slate-700 dark:text-slate-400"
              >
                <Plus className="h-3.5 w-3.5" />
              </motion.button>
            </div>
            <Link
              to="/activities"
              className="text-xs font-semibold text-[#0AA6AD] hover:underline whitespace-nowrap shrink-0"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleFollowUps.map((fu, idx) => {
              const account = dataset.accounts.find((a) => a.id === fu.accountId);
              const isDone = fu.status === 'Completed';
              const isCall = fu.channel === 'Call';
              return (
                <div
                  key={fu.id}
                  className={`flex items-center justify-between gap-3 py-2.5 transition-opacity ${
                    isDone ? 'opacity-55' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-16 shrink-0 font-mono text-[11px] font-semibold tabular-nums ${
                        idx % 2 === 0 ? 'text-[#FF6155]' : 'text-[#0AA6AD]'
                      }`}
                    >
                      {fu.timeLabel}
                    </span>

                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      type="button"
                      onClick={() => navigate('/accounts')}
                      title={`View ${account?.name || 'Customer'}`}
                      className="shrink-0"
                    >
                      <CompanyBadge
                        name={account?.name || 'Account'}
                        initials={account?.logoInitials || 'AC'}
                        color={account?.logoColor || '#09254A'}
                        size="sm"
                      />
                    </motion.button>

                    <div className="min-w-0">
                      <p
                        className={`truncate text-xs font-semibold text-slate-900 dark:text-slate-100 ${
                          isDone ? 'line-through' : ''
                        }`}
                      >
                        {account?.name || 'Customer'}
                      </p>
                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {fu.description} · {fu.priority}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      type="button"
                      onClick={() =>
                        updateFollowUp(fu.id, {
                          status: isDone ? 'Pending' : 'Completed',
                        })
                      }
                      title={isDone ? 'Mark pending' : 'Mark completed'}
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                        isDone
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : 'text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-600'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      type="button"
                      onClick={() => openReschedule(fu)}
                      title="Reschedule or edit reminder"
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                        isCall
                          ? 'bg-[#FF6155]/10 text-[#FF6155] hover:bg-[#FF6155]/20'
                          : 'bg-[#0AA6AD]/10 text-[#0AA6AD] hover:bg-[#0AA6AD]/20'
                      }`}
                    >
                      {isCall ? <Phone className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
                    </motion.button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <Modal
        open={Boolean(editingFollowUp)}
        onClose={() => setEditingFollowUp(null)}
        title="Reschedule Follow-Up"
        maxWidth="sm"
      >
        {editingFollowUp && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Time
                </label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 pl-8 pr-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Date
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  deleteFollowUp(editingFollowUp.id);
                  setEditingFollowUp(null);
                }}
                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#FF6155] hover:bg-[#FF6155]/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFollowUp(null)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0AA6AD] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#088c92]"
                >
                  Update Reminder
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};
