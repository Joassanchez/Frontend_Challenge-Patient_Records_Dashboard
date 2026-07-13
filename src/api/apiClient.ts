import type { ApiError } from './types';
import { isApiError } from './types';

function buildConfigError(message: string): ApiError {
  return { status: 0, message, code: 'CONFIG_ERROR' };
}

export async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const rawBase = import.meta.env.VITE_API_BASE_URL;
  if (!rawBase || rawBase.trim().length === 0) {
    throw buildConfigError(
      'VITE_API_BASE_URL no está definida. Configurala en .env',
    );
  }

  const url = new URL(endpoint, rawBase).toString();

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (error: unknown) {
    throw {
      status: 0,
      message:
        error instanceof TypeError
          ? error.message
          : 'Error de red al conectar con la API',
      code: 'NETWORK_ERROR',
    } satisfies ApiError;
  }

  // --- Respuesta HTTP no exitosa ---
  if (!response.ok) {
    let bodyMessage: string | undefined;
    try {
      const body = await response.json() as Record<string, unknown>;
      if (typeof body.message === 'string') bodyMessage = body.message;
    } catch {
      // El cuerpo no es JSON o está vacío — se usa statusText
    }

    throw {
      status: response.status,
      message: bodyMessage || response.statusText || 'Error en la solicitud',
      code: 'HTTP_ERROR',
    } satisfies ApiError;
  }

  // --- Respuesta exitosa — parsear JSON ---
  try {
    return (await response.json()) as T;
  } catch (error: unknown) {
    if (isApiError(error)) throw error;
    throw {
      status: response.status,
      message: 'La respuesta de la API no es JSON válido',
      code: 'INVALID_RESPONSE',
    } satisfies ApiError;
  }
}
