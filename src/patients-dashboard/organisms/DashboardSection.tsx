import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface DashboardSectionProps {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  counter?: string;
  counterPlacement?: 'below' | 'inline';
  headingId: string;
  title: string;
}

function DashboardSection({
  actions,
  children,
  className,
  counter,
  counterPlacement = 'below',
  headingId,
  title,
}: DashboardSectionProps) {
  return (
    <section aria-labelledby={headingId} className={cn('w-full', className)}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 id={headingId} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {counter && counterPlacement === 'inline' && (
              <span className="text-sm text-slate-500">{counter}</span>
            )}
          </div>
          {counter && counterPlacement === 'below' && (
            <span className="text-sm text-slate-500">{counter}</span>
          )}
        </div>
        {actions}
      </div>

      {children}
    </section>
  );
}

export default DashboardSection;
