import type { IconName } from '@/patients-dashboard/atoms/Icon';
import { cn } from '@/shared/utils/cn';
import Icon from '@/patients-dashboard/atoms/Icon';
import Button from '@/patients-dashboard/atoms/Button';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  action?: EmptyStateAction;
  variant?: 'default' | 'compact';
}

function EmptyState({
  title,
  description,
  icon,
  action,
  variant = 'default',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800/50',
        variant === 'compact' && 'py-8',
      )}
    >
      {icon && <Icon name={icon} size="lg" />}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        {description && (
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
