import { cn } from '@/shared/utils/cn';
import Icon from '@/patients-dashboard/atoms/Icon';

interface ErrorMessageProps {
  message: string;
  id?: string;
  variant?: 'block' | 'inline';
}

function ErrorMessage({ message, id, variant = 'block' }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      id={id}
      className={cn(
        'items-center gap-2 text-sm text-error',
        variant === 'inline'
          ? 'inline-flex'
          : 'flex rounded-xl border border-error/15 bg-error/5 px-4 py-3',
      )}
    >
      <Icon name="alert-circle" size="sm" />
      <span>{message}</span>
    </div>
  );
}

export default ErrorMessage;
