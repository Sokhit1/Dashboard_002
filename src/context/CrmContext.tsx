import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  dataProvider,
  deleteSupabaseRecord,
  fetchDatasetFromSupabase,
  pushDatasetToSupabase,
  syncSupabaseEntity,
} from '../services/dataService';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  Account,
  Activity,
  Contact,
  CrmDataset,
  DateRangePreset,
  Deal,
  DealStageSlug,
  DocumentItem,
  FollowUp,
  Lead,
  LeadStatus,
  Meeting,
  Organization,
  Product,
  QuickCreateMode,
  ToastMessage,
  User,
  UserPreferences,
} from '../types/crm';
import { generateId } from '../utils/formatters';

interface DerivedTeamMetric {
  user: User;
  revenue: number;
  target: number;
  achievementPct: number;
  dealsWon: number;
  conversionRate: number;
}

interface MonthlySalesPoint {
  month: string;
  monthIndex: number;
  actual: number;
  projected: number;
  target: number;
  isFuture: boolean;
}

interface ForecastChartPoint {
  month: string;
  historical: number | null;
  expected: number;
  bestCase: number;
  commit: number;
}

interface DerivedMetrics {
  totalLeads: number;
  leadsByStatus: Record<LeadStatus, number>;
  conversionRate: number;
  openDealsCount: number;
  openPipelineValue: number;
  closedWonCount: number;
  closedWonValue: number;
  mtdRevenue: number;
  annualTarget: number;
  annualAchieved: number;
  annualRemaining: number;
  targetPercent: number;
  monthlySales: MonthlySalesPoint[];
  teamPerformance: DerivedTeamMetric[];
  forecastSummary: {
    predictedRevenue: number;
    bestCase: number;
    weightedCommit: number;
    points: ForecastChartPoint[];
  };
}

interface CrmContextValue {
  dataset: CrmDataset;
  currentUser: User;
  metrics: DerivedMetrics;
  toasts: ToastMessage[];
  quickCreateMode: QuickCreateMode | null;
  supabaseSync: {
    configured: boolean;
    syncing: boolean;
    lastSyncedAt: string | null;
    error: string | null;
  };
  syncFromSupabase: () => Promise<void>;
  pushDemoToSupabase: () => Promise<void>;
  openQuickCreate: (mode: QuickCreateMode) => void;
  closeQuickCreate: () => void;
  addToast: (title: string, description?: string, variant?: ToastMessage['variant']) => void;
  dismissToast: (id: string) => void;
  resetDemoData: () => void;

  // Preferences & Settings
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  toggleTheme: () => void;
  setDateRange: (range: DateRangePreset) => void;
  updateCurrentUser: (patch: Partial<User>) => void;
  updateOrganization: (patch: Partial<Organization>) => void;

  // Leads CRUD
  addLead: (input: Omit<Lead, 'id' | 'organizationId' | 'createdAt'>) => Lead;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToDeal: (leadId: string) => Deal | null;

  // Deals CRUD
  addDeal: (input: Omit<Deal, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Deal;
  updateDeal: (id: string, patch: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  moveDealStage: (dealId: string, stage: DealStageSlug) => void;

  // Contacts CRUD
  addContact: (input: Omit<Contact, 'id' | 'organizationId' | 'createdAt'>) => Contact;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  // Accounts CRUD
  addAccount: (input: Omit<Account, 'id' | 'organizationId' | 'createdAt'>) => Account;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Activities CRUD
  addActivity: (input: Omit<Activity, 'id' | 'organizationId' | 'occurredAt'> & { occurredAt?: string }) => Activity;
  deleteActivity: (id: string) => void;

  // Follow-ups CRUD
  addFollowUp: (input: Omit<FollowUp, 'id' | 'organizationId' | 'createdAt'>) => FollowUp;
  updateFollowUp: (id: string, patch: Partial<FollowUp>) => void;
  deleteFollowUp: (id: string) => void;

  // Meetings CRUD
  addMeeting: (input: Omit<Meeting, 'id' | 'organizationId' | 'createdAt'>) => Meeting;
  updateMeeting: (id: string, patch: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;

  // Products CRUD
  addProduct: (input: Omit<Product, 'id' | 'organizationId' | 'createdAt'>) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Documents CRUD
  addDocument: (input: Omit<DocumentItem, 'id' | 'organizationId' | 'updatedAt'>) => DocumentItem;
  deleteDocument: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const CrmContext = createContext<CrmContextValue | null>(null);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [dataset, setDataset] = useState<CrmDataset>(() => dataProvider.loadDataset());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [quickCreateMode, setQuickCreateMode] = useState<QuickCreateMode | null>(null);
  const [supabaseSync, setSupabaseSync] = useState({
    configured: isSupabaseConfigured(),
    syncing: false,
    lastSyncedAt: null as string | null,
    error: null as string | null,
  });
  const initialRemoteSyncedRef = useRef(false);

  // Persist dataset changes to localStorage
  useEffect(() => {
    dataProvider.saveDataset(dataset);
  }, [dataset]);

  // Keep active user synchronized with AuthContext session
  useEffect(() => {
    if (!session) return;
    setDataset((prev) => {
      const targetEmail = session.email.toLowerCase();
      const existing = prev.users.find(
        (u) => u.id === session.userId || u.email.toLowerCase() === targetEmail
      );

      if (existing) {
        if (existing.isCurrentUser && existing.name === session.name && existing.role === session.role) {
          return prev;
        }
        return {
          ...prev,
          users: prev.users.map((u) =>
            u.id === existing.id
              ? { ...u, name: session.name, role: session.role, isCurrentUser: true }
              : { ...u, isCurrentUser: false }
          ),
        };
      }

      const parts = session.name.trim().split(/\s+/);
      const initials =
        parts.length >= 2
          ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
          : session.name.slice(0, 2).toUpperCase();

      const newUser: User = {
        id: session.userId,
        organizationId: prev.organization.id,
        name: session.name,
        email: session.email,
        role: session.role,
        initials,
        avatarColor: '#0AA6AD',
        monthlyQuota: 100000,
        annualQuota: 220000,
        conversionRate: 18.5,
        phone: '+1 (415) 555-0198',
        isCurrentUser: true,
        createdAt: session.signedInAt,
      };

      return {
        ...prev,
        users: [newUser, ...prev.users.map((u) => ({ ...u, isCurrentUser: false }))],
      };
    });
  }, [session]);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (dataset.preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [dataset.preferences.theme]);

  const addToast = useCallback(
    (title: string, description?: string, variant: ToastMessage['variant'] = 'success') => {
      const id = generateId('toast');
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openQuickCreate = useCallback((mode: QuickCreateMode) => {
    setQuickCreateMode(mode);
  }, []);

  const closeQuickCreate = useCallback(() => {
    setQuickCreateMode(null);
  }, []);

  const currentUser = useMemo(
    () => dataset.users.find((u) => u.isCurrentUser) || dataset.users[0],
    [dataset.users]
  );

  const resetDemoData = useCallback(() => {
    const fresh = dataProvider.resetDataset();
    setDataset(fresh);
    addToast('Demo data restored', 'All records reset to the baseline dataset.', 'info');
  }, [addToast]);

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    setDataset((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...patch },
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setDataset((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: prev.preferences.theme === 'dark' ? 'light' : 'dark',
      },
    }));
  }, []);

  const setDateRange = useCallback((dateRange: DateRangePreset) => {
    setDataset((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, dateRange },
    }));
  }, []);

  const syncFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setSupabaseSync((prev) => ({ ...prev, syncing: true, error: null }));
    const result = await fetchDatasetFromSupabase(dataset.preferences);
    if (result.error) {
      setSupabaseSync((prev) => ({ ...prev, syncing: false, error: result.error || null }));
      addToast('Supabase sync notice', result.error, 'warning');
      return;
    }
    if (result.dataset) {
      setDataset(result.dataset);
      setSupabaseSync((prev) => ({
        ...prev,
        syncing: false,
        lastSyncedAt: new Date().toISOString(),
        error: null,
      }));
      addToast('Synced with Supabase', 'Loaded latest CRM workspace records from PostgreSQL.');
    } else {
      setSupabaseSync((prev) => ({ ...prev, syncing: false, error: null }));
      addToast(
        'Supabase database is empty',
        'Click "Push Sample Data" in Settings to initialize your CRM tables.',
        'info'
      );
    }
  }, [dataset.preferences, addToast]);

  const pushDemoToSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      addToast(
        'Supabase not configured',
        'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment secrets first.',
        'warning'
      );
      return;
    }
    setSupabaseSync((prev) => ({ ...prev, syncing: true, error: null }));
    const res = await pushDatasetToSupabase(dataset);
    if (!res.ok) {
      setSupabaseSync((prev) => ({ ...prev, syncing: false, error: res.error || 'Sync failed' }));
      addToast('Supabase push failed', res.error, 'error');
      return;
    }
    setSupabaseSync((prev) => ({
      ...prev,
      syncing: false,
      lastSyncedAt: new Date().toISOString(),
      error: null,
    }));
    addToast('Seeded Supabase PostgreSQL', 'All 15 CRM tables synced successfully.');
  }, [dataset, addToast]);

  // Auto-hydrate from Supabase once authenticated when configured
  useEffect(() => {
    if (!isSupabaseConfigured() || !session || initialRemoteSyncedRef.current) return;
    initialRemoteSyncedRef.current = true;
    void fetchDatasetFromSupabase(dataset.preferences).then((res) => {
      if (res.dataset) {
        setDataset(res.dataset);
        setSupabaseSync((prev) => ({
          ...prev,
          lastSyncedAt: new Date().toISOString(),
          error: null,
        }));
      }
    });
  }, [session, dataset.preferences]);

  const updateCurrentUser = useCallback(
    (patch: Partial<User>) => {
      const updated = { ...currentUser, ...patch };
      setDataset((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === currentUser.id ? updated : u)),
      }));
      void syncSupabaseEntity({ type: 'user', data: updated });
      addToast('Profile updated', 'Your user settings have been saved.');
    },
    [currentUser, addToast]
  );

  const updateOrganization = useCallback(
    (patch: Partial<Organization>) => {
      const nextOrg = { ...dataset.organization, ...patch };
      setDataset((prev) => ({
        ...prev,
        organization: nextOrg,
        preferences: patch.currency
          ? { ...prev.preferences, currency: patch.currency }
          : prev.preferences,
      }));
      void syncSupabaseEntity({ type: 'organization', data: nextOrg });
      addToast('Organization updated', 'Workspace preferences saved.');
    },
    [dataset.organization, addToast]
  );

  // Leads CRUD
  const addLead = useCallback(
    (input: Omit<Lead, 'id' | 'organizationId' | 'createdAt'>) => {
      const created: Lead = {
        ...input,
        id: generateId('lead'),
        organizationId: dataset.organization.id,
        createdAt: new Date().toISOString(),
      };
      setDataset((prev) => ({
        ...prev,
        leads: [created, ...prev.leads],
      }));
      void syncSupabaseEntity({ type: 'lead', data: created });
      addToast('Lead created', `${created.firstName} ${created.lastName} (${created.company})`);
      return created;
    },
    [dataset.organization.id, addToast]
  );

  const updateLead = useCallback(
    (id: string, patch: Partial<Lead>) => {
      setDataset((prev) => ({
        ...prev,
        leads: prev.leads.map((l) => {
          if (l.id !== id) return l;
          const next = { ...l, ...patch };
          void syncSupabaseEntity({ type: 'lead', data: next });
          return next;
        }),
      }));
      addToast('Lead updated');
    },
    [addToast]
  );

  const deleteLead = useCallback(
    (id: string) => {
      setDataset((prev) => ({
        ...prev,
        leads: prev.leads.filter((l) => l.id !== id),
      }));
      void deleteSupabaseRecord('leads', id);
      addToast('Lead deleted', undefined, 'info');
    },
    [addToast]
  );

  const convertLeadToDeal = useCallback(
    (leadId: string): Deal | null => {
      const lead = dataset.leads.find((l) => l.id === leadId);
      if (!lead) return null;

      let targetAccount = dataset.accounts.find(
        (a) => a.name.toLowerCase() === lead.company.toLowerCase()
      );
      const createdAccount: Account | null = targetAccount
        ? null
        : {
            id: generateId('acc'),
            organizationId: dataset.organization.id,
            name: lead.company,
            industry: 'Technology',
            website: `https://www.${lead.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            employees: 120,
            annualRevenue: 15000000,
            city: 'San Francisco',
            country: 'United States',
            ownerId: lead.ownerId,
            status: 'Prospect',
            logoColor: '#0AA6AD',
            logoInitials: lead.company.slice(0, 2).toUpperCase(),
            createdAt: new Date().toISOString(),
          };
      const accountId = targetAccount ? targetAccount.id : createdAccount!.id;

      const newDeal: Deal = {
        id: generateId('deal'),
        organizationId: dataset.organization.id,
        title: `${lead.company} Expansion`,
        accountId,
        stage: 'qualification',
        amount: lead.estimatedValue || 25000,
        status: 'On Track',
        ownerId: lead.ownerId,
        expectedCloseDate: '2025-06-30',
        notes: `Converted from lead ${lead.firstName} ${lead.lastName}.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDataset((prev) => ({
        ...prev,
        accounts: createdAccount ? [createdAccount, ...prev.accounts] : prev.accounts,
        leads: prev.leads.map((l) => (l.id === leadId ? { ...l, status: 'Qualified' } : l)),
        deals: [newDeal, ...prev.deals],
      }));
      if (createdAccount) void syncSupabaseEntity({ type: 'account', data: createdAccount });
      void syncSupabaseEntity({ type: 'lead', data: { ...lead, status: 'Qualified' } });
      void syncSupabaseEntity({ type: 'deal', data: newDeal });
      addToast('Lead converted to Deal', `${newDeal.title} added to Qualification stage.`);
      return newDeal;
    },
    [dataset.leads, dataset.accounts, dataset.organization.id, addToast]
  );

  // Deals CRUD
  const addDeal = useCallback(
    (input: Omit<Deal, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const created: Deal = {
        ...input,
        id: generateId('deal'),
        organizationId: dataset.organization.id,
        closedAt: input.stage === 'closed_won' ? input.closedAt || now : undefined,
        createdAt: now,
        updatedAt: now,
      };
      setDataset((prev) => ({
        ...prev,
        deals: [created, ...prev.deals],
      }));
      void syncSupabaseEntity({ type: 'deal', data: created });
      addToast('Deal created', created.title);
      return created;
    },
    [dataset.organization.id, addToast]
  );

  const updateDeal = useCallback(
    (id: string, patch: Partial<Deal>) => {
      const now = new Date().toISOString();
      setDataset((prev) => ({
        ...prev,
        deals: prev.deals.map((d) => {
          if (d.id !== id) return d;
          const nextStage = patch.stage ?? d.stage;
          const updated: Deal = {
            ...d,
            ...patch,
            status: nextStage === 'closed_won' ? 'Won' : patch.status ?? d.status,
            closedAt: nextStage === 'closed_won' ? d.closedAt || patch.closedAt || now : undefined,
            updatedAt: now,
          };
          void syncSupabaseEntity({ type: 'deal', data: updated });
          return updated;
        }),
      }));
      addToast('Deal updated');
    },
    [addToast]
  );

  const deleteDeal = useCallback(
    (id: string) => {
      setDataset((prev) => ({
        ...prev,
        deals: prev.deals.filter((d) => d.id !== id),
      }));
      void deleteSupabaseRecord('deals', id);
      addToast('Deal deleted', undefined, 'info');
    },
    [addToast]
  );

  const moveDealStage = useCallback(
    (dealId: string, stage: DealStageSlug) => {
      const target = dataset.deals.find((d) => d.id === dealId);
      if (!target || target.stage === stage) return;
      const stageLabel = dataset.dealStages.find((s) => s.id === stage)?.name || stage;
      const now = new Date().toISOString();

      const updatedDeal: Deal = {
        ...target,
        stage,
        status: stage === 'closed_won' ? ('Won' as const) : target.status === 'Won' ? ('On Track' as const) : target.status,
        closedAt: stage === 'closed_won' ? target.closedAt || '2025-05-18T12:00:00Z' : undefined,
        updatedAt: now,
      };

      const logActivity: Activity = {
        id: generateId('act'),
        organizationId: dataset.organization.id,
        type: stage === 'closed_won' ? 'Note Added' : 'Document Viewed',
        title: `Moved to ${stageLabel}`,
        description: `${target.title} moved to ${stageLabel}.`,
        accountId: target.accountId,
        dealId: target.id,
        ownerId: currentUser.id,
        occurredAt: now,
        relativeTimeLabel: 'Just now',
      };

      setDataset((prev) => ({
        ...prev,
        deals: prev.deals.map((d) => (d.id === dealId ? updatedDeal : d)),
        activities: [logActivity, ...prev.activities],
      }));

      void syncSupabaseEntity({ type: 'deal', data: updatedDeal });
      void syncSupabaseEntity({ type: 'activity', data: logActivity });
      addToast(`Moved to ${stageLabel}`, target.title);
    },
    [dataset.deals, dataset.dealStages, dataset.organization.id, currentUser.id, addToast]
  );

  // Contacts CRUD
  const addContact = useCallback(
    (input: Omit<Contact, 'id' | 'organizationId' | 'createdAt'>) => {
      const created: Contact = {
        ...input,
        id: generateId('cnt'),
        organizationId: dataset.organization.id,
        createdAt: new Date().toISOString(),
      };
      setDataset((prev) => ({ ...prev, contacts: [created, ...prev.contacts] }));
      void syncSupabaseEntity({ type: 'contact', data: created });
      addToast('Contact added', `${created.firstName} ${created.lastName}`);
      return created;
    },
    [dataset.organization.id, addToast]
  );

  const updateContact = useCallback(
    (id: string, patch: Partial<Contact>) => {
      setDataset((prev) => ({
        ...prev,
        contacts: prev.contacts.map((c) => {
          if (c.id !== id) return c;
          const next = { ...c, ...patch };
          void syncSupabaseEntity({ type: 'contact', data: next });
          return next;
        }),
      }));
      addToast('Contact updated');
    },
    [addToast]
  );

  const deleteContact = useCallback(
    (id: string) => {
      setDataset((prev) => ({
        ...prev,
        contacts: prev.contacts.filter((c) => c.id !== id),
      }));
      void deleteSupabaseRecord('contacts', id);
      addToast('Contact deleted', undefined, 'info');
    },
    [addToast]
  );

  // Accounts CRUD
  const addAccount = useCallback(
    (input: Omit<Account, 'id' | 'organizationId' | 'createdAt'>) => {
      const created: Account = {
        ...input,
        id: generateId('acc'),
        organizationId: dataset.organization.id,
        createdAt: new Date().toISOString(),
      };
      setDataset((prev) => ({ ...prev, accounts: [created, ...prev.accounts] }));
      void syncSupabaseEntity({ type: 'account', data: created });
      addToast('Account added', created.name);
      return created;
    },
    [dataset.organization.id, addToast]
  );

  const updateAccount = useCallback(
    (id: string, patch: Partial<Account>) => {
      setDataset((prev) => ({
        ...prev,
        accounts: prev.accounts.map((a) => {
          if (a.id !== id) return a;
          const next = { ...a, ...patch };
          void syncSupabaseEntity({ type: 'account', data: next });
          return next;
        }),
      }));
      addToast('Account updated');
    },
    [addToast]
  );

  const deleteAccount = useCallback(
    (id: string) => {
      setDataset((prev) => ({
        ...prev,
        accounts: prev.accounts.filter((a) => a.id !== id),
      }));
      void deleteSupabaseRecord('accounts', id);
      addToast('Account deleted', undefined, 'info');
    },
    [addToast]
  );

  // Activities CRUD
  const addActivity = useCallback(
    (input: Omit<Activity, 'id' | 'organizationId' | 'occurredAt'> & { occurredAt?: string }) => {
      const created: Activity = {
        ...input,
        id: generateId('act'),
        organizationId: dataset.organization.id,
        occurredAt: input.occurredAt || new Date().toISOString(),
        relativeTimeLabel: 'Just now',
      };
      setDataset((prev) => ({ ...prev, activities: [created, ...prev.activities] }));
      void syncSupabaseEntity({ type: 'activity', data: created });
      addToast('Activity logged', created.title);
      return created;
    },
    [dataset.organization.id, addToast]
  );

  const deleteActivity = useCallback(
    (id: string) => {
      setDataset((prev) => ({
        ...prev,
        activities: prev.activities.filter((a) => a.id !== id),
      }));
      void deleteSupabaseRecord('activities', id);
      addToast('Activity removed', undefined, 'info');
    },
    [addToast]
  );

  // FollowUps CRUD
  const addFollowUp = useCallback(
    (input: Omit<FollowUp, 'id' | 'organizationId' | 'createdAt'>) => {
      const created: FollowUp = {
        ...input,
        id: generateId('fu'),
        organizationId: dataset.organization.id,
        createdAt: new Date().toISOString(),
      };
      setDataset((prev) => ({ ...prev, followUps: [created, ...prev.followUps] }));
      void syncSupabaseEntity({ type: 'follow_up', data: created });
      addToast('Follow-up scheduled', created.description);
      return created;
    },
    [dataset.organization.id, addToast]
  );

  const updateFollowUp = useCallback(
    (id: string, patch: Partial<FollowUp>) => {
      setDataset((prev) => ({
        ...prev,
        followUps: prev.followUps.map((f) => {
          if (f.id !== id) return f;
          const next = { ...f, ...patch };
          void syncSupabaseEntity({ type: 'follow_up', data: next });
          return next;
        }),
      }));
      if (patch.status === 'Completed') {
        addToast('Follow-up marked complete');
      } else {
        addToast('Follow-up updated');
      }
    },
    [addToast]
  );

  const deleteFollowUp = useCallback(
    (id: string) => {
      setDataset((prev) => ({
        ...prev,
        followUps: prev.followUps.filter((f) => f.id !== id),
      }));
      void deleteSupabaseRecord('follow_ups', id);
      addToast('Follow-up deleted', undefined, 'info');
    },
    [addToast]
  );

  // Meetings CRUD
  const addMeeting = useCallback(
    (input: Omit<Meeting, 'id' | 'organizationId' | 'createdAt'>) => {
      const created: Meeting = {
        ...input,
        id: generateId('mtg'),
        organizationId: dataset.organization.id,
        createdAt: new Date().toISOString(),
      };
      setDataset((prev) => ({ ...prev, meetings: [created, ...prev.meetings] }));
      void syncSupabaseEntity({ type: 'meeting', data: created });
      addToast('Meeting scheduled', created.title);
      return created;
    },
    [dataset.organization.id, addToast]
  );

  const updateMeeting = useCallback(
    (id: string, patch: Partial<Meeting>) => {
      setDataset((prev) => ({
        ...prev,
        meetings: prev.meetings.map((m) => {
          if (m.id !== id) return m;
          const next = { ...m, ...patch };
          void syncSupabaseEntity({ type: 'meeting', data: next });
          return next;
        }),
      }));
      addToast('Meeting updated');
    },
    [addToast]
  );

  const deleteMeeting = useCallback(
    (id: string) => {
      setDataset((prev) => ({
        ...prev,
        meetings: prev.meetings.filter((m) => m.id !== id),
      }));
      void deleteSupabaseRecord('meetings', id);
      addToast('Meeting cancelled', undefined, 'info');
    },
    [addToast]
  );

  // Products CRUD
  const addProduct = useCallback(
    (input: Omit<Product, 'id' | 'organizationId' | 'createdAt'>) => {
      const created: Product = {
        ...input,
        id: generateId('prod'),
        organizationId: dataset.organization.id,
        createdAt: new Date().toISOString(),
      };
      setDataset((prev) => ({ ...prev, products: [created, ...prev.products] }));
      void syncSupabaseEntity({ type: 'product', data: created });
      addToast('Product added', created.name);
      return created;
    },
    [dataset.organization.id, addToast]
  );

  const updateProduct = useCallback(
    (id: string, patch: Partial<Product>) => {
      setDataset((prev) => ({
        ...prev,
        products: prev.products.map((p) => {
          if (p.id !== id) return p;
          const next = { ...p, ...patch };
          void syncSupabaseEntity({ type: 'product', data: next });
          return next;
        }),
      }));
      addToast('Product updated');
    },
    [addToast]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      setDataset((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.id !== id),
      }));
      void deleteSupabaseRecord('products', id);
      addToast('Product deleted', undefined, 'info');
    },
    [addToast]
  );

  // Documents CRUD
  const addDocument = useCallback(
    (input: Omit<DocumentItem, 'id' | 'organizationId' | 'updatedAt'>) => {
      const created: DocumentItem = {
        ...input,
        id: generateId('doc'),
        organizationId: dataset.organization.id,
        updatedAt: new Date().toISOString(),
      };
      setDataset((prev) => ({ ...prev, documents: [created, ...prev.documents] }));
      void syncSupabaseEntity({ type: 'document', data: created });
      addToast('Document uploaded', created.name);
      return created;
    },
    [dataset.organization.id, addToast]
  );

  const deleteDocument = useCallback(
    (id: string) => {
      setDataset((prev) => ({
        ...prev,
        documents: prev.documents.filter((d) => d.id !== id),
      }));
      void deleteSupabaseRecord('documents', id);
      addToast('Document removed', undefined, 'info');
    },
    [addToast]
  );

  const markNotificationRead = useCallback((id: string) => {
    setDataset((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => {
        if (n.id !== id) return n;
        const next = { ...n, read: true };
        void syncSupabaseEntity({ type: 'notification', data: next });
        return next;
      }),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setDataset((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => {
        const next = { ...n, read: true };
        void syncSupabaseEntity({ type: 'notification', data: next });
        return next;
      }),
    }));
  }, []);

  // Dynamically derived metrics — 100% consistent with underlying records
  const metrics = useMemo<DerivedMetrics>(() => {
    const leadsByStatus: Record<LeadStatus, number> = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      Unqualified: 0,
    };
    dataset.leads.forEach((l) => {
      leadsByStatus[l.status] = (leadsByStatus[l.status] || 0) + 1;
    });
    const totalLeads = dataset.leads.length;
    const conversionRate = totalLeads > 0 ? Number(((leadsByStatus.Qualified / totalLeads) * 100).toFixed(1)) : 0;

    const openDeals = dataset.deals.filter((d) => d.stage !== 'closed_won');
    const closedWonDeals = dataset.deals.filter((d) => d.stage === 'closed_won');
    const openDealsCount = openDeals.length;
    const openPipelineValue = openDeals.reduce((sum, d) => sum + d.amount, 0);
    const closedWonCount = closedWonDeals.length;
    const closedWonValue = closedWonDeals.reduce((sum, d) => sum + d.amount, 0);

    // Bucket Closed Won deals by month (default May 2025 if newly closed)
    const dealsByMonth: Record<number, number> = {};
    let mtdRevenue = 0;
    closedWonDeals.forEach((d) => {
      const refDate = d.closedAt || d.updatedAt || '2025-05-15';
      const parsed = new Date(refDate);
      const monthIdx = Number.isNaN(parsed.getTime()) ? 4 : parsed.getUTCMonth();
      dealsByMonth[monthIdx] = (dealsByMonth[monthIdx] || 0) + d.amount;
      if (monthIdx === 4) {
        mtdRevenue += d.amount;
      }
    });

    const monthlySales: MonthlySalesPoint[] = dataset.salesTargets.map((st) => {
      const actual = st.baselineActualAmount + (dealsByMonth[st.monthIndex] || 0);
      const isFuture = st.monthIndex > 4;
      const projected = isFuture ? Math.round(st.targetAmount * (0.7 + ((st.monthIndex % 3) * 0.12))) : 0;
      return {
        month: st.monthLabel,
        monthIndex: st.monthIndex,
        actual,
        projected,
        target: st.targetAmount,
        isFuture,
      };
    });

    const annualAchieved = monthlySales.reduce((sum, m) => sum + m.actual, 0);
    const annualTarget = dataset.organization.annualTarget || 1000000;
    const annualRemaining = Math.max(0, annualTarget - annualAchieved);
    const targetPercent = Math.min(100, Math.round((annualAchieved / annualTarget) * 100));

    // Team performance derived dynamically from deals + rep quotas
    const stageProbMap: Record<DealStageSlug, number> = {
      prospecting: 0.2,
      qualification: 0.4,
      proposal: 0.6,
      negotiation: 0.8,
      closed_won: 1,
    };

    const teamPerformance: DerivedTeamMetric[] = dataset.users.map((user) => {
      const userWonDeals = closedWonDeals.filter((d) => d.ownerId === user.id);
      const wonRevenue = userWonDeals.reduce((s, d) => s + d.amount, 0);
      const userOpenWeighted = openDeals
        .filter((d) => d.ownerId === user.id)
        .reduce((s, d) => s + d.amount * stageProbMap[d.stage] * 0.25, 0);
      const revenue = Math.round(wonRevenue + userOpenWeighted);
      const achievementPct = Math.min(140, Math.round((revenue / Math.max(1, user.monthlyQuota)) * 100));
      return {
        user,
        revenue,
        target: user.monthlyQuota,
        achievementPct,
        dealsWon: userWonDeals.length,
        conversionRate: user.conversionRate,
      };
    });

    // Revenue Forecast (May–Oct) derived dynamically from Achieved + Weighted Open Pipeline
    const weightedOpen = openDeals.reduce((sum, d) => sum + d.amount * stageProbMap[d.stage], 0);
    const predictedRevenue = Math.round(annualAchieved + weightedOpen);
    const bestCase = Math.round(annualAchieved + openPipelineValue * 0.82);
    const weightedCommit = Math.round(annualAchieved + weightedOpen * 0.72);

    const mayBase = monthlySales[4]?.actual || mtdRevenue;
    const forecastPoints: ForecastChartPoint[] = [
      { month: 'May', historical: Math.round(mayBase), expected: Math.round(mayBase), bestCase: Math.round(mayBase), commit: Math.round(mayBase) },
      { month: 'Jun', historical: null, expected: Math.round(mayBase + weightedOpen * 0.28), bestCase: Math.round(mayBase + openPipelineValue * 0.22), commit: Math.round(mayBase + weightedOpen * 0.18) },
      { month: 'Jul', historical: null, expected: Math.round(mayBase + weightedOpen * 0.52), bestCase: Math.round(mayBase + openPipelineValue * 0.42), commit: Math.round(mayBase + weightedOpen * 0.36) },
      { month: 'Aug', historical: null, expected: Math.round(mayBase + weightedOpen * 0.78), bestCase: Math.round(mayBase + openPipelineValue * 0.65), commit: Math.round(mayBase + weightedOpen * 0.56) },
      { month: 'Sep', historical: null, expected: Math.round(mayBase + weightedOpen * 0.92), bestCase: Math.round(mayBase + openPipelineValue * 0.78), commit: Math.round(mayBase + weightedOpen * 0.7) },
      { month: 'Oct', historical: null, expected: predictedRevenue, bestCase, commit: weightedCommit },
    ];

    return {
      totalLeads,
      leadsByStatus,
      conversionRate,
      openDealsCount,
      openPipelineValue,
      closedWonCount,
      closedWonValue,
      mtdRevenue,
      annualTarget,
      annualAchieved,
      annualRemaining,
      targetPercent,
      monthlySales,
      teamPerformance,
      forecastSummary: {
        predictedRevenue,
        bestCase,
        weightedCommit,
        points: forecastPoints,
      },
    };
  }, [dataset.leads, dataset.deals, dataset.salesTargets, dataset.organization.annualTarget, dataset.users]);

  const value: CrmContextValue = {
    dataset,
    currentUser,
    metrics,
    toasts,
    quickCreateMode,
    supabaseSync,
    syncFromSupabase,
    pushDemoToSupabase,
    openQuickCreate,
    closeQuickCreate,
    addToast,
    dismissToast,
    resetDemoData,
    updatePreferences,
    toggleTheme,
    setDateRange,
    updateCurrentUser,
    updateOrganization,
    addLead,
    updateLead,
    deleteLead,
    convertLeadToDeal,
    addDeal,
    updateDeal,
    deleteDeal,
    moveDealStage,
    addContact,
    updateContact,
    deleteContact,
    addAccount,
    updateAccount,
    deleteAccount,
    addActivity,
    deleteActivity,
    addFollowUp,
    updateFollowUp,
    deleteFollowUp,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    addProduct,
    updateProduct,
    deleteProduct,
    addDocument,
    deleteDocument,
    markNotificationRead,
    markAllNotificationsRead,
  };

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
};

export function useCrm(): CrmContextValue {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm must be used inside CrmProvider');
  return ctx;
}
