import React, { useMemo, useState } from 'react';
import { Plus, Search, Download, Mail, Phone, Edit3, Trash2, Contact as ContactIcon } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { Contact } from '../types/crm';
import { formatShortDate } from '../utils/formatters';
import { exportToCsv } from '../utils/csvExport';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';

export const ContactsPage: React.FC = () => {
  const { dataset, addContact, updateContact, deleteContact, currentUser } = useCrm();
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [accountId, setAccountId] = useState(dataset.accounts[0]?.id || '');
  const [ownerId, setOwnerId] = useState(currentUser.id);
  const [notes, setNotes] = useState('');

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dataset.contacts.filter((c) => {
      if (accountFilter !== 'all' && c.accountId !== accountFilter) return false;
      if (q) {
        const accName = dataset.accounts.find((a) => a.id === c.accountId)?.name || '';
        const hay = `${c.firstName} ${c.lastName} ${c.email} ${c.title} ${accName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [dataset.contacts, dataset.accounts, accountFilter, search]);

  const openForm = (contact?: Contact) => {
    if (contact) {
      setEditing(contact);
      setFirstName(contact.firstName);
      setLastName(contact.lastName);
      setEmail(contact.email);
      setPhone(contact.phone);
      setTitle(contact.title);
      setAccountId(contact.accountId);
      setOwnerId(contact.ownerId);
      setNotes(contact.notes);
    } else {
      setEditing(null);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setTitle('');
      setAccountId(dataset.accounts[0]?.id || '');
      setOwnerId(currentUser.id);
      setNotes('');
    }
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    const payload = {
      accountId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim() || `${firstName.toLowerCase()}@company.com`,
      phone: phone.trim() || '+1 (415) 555-0188',
      title: title.trim() || 'Executive Sponsor',
      ownerId,
      lastContactedAt: new Date().toISOString(),
      notes: notes.trim(),
    };
    if (editing) updateContact(editing.id, payload);
    else addContact(payload);
    setFormOpen(false);
  };

  const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#0AA6AD] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Contacts</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredContacts.length} stakeholders across {dataset.accounts.length} customer accounts
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              exportToCsv(
                'nexora-contacts.csv',
                filteredContacts.map((c) => ({
                  Name: `${c.firstName} ${c.lastName}`,
                  Title: c.title,
                  Account: dataset.accounts.find((a) => a.id === c.accountId)?.name || '',
                  Email: c.email,
                  Phone: c.phone,
                  LastContacted: formatShortDate(c.lastContactedAt),
                })),
                [
                  { key: 'Name', label: 'Full Name' },
                  { key: 'Title', label: 'Title' },
                  { key: 'Account', label: 'Account' },
                  { key: 'Email', label: 'Email' },
                  { key: 'Phone', label: 'Phone' },
                  { key: 'LastContacted', label: 'Last Contacted' },
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
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts by name, title, email, or company..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs focus:border-[#0AA6AD] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <select
          aria-label="Filter contacts by account"
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">All Accounts</option>
          {dataset.accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {filteredContacts.length === 0 ? (
        <EmptyState
          icon={ContactIcon}
          title="No contacts found"
          description="Adjust your search filter or add a new contact."
          actionLabel="Add Contact"
          onAction={() => openForm()}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Account</th>
                  <th className="px-4 py-3 font-semibold">Email & Phone</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">Last Contacted</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredContacts.slice(0, 40).map((c) => {
                  const acc = dataset.accounts.find((a) => a.id === c.accountId);
                  const owner = dataset.users.find((u) => u.id === c.ownerId);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedContact(c)}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500">{c.title}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {acc?.name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700 dark:text-slate-300">{c.email}</p>
                        <p className="font-mono text-[11px] text-slate-400 tabular-nums">{c.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{owner?.name}</td>
                      <td className="px-4 py-3 text-slate-500 tabular-nums">
                        {formatShortDate(c.lastContactedAt)}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openForm(c)}
                            title="Edit contact"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(c)}
                            title="Delete contact"
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
      )}

      {/* Contact Profile Modal */}
      <Modal
        open={Boolean(selectedContact)}
        onClose={() => setSelectedContact(null)}
        title={selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : ''}
        subtitle={
          selectedContact
            ? `${selectedContact.title} · ${
                dataset.accounts.find((a) => a.id === selectedContact.accountId)?.name || ''
              }`
            : undefined
        }
      >
        {selectedContact && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <Mail className="h-4 w-4 text-[#0AA6AD]" />
                <span className="truncate">{selectedContact.email}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <Phone className="h-4 w-4 text-[#0AA6AD]" />
                <span className="font-mono tabular-nums">{selectedContact.phone}</span>
              </div>
            </div>
            <div>
              <p className="mb-1 font-semibold text-slate-700 dark:text-slate-300">Notes</p>
              <p className="rounded-xl bg-slate-50 p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {selectedContact.notes || 'No notes recorded yet.'}
              </p>
            </div>
            <div>
              <p className="mb-2 font-semibold text-slate-700 dark:text-slate-300">Account Activity</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {dataset.activities
                  .filter((a) => a.accountId === selectedContact.accountId)
                  .slice(0, 4)
                  .map((a) => (
                    <div key={a.id} className="rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{a.title}</p>
                      <p className="text-[11px] text-slate-500">{a.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Contact Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Contact' : 'Add New Contact'}
      >
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">First Name *</label>
              <input required className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Last Name *</label>
              <input required className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Email</label>
              <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Phone</label>
              <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Account</label>
              <select className={inputCls} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                {dataset.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Title</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Notes</label>
            <textarea rows={2} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium dark:border-slate-700">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92]">
              {editing ? 'Save Changes' : 'Create Contact'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteContact(deleteTarget.id);
        }}
        title="Delete Contact?"
        message={deleteTarget ? `Remove ${deleteTarget.firstName} ${deleteTarget.lastName}?` : ''}
        confirmLabel="Delete Contact"
      />
    </div>
  );
};
