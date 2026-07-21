export type ApiErrorCode = 'HTTP_ERROR' | 'NETWORK_ERROR' | 'INVALID_RESPONSE' | 'CONFIG_ERROR';

export interface ApiError {
  status: number;
  message: string;
  code: ApiErrorCode;
}

/**
 * Clase de error que implementa la interfaz ApiError.
 * Extiende Error para obtener stack traces, pero mantiene compatibilidad
 * estructural con el guard isApiError().
 */
export class ApiErrorError extends Error implements ApiError {
  readonly status: number;
  readonly code: ApiErrorCode;

  constructor(message: string, status: number, code: ApiErrorCode) {
    super(message);
    this.name = 'ApiErrorError';
    this.status = status;
    this.code = code;
  }
}

export function isApiError(error: unknown): error is ApiError {
  if (typeof error !== 'object' || error === null) return false;
  const e = error as Record<string, unknown>;
  return (
    typeof e.status === 'number' &&
    typeof e.message === 'string' &&
    typeof e.code === 'string'
  );
}
