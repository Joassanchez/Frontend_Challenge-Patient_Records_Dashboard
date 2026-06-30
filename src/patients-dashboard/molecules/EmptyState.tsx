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
        'flex flex-col items-center justify-center gap-4 py-16 px-4 text-center',
        variant === 'compact' && 'py-8',
      )}
    >
      {icon && <Icon name={icon} size="lg" />}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        {description && (
          <p className="text-sm text-text-muted">{description}</p>
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
