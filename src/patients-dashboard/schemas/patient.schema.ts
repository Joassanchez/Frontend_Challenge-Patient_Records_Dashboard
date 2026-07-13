import { z } from 'zod';

// ---------------------------------------------------------------------------
// Reusable helpers
// ---------------------------------------------------------------------------

/** Accepts empty string OR a valid http/https URL. */
const optionalUrl = (message: string) =>
  z.string().refine((val) => val === '' || /^https?:\/\/.+/.test(val), {
    message,
  });

/** Coerces non-string values (e.g. empty objects from MockAPI) to ''. */
const stringOrEmpty = z.preprocess(
  (val) => (typeof val === 'string' ? val : ''),
  z.string(),
);

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

/**
 * API response schema — validates that MockAPI /users returns the expected
 * shape. Some records have `avatar: {}` instead of a string; the preprocessor
 * normalizes non-string values to ''.
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
 * Form schema — create mode collects only name + description (website/avatar
 * are completed by the store). Edit mode exposes all four fields so the user
 * can modify website and avatar too.
 *
 * website and avatar accept either an empty string or a valid http/https URL.
 */
export const patientFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  description: z.string().trim().min(1, 'La descripción es obligatoria'),
  website: optionalUrl('La página web debe ser una URL válida').default(''),
  avatar: optionalUrl('El avatar debe ser una URL válida').default(''),
});

/**
 * Raw form input type accepted by the Zod resolver.
 *
 * Because website/avatar use `.default('')`, Zod accepts them as optional input
 * values and returns them as required strings after parsing.
 */
export type PatientFormInput = z.input<typeof patientFormSchema>;

/**
 * Parsed form output type used by submit handlers and stores.
 *
 * In create mode, website and avatar default to '' and are replaced by the store.
 * In edit mode, they are pre-filled from the existing patient.
 */
export type PatientFormData = z.output<typeof patientFormSchema>;
