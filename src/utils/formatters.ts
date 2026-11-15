import { CurrencyCode } from '../types/crm';

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const CURRENCY_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD', compact = false): string {
  const converted = Math.round(amount * CURRENCY_RATES[currency]);
  const symbol = CURRENCY_SYMBOLS[currency];

  if (compact) {
    if (Math.abs(converted) >= 1_000_000) {
      return `${symbol}${(converted / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
    }
    if (Math.abs(converted) >= 1_000) {
      return `${symbol}${Math.round(converted / 1_000)}K`;
    }
  }

  return `${symbol}${converted.toLocaleString('en-US')}`;
}

export function formatShortDate(isoOrDate: string): string {
  if (!isoOrDate) return '—';
  const date = new Date(isoOrDate.includes('T') ? isoOrDate : `${isoOrDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoOrDate;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hr' : 'hrs'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  return formatShortDate(isoDate);
}

export function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}
