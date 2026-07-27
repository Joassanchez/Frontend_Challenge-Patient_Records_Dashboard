import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, disabled, ...rest }, ref) => {
    const hasError = Boolean(error);

    return (
      <input
        ref={ref}
        aria-invalid={hasError ? 'true' : undefined}
        disabled={disabled}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-colors',
          'placeholder:text-slate-400',
          'focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
          'dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-600',
          hasError
            ? 'border-error ring-1 ring-error'
            : 'border-slate-200',
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
        {...rest}
      />
    );
  },
);

Input.displayName = 'Input';

export default Input;
