import React from 'react';

interface UserAvatarProps {
  name: string;
  initials: string;
  color: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, initials, color, size = 'sm' }) => {
  return (
    <div
      title={name}
      aria-label={name}
      style={{ backgroundColor: color }}
      className={`${SIZE_CLASSES[size]} inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white dark:ring-slate-900 select-none`}
    >
      {initials}
    </div>
  );
};

interface CompanyBadgeProps {
  name: string;
  initials: string;
  color: string;
  size?: 'sm' | 'md';
}

export const CompanyBadge: React.FC<CompanyBadgeProps> = ({ name, initials, color, size = 'sm' }) => {
  const cls = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs';
  return (
    <div
      title={name}
      style={{ backgroundColor: color }}
      className={`${cls} inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-xs select-none`}
    >
      {initials}
    </div>
  );
};
