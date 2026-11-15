import React from 'react';
import {
  Waves,
  Mountain,
  Hexagon,
  Globe,
  TrendingUp,
  Cpu,
  Layers,
  Cloud,
  Eye,
  Gem,
  Compass,
  Radio,
  Link2,
  Zap,
  Rocket,
  Truck,
  HeartPulse,
  ShoppingBag,
  Flame,
  Film,
  Bot,
  Dna,
  Landmark,
  Plane,
  ShieldCheck,
  Factory,
  Wifi,
  GraduationCap,
  Utensils,
  Building2,
} from 'lucide-react';

interface UserAvatarProps {
  name: string;
  initials: string;
  color: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
};

interface PortraitSpec {
  bg: string;
  skin: string;
  hair: string;
  shirt: string;
  hairStyle: 'short' | 'long' | 'parted' | 'curly' | 'bob';
  glasses?: boolean;
}

const PORTRAIT_PRESETS: Record<string, PortraitSpec> = {
  'Alex Morgan': { bg: '#D8F3F4', skin: '#F3C6A5', hair: '#2C1E1A', shirt: '#09254A', hairStyle: 'short' },
  'Jamie Carter': { bg: '#DBEAFE', skin: '#E9B493', hair: '#4A2C1D', shirt: '#0AA6AD', hairStyle: 'long' },
  'Taylor Brooks': { bg: '#E2E8F0', skin: '#C68B66', hair: '#1E1B18', shirt: '#1C7ED6', hairStyle: 'parted', glasses: true },
  'Jordan Lee': { bg: '#FFE4E1', skin: '#F2C19E', hair: '#18181B', shirt: '#FF6155', hairStyle: 'curly' },
  'Morgan Riley': { bg: '#DCFCE7', skin: '#D99B78', hair: '#6D3B22', shirt: '#0CA678', hairStyle: 'bob' },
};

function getPortraitSpec(name: string, fallbackColor: string): PortraitSpec {
  if (PORTRAIT_PRESETS[name]) return PORTRAIT_PRESETS[name];
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const skins = ['#F3C6A5', '#E9B493', '#C68B66', '#D99B78'];
  const hairs = ['#2C1E1A', '#4A2C1D', '#1E1B18', '#6D3B22'];
  const styles: PortraitSpec['hairStyle'][] = ['short', 'parted', 'long', 'curly', 'bob'];
  return {
    bg: `${fallbackColor}22`,
    skin: skins[hash % skins.length],
    hair: hairs[hash % hairs.length],
    shirt: fallbackColor || '#0AA6AD',
    hairStyle: styles[hash % styles.length],
    glasses: hash % 3 === 0,
  };
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, color, size = 'sm' }) => {
  const spec = getPortraitSpec(name, color);

  return (
    <div
      title={name}
      aria-label={name}
      style={{ backgroundColor: spec.bg }}
      className={`${SIZE_CLASSES[size]} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-white dark:ring-slate-900 shadow-2xs select-none`}
    >
      <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
        {/* Shoulders / Shirt */}
        <path d="M12 64C12 49 20 42 32 42C44 42 52 49 52 64Z" fill={spec.shirt} />
        {/* Neck */}
        <rect x="27" y="34" width="10" height="11" rx="4" fill={spec.skin} />
        {/* Back Hair for long/bob styles */}
        {(spec.hairStyle === 'long' || spec.hairStyle === 'bob') && (
          <path
            d={
              spec.hairStyle === 'long'
                ? 'M16 28C16 15 23 10 32 10C41 10 48 15 48 28V48C48 51 44 52 42 49V32H22V49C20 52 16 51 16 48V28Z'
                : 'M17 27C17 15 24 10 32 10C40 10 47 15 47 27V40C47 42 43 43 42 40V30H22V40C21 43 17 42 17 40V27Z'
            }
            fill={spec.hair}
          />
        )}
        {/* Head */}
        <circle cx="32" cy="26" r="12.5" fill={spec.skin} />
        {/* Front Hair */}
        {spec.hairStyle === 'short' && (
          <path d="M19.5 25C19.5 16.5 25 11.5 32 11.5C39 11.5 44.5 16.5 44.5 25C43 20 38 18.5 32 18.5C26 18.5 21 20 19.5 25Z" fill={spec.hair} />
        )}
        {spec.hairStyle === 'parted' && (
          <path d="M19.5 26C19 16 25 11 33 11C40 11 45 16.5 44.5 25C42 20 36 19 30 21C25 22.5 21 23 19.5 26Z" fill={spec.hair} />
        )}
        {spec.hairStyle === 'curly' && (
          <path d="M19 25C18 17 23 10.5 32 10.5C41 10.5 46 17 45 25C43 21 40 19.5 36 20.5C33 18.5 29 19 26 20.5C23 19.5 20.5 21 19 25Z" fill={spec.hair} />
        )}
        {(spec.hairStyle === 'long' || spec.hairStyle === 'bob') && (
          <path d="M19.5 24C20 16 25.5 12 32 12C38.5 12 44 16 44.5 24C41.5 19.5 36.5 18 32 19.5C27.5 18 22.5 19.5 19.5 24Z" fill={spec.hair} />
        )}
        {/* Eyes */}
        <circle cx="27.5" cy="26.5" r="1.4" fill="#1E293B" />
        <circle cx="36.5" cy="26.5" r="1.4" fill="#1E293B" />
        {/* Glasses */}
        {spec.glasses && (
          <g stroke="#0F172A" strokeWidth="1.2" fill="none">
            <rect x="23.5" y="24" width="7" height="5" rx="1.5" />
            <rect x="33.5" y="24" width="7" height="5" rx="1.5" />
            <line x1="30.5" y1="26.5" x2="33.5" y2="26.5" />
          </g>
        )}
        {/* Warm smile */}
        <path d="M28.5 31.5C29.8 33 34.2 33 35.5 31.5" stroke="#9A5B43" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
};

interface CompanyBadgeProps {
  name: string;
  initials: string;
  color: string;
  size?: 'sm' | 'md';
}

const COMPANY_ICON_MAP: Array<{ match: string; icon: React.ComponentType<{ className?: string }> }> = [
  { match: 'brightwave', icon: Waves },
  { match: 'summit', icon: Mountain },
  { match: 'hexatech', icon: Hexagon },
  { match: 'terrafirma', icon: Globe },
  { match: 'bluepeak', icon: TrendingUp },
  { match: 'nova', icon: Cpu },
  { match: 'vertex', icon: Layers },
  { match: 'cloudscale', icon: Cloud },
  { match: 'insight', icon: Eye },
  { match: 'elite', icon: Gem },
  { match: 'pioneer', icon: Compass },
  { match: 'alpha', icon: Radio },
  { match: 'globallink', icon: Link2 },
  { match: 'innovatex', icon: Zap },
  { match: 'nextgen', icon: Rocket },
  { match: 'apex', icon: Truck },
  { match: 'horizon', icon: HeartPulse },
  { match: 'quantum', icon: ShoppingBag },
  { match: 'stratos', icon: Flame },
  { match: 'vanguard', icon: Film },
  { match: 'pulse', icon: Bot },
  { match: 'kinetix', icon: Dna },
  { match: 'silverline', icon: Landmark },
  { match: 'meridian', icon: Plane },
  { match: 'cobalt', icon: ShieldCheck },
  { match: 'atlas', icon: Factory },
  { match: 'orion', icon: Wifi },
  { match: 'beacon', icon: GraduationCap },
  { match: 'crestview', icon: Utensils },
  { match: 'helios', icon: Rocket },
];

export const CompanyBadge: React.FC<CompanyBadgeProps> = ({ name, color, size = 'sm' }) => {
  const lower = name.toLowerCase();
  const matched = COMPANY_ICON_MAP.find((entry) => lower.includes(entry.match));
  const Icon = matched ? matched.icon : Building2;
  const cls = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  const iconCls = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div
      title={name}
      aria-label={name}
      style={{ backgroundColor: color }}
      className={`${cls} inline-flex shrink-0 items-center justify-center rounded-full text-white shadow-xs select-none`}
    >
      <Icon className={iconCls} />
    </div>
  );
};
