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
          'w-full rounded-md border bg-white px-3 py-2 text-sm text-text transition-colors',
          'placeholder:text-text-muted',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary',
          hasError
            ? 'border-error ring-1 ring-error'
            : 'border-border',
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
