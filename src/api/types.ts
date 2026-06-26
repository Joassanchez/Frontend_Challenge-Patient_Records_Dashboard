export interface ApiError {
  status: number;
  message: string;
  code?: 'HTTP_ERROR' | 'NETWORK_ERROR';
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error &&
    typeof (error as Record<string, unknown>).status === 'number' &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}
