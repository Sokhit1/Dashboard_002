import React, { useEffect, useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { ActivityType, DealStageSlug, LeadStatus, PriorityLevel } from '../../types/crm';
import { Modal } from './Modal';

export const QuickCreateModal: React.FC = () => {
  const {
    quickCreateMode,
    closeQuickCreate,
    dataset,
    currentUser,
    addLead,
    addDeal,
    addContact,
    addAccount,
    addActivity,
    addMeeting,
    addFollowUp,
  } = useCrm();

  // Shared form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [leadSource, setLeadSource] = useState<'Website' | 'LinkedIn' | 'Referral' | 'Outbound' | 'Conference' | 'Partner'>('Website');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('New');
  const [amount, setAmount] = useState('25000');
  const [accountId, setAccountId] = useState(dataset.accounts[0]?.id || '');
  const [dealStage, setDealStage] = useState<DealStageSlug>('prospecting');
  const [ownerId, setOwnerId] = useState(currentUser.id);
  const [closeDate, setCloseDate] = useState('2025-06-15');
  const [activityType, setActivityType] = useState<ActivityType>('Call Logged');
  const [description, setDescription] = useState('');
  const [meetingDate, setMeetingDate] = useState('2025-05-20');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('Zoom Video Room');
  const [priority, setPriority] = useState<PriorityLevel>('High');
  const [timeLabel, setTimeLabel] = useState('10:30 AM');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quickCreateMode) return;
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setTitle('');
    setAmount('25000');
    setAccountId(dataset.accounts[0]?.id || '');
    setDealStage('prospecting');
    setOwnerId(currentUser.id);
    setDescription('');
    setError('');
  }, [quickCreateMode, dataset.accounts, currentUser.id]);

  if (!quickCreateMode) return null;

  const titles: Record<string, string> = {
    lead: 'Add New Lead',
    deal: 'Create New Deal',
    contact: 'Add New Contact',
    account: 'Add Company Account',
    activity: 'Log Customer Activity',
    meeting: 'Schedule Meeting',
    note: 'Add Quick Note',
    followup: 'Create Follow-Up Reminder',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (quickCreateMode === 'lead') {
      if (!firstName.trim() || !lastName.trim() || !company.trim()) {
        setError('First name, last name, and company are required.');
        return;
      }
      addLead({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
        phone: phone.trim() || '+1 (415) 555-0190',
        company: company.trim(),
        title: title.trim() || 'VP of Operations',
        source: leadSource,
        status: leadStatus,
        score: 72,
        estimatedValue: Number(amount) || 20000,
        ownerId,
        notes: description.trim(),
      });
    } else if (quickCreateMode === 'deal') {
      if (!title.trim()) {
        setError('Deal title is required.');
        return;
      }
      addDeal({
        title: title.trim(),
        accountId,
        stage: dealStage,
        amount: Math.max(0, Number(amount) || 0),
        status: dealStage === 'closed_won' ? 'Won' : 'On Track',
        ownerId,
        expectedCloseDate: closeDate,
        notes: description.trim() || 'Created from quick action.',
      });
    } else if (quickCreateMode === 'contact') {
      if (!firstName.trim() || !lastName.trim()) {
        setError('Contact first and last name are required.');
        return;
      }
      addContact({
        accountId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || `${firstName.toLowerCase()}@example.com`,
        phone: phone.trim() || '+1 (415) 555-0142',
        title: title.trim() || 'Director',
        ownerId,
        lastContactedAt: new Date().toISOString(),
        notes: description.trim(),
      });
    } else if (quickCreateMode === 'account') {
      if (!company.trim()) {
        setError('Company name is required.');
        return;
      }
      addAccount({
        name: company.trim(),
        industry: title.trim() || 'Enterprise SaaS',
        website: `https://www.${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        employees: 250,
        annualRevenue: Number(amount) || 25000000,
        city: 'San Francisco',
        country: 'United States',
        ownerId,
        status: 'Prospect',
        logoColor: '#0AA6AD',
        logoInitials: company.trim().slice(0, 2).toUpperCase(),
      });
    } else if (quickCreateMode === 'activity' || quickCreateMode === 'note') {
      if (!description.trim() && !title.trim()) {
        setError('Please enter a title or details.');
        return;
      }
      addActivity({
        type: quickCreateMode === 'note' ? 'Note Added' : activityType,
        title: title.trim() || (quickCreateMode === 'note' ? 'Note Added' : activityType),
        description: description.trim() || title.trim(),
        accountId,
        ownerId,
      });
    } else if (quickCreateMode === 'meeting') {
      if (!title.trim()) {
        setError('Meeting title is required.');
        return;
      }
      addMeeting({
        title: title.trim(),
        accountId,
        ownerId,
        date: meetingDate,
        startTime,
        endTime,
        location: location.trim() || 'Zoom Video Room',
        type: 'Demo',
        attendees: [currentUser.name],
        notes: description.trim(),
      });
    } else if (quickCreateMode === 'followup') {
      if (!description.trim()) {
        setError('Reminder description is required.');
        return;
      }
      addFollowUp({
        timeLabel,
        dueDate: meetingDate,
        accountId,
        description: description.trim(),
        priority,
        ownerId,
        status: 'Pending',
        channel: 'Call',
      });
    }

    closeQuickCreate();
  };

  const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#0AA6AD] focus:outline-none focus:ring-2 focus:ring-[#0AA6AD]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
  const labelCls = 'mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300';

  return (
    <Modal open={Boolean(quickCreateMode)} onClose={closeQuickCreate} title={titles[quickCreateMode] || 'Create Record'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-[#FF6155]/10 px-3 py-2 text-xs font-medium text-[#FF6155]">
            {error}
          </div>
        )}

        {(quickCreateMode === 'lead' || quickCreateMode === 'contact') && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>First Name *</label>
              <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Elena" />
            </div>
            <div>
              <label className={labelCls}>Last Name *</label>
              <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Vance" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="elena@company.com" />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (415) 555-0192" />
            </div>
          </div>
        )}

        {quickCreateMode === 'lead' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Company *</label>
              <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="BrightWave Ltd." />
            </div>
            <div>
              <label className={labelCls}>Job Title</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VP of Engineering" />
            </div>
            <div>
              <label className={labelCls}>Source</label>
              <select className={inputCls} value={leadSource} onChange={(e) => setLeadSource(e.target.value as typeof leadSource)}>
                <option value="Website">Website</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Outbound">Outbound</option>
                <option value="Conference">Conference</option>
                <option value="Partner">Partner</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={leadStatus} onChange={(e) => setLeadStatus(e.target.value as LeadStatus)}>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Unqualified">Unqualified</option>
              </select>
            </div>
          </div>
        )}

        {quickCreateMode === 'deal' && (
          <>
            <div>
              <label className={labelCls}>Deal Title *</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enterprise Platform Expansion" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Account</label>
                <select className={inputCls} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                  {dataset.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Stage</label>
                <select className={inputCls} value={dealStage} onChange={(e) => setDealStage(e.target.value as DealStageSlug)}>
                  {dataset.dealStages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Amount ($)</label>
                <input type="number" min="0" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Expected Close Date</label>
                <input type="date" className={inputCls} value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
              </div>
            </div>
          </>
        )}

        {quickCreateMode === 'contact' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Account</label>
              <select className={inputCls} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                {dataset.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Role / Title</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Head of Procurement" />
            </div>
          </div>
        )}

        {quickCreateMode === 'account' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Company Name *</label>
              <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Aether Cloud Inc." />
            </div>
            <div>
              <label className={labelCls}>Industry</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cloud Infrastructure" />
            </div>
          </div>
        )}

        {(quickCreateMode === 'activity' || quickCreateMode === 'note') && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {quickCreateMode === 'activity' && (
              <div>
                <label className={labelCls}>Activity Type</label>
                <select className={inputCls} value={activityType} onChange={(e) => setActivityType(e.target.value as ActivityType)}>
                  <option value="Call Logged">Call Logged</option>
                  <option value="Email Opened">Email Opened</option>
                  <option value="Document Viewed">Document Viewed</option>
                  <option value="Reply Received">Reply Received</option>
                  <option value="Meeting Scheduled">Meeting Scheduled</option>
                  <option value="Note Added">Note Added</option>
                </select>
              </div>
            )}
            <div>
              <label className={labelCls}>Related Account</label>
              <select className={inputCls} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                {dataset.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Summary Title</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quarterly pricing alignment" />
            </div>
          </div>
        )}

        {quickCreateMode === 'meeting' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Meeting Title *</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product Demo — BrightWave Ltd." />
            </div>
            <div>
              <label className={labelCls}>Account</label>
              <select className={inputCls} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                {dataset.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" className={inputCls} value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Start Time</label>
              <input type="time" className={inputCls} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Location / Link</label>
              <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
        )}

        {quickCreateMode === 'followup' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Account</label>
              <select className={inputCls} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                {dataset.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Time</label>
              <input className={inputCls} value={timeLabel} onChange={(e) => setTimeLabel(e.target.value)} placeholder="10:30 AM" />
            </div>
            <div>
              <label className={labelCls}>Due Date</label>
              <input type="date" className={inputCls} value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <select className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value as PriorityLevel)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>Owner</label>
          <select className={inputCls} value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
            {dataset.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>
            {quickCreateMode === 'followup' || quickCreateMode === 'activity' || quickCreateMode === 'note'
              ? 'Details / Notes *'
              : 'Notes'}
          </label>
          <textarea
            rows={3}
            className={inputCls}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context, next steps, or summary..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeQuickCreate}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92] transition-colors whitespace-nowrap shrink-0"
          >
            Save Record
          </button>
        </div>
      </form>
    </Modal>
  );
};
