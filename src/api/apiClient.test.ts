import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request } from './apiClient';
import { isApiError } from './types';
import type { ApiError } from './types';

describe('apiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('request<T>() returns typed JSON response on ok', async () => {
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

  it('request<T>() throws ApiError with status and message on non-ok response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve(null),
    });

    await expect(request('/missing')).rejects.toMatchObject({
      status: 404,
      message: 'Not Found',
      code: 'HTTP_ERROR',
    });
  });

  it('request<T>() passes options through to fetch', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
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

  it('request<T>() throws ApiError with code NETWORK_ERROR on fetch rejection', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(
      new TypeError('Failed to fetch'),
    );

    await expect(request('/offline')).rejects.toMatchObject({
      status: 0,
      message: 'Failed to fetch',
      code: 'NETWORK_ERROR',
    }    );
  });
});

describe('isApiError', () => {
  it('returns true for ApiError with code', () => {
    const error: ApiError = {
      status: 404,
      message: 'Not Found',
      code: 'HTTP_ERROR',
    };

    expect(isApiError(error)).toBe(true);
  });

  it('returns true for ApiError without code (backward compat)', () => {
    const error: ApiError = {
      status: 500,
      message: 'Server Error',
    };

    expect(isApiError(error)).toBe(true);
  });

  it('returns false for plain object without status', () => {
    expect(isApiError({ message: 'no status' })).toBe(false);
  });

  it('returns false for plain object without message', () => {
    expect(isApiError({ status: 404 })).toBe(false);
  });

  it('returns false for TypeError', () => {
    expect(isApiError(new TypeError('fail'))).toBe(false);
  });

  it('returns false for object with non-number status', () => {
    expect(isApiError({ status: '404', message: 'ok' })).toBe(false);
  });


});


