import { cloneElement } from 'react';
import type { ReactElement, InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';
import Label from '@/patients-dashboard/atoms/Label';
import ErrorMessage from './ErrorMessage';

type FormFieldChildProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'aria-invalid' | 'aria-describedby'
>;

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactElement<FormFieldChildProps>;
}

function FormField({
  label,
  htmlFor,
  error,
  required,
  children,
}: FormFieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined;

  const childProps: FormFieldChildProps = {
    'aria-invalid': error ? 'true' : undefined,
    ...(errorId ? { 'aria-describedby': errorId } : {}),
  };

  const clonedChild = cloneElement(children, childProps);

  return (
    <div className={cn('flex flex-col gap-1.5')}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {clonedChild}
      {error && <ErrorMessage message={error} id={errorId} />}
    </div>
  );
}

export default FormField;
