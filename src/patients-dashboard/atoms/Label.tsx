import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface LabelProps {
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}

function Label({ htmlFor, required = false, children }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('text-sm font-medium text-text')}
    >
      {children}
      {required && (
        <span aria-label="required" className="ml-0.5 text-error">
          *
        </span>
      )}
    </label>
  );
}

export default Label;
