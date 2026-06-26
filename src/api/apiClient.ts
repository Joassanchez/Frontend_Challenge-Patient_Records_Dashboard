import type { ApiError } from './types';

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';

export async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      message: response.statusText || 'Request failed',
    };
    throw error;
  }

  return response.json() as Promise<T>;
}
