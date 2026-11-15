export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Unqualified';
export type DealStageSlug = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won';
export type DealStatus = 'Active' | 'At Risk' | 'On Track' | 'Won';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type ActivityType =
  | 'Email Opened'
  | 'Document Viewed'
  | 'Brochure Downloaded'
  | 'Reply Received'
  | 'Meeting Scheduled'
  | 'Call Logged'
  | 'Note Added';

export type DateRangePreset =
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'all';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  currency: CurrencyCode;
  annualTarget: number;
  createdAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  initials: string;
  phone: string;
  monthlyQuota: number;
  annualQuota: number;
  conversionRate: number;
  isCurrentUser?: boolean;
  createdAt: string;
}

export interface Account {
  id: string;
  organizationId: string;
  name: string;
  industry: string;
  website: string;
  employees: number;
  annualRevenue: number;
  city: string;
  country: string;
  ownerId: string;
  status: 'Active' | 'Prospect' | 'Partner';
  logoColor: string;
  logoInitials: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  organizationId: string;
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  ownerId: string;
  lastContactedAt: string;
  notes: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  source: 'Website' | 'LinkedIn' | 'Referral' | 'Outbound' | 'Conference' | 'Partner';
  status: LeadStatus;
  score: number;
  estimatedValue: number;
  ownerId: string;
  notes: string;
  createdAt: string;
}

export interface DealStage {
  id: DealStageSlug;
  name: string;
  order: number;
  probability: number;
  color: string;
}

export interface Deal {
  id: string;
  organizationId: string;
  title: string;
  accountId: string;
  contactId?: string;
  stage: DealStageSlug;
  amount: number;
  status: DealStatus;
  ownerId: string;
  expectedCloseDate: string;
  closedAt?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  organizationId: string;
  sku: string;
  name: string;
  category: 'Platform' | 'Analytics' | 'Security' | 'Services' | 'Add-on';
  unitPrice: number;
  billingCycle: 'Annual' | 'Monthly' | 'One-Time';
  active: boolean;
  description: string;
  createdAt: string;
}

export interface DealProduct {
  id: string;
  dealId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Activity {
  id: string;
  organizationId: string;
  type: ActivityType;
  title: string;
  description: string;
  accountId?: string;
  contactId?: string;
  dealId?: string;
  ownerId: string;
  occurredAt: string;
  relativeTimeLabel?: string;
}

export interface FollowUp {
  id: string;
  organizationId: string;
  timeLabel: string;
  dueDate: string;
  accountId: string;
  description: string;
  priority: PriorityLevel;
  ownerId: string;
  status: 'Pending' | 'Completed' | 'Rescheduled';
  channel: 'Call' | 'Meeting' | 'Email';
  createdAt: string;
}

export interface Meeting {
  id: string;
  organizationId: string;
  title: string;
  accountId?: string;
  dealId?: string;
  ownerId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  type: 'Demo' | 'Discovery' | 'Negotiation' | 'Onboarding' | 'Internal';
  attendees: string[];
  notes: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  organizationId: string;
  name: string;
  category: 'Proposal' | 'Contract' | 'Brochure' | 'Case Study' | 'Playbook';
  fileType: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX';
  sizeLabel: string;
  accountId?: string;
  dealId?: string;
  ownerId: string;
  updatedAt: string;
  summary: string;
}

export interface SalesTarget {
  id: string;
  organizationId: string;
  monthIndex: number; // 0-11
  monthLabel: string; // Jan-Dec
  year: number;
  targetAmount: number;
  baselineActualAmount: number;
}

export interface NotificationItem {
  id: string;
  organizationId: string;
  title: string;
  message: string;
  type: 'deal' | 'lead' | 'reminder' | 'system';
  read: boolean;
  createdAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  currency: CurrencyCode;
  dateRange: DateRangePreset;
  emailNotifications: boolean;
  dealAlerts: boolean;
  reminderAlerts: boolean;
  weeklyDigest: boolean;
  compactTables: boolean;
}

export interface CrmDataset {
  organization: Organization;
  users: User[];
  accounts: Account[];
  contacts: Contact[];
  leads: Lead[];
  dealStages: DealStage[];
  deals: Deal[];
  products: Product[];
  dealProducts: DealProduct[];
  activities: Activity[];
  followUps: FollowUp[];
  meetings: Meeting[];
  documents: DocumentItem[];
  salesTargets: SalesTarget[];
  notifications: NotificationItem[];
  preferences: UserPreferences;
}

export type QuickCreateMode = 'lead' | 'deal' | 'contact' | 'account' | 'activity' | 'meeting' | 'note' | 'followup';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'info' | 'warning' | 'error';
}
