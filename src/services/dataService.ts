import { createSeedData } from '../data/seedData';
import { CrmDataset } from '../types/crm';

const STORAGE_KEY = 'nexora_crm_demo_dataset_v1';

export interface CrmDataProvider {
  readonly mode: 'demo' | 'supabase';
  loadDataset(): CrmDataset;
  saveDataset(dataset: CrmDataset): void;
  resetDataset(): CrmDataset;
}

class DemoLocalStorageProvider implements CrmDataProvider {
  readonly mode = 'demo' as const;

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
      // Merge safely in case schema evolves
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
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return {
    url,
    anonKey,
    configured: Boolean(url && anonKey),
  };
}

export const dataProvider: CrmDataProvider = new DemoLocalStorageProvider();
