import { request } from '../../api/apiClient';
import { isApiError, ApiErrorError } from '../../api/types';
import { apiResponseSchema } from '../schemas/patient.schema';
import type { Patient } from '../types/patient.types';

export interface GetPatientsPageParams {
  page: number;
  limit: number;
  /** Término de búsqueda (opcional). */
  search?: string;
}

export async function getPatientsPage({
  page,
  limit,
  search,
}: GetPatientsPageParams): Promise<Patient[]> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);

  const params = new URLSearchParams();
  params.set('page', String(safePage));
  params.set('limit', String(safeLimit));

  const trimmedSearch = typeof search === 'string' ? search.trim() : '';
  if (trimmedSearch.length > 0) {
    params.set('search', trimmedSearch);
  }

  const endpoint = `/users?${params.toString()}`;

  let raw: unknown;
  try {
    raw = await request<unknown>(endpoint);
  } catch (error: unknown) {
    // MockAPI devuelve 404 cuando una búsqueda no encuentra resultados.
    // Lo tratamos como página vacía en vez de error.
    if (isApiError(error) && error.status === 404) {
      return [];
    }
    throw error;
  }

  const result = apiResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new ApiErrorError(
      'La respuesta de la API no coincide con el esquema esperado',
      200,
      'INVALID_RESPONSE',
    );
  }

  return result.data as Patient[];
}
