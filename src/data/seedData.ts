import {
  Account,
  Activity,
  ActivityType,
  Contact,
  CrmDataset,
  Deal,
  DealProduct,
  DealStage,
  DealStageSlug,
  DocumentItem,
  FollowUp,
  Lead,
  LeadStatus,
  Meeting,
  NotificationItem,
  Product,
  SalesTarget,
  User,
} from '../types/crm';

const ORG_ID = 'org-nexora-001';

export const DEAL_STAGES: DealStage[] = [
  { id: 'prospecting', name: 'Prospecting', order: 1, probability: 20, color: '#0AA6AD' },
  { id: 'qualification', name: 'Qualification', order: 2, probability: 40, color: '#1C7ED6' },
  { id: 'proposal', name: 'Proposal', order: 3, probability: 60, color: '#09254A' },
  { id: 'negotiation', name: 'Negotiation', order: 4, probability: 80, color: '#FF6155' },
  { id: 'closed_won', name: 'Closed Won', order: 5, probability: 100, color: '#0CA678' },
];

export const SEED_USERS: User[] = [
  {
    id: 'user-alex',
    organizationId: ORG_ID,
    name: 'Alex Morgan',
    email: 'alex.morgan@nexoracrm.io',
    role: 'Sales Manager',
    avatarColor: '#0AA6AD',
    initials: 'AM',
    phone: '+1 (415) 890-2140',
    monthlyQuota: 150000,
    annualQuota: 180000,
    conversionRate: 22.4,
    isCurrentUser: true,
    createdAt: '2024-01-10T09:00:00Z',
  },
  {
    id: 'user-jamie',
    organizationId: ORG_ID,
    name: 'Jamie Carter',
    email: 'jamie.carter@nexoracrm.io',
    role: 'Senior Account Executive',
    avatarColor: '#1C7ED6',
    initials: 'JC',
    phone: '+1 (415) 890-2141',
    monthlyQuota: 135000,
    annualQuota: 162000,
    conversionRate: 19.8,
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'user-taylor',
    organizationId: ORG_ID,
    name: 'Taylor Brooks',
    email: 'taylor.brooks@nexoracrm.io',
    role: 'Account Executive',
    avatarColor: '#09254A',
    initials: 'TB',
    phone: '+1 (415) 890-2142',
    monthlyQuota: 125000,
    annualQuota: 150000,
    conversionRate: 18.1,
    createdAt: '2024-02-01T09:00:00Z',
  },
  {
    id: 'user-jordan',
    organizationId: ORG_ID,
    name: 'Jordan Lee',
    email: 'jordan.lee@nexoracrm.io',
    role: 'Account Executive',
    avatarColor: '#FF6155',
    initials: 'JL',
    phone: '+1 (415) 890-2143',
    monthlyQuota: 130000,
    annualQuota: 156000,
    conversionRate: 17.5,
    createdAt: '2024-02-10T09:00:00Z',
  },
  {
    id: 'user-morgan',
    organizationId: ORG_ID,
    name: 'Morgan Riley',
    email: 'morgan.riley@nexoracrm.io',
    role: 'SDR Team Lead',
    avatarColor: '#0CA678',
    initials: 'MR',
    phone: '+1 (415) 890-2144',
    monthlyQuota: 130000,
    annualQuota: 156000,
    conversionRate: 15.9,
    createdAt: '2024-03-01T09:00:00Z',
  },
];

const COMPANY_TEMPLATES: Array<{
  name: string;
  industry: string;
  city: string;
  employees: number;
  revenue: number;
  color: string;
  initials: string;
}> = [
  { name: 'BrightWave Ltd.', industry: 'Cloud Infrastructure', city: 'San Francisco', employees: 420, revenue: 48000000, color: '#09254A', initials: 'BW' },
  { name: 'Summit Agency', industry: 'Digital Marketing', city: 'New York', employees: 185, revenue: 19500000, color: '#0CA678', initials: 'SA' },
  { name: 'HexaTech Co.', industry: 'Enterprise SaaS', city: 'Austin', employees: 310, revenue: 34000000, color: '#1E293B', initials: 'HT' },
  { name: 'TerraFirma Inc.', industry: 'Supply Chain Tech', city: 'Chicago', employees: 640, revenue: 72000000, color: '#0AA6AD', initials: 'TF' },
  { name: 'BluePeak Corp.', industry: 'FinTech', city: 'Boston', employees: 510, revenue: 61000000, color: '#0B7285', initials: 'BP' },
  { name: 'Nova Systems', industry: 'Cybersecurity', city: 'Seattle', employees: 290, revenue: 39000000, color: '#1C7ED6', initials: 'NS' },
  { name: 'Vertex Solutions', industry: 'Data Analytics', city: 'Denver', employees: 360, revenue: 43000000, color: '#09254A', initials: 'VS' },
  { name: 'CloudScale', industry: 'DevOps Platform', city: 'San Jose', employees: 220, revenue: 28000000, color: '#2B8A3E', initials: 'CS' },
  { name: 'Insight Labs', industry: 'Business Intelligence', city: 'Seattle', employees: 145, revenue: 16500000, color: '#364FC7', initials: 'IL' },
  { name: 'Elite Ventures', industry: 'Venture Capital', city: 'Palo Alto', employees: 95, revenue: 88000000, color: '#18181B', initials: 'EV' },
  { name: 'Pioneer Corp.', industry: 'Industrial IoT', city: 'Detroit', employees: 890, revenue: 110000000, color: '#FF6155', initials: 'PC' },
  { name: 'Alpha Networks', industry: 'Telecom Software', city: 'Dallas', employees: 470, revenue: 54000000, color: '#E03131', initials: 'AN' },
  { name: 'GlobalLink Ltd.', industry: 'Logistics SaaS', city: 'London', employees: 720, revenue: 84000000, color: '#087F5B', initials: 'GL' },
  { name: 'InnovateX', industry: 'AI Automation', city: 'San Francisco', employees: 260, revenue: 31000000, color: '#09254A', initials: 'IX' },
  { name: 'NextGen Digital', industry: 'E-Commerce Tech', city: 'Los Angeles', employees: 410, revenue: 46000000, color: '#1971C2', initials: 'NG' },
  { name: 'Apex Logistics', industry: 'Freight & Fleet', city: 'Atlanta', employees: 540, revenue: 62000000, color: '#0C8599', initials: 'AL' },
  { name: 'Horizon Health', industry: 'HealthTech', city: 'Minneapolis', employees: 780, revenue: 95000000, color: '#2F9E44', initials: 'HH' },
  { name: 'Quantum Retail', industry: 'Omnichannel Retail', city: 'Miami', employees: 330, revenue: 38000000, color: '#5F3DC4', initials: 'QR' },
  { name: 'Stratos Energy', industry: 'CleanTech', city: 'Houston', employees: 610, revenue: 79000000, color: '#D9480F', initials: 'SE' },
  { name: 'Vanguard Media', industry: 'Media & Publishing', city: 'New York', employees: 275, revenue: 29000000, color: '#343A40', initials: 'VM' },
  { name: 'Pulse Robotics', industry: 'Robotics & Automation', city: 'Pittsburgh', employees: 195, revenue: 24000000, color: '#0AA6AD', initials: 'PR' },
  { name: 'Kinetix Bio', industry: 'Biotech', city: 'Cambridge', employees: 350, revenue: 52000000, color: '#1864AB', initials: 'KB' },
  { name: 'SilverLine Financial', industry: 'Wealth Management', city: 'Charlotte', employees: 490, revenue: 67000000, color: '#495057', initials: 'SF' },
  { name: 'Meridian Travel', industry: 'Hospitality SaaS', city: 'Orlando', employees: 230, revenue: 22000000, color: '#E67700', initials: 'MT' },
  { name: 'Cobalt Security', industry: 'Zero-Trust Security', city: 'Reston', employees: 320, revenue: 41000000, color: '#09254A', initials: 'CB' },
  { name: 'Atlas Manufacturing', industry: 'Smart Manufacturing', city: 'Cleveland', employees: 950, revenue: 125000000, color: '#364FC7', initials: 'AM' },
  { name: 'Orion Telecom', industry: '5G Infrastructure', city: 'Phoenix', employees: 670, revenue: 83000000, color: '#0B7285', initials: 'OT' },
  { name: 'Beacon EdTech', industry: 'Education Technology', city: 'Portland', employees: 165, revenue: 18000000, color: '#2B8A3E', initials: 'BE' },
  { name: 'Crestview Foods', industry: 'CPG Distribution', city: 'Nashville', employees: 430, revenue: 51000000, color: '#C92A2A', initials: 'CF' },
  { name: 'Helios Aerospace', industry: 'Aerospace Systems', city: 'Huntsville', employees: 810, revenue: 138000000, color: '#1E293B', initials: 'HA' },
];

const FIRST_NAMES = [
  'Liam', 'Emma', 'Noah', 'Olivia', 'Ethan', 'Sophia', 'Lucas', 'Ava', 'Mason', 'Isabella',
  'Logan', 'Mia', 'Elijah', 'Charlotte', 'Oliver', 'Amelia', 'Aiden', 'Harper', 'James', 'Evelyn',
  'Benjamin', 'Abigail', 'Henry', 'Emily', 'Sebastian', 'Elizabeth', 'Jack', 'Sofia', 'Owen', 'Avery',
  'Daniel', 'Ella', 'Matthew', 'Scarlett', 'Samuel', 'Grace', 'David', 'Chloe', 'Joseph', 'Victoria',
];

const LAST_NAMES = [
  'Anderson', 'Bennett', 'Chambers', 'Davidson', 'Edwards', 'Foster', 'Garcia', 'Hayes', 'Ingram', 'Jenkins',
  'Keller', 'Lawson', 'Mitchell', 'Nelson', 'Owens', 'Patel', 'Quinn', 'Reynolds', 'Sullivan', 'Turner',
  'Upton', 'Vance', 'Walker', 'Xavier', 'Young', 'Zimmerman', 'Brooks', 'Collins', 'Delgado', 'Fischer',
];

const TITLES = [
  'VP of Sales', 'Chief Revenue Officer', 'Head of Operations', 'Director of IT', 'Procurement Lead',
  'VP of Engineering', 'Chief Technology Officer', 'Growth Marketing Director', 'VP of Finance', 'Operations Manager',
];

const LEAD_SOURCES: Lead['source'][] = ['Website', 'LinkedIn', 'Referral', 'Outbound', 'Conference', 'Partner'];

export function createSeedData(): CrmDataset {
  const accounts: Account[] = COMPANY_TEMPLATES.map((tpl, idx) => ({
    id: `acc-${idx + 1}`,
    organizationId: ORG_ID,
    name: tpl.name,
    industry: tpl.industry,
    website: `https://www.${tpl.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    employees: tpl.employees,
    annualRevenue: tpl.revenue,
    city: tpl.city,
    country: tpl.city === 'London' ? 'United Kingdom' : 'United States',
    ownerId: SEED_USERS[idx % SEED_USERS.length].id,
    status: idx < 18 ? 'Active' : idx < 26 ? 'Prospect' : 'Partner',
    logoColor: tpl.color,
    logoInitials: tpl.initials,
    createdAt: new Date(2025, 0, 5 + idx).toISOString(),
  }));

  // 80 contacts across 30 accounts
  const contacts: Contact[] = Array.from({ length: 80 }, (_, idx) => {
    const firstName = FIRST_NAMES[idx % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(idx * 3 + 5) % LAST_NAMES.length];
    const acc = accounts[idx % accounts.length];
    const domain = acc.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
    return {
      id: `cnt-${idx + 1}`,
      organizationId: ORG_ID,
      accountId: acc.id,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      phone: `+1 (${210 + (idx % 700)}) ${310 + (idx % 600)}-${1000 + ((idx * 137) % 8999)}`,
      title: TITLES[idx % TITLES.length],
      ownerId: SEED_USERS[idx % SEED_USERS.length].id,
      lastContactedAt: new Date(2025, 4, 1 + (idx % 17), 10 + (idx % 7)).toISOString(),
      notes: `Primary stakeholder for ${acc.name} ${acc.industry} initiatives.`,
      createdAt: new Date(2025, 1, 1 + (idx % 28)).toISOString(),
    };
  });

  // 100 leads: 42 New, 26 Contacted, 20 Qualified, 12 Unqualified
  const leadStatuses: LeadStatus[] = [
    ...Array<LeadStatus>(42).fill('New'),
    ...Array<LeadStatus>(26).fill('Contacted'),
    ...Array<LeadStatus>(20).fill('Qualified'),
    ...Array<LeadStatus>(12).fill('Unqualified'),
  ];

  const leads: Lead[] = leadStatuses.map((status, idx) => {
    const firstName = FIRST_NAMES[(idx + 7) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(idx * 7 + 2) % LAST_NAMES.length];
    const acc = accounts[(idx * 3) % accounts.length];
    const domain = acc.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.io';
    const scoreBase = status === 'Qualified' ? 82 : status === 'Contacted' ? 66 : status === 'New' ? 54 : 28;
    return {
      id: `lead-${idx + 1}`,
      organizationId: ORG_ID,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      phone: `+1 (${305 + (idx % 500)}) ${410 + (idx % 500)}-${2000 + ((idx * 193) % 7999)}`,
      company: idx < 30 ? acc.name : `${acc.name.split(' ')[0]} ${['Labs', 'Group', 'Global', 'Partners'][idx % 4]}`,
      title: TITLES[(idx + 2) % TITLES.length],
      source: LEAD_SOURCES[idx % LEAD_SOURCES.length],
      status,
      score: Math.min(99, scoreBase + (idx % 15)),
      estimatedValue: 12000 + ((idx * 3500) % 48000),
      ownerId: SEED_USERS[idx % SEED_USERS.length].id,
      notes: `Inbound interest via ${LEAD_SOURCES[idx % LEAD_SOURCES.length]} campaign.`,
      createdAt: new Date(2025, 3 + (idx % 2), 1 + (idx % 27)).toISOString(),
    };
  });

  // 50 Deals distributed cleanly across the 5 stages with exact stage dollar totals:
  // Prospecting: 10 deals = $215,000
  // Qualification: 12 deals = $310,000
  // Proposal: 10 deals = $240,000
  // Negotiation: 8 deals = $185,000
  // Closed Won: 10 deals = $512,000 (8 in May = $482,900 MTD, 2 in April = $29,100)
  const stageDealConfigs: Array<{
    stage: DealStageSlug;
    items: Array<{ accountIdx: number; title: string; amount: number; ownerIdx: number; closeDate: string; closedAt?: string }>;
  }> = [
    {
      stage: 'prospecting',
      items: [
        { accountIdx: 0, title: 'Enterprise Cloud Suite', amount: 25000, ownerIdx: 0, closeDate: '2025-06-18' },
        { accountIdx: 1, title: 'Agency Analytics License', amount: 15000, ownerIdx: 1, closeDate: '2025-06-22' },
        { accountIdx: 2, title: 'Core Platform Expansion', amount: 18000, ownerIdx: 2, closeDate: '2025-06-28' },
        { accountIdx: 15, title: 'Fleet Telemetry Seat Pack', amount: 24000, ownerIdx: 3, closeDate: '2025-07-04' },
        { accountIdx: 16, title: 'Patient Portal Integration', amount: 28000, ownerIdx: 0, closeDate: '2025-07-09' },
        { accountIdx: 17, title: 'Omnichannel Data Sync', amount: 19000, ownerIdx: 4, closeDate: '2025-07-12' },
        { accountIdx: 18, title: 'Grid Analytics Add-on', amount: 22000, ownerIdx: 1, closeDate: '2025-07-15' },
        { accountIdx: 19, title: 'AdOps Automation Suite', amount: 17000, ownerIdx: 2, closeDate: '2025-07-19' },
        { accountIdx: 20, title: 'Robotics Ops Dashboard', amount: 26000, ownerIdx: 3, closeDate: '2025-07-24' },
        { accountIdx: 21, title: 'Lab Compliance Module', amount: 21000, ownerIdx: 4, closeDate: '2025-07-29' },
      ],
    },
    {
      stage: 'qualification',
      items: [
        { accountIdx: 3, title: 'Global Supply Hub', amount: 30000, ownerIdx: 0, closeDate: '2025-06-10' },
        { accountIdx: 4, title: 'Risk Engine Rollout', amount: 22000, ownerIdx: 1, closeDate: '2025-06-14' },
        { accountIdx: 5, title: 'SOC Monitoring Tier', amount: 28000, ownerIdx: 2, closeDate: '2025-06-16' },
        { accountIdx: 22, title: 'Advisor Workspace CRM', amount: 32000, ownerIdx: 0, closeDate: '2025-06-20' },
        { accountIdx: 23, title: 'Booking Intelligence API', amount: 19000, ownerIdx: 3, closeDate: '2025-06-24' },
        { accountIdx: 24, title: 'Identity Governance Pack', amount: 27000, ownerIdx: 1, closeDate: '2025-06-26' },
        { accountIdx: 25, title: 'Plant MES Connector', amount: 34000, ownerIdx: 2, closeDate: '2025-07-02' },
        { accountIdx: 26, title: 'Carrier Billing Bridge', amount: 25000, ownerIdx: 4, closeDate: '2025-07-06' },
        { accountIdx: 27, title: 'Campus Analytics Suite', amount: 18000, ownerIdx: 3, closeDate: '2025-07-08' },
        { accountIdx: 28, title: 'Cold-Chain Tracker', amount: 24000, ownerIdx: 0, closeDate: '2025-07-11' },
        { accountIdx: 29, title: 'Flight Telemetry Archive', amount: 31000, ownerIdx: 1, closeDate: '2025-07-14' },
        { accountIdx: 0, title: 'Edge Node Licensing', amount: 20000, ownerIdx: 4, closeDate: '2025-07-18' },
      ],
    },
    {
      stage: 'proposal',
      items: [
        { accountIdx: 6, title: 'BI Warehouse Upgrade', amount: 35000, ownerIdx: 0, closeDate: '2025-05-29' },
        { accountIdx: 7, title: 'CI/CD Enterprise Seats', amount: 20000, ownerIdx: 1, closeDate: '2025-06-02' },
        { accountIdx: 8, title: 'Executive Insights Pack', amount: 22000, ownerIdx: 2, closeDate: '2025-06-05' },
        { accountIdx: 1, title: 'Multi-Brand Attribution', amount: 24000, ownerIdx: 3, closeDate: '2025-06-08' },
        { accountIdx: 4, title: 'Treasury Compliance Suite', amount: 26000, ownerIdx: 0, closeDate: '2025-06-11' },
        { accountIdx: 9, title: 'Portfolio Reporting Hub', amount: 28000, ownerIdx: 1, closeDate: '2025-06-15' },
        { accountIdx: 12, title: 'Customs Automation API', amount: 25000, ownerIdx: 2, closeDate: '2025-06-18' },
        { accountIdx: 14, title: 'Checkout Optimization Pro', amount: 21000, ownerIdx: 4, closeDate: '2025-06-21' },
        { accountIdx: 16, title: 'Clinical Ops Console', amount: 23000, ownerIdx: 3, closeDate: '2025-06-25' },
        { accountIdx: 22, title: 'Client Onboarding Flow', amount: 16000, ownerIdx: 4, closeDate: '2025-06-29' },
      ],
    },
    {
      stage: 'negotiation',
      items: [
        { accountIdx: 9, title: 'Deal Flow Platform', amount: 60000, ownerIdx: 0, closeDate: '2025-05-22' },
        { accountIdx: 10, title: 'IoT Gateway Fleet', amount: 45000, ownerIdx: 1, closeDate: '2025-05-24' },
        { accountIdx: 11, title: 'Core Routing Analytics', amount: 40000, ownerIdx: 2, closeDate: '2025-05-27' },
        { accountIdx: 3, title: 'Warehouse SLA Module', amount: 10000, ownerIdx: 3, closeDate: '2025-05-29' },
        { accountIdx: 5, title: 'Threat Intel Feed', amount: 8000, ownerIdx: 4, closeDate: '2025-05-30' },
        { accountIdx: 7, title: 'K8s Cost Governance', amount: 9000, ownerIdx: 1, closeDate: '2025-06-01' },
        { accountIdx: 13, title: 'LLM Evaluation Sandbox', amount: 7000, ownerIdx: 0, closeDate: '2025-06-03' },
        { accountIdx: 18, title: 'Substation Alerting', amount: 6000, ownerIdx: 2, closeDate: '2025-06-06' },
      ],
    },
    {
      stage: 'closed_won',
      items: [
        { accountIdx: 12, title: 'Global Freight OS', amount: 55000, ownerIdx: 0, closeDate: '2025-05-14', closedAt: '2025-05-14T15:30:00Z' },
        { accountIdx: 13, title: 'AI Workflow Automation', amount: 45000, ownerIdx: 0, closeDate: '2025-05-12', closedAt: '2025-05-12T11:20:00Z' },
        { accountIdx: 14, title: 'Enterprise Commerce Cloud', amount: 68000, ownerIdx: 1, closeDate: '2025-05-11', closedAt: '2025-05-11T17:05:00Z' },
        { accountIdx: 29, title: 'Avionics Telemetry Core', amount: 72000, ownerIdx: 1, closeDate: '2025-05-09', closedAt: '2025-05-09T14:40:00Z' },
        { accountIdx: 25, title: 'Factory Vision Suite', amount: 64000, ownerIdx: 2, closeDate: '2025-05-07', closedAt: '2025-05-07T16:15:00Z' },
        { accountIdx: 26, title: 'Network Assurance Pro', amount: 58900, ownerIdx: 3, closeDate: '2025-05-05', closedAt: '2025-05-05T10:10:00Z' },
        { accountIdx: 10, title: 'Predictive Maintenance', amount: 62000, ownerIdx: 2, closeDate: '2025-05-03', closedAt: '2025-05-03T13:50:00Z' },
        { accountIdx: 0, title: 'Multi-Region Failover', amount: 58000, ownerIdx: 4, closeDate: '2025-05-02', closedAt: '2025-05-02T09:45:00Z' },
        { accountIdx: 6, title: 'Data Governance Tier', amount: 14800, ownerIdx: 3, closeDate: '2025-04-26', closedAt: '2025-04-26T15:00:00Z' },
        { accountIdx: 11, title: 'Edge Telemetry Seats', amount: 14300, ownerIdx: 4, closeDate: '2025-04-21', closedAt: '2025-04-21T12:30:00Z' },
      ],
    },
  ];

  const deals: Deal[] = [];
  let dealCounter = 1;
  stageDealConfigs.forEach((group) => {
    group.items.forEach((item, idx) => {
      const acc = accounts[item.accountIdx];
      const accContact = contacts.find((c) => c.accountId === acc.id);
      deals.push({
        id: `deal-${dealCounter}`,
        organizationId: ORG_ID,
        title: item.title,
        accountId: acc.id,
        contactId: accContact?.id,
        stage: group.stage,
        amount: item.amount,
        status: group.stage === 'closed_won' ? 'Won' : idx % 5 === 3 ? 'At Risk' : idx % 2 === 0 ? 'On Track' : 'Active',
        ownerId: SEED_USERS[item.ownerIdx].id,
        expectedCloseDate: item.closeDate,
        closedAt: item.closedAt,
        notes: `${group.stage === 'closed_won' ? 'Signed MSA and annual order form.' : 'Active commercial evaluation with executive sponsor.'}`,
        createdAt: new Date(2025, 2, 1 + (dealCounter % 25)).toISOString(),
        updatedAt: item.closedAt || new Date(2025, 4, 1 + (dealCounter % 17)).toISOString(),
      });
      dealCounter += 1;
    });
  });

  const rawProducts: Array<Omit<Product, 'createdAt'>> = [
    { id: 'prod-1', organizationId: ORG_ID, sku: 'NX-CORE-ENT', name: 'Nexora Enterprise Core', category: 'Platform', unitPrice: 24000, billingCycle: 'Annual', active: true, description: 'Full-stack revenue platform with unlimited pipelines and SSO.' },
    { id: 'prod-2', organizationId: ORG_ID, sku: 'NX-ANL-PRO', name: 'Revenue Intelligence Pack', category: 'Analytics', unitPrice: 12000, billingCycle: 'Annual', active: true, description: 'Predictive pipeline scoring, cohort trends, and executive dashboards.' },
    { id: 'prod-3', organizationId: ORG_ID, sku: 'NX-SEC-ZTA', name: 'Zero-Trust Audit Guard', category: 'Security', unitPrice: 9500, billingCycle: 'Annual', active: true, description: 'SOC2 field encryption, granular RBAC, and immutable audit trails.' },
    { id: 'prod-4', organizationId: ORG_ID, sku: 'NX-AUT-FLW', name: 'Workflow Automation Studio', category: 'Platform', unitPrice: 8000, billingCycle: 'Annual', active: true, description: 'Visual trigger-action builder for lead routing and SLA escalation.' },
    { id: 'prod-5', organizationId: ORG_ID, sku: 'NX-API-CON', name: 'Bi-Directional Data Sync API', category: 'Add-on', unitPrice: 6000, billingCycle: 'Annual', active: true, description: 'Real-time warehouse connectors for Snowflake, BigQuery, and Postgres.' },
    { id: 'prod-6', organizationId: ORG_ID, sku: 'NX-SVC-IMP', name: 'Dedicated Onboarding & Migration', category: 'Services', unitPrice: 7500, billingCycle: 'One-Time', active: true, description: '30-day white-glove CRM migration, field mapping, and team training.' },
    { id: 'prod-7', organizationId: ORG_ID, sku: 'NX-FOR-AI', name: 'Weighted Forecast Modeler', category: 'Analytics', unitPrice: 10500, billingCycle: 'Annual', active: true, description: 'Multi-scenario commit forecasting with variance tracking.' },
    { id: 'prod-8', organizationId: ORG_ID, sku: 'NX-COM-SLA', name: 'Enterprise 99.99% SLA Tier', category: 'Security', unitPrice: 5400, billingCycle: 'Annual', active: true, description: '24/7 priority engineering response and dedicated TAM.' },
    { id: 'prod-9', organizationId: ORG_ID, sku: 'NX-MOB-REP', name: 'Field Rep Mobile Offline Pack', category: 'Add-on', unitPrice: 3600, billingCycle: 'Annual', active: true, description: 'Offline deal updates, business card capture, and voice notes.' },
    { id: 'prod-10', organizationId: ORG_ID, sku: 'NX-TER-MGT', name: 'Territory & Quota Planner', category: 'Platform', unitPrice: 8400, billingCycle: 'Annual', active: true, description: 'Balanced territory modeling and automated rep quota attribution.' },
    { id: 'prod-11', organizationId: ORG_ID, sku: 'NX-CON-QBR', name: 'Quarterly Strategic Advisory', category: 'Services', unitPrice: 4800, billingCycle: 'Monthly', active: true, description: 'RevOps architecture review and pipeline conversion tuning.' },
    { id: 'prod-12', organizationId: ORG_ID, sku: 'NX-LEG-ARC', name: 'Legacy Archive Bridge', category: 'Add-on', unitPrice: 2900, billingCycle: 'Annual', active: false, description: 'Read-only archival connector for retired on-prem databases.' },
  ];
  const products: Product[] = rawProducts.map((p) => ({ ...p, createdAt: '2025-01-12T10:00:00Z' }));

  const dealProducts: DealProduct[] = deals.slice(0, 24).map((d, idx) => {
    const prod = products[idx % products.length];
    return {
      id: `dp-${idx + 1}`,
      dealId: d.id,
      productId: prod.id,
      quantity: 1 + (idx % 3),
      unitPrice: prod.unitPrice,
    };
  });

  // 50 Activities — top 5 match the Customer Activity Timeline in the screenshot
  const featuredActivities: Activity[] = [
    {
      id: 'act-1',
      organizationId: ORG_ID,
      type: 'Email Opened',
      title: 'Email Opened',
      description: 'VP of Engineering opened the Q2 Enterprise Cloud Suite pricing proposal 3 times.',
      accountId: accounts[0].id,
      dealId: deals[0].id,
      ownerId: SEED_USERS[0].id,
      occurredAt: new Date(Date.now() - 2 * 60000).toISOString(),
      relativeTimeLabel: '2 min ago',
    },
    {
      id: 'act-2',
      organizationId: ORG_ID,
      type: 'Document Viewed',
      title: 'Document Viewed',
      description: 'Procurement team reviewed MSA Redlines & Security Appendix (4 min 18 sec dwell).',
      accountId: accounts[3].id,
      dealId: deals[10].id,
      ownerId: SEED_USERS[0].id,
      occurredAt: new Date(Date.now() - 15 * 60000).toISOString(),
      relativeTimeLabel: '15 min ago',
    },
    {
      id: 'act-3',
      organizationId: ORG_ID,
      type: 'Brochure Downloaded',
      title: 'Brochure Downloaded',
      description: 'Downloaded 2025 Nexora Analytics & Attribution Architecture Whitepaper.',
      accountId: accounts[1].id,
      dealId: deals[1].id,
      ownerId: SEED_USERS[1].id,
      occurredAt: new Date(Date.now() - 60 * 60000).toISOString(),
      relativeTimeLabel: '1 hr ago',
    },
    {
      id: 'act-4',
      organizationId: ORG_ID,
      type: 'Reply Received',
      title: 'Reply Received',
      description: 'Confirmed executive sponsor availability for Thursday contract sign-off call.',
      accountId: accounts[6].id,
      dealId: deals[22].id,
      ownerId: SEED_USERS[0].id,
      occurredAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      relativeTimeLabel: '2 hrs ago',
    },
    {
      id: 'act-5',
      organizationId: ORG_ID,
      type: 'Meeting Scheduled',
      title: 'Meeting Scheduled',
      description: 'Technical architecture & CI/CD seats walkthrough booked with DevOps leadership.',
      accountId: accounts[7].id,
      dealId: deals[23].id,
      ownerId: SEED_USERS[1].id,
      occurredAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      relativeTimeLabel: '3 hrs ago',
    },
  ];

  const activityTypes: ActivityType[] = [
    'Email Opened',
    'Document Viewed',
    'Brochure Downloaded',
    'Reply Received',
    'Meeting Scheduled',
    'Call Logged',
    'Note Added',
  ];

  const remainingActivities: Activity[] = Array.from({ length: 45 }, (_, idx) => {
    const type = activityTypes[idx % activityTypes.length];
    const acc = accounts[(idx + 4) % accounts.length];
    const deal = deals[(idx + 5) % deals.length];
    const hoursAgo = 5 + idx * 3;
    return {
      id: `act-${idx + 6}`,
      organizationId: ORG_ID,
      type,
      title: type,
      description: `${type} recorded for ${acc.name} regarding ${deal.title}.`,
      accountId: acc.id,
      dealId: deal.id,
      ownerId: SEED_USERS[idx % SEED_USERS.length].id,
      occurredAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    };
  });

  // 20 Follow-up Reminders — top 4 match screenshot exactly
  const featuredFollowUps: FollowUp[] = [
    {
      id: 'fu-1',
      organizationId: ORG_ID,
      timeLabel: '10:00 AM',
      dueDate: '2025-05-18',
      accountId: accounts[0].id, // BrightWave Ltd.
      description: 'Proposal follow-up',
      priority: 'High',
      ownerId: SEED_USERS[0].id,
      status: 'Pending',
      channel: 'Call',
      createdAt: '2025-05-16T08:00:00Z',
    },
    {
      id: 'fu-2',
      organizationId: ORG_ID,
      timeLabel: '11:30 AM',
      dueDate: '2025-05-18',
      accountId: accounts[3].id, // TerraFirma Inc.
      description: 'Demo feedback call',
      priority: 'High',
      ownerId: SEED_USERS[1].id,
      status: 'Pending',
      channel: 'Meeting',
      createdAt: '2025-05-16T09:00:00Z',
    },
    {
      id: 'fu-3',
      organizationId: ORG_ID,
      timeLabel: '2:00 PM',
      dueDate: '2025-05-18',
      accountId: accounts[6].id, // Vertex Solutions
      description: 'Contract discussion',
      priority: 'High',
      ownerId: SEED_USERS[0].id,
      status: 'Pending',
      channel: 'Call',
      createdAt: '2025-05-16T10:00:00Z',
    },
    {
      id: 'fu-4',
      organizationId: ORG_ID,
      timeLabel: '4:30 PM',
      dueDate: '2025-05-18',
      accountId: accounts[13].id, // InnovateX
      description: 'Onboarding call',
      priority: 'Medium',
      ownerId: SEED_USERS[2].id,
      status: 'Pending',
      channel: 'Meeting',
      createdAt: '2025-05-16T11:00:00Z',
    },
  ];

  const extraFollowUpTimes = ['9:15 AM', '10:45 AM', '1:15 PM', '3:00 PM', '5:00 PM'];
  const extraFollowUpDescs = [
    'Security questionnaire review',
    'Executive sponsor check-in',
    'Pricing tier comparison',
    'Renewal terms alignment',
    'Technical POC wrap-up',
  ];

  const remainingFollowUps: FollowUp[] = Array.from({ length: 16 }, (_, idx) => {
    const acc = accounts[(idx + 7) % accounts.length];
    return {
      id: `fu-${idx + 5}`,
      organizationId: ORG_ID,
      timeLabel: extraFollowUpTimes[idx % extraFollowUpTimes.length],
      dueDate: `2025-05-${19 + (idx % 10)}`,
      accountId: acc.id,
      description: extraFollowUpDescs[idx % extraFollowUpDescs.length],
      priority: idx % 3 === 0 ? 'High' : idx % 2 === 0 ? 'Medium' : 'Low',
      ownerId: SEED_USERS[idx % SEED_USERS.length].id,
      status: idx > 12 ? 'Completed' : 'Pending',
      channel: idx % 2 === 0 ? 'Call' : 'Meeting',
      createdAt: '2025-05-15T09:00:00Z',
    };
  });

  // 18 Calendar Meetings around May 2025
  const meetings: Meeting[] = Array.from({ length: 18 }, (_, idx) => {
    const acc = accounts[idx % accounts.length];
    const day = 12 + (idx % 18);
    const startHour = 9 + (idx % 7);
    const types: Meeting['type'][] = ['Demo', 'Discovery', 'Negotiation', 'Onboarding', 'Internal'];
    return {
      id: `mtg-${idx + 1}`,
      organizationId: ORG_ID,
      title: `${types[idx % types.length]}: ${acc.name}`,
      accountId: acc.id,
      dealId: deals[idx % deals.length].id,
      ownerId: SEED_USERS[idx % SEED_USERS.length].id,
      date: `2025-05-${String(day).padStart(2, '0')}`,
      startTime: `${String(startHour).padStart(2, '0')}:00`,
      endTime: `${String(startHour + 1).padStart(2, '0')}:00`,
      location: idx % 3 === 0 ? 'Zoom Video Room' : idx % 3 === 1 ? 'Google Meet' : 'HQ Conf Room B',
      type: types[idx % types.length],
      attendees: [SEED_USERS[idx % SEED_USERS.length].name, `${contacts[idx % contacts.length].firstName} ${contacts[idx % contacts.length].lastName}`],
      notes: `Agenda covering milestone deliverables and commercial timeline for ${acc.name}.`,
      createdAt: '2025-05-10T09:00:00Z',
    };
  });

  const documents: DocumentItem[] = [
    { id: 'doc-1', organizationId: ORG_ID, name: 'BrightWave Enterprise MSA 2025.pdf', category: 'Contract', fileType: 'PDF', sizeLabel: '2.4 MB', accountId: accounts[0].id, dealId: deals[0].id, ownerId: SEED_USERS[0].id, updatedAt: '2025-05-17T14:20:00Z', summary: 'Master Services Agreement with standard SLA addendum and enterprise data processing terms.' },
    { id: 'doc-2', organizationId: ORG_ID, name: 'Nexora 2025 Product Brochure.pdf', category: 'Brochure', fileType: 'PDF', sizeLabel: '4.1 MB', accountId: accounts[1].id, ownerId: SEED_USERS[1].id, updatedAt: '2025-05-16T11:10:00Z', summary: 'Executive overview of Nexora CRM platform modules, deployment architecture, and ROI benchmarks.' },
    { id: 'doc-3', organizationId: ORG_ID, name: 'Vertex Solutions Q2 Proposal.pptx', category: 'Proposal', fileType: 'PPTX', sizeLabel: '6.8 MB', accountId: accounts[6].id, dealId: deals[22].id, ownerId: SEED_USERS[0].id, updatedAt: '2025-05-15T16:45:00Z', summary: 'Custom BI Warehouse Upgrade commercial proposal with 3-year volume pricing.' },
    { id: 'doc-4', organizationId: ORG_ID, name: 'TerraFirma Security Compliance Matrix.xlsx', category: 'Playbook', fileType: 'XLSX', sizeLabel: '1.2 MB', accountId: accounts[3].id, dealId: deals[10].id, ownerId: SEED_USERS[2].id, updatedAt: '2025-05-14T09:30:00Z', summary: 'SOC2 Type II, ISO 27001, and GDPR control mapping spreadsheet.' },
    { id: 'doc-5', organizationId: ORG_ID, name: 'GlobalLink Freight OS Case Study.pdf', category: 'Case Study', fileType: 'PDF', sizeLabel: '3.2 MB', accountId: accounts[12].id, ownerId: SEED_USERS[0].id, updatedAt: '2025-05-13T13:15:00Z', summary: 'How GlobalLink reduced quote-to-cash cycle time by 41% across 14 regional hubs.' },
    { id: 'doc-6', organizationId: ORG_ID, name: 'InnovateX Onboarding Runbook.docx', category: 'Playbook', fileType: 'DOCX', sizeLabel: '980 KB', accountId: accounts[13].id, ownerId: SEED_USERS[2].id, updatedAt: '2025-05-12T10:05:00Z', summary: '30-60-90 day customer implementation schedule and milestone checklist.' },
    { id: 'doc-7', organizationId: ORG_ID, name: 'Elite Ventures Order Form v3.pdf', category: 'Contract', fileType: 'PDF', sizeLabel: '1.7 MB', accountId: accounts[9].id, ownerId: SEED_USERS[0].id, updatedAt: '2025-05-11T17:40:00Z', summary: 'Final commercial order form for Deal Flow Platform ($60,000 ACV).' },
    { id: 'doc-8', organizationId: ORG_ID, name: 'Pioneer Corp IoT Integration Spec.pdf', category: 'Proposal', fileType: 'PDF', sizeLabel: '5.0 MB', accountId: accounts[10].id, ownerId: SEED_USERS[1].id, updatedAt: '2025-05-10T15:20:00Z', summary: 'Technical architecture specification for IoT gateway telemetry ingestion.' },
    { id: 'doc-9', organizationId: ORG_ID, name: 'Alpha Networks Pricing Schedule.xlsx', category: 'Proposal', fileType: 'XLSX', sizeLabel: '840 KB', accountId: accounts[11].id, ownerId: SEED_USERS[2].id, updatedAt: '2025-05-08T11:00:00Z', summary: 'Tiered seat pricing and carrier API overage protection schedule.' },
    { id: 'doc-10', organizationId: ORG_ID, name: 'Enterprise Discovery Call Script.docx', category: 'Playbook', fileType: 'DOCX', sizeLabel: '620 KB', ownerId: SEED_USERS[4].id, updatedAt: '2025-05-06T09:15:00Z', summary: 'MEDDPICC qualification guide and objection-handling framework for AEs.' },
  ];

  // 12 Months Sales Target Data (2025)
  // Jan–Mar historical baseline = $254,000 ($72K + $88K + $94K)
  // April has $29,100 from Closed Won deals -> + $60,900 baseline = $90K total?
  // Wait: let's make sure Jan-Apr baseline + Closed Won deals = $766,000 total!
  // Closed Won deals sum to $512,000 ($29,100 in Apr + $482,900 in May).
  // So Jan + Feb + Mar + Apr baseline = $766,000 - $512,000 = $254,000!
  // Let's split $254,000 cleanly across Jan, Feb, Mar, Apr baseline:
  // Jan: $58,000, Feb: $72,000, Mar: $84,000, Apr baseline: $40,000 (plus $29,100 deals = $69,100), May baseline: $0 (plus $482,900 deals = $482,900).
  // Wait: in the screenshot bars, Jan-May rise steadily and Jun-Sep are lighter projected/partial bars with a Target line around 1.0M/12 (~83K/mo)!
  // Having Jan ($58K), Feb ($72K), Mar ($84K), Apr ($69.1K), May ($482.9K from deals, or let's distribute Closed Won deals across Jan-May so each month looks balanced AND sums to $766,000!).
  // Wait: Card 3 says "Revenue (MTD): $482,900" AND Closed Won deals total "$512,000"! That means in May MTD alone, $482,900 was closed, and $29,100 was in April, and $254,000 was Jan-Mar! Let's keep that exact math:
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const baselines = [68000, 86000, 100000, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 68+86+100 = 254,000!
  const monthlyTargets = [80000, 80000, 85000, 85000, 90000, 85000, 80000, 80000, 85000, 85000, 85000, 80000]; // sums to 1,000,000!

  const salesTargets: SalesTarget[] = months.map((monthLabel, monthIndex) => ({
    id: `st-2025-${monthIndex + 1}`,
    organizationId: ORG_ID,
    monthIndex,
    monthLabel,
    year: 2025,
    targetAmount: monthlyTargets[monthIndex],
    baselineActualAmount: baselines[monthIndex],
  }));

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      organizationId: ORG_ID,
      title: 'Deal moved to Closed Won',
      message: 'GlobalLink Ltd. ($55,000) was marked Closed Won by Alex Morgan.',
      type: 'deal',
      read: false,
      createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    },
    {
      id: 'notif-2',
      organizationId: ORG_ID,
      title: 'Proposal viewed 3 times',
      message: 'BrightWave Ltd. opened the Q2 Enterprise Cloud Suite proposal.',
      type: 'lead',
      read: false,
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    {
      id: 'notif-3',
      organizationId: ORG_ID,
      title: 'Upcoming Follow-Up at 10:00 AM',
      message: 'Proposal follow-up call with BrightWave Ltd. is scheduled today.',
      type: 'reminder',
      read: false,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'notif-4',
      organizationId: ORG_ID,
      title: 'Monthly Quota Milestone',
      message: 'Team achieved 76% of the $1,000,000 annual revenue target.',
      type: 'system',
      read: true,
      createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
  ];

  return {
    organization: {
      id: ORG_ID,
      name: 'Nexora Systems Inc.',
      domain: 'nexoracrm.io',
      plan: 'Growth',
      currency: 'USD',
      annualTarget: 1000000,
      createdAt: '2024-01-01T00:00:00Z',
    },
    users: SEED_USERS,
    accounts,
    contacts,
    leads,
    dealStages: DEAL_STAGES,
    deals,
    products,
    dealProducts,
    activities: [...featuredActivities, ...remainingActivities],
    followUps: [...featuredFollowUps, ...remainingFollowUps],
    meetings,
    documents,
    salesTargets,
    notifications,
    preferences: {
      theme: 'light',
      currency: 'USD',
      dateRange: 'month',
      emailNotifications: true,
      dealAlerts: true,
      reminderAlerts: true,
      weeklyDigest: true,
      compactTables: false,
    },
  };
}
