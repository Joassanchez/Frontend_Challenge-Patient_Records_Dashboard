import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  description: z.string().trim().min(1, 'La descripción es obligatoria'),
  webpage: z.string().url('La página web debe ser una URL válida'),
  avatar: z.string().url('El avatar debe ser una URL válida'),
});

export type PatientFormData = z.infer<typeof patientSchema>;
