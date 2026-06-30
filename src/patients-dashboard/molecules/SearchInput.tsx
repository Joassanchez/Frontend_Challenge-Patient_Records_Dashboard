import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';
import Input from '@/patients-dashboard/atoms/Input';
import Icon from '@/patients-dashboard/atoms/Icon';
import Button from '@/patients-dashboard/atoms/Button';

interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  ...rest
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
        <Icon name="search" size="sm" />
      </span>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
        {...rest}
      />
      {value && (
        <span className="absolute right-1 top-1/2 -translate-y-1/2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            <Icon name="close" size="sm" />
          </Button>
        </span>
      )}
    </div>
  );
}

export default SearchInput;
