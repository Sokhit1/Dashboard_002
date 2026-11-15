import { createSeedData } from '../data/seedData';
import { getSupabaseClient, getSupabaseEnvInfo, isSupabaseConfigured } from '../lib/supabase';
import {
  Account,
  Activity,
  Contact,
  CrmDataset,
  Deal,
  DealProduct,
  DealStage,
  DocumentItem,
  FollowUp,
  Lead,
  Meeting,
  NotificationItem,
  Organization,
  Product,
  SalesTarget,
  User,
} from '../types/crm';

const STORAGE_KEY = 'nexora_crm_demo_dataset_v1';

export interface CrmDataProvider {
  readonly mode: 'demo' | 'supabase';
  loadDataset(): CrmDataset;
  saveDataset(dataset: CrmDataset): void;
  resetDataset(): CrmDataset;
}

class DemoLocalStorageProvider implements CrmDataProvider {
  get mode(): 'demo' | 'supabase' {
    return isSupabaseConfigured() ? 'supabase' : 'demo';
  }

  loadDataset(): CrmDataset {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = createSeedData();
        this.saveDataset(seeded);
        return seeded;
      }
      const parsed = JSON.parse(raw) as Partial<CrmDataset>;
      const fallback = createSeedData();
      return {
        ...fallback,
        ...parsed,
        organization: { ...fallback.organization, ...(parsed.organization || {}) },
        preferences: { ...fallback.preferences, ...(parsed.preferences || {}) },
        dealStages: parsed.dealStages?.length ? parsed.dealStages : fallback.dealStages,
      };
    } catch {
      const seeded = createSeedData();
      this.saveDataset(seeded);
      return seeded;
    }
  }

  saveDataset(dataset: CrmDataset): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
    } catch {
      // Ignore storage quota errors in restricted frames
    }
  }

  resetDataset(): CrmDataset {
    const seeded = createSeedData();
    this.saveDataset(seeded);
    return seeded;
  }
}

export interface SupabaseConnectionConfig {
  url: string;
  anonKey: string;
  configured: boolean;
}

export function getSupabaseConfig(): SupabaseConnectionConfig {
  const env = getSupabaseEnvInfo();
  return {
    url: env.url,
    anonKey: env.anonKey,
    configured: env.configured,
  };
}

export const dataProvider: CrmDataProvider = new DemoLocalStorageProvider();

// =============================================================================
// Supabase PostgreSQL Bidirectional Mappers & Live Sync
// =============================================================================

type DbRow = Record<string, unknown>;

const toOrgRow = (o: Organization): DbRow => ({
  id: o.id,
  name: o.name,
  domain: o.domain,
  plan: o.plan,
  currency: o.currency,
  annual_target: o.annualTarget,
  created_at: o.createdAt,
});

const fromOrgRow = (r: DbRow): Organization => ({
  id: String(r.id),
  name: String(r.name),
  domain: String(r.domain || ''),
  plan: (r.plan as Organization['plan']) || 'Growth',
  currency: (r.currency as Organization['currency']) || 'USD',
  annualTarget: Number(r.annual_target ?? 1000000),
  createdAt: String(r.created_at || new Date().toISOString()),
});

const toUserRow = (u: User): DbRow => ({
  id: u.id,
  organization_id: u.organizationId,
  name: u.name,
  email: u.email,
  role: u.role,
  avatar_color: u.avatarColor,
  initials: u.initials,
  phone: u.phone,
  monthly_quota: u.monthlyQuota,
  annual_quota: u.annualQuota,
  conversion_rate: u.conversionRate,
  is_current_user: Boolean(u.isCurrentUser),
  created_at: u.createdAt,
});

const fromUserRow = (r: DbRow): User => ({
  id: String(r.id),
  organizationId: String(r.organization_id),
  name: String(r.name),
  email: String(r.email),
  role: String(r.role),
  avatarColor: String(r.avatar_color || '#0AA6AD'),
  initials: String(r.initials || 'NX'),
  phone: String(r.phone || ''),
  monthlyQuota: Number(r.monthly_quota ?? 150000),
  annualQuota: Number(r.annual_quota ?? 1800000),
  conversionRate: Number(r.conversion_rate ?? 18.5),
  isCurrentUser: Boolean(r.is_current_user),
  createdAt: String(r.created_at || new Date().toISOString()),
});

const toAccountRow = (a: Account): DbRow => ({
  id: a.id,
  organization_id: a.organizationId,
  name: a.name,
  industry: a.industry,
  website: a.website,
  employees: a.employees,
  annual_revenue: a.annualRevenue,
  city: a.city,
  country: a.country,
  owner_id: a.ownerId || null,
  status: a.status,
  logo_color: a.logoColor,
  logo_initials: a.logoInitials,
  created_at: a.createdAt,
});

const fromAccountRow = (r: DbRow): Account => ({
  id: String(r.id),
  organizationId: String(r.organization_id),
  name: String(r.name),
  industry: String(r.industry || ''),
  website: String(r.website || ''),
  employees: Number(r.employees ?? 0),
  annualRevenue: Number(r.annual_revenue ?? 0),
  city: String(r.city || ''),
  country: String(r.country || ''),
  ownerId: String(r.owner_id || ''),
  status: (r.status as Account['status']) || 'Active',
  logoColor: String(r.logo_color || '#0AA6AD'),
  logoInitials: String(r.logo_initials || 'AC'),
  createdAt: String(r.created_at || new Date().toISOString()),
});

const toContactRow = (c: Contact): DbRow => ({
  id: c.id,
  organization_id: c.organizationId,
  account_id: c.accountId || null,
  first_name: c.firstName,
  last_name: c.lastName,
  email: c.email,
  phone: c.phone,
  title: c.title,
  owner_id: c.ownerId || null,
  last_contacted_at: c.lastContactedAt || null,
  notes: c.notes,
  created_at: c.createdAt,
});

const fromContactRow = (r: DbRow): Contact => ({
  id: String(r.id),
  organizationId: String(r.organization_id),
  accountId: String(r.account_id || ''),
  firstName: String(r.first_name),
  lastName: String(r.last_name),
  email: String(r.email),
  phone: String(r.phone || ''),
  title: String(r.title || ''),
  ownerId: String(r.owner_id || ''),
  lastContactedAt: String(r.last_contacted_at || r.created_at || new Date().toISOString()),
  notes: String(r.notes || ''),
  createdAt: String(r.created_at || new Date().toISOString()),
});

const toLeadRow = (l: Lead): DbRow => ({
  id: l.id,
  organization_id: l.organizationId,
  first_name: l.firstName,
  last_name: l.lastName,
  email: l.email,
  phone: l.phone,
  company: l.company,
  title: l.title,
  source: l.source,
  status: l.status,
  score: l.score,
  estimated_value: l.estimatedValue,
  owner_id: l.ownerId || null,
  notes: l.notes,
  created_at: l.createdAt,
});

const fromLeadRow = (r: DbRow): Lead => ({
  id: String(r.id),
  organizationId: String(r.organization_id),
  firstName: String(r.first_name),
  lastName: String(r.last_name),
  email: String(r.email),
  phone: String(r.phone || ''),
  company: String(r.company),
  title: String(r.title || ''),
  source: (r.source as Lead['source']) || 'Website',
  status: (r.status as Lead['status']) || 'New',
  score: Number(r.score ?? 50),
  estimatedValue: Number(r.estimated_value ?? 0),
  ownerId: String(r.owner_id || ''),
  notes: String(r.notes || ''),
  createdAt: String(r.created_at || new Date().toISOString()),
});

const toDealStageRow = (s: DealStage): DbRow => ({
  id: s.id,
  name: s.name,
  sort_order: s.order,
  probability: s.probability,
  color: s.color,
});

const fromDealStageRow = (r: DbRow): DealStage => ({
  id: r.id as DealStage['id'],
  name: String(r.name),
  order: Number(r.sort_order ?? 1),
  probability: Number(r.probability ?? 20),
  color: String(r.color || '#0AA6AD'),
});

const toDealRow = (d: Deal): DbRow => ({
  id: d.id,
  organization_id: d.organizationId,
  title: d.title,
  account_id: d.accountId || null,
  contact_id: d.contactId || null,
  stage: d.stage,
  amount: d.amount,
  status: d.status,
  owner_id: d.ownerId || null,
  expected_close_date: d.expectedCloseDate,
  closed_at: d.closedAt || null,
  notes: d.notes,
  created_at: d.createdAt,
  updated_at: d.updatedAt,
});

const fromDealRow = (r: DbRow): Deal => ({
  id: String(r.id),
  organizationId: String(r.organization_id),
  title: String(r.title),
  accountId: String(r.account_id || ''),
  contactId: r.contact_id ? String(r.contact_id) : undefined,
  stage: (r.stage as Deal['stage']) || 'prospecting',
  amount: Number(r.amount ?? 0),
  status: (r.status as Deal['status']) || 'On Track',
  ownerId: String(r.owner_id || ''),
  expectedCloseDate: String(r.expected_close_date || '2025-06-30'),
  closedAt: r.closed_at ? String(r.closed_at) : undefined,
  notes: String(r.notes || ''),
  createdAt: String(r.created_at || new Date().toISOString()),
  updatedAt: String(r.updated_at || new Date().toISOString()),
});

const toProductRow = (p: Product): DbRow => ({
  id: p.id,
  organization_id: p.organizationId,
  sku: p.sku,
  name: p.name,
  category: p.category,
  unit_price: p.unitPrice,
  billing_cycle: p.billingCycle,
  active: p.active,
  description: p.description,
  created_at: p.createdAt,
});

const fromProductRow = (r: DbRow): Product => ({
  id: String(r.id),
  organizationId: String(r.organization_id),
  sku: String(r.sku),
  name: String(r.name),
  category: (r.category as Product['category']) || 'Platform',
  unitPrice: Number(r.unit_price ?? 0),
  billingCycle: (r.billing_cycle as Product['billingCycle']) || 'Annual',
  active: Boolean(r.active ?? true),
  description: String(r.description || ''),
  createdAt: String(r.created_at || new Date().toISOString()),
});

const toDealProductRow = (dp: DealProduct): DbRow => ({
  id: dp.id,
  deal_id: dp.dealId,
  product_id: dp.productId,
  quantity: dp.quantity,
  unit_price: dp.unitPrice,
});

const fromDealProductRow = (r: DbRow): DealProduct => ({
  id: String(r.id),
  dealId: String(r.deal_id),
  productId: String(r.product_id),
  quantity: Number(r.quantity ?? 1),
  unitPrice: Number(r.unit_price ?? 0),
});

const toActivityRow = (a: Activity): DbRow => ({
  id: a.id,
  organization_id: a.organizationId,
  type: a.type,
  title: a.title,
  description: a.description,
  account_id: a.accountId || null,
  contact_id: a.contactId || null,
  deal_id: a.dealId || null,
  owner_id: a.ownerId || null,
  occurred_at: a.occurredAt,
  relative_time_label: a.relativeTimeLabel || null,
});

const fromActivityRow = (r: DbRow): Activity => ({
  id: String(r.id),
  organizationId: String(r.organization_id),
  type: (r.type as Activity['type']) || 'Note Added',
  title: String(r.title),
  description: String(r.description || ''),
  accountId: r.account_id ? String(r.account_id) : undefined,
  contactId: r.contact_id ? String(r.contact_id) : undefined,
  dealId: r.deal_id ? String(r.deal_id) : undefined,
  ownerId: String(r.owner_id || ''),
  occurredAt: String(r.occurred_at || new Date().toISOString()),
  relativeTimeLabel: r.relative_time_label ? String(r.relative_time_label) : undefined,
});

const toFollowUpRow = (f: FollowUp): DbRow => ({
  id: f.id,
  organization_id: f.organizationId,
  time_label: f.timeLabel,
  due_date: f.dueDate,
  account_id: f.accountId || null,
  description: f.description,
  priority: f.priority,
  owner_id: f.ownerId || null,
  status: f.status,
  channel: f.channel,
  created_at: f.createdAt,
});

const fromFollowUpRow = (r: DbRow): FollowUp => ({
  id: String(r.id),
  organizationId: String(r.organization_id),
  timeLabel: String(r.time_label),
  dueDate: String(r.due_date),
  accountId: String(r.account_id || ''),
  description: String(r.description),
  priority: (r.priority as FollowUp['priority']) || 'Medium',
  ownerId: String(r.owner_id || ''),
  status: (r.status as FollowUp['status']) || 'Pending',
  channel: (r.channel as FollowUp['channel']) || 'Call',
  createdAt: String(r.created_at || new Date().toISOString()),
});

const toMeetingRow = (m: Meeting): DbRow => ({
  id: m.id,
  organization_id: m.organizationId,
  title: m.title,
  account_id: m.accountId || null,
  deal_id: m.dealId || null,
  owner_id: m.ownerId || null,
  date: m.date,
  start_time: m.startTime,
  end_time: m.endTime,
  location: m.location,
  type: m.type,
  attendees: m.attendees || [],
  notes: m.notes,
  created_at: m.createdAt,
});

const fromMeetingRow = (r: DbRow): Meeting => ({
  id: String(r.id),
  organizationId: String(r.organization_id),
  title: String(r.title),
  accountId: r.account_id ? String(r.account_id) : undefined,
  dealId: r.deal_id ? String(r.deal_id) : undefined,
  ownerId: String(r.owner_id || ''),
  date: String(r.date),
  startTime: String(r.start_time),
  endTime: String(r.end_time),
  location: String(r.location || ''),
  type: (r.type as Meeting['type']) || 'Demo',
  attendees: Array.isArray(r.attendees) ? r.attendees.map(String) : [],
  notes: String(r.notes || ''),
  createdAt: String(r.created_at || new Date().toISOString()),
});

const toDocumentRow = (d: DocumentItem): DbRow => ({
  id: d.id,
  organization_id: d.organizationId,
  name: d.name,
  category: d.category,
  file_type: d.fileType,
  size_label: d.sizeLabel,
  account_id: d.accountId || null,
  deal_id: d.dealId || null,
  owner_id: d.ownerId || null,
  summary: d.summary,
  updated_at: d.updatedAt,
});

const fromDocumentRow = (r: DbRow): DocumentItem => ({
  id: String(r.id),
  organizationId: String(r.organization_id),
  name: String(r.name),
  category: (r.category as DocumentItem['category']) || 'Proposal',
  fileType: (r.file_type as DocumentItem['fileType']) || 'PDF',
  sizeLabel: String(r.size_label || '1.0 MB'),
  accountId: r.account_id ? String(r.account_id) : undefined,
  dealId: r.deal_id ? String(r.deal_id) : undefined,
  ownerId: String(r.owner_id || ''),
  updatedAt: String(r.updated_at || new Date().toISOString()),
  summary: String(r.summary || ''),
});

const toSalesTargetRow = (st: SalesTarget): DbRow => ({
  id: st.id,
  organization_id: st.organizationId,
  month_index: st.monthIndex,
  month_label: st.monthLabel,
  year: st.year,
  target_amount: st.targetAmount,
  baseline_actual_amount: st.baselineActualAmount,
});

const fromSalesTargetRow = (r: DbRow): SalesTarget => ({
  id: String(r.id),
  organizationId: String(r.organization_id),
  monthIndex: Number(r.month_index),
  monthLabel: String(r.month_label),
  year: Number(r.year),
  targetAmount: Number(r.target_amount ?? 0),
  baselineActualAmount: Number(r.baseline_actual_amount ?? 0),
});

const toNotificationRow = (n: NotificationItem): DbRow => ({
  id: n.id,
  organization_id: n.organizationId,
  title: n.title,
  message: n.message,
  type: n.type,
  read: n.read,
  created_at: n.createdAt,
});

const fromNotificationRow = (r: DbRow): NotificationItem => ({
  id: String(r.id),
  organizationId: String(r.organization_id),
  title: String(r.title),
  message: String(r.message),
  type: (r.type as NotificationItem['type']) || 'system',
  read: Boolean(r.read),
  createdAt: String(r.created_at || new Date().toISOString()),
});

export async function fetchDatasetFromSupabase(
  fallbackPreferences: CrmDataset['preferences']
): Promise<{ dataset: CrmDataset | null; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { dataset: null, error: 'Supabase is not configured.' };

  try {
    const [
      orgsRes,
      usersRes,
      accountsRes,
      contactsRes,
      leadsRes,
      stagesRes,
      dealsRes,
      productsRes,
      dealProductsRes,
      activitiesRes,
      followUpsRes,
      meetingsRes,
      docsRes,
      targetsRes,
      notifsRes,
    ] = await Promise.all([
      client.from('organizations').select('*').limit(1),
      client.from('users').select('*'),
      client.from('accounts').select('*'),
      client.from('contacts').select('*'),
      client.from('leads').select('*'),
      client.from('deal_stages').select('*').order('sort_order', { ascending: true }),
      client.from('deals').select('*'),
      client.from('products').select('*'),
      client.from('deal_products').select('*'),
      client.from('activities').select('*').order('occurred_at', { ascending: false }),
      client.from('follow_ups').select('*'),
      client.from('meetings').select('*'),
      client.from('documents').select('*'),
      client.from('sales_targets').select('*').order('month_index', { ascending: true }),
      client.from('notifications').select('*').order('created_at', { ascending: false }),
    ]);

    if (orgsRes.error) {
      return { dataset: null, error: orgsRes.error.message };
    }

    if (!orgsRes.data || orgsRes.data.length === 0) {
      return { dataset: null };
    }

    const fallback = createSeedData();
    const dataset: CrmDataset = {
      organization: fromOrgRow(orgsRes.data[0]),
      users: usersRes.data?.length ? usersRes.data.map(fromUserRow) : fallback.users,
      accounts: accountsRes.data ? accountsRes.data.map(fromAccountRow) : [],
      contacts: contactsRes.data ? contactsRes.data.map(fromContactRow) : [],
      leads: leadsRes.data ? leadsRes.data.map(fromLeadRow) : [],
      dealStages: stagesRes.data?.length ? stagesRes.data.map(fromDealStageRow) : fallback.dealStages,
      deals: dealsRes.data ? dealsRes.data.map(fromDealRow) : [],
      products: productsRes.data ? productsRes.data.map(fromProductRow) : [],
      dealProducts: dealProductsRes.data ? dealProductsRes.data.map(fromDealProductRow) : [],
      activities: activitiesRes.data ? activitiesRes.data.map(fromActivityRow) : [],
      followUps: followUpsRes.data ? followUpsRes.data.map(fromFollowUpRow) : [],
      meetings: meetingsRes.data ? meetingsRes.data.map(fromMeetingRow) : [],
      documents: docsRes.data ? docsRes.data.map(fromDocumentRow) : [],
      salesTargets: targetsRes.data?.length ? targetsRes.data.map(fromSalesTargetRow) : fallback.salesTargets,
      notifications: notifsRes.data ? notifsRes.data.map(fromNotificationRow) : [],
      preferences: fallbackPreferences,
    };

    return { dataset };
  } catch (err) {
    return {
      dataset: null,
      error: err instanceof Error ? err.message : 'Failed to fetch CRM records from Supabase.',
    };
  }
}

export async function pushDatasetToSupabase(
  dataset: CrmDataset
): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, error: 'Supabase environment variables are not configured.' };
  }

  try {
    const steps: Array<{ table: string; rows: DbRow[] }> = [
      { table: 'organizations', rows: [toOrgRow(dataset.organization)] },
      { table: 'deal_stages', rows: dataset.dealStages.map(toDealStageRow) },
      { table: 'users', rows: dataset.users.map(toUserRow) },
      { table: 'accounts', rows: dataset.accounts.map(toAccountRow) },
      { table: 'contacts', rows: dataset.contacts.map(toContactRow) },
      { table: 'leads', rows: dataset.leads.map(toLeadRow) },
      { table: 'products', rows: dataset.products.map(toProductRow) },
      { table: 'deals', rows: dataset.deals.map(toDealRow) },
      { table: 'deal_products', rows: dataset.dealProducts.map(toDealProductRow) },
      { table: 'sales_targets', rows: dataset.salesTargets.map(toSalesTargetRow) },
      { table: 'activities', rows: dataset.activities.map(toActivityRow) },
      { table: 'follow_ups', rows: dataset.followUps.map(toFollowUpRow) },
      { table: 'meetings', rows: dataset.meetings.map(toMeetingRow) },
      { table: 'documents', rows: dataset.documents.map(toDocumentRow) },
      { table: 'notifications', rows: dataset.notifications.map(toNotificationRow) },
    ];

    for (const step of steps) {
      if (step.rows.length === 0) continue;
      const { error } = await client.from(step.table).upsert(step.rows, { onConflict: 'id' });
      if (error) {
        return { ok: false, error: `Failed syncing ${step.table}: ${error.message}` };
      }
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unexpected Supabase sync failure.',
    };
  }
}

export async function syncSupabaseEntity(
  entity:
    | { type: 'organization'; data: Organization }
    | { type: 'user'; data: User }
    | { type: 'account'; data: Account }
    | { type: 'contact'; data: Contact }
    | { type: 'lead'; data: Lead }
    | { type: 'deal'; data: Deal }
    | { type: 'product'; data: Product }
    | { type: 'activity'; data: Activity }
    | { type: 'follow_up'; data: FollowUp }
    | { type: 'meeting'; data: Meeting }
    | { type: 'document'; data: DocumentItem }
    | { type: 'notification'; data: NotificationItem }
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const tableAndRow: Record<string, { table: string; row: DbRow }> = {
    organization: { table: 'organizations', row: toOrgRow(entity.data as Organization) },
    user: { table: 'users', row: toUserRow(entity.data as User) },
    account: { table: 'accounts', row: toAccountRow(entity.data as Account) },
    contact: { table: 'contacts', row: toContactRow(entity.data as Contact) },
    lead: { table: 'leads', row: toLeadRow(entity.data as Lead) },
    deal: { table: 'deals', row: toDealRow(entity.data as Deal) },
    product: { table: 'products', row: toProductRow(entity.data as Product) },
    activity: { table: 'activities', row: toActivityRow(entity.data as Activity) },
    follow_up: { table: 'follow_ups', row: toFollowUpRow(entity.data as FollowUp) },
    meeting: { table: 'meetings', row: toMeetingRow(entity.data as Meeting) },
    document: { table: 'documents', row: toDocumentRow(entity.data as DocumentItem) },
    notification: { table: 'notifications', row: toNotificationRow(entity.data as NotificationItem) },
  };

  const target = tableAndRow[entity.type];
  if (!target) return;
  try {
    await client.from(target.table).upsert(target.row, { onConflict: 'id' });
  } catch {
    // Keep optimistic local state when remote sync fails
  }
}

export async function deleteSupabaseRecord(
  table:
    | 'accounts'
    | 'contacts'
    | 'leads'
    | 'deals'
    | 'products'
    | 'activities'
    | 'follow_ups'
    | 'meetings'
    | 'documents',
  id: string
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from(table).delete().eq('id', id);
  } catch {
    // Ignore background delete failure when offline
  }
}
