import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Plus,
  Search,
  Download,
  ArrowUpDown,
  Trash2,
  Edit3,
  ArrowRightCircle,
  Users,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { Lead, LeadStatus } from '../types/crm';
import { formatCurrency, formatShortDate } from '../utils/formatters';
import { exportToCsv } from '../utils/csvExport';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';

type SortField = 'name' | 'company' | 'score' | 'estimatedValue' | 'createdAt';

const STATUS_TABS: Array<'All' | LeadStatus> = ['All', 'New', 'Contacted', 'Qualified', 'Unqualified'];

export const LeadsPage: React.FC = () => {
  const { dataset, addLead, updateLead, deleteLead, convertLeadToDeal, currentUser } = useCrm();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = (searchParams.get('status') as LeadStatus | null) || 'All';

  const [statusFilter, setStatusFilter] = useState<'All' | LeadStatus>(
    STATUS_TABS.includes(initialStatus) ? initialStatus : 'All'
  );
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState<Lead['source']>('Website');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [score, setScore] = useState('70');
  const [estimatedValue, setEstimatedValue] = useState('24000');
  const [ownerId, setOwnerId] = useState(currentUser.id);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const paramStatus = searchParams.get('status') as LeadStatus | null;
    if (paramStatus && STATUS_TABS.includes(paramStatus)) {
      setStatusFilter(paramStatus);
      setPage(1);
    }
  }, [searchParams]);

  const openForm = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFirstName(lead.firstName);
      setLastName(lead.lastName);
      setEmail(lead.email);
      setPhone(lead.phone);
      setCompany(lead.company);
      setTitle(lead.title);
      setSource(lead.source);
      setStatus(lead.status);
      setScore(String(lead.score));
      setEstimatedValue(String(lead.estimatedValue));
      setOwnerId(lead.ownerId);
      setNotes(lead.notes);
    } else {
      setEditingLead(null);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setTitle('');
      setSource('Website');
      setStatus('New');
      setScore('70');
      setEstimatedValue('24000');
      setOwnerId(currentUser.id);
      setNotes('');
    }
    setCreateOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !company.trim()) return;
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
      phone: phone.trim() || '+1 (415) 555-0190',
      company: company.trim(),
      title: title.trim() || 'Decision Maker',
      source,
      status,
      score: Math.min(100, Math.max(0, Number(score) || 50)),
      estimatedValue: Math.max(0, Number(estimatedValue) || 0),
      ownerId,
      notes: notes.trim(),
    };
    if (editingLead) {
      updateLead(editingLead.id, payload);
    } else {
      addLead(payload);
    }
    setCreateOpen(false);
  };

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = dataset.leads.filter((l) => {
      if (statusFilter !== 'All' && l.status !== statusFilter) return false;
      if (ownerFilter !== 'all' && l.ownerId !== ownerFilter) return false;
      if (q) {
        const hay = `${l.firstName} ${l.lastName} ${l.company} ${l.email} ${l.source}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      else if (sortField === 'company') cmp = a.company.localeCompare(b.company);
      else if (sortField === 'score') cmp = a.score - b.score;
      else if (sortField === 'estimatedValue') cmp = a.estimatedValue - b.estimatedValue;
      else cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [dataset.leads, statusFilter, ownerFilter, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const pagedLeads = filteredLeads.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExport = () => {
    exportToCsv(
      'nexora-leads.csv',
      filteredLeads.map((l) => ({
        Name: `${l.firstName} ${l.lastName}`,
        Company: l.company,
        Title: l.title,
        Email: l.email,
        Source: l.source,
        Status: l.status,
        Score: l.score,
        EstimatedValue: l.estimatedValue,
        Owner: dataset.users.find((u) => u.id === l.ownerId)?.name || '',
        Created: formatShortDate(l.createdAt),
      })),
      [
        { key: 'Name', label: 'Lead Name' },
        { key: 'Company', label: 'Company' },
        { key: 'Title', label: 'Job Title' },
        { key: 'Email', label: 'Email' },
        { key: 'Source', label: 'Source' },
        { key: 'Status', label: 'Status' },
        { key: 'Score', label: 'Lead Score' },
        { key: 'EstimatedValue', label: 'Estimated Value' },
        { key: 'Owner', label: 'Owner' },
        { key: 'Created', label: 'Created Date' },
      ]
    );
  };

  const statusTextColor = (st: LeadStatus) => {
    if (st === 'Qualified') return 'text-emerald-600 dark:text-emerald-400';
    if (st === 'Contacted') return 'text-[#1C7ED6]';
    if (st === 'New') return 'text-[#0AA6AD]';
    return 'text-slate-500';
  };

  const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#0AA6AD] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Leads</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage inbound prospects, lead qualification scores, and deal conversions ({filteredLeads.length} matching)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
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
            onClick={() => openForm()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92] whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="ios-card flex flex-col gap-3 bg-white p-4 lg:flex-row lg:items-center lg:justify-between dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setStatusFilter(tab);
                  setPage(1);
                  if (tab === 'All') searchParams.delete('status');
                  else searchParams.set('status', tab);
                  setSearchParams(searchParams, { replace: true });
                }}
                className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="leads-status-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-white shadow-xs dark:bg-slate-700"
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, company, email..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-[#0AA6AD] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <select
            aria-label="Filter by owner"
            value={ownerFilter}
            onChange={(e) => {
              setOwnerFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Owners</option>
            {dataset.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {pagedLeads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads match your filters"
          description="Try clearing your search or status filter, or create a new lead to track."
          actionLabel="Add First Lead"
          onAction={() => openForm()}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                  <th className="px-4 py-3 font-semibold">
                    <button type="button" onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                      Lead <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    <button type="button" onClick={() => toggleSort('company')} className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                      Company <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    <button type="button" onClick={() => toggleSort('score')} className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                      Score <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">
                    <button type="button" onClick={() => toggleSort('estimatedValue')} className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                      Est. Value <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pagedLeads.map((lead) => {
                  const owner = dataset.users.find((u) => u.id === lead.ownerId);
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500">{lead.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{lead.company}</p>
                        <p className="text-[11px] text-slate-500">{lead.title}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{lead.source}</td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={`Change status for ${lead.firstName} ${lead.lastName}`}
                          value={lead.status}
                          onChange={(e) => updateLead(lead.id, { status: e.target.value as LeadStatus })}
                          className={`rounded-md border border-transparent bg-transparent py-0.5 text-xs font-semibold focus:border-slate-200 focus:outline-none ${statusTextColor(
                            lead.status
                          )}`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Unqualified">Unqualified</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                        {lead.score}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatCurrency(lead.estimatedValue, dataset.preferences.currency)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {owner?.name || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => convertLeadToDeal(lead.id)}
                            title="Convert lead to deal"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#0AA6AD] hover:bg-[#0AA6AD]/10"
                          >
                            <ArrowRightCircle className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openForm(lead)}
                            title="Edit lead"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(lead)}
                            title="Delete lead"
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

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800">
            <span className="tabular-nums">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredLeads.length)} of{' '}
              {filteredLeads.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1 font-medium disabled:opacity-40 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <span className="tabular-nums font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1 font-medium disabled:opacity-40 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Lead Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={editingLead ? 'Edit Lead' : 'Add New Lead'}
      >
        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">First Name *</label>
              <input required className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Last Name *</label>
              <input required className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Company *</label>
              <input required className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Job Title</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Phone</label>
              <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Source</label>
              <select className={inputCls} value={source} onChange={(e) => setSource(e.target.value as Lead['source'])}>
                <option value="Website">Website</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Outbound">Outbound</option>
                <option value="Conference">Conference</option>
                <option value="Partner">Partner</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Status</label>
              <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Unqualified">Unqualified</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Score (0–100)</label>
              <input type="number" min="0" max="100" className={inputCls} value={score} onChange={(e) => setScore(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Estimated Value ($)</label>
              <input type="number" min="0" className={inputCls} value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Owner</label>
              <select className={inputCls} value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
                {dataset.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Notes</label>
              <textarea rows={2} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92]">
              {editingLead ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteLead(deleteTarget.id);
        }}
        title="Delete Lead?"
        message={deleteTarget ? `Remove ${deleteTarget.firstName} ${deleteTarget.lastName} from Leads?` : ''}
        confirmLabel="Delete Lead"
      />
    </div>
  );
};
