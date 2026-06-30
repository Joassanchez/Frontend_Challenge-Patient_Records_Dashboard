import { z } from 'zod';

/**
 * Full Patient validation schema — used for full entity validation,
 * kept for backward compatibility during migration.
 */
export const patientSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  description: z.string().trim().min(1, 'La descripción es obligatoria'),
  webpage: z.string().url('La página web debe ser una URL válida'),
  avatar: z.string().url('El avatar debe ser una URL válida'),
});

/**
 * Form schema — create mode collects only name + description (webpage/avatar
 * are completed by the store). Edit mode exposes all four fields so the user
 * can modify webpage and avatar too.
 */
export const patientFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  description: z.string().trim().min(1, 'La descripción es obligatoria'),
  webpage: z.string().default(''),
  avatar: z.string().default(''),
});

/**
 * Form input type — includes all editable patient fields.
 * In create mode, webpage and avatar default to '' and are replaced by the store.
 * In edit mode, they are pre-filled from the existing patient.
 */
export type PatientFormData = z.infer<typeof patientFormSchema>;
