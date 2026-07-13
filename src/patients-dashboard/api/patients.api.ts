import { request } from '../../api/apiClient';
import { apiResponseSchema } from '../schemas/patient.schema';
import type { Patient } from '../types/patient.types';

export async function getPatients(): Promise<Patient[]> {
  const raw = await request<unknown>('/users');

  const result = apiResponseSchema.safeParse(raw);
  if (!result.success) {
    throw {
      status: 200,
      message: 'La respuesta de la API no coincide con el esquema esperado',
      code: 'INVALID_RESPONSE',
    };
  }

  return result.data as Patient[];
}
