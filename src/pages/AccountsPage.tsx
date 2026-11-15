import React, { useMemo, useState } from 'react';
import { Plus, Search, Download, Globe, MapPin, Edit3, Trash2, Building2 } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { Account } from '../types/crm';
import { formatCurrency } from '../utils/formatters';
import { exportToCsv } from '../utils/csvExport';
import { CompanyBadge } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const AccountsPage: React.FC = () => {
  const { dataset, addAccount, updateAccount, deleteAccount, currentUser } = useCrm();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Account['status']>('All');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('');
  const [employees, setEmployees] = useState('250');
  const [annualRevenue, setAnnualRevenue] = useState('35000000');
  const [status, setStatus] = useState<Account['status']>('Active');

  const currency = dataset.preferences.currency;

  const filteredAccounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dataset.accounts.filter((a) => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (q && !`${a.name} ${a.industry} ${a.city}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [dataset.accounts, statusFilter, search]);

  const openForm = (acc?: Account) => {
    if (acc) {
      setEditing(acc);
      setName(acc.name);
      setIndustry(acc.industry);
      setWebsite(acc.website);
      setCity(acc.city);
      setEmployees(String(acc.employees));
      setAnnualRevenue(String(acc.annualRevenue));
      setStatus(acc.status);
    } else {
      setEditing(null);
      setName('');
      setIndustry('Enterprise SaaS');
      setWebsite('');
      setCity('San Francisco');
      setEmployees('250');
      setAnnualRevenue('25000000');
      setStatus('Prospect');
    }
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      industry: industry.trim() || 'Technology',
      website: website.trim() || `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      employees: Math.max(1, Number(employees) || 100),
      annualRevenue: Math.max(0, Number(annualRevenue) || 0),
      city: city.trim() || 'San Francisco',
      country: 'United States',
      ownerId: currentUser.id,
      status,
      logoColor: editing?.logoColor || '#0AA6AD',
      logoInitials: name.trim().slice(0, 2).toUpperCase(),
    };
    if (editing) updateAccount(editing.id, payload);
    else addAccount(payload);
    setFormOpen(false);
  };

  const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#0AA6AD] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Accounts</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredAccounts.length} organizations with linked contacts, pipeline deals, and activity
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              exportToCsv(
                'nexora-accounts.csv',
                filteredAccounts.map((a) => ({
                  Name: a.name,
                  Industry: a.industry,
                  City: a.city,
                  Employees: a.employees,
                  AnnualRevenue: a.annualRevenue,
                  Status: a.status,
                })),
                [
                  { key: 'Name', label: 'Company Name' },
                  { key: 'Industry', label: 'Industry' },
                  { key: 'City', label: 'City' },
                  { key: 'Employees', label: 'Employees' },
                  { key: 'AnnualRevenue', label: 'Annual Revenue' },
                  { key: 'Status', label: 'Status' },
                ]
              )
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => openForm()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(['All', 'Active', 'Prospect', 'Partner'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, industry, city..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs focus:border-[#0AA6AD] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredAccounts.map((acc) => {
          const accDeals = dataset.deals.filter((d) => d.accountId === acc.id);
          const accContacts = dataset.contacts.filter((c) => c.accountId === acc.id);
          const pipelineTotal = accDeals.reduce((s, d) => s + d.amount, 0);

          return (
            <div
              key={acc.id}
              onClick={() => setSelectedAccount(acc)}
              className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:border-[#0AA6AD]/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <CompanyBadge
                    name={acc.name}
                    initials={acc.logoInitials}
                    color={acc.logoColor}
                    size="md"
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {acc.name}
                    </h3>
                    <p className="truncate text-xs text-slate-500">
                      {acc.industry} · {acc.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => openForm(acc)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(acc)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-[#FF6155]/10 hover:text-[#FF6155]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {acc.city}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {acc.employees} staff
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                <div>
                  <p className="text-[11px] text-slate-400">Pipeline</p>
                  <p className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrency(pipelineTotal, currency, true)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Deals</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {accDeals.length}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Contacts</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {accContacts.length}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account 360 Profile Modal */}
      <Modal
        open={Boolean(selectedAccount)}
        onClose={() => setSelectedAccount(null)}
        title={selectedAccount?.name || 'Account Profile'}
        subtitle={selectedAccount ? `${selectedAccount.industry} · ${selectedAccount.city}` : undefined}
        maxWidth="lg"
      >
        {selectedAccount && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Globe className="h-3.5 w-3.5 text-[#0AA6AD]" />
                {selectedAccount.website}
              </span>
              <span className="tabular-nums">
                Est. Revenue: <strong>{formatCurrency(selectedAccount.annualRevenue, currency, true)}</strong>
              </span>
              <span className="tabular-nums">
                Employees: <strong>{selectedAccount.employees}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold text-slate-800 dark:text-slate-200">Related Contacts</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dataset.contacts
                    .filter((c) => c.accountId === selectedAccount.id)
                    .map((c) => (
                      <div key={c.id} className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500">{c.title} · {c.email}</p>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-800 dark:text-slate-200">Associated Deals</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dataset.deals
                    .filter((d) => d.accountId === selectedAccount.id)
                    .map((d) => (
                      <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{d.title}</p>
                          <p className="text-[11px] text-slate-500">{d.stage.replace('_', ' ')}</p>
                        </div>
                        <span className="font-mono font-semibold text-[#0AA6AD] tabular-nums">
                          {formatCurrency(d.amount, currency)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Account Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Account' : 'Add Company Account'}
      >
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Company Name *</label>
              <input required className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Industry</label>
              <input className={inputCls} value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">City</label>
              <input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Status</label>
              <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as Account['status'])}>
                <option value="Active">Active</option>
                <option value="Prospect">Prospect</option>
                <option value="Partner">Partner</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Employees</label>
              <input type="number" className={inputCls} value={employees} onChange={(e) => setEmployees(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Annual Revenue ($)</label>
              <input type="number" className={inputCls} value={annualRevenue} onChange={(e) => setAnnualRevenue(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium dark:border-slate-700">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92]">
              {editing ? 'Save Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteAccount(deleteTarget.id);
        }}
        title="Delete Account?"
        message={deleteTarget ? `Remove ${deleteTarget.name} from Accounts?` : ''}
        confirmLabel="Delete Account"
      />
    </div>
  );
};
