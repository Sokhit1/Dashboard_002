import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useCrm();

  return (
    <div
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex max-w-sm w-full px-4 flex-col items-center gap-2 pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon =
            toast.variant === 'error'
              ? AlertCircle
              : toast.variant === 'info'
              ? Info
              : CheckCircle2;
          const iconColor =
            toast.variant === 'error'
              ? 'text-[#FF6155]'
              : toast.variant === 'info'
              ? 'text-[#38D9DF]'
              : 'text-[#0AA6AD]';

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 460, damping: 30 }}
              className="pointer-events-auto flex w-full items-center gap-3 rounded-full border border-white/20 bg-slate-900/92 px-4 py-2.5 text-white shadow-[0_14px_34px_rgba(9,37,74,0.28)] backdrop-blur-2xl dark:bg-slate-800/95"
            >
              <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{toast.title}</p>
                {toast.description && (
                  <p className="text-[11px] text-slate-300 truncate">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
