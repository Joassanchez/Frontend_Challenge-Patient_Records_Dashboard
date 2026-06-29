import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  patientSchema,
  type PatientFormData,
} from '@/patients-dashboard/schemas/patient.schema';
import Label from '@/patients-dashboard/atoms/Label';
import Input from '@/patients-dashboard/atoms/Input';
import Textarea from '@/patients-dashboard/atoms/Textarea';
import Button from '@/patients-dashboard/atoms/Button';
import ErrorMessage from '@/patients-dashboard/molecules/ErrorMessage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PatientFormProps {
  defaultValues: PatientFormData;
  onSubmit: (data: PatientFormData) => void;
  submitLabel: string;
  isSubmitting?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PatientForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting = false,
}: PatientFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues,
  });

  // Reset form when defaultValues change
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="patient-name" required>
          Nombre
        </Label>
        <Controller
          name="name"
          control={control}
          render={({ field: { ref, ...field } }) => (
            <Input
              id="patient-name"
              placeholder="Nombre del paciente"
              ref={ref}
              aria-invalid={errors.name ? 'true' : undefined}
              aria-describedby={
                errors.name ? 'patient-name-error' : undefined
              }
              {...field}
            />
          )}
        />
        {errors.name && (
          <ErrorMessage
            id="patient-name-error"
            message={errors.name.message!}
          />
        )}
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="patient-description" required>
          Descripción
        </Label>
        <Controller
          name="description"
          control={control}
          render={({ field: { ref, ...field } }) => (
            <Textarea
              id="patient-description"
              placeholder="Descripción del paciente"
              rows={3}
              ref={ref}
              aria-invalid={errors.description ? 'true' : undefined}
              aria-describedby={
                errors.description ? 'patient-description-error' : undefined
              }
              {...field}
            />
          )}
        />
        {errors.description && (
          <ErrorMessage
            id="patient-description-error"
            message={errors.description.message!}
          />
        )}
      </div>

      {/* Página web */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="patient-webpage" required>
          Página web
        </Label>
        <Controller
          name="webpage"
          control={control}
          render={({ field: { ref, ...field } }) => (
            <Input
              id="patient-webpage"
              placeholder="https://ejemplo.com"
              type="url"
              ref={ref}
              aria-invalid={errors.webpage ? 'true' : undefined}
              aria-describedby={
                errors.webpage ? 'patient-webpage-error' : undefined
              }
              {...field}
            />
          )}
        />
        {errors.webpage && (
          <ErrorMessage
            id="patient-webpage-error"
            message={errors.webpage.message!}
          />
        )}
      </div>

      {/* Avatar */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="patient-avatar" required>
          Avatar
        </Label>
        <Controller
          name="avatar"
          control={control}
          render={({ field: { ref, ...field } }) => (
            <Input
              id="patient-avatar"
              placeholder="https://ejemplo.com/avatar.jpg"
              type="url"
              ref={ref}
              aria-invalid={errors.avatar ? 'true' : undefined}
              aria-describedby={
                errors.avatar ? 'patient-avatar-error' : undefined
              }
              {...field}
            />
          )}
        />
        {errors.avatar && (
          <ErrorMessage
            id="patient-avatar-error"
            message={errors.avatar.message!}
          />
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        className="self-end"
      >
        {submitLabel}
      </Button>
    </form>
  );
}

export default PatientForm;
