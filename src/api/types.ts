export type ApiErrorCode = 'HTTP_ERROR' | 'NETWORK_ERROR' | 'INVALID_RESPONSE' | 'CONFIG_ERROR';

export interface ApiError {
  status: number;
  message: string;
  code: ApiErrorCode;
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
