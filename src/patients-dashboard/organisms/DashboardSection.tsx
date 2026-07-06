import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface DashboardSectionProps {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  counter?: string;
  headingId: string;
  title: string;
}

function DashboardSection({
  actions,
  children,
  className,
  counter,
  headingId,
  title,
}: DashboardSectionProps) {
  return (
    <section aria-labelledby={headingId} className={cn('w-full', className)}>
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2">
          <h2 id={headingId} className="text-lg font-semibold text-slate-800">
            {title}
          </h2>
          {counter && <span className="text-sm text-text-muted">{counter}</span>}
        </div>
        {actions}
      </div>

      {children}
    </section>
  );
}

export default DashboardSection;
