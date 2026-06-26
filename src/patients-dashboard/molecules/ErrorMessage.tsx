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
        'items-center gap-1.5 text-sm text-error',
        variant === 'inline' ? 'inline-flex' : 'flex',
      )}
    >
      <Icon name="alert-circle" size="sm" />
      <span>{message}</span>
    </div>
  );
}

export default ErrorMessage;
