import { useEffect, type MutableRefObject } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
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
import AvatarPreview from '@/patients-dashboard/molecules/AvatarPreview';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface PatientFormProps {
  mode: 'create' | 'edit';
  defaultValues: PatientFormData;
  onSubmit: (data: PatientFormData) => void;
  submitLabel: string;
  /** Ref mutable que se actualiza en cada render con el valor de isDirty. No causa re-renders. */
  dirtyRef?: MutableRefObject<boolean>;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

function PatientForm({
  mode: _mode,
  defaultValues,
  onSubmit,
  submitLabel,
  dirtyRef,
}: PatientFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PatientFormInput, unknown, PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
    mode: 'onBlur',
  });

  // Actualizar dirtyRef en cada render — sin causar re-renders del padre
  if (dirtyRef) {
    dirtyRef.current = isDirty;
  }

  // Watch avatar field for preview
  const avatarValue = useWatch({ control, name: 'avatar' });
  const nameValue = useWatch({ control, name: 'name' });

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
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <Input
                  id="patient-avatar"
                  placeholder="https://ejemplo.com/avatar.jpg"
                  error={errors.avatar?.message}
                  ref={ref}
                  {...field}
                />
              </div>
              <AvatarPreview
                src={avatarValue || ''}
                name={nameValue || ''}
              />
            </div>
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
