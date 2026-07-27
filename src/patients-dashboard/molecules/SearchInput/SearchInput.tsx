import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';
import Input from '@/patients-dashboard/atoms/Input';
import Icon from '@/patients-dashboard/atoms/Icon';
import Button from '@/patients-dashboard/atoms/Button';

interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ value, onChange, placeholder, className, ...rest }, ref) {
    return (
      <div className={cn('relative w-full sm:w-80', className)}>
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon name="search" size="sm" />
        </span>
        <Input
          ref={ref}
          id="patient-search"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          {...rest}
        />
        {value && (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange('')}
              aria-label="Limpiar búsqueda"
              className="h-7 w-7 rounded-full p-0"
            >
              <Icon name="close" size="sm" />
            </Button>
          </span>
        )}
      </div>
    );
  },
);

export default SearchInput;
