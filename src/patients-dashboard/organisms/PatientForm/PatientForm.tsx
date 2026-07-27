import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  patientFormSchema,
  type PatientFormData,
  type PatientFormInput,
} from '@/patients-dashboard/schemas/patient.schema';
import Input from '@/patients-dashboard/atoms/Input';
import Textarea from '@/patients-dashboard/atoms/Textarea';
import Button from '@/patients-dashboard/atoms/Button';
import FormField from '@/patients-dashboard/molecules/FormField';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface PatientFormProps {
  mode: 'create' | 'edit';
  defaultValues: PatientFormData;
  onSubmit: (data: PatientFormData) => void;
  submitLabel: string;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

function PatientForm({
  mode,
  defaultValues,
  onSubmit,
  submitLabel,
}: PatientFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormInput, unknown, PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
  });

  // Reinicia el formulario cuando cambian los valores por defecto
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
      <Controller
        name="name"
        control={control}
        render={({ field: { ref, ...field } }) => (
          <FormField
            label="Nombre"
            htmlFor="patient-name"
            error={errors.name?.message}
            required
          >
            <Input
              id="patient-name"
              placeholder="Nombre del paciente"
              error={errors.name?.message}
              ref={ref}
              {...field}
            />
          </FormField>
        )}
      />

      {/* Descripción */}
      <Controller
        name="description"
        control={control}
        render={({ field: { ref, ...field } }) => (
          <FormField
            label="Descripción"
            htmlFor="patient-description"
            error={errors.description?.message}
            required
          >
            <Textarea
              id="patient-description"
              placeholder="Descripción del paciente"
              rows={3}
              error={errors.description?.message}
              ref={ref}
              {...field}
            />
          </FormField>
        )}
      />

      {/* Página web + Avatar — opcionales */}
      {/* Página web */}
      <Controller
        name="website"
        control={control}
        render={({ field: { ref, ...field } }) => (
          <FormField
            label="Página web"
            htmlFor="patient-website"
            error={errors.website?.message}
          >
            <Input
              id="patient-website"
              placeholder="https://ejemplo.com"
              error={errors.website?.message}
              ref={ref}
              {...field}
            />
          </FormField>
        )}
      />

      {/* Avatar */}
      <Controller
        name="avatar"
        control={control}
        render={({ field: { ref, ...field } }) => (
          <FormField
            label="Avatar"
            htmlFor="patient-avatar"
            error={errors.avatar?.message}
          >
            <Input
              id="patient-avatar"
              placeholder="https://ejemplo.com/avatar.jpg"
              error={errors.avatar?.message}
              ref={ref}
              {...field}
            />
          </FormField>
        )}
      />

      {/* Enviar */}
      <Button type="submit" variant="primary" className="self-end">
        {submitLabel}
      </Button>
    </form>
  );
}

export default PatientForm;
