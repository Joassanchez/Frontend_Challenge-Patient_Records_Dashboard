import { z } from 'zod';

/** Permite una URL HTTP/HTTPS o una cadena vacía. */
const optionalUrl = (message: string) =>
  z.string().refine((value) => value === '' || /^https?:\/\/.+/.test(value), {
    message,
  });

/** Normaliza cualquier valor que no sea texto como una cadena vacía. */
const stringOrEmpty = z.preprocess(
  (value) => (typeof value === 'string' ? value : ''),
  z.string(),
);

/** Valida la estructura de un paciente recibido desde la API. */
export const apiPatientSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  website: z.string(),
  avatar: stringOrEmpty,
  createdAt: z.string().optional(),
});

/** Valida una lista de pacientes recibida desde la API. */
export const apiResponseSchema = z.array(apiPatientSchema);

/** Valida y normaliza los datos del formulario de paciente. */
export const patientFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  description: z.string().trim().min(1, 'La descripción es obligatoria'),
  website: optionalUrl('La página web debe ser una URL válida').default(''),
  avatar: optionalUrl('El avatar debe ser una URL válida').default(''),
});

/** Datos que puede recibir el schema antes de aplicar valores por defecto. */
export type PatientFormInput = z.input<typeof patientFormSchema>;

/** Datos validados y normalizados que devuelve el schema. */
export type PatientFormData = z.output<typeof patientFormSchema>;
