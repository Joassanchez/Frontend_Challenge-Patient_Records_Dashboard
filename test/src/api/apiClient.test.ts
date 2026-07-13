import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request } from '@/api/apiClient';
import { isApiError } from '@/api/types';
import type { ApiError } from '@/api/types';

// Ensure VITE_API_BASE_URL is set for tests
beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');
  vi.restoreAllMocks();
});

// ============================================================================
// URL construction
// ============================================================================

describe('URL construction', () => {
  it('joins base with trailing slash and endpoint without leading slash', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, json: () => Promise.resolve({}),
    });
    await request('/users');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/users',
      undefined,
    );
  });

  it('handles base without trailing slash', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, json: () => Promise.resolve({}),
    });
    await request('users');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/users',
      undefined,
    );
  });

  it('handles endpoint with leading slash', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, json: () => Promise.resolve({}),
    });
    await request('/v1/users');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/users',
      undefined,
    );
  });
});

// ============================================================================
// Config error
// ============================================================================

describe('CONFIG_ERROR', () => {
  it('throws CONFIG_ERROR when VITE_API_BASE_URL is empty', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    await expect(request('/test')).rejects.toMatchObject({
      status: 0,
      message: expect.stringContaining('VITE_API_BASE_URL'),
      code: 'CONFIG_ERROR',
    });
  });
});

// ============================================================================
// Happy path
// ============================================================================

describe('Happy path', () => {
  it('returns typed JSON response on ok', async () => {
    const mockData = { id: '1', name: 'Test' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockData),
    });

    const result = await request<typeof mockData>('/test');
    expect(result).toEqual(mockData);
  });

  it('passes options through to fetch', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, json: () => Promise.resolve({}),
    });

    await request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x: 1 }),
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

// ============================================================================
// HTTP errors
// ============================================================================

describe('HTTP errors', () => {
  it('throws HTTP_ERROR with statusText when body is not JSON', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.reject(new Error('Not JSON')),
    });

    await expect(request('/missing')).rejects.toMatchObject({
      status: 404,
      message: 'Not Found',
      code: 'HTTP_ERROR',
    });
  });

  it('reads message from JSON body when available', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ message: 'Database timeout' }),
    });

    await expect(request('/error')).rejects.toMatchObject({
      status: 500,
      message: 'Database timeout',
      code: 'HTTP_ERROR',
    });
  });
});

// ============================================================================
// Network errors
// ============================================================================

describe('Network errors', () => {
  it('throws NETWORK_ERROR on fetch rejection', async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(request('/offline')).rejects.toMatchObject({
      status: 0,
      message: 'Failed to fetch',
      code: 'NETWORK_ERROR',
    });
  });
});

// ============================================================================
// Invalid JSON response
// ============================================================================

describe('Invalid JSON response', () => {
  it('throws INVALID_RESPONSE when ok but JSON parse fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    });

    await expect(request('/bad-json')).rejects.toMatchObject({
      status: 200,
      message: expect.stringContaining('JSON'),
      code: 'INVALID_RESPONSE',
    });
  });
});

// ============================================================================
// isApiError
// ============================================================================

describe('isApiError', () => {
  it('returns true for valid ApiError', () => {
    const error: ApiError = {
      status: 404,
      message: 'Not Found',
      code: 'HTTP_ERROR',
    };
    expect(isApiError(error)).toBe(true);
  });

  it('returns false for object without code', () => {
    expect(isApiError({ status: 500, message: 'fail' })).toBe(false);
  });

  it('returns false for object without message', () => {
    expect(isApiError({ status: 404, code: 'HTTP_ERROR' })).toBe(false);
  });

  it('returns false for TypeError', () => {
    expect(isApiError(new TypeError('fail'))).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(isApiError('string')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isApiError(null)).toBe(false);
  });
});
