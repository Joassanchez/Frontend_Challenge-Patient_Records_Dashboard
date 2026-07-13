import { z } from 'zod';

// ---------------------------------------------------------------------------
// Helpers reutilizables
// ---------------------------------------------------------------------------

/** Acepta cadena vacía O una URL http/https válida. */
const optionalUrl = (message: string) =>
  z.string().refine((val) => val === '' || /^https?:\/\/.+/.test(val), {
    message,
  });

/** Convierte valores no string (ej. objetos vacíos de MockAPI) a ''. */
const stringOrEmpty = z.preprocess(
  (val) => (typeof val === 'string' ? val : ''),
  z.string(),
);

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

/**
 * Schema de respuesta de la API — valida que MockAPI /users devuelva la forma
 * esperada. Algunos registros tienen `avatar: {}` en vez de un string; el
 * preprocesador normaliza valores no string a ''.
 */
export const apiPatientSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  website: z.string(),
  avatar: stringOrEmpty,
  createdAt: z.string().optional(),
});

export const apiResponseSchema = z.array(apiPatientSchema);

/**
 * Schema del formulario — en modo creación solo recolecta nombre + descripción
 * (website/avatar los completa el store). En modo edición expone los cuatro
 * campos para que el usuario pueda modificar también website y avatar.
 *
 * website y avatar aceptan cadena vacía o una URL http/https válida.
 */
export const patientFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  description: z.string().trim().min(1, 'La descripción es obligatoria'),
  website: optionalUrl('La página web debe ser una URL válida').default(''),
  avatar: optionalUrl('El avatar debe ser una URL válida').default(''),
});

/**
 * Tipo de entrada crudo del formulario aceptado por el resolver de Zod.
 *
 * Como website/avatar usan `.default('')`, Zod los acepta como valores de
 * entrada opcionales y los devuelve como strings requeridos después del parseo.
 */
export type PatientFormInput = z.input<typeof patientFormSchema>;

/**
 * Tipo de salida del formulario usado por los handlers de submit y stores.
 *
 * En modo creación, website y avatar son '' por defecto y los reemplaza el
 * store. En modo edición, vienen precargados del paciente existente.
 */
export type PatientFormData = z.output<typeof patientFormSchema>;
