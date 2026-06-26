import { cn } from '@/shared/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'current';
}

const SIZE_CLASS: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-6 w-6 border-[3px]',
};

const COLOR_CLASS: Record<NonNullable<SpinnerProps['color']>, string> = {
  primary: 'border-primary/30 border-t-primary',
  white: 'border-white/30 border-t-white',
  current: 'border-current/30 border-t-current',
};

function Spinner({ size = 'md', color = 'current' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full',
        SIZE_CLASS[size],
        COLOR_CLASS[color],
      )}
    />
  );
}

export default Spinner;
