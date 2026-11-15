import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Mail,
  FileText,
  Download,
  MessageSquare,
  Calendar,
  Phone,
  StickyNote,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { Activity, ActivityType } from '../../types/crm';
import { formatRelativeTime } from '../../utils/formatters';
import { Modal } from '../common/Modal';

const TYPE_STYLE: Record<ActivityType, { icon: React.ComponentType<{ className?: string }>; bg: string }> = {
  'Email Opened': { icon: Mail, bg: '#0AA6AD' },
  'Document Viewed': { icon: FileText, bg: '#09254A' },
  'Brochure Downloaded': { icon: Download, bg: '#FF6155' },
  'Reply Received': { icon: MessageSquare, bg: '#0AA6AD' },
  'Meeting Scheduled': { icon: Calendar, bg: '#09254A' },
  'Call Logged': { icon: Phone, bg: '#1C7ED6' },
  'Note Added': { icon: StickyNote, bg: '#0CA678' },
};

export const ActivityTimelineCard: React.FC = () => {
  const { dataset } = useCrm();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const timelineItems = dataset.activities.slice(0, 5);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.3 }}
        className="ios-card bg-white p-5 dark:bg-slate-900"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
            Customer Activity Timeline
          </h2>
          <Link
            to="/activities"
            className="text-xs font-semibold text-[#0AA6AD] hover:underline whitespace-nowrap shrink-0"
          >
            View All
          </Link>
        </div>

        <div className="relative overflow-x-auto pb-1">
          <div className="relative min-w-[580px] grid grid-cols-5 gap-3">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[10%] right-[10%] top-6 h-[2px] bg-slate-200 dark:bg-slate-800"
            />

            {timelineItems.map((act) => {
              const cfg = TYPE_STYLE[act.type] || TYPE_STYLE['Email Opened'];
              const Icon = cfg.icon;
              const account = dataset.accounts.find((a) => a.id === act.accountId);
              const timeStr = act.relativeTimeLabel || formatRelativeTime(act.occurredAt);

              return (
                <motion.button
                  key={act.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                  type="button"
                  onClick={() => setSelectedActivity(act)}
                  className="group relative z-10 flex flex-col items-center text-center focus:outline-none"
                >
                  <div
                    style={{ backgroundColor: cfg.bg }}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white ring-4 ring-white shadow-sm transition-transform group-hover:scale-105 dark:ring-slate-900"
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-xs font-semibold text-slate-900 group-hover:text-[#0AA6AD] dark:text-slate-100">
                    {act.title}
                  </p>
                  <p className="mt-0.5 truncate max-w-full text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {account?.name || 'Customer'}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400 tabular-nums">{timeStr}</p>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.section>

      <Modal
        open={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
        title={selectedActivity?.title || 'Activity Details'}
        subtitle={
          selectedActivity
            ? `${
                dataset.accounts.find((a) => a.id === selectedActivity.accountId)?.name || 'Customer'
              } · ${selectedActivity.relativeTimeLabel || formatRelativeTime(selectedActivity.occurredAt)}`
            : undefined
        }
      >
        {selectedActivity && (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl bg-slate-50 p-4 text-slate-700 leading-relaxed dark:bg-slate-800/70 dark:text-slate-300">
              {selectedActivity.description}
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400">Activity Type</p>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
                  {selectedActivity.type}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Owner</p>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
                  {dataset.users.find((u) => u.id === selectedActivity.ownerId)?.name || 'Sales Rep'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
