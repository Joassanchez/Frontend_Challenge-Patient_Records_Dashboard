import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import Spinner from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary',
  secondary:
    'bg-white text-text border border-border hover:bg-slate-50 focus-visible:ring-primary',
  ghost:
    'text-text-muted hover:text-text hover:bg-slate-100 focus-visible:ring-primary',
};

const SIZE_CLASS: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, children, className, onClick, type, ...rest }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        disabled={isDisabled}
        aria-busy={loading ? 'true' : undefined}
        onClick={isDisabled ? undefined : onClick}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          VARIANT_CLASS[variant],
          SIZE_CLASS[size],
          isDisabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
        {...rest}
      >
        {loading && <Spinner size="sm" color="current" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
