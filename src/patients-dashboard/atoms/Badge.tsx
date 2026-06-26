import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface BadgeProps {
  variant?: 'neutral' | 'success' | 'error' | 'favorite' | 'inactive';
  size?: 'sm' | 'md';
  children: ReactNode;
}

const VARIANT_CLASS: Record<NonNullable<BadgeProps['variant']>, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-success/10 text-success',
  error: 'bg-error/10 text-error',
  favorite: 'bg-favorite/10 text-favorite',
  inactive: 'bg-inactive/10 text-inactive',
};

const SIZE_CLASS: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-1.5 py-0.5 text-[0.625rem]',
  md: 'px-2 py-0.5 text-xs',
};

function Badge({ variant = 'neutral', size = 'md', children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
