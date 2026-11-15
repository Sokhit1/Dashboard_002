import React, { useEffect, useState } from 'react';
import { Trash2, Building2, Calendar, User } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { Deal, DealStageSlug, DealStatus } from '../../types/crm';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface DealDetailModalProps {
  deal: Deal | null;
  onClose: () => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({ deal, onClose }) => {
  const { dataset, updateDeal, deleteDeal } = useCrm();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [stage, setStage] = useState<DealStageSlug>('prospecting');
  const [status, setStatus] = useState<DealStatus>('On Track');
  const [ownerId, setOwnerId] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!deal) return;
    setTitle(deal.title);
    setAmount(String(deal.amount));
    setStage(deal.stage);
    setStatus(deal.status);
    setOwnerId(deal.ownerId);
    setExpectedCloseDate(deal.expectedCloseDate);
    setNotes(deal.notes);
  }, [deal]);

  if (!deal) return null;

  const account = dataset.accounts.find((a) => a.id === deal.accountId);
  const contact = dataset.contacts.find((c) => c.id === deal.contactId);
  const linkedProducts = dataset.dealProducts
    .filter((dp) => dp.dealId === deal.id)
    .map((dp) => ({
      ...dp,
      product: dataset.products.find((p) => p.id === dp.productId),
    }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeal(deal.id, {
      title: title.trim() || deal.title,
      amount: Math.max(0, Number(amount) || 0),
      stage,
      status: stage === 'closed_won' ? 'Won' : status,
      ownerId,
      expectedCloseDate,
      notes,
    });
    onClose();
  };

  const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#0AA6AD] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
  const labelCls = 'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300';

  return (
    <>
      <Modal
        open={Boolean(deal)}
        onClose={onClose}
        title={deal.title}
        subtitle={`${account?.name || 'Unknown Account'} · ${formatCurrency(deal.amount, dataset.preferences.currency)}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#0AA6AD]" />
              <strong>{account?.name}</strong>
            </span>
            {contact && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {contact.firstName} {contact.lastName} ({contact.title})
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Close: {expectedCloseDate}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Opportunity Name</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Pipeline Stage</label>
              <select
                className={inputCls}
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStageSlug)}
              >
                {dataset.dealStages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.probability}%)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Deal Amount ($)</label>
              <input
                type="number"
                min="0"
                className={`${inputCls} tabular-nums`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                className={inputCls}
                value={status}
                onChange={(e) => setStatus(e.target.value as DealStatus)}
              >
                <option value="Active">Active</option>
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
                <option value="Won">Won</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Sales Representative</label>
              <select className={inputCls} value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
                {dataset.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Expected Close Date</label>
              <input
                type="date"
                className={inputCls}
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
              />
            </div>
          </div>

          {linkedProducts.length > 0 && (
            <div>
              <p className={labelCls}>Associated Products</p>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
                {linkedProducts.map((lp) => (
                  <div key={lp.id} className="flex items-center justify-between px-3 py-2 text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {lp.product?.name || 'Product'} × {lp.quantity}
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                      {formatCurrency(lp.unitPrice * lp.quantity, dataset.preferences.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className={labelCls}>Deal Notes</label>
            <textarea
              rows={3}
              className={inputCls}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[#FF6155] hover:bg-[#FF6155]/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Deal</span>
            </button>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteDeal(deal.id);
          onClose();
        }}
        title="Delete Deal?"
        message={`Are you sure you want to permanently remove "${deal.title}" from the pipeline?`}
        confirmLabel="Delete Deal"
      />
    </>
  );
};
