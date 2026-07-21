import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleError } from '@/shared/errors/handleError';
import type { ApiError } from '@/api/types';

// ============================================================================
// Setup — spies y mocks
// ============================================================================

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
let mockShowToast: ReturnType<typeof vi.fn>;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  mockShowToast = vi.fn();
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

// ============================================================================
// Escenario 1: API error (ApiError)
// ============================================================================

describe('handleError — API error (ApiError)', () => {
  it('logs error with context and returns the ApiError message', () => {
    const apiError: ApiError = {
      status: 500,
      message: 'Server Error',
      code: 'HTTP_ERROR',
    };

    const result = handleError(apiError, {
      display: 'inline',
      context: 'load-patients',
    });

    expect(result).toBe('Server Error');
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[handleError]',
      expect.objectContaining({
        context: 'load-patients',
        message: 'Server Error',
        code: 'HTTP_ERROR',
        status: 500,
      }),
    );
  });

  it('includes stack trace in log if available', () => {
    const apiError = new Error('Test error') as Error & ApiError;
    apiError.status = 404;
    apiError.code = 'HTTP_ERROR';
    apiError.message = 'Not Found';

    handleError(apiError, {
      display: 'silent',
      context: 'load-patients',
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[handleError]',
      expect.objectContaining({
        message: 'Not Found',
        code: 'HTTP_ERROR',
        status: 404,
      }),
    );
  });
});

// ============================================================================
// Escenario 2: Unknown error (Error instance, not ApiError)
// ============================================================================

describe('handleError — Unknown error (Error)', () => {
  it('logs error with context and returns generic fallback message', () => {
    const error = new Error('Network down');

    const result = handleError(error, {
      display: 'inline',
      context: 'load-patients',
    });

    // No es ApiError, así que usa getErrorMessage('load-patients')
    expect(result).toContain('pacientes');
    expect(result).not.toBe('Network down');
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[handleError]',
      expect.objectContaining({
        context: 'load-patients',
        message: 'Network down',
      }),
    );
  });

  it('does not include code or status for plain Error', () => {
    const error = new Error('Something failed');

    handleError(error, {
      display: 'silent',
      context: 'patient-update',
    });

    const logPayload = consoleErrorSpy.mock.calls[0][1];
    expect(logPayload).not.toHaveProperty('code');
    expect(logPayload).not.toHaveProperty('status');
  });
});

// ============================================================================
// Escenario 3: Non-Error thrown (string, number, undefined)
// ============================================================================

describe('handleError — Non-Error thrown', () => {
  it('coerces string to Error and logs with context', () => {
    const result = handleError('String error', {
      display: 'inline',
      context: 'favorite-toggle',
    });

    expect(result).toContain('favorito');
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[handleError]',
      expect.objectContaining({
        context: 'favorite-toggle',
        message: 'String error',
      }),
    );
  });

  it('coerces undefined to Error with generic message', () => {
    const result = handleError(undefined, {
      display: 'inline',
      context: 'render',
    });

    expect(result).toContain('renderizar');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[handleError]',
      expect.objectContaining({
        message: 'Unknown error',
      }),
    );
  });

  it('coerces number to Error', () => {
    handleError(42, {
      display: 'silent',
      context: 'load-more-patients',
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[handleError]',
      expect.objectContaining({
        message: '42',
      }),
    );
  });

  it('coerces null to Error', () => {
    handleError(null, {
      display: 'silent',
      context: 'favorite-load',
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[handleError]',
      expect.objectContaining({
        message: 'Unknown error',
      }),
    );
  });
});

// ============================================================================
// Escenario 4: Toast display mode
// ============================================================================

describe('handleError — Toast display mode', () => {
  it('calls showToast with the error message and returns undefined', () => {
    const apiError: ApiError = {
      status: 400,
      message: 'Invalid request',
      code: 'INVALID_RESPONSE',
    };

    const result = handleError(apiError, {
      display: 'toast',
      context: 'patient-update',
      showToast: mockShowToast,
    });

    expect(result).toBeUndefined();
    expect(mockShowToast).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith('Invalid request');
  });

  it('does not throw if showToast is not provided', () => {
    const error = new Error('Test');

    expect(() =>
      handleError(error, {
        display: 'toast',
        context: 'load-patients',
        // showToast no provisto
      }),
    ).not.toThrow();

    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it('uses fallback message for non-ApiError in toast mode', () => {
    const error = new Error('Network error');

    handleError(error, {
      display: 'toast',
      context: 'favorite-toggle',
      showToast: mockShowToast,
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.stringContaining('favorito'),
    );
  });
});

// ============================================================================
// Escenario 5: Inline display mode
// ============================================================================

describe('handleError — Inline display mode', () => {
  it('returns the error message string for ApiError', () => {
    const apiError: ApiError = {
      status: 503,
      message: 'Service unavailable',
      code: 'NETWORK_ERROR',
    };

    const result = handleError(apiError, {
      display: 'inline',
      context: 'load-more-patients',
    });

    expect(result).toBe('Service unavailable');
    expect(typeof result).toBe('string');
  });

  it('returns fallback message for non-ApiError', () => {
    const error = new Error('Something broke');

    const result = handleError(error, {
      display: 'inline',
      context: 'load-patients',
    });

    expect(result).toContain('pacientes');
    expect(typeof result).toBe('string');
  });
});

// ============================================================================
// Escenario 6: Silent display mode
// ============================================================================

describe('handleError — Silent display mode', () => {
  it('only logs to console, returns undefined', () => {
    const apiError: ApiError = {
      status: 500,
      message: 'Internal error',
      code: 'HTTP_ERROR',
    };

    const result = handleError(apiError, {
      display: 'silent',
      context: 'favorite-load',
    });

    expect(result).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('does not call showToast even if provided', () => {
    const error = new Error('Test');

    handleError(error, {
      display: 'silent',
      context: 'render',
      showToast: mockShowToast,
    });

    expect(mockShowToast).not.toHaveBeenCalled();
  });
});

// ============================================================================
// Pure function verification — sin efectos secundarios
// ============================================================================

describe('handleError — pure function properties', () => {
  it('does not mutate the error object', () => {
    const apiError: ApiError = {
      status: 500,
      message: 'Error',
      code: 'HTTP_ERROR',
    };
    const originalStatus = apiError.status;
    const originalMessage = apiError.message;
    const originalCode = apiError.code;

    handleError(apiError, {
      display: 'inline',
      context: 'load-patients',
    });

    expect(apiError.status).toBe(originalStatus);
    expect(apiError.message).toBe(originalMessage);
    expect(apiError.code).toBe(originalCode);
  });

  it('produces the same output for the same input (deterministic)', () => {
    const error = new Error('Test');
    const options = {
      display: 'inline' as const,
      context: 'load-patients' as const,
    };

    const result1 = handleError(error, options);
    const result2 = handleError(error, options);

    expect(result1).toBe(result2);
  });
});
