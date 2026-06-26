import type { ApiError } from './types';
import { isApiError } from './types';

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';

export async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw {
        status: response.status,
        message: response.statusText || 'Request failed',
        code: 'HTTP_ERROR',
      } satisfies ApiError;
    }

    return response.json() as Promise<T>;
  } catch (error: unknown) {
    if (isApiError(error)) {
      throw error;
    }

    throw {
      status: 0,
      message: error instanceof TypeError ? error.message : 'Unknown error',
      code: 'NETWORK_ERROR',
    } satisfies ApiError;
  }
}
